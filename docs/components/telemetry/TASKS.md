# C-14 — Telemetry & Health — Tasks

> **Component ID:** C-14  
> **Ownership:** SE-8 (light) / SE-4  
> **Task ID prefix:** `C14-T##`  
> **Design:** [DESIGN.md](DESIGN.md)  
> **Depends on:** Server HTTP shell (C-05), room/sim hooks (C-06), deploy (P5)

Documentation / planning tasks only in this phase. Implementation sequenced for build phases; no application code here.

---

## Phase alignment

| Plan phase | Telemetry work |
|---|---|
| **P0** | Health endpoint; logger stub; version string |
| **P2** | Tick lag / overrun metric logged; seat counters |
| **P3** | AI takeover counters |
| **P5** | Structured logging polish; ready/DB ping; metrics export |

---

## Tasks

### C14-T01 — Freeze health response contract

**Goal:** Align DESIGN §4 with [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) `GET /health`.  
**Acceptance:**

- [ ] Fields: `ok`, `version`, optional `rooms`, optional `uptimeSec`  
- [ ] 503 policy documented for failed critical deps  
- [ ] No tokens/PII in body  
- [ ] SE-4 + SE-8 agree on liveness vs readiness split  

---

### C14-T02 — Freeze metrics catalog

**Goal:** Approve required gauges/counters in DESIGN §5.2.  
**Depends on:** C14-T01  
**Acceptance:**

- [ ] Rooms, human/AI seats, WS connections listed  
- [ ] Tick overrun + budget defined  
- [ ] Disconnect/reconnect counters listed  
- [ ] AI/human takeover counters with `cause` enum  
- [ ] High-cardinality ban stated (no per-session Prometheus labels)  

---

### C14-T03 — Structured log schema

**Goal:** Finalize JSON line fields and required `event` keys (DESIGN §6).  
**Acceptance:**

- [ ] Field list stable  
- [ ] Redaction rules explicit  
- [ ] Correlation via `sessionId` required on room paths  

---

### C14-T04 — Implement `GET /health`

**Goal:** Wire health route on server HTTP app.  
**Phase:** P0  
**Depends on:** HTTP framework bootstrap  
**Acceptance:**

- [ ] Returns 200 `{ ok: true, version }` when process up  
- [ ] Includes `rooms` when room registry available  
- [ ] Contract test in CI  
- [ ] Documented in lobby interface (already sketched)  

---

### C14-T05 — Logger module

**Goal:** stdout structured logger with levels.  
**Phase:** P0–P2  
**Depends on:** C14-T03  
**Acceptance:**

- [ ] `info/warn/error/debug` helpers  
- [ ] Child logger binds `sessionId`  
- [ ] Errors include safe `err` object  
- [ ] Debug can be disabled in prod via env  

---

### C14-T06 — Metrics registry (in-process)

**Goal:** Thread-safe enough counters/gauges for single Node process.  
**Phase:** P2  
**Depends on:** C14-T02  
**Acceptance:**

- [ ] `inc`, `set`, `observeTick` APIs  
- [ ] Snapshot for JSON export  
- [ ] Unit tests for increment/reset boundaries  
- [ ] No heavy allocations on tick observe  

---

### C14-T07 — Room / player gauges

**Goal:** Update gauges on room create/dispose and seat control changes.  
**Phase:** P2  
**Depends on:** C14-T06, C-05 room registry  
**Acceptance:**

- [ ] `rooms_active` tracks live rooms  
- [ ] `seats_human` / `seats_ai` accurate after join/leave/AI fill  
- [ ] `ws_connections` tracks open sockets  
- [ ] Integration: create→join→close moves gauges  

---

### C14-T08 — Tick overrun instrumentation

**Goal:** Measure each sim tick; count and log overruns.  
**Phase:** P2  
**Depends on:** C-06 tick loop, C14-T05, C14-T06  
**Acceptance:**

- [ ] `budgetMs = 1000 / tickRate`  
- [ ] `tick_overrun_total` increments when `dt > budget`  
- [ ] Warn log `sim.tick_overrun` with `sessionId`, `tick`, `durationMs`  
- [ ] Severe log when `dt > 2 * budget`  
- [ ] Satisfies P2 exit: “Tick lag metric logged”  

---

### C14-T09 — Disconnect / reconnect metrics

**Goal:** Count disconnects and reconnect results.  
**Phase:** P2–P5  
**Depends on:** Room net lifecycle  
**Acceptance:**

- [ ] `disconnect_total` with optional `phase` label/field  
- [ ] `reconnect` ok/fail counters  
- [ ] Structured logs on disconnect/reconnect  
- [ ] Fail reasons: expired, invalid, etc.  

