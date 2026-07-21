# C-04 — Netcode Client — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Interface:** [netcode-messages.md](../../interfaces/netcode-messages.md), [input-commands.md](../../interfaces/input-commands.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-04  
> **Owner cluster:** SE-3

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| WS lifecycle | connect → Join → Welcome; leave; error; timeout |
| Connection FSM | idle/connecting/joining/playing/reconnecting/lost/closed |
| Outbound | `C2S_Input` ~tickRate; Ready/Claim/Leave/Ping/EndSkip/NameEntry |
| Inbound apply | Snapshot, Event queue, PhaseChange, ScoreReport, ForkState, SeatUpdate, Error, Pong |
| Prediction | Local hauler kinematics only; pending input buffer |
| Reconciliation | `lastProcessedInputSeq` ack; replay pending; carry/stun always server |
| Remote interpolation | Buffer + delay; local not on interp path |
| Reconnect tokens | sessionStorage save/load/clear; re-Join with token; grace fail |
| Client world view | Read model for C-01/C-02; no client-authored scores |
| Metrics getters | RTT, pending depth, reconnect attempts (optional HUD) |

### Out of scope

| Out | Owner |
|---|---|
| Rendering sprites/camera | C-02 |
| Lobby HTTP create/join | C-05 / Shell |
| Authoritative physics | C-06 |
| Score math | C-07 |
| Binary/msgpack, delta compression | Stretch |
| Multi-seat one client, spectator | Stretch |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Wire | [netcode-messages.md](../../interfaces/netcode-messages.md) all C2S/S2C |
| Inputs | [input-commands.md](../../interfaces/input-commands.md) |
| Lobby tokens | [lobby-and-scores.md](../../interfaces/lobby-and-scores.md) seat/reconnect tokens |
| Architecture | [ADR-002](../../decisions/ADR-002-multiplayer-netcode.md) |
| Produces | `ClientWorldView`, connection state for Shell |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | JSON codec round-trip; token store; FSM table; reconcile; interp midpoint; seq send | CI pure TS + mock Storage/WS |
| **Property** | lastProcessedSeq never applies pending ≤ ack; seq outbound monotonic | CI |
| **Scenario** | Mock WS: join→inputs→snapshots; drop→reconnect→snapshot resync | CI |
| **Integration** | Live room two clients positions; INT-05 reconnect; INT-02 lag comfort | Integration plan |
| **System** | SYS-H2/H3, SYS-F3 disconnect | System plan |

Coverage pragmatism: core net/prediction modules **no Phaser**; high unit coverage on reconcile + FSM. Live network flaky cases limited to integration.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| NETC-01 | Join → Welcome → playing | Mock WS returns Welcome + snapshot | connect with tokens | State playing; seatId/tickRate stored; world view from snapshot | P0 |
| NETC-02 | Join timeout → lost | Mock silent socket | connect; advance fake clock past timeout | State lost; socket closed | P0 |
| NETC-03 | PROTOCOL error hard fail | Welcome path sends S2C_Error PROTOCOL | join | State lost/closed; Shell-surfacable error; no silent ignore | P0 |
| NETC-04 | AUTH clears tokens | Error AUTH on join/reconnect | receive AUTH | Tokens cleared; lost | P0 |
| NETC-05 | Seq monotonic send | Mapper samples fixed command | Send loop N ticks | Outbound seq strictly increasing; rate ≤ tickRate×2 | P0 |
| NETC-06 | Snapshot + lastProcessedSeq reconcile | Pending inputs 1..10; snapshot ack=7 | apply snapshot | Drop ≤7; replay 8..10; local baseline server then replay | P0 |
| NETC-07 | Carry/stun always from server | Pending predicts move; snapshot carry differs | reconcile | Carry/stunned from snapshot; not invented by client | P0 |
| NETC-08 | Soft vs hard correct | Small error &lt; threshold vs large | reconcile | Small blend/snap soft; large hard snap | P1 |
| NETC-09 | Remote interpolation midpoint | Two snapshots remote hauler t0/t1 | render at mid delay | Position between snapshots; local seat not interpolated | P0 |
| NETC-10 | Interp underrun holds | Single snapshot only | update render | Hold last; no long extrapolate | P1 |
| NETC-11 | Events queue for consumers | S2C_Event spill | receive | eventsQueue contains event; consumers drain; reconnect does not invent missed SFX | P0 |
| NETC-12 | PhaseChange notifies Shell | S2C_PhaseChange level→fork | receive | Phase exposed; Shell callback/event; net does not load Phaser scenes | P0 |
| NETC-13 | ScoreReport stored not computed | S2C_ScoreReport fixture | receive | scoreReport stored; no take math client-side | P0 |
| NETC-14 | Token store sessionStorage round-trip | Mock Storage | save/load/clear | Bundle sessionId, wsUrl, seatToken, reconnectToken, seatId | P0 |
| NETC-15 | Unexpected drop → reconnecting | playing + token; socket close | drop | reconnecting; backoff attempts; re-Join with reconnectToken | P0 |
| NETC-16 | Reconnect Welcome full resync | Mid-level inventory on server | reconnect success | Snapshot restores view; prediction buffer cleared; mapper resetSeq | P0 |
| NETC-17 | Grace expired AUTH/fail | Fail reconnects | exhaust backoff / AUTH | lost; clear tokens | P0 |
| NETC-18 | Intentional leave no reconnect | playing | leave() | C2S_Leave; clear tokens; no auto-reconnect | P0 |
| NETC-19 | FULL error path | Join FULL | receive | lost; Shell can return to join UI | P0 |
| NETC-20 | Unknown message type ignore | type "future_x" | receive | Log+ignore; no throw | P1 |
| NETC-21 | Malformed JSON threshold | N bad frames | receive | After threshold → reconnect path | P1 |
| NETC-22 | Ping/Pong RTT | Fake clock | ping then pong | RTT = now - clientTime | P2 |
| NETC-23 | EndSkip / NameEntry outbound | Shell calls APIs | send | Correct C2S types; not confused with Input | P1 |
| NETC-24 | Ready / ClaimCharacter | Lobby actions | send | On-change messages only | P1 |
| NETC-25 | Treasures/traps hard-correct | Snapshot ownership flip | apply | Client world treasures match snapshot; no predict ownership | P0 |
| NETC-26 | No client-authored positions outbound | Any state | inspect sends | Only inputs/commands; never authority positions | P0 |
| NETC-27 | Tab background large correction | Resume after stall | large snapshot delta | Hard correct OK; FSM stays playing if socket alive | P1 |
| NETC-28 | Codec fixtures all MVP types | Fixture pack | round-trip | Join, Welcome, Input, Snapshot, Error, Event, Pong, Phase, ScoreReport, Fork, Seat | P0 |

