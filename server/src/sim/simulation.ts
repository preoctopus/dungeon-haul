/**
 * Authoritative headless simulation — P3 gameplay core of C-06
 * (simulation DESIGN §4–12): fixed 30 Hz tick, 4 HaulerSlot seats always,
 * run/jump/air-steer/gravity/AABB vs the level's solid grid, per-seat input
 * queues with seq handling, WorldSnapshot emit with lastProcessedInputSeq.
 *
 * P3 features: treasure pickup/drop/throw carry stack, encumbrance (weight
 * slowdown), stun + spill + pickup lockout, trip/push, trap integration
 * (spikes, lightning), switches, ice/sand surfaces, level exit + order
 * stats, PlayerStats session-long counters, C-08 AI decide() injection.
 */

import { decide, type AiWorldView } from "@dhaul/ai";
import type { AABB, LevelDefinition } from "@dhaul/levels";
import type {
  CharacterId,
  GameEvent,
  HaulerPublic,
  InputCommand,
  SeatId,
  SeatPublic,
  SessionPhase,
  WorldSnapshot,
} from "@dhaul/protocol";
import { computeEncumbrance, type PlayerStats } from "@dhaul/rules";
import type { SimConfig } from "./config.js";
import { DEFAULT_SIM_CONFIG } from "./config.js";
import { footCell, solidGridFromLevel, spawnWorldPos } from "./grid.js";
import { Hazards } from "./hazards.js";
import {
  createBody,
  NEUTRAL_INPUT,
  stepHauler,
  type HaulerBody,
  type MoveInput,
  type SolidGrid,
} from "./kinematics.js";
import { deriveSeed, Mulberry32 } from "./rng.js";
import { createPlayerStats, recordPlayerHit } from "./stats.js";
import {
  carriedRef,
  type TreasurePhysicsConfig,
  type TreasureRuntime,
  TreasureSystem,
} from "./treasure.js";

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
  /** Held action + axes.y for chord detection. */
  heldAction: boolean;
  heldActionPrev: boolean;
  heldAxisY: -1 | 0 | 1;
  lastProcessedSeq: number;
  /** Highest seq ever accepted into the queue (dup rejection). */
  lastQueuedSeq: number;
  lastHumanInputTick: number;

  // --- P3 carry / stun ---
  carryStack: TreasureRuntime[];
  weight: number;
  stunnedUntilTick: number;
  pickupLockoutUntilTick: number;
  stats: PlayerStats;
  exited: boolean;
  exitOrder: number;
  /** AI stuck-recovery counter (C-08); reset on human control. */
  aiStuckTicks: number;
  /** Server-owned seq counter for AI-injected commands. */
  aiSeq: number;
}

export interface TickResult {
  snapshot: WorldSnapshot;
  events: GameEvent[];
}

export class Simulation {
  readonly config: SimConfig;
  level: LevelDefinition;
  private grid: SolidGrid;
  private readonly seats: SeatRuntime[];
  private treasures: TreasureSystem;
  private hazards: Hazards;
  private rng: Mulberry32;
  private exitAABB: AABB;
  private tickCount = 0;
  private exitCounter = 0;
  private levelComplete = false;
  private phaseValue: SessionPhase;
  /** Hoard does not count toward `levelsAfterHoard` (DESIGN §9.3). */
  private isHoardLevel = false;
  private levelsCompletedCount = 0;
  private forkEndsAtTick = 0;

