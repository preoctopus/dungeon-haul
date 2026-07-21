/**
 * C07-T12 — buildRankings (DESIGN §8.1, §8.3).
 *
 * All tied seats appear in a bucket (multi-award, assumption A2).
 * Zero-suppression (A11): mostTrapsHit / mostHitsDealt / mostHitsTaken /
 * mostTreasureLost are empty when the max metric is 0. Breadwinner
 * (mostTreasureValue) and air-time buckets are NOT zero-suppressed.
 */
import type { RankingBuckets, ScoreSeat, SeatId } from "../types.js";
import { computeInventoryValue } from "../treasure/value.js";

function maxSeats(
  seats: readonly ScoreSeat[],
  metric: (s: ScoreSeat) => number,
  suppressZero: boolean,
): SeatId[] {
  if (seats.length === 0) return [];
  const max = Math.max(...seats.map(metric));
  if (suppressZero && max <= 0) return [];
  return seats.filter((s) => metric(s) === max).map((s) => s.seatId);
}

function minSeats(
  seats: readonly ScoreSeat[],
  metric: (s: ScoreSeat) => number,
): SeatId[] {
  if (seats.length === 0) return [];
  const min = Math.min(...seats.map(metric));
  return seats.filter((s) => metric(s) === min).map((s) => s.seatId);
}

export function buildRankings(
  seats: readonly ScoreSeat[],
  perSeatGp?: readonly { seatId: SeatId; gp: number }[],
): RankingBuckets {
  // Breadwinner uses post-set-supersession seat GP (DESIGN §6.7).
  const gpList =
    perSeatGp ??
    computeInventoryValue(
      seats.map((s) => ({ seatId: s.seatId, items: s.finalInventory })),
    ).perSeatGp;
  const gpBySeat = new Map(gpList.map((e) => [e.seatId, e.gp]));
  const gpOf = (s: ScoreSeat) => gpBySeat.get(s.seatId) ?? 0;

  return {
    mostTreasureValue: maxSeats(seats, gpOf, false),
    mostTrapsHit: maxSeats(seats, (s) => s.stats.trapsHit, true),
    mostHitsDealt: maxSeats(seats, (s) => s.stats.hitsDealt, true),
    mostHitsTaken: maxSeats(seats, (s) => s.stats.hitsTaken, true),
    mostTreasureLost: maxSeats(seats, (s) => s.stats.treasureLostCount, true),
    mostAirTime: maxSeats(seats, (s) => s.stats.airTimeTicks, false),
    leastAirTime: minSeats(seats, (s) => s.stats.airTimeTicks),
    alwaysFirstExit: seats
      .filter((s) => s.stats.alwaysFirstExit)
      .map((s) => s.seatId),
    alwaysLastExit: seats
      .filter((s) => s.stats.alwaysLastExit)
      .map((s) => s.seatId),
  };
}
