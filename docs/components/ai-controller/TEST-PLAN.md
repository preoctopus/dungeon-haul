# C-08 — AI Hauler Controller — Test Plan

| Field | Value |
|---|---|
| Component | **C-08 AI Hauler Controller** |
| Ownership | **SE-8** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contracts | [input-commands.md](../../interfaces/input-commands.md); AiWorldView with C-06 |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Output shape | Same `InputCommand` as humans; server seq; start always false |
| Phase gating | **No AI on Instructions**; active Hoard/level/fork |
| Flocking | Average human position; 25% furthest-pair tolerance dead-zone |
| Load cap | Never exceed max human carry count; AI-only default max |
| Pickup / upgrade | Nearby treasure; drop lesser for greater; rarity tie-break |
| Switches | Seek unpressed; abandon heavy if under mass; no toggle thrash |
| Stuck recovery | Jump pulse with cooldown; reverse/replan |
| Fork argue | Mild pulse rate; path select stable/hash |
| Soft takeover | When control flips, decide without world mutation |
| Determinism | Seeded rng from session seed + tick + seatId |

### Out of scope

| Concern | Owner |
|---|---|
| Physics / pickup grant / chords | C-06 |
| Idle timeout ownership | C-06 / room |
| High-score submit | AI never eligible (C-12) |
| ML / difficulty scaling | Forbidden MVP |
| Grief trip/throw at humans | Forbidden MVP |
| Golem/phantom “AI” entities | C-06 traps |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `InputCommand` per AI seat per tick via `decide(seatId, view, rng)` |
| **Consumes** | Read-only `AiWorldView` from C-06 |
| **Must not** | Mutate sim, teleport, direct inventory writes |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Pure `packages/ai` or server pure helpers Vitest | Helpers: average, tolerance, max load, treasure target, switch, axesToward, decide cascade |
| **Property** | Seeded loops | Command axes ∈ {-1,0,1}; no start true; load cap never violated by intent |
| **Scenario** | Headless sim + AI seats | 1 human + 3 AI short path; idle takeover; fork resolve |
| **Integration** | Room | INT-04 takeover; Instructions empty of AI |

---

## 4. Concrete case table

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| AI-01 | Command shape identical to human | Any decide() | Inspect cmd | axes discrete; jump/action bool; start false; seq set by server path | P0 |
| AI-02 | Load never exceeds max human | Humans max carry 2; free treasure near | decide → intent | No pickup when at cap without upgrade; refuse 3rd | P0 |
| AI-03 | Human raises cap | Human carries 4 | AI may pick to 4 | canPickup true up to 4 | P0 |
| AI-04 | No AI on Instructions | phase=instructions | phaseAllowsAi / room | decide not called; no AI seats | P0 |
| AI-05 | AI active on Hoard/level | phase=level hoard | decide | Non-crash cmd; may move | P0 |
| AI-06 | Average two humans | Humans x=0 and x=100 | averageHumanPosition | target x=50 | P0 |
| AI-07 | Tolerance dead-zone | span=100; AI at 50; tol=25 | axesToward | axes.x=0 inside band | P0 |
| AI-08 | Outside band moves toward | AI at x=0; target 50; tol 10 | decide flock | axes.x = +1 | P0 |
| AI-09 | Single human comfort | One human; AI within 4 blocks | flock | Dead-zone uses singleHumanComfort | P1 |
| AI-10 | Zero humans AI-only | No human seats | decide | Documented policy (exit bias / stand); no throw | P0 |
| AI-11 | Stunned neutral | stunned true | decide | axes 0; no jump/action | P0 |
| AI-12 | Pickup duck when eligible | Treasure in pickupRadius; under cap | decide | axes.y=+1 when adjacent; prefer highest valueGp | P0 |
| AI-13 | No pickup while stunned | Stunned + treasure near | decide | No duck pickup intent | P0 |
| AI-14 | Upgrade drop lesser | Carry [5,20]; free 100 in radius at cap | decide sequence | Prefer drop chord then pickup; not throw first | P1 |
| AI-15 | Rarity tie-break | Equal value; Unique vs Common free | selectTreasure | Prefer Unique/Set &gt; Rare &gt; Common | P1 |
| AI-16 | Switch seek nearest unpressed | Two switches one pressed | decide | Target unpressed nearest | P1 |
| AI-17 | Heavy switch abandon | requiredMass &gt; self weight | decide | No thrash loop; return to flock | P1 |
| AI-18 | No re-toggle pressed | Switch pressed true | decide | Drop switch intent | P1 |
| AI-19 | Stuck recovery jump | axes.x≠0, vx~0 for stuckTicks | decide | Jump once; cooldown no spam | P1 |
| AI-20 | Fork mild argue | phase=fork; window many ticks | Count pulses | Rate ≤ forkArguePulseHz band; human can outvote | P0 |
| AI-21 | Fork path select stable | Same seed seat | open + decide | Stable selection hash/rng; axes select option | P1 |
| AI-22 | Coin sacks count for cap | Carry includes coin_sack | maxHumanLoad / cap | Counts toward carryCount | P1 |
| AI-23 | Soft takeover continuous | control flips AI mid-level | decide next tick | Cmd produced; no inventory reset (sim) | P0 |
| AI-24 | Human restore stops AI cmds | control → human | loop | decide not applied for that seat | P0 |
| AI-25 | Seeded determinism | Same view seed tick seat | two decide | Identical InputCommand | P0 |
| AI-26 | Priority switch over flock | Switch in seek radius + distant pack | cascade | Switch duty wins when priority 1 | P1 |
| AI-27 | End phase neutral | phase end_* | decide if called | Neutral; no name entry | P1 |
| AI-28 | Headless 1H+3AI short | Box/Hoard tape | Run to exit | Completes without soft-lock; load cap holds | P0 |

