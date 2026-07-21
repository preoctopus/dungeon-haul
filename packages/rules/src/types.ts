/**
 * C-07 Rules Engine core types (C07-T02).
 * Source of truth: docs/components/rules-engine/DESIGN.md §5 and
 * docs/interfaces/share-modifier-api.md.
 *
 * Type-only module: no runtime logic, no I/O.
 */

// ---------------------------------------------------------------------------
// §5.1 Identifiers & enums
// ---------------------------------------------------------------------------

export type CharacterId = "gnome" | "sprite" | "halfling" | "dwarf";

export type Rarity = "common" | "rare" | "unique" | "set";

export type LootTableId =
  | "world"
  | "wooden_chest"
  | "silver_chest"
  | "gold_chest"
  | "magic_chest";

export type ModifierKind = "reward" | "penalty";

export type Uniqueness = "unique" | "common";

export type SeatId = 0 | 1 | 2 | 3;

// ---------------------------------------------------------------------------
// §5.2 Treasure
// ---------------------------------------------------------------------------

export interface TreasureDef {
  /** Stable slug, e.g. "stone_icon". */
  id: string;
  /** Display name, e.g. "Stone Icon". */
  name: string;
  rarity: Rarity;
  /** Integer GP. */
  baseValueGp: number;
  /** If piece of a set. */
  setId?: string;
  /** Optional order within set. */
  setPieceIndex?: number;
  /** False for coin sacks (no stack height). */
  stackableVisual: boolean;
  /** True for Unique rarity (and set pieces as non-duplicate). */
  unique: boolean;
  /** Wooden/silver/gold/magic chest shells. */
  isChest: boolean;
  /** Which table this chest opens into. */
  chestTable?: LootTableId;
  flags?: {
    /** Jammy item (DESIGN §7.1 jammy). */
    goatOnPole?: boolean;
  };
}

export interface TreasureInstance {
  instanceId: string;
  defId: string;
  /** After chest open, revealed value. Position/owner are sim concerns. */
  valueOverrideGp?: number;
}

export interface SetDef {
  id: string;
  name: string;
  /** Length 2..5 per design. */
  pieceDefIds: string[];
  /** Design "Value" column (per piece). */
  pieceBaseValueGp: number;
  /** e.g. 10, 200, 2000. */
  setBonusPercent: number;
}

// ---------------------------------------------------------------------------
// §6.7 Inventory valuation results
// ---------------------------------------------------------------------------

export interface SetCompletion {
  setId: string;
  name: string;
  /** setGrossGp - sum(piece bases), or full setGross for display. */
  bonusGp: number;
  setGrossGp: number;
  contributors: { seatId: SeatId; pieces: number; awardedGp: number }[];
}

export interface InventoryValueResult {
  /** Party total after set supersession. */
  totalGp: number;
  perSeatGp: { seatId: SeatId; gp: number }[];
  setCompletions: SetCompletion[];
}

/** Context passed to treasure rolls (DESIGN §6.6). */
export interface RollContext {
  /** Currently recovered unique/set def ids in play. */
  partyHeldDefIds?: readonly string[];
  /** Unique/set defs that cannot roll (live in world or held). */
  excludedDefIds?: readonly string[];
  /** For magic chests: sets that are one piece away from completion. */
  almostCompleteSets?: readonly { setId: string; missingDefId: string }[];
}

/** Per-seat inventory input for computeInventoryValue (owner attribution). */
export interface SeatInventory {
  seatId: SeatId;
  items: readonly TreasureInstance[];
}

// ---------------------------------------------------------------------------
// §5.3 Encumbrance
// ---------------------------------------------------------------------------

export interface EncumbranceConfig {
  /** Design: 3. */
  freeItems: number;
  /** Playtest-tunable; default placeholder 0.12. */
  speedPenaltyPerExtra: number;
  /** Default placeholder 0.12. */
  jumpPenaltyPerExtra: number;
  /** 0 allows Greed Overwhelming. */
  minSpeedMultiplier: number;
  minJumpMultiplier: number;
  /** Optional weight-based term (0 = count-only MVP). */
  weightSpeedFactor?: number;
}

export interface EncumbranceResult {
  freeItems: number;
  /** max(0, carryCount - freeItems). */
  extraItems: number;
  /** Clamped [min, 1]. */
  speedMultiplier: number;
  jumpMultiplier: number;
  /** speedMultiplier === 0. */
  isSpeedZero: boolean;
}

// ---------------------------------------------------------------------------
// §5.4 Stats & score context
// ---------------------------------------------------------------------------

export interface PlayerStats {
  // Exit order (session aggregate)
  /** Levels exited first. */
  exitsFirstCount: number;
  exitsLastCount: number;
  /** True iff first on EVERY completed level (Leader of the Pack). */
  alwaysFirstExit: boolean;
  /** True iff last on EVERY completed stage (Slowpoke). */
  alwaysLastExit: boolean;

  // Treasure economy
  /** Optional pre-agg; rules prefers inventory recompute. */
  treasureRecoveredValueGp: number;
  treasureLostCount: number;
  /** Final recovered item count (or session haul count). */
  itemsHauledCount: number;
  /** Pieces this seat holds in sets that party completed. */
  setPiecesInCompletedSets: number;
  /** Remedial Archaeology. */
  lostSetItemDuringEscape: boolean;

