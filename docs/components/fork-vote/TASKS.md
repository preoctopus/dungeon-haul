# C-10 — Fork Vote Subsystem — Tasks

| Field | Value |
|---|---|
| Component | C-10 Fork Vote Subsystem |
| Ownership | SE-5 (with SE-1 UI) |
| Design | [DESIGN.md](DESIGN.md) |
| Task ID scheme | `C10-T##` |
| Constraint | Documentation already done; implementation tasks are for **future code phases** |

---

## Legend

| Status | Meaning |
|---|---|
| pending | Not started |
| blocked | Waiting on peer |
| done | Complete |

Maps to Implementation Plan **P4** primarily; unit tests can land in **P1/P3** with pure module.

**Implementation status (P4):** Core module done — `server/src/sim/fork.ts`
(`ForkVoteModule`, `pickForkPair`) covers T01–T10; C-06 integration
(`Simulation.enterFork`/`stepFork`, `HaulSession.enterFork`/`broadcastForkState`)
covers T15–T18, T20; the fallback AI driver (T12) is implemented since C-08
`decide()` has no fork-phase handling yet (T11 still open). Mid-join/disconnect
continuity (T13/T14) and stretch items (T19, T21–T26) remain open. Tests:
`server/test/sim/forkVote.test.ts` (pure module) + `server/test/sim/fork.test.ts`
(C-06 integration).

---

## Pure module & data (can precede full sim)

### C10-T01 — ForkConfig defaults
- **Desc:** Define `ForkConfig` (`windowTicks`, tieBreak `selection_then_rng`, `preferYOverX`, AI chances if fallback, `defaultSelection: "A"`). No global pause flags.
- **Deps:** none
- **Accept:** Defaults documented; unit imports config object.

### C10-T02 — Level pool loader types
- **Desc:** Specify/load `level-pool.json` shape (`playablePool`, `hoardId`); validate `playablePool.length >= 2` and `>= levelsAfterHoard` warning.
- **Deps:** C-09 content layout
- **Accept:** CI fixture pool validates; empty pool fails closed.

### C10-T03 — Unplayed pair picker (Q4-A)
- **Desc:** Pure function `pickForkPair(pool, played, rng) → [idA, idB]` with distinct ids; exhaustion/fallback when `<2` unplayed (DESIGN §5.2).
- **Deps:** C10-T02, session rng helper
- **Accept:** Seeded tests: no duplicates; excludes played while available; exhaustion path returns 2 distinct from pool when pool ≥ 2.

### C10-T04 — ForkOption enrichment
- **Desc:** Map levelIds → `ForkOption` with biome + displayName from level meta (stub meta OK in tests).
- **Deps:** C-09 meta, C10-T03
- **Accept:** Options expose biome for UI contract.

---

## Core vote machine

### C10-T05 — ForkVoteModule open/tick/resolve shell
- **Desc:** `open` sets options, zero tallies, per-seat selection default A, `endsAtTick = tick + windowTicks`; `tick` returns public state; auto-resolve at end.
- **Deps:** C10-T01, C10-T03, C10-T04
- **Accept:** After windowTicks, `resolved` present with levelId ∈ options.

### C10-T06 — Selection from axes
- **Desc:** Apply axes.y primary, axes.x alias; y wins when both set; zero keeps prior.
- **Deps:** C10-T05, input-commands
- **Accept:** Table-driven tests for all axis combos.

### C10-T07 — Argue pulse edge + rate limit
- **Desc:** jump or action edge → +1 to selected option tally; max 1 pulse per seat per tick; hold does not auto-repeat without edge.
- **Deps:** C10-T05, C10-T06
- **Accept:** Hold 10 ticks → 1 pulse; press/release/press → 2; both jump+action same tick → 1 pulse.

### C10-T08 — Majority resolution
- **Desc:** Higher tally wins; set `reason: "majority"`.
- **Deps:** C10-T07
- **Accept:** Golden: higher mash wins (Impl Plan).

### C10-T09 — Tie-break policy
- **Desc:** On tally tie (incl. 0–0): selection plurality, then seeded rng; `reason: "tie_break"`.
- **Deps:** C10-T08
- **Accept:** Fixed seed stable; seats split 2–2 selection with equal tallies → rng path covered.

### C10-T10 — Public ForkState projection
- **Desc:** Build structure matching `S2C_ForkState` (options, tallies, endsAtTick; optional seat selections).
- **Deps:** C10-T05, protocol
- **Accept:** Protocol contract field presence test.

---

## AI & seats

### C10-T11 — AI fork inputs via C-08 (preferred)
- **Desc:** Document SimView phase=fork; C-08 emits selection + mild pulses. Integrate when C-08 ready.
- **Deps:** C-08, C-06 phase
- **Accept:** 4 AI seats complete fork without hang; pulse rate below max mash bound over window.

### C10-T12 — Fallback mild AI driver (if C-08 late)
- **Desc:** Temporary in-module AI input generator with `pulseChance` / `switchChance`; remove when C-08 covers fork.
- **Deps:** C10-T05
- **Accept:** Same accept as T11; flag `usingFallbackAi: true` in dev logs only.

### C10-T13 — Mid-join seat during fork
- **Desc:** New seat gets default selection A, tallies unchanged until they pulse.
- **Deps:** C10-T05, C-06 bind
- **Accept:** Join mid-window → can pulse; no crash on seat bind.

### C10-T14 — Disconnect / AI takeover continuity
- **Desc:** When control flips to AI mid-fork, subsequent ticks use AI inputs; window does not reset.
- **Deps:** C06-T07, C10-T11/T12
- **Accept:** endsAtTick unchanged across takeover; resolve still fires on time.

---

## Integration with C-06

