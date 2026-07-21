# Dungeon Haul — Aesthetic Brief

> **Status:** Documentation only (no binary art).  
> **Sources:** TOJam 8 design document (§1–§5 mockups), [ARCHITECTURE.md](../ARCHITECTURE.md) (960×540 logical, Phaser, placeholder atlas), [COMPONENTS.md](../COMPONENTS.md) (C-02 presentation).  
> **Scope:** Side-view 2D only. No isometric. No 3D.

---

## 1. Elevator pitch (visual)

Four cartoon haulers (Gnome, Sprite, Halfling, Dwarf) race a loot-stuffed sidescroller dungeon. Read like a playful NES-era heist: **control clarity first**, gold lust second, slapstick third. Think stick-figure energy with enough silhouette and color coding that four players never lose their character at a glance.

---

## 2. Visual pillars

| # | Pillar | Implication for art |
|---|---|---|
| **V1** | **NES control clarity** | Huge readable hitboxes of intent: haulers, treasure tops, spikes, switches. Prefer chunky outlines over fine hatching. UI glyphs match NES pad mental model (D-pad, A, B). |
| **V2** | **Playful dungeon heist** | Cartoonish, not grimdark. Traps threaten comedy (spill treasure Sonic-style), not gore. Gold gleams; characters bounce. |
| **V3** | **Stick → hauler silhouette** | Title mockup: simple haulers carrying letter blocks. Full game characters keep that readable body language (big head/body contrast, clear carry stack above head). |
| **V4** | **Biome as mood, not noise** | Each biome has a short palette and 3–5 signature decor props. Gameplay midground stays legible; parallax carries flavor. |
| **V5** | **Four-player color coding** | Each hauler owns a primary hue used on body, HUD, share panels, high-score portraits. Never rely on hue alone for critical traps (also use shape). |
| **V6** | **Letterboxed fixed canvas** | All composition designed for **960×540** logical pixels, integer scale (1×/2×/3×). No UI elements that break outside safe margins. |

---

## 3. Style constraints

### 3.1 Line, form, shading

| Rule | Spec |
|---|---|
| Projection | Strict **side-view orthographic** 2D. No 3/4 view, no isometric floor tiles. |
| Outline | 1–2 px dark outline on characters/treasure/traps at 1× logical. Optional thicker outline for UI icons. |
| Shading | Flat fill + 1–2 shade steps max (cel). Specular only on gold/gems/ice. No soft airbrush gradients on sprites. |
| Proportions | Haulers ~**48×48** gameplay frame (see inventory); slightly exaggerated heads; arms free to hold/throw. |
| Animation | Snappy 8–12 fps for run; hold-friendly idle; “compelled” states (Hurt/Stunned/Falling) override clearly. |
| Textures | Tileable blocks 32×32; seams intentional only for crumbling/receding feedback. |
| Anti-alias | Prefer **nearest-neighbor** friendly art (pixel-aligned). Soft AA allowed on UI panels/logo only. |

### 3.2 Forbidden / avoid

- Photoreal materials, PBR, film grain
- Blood, gore, sexualized design
- Tiny unreadable jewelry as primary treasure silhouettes
- Pure black full-screen UI (use deep navy/charcoal with gold accents)
- Biome-tinted character body colors that break seat identity

### 3.3 References (mood, not copy)

- Title: stick haulers + block letters (design §1.2 / §5.4 mockups)
- Controls diagram: NES pad clarity (§2.1)
- End: four colored vertical panels + treasure pile starburst (§1.5)
- High scores: portrait tiles + “New!” ribbon (§1.7)
- Parallax stack: Far / Near / Mid / Fore / Interface (§3.3)

---

## 4. Character identity

| Character | Primary hue | Secondary | Silhouette notes | Seat color token |
|---|---|---|---|---|
| **Gnome** | Amber / orange `#F0A040` | Brown hat/boots | Short, pointed hat, stocky | Orange panel |
| **Sprite** | Sky blue `#50A0E8` | White/silver wing accents | Slightly taller/lighter; optional wing nubs (still 2D side) | Blue panel |
| **Halfling** | Magenta / pink `#E070B0` | Warm tan skin | Rounder, curly hair cue | Pink panel |
| **Dwarf** | Crimson / red `#E05040` | Dark beard, metal buckle | Broadest torso, shortest legs | Red panel |

