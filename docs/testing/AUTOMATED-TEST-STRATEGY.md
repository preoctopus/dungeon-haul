# Dungeon Haul — Automated Test Strategy

> **Scope:** Documentation only — frameworks, layers, gates, and policies.  
> **No test code implementations in this doc** (describe plans only).  
> **Related:** [ARCHITECTURE.md](../ARCHITECTURE.md), [IMPLEMENTATION-PLAN.md](../IMPLEMENTATION-PLAN.md), [COMPONENTS.md](../COMPONENTS.md), [interfaces/OVERVIEW.md](../interfaces/OVERVIEW.md)

**Product freezes (do not re-litigate):** private room codes; evergreen **desktop browsers** only; logical canvas **960×540**; no accounts; no global pause; `levelsAfterHoard` default **2**; soft-unique characters.

---

## 1. Goals

1. Protect **authoritative fairness** (treasure ownership, fork tallies, share payouts).
2. Keep **pure rules** bit-stable and exhaustively unit-tested.
3. Prove **online multiplayer** paths (join, mid-join, reconnect, AI takeover) without requiring art polish.
4. Fail CI on regressions that break protocol, sim invariants, or payout math.
5. Stay **pragmatic on coverage** — high bar on pure/sim/protocol; lighter bar on Phaser presentation.

---

## 2. Monorepo test layout (planned)

```text
/
├── client/                 # Phaser + Vite
├── server/                 # Colyseus room + Hono/Fastify lobby
├── packages/
│   ├── protocol/           # message types + codecs
│   └── rules/              # pure share/treasure/weight
├── content/levels/         # PNG + meta fixtures
└── docs/testing/           # this strategy + plans
```

Suggested test roots (when code lands):

| Package | Unit | Integration / harness | E2E |
|---|---|---|---|
| `packages/rules` | Vitest | — | — |
| `packages/protocol` | Vitest (codec + version) | — | — |
| `server` | Vitest (pure helpers) | Headless sim + room harness | — |
| `client` | Vitest (mappers, pure UI state) | — | Playwright smoke |
| Content | Level validator tests | Map fixture parse | — |

---

## 3. Framework choices

### 3.1 Unit / package tests — **Vitest** (primary)

| Decision | Detail |
|---|---|
| Runner | **Vitest** (ADR-001); not Jest unless a dependency forces it |
| Why | Native ESM/TS monorepo fit; fast watch; same config family as Vite client |
| Scope | `packages/rules`, `packages/protocol`, server pure modules, level parser, AI pure helpers |
| Assertions | Standard expect + custom matchers for `ScoreReport` / GP totals |
| Coverage tool | Vitest coverage (v8/istanbul) — **selective thresholds** (see §8) |

**Jest:** do not introduce a second unit runner. If a library ships Jest-only helpers, wrap or replace; keep one green path in CI.

### 3.2 Headless simulation harness — Node + Vitest (or thin CLI)

| Decision | Detail |
|---|---|
| Runtime | Node (same process as server sim modules) |
| Driver | Fixed 30 Hz tick loop; inject `InputCommand` tapes per seat |
| RNG | Seeded; seed fixed in fixtures (see §9) |
| Output | Golden snapshots of inventories, phase, `ScoreReport`, or invariant checks |
| Phaser | **Never** required for sim tests |

### 3.3 Room / WebSocket integration — Vitest + test client

| Decision | Detail |
|---|---|
| Transport | Real WebSocket against in-process or ephemeral server |
| Client | Minimal protocol client (not full Phaser) |
| Lifecycle | create session → join seats → stream snapshots → assert events |
| Colyseus | Use project room class; avoid mocking away seat/reconnect semantics |

### 3.4 Browser E2E — **Playwright** (later gate)

| Decision | Detail |
|---|---|
| Tool | Playwright (Chromium primary; Firefox/WebKit in system matrix) |
| When | After P2/P4 shell exists; not a P0 blocker |
| Scope | Happy-path lobby join, movement visible, reconnect smoke |
| Viewport | Logical **960×540** (or letterboxed container matching FIT+center) |
| Auth | No accounts — ephemeral names only |

### 3.5 Lint / type / build

