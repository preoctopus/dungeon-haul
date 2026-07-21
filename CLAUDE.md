# CLAUDE.md — Dungeon Haul

Instructions for AI agents (Claude Code and similar) working in this repository.

## What this project is

**Dungeon Haul** is a remake of a TOJam 8 local multiplayer sidescroller: four haulers loot a dungeon, navigate traps, sabotage each other, and split the haul via **Share Modifiers**. This remake makes **online multiplayer first-class** (authoritative server, drop-in/reconnect, AI fill for empty seats).

Canonical game design lives in:

- [`docs/source/TOJam 8_ Dungeon Haul Design Document.pdf`](docs/source/TOJam%208_%20Dungeon%20Haul%20Design%20Document.pdf)

A prior non-binding AI build plan (Phaser + FastAPI) is in:

- [`docs/source/AI Agent Game Build Plan.pdf`](docs/source/AI%20Agent%20Game%20Build%20Plan.pdf)

**Do not treat the Build Plan PDF as architecture truth.** Binding architecture is under `docs/`.

## Current phase

**P0–P3 complete. Next up: P4 (full game flow shell).**  
Design docs under `docs/` remain the source of truth; application code lives in the monorepo packages below.

| Phase | Status | Notes / reports |
|---|---|---|
| **P0** Foundations | Done | pnpm monorepo, Vitest, protocol stubs |
| **P1** Rules & levels | Done | `packages/rules`, `packages/levels` + fixtures |
| **P2** Netcode slice | Done | [`docs/testing/reports/P2-DEMO.md`](docs/testing/reports/P2-DEMO.md) |
| **P3** Core gameplay + AI | Done | [`docs/testing/reports/P3-GAMEPLAY.md`](docs/testing/reports/P3-GAMEPLAY.md) |
| **P4** Flow shell | Not started | Title→Lobby→Instructions→Hoard→Fork→End |
| **P5+** Persistence / content / stretch | Not started | High scores, deploy, biomes breadth |

| Area | Location |
|---|---|
| Architecture, stack, NFRs | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Component catalog | [`docs/COMPONENTS.md`](docs/COMPONENTS.md) |
| Delivery phases + status | [`docs/IMPLEMENTATION-PLAN.md`](docs/IMPLEMENTATION-PLAN.md) |
| Interface contracts | [`docs/interfaces/`](docs/interfaces/) |
| Per-component design / tasks / tests | [`docs/components/<name>/`](docs/components/) |
| Test strategy + session reports | [`docs/testing/`](docs/testing/), [`docs/testing/reports/`](docs/testing/reports/) |
| Art specs + production status | [`docs/art/`](docs/art/), [`docs/art/ASSET-STATUS.md`](docs/art/ASSET-STATUS.md) |
| Product freezes & ADRs | [`docs/decisions/`](docs/decisions/) |

Start with [`docs/README.md`](docs/README.md) for reading order.

When implementing code, **follow frozen docs**. Prefer ADRs for stack or multiplayer changes; do not silently re-litigate product freezes.

### What’s implemented (code map)

| Layer | Location | Covers |
|---|---|---|
| Protocol v1 | `packages/protocol` | Messages, codecs, lobby DTOs |
| Rules (C-07) | `packages/rules` | Treasure catalog, shares, encumbrance, payout |
| Levels (C-09) | `packages/levels` | Pixel-map parse, palette, box/hoard fixtures |
| AI (C-08) | `packages/ai` | Pure `decide()` flock / loot / switch / stuck |
| Server sim + room (C-05/C-06) | `server/` | Lobby REST, Colyseus `HaulSession`, 30 Hz sim |
| Client net + dev UI (C-03/C-04 slice) | `client/` | Join, prediction, interpolation, reconnect, loot draw |
| Content | `content/` | `box_level`, `hoard_01`, biomes/palette JSON |
| Production art | `client/public/assets/` | Atlases + screens (see ASSET-STATUS) |

**Not yet (P4+):** full scene graph (Title/Lobby/Fork/End), end scoring UI, high-score DB, fork-vote component, full C-02 character presentation, audio director wiring.

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
| Run length | `levelsAfterHoard` configurable; default **2** for playtests, **7** full |
| Characters | Soft-unique (prefer distinct; allow clash) |
| Pause | No global pause in MVP (local menu only) |

Also fixed by architecture:

- Exactly **4** hauler seats in game state; AI fills inactive/disconnected seats
- Client never computes official takes — only displays server `ScoreReport`
- Share formula: `take = totalTreasure × (shares_i / sum shares)` with **min 1 share**
- Rules package is pure (no Phaser, Colyseus, Node `fs`)

## Stack (binding)

See [`docs/decisions/ADR-001-tech-stack.md`](docs/decisions/ADR-001-tech-stack.md) and ADR-002.

