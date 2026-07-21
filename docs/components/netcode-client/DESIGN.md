# C-04 — Netcode Client — Design

| Field | Value |
|---|---|
| Component | **C-04 Netcode Client** |
| Ownership | **SE-3** (with C-03 Input Mapper) |
| Status | Design (documentation only; no application code) |
| Contracts | [netcode-messages.md](../../interfaces/netcode-messages.md), [input-commands.md](../../interfaces/input-commands.md), [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) |
| Architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) §6; [ADR-002](../../decisions/ADR-002-multiplayer-netcode.md) |
| Frozen product choices | Q2-A private codes; Q3-A online seats; Q10-A no global pause |

---

## 1. Purpose

Own the **client-side realtime session**: WebSocket lifecycle, outbound inputs/ready/claim messages, inbound snapshot/event application, **local prediction + reconciliation**, remote **interpolation**, reconnect-token storage, and connection-state signals for the Shell.

Gameplay truth always belongs to the server. This component makes the local hauler feel responsive and keeps remote haulers smooth without granting the client authority over inventory, scores, or collisions.

---

## 2. Goals and non-goals

### Goals

1. Join with `seatToken` (+ optional `reconnectToken`) → `S2C_Welcome` → continuous play.
2. Send `C2S_Input` at ~**30 Hz** (tickRate from Welcome) with mapper commands.
3. Apply `S2C_Snapshot` / phase / events / score report into a **client world view** for C-01/C-02.
4. **Predict** local hauler kinematics; **reconcile** via `lastProcessedInputSeq`.
5. **Interpolate** remote haulers between snapshots.
6. Persist reconnect token; auto-reconnect within grace UX.
7. Expose connection FSM to Shell: `idle | connecting | joining | playing | reconnecting | lost | closed`.

### Non-goals (MVP)

- Rendering sprites/camera (C-02).
- Lobby HTTP create/join (C-05 client helper / Shell); C-04 only consumes `wsUrl`, `sessionId`, `seatToken`, `reconnectToken`.
- Authoritative physics (C-06).
- Score math (C-07).
- Binary/msgpack codecs (stretch); JSON MVP.
- Delta compression (stretch).
- Multi-seat from one client (stretch).
- Spectator mode (stretch).

---

## 3. Session lifecycle

```mermaid
sequenceDiagram
  participant Shell as C-01 Shell
  participant Lobby as C-05 REST
  participant Net as C-04 Net Client
  participant Map as C-03 Mapper
  participant Room as Server Room

  Shell->>Lobby: create/join
  Lobby-->>Shell: sessionId, seatToken, reconnectToken, wsUrl
  Shell->>Net: connect({ sessionId, seatToken, reconnectToken, wsUrl })
  Net->>Room: C2S_Join
  Room-->>Net: S2C_Welcome (seatId, tickRate, snapshot, reconnectToken)
  Net->>Net: store tokens; apply snapshot; reset prediction
  loop ~tickRate
    Map-->>Net: sample InputCommand
    Net->>Room: C2S_Input
    Room-->>Net: S2C_Snapshot / S2C_Event / ...
    Net->>Net: reconcile + interpolate
  end
  Note over Net,Room: disconnect → reconnect with token
```

### 3.1 Connect parameters

```text
ConnectOptions {
  wsUrl: string
  sessionId: string
  seatToken: string
  reconnectToken?: string
  protocolVersion: 1          // from packages/protocol
  clientInfo?: { name?, build? }
}
```

### 3.2 Join handshake

1. Open WebSocket to `wsUrl`.
2. On open, send `C2S_Join` ([netcode-messages.md](../../interfaces/netcode-messages.md)).
3. Expect `S2C_Welcome` or `S2C_Error`.
4. On Welcome:
   - Record `seatId`, `tickRate`, `rngSeed`, `rulesetVersion`, `phase`.
   - Replace stored `reconnectToken` with Welcome’s token.
   - Apply full `snapshot` as baseline.
   - Reset input seq coordination with C-03.
   - Enter `playing`.
5. On Error: map code → user-visible reason; enter `lost` / `closed`.

### 3.3 Graceful leave

- Send `C2S_Leave` when Shell exits to Title intentionally.
- Close socket; clear prediction buffers; **retain or clear tokens** per leave reason:
  - Intentional leave: clear reconnect token.
  - Unexpected drop: keep token for reconnect.

---

## 4. Connection state machine

