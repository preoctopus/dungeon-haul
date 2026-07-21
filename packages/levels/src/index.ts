// @dhaul/levels — C-09 Level Content Loader (P1).
// Pixel-map parser, palette/biomes tables, content pack loader and validator.
// See docs/components/level-loader/DESIGN.md and docs/interfaces/level-format.md.

export * from "./types.js";
export { loadPalette, isCellType, isKnownSemantic, type Palette } from "./palette.js";
export { loadBiomes, type Biomes } from "./biomes.js";
export { validateMeta } from "./meta.js";
export { parseLevel, MIN_WIDTH, MIN_HEIGHT, MAX_WIDTH, MAX_HEIGHT, type ParseLevelArgs } from "./parseMap.js";
export { contentHash } from "./hash.js";
export {
  loadContentRoot,
  loadLevel,
  loadLevelFromDir,
  loadMetaFromDir,
  validatePool,
  type ContentIndex,
} from "./loadLevel.js";
export { validateContentRoot } from "./validate.js";
