/** Content-pack access for the server (consumer of @dhaul/levels only). */

import { fileURLToPath } from "node:url";
import {
  loadContentRoot,
  loadLevel,
  type ContentIndex,
  type LevelDefinition,
} from "@dhaul/levels";
import type { ForkLevelMeta } from "./sim/fork.js";

// src/content.ts and dist/content.js both sit two levels below the repo root.
const DEFAULT_ROOT = fileURLToPath(new URL("../../content", import.meta.url));

export function contentRootDir(): string {
  return process.env["DHAUL_CONTENT_ROOT"] ?? DEFAULT_ROOT;
}

let indexCache: ContentIndex | undefined;

function contentIndex(): ContentIndex {
  if (!indexCache) indexCache = loadContentRoot(contentRootDir());
  return indexCache;
}

const cache = new Map<string, LevelDefinition>();

export function getLevel(levelId: string): LevelDefinition {
  let level = cache.get(levelId);
  if (!level) {
    level = loadLevel(contentIndex(), levelId);
    cache.set(levelId, level);
  }
  return level;
}

/** Unplayed-pair source for the fork vote (fork-vote DESIGN §5.2). */
export function getPlayablePool(): readonly string[] {
  return contentIndex().pool.playablePool;
}

/** `ForkVoteModule.open()`'s `levelMeta` callback (fork-vote DESIGN §14). */
export function getForkLevelMeta(levelId: string): ForkLevelMeta {
  const level = getLevel(levelId);
  return { biome: level.biome, displayName: level.displayName };
}

/** P2 room level: the empty box net-test level. */
export const P2_LEVEL_ID = "box_level";

/**
 * P4 instructions-phase placeholder level (C06-T22). Reuses the box net-test
 * level rather than introducing new content ahead of scope; humans practice
 * movement here before AI fill begins at Hoard.
 */
export const INSTRUCTIONS_LEVEL_ID = "box_level";

/** P4 Hoard level, loaded when the instructions phase completes. */
export const HOARD_LEVEL_ID = "hoard_01";
