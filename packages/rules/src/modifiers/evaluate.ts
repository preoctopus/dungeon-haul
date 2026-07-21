/**
 * C07-T14..T20 — evaluateModifiers (DESIGN §7).
 *
 * Pipeline (§7.1):
 * 1. Value inventories (set supersession) → perSeatGp + setCompletions.
 * 2. Ranking buckets come from ctx.ranking (fill via buildRankings upstream).
 * 3. Evaluate every catalog def per seat, in catalog order.
 * 4. Unremarkable runs LAST (after all unique-capable modifiers), then the
 *    applied list is re-sorted back into catalog order.
 * 5. rawShares = Σ deltas; shares = max(1, rawShares).
 *
 * Variable deltas: haul = finalItemCount, collector = set pieces this seat
 * holds in completed party sets. Zero-delta variable modifiers are omitted.
 */
import type {
  AppliedModifier,
  PlayerModifierResult,
  ScoreContext,
  ScoreSeat,
  SeatId,
  SetCompletion,
} from "../types.js";
import { getTreasureDef } from "../treasure/catalog.js";
import { computeInventoryValue } from "../treasure/value.js";
import {
  MODIFIER_CATALOG_INDEX,
  MODIFIER_DEFS,
  getModifierDef,
} from "./catalog.js";
import { isUnremarkable } from "./unremarkable.js";

interface EvalEnv {
  ctx: ScoreContext;
  completedPiecesBySeat: ReadonlyMap<SeatId, number>;
}

function inBucket(bucket: readonly SeatId[], seatId: SeatId): boolean {
  return bucket.includes(seatId);
}

function hasGoatItem(seat: ScoreSeat): boolean {
  return seat.finalInventory.some(
    (item) => getTreasureDef(item.defId)?.flags?.goatOnPole === true,
  );
}

/**
 * Predicate table: returns the concrete deltaShares for a seat, or 0 when the
 * modifier does not apply (0 ⇒ omitted from the applied list).
 */
function evaluateDef(
  id: string,
  seat: ScoreSeat,
  env: EvalEnv,
): number {
  const { ctx } = env;
  const s = seat.stats;
  const ranking = ctx.ranking;
  const fixed = (applies: boolean): number =>
    applies ? (getModifierDef(id)?.deltaShares ?? 0) : 0;

  switch (id) {
    // --- Rewards ---
    case "leader_pack":
      return fixed(s.alwaysFirstExit && ctx.levelsCompleted > 0);
    case "breadwinner":
      return fixed(inBucket(ranking.mostTreasureValue, seat.seatId));
    case "airhead":
      return fixed(inBucket(ranking.mostAirTime, seat.seatId));
    case "landshark":
      return fixed(inBucket(ranking.leastAirTime, seat.seatId));
    case "jammy":
      return fixed(s.goatOnPole || hasGoatItem(seat));
    case "haul":
      return s.finalItemCount; // +1 per recovered item; 0 ⇒ omitted
    case "collector":
      return env.completedPiecesBySeat.get(seat.seatId) ?? 0;
    case "my_precious":
      return fixed(
        s.hoardExitItemCount === 1 &&
          s.finalItemCount === 1 &&
          s.successfullyExited,
      );
    case "success":
      return fixed(s.successfullyExited);
    case "flawless":
      return fixed(s.stunnedOrHurtCount === 0); // MVP lock A8
    case "gambler":
      return fixed(s.onlyChestsRecovered && s.finalItemCount >= 1);
    case "disciplinarian": {
      const others = ctx.seats
        .map((o) => o.seatId)
        .filter((sid) => sid !== seat.seatId);
      return fixed(
        others.length > 0 &&
          others.every((sid) => s.playersHitSeatIds.includes(sid)),
      );
    }
    case "opportunist":
      return fixed(s.finalItemCount >= s.hoardExitItemCount + 2);
    case "softie":
      return fixed(s.hitsDealt === 0);
    case "precision":
      return fixed(
        s.finalItemCount === s.hoardExitItemCount && s.successfullyExited,
      );

    // --- Penalties ---
    case "slowpoke":
      return fixed(s.alwaysLastExit);
    case "butterfingers":
      return fixed(inBucket(ranking.mostTreasureLost, seat.seatId));
    case "klutz":
      return fixed(inBucket(ranking.mostTrapsHit, seat.seatId));
    case "whipping_boy":
      return fixed(inBucket(ranking.mostHitsTaken, seat.seatId));
    case "big_jerk":
      return fixed(inBucket(ranking.mostHitsDealt, seat.seatId));
    case "antisocial":
      return fixed(ctx.sessionHadExactlyOneHuman && seat.human);
    case "unremarkable":
      return 0; // handled separately, after all unique-capable modifiers
    case "remedial":
      return fixed(s.lostSetItemDuringEscape);
    case "attention_deficit":
      return fixed(s.controlSwaps > 5);
    case "greed":
      return fixed(s.speedZeroFromWeight);
    case "empty_handed":
      return fixed(s.finalItemCount === 0 && s.successfullyExited);
    case "undiscerning":
      return fixed(s.onlyCommonRecovered && s.finalItemCount >= 1);
    case "autopilot": {
      const total = s.humanControlTicks + s.aiControlTicks;
      // Strictly greater than 50% (A7); total 0 → false.
      return fixed(total > 0 && s.aiControlTicks * 2 > total);
    }
    default:
      return 0;
  }
}

/** Set pieces each seat holds within completed party sets (Collector). */
function completedPiecesBySeat(
  completions: readonly SetCompletion[],
): Map<SeatId, number> {
  const map = new Map<SeatId, number>();
  for (const completion of completions) {
    for (const c of completion.contributors) {
      map.set(c.seatId, (map.get(c.seatId) ?? 0) + c.pieces);
    }
  }
  return map;
}

export function evaluateModifiers(ctx: ScoreContext): PlayerModifierResult[] {
  const { setCompletions } = computeInventoryValue(
    ctx.seats.map((s) => ({ seatId: s.seatId, items: s.finalInventory })),
  );
  const env: EvalEnv = {
    ctx,
    completedPiecesBySeat: completedPiecesBySeat(setCompletions),
  };

  return ctx.seats.map((seat) => {
    const applied: AppliedModifier[] = [];
    for (const def of MODIFIER_DEFS) {
      if (def.id === "unremarkable") continue; // evaluated last
      const delta = evaluateDef(def.id, seat, env);
      if (delta !== 0) {
        applied.push({
          id: def.id,
          title: def.title,
          kind: def.kind,
          uniqueness: def.uniqueness,
          deltaShares: delta,
        });
      }
    }

    // Unremarkable: only after every unique-capable modifier has been applied.
    if (isUnremarkable(applied)) {
      const def = getModifierDef("unremarkable");
      if (def) {
        applied.push({
          id: def.id,
          title: def.title,
          kind: def.kind,
          uniqueness: def.uniqueness,
          deltaShares: def.deltaShares,
        });
      }
    }

    // Restore stable catalog order for the raw applied list.
    applied.sort(
      (a, b) =>
        (MODIFIER_CATALOG_INDEX.get(a.id) ?? 0) -
        (MODIFIER_CATALOG_INDEX.get(b.id) ?? 0),
    );

    const rawShares = applied.reduce((sum, m) => sum + m.deltaShares, 0);
    return {
      seatId: seat.seatId,
      modifiers: applied,
      rawShares,
      shares: Math.max(1, rawShares),
    };
  });
}
