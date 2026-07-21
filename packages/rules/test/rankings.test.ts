/**
 * C07-T12 — buildRankings (RULE-24..28).
 */
import { describe, expect, it } from "vitest";
import { buildRankings, evaluateModifiers } from "../src/index.js";
import { inst, makeCtx, makeSeats, modifierIds } from "./helpers/fixtures.js";

describe("buildRankings (C07-T12)", () => {
  it("RULE-24: multi-award max treasure value (Breadwinner tie)", () => {
    const seats = makeSeats([
      { inventory: [inst("gemstone")] }, // 500
      { inventory: [inst("gemstone")] }, // 500
      { inventory: [inst("stone_icon")] },
      {},
    ]);
    const ranking = buildRankings(seats);
    expect(ranking.mostTreasureValue).toEqual([0, 1]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).toContain("breadwinner");
    expect(modifierIds(results, 1)).toContain("breadwinner");
    expect(modifierIds(results, 2)).not.toContain("breadwinner");
  });

  it("Breadwinner all-zero GP still multi-awards (NOT zero-suppressed)", () => {
    const seats = makeSeats();
    expect(buildRankings(seats).mostTreasureValue).toEqual([0, 1, 2, 3]);
  });

  it("RULE-25: all trapsHit zero → mostTrapsHit empty (no Klutz)", () => {
    const seats = makeSeats();
    expect(buildRankings(seats).mostTrapsHit).toEqual([]);
    const results = evaluateModifiers(makeCtx(seats));
    for (const seatId of [0, 1, 2, 3] as const) {
      expect(modifierIds(results, seatId)).not.toContain("klutz");
    }
  });

  it("RULE-26: all treasureLostCount zero → no Butterfingers", () => {
    const seats = makeSeats();
    expect(buildRankings(seats).mostTreasureLost).toEqual([]);
    const results = evaluateModifiers(makeCtx(seats));
    for (const seatId of [0, 1, 2, 3] as const) {
      expect(modifierIds(results, seatId)).not.toContain("butterfingers");
    }
  });

  it("zero-suppresses hitsDealt and hitsTaken maxima too", () => {
    const ranking = buildRankings(makeSeats());
    expect(ranking.mostHitsDealt).toEqual([]);
    expect(ranking.mostHitsTaken).toEqual([]);
  });

  it("RULE-27: airtime all equal → every seat is max AND min", () => {
    const seats = makeSeats(); // all 0 air ticks
    const ranking = buildRankings(seats);
    expect(ranking.mostAirTime).toEqual([0, 1, 2, 3]);
    expect(ranking.leastAirTime).toEqual([0, 1, 2, 3]);
    const results = evaluateModifiers(makeCtx(seats));
    for (const seatId of [0, 1, 2, 3] as const) {
      expect(modifierIds(results, seatId)).toContain("airhead");
      expect(modifierIds(results, seatId)).toContain("landshark");
    }
  });

  it("RULE-28: two-way max hitsDealt → both get Big Jerk", () => {
    const seats = makeSeats([
      { stats: { hitsDealt: 4 } },
      { stats: { hitsDealt: 4 } },
      { stats: { hitsDealt: 1 } },
      {},
    ]);
    expect(buildRankings(seats).mostHitsDealt).toEqual([0, 1]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).toContain("big_jerk");
    expect(modifierIds(results, 1)).toContain("big_jerk");
    expect(modifierIds(results, 2)).not.toContain("big_jerk");
  });

  it("fills alwaysFirstExit / alwaysLastExit buckets from stats", () => {
    const seats = makeSeats([
      { stats: { alwaysFirstExit: true } },
      {},
      {},
      { stats: { alwaysLastExit: true } },
    ]);
    const ranking = buildRankings(seats);
    expect(ranking.alwaysFirstExit).toEqual([0]);
    expect(ranking.alwaysLastExit).toEqual([3]);
  });
});