| Layer | Choice |
|---|---|
| Client | Phaser 3 + TypeScript + Vite |
| Server | Node.js/TypeScript + **Colyseus** rooms (authoritative sim, 30 Hz) |
| Shared | `packages/rules` (pure), `packages/protocol` (messages), `packages/levels`, `packages/ai` (pure) |
| Lobby / REST | Hono |
| Persistence | PostgreSQL (high scores) — **not wired yet** (P5) |
| Monorepo | pnpm workspaces |
| Deploy | Docker; Fly.io-class sticky WebSocket rooms — **not deployed yet** (P5) |

**Rejected for game loop:** peer-to-peer host, pure serverless rooms without sticky WS, FastAPI as sim authority (dual-language rules drift).

## Components (implementation units)

Catalog: [`docs/COMPONENTS.md`](docs/COMPONENTS.md).

| ID | Folder | Focus |
|---|---|---|
| C-01 | `client-shell` | Scenes, scale, lobby UX, phase binding |
| C-02 | `presentation` | Sprites, parallax, camera, VFX |
| C-03 | `input-mapper` | Keyboard/gamepad → `InputCommand` |
| C-04 | `netcode-client` | WS, prediction, reconcile, reconnect |
| C-05 | `lobby-session` | Create/join codes, seats, tokens |
| C-06 | `simulation` | Authoritative tick, physics, treasure, traps |
| C-07 | `rules-engine` | Pure treasure value + share modifiers |
| C-08 | `ai-controller` | AI inputs for empty seats |
| C-09 | `level-loader` | Pixel-map levels + fork pool |
| C-10 | `fork-vote` | Path select + argue tallies |
| C-11 | `end-screen` | Cinematic scoring UI |
| C-12 | `high-scores` | Persist top 25 + New! |
| C-13 | `audio-director` | Music/SFX + unlock policy |
| C-14 | `telemetry` | Health, metrics, logs |

Before coding a component, read its:

1. `docs/components/<name>/DESIGN.md`
2. `docs/components/<name>/TASKS.md`
3. `docs/components/<name>/TEST-PLAN.md`
4. Linked files under `docs/interfaces/`

Interface change proposals may be recorded (e.g. [`docs/components/INTERFACE-DELTA.md`](docs/components/INTERFACE-DELTA.md)); **do not apply** protocol/API deltas until the interface docs and consumers are updated deliberately.

## How agents should work

### Orientation

1. Read this file and [`docs/README.md`](docs/README.md).
2. For gameplay rules, prefer design PDF + `rules-engine` design + `share-modifier-api` over inventing numbers.
3. For netcode behavior, prefer ADR-002 + `netcode-messages.md` + `simulation` design.

### Implementation

- Work in **small, task-sized PRs** aligned to `TASKS.md` IDs (e.g. `C07-T03`).
- Prefer **parallel work behind frozen interfaces**; mock peers when blocked.
- Keep `packages/rules` pure and heavily unit-tested (seeded RNG, golden fixtures).
- Server owns truth: collisions, inventory, trap hits, fork tallies, end scores.
- Client predicts movement only; never invent inventory or takes.
- Use fixed-timestep simulation; cap large frame deltas (no quantum tunneling).
- Determinism: seed treasure/fork RNG; record input tapes for headless sim tests.

### Testing

Follow [`docs/testing/AUTOMATED-TEST-STRATEGY.md`](docs/testing/AUTOMATED-TEST-STRATEGY.md):

- **Vitest** for unit/contract/headless sim (not dual Jest unless ADR changes it)
- **Playwright** for later E2E
- Component cases live in each `TEST-PLAN.md`; integration scenarios in `INTEGRATION-TEST-PLAN.md`
- Flaky unit tests: fix or quarantine — do not silent-retry unit suites
- Target high coverage on `packages/rules`; presentation may be lighter

### Art / audio

