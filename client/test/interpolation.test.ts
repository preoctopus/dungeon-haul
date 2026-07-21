import { describe, expect, it } from "vitest";
import type { HaulerPublic, WorldSnapshot } from "@dhaul/protocol";
import { RemoteInterpolator } from "../src/net/interpolation.js";

function snap(tick: number, seat1X: number): WorldSnapshot {
  const h: HaulerPublic = {
    seatId: 1,
    character: "sprite",
    control: "human",
    x: seat1X,
    y: 100,
    vx: 0,
    vy: 0,
    facing: 1,
    anim: "run",
    carry: [],
    stunned: false,
    name: "Bea",
  };
  return {
    tick,
    phase: "level",
    levelsCompleted: 0,
    levelsAfterHoard: 2,
    lastProcessedInputSeq: {},
    haulers: [h],
    treasures: [],
    traps: [],
    switches: [],
  };
}

describe("RemoteInterpolator", () => {
  it("interpolates between two snapshots at the delayed render time", () => {
    const interp = new RemoteInterpolator(66);
    interp.push(snap(1, 0), 1000);
    interp.push(snap(2, 100), 1100);
    // Render time = now - 66. At now=1132, target=1066 → 66% between 1000/1100.
    const s = interp.sample(1, 1132);
    expect(s).not.toBeNull();
    expect(s!.x).toBeCloseTo(66, 0);
    expect(s!.name).toBe("Bea");
  });

  it("excludes the local seat and returns null for unseen seats", () => {
    const interp = new RemoteInterpolator();
    interp.push(snap(1, 10), 1000, /* excludeSeatId */ 1);
    expect(interp.sample(1, 1100)).toBeNull();
    expect(interp.sample(3, 1100)).toBeNull();
  });

  it("holds the last transform on buffer underrun (no long extrapolation)", () => {
    const interp = new RemoteInterpolator(66);
    interp.push(snap(1, 0), 1000);
    interp.push(snap(2, 100), 1100);
    // Far future: render time past newest sample → hold newest, don't extrapolate.
    const s = interp.sample(1, 5000);
    expect(s!.x).toBe(100);
  });
});
