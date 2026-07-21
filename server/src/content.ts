/** Content-pack access for the server (consumer of @dhaul/levels only). */

import { fileURLToPath } from "node:url";
import {
  loadContentRoot,
  loadLevel,
  type LevelDefinition,
} from "@dhaul/levels";

// src/content.ts and dist/content.js both sit two levels below the repo root.
const DEFAULT_ROOT = fileURLToPath(new URL("../../content", import.meta.url));

export function contentRootDir(): string {
  return process.env["DHAUL_CONTENT_ROOT"] ?? DEFAULT_ROOT;
}

const cache = new Map<string, LevelDefinition>();

export function getLevel(levelId: string): LevelDefinition {
  let level = cache.get(levelId);
  if (!level) {
    level = loadLevel(loadContentRoot(contentRootDir()), levelId);
    cache.set(levelId, level);
  }
  return level;
}

/** P2 room level: the empty box net-test level. */
export const P2_LEVEL_ID = "box_level";
