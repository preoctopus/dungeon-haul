// C-09 Level Content Loader — shared content types.
//
// TODO(level-format.md): `LevelDefinition` and friends are defined here for
// P1. Protocol/shared placement (e.g. @dhaul/protocol) is decided at P2
// integration; keep this file free of Phaser/Colyseus/protocol imports.
//
// World coordinates are y-down (Phaser default). World placement of a body
// cell is `(cellX * blockSizePx, cellY * blockSizePx)` with origin at the
// top-left of the body grid (docs/interfaces/level-format.md).

/** Seven biome ids (design §3.1; DESIGN §4). UI may show "Hoard" for `gold`. */
export type Biome =
  | "gold"
  | "outside"
  | "dungeon"
  | "lava"
  | "ice"
  | "cavern"
  | "mist";

export const BIOMES: readonly Biome[] = [
  "gold",
  "outside",
  "dungeon",
  "lava",
  "ice",
  "cavern",
  "mist",
];

/** Midground body cell types emitted into `LevelDefinition.cells`. */
export type CellType =
  | "empty"
  | "brick"
  | "ice"
  | "sand"
  | "switch"
  | "heavy_switch"
  | "spikes"
  | "crumbling"
  | "receding"
  | "lightning_cycle"
  | "lightning_switch"
  | "gas_switch"
  | "falling_rock_spawner"
  | "golem_spawn"
  | "phantom_spawn"
  | "exit";

/**
 * Palette semantics are cell types plus loader-consumed markers that never
 * appear in the body grid directly (spawns, treasure slots), the spacer
 * gutter color, and decorative ids.
 */
export type CellSemantic =
  | CellType
  | "spacer"
  | "treasure_slot"
  | "player_spawn_0"
  | "player_spawn_1"
  | "player_spawn_2"
  | "player_spawn_3"
  | `near_bg_${string}`
  | `fore_${string}`;

/** Decorative id as it appears in palette (`near_bg_*` / `fore_*`); null = empty cell. */
export type DecorativeId = string;

export type RarityFilter = "world" | "common" | "rare" | "unique" | "set";

export interface Vec2 {
  x: number;
  y: number;
}

/** Axis-aligned box in world pixels, y-down. */
export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TreasureSlot {
  /** Body cell coords. */
  x: number;
  y: number;
  /** Optional rarity band; sim rolls identity at session seed (never here). */
  filter?: RarityFilter;
}

export interface SwitchLink {
  switchId: string;
  targetIds: string[];
}

/** Material flags passed through to the sim (DESIGN §7.3); no behavior here. */
export interface CellFlags {
  solid: boolean;
  friction?: "low" | "high";
  trap?: string;
}

export const CELL_FLAGS: Record<CellType, CellFlags> = {
  empty: { solid: false },
  brick: { solid: true },
  ice: { solid: true, friction: "low" },
  sand: { solid: true, friction: "high" },
  switch: { solid: true },
  heavy_switch: { solid: true },
  spikes: { solid: true, trap: "spikes" },
  crumbling: { solid: true, trap: "crumbling" },
  receding: { solid: true, trap: "receding" },
  lightning_cycle: { solid: false, trap: "lightning_cycle" },
  lightning_switch: { solid: false, trap: "lightning_switch" },
  gas_switch: { solid: false, trap: "gas_switch" },
  falling_rock_spawner: { solid: false, trap: "falling_rock" },
  golem_spawn: { solid: false },
  phantom_spawn: { solid: false },
  exit: { solid: false },
};

export interface Parallax {
  farScroll: number;
  nearScroll: number;
  foreScroll: number;
}

/** Default parallax factors (design §3.3 / DESIGN §6.4). */
export const DEFAULT_PARALLAX: Parallax = {
  farScroll: 0.5,
  nearScroll: 1.0,
  foreScroll: 1.25,
};