  // Motion
  airTimeTicks: number;
  groundTimeTicks: number;

  // Combat / traps
  trapsHit: number;
  /** Trip/push hits on other players. */
  hitsDealt: number;
  hitsTaken: number;
  /** Distinct seats this player hit (Disciplinarian). */
  playersHitSeatIds: SeatId[];
  stunnedOrHurtCount: number;

  // Control / AI
  humanControlTicks: number;
  aiControlTicks: number;
  /** Human↔AI transitions. */
  controlSwaps: number;
  /** Antisocial: sole human entire session. */
  onlyHumanForWholeGame: boolean;

  // Inventory shape at end
  /** Items when leaving Level 0 Hoard. */
  hoardExitItemCount: number;
  /** Items at dungeon exit. */
  finalItemCount: number;
  /** Gambler (final haul is only chest-origin items). */
  onlyChestsRecovered: boolean;
  /** Undiscerning. */
  onlyCommonRecovered: boolean;
  /** Greed Overwhelming ever true. */
  speedZeroFromWeight: boolean;
  /** Jammy. */
  goatOnPole: boolean;
  /** Success! — completed exit (not stuck/quit mid-run). */
  successfullyExited: boolean;

  /** Exit rank on the final level: 0 = first out … 3 = last out (§10.3). */
  finalExitRank?: number;
}

export interface ScoreSeat {
  seatId: SeatId;
  character: CharacterId;
  /** Final control affinity for high-score eligibility. */
  human: boolean;
  stats: PlayerStats;
  finalInventory: TreasureInstance[];
  /** Mirrors stats.hoardExitItemCount for convenience. */
  hoardExitInventoryCount: number;
}

export interface RankingBuckets {
  mostTreasureValue: SeatId[];
  mostTrapsHit: SeatId[];
  mostHitsDealt: SeatId[];
  mostHitsTaken: SeatId[];
  mostTreasureLost: SeatId[];
  mostAirTime: SeatId[];
  leastAirTime: SeatId[];
  alwaysFirstExit: SeatId[];
  alwaysLastExit: SeatId[];
}

export interface ScoreContext {
  /** Length 4. */
  seats: ScoreSeat[];
  /** 0..7 design path. */
  levelsCompleted: number;
  /** Precomputed or filled by buildRankings. */
  ranking: RankingBuckets;
  /** For Antisocial. */
  sessionHadExactlyOneHuman: boolean;
}

// ---------------------------------------------------------------------------
// §5.5 Modifier results & payout
// ---------------------------------------------------------------------------

export interface ShareModifierDef {
  id: string;
  title: string;
  kind: ModifierKind;
  uniqueness: Uniqueness;
  /** Fixed delta, or variable (per item / per completed-set piece). */
  deltaMode: "fixed" | "per_item" | "per_set_piece";
  /** Base; for per_* multiplied by count. */
  deltaShares: number;
}

export interface AppliedModifier {
  id: string;
  title: string;
  kind: ModifierKind;
  uniqueness: Uniqueness;
  /** Signed int; already scaled for haul/collector. */
  deltaShares: number;
}

export interface PlayerModifierResult {
  seatId: SeatId;
  modifiers: AppliedModifier[];
  /** Sum of deltaShares (may be ≤ 0). */
  rawShares: number;
  /** max(1, rawShares). */
  shares: number;
}

export interface TakeBreakdown {
  totalTreasureGp: number;
  totalShares: number;
  players: {
    seatId: SeatId;
    shares: number;
    /** (shares / totalShares) * 100 — display float ok. */
    sharePercent: number;
    /** Integer GP after remainder policy. */
    takeGp: number;
  }[];
}

// ---------------------------------------------------------------------------
// §5.5 / §10 ScoreReport (rules-side; protocol mirrors a superset for wire)
// ---------------------------------------------------------------------------

export interface ScoreReportPlayer {
  seatId: SeatId;
  character: CharacterId;
  human: boolean;
  /** Display-sorted (DESIGN §9). */
  modifiers: AppliedModifier[];
  shares: number;
  sharePercent: number;
  takeGp: number;
  inventoryValueGp: number;
  /** human && successfullyExited. */
  eligibleForHighScore: boolean;
}

export interface ScoreReport {
  rulesetVersion: string;
  sessionId: string;
  totalTreasureGp: number;
  players: ScoreReportPlayer[];
  setCompletions: SetCompletion[];
  /** 3rd, 2nd, 4th, 1st by takeGp. */
  percentageRevealOrder: SeatId[];
  /** Slowest→fastest exit (for End Director count phase). */
  tossOrder: SeatId[];
  completionToken: string;
}

/** Input to buildScoreReport (DESIGN §4). */
export interface ScoreReportInput {
  sessionId: string;
  /** 4 seats. */
  seats: ScoreSeat[];
  levelsCompleted: number;
  /** Opaque, minted by lobby/sim — rules does not validate crypto. */
  completionToken: string;
  /** Optional catalog override (tests). */
  setCatalog?: SetDef[];
}