```text
                     connect()
  idle ──────────────────────────► connecting
                                     │
                          socket open│
                                     ▼
                                  joining ──C2S_Join──► (wait Welcome)
                                     │
                    Welcome          │           Error / timeout
                                     ▼                │
                                  playing ◄───────────┤
                                     │                │
                      socket drop    │                ▼
                                     ▼              lost
                                reconnecting ──fail───┘
                                     │
                              Welcome│
                                     ▼
                                  playing

  playing ── leave() / phase closed ──► closed → idle
```

| State | Shell UX |
|---|---|
| `idle` | Not in session |
| `connecting` | Spinner |
| `joining` | “Joining room…” |
| `playing` | Game scenes driven by phase |
| `reconnecting` | Banner “Reconnecting…”; freeze or ghost local predict |
| `lost` | Modal: retry / return to title |
| `closed` | Room ended / kicked |

Emit `onConnectionStateChange` events. Never block the JS thread on network.

---

## 5. Reconnect tokens

### 5.1 Storage

| Key | Storage | Notes |
|---|---|---|
| `reconnectToken` | `sessionStorage` (primary) | Per-tab; matches ADR/Architecture |
| `sessionId`, `seatId`, `wsUrl`, `seatToken` | `sessionStorage` bundle | Needed to rebuild `ConnectOptions` |

Optional stretch: `localStorage` for cross-tab reclaim (usually undesirable).

### 5.2 Reconnect flow

1. On unexpected close while `playing` and token present → `reconnecting`.
2. Exponential backoff: e.g. 0.5s, 1s, 2s, 4s… cap 8s; overall client effort ~ grace window (server grace **~30s** per Architecture).
3. New socket; `C2S_Join` with **both** `seatToken` and `reconnectToken`.
4. On Welcome: full snapshot resync; clear prediction buffer; replay none or rebuild from snapshot only; reset mapper seq (coordinate C-03).
5. If `S2C_Error AUTH` / grace expired: `lost`; clear tokens; Shell offers re-join via code if seats free (new seatToken from Lobby — not C-04’s job alone).

### 5.3 What reconnect must restore (server-owned)

Client does **not** restore inventory itself — snapshot carries hauler carry stack, positions, phase. Client only restores transport + prediction bookkeeping.

---

## 6. Outbound messages

| Message | Trigger | Rate / notes |
|---|---|---|
| `C2S_Join` | connect / reconnect | once per socket |
| `C2S_Input` | send loop | ≤ tickRate; also on change optional; heartbeat held inputs |
| `C2S_Ready` | Shell lobby/instructions ready toggle | on change |
| `C2S_ClaimCharacter` | Shell character pick | on change |
| `C2S_Leave` | intentional exit | once |
| `C2S_Ping` | RTT probe | 1 Hz optional |
| `C2S_EndSkip` | Shell end cinematic skip | on Start during end |
| `C2S_NameEntry` | Shell submits name string | once per entry |

**Input path:** each send tick, `command = mapper.sample()`, wrap:

```text
C2S_Input { type: "input", seatId, command: InputCommand }
```

`seatId` must match Welcome; server also binds via token — client still sends seatId per contract.

**Rate limit:** do not exceed ~`tickRate * 2` (server rejects excess). Client clocks send with `tickRate` from Welcome (default 30).

---

## 7. Inbound messages & client world view

### 7.1 Client world model (ephemeral)

```text
ClientWorldView {
  tick: number
  phase: SessionPhase
  levelId?: string
  levelsCompleted: number
  localSeatId: number
  haulers: Map<seatId, HaulerPublic>      // post-interp / post-predict
  treasures: TreasurePublic[]
  traps: TrapPublic[]
  switches: SwitchPublic[]
  cameraHint?: { x, y, z? }
  lastProcessedInputSeq: { [seatId]: number }
  fork?: ForkState
  scoreReport?: ScoreReport
  seatsPublic?: SeatPublic[]
  eventsQueue: GameEvent[]                // consumed by Audio/VFX each frame
}
```

C-02/C-01 **read** this view (or subscribe to diffs). They must not mutate authoritative fields except consuming `eventsQueue`.

### 7.2 Snapshot application

On `S2C_Snapshot`:

1. Store as `latestAuthoritativeSnapshot`.
2. Update non-local entities into interpolation buffers (§9).
3. For **local** hauler: run reconciliation (§8).
4. Update phase/levelId/levelsCompleted/cameraHint/traps/switches/treasures from snapshot (treasures/traps: hard-correct; no client prediction of ownership for MVP).

