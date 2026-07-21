# Dungeon Haul — Human Playtest Plan

> **Scope:** Facilitated human sessions — scripts, exit criteria, feedback template.  
> **Documentation only.** Expand notes under `docs/testing/reports/` when sessions run (folder created as needed).  
> **Related:** [IMPLEMENTATION-PLAN.md](../IMPLEMENTATION-PLAN.md) §6, [SYSTEM-TEST-PLAN.md](SYSTEM-TEST-PLAN.md)

**Product freezes for facilitators:** private room codes; desktop browsers; 960×540 letterbox; **no accounts**; **no global pause** (local menu only); short runs use `levelsAfterHoard` **default 2**; soft-unique characters; server-owned rooms (**no player host**).

---

## 1. Goals of human playtests

| Goal | Question |
|---|---|
| **Fun** | Is chaos joyful more often than frustrating? |
| **Fair** | Do steal, stun, fork argue, and shares feel legitimate? |
| **Understandable** | Do players know what to do next and why they got a share title? |
| **Online feel** | Is platforming acceptable over the network? |
| **AI companion** | Does AI help fill without griefing the run? |

Automated tests cannot answer fun/fair/clarity — humans must.

---

## 2. Session logistics

### 2.1 Roles

| Role | Responsibility |
|---|---|
| Facilitator | Runs script, times segments, injects faults, takes notes |
| Players | 1–4 humans; desktop browsers only |
| Observer (optional) | Watches seats, records desyncs, does not coach mid-round |
| Build owner | Provides deploy URL, SHA, join procedure |

### 2.2 Setup checklist

- [ ] Build SHA + URL recorded  
- [ ] `levelsAfterHoard=2` (unless testing full 7)  
- [ ] Desktop Chrome/Firefox/Safari/Edge as available  
- [ ] Keyboards and/or gamepads mapped (document layout)  
- [ ] Voice chat for remote players (Discord/etc.) separate from game  
- [ ] Consent: session may be screen-recorded for bug repro  
- [ ] High scores env is staging (not production pollution) if possible  

### 2.3 Per-session header (fill every time)

```text
Date:
Build SHA:
Deploy URL:
protocolVersion / rulesetVersion:
Facilitator:
Players (name, browser, OS, approx RTT if known):
Join code(s):
rngSeed (if shown/debug):
Config notes (levelsAfterHoard, etc.):
```

---

## 3. Session scripts

### Session A — Solo smoke (post-P2 / every build sanity)

| Field | Value |
|---|---|
| **Players** | 1 human |
| **Duration** | 15–20 min |
| **Goal** | Can one person create a room and complete a short path with AI? |

**Script**

1. Cold open client; confirm Title and letterboxed 960×540 presentation.  
2. Create private room; note code (even if alone).  
3. Ready → Instructions: confirm **no AI**. Exit right.  
4. Hoard: confirm AI appears (3 fillers). Grab any loot; exit.  
5. If Fork appears: pick a path; mash argue lightly.  
6. Complete remaining levels to End (default 2 after Hoard).  
7. Watch End sequence once without skipping; second time try Start-to-skip.  
8. Enter initials if prompted (≤60s).  

**Fault inject (optional)**

- Refresh once during Hoard; reconnect within grace.  

**Observe**

- Soft-locks, AI blocking exits, unclear UI, letterbox issues.  

**Exit criteria (session pass)**

- [ ] Completes short run without facilitator rescue  
- [ ] AI does not permanently soft-lock exit  
- [ ] End screen shows a take for the human  

---

### Session B — Net feel (post-P2)

| Field | Value |
|---|---|
| **Players** | 2–4 remote desktops |
| **Duration** | 20–30 min |
| **Goal** | Movement/jump feel and desync under network |

**Script**

1. A creates code; others join; soft-unique characters preferred.  
2. Empty/Box level if available: run, jump, stand at edges, jump toward each other.  
3. Rate **lag feel** 1–5 after 5 minutes.  
4. One player backgrounds tab 10s; one hard-refreshes.  
5. Confirm no peer “host” — if creator leaves, others continue (seat → AI).  

**Metrics**

| Metric | Scale |
|---|---|
| Lag feel | 1 unbearable … 5 local-like |
| Desync sightings | count |
| Rubber-band severity | none / mild / severe |

