/**
 * One-shot game events (SFX/VFX/UI triggers).
 * Source of truth: docs/interfaces/netcode-messages.md "GameEvent (examples)".
 * Clients must tolerate lost events by relying on snapshots.
 */

export interface PickupEvent {
  type: "pickup";
  seatId: number;
  instanceId: string;
  defId: string;
}

export interface DropEvent {
  type: "drop";
  seatId: number;
  instanceId: string;
  x: number;
  y: number;
}

export interface ThrowEvent {
  type: "throw";
  seatId: number;
  instanceId: string;
  vx: number;
  vy: number;
}

export interface SpillEvent {
  type: "spill";
  seatId: number;
  items: { instanceId: string; defId: string }[];
}

export interface StunEvent {
  type: "stun";
  seatId: number;
  source: string;
}

export interface TripEvent {
  type: "trip";
  attackerSeatId: number;
  targetSeatId: number;
}

export interface TrapTriggerEvent {
  type: "trap_trigger";
  trapId: string;
  kind: string;
}

export interface LevelExitEvent {
  type: "level_exit";
  seatId: number;
  /** 1-based exit order within the level. */
  order: number;
}

export interface SwitchEvent {
  type: "switch";
  switchId: string;
  pressed: boolean;
}

export interface AiTakeoverEvent {
  type: "ai_takeover";
  seatId: number;
}

export interface HumanTakeoverEvent {
  type: "human_takeover";
  seatId: number;
}

export interface ForkResolvedEvent {
  type: "fork_resolved";
  optionId: "A" | "B";
  levelId: string;
  tallies: { A: number; B: number };
}

export type GameEvent =
  | PickupEvent
  | DropEvent
  | ThrowEvent
  | SpillEvent
  | StunEvent
  | TripEvent
  | TrapTriggerEvent
  | LevelExitEvent
  | SwitchEvent
  | AiTakeoverEvent
  | HumanTakeoverEvent
  | ForkResolvedEvent;
