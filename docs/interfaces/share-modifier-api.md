# Contract: Share Modifier & Treasure Rules (Pure API)

**Package:** `packages/rules` (planned)  
**Producers:** Rules Engine  
**Consumers:** Authoritative Simulation (end of run), unit tests, End Screen Director (display only)  
**Constraint:** **Pure functions** — no I/O, no engine, no network.

Canonical design: design doc §0.0, §2.2, §2.3 (and premise share list). Where premise and §2.3 tables differ slightly, **§2.3 tables win** unless noted.

---

## Public API surface

```text
// --- Treasure valuation ---
getTreasureDef(defId: string): TreasureDef
rollTreasureDef(rng: Rng, table: "world" | "wooden_chest" | "silver_chest" | "gold_chest" | "magic_chest", ctx: RollContext): TreasureDef
computeInventoryValue(items: TreasureInstance[], setCatalog: SetDef[]): {
  totalGp: number
  setCompletions: { setId: string, bonusGp: number, contributors: seatId[] }[]
}

// --- Weight / movement modifiers ---
computeEncumbrance(carryCount: number, carryWeight: number): {
  speedMultiplier: number
  jumpMultiplier: number
  // after first 3 treasures: cumulative decrease (exact curve parameterized)
}

// --- Stats aggregation helpers ---
// (optional) reduce event log → PlayerStats

// --- Share modifiers ---
evaluateModifiers(ctx: ScoreContext): PlayerModifierResult[]

computeTakes(totalTreasureGp: number, results: PlayerModifierResult[]): TakeBreakdown

// --- Catalog ---
listModifierDefs(): ShareModifierDef[]
rulesetVersion: string
```

All functions must be **deterministic** given the same inputs + RNG stream.

---

## Core types

```text
ScoreContext {
  seats: {
    seatId: number
    character: CharacterId
    human: bool
    stats: PlayerStats
    finalInventory: TreasureInstance[]
    hoardExitInventoryCount: number
  }[]
  levelsCompleted: number
  // precomputed relatives:
  ranking: {
    mostTreasureValue: seatId[]
    mostTrapsHit: seatId[]
    mostHitsDealt: seatId[]
    mostHitsTaken: seatId[]
    mostTreasureLost: seatId[]
    mostAirTime: seatId[]
    leastAirTime: seatId[]
    alwaysFirstExit: seatId[]   // Leader of the Pack candidates
    alwaysLastExit: seatId[]
  }
}

PlayerStats {
  // see ARCHITECTURE.md §8 — full counter set
}

PlayerModifierResult {
  seatId: number
  modifiers: AppliedModifier[]
  rawShares: number
  shares: number              // max(1, rawShares) per seat after all deltas
}

AppliedModifier {
  id: string
  title: string
  kind: "reward" | "penalty"
  uniqueness: "unique" | "common"
  deltaShares: number
}

TakeBreakdown {
  totalTreasureGp: number
  totalShares: number
  players: {
    seatId: number
    shares: number
    sharePercent: number      // shares/totalShares * 100
    takeGp: number            // floor or round policy — document: **floor to int GP**, remainder to highest share seat
  }[]
}
```

### Payout formula

```text
take_i = TotalTreasureGp * (shares_i / sum(shares))
shares_i = max(1, sum(deltaShares_i))
```

**Min 1 share** always, even if penalties would reduce below 1.

---

## Modifier catalog (implement & test)

### Rewards (design §2.3)

