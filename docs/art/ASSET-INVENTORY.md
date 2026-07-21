# Dungeon Haul — Asset Inventory

> **Status:** Documentation only — lists & specs, **no** image generation.  
> **Canvas:** 960×540 logical. **Block:** 32×32. Prefer power-of-two atlases (512 / 1024 / 2048).  
> **Priorities:** **P0** ship MVP (Hoard + 2 levels + core loop), **P1** polish / full biomes, **P2** stretch.  
> **Design refs:** TOJam 8 design doc sections cited per row.

### How to read a row

| Field | Meaning |
|---|---|
| **ID** | Stable asset key (atlas / file stem) |
| **Dims / grid** | Frame size or sheet layout |
| **Anim** | Frame count, fps notes, loop vs one-shot |
| **Pri** | P0 / P1 / P2 |
| **Tags** | Biomes, screens, systems |
| **§** | Design-doc section |

**MVP level art tags:** `biome:gold` (Hoard), `biome:dungeon`, `biome:outside` unless noted. Other biomes default P1.

---

## 0. Summary counts

| Category | P0 | P1 | P2 | Total |
|---|---:|---:|---:|---:|
| Characters (clips, portraits, title sticks) | 49 | 3 | 0 | **52** |
| Treasures (commons, rares, uniques, sets, chests) | 25 | 30 | 5 | **60** |
| Blocks / surfaces / switches / gates | 14 | 16 | 5 | **35** |
| Traps & enemies | 6 | 22 | 6 | **34** |
| Level decor / parallax (incl. fork icons) | 25 | 30 | 4 | **59** |
| UI screens & panels | 50 | 11 | 1 | **62** |
| VFX | 7 | 12 | 3 | **22** |
| Fonts / icons / logo / misc | 13 | 8 | 3 | **24** |
| **Grand total** | **189** | **132** | **27** | **348** |

> Counts treat each logical production item (e.g. one anim clip or one static prop) as one asset. Multi-frame clips still count as **one** inventory row. Atlas packing suggestions (§9) are packaging notes, not extra assets.

---

## 1. Characters

### 1.1 Hauler animation clips

Four characters × ten `animState` values from architecture / design §2.1.

| ID | Name | Category | Dims / grid | Animation notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `char_gnome_idle` | Gnome Idle | Character | 48×48; 4 frames | Loop 6–8 fps; slight bob | P0 | char:gnome, all-levels | 2.1 |
| `char_gnome_run` | Gnome Run | Character | 48×48; 6 frames | Loop 10–12 fps | P0 | char:gnome | 2.1 |
| `char_gnome_jump` | Gnome Jump | Character | 48×48; 3 frames | One-shot: rise / apex / fall pose | P0 | char:gnome | 2.1 |
| `char_gnome_duck` | Gnome Duck | Character | 48×48; 2 frames | Holdable crouch; pickup pose | P0 | char:gnome | 2.1 |
| `char_gnome_drop` | Gnome Drop | Character | 48×48; 3 frames | One-shot from duck; top-of-stack release | P0 | char:gnome | 2.1 |
| `char_gnome_throw` | Gnome Throw | Character | 48×48; 4 frames | One-shot upward/forward toss | P0 | char:gnome | 2.1 |
| `char_gnome_pushtrip` | Gnome Push/Trip | Character | 48×48; 4 frames | Empty-handed B; contact frame clear | P0 | char:gnome | 2.1 |
| `char_gnome_hurt` | Gnome Hurt | Character | 48×48; 3 frames | Compelled; flash white optional via code | P0 | char:gnome | 2.1 |
| `char_gnome_stunned` | Gnome Stunned | Character | 48×48; 4 frames | Loop + stars (or use VFX) | P0 | char:gnome | 2.1 |
| `char_gnome_falling` | Gnome Falling | Character | 48×48; 2–3 frames | Compelled; arms flail | P0 | char:gnome | 2.1 |
| `char_sprite_idle` | Sprite Idle | Character | 48×48; 4 f | Same grid as gnome | P0 | char:sprite | 2.1 / 4.2 |
| `char_sprite_run` | Sprite Run | Character | 48×48; 6 f | | P0 | char:sprite | 2.1 |
| `char_sprite_jump` | Sprite Jump | Character | 48×48; 3 f | | P0 | char:sprite | 2.1 |
| `char_sprite_duck` | Sprite Duck | Character | 48×48; 2 f | | P0 | char:sprite | 2.1 |
| `char_sprite_drop` | Sprite Drop | Character | 48×48; 3 f | | P0 | char:sprite | 2.1 |
| `char_sprite_throw` | Sprite Throw | Character | 48×48; 4 f | | P0 | char:sprite | 2.1 |
| `char_sprite_pushtrip` | Sprite Push/Trip | Character | 48×48; 4 f | | P0 | char:sprite | 2.1 |
| `char_sprite_hurt` | Sprite Hurt | Character | 48×48; 3 f | | P0 | char:sprite | 2.1 |
| `char_sprite_stunned` | Sprite Stunned | Character | 48×48; 4 f | | P0 | char:sprite | 2.1 |
| `char_sprite_falling` | Sprite Falling | Character | 48×48; 2–3 f | | P0 | char:sprite | 2.1 |
| `char_halfling_idle` | Halfling Idle | Character | 48×48; 4 f | | P0 | char:halfling | 2.1 |
| `char_halfling_run` | Halfling Run | Character | 48×48; 6 f | | P0 | char:halfling | 2.1 |
| `char_halfling_jump` | Halfling Jump | Character | 48×48; 3 f | | P0 | char:halfling | 2.1 |
| `char_halfling_duck` | Halfling Duck | Character | 48×48; 2 f | | P0 | char:halfling | 2.1 |
| `char_halfling_drop` | Halfling Drop | Character | 48×48; 3 f | | P0 | char:halfling | 2.1 |
| `char_halfling_throw` | Halfling Throw | Character | 48×48; 4 f | | P0 | char:halfling | 2.1 |
| `char_halfling_pushtrip` | Halfling Push/Trip | Character | 48×48; 4 f | | P0 | char:halfling | 2.1 |
| `char_halfling_hurt` | Halfling Hurt | Character | 48×48; 3 f | | P0 | char:halfling | 2.1 |
| `char_halfling_stunned` | Halfling Stunned | Character | 48×48; 4 f | | P0 | char:halfling | 2.1 |
| `char_halfling_falling` | Halfling Falling | Character | 48×48; 2–3 f | | P0 | char:halfling | 2.1 |
| `char_dwarf_idle` | Dwarf Idle | Character | 48×48; 4 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_run` | Dwarf Run | Character | 48×48; 6 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_jump` | Dwarf Jump | Character | 48×48; 3 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_duck` | Dwarf Duck | Character | 48×48; 2 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_drop` | Dwarf Drop | Character | 48×48; 3 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_throw` | Dwarf Throw | Character | 48×48; 4 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_pushtrip` | Dwarf Push/Trip | Character | 48×48; 4 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_hurt` | Dwarf Hurt | Character | 48×48; 3 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_stunned` | Dwarf Stunned | Character | 48×48; 4 f | | P0 | char:dwarf | 2.1 |
| `char_dwarf_falling` | Dwarf Falling | Character | 48×48; 2–3 f | | P0 | char:dwarf | 2.1 |

