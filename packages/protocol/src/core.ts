/**
 * Core shared identifiers and public entity views.
 * Source of truth: docs/interfaces/netcode-messages.md and
 * docs/components/presentation/DESIGN.md §5 (AnimState),
 * docs/interfaces/lobby-and-scores.md (SeatStatus/SeatPublic).
 */

export type SeatId = 0 | 1 | 2 | 3;

export type CharacterId = "gnome" | "sprite" | "halfling" | "dwarf";

export type ControlKind = "human" | "ai";

export type AnimState =
  | "idle"
  | "run"
  | "jump"
  | "duck"
  | "throw"
  | "drop"
  | "push_trip"
  | "hurt"
  | "stunned"
  | "falling";

export type SessionPhase =
  | "lobby"
  | "instructions"
  | "level"
  | "fork"
  | "end_count"
  | "end_shares"
  | "end_spoils"
  | "end_entry"
  | "closed";

/** A carried treasure reference (first element of a carry stack = top). */
export interface CarriedTreasureRef {
  instanceId: string;
  defId: string;
}

export interface HaulerPublic {
  seatId: number;
  character: CharacterId;
  control: ControlKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  anim: AnimState;
  carry: CarriedTreasureRef[];
  stunned: boolean;
  name?: string;
}

/**
 * Protocol v0 stub — exact fields not yet frozen in docs/interfaces/.
 * Minimal render-sufficient view of a loose (world) treasure.
 */
export interface TreasurePublic {
  instanceId: string;
  defId: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

/** Protocol v0 stub — dynamic trap state only (static grid is level data). */
export interface TrapPublic {
  trapId: string;
  kind: string;
  x: number;
  y: number;
  active: boolean;
}

/** Protocol v0 stub — pressure switch / lever state. */
export interface SwitchPublic {
  switchId: string;
  x: number;
  y: number;
  pressed: boolean;
}

/** Seat view broadcast in `S2C_SeatUpdate`; mirrors lobby REST `SeatStatus`. */
export interface SeatPublic {
  seatId: number;
  occupied: boolean;
  control: ControlKind | "empty";
  character?: CharacterId;
  ready: boolean;
  displayName?: string;
}

export interface WorldSnapshot {
  tick: number;
  phase: SessionPhase;
  levelId?: string;
  levelsCompleted: number;
  /** Run length config (Q8); lets UI render "Level k / n". */
  levelsAfterHoard: number;
  lastProcessedInputSeq: { [seatId: number]: number };
  haulers: HaulerPublic[];
  treasures: TreasurePublic[];
  /** Dynamic only; static grid may be level-hash. */
  traps: TrapPublic[];
  switches: SwitchPublic[];
  /** Optional server camera suggestion. */
  cameraHint?: { x: number; y: number; z?: number };
}

/** Fork path option (docs/components/fork-vote/DESIGN.md §7). */
export interface ForkOption {
  optionId: "A" | "B";
  levelId: string;
  biome: string;
  displayName: string;
}