---

## 5. Edge cases

| Edge | Expectation |
|---|---|
| Empty hand | May trip only if design adds — MVP no grief trip |
| Disconnect → AI | Soft pilot; inventory preserved by sim |
| Soft-unique chars | Irrelevant to AI decide |
| All AI fork | Window resolves via mild mash (with C-10) |
| Narrow corridor block | Stuck recovery; playtest risk |
| Loot vacuum | Cap = max human prevents full Hoard strip |

---

## 6. Fixtures & determinism

| Fixture | Purpose |
|---|---|
| Hand-built `AiWorldView` snapshots | Unit helpers |
| Seeds: `rngSeed + tick + seatId` | Deterministic mild randomness |
| Golden: load-cap, flocking midpoints | CI |
| Sim tapes with AI control seats | AI-28 |

**Determinism:** Pure decide with injected rng is bit-stable. Physics outcomes remain invariant-tested in C-06, not bitwise AI position equality across platforms.

---

## 7. Mocks / fakes

| Fake | Use |
|---|---|
| Synthetic AiWorldView | No full sim for unit cascade |
| Neutral AI stub (axes 0) | P2 room fill before full stack |
| Fake rng sequence | Force fork pulse / path tests |
| C-06 applyInput spy | Assert cmds injected only for AI seats |

---

## 8. Exit criteria (CI gates)

- [ ] AI-01..05, AI-06–08, AI-10–12, AI-20, AI-23–25, AI-28 green  
- [ ] Solo short run completable with 3 AI (harness or system)  
- [ ] No AI on Instructions (INT-01 / SIM-53 peer)  
- [ ] Load cap never exceeded by design (AI-02)  
- [ ] Pure helpers have no Phaser/Colyseus imports  
- [ ] INT-04 takeover scenarios still pass  

---

## 9. Integration & system links

| Doc / ID | Relationship |
|---|---|
| INT-04 AI takeover | AI-23/24 + C-06 idle |
| INT-01 Instructions | AI-04 |
| SYS-H1 Solo short run | AI-28 |
| C-06 SIM-53..57 | Injection path |
| C-10 FORK-19 | Mild argue |
| HUMAN-PLAYTEST Session G | Companion feel |

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| AI blocking corridors | Stuck recovery + playtest |
| Loot vacuuming | Load cap tests AI-02/03/22 |
| AI stomps fork | Mild Hz AI-20 |
| Jump intelligence gaps | Jump-on-stuck only MVP; accept |

---

## 11. Traceability

| Design section | Cases |
|---|---|
| §5 Output contract | AI-01 |
| §6 Lifecycle / Instructions | AI-04–05, AI-23–24 |
| §7.2 Flocking | AI-06–10 |
| §7.3 Greed / load | AI-02–03, AI-12–15, AI-22 |
| §7.4 Switches | AI-16–18, AI-26 |
| §7.5 Stuck | AI-19 |
| §7.6 Fork | AI-20–21 |
| §7.7 End | AI-27 |
| §9 Pure API | AI-25 |
| §11 Testing strategy | This document |
