# C-10 — Fork Vote Subsystem — Design

| Field | Value |
|---|---|
| Component | **C-10 Fork Vote Subsystem** |
| Ownership | **SE-5** (logic); SE-1 UI presentation |
| Status | Design (documentation only) |
| Related | [ARCHITECTURE.md](../../ARCHITECTURE.md) §7, [COMPONENTS.md](../../COMPONENTS.md) C-10, [ADR-002](../../decisions/ADR-002-multiplayer-netcode.md) |
| Contracts | [netcode-messages.md](../../interfaces/netcode-messages.md) (`S2C_ForkState`), [input-commands.md](../../interfaces/input-commands.md) (Fork context), [level-format.md](../../interfaces/level-format.md) (level graph / pool) |
| Product locks | [ARCHITECT-OPEN-QUESTIONS.md](../../decisions/ARCHITECT-OPEN-QUESTIONS.md) **Q4-A**, **Q8-A**, **Q10-A** |

---

## 1. Purpose

When a level (including Hoard) completes and the run still needs more post-Hoard content, the session enters **Fork**: players choose between **two path options** and **argue** (button-mash) for their selection. C-10 is the **server-authoritative** module that:

1. Selects **two candidate levels** for this fork  
2. Tracks each seat’s **selected path**  
3. Tallies **argue pulses** over a timed vote window  
4. Resolves a **winner option**  
5. Returns the next `levelId` to C-06’s phase machine  

UI (C-01/C-02) only renders `S2C_ForkState` and sends the same `InputCommand` shape used elsewhere; mash fairness lives on the server.

---

## 2. Non-goals

| Out of scope | Notes |
|---|---|
| Full free-roam platforming on Fork | Design: not a free-run level |
| Pixel art / door animations | Presentation only |
| Building the full 19-node design path graph | MVP uses pool policy (Q4-A); graph file is stretch |
| Global pause during argue | **No global pause** (Q10-A); vote window is a timer on the tick clock, not a freeze of the room process |
| Client-side vote authority | Clients never send “I won” or raw tallies |
| End-of-run scoring | C-06 + C-07 |

---

## 3. Product decisions (frozen)

| ID | Decision | Implication for C-10 |
|---|---|---|
| **Q4-A** | Small pool + **random unplayed pair** each fork | Do **not** require fixed `level-graph.json` legs for MVP; pick 2 distinct unplayed level ids from pool |
| **Q8-A** | `levelsAfterHoard` default **2** (full **7**) | C-10 does not own the counter; C-06 decides *whether* to open a fork. C-10 only resolves *which* level when opened |
| **Q10-A** | No global pause | Vote `endsAtTick` advances every sim tick; disconnects don’t pause the window |

---

## 4. Placement in the system

```text
C-06 PhaseMachine
  │ phase → fork
  ▼
C-10 ForkVote
  ├── LevelPool (unplayed set, session rng)
  ├── SeatSelection[4]
  ├── ArgueTally[optionA|optionB]
  ├── Window timer (endsAtTick)
  └── resolve() → { winningOption, levelId }
  │
  ▼
C-06 loads levelId, phase → level
```

**Broadcast:** Room sends `S2C_ForkState` (and phase change) from sim/fork state each tick or on change.

```text
S2C_ForkState {
  options: ForkOption[2]    // or exactly two named fields
  tallies: { A: number, B: number }  // or by optionId
  endsAtTick: number
  // optional: selections per seat for UI arrows
}
```

Exact field names should match protocol freeze; design requires **two options**, **public tallies**, **end tick**.

---

## 5. Level selection — random unplayed pair (Q4-A)

### 5.1 Pool sources

MVP content pack:

```text
content/levels/*          # individual levels
content/level-pool.json   # recommended MVP list
```

Conceptual pool file:

```text
{
  "version": 1,
  "hoardId": "hoard_01",
  "playablePool": [
    "dungeon_a", "lava_a", "ice_a", "cavern_a", "mist_a", "outside_a"
  ],
  "levelsAfterHoardDefault": 2
}
```

