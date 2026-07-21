# C-11 — End Screen Director — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-11  
> **Owner cluster:** SE-1

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Director state machine | Three acts: Counting the Haul → Determining Shares → Awarding Spoils → name entry / await advance |
| Authority display | Consume `ScoreReport` + `EndCinemaData` only — **never** recompute takes/shares |
| Ordering | Toss order (slowest→fastest); title color order; % reveal **3rd, 2nd, 4th, 1st** by `takeGp`; spoils step-back ascending |
| Skip | Start skips cinematic segment / confirms entry; `C2S_EndSkip` when wired; no global pause |
| Name entry | 60s timer; 1–12 allowlist charset; humans eligible only; AI never; REST submit + optional `C2S_NameEntry` |
| Cue sinks | AudioCueSink + EndPresentSink call order (fake sinks) |
| Soft-unique UX | Seat labels when characters clash |
| Layout | Logical 960×540 child of End scene |
| Phase nudge | Optional server `end_*` phase fast-forward on reconnect |

### Out of scope

| Out | Owner |
|---|---|
| Evaluating modifiers / `computeTakes` | C-07 |
| Authoring `ScoreReport` | C-06 + C-07 server |
| Persisting scores / anti-cheat | C-12 server |
| Scene graph / attract / lobby | C-01 |
| Parallax / level rendering | C-02 (may supply primitives) |
| Device mapping | C-03 |
| WS transport | C-04 |
| Global pause | Forbidden (Q10) |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Consumes | [netcode-messages.md](../../interfaces/netcode-messages.md) `ScoreReport`, end phases |
| Consumes | [share-modifier-api.md](../../interfaces/share-modifier-api.md) display order (colors; hide Δ) |
| Consumes | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) submit body |
| Consumes | [input-commands.md](../../interfaces/input-commands.md) end schemes → `EndUserAction` |
| Produces | Present/audio cues; submit; skip/name net port; `onComplete` to C-01 |
| Delta | [INTERFACE-DELTA.md](../INTERFACE-DELTA.md) cinema fields |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | `ordering` ranks; modifier color buckets; name charset/length; skip policy table; set-popout planner once | CI pure TS |
| **Property** | For any four distinct `takeGp`, % order is places [3,2,4,1]; step-back sorted ascending; ties stable by seatId | CI (optional property lib) |
| **Scenario** | Full director run with fake clock + instant present sinks; multi-segment skip; name entry success/error/timeout | CI |
| **Visual smoke** | Title panel colors; % stingers pacing; name entry readability | Manual / Session F |
| **Contract** | Submit args match high-score API | CI with fake HTTP |
| **Integration** | Mounted in C-01 EndScene with real adapters | INT-12, SYS end path |

Coverage pragmatism: pure helpers ≥ high coverage; director orchestration scenario-covered; Phaser views manual/visual.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| END-01 | Sequence order count→shares→spoils→entry | Fixture balanced report + cinema; fake clock/sinks | `start` full run without skip | States walk count_walkon→…→name_entry→await_advance→complete; never skip act without action | P0 |
| END-02 | Authority: no client recompute | Report with known takes; spy pure rules | Run director; inspect displayed takes/% | Display equals `ScoreReport` fields only; rules engine not called | P0 |
| END-03 | Toss order slowest→fastest | `tossOrderSeatIds` = [2,0,3,1] | Observe present `tossItem` seat order | Seats processed in tossOrder; exit walk-on uses `exitOrderSeatIds` | P0 |
| END-04 | Title color order Unique gold→common white→penalty blue→unique red | Seat with one of each uniqueness×kind | `showTitlePanel` view model | Order matches share-modifier display; **deltaShares absent** from player-facing DTO | P0 |
| END-05 | Percent reveal 3rd, 2nd, 4th, 1st by takeGp | Four distinct takes | After titles, observe `revealPercent` place sequence | Places [3,2,4,1]; stingers map place_1…place_4 correctly | P0 |
| END-06 | Spoils step-back smallest→largest | Distinct takeGp | After rummage/count-up | `stepBack` order ascending by take; finals = report `takeGp` | P0 |
| END-07 | Stable ties by seatId | Two seats equal takeGp | Rank places and % order | Tied seats ordered seatId ascending; no crash | P0 |
| END-08 | Start skips segment; server not paused | Mid count_tossing | `handleAction({type:"skip"})` | Advances per skipPolicy; `EndNetPort.endSkip` called when wired; no pause protocol | P0 |
| END-09 | Skip spam coalesced | Rapid skip during titles | Many skips in one frame | One skip per segment; no illegal empty name confirm | P0 |
| END-10 | AI seats never name entry | AI eligible=false; human AI mix | Reach post spoils | AI never `showNameEntry`; only human && eligibleForHighScore | P0 |
| END-11 | No eligible → skip name_entry | All ineligible | After spoils | Transition spoils_stepback → await_advance (no name_entry) | P0 |
| END-12 | Name entry charset/length client preview | Name model unit | Type invalid chars; 0 and 13 length | Allowlist only; length 1–12; empty confirm ignored | P1 |
| END-13 | Name entry 60s timeout discards incomplete | Fake clock; partial name | Advance 60s | MVP: discard incomplete, advance; complete callback reason timeout/done | P0 |
| END-14 | Submit success + CONFLICT success-equivalent | Fake scoresApi 201 then CONFLICT | Submit same seat twice | First stores row; CONFLICT treated success-equivalent for UX | P0 |
| END-15 | Submit VALIDATION stays in entry | Fake scoresApi VALIDATION | Confirm invalid name | Inline error; remain until fix or timer; token not wrongly burned | P0 |
| END-16 | Set popout once on completing instance | Cinema setCompletions | Toss stream hits completingInstanceId | One set popout per completion; multi-contributor seats listed | P1 |
| END-17 | Record fanfare only when threshold beaten | totalTreasureGp vs highScoreThresholdGp | Flash total both ways | Fanfare only if total exceeds threshold; missing threshold → no fanfare | P1 |
| END-18 | Empty inventory seat still in titles/%/spoils | One seat items=[] | Full run | Toss no-ops items; titles/percents/spoils still run for seat | P1 |
| END-19 | Zero total haul | totalTreasureGp=0 | Full run | Flash 0; no record fanfare; modifiers still displayable | P1 |
| END-20 | Soft-unique seat labels | Two seats same CharacterId | Title panels / nameplates | Distinct seatId/tint/name labels | P1 |
| END-21 | Post-complete 10s / any-button | await_advance | Wait 10s **or** advance action | `onComplete` fires once; reason done/user_advance | P1 |
| END-22 | Server phase jump fast-forward | Mid count; `onPhase(end_spoils)` | Phase nudge | Fast-forward to matching segment without full replay (reconnect path) | P1 |
| END-23 | Empty modifier list | Seat modifiers=[] | Titles segment | Empty panel / “—” then continue | P2 |
| END-24 | Many modifiers scroll | >N titles | Titles segment | Scroll model flag true; skip may jump end of seat titles | P2 |
| END-25 | Dispose mid-run safe | Running toss | `onDispose` | No throw; sinks stop; complete may not fire or fires cancelled path | P1 |

