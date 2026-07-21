# C-07 — Rules Engine Tasks

> **Component:** C-07 Rules Engine (`packages/rules`)  
> **Ownership:** SE-6  
> **Design:** [DESIGN.md](DESIGN.md)  
> **Contract:** [share-modifier-api.md](../../interfaces/share-modifier-api.md)  
> **Phase:** P0 skeleton → P1 full rules (see [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md))  
> **Constraint:** Pure TypeScript only — no Phaser, no Node `fs`, no I/O, no network.

Task IDs: **`C07-T##`**. Check boxes are for implementers; this file is documentation only until coding begins.

---

## Legend

| Field | Meaning |
|---|---|
| **Pri** | P0 / P1 / P1+ (polish) |
| **Deps** | Blocking task IDs |
| **DoD** | Definition of done |

---

## Package foundation

### C07-T01 — Scaffold `packages/rules`

| | |
|---|---|
| **Pri** | P0 |
| **Deps** | Monorepo workspace exists |
| **Summary** | Create package shell: `package.json` (`@dhaul/rules`), strict `tsconfig` (no DOM/Node libs), Vitest config, empty `src/index.ts`, `rulesetVersion` export `"1.0.0"`. |
| **DoD** | Package builds and `pnpm test` runs with zero tests green; not imported by Phaser/server yet is OK. |

### C07-T02 — Core types module

| | |
|---|---|
| **Pri** | P0 |
| **Deps** | C07-T01 |
| **Summary** | Implement TypeScript types from DESIGN §5: `TreasureDef`, `TreasureInstance`, `SetDef`, `PlayerStats`, `ScoreSeat`, `ScoreContext`, `RankingBuckets`, `ShareModifierDef`, `AppliedModifier`, `PlayerModifierResult`, `TakeBreakdown`, `ScoreReport`, `EncumbranceConfig`, `Rng`, enums. |
| **DoD** | Types compile; exported from `index.ts`; match share-modifier-api + DESIGN (document intentional extras). |

### C07-T03 — Purity / boundary CI guard (optional P0)

| | |
|---|---|
| **Pri** | P0 |
| **Deps** | C07-T01 |
| **Summary** | Lint or simple script failing if `packages/rules` imports `phaser`, `colyseus`, `fs`, `path`, `node:*`. |
| **DoD** | Documented check in package README or CI; intentional pure surface. |

---

## Treasure catalog & valuation

### C07-T04 — Treasure def catalog data

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02 |
| **Summary** | Encode full §2.2 catalog as static TS data: common, rare, unique, set pieces, chest shells. Include placeholder ids for PDF gaps (`bronze_charm`, `opal_icon` / DESIGN §6). Flag `goat_icon.flags.goatOnPole`, coin sacks `stackableVisual: false`, chests `isChest`. |
| **DoD** | `listTreasureDefs()` / `getTreasureDef(id)` return complete catalog; unit test snapshot of ids + base values. |

### C07-T05 — Set definitions

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T04 |
| **Summary** | Encode 7 sets with piece lists, `pieceBaseValueGp`, `setBonusPercent` per DESIGN §6.5. |
| **DoD** | `listSetDefs()` complete; each piece def exists in treasure catalog with matching `setId`. |

### C07-T06 — `computeInventoryValue` (no sets)

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T04 |
| **Summary** | Sum non-set inventory GP per seat and party total; honor `valueOverrideGp`. |
| **DoD** | Tests: empty, single item, multi-seat, override. |

### C07-T07 — Set completion supersession

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T05, C07-T06 |
| **Summary** | Party-wide set completion; incomplete = sum bases; complete = `floor(base * n * (100+bonus)/100)` supersedes pieces; split by piece count; remainder → most pieces → lowest seatId. Emit `SetCompletion[]`. |
| **DoD** | Tests: incomplete Suit of Armor; complete Vegetables (+2000%); multi-contributor HAUL Icons split; Breadwinner uses post-set seat GP. |

### C07-T08 — World rarity weights

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T04, inject Rng type |
| **Summary** | `rollTreasureDef(rng, "world", ctx)` with 65/20/5/10 and uniform within band; respect `excludedDefIds` for unique/set. |
| **DoD** | Seeded distribution test (large N) roughly matches weights; never rolls excluded live unique. |

### C07-T09 — Chest open tables

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T08 |
| **Summary** | Wooden / silver / gold / magic pools per DESIGN §6.6; no chest→chest; magic prefers almost-complete set missing piece. |
| **DoD** | Table unit tests for pool membership; magic prefers missing piece when provided in `RollContext`. |

