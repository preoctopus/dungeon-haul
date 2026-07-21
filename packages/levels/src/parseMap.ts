import { PNG } from "pngjs";
import type {
  CellType,
  DecorativeId,
  LevelDefinition,
  LevelMeta,
  SwitchLink,
  TreasureSlot,
  Vec2,
} from "./types.js";
import { CELL_FLAGS, ContentError, DEFAULT_PARALLAX } from "./types.js";
import type { Palette } from "./palette.js";
import { isCellType } from "./palette.js";
import type { Biomes } from "./biomes.js";
import { contentHash } from "./hash.js";

/** Dimension bounds in cells including gutters (DESIGN §6.2 / §12.1). */
export const MIN_WIDTH = 3;
export const MIN_HEIGHT = 5;
export const MAX_WIDTH = 512;
export const MAX_HEIGHT = 64;

export interface ParseLevelArgs {
  /** Raw `map.png` bytes. */
  mapPng: Uint8Array;
  /** Already-validated meta (see `validateMeta`). */
  meta: LevelMeta;
  palette: Palette;
  biomes: Biomes;
  /** Diagnostics only. */
  path?: string;
}

function hexAt(png: PNG, x: number, y: number): { rgb: string; alpha: number } {
  const i = (y * png.width + x) * 4;
  const d = png.data;
  const to2 = (n: number): string => n.toString(16).toUpperCase().padStart(2, "0");
  return {
    rgb: `#${to2(d[i] ?? 0)}${to2(d[i + 1] ?? 0)}${to2(d[i + 2] ?? 0)}`,
    alpha: d[i + 3] ?? 0,
  };
}

/**
 * Parse a pixel map + meta into a deterministic `LevelDefinition`.
 *
 * Row/column policy (DESIGN §6.2, binding):
 *   row 0    header — only (0,0) read (biome key); rest ignored
 *   row 1    near-background decorative strip
 *   rows 2..H-3  midground body (collision + gameplay)
 *   row H-2  spacer — always ignored
 *   row H-1  foreground decorative strip
 *   col 0    spacer gutter — ignored on all rows except header (0,0)
 *
 * Fail closed: unknown colors, header/meta biome mismatch, bad alpha and
 * misplaced semantics all throw `ContentError`. Pure function of bytes +
 * meta + palette + biomes; no RNG.
 */