### 1.2 Character extras

| ID | Name | Category | Dims / grid | Animation notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `char_gnome_portrait` | Gnome Portrait | Character UI | 64×64 static | High scores, lobby, end | P0 | ui, char:gnome | 1.7 |
| `char_sprite_portrait` | Sprite Portrait | Character UI | 64×64 | | P0 | ui, char:sprite | 1.7 |
| `char_halfling_portrait` | Halfling Portrait | Character UI | 64×64 | | P0 | ui, char:halfling | 1.7 |
| `char_dwarf_portrait` | Dwarf Portrait | Character UI | 64×64 | | P0 | ui, char:dwarf | 1.7 |
| `char_all_argue` | Argue Pose Overlay | Character | 48×48; 3 f | Fork mash feedback; tint per char or 4 sheets | P1 | screen:fork | 1.1 / 2.1 |
| `char_all_rummage` | Rummage Pose | Character | 48×48; 4 f loop | End spoils; shared motion, recolor | P1 | screen:end | 1.5 |
| `char_all_carry_offset` | Carry Anchor Guide | Meta | 1×1 pivot note | Not drawn — production guide | P0 | meta | 2.2 |
| `char_ai_badge` | AI Control Badge | Character UI | 16×16 | Optional above AI hauler | P1 | ui | 2.1 |
| `char_title_stick_gnome` | Title Stick Gnome | Title | 64×96; 4 f walk | Simplified title silhouettes OK | P0 | screen:title | 1.2 |
| `char_title_stick_sprite` | Title Stick Sprite | Title | 64×96; 4 f | | P0 | screen:title | 1.2 |
| `char_title_stick_halfling` | Title Stick Halfling | Title | 64×96; 4 f | | P0 | screen:title | 1.2 |
| `char_title_stick_dwarf` | Title Stick Dwarf | Title | 64×96; 4 f | | P0 | screen:title | 1.2 |

**Atlas suggestion:** `atlas_chars_1024.png` — 4 chars × 10 states; portraits on `atlas_ui`.

---

## 2. Treasures

Spawn mix: 65% Common / 20% Rare / 5% Unique / 10% Set (§2.2). Unique/Set never duplicate while in play.

### 2.1 Common (design list)

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `tre_stone_icon` | Stone Icon (5 gp) | Treasure Common | 32×32 | Idle 1–2 sparkle | P0 | rarity:common | 2.2 |
| `tre_coin_sack` | Coin Sack (20 gp) | Treasure Common | 32×28 | **No stack height** | P0 | rarity:common, stack:flat | 2.2 |
| `tre_brass_watch` | Brass Watch (20 gp) | Treasure Common | 32×32 | | P0 | rarity:common | 2.2 |
| `tre_bronze_icon` | Bronze Icon (50 gp) | Treasure Common | 32×32 | | P0 | rarity:common | 2.2 |
| `tre_gold_watch` | Gold Watch (75 gp) | Treasure Common | 32×32 | | P0 | rarity:common | 2.2 |
| `tre_big_coin_sack` | Big Coin Sack (100 gp) | Treasure Common | 36×32 | **No stack height** | P0 | rarity:common, stack:flat | 2.2 |
| `tre_silver_icon` | Silver Icon (100 gp) | Treasure Common | 32×32 | | P0 | rarity:common | 2.2 |
| `tre_sculpture` | Sculpture (150 gp) | Treasure Common | 32×40 | Tall OK | P0 | rarity:common | 2.2 |
| `tre_giant_coin_sack` | Giant Coin Sack (200 gp) | Treasure Common | 40×36 | **No stack height** | P0 | rarity:common, stack:flat | 2.2 |
| `tre_wooden_chest_closed` | Wooden Chest Closed | Treasure Chest | 40×32 | Opens → random C/R | P0 | rarity:chest | 2.2 |
| `tre_wooden_chest_open` | Wooden Chest Open | Treasure Chest | 40×32 | 2-frame open | P0 | rarity:chest | 2.2 |
| `tre_silver_chest_closed` | Silver Chest Closed | Treasure Chest | 40×32 | Opens → C/R/U | P1 | rarity:chest | 2.2 |
| `tre_silver_chest_open` | Silver Chest Open | Treasure Chest | 40×32 | | P1 | rarity:chest | 2.2 |

### 2.2 Rare

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `tre_gold_icon` | Gold Icon (250 gp) | Treasure Rare | 32×32 | Strong glint loop | P0 | rarity:rare | 2.2 |
| `tre_rare_placeholder_350` | Rare Mid (350 gp slot) | Treasure Rare | 32×32 | Design row blank; treat as ornate gem idol until named | P1 | rarity:rare | 2.2 |
| `tre_gemstone` | Gemstone (500 gp) | Treasure Rare | 32×32 | Facet sparkle 3 f | P0 | rarity:rare | 2.2 |
| `tre_crown` | Crown (750 gp) | Treasure Rare | 36×28 | | P0 | rarity:rare | 2.2 |
| `tre_marble_icon` | Marble Icon (800 gp) | Treasure Rare | 32×32 | | P1 | rarity:rare | 2.2 |
| `tre_gold_chest_closed` | Gold Chest Closed | Treasure Chest | 40×32 | Opens → R/U/Set | P1 | rarity:chest | 2.2 |
| `tre_gold_chest_open` | Gold Chest Open | Treasure Chest | 40×32 | | P1 | rarity:chest | 2.2 |
| `tre_magic_chest_closed` | Magic Chest Closed | Treasure Chest | 40×32 | Completes sets / unique | P1 | rarity:chest | 2.2 |
| `tre_magic_chest_open` | Magic Chest Open | Treasure Chest | 40×32 | Extra glow | P1 | rarity:chest | 2.2 |

