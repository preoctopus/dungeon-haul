/**
 * C07-T19 — Unremarkable (DESIGN §7.4, order-dependent).
 * Fires when a seat earned zero modifiers with uniqueness "unique"
 * (rewards OR penalties). Must be evaluated after every unique-capable
 * modifier; common-only titles (e.g. Softie) do not block it (A10).
 */
import type { AppliedModifier } from "../types.js";

export function isUnremarkable(applied: readonly AppliedModifier[]): boolean {
  return !applied.some((m) => m.uniqueness === "unique");
}