**Consistency rules**

1. Same rig / frame grid / pivot for all four haulers (swap palette + costume parts).
2. Carry stack mounts at a shared **carry anchor** above head; coin sacks do **not** raise stack height (design §2.2).
3. Facing: art drawn facing right; flip for left.
4. AI-controlled seats may show a small “AI” badge (optional P1) but body art is identical.

---

## 5. Palette system

### 5.1 Global / UI

| Role | Hex (approx) | Use |
|---|---|---|
| Canvas letterbox | `#0B0B12` | Outside 960×540 |
| UI ink | `#1A1A22` | Text body |
| UI paper | `#F4EFE4` | Panels, instructions bg |
| Gold accent | `#E8C040` | Logo, unique rewards, +gp |
| Unique reward (Gold) | `#D4A017` | Share title panels |
| Common reward (White) | `#F5F5F5` | Share titles |
| Common penalty (Blue) | `#3A6BC4` | Share titles |
| Unique penalty (Red) | `#C03030` | Share titles |
| “New!” ribbon | `#FFE28A` | High score highlight |
| Safe highlight | `#40E0A0` | Ready, positive pulse |
| Danger | `#FF5040` | Spikes, gas warn (with shape) |

### 5.2 Biome palettes

Each biome: **BG far**, **BG mid**, **block body**, **block edge**, **accent prop**, **hazard**.

| Biome | Far BG | Near/Mid mood | Blocks | Accent | Hazard |
|---|---|---|---|---|---|
| **Gold (Hoard)** | Deep vault purple `#2A1840` | Warm gold haze `#5A4020` | Aged stone + gold trim | Coin piles, candelabra | Low; sparkle only |
| **Outside** | Sky blue `#78B4E8` | Grass green `#4A9A40` | Dirt / stone path | Trees, clouds, fence | Pits (visual cliff) |
| **Dungeon** | Charcoal `#1E2430` | Cool grey stone | Brick grey `#6A6E78` | Torches, banners, grates | Spikes, iron gates |
| **Lava** | Ember black `#1A0A08` | Magma orange `#C04010` | Basalt / scorched brick | Lava glow, cracks | Lava pits, heat shimmer (VFX) |
| **Ice** | Pale cyan `#C8E8F8` | Frozen blue `#70B0D0` | Ice tile cyan/white | Icicles, frost | Slippery sheen on ice blocks |
| **Cavern** | Brown-black `#1C1410` | Earth brown `#6A4A30` | Rough rock | Stalactites, mushrooms | Rockfall shadows |
| **Mist** | Desat purple `#3A3050` | Fog lavender `#8A78A8` | Soft stone, vines | Wisps, hanging moss | Reduced contrast (keep colliders clear) |

**Rule:** Midground blocks must retain ≥ **4:1** contrast vs character primary hues for that biome’s typical BG.

### 5.3 Treasure rarity readout

| Rarity | Visual cue |
|---|---|
| Common | Matte metals, small sparkle 0–1 |
| Rare | Stronger metal/gem cut, continuous soft glint |
| Unique | Distinct silhouette + gold outline pulse on idle |
| Set piece | Shared set badge color rim; complete-set VFX on end count |
| Chest | Closed box form; open reveals flash then swaps to treasure sprite |

---

## 6. Typography & logo

| Use | Recommendation | Notes |
|---|---|---|
| Logo wordmark “DUNGEON” | Bold display (e.g. **Marcellus SC** or similar SC) | Design §5.2 Megan list |
| Logo “HAUL” letters | Physical **block letters** carried on title (H/A/U/L props) | Matches mockup §1.2 |
| UI body | Clean pixel or rounded sans readable at 16–20 px | Prefer open counters |
| Numbers (+gp, %) | Tabular / monospaced digits | End count + high scores |
| Share titles | Same body, color-coded by panel type | No share **values** on titles (design) |

**Logo lockup:** “DUNGEON” above; four haulers with H-A-U-L blocks; tagline “Press Any Button” / online “Create or Join”.