### 2.3 Unique

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `tre_goat_icon` | Goat Icon (800 gp) | Treasure Unique | 32×40 | Jammy / goat-on-pole synergy | P0 | rarity:unique | 2.2 / 2.3 |
| `tre_supply_crate` | Supply Crate (800 gp) | Treasure Unique | 36×32 | | P1 | rarity:unique | 2.2 |
| `tre_giants_ring` | Giant's Ring (900 gp) | Treasure Unique | 36×36 | | P1 | rarity:unique | 2.2 |
| `tre_nes_cartridge` | NES Cartridge (1000 gp) | Treasure Unique | 28×36 | Retro nod; crisp label | P0 | rarity:unique | 2.2 |
| `tre_magic_scepter` | Magic Scepter (1000 gp) | Treasure Unique | 24×48 | Tall; rotate OK when thrown | P1 | rarity:unique | 2.2 |
| `tre_question_block` | ? Block (1000 gp) | Treasure Unique | 32×32 | Mario-adjacent joke item | P1 | rarity:unique | 2.2 |
| `tre_ruby_crown` | Ruby Crown (1200 gp) | Treasure Unique | 36×28 | | P1 | rarity:unique | 2.2 |
| `tre_etank` | E-Tank (1200 gp) | Treasure Unique | 28×36 | | P1 | rarity:unique | 2.2 |
| `tre_crystal_skull` | Crystal Skull (1500 gp) | Treasure Unique | 32×36 | Subtle pulse | P1 | rarity:unique | 2.2 |
| `tre_magic_hourglass` | Magic Hourglass (1500 gp) | Treasure Unique | 28×40 | Sand anim 4 f optional | P1 | rarity:unique | 2.2 |

### 2.4 Sets

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `tre_set_armor_helmet` | Armor Helmet | Treasure Set | 32×32 | Set rim color shared | P0 | set:armor | 2.2 |
| `tre_set_armor_breastplate` | Armor Breastplate | Treasure Set | 32×36 | | P0 | set:armor | 2.2 |
| `tre_set_armor_greaves` | Armor Greaves | Treasure Set | 32×32 | | P0 | set:armor | 2.2 |
| `tre_set_armor_gauntlets` | Armor Gauntlets | Treasure Set | 32×28 | | P0 | set:armor | 2.2 |
| `tre_set_haul_h` | HAUL Icon H | Treasure Set | 32×32 | Letter block style | P0 | set:haul | 2.2 |
| `tre_set_haul_a` | HAUL Icon A | Treasure Set | 32×32 | | P0 | set:haul | 2.2 |
| `tre_set_haul_u` | HAUL Icon U | Treasure Set | 32×32 | | P0 | set:haul | 2.2 |
| `tre_set_haul_l` | HAUL Icon L | Treasure Set | 32×32 | | P0 | set:haul | 2.2 |
| `tre_set_celestial_sun` | Sun Sculpture | Treasure Set | 32×36 | | P1 | set:celestial | 2.2 |
| `tre_set_celestial_moon` | Moon Sculpture | Treasure Set | 32×36 | | P1 | set:celestial | 2.2 |
| `tre_set_celestial_star` | Star Sculpture | Treasure Set | 32×36 | | P1 | set:celestial | 2.2 |
| `tre_set_divine_spade` | Divine Spade | Treasure Set | 32×32 | Card suit | P1 | set:divine | 2.2 |
| `tre_set_divine_club` | Divine Club | Treasure Set | 32×32 | | P1 | set:divine | 2.2 |
| `tre_set_divine_heart` | Divine Heart | Treasure Set | 32×32 | | P1 | set:divine | 2.2 |
| `tre_set_divine_diamond` | Divine Diamond | Treasure Set | 32×32 | | P1 | set:divine | 2.2 |
| `tre_set_song_flame_guitar` | Flame Guitar | Treasure Set | 24×48 | | P1 | set:song | 2.2 |
| `tre_set_song_ice_bass` | Ice Bass | Treasure Set | 24×48 | | P1 | set:song | 2.2 |
| `tre_set_box_andrew` | Box Icon Andrew | Treasure Set | 32×32 | Team jam set | P2 | set:box | 2.2 |
| `tre_set_box_greg` | Box Icon Greg | Treasure Set | 32×32 | | P2 | set:box | 2.2 |
| `tre_set_box_lindsey` | Box Icon Lindsey | Treasure Set | 32×32 | | P2 | set:box | 2.2 |
| `tre_set_box_megan` | Box Icon Megan | Treasure Set | 32×32 | | P2 | set:box | 2.2 |
| `tre_set_box_darius` | Box Icon Darius | Treasure Set | 32×32 | | P2 | set:box | 2.2 |
| `tre_set_veg_turnip` | Turnip | Treasure Set | 28×32 | Joke high-bonus set | P1 | set:veg | 2.2 |
| `tre_set_veg_pepper` | Green Pepper | Treasure Set | 28×32 | | P1 | set:veg | 2.2 |
| `tre_set_veg_pumpkin` | Pumpkin | Treasure Set | 32×28 | | P1 | set:veg | 2.2 |
| `tre_set_veg_onion` | Onion | Treasure Set | 28×32 | | P1 | set:veg | 2.2 |
| `tre_set_complete_badge` | Set Complete Badge | Treasure UI | 96×48 | End popout frame | P0 | screen:end, vfx | 1.5 |
| `tre_world_bounce_shadow` | Free Treasure Shadow | Treasure | 24×8 | Soft oval under free loot | P1 | all-levels | 2.2 |

**MVP treasure minimum:** all Common + wooden chest + 3–4 Rare + Goat + NES Cart + Armor set + HAUL set.

---

