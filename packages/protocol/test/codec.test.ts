import { describe, expect, it } from "vitest";
import {
  COLYSEUS_ERROR_CODES,
  decodeC2S,
  decodeS2C,
  encodeMessage,
  errorCodeFromColyseus,
  isC2SInput,
  isInputCommand,
  isJoinOptions,
  JOIN_CODE_ALPHABET,
  JOIN_CODE_LENGTH,
  protocolVersion,
  type C2S_Input,
  type InputCommand,
  type S2C_Error,
} from "../src/index.js";

const cmd = (over: Partial<InputCommand> = {}): InputCommand => ({
  seq: 1,
  axes: { x: 0, y: 0 },
  jump: false,
  action: false,
  start: false,
  ...over,
});

describe("codec: JSON round trip", () => {
  it("round-trips a C2S_Input", () => {
    const msg: C2S_Input = { type: "input", seatId: 2, command: cmd({ seq: 7 }) };
    const decoded = decodeC2S(encodeMessage(msg));
    expect(decoded).toEqual(msg);
  });

  it("round-trips an S2C_Error", () => {
    const msg: S2C_Error = { type: "error", code: "FULL", message: "no seats" };
    expect(decodeS2C(encodeMessage(msg))).toEqual(msg);
  });

  it("rejects malformed JSON and unknown types", () => {
    expect(decodeC2S("{nope")).toBeNull();
    expect(decodeC2S(JSON.stringify({ type: "snapshot" }))).toBeNull();
    expect(decodeS2C(JSON.stringify({ type: "input" }))).toBeNull();
    expect(decodeS2C("42")).toBeNull();
  });
});

describe("codec: isInputCommand", () => {
  it("accepts a full valid command", () => {
    expect(isInputCommand(cmd({ clientTick: 3, select: true }))).toBe(true);
  });

  it("rejects axes outside {-1,0,1}", () => {
    expect(isInputCommand(cmd({ axes: { x: 2 as never, y: 0 } }))).toBe(false);
    expect(isInputCommand(cmd({ axes: { x: 0, y: 0.5 as never } }))).toBe(false);
  });

  it("rejects missing / wrong-typed fields", () => {
    expect(isInputCommand(null)).toBe(false);
    expect(isInputCommand({})).toBe(false);
    expect(isInputCommand(cmd({ seq: -1 }))).toBe(false);
    expect(isInputCommand(cmd({ seq: Number.NaN }))).toBe(false);
    expect(isInputCommand({ ...cmd(), jump: "yes" })).toBe(false);
  });
});

describe("codec: isC2SInput", () => {
  it("accepts seatIds 0..3 only", () => {
    for (const seatId of [0, 1, 2, 3]) {
      expect(isC2SInput({ type: "input", seatId, command: cmd() })).toBe(true);
    }
    expect(isC2SInput({ type: "input", seatId: 4, command: cmd() })).toBe(false);
    expect(isC2SInput({ type: "input", seatId: 1.5, command: cmd() })).toBe(false);
  });

  it("rejects invalid embedded command", () => {
    expect(isC2SInput({ type: "input", seatId: 0, command: {} })).toBe(false);
  });
});

describe("codec: join options", () => {
  it("accepts C2S_Join-shaped options", () => {
    expect(
      isJoinOptions({ protocolVersion, sessionId: "s", seatToken: "t" }),
    ).toBe(true);
    expect(
      isJoinOptions({
        protocolVersion,
        sessionId: "s",
        seatToken: "t",
        reconnectToken: "r",
      }),
    ).toBe(true);
  });

  it("rejects missing fields", () => {
    expect(isJoinOptions({ sessionId: "s", seatToken: "t" })).toBe(false);
    expect(isJoinOptions(null)).toBe(false);
  });
});

describe("codec: Colyseus error code mapping", () => {
  it("is a bijection over contract codes", () => {
    for (const [name, num] of Object.entries(COLYSEUS_ERROR_CODES)) {
      expect(errorCodeFromColyseus(num)).toBe(name);
    }
  });

  it("maps unknown numeric codes to INTERNAL", () => {
    expect(errorCodeFromColyseus(1006)).toBe("INTERNAL");
  });
});

describe("session constants", () => {
  it("join code alphabet excludes ambiguous 0/O/1/I", () => {
    expect(JOIN_CODE_LENGTH).toBe(6);
    for (const bad of ["0", "O", "1", "I"]) {
      expect(JOIN_CODE_ALPHABET.includes(bad)).toBe(false);
    }
    expect(JOIN_CODE_ALPHABET).toHaveLength(32);
  });
});
