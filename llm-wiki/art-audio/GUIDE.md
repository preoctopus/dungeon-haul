---
title: Visual & Audio Guide
type: reference
updated: 2026-07-21
sources: [docs/art/AESTHETIC-BRIEF.md, docs/ARCHITECTURE.md]
tags: [art, audio, visual-identity, aesthetic]
---

# Visual & Audio Guide

**Dungeon Haul** adopts a "Playful NES Heist" aesthetic—prioritizing control clarity and slapstick energy over grimdark realism. The world is presented in a strict side-view orthographic 2D projection on a fixed **960×540** logical canvas.

## Visual Pillars
1. **Control Clarity:** Huge, readable hitboxes; chunky outlines (1–2px); NES-inspired UI glyphs.
2. **Slapstick Energy:** Cartoonish movement; "Sonic-style" treasure spills; bouncy character animations.
3. **Readable Silhouettes:** Strong color coding and body shapes so 4 players are instantly distinguishable.

## Character Identity & Palette
Each hauler is tied to a primary hue used consistently across the game (HUD, lobby seats, end panels).

| Character | Primary Hue | Silhouette Notes | Seat Color |
|---|---|---|---|
| **Gnome** | Amber / Orange `#F0A040` | Short, pointed hat, stocky | Orange |
| **Sprite** | Sky Blue `#50A0E8` | Taller/lighter; wing accents | Blue |
| **Halfling** | Magenta / Pink `#E070B0` | Rounder, curly hair cue | Pink |
| **Dwarf** | Crimson / Red `#E05040` | Broadest torso, shortest legs | Red |

## Biome Aesthetics
Biomes are distinguished by specific palettes and signature props, while keeping the midground legible.

- **Gold (Hoard):** Deep vault purple $\to$ Warm gold haze. Luxury stone + gold trim.
- **Outside:** Sky blue $\to$ Grass green. Dirt paths, trees, clouds.
- **Dungeon:** Charcoal $\to$ Cool grey. Brick grey, torches, iron grates.
- **Lava:** Ember black $\to$ Magma orange. Basalt, heat shimmer VFX.
- **Ice:** Pale cyan $\to$ Frozen blue. Ice tiles, frost icicles, slippery sheen.
- **Cavern:** Brown-black $\to$ Earth brown. Rough rock, mushrooms, stalactites.
- **Mist:** Desat purple $\to$ Fog lavender. Soft stone, vines, reduced contrast.

## Technical Specs (Art)
- **Resolution:** 960×540 logical pixels; integer scaling (1x/2x/3x).
- **Block Size:** 32×32 world blocks.
- **Hauler Frame:** ~48×48 gameplay frame.
- **Parallax Stack:** 5 layers: Far (0.5x) $\to$ Near (1.0x) $\to$ Mid (Truth/Gameplay) $\to$ Fore (1.25x) $\to$ Interface (Screen-space).
- **Animation:** Snappy 8–12 fps for run; involuntary states (Hurt/Stunned) override all others.

## Color Codes for Share Modifiers
The end-game share panels use a strict color system:
- **Gold (`#D4A017`):** Unique Rewards.
- **White (`#F5F5F5`):** Common Rewards.
- **Blue (`#3A6BC4`):** Common Penalties.
- **Red (`#C03030`):** Unique Penalties.

## See also
- [[architecture/SYSTEM]] - For technical resolution and canvas constraints.
- [[gameplay/RULES]] - To understand the modifiers that trigger these colors.
