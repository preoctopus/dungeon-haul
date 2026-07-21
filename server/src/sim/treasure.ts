/**
 * Treasure lifecycle for the authoritative sim (simulation DESIGN §7).
 *
 * Every treasure instance is in exactly one place: carried by a seat, free in
 * the world, or destroyed (conservation invariant §7.4). This module owns the
 * free/projectile pool + physics; the Simulation owns carry stacks and grants
 * pickups (server is the sole grantor). Identity is rolled once at level load
 * via the pure rules catalog and never mutated afterward.
 */
import { getTreasureDef, rollTreasureDef, type Rarity } from "@dhaul/rules";
import type { LevelDefinition, TreasureSlot } from "@dhaul/levels";
import type { CarriedTreasureRef, TreasurePublic } from "@dhaul/protocol";
import type { Rng } from "@dhaul/rules";
import type { SolidGrid } from "./kinematics.js";

/** Uniform per-item weight for MVP (DESIGN §5.4 leaves the curve tunable). */
export const ITEM_WEIGHT = 1;

export type TreasureState = "free" | "carried" | "destroyed";

export interface TreasureRuntime {
  instanceId: string;
  defId: string;
  valueGp: number;
  rarity: Rarity;
  weight: number;
  stackableVisual: boolean;
  isChest: boolean;
  chestTable?: string;
  state: TreasureState;
  /** World px (center). Meaningful for free/projectile items. */
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Ticks a just-thrown/spilled item stays a live projectile before settling reads. */
  ownerSeatId?: number;
}

/** Half-extent of a loose treasure AABB in px. */
const T_HALF = 8;
const EPS = 0.001;

export interface TreasurePhysicsConfig {
  gravity: number;
  maxFallSpeed: number;
  dt: number;
  /** Horizontal drag applied to loose items each tick (0..1 retained). */
  drag: number;
}

/** Build a runtime instance from a rolled def. */
function makeRuntime(
  instanceId: string,
  defId: string,
  x: number,
  y: number,
): TreasureRuntime {
  const def = getTreasureDef(defId);
  if (!def) throw new Error(`treasure: unknown defId "${defId}"`);
  const rt: TreasureRuntime = {
    instanceId,
    defId,
    valueGp: def.baseValueGp,
    rarity: def.rarity,
    weight: ITEM_WEIGHT,
    stackableVisual: def.stackableVisual,
    isChest: def.isChest,
    state: "free",
    x,
    y,
    vx: 0,
    vy: 0,
  };
  if (def.chestTable) rt.chestTable = def.chestTable;
  return rt;
}

export class TreasureSystem {
  /** Every instance ever created this level, keyed by id (source of truth). */
  private readonly items = new Map<string, TreasureRuntime>();
  private nextId = 0;

  constructor(private readonly phys: TreasurePhysicsConfig) {}

  /**
   * Roll identities for every slot with the seeded stream. Uniques/set pieces
   * already in play are excluded so no live duplicate spawns (§7.1).
   */
  spawnFromLevel(level: LevelDefinition, rng: Rng, idPrefix: string): void {
    const excluded: string[] = [];
    level.treasureSlots.forEach((slot: TreasureSlot, i: number) => {
      const def = rollTreasureDef(rng, "world", { excludedDefIds: excluded });
      if (def.unique || def.rarity === "set") excluded.push(def.id);
      const bs = level.blockSizePx;
      const instanceId = `${idPrefix}:t${i}`;
      this.items.set(
        instanceId,
        makeRuntime(instanceId, def.id, slot.x * bs + bs / 2, slot.y * bs + bs / 2),
      );
      this.nextId = i + 1;
    });
  }

  get(instanceId: string): TreasureRuntime | undefined {
    return this.items.get(instanceId);
  }

  /**
   * Test / debug helper: place a known def as free treasure at world px.
   * Not used by production level spawn (seeded slots only).
   */
  spawnAt(defId: string, x: number, y: number, idPrefix = "debug"): TreasureRuntime {
    const instanceId = `${idPrefix}:t${this.nextId++}`;
    const rt = makeRuntime(instanceId, defId, x, y);
    this.items.set(instanceId, rt);
    return rt;
  }

  all(): TreasureRuntime[] {
    return [...this.items.values()];
  }

  /** Def ids currently carried or free (for unique-in-play roll exclusion). */
  liveUniqueDefIds(): string[] {
    const ids: string[] = [];
    for (const t of this.items.values()) {
      if (t.state !== "destroyed" && (t.rarity === "unique" || t.rarity === "set")) {
        ids.push(t.defId);
      }
    }
    return ids;
  }

  /**
   * Highest-value free instance whose center is within `radius` px of (x,y).
   * Excludes destroyed/carried. Deterministic tie-break by instanceId.
   */
  nearestFree(x: number, y: number, radius: number): TreasureRuntime | undefined {
    let best: TreasureRuntime | undefined;
    for (const t of this.items.values()) {
      if (t.state !== "free") continue;
      const dx = t.x - x;
      const dy = t.y - y;
      if (dx * dx + dy * dy > radius * radius) continue;
      if (
        best === undefined ||
        t.valueGp > best.valueGp ||
        (t.valueGp === best.valueGp && t.instanceId < best.instanceId)
      ) {
        best = t;
      }
    }
    return best;
  }

