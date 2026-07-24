/**
 * C-10 Fork Vote Subsystem — pure unit tests for `pickForkPair` and
 * `ForkVoteModule` (fork-vote DESIGN.md §16 test table).
 */
import { describe, expect, it } from "vitest";
import type { InputCommand, SeatId } from "@dhaul/protocol";
import {
  DEFAULT_FORK_CONFIG,
  ForkVoteModule,
  pickForkPair,
  type ForkLevelMeta,
  type ForkOpenContext,
  type Rng,
} from "../../src/sim/fork.js";

function seqRng(values: number[]): Rng {
  let i = 0;
  return { next: () => values[i++ % values.length]! };
}

function cyclingRng(seed: number): Rng {
  let state = seed >>> 0;
  return {
    next(): number {
      state = (state * 1103515245 + 12345) >>> 0;
      return state / 4294967296;
    },
  };
}

function inputCmd(over: Partial<InputCommand> = {}): InputCommand {
  return {
    seq: 1,
    axes: { x: 0, y: 0 },
    jump: false,
    action: false,
    start: false,
    ...over,
  };
}

const LEVEL_META: ForkLevelMeta = { biome: "dungeon", displayName: "Test" };
const levelMeta = (): ForkLevelMeta => LEVEL_META;

function seats(ids: SeatId[], control: "human" | "ai" = "human"): ForkOpenContext["seats"] {
  return ids.map((seatId) => ({ seatId, control }));
}

describe("pickForkPair", () => {
  it("is deterministic for a given rng stream", () => {
    const pool = ["a", "b", "c", "d"];
    const played = new Set<string>();
    expect(pickForkPair(pool, played, cyclingRng(7))).toEqual(
      pickForkPair(pool, played, cyclingRng(7)),
    );
  });

  it("excludes already-played levels when 2+ unplayed remain", () => {
    const pool = ["a", "b", "c", "d"];
    const played = new Set(["a", "b"]);
    const [x, y] = pickForkPair(pool, played, cyclingRng(3));
    expect([x, y].sort()).toEqual(["c", "d"]);
  });

  it("pairs the sole unplayed level with a random played one when exactly one remains", () => {
    const pool = ["a", "b", "c"];
    const played = new Set(["a", "b"]);
    const [x, y] = pickForkPair(pool, played, cyclingRng(9));
    expect([x, y]).toContain("c");
    expect([x, y].every((id) => pool.includes(id))).toBe(true);
    expect(x).not.toBe(y);
  });

  it("reshuffles the full pool once every level has been played (exhaustion fallback)", () => {
    const pool = ["a", "b", "c"];
    const played = new Set(["a", "b", "c"]);
    const [x, y] = pickForkPair(pool, played, cyclingRng(11));
    expect(x).not.toBe(y);
    expect(pool).toContain(x);
    expect(pool).toContain(y);
  });

  it("duplicates the sole level in a degenerate single-level pool", () => {
    const [x, y] = pickForkPair(["only"], new Set(), cyclingRng(1));
    expect(x).toBe("only");
    expect(y).toBe("only");
  });
});

describe("ForkVoteModule", () => {
  it("resolves by majority once the window elapses", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 3 });
    mod.open({
      tick: 0,
      seats: seats([0, 1, 2, 3]),
      rng: cyclingRng(5),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    mod.applyForkInput(0, inputCmd({ axes: { x: 0, y: -1 }, action: true }), 1); // select A, pulse
    mod.applyForkInput(1, inputCmd({ axes: { x: 0, y: -1 }, action: true }), 1); // select A, pulse
    mod.applyForkInput(2, inputCmd({ axes: { x: 0, y: 1 }, jump: true }), 1); // select B, pulse
    const { resolved } = mod.tick(3);
    expect(resolved?.winningOptionId).toBe("A");
    expect(resolved?.reason).toBe("majority");
    expect(resolved?.tallies).toEqual({ A: 2, B: 1 });
  });

  it("ties resolve via selection plurality when tallies are equal", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 1 });
    mod.open({
      tick: 0,
      seats: seats([0, 1]),
      rng: cyclingRng(2),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    mod.forceTallies(2, 2);
    // Both seats still default to selection "A" → plurality A=2 (of 4), B=0.
    const { resolved } = mod.tick(1);
    expect(resolved?.winningOptionId).toBe("A");
    expect(resolved?.reason).toBe("tie_break");
  });

  it("falls back to seeded rng when tallies and selection plurality are both tied", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 1 });
    mod.open({
      tick: 0,
      seats: seats([0, 1, 2, 3]),
      rng: seqRng([0.9]), // >= 0.5 -> "B"
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    mod.applyForkInput(0, inputCmd({ axes: { x: 0, y: -1 } }), 0); // A
    mod.applyForkInput(1, inputCmd({ axes: { x: 0, y: -1 } }), 0); // A
    mod.applyForkInput(2, inputCmd({ axes: { x: 0, y: 1 } }), 0); // B
    mod.applyForkInput(3, inputCmd({ axes: { x: 0, y: 1 } }), 0); // B
    mod.forceTallies(0, 0);
    const { resolved } = mod.tick(1);
    expect(resolved?.reason).toBe("tie_break");
    expect(resolved?.winningOptionId).toBe("B");
  });

  it("counts only the rising edge of an argue press, not every held tick", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 10 });
    mod.open({
      tick: 0,
      seats: seats([0]),
      rng: cyclingRng(1),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    mod.applyForkInput(0, inputCmd({ action: true }), 1); // press → edge
    mod.applyForkInput(0, inputCmd({ action: true }), 2); // still held → no new edge
    mod.applyForkInput(0, inputCmd({ action: false }), 3); // release
    mod.applyForkInput(0, inputCmd({ action: true }), 4); // re-press → edge
    const state = mod.getPublicState();
    expect(state.tallies.A + state.tallies.B).toBe(2);
  });

  it("prioritizes axes.y over axes.x when both are nonzero", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 5 });
    mod.open({
      tick: 0,
      seats: seats([0]),
      rng: cyclingRng(1),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    // x says A (-1), y says B (1) → y wins.
    mod.applyForkInput(0, inputCmd({ axes: { x: -1, y: 1 }, action: true }), 1);
    const state = mod.getPublicState();
    expect(state.tallies).toEqual({ A: 0, B: 1 });
  });

  it("drives AI seats with the mild fallback switch/pulse policy", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 100 });
    mod.open({
      tick: 0,
      seats: seats([0], "ai"),
      rng: cyclingRng(1),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    // First call: uninitialized → pick(<0.5="A"). Second call: pulse check (<0.25=pulse).
    mod.driveAiSeat(0, seqRng([0.4, 0.1]));
    const state = mod.getPublicState();
    expect(state.tallies).toEqual({ A: 1, B: 0 });
  });

  it("does not pause the window when seats never provide input (Q10-A no pause)", () => {
    const mod = new ForkVoteModule({ ...DEFAULT_FORK_CONFIG, windowTicks: 3 });
    mod.open({
      tick: 5,
      seats: seats([0]),
      rng: cyclingRng(1),
      playedLevelIds: new Set(),
      pool: ["a", "b"],
      levelMeta,
    });
    expect(mod.isActive()).toBe(true);
    mod.tick(6);
    mod.tick(7);
    expect(mod.isActive()).toBe(true);
    const { resolved } = mod.tick(8);
    expect(resolved).toBeDefined();
    expect(mod.isActive()).toBe(false);
  });
});
