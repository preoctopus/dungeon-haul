/**
 * C06-T27: end skip / name entry input routing. Movement inputs are ignored
 * once the sim enters any `end_*` sub-phase; only `skipEnd()`/`recordEndName()`
 * (the sim-side handlers for C2S_EndSkip/C2S_NameEntry) drive progression.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { CellType, LevelDefinition } from "@dhaul/levels";
import { DEFAULT_PARALLAX } from "@dhaul/levels";
import { DEFAULT_SIM_CONFIG } from "../../src/sim/config.js";
import { Simulation } from "../../src/sim/simulation.js";
import { cmd, makeSim, resetSeq } from "./helpers.js";

beforeEach(resetSeq);

/** Minimal arena whose exit sits on seat 0's spawn cell (immediate overlap). */
function arenaExitAtSpawn0(): LevelDefinition {
  const w = 10;
  const h = 6;
  const cells: CellType[][] = [];
  for (let y = 0; y < h; y++) {
    const row: CellType[] = [];
    for (let x = 0; x < w; x++) {
      if (y === h - 1 || x === 0 || x === w - 1) row.push("brick");
      else if (y === h - 2 && x === 2) row.push("exit");
      else row.push("empty");
    }
    cells.push(row);
  }
  const bs = 32;
  return {
    id: "test_end_arena",
    displayName: "Test End Arena",
    biome: "dungeon",
    blockSizePx: bs,
    width: w,
    height: h,
    cells,
    nearBg: Array(w).fill(null),
    fore: Array(w).fill(null),
    spawns: [
      { x: 2, y: h - 2 },
      { x: 4, y: h - 2 },
      { x: 6, y: h - 2 },
      { x: 7, y: h - 2 },
    ],
    exit: { x: 2 * bs, y: (h - 2) * bs, width: bs, height: bs },
    treasureSlots: [],
    switchLinks: [],
    parallax: DEFAULT_PARALLAX,
    musicId: "test",
    tilesetKey: "tiles_mvp",
    farBgKey: "bg_dungeon",
    contentHash: "test",
    version: 1,
  };
}

/** Simulation with seat 0 human + successfully exited, cached as eligible. */
function makeEligibleSim(): Simulation {
  const level = arenaExitAtSpawn0();
  const sim = new Simulation(level, DEFAULT_SIM_CONFIG, "instructions");
  sim.bindHuman(0, "h1");
  sim.step();
  sim.loadLevel(level, "end_count");
  sim.buildEndScoreReport("test-session", "tok-1");
  return sim;
}

describe("sim C06-T27: end input routing", () => {
  it("ignores movement inputs in every end_* sub-phase", () => {
    const sim = makeSim();
    sim.loadLevel(sim.level, "end_count");
    const before = sim.seatState(0).body;
    expect(sim.applyInput(0, cmd({ x: 1 }))).toBe(false);
    sim.step();
    const after = sim.seatState(0).body;
    expect(after.x).toBeCloseTo(before.x, 5);
  });

  it("skipEnd walks end_count -> end_shares -> end_spoils -> closed when nobody is eligible", () => {
    const sim = makeSim();
    sim.loadLevel(sim.level, "end_count");
    sim.buildEndScoreReport("test-session", "tok-1");

    expect(sim.skipEnd()).toBe(true);
    expect(sim.phase).toBe("end_shares");
    expect(sim.skipEnd()).toBe(true);
    expect(sim.phase).toBe("end_spoils");
    expect(sim.skipEnd()).toBe(true);
    expect(sim.phase).toBe("closed"); // no human seats -> nobody eligible
    expect(sim.skipEnd()).toBe(false); // closed has nothing left to advance
  });

  it("skipEnd routes end_spoils -> end_entry when a seat is eligible for a high score", () => {
    const sim = makeEligibleSim();
    sim.skipEnd(); // end_count -> end_shares
    sim.skipEnd(); // end_shares -> end_spoils
    expect(sim.skipEnd()).toBe(true);
    expect(sim.phase).toBe("end_entry");
    expect(sim.skipEnd()).toBe(true);
    expect(sim.phase).toBe("closed");
  });

  it("recordEndName only succeeds in end_entry for an eligible, human, single-submit seat", () => {
    const sim = makeEligibleSim();
    sim.skipEnd(); // -> end_shares
    expect(sim.recordEndName(0, "ABC")).toBe(false); // wrong phase
    sim.skipEnd(); // -> end_spoils
    sim.skipEnd(); // -> end_entry (seat 0 eligible)

    expect(sim.recordEndName(1, "XYZ")).toBe(false); // not eligible / not human
    expect(sim.recordEndName(0, "ABC")).toBe(true);
    expect(sim.getEndName(0)).toBe("ABC");
    expect(sim.recordEndName(0, "DEF")).toBe(false); // single-submit
    expect(sim.getEndName(0)).toBe("ABC");
  });

  it("skipEnd returns false outside end_* phases", () => {
    const sim = makeSim();
    expect(sim.phase).toBe("level");
    expect(sim.skipEnd()).toBe(false);
  });
});
