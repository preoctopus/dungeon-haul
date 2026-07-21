# C-06 — Authoritative Simulation — Test Plan

| Field | Value |
|---|---|
| Component | **C-06 Authoritative Simulation** |
| Ownership | **SE-5** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contracts | [netcode-messages.md](../../interfaces/netcode-messages.md), [input-commands.md](../../interfaces/input-commands.md), [share-modifier-api.md](../../interfaces/share-modifier-api.md), [level-format.md](../../interfaces/level-format.md) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Fixed tick | 30 Hz, fixed `dt=1/30`, no wall-clock physics |
| Phase machine | lobby → instructions → level(hoard) → fork → level… → end_* → closed |
| Seats | Always 4 haulers; human/AI control; soft-takeover |
| Inputs | Queue, seq rules, axes domain, stun no-op, phase gates |
| Physics MVP | Run, jump edge, gravity, AABB platforms, ice/sand |
| Treasure | Seeded spawn, pickup/drop/throw, spill, ownership exclusive |
| Encumbrance | C-07 multipliers applied each tick; greed flag |
| Hazards | Spikes + timed trap MVP; switches; trip/push |
| Exit / progression | Exit order stats; `levelsAfterHoard` default **2** |
| AI injection | C-08 commands same apply path; no AI on Instructions |
| Idle takeover | 20s silence / 5s+edge → AI |
| Snapshots/events | WorldSnapshot + GameEvent stream fields |
| End scoring | ScoreContext → C-07 → ScoreReport once |
| No global pause | `start` never freezes server tick |

### Out of scope

| Concern | Owner |
|---|---|
| Share title presentation / cinematics | C-11 |
| HTTP lobby, join codes, token mint | C-05 |
| High-score DB writes | C-12 |
| Drawing / camera | C-02 |
| PNG parse | C-09 (sim consumes `LevelDefinition`) |
| AI policy internals | C-08 |
| Fork tally resolution | C-10 (sim opens/loads) |
| Cross-architecture bitwise float parity | N/A (single-server authority) |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `WorldSnapshot`, `GameEvent[]`, phase changes, ScoreReport handoff, SeatUpdate hooks |
| **Consumes** | `InputCommand` ([input-commands.md](../../interfaces/input-commands.md)), `LevelDefinition` (C-09), Rules API (C-07), AI decide (C-08), ForkVote (C-10) |
| **Config** | `SessionConfig`: tickRate 30, `levelsAfterHoard=2`, `allowGlobalPause: false`, idle thresholds |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Vitest headless sim module | Phase matrix, seat bind, input validation, single-system behaviors |
| **Property / invariant** | Headless tick loop | Ownership exclusive; instance conservation; no NaN; 4 haulers; monotoic tick |
| **Scenario (tapes)** | Input tape harness | Multi-seat scripted runs; golden path short run |
| **Integration hooks** | Room harness (peer plan) | INT-01, INT-03, INT-04; G3–G5 |

---

## 4. Concrete case table

### 4.1 Shell, tick, config

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-01 | Fixed dt tick advances | createSimulation defaults | Run 30 ticks with fixed clock | tick counter +30; dt never wall-clock | P0 |
| SIM-02 | levelsAfterHoard default 2 | Fresh SessionConfig | Read config | `levelsAfterHoard === 2` | P0 |
| SIM-03 | allowGlobalPause false | Config | Assert flag | false; no pause path in phase machine | P0 |
| SIM-04 | Snapshot shape each tick | BoxLevel loaded | tick() | Snapshot has phase, levelId, levelsCompleted, 4 haulers, lastProcessedInputSeq | P0 |

### 4.2 Phase machine

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-05 | Lobby → instructions | All ready / force | Transition | phase instructions | P0 |
| SIM-06 | Instructions → Hoard | All active humans exit | Transition | phase=level, levelId hoard; levelsCompleted still 0 | P0 |
| SIM-07 | Hoard complete → fork | All haulers exit hoard | Transition | phase=fork; levelsCompleted === 0 | P0 |
| SIM-08 | Post-L1 → fork (default 2) | Complete first post-hoard level | Transition | levelsCompleted=1; phase fork | P0 |
| SIM-09 | Post-L2 → end (default 2) | Complete second post-hoard level | Transition | levelsCompleted=2; phase end_count **not** fork | P0 |
| SIM-10 | levelsAfterHoard=7 branch | Config 7; complete L2 | Transition | Still forks (not end) | P1 |
| SIM-11 | End sub-phases no re-score | Enter end_count once | Skip through end_* | computeTakes / buildScoreReport called once | P0 |
| SIM-12 | Closed rejects free-run | phase closed | applyInput movement | No locomotion; no crash | P1 |

