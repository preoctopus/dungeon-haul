import type { Biome, BiomesTable } from "./types.js";
import { BIOMES, ContentError } from "./types.js";

const HEX_RE = /^#[0-9A-F]{6}$/i;

export interface Biomes {
  table: BiomesTable;
  /** Uppercase header "#RRGGBB" → biome id. */
  byHeaderRgb: ReadonlyMap<string, Biome>;
}

/** Parse + validate `biomes.json` content (all seven biomes required). */
export function loadBiomes(raw: unknown, path = "biomes.json"): Biomes {
  if (typeof raw !== "object" || raw === null) {
    throw new ContentError("BIOMES_INVALID", "biomes.json must be an object", { path });
  }
  const table = raw as BiomesTable;
  const byHeaderRgb = new Map<string, Biome>();
  for (const biome of BIOMES) {
    const info = table[biome];
    if (typeof info !== "object" || info === null) {
      throw new ContentError("BIOMES_INVALID", `biomes.json missing biome "${biome}"`, { path });
    }
    for (const field of ["headerRgb", "tilesetKey", "farBgKey", "defaultMusicId"] as const) {
      if (typeof info[field] !== "string") {
        throw new ContentError("BIOMES_INVALID", `biome "${biome}" missing string ${field}`, { path });
      }
    }
    const rgb = info.headerRgb.toUpperCase();
    if (!HEX_RE.test(rgb)) {
      throw new ContentError("BIOMES_INVALID", `biome "${biome}" headerRgb ${info.headerRgb} is not #RRGGBB`, { path });
    }
    if (byHeaderRgb.has(rgb)) {
      throw new ContentError("BIOMES_INVALID", `duplicate biome header color ${rgb}`, { path });
    }
    byHeaderRgb.set(rgb, biome);
  }
  return { table, byHeaderRgb };
}
