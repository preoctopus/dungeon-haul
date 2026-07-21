/**
 * Authoritative headless simulation — P2 movement-only slice of C-06
 * (simulation DESIGN §4–6): fixed 30 Hz tick, 4 HaulerSlot seats always,
 * run/jump/air-steer/gravity/AABB vs the level's solid grid, per-seat input
 * queues with seq handling, WorldSnapshot emit with lastProcessedInputSeq.
 *
 * Out of scope here (P3+): treasure, traps, encumbrance, phases beyond a
 * fixed "level" phase, AI behaviors (AI seats emit neutral input), stats.
 */

import type {
  CharacterId,
  GameEvent,
  HaulerPublic,
  InputCommand,
  SeatId,
  SeatPublic,
  WorldSnapshot,
} from "@dhaul/protocol";
import type { LevelDefinition } from "@dhaul/levels";
import type { SimConfig } from "./config.js";
import { DEFAULT_SIM_CONFIG } from "./config.js";
import {
  createBody,
  NEUTRAL_INPUT,
  stepHauler,
  type HaulerBody,
  type MoveInput,
  type SolidGrid,
} from "./kinematics.js";
import { solidGridFromLevel, spawnWorldPos } from "./grid.js";

const SEAT_IDS: readonly SeatId[] = [0, 1, 2, 3];
const DEFAULT_CHARACTERS: readonly CharacterId[] = [
  "gnome",
  "sprite",
  "halfling",
  "dwarf",
];

interface SeatRuntime {
  seatId: SeatId;
  character: CharacterId;
  control: "human" | "ai";
  humanId?: string;
  displayName?: string;
  connected: boolean;
  body: HaulerBody;
  /** Queued (validated) commands; sim applies at most one per tick. */
  queue: InputCommand[];
  /** Held input levels from the last applied command. */
  held: MoveInput;
  lastProcessedSeq: number;
  /** Highest seq ever accepted into the queue (dup rejection). */
  lastQueuedSeq: number;
  lastHumanInputTick: number;
}

export interface TickResult {
  snapshot: WorldSnapshot;
  events: GameEvent[];
}

export class Simulation {
  readonly config: SimConfig;
  readonly level: LevelDefinition;
  private readonly grid: SolidGrid;
  private readonly seats: SeatRuntime[];
  private tickCount = 0;

  constructor(level: LevelDefinition, config: SimConfig = DEFAULT_SIM_CONFIG) {
    this.config = config;
    this.level = level;
    this.grid = solidGridFromLevel(level);
    this.seats = SEAT_IDS.map((seatId) => {
      const spawn = spawnWorldPos(level, seatId);
      return {
        seatId,
        character: DEFAULT_CHARACTERS[seatId] as CharacterId,
        control: "ai" as const,
        connected: false,
        body: createBody(spawn.x, spawn.y),
        queue: [],
        held: { ...NEUTRAL_INPUT },
        lastProcessedSeq: 0,
        lastQueuedSeq: 0,
        lastHumanInputTick: 0,
      };
    });
  }

  get tick(): number {
    return this.tickCount;
  }

  /**
   * Queue a validated human command (input-commands.md §Encoding notes):
   * seq must increase — duplicates/reordered ignored, gaps tolerated.
   * Returns false if the command was ignored.
   */
  applyInput(seatId: SeatId, cmd: InputCommand): boolean {
    const seat = this.seats[seatId];
    if (!seat) return false;
    if (cmd.seq <= seat.lastQueuedSeq) return false; // dup / stale
    seat.lastQueuedSeq = cmd.seq;
    seat.queue.push(cmd);
    // Bounded buffer (DESIGN §4.1): late backlog beyond window drops oldest.
    while (seat.queue.length > this.config.inputQueueMax) {
      seat.queue.shift();
    }
    return true;
  }

  /** Human takes (or retakes) a seat; keeps position (soft-takeover). */
  bindHuman(seatId: SeatId, humanId: string, displayName?: string): GameEvent[] {
    const seat = this.seats[seatId];
    if (!seat) return [];
    const events: GameEvent[] =
      seat.control === "ai" ? [{ type: "human_takeover", seatId }] : [];
    seat.humanId = humanId;
    if (displayName !== undefined) seat.displayName = displayName;
    seat.control = "human";
    seat.connected = true;
    seat.lastHumanInputTick = this.tickCount;
    return events;
  }