### 4.3 Seats & control

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-13 | Always 4 haulers | Any gameplay phase from Hoard | Snapshot | seats length 4 always | P0 |
| SIM-14 | Soft-takeover preserves carry | AI seat with stack; bindHuman | Bind | Same pose + same instanceIds in carry | P0 |
| SIM-15 | releaseHuman → AI | Human seat mid-level | releaseHuman | control=ai; body retained | P0 |
| SIM-16 | Soft-unique characters | Two seats claim same char | Claim path | Allowed (no reject); both keep character | P1 |
| SIM-17 | Mid-join safe spawn | Join mid-level free seat | bindHuman | Spawn free cell; empty inventory unless soft-takeover of AI seat | P0 |

### 4.4 Inputs

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-18 | Jump edge once | Grounded; jump true 5 ticks | applyInput tape | One jump impulse per press cycle | P0 |
| SIM-19 | Stunned no-op | stunnedUntilTick future | Movement + action | No move/pickup/throw until expire | P0 |
| SIM-20 | Seq duplicate ignored | Same seq twice | applyInput | lastProcessedSeq unchanged on dup; no double jump | P0 |
| SIM-21 | Seq gap tolerated | seq 1 then 3 | applyInput | Accepts; no crash | P1 |
| SIM-22 | Axes invalid rejected | axes.x=2 | apply | Reject/ignore; no NaN | P0 |
| SIM-23 | AI/human same shape | AI cmd + human cmd | apply path | Identical interpreter (input-commands case 5) | P0 |
| SIM-24 | Fork phase no free-run | phase=fork | axes.x locomotion | Hauler x/y not free-run integrated | P0 |
| SIM-25 | End phase inputs | phase=end_* | Movement vs skip | Movement ignored; skip routed when allowed | P1 |

### 4.5 Movement & surfaces

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-26 | Run + jump platform tape | BoxLevel platforms | Run right, jump onto platform | Grounded on platform; no NaN; two seats independent bodies | P0 |
| SIM-27 | Ice slides more than brick | Parallel ice vs brick strips | Same run then release | Ice travel distance > brick | P1 |
| SIM-28 | Sand slower than brick | Sand vs brick | Max speed compare | Sand max speed < brick | P1 |

### 4.6 Treasure ownership

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-29 | Pickup grants exclusive | Free treasure near seat 0 duck | Pickup | owner only seat 0; event pickup | P0 |
| SIM-30 | Dual-seat race single owner | Two seats same tick on one instance | Simultaneous pickup | Exactly one owner; conservation holds | P0 |
| SIM-31 | Drop top of stack | Carry [A,B] top A | action+down | A free near feet; B remains top | P0 |
| SIM-32 | Throw facing velocity | Facing +1; action+up | Throw | Projectile then free; velocity × facing | P0 |
| SIM-33 | Drop empty no-op | Empty carry | action+down | No event; no crash | P1 |
| SIM-34 | Seeded treasure rolls | Same rngSeed + same slots | Two loads | Same defIds sequence | P0 |
| SIM-35 | No live unique duplicate | Roll unique already in play | Spawn | Excluded from live unique/set | P0 |

### 4.7 Spill, stun, steal

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-36 | Stun spill empties stack | Carry ≥1; hit spikes | Contact | spill+stun events; carry empty | P0 |
| SIM-37 | Lockout allows peer steal | After spill; seat 0 lockout | Seat 1 picks spilled | Seat 1 owns; seat 0 cannot re-grab during lockout | P0 |
| SIM-38 | Trip/push impulse | Empty hands; near peer; action | Trip | Peer velocity change; hitsDealt/hitsTaken +1 once | P1 |
| SIM-39 | Instance conservation | Multi pickup/drop/spill tape | Each tick assert | Each instanceId: carried XOR free XOR destroyed (logged) | P0 |

