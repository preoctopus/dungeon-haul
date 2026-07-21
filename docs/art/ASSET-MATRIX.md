# Dungeon Haul — Asset Coverage Matrix

> Cross-tab of **screens × biomes × entity families** against inventory priorities.  
> Use this to spot **gaps** before commissioning art.  
> Legend: **●** covered P0 · **◐** partial / P1 · **○** missing / P2-or-none · **—** N/A

Related: [ASSET-INVENTORY.md](ASSET-INVENTORY.md) · [AESTHETIC-BRIEF.md](AESTHETIC-BRIEF.md)

---

## 1. Screen flow coverage

| Screen | BG / room | Characters | UI chrome | VFX | Logo/fonts | Gap notes |
|---|---|---|---|---|---|---|
| **Boot** | — | — | ● loading bar | — | ◐ small boot mark P1 | Optional splash art |
| **Title** | ● scroll far | ● stick walk-in ×4 | ● press start, CTA | ○ speedlines P2 | ● DUNGEON + H/A/U/L | Idle sway uses run/idle |
| **Credits** | ◐ P1 bg | ◐ team graphic P1 | ● TOJam badge | — | ● body font | Team cards P1 |
| **High Scores** | ● via panel | ● portraits | ● rows, New!, footer | ○ confetti P2 | ● numbers | Medals P1 |
| **Lobby** | ● panel | ● portraits + seat frames | ● code, ready, btns | ● spinner | ● | Char ring ● |
| **Instructions** | ● minimal ground/sky | ● full hauler set | ● diagram, glyphs, Let’s Go | ● spawn poof | ● | Fixed cam; no AI art needed |
| **Level 0 Hoard** | ● gold parallax | ● ×4 states | ● +gp floats | ● spill/stun/pickup | — | Treasure dense |
| **Fork** | ● chamber + exit frames | ● + argue P1 | ● meters, biome icons | ◐ argue burst P1 | ● | Icons: 3 P0 / 4 P1 biomes |
| **Level N** | see biome matrix | ● | HUD floats | trap VFX by biome | — | MVP: dungeon+outside |
| **End: Count Haul** | ● exit mouth + ground | ● toss (throw anim) | ● pile, gp frames, set popout | ● set complete, starburst | ● | Order slow→fast |
| **End: Shares** | — | ● stand in panels | ● 4 panels + 4 title plates | — | ● | No delta values shown |
| **End: Spoils** | — | ◐ rummage P1 | ● take large, name entry | ◐ fanfare P1 | ● | Rummage can reuse duck+bob |
| **End: Name Entry** | — | ● portraits | ● panel, cursor | — | ● name glyphs | 60s human only |

### Screen gap summary

| Gap ID | Severity | Description | Mitigation |
|---|---|---|---|
| G-S1 | Low | Credits full animated team graphic | Ship text-only credits + TOJam badge (P0 badge exists) |
| G-S2 | Med | End rummage-specific clip | Reuse duck/idle bob until P1 |
| G-S3 | Low | Title run-off speedlines | Code trail or skip |
| G-S4 | Med | Fork biome icons for Lava/Ice/Cavern/Mist | P1; MVP forks only Gold/Dungeon/Outside |
| G-S5 | Low | High-score confetti | Audio fanfare only |

---

## 2. Biome × midground entities

Rows = biomes. Columns = entity families needed in midground + parallax.

| Biome | Blocks/tiles | Switches | Gates | Spikes | Crumble | Recede | Lightning | Gas | Fall rock | Golem | Phantom | Far BG | Near props | Fore props | Treasure slots |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Gold (Hoard)** | ● | ● | ◐ gold gate P1 | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ● | ● | ◐ | ● (dense) |
| **Outside** | ● | ● | ◐ tint P1 | ● | ● | ● | ○ | ○ | ○ | ○ | ○ | ● | ● | ◐ | ● |
| **Dungeon** | ● | ● | ● iron | ● | ● | ● | ◐ P1 | ◐ P1 | ◐ P1 | ◐ P1 | ◐ P1 | ● | ● | ◐ | ● |
| **Lava** | ◐ P1 | ● shared | ◐ P1 | ◐ reskin P1 | ● shared | ● shared | ◐ | ◐ | ◐ | ◐ | ○ | ◐ | ◐ | ◐ | ● shared sprites |
| **Ice** | ◐ P1 | ● | ◐ | ◐ ice spikes P1 | ● | ● | ◐ | ○ | ◐ | ○ | ○ | ◐ | ◐ | ◐ | ● |
| **Cavern** | ◐ P1 | ● | ◐ | ● | ● | ● | ○ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ◐ | ● |
| **Mist** | ◐ P1 | ● | ◐ | ● | ● | ● | ○ | ◐ mist tint | ○ | ○ | ◐ | ◐ | ◐ | ◐ | ● |

**Shared vs reskin rule**

- Switches, crumble, recede, base spikes: **one art set**, optional biome recolor.
- Lightning / gas / rock / golem / phantom: **global** enemy/trap art (not per-biome full redraw) except listed reskins.
- Treasure sprites: **global** (not biome-specific).