  /** Mark an instance carried by a seat (server-granted pickup). */
  markCarried(instanceId: string, seatId: number): void {
    const t = this.items.get(instanceId);
    if (!t) return;
    t.state = "carried";
    t.ownerSeatId = seatId;
    t.vx = 0;
    t.vy = 0;
  }

  /** Release an instance back to the world at (x,y) with a velocity. */
  release(instanceId: string, x: number, y: number, vx: number, vy: number): void {
    const t = this.items.get(instanceId);
    if (!t) return;
    t.state = "free";
    delete t.ownerSeatId;
    t.x = x;
    t.y = y;
    t.vx = vx;
    t.vy = vy;
  }

  /** Open a chest instance in place → destroy shell, spawn revealed item free. */
  openChest(instanceId: string, rng: Rng, ctx: {
    excludedDefIds?: readonly string[];
  }): TreasureRuntime | undefined {
    const shell = this.items.get(instanceId);
    if (!shell || !shell.isChest || !shell.chestTable) return undefined;
    const table = shell.chestTable as
      | "wooden_chest"
      | "silver_chest"
      | "gold_chest"
      | "magic_chest";
    const def = rollTreasureDef(rng, table, ctx);
    shell.state = "destroyed";
    const revealedId = `${shell.instanceId}:open`;
    const rt = makeRuntime(revealedId, def.id, shell.x, shell.y);
    this.items.set(revealedId, rt);
    return rt;
  }

  destroy(instanceId: string): void {
    const t = this.items.get(instanceId);
    if (t) {
      t.state = "destroyed";
      delete t.ownerSeatId;
    }
  }

  /** Integrate loose (free) items: gravity, drag, AABB settle vs solid grid. */
  step(grid: SolidGrid): void {
    for (const t of this.items.values()) {
      if (t.state !== "free") continue;
      t.vx *= this.phys.drag;
      if (Math.abs(t.vx) < 1) t.vx = 0;
      t.vy = Math.min(t.vy + this.phys.gravity * this.phys.dt, this.phys.maxFallSpeed);
      moveTreasureAxis(t, grid, "x", t.vx * this.phys.dt);
      moveTreasureAxis(t, grid, "y", t.vy * this.phys.dt);
    }
  }

  toPublic(): TreasurePublic[] {
    const out: TreasurePublic[] = [];
    for (const t of this.items.values()) {
      if (t.state !== "free") continue;
      const pub: TreasurePublic = {
        instanceId: t.instanceId,
        defId: t.defId,
        x: round2(t.x),
        y: round2(t.y),
      };
      if (t.vx !== 0) pub.vx = round2(t.vx);
      if (t.vy !== 0) pub.vy = round2(t.vy);
      out.push(pub);
    }
    return out;
  }

  /** Conservation ledger for invariant tests (§7.4). */
  ledger(): { free: number; carried: number; destroyed: number; total: number } {
    let free = 0;
    let carried = 0;
    let destroyed = 0;
    for (const t of this.items.values()) {
      if (t.state === "free") free++;
      else if (t.state === "carried") carried++;
      else destroyed++;
    }
    return { free, carried, destroyed, total: this.items.size };
  }
}

export function carriedRef(t: TreasureRuntime): CarriedTreasureRef {
  return { instanceId: t.instanceId, defId: t.defId };
}

/** Point-ish AABB axis move with grid collision (settle-only, no tunneling). */
function moveTreasureAxis(
  t: TreasureRuntime,
  grid: SolidGrid,
  axis: "x" | "y",
  delta: number,
): void {
  if (delta === 0) return;
  const bs = grid.blockSizePx;
  const maxStep = bs / 2;
  const sign = Math.sign(delta);
  let remaining = Math.abs(delta);
  while (remaining > 0) {
    const step = Math.min(remaining, maxStep);
    remaining -= step;
    t[axis] += step * sign;
    if (overlapsSolid(grid, t.x, t.y)) {
      if (axis === "x") {
        if (sign > 0) t.x = Math.floor((t.x + T_HALF - EPS) / bs) * bs - T_HALF - EPS;
        else t.x = (Math.floor((t.x - T_HALF) / bs) + 1) * bs + T_HALF + EPS;
        t.vx = 0;
      } else {
        if (sign > 0) t.y = Math.floor((t.y + T_HALF - EPS) / bs) * bs - T_HALF - EPS;
        else t.y = (Math.floor((t.y - T_HALF) / bs) + 1) * bs + T_HALF + EPS;
        t.vy = 0;
      }
      return;
    }
  }
}

function overlapsSolid(grid: SolidGrid, x: number, y: number): boolean {
  const bs = grid.blockSizePx;
  const x0 = Math.floor((x - T_HALF) / bs);
  const x1 = Math.floor((x + T_HALF - EPS) / bs);
  const y0 = Math.floor((y - T_HALF) / bs);
  const y1 = Math.floor((y + T_HALF - EPS) / bs);
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      if (cx < 0 || cy < 0 || cx >= grid.widthCells || cy >= grid.heightCells || grid.isSolid(cx, cy)) {
        return true;
      }
    }
  }
  return false;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
