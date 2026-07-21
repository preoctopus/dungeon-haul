# C-05 — Lobby & Session Service — Test Plan

| Field | Value |
|---|---|
| Component | **C-05 Lobby & Session Service** |
| Ownership | **SE-4** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contract | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md), [netcode-messages.md](../../interfaces/netcode-messages.md) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Create session | `POST /api/v1/sessions` → joinCode, wsUrl, host seat tokens |
| Join by code | Private 6-char code; capacity FULL |
| Public status | `GET` without secrets |
| Tokens | seat + reconnect issue/hash/verify; no raw logs |
| Soft-unique characters | Clash allowed (Q9); optional characterClash flag |
| Display names | Ephemeral 1–16 allowlist; default Hauler |
| Phase gates | Mid-join lobby/instructions/level/fork; reject end/closed |
| Lifecycle | Empty lobby TTL; join-code hold; no public matchmaking |
| Room spawn | Colyseus haul_session bootstrap; token accepted on WS join |

### Out of scope

| Concern | Owner |
|---|---|
| Sim ticks / treasure | C-06 |
| High-score ranking DB | C-12 |
| Public matchmaking / quick play | Stretch (forbidden MVP) |
| Accounts / OAuth | Forbidden (Q7) |
| Multi-gamepad couch seats | Stretch |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | REST create/join/status; seatToken; reconnectToken; joinCode; seat status |
| **Consumes** | Room phase for join gates; shared token verifier with room |
| **Contract** | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) |

**Freezes:** private codes only; no accounts; soft-unique chars; Fly sticky `wsUrl`.

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Vitest pure helpers | Join code alphabet/normalize; token hash/verify; name validation; seat allocation |
| **Property** | Parallel allocate | Last-seat race: only one winner |
| **Scenario / contract** | HTTP + in-process server | Create → join×3 → 5th FULL; bad code; closed |
| **Integration** | WS test client | Token welcome; reconnect grace; mid-join |

---

## 4. Concrete case table

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| LOB-01 | Create → join×3 → 4th OK → 5th FULL | Fresh server | Create; join 3; fifth join | Fourth human OK; fifth `FULL` | P0 |
| LOB-02 | Bad code NOT_FOUND | No session | Join random code | `NOT_FOUND` | P0 |
| LOB-03 | CLOSED phase reject | Session forced end/closed | Join | `CLOSED` | P0 |
| LOB-04 | Soft-unique character claim | Two seats claim Gnome | claim REST/WS | 200 both; optional characterClash true; no 409 | P0 |
| LOB-05 | Empty lobby TTL cleanup | Create; no humans; short TTL | Advance sweeper | Room disposed; join → NOT_FOUND | P1 |
| LOB-06 | No public matchmaking routes | API surface | Probe list/queue/quickplay | Routes absent / 404 | P0 |
| LOB-07 | Create 201 body contract | Valid create | POST | joinCode, sessionId, wsUrl, hostSeatToken, reconnectToken, seats | P0 |
| LOB-08 | Join code alphabet | Generate 10k codes | Inspect | No `0/O/1/I`; length 6; case-insensitive lookup | P0 |
| LOB-09 | Code normalize case | Create code ABC… | Join lower-case | Success | P0 |
| LOB-10 | Token verify happy | Issued seatToken | Room C2S_Join | Welcome seatId; AUTH on bad token | P0 |
| LOB-11 | Wrong session token | Token from session A on B | Join WS | AUTH reject | P0 |
| LOB-12 | Reconnect within grace | Drop WS; reconnectToken | Rejoin &lt; grace | Same seatId | P0 |
| LOB-13 | Reconnect after grace | Wait &gt; grace | Reconnect | Fail; seat free/AI | P0 |
| LOB-14 | Mid-join during level | Phase level; free seat | REST join | 200; seat allocated | P0 |
| LOB-15 | Mid-join during end | Phase end_* | Join | CLOSED | P0 |
| LOB-16 | Display name default | Empty name create | Create | `"Hauler"` | P1 |
| LOB-17 | Display name validation | Oversize / control chars | Create/join | `VALIDATION` | P1 |
| LOB-18 | GET status no secrets | Active session | GET | phase, joinCode, seats; **no** tokens/hashes | P0 |
| LOB-19 | Concurrent last seat | 2 parallel join on 1 free seat | Race | Exactly one success; other FULL | P0 |
| LOB-20 | Raw tokens never logged | Issue tokens | Spy logger | No raw token strings | P1 |
| LOB-21 | Hash-only store | Issue token | Inspect store | Only SHA-256 hashes | P0 |
| LOB-22 | Rate limit create | Burst creates | Exceed limit | `RATE_LIMITED` | P2 |
| LOB-23 | Rate limit join | Burst bad joins | Exceed | `RATE_LIMITED` | P2 |
| LOB-24 | Room spawn failure | Mock matchMaker throw | Create | 500 INTERNAL; no join code published | P1 |
| LOB-25 | Ready flags mirror | Human ready via WS | GET status | ready true within poll | P1 |
| LOB-26 | Join code hold after close | Close room | Immediate reissue | Hold period before recycle | P2 |
| LOB-27 | No accounts required | Full create/join | Flow | No login/password fields | P0 |

