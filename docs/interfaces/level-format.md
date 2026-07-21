# Contract: Level Format

**Producers:** Level authors, content pipeline  
**Consumers:** Level Content Loader → Authoritative Simulation; optional client preview  
**Related:** Design doc §3.2–3.3

---

## Goals

- Human-authorable maps via **pixel image** (1 pixel = 1 block).  
- Deterministic parse → `LevelDefinition`.  
- Biome/tileset selected by header pixel.  
- Support traps, treasure slots, switches, decorative layers.

---

## File package

```text
content/levels/<levelId>/
  map.png                 # required pixel map
  meta.json               # required sidecar
  (optional) preview.png
```

### `meta.json`

```text
{
  "id": "hoard_01",
  "displayName": "The Treasure Hoard",
  "biome": "gold",
  "blockSizePx": 32,
  "pathTags": ["hoard"],
  "musicId": "hoard",
  "forkTheme": null,
  "treasureSlotDefaultRarity": "world",
  "version": 1
}
```

`biome`: `gold | outside | dungeon | lava | ice | cavern | mist`

---

## Pixel map layout (design §3.2)

```text
┌──────────────────────────────────────────┐
│ [0,0] header: tileset & background       │  ← first pixel
│ top row: near-background decorative      │
│ ...                                      │
│ body rows: midground solid/interact      │
│ ...                                      │
│ bottom row: foreground decorative        │
└──────────────────────────────────────────┘

Column 0 (first column): spacers (no data) on body rows for readability — ignored
Row 1 and second-to-last may also be spacer rows per design diagram — ignored
```

**Parser rules**

1. Load PNG RGBA.  
2. Read pixel (0,0) as tileset/biome key (must agree with `meta.biome` or override table).  
3. Classify rows:
   - Row 0: header / far-bg control  
   - Row 1: optional spacer  
   - Rows `2 .. H-3`: **body** (collision + gameplay)  
   - Row `H-2`: optional spacer  
   - Row `H-1`: foreground decorative  
4. For each body pixel, map color → cell type via palette table.  
5. Emit grid width = image width − 1 (skip col 0) or full width if col0 not spacer — **document in loader tests**.

**Assumption:** Column 0 is always ignored spacer; body height spacers as above.

---

## Color palette (initial)

Exact RGB values live in `palette.json` (content). Semantic types:

| Semantic | Examples |
|---|---|
| `empty` | air |
| `brick` | solid |
| `ice` | solid + low friction |
| `sand` | solid + high friction |
| `switch` | activatable (design: red) |
| `heavy_switch` | mass threshold |
| `spikes` | trap |
| `crumbling` | trap |
| `receding` | trap |
| `lightning_cycle` | trap |
| `lightning_switch` | trap |
| `gas_switch` | trap |
| `falling_rock_spawner` | trap |
| `golem_spawn` | enemy |
| `phantom_spawn` | enemy |
| `treasure_slot` | spawn point for rolled treasure |
| `player_spawn_0..3` | optional explicit spawns |
| `exit` | level exit zone marker |
| `near_bg_*` | decorative ids in top row |
| `fore_*` | decorative ids in bottom row |

Unmapped colors → **parse error** (fail closed).

---

## Output: `LevelDefinition`

```text
LevelDefinition {
  id: string
  biome: Biome
  blockSizePx: number
  width: number
  height: number
  cells: CellType[][]          // body only
  spawns: Vec2[4]              // default left-side if missing
  exit: AABB                   // union of exit cells expanded to world px
  treasureSlots: { x, y, filter?: RarityFilter }[]
  switchLinks: { switchId, targetIds: string[] }[]  // from meta or conventions
  parallax: {
    farScroll: 0.5
    nearScroll: 1.0
    foreScroll: 1.25
  }
  musicId: string
}
```

World coordinates: `(cellX * blockSizePx, cellY * blockSizePx)` with y-down or y-up **consistent with Phaser** (document: **y-down**, Phaser default).

---

## Runtime behaviors (sim, not format)

| Block | Behavior |
|---|---|
| Ice | reduced friction |
| Sand | increased friction / lower max speed |
| Switch | press → activate linked devices |
| Heavy switch | requires mass ≥ threshold (3 unloaded players OR fewer with treasure — design) |
| Crumbling | breaks under weight/time |
| Receding | vanishes after step delay |
| Spikes | stun + spill |
| Lightning / gas | timed or switch stun |
| Falling rock | projectile hazard |
| Golem / Phantom | entity spawners |

MVP may implement subset; unknown trap types can be stubs that log once.

---

## Level graph / fork pool

Separate data file:

```text
content/level-graph.json
{
  "start": "hoard_01",
  "legs": [
    { "afterLevelsCompleted": 0, "options": ["dungeon_a", "lava_a"] },
    ...
  ],
  "totalLevelsAfterHoard": 7
}
```

MVP may use random unplayed pair from pool (design alternative).

---

## Validation (CI)

- [ ] Spawns: 4 logical (or 1 expanded to 4)  
- [ ] At least one exit cell  
- [ ] Map dimensions ≤ max (e.g. 512×64 cells)  
- [ ] No unknown colors  
- [ ] Treasure slots ≥ 0  
- [ ] `meta.id` matches folder  

---

## Non-responsibilities of format

- Random treasure identity (sim rolls at runtime with session seed)  
- Parallax drawing  
- Networking  
