# C-03 — Input Mapper — Tasks

Ownership: **SE-3**. Task IDs: `C03-T##`.  
Depends on frozen contracts: [input-commands.md](../../interfaces/input-commands.md).  
Related design: [DESIGN.md](./DESIGN.md).  
Coordinates with: C-04 Netcode Client, C-01 Shell.

**No application code in this documentation phase** — tasks below are the implementation backlog when build starts.

---

## Legend

| Priority | Meaning |
|---|---|
| P0 | Required for P0/P2 netcode slice |
| P1 | Required for full flow (lobby/fork/end) |
| P2 | Polish / stretch |

| Status | Meaning |
|---|---|
| todo | Not started |
| blocked | Waiting on dependency |
| done | Complete |

---

## Foundation

### C03-T01 — Protocol types dependency
- **Priority:** P0  
- **Status:** todo  
- **Description:** Consume `InputCommand` (and optional `ControlScheme` if colocated) from `packages/protocol` once P0 stubs land. Until then, mirror the frozen markdown contract in a temporary type file that is deleted when protocol package exists.  
- **Depends on:** Protocol package skeleton (monorepo P0)  
- **Acceptance:** Mapper compiles against shared type; no duplicated divergent field names.

### C03-T02 — ControlScheme enum & mapper API sketch
- **Priority:** P0  
- **Status:** todo  
- **Description:** Define public API surface in design-aligned module docs/tests: `setScheme(outside|level|fork|end)`, `setEnabled(bool)`, `sample(): InputCommand`, `resetSeq()`, `getLastCommand()`, optional `onChange` callback.  
- **Acceptance:** API documented; unit tests can construct mapper with mock sources.

### C03-T03 — Default binding tables
- **Priority:** P0  
- **Status:** todo  
- **Description:** Data-driven keyboard + gamepad role bindings (NES mental model). Choose and document defaults (arrows/WASD, Z/Space jump, X action, Enter start). Deadzone default `0.35`.  
- **Acceptance:** Binding table is pure data; covered by at least one fixture test.

---

## Device sources

### C03-T04 — Keyboard source
- **Priority:** P0  
- **Status:** todo  
- **Description:** Track keydown/keyup level sets; opposite-axis cancel; ignore OS repeat for state (levels only).  
- **Acceptance:** Unit tests with synthetic key events → ternary axes + button levels.

### C03-T05 — Focus / blur key clearing
- **Priority:** P0  
- **Status:** todo  
- **Description:** On `window.blur`, `visibilitychange` (hidden), and canvas lose-focus, clear all held keys/buttons to neutral.  
- **Acceptance:** Simulated blur yields neutral sample; no sticky jump/run.

### C03-T06 — Gamepad source (poll)
- **Priority:** P0  
- **Status:** todo  
- **Description:** Poll Gamepad API; map standard buttons; stick→ternary with deadzone; prefer D-Pad when pressed.  
- **Acceptance:** Mock gamepad state → expected command fields; disconnect falls back cleanly.

### C03-T07 — Keyboard + gamepad merge (single seat)
- **Priority:** P0  
- **Status:** todo  
- **Description:** OR button levels; axes preference policy per DESIGN §5.2.  
- **Acceptance:** Dual-input fixture: pad left + keyboard jump → both reflected.

### C03-T08 — PreventDefault for game keys when focused
- **Priority:** P1  
- **Status:** todo  
- **Description:** When game has focus, prevent arrow/space scrolling.  
- **Acceptance:** Manual checklist item; optional smoke test later.

---

## Seq & sampling

### C03-T09 — Monotonic seq generator
- **Priority:** P0  
- **Status:** todo  
- **Description:** Per local seat seq starting at 1 on first post-join sample; `resetSeq()` on Welcome/reconnect per C-04 coordination.  
- **Acceptance:** N samples → seq 1..N; reset restarts at 1.

### C03-T10 — sample() pure mapping path
- **Priority:** P0  
- **Status:** todo  
- **Description:** Implement device state → `InputCommand` without network side effects. Optional `clientTick` passthrough.  
- **Acceptance:** Golden table tests (device snapshot → command sans seq, then with seq).

### C03-T11 — Heartbeat sampling support
- **Priority:** P0  
- **Status:** todo  
- **Description:** Allow C-04 to call `sample()` every send tick even if unchanged (for idle AI-takeover prevention / held run).  
- **Acceptance:** Unchanged hold still increments seq when sampled for send.

---

## Schemes

