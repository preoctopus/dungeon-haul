/**
 * C07-T21 — computeTakes (RULE-01..05).
 */
import { describe, expect, it } from "vitest";
import { computeTakes } from "../src/index.js";
import type { PlayerModifierResult, SeatId } from "../src/index.js";

function result(seatId: SeatId, shares: number): PlayerModifierResult {
  return { seatId, modifiers: [], rawShares: shares, shares };
}

function takeOf(breakdown: ReturnType<typeof computeTakes>, seatId: SeatId) {
  const p = breakdown.players.find((x) => x.seatId === seatId);
  if (!p) throw new Error(`no player ${seatId}`);
  return p;
}

describe("computeTakes (C07-T21)", () => {
  it("RULE-02: four equal shares → 25% each, takes partition total", () => {
    const takes = computeTakes(1000, [
      result(0, 5),
      result(1, 5),
      result(2, 5),
      result(3, 5),
    ]);
    expect(takes.totalShares).toBe(20);
    for (const seatId of [0, 1, 2, 3] as const) {
      expect(takeOf(takes, seatId).sharePercent).toBe(25);
      expect(takeOf(takes, seatId).takeGp).toBe(250);
    }
  });

  it("RULE-03: integer floor + remainder to highest shares → lowest seatId", () => {
    // 101 GP, shares 3/3/3/1 → floors 30/30/30/10 = 100, remainder 1.
    const takes = computeTakes(101, [
      result(0, 3),
      result(1, 3),
      result(2, 3),
      result(3, 1),
    ]);
    expect(takeOf(takes, 0).takeGp).toBe(31); // tie on shares+frac → seatId 0
    expect(takeOf(takes, 1).takeGp).toBe(30);
    expect(takeOf(takes, 2).takeGp).toBe(30);
    expect(takeOf(takes, 3).takeGp).toBe(10);
    expect(
      takes.players.reduce((sum, p) => sum + p.takeGp, 0),
    ).toBe(101);
  });

  it("remainder prefers higher shares before fractional part", () => {
    // 103 GP, shares 5/5/3/3 (total 16): floors 32/32/19/19 = 102, rem 1.
    // Seat 2 has the larger fractional part (.3125 vs .1875) but seat 0 has
    // more shares → seat 0 receives the remainder GP.
    const takes = computeTakes(103, [
      result(0, 5),
      result(1, 5),
      result(2, 3),
      result(3, 3),
    ]);
    expect(takeOf(takes, 0).takeGp).toBe(33);
    expect(takeOf(takes, 1).takeGp).toBe(32);
    expect(takeOf(takes, 2).takeGp).toBe(19);
    expect(takeOf(takes, 3).takeGp).toBe(19);
  });

  it("RULE-04: total 0 → all takes 0, percents still sum to 100", () => {
    const takes = computeTakes(0, [
      result(0, 1),
      result(1, 2),
      result(2, 3),
      result(3, 4),
    ]);
    for (const p of takes.players) expect(p.takeGp).toBe(0);
    expect(
      takes.players.reduce((sum, p) => sum + p.sharePercent, 0),
    ).toBeCloseTo(100, 9);
  });

  it("RULE-05: uneven shares 10/5/1/1 over 1000 GP, stable across re-runs", () => {
    const run = () =>
      computeTakes(1000, [
        result(0, 10),
        result(1, 5),
        result(2, 1),
        result(3, 1),
      ]);
    const takes = run();
    // totalShares 17: floors 588/294/58/58 = 998, rem 2 → seats 0 then 1.
    expect(takeOf(takes, 0).takeGp).toBe(589);
    expect(takeOf(takes, 1).takeGp).toBe(295);
    expect(takeOf(takes, 2).takeGp).toBe(58);
    expect(takeOf(takes, 3).takeGp).toBe(58);
    expect(takes.players.reduce((sum, p) => sum + p.takeGp, 0)).toBe(1000);
    expect(run()).toEqual(takes);
  });

  it("property: takes always partition the total (random-ish sweep)", () => {
    for (let total = 0; total < 250; total += 7) {
      for (const shares of [
        [1, 1, 1, 1],
        [7, 3, 2, 1],
        [20, 1, 1, 1],
        [6, 6, 6, 5],
      ] as const) {
        const takes = computeTakes(
          total,
          shares.map((s, i) => result(i as SeatId, s)),
        );
        expect(takes.players.reduce((sum, p) => sum + p.takeGp, 0)).toBe(total);
        for (const p of takes.players) expect(p.takeGp).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("empty results → empty breakdown, no division by zero", () => {
    const takes = computeTakes(100, []);
    expect(takes.players).toEqual([]);
    expect(takes.totalShares).toBe(0);
  });
});
