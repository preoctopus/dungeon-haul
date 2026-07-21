import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { loadPalette, type Palette } from "../src/palette.js";
import { loadBiomes, type Biomes } from "../src/biomes.js";
import type { LevelMeta } from "../src/types.js";
import { buildPng, type PaintFn } from "../src/tools/buildPng.js";
import { C } from "../src/tools/fixtureMaps.js";

export const CONTENT_ROOT = fileURLToPath(new URL("../../../content", import.meta.url));

export function realPalette(): Palette {
  return loadPalette(JSON.parse(readFileSync(`${CONTENT_ROOT}/palette.json`, "utf8")));
}

export function realBiomes(): Biomes {
  return loadBiomes(JSON.parse(readFileSync(`${CONTENT_ROOT}/biomes.json`, "utf8")));
}

export function makeMeta(overrides: Partial<LevelMeta> = {}): LevelMeta {
  return {
    id: "test_level",
    displayName: "Test Level",
    biome: "dungeon",
    blockSizePx: 32,
    version: 1,
    ...overrides,
  };
}

/**
 * Minimal valid 10x8 dungeon map (body 9x4): brick floor on the last body
 * row, exit at image (8,4), no explicit spawns (defaults resolve on the
 * left floor). `paint` runs last and may overwrite anything.
 */
export function makeValidMap(paint?: (set: PaintFn) => void, W = 10, H = 8): Buffer {
  return buildPng(W, H, C.EMPTY, (set) => {
    set(0, 0, C.HEADER_DUNGEON);
    for (let x = 1; x < W; x++) set(x, H - 3, C.BRICK); // floor (last body row)
    set(W - 2, H - 4, C.EXIT);
    paint?.(set);
  });
}

export { C, buildPng };