### C07-T10 — Rng test double

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02 |
| **Summary** | Deterministic `Rng` fixture (sequence or mulberry32 from seed) for tests. |
| **DoD** | Same seed → same roll stream across runs. |

---

## Encumbrance

### C07-T11 — `computeEncumbrance`

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02 |
| **Summary** | Implement freeItems=3 cumulative speed/jump penalties; config object; `isSpeedZero`; defaults from DESIGN §11. |
| **DoD** | Tests: 0–3 items mult=1; 4+ decreases; clamp at min; `isSpeedZero` when mult hits 0; custom config overrides. |

---

## Rankings & modifiers

### C07-T12 — `buildRankings`

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02, C07-T07 (for treasure GP) |
| **Summary** | Derive `RankingBuckets` from seats + perSeatGp; zero-suppression for loss/trap/hit maxima. |
| **DoD** | Tests for unique max, multi-way ties, all-zero hit metrics → empty arrays. |

### C07-T13 — Modifier catalog data

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02 |
| **Summary** | Encode all 15 rewards + 13 penalties as `ShareModifierDef[]` with id, title, kind, uniqueness, deltaMode, deltaShares per DESIGN §7.3–§7.4. |
| **DoD** | `listModifierDefs()` length 28; snapshot ids; uniqueness tags match DESIGN table. |

### C07-T14 — Evaluate fixed personal rewards

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T13 |
| **Summary** | Predicates: `success`, `softie`, `precision`, `opportunist`, `my_precious`, `flawless`, `gambler`, `jammy`, `disciplinarian`. |
| **DoD** | Positive + negative fixture per id; mutual exclusions (softie vs disciplinarian; precision vs opportunist). |

### C07-T15 — Evaluate variable rewards (`haul`, `collector`)

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T07, C07-T13 |
| **Summary** | Haul = final item count; Collector = pieces held in completed sets; omit when 0. |
| **DoD** | Haul +N test; Collector only completed set pieces; incomplete set no collector credit. |

### C07-T16 — Evaluate ranking rewards

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T12, C07-T13 |
| **Summary** | `leader_pack`, `breadwinner`, `airhead`, `landshark` with multi-award ties. |
| **DoD** | Leader fails if not always first; four-way airtime tie awards all; breadwinner uses set-adjusted GP. |

### C07-T17 — Evaluate ranking / session penalties

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T12, C07-T13 |
| **Summary** | `slowpoke`, `butterfingers`, `klutz`, `whipping_boy`, `big_jerk`, `antisocial` with zero-suppression and sole-human rule. |
| **DoD** | Antisocial only sole human; AI never; zero traps → no Klutz; multi-tie multi-award. |

### C07-T18 — Evaluate personal penalties

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T13 |
| **Summary** | `remedial`, `attention_deficit` (`controlSwaps > 5`), `greed`, `empty_handed`, `undiscerning`, `autopilot` (strict `>` 50%). |
| **DoD** | Autopilot at exactly 50% does **not** fire; `>` 50% does; attention at 5 swaps no, 6 yes. |

### C07-T19 — `unremarkable` (order-dependent)

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T14–C07-T18 |
| **Summary** | Apply after all unique-capable modifiers; fires if seat has no `uniqueness: unique` applied modifiers. |
| **DoD** | Softie-only → Unremarkable; any unique reward/penalty → not Unremarkable. |

### C07-T20 — `evaluateModifiers` orchestration

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T14–C07-T19 |
| **Summary** | Wire full pipeline: rankings → all defs → `rawShares` / `shares = max(1, raw)`. |
| **DoD** | Min-1-share under huge penalties; four-player mixed fixture stable. |

---

## Payout & ScoreReport

### C07-T21 — `computeTakes`

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T20 |
| **Summary** | `take = floor(total * shares_i / totalShares)`; remainder to highest shares → fractional → lowest seatId; sum(takes)=total. |
| **DoD** | Equal 4-way 100 GP → 25 each; remainder cases; total 0; min share 1 with uneven penalties. |

### C07-T22 — Display sort + reveal order

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T21 |
| **Summary** | Per-player modifier sort: unique reward → common reward → common penalty → unique penalty; `percentageRevealOrder` = 3rd, 2nd, 4th, 1st by takeGp; `tossOrder` slowest→fastest. |
| **DoD** | Unit tests for order vectors on a 4-seat fixture. |

### C07-T23 — `buildScoreReport`

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T07, C07-T20, C07-T21, C07-T22 |
| **Summary** | Single entry: inventories → value → modifiers → takes → full `ScoreReport` with `rulesetVersion`, eligibility, `completionToken` passthrough, `setCompletions`. |
| **DoD** | Golden fixture matches expected report; eligibleForHighScore only human+exited. |

