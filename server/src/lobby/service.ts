/**
 * C-05 Lobby & Session Service — in-memory session registry + create/join/
 * status behavior (docs/components/lobby-session/DESIGN.md §5–§8,
 * docs/interfaces/lobby-and-scores.md). No DB; process-local maps (MVP).
 *
 * Room spawning is injected (`spawnRoom`) so REST behavior is unit-testable
 * without booting Colyseus. The Colyseus room id doubles as the opaque
 * `sessionId` (contract treats sessionId as opaque; avoids custom-roomId
 * plumbing) — see gameServer.ts.
 */

import type {
  CreateSessionRequest,
  CreateSessionResponse,
  JoinSessionRequest,
  JoinSessionResponse,
  LobbyErrorCode,
  PublicSessionView,
  SeatId,
  SeatStatus,
  SessionPhase,
} from "@dhaul/protocol";
import type {
  ListHighScoresResponse,
  SubmitHighScoreRequest,
  SubmitHighScoreResponse,
} from "@dhaul/protocol";
import { JOIN_CODE_ALPHABET, JOIN_CODE_LENGTH } from "@dhaul/protocol";
import { randomInt } from "node:crypto";
import { hashToken, issueToken, verifyToken } from "../session/tokens.js";
import { HighScoresStore, HighScoreError } from "../highScores/store.js";

export class LobbyError extends Error {
  constructor(
    readonly code: LobbyErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "LobbyError";
  }
}

interface SeatRecord {
  seatId: SeatId;
  occupied: boolean;
  /** Mirrored runtime control for status views; room updates it. */
  control: "human" | "ai" | "empty";
  ready: boolean;
  displayName?: string;
  seatTokenHash?: string;
  reconnectTokenHash?: string;
  connected: boolean;
  disconnectGraceUntil?: number;
}

export interface SessionRecord {
  sessionId: string;
  joinCode: string;
  phase: SessionPhase;
  levelsCompleted: number;
  levelsAfterHoard: number;
  seats: SeatRecord[];
  createdAt: number;
}

export interface LobbyServiceOptions {
  /** Spawn the game room; must return the room id (used as sessionId). */
  spawnRoom: () => Promise<string>;
  /** Public WebSocket endpoint for clients. */
  wsUrl: () => string;
  levelsAfterHoard?: number;
  /** Disconnect grace during which the reconnect token stays valid (ms). */
  reconnectGraceMs?: number;
  now?: () => number;
}

/** Session-level completion record. One per ended session; shared across seats. */
interface CachedCompletion {
  sessionId: string;
  /** All players eligible for high-score submission in this run. */
  eligibleSeats: { seatId: SeatId; character: string; takeGp: number; sharePercent: number }[];
}