| ID | Title | Δ | Condition |
|---|---|---|---|
| leader_pack | Leader of the Pack | +10 | Always first to exit each level |
| breadwinner | Breadwinner | +5 | Most treasure value recovered |
| airhead | Airhead | +3 | Most airtime |
| landshark | Landshark | +3 | Least airtime |
| jammy | Jammy | +1 | Brought Goat on a Pole |
| haul | Haul | +1 / item | Each treasure recovered |
| collector | Collector | +1 / set piece | Each set piece in a completed set |
| my_precious | My Precious | +5 | Exactly one treasure Hoard→Exit |
| success | Success! | +5 | Successfully exited dungeon |
| flawless | Flawless | +5 | Never stunned or injured |
| gambler | Gambler | +5 | Only recovered chests |
| disciplinarian | Disciplinarian | +3 | Hit each other player |
| opportunist | Opportunist | +2 | Finish with ≥ +2 treasures vs hoard exit |
| softie | Softie | +1 | Never hit another player |
| precision | Precision | +1 | Exit with same treasure count as hoard exit |

### Penalties (design §2.3)

| ID | Title | Δ | Condition |
|---|---|---|---|
| slowpoke | Slowpoke | -1 | Always last to exit a stage |
| butterfingers | Butterfingers | -3 | Lost the most treasures |
| klutz | Klutz | -3 | Hit the most traps |
| whipping_boy | Whipping Boy | -3 | Took the most hits from players |
| big_jerk | Big Jerk | -5 | Hit the most other players |
| antisocial | Antisocial | -7 | Only human for whole game |
| unremarkable | Unremarkable | -1 | No unique modifiers earned |
| remedial | Remedial Archaeology | -1 | Lost a set item during escape |
| attention_deficit | Attention Deficit | -2 | Human/AI control swaps > 5 |
| greed | Greed Overwhelming | -2 | Speed dropped to 0 from weight |
| empty_handed | Empty Handed | -3 | Exit with no treasure |
| undiscerning | Undiscerning | -5 | Exit with only common treasures |
| autopilot | Autopilot | -5 | AI-controlled > half the game |

### Display order (End Screen)

Per player title list:

1. Unique rewards (gold)  
2. Common rewards (white)  
3. Common penalties (blue)  
4. Unique penalties (red)  

Values **not** shown on titles list (design).

### Percentage reveal order

Show share percentages in order **3rd, 2nd, 4th, 1st** place (by take or share rank — **assume by final takeGp**).

---

## Tie-break policy (assumption — test-locked)

When “most X” ties:

1. Prefer **human** over AI for rewards; reverse for harsh penalties only if needed for drama — **simpler MVP:** all ties → **all tied seats receive** the modifier (design does not forbid multi-award).  
2. Document in tests. If multi-award feels wrong in playtest, switch to lowest seatId wins.

**Assumption for MVP:** ties share the modifier (all get it).

---

## Treasure tables (data)

Implement as data files consumed by pure loaders:

- Common / Rare / Unique lists and values from design §2.2  
- Sets with piece counts and `%` set bonuses  
- Coin sacks: value applies but **may not add to visual stack height** (flag `affectsStackVisual: false`)  
- Chests: open via `rollTreasureDef` with constraints (no duplicate live uniques)

---

## Encumbrance (parameters)

Design: after first **3** treasures, cumulative decrease in speed/jump; weight affects knockback & switches.

```text
// Parameter block (tunable constants, not magic littered in sim)
ENCUMBRANCE = {
  freeItems: 3,
  speedPenaltyPerExtra: number,   // e.g. 0.12
  jumpPenaltyPerExtra: number,
  minSpeedMultiplier: 0,          // allows Greed Overwhelming
}
```

Exact numbers TBD in playtest; API must accept config object for tests.

---

## Test matrix (minimum)

- [ ] Min share 1 with huge penalties  
- [ ] Four equal shares → 25% each  
- [ ] Set completion replaces per-piece value with set value rules (design: whole set value supersedes pieces when complete)  
- [ ] Haul +N equals item count  
- [ ] Autopilot at exactly 50% does **not** fire; `>` 50% does  
- [ ] Antisocial only when single human seat entire session  
- [ ] Leader of the Pack fails if lost first on any level  
- [ ] Integer GP remainder distribution stable  

---

## Non-responsibilities

- Animating coin tosses  
- Persisting high scores  
- Reading network state  
- Deciding *when* the run ended  
