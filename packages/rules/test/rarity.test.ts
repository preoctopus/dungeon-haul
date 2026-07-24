/**
 * Tests for packages/rules/src/treasure/rarity.ts — rarityForRoll() edge cases.
 */

import { describe, expect, it } from "vitest";
import { rarityForRoll } from "../src/treasure/rarity.js";

describe("rarityForRoll()", () => {
  describe("valid range [0, 100)", () => {
    it.each([
      [0, "common"],     // first band
      [64, "common"],   // last common point
      [65, "rare"],     // start of rare band
      [84, "rare"],     // last rare point
      [85, "unique"],   // start of unique
      [89, "unique"],   // last unique point
      [90, "set"],      // start of set
      [99, "set"],      // last set point
    ])("rollPoint %d → %s", (point, expected) => {
      expect(rarityForRoll(point)).toBe(expected);
    });

    it("returns 'common' at rollPoint 0", () => {
      expect(rarityForRoll(0)).toBe("common");
    });

    it("returns 'set' at rollPoint 99 (last point)", () => {
      expect(rarityForRoll(99)).toBe("set");
    });
  });

  describe("out-of-range clamping", () => {
    it("returns 'set' when rollPoint === 100 (exactly at boundary)", () => {
      // The loop exits without matching, falls through to return "set"
      expect(rarityForRoll(100)).toBe("set");
    });

    it("returns 'set' when rollPoint > 100", () => {
      expect(rarityForRoll(150)).toBe("set");
      expect(rarityForRoll(999)).toBe("set");
    });

    it("handles negative rollPoints (loop exits immediately)", () => {
      // -1 < cumulative after first iteration (65), so returns "common"
      expect(rarityForRoll(-1)).toBe("common");
      expect(rarityForRoll(-100)).toBe("common");
    });
  });

  describe("defensive behavior", () => {
    it("returns 'common' for rollPoint in first band (normal behavior)", () => {
      expect(rarityForRoll(50)).toBe("common");
    });

    it("does not throw or hang on edge case inputs", () => {
      // Verify no exceptions are thrown for boundary values.
      expect(() => rarityForRoll(-1000)).not.toThrow();
      expect(() => rarityForRoll(10000)).not.toThrow();
    });
  });

  describe("boundary precision", () => {
    it("does not return 'rare' for rollPoint 64 (still common)", () => {
      expect(rarityForRoll(64)).not.toBe("rare");
    });

    it("does not return 'unique' for rollPoint 84 (still rare)", () => {
      expect(rarityForRoll(84)).not.toBe("unique");
    });

    it("does not return 'set' for rollPoint 89 (still unique)", () => {
      expect(rarityForRoll(89)).not.toBe("set");
    });
  });
});
