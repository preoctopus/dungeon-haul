# Dungeon Haul — Integration Test Plan

> **Scope:** Cross-component automated/integration scenarios (not pure unit, not full browser product matrix).  
> **Documentation only** — describe plans; no test code.  
> **Contracts:** [netcode-messages.md](../interfaces/netcode-messages.md), [input-commands.md](../interfaces/input-commands.md), [lobby-and-scores.md](../interfaces/lobby-and-scores.md), [share-modifier-api.md](../interfaces/share-modifier-api.md), [level-format.md](../interfaces/level-format.md)

**Freezes:** private codes; desktop browsers; 960×540; no accounts; no global pause; `levelsAfterHoard` default **2**; soft-unique chars; **no peer host** (server owns room).

---

## 1. Purpose

Verify that components wired through published interfaces behave correctly together:

- Lobby REST ↔ seat tokens ↔ Colyseus room  
- Inputs ↔ authoritative sim ↔ snapshots/events  
- AI fill, reconnect, mid-join  
- Fork tallies and end `ScoreReport` / share payout correctness  

Harness preference: **in-process server + lightweight WS clients** (Vitest). Full Phaser not required for this plan (system/E2E covers browsers).

---

## 2. Environments & fixtures

| Item | Spec |
|---|---|
| Server | Single Node process; ephemeral port |
| DB | SQLite or test Postgres container for score paths; in-memory OK if API identical |
| Redis | Optional off for single-process tests |
| Levels | `box_level` (empty platforms), `hoard_01` (treasure slots) |
| Config | `levelsAfterHoard=2`, tickRate=30, reconnectGrace≈30s, idle AI 20s / edge 5s |
| RNG | Fixed `rngSeed` per case |
| Clients | Protocol test clients A–D; no real accounts (ephemeral `displayName`) |

### Shared preconditions

1. Protocol version match.  
2. Health `GET /health` → ok before suite.  
3. Clean room registry between tests.

---

## 3. Scenario catalog

### INT-01 — Full short run path (happy)

**Components:** C-05, C-04, C-06, C-07, C-09, C-10, C-12 (report only)

| Step | Action | Expect |
|---|---|---|
| 1 | `POST /sessions` | `joinCode`, `seatToken`, `wsUrl` |
| 2 | Client A join WS | `S2C_Welcome` seatId, seed, phase `lobby` |
| 3 | Clients B,C join by code (or AI fill later) | 3 humans or 1+AI |
| 4 | Claim characters (soft-unique) | Prefer distinct; clash allowed per policy |
| 5 | Ready-up → Instructions | Phase change; **no AI on Instructions** |
| 6 | All active humans exit right | Phase → Level Hoard |
| 7 | AI fills empty seats from Hoard | Always 4 haulers; `S2C_SeatUpdate` |
| 8 | All exit Hoard | Fork (if configured) or next level |
| 9 | Complete `levelsAfterHoard` (2) levels | `levelsCompleted` increments |
| 10 | End phases | `S2C_ScoreReport` authoritative |
| 11 | Optional score submit with `completionToken` | Human seats only |

**Pass:** Report sums of takes ≈ total haul GP (remainder policy); phase never stuck; 4 seats always after Hoard.

**Fail examples:** Client-computed takes differ; AI present on Instructions; fewer than 4 haulers in Game State.

---

### INT-02 — Fork under lag / delayed inputs

**Components:** C-04, C-06, C-10

| Step | Action | Expect |
|---|---|---|
| 1 | Reach Fork with 2 humans on opposite paths | `S2C_ForkState` options + tallies |
| 2 | Client A spams argue pulses (jump/action) | Tally A increases server-side |
| 3 | Client B delayed: buffer inputs 100–200 ms / drop 30% packets | Server still authoritative |
| 4 | Vote window ends | Winner = higher mash; both clients get same next `levelId` |
| 5 | Tie case (equal tallies) | Documented tie policy applied identically |

