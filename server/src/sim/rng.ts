/**
 * Deterministic PRNG for the simulation (treasure rolls, fork picks).
 * Implements the rules-package {@link Rng} interface so `rollTreasureDef` etc.
 * consume a single seeded stream (simulation DESIGN §4.3). Pure + dependency
 * free; never calls Math.random()/Date.now().
 *
 * mulberry32: fast, well-distributed 32-bit generator. Seed derives from the
 * session rngSeed (+ optional sub-stream salt for level-scoped rolls).
 */
import type { Rng } from "@dhaul/rules";

export class Mulberry32 implements Rng {
  private state: number;

  constructor(seed: number) {
    // Coerce to uint32; a zero seed still produces a usable stream.
    this.state = seed >>> 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(maxExclusive: number): number {
    if (maxExclusive <= 0) return 0;
    return Math.floor(this.next() * maxExclusive);
  }
}

/** Combine a base seed with a string salt (e.g. level id) into a uint32 seed. */
export function deriveSeed(base: number, salt: string): number {
  let h = base >>> 0;
  for (let i = 0; i < salt.length; i++) {
    h = (Math.imul(h ^ salt.charCodeAt(i), 0x01000193) + 1) >>> 0;
  }
  return h >>> 0;
}
