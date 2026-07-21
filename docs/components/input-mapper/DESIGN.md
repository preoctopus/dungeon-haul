# C-03 — Input Mapper — Design

| Field | Value |
|---|---|
| Component | **C-03 Input Mapper** |
| Ownership | **SE-3** (with C-04 Netcode Client) |
| Status | Design (documentation only; no application code) |
| Contracts | [input-commands.md](../../interfaces/input-commands.md), [netcode-messages.md](../../interfaces/netcode-messages.md) |
| Architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) §6, §8; [COMPONENTS.md](../../COMPONENTS.md) C-03 |
| Frozen product choices | [ARCHITECT-OPEN-QUESTIONS.md](../../decisions/ARCHITECT-OPEN-QUESTIONS.md) — Q3 **A** online seats first; local multi-gamepad **stretch** |

---

## 1. Purpose

Map raw keyboard and gamepad hardware into a single, normalized **`InputCommand`** stream consumed by the Netcode Client (and, later, by local/dev harnesses). The design preserves the original **NES-style control philosophy** (D-Pad + A/B + Start/Select) while supporting modern browser input devices.

The mapper **does not** interpret chords into drop/throw/trip. It only reports axis levels and button **levels**; the authoritative simulation performs edge detection and chord resolution ([input-commands.md](../../interfaces/input-commands.md)).

---

## 2. Goals and non-goals

### Goals

1. Produce tick-aligned `InputCommand` values that match the frozen contract shape.
2. Support **four control schemes**: Outside (menus/lobby/attract), Level, Fork, End name entry — scheme selected by client shell phase, not by the mapper inventing phase.
3. Keyboard defaults + gamepad (standard browser Gamepad API) with NES mental model.
4. Stable `seq` assignment per local seat (monotonic, client-owned).
5. Online-first: **one local human seat per browser session** for MVP.
6. Clear, testable pure-ish mapping core (device state → command) separable from Phaser scene hooks.

### Non-goals (MVP)

- Network send cadence / WS framing (C-04).
- AI inputs (C-08 on server).
- Server-side chord semantics (C-06).
- Full remappable UI (stretch; leave extension points).
- **Local multi-pad couch co-op** (Q3-A stretch only — see §10).
- Touch / mobile virtual controls (stretch).
- Haptic feedback.

---

## 3. NES control model

Canonical design source (design doc § Controls): original NES pad.

| Logical control | NES | Role |
|---|---|---|
| D-Pad left/right | ← / → | Run, menu X, name slot |
| D-Pad up/down | ↑ / ↓ | Throw aim / duck-pickup, path select, letter select |
| A | A | Jump; confirm; argue pulse |
| B | B | Trip/push; chords with axes; delete; argue pulse |
| Start | Start | Pause (local UI); skip cinematic; start flow |
| Select | Select | Optional; reserved (menus stretch) |

**Axes are digital ternary:** each axis is `-1 | 0 | 1` after mapping (no analog run magnitude in MVP). If an analog stick is used, deadzone + cardinal snap produce ternary values.

---

## 4. Control schemes

Scheme is an enum set by **C-01 Client Shell** (or End Director) from `SessionPhase` / local scene id. The mapper does **not** listen to network phase itself; it receives `setScheme(scheme)`.

| Scheme id | When (typical) | Design doc | Notes |
|---|---|---|---|
| `outside` | Boot attract, Title, Credits, High Scores, Lobby menus | Outside The Game | Any face/start activates; axes navigate lists |
| `level` | Instructions, Hoard, Level N | During Level | Full platforming commands |
| `fork` | Fork path select | During Fork | Path select + argue |
| `end` | End count/shares/spoils/name entry | During Endscreen | Letter entry + skip |

Scheme does **not** change the wire shape of `InputCommand`. It only changes:

1. Which physical keys contribute (optional filtering).
2. What **local UI hints** consumers may attach (not on the wire).
3. Whether the mapper emits `start` for skip vs pause intent (still same boolean; consumer decides).

Server interpretation remains authoritative ([input-commands.md](../../interfaces/input-commands.md) § Context interpretation).

### 4.1 Outside / Lobby

| Hardware | Command field effect |
|---|---|
| D-Pad / stick | `axes.x`, `axes.y` for list navigation |
| A / B / Start / any face | `jump` / `action` / `start` as pressed levels — Shell treats “any” as activate |
| Select | optional `select` |

Shell may treat *any* true face button as “dismiss attract / advance”; mapper still emits discrete fields.

### 4.2 Level (Instructions / Hoard / Level)

| Hardware | Command field |
|---|---|
| ← / → | `axes.x` |
| ↓ | `axes.y = -1` (duck / pickup intent) |
| ↑ | `axes.y = +1` (throw aim when combined with B on server) |
| A held | `jump = true` |
| B held | `action = true` |
| Start | `start = true` (local pause UI only — MVP; no server freeze — Q10-A) |

Chords **B+↓ drop**, **B+↑ throw** are **not** collapsed client-side. Mapper sends simultaneous `action` + `axes.y`.