### 4.8 Encumbrance & weight

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-40 | 0–3 items full speed | Carry 0..3 | Measure speed mult | Mult 1.0 via C-07 | P0 |
| SIM-41 | 4th item slows | Carry 4 | Move | speedMultiplier < 1 | P0 |
| SIM-42 | Speed zero sets greed flag | Overload to mult 0 | Tick stats | stats.speedZeroFromWeight true | P0 |

### 4.9 Traps & switches

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-43 | Spikes stun+spill | Walk into spikes with carry | Contact | stunned; empty carry; trap_trigger | P0 |
| SIM-44 | Timed trap cycle | Stub timed zone | Enter active window | stun when active | P1 |
| SIM-45 | Unknown trap stub | Map cell stub type | Load + touch | Log once; no throw | P1 |
| SIM-46 | Heavy switch mass | 1 light hauler vs 3 unloaded / weighted | Press heavy | Fail alone; succeed with threshold mass | P1 |
| SIM-47 | Standard switch toggle | Overlap+grounded | Press | Linked device state flips | P1 |

### 4.10 Exit & stats

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-48 | Exit order first/last | 4 seats exit order 0,1,2,3 | Exit all | exitsFirstCount / exitsLastCount; level_exit events | P0 |
| SIM-49 | Level complete once | All active exited | Extra ticks | Level complete transitions once | P0 |
| SIM-50 | Instructions humans-only exit | 1 human active; empty seats no AI | Human exits | Completes with one human | P0 |
| SIM-51 | PlayerStats ScoreContext-ready | Fixture short run | End handoff | Required fields present for C-07 | P0 |
| SIM-52 | hoardExitItemCount snapshot | Exit hoard with N items | Stat | hoardExitItemCount === N | P1 |

### 4.11 AI, idle, pause

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-53 | No AI on Instructions | phase instructions; empty seats | AI fill path | No AI cmds; empty seats stay unfilled | P0 |
| SIM-54 | AI active Hoard onward | phase level hoard; control AI | Inject C-08 cmd | Hauler moves via same apply path | P0 |
| SIM-55 | Idle 20s → AI | Human silence ≥ 20s virtual | Advance ticks | ai_takeover; control=ai | P0 |
| SIM-56 | Edge pressure 5s → AI | Edge pressure flag + 5s silence | Advance | Takeover earlier than 20s | P1 |
| SIM-57 | Human packet restores | After AI takeover | One human input | human_takeover | P0 |
| SIM-58 | start does not pause | Seat A start=true N ticks; seat B moves | Observe tick + B | tick monotonic; B still moves | P0 |

### 4.12 Fork / end integration (sim side)

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-59 | Fork open hands off to C-10 | Hoard complete | open fork | ForkState fields available; no free-run | P0 |
| SIM-60 | Resolve loads winner level | C-10 returns levelId | load | phase=level; levelId winner; carry preserved | P0 |
| SIM-61 | Full short run tape | levelsAfterHoard=2; stub fork | Instructions→…→End | Exactly 2 post-hoard levels; ScoreReport; min-1-share | P0 |
| SIM-62 | Reconnect continuity | Disconnect mid-carry; AI; rebind grace | Restore | Same seat instanceIds; inventory intact | P0 |

### 4.13 Property / golden harness

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| SIM-63 | No NaN over long tape | 5k ticks random valid inputs | Run | All positions finite | P1 |
| SIM-64 | Ownership invariant soak | Multi-seat loot chaos tape | Every tick | Exclusive owner | P0 |
| SIM-65 | Tick budget metric hook | Inject slow work mock | tick | Overrun flag/metric when > dt | P2 |

---

## 5. Edge cases (design-locked)

| Edge | Expectation |
|---|---|
| Empty hand trip | Trip/push only with empty hands |
| Set multi-contributor | Sim tracks inventories; valuation deferred to C-07 at end |
| Disconnect grace | AI pilots; reconnect restores seat within grace |
| Soft-unique chars | Clash allowed; presentation differentiates |
| Mid-join at exit | Spawn safe; membership in exit set explicit |
| Soft-lock solids | Mid-join spawn never inside solid |
| Pit destroy | Instance destroyed logged; conservation still holds |
| No global pause | Local menu only; server never freezes |
| Hoard not counted | levelsCompleted stays 0 until first post-hoard complete |