const DISPLAY_NAME_MAX = 16;
const NAME_ALLOWED = /^[A-Za-z0-9 _.'-]+$/;

function normalizeName(raw: unknown): string {
  if (raw === undefined) return "Hauler";
  if (typeof raw !== "string") throw new LobbyError("VALIDATION", "displayName must be a string");
  const name = raw.trim();
  if (name.length === 0) return "Hauler";
  if (name.length > DISPLAY_NAME_MAX || !NAME_ALLOWED.test(name)) {
    throw new LobbyError("VALIDATION", "displayName: 1-16 chars, letters/digits/space/limited punctuation");
  }
  return name;
}

export class LobbyService {
  private readonly sessions = new Map<string, SessionRecord>();
  private readonly byJoinCode = new Map<string, string>();
  /** completionToken (raw) → metadata for score-submission validation. */
  private readonly completions = new Map<string, CachedCompletion>();
  private readonly opts: Required<Pick<LobbyServiceOptions, "levelsAfterHoard" | "reconnectGraceMs">> &
    LobbyServiceOptions;

  /** High-score persistence (P4 in-memory mock; P5/C12 swaps in a DB). */
  readonly highScores = new HighScoresStore();

  constructor(options: LobbyServiceOptions) {
    this.opts = {
      levelsAfterHoard: 2,
      reconnectGraceMs: 30_000,
      ...options,
    };
  }

  private now(): number {
    return this.opts.now ? this.opts.now() : Date.now();
  }

  private generateJoinCode(): string {
    for (let attempt = 0; attempt < 100; attempt++) {
      let code = "";
      for (let i = 0; i < JOIN_CODE_LENGTH; i++) {
        code += JOIN_CODE_ALPHABET[randomInt(JOIN_CODE_ALPHABET.length)];
      }
      if (!this.byJoinCode.has(code)) return code;
    }
    throw new LobbyError("INTERNAL", "join code space exhausted");
  }

  async create(body: CreateSessionRequest): Promise<CreateSessionResponse> {
    const displayName = normalizeName(body.displayName);
    const sessionId = await this.opts.spawnRoom();
    const joinCode = this.generateJoinCode();
    const seats: SeatRecord[] = ([0, 1, 2, 3] as const).map((seatId) => ({
      seatId,
      occupied: false,
      control: "empty",
      ready: false,
      connected: false,
    }));
    const session: SessionRecord = {
      sessionId,
      joinCode,
      phase: "level", // P2 slice: rooms boot straight into the box level
      levelsCompleted: 0,
      levelsAfterHoard: this.opts.levelsAfterHoard,
      seats,
      createdAt: this.now(),
    };
    this.sessions.set(sessionId, session);
    this.byJoinCode.set(joinCode, sessionId);

    const { seatToken, reconnectToken } = this.claimSeat(session, 0, displayName);
    return {
      sessionId,
      joinCode,
      wsUrl: this.opts.wsUrl(),
      seats: this.seatStatuses(session),
      hostSeatToken: seatToken,
      reconnectToken,
    };
  }

  join(body: JoinSessionRequest): JoinSessionResponse {
    if (typeof body.joinCode !== "string") {
      throw new LobbyError("VALIDATION", "joinCode required");
    }
    const displayName = normalizeName(body.displayName);
    const code = body.joinCode.trim().toUpperCase();
    const sessionId = this.byJoinCode.get(code);
    const session = sessionId ? this.sessions.get(sessionId) : undefined;
    if (!session) throw new LobbyError("NOT_FOUND", "no session with that code");
    if (session.phase === "closed" || session.phase.startsWith("end_")) {
      throw new LobbyError("CLOSED", "session no longer accepts joiners");
    }
    const seat = session.seats.find((s) => this.seatFree(s));
    if (!seat) throw new LobbyError("FULL", "all four seats are taken");
    const { seatToken, reconnectToken } = this.claimSeat(session, seat.seatId, displayName);
    return {
      sessionId: session.sessionId,
      wsUrl: this.opts.wsUrl(),
      seatId: seat.seatId,
      seatToken,
      reconnectToken,
      seats: this.seatStatuses(session),
      phase: session.phase,
    };
  }

  getPublic(sessionId: string): PublicSessionView {
    const session = this.sessions.get(sessionId);
    if (!session) throw new LobbyError("NOT_FOUND", "unknown session");
    return {
      sessionId: session.sessionId,
      joinCode: session.joinCode,
      phase: session.phase,
      seats: this.seatStatuses(session),
      levelsCompleted: session.levelsCompleted,
      levelsAfterHoard: session.levelsAfterHoard,
    };
  }

  private seatFree(seat: SeatRecord): boolean {
    if (!seat.occupied) return true;
    // Human never connected or disconnected past grace → seat reclaimable.
    if (seat.connected) return false;
    return seat.disconnectGraceUntil !== undefined && this.now() > seat.disconnectGraceUntil;
  }

  private claimSeat(
    session: SessionRecord,
    seatId: SeatId,
    displayName: string,
  ): { seatToken: string; reconnectToken: string } {
    const seat = session.seats[seatId];
    if (!seat) throw new LobbyError("INTERNAL", "bad seat");
    const seatToken = issueToken();
    const reconnectToken = issueToken();
    seat.occupied = true;
    seat.displayName = displayName;
    seat.seatTokenHash = hashToken(seatToken);
    seat.reconnectTokenHash = hashToken(reconnectToken);
    seat.connected = false;
    delete seat.disconnectGraceUntil;
    return { seatToken, reconnectToken };
  }

  seatStatuses(session: SessionRecord): SeatStatus[] {
    return session.seats.map((seat) => {
      const status: SeatStatus = {
        seatId: seat.seatId,
        occupied: seat.occupied,
        control: seat.control,
        ready: seat.ready,
      };
      if (seat.displayName !== undefined) status.displayName = seat.displayName;
      return status;
    });
  }

  // -------------------------------------------------------------------
  // Room-facing API (token verification + runtime mirroring)
  // -------------------------------------------------------------------

  getSession(sessionId: string): SessionRecord | undefined {
    return this.sessions.get(sessionId);
  }

  /** Verify a seat token; returns the bound seatId or null. */
  verifySeatToken(sessionId: string, seatToken: string): SeatId | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;
    for (const seat of session.seats) {
      if (seat.seatTokenHash && verifyToken(seatToken, seat.seatTokenHash)) {
        return seat.seatId;
      }
    }
    return null;
  }

  /** Reconnect token valid only for its seat and within the grace window. */
  verifyReconnectToken(sessionId: string, seatId: SeatId, token: string): boolean {
    const seat = this.sessions.get(sessionId)?.seats[seatId];
    if (!seat?.reconnectTokenHash) return false;
    if (!verifyToken(token, seat.reconnectTokenHash)) return false;
    if (seat.connected) return true; // rejoin race; token still bound
    if (seat.disconnectGraceUntil === undefined) return true; // never connected yet
    return this.now() <= seat.disconnectGraceUntil;
  }

  /**
   * Issue a fresh reconnect token on every WS welcome (contract: client
   * replaces its stored token with Welcome's). Server keeps only the hash.
   */
  rotateReconnectToken(sessionId: string, seatId: SeatId): string {
    const seat = this.sessions.get(sessionId)?.seats[seatId];
    if (!seat) throw new LobbyError("INTERNAL", "bad seat");
    const token = issueToken();
    seat.reconnectTokenHash = hashToken(token);
    return token;
  }

  markConnected(sessionId: string, seatId: SeatId): void {
    const seat = this.sessions.get(sessionId)?.seats[seatId];
    if (!seat) return;
    seat.connected = true;
    seat.control = "human";
    delete seat.disconnectGraceUntil;
  }

  markDisconnected(sessionId: string, seatId: SeatId, consented: boolean): void {
    const seat = this.sessions.get(sessionId)?.seats[seatId];
    if (!seat) return;
    seat.connected = false;
    seat.control = "ai";
    if (consented) {
      // Intentional leave: free the seat and invalidate credentials.
      seat.occupied = false;
      seat.control = "empty";
      delete seat.seatTokenHash;
      delete seat.reconnectTokenHash;
      delete seat.displayName;
      delete seat.disconnectGraceUntil;
    } else {
      seat.disconnectGraceUntil = this.now() + this.opts.reconnectGraceMs;
    }
  }

  setSeatControl(sessionId: string, seatId: SeatId, control: "human" | "ai"): void {
    const seat = this.sessions.get(sessionId)?.seats[seatId];
    if (seat) seat.control = control;
  }

  markClosed(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) session.phase = "closed";
  }

  get sessionCount(): number {
    return this.sessions.size;
  }

  // -------------------------------------------------------------------
  // High scores (C01-T06, C12-T09/T16)
  // -------------------------------------------------------------------

  /** Register a completion token from an ended session. */
  registerCompletion(
    sessionId: string,
    eligibleSeats: { seatId: SeatId; character: string; takeGp: number; sharePercent: number }[],
    completionToken: string,
  ): void {
    this.completions.set(completionToken, { sessionId, eligibleSeats });
    // Seed the store so duplicate-submission / "New!" tracking works.
    for (const seat of eligibleSeats) {
      this.highScores.registerCompletion(
        sessionId,
        seat.seatId,
        seat.character,
        seat.takeGp,
        seat.sharePercent,
        completionToken,
      );
    }
  }

  listHighScores(limit = 25): ListHighScoresResponse {
    return this.highScores.list(limit);
  }

  submitHighScore(req: SubmitHighScoreRequest): SubmitHighScoreResponse {
    // 1. Validate the completion token is known.
    const cached = this.completions.get(req.completionToken);
    if (!cached) {
      throw new HighScoreError("UNAUTHORIZED", "unknown or expired completion token");
    }

    // 2. Validate seatId belongs to an eligible player in that session.
    const match = cached.eligibleSeats.find((e) => e.seatId === req.seatId);
    if (!match) {
      throw new HighScoreError("UNAUTHORIZED", `seat ${req.seatId} not eligible`);
    }

    // 3. Delegate to the store (name validation, duplicate prevention).
    return this.highScores.submit({ ...req });
  }
}
