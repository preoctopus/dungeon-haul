# Codebase Structure & Organization

The **Dungeon Haul** repository is structured as a pnpm monorepo to separate framework-dependent runtime code from pure game logic.

## 🏗️ The Monorepo Blueprint

### Pure Logic Layer (`packages/`)
Framework-agnostic TypeScript libraries that define the "laws" of the game.
- **`@dhaul/protocol`**: The shared language (wire types & codecs). All network communication flows through these definitions.
- **`@dhaul/rules`**: The economic and scoring engine. Handles treasure values, encumbrance math, and share modifiers.
- **`@dhaul/ai`**: Decision logic for AI fillers. Pure functions that transform world state into inputs.
- **`@dhaul/levels`**: Asset loader. Converts raw pixel-maps and JSON metadata into game-ready levels.

### The Runtime Layer
- **Server (`server/`)**: Authoritative 30Hz simulation. Uses **Colyseus** for rooms and **Hono** for the lobby API. Truth resides here.
- **Client (`client/`)**: Phaser 3 presentation layer. Implements client prediction and snapshot interpolation to ensure smooth movement despite network latency.

### Data & Assets
- **`content/`**: The "World Database". Contains level packs (PNG maps + JSON meta) and global biome configs.
- **`scripts/`**: Python pipeline for processing raw art into game assets.

## 🔄 Dependency Graph

To prevent architectural leaking, dependencies follow a strict hierarchy:
**Runtime (Client/Server)** $\rightarrow$ **Pure Logic (`packages/*`)** $\rightarrow$ **Protocol**

- No Phaser in `server/` or `packages/`.
- No Node.js internals in `client/` or `packages/`.
- Shared logic is unit-tested independently of the game loop.

For full detailed technical mapping, see [docs/CODE_STRUCTURE.md](../../docs/CODE_STRUCTURE.md).
