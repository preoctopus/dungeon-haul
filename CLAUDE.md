# CLAUDE.md — Dungeon Haul

Instructions for AI agents (Claude Code, Grok, Pi, Antigravity, and similar) working in this repository.

## What this project is

**Dungeon Haul** is a remake of a TOJam 8 local multiplayer sidescroller: four haulers loot a dungeon, navigate traps, sabotage each other, and split the haul via **Share Modifiers**. This remake makes **online multiplayer first-class** (authoritative server, drop-in/reconnect, AI fill for empty seats).

Canonical game design:

- [`docs/source/TOJam 8_ Dungeon Haul Design Document.pdf`](docs/source/TOJam%208_%20Dungeon%20Haul%20Design%20Document.pdf)

Prior non-binding AI build plan (Phaser + FastAPI):

- [`docs/source/AI Agent Game Build Plan.pdf`](docs/source/AI%20Agent%20Game%20Build%20Plan.pdf)

**Do not treat the Build Plan PDF as architecture truth.** Binding architecture and contracts live under `docs/`. If the design PDF disagrees with `docs/`, prefer **`docs/`** (or ask the owner).

---

## Current phase — read this first

**P0–P3 are done. Next work is P4 (full game flow shell).**

| Phase | Status | Evidence / notes |
|---|---|---|
| **P0** Foundations | Done | pnpm monorepo, Vitest, health |
| **P1** Rules & levels | Done | `packages/rules`, `packages/levels` |
| **P2** Netcode slice | Done | [`docs/testing/reports/P2-DEMO.md`](docs/testing/reports/P2-DEMO.md) |
| **P3** Core gameplay + AI | Done | [`docs/testing/reports/P3-GAMEPLAY.md`](docs/testing/reports/P3-GAMEPLAY.md) |
| **P4** Flow shell | **Next** | Title → Lobby → Instructions → Hoard → Fork → End; `ScoreReport` |
| **P5** Persistence / deploy | Pending | PostgreSQL high scores, Fly.io |
| **P6** Content expansion | Art ahead of code | Atlases exist; more levels/traps later |
| **P7** Stretch | Pending | Couch hybrid, matchmaking, etc. |

Living status tables: [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md), [`docs/COMPONENTS.md`](docs/COMPONENTS.md) (code status).

### P4 scope (do this next unless asked otherwise)

From implementation plan + C-06 tasks:

- Client scenes: Title, Credits, HighScores (read-only mock OK), Lobby, Instructions, Level, Fork, End
- Server phase machine: lobby → instructions (no AI) → hoard/level → fork → end sub-phases
- Fork argue tallies (C-10); end scoring via pure rules (`buildScoreReport` / `computeTakes`)
- Instructions: humans only, drop-in; then AI fills from Hoard onward
- Keep `levelsAfterHoard` default **2** for playtests

Do **not** expand into full 19-level path graph, public matchmaking, or accounts unless explicitly asked.

---

## Orientation for a new agent

1. This file + [`docs/README.md`](docs/README.md) reading order.
2. Phase status: [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md).
3. Freezes: [`docs/decisions/ARCHITECT-OPEN-QUESTIONS.md`](docs/decisions/ARCHITECT-OPEN-QUESTIONS.md).
4. Stack: ADR-001, multiplayer: ADR-002.
5. Component you touch: `docs/components/<name>/DESIGN.md` + `TASKS.md` + `TEST-PLAN.md`.
6. Optional synthesized hub (if present): [`llm-wiki/index.md`](llm-wiki/index.md) — helpful overview; **`docs/` still wins** on contracts.
7. Prior multi-agent history: [`chatlogs/`](chatlogs/) + swimlane viewer [`chatlogs/timeline.html`](chatlogs/timeline.html) (Grok / Claude / Antigravity / Pi transcripts).

When implementing code, **follow frozen docs**. Prefer ADRs for stack or multiplayer changes; do not silently re-litigate product freezes.

### Doc map