**MVP:** full snapshot every tick (or every N ticks). Tolerate lost packets by applying latest only (no requirement to apply every intermediate).

### 7.3 Events

On `S2C_Event`: push to `eventsQueue` for C-02/C-13. Do not invent missing events after reconnect — snapshot heals state; some one-shot SFX may be skipped (acceptable per contract).

### 7.4 Phase change

On `S2C_PhaseChange` (and/or phase on snapshot): notify Shell to switch scenes. Net client does not load Phaser scenes itself.

### 7.5 Score report

On `S2C_ScoreReport`: store; Shell/End Director reads for cinematics; completionToken used later by C-12 client submit.

### 7.6 Fork state

On `S2C_ForkState`: expose tallies/options for Fork UI.

### 7.7 Seat updates

On `S2C_SeatUpdate`: lobby UI + AI/human takeover indicators (`control` field also on haulers in snapshots).

### 7.8 Errors & pong

- `S2C_Error`: surface to Shell; protocol mismatch → hard fail with upgrade message.
- `S2C_Pong`: RTT = now - clientTime; expose metrics for telemetry/UI.

---

## 8. Prediction & reconciliation

### 8.1 Principles (ADR-002)

- Predict **local hauler only**.
- Server is truth; on mismatch, correct without destroying feel.
- Shared pure kinematics helpers preferred (same formulas as server movement) when available from a shared package; until then, approximate run/jump and accept correction.

### 8.2 Pending input buffer

```text
PendingInput {
  command: InputCommand
  seq: number
  // optional: predicted local state after applying command
  predicted?: { x, y, vx, vy, facing }
}
```

Ring buffer size: enough for RTT × tickRate + margin — e.g. **64–128** entries (~2–4s at 30 Hz). Drop acked entries when `seq <= lastProcessedInputSeq[localSeatId]`.

### 8.3 Predict step (each client frame or each send tick)

1. Sample/send input (send loop may be 30 Hz; render may be 60 Hz).
2. Apply **local movement prediction** for unacked commands + current held input:
   - axes.x → horizontal accel/run toward max speed (respect weight if known from carry count — optional MVP simple constant speed).
   - jump edge → apply jump impulse if predicted grounded.
   - Do **not** predict pickup grants, trap hits, throws ownership, or stun for MVP **or** predict stun only when server event already applied.
3. Presentation reads predicted local transform.

**MVP minimum (P2 gate):** predict **x movement + jump** on flat/box geometry if client has collision copy; if no local geometry yet, kinematic integrate and hard-correct on snapshot (still better than no predict for run).

### 8.4 Reconcile on snapshot

Let `ack = snapshot.lastProcessedInputSeq[localSeatId]`.

1. Remove pending inputs with `seq <= ack`.
2. Set local hauler baseline from snapshot (x, y, vx, vy, facing, anim, carry, stunned).
3. **Replay** remaining pending inputs through the same predictor in seq order.
4. Compare replayed end state to previously displayed prediction:
   - If error small (e.g. &lt; 2–4 px): snap or smooth blend.
   - If large: snap to reconciled state (avoid long rubber-band).
5. Carry stack / stunned / control: **always** take server values (no replay of inventory).

### 8.5 What not to predict (MVP)

| Domain | Reason |
|---|---|
| Treasure pickup success | Racey; server grants |
| Trap stun | Server events |
| Other players | Interpolation only |
| Fork tallies | Server |
| Scores | Server `ScoreReport` only |

### 8.6 Soft correction

Optional exponential blend over 50–100 ms for small errors to reduce visual hitch. Large errors snap. Configurable thresholds.

---

## 9. Remote entity interpolation

For each remote hauler (and optionally free treasures):

1. Buffer last **2+** snapshots with timestamps (client receive time or server tick converted via estimated offset).
2. Render at `now - interpDelay` where `interpDelay` ≈ 2 ticks (e.g. **66–100 ms**) to absorb jitter.
3. Lerp position; snap facing/anim on segment boundaries; prefer anim from nearest snapshot.
4. If buffer underruns: hold last transform or slow extrapolate **short** (&lt; 1 tick); do not extrapolate long (platforming desync).

Local hauler: **not** interpolated via this path (predicted).

---

## 10. Time sync (lightweight)

