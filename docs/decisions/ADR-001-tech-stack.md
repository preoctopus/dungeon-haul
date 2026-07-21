# ADR-001: Technology Stack

| Field | Value |
|---|---|
| Status | **Accepted** (architecture phase) |
| Date | 2026-07-20 |
| Deciders | Software Game Architect (Dungeon Haul) |
| Supersedes | Informal Build Plan stack (Phaser 3 + FastAPI + Cloud Run) as *binding* choice |

---

## Context

Dungeon Haul must modernize a Flixel/Flash TOJam design into a maintainable product with **online multiplayer as a first-class requirement**. The prior *AI Agent Game Build Plan* proposed:

- Phaser 3 client  
- FastAPI + uv + Docker + Cloud Run backend  

That plan assumed primarily **local** multiplayer orchestration. Online authoritative play changes constraints: sticky WebSocket rooms, shared simulation, reconnection, and fair loot ownership.

We need a stack that:

1. Supports authoritative realtime simulation for 4 haulers  
2. Keeps **share-modifier / treasure rules pure and testable**  
3. Allows parallel component work  
4. Deploys to the web without Flash  
5. Avoids unnecessary dual-language duplication for game rules  

---

## Decision

Adopt a **TypeScript monorepo** with:

| Layer | Choice |
|---|---|
| Client | **Phaser 3 + TypeScript + Vite** |
| Shared rules | **`packages/rules` pure TS** |
| Shared protocol | **`packages/protocol` TS types + codecs** |
| Game server | **Node.js + TypeScript** |
| Room framework | **Colyseus** (room lifecycle, reconnection hooks) |
| HTTP API | **Hono** or **Fastify** (lobby + high scores) |
| DB | **PostgreSQL** (SQLite acceptable locally) |
| Optional cache | **Redis** (multi-instance presence) |
| Containers | **Docker** multi-stage |
| Production host | **Fly.io** (primary) for game processes; CDN/static for client |
| CI | **GitHub Actions** |
| Tests | **Vitest** (+ headless sim harness) |

Phaser remains the **presentation** engine. Gameplay authority lives on the server.

---

## Alternatives considered

### A. Build Plan as-is (Phaser + FastAPI game loop)

- **Pros:** Matches prior doc; Python excellent for pure rules tests; uv lockfiles solid.  
- **Cons:** Realtime room orchestration and client prediction **parity** suffer across languages; team must implement room model from scratch; Cloud Run WS/cold-start friction for rooms.  
- **Rejected** as primary game server. Python remains optional for offline tools later.

### B. Godot 4 client + dedicated server

- **Pros:** Built-in multiplayer; strong 2D.  
- **Cons:** Browser drop-in UX and deploy story weaker for casual web links; less alignment with existing Build Plan assets/knowledge.  
- **Rejected** for web-first online.

### C. Unity

- **Pros:** Netcode ecosystem.  
- **Cons:** Overkill, heavy tooling for pixel sidescroller web MVP.  
- **Rejected.**

### D. Peer-to-peer WebRTC host migration

- **Pros:** Lower server cost.  
- **Cons:** Host leave, cheating, mid-join, AI fill authority all harder; treasure steal must be fair.  
- **Rejected** (see ADR-002).

### E. PixiJS + fully custom engine

- **Pros:** Control.  
- **Cons:** Rebuild scenes/physics/input; schedule risk.  
- **Rejected** for MVP.

### F. Nakama / PlayFab as full backend

- **Pros:** Matchmaking, leaderboards.  
- **Cons:** Still need custom platformer sim; ops complexity early.  
- **Deferred** as stretch enhancement.

---

## Consequences

### Positive

- One language for rules, protocol, server, client shared types  
- Colyseus accelerates seats/reconnect vs greenfield WS  
- Phaser scenes map cleanly to design doc states  
- Pure `packages/rules` meets “extractable testable logic” quality bar  
- Fly.io fits long-lived rooms better than scale-to-zero serverless  

### Negative / tradeoffs

- Colyseus is a dependency to learn and pin  
- Node physics must be custom or use a headless lib (not Phaser Arcade on server)  
- Build Plan Python snippets are non-portable — intentional  
- Need discipline: **no Phaser imports in server/rules**  

### Mitigation

- Server sim uses simple AABB + fixed tick (appropriate for design scope)  
- Snapshot JSON first; optimize later  
- Document Cloud Run only for static/API if cost-driven  

---

## Compliance with design

| Design need | Stack support |
|---|---|
| 4 haulers + AI fill | Server seats + AI controller |
| Sidescroller presentation | Phaser |
| Share modifiers pure | `packages/rules` |
| Pixel levels | Loader in Node + content pack |
| Modernize from Flixel | Scenes replace FlxState; no Flash |
| Online multiplayer | Authoritative Colyseus rooms |

---

## Follow-ups

- ADR-002 multiplayer/netcode approach  
- Confirm host provider with ops (open question)  
- Pin versions at implementation start (Phaser 3.x, Node 22 LTS, Colyseus 0.15+)  
