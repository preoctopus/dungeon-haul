# Dungeon Haul — Wiki Asset Pages (`assets.md`)

**Purpose:** Hand-off spec for the agent that uploads/updates asset pages on
`https://wiki.omoai.net` (wiki key: `wiki.omoai.net`). For **every** asset page
this file gives (a) the **repo location(s)** of the underlying art/media, and
(b) the **full page content in MediaWiki syntax with Semantic MediaWiki (SMW)
property annotations** capturing all relevant metadata.

Source of truth for the page list: the **Asset Atlases & Media Packs**,
**Character Sprites**, and **Audio Stems** sections of
[`Dungeon Haul:Hub`](https://wiki.omoai.net/index.php/Dungeon_Haul:Hub).

---

## IMPORTANT — read before uploading

1. **All 20 asset pages already EXIST** as sparse stubs (category
   `Dungeon Haul Asset`). This is an **UPDATE / enrich** job, not creation.
   Use `update-page` (not `create-page`). Page titles are listed per entry.
2. **SMW annotation style:** the existing stubs use the list form
   `* Property name:: value`, which is a valid SMW inline annotation. Every
   page body below keeps that style so the wiki stays uniform. Do **not** switch
   to `[[Property::value]]` inline form — match what is already there.
3. **Audio reality check (discrepancy with current stubs):** the current audio
   stubs claim `OGG` format and a `art_raw/audio/` raw path. Neither is true in
   the repo:
   - Files are **`.wav`**, not `.ogg`.
   - There is **no `art_raw/audio/` directory** — audio has no raw tier.
   - Only a **small subset of clips exist**; the rest are **PLANNED**.
   The page bodies below reflect the *actual* repo state and mark planned
   clips. Keep it that way.
4. **PNG masters:** most atlases ship a `.png` beside the `.webp` in the public
   dir; **`atlas_ui_icons` and `atlas_tiles_mist` have no `.png`**. Per-page
   `PNG master path` reflects this.
5. **Gaps not yet covered by any page** (flagged for owner, see final section):
   trap SFX (`sfx/trap/`) and UI SFX (`sfx/ui/`) exist in the repo but have no
   hub page.
6. Every page ends with `[[Category:Dungeon Haul Asset]]` and opens with the
   `[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]` breadcrumb — preserve both.

---

## Shared repo facts

| Fact | Value |
|---|---|
| Public atlas dir | `client/public/assets/atlases/` (`.webp` + `.json`, sometimes `.png`) |
| Public images dir | `client/public/assets/images/` (`.webp`, 960×540) |
| Public audio dir | `client/public/assets/audio/{music,sfx/*}/` (`.wav`) |
| Preload manifest | `client/public/assets/manifest.json` |
| Raw art masters | `art_raw/<pack>/` (per-frame PNG sources; **no audio tier**) |
| Logical canvas | 960×540; block grid 32×32 |

---

# SECTION A — Asset Atlases & Media Packs

---

## A1. Atlas Treasures

- **Wiki title:** `Dungeon Haul:Asset/Atlas Treasures`
- **Repo — texture:** `client/public/assets/atlases/atlas_treasures.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_treasures.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_treasures.png`
- **Repo — raw frames:** `art_raw/treasures/` (26 source PNGs)
- **Phaser key:** `atlas_treasures` · **Atlas size:** 256×128 · **Frames:** 25 · **Frame grid:** 32×32

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Treasures ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_treasures
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_treasures.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_treasures.json
* PNG master path:: client/public/assets/atlases/atlas_treasures.png
* Raw source path:: art_raw/treasures/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 256x128
* Frame count:: 25
* Frame grid:: 32x32
* Priority:: P0
* Design doc section:: 2.2
* Consuming component:: [[Dungeon Haul:Components|Simulation / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
25 P0 treasures & chests: coin sacks, watches, stone/bronze icons, gemstones, crown, wooden/silver/gold chests, goat icon, NES cartridge, crystal skulls, scepters, and the armor set pieces.

Frame keys:
tre_coin_sack, tre_big_coin_sack, tre_brass_watch, tre_gold_watch, tre_stone_icon, tre_bronze_icon, tre_gemstone_ruby, tre_gemstone_emerald, tre_crown, tre_wooden_chest_closed, tre_wooden_chest_open, tre_silver_chest_closed, tre_gold_chest_closed, tre_goat_icon, tre_nes_cartridge, tre_crystal_skull, tre_magic_scepter, tre_set_armor_helmet, tre_set_armor_breastplate, tre_set_armor_gauntlets, tre_crystal_skull_blue, tre_gold_scepter, tre_set_armor_helmet_alt, tre_set_armor_breastplate_alt, tre_set_armor_greaves

[[Category:Dungeon Haul Asset]]
```

---

## A2. Atlas Treasures Sets

- **Wiki title:** `Dungeon Haul:Asset/Atlas Treasures Sets`
- **Repo — texture:** `client/public/assets/atlases/atlas_treasures_sets.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_treasures_sets.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_treasures_sets.png`
- **Repo — raw frames:** `art_raw/treasures_sets/` (18 source PNGs)
- **Phaser key:** `atlas_treasures_sets` · **Atlas size:** 512×256 · **Frames:** 18 · **Frame grid:** 32×32 (guitars/bass 24×48)

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Treasures Sets ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_treasures_sets
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_treasures_sets.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_treasures_sets.json
* PNG master path:: client/public/assets/atlases/atlas_treasures_sets.png
* Raw source path:: art_raw/treasures_sets/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x256
* Frame count:: 18
* Frame grid:: 32x32
* Priority:: P1 (Team Box set P2)
* Design doc section:: 2.2
* Consuming component:: [[Dungeon Haul:Components|Simulation / Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
18 secondary set-loot items across five collectible sets: Celestial (sun/moon/star), Divine card suits (spade/club/heart/diamond), Song instruments (flame guitar / ice bass), Vegetables (turnip/pepper/pumpkin/onion), and the Team Box jam set (Andrew/Greg/Lindsey/Megan/Darius).

Frame keys:
tre_set_celestial_sun, tre_set_celestial_moon, tre_set_celestial_star, tre_set_divine_spade, tre_set_divine_club, tre_set_divine_heart, tre_set_divine_diamond, tre_set_song_flame_guitar, tre_set_song_ice_bass, tre_set_veg_turnip, tre_set_veg_pepper, tre_set_veg_pumpkin, tre_set_veg_onion, tre_set_box_andrew, tre_set_box_greg, tre_set_box_lindsey, tre_set_box_megan, tre_set_box_darius

[[Category:Dungeon Haul Asset]]
```

---

## A3. Atlas Tiles MVP

- **Wiki title:** `Dungeon Haul:Asset/Atlas Tiles MVP`
- **Repo — texture:** `client/public/assets/atlases/atlas_tiles_mvp.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_tiles_mvp.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_tiles_mvp.png`
- **Repo — raw frames:** `art_raw/tiles/` (20 source PNGs)
- **Phaser key:** `atlas_tiles_mvp` · **Atlas size:** 240×256 · **Frames:** 19 · **Block:** 32×32

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Tiles MVP ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_tiles_mvp
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_tiles_mvp.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_tiles_mvp.json
* PNG master path:: client/public/assets/atlases/atlas_tiles_mvp.png
* Raw source path:: art_raw/tiles/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 240x256
* Frame count:: 19
* Frame grid:: 32x32
* Biome:: gold / dungeon / outside (MVP)
* Priority:: P0
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Level Loader / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
Core MVP tileset: dungeon/outside/gold bricks, ice block, red switches (up/down), heavy switch, iron gate (open/closed), door, exit banner, and animated hazards (spikes, crumble, recede, lightning emitter).

Frame keys:
blk_brick_dungeon, blk_brick_outside, blk_brick_gold, blk_ice, sw_switch_up, sw_switch_down, sw_heavy_up, sw_heavy_down, gate_iron_closed, gate_iron_open, door_closed, blk_exit_banner, trap_spikes_idle, trap_spikes_retracted, trap_crumble_idle, trap_crumble_break, trap_recede_idle, trap_recede_out, trap_lightning_emitter

[[Category:Dungeon Haul Asset]]
```

---

## A4. Atlas Tiles Lava

- **Wiki title:** `Dungeon Haul:Asset/Atlas Tiles Lava`
- **Repo — texture:** `client/public/assets/atlases/atlas_tiles_lava.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_tiles_lava.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_tiles_lava.png`
- **Repo — raw frames:** `art_raw/tiles_lava/` (7 source PNGs)
- **Phaser key:** `atlas_tiles_lava` · **Atlas size:** 512×512 · **Frames:** 7

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Tiles Lava ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_tiles_lava
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_tiles_lava.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_tiles_lava.json
* PNG master path:: client/public/assets/atlases/atlas_tiles_lava.png
* Raw source path:: art_raw/tiles_lava/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x512
* Frame count:: 7
* Biome:: lava
* Priority:: P1
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Level Loader / Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
Lava biome tiles: basalt rock block, glow-edge block, magma far background, lava spire prop, lava crack decor, biome spikes, and gold gate.

Frame keys:
px_lava_far, px_lava_near_spire, gate_gold_closed, blk_lava_rock, blk_lava_glow_edge, px_lava_near_crack, trap_spikes_biome_lava

[[Category:Dungeon Haul Asset]]
```

---

## A5. Atlas Tiles Ice

- **Wiki title:** `Dungeon Haul:Asset/Atlas Tiles Ice`
- **Repo — texture:** `client/public/assets/atlases/atlas_tiles_ice.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_tiles_ice.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_tiles_ice.png`
- **Repo — raw frames:** `art_raw/tiles_ice/` (7 source PNGs)
- **Phaser key:** `atlas_tiles_ice` · **Atlas size:** 1024×1024 · **Frames:** 7

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Tiles Ice ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_tiles_ice
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_tiles_ice.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_tiles_ice.json
* PNG master path:: client/public/assets/atlases/atlas_tiles_ice.png
* Raw source path:: art_raw/tiles_ice/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 1024x1024
* Frame count:: 7
* Biome:: ice
* Priority:: P1
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Level Loader / Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
Ice biome tiles: cracked-ice block, pale-sky far background, icicles, crystal cluster, ice pillar, frost foreground overlay, and biome ice spikes.

Frame keys:
blk_ice_crack, px_ice_far, px_ice_near_icicle, px_ice_near_crystal, px_ice_near_pillar, px_ice_fore_frost, trap_spikes_biome_ice

[[Category:Dungeon Haul Asset]]
```

---

## A6. Atlas Tiles Cavern

- **Wiki title:** `Dungeon Haul:Asset/Atlas Tiles Cavern`
- **Repo — texture:** `client/public/assets/atlases/atlas_tiles_cavern.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_tiles_cavern.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_tiles_cavern.png`
- **Repo — raw frames:** `art_raw/tiles_cavern/` (8 source PNGs)
- **Phaser key:** `atlas_tiles_cavern` · **Atlas size:** 1024×512 · **Frames:** 8

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Tiles Cavern ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_tiles_cavern
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_tiles_cavern.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_tiles_cavern.json
* PNG master path:: client/public/assets/atlases/atlas_tiles_cavern.png
* Raw source path:: art_raw/tiles_cavern/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 1024x512
* Frame count:: 8
* Biome:: cavern
* Priority:: P1
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Level Loader / Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
Cavern biome tiles: far background, foreground roots, stalactites, stalagmites, glowing mushrooms, cavern rock block, sand block, and mossy rock block.

Frame keys:
px_cav_far, px_cav_fore_roots, px_cav_near_stalactite, px_cav_near_stalagmite, px_cav_near_mushroom, blk_cavern_rock, blk_sand, blk_cavern_moss

[[Category:Dungeon Haul Asset]]
```

---

## A7. Atlas Tiles Mist

- **Wiki title:** `Dungeon Haul:Asset/Atlas Tiles Mist`
- **Repo — texture:** `client/public/assets/atlases/atlas_tiles_mist.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_tiles_mist.json`
- **Repo — PNG master:** *(none — this atlas ships webp + json only)*
- **Repo — raw frames:** `art_raw/tiles_mist/` (8 source PNGs)
- **Phaser key:** `atlas_tiles_mist` · **Atlas size:** 1024×512 · **Frames:** 8

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Tiles Mist ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_tiles_mist
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_tiles_mist.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_tiles_mist.json
* PNG master path:: (none)
* Raw source path:: art_raw/tiles_mist/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 1024x512
* Frame count:: 8
* Biome:: mist
* Priority:: P1
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Level Loader / Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
Mist biome tiles: mist-stone block, rune-stone block, far background, spirit wisp, ruined arch, mist moss, translucent fog foreground sheet, and biome gas trap.

Frame keys:
blk_mist_stone, blk_mist_rune, px_mist_far, px_mist_near_wisp, px_mist_near_arch, px_mist_near_moss, px_mist_fore_fog, trap_gas_biome_mist

[[Category:Dungeon Haul Asset]]
```

---

## A8. Atlas Enemies

- **Wiki title:** `Dungeon Haul:Asset/Atlas Enemies`
- **Repo — texture:** `client/public/assets/atlases/atlas_enemies.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_enemies.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_enemies.png`
- **Repo — raw frames:** `art_raw/enemies_traps/` (9 source PNGs)
- **Phaser key:** `atlas_enemies` · **Atlas size:** 512×448 · **Frames:** 49 (animation frames + `_N` aliases)

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Enemies ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_enemies
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_enemies.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_enemies.json
* PNG master path:: client/public/assets/atlases/atlas_enemies.png
* Raw source path:: art_raw/enemies_traps/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x448
* Frame count:: 49
* Priority:: P0 (core traps) / P1 (enemies)
* Design doc section:: 2.3
* Consuming component:: [[Dungeon Haul:Components|Simulation / Presentation]]
* Status:: Complete

=== Contents & Description ===
Enemy and advanced-trap animation frames: Golem (idle/walk/attack), Phantom Hand (idle/drop/flee), Lightning Bolt, Gas Cloud, and Falling Rock. Frames include both numbered (`_0..N`) and unsuffixed alias keys.

Animation clips:
enemy_golem_idle (4f), enemy_golem_walk (6f), enemy_golem_attack (4f), enemy_phantom_idle (4f), enemy_phantom_drop (4f), enemy_phantom_flee (4f), trap_lightning_bolt (4f), trap_gas_cloud (6f), trap_falling_rock_fall (4f)

[[Category:Dungeon Haul Asset]]
```

---

## A9. Atlas UI Icons

- **Wiki title:** `Dungeon Haul:Asset/Atlas UI Icons`
- **Repo — texture:** `client/public/assets/atlases/atlas_ui_icons.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_ui_icons.json`
- **Repo — PNG master:** *(none — webp + json only)*
- **Repo — raw frames:** `art_raw/ui_icons/` (14 source PNGs)
- **Phaser key:** `atlas_ui_icons` · **Atlas size:** 512×256 · **Frames:** 22

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas UI Icons ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: UI Atlas
* Asset key:: atlas_ui_icons
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_ui_icons.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_ui_icons.json
* PNG master path:: (none)
* Raw source path:: art_raw/ui_icons/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x256
* Frame count:: 22
* Priority:: P0
* Design doc section:: 1
* Consuming component:: [[Dungeon Haul:Components|Client Shell / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
UI glyphs and control hints: NES controller icon, D-pad, A/B buttons, keyboard & gamepad hints, rank medals 1–3, set-complete badge, high-score "New!" badge, wifi/disconnect icons, and an 8-frame connecting spinner.

Frame keys:
icon_controller_nes, ui_instr_dpad, tre_set_complete_badge, ui_instr_btn_a, ui_instr_btn_b, ui_hs_rank_medal_1, ui_hs_rank_medal_2, ui_hs_rank_medal_3, ui_spinner, ui_spinner_0..7, icon_keyboard, icon_gamepad, ui_hs_badge_new, icon_wifi, icon_disconnect

[[Category:Dungeon Haul Asset]]
```

---

## A10. Atlas VFX

- **Wiki title:** `Dungeon Haul:Asset/Atlas VFX`
- **Repo — texture:** `client/public/assets/atlases/atlas_vfx.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_vfx.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_vfx.png`
- **Repo — raw frames:** `art_raw/vfx/` (9 source PNGs)
- **Phaser key:** `atlas_vfx` · **Atlas size:** 512×384 · **Frames:** 42

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas VFX ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_vfx
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_vfx.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_vfx.json
* PNG master path:: client/public/assets/atlases/atlas_vfx.png
* Raw source path:: art_raw/vfx/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x384
* Frame count:: 42
* Priority:: P0 (core) / P1 (extras)
* Design doc section:: 2.1
* Consuming component:: [[Dungeon Haul:Components|Presentation]]
* Status:: Complete

=== Contents & Description ===
Particle/VFX animation frames driving gameplay feedback.

Animation clips:
vfx_stun_stars (4f), vfx_spill (5f), vfx_pickup_flash (3f), vfx_pickup_unique (4f), vfx_land_dust (3f), vfx_switch_click (3f), vfx_spawn_poof (4f), vfx_exit_speedlines (4f), vfx_ice_slide (3f)

[[Category:Dungeon Haul Asset]]
```

---

## A11. Atlas Level Props

- **Wiki title:** `Dungeon Haul:Asset/Atlas Level Props`
- **Repo — texture:** `client/public/assets/atlases/atlas_level_props.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_level_props.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_level_props.png`
- **Repo — raw frames:** `art_raw/level_props/` (9 source PNGs)
- **Phaser key:** `atlas_level_props` · **Atlas size:** 512×512 · **Frames:** 20

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Level Props ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_level_props
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_level_props.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_level_props.json
* PNG master path:: client/public/assets/atlases/atlas_level_props.png
* Raw source path:: art_raw/level_props/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x512
* Frame count:: 20
* Priority:: P1
* Design doc section:: 3
* Consuming component:: [[Dungeon Haul:Components|Presentation]]
* Status:: Complete (P1)

=== Contents & Description ===
Decorative level props with animated flame/light clips: gold candelabra (3f flame), coin piles, chest stacks, dungeon banners, sewer grates, ice icicle, cavern crystal geode, wall torches (4f flame), and ghost lanterns (4f).

Frame keys:
px_gold_near_candelabra (4f), px_ice_near_icicle, px_dun_near_banner, px_gold_near_chest_stack, px_gold_near_pile, px_dun_near_grate, px_cav_near_crystal_geode, px_dun_near_torch (4f), px_mist_near_lantern (4f)

[[Category:Dungeon Haul Asset]]
```

---

## A12. Atlas Character Extras

- **Wiki title:** `Dungeon Haul:Asset/Atlas Character Extras`
- **Repo — texture:** `client/public/assets/atlases/atlas_char_extras.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/atlas_char_extras.json`
- **Repo — PNG master:** `client/public/assets/atlases/atlas_char_extras.png`
- **Repo — raw frames:** `art_raw/char_extras/` (7 source PNGs)
- **Phaser key:** `atlas_char_extras` · **Atlas size:** 512×512 · **Frames:** 24

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Atlas Character Extras ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Atlas
* Asset key:: atlas_char_extras
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/atlas_char_extras.webp
* Atlas JSON path:: client/public/assets/atlases/atlas_char_extras.json
* PNG master path:: client/public/assets/atlases/atlas_char_extras.png
* Raw source path:: art_raw/char_extras/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 512x512
* Frame count:: 24
* Related screen:: title / fork / end
* Priority:: P0 (title sticks) / P1 (argue, rummage, badge)
* Design doc section:: 1.2 / 2.1
* Consuming component:: [[Dungeon Haul:Components|Presentation / Client Shell]]
* Status:: Complete

=== Contents & Description ===
Non-gameplay character clips: title-screen stick walk-ins for all four haulers (4f each), the Fork argue-pose overlay (3f), the End rummage pose (4f), and the AI control badge.

Frame keys:
char_title_stick_gnome_0..3, char_title_stick_sprite_0..3, char_title_stick_halfling_0..3, char_title_stick_dwarf_0..3, char_all_argue_0..2, char_all_rummage_0..3, char_ai_badge

[[Category:Dungeon Haul Asset]]
```

---

## A13. Screen Backdrops

- **Wiki title:** `Dungeon Haul:Asset/Screen Backdrops`
- **Repo — images:** `client/public/assets/images/*.webp` (6 files, 960×540)
- **Repo — raw masters:** `art_raw/ui/` (12 source PNGs)
- **Phaser keys:** `bg_title`, `bg_hoard`, `bg_dungeon`, `bg_fork`, `ui_end_scoring`, `ui_instructions_hs`

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Screen Backdrops ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: UI Backgrounds
* File format:: WebP
* Public path:: client/public/assets/images/
* Raw source path:: art_raw/ui/
* Preloaded via:: client/public/assets/manifest.json
* Image dimensions:: 960x540
* Frame count:: 6
* Priority:: P0
* Design doc section:: 1
* Consuming component:: [[Dungeon Haul:Components|Client Shell]]
* Status:: Complete (P0)

=== Contents & Description ===
Full-screen 960x540 WebP backdrops, one per major screen/scene.

Image keys and paths:
* bg_title — client/public/assets/images/bg_title.webp
* bg_hoard — client/public/assets/images/bg_hoard.webp
* bg_dungeon — client/public/assets/images/bg_dungeon.webp
* bg_fork — client/public/assets/images/bg_fork.webp
* ui_end_scoring — client/public/assets/images/ui_end_scoring.webp
* ui_instructions_hs — client/public/assets/images/ui_instructions_hs.webp

[[Category:Dungeon Haul Asset]]
```

---

# SECTION B — Character Sprites

All four hauler atlases share: **frame grid 48×48**, **atlas size 288×192**,
**22 frames**, raw PNGs in `art_raw/characters/`, and PNG masters present in the
public dir. Animation clips per hauler: **idle (4f), run (6f), jump (3f),
duck (2f), hurt (3f), stunned (4f)**.

> NOTE: the design inventory (`docs/art/ASSET-INVENTORY.md`) also specs
> `drop / throw / pushtrip / falling` clips per hauler; those are **not yet in
> the packed atlases** (only idle/run/jump/duck/hurt/stunned shipped). The page
> bodies list only what actually exists in the atlas JSON.

---

## B1. Character Gnome

- **Wiki title:** `Dungeon Haul:Asset/Character Gnome`
- **Repo — texture:** `client/public/assets/atlases/char_gnome.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/char_gnome.json`
- **Repo — PNG master:** `client/public/assets/atlases/char_gnome.png`
- **Repo — raw frames:** `art_raw/characters/`
- **Phaser key:** `char_gnome`

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Character Gnome ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Character Sprite
* Asset key:: char_gnome
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/char_gnome.webp
* Atlas JSON path:: client/public/assets/atlases/char_gnome.json
* PNG master path:: client/public/assets/atlases/char_gnome.png
* Raw source path:: art_raw/characters/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 288x192
* Frame count:: 22
* Frame grid:: 48x48
* Playable character:: Gnome
* Priority:: P0
* Design doc section:: 2.1
* Consuming component:: [[Dungeon Haul:Components|Input Mapper / Simulation / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
Gnome hauler animation set. Clips: idle (4f), run (6f), jump (3f), duck (2f), hurt (3f), stunned (4f).

Frame keys:
char_gnome_idle_0..3, char_gnome_run_0..5, char_gnome_jump_0..2, char_gnome_duck_0..1, char_gnome_hurt_0..2, char_gnome_stunned_0..3

[[Category:Dungeon Haul Asset]]
```

---

## B2. Character Sprite

- **Wiki title:** `Dungeon Haul:Asset/Character Sprite`
- **Repo — texture:** `client/public/assets/atlases/char_sprite.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/char_sprite.json`
- **Repo — PNG master:** `client/public/assets/atlases/char_sprite.png`
- **Repo — raw frames:** `art_raw/characters/`
- **Phaser key:** `char_sprite`

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Character Sprite ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Character Sprite
* Asset key:: char_sprite
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/char_sprite.webp
* Atlas JSON path:: client/public/assets/atlases/char_sprite.json
* PNG master path:: client/public/assets/atlases/char_sprite.png
* Raw source path:: art_raw/characters/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 288x192
* Frame count:: 22
* Frame grid:: 48x48
* Playable character:: Sprite
* Priority:: P0
* Design doc section:: 2.1
* Consuming component:: [[Dungeon Haul:Components|Input Mapper / Simulation / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
Sprite hauler animation set. Clips: idle (4f), run (6f), jump (3f), duck (2f), hurt (3f), stunned (4f).

Frame keys:
char_sprite_idle_0..3, char_sprite_run_0..5, char_sprite_jump_0..2, char_sprite_duck_0..1, char_sprite_hurt_0..2, char_sprite_stunned_0..3

[[Category:Dungeon Haul Asset]]
```

---

## B3. Character Halfling

- **Wiki title:** `Dungeon Haul:Asset/Character Halfling`
- **Repo — texture:** `client/public/assets/atlases/char_halfling.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/char_halfling.json`
- **Repo — PNG master:** `client/public/assets/atlases/char_halfling.png`
- **Repo — raw frames:** `art_raw/characters/`
- **Phaser key:** `char_halfling`

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Character Halfling ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Character Sprite
* Asset key:: char_halfling
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/char_halfling.webp
* Atlas JSON path:: client/public/assets/atlases/char_halfling.json
* PNG master path:: client/public/assets/atlases/char_halfling.png
* Raw source path:: art_raw/characters/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 288x192
* Frame count:: 22
* Frame grid:: 48x48
* Playable character:: Halfling
* Priority:: P0
* Design doc section:: 2.1
* Consuming component:: [[Dungeon Haul:Components|Input Mapper / Simulation / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
Halfling hauler animation set. Clips: idle (4f), run (6f), jump (3f), duck (2f), hurt (3f), stunned (4f).

Frame keys:
char_halfling_idle_0..3, char_halfling_run_0..5, char_halfling_jump_0..2, char_halfling_duck_0..1, char_halfling_hurt_0..2, char_halfling_stunned_0..3

[[Category:Dungeon Haul Asset]]
```

---

## B4. Character Dwarf

- **Wiki title:** `Dungeon Haul:Asset/Character Dwarf`
- **Repo — texture:** `client/public/assets/atlases/char_dwarf.webp`
- **Repo — atlas JSON:** `client/public/assets/atlases/char_dwarf.json`
- **Repo — PNG master:** `client/public/assets/atlases/char_dwarf.png`
- **Repo — raw frames:** `art_raw/characters/`
- **Phaser key:** `char_dwarf`

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Character Dwarf ==
=== Asset Metadata ===
* Asset review status:: ACCEPTED
* Has type:: Character Sprite
* Asset key:: char_dwarf
* File format:: WebP + JSON (Phaser 3 Hash atlas)
* Texture path:: client/public/assets/atlases/char_dwarf.webp
* Atlas JSON path:: client/public/assets/atlases/char_dwarf.json
* PNG master path:: client/public/assets/atlases/char_dwarf.png
* Raw source path:: art_raw/characters/
* Preloaded via:: client/public/assets/manifest.json
* Atlas dimensions:: 288x192
* Frame count:: 22
* Frame grid:: 48x48
* Playable character:: Dwarf
* Priority:: P0
* Design doc section:: 2.1
* Consuming component:: [[Dungeon Haul:Components|Input Mapper / Simulation / Presentation]]
* Status:: Complete (P0)

=== Contents & Description ===
Dwarf hauler animation set. Clips: idle (4f), run (6f), jump (3f), duck (2f), hurt (3f), stunned (4f).

Frame keys:
char_dwarf_idle_0..3, char_dwarf_run_0..5, char_dwarf_jump_0..2, char_dwarf_duck_0..1, char_dwarf_hurt_0..2, char_dwarf_stunned_0..3

[[Category:Dungeon Haul Asset]]
```

---

# SECTION C — Audio Stems

> **ACCURACY WARNING for uploader:** the current audio stubs are aspirational.
> Actual repo state (verified):
> - Format is **`.wav`**, not OGG.
> - **No `art_raw/audio/` directory exists** — audio has no raw tier.
> - Audio is **not in `manifest.json`** — not wired for preload yet.
> - Only **one clip per page currently exists on disk**; the rest are PLANNED
>   (Audio Director / C-13 not wired — see CLAUDE.md).
> The page bodies below state this honestly. Do not re-assert OGG or a raw path.

---

## C1. Audio Music Stems

- **Wiki title:** `Dungeon Haul:Asset/Audio Music Stems`
- **Repo — present:** `client/public/assets/audio/music/music_title.wav`
- **Repo — planned:** `music_hoard.wav`, `music_dungeon.wav`, `music_end_scoring.wav` (not on disk)

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Audio Music Stems ==
=== Asset Metadata ===
* Asset review status:: DRAFT
* Has type:: Music
* File format:: WAV
* Public path:: client/public/assets/audio/music/
* Raw source path:: (none)
* Consuming component:: [[Dungeon Haul:Components|Audio Director]]
* Priority:: P0
* Status:: Partial (music_title present; remaining stems planned)

=== Contents & Description ===
Music stems for each phase. Only the title stem currently ships; the rest are planned pending the Audio Director (C-13) wiring.

Files:
* music_title — client/public/assets/audio/music/music_title.wav — PRESENT
* music_hoard — PLANNED
* music_dungeon — PLANNED
* music_end_scoring — PLANNED

[[Category:Dungeon Haul Asset]]
```

---

## C2. Audio Character SFX

- **Wiki title:** `Dungeon Haul:Asset/Audio Character SFX`
- **Repo — present:** `client/public/assets/audio/sfx/char/char_jump.wav`
- **Repo — planned:** land, hurt, stunned, throw, drop (not on disk)

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Audio Character SFX ==
=== Asset Metadata ===
* Asset review status:: DRAFT
* Has type:: SFX
* File format:: WAV
* Public path:: client/public/assets/audio/sfx/char/
* Raw source path:: (none)
* Consuming component:: [[Dungeon Haul:Components|Audio Director]]
* Priority:: P0
* Status:: Partial (char_jump present; remaining planned)

=== Contents & Description ===
Character action SFX. Only the jump cue currently ships.

Files:
* char_jump — client/public/assets/audio/sfx/char/char_jump.wav — PRESENT
* char_land — PLANNED
* char_hurt — PLANNED
* char_stunned — PLANNED
* char_throw — PLANNED
* char_drop — PLANNED

[[Category:Dungeon Haul Asset]]
```

---

## C3. Audio Loot and Objects

- **Wiki title:** `Dungeon Haul:Asset/Audio Loot and Objects`
- **Repo — present:** `client/public/assets/audio/sfx/object/pickup_treasure.wav`
- **Repo — planned:** chest open, coin cascade (not on disk)

```mediawiki
[[Dungeon Haul:Hub|← Back to Dungeon Haul Hub]]

== Audio Loot and Objects ==
=== Asset Metadata ===
* Asset review status:: DRAFT
* Has type:: SFX
* File format:: WAV
* Public path:: client/public/assets/audio/sfx/object/
* Raw source path:: (none)
* Consuming component:: [[Dungeon Haul:Components|Audio Director]]
* Priority:: P0
* Status:: Partial (pickup_treasure present; remaining planned)

=== Contents & Description ===
Loot & object interaction SFX. Only the treasure pickup cue currently ships.

Files:
* pickup_treasure — client/public/assets/audio/sfx/object/pickup_treasure.wav — PRESENT
* chest_open — PLANNED
* coin_cascade — PLANNED

[[Category:Dungeon Haul Asset]]
```

---

# SECTION D — Gaps / recommendations for the owner

These exist in the repo but are **not represented by any hub page**. Flag to the
owner before the uploader decides whether to add new pages:

1. **Trap SFX** — `client/public/assets/audio/sfx/trap/trap_spikes.wav` exists,
   but there is no "Audio Trap SFX" hub page. Consider adding
   `Dungeon Haul:Asset/Audio Trap SFX` under the Audio Stems hub section.
2. **UI SFX** — `client/public/assets/audio/sfx/ui/ui_start_game.wav` exists with
   no page. Consider `Dungeon Haul:Asset/Audio UI SFX`.
3. **Missing character clips** — atlases ship only idle/run/jump/duck/hurt/stunned;
   design inventory also specs drop/throw/pushtrip/falling. Either regenerate the
   char atlases or note the atlas as a partial P0 set on each character page.
4. **Audio not in `manifest.json`** — none of the `.wav` files are in the preload
   manifest yet; Audio Director (C-13) is unwired. The DRAFT status on audio pages
   reflects this.

---

# Upload checklist (for the downstream agent)

- [ ] Use `update-page` on each of the 20 existing titles (wiki `wiki.omoai.net`).
- [ ] Paste the fenced `mediawiki` body verbatim (drop the outer ```` ```mediawiki ```` fence).
- [ ] Preserve the Hub breadcrumb and `[[Category:Dungeon Haul Asset]]` footer.
- [ ] Do **not** invent OGG format or `art_raw/audio/` paths for audio pages.
- [ ] Hub already links every page; no Hub edit needed unless adding the Section D gap pages.
- [ ] After upload, spot-check one page's SMW props render via `parse-wikitext`.
