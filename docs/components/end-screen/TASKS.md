# C-11 — End Screen Director — Tasks

Ownership: **SE-1**.  
Estimates: **S** ≈ 0.5 day, **M** ≈ 1 day, **L** ≈ 2 days.  
Frozen: 960×540 layout, ephemeral names, no global pause (Start = skip/confirm), AI never enters scores, run length irrelevant to director.

---

## Task index

| ID | Title | Est | Parallel | Depends on |
|---|---|---|---|---|
| C11-T01 | Fixtures: ScoreReport + EndCinemaData samples | S | yes | — |
| C11-T02 | Ordering & ranking pure helpers | S | yes | C11-T01 |
| C11-T03 | Modifier display model (colors, hide Δ, scroll) | S | yes | C11-T01 |
| C11-T04 | Director state machine skeleton + fake sinks | M | yes | C11-T02 |
| C11-T05 | Count Haul segment (walk-on, toss, sets, total) | L | yes | C11-T04 |
| C11-T06 | Determine Shares segment (titles + % order) | M | yes | C11-T03, C11-T04 |
| C11-T07 | Award Spoils segment (rummage, count-up, step-back) | M | yes | C11-T04 |
| C11-T08 | Name entry model + 60s timer | M | yes | C11-T01 |
| C11-T09 | Name entry view + submit client wiring | M | no | C11-T08, C11-T07 |
| C11-T10 | Skip policy + C2S_EndSkip port | S | yes | C11-T04 |
| C11-T11 | Post-complete await (10s / any) + onComplete | S | yes | C11-T04 |
| C11-T12 | Audio/present cue contract tests | S | yes | C11-T05–T07 |
| C11-T13 | Full director integration (fake clock) | M | no | C11-T05–T11 |
| C11-T14 | Mount in C-01 EndScene + real adapters | M | no | C11-T13, C-01 End host |
| C11-T15 | Edge-case fixture pack (empty, ties, ineligible) | M | yes | C11-T02, C11-T04 |
| C11-T16 | Acceptance / pacing playtest pass | S | no | C11-T14 |

---

## C11-T01 — Fixtures: ScoreReport + EndCinemaData samples

**Description:** Build golden fixtures: (1) balanced four-player haul with sets; (2) heavy penalties / min shares; (3) single eligible human; (4) zero treasure. Align field names with protocol + INTERFACE-DELTA cinema fields.

**Dependencies:** none  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Fixtures importable by unit tests without Phaser
- [ ] At least one fixture exercises set completion popout data
- [ ] `eligibleForHighScore` combinations covered

---

## C11-T02 — Ordering & ranking pure helpers

**Description:** Pure functions: takeGp rank → place 1–4; percent reveal order `[3,2,4,1]`; spoils step-back ascending; stable seatId ties; map tossOrder/exitOrder.

**Dependencies:** C11-T01  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Unit tests for ties and four distinct takes
- [ ] Percent order fixed as 3rd, 2nd, 4th, 1st
- [ ] No dependency on Phaser

---

## C11-T03 — Modifier display model

**Description:** Bucket modifiers Unique/Common × reward/penalty → gold/white/blue/red; exclude delta from view model; overflow scroll flag when count &gt; N (configurable).

**Dependencies:** C11-T01  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Order matches share-modifier-api display section
- [ ] `deltaShares` never present on player-facing DTO
- [ ] Empty modifier list handled

---

## C11-T04 — Director state machine skeleton + fake sinks

**Description:** `EndScreenDirector` with state enum, `start`, `handleAction`, `onComplete`, fake `EndPresentSink` / `AudioCueSink` / clock. Segment runners as injectable steps.

**Dependencies:** C11-T02  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Can run empty segments idle→complete with fakes
- [ ] Dispose is safe mid-run
- [ ] State readonly observable for debugging

---

## C11-T05 — Count Haul segment

**Description:** Implement walk-on → toss loop → set popouts → total flash → optional record fanfare. Wire present sink promises; advance on completion or skip.

**Dependencies:** C11-T04  

**Estimate:** L  

**Parallelizable:** yes (with T06/T07 once T04 done)  

**Acceptance criteria:**
- [ ] Toss order follows `tossOrderSeatIds`
- [ ] Per-item name/value cues emitted
- [ ] Set popout once per completion
- [ ] Fanfare only if threshold beaten
- [ ] Fixture test with instant animations

---

## C11-T06 — Determine Shares segment

**Description:** Per-seat title panels in toss order; then percent reveals in place order with place-specific audio cues.

