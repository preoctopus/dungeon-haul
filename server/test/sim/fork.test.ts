/**
 * C06-T23/T24: Hoard → Fork handoff and post-level Fork/End branch.
 * Exercises the phase machine transitions and freeze-during-fork behavior
 * against the real C-10 `ForkVoteModule`; vote-tallying mechanics themselves
 * are covered by `forkVote.test.ts`.
 */
import { beforeEach, describe, expect, it } from "vitest";
import type { CellType, LevelDefinition } from "@dhaul/levels";
import { DEFAULT_PARALLAX } from "@dhaul/levels";
import { DEFAULT_SIM_CONFIG } from "../../src/sim/config.js";
import { DEFAULT_FORK_CONFIG, type ForkLevelMeta } from "../../src/sim/fork.js";
import { Simulation } from "../../src/sim/simulation.js";
import { resetSeq } from "./helpers.js";

beforeEach(resetSeq);

const levelMeta = (): ForkLevelMeta => ({ biome: "dungeon", displayName: "Test" });

/**
 * Minimal arena whose exit sits on every seat's spawn cell — outside
 * "instructions" phase, level completion requires *all* active haulers
 * (AI included) to exit (DESIGN §9.2), so every seat must start on the exit.
 */
function arenaExitAtSpawn0(id: string): LevelDefinition {
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
    id,
    displayName: "Test Arena",
    biome: "dungeon",
    blockSizePx: bs,
    width: w,
    height: h,
    cells,
    nearBg: Array(w).fill(null),
    fore: Array(w).fill(null),
    spawns: [
      { x: 2, y: h - 2 },
      { x: 2, y: h - 2 },
      { x: 2, y: h - 2 },
      { x: 2, y: h - 2 },
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

describe("sim C06-T23/T24: fork phase", () => {
  it("hoard completion does not increment levelsCompleted", () => {
    const level = arenaExitAtSpawn0("test_hoard_arena");
    const sim = new Simulation(
      level,
      { ...DEFAULT_SIM_CONFIG, enableAi: false },
      "level",
    );
    sim.loadLevel(level, "level", { isHoard: true });
    expect(sim.isHoard).toBe(true);
    sim.bindHuman(0, "h1");
    for (let i = 0; i < 3; i++) sim.step(); // settle to floor, then exit
    expect(sim.isLevelComplete()).toBe(true);
    expect(sim.levelsCompleted).toBe(0);
  });

  it("post-hoard level completion increments levelsCompleted", () => {
    const level = arenaExitAtSpawn0("test_post_hoard_arena");
    const sim = new Simulation(
      level,
      { ...DEFAULT_SIM_CONFIG, enableAi: false },
      "level",
    );
    sim.bindHuman(0, "h1");
    for (let i = 0; i < 3; i++) sim.step();
    expect(sim.isLevelComplete()).toBe(true);
    expect(sim.levelsCompleted).toBe(1);
  });

  it("fork phase freezes physics until the vote window elapses", () => {
    const level = arenaExitAtSpawn0("test_fork_freeze_arena");
    const sim = new Simulation(
      level,
      {
        ...DEFAULT_SIM_CONFIG,
        enableAi: false,
        fork: { ...DEFAULT_FORK_CONFIG, windowTicks: 5 },
      },
      "level",
    );
    sim.bindHuman(1, "h2");
    for (let i = 0; i < 10; i++) sim.step(); // let seat 1 settle to the floor
    sim.enterFork([level.id], levelMeta);
    expect(sim.phase).toBe("fork");
    const before = sim.seatState(1).body;
    for (let i = 0; i < 3; i++) {
      expect(sim.isForkResolved()).toBe(false);
      sim.step();
    }
    const during = sim.seatState(1).body;
    expect(during.x).toBeCloseTo(before.x, 5);
    expect(during.y).toBeCloseTo(before.y, 5);
    sim.step();
    sim.step();
    expect(sim.isForkResolved()).toBe(true);
  });

  it("loadLevel out of fork resumes free-run in the new level", () => {
    const level = arenaExitAtSpawn0("test_fork_resolve_arena");
    const sim = new Simulation(
      level,
      {
        ...DEFAULT_SIM_CONFIG,
        enableAi: false,
        fork: { ...DEFAULT_FORK_CONFIG, windowTicks: 1 },
      },
      "level",
    );
    sim.bindHuman(0, "h1");
    sim.step();
    expect(sim.isLevelComplete()).toBe(true);
    sim.enterFork([level.id], levelMeta);
    sim.step();
    expect(sim.isForkResolved()).toBe(true);
    expect(sim.forkResult?.levelId).toBe(level.id);

    sim.loadLevel(level, "level");
    expect(sim.phase).toBe("level");
    expect(sim.isHoard).toBe(false);
    expect(sim.isLevelComplete()).toBe(false);
    sim.step();
    expect(sim.isLevelComplete()).toBe(true);
    expect(sim.levelsCompleted).toBe(2);
  });
});