export function parseLevel(args: ParseLevelArgs): LevelDefinition {
  const { mapPng, meta, palette, biomes } = args;
  const path = args.path ?? `${meta.id}/map.png`;
  const levelId = meta.id;
  const errOpts = { levelId, path };

  let png: PNG;
  try {
    png = PNG.sync.read(Buffer.from(mapPng));
  } catch (e) {
    throw new ContentError("BAD_PNG", `cannot decode PNG: ${(e as Error).message}`, errOpts);
  }

  const W = png.width;
  const H = png.height;
  if (W < MIN_WIDTH || H < MIN_HEIGHT) {
    throw new ContentError(
      "BAD_DIMENSIONS",
      `map is ${W}x${H}; minimum is ${MIN_WIDTH}x${MIN_HEIGHT}`,
      errOpts,
    );
  }
  if (W > MAX_WIDTH || H > MAX_HEIGHT) {
    throw new ContentError(
      "BAD_DIMENSIONS",
      `map is ${W}x${H}; maximum is ${MAX_WIDTH}x${MAX_HEIGHT}`,
      errOpts,
    );
  }

  // Header biome check (DESIGN §6.3).
  const header = hexAt(png, 0, 0);
  const headerBiome = biomes.byHeaderRgb.get(header.rgb);
  if (meta.allowHeaderMismatch !== true) {
    const expectedRgb = biomes.table[meta.biome].headerRgb.toUpperCase();
    if (headerBiome !== meta.biome) {
      throw new ContentError(
        "BIOME_MISMATCH",
        `header pixel (0,0) is ${header.rgb} (${headerBiome ?? "unknown biome"}); ` +
          `meta.biome "${meta.biome}" expects ${expectedRgb}`,
        { ...errOpts, pixel: { x: 0, y: 0, rgb: header.rgb } },
      );
    }
  }

  const width = W - 1;
  const height = H - 4;
  const bodyTop = 2;
  const bodyBottom = H - 3; // inclusive

  const semanticAt = (ix: number, iy: number): string => {
    const { rgb, alpha } = hexAt(png, ix, iy);
    if (alpha !== 255) {
      throw new ContentError("BAD_ALPHA", `pixel (${ix},${iy}) has alpha ${alpha}; body/decorative pixels must be opaque`, {
        ...errOpts,
        pixel: { x: ix, y: iy, rgb },
      });
    }
    const sem = palette.lookup.get(rgb);
    if (sem === undefined) {
      throw new ContentError("UNKNOWN_COLOR", `pixel (${ix},${iy}) color ${rgb} is not in palette`, {
        ...errOpts,
        pixel: { x: ix, y: iy, rgb },
      });
    }
    return sem;
  };

  const cells: CellType[][] = [];
  const treasureSlots: TreasureSlot[] = [];
  const explicitSpawns: (Vec2 | undefined)[] = [undefined, undefined, undefined, undefined];
  const switchCells: { id: string }[] = [];
  let exitMin: Vec2 | undefined;
  let exitMax: Vec2 | undefined;

  const defaultRarity = meta.treasureSlotDefaultRarity ?? "world";

  for (let iy = bodyTop; iy <= bodyBottom; iy++) {
    const by = iy - bodyTop;
    const row: CellType[] = [];
    for (let ix = 1; ix < W; ix++) {
      const bx = ix - 1;
      const sem = semanticAt(ix, iy);
      let cell: CellType;
      if (sem === "spacer") {
        cell = "empty";
      } else if (sem === "treasure_slot") {
        // Slots only; identity is rolled by sim at session seed (DESIGN §8).
        treasureSlots.push(
          defaultRarity === "world" ? { x: bx, y: by } : { x: bx, y: by, filter: defaultRarity },
        );
        cell = "empty";
      } else if (sem.startsWith("player_spawn_")) {
        const seat = Number(sem.slice("player_spawn_".length));
        if (explicitSpawns[seat] !== undefined) {
          throw new ContentError("DUPLICATE_SPAWN", `duplicate player_spawn_${seat} at (${ix},${iy})`, {
            ...errOpts,
            pixel: { x: ix, y: iy, rgb: hexAt(png, ix, iy).rgb },
          });
        }
        explicitSpawns[seat] = { x: bx, y: by };
        cell = "empty";
      } else if (isCellType(sem)) {
        cell = sem;
        if (sem === "exit") {
          exitMin = exitMin ? { x: Math.min(exitMin.x, bx), y: Math.min(exitMin.y, by) } : { x: bx, y: by };
          exitMax = exitMax ? { x: Math.max(exitMax.x, bx), y: Math.max(exitMax.y, by) } : { x: bx, y: by };
        } else if (sem === "switch" || sem === "heavy_switch") {
          switchCells.push({ id: `sw_${bx}_${by}` });
        }
      } else {
        // Decorative color inside body — fail closed.
        throw new ContentError("INVALID_CELL", `pixel (${ix},${iy}) semantic "${sem}" is not valid in body rows`, {
          ...errOpts,
          pixel: { x: ix, y: iy, rgb: hexAt(png, ix, iy).rgb },
        });
      }
      row.push(cell);
    }
    cells.push(row);
  }

  // Decorative strips: row 1 (near-bg) and row H-1 (fore). Only their own
  // prefix, empty or spacer are legal (DESIGN §6.2, C09-T14 hard fail).
  const readDecorative = (iy: number, prefix: "near_bg_" | "fore_"): (DecorativeId | null)[] => {
    const out: (DecorativeId | null)[] = [];
    for (let ix = 1; ix < W; ix++) {
      const sem = semanticAt(ix, iy);
      if (sem === "empty" || sem === "spacer") {
        out.push(null);
      } else if (sem.startsWith(prefix)) {
        out.push(sem);
      } else {
        throw new ContentError(
          "DECORATIVE_INVALID",
          `pixel (${ix},${iy}) semantic "${sem}" is not allowed on the ${prefix}decorative row`,
          { ...errOpts, pixel: { x: ix, y: iy, rgb: hexAt(png, ix, iy).rgb } },
        );
      }
    }
    return out;
  };
  const nearBg = readDecorative(1, "near_bg_");
  const fore = readDecorative(H - 1, "fore_");

  // Exit AABB union in world px, y-down (DESIGN §9.2).
  const bs = meta.blockSizePx;
  let exit = { x: 0, y: 0, width: 0, height: 0 };
  if (exitMin && exitMax) {
    exit = {
      x: exitMin.x * bs,
      y: exitMin.y * bs,
      width: (exitMax.x - exitMin.x + 1) * bs,
      height: (exitMax.y - exitMin.y + 1) * bs,
    };
  } else if (meta.skipExitValidation !== true) {
    throw new ContentError("MISSING_EXIT", "no exit cells in body", errOpts);
  }

  const spawns = resolveSpawns(explicitSpawns, cells, width, errOpts);

  // Switch links: grid-derived ids, meta.switchLinks overrides targets and
  // may add explicit non-local entries (DESIGN §7.4, convention 1).
  const linkById = new Map<string, SwitchLink>();
  for (const s of switchCells) linkById.set(s.id, { switchId: s.id, targetIds: [] });
  for (const l of meta.switchLinks ?? []) linkById.set(l.switchId, { switchId: l.switchId, targetIds: [...l.targetIds] });
  const switchLinks = [...linkById.values()];

  const biomeInfo = biomes.table[meta.biome];
  return {
    id: meta.id,
    displayName: meta.displayName,
    biome: meta.biome,
    blockSizePx: bs,
    width,
    height,
    cells,
    nearBg,
    fore,
    spawns,
    exit,
    treasureSlots,
    switchLinks,
    parallax: { ...DEFAULT_PARALLAX },
    musicId: meta.musicId ?? biomeInfo.defaultMusicId,
    tilesetKey: biomeInfo.tilesetKey,
    farBgKey: biomeInfo.farBgKey,
    contentHash: contentHash(mapPng, meta, palette),
    version: meta.version,
  };
}

