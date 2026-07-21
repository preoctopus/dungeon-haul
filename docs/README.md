# Dungeon Haul — Documentation

Architecture and design documentation for the Dungeon Haul remake.  
**This phase is documentation only** — no application code or binary assets live here yet.

Canonical design source: [source/TOJam 8_ Dungeon Haul Design Document.pdf](source/TOJam%208_%20Dungeon%20Haul%20Design%20Document.pdf)  
Prior (non-binding) AI build orchestration: [source/AI Agent Game Build Plan.pdf](source/AI%20Agent%20Game%20Build%20Plan.pdf)

---

## Reading order

For a new engineer or agent joining the project:

| Step | Doc | Why |
|---|---|---|
| 1 | **This README** | Map of the tree |
| 2 | [source/TOJam 8_ Dungeon Haul Design Document.pdf](source/TOJam%208_%20Dungeon%20Haul%20Design%20Document.pdf) | Canonical game design |
| 3 | [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, systems, netcode, models, NFRs |
| 4 | [decisions/ADR-001-tech-stack.md](decisions/ADR-001-tech-stack.md) | Why TS/Phaser/Colyseus/Fly |
| 5 | [decisions/ADR-002-multiplayer-netcode.md](decisions/ADR-002-multiplayer-netcode.md) | Authoritative online model |
| 6 | [COMPONENTS.md](COMPONENTS.md) | Boundaries & SE ownership clusters |
| 7 | [interfaces/OVERVIEW.md](interfaces/OVERVIEW.md) | Contract index |
| 8 | Interface details as needed | Net, input, rules, levels, lobby |
| 9 | [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md) | Phased MVP → stretch |
| 10 | [decisions/ARCHITECT-OPEN-QUESTIONS.md](decisions/ARCHITECT-OPEN-QUESTIONS.md) | Product freezes (resolved) |
| 11 | [testing/AUTOMATED-TEST-STRATEGY.md](testing/AUTOMATED-TEST-STRATEGY.md) | Vitest/Playwright, CI, determinism |
| 12 | [testing/INTEGRATION-TEST-PLAN.md](testing/INTEGRATION-TEST-PLAN.md) | Cross-component scenarios |
| 13 | [testing/SYSTEM-TEST-PLAN.md](testing/SYSTEM-TEST-PLAN.md) | E2E, browser matrix, perf |
| 14 | [testing/HUMAN-PLAYTEST-PLAN.md](testing/HUMAN-PLAYTEST-PLAN.md) | Session scripts & feedback |
| 15 | [art/AESTHETIC-BRIEF.md](art/AESTHETIC-BRIEF.md) | Visual language |
| 16 | [art/ASSET-INVENTORY.md](art/ASSET-INVENTORY.md) | Assets to generate |
| 17 | Component `DESIGN.md` / `TASKS.md` / `TEST-PLAN.md` | Implementation work packages |

Optional background: skim the Build Plan PDF for historical Phaser+FastAPI prompts — **do not treat it as binding**.

---

## Tree

```text
docs/
├── README.md                 ← you are here
├── ARCHITECTURE.md           ← system architecture
├── COMPONENTS.md             ← component catalog + SE clusters
├── IMPLEMENTATION-PLAN.md    ← phased delivery
├── decisions/
│   ├── ADR-001-tech-stack.md
│   ├── ADR-002-multiplayer-netcode.md
│   └── ARCHITECT-OPEN-QUESTIONS.md
├── interfaces/
│   ├── OVERVIEW.md
│   ├── netcode-messages.md
│   ├── input-commands.md
│   ├── share-modifier-api.md
│   ├── level-format.md
│   └── lobby-and-scores.md
├── source/                   ← original PDFs (read-only inputs)
│   ├── TOJam 8_ Dungeon Haul Design Document.pdf
│   └── AI Agent Game Build Plan.pdf
├── components/               ← per-component DESIGN + TASKS + TEST-PLAN
│   └── <name>/DESIGN.md, TASKS.md, TEST-PLAN.md
├── testing/                  ← automated, integration, system, human plans
│   ├── AUTOMATED-TEST-STRATEGY.md
│   ├── INTEGRATION-TEST-PLAN.md
│   ├── SYSTEM-TEST-PLAN.md
│   ├── HUMAN-PLAYTEST-PLAN.md
│   └── COMPONENT-TEST-PLAN-APPROACH.md
└── art/                      ← aesthetic brief + asset inventory
```

---

## Placeholders & partial fills

### `components/`

High-level catalog remains [COMPONENTS.md](COMPONENTS.md).  
Per-component folders hold **DESIGN.md**, **TASKS.md**, and **TEST-PLAN.md**. Process: [testing/COMPONENT-TEST-PLAN-APPROACH.md](testing/COMPONENT-TEST-PLAN-APPROACH.md).

### `testing/`

Filled for planning phase:

| Doc | Purpose |
|---|---|
| [AUTOMATED-TEST-STRATEGY.md](testing/AUTOMATED-TEST-STRATEGY.md) | Vitest monorepo, Playwright, CI gates, rules/sim/protocol, flaky policy, coverage, seeded RNG |
| [INTEGRATION-TEST-PLAN.md](testing/INTEGRATION-TEST-PLAN.md) | Full run, fork lag, steal, AI, reconnect, payouts, room codes |
| [SYSTEM-TEST-PLAN.md](testing/SYSTEM-TEST-PLAN.md) | E2E happy/failure, 2–4 clients, mid-join, host N/A, tick budget, desktop matrix |
| [HUMAN-PLAYTEST-PLAN.md](testing/HUMAN-PLAYTEST-PLAN.md) | Session scripts, fun/fair/understandable criteria, feedback template |

Session reports (when run): `docs/testing/reports/` (create on first session).

### `art/` (filled)

| Doc | Purpose |
|---|---|
| [AESTHETIC-BRIEF.md](art/AESTHETIC-BRIEF.md) | Visual pillars, palettes, style constraints |
| [ASSET-INVENTORY.md](art/ASSET-INVENTORY.md) | Full prioritized asset list (~348 entries) |
| [ASSET-MATRIX.md](art/ASSET-MATRIX.md) | Screens × biomes × entities coverage |

No binary art yet — specification only.

---

## Product constraints (quick)

- **Online multiplayer in scope** (authoritative server)  
- 4 haulers; AI fills inactive seats  
- Share modifiers pure & testable  
- Modern stack (no Flash/Flixel runtime)  
- **Frozen MVP product:** private codes; desktop browsers; 960×540; no accounts; no global pause; `levelsAfterHoard` default 2; soft-unique chars  


## Stack (quick)

See ADRs for rationale:

- **Client:** Phaser 3 + TypeScript  
- **Server:** Node/TS + Colyseus rooms  
- **Rules:** pure TS package  
- **DB:** PostgreSQL high scores  
- **Host:** Fly.io-class sticky processes (primary)  

---

## Contributing to docs

- Prefer ADRs for reversible architectural decisions  
- Keep interfaces explicit enough for parallel SE work  
- Do not add application source code under `docs/`  
- When answering open questions, update `ARCHITECT-OPEN-QUESTIONS.md` and note assumption changes in `ARCHITECTURE.md`  
