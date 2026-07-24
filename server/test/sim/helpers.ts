import { fileURLToPath } from "node:url";
import { loadContentRoot, loadLevel, type LevelDefinition } from "@dhaul/levels";
import type {
  CarriedTreasureRef,
  ForkOption,
  HaulerPublic,
  InputCommand,
  SessionPhase,
  SwitchPublic,
  TrapPublic,
  TreasurePublic,
  WorldSnapshot,
} from "@dhaul/protocol";
import type { Rng } from "@dhaul/rules";
import { DEFAULT_SIM_CONFIG, type SimConfig } from "../../src/sim/config.js";
import { Simulation } from "../../src/sim/simulation.js";

const CONTENT_ROOT = fileURLToPath(new URL("../../../content", import.meta.url));

let cachedBox: LevelDefinition | undefined;
let cachedHoard: LevelDefinition | undefined;

export function boxLevel(): LevelDefinition {
  if (!cachedBox) {
    cachedBox = loadLevel(loadContentRoot(CONTENT_ROOT), "box_level");
  }
  return cachedBox;
}

export function hoardLevel(): LevelDefinition {
  if (!cachedHoard) {
    cachedHoard = loadLevel(loadContentRoot(CONTENT_ROOT), "hoard_01");
  }
  return cachedHoard;
}

/** Default test config: AI off so loot/trap tapes aren't stolen by fill seats. */
export const TEST_SIM_CONFIG: SimConfig = {
  ...DEFAULT_SIM_CONFIG,
  enableAi: false,
};

export function makeSim(config: SimConfig = TEST_SIM_CONFIG): Simulation {
  return new Simulation(boxLevel(), config);
}

export function makeHoardSim(config: SimConfig = TEST_SIM_CONFIG): Simulation {
  return new Simulation(hoardLevel(), config);
}

let seqCounter = 0;

/** Build a command; seq auto-increments unless given. */
export function cmd(
  over: Partial<Omit<InputCommand, "axes">> & {
    x?: -1 | 0 | 1;
    y?: -1 | 0 | 1;
  } = {},
): InputCommand {
  const { x = 0, y = 0, ...rest } = over;
  return {
    seq: ++seqCounter,
    axes: { x, y },
    jump: false,
    action: false,
    start: false,
    ...rest,
  };
}

export function resetSeq(): void {
  seqCounter = 0;
}

/** Drive one seat with a tape: one command per tick; returns snapshots. */
export function runTape(
  sim: Simulation,
  seatId: 0 | 1 | 2 | 3,
  tape: InputCommand[],
) {
  const snapshots = [];
  for (const c of tape) {
    sim.applyInput(seatId, c);
    snapshots.push(sim.step().snapshot);
  }
  return snapshots;
}

// ---------------------------------------------------------------------------
// Mock infrastructure — deterministic test doubles.
// ---------------------------------------------------------------------------

/** Build a minimal valid `WorldSnapshot` for assertion or codec round-trips. */
export function makeWorldSnapshot(
  over: Partial<WorldSnapshot> = {},
): WorldSnapshot {
  return {
    tick: 0,
    phase: "level",
    levelId: "box_level",
    levelsCompleted: 0,
    levelsAfterHoard: 2,
    lastProcessedInputSeq: {},
    haulers: [],
    treasures: [],
    traps: [],
    switches: [],
    ...over,
  };
}

/** Seeded PRNG factory — produces deterministic streams for treasure/sim tests. */
export function testRng(seed = 12345): Rng {
  // Re-implement mulberry32 inline to avoid depending on the server dist/.
  let s = seed >>> 0;
  return {
    next(): number {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    nextInt(maxExclusive: number): number {
      if (maxExclusive <= 0) return 0;
      return Math.floor(this.next() * maxExclusive);
    },
  };
}

/** Verify two RNGs seeded identically produce the same stream. */
export function assertRngDeterminism(r1: Rng, r2: Rng, n = 100): void {
  for (let i = 0; i < n; i++) {
    const a = r1.next();
    const b = r2.next();
    if (a !== b) {
      throw new Error(
        `RNG determinism check failed at index ${i}: ${a} !== ${b}`,
      );
    }
  }
}