## 3. Blocks / surfaces / switches / gates

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `blk_brick_dungeon` | Dungeon Brick | Block | 32×32 tileset (auto 16) | Static; 4–8 variants for tiling | P0 | biome:dungeon | 3.3 |
| `blk_brick_gold` | Hoard Stone/Gold Trim | Block | 32×32 tileset | Vault floor/walls | P0 | biome:gold | 3.3 |
| `blk_brick_outside` | Outside Dirt/Stone | Block | 32×32 tileset | Path + grass topper | P0 | biome:outside | 3.3 |
| `blk_ice` | Ice Block | Block | 32×32 | Specular strip; slippery | P1 | biome:ice | 3.3 |
| `blk_sand` | Sand Block | Block | 32×32 | Grain; high friction | P1 | biome:cavern, outside | 3.3 |
| `blk_lava_rock` | Lava Basalt | Block | 32×32 | Cracks optional | P1 | biome:lava | 3.3 |
| `blk_cavern_rock` | Cavern Rock | Block | 32×32 | Rough edge set | P1 | biome:cavern | 3.3 |
| `blk_mist_stone` | Mist Stone | Block | 32×32 | Soft edge | P1 | biome:mist | 3.3 |
| `blk_platform_oneway` | One-Way Platform | Block | 32×16 | If used by maps | P2 | mid | 3.3 |
| `blk_pit_hazard_fill` | Pit Visual Fill | Block | 32×32 strip | Non-solid death pit look | P0 | all-levels | 0.0 |
| `sw_switch_up` | Switch Up | Switch | 32×24 | Unpressed | P0 | mid | 3.3 |
| `sw_switch_down` | Switch Down | Switch | 32×16 | Pressed | P0 | mid | 3.3 |
| `sw_heavy_up` | Heavy Switch Up | Switch | 40×28 | Larger plate | P0 | mid | 3.3 |
| `sw_heavy_down` | Heavy Switch Down | Switch | 40×20 | | P0 | mid | 3.3 |
| `gate_iron_closed` | Iron Gate Closed | Gate | 32×64 (2 tall) | Blocks path | P0 | biome:dungeon | 0.0 |
| `gate_iron_open` | Iron Gate Open | Gate | 32×64; 4 f | Slide/retract | P0 | biome:dungeon | 0.0 |
| `gate_gold_closed` | Hoard Gate Closed | Gate | 32×64 | | P1 | biome:gold | 3.1 |
| `gate_gold_open` | Hoard Gate Open | Gate | 32×64; 4 f | | P1 | biome:gold | 3.1 |
| `gate_biome_tinted` | Biome Gate Variants | Gate | 32×64 ×5 | Lava/Ice/Cavern/Mist/Outside tints | P1 | biomes | 3.1 |
| `blk_exit_banner` | Level Exit Zone | Marker | 32×64 | Subtle arrow / light | P0 | all-levels | 1.4 |
| `blk_spawn_pad` | Spawn Pad | Marker | 48×16 | Optional visual | P1 | all-levels | 1.3 |
| `tileset_autotile_mask` | Autotile bitmask ref | Meta | 47-tile or 16-tile | Production guide | P0 | meta | 3.2 |
| `blk_ladder` | Ladder | Block | 32×32 | Stretch | P2 | mid | — |
| `blk_spike_base_empty` | Spike recess floor | Block | 32×32 | When spikes retract (if any) | P2 | mid | 3.3 |
| `surf_friction_debug` | Debug friction tint | Meta | 32×32 | Dev only | P2 | meta | 3.3 |

**Per-biome brick variants P1:** ice/lava/cavern/mist counted in biome rows above (8 block IDs + gates).

Additional explicit tile variants for polish:

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `blk_brick_dungeon_top` | Dungeon Top Lip | Block | 32×32 | Edge piece | P1 | biome:dungeon | 3.3 |
| `blk_brick_dungeon_shadow` | Dungeon Inner Shadow | Block | 32×32 | | P1 | biome:dungeon | 3.3 |
| `blk_gold_pile_solid` | Decorative Gold Solid | Block | 32×32 | Non-collectible mid decor | P0 | biome:gold | 3.3 |
| `blk_outside_grass_top` | Grass Topper | Block | 32×32 | | P0 | biome:outside | 3.3 |
| `blk_ice_crack` | Ice Crack Variant | Block | 32×32 | | P1 | biome:ice | 3.3 |
| `blk_lava_glow_edge` | Lava Edge Glow | Block | 32×32 | Animated 4 f | P1 | biome:lava | 3.3 |
| `blk_cavern_moss` | Mossy Rock | Block | 32×32 | | P1 | biome:cavern | 3.3 |
| `blk_mist_rune` | Rune Stone | Block | 32×32 | | P1 | biome:mist | 3.3 |
| `sw_linked_indicator` | Switch Link Glyph | Switch UI | 16×16 | Shows linked device | P2 | mid | 3.3 |
| `gate_bars_tile` | Gate Bars Mid Tile | Gate | 32×32 | Multi-height gates | P1 | mid | 0.0 |

---

## 4. Traps & enemies

| ID | Name | Category | Dims / grid | Animation notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `trap_spikes_idle` | Spikes Idle | Trap | 32×32 | Static up | P0 | all-mvp-levels | 3.3 |
| `trap_spikes_bloodless_hit` | Spikes Hit Flash | Trap | 32×32; 2 f | Optional; stun is on player | P1 | | 3.3 |
| `trap_crumble_idle` | Crumbling Brick Idle | Trap | 32×32 | Cracks visible | P0 | | 3.3 |
| `trap_crumble_strain` | Crumbling Strain | Trap | 32×32; 4 f | Shake before break | P0 | | 3.3 |
| `trap_crumble_break` | Crumbling Break | Trap | 32×32; 4 f | One-shot → gone | P0 | | 3.3 |
| `trap_recede_idle` | Receding Block Idle | Trap | 32×32 | | P0 | | 3.3 |
| `trap_recede_out` | Receding Slide Out | Trap | 32×32; 4 f | Vanish underfoot | P0 | | 3.3 |
| `trap_recede_in` | Receding Slide In | Trap | 32×32; 4 f | Return | P1 | | 3.3 |
| `trap_lightning_emitter` | Lightning Emitter | Trap | 32×32 | Idle coil | P1 | | 3.3 |
| `trap_lightning_bolt` | Lightning Bolt | Trap VFX | 16×64 or beam | 3–4 f zap; cycling + activated share art | P1 | | 3.3 |
| `trap_lightning_telegraph` | Lightning Telegraph | Trap VFX | 32×32; 2 f | Pre-zap warning | P1 | | 3.3 |
| `trap_gas_emitter` | Gas Emitter | Trap | 32×32 | Vent | P1 | | 3.3 |
| `trap_gas_cloud` | Gas Cloud | Trap VFX | 48×48; 6 f | Billow; stun | P1 | | 3.3 |
| `trap_falling_rock_idle` | Falling Rock Idle | Trap | 32×32 | Ceiling hold | P1 | | 3.3 |
| `trap_falling_rock_fall` | Falling Rock Projectile | Trap | 32×32 | Bounce frames 2 f | P1 | | 3.3 |
| `trap_falling_rock_impact` | Falling Rock Impact | Trap VFX | 48×32; 4 f | | P1 | | 3.3 |
| `enemy_golem_idle` | Golem Idle | Enemy | 64×64; 4 f | Wander | P1 | | 3.3 |
| `enemy_golem_walk` | Golem Walk | Enemy | 64×64; 6 f | Stomp | P1 | | 3.3 |
| `enemy_golem_attack` | Golem Attack | Enemy | 64×64; 4 f | | P1 | | 3.3 |
| `enemy_golem_stunned` | Golem Stunned | Enemy | 64×64; 4 f | Treasure/jump stun | P1 | | 3.3 |
| `enemy_phantom_idle` | Phantom Hand Idle | Enemy | 48×64; 4 f | Ceiling hang | P1 | | 3.3 |
| `enemy_phantom_drop` | Phantom Hand Drop | Enemy | 48×64; 4 f | Steal attempt | P1 | | 3.3 |
| `enemy_phantom_flee` | Phantom Hand Flee | Enemy | 48×64; 4 f | Hit by throw/jump | P1 | | 3.3 |
| `enemy_phantom_hurt` | Phantom Hand Hurt | Enemy | 48×64; 3 f | | P1 | | 3.3 |
| `trap_spike_pit_combo` | Spike + Pit Combo Deco | Trap | 32×64 | Visual only | P2 | | 0.0 |
| `trap_crush_block` | Crushing Block | Trap | 64×32; 4 f | Premise mention; stretch | P2 | | 0.0 |
| `trap_shock_floor` | Shock Floor Plate | Trap | 32×32; 4 f | Alt to lightning | P2 | | 0.0 |
| `trap_activated_base` | Activated Trap Base Shared | Trap | 32×32 | LED/gem on when armed | P1 | | 3.3 |
| `trap_cycling_timer_pip` | Cycling Timer Pips | Trap UI | 16×8 | Optional telegraph | P2 | | 3.3 |
| `enemy_golem_shadow` | Golem Contact Shadow | Enemy | 48×12 | | P2 | | 3.3 |
| `trap_recede_warn_outline` | Recede Warning Outline | Trap | 32×32 | | P2 | | 3.3 |
| `trap_spikes_biome_ice` | Ice Spike Variant | Trap | 32×32 | Reskin | P1 | biome:ice | 3.3 |
| `trap_spikes_biome_lava` | Lava Spike/Obsidian | Trap | 32×32 | Reskin | P1 | biome:lava | 3.3 |
| `trap_gas_biome_mist` | Mist Gas Tint | Trap | 48×48 | Reskin cloud | P1 | biome:mist | 3.3 |