**Dependencies:** C11-T03, C11-T04  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Titles color order verified against fixture
- [ ] Percent sequence unit/integration asserted
- [ ] Scroll path invoked when many titles

---

## C11-T07 — Award Spoils segment

**Description:** Move-to-pile + rummage; simultaneous take count-up to `takeGp`; step-back smallest→largest with large totals.

**Dependencies:** C11-T04  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Final displayed takes equal report `takeGp`
- [ ] Step-back order ascending by take (stable ties)
- [ ] Skip jumps to end of spoils segment cleanly

---

## C11-T08 — Name entry model + 60s timer

**Description:** Pure model: letter grid/charset, slots 1–12, cursor, delete, confirm; 60s timer via `Clock`; eligibility filter (human && eligible).

**Dependencies:** C11-T01  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Rejects empty confirm
- [ ] Enforces max length 12
- [ ] Timer expiry transitions per DESIGN E14 (discard incomplete MVP)
- [ ] AI seats never enter model

---

## C11-T09 — Name entry view + submit client wiring

**Description:** Phaser/UI view for name entry; wire `HighScoreSubmitClient`; map VALIDATION/CONFLICT/UNAUTHORIZED; call `C2S_NameEntry` when net port present.

**Dependencies:** C11-T08, C11-T07  

**Estimate:** M  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] Successful submit records `HighScoreRow` in `EndCompleteResult`
- [ ] CONFLICT treated as non-fatal (already submitted)
- [ ] Local seat only editable for online MVP

---

## C11-T10 — Skip policy + C2S_EndSkip port

**Description:** Define skip targets per substate; Start maps to skip during cinematics; confirm during full name entry; emit net skip.

**Dependencies:** C11-T04  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Documented skip matrix covered by unit tests
- [ ] No global pause behavior
- [ ] Recording port sees endSkip calls

---

## C11-T11 — Post-complete await + onComplete

**Description:** After spoils/entry: 10s timer or any-advance → `complete` + callback for C-01 → HighScores.

**Dependencies:** C11-T04  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Fake clock fires complete at 10s
- [ ] Any-advance cancels timer and completes
- [ ] Reason field set appropriately

---

## C11-T12 — Audio/present cue contract tests

**Description:** Assert cue order for one golden fixture (toss → set → total → titles → percents → rummage → step-back).

**Dependencies:** C11-T05, C11-T06, C11-T07  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Ordered expectation list green in CI
- [ ] Missing sink methods fail loudly in dev builds

---

## C11-T13 — Full director integration (fake clock)

**Description:** End-to-end director run all segments including name submit fake; reconnect fast-forward case; zero-eligible path.

**Dependencies:** C11-T05, C11-T06, C11-T07, C11-T09, C11-T10, C11-T11  

**Estimate:** M  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] DESIGN acceptance criteria 1–9, 13 covered automatically
- [ ] Completes under simulated time budget

---

## C11-T14 — Mount in C-01 EndScene + real adapters

**Description:** Integrate with C-01 host; bind C-03 end actions; real scores HTTP; net ports; dispose on scene shutdown.

**Dependencies:** C11-T13; C-01 End host (C01-T14)  

**Estimate:** M  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] Live short run (or injected report) plays sequence in browser
- [ ] Complete navigates to HighScores via shell
- [ ] 960×540 layout sanity check

---

## C11-T15 — Edge-case fixture pack

**Description:** Automated cases: empty inventories, all ties, no eligible, validation error retry, soft-unique same characters, missing fanfare threshold.

**Dependencies:** C11-T02, C11-T04  

**Estimate:** M  

**Parallelizable:** yes (with segment work)  

**Acceptance criteria:**
- [ ] Each DESIGN §7 edge case E1–E4, E9, E12, E16 has a test or explicit skip-with-reason
- [ ] No client-side take recomputation assertions (compare display to fixture only)

---

## C11-T16 — Acceptance / pacing playtest pass

**Description:** Human pacing pass: skip fairness, 60s name entry, readability of titles/percents; file notes under `docs/testing/` if process requires (optional short note in PR).

**Dependencies:** C11-T14  

**Estimate:** S  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] Checklist vs DESIGN §9 signed off
- [ ] Pacing issues triaged (too slow/fast segments)

---

## Parallelism guide

```text
T01 ─┬─ T02 ─→ T04 ─┬─ T05
     ├─ T03 ────────┤─ T06
     └─ T08 ─→ T09 ←┤─ T07
                    ├─ T10
                    └─ T11

T05+T06+T07 → T12
T05–T11 → T13 → T14 → T16
T15 parallel after T04
```

Can start before full art: all present sink methods may resolve immediately.
