# C-12 — High Score & Persistence — Tasks

| Field | Value |
|---|---|
| Component | C-12 High Score & Persistence |
| Ownership | SE-4 |
| Task ID scheme | `C12-T##` |
| Depends on | C-07 ScoreReport shape; C-06 end-of-run mint; PostgreSQL (P5) |
| Phases | P0 types · **P5** schema/API/submit · P4 can mock GET for UI |

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
| P3 | Stretch |

---

## Task list

### Foundation

#### C12-T01 — High score DTOs in protocol package
- **Priority:** P0
- **Status:** todo
- **Phase:** P0
- **Summary:** Shared types for `HighScoreRow`, GET response (`top`, `lastRun`, `recentNewIds`), POST request/response, error codes — matching [lobby-and-scores.md](../../interfaces/lobby-and-scores.md).
- **Deliverables:** `packages/protocol` highscore types; align `ScoreReport.completionToken` consumer docs.
- **Depends on:** Protocol package skeleton; netcode `ScoreReport` type (SE-3/5).
- **Acceptance:** Client End/HighScores scenes can type against package without importing server.

#### C12-T02 — Name validation module
- **Priority:** P0
- **Status:** todo
- **Phase:** P5
- **Summary:** Enforce 1–12 length, allowlist charset, trim; pure function unit-tested.
- **Deliverables:** `validation.ts` + tests.
- **Depends on:** —
- **Acceptance:** Empty/oversize/control chars fail; valid initials pass; matches Q7 ephemeral names.

#### C12-T03 — Database client + config
- **Priority:** P0
- **Status:** todo
- **Phase:** P5
- **Summary:** PostgreSQL pool from `DATABASE_URL`; health ping helper for C-14 optional DB check.
- **Deliverables:** `db/client.ts`; env docs.
- **Depends on:** Deploy/Postgres provision (ops).
- **Acceptance:** Local compose PG connects in tests; fails fast on missing URL in prod mode.

#### C12-T04 — Migrations: `high_scores` table
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Create table + indexes per [DESIGN.md](DESIGN.md) §6; UNIQUE(session_id, seat_id).
- **Deliverables:** Migration files; migrate-up in CI/test setup.
- **Depends on:** C12-T03.
- **Acceptance:** Fresh DB migrates clean; index supports top-N query plan (basic explain in notes OK).

#### C12-T05 — Migrations: `score_completions` table
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Durable completion records (token hash, payload JSON, expires_at) so name entry survives restarts.
- **Deliverables:** Migration + completion store repository.
- **Depends on:** C12-T03.
- **Acceptance:** Insert/get-by-hash/delete-expired work; unit/integration against test DB.

---

### Completion pipeline (with C-06)

#### C12-T06 — `recordCompletion` internal API
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** From `ScoreReport`, hash token, persist seats (human, takeGp, sharePercent, character, eligible, submitted=false), set TTL.
- **Deliverables:** Service method; called by room at end-of-run (no HTTP).
- **Depends on:** C12-T05; C-06 emits `ScoreReport`.
- **Acceptance:** After record, POST with raw token can resolve seat payload; raw token not stored.

#### C12-T07 — `recordLastRun` internal API
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Cache last completed session strip for GET `lastRun` (characters, takes, optional names).
- **Deliverables:** Single-row cache table or key + update on completion / submit.
- **Depends on:** C12-T06.
- **Acceptance:** GET includes lastRun after a completion even before any name submit (names optional).

#### C12-T08 — Completion expiry sweeper
- **Priority:** P2
- **Status:** todo
- **Phase:** P5
- **Summary:** Periodically delete expired completion rows.
- **Deliverables:** Interval job or on-access lazy delete.
- **Depends on:** C12-T05.
- **Acceptance:** Expired token POST → UNAUTHORIZED; row removed or ignored.

---

### HTTP API

