import { readFileSync, readdirSync, existsSync } from "node:fs";
import { basename, join } from "node:path";
import type { LevelDefinition, LevelMeta, LevelPoolFile } from "./types.js";
import { ContentError } from "./types.js";
import type { Palette } from "./palette.js";
import { loadPalette } from "./palette.js";
import type { Biomes } from "./biomes.js";
import { loadBiomes } from "./biomes.js";
import { validateMeta } from "./meta.js";
import { parseLevel } from "./parseMap.js";

export interface ContentIndex {
  rootDir: string;
  palette: Palette;
  biomes: Biomes;
  pool: LevelPoolFile;
  /** Level ids discovered under `levels/`. */
  levelIds: string[];
}

function readJson(path: string): unknown {
  if (!existsSync(path)) {
    throw new ContentError("MISSING_FILE", `missing required file ${path}`, { path });
  }
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    throw new ContentError("MISSING_FILE", `cannot parse JSON at ${path}: ${(e as Error).message}`, { path });
  }
}

/** Validate `level-pool.json` shape (fork-vote DESIGN §5.1). */
export function validatePool(raw: unknown, path = "level-pool.json"): LevelPoolFile {
  if (typeof raw !== "object" || raw === null) {
    throw new ContentError("POOL_INVALID", "level-pool.json must be an object", { path });
  }
  const pool = raw as LevelPoolFile;
  if (typeof pool.version !== "number") {
    throw new ContentError("POOL_INVALID", "level-pool.json missing numeric `version`", { path });
  }
  if (typeof pool.hoardId !== "string" || pool.hoardId.length === 0) {
    throw new ContentError("POOL_INVALID", "level-pool.json missing `hoardId`", { path });
  }
  if (!Array.isArray(pool.playablePool) || !pool.playablePool.every((id) => typeof id === "string")) {
    throw new ContentError("POOL_INVALID", "level-pool.json `playablePool` must be a string array", { path });
  }
  if (typeof pool.levelsAfterHoardDefault !== "number" || pool.levelsAfterHoardDefault < 1) {
    throw new ContentError("POOL_INVALID", "level-pool.json `levelsAfterHoardDefault` must be >= 1", { path });
  }
  return pool;
}

/** Discover palette, biomes, pool and level folders under a content root. */
export function loadContentRoot(rootDir: string): ContentIndex {
  const palette = loadPalette(readJson(join(rootDir, "palette.json")), join(rootDir, "palette.json"));
  const biomes = loadBiomes(readJson(join(rootDir, "biomes.json")), join(rootDir, "biomes.json"));
  const pool = validatePool(readJson(join(rootDir, "level-pool.json")), join(rootDir, "level-pool.json"));
  const levelsDir = join(rootDir, "levels");
  const levelIds = existsSync(levelsDir)
    ? readdirSync(levelsDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort()
    : [];
  return { rootDir, palette, biomes, pool, levelIds };
}

/** Read + validate one level folder's meta.json (id must match folder). */
export function loadMetaFromDir(dir: string): LevelMeta {
  const folderId = basename(dir);
  const metaPath = join(dir, "meta.json");
  return validateMeta(readJson(metaPath), folderId, metaPath);
}

/** Tooling entry: parse one `content/levels/<id>` folder. */
export function loadLevelFromDir(dir: string, deps: { palette: Palette; biomes: Biomes }): LevelDefinition {
  const meta = loadMetaFromDir(dir);
  const mapPath = join(dir, "map.png");
  if (!existsSync(mapPath)) {
    throw new ContentError("MISSING_FILE", `missing ${mapPath}`, { path: mapPath, levelId: meta.id });
  }
  const mapPng = readFileSync(mapPath);
  return parseLevel({ mapPng, meta, palette: deps.palette, biomes: deps.biomes, path: mapPath });
}

/** Parse + validate one level by id from a content index. */
export function loadLevel(index: ContentIndex, levelId: string): LevelDefinition {
  return loadLevelFromDir(join(index.rootDir, "levels", levelId), index);
}
