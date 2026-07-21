import { describe, expect, it } from "vitest";
import {
  isC2SMessage,
  isS2CMessage,
  protocolVersion,
  type C2S_Join,
  type InputCommand,
  type WorldSnapshot,
} from "../src/index.js";

describe("@dhaul/protocol", () => {
  it("exports protocolVersion = 1", () => {
    expect(protocolVersion).toBe(1);
  });

  it("guards C2S messages by type discriminant", () => {
    const join: C2S_Join = {
      type: "join",
      protocolVersion,
      sessionId: "s1",
      seatToken: "t1",
    };
    expect(isC2SMessage(join)).toBe(true);
    expect(isC2SMessage({ type: "welcome" })).toBe(false);
    expect(isC2SMessage(null)).toBe(false);
    expect(isC2SMessage("join")).toBe(false);
  });

  it("guards S2C messages by type discriminant", () => {
    expect(isS2CMessage({ type: "snapshot" })).toBe(true);
    expect(isS2CMessage({ type: "input" })).toBe(false);
  });

  it("compiles representative payload shapes", () => {
    const cmd: InputCommand = {
      seq: 1,
      axes: { x: 0, y: -1 },
      jump: false,
      action: true,
      start: false,
    };
    const snapshot: WorldSnapshot = {
      tick: 0,
      phase: "lobby",
      levelsCompleted: 0,
      levelsAfterHoard: 2,
      lastProcessedInputSeq: { 0: 0, 1: 0, 2: 0, 3: 0 },
      haulers: [],
      treasures: [],
      traps: [],
      switches: [],
    };
    expect(cmd.seq).toBe(1);
    expect(snapshot.levelsAfterHoard).toBe(2);
  });
});