| Gate | Tool (planned) |
|---|---|
| Types | `tsc --noEmit` (strict) per package |
| Lint | ESLint (+ shared config) |
| Format | Prettier optional; team choice |
| Build | Vite client build + server bundle + Docker multi-stage |

---

## 4. Test layers (pyramid)

```text
        ┌──────────────────┐
        │  Playwright E2E  │  few, slow, desktop browsers
        ├──────────────────┤
        │ Integration room │  multi-seat WS, reconnect, AI
        ├──────────────────┤
        │ Headless sim     │  input tapes, loot, fork, end
        ├──────────────────┤
        │ Contract/codec   │  protocol encode/decode, version
        ├──────────────────┤
        │ Pure unit rules  │  modifiers, takes, weight, parser
        └──────────────────┘
```

| Layer | Primary owners | Fail CI? |
|---|---|---|
| Pure unit (rules, parser, AI helpers) | SE-6, SE-7, SE-8 | **Yes** (always) |
| Protocol contract | SE-3/5 | **Yes** (always) |
| Headless sim scripts | SE-5 | **Yes** after P2/P3 |
| Room integration | SE-3/4/5 | **Yes** after P2 |
| Playwright E2E | SE-1 (+ SE-3) | Soft early; **required** before release/staging gate |
| Visual/pixel golden | SE-2 | Optional; non-blocking MVP |

---

## 5. Pure rules unit tests (C-07)

Highest ROI layer. All tests pure; no I/O.

### 5.1 Required suites

| Suite | Assertions |
|---|---|
| Payout formula | `take = total × shares_i / sum(shares)`; **min 1 share** |
| Floor / remainder | Integer GP floor; remainder policy stable (highest share seat) |
| Equal shares | Four equal → 25% each (within rounding) |
| Empty Handed + stack of penalties | Never below 1 share |
| Haul +N | `+1` per recovered item |
| Set completion | Catalog set bonus supersedes piece rules when complete |
| Leader of the Pack | Fails if not first on any level |
| Autopilot | `AI control > 50%` fires; **exactly 50% does not** |
| Antisocial | Only single human for whole session |
| Tie policy | “Most X” ties → all tied seats receive modifier (MVP lock) |
| Encumbrance | Free first 3 items; config-driven penalties; min speed 0 allowed |
| Chest rolls | Seeded tables; no live unique duplicates |
| Display helpers | Modifier uniqueness/kind classification for end-screen order |

### 5.2 Fixture style

- Golden `ScoreContext` JSON fixtures under `packages/rules/fixtures/`.
- One fixture per notable design edge (empty-handed four-way, vegetable set, goat-on-pole, etc.).
- `rulesetVersion` asserted on `ScoreReport` / breakdown outputs.

### 5.3 Forbidden in unit tests

- Importing Phaser, Colyseus, Node `fs` in rules package under test.
- Non-deterministic `Date.now()` / unseeded `Math.random()`.

---

## 6. Headless simulation tests (C-06 + C-08 + C-10)

### 6.1 Harness capabilities

1. Load `LevelDefinition` (BoxLevel + Hoard fixture).
2. Bind 4 seats (human or AI).
3. Step N ticks at **30 Hz** fixed dt.
4. Apply per-seat `InputCommand` sequences (from file or builder).
5. Capture `WorldSnapshot`, `GameEvent[]`, final `ScoreReport`.
6. Force phase transitions for focused suites (optional test-only hooks behind `NODE_ENV=test`).

### 6.2 Priority scripts (golden / invariant)

| Script ID | Intent |
|---|---|
| `SIM-move-jump` | AABB platforms; jump edge once per press |
| `SIM-pickup-drop-throw` | Carry stack order; throw velocity × facing |
| `SIM-stun-spill-steal` | Stun spills; lockout; **other seat can steal** |
| `SIM-weight-greed` | 4+ items slowdown; speed→0 possible |
| `SIM-ai-load-cap` | AI never exceeds max human carry load |
| `SIM-fork-mash` | Higher mash wins; tie policy locked |
| `SIM-full-short-run` | Instructions→Hoard→levels×`levelsAfterHoard`(2)→End |
| `SIM-ai-takeover-idle` | 20s no input → AI; human input restores |
| `SIM-treasure-id-conservation` | Instance IDs not duplicated/destroyed illegally |

