# ADR-002: Multiplayer & Netcode Approach

| Field | Value |
|---|---|
| Status | **Accepted** (architecture phase) |
| Date | 2026-07-20 |
| Deciders | Software Game Architect (Dungeon Haul) |
| Depends on | [ADR-001](ADR-001-tech-stack.md) |

---

## Context

The original design is a **local drop-in/drop-out** four-player game with AI fill. Product direction expands this to **online multiplayer**.

Gameplay involves:

- Contentious treasure ownership (spill/steal)  
- Trip/push player interactions  
- Fork voting by button-mash  
- Share modifiers from session-wide stats  
- Always **exactly four** active haulers in Game State  

Fairness and fun require a clear authority model, reconnection story, and latency strategy.

---

## Decision

### Topology

**Authoritative dedicated server** (client–server). **Not** peer-to-peer. **Not** listen-server host-among-players.

One **HaulSession room** runs one playthrough. The server:

1. Accepts `InputCommand` only from clients  
2. Steps a **fixed 30 Hz** simulation  
3. Broadcasts `WorldSnapshot` + `GameEvent`s  
4. Computes end scores via pure Rules package  
5. Fills inactive seats with **AI** producing the same input interface  

### Client role

- Render snapshots  
- **Predict** local hauler movement  
- **Reconcile** using `lastProcessedInputSeq`  
- **Interpolate** remote haulers  
- Never authoritatively mutate inventory, scores, or trap state  

### Session access

- **Private join codes** (MVP)  
- Optional public matchmaking (stretch)  
- Seat tokens + **reconnect tokens** with grace period (e.g. 30s)  

### Drop-in / drop-out

Online adaptation of design idle rules:

- 20s no input → AI takeover  
- 5s no input + edge pressure → AI takeover  
- Any input from seat owner → human takeover  
- Disconnect → AI pilots during grace; reconnect restores seat  

### Mid-join

Allowed while phase ∈ Lobby, Instructions, Level, Fork. Spawn policy: safe point near average human position or level spawn. End phase: no new fighters (MVP).

### Host leave

**No host.** Server process owns room. Process death ends room (MVP). Stretch: snapshot migration.

### Tick & payloads

| Item | MVP |
|---|---|
| Tick | 30 Hz fixed |
| State sync | Full snapshot (small: 4 players) |
| Transport | WebSocket JSON |
| Physics authority | Server AABB + fixed dt |
| Prediction | Local player only |

### Room framework

**Colyseus** for room lifecycle and reconnection patterns; simulation code remains our module invoked from the room.

---

## Alternatives considered

### Peer-to-peer / host migration

- Fails host-leave and cheat resistance for steal/trip.  
- **Rejected.**

### Lockstep deterministic peers

- Requires full determinism across browsers; heavy for platformer physics.  
- **Rejected** for MVP.

### Client-authoritative with server validation

- Easier feel; easy to cheat loot.  
- **Rejected.**

### 60 Hz + rollback (GGPO-style)

- Best feel; high engineering cost.  
- **Stretch** if playtests demand.

### UDP/WebRTC data channels

- Lower latency potential; NAT and complexity.  
- **Stretch** after WS MVP.

### Fully serverless per-message functions

- Cannot host continuous tick affordably.  
- **Rejected** for sim; OK for high-score REST.

---

## MVP vs stretch

| Feature | MVP | Stretch |
|---|---|---|
| 1–4 remote humans + AI fill | ✅ | |
| Join codes | ✅ | Quick play matchmaking |
| Reconnect grace | ✅ | Cross-node migration |
| Local prediction | ✅ basic | Full rollback |
| Spectators | ❌ | ✅ |
| Same-machine multi-seat online | ❌ | ✅ |
| Delta compression / binary | ❌ | ✅ |
| Global pause vote | ❌ | ✅ |
| Cheat hardening beyond authority | basic | advanced |

---

## Consequences

### Positive

- Fair loot and scoring  
- AI fill works without special client hacks  
- Clear component boundaries (net client vs sim)  
- Testable with headless input tapes  

### Negative

- Platforming will feel slightly worse than pure local  
- Requires hosting cost for game processes  
- Must implement prediction carefully to avoid rubber-banding  

### Mitigations

- 30 Hz + prediction on jump/run  
- Generous stun windows slightly mask jitter  
- Playtest Session A gates feel before content expansion  
- Deploy on sticky process host (Fly.io)  

---

## Interface impact

Frozen in:

- [interfaces/netcode-messages.md](../interfaces/netcode-messages.md)  
- [interfaces/input-commands.md](../interfaces/input-commands.md)  
- [interfaces/lobby-and-scores.md](../interfaces/lobby-and-scores.md)  

---

## Validation plan

1. Two-browser movement demo (Implementation Plan P2 gate)  
2. Disconnect/reconnect inventory preserve  
3. Treasure ownership race unit/integration tests  
4. Human playtest “net feel” scores  

---

## Notes on design-doc local multiplayer

Local NES-style multi-gamepad remains desirable later: implement as **multiple seats from one client connection** (stretch) or offline loopback server. Architecture does not require a second simulation codebase.
