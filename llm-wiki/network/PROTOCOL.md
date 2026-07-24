---
title: Network Protocol & Wire Format
type: reference
updated: 2026-07-21
sources: [docs/interfaces/netcode-messages.md, docs/interfaces/input-commands.md, docs/decisions/ADR-002-multiplayer-netcode.md]
tags: [network, protocol, api, multiplayer]
---

# Network Protocol & Wire Format

Dungeon Haul uses a WebSocket-based authoritative client-server model. The server (via Colyseus) maintains the world state and broadcasts snapshots to clients at 30 Hz.

## Communication Flow

### Handshake
1. **`C2S_Join`**: Client sends session/seat tokens and protocol version.
2. **`S2C_Welcome`**: Server assigns `seatId`, provides a `reconnectToken`, updates the RNG seed, and sends the first `WorldSnapshot`.

### Client $\to$ Server (Inputs)
- **`C2S_Input`**: Sends an `InputCommand` packet every tick. Contains axes ($x, y$) and buttons (jump, action, start). 
  - *Anti-cheat:* The server ignores any claim about position or inventory; only inputs are accepted.
- **Lobby Commands**: `C2S_Ready`, `C2S_ClaimCharacter`.
- **Post-Game:** `C2S_NameEntry` for the high score board.

### Server $\to$ Client (State)
- **`S2C_Snapshot`**: A full world state every tick, including:
  - **Haulers:** Position, velocity, animation state, and carried treasure instances.
  - **World Objects:** State of dynamic traps, switches, and dropped treasures.
  - **Metadata:** Current session phase (`lobby`, `instructions`, `level`, `fork`, `end`) and level progression (e.g., "Level 3/7").
- **`S2C_Event`**: One-shot triggers for visuals/SFX (e.g., `pickup`, `spill`, `stun`, `trip`).
- **`S2C_ScoreReport`**: Authoritative final payout including modifiers and GP takes.

## Key Data Structs

### The World Snapshot
The snapshot is the primary source of truth for the client's reconciliation loop:
- `lastProcessedInputSeq`: Map of the last processed input sequence per seat, used by clients to rewind/replay local predictions.
- `haulers`: List of all 4 haulers (human or AI).

### Score Report & Cinema Data
At the end of a run, the server sends a detailed report that drives the cinematic scoring sequence:
- **`EndCinemaData`**: Contains the "toss order" and "exit order," allowing the client to play back the counting animation exactly as calculated by the server.

## Reliability and Timing
- **Latency Handling:** Clients use prediction for their own character and interpolation for others.
- **Reconnection:** If a client disconnects, they can resume using their `reconnectToken` within a grace period; otherwise, an AI controller takes over the seat.
- **Deterministic Simulation:** The server uses fixed-timestep physics to ensure that all clients eventually converge on the same world state.

## See also
- [[architecture/SYSTEM]] - High-level networking topology.
- [[gameplay/RULES]] - How totalGP is calculated before being reported in `S2C_ScoreReport`.