---

### C14-T10 — AI takeover metrics

**Goal:** Count AI and human takeovers by cause.  
**Phase:** P3  
**Depends on:** Control flip sites (idle 20s, edge 5s, disconnect, join, input)  
**Acceptance:**

- [ ] `ai_takeover_total` causes: `idle_20s`, `idle_edge_5s`, `disconnect`, `never_joined`, `leave`  
- [ ] `human_takeover_total` causes: `input`, `join`, `reconnect`  
- [ ] Log events `control.ai_takeover` / `control.human_takeover`  
- [ ] Independent of `S2C_Event` (server metrics even if client misses event)  

---

### C14-T11 — `GET /metrics` JSON snapshot

**Goal:** Ops-pollable metrics endpoint.  
**Phase:** P2–P5  
**Depends on:** C14-T06–T10  
**Acceptance:**

- [ ] Shape matches DESIGN §5.3 (or documented delta)  
- [ ] Unauthenticated but non-sensitive  
- [ ] O(1) snapshot  
- [ ] Optional: disable via env in hardened deploys  

---

### C14-T12 — Optional DB/Redis health probes

**Goal:** Dependency checks for readiness.  
**Phase:** P5  
**Depends on:** PostgreSQL (C-12), Redis optional  
**Acceptance:**

- [ ] Short timeout pings  
- [ ] Failure → log `health.dep_down`  
- [ ] Document effect on `/health` vs `/ready`  
- [ ] Scores path may degrade without killing WS liveness  

---

### C14-T13 — `GET /ready` (optional split)

**Goal:** Separate readiness from liveness if orchestrator needs it.  
**Phase:** P5  
**Depends on:** C14-T12  
**Acceptance:**

- [ ] Returns 503 when not accepting sessions (capacity/deps)  
- [ ] Fly/Docker probe notes in deploy docs (when they exist)  

---

### C14-T14 — Score submit telemetry

**Goal:** Counter + log for high-score submit outcomes.  
**Phase:** P5  
**Depends on:** C-12  
**Acceptance:**

- [ ] `score_submit_total` by result  
- [ ] No completion tokens in logs  

---

### C14-T15 — Periodic process summary log

**Goal:** Emit low-frequency summary (e.g. 60s) of gauges for log-only ops.  
**Phase:** P5  
**Depends on:** C14-T06  
**Acceptance:**

- [ ] Interval configurable  
- [ ] Includes rooms, seats, overrun total delta  
- [ ] Does not log per-tick  

---

### C14-T16 — Integration test suite

**Goal:** Automated coverage for health + metrics hooks.  
**Phase:** P2–P5  
**Acceptance:**

- [ ] Health contract test  
- [ ] Overrun forced in harness  
- [ ] Takeover counter by cause  
- [ ] Room gauge lifecycle  

---

### C14-T17 — Prometheus export (stretch)

**Goal:** Text exposition if ops requests it.  
**Phase:** P5+ / stretch  
**Depends on:** C14-T11  
**Acceptance:**

- [ ] Standard names from DESIGN §5.2  
- [ ] No high-cardinality labels  
- [ ] Document scrape path  

---

### C14-T18 — Docs sync after implementation

**Goal:** Update DESIGN with actual routes, env vars, metric names.  
**Phase:** First telemetry PR  
**Acceptance:**

- [ ] Env vars listed (`LOG_LEVEL`, `METRICS_ENABLED`, …)  
- [ ] COMPONENTS.md ownership still accurate  

---

## Out of scope (explicit)

| Item | Reason |
|---|---|
| Full APM vendor lock-in | Stretch / ops choice |
| Distributed tracing MVP | Non-goal |
| Client analytics SDK | Non-goal |
| PII player behavior warehouses | Non-goal |
| Alert manager rules as code | Ops stretch |

---

## Dependency summary

```text
C14-T01 → C14-T04
C14-T02 → C14-T06 → C14-T07
                  ↘ C14-T08
                  ↘ C14-T09
                  ↘ C14-T10
                  ↘ C14-T11 → C14-T17
C14-T03 → C14-T05 → (all log sites)
C14-T12 → C14-T13
C-12 → C14-T14
C14-T06 → C14-T15
C14-T04..T10 → C14-T16
```

## Cross-component handoffs

| Component | Handoff |
|---|---|
| C-05 Lobby | Session create/close; mount `/health` |
| C-06 Sim | Tick timing wrapper |
| Room / net | Disconnect, reconnect, control flips |
| C-08 AI | No direct dep — takeovers owned at room control layer |
| C-12 Scores | Submit results |
| C-13 Audio | None (client) |
