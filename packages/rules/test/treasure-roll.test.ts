/**
 * C07-T08/T09/T10 — rollTreasureDef world weights + chest tables
 * (RULE-13..17).
 */
import { describe, expect, it } from "vitest";
import {
  listTreasureDefs,
  rarityForRoll,
  rollTreasureDef,
} from "../src/index.js";
import type { LootTableId, Rarity } from "../src/index.js";
import { SequenceRng, mulberry32 } from "./helpers/rng.js";

const CHEST_TABLES: readonly LootTableId[] = [
  "wooden_chest",
  "silver_chest",
  "gold_chest",
  "magic_chest",
];

describe("world rarity weights (C07-T08)", () => {
  it("maps roll points to 65/20/5/10 bands", () => {
    expect(rarityForRoll(0)).toBe("common");
    expect(rarityForRoll(64)).toBe("common");
    expect(rarityForRoll(65)).toBe("rare");
    expect(rarityForRoll(84)).toBe("rare");
    expect(rarityForRoll(85)).toBe("unique");
    expect(rarityForRoll(89)).toBe("unique");
    expect(rarityForRoll(90)).toBe("set");
    expect(rarityForRoll(99)).toBe("set");
  });

  it("uniform pick within the band follows catalog order", () => {
    // nextInt(100) → 0 = common band; nextInt(pool) → 0 = first common def.
    const def = rollTreasureDef(new SequenceRng([0, 0]), "world", {});
    expect(def.id).toBe("stone_icon");
    // 65 → rare band; index 2 → third rare def (gemstone).
    const rareDef = rollTreasureDef(new SequenceRng([65, 2]), "world", {});
    expect(rareDef.id).toBe("gemstone");
  });

  it("RULE-13: seeded histogram roughly matches 65/20/5/10", () => {
    const rng = mulberry32(0xc0ffee);
    const counts: Record<Rarity, number> = {
      common: 0,
      rare: 0,
      unique: 0,
      set: 0,
    };
    const n = 10_000;
    for (let i = 0; i < n; i++) {
      counts[rollTreasureDef(rng, "world", {}).rarity] += 1;
    }
    expect(counts.common / n).toBeGreaterThan(0.6);
    expect(counts.common / n).toBeLessThan(0.7);
    expect(counts.rare / n).toBeGreaterThan(0.16);
    expect(counts.rare / n).toBeLessThan(0.24);
    expect(counts.unique / n).toBeGreaterThan(0.03);
    expect(counts.unique / n).toBeLessThan(0.07);
    expect(counts.set / n).toBeGreaterThan(0.07);
    expect(counts.set / n).toBeLessThan(0.13);
  });

  it("RULE-14: never rolls an excluded live unique / set piece", () => {
    const excluded = ["crystal_skull", "veg_onion"];
    const rng = mulberry32(1234);
    for (let i = 0; i < 2_000; i++) {
      const def = rollTreasureDef(rng, "world", { excludedDefIds: excluded });
      expect(excluded).not.toContain(def.id);
    }
    const rng2 = mulberry32(99);
    for (const table of CHEST_TABLES) {
      for (let i = 0; i < 500; i++) {
        const def = rollTreasureDef(rng2, table, { excludedDefIds: excluded });
        expect(excluded).not.toContain(def.id);
      }
    }
  });

  it("RULE-17: same seed produces the same roll stream", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const streamA = Array.from(
      { length: 50 },
      () => rollTreasureDef(a, "world", {}).id,
    );
    const streamB = Array.from(
      { length: 50 },
      () => rollTreasureDef(b, "world", {}).id,
    );
    expect(streamA).toEqual(streamB);
  });
});

describe("chest open tables (C07-T09)", () => {
  it("RULE-15: chests never open into other chests", () => {
    const rng = mulberry32(7);
    for (const table of CHEST_TABLES) {
      for (let i = 0; i < 300; i++) {
        expect(rollTreasureDef(rng, table, {}).isChest, table).toBe(false);
      }
    }
  });

  it("wooden chest pool is common ∪ rare only", () => {
    const rng = mulberry32(11);
    for (let i = 0; i < 500; i++) {
      const def = rollTreasureDef(rng, "wooden_chest", {});
      expect(["common", "rare"]).toContain(def.rarity);
    }
  });

  it("silver chest pool is common ∪ rare ∪ unique", () => {
    const rng = mulberry32(12);
    const seen = new Set<Rarity>();
    for (let i = 0; i < 2_000; i++) {
      const def = rollTreasureDef(rng, "silver_chest", {});
      expect(["common", "rare", "unique"]).toContain(def.rarity);
      seen.add(def.rarity);
    }
    expect(seen.has("unique")).toBe(true);
  });

  it("gold chest pool is rare ∪ unique ∪ set", () => {
    const rng = mulberry32(13);
    const seen = new Set<Rarity>();
    for (let i = 0; i < 2_000; i++) {
      const def = rollTreasureDef(rng, "gold_chest", {});
      expect(["rare", "unique", "set"]).toContain(def.rarity);
      seen.add(def.rarity);
    }
    expect(seen).toEqual(new Set(["rare", "unique", "set"]));
  });

  it("RULE-16: magic chest prefers the missing piece of an almost-complete set", () => {
    const def = rollTreasureDef(new SequenceRng([0]), "magic_chest", {
      almostCompleteSets: [{ setId: "vegetables", missingDefId: "veg_onion" }],
    });
    expect(def.id).toBe("veg_onion");
  });

  it("magic chest falls back to uniques when no almost-complete set", () => {
    const rng = mulberry32(14);
    for (let i = 0; i < 300; i++) {
      expect(rollTreasureDef(rng, "magic_chest", {}).rarity).toBe("unique");
    }
  });

  it("magic chest ignores an excluded missing piece", () => {
    const def = rollTreasureDef(new SequenceRng([0]), "magic_chest", {
      almostCompleteSets: [{ setId: "vegetables", missingDefId: "veg_onion" }],
      excludedDefIds: ["veg_onion"],
    });
    expect(def.rarity).toBe("unique");
  });

  it("falls back deterministically when a whole band is excluded", () => {
    // Exclude every unique: silver chest can still roll (common/rare remain);
    // magic chest falls back to rares.
    const allUniques = listTreasureDefs()
      .filter((d) => d.rarity === "unique")
      .map((d) => d.id);
    const silver = rollTreasureDef(new SequenceRng([0]), "silver_chest", {
      excludedDefIds: allUniques,
    });
    expect(silver.rarity === "common" || silver.rarity === "rare").toBe(true);
    const magic = rollTreasureDef(new SequenceRng([0]), "magic_chest", {
      excludedDefIds: allUniques,
    });
    expect(magic.rarity).toBe("rare");
    expect(magic.isChest).toBe(false);
  });
});