/** Per-level `meta.json` sidecar (DESIGN §5.1). */
export interface LevelMeta {
  id: string;
  displayName: string;
  biome: Biome;
  blockSizePx: number;
  version: number;
  pathTags?: string[];
  musicId?: string;
  forkTheme?: Biome | null;
  treasureSlotDefaultRarity?: RarityFilter;
  poolEligible?: boolean;
  switchLinks?: SwitchLink[];
  /** Debug only; CI forbids (DESIGN §6.3). */
  allowHeaderMismatch?: boolean;
  /** Pure unit fixtures only (DESIGN §9.2). */
  skipExitValidation?: boolean;
}

/** Deterministic parse output (DESIGN §9). */
export interface LevelDefinition {
  id: string;
  displayName: string;
  biome: Biome;
  blockSizePx: number;
  /** Body cells (image width − 1). */
  width: number;
  /** Body cells (image height − 4). */
  height: number;
  /** `cells[y][x]`, body only, y-down. */
  cells: CellType[][];
  /** Length = width; row 1 decorative strip (null = empty). */
  nearBg: (DecorativeId | null)[];
  /** Length = width; row H−1 decorative strip (null = empty). */
  fore: (DecorativeId | null)[];
  /** Always 4 seats, body cell coords. */
  spawns: [Vec2, Vec2, Vec2, Vec2];
  /** Union of exit cells in world px, y-down. Zero-size iff skipExitValidation. */
  exit: AABB;
  treasureSlots: TreasureSlot[];
  switchLinks: SwitchLink[];
  parallax: Parallax;
  musicId: string;
  tilesetKey: string;
  farBgKey: string;
  /** sha256 of map bytes + meta + palette slice, for net cache identity. */
  contentHash: string;
  version: number;
}

/** `content/biomes.json` entry (DESIGN §5.3). */
export interface BiomeInfo {
  headerRgb: string;
  tilesetKey: string;
  farBgKey: string;
  defaultMusicId: string;
}

export type BiomesTable = Record<Biome, BiomeInfo>;

/** `content/palette.json` (DESIGN §5.2). */
export interface PaletteFile {
  version: number;
  /** "#RRGGBB" → CellSemantic. Unmapped colors are a parse error (fail closed). */
  colors: Record<string, CellSemantic>;
}

/** `content/level-pool.json` (fork-vote DESIGN §5.1 shape; Q4-A / Q8-A). */
export interface LevelPoolFile {
  version: number;
  hoardId: string;
  playablePool: string[];
  levelsAfterHoardDefault: number;
}

export type ContentErrorCode =
  | "UNKNOWN_COLOR"
  | "BIOME_MISMATCH"
  | "MISSING_EXIT"
  | "BAD_DIMENSIONS"
  | "BAD_ALPHA"
  | "BAD_PNG"
  | "META_ID_MISMATCH"
  | "META_INVALID"
  | "INVALID_CELL"
  | "DECORATIVE_INVALID"
  | "DUPLICATE_SPAWN"
  | "NO_SAFE_SPAWN"
  | "POOL_UNKNOWN_LEVEL"
  | "POOL_INELIGIBLE_LEVEL"
  | "PALETTE_INVALID"
  | "BIOMES_INVALID"
  | "POOL_INVALID"
  | "MISSING_FILE";

export interface PixelRef {
  /** Image (not body) coordinates. */
  x: number;
  y: number;
  rgb: string;
}

export class ContentError extends Error {
  readonly code: ContentErrorCode;
  readonly levelId: string | undefined;
  readonly path: string | undefined;
  readonly pixel: PixelRef | undefined;

  constructor(
    code: ContentErrorCode,
    message: string,
    opts: { levelId?: string; path?: string; pixel?: PixelRef } = {},
  ) {
    super(message);
    this.name = "ContentError";
    this.code = code;
    this.levelId = opts.levelId;
    this.path = opts.path;
    this.pixel = opts.pixel;
  }
}

export interface ContentIssue {
  code: ContentErrorCode;
  message: string;
  levelId?: string;
  path?: string;
  pixel?: PixelRef;
}

export interface ValidationReport {
  errors: ContentIssue[];
  warnings: ContentIssue[];
  /** Level ids that parsed successfully. */
  levels: string[];
}
