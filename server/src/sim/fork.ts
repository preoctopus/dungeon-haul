/**
 * C-10 Fork Vote Subsystem (fork-vote DESIGN.md §5-§14).
 *
 * Server-authoritative: selects a random unplayed level pair (Q4-A),
 * tallies argue-pulse edges per seat over a fixed tick window, and
 * resolves a winner by majority (tie → selection plurality → seeded rng).
 * No global pause (Q10-A): the window advances every tick regardless of
 * disconnects, driven entirely by `Simulation.step()`.
 */

import type { ForkOption, InputCommand, SeatId } from "@dhaul/protocol";

const SEAT_IDS: readonly SeatId[] = [0, 1, 2, 3];

export interface Rng {
  next(): number;
}

export interface ForkConfig {
  /** Vote window length in ticks (DESIGN §6.1: 10-15s @ 30Hz). */
  windowTicks: number;
  /** Fallback AI driver (DESIGN §9) — temporary until C-08 emits fork inputs. */
  pulseChanceAi: number;
  switchChanceAi: number;
  defaultSelection: "A" | "B";
  preferYOverX: boolean;
  publicTallies: boolean;
  tieBreak: "selection_then_rng";
}

export const DEFAULT_FORK_CONFIG: ForkConfig = {
  windowTicks: 300, // 10s @ 30Hz
  pulseChanceAi: 0.25,
  switchChanceAi: 0.02,
  defaultSelection: "A",
  preferYOverX: true,
  publicTallies: true,
  tieBreak: "selection_then_rng",
};

export interface ForkPublicState {
  active: boolean;
  options: [ForkOption, ForkOption];
  tallies: { A: number; B: number };
  endsAtTick: number;
}

export type ForkResolveReason = "majority" | "tie_break";

export interface ForkResult {
  winningOptionId: "A" | "B";
  levelId: string;
  tallies: { A: number; B: number };
  reason: ForkResolveReason;
}

export interface ForkLevelMeta {
  biome: string;
  displayName: string;
}

export interface ForkOpenContext {
  tick: number;
  seats: readonly { seatId: SeatId; control: "human" | "ai" }[];
  rng: Rng;
  playedLevelIds: ReadonlySet<string>;
  pool: readonly string[];
  /** Biome/displayName lookup for chosen level ids (server content layer). */
  levelMeta: (levelId: string) => ForkLevelMeta;
  windowTicks?: number;
}

/**
 * Unplayed-pair picker (DESIGN §5.2). Distinct ids whenever `pool.length >= 2`;
 * degenerate single-level pools (current dev content) duplicate the only id
 * as a documented fallback rather than crashing the room.
 */
export function pickForkPair(
  pool: readonly string[],
  played: ReadonlySet<string>,
  rng: Rng,
): [string, string] {
  if (pool.length === 0) return ["box_level", "box_level"];
  if (pool.length < 2) {
    const only = pool[0]!;
    return [only, only];
  }
  const candidates = pool.filter((id) => !played.has(id));
  if (candidates.length >= 2) {
    return takeTwoShuffled(candidates, rng);
  }
  if (candidates.length === 1) {
    const kept = candidates[0]!;
    const remaining = pool.filter((id) => id !== kept);
    const other = remaining[Math.floor(rng.next() * remaining.length)]!;
    return rng.next() < 0.5 ? [kept, other] : [other, kept];
  }
  // Exhausted (candidates.length === 0): reshuffle the full pool.
  return takeTwoShuffled(pool, rng);
}

function takeTwoShuffled(ids: readonly string[], rng: Rng): [string, string] {
  const remaining = [...ids];
  const first = remaining.splice(Math.floor(rng.next() * remaining.length), 1)[0]!;
  const second = remaining.splice(Math.floor(rng.next() * remaining.length), 1)[0]!;
  return [first, second];
}

interface SeatVoteState {
  selection: "A" | "B";
  argueEdgePrev: boolean;
  aiInitialized: boolean;
}

/**
 * Server-authoritative fork vote (DESIGN §14). Owns option pick, per-seat
 * selection, argue tallies, and resolution; `Simulation` routes fork-phase
 * `InputCommand`s here instead of movement integration.
 */
export class ForkVoteModule {
  private readonly config: ForkConfig;
  private activeState = false;
  private optionsState: [ForkOption, ForkOption] = [
    { optionId: "A", levelId: "box_level", biome: "dungeon", displayName: "Path A" },
    { optionId: "B", levelId: "box_level", biome: "dungeon", displayName: "Path B" },
  ];
  private talliesState: { A: number; B: number } = { A: 0, B: 0 };
  private endsAtTick = 0;
  private result: ForkResult | undefined = undefined;
  private readonly seatVotes: Record<SeatId, SeatVoteState>;
  private rng?: Rng;

