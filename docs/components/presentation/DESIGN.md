# C-02 — Presentation & Camera — Design

| Field | Value |
|---|---|
| **Component** | C-02 Presentation & Camera |
| **Ownership** | SE-2 |
| **Status** | **Partial P2–P3** — dev GameScene (grid + rect haulers + treasure atlas); full sprites/camera/VFX open |
| **Engine** | Phaser 3 (client only) |
| **Related** | [COMPONENTS.md](../../COMPONENTS.md) §C-02, [ARCHITECTURE.md](../../ARCHITECTURE.md), [netcode-messages.md](../../interfaces/netcode-messages.md), [level-format.md](../../interfaces/level-format.md) |
| **Frozen decisions** | Q5 — 960×540 logical, integer scale, letterbox ([ARCHITECT-OPEN-QUESTIONS.md](../../decisions/ARCHITECT-OPEN-QUESTIONS.md)) |

---

## 1. Purpose

C-02 turns authoritative **world state** and **gameplay events** into what the player sees: hauler sprites and animations, treasure and trap visuals, biome parallax layers, a multi-target follow camera, one-shot VFX, and a fixed interface overlay.

It is a **dumb presenter**. Server simulation owns positions, ownership, and collisions. The client camera is for readability only — never for fairness or anti-cheat.

C-02 enables parallel work: SE-1 can drive scenes with mock snapshots; SE-3/4 can ship netcode with placeholders; art can swap atlases without touching sim or protocol.

---

## 2. Responsibilities

1. **Sprite / animation binding** — Map each `HaulerPublic` (and other public entities) to Phaser display objects; bind `anim` / `AnimState` to atlas animations; flip by `facing`.
2. **Entity presentation** — Free and carried treasures, dynamic traps/switches, carry-stack visual stacking (non-stackable-height items per design notes).
3. **Parallax layer stack** — Far / Near / Mid / Fore / UI with scroll factors matching level metadata (defaults below).
4. **Camera policy** — Multi-target framing for all active haulers during Level; fixed (non-scrolling) camera on Instructions and Fork; optional follow of `cameraHint`; End-screen pan hooks for C-11.
5. **VFX from events** — Consume `S2C_Event` / `GameEvent` for one-shot effects (pickup spark, spill burst, stun stars, trap flash, trip impact, etc.).
6. **Placeholder atlas contract** — Stable texture/animation keys so final art replaces placeholders without API churn.
7. **Logical viewport assumptions** — Author and compose for **960×540** logical pixels; pixel-art friendly rounding; cooperate with C-01 letterbox scale manager.
8. **Depth / draw order** — Deterministic layer depths so UI always tops Fore, entities sit on Mid, decorations stay in decorative layers.
9. **Presentation hooks for audio** — Emit local presentation cues (optional callbacks) that C-13 may also listen for; do not play audio itself beyond optional debug.

---

## 3. Non-responsibilities

| Out of scope | Owner |
|---|---|
| Collision, physics, ownership, scoring | C-06 / C-07 |
| WebSocket, prediction, reconciliation, interpolation buffers | C-04 (C-02 consumes **already-smoothed** display poses) |
| Scene graph, attract loop, lobby UI chrome, scale manager bootstrap | C-01 |
| End cinematic sequencing logic (who tosses when, title order) | C-11 (C-02 supplies camera/sprite primitives) |
| Pixel-map parsing, collision grids | C-09 |
| Music / SFX policy and AudioContext unlock | C-13 |
| Input mapping | C-03 |
| Using camera bounds as server anti-cheat | Server only; client camera is cosmetic |
| Asset production / generative pipelines | Art track (`docs/art/` later) |

---

## 4. Dependencies

### Upstream (reads)

| Source | What C-02 needs |
|---|---|
| **C-04 Netcode Client** | Latest `WorldSnapshot` display view (local predicted hauler + interpolated remotes); `S2C_Event` stream; phase changes |
| **C-09 visual metadata** (via level load / client content) | Biome / tileset keys, `LevelDefinition.parallax`, decorative row ids, block size (default **32×32** world blocks) |
| **C-01 Shell** | Host Phaser scene, scale manager (FIT + center letterbox), asset preload hooks |
| **`packages/protocol`** | `HaulerPublic`, `TreasurePublic`, `TrapPublic`, `SwitchPublic`, `GameEvent`, `SessionPhase`, `AnimState`, `CharacterId` |

