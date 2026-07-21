/**
 * Lobby REST DTOs (protocol v1).
 * Source of truth: docs/interfaces/lobby-and-scores.md (Lobby / Sessions half)
 * and docs/components/lobby-session/DESIGN.md.
 *
 * High-score DTOs stay out until C-12 lands (P5).
 */

import type { SeatPublic, SessionPhase } from "./core.js";

/**
 * Per-seat lobby status. The contract's `SeatStatus` is field-identical to
 * the WS `SeatPublic` broadcast in `S2C_SeatUpdate`; one shape serves both.
 */
export type SeatStatus = SeatPublic;

export type LobbyErrorCode =
  | "NOT_FOUND"
  | "FULL"
  | "CLOSED"
  | "UNAUTHORIZED"
  | "VALIDATION"
  | "INTERNAL"
  | "RATE_LIMITED";

/** Error envelope: `{ "error": { "code", "message" } }`. */
export interface ErrorEnvelope {
  error: { code: LobbyErrorCode; message: string };
}

/** `POST /api/v1/sessions` request body. */
export interface CreateSessionRequest {
  displayName?: string;
  region?: string;
}

/** `POST /api/v1/sessions` 201 response. */
export interface CreateSessionResponse {
  sessionId: string;
  joinCode: string;
  wsUrl: string;
  seats: SeatStatus[];
  /** Creator auto-claimed seat 0 (or first free). */
  hostSeatToken: string;
  reconnectToken: string;
}

/** `POST /api/v1/sessions/join` request body. */
export interface JoinSessionRequest {
  joinCode: string;
  displayName?: string;
}

/** `POST /api/v1/sessions/join` 200 response. */
export interface JoinSessionResponse {
  sessionId: string;
  wsUrl: string;
  seatId: number;
  seatToken: string;
  reconnectToken: string;
  seats: SeatStatus[];
  phase: SessionPhase;
}

/** `GET /api/v1/sessions/:sessionId` public view (no tokens). */
export interface PublicSessionView {
  sessionId: string;
  joinCode: string;
  phase: SessionPhase;
  seats: SeatStatus[];
  levelsCompleted: number;
  levelsAfterHoard: number;
}

/** Join-code alphabet (C-05 DESIGN §6): no 0/O/1/I ambiguity. */
export const JOIN_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Join codes are 6 characters (frozen MVP choice). */
export const JOIN_CODE_LENGTH = 6;
