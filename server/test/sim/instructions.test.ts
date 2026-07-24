/**
 * C06-T22: instructions-phase rules — AI absent, single active human can
 * complete alone, phase carried through snapshot/AI view, loadLevel handoff.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { CellType, LevelDefinition } from "@dhaul/levels";
import { DEFAULT_PARALLAX } from "@dhaul/levels";
import { DEFAULT_SIM_CONFIG } from "../../src/sim/config.js";
import { Simulation } from "../../src/sim/simulation.js";
import { resetSeq } from "./helpers.js";

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
    id: "test_instructions_arena",
    displayName: "Test Instructions Arena",
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

describe("sim C06-T22: instructions phase", () => {
  it("AI does not appear during instructions even with enableAi on", () => {
    const level = arenaExitAtSpawn0();
    const sim = new Simulation(
      level,
      { ...DEFAULT_SIM_CONFIG, enableAi: true },
      "instructions",
    );
    for (let i = 0; i < 10; i++) sim.step(); // let seat settle to the floor first
    const before = sim.seatState(1).body;
    const startX = before.x;
    const startY = before.y;
    for (let i = 0; i < 30; i++) sim.step();
    const after = sim.seatState(1).body;
    expect(after.x).toBeCloseTo(startX, 5);
    expect(after.y).toBeCloseTo(startY, 5);
    expect(sim.buildAiWorldView().phase).toBe("instructions");
    expect(sim.buildSnapshot().phase).toBe("instructions");
  });

  it("one active human exiting alone completes the instructions phase", () => {
    const level = arenaExitAtSpawn0();
    const sim = new Simulation(level, DEFAULT_SIM_CONFIG, "instructions");
    sim.bindHuman(0, "h1");
    sim.step();
    expect(sim.seatState(0).exited).toBe(true);
    expect(sim.isLevelComplete()).toBe(true);
  });

  it("loadLevel transitions phase and resets per-level state", () => {
    const level = arenaExitAtSpawn0();
    const sim = new Simulation(level, DEFAULT_SIM_CONFIG, "instructions");
    sim.bindHuman(0, "h1");
    sim.step();
    expect(sim.isLevelComplete()).toBe(true);

    sim.loadLevel(level, "level");
    expect(sim.phase).toBe("level");
    expect(sim.isLevelComplete()).toBe(false);
    expect(sim.seatState(0).exited).toBe(false);
  });
});