  constructor(
    level: LevelDefinition,
    config: SimConfig = DEFAULT_SIM_CONFIG,
    initialPhase: SessionPhase = "level",
  ) {
    this.config = config;
    this.phaseValue = initialPhase;
    this.level = level;
    this.grid = solidGridFromLevel(level);
    this.exitAABB = { ...level.exit };

    // Seeded RNG for treasure rolls
    this.rng = new Mulberry32(deriveSeed(config.rngSeed, level.id));

    // Treasure system
    const tPhys: TreasurePhysicsConfig = {
      gravity: config.kinematics.gravity,
      maxFallSpeed: config.kinematics.maxFallSpeed,
      dt: config.kinematics.dt,
      drag: 0.92,
    };
    this.treasures = new TreasureSystem(tPhys);
    this.treasures.spawnFromLevel(level, this.rng, level.id);

    // Hazards (traps + switches)
    this.hazards = new Hazards(level, config.hazards);

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
        heldAction: false,
        heldActionPrev: false,
        heldAxisY: 0 as -1 | 0 | 1,
        lastProcessedSeq: 0,
        lastQueuedSeq: 0,
        lastHumanInputTick: 0,
        carryStack: [],
        weight: 0,
        stunnedUntilTick: 0,
        pickupLockoutUntilTick: 0,
        stats: createPlayerStats(),
        exited: false,
        exitOrder: 0,
        aiStuckTicks: 0,
        aiSeq: 0,
      };
    });
  }

  get tick(): number {
    return this.tickCount;
  }

  get phase(): SessionPhase {
    return this.phaseValue;
  }

  /** Count of completed post-Hoard levels this run (DESIGN §9.3). */
  get levelsCompleted(): number {
    return this.levelsCompletedCount;
  }

  /** Whether the currently loaded level is Hoard (excluded from the count). */
  get isHoard(): boolean {
    return this.isHoardLevel;
  }

  /**
   * Enter the fork phase: freezes physics/AI for `config.forkDurationTicks`
   * (DESIGN §10.3). Stub auto-resolve timer — real path-vote tallying and
   * UI is C-10 (fork-vote); the room calls `isForkResolved()` / `loadLevel()`
   * once C-10 lands to replace this timer with an actual vote result.
   */
  enterFork(): void {
    this.phaseValue = "fork";
    this.forkEndsAtTick = this.tickCount + this.config.forkDurationTicks;
  }

  /** True once the fork phase's stub hold timer has elapsed. */
  isForkResolved(): boolean {
    return this.phaseValue === "fork" && this.tickCount >= this.forkEndsAtTick;
  }

  /**
   * Load a new level in place, preserving seat inventories/stats/control
   * (DESIGN §9.1). Resets per-level transient state (stun, exit, held input).
   */
  loadLevel(
    level: LevelDefinition,
    phase: SessionPhase,
    opts?: { isHoard?: boolean },
  ): void {
    this.isHoardLevel = opts?.isHoard ?? false;
    this.level = level;
    this.grid = solidGridFromLevel(level);
    this.exitAABB = { ...level.exit };
    this.rng = new Mulberry32(deriveSeed(this.config.rngSeed, level.id));

    const tPhys: TreasurePhysicsConfig = {
      gravity: this.config.kinematics.gravity,
      maxFallSpeed: this.config.kinematics.maxFallSpeed,
      dt: this.config.kinematics.dt,
      drag: 0.92,
    };
    this.treasures = new TreasureSystem(tPhys);
    this.treasures.spawnFromLevel(level, this.rng, level.id);
    this.hazards = new Hazards(level, this.config.hazards);

    for (const seat of this.seats) {
      const spawn = spawnWorldPos(level, seat.seatId);
      seat.body = createBody(spawn.x, spawn.y);
      seat.held = { ...NEUTRAL_INPUT };
      seat.heldAction = false;
      seat.heldActionPrev = false;
      seat.heldAxisY = 0;
      seat.stunnedUntilTick = 0;
      seat.pickupLockoutUntilTick = 0;
      seat.exited = false;
      seat.exitOrder = 0;
      seat.aiStuckTicks = 0;
    }

    this.exitCounter = 0;
    this.levelComplete = false;
    this.phaseValue = phase;
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
    seat.aiStuckTicks = 0;
    // Track control swaps for stats
    if (events.length > 0) seat.stats.controlSwaps++;
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
    seat.heldAction = false;
    seat.heldActionPrev = false;
    seat.heldAxisY = 0;
    if (events.length > 0) seat.stats.controlSwaps++;
    if (permanent) delete seat.humanId;
    return events;
  }

  /** Advance exactly one fixed tick. Never call with wall-clock dt. */
  step(): TickResult {
    this.tickCount += 1;

    // Phase-gated physics free-run (DESIGN §10.3): only instructions/level
    // simulate movement; fork and end_* freeze until the room advances phase.
    if (this.phaseValue !== "instructions" && this.phaseValue !== "level") {
      return { snapshot: this.buildSnapshot(), events: [] };
    }

    const events: GameEvent[] = [];
    const kin = this.config.kinematics;
    const cfg = this.config;

    // --- Step 1: Ingest human inputs + idle detection ---
    for (const seat of this.seats) {
      // Track control ticks for stats
      if (seat.control === "human") {
        seat.stats.humanControlTicks++;
      } else {
        seat.stats.aiControlTicks++;
      }

      if (seat.control === "human") {
        const cmd = seat.queue.shift();
        if (cmd) {
          seat.held = { moveX: cmd.axes.x, jump: cmd.jump };
          seat.heldActionPrev = seat.heldAction;
          seat.heldAction = cmd.action;
          seat.heldAxisY = cmd.axes.y;
          seat.lastProcessedSeq = cmd.seq;
          seat.lastHumanInputTick = this.tickCount;
        } else if (
          this.tickCount - seat.lastHumanInputTick >=
          cfg.humanIdleAiTicks
        ) {
          // Idle → AI (20s path; 5s+edge is stretch).
          seat.control = "ai";
          seat.held = { ...NEUTRAL_INPUT };
          seat.heldAction = false;
          seat.heldActionPrev = false;
          seat.heldAxisY = 0;
          seat.stats.controlSwaps++;
          events.push({ type: "ai_takeover", seatId: seat.seatId });
        }
      } else {
        // Connected human packet returns control (input-commands.md).
        const cmd = seat.queue.shift();
        if (cmd && seat.connected) {
          seat.control = "human";
          seat.held = { moveX: cmd.axes.x, jump: cmd.jump };
          seat.heldActionPrev = seat.heldAction;
          seat.heldAction = cmd.action;
          seat.heldAxisY = cmd.axes.y;
          seat.lastProcessedSeq = cmd.seq;
          seat.lastHumanInputTick = this.tickCount;
          seat.aiStuckTicks = 0;
          seat.stats.controlSwaps++;
          events.push({ type: "human_takeover", seatId: seat.seatId });
        }
      }
    }

    // --- Step 1b: AI decide for remaining AI seats (C-08; human-first order) ---
    // Phase gating (simulation DESIGN §6.3): AI absent during instructions —
    // active from Hoard onward.
    if (cfg.enableAi && this.phaseValue !== "instructions") {
      const aiView = this.buildAiWorldView();
      for (const seat of this.seats) {
        if (seat.control !== "ai") continue;
        if (seat.exited) {
          seat.held = { ...NEUTRAL_INPUT };
          seat.heldAction = false;
          seat.heldAxisY = 0;
          continue;
        }
        const { command, stuckTicks } = decide(seat.seatId, aiView, {
          stuckTicks: seat.aiStuckTicks,
          config: cfg.ai,
        });
        seat.aiStuckTicks = stuckTicks;
        seat.aiSeq += 1;
        seat.heldActionPrev = seat.heldAction;
        seat.held = { moveX: command.axes.x, jump: command.jump };
        seat.heldAction = command.action;
        seat.heldAxisY = command.axes.y;
        seat.lastProcessedSeq = seat.aiSeq;
      }
    } else {
      for (const seat of this.seats) {
        if (seat.control !== "ai") continue;
        seat.held = { ...NEUTRAL_INPUT };
        seat.heldAction = false;
        seat.heldAxisY = 0;
      }
    }

    // --- Step 2: Timed hazards ---
    this.hazards.stepTimed(this.tickCount);

    // --- Step 3: Per-seat movement + interactions ---
    for (const seat of this.seats) {
      if (seat.exited) continue; // exited haulers don't move

      const isStunned = this.tickCount < seat.stunnedUntilTick;

      // Compute encumbrance multipliers
      const enc = computeEncumbrance(
        seat.carryStack.length,
        seat.weight,
        cfg.encumbrance,
      );
      if (enc.isSpeedZero) seat.stats.speedZeroFromWeight = true;

      // Surface under feet (ice / sand / brick default)
      const surface = this.surfaceMultipliers(seat);

      // Apply encumbrance + surface to movement input
      const moveInput: MoveInput = isStunned
        ? { ...NEUTRAL_INPUT }
        : {
            ...seat.held,
            speedMultiplier: enc.speedMultiplier,
            jumpMultiplier: enc.jumpMultiplier,
            frictionMultiplier: surface.friction,
            maxSpeedMultiplier: surface.maxSpeed,
          };

      stepHauler(seat.body, moveInput, this.grid, kin);

      // Track air/ground time
      if (seat.body.grounded) {
        seat.stats.groundTimeTicks++;
      } else {
        seat.stats.airTimeTicks++;
      }

      if (isStunned) continue; // skip interactions while stunned

      // --- Chord detection (action edge) ---
      const actionEdge = seat.heldAction && !seat.heldActionPrev;

      // --- Trip/push (action + empty hands + near another hauler) ---
      if (actionEdge && seat.carryStack.length === 0) {
        const tripTarget = this.findTripTarget(seat);
        if (tripTarget) {
          // Apply impulse
          tripTarget.body.vx += seat.body.facing * cfg.tripImpulseX;
          tripTarget.body.vy += cfg.tripImpulseY;
          tripTarget.body.grounded = false;
          // Stats
          seat.stats.hitsDealt++;
          tripTarget.stats.hitsTaken++;
          recordPlayerHit(seat.stats, tripTarget.seatId);
          events.push({
            type: "trip",
            attackerSeatId: seat.seatId,
            targetSeatId: tripTarget.seatId,
          });
        }
      }

      // --- Drop (action edge + axis down) ---
      let droppedThisTick = false;
      if (actionEdge && seat.heldAxisY === 1 && seat.carryStack.length > 0) {
        const dropped = seat.carryStack.shift()!;
        this.treasures.release(
          dropped.instanceId,
          seat.body.x,
          seat.body.y + kin.halfH,
          0,
          0,
        );
        seat.weight -= dropped.weight;
        droppedThisTick = true;
        events.push({
          type: "drop",
          seatId: seat.seatId,
          instanceId: dropped.instanceId,
          x: seat.body.x,
          y: seat.body.y + kin.halfH,
        });
      }

      // --- Throw (action edge + axis up) ---
      if (actionEdge && seat.heldAxisY === -1 && seat.carryStack.length > 0) {
        const thrown = seat.carryStack.shift()!;
        const vx = seat.body.facing * cfg.throwSpeedX;
        const vy = cfg.throwSpeedY;
        this.treasures.release(
          thrown.instanceId,
          seat.body.x,
          seat.body.y - kin.halfH,
          vx,
          vy,
        );
        seat.weight -= thrown.weight;
        events.push({
          type: "throw",
          seatId: seat.seatId,
          instanceId: thrown.instanceId,
          vx,
          vy,
        });
      }

      // --- Pickup (duck only — not action+down drop chord; not lockout) ---
      // input-commands: axes.y down = duck/pickup; action+down = drop.
      if (
        seat.heldAxisY === 1 &&
        !seat.heldAction &&
        !droppedThisTick &&
        this.tickCount >= seat.pickupLockoutUntilTick
      ) {
        const nearest = this.treasures.nearestFree(
          seat.body.x,
          seat.body.y,
          cfg.pickupReachPx,
        );
        if (nearest) {
          this.treasures.markCarried(nearest.instanceId, seat.seatId);
          seat.carryStack.unshift(nearest); // top of stack
          seat.weight += nearest.weight;
          seat.stats.itemsHauledCount++;
          seat.stats.treasureRecoveredValueGp += nearest.valueGp;
          events.push({
            type: "pickup",
            seatId: seat.seatId,
            instanceId: nearest.instanceId,
            defId: nearest.defId,
          });
        }
      }

      // --- Hazard checks (spikes, lightning) ---
      this.checkHazards(seat, events);

      // --- Switch checks ---
      this.checkSwitches(seat, events);

      // --- Exit detection ---
      if (!seat.exited) {
        this.checkExit(seat, events);
      }
    }

    // --- Step 4: Free treasure physics ---
    this.treasures.step(this.grid);

    // --- Step 5: Level complete? ---
    if (!this.levelComplete) {
      // Instructions phase (C06-T22): only active humans need to exit — AI
      // is absent and unbound seats should not block the transition.
      const allExited =
        this.phaseValue === "instructions"
          ? this.seats.every((s) => s.humanId === undefined || s.exited)
          : this.seats.every((s) => s.exited);
      if (allExited) {
        this.levelComplete = true;
        if (this.phaseValue === "level" && !this.isHoardLevel) {
          this.levelsCompletedCount++;
        }
        // Last exit order = highest exitOrder among seats that left.
        for (const seat of this.seats) {
          if (seat.exitOrder === this.exitCounter && this.exitCounter > 0) {
            seat.stats.exitsLastCount++;
            seat.stats.successfullyExited = true;
          } else if (seat.exited) {
            seat.stats.alwaysLastExit = false;
            seat.stats.successfullyExited = true;
          }
          if (seat.exited && seat.exitOrder !== 1) {
            seat.stats.alwaysFirstExit = false;
          }
        }
      }
    }

    // Save prev action for edge detect next tick
    for (const seat of this.seats) {
      seat.heldActionPrev = seat.heldAction;
    }

    return { snapshot: this.buildSnapshot(), events };
  }

  private surfaceMultipliers(seat: SeatRuntime): {
    friction: number;
    maxSpeed: number;
  } {
    if (!seat.body.grounded) return { friction: 1, maxSpeed: 1 };
    const { cell } = footCell(
      this.level,
      seat.body.x,
      seat.body.y,
      this.config.kinematics.halfH,
    );
    if (cell === "ice") return this.config.ice;
    if (cell === "sand") return this.config.sand;
    return { friction: 1, maxSpeed: 1 };
  }

  /** Read-only view for C-08 (ai-controller DESIGN §4). */
  buildAiWorldView(): AiWorldView {
    const freeTreasures = this.treasures
      .all()
      .filter((t) => t.state === "free")
      .map((t) => ({
        instanceId: t.instanceId,
        defId: t.defId,
        x: t.x,
        y: t.y,
        valueGp: t.valueGp,
        rarity: t.rarity,
      }));
    const switches = this.hazards.switches.map((s) => {
      const view: AiWorldView["switches"][number] = {
        switchId: s.switchId,
        x: s.x,
        y: s.y,
        kind: s.kind,
        pressed: s.pressed,
      };
      if (s.kind === "heavy") view.requiredMass = s.requiredMass;
      return view;
    });
    const exit = this.exitAABB;
    return {
      tick: this.tickCount,
      phase: this.phaseValue,
      levelId: this.level.id,
      blockSizePx: this.level.blockSizePx,
      haulers: this.seats.map((seat) => ({
        seatId: seat.seatId,
        control: seat.control,
        x: seat.body.x,
        y: seat.body.y,
        vx: seat.body.vx,
        vy: seat.body.vy,
        facing: seat.body.facing,
        grounded: seat.body.grounded,
        stunned: this.tickCount < seat.stunnedUntilTick,
        carryCount: seat.carryStack.length,
        carry: seat.carryStack.map((t) => ({
          instanceId: t.instanceId,
          defId: t.defId,
          valueGp: t.valueGp,
          rarity: t.rarity,
        })),
        weight: seat.weight,
        exited: seat.exited,
      })),
      freeTreasures,
      switches,
      exitX: exit.x + exit.width / 2,
      exitY: exit.y + exit.height / 2,
    };
  }

  private findTripTarget(attacker: SeatRuntime): SeatRuntime | undefined {
    const cfg = this.config;
    const ax = attacker.body.x;
    const ay = attacker.body.y;
    const facing = attacker.body.facing;

    for (const seat of this.seats) {
      if (seat.seatId === attacker.seatId) continue;
      if (seat.exited) continue;
      if (this.tickCount < seat.stunnedUntilTick) continue;
      const dx = seat.body.x - ax;
      const dy = seat.body.y - ay;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Must be in front and within reach
      if (dist <= cfg.tripReachPx && Math.sign(dx) === facing) {
        return seat;
      }
    }
    return undefined;
  }

  /** Stun a seat: set timer, spill all carried, emit events. */
  private stunSeat(
    seat: SeatRuntime,
    source: string,
    events: GameEvent[],
  ): void {
    if (this.tickCount < seat.stunnedUntilTick) return; // already stunned
    seat.stunnedUntilTick = this.tickCount + this.config.stunTicks;
    seat.pickupLockoutUntilTick =
      this.tickCount + this.config.pickupLockoutTicks;
    seat.stats.stunnedOrHurtCount++;

    events.push({ type: "stun", seatId: seat.seatId, source });

    // Spill all carried items
    if (seat.carryStack.length > 0) {
      const spilledItems = seat.carryStack.map((t) => ({
        instanceId: t.instanceId,
        defId: t.defId,
      }));
      const count = seat.carryStack.length;
      for (let i = 0; i < count; i++) {
        const t = seat.carryStack[i]!;
        // Scatter in a fan
        const angle =
          count === 1
            ? 0
            : ((i / (count - 1)) * Math.PI - Math.PI / 2);
        const speed =
          this.config.spillSpeedMin +
          this.rng.next() *
            (this.config.spillSpeedMax - this.config.spillSpeedMin);
        const vx = Math.cos(angle) * speed * (this.rng.next() > 0.5 ? 1 : -1);
        const vy = -Math.abs(Math.sin(angle) * speed) - 50; // always launch up
        this.treasures.release(
          t.instanceId,
          seat.body.x,
          seat.body.y - this.config.kinematics.halfH,
          vx,
          vy,
        );
        seat.stats.treasureLostCount++;
      }
      seat.carryStack = [];
      seat.weight = 0;

      events.push({
        type: "spill",
        seatId: seat.seatId,
        items: spilledItems,
      });
    }
  }

  private checkHazards(seat: SeatRuntime, events: GameEvent[]): void {
    const b = seat.body;
    const bs = this.level.blockSizePx;
    const kin = this.config.kinematics;

    // Floor trap (spikes): hauler grounded on a trap cell (sample one px below feet)
    if (b.grounded) {
      const { cx, cy } = footCell(this.level, b.x, b.y, kin.halfH);
      const trap = this.hazards.floorTrapAt(cx, cy);
      if (trap) {
        seat.stats.trapsHit++;
        events.push({
          type: "trap_trigger",
          trapId: trap.trapId,
          kind: trap.kind,
        });
        this.stunSeat(seat, `trap:${trap.kind}`, events);
      }
    }

    // Zone traps (lightning cycle)
    const minX = b.x - kin.halfW;
    const minY = b.y - kin.halfH;
    const maxX = b.x + kin.halfW;
    const maxY = b.y + kin.halfH;
    const zoneTraps = this.hazards.zoneTrapsOverlapping(
      minX,
      minY,
      maxX,
      maxY,
      bs,
    );
    for (const trap of zoneTraps) {
      seat.stats.trapsHit++;
      events.push({
        type: "trap_trigger",
        trapId: trap.trapId,
        kind: trap.kind,
      });
      this.stunSeat(seat, `trap:${trap.kind}`, events);
      break; // one stun per tick
    }
  }

  private checkSwitches(seat: SeatRuntime, events: GameEvent[]): void {
    if (!seat.body.grounded) return;
    const kin = this.config.kinematics;
    const { cx: footCx, cy: footCy } = footCell(
      this.level,
      seat.body.x,
      seat.body.y,
      kin.halfH,
    );

    const sw = this.hazards.switchAt(footCx, footCy);
    if (!sw) return;

    if (sw.kind === "heavy") {
      // Sum mass of all haulers whose feet sample this cell
      let totalMass = 0;
      for (const s of this.seats) {
        if (!s.body.grounded) continue;
        const foot = footCell(this.level, s.body.x, s.body.y, kin.halfH);
        if (foot.cx === footCx && foot.cy === footCy) {
          totalMass += 1 + s.weight; // base mass 1 per hauler + treasure weight
        }
      }
      if (totalMass >= sw.requiredMass && !sw.pressed) {
        sw.pressed = true;
        events.push({
          type: "switch",
          switchId: sw.switchId,
          pressed: true,
        });
      }
    } else {
      if (!sw.pressed) {
        sw.pressed = true;
        events.push({
          type: "switch",
          switchId: sw.switchId,
          pressed: true,
        });
      }
    }
  }

  private checkExit(seat: SeatRuntime, events: GameEvent[]): void {
    const b = seat.body;
    const kin = this.config.kinematics;
    const exit = this.exitAABB;

    // AABB overlap check
    const hMinX = b.x - kin.halfW;
    const hMinY = b.y - kin.halfH;
    const hMaxX = b.x + kin.halfW;
    const hMaxY = b.y + kin.halfH;

    if (
      hMaxX > exit.x &&
      hMinX < exit.x + exit.width &&
      hMaxY > exit.y &&
      hMinY < exit.y + exit.height
    ) {
      seat.exited = true;
      this.exitCounter++;
      seat.exitOrder = this.exitCounter;

      // First/last tracking
      if (this.exitCounter === 1) {
        seat.stats.exitsFirstCount++;
      }
      // Last exit tracked when level completes (deferred)

      events.push({
        type: "level_exit",
        seatId: seat.seatId,
        order: this.exitCounter,
      });
    }
  }

  buildSnapshot(): WorldSnapshot {
    const lastProcessedInputSeq: { [seatId: number]: number } = {};
    const haulers: HaulerPublic[] = this.seats.map((seat) => {
      lastProcessedInputSeq[seat.seatId] = seat.lastProcessedSeq;
      const b = seat.body;
      const isStunned = this.tickCount < seat.stunnedUntilTick;
      let anim: string;
      if (isStunned) {
        anim = "stunned";
      } else if (seat.heldAxisY === 1 && b.grounded) {
        anim = "duck";
      } else if (b.grounded) {
        anim = Math.abs(b.vx) > 1 ? "run" : "idle";
      } else {
        anim = b.vy < 0 ? "jump" : "falling";
      }

      const hauler: HaulerPublic = {
        seatId: seat.seatId,
        character: seat.character,
        control: seat.control,
        x: round2(b.x),
        y: round2(b.y),
        vx: round2(b.vx),
        vy: round2(b.vy),
        facing: b.facing,
        anim: anim as HaulerPublic["anim"],
        carry: seat.carryStack.map(carriedRef),
        stunned: isStunned,
      };
      if (seat.displayName !== undefined) hauler.name = seat.displayName;
      return hauler;
    });
    return {
      tick: this.tickCount,
      phase: this.phaseValue,
      levelId: this.level.id,
      levelsCompleted: this.levelsCompletedCount,
      levelsAfterHoard: this.config.levelsAfterHoard,
      lastProcessedInputSeq,
      haulers,
      treasures: this.treasures.toPublic(),
      traps: this.hazards.trapsPublic(),
      switches: this.hazards.switchesPublic(),
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
    carryCount: number;
    weight: number;
    stunned: boolean;
    exited: boolean;
    exitOrder: number;
    stats: Readonly<PlayerStats>;
  } {
    const seat = this.seats[seatId];
    if (!seat) throw new Error(`bad seatId ${seatId}`);
    return {
      control: seat.control,
      connected: seat.connected,
      body: seat.body,
      lastProcessedSeq: seat.lastProcessedSeq,
      carryCount: seat.carryStack.length,
      weight: seat.weight,
      stunned: this.tickCount < seat.stunnedUntilTick,
      exited: seat.exited,
      exitOrder: seat.exitOrder,
      stats: seat.stats,
    };
  }

  /** Treasure conservation ledger for invariant tests. */
  treasureLedger() {
    return this.treasures.ledger();
  }

  /** Whether all haulers have exited the level. */
  isLevelComplete(): boolean {
    return this.levelComplete;
  }

  /**
   * Test helper: place a free treasure at world px. Production levels only
   * spawn via seeded slots on load.
   */
  spawnTestTreasure(defId: string, x: number, y: number): string {
    return this.treasures.spawnAt(defId, x, y).instanceId;
  }

  /** Test helper: force-stun a seat (spikes path without a trap cell). */
  debugStun(seatId: SeatId): GameEvent[] {
    const seat = this.seats[seatId];
    if (!seat) return [];
    const events: GameEvent[] = [];
    this.stunSeat(seat, "debug", events);
    return events;
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