**MVP traps:** spikes, crumble, recede, switch-linked gate. Lightning/gas/rock/golem/hand → P1.

---

## 5. Level decor & parallax (per biome)

Each biome needs Far strip + Near props + Fore props. Hoard/Dungeon/Outside are P0.

### 5.1 Gold Hoard

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_gold_far` | Hoard Far BG | Parallax Far | 960×540 or 512 tile | Slow scroll 0.5× | P0 | biome:gold | 3.3 |
| `px_gold_near_column` | Vault Column | Parallax Near | 64×256 | | P0 | biome:gold | 3.3 |
| `px_gold_near_pile` | Coin Pile Prop | Parallax Near | 96×64 | Non-collectible | P0 | biome:gold | 3.3 |
| `px_gold_near_candelabra` | Candelabra | Parallax Near | 32×96; 3 f flame | | P0 | biome:gold | 3.3 |
| `px_gold_fore_arch` | Fore Arch | Parallax Fore | 128×160 | | P1 | biome:gold | 3.3 |
| `px_gold_near_chest_stack` | Decor Chest Stack | Parallax Near | 96×80 | | P1 | biome:gold | 3.3 |

### 5.2 Outside

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_out_far_sky` | Outside Far Sky | Parallax Far | 960×540 tile | Clouds optional layer | P0 | biome:outside | 3.1 |
| `px_out_far_cloud` | Cloud Tile | Parallax Far | 128×64 | Soft scroll | P0 | biome:outside | 3.3 |
| `px_out_near_tree` | Tree | Parallax Near | 96×256 | 2 variants | P0 | biome:outside | 3.3 |
| `px_out_near_fence` | Fence Segment | Parallax Near | 64×48 | | P0 | biome:outside | 3.3 |
| `px_out_near_bush` | Bush | Parallax Near | 48×32 | | P1 | biome:outside | 3.3 |
| `px_out_fore_leaf` | Foreground Leaves | Parallax Fore | 64×64; 4 f sway | | P1 | biome:outside | 3.3 |

### 5.3 Dungeon

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_dun_far` | Dungeon Far | Parallax Far | 960×540 / tile | Dark stone mass | P0 | biome:dungeon | 3.1 |
| `px_dun_near_torch` | Wall Torch | Parallax Near | 32×64; 4 f | | P0 | biome:dungeon | 3.3 |
| `px_dun_near_banner` | Banner | Parallax Near | 48×96 | | P0 | biome:dungeon | 3.3 |
| `px_dun_near_grate` | Sewer Grate | Parallax Near | 64×64 | | P1 | biome:dungeon | 3.3 |
| `px_dun_near_pillar` | Pillar | Parallax Near | 48×256 | | P0 | biome:dungeon | 3.3 |
| `px_dun_fore_chain` | Foreground Chains | Parallax Fore | 16×128 | | P1 | biome:dungeon | 3.3 |

### 5.4 Lava

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_lava_far` | Lava Far | Parallax Far | tile | Ember sky | P1 | biome:lava | 3.1 |
| `px_lava_far_glow` | Magma Glow Band | Parallax Far | 960×64; 4 f | | P1 | biome:lava | 3.3 |
| `px_lava_near_spire` | Rock Spire | Parallax Near | 64×192 | | P1 | biome:lava | 3.3 |
| `px_lava_near_crack` | Floor Crack Glow | Parallax Near | 64×32; 4 f | | P1 | biome:lava | 3.3 |
| `px_lava_fore_ember` | Fore Ember Particles | Parallax Fore | 16×16 sheet | Or pure VFX | P1 | biome:lava | 3.3 |
| `px_lava_near_skull_rock` | Skull Rock | Parallax Near | 64×64 | | P2 | biome:lava | 3.3 |

### 5.5 Ice

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_ice_far` | Ice Far | Parallax Far | tile | Pale sky/cave | P1 | biome:ice | 3.1 |
| `px_ice_near_icicle` | Icicle | Parallax Near | 32×96 | | P1 | biome:ice | 3.3 |
| `px_ice_near_crystal` | Crystal Cluster | Parallax Near | 64×64 | | P1 | biome:ice | 3.3 |
| `px_ice_near_pillar` | Ice Pillar | Parallax Near | 48×256 | | P1 | biome:ice | 3.3 |
| `px_ice_fore_frost` | Frost Overlay Edge | Parallax Fore | 64×64 | | P1 | biome:ice | 3.3 |
| `px_ice_far_aurora` | Aurora Band | Parallax Far | 960×96; 6 f | Stretch beauty | P2 | biome:ice | 3.3 |

### 5.6 Cavern

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_cav_far` | Cavern Far | Parallax Far | tile | | P1 | biome:cavern | 3.1 |
| `px_cav_near_stalactite` | Stalactite | Parallax Near | 32×96 | | P1 | biome:cavern | 3.3 |
| `px_cav_near_stalagmite` | Stalagmite | Parallax Near | 32×64 | | P1 | biome:cavern | 3.3 |
| `px_cav_near_mushroom` | Mushroom | Parallax Near | 32×32; 2 f glow | | P1 | biome:cavern | 3.3 |
| `px_cav_fore_roots` | Foreground Roots | Parallax Fore | 96×64 | | P1 | biome:cavern | 3.3 |
| `px_cav_near_crystal_geode` | Geode | Parallax Near | 48×48 | | P2 | biome:cavern | 3.3 |