### 4.3 Fork

| Hardware | Command field |
|---|---|
| ↑ / ↓ (primary) | `axes.y` path select |
| ← / → (alias) | also map to `axes.y` or `axes.x` — recommend mapping horizontal as **alias to `axes.y`** so server sees consistent path axis; document choice in implementation and keep both mapped if server accepts either (contract allows axes.x alias) |
| A or B pressed | `jump` / `action` for argue pulse |
| Start | ignored for fork tally (no-op on server); may still emit for local UI |

### 4.4 End name entry

| Hardware | Command field |
|---|---|
| ↑ / ↓ | `axes.y` letter change |
| ← / → | `axes.x` character slot |
| A | `jump` confirm letter / submit when full |
| B | `action` delete |
| Start | `start` skip animation / confirm entry |

During non-entry end phases (count/shares/spoils), Shell may keep scheme `end` and only honor `start` for skip (`C2S_EndSkip` via C-04 / Shell — mapper still only produces `InputCommand` or a local skip event; see §7).

---

## 5. Device backends

### 5.1 Keyboard (primary desktop)

Default binding table (logical 960×540 desktop browsers — Q1-A). Layout is **QWERTY-centric defaults**; remapping is stretch.

| Logical | Default keys (P1 / sole seat) |
|---|---|
| Left | `ArrowLeft`, `A` |
| Right | `ArrowRight`, `D` |
| Up | `ArrowUp`, `W` |
| Down | `ArrowDown`, `S` |
| Jump (A) | `Z`, `Space`, `J` |
| Action (B) | `X`, `K` |
| Start | `Enter`, `Escape` (Escape also may open local pause — Shell policy) |
| Select | `Shift` (optional) |

**Opposing axes:** simultaneous left+right → `0` (neutral cancel). Same for up+down.

**Key repeat:** ignore OS key-repeat for edges; mapper uses **level** (down set) each sample. Server does edge detect.

### 5.2 Gamepad

Use browser **Gamepad API** polled each frame (or each input sample).

| Logical | Standard mapping (W3C standard gamepad) |
|---|---|
| D-Pad | `buttons[12..15]` if present; else left stick |
| Left stick | axes 0/1 with deadzone **0.35** default, snap to ternary |
| A (South) | `buttons[0]` |
| B (East) | `buttons[1]` |
| Start | `buttons[9]` (or `buttons[8]` if device maps Menu differently — detect Start-like) |
| Select | `buttons[8]` |

**Device selection (MVP online):** first connected non-zero gamepad, or last used with input activity. Prefer explicit “press a button to bind device” on Lobby for determinism.

**Keyboard + gamepad merge (single seat):** OR of levels (if either device says jump down → jump true). Axes: prefer gamepad if stick/dpad active this sample; else keyboard. Document merge so dual-input does not fight.

### 5.3 Sample rate

- Sample at **display frame** or **30 Hz** aligned to net send — C-04 owns send rate; mapper should expose either:
  - `sample(): InputCommand` on demand, or
  - push-based “command changed / heartbeat” callbacks.
- Prefer **on-demand sample** driven by Netcode Client or Shell game loop so `seq` increments match send policy.

---

## 6. `InputCommand` production

### 6.1 Shape (frozen)

```text
InputCommand {
  seq: number
  clientTick?: number
  axes: { x: -1|0|1, y: -1|0|1 }
  jump: boolean
  action: boolean
  start: boolean
  select?: boolean
}
```

### 6.2 Sequence numbers

- Per **local seat** (MVP: single seat), `seq` starts at `1` on successful join/welcome (or `0` then first send is `1` — pick one; recommend first emitted command is `1`).
- Increment by **≥ 1** on every emitted sample that is handed to C-04 for send (including heartbeats of unchanged state if C-04 requests them).
- On reconnect: continue or reset per C-04 policy — **recommend reset `seq` to 1 after Welcome** and let server treat as new stream; gaps/duplicates handled server-side. Coordinate with C-04 DESIGN § reconnect.

### 6.3 Optional `clientTick`

- May mirror local predicted tick or performance.now-based tick index for RTT/debug.
- Not required for correctness; C-04 may fill or omit.

### 6.4 Validation before emit

- Clamp axes to ternary.
- Booleans only.
- Never invent inventory, position, or chord opcodes.

---

## 7. Integration boundaries

```text
┌─────────────┐   scheme + enable     ┌──────────────────┐
│ C-01 Shell  │ ───────────────────► │ C-03 Input Mapper│
│ C-11 End    │   (optional focus)   │                  │
└─────────────┘                      │  keyboard/pad    │
                                     │  sample()        │
                                     └────────┬─────────┘
                                              │ InputCommand
                                              ▼
                                     ┌──────────────────┐
                                     │ C-04 Netcode     │
                                     │ Client           │
                                     └──────────────────┘
```

