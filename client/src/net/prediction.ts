/**
 * C-04 local prediction + reconciliation (netcode-client DESIGN §8).
 * Pure module (no Phaser/DOM) so it unit-tests in Node.
 *
 * Predicts the LOCAL hauler only: x movement + jump against the level's
 * solid grid, using the same kinematics step as the server. On every
 * snapshot, drops acked inputs (`lastProcessedInputSeq`), rebases the body
 * from server truth and replays the remaining pending inputs.
 */

import type { HaulerPublic, InputCommand, WorldSnapshot } from "@dhaul/protocol";
import {
  createBody,
  stepHauler,
  type HaulerBody,
  type KinematicsConfig,
  type MoveInput,
  type SolidGrid,
} from "./kinematics.js";

const MAX_PENDING = 128; // ~4s at 30 Hz (DESIGN §8.2)

export class LocalPredictor {
  private readonly pending: InputCommand[] = [];
  private body: HaulerBody;
  /** Jump level of the last server-acked command (for replay edge detect). */
  private lastAckedJump = false;

  constructor(
    private readonly grid: SolidGrid,
    private readonly cfg: KinematicsConfig,
    readonly seatId: number,
  ) {
    this.body = createBody(0, 0);
  }

  /** Record + apply one sent command (call once per send tick). */
  predict(cmd: InputCommand): void {
    this.pending.push(cmd);
    if (this.pending.length > MAX_PENDING) this.pending.shift();
    stepHauler(this.body, toMove(cmd), this.grid, this.cfg);
  }

  /**
   * Reconcile against an authoritative snapshot (DESIGN §8.4):
   * drop acked inputs, rebase from server hauler, replay the rest.
   */
  reconcile(snapshot: WorldSnapshot): void {
    const me = snapshot.haulers.find((h) => h.seatId === this.seatId);
    if (!me) return;
    const ack = snapshot.lastProcessedInputSeq[this.seatId] ?? 0;
    while (this.pending.length > 0 && this.pending[0]!.seq <= ack) {
      this.lastAckedJump = this.pending.shift()!.jump;
    }
    this.body = rebase(me, this.lastAckedJump);
    for (const cmd of this.pending) {
      stepHauler(this.body, toMove(cmd), this.grid, this.cfg);
    }
  }

  /** Displayed local transform (post-predict). */
  get state(): Readonly<HaulerBody> {
    return this.body;
  }

  get pendingCount(): number {
    return this.pending.length;
  }
}

function toMove(cmd: InputCommand): MoveInput {
  return { moveX: cmd.axes.x, jump: cmd.jump };
}

/** Server truth for position/velocity; edge-detect resumes from acked jump level. */
function rebase(server: HaulerPublic, jumpHeld: boolean): HaulerBody {
  return {
    x: server.x,
    y: server.y,
    vx: server.vx,
    vy: server.vy,
    facing: server.facing,
    grounded: server.anim !== "jump" && server.anim !== "falling",
    jumpHeld,
    jumpBuffer: 0,
  };
}