  constructor(config: ForkConfig = DEFAULT_FORK_CONFIG) {
    this.config = config;
    this.seatVotes = Object.fromEntries(
      SEAT_IDS.map((id) => [id, { selection: config.defaultSelection, argueEdgePrev: false, aiInitialized: false }]),
    ) as Record<SeatId, SeatVoteState>;
  }

  open(ctx: ForkOpenContext): ForkPublicState {
    const [idA, idB] = pickForkPair(ctx.pool, ctx.playedLevelIds, ctx.rng);
    const metaA = ctx.levelMeta(idA);
    const metaB = ctx.levelMeta(idB);
    this.optionsState = [
      { optionId: "A", levelId: idA, biome: metaA.biome, displayName: metaA.displayName },
      { optionId: "B", levelId: idB, biome: metaB.biome, displayName: metaB.displayName },
    ];
    this.talliesState = { A: 0, B: 0 };
    this.endsAtTick = ctx.tick + (ctx.windowTicks ?? this.config.windowTicks);
    this.result = undefined;
    this.rng = ctx.rng;
    this.activeState = true;
    for (const id of SEAT_IDS) {
      this.seatVotes[id] = {
        selection: this.config.defaultSelection,
        argueEdgePrev: false,
        aiInitialized: false,
      };
    }
    return this.getPublicState();
  }

  isActive(): boolean {
    return this.activeState;
  }

  /** DESIGN §7: axes.y primary, axes.x alias, y wins if both nonzero. */
  applyForkInput(seatId: SeatId, cmd: InputCommand, _tick: number): void {
    if (!this.activeState) return;
    const seat = this.seatVotes[seatId];
    const ySel = cmd.axes.y === -1 ? "A" : cmd.axes.y === 1 ? "B" : undefined;
    const xSel = cmd.axes.x === -1 ? "A" : cmd.axes.x === 1 ? "B" : undefined;
    const nextSel = ySel ?? xSel;
    if (nextSel) seat.selection = nextSel;

    const pressed = cmd.jump || cmd.action;
    const edge = pressed && !seat.argueEdgePrev;
    if (edge) this.talliesState[seat.selection] += 1;
    seat.argueEdgePrev = pressed;
  }

  /**
   * Fallback AI argue policy (DESIGN §9) — temporary until C-08 emits fork
   * inputs. Mild random mash so AI seats don't dominate humans.
   */
  driveAiSeat(seatId: SeatId, rng: Rng): void {
    if (!this.activeState) return;
    const seat = this.seatVotes[seatId];
    if (!seat.aiInitialized) {
      seat.selection = rng.next() < 0.5 ? "A" : "B";
      seat.aiInitialized = true;
    } else if (rng.next() < this.config.switchChanceAi) {
      seat.selection = rng.next() < 0.5 ? "A" : "B";
    }
    if (rng.next() < this.config.pulseChanceAi) {
      this.talliesState[seat.selection] += 1;
    }
  }

  /** Advance one tick; auto-resolves once `tick >= endsAtTick`. */
  tick(tick: number): { state: ForkPublicState; resolved: ForkResult | undefined } {
    if (this.activeState && tick >= this.endsAtTick) {
      this.result = this.resolveInternal();
      this.activeState = false;
    }
    return { state: this.getPublicState(), resolved: this.result };
  }

  private resolveInternal(): ForkResult {
    const { A, B } = this.talliesState;
    let winningOptionId: "A" | "B";
    let reason: ForkResolveReason;
    if (A !== B) {
      winningOptionId = A > B ? "A" : "B";
      reason = "majority";
    } else {
      let selA = 0;
      let selB = 0;
      for (const id of SEAT_IDS) {
        if (this.seatVotes[id].selection === "A") selA++;
        else selB++;
      }
      if (selA !== selB) {
        winningOptionId = selA > selB ? "A" : "B";
      } else {
        winningOptionId = (this.rng?.next() ?? 0.5) < 0.5 ? "A" : "B";
      }
      reason = "tie_break";
    }
    const levelId = this.optionsState.find((o) => o.optionId === winningOptionId)!.levelId;
    return { winningOptionId, levelId, tallies: { ...this.talliesState }, reason };
  }

  /** Last resolved result, if any (set once `tick()` crosses `endsAtTick`). */
  getResult(): ForkResult | undefined {
    return this.result;
  }

  getPublicState(): ForkPublicState {
    return {
      active: this.activeState,
      options: this.optionsState,
      tallies: { ...this.talliesState },
      endsAtTick: this.endsAtTick,
    };
  }

  /** Test helper (DESIGN §14). */
  forceOptions(a: ForkOption, b: ForkOption): void {
    this.optionsState = [a, b];
  }

  /** Test helper (DESIGN §14). */
  forceTallies(a: number, b: number): void {
    this.talliesState = { A: a, B: b };
  }
}
