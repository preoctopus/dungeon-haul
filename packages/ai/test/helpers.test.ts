import { describe, expect, it } from "vitest";
import {
  averageHumanPosition,
  axesToward,
  isBetterTreasure,
  maxHumanLoad,
  selectSwitchTarget,
  selectTreasureTarget,
  toleranceBand,
} from "../src/index.js";
import type { AiHaulerView } from "../src/index.js";
import { DEFAULT_AI_CONFIG } from "../src/index.js";

function hauler(over: Partial<AiHaulerView> & { seatId: number }): AiHaulerView {
  return {
    control: "ai",
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: 1,
    grounded: true,
    stunned: false,
    carryCount: 0,
    carry: [],
    weight: 0,
    ...over,
  };
}

describe("averageHumanPosition", () => {
  it("returns null with no humans", () => {
    expect(averageHumanPosition([hauler({ seatId: 0 })])).toBeNull();
  });

  it("means two humans", () => {
    const avg = averageHumanPosition([
      hauler({ seatId: 0, control: "human", x: 0, y: 10 }),
      hauler({ seatId: 1, control: "human", x: 100, y: 30 }),
      hauler({ seatId: 2, control: "ai", x: 999, y: 999 }),
    ]);
    expect(avg).toEqual({ x: 50, y: 20 });
  });
});

describe("toleranceBand", () => {
  it("uses comfort * fraction for a single human", () => {
    const t = toleranceBand(
      [hauler({ seatId: 0, control: "human", x: 0 })],
      DEFAULT_AI_CONFIG,
    );
    expect(t).toBe(
      DEFAULT_AI_CONFIG.singleHumanComfort * DEFAULT_AI_CONFIG.toleranceFraction,
    );
  });

  it("is 25% of furthest-pair span for two humans", () => {
    const t = toleranceBand(
      [
        hauler({ seatId: 0, control: "human", x: 0 }),
        hauler({ seatId: 1, control: "human", x: 100 }),
      ],
      DEFAULT_AI_CONFIG,
    );
    expect(t).toBe(25);
  });
});

describe("maxHumanLoad", () => {
  it("uses AI-only default when no humans", () => {
    expect(maxHumanLoad([hauler({ seatId: 0 })], DEFAULT_AI_CONFIG)).toBe(3);
  });

  it("tracks the greediest human", () => {
    const load = maxHumanLoad(
      [
        hauler({ seatId: 0, control: "human", carryCount: 2 }),
        hauler({ seatId: 1, control: "human", carryCount: 4 }),
        hauler({ seatId: 2, control: "ai", carryCount: 9 }),
      ],
      DEFAULT_AI_CONFIG,
    );
    expect(load).toBe(4);
  });
});

describe("selectTreasureTarget", () => {
  const self = hauler({ seatId: 0, x: 0, y: 0, carryCount: 0 });

  it("picks highest value in radius", () => {
    const hit = selectTreasureTarget(
      self,
      [
        {
          instanceId: "a",
          defId: "stone_icon",
          x: 10,
          y: 0,
          valueGp: 5,
          rarity: "common",
        },
        {
          instanceId: "b",
          defId: "crown",
          x: 12,
          y: 0,
          valueGp: 750,
          rarity: "rare",
        },
      ],
      3,
      48,
    );
    expect(hit?.treasure.instanceId).toBe("b");
    expect(hit?.upgrade).toBe(false);
  });

  it("refuses pickup at cap without a better upgrade", () => {
    const loaded = hauler({
      seatId: 0,
      carryCount: 2,
      carry: [
        { instanceId: "c1", defId: "a", valueGp: 100, rarity: "common" },
        { instanceId: "c2", defId: "b", valueGp: 50, rarity: "common" },
      ],
    });
    const hit = selectTreasureTarget(
      loaded,
      [
        {
          instanceId: "low",
          defId: "stone_icon",
          x: 5,
          y: 0,
          valueGp: 5,
          rarity: "common",
        },
      ],
      2,
      48,
    );
    expect(hit).toBeNull();
  });

  it("selects upgrade when free item beats worst carried", () => {
    const loaded = hauler({
      seatId: 0,
      carryCount: 2,
      carry: [
        { instanceId: "c1", defId: "a", valueGp: 100, rarity: "common" },
        { instanceId: "c2", defId: "b", valueGp: 50, rarity: "common" },
      ],
    });
    const hit = selectTreasureTarget(
      loaded,
      [
        {
          instanceId: "up",
          defId: "crown",
          x: 5,
          y: 0,
          valueGp: 750,
          rarity: "rare",
        },
      ],
      2,
      48,
    );
    expect(hit?.upgrade).toBe(true);
    expect(hit?.treasure.instanceId).toBe("up");
  });
});

describe("selectSwitchTarget", () => {
  it("skips heavy switches when under mass", () => {
    const self = hauler({ seatId: 0, weight: 0 });
    const hit = selectSwitchTarget(
      self,
      [
        {
          switchId: "sw:1,1",
          x: 10,
          y: 0,
          kind: "heavy",
          pressed: false,
          requiredMass: 3,
        },
      ],
      100,
    );
    expect(hit).toBeNull();
  });

  it("picks nearest unpressed regular switch", () => {
    const self = hauler({ seatId: 0, x: 0 });
    const hit = selectSwitchTarget(
      self,
      [
        {
          switchId: "far",
          x: 80,
          y: 0,
          kind: "regular",
          pressed: false,
        },
        {
          switchId: "near",
          x: 20,
          y: 0,
          kind: "regular",
          pressed: false,
        },
        {
          switchId: "done",
          x: 5,
          y: 0,
          kind: "regular",
          pressed: true,
        },
      ],
      100,
    );
    expect(hit?.switchId).toBe("near");
  });
});

describe("axesToward / isBetterTreasure", () => {
  it("dead-zones inside tolerance", () => {
    expect(axesToward(50, 55, 10)).toBe(0);
    expect(axesToward(50, 70, 10)).toBe(1);
    expect(axesToward(50, 30, 10)).toBe(-1);
  });

  it("ranks unique over rare at equal value", () => {
    expect(
      isBetterTreasure(
        { valueGp: 100, rarity: "unique" },
        { valueGp: 100, rarity: "rare" },
      ),
    ).toBe(true);
  });
});
