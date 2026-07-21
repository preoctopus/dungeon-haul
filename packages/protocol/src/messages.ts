/**
 * C2S / S2C wire messages (protocol v0, JSON over WebSocket for MVP).
 * Source of truth: docs/interfaces/netcode-messages.md
 *
 * Wire `type` strings are snake_case v0 choices; the interface doc names
 * message kinds (C2S_Ready etc.) without freezing string values. Payload
 * field names follow the doc exactly.
 */

import type {
  CharacterId,
  ForkOption,
  SeatId,
  SeatPublic,
  SessionPhase,
  WorldSnapshot,
} from "./core.js";
import type { GameEvent } from "./events.js";
import type { InputCommand } from "./input.js";
import type { ScoreReport } from "./score.js";
import type { ProtocolVersion } from "./version.js";

// ---------------------------------------------------------------------------
// Client → Server
// ---------------------------------------------------------------------------

export interface C2S_Join {
  type: "join";
  protocolVersion: ProtocolVersion;
  sessionId: string;
  seatToken: string;
  reconnectToken?: string;
  clientInfo?: { name?: string; build?: string };
}

export interface C2S_Input {
  type: "input";
  seatId: number;
  command: InputCommand;
}

export interface C2S_Ready {
  type: "ready";
  ready: boolean;
}

export interface C2S_ClaimCharacter {
  type: "claim_character";
  character: CharacterId;
}

export interface C2S_Leave {
  type: "leave";
}

export interface C2S_Ping {
  type: "ping";
  clientTime: number;
}

export interface C2S_EndSkip {
  type: "end_skip";
}

export interface C2S_NameEntry {
  type: "name_entry";
  name: string;
}

export type C2SMessage =
  | C2S_Join
  | C2S_Input
  | C2S_Ready
  | C2S_ClaimCharacter
  | C2S_Leave
  | C2S_Ping
  | C2S_EndSkip
  | C2S_NameEntry;

// ---------------------------------------------------------------------------
// Server → Client
// ---------------------------------------------------------------------------

export interface S2C_Welcome {
  type: "welcome";
  protocolVersion: ProtocolVersion;
  sessionId: string;
  seatId: SeatId;
  reconnectToken: string;
  rngSeed: number;
  rulesetVersion: string;
  tickRate: 30;
  phase: SessionPhase;
  snapshot: WorldSnapshot;
}

export type ErrorCode = "PROTOCOL" | "AUTH" | "FULL" | "PHASE" | "INTERNAL";

export interface S2C_Error {
  type: "error";
  code: ErrorCode;
  message: string;
}

export interface S2C_Snapshot {
  type: "snapshot";
  snapshot: WorldSnapshot;
}

export interface S2C_Event {
  type: "event";
  event: GameEvent;
}

export interface S2C_PhaseChange {
  type: "phase_change";
  phase: SessionPhase;
  detail?: unknown;
}

export interface S2C_ScoreReport {
  type: "score_report";
  report: ScoreReport;
}

export interface S2C_Pong {
  type: "pong";
  clientTime: number;
  serverTime: number;
}

export interface S2C_SeatUpdate {
  type: "seat_update";
  seats: SeatPublic[];
}

export interface S2C_ForkState {
  type: "fork_state";
  options: ForkOption[];
  tallies: { A: number; B: number };
  endsAtTick: number;
}

export type S2CMessage =
  | S2C_Welcome
  | S2C_Error
  | S2C_Snapshot
  | S2C_Event
  | S2C_PhaseChange
  | S2C_ScoreReport
  | S2C_Pong
  | S2C_SeatUpdate
  | S2C_ForkState;

// ---------------------------------------------------------------------------
// Trivial type guards (no other runtime logic in this package)
// ---------------------------------------------------------------------------

const C2S_TYPES: ReadonlySet<string> = new Set([
  "join",
  "input",
  "ready",
  "claim_character",
  "leave",
  "ping",
  "end_skip",
  "name_entry",
]);

const S2C_TYPES: ReadonlySet<string> = new Set([
  "welcome",
  "error",
  "snapshot",
  "event",
  "phase_change",
  "score_report",
  "pong",
  "seat_update",
  "fork_state",
]);

function hasStringType(value: unknown): value is { type: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { type?: unknown }).type === "string"
  );
}

/** Shallow guard: checks the `type` discriminant only, not full payload shape. */
export function isC2SMessage(value: unknown): value is C2SMessage {
  return hasStringType(value) && C2S_TYPES.has(value.type);
}

/** Shallow guard: checks the `type` discriminant only, not full payload shape. */
export function isS2CMessage(value: unknown): value is S2CMessage {
  return hasStringType(value) && S2C_TYPES.has(value.type);
}
