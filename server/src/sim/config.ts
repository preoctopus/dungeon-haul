/**
 * Session/simulation tunables in one place (simulation DESIGN §14).
 * Never derive dt from wall clock.
 */

import { DEFAULT_AI_CONFIG, type AiConfig } from "@dhaul/ai";
import type { EncumbranceConfig } from "@dhaul/rules";
import { ENCUMBRANCE_DEFAULT } from "@dhaul/rules";
import type { HazardConfig } from "./hazards.js";
import { DEFAULT_KINEMATICS, type KinematicsConfig } from "./kinematics.js";

export interface SurfaceMultipliers {
  /** Multiplier on groundFriction (ice < 1, sand > 1). */
  friction: number;
  /** Multiplier on maxSpeed (sand < 1). */
  maxSpeed: number;
}

export interface SimConfig {
  tickRate: number;
  levelsAfterHoard: number;
  rngSeed: number;
  rulesetVersion: string;
  /** No human packets for this many ticks → control flips to AI (20s @30Hz). */
  humanIdleAiTicks: number;
  /** Max queued (not yet applied) commands per seat; oldest dropped beyond. */
  inputQueueMax: number;
  kinematics: KinematicsConfig;

  // --- P3 gameplay ---

  /** Ticks a hauler stays stunned after a stun event (DESIGN §7.3). */
  stunTicks: number;
  /** Ticks after spill before the owner can re-pickup their items. */
  pickupLockoutTicks: number;
  /** Max px distance (center-to-center) for duck/pickup reach. */
  pickupReachPx: number;
  /** Max px distance for trip/push to connect. */
  tripReachPx: number;
  /** Horizontal impulse applied to trip/push target (px/s). */
  tripImpulseX: number;
  /** Vertical impulse applied to trip/push target (px/s). */
  tripImpulseY: number;
  /** Horizontal throw speed (px/s). */
  throwSpeedX: number;
  /** Vertical throw speed (px/s, negative = up). */
  throwSpeedY: number;
  /** Spill velocity magnitude range (px/s) for scattered items. */
  spillSpeedMin: number;
  spillSpeedMax: number;
  /** Encumbrance curve from rules package. */
  encumbrance: EncumbranceConfig;
  /** Hazard config for the Hazards subsystem. */
  hazards: HazardConfig;
  /** Ice surface multipliers (C06-T16). */
  ice: SurfaceMultipliers;
  /** Sand surface multipliers (C06-T16). */
  sand: SurfaceMultipliers;
  /** Pure AI controller config (C-08). */
  ai: AiConfig;
  /**
   * When false, AI seats emit neutral input (stand). Useful for unit tests
   * that isolate human/loot/trap behavior. Production leaves this true.
   */
  enableAi: boolean;
}

export const DEFAULT_SIM_CONFIG: SimConfig = {
  tickRate: 30,
  levelsAfterHoard: 2,
  rngSeed: 1,
  rulesetVersion: "0.1.0",
  humanIdleAiTicks: 20 * 30,
  inputQueueMax: 6,
  kinematics: DEFAULT_KINEMATICS,

  // P3 gameplay defaults
  stunTicks: 30, // ~1 second
  pickupLockoutTicks: 45, // ~1.5 seconds
  pickupReachPx: 48, // ~1.5 blocks
  tripReachPx: 40, // ~1.25 blocks
  tripImpulseX: 250,
  tripImpulseY: -100,
  throwSpeedX: 300,
  throwSpeedY: -150,
  spillSpeedMin: 80,
  spillSpeedMax: 200,
  encumbrance: ENCUMBRANCE_DEFAULT,
  hazards: {
    heavySwitchMass: 3,
    lightningPeriodTicks: 90,
    lightningActiveTicks: 30,
  },
  ice: { friction: 0.15, maxSpeed: 1.05 },
  sand: { friction: 1.6, maxSpeed: 0.65 },
  ai: { ...DEFAULT_AI_CONFIG },
  enableAi: true,
};
