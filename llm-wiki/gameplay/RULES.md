---
title: Gameplay & Treasure Rules
type: concept
updated: 2026-07-21
sources: [docs/interfaces/share-modifier-api.md, docs/ARCHITECTURE.md]
tags: [gameplay, rules, scoring, treasure]
---

# Gameplay & Treasure Rules

The gameplay of **Dungeon Haul** is defined by the acquisition and transport of treasures through a dungeon, culminating in a share distribution based on "Share Modifiers". All calculations are handled by a pure `packages/rules` engine.

## The Loot Cycle

1. **Acquisition:** Players collect treasures from the world or chests.
2. **Transport:** Treasures are carried in a stack. 
   - After **3 items**, encumbrance begins to penalize speed and jump height.
   - Overweight players may experience reduced knockback resistance or trigger heavy switches.
   - Extreme weight can lead to $0$ movement speed (triggering the `Greed Overwhelming` penalty).
3. **Hazard:** Traps cause "spills" where treasures are dropped' in a Sonic-ring style scatter, allowing other players to steal them.

## The Share System (The Haul Split)

At the end of the run, treasure is not split equally. Instead, it is distributed based on shares earned through modifiers.

### Payout Formula
$$\text{take}_i = \text{TotalTreasureGp} \times \left( \frac{\text{shares}_i}{\sum \text{shares}} \right)$$
$$\text{shares}_i = \max(1, \sum \Delta\text{shares}_i)$$

**Core Rule:** Every player is guaranteed a minimum of **1 share**, regardless of penalties. Final GP values are floored to integers; remainders go to the player with the highest shares.

### Share Modifiers
Modifiers reward positive behavior/achievement or penalize failure/sabotage.

#### Key Rewards ($\Delta > 0$)
- **Leader of the Pack (+10):** First to exit every level.
- **Breadwinner (+5):** Recovered the most total treasure value.
- **Flawless (+5):** Never stunned or injured.
- **Success! (+5):** Successfully exited the dungeon.
- **Haul (+1 per item):** Every individual treasure recovered.

#### Key Penalties ($\Delta < 0$)
- **Antisocial (-7):** The only human in a game session.
- **Big Jerk (-5):** Hit the most other players.
- **Undiscerning (-5):** Finished with only common treasures.
- **Autopilot (-5):** AI-controlled for $> 50\%$ of the game.
- **Greed Overwhelming (-2):** Speed dropped to $0$ due to weight.

## Treasure Tiers & Value
Treasure is spawned based on a weighted mix: **65% Common, 20% Rare, 5% Unique, 10% Set**.
- **Set Pieces:** Recovering full sets grants significant bonuses (overriding individual piece values).
- **Coin Sacks:** Provide value but do not increase visual stack height.

## See also
- [[architecture/SYSTEM]] - How simulation feeds these rules.
- [[network/PROTOCOL]] - Input commands that drive player stats.
- [[roadmap/PLAN]] - Testing priorities for the rules engine.
