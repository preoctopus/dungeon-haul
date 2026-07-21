# C-02 — Presentation & Camera — Tasks

| Field | Value |
|---|---|
| **Component** | C-02 Presentation & Camera |
| **Ownership** | SE-2 |
| **Design** | [DESIGN.md](DESIGN.md) |
| **Sizing** | **S** ≤ ~0.5 day · **M** ~1–2 days · **L** ~3–5 days (docs/impl estimate; no code in this phase) |

Tasks are **documentation-ready work packages** for implementation. Mark deps as `—` when unblocked after protocol/design freeze. Parallel tracks are noted under each epic.

---

## Epic map

| Epic | Focus | Parallel with |
|---|---|---|
| **A** Atlas & placeholders | Keys, packs, missing-texture policy | B, C (interfaces only) |
| **B** Viewport & camera | 960×540 assumptions, modes | A |
| **C** Layers / parallax | Far–UI stack | A, B (needs camera scroll) |
| **D** Entity presenters | Hauler/treasure/trap binding | A; needs mock view |
| **E** Anim binder | `AnimState` map | A, D |
| **F** VFX / events | `GameEvent` router | A; partial D |
| **G** Integration mocks | Mock stream, Level scene harness | After A–C stubs |
| **H** Polish & QA | Edge cases, pixel rounding, perf | After D–F |

```text
A (atlas) ─────────┬──► D (entities) ──► E (anim) ──► H
                   ├──► F (vfx) ───────────────────► H
B (camera) ──► C (parallax) ───────────────────────► G ──► H
A+B+C stubs ───────────────────────────────────────► G
```

---

## Task list

### C02-T01 — Atlas key catalog & placeholder policy

| | |
|---|---|
| **Size** | S |
| **Deps** | — |
| **Parallel** | Yes (with T02–T04) |

**Work**

- Freeze key patterns from DESIGN §5.5 (`hauler/…`, `treasure/…`, `tiles/…`, `bg/far/…`, `vfx/…`, `ui/…`).  
- Document missing-key fallback (colored rect + once-per-key log).  
- List minimum placeholder set for P2 netcode slice (4 haulers idle/run, 1 tile, 1 far bg).

**Acceptance**

- [ ] Key table committed in design or `docs/art/` note linked from DESIGN.  
- [ ] P2 minimum pack enumerated (≤ 20 keys).  
- [ ] Fallback behavior written; no “throw on missing texture” allowed.

---

### C02-T02 — Logical viewport contract (960×540 letterbox)

| | |
|---|---|
| **Size** | S |
| **Deps** | — (coord with C-01 scale manager) |
| **Parallel** | Yes |

**Work**

- Document C-01 vs C-02 split: Shell owns Scale.FIT + center; Presentation authors in 960×540.  
- Specify pixelArt rounding (sprite positions, camera scroll).  
- Note integer scale preference when window permits.

**Acceptance**

- [ ] Boundary with C-01 explicit in DESIGN (already) and acknowledged in task notes if Shell DESIGN differs.  
- [ ] Test plan: mismatched aspect ratio shows letterbox bars; world not stretched non-uniformly.  
- [ ] Q5 frozen decision referenced.

---

### C02-T03 — `IPresentationView` / attach API freeze

| | |
|---|---|
| **Size** | S |
| **Deps** | — |
| **Parallel** | Yes |

**Work**

- Finalize public methods: `attach`, `detach`, `setLevelVisuals`, `setCameraMode`, `update`, `handleEvent`.  
- Align field names with `packages/protocol` when stubs land (`HaulerPublic.anim`, etc.).  
- Define `WorldDisplayView` as post-netcode display DTO (not raw wire requirement).

**Acceptance**

- [ ] Interface section stable enough for SE-1 mock usage.  
- [ ] No gameplay mutators on the interface.  
- [ ] Adapter note for `AnimState` casing (wire vs client).

---

### C02-T04 — Camera modes design & multi-target algorithm

| | |
|---|---|
| **Size** | M |
| **Deps** | T02 |
| **Parallel** | With T01, T03, T05 |

**Work**

- Specify `fixed`, `multi_target`, `hint_follow`, `scripted` modes.  
- Multi-target: bbox + padding, lerp, world clamp, MVP **pan-only** (zoom optional flag).  
- Screen matrix: Instructions/Fork fixed; Level multi-target; End scripted for C-11.  
- Explicit: camera not used for anti-cheat / AI edge (server-owned).

**Acceptance**

- [ ] Mode table complete with phase defaults.  
- [ ] Algorithm steps testable with four fixed positions (unit-style pure function later).  
- [ ] `cameraHint` soft-bias behavior described.  
- [ ] Scripted API sufficient for C-11 pan-follow.

---

### C02-T05 — Parallax stack (Far 50% / Near 100% / Mid / Fore 125% / UI)

| | |
|---|---|
| **Size** | M |
| **Deps** | T02; soft-dep T04 for scroll source |
| **Parallel** | After T02; with T01, T03 |

**Work**

