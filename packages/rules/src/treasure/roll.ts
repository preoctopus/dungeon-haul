/**
 * C07-T08/T09 — rollTreasureDef: world rolls + chest open tables (DESIGN §6.6).
 *
 * Constraints (design-locked):
 * 1. Never roll a unique/set def listed in `ctx.excludedDefIds` (live in play).
 * 2. Chests never open into other chests.
 * 3. Magic chest prefers the missing piece of an almost-complete set.
 * 4. Revealed items use their `baseValueGp` (no separate chest GP).
 *
 * Fallback policy (implementation-locked, deterministic): if a table's pool is
 * empty after exclusions, fall back unique → rare → common (non-chest); the
 * common pool is never empty.
 */
import type { LootTableId, RollContext, TreasureDef } from "../types.js";
import type { Rng } from "../rng/types.js";
import { TREASURE_DEFS } from "./catalog.js";
import { rarityForRoll } from "./rarity.js";

function notExcluded(ctx: RollContext) {
  const excluded = new Set(ctx.excludedDefIds ?? []);
  return (d: TreasureDef) => !excluded.has(d.id);
}

function pool(
  rarities: readonly string[],
  ctx: RollContext,
  opts: { allowChests?: boolean } = {},
): TreasureDef[] {
  const allowed = notExcluded(ctx);
  return TREASURE_DEFS.filter(
    (d) =>
      rarities.includes(d.rarity) &&
      (opts.allowChests === true || !d.isChest) &&
      // Exclusions only meaningfully target uniques/set pieces, but honoring
      // them for any listed id is harmless and simpler.
      allowed(d),
  );
}

function pickUniform(rng: Rng, defs: readonly TreasureDef[]): TreasureDef {
  const picked = defs[rng.nextInt(defs.length)];
  if (!picked) {
    throw new Error("rollTreasureDef: empty pool (catalog invariant broken)");
  }
  return picked;
}

function firstNonEmpty(pools: readonly TreasureDef[][]): TreasureDef[] {
  for (const p of pools) if (p.length > 0) return p;
  throw new Error("rollTreasureDef: all fallback pools empty");
}

function rollWorld(rng: Rng, ctx: RollContext): TreasureDef {
  const band = rarityForRoll(rng.nextInt(100));
  // World rolls may produce chest shells (chests are common/rare entries).
  const bandPool = pool([band], ctx, { allowChests: true });
  const chosen = firstNonEmpty([
    bandPool,
    pool(["common"], ctx, { allowChests: true }),
  ]);
  return pickUniform(rng, chosen);
}

function rollMagic(rng: Rng, ctx: RollContext): TreasureDef {
  // Prefer the last missing piece of any almost-complete set.
  const excluded = new Set(ctx.excludedDefIds ?? []);
  const missing = (ctx.almostCompleteSets ?? [])
    .map((s) => s.missingDefId)
    .filter((id) => !excluded.has(id))
    .map((id) => TREASURE_DEFS.find((d) => d.id === id))
    .filter((d): d is TreasureDef => d !== undefined);
  if (missing.length > 0) return pickUniform(rng, missing);
  const chosen = firstNonEmpty([
    pool(["unique"], ctx),
    pool(["rare"], ctx),
    pool(["common"], ctx),
  ]);
  return pickUniform(rng, chosen);
}

export function rollTreasureDef(
  rng: Rng,
  table: LootTableId,
  ctx: RollContext = {},
): TreasureDef {
  switch (table) {
    case "world":
      return rollWorld(rng, ctx);
    case "wooden_chest":
      return pickUniform(
        rng,
        firstNonEmpty([pool(["common", "rare"], ctx), pool(["common"], ctx)]),
      );
    case "silver_chest":
      return pickUniform(
        rng,
        firstNonEmpty([
          pool(["common", "rare", "unique"], ctx),
          pool(["common"], ctx),
        ]),
      );
    case "gold_chest":
      return pickUniform(
        rng,
        firstNonEmpty([
          pool(["rare", "unique", "set"], ctx),
          pool(["rare"], ctx),
          pool(["common"], ctx),
        ]),
      );
    case "magic_chest":
      return rollMagic(rng, ctx);
  }
}
