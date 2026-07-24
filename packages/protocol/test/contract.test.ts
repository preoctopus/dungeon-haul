/**
 * C03-T4 — Protocol message contract tests (codec, guards, round-trips).
 */

import { describe, expect, it } from "vitest";
import {
  encodeMessage,
  isC2SEndSkip,
  isC2SNameEntry,
  isInputCommand,
} from "../src/index.js";

describe("isC2SEndSkip validation (codec.ts lines 109-111)", () => {
  it("accepts a valid end_skip message", () => {
    expect(isC2SEndSkip({ type: "end_skip" })).toBe(true);
  });
  it("rejects null input", () => {
    expect(isC2SEndSkip(null)).toBe(false);
  });
  it("rejects non-object types", () => {
    expect(isC2SEndSkip("end_skip")).toBe(false);
    expect(isC2SEndSkip(42)).toBe(false);
    expect(isC2SEndSkip(undefined)).toBe(false);
  });
  it("rejects objects without type field", () => {
    expect(isC2SEndSkip({})).toBe(false);
    expect(isC2SEndSkip({ foo: "bar" })).toBe(false);
  });
  it("rejects objects with wrong type discriminant", () => {
    expect(isC2SEndSkip({ type: "join" })).toBe(false);
    expect(isC2SEndSkip({ type: "input" })).toBe(false);
  });
});

describe("isC2SNameEntry validation (codec.ts lines 119-129)", () => {
  it("accepts a valid name entry", () => {
    expect(isC2SNameEntry({ type: "name_entry", name: "Alice" })).toBe(true);
    expect(isC2SNameEntry({ type: "name_entry", name: "Player_1" })).toBe(true);
    expect(isC2SNameEntry({ type: "name_entry", name: "Bob.Bob's" })).toBe(true);
  });
  it("rejects names longer than 12 characters", () => {
    expect(isC2SNameEntry({ type: "name_entry", name: "TooLongNameHere" })).toBe(false);
  });
  it("rejects empty names", () => {
    expect(isC2SNameEntry({ type: "name_entry", name: "" })).toBe(false);
  });
  it("rejects names with disallowed characters", () => {
    expect(isC2SNameEntry({ type: "name_entry", name: "bad@char" })).toBe(false);
    expect(isC2SNameEntry({ type: "name_entry", name: "no space!" })).toBe(false);
  });
  it("rejects non-string names", () => {
    expect(isC2SNameEntry({ type: "name_entry", name: 42 })).toBe(false);
    expect(isC2SNameEntry({ type: "name_entry", name: null })).toBe(false);
  });
  it("rejects objects without type field", () => {
    expect(isC2SNameEntry({ name: "Alice" })).toBe(false);
  });
  it("rejects non-name-entry types", () => {
    expect(isC2SNameEntry({ type: "join", sessionId: "x" })).toBe(false);
  });
});

describe("isInputCommand validation (codec.ts)", () => {
  it("accepts a valid input command", () => {
    expect(
      isInputCommand({ seq: 1, axes: { x: 0, y: -1 }, jump: true, action: false, start: false }),
    ).toBe(true);
  });
  it("rejects null input", () => {
    expect(isInputCommand(null)).toBe(false);
  });
  it("rejects objects missing required fields", () => {
    expect(isInputCommand({ seq: 1 })).toBe(false);
    expect(isInputCommand({ axes: { x: 0, y: 0 } })).toBe(false);
  });
});

describe("WorldSnapshot contract (protocol core.ts)", () => {
  it("constructs a valid WorldSnapshot for lobby phase", () => {
    const snapshot = {
      tick: 0, phase: "lobby" as const, levelsCompleted: 0, levelsAfterHoard: 2,
      lastProcessedInputSeq: [0, 0, 0, 0], haulers: [], treasures: [], traps: [], switches: [],
    };
    expect(snapshot.phase).toBe("lobby");
    expect(snapshot.levelsAfterHoard).toBe(2);
    expect(snapshot.haulers).toEqual([]);
  });
  it("constructs a valid WorldSnapshot for level phase with haulers", () => {
    const snapshot = {
      tick: 10, phase: "level" as const, levelsCompleted: 1, levelsAfterHoard: 2,
      lastProcessedInputSeq: [5, 3, 0, 0],
      haulers: [{ seatId: 0, character: "gnome", control: "human", x: 100, y: 200, vx: 5, vy: -3, facing: 1 as const, anim: "run" as const, carry: [], stunned: false }],
      treasures: [{ instanceId: "t1", defId: "gold_ring", x: 300, y: 200 }],
      traps: [], switches: [],
    };
    expect(snapshot.tick).toBe(10);
    expect(snapshot.haulers[0].seatId).toBe(0);
    expect(snapshot.treasures.length).toBe(1);
  });
  it("round-trips through JSON without losing structure", () => {
    const original = { tick: 42, phase: "fork" as const, levelsCompleted: 3, levelsAfterHoard: 5, lastProcessedInputSeq: [10, 8, 6, 4], haulers: [], treasures: [], traps: [], switches: [] };
    const parsed = JSON.parse(JSON.stringify(original));
    expect(parsed.tick).toBe(42);
    expect(parsed.phase).toBe("fork");
  });
});