### C03-T12 — Scheme: level
- **Priority:** P0  
- **Status:** todo  
- **Description:** Full axes + jump + action + start mapping; ensure B+vertical simultaneous possible.  
- **Acceptance:** Fixture: action+down; action+up; jump alone.

### C03-T13 — Scheme: outside / lobby
- **Priority:** P1  
- **Status:** todo  
- **Description:** Axes for menus; face buttons for activate. Document Shell “any button” OR policy.  
- **Acceptance:** Navigation axes work; start/jump/action emit on face keys.

### C03-T14 — Scheme: fork
- **Priority:** P1  
- **Status:** todo  
- **Description:** Path select via axes.y (primary); horizontal alias policy implemented; A/B for argue.  
- **Acceptance:** Up/down and left/right produce path-relevant axes; jump/action pulse levels.

### C03-T15 — Scheme: end (name entry)
- **Priority:** P1  
- **Status:** todo  
- **Description:** Letter/slot axes; A confirm; B delete; Start skip/confirm.  
- **Acceptance:** Mapping table tests for end scheme.

### C03-T16 — Shell wiring hooks
- **Priority:** P1  
- **Status:** todo  
- **Description:** Integrate with C-01 scene transitions to call `setScheme` from local scene / phase mirror.  
- **Depends on:** C-01 scene graph skeleton  
- **Acceptance:** Entering Level scene → scheme level; Fork → fork; etc.

---

## Integration with C-04

### C03-T17 — Stream to Netcode Client
- **Priority:** P0  
- **Status:** todo  
- **Description:** Provide sample API consumed by C-04 send loop; no direct WebSocket in C-03.  
- **Depends on:** C04-T10 (send loop) can stub  
- **Acceptance:** Integration test or harness: mapper sample appears in outbound `C2S_Input` payload.

### C03-T18 — Join/reconnect seq reset coordination
- **Priority:** P0  
- **Status:** todo  
- **Description:** On C-04 Welcome (initial or reconnect), reset seq policy agreed in both DESIGNs.  
- **Depends on:** C04-T05  
- **Acceptance:** Post-reconnect first input seq is 1 (or documented alternative tested end-to-end).

### C03-T19 — Local pause does not freeze server inputs policy
- **Priority:** P1  
- **Status:** todo  
- **Description:** When Shell opens local pause (Start in level), either stop sending movement or send neutrals — **recommend send neutrals / stop predicting motion** while pause UI open; server continues. Document with C-01.  
- **Acceptance:** Written policy + `setEnabled(false)` or forced neutral while paused.

---

## Quality

### C03-T20 — Unit test suite
- **Priority:** P0  
- **Status:** todo  
- **Description:** Vitest (or project runner) covering axes cancel, deadzone, chords-as-levels, seq, blur clear, schemes.  
- **Acceptance:** CI green; ≥ the DESIGN §12 cases.

### C03-T21 — Manual gamepad checklist
- **Priority:** P1  
- **Status:** todo  
- **Description:** Checklist under `docs/testing/` (later) for Xbox/PlayStation-layout pads in Chrome/Firefox/Safari desktop.  
- **Acceptance:** Checklist filed; SE-3 sign-off on one pad type minimum.

---

## Stretch (explicitly not MVP)

### C03-T22 — Remappable bindings UI
- **Priority:** P2  
- **Status:** todo  
- **Description:** Persist binding overrides to `localStorage`; conflict detection.  
- **Acceptance:** Stretch only.

### C03-T23 — Multi-pad local seats
- **Priority:** P2  
- **Status:** todo  
- **Description:** N gamepads → N producers; coordinate multi-seat join with C-04/C-05. Per Q3-A stretch.  
- **Acceptance:** Stretch only; must not regress single-seat online.

### C03-T24 — Touch / mobile controls
- **Priority:** P2  
- **Status:** todo  
- **Description:** On-screen NES pad. Out of Q1-A desktop MVP.  
- **Acceptance:** Stretch only.

---

## Dependency graph (summary)

```text
C03-T01 → T02 → T03
T03 → T04, T06
T04 → T05, T07
T06 → T07
T07 → T10 → T09 → T11
T10 → T12 (P0 level)
T12 → T17 → C-04
T13,T14,T15 → T16 (P1 schemes)
T09 → T18
T20 throughout
```

## Phase mapping

| Impl plan phase | Tasks |
|---|---|
| P0 Foundations | T01–T03 (types/API) |
| P2 Netcode slice | T04–T12, T17–T18, T20 |
| P4 Flow shell | T13–T16, T19, T21 |
| P7 Stretch | T22–T24 |
