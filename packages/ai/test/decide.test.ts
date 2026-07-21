import { describe, expect, it } from "vitest";
import { decide, DEFAULT_AI_CONFIG } from "../src/index.js";
import type { AiWorldView } from "../src/index.js";

function baseView(over: Partial<AiWorldView> = {}): AiWorldView {
  return {
    tick: 1,
    phase: "level",
    blockSizePx: 32,
    haulers: [
      {
        seatId: 0,
        control: "ai",
        x: 0,
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
      {
        seatId: 1,
        control: "human",
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        facing: 1,
        grounded: true,
        stunned: false,
        carryCount: 1,
        carry: [
          { instanceId: "h1", defId: "stone_icon", valueGp: 5, rarity: "common" },
        ],
        weight: 1,
      },
    ],
    freeTreasures: [],
    switches: [],
    ...over,
  };
}

describe("decide cascade", () => {
  it("emits neutral when stunned", () => {
    const view = baseView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: true,
          carryCount: 0,
          carry: [],
          weight: 0,
        },
      ],
    });
    const { command } = decide(0, view);
    expect(command.axes).toEqual({ x: 0, y: 0 });
    expect(command.jump).toBe(false);
    expect(command.action).toBe(false);
    expect(command.start).toBe(false);
  });

  it("flocks toward human average when outside tolerance", () => {
    const view = baseView();
    // AI at 0, human at 100 → mean 100, single-human tol = 128*0.25=32 → axes +1
    const { command } = decide(0, view);
    expect(command.axes.x).toBe(1);
  });

  it("stays put when already in the pack band", () => {
    const view = baseView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 100,
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
        {
          seatId: 1,
          control: "human",
          x: 100,
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
    });
    const { command } = decide(0, view);
    expect(command.axes.x).toBe(0);
  });

  it("ducks for adjacent treasure under load cap", () => {
    const view = baseView({
      freeTreasures: [
        {
          instanceId: "t1",
          defId: "crown",
          x: 5,
          y: 100,
          valueGp: 750,
          rarity: "rare",
        },
      ],
    });
    const { command } = decide(0, view);
    expect(command.axes.y).toBe(1);
    expect(command.action).toBe(false);
  });

  it("issues drop chord when upgrading at cap", () => {
    const view = baseView({
      haulers: [
        {
          seatId: 0,
          control: "ai",
          x: 0,
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 1,
          carry: [
            {
              instanceId: "low",
              defId: "stone_icon",
              valueGp: 5,
              rarity: "common",
            },
          ],
          weight: 1,
        },
        {
          seatId: 1,
          control: "human",
          x: 0,
          y: 100,
          vx: 0,
          vy: 0,
          facing: 1,
          grounded: true,
          stunned: false,
          carryCount: 1,
          carry: [],
          weight: 0,
        },
      ],
      freeTreasures: [
        {
          instanceId: "up",
          defId: "crown",
          x: 4,
          y: 100,
          valueGp: 750,
          rarity: "rare",
        },
      ],
    });
    const { command } = decide(0, view, { config: DEFAULT_AI_CONFIG });
    expect(command.action).toBe(true);
    expect(command.axes.y).toBe(1);
  });

  it("jumps after stuckTicks of zero velocity with held direction", () => {
    const view = baseView();
    const { command, stuckTicks } = decide(0, view, {
      stuckTicks: DEFAULT_AI_CONFIG.stuckTicks,
    });
    expect(command.jump).toBe(true);
    expect(stuckTicks).toBeGreaterThanOrEqual(DEFAULT_AI_CONFIG.stuckTicks);
  });
});