- Asset Inventory & Spec: [`docs/art/ASSET-INVENTORY.md`](docs/art/ASSET-INVENTORY.md)
- Asset Production & Completion Status: [`docs/art/ASSET-STATUS.md`](docs/art/ASSET-STATUS.md)
- Asset Pipeline & Phaser 3 Developer Guide: [`docs/art/PIPELINE-AND-PHASER-GUIDE.md`](docs/art/PIPELINE-AND-PHASER-GUIDE.md)
- Production Web Assets: Served at `client/public/assets/` (`manifest.json`, WebP texture atlases, background images)
- Master High-Res Originals: Retained in `art_raw/` (uncompressed masters for editing/changes)
- Aesthetic: side-view 2D, cartoon haulers, biome themes; **no isometric**
- **Python Pipeline Scripts (`scripts/`)**:
  - `asset_processor.py` — Core utility module (chroma key background removal, frame scaling, Phaser 3 JSON Hash atlas generator).
  - `slice_treasures.py` — Slices P0 primary treasures into `atlas_treasures`.
  - `generate_and_process_treasures_sets.py` — Generates & processes secondary loot sets (Celestial, Divine, Song, Veg, Box) into `atlas_treasures_sets`.
  - `slice_tiles.py` — Slices MVP tiles, switches, gates, and traps into `atlas_tiles_mvp`.
  - `process_lava_biome.py` — Generates & packs Lava biome assets into `atlas_tiles_lava`.
  - `generate_ice_biome.py` — Generates & packs Ice biome assets into `atlas_tiles_ice`.
  - `process_cavern_tiles.py` — Generates & packs Cavern biome assets into `atlas_tiles_cavern`.
  - `generate_mist_pack.py` — Generates & packs Mist biome assets into `atlas_tiles_mist`.
  - `generate_and_process_enemies_traps.py` — Generates & packs Golem, Phantom, Lightning, Gas, Rock into `atlas_enemies`.
  - `generate_ui_icons_pack.py` — Generates & packs D-pad/buttons, medals, badges, and spinner loop into `atlas_ui_icons`.
  - `generate_and_process_vfx.py` — Generates & packs particle VFX sheets (stun stars, spill, flashes, dust, poof) into `atlas_vfx`.
  - `slice_characters.py` — Slices 4 character animation sheets (Gnome, Sprite, Halfling, Dwarf) into `char_*` atlases.
  - `generate_char_extras.py` — Generates & packs Title stick walk-ins, Argue/Rummage poses into `atlas_char_extras`.
  - `generate_and_process_level_props.py` — Generates & packs background props (torches, banners, candelabras, grates) into `atlas_level_props`.
  - `process_screens.py` — Resizes and converts screen background artwork to 960×540 WebP images.
  - `generate_previews_pack.py` — Programmatically creates 10 high-resolution preview graphics and showcases in `docs/art/preview/`.
  - `generate_audio_suite.py` — Master script executing all 8-bit NES sound effects and music stem generators.
  - `generate_sfx_jump.py` — Synthesizes 8-bit NES jump pitch-sweep sound (`char_jump.wav`).
  - `generate_sfx_pickup.py` — Synthesizes 8-bit NES treasure pickup chime (`pickup_treasure.wav`).
  - `generate_spikes_sfx.py` — Synthesizes 8-bit NES metallic spike trap snap (`trap_spikes.wav`).
  - `generate_sfx_ui_start.py` — Synthesizes 8-bit NES arcade start press sound (`ui_start_game.wav`).
  - `generate_music_title.py` — Synthesizes loopable 8-bit NES title music stem (`music_title.wav`).

### Documentation hygiene

- Keep `docs/` the source of truth for design; update docs when behavior intentionally changes
- Prefer ADRs for stack/hosting/netcode decisions
- Do not rewrite the source PDFs
- Do not put secrets in docs or code; use env/secrets for DB URLs

## Monorepo layout

```text
/
├── CLAUDE.md
├── docs/                 # design + test reports (source of truth for behavior)
├── packages/
│   ├── protocol/         # wire types, codecs (v1 freeze)
│   ├── rules/            # pure share modifiers + treasure value
│   ├── levels/           # pixel-map loader / fixtures
│   └── ai/               # pure C-08 decide() + helpers
├── client/               # Phaser + Vite (dev lobby + GameScene)
├── server/               # Hono lobby REST + Colyseus HaulSession + sim
├── content/              # levels, palette, biomes, pool JSON
├── art_raw/              # high-res masters (not served)
└── scripts/              # asset pipeline + audio generators
```

### Local run (P2/P3 playtest)

```bash
pnpm install
pnpm -r build
# Terminal 1
pnpm --filter @dhaul/server dev
# Terminal 2
pnpm --filter @dhaul/client dev
```

Controls: arrows/WASD move, Z/Space jump, X action; duck pickup; action+down drop; action+up throw.

## Game flow (quick)

```text
Title / Credits / High Scores (idle attract)
  → Lobby (create/join code, claim character, ready)
  → Instructions (human drop-in practice; no AI)
  → Level 0 Hoard
  → Fork (argue / path vote) ↔ Level … until levelsAfterHoard done
  → End (count haul → share titles → spoils → optional name entry)
  → High Scores
```

Controls (NES-like): run, jump, duck/pickup, trip/push, drop/throw treasure. Full tables in design PDF and input interface docs.

## Out of scope unless asked

- Mobile / touch MVP
- Required user accounts / OAuth
- Public matchmaking queues
- Peer-to-peer or host-migration multiplayer
- Flash / Flixel runtime
- Global pause for online sessions
- Expanding to full 19-level path graph before MVP ships

## When stuck

1. Check frozen decisions and the component DESIGN.
2. Check interface contracts — do not invent a parallel protocol.
3. Ask the user for product clarifications (architecturally ambiguous fun/balance choices).
4. For pure rule conflicts: **design doc §2.3 share tables win** over premise section duplicates (see rules-engine DESIGN).

## Success criteria for agents

A good contribution:

- Matches a named task or test case ID
- Respects authority boundaries (server truth / pure rules / dumb presentation)
- Adds or updates tests where logic is pure or sim-critical
- Leaves docs consistent if contracts change
- Does not expand MVP scope past freezes