---

## 7. Screen composition notes

| Screen | Camera | Visual priorities |
|---|---|---|
| **Title** | Fixed; scrolling far BG | Logo, walk-in haulers, idle sway, run-off on start |
| **Credits** | Fixed | Team cards / animated team graphic; TOJam 8 credit |
| **High Scores** | Fixed; list scrolls | Portrait tiles, GP, %, “New!” strip, last-run footer |
| **Lobby** *(online)* | Fixed | Room code, 4 seat slots, character claim portraits, ready |
| **Instructions** | **Fixed**, no zoom | Large control diagram; minimal ground; drop-in top-left |
| **Hoard / Level** | Multi-target follow | Parallax stack; carry stacks; traps readable |
| **Fork** | Fixed | Two biome-themed exits; path select + argue mash feedback |
| **End** | Cinematic pans | Exit order → treasure toss → share panels → rummage → take |

Safe margins: **16 px** from logical edges for critical UI; interface layer always on top.

---

## 8. Parallax stack (presentation contract)

Matches C-02 / design §3.3:

| Layer | Scroll vs mid | Content |
|---|---|---|
| Far (~50%) | 0.5× | Sky/cave mass, large silhouettes, tileable strip |
| Near (~100%) | 1.0× | Tall props filling height (columns, trees, ice pillars) |
| Mid | 1.0× | Blocks, traps, haulers, treasure, enemies |
| Fore (~125%) | 1.25× | Overhangs, vines, mist wisps in front of play |
| Interface | Screen-space | +gp floats, share panels, HUD, argue bubbles |

---

## 9. Animation principles

1. **Involuntary overrides** (Hurt, Stunned, Falling) snap from any state (design §2.1).
2. **One-shot actions** (Throw, Drop, Push/Trip, Jump) return to Idle/Run.
3. **Weight feedback:** optional squash on land when heavy stack; no need unique art if VFX + anim speed suffice for MVP.
4. **Spill:** treasure becomes free world sprites with bounce; hauler plays Hurt/Stunned + short pickup lockout (no special “naked” sprite required).
5. **Argue (Fork):** hauler talk-bubble or arm-wave frames; at least 3 exclamation variants in audio—visual can reuse 2–3 mouth/pose frames.

---

## 10. Atlas & production constraints

| Constraint | Spec |
|---|---|
| Logical canvas | **960×540** |
| World block | **32×32** (architecture assumption) |
| Hauler frame | **48×48** preferred (fit in 2 blocks tall visually) |
| Treasure | **32×32** common; **32×40** tall uniques/sets OK |
| Trap tile | **32×32** base; multi-tile for golem/hand |
| Prefer atlas sizes | Power-of-two: 512, 1024, 2048 |
| Pipeline | Placeholder colored rects → swap-friendly **atlas keys** (C-02) |
| Naming | `cat_name_variant_frame` e.g. `char_gnome_run_02` |

Placeholder policy: solid color + letter label is shippable for engineering; **P0 art** replaces before playtest milestone “full loop readable”.

---

## 11. Consistency checklist (sign-off)

- [ ] Four haulers share frame grid, pivots, carry anchor
- [ ] Character hues match end panels, lobby seats, high-score portraits
- [ ] Spikes/gas/lightning never color-only (shape + motion)
- [ ] Coin sacks visually “soft” stack (no height add)
- [ ] Every biome has distinct far BG + 3 near props + block set
- [ ] UI share colors: gold / white / blue / red only for those roles
- [ ] All screens compose at 960×540 with 16 px safe margin
- [ ] No isometric or top-down tiles in production art

---

## 12. Related docs

| Doc | Purpose |
|---|---|
| [ASSET-INVENTORY.md](ASSET-INVENTORY.md) | Exhaustive prioritized asset list |
| [ASSET-MATRIX.md](ASSET-MATRIX.md) | Screens × biomes × entities coverage |
| Design PDF §1–§5 | Canonical mockups & lists |
| [ARCHITECTURE.md](../ARCHITECTURE.md) §9 resolution, §8 models |
| [COMPONENTS.md](../COMPONENTS.md) C-02 Presentation |
