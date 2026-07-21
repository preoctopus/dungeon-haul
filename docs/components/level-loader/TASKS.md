# C-09 — Level Content Loader Tasks

> **Component:** C-09 Level Content Loader  
> **Ownership:** SE-7  
> **Design:** [DESIGN.md](./DESIGN.md)  
> **Contract:** [level-format.md](../../interfaces/level-format.md)  
> **Rule:** Documentation and later implementation tasks only as listed — **no application code in the docs phase**. Task IDs are stable: `C09-T##`.

Status legend: `todo` · `in_progress` · `done` · `blocked`

---

## Epic overview

| Epic | Focus | Primary phase |
|---|---|---|
| A | Types & content pack schema | P1 |
| B | Pixel-map parser (layers, header, gutters) | P1 |
| C | Palette / color→block mapping | P1 |
| D | Treasure slots & spawns/exit emission | P1–P3 |
| E | Fixtures (BoxLevel, Hoard) | P1 |
| F | Level pool & Q4-A fork picker | P4 |
| G | CI validation CLI | P1–P4 |
| H | Integration with sim / fork / net | P2–P4 |
| I | Content expansion & polish | P6 |

---

## Epic A — Types & content pack schema

### C09-T01 — Freeze shared content types
- **Status:** todo  
- **Phase:** P1  
- **Description:** Specify (in protocol or content package types doc) `Biome`, `CellType`, `LevelDefinition`, `TreasureSlot`, `SwitchLink`, `DecorativeId`, `ValidationError` aligned with DESIGN §9 and level-format.md.  
- **Acceptance:** Types cover all seven biomes (`gold`/Hoard, `outside`, `dungeon`, `lava`, `ice`, `cavern`, `mist`); y-down world note present; no Phaser types.  
- **Depends on:** —  

### C09-T02 — Document content directory tree
- **Status:** todo  
- **Phase:** P1  
- **Description:** Ensure repo `content/` layout matches DESIGN §5 (`palette.json`, `biomes.json`, `level-pool.json`, `levels/<id>/map.png+meta.json`). Add placeholder JSON stubs only when implementation starts (not in pure docs phase unless requested).  
- **Acceptance:** DESIGN + level-format agree; README pointer optional.  
- **Depends on:** C09-T01  

### C09-T03 — Define `meta.json` schema + versioning
- **Status:** todo  
- **Phase:** P1  
- **Description:** Schema for required/optional fields including `poolEligible`, `switchLinks`, `treasureSlotDefaultRarity`, `version`.  
- **Acceptance:** Invalid meta fails validation with stable error codes (DESIGN §11.2).  
- **Depends on:** C09-T01  

### C09-T04 — Define `biomes.json` header RGB table
- **Status:** todo  
- **Phase:** P1  
- **Description:** One entry per biome: `headerRgb`, `tilesetKey`, `farBgKey`, `defaultMusicId`. Map display name Hoard → id `gold`.  
- **Acceptance:** All seven biomes listed; header check algorithm documented.  
- **Depends on:** C09-T01  

---

## Epic B — Pixel-map parser

### C09-T05 — PNG load & dimension rules
- **Status:** todo  
- **Phase:** P1  
- **Description:** Load RGBA PNG; enforce min size (`H >= 5`, `W >= 3`), max size (e.g. 512×64); reject non-opaque body pixels.  
- **Acceptance:** Unit tests for too-small / too-large / bad alpha.  
- **Depends on:** C09-T01  

### C09-T06 — Row classification (header / near-bg / body / spacer / fore)
- **Status:** todo  
- **Phase:** P1  
- **Description:** Implement DESIGN §6.2 row roles: row0 header, row1 near-bg, body `2..H-3`, `H-2` spacer, `H-1` fore.  
- **Acceptance:** Golden fixture asserts body height = `H - 4`; near/fore lengths = body width.  
- **Depends on:** C09-T05  

### C09-T07 — Column-0 spacer gutter
- **Status:** todo  
- **Phase:** P1  
- **Description:** Ignore column 0 for gameplay grids; keep `(0,0)` as biome header sample. Body width = `W - 1`.  
- **Acceptance:** Test map with marked col0 noise does not appear in `cells`.  
- **Depends on:** C09-T05  

