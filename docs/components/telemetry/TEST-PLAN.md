# C-14 — Telemetry & Health — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Interface:** [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) `GET /health`  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-14  
> **Owner cluster:** SE-8 / SE-4

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Health HTTP | `GET /health` shape; optional 503; no secrets/PII |
| Optional ready | `GET /ready` liveness vs readiness split (if implemented) |
| Metrics registry | Gauges (rooms, seats, WS); counters (overrun, disconnect, reconnect, AI/human takeover, sessions) |
| Tick health | budget ≈ 33.3 ms @ 30 Hz; overrun counter; severe &gt;2× budget log |
| Structured logs | JSON lines; `sessionId` correlation; required event keys |
| Redaction | Never log seat/reconnect/completion tokens or auth headers |
| Overhead | Observation must not starve sim (budget guidance) |
| Metrics export | JSON `GET /metrics` snapshot MVP |

### Out of scope

| Out | Owner |
|---|---|
| Full APM product | Ops stretch |
| Distributed multi-region traces | Stretch |
| Client RUM product | Stretch |
| Fixing overruns | Sim owners use metrics |
| High-score business logic | C-12 |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Health | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) `GET /health` |
| Producers | C-05 session lifecycle; room WS; C-06 tick; control flips; C-12 submit |
| Idle causes | [input-commands.md](../../interfaces/input-commands.md) idle thresholds (`idle_20s`, `idle_edge_5s`) |
| Architecture | [ARCHITECTURE.md](../../ARCHITECTURE.md) observability NFRs |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | Counter/gauge inc; overrun boundary; redaction helpers; log schema fields | CI |
| **Property** | Metrics snapshot O(1); no high-cardinality label explosion in registry API | CI |
| **Scenario / integration** | Create room → rooms gauge +1 → close −1; forced slow tick → overrun; AI takeover cause | CI harness |
| **Contract** | `/health` JSON shape | CI |
| **System** | SYS-P1 tick budget uses overrun metrics | Staging |

Coverage pragmatism: registry + health contract fully automated; producer hooks integration-tested with sim/room fakes.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| TEL-01 | /health ok shape | Server process up | GET /health | 200; `{ ok: true, version }`; optional rooms, uptimeSec; no tokens | P0 |
| TEL-02 | /health no PII/secrets | Tokens present in process memory | GET /health | Body never includes seatToken/reconnectToken/names | P0 |
| TEL-03 | /health 503 when critical dep fails | Config ready fails DB if policy says | GET health/ready | Documented 503 for readiness-critical; liveness policy per DESIGN | P1 |
| TEL-04 | Rooms gauge create/close | Metrics + fake registry | create session; close | rooms_active +1 then −1; sessions_created/closed counters | P0 |
| TEL-05 | Seats human/AI gauges | Mixed control seats | update gauges | seats_human / seats_ai match controls | P1 |
| TEL-06 | Tick overrun at budget boundary | budgetMs = 1000/30; observeTick | durations budget-ε, budget+ε, 2×budget+ | No overrun below; overrun above; severe log &gt;2× | P0 |
| TEL-07 | Forced slow tick increments counter | Harness injects slow tick | runSimTick delayed | tick_overrun_total +1; log event `sim.tick_overrun` with sessionId, tick, durationMs, budgetMs | P0 |
| TEL-08 | Disconnect counter by phase | WS drop mid-level | emit disconnect | disconnect_total +1; log seat.disconnect; optional phase label | P1 |
| TEL-09 | Reconnect ok/fail counters | Reconnect success and AUTH fail | complete paths | reconnect ok/fail counters; fail reason | P1 |
| TEL-10 | AI takeover metric by cause | Flip control with cause idle_20s | takeover | ai_takeover_total +1; by_cause.idle_20s; log control.ai_takeover | P0 |
| TEL-11 | AI takeover disconnect cause | Disconnect grace flip | takeover | cause=disconnect counted (INT-04) | P1 |
| TEL-12 | Human takeover metric | Input/join/reconnect flip | human control | human_takeover_total + by cause | P1 |
| TEL-13 | Structured log includes sessionId | Room join/leave | emit logs | sessionId present; seatId when applicable | P0 |
| TEL-14 | Required event keys emit | Lifecycle script | create/close/join/leave/overrun | event keys match DESIGN §6.2 set used | P1 |
| TEL-15 | Redaction strips tokens | Logger helper | log payload with tokens | Tokens stripped/redacted; never at info | P0 |
| TEL-16 | GET /metrics JSON snapshot | Registry populated | GET /metrics | gauges + counters shape; ts; version; no per-player names | P1 |
| TEL-17 | Score submit counter | C-12 success/reject | submit | score_submit_total by result | P2 |
| TEL-18 | Cardinality ban | Attempt per-session label API if any | register metric | API forbids or tests ensure no unbounded session label series | P1 |
| TEL-19 | Observe overhead budget | Hot path observeTick | microbench or assert no alloc storm | Guidance &lt;0.1 ms typical; no log every tick | P2 |
| TEL-20 | WS connections gauge | Open/close connections | count | ws_connections tracks open sockets | P2 |
| TEL-21 | Health unauthenticated | No auth header | GET /health | 200 without credentials | P0 |
| TEL-22 | Version string present | Build injects version | health + metrics | version non-empty | P1 |

---

## 5. Edge cases

| Case | Expected |
|---|---|
| DB down, scores optional | Liveness 200; ready/scores 503 per policy |
| At room capacity | ready may 503; health still ok |
| Multi-room overrun aggregate | Global counters; detail in logs with sessionId |
| Mis-tagged high cardinality | TEL-18; review labels |
| Client RUM | Out of scope MVP — no dual stack |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| In-memory MetricsRegistry | unit increments |
| Fake room registry | rooms gauge |
| Forced slow tick harness | overrun |
| Control flip harness | AI/human causes |
| Captured stdout logger | assert JSON lines |

**Determinism:** Fake clock for tick duration injection. No dependency on wall production traffic. Health tests use test HTTP server.

---

## 7. Mocks / fakes

| Double | Role |
|---|---|
| MetricsRegistry in-memory | gauges/counters |
| Logger capture buffer | structured lines |
| Room/session fake | create/close/join |
| Sim tick fake | observeTick(dt) |
| Optional DB ping mock | ready/health 503 |

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| INT-04 | AI takeover metrics fire with cause |
| INT-05 | Reconnect counters |
| SYS-P1 | Tick budget uses overrun metrics |
| P0 deploy | health for LB |
| P2 exit | Tick lag metric logged |
| P5 | Structured logging polish / ready |

---

## 9. Exit criteria

- [ ] `GET /health` contract green in CI (TEL-01, TEL-02, TEL-21)  
- [ ] Tick overrun counter + structured warn on forced load (TEL-06, TEL-07)  
- [ ] Logs include sessionId on join/leave paths (TEL-13)  
- [ ] AI takeover metric by cause (TEL-10; INT-04)  
- [ ] Redaction rules enforced (TEL-15)  
- [ ] Staging can answer “is tick healthy?” via metrics or logs (SYS-P1)  
- [ ] No high-cardinality session series in metrics API  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Metric cardinality explosion | TEL-18; session detail in logs only |
| Logging every tick | Hot path policy; only overrun logs |
| Liveness vs readiness confusion | Document + TEL-03 |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [lobby-and-scores.md](../../interfaces/lobby-and-scores.md)  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
- [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md)  
- [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md) P0/P2/P5 telemetry gates  