| Peer | Direction | Contract |
|---|---|---|
| C-01 Shell | → scheme, focus, pause-menu open | Soft API: `setScheme`, `setEnabled` |
| C-04 Netcode | ← `InputCommand` stream | [input-commands.md](../../interfaces/input-commands.md) |
| C-13 Audio | first gesture unlock | Shell/Audio may observe “any input” separately; mapper may expose `wasAnyPressedThisFrame` helper |
| Phaser | Input plugin / keyboard/gamepad | Implementation detail only |

**Enabled flag:** when local pause menu open or text field focus (if any), Shell may disable mapper or filter `start` to avoid double-handling.

**End skip:** Shell may map `start` during end phases to `C2S_EndSkip` instead of/in addition to `C2S_Input` — C-04 owns message choice; mapper only provides the boolean.

---

## 8. State machine (local)

```text
                    setEnabled(true)
  [Disabled] ─────────────────────► [Active]
       ▲                               │
       │ setEnabled(false)             │ sample / device poll
       └───────────────────────────────┘

  scheme: outside | level | fork | end   (orthogonal)
  deviceBind: unbound | keyboard | gamepadId | hybrid
```

No network state lives here. Connection loss does not clear local held keys (C-04 stops sending; on reconnect held keys continue to sample — acceptable).

---

## 9. Default bindings as data

Bindings should be data tables, not hard-coded switches, so stretch remapping is cheap:

```text
BindingTable {
  scheme?: ControlScheme   // optional per-scheme overrides; MVP one global table
  keyboard: { left, right, up, down, jump, action, start, select? }[]
  gamepad: { ... standard indices / role names }
  deadzone: number
}
```

Ship **one default table** for MVP. Persist custom tables later in `localStorage` (stretch).

---

## 10. Stretch: local multi-pad (not MVP)

Q3-A freezes **online seats first**. Stretch design notes only:

- One browser may bind **up to 4 gamepads → 4 seats**, each with its own `seq` space and seatToken (multi-join or multi-seat single connection — ADR-002 prefers multi-seat from one connection later).
- Mapper becomes `Map<localPlayerIndex, InputCommand producer>`.
- Netcode Client must multiplex seats; **out of scope for C-03 MVP tasks**.
- Do not block online-first design on multi-pad.

---

## 11. Error handling and robustness

| Condition | Behavior |
|---|---|
| Gamepad disconnect mid-run | Fall back to keyboard; optional Shell toast |
| No devices | Emit neutral command if C-04 heartbeats; still allow keyboard anytime |
| Tab unfocused | Browser may throttle; still sample when running; held keys may stuck-true — on `visibilitychange` / `blur`, **clear held key set** (important) |
| Browser auto-repeat | Levels not edges — OK |
| PreventDefault | Arrow keys / space: prevent scroll when game canvas focused |

---

## 12. Testing strategy (design)

| Layer | Cases |
|---|---|
| Unit (pure map) | Key sets → axes ternary; cancel opposites; deadzone thresholds |
| Unit | Chord-ready: B+down yields `action=true, axes.y=-1` without inventing drop opcode |
| Unit | Scheme switch does not reset `seq` (unless product decides otherwise — recommend **no reset** on scheme-only change) |
| Integration (client) | Phaser scene: press Z → command.jump true in sample |
| Manual | Gamepad + keyboard hybrid; blur tab releases keys |

Golden fixtures: table-driven device state snapshots → expected `InputCommand` (minus `seq`).

---

## 13. Suggested package / module layout (future code)

Documentation of intended placement only:

```text
client/src/input/
  types.ts           // ControlScheme, BindingTable
  bindings-default.ts
  keyboard-source.ts
  gamepad-source.ts
  merge.ts
  mapper.ts          // InputMapper class
  seq.ts
```

Depends on `packages/protocol` for `InputCommand` type once it exists. **No server imports.**

---

## 14. Risks

| Risk | Mitigation |
|---|---|
| Stuck keys after alt-tab | Clear on blur/visibility |
| Analog stick diagonal spam | Cardinal snap: dominant axis or both ternary independently with deadzone |
| Escape vs Start confusion | Document: Escape = Start role for keyboard; Shell pause vs leave |
| Design “Any button” vs discrete fields | Shell ORs fields for outside scheme |
| Multi-pad accidental scope creep | Explicit stretch; MVP single seat |

---

## 15. Open implementation choices (non-blocking)

1. Exact default key set (Z/X vs J/K) — pick in C03-T03 and document in bindings file.
2. Whether `select` is emitted at all in MVP — optional field; can omit.
3. Fork horizontal alias mapping detail — recommend dual-map to `axes.y` for path so one server path works.

These do not require new ADRs.

---

## 16. Acceptance criteria (component)

1. Keyboard and at least one standard gamepad produce valid ternary `InputCommand`s.
2. Level scheme exposes simultaneous B + vertical axis for server drop/throw.
3. Schemes switch without mapper ownership of network phase.
4. Online MVP path uses single local seat; multi-pad not required.
5. Blur/focus does not leave sticky run or jump.
6. Contract-compliant fields only — no client-side teleport or inventory messages.
