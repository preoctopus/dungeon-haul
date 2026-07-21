/**
 * C07-T11 — computeEncumbrance (DESIGN §5.3, §11).
 *
 * Count-based MVP curve:
 *   extra = max(0, carryCount - freeItems)
 *   speedMultiplier = clamp(1 - extra * speedPenaltyPerExtra, min, 1)
 *   jumpMultiplier  = clamp(1 - extra * jumpPenaltyPerExtra,  min, 1)
 *
 * All carried instances count toward carryCount, including coin sacks —
 * `stackableVisual: false` only suppresses visual stack height (A6).
 * If `weightSpeedFactor` is configured (> 0), the weight term multiplies the
 * speed curve afterwards: speed *= max(0, 1 - carryWeight * factor).
 */
import type { EncumbranceConfig, EncumbranceResult } from "../types.js";
import { ENCUMBRANCE_DEFAULT } from "./config.js";

export function computeEncumbrance(
  carryCount: number,
  carryWeight: number,
  config: EncumbranceConfig = ENCUMBRANCE_DEFAULT,
): EncumbranceResult {
  const extraItems = Math.max(0, carryCount - config.freeItems);

  let speedMultiplier = Math.min(
    1,
    Math.max(
      config.minSpeedMultiplier,
      1 - extraItems * config.speedPenaltyPerExtra,
    ),
  );
  const jumpMultiplier = Math.min(
    1,
    Math.max(
      config.minJumpMultiplier,
      1 - extraItems * config.jumpPenaltyPerExtra,
    ),
  );

  const weightFactor = config.weightSpeedFactor ?? 0;
  if (weightFactor > 0) {
    speedMultiplier = Math.max(
      config.minSpeedMultiplier,
      speedMultiplier * Math.max(0, 1 - carryWeight * weightFactor),
    );
  }

  return {
    freeItems: config.freeItems,
    extraItems,
    speedMultiplier,
    jumpMultiplier,
    isSpeedZero: speedMultiplier === 0,
  };
}
