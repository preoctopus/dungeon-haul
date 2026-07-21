# C-02 — Presentation & Camera — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-02  
> **Owner cluster:** SE-2

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Entity presentation | Haulers, free/carried treasure, traps, switches from `WorldDisplayView` |
| Anim binding | `AnimState` → atlas keys; facing flip; fallback chain |
| Parallax stack | Far 50% / Near 100% / Mid world-anchored / Fore 125% / UI 0 |
| Camera modes | Multi-target Level; fixed Instructions/Fork; scripted End hooks |
| VFX router | `GameEvent` → one-shot VFX (pickup/spill/stun/trap/…) |
| Placeholder atlas | Missing keys → rect + one-time warn; no throw |
| Depth order | Far→Near→Mid→Fore→UI deterministic |
| Logical viewport | Compose for **960×540**; pixel-art rounding; cooperate with C-01 letterbox |
| Carry stack visuals | Stack offsets; detach on spill/drop/throw |
| Soft-unique UX | Same character distinct via seat tint/nameplate |

### Out of scope

| Out | Owner |
|---|---|
| Collision / ownership / scoring | C-06 / C-07 |
| WS / prediction / interpolation buffers | C-04 (C-02 consumes smoothed poses) |
| Scene graph / attract / lobby chrome / scale bootstrap | C-01 |
| End cinematic *sequencing* | C-11 (C-02 supplies primitives) |
| Pixel-map parse | C-09 |
| Audio unlock / mixer | C-13 |
| Input mapping | C-03 |
| Camera as anti-cheat | Forbidden |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Consumes | [netcode-messages.md](../../interfaces/netcode-messages.md) `HaulerPublic`, `GameEvent`, snapshot fields via display view |
| Consumes | [level-format.md](../../interfaces/level-format.md) parallax defaults, biome/tileset keys |
| Consumes | C-04 `WorldDisplayView` (post-predict/interp) |
| Consumes | C-01 host scene + scale |
| Produces | `IPresentationView`, camera controller, optional presentation cues for C-13 |
| Serves | C-11 scripted camera / pose hooks |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | Atlas key map; AnimState→key table; parallax factor application math; camera AABB framing math (no Phaser) | CI pure |
| **Component** | Presenters upsert/remove; VFX router spawn without throw; missing texture policy | CI with mock scene or headless doubles |
| **Property** | Scroll factors: far offset = 0.5×Δcam; fore = 1.25×Δcam for random camera deltas | CI |
| **Scenario** | Mock 30 Hz stream: 4 haulers walk; event script pickup/spill; mode switch Level→Fork | Manual harness + optional Playwright screenshot later |
| **Visual smoke** | Integer scale crispness; multi-target framing on wide level; placeholder pack swap | Manual Chrome/Safari desktop |

Coverage pragmatism: **no hard CI coverage gate** for Phaser draw path. Pure camera/parallax/anim tables covered; visual QA primary for feel.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| PRES-01 | Parallax scroll factors Far/Near/Mid/Fore/UI | MockLevelVisualDesc factors 0.5/1.0/1.25; camera moves Δx | Apply parallax offsets | Far 50%, Near 100%, Mid world-anchored (sf 1), Fore 125%, UI 0 | P0 |
| PRES-02 | Multi-target frames 4 haulers on wide level | 4 haulers spread within worldBounds; multi_target mode | Update several frames | All included seats inside visible 960×540 + padding (pan-only MVP) | P0 |
| PRES-03 | Fixed camera Instructions/Fork | setCameraMode fixed; move haulers | Update | Camera scroll does not follow hauler motion | P0 |
| PRES-04 | AnimState maps distinct keys | For each AnimState × CharacterId | Bind anim | Distinct key or documented fallback; idle restart not mid-loop | P0 |
| PRES-05 | Facing flip | facing = -1 and 1 | Render hauler | flipX mirrors when -1 | P0 |
| PRES-06 | Event→VFX spill/stun/pickup/trap | VfxRouter + mock scene | handleEvent each type | Visible VFX (placeholder OK); no throw | P0 |
| PRES-07 | Missing atlas key placeholder | Unregister key; request texture | update | Color rect/label; one-time warn; loop continues | P0 |
| PRES-08 | Hauler positions ±1 px integer camera | Integer scroll; known coords | update | Positions within ≤1 px rounding error | P1 |
| PRES-09 | Reconcile teleport snaps | Large hauler jump between views | update | Snap (optional short squash); no long lerp across map | P1 |
| PRES-10 | Carry stack order and detach | Carry array 3 items; then spill event | update + event | Stack offsets by array order; detach toward free positions | P1 |
| PRES-11 | Instructions hideAi | hideAi flag; AI seats present | update | AI seats not drawn | P1 |
| PRES-12 | AI↔human control badge | control flips on seat | update | Nameplate/tint updates; pose continuous | P1 |
| PRES-13 | Soft-unique same character | Two seats same CharacterId | update | Distinct seat colors/nameplates | P1 |
| PRES-14 | Phase Level→Fork camera switch | multi_target then fixed | setCameraMode + clear VFX | Fixed mode; level VFX cleared; no presenter tear-down required | P1 |
| PRES-15 | cameraHint soft bias | Hint + multi_target | update | Center biased toward hint without ignoring hauler box | P2 |
| PRES-16 | Huge dt tab-background clamp | dtMs = 5000 | update | Presentation dt capped; camera not nauseous jump | P1 |
| PRES-17 | Empty treasures after spill | Spill event; snapshot empty list | handleEvent + update | Snapshot truth wins; no crash | P1 |
| PRES-18 | Carry height comfort +N | Carry count beyond visual comfort | update | Cap stack height; show +N | P2 |
| PRES-19 | Scripted camera for C-11 | setMode scripted; setScriptedCamera | Tween pose | Camera reaches pose; hauler presenters remain | P1 |
| PRES-20 | World bounds clamp | Haulers near edge; worldBounds set | multi_target update | Camera clamped to bounds | P1 |
| PRES-21 | Placeholder pack swap | Two packs same keys | Load pack B | No presenter API change; keys resolve | P0 |
| PRES-22 | Trap/switch frame sync | TrapPublic + switch event | update + handleEvent | Frames match public state + flash on event | P2 |
| PRES-23 | Unknown GameEvent type safe | type unknown | handleEvent | No throw; log once optional | P1 |
| PRES-24 | Title walk-in helper optional | Attract helpers | walk-in/idle/run-off | Hooks callable; no multi-target | P2 |