| Area | Location |
|---|---|
| Architecture, stack, NFRs | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Component catalog + code status | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| Delivery phases | [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md) |
| Interface contracts | [`docs/interfaces/`](docs/interfaces/) |
| Per-component DESIGN / TASKS / TEST-PLAN | [`docs/components/<name>/`](docs/components/) |
| Test strategy + reports | [`docs/testing/`](docs/testing/), [`docs/testing/reports/`](docs/testing/reports/) |
| Art specs + production status | [`docs/art/`](docs/art/), [`docs/art/ASSET-STATUS.md`](docs/art/ASSET-STATUS.md) |
| Product freezes & ADRs | [`docs/decisions/`](docs/decisions/) |
| Prior agent chats | [`chatlogs/INDEX.md`](chatlogs/INDEX.md) |

---

## What’s implemented (code map)

| Layer | Location | Covers |
|---|---|---|
| Protocol v1 | `packages/protocol` | Messages, codecs, lobby DTOs (P2 freeze) |
| Rules (C-07) | `packages/rules` | Catalog, modifiers, encumbrance, payout — **pure** |
| Levels (C-09) | `packages/levels` | Pixel-map parse, palette, `box_level` / `hoard_01` |
| AI (C-08) | `packages/ai` | Pure `decide()` flock / loot cap / switch / stuck |
| Server | `server/` | Hono lobby REST, Colyseus `HaulSession`, 30 Hz sim |
| Client | `client/` | Dev lobby, prediction, interpolation, reconnect, loot HUD |
| Content | `content/` | Levels, palette, biomes, pool JSON |
| Production art | `client/public/assets/` | WebP atlases + screens (`manifest.json`) |
| Promo site | `website/` | Marketing pages (not the game client) |
| Asset gallery | `asset_gallery_website/` | Local art browser — don’t break casually |

**Still missing (P4+):** full Phaser scene graph, fork-vote component, end-screen director, high-score DB, audio director wiring, full C-02 character/VFX presentation.

---

## Product freezes (do not re-open without ADR + owner OK)

From [`docs/decisions/ARCHITECT-OPEN-QUESTIONS.md`](docs/decisions/ARCHITECT-OPEN-QUESTIONS.md):

| Topic | Decision |
|---|---|
| Platforms | Desktop evergreen browsers only (Chrome / Firefox / Safari / Edge) |
| Matchmaking | Private room codes only for MVP |
| Couch co-op | Online seats first; local multi-gamepad is stretch |
| Level progression | Random unplayed pair at each fork (not full path graph for MVP) |
| Resolution | **960×540** logical, integer scale, letterbox |
| Hosting | Fly.io (or Railway) sticky processes for game rooms |
| Identity | No accounts; ephemeral names + high-score initials |
| Run length | `levelsAfterHoard` configurable; default **2** playtests, **7** full |
| Characters | Soft-unique (prefer distinct; allow clash) |
| Pause | No global pause in MVP (local menu only) |

Also fixed by architecture:

- Exactly **4** hauler seats; AI fills inactive/disconnected seats (from Hoard onward; **no AI on Instructions**)
- Client never computes official takes — only displays server `ScoreReport`
- Share formula: `take = totalTreasure × (shares_i / sum shares)` with **min 1 share**
- `packages/rules` and `packages/ai` stay pure (no Phaser, Colyseus, Node `fs`)

---

## Stack (binding)

| Layer | Choice |
|---|---|
| Client | Phaser 3 + TypeScript + Vite |
| Server | Node.js/TypeScript + **Colyseus** rooms (authoritative sim, **30 Hz**) |
| Shared | `packages/rules`, `packages/protocol`, `packages/levels`, `packages/ai` |
| Lobby / REST | Hono |
| Persistence | PostgreSQL high scores — **not wired yet** (P5) |
| Monorepo | pnpm workspaces |
| Deploy | Docker; Fly.io-class sticky WebSocket rooms — **not deployed yet** (P5) |

**Rejected for game loop:** peer-to-peer host, pure serverless rooms without sticky WS, FastAPI as sim authority.

---

## Components (implementation units)

Catalog + status: [`docs/COMPONENTS.md`](docs/COMPONENTS.md).

