/**
 * Session/simulation tunables in one place (simulation DESIGN §14 subset for
 * the P2 movement slice). Never derive dt from wall clock.
 */

import { DEFAULT_KINEMATICS, type KinematicsConfig } from "./kinematics.js";

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
}

export const DEFAULT_SIM_CONFIG: SimConfig = {
  tickRate: 30,
  levelsAfterHoard: 2,
  rngSeed: 1,
  rulesetVersion: "0.1.0",
  humanIdleAiTicks: 20 * 30,
  inputQueueMax: 6,
  kinematics: DEFAULT_KINEMATICS,
};
