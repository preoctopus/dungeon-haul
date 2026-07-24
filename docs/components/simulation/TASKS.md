# C-06 — Authoritative Simulation — Tasks

| Field | Value |
|---|---|
| Component | C-06 Authoritative Simulation |
| Ownership | SE-5 |
| Design | [DESIGN.md](DESIGN.md) |
| Task ID scheme | `C06-T##` |
| Constraint | Design frozen; code lives in `server/src/sim/`. P2–P3 tasks largely **done** — see task index Status column. |

Dependencies on other components are noted; mock/stub allowed until those land.

---

## Legend

| Status | Meaning |
|---|---|
| pending | Not started |
| blocked | Waiting on interface/peer |
| done | Complete |

Phases map to [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md): P2 netcode slice, P3 gameplay, P4 flow, P5 polish.

---

## P2 — Netcode slice foundation

### C06-T01 — Session config & sim shell
- **Desc:** Define `SessionConfig` (tickRate 30, `levelsAfterHoard` default **2**, idle thresholds, `allowGlobalPause: false`) and empty `createSimulation` / `tick()` that advances tick counter only.
- **Deps:** protocol stubs (P0)
- **Accept:** Headless loop runs 30 ticks/s wall-clock test with fixed dt; config default asserts `levelsAfterHoard === 2`.

### C06-T02 — Phase machine skeleton
- **Desc:** Implement phase enum transitions: lobby → instructions → level → fork → level → end_* → closed. Hoard as `phase=level` + hoard levelId. Wire `levelsCompleted` vs `levelsAfterHoard` end/fork branch.
- **Deps:** C06-T01
- **Accept:** Unit table tests for transition matrix; with `levelsAfterHoard=2`, second post-hoard level complete enters `end_count` not fork; pause/start input never freezes tick.

### C06-T03 — Four hauler seats
- **Desc:** Always allocate seats 0–3 with character, control human/ai, body pose, empty carry, stats zeroed. `bindHuman` / `releaseHuman` / soft-takeover preserve pose+inventory.
- **Deps:** C06-T01
- **Accept:** Snapshot always lists 4 haulers; soft-takeover keeps carry stack.

### C06-T04 — Input queue & applyInput
- **Desc:** Per-seat command queue; seq dup/gap rules; axes validation; stunned no-op; phase gate for free-run; edge detect for jump/action.
- **Deps:** C06-T03, input-commands contract
- **Accept:** Contract tests from input-commands.md § Test cases 1,4,5 (jump edge, stun no-op, AI/human same shape).

### C06-T05 — AABB platforms, run, jump
- **Desc:** Gravity, run accel, jump impulse, grounded detection vs solid grid from stub/BoxLevel `LevelDefinition`. Fixed dt only.
- **Deps:** C06-T04, C-09 BoxLevel fixture (or inline test grid)
- **Accept:** Input tape: run right, jump onto platform; positions stable; no NaN; two seats don’t share body state.

### C06-T06 — Snapshot & event emission
- **Desc:** Build `WorldSnapshot` + event list each tick; `lastProcessedInputSeq` per seat; phase/levelId/levelsCompleted fields.
- **Deps:** C06-T05
- **Accept:** Shape matches netcode-messages; integration with room can broadcast (room task separate).

### C06-T07 — Idle AI takeover hooks
- **Desc:** Track `lastHumanInputTick`; after 20s silence or 5s+edge pressure, flip `control` to AI and emit `ai_takeover`; human packet → `human_takeover`.
- **Deps:** C06-T03, C06-T04
- **Accept:** Synthetic clock test advances ticks without inputs → AI; one input restores human.

### C06-T08 — AI input injection path
- **Desc:** Before integrate, for `control==AI` seats, pull `InputCommand` from C-08 (stub OK: stand still or walk right). No AI on instructions phase.
- **Deps:** C06-T04, C-08 stub
- **Accept:** Instructions: AI seats inactive; level/hoard: AI command moves hauler via same apply path.

