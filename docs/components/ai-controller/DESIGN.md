# C-08 — AI Hauler Controller — Design

> **Component ID:** C-08  
> **Ownership:** SE-8  
> **Status:** Documentation only (no application code)  
> **Sources:** Design doc §2.1 Drop-in / AI Players; [ARCHITECTURE.md](../../ARCHITECTURE.md) §6.4; [COMPONENTS.md](../../COMPONENTS.md) C-08; [input-commands.md](../../interfaces/input-commands.md)

---

## 1. Purpose

Fill inactive hauler seats so Game State always has **exactly 4 active haulers**. AI produces the same `InputCommand` shape as humans and is applied by the authoritative simulation (C-06) — it never mutates world state directly.

Goals:

1. Keep pace with humans (average-position flocking).
2. Collect nearby treasure without hogging beyond the greediest human.
3. Press switches/buttons so co-op gates don’t soft-lock solo runs.
4. Soft-handoff on disconnect/idle takeover and human drop-in.

Non-goals (MVP):

- Pathfinding perfection, jumps over complex traps, or ML.
- Difficulty scaling or per-character personality.
- Griefy sabotage (trip/throw at humans) unless later design adds it.

---

## 2. Responsibilities & non-responsibilities

### Responsibilities

| Area | Detail |
|---|---|
| Per-tick decisions | For each seat with `control == AI`, emit one `InputCommand` |
| Position bias | Move toward average **human** position within a tolerance band |
| Treasure greed | Pickup nearby free treasure; upgrade load (drop lesser → pick greater) |
| Load cap | Never carry more items than the **max human carry count** this tick |
| Switches | Prefer pressing nearby unpressed switches/buttons when in range |
| Phase gating | **No AI on Instructions** — server does not request AI cmds there |
| Fill policy | AI pilots empty, disconnected (grace), and idle-timeout seats |
| Fork policy | Mild argue policy so forks resolve without humans (MVP) |

### Non-responsibilities

- Physics, collision, pickup grant, chord interpretation (C-06).
- Idle timeout detection ownership (C-06 / room) — AI only reacts once `control` flips.
- Client-side prediction of AI haulers (remote interpolation is enough).
- High-score eligibility (AI never submits).
- Trap “AI” for golems/phantom hands (those are sim entities).

---

## 3. Placement in the system

```text
┌─────────────────────────────────────────────────┐
│ HaulSession Room                                │
│  seats[4].control ∈ { human, ai }               │
│         │                                       │
│         ▼                                       │
│  ┌──────────────┐    read-only     ┌──────────┐ │
│  │ Simulation   │◄─────────────────│ AI Ctrl  │ │
│  │ (C-06)       │  AiWorldView     │ (C-08)   │ │
│  │              │─────────────────►│          │ │
│  │ applyInput() │  InputCommand[]  │ tick()   │ │
│  └──────────────┘                  └──────────┘ │
└─────────────────────────────────────────────────┘
```

- AI runs **server-side only**, once per sim tick (30 Hz), after human inputs for the tick are collected (or in parallel with them — order must be deterministic: human first, then AI seats by `seatId` ascending).
- AI must not bypass sim (no teleport, no direct inventory mutation).
- Telemetry (C-14) observes `ai_takeover` / `human_takeover` events emitted by room/sim, not by AI itself.

---

## 4. Read-only world view (`AiWorldView`)

C-06 exposes a **narrow read-only snapshot** for decisions. AI never holds mutable refs into sim internals.

```text
AiWorldView {
  tick: number
  phase: SessionPhase          // "level" | "fork" | ... (never "instructions" for AI)
  levelId?: string
  biome?: BiomeId

  haulers: {
    seatId: number
    control: "human" | "ai"
    x: number
    y: number
    vx: number
    vy: number
    facing: 1 | -1
    grounded: bool
    stunned: bool
    carryCount: number
    carry: { instanceId, defId, valueGp, rarity }[]   // top-first stack
    weight: number
  }[4]

  freeTreasures: {
    instanceId: string
    defId: string
    x: number
    y: number
    valueGp: number
    rarity: Rarity
  }[]

  switches: {
    switchId: string
    x: number
    y: number
    kind: "regular" | "heavy"
    pressed: bool
    requiredMass?: number
  }[]

  // Optional MVP stretch fields:
  exitZone?: AABB
  solidSample?: (x, y) → bool     // for crude gap awareness
  cameraBounds?: AABB             // for edge-pressure awareness if AI near stuck humans
}
```