### 5.7 Mist

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_mist_far` | Mist Far | Parallax Far | tile | Low contrast purple | P1 | biome:mist | 3.1 |
| `px_mist_near_wisp` | Wisp | Parallax Near | 32×32; 6 f | | P1 | biome:mist | 3.3 |
| `px_mist_near_arch` | Ruined Arch | Parallax Near | 128×160 | | P1 | biome:mist | 3.3 |
| `px_mist_near_moss` | Hanging Moss | Parallax Near | 48×96; 4 f sway | | P1 | biome:mist | 3.3 |
| `px_mist_fore_fog` | Fore Fog Sheet | Parallax Fore | 256×128; scroll | Alpha strip | P1 | biome:mist | 3.3 |
| `px_mist_near_lantern` | Ghost Lantern | Parallax Near | 32×48; 4 f | | P2 | biome:mist | 3.3 |

### 5.8 Shared level chrome

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `px_shared_far_title` | Title Scroll BG | Parallax Far | 960×540 tile | Constant scroll | P0 | screen:title | 1.2 |
| `px_shared_end_dungeon_mouth` | Dungeon Exit Mouth | End Decor | 256×200 | Characters run out | P0 | screen:end | 1.5 |
| `px_shared_end_ground` | End Ground Strip | End Decor | 960×120 | Circle-up area | P0 | screen:end | 1.5 |
| `px_shared_instr_minimal_ground` | Instructions Ground | Level | 960×64 | Minimal | P0 | screen:instructions | 1.3 |
| `px_shared_instr_sky` | Instructions BG | Level | 960×540 | Flat/minimal | P0 | screen:instructions | 1.3 |
| `px_fork_room` | Fork Chamber BG | Parallax | 960×540 | Two exits visible | P0 | screen:fork | 1.1 |
| `px_fork_exit_frame_a` | Fork Exit Frame A | Fork | 128×192 | Biome-tinted mask | P0 | screen:fork | 1.1 |
| `px_fork_exit_frame_b` | Fork Exit Frame B | Fork | 128×192 | | P0 | screen:fork | 1.1 |
| `px_fork_path_arrow` | Path Select Arrow | Fork UI | 32×32 | | P0 | screen:fork | 2.1 |
| `px_fork_biome_icon_set` | Biome Icons (7) | Fork UI | 48×48 ×7 | Gold…Mist | P0 | screen:fork | 3.1 |

*(Biome icon set counted as 7 assets in matrix; inventory treats pack as one row + note: expand to `px_fork_icon_{biome}` ×7 in production.)*

Expanded biome icons:

| ID | Name | Pri | Tags |
|---|---|---|---|
| `px_fork_icon_gold` | Icon Gold | P0 | fork |
| `px_fork_icon_outside` | Icon Outside | P0 | fork |
| `px_fork_icon_dungeon` | Icon Dungeon | P0 | fork |
| `px_fork_icon_lava` | Icon Lava | P1 | fork |
| `px_fork_icon_ice` | Icon Ice | P1 | fork |
| `px_fork_icon_cavern` | Icon Cavern | P1 | fork |
| `px_fork_icon_mist` | Icon Mist | P1 | fork |

---

## 6. UI screens & panels

### 6.1 Title

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_logo_dungeon` | Logo “DUNGEON” | Logo | ~400×80 | Static or slight shimmer | P0 | screen:title | 1.2 / 5.4 |
| `ui_letter_block_h` | Letter Block H | Title Prop | 64×64 | Carried by hauler | P0 | screen:title | 1.2 |
| `ui_letter_block_a` | Letter Block A | Title Prop | 64×64 | | P0 | screen:title | 1.2 |
| `ui_letter_block_u` | Letter Block U | Title Prop | 64×64 | | P0 | screen:title | 1.2 |
| `ui_letter_block_l` | Letter Block L | Title Prop | 64×64 | | P0 | screen:title | 1.2 |
| `ui_press_start` | Press Any Button | UI Text Art | 320×32 | Blink 2 f | P0 | screen:title | 1.2 |
| `ui_title_online_cta` | Create / Join CTA | UI | 320×48 | Online lobby entry | P0 | screen:title, lobby | arch |

### 6.2 Instructions

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_instr_diagram` | Controls Diagram | UI | 720×320 | Full mockup art | P0 | screen:instructions | 1.3 / 5.4 |
| `ui_instr_dpad` | D-Pad Glyph | UI Icon | 48×48 | Reusable | P0 | ui | 2.1 |
| `ui_instr_btn_a` | Button A Glyph | UI Icon | 32×32 | | P0 | ui | 2.1 |
| `ui_instr_btn_b` | Button B Glyph | UI Icon | 32×32 | | P0 | ui | 2.1 |
| `ui_instr_lets_go` | Let’s Go Banner | UI | 160×48 | Exit right cue | P0 | screen:instructions | 1.3 |

### 6.3 Lobby (online)

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_lobby_panel` | Lobby Panel BG | UI | 480×360 | | P0 | screen:lobby | arch |
| `ui_lobby_seat_empty` | Seat Empty | UI | 160×120 | | P0 | screen:lobby | arch |
| `ui_lobby_seat_filled` | Seat Filled Frame | UI | 160×120 | Per-color variants via tint | P0 | screen:lobby | arch |
| `ui_lobby_ready_check` | Ready Checkmark | UI | 32×32 | | P0 | screen:lobby | arch |
| `ui_lobby_code_frame` | Room Code Frame | UI | 240×64 | | P0 | screen:lobby | arch |
| `ui_lobby_btn_create` | Create Button | UI | 128×48 | 3 states | P0 | screen:lobby | arch |
| `ui_lobby_btn_join` | Join Button | UI | 128×48 | 3 states | P0 | screen:lobby | arch |
| `ui_lobby_btn_start` | Start / Ready Button | UI | 128×48 | | P0 | screen:lobby | arch |
| `ui_lobby_char_select_ring` | Character Select Ring | UI | 72×72 | | P0 | screen:lobby | arch |

