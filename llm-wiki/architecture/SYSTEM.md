---
title: System Architecture
type: concept
updated: 2026-07-21
sources: [docs/ARCHITECTURE.md, docs/decisions/ADR-001-tech-stack.md, docs/decisions/ADR-002-multiplayer-netcode.md]
tags: [architecture, network, tech-stack]
---

# System Architecture

The authoritative system for **Dungeon Haul** is designed as a client-server model where the server owns all gameplay truth (physics, treasure ownership, scoring) and clients serve as dumb presenters with local movement prediction.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Client Engine | Phaser 3 + TypeScript | WebGL rendering, Arcade Physics for presentation, Vite bundling |
| Simulation Server | Node.js + Colyseus | Authoritative rooms, fixed-tick sim (30Hz), binary-friendly WS transport |
| Shared Rules | Pure TypeScript (`packages/rules`) | Engine-agnostic logic to prevent client/server drift in rules & scoring |
| Protocol | TS Schemas (`packages/protocol`) | Versioned messages shared across the wire |
| Persistence | PostgreSQL | Persistent high scores and session audits |
| Hosting | Fly.io | Sticky WebSocket rooms via long-lived processes |

## Networking Model

### Authority and Sync
- **Authoritative Server:** The server handles all collisions, treasure grants, trap triggers, and fork voting results.
- **Tick Rate:** 30 Hz fixed simulation step.
- **Client Prediction:** Clients predict local hauler movement to eliminate perceived lag (target $\le$ 50ms).
- **Reconciliation:** Client rewinds/replays inputs on mismatch with server `WorldSnapshot`.
- **Interpolation:** Remote players are interpolated between snapshots; no prediction is used for others.

### Connectivity and Session Lifecycle
- **Lobby:** Players join via room codes. Seats (4 total) are claimed in the lobby.
- **AI Fill:** To maintain a consistent 4-player experience, inactive or disconnected seats are automatically piloted by AI controllers.
- **Drop-in/Out:** Mid-session joining is allowed; disconnects enter a grace period before being fully replaced by AI.
- **Reconnection:** Uses `reconnectToken` bound to session and seat IDs to restore state within the grace window.

## Game Flow & State Machine

The game progresses through these primary phases:
1. **Idle Attract:** Title $\to$ Credits $\to$ High Scores loop.
2. **Lobby:** Session creation, character claim, ready-up.
3. **Instructions:** Tutorial phase (humans only; AI absent).
4. **Level Loop:** Level 0 Hoard $\to$ Fork (Argue/Vote) $\to$ Levels ($N=7$) $\to$ End Scoring.
5. **End Sequence:** Count Haul $\to$ Share Calculation $\to$ Spoils Distribution $\to$ High Score Entry.

## Core System Boundaries
- **Simulation vs Presentation:** The server handles "what happened" (e.g., who stole the treasure); the client handles "how it looks" (e.g., the animation of stealing).
- **Pure Rules Engine:** All formulas for share modifiers, weight penalties, and treasure values are isolated in `packages/rules` to allow headless testing without a server or engine.

## See also
- [[network/PROTOCOL]] - Detailed wire messages.
- [[gameplay/RULES]] - Share modifiers and loot logic.
- [[roadmap/PLAN]] - Implementation phases.
