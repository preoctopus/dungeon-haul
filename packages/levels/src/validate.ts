import { join } from "node:path";
import type { ContentIssue, ValidationReport } from "./types.js";
import { ContentError } from "./types.js";
import { loadContentRoot, loadLevelFromDir, loadMetaFromDir } from "./loadLevel.js";

function toIssue(e: unknown, fallbackPath: string): ContentIssue {
  if (e instanceof ContentError) {
    return {
      code: e.code,
      message: e.message,
      ...(e.levelId !== undefined ? { levelId: e.levelId } : {}),
      ...(e.path !== undefined ? { path: e.path } : {}),
      ...(e.pixel !== undefined ? { pixel: e.pixel } : {}),
    };
  }
  return { code: "MISSING_FILE", message: String((e as Error)?.message ?? e), path: fallbackPath };
}

/**
 * Validate an entire content root (CI entry, DESIGN §12).
 * Hard fails: unparseable palette/biomes/pool, level parse errors (unknown
 * color, biome mismatch, missing exit, bad dimensions...), meta.id/folder
 * mismatch, pool references to missing or pool-ineligible levels.
 * Soft warnings: playablePool smaller than 2, zero treasure slots on
 * pool-eligible levels.
 */
export function validateContentRoot(rootDir: string): ValidationReport {
  const errors: ContentIssue[] = [];
  const warnings: ContentIssue[] = [];
  const levels: string[] = [];

  let index;
  try {
    index = loadContentRoot(rootDir);
  } catch (e) {
    errors.push(toIssue(e, rootDir));
    return { errors, warnings, levels };
  }

  const poolEligibleById = new Map<string, boolean>();
  const slotCountById = new Map<string, number>();

  for (const levelId of index.levelIds) {
    const dir = join(rootDir, "levels", levelId);
    try {
      const meta = loadMetaFromDir(dir);
      poolEligibleById.set(levelId, meta.poolEligible !== false);
      if (meta.allowHeaderMismatch === true) {
        errors.push({
          code: "META_INVALID",
          message: "allowHeaderMismatch is debug-only; forbidden in CI (DESIGN §6.3)",
          levelId,
          path: join(dir, "meta.json"),
        });
      }
      const def = loadLevelFromDir(dir, index);
      slotCountById.set(levelId, def.treasureSlots.length);
      levels.push(levelId);
    } catch (e) {
      errors.push(toIssue(e, dir));
    }
  }

  // Pool membership (DESIGN §12.1; C09-T25 subset for P1).
  const { pool } = index;
  if (!poolEligibleById.has(pool.hoardId)) {
    errors.push({
      code: "POOL_UNKNOWN_LEVEL",
      message: `level-pool.json hoardId "${pool.hoardId}" does not exist under levels/`,
      path: join(rootDir, "level-pool.json"),
    });
  }
  for (const id of pool.playablePool) {
    if (!poolEligibleById.has(id)) {
      errors.push({
        code: "POOL_UNKNOWN_LEVEL",
        message: `level-pool.json playablePool references missing level "${id}"`,
        path: join(rootDir, "level-pool.json"),
      });
    } else if (poolEligibleById.get(id) === false) {
      errors.push({
        code: "POOL_INELIGIBLE_LEVEL",
        message: `level-pool.json playablePool references pool-ineligible level "${id}"`,
        levelId: id,
        path: join(rootDir, "level-pool.json"),
      });
    } else if ((slotCountById.get(id) ?? 0) === 0) {
      warnings.push({
        code: "POOL_INVALID",
        message: `pool-eligible level "${id}" has zero treasure slots`,
        levelId: id,
      });
    }
  }
  if (pool.playablePool.length < 2) {
    warnings.push({
      code: "POOL_INVALID",
      message: `playablePool has ${pool.playablePool.length} entries; forks need at least 2 (content lands in P4/P6)`,
      path: join(rootDir, "level-pool.json"),
    });
  }

  return { errors, warnings, levels };
}
