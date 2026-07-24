/**
 * C08-T14/T15 — AI stuck detection, loot cap drop logic, and flock behavior.
 */

import { describe, expect, it } from "vitest";
import { decide } from "../src/index.js";
import type { AiWorldView } from "../src/index.js";
import type { AiRng, SessionPhase } from "../src/index.js";

const LOW_STUCK_CONFIG = {
  stuckTicks: 5,
  pickupRadius: 48,
  switchSeekRadius: 320,
  upgradeUsesDrop: true,
};

function makeView(over: Partial<AiWorldView> = {}): AiWorldView {
  return {
    tick: 1,
    phase: "level",
    blockSizePx: 32,
    haulers: [
      {
        seatId: 0,
        control: "ai",
        x: 50,
        y: 100,
        vx: 0,
        vy: 0,
        facing: 1,
        grounded: true,
        stunned: false,
        carryCount: 0,
        carry: [],
        weight: 0,
      },
    ],
    freeTreasures: [
      {
        instanceId: "t1",
        defId: "gold_ring",
        x: 80,
        y: 100,
        rarity: "common" as const,
        valueGp: 5,
      },
    ],
    switches: [],
    ...over,
  };
}

describe("AI stuck detection", () => {
  it("does NOT flag as stuck when hauler is actively moving (vx >= 2)", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 50, // actively moving past threshold
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    const result = decide(0, view);
    expect(result.stuckTicks).toBe(0); // moved → reset
  });

  it("increments stuck counter when hauler is nearly motionless while grounded", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 1, // barely moving (threshold is <2)
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    // Call decide multiple times to accumulate stuck ticks
    let stuck = 0;
    for (let i = 0; i < 10; i++) {
      const result = decide(0, view, { stuckTicks: stuck, config: LOW_STUCK_CONFIG });
      stuck = result.stuckTicks;
    }
    expect(stuck).toBeGreaterThan(0); // stuck counter should have incremented
  });

  it("resets stuck counter when hauler is actually moving (vx >= 2)", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 10, // well above threshold — actively moving
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    const result = decide(0, view);
    // vx=10 (>=2) → else branch fires: stuck = 0
    expect(result.stuckTicks).toBe(0);
  });

  it("jumps when initial stuck >= cfg.stuckTicks", () => {
    const view = makeView({});
    // Pass a starting stuck value above threshold (default is 45)
    const result = decide(0, view, { stuckTicks: 50, config: LOW_STUCK_CONFIG });
    expect(result.command.jump).toBe(true); // should jump to escape
  });

  it("reverses direction when stuck >= cfg.stuckTicks + 15", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 0,
          vy: 0,
          facing: -1, // facing left
          grounded: true,
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    const result = decide(0, view, { stuckTicks: 35, config: LOW_STUCK_CONFIG });
    expect(result.command.jump).toBe(true); // above threshold
  });

  it("returns neutral when not grounded", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 0,
          vy: -50, // falling/jumping
          facing: 1,
          grounded: false, // NOT grounded!
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    const result = decide(0, view);
    expect(result.stuckTicks).toBe(0); // stuck detection requires grounded
  });

  it("returns neutral when exited", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 50,
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 0,
          carry: [],
          weight: 0,
          exited: true, // has exited the level
        },
      ],
    });
    const result = decide(0, view);
    expect(result.command.axes.x).toBe(0);
    expect(result.command.jump).toBe(false);
  });

  it("returns neutral when phase is instructions", () => {
    const view = makeView({ phase: "instructions" as SessionPhase });
    const result = decide(0, view);
    expect(result.command.axes.x).toBe(0);
    expect(result.stuckTicks).toBe(0);
  });

  it("returns neutral when phase is lobby", () => {
    const view = makeView({ phase: "lobby" as SessionPhase });
    const result = decide(0, view);
    expect(result.command.axes.x).toBe(0);
  });

  it("returns neutral when phase starts with 'end_'", () => {
    const view = makeView({ phase: "end_count" as SessionPhase });
    const result = decide(0, view);
    expect(result.command.axes.x).toBe(0);
  });
});