---

## 5. Edge cases

| Case | Expected |
|---|---|
| Missing anim frame | Fallback state → idle → colored rect |
| One hauler far ahead | Prefer include-all framing; no client hard-gate movement |
| Throw free treasure | Follow snapshot/interp positions only — no client physics authority |
| Resize window | C-01 letterboxes; C-02 does not reflow world layout |
| End non-level | Minimal world layers; UI-heavy via C-11 |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| `MockWorldDisplaySource` | 30 Hz synthetic haulers + scripted events |
| `MockLevelVisualDesc` | Checkerboard mid; factors 0.5/1.0/1.25; 64×20×32 bounds |
| `MockAtlasPack` | 1×1 debug textures under full key contract |
| Golden AnimState→key | Table fixture |
| Golden GameEvent→VFX key | Table fixture |
| Snapshots | 0 / 20 treasures / max carry |

**Determinism:** Pure camera/parallax tests use fixed positions and Δcam. No network. Visual tests accept placeholder art variance; assert structure not pixels unless screenshot baseline added later.

---

## 7. Mocks / fakes

| Double | Role |
|---|---|
| PhaserSceneLike | Minimal add/image/cameras API for component tests |
| MockWorldDisplaySource | SE-1 parallel without live room |
| PlaceholderFactory | Missing-key rects |
| C-04 stream mock | Integration harness |

No server packages or Node `fs` inside presentation modules.

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| C-04 mock snapshot stream | P2+ Level scene |
| C-09 LevelVisualDesc | Parallax fields from level-format |
| C-11 scripted camera | PRES-19 |
| SYS viewport / integer scale | System §3 browser matrix |
| Human Session F | Readability of multi-target + VFX chaos |

---

## 9. Exit criteria

- [ ] Given WorldDisplayView, haulers at correct logical positions (≤1 px with integer camera)  
- [ ] Parallax factors match design defaults  
- [ ] Multi-target Level + fixed Instructions/Fork verified  
- [ ] spill/stun/pickup/trap_trigger VFX smoke green  
- [ ] Missing atlas never throws  
- [ ] Placeholder→final pack swap needs no API change  
- [ ] No server imports  
- [ ] Soft-unique seats distinguishable  
- [ ] 960×540 composition + C-01 letterbox cooperation documented and smoke-checked  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Interpolation jitter vs camera shake | C-04 owns interp; clamp camera lerp; PRES-16 |
| Zoom multi-target mushy pixels | MVP pan-only zoom=1 |
| VFX overload on spill chaos | Pool + cap concurrent bursts |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [level-format.md](../../interfaces/level-format.md)  
- [netcode-client/TEST-PLAN.md](../netcode-client/TEST-PLAN.md)  
- [end-screen/TEST-PLAN.md](../end-screen/TEST-PLAN.md)  
- [INTEGRATION-TEST-PLAN.md](../../testing/INTEGRATION-TEST-PLAN.md)  
- [SYSTEM-TEST-PLAN.md](../../testing/SYSTEM-TEST-PLAN.md)  