---

## 5. Edge cases

| Edge | Expectation |
|---|---|
| Soft-unique clash | Always allowed |
| Disconnect grace vs new joiner | Seat not double-booked until room releases |
| Process crash | In-memory sessions lost (accepted MVP) |
| Empty lobby vs in-run empty | Different TTLs; in-run AI continue config |
| Soft handoff AI seats | Lobby status reflects room control after Hoard |
| Character claim pre-WS | REST claim OK; room is source of truth once connected |

---

## 6. Fixtures & determinism

| Fixture | Purpose |
|---|---|
| Ephemeral port server | Isolation |
| Shortened TTL config | TTL tests without 10 min wait |
| Fixed grace 30s → test override e.g. 200 ms | Reconnect tests |
| No RNG for codes beyond crypto; assert alphabet properties | Statistical uniqueness via collision retry |

---

## 7. Mocks / fakes

| Fake | Use |
|---|---|
| In-memory registry | Unit seat allocation |
| Fake Colyseus matchMaker | Create failure / success without full sim |
| Protocol WS test client | Token join without Phaser |
| Clock fake / injectable now | TTL and grace |

---

## 8. Exit criteria (CI gates)

- [ ] LOB-01, LOB-02, LOB-03, LOB-04, LOB-06, LOB-07, LOB-08, LOB-10, LOB-12, LOB-14, LOB-18, LOB-19, LOB-21, LOB-27 green  
- [ ] Contract tests from lobby-and-scores.md lobby half  
- [ ] Private codes only; no public queue  
- [ ] Tokens sufficient for WS join without login  
- [ ] INT-07 / INT-08 / INT-01 not broken  

---

## 9. Integration & system links

| Doc / ID | Relationship |
|---|---|
| INT-01 Full short run | Create/join path |
| INT-05 Reconnect | LOB-12/13 + sim |
| INT-07 Room codes (if catalogued) | Code join |
| INT-08 Mid-join | LOB-14/15 |
| SYS-H1 | Product create room |
| C-12 | completionToken not issued by lobby |
| C-04 | Consumes wsUrl + tokens |

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Code collision space | Alphabet + retry + LOB-08 |
| Multi-instance without Redis | Single process MVP; document split-brain |
| Rate-limit false positives | Tunable limits; LOB-22 soft P2 |

---

## 11. Traceability

| Design section | Cases |
|---|---|
| §6 Join codes | LOB-08–09 |
| §7 REST API | LOB-01–03, LOB-07, LOB-14–18 |
| §8 Lifecycle TTL | LOB-05, LOB-12–13, LOB-26 |
| §9 Room / tokens | LOB-10–11, LOB-20–21, LOB-24 |
| §10 Soft-unique | LOB-04 |
| §11 Security | LOB-20–22, LOB-27 |
| §15 Testing strategy | This document |
