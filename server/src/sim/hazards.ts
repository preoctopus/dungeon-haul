/**
 * Traps & switches for the authoritative sim (simulation DESIGN §8).
 *
 * MVP subset (Implementation Plan P3): spikes (floor contact → stun+spill) and
 * one timed trap — lightning cycle (a periodically-active stun zone). Regular
 * and heavy pressure switches activate linked devices; heavy switches need a
 * mass threshold. Every other palette trap/hazard is a log-once stub so
 * unknown cells never crash the sim (C06-T32).
 *
 * Geometry lives here; the Simulation supplies hauler positions/masses and owns
 * the stun/spill outcomes (this module has no hauler state).
 */
import type { CellType, LevelDefinition } from "@dhaul/levels";
import type { SwitchPublic, TrapPublic } from "@dhaul/protocol";

export interface HazardConfig {
  /** Mass (base 1 per hauler + carried weight) to trip a heavy switch. */
  heavySwitchMass: number;
  /** Lightning cycle full period in ticks. */
  lightningPeriodTicks: number;
  /** Ticks the lightning zone is active at the start of each period. */
  lightningActiveTicks: number;
}

export interface TrapRuntime {
  trapId: string;
  kind: string;
  cx: number;
  cy: number;
  /** World-px center. */
  x: number;
  y: number;
  active: boolean;
  /** "floor" = must be grounded on the cell; "zone" = AABB overlap. */
  contact: "floor" | "zone";
  timed: boolean;
}

export interface SwitchRuntime {
  switchId: string;
  kind: "regular" | "heavy";
  cx: number;
  cy: number;
  x: number;
  y: number;
  pressed: boolean;
  requiredMass: number;
  targetIds: string[];
}

const STUB_TRAP_KINDS: ReadonlySet<CellType> = new Set([
  "crumbling",
  "receding",
  "lightning_switch",
  "gas_switch",
  "falling_rock_spawner",
  "golem_spawn",
  "phantom_spawn",
]);

export function switchIdFor(cx: number, cy: number): string {
  return `sw:${cx},${cy}`;
}
export function trapIdFor(cx: number, cy: number): string {
  return `tr:${cx},${cy}`;
}

export class Hazards {
  readonly traps: TrapRuntime[] = [];
  readonly switches: SwitchRuntime[] = [];
  private readonly stubbed = new Set<string>();
  private readonly loggedStubs = new Set<CellType>();

  constructor(
    level: LevelDefinition,
    private readonly cfg: HazardConfig,
    private readonly log: (msg: string) => void = () => {},
  ) {
    const bs = level.blockSizePx;
    const linksBySwitch = new Map<string, string[]>();
    for (const link of level.switchLinks) {
      linksBySwitch.set(link.switchId, link.targetIds);
    }
    for (let cy = 0; cy < level.cells.length; cy++) {
      const row = level.cells[cy]!;
      for (let cx = 0; cx < row.length; cx++) {
        const cell = row[cx]!;
        const x = cx * bs + bs / 2;
        const y = cy * bs + bs / 2;
        switch (cell) {
          case "spikes":
            this.traps.push({
              trapId: trapIdFor(cx, cy),
              kind: "spikes",
              cx,
              cy,
              x,
              y,
              active: true,
              contact: "floor",
              timed: false,
            });
            break;
          case "lightning_cycle":
            this.traps.push({
              trapId: trapIdFor(cx, cy),
              kind: "lightning",
              cx,
              cy,
              x,
              y,
              active: false,
              contact: "zone",
              timed: true,
            });
            break;
          case "switch":
          case "heavy_switch": {
            const switchId = switchIdFor(cx, cy);
            this.switches.push({
              switchId,
              kind: cell === "heavy_switch" ? "heavy" : "regular",
              cx,
              cy,
              x,
              y,
              pressed: false,
              requiredMass: cell === "heavy_switch" ? cfg.heavySwitchMass : 1,
              targetIds: linksBySwitch.get(switchId) ?? [],
            });
            break;
          }
          default:
            if (STUB_TRAP_KINDS.has(cell) && !this.loggedStubs.has(cell)) {
              this.loggedStubs.add(cell);
              this.stubbed.add(trapIdFor(cx, cy));
              this.log(`[hazards] trap kind "${cell}" not implemented (stub)`);
            }
        }
      }
    }
  }

  /** Advance timed traps (lightning cycle) for the given tick. */
  stepTimed(tick: number): void {
    for (const t of this.traps) {
      if (t.kind === "lightning") {
        const phase = tick % this.cfg.lightningPeriodTicks;
        t.active = phase < this.cfg.lightningActiveTicks;
      }
    }
  }

  /** Active floor trap whose cell a grounded hauler stands on. */
  floorTrapAt(cx: number, cy: number): TrapRuntime | undefined {
    return this.traps.find(
      (t) => t.active && t.contact === "floor" && t.cx === cx && t.cy === cy,
    );
  }

  /** Active zone traps overlapping a world-px AABB. */
  zoneTrapsOverlapping(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    bs: number,
  ): TrapRuntime[] {
    return this.traps.filter((t) => {
      if (!t.active || t.contact !== "zone") return false;
      const cellMinX = t.cx * bs;
      const cellMinY = t.cy * bs;
      return (
        maxX > cellMinX &&
        minX < cellMinX + bs &&
        maxY > cellMinY &&
        minY < cellMinY + bs
      );
    });
  }

  switchAt(cx: number, cy: number): SwitchRuntime | undefined {
    return this.switches.find((s) => s.cx === cx && s.cy === cy);
  }

  /** Union of target ids of all pressed switches. */
  activatedDevices(): Set<string> {
    const ids = new Set<string>();
    for (const s of this.switches) {
      if (s.pressed) for (const id of s.targetIds) ids.add(id);
    }
    return ids;
  }

  deviceActive(id: string): boolean {
    return this.switches.some((s) => s.pressed && s.targetIds.includes(id));
  }

  trapsPublic(): TrapPublic[] {
    return this.traps.map((t) => ({
      trapId: t.trapId,
      kind: t.kind,
      x: t.x,
      y: t.y,
      active: t.active,
    }));
  }

  switchesPublic(): SwitchPublic[] {
    return this.switches.map((s) => ({
      switchId: s.switchId,
      x: s.x,
      y: s.y,
      pressed: s.pressed,
    }));
  }
}