- `C2S_Ping` / `S2C_Pong` → RTT and rough server time offset.
- Server tick on snapshot + tickRate → estimate server tick at client now for debug overlays.
- Not required for MVP correctness of reconciliation (seq-based).

---

## 11. Integration boundaries

| Peer | Interaction |
|---|---|
| C-03 Input Mapper | `sample()` each send; `resetSeq` on Welcome |
| C-01 Shell | `connect`/`leave`; ready/claim/name/skip; connection state; phase-driven scenes |
| C-02 Presentation | read `ClientWorldView`; consume events |
| C-05 Lobby | provides tokens/wsUrl before connect; not called every tick |
| C-11 End Director | reads `scoreReport`; may call name/skip APIs |
| C-13 Audio | consumes gameplay events from queue (or mirrored bus) |
| `packages/protocol` | encode/decode message types |

**Independence:** No Phaser imports inside core net/prediction modules if avoidable — keep pure TS so unit tests run in Node. Thin Phaser/plugin adapter for socket wiring OK.

---

## 12. Message codec

MVP: **JSON text frames**.

```text
send(obj) -> JSON.stringify
recv(data) -> JSON.parse + narrow by type field
```

Validate required fields; unknown `type` → log + ignore (forward compatible). `protocolVersion` mismatch only on join.

Stretch: msgpack / binary schema without changing semantic contract.

---

## 13. Failure modes

| Failure | Client behavior |
|---|---|
| Join timeout (e.g. 5s no Welcome) | Close; `lost` |
| PROTOCOL error | Permanent; show update message |
| AUTH error | Clear tokens; `lost` |
| FULL | `lost`; Shell returns to join UI |
| Mid-game stall (no messages N seconds) | Treat as drop → reconnect path |
| Tab background | Browser throttles timers; on resume, expect large snapshot correction — OK |
| Malformed JSON | Count error; after threshold reconnect |

---

## 14. Security / trust (client posture)

- Never apply client-side “official” score.
- Never send positions as authority (inputs only).
- Treat all server payloads as untrusted in shape (validate) but authoritative in gameplay values.
- Tokens in `sessionStorage` only; do not log tokens in production.

---

## 15. Testing strategy

| Layer | Cases |
|---|---|
| Unit codec | All message types round-trip fixtures |
| Unit reconcile | Buffer of inputs + snapshot ack → correct replay; carry always from server |
| Unit interp | Two snapshots → mid-point position |
| Unit FSM | connect/welcome/drop/reconnect/fail transitions |
| Integration | Mock WS server: join → inputs → snapshots; reconnect restores view from snapshot |
| Manual | Two browsers (Impl Plan Session A); kill network; refresh within grace |

Contract tests from [netcode-messages.md](../../interfaces/netcode-messages.md) § Test contract are **shared** with server — client harness is the consumer side.

---

## 16. Suggested module layout (future code)

```text
client/src/net/
  types.ts
  connection-fsm.ts
  token-store.ts
  codec-json.ts
  session-client.ts      // public façade
  send-loop.ts
  snapshot-apply.ts
  prediction.ts
  reconciliation.ts
  interpolation.ts
  rtt.ts
  world-view.ts
```

Shared kinematics (stretch/P2+): `packages/sim-kinematics` or duplicate carefully until extracted.

---

## 17. Metrics (for C-14 / debug HUD)

Expose getters (optional overlay):

- RTT ms  
- Snapshot age ms  
- Pending input depth  
- Reconcile snap count / blend count  
- Reconnect attempts  
- Connection state  

---

## 18. Risks

| Risk | Mitigation |
|---|---|
| Rubber-banding | Thresholded soft correct; predict only movement |
| Predictor ≠ server physics | Shared helpers; keep MVP simple; authority snap |
| Reconnect inventory loss | Server grace + full snapshot; client never invents carry |
| Send loop vs render loop desync | Fixed send interval from tickRate; predict in render with held input |
| Scope creep multi-seat | Single seat MVP |

---

## 19. Acceptance criteria (component)

1. Join → Welcome → continuous snapshots update world view.
2. Inputs sent with monotonic seq; server ack advances reconciliation.
3. Local run/jump prediction active; remote haulers interpolate.
4. Reconnect with stored token restores seat view from snapshot within grace.
5. Connection states drive Shell UX.
6. No client-authored scores or inventories.
7. Works online-first with one human seat per browser; local multi-pad not required.
