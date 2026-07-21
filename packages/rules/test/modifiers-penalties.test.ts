/**
 * C07-T17/T18/T19 — Penalty predicates (RULE-40..51) + §7.5 edge cases.
 */
import { describe, expect, it } from "vitest";
import { evaluateModifiers } from "../src/index.js";
import {
  deltaOf,
  inst,
  makeCtx,
  makeSeats,
  modifierIds,
  resultFor,
} from "./helpers/fixtures.js";

describe("Autopilot (C07-T18, A7)", () => {
  it("RULE-40: fires strictly above 50% AI control; exactly 50% does not", () => {
    const seats = makeSeats([
      { stats: { humanControlTicks: 49, aiControlTicks: 51 } },
      { stats: { humanControlTicks: 50, aiControlTicks: 50 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
    expect(modifierIds(results, 1)).not.toContain("autopilot");
  });

  it("RULE-41: zero total control ticks → does not fire", () => {
    const seats = makeSeats([
      { stats: { humanControlTicks: 0, aiControlTicks: 0 } },
    ]);
    expect(
      modifierIds(evaluateModifiers(makeCtx(seats)), 0),
    ).not.toContain("autopilot");
  });
});

describe("Antisocial (C07-T17)", () => {
  it("RULE-42: sole human gets −7; AI seats never do", () => {
    const seats = makeSeats([
      { human: true },
      { human: false, stats: { aiControlTicks: 100, humanControlTicks: 0 } },
      { human: false, stats: { aiControlTicks: 100, humanControlTicks: 0 } },
      { human: false, stats: { aiControlTicks: 100, humanControlTicks: 0 } },
    ]);
    const ctx = makeCtx(seats);
    expect(ctx.sessionHadExactlyOneHuman).toBe(true);
    const results = evaluateModifiers(ctx);
    expect(deltaOf(results, 0, "antisocial")).toBe(-7);
    for (const seatId of [1, 2, 3] as const) {
      expect(modifierIds(results, seatId)).not.toContain("antisocial");
    }
  });

  it("RULE-43: never fires with two or more humans", () => {
    const seats = makeSeats([
      { human: true },
      { human: true },
      { human: false },
      { human: false },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    for (const seatId of [0, 1, 2, 3] as const) {
      expect(modifierIds(results, seatId)).not.toContain("antisocial");
    }
  });
});

describe("personal penalties (C07-T18)", () => {
  it("RULE-44: Attention Deficit fires at 6 swaps, not 5", () => {
    const seats = makeSeats([
      { stats: { controlSwaps: 6 } },
      { stats: { controlSwaps: 5 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "attention_deficit")).toBe(-2);
    expect(modifierIds(results, 1)).not.toContain("attention_deficit");
  });

  it("RULE-45: Empty Handed fires on exit with 0 items; Haul omitted", () => {
    const seats = makeSeats([
      { stats: { finalItemCount: 0 } },
      { stats: { finalItemCount: 0, successfullyExited: false } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "empty_handed")).toBe(-3);
    expect(modifierIds(results, 0)).not.toContain("haul");
    // Not exited → no Empty Handed.
    expect(modifierIds(results, 1)).not.toContain("empty_handed");
  });

  it("RULE-46: Empty Handed and Undiscerning are mutually exclusive", () => {
    const seats = makeSeats([
      { stats: { finalItemCount: 0, onlyCommonRecovered: true } },
      {
        stats: { finalItemCount: 2, onlyCommonRecovered: true },
        inventory: [inst("stone_icon"), inst("brass_watch")],
      },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).toContain("empty_handed");
    expect(modifierIds(results, 0)).not.toContain("undiscerning");
    expect(deltaOf(results, 1, "undiscerning")).toBe(-5);
    expect(modifierIds(results, 1)).not.toContain("empty_handed");
  });

  it("RULE-47: Greed Overwhelming fires on speedZeroFromWeight", () => {
    const seats = makeSeats([
      { stats: { speedZeroFromWeight: true } },
      { stats: { speedZeroFromWeight: false } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "greed")).toBe(-2);
    expect(modifierIds(results, 1)).not.toContain("greed");
  });

  it("RULE-48: Remedial Archaeology fires on lostSetItemDuringEscape", () => {
    const seats = makeSeats([
      { stats: { lostSetItemDuringEscape: true } },
      {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "remedial")).toBe(-1);
    expect(modifierIds(results, 1)).not.toContain("remedial");
  });

  it("RULE-49: Slowpoke fires on alwaysLastExit (unique penalty)", () => {
    const seats = makeSeats([{ stats: { alwaysLastExit: true } }, {}]);
    const results = evaluateModifiers(makeCtx(seats));
    const slow = resultFor(results, 0).modifiers.find(
      (m) => m.id === "slowpoke",
    );
    expect(slow?.deltaShares).toBe(-1);
    expect(slow?.uniqueness).toBe("unique");
    expect(modifierIds(results, 1)).not.toContain("slowpoke");
  });
});

describe("Unremarkable (C07-T19, evaluated last)", () => {
  /**
   * Seat 0 with no unique-capable award: mid airtime, stunned once (no
   * Flawless), not breadwinner (seat 1 holds treasure), no ranked penalties.
   */
  const unremarkableSeats = () =>
    makeSeats([
      { stats: { stunnedOrHurtCount: 1, airTimeTicks: 1 } },
      {
        stats: { airTimeTicks: 0, finalItemCount: 1, hoardExitItemCount: 1 },
        inventory: [inst("gemstone")],
      },
      { stats: { airTimeTicks: 2, stunnedOrHurtCount: 1 } },
      { stats: { airTimeTicks: 2, stunnedOrHurtCount: 1 } },
    ]);

  it("RULE-50: common-only seat gets Unremarkable; unique reward blocks it", () => {
    const results = evaluateModifiers(makeCtx(unremarkableSeats()));
    // Seat 0 earned only common titles (success, softie, precision).
    const seat0 = resultFor(results, 0);
    expect(seat0.modifiers.every((m) => m.uniqueness === "common")).toBe(true);
    expect(deltaOf(results, 0, "unremarkable")).toBe(-1);
    // Seat 1 has Breadwinner + Landshark (+ My Precious) → no Unremarkable.
    expect(modifierIds(results, 1)).toContain("breadwinner");
    expect(modifierIds(results, 1)).not.toContain("unremarkable");
  });

  it("RULE-51: a unique PENALTY also blocks Unremarkable", () => {
    const seats = unremarkableSeats();
    // Give seat 0 the most hits dealt → Big Jerk (unique penalty).
    seats[0]!.stats.hitsDealt = 5;
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).toContain("big_jerk");
    expect(modifierIds(results, 0)).not.toContain("softie");
    expect(modifierIds(results, 0)).not.toContain("unremarkable");
  });
});

describe("min share clamp (C07-T20)", () => {
  it("RULE-01: heavy penalties still leave shares = max(1, raw)", () => {
    const seats = makeSeats([
      {
        human: true,
        stats: {
          // Big Jerk (−5), Klutz (−3), Butterfingers (−3), Whipping Boy (−3),
          // Antisocial (−7), Autopilot? no — human. Empty Handed (−3),
          // Attention Deficit (−2), Greed (−2), Remedial (−1), stunned.
          hitsDealt: 9,
          trapsHit: 9,
          treasureLostCount: 9,
          hitsTaken: 9,
          finalItemCount: 0,
          controlSwaps: 9,
          speedZeroFromWeight: true,
          lostSetItemDuringEscape: true,
          stunnedOrHurtCount: 3,
          airTimeTicks: 5, // mid — no airhead/landshark
        },
      },
      { human: false, stats: { airTimeTicks: 0, stunnedOrHurtCount: 1 } },
      { human: false, stats: { airTimeTicks: 9, stunnedOrHurtCount: 1 } },
      { human: false, stats: { airTimeTicks: 9, stunnedOrHurtCount: 1 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    const seat0 = resultFor(results, 0);
    expect(seat0.rawShares).toBeLessThan(0);
    expect(seat0.shares).toBe(1);
  });
});