### C09-T08 — Header biome agreement
- **Status:** todo  
- **Phase:** P1  
- **Description:** `(0,0)` RGB → biomes table → must equal `meta.biome`; emit `BIOME_MISMATCH` otherwise.  
- **Acceptance:** Mismatch fails CI; match succeeds on Hoard fixture.  
- **Depends on:** C09-T04, C09-T05  

### C09-T09 — Emit parallax + presentation keys
- **Status:** todo  
- **Phase:** P1  
- **Description:** Fill `parallax` defaults (far 0.5, near 1.0, fore 1.25), `tilesetKey`, `farBgKey`, `musicId` from biome + meta overrides.  
- **Acceptance:** LevelDefinition fields present; C-02 can consume without re-deriving.  
- **Depends on:** C09-T04, C09-T06  

### C09-T10 — `contentHash` stability
- **Status:** todo  
- **Phase:** P2  
- **Description:** Hash map bytes + meta + relevant palette version for net/cache identity.  
- **Acceptance:** Double-load identical hash; meta displayName tweak changes hash.  
- **Depends on:** C09-T12  

---

## Epic C — Color → block mapping

### C09-T11 — Author initial `palette.json`
- **Status:** todo  
- **Phase:** P1  
- **Description:** Exact RGB → semantics for empty, brick, ice, sand, switch, heavy_switch, spikes, crumbling, receding, lightning/gas/rock traps, golem/phantom spawns, treasure_slot, player_spawn_0..3, exit, near_bg_*, fore_*, spacer.  
- **Acceptance:** Every semantic in level-format palette table has ≥1 RGB; fail-closed documented.  
- **Depends on:** C09-T01  

### C09-T12 — Body pixel mapping to `cells[][]`
- **Status:** todo  
- **Phase:** P1  
- **Description:** Map each body pixel via palette; unknown → `UNKNOWN_COLOR` with coordinates.  
- **Acceptance:** Fixture with one bad pixel fails with x,y,rgb in error.  
- **Depends on:** C09-T06, C09-T11  

### C09-T13 — Material flags pass-through
- **Status:** todo  
- **Phase:** P1  
- **Description:** Attach friction/trap tags for ice, sand, crumbling, etc., without implementing behavior.  
- **Acceptance:** Cell type enum or parallel flag map documented for C-06.  
- **Depends on:** C09-T12  

### C09-T14 — Decorative near-bg / fore mapping
- **Status:** todo  
- **Phase:** P1  
- **Description:** Row1 and row H-1 only accept decorative/spacer/empty semantics; reject solid gameplay colors (or map to empty + warning — prefer hard fail).  
- **Acceptance:** Brick color on fore row fails validation.  
- **Depends on:** C09-T06, C09-T11  

### C09-T15 — Switch id assignment + meta links
- **Status:** todo  
- **Phase:** P3  
- **Description:** Default `sw_x_y` ids; merge `meta.switchLinks`; validate target ids when provided.  
- **Acceptance:** Linked switch appears in `LevelDefinition.switchLinks`.  
- **Depends on:** C09-T12  

---

## Epic D — Treasure slots, spawns, exit

### C09-T16 — Treasure slot extraction
- **Status:** todo  
- **Phase:** P1  
- **Description:** Collect `treasureSlots` from body; clear solid under slot; optional rarity filter from palette/meta.  
- **Acceptance:** Slot positions stable; loader never assigns treasure catalog ids.  
- **Depends on:** C09-T12  

### C09-T17 — Player spawn resolution
- **Status:** todo  
- **Phase:** P1  
- **Description:** Read `player_spawn_0..3` or default left-surface packing (DESIGN §9.1).  
- **Acceptance:** Always emit `spawns` length 4 or hard fail if unsafe.  
- **Depends on:** C09-T12  

### C09-T18 — Exit AABB union
- **Status:** todo  
- **Phase:** P1  
- **Description:** Union exit cells → world-px AABB using `blockSizePx`, y-down.  
- **Acceptance:** Multi-cell exit produces combined bounds; zero exits fail (unless fixture flag).  
- **Depends on:** C09-T12  

### C09-T19 — Rarity-tint palette variants (optional)
- **Status:** todo  
- **Phase:** P3  
- **Description:** Optional palette colors for common/rare/unique/set slots.  
- **Acceptance:** Filters appear on slots; default remains `world`.  
- **Depends on:** C09-T16  

---

## Epic E — Fixtures

