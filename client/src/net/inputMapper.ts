/**
 * C-03 Input Mapper (P2 keyboard subset): arrows/WASD move, Z jump (A),
 * X action (B), Enter start. Produces the normalized InputCommand with a
 * per-seat monotonic seq (input-commands.md).
 */

import type { AxisValue, InputCommand } from "@dhaul/protocol";

const KEY_LEFT = new Set(["ArrowLeft", "KeyA"]);
const KEY_RIGHT = new Set(["ArrowRight", "KeyD"]);
const KEY_UP = new Set(["ArrowUp", "KeyW"]);
const KEY_DOWN = new Set(["ArrowDown", "KeyS"]);
const KEY_JUMP = new Set(["KeyZ", "Space"]);
const KEY_ACTION = new Set(["KeyX"]);
const KEY_START = new Set(["Enter"]);

export class KeyboardInputMapper {
  private readonly down = new Set<string>();
  private seq = 0;

  private readonly onKeyDown = (e: KeyboardEvent): void => {
    this.down.add(e.code);
  };
  private readonly onKeyUp = (e: KeyboardEvent): void => {
    this.down.delete(e.code);
  };

  attach(target: Window): void {
    target.addEventListener("keydown", this.onKeyDown);
    target.addEventListener("keyup", this.onKeyUp);
    target.addEventListener("blur", () => this.down.clear());
  }

  /** Reset seq coordination on (re)welcome (DESIGN §3.2). */
  resetSeq(): void {
    this.seq = 0;
  }

  private axis(neg: Set<string>, pos: Set<string>): AxisValue {
    const n = [...neg].some((k) => this.down.has(k));
    const p = [...pos].some((k) => this.down.has(k));
    if (n === p) return 0;
    return p ? 1 : -1;
  }

  private has(keys: Set<string>): boolean {
    return [...keys].some((k) => this.down.has(k));
  }

  /** Sample current levels into a command (call once per send tick). */
  sample(): InputCommand {
    return {
      seq: ++this.seq,
      axes: {
        x: this.axis(KEY_LEFT, KEY_RIGHT),
        y: this.axis(KEY_UP, KEY_DOWN),
      },
      jump: this.has(KEY_JUMP),
      action: this.has(KEY_ACTION),
      start: this.has(KEY_START),
    };
  }
}
