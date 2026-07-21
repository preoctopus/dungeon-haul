/**
 * Full AI priority cascade (ai-controller DESIGN §7).
 *
 * 0. Stunned → neutral
 * 1. Switch duty
 * 2. Treasure upgrade (drop lesser)
 * 3. Treasure pickup
 * 4. Position flock
 * 5. Exit bias (folded into flockTarget for AI-only)
 * 6. Idle / stuck recovery
 */

import type { InputCommand } from "@dhaul/protocol";
import {
  axesToward,
  flockTarget,
  maxHumanLoad,
  selectSwitchTarget,
  selectTreasureTarget,
} from "./helpers.js";
import type { AiConfig, AiRng, AiWorldView } from "./types.js";
import { DEFAULT_AI_CONFIG } from "./types.js";

export interface DecideOptions {
  /** Prior stuck counter for this seat (sim-owned). */
  stuckTicks?: number;
  config?: AiConfig;
  /** Optional rng reserved for future mild randomness (fork/argue). */
  rng?: AiRng;
}

export interface DecideResult {
  command: InputCommand;
  /** Updated stuck counter the sim should store. */
  stuckTicks: number;
}

const NEUTRAL: Omit<InputCommand, "seq"> = {
  axes: { x: 0, y: 0 },
  jump: false,
  action: false,
  start: false,
};

/**
 * Produce one InputCommand for an AI-controlled seat.
 * Caller stamps `seq` (server-owned per-seat counter).
 */
export function decide(
  seatId: number,
  view: AiWorldView,
  options: DecideOptions = {},
): DecideResult {
  const cfg = options.config ?? DEFAULT_AI_CONFIG;
  let stuck = options.stuckTicks ?? 0;

  const self = view.haulers.find((h) => h.seatId === seatId);
  if (!self || self.stunned || self.exited) {
    return { command: { seq: 0, ...NEUTRAL }, stuckTicks: 0 };
  }

  // Phase gate: sim should not call decide on instructions; still stay safe.
  if (view.phase === "instructions" || view.phase === "lobby" || view.phase === "closed") {
    return { command: { seq: 0, ...NEUTRAL }, stuckTicks: 0 };
  }
  if (view.phase.startsWith("end_")) {
    return { command: { seq: 0, ...NEUTRAL }, stuckTicks: 0 };
  }

  const cap = maxHumanLoad(view.haulers, cfg);
  let axesX: -1 | 0 | 1 = 0;
  let axesY: -1 | 0 | 1 = 0;
  let jump = false;
  let action = false;

  // --- 1. Switch duty ---
  const sw = selectSwitchTarget(self, view.switches, cfg.switchSeekRadius);
  if (sw) {
    const tol = Math.max(8, view.blockSizePx * 0.25);
    axesX = axesToward(self.x, sw.x, tol);
    // Stand on the pad — no duck/action thrash.
    if (axesX === 0 && Math.abs(self.y - sw.y) < view.blockSizePx) {
      axesY = 0;
    }
  } else {
    // --- 2–3. Treasure upgrade / pickup ---
    const target = selectTreasureTarget(
      self,
      view.freeTreasures,
      cap,
      cfg.pickupRadius,
    );
    if (target) {
      const { treasure, upgrade } = target;
      const tol = Math.max(10, view.blockSizePx * 0.35);
      axesX = axesToward(self.x, treasure.x, tol);
      const adjacent =
        Math.hypot(treasure.x - self.x, treasure.y - self.y) <=
        view.blockSizePx * 0.75;

      if (upgrade && adjacent && self.carryCount > 0 && cfg.upgradeUsesDrop) {
        // Drop chord: action + down (server edge-detects).
        action = true;
        axesY = 1;
      } else if (!upgrade && adjacent && self.carryCount < cap) {
        // Duck to pickup (no action — action+down would drop).
        axesY = 1;
      } else if (axesX === 0 && !adjacent) {
        // Nudge toward treasure if only y-separated slightly.
        axesX = treasure.x >= self.x ? 1 : -1;
      }
    } else {
      // --- 4/5. Flock / exit bias ---
      const flock = flockTarget(self, view, cfg);
      axesX = axesToward(self.x, flock.x, flock.tolerance);
    }
  }

  // --- 6. Stuck recovery ---
  if (axesX !== 0 && Math.abs(self.vx) < 2 && self.grounded) {
    stuck += 1;
  } else {
    stuck = 0;
  }
  if (stuck >= cfg.stuckTicks) {
    jump = true;
    if (stuck >= cfg.stuckTicks + 15) {
      // Reverse briefly then clear.
      axesX = axesX === 0 ? 0 : ((-axesX) as -1 | 1);
      stuck = 0;
    }
  }

  return {
    command: {
      seq: 0,
      axes: { x: axesX, y: axesY },
      jump,
      action,
      start: false,
    },
    stuckTicks: stuck,
  };
}
