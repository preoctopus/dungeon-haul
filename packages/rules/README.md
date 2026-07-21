# @dhaul/rules

Pure TypeScript rules engine for Dungeon Haul (component **C-07**): treasure
valuation and share modifiers. See
[`docs/components/rules-engine/DESIGN.md`](../../docs/components/rules-engine/DESIGN.md).

## Purity contract (C07-T03)

This package must stay pure:

- No imports of `phaser`, `colyseus`, `fs`, `path`, `node:*`, or client/server packages.
- No `Math.random()` / `Date.now()` — callers inject the `Rng` interface.
- `tsconfig.json` compiles with `lib: ["ES2022"]` and `types: []` — DOM and
  Node globals are unavailable at type level.
- `test/purity.test.ts` scans `src/` and fails CI on any violation.

## Status

P0 skeleton (tasks C07-T01..T03): `rulesetVersion`, core types from DESIGN §5.
Catalog data and evaluation logic land in P1 (C07-T04+).
