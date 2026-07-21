# C-14 — Telemetry & Health — Design

> **Component ID:** C-14  
> **Ownership:** SE-8 (light) / SE-4  
> **Status:** Documentation only (no application code)  
> **Sources:** [ARCHITECTURE.md](../../ARCHITECTURE.md) §2.1 Observability, §9 NFRs; [COMPONENTS.md](../../COMPONENTS.md) C-14; [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) `GET /health`; [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md) P0/P5

---

## 1. Purpose

Provide **operational visibility** for the game process: liveness for load balancers, coarse metrics for rooms/players/AI/tick health, and structured logs keyed by `sessionId`. Enough to run MVP on Fly.io-class hosts without a full APM product.

Goals:

1. `GET /health` for process (and optional dependency) checks.
2. Metrics: active rooms, players, tick budget overrun, disconnects, AI takeovers.
3. Structured logs with correlation ids (`sessionId`, optionally `seatId`, `tick`).
4. Low overhead — never starve the 30 Hz sim.

Non-goals (MVP):

- Full APM (Datadog/New Relic product integration).
- Distributed tracing across multi-region.
- Client RUM product (optional light client logs stretch).
- PII-heavy analytics or ad SDKs.

---

## 2. Responsibilities & non-responsibilities

### Responsibilities

| Area | Detail |
|---|---|
| Health HTTP | `GET /health` (+ optional `GET /ready`) |
| Process metrics | Room count, human/AI seat counts, connections |
| Sim metrics | Tick duration, overrun count, tick lag histogram light |
| Session metrics | Disconnects, reconnects, AI takeovers, human takeovers |
| Logging | JSON (or logfmt) structured logs to stdout |
| Redaction | No seat tokens, reconnect tokens, or raw names in info logs |

### Non-responsibilities

- Fixing tick overruns (sim owners use metrics to tune).
- High-score business logic (C-12).
- Matchmaking quality scores (stretch).
- Replacing host platform metrics (CPU/mem still from Fly/host).

---

## 3. Placement in the system

```text
┌────────────────────────────────────────────┐
│ Game process (Node/TS)                     │
│                                            │
│  HTTP (Hono/Fastify)                       │
│    GET /health  ──► HealthService          │
│    GET /metrics ──► MetricsRegistry (opt)  │
│                                            │
│  Colyseus rooms ── counters ──► Metrics    │
│  Sim tick loop ── timing ─────► Metrics    │
│  Seat control flips ──────────► Metrics    │
│  All of above ── events ──────► Logger     │
└────────────────────────────────────────────┘
         │ stdout                  │ scrape/poll
         ▼                         ▼
   Log drain (Fly)          LB / ops / Grafana agent
```

Telemetry is a **cross-cutting server module**. SE-8 owns the design and initial wiring; SE-4 shares ownership where lobby HTTP lives.

---

## 4. Health endpoints

### 4.1 `GET /health` (MVP — already sketched in lobby contract)

```text
Response 200:
{
  "ok": true,
  "version": string,          // build/git version
  "rooms"?: number,           // active HaulSession count
  "uptimeSec"?: number
}
```

| Check | Behavior |
|---|---|
| Process up | Always if handler runs |
| Optional DB ping | If PostgreSQL configured: `SELECT 1` with short timeout |
| Optional Redis ping | If Redis configured |
| Failure | `ok: false`, HTTP **503** when readiness-critical deps fail |

**Assumption:** Liveness for orchestrators may ignore DB (process can still serve WS); use separate ready probe if needed.

### 4.2 `GET /ready` (recommended split)

```text
// Ready = accept new sessions
{
  "ok": true,
  "rooms": number,
  "maxRooms"?: number,
  "db": "up" | "down" | "skipped",
  "redis": "up" | "down" | "skipped"
}
```

| Scenario | `/health` | `/ready` |
|---|---|---|
| Process boot, DB migrating | 200 ok | 503 |
| At room capacity | 200 ok | 503 (or 200 with shed flag) |
| DB down, scores disabled | 200 ok | 200 if scores optional; 503 if required |

MVP may implement only `/health` with optional `rooms` as in [lobby-and-scores.md](../../interfaces/lobby-and-scores.md).

### 4.3 Auth

Health endpoints are **unauthenticated** but should not expose secrets, tokens, or player PII. Do not put admin diagnostics on public `/health`.

---

## 5. Metrics model

### 5.1 Philosophy

- **Counters** for discrete events (disconnects, takeovers, overruns).
- **Gauges** for current levels (rooms, players).
- **Histograms / summaries** optional for tick ms (light buckets).

Export options (pick one at implement time):

| Option | MVP fit |
|---|---|
| A. JSON `GET /metrics` snapshot | Simplest; poll from ops |
| B. Prometheus text exposition | Best for Fly + Grafana |
| C. Log-based metrics (emit periodic summary lines) | Zero extra port |

**Recommendation:** A for P0; B when deploy hardens (P5).

### 5.2 Required metric set

#### Health / capacity

