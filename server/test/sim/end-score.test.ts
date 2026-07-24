/**
 * C06-T26: End scoring invocation. `Simulation.buildEndScoreReport` builds a
 * ScoreContext from seat runtime state and delegates to @dhaul/rules'
 * `buildScoreReport` — this exercises the sim-side wiring, not rules math
 * itself (that's covered in packages/rules).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { makeSim, resetSeq } from "./helpers.js";

beforeEach(resetSeq);

describe("sim C06-T26: end scoring", () => {
  it("reports all 4 seats with min-1-share takes summing to the total", () => {
    const sim = makeSim();
    const report = sim.buildEndScoreReport("test-session", "tok-1");

    expect(report.sessionId).toBe("test-session");
    expect(report.completionToken).toBe("tok-1");
    expect(report.players).toHaveLength(4);
    for (const p of report.players) {
      expect(p.shares).toBeGreaterThanOrEqual(1);
    }
    const takeSum = report.players.reduce((sum, p) => sum + p.takeGp, 0);
    expect(takeSum).toBe(report.totalTreasureGp);
  });

  it("caches the report so re-entry does not re-run scoring", () => {
    const sim = makeSim();
    const first = sim.buildEndScoreReport("test-session", "tok-1");
    const second = sim.buildEndScoreReport("test-session", "tok-2");

    expect(second).toBe(first);
    expect(second.completionToken).toBe("tok-1");
  });
});