**Rules for the view:**

- Positions are server world units (block-aligned or continuous as sim uses).
- Treasure values come from rules catalog (`baseValueGp` / reveal overrides) so upgrade comparisons match scoring.
- Stackable coin sacks that “don’t add to stack height” still count toward **carryCount** for load-cap if design treats them as carried items — **assume yes for cap** unless rules later distinguish (see open questions).

---

## 5. Output contract

Identical to humans — see [input-commands.md](../../interfaces/input-commands.md):

```text
InputCommand {
  seq: number           // server-side monotonic per AI seat
  axes: { x: -1|0|1, y: -1|0|1 }
  jump: boolean
  action: boolean
  start: boolean        // always false for AI MVP
}
```

- AI `seq` is owned by the server counter for that seat; never over the wire as client input.
- Chord interpretation (drop/throw) remains server-side from `axes + action`.
- AI never sends forged client packets; room injects cmds via `applyInput(seatId, cmd, tick)`.

---

## 6. Control lifecycle (fill / takeover)

Owned primarily by **room + sim**; AI controller only produces cmds when `control == AI`.

| Event | Seat `control` | AI role |
|---|---|---|
| Session start / lobby empty seats | `ai` (or `empty` until Hoard) | Stand idle or inactive until Game State |
| **Instructions** | No AI seats active | **Do not call** AI for this phase; humans only |
| Level / Hoard / Fork / End (non-entry) | Empty human → `ai` | Produce cmds |
| Human idle **20s** no packets | → `ai` | Soft takeover: keep pos/inventory |
| Human idle **5s** + camera-edge pressure | → `ai` | Same |
| Human disconnect (grace e.g. 30s) | → `ai` (seat held) | Pilot until reconnect |
| Human reconnect / any human input on seat | → `human` | Stop producing cmds that tick |
| Soft-takeover on join into AI seat | → `human` | Preserve world state |

**Instructions exception (design fidelity):**

> AI characters don’t appear. Inactive humans are removed; new actives drop in from top-left.

Server simply does not spawn or tick AI during `phase == instructions`. Empty seats remain unfilled until Hoard.

**Always 4 haulers** from Hoard onward (Game State).

---

## 7. Behavior stack (priority)

Each AI seat evaluates a **priority cascade** once per tick. Highest matching intent wins; lower intents fill residual axes/buttons only if free.

```text
0. Stunned / forced anim     → zero movement; no jump/action
1. Switch duty               → move to nearest actionable switch; stand/press
2. Treasure upgrade          → drop/throw lesser if better free treasure in range
3. Treasure pickup           → if under load cap and treasure in pickup range
4. Position flock            → move toward average human position (tolerance band)
5. Exit bias (optional)      → if all humans past midpoint toward exit, bias that way
6. Idle                      → axes 0; small hop only if stuck timer fires
```

### 7.1 Stunned / unavailable

If `stunned` or phase forbids free-run (End cinematic), emit neutral command (`axes 0`, buttons false).

### 7.2 Average human position (flocking)

Design:

> Attempt to stand between all Human players. Average the position of all players. Tolerate a difference of up to **25% of the distance between the two furthest characters**.

**Algorithm (MVP):**

1. Let `H` = haulers with `control == human` and not eliminated.
2. If `|H| == 0` (AI-only room): use average of **all AI haulers** excluding self, or stand still / walk toward exit (config). Prefer exit bias so AI-only rooms still progress.
3. If `|H| >= 1`:
   - `target.x = mean(h.x for h in H)`  
   - `target.y = mean(h.y for h in H)` (secondary; primarily horizontal game)
