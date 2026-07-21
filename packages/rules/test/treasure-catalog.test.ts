/**
 * C07-T04/T05 — Treasure catalog + set definitions (RULE-12).
 */
import { describe, expect, it } from "vitest";
import {
  getSetDef,
  getTreasureDef,
  listModifierDefs,
  listSetDefs,
  listTreasureDefs,
} from "../src/index.js";

describe("treasure catalog (C07-T04)", () => {
  it("snapshots common ids and GP values (§6.2)", () => {
    const commons = listTreasureDefs()
      .filter((d) => d.rarity === "common")
      .map((d) => [d.id, d.baseValueGp]);
    expect(commons).toEqual([
      ["stone_icon", 5],
      ["coin_sack", 20],
      ["brass_watch", 20],
      ["bronze_icon", 50],
      ["bronze_charm", 50],
      ["gold_watch", 75],
      ["big_coin_sack", 100],
      ["silver_icon", 100],
      ["sculpture", 150],
      ["giant_coin_sack", 200],
      ["wooden_chest", 0],
      ["silver_chest", 0],
    ]);
  });

  it("snapshots rare ids and GP values (§6.3)", () => {
    const rares = listTreasureDefs()
      .filter((d) => d.rarity === "rare")
      .map((d) => [d.id, d.baseValueGp]);
    expect(rares).toEqual([
      ["gold_icon", 250],
      ["opal_icon", 350],
      ["gemstone", 500],
      ["crown", 750],
      ["marble_icon", 800],
      ["gold_chest", 0],
      ["magic_chest", 0],
    ]);
  });

  it("snapshots unique ids and GP values (§6.4)", () => {
    const uniques = listTreasureDefs()
      .filter((d) => d.rarity === "unique")
      .map((d) => [d.id, d.baseValueGp]);
    expect(uniques).toEqual([
      ["goat_icon", 800],
      ["supply_crate", 800],
      ["giants_ring", 900],
      ["nes_cartridge", 1000],
      ["magic_scepter", 1000],
      ["question_block", 1000],
      ["ruby_crown", 1200],
      ["e_tank", 1200],
      ["crystal_skull", 1500],
      ["magic_hourglass", 1500],
    ]);
    expect(listTreasureDefs().filter((d) => d.rarity === "unique")).toSatisfy(
      (defs: { unique: boolean }[]) => defs.every((d) => d.unique),
    );
  });

  it("flags goat_icon as the Jammy item (A3)", () => {
    expect(getTreasureDef("goat_icon")?.flags?.goatOnPole).toBe(true);
  });

  it("coin sacks have stackableVisual false; other commons true", () => {
    for (const id of ["coin_sack", "big_coin_sack", "giant_coin_sack"]) {
      expect(getTreasureDef(id)?.stackableVisual, id).toBe(false);
    }
    expect(getTreasureDef("stone_icon")?.stackableVisual).toBe(true);
  });

  it("chest shells have isChest and chestTable", () => {
    for (const id of [
      "wooden_chest",
      "silver_chest",
      "gold_chest",
      "magic_chest",
    ]) {
      const def = getTreasureDef(id);
      expect(def?.isChest, id).toBe(true);
      expect(def?.chestTable, id).toBe(id);
    }
  });

  it("getTreasureDef returns undefined for unknown ids", () => {
    expect(getTreasureDef("nope")).toBeUndefined();
  });
});

describe("set definitions (C07-T05)", () => {
  it("defines all 7 sets with design values (§6.5)", () => {
    const sets = listSetDefs().map((s) => [
      s.id,
      s.pieceDefIds.length,
      s.pieceBaseValueGp,
      s.setBonusPercent,
    ]);
    expect(sets).toEqual([
      ["suit_of_armor", 4, 150, 10],
      ["haul_icons", 4, 300, 200],
      ["celestial_markers", 3, 300, 150],
      ["divine_suits", 4, 250, 50],
      ["song_of_fire_and_ice", 2, 500, 50],
      ["the_box", 5, 300, 500],
      ["vegetables", 4, 50, 2000],
    ]);
  });

  it("every piece def exists in the catalog with matching setId and value", () => {
    for (const set of listSetDefs()) {
      for (const pieceId of set.pieceDefIds) {
        const def = getTreasureDef(pieceId);
        expect(def, pieceId).toBeDefined();
        expect(def?.rarity).toBe("set");
        expect(def?.setId).toBe(set.id);
        expect(def?.baseValueGp).toBe(set.pieceBaseValueGp);
        expect(def?.unique).toBe(true);
      }
    }
    expect(getSetDef("vegetables")?.pieceDefIds).toContain("veg_onion");
  });

  it("modifier catalog has exactly 28 defs (C07-T13)", () => {
    expect(listModifierDefs()).toHaveLength(28);
  });
});