### 6.3 Assertions preferred over bitwise physics

Because physics is **single-server authority** (not multi-machine lockstep):

- Prefer **invariants**: ownership exclusive, instance conservation, phase legality, share math matches rules package.
- Prefer **event presence**: `spill`, `pickup`, `ai_takeover`.
- Prefer **ordering**: exit order flags for Leader/Slowpoke.
- Avoid cross-arch float bit identity for positions except within tolerance on the same platform.

---

## 7. Protocol & API contract tests

### 7.1 Wire protocol (`packages/protocol`)

| Case | Expect |
|---|---|
| Encode/decode round-trip | All `C2S_*` / `S2C_*` MVP messages |
| Version field | `protocolVersion` present on join/welcome |
| Unknown type | Reject or ignore per policy (document + test) |
| Axes domain | Reject values outside `{-1,0,1}` at validation boundary |
| Snapshot size soft bound | 4-seat snapshot << 32 KB JSON |

### 7.2 Netcode behavioral contracts ([netcode-messages.md](../interfaces/netcode-messages.md))

1. Join → Welcome → Snapshot stream  
2. Input `seq` monotonic; duplicates ignored; gaps tolerated  
3. Reconnect token restores `seatId` + inventory  
4. Protocol mismatch → `S2C_Error code=PROTOCOL`  
5. Seats full → `FULL`  

### 7.3 Lobby / scores REST ([lobby-and-scores.md](../interfaces/lobby-and-scores.md))

1. Create → join ×3 → 4th succeeds → 5th `FULL`  
2. Bad code → `NOT_FOUND`  
3. Score without token → fail  
4. Double submit → `CONFLICT`  
5. AI seat submit → fail  
6. Soft-unique character claim: prefer distinct; document clash policy tests when implemented  

### 7.4 Level content validation (CI)

- Spawns (4 logical), ≥1 exit, unknown colors fail, `meta.id` matches folder, max dimensions.
- Fixtures: Hoard + BoxLevel always present for net/sim tests.

---

## 8. CI gates

### 8.1 Pull request (required)

```text
install (pnpm)
→ lint + typecheck
→ unit (rules, protocol, parser, pure helpers)
→ headless sim scripts (once package exists)
→ room integration (smoke suite, once P2)
→ build client + server
→ docker build (optional on PR if slow; required on main)
```

### 8.2 Merge / main

- All PR gates  
- Docker image publish (staging)  
- Optional Playwright smoke against staging  

### 8.3 Implementation-plan gates (must not skip)

| Gate | Test evidence |
|---|---|
| G1 | Protocol v0 reviewed + contract tests merge |
| G2 | Rules ≥ **80% modifier catalog** covered by unit tests |
| G3 | P2 two-client movement (automated room test + recorded manual) |
| G4 | Treasure ownership invariant tests green |
| G5 | E2E short run on staging (system plan) |
| G6 | Load smoke N rooms × 4 seats memory OK |

### 8.4 What may be non-blocking early

| Item | Until |
|---|---|
| Playwright full matrix | Post-P4 shell |
| Audio | Stubbed |
| Visual regression screenshots | Art lock |
| Full 7-level graph | Content phase (MVP uses `levelsAfterHoard=2`) |

---

## 9. Determinism & seeded RNG

| Domain | Policy |
|---|---|
| Rules / takes / shares | **Fully deterministic** given inputs; no ambient RNG |
| Treasure rolls | Inject `Rng` interface; fixtures use fixed seed |
| Session spawn mix | `Session.rngSeed` from welcome; sim tests pin seed |
| AI mild randomness (fork) | Seeded stream; tests assert distribution or force policy |
| Physics floats | Same seed + same input tape → same invariant outcomes on same CI image |
| Time | Use tick counters, not wall clock, inside sim pure core |
| Wall-clock AI takeover (20s / 5s) | Tests advance virtual time or tick budget equivalent |

**Golden tape format (conceptual):**

```text
Tape {
  seed: number
  levelId: string
  seats: { seatId, control }[]
  frames: { tick, inputs: { seatId, command }[] }[]
  expect: { events?, inventories?, scoreReport?, invariants }
}
```

---