4. Let `span = max pairwise distance among H` (if `|H| < 2`, use a fixed comfort radius, e.g. `4 * blockSize`).
5. `tolerance = 0.25 * span` (or `0.25 * comfort` when single human).
6. If `|self.x - target.x| <= tolerance` → `axes.x = 0` (stay put horizontally).
7. Else `axes.x = sign(target.x - self.x)`.
8. Vertical: only jump if target is significantly above and grounded and a crude “wall/ledge” heuristic says jump; otherwise `jump = false`. Duck only when pickup intent needs it.

**Tolerance band note:** “Between all humans” is approximated by mean + dead-zone; AI should not thrash when already in the pack.

### 7.3 Treasure greed + load cap

Design:

> Pick up any treasure near them. Will **not** carry more than the most carried by a Human Player. Will drop or toss a lesser treasure to pick up a more valuable one.

**Load cap:**

```text
maxHumanLoad = max(carryCount of human-controlled seats)
               // if no humans: use config default (e.g. 3) or uncapped low value
canPickup = self.carryCount < maxHumanLoad
            OR (upgrade intent will free a slot this tick sequence)
```

**Proximity:**

- `pickupRadius` = ~1.5 blocks (tunable); must match sim duck/pickup reach.
- Prefer highest `valueGp` among free treasures in radius.
- Set `axes.y = +1` (down) when adjacent and `canPickup` to trigger duck/pickup.
- Do not trip/push (`action` alone) while intending pickup.

**Upgrade path:**

1. If free treasure `T` in radius with `valueGp > min(self.carry values)` AND at cap:
2. Issue drop chord: `action=true, axes.y=+1` (down) for one tick edge (server edge-detect).
3. Subsequent ticks: move onto `T` and pickup.
4. Prefer **drop** over **throw** for upgrades (throw is griefy / imprecise). Throw only if drop is blocked (stretch).

**Coin sacks:** Still subject to value comparison; prefer unique/set when values equal (rarity rank Unique/Set > Rare > Common).

### 7.4 Switches

Design: *AI players will attempt to press any switch or button.*

MVP:

1. Consider switches with `pressed == false` within `switchSeekRadius` (e.g. 8–12 blocks) or any switch that blocks progress if level metadata marks it required.
2. Pick nearest by Manhattan/Euclidean distance.
3. Move toward it (overrides flock if priority 1 active and switch is “actionable”).
4. When overlapping switch volume: stand still; for heavy switches, only attempt if `weight` (self or nearby cooperative mass) meets requirement — if AI alone is too light, abandon and return to flock (don’t infinite-retry thrash).
5. Avoid repeatedly toggling: once `pressed == true`, drop switch intent until unpressed again if design allows toggle-off.

### 7.5 Stuck recovery (lightweight)

If `|vx| ~ 0` and `axes.x != 0` for `stuckTicks` (e.g. 45 ticks / 1.5s):

- Try jump once.
- If still stuck, reverse `axes.x` briefly or clear intent and replan next tick.
- No full pathfinder.

### 7.6 Fork phase

Not free-run. Produce:

| Intent | Command |
|---|---|
| Path select | Bias `axes.y` toward option already leading, else random stable per seat (hash seatId + levelPath) |
| Argue | Pulse `jump` or `action` at a mild rate (~3–6 Hz random) so human mash still wins easily |

Stretch: follow majority human selection.

### 7.7 End phase

AI does not enter name entry. Neutral inputs only. Ineligible for high scores.

---

## 8. Integration with C-06

### Call site (conceptual)

```text
// each sim tick
collectHumanInputs()
if phaseAllowsAi():
  view = buildAiWorldView()
  for seatId in 0..3 where seats[seatId].control == AI:
    cmd = aiController.decide(seatId, view)
    applyInput(seatId, cmd, tick)
integratePhysics()
```

### `phaseAllowsAi()`

```text
true  when phase ∈ { level, fork }  // and optionally end non-entry for standstill
false when phase ∈ { lobby, instructions, end_entry, closed }
```

