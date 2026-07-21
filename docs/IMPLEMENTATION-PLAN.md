# Dungeon Haul — Implementation Plan

Build proceeds in **vertical slices** with online multiplayer as a first-class constraint. This document sequences work and tracks phase status; design contracts live under `docs/components/` and `docs/interfaces/`.

Related: [ARCHITECTURE.md](ARCHITECTURE.md), [COMPONENTS.md](COMPONENTS.md), [interfaces/OVERVIEW.md](interfaces/OVERVIEW.md).

### Status snapshot (keep in sync with code)

| Phase | Status | Evidence |
|---|---|---|
| **P0** Foundations | **Done** | Monorepo builds; Vitest green |
| **P1** Rules & content kernel | **Done** | `packages/rules`, `packages/levels` |
| **P2** MVP netcode slice | **Done** | [testing/reports/P2-DEMO.md](testing/reports/P2-DEMO.md) |
| **P3** Core gameplay systems | **Done** | [testing/reports/P3-GAMEPLAY.md](testing/reports/P3-GAMEPLAY.md) |
| **P4** Full game flow shell | Not started | — |
| **P5** Persistence & hardening | Not started | — |
| **P6** Content expansion | Partial (art assets exist; sim/content wiring later) | [art/ASSET-STATUS.md](art/ASSET-STATUS.md) |
| **P7** Stretch | Not started | — |

---

## 0. Principles

1. **Netcode slice before content breadth** — prove 4-seat authoritative play on a blank box level before 19 maps.
2. **Pure rules first** — Share Modifiers and treasure math land with tests before End Screen polish.
3. **Interfaces freeze early** — `packages/protocol` + `packages/rules` public APIs versioned; components mock across boundaries.
4. **MVP is playable online end-to-end**, not feature-complete vs design doc.
5. **AI fill required for MVP** — one human must be able to finish a short run with AI haulers.

---

## 1. Phase overview

| Phase | Name | Goal | Exit criteria | Status |
|---|---|---|---|---|
| **P0** | Foundations | Monorepo, CI, protocol stubs, rules skeleton | CI green; packages build | **Done** |
| **P1** | Rules & content kernel | Pure scoring + level parse + 1 map | Unit tests cover shares + parser | **Done** |
| **P2** | MVP netcode slice | Authoritative room, movement, 2–4 clients | Two browsers jump on shared level | **Done** |
| **P3** | Core gameplay loop | Treasure, weight, spill, traps(subset), AI | Steal/spill feels fair; AI keeps pace | **Done** |
| **P4** | Flow shell | Lobby, Instructions, Hoard, Fork, End | Full short run online | Next |
| **P5** | Persistence & meta | High scores, reconnect polish | Scores survive deploy | Pending |
| **P6** | Content expansion | More levels/traps/biomes | Design path density | Art ahead of code |
| **P7** | Stretch | Couch hybrid, spectators, 60 Hz, matchmaking | Optional | Pending |

---

## 2. Phase details

### P0 — Foundations (Week-scale: short)

**Status:** **Done**

**Work**
- pnpm monorepo: `client`, `server`, `packages/protocol`, `packages/rules` (+ later levels/ai)
- TypeScript strict, ESLint, Vitest (or equivalent)
- Dockerfiles (server + static client)
- CI: install, test, build
- Protocol v0 message stubs (`InputCommand`, `WorldSnapshot`, join/leave) → v1 freeze in P2
- Health endpoint

**Owners:** SE-3/4/5 skeleton; all review protocol.

**Not in P0:** Phaser scenes beyond boot clear-color; real physics.

---

### P1 — Rules & content kernel

**Status:** **Done**

**Work**
- Treasure catalog from design §2.2 (data tables)
- Weight formula API
- Full share modifier predicates + `computeTakes()`
- Tie-break document + tests
- Pixel-map parser + **Level0 Hoard** fixture + empty **BoxLevel** for net tests
- Headless score fixture from recorded `PlayerStats`

**Owners:** SE-6 (rules), SE-7 (levels)

**Exit:** `pnpm test` proves `min shares = 1`, set bonuses, sample haul payouts match expected fixtures. Met via `packages/rules` + `packages/levels` suites.

---

### P2 — MVP netcode slice ⭐ critical path

**Status:** **Done** — [testing/reports/P2-DEMO.md](testing/reports/P2-DEMO.md)