### C10-T15 — Phase dispatcher wiring
- **Desc:** When `phase==fork`, C-06 routes inputs to ForkVoteModule and skips free-run physics.
- **Deps:** C06-T02, C10-T05
- **Accept:** Movement axes do not translate hauler x/y during fork.

### C10-T16 — Open on Hoard complete
- **Desc:** Hoard exit → fork open with current played set (hoard marked played); `levelsCompleted` stays 0.
- **Deps:** C06-T23, C10-T03
- **Accept:** Integration: after hoard, ForkState options length 2, neither is hoardId.

### C10-T17 — Resolve → load level
- **Desc:** On resolve, C-06 loads winning levelId, marks played, phase=level; emit phase change + optional fork_resolved event.
- **Deps:** C06-T25, C10-T08
- **Accept:** Snapshot levelId equals winner; inventories preserved.

### C10-T18 — Second fork under levelsAfterHoard=2
- **Desc:** After first post-hoard level, open fork again with updated unplayed set; after second level, **no** third fork (end).
- **Deps:** C06-T24, C10-T16, C10-T17
- **Accept:** Exactly two fork opens in default short run; second pair ≠ first when pool allows.

### C10-T19 — Config levelsAfterHoard=7 path smoke
- **Desc:** Headless: complete 7 post-hoard levels with auto-mash AI; forks each intermediate boundary.
- **Deps:** C10-T18, larger pool fixture
- **Accept:** `levelsCompleted` reaches 7; end scoring reached; no pair picker throw.

---

## Protocol, UI handoff, polish

### C10-T20 — Room broadcast S2C_ForkState
- **Desc:** Room sends ForkState on open and each tick (or on change); clients receive tallies/timer.
- **Deps:** C10-T10, C-04/C-05 room
- **Accept:** Two clients see same tallies within one tick skew.

### C10-T21 — SE-1 UI contract note / fixtures
- **Desc:** Provide mock ForkState JSON fixtures for client Fork scene (biomes, tallies, endsAtTick).
- **Deps:** C10-T10
- **Accept:** Fixtures checked into test/fixtures or docs example; SE-1 can mock without server.

### C10-T22 — Telemetry hooks
- **Desc:** Log fork open/resolve with sessionId, options, tallies, reason (C-14 structured log).
- **Deps:** C10-T05
- **Accept:** Resolve log line includes winning levelId + reason.

### C10-T23 — Playtest Session C/D harness notes
- **Desc:** Document manual script: opposite votes, mash fairness, AI-only fork (links testing/ later).
- **Deps:** design only
- **Accept:** Short checklist in this TASKS or testing placeholder referenced.

---

## Stretch

### C10-T24 — Fixed level-graph legs mode
- **Desc:** Optional config `forkMode: "graph" | "random_unplayed"`; graph mode reads level-graph.json legs by `afterLevelsCompleted`.
- **Deps:** C10-T03, content graph
- **Accept:** Graph mode ignores random pair; Q4-A remains default.

### C10-T25 — Early resolve when all humans agree
- **Desc:** If all human seats selected same option for N ticks and min window elapsed, resolve early.
- **Deps:** C10-T05
- **Accept:** Feature-flagged off by default.

### C10-T26 — Follow-majority AI policy
- **Desc:** AI selection tracks leading tally; medium pulse rate.
- **Deps:** C10-T11
- **Accept:** Tunable policy enum on AI config.

---

## Suggested implementation order

```text
T01 → T02 → T03 → T04 → T05 → T06 → T07 → T08 → T09 → T10
  → T12 (or T11) → T15 → T16 → T17 → T18 → T13 → T14
  → T19 → T20 → T21 → T22 → T23 → stretch
```

Parallel: T11 with SE-8; T21 with SE-1 anytime after T10.

---

## Cross-component coordination

| Peer | Sync point |
|---|---|
| SE-5 C-06 | open/resolve/load (T15–T18) |
| SE-7 Levels | pool + meta biomes (T02, T04) |
| SE-8 AI | fork InputCommand policy (T11) |
| SE-1 Shell | Fork scene fixtures (T21) |
| SE-3 Net | S2C_ForkState wire (T20) |
| Product | Q4-A / Q8-A locked — do not re-litigate |

---

## Task index

| ID | Title | Phase |
|---|---|---|
| C10-T01 | ForkConfig defaults | P3/P4 |
| C10-T02 | Level pool loader | P3/P4 |
| C10-T03 | Unplayed pair picker (Q4-A) | P3/P4 |
| C10-T04 | ForkOption enrichment | P3/P4 |
| C10-T05 | Module open/tick/resolve | P4 |
| C10-T06 | Selection from axes | P4 |
| C10-T07 | Argue pulse edge + rate | P4 |
| C10-T08 | Majority resolution | P4 |
| C10-T09 | Tie-break policy | P4 |
| C10-T10 | Public ForkState projection | P4 |
| C10-T11 | AI via C-08 | P4 |
| C10-T12 | Fallback mild AI | P4 |
| C10-T13 | Mid-join during fork | P4 |
| C10-T14 | Disconnect continuity | P4 |
| C10-T15 | Phase dispatcher wiring | P4 |
| C10-T16 | Open on Hoard complete | P4 |
| C10-T17 | Resolve → load level | P4 |
| C10-T18 | Second fork / end (default 2) | P4 |
| C10-T19 | levelsAfterHoard=7 smoke | P4/P5 |
| C10-T20 | Broadcast S2C_ForkState | P4 |
| C10-T21 | UI mock fixtures | P4 |
| C10-T22 | Telemetry hooks | P5 |
| C10-T23 | Playtest harness notes | P4 |
| C10-T24 | Graph legs mode | Stretch |
| C10-T25 | Early resolve | Stretch |
| C10-T26 | Follow-majority AI | Stretch |
