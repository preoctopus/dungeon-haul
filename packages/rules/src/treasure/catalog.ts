/**
 * C07-T04 — Treasure def catalog (DESIGN §6.2–§6.4).
 * Static in-module data — never file reads. Values are canonical integers
 * from the design document; `bronze_charm` / `opal_icon` are the locked
 * placeholder ids for the unnamed PDF rows (assumption A4).
 */
import type { LootTableId, TreasureDef } from "../types.js";
import { SET_DEFS } from "./sets.js";

function common(
  id: string,
  name: string,
  baseValueGp: number,
  stackableVisual = true,
): TreasureDef {
  return {
    id,
    name,
    rarity: "common",
    baseValueGp,
    stackableVisual,
    unique: false,
    isChest: false,
  };
}

function rare(id: string, name: string, baseValueGp: number): TreasureDef {
  return {
    id,
    name,
    rarity: "rare",
    baseValueGp,
    stackableVisual: true,
    unique: false,
    isChest: false,
  };
}

function uniqueDef(
  id: string,
  name: string,
  baseValueGp: number,
  flags?: TreasureDef["flags"],
): TreasureDef {
  const def: TreasureDef = {
    id,
    name,
    rarity: "unique",
    baseValueGp,
    stackableVisual: true,
    unique: true,
    isChest: false,
  };
  if (flags) def.flags = flags;
  return def;
}

function chest(
  id: string,
  name: string,
  rarity: "common" | "rare",
): TreasureDef {
  return {
    id,
    name,
    rarity,
    baseValueGp: 0,
    stackableVisual: true,
    unique: false,
    isChest: true,
    chestTable: id as LootTableId,
  };
}

const COMMON_DEFS: readonly TreasureDef[] = [
  common("stone_icon", "Stone Icon", 5),
  common("coin_sack", "Coin Sack", 20, false),
  common("brass_watch", "Brass Watch", 20),
  common("bronze_icon", "Bronze Icon", 50),
  common("bronze_charm", "Bronze Charm", 50), // placeholder for unnamed 50 gp PDF row (A4)
  common("gold_watch", "Gold Watch", 75),
  common("big_coin_sack", "Big Coin Sack", 100, false),
  common("silver_icon", "Silver Icon", 100),
  common("sculpture", "Sculpture", 150),
  common("giant_coin_sack", "Giant Coin Sack", 200, false),
  chest("wooden_chest", "Wooden Chest", "common"),
  chest("silver_chest", "Silver Chest", "common"),
];

const RARE_DEFS: readonly TreasureDef[] = [
  rare("gold_icon", "Gold Icon", 250),
  rare("opal_icon", "Opal Icon", 350), // placeholder for unnamed 350 gp PDF row (A4)
  rare("gemstone", "Gemstone", 500),
  rare("crown", "Crown", 750),
  rare("marble_icon", "Marble Icon", 800),
  chest("gold_chest", "Gold Chest", "rare"),
  chest("magic_chest", "Magic Chest", "rare"),
];

const UNIQUE_DEFS: readonly TreasureDef[] = [
  uniqueDef("goat_icon", "Goat Icon", 800, { goatOnPole: true }), // Jammy item (A3)
  uniqueDef("supply_crate", "Supply Crate", 800),
  uniqueDef("giants_ring", "Giant's Ring", 900),
  uniqueDef("nes_cartridge", "NES Cartridge", 1000),
  uniqueDef("magic_scepter", "Magic Scepter", 1000),
  uniqueDef("question_block", "? Block", 1000),
  uniqueDef("ruby_crown", "Ruby Crown", 1200),
  uniqueDef("e_tank", "E-Tank", 1200),
  uniqueDef("crystal_skull", "Crystal Skull", 1500),
  uniqueDef("magic_hourglass", "Magic Hourglass", 1500),
];

/** Set-piece defs derived from SET_DEFS (rarity "set", non-duplicating). */
function pieceName(pieceId: string): string {
  return pieceId
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const SET_PIECE_DEFS: readonly TreasureDef[] = SET_DEFS.flatMap((set) =>
  set.pieceDefIds.map(
    (pieceId, index): TreasureDef => ({
      id: pieceId,
      name: pieceName(pieceId),
      rarity: "set",
      baseValueGp: set.pieceBaseValueGp,
      setId: set.id,
      setPieceIndex: index,
      stackableVisual: true,
      unique: true,
      isChest: false,
    }),
  ),
);

/** Full catalog in stable definition order (DESIGN §14: order is API). */
export const TREASURE_DEFS: readonly TreasureDef[] = [
  ...COMMON_DEFS,
  ...RARE_DEFS,
  ...UNIQUE_DEFS,
  ...SET_PIECE_DEFS,
];

const BY_ID: ReadonlyMap<string, TreasureDef> = new Map(
  TREASURE_DEFS.map((d) => [d.id, d]),
);

export function listTreasureDefs(): readonly TreasureDef[] {
  return TREASURE_DEFS;
}

export function getTreasureDef(defId: string): TreasureDef | undefined {
  return BY_ID.get(defId);
}