### C07-T24 — Optional report hash helper

| | |
|---|---|
| **Pri** | P1+ |
| **Deps** | C07-T23 |
| **Summary** | Stable pure hash/serialization of scoring fields for C-12 submit validation. |
| **DoD** | Same report → same hash; token excluded from hash. |

---

## Fixtures, golden tests, docs sync

### C07-T25 — Test fixtures library

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T02 |
| **Summary** | Hand-built `ScoreSeat` / inventory helpers: empty haul, equal haul, jammy goat, sole human, autopilot 50/50, set completers multi-seat. |
| **DoD** | Reused across modifier tests; no engine imports. |

### C07-T26 — Golden haul end-to-end

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T23, C07-T25 |
| **Summary** | 2–3 full-session JSON fixtures → expected shares/takes snapshot under `rulesetVersion`. |
| **DoD** | CI fails on accidental formula drift; documented in DESIGN if values change (version bump). |

### C07-T27 — Exhaustive modifier matrix checklist

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T20 |
| **Summary** | One fires + one not-fires test per catalog id (28 × 2). Track coverage in test file names or table. |
| **DoD** | All 28 ids covered; list in test report or comment table. |

### C07-T28 — Export public API audit

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T23 |
| **Summary** | `index.ts` exports only public surface from DESIGN §4 / share-modifier-api; no internal leakage required by C-06. |
| **DoD** | Align with [share-modifier-api.md](../../interfaces/share-modifier-api.md); open PR note if contract needs amendment. |

### C07-T29 — Contract sync PR

| | |
|---|---|
| **Pri** | P1 |
| **Deps** | C07-T28 |
| **Summary** | If implementation reveals gaps, update `share-modifier-api.md` / `netcode-messages.md` ScoreReport fields (e.g. `setCompletions`, `percentageRevealOrder`) to match DESIGN — docs only or with code. |
| **DoD** | Interface docs and package API agree; no silent drift. |

### C07-T30 — Wire sim integration notes

| | |
|---|---|
| **Pri** | P1+ |
| **Deps** | C07-T23 |
| **Summary** | Short integration note (in DESIGN or C-06 tasks): which `PlayerStats` fields sim must fill; when to call `computeEncumbrance` / `buildScoreReport`. No sim code in this package. |
| **DoD** | SE-5 can implement against pure API without reading PDF. |

---

## Suggested implementation order

```text
P0:  T01 → T02 → T03
P1:  T04 → T05 → T06 → T07
     T10 → T08 → T09
     T11
     T12 → T13 → T14 → T15 → T16 → T17 → T18 → T19 → T20
     T21 → T22 → T23
     T25 → T26 → T27 → T28 → T29
P1+: T24, T30
```

**Critical path to IMPLEMENTATION-PLAN P1 exit:** T01–T02, T04–T07, T11, T13–T23, T26–T27.

---

## Exit criteria (component complete for P1)

- [ ] Every share modifier from design §2.3 has testable rule definitions and tests (`C07-T27`)
- [ ] `take = TotalTreasure × (shares_i / sum shares)` with min 1 share (`C07-T21`)
- [ ] Set completion supersedes piece values (`C07-T07`)
- [ ] Encumbrance after 3 items (`C07-T11`)
- [ ] Tie multi-award policy locked in tests (`C07-T16`, `C07-T17`)
- [ ] Autopilot / Antisocial / Leader edge cases locked (`C07-T17`, `C07-T18`, `C07-T16`)
- [ ] `buildScoreReport` produces End-Director-ready shape (`C07-T23`)
- [ ] Package has **no** Phaser / Node fs / network I/O (`C07-T03`)
- [ ] `rulesetVersion` embedded in report (`C07-T23`)

---

## Traceability

| Design section | Tasks |
|---|---|
| §3 Package layout | T01–T03 |
| §4 Public API | T28–T29 |
| §5 Types | T02 |
| §6 Treasure / sets / chests | T04–T10 |
| §7 Modifiers | T13–T20, T27 |
| §8 Rankings / ties | T12, T16–T17 |
| §9 Payout | T21 |
| §10 ScoreReport | T22–T24 |
| §11 Encumbrance | T11 |
| §12 Rng | T10 |
| §15 Tests | T25–T27 |

| share-modifier-api test matrix | Task |
|---|---|
| Min share 1 | T21, T20 |
| Four equal shares 25% | T21 |
| Set completion supersedes | T07 |
| Haul +N | T15 |
| Autopilot >50% only | T18 |
| Antisocial sole human | T17 |
| Leader fails any level | T16 |
| Integer remainder stable | T21 |
