# C-07 — Rules Engine (Pure) — Test Plan

| Field | Value |
|---|---|
| Component | **C-07 Rules Engine** (`packages/rules`) |
| Ownership | **SE-6** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contract | [share-modifier-api.md](../../interfaces/share-modifier-api.md) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |
| Approach | [COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Treasure catalog | Defs, base GP, chest shells, goat/Jammy flag, coin-sack visual flag |
| Set valuation | Incomplete bases; complete supersession; multi-contributor split; remainder |
| Loot rolls | World 65/20/5/10; chest tables; excluded live uniques/set pieces; magic almost-complete |
| Encumbrance | Free first 3 items; cumulative speed/jump multipliers; `isSpeedZero` |
| Rankings | Most/least buckets; zero-suppression for “most X” penalties |
| Share modifiers | All 15 rewards + 13 penalties (predicates, deltas, uniqueness) |
| Payout | `shares = max(1, raw)`; integer takes; remainder policy; percent display |
| ScoreReport | Assembly, display sort, reveal order, toss order, eligibility, token passthrough |
| Purity | No Phaser/Colyseus/`fs`/network/`Date.now`/`Math.random` |

### Out of scope

| Concern | Owner |
|---|---|
| When the run ends / when to score | C-06 |
| Live `PlayerStats` counters during play | C-06 |
| End cinematic order / coin toss animation | C-11 |
| High-score DB / submit | C-12 |
| Wire encoding of `ScoreReport` | `packages/protocol` |
| Physics forces from weight | C-06 (consumes multipliers only) |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `rulesetVersion`, `listTreasureDefs`, `listSetDefs`, `listModifierDefs`, `getTreasureDef`, `rollTreasureDef`, `computeInventoryValue`, `computeEncumbrance`, `buildRankings`, `evaluateModifiers`, `computeTakes`, `buildScoreReport` |
| **Consumes** | Injectable `Rng`; caller-built `ScoreContext` / `ScoreReportInput` |
| **Contract** | [share-modifier-api.md](../../interfaces/share-modifier-api.md) |
| **Wire consumer** | [netcode-messages.md](../../interfaces/netcode-messages.md) (`S2C_ScoreReport` shape) |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Vitest in `packages/rules` | Every pure API function; per-modifier fire/no-fire; catalog snapshots |
| **Property** | Vitest property helpers / loops | Takes sum to total GP; shares ≥ 1; set math floor stability; roll never duplicates excluded ids over N trials |
| **Scenario / golden** | Vitest + JSON fixtures | Full 4-seat `ScoreReportInput` → snapshot `ScoreReport` under fixed `rulesetVersion` |
| **Integration (peer)** | Not owned here | INT-06: server report matches pure fixtures; G2 gate in CI |

No headless sim, room WS, or Playwright in this component’s plan.

---

## 4. Concrete case table

### 4.1 Payout & min share

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-01 | Min share under heavy penalties | Seat with rawShares ≪ 0 (stack Empty Handed, Undiscerning-impossible, Big Jerk, etc.) | `evaluateModifiers` → `computeTakes` | `shares === 1`; take still ≥ 0 integer | P0 |
| RULE-02 | Four equal shares → 25% | Four seats, identical modifiers → same shares | `computeTakes(totalGp, results)` | Each `sharePercent === 25`; takes partition total | P0 |
| RULE-03 | Integer floor + remainder | totalTreasureGp not divisible by totalShares (e.g. 100 GP, shares 3/3/3/1) | `computeTakes` | `sum(takeGp) === totalTreasureGp`; remainder +1 order: highest shares → fractional → lowest seatId | P0 |
| RULE-04 | Degenerate total GP 0 | All inventories empty; modifiers still produce shares | `computeTakes(0, …)` | All takes 0; percents still sum ~100; no div-by-zero | P0 |
| RULE-05 | Uneven shares uneven takes | Shares 10 / 5 / 1 / 1, total 1000 | `computeTakes` | Proportional floors + remainder stable across re-runs | P0 |

### 4.2 Treasure value & sets

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-06 | Empty inventory value | Four empty final inventories | `computeInventoryValue` | totalGp 0; perSeat all 0; no setCompletions | P0 |
| RULE-07 | Non-set sum + override | Seat holds stone_icon + valueOverride on another | Compute value | Sum uses base and override correctly | P0 |
| RULE-08 | Incomplete set = piece bases | Party holds 3/4 Suit of Armor pieces | Compute | Each piece contributes pieceBaseValueGp; no set completion | P0 |
| RULE-09 | Complete set supersedes | All Vegetables pieces party-wide (bonus 2000%) | Compute | setGrossGp = floor formula; piece bases not double-counted | P0 |
| RULE-10 | Multi-contributor set split | HAUL Icons complete; seats hold 2+1+1+0 pieces | Compute | awardedGp proportional to pieces held; remainder → most pieces → lowest seatId | P0 |
| RULE-11 | Breadwinner uses post-set GP | Seat A owns set bulk; seat B owns high commons | Rankings + breadwinner | mostTreasureValue uses perSeatGp after set supersession | P0 |
| RULE-12 | Catalog id/value snapshot | Full static catalog | `listTreasureDefs` / sets | Snapshot ids + baseValueGp; goat_icon has goatOnPole; coin sacks stackableVisual false | P1 |

### 4.3 Loot rolls

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-13 | World rarity weights | Fixed sequence Rng; N=10_000 world rolls | Histogram rarities | ~65/20/5/10 within loose tolerance (e.g. ±3–5 pts) | P1 |
| RULE-14 | Excluded unique not rolled | excludedDefIds includes crystal_skull | Repeated world/unique-eligible rolls | Never returns excluded defId | P0 |
| RULE-15 | Chest never opens to chest | Wooden/silver/gold/magic tables | Roll each table | Result not isChest | P0 |
| RULE-16 | Magic prefers almost-complete | almostCompleteSets missing veg_onion | Magic chest roll | Prefers missing piece when eligible | P1 |
| RULE-17 | Same seed same stream | mulberry32 seed S | Two runners roll same sequence | Identical defId sequence | P0 |

### 4.4 Encumbrance

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-18 | Free 0–3 items | carryCount 0,1,2,3; default config | `computeEncumbrance` | speedMultiplier=1, jumpMultiplier=1, isSpeedZero=false | P0 |
| RULE-19 | 4th item penalty | carryCount=4; penalty 0.12 | Compute | Mult ≈ 0.88; extraItems=1 | P0 |
| RULE-20 | Speed floor zero / greed | Enough extras that mult hits minSpeed 0 | Compute | isSpeedZero true | P0 |
| RULE-21 | Jump min clamp | High carryCount | Compute | jumpMultiplier ≥ minJumpMultiplier (default 0.25) | P1 |
| RULE-22 | Custom config override | freeItems=0, penalty 0.5 | Compute | Formula uses injected config | P1 |
| RULE-23 | Coin sacks count | carryCount includes coin_sack instances | Documented MVP | All instances count toward carryCount (visual only ignores height) | P1 |

### 4.5 Rankings & ties

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-24 | Multi-award max treasure | Two seats equal max perSeatGp | buildRankings + breadwinner | Both receive Breadwinner | P0 |
| RULE-25 | Zero-suppress Klutz | All trapsHit=0 | Rankings / Klutz | mostTrapsHit empty; no Klutz | P0 |
| RULE-26 | Zero-suppress Butterfingers | All treasureLostCount=0 | Same | No Butterfingers | P0 |
| RULE-27 | Airtime all equal | All airTimeTicks equal (incl. 0) | Airhead + Landshark | All seats get both (max=min) | P1 |
| RULE-28 | Hits metrics multi-tie | Two seats max hitsDealt | Big Jerk | Both get penalty when max > 0 | P1 |

### 4.6 Rewards (fire + no-fire samples)

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-29 | Haul +N | finalItemCount=7 | evaluate | haul delta +7; omitted when 0 | P0 |
| RULE-30 | Collector completed only | Seat holds 2 pieces of complete set, 1 incomplete | evaluate | collector +2 only | P0 |
| RULE-31 | Leader always-first | alwaysFirstExit true / false (lost one level) | evaluate | +10 only if true; levelsCompleted=0 → false | P0 |
| RULE-32 | My Precious | hoardExit=1, final=1, exited | evaluate | +5; fails if final≠1 | P0 |
| RULE-33 | Success / Softie / Precision | Exited; hitsDealt=0; final===hoard | evaluate | Each applies when predicate true | P1 |
| RULE-34 | Opportunist vs Precision | final = hoard+2 vs equal | evaluate | Mutually exclusive by inequality | P0 |
| RULE-35 | Softie vs Disciplinarian | hitsDealt=0 vs hit all others | evaluate | Mutually exclusive in practice | P1 |
| RULE-36 | Jammy goat | goatOnPole or goat_icon in inventory | evaluate | +1 unique | P0 |
| RULE-37 | Flawless MVP | stunnedOrHurtCount 0 vs >0 | evaluate | +5 only when 0 (MVP lock) | P1 |
| RULE-38 | Gambler | onlyChestsRecovered + ≥1 item | evaluate | +5; empty not Gambler | P1 |
| RULE-39 | Airhead / Landshark | Distinct max/min airtime | evaluate | Correct unique seats | P1 |

### 4.7 Penalties

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-40 | Autopilot >50% only | ai 51 / total 100 vs ai 50 / total 100 | evaluate | Fires only when strictly > half; 50% does not | P0 |
| RULE-41 | Autopilot total 0 | human+ai control ticks 0 | evaluate | Does not fire | P1 |
| RULE-42 | Antisocial sole human | sessionHadExactlyOneHuman; human seat vs AI seats | evaluate | Only the sole human gets −7; AI never | P0 |
| RULE-43 | Antisocial multi-human | Two humans | evaluate | Never fires | P0 |
| RULE-44 | Attention Deficit | controlSwaps 5 vs 6 | evaluate | Fires only when >5 | P0 |
| RULE-45 | Empty Handed | finalItemCount=0 + exited | evaluate | −3; Haul omitted | P0 |
| RULE-46 | Empty Handed + Undiscerning exclusive | 0 items vs only commons ≥1 | evaluate | Undiscerning requires ≥1 item | P1 |
| RULE-47 | Greed Overwhelming | speedZeroFromWeight true | evaluate | −2 | P0 |
| RULE-48 | Remedial Archaeology | lostSetItemDuringEscape true | evaluate | −1 | P1 |
| RULE-49 | Slowpoke | alwaysLastExit true | evaluate | −1 unique | P1 |
| RULE-50 | Unremarkable after uniques | Seat with only Softie (common) vs seat with Breadwinner | evaluate last | Softie-only → Unremarkable; unique award/penalty blocks it | P0 |
| RULE-51 | Unique penalty blocks Unremarkable | Seat has Big Jerk only unique | evaluate | No Unremarkable | P0 |

### 4.8 ScoreReport assembly

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-52 | buildScoreReport golden A | Fixture equal-haul four seats | buildScoreReport | Snapshot shares/takes/modifiers; rulesetVersion set; token passthrough | P0 |
| RULE-53 | Golden B vegetable set | Multi-seat vegetables complete | build | setCompletions present; takes match | P0 |
| RULE-54 | Golden C sole human + autopilot | One human heavy AI ticks | build | Antisocial + Autopilot edges correct | P0 |
| RULE-55 | Modifier display sort | Mixed unique/common reward/penalty | Per-player modifiers | Order: unique reward → common reward → common penalty → unique penalty | P1 |
| RULE-56 | Percentage reveal order | Distinct takeGp ranks | percentageRevealOrder | 3rd, 2nd, 4th, 1st by place | P1 |
| RULE-57 | Toss order | finalExitRank 0..3 | tossOrder | Slowest → fastest (rank desc) | P1 |
| RULE-58 | High-score eligibility | human+exited vs AI vs failed exit | eligibleForHighScore | true only human && successfullyExited | P0 |

### 4.9 Exhaustive catalog gate

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| RULE-59 | Modifier matrix 28×2 | Catalog listModifierDefs length 28 | One fires + one not-fires per id | 100% predicate coverage for G2 | P0 |
| RULE-60 | Purity boundary | Import graph / lint script | Scan packages/rules | No phaser, colyseus, fs, path, node:*, Math.random in product path | P0 |

---

## 5. Edge cases (design-locked)

| Edge | Rule under test |
|---|---|
| Empty hand haul | Haul omitted; Empty Handed if exited |
| Set multi-contributor | Split by piece count; remainder most pieces → seatId |
| Soft-unique chars | Rules do not care about character clashes — only ScoreSeat.character for report |
| Autopilot exactly 50% | Must **not** fire |
| Unremarkable order | Must run after all unique-capable modifiers |
| Breadwinner all-zero GP | Multi-award +5 still allowed (unlike Klutz zero-suppress) |
| §0.0 vs §2.3 deltas | §2.3 wins (Opportunist +2, Empty Handed −3, etc.) |
| Goat Icon ≡ Jammy | flags.goatOnPole |
| Floor set math | Always `floor` after rational multiply |

---

## 6. Fixtures & determinism

| Fixture | Purpose | Seed / notes |
|---|---|---|
| `fixtures/empty-four.json` | Empty haul, min shares | No RNG |
| `fixtures/equal-split.json` | 25% baseline | No RNG |
| `fixtures/set-vegetables.json` | Complete set supersession | No RNG |
| `fixtures/set-haul-split.json` | Multi-contributor HAUL Icons | No RNG |
| `fixtures/jammy-goat.json` | Jammy reward | No RNG |
| `fixtures/sole-human-antisocial.json` | Antisocial | No RNG |
| `fixtures/autopilot-50.json` / `autopilot-51.json` | Boundary | No RNG |
| `fixtures/golden-haul-a/b/c.json` | Full ScoreReport snapshots | Version with `rulesetVersion` |
| `test/rng/mulberry32.ts` | Deterministic Rng double | seed `0xC0FFEE` default for roll tests |

**Determinism policy:** Rules path is **bit-stable** given identical inputs. No wall clock. No ambient random. Golden snapshots fail CI on formula drift; bump `rulesetVersion` when intentional.

---

## 7. Mocks / fakes for isolation

| Fake | Use |
|---|---|
| `SequenceRng` / `Mulberry32Rng` | Inject into `rollTreasureDef` |
| Hand-built `ScoreSeat` helpers | Avoid importing sim |
| Catalog is real static data | Do not mock catalog in golden tests (test real tables) |
| No network/DB fakes | Package has no I/O |

---

## 8. Coverage pragmatism

| Target | Gate |
|---|---|
| Lines in `packages/rules` | ≥ **90%** |
| Modifier predicates | **100%** fire + no-fire (RULE-59) → Implementation Plan **G2** (≥80% catalog, target 100%) |
| Roll distribution | Statistical loose bound, not exact histogram equality |
| Presentation | Not covered here |

---

## 9. Exit criteria (CI gates)

- [ ] **G2:** ≥80% modifier catalog covered; prefer RULE-59 complete  
- [ ] RULE-01..05, RULE-08..11, RULE-18..20, RULE-40..43, RULE-50, RULE-52..54, RULE-58 green on every PR  
- [ ] `pnpm test` (or package filter) runs pure rules without Phaser/server  
- [ ] Purity guard (RULE-60) fails CI on forbidden imports  
- [ ] Golden haul fixtures versioned; intentional changes require `rulesetVersion` bump note  
- [ ] INT-06 peer: server `ScoreReport` matches pure fixture for same `ScoreReportInput`  
- [ ] TASKS exit checklist in [TASKS.md](TASKS.md) C07-T27 / T21 / T07 / T11 satisfied  

---

## 10. Integration & system links

| Doc / ID | Relationship |
|---|---|
| [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md) INT-01, INT-06 | End report correctness |
| [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md) SYS-H1 end phases | Takes readable; no client recompute |
| [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) §5, G2 | Primary pure unit layer |
| C-06 TEST-PLAN | Consumes encumbrance + buildScoreReport |
| C-12 TEST-PLAN | Trusts takeGp from report/completion |

---

## 11. Open risks

| Risk | Mitigation in tests |
|---|---|
| Premise vs §2.3 delta drift | RULE fixtures lock §2.3; document in DESIGN assumptions |
| Multi-award end-screen clutter | RULE-24 multi-award is intentional MVP |
| Placeholder treasure ids rename | Snapshot update + version bump |
| Float sharePercent display | Never recompute takes from rounded percents (RULE-02/03) |

---

## 12. Traceability

| Design section | Cases |
|---|---|
| §6 Treasure / sets / chests | RULE-06..17 |
| §7 Modifiers | RULE-29..51, RULE-59 |
| §8 Rankings | RULE-24..28 |
| §9 Payout | RULE-01..05 |
| §10 ScoreReport | RULE-52..58 |
| §11 Encumbrance | RULE-18..23 |
| §15 Test strategy | This document |
