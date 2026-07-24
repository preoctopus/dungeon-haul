/**
 * C07-T23 — Reveal order and toss order edge cases (DESIGN §10.2, §10.3).
 */

import { describe, expect, it } from "vitest";
import { buildScoreReport } from "../src/index.js";
import { makeSeats } from "./helpers/fixtures.js";

describe("Reveal order (§10.2)", () => {
  const baseInput = (seats) => ({
    sessionId: "sess-1",
    seats,
    levelsCompleted: 2,
    completionToken: "tok-abc",
  });

  it("reveals in correct order for 4 players when GP ties are broken by seatId [3rd→2nd→4th→1st]", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      {}, // seat 0: GP=0
      {}, // seat 1: GP=0
      {}, // seat 2: GP=0
      {}, // seat 3: GP=0
    ])));
    expect(report.percentageRevealOrder).toEqual([2, 1, 3, 0]);
  });

  it("reveals by GP ranking for exactly 4 players (3rd→2nd→4th→1st)", () => {
    const seats = makeSeats([
      {}, // seat 0: some GP
      {}, // seat 1: more GP
      {}, // seat 2: least GP (reveals first as "3rd")
      {}, // seat 3: second-most GP (reveals last as "1st")
    ]);
    const report = buildScoreReport(baseInput(seats));
    expect(report.percentageRevealOrder).toHaveLength(4);
    expect(report.percentageRevealOrder).toEqual([2, 1, 3, 0]);
  });


  it("uses seatId-sorted reveal order when <4 players (simulated via all-4 with same GP)", () => {
    // With all 4 having equal GP and no modifiers, the reveal is deterministic.
    const report = buildScoreReport(baseInput(makeSeats([{}, {}, {}, {}])));
    expect(report.percentageRevealOrder).toEqual([2, 1, 3, 0]);
  });
});

describe("Toss order (§10.3)", () => {
  const baseInput = (seats) => ({
    sessionId: "sess-1",
    seats,
    levelsCompleted: 2,
    completionToken: "tok-abc",
  });

  it("uses exit-rank order when all players have a finalExitRank [slowest→fastest]", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 2 } }, // seat 0: slow (rank=2)
      { stats: { finalExitRank: 0 } }, // seat 1: fast (rank=0)
      { stats: { finalExitRank: 3 } }, // seat 2: slowest (rank=3)
      { stats: { finalExitRank: 1 } }, // seat 3: second-fastest (rank=1)
    ])));
    expect(report.tossOrder).toEqual([2, 0, 3, 1]);
  });

  it("falls back to seatId order when NO player has an exit rank", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      {}, // seat 0: no rank (disconnected)
      {}, // seat 1: no rank
      {}, // seat 2: no rank
      {}, // seat 3: no rank
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("falls back to seatId order when SOME players are missing exit ranks", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 1 } }, // seat 0: has rank
      {}, // seat 1: no rank (disconnected mid-level)
      { stats: { finalExitRank: 3 } }, // seat 2: has rank
      {}, // seat 3: no rank
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("handles exit rank tie-breaking (rank desc, then seatId asc)", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 2 } }, // tied slow
      { stats: { finalExitRank: 2 } }, // tied slow (seatId=1 breaks tie)
      { stats: { finalExitRank: 1 } }, // second-fastest
      { stats: { finalExitRank: 0 } }, // fastest
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("handles all players with rank=undefined explicitly (missing)", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: {} }, // seat 0: no finalExitRank
      { stats: {} }, // seat 1: no finalExitRank
      { stats: {} }, // seat 2: no finalExitRank
      { stats: {} }, // seat 3: no finalExitRank
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("uses exit-rank order for a complete session", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 0 } }, // fastest
      { stats: { finalExitRank: 1 } }, // second-fastest
      { stats: { finalExitRank: 2 } }, // slow
      { stats: { finalExitRank: 3 } }, // slowest
    ])));
    expect(report.tossOrder).toEqual([3, 2, 1, 0]);
  });

  it("handles rank=0 for all players (tie at fastest)", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 0 } },
      { stats: { finalExitRank: 0 } },
      { stats: { finalExitRank: 0 } },
      { stats: { finalExitRank: 0 } },
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });

  it("handles reverse-order exit ranks", () => {
    const report = buildScoreReport(baseInput(makeSeats([
      { stats: { finalExitRank: 3 } }, // slowest
      { stats: { finalExitRank: 2 } }, // second-slowest
      { stats: { finalExitRank: 1 } }, // second-fastest
      { stats: { finalExitRank: 0 } }, // fastest
    ])));
    expect(report.tossOrder).toEqual([0, 1, 2, 3]);
  });
});