| ID | Folder | Focus | Code status (approx.) |
|---|---|---|---|
| C-01 | `client-shell` | Scenes, scale, lobby UX | Partial — Boot + dev lobby |
| C-02 | `presentation` | Sprites, camera, VFX | Partial — grid/rects + treasure atlas |
| C-03 | `input-mapper` | Keyboard/gamepad → `InputCommand` | Partial — level keyboard |
| C-04 | `netcode-client` | WS, prediction, reconnect | Done (P2) |
| C-05 | `lobby-session` | Create/join codes, tokens | Done (P2) |
| C-06 | `simulation` | Authoritative tick, treasure, traps | Done P2–P3; phase machine partial |
| C-07 | `rules-engine` | Pure treasure + shares | Done (P1) |
| C-08 | `ai-controller` | AI inputs | Done (P3) `packages/ai` |
| C-09 | `level-loader` | Pixel maps | Done (P1) |
| C-10 | `fork-vote` | Path select + argue | Not started |
| C-11 | `end-screen` | Scoring cinematics | Not started |
| C-12 | `high-scores` | Top 25 + New! | Not started |
| C-13 | `audio-director` | Music/SFX | Assets exist; director not wired |
| C-14 | `telemetry` | Health, metrics | Partial |

Before coding a component, read its `DESIGN.md`, `TASKS.md`, `TEST-PLAN.md`, and linked interfaces.

Interface deltas may be noted in [`docs/components/INTERFACE-DELTA.md`](docs/components/INTERFACE-DELTA.md); **do not apply** protocol changes until contracts and consumers are updated deliberately.

---

## How agents should work

### Implementation rules

- Small, task-sized changes aligned to `TASKS.md` IDs (e.g. `C06-T22`, `C01-T…`).
- Parallel work behind frozen interfaces; mock peers when blocked.
- **Server is truth:** collisions, inventory, trap hits, fork tallies, end scores.
- **Client:** predict movement only; never invent inventory or takes.
- Fixed-timestep sim only; never drive physics from wall-clock `dt`.
- Determinism: seed treasure/fork RNG; prefer input-tape tests for sim.
- Keep `packages/rules` and `packages/ai` pure and unit-tested.
- After package changes: `pnpm --filter @dhaul/<pkg> build` (or `pnpm -r build`) so workspace consumers resolve `dist/`.

### Testing

Follow [`docs/testing/AUTOMATED-TEST-STRATEGY.md`](docs/testing/AUTOMATED-TEST-STRATEGY.md):

```bash
pnpm install
pnpm -r build
pnpm -r typecheck
pnpm -r lint
pnpm -r test
```

- **Vitest** for unit/contract/headless sim.
- **Playwright** later for E2E.
- Flaky unit tests: fix or quarantine — do not silent-retry unit suites.
- High coverage on `packages/rules`; presentation may be lighter.
- Server unit tests default **`enableAi: false`** (`server/test/sim/helpers.ts`) so AI fill does not steal loot mid-tape. Production rooms leave AI **on**.

### Sim / input gotchas (learned in P3)

- **Pickup** = duck only (`axes.y` down, **no** action). **Drop** = action + down. **Throw** = action + up. **Trip** = action + empty hands.
- Foot cell for ice/sand/spikes/switches: sample **one px below** feet (`footCell` in `server/src/sim/grid.ts`), not the body cell.
- Client kinematics copy under `client/src/net/kinematics.ts` should stay aligned with server for prediction (shared package is stretch).
- Grok/Claude/etc. session archives live under `chatlogs/`; regenerate timeline with `python3 scripts/parse_chatlogs_timeline.py` then rebuild `timeline.html` if you add logs.

### Art / audio

- Spec: [`docs/art/ASSET-INVENTORY.md`](docs/art/ASSET-INVENTORY.md)
- Status: [`docs/art/ASSET-STATUS.md`](docs/art/ASSET-STATUS.md)
- Phaser loading: [`docs/art/PIPELINE-AND-PHASER-GUIDE.md`](docs/art/PIPELINE-AND-PHASER-GUIDE.md)
- Served assets: `client/public/assets/` · masters: `art_raw/`
- Aesthetic: side-view 2D, cartoon haulers, biome themes; **no isometric**
- Prefer **game atlases** (`tre_*`, `char_*`, tiles) over random web images when rendering gameplay
- Python pipeline scripts under `scripts/` (`asset_processor.py`, `slice_*`, `generate_*`, audio generators) — see inventory of scripts in git history / `docs/art/` if extending art

