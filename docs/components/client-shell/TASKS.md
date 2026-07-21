# C-01 — Client Shell & Scenes — Tasks

Ownership: **SE-1**. Documentation/implementation planning only here.  
Estimates: **S** ≈ 0.5 day, **M** ≈ 1 day, **L** ≈ 2 days.  
Frozen: **960×540**, private room codes, no global pause, soft-unique chars, configurable `levelsAfterHoard` (server-owned).

---

## Task index

| ID | Title | Est | Parallel | Depends on |
|---|---|---|---|---|
| C01-T01 | Bootstrap & scale manager (960×540 FIT) | M | yes | — |
| C01-T02 | Shell event bus & navigator API | S | yes | — |
| C01-T03 | Boot + Title scene (splash + walk-in hooks) | M | yes | C01-T01 |
| C01-T04 | Attract controller (idle chain + any→Title) | M | yes | C01-T02 |
| C01-T05 | Credits scene | S | yes | C01-T01, C01-T04 |
| C01-T06 | HighScores scene + GET client | M | yes | C01-T01, C01-T04 |
| C01-T07 | Fake Lobby API + Fake Net session | M | yes | — |
| C01-T08 | Lobby scene UI (create/join/code/seats) | L | yes | C01-T01, C01-T07 |
| C01-T09 | Character picker soft-unique + ready wiring | M | no | C01-T08 |
| C01-T10 | Phase binder + play scene hosts | M | yes | C01-T02, C01-T07 |
| C01-T11 | Connection / error / local-menu overlays | M | yes | C01-T02 |
| C01-T12 | Transitions (fade, title run-off) | S | yes | C01-T01 |
| C01-T13 | Input context handoff stubs | S | yes | C01-T02 |
| C01-T14 | End scene host mount for C-11 | S | yes | C01-T10 |
| C01-T15 | Attract + lobby + phase integration tests | M | no | C01-T03–T11, C01-T14 |
| C01-T16 | Wire real C-04/C-05 adapters (thin) | M | no | C01-T08, C01-T10 |
| C01-T17 | Progress UI for levelsCompleted | S | yes | C01-T10 |
| C01-T18 | Acceptance checklist pass (manual) | S | no | C01-T15, C01-T16 |

---

## C01-T01 — Bootstrap & scale manager (960×540 FIT)

**Description:** Vite + Phaser 3 game entry; register empty scene stubs; configure Scale Manager to logical **960×540**, FIT, center, letterbox. Integer scale helper when window allows clean multiples.

**Dependencies:** none  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Game canvas letterboxes correctly on 16:9 and ultrawide desktop windows
- [ ] Logical coordinates for UI assume 960×540 only
- [ ] All scene keys registered without runtime crash

---

## C01-T02 — Shell event bus & navigator API

**Description:** Implement `shellBus` + `ShellNavigator` with typed `ShellEvent`s and scene switch helpers (`goTitle`, `goLobby`, `enterSessionPlay`, etc.) without business UI yet.

**Dependencies:** none  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Unit tests: phase/scene helper pure functions
- [ ] Navigator can switch between registered stub scenes
- [ ] Events emit on enter/exit

---

## C01-T03 — Boot + Title scene

**Description:** Boot loads placeholder assets/manifest; Title shows splash, placeholder character walk-in/idle hooks, Start affordance → Lobby navigator call. Background scroll hook for C-02 later.

**Dependencies:** C01-T01  

**Estimate:** M  

**Parallelizable:** yes (with T04/T05 once T01 done)  

**Acceptance criteria:**
- [ ] Cold boot lands on Title
- [ ] Start triggers `goLobby("create")` or lobby chooser
- [ ] Title exposes hooks for run-off transition (even if no-op art)

---

## C01-T04 — Attract controller

**Description:** Idle timers implementing **Title → Credits → HighScores → Title**. Any-button interrupt on Credits/HighScores → Title. Cancel timers on scene exit. Prefer ~10s Title idle before Credits; Credits ~5s.

**Dependencies:** C01-T02  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Unit tests with fake clock cover full attract cycle
- [ ] Button during Credits cancels advance to HighScores
- [ ] No double-fire on simultaneous idle+input

---

## C01-T05 — Credits scene

**Description:** Static/animated credits layout (names, roles, TOJam 8 note placeholders). Idle → HighScores; any → Title.

**Dependencies:** C01-T01, C01-T04  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Scene renders placeholder credits content
- [ ] Idle and any-button behaviors match attract controller contracts

---

## C01-T06 — HighScores scene + GET client

**Description:** `GET /api/v1/highscores?limit=25` client wrapper; render top 25 + last run strip + “New!” tags from `recentNewIds`. On load: start bottom, pause 1s, scroll to top, pause 1s, then Title (when in attract). Any button → Title. Support `fromEndFlow` entry after C-11.

**Dependencies:** C01-T01, C01-T04  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Fixture JSON drives full list UI in isolation
- [ ] Fetch failure shows fallback and still allows exit
- [ ] Scroll timing matches design §1.7 skeleton

---

## C01-T07 — Fake Lobby API + Fake Net session

**Description:** In-memory fakes implementing create/join/`SeatStatus` updates and scripted `SessionPhase` emissions for shell development without server.

**Dependencies:** none  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Create returns joinCode + seat tokens shape per lobby contract
- [ ] Join ×4 succeeds, 5th FULL
- [ ] Fake net can walk phases for integration tests

---

## C01-T08 — Lobby scene UI (create/join/code/seats)