---

## 6. Fixtures & determinism

| Fixture | Purpose |
|---|---|
| `box_level` LevelDefinition | Movement / net demos |
| `hoard_01` LevelDefinition | Treasure slots + exit |
| Input tapes: `move-jump.json`, `pickup-drop-throw.json`, `stun-spill-steal.json`, `weight-greed.json`, `full-short-run.json`, `ai-takeover-idle.json` | Golden scenarios |
| Seeds | `rngSeed` fixed per tape (e.g. `42`, `0xC0FFEE`) |
| Virtual clock | Idle 20s/5s via tick count (`humanIdleAiMs` / dt), never real sleep |

**Determinism:** Same seed + tape → same **invariants** (ownership, phase, report) on same CI image. Do **not** assert multi-arch float bit equality for positions; use tolerance or event/invariant checks.

Tape shape (conceptual):

```text
Tape { seed, levelId, seats[], frames[{ tick, inputs[] }], expect{ events?, inventories?, phase?, scoreReport?, invariants } }
```

---

## 7. Mocks / fakes for isolation

| Fake | Use |
|---|---|
| Stub `loadLevel(id)` | Inline grid or parsed fixture without full C-09 |
| Fake C-07 | Real pure package preferred; stub only if package missing early |
| Fake C-08 | Stand-still or walk-right AI; later real decide() |
| Fake C-10 | `forceOptions` / instant resolve to fixed levelId for short-run tapes |
| Room not required | Headless `createSimulation` unit/scenario suite |

---

## 8. Coverage pragmatism

| Area | Target |
|---|---|
| Ownership / spill / phase / levelsAfterHoard | **High** — CI-blocking invariant tests |
| Full trap catalog | MVP subset + stubs; expand with content |
| Float positions | Invariant-based, not % coverage vanity |
| Presentation | Out of scope |

---

## 9. Exit criteria (CI gates)

- [ ] **G3:** P2 two-client movement path backed by SIM-26 + room INT (peer)  
- [ ] **G4:** Treasure ownership invariant tests green (SIM-30, SIM-36–39, SIM-64)  
- [ ] **G5:** Short-run headless tape SIM-61 green before staging E2E  
- [ ] P0 cases SIM-01..09, SIM-13, SIM-18..19, SIM-29..37, SIM-40..42, SIM-53..58, SIM-61 green  
- [ ] `pnpm test:sim` (planned) runs without Phaser  
- [ ] Default config asserts `levelsAfterHoard===2` and `allowGlobalPause===false`  
- [ ] INT-01 / INT-03 / INT-04 must not be broken by sim regressions  

---

## 10. Integration & system links

| Doc / ID | Relationship |
|---|---|
| INT-01 Full short run | SIM-61 headless + room |
| INT-02 Fork lag | C-10 + sim phase gate SIM-24/59 |
| INT-03 Stun steal | SIM-36–37 |
| INT-04 AI takeover | SIM-55–57 |
| INT-05 Reconnect | SIM-62 |
| SYS-H1 Solo short run | System layer over sim behaviors |
| C-07 / C-08 / C-09 / C-10 TEST-PLANs | Peer contracts |

---

## 11. Open risks

| Risk | Mitigation |
|---|---|
| Float drift | Invariant assertions; single authority |
| Tick overrun as traps grow | SIM-65 metrics; stub heavy traps |
| Phase edge mid-join at exit | Explicit spawn + exit membership tests |
| Pause confusion | SIM-58 + docs |

---

## 12. Traceability

| Design section | Cases |
|---|---|
| §4 Tick / no pause | SIM-01, SIM-58 |
| §5 Physics / encumbrance | SIM-26–28, SIM-40–42 |
| §6 Seats / AI / input | SIM-13–25, SIM-53–57 |
| §7 Treasure | SIM-29–39 |
| §8 Traps | SIM-43–47 |
| §9–10 Phase / levelsAfterHoard | SIM-05–12, SIM-59–61 |
| §11 PlayerStats | SIM-48–52 |
| §16 Testing strategy | This document |