---

## 5. Edge cases (design §7)

| # | Case | Test ID |
|---|---|---|
| E1 | Empty inventory | END-18 |
| E2 | All takes equal | END-07 |
| E3 | Zero haul | END-19 |
| E4 | No eligible | END-11 |
| E5 | Local ineligible, remote eligible | Scenario: local auto-advances animations; may wait server `end_entry` (MVP note) |
| E6 | Skip spam | END-09 |
| E7 | Disconnect mid-end | Shell/C-04; director dispose — END-25 |
| E8 | Late ScoreReport | Director stays idle until `start` |
| E12 | Soft-unique art | END-20 |
| E13–E14 | Validation / timer | END-15, END-13 |
| E17 | Start during name entry | Confirm if full else skip local entry |
| E18 | Phase jump | END-22 |

---

## 6. Fixtures & determinism

| Fixture | Contents |
|---|---|
| Balanced four-player + sets | Exercises toss, set popout, four places |
| Heavy penalties / min shares | Display min share % from report |
| Single eligible human | Name entry path |
| Zero treasure | END-19 |
| Soft-unique clash | Same character two seats |
| Ties equal takes | Stable ranking |

**Determinism:** Fake `Clock` advances segments; present sink promises resolve instantly (0 ms). Full fixture run &lt;1s simulated. No network, no Phaser required for END-01–END-25 unit/scenario core.

---

## 7. Mocks / fakes

| Dependency | Mock |
|---|---|
| EndPresentSink | Promise-resolving stubs recording call order |
| AudioCueSink | No-op recording cue names |
| HighScoreSubmitClient | 201 / CONFLICT / VALIDATION / UNAUTHORIZED |
| EndNetPort | Recording `endSkip` / `nameEntry` |
| C-01 host | Headless pure director (no Phaser) for CI |
| Clock | Controllable fake |

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| INT-12 | High score submit with completionToken |
| INT-06 | Report shape matches rules (director displays only) |
| INT-10 | Start = skip/confirm only; no global pause |
| SYS end path | Solo/multi end cinematics after short run |
| Human Session F | Cinematics readability, skip fairness, 60s pressure |

---

## 9. Exit criteria

- [ ] Driven only by ScoreReport (+ cinema) — no client recompute takes (END-02)  
- [ ] Three-act order + % order + title color order green (END-01, END-04, END-05)  
- [ ] Skip sends EndSkip when wired; AI never name-enters  
- [ ] Name entry 60s + charset + API error paths green  
- [ ] Soft-unique labels; 960×540 layout assumption  
- [ ] Full director fixture pack in CI without network  
- [ ] Multi-human concurrent entry usable when multi-local stretch lands (online MVP one seat)  
- [ ] Mounted via C-01 EndScene acceptance (C11-T14)  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Local skip desync vs others still watching | MVP local skip; optional server segment index later — document |
| Timer mid-type discard vs soft-submit | MVP discard incomplete; test END-13 locks policy |
| Cinema fields not yet on wire | INTERFACE-DELTA; fixtures isolate director |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [share-modifier-api.md](../../interfaces/share-modifier-api.md)  
- [client-shell/TEST-PLAN.md](../client-shell/TEST-PLAN.md)  
- [high-scores](../high-scores/TEST-PLAN.md) (C-12 submit owner)  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
- [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md)  
