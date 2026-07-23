/**
 * HaulSession — Colyseus room hosting the authoritative movement sim (P2).
 *
 * Transport adaptation (see @dhaul/protocol codec.ts module doc): the
 * C2S_Join handshake travels as Colyseus join options; join rejection uses
 * ServerError with COLYSEUS_ERROR_CODES; every other message is sent on a
 * channel named by its wire `type` with the full contract message object as
 * payload. State sync uses plain JSON snapshot broadcasts each tick (no
 * Colyseus schema) — full WorldSnapshot per contract, 4 haulers is tiny.
 */

import { CloseCode, Room, ServerError, type Client } from "@colyseus/core";
import {
  COLYSEUS_ERROR_CODES,
  isC2SInput,
  isJoinOptions,
  protocolVersion,
  type GameEvent,
  type S2C_Error,
  type S2C_PhaseChange,
  type S2C_Pong,
  type S2C_SeatUpdate,
  type S2C_Snapshot,
  type S2C_Welcome,
  type SeatId,
} from "@dhaul/protocol";
import { getLevel, HOARD_LEVEL_ID, INSTRUCTIONS_LEVEL_ID } from "../content.js";
import type { LobbyService } from "../lobby/service.js";
import { DEFAULT_SIM_CONFIG } from "../sim/config.js";
import { Simulation } from "../sim/simulation.js";

/** Injected process-wide deps (rooms are constructed by Colyseus). */
interface RoomDeps {
  lobby: LobbyService;
}

let deps: RoomDeps | undefined;

export function setHaulSessionDeps(d: RoomDeps): void {
  deps = d;
}

interface ClientMeta {
  seatId: SeatId;
  /** Token bucket for input rate limiting (~tickRate * 2). */
  tokens: number;
  lastRefillMs: number;
}

const TICK_MS = 1000 / DEFAULT_SIM_CONFIG.tickRate;
const INPUT_RATE_LIMIT_PER_SEC = DEFAULT_SIM_CONFIG.tickRate * 2;
const TICK_LAG_LOG_EVERY = 150; // ~5s at 30 Hz

export class HaulSession extends Room {
  private sim!: Simulation;
  private startedAtMs = 0;
  private readonly meta = new Map<string, ClientMeta>();

  private get lobby(): LobbyService {
    if (!deps) throw new Error("HaulSession deps not initialised");
    return deps.lobby;
  }

  override onCreate(): void {
    this.maxClients = 4;
    this.autoDispose = false; // lobby owns lifecycle (created before first WS join)
    this.sim = new Simulation(
      getLevel(INSTRUCTIONS_LEVEL_ID),
      DEFAULT_SIM_CONFIG,
      "instructions",
    );
    this.startedAtMs = Date.now();

    this.onMessage("input", (client, payload: unknown) => this.handleInput(client, payload));
    this.onMessage("ping", (client, payload: unknown) => {
      const clientTime =
        typeof payload === "object" && payload !== null
          ? Number((payload as { clientTime?: unknown }).clientTime ?? 0)
          : 0;
      const pong: S2C_Pong = { type: "pong", clientTime, serverTime: Date.now() };
      client.send("pong", pong);
    });
    this.onMessage("leave", (client) => {
      client.leave(CloseCode.CONSENTED);
    });
    // Forward-compatibility: ignore unknown channels silently.
    this.onMessage("*", () => undefined);

    this.setSimulationInterval(() => this.tick(), TICK_MS);
  }

  /** roomId doubles as the contract sessionId (see lobby service). */
  private get sessionId(): string {
    return this.roomId;
  }