- **Hoard** is never a fork option.  
- Optional stretch: `content/level-graph.json` fixed legs (level-format.md) — **not required** when Q4-A is active.  
- Biome metadata from each level’s `meta.json` drives UI theming (“two biome-themed exits”).

### 5.2 Unplayed tracking

Session maintains:

```text
playedLevelIds: Set<string>   // includes hoard after hoard complete
// or only post-hoard plays — document: include every loaded gameplay levelId
```

On each fork **open**:

1. `candidates = playablePool \ playedLevelIds`  
2. If `candidates.length >= 2`: shuffle with **session rng**, take first 2  
3. If `candidates.length == 1`: pair with a **least-recently-played** or random from full pool excluding the single candidate’s duplicate (prefer: allow **replay** of oldest played non-hoard rather than soft-lock)  
4. If `candidates.length == 0`: reshuffle full playable pool (all available again) minus currently impossible ids; still pick 2 distinct if pool size ≥ 2  
5. If pool size `< 2` (content error): fail room setup in CI validation; runtime fallback duplicate stub only for dev  

**Invariant:** Options A and B are **distinct** `levelId`s whenever pool has ≥ 2 entries.

### 5.3 Ordering of options

- After picking two ids, assign to Option A / Option B by **rng order** (or sorted id for tests with fixed seed — prefer rng for variety; tests pass explicit options).  
- Store biome + displayName from level meta for clients.

```text
ForkOption {
  optionId: "A" | "B"
  levelId: string
  biome: Biome
  displayName: string
}
```

### 5.4 After resolution

- Winning `levelId` is returned to C-06.  
- On successful level **load**, C-06 adds that id to `playedLevelIds`.  
- Losing option remains unplayed (eligible for future forks).

---

## 6. Vote window & phase lifecycle

### 6.1 Open

Triggered by C-06 when entering `phase = fork`:

```text
fork.open({
  tick: number,
  seats: SeatPublic[],      // control human|ai
  rng: Rng,
  playedLevelIds: Set<string>,
  pool: string[],
  windowTicks?: number      // default from config
}): ForkState
```

Default window: e.g. **10–15 seconds** at 30 Hz → `windowTicks = 300..450` (tunable constant `FORK_WINDOW_TICKS`). Document final number in config; tests inject short windows.

### 6.2 Active (each tick)

1. Apply fork-context inputs for all seats (human + AI).  
2. Update selections and tallies.  
3. If `tick >= endsAtTick` → `resolve()`.  
4. Emit/update `S2C_ForkState` (tallies, endsAtTick, options, optional per-seat selection).

### 6.3 Resolve

```text
resolve() → {
  winningOptionId: "A" | "B"
  levelId: string
  tallies: { A: number, B: number }
  reason: "majority" | "tie_break" | "timeout_default"
}
```

C-06 then: `phase = level`, load `levelId`.

### 6.4 Early resolve (optional MVP)

- **Not required:** early end if all humans locked in and window min elapsed.  
- Stretch: “all humans held selection for 2s + no AI-only mash race” — skip unless playtests demand.

### 6.5 No pause

- Disconnect → AI policy continues mashing/selecting; window **does not** reset.  
- Local pause UI on one client does not stop `endsAtTick` progress.

---

## 7. Input interpretation (Fork context)

From [input-commands.md](../../interfaces/input-commands.md):

| Input | Server meaning |
|---|---|
| `axes.y` up/down | Select path (**primary**, per design) |
| `axes.x` left/right | **Alias** for select path (same mapping) |
| `jump` or `action` **pressed** (edge) | Argue pulse: +1 tally to **currently selected** path |
| `start` | No server pause; ignore for vote (or skip stretch) |

### 7.1 Selection mapping

Recommend:

```text
axes.y == -1  → select Option A   // up
axes.y == +1  → select Option B   // down
axes.x == -1  → select Option A   // left alias
axes.x == +1  → select Option B   // right alias
axes == 0     → keep previous selection (no change)
```

If both x and y nonzero in one command, prefer **y** (design primary).

### 7.2 Default selection

On fork open, each seat starts on **Option A** (or last fork’s choice — MVP: **Option A** for determinism).

### 7.3 Argue pulse rules

- Count **edges** (press transitions), not held duration — prevents sticky-button flood differently from rate limit.  
- Still apply **rate limit**: max pulses per seat per tick = 1 (one edge per tick max from digital input).  
- Additional room-level rate limit on `C2S_Input` already exists; fork should not grant super-human mash via packet spam (ignore >1 edge/tick).  
- Stunned flag: N/A on fork (no free-run stun); ignore if set.  
- AI and human use identical pulse rules.

### 7.4 What is tallied

**Only argue pulses** add to tallies. Selection alone without mash does **not** add votes (design: button-mash argue).  

**Tie / zero-mash policy** — see §8.

---

## 8. Tally & winner resolution

### 8.1 Majority

```text
if tallyA > tallyB → A wins
if tallyB > tallyA → B wins
```

### 8.2 Tie (including 0–0)

MVP policy (test-locked):

1. **Prefer option with more seats currently selecting it** (selection plurality).  
2. If still tied → **session rng** pick A or B (fair coin).  
3. Document alternative rejected for MVP: “host seat always wins” (no host online).

Optional drama stretch: AI mild bias — not required if rng tie-break is clear.

### 8.3 Visibility

- Tallies are **public** in `S2C_ForkState` so UI can show the fight (design chaos).  
- Do not hide opponent mash counts in MVP.

---

## 9. AI argue policy

When `control == AI` during fork:

| Behavior | MVP |
|---|---|
| Path selection | Pick random option once at open, **or** copy current majority selection each few ticks (stretch: follow majority) |
| Argue pulses | **Mild random**: each tick, probability `p` (e.g. 0.15–0.35) to pulse if “intent” holds; not max mash every tick |
| Goal | Fill seats without dominating all humans unless humans idle |

Recommended MVP algorithm:

```text
onOpen: selection = rng.pick([A,B])
eachTick:
  if rng() < switchChance: selection = rng.pick([A,B])  // low, e.g. 0.02
  if rng() < pulseChance:  argue(selection)             // e.g. 0.25
```

Stretch: `follow_majority` — selection snaps to leading tally option; pulseChance medium.

C-08 may own AI fork policy via same `InputCommand` generation when phase is fork; C-10 must not special-case AI beyond accepting commands. Prefer **C-08 emits fork inputs**; C-10 stays phase-agnostic to control type.

If C-08 is not ready: C-10 may include a **fallback AI driver** behind the same input interface for tests — mark as temporary.

---

## 10. Multi-seat / mid-join / disconnect

| Event | Behavior |
|---|---|
| Human mid-join during fork | Seat gets default selection A; can mash immediately |
| Disconnect | AI takeover (C-06) continues pulses via AI policy |
| All humans leave | Window continues; AI may resolve; room TTL separate |
| Seat not yet bound | Still 4 seats: unbound as AI from Hoard onward |

---

## 11. Interaction with `levelsAfterHoard`

C-10 **does not** decide how many forks occur.

```text
C-06:
  onLevelComplete:
    if wasHoard → openFork()
    else:
      levelsCompleted += 1
      if levelsCompleted < levelsAfterHoard → openFork()
      else → beginEnd()
```

With default **2**:

```text
Hoard complete → Fork1 → LevelX → Fork2 → LevelY → End
```

With **7**: six post-hoard levels and six forks after hoard (Hoard→F→L)×7 pattern as architecture flow.

Each Fork1..N independently draws a **new unplayed pair** (Q4-A).

---

## 12. Client / presentation contract (for SE-1)