- Layer ids, depth order, default scroll factors 0.5 / 1.0 / 1.0 / 1.25 / 0.  
- Map `LevelDefinition.parallax` (`farScroll`, `nearScroll`, `foreScroll`) onto factors.  
- Mid = interactive world (tiles + entities), camera-space scroll factor 1.  
- UI overlay scroll factor 0.  
- Decorative near/fore from level visual desc (`near_bg_*`, `fore_*`).

**Acceptance**

- [ ] Moving camera by Δx moves Far by 0.5Δx, Near 1.0Δx, Fore 1.25Δx (design test).  
- [ ] UI elements do not drift with camera.  
- [ ] Mid entities stay at world coordinates.  
- [ ] Overrides from level meta documented.

---

### C02-T06 — `LevelVisualDesc` adapter from C-09 metadata

| | |
|---|---|
| **Size** | M |
| **Deps** | T05 (contract); C-09 `LevelDefinition` interface |
| **Parallel** | With T07 once shapes frozen |

**Work**

- Map biome → `tiles/{biome}`, `bg/far/{biome}`.  
- Body grid → mid visual cells; decorative rows → near/fore.  
- `blockSizePx` default 32; y-down.  
- Mock `LevelVisualDesc` for BoxLevel / Hoard without full art.

**Acceptance**

- [ ] Adapter inputs only published level fields (no sim private state).  
- [ ] Mock level renders distinct far/mid/fore in harness.  
- [ ] Unknown biome falls back to neutral keys.

---

### C02-T07 — Hauler presenter (sprites + seats)

| | |
|---|---|
| **Size** | M |
| **Deps** | T01, T03 |
| **Parallel** | With T08, T09 |

**Work**

- Upsert 4 seats by `seatId`; position/facing from `HaulerDisplay`.  
- Local seat optional highlight; AI badge.  
- Instructions `hideAi` flag.  
- Reconcile snap policy (no cross-map lerp).

**Acceptance**

- [ ] Four haulers track mock view positions each frame.  
- [ ] AI badge toggles on `control` change without respawn flicker.  
- [ ] `hideAi` removes AI sprites on Instructions.  
- [ ] Missing character atlas → placeholder, no crash.

---

### C02-T08 — Treasure & carry-stack presenter

| | |
|---|---|
| **Size** | M |
| **Deps** | T01, T07 (anchors) |
| **Parallel** | Partial with T09 |

**Work**

- Free-world treasures by `instanceId` + `defId` keys.  
- Carry stack offsets; top-of-stack = first drop/throw.  
- Cap visual height + `+N`.  
- Rarity fallback keys when `defId` art missing.

**Acceptance**

- [ ] Free treasure appears at snapshot positions.  
- [ ] Carried items follow hauler anchor.  
- [ ] Stack order matches `carry[]` order.  
- [ ] 10+ carry still readable (cap/`+N`).

---

### C02-T09 — Trap & switch presenter

| | |
|---|---|
| **Size** | S |
| **Deps** | T01, T03 |
| **Parallel** | With T07, T08 |

**Work**

- Map `TrapPublic` / `SwitchPublic` to atlas keys.  
- Idle vs triggered/pressed frames.  
- MVP subset: spikes + generic trap + basic switch (align P3).

**Acceptance**

- [ ] Traps/switches render from snapshot without events.  
- [ ] Pressed switch shows distinct frame.  
- [ ] Unknown `kind` → placeholder.

---

### C02-T10 — Animation binder (`AnimState` → clips)

| | |
|---|---|
| **Size** | M |
| **Deps** | T01, T07 |
| **Parallel** | With T08/T09 after T07 starts |

**Work**

- Full map: idle, run, jump, duck, throw, drop, push_trip, hurt, stunned, falling.  
- Do not restart looping anim every snapshot.  
- Compelled states (hurt/stunned/falling) override cosmetics until cleared.  
- Per-character keys under `hauler/{character}/{anim}`.

**Acceptance**

- [ ] Golden table: every `AnimState` × `CharacterId` resolves a key or fallback.  
- [ ] Rapid idle↔idle snapshots do not restart anim from frame 0.  
- [ ] Stunned forces visible stunned presentation even if one event was dropped (snapshot `stunned` / anim).

---

### C02-T11 — VFX router from `S2C_Event` / `GameEvent`

| | |
|---|---|
| **Size** | M |
| **Deps** | T01; soft-dep T07 for seat anchors |
| **Parallel** | With T10 |

**Work**

- Implement routing table from DESIGN §5.6.  
- Pool one-shot sprites; lifetime update; clear on phase change.  
- Tolerate lost events (snapshot recovery).  
- Optional `onPresentationCue` for C-13.

**Acceptance**

- [ ] `pickup`, `spill`, `stun`, `trap_trigger`, `trip` produce visible VFX in mock harness.  
- [ ] Burst cap prevents runaway spawn.  
- [ ] `clear()` on Level→Fork leaves no stuck particles.  
- [ ] Unknown event type ignored safely.

---

### C02-T12 — Mock world stream & Phaser harness

