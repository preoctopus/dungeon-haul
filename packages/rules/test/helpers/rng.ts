/**
 * C07-T10 — Deterministic Rng test doubles (DESIGN §12).
 * Test-only module (may not import Node APIs anyway; pure math).
 */
import type { Rng } from "../../src/rng/types.js";

/**
 * Feeds a fixed sequence of integers. `nextInt(max)` returns value % max;
 * `next()` returns value / 2^32. Cycles when exhausted.
 */
export class SequenceRng implements Rng {
  private i = 0;
  constructor(private readonly values: readonly number[]) {
    if (values.length === 0) throw new Error("SequenceRng needs values");
  }
  next(): number {
    return (this.values[this.i++ % this.values.length] ?? 0) / 4294967296;
  }
  nextInt(maxExclusive: number): number {
    return (this.values[this.i++ % this.values.length] ?? 0) % maxExclusive;
  }
}

/** mulberry32 PRNG — same seed → same stream across runs (RULE-17). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    nextInt: (maxExclusive: number) => Math.floor(next() * maxExclusive),
  };
}
