/**
 * Protocol v1 runtime codecs and validators for the messages actually
 * exchanged in the P2 slice (movement-only netcode).
 *
 * Wire contract: docs/interfaces/netcode-messages.md (JSON MVP).
 *
 * Transport adaptation (documented deviation, not a contract change):
 * rooms are hosted on Colyseus, whose transport frames payloads itself
 * (msgpack) and performs the join handshake via room-join options rather
 * than a first WS text frame. Semantics map 1:1:
 *
 *  - `C2S_Join` fields travel as the Colyseus `joinById` options object
 *    (same field names, minus the `type` discriminant).
 *  - Join rejection surfaces as a Colyseus join error whose numeric code
 *    maps to `ErrorCode` via {@link COLYSEUS_ERROR_CODES}; in-room errors
 *    still use the `S2C_Error` message shape.
 *  - All other messages are sent on a Colyseus message channel named by the
 *    wire `type` string, with the *full* message object (including `type`)
 *    as payload, so payload shapes match the JSON contract exactly.
 */

import type { InputCommand } from "./input.js";
import type {
  C2S_Input,
  C2SMessage,
  ErrorCode,
  S2CMessage,
} from "./messages.js";
import { isC2SMessage, isS2CMessage } from "./messages.js";

// ---------------------------------------------------------------------------
// JSON codec (contract MVP encoding; also used by tests / non-Colyseus tools)
// ---------------------------------------------------------------------------

export function encodeMessage(message: C2SMessage | S2CMessage): string {
  return JSON.stringify(message);
}

/** Parse + narrow a C2S JSON frame; returns null on malformed/unknown input. */
export function decodeC2S(raw: string): C2SMessage | null {
  const value = tryParse(raw);
  return isC2SMessage(value) ? value : null;
}

/** Parse + narrow an S2C JSON frame; returns null on malformed/unknown input. */
export function decodeS2C(raw: string): S2CMessage | null {
  const value = tryParse(raw);
  return isS2CMessage(value) ? value : null;
}

function tryParse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Payload validators (server-side trust boundary for client-sent data)
// ---------------------------------------------------------------------------

function isAxis(v: unknown): v is -1 | 0 | 1 {
  return v === -1 || v === 0 || v === 1;
}

/**
 * Full structural validation of an `InputCommand`
 * (docs/interfaces/input-commands.md §Validation: axes ∈ {-1,0,1}).
 */
export function isInputCommand(value: unknown): value is InputCommand {
  if (typeof value !== "object" || value === null) return false;
  const cmd = value as Record<string, unknown>;
  const axes = cmd["axes"] as Record<string, unknown> | undefined;
  return (
    typeof cmd["seq"] === "number" &&
    Number.isFinite(cmd["seq"]) &&
    cmd["seq"] >= 0 &&
    typeof axes === "object" &&
    axes !== null &&
    isAxis(axes["x"]) &&
    isAxis(axes["y"]) &&
    typeof cmd["jump"] === "boolean" &&
    typeof cmd["action"] === "boolean" &&
    typeof cmd["start"] === "boolean" &&
    (cmd["select"] === undefined || typeof cmd["select"] === "boolean") &&
    (cmd["clientTick"] === undefined || typeof cmd["clientTick"] === "number")
  );
}

/** Full structural validation of a `C2S_Input` message. */
export function isC2SInput(value: unknown): value is C2S_Input {
  if (typeof value !== "object" || value === null) return false;
  const msg = value as Record<string, unknown>;
  return (
    msg["type"] === "input" &&
    typeof msg["seatId"] === "number" &&
    Number.isInteger(msg["seatId"]) &&
    msg["seatId"] >= 0 &&
    msg["seatId"] <= 3 &&
    isInputCommand(msg["command"])
  );
}

/** Shape of `C2S_Join` fields carried as Colyseus join options (no `type`). */
export interface JoinOptions {
  protocolVersion: number;
  sessionId: string;
  seatToken: string;
  reconnectToken?: string;
  clientInfo?: { name?: string; build?: string };
}

/** Structural validation of join options (protocol version checked separately). */
export function isJoinOptions(value: unknown): value is JoinOptions {
  if (typeof value !== "object" || value === null) return false;
  const opts = value as Record<string, unknown>;
  return (
    typeof opts["protocolVersion"] === "number" &&
    typeof opts["sessionId"] === "string" &&
    typeof opts["seatToken"] === "string" &&
    (opts["reconnectToken"] === undefined ||
      typeof opts["reconnectToken"] === "string")
  );
}

// ---------------------------------------------------------------------------
// Colyseus join-error code mapping (see module doc above)
// ---------------------------------------------------------------------------

/** Numeric Colyseus join-error codes ↔ contract `ErrorCode` strings. */
export const COLYSEUS_ERROR_CODES: Readonly<Record<ErrorCode, number>> = {
  PROTOCOL: 4100,
  AUTH: 4101,
  FULL: 4102,
  PHASE: 4103,
  INTERNAL: 4199,
};

/** Reverse lookup; unknown numeric codes map to `INTERNAL`. */
export function errorCodeFromColyseus(code: number): ErrorCode {
  for (const [name, num] of Object.entries(COLYSEUS_ERROR_CODES)) {
    if (num === code) return name as ErrorCode;
  }
  return "INTERNAL";
}
