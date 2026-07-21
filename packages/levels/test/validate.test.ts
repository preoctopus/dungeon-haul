import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  type ContentError,
  loadBiomes,
  loadPalette,
  validateContentRoot,
  validateMeta,
  validatePool,
} from "../src/index.js";
import { C, CONTENT_ROOT, buildPng, makeMeta } from "./helpers.js";

const tmpRoots: string[] = [];
afterAll(() => {
  for (const dir of tmpRoots) rmSync(dir, { recursive: true, force: true });
});

/** Copy the real content pack to a temp dir and corrupt it via `mutate`. */
function corruptedRoot(mutate: (root: string) => void): string {
  const root = mkdtempSync(join(tmpdir(), "dhaul-content-"));
  tmpRoots.push(root);
  cpSync(CONTENT_ROOT, root, { recursive: true });
  mutate(root);
  return root;
}

describe("validateContentRoot on the shipped pack", () => {
  it("passes with zero errors (warnings allowed)", () => {
    const report = validateContentRoot(CONTENT_ROOT);
    expect(report.errors).toEqual([]);
    expect(report.levels).toEqual(["box_level", "hoard_01"]);
  });
});

describe("meta schema (LVL-05, LVL-28)", () => {
  it("fails META_ID_MISMATCH when meta.id differs from folder", () => {
    expect(() => validateMeta(makeMeta({ id: "other" }), "test_level")).toThrowError(
      expect.objectContaining({ code: "META_ID_MISMATCH" }),
    );
  });

  it("fails META_INVALID with stable codes on missing fields", () => {
    for (const bad of [
      { ...makeMeta(), biome: "swamp" },
      { ...makeMeta(), version: undefined },
      { ...makeMeta(), blockSizePx: -1 },
      { ...makeMeta(), displayName: "" },
    ]) {
      try {
        validateMeta(bad, "test_level");
        expect.unreachable("expected META_INVALID");
      } catch (e) {
        expect((e as ContentError).code).toBe("META_INVALID");
      }
    }
  });
});

describe("shared tables", () => {
  it("biomes.json lists all seven biomes (LVL-26)", () => {
    const biomes = loadBiomes(JSON.parse(readFileSync(`${CONTENT_ROOT}/biomes.json`, "utf8")));
    expect(Object.keys(biomes.table).sort()).toEqual(
      ["cavern", "dungeon", "gold", "ice", "lava", "mist", "outside"],
    );
  });

  it("palette rejects unknown semantics and bad hex keys", () => {
    expect(() => loadPalette({ version: 1, colors: { "#123456": "lava_floor" } })).toThrowError(
      expect.objectContaining({ code: "PALETTE_INVALID" }),
    );
    expect(() => loadPalette({ version: 1, colors: { "123456": "brick" } })).toThrowError(
      expect.objectContaining({ code: "PALETTE_INVALID" }),
    );
  });

  it("level-pool.json shape is enforced (LVL-22)", () => {
    expect(validatePool({ version: 1, hoardId: "hoard_01", playablePool: [], levelsAfterHoardDefault: 2 }))
      .toBeTruthy();
    for (const bad of [
      {},
      { version: 1, hoardId: "", playablePool: [], levelsAfterHoardDefault: 2 },
      { version: 1, hoardId: "hoard_01", playablePool: [1], levelsAfterHoardDefault: 2 },
      { version: 1, hoardId: "hoard_01", playablePool: [], levelsAfterHoardDefault: 0 },
    ]) {
      expect(() => validatePool(bad)).toThrowError(
        expect.objectContaining({ code: "POOL_INVALID" }),
      );
    }
  });
});

describe("corrupted content packs fail closed", () => {
  it("reports META_ID_MISMATCH for a renamed meta id", () => {
    const root = corruptedRoot((r) => {
      writeFileSync(
        join(r, "levels/box_level/meta.json"),
        JSON.stringify(makeMeta({ id: "not_box_level" })),
      );
    });
    const report = validateContentRoot(root);
    expect(report.errors.map((e) => e.code)).toContain("META_ID_MISMATCH");
  });

  it("reports UNKNOWN_COLOR for a map with a stray pixel", () => {
    const root = corruptedRoot((r) => {
      const bad = buildPng(10, 8, C.EMPTY, (set) => {
        set(0, 0, C.HEADER_DUNGEON);
        for (let x = 1; x < 10; x++) set(x, 5, C.BRICK);
        set(8, 4, C.EXIT);
        set(4, 3, "#0F0F0F");
      });
      writeFileSync(join(r, "levels/box_level/map.png"), bad);
    });
    const report = validateContentRoot(root);
    const err = report.errors.find((e) => e.code === "UNKNOWN_COLOR");
    expect(err?.pixel).toEqual({ x: 4, y: 3, rgb: "#0F0F0F" });
  });

  it("reports MISSING_EXIT when a level loses its exit cells", () => {
    const root = corruptedRoot((r) => {
      const noExit = buildPng(10, 8, C.EMPTY, (set) => {
        set(0, 0, C.HEADER_DUNGEON);
        for (let x = 1; x < 10; x++) set(x, 5, C.BRICK);
      });
      writeFileSync(join(r, "levels/box_level/map.png"), noExit);
    });
    expect(validateContentRoot(root).errors.map((e) => e.code)).toContain("MISSING_EXIT");
  });

  it("reports pool errors for missing and pool-ineligible references (LVL-23)", () => {
    const root = corruptedRoot((r) => {
      writeFileSync(
        join(r, "level-pool.json"),
        JSON.stringify({
          version: 1,
          hoardId: "hoard_01",
          playablePool: ["box_level", "ghost_level"],
          levelsAfterHoardDefault: 2,
        }),
      );
    });
    const codes = validateContentRoot(root).errors.map((e) => e.code);
    expect(codes).toContain("POOL_UNKNOWN_LEVEL");
    expect(codes).toContain("POOL_INELIGIBLE_LEVEL");
  });

  it("forbids allowHeaderMismatch in CI", () => {
    const root = corruptedRoot((r) => {
      writeFileSync(
        join(r, "levels/box_level/meta.json"),
        JSON.stringify(makeMeta({ id: "box_level", biome: "ice", allowHeaderMismatch: true })),
      );
    });
    const codes = validateContentRoot(root).errors.map((e) => e.code);
    expect(codes).toContain("META_INVALID");
  });
});
