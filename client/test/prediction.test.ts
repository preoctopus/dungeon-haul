import { describe, expect, it } from "vitest";
import type { InputCommand, WorldSnapshot } from "@dhaul/protocol";
import { LocalPredictor } from "../src/net/prediction.js";
import {
  DEFAULT_KINEMATICS,
  stepHauler,
  type SolidGrid,
} from "../src/net/kinematics.js";

// Same enclosed box as the server fixture: 21x6, floor row 5, walls col 0/20.
const GRID: SolidGrid = {
  blockSizePx: 32,
  widthCells: 21,
  heightCells: 6,
  isSolid: (cx, cy) =>
    cx < 0 || cy < 0 || cx >= 21 || cy >= 6 || cy === 5 || cx === 0 || cx === 20,
};

const cmd = (seq: number, x: -1 | 0 | 1, jump = false): InputCommand => ({
  seq,
  axes: { x, y: 0 },
  jump,
  action: false,
  start: false,
});

function snapshotFromBody(seq: number, x: number, y: number, vx: number, vy: number): WorldSnapshot {
  return {
    tick: seq,
    phase: "level",
    levelId: "box_level",
    levelsCompleted: 0,
    levelsAfterHoard: 2,
    lastProcessedInputSeq: { 0: seq },
    haulers: [
      {
        seatId: 0,
        character: "gnome",
        control: "human",
        x,
        y,
        vx,
        vy,
        facing: 1,
        anim: vy < 0 ? "jump" : "idle",
        carry: [],
        stunned: false,
      },
    ],
    treasures: [],
    traps: [],
    switches: [],
  };
}

describe("LocalPredictor: parity with server kinematics", () => {
  it("predicts the same path the server sim produces for identical inputs", () => {
    const spawn = { x: 2 * 32 + 16, y: 4 * 32 + 16 };
    const predictor = new LocalPredictor(GRID, DEFAULT_KINEMATICS, 0);
    // Seed the predictor at spawn via a reconcile from an initial snapshot.
    predictor.reconcile(snapshotFromBody(0, spawn.x, spawn.y, 0, 0));

    // Reference server body seeded from the SAME post-reconcile state so the
    // only variable under test is the shared step function.
    const authBody = { ...predictor.state };
    const tape = [
      ...Array.from({ length: 8 }, (_, i) => cmd(i + 1, 1)),
      ...Array.from({ length: 6 }, (_, i) => cmd(i + 9, 1, true)),
    ];
    for (const c of tape) {
      predictor.predict(c);
      stepHauler(authBody, { moveX: c.axes.x, jump: c.jump }, GRID, DEFAULT_KINEMATICS);
    }
    // Unreconciled prediction equals a raw server-side sim of the same tape.
    expect(predictor.state.x).toBeCloseTo(authBody.x, 5);
    expect(predictor.state.y).toBeCloseTo(authBody.y, 5);
  });
});

describe("LocalPredictor: reconciliation", () => {
  it("drops acked inputs and replays the unacked remainder", () => {
    const spawn = { x: 100, y: 144 };
    const predictor = new LocalPredictor(GRID, DEFAULT_KINEMATICS, 0);
    predictor.reconcile(snapshotFromBody(0, spawn.x, spawn.y, 0, 0));

    for (let i = 1; i <= 10; i++) predictor.predict(cmd(i, 1));
    expect(predictor.pendingCount).toBe(10);

    // Server acked through seq 6 at an authoritative position.
    predictor.reconcile(snapshotFromBody(6, 130, spawn.y, 40, 0));
    expect(predictor.pendingCount).toBe(4); // seqs 7..10 replayed

    // Result is server pos advanced by 4 more right-moving steps (x increased).
    expect(predictor.state.x).toBeGreaterThan(130);
  });

  it("hard-corrects toward server position on large divergence", () => {
    const predictor = new LocalPredictor(GRID, DEFAULT_KINEMATICS, 0);
    predictor.reconcile(snapshotFromBody(0, 100, 144, 0, 0));
    for (let i = 1; i <= 5; i++) predictor.predict(cmd(i, 1));
    const before = predictor.state.x;
    // Server says we were actually shoved far left, all inputs acked.
    predictor.reconcile(snapshotFromBody(5, 50, 144, 0, 0));
    expect(predictor.state.x).toBe(50);
    expect(predictor.state.x).toBeLessThan(before);
  });
});
