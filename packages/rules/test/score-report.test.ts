/**
 * C07-T22/T23 — buildScoreReport assembly (RULE-55..58).
 */
import { describe, expect, it } from "vitest";
import {
  buildScoreReport,
  rulesetVersion,
  sortModifiersForDisplay,
} from "../src/index.js";
import type { AppliedModifier, ScoreReportInput } from "../src/index.js";
import { inst, makeSeats } from "./helpers/fixtures.js";
import type { SeatOptions } from "./helpers/fixtures.js";

function input(
  perSeat: readonly [SeatOptions?, SeatOptions?, SeatOptions?, SeatOptions?],
  overrides: Partial<ScoreReportInput> = {},
): ScoreReportInput {
  return {
    sessionId: "sess-1",
    seats: makeSeats(perSeat),
    levelsCompleted: 2,
    completionToken: "tok-abc",
    ...overrides,
  };
}

function playerOf(report: ReturnType<typeof buildScoreReport>, seatId: number) {
  const p = report.players.find((x) => x.seatId === seatId);
  if (!p) throw new Error(`no player ${seatId}`);
  return p;
}

describe("modifier display sort (RULE-55, DESIGN §10.1)", () => {
  it("orders unique reward → common reward → common penalty → unique penalty", () => {
    const mods: AppliedModifier[] = [
      { id: "autopilot", title: "Autopilot", kind: "penalty", uniqueness: "common", deltaShares: -5 },
      { id: "big_jerk", title: "Big Jerk", kind: "penalty", uniqueness: "unique", deltaShares: -5 },
      { id: "success", title: "Success!", kind: "reward", uniqueness: "common", deltaShares: 5 },
      { id: "greed", title: "Greed Overwhelming", kind: "penalty", uniqueness: "common", deltaShares: -2 },
      { id: "breadwinner", title: "Breadwinner", kind: "reward", uniqueness: "unique", deltaShares: 5 },
      { id: "haul", title: "Haul", kind: "reward", uniqueness: "common", deltaShares: 3 },
      { id: "leader_pack", title: "Leader of the Pack", kind: "reward", uniqueness: "unique", deltaShares: 10 },
      { id: "slowpoke", title: "Slowpoke", kind: "penalty", uniqueness: "unique", deltaShares: -1 },
    ];
    expect(sortModifiersForDisplay(mods).map((m) => m.id)).toEqual([
      // unique rewards, catalog order
      "leader_pack",
      "breadwinner",
      // common rewards, catalog order
      "haul",
      "success",
      // common penalties, catalog order
      "greed",
      "autopilot",
      // unique penalties, catalog order
      "slowpoke",
      "big_jerk",
    ]);
  });
});

describe("buildScoreReport (C07-T23)", () => {
  it("RULE-56: percentageRevealOrder is 3rd, 2nd, 4th, 1st by takeGp", () => {
    // Distinct takes via distinct hauls (haul delta drives shares).
    const report = buildScoreReport(
      input([
        { stats: { finalItemCount: 9, hoardExitItemCount: 9, airTimeTicks: 1 }, inventory: [inst("crown")] },
        { stats: { finalItemCount: 5, hoardExitItemCount: 5, airTimeTicks: 2 } },
        { stats: { finalItemCount: 2, hoardExitItemCount: 2, airTimeTicks: 3 } },
        { stats: { finalItemCount: 0, airTimeTicks: 4 } },
      ]),
    );
    const byTake = [...report.players].sort((a, b) => b.takeGp - a.takeGp);
    const [first, second, third, fourth] = byTake;
    expect(report.percentageRevealOrder).toEqual([
      third!.seatId,
      second!.seatId,
      fourth!.seatId,
      first!.seatId,
    ]);
  });

  it("RULE-57: tossOrder is slowest → fastest (finalExitRank descending)", () => {
    const report = buildScoreReport(
      input([
        { stats: { finalExitRank: 2 } },
        { stats: { finalExitRank: 0 } },
        { stats: { finalExitRank: 3 } },
        { stats: { finalExitRank: 1 } },
      ]),
    );
    expect(report.tossOrder).toEqual([2, 0, 3, 1]);
  });

  it("tossOrder falls back to seatId order when ranks are missing", () => {
    const report = buildScoreReport(input([{}, {}, {}, {}]));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("RULE-58: eligibleForHighScore only for human AND successfullyExited", () => {
    const report = buildScoreReport(
      input([
        { human: true, stats: { successfullyExited: true } },
        { human: true, stats: { successfullyExited: false } },
        { human: false, stats: { successfullyExited: true } },
        { human: false, stats: { successfullyExited: false } },
      ]),
    );
    expect(report.players.map((p) => p.eligibleForHighScore)).toEqual([
      true,
      false,
      false,
      false,
    ]);
  });

  it("embeds rulesetVersion, sessionId, and passes completionToken through", () => {
    const report = buildScoreReport(input([{}, {}, {}, {}]));
    expect(report.rulesetVersion).toBe(rulesetVersion);
    expect(report.sessionId).toBe("sess-1");
    expect(report.completionToken).toBe("tok-abc");
  });

  it("reports per-seat inventoryValueGp and party totalTreasureGp", () => {
    const report = buildScoreReport(
      input([
        { inventory: [inst("crown")], stats: { finalItemCount: 1, hoardExitItemCount: 1 } },
        { inventory: [inst("stone_icon")], stats: { finalItemCount: 1, hoardExitItemCount: 1 } },
        {},
        {},
      ]),
    );
    expect(playerOf(report, 0).inventoryValueGp).toBe(750);
    expect(playerOf(report, 1).inventoryValueGp).toBe(5);
    expect(report.totalTreasureGp).toBe(755);
    expect(
      report.players.reduce((sum, p) => sum + p.takeGp, 0),
    ).toBe(755);
  });

  it("includes setCompletions from the party inventory", () => {
    const report = buildScoreReport(
      input([
        { inventory: [inst("flame_guitar")], stats: { finalItemCount: 1, hoardExitItemCount: 1 } },
        { inventory: [inst("ice_bass")], stats: { finalItemCount: 1, hoardExitItemCount: 1 } },
        {},
        {},
      ]),
    );
    // Song of Fire and Ice: gross = floor(500 * 2 * 150 / 100) = 1500.
    expect(report.setCompletions).toHaveLength(1);
    expect(report.setCompletions[0]?.setId).toBe("song_of_fire_and_ice");
    expect(report.setCompletions[0]?.setGrossGp).toBe(1500);
    expect(report.totalTreasureGp).toBe(1500);
  });

  it("player modifiers are display-sorted in the report", () => {
    const report = buildScoreReport(
      input([
        {
          human: true,
          stats: {
            alwaysFirstExit: true,
            finalItemCount: 2,
            hoardExitItemCount: 2,
            controlSwaps: 6,
            stunnedOrHurtCount: 1,
          },
          inventory: [inst("crown"), inst("gemstone")],
        },
        { human: false, stats: { stunnedOrHurtCount: 1 } },
        { human: false, stats: { stunnedOrHurtCount: 1 } },
        { human: false, stats: { stunnedOrHurtCount: 1 } },
      ]),
    );
    const buckets = playerOf(report, 0).modifiers.map((m) =>
      m.kind === "reward"
        ? m.uniqueness === "unique"
          ? 0
          : 1
        : m.uniqueness === "common"
          ? 2
          : 3,
    );
    expect(buckets).toEqual([...buckets].sort((a, b) => a - b));
    // Sole human → unique penalty (antisocial) present and last-bucket.
    expect(playerOf(report, 0).modifiers.at(-1)?.id).toBe("antisocial");
  });
});
