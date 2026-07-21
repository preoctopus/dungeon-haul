# C-04 — Netcode Client — Tasks

Ownership: **SE-3**. Task IDs: `C04-T##`.  
Depends on frozen contracts: [netcode-messages.md](../../interfaces/netcode-messages.md), [input-commands.md](../../interfaces/input-commands.md).  
Related design: [DESIGN.md](./DESIGN.md).  
Coordinates with: C-03 Input Mapper, C-01 Shell, C-05 Lobby, C-06 server room (integration).

**No application code in this documentation phase** — tasks are the implementation backlog.

---

## Legend

| Priority | Meaning |
|---|---|
| P0 | Required for P2 netcode slice |
| P1 | Full flow / reconnect polish / end |
| P2 | Stretch / optimization |

| Status | Meaning |
|---|---|
| todo | Not started |
| blocked | Waiting on dependency |
| done | Complete |

---

## Foundation

### C04-T01 — Protocol message types
- **Priority:** P0  
- **Status:** todo  
- **Description:** Consume all `C2S_*` / `S2C_*` types and `WorldSnapshot` from `packages/protocol`. Add encode/decode helpers or zod/io-ts validators as project standard.  
- **Depends on:** Monorepo P0 protocol stubs  
- **Acceptance:** Typecheck against frozen field names; version field `protocolVersion: 1`.

### C04-T02 — JSON codec
- **Priority:** P0  
- **Status:** todo  
- **Description:** Serialize/deserialize WS text frames; unknown type ignore; malformed guard.  
- **Acceptance:** Round-trip fixtures for Join, Welcome, Input, Snapshot, Error, Event, Pong.

### C04-T03 — Token store
- **Priority:** P0  
- **Status:** todo  
- **Description:** `sessionStorage` bundle: `sessionId`, `wsUrl`, `seatToken`, `reconnectToken`, `seatId`. Clear API: `save`, `load`, `clear`.  
- **Acceptance:** Unit tests with mock Storage.

### C04-T04 — Connection FSM
- **Priority:** P0  
- **Status:** todo  
- **Description:** Implement states `idle|connecting|joining|playing|reconnecting|lost|closed` with event emitter/callbacks.  
- **Acceptance:** Table-driven transition tests for happy path + drop + auth fail.

---

## Session lifecycle

### C04-T05 — Connect + C2S_Join + Welcome
- **Priority:** P0  
- **Status:** todo  
- **Description:** Open WebSocket; send Join; handle Welcome (store seatId, tickRate, reconnectToken, apply initial snapshot); handle Error codes.  
- **Acceptance:** Mock server test: connect → Welcome → state `playing`.

### C04-T06 — Join timeout
- **Priority:** P0  
- **Status:** todo  
- **Description:** If no Welcome within timeout (e.g. 5s), close and `lost`.  
- **Acceptance:** Mock silent server → lost.

### C04-T07 — Graceful leave
- **Priority:** P0  
- **Status:** todo  
- **Description:** `leave()` sends `C2S_Leave`, closes socket, clears tokens, state `idle`/`closed`.  
- **Acceptance:** Leave does not auto-reconnect.

### C04-T08 — Unexpected disconnect → reconnecting
- **Priority:** P0  
- **Status:** todo  
- **Description:** On socket close while playing with token, enter reconnecting; backoff; re-Join with reconnectToken.  
- **Acceptance:** Mock drop → rejoin Welcome → playing; token refreshed.

### C04-T09 — Reconnect failure / grace expired
- **Priority:** P0  
- **Status:** todo  
- **Description:** AUTH/timeout after backoff budget → `lost`; clear tokens; notify Shell.  
- **Acceptance:** Simulated AUTH → lost; no infinite loop.

---

## Send path

### C04-T10 — Input send loop
- **Priority:** P0  
- **Status:** todo  
- **Description:** Interval from Welcome `tickRate` (default 30): sample C-03, wrap `C2S_Input`, send. Cap rate.  
- **Depends on:** C03-T17 (can stub mapper)  
- **Acceptance:** With fake clock, N ticks → N inputs with increasing seq.

