/**
 * C07-T18 — Autopilot modifier (RULE-44): -5 shares when AI controlled >50% of ticks.
 * Catalog defines it as a "penalty" with deltaShares = -5.
 */

import { describe, expect, it } from "vitest";
import { evaluateModifiers } from "../src/index.js";
import { deltaOf, makeCtx, makeSeats } from "./helpers/fixtures.js";

describe("autopilot modifier (RULE-44)", () => {
  it("applies -5 shares penalty when AI controlled strictly >50% of total control ticks", () => {
    // human=3, ai=4 → total=7, ai*2=8 > 7 → penalty applied
    const seats = makeSeats([
      { stats: { humanControlTicks: 3, aiControlTicks: 4 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("applies -5 shares penalty when AI controlled exactly (total+1)/2", () => {
    // human=4, ai=5 → total=9, ai*2=10 > 9 → penalty applied
    const seats = makeSeats([
      { stats: { humanControlTicks: 4, aiControlTicks: 5 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("does NOT apply when AI controlled exactly 50% of ticks", () => {
    // human=5, ai=5 → total=10, ai*2=10 NOT > 10 → no penalty (strictly greater)
    const seats = makeSeats([
      { stats: { humanControlTicks: 5, aiControlTicks: 5 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });

  it("does NOT apply when AI controlled <50% of ticks", () => {
    // human=8, ai=2 → total=10, ai*2=4 NOT > 10 → no penalty
    const seats = makeSeats([
      { stats: { humanControlTicks: 8, aiControlTicks: 2 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });

  it("does NOT apply when total control ticks is 0 (edge case)", () => {
    // total=0 → condition fails defensively
    const seats = makeSeats([
      { stats: { humanControlTicks: 0, aiControlTicks: 0 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });

  it("applies -5 shares penalty for a seat that had AI takeover mid-run", () => {
    // Realistic scenario: human played first half, disconnected second half
    const seats = makeSeats([
      { stats: { humanControlTicks: 30, aiControlTicks: 60 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("does NOT apply to a fully-human run (ai=0)", () => {
    // human=100, ai=0 → total=100, ai*2=0 NOT > 100 → no penalty
    const seats = makeSeats([
      { stats: { humanControlTicks: 100, aiControlTicks: 0 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });

  it("only penalizes the seat that had AI control (not others)", () => {
    // Seat 1 had >50% AI; seats 2-4 should not get autopilot delta.
    const seats = makeSeats([
      {}, // seat 0: fully human
      { stats: { humanControlTicks: 1, aiControlTicks: 9 } },
      {}, // seat 2: fully human
      {}, // seat 3: fully human
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
    expect(deltaOf(results, 1, "autopilot")).toBe(-5);
    expect(deltaOf(results, 2, "autopilot")).toBeUndefined();
    expect(deltaOf(results, 3, "autopilot")).toBeUndefined();
  });

  it("applies -5 shares penalty at extreme boundary: ai=999, human=1", () => {
    // total=1000, ai*2=1998 > 1000 → penalty
    const seats = makeSeats([
      { stats: { humanControlTicks: 1, aiControlTicks: 999 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("applies -5 shares penalty at exact boundary: ai=51, human=49", () => {
    // total=100, ai*2=102 > 100 → penalty (just barely)
    const seats = makeSeats([
      { stats: { humanControlTicks: 49, aiControlTicks: 51 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("does NOT apply at exact midpoint: ai=50, human=50", () => {
    // total=100, ai*2=100 NOT > 100 → no penalty (strict inequality)
    const seats = makeSeats([
      { stats: { humanControlTicks: 50, aiControlTicks: 50 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });

  it("applies -5 shares penalty when total control ticks is odd and ai=(total+1)/2", () => {
    // total=3, ai=2 → ai*2=4 > 3 → penalty
    const seats = makeSeats([
      { stats: { humanControlTicks: 1, aiControlTicks: 2 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBe(-5);
  });

  it("does NOT apply when total control ticks is odd and ai=(total-1)/2", () => {
    // total=3, ai=1 → ai*2=2 NOT > 3 → no penalty
    const seats = makeSeats([
      { stats: { humanControlTicks: 2, aiControlTicks: 1 } },
      {}, {}, {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "autopilot")).toBeUndefined();
  });
});
