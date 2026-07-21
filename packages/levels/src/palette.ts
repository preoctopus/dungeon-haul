import type { CellSemantic, CellType, PaletteFile } from "./types.js";
import { ContentError } from "./types.js";

const HEX_RE = /^#[0-9A-F]{6}$/;

/** Body-grid cell types (everything in CellType). */
const CELL_TYPES: ReadonlySet<string> = new Set<CellType>([
  "empty",
  "brick",
  "ice",
  "sand",
  "switch",
  "heavy_switch",
  "spikes",
  "crumbling",
  "receding",
  "lightning_cycle",
  "lightning_switch",
  "gas_switch",
  "falling_rock_spawner",
  "golem_spawn",
  "phantom_spawn",
  "exit",
]);

const MARKER_SEMANTICS: ReadonlySet<string> = new Set([
  "spacer",
  "treasure_slot",
  "player_spawn_0",
  "player_spawn_1",
  "player_spawn_2",
  "player_spawn_3",
]);

export function isCellType(sem: string): sem is CellType {
  return CELL_TYPES.has(sem);
}

export function isKnownSemantic(sem: string): sem is CellSemantic {
  return (
    CELL_TYPES.has(sem) ||
    MARKER_SEMANTICS.has(sem) ||
    sem.startsWith("near_bg_") ||
    sem.startsWith("fore_")
  );
}

export interface Palette {
  version: number;
  /** Uppercase "#RRGGBB" → semantic. */
  lookup: ReadonlyMap<string, CellSemantic>;
  /** Raw file, used for content hashing. */
  file: PaletteFile;
}

/** Parse + validate `palette.json` content (fail closed on bad entries). */
export function loadPalette(raw: unknown, path = "palette.json"): Palette {
  if (typeof raw !== "object" || raw === null) {
    throw new ContentError("PALETTE_INVALID", "palette.json must be an object", { path });
  }
  const file = raw as PaletteFile;
  if (typeof file.version !== "number") {
    throw new ContentError("PALETTE_INVALID", "palette.json missing numeric `version`", { path });
  }
  if (typeof file.colors !== "object" || file.colors === null) {
    throw new ContentError("PALETTE_INVALID", "palette.json missing `colors` map", { path });
  }
  const lookup = new Map<string, CellSemantic>();
  for (const [rgb, sem] of Object.entries(file.colors)) {
    const key = rgb.toUpperCase();
    if (!HEX_RE.test(key)) {
      throw new ContentError("PALETTE_INVALID", `palette color key ${rgb} is not #RRGGBB`, { path });
    }
    if (typeof sem !== "string" || !isKnownSemantic(sem)) {
      throw new ContentError(
        "PALETTE_INVALID",
        `palette semantic "${String(sem)}" for ${key} is not a known CellSemantic`,
        { path },
      );
    }
    if (lookup.has(key)) {
      throw new ContentError("PALETTE_INVALID", `duplicate palette color ${key}`, { path });
    }
    lookup.set(key, sem);
  }
  return { version: file.version, lookup, file };
}
