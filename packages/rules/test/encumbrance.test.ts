/**
 * C07-T11 — computeEncumbrance (RULE-18..23).
 */
import { describe, expect, it } from "vitest";
import { ENCUMBRANCE_DEFAULT, computeEncumbrance } from "../src/index.js";

describe("computeEncumbrance (C07-T11)", () => {
  it("RULE-18: 0–3 items are free (multipliers 1)", () => {
    for (const count of [0, 1, 2, 3]) {
      const r = computeEncumbrance(count, 0);
      expect(r.extraItems).toBe(0);
      expect(r.speedMultiplier).toBe(1);
      expect(r.jumpMultiplier).toBe(1);
      expect(r.isSpeedZero).toBe(false);
    }
  });

  it("RULE-19: 4th item applies one penalty step", () => {
    const r = computeEncumbrance(4, 0);
    expect(r.extraItems).toBe(1);
    expect(r.speedMultiplier).toBeCloseTo(0.88, 10);
    expect(r.jumpMultiplier).toBeCloseTo(0.88, 10);
  });

  it("penalties accumulate per extra item", () => {
    const r = computeEncumbrance(7, 0); // 4 extras
    expect(r.extraItems).toBe(4);
    expect(r.speedMultiplier).toBeCloseTo(1 - 4 * 0.12, 10);
  });

  it("RULE-20: speed floors at 0 and sets isSpeedZero (Greed Overwhelming)", () => {
    // 9 extras * 0.12 = 1.08 → clamped to minSpeedMultiplier 0.
    const r = computeEncumbrance(12, 0);
    expect(r.speedMultiplier).toBe(0);
    expect(r.isSpeedZero).toBe(true);
  });

  it("RULE-21: jump clamps at minJumpMultiplier (default 0.25)", () => {
    const r = computeEncumbrance(30, 0);
    expect(r.jumpMultiplier).toBe(ENCUMBRANCE_DEFAULT.minJumpMultiplier);
    expect(r.jumpMultiplier).toBe(0.25);
  });

  it("RULE-22: custom config overrides the curve", () => {
    const r = computeEncumbrance(2, 0, {
      freeItems: 0,
      speedPenaltyPerExtra: 0.5,
      jumpPenaltyPerExtra: 0.25,
      minSpeedMultiplier: 0,
      minJumpMultiplier: 0,
    });
    expect(r.extraItems).toBe(2);
    expect(r.speedMultiplier).toBe(0);
    expect(r.isSpeedZero).toBe(true);
    expect(r.jumpMultiplier).toBeCloseTo(0.5, 10);
  });

  it("RULE-23: carryCount is item count — coin sacks count (A6)", () => {
    // The API is count-based; callers pass ALL carried instances including
    // coin sacks (stackableVisual only affects presentation stack height).
    const withSacks = computeEncumbrance(4, 0); // e.g. 3 icons + 1 coin_sack
    expect(withSacks.extraItems).toBe(1);
    expect(withSacks.speedMultiplier).toBeLessThan(1);
  });

  it("optional weightSpeedFactor multiplies after the item curve", () => {
    const cfg = { ...ENCUMBRANCE_DEFAULT, weightSpeedFactor: 0.1 };
    const r = computeEncumbrance(4, 2, cfg); // 0.88 * (1 - 0.2) = 0.704
    expect(r.speedMultiplier).toBeCloseTo(0.704, 10);
    // Weight ignored when factor absent.
    const noWeight = computeEncumbrance(4, 100);
    expect(noWeight.speedMultiplier).toBeCloseTo(0.88, 10);
  });
});