**Work**
- Colyseus (or chosen room host) `HaulSession`
- Lobby REST: create/join code, seat tokens
- Server sim: AABB platforms, run/jump only, 30 Hz
- Client: join, send inputs, render remote transforms (placeholders OK)
- Local prediction for X movement + jump
- Disconnect → AI or freeze seat with grace; reconnect token
- 4 seats always exist (AI idle stand if unused)

**Owners:** SE-3, SE-4, SE-5

**Exit criteria**
- [x] 2 humans on different machines (or browsers) share positions
- [x] Kill network tab → reconnect restores seat within grace
- [x] Third/fourth seats AI or empty-controlled without crashing
- [x] Tick lag metric logged

**Status:** **Done** — see [testing/reports/P2-DEMO.md](testing/reports/P2-DEMO.md).

**Explicitly out of P2:** treasure, traps, end scoring UI, art (those moved to P3 / art track).

---

### P3 — Core gameplay systems

**Work**
- Carry stack, pickup/drop/throw
- Weight slowdown after 3 items
- Stun + spill + pickup lockout
- Trip/push interactions
- Treasure rarity spawn on slots
- Trap MVP: spikes + one timed trap; switches optional
- AI behaviors: average position, pickup, load cap, switch press if present
- Stats counters wired for modifiers

**Owners:** SE-5 core, SE-8 AI, SE-6 hooks, SE-2 present events

**Exit criteria (code)**
- [x] Pickup / drop / throw + dual-seat ownership invariant
- [x] Encumbrance slowdown after free-item threshold
- [x] Stun → spill + lockout; peer can steal
- [x] Trip/push impulse + stats
- [x] Spikes + lightning cycle; other traps stub safely
- [x] Switches (regular + heavy mass)
- [x] Ice / sand surface modifiers
- [x] C-08 pure AI flock / loot cap / switch / stuck (`packages/ai`)
- [x] Headless gameplay + AI unit tests green
- [ ] Human “loot goblin” chaos playtest notes under `docs/testing/reports/` (optional session)

**Status:** **Done** (code + automated tests) — see [testing/reports/P3-GAMEPLAY.md](testing/reports/P3-GAMEPLAY.md).  
Dev client draws free treasure / carry HUD from game atlases; full C-02 presentation remains P4+.

---

### P4 — Full game flow shell

**Work**
- Scenes: Title, Credits, HighScores (read-only mock), Lobby, Instructions, Level, Fork, End
- Instructions: no AI; drop-in; exit gate
- Hoard → Fork → Level → Fork… with `levelsCompleted` cap (MVP may use **2 levels** flag, config 7)
- Fork argue mash server tallies
- End Director consumes `ScoreReport` (cinematics can be staged)
- Attract idle loop

**Owners:** SE-1 (incl. C-11), SE-5 phase machine, SE-2

**Exit:** Four humans (or 1+AI) complete configured run and see takes.

---

### P5 — Persistence & production hardening

**Work**
- PostgreSQL high scores + completion token anti-cheat
- Deploy Fly.io (or chosen host) docker
- Reconnect polish, room TTL, rate limits
- Structured logging / health
- Name entry 60s UX

**Owners:** SE-4, SE-14

**Exit:** Deployed URL; top-25 list updates from real runs.

---

### P6 — Content expansion

**Work**
- Biomes art/pass; traps: crumbling, receding, lightning, gas, falling rock
- Golem / Phantom Hand
- Level pool growth toward design path diagram
- Audio pass against event list
- Balancing weight/AI

**Owners:** SE-7, SE-2, SE-8, design

---

### P7 — Stretch

- Local multi-gamepad seats into same room
- Public matchmaking / quick play
- Spectators
- Delta compression / 60 Hz
- Pause vote
- Mobile controls
- Room migration

---

## 3. MVP definition (shippable slice)

**MVP online session**
1. Create room code on Title/Lobby  
2. 1–4 humans join; AI fills to 4 from Hoard onward  
3. Instructions → Hoard → ≥1 platform level → End scoring (shares + takes)  
4. Optional: one Fork with two stub levels  
5. High score submit for humans  

**MVP non-goals**
- Full 19-level graph  
- All traps/enemies  
- Couch-only mode  
- Generative asset pipeline (Build Plan)  
- Perfect rollback netcode  

---

