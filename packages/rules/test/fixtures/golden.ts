/**
 * C07-T26 — Golden haul fixtures (RULE-52..54).
 * Three full 4-seat ScoreReportInput fixtures with hand-computed expected
 * values, versioned against rulesetVersion "1.0.0". If a formula change is
 * intentional, update these AND bump rulesetVersion (DESIGN §14/§15).
 */
import type { ScoreReportInput } from "../../src/index.js";
import { inst, makeSeats } from "../helpers/fixtures.js";
import type { SeatOptions } from "../helpers/fixtures.js";

/** Golden A (RULE-52): four equal humans, identical hauls → 25% each. */
export function goldenA(): ScoreReportInput {
  return {
    sessionId: "golden-a",
    completionToken: "token-a",
    levelsCompleted: 2,
    seats: makeSeats(
      [0, 1, 2, 3].map(
        (seatId): SeatOptions => ({
          human: true,
          inventory: [inst("coin_sack"), inst("gold_watch")], // 95 gp each
          stats: {
            hoardExitItemCount: 2,
            finalItemCount: 2,
            stunnedOrHurtCount: 1,
            airTimeTicks: 100,
            onlyCommonRecovered: true,
            finalExitRank: seatId,
          },
        }),
      ) as [SeatOptions, SeatOptions, SeatOptions, SeatOptions],
    ),
  };
}

export const GOLDEN_A_EXPECTED = {
  totalTreasureGp: 380,
  // Per seat: breadwinner +5, airhead +3, landshark +3 (all four tie),
  // haul +2, success +5, softie +1, precision +1, undiscerning −5 = 15.
  rawShares: [15, 15, 15, 15],
  shares: [15, 15, 15, 15],
  sharePercent: [25, 25, 25, 25],
  takeGp: [95, 95, 95, 95],
  percentageRevealOrder: [2, 1, 3, 0],
  tossOrder: [3, 2, 1, 0],
  eligible: [true, true, true, true],
};

/** Golden B (RULE-53): Vegetables set completed across three seats. */
export function goldenB(): ScoreReportInput {
  return {
    sessionId: "golden-b",
    completionToken: "token-b",
    levelsCompleted: 3,
    seats: makeSeats([
      {
        human: true,
        inventory: [inst("veg_turnip"), inst("veg_green_pepper")],
        stats: {
          hoardExitItemCount: 2,
          finalItemCount: 2,
          stunnedOrHurtCount: 1,
          airTimeTicks: 10,
          finalExitRank: 0,
        },
      },
      {
        human: true,
        inventory: [inst("veg_pumpkin")],
        stats: {
          hoardExitItemCount: 1,
          finalItemCount: 1,
          stunnedOrHurtCount: 1,
          airTimeTicks: 20,
          finalExitRank: 1,
        },
      },
      {
        human: true,
        inventory: [inst("veg_onion")],
        stats: {
          hoardExitItemCount: 1,
          finalItemCount: 1,
          stunnedOrHurtCount: 1,
          airTimeTicks: 30,
          finalExitRank: 2,
        },
      },
      {
        human: true,
        inventory: [inst("gemstone")],
        stats: {
          hoardExitItemCount: 1,
          finalItemCount: 1,
          stunnedOrHurtCount: 1,
          airTimeTicks: 40,
          finalExitRank: 3,
        },
      },
    ]),
  };
}