**Description:** Lobby UI: Create room, Join by private code, display join code, seat strip (occupied/control/character/ready/name). Wire to LobbyController (fake first). Cancel → Title.

**Dependencies:** C01-T01, C01-T07  

**Estimate:** L  

**Parallelizable:** yes (with attract scenes)  

**Acceptance criteria:**
- [ ] Create shows human-readable private join code (Q2)
- [ ] Join validates empty/short codes client-side
- [ ] Seat strip updates when fake seats change
- [ ] No public matchmaking controls present

---

## C01-T09 — Character picker soft-unique + ready wiring

**Description:** Character select Gnome/Sprite/Halfling/Dwarf; **soft-unique** UX (warn if taken, allow confirm). Ready toggle → `C2S_Ready` via fake/real net. Optional display name field (ephemeral, Q7).

**Dependencies:** C01-T08  

**Estimate:** M  

**Parallelizable:** no (needs Lobby UI)  

**Acceptance criteria:**
- [ ] Two seats can select same character in UI (Q9)
- [ ] Ready state reflected on seat strip
- [ ] Claim/ready calls go through controller (mockable)

---

## C01-T10 — Phase binder + play scene hosts

**Description:** `phaseBinder` maps `SessionPhase` → Instructions/Level/Fork/End. Thin host scenes mount presentation placeholders. Ignore client-side guesses of level count completion.

**Dependencies:** C01-T02, C01-T07  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Scripted phase changes switch scenes deterministically
- [ ] `end_*` phases all map to End host
- [ ] `closed` triggers leave/error path

---

## C01-T11 — Connection / error / local-menu overlays

**Description:** Connecting + reconnecting banners; ErrorOverlay for PROTOCOL/AUTH/FULL/NETWORK; LocalMenu (volume stub, leave session) opened by Start in play contexts — **does not pause server** (Q10).

**Dependencies:** C01-T02  

**Estimate:** M  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Lost connection shows recoverable vs non-recoverable messaging
- [ ] Local menu leave calls leaveSession path
- [ ] No global pause protocol usage

---

## C01-T12 — Transitions (fade, title run-off)

**Description:** Shared fade in/out; Title run-off-right hook before Lobby; black fades on End enter (for C-11).

**Dependencies:** C01-T01  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Fade durations configurable; default ~200–400ms
- [ ] Transitions emit `ShellEvent.transition`

---

## C01-T13 — Input context handoff stubs

**Description:** Publish `InputContext` on scene enter for C-03; stub listener until Input Mapper lands. Attract/title/lobby/end contexts listed in DESIGN.

**Dependencies:** C01-T02  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Context changes with scene/phase
- [ ] Documented mapping table covered by unit test

---

## C01-T14 — End scene host mount for C-11

**Description:** EndScene creates `EndScreenDirector` (or injects stub), passes `ScoreReport` when received, routes skip/name inputs, on complete → HighScores `fromEndFlow`.

**Dependencies:** C01-T10  

**Estimate:** S  

**Parallelizable:** yes (against C-11 stub)  

**Acceptance criteria:**
- [ ] Stub director lifecycle: start → complete → HighScores
- [ ] Shell does not compute scores
- [ ] Real C-11 can replace stub without navigator changes

---

## C01-T15 — Attract + lobby + phase integration tests

**Description:** Automated suite with fakes: attract cycle, create/join FULL, soft-unique claim, ready, phase walk to End stub, HighScores entry.

**Dependencies:** C01-T03, C01-T04, C01-T05, C01-T06, C01-T08, C01-T09, C01-T10, C01-T11, C01-T14  

**Estimate:** M  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] CI-green suite without live server
- [ ] Covers DESIGN acceptance criteria 2–6, 8–11 at fake level

---

## C01-T16 — Wire real C-04 / C-05 adapters (thin)

**Description:** Replace fakes with real Lobby HTTP client and Netcode Client adapters behind same interfaces. Feature-flag or env-based API base URL.

**Dependencies:** C01-T08, C01-T10 (and peer packages available)  

**Estimate:** M  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] Same Lobby UI works against local server when up
- [ ] Adapters isolatable for tests (interface retained)

---

## C01-T17 — Progress UI for levelsCompleted

**Description:** Minimal HUD/progress text on Level/Fork using snapshot `levelsCompleted` (and server-provided cap if present). Must not hardcode 7; supports MVP `levelsAfterHoard=2`.

**Dependencies:** C01-T10  

**Estimate:** S  

**Parallelizable:** yes  

**Acceptance criteria:**
- [ ] Display updates from snapshot only
- [ ] Works for cap 2 and cap 7 without client rebuild constants baked as “must be 7”

---

## C01-T18 — Acceptance checklist pass (manual)

**Description:** Manual pass of DESIGN §9 on desktop evergreen browsers; letterbox, two-browser join, local menu non-pause, attract chain.

**Dependencies:** C01-T15, C01-T16  

**Estimate:** S  

**Parallelizable:** no  

**Acceptance criteria:**
- [ ] Checklist signed in PR/playtest note
- [ ] Bugs filed with scene + phase repro

---

## Parallelism guide

```text
Week-ish A (parallel):
  T01 ─┬─ T03
       ├─ T05, T06 (need T04 too)
       └─ T12
  T02 ─┬─ T04 ─→ T05/T06
       ├─ T10 ─→ T14, T17
       ├─ T11
       └─ T13
  T07 ──→ T08 ─→ T09

Then: T15 → T16 → T18
```

C-11 tasks can proceed against End host stub (T14) in parallel with SE-1 shell polish.