| Concern | Source |
|---|---|
| Two exit visuals / biomes | `ForkOption.biome`, art keys |
| Argue feedback | Local SFX on pulse; server tallies for bars |
| Timer | `endsAtTick - currentTick` / tickRate |
| Fixed camera | Client only (design) |
| Do not free-run | Client may idle-animate haulers; sim ignores locomotion |

---

## 13. Config surface

```text
ForkConfig {
  windowTicks: number              // e.g. 300 (10s @ 30Hz)
  pulseChanceAi: number            // if fallback AI in C-10
  switchChanceAi: number
  defaultSelection: "A"
  preferYOverX: true
  publicTallies: true
  tieBreak: "selection_then_rng"   // locked MVP
}
```

Pool + `levelsAfterHoard` live in session/content config owned with C-06/C-09.

---

## 14. Internal API (conceptual)

```text
ForkVoteModule {
  open(ctx: ForkOpenContext): void
  isActive(): bool
  applyForkInput(seatId, cmd, tick): void
  tick(tick): { state: ForkPublicState, resolved?: ForkResult }
  getPublicState(): ForkPublicState
  // test helpers:
  forceOptions(a: ForkOption, b: ForkOption): void
  forceTallies(a: number, b: number): void
}
```

C-06 calls `applyForkInput` instead of movement integrate when `phase==fork`, **or** always routes inputs through a phase dispatcher.

---

## 15. Events & messages

| Message / event | When |
|---|---|
| `S2C_PhaseChange` phase=fork | Open |
| `S2C_ForkState` | Open + each tick / on change |
| `S2C_PhaseChange` phase=level | After resolve + load |
| Optional `GameEvent` `fork_resolved` | `{ optionId, levelId, tallies }` for SFX |

---

## 16. Testing strategy

| Case | Expect |
|---|---|
| Pair pick | Same seed + same played set → same pair; pair ⊆ pool; distinct ids |
| Unplayed | After playing X, X not in next pair if others remain |
| Exhaustion | When 1 left / 0 left, fallback policy doesn’t crash; still 2 options if pool ≥ 2 |
| Mash majority | A pulses 10, B pulses 3 → A wins |
| Tie 5–5 | Selection plurality or rng (seeded) stable |
| Tie 0–0 | Same tie-break |
| Edge pulse | Hold jump → only 1 pulse per press cycle |
| Rate | 1 pulse max per seat per tick |
| AI mild | AI pulse rate < theoretical max over window |
| Input axes | y and x aliases select correctly; y wins conflict |
| No pause | Advance ticks without human; endsAtTick reached; resolve fires |
| Integration | C-06 short run with `levelsAfterHoard=2` opens fork twice |

Golden (Impl Plan): *Fork vote: higher mash wins; tie policy*.

---

## 17. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Packet spam mash | 1 edge/tick; room rate limit |
| AI stomps humans | Mild pulseChance; tune in playtest Session D |
| Pool too small for 7 levels | Content validation: `playablePool.length >= levelsAfterHoard` (ideally ≥ levelsAfterHoard + 1) |
| Players don’t understand mash | Public tallies + UI juice (SE-1) |
| Graph vs random confusion | Docs: Q4-A wins; graph file optional stretch |

---

## 18. Stretch

- Full `level-graph.json` fixed adjacency instead of random pairs  
- Early resolve when all humans agree  
- Per-biome fork art sets  
- Spectator-visible argue without seat  
- “Argue meter” decay (not in design — don’t add unless requested)

---

## 19. Traceability

| Requirement | Section |
|---|---|
| Two biome-themed exits | §5.3 options + meta biome |
| Path select + argue | §7 |
| Server tally over window | §6–§8 |
| Winner → next levelId | §6.3 |
| AI argue policy | §9 |
| Random unplayed pair (Q4-A) | §5 |
| levelsAfterHoard default 2 | §11 (C-06 owns count) |
| No global pause | §3, §6.5 |
| Not free-roam | §2, §12 |
