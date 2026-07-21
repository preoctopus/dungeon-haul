/**
 * C-08 read-only world view + config (ai-controller DESIGN §4, §10).
 * AI never holds mutable refs into the sim — only this snapshot.
 */

import type { AxisValue, InputCommand, SessionPhase } from "@dhaul/protocol";

export type Rarity = "common" | "rare" | "unique" | "set";

export interface AiHaulerView {
  seatId: number;
  control: "human" | "ai";
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  grounded: boolean;
  stunned: boolean;
  carryCount: number;
  /** Top-first stack (value used for upgrade decisions). */
  carry: { instanceId: string; defId: string; valueGp: number; rarity: Rarity }[];
  weight: number;
  /** Seat has already exited the level — ignore for flock/load. */
  exited?: boolean;
}

export interface AiFreeTreasure {
  instanceId: string;
  defId: string;
  x: number;
  y: number;
  valueGp: number;
  rarity: Rarity;
}

export interface AiSwitchView {
  switchId: string;
  x: number;
  y: number;
  kind: "regular" | "heavy";
  pressed: boolean;
  requiredMass?: number;
}

export interface AiWorldView {
  tick: number;
  phase: SessionPhase;
  levelId?: string;
  blockSizePx: number;
  haulers: AiHaulerView[];
  freeTreasures: AiFreeTreasure[];
  switches: AiSwitchView[];
  /** Optional exit center for AI-only rooms. */
  exitX?: number;
  exitY?: number;
}

/** Tunables (DESIGN §10) — keep out of decision branches as magic numbers. */
export interface AiConfig {
  pickupRadius: number;
  switchSeekRadius: number;
  toleranceFraction: number;
  singleHumanComfort: number;
  stuckTicks: number;
  aiOnlyDefaultMaxLoad: number;
  /** Prefer drop chord over throw when upgrading at cap. */
  upgradeUsesDrop: boolean;
}

export const DEFAULT_AI_CONFIG: AiConfig = {
  pickupRadius: 48, // ~1.5 blocks @ 32px
  switchSeekRadius: 320, // 10 blocks
  toleranceFraction: 0.25,
  singleHumanComfort: 128, // 4 blocks
  stuckTicks: 45,
  aiOnlyDefaultMaxLoad: 3,
  upgradeUsesDrop: true,
};

/** Minimal RNG surface (same contract as rules; avoid a hard dep). */
export interface AiRng {
  next(): number;
}

export type { AxisValue, InputCommand };
