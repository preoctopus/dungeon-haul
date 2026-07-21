/**
 * C07-T26 — Golden haul end-to-end (RULE-52..54).
 * These snapshots lock the payout formulas under rulesetVersion. CI failing
 * here means formula drift: either fix the regression or intentionally bump
 * rulesetVersion and update the fixtures.
 */
import { describe, expect, it } from "vitest";
import { buildScoreReport, evaluateModifiers, rulesetVersion } from "../src/index.js";
import { makeCtx } from "./helpers/fixtures.js";
import {
  GOLDEN_A_EXPECTED,
  GOLDEN_B_EXPECTED,
  GOLDEN_C_EXPECTED,
  goldenA,
  goldenB,
  goldenC,
} from "./fixtures/golden.js";

const seatIds = [0, 1, 2, 3] as const;

describe("golden fixtures are versioned against rulesetVersion", () => {
  it("locks 1.0.0 (bump + update fixtures on intentional change)", () => {
    expect(rulesetVersion).toBe("1.0.0");
  });
});

describe("RULE-52 — Golden A: equal haul, equal split", () => {
  const report = buildScoreReport(goldenA());

  it("shares and takes", () => {
    expect(report.totalTreasureGp).toBe(GOLDEN_A_EXPECTED.totalTreasureGp);
    for (const s of seatIds) {
      const p = report.players[s]!;
      expect(p.shares).toBe(GOLDEN_A_EXPECTED.shares[s]);
      expect(p.sharePercent).toBe(GOLDEN_A_EXPECTED.sharePercent[s]);
      expect(p.takeGp).toBe(GOLDEN_A_EXPECTED.takeGp[s]);
    }
    expect(report.players.reduce((sum, p) => sum + p.takeGp, 0)).toBe(380);
  });

  it("rawShares match hand computation", () => {
    const results = evaluateModifiers(makeCtx(goldenA().seats));
    expect(results.map((r) => r.rawShares)).toEqual(
      GOLDEN_A_EXPECTED.rawShares,
    );
  });

  it("orders, eligibility, token", () => {
    expect(report.percentageRevealOrder).toEqual(
      GOLDEN_A_EXPECTED.percentageRevealOrder,
    );
    expect(report.tossOrder).toEqual(GOLDEN_A_EXPECTED.tossOrder);
    expect(report.players.map((p) => p.eligibleForHighScore)).toEqual(
      GOLDEN_A_EXPECTED.eligible,
    );
    expect(report.rulesetVersion).toBe(rulesetVersion);
    expect(report.completionToken).toBe("token-a");
    expect(report.setCompletions).toEqual([]);
  });
});

describe("RULE-53 — Golden B: Vegetables set completion split", () => {
  const report = buildScoreReport(goldenB());

  it("set completion supersedes piece values", () => {
    expect(report.setCompletions).toHaveLength(1);
    const veg = report.setCompletions[0]!;
    expect(veg.setId).toBe("vegetables");
    expect(veg.setGrossGp).toBe(GOLDEN_B_EXPECTED.setGrossGp);
    expect(veg.bonusGp).toBe(GOLDEN_B_EXPECTED.setBonusGp);
    expect(veg.contributors).toEqual(GOLDEN_B_EXPECTED.contributors);
    expect(report.totalTreasureGp).toBe(GOLDEN_B_EXPECTED.totalTreasureGp);
  });

  it("shares, takes, remainder distribution", () => {
    for (const s of seatIds) {
      const p = report.players[s]!;
      expect(p.shares, `seat ${s}`).toBe(GOLDEN_B_EXPECTED.shares[s]);
      expect(p.takeGp, `seat ${s}`).toBe(GOLDEN_B_EXPECTED.takeGp[s]);
    }
    expect(report.players.reduce((sum, p) => sum + p.takeGp, 0)).toBe(4700);
    // Percent spot check: 19/63 ≈ 30.16%.
    expect(report.players[0]!.sharePercent).toBeCloseTo(30.1587, 3);
  });

  it("rawShares match hand computation", () => {
    const results = evaluateModifiers(makeCtx(goldenB().seats));
    expect(results.map((r) => r.rawShares)).toEqual(
      GOLDEN_B_EXPECTED.rawShares,
    );
  });

  it("orders and eligibility", () => {
    expect(report.percentageRevealOrder).toEqual(
      GOLDEN_B_EXPECTED.percentageRevealOrder,
    );
    expect(report.tossOrder).toEqual(GOLDEN_B_EXPECTED.tossOrder);
    expect(report.players.map((p) => p.eligibleForHighScore)).toEqual(
      GOLDEN_B_EXPECTED.eligible,
    );
  });
});

describe("RULE-54 — Golden C: sole human, autopilot AIs, min-share seat", () => {
  const report = buildScoreReport(goldenC());

  it("edge modifiers: antisocial, autopilot, min share", () => {
    const results = evaluateModifiers(
      makeCtx(goldenC().seats, { levelsCompleted: 2 }),
    );
    expect(results.map((r) => r.rawShares)).toEqual(
      GOLDEN_C_EXPECTED.rawShares,
    );
    expect(results.map((r) => r.shares)).toEqual(GOLDEN_C_EXPECTED.shares);
    // Antisocial only on the sole human seat 0.
    expect(results[0]!.modifiers.map((m) => m.id)).toContain("antisocial");
    for (const s of [1, 2, 3] as const) {
      expect(results[s]!.modifiers.map((m) => m.id)).not.toContain(
        "antisocial",
      );
      expect(results[s]!.modifiers.map((m) => m.id)).toContain("autopilot");
    }
  });

  it("takes partition 1505 GP with remainder to highest shares", () => {
    expect(report.totalTreasureGp).toBe(GOLDEN_C_EXPECTED.totalTreasureGp);
    for (const s of seatIds) {
      expect(report.players[s]!.takeGp, `seat ${s}`).toBe(
        GOLDEN_C_EXPECTED.takeGp[s],
      );
    }
    expect(report.players.reduce((sum, p) => sum + p.takeGp, 0)).toBe(1505);
  });

  it("display-sorted modifier lists", () => {
    expect(report.players[0]!.modifiers.map((m) => m.id)).toEqual(
      GOLDEN_C_EXPECTED.seat0DisplayModifiers,
    );
    expect(report.players[3]!.modifiers.map((m) => m.id)).toEqual(
      GOLDEN_C_EXPECTED.seat3DisplayModifiers,
    );
  });

  it("orders and eligibility", () => {
    expect(report.percentageRevealOrder).toEqual(
      GOLDEN_C_EXPECTED.percentageRevealOrder,
    );
    expect(report.tossOrder).toEqual(GOLDEN_C_EXPECTED.tossOrder);
    expect(report.players.map((p) => p.eligibleForHighScore)).toEqual(
      GOLDEN_C_EXPECTED.eligible,
    );
  });
});
