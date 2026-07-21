/**
 * @dhaul/ai — pure AI hauler controller (C-08).
 * No Phaser, no Colyseus, no I/O. Server stamps seq and applies InputCommand.
 */

export { decide } from "./decide.js";
export type { DecideOptions, DecideResult } from "./decide.js";

export {
  averageHumanPosition,
  axesToward,
  flockTarget,
  isBetterTreasure,
  maxHumanLoad,
  selectSwitchTarget,
  selectTreasureTarget,
  toleranceBand,
} from "./helpers.js";
export type { Vec2 } from "./helpers.js";

export { DEFAULT_AI_CONFIG } from "./types.js";
export type {
  AiConfig,
  AiFreeTreasure,
  AiHaulerView,
  AiRng,
  AiSwitchView,
  AiWorldView,
  Rarity,
} from "./types.js";
