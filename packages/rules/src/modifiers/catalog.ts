/**
 * C07-T13 — Share modifier catalog (DESIGN §7.3–§7.4).
 * 15 rewards + 13 penalties = 28 defs. Array order is the stable catalog
 * order used for display sorting within buckets (DESIGN §10.1, §14).
 */
import type { ShareModifierDef } from "../types.js";

function def(
  id: string,
  title: string,
  kind: ShareModifierDef["kind"],
  uniqueness: ShareModifierDef["uniqueness"],
  deltaShares: number,
  deltaMode: ShareModifierDef["deltaMode"] = "fixed",
): ShareModifierDef {
  return { id, title, kind, uniqueness, deltaMode, deltaShares };
}

export const MODIFIER_DEFS: readonly ShareModifierDef[] = [
  // --- Rewards (§7.3) ---
  def("leader_pack", "Leader of the Pack", "reward", "unique", 10),
  def("breadwinner", "Breadwinner", "reward", "unique", 5),
  def("airhead", "Airhead", "reward", "unique", 3),
  def("landshark", "Landshark", "reward", "unique", 3),
  def("jammy", "Jammy", "reward", "unique", 1),
  def("haul", "Haul", "reward", "common", 1, "per_item"),
  def("collector", "Collector", "reward", "common", 1, "per_set_piece"),
  def("my_precious", "My Precious", "reward", "unique", 5),
  def("success", "Success!", "reward", "common", 5),
  def("flawless", "Flawless", "reward", "unique", 5),
  def("gambler", "Gambler", "reward", "unique", 5),
  def("disciplinarian", "Disciplinarian", "reward", "unique", 3),
  def("opportunist", "Opportunist", "reward", "common", 2),
  def("softie", "Softie", "reward", "common", 1),
  def("precision", "Precision", "reward", "common", 1),
  // --- Penalties (§7.4) ---
  def("slowpoke", "Slowpoke", "penalty", "unique", -1),
  def("butterfingers", "Butterfingers", "penalty", "unique", -3),
  def("klutz", "Klutz", "penalty", "unique", -3),
  def("whipping_boy", "Whipping Boy", "penalty", "unique", -3),
  def("big_jerk", "Big Jerk", "penalty", "unique", -5),
  def("antisocial", "Antisocial", "penalty", "unique", -7),
  def("unremarkable", "Unremarkable", "penalty", "common", -1),
  def("remedial", "Remedial Archaeology", "penalty", "common", -1),
  def("attention_deficit", "Attention Deficit", "penalty", "common", -2),
  def("greed", "Greed Overwhelming", "penalty", "common", -2),
  def("empty_handed", "Empty Handed", "penalty", "common", -3),
  def("undiscerning", "Undiscerning", "penalty", "common", -5),
  def("autopilot", "Autopilot", "penalty", "common", -5),
];

const BY_ID: ReadonlyMap<string, ShareModifierDef> = new Map(
  MODIFIER_DEFS.map((d) => [d.id, d]),
);

/** Catalog position by id — used for stable display sorting. */
export const MODIFIER_CATALOG_INDEX: ReadonlyMap<string, number> = new Map(
  MODIFIER_DEFS.map((d, i) => [d.id, i]),
);

export function listModifierDefs(): readonly ShareModifierDef[] {
  return MODIFIER_DEFS;
}

export function getModifierDef(id: string): ShareModifierDef | undefined {
  return BY_ID.get(id);
}