### C06-T09 — No global pause verification
- **Desc:** Explicitly document and test that `start` does not set a sim-paused flag; peers continue; optional local-only note in comments.
- **Deps:** C06-T02, C06-T04
- **Accept:** Test: seat A start=true for N ticks; seat B still moves; `tick` monotonically increases.

---

## P3 — Core gameplay

### C06-T10 — Level load from LevelDefinition
- **Desc:** Load grid, spawns, exit AABB, treasure slots, trap bindings; place haulers; reset stun/lockout; keep inventories across levels.
- **Deps:** C-09 loader, C06-T05
- **Accept:** Hoard + BoxLevel load; spawns non-overlapping; exit zone non-empty.

### C06-T11 — Treasure spawn (seeded)
- **Desc:** Roll slot treasures via rules `rollTreasureDef` + session rng; enforce unique-in-play policy for Unique/Set.
- **Deps:** C-07 catalog, C06-T10
- **Accept:** Same seed → same defIds; no duplicate live uniques.

### C06-T12 — Pickup / drop / throw
- **Desc:** Duck pickup grant; action+down drop top; action+up throw with velocity; stack order top-first; events pickup/drop/throw.
- **Deps:** C06-T11
- **Accept:** Input-commands tests 2–3; dual-seat race → single owner invariant.

### C06-T13 — Encumbrance integration
- **Desc:** Call `computeEncumbrance` each tick from carry; apply speed/jump multipliers; set `speedZeroFromWeight` when multiplier hits 0.
- **Deps:** C-07, C06-T12
- **Accept:** 0–3 items full speed; 4+ reduced; enough items → 0 speed flag.

