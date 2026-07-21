/**
 * C07-T27 / RULE-59 — Exhaustive modifier matrix: every one of the 28
 * catalog ids has a firing fixture and a non-firing fixture for seat 0.
 */
import { describe, expect, it } from "vitest";
import { evaluateModifiers, listModifierDefs } from "../src/index.js";
import type { ScoreContext } from "../src/index.js";
import { inst, makeCtx, makeSeats, modifierIds } from "./helpers/fixtures.js";
import type { SeatOptions } from "./helpers/fixtures.js";

function ctxOf(
  perSeat: readonly [SeatOptions?, SeatOptions?, SeatOptions?, SeatOptions?],
  levelsCompleted = 2,
): ScoreContext {
  return makeCtx(makeSeats(perSeat), { levelsCompleted });
}

/** For each id: a context where seat 0 fires it, and one where it does not. */
const MATRIX: Record<string, { fire: ScoreContext; noFire: ScoreContext }> = {
  leader_pack: {
    fire: ctxOf([{ stats: { alwaysFirstExit: true } }]),
    noFire: ctxOf([{ stats: { alwaysFirstExit: false } }]),
  },
  breadwinner: {
    fire: ctxOf([{ inventory: [inst("gemstone")] }]),
    noFire: ctxOf([
      { inventory: [inst("stone_icon")] },
      { inventory: [inst("gemstone")] },
    ]),
  },
  airhead: {
    fire: ctxOf([{ stats: { airTimeTicks: 9 } }]),
    noFire: ctxOf([{ stats: { airTimeTicks: 0 } }, { stats: { airTimeTicks: 9 } }]),
  },
  landshark: {
    fire: ctxOf([{ stats: { airTimeTicks: 0 } }, { stats: { airTimeTicks: 9 } }]),
    noFire: ctxOf([
      { stats: { airTimeTicks: 9 } },
      { stats: { airTimeTicks: 0 } },
      { stats: { airTimeTicks: 5 } },
    ]),
  },
  jammy: {
    fire: ctxOf([{ stats: { goatOnPole: true } }]),
    noFire: ctxOf([{}]),
  },
  haul: {
    fire: ctxOf([{ stats: { finalItemCount: 3, hoardExitItemCount: 3 } }]),
    noFire: ctxOf([{ stats: { finalItemCount: 0 } }]),
  },
  collector: {
    fire: ctxOf([
      { inventory: [inst("flame_guitar"), inst("ice_bass")] }, // complete pair
    ]),
    noFire: ctxOf([{ inventory: [inst("flame_guitar")] }]), // incomplete
  },
  my_precious: {
    fire: ctxOf([{ stats: { hoardExitItemCount: 1, finalItemCount: 1 } }]),
    noFire: ctxOf([{ stats: { hoardExitItemCount: 1, finalItemCount: 2 } }]),
  },
  success: {
    fire: ctxOf([{ stats: { successfullyExited: true } }]),
    noFire: ctxOf([{ stats: { successfullyExited: false } }]),
  },
  flawless: {
    fire: ctxOf([{ stats: { stunnedOrHurtCount: 0 } }]),
    noFire: ctxOf([{ stats: { stunnedOrHurtCount: 1 } }]),
  },
  gambler: {
    fire: ctxOf([{ stats: { onlyChestsRecovered: true, finalItemCount: 1 } }]),
    noFire: ctxOf([{ stats: { onlyChestsRecovered: true, finalItemCount: 0 } }]),
  },
  disciplinarian: {
    fire: ctxOf([{ stats: { hitsDealt: 3, playersHitSeatIds: [1, 2, 3] } }]),
    noFire: ctxOf([{ stats: { hitsDealt: 2, playersHitSeatIds: [1, 2] } }]),
  },
  opportunist: {
    fire: ctxOf([{ stats: { hoardExitItemCount: 1, finalItemCount: 3 } }]),
    noFire: ctxOf([{ stats: { hoardExitItemCount: 1, finalItemCount: 2 } }]),
  },
  softie: {
    fire: ctxOf([{ stats: { hitsDealt: 0 } }]),
    noFire: ctxOf([{ stats: { hitsDealt: 1 } }]),
  },
  precision: {
    fire: ctxOf([{ stats: { hoardExitItemCount: 2, finalItemCount: 2 } }]),
    noFire: ctxOf([{ stats: { hoardExitItemCount: 2, finalItemCount: 3 } }]),
  },
  slowpoke: {
    fire: ctxOf([{ stats: { alwaysLastExit: true } }]),
    noFire: ctxOf([{ stats: { alwaysLastExit: false } }]),
  },
  butterfingers: {
    fire: ctxOf([{ stats: { treasureLostCount: 2 } }]),
    noFire: ctxOf([{}]), // all zero → suppressed
  },
  klutz: {
    fire: ctxOf([{ stats: { trapsHit: 2 } }]),
    noFire: ctxOf([{}]),
  },
  whipping_boy: {
    fire: ctxOf([{ stats: { hitsTaken: 2 } }]),
    noFire: ctxOf([{}]),
  },
  big_jerk: {
    fire: ctxOf([{ stats: { hitsDealt: 2 } }]),
    noFire: ctxOf([{}]),
  },
  antisocial: {
    fire: ctxOf([
      { human: true },
      { human: false },
      { human: false },
      { human: false },
    ]),
    noFire: ctxOf([
      { human: true },
      { human: true },
      { human: false },
      { human: false },
    ]),
  },
  unremarkable: {
    // Seat 0: only common titles (stunned once, mid airtime, not breadwinner).
    fire: ctxOf([
      { stats: { stunnedOrHurtCount: 1, airTimeTicks: 1 } },
      { inventory: [inst("gemstone")], stats: { airTimeTicks: 0 } },
      { stats: { airTimeTicks: 2, stunnedOrHurtCount: 1 } },
      { stats: { airTimeTicks: 2, stunnedOrHurtCount: 1 } },
    ]),
    noFire: ctxOf([{}]), // default seat 0 ties Breadwinner/Airhead/… (unique)
  },
  remedial: {
    fire: ctxOf([{ stats: { lostSetItemDuringEscape: true } }]),
    noFire: ctxOf([{}]),
  },
  attention_deficit: {
    fire: ctxOf([{ stats: { controlSwaps: 6 } }]),
    noFire: ctxOf([{ stats: { controlSwaps: 5 } }]),
  },
  greed: {
    fire: ctxOf([{ stats: { speedZeroFromWeight: true } }]),
    noFire: ctxOf([{}]),
  },
  empty_handed: {
    fire: ctxOf([{ stats: { finalItemCount: 0, successfullyExited: true } }]),
    noFire: ctxOf([
      { stats: { finalItemCount: 0, successfullyExited: false } },
    ]),
  },
  undiscerning: {
    fire: ctxOf([{ stats: { onlyCommonRecovered: true, finalItemCount: 1 } }]),
    noFire: ctxOf([
      { stats: { onlyCommonRecovered: true, finalItemCount: 0 } },
    ]),
  },
  autopilot: {
    fire: ctxOf([{ stats: { humanControlTicks: 49, aiControlTicks: 51 } }]),
    noFire: ctxOf([{ stats: { humanControlTicks: 50, aiControlTicks: 50 } }]),
  },
};

describe("modifier matrix 28×2 (RULE-59)", () => {
  it("covers every catalog id", () => {
    const catalogIds = listModifierDefs().map((d) => d.id);
    expect(Object.keys(MATRIX).sort()).toEqual([...catalogIds].sort());
    expect(catalogIds).toHaveLength(28);
  });

  for (const [id, { fire, noFire }] of Object.entries(MATRIX)) {
    it(`${id}: fires for seat 0 in the firing fixture`, () => {
      expect(modifierIds(evaluateModifiers(fire), 0)).toContain(id);
    });
    it(`${id}: absent for seat 0 in the non-firing fixture`, () => {
      expect(modifierIds(evaluateModifiers(noFire), 0)).not.toContain(id);
    });
  }
});
