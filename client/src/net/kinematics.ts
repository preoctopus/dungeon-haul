/**
 * Pure hauler movement kinematics — P2 subset (run / jump / air-steer /
 * gravity / AABB vs solid grid). No treasure, traps, encumbrance, or
 * surface-friction variants yet.
 *
 * VERBATIM COPY of server/src/sim/kinematics.ts (prediction parity, per
 * netcode-client DESIGN §8.1 / §16 — extraction into a shared package is a
 * P3+ cleanup). Edit the server file first, then re-copy. Dependency-free.
 *
 * Coordinates: world pixels, y-down (docs/interfaces/level-format.md).
 * Fixed timestep only — dt comes from config, never wall clock.
 */

/** All tunable movement constants live here (simulation DESIGN §5.2). */
export interface KinematicsConfig {
  /** Fixed physics timestep in seconds (1 / tickRate). */
  dt: number;
  /** Hauler AABB half extents in px. */
  halfW: number;
  halfH: number;
  /** Ground run acceleration px/s². */
  runAccel: number;
  /** Airborne steer acceleration px/s² (reduced vs ground). */
  airAccel: number;
  /** Ground deceleration toward 0 when no input, px/s². */
  groundFriction: number;
  /** Max horizontal speed px/s. */
  maxSpeed: number;
  /** Gravity px/s² (positive = down). */
  gravity: number;
  /** Terminal fall speed px/s. */
  maxFallSpeed: number;
  /** Upward jump impulse magnitude px/s. */
  jumpSpeed: number;
  /** Jump input buffered for this many steps while airborne. */
  jumpBufferSteps: number;
}

export const DEFAULT_KINEMATICS: KinematicsConfig = {
  dt: 1 / 30,
  halfW: 12,
  halfH: 14,
  runAccel: 1400,
  airAccel: 700,
  groundFriction: 1800,
  maxSpeed: 160,
  gravity: 1500,
  maxFallSpeed: 540,
  jumpSpeed: 430,
  jumpBufferSteps: 3,
};

/** Mutable hauler body state advanced by {@link stepHauler}. */
export interface HaulerBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  grounded: boolean;
  facing: 1 | -1;
  /** Previous step's jump level, for edge detection. */
  jumpHeld: boolean;
  /** Remaining buffered-jump steps (0 = none pending). */
  jumpBuffer: number;
}

export function createBody(x: number, y: number): HaulerBody {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    grounded: false,
    facing: 1,
    jumpHeld: false,
    jumpBuffer: 0,
  };
}

/** Movement-relevant slice of an InputCommand (levels, not edges). */
export interface MoveInput {
  moveX: -1 | 0 | 1;
  jump: boolean;
}

export const NEUTRAL_INPUT: MoveInput = { moveX: 0, jump: false };

/** Solid-cell query the physics needs; out-of-bounds must read as solid. */
export interface SolidGrid {
  blockSizePx: number;
  widthCells: number;
  heightCells: number;
  isSolid(cx: number, cy: number): boolean;
}

const EPS = 0.001;

function overlapsSolid(
  grid: SolidGrid,
  x: number,
  y: number,
  cfg: KinematicsConfig,
): boolean {
  const bs = grid.blockSizePx;
  const x0 = Math.floor((x - cfg.halfW) / bs);
  const x1 = Math.floor((x + cfg.halfW - EPS) / bs);
  const y0 = Math.floor((y - cfg.halfH) / bs);
  const y1 = Math.floor((y + cfg.halfH - EPS) / bs);
  for (let cy = y0; cy <= y1; cy++) {
    for (let cx = x0; cx <= x1; cx++) {
      if (
        cx < 0 ||
        cy < 0 ||
        cx >= grid.widthCells ||
        cy >= grid.heightCells ||
        grid.isSolid(cx, cy)
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Axis-separated, sub-stepped move. Sub-steps never exceed half a block so a
 * body cannot tunnel through a one-cell wall/floor at any legal speed.
 * On hit, snaps flush to the colliding cell face and zeroes the axis velocity.
 * Returns true if the axis collided.
 */
function moveAxis(
  body: HaulerBody,
  grid: SolidGrid,
  cfg: KinematicsConfig,
  axis: "x" | "y",
  delta: number,
): boolean {
  if (delta === 0) return false;
  const bs = grid.blockSizePx;
  const maxStep = bs / 2;
  const sign = Math.sign(delta);
  let remaining = Math.abs(delta);
  while (remaining > 0) {
    const step = Math.min(remaining, maxStep);
    remaining -= step;
    body[axis] += step * sign;
    if (overlapsSolid(grid, body.x, body.y, cfg)) {
      if (axis === "x") {
        if (sign > 0) {
          const col = Math.floor((body.x + cfg.halfW - EPS) / bs);
          body.x = col * bs - cfg.halfW - EPS;
        } else {
          const col = Math.floor((body.x - cfg.halfW) / bs);
          body.x = (col + 1) * bs + cfg.halfW + EPS;
        }
        body.vx = 0;
      } else {
        if (sign > 0) {
          const row = Math.floor((body.y + cfg.halfH - EPS) / bs);
          body.y = row * bs - cfg.halfH - EPS;
        } else {
          const row = Math.floor((body.y - cfg.halfH) / bs);
          body.y = (row + 1) * bs + cfg.halfH + EPS;
        }
        body.vy = 0;
      }
      return true;
    }
  }
  return false;
}

function moveToward(value: number, target: number, maxDelta: number): number {
  if (value < target) return Math.min(value + maxDelta, target);
  return Math.max(value - maxDelta, target);
}

/**
 * Advance one fixed step. Deterministic given (body, input, grid, cfg).
 * Jump uses edge detection (`input.jump` transition false→true) with a short
 * buffer so presses just before landing still fire (input-commands.md:
 * "Jump edge triggers once per press cycle").
 */
export function stepHauler(
  body: HaulerBody,
  input: MoveInput,
  grid: SolidGrid,
  cfg: KinematicsConfig,
): void {
  // Jump edge → buffer.
  if (input.jump && !body.jumpHeld) {
    body.jumpBuffer = cfg.jumpBufferSteps;
  }
  body.jumpHeld = input.jump;

  // Horizontal accel / friction.
  if (input.moveX !== 0) {
    const accel = body.grounded ? cfg.runAccel : cfg.airAccel;
    body.vx = moveToward(body.vx, input.moveX * cfg.maxSpeed, accel * cfg.dt);
    body.facing = input.moveX;
  } else if (body.grounded) {
    body.vx = moveToward(body.vx, 0, cfg.groundFriction * cfg.dt);
  }

  // Jump consume + gravity.
  if (body.grounded && body.jumpBuffer > 0) {
    body.vy = -cfg.jumpSpeed;
    body.grounded = false;
    body.jumpBuffer = 0;
  } else if (body.jumpBuffer > 0) {
    body.jumpBuffer -= 1;
  }
  body.vy = Math.min(body.vy + cfg.gravity * cfg.dt, cfg.maxFallSpeed);

  // Integrate with collision.
  moveAxis(body, grid, cfg, "x", body.vx * cfg.dt);
  const hitY = moveAxis(body, grid, cfg, "y", body.vy * cfg.dt);
  // Landed if the vertical move hit while descending; otherwise airborne
  // (gravity guarantees vy > 0 on any tick that did not end on a floor).
  body.grounded = hitY && body.vy === 0 && overlapsSolid(grid, body.x, body.y + 1, cfg);
}
