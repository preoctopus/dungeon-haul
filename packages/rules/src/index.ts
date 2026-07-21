/**
 * @dhaul/rules — pure rules engine public surface (P0 skeleton).
 * Catalog data and evaluation functions arrive in P1 (C07-T04+).
 */
export { rulesetVersion } from "./version.js";
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
  SetCompletion,
  SetDef,
  ShareModifierDef,
  TakeBreakdown,
  TreasureDef,
  TreasureInstance,
  Uniqueness,
} from "./types.js";