### C09-T20 — BoxLevel net-test fixture
- **Status:** todo  
- **Phase:** P1  
- **Description:** Minimal flat platform map: spawns, exit, no treasure required; `poolEligible: false`.  
- **Acceptance:** Parses; used by P2 movement tests; CI green.  
- **Depends on:** C09-T12, C09-T17, C09-T18  

### C09-T21 — Hoard Level 0 fixture (`hoard_01`)
- **Status:** todo  
- **Phase:** P1  
- **Description:** Biome `gold`, many treasure slots, clear right-side exit; `poolEligible: false`; `startLevelId` target.  
- **Acceptance:** DESIGN biome table + pool start reference; parse + validate.  
- **Depends on:** C09-T16–T18, C09-T08  

### C09-T22 — One biome sample per fork-eligible theme
- **Status:** todo  
- **Phase:** P4–P6  
- **Description:** At least stub maps: outside, dungeon, lava, ice, cavern, mist (expand art later).  
- **Acceptance:** Each biome id represented in pool; header colors match.  
- **Depends on:** C09-T21, C09-T25  

---

## Epic F — Level pool & Q4-A fork picker

### C09-T23 — Author `level-pool.json`
- **Status:** todo  
- **Phase:** P4  
- **Description:** `startLevelId`, `levelsAfterHoard` (default 2), `levelsAfterHoardFull` (7), `pool[]`, `minPairBiomesDistinct`, `repeatPolicy`.  
- **Acceptance:** Matches Q4-A / Q8-A; documented in DESIGN §10.  
- **Depends on:** C09-T02  

### C09-T24 — Implement `pickForkOptions` (deterministic)
- **Status:** todo  
- **Phase:** P4  
- **Description:** Random unplayed pair from pool using `(sessionSeed, forkIndex)`; distinct biomes preference; exhaust/repeat policy.  
- **Acceptance:**  
  - Same seed → same pairs  
  - Options ⊆ pool  
  - No self-pair when ≥2 candidates  
  - Played ids excluded until exhausted  
  - Hoard never offered  
- **Depends on:** C09-T23  

### C09-T25 — Pool membership validation
- **Status:** todo  
- **Phase:** P4  
- **Description:** CI ensures every pool id exists, parses, `poolEligible !== false`, and start level exists outside pool rules.  
- **Acceptance:** Broken pool ref fails `validate-levels`.  
- **Depends on:** C09-T23, C09-T20  

### C09-T26 — Run plan helper (optional)
- **Status:** todo  
- **Phase:** P4  
- **Description:** Optional lazy `RunPlan` wrapper for C-06 phase machine (fork index, played set, completed vs cap).  
- **Acceptance:** Cap uses configurable `levelsAfterHoard`.  
- **Depends on:** C09-T24  

### C09-T27 — Stretch: graph selection mode
- **Status:** todo  
- **Phase:** P6+  
- **Description:** Optional `level-graph.json` / `selectionMode: "graph"` without changing LevelDefinition.  
- **Acceptance:** Feature-flagged; default remains pool (Q4-A).  
- **Depends on:** C09-T24  

---

## Epic G — CI validation

### C09-T28 — CLI `validate-levels`
- **Status:** todo  
- **Phase:** P1  
- **Description:** Walk content root; emit human-readable report + exit code; error codes per DESIGN §11.2.  
- **Acceptance:** Runnable in GH Actions; fails on unknown color / missing exit / id mismatch.  
- **Depends on:** C09-T12, C09-T18  

### C09-T29 — Wire CI workflow job
- **Status:** todo  
- **Phase:** P1  
- **Description:** GitHub Actions step: install, `pnpm content:validate` (or equiv) on PRs touching `content/` or loader.  
- **Acceptance:** Red PR on broken map; green on fixtures.  
- **Depends on:** C09-T28  

### C09-T30 — Strict mode warnings
- **Status:** todo  
- **Phase:** P4  
- **Description:** `--strict` fails on zero treasure slots for pool levels, missing explicit spawns, orphan switches.  
- **Acceptance:** Documented flags; default CI policy decided (strict for main).  
- **Depends on:** C09-T28  

### C09-T31 — Golden parse snapshots
- **Status:** todo  
- **Phase:** P1  
- **Description:** Serialize LevelDefinition (sans volatile fields) for BoxLevel + Hoard; guard parser regressions.  
- **Acceptance:** Snapshot test in unit suite.  
- **Depends on:** C09-T20, C09-T21  

---

## Epic H — Integration

