import { describe, expect, it } from "vitest";
import { loadContentRoot, loadLevel, loadMetaFromDir } from "../src/index.js";
import { CONTENT_ROOT } from "./helpers.js";

const index = loadContentRoot(CONTENT_ROOT);

function stripHash<T extends { contentHash: string }>(def: T): Omit<T, "contentHash"> {
  const { contentHash: _contentHash, ...rest } = def;
  return rest;
}

describe("hoard_01 fixture (LVL-01)", () => {
  const def = loadLevel(index, "hoard_01");

  it("parses gold biome with 4 spawns, right-side exit and many treasure slots", () => {
    expect(def.biome).toBe("gold");
    expect(def.spawns).toHaveLength(4);
    expect(def.treasureSlots.length).toBeGreaterThanOrEqual(8);
    expect(def.exit.width).toBeGreaterThan(0);
    // Exit hugs the right side of the room.
    expect(def.exit.x).toBeGreaterThan((def.width * def.blockSizePx) / 2);
    expect(def.musicId).toBe("hoard");
    expect(def.tilesetKey).toBe("tiles_gold");
    expect(def.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("is excluded from the fork pool", () => {
    const meta = loadMetaFromDir(`${CONTENT_ROOT}/levels/hoard_01`);
    expect(meta.poolEligible).toBe(false);
  });

  it("matches the golden snapshot", () => {
    expect(stripHash(def)).toMatchSnapshot();
  });
});

describe("box_level fixture (LVL-02)", () => {
  const def = loadLevel(index, "box_level");

  it("parses an empty dungeon box with platforms, spawns and exit", () => {
    expect(def.biome).toBe("dungeon");
    expect(def.spawns).toHaveLength(4);
    expect(def.treasureSlots).toHaveLength(0);
    expect(def.exit.height).toBe(2 * def.blockSizePx);
    expect(def.cells[def.height - 1]?.every((c) => c === "brick")).toBe(true);
    expect(def.nearBg).toHaveLength(def.width);
    expect(def.fore).toHaveLength(def.width);
  });

  it("matches the golden snapshot", () => {
    expect(stripHash(def)).toMatchSnapshot();
  });
});

describe("determinism across loads (LVL-21)", () => {
  it("double load produces deep-equal definitions and stable contentHash", () => {
    for (const id of ["hoard_01", "box_level"]) {
      const a = loadLevel(index, id);
      const b = loadLevel(index, id);
      expect(a).toEqual(b);
      expect(a.contentHash).toBe(b.contentHash);
    }
  });
});