### Biome gap summary

| Gap ID | Severity | Description | When needed |
|---|---|---|---|
| G-B1 | **Blocker for full path** | Lava/Ice/Cavern/Mist full tile+parallax packs | P1 content expansion |
| G-B2 | Med | Biome-tinted gates ×5 | Fork fantasy + gated levels |
| G-B3 | Med | Ice friction readability (sheen) | First ice level |
| G-B4 | Low | Mist contrast risk | Playtest; may need stronger mid outlines |
| G-B5 | Low | Hoard gold gate open/close | Can reuse iron gate tint for MVP |

---

## 3. Entity family × animation / state coverage

### 3.1 Haulers (4 characters)

| State | Gnome | Sprite | Halfling | Dwarf | Notes |
|---|---|---|---|---|---|
| Idle | ● | ● | ● | ● | P0 |
| Run | ● | ● | ● | ● | P0 |
| Jump | ● | ● | ● | ● | P0 |
| Duck | ● | ● | ● | ● | P0 |
| Drop | ● | ● | ● | ● | P0 |
| Throw | ● | ● | ● | ● | P0 |
| Push/Trip | ● | ● | ● | ● | P0 |
| Hurt | ● | ● | ● | ● | P0 |
| Stunned | ● | ● | ● | ● | P0 + stun VFX |
| Falling | ● | ● | ● | ● | P0 |
| Argue (fork) | ◐ shared P1 | ◐ | ◐ | ◐ | Can arm-wave via push frames |
| Rummage (end) | ◐ shared P1 | ◐ | ◐ | ◐ | Duck loop OK |
| Portrait | ● | ● | ● | ● | P0 |
| Title stick | ● | ● | ● | ● | P0 |

**Gap:** No unique “heavy carry” walk cycle (P2 sweat VFX only). Weight = speed code + optional sweat.

### 3.2 Treasures

| Family | # design items | Art rows (approx) | P0 | P1 | P2 | Gap |
|---|---:|---:|---:|---:|---:|---|
| Common | 9 + sacks | 9 | 9 | 0 | 0 | None for MVP |
| Chests | 4 types × open/close | 8 | 2 (wood) | 6 | 0 | Silver/gold/magic P1 |
| Rare | 5 + blank 350 slot | 6 | 3 | 3 | 0 | Name blank 350 item |
| Unique | 10 | 10 | 2 (goat, NES) | 8 | 0 | Rest P1 |
| Set: Armor | 4 | 4 | 4 | 0 | 0 | — |
| Set: HAUL | 4 | 4 | 4 | 0 | 0 | — |
| Set: Celestial | 3 | 3 | 0 | 3 | 0 | P1 |
| Set: Divine | 4 | 4 | 0 | 4 | 0 | P1 |
| Set: Song | 2 | 2 | 0 | 2 | 0 | P1 |
| Set: Box | 5 | 5 | 0 | 0 | 5 | Jam stretch |
| Set: Vegetables | 4 | 4 | 0 | 4 | 0 | P1 |
| Set UI badge | 1 | 1 | 1 | 0 | 0 | — |

**Design gap:** Rare list has an unnamed **350 gp** row — inventory uses `tre_rare_placeholder_350` until design names it.

### 3.3 Traps & enemies

| Entity | Idle | Active / attack | Break / stun | Telegraph | MVP? |
|---|---|---|---|---|---|
| Spikes | ● | ● (static) | — | — | **Yes P0** |
| Crumbling | ● | ● strain | ● break | shake = telegraph | **Yes P0** |
| Receding | ● | ● out | ● in P1 | — | **Yes P0** (out only) |
| Lightning cycle | ◐ emitter P1 | ◐ bolt | — | ◐ P1 | No |
| Lightning activated | ◐ | ◐ | — | switch LED | No |
| Gas | ◐ | ◐ cloud | — | ◐ | No |
| Falling rock | ◐ | ◐ fall | ◐ impact | ceiling shadow P2 | No |
| Golem | ◐ | ◐ walk/atk | ◐ stun | — | No |
| Phantom hand | ◐ | ◐ drop/flee | ◐ hurt | — | No |
| Crushing block | ○ P2 | ○ | — | ○ | No |
| Shock floor | ○ P2 | ○ | — | ○ | No |

---

## 4. UI subsystem matrix

| UI need | Title | Instr | Lobby | Fork | Level HUD | End | High Scores | Credits |
|---|---|---|---|---|---|---|---|---|
| Logo / wordmark | ● | — | ◐ small | — | — | — | — | ● TOJam |
| Character color panels | — | — | ● seats | — | — | ● ×4 | ● frames | — |
| Share title plates G/W/B/R | — | — | — | — | — | ● | — | — |
| Control glyphs | — | ● | — | — | — | — | — | — |
| Biome icons | — | — | — | ●/◐ | — | — | — | — |
| Argue meters | — | — | — | ● | — | — | — | — |
| +GP / numbers | — | — | — | — | ● | ● | ● | — |
| Name entry | — | — | — | — | — | ● | — | — |
| New! badge | — | — | — | — | — | — | ● | — |
| Net status icons | — | — | ● | — | ◐ disconnect | — | — | — |
| Ready / buttons | ● CTA | ● Let’s Go | ● | — | — | ● skip P1 | — | — |

