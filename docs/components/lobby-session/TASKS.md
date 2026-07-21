# C-05 — Lobby & Session Service — Tasks

| Field | Value |
|---|---|
| Component | C-05 Lobby & Session Service |
| Ownership | SE-4 |
| Task ID scheme | `C05-T##` |
| Depends on | Protocol DTOs (P0), Colyseus room skeleton (P2 co-work with SE-5) |
| Phases | P0 health glue · **P2** create/join/tokens · P4 ready/mid-join polish · P5 TTL/rate-limit/deploy |

Documentation only — tasks describe future implementation work.

---

## Legend

| Status | Meaning |
|---|---|
| `todo` | Not started |
| `blocked` | Waiting on dependency |
| `done` | Complete |

| Priority | Meaning |
|---|---|
| P0 | Foundation / unblocks others |
| P1 | MVP critical path |
| P2 | Hardening / polish for ship |
| P3 | Stretch / nice-to-have |

---

## Task list

### Foundation

#### C05-T01 — Session domain types in protocol package
- **Priority:** P0
- **Status:** todo
- **Phase:** P0
- **Summary:** Define shared TypeScript DTOs for `SessionPhase`, `SeatStatus`, create/join request/response, error codes — matching [lobby-and-scores.md](../../interfaces/lobby-and-scores.md).
- **Deliverables:** `packages/protocol` session types; exported for client + server.
- **Depends on:** Protocol package skeleton.
- **Acceptance:** Client and server import same types; no Phaser/Node in package.

#### C05-T02 — Token issue / hash / verify module
- **Priority:** P0
- **Status:** todo
- **Phase:** P0–P2
- **Summary:** Implement high-entropy seat + reconnect token generation; store only SHA-256 hashes; constant-time verify; bind to `sessionId` + `seatId`.
- **Deliverables:** Shared server module usable by lobby routes and Colyseus room.
- **Depends on:** C05-T01.
- **Acceptance:** Unit tests: valid token verifies; wrong seat fails; closed session fails; raw tokens never logged in test spies.

#### C05-T03 — Join code generator
- **Priority:** P0
- **Status:** todo
- **Phase:** P2
- **Summary:** 6-char codes from unambiguous alphabet; case-normalize; collision retry; active-session uniqueness.
- **Deliverables:** `joinCodes` helper + unit tests.
- **Depends on:** —
- **Acceptance:** 10k generated codes parse/normalize; no `0/O/1/I`; lookup is case-insensitive.

#### C05-T04 — In-memory session registry
- **Priority:** P0
- **Status:** todo
- **Phase:** P2
- **Summary:** Process-local maps: `sessionId → LobbySession`, `joinCode → sessionId`, token hash index; atomic seat reservation mutex per session.
- **Deliverables:** Registry API: create, get, findByCode, reserveSeat, releaseSeat, dispose.
- **Depends on:** C05-T01, C05-T02, C05-T03.
- **Acceptance:** Concurrent reserve of last seat: only one wins under parallel calls (unit/integration).

---

### REST API

#### C05-T05 — `POST /api/v1/sessions` create
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Create private room, spawn Colyseus `HaulSession`, auto-claim seat 0, return `joinCode`, `wsUrl`, `hostSeatToken`, `reconnectToken`, seats.
- **Deliverables:** Hono route + service method; optional `displayName` validation.
- **Depends on:** C05-T04, room create hook (SE-5 collab).
- **Acceptance:** 201 body matches contract; room exists and accepts WS join with returned token.

#### C05-T06 — `POST /api/v1/sessions/join`
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Join by code; allocate free seat; errors `NOT_FOUND` / `FULL` / `CLOSED`.
- **Deliverables:** Route + seat allocator policies (prefer empty; respect room-held seats).
- **Depends on:** C05-T05.
- **Acceptance:** Contract: create → join ×3 → 4th OK → 5th `FULL`; bad code `NOT_FOUND`.

#### C05-T07 — `GET /api/v1/sessions/:sessionId`
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Public lobby view without tokens.
- **Deliverables:** Route returning phase, joinCode, seats, levelsCompleted.
- **Depends on:** C05-T05.
- **Acceptance:** No secrets in response; 404 unknown id.

