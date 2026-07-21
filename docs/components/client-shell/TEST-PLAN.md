# C-01 — Client Shell & Scenes — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-01  
> **Owner cluster:** SE-1

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Bootstrap | Phaser `Game` create, scene registration, Vite entry assumptions |
| Scale | Logical **960×540**, `Scale.FIT` + center letterbox, integer-scale preference |
| Scene graph | Boot → Title → Credits → HighScores → Lobby → Instructions → Level → Fork → End + overlays |
| Attract / idle | Title → Credits → HighScores → Title timers; any-button → Title on Credits/HighScores |
| Lobby UI wiring | Create/join private codes, seat strip, soft-unique claim, ready, cancel |
| Phase binding | Server `SessionPhase` → host scene (no client-invented phase) |
| Connection UX | Connecting / reconnecting / lost / protocol error overlays from C-04 state |
| Local menu only | Start in Level opens local overlay; **no global pause** message or freeze |
| High scores display | GET list render + scroll skeleton; no submit (C-11 owns submit) |
| End host | Mount C-11 with report; on complete → HighScores (`fromEndFlow`) |
| Input context | Hand off scheme to C-03 (`attract` / `title` / `lobby` / `level` / …) |
| Config surface | API base URL / WS defaults; progress from snapshot `levelsCompleted` only |

### Out of scope

| Out | Owner |
|---|---|
| Authoritative physics / treasure ownership | C-06 |
| Share math / take calculation | C-07 |
| End cinematic sequencing (tosses, titles, spoils, name entry) | C-11 |
| Sprite/anim/parallax/camera | C-02 |
| Keyboard/gamepad → `InputCommand` | C-03 |
| WS prediction / token storage internals | C-04 |
| REST session/score implementation | C-05 / C-12 |
| Pixel-map parse | C-09 |
| Audio channel policy | C-13 |
| Public matchmaking, accounts | Frozen out (Q2, Q7) |
| Local multi-gamepad multi-seat | Stretch (Q3) |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Consumes | [netcode-messages.md](../../interfaces/netcode-messages.md) phase enums, `S2C_Error`, `ScoreReport` |
| Consumes | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) create/join + high-score GET |
| Consumes | [input-commands.md](../../interfaces/input-commands.md) via C-03 context schemes |
| Consumes | C-04 connection state / world phase view |
| Consumes | C-11 complete callback |
| Produces | Scene transitions, `ShellEvent` bus, lobby intents, leave/cancel |
| Overview | [interfaces/OVERVIEW.md](../../interfaces/OVERVIEW.md) |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | Attract timers (fake clock); phase→scene map; join-code normalize (trim/case); navigator pure helpers | CI |
| **Component** | Lobby form validation; seat strip from `SeatStatus[]`; HighScores fixture render; error overlay mapping | CI (fake net/API) |
| **Scenario** | Attract cycle; create/join; scripted phase walk Lobby→…→End→HighScores; connection lost path | CI with fakes |
| **Visual smoke** | Letterbox on non-16:9; Title splash; seat strip readability; Connecting banner | Manual / Playwright smoke |
| **Integration** | Real C-04/C-05 adapters: private code two-browser; reconnect banner | [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md) |
| **System** | SYS-H1 solo path; SYS-F1/F2 codes; SYS-F4 tab background | [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md) |

