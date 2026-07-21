# Dungeon Haul — Asset Production & Implementation Status

> **Current Status:** All P0 MVP assets and all 4 P1 Expansion Biomes & Enemies have been generated, processed into transparent PNGs, packed into WebP Phaser 3 Texture Atlases with JSON Hash manifests, and saved in dual-tier storage (`art_raw/` and `client/public/assets/`).

---

## 1. Summary of Completed Production Assets

| Asset Atlas / Bundle | Contents | Formats | Public Path | Raw Path | Status |
|---|---|---|---|---|---|
| **`atlas_treasures`** | 25 P0 Treasures & Chests (Coins, Watches, Gemstones, Crowns, Chests, Goat Icon, NES Cartridge, Armor Set, etc.) | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/treasures/` | **COMPLETE** |
| **`atlas_tiles_mvp`** | Dungeon Brick, Grass/Dirt, Hoard Stone, Red Switches, Heavy Switch, Iron Gates, Spikes, Crumble, Recede | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/tiles/` | **COMPLETE** |
| **`atlas_tiles_lava`** | Lava Basalt, Glow Edge, Magma Far BG, Lava Spire, Lava Crack, Lava Spikes, Gold Gate | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/tiles_lava/` | **COMPLETE** |
| **`atlas_tiles_ice`** | Ice Crack, Pale Sky Far BG, Icicles, Crystal Cluster, Ice Pillar, Frost Overlay, Ice Spikes | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/tiles_ice/` | **COMPLETE** |
| **`atlas_tiles_cavern`** | Cavern Rock, Sand, Mossy Rock, Stalactites, Stalagmites, Glowing Mushrooms, Cavern Roots, Far BG | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/tiles_cavern/` | **COMPLETE** |
| **`atlas_tiles_mist`** | Mist Stone, Rune Stone, Spirit Wisp, Ruined Arch, Mist Moss, Translucent Fog Sheet, Gas Trap | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/tiles_mist/` | **COMPLETE** |
| **`atlas_enemies`** | Golem (Idle/Walk/Attack), Phantom Hand (Idle/Drop/Flee), Lightning Bolt, Gas Cloud, Falling Rock | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/enemies_traps/` | **COMPLETE** |
| **`char_gnome`** | Gnome Hauler (Idle, Run, Jump, Duck, Hurt, Stunned - 48x48) | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/characters/` | **COMPLETE** |
| **`char_sprite`** | Sprite Hauler (Idle, Run, Jump, Duck, Hurt, Stunned - 48x48) | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/characters/` | **COMPLETE** |
| **`char_halfling`** | Halfling Hauler (Idle, Run, Jump, Duck, Hurt, Stunned - 48x48) | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/characters/` | **COMPLETE** |
| **`char_dwarf`** | Dwarf Hauler (Idle, Run, Jump, Duck, Hurt, Stunned - 48x48) | `.webp` + `.json` | `client/public/assets/atlases/` | `art_raw/characters/` | **COMPLETE** |
| **`images/` (Screens)** | 960x540 WebP Backdrops (`bg_title`, `bg_hoard`, `bg_dungeon`, `bg_fork`, `ui_end_scoring`, `ui_instructions_hs`) | `.webp` | `client/public/assets/images/` | `art_raw/ui/` | **COMPLETE** |
| **`manifest.json`** | Preload index for all texture atlases & screen images | `.json` | `client/public/assets/manifest.json` | — | **COMPLETE** |

---

## 2. What Remains To Do (Post-MVP / Polish)

The core MVP gameplay loop, all 4 hauler characters, and all 5 biomes (Gold, Dungeon, Lava, Ice, Cavern, Mist) are fully covered. The remaining items are secondary polish / stretch elements:

### Secondary Loot Sets (P1 / P2)
- Celestial Set (Sun, Moon, Star sculptures)
- Divine Set (Spade, Club, Heart, Diamond suit blocks)
- Song Set (Flame guitar, Ice bass)
- Vegetable Set (Turnip, Green pepper, Pumpkin, Onion)
- Box Team Set (Jam stretch set: Andrew, Greg, Lindsey, Megan, Darius)

### Specialized UI & Icon Polish (P1 / P2)
- Individual gamepad & keyboard control glyphs (`icon_controller_nes`, `icon_keyboard`, `icon_gamepad`)
- High Score Rank Medals (Gold, Silver, Bronze rank 1-3 medals)
- Individual animated title block walk-in sticks (`char_title_stick_*`)

### VFX Animations (P1 / P2)
- Stun stars particle loop overlay (`vfx_stun_stars`)
- Spill burst effect (`vfx_spill`)
- Pickup flash (`vfx_pickup_flash`)
- Confetti particle sheet (`vfx_highscore_confetti`)

---

## 3. How Future Agents Can Update or Re-slice Assets

All python slicer scripts are saved in `scripts/`:
- `python3 scripts/slice_treasures.py`
- `python3 scripts/slice_tiles.py`
- `python3 scripts/slice_characters.py`
- `python3 scripts/process_screens.py`
- `python3 scripts/generate_mist_pack.py`
- `python3 scripts/process_cavern_tiles.py`

Full Phaser 3 code examples and frame key references live in [docs/art/PIPELINE-AND-PHASER-GUIDE.md](PIPELINE-AND-PHASER-GUIDE.md).