| Name | Type | Labels | Description |
|---|---|---|---|
| `dhaul_rooms_active` | gauge | — | Active HaulSession rooms |
| `dhaul_seats_human` | gauge | — | Seats with `control=human` across rooms |
| `dhaul_seats_ai` | gauge | — | Seats with `control=ai` |
| `dhaul_ws_connections` | gauge | — | Open WebSocket connections |
| `dhaul_sessions_created_total` | counter | — | Rooms/sessions created |
| `dhaul_sessions_closed_total` | counter | `reason` | closed, empty_ttl, error, complete |

#### Tick / sim

| Name | Type | Labels | Description |
|---|---|---|---|
| `dhaul_tick_duration_ms` | histogram/summary | — | Last/rolling tick wall time |
| `dhaul_tick_overrun_total` | counter | — | Ticks where duration > budget |
| `dhaul_tick_budget_ms` | gauge | — | Config budget (e.g. 33.3 for 30 Hz) |
| `dhaul_tick_lag_ms` | gauge | — | Optional: catch-up lag if loop slips |

**Overrun definition:**

```text
budgetMs = 1000 / tickRate          // 30 Hz → ≈33.333 ms
overrun  = tickWallMs > budgetMs
```

Log a structured warning when `tickWallMs > budgetMs * 2` (severe).

P2 exit criterion from implementation plan: *Tick lag metric logged* — satisfy via overrun counter + periodic tick duration log.

#### Disconnect / reconnect

| Name | Type | Labels | Description |
|---|---|---|---|
| `dhaul_disconnect_total` | counter | `phase` | WS disconnects mid-session |
| `dhaul_reconnect_total` | counter | `result=ok\|fail` | Reconnect attempts |
| `dhaul_reconnect_fail_total` | counter | `reason` | expired, invalid, full |

#### AI takeovers

| Name | Type | Labels | Description |
|---|---|---|---|
| `dhaul_ai_takeover_total` | counter | `cause` | `idle_20s`, `idle_edge_5s`, `disconnect`, `never_joined`, `leave` |
| `dhaul_human_takeover_total` | counter | `cause` | `input`, `join`, `reconnect` |
| `dhaul_ai_control_ratio` | gauge | — | Optional: mean fraction of seats AI across rooms |

Causes align with architecture §6.4 and input-commands idle thresholds.

#### Lobby / API (light)

| Name | Type | Labels | Description |
|---|---|---|---|
| `dhaul_http_requests_total` | counter | `route`, `status` | Optional coarse |
| `dhaul_score_submit_total` | counter | `result` | ok, reject |

### 5.3 `GET /metrics` JSON shape (Option A)

```text
{
  "ts": iso8601,
  "version": string,
  "gauges": {
    "rooms_active": number,
    "seats_human": number,
    "seats_ai": number,
    "ws_connections": number,
    "tick_budget_ms": number,
    "tick_duration_ms_ema": number
  },
  "counters": {
    "tick_overrun_total": number,
    "disconnect_total": number,
    "reconnect_ok_total": number,
    "reconnect_fail_total": number,
    "ai_takeover_total": number,
    "human_takeover_total": number,
    "sessions_created_total": number,
    "sessions_closed_total": number
  },
  "by_cause": {
    "ai_takeover": { "idle_20s": n, "idle_edge_5s": n, "disconnect": n, ... },
    "human_takeover": { "input": n, "join": n, "reconnect": n }
  }
}
```

Do not include per-player names or tokens.

---

## 6. Structured logging

### 6.1 Format

Stdout JSON lines (one event per line):

```text
{
  "level": "info" | "warn" | "error" | "debug",
  "msg": string,
  "ts": iso8601,
  "service": "dhaul-server",
  "version": string,
  "sessionId"?: string,
  "seatId"?: number,
  "roomId"?: string,
  "tick"?: number,
  "phase"?: SessionPhase,
  "event"?: string,           // stable machine key
  "durationMs"?: number,
  "err"?: { "name": string, "message": string, "stack"?: string }
}
```

### 6.2 Required event keys

| `event` | level | When |
|---|---|---|
| `session.created` | info | Room created |
| `session.closed` | info | Room ended (`reason`) |
| `seat.join` | info | Human bound |
| `seat.leave` | info | Human left |
| `seat.disconnect` | warn | WS drop |
| `seat.reconnect` | info | Restored |
| `control.ai_takeover` | info | `cause` field |
| `control.human_takeover` | info | `cause` field |
| `sim.tick_overrun` | warn | `durationMs`, `budgetMs` |
| `sim.tick_overrun_severe` | error | > 2× budget |
| `health.dep_down` | error | DB/Redis fail |
| `score.submit` | info | result |

### 6.3 Correlation

- Every room log line includes `sessionId` (and Colyseus `roomId` if distinct).
- Tick overrun logs include `sessionId` + `tick` + `phase`.
- Request logs for REST include `requestId` (generate UUID per HTTP request).

### 6.4 Redaction

**Never log:**

- `seatToken`, `reconnectToken`, `completionToken`
- Raw Authorization headers  
- Full `InputCommand` streams at info (debug only, sampled)