### C09-T32 — Server boot: load content index
- **Status:** todo  
- **Phase:** P2  
- **Description:** HaulSession/process loads ContentIndex once; serves BoxLevel by id.  
- **Acceptance:** Sim receives LevelDefinition without client PNG authority.  
- **Depends on:** C09-T20, C09-T10  

### C09-T33 — Snapshot carries `levelId` + `contentHash`
- **Status:** todo  
- **Phase:** P2  
- **Description:** Coordinate with C-04/C-06 so clients verify pack match.  
- **Acceptance:** Protocol field documented; mismatch telemetry.  
- **Depends on:** C09-T10, C09-T32  

### C09-T34 — Hoard → Fork → Level flow hooks
- **Status:** todo  
- **Phase:** P4  
- **Description:** Integrate `pickForkOptions` with C-10; load winner level; honor `levelsAfterHoard`.  
- **Acceptance:** Playtest script: leave Hoard, see two options, play winner, end at cap.  
- **Depends on:** C09-T24, C09-T21  

### C09-T35 — Client presentation metadata path
- **Status:** todo  
- **Phase:** P2–P4  
- **Description:** Ensure C-02 can read biome/tileset/near/fore/parallax from definition or shared pack.  
- **Acceptance:** No duplicate parse rules on client.  
- **Depends on:** C09-T09  

### C09-T36 — Treasure roll handoff checklist
- **Status:** todo  
- **Phase:** P3  
- **Description:** Document boundary: slots from C-09, rolls from C-06/C-07 with session seed; unique/set non-dup.  
- **Acceptance:** Short integration note in DESIGN or sim design; no loader catalog dependency.  
- **Depends on:** C09-T16  

---

## Epic I — Content expansion & polish

### C09-T37 — Expand pool toward 2×7 maps
- **Status:** todo  
- **Phase:** P6  
- **Description:** Author additional levels two-at-a-time per design build order; keep Q4-A selection.  
- **Acceptance:** Pool size supports full 7-level runs with few repeats.  
- **Depends on:** C09-T22, C09-T25  

### C09-T38 — Palette swatch + authoring guide
- **Status:** todo  
- **Phase:** P4  
- **Description:** `content/palette-swatch.png` + short authoring notes (export settings, gutters, 1px=1block).  
- **Acceptance:** New mapper can paint a valid level without reading code.  
- **Depends on:** C09-T11  

### C09-T39 — Trap cell coverage audit
- **Status:** todo  
- **Phase:** P6  
- **Description:** Ensure palette + at least one fixture pixel for each trap type sim implements; stubs allowed for rest.  
- **Acceptance:** Audit table in testing notes.  
- **Depends on:** C09-T13  

### C09-T40 — Performance budget check
- **Status:** todo  
- **Phase:** P6  
- **Description:** Parse-all-levels time and memory on server boot; cache hit path.  
- **Acceptance:** Boot parse &lt; agreed budget (e.g. 500ms for MVP pack) on CI runner.  
- **Depends on:** C09-T32, C09-T37  

---

## Suggested implementation order

```text
C09-T01 → T02 → T03 → T04 → T11
                ↓
        T05 → T06 → T07 → T08 → T12 → T13 → T14
                              ↓
                    T16 → T17 → T18 → T20 → T21 → T28 → T29 → T31
                              ↓
                    T09 → T10 → T32 → T33 → T35
                              ↓
                    T23 → T24 → T25 → T26 → T34 → T30
                              ↓
                    T22 → T19 → T36 → T37 → T38 → T39 → T40
                         T15        T27 (stretch)
```

---

## Traceability

| Design topic | Tasks |
|---|---|
| 1 px = 1 block pixel-map | T05–T07, T12, T31 |
| Biome header | T04, T08, T21 |
| Near-bg / mid / fore rows | T06, T09, T14 |
| Color → block mapping | T11–T15 |
| Treasure spawn slots | T16, T19, T36 |
| Content pack layout | T02, T03, T28 |
| CI validation | T28–T31, T25 |
| Q4-A random unplayed pair pool | T23–T27, T34 |
| Biomes Hoard/Outside/Dungeon/Lava/Ice/Cavern/Mist | T01, T04, T22 |

---

## Out of scope (do not file under C09)

- Trap runtime behavior, weight on crumbling blocks → C-06  
- Fork mash UI/tallies → C-10  
- Share modifiers / treasure values → C-07  
- Drawing parallax sprites → C-02  
- High score persistence → C-12  