Coverage pragmatism: no hard line-coverage gate for Phaser scenes. Critical pure modules (attract, phaseBinder, lobbyController) should be unit-covered; scene UI validated by fake-net scenario + visual smoke.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| SHELL-01 | Letterbox 960×540 on non-16:9 | Bootstrap with parent sized 1280×800 (or ultrawide) | Measure game canvas logical size and letterbox bars | Content area logical 960×540 FIT centered; UI hit targets in logical space only; no non-uniform stretch | P1 |
| SHELL-02 | Cold boot lands on Title | Fresh game config, assets stubbed | `createGame` → Boot complete | Active scene is `Title`; Boot registered and exited | P0 |
| SHELL-03 | Attract idle chain | Fake clock; attract controller only | Advance Title idle (~10s) → Credits (~5s) → HighScores scroll cycle | Sequence Title→Credits→HighScores→Title; no Title→HighScores skip | P1 |
| SHELL-04 | Any-button returns to Title from attract | On Credits or HighScores | Emit any face/start (`ui_any`) | Navigate to Title; pending idle timers cancelled | P1 |
| SHELL-05 | Credits idle + button same frame prefers button | Fake clock fires idle advance same tick as input | Deliver both events | Prefer button → Title; no advance to HighScores | P1 |
| SHELL-06 | Start opens Lobby (online-first) | Title scene active | Press Start / primary confirm | `goLobby` (create/join chooser); **not** Instructions; no account gate | P0 |
| SHELL-07 | Create session shows private join code | FakeLobbyApi | Create room from Lobby | Join code visible; shape matches lobby contract; no matchmaking UI | P0 |
| SHELL-08 | Bad join code stays in Lobby | FakeLobbyApi returns `NOT_FOUND` | Submit invalid/short/empty code | Inline error; scene remains Lobby | P0 |
| SHELL-09 | Fifth human FULL | Fake API: 4 seats filled | Fifth join | `FULL` → ErrorOverlay or inline; no fifth seat | P0 |
| SHELL-10 | Soft-unique character claim UX | Two seats, same `CharacterId` available | Both claim same character (warn shown) | UI allows confirm (Q9); may warn “already taken”; no hard client block | P0 |
| SHELL-11 | Ready reflected on seat strip | Lobby + FakeNetSession | Toggle ready for local seat | Seat strip ready flag updates; `C2S_Ready` (or fake) invoked | P0 |
| SHELL-12 | Phase binder scripted walk | Fake net emits phase sequence | lobby→instructions→level→fork→level→end_count→closed | Scenes Instructions, Level, Fork, Level, End; closed → leave/error path | P0 |
| SHELL-13 | All `end_*` phases map to End host | Phase binder unit | Feed `end_count`, `end_shares`, `end_spoils`, `end_entry` | All map to End scene key; C-11 advances sub-stage | P0 |
| SHELL-14 | Start in Level = local menu only (no global pause) | Level host active; spy on outbound messages | Press Start | LocalMenu opens; **no** pause/freeze protocol message; sim not paused (INT-10) | P0 |
| SHELL-15 | Connection reconnecting banner keeps Level | Level active; C-04 → `reconnecting` | Drop socket signal | Connecting/reconnect banner visible; Level scene **not** torn down | P0 |
| SHELL-16 | PROTOCOL error hard-fail UX | C-04 emits PROTOCOL error | Surface ShellError | Non-silent ErrorOverlay; “update client” copy; recoverable=false path | P0 |
| SHELL-17 | HighScores fixture render + fetch fail | Fixture list; then mock GET fail | Open HighScores attract; fail fetch | Fixture renders top list; failure shows empty/error strip; any-button still → Title | P1 |
| SHELL-18 | End handoff to C-11 and return | Fake ScoreReport + end phase | Enter End; director `onComplete` | `end_host_ready` with report; on complete → HighScores `fromEndFlow` | P0 |
| SHELL-19 | Lobby cancel / leave clears session UI | In Lobby or playing | Cancel / leaveSessionToTitle | Title; tokens cleared UI-side; no stale join code | P0 |
| SHELL-20 | Double-click create locked while POST in flight | Slow FakeLobbyApi | Double-activate create | Single create request; UI locked until settle | P1 |
| SHELL-21 | levelsCompleted progress not hardcoding 7 | Snapshot with server `levelsAfterHoard=2` | Render progress UI | Uses `levelsCompleted` (+ server cap if exposed); no client assume of 7 | P1 |
| SHELL-22 | Tab background does not freeze server | Level online; mock net | Background tab | Shell may show local visual only; **server remains unpaused** (SYS-F4) | P0 |
| SHELL-23 | Optional rejoin prompt when token present | sessionStorage has reconnect bundle on boot | Open Title/Lobby | Optional “Rejoin?” affordance; uses C-04 stored token path | P2 |
| SHELL-24 | Attract input during fade debounced | Fade transition in progress | Spam input | First input wins; no double scene thrash | P2 |
| SHELL-25 | Solo/dev auto-join flag | `debug.soloAutoJoin=true` | Start | Auto-create + AI fill path; not a second product surface in UI | P2 |

---