Hoard is a `level` with `levelId = hoard` — AI **is** active.

### Soft takeover invariants

- Position, velocity, carry stack, stats counters preserved.
- `PlayerStats.controlSwaps`, `aiControlTicks`, `humanControlTicks` updated by sim for share modifiers (`attention_deficit`, `autopilot`).
- Emit `S2C_Event { type: "ai_takeover" | "human_takeover", seatId }` for audio/UI/telemetry.

---

## 9. Pure decision core

Factor decision math into **pure functions** (unit-testable, no I/O):

| Function | Role |
|---|---|
| `averageHumanPosition(haulers) → Vec2 \| null` | Flock target |
| `toleranceBand(humans) → number` | 25% furthest-pair span |
| `maxHumanLoad(haulers) → number` | Carry cap |
| `selectTreasureTarget(self, free, cap) → Treasure?` | Pickup/upgrade target |
| `selectSwitchTarget(self, switches) → Switch?` | Switch duty |
| `axesToward(self, target, tolerance) → -1\|0\|1` | Dead-zone movement |
| `decide(seatId, view, rng) → InputCommand` | Full cascade |

`rng` is seeded from session `rngSeed` + tick + seatId for deterministic tests.

---

## 10. Tuning parameters (config, not magic numbers in logic)

| Param | MVP default | Notes |
|---|---|---|
| `pickupRadius` | 1.5 blocks | Match sim reach |
| `switchSeekRadius` | 10 blocks | |
| `toleranceFraction` | 0.25 | Design |
| `singleHumanComfort` | 4 blocks | When only one human |
| `stuckTicks` | 45 | ~1.5s @ 30 Hz |
| `aiOnlyDefaultMaxLoad` | 3 | When no humans |
| `forkArguePulseHz` | 4 | Mild |
| `upgradeUsesDrop` | true | Prefer drop over throw |

Live-tunable via server config for playtests (Session C in implementation plan).

---

## 11. Testing strategy

| Layer | Cases |
|---|---|
| Unit | Average of 1/2/4 humans; empty humans; tolerance dead-zone no thrash |
| Unit | Load cap equals max human count; AI refuses 4th when humans hold 3 |
| Unit | Upgrade drops lower value for higher; rarity tie-break |
| Unit | Switch preference when unpressed nearby |
| Unit | Instructions phase never queried (room test) |
| Integration | 1 human + 3 AI complete Hoard pickup path |
| Integration | Disconnect → AI pilots → reconnect human restores seat |
| Playtest | AI doesn’t block doors forever; doesn’t strip all loot (cap) |

---

## 12. File / package placement (future code)

Suggested (when implementation starts — not created now):

```text
packages/ai/           # pure decide() + helpers (optional package)
server/src/ai/         # AiController wiring to room
```

Prefer pure package if client ever needs offline AI; MVP may live under `server/src/ai` only.

---

## 13. Open questions / assumptions

| ID | Question | Assumption until answered |
|---|---|---|
| Q1 | Do coin sacks count toward load-cap carry count? | **Yes** — count all carried instances |
| Q2 | AI-only rooms: flock target? | Bias toward exit; optional room TTL |
| Q3 | Should AI trip/push humans? | **No** MVP |
| Q4 | Heavy switch mass: cooperate with humans? | Solo attempt only if self mass enough; else skip |
| Q5 | Jump intelligence for gaps | Jump-on-stuck only MVP |
| Q6 | Fork AI: random vs follow majority | Stable hash random; stretch majority |

---

## 14. Related docs

- [COMPONENTS.md](../../COMPONENTS.md) — C-08  
- [ARCHITECTURE.md](../../ARCHITECTURE.md) §6.4 Drop-in/AI fill  
- [input-commands.md](../../interfaces/input-commands.md)  
- [netcode-messages.md](../../interfaces/netcode-messages.md) — `ai_takeover` events  
- [share-modifier-api.md](../../interfaces/share-modifier-api.md) — Autopilot / Attention Deficit  
- [TASKS.md](TASKS.md)  
