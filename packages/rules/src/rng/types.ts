/**
 * Injectable RNG interface (DESIGN §12).
 * Rules code never calls Math.random() / Date.now(); callers inject an Rng
 * seeded by the simulation so rolls are deterministic and replayable.
 */
export interface Rng {
  /** Uniform float in [0, 1). */
  next(): number;
  /** Uniform integer in [0, maxExclusive). */
  nextInt(maxExclusive: number): number;
}
