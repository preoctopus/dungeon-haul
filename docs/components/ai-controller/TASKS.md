# C-08 — AI Hauler Controller — Tasks

> **Component ID:** C-08  
> **Ownership:** SE-8  
> **Task ID prefix:** `C08-T##`  
> **Design:** [DESIGN.md](DESIGN.md)  
> **Depends on frozen contracts:** [input-commands.md](../../interfaces/input-commands.md), sim view from C-06

Implementation status (update with code): **P3 pure AI shipped** in `packages/ai`; P4 phase/fork policies still open.

---

## Phase alignment

| Plan phase | AI work | Status |
|---|---|---|
| **P2** | Idle stand / neutral AI inputs so 4 seats exist | Superseded by P3 decide |
| **P3** | Full behavior stack (flock, greed, cap, switches) | **Done** (`packages/ai`) |
| **P4** | Phase gating (no AI on Instructions); Fork argue policy | Pending |
| **P6** | Playtest tuning / balance | Pending |

---

## Tasks

### C08-T01 — Freeze `AiWorldView` contract with SE-5

**Goal:** Agree read-only fields C-06 will expose to AI each tick.  
**Deliverable:** Section §4 of DESIGN.md reviewed/accepted; any field renames reflected in design only (no code).  
**Depends on:** C-06 sim public models draft  
**Acceptance:**

- [ ] Field list covers haulers, free treasures (with value/rarity), switches, phase  
- [ ] Explicit: no mutable sim handles  
- [ ] SE-5 + SE-8 sign-off in PR comment or ADR note  

---

### C08-T02 — Pure decision API sketch

**Goal:** Specify pure function surface (`decide`, helpers) and determinism (rng seed).  
**Deliverable:** DESIGN §9 finalized; unit-test case list in DESIGN §11.  
**Depends on:** C08-T01  
**Acceptance:**

- [ ] Every helper listed with inputs/outputs  
- [ ] Deterministic seed rule: `rngSeed + tick + seatId`  
- [ ] No Phaser/Node/Colyseus types in pure API description  

---

### C08-T03 — Neutral AI stub (P2 integration)

**Goal:** AI seats emit neutral `InputCommand` so 4-seat rooms never crash.  
**Phase:** P2  
**Depends on:** C-06 `applyInput`, seat `control` flag  
**Acceptance:**

- [ ] For `control == AI`, one cmd per tick with `axes=0`, buttons false  
- [ ] `seq` monotonic server-side  
- [ ] Integration: third/fourth seats AI without crash (plan P2 exit)  

---

### C08-T04 — Average human position + tolerance band

**Goal:** Implement flocking intent per design (mean position, 25% furthest-pair tolerance).  
**Phase:** P3  
**Depends on:** C08-T02, C08-T03, live positions in `AiWorldView`  
**Acceptance:**

- [ ] Unit: 2 humans at x=0 and x=100 → target 50; tolerance 25; AI at 50 stays  
- [ ] Unit: single human → comfort radius dead-zone  
- [ ] Unit: zero humans → documented AI-only policy  
- [ ] Integration: AI hauler roughly tracks human pack on BoxLevel  

---

### C08-T05 — Treasure pickup proximity

**Goal:** Duck/pickup when free treasure in `pickupRadius` and under load cap.  
**Phase:** P3  
**Depends on:** C-06 pickup, treasure public state  
**Acceptance:**

- [ ] AI sets `axes.y` down when adjacent and eligible  
- [ ] Prefer highest `valueGp` in radius  
- [ ] No pickup attempts while stunned  

---

### C08-T06 — Load cap = max human carry count

**Goal:** Enforce design greed limit.  
**Phase:** P3  
**Depends on:** C08-T05  
**Acceptance:**

- [ ] Unit: humans max carry 2 → AI refuses 3rd  
- [ ] Unit: human picks up to 4 → AI may go to 4  
- [ ] Unit: no humans → `aiOnlyDefaultMaxLoad` applies  
- [ ] Playtest note: AI does not vacuum entire Hoard alone  

---

### C08-T07 — Upgrade: drop lesser for greater

**Goal:** At cap, drop lower-value stack item to free slot for higher-value nearby treasure.  
**Phase:** P3  
**Depends on:** C08-T06, drop chord in sim  
**Acceptance:**

- [ ] Unit: carry [5,20], free 100 in radius → drop then pickup sequence  
- [ ] Prefer drop over throw  
- [ ] Rarity tie-break when values equal (Unique/Set > Rare > Common)  

---