### C04-T11 — Ready / claim character
- **Priority:** P1  
- **Status:** todo  
- **Description:** Public methods → `C2S_Ready`, `C2S_ClaimCharacter`.  
- **Acceptance:** Outbound payload tests.

### C04-T12 — Ping / RTT
- **Priority:** P1  
- **Status:** todo  
- **Description:** Periodic `C2S_Ping`; handle `S2C_Pong`; expose rttMs.  
- **Acceptance:** Fake pong computes expected RTT.

### C04-T13 — EndSkip + NameEntry
- **Priority:** P1  
- **Status:** todo  
- **Description:** `C2S_EndSkip`, `C2S_NameEntry` for End Director / Shell.  
- **Acceptance:** Payload shape tests; only meaningful in end phases (client may still send; server validates).

---

## Receive path & world view

### C04-T14 — ClientWorldView store
- **Priority:** P0  
- **Status:** todo  
- **Description:** Authoritative fields + queues; immutable snapshot snapshots or copy-on-write for readers.  
- **Acceptance:** Apply snapshot updates haulers/treasures/tick/phase.

### C04-T15 — Snapshot application
- **Priority:** P0  
- **Status:** todo  
- **Description:** Apply full `S2C_Snapshot`; feed reconciliation + remote buffers.  
- **Acceptance:** Integration: sequence of snapshots advances tick; last wins on burst.

### C04-T16 — Event queue
- **Priority:** P0  
- **Status:** todo  
- **Description:** Enqueue `S2C_Event`; drain API for presentation/audio each frame.  
- **Acceptance:** Events not lost before drain; reconnect does not require historical events.

### C04-T17 — PhaseChange / SeatUpdate / ForkState / ScoreReport handlers
- **Priority:** P1  
- **Status:** todo  
- **Description:** Wire remaining S2C types into world view + Shell notifications.  
- **Acceptance:** Unit tests per message type; Shell can subscribe to phase.

---

## Prediction & reconciliation

### C04-T18 — Pending input buffer
- **Priority:** P0  
- **Status:** todo  
- **Description:** Ring buffer of sent commands by seq; drop when ack ≥ seq.  
- **Acceptance:** Ack prunes correctly; overflow drops oldest with log.

### C04-T19 — Local movement predictor (MVP)
- **Priority:** P0  
- **Status:** todo  
- **Description:** Predict local x run + jump (P2 minimum). Optional simple gravity. Prefer shared helper module when available.  
- **Acceptance:** Held right increases predicted x; jump changes vy when grounded flag true.

### C04-T20 — Reconciliation
- **Priority:** P0  
- **Status:** todo  
- **Description:** On snapshot: baseline local hauler from server; replay unacked inputs; soft/hard correct thresholds. Carry/stun always server.  
- **Acceptance:** Unit: deliberate mispredict then ack → converges to server+replay; inventory never client-invented.

### C04-T21 — Soft correction blend
- **Priority:** P1  
- **Status:** todo  
- **Description:** Small error blend over ~50–100ms; large error snap.  
- **Acceptance:** Threshold config tests.

### C04-T22 — Do-not-predict inventory/traps policy tests
- **Priority:** P0  
- **Status:** todo  
- **Description:** Explicit tests that pickup/trap domains stay server-driven.  
- **Acceptance:** Fixture proves carry stack equals snapshot after reconcile.

---

## Interpolation

### C04-T23 — Remote hauler interpolation buffer
- **Priority:** P0  
- **Status:** todo  
- **Description:** Buffer snapshots; render at now - delay (~2 ticks); lerp positions.  
- **Acceptance:** Two-keyframe test mid-point; underrun holds last.

### C04-T24 — Local vs remote path split
- **Priority:** P0  
- **Status:** todo  
- **Description:** Local seat uses prediction path; others use interpolation.  
- **Acceptance:** Unit ensures localSeatId not written solely by interp.

