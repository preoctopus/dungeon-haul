/**
 * C07-T25 — Hand-built ScoreSeat / ScoreContext fixture helpers.
 * No engine imports; only pure rules types + buildRankings.
 */
import type {
  CharacterId,
  PlayerModifierResult,
  PlayerStats,
  ScoreContext,
  ScoreSeat,
  SeatId,
  TreasureInstance,
} from "../../src/types.js";
import { buildRankings } from "../../src/modifiers/rankings.js";

let instCounter = 0;

/** Build a TreasureInstance for a catalog def id. */
export function inst(defId: string, valueOverrideGp?: number): TreasureInstance {
  const item: TreasureInstance = {
    instanceId: `inst_${instCounter++}`,
    defId,
  };
  if (valueOverrideGp !== undefined) item.valueOverrideGp = valueOverrideGp;
  return item;
}

export function makeStats(overrides: Partial<PlayerStats> = {}): PlayerStats {
  return {
    exitsFirstCount: 0,
    exitsLastCount: 0,
    alwaysFirstExit: false,
    alwaysLastExit: false,
    treasureRecoveredValueGp: 0,
    treasureLostCount: 0,
    itemsHauledCount: 0,
    setPiecesInCompletedSets: 0,
    lostSetItemDuringEscape: false,
    airTimeTicks: 0,
    groundTimeTicks: 0,
    trapsHit: 0,
    hitsDealt: 0,
    hitsTaken: 0,
    playersHitSeatIds: [],
    stunnedOrHurtCount: 0,
    humanControlTicks: 100,
    aiControlTicks: 0,
    controlSwaps: 0,
    onlyHumanForWholeGame: false,
    hoardExitItemCount: 0,
    finalItemCount: 0,
    onlyChestsRecovered: false,
    onlyCommonRecovered: false,
    speedZeroFromWeight: false,
    goatOnPole: false,
    successfullyExited: true,
    ...overrides,
  };
}

const CHARACTERS: readonly CharacterId[] = [
  "gnome",
  "sprite",
  "halfling",
  "dwarf",
];

export interface SeatOptions {
  human?: boolean;
  character?: CharacterId;
  inventory?: TreasureInstance[];
  stats?: Partial<PlayerStats>;
}

export function makeSeat(seatId: SeatId, opts: SeatOptions = {}): ScoreSeat {
  const stats = makeStats(opts.stats);
  return {
    seatId,
    character: opts.character ?? CHARACTERS[seatId] ?? "gnome",
    human: opts.human ?? true,
    stats,
    finalInventory: opts.inventory ?? [],
    hoardExitInventoryCount: stats.hoardExitItemCount,
  };
}

/** Four seats with per-seat option overrides. */
export function makeSeats(
  perSeat: readonly [SeatOptions?, SeatOptions?, SeatOptions?, SeatOptions?] = [],
): ScoreSeat[] {
  return ([0, 1, 2, 3] as const).map((seatId) =>
    makeSeat(seatId, perSeat[seatId] ?? {}),
  );
}

export function makeCtx(
  seats: ScoreSeat[],
  overrides: Partial<Omit<ScoreContext, "seats" | "ranking">> = {},
): ScoreContext {
  return {
    seats,
    levelsCompleted: overrides.levelsCompleted ?? 2,
    ranking: buildRankings(seats),
    sessionHadExactlyOneHuman:
      overrides.sessionHadExactlyOneHuman ??
      seats.filter((s) => s.human).length === 1,
  };
}

// --- Result inspection helpers -------------------------------------------

export function resultFor(
  results: readonly PlayerModifierResult[],
  seatId: SeatId,
): PlayerModifierResult {
  const r = results.find((x) => x.seatId === seatId);
  if (!r) throw new Error(`no result for seat ${seatId}`);
  return r;
}

export function modifierIds(
  results: readonly PlayerModifierResult[],
  seatId: SeatId,
): string[] {
  return resultFor(results, seatId).modifiers.map((m) => m.id);
}

export function deltaOf(
  results: readonly PlayerModifierResult[],
  seatId: SeatId,
  id: string,
): number | undefined {
  return resultFor(results, seatId).modifiers.find((m) => m.id === id)
    ?.deltaShares;
}