| | |
|---|---|
| **Size** | M |
| **Deps** | T03, T04, T05 stubs; ideally T07 |
| **Parallel** | After stubs; unblocks SE-1 |

**Work**

- `MockWorldDisplaySource` 30 Hz with walkers + scripted events.  
- `MockAtlasPack` + `MockLevelVisualDesc`.  
- Minimal Phaser scene (or C-01 dev scene) attaching `IPresentationView`.  
- Debug toggles: camera mode, show layer factors, show nameplates.

**Acceptance**

- [ ] Engineer can run harness without server.  
- [ ] Demonstrates parallax factors and multi-target pan.  
- [ ] SE-1 can substitute mock for C-04 in Level scene work.  
- [ ] Documented run steps (README blurb or harness header comment when code exists).

---

### C02-T13 — C-04 integration adapter

| | |
|---|---|
| **Size** | M |
| **Deps** | T03, T07; C-04 display pose API |
| **Parallel** | After netcode slice poses available |

**Work**

- Map C-04 predicted local + interpolated remotes → `WorldDisplayView`.  
- Subscribe to event channel → `handleEvent`.  
- Phase changes → camera mode switches.  
- Reconnect: full snapshot rebuild presenters (no reliance on missed events).

**Acceptance**

- [ ] Live or stub room: haulers match net display poses.  
- [ ] Local prediction visual does not fight presenter (single pose source).  
- [ ] Reconnect resyncs sprites from snapshot only.

---

### C02-T14 — Title / attract presentation helpers

| | |
|---|---|
| **Size** | S |
| **Deps** | T05 (scroll), T07 optional |
| **Parallel** | With T11–T12; C-01 driven |

**Work**

- Constant-rate background scroll helper.  
- Walk-in, idle fidget, run-off hooks for four characters.  
- No multi-target camera on title.

**Acceptance**

- [ ] C-01 can call helpers without owning parallax math.  
- [ ] Run-off + fade coordination points documented (fade owned by C-01).

---

### C02-T15 — End-screen camera / sprite hooks (for C-11)

| | |
|---|---|
| **Size** | S |
| **Deps** | T04 scripted mode, T07 |
| **Parallel** | With C-11 design |

**Work**

- `setScriptedCamera` duration/ease.  
- Focus hauler / pile anchor helpers.  
- Do not implement share title layout (C-11).

**Acceptance**

- [ ] C-11 can pan follow without custom Phaser camera code.  
- [ ] Hauler presenters remain updatable under scripted mode.

---

### C02-T16 — Pixel-art polish & edge-case pass

| | |
|---|---|
| **Size** | M |
| **Deps** | T07–T11, T04–T05 |
| **Parallel** | Finalizing |

**Work**

- Integer camera scroll; nearest filter verification.  
- Large `dt` clamp; phase teardown.  
- Carry cap visual; missing keys audit.  
- Perf smoke: 4 haulers + 30 treasures + spill VFX.

**Acceptance**

- [ ] No sustained texture upload per frame.  
- [ ] Edge-case table in DESIGN §7 checked off or explicitly deferred.  
- [ ] Letterboxed 960×540 looks correct at 16:9 and 4:3 window tests.

---

### C02-T17 — Acceptance test checklist & fixtures

| | |
|---|---|
| **Size** | S |
| **Deps** | T12+ |
| **Parallel** | With T16 |

**Work**

- Translate DESIGN §9 into harness/manual QA checklist under `docs/testing/` when testing track opens (or keep appendix here until then).  
- Golden anim key map fixture.  
- Golden event→VFX map fixture.

**Acceptance**

- [ ] Checklist covers parallax factors, camera modes, anim bind, VFX, letterbox, placeholder swap.  
- [ ] Fixtures are data-only (JSON/md tables), no game code required to review.

---

## Suggested implementation order (when coding starts)

| Wave | Tasks | Goal |
|---|---|---|
| **W0** | T01, T02, T03 | Contracts frozen |
| **W1** | T04, T05, T12 (stub) | Camera + parallax visible in harness |
| **W2** | T07, T10, T01 pack | Moving animated haulers |
| **W3** | T08, T09, T11 | Loot/traps/VFX |
| **W4** | T06, T13 | Content + net integration |
| **W5** | T14, T15, T16, T17 | Shell/End polish + QA |

---

## Cross-component coordination

| Partner | Sync points |
|---|---|
| **C-01 Shell** | Scale manager letterbox; scene attach; Title helpers; `hideAi` on Instructions |
| **C-04 Netcode** | `WorldDisplayView` pose source; event bus; phase change |
| **C-09 Levels** | `LevelDefinition.parallax`, biome keys, decorative ids |
| **C-11 End** | Scripted camera; no score math in C-02 |
| **C-13 Audio** | Shared `GameEvent` consumption; optional presentation cues |
| **Art** | Atlas packs matching T01 keys; drop-in replace placeholders |

---

## Out of task scope (do not schedule under C-02)

- Authoritative physics or camera-edge AI policy  
- Share modifier / spoils UI sequencing  
- Lobby REST or high-score tables  
- Full biome final art production  
- Generative asset pipeline (Build Plan)  