**Pass:** No client-side fork winner; lagging client does not “steal” win via local count; phase → Level with consistent path.

**Notes:** Use test client artificial delay; do not require real network impairment hardware.

---

### INT-03 — Treasure steal after stun

**Components:** C-06, C-04 (events), C-07 stats hooks

| Step | Action | Expect |
|---|---|---|
| 1 | Seat 0 picks up treasure T | Event `pickup`; ownerSeatId=0 |
| 2 | Seat 1 trips/pushes or trap stuns seat 0 | Event `stun` + `spill`; T free in world |
| 3 | Seat 0 has pickup lockout | Seat 0 cannot re-grab immediately |
| 4 | Seat 1 picks up T during lockout | `pickup` seat 1; exclusive ownership |
| 5 | Snapshot both clients | Same owner; no dual carry |

**Pass:** Ownership race resolved server-only; instance ID conserved; lockout Sonic-style.

**Invariant:** At most one owner per instance; free XOR carried.

---

### INT-04 — AI takeover (idle & disconnect grace)

**Components:** C-06, C-08, C-04

#### INT-04a — Idle 20s

| Step | Action | Expect |
|---|---|---|
| 1 | Human seat sends inputs then silence | — |
| 2 | Advance virtual time ≥ 20s | Event `ai_takeover`; `control=ai` |
| 3 | AI produces `InputCommand` each tick | Hauler still moves/acts |
| 4 | Human sends input again | `human_takeover`; control restored |

#### INT-04b — Edge pressure 5s

| Step | Action | Expect |
|---|---|---|
| 1 | Position hauler at camera-edge pressure condition | Flag set server-side |
| 2 | No packets 5s | AI takeover earlier than 20s |

#### INT-04c — Disconnect during grace

| Step | Action | Expect |
|---|---|---|
| 1 | Drop WS without `C2S_Leave` | AI pilots; seat reserved for grace (~30s) |
| 2 | Inventory retained on seat | Carry stack unchanged under AI |
| 3 | Reconnect with token within grace | Same seatId + inventory; full snapshot |
| 4 | After grace | Token invalid; seat AI permanent for run |

**Pass:** Always 4 active haulers; no host migration; process remains room authority.

---

### INT-05 — Reconnect mid-level

**Components:** C-05, C-04, C-06

| Step | Action | Expect |
|---|---|---|
| 1 | Join, play, carry ≥1 item, note tick/pos | — |
| 2 | Kill client process / close WS | AI or hold per policy during grace |
| 3 | New client `C2S_Join` + `reconnectToken` | Welcome same seatId |
| 4 | Compare inventory & stats | Restored; prediction buffer reset |
| 5 | Resume inputs | `lastProcessedInputSeq` advances cleanly |

**Pass:** No duplicate seat; no ghost second hauler; protocol AUTH on bad token.

---

### INT-06 — Share payout correctness (server vs rules)

**Components:** C-06, C-07, C-11 consumer shape only

| Step | Action | Expect |
|---|---|---|
| 1 | Crafted stats/inventories via sim tape or test hook | Controlled `ScoreContext` |
| 2 | End run → `S2C_ScoreReport` | Matches `evaluateModifiers` + `computeTakes` pure call |
| 3 | Cases: min-1 share; set bonus; autopilot boundary; four-way equal | Golden fixtures |
| 4 | Client must not alter takes | Report is sole authority |

**Pass:** Bit-identical to pure rules fixture for integer fields (`shares`, `takeGp`, modifier ids).

**Cross-check:** Re-run pure function in test on server-exported context.

---

### INT-07 — Room codes (private only)

**Components:** C-05, C-04

| Step | Action | Expect |
|---|---|---|
| 1 | Create session | Human-readable `joinCode` (e.g. 6 chars) |
| 2 | Join correct code | 200 + seat |
| 3 | Join wrong code | `NOT_FOUND` |
| 4 | Join when 4 humans seated | `FULL` |
| 5 | No public matchmaking API | Routes absent / 404 |
| 6 | Empty lobby TTL | Room cleaned; code invalid after TTL |