### Documentation hygiene

- `docs/` is source of truth for design; update when behavior intentionally changes
- Prefer ADRs for stack/hosting/netcode decisions
- Do not rewrite the source PDFs
- No secrets in docs or code; use env for DB URLs
- Keep phase status tables in IMPLEMENTATION-PLAN / COMPONENTS / this file in sync when you finish a phase

### Optional: llm-wiki

If `llm-wiki/` exists, use it as a **synthesized** overview for architecture/rules/protocol. It is not a substitute for interface contracts. When you change binding behavior, update `docs/` first; update wiki pages if they exist and drift.

---

## Monorepo layout

```text
/
├── CLAUDE.md                 # this file
├── docs/                     # design + test reports (binding)
├── packages/
│   ├── protocol/             # wire types, codecs (v1 freeze)
│   ├── rules/                # pure share modifiers + treasure value
│   ├── levels/               # pixel-map loader / fixtures
│   └── ai/                   # pure C-08 decide() + helpers
├── client/                   # Phaser + Vite (dev lobby + GameScene)
├── server/                   # Hono lobby REST + Colyseus + sim
├── content/                  # levels, palette, biomes, pool
├── website/                  # promotional static site
├── chatlogs/                 # archived multi-agent transcripts + timeline.html
├── art_raw/                  # high-res masters (not served)
└── scripts/                  # art/audio pipeline + chatlog parser
```

### Local run (playtest)

```bash
pnpm install
pnpm -r build

# Terminal 1 — REST :8080, game WS :2567 (defaults)
pnpm --filter @dhaul/server dev

# Terminal 2 — Vite client
pnpm --filter @dhaul/client dev
```

Controls: arrows/WASD move · **Z / Space** jump · **X** action · duck = pickup · action+down = drop · action+up = throw.

Env: `PORT`, `WS_PORT`, `PUBLIC_WS_URL`, `LEVELS_AFTER_HOARD` (server); `VITE_SERVER_URL` (client).

### Chat timeline viewer

Open [`chatlogs/timeline.html`](chatlogs/timeline.html) in a browser (self-contained). Filter by agent/kind; lanes share viewport width. Rebuild data: `python3 scripts/parse_chatlogs_timeline.py`.

---

## Game flow (product)

```text
Title / Credits / High Scores (idle attract)
  → Lobby (create/join code, claim character, ready)
  → Instructions (human drop-in practice; no AI)
  → Level 0 Hoard
  → Fork (argue / path vote) ↔ Level … until levelsAfterHoard done
  → End (count haul → share titles → spoils → optional name entry)
  → High Scores
```

Dev client today jumps straight into a net level for P2/P3 playtests; P4 wires the full shell.

---

## Out of scope unless asked

- Mobile / touch MVP
- Required user accounts / OAuth
- Public matchmaking queues
- Peer-to-peer or host-migration multiplayer
- Flash / Flixel runtime
- Global pause for online sessions
- Full 19-level path graph before MVP ships

---

## When stuck

1. Check freezes and the component DESIGN.
2. Check interface contracts — do not invent a parallel protocol.
3. Skim `docs/testing/reports/` and `chatlogs/INDEX.md` for how prior agents solved similar work.
4. Ask the owner for product clarifications (fun/balance choices not frozen).
5. Pure rule conflicts: **design doc §2.3 share tables** win over premise-section duplicates (see rules-engine DESIGN).

---

## Success criteria for agents

A good contribution:

- Matches a named task or test case ID
- Respects authority boundaries (server truth / pure rules / dumb presentation)
- Adds or updates tests where logic is pure or sim-critical
- Leaves docs consistent if contracts change
- Does not expand MVP scope past freezes
- Leaves `pnpm -r typecheck`, `lint`, and `test` green when practical