  override onJoin(client: Client, options: unknown): void {
    if (!isJoinOptions(options)) {
      throw new ServerError(COLYSEUS_ERROR_CODES.PROTOCOL, "malformed join options");
    }
    if (options.protocolVersion !== protocolVersion) {
      throw new ServerError(
        COLYSEUS_ERROR_CODES.PROTOCOL,
        `protocol mismatch: server=${protocolVersion} client=${options.protocolVersion}`,
      );
    }
    if (options.sessionId !== this.sessionId) {
      throw new ServerError(COLYSEUS_ERROR_CODES.AUTH, "wrong session");
    }
    const seatId = this.lobby.verifySeatToken(this.sessionId, options.seatToken);
    if (seatId === null) {
      throw new ServerError(COLYSEUS_ERROR_CODES.AUTH, "invalid seat token");
    }
    if (
      options.reconnectToken !== undefined &&
      !this.lobby.verifyReconnectToken(this.sessionId, seatId, options.reconnectToken)
    ) {
      throw new ServerError(COLYSEUS_ERROR_CODES.AUTH, "reconnect grace expired");
    }
    // One live connection per seat: a fresh valid join replaces a stale one.
    for (const [sid, m] of this.meta) {
      if (m.seatId === seatId && sid !== client.sessionId) {
        this.clients.find((c) => c.sessionId === sid)?.leave(CloseCode.CONSENTED);
        this.meta.delete(sid);
      }
    }

    this.meta.set(client.sessionId, {
      seatId,
      tokens: INPUT_RATE_LIMIT_PER_SEC,
      lastRefillMs: Date.now(),
    });
    const session = this.lobby.getSession(this.sessionId);
    const displayName = session?.seats[seatId]?.displayName;
    const events = this.sim.bindHuman(seatId, client.sessionId, displayName);
    this.lobby.markConnected(this.sessionId, seatId);

    const welcome: S2C_Welcome = {
      type: "welcome",
      protocolVersion,
      sessionId: this.sessionId,
      seatId,
      reconnectToken: this.lobby.rotateReconnectToken(this.sessionId, seatId),
      rngSeed: this.sim.config.rngSeed,
      rulesetVersion: this.sim.config.rulesetVersion,
      tickRate: 30,
      phase: this.sim.phase,
      snapshot: this.sim.buildSnapshot(),
    };
    client.send("welcome", welcome);
    this.broadcastEvents(events);
    this.broadcastSeatUpdate();
  }

  override onLeave(client: Client, code?: number): void {
    const consented = code === CloseCode.CONSENTED;
    const m = this.meta.get(client.sessionId);
    this.meta.delete(client.sessionId);
    if (!m) return;
    // Another live connection already owns the seat (reconnect race) → no-op.
    for (const other of this.meta.values()) {
      if (other.seatId === m.seatId) return;
    }
    const events = this.sim.releaseHuman(m.seatId, consented);
    this.lobby.markDisconnected(this.sessionId, m.seatId, consented);
    this.broadcastEvents(events);
    this.broadcastSeatUpdate();
  }

  override onDispose(): void {
    this.lobby.markClosed(this.sessionId);
  }

  private handleInput(client: Client, payload: unknown): void {
    const m = this.meta.get(client.sessionId);
    if (!m) return;
    if (!isC2SInput(payload)) return; // drop malformed silently (untrusted)
    if (payload.seatId !== m.seatId) {
      const err: S2C_Error = {
        type: "error",
        code: "AUTH",
        message: "seatId does not match seat token",
      };
      client.send("error", err);
      return;
    }
    // Token-bucket rate limit (input-commands.md: rate limit > tickRate * 2).
    const now = Date.now();
    m.tokens = Math.min(
      INPUT_RATE_LIMIT_PER_SEC,
      m.tokens + ((now - m.lastRefillMs) / 1000) * INPUT_RATE_LIMIT_PER_SEC,
    );
    m.lastRefillMs = now;
    if (m.tokens < 1) return; // drop excess silently
    m.tokens -= 1;

    this.sim.applyInput(m.seatId, payload.command);
  }

  private tick(): void {
    const { snapshot, events } = this.sim.step();
    const msg: S2C_Snapshot = { type: "snapshot", snapshot };
    this.broadcast("snapshot", msg);
    if (events.length > 0) {
      this.broadcastEvents(events);
      this.broadcastSeatUpdate();
    }

    if (this.sim.phase === "instructions" && this.sim.isLevelComplete()) {
      this.sim.loadLevel(getLevel(HOARD_LEVEL_ID), "level");
      const phaseChange: S2C_PhaseChange = { type: "phase_change", phase: "level" };
      this.broadcast("phase_change", phaseChange);
      this.broadcast("snapshot", { type: "snapshot", snapshot: this.sim.buildSnapshot() });
      this.broadcastSeatUpdate();
    }

    // Tick lag metric (Implementation Plan P2 exit criterion).
    if (snapshot.tick % TICK_LAG_LOG_EVERY === 0) {
      const expectedMs = this.startedAtMs + snapshot.tick * TICK_MS;
      const lagMs = Math.round(Date.now() - expectedMs);
      console.log(
        `[haul_session ${this.sessionId}] tick=${snapshot.tick} lagMs=${lagMs} clients=${this.clients.length}`,
      );
    }
  }

  private broadcastEvents(events: GameEvent[]): void {
    for (const event of events) {
      if (event.type === "ai_takeover" || event.type === "human_takeover") {
        this.lobby.setSeatControl(
          this.sessionId,
          event.seatId as SeatId,
          event.type === "ai_takeover" ? "ai" : "human",
        );
      }
      this.broadcast("event", { type: "event", event });
    }
  }

  private broadcastSeatUpdate(): void {
    const msg: S2C_SeatUpdate = { type: "seat_update", seats: this.sim.seatsPublic() };
    this.broadcast("seat_update", msg);
  }
}