---

## 5. VFX × trigger coverage

| VFX | Pickup | Stun/spill | Trap hit | Fork | End count | End set | Level join | Gap |
|---|---|---|---|---|---|---|---|---|
| Stun stars | — | ● | ● | — | — | — | — | — |
| Spill burst | — | ● | ● | — | — | — | — | — |
| Pickup flash | ● | — | — | — | — | — | — | — |
| Unique flash | ● | — | — | — | — | — | — | — |
| +GP float | ◐ optional | — | — | — | ● | — | — | Level pickup can show name only |
| Set complete | — | — | — | — | — | ● | — | — |
| Argue burst | — | — | — | ◐ P1 | — | — | — | Meter fill enough for MVP |
| Spawn poof | — | — | — | — | — | — | ● | — |
| Trap-specific | — | — | ◐ P1 each | — | — | — | — | Lightning/gas/rock P1 |
| Fanfare rays | — | — | — | — | ◐ P1 | — | — | Audio-first |

---

## 6. MVP slice (explicit)

**Content target:** Instructions → Hoard → Fork → Level A (Dungeon) → Fork → Level B (Outside) → End → High Scores.

| Required art family | Status | Inventory IDs (examples) |
|---|---|---|
| 4 haulers × 10 states | ● P0 | `char_*_{state}` |
| Portraits + title sticks | ● P0 | `char_*_portrait`, `char_title_stick_*` |
| Common treasures + wood chest | ● P0 | `tre_*`, `tre_wooden_chest_*` |
| Armor + HAUL sets | ● P0 | `tre_set_armor_*`, `tre_set_haul_*` |
| Goat + NES unique | ● P0 | `tre_goat_icon`, `tre_nes_cartridge` |
| Gold/Dungeon/Outside tiles | ● P0 | `blk_brick_*`, `blk_outside_*` |
| Switch + heavy switch | ● P0 | `sw_*` |
| Iron gate | ● P0 | `gate_iron_*` |
| Spikes / crumble / recede | ● P0 | `trap_*` |
| Parallax gold/dungeon/outside | ● P0 | `px_gold_*`, `px_dun_*`, `px_out_*` |
| Title / instr / lobby / fork / end / HS UI | ● P0 | `ui_*` |
| Core VFX | ● P0 | `vfx_stun_*`, `vfx_spill`, pickups, set, poof |
| Fonts + logo letters | ● P0 | `font_*`, `ui_logo_*`, `ui_letter_block_*` |
| Golem / phantom / lightning / gas / rock | ○ P1 | Not required for MVP path |
| Lava/Ice/Cavern/Mist packs | ○ P1 | Not required for MVP path |
| Box set / crush trap | ○ P2 | Stretch |

---

## 7. Gap register (master)

| ID | Area | Severity | Description | Priority to close |
|---|---|---|---|---|
| G-01 | Design | Low | Unnamed Rare 350 gp treasure | Name + art P1 |
| G-02 | Characters | Low | No argue/rummage dedicated clips | P1 or reuse |
| G-03 | Biomes | High (post-MVP) | 4 biomes tile+parallax packs | P1 |
| G-04 | Traps | Med | Advanced traps + enemies | P1 |
| G-05 | Treasures | Med | Most uniques + non-MVP sets | P1 |
| G-06 | Chests | Med | Silver/Gold/Magic open-close | P1 |
| G-07 | Gates | Low | Biome gate tints | P1 |
| G-08 | Fork | Med | 4 biome icons beyond MVP trio | P1 |
| G-09 | Credits | Low | Animated team graphic | P1 |
| G-10 | VFX | Low | Trap-specific + fanfare polish | P1 |
| G-11 | Stretch | None for MVP | Box set, crush, shock, pause, confetti | P2 |
| G-12 | Eng | — | Placeholder atlas must map 1:1 to final keys | P0 eng task |

---

## 8. Commission order (recommended)

1. **Placeholder atlas** keys for all P0 IDs (engineering unblock)  
2. **Hauler prototype** one character all 10 states → clone palette  
3. **Block kit** dungeon + switches + spikes/crumble/recede  
4. **Treasure commons** + stack/no-stack rules visual QA  
5. **Title + instructions UI** (vertical slice feel)  
6. **Hoard parallax + gold tiles**  
7. **End panels + share plates + pile** (scoring readable)  
8. **Lobby + high scores**  
9. **Outside pack** (second MVP level)  
10. **P1 biomes / traps / remaining loot**  

---

## 9. Count cross-check

| Source | Count |
|---|---:|
| Inventory grand total (logical assets) | **348** |
| Of which P0 | **189** |
| Of which P1 | **132** |
| Of which P2 | **27** |
| MVP entity families fully ● in matrices above | Core loop closed |
| Open high-severity post-MVP gaps | G-03 biomes, G-04 traps |

If production splits multi-frame clips into separate files, physical file count will exceed 348; **inventory rows remain the commissioning unit**.