### Downstream (serves)

| Consumer | What C-02 provides |
|---|---|
| **C-01** | `IPresentationView` attach/detach per scene; title walk-in helpers |
| **C-11** | Camera pan / focus APIs; hauler pose set for cinematic (still display-only) |
| **C-13** | Optional `onPresentationCue` for mirrored VFX→SFX (events remain primary) |

### Independence rules

- No Node APIs; no server imports.
- No authoritative gameplay mutation.
- Prefer protocol types only at the presentation boundary (adapters map snapshot → view models inside C-02).

---

## 5. Public interface

Conceptual TypeScript shapes (documentation; not application code). Names may live under a future `client/src/presentation/` module.

### 5.1 Lifecycle

```text
IPresentationView {
  attach(scene: PhaserSceneLike, options: PresentAttachOptions): void
  detach(): void
  setLevelVisuals(level: LevelVisualDesc): void   // tileset keys, parallax, bounds
  clearLevel(): void
  setCameraMode(mode: CameraMode): void
  update(dtMs: number, view: WorldDisplayView): void
  handleEvent(event: GameEvent): void
  setUiOverlayVisible(visible: bool): void
}
```

```text
PresentAttachOptions {
  logicalWidth: 960
  logicalHeight: 540
  pixelArt: true                 // round positions / nearest filter
  debugCamera?: bool
}
```

### 5.2 Display view (from C-04, not raw wire if prediction applied)

```text
WorldDisplayView {
  tick: number
  phase: SessionPhase
  levelId?: string
  haulers: HaulerDisplay[]       // post-prediction / interpolation
  treasures: TreasurePublic[]
  traps: TrapPublic[]
  switches: SwitchPublic[]
  cameraHint?: { x: number, y: number, z?: number }
  worldBounds?: { x, y, width, height }
}

HaulerDisplay {
  seatId: 0..3
  character: CharacterId
  control: "human" | "ai"
  x: number
  y: number
  facing: 1 | -1
  anim: AnimState
  carry: { instanceId, defId }[]
  stunned: bool
  name?: string
  isLocalSeat?: bool             // optional highlight
}
```

`AnimState` (aligned with architecture / `HaulerPublic.anim`):

```text
"idle" | "run" | "jump" | "duck" | "throw" | "drop"
| "push_trip" | "hurt" | "stunned" | "falling"
```

Presentation maps wire casing if protocol uses PascalCase (`Idle`) via a single adapter table — **one canonical client enum**.

### 5.3 Camera

```text
CameraMode =
  | { kind: "fixed"; focus: { x, y }; zoom?: number }
  | { kind: "multi_target"; paddingPx: number; minZoom: number; maxZoom: number;
      lerp: number; includeSeats?: number[] }
  | { kind: "hint_follow"; fallback: "multi_target" | "fixed" }
  | { kind: "scripted"; /* C-11 drives via setScriptedCamera */ }
```

```text
ICameraController {
  setMode(mode: CameraMode): void
  setWorldBounds(bounds: AABB): void
  setScriptedCamera(pose: { x, y, zoom }, opts?: { durationMs, ease }): void
  getViewRect(): AABB            // logical world rect currently visible
  // Does NOT report "pressure edge" to server — that is sim-side policy
}
```

**Screen defaults (design fidelity)**

| Phase / screen | Camera mode |
|---|---|
| Title / Credits / High Scores | Scene-owned (C-01); C-02 may supply scrolling BG helper only |
| Lobby | UI-centric; no multi-target world camera |
| **Instructions** | **Fixed** — no scroll, no zoom |
| **Level** (Hoard + Level N) | **Multi-target** — keep all active haulers framed; soft zoom-out if spread |
| **Fork** | **Fixed** (or fixed on fork stage bounds) |
| **End** cinematics | **Scripted** under C-11 (pan follow, circle focus) |

### 5.4 Parallax & layers

```text
ParallaxLayerId = "far" | "near" | "mid" | "fore" | "ui"

LayerScrollFactors (defaults; overridden by LevelDefinition.parallax) {
  far:  0.50    // 50% of camera delta
  near: 1.00    // 100%
  mid:  1.00    // interactive world; locked to camera (scroll factor 1)
  fore: 1.25    // 125%
  ui:   0.00    // screen-fixed overlay (scroll factor 0)
}
```

Depth order (low → high):