## 10. Flaky test policy

### 10.1 Definitions

| Class | Example | Action |
|---|---|---|
| **A — Forbidden flake** | Rules take formula intermittent | Quarantine + fix within 24h; blocks release |
| **B — Infra flake** | Port bind, Docker race | Retry once in CI; fix harness isolation |
| **C — Timing flake** | Playwright “wait for sprite” | Prefer server-event readiness; increase explicit waits carefully |
| **D — Network flake** | External staging blip | Staging-only; not PR-required |

### 10.2 Rules

1. **No `sleep(random)`** as synchronization — wait on messages/ticks/events.  
2. Room tests bind **ephemeral ports**; tear down rooms every test.  
3. Do not share global `rngSeed` mutably across parallel workers without isolation.  
4. Quarantine list: `docs/testing/flaky-quarantine.md` (create when first needed) with owner + expiry.  
5. Max CI retry: **1 automatic retry** for integration/E2E only; unit tests **never** retry to hide failure.  
6. Flakes open a bug with seatId, tick, seed, build SHA.

---

## 11. Coverage pragmatism

### 11.1 Targets (guidance, not vanity 100%)

| Area | Line/branch target | Rationale |
|---|---|---|
| `packages/rules` | **≥ 90%** lines; **100%** of modifier predicates | Fairness core |
| `packages/protocol` codecs | **≥ 85%** | Contract surface |
| Level parser | **≥ 85%** + all fixtures validate | Content safety |
| Sim core (ownership, spill, fork) | **High** on critical paths; not forced global % | Prefer invariant tests |
| Client presentation | **No hard gate** | Manual + Playwright smoke |
| Audio | None required | Event hook smoke optional |

### 11.2 What “done” means for a PR

- New share modifier → unit tests with true/false cases + tie case if ranking-based.  
- New wire field → codec round-trip + consumer ignore-unknown policy if applicable.  
- New sim interaction → headless tape or invariant test.  
- UI-only polish → no new unit obligation beyond smoke if behavior unchanged.

---

## 12. Local developer workflow (planned)

```text
pnpm test                 # unit + pure
pnpm test:sim             # headless tapes
pnpm test:integration     # room WS
pnpm test:e2e             # Playwright (opt-in / CI job)
pnpm test:watch           # vitest watch for rules
```

Seed debugging: print `sessionId`, `rngSeed`, `tick`, `seatId` on failure (align with telemetry C-14).

---

## 13. Mapping to components

| Component | Automated focus |
|---|---|
| C-01 Shell | Playwright scene flow smoke |
| C-02 Presentation | Optional visual; event→VFX unit if pure |
| C-03 Input | Mapper unit (key → axes); chord left to server tests |
| C-04 Net client | Prediction/reconcile unit with fake snapshots; WS integration |
| C-05 Lobby | REST contract tests |
| C-06 Sim | Headless tapes + invariants |
| C-07 Rules | Pure unit (primary) |
| C-08 AI | Pure decision unit + sim with AI seats |
| C-09 Levels | Parser fixtures + CI validate |
| C-10 Fork | Sim tally tapes |
| C-11 End director | ScoreReport-driven sequence unit (no canvas required) |
| C-12 Scores | REST validation + token anti-cheat |
| C-13 Audio | Manual / light event subscription test |
| C-14 Telemetry | `/health` contract; metrics smoke |

Per-component detail stubs: [COMPONENT-TEST-PLAN-APPROACH.md](COMPONENT-TEST-PLAN-APPROACH.md) and `docs/components/<name>/TEST-PLAN.md`.

---

## 14. Out of scope for automated strategy (MVP)

- Mobile browsers / touch controls  
- Public matchmaking  
- Couch multi-gamepad hybrid  
- Global pause vote  
- Cheat red-team beyond authority model  
- Pixel-perfect art CI  

---

## 15. Exit criteria for “test system ready”

- [ ] Vitest green on rules + protocol in CI  
- [ ] Headless sim runs BoxLevel tape in CI  
- [ ] Room integration: 2 clients join private code and move  
- [ ] Flaky policy published and enforced  
- [ ] Coverage thresholds enforced only on pure packages  
- [ ] Playwright optional job exists (may skip until shell ready)  
