# Dungeon Haul — Asset Pipeline & Phaser 3 Developer Guide

> **For AI Agents & Developers:** This document details how assets are structured, processed, served online, and loaded into Phaser 3 for presentation (C-02) and scene building (C-01).

---

## 1. Asset Storage & Pipeline Architecture

All assets are managed in a **two-tier architecture**:

```text
dhaul4/
├── art_raw/                        # Tier 1: High-Res Master Originals (NOT served to client)
│   ├── characters/                 # 1024x1024 master sheets & individual high-res PNG frame crops
│   ├── treasures/                  # 1024x1024 master sheet & 25 individual high-res PNG crops
│   ├── tiles/                      # 1024x1024 master sheet & high-res block PNG crops
│   └── ui/                         # 960x540 screen PNG masters
│
├── client/public/assets/           # Tier 2: Production Web-Served Assets (Optimized)
│   ├── manifest.json               # Master asset preload index for Phaser
│   ├── atlases/                    # WebP texture sheets + Phaser 3 JSON Hash descriptors
│   │   ├── atlas_treasures.webp / .json
│   │   ├── atlas_tiles_mvp.webp / .json
│   │   ├── char_gnome.webp / .json
│   │   ├── char_sprite.webp / .json
│   │   ├── char_halfling.webp / .json
│   │   └── char_dwarf.webp / .json
│   └── images/                     # 960x540 WebP screen backgrounds
│       ├── bg_title.webp
│       ├── bg_hoard.webp
│       ├── bg_dungeon.webp
│       ├── bg_fork.webp
│       ├── ui_end_scoring.webp
│       └── ui_instructions_hs.webp
```

---

## 2. Loading Assets in Phaser 3

### Option A: Loading via `manifest.json` (Recommended)

```typescript
// In your PreloaderScene.ts
preload() {
  this.load.json('asset_manifest', 'assets/manifest.json');
}

create() {
  const manifest = this.cache.json.get('asset_manifest');
  
  // Preload atlases
  manifest.atlases.forEach((atlasInfo: { key: string; texture: string; atlas: string }) => {
    this.load.atlas(atlasInfo.key, atlasInfo.texture, atlasInfo.atlas);
  });

  // Preload background images
  manifest.images.forEach((imgInfo: { key: string; path: string }) => {
    this.load.image(imgInfo.key, imgInfo.path);
  });

  this.load.start();
}
```

### Option B: Direct Preloading

```typescript
// In your BootScene or PreloaderScene
preload() {
  // Atlases (WebP + JSON Hash)
  this.load.atlas('atlas_treasures', 'assets/atlases/atlas_treasures.webp', 'assets/atlases/atlas_treasures.json');
  this.load.atlas('atlas_tiles_mvp', 'assets/atlases/atlas_tiles_mvp.webp', 'assets/atlases/atlas_tiles_mvp.json');
  this.load.atlas('char_gnome', 'assets/atlases/char_gnome.webp', 'assets/atlases/char_gnome.json');
  this.load.atlas('char_sprite', 'assets/atlases/char_sprite.webp', 'assets/atlases/char_sprite.json');
  this.load.atlas('char_halfling', 'assets/atlases/char_halfling.webp', 'assets/atlases/char_halfling.json');
  this.load.atlas('char_dwarf', 'assets/atlases/char_dwarf.webp', 'assets/atlases/char_dwarf.json');

  // Background Screens
  this.load.image('bg_title', 'assets/images/bg_title.webp');
  this.load.image('bg_hoard', 'assets/images/bg_hoard.webp');
  this.load.image('bg_dungeon', 'assets/images/bg_dungeon.webp');
  this.load.image('bg_fork', 'assets/images/bg_fork.webp');
}
```

---

## 3. Frame Keys Reference

### 3.1 Characters (`char_gnome`, `char_sprite`, `char_halfling`, `char_dwarf`)

Each character atlas provides 48×48 px cells with the following animation frame keys (replace `{char}` with `gnome`, `sprite`, `halfling`, or `dwarf`):

