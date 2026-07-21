# Contract: Player Input Commands

**Producers:** Input Mapper (human), AI Controller  
**Consumers:** Netcode Client (transport), Authoritative Simulation  
**Related:** Design doc §2.1 Controls; [netcode-messages.md](netcode-messages.md)

---

## Goals

- Single normalized command shape for humans and AI.
- Transport-cheap, tick-aligned.
- **Server interprets chords** (drop/throw) from axes + buttons to avoid client ambiguity.

---

## `InputCommand`

```text
InputCommand {
  seq: number           // per-seat monotonic; client-assigned
  clientTick?: number   // optional
  axes: {
    x: -1 | 0 | 1       // run / steer / menu left-right
    y: -1 | 0 | 1       // duck/pickup (down), throw aim up, fork select, name entry
  }
  jump: boolean         // A held or pressed — server uses edge detect
  action: boolean       // B
  start: boolean        // Start / pause / skip
  select?: boolean      // optional Select
}
```

### Encoding notes

- Booleans are **level** (down), not only edges; server tracks previous tick for `justPressed`.
- `seq` must increase by ≥1; duplicates ignored; gaps tolerated (lossy net).
- AI sets `seq` from server-side counter (not over wire as client).

---

## Context interpretation (server)

### Lobby / Title / Menus

| Input | Meaning |
|---|---|
| any face / start | Activate UI focus / start flow |
| axes | Navigate lists |

### Level / Instructions / Hoard

| Input | Meaning |
|---|---|
| axes.x | Run / air steer |
| axes.y down | Duck; if near treasure → pickup attempt |
| jump pressed | Jump |
| action pressed (empty hands) | Trip / push |
| action + axes.y down | Drop first (top) treasure |
| action + axes.y up | Throw first treasure |
| start | Local pause UI only (MVP); no server freeze |

### Fork

| Input | Meaning |
|---|---|
| axes.x or axes.y | Select path (design: up/down — implement consistently; **recommend axes.y** per design, allow axes.x as alias) |
| jump or action pressed | “Argue” pulse (+1 to selected path tally) |

### End name entry

| Input | Meaning |
|---|---|
| axes.y | Change letter |
| axes.x | Change character slot |
| jump | Confirm letter / submit when full |
| action | Delete character |
| start | Skip animation / confirm entry |

---

## Simulation API (server-internal)

```text
applyInput(seatId: number, cmd: InputCommand, tick: number): void
```

- Ignores input if seat stunned (except maybe none).
- Ignores movement if phase disallows free-run (Fork/End).
- Human takeover: any valid human cmd on AI seat with matching token flips `control` to human (online drop-in).

---

## Idle / AI takeover thresholds (online adaptation of design)

| Condition | Effect |
|---|---|
| No human packets **20s** | `control → AI` |
| No human packets **5s** AND hauler at camera pressure edge | `control → AI` |
| Human packet while AI | `control → Human` |

Exact edge definition: server camera bounds or exit-direction stuck flag.

---

## Validation

- Reject `axes` outside {-1,0,1}.
- Drop commands for wrong seatToken.
- Rate limit > tickRate * 2.
- Do not trust client chord pretinterpretation messages (none exist).

---

## Test cases

1. Jump edge triggers once per press cycle.  
2. Drop only if carry non-empty.  
3. Throw imparts velocity matching facing.  
4. Stunned seat: movement commands no-op.  
5. AI and human command shapes identical in sim unit tests.  
