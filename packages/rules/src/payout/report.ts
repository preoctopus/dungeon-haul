/**
 * C07-T22/T23 — buildScoreReport (DESIGN §10).
 * Single end-of-run entry for C-06: value inventories → rankings →
 * modifiers → takes → display-ready ScoreReport.
 */
import type {
  AppliedModifier,
  ScoreContext,
  ScoreReport,
  ScoreReportInput,
  SeatId,
} from "../types.js";
import { computeInventoryValue } from "../treasure/value.js";
import { SET_DEFS } from "../treasure/sets.js";
import { MODIFIER_CATALOG_INDEX } from "../modifiers/catalog.js";
import { buildRankings } from "../modifiers/rankings.js";
import { evaluateModifiers } from "../modifiers/evaluate.js";
import { computeTakes } from "./takes.js";
import { rulesetVersion } from "../version.js";

/**
 * Display sort (§10.1): unique rewards → common rewards → common penalties →
 * unique penalties; catalog definition order within each bucket.
 */
function displayBucket(m: AppliedModifier): number {
  if (m.kind === "reward") return m.uniqueness === "unique" ? 0 : 1;
  return m.uniqueness === "common" ? 2 : 3;
}

export function sortModifiersForDisplay(
  modifiers: readonly AppliedModifier[],
): AppliedModifier[] {
  return [...modifiers].sort(
    (a, b) =>
      displayBucket(a) - displayBucket(b) ||
      (MODIFIER_CATALOG_INDEX.get(a.id) ?? 0) -
        (MODIFIER_CATALOG_INDEX.get(b.id) ?? 0),
  );
}

export function buildScoreReport(input: ScoreReportInput): ScoreReport {
  const { seats } = input;
  const setCatalog = input.setCatalog ?? SET_DEFS;

  // 1. Value inventories (party-wide set supersession).
  const value = computeInventoryValue(
    seats.map((s) => ({ seatId: s.seatId, items: s.finalInventory })),
    setCatalog,
  );
  const gpBySeat = new Map(value.perSeatGp.map((e) => [e.seatId, e.gp]));

  // 2. Rankings from post-set seat GP.
  const ranking = buildRankings(seats, value.perSeatGp);

  // 3. Modifiers.
  const ctx: ScoreContext = {
    seats: [...seats],
    levelsCompleted: input.levelsCompleted,
    ranking,
    sessionHadExactlyOneHuman: seats.filter((s) => s.human).length === 1,
  };
  const results = evaluateModifiers(ctx);

  // 4. Takes.
  const takes = computeTakes(value.totalGp, results);
  const takeBySeat = new Map(takes.players.map((p) => [p.seatId, p]));
  const resultBySeat = new Map(results.map((r) => [r.seatId, r]));

  const players = seats.map((seat) => {
    const take = takeBySeat.get(seat.seatId);
    const result = resultBySeat.get(seat.seatId);
    return {
      seatId: seat.seatId,
      character: seat.character,
      human: seat.human,
      modifiers: sortModifiersForDisplay(result?.modifiers ?? []),
      shares: take?.shares ?? result?.shares ?? 1,
      sharePercent: take?.sharePercent ?? 0,
      takeGp: take?.takeGp ?? 0,
      inventoryValueGp: gpBySeat.get(seat.seatId) ?? 0,
      eligibleForHighScore: seat.human && seat.stats.successfullyExited,
    };
  });

  // 5. Reveal order (§10.2): rank by takeGp desc, shares desc, seatId asc;
  //    reveal 3rd, 2nd, 4th, 1st.
  const places = [...players].sort(
    (a, b) => b.takeGp - a.takeGp || b.shares - a.shares || a.seatId - b.seatId,
  );
  const percentageRevealOrder: SeatId[] =
    places.length === 4
      ? [places[2]!.seatId, places[1]!.seatId, places[3]!.seatId, places[0]!.seatId]
      : places.map((p) => p.seatId);

  // 6. Toss order (§10.3): slowest → fastest by finalExitRank descending;
  //    if any rank is missing, fall back to seatId order.
  const allRanked = seats.every(
    (s) => typeof s.stats.finalExitRank === "number",
  );
  const tossOrder: SeatId[] = allRanked
    ? [...seats]
        .sort(
          (a, b) =>
            (b.stats.finalExitRank ?? 0) - (a.stats.finalExitRank ?? 0) ||
            a.seatId - b.seatId,
        )
        .map((s) => s.seatId)
    : [...seats].sort((a, b) => a.seatId - b.seatId).map((s) => s.seatId);

  return {
    rulesetVersion,
    sessionId: input.sessionId,
    totalTreasureGp: value.totalGp,
    players,
    setCompletions: value.setCompletions,
    percentageRevealOrder,
    tossOrder,
    completionToken: input.completionToken,
  };
}
