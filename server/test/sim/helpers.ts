import { fileURLToPath } from "node:url";
import { loadContentRoot, loadLevel, type LevelDefinition } from "@dhaul/levels";
import type { InputCommand } from "@dhaul/protocol";
import { DEFAULT_SIM_CONFIG, type SimConfig } from "../../src/sim/config.js";
import { Simulation } from "../../src/sim/simulation.js";

const CONTENT_ROOT = fileURLToPath(new URL("../../../content", import.meta.url));

let cached: LevelDefinition | undefined;

export function boxLevel(): LevelDefinition {
  if (!cached) {
    cached = loadLevel(loadContentRoot(CONTENT_ROOT), "box_level");
  }
  return cached;
}

export function makeSim(config: SimConfig = DEFAULT_SIM_CONFIG): Simulation {
  return new Simulation(boxLevel(), config);
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