---

## Shell integration

### C04-T25 — Public SessionClient façade
- **Priority:** P0  
- **Status:** todo  
- **Description:** Clean API: `connect`, `leave`, `setReady`, `claimCharacter`, `submitName`, `skipEnd`, `getWorldView`, `getConnectionState`, `getRtt`, event subscriptions.  
- **Acceptance:** Shell can drive session without importing internals.

### C04-T26 — Wire to C-01 scenes
- **Priority:** P1  
- **Status:** todo  
- **Description:** Phase notifications drive scene changes; connection banners.  
- **Depends on:** C-01 scene skeleton  
- **Acceptance:** Manual: lobby ready → instructions phase reflected.

### C04-T27 — Wire to C-02 presentation
- **Priority:** P0  
- **Status:** todo  
- **Description:** Presentation reads transforms from world view each frame.  
- **Acceptance:** Two-browser placeholder sprites track server motion (P2 gate).

---

## Quality & gates

### C04-T28 — Mock WebSocket test harness
- **Priority:** P0  
- **Status:** todo  
- **Description:** In-memory or mock-ws server script for join/input/snapshot/reconnect.  
- **Acceptance:** CI runs harness without real Colyseus.

### C04-T29 — Contract integration checklist
- **Priority:** P0  
- **Status:** todo  
- **Description:** Cover netcode-messages test contract items 1–5 from client side (with server stub or real room).  
- **Acceptance:** Checklist green for P2 gate G3.

### C04-T30 — Debug HUD metrics (optional)
- **Priority:** P1  
- **Status:** todo  
- **Description:** Overlay RTT, pending depth, state, snapshot age (dev flag).  
- **Acceptance:** Toggle works in dev builds.

### C04-T31 — Playtest Session A support
- **Priority:** P1  
- **Status:** todo  
- **Description:** Ensure build supports 2–4 remote humans movement demo; document known feel limits.  
- **Acceptance:** Session A runnable per Implementation Plan.

---

## Stretch

### C04-T32 — Delta snapshot support
- **Priority:** P2  
- **Status:** todo  
- **Description:** Apply delta messages if server adds them; keep full snapshot path.  
- **Acceptance:** Stretch only.

### C04-T33 — Binary / msgpack codec
- **Priority:** P2  
- **Status:** todo  
- **Description:** Swap codec behind interface.  
- **Acceptance:** Stretch only.

### C04-T34 — Multi-seat single client
- **Priority:** P2  
- **Status:** todo  
- **Description:** Multiple seatTokens / multiplexed inputs for couch hybrid.  
- **Acceptance:** Stretch (Q3-A).

### C04-T35 — Full rollback / 60 Hz
- **Priority:** P2  
- **Status:** todo  
- **Description:** Only if Session A demands; ADR-002 stretch.  
- **Acceptance:** Stretch only.

---

## Dependency graph (summary)

```text
C04-T01 → T02 → T03 → T04
T04 → T05 → T06, T07
T05 → T08 → T09
T05 → T14 → T15 → T18 → T19 → T20
T15 → T23 → T24
T10 ← C-03 sample
T05 → T10
T14 → T25 → T27 (P2 gate)
T16, T17 → T26 (P1 flow)
T28 → T29 → P2 exit
```

## Phase mapping

| Impl plan phase | Tasks |
|---|---|
| P0 Foundations | T01–T04 |
| P2 Netcode slice | T05–T10, T14–T16, T18–T20, T22–T25, T27–T29 |
| P4 Flow shell | T11–T13, T17, T21, T26, T30–T31 |
| P5 Hardening | T08–T09 polish, metrics |
| P7 Stretch | T32–T35 |

## P2 exit criteria (owned with SE-4/SE-5)

- [ ] Two browsers share hauler positions on box level  
- [ ] Network kill → reconnect restores seat within grace  
- [ ] Inputs seq + lastProcessedSeq reconciliation visible in tests  
- [ ] Connection state never stuck in `connecting` without timeout  
