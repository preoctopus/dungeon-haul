import { beforeEach, describe, expect, it } from "vitest";
import { KeyboardInputMapper } from "../src/net/inputMapper.js";

class FakeWindow {
  private handlers = new Map<string, ((e: unknown) => void)[]>();
  addEventListener(type: string, fn: (e: unknown) => void): void {
    const arr = this.handlers.get(type) ?? [];
    arr.push(fn);
    this.handlers.set(type, arr);
  }
  fire(type: string, e: unknown): void {
    for (const fn of this.handlers.get(type) ?? []) fn(e);
  }
}

let win: FakeWindow;
let mapper: KeyboardInputMapper;

beforeEach(() => {
  win = new FakeWindow();
  mapper = new KeyboardInputMapper();
  mapper.attach(win as unknown as Window);
});

describe("KeyboardInputMapper", () => {
  it("maps arrows/Z/X into a normalized InputCommand with monotonic seq", () => {
    win.fire("keydown", { code: "ArrowRight" });
    win.fire("keydown", { code: "KeyZ" });
    const c1 = mapper.sample();
    expect(c1).toMatchObject({ seq: 1, axes: { x: 1, y: 0 }, jump: true, action: false });
    win.fire("keyup", { code: "ArrowRight" });
    win.fire("keydown", { code: "KeyX" });
    const c2 = mapper.sample();
    expect(c2).toMatchObject({ seq: 2, axes: { x: 0 }, action: true });
  });

  it("cancels opposing axis keys to 0", () => {
    win.fire("keydown", { code: "ArrowLeft" });
    win.fire("keydown", { code: "ArrowRight" });
    expect(mapper.sample().axes.x).toBe(0);
  });

  it("resetSeq restarts the sequence (reused on re-welcome)", () => {
    mapper.sample();
    mapper.sample();
    mapper.resetSeq();
    expect(mapper.sample().seq).toBe(1);
  });

  it("blur clears held keys", () => {
    win.fire("keydown", { code: "ArrowLeft" });
    win.fire("blur", {});
    expect(mapper.sample().axes.x).toBe(0);
  });
});
