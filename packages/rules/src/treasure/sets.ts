/**
 * C07-T05 — Set definitions (DESIGN §6.5).
 * Static data; piece defs are generated into the treasure catalog from here.
 */
import type { SetDef } from "../types.js";

export const SET_DEFS: readonly SetDef[] = [
  {
    id: "suit_of_armor",
    name: "Suit of Armor",
    pieceDefIds: [
      "armor_helmet",
      "armor_breastplate",
      "armor_greaves",
      "armor_gauntlets",
    ],
    pieceBaseValueGp: 150,
    setBonusPercent: 10,
  },
  {
    id: "haul_icons",
    name: "HAUL Icons",
    pieceDefIds: ["haul_h", "haul_a", "haul_u", "haul_l"],
    pieceBaseValueGp: 300,
    setBonusPercent: 200,
  },
  {
    id: "celestial_markers",
    name: "Celestial Markers",
    pieceDefIds: ["sun_sculpture", "moon_sculpture", "star_sculpture"],
    pieceBaseValueGp: 300,
    setBonusPercent: 150,
  },
  {
    id: "divine_suits",
    name: "Divine Suits",
    pieceDefIds: ["suit_spade", "suit_club", "suit_heart", "suit_diamond"],
    pieceBaseValueGp: 250,
    setBonusPercent: 50,
  },
  {
    id: "song_of_fire_and_ice",
    name: "Song of Fire and Ice",
    pieceDefIds: ["flame_guitar", "ice_bass"],
    pieceBaseValueGp: 500,
    setBonusPercent: 50,
  },
  {
    id: "the_box",
    name: 'The "Box" set',
    pieceDefIds: ["box_andrew", "box_greg", "box_lindsey", "box_megan", "box_darius"],
    pieceBaseValueGp: 300,
    setBonusPercent: 500,
  },
  {
    id: "vegetables",
    name: "Vegetables",
    pieceDefIds: ["veg_turnip", "veg_green_pepper", "veg_pumpkin", "veg_onion"],
    pieceBaseValueGp: 50,
    setBonusPercent: 2000,
  },
];

export function listSetDefs(): readonly SetDef[] {
  return SET_DEFS;
}

export function getSetDef(setId: string): SetDef | undefined {
  return SET_DEFS.find((s) => s.id === setId);
}
