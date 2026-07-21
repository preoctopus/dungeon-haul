/**
 * @dhaul/rules — pure rules engine public surface (DESIGN §4,
 * share-modifier-api.md). No Phaser, no Colyseus, no I/O.
 */
export { rulesetVersion } from "./version.js";

// --- Catalog introspection ---
export { listTreasureDefs, getTreasureDef } from "./treasure/catalog.js";
export { listSetDefs, getSetDef } from "./treasure/sets.js";
export { listModifierDefs, getModifierDef } from "./modifiers/catalog.js";
export { WORLD_RARITY_WEIGHTS, rarityForRoll } from "./treasure/rarity.js";

// --- Treasure valuation & rolls ---
export { rollTreasureDef } from "./treasure/roll.js";
export { computeInventoryValue } from "./treasure/value.js";

// --- Encumbrance ---
export { computeEncumbrance } from "./encumbrance/compute.js";
export { ENCUMBRANCE_DEFAULT } from "./encumbrance/config.js";

// --- Share modifiers & payout ---
export { buildRankings } from "./modifiers/rankings.js";
export { evaluateModifiers } from "./modifiers/evaluate.js";
export { computeTakes } from "./payout/takes.js";

// --- End-of-run assembly ---
export { buildScoreReport, sortModifiersForDisplay } from "./payout/report.js";

export type { Rng } from "./rng/types.js";
export type {
  AppliedModifier,
  CharacterId,
  EncumbranceConfig,
  EncumbranceResult,
  InventoryValueResult,
  LootTableId,
  ModifierKind,
  PlayerModifierResult,
  PlayerStats,
  RankingBuckets,
  Rarity,
  RollContext,
  ScoreContext,
  ScoreReport,
  ScoreReportInput,
  ScoreReportPlayer,
  ScoreSeat,
  SeatId,
  SeatInventory,
  SetCompletion,
  SetDef,
  ShareModifierDef,
  TakeBreakdown,
  TreasureDef,
  TreasureInstance,
  Uniqueness,
} from "./types.js";
