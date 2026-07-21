/**
 * Pure AI helpers (ai-controller DESIGN §9). Unit-tested without a sim.
 */

import type {
  AiConfig,
  AiFreeTreasure,
  AiHaulerView,
  AiSwitchView,
  AiWorldView,
  Rarity,
} from "./types.js";

export interface Vec2 {
  x: number;
  y: number;
}

/** Mean position of human-controlled, non-exited haulers. Null if none. */
export function averageHumanPosition(haulers: readonly AiHaulerView[]): Vec2 | null {
  const humans = haulers.filter((h) => h.control === "human" && !h.exited);
  if (humans.length === 0) return null;
  let sx = 0;
  let sy = 0;
  for (const h of humans) {
    sx += h.x;
    sy += h.y;
  }
  return { x: sx / humans.length, y: sy / humans.length };
}

/**
 * Dead-zone radius around flock target (DESIGN §7.2).
 * 25% of furthest-pair span among humans; single-human comfort when |H| < 2.
 */
export function toleranceBand(
  haulers: readonly AiHaulerView[],
  cfg: AiConfig,
): number {
  const humans = haulers.filter((h) => h.control === "human" && !h.exited);
  if (humans.length < 2) return cfg.singleHumanComfort * cfg.toleranceFraction;
  let maxDist = 0;
  for (let i = 0; i < humans.length; i++) {
    for (let j = i + 1; j < humans.length; j++) {
      const a = humans[i]!;
      const b = humans[j]!;
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > maxDist) maxDist = d;
    }
  }
  return maxDist * cfg.toleranceFraction;
}

/** Max carry count among human seats; AI-only uses config default. */
export function maxHumanLoad(
  haulers: readonly AiHaulerView[],
  cfg: AiConfig,
): number {
  let max = -1;
  for (const h of haulers) {
    if (h.control === "human" && !h.exited && h.carryCount > max) {
      max = h.carryCount;
    }
  }
  return max < 0 ? cfg.aiOnlyDefaultMaxLoad : max;
}

const RARITY_RANK: Record<Rarity, number> = {
  common: 0,
  rare: 1,
  unique: 2,
  set: 2,
};

/** True if `a` is a strictly better pick than `b` (value, then rarity). */
export function isBetterTreasure(
  a: { valueGp: number; rarity: Rarity },
  b: { valueGp: number; rarity: Rarity },
): boolean {
  if (a.valueGp !== b.valueGp) return a.valueGp > b.valueGp;
  return RARITY_RANK[a.rarity] > RARITY_RANK[b.rarity];
}

function worstCarried(
  self: AiHaulerView,
): { valueGp: number; rarity: Rarity } | null {
  if (self.carry.length === 0) return null;
  return self.carry.reduce((w, c) =>
    c.valueGp < w.valueGp ||
    (c.valueGp === w.valueGp && RARITY_RANK[c.rarity] < RARITY_RANK[w.rarity])
      ? c
      : w,
  );
}

/**
 * Best free treasure in pickup radius. When at load cap, only return a
 * strictly better item than the worst carried (upgrade path).
 */
export function selectTreasureTarget(
  self: AiHaulerView,
  free: readonly AiFreeTreasure[],
  cap: number,
  pickupRadius: number,
): { treasure: AiFreeTreasure; upgrade: boolean } | null {
  const atCap = self.carryCount >= cap;
  const worst = worstCarried(self);
  let best: AiFreeTreasure | undefined;
  let bestDist = Infinity;

  for (const t of free) {
    const dx = t.x - self.x;
    const dy = t.y - self.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > pickupRadius) continue;

    if (atCap) {
      if (!worst || !isBetterTreasure(t, worst)) continue;
    }

    if (
      best === undefined ||
      isBetterTreasure(t, best) ||
      (t.valueGp === best.valueGp &&
        RARITY_RANK[t.rarity] === RARITY_RANK[best.rarity] &&
        dist < bestDist)
    ) {
      best = t;
      bestDist = dist;
    }
  }

  if (!best) return null;
  return { treasure: best, upgrade: atCap };
}

/** Nearest unpressed switch within seek radius; skip heavy if self too light. */
export function selectSwitchTarget(
  self: AiHaulerView,
  switches: readonly AiSwitchView[],
  seekRadius: number,
): AiSwitchView | null {
  let best: AiSwitchView | undefined;
  let bestDist = Infinity;
  const selfMass = 1 + self.weight;
  for (const s of switches) {
    if (s.pressed) continue;
    if (s.kind === "heavy" && selfMass < (s.requiredMass ?? 3)) continue;
    const dx = s.x - self.x;
    const dy = s.y - self.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > seekRadius) continue;
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best ?? null;
}

/** Horizontal dead-zone movement toward target.x. */
export function axesToward(
  selfX: number,
  targetX: number,
  tolerance: number,
): -1 | 0 | 1 {
  const dx = targetX - selfX;
  if (Math.abs(dx) <= tolerance) return 0;
  return dx > 0 ? 1 : -1;
}

/** Flock / exit bias target for this seat. */
export function flockTarget(
  self: AiHaulerView,
  view: AiWorldView,
  cfg: AiConfig,
): { x: number; y: number; tolerance: number } {
  const avg = averageHumanPosition(view.haulers);
  if (avg) {
    return { ...avg, tolerance: toleranceBand(view.haulers, cfg) };
  }
  // AI-only: bias toward exit if known, else stand.
  if (view.exitX !== undefined) {
    return {
      x: view.exitX,
      y: view.exitY ?? self.y,
      tolerance: cfg.singleHumanComfort * cfg.toleranceFraction,
    };
  }
  return { x: self.x, y: self.y, tolerance: 0 };
}