**Prefer:** seatId, character id, phase, counts.

---

## 7. Instrumentation hooks (producers)

| Producer | What to emit |
|---|---|
| Lobby / session service (C-05) | session created/closed; HTTP metrics optional |
| Room / netcode server | ws connect/disconnect/reconnect; seat join/leave |
| Simulation (C-06) | tick duration; overrun; phase changes |
| Control ownership (room) | AI/human takeover with cause |
| High scores (C-12) | submit result counters |
| Health service | dep ping failures |

### 7.1 Sim tick timing (pseudocode)

```text
t0 = now()
runSimTick()
dt = now() - t0
metrics.observeTick(dt)
if dt > budgetMs:
  metrics.incOverrun()
  log.warn("sim.tick_overrun", { sessionId, tick, durationMs: dt, budgetMs })
```

Keep observation **allocation-light** (reuse objects; avoid string concat on hot path except on overrun).

### 7.2 Takeover instrumentation

On control flip:

```text
metrics.inc("ai_takeover" | "human_takeover", { cause })
log.info("control.ai_takeover", { sessionId, seatId, cause })
// Also emits S2C_Event for clients — telemetry is server-side parallel
```

Causes must be explicit at the flip site (idle timer vs disconnect vs join).

---

## 8. Client telemetry (optional light)

MVP **server-only**. Stretch:

| Client signal | Transport |
|---|---|
| Hard WS errors | Already server-visible |
| Prediction reset spikes | Optional `C2S` debug (off by default) |
| Audio unlock fail | Console only |

Do not build a second metrics stack on the client for MVP.

---

## 9. Performance budget

| Constraint | Target |
|---|---|
| Metrics observe per tick | < 0.1 ms typical |
| Log on hot path | Overruns/errors only; not every tick |
| Cardinality | No high-cardinality labels (no per-session metric series forever) |
| Snapshot endpoint | O(1) read of atomic counters |

Session-level detail belongs in **logs**, not unbounded Prometheus labels.

---

## 10. Deployment & ops use cases

| Question | How answered |
|---|---|
| Is the process alive? | `GET /health` |
| Can we take new rooms? | `GET /ready` or health + rooms gauge |
| Are ticks healthy? | `tick_overrun_total` rate; logs |
| Are players dropping? | `disconnect_total` / reconnect ratios |
| Is AI covering disconnects? | `ai_takeover_total{cause=disconnect}` |
| Idle takeovers too aggressive? | `ai_takeover_total{cause=idle_*}` |

Alert ideas (ops, not code):

- Overrun rate > N/sec for 2 minutes  
- Health 503  
- Disconnect rate spike  
- Rooms gauge unexpected zero on prod traffic  

---

## 11. Testing strategy

| Layer | Cases |
|---|---|
| Unit | Counter/gauge registry increments |
| Unit | Overrun detection boundary at budgetMs |
| Unit | Redaction helpers strip tokens |
| Integration | Create room → health `rooms` increments → close → decrement |
| Integration | Force slow tick in harness → overrun counter + log event |
| Integration | Idle/disconnect flip → `ai_takeover` counter by cause |
| Contract | `GET /health` shape matches lobby doc |

---

## 12. MVP vs stretch

| Feature | MVP | Stretch |
|---|---|---|
| `GET /health` + version + rooms | ✅ | |
| Tick overrun counter + warn log | ✅ | Histogram export |
| Disconnect + AI takeover counters | ✅ | |
| Structured JSON logs + sessionId | ✅ | |
| `GET /metrics` JSON | ✅ | Prometheus |
| `GET /ready` + DB ping | Optional P5 | |
| OpenTelemetry traces | ❌ | ✅ |
| Client RUM | ❌ | ✅ |
| Anomaly dashboards | ❌ | Ops-owned |

---

## 13. File / package placement (future code)

```text
server/src/telemetry/
  health.ts          # routes
  metrics.ts         # registry
  logger.ts          # structured logger
  hooks.ts           # helpers for room/sim
```

No dependency from `packages/rules` or client presentation into telemetry.

---

## 14. Open questions / assumptions

| ID | Question | Assumption |
|---|---|---|
| Q1 | Prometheus vs JSON metrics | JSON snapshot MVP; Prometheus P5+ |
| Q2 | Health fails when DB down? | Liveness stays 200; ready/scores may 503 |
| Q3 | Multi-process aggregation | Host metrics + per-process scrapes; Redis presence later |
| Q4 | Log level default | `info` prod; `debug` dev |
| Q5 | Per-room tick metrics | Log on overrun only; global counters aggregate |

---

## 15. Related docs

- [COMPONENTS.md](../../COMPONENTS.md) — C-14  
- [ARCHITECTURE.md](../../ARCHITECTURE.md) observability row  
- [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) — `/health`  
- [input-commands.md](../../interfaces/input-commands.md) — idle takeover thresholds  
- [IMPLEMENTATION-PLAN.md](../../IMPLEMENTATION-PLAN.md) — P0 health, P2 tick lag, P5 logging  
- [TASKS.md](TASKS.md)  
