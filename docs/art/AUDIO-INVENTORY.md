# Dungeon Haul — Audio Asset Inventory & Production Status

> **Target Directory:** `client/public/assets/audio/` (`music/`, `sfx/char/`, `sfx/object/`, `sfx/trap/`, `sfx/ui/`, `sfx/end/`)  
> **Master Reference:** [docs/components/audio-director/DESIGN.md](../components/audio-director/DESIGN.md)

---

## 0. Summary Counts & Status

| Category | P0 MVP | P1 Expansion | P2 Stretch | Total Stems/SFX | Production Status |
|---|---:|---:|---:|---:|---|
| **Music Stems** | 4 | 4 | 1 | **9** | ⏳ Pending Generation |
| **Character SFX** | 10 | 12 | 4 | **26** | ⏳ Pending Generation |
| **Object & Treasure SFX** | 6 | 4 | 2 | **12** | ⏳ Pending Generation |
| **Traps & Enemies SFX** | 4 | 10 | 4 | **18** | ⏳ Pending Generation |
| **UI & Navigation SFX** | 6 | 5 | 2 | **13** | ⏳ Pending Generation |
| **End Screen & Scoring SFX** | 7 | 8 | 2 | **17** | ⏳ Pending Generation |
| **Grand Total** | **37** | **43** | **15** | **95 Audio Assets** | ⏳ Phase 1 Ready |

---

## 1. Priority 0 (P0) — MVP Core Sound Suite (First Generation Batch)

These 37 audio assets form the essential playable audio loop: menu feedback, character movement, treasure pickups, spike traps, scoring ticks, and core music.

### 1.1 Core Music Stems (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `music_title` | `assets/audio/music/music_title.ogg` | Energetic NES-style 8-bit heist theme (loop, 120 bpm) | ⏳ Pending |
| `music_hoard` | `assets/audio/music/music_hoard.ogg` | Tense, fast-paced gold vault looting theme (loop, 140 bpm) | ⏳ Pending |
| `music_dungeon` | `assets/audio/music/music_dungeon.ogg` | Action-packed sidescroller dungeon heist track (loop, 132 bpm) | ⏳ Pending |
| `music_end_scoring` | `assets/audio/music/music_end_scoring.ogg` | Upbeat victory & haul tally scoring theme (loop, 115 bpm) | ⏳ Pending |

### 1.2 Character Actions & Movement (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `char.jump` | `assets/audio/sfx/char/char_jump.ogg` | Crisp 8-bit square wave pitch jump blip | ⏳ Pending |
| `char.land` | `assets/audio/sfx/char/char_land.ogg` | Soft low thump landing sound | ⏳ Pending |
| `char.hurt` | `assets/audio/sfx/char/char_hurt.ogg` | Cartoon slapstick damage / bump sound | ⏳ Pending |
| `char.stunned` | `assets/audio/sfx/char/char_stunned.ogg` | Swirling dazed stun chime / dizzy stars loop | ⏳ Pending |
| `char.throw` | `assets/audio/sfx/char/char_throw.ogg` | Swift air whoosh throw effect | ⏳ Pending |
| `char.drop` | `assets/audio/sfx/char/char_drop.ogg` | Quick clatter drop sound | ⏳ Pending |

### 1.3 Loot & Object Interactions (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `char.pickup_treasure` | `assets/audio/sfx/object/pickup_treasure.ogg` | Bright 8-bit coin/item grab chime | ⏳ Pending |
| `char.pickup_coin_bag` | `assets/audio/sfx/object/pickup_coin_bag.ogg` | Jingly burlap coin sack pickup sound | ⏳ Pending |
| `char.pickup_unique_or_set` | `assets/audio/sfx/object/pickup_unique.ogg` | Radiant high-value artifact sparkle chime | ⏳ Pending |
| `object.impact` | `assets/audio/sfx/object/object_impact.ogg` | Heavy treasure item clatter impact | ⏳ Pending |
| `object.switch_regular_down` | `assets/audio/sfx/object/switch_down.ogg` | Mechanical floor switch click down | ⏳ Pending |
| `object.switch_regular_up` | `assets/audio/sfx/object/switch_up.ogg` | Mechanical switch spring release up | ⏳ Pending |