  /**
   * Human connection lost or left. AI pilots immediately (idle-stand in P2).
   * `permanent` clears the human binding (seat stays AI for the run).
   */
  releaseHuman(seatId: SeatId, permanent: boolean): GameEvent[] {
    const seat = this.seats[seatId];
    if (!seat) return [];
    const events: GameEvent[] =
      seat.control === "human" ? [{ type: "ai_takeover", seatId }] : [];
    seat.control = "ai";
    seat.connected = false;
    seat.queue = [];
    seat.held = { ...NEUTRAL_INPUT };
    if (permanent) delete seat.humanId;
    return events;
  }

  /** Advance exactly one fixed tick. Never call with wall-clock dt. */
  step(): TickResult {
    this.tickCount += 1;
    const events: GameEvent[] = [];
    const kin = this.config.kinematics;

    for (const seat of this.seats) {
      if (seat.control === "human") {
        const cmd = seat.queue.shift();
        if (cmd) {
          seat.held = { moveX: cmd.axes.x, jump: cmd.jump };
          seat.lastProcessedSeq = cmd.seq;
          seat.lastHumanInputTick = this.tickCount;
        } else if (
          this.tickCount - seat.lastHumanInputTick >=
          this.config.humanIdleAiTicks
        ) {
          // Idle → AI (20s path; 5s+edge variant is P3+).
          seat.control = "ai";
          seat.held = { ...NEUTRAL_INPUT };
          events.push({ type: "ai_takeover", seatId: seat.seatId });
        }
      } else {
        // Connected human packet returns control (input-commands.md).
        const cmd = seat.queue.shift();
        if (cmd && seat.connected) {
          seat.control = "human";
          seat.held = { moveX: cmd.axes.x, jump: cmd.jump };
          seat.lastProcessedSeq = cmd.seq;
          seat.lastHumanInputTick = this.tickCount;
          events.push({ type: "human_takeover", seatId: seat.seatId });
        } else {
          // P2: AI seats emit neutral input (idle stand; no C-08 yet).
          seat.held = { ...NEUTRAL_INPUT };
        }
      }
      stepHauler(seat.body, seat.held, this.grid, kin);
    }

    return { snapshot: this.buildSnapshot(), events };
  }

  buildSnapshot(): WorldSnapshot {
    const lastProcessedInputSeq: { [seatId: number]: number } = {};
    const haulers: HaulerPublic[] = this.seats.map((seat) => {
      lastProcessedInputSeq[seat.seatId] = seat.lastProcessedSeq;
      const b = seat.body;
      const hauler: HaulerPublic = {
        seatId: seat.seatId,
        character: seat.character,
        control: seat.control,
        x: round2(b.x),
        y: round2(b.y),
        vx: round2(b.vx),
        vy: round2(b.vy),
        facing: b.facing,
        anim: b.grounded ? (Math.abs(b.vx) > 1 ? "run" : "idle") : b.vy < 0 ? "jump" : "falling",
        carry: [],
        stunned: false,
      };
      if (seat.displayName !== undefined) hauler.name = seat.displayName;
      return hauler;
    });
    return {
      tick: this.tickCount,
      phase: "level",
      levelId: this.level.id,
      levelsCompleted: 0,
      levelsAfterHoard: this.config.levelsAfterHoard,
      lastProcessedInputSeq,
      haulers,
      treasures: [],
      traps: [],
      switches: [],
    };
  }

  seatsPublic(): SeatPublic[] {
    return this.seats.map((seat) => {
      const pub: SeatPublic = {
        seatId: seat.seatId,
        occupied: seat.humanId !== undefined,
        control: seat.control,
        ready: false,
      };
      if (seat.displayName !== undefined) pub.displayName = seat.displayName;
      return pub;
    });
  }

  /** Test/introspection helper. */
  seatState(seatId: SeatId): {
    control: "human" | "ai";
    connected: boolean;
    body: Readonly<HaulerBody>;
    lastProcessedSeq: number;
  } {
    const seat = this.seats[seatId];
    if (!seat) throw new Error(`bad seatId ${seatId}`);
    return {
      control: seat.control,
      connected: seat.connected,
      body: seat.body,
      lastProcessedSeq: seat.lastProcessedSeq,
    };
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