### C08-T08 — Switch press behavior

**Goal:** Seek and activate nearby unpressed switches.  
**Phase:** P3 (switches optional in sim; enable when present)  
**Depends on:** C-06 switch entities in view  
**Acceptance:**

- [ ] Nearest unpressed switch within seek radius becomes target  
- [ ] Heavy switch abandoned if self mass insufficient (no thrash loop)  
- [ ] Does not re-toggle immediately after successful press  

---

### C08-T09 — Stuck recovery

**Goal:** Jump / replan when blocked while moving.  
**Phase:** P3  
**Depends on:** C08-T04  
**Acceptance:**

- [ ] After `stuckTicks` with input vs zero velocity → jump pulse  
- [ ] Still stuck → reverse or clear intent next window  
- [ ] No infinite jump spam (cooldown)  

---

### C08-T10 — Phase gating: no AI on Instructions

**Goal:** Honor design — AI absent on Instructions.  
**Phase:** P4  
**Depends on:** C-06 phase machine  
**Acceptance:**

- [ ] `phaseAllowsAi()` false for `instructions`  
- [ ] Integration: Instructions only human seats; exit → Hoard AI fills  
- [ ] AI active on Hoard/levels/fork  

---

### C08-T11 — Idle / disconnect takeover integration

**Goal:** When room flips `control → AI`, controller immediately pilots without reset.  
**Phase:** P2–P3  
**Depends on:** Room idle thresholds (20s / 5s+edge); disconnect grace  
**Acceptance:**

- [ ] Soft takeover keeps position + inventory  
- [ ] Human packet restores `control → human` same tick path  
- [ ] `S2C_Event ai_takeover` / `human_takeover` emitted (for C-13/C-14)  
- [ ] Stats: `aiControlTicks` / `controlSwaps` continue to update in sim  

---

### C08-T12 — Fork argue policy

**Goal:** Mild path select + argue pulses so forks resolve with AI present.  
**Phase:** P4  
**Depends on:** C-10 fork inputs  
**Acceptance:**

- [ ] AI selects a path (stable hash or majority stretch flag)  
- [ ] Argue pulse rate ≤ configured mild Hz  
- [ ] Human mash can outvote AI easily in playtest  

---

### C08-T13 — Unit test suite (pure)

**Goal:** Vitest (or chosen) coverage for pure decision helpers.  
**Phase:** P3  
**Depends on:** C08-T04–T08  
**Acceptance:**

- [ ] Tests listed in DESIGN §11 green in CI  
- [ ] No engine imports in pure test target  
- [ ] Golden fixtures for load-cap and flocking  

---

### C08-T14 — Headless sim harness scripts

**Goal:** Recorded scenarios: 1 human scripted + 3 AI complete short Hoard→exit.  
**Phase:** P3–P4  
**Depends on:** C-06 headless tick harness  
**Acceptance:**

- [ ] Script finishes without soft-lock  
- [ ] AI never exceeds human max load in assertion  
- [ ] Document tape under `docs/testing/` when that folder is filled  

---

### C08-T15 — Playtest balance pass

**Goal:** Session C (implementation plan) observations → tuning.  
**Phase:** P6  
**Depends on:** Full short run  
**Acceptance:**

- [ ] Notes: blocking paths? hogging loot? switch help?  
- [ ] Adjust config params only (radii, cap policy) unless bug  
- [ ] Risk R10 mitigated enough for MVP ship  

---

### C08-T16 — Docs: package layout & public exports

**Goal:** When code lands, update DESIGN with actual paths and exported symbols.  
**Phase:** First implementation PR  
**Depends on:** C08-T03+  
**Status:** Done (DESIGN §12 + `packages/ai` exports)  
**Acceptance:**

- [ ] DESIGN §12 matches repo  
- [ ] COMPONENTS.md dependency notes still accurate  

---

## Out of scope (explicit)

| Item | Reason |
|---|---|
| ML / behavior trees v2 | Stretch |
| Per-character AI personality | Design parity not required |
| AI trip/push grief | Non-goal MVP |
| Client-side AI for offline | Stretch offline mode |
| Trap enemy AI | C-06 entities |

---

## Dependency summary

```text
C08-T01 → C08-T02 → C08-T03 → C08-T04
                              ↘ C08-T05 → C08-T06 → C08-T07
                              ↘ C08-T08
                              ↘ C08-T09
C08-T03 → C08-T11
C-06 phase → C08-T10
C-10 → C08-T12
C08-T04..T08 → C08-T13 → C08-T14 → C08-T15
```