export const GOLDEN_B_EXPECTED = {
  // Vegetables gross = floor(50*4*2100/100) = 4200 (split 2100/1050/1050)
  // + seat 3 gemstone 500.
  totalTreasureGp: 4700,
  setGrossGp: 4200,
  setBonusGp: 4000,
  contributors: [
    { seatId: 0, pieces: 2, awardedGp: 2100 },
    { seatId: 1, pieces: 1, awardedGp: 1050 },
    { seatId: 2, pieces: 1, awardedGp: 1050 },
  ],
  // seat0: breadwinner5 landshark3 | haul2 collector2 success5 softie1 precision1 = 19
  // seat1: my_precious5 | haul1 collector1 success5 softie1 precision1 = 14
  // seat2: same as seat1 = 14
  // seat3: airhead3 my_precious5 | haul1 success5 softie1 precision1 = 16
  rawShares: [19, 14, 14, 16],
  shares: [19, 14, 14, 16], // total 63
  takeGp: [1418, 1044, 1044, 1194], // floors 1417/1044/1044/1193, rem 2 → seats 0,3
  percentageRevealOrder: [1, 3, 2, 0],
  tossOrder: [3, 2, 1, 0],
  eligible: [true, true, true, true],
};

/** Golden C (RULE-54): sole human + AI autopilot seats + min-share seat. */
export function goldenC(): ScoreReportInput {
  return {
    sessionId: "golden-c",
    completionToken: "token-c",
    levelsCompleted: 2,
    seats: makeSeats([
      {
        human: true,
        inventory: [],
        stats: {
          alwaysFirstExit: true,
          airTimeTicks: 5,
          hitsDealt: 3,
          playersHitSeatIds: [1, 2],
          stunnedOrHurtCount: 0,
          controlSwaps: 6,
          hoardExitItemCount: 0,
          finalItemCount: 0,
          finalExitRank: 0,
        },
      },
      {
        human: false,
        inventory: [inst("crystal_skull")],
        stats: {
          airTimeTicks: 5,
          hitsTaken: 2,
          stunnedOrHurtCount: 2,
          humanControlTicks: 0,
          aiControlTicks: 100,
          hoardExitItemCount: 0,
          finalItemCount: 1,
          finalExitRank: 1,
        },
      },
      {
        human: false,
        inventory: [inst("stone_icon")],
        stats: {
          airTimeTicks: 10,
          hitsTaken: 1,
          stunnedOrHurtCount: 1,
          humanControlTicks: 0,
          aiControlTicks: 100,
          hoardExitItemCount: 1,
          finalItemCount: 1,
          onlyCommonRecovered: true,
          speedZeroFromWeight: true,
          finalExitRank: 2,
        },
      },
      {
        human: false,
        inventory: [],
        stats: {
          airTimeTicks: 10,
          stunnedOrHurtCount: 1,
          humanControlTicks: 0,
          aiControlTicks: 100,
          alwaysLastExit: true,
          successfullyExited: false,
          hoardExitItemCount: 0,
          finalItemCount: 0,
          finalExitRank: 3,
        },
      },
    ]),
  };
}

export const GOLDEN_C_EXPECTED = {
  totalTreasureGp: 1505, // crystal_skull 1500 + stone_icon 5
  // seat0: leader10 landshark3 flawless5 success5 precision1
  //        empty_handed−3 attention_deficit−2 big_jerk−5 antisocial−7 = 7
  // seat1: breadwinner5 landshark3 softie1 success5 haul1
  //        whipping_boy−3 autopilot−5 = 7
  // seat2: airhead3 my_precious5 softie1 success5 haul1 precision1
  //        greed−2 undiscerning−5 autopilot−5 = 4
  // seat3: airhead3 softie1 slowpoke−1 autopilot−5 = −2 → shares 1
  rawShares: [7, 7, 4, -2],
  shares: [7, 7, 4, 1], // total 19
  takeGp: [555, 555, 316, 79], // floors 554/554/316/79, rem 2 → seats 0,1
  percentageRevealOrder: [2, 1, 3, 0],
  tossOrder: [3, 2, 1, 0],
  eligible: [true, false, false, false],
  seat0DisplayModifiers: [
    "leader_pack",
    "landshark",
    "flawless",
    "success",
    "precision",
    "attention_deficit",
    "empty_handed",
    "big_jerk",
    "antisocial",
  ],
  seat3DisplayModifiers: ["airhead", "softie", "autopilot", "slowpoke"],
};
