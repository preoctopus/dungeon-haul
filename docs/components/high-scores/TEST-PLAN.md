# C-12 — High Score & Persistence — Test Plan

| Field | Value |
|---|---|
| Component | **C-12 High Score & Persistence** |
| Ownership | **SE-4** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contract | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md), [netcode-messages.md](../../interfaces/netcode-messages.md) (`ScoreReport`) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Schema / migrations | `high_scores`, `score_completions` |
| GET top list | Top N default/max 25; ordering; empty DB |
| Submit POST | Token, seat, name → 201 row |
| Anti-cheat | Ignore client takeGp; use completion record |
| Rejects | Bad/missing token; double submit; AI; ineligible; bad name |
| recentNewIds | Last 3 inserted ids (“New!”) |
| lastRun strip | Cached after ScoreReport |
| Rate limits | Submit spam |
| Name rules | 1–12, allowlist charset (Q7 ephemeral) |

### Out of scope

| Concern | Owner |
|---|---|
| Attract scroll animation | C-01 / C-02 |
| Computing takes / modifiers | C-07 via C-06 |
| Name-entry 60s UI timer | C-11 |
| Accounts / friends boards | Forbidden |
| Client edit/delete scores | Forbidden |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `GET/POST /api/v1/highscores`; internal `recordCompletion`, `recordLastRun` |
| **Consumes** | `ScoreReport.completionToken` + seat eligibility from C-06/C-07 |
| **Contract** | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) scores half |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Vitest | Name validation; limit clamp; eligibility matrix; ordering helpers |
| **Property** | Parallel POST | Exactly one row under double-submit race |
| **Scenario / integration** | Test PG (or compose) | Full submit → list → recentNewIds; migrations |
| **Mock mode** | In-memory HIGHSCORE_MOCK | P4 UI without PG |

---

## 4. Concrete case table

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| HS-01 | Valid human submit 201 | Completion recorded; human eligible | POST name | 201 HighScoreRow; takeGp from record not body | P0 |
| HS-02 | Missing token fail | No completionToken | POST | UNAUTHORIZED | P0 |
| HS-03 | Invalid/expired token | Bad hash or past expiresAt | POST | UNAUTHORIZED | P0 |
| HS-04 | Double submit CONFLICT | Successful first POST | Second POST same seat | CONFLICT; single DB row | P0 |
| HS-05 | AI seat reject | Completion seat human=false | POST | Reject (UNAUTHORIZED) | P0 |
| HS-06 | Ineligible seat | eligibleForHighScore false | POST | Reject | P0 |
| HS-07 | Name validation 1–12 | Empty, 13 chars, control chars, valid | validate / POST | Fail empty/oversize/control; pass valid | P0 |
| HS-08 | Client cannot inflate takeGp | Body with huge takeGp field if sent | POST | Stored takeGp matches completion | P0 |
| HS-09 | List top 25 ordering | Insert 30 scores various take_gp | GET limit=25 | 25 rows; take_gp DESC, created_at ASC ties | P0 |
| HS-10 | Limit clamp | limit=100 or 0 | GET | Clamped 1..25 | P1 |
| HS-11 | Empty DB list | Fresh migrate | GET | top=[]; no error | P1 |
| HS-12 | recentNewIds last 3 | Insert 5 scores | GET | recentNewIds length 3 = newest ids | P0 |
| HS-13 | lastRun after completion | recordLastRun; no submits yet | GET | lastRun present; names optional | P1 |
| HS-14 | lastRun merges names | Submit one human of last run | GET | Name appears in strip | P1 |
| HS-15 | UNIQUE session+seat | Parallel double POST | Race | Exactly one row; one CONFLICT | P0 |
| HS-16 | Migration clean up | Empty DB | migrate | Tables + indexes exist | P0 |
| HS-17 | Completion hash only | recordCompletion | Inspect store | Raw token not stored | P0 |
| HS-18 | Expiry sweeper | Expired completion | POST / sweep | UNAUTHORIZED; row removed or ignored | P1 |
| HS-19 | Bad seatId | seatId 9 | POST | VALIDATION | P1 |
| HS-20 | Rate limited submit | Burst POSTs | Exceed limit | RATE_LIMITED | P2 |
| HS-21 | Mock mode contract | HIGHSCORE_MOCK=1 | GET/POST | Same shapes as real; UI unblocked | P1 |
| HS-22 | rulesetVersion stored | Submit | Row | ruleset_version from completion | P1 |
| HS-23 | Multi-human same session | 2 eligible humans | Two POSTs | Two rows different seat_id same session_id | P0 |
| HS-24 | No accounts on submit | API | POST only token+seat+name | No userId/password | P0 |

---

## 5. Edge cases

| Edge | Expectation |
|---|---|
| Empty hand / 0 takeGp | Allowed if eligible (still a valid row) |
| Soft-unique characters | Board stores character from completion |
| Process bounce mid-entry | PG completion store survives (option B) |
| Tie take_gp | Earlier created_at ranks higher |
| XSS in name | Allowlist only; render as text |
| Token brute force | Rate limit + high entropy + TTL |

---

## 6. Fixtures & determinism

| Fixture | Purpose |
|---|---|
| Test `CompletionRecord` builders | Fixed takeGp/sharePercent/seats |
| Seeded timestamps optional | Ordering ties |
| Docker/compose Postgres | Integration parity |
| Fixed token string → known hash | Unit verify path |

No ambient RNG for list ordering tests.

---

## 7. Mocks / fakes

| Fake | Use |
|---|---|
| In-memory completion map | Early unit without PG |
| HIGHSCORE_MOCK store | Client UI P4 |
| Fake clock | Expiry tests |
| Do not mock take math | Trust C-07 fixtures for completion payloads |

---

## 8. Exit criteria (CI gates)

- [ ] HS-01..08, HS-09, HS-12, HS-15..17, HS-23–24 green  
- [ ] Lobby-and-scores scores half contract green  
- [ ] Migrations run in CI test setup  
- [ ] P5: scores survive deploy (PG)  
- [ ] INT-12 (scores path) green when catalogued  
- [ ] AI never appears on board  

---

## 9. Integration & system links

| Doc / ID | Relationship |
|---|---|
| INT-01 step 11 | Optional submit after report |
| SYSTEM-TEST end → board | On-screen take matches row |
| C-07 eligibility | eligibleForHighScore flag |
| C-06 ScoreReport mint | completionToken |
| C-11 name entry | POST after cinematic |
| lobby-and-scores test contract | HS-02, HS-04, HS-05 |

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Token leakage in logs | HS-17; no raw token log |
| Submit spam | HS-20 rate limit |
| In-memory completion loss | Prefer PG score_completions for ship |

---

## 11. Traceability

| Design section | Cases |
|---|---|
| §5 REST | HS-01–13, HS-19–20 |
| §6 Schema | HS-15–16, HS-22 |
| §7 Names | HS-07 |
| §8 New! | HS-12 |
| §9 Eligibility | HS-05–06 |
| §11 Security | HS-08, HS-17, HS-20, HS-24 |
| §14 Testing strategy | This document |