1. **Far** — distant biome sky / silhouettes  
2. **Near** — near-background decorative (pixel-map top decorative row / `near_bg_*`)  
3. **Mid** — collision tiles, haulers, free treasure, traps, switches  
4. **Fore** — foreground props (`fore_*`, bottom decorative row)  
5. **UI** — HUD, names, connection banner hooks, fork tallies chrome (if not pure DOM)

```text
LevelVisualDesc {
  levelId: string
  biome: Biome
  blockSizePx: number            // default 32
  widthPx: number
  heightPx: number
  tilesetAtlasKey: string        // e.g. "tiles_dungeon"
  farKey: string                 // e.g. "bg_far_dungeon"
  nearDecor: DecorCell[]
  midTiles: TileCell[]           // visual only; may mirror sim grid
  foreDecor: DecorCell[]
  parallax: { farScroll, nearScroll, foreScroll }  // from LevelDefinition
}
```

Mid is always interactive presentation space; its scroll factor is **1.0** relative to the main camera (objects placed in world space). Far/Near/Fore use scroll factors (or manual offset from camera) per table above. Level format defaults: `farScroll: 0.5`, `nearScroll: 1.0`, `foreScroll: 1.25`.

### 5.5 Atlas key contract (placeholder-friendly)

Keys are **stable strings**. Placeholders and final art share keys; only texture packs change.

| Category | Key pattern | Example |
|---|---|---|
| Hauler anims | `hauler/{character}/{anim}` | `hauler/gnome/run` |
| Hauler still | `hauler/{character}/idle` | |
| Treasure | `treasure/{defId}` | `treasure/coin_sack` |
| Treasure rarity fallback | `treasure/_rarity/{common\|rare\|unique\|set}` | |
| Tileset | `tiles/{biome}` | `tiles/ice` |
| Far BG | `bg/far/{biome}` | `bg/far/lava` |
| Near strip | `bg/near/{id}` | |
| Fore prop | `fg/{id}` | |
| Trap | `trap/{kind}` | `trap/spikes` |
| Switch | `switch/{kind}` | `switch/heavy` |
| VFX | `vfx/{effect}` | `vfx/spill`, `vfx/stun_stars`, `vfx/pickup` |
| UI chrome | `ui/{name}` | `ui/nameplate` |

Missing texture → draw **color rect / labeled placeholder** (never throw mid-frame). Log once per missing key.

### 5.6 VFX / events

```text
IVfxRouter {
  handle(event: GameEvent): void
  update(dtMs: number): void
  clear(): void
}
```

| `GameEvent.type` | Presentation response (MVP) |
|---|---|
| `pickup` | Brief spark at seat; treasure sprite attaches to carry stack |
| `drop` | Treasure pops to world `(x,y)`; small dust |
| `throw` | Arc trail optional; sprite becomes free with velocity visual only if client-interpolated |
| `spill` | Burst of item sprites outward; stun ring on hauler |
| `stun` | Stars / flash on seat; force `stunned` anim if snapshot lags one frame |
| `trip` | Impact between attacker/target |
| `trap_trigger` | Trap-specific flash/animation by `kind` |
| `level_exit` | Optional exit spark / order callout (UI) |
| `switch` | Depress/release anim on switch sprite |
| `ai_takeover` / `human_takeover` | Subtle nameplate tint / icon change |

Events are **best-effort**. After reconnect, rely on snapshot for steady state (per netcode contract).

### 5.7 UI overlay (presentation-owned slice)

C-02 owns **world-adjacent** HUD primitives, not full menu layout:

- Nameplates / seat colors / AI badge  
- Optional local-player outline  
- Carry count chip (optional MVP)  
- Debug: tick, camera rect (dev flag)

Lobby buttons, fork argue meters layout, end title panels → C-01 / C-11, which may still request C-02 layer hosting.

---

## 6. Internals

### 6.1 Module breakdown (suggested)

```text
presentation/
  PresentationView.ts       # IPresentationView facade
  camera/CameraController.ts
  layers/ParallaxStack.ts
  entities/HaulerPresenter.ts
  entities/TreasurePresenter.ts
  entities/TrapPresenter.ts
  anim/AnimBinder.ts        # AnimState → animation key + transitions
  vfx/VfxRouter.ts
  atlas/AtlasKeys.ts        # constants only
  atlas/PlaceholderFactory.ts
```

### 6.2 Snapshot → sprites loop