/**
 * Spawn resolution (DESIGN §9.1): explicit markers win; missing seats default
 * to standable ledges (empty cell above a solid cell) in the left 25% of the
 * body width, spaced 2 cells apart left-to-right, reusing surfaces (stacked)
 * when there are fewer surfaces than seats. Hard fail if no safe surface.
 */
function resolveSpawns(
  explicit: (Vec2 | undefined)[],
  cells: CellType[][],
  width: number,
  errOpts: { levelId: string; path: string },
): [Vec2, Vec2, Vec2, Vec2] {
  const missing = [0, 1, 2, 3].filter((i) => explicit[i] === undefined);
  if (missing.length > 0) {
    const limit = Math.max(1, Math.floor(width * 0.25));
    const surfaces: Vec2[] = [];
    for (let x = 0; x < limit && x < width; x++) {
      for (let y = 1; y < cells.length; y++) {
        const below = cells[y]?.[x];
        const here = cells[y - 1]?.[x];
        if (below !== undefined && here !== undefined && CELL_FLAGS[below].solid && !CELL_FLAGS[here].solid) {
          surfaces.push({ x, y: y - 1 });
          break;
        }
      }
    }
    if (surfaces.length === 0) {
      throw new ContentError(
        "NO_SAFE_SPAWN",
        "missing player_spawn markers and no safe solid surface in first 25% of width",
        errOpts,
      );
    }
    // Prefer every-2nd-column spacing when enough surfaces exist.
    const spaced = surfaces.filter((_, i) => i % 2 === 0);
    const pickFrom = spaced.length >= missing.length ? spaced : surfaces;
    missing.forEach((seat, i) => {
      const pick = pickFrom[i % pickFrom.length];
      explicit[seat] = { x: pick?.x ?? 0, y: pick?.y ?? 0 };
    });
  }
  return [explicit[0], explicit[1], explicit[2], explicit[3]] as [Vec2, Vec2, Vec2, Vec2];
}
