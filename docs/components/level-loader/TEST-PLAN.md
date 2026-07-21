# C-09 — Level Content Loader — Test Plan

| Field | Value |
|---|---|
| Component | **C-09 Level Content Loader** |
| Ownership | **SE-7** |
| Status | Full component test plan (documentation only) |
| Design | [DESIGN.md](DESIGN.md) |
| Tasks | [TASKS.md](TASKS.md) |
| Contract | [level-format.md](../../interfaces/level-format.md) |
| Global strategy | [AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md) |

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| PNG parse | 1 px = 1 block; RGBA; dimension guards |
| Row/column layout | Header, near-bg, body, spacer, fore; col0 gutter |
| Header biome | `(0,0)` RGB matches `meta.biome` |
| Palette | RGB → CellSemantic; unknown → fail closed |
| Emission | `LevelDefinition` cells, spawns[4], exit AABB, treasureSlots, switchLinks |
| Decorative layers | nearBg / fore; non-colliding |
| Content pack | meta.id = folder; poolEligible; biomes/palette/pool JSON |
| CI validation | Bad maps fail; Hoard + BoxLevel always valid |
| contentHash | Stable for identical bytes |

### Out of scope

| Concern | Owner |
|---|---|
| Trap timers / physics | C-06 |
| Parallax drawing | C-02 |
| Treasure identity rolls | C-06 + C-07 |
| Fork mash UI | C-10 |
| Generative maps / hot-reload prod | Deferred |

---

## 2. Interfaces consumed & produced

| Direction | Artifact |
|---|---|
| **Produces** | `LevelDefinition`, validation errors, level pool metadata |
| **Consumes** | `content/levels/<id>/map.png` + `meta.json`, `palette.json`, `biomes.json`, `level-pool.json` |
| **Consumed by** | C-06 load, C-10 biomes/options, C-02 presentation keys |

---

## 3. Test levels

| Level | Tool | What |
|---|---|---|
| **Unit** | Vitest + png fixtures | Parser layers, palette, meta schema, spawns/exit/slots |
| **Property** | Double-load identity | Same bytes → same definition + contentHash |
| **Scenario / CI** | Validate CLI on pack | Full content tree fail-closed |
| **Integration** | Sim loads BoxLevel/Hoard | Peer C-06; not owned here beyond fixture quality |

---

## 4. Concrete case table

| ID | Title | Setup | Steps | Expected | Pri |
|---|---|---|---|---|---|
| LVL-01 | Hoard fixture parses | `hoard_01` pack | parse + validate | biome gold; spawns 4; ≥1 exit; many treasureSlots; poolEligible false | P0 |
| LVL-02 | BoxLevel for net tests | `box_level` pack | parse | Platforms + spawns + exit; poolEligible false; used by P2 | P0 |
| LVL-03 | Unknown body color | Fixture one bad RGB | parse | Error `UNKNOWN_COLOR` with x,y,rgb | P0 |
| LVL-04 | Col0 spacer ignored | Noise in column 0 body rows | parse | Noise not in `cells`; body width = W−1 | P0 |
| LVL-05 | meta.id matches folder | Mismatched id in meta | validate | Fail closed | P0 |
| LVL-06 | Header biome match | Hoard gold header | parse | Succeeds | P0 |
| LVL-07 | Header biome mismatch | Wrong (0,0) vs meta.biome | parse | `BIOME_MISMATCH`; CI fails | P0 |
| LVL-08 | Body height H−4 | Golden H image | parse | height = imageHeight − 4 | P0 |
| LVL-09 | Near-bg and fore lengths | Valid map | parse | nearBg.length == width; fore.length == width | P0 |
| LVL-10 | Min dimension reject | H&lt;5 or W&lt;3 | parse | Error | P0 |
| LVL-11 | Max dimension guard | Oversize map (e.g. &gt;512×64) | parse | Error | P1 |
| LVL-12 | Non-opaque body alpha | Alpha &lt;255 on body | parse | Error | P1 |
| LVL-13 | Treasure slots no catalog ids | Slot pixels | parse | treasureSlots positions only; no defId | P0 |
| LVL-14 | Slot clears solid under | Slot pixel | parse | cells under slot empty/non-solid | P1 |
| LVL-15 | Spawns default if missing | No spawn markers but safe ledge | parse | spawns length 4 or hard fail if unsafe | P1 |
| LVL-16 | Explicit spawns 0..3 | Markers present | parse | Correct body coords order | P0 |
| LVL-17 | Exit AABB union | Multi-cell exit | parse | Combined world-px AABB; y-down | P0 |
| LVL-18 | Zero exits fail | No exit cells (unless skip flag) | validate | Fail | P0 |
| LVL-19 | Fore rejects solid brick | Brick color on H−1 | parse/validate | Hard fail (preferred) | P1 |
| LVL-20 | Parallax defaults | Any valid map | parse | far 0.5, near 1.0, fore 1.25 | P1 |
| LVL-21 | contentHash stable | Double load same files | hash | Identical hash; meta rename changes hash | P1 |
| LVL-22 | level-pool valid | pool JSON | validate | ≥2 entries; startLevelId exists; no hoard in playable pool | P0 |
| LVL-23 | poolEligible false excluded | Hoard/box | pool build | Not in Q4-A random pool | P0 |
| LVL-24 | Switch id assignment | switch pixels | parse | `sw_x_y` ids; meta.switchLinks merge | P1 |
| LVL-25 | Material flags pass-through | ice/sand/spikes cells | parse | friction/trap tags present for sim | P1 |
| LVL-26 | All seven biomes table | biomes.json | unit | gold, outside, dungeon, lava, ice, cavern, mist | P1 |
| LVL-27 | Spacer row H−2 ignored | Marked spacer pixels | parse | Not in body cells | P0 |
| LVL-28 | Invalid meta schema | Missing version/biome | validate | Stable error codes | P1 |