#### C12-T09 — `GET /api/v1/highscores`
- **Priority:** P1
- **Status:** todo
- **Phase:** P5 (mockable earlier for C-01)
- **Summary:** Return top N (default 25, max 25), `recentNewIds` (last 3 ids), optional `lastRun`.
- **Deliverables:** Hono route + query service; ordering `take_gp DESC, created_at ASC`.
- **Depends on:** C12-T04; C12-T07 for lastRun.
- **Acceptance:** Empty DB → empty top; after inserts order correct; limit clamp works.

#### C12-T10 — `POST /api/v1/highscores` happy path
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Validate token/seat/name; insert authoritative row; mark submitted; return 201 `HighScoreRow`.
- **Deliverables:** Route + transactional service.
- **Depends on:** C12-T02, C12-T06, C12-T04.
- **Acceptance:** takeGp/character/totalHaulGp match completion record, not client body; appears in subsequent GET.

#### C12-T11 — Submit rejection matrix
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Implement contract failures: no/bad token → UNAUTHORIZED; double submit → CONFLICT; AI seat → fail; ineligible → fail; bad name → VALIDATION.
- **Deliverables:** Tests for each branch.
- **Depends on:** C12-T10.
- **Acceptance:** Lobby-and-scores test contract scores half green.

#### C12-T12 — Atomic double-submit protection
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Transaction or UNIQUE constraint ensures concurrent POSTs cannot create two rows.
- **Deliverables:** Integration test with parallel submits.
- **Depends on:** C12-T10.
- **Acceptance:** Exactly one row; second response CONFLICT.

#### C12-T13 — `recentNewIds` / New! support
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** GET returns last three inserted score ids for client “New!” tags.
- **Deliverables:** Query or maintain rolling list on insert.
- **Depends on:** C12-T09, C12-T10.
- **Acceptance:** After 3 new scores, recentNewIds length 3 and matches newest ids; older ids drop out.

#### C12-T14 — Rate limiting on submit
- **Priority:** P2
- **Status:** todo
- **Phase:** P5
- **Summary:** Per-IP (and optional per-token) limits; `RATE_LIMITED` envelope.
- **Deliverables:** Middleware shared pattern with lobby (C-05).
- **Depends on:** C12-T10.
- **Acceptance:** Burst over limit rejected; under limit OK.

#### C12-T15 — Optional GET response cache
- **Priority:** P3
- **Status:** todo
- **Phase:** stretch
- **Summary:** Short TTL in-memory cache; invalidate on POST.
- **Depends on:** C12-T09, C12-T10.
- **Acceptance:** Load test optional; correctness: POST then GET sees new row within invalidate path.

---

### Client / flow collaboration

#### C12-T16 — Mock highscores endpoint for P4 UI
- **Priority:** P1
- **Status:** todo
- **Phase:** P4
- **Summary:** Provide fixture/mock GET (and optional fake POST) so C-01 HighScores + C-11 entry can develop before PG.
- **Deliverables:** Dev-only mock or in-memory store flag `HIGHSCORE_MOCK=1`.
- **Depends on:** C12-T01.
- **Acceptance:** Client attract loop renders top list from mock; switch to real API without client contract change.

#### C12-T17 — Wire End Director submit
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Coordinate with SE-1: after name entry, POST with `ScoreReport.completionToken` + seatId; handle CONFLICT/timeout UX.
- **Deliverables:** Client API helper; no score math on client.
- **Depends on:** C12-T10; C-11 name entry.
- **Acceptance:** Human playtest Session E path: on-screen take matches board row.

#### C12-T18 — Eligibility policy handshake with C-06/C-07
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Document and assert which seats get `eligibleForHighScore=true`; C-12 only enforces flag.
- **Deliverables:** Short note in DESIGN or shared rules doc; fixture reports in tests.
- **Depends on:** ScoreReport emission.
- **Acceptance:** AI always ineligible; abandoned runs never mint usable tokens (room responsibility).

---

### Ops & quality