## 5. Edge cases (design §7 → test intent)

| Edge | Expectation under test |
|---|---|
| Room `closed` / empty TTL | Navigator → Title or HighScores with message |
| Mid-join during End | Refuse / closed phase; no mid-end spectator invent |
| Soft-unique art clash | Both seats may show same character; labels distinguish seats |
| HighScores after end-flow | `fromEndFlow` entry; scroll behavior still exit-capable |
| Escape/Start in local menu | Does not send server pause |
| Non-16:9 / resize | Letterbox only; logical coords stable (SHELL-01) |
| Reconnect token present | Optional rejoin; no auto-force mid-attract without UX |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| `FakeLobbyApi` | Create/join/FULL/NOT_FOUND; fixed join codes |
| `FakeNetSession` | Scripted `SessionPhase` + static seats/haulers |
| High scores JSON | Top 25 + lastRun + recentNewIds |
| Fake clock | Attract timeouts (Title ~10s, Credits ~5s, HighScores scroll) |
| ScoreReport stub | End handoff without C-11 full cinema |

**Determinism notes:** Attract unit tests must inject clock; no wall-time sleeps in CI. Phase binder is pure map—table-driven. Phaser scale tests may be browser-only; document manual fallback if headless canvas limited.

---

## 7. Mocks / fakes

| Dependency | Mock |
|---|---|
| C-04 | `FakeNetSession` — connection FSM + phase + seats |
| C-05 | `FakeLobbyApi` / MSW |
| C-12 GET | Fixture JSON |
| C-03 | Stub mapper: keyboard → `ui_any` / lobby nav / start |
| C-02 | Color rects + seat labels in Level/Fork/Instructions hosts |
| C-11 | Stub director “End OK” → complete |
| C-13 | No-op `AudioDirector` |

**Independence rule:** Scene-graph CI runs with fakes only — no live Colyseus required for SHELL unit/scenario suite.

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| INT-07 | Private room codes only |
| INT-09 | Soft-unique characters |
| INT-10 | No global pause (Start = local menu) |
| INT-01 | Full short run path hosts scenes |
| INT-05 | Reconnect UX banner (transport in C-04) |
| SYS-H1 | Solo path shell navigation |
| SYS-H2/H3 | Multi-client lobby + play scenes |
| SYS-F1/F2 | Bad code / full room |
| SYS-F4 | Tab background |
| SYS-F5 | Protocol mismatch UX |
| Human | [HUMAN-PLAYTEST-PLAN.md](../../testing/HUMAN-PLAYTEST-PLAN.md) attract clarity, two-browser join |

---

## 9. Exit criteria

### Phase-aware

- [ ] **P0/P1:** Bootstrap + Title + scale letterbox verified on Chrome desktop  
- [ ] **P2:** Lobby create/join with fake or live API; seat strip; soft-unique UX  
- [ ] **P2:** Phase binder drives Instructions/Level with fake net  
- [ ] **P4:** Full scene graph navigable Boot→…→End→HighScores with mock or live net  
- [ ] **P4:** No global pause verified (SHELL-14 / INT-10)  
- [ ] **P5:** Connection error UX + HighScores fixture path green in CI scenario suite  

### Always

- [ ] Shell never computes takes/shares  
- [ ] Private codes only — no matchmaking UI  
- [ ] All automated cases SHELL-01–SHELL-22 P0/P1 green or waived with reason  
- [ ] Links to DESIGN acceptance §9 satisfied for shipped phase  

---

## 10. Open risks

| Risk | Mitigation in tests |
|---|---|
| Attract timing confuses new players | SHELL-03/06; human playtest note |
| Phaser scene thrash on rapid phase | SHELL-12; debounce SHELL-24 |
| Overlay vs Scene for Connecting tears Level | Prefer overlay; SHELL-15 asserts Level retained |
| Soft-unique vs REST 409 drift | INTERFACE-DELTA; SHELL-10 vs INT-09 |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [ARCHITECTURE.md](../../ARCHITECTURE.md) §7 state machine  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
- [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md)  
- [end-screen/TEST-PLAN.md](../end-screen/TEST-PLAN.md) (C-11 host boundary)  
- [netcode-client/TEST-PLAN.md](../netcode-client/TEST-PLAN.md)  
