/**
 * PlayerStats bookkeeping (simulation DESIGN §11). The sim accumulates the
 * counters the rules-engine share modifiers read; end scoring (P4) consumes a
 * frozen copy. This module only owns construction + a couple of pure helpers;
 * the sim tick mutates the returned object in place.
 */
import type { PlayerStats, SeatId } from "@dhaul/rules";

/** Fresh zeroed stats for a seat at run start. */
export function createPlayerStats(): PlayerStats {
  return {
    exitsFirstCount: 0,
    exitsLastCount: 0,
    alwaysFirstExit: true,
    alwaysLastExit: true,
    treasureRecoveredValueGp: 0,
    treasureLostCount: 0,
    itemsHauledCount: 0,
    setPiecesInCompletedSets: 0,
    lostSetItemDuringEscape: false,
    airTimeTicks: 0,
    groundTimeTicks: 0,
    trapsHit: 0,
    hitsDealt: 0,
    hitsTaken: 0,
    playersHitSeatIds: [],
    stunnedOrHurtCount: 0,
    humanControlTicks: 0,
    aiControlTicks: 0,
    controlSwaps: 0,
    onlyHumanForWholeGame: false,
    hoardExitItemCount: 0,
    finalItemCount: 0,
    onlyChestsRecovered: false,
    onlyCommonRecovered: false,
    speedZeroFromWeight: false,
    goatOnPole: false,
    successfullyExited: false,
  };
}

/** Record a distinct seat this player hit (Disciplinarian). */
export function recordPlayerHit(stats: PlayerStats, targetSeatId: SeatId): void {
  if (!stats.playersHitSeatIds.includes(targetSeatId)) {
    stats.playersHitSeatIds.push(targetSeatId);
  }
}