Each `update`:

1. Read `WorldDisplayView` (immutable for this frame).  
2. Upsert hauler sprites by `seatId`; remove seats not present only if phase policy says so (Instructions may hide AI — C-04/sim already omit or mark; presenter hides `control==ai` only when scene flag `hideAi` is set by C-01 for Instructions).  
3. Bind `anim`: if state changed, play animation; if same looping state, do not restart mid-cycle.  
4. Apply `facing` as flipX.  
5. Sync treasure free-world sprites by `instanceId`; parent carried items to hauler carry anchor with stack offsets.  
6. Sync trap/switch frames from public state + recent events.  
7. Advance camera (lerp toward multi-target bounds or hold fixed).  
8. Apply parallax offsets from camera scroll.  
9. Tick VFX lifetimes; recycle pools.

### 6.3 Multi-target camera algorithm (MVP)

1. Collect positions of included haulers (default all 4 in Level; Instructions uses present humans only).  
2. Compute axis-aligned bounding box + `paddingPx` (e.g. 64–96).  
3. Desired center = box center; desired zoom = clamp so box fits in 960×540, within `[minZoom, maxZoom]` (MVP may fix zoom=1 and only pan).  
4. Lerp camera scroll (and zoom if enabled) with factor `lerp` (frame-rate independent).  
5. Clamp to `worldBounds` if set.  
6. Prefer **integer scroll** when `pixelArt` (round camera position) to reduce shimmer.

**MVP simplification:** pan only, zoom locked at 1.0; zoom-out when spread is stretch.

### 6.4 Carry stack visuals

- Anchor above hauler sprite; order = carry array order (index 0 = top / first dropped).  
- Vertical offset per item; `stackableVisual` treasures (e.g. coin sacks) may share a counter badge instead of infinite height — driven by content flag when available; default offset stack for MVP placeholders.  
- On `spill` / `drop` / `throw`, detach with short tween toward snapshot free positions.

### 6.5 Letterbox & resolution

- **Logical resolution:** 960×540 (frozen Q5).  
- **C-01** configures Phaser Scale Manager: `FIT` (or equivalent), center horizontally/vertically, letterbox bars outside.  
- **C-02** places all world content in logical coordinates; never sizes to window CSS pixels directly.  
- Integer scale preferred for crisp pixels when window allows; non-integer FIT still acceptable with nearest-neighbor filtering.

### 6.6 Title / attract helpers (optional API)

Lightweight helpers for C-01 (not full scene ownership):

- Constant-rate far/near scroll without multi-target camera  
- Character walk-in from left, idle fidget, run-off to right  

### 6.7 Performance budget (guidance)

- 4 haulers + ≤ dozens of treasure sprites + tilemap layers on mid-tier integrated GPU  
- Pool VFX particles/sprites; cap concurrent burst VFX (e.g. 32)  
- Prefer single tileset texture per biome; avoid per-tile unique textures

---

## 7. Edge cases

| Case | Behavior |
|---|---|
| Hauler teleports after reconcile | Snap sprite; optional short squash; no long lerp across map |
| Missing anim frame for state | Fallback chain: state → `idle` → colored rect |
| Missing atlas key | Placeholder rect + one-time warn |
| Seat AI ↔ human swap | Update badge/tint; keep pose continuous |
| Instructions drop-in | Show fall-in tween from top-left if C-01 requests; fixed camera |
| Instructions hide AI | Do not draw AI seats when `hideAi` |
| All haulers clustered vs spread | Multi-target padding; MVP clamp pan speed to reduce nausea |
| One hauler far ahead | Prefer include-all framing; do not hard-gate movement (server may AI-takeover at edge — not C-02) |
| Empty treasure list after spill | Events may be lost; snapshot is truth within 1–2 ticks |
| `cameraHint` present | Soft bias multi-target center toward hint (weight < hauler box) |
| Phase change Level→Fork | `setCameraMode(fixed)`; clear level VFX; optional fade owned by C-01 |
| Tab background / huge `dt` | Clamp presentation `dt`; camera lerp uses capped dt |
| Resize window | Scale manager letterboxes; C-02 does not reflow world layout |
| Carry > visual comfort | Cap drawn stack height; show `+N` |
| Throw / projectile treasure | Follow free treasure positions from snapshots/interpolation; no client-side physics authority |
| Fork / End non-level | Minimal world layers; UI heavy |

