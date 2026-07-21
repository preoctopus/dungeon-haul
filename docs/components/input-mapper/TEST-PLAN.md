# C-03 — Input Mapper — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Interface:** [input-commands.md](../../interfaces/input-commands.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-03  
> **Owner cluster:** SE-3

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Mapping core | Keyboard/gamepad device state → `InputCommand` |
| Axes | Ternary `-1\|0\|1`; opposing cancel; analog deadzone + cardinal snap |
| Schemes | `outside` / `level` / `fork` / `end` — scheme set by Shell, not invented by mapper |
| Chord *readiness* | Simultaneous `action` + `axes.y` for server drop/throw — **no** client chord opcode |
| Seq | Monotonic per local seat; first emit policy; scheme change does not reset seq |
| Merge | Keyboard + gamepad OR levels; axes prefer active pad |
| Focus/blur | Clear held keys on blur/visibility hidden |
| Enabled flag | Disabled → neutral or no emit per API |
| Helpers | Optional `wasAnyPressedThisFrame` for audio unlock observers |

### Out of scope

| Out | Owner |
|---|---|
| Network send timing / WS framing | C-04 |
| AI inputs | C-08 |
| Server chord final interpretation (drop/throw/trip) | C-06 |
| Full remappable UI | Stretch |
| Local multi-pad multi-seat | Stretch (Q3) |
| Touch/mobile | Stretch |
| Global pause | Forbidden — Start is boolean only; Shell interprets |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Produces | [input-commands.md](../../interfaces/input-commands.md) `InputCommand` |
| Consumes | C-01 / C-11: `setScheme`, `setEnabled`, focus |
| Consumes | Browser Keyboard / Gamepad API (via thin sources) |
| Feeds | C-04 send loop `sample()` |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | Pure map: key sets → command; deadzone table; merge; seq; scheme switch | CI (no Phaser) |
| **Property** | Axes always in {-1,0,1}; jump/action/start boolean; seq strictly increasing on emit | CI |
| **Component** | Keyboard source synthetic events; gamepad mock poll | CI |
| **Scenario** | Scheme level: B+down chord-ready fields; fork axes.y path; end letter axes | CI |
| **Visual/manual** | Real gamepad + keyboard hybrid; Safari gamepad quirks; blur sticky-key | Manual desktop |