**Exit criteria**

- [ ] Median lag feel ≥ 3  
- [ ] No permanent desync (positions reconverge)  
- [ ] Creator leave does not end room for others  

---

### Session C — Loot chaos (post-P3)

| Field | Value |
|---|---|
| **Players** | 2–4 |
| **Duration** | 25–35 min |
| **Goal** | Spill, steal, weight, throw fairness |

**Script**

1. Stack 4+ treasures; notice weight.  
2. Trip partner to force spill; steal during lockout.  
3. Throw treasure at partner; note knockback/aim.  
4. Intentionally hit spikes/traps if present.  
5. Discuss: “Did the other player deserve that loot?”  

**Observe**

- Lockout fairness, ownership confusion, weight readability, throw usability.  

**Exit criteria**

- [ ] Majority say steal/spill felt **server-fair** (not “my client said I had it”)  
- [ ] Weight change is noticeable after 3 items  
- [ ] No dual-held same instance observed  

---

### Session D — 4-player online chaos drop-in/out (post-P3/P4)

| Field | Value |
|---|---|
| **Players** | 4, with scheduled churn |
| **Duration** | 35–45 min |
| **Goal** | Drop-in/out + AI under social chaos |

**Script**

1. Start with 2 humans; others join mid-Instructions and mid-Level (stagger).  
2. One player goes idle 20s+ on purpose → confirm AI takeover.  
3. That player returns and moves → human control restored.  
4. One player disconnects mid-carry; reconnects within grace; checks inventory.  
5. One player leaves permanently; AI finishes their seat.  
6. Attempt 5th friend join → expect full.  
7. Play through fork + levels to End if time.  

**Exit criteria**

- [ ] Always 4 haulers from Hoard onward  
- [ ] Mid-join succeeds in Level/Fork  
- [ ] Reconnect within grace restores seat/loot  
- [ ] 5th joiner cleanly rejected  
- [ ] Room survives original creator disconnect  

---

### Session E — Fork argue (post-P4)

| Field | Value |
|---|---|
| **Players** | 2–4 |
| **Duration** | 15–20 min (may loop forks) |
| **Goal** | Vote readability and mash fairness |

**Script**

1. Reach Fork; split intentionally on paths.  
2. Mash argue; call out tallies if visible.  
3. Replay a **tie** attempt if possible.  
4. Under voice delay, one side “feels” they won — compare to actual next level.  

**Exit criteria**

- [ ] Outcome matches majority mash (or documented tie rule)  
- [ ] Players understand how to select path + argue  
- [ ] Lag did not produce split-world next levels  

---

### Session F — End cinematics readability (post-P4)

| Field | Value |
|---|---|
| **Players** | 2–4 |
| **Duration** | 20 min (2 full ends) |
| **Goal** | Share titles & spoils understandable |

**Script**

1. Complete short run with varied playstyles (one idle-ish for Autopilot risk, one loot goblin, one fighter).  
2. Watch full End **without** skip: count haul → titles → spoils.  
3. Each player says aloud: “I got X because…”  
4. Second run: spam Start skip; confirm no server freeze for others.  
5. Concurrent name entry if multiple qualify.  

**Observe**

- Title order (gold unique rewards → white commons → blue penalties → red unique penalties)  
- Percentage reveal order (3rd, 2nd, 4th, 1st by take)  
- Whether values-on-titles missing is OK (per design)  

**Exit criteria**

- [ ] ≥75% of players correctly explain at least one of their titles  
- [ ] Takes feel plausible vs what they carried / how they played  
- [ ] Skip does not pause others’ game world  
- [ ] Name entry usable within 60s  

---

### Session G — AI companion deep dive (post-P3)

| Field | Value |
|---|---|
| **Players** | 1 |
| **Duration** | 25 min |
| **Goal** | AI useful, not griefy |

**Script**

1. Solo short run; do not coach AI.  
2. Note: path blocking, loot hogging, switch presses, load cap.  
3. Intentionally leave AI near exit; see if they progress.  

**Exit criteria**

- [ ] AI load ≤ max human load observed  
- [ ] Run completable  
- [ ] Grief score (1–5, 5=worst) median ≤ 3  

