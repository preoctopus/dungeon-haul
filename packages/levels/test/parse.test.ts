import { describe, expect, it } from "vitest";
import { CELL_FLAGS, ContentError, parseLevel } from "../src/index.js";
import { C, buildPng, makeMeta, makeValidMap, realBiomes, realPalette } from "./helpers.js";

const palette = realPalette();
const biomes = realBiomes();

function parse(mapPng: Buffer, metaOverrides = {}) {
  return parseLevel({ mapPng, meta: makeMeta(metaOverrides), palette, biomes });
}

function parseErr(mapPng: Buffer, metaOverrides = {}): ContentError {
  try {
    parse(mapPng, metaOverrides);
  } catch (e) {
    expect(e).toBeInstanceOf(ContentError);
    return e as ContentError;
  }
  throw new Error("expected parse to throw");
}

describe("dimensions & layout (LVL-04, LVL-08..11, LVL-27)", () => {
  it("emits body width = W-1 and height = H-4; nearBg/fore lengths = width", () => {
    const def = parse(makeValidMap());
    expect(def.width).toBe(9);
    expect(def.height).toBe(4);
    expect(def.cells).toHaveLength(4);
    expect(def.cells[0]).toHaveLength(9);
    expect(def.nearBg).toHaveLength(9);
    expect(def.fore).toHaveLength(9);
  });

  it("ignores column-0 noise (unknown colors) on all rows", () => {
    const def = parse(
      makeValidMap((set) => {
        for (let y = 1; y < 8; y++) set(0, y, "#123456"); // not in palette
      }),
    );
    expect(def.width).toBe(9);
    expect(def.cells.flat()).not.toContain(undefined);
  });

  it("ignores spacer row H-2 and header row residual noise", () => {
    const def = parse(
      makeValidMap((set) => {
        for (let x = 1; x < 10; x++) set(x, 6, "#ABCDEF"); // spacer row noise
        for (let x = 1; x < 10; x++) set(x, 0, "#0BADF0"); // header residual noise
      }),
    );
    // Noise never reaches body cells.
    expect(def.cells.flat().every((c) => typeof c === "string")).toBe(true);
  });

  it("rejects maps below the 3x5 minimum", () => {
    const err = parseErr(buildPng(2, 4, C.EMPTY, () => {}));
    expect(err.code).toBe("BAD_DIMENSIONS");
  });

  it("rejects maps above the 512x64 maximum", () => {
    const wide = buildPng(513, 8, C.EMPTY, (set) => set(0, 0, C.HEADER_DUNGEON));
    expect(parseErr(wide).code).toBe("BAD_DIMENSIONS");
    const tall = buildPng(10, 65, C.EMPTY, (set) => set(0, 0, C.HEADER_DUNGEON));
    expect(parseErr(tall).code).toBe("BAD_DIMENSIONS");
  });
});

describe("palette fail-closed (LVL-03, LVL-12, LVL-19)", () => {
  it("fails closed on an unknown body color with x,y,rgb", () => {
    const err = parseErr(makeValidMap((set) => set(5, 3, "#010203")));
    expect(err.code).toBe("UNKNOWN_COLOR");
    expect(err.pixel).toEqual({ x: 5, y: 3, rgb: "#010203" });
  });

  it("rejects non-opaque body pixels", () => {
    const err = parseErr(makeValidMap((set) => set(4, 3, C.BRICK, 128)));
    expect(err.code).toBe("BAD_ALPHA");
  });

  it("rejects solid brick on the foreground decorative row", () => {
    const err = parseErr(makeValidMap((set) => set(3, 7, C.BRICK)));
    expect(err.code).toBe("DECORATIVE_INVALID");
  });

  it("rejects decorative colors inside the body", () => {
    const err = parseErr(makeValidMap((set) => set(3, 3, C.FORE_GRASS)));
    expect(err.code).toBe("INVALID_CELL");
  });
});

describe("header biome (LVL-06, LVL-07)", () => {
  it("accepts a matching header", () => {
    expect(parse(makeValidMap()).biome).toBe("dungeon");
  });

  it("fails BIOME_MISMATCH when header disagrees with meta.biome", () => {
    const err = parseErr(makeValidMap(), { biome: "ice" });
    expect(err.code).toBe("BIOME_MISMATCH");
    expect(err.pixel?.rgb).toBe("#808080");
  });

  it("allowHeaderMismatch bypasses the check (debug only)", () => {
    const def = parse(makeValidMap(), { biome: "ice", allowHeaderMismatch: true });
    expect(def.biome).toBe("ice");
  });
});