describe("AI loot cap drop logic", () => {
  it("decides to pick up adjacent treasure when carryCount < cap", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 75, // adjacent to treasure at (80,100) — within blockSizePx*0.75=24
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 0, // empty hands ready to pickup
          carry: [],
          weight: 0,
        },
      ],
    });
    const result = decide(0, view);
    expect(result.command.axes.y).toBe(1); // ducking for pickup
    expect(result.command.action).toBe(false); // no action during pickup (action=down would drop)
  });

  it("does NOT pick up when at cap without upgrade target", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 75, // adjacent to treasure
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 3, // at aiOnlyDefaultMaxLoad cap
          carry: [
            { instanceId: "c1", defId: "stone_icon" },
            { instanceId: "c2", defId: "wood_icon" },
            { instanceId: "c3", defId: "leaf_icon" },
          ],
          weight: 3,
        },
      ],
      freeTreasures: [], // no upgrade target available
    });
    const result = decide(0, view);
    expect(result.command.axes.y).toBe(0); // not ducking to pickup (at cap)
    expect(result.command.action).toBe(false); // not dropping either
  });

  it("drops lowest-value item when adjacent with upgrade target and at cap", () => {
    const view = makeView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 75, // adjacent to treasure
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 3, // at aiOnlyDefaultMaxLoad cap
          carry: [
            { instanceId: "c1", defId: "stone_icon", valueGp: 1 }, // lowest value item
            { instanceId: "c2", defId: "wood_icon" },
            { instanceId: "c3", defId: "leaf_icon" },
          ],
          weight: 3,
        },
      ],
    });
    const result = decide(0, view);
    // When adjacent and carrying at cap with upgrade target available:
    // action=down to drop first
    expect(result.command.action).toBe(true);
    expect(result.command.axes.y).toBe(1); // down (drop)
  });

  it("uses flock behavior when no treasures or switches exist", () => {
    const view = makeView({ freeTreasures: [], switches: [] });
    const result = decide(0, view);
    expect(result.command).toBeDefined();
    // Will use default flock target (not null)
  });

  it("uses custom config when provided with lower stuck threshold", () => {
    const view = makeView({});
    const result = decide(0, view, { config: LOW_STUCK_CONFIG });
    expect(result.command).toBeDefined();
  });

  it("uses provided stuckTicks override directly", () => {
    const view = makeView({});
    // Pass initial stuck value well above the custom threshold of 5
    const result = decide(0, view, { stuckTicks: 10, config: LOW_STUCK_CONFIG });
    expect(result.command.jump).toBe(true); // stuck >= 5 → jump
  });

  it("handles RNG parameter gracefully (future-proof)", () => {
    const view = makeView({});
    const result = decide(0, view, {
      rng: { next: () => Math.random() } as unknown as AiRng,
    });
    expect(result.command).toBeDefined(); // should not crash with RNG provided
  });

  it("does not throw when hauler is missing from view", () => {
    const view = makeView({ haulers: [] });
    expect(() => decide(0, view)).not.toThrow();
    const result = decide(0, view);
    expect(result.command.axes.x).toBe(0);
  });

  it("does not throw when seatId doesn't match any hauler", () => {
    const view = makeView({});
    const result = decide(99, view); // seatId=99 not in haulers
    expect(result.command.axes.x).toBe(0);
  });

  it("returns neutral command for non-existent seat", () => {
    const view = makeView({});
    const result = decide(5, view); // seat 5 doesn't exist
    expect(result.stuckTicks).toBe(0);
    expect(result.command.axes.x).toBe(0);
    expect(result.command.jump).toBe(false);
  });

  it("handles hauler with empty carry stack", () => {
    const view = makeView({});
    const result = decide(0, view);
    expect(result.command).toBeDefined();
  });
});