### C06-T14 — Stun, spill, pickup lockout
- **Desc:** Stun sets timer; spill all carried with velocities; lockout prevents owner re-pickup; peer can steal; events spill/stun.
- **Deps:** C06-T12
- **Accept:** Golden: spill lockout allows other player pickup (Impl Plan golden #5).

### C06-T15 — Trip / push
- **Desc:** Empty-hands action near peer applies impulse; stats hitsDealt/hitsTaken; event trip.
- **Deps:** C06-T05, C06-T12
- **Accept:** Tape: A trips B → B velocity changes; counters increment once per resolved hit.

### C06-T16 — Surfaces ice / sand
- **Desc:** Friction and max-speed modifiers from cell type under feet.
- **Deps:** C06-T05, C-09 palette cells
- **Accept:** Ice slide distance > brick; sand max speed < brick (thresholds in config).

### C06-T17 — Trap MVP (spikes + one timed)
- **Desc:** Spikes on contact stun+spill; one timed trap (e.g. lightning cycle) stub or full; unknown traps log-once stub.
- **Deps:** C06-T14, C06-T10
- **Accept:** Walk into spikes → stunned + empty carry; trap_trigger event.

### C06-T18 — Switches (standard + heavy)
- **Desc:** Overlap+ground press toggles linked devices; heavy switch requires mass threshold (players + treasure weight).
- **Deps:** C06-T10, C06-T13
- **Accept:** Unit: 1 light hauler fails heavy; 3 unloaded or weighted combo succeeds (design threshold).

### C06-T19 — Level exit & order stats
- **Desc:** Exit AABB membership; exit order events; first/last counters; level complete when all active haulers exited.
- **Deps:** C06-T10
- **Accept:** Four seats exit in order → correct first/last stats; level complete once.

### C06-T20 — PlayerStats wiring (session-long)
- **Desc:** Air/ground ticks, trapsHit, control ticks/swaps, hoardExitItemCount snapshot on hoard exit, final counts, goat flag hook, chest/common-only flags.
- **Deps:** C06-T08, C06-T12, C06-T14, C06-T19
- **Accept:** Fixture run produces ScoreContext-ready stats for C-07 tests.

### C06-T21 — Mid-join spawn policy
- **Desc:** On bind during level/fork, spawn at safe point (spawn or near average human position); do not soft-lock in solids.
- **Deps:** C06-T03, C06-T10
- **Accept:** Join mid-level → valid free cell; inventory empty for new human unless soft-takeover of AI.

---

## P4 — Flow integration

### C06-T22 — Instructions phase rules
- **Desc:** Load instructions map; no AI controllers; all active humans exit → transition load Hoard.
- **Deps:** C06-T02, C06-T08, C06-T10
- **Accept:** AI does not appear; 1 human exit alone completes when only one active human.

### C06-T23 — Hoard → Fork handoff
- **Desc:** On hoard complete, set phase fork; invoke C-10 to open vote with pool; do not increment `levelsCompleted` for hoard.
- **Deps:** C-10, C06-T19
- **Accept:** After hoard, `levelsCompleted===0`, phase fork, ForkState message fields available.

### C06-T24 — Post-level Fork / End branch
- **Desc:** After post-hoard level complete: increment `levelsCompleted`; if `< levelsAfterHoard` → fork else → end_count.
- **Deps:** C06-T02, C06-T23, C-10
- **Accept:** Default 2: L1→fork, L2→end; config 7: six forks after hoard pattern.

### C06-T25 — Load level from fork winner
- **Desc:** On C-10 resolve, receive `levelId`, load level, phase=level, preserve hauls.
- **Deps:** C-10, C06-T10
- **Accept:** Winner path’s levelId loads; treasure re-rolled; carry preserved.

### C06-T26 — End scoring invocation
- **Desc:** Build ScoreContext; call evaluateModifiers + computeTakes; emit ScoreReport + completionToken; enter end sub-phases without re-score.
- **Deps:** C-07, C06-T20
- **Accept:** Min-1-share invariant; report seats match 4; re-entry to computeTakes not called on skip.

### C06-T27 — End skip / name entry input routing
- **Desc:** Phase-gate inputs to C2S_EndSkip / name entry handling (may be room-assisted); sim does not free-run.
- **Deps:** C06-T02, C06-T26
- **Accept:** Movement inputs ignored in end_*; skip advances sub-phase when allowed.

---

## P5 — Hardening

### C06-T28 — Reconnect state continuity
- **Desc:** On human rebind within grace, restore seatId inventory stats; full snapshot resync (room).
- **Deps:** room reconnect, C06-T03
- **Accept:** Disconnect mid-carry → AI pilots → reconnect same instanceIds in carry.

### C06-T29 — Tick budget metrics hooks
- **Desc:** Expose last tick duration / overrun flag for C-14.
- **Deps:** C06-T01
- **Accept:** Overrun logged when tick work > dt (test injects sleep mock if needed).

### C06-T30 — Headless golden input tapes
- **Desc:** Scripted multi-seat tapes for: movement, spill-steal, weight, exit order, full short run (hoard+2 levels) with stub fork.
- **Deps:** C06-T14, C06-T24, C06-T26
- **Accept:** CI runs tapes; ownership + phase + report invariants green (Impl Plan G4–G5).

### C06-T31 — Pit destroy treasure (if content needs)
- **Desc:** Free treasure entering pit cells destroyed; loss stats; optional unique return-to-pool.
- **Deps:** C06-T11, C-09 pit cell
- **Accept:** Instance leaves world; conservation log shows destroyed.

### C06-T32 — Crumbling / receding / golem stubs
- **Desc:** Implement or explicitly stub remaining trap types with one-shot log; no crash on unknown cell.
- **Deps:** C06-T17
- **Accept:** All palette trap semantics either behave or stub without throw.

---

## Stretch (post-MVP)

### C06-T33 — Shared pure kinematics package for client prediction
- **Desc:** Extract movement integrate step usable by C-04 prediction.
- **Deps:** C06-T05
- **Accept:** Client helper matches server for run/jump on empty level within epsilon.

### C06-T34 — Delta snapshots
- **Desc:** Optional delta compression when profiling requires.
- **Deps:** C06-T06, ADR stretch
- **Accept:** Bandwidth reduced; full snapshot still on join/resync.

### C06-T35 — 60 Hz tick option
- **Desc:** Config tickRate 60 with validated headroom.
- **Deps:** C06-T29
- **Accept:** Feature-flagged; MVP remains 30.

---

## Suggested implementation order

```text
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09
  → T10 → T11 → T12 → T13 → T14 → T15 → T16 → T17 → T18 → T19 → T20 → T21
  → T22 → T23 → T24 → T25 → T26 → T27
  → T28 → T29 → T30 → (T31–T32) → stretch
```

Parallel: T07/T08 with T05 after T04; T16 with T17 after T10.

---

## Cross-component coordination checklist

| Peer | Sync point |
|---|---|
| SE-3 Net client | Snapshot fields, lastProcessedSeq (T06) |
| SE-4 Room/Lobby | Seat bind events, welcome tickRate, config levelsAfterHoard |
| SE-6 Rules | Encumbrance + end score (T13, T26) |
| SE-7 Levels | LevelDefinition + BoxLevel/Hoard (T10) |
| SE-8 AI | SimView + no instructions AI (T08) |
| SE-5 C-10 | Fork open/resolve API (T23–T25) |
| SE-1 End Director | ScoreReport only (T26) |

---

## Task index

| ID | Title | Phase | Status |
|---|---|---|---|
| C06-T01 | Session config & sim shell | P2 | done |
| C06-T02 | Phase machine skeleton | P2 | partial (level-only; full machine P4) |
| C06-T03 | Four hauler seats | P2 | done |
| C06-T04 | Input queue & applyInput | P2 | done |
| C06-T05 | AABB platforms, run, jump | P2 | done |
| C06-T06 | Snapshot & event emission | P2 | done |
| C06-T07 | Idle AI takeover hooks | P2 | done (20s path) |
| C06-T08 | AI input injection path | P2/P3 | done (`packages/ai`) |
| C06-T09 | No global pause verification | P2 | done |
| C06-T10 | Level load | P3 | done (ctor load) |
| C06-T11 | Treasure spawn | P3 | done |
| C06-T12 | Pickup / drop / throw | P3 | done |
| C06-T13 | Encumbrance | P3 | done |
| C06-T14 | Stun, spill, lockout | P3 | done |
| C06-T15 | Trip / push | P3 | done |
| C06-T16 | Ice / sand surfaces | P3 | done |
| C06-T17 | Trap MVP | P3 | done |
| C06-T18 | Switches | P3 | done |
| C06-T19 | Level exit & stats | P3 | done |
| C06-T20 | PlayerStats wiring | P3 | done (session counters; end score wiring done C06-T26) |
| C06-T21 | Mid-join spawn | P3 | partial (soft-takeover preserve) |
| C06-T22 | Instructions phase | P4 | done |
| C06-T23 | Hoard → Fork | P4 | done |
| C06-T24 | Fork / End branch | P4 | done |
| C06-T25 | Load fork winner level | P4 | done (real C-10 `ForkVoteModule`, not stub timer) |
| C06-T26 | End scoring | P4 | done |
| C06-T27 | End input routing | P4 | pending |
| C06-T28 | Reconnect continuity | P5 | partial (P2 room grace) |
| C06-T29 | Tick budget metrics | P5 | partial (lag log) |
| C06-T30 | Golden input tapes | P5 | pending |
| C06-T31 | Pit destroy treasure | P5 | pending |
| C06-T32 | Trap stubs expansion | P5 | partial (log-once stubs) |
| C06-T33 | Shared kinematics | Stretch | pending |
| C06-T34 | Delta snapshots | Stretch | pending |
| C06-T35 | 60 Hz option | Stretch | pending |