#### C05-T08 — Display name validation
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Ephemeral names only (Q7): trim, max length, allowlist charset, default `"Hauler"`.
- **Deliverables:** Validator + tests; applied on create/join.
- **Depends on:** —
- **Acceptance:** Empty → default; oversize/invalid → `VALIDATION`; no persistence beyond session.

#### C05-T09 — Optional REST character claim
- **Priority:** P2
- **Status:** todo
- **Phase:** P4
- **Summary:** `POST .../claim` with `Authorization: Seat`; soft-unique (Q9) — never 409 on clash; optional `characterClash` flag.
- **Deliverables:** Route; sync with room seat state.
- **Depends on:** C05-T02, room character API.
- **Acceptance:** Two seats may claim same character; response 200; seats reflect both.

---

### Room integration

#### C05-T10 — Colyseus room spawn + bootstrap
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** On create, spawn `haul_session` with sessionId/joinCode/seat bootstrap; register reverse lookup.
- **Deliverables:** Matchmaker integration; dispose on lobby TTL/cancel.
- **Depends on:** SE-5 room skeleton.
- **Acceptance:** Create without HTTP 500; room id stored; dispose cleans registry.

#### C05-T11 — Token validation on `C2S_Join`
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Room uses shared verifier; reject bad/expired tokens with `S2C_Error AUTH`; issue refreshed `reconnectToken` on welcome.
- **Deliverables:** Room hook + tests with harness client.
- **Depends on:** C05-T02, C05-T05, SE-3/5 WS path.
- **Acceptance:** Valid token → Welcome + seatId; invalid → AUTH; wrong session → AUTH.

#### C05-T12 — Reconnect token path
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Within disconnect grace, `reconnectToken` restores same seat; after grace, reject.
- **Deliverables:** Documented grace default 30s; room + registry cooperation so seat not double-booked.
- **Depends on:** C05-T11, SE-5 disconnect/AI fill.
- **Acceptance:** Integration: drop WS → reconnect restores seatId; post-grace fails; new joiner may take freed seat.

#### C05-T13 — Mid-join phase gates
- **Priority:** P1
- **Status:** todo
- **Phase:** P4
- **Summary:** Allow join when phase ∈ lobby/instructions/level/fork; reject end/closed as `CLOSED`.
- **Deliverables:** Phase check against room-reported phase.
- **Depends on:** C05-T06, C-06 phase machine.
- **Acceptance:** Join during level OK if seat free; join during end → CLOSED.

#### C05-T14 — Ready-up coordination (lobby → instructions)
- **Priority:** P1
- **Status:** todo
- **Phase:** P4
- **Summary:** Ensure seat `ready` flags surface on REST status; room remains authority for phase advance (all ready / config force). Lobby does not tick sim.
- **Deliverables:** Mirror ready in `SeatStatus`; optional internal notify.
- **Depends on:** Room `C2S_Ready`.
- **Acceptance:** GET session shows ready flags consistent with WS seat updates within poll interval.

---

### Lifecycle & ops

#### C05-T15 — Empty lobby TTL cleanup
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Dispose rooms with zero connected humans past empty TTL; hold join code briefly; free maps.
- **Deliverables:** Background sweeper or room `onEmpty` timer.
- **Depends on:** C05-T10.
- **Acceptance:** Integration test with shortened TTL; join after dispose → NOT_FOUND.

#### C05-T16 — Rate limits on create/join
- **Priority:** P2
- **Status:** todo
- **Phase:** P5
- **Summary:** Per-IP limits; return `RATE_LIMITED`.
- **Deliverables:** Middleware (memory MVP; Redis later).
- **Depends on:** C05-T05, C05-T06.
- **Acceptance:** Exceed limit → 429-style error envelope; legitimate traffic under limit OK.

#### C05-T17 — `wsUrl` / Fly.io config
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Build `wsUrl` from `PUBLIC_WS_URL` / request host; document sticky session expectations for Fly.io (Q6).
- **Deliverables:** Config module + deploy notes in design or ops doc reference.
- **Depends on:** C05-T05.
- **Acceptance:** Staging create returns reachable wsUrl; two browsers join same room on deployed host.

