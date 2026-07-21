// Programmatic definitions of the committed fixture map.png files so they are
// reproducible (`pnpm --filter @dhaul/levels gen:fixtures`).
import { buildPng } from "./buildPng.js";

// Palette colors (content/palette.json).
export const C = {
  EMPTY: "#FFFFFF",
  SPACER: "#C0C0C0",
  BRICK: "#000000",
  SLOT: "#FFD700",
  SPAWN: ["#FF00FF", "#EE00EE", "#DD00DD", "#CC00CC"],
  EXIT: "#00FFFF",
  NEAR_BG_PILLAR: "#334455",
  FORE_GRASS: "#223344",
  HEADER_GOLD: "#FFC300",
  HEADER_DUNGEON: "#808080",
} as const;

/**
 * box_level — dungeon-biome empty box for netcode tests (C09-T20).
 * 22x10 image → body 21x6: brick floor + walls, 4 spawns, 2-cell exit on the
 * right, no treasure.
 */
export function buildBoxLevelMap(): Buffer {
  const W = 22;
  const H = 10;
  return buildPng(W, H, C.EMPTY, (set) => {
    set(0, 0, C.HEADER_DUNGEON);
    for (let y = 1; y < H; y++) set(0, y, C.SPACER); // col-0 gutter
    for (let x = 1; x < W; x++) set(x, H - 2, C.SPACER); // spacer row
    for (let x = 1; x < W; x++) set(x, 7, C.BRICK); // floor
    for (let y = 2; y <= 6; y++) {
      set(1, y, C.BRICK); // left wall
      set(W - 1, y, C.BRICK); // right wall
    }
    set(W - 2, 5, C.EXIT);
    set(W - 2, 6, C.EXIT);
    C.SPAWN.forEach((hex, seat) => set(3 + seat * 2, 6, hex));
    set(10, 1, C.NEAR_BG_PILLAR);
    set(2, H - 1, C.FORE_GRASS);
    set(3, H - 1, C.FORE_GRASS);
  });
}

/**
 * hoard_01 — gold-biome treasure-slot-rich flat room (C09-T21): 4 spawns on
 * the left, 8 treasure slots along the floor, exit on the right.
 * 34x10 image → body 33x6.
 */
export function buildHoardMap(): Buffer {
  const W = 34;
  const H = 10;
  return buildPng(W, H, C.EMPTY, (set) => {
    set(0, 0, C.HEADER_GOLD);
    for (let y = 1; y < H; y++) set(0, y, C.SPACER);
    for (let x = 1; x < W; x++) set(x, H - 2, C.SPACER);
    for (let x = 1; x < W; x++) set(x, 7, C.BRICK); // floor
    for (let y = 2; y <= 6; y++) {
      set(1, y, C.BRICK); // left wall
      set(W - 1, y, C.BRICK); // right wall
    }
    set(W - 2, 5, C.EXIT); // right-side exit above the floor
    set(W - 2, 6, C.EXIT);
    C.SPAWN.forEach((hex, seat) => set(3 + seat * 2, 6, hex));
    for (let x = 12; x <= 26; x += 2) set(x, 6, C.SLOT); // 8 treasure slots
    for (const x of [8, 16, 24]) set(x, 1, C.NEAR_BG_PILLAR);
    for (const x of [4, 5, 6]) set(x, H - 1, C.FORE_GRASS);
  });
}