| Animation | Frame Keys | Frame Rate | Loop |
|---|---|---|---|
| **Idle** | `char_{char}_idle_0` .. `char_{char}_idle_3` | 6–8 fps | `repeat: -1` |
| **Run** | `char_{char}_run_0` .. `char_{char}_run_5` | 10–12 fps | `repeat: -1` |
| **Jump** | `char_{char}_jump_0` .. `char_{char}_jump_2` | 8 fps | `repeat: 0` |
| **Duck** | `char_{char}_duck_0` .. `char_{char}_duck_1` | 6 fps | holdable |
| **Hurt** | `char_{char}_hurt_0` .. `char_{char}_hurt_2` | 10 fps | `repeat: 0` |
| **Stunned** | `char_{char}_stunned_0` .. `char_{char}_stunned_3` | 8 fps | `repeat: -1` |

#### Phaser Character Animation Setup Example:

```typescript
function createCharacterAnimations(scene: Phaser.Scene, charName: string) {
  const key = `char_${charName}`;

  scene.anims.create({
    key: `${charName}-idle`,
    frames: scene.anims.generateFrameNames(key, {
      prefix: `char_${charName}_idle_`,
      start: 0,
      end: 3
    }),
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: `${charName}-run`,
    frames: scene.anims.generateFrameNames(key, {
      prefix: `char_${charName}_run_`,
      start: 0,
      end: 5
    }),
    frameRate: 12,
    repeat: -1
  });
}
```

---

### 3.2 Treasures (`atlas_treasures`)

Sprites are 32×32 px cells inside `atlas_treasures`:

```typescript
// Creating a treasure sprite in Phaser
const coinSack = scene.add.sprite(x, y, 'atlas_treasures', 'tre_coin_sack');
const chest = scene.add.sprite(x, y, 'atlas_treasures', 'tre_wooden_chest_closed');
```

**Frame Keys in `atlas_treasures`:**
- `tre_coin_sack` (20 gp)
- `tre_big_coin_sack` (100 gp)
- `tre_brass_watch` (20 gp)
- `tre_gold_watch` (75 gp)
- `tre_stone_icon` (5 gp)
- `tre_bronze_icon` (50 gp)
- `tre_gemstone_ruby` (500 gp)
- `tre_gemstone_emerald` (500 gp)
- `tre_crown` (750 gp)
- `tre_wooden_chest_closed`
- `tre_wooden_chest_open`
- `tre_silver_chest_closed`
- `tre_gold_chest_closed`
- `tre_goat_icon` (800 gp Unique)
- `tre_nes_cartridge` (1000 gp Unique)
- `tre_crystal_skull` (1500 gp Unique)
- `tre_magic_scepter` (1000 gp Unique)
- `tre_set_armor_helmet` (Armor set item)
- `tre_set_armor_breastplate` (Armor set item)
- `tre_set_armor_gauntlets` (Armor set item)
- `tre_set_armor_greaves` (Armor set item)

---

### 3.3 Tiles & Traps (`atlas_tiles_mvp`)

**Frame Keys in `atlas_tiles_mvp`:**
- **Blocks (32×32):** `blk_brick_dungeon`, `blk_brick_outside`, `blk_brick_gold`, `blk_ice`
- **Switches (32×32 / 40×32):** `sw_switch_up`, `sw_switch_down`, `sw_heavy_up`, `sw_heavy_down`
- **Gates & Doors (32×64):** `gate_iron_closed`, `gate_iron_open`, `door_closed`, `blk_exit_banner`
- **Traps (32×32):** `trap_spikes_idle`, `trap_spikes_retracted`, `trap_crumble_idle`, `trap_crumble_break`, `trap_recede_idle`, `trap_recede_out`, `trap_lightning_emitter`

---

## 4. Re-Processing & Asset Generation

If master art assets in `art_raw/` are updated or new assets are added, re-run the python pipeline scripts:

```bash
# Re-process treasures
python3 scripts/slice_treasures.py

# Re-process environment tiles & traps
python3 scripts/slice_tiles.py

# Re-process character sheets
python3 scripts/slice_characters.py

# Re-process 960x540 screen backgrounds
python3 scripts/process_screens.py
```

The scripts will automatically maintain the high-quality masters in `art_raw/` while updating the compressed WebP sheets and `.json` manifests in `client/public/assets/`.