---

### Session H — Score trust (post-P5)

| Field | Value |
|---|---|
| **Players** | 2–4 |
| **Duration** | 25 min |
| **Goal** | High scores trusted and multi-entry OK |

**Script**

1. Finish run; compare on-screen take to mental model.  
2. Submit scores; reload High Scores from Title attract.  
3. Attempt double submit / empty name (should fail cleanly).  

**Exit criteria**

- [ ] Top list updates  
- [ ] “New!” tagging sensible if implemented  
- [ ] No AI names on board  

---

## 4. Fun / fair / understandable exit criteria (program-level)

A **playtest milestone** (e.g. end of P4) passes human validation when:

### Fun

- [ ] At least **2** distinct Session D/C groups report they would play another round  
- [ ] Average fun score ≥ **3.5 / 5** across sessions that week  
- [ ] No dominant feedback that “netcode ruined the joke” (lag feel median ≥ 3)

### Fair

- [ ] No confirmed dual-ownership or client-side score wins  
- [ ] Steal-after-stun majority “felt fair” (≥60% of C-session players)  
- [ ] Fork outcomes trusted (≥60% Session E)  
- [ ] Share payouts match server report; no “my screen said different GP” bugs open as S1  

### Understandable

- [ ] New players complete Session A with ≤2 facilitator hints  
- [ ] ≥75% can name the goal (“loot, escape, split haul”) after one run  
- [ ] End titles: ≥75% understand ≥1 personal title (Session F)  
- [ ] Room code join succeeds without accounts on first try ≥90%  

### Product freezes respected in UX

- [ ] No account wall  
- [ ] No expectation of global pause  
- [ ] Private codes only (no “quick play” confusion in MVP)  
- [ ] Desktop-first controls clear  

If fun/fair/understandable fail, **content expansion (P6) waits** on net/rules/UX fixes.

---

## 5. Feedback template

Copy per player or per session aggregate.

```text
### Playtest feedback
Session ID / letter:     Date:
Player handle:           Browser/OS:
Seat / character:        Approx RTT:

#### Scores (1–5)
Fun:            _
Fairness:       _
Understandable: _
Net feel:       _
AI quality:     _   (or N/A)
Would replay:   yes / no / maybe

#### Moments
Best moment:
Worst moment:
Most confusing UI:
Unfair-feeling event (describe time/phase):

#### Bugs (repro)
What you did:
What you expected:
What happened:
Join code:
Approx time from start:
Screenshot/video?:

#### Free notes


#### Facilitator only
Build SHA:
rngSeed:
Known open bugs hit:
Severity call (S1–S4):
```

### Aggregate rollup (facilitator)

```text
Session letter:   N players:   Build:
Fun avg:  Fair avg:  Understand avg:  Net avg:
Exit criteria met?  yes / no
Blockers for next milestone:
Action items / bug links:
```

---

## 6. Scheduling recommendations

| When | Sessions |
|---|---|
| Every significant netcode PR merge | A (solo smoke), B (if 2+ available) |
| After treasure/stun lands | C |
| After lobby/flow shell | D, E, F |
| Before staging ship | D + F + H + one full browser spot-check |
| Weekly during MVP crunch | Rotate A/C/D; always file feedback |

Remote-friendly: private codes + voice; facilitator pastes code in chat (no accounts).

---

## 7. Ethics & comfort

- Chaos game includes sabotage — set expectation: **grief inside rules is OK**; harassment outside game is not.  
- Allow anyone to leave; AI fills.  
- Avoid production PII; high-score names are ephemeral initials.  
- Do not pressure players to disable security software or install untrusted builds outside team process.

---

## 8. Mapping to automated plans

| Human signal | Follow-up automation |
|---|---|
| Steal felt unfair | Expand INT-03 + sim tapes |
| Fork dispute | INT-02 lag fork |
| Bad reconnect | INT-05 / SYS-F3 |
| Confusing titles | Rules fixture + End director copy tests |
| Soft-lock with AI | SIM-ai scripts + Session G retest |

---

## 9. Reports archive (when sessions run)

Suggested path: `docs/testing/reports/YYYY-MM-DD-session-X.md`  
Keep join codes and SHAs; strip personal emails if publishing externally.