### 6.4 Fork

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_fork_meter_a` | Argue Meter A | UI | 24×160 | Fills with presses | P0 | screen:fork | 1.1 |
| `ui_fork_meter_b` | Argue Meter B | UI | 24×160 | | P0 | screen:fork | 1.1 |
| `ui_fork_vs` | VS Badge | UI | 64×64 | | P1 | screen:fork | 1.1 |
| `ui_fork_countdown` | Vote Countdown Pips | UI | 16×16 ×5 | | P1 | screen:fork | 1.1 |
| `ui_fork_speech_bubble` | Argue Bubble | UI | 48×40; 3 f | | P1 | screen:fork | 2.1 |

### 6.5 End scoring

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_end_panel_orange` | Share Panel Orange | UI Panel | 200×400 | Gnome column | P0 | screen:end | 1.5 |
| `ui_end_panel_blue` | Share Panel Blue | UI Panel | 200×400 | Sprite | P0 | screen:end | 1.5 |
| `ui_end_panel_pink` | Share Panel Pink | UI Panel | 200×400 | Halfling | P0 | screen:end | 1.5 |
| `ui_end_panel_red` | Share Panel Red | UI Panel | 200×400 | Dwarf | P0 | screen:end | 1.5 |
| `ui_share_title_gold` | Title Plate Unique Reward | UI | 180×28 | Gold | P0 | screen:end | 1.5 |
| `ui_share_title_white` | Title Plate Common Reward | UI | 180×28 | White | P0 | screen:end | 1.5 |
| `ui_share_title_blue` | Title Plate Common Penalty | UI | 180×28 | Blue | P0 | screen:end | 1.5 |
| `ui_share_title_red` | Title Plate Unique Penalty | UI | 180×28 | Red | P0 | screen:end | 1.5 |
| `ui_end_treasure_pile` | Central Treasure Pile | End Prop | 160×120; 4 f | Grows as tossed | P0 | screen:end | 1.5 |
| `ui_end_starburst` | Pile Starburst | VFX/UI | 128×128; 4 f | Behind pile | P0 | screen:end | 1.5 |
| `ui_end_set_popout` | Set Complete Popout | UI | 200×80 | Name + bonus | P0 | screen:end | 1.5 |
| `ui_end_gp_total_frame` | GP Total Frame | UI | 120×40 | Under each char | P0 | screen:end | 1.5 |
| `ui_end_pct_frame` | Share % Frame | UI | 100×48 | Reveal order 3-2-4-1 | P0 | screen:end | 1.5 |
| `ui_end_take_large` | Final Take Large Text BG | UI | 160×64 | | P0 | screen:end | 1.5 |
| `ui_end_name_entry` | Name Entry Panel | UI | 320×120 | 60s timer | P0 | screen:end | 1.5 |
| `ui_end_name_cursor` | Name Entry Cursor | UI | 16×32; 2 f blink | | P0 | screen:end | 2.1 |
| `ui_end_skip_hint` | Skip Hint | UI | 200×24 | Start skips | P1 | screen:end | 1.5 |

### 6.6 High scores

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_hs_header` | “Greatest Hauls” Header | UI | 400×64 | | P0 | screen:highscores | 1.7 / 5.4 |
| `ui_hs_row_bg` | Score Row BG | UI | 420×56 | Alternating optional | P0 | screen:highscores | 1.7 |
| `ui_hs_row_new` | Score Row “New!” | UI | 420×56 | Highlight + ribbon | P0 | screen:highscores | 1.7 |
| `ui_hs_badge_new` | “New!” Badge | UI | 64×24 | | P0 | screen:highscores | 1.7 |
| `ui_hs_portrait_frame` | Portrait Frame | UI | 72×72 | 4 color variants via tint | P0 | screen:highscores | 1.7 |
| `ui_hs_last_run_strip` | Last Run Footer Strip | UI | 960×80 | 4 mini scores | P0 | screen:highscores | 1.7 |
| `ui_hs_rank_medal_1` | Rank 1 Medal | UI | 32×32 | | P1 | screen:highscores | 1.7 |
| `ui_hs_rank_medal_2` | Rank 2 Medal | UI | 32×32 | | P1 | screen:highscores | 1.7 |
| `ui_hs_rank_medal_3` | Rank 3 Medal | UI | 32×32 | | P1 | screen:highscores | 1.7 |

### 6.7 Credits

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_credits_bg` | Credits BG | UI | 960×540 | | P1 | screen:credits | 1.6 |
| `ui_credits_team_graphic` | Animated Team Graphic | UI | 480×270; sheet | Scripted show-off | P1 | screen:credits | 1.6 |
| `ui_credits_card` | Credit Card Frame | UI | 200×120 | Name/role | P1 | screen:credits | 1.6 |
| `ui_credits_tojam` | “Made at TOJam 8” | UI | 240×40 | | P0 | screen:credits | 1.6 |

### 6.8 Shared chrome

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `ui_fade_black` | Fullscreen Fade | UI | 960×540 | Solid or soft | P0 | all-screens | 1.2 |
| `ui_panel_paper` | Generic Paper Panel | UI | 9-slice 32 | | P0 | ui | — |
| `ui_btn_generic` | Generic Button 3-state | UI | 128×48 | Normal/hover/down | P0 | ui | — |
| `ui_spinner` | Connecting Spinner | UI | 32×32; 8 f | Net lobby | P0 | screen:lobby | arch |
| `ui_error_banner` | Error Banner | UI | 400×40 | Disconnect etc. | P1 | ui | arch |
| `ui_pause_local` | Local Pause Overlay | UI | 960×540 | Stretch | P2 | ui | 2.1 |

---

## 7. VFX

| ID | Name | Category | Dims / grid | Animation notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `vfx_stun_stars` | Stun Stars | VFX | 32×32; 4 f | Over stunned hauler | P0 | combat | 2.1 |
| `vfx_set_complete` | Set Complete Burst | VFX | 96×96; 6 f | End + optional in-level | P0 | screen:end | 1.5 |
| `vfx_gp_float` | +GP Float Numerals | VFX | Font atlas 16×20 | Spawn float-up | P0 | ui, all-levels | 1.5 |
| `vfx_argue_burst` | Argue Impact Burst | VFX | 48×48; 4 f | Fork mash | P1 | screen:fork | 1.1 |
| `vfx_spill` | Treasure Spill Burst | VFX | 64×64; 5 f | On stun drop | P0 | combat | 0.0 / 2.2 |
| `vfx_pickup_flash` | Pickup Flash | VFX | 32×32; 3 f | Common | P0 | | 2.2 |
| `vfx_pickup_unique` | Unique Pickup Flash | VFX | 48×48; 4 f | Rare/unique/set | P0 | | 2.2 / 4.2 |
| `vfx_throw_trail` | Throw Motion Trail | VFX | 16×16 streak | Optional | P1 | | 2.1 |
| `vfx_land_dust` | Land Dust | VFX | 32×16; 3 f | | P1 | | 4.2 |
| `vfx_switch_click` | Switch Press Puff | VFX | 24×24; 3 f | | P1 | | 3.3 |
| `vfx_gate_sparks` | Gate Open Sparks | VFX | 48×48; 4 f | | P1 | | 0.0 |
| `vfx_lightning_impact` | Lightning Hit | VFX | 48×48; 4 f | | P1 | | 3.3 |
| `vfx_gas_stun` | Gas Inhale Swirl | VFX | 48×48; 4 f | | P1 | | 3.3 |
| `vfx_rock_shatter` | Rock Shatter | VFX | 48×48; 5 f | | P1 | | 3.3 |
| `vfx_golem_hit` | Golem Hit Flash | VFX | 64×64; 3 f | | P1 | | 3.3 |
| `vfx_phantom_steal` | Phantom Steal Swipe | VFX | 48×48; 4 f | | P1 | | 3.3 |
| `vfx_weight_sweat` | Heavy Stack Sweat | VFX | 16×16; 3 f | After 3+ items | P2 | | 2.2 |
| `vfx_fanfare_rays` | Count Complete Rays | VFX | 128×128; 6 f | High haul fanfare | P1 | screen:end | 1.5 |
| `vfx_highscore_confetti` | High Score Confetti | VFX | particle sheet | | P2 | screen:end | 1.5 |
| `vfx_spawn_poof` | Drop-in Poof | VFX | 48×48; 4 f | Instructions/level join | P0 | | 1.3 |
| `vfx_exit_speedlines` | Exit Speedlines | VFX | 64×32 | Run off screen | P2 | | 1.2 |
| `vfx_ice_slide` | Ice Slide Skid | VFX | 32×16; 3 f | | P1 | biome:ice | 3.3 |

