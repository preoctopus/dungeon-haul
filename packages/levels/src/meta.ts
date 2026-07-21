import type { Biome, LevelMeta, RarityFilter } from "./types.js";
import { BIOMES, ContentError } from "./types.js";

const RARITIES: readonly RarityFilter[] = ["world", "common", "rare", "unique", "set"];

/**
 * Validate a parsed `meta.json` object (DESIGN §5.1 / §11.2).
 * `folderId`, when given, must equal `meta.id` (META_ID_MISMATCH).
 */
export function validateMeta(raw: unknown, folderId?: string, path = "meta.json"): LevelMeta {
  const fail = (message: string): never => {
    throw new ContentError("META_INVALID", message, {
      path,
      ...(folderId !== undefined ? { levelId: folderId } : {}),
    });
  };
  if (typeof raw !== "object" || raw === null) fail("meta.json must be an object");
  const meta = raw as LevelMeta;

  if (typeof meta.id !== "string" || meta.id.length === 0) fail("meta.id must be a non-empty string");
  if (typeof meta.displayName !== "string" || meta.displayName.length === 0) {
    fail("meta.displayName must be a non-empty string");
  }
  if (!BIOMES.includes(meta.biome as Biome)) {
    fail(`meta.biome "${String(meta.biome)}" must be one of ${BIOMES.join("|")}`);
  }
  if (typeof meta.blockSizePx !== "number" || !Number.isInteger(meta.blockSizePx) || meta.blockSizePx <= 0) {
    fail("meta.blockSizePx must be a positive integer");
  }
  if (typeof meta.version !== "number") fail("meta.version must be a number");

  if (meta.pathTags !== undefined && !(Array.isArray(meta.pathTags) && meta.pathTags.every((t) => typeof t === "string"))) {
    fail("meta.pathTags must be a string array");
  }
  if (meta.musicId !== undefined && typeof meta.musicId !== "string") fail("meta.musicId must be a string");
  if (meta.forkTheme !== undefined && meta.forkTheme !== null && !BIOMES.includes(meta.forkTheme)) {
    fail("meta.forkTheme must be a biome id or null");
  }
  if (meta.treasureSlotDefaultRarity !== undefined && !RARITIES.includes(meta.treasureSlotDefaultRarity)) {
    fail(`meta.treasureSlotDefaultRarity must be one of ${RARITIES.join("|")}`);
  }
  if (meta.poolEligible !== undefined && typeof meta.poolEligible !== "boolean") {
    fail("meta.poolEligible must be a boolean");
  }
  if (meta.switchLinks !== undefined) {
    const ok =
      Array.isArray(meta.switchLinks) &&
      meta.switchLinks.every(
        (l) =>
          typeof l === "object" &&
          l !== null &&
          typeof l.switchId === "string" &&
          Array.isArray(l.targetIds) &&
          l.targetIds.every((t) => typeof t === "string"),
      );
    if (!ok) fail("meta.switchLinks must be { switchId, targetIds[] }[]");
  }

  if (folderId !== undefined && meta.id !== folderId) {
    throw new ContentError(
      "META_ID_MISMATCH",
      `meta.id "${meta.id}" does not match folder "${folderId}"`,
      { path, levelId: folderId },
    );
  }
  return meta;
}
