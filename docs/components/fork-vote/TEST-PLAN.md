# C-10 — Fork Vote Subsystem — Test Plan

| Field | Value |
|---|---|
| Component | **C-10 Fork Vote Subsystem** |
| Ownership | **SE-5** (logic); SE-1 UI presentation |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contracts | [netcode-messages.md](../../interfaces/netcode-messages.md) (`S2C_ForkState`), [input-commands.md](../../interfaces/input-commands.md), [level-format.md](../../interfaces/level-format.md) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Pair pick | Q4-A random **unplayed** distinct pair from pool |
| Vote window | `endsAtTick` on tick clock; no global pause |
| Selection | axes.y primary, axes.x alias; y wins conflict; default A |
| Argue pulses | Edge detect jump/action; max 1 pulse/seat/tick; hold ≠ spam |
| Resolution | Majority; tie = selection plurality then seeded rng |
| Public state | Options, tallies, endsAtTick projection |
| AI mild argue | Pulse rate bounded; does not hang 4-AI forks |
| Mid-join / disconnect | Default selection A; window does not reset |
| C-06 handoff | Open/resolve/load; freeroam disabled during fork |

### Out of scope

| Concern | Owner |
|---|---|
| Free-roam physics on fork | Forbidden (C-06 gate) |
| Fork UI art / door anim | C-01 / C-02 |
| Full fixed 19-node graph | Stretch; MVP is pool |
| End scoring | C-06 + C-07 |
| Client “I won” authority | Never accepted |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `ForkPublicState` / `S2C_ForkState`, `ForkResult { winningOptionId, levelId, tallies, reason }` |
| **Consumes** | Session rng, playable pool, played set, per-seat `InputCommand` in fork context, level meta biomes |
| **Driven by** | C-06 phase machine (whether to open fork) |
| **Does not own** | `levelsAfterHoard` counter (C-06) |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Pure ForkVoteModule Vitest | Pair picker, axes table, pulse edges, majority/tie, window resolve |
| **Property** | Seeded loops | Distinct options; no hang; resolve always by endsAtTick |
| **Scenario** | Headless sim + fake/real C-10 | Short run two forks under levelsAfterHoard=2; mash majority |
| **Integration** | Room WS clients | INT-02 lag; same winner for both clients |

---

## 4. Concrete case table

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| FORK-01 | Higher mash wins | forceOptions A/B; seats mash A more | Open → pulse A 10, B 3 → resolve | A wins; reason `majority`; levelId = A | P0 |
| FORK-02 | Tie selection plurality | Tallies 5–5; 3 seats select A, 1 selects B | resolve | A wins via selection plurality; reason `tie_break` | P0 |
| FORK-03 | Tie 0–0 then rng | No pulses; 2–2 selection split | Fixed seed resolve | Stable winner for seed; reason `tie_break` | P0 |
| FORK-04 | Hold jump single pulse | Seat holds jump 10 ticks | applyForkInput | +1 tally only once (edge) | P0 |
| FORK-05 | Press-release-press | Two edge cycles | Inputs | +2 pulses | P0 |
| FORK-06 | Jump+action same tick | Both true one tick | apply | Max 1 pulse that tick | P0 |
| FORK-07 | Axes selection matrix | Table of (x,y) combos | apply | y primary; x alias; y wins when both set; 0 keeps prior | P0 |
| FORK-08 | Default selection A | Open fork | Read seat selections | All seats start Option A | P0 |
| FORK-09 | Window auto-resolve | windowTicks=30 | tick 30 without mash | resolved present; levelId ∈ options | P0 |
| FORK-10 | endsAtTick no pause | Disconnect mid-window | Advance ticks | Window does not reset; resolves on time | P0 |
| FORK-11 | Unplayed pair excludes played | played={dungeon_a}; pool size ≥3 | pickForkPair | Pair ⊆ pool \ played; distinct | P0 |
| FORK-12 | Same seed same pair | seed S, same played | Two picks | Identical option levelIds | P0 |
| FORK-13 | Exhaustion 1 unplayed | 1 candidate left | pick | Still 2 distinct options via fallback policy | P0 |
| FORK-14 | Exhaustion 0 unplayed | All played | pick | Reshuffle pool; 2 distinct if pool ≥2 | P1 |
| FORK-15 | Hoard never option | After hoard played | open | Neither option is hoardId | P0 |
| FORK-16 | Pool size &lt;2 fail closed | Bad pool fixture | validate / open | CI/content validation fails; no soft-lock infinite | P1 |
| FORK-17 | Public ForkState fields | Active fork | getPublicState | options[2], tallies A/B, endsAtTick present | P0 |
| FORK-18 | Mid-join during fork | New seat mid-window | bind + pulse | Default A; can pulse; tallies ok | P1 |
| FORK-19 | AI mild pulse bound | 4 AI seats; fallback or C-08 | Full window | Pulse rate &lt; max mash; resolve happens | P1 |
| FORK-20 | No free-run during fork | Sim phase=fork | axes.x movement | Hauler positions not free-run (C-06 integration) | P0 |
| FORK-21 | Short run two forks | levelsAfterHoard=2; auto resolve | Full path | Exactly 2 fork opens; second pair ≠ first when pool allows | P0 |
| FORK-22 | Lagged clients same winner | Two WS clients; B delayed | INT-02 style mash | Same next levelId; no client-side steal | P0 |
| FORK-23 | Losing option stays unplayed | A wins; B not loaded | Next pick | B eligible if not otherwise played | P1 |
| FORK-24 | jump/action both pulse same path | Selected B; pulse edges | tally | B increments only | P1 |
| FORK-25 | Selection alone no tally | Change axes only | No jump/action | Tallies unchanged | P0 |

