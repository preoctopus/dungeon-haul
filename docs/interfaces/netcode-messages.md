# Contract: Netcode Messages

**Producers:** Game room (server)  
**Consumers:** Netcode Client; test harnesses  
**Transport:** WebSocket (JSON MVP; binary/msgpack stretch)  
**Related:** [input-commands.md](input-commands.md), [ADR-002](../decisions/ADR-002-multiplayer-netcode.md)

---

## Handshake

### `C2S_Join`

```text
{
  type: "join"
  protocolVersion: 1
  sessionId: string
  seatToken: string
  reconnectToken?: string
  clientInfo?: { name?: string, build?: string }
}
```

### `S2C_Welcome`

```text
{
  type: "welcome"
  protocolVersion: 1
  sessionId: string
  seatId: 0|1|2|3
  reconnectToken: string
  rngSeed: number
  rulesetVersion: string
  tickRate: 30
  phase: SessionPhase
  snapshot: WorldSnapshot
}
```

### `S2C_Error`

```text
{
  type: "error"
  code: "PROTOCOL" | "AUTH" | "FULL" | "PHASE" | "INTERNAL"
  message: string
}
```

---

## Client → Server

| Type | Payload | Notes |
|---|---|---|
| `C2S_Input` | `{ type, seatId, command: InputCommand }` | Rate-limited; seat must match token |
| `C2S_Ready` | `{ type, ready: bool }` | Lobby / Instructions |
| `C2S_ClaimCharacter` | `{ type, character: CharacterId }` | Lobby; always succeeds for valid id (Q9 soft-unique — duplicates allowed; client may warn) |
| `C2S_Leave` | `{ type }` | Graceful |
| `C2S_Ping` | `{ type, clientTime: number }` | RTT measurement |
| `C2S_EndSkip` | `{ type }` | Skip cinematic segment if allowed |
| `C2S_NameEntry` | `{ type, name: string }` | End high score; validated |

---

## Server → Client

| Type | Payload | Notes |
|---|---|---|
| `S2C_Snapshot` | `WorldSnapshot` | Full state MVP each tick or every N ticks |
| `S2C_Event` | `GameEvent` | One-shot SFX/VFX/UI triggers |
| `S2C_PhaseChange` | `{ phase, detail }` | Instructions/Level/Fork/End… |
| `S2C_ScoreReport` | `ScoreReport` | End of run; authoritative |
| `S2C_Pong` | `{ clientTime, serverTime }` | |
| `S2C_SeatUpdate` | `{ seats: SeatPublic[] }` | Join/leave/AI takeover notices |
| `S2C_ForkState` | `{ options, tallies, endsAtTick }` | During fork |
| `S2C_Chat` | optional / out of scope MVP | |

---

## Core payloads

### `SessionPhase`

```text
"lobby" | "instructions" | "level" | "fork" | "end_count"
| "end_shares" | "end_spoils" | "end_entry" | "closed"
```

### `WorldSnapshot`

```text
{
  tick: number
  phase: SessionPhase
  levelId?: string
  levelsCompleted: number
  levelsAfterHoard: number     // run length config (Q8); lets UI render "Level k / n" (delta #4)
  lastProcessedInputSeq: { [seatId: number]: number }
  haulers: HaulerPublic[]
  treasures: TreasurePublic[]
  traps: TrapPublic[]          // dynamic only; static grid may be level-hash
  switches: SwitchPublic[]
  cameraHint?: { x, y, z? }    // optional server suggestion
}
```

### `HaulerPublic`

```text
{
  seatId: number
  character: CharacterId
  control: "human" | "ai"
  x: number
  y: number
  vx: number
  vy: number
  facing: 1 | -1
  anim: AnimState
  carry: { instanceId: string, defId: string }[]
  stunned: bool
  name?: string
}
```

### `GameEvent` (examples)

```text
{ type: "pickup", seatId, instanceId, defId }
{ type: "drop", seatId, instanceId, x, y }
{ type: "throw", seatId, instanceId, vx, vy }
{ type: "spill", seatId, items: [...] }
{ type: "stun", seatId, source }
{ type: "trip", attackerSeatId, targetSeatId }
{ type: "trap_trigger", trapId, kind }
{ type: "level_exit", seatId, order }
{ type: "switch", switchId, pressed: bool }
{ type: "ai_takeover", seatId }
{ type: "human_takeover", seatId }
```

### `ScoreReport`

```text
{
  rulesetVersion: string
  sessionId: string
  totalTreasureGp: number
  players: {
    seatId: number
    character: CharacterId
    human: bool
    modifiers: { id, title, kind, uniqueness, deltaShares }[]
    shares: number              // after min-1 clamp
    sharePercent: number        // 0–100 display
    takeGp: number
    inventoryValueGp: number
    eligibleForHighScore: bool
  }[]
  completionToken: string       // for score submit
  cinema?: EndCinemaData        // presentation-only end cinematic data (accepted delta #2)
  recordFanfareThresholdGp?: number  // top totalHaulGp on board; omit → client skips fanfare (delta #3)
}
```

### `EndCinemaData` (presentation-only; server-authored)

All GP values must match the rules evaluation used for `totalTreasureGp` / takes.
Clients must not re-derive official values from `defId`.

```text
{
  tossOrderSeatIds: number[]     // slowest → fastest (len 4)
  exitOrderSeatIds: number[]     // first exit → last on final level
  players: {
    seatId: number
    items: {
      instanceId: string
      defId: string
      displayName: string
      valueGp: number
      setId?: string
    }[]
  }[]
  setCompletions: {
    setId: string
    displayName: string
    bonusGp: number
    contributorSeatIds: number[]
    completingInstanceId: string   // which toss triggers the popout
  }[]
}
```

---

## Timing & reliability

- Server is source of truth; clients must tolerate lost events by relying on snapshot.
- Events are **not** guaranteed if a client was disconnected; full snapshot on reconnect.
- `lastProcessedInputSeq` drives reconciliation.
- Suggested max message size soft limit: 32 KB JSON snapshot (4 players is tiny).

---

## Anti-cheat surface

| Client claim | Server action |
|---|---|
| Position | Ignored (inputs only) |
| Inventory | Ignored |
| Score | Ignored; `ScoreReport` only |
| Ready | Accepted in lobby/instructions |
| Name | Length/charset filter |

---

## Test contract

Integration tests must cover:

1. Join → Welcome → Snapshot stream  
2. Input seq monotonic handling  
3. Reconnect with token restores seatId + inventory  
4. Protocol mismatch → `S2C_Error PROTOCOL`  
5. Fourth human rejected or queued when seats full (`FULL`)  
