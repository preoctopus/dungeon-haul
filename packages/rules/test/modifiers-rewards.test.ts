/**
 * C07-T14/T15/T16 — Reward predicates (RULE-29..39) + §7.5 edge cases.
 */
import { describe, expect, it } from "vitest";
import { evaluateModifiers } from "../src/index.js";
import {
  deltaOf,
  inst,
  makeCtx,
  makeSeats,
  modifierIds,
} from "./helpers/fixtures.js";

describe("variable rewards (C07-T15)", () => {
  it("RULE-29: Haul delta equals final item count; omitted at 0", () => {
    const seats = makeSeats([
      { stats: { finalItemCount: 7, hoardExitItemCount: 7 } },
      {}, // finalItemCount 0
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "haul")).toBe(7);
    expect(modifierIds(results, 1)).not.toContain("haul");
  });

  it("RULE-30: Collector counts only pieces in COMPLETED party sets", () => {
    const seats = makeSeats([
      {
        // 2 vegetable pieces (set completed party-wide) + 1 armor piece
        // (incomplete set — no collector credit).
        inventory: [
          inst("veg_turnip"),
          inst("veg_green_pepper"),
          inst("armor_helmet"),
        ],
        stats: { finalItemCount: 3, hoardExitItemCount: 3 },
      },
      {
        inventory: [inst("veg_pumpkin"), inst("veg_onion")],
        stats: { finalItemCount: 2, hoardExitItemCount: 2 },
      },
      {},
      {},
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "collector")).toBe(2);
    expect(deltaOf(results, 1, "collector")).toBe(2);
    expect(modifierIds(results, 2)).not.toContain("collector");
  });

  it("Collector omitted when only incomplete sets are held", () => {
    const seats = makeSeats([
      { inventory: [inst("armor_helmet"), inst("armor_greaves")] },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).not.toContain("collector");
  });
});

describe("ranking rewards (C07-T16)", () => {
  it("RULE-31: Leader of the Pack requires alwaysFirstExit AND levels > 0", () => {
    const seats = makeSeats([{ stats: { alwaysFirstExit: true } }]);
    const fired = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(fired, 0, "leader_pack")).toBe(10);

    const lostOne = makeSeats([{ stats: { alwaysFirstExit: false } }]);
    expect(modifierIds(evaluateModifiers(makeCtx(lostOne)), 0)).not.toContain(
      "leader_pack",
    );

    // Zero completed levels → never Leader.
    const noLevels = evaluateModifiers(
      makeCtx(makeSeats([{ stats: { alwaysFirstExit: true } }]), {
        levelsCompleted: 0,
      }),
    );
    expect(modifierIds(noLevels, 0)).not.toContain("leader_pack");
  });

  it("RULE-39: Airhead / Landshark go to distinct max/min airtime seats", () => {
    const seats = makeSeats([
      { stats: { airTimeTicks: 500 } },
      { stats: { airTimeTicks: 100 } },
      { stats: { airTimeTicks: 10 } },
      { stats: { airTimeTicks: 100 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "airhead")).toBe(3);
    expect(modifierIds(results, 0)).not.toContain("landshark");
    expect(deltaOf(results, 2, "landshark")).toBe(3);
    expect(modifierIds(results, 2)).not.toContain("airhead");
    expect(modifierIds(results, 1)).not.toContain("airhead");
    expect(modifierIds(results, 1)).not.toContain("landshark");
  });
});

describe("fixed personal rewards (C07-T14)", () => {
  it("RULE-32: My Precious needs hoard 1 → exit 1, successfully exited", () => {
    const fire = makeSeats([
      { stats: { hoardExitItemCount: 1, finalItemCount: 1 } },
    ]);
    expect(deltaOf(evaluateModifiers(makeCtx(fire)), 0, "my_precious")).toBe(5);

    const picked = makeSeats([
      { stats: { hoardExitItemCount: 1, finalItemCount: 2 } },
    ]);
    expect(
      modifierIds(evaluateModifiers(makeCtx(picked)), 0),
    ).not.toContain("my_precious");

    const notExited = makeSeats([
      {
        stats: {
          hoardExitItemCount: 1,
          finalItemCount: 1,
          successfullyExited: false,
        },
      },
    ]);
    expect(
      modifierIds(evaluateModifiers(makeCtx(notExited)), 0),
    ).not.toContain("my_precious");
  });

  it("RULE-33: Success / Softie / Precision fire on their predicates", () => {
    const seats = makeSeats([
      { stats: { hoardExitItemCount: 3, finalItemCount: 3, hitsDealt: 0 } },
      { stats: { successfullyExited: false, hitsDealt: 2 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "success")).toBe(5);
    expect(deltaOf(results, 0, "softie")).toBe(1);
    expect(deltaOf(results, 0, "precision")).toBe(1);
    expect(modifierIds(results, 1)).not.toContain("success");
    expect(modifierIds(results, 1)).not.toContain("softie");
    expect(modifierIds(results, 1)).not.toContain("precision");
  });

  it("RULE-34: Opportunist (+2 items) and Precision are mutually exclusive", () => {
    const opp = makeSeats([
      { stats: { hoardExitItemCount: 1, finalItemCount: 3 } },
    ]);
    const oppResults = evaluateModifiers(makeCtx(opp));
    expect(deltaOf(oppResults, 0, "opportunist")).toBe(2);
    expect(modifierIds(oppResults, 0)).not.toContain("precision");

    const prec = makeSeats([
      { stats: { hoardExitItemCount: 2, finalItemCount: 2 } },
    ]);
    const precResults = evaluateModifiers(makeCtx(prec));
    expect(modifierIds(precResults, 0)).toContain("precision");
    expect(modifierIds(precResults, 0)).not.toContain("opportunist");

    // +1 item is neither.
    const one = makeSeats([
      { stats: { hoardExitItemCount: 1, finalItemCount: 2 } },
    ]);
    const oneResults = evaluateModifiers(makeCtx(one));
    expect(modifierIds(oneResults, 0)).not.toContain("opportunist");
    expect(modifierIds(oneResults, 0)).not.toContain("precision");
  });

  it("RULE-35: Softie and Disciplinarian are mutually exclusive", () => {
    const seats = makeSeats([
      { stats: { hitsDealt: 3, playersHitSeatIds: [1, 2, 3] } },
      { stats: { hitsDealt: 0 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "disciplinarian")).toBe(3);
    expect(modifierIds(results, 0)).not.toContain("softie");
    expect(modifierIds(results, 1)).toContain("softie");
    expect(modifierIds(results, 1)).not.toContain("disciplinarian");
  });

  it("Disciplinarian requires hitting ALL other seats", () => {
    const seats = makeSeats([
      { stats: { hitsDealt: 2, playersHitSeatIds: [1, 2] } },
    ]);
    expect(
      modifierIds(evaluateModifiers(makeCtx(seats)), 0),
    ).not.toContain("disciplinarian");
  });

  it("RULE-36: Jammy fires on stats flag OR goat_icon in inventory", () => {
    const byFlag = makeSeats([{ stats: { goatOnPole: true } }]);
    expect(deltaOf(evaluateModifiers(makeCtx(byFlag)), 0, "jammy")).toBe(1);

    const byItem = makeSeats([
      { inventory: [inst("goat_icon")], stats: { finalItemCount: 1 } },
    ]);
    expect(deltaOf(evaluateModifiers(makeCtx(byItem)), 0, "jammy")).toBe(1);

    const neither = makeSeats();
    expect(
      modifierIds(evaluateModifiers(makeCtx(neither)), 0),
    ).not.toContain("jammy");
  });

  it("RULE-37: Flawless fires only when stunnedOrHurtCount is 0 (MVP A8)", () => {
    const seats = makeSeats([
      { stats: { stunnedOrHurtCount: 0 } },
      { stats: { stunnedOrHurtCount: 1 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "flawless")).toBe(5);
    expect(modifierIds(results, 1)).not.toContain("flawless");
  });

  it("RULE-38: Gambler needs only-chests AND at least one item", () => {
    const seats = makeSeats([
      { stats: { onlyChestsRecovered: true, finalItemCount: 2 } },
      { stats: { onlyChestsRecovered: true, finalItemCount: 0 } },
      { stats: { onlyChestsRecovered: false, finalItemCount: 2 } },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(deltaOf(results, 0, "gambler")).toBe(5);
    expect(modifierIds(results, 1)).not.toContain("gambler");
    expect(modifierIds(results, 2)).not.toContain("gambler");
  });

  it("Gambler + Undiscerning: non-common chest contents keep Undiscerning off", () => {
    const seats = makeSeats([
      {
        stats: {
          onlyChestsRecovered: true,
          onlyCommonRecovered: false, // chest revealed a rare/unique
          finalItemCount: 1,
        },
      },
    ]);
    const results = evaluateModifiers(makeCtx(seats));
    expect(modifierIds(results, 0)).toContain("gambler");
    expect(modifierIds(results, 0)).not.toContain("undiscerning");
  });
});