**Pass:** MVP private-codes-only product freeze honored.

---

### INT-08 — Mid-join during Level / Fork

**Components:** C-05, C-06, C-08

| Step | Action | Expect |
|---|---|---|
| 1 | Run with 1 human + 3 AI in Level | Phase `level` |
| 2 | Second human joins by code | Free/AI seat soft-takeover |
| 3 | Spawn policy | Safe point / near average; inventory of AI seat preserved on soft-takeover |
| 4 | Join during Fork | Allowed; can mash after seat bind |
| 5 | Join during End | Reject or spectator-only (MVP: **reject** `PHASE`) |

**Pass:** Soft-takeover keeps position/inventory; Instructions mid-join drop-in from top-left when in that phase.

---

### INT-09 — Soft-unique characters

**Components:** C-05, lobby WS claim

| Step | Action | Expect |
|---|---|---|
| 1 | Seat 0 claims Gnome | OK |
| 2 | Seat 1 claims Gnome | Allowed (soft-unique) **or** warned — document implemented policy; freeze says **allow clash** |
| 3 | Prefer-distinct UX | Client may suggest free character; server must not hard-block if clash allowed |

**Pass:** Matches Q9 soft-unique freeze.

---

### INT-10 — No global pause

**Components:** C-03, C-06

| Step | Action | Expect |
|---|---|---|
| 1 | Human sends `start` during Level | Server sim **continues** ticking |
| 2 | Other clients still receive snapshots | No freeze |
| 3 | Local pause UI only (client concern) | Integration asserts server tick advances |

---

### INT-11 — Input validation & anti-cheat surface

| Step | Action | Expect |
|---|---|---|
| 1 | Client sends forged position (if attempted) | Ignored; snapshot overwrites |
| 2 | Wrong seatId on input | Dropped |
| 3 | Rate > tickRate×2 | Rate-limited |
| 4 | Score submit without completion token | Fail |

---

### INT-12 — High score integration

**Components:** C-12, C-07, C-05 token

| Step | Action | Expect |
|---|---|---|
| 1 | Complete run; obtain `completionToken` | Present on report |
| 2 | Submit human eligible seat | 201 row |
| 3 | Resubmit | `CONFLICT` |
| 4 | AI seat | Fail |
| 5 | Name charset / length | `VALIDATION` |

---

## 4. Priority order (implementation phases)

| Phase | Integration scenarios |
|---|---|
| P2 | INT-07 codes; join/snapshot stream; INT-05 reconnect (position only); INT-10 pause; basic 2-client move |
| P3 | INT-03 steal/stun; INT-04 AI; INT-11 validation |
| P4 | INT-01 full path; INT-02 fork lag; INT-08 mid-join; INT-09 characters |
| P5 | INT-06 payout; INT-12 high scores |

---

## 5. Data collection on failure

Always capture:

- `sessionId`, `joinCode`, `rngSeed`, `tick`, `phase`  
- Per-seat `control`, `character`, carry stack  
- Last N `GameEvent`s  
- Build SHA / `protocolVersion` / `rulesetVersion`  

---

## 6. Non-goals (this plan)

- Desktop browser matrix (see [SYSTEM-TEST-PLAN.md](SYSTEM-TEST-PLAN.md))  
- Fun/fair subjective scoring (see [HUMAN-PLAYTEST-PLAN.md](HUMAN-PLAYTEST-PLAN.md))  
- Content completeness for all 19 levels  
- Process-death room migration (stretch; host leave N/A for peers, process death ends room MVP)  

---

## 7. Exit criteria

- [ ] INT-01 green with `levelsAfterHoard=2`  
- [ ] INT-03 ownership invariants green  
- [ ] INT-04 + INT-05 reconnect/AI green  
- [ ] INT-06 report == pure rules  
- [ ] INT-07 private code matrix green  
- [ ] Suite runs headless in CI under budget (target &lt; 5 min integration job)  
