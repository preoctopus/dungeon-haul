/**
 * C07-T08 — World spawn rarity weights (DESIGN §6.1).
 * Common 65 / Rare 20 / Unique 5 / Set 10, in percentage points.
 */
import type { Rarity } from "../types.js";

export interface RarityWeight {
  rarity: Rarity;
  /** Percentage points; all weights sum to 100. */
  weight: number;
}

/** Stable order: cumulative bands are taken in this array order. */
export const WORLD_RARITY_WEIGHTS: readonly RarityWeight[] = [
  { rarity: "common", weight: 65 },
  { rarity: "rare", weight: 20 },
  { rarity: "unique", weight: 5 },
  { rarity: "set", weight: 10 },
];

/** Map a uniform integer in [0, 100) to a rarity band. */
export function rarityForRoll(rollPoint: number): Rarity {
  let cumulative = 0;
  for (const { rarity, weight } of WORLD_RARITY_WEIGHTS) {
    cumulative += weight;
    if (rollPoint < cumulative) return rarity;
  }
  // rollPoint out of range — clamp to last band deterministically.
  return "set";
}
