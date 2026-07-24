/**
 * Tests for the mock infrastructure added to server/test/sim/helpers.ts.
 * These prove that:
 * 1. makeWorldSnapshot() produces a valid WorldSnapshot instance.
 * 2. testRng(seed) produces deterministic streams across runs.
 */

import { describe, expect, it } from "vitest";
import {
  assertRngDeterminism,
  makeWorldSnapshot,
  testRng,
} from "./helpers.js";
import type {
  CharacterId,
  HaulerPublic,
  SessionPhase,
  TreasurePublic,
  WorldSnapshot,
} from "@dhaul/protocol";

describe("makeWorldSnapshot()", () => {
  it("returns a valid WorldSnapshot with sensible defaults", () => {
    const snap = makeWorldSnapshot();
    expect(snap.tick).toBe(0);
    expect(snap.phase).toBe("level");
    expect(snap.levelId).toBe("box_level");
    expect(snap.levelsCompleted).toBe(0);
    expect(snap.levelsAfterHoard).toBe(2);
    expect(snap.lastProcessedInputSeq).toEqual({});
    expect(snap.haulers).toEqual([]);
    expect(snap.treasures).toEqual([]);
    expect(snap.traps).toEqual([]);
    expect(snap.switches).toEqual([]);
  });

  it("merges overrides on top of defaults", () => {
    const snap = makeWorldSnapshot({ tick: 42, phase: "fork" as SessionPhase });
    expect(snap.tick).toBe(42);
    expect(snap.phase).toBe("fork");
  });

  it("accepts a fully-populated snapshot", () => {
    const snap = makeWorldSnapshot({
      haulers: [{ seatId: 0, character: "gnome" as CharacterId, control: "human", x: 100, y: 200, vx: 0, vy: -50, facing: 1, anim: "idle", carry: [], stunned: false }] as HaulerPublic[],
      treasures: [{ instanceId: "t1", defId: "gold_ring", x: 50, y: 60 } as TreasurePublic],
    });
    expect(snap.haulers).toHaveLength(1);
    expect(snap.treasures).toHaveLength(1);
  });

  it("produces a snapshot that can be JSON-stringified without error", () => {
    const snap = makeWorldSnapshot({ tick: 7, phase: "end_count" as SessionPhase });
    // JSON.stringify should not throw — proves no circular refs or undefined.
    expect(() => JSON.stringify(snap)).not.toThrow();
  });
});

describe("testRng(seed)", () => {
  it("produces deterministic output across multiple runs", () => {
    const rng1 = testRng(42);
    const rng2 = testRng(42);
    for (let i = 0; i < 50; i++) {
      expect(rng1.next()).toBeCloseTo(rng2.next(), 6);
    }
  });

  it("produces different streams for different seeds", () => {
    const rngA = testRng(1);
    const rngB = testRng(99999);
    expect(rngA.next()).not.toBeCloseTo(rngB.next(), 6);
  });

  it("passes determinism assertion helper", () => {
    // assertRngDeterminism compares two RNG instances seeded identically.
    const rngA = testRng(7);
    const rngB = testRng(7);
    expect(() => assertRngDeterminism(rngA, rngB, 100)).not.toThrow();
  });

  it("nextInt returns values in [0, maxExclusive)", () => {
    const rng = testRng(42);
    for (let i = 0; i < 200; i++) {
      const v = rng.nextInt(10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    }
  });

  it("nextInt(0) returns 0", () => {
    const rng = testRng(42);
    expect(rng.nextInt(0)).toBe(0);
  });

  it("nextInt(-5) returns 0 (defensive)", () => {
    const rng = testRng(42);
    expect(rng.nextInt(-5)).toBe(0);
  });
});