### 1.4 Traps & Hazards (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `trap.spikes` | `assets/audio/sfx/trap/trap_spikes.ogg` | Sharp metallic spike snap/extend | ⏳ Pending |
| `trap.crumbling_strain` | `assets/audio/sfx/trap/trap_crumble_strain.ogg` | Stone cracking strain creak | ⏳ Pending |
| `trap.crumbling_break` | `assets/audio/sfx/trap/trap_crumble_break.ogg` | Heavy stone block collapse/shatter | ⏳ Pending |
| `trap.receding_in` | `assets/audio/sfx/trap/trap_recede_in.ogg` | Mechanical stone slide retraction sound | ⏳ Pending |

### 1.5 UI & Menu Controls (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `ui.start_game` | `assets/audio/sfx/ui/ui_start_game.ogg` | NES title screen start press chime | ⏳ Pending |
| `ui.skip_to_title` | `assets/audio/sfx/ui/ui_skip.ogg` | Quick back/cancel blip | ⏳ Pending |
| `ui.ready_toggle` | `assets/audio/sfx/ui/ui_ready.ogg` | Satisfying lobby ready toggle tone | ⏳ Pending |
| `ui.error` | `assets/audio/sfx/ui/ui_error.ogg` | Low double buzz error sound | ⏳ Pending |
| `ui.dpad_move` | `assets/audio/sfx/ui/ui_dpad.ogg` | Subtle cursor move tick | ⏳ Pending |
| `ui.button_click` | `assets/audio/sfx/ui/ui_click.ogg` | Clean button press blip | ⏳ Pending |

### 1.6 End Screen & Tally Scoring (P0)

| Event Key | File Path | Audio Description | Status |
|---|---|---|---|
| `end.count_treasure` | `assets/audio/sfx/end/count_treasure.ogg` | Fast rhythmic coin toss tick | ⏳ Pending |
| `end.count_unique_treasure` | `assets/audio/sfx/end/count_unique.ogg` | Sparkling unique item tally ding | ⏳ Pending |
| `end.set_complete` | `assets/audio/sfx/end/set_complete.ogg` | Triumph set completion starburst fanfare | ⏳ Pending |
| `end.count_complete_fanfare` | `assets/audio/sfx/end/count_fanfare.ogg` | Total haul calculation grand victory stinger | ⏳ Pending |
| `end.highscore_awarded` | `assets/audio/sfx/end/highscore_new.ogg` | High-score new record fanfare | ⏳ Pending |
| `end.highscore_change_char` | `assets/audio/sfx/end/hs_char_change.ogg` | Name entry letter scroll blip | ⏳ Pending |
| `end.highscore_enter_char` | `assets/audio/sfx/end/hs_char_enter.ogg` | Name entry letter lock chime | ⏳ Pending |

---

## 2. Priority 1 (P1) — Expansion Biomes & Hazards

- **Music Stems:** `music_lava.ogg`, `music_ice.ogg`, `music_cavern.ogg`, `music_mist.ogg`.
- **Character SFX:** `char_gnome_argue.ogg`, `char_sprite_argue.ogg`, `char_halfling_argue.ogg`, `char_dwarf_argue.ogg`, `char_push.ogg`, `char_trip.ogg`.
- **Traps & Enemies:** `trap_lightning.ogg`, `trap_gas.ogg`, `golem_stomp.ogg`, `golem_attack.ogg`, `golem_stunned.ogg`, `phantom_drop.ogg`, `phantom_escape.ogg`.
- **Placement Stingers:** `end_place_1.ogg`, `end_place_2.ogg`, `end_place_3.ogg`, `end_place_4.ogg`, `end_rummage.ogg`.

---

## 3. Priority 2 (P2) — Optional Audio Stretch

- Spatial 3D panning scripts
- Character-specific voice quips & vocal chatter
- Heavy stack sweat drop SFX
