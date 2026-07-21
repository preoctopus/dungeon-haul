/**
 * C07-T11 — Encumbrance default parameters (DESIGN §11).
 * Playtest placeholders; not design-doc-locked. API accepts overrides.
 */
import type { EncumbranceConfig } from "../types.js";

export const ENCUMBRANCE_DEFAULT: EncumbranceConfig = {
  freeItems: 3,
  speedPenaltyPerExtra: 0.12,
  jumpPenaltyPerExtra: 0.12,
  minSpeedMultiplier: 0, // 0 allows Greed Overwhelming
  minJumpMultiplier: 0.25, // assumption A12: jump never fully zero by default
};
