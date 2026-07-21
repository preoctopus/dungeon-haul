/**
 * Normalized player input command — identical shape for humans and AI.
 * Source of truth: docs/interfaces/input-commands.md
 */

export type AxisValue = -1 | 0 | 1;

export interface InputCommand {
  /** Per-seat monotonic; client-assigned. */
  seq: number;
  clientTick?: number;
  axes: {
    /** Run / steer / menu left-right. */
    x: AxisValue;
    /** Duck/pickup (down), throw aim up, fork select, name entry. */
    y: AxisValue;
  };
  /** A held or pressed — server uses edge detect. */
  jump: boolean;
  /** B. */
  action: boolean;
  /** Start / pause / skip. */
  start: boolean;
  /** Optional Select. */
  select?: boolean;
}
