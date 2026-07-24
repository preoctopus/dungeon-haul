# Codebase Structure & Organization

This document provides a technical map of the **Dungeon Haul** repository. It is intended for developers to understand where logic resides and how data flows between the monorepo components.

## 🗺️ High-Level Layout

The project is organized as a **pnpm monorepo**. This ensures a strict separation between "pure" game logic (shared by both client and server) and the operational frameworks (Phaser for client, Colyseus/Hono for server).

```text
/
├── packages/             # Pure TS libraries (Framework-agnostic)
│   ├── protocol/         # Wire types & binary codecs
│   ├── rules/            # Scoring, modifiers, treasure value
│   ├── ai/               # AI decision logic
│   └── levels/           # Pixel-map loader & level definitions
├── server/               # Authoritative Node.js game server
├── client/               # Phaser 3 presentation client
├── content/              # Game data (maps, biomes, pools)
├── scripts/              # Art/Audio pipeline tooling (Python)
├── art_raw/              # High-res source assets
└── docs/                 # Design and implementation specifications
```

---

## 📦 The Pure Layer (`packages/`)

The `packages` directory contains the "laws of physics" for Dungeon Haul. These packages **must not** depend on Phaser, Colyseus, or Node.js specific APIs (where possible), making them easily unit-testable and portable.

### 1. `@dhaul/protocol`
The shared grammar of the game. Every message sent over the network is defined here.
- **Key Responsibilities:** Message types (`C2S_`, `S2C_`), binary serialization/deserialization (codecs), and session handshake definitions.
- **Impact:** If you change a network message, start here.

### 2. `@dhaul/rules`
The engine for treasure, weight, and scoring.
- **Key Responsibilities:** 
  - Computing actual GP value of treasures.
  - Handling encumbrance (weight vs. speed penalties).
  - Evaluating "Share Modifiers" (how behavior affects the final take).
  - The pure math for splitting the haul at the end of a run.
- **Impact:** Change game balance, loot values, or scoring rules here.

### 3. `@dhaul/ai`
The brains for AI Haulers who fill empty seats.
- **Key Responsibilities:** Pure `decide()` functions that take world state as input and return an `InputCommand`. It handles target selection (treasure vs. exit) and basic navigation helpers.
- **Impact:** Adjust AI difficulty or behavior patterns here.

### 4. `@dhaul/levels`
The translation layer between art assets and game data.
- **Key Responsibilities:** Parsing pixel-map PNGs into grid arrays, loading `meta.json` for level properties, and calculating hashes for level identity.
- **Impact:** Change how levels are loaded or validated here.

---

## 🖥️ The Server (`server/`)

The server is the sole source of truth. It runs a fixed-timestep simulation (30Hz).

### Architecture
- **Lobby API (`server/src/lobby`):** A Hono REST server for creating and joining rooms.
- **Game Rooms (`server/src/rooms`):** Colyseus rooms (`HaulSession`) that manage the lifecycle of a single playthrough.
- **Simulation Loop (`server/src/sim`):** The heart of the game. It processes `InputCommand` from clients, applies physics/collisions via the grid system, and updates hauler state.
- **Flow:** 
  `Client Input` $\to$ `Colyseus Room` $\to$ `Simulation Tick` $\to$ `World Snapshot` $\to$ `Broadcast to Clients`.

---

## 🎮 The Client (`client/`)

The client is a "dumb" renderer that predicts local movement to hide latency.

### Architecture
- **Scenes (`client/src/scenes`):** Phaser 3 scenes (Boot, Game) managing the visual state and asset lifecycle.
- **Netcode (`client/src/net`):** 
  - **Prediction:** Locally applies movement inputs immediately.
  - **Interpolation:** Smooths out the movement of other players based on server snapshots.
  - **Session Client:** Manages the WebSocket connection to Colyseus.
- **Input Mapper:** Translates keyboard/gamepad events into `InputCommand` packets defined in `@dhaul/protocol`.

---

## 📁 Content & Tooling

### Game Content (`content/`)
Levels are stored as "packs" (folders). A level folder contains:
- `map.png`: The pixel-map defining blocks and tiles.
- `meta.json`: Metadata including spawn points and biome types.
Global config files (`biomes.json`, `palette.json`) define the visual and structural rules for these levels.

### Pipeline Tooling (`scripts/`)
A suite of Python scripts used to process raw art into game-ready assets (atlases, slices, audio generation). These are part of the build pipeline but not the runtime game logic.

---

## 🔄 Dependency Flow

To maintain a clean architecture, dependencies only flow in one direction:

**`Client` / `Server` $\longrightarrow$ `packages/*` $\longrightarrow$ `protocol`**

- **Forbidden:** `packages/rules` should never import from `server/...` or `client/...`.
- **Forbidden:** The server should not depend on Phaser; the client should not depend on Node.js server internals.