---

## 5. Edge cases

| Edge | Expectation |
|---|---|
| Empty hand / no free-run | N/A stun; ignore stunned if set |
| Disconnect mid-fork | AI continues; window continues |
| Soft-unique chars | Irrelevant to tally |
| All humans leave | AI may resolve; room TTL separate |
| 0–0 mash | Tie-break selection then rng — not host seat |
| Packet spam | Room rate limit + 1 edge/tick |
| Pool too small for 7 levels | Content validation warning/fail |

---

## 6. Fixtures & determinism

| Fixture | Purpose |
|---|---|
| `content/level-pool.json` test pool (≥2, prefer ≥ levelsAfterHoard+1) | Pair picker |
| Stub level meta biomes for options | UI contract fields |
| `windowTicks=30` (1s @ 30 Hz) in tests | Fast resolve |
| Seeds `0xF04K`, `42` | Pair + tie-break stability |
| Mock ForkState JSON for SE-1 | Client without server |

**Determinism:** Seeded rng for pair pick and coin-flip ties. Majority paths need no rng. Tests inject `forceOptions` / `forceTallies` when isolating resolution.

---

## 7. Mocks / fakes

| Fake | Use |
|---|---|
| `forceOptions(A,B)` | Isolate tally tests from picker |
| Fallback AI driver | When C-08 late; mild pulseChance |
| Stub C-06 phase dispatcher | Unit module without full sim |
| Protocol shape checker | S2C_ForkState field presence |

---

## 8. Exit criteria (CI gates)

- [ ] FORK-01, FORK-02/03, FORK-04–07, FORK-09–12, FORK-15, FORK-17, FORK-21, FORK-22, FORK-25 green  
- [ ] No split-world level selection across clients (INT-02)  
- [ ] Works with `levelsAfterHoard=2` (exactly two forks in short run)  
- [ ] Pure module tests run without Phaser  
- [ ] Impl Plan golden: higher mash wins; tie policy locked  

---

## 9. Integration & system links

| Doc / ID | Relationship |
|---|---|
| INT-01 / INT-02 | Full path + lag fork |
| SYS-H1 | Fork appears in short run |
| C-06 TEST-PLAN SIM-59..61 | Phase handoff |
| C-09 level-pool validation | Pool size |
| C-08 FORK argue policy | AI inputs |
| HUMAN-PLAYTEST Session E | Mash fairness manual |

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Mash rate-limit unfairness | Edge + 1/tick + room limit tests |
| AI dominates humans | Mild pulse; FORK-19 + playtest |
| Graph vs Q4-A confusion | Docs + tests enforce pool policy |

---

## 11. Traceability

| Design section | Cases |
|---|---|
| §5 Pair pick Q4-A | FORK-11–16, FORK-23 |
| §6 Window / no pause | FORK-09–10 |
| §7 Inputs | FORK-04–08, FORK-24–25 |
| §8 Tally / tie | FORK-01–03 |
| §9 AI | FORK-19 |
| §10 Mid-join / disconnect | FORK-18, FORK-10 |
| §11 levelsAfterHoard | FORK-21 |
| §16 Testing strategy | This document |