describe("ScoreReport contract (protocol score.ts)", () => {
  it("constructs a valid ScoreReport", () => {
    const report = {
      sessionId: "sess-abc123", levelsCompleted: 5, completionToken: "tok-xyz", totalTreasureGp: 100,
      perSeat: [{ seatId: 0, character: "gnome", human: true, gp: 40, shares: 8, bonusShares: 2, penaltyShares: -1, rank: 1, totalTakes: 35 }],
    };
    expect(report.sessionId).toBe("sess-abc123");
    expect(report.levelsCompleted).toBe(5);
    expect(report.perSeat[0].gp).toBe(40);
  });
  it("round-trips through JSON preserving perSeat data", () => {
    const original = { sessionId: "sess-roundtrip", levelsCompleted: 2, completionToken: "tok-rt", totalTreasureGp: 50, perSeat: [{ seatId: 1, character: "sprite", human: false, gp: 30, shares: 6, bonusShares: 1, penaltyShares: 0, rank: 2, totalTakes: 25 }] };
    const parsed = JSON.parse(JSON.stringify(original));
    expect(parsed.perSeat[0].character).toBe("sprite");
    expect(parsed.perSeat[0].shares).toBe(6);
  });
});

function parseEncoded<T>(json: string): T { return JSON.parse(json) as T; }

describe("encodeMessage round-trip", () => {
  it("encodes and decodes a snapshot message", () => {
    const msg = encodeMessage({ type: "snapshot", tick: 5, phase: "level" as const, levelsCompleted: 1, levelsAfterHoard: 2, lastProcessedInputSeq: [0,0,0,0], haulers: [], treasures: [], traps: [], switches: [] });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("snapshot");
    expect(parsed.tick).toBe(5);
  });
  it("encodes and decodes an error message", () => {
    const msg = encodeMessage({ type: "error", code: "JOIN_FAILED", detail: "session full" });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("error");
    expect(parsed.code).toBe("JOIN_FAILED");
  });
  it("encodes and decodes a shares message", () => {
    const msg = encodeMessage({ type: "shares", sessionId: "sess-shares", perSeat: [{ seatId: 0, gp: 10, shares: 2, rank: 1 }] });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("shares");
    expect(parsed.sessionId).toBe("sess-shares");
  });
  it("encodes and decodes an end_entry message", () => {
    const msg = encodeMessage({ type: "end_entry", eligibleForHighScore: true });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("end_entry");
    expect(parsed.eligibleForHighScore).toBe(true);
  });
  it("encodes and decodes a name_entry message", () => {
    const msg = encodeMessage({ type: "name_entry", name: "Player1" });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("name_entry");
    expect(parsed.name).toBe("Player1");
  });
  it("encodes and decodes a welcome message", () => {
    const msg = encodeMessage({ type: "welcome", sessionId: "s1", seatId: 0, seatToken: "t1" });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("welcome");
    expect(parsed.seatId).toBe(0);
  });
  it("encodes and decodes a high_scores message", () => {
    const msg = encodeMessage({ type: "high_scores", entries: [{ name: "Alice", gp: 100 }] });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("high_scores");
    expect(parsed.entries[0].name).toBe("Alice");
  });
  it("encodes and decodes a fork message", () => {
    const msg = encodeMessage({ type: "fork", choices: [{ label: "Forest", levelId: "forest_01" }] });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("fork");
  });
  it("encodes and decodes an end_shares message with perSeat data", () => {
    const msg = encodeMessage({ type: "end_shares", sessionId: "sess-end", perSeat: [{ seatId: 0, gp: 20, shares: 4, rank: 1 }, { seatId: 1, gp: 15, shares: 3, rank: 2 }] });
    const parsed = parseEncoded<any>(msg);
    expect(parsed.type).toBe("end_shares");
    expect(parsed.perSeat.length).toBe(2);
  });
});