---

## 5. Edge cases

| Edge | Expectation |
|---|---|
| Empty treasure (BoxLevel) | slots ≥ 0 OK |
| Hoard many slots | Parse performance OK for fixture size |
| Spacer vs near-bg row1 | Entire spacer color → empty near-bg |
| Header other columns | MVP ignored |
| soft-unique / disconnect | N/A to loader |
| Duplicate spawn markers | Document: last-write or fail — lock in tests when implemented |
| Exit cell == only slot | Soft warning stretch; hard fail if blocks egress policy when defined |

---

## 6. Fixtures & determinism

| Fixture | Path / role |
|---|---|
| Hoard | `content/levels/hoard_01` or `content/fixtures/hoard_01` |
| BoxLevel | `content/fixtures/box_level` / levels |
| Negative: unknown color | test-only PNG |
| Negative: biome mismatch | test-only |
| Negative: too small | test-only |
| palette.json / biomes.json | Shared golden tables |

**Determinism:** Pure function of map bytes + meta + palette version. No RNG in loader. contentHash golden-tested.

---

## 7. Mocks / fakes

| Fake | Use |
|---|---|
| In-memory synthetic PNG buffers | Unit tests without large art |
| Minimal palette subset | Isolated mapping tests |
| No Phaser; png decode lib allowed on Node | Server/tooling only |

---

## 8. Exit criteria (CI gates)

- [ ] LVL-01, LVL-02, LVL-03, LVL-04, LVL-05, LVL-06/07, LVL-08, LVL-13, LVL-17, LVL-18, LVL-22, LVL-27 green  
- [ ] CI fails on bad maps (unknown color, biome mismatch, meta id)  
- [ ] P1 parser tests run without game server  
- [ ] Coverage target ≥ **85%** parser + all shipped fixtures validate  
- [ ] BoxLevel + Hoard always present for net/sim harness  

---

## 9. Integration & system links

| Doc / ID | Relationship |
|---|---|
| AUTOMATED-TEST-STRATEGY §7.4 | Content validation CI |
| INT-01 | Loads Hoard + playable levels |
| C-06 T10 | LevelDefinition consumer |
| C-10 pool picker | level-pool.json |
| SYSTEM-TEST seed data | Level pack presence |

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Spacer-row design ambiguity | DESIGN §6.2 locked + LVL-08/27 golden |
| Palette art drift | Fail closed unknown colors |
| Max size arbitrary | Document threshold; LVL-11 |

---

## 11. Traceability

| Design section | Cases |
|---|---|
| §5 Content pack | LVL-05, LVL-22–23, LVL-28 |
| §6 Pixel layout | LVL-04, LVL-08–12, LVL-27 |
| §6.3 Header biome | LVL-06–07 |
| §7 Palette mapping | LVL-03, LVL-19, LVL-25 |
| §8 Treasure slots | LVL-13–14 |
| §9 LevelDefinition emit | LVL-01–02, LVL-15–18, LVL-20–21 |
| §10 Level pool | LVL-22–23 |
