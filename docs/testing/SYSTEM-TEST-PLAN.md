# Dungeon Haul — System Test Plan

> **Scope:** End-to-end product behavior with real (or near-real) clients and server.  
> **Documentation only** — plans and acceptance criteria, no test code.  
> **Related:** [AUTOMATED-TEST-STRATEGY.md](AUTOMATED-TEST-STRATEGY.md), [INTEGRATION-TEST-PLAN.md](INTEGRATION-TEST-PLAN.md), [HUMAN-PLAYTEST-PLAN.md](HUMAN-PLAYTEST-PLAN.md)

**Freezes:** private codes; **desktop** evergreen browsers; **960×540** logical letterbox; no accounts; no global pause; `levelsAfterHoard` default **2**; soft-unique characters; **no peer host**.

---

## 1. Objectives

1. Validate **happy-path** online sessions for 1–4 humans with AI fill.  
2. Validate **failure / fault** paths that users hit (bad code, full room, disconnect, mid-join limits).  
3. Confirm **2–4 concurrent desktop clients** against one room.  
4. Confirm **mid-join** behavior and that **host leave is N/A** (server-owned room).  
5. Check **tick budget / performance** under multi-client load.  
6. Run a **desktop browser matrix** before staging ship.

System tests may be **manual scripted**, **Playwright-automated**, or hybrid. Prefer automation for smoke; keep exploratory under human playtest plan.

---

## 2. Test environment

| Element | MVP system-test env |
|---|---|
| Deploy | Local docker-compose **or** Fly.io/Railway staging |
| Client | Built static Vite client; no Flash |
| Server | Node game process + lobby API + Postgres (scores) |
| Network | LAN and one “remote” path (different machine or throttled profile) |
| Display | Desktop; logical **960×540** FIT + center letterbox |
| Audio | Optional; unlock on first gesture |
| Accounts | **None** — ephemeral display names + high-score initials only |
| Matchmaking | **Private codes only** |

### Seed data

- Level pack: Hoard + ≥2 playable stubs/paths for forks  
- Empty high-score table or known baseline  
- Config: `levelsAfterHoard=2`, tick 30 Hz  

### Build identity

Record for every session: git SHA, `protocolVersion`, `rulesetVersion`, deploy URL.

---

## 3. Browser matrix (desktop)

Primary ship target: **evergreen desktop browsers only** (Q1 freeze).

| Browser | OS | Priority | Notes |
|---|---|---|---|
| Chrome (latest) | macOS | P0 | Playwright default |
| Chrome (latest) | Windows 10/11 | P0 | |
| Firefox (latest) | macOS | P1 | |
| Firefox (latest) | Windows | P1 | |
| Safari (latest) | macOS | P0 | WebSocket + AudioContext quirks |
| Edge (latest) | Windows | P1 | Chromium-based; spot-check |

**Out of matrix (MVP):** iOS Safari, Android Chrome, tablets-as-primary, IE.

### Viewport / scale checks

| Check | Expect |
|---|---|
| Window exactly 960×540 | Pixel-art integer scale comfortable |
| Window 1920×1080 | Letterbox; game area centered; no stretch distortion |
| Ultrawide | Side bars only; gameplay 16:9 logical |
| OS display scale 125%/150% | Still playable; document blur tradeoffs |

---

## 4. Roles & seating patterns

| Pattern ID | Humans | AI | Use |
|---|---|---|---|
| S1 | 1 | 3 (from Hoard) | Solo smoke / AI companion |
| S2 | 2 | 2 | Net feel + steal |
| S3 | 3 | 1 | Mid-join stress |
| S4 | 4 | 0 | Full lobby chaos |
| S0→S2 | 1 then +1 mid-level | rest AI | Mid-join |

Always **4 haulers** in Game State (Hoard onward).

---

## 5. Happy-path system tests

### SYS-H1 — Solo short run (1 human + AI)

| # | Step | Pass criteria |
|---|---|---|
| 1 | Open client → Title | Attract loop eventual Credits/High Scores if idle |
| 2 | Start → create private room | Code shown; no login |
| 3 | Ready → Instructions | No AI haulers on Instructions |
| 4 | Exit → Hoard | AI fills to 4 |
| 5 | Loot + exit; complete 2 levels (default) incl. fork if present | No soft-lock |
| 6 | End: count haul → shares → spoils | Titles readable; takes shown |
| 7 | Optional name entry ≤60s | High score list updates for human |

**Exit:** Run completable solo; AI does not brick progression.

---

### SYS-H2 — Two clients online (same room)

| # | Step | Pass criteria |
|---|---|---|
| 1 | Player A creates code; B joins | Both see seats / characters |
| 2 | Soft-unique claim | Clash allowed; prefer distinct UX ok |
| 3 | Shared level movement | Positions coherent; remote interpolation smooth enough |
| 4 | Mutual trip/spill attempt | Server-fair resolution |
| 5 | Complete short run | Both receive same `ScoreReport` economics |

**Exit:** Two-browser demo quality ≥ P2/P4 gates.

---

### SYS-H3 — Four clients online

| # | Step | Pass criteria |
|---|---|---|
| 1 | Four desktops join one code | 4th OK; 5th rejected FULL |
| 2 | Full ready → short run | Snapshots sustain 30 Hz server tick |
| 3 | Fork argue | Visible tallies / outcome consistent |
| 4 | End cinematics | All see modifiers; skip with Start works locally without freezing others |

**Exit:** No seat desync; room stable for full MVP length.

---

### SYS-H4 — Mid-join