describe("emission (LVL-13..17, LVL-20, LVL-24, LVL-25)", () => {
  it("extracts treasure slots as positions only and clears the cell under", () => {
    const def = parse(makeValidMap((set) => set(4, 4, C.SLOT)));
    expect(def.treasureSlots).toEqual([{ x: 3, y: 2 }]); // no catalog / def ids
    expect(def.cells[2]?.[3]).toBe("empty");
  });

  it("applies meta default rarity filter to slots", () => {
    const def = parse(makeValidMap((set) => set(4, 4, C.SLOT)), {
      treasureSlotDefaultRarity: "rare",
    });
    expect(def.treasureSlots).toEqual([{ x: 3, y: 2, filter: "rare" }]);
  });

  it("reads explicit player_spawn_0..3 in seat order", () => {
    const def = parse(
      makeValidMap((set) => {
        C.SPAWN.forEach((hex, seat) => set(2 + seat, 4, hex));
      }),
    );
    expect(def.spawns).toEqual([
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
    ]);
  });

  it("defaults spawns to a safe left ledge when markers are missing", () => {
    const def = parse(makeValidMap());
    expect(def.spawns).toHaveLength(4);
    for (const s of def.spawns) {
      const below = def.cells[s.y + 1]?.[s.x];
      expect(below && CELL_FLAGS[below].solid).toBe(true);
    }
  });

  it("hard-fails when no spawn markers and no safe surface", () => {
    const floorless = buildPng(10, 8, C.EMPTY, (set) => {
      set(0, 0, C.HEADER_DUNGEON);
      set(8, 4, C.EXIT);
    });
    expect(parseErr(floorless).code).toBe("NO_SAFE_SPAWN");
  });

  it("unions multi-cell exits into one world-px AABB (y-down)", () => {
    // makeValidMap exit at image (8,4) = body (7,2); add (8,5)=body(7,3).
    const def = parse(makeValidMap((set) => set(8, 5, C.EXIT)));
    expect(def.exit).toEqual({ x: 7 * 32, y: 2 * 32, width: 32, height: 64 });
  });

  it("fails MISSING_EXIT without exit cells unless skipExitValidation", () => {
    const noExit = buildPng(10, 8, C.EMPTY, (set) => {
      set(0, 0, C.HEADER_DUNGEON);
      for (let x = 1; x < 10; x++) set(x, 5, C.BRICK);
    });
    expect(parseErr(noExit).code).toBe("MISSING_EXIT");
    const def = parse(noExit, { skipExitValidation: true });
    expect(def.exit).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it("emits parallax defaults far 0.5 / near 1.0 / fore 1.25", () => {
    expect(parse(makeValidMap()).parallax).toEqual({
      farScroll: 0.5,
      nearScroll: 1.0,
      foreScroll: 1.25,
    });
  });

  it("assigns sw_x_y switch ids and merges meta.switchLinks", () => {
    const map = makeValidMap((set) => set(3, 4, "#FF0000")); // switch at body (2,2)
    const def = parse(map, {
      switchLinks: [{ switchId: "sw_2_2", targetIds: ["door_a"] }],
    });
    expect(def.switchLinks).toEqual([{ switchId: "sw_2_2", targetIds: ["door_a"] }]);
  });

  it("passes material flags through for the sim", () => {
    expect(CELL_FLAGS.ice).toEqual({ solid: true, friction: "low" });
    expect(CELL_FLAGS.sand).toEqual({ solid: true, friction: "high" });
    expect(CELL_FLAGS.spikes).toEqual({ solid: true, trap: "spikes" });
  });
});

describe("determinism (property)", () => {
  it("same bytes parse to deep-equal definitions with identical contentHash", () => {
    const map = makeValidMap((set) => set(4, 4, C.SLOT));
    const a = parse(map);
    const b = parse(map);
    expect(a).toEqual(b);
    expect(a.contentHash).toBe(b.contentHash);
    expect(a.contentHash).toMatch(/^[0-9a-f]{64}$/);
  });

  it("meta changes change the contentHash", () => {
    const map = makeValidMap();
    const a = parse(map);
    const b = parse(map, { displayName: "Renamed" });
    expect(a.contentHash).not.toBe(b.contentHash);
  });
});
