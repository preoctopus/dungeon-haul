/**
 * C07-T21 — computeTakes (DESIGN §9).
 *
 * take_i = floor(totalTreasureGp * shares_i / totalShares), integer GP only.
 * Remainder GP assigned +1 at a time in order: highest shares → highest
 * pre-floor fractional part → lowest seatId. Guarantees Σ takeGp === total.
 */
import type { PlayerModifierResult, TakeBreakdown } from "../types.js";

export function computeTakes(
  totalTreasureGp: number,
  results: readonly PlayerModifierResult[],
): TakeBreakdown {
  const totalShares = results.reduce((sum, r) => sum + r.shares, 0);

  if (results.length === 0 || totalShares <= 0) {
    return { totalTreasureGp, totalShares: 0, players: [] };
  }

  const players = results.map((r) => {
    const raw = (totalTreasureGp * r.shares) / totalShares;
    const takeGp = Math.floor(raw);
    return {
      seatId: r.seatId,
      shares: r.shares,
      sharePercent: (r.shares / totalShares) * 100,
      takeGp,
      _frac: raw - takeGp,
    };
  });

  let remainder =
    totalTreasureGp - players.reduce((sum, p) => sum + p.takeGp, 0);

  const order = [...players].sort(
    (a, b) => b.shares - a.shares || b._frac - a._frac || a.seatId - b.seatId,
  );
  let i = 0;
  while (remainder > 0) {
    const target = order[i % order.length];
    if (target) target.takeGp += 1;
    remainder -= 1;
    i += 1;
  }

  return {
    totalTreasureGp,
    totalShares,
    players: players.map(({ _frac, ...p }) => p),
  };
}