#### C12-T19 — Deploy migrations on Fly.io
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Migration step in release pipeline; `DATABASE_URL` secret; verify prod top list persists across deploys.
- **Deliverables:** CI/CD snippet or fly release command documented.
- **Depends on:** C12-T04, C12-T05, Fly app (Q6).
- **Acceptance:** Staging: complete run → submit → redeploy → GET still shows score.

#### C12-T20 — Integration test suite in CI
- **Priority:** P1
- **Status:** todo
- **Phase:** P5
- **Summary:** Automated DB tests: unauthorized, conflict, AI reject, happy path, ordering, recentNewIds.
- **Deliverables:** Vitest + testcontainers/compose PG or CI service.
- **Depends on:** C12-T09–T13.
- **Acceptance:** CI green on PR; no reliance on production DB.

#### C12-T21 — Observability
- **Priority:** P2
- **Status:** todo
- **Phase:** P5
- **Summary:** Structured logs for submit success/fail codes; metric counters optional (submits, conflicts).
- **Deliverables:** Log fields `sessionId`, `seatId`, `error.code` (no raw tokens).
- **Depends on:** C12-T10; C-14 patterns.
- **Acceptance:** Failed submit never logs completion token plaintext.

---

### Stretch

#### C12-T22 — Time-windowed New! tags
- **Priority:** P3
- **Status:** todo
- **Phase:** stretch
- **Summary:** Optional 24h New! instead of last-three-ids only.
- **Depends on:** Product ask.
- **Acceptance:** Documented ADR/interface bump if response shape changes.

#### C12-T23 — Admin export / moderation
- **Priority:** P3
- **Status:** todo
- **Phase:** stretch
- **Summary:** Off-line script to list/delete abusive names.
- **Depends on:** Ops need.
- **Acceptance:** No public delete API.

#### C12-T24 — Per-character leaderboards
- **Priority:** P3
- **Status:** todo
- **Phase:** stretch
- **Summary:** Query filter `?character=Gnome`; not MVP.
- **Depends on:** Product ask + interface version.
- **Acceptance:** N/A until requested.

---

## Dependency graph (MVP)

```text
C12-T01 types
C12-T02 name validation
C12-T03 db client
     ├─► C12-T04 high_scores migration
     └─► C12-T05 completions migration
              │
              ▼
         C12-T06 recordCompletion ◄── C-06 ScoreReport
              │
         C12-T07 lastRun
              │
     ┌────────┴────────┐
     ▼                 ▼
C12-T09 GET        C12-T10 POST ─► C12-T11 rejections
     │                 │           C12-T12 atomic
     └──── C12-T13 New! tags ──────┘
              │
         C12-T17 client wire · C12-T19 deploy · C12-T20 CI

C12-T16 mock GET (P4, parallel early)
```

---

## Suggested implementation order

1. **P4 enablement:** T01 → T16 (mock) so SE-1 is unblocked.  
2. **P5 core:** T02 → T03 → T04 → T05 → T06 → T07.  
3. **API:** T10 → T11 → T12 → T09 → T13.  
4. **Ship:** T08 → T14 → T17 → T18 → T19 → T20 → T21.

---

## Collaboration checkpoints

| With | Checkpoint |
|---|---|
| SE-5 (C-06) | When/how `recordCompletion` is invoked; token entropy; eligibility flags |
| SE-6 (C-07) | `takeGp` / `sharePercent` integer/float policy consistency |
| SE-1 (C-11/C-01) | Name entry POST, 60s UX, HighScores GET, New! rendering |
| SE-4 (C-05) | Shared error envelope, rate-limit middleware, health DB ping — no shared score tables with lobby |
| SE-8 (C-14) | Optional DB health; metrics |

---

## Explicit non-tasks (do not pull into C-12)

- Lobby join codes / seat tokens (C-05)  
- Phaser attract animation  
- Share modifier evaluation  
- Computing eligibility beyond trusting the flag (policy lives with room/rules)  
- User accounts or authentication providers  
