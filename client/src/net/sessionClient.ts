/**
 * C-04 Netcode Client façade: Colyseus room lifecycle, 30 Hz input send,
 * snapshot apply → prediction/reconcile (local) + interpolation (remote),
 * connection-state FSM, reconnect via sessionStorage token.
 *
 * Uses @colyseus/sdk (0.17 line). Messages travel on channels named by wire
 * `type` with full contract payloads (see @dhaul/protocol codec module doc).
 */

import { Client, type Room } from "@colyseus/sdk";
import {
  protocolVersion,
  type S2C_SeatUpdate,
  type S2C_Welcome,
  type SeatPublic,
  type WorldSnapshot,
} from "@dhaul/protocol";
import { DEFAULT_KINEMATICS } from "./kinematics.js";
import { LocalPredictor } from "./prediction.js";
import { RemoteInterpolator } from "./interpolation.js";
import { KeyboardInputMapper } from "./inputMapper.js";
import { gridFromGeometry, type LevelGeometry } from "./lobbyClient.js";
import {
  clearBundle,
  loadBundle,
  saveBundle,
  type SessionBundle,
} from "./tokenStore.js";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "joining"
  | "playing"
  | "reconnecting"
  | "lost"
  | "closed";

export interface SessionCallbacks {
  onState?(state: ConnectionState, detail?: string): void;
  onSnapshot?(snapshot: WorldSnapshot): void;
  onSeatUpdate?(seats: SeatPublic[]): void;
}

const TICK_MS = 1000 / 30;

export class SessionClient {
  private room?: Room;
  private predictor?: LocalPredictor;
  private readonly interp = new RemoteInterpolator();
  private readonly mapper = new KeyboardInputMapper();
  private sendTimer: ReturnType<typeof setInterval> | undefined;
  private state: ConnectionState = "idle";
  private localSeatId = -1;
  private latest?: WorldSnapshot;

  constructor(
    private readonly geometry: LevelGeometry,
    private readonly callbacks: SessionCallbacks = {},
  ) {
    this.mapper.attach(window);
  }

  get seatId(): number {
    return this.localSeatId;
  }

  get connectionState(): ConnectionState {
    return this.state;
  }

  private setState(state: ConnectionState, detail?: string): void {
    this.state = state;
    this.callbacks.onState?.(state, detail);
  }

  /** Fresh join with credentials from a create/join REST response. */
  async connect(bundle: SessionBundle): Promise<void> {
    saveBundle(bundle);
    await this.doJoin(bundle, false);
  }

  /** Attempt reconnect from a stored bundle (page refresh). Returns false if none. */
  async tryResume(): Promise<boolean> {
    const bundle = loadBundle();
    if (!bundle) return false;
    try {
      await this.doJoin(bundle, true);
      return true;
    } catch {
      clearBundle();
      this.setState("lost", "reconnect failed");
      return false;
    }
  }

  private async doJoin(bundle: SessionBundle, reconnect: boolean): Promise<void> {
    this.setState(reconnect ? "reconnecting" : "connecting");
    const client = new Client(bundle.wsUrl);
    this.setState("joining");
    const room = await client.joinById(bundle.sessionId, {
      protocolVersion,
      sessionId: bundle.sessionId,
      seatToken: bundle.seatToken,
      ...(reconnect ? { reconnectToken: bundle.reconnectToken } : {}),
      clientInfo: bundle.displayName ? { name: bundle.displayName } : {},
    });
    this.room = room;
    this.mapper.resetSeq();

    room.onMessage("welcome", (welcome: S2C_Welcome) => {
      this.localSeatId = welcome.seatId;
      this.predictor = new LocalPredictor(
        gridFromGeometry(this.geometry),
        DEFAULT_KINEMATICS,
        welcome.seatId,
      );
      // Persist rotated reconnect token.
      saveBundle({ ...bundle, seatId: welcome.seatId, reconnectToken: welcome.reconnectToken });
      this.applySnapshot(welcome.snapshot);
      this.setState("playing");
    });
    room.onMessage("snapshot", (msg: { snapshot: WorldSnapshot }) => {
      this.applySnapshot(msg.snapshot);
    });
    room.onMessage("seat_update", (msg: S2C_SeatUpdate) => {
      this.callbacks.onSeatUpdate?.(msg.seats);
    });
    room.onMessage("error", (msg: { code: string; message: string }) => {
      this.setState("lost", `${msg.code}: ${msg.message}`);
    });
    room.onMessage("*", () => undefined);

    room.onLeave((code) => {
      this.stopSendLoop();
      if (code === 1000 /* consented */) {
        this.setState("closed");
      } else {
        // Unexpected drop: try to resume within grace.
        this.setState("reconnecting");
        void this.reconnectWithBackoff();
      }
    });

    this.startSendLoop();
  }

  private async reconnectWithBackoff(): Promise<void> {
    const delays = [500, 1000, 2000, 4000, 8000];
    for (const d of delays) {
      await sleep(d);
      if (this.state === "playing" || this.state === "closed") return;
      if (await this.tryResume()) return;
    }
    clearBundle();
    this.setState("lost", "grace expired");
  }

  private applySnapshot(snapshot: WorldSnapshot): void {
    this.latest = snapshot;
    this.predictor?.reconcile(snapshot);
    this.interp.push(snapshot, performance.now(), this.localSeatId);
    this.callbacks.onSnapshot?.(snapshot);
  }

  private startSendLoop(): void {
    this.stopSendLoop();
    this.sendTimer = setInterval(() => {
      if (!this.room || this.state !== "playing") return;
      const cmd = this.mapper.sample();
      this.room.send("input", { type: "input", seatId: this.localSeatId, command: cmd });
      this.predictor?.predict(cmd);
    }, TICK_MS);
  }

  private stopSendLoop(): void {
    if (this.sendTimer) clearInterval(this.sendTimer);
    this.sendTimer = undefined;
  }

  /** Local predicted transform (for rendering own hauler). */
  localState(): { x: number; y: number; facing: 1 | -1 } | null {
    const s = this.predictor?.state;
    return s ? { x: s.x, y: s.y, facing: s.facing } : null;
  }

  interpolator(): RemoteInterpolator {
    return this.interp;
  }

  latestSnapshot(): WorldSnapshot | undefined {
    return this.latest;
  }

  async leave(): Promise<void> {
    this.stopSendLoop();
    clearBundle();
    await this.room?.leave(true);
    this.setState("closed");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