---

## 5. Edge cases

| Case | Expected |
|---|---|
| Mid-game stall (no messages N s) | Treat as drop → reconnect |
| Rubber-band high RTT | Soft correct thresholds; predict only movement |
| Prediction divergence throw/carry | Carry always server (NETC-07) |
| Double connect | FSM rejects or replaces prior socket cleanly |
| Tokens never logged in prod | Security posture check (static/code review + unit redaction if logger shared) |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| Mock WebSocket | Scripted open/message/close |
| Welcome + WorldSnapshot pack | Baseline haulers/treasures |
| Input tape | Fixed seq series for reconcile |
| Fake clock | Send loop, join timeout, backoff |
| sessionStorage mock | Token store |

**Determinism:** No real network in unit layer. Interpolation tests use fixed timestamps. Prediction uses deterministic kinematics helper with fixed dt.

---

## 7. Mocks / fakes

| Double | Role |
|---|---|
| Mock WS server | Integration-style unit scenarios |
| Fake InputMapper | Fixed or scripted `sample()` / `resetSeq` |
| Mock Storage | sessionStorage |
| Fake clock | timers/backoff |
| Optional shared kinematics stub | Predict/reconcile |

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| INT-05 | Reconnect mid-level |
| INT-02 | Lag / delayed inputs comfort |
| INT-01 | Full path snapshots |
| INT-10 | Start input is not pause protocol (Shell/local) |
| INT-11 | Illegal client messages rejected server-side |
| SYS-H2/H3 | Two/four clients share positions |
| SYS-F3 | Disconnect & reconnect |
| Contract tests | Shared netcode-messages § Test contract consumer side |

---

## 9. Exit criteria

- [ ] P2: two clients share positions via this client  
- [ ] Join→Welcome→snapshots update world view  
- [ ] Monotonic seq + reconcile on lastProcessedSeq  
- [ ] Local predict run/jump; remotes interpolate  
- [ ] Grace reconnect restores seat view from snapshot without inventing inventory  
- [ ] Connection states drive Shell UX  
- [ ] No client-authored scores or inventories  
- [ ] Unit suite pure TS green in CI  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Rubber-banding | NETC-08 thresholds |
| Predictor ≠ server physics | Shared helpers; authority snap |
| Scope multi-seat | Explicit stretch; single seat MVP tests only |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [netcode-messages.md](../../interfaces/netcode-messages.md)  
- [input-mapper/TEST-PLAN.md](../input-mapper/TEST-PLAN.md)  
- [client-shell/TEST-PLAN.md](../client-shell/TEST-PLAN.md)  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
- [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md)  
