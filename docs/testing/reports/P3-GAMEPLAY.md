# P3 Core Gameplay — Implementation Notes

Authoritative sim gameplay systems for Implementation Plan **P3**, plus pure
C-08 AI decisions. Builds on the P2 netcode slice (`docs/testing/reports/P2-DEMO.md`).

## Scope delivered

| Area | Status |
|---|---|
| Treasure spawn (seeded slots) + free physics | Done (`server/src/sim/treasure.ts`) |
| Pickup / drop / throw carry stack | Done |
| Encumbrance → speed/jump multipliers | Done (`@dhaul/rules` `computeEncumbrance`) |
| Stun + spill + owner pickup lockout | Done |
| Trip / push (empty-hands action) | Done |
| Trap MVP: spikes + lightning cycle | Done (`hazards.ts`) |
| Switches regular + heavy mass | Done |
| Ice / sand surfaces | Done |
| Level exit order + PlayerStats counters | Done (session-long; end scoring is P4) |
| C-08 pure AI (`packages/ai`) flock / loot / switch / stuck | Done |
| Client free treasure + carry HUD (game atlas) | Done (dev placeholders still for haulers) |

## Packages

```text
packages/ai/          pure decide() + helpers (no I/O)
server/src/sim/       Simulation + treasure + hazards + stats + rng
client/src/scenes/    BootScene loads atlases; GameScene draws loot
```

Server depends on `@dhaul/rules` and `@dhaul/ai` (workspace).

## How to verify

```bash
pnpm install
pnpm -r build
pnpm -r test
pnpm -r typecheck
pnpm -r lint

# Manual playtest (two terminals)
pnpm --filter @dhaul/server dev
pnpm --filter @dhaul/client dev
```

Controls (unchanged from P2): arrows/WASD move, Z/Space jump, **X action**,
duck (down) to pickup, **action+down** drop, **action+up** throw, action alone
trips when empty-handed.

HUD shows `loot N` for local carry count; free treasures render from
`atlas_treasures` when the frame exists for the def id.

## Tests

| Suite | Coverage |
|---|---|
| `packages/ai/test/*` | flock, load cap, upgrade, switches, decide cascade |
| `server/test/sim/movement.test.ts` | P2 movement + control (AI may move when `enableAi`) |
| `server/test/sim/gameplay.test.ts` | pickup race, spill/steal, encumbrance, trip, spikes, switches, ice/sand, AI flock |
| Room integration | Reconnect tolerance widened slightly for AI pilot drift |

Unit tests default `enableAi: false` so loot tapes are not stolen by fill seats.
Production / room default is `enableAi: true`.

## Explicitly still P4+

- Full scene flow (Title → Lobby → Instructions → Hoard → Fork → End)
- End scoring `ScoreReport` invocation
- Instructions phase (no AI) gating in the room phase machine
- Full presentation (character anims, VFX, audio director)
- Content traps beyond spikes/lightning

## P3 exit criteria (Impl Plan)

> Steal/spill feels fair; AI keeps pace.

Headless: spill lockout + peer steal; AI moves toward human mean within
tolerance band and will not exceed max human load. Manual chaos playtest
notes can land under `docs/testing/reports/` when a session is run.
