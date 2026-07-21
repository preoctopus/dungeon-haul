/**
 * C07-T06/T07 — computeInventoryValue (RULE-06..11).
 */
import { describe, expect, it } from "vitest";
import { computeInventoryValue, buildRankings } from "../src/index.js";
import type { SetDef } from "../src/index.js";
import { inst, makeSeat } from "./helpers/fixtures.js";

describe("computeInventoryValue — non-set (C07-T06)", () => {
  it("RULE-06: empty inventories → zero everywhere", () => {
    const result = computeInventoryValue([
      { seatId: 0, items: [] },
      { seatId: 1, items: [] },
      { seatId: 2, items: [] },
      { seatId: 3, items: [] },
    ]);
    expect(result.totalGp).toBe(0);
    expect(result.perSeatGp).toEqual([
      { seatId: 0, gp: 0 },
      { seatId: 1, gp: 0 },
      { seatId: 2, gp: 0 },
      { seatId: 3, gp: 0 },
    ]);
    expect(result.setCompletions).toEqual([]);
  });

  it("RULE-07: sums base values and honors valueOverrideGp", () => {
    const result = computeInventoryValue([
      { seatId: 0, items: [inst("stone_icon"), inst("gemstone", 42)] },
      { seatId: 1, items: [inst("gold_watch")] },
    ]);
    expect(result.perSeatGp).toEqual([
      { seatId: 0, gp: 5 + 42 },
      { seatId: 1, gp: 75 },
    ]);
    expect(result.totalGp).toBe(122);
  });

  it("accepts a flat TreasureInstance[] (share-modifier-api form) as seat 0", () => {
    const result = computeInventoryValue([inst("crown"), inst("stone_icon")]);
    expect(result.totalGp).toBe(755);
    expect(result.perSeatGp).toEqual([{ seatId: 0, gp: 755 }]);
  });

  it("throws on unknown defId", () => {
    expect(() =>
      computeInventoryValue([{ seatId: 0, items: [inst("bogus")] }]),
    ).toThrow(/unknown defId/);
  });
});

describe("set completion supersession (C07-T07)", () => {
  it("RULE-08: incomplete set pieces contribute piece base values", () => {
    const result = computeInventoryValue([
      {
        seatId: 0,
        items: [inst("armor_helmet"), inst("armor_breastplate")],
      },
      { seatId: 1, items: [inst("armor_greaves")] },
    ]);
    // 3 of 4 Suit of Armor pieces → 150 each, no completion.
    expect(result.perSeatGp).toEqual([
      { seatId: 0, gp: 300 },
      { seatId: 1, gp: 150 },
    ]);
    expect(result.setCompletions).toEqual([]);
  });

  it("RULE-09: complete Vegetables supersedes bases with +2000% bonus", () => {
    const result = computeInventoryValue([
      {
        seatId: 0,
        items: [
          inst("veg_turnip"),
          inst("veg_green_pepper"),
          inst("veg_pumpkin"),
          inst("veg_onion"),
        ],
      },
    ]);
    // floor(50 * 4 * (100 + 2000) / 100) = 4200 — not 200 base sum.
    expect(result.totalGp).toBe(4200);
    expect(result.setCompletions).toHaveLength(1);
    const completion = result.setCompletions[0]!;
    expect(completion.setId).toBe("vegetables");
    expect(completion.setGrossGp).toBe(4200);
    expect(completion.bonusGp).toBe(4000);
    expect(completion.contributors).toEqual([
      { seatId: 0, pieces: 4, awardedGp: 4200 },
    ]);
  });

  it("RULE-10: multi-contributor HAUL Icons split by pieces held", () => {
    const result = computeInventoryValue([
      { seatId: 0, items: [inst("haul_h"), inst("haul_a")] },
      { seatId: 1, items: [inst("haul_u")] },
      { seatId: 2, items: [inst("haul_l")] },
      { seatId: 3, items: [] },
    ]);
    // gross = floor(300 * 4 * 300 / 100) = 3600; split 2/1/1.
    expect(result.setCompletions[0]?.contributors).toEqual([
      { seatId: 0, pieces: 2, awardedGp: 1800 },
      { seatId: 1, pieces: 1, awardedGp: 900 },
      { seatId: 2, pieces: 1, awardedGp: 900 },
    ]);
    expect(result.perSeatGp).toEqual([
      { seatId: 0, gp: 1800 },
      { seatId: 1, gp: 900 },
      { seatId: 2, gp: 900 },
      { seatId: 3, gp: 0 },
    ]);
    expect(result.totalGp).toBe(3600);
  });

  it("remainder GP goes to most pieces, tie → lowest seatId (custom set)", () => {
    const testSet: SetDef = {
      id: "test_trio",
      name: "Test Trio",
      pieceDefIds: ["veg_turnip", "veg_green_pepper", "veg_pumpkin"],
      pieceBaseValueGp: 10,
      setBonusPercent: 5,
    };
    // gross = floor(10 * 3 * 105 / 100) = 31; 2 pieces → floor(62/3)=20,
    // 1 piece → floor(31/3)=10; remainder 1 → seat with most pieces (0).
    const result = computeInventoryValue(
      [
        { seatId: 0, items: [inst("veg_turnip"), inst("veg_green_pepper")] },
        { seatId: 1, items: [inst("veg_pumpkin")] },
      ],
      [testSet],
    );
    expect(result.setCompletions[0]?.contributors).toEqual([
      { seatId: 0, pieces: 2, awardedGp: 21 },
      { seatId: 1, pieces: 1, awardedGp: 10 },
    ]);
    expect(result.totalGp).toBe(31);

    // Equal pieces (1/1/1): remainder → lowest seatId.
    const even = computeInventoryValue(
      [
        { seatId: 1, items: [inst("veg_turnip")] },
        { seatId: 2, items: [inst("veg_green_pepper")] },
        { seatId: 3, items: [inst("veg_pumpkin")] },
      ],
      [testSet],
    );
    expect(even.setCompletions[0]?.contributors).toEqual([
      { seatId: 1, pieces: 1, awardedGp: 11 },
      { seatId: 2, pieces: 1, awardedGp: 10 },
      { seatId: 3, pieces: 1, awardedGp: 10 },
    ]);
  });

  it("RULE-11: Breadwinner ranking uses post-set-supersession seat GP", () => {
    const seats = [
      makeSeat(0, {
        inventory: [
          inst("veg_turnip"),
          inst("veg_green_pepper"),
          inst("veg_pumpkin"),
          inst("veg_onion"),
        ],
      }),
      makeSeat(1, { inventory: [inst("marble_icon")] }), // 800 gp
      makeSeat(2),
      makeSeat(3),
    ];
    // Base sum for seat 0 is only 200 gp, but post-set it is 4200 gp.
    const ranking = buildRankings(seats);
    expect(ranking.mostTreasureValue).toEqual([0]);
  });
});
