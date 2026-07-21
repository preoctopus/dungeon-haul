---
title: Implementation Roadmap
type: synthesis
updated: 2026-07-21
sources: [docs/IMPLEMENTATION-PLAN.md, docs/ARCHITECTURE.md]
tags: [roadmap, project-management, phases]
---

# Implementation Roadmap

The development of **Dungeon Haul** follows a vertical slice approach, prioritizing online multiplayer stability (netcode) before content breadth.

## Current Status: P3 Complete
The project has successfully moved through the foundational and core gameplay systems. The current focus is shifting toward the full game flow shell.

### Completed Phases
- **P0 Foundations:** Monorepo established, CI configured, protocol stubs frozen.
- **P1 Rules & Content Kernel:** Pure rules engine implemented; share modifiers and treasure math unit-tested. Level parser functional.
- **P2 MVP Netcode Slice:** Authoritative rooms (Colyseus) active. 30Hz sim with client prediction/reconciliation proven for 2–4 players.
- **P3 Core Gameplay Systems:** Cargo stacks, encumbrance, spill mechanics, and basic AI haulers are functional.

## Upcoming Milestones

### Phase 4: Full Game Flow Shell (Next)
Goal: Transform a "technical demo" into a playable loop.
- Implement the sequence: Title $\to$ Lobby $\to$ Instructions $\to$ Hoard $\to$ Fork $\to$ Level $\to$ End Scoring.
- Wire the `ScoreReport` from the rules engine to the End Screen Director cinematics.
- Integrate "Argue" voting for Forks.

### Phase 5: Persistence & Hardening
Goal: Move from local/dev testing to a production-ready state.
- Deploy authoritative servers on **Fly.io**.
- Implement PostgreSQL persistence for global high scores with anti-cheat completion tokens.
- Polish reconnection UX and seat grace periods.

### Phase 6: Content Expansion
Goal: Fleshing out the world based on the design doc.
- Expand level pool toward a full path graph.
- Implement variety in traps (crumbling, gas, lightning) and environment biomes.
- Audio pass and final balance tuning for AI/Weight.

## MVP Definition (Shippable Slice)
A session is considered "MVP complete" when:
1. Players can join via room code $\to$ instructions $\to$ hoard $\to$ at least one level $\to$ end scoring.
2. AI automatically fills empty seats from the Hoard onward.
3. High scores are recorded and persistent for human players.

## See also
- [[architecture/SYSTEM]] - Technical constraints driving these phases.
- [[gameplay/RULES]] - The "Pure Rules" used in P1’s kernel.
- [[network/PROTOCOL]] - The wires defined during the P0/P2 transition.
