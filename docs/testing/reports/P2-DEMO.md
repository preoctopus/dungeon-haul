# P2 Netcode Slice — Demo & Verification (gate G3)

Movement-only authoritative netcode: create/join a private room, up to 4
humans (AI fills empty seats as idle stand-ins) run and jump on the
`box_level` test level, server-authoritative at 30 Hz with client prediction,
interpolation, and reconnect.

Scope note: treasure, traps, encumbrance, fork/end phases, AI behaviors, and
art are **out of P2** by design (Implementation Plan §P2).

## Run it

Two processes. From the repo root:

```bash
pnpm install                     # once
pnpm --filter @dhaul/protocol build   # client/server resolve the built package
pnpm --filter @dhaul/levels build     # (already built in CI)

# Terminal 1 — server (REST :8080, game WS :2567 by default)
pnpm --filter @dhaul/server dev

# Terminal 2 — client (Vite dev server, prints a localhost URL)
pnpm --filter @dhaul/client dev
```

Open the client URL in **two** browser windows:

1. Window A: enter a name → **Create room**. Note the 6-char join code shown.
2. Window B: enter a name → type the code → **Join**.
3. Both windows enter the box level. Controls: **arrows / WASD** move,
   **Z / Space** jump, **X** action (no-op in P2), **Enter** start.
4. Each window shows a HUD: `seat N  <connection-state>  tick T  ack S`.
   Your own hauler is the colored rect tagged `you`; the others show
   `human` / their name / `ai`.

Env overrides: `PORT`, `WS_PORT`, `PUBLIC_WS_URL`, `LEVELS_AFTER_HOARD`
(server); `VITE_SERVER_URL` (client, default `http://localhost:8080`).

### Reconnect check

Refresh Window A (or toggle the network). The client stores its reconnect
bundle in `sessionStorage` and auto-rejoins the same seat within the 30s
grace; the hauler position is restored from the server snapshot. During the
gap the seat shows `control: ai` to the other window.

## What was verified automatically

`pnpm -r typecheck && pnpm -r lint && pnpm -r test && pnpm -r build` — all
green. Test totals: **270 passed** (210 pre-existing + 60 new).

| Area | File | Cases |
|---|---|---|
| Protocol v1 codec/validators | `packages/protocol/test/codec.test.ts` | 13 |
| Headless movement sim | `server/test/sim/movement.test.ts` | 16 |
| Lobby REST | `server/test/lobby.test.ts` | 15 |
| Room / WebSocket integration | `server/test/room.integration.test.ts` | 6 |
| Client prediction/interp/mapper | `client/test/*.test.ts` | 10 |

### Scripted two-client session (this report's manual step)

A throwaway harness booted the real `startGameServer`, hit `GET /health`
(`{ ok:true, version, rooms }`), created a room over REST, joined a second
seat, then opened two `@colyseus/sdk` WS clients and drove seat 0 right / seat
1 left at ~30 Hz for ~1.2s. Result: seat 0 advanced from spawn x≈80 to x≈252,
seat 1 moved left to the wall clamp x≈44, both `control: "human"` with
`lastProcessedInputSeq` advancing (ack 34). This exercises the same path the
integration test `join → Welcome → snapshot stream; input moves the hauler`
covers; the real two-browser check is left to the user.

## P2 exit criteria → coverage

| Exit criterion (Impl Plan §P2) | Where |
|---|---|
| 2 humans share positions | `room.integration` "four seats join…"; scripted 2-client session |
| Kill network → reconnect restores seat within grace | `room.integration` "unconsented drop… reconnect token restores seat"; client `SessionClient` backoff resume + `tokenStore` |
| 3rd/4th seats AI or empty without crashing | `sim/movement` "always exactly 4 seats", "AI seats hold spawn"; `room.integration` 4-seat join |
| Tick lag metric logged | `HaulSession.tick` logs `tick/lagMs/clients` every ~5s |
| Fifth seat rejected FULL | `lobby.test` + `room.integration` "fifth join FULL" |
| Protocol mismatch → error | `room.integration` "protocol mismatch → PROTOCOL (4100)" |

## Key decisions / deviations

- **Transport: Colyseus, JSON-equivalent snapshots (no schema).** The wire
  contract's `C2S_Join` travels as Colyseus join options; join rejection uses
  `ServerError` with numeric codes mapped to the contract `ErrorCode`
  (`@dhaul/protocol` `COLYSEUS_ERROR_CODES`); all other messages ride channels
  named by their wire `type` carrying the full contract payload. Full
  `WorldSnapshot` broadcast each tick (4 haulers is tiny). Documented in
  `packages/protocol/src/codec.ts`.
- **Two listeners, one process.** Hono REST (`:8080`) and Colyseus
  (`:2567`, owns its matchmake/WS routes) run in one process; the client gets
  the explicit `wsUrl` from the lobby response, so the split is invisible to
  the contracts. Single-origin reverse proxy is a P5 deploy concern.
- **`@colyseus/sdk`, not `colyseus.js`.** The 0.16 `colyseus.js` client is
  wire-incompatible with `@colyseus/core` 0.17; `@colyseus/sdk` (0.17) is the
  matching client.
- **`express` dependency** is a hard (non-optional in practice) import of
  `@colyseus/ws-transport`; added to the server.
- **`GET /api/v1/levels/:id`** is a **P2 dev shim** (not a frozen interface)
  serving box-level solidity/spawns/exit so the client has collision geometry
  for prediction until the client-side level loader lands.
- **Kinematics duplicated** verbatim in `server/src/sim/kinematics.ts` and
  `client/src/net/kinematics.ts` for prediction parity; extraction into a
  shared package is a P3+ cleanup (both files carry the sync note).
- **Idle→AI** implements the 20s path only; the 5s+camera-edge variant is
  deferred (no camera pressure model in P2).