#### C05-T18 — Soft-unique policy documentation in code comments + client advisory
- **Priority:** P2
- **Status:** todo
- **Phase:** P4
- **Summary:** Encode Q9 everywhere claim is implemented; expose clash advisory; ensure no CONFLICT hard fail remains from earlier interface assumption.
- **Deliverables:** Claim paths (REST + room) aligned; protocol field if needed.
- **Depends on:** C05-T09.
- **Acceptance:** Automated test “duplicate characters allowed”; contract note updated if interface doc still says 409.

#### C05-T19 — Health integration hook
- **Priority:** P2
- **Status:** todo
- **Phase:** P0–P5
- **Summary:** Expose active session/room count to C-14 `GET /health` optional `rooms` field.
- **Deliverables:** Registry `count()`; health wiring with SE-8/SE-4.
- **Depends on:** C05-T04.
- **Acceptance:** Health JSON includes rooms when sessions active.

#### C05-T20 — Integration test harness (lobby contract)
- **Priority:** P1
- **Status:** todo
- **Phase:** P2
- **Summary:** Automated suite for create/join/full/not_found; token→WS happy path; no score tests here.
- **Deliverables:** Vitest (or equivalent) server tests in CI.
- **Depends on:** C05-T05–T07, C05-T11.
- **Acceptance:** CI green; covers lobby half of lobby-and-scores test contract.

---

### Stretch (not MVP)

#### C05-T21 — Redis-backed join-code routing
- **Priority:** P3
- **Status:** todo
- **Phase:** P7+
- **Summary:** Multi-instance Fly scale-out: join code → node/room routing via Redis.
- **Depends on:** Multi-machine deploy need.
- **Acceptance:** Create on instance A, join via instance B succeeds.

#### C05-T22 — Public matchmaking
- **Priority:** P3
- **Status:** todo
- **Phase:** P7
- **Summary:** Deferred (Q2 frozen private-only). Do not implement without new ADR.
- **Depends on:** Product re-open Q2.
- **Acceptance:** N/A until ADR.

#### C05-T23 — Session audit to PostgreSQL
- **Priority:** P3
- **Status:** todo
- **Phase:** stretch
- **Summary:** Optional append-only session metadata for ops; not required for play or high scores.
- **Depends on:** PG available (C-12 infra).
- **Acceptance:** Audit rows do not block create/join if PG down (fail open).

---

## Dependency graph (MVP)

```text
C05-T01 types
C05-T02 tokens ──┐
C05-T03 codes  ──┼─► C05-T04 registry ─► C05-T05 create ─► C05-T06 join
                 │                        │                C05-T07 get
                 │                        ├─► C05-T10 room spawn
                 └─► C05-T11 WS validate ◄┘
                          │
                          ▼
                     C05-T12 reconnect
                          │
              C05-T13 mid-join · C05-T14 ready (P4)
                          │
              C05-T15 TTL · C05-T16 limits · C05-T17 Fly (P5)
                          │
                     C05-T20 harness
```

---

## Suggested implementation order

1. T01 → T02 → T03 → T04  
2. T10 + T05 (create with real room)  
3. T06 → T07 → T08 → T11 → T20  
4. T12 (reconnect with SE-5)  
5. T13 → T14 → T09 → T18 (flow shell)  
6. T15 → T16 → T17 → T19 (persist/deploy hardening)

---

## Collaboration checkpoints

| With | Checkpoint |
|---|---|
| SE-5 (C-06) | Room name, create options, seat reserve API, phase query |
| SE-3 (C-04) | Token storage keys, wsUrl shape, reconnect UX |
| SE-1 (C-01) | Lobby UI fields, ready, soft-unique character picker |
| SE-4 (C-12) | No shared tables required; completion tokens are room/C-12 only |
| SE-8 (C-14) | Health rooms count |

---

## Explicit non-tasks (do not pull into C-05)

- Computing `ScoreReport` or share modifiers  
- Writing high-score rows  
- Sim physics / AI inputs  
- Phaser lobby scene (C-01 owns UI; consumes this API)  
- User registration / login  