Coverage pragmatism: pure mapper core high coverage; Phaser Input plugin wiring thin + manual.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| INP-01 | Axes clamped to ternary | Synthetic left stick / keys | Sample extremes and mid | axes.x/y ∈ {-1,0,1} only | P0 |
| INP-02 | Opposing axes cancel | Left+right held; up+down held | sample | Both axes 0 | P0 |
| INP-03 | Level: jump/action/start mapping | scheme=level; Z/X/Enter (or defaults) | Press each | jump / action / start true as levels | P0 |
| INP-04 | Chord-ready B+down (no drop opcode) | scheme=level; action+down | sample | action=true, axes.y=-1; **no** invent drop field | P0 |
| INP-05 | Chord-ready B+up throw intent | scheme=level; action+up | sample | action=true, axes.y=+1 | P0 |
| INP-06 | Fork path select axes | scheme=fork; up/down and left/right alias | sample | Path intent on axes.y (or dual-map per design); argue via jump/action | P1 |
| INP-07 | End name-entry axes | scheme=end; arrows | sample | y letter, x slot; jump confirm; action delete; start skip/confirm | P1 |
| INP-08 | Outside any-face discrete fields | scheme=outside; A/B/Start | sample | Discrete booleans set; Shell may OR as “any” | P1 |
| INP-09 | Seq monotonic on emit | sample N times for send | Each handed emit | seq = 1..N strictly increasing | P0 |
| INP-10 | Scheme switch does not reset seq | After seq=5; setScheme(fork) | sample | seq continues 6 (no reset on scheme-only) | P0 |
| INP-11 | resetSeq after Welcome policy | resetSeq() | next sample | seq restarts per C-04 Welcome policy (e.g. 1) | P0 |
| INP-12 | Gamepad deadzone 0.35 | Stick magnitude 0.2 and 0.5 | sample | Below deadzone → 0; above snaps ternary | P0 |
| INP-13 | Gamepad standard button map | Mock standard pad buttons 0/1/9 | sample | jump/action/start | P1 |
| INP-14 | Keyboard + gamepad merge | Pad left + keyboard jump | sample | axes from pad; jump true | P1 |
| INP-15 | Blur clears sticky keys | Hold run/jump; fire blur/visibility hidden | sample | Neutral command; no sticky jump/run | P0 |
| INP-16 | setEnabled(false) | Active then disable | sample / send | Neutral or suppressed per API; no accidental start spam | P1 |
| INP-17 | Gamepad disconnect fallback | Pad active then disconnect | sample | Falls back to keyboard; optional toast is Shell | P1 |
| INP-18 | OS key-repeat ignored for levels | Rapid keydown repeats while held | sample | Level remains true once; not edge spam | P1 |
| INP-19 | No inventory/position fields | Any device state | sample | Command shape contract only | P0 |
| INP-20 | Fork Start may still emit | scheme=fork; Start | sample | start boolean may be true; server ignores for tally (doc) | P2 |
| INP-21 | Select optional | Select key | sample | select optional field or omit consistently | P2 |
| INP-22 | wasAnyPressedThisFrame helper | First key down frame | helper | true once for audio unlock observers | P2 |
| INP-23 | Binding table data-driven | Swap binding fixture | sample | Defaults change without code branch explosion | P2 |

---

## 5. Edge cases

| Case | Expected |
|---|---|
| Tab unfocused / sticky keys | INP-15 clear on blur |
| Dual-input fight | Documented merge; INP-14 |
| Escape vs Start | Escape maps Start role; Shell pause vs leave policy |
| Multi-pad accidental | MVP single seat only; stretch out of suite |
| Heartbeat unchanged state | If C-04 requests sample each tick, seq still increments when emitted |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| Device state snapshots table | Golden: keys/buttons → expected command (minus seq) |
| Deadzone ladder | Magnitudes around 0.35 |
| Scheme matrix | outside/level/fork/end × key set |
| Mock Gamepad | W3C standard mapping indices |

**Determinism:** Pure functions; no wall clock; no network. Seq tests control emit API explicitly.

---

## 7. Mocks / fakes

| Double | Role |
|---|---|
| KeyboardSource synthetic | keydown/keyup sets |
| GamepadSource mock poll | axes/buttons arrays |
| BindingTable fixture | Defaults Z/X/Enter/WASD/Arrows |
| No Phaser | Core tests run in Node |

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| INT-10 | Start does not global-pause; mapper only sets boolean |
| INT-11 | Server validation of command shape — client sends legal fields only |
| C-04 send loop | sample at tickRate; seq ack |
| Sim jump-edge tests | Consume same command shape |
| Human | Desktop keyboard path; gamepad hybrid |

---

## 9. Exit criteria

- [ ] Keyboard produces valid ternary `InputCommand` (P0)  
- [ ] At least one standard gamepad path unit-tested with mocks  
- [ ] Level B+vertical simultaneous fields for drop/throw  
- [ ] Schemes switch without mapper owning network phase  
- [ ] Blur/focus no sticky run/jump  
- [ ] Contract-compliant fields only  
- [ ] Online MVP single local seat documented  
- [ ] Pure core unit-testable without Phaser  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Safari gamepad differences | Manual matrix; mock standard mapping in CI |
| Escape/Start confusion | Document Shell policy; INP-03 |
| Analog diagonal spam | Deadzone + ternary snap tests |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [input-commands.md](../../interfaces/input-commands.md)  
- [netcode-client/TEST-PLAN.md](../netcode-client/TEST-PLAN.md)  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