---

## 8. Mocks & test doubles

For SE-1/SE-2 parallel work without a live room:

### 8.1 `MockWorldDisplaySource`

- Emits synthetic `WorldDisplayView` at 30 Hz.  
- Four haulers walk a box level; cycles `anim` through idle/run/jump.  
- Scripted events: pickup, spill, trap_trigger on a timer.  
- Toggle camera modes for manual QA.

### 8.2 `MockLevelVisualDesc`

- Solid-color biome far layer; checkerboard mid tiles; stripe fore.  
- Bounds e.g. 64×20 blocks × 32 px.  
- Parallax factors exactly 0.5 / 1.0 / 1.25.

### 8.3 `MockAtlasPack`

- Loads 1×1 or numbered debug textures registered under full atlas key contract.  
- Character = distinct tint per `CharacterId`.

### 8.4 Contract fixtures

- Golden list of `AnimState` → key mappings.  
- Golden list of `GameEvent.type` → VFX key.  
- Snapshot with 0 treasures / 20 treasures / max carry for layout tests.

---

## 9. Acceptance criteria

### Functional

- [ ] Given a `WorldDisplayView`, all haulers render at correct logical positions within ≤ 1 px rounding error when camera scroll is integer.  
- [ ] Each `AnimState` selects a distinct animation key (or documented fallback) for every `CharacterId`.  
- [ ] `facing = -1` mirrors sprite; `1` is default.  
- [ ] Parallax: Far moves at **50%**, Near **100%**, Fore **125%** of camera delta; Mid world objects stay world-anchored; UI scroll factor **0**.  
- [ ] Level mode camera keeps all included haulers inside the visible 960×540 logical view with configured padding when spread fits `minZoom` (or pan-only MVP).  
- [ ] Instructions / Fork camera modes do not scroll with hauler motion.  
- [ ] `handleEvent` for `spill`, `stun`, `pickup`, `trap_trigger` spawns visible VFX (placeholder OK) without throwing.  
- [ ] Unknown atlas keys render placeholders; game loop continues.  
- [ ] Logical composition assumes **960×540**; with C-01 FIT letterbox, content is centered with bars on mismatched aspect ratios.  
- [ ] No dependency on server camera for correctness; omitting `cameraHint` still frames haulers.

### Non-functional

- [ ] Presentation update is O(entities) with no per-frame texture reloads.  
- [ ] Swap of placeholder PNG pack to final pack requires **no** presenter API changes if keys match.  
- [ ] No imports from server packages or Node built-ins.

### Integration

- [ ] Works against C-04 mock snapshot stream in a Phaser Level scene (P2+).  
- [ ] Accepts `LevelVisualDesc` produced from C-09 metadata (or mock) including `parallax` fields from [level-format.md](../../interfaces/level-format.md).  
- [ ] C-11 can switch to scripted camera without tearing down hauler presenters.

---

## 10. Open implementation notes (non-blocking)

1. **Zoom in multi-target:** MVP pan-only vs soft zoom — default **pan-only** for pixel-art crispness; document flag.  
2. **Y-down** coordinates per level-format (Phaser default).  
3. **Tilemap vs blitted sprites** for mid layer: prefer Phaser tilemap when C-09 emits grid; placeholders may be rectangle mesh.  
4. Exact RGB placeholder palette deferred to `docs/art/`.  
5. Whether nameplates are bitmap text or DOM overlay is a C-01/C-02 joint choice; default **in-canvas** for letterbox consistency.

---

## 11. Traceability

| Requirement | Source |
|---|---|
| Parallax Far 50% / Near 100% / Mid interactive / Fore 125% / UI | COMPONENTS C-02; level-format `parallax` |
| Multi-target + fixed Instructions/Fork | COMPONENTS C-02; design §1.3 Instructions fixed camera |
| VFX from `S2C_Event` | COMPONENTS C-02; netcode-messages `GameEvent` |
| Placeholder atlas keys | COMPONENTS C-02; ARCHITECTURE assumption 10 |
| 960×540 letterbox | Q5 frozen A; ARCHITECTURE NFR |
| Anim binding from hauler anim state | COMPONENTS C-02; ARCHITECTURE `animState` / `HaulerPublic.anim` |
| Camera not anti-cheat | COMPONENTS C-02 non-responsibility |
| Optional `cameraHint` | netcode-messages `WorldSnapshot` |