---

## 8. Fonts / icons / logo / misc

| ID | Name | Category | Dims | Anim notes | Pri | Tags | § |
|---|---|---|---|---|---|---|---|
| `font_display` | Display Font (logo/UI titles) | Font | TTF/OTF | Marcellus SC / Milonga class | P0 | ui | 5.2 |
| `font_body` | Body Font | Font | TTF | Patrick Hand SC class or pixel body | P0 | ui | 5.2 |
| `font_numbers_gp` | GP Number Bitmap | Font Atlas | 16×20 glyphs 0–9, +, % | | P0 | ui | 1.5 |
| `font_name_entry` | Name Entry Glyphs | Font Atlas | 16×24 A–Z 0–9 | End entry | P0 | screen:end | 2.1 |
| `logo_full_lockup` | Full Logo Lockup | Logo | 480×200 | Optional composite | P1 | screen:title | 1.2 |
| `icon_controller_nes` | NES Pad Reference Icon | Icon | 128×64 | Instructions / options | P1 | ui | 2.1 |
| `icon_wifi` | Connection Icon | Icon | 24×24 | Online status | P0 | lobby | arch |
| `icon_disconnect` | Disconnect Icon | Icon | 24×24 | | P0 | ui | arch |
| `icon_volume` | Volume Icon | Icon | 24×24 | Stretch settings | P2 | ui | — |
| `icon_share_mod_star` | Share Modifier Bullet | Icon | 12×12 | Title list bullets | P0 | screen:end | 1.5 |
| `cursor_hand` | Menu Cursor | Icon | 24×24 | | P1 | ui | — |
| `misc_pixel_white` | 1×1 White | Utility | 1×1 | Tints/fades | P0 | eng | — |
| `misc_placeholder_atlas` | Dev Placeholder Atlas | Utility | 512×512 | Colored rects + labels | P0 | eng | arch |
| `misc_nine_slice_gold` | Gold Frame 9-slice | UI | 48×48 | | P1 | ui | — |
| `misc_nine_slice_stone` | Stone Frame 9-slice | UI | 48×48 | | P1 | ui | — |
| `icon_treasure_generic` | Generic Treasure Icon | Icon | 24×24 | Minimap/debug | P2 | | — |
| `icon_skull_danger` | Danger Skull | Icon | 24×24 | Trap legend | P2 | | — |
| `brand_tojam8` | TOJam 8 Badge | Brand | 64×64 | Credits | P0 | screen:credits | 1.6 |
| `misc_safe_area_guide` | Safe Area Overlay | Meta | 960×540 | Art guide only | P0 | meta | arch |
| `misc_color_id_sheet` | Character Color ID Sheet | Meta | 256×64 | Production | P0 | meta | brief |
| `icon_keyboard` | Keyboard Hint Icon | Icon | 32×24 | Alt control scheme | P1 | ui | 2.1 |
| `icon_gamepad` | Gamepad Hint Icon | Icon | 32×24 | | P1 | ui | 2.1 |
| `misc_loading_bar` | Loading Bar | UI | 256×16; fill | Boot | P0 | screen:boot | arch |
| `ui_boot_logo_small` | Boot Splash Mark | Logo | 128×128 | | P1 | screen:boot | arch |

---

## 9. Suggested atlas packing

| Atlas | Size | Contents | Pri |
|---|---|---|---|
| `atlas_chars` | 2048² | All hauler anims | P0 |
| `atlas_treasures` | 1024² | All treasure + chests | P0 |
| `atlas_tiles_mvp` | 1024² | Gold/Outside/Dungeon blocks, switches, gates, spikes, crumble, recede | P0 |
| `atlas_tiles_biome_{name}` | 1024² each | Per extra biome tiles + traps reskins | P1 |
| `atlas_enemies` | 1024² | Golem, phantom, rock, lightning, gas | P1 |
| `atlas_parallax_mvp` | 2048² | Far strips + near props MVP biomes | P0 |
| `atlas_ui` | 2048² | Screens, panels, icons, portraits | P0 |
| `atlas_vfx` | 1024² | All VFX | P0 |

Placeholder approach (architecture): ship `misc_placeholder_atlas` with solid colors keyed to final IDs; presentation binds by key so art swaps without code rewrites (C-02).

---

## 10. Priority cut lines (producer view)

### P0 — MVP playable loop art

- 4 haulers × 10 anim states + portraits + title sticks  
- Common treasures + wooden chest + select rare/unique + Armor + HAUL sets  
- Blocks: Gold, Dungeon, Outside; switches; iron gate; exit  
- Traps: spikes, crumble, recede  
- Parallax: Gold + Dungeon + Outside + title/end/fork/instructions  
- UI: title, instructions, lobby, fork meters, end panels/share plates, high scores core, fade  
- VFX: stun, spill, pickup, set complete, +gp, spawn poof  
- Fonts + logo letters + loading  

### P1 — Full biome & trap fantasy

- Remaining biomes tiles + parallax  
- Lightning, gas, falling rock, golem, phantom  
- Remaining treasures/sets (except Box jam set)  
- Credits polish, medals, argue VFX, dust/trails  

### P2 — Stretch delight

- Box team set, crush/shock traps, pause UI, confetti, sweat VFX, ladders, one-way platforms  

---

## 11. Related

- [AESTHETIC-BRIEF.md](AESTHETIC-BRIEF.md) — pillars & palettes  
- [ASSET-MATRIX.md](ASSET-MATRIX.md) — coverage / gaps  
- Design PDF §2.2 treasures, §3.3 traps/decor, §5.2 graphic template  