| # | Step | Pass criteria |
|---|---|---|
| 1 | A starts run alone | AI fill after Hoard |
| 2 | B joins mid-Level with code | Soft-takeover AI seat; spawn safe |
| 3 | B joins mid-Fork | Can participate in mash |
| 4 | C attempts join during End | Rejected (MVP) with clear error |

**Exit:** Drop-in feels intentional; no duplicate characters required (soft-unique).

---

## 6. Failure / negative system tests

### SYS-F1 — Bad / stale room code

- Wrong code → user-visible not found  
- Expired empty-room TTL → not found  
- No stack traces in UI  

### SYS-F2 — Room full

- Fifth joiner blocked; existing four uninterrupted  

### SYS-F3 — Disconnect & reconnect

- Refresh mid-level within grace → seat + inventory restored  
- Reconnect after grace → cannot steal seat; may rejoin only if free (MVP: typically AI permanent)  
- Network offline banner / connection state from C-04  

### SYS-F4 — Tab background / idle

- Background tab does **not** drive sim (server authoritative)  
- 20s idle → AI takeover; return input → human control  
- No global pause when Start pressed (local menu only)  

### SYS-F5 — Protocol / build mismatch

- Old client vs new server → `PROTOCOL` error message actionable  

### SYS-F6 — Score abuse

- Submit without playing → fail  
- Double submit → fail  
- AI cannot enter high score  

### SYS-F7 — Process death (known MVP limitation)

- Kill server process → room lost  
- **Not** a peer-host leave scenario (there is no player host)  
- Document expected user message / reconnect failure  
- Stretch only: migration  

### SYS-F8 — Host leave N/A

| Check | Expect |
|---|---|
| “Creator” closes browser | Room continues for remaining players; creator seat → AI after grace |
| No transfer of authority to another client | Server remains sole authority |
| Remaining players finish run | Allowed |

---

## 7. Performance & tick budget

### 7.1 Server tick budget

| Metric | Target (MVP) |
|---|---|
| Sim tick rate | **30 Hz** fixed |
| Mean tick work | &lt; **8 ms** on staging hardware for 1 room × 4 seats |
| Spike | &lt; **16 ms** p99 under light multi-room |
| Overrun logging | C-14 metrics count overruns |

**SYS-P1 procedure**

1. Start 1 room, 4 human bot clients (input tapes) on BoxLevel.  
2. Run 60s; record tick duration histogram.  
3. Start N rooms (e.g. 10 → 25) with 4 AI/bot seats each.  
4. Watch memory RSS and tick overrun rate.  

**Pass:** Overruns rare (&lt;1% ticks) at agreed N; no OOM; G6 load smoke satisfied.

### 7.2 Client performance

| Metric | Target |
|---|---|
| Presentation FPS | ≥ 50 fps average desktop mid hardware (placeholder art OK) |
| Input local feel | Prediction keeps feel ≤ ~50 ms perceived on good LAN |
| Snapshot handling | No growing unhandled message queue |

**SYS-P2:** Chrome performance panel or simple FPS overlay (dev-only) during 4-player chaos.

### 7.3 Network comfort

| RTT | Expect |
|---|---|
| ≤ 80–100 ms | Comfortable |
| ~150 ms | Playable with interpolation softness |
| Injected delay in system test | Steal/fork still fair (server truth) |

---

## 8. Automated E2E (Playwright) vs manual system

| Case | Automation candidate | Manual preferred |
|---|---|---|
| SYS-H1 solo path | Yes (after shell stable) | First time each release |
| SYS-H2 two clients | Yes (2 browser contexts) | Net feel subjective |
| SYS-H3 four clients | Partial (CI heavy) | Pre-release |
| Mid-join | Yes | Edge spawn judgment |
| Browser matrix Safari | Manual or Playwright WebKit | First-class Safari pass |
| Perf tick budget | Server harness (not Playwright) | Spot-check |
| Cinematics readability | Manual | Always |

---

## 9. Entry / exit criteria

### Entry (start system test cycle)

- [ ] Integration INT-01/03/05/07 green on same build  
- [ ] Staging or local docker up; `/health` ok  
- [ ] Content: Hoard + path for 2 levels after hoard  
- [ ] Known seed/config documented  

### Exit (system test cycle pass)

- [ ] SYS-H1, H2, H4 pass on Chrome desktop  
- [ ] SYS-H3 pass at least once on staging  
- [ ] SYS-F1–F4, F6, F8 pass  
- [ ] SYS-F7 documented as known limitation  
- [ ] Browser matrix P0 browsers green for smoke  
- [ ] Tick budget SYS-P1 within targets for agreed room count  
- [ ] No Sev-1: soft-lock, dual ownership, wrong payout, room crash on join  

### Severity guide

| Sev | Examples |
|---|---|
| S1 | Crash, soft-lock, dual treasure owner, wrong takes, data loss scores |
| S2 | Reconnect fail inside grace, AI bricks exit, fork desync |
| S3 | UI clutter, letterbox glitch, SFX missing |
| S4 | Polish, copy |

---

## 10. Traceability to phases

| Phase | System focus |
|---|---|
| P2 | H2 movement; F3 reconnect; F8 host N/A; P1 tick basics |
| P3 | Steal fairness under H2/H3; AI in H1 |
| P4 | Full H1–H4; F4 idle; cinematics manual |
| P5 | F6 scores; deploy staging matrix |

---

## 11. Deliverables per cycle

1. Build identity sheet  
2. Results matrix (case × browser × pass/fail)  
3. Perf snapshot (tick p50/p99, room count)  
4. Open S1/S2 bugs with repro codes/seeds  
5. Sign-off owner (QA lead / SE-1+SE-5)  