## 4. Parallel work streams

```text
        P0 Foundations
              |
        +-----+------+
        |            |
       P1 Rules     P1 Levels
        |            |
        +-----+------+
              |
             P2 Netcode slice  ← integration gate
              |
        +-----+------+--------+
        |            |        |
       P3 Gameplay  P4 Flow  P8 Audio(early stubs)
        |            |
        +-----+------+
              |
             P5 Persist/Deploy
              |
             P6 Content
```

**Rules (SE-6)** never blocked by Phaser.  
**Levels (SE-7)** never blocked by netcode (parser tests).  
**Presentation (SE-2)** can mock snapshots from day one.  
**Sim (SE-5)** develops headless before client beauty.

---

## 5. Automated testing strategy (outline)

| Layer | Tools (suggested) | Ownership |
|---|---|---|
| Unit rules | Vitest | SE-6 |
| Unit parser | Vitest + PNG fixtures | SE-7 |
| Protocol codecs | Vitest | SE-3/5 |
| Sim scripts | Headless Node tick driver | SE-5 |
| Room integration | Test client WS harness | SE-3/4 |
| Client smoke | Playwright optional later | SE-1 |
| CI gate | PR must pass unit + sim scripts | all |

**Golden tests (priority)**
1. Empty-handed penalty + min 1 share  
2. Complete vegetable set bonus math  
3. Leader of the Pack only if first every level  
4. Autopilot penalty when AI control > 50%  
5. Spill lockout allows other player pickup  
6. Fork vote: higher mash wins; tie policy  

**Determinism policy**
- Rules: bit-stable on integers (use integer GP and rational shares carefully; document float use).  
- Physics: single server authority; tests use fixed seed + input tapes, assert invariants (no soft-lock, conservation of instance IDs) more than cross-machine bitwise physics.

---

## 6. Human playtest sessions (outline)

Testers expand scripts under `docs/testing/` later. Skeleton:

### Session A — Net feel (post-P2)
- **Players:** 2–4 remote  
- **Script:** run/jump only; stand at edges; jump toward each other  
- **Metrics:** “feels laggy?” 1–5; desync sightings  
- **Fault inject:** one player tab-background 10s; one refresh  

### Session B — Loot chaos (post-P3)
- **Script:** stack 4+ treasures; trip partner; steal spill  
- **Observe:** weight clarity, lockout fairness, throw aim  

### Session C — AI companion (post-P3)
- **Players:** 1 human  
- **Script:** complete short level  
- **Observe:** AI blocks paths? hogs loot? presses switches?  

### Session D — Full loop (post-P4)
- **Script:** lobby → instructions → hoard → fork → level → end  
- **Observe:** UI readability of share titles; timing of cinematics skip  

### Session E — Score trust (post-P5)
- **Script:** compare on-screen take vs expectations from known modifiers  
- **Observe:** high score entry multi-user  

**Facilitation notes**
- Record join codes and build SHA  
- Capture RTT (where easy)  
- File bugs with seatId + approx tick/time  

---

## 7. Integration gates (do not skip)

| Gate | Requirement |
|---|---|
| G1 | Protocol v0 reviewed & merged |
| G2 | Rules package ≥80% modifier coverage tests |
| G3 | P2 two-client movement demo recorded |
| G4 | Treasure ownership invariant tests green |
| G5 | End-to-end short run on staging |
| G6 | Load smoke: N rooms × 4 seats memory OK |

---

## 8. Suggested near-term checklist

- [ ] Confirm open questions in [ARCHITECT-OPEN-QUESTIONS.md](decisions/ARCHITECT-OPEN-QUESTIONS.md)  
- [ ] Freeze protocol field names  
- [ ] Implement P0/P1  
- [ ] P2 netcode slice demo  
- [ ] Expand to P3–P5 MVP ship  

---

## 9. Mapping to prior Build Plan (informative)

| Build Plan phase | Disposition |
|---|---|
| FastAPI + uv backend | Replaced by Node/TS game server; optional Python only if desired later for tools |
| Phaser 3 client | **Kept** |
| Cloud Run deploy | Optional for static/API; **game rooms → Fly.io** (or equivalent) |
| Generative assets | Deferred to art track |
| Local multi input plugin | Stretch; online seats primary |
| Share modifier algorithm | **Kept as pure package** (language: TS not Phaser-bound) |
