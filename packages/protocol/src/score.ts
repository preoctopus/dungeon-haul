/**
 * Authoritative end-of-run score report as sent over the wire.
 * Source of truth: docs/interfaces/netcode-messages.md "ScoreReport" /
 * "EndCinemaData". Clients never compute official takes — display only.
 */

import type { CharacterId } from "./core.js";

export type ModifierKind = "reward" | "penalty";
export type Uniqueness = "unique" | "common";

export interface ScoreReportModifier {
  id: string;
  title: string;
  kind: ModifierKind;
  uniqueness: Uniqueness;
  deltaShares: number;
}

export interface ScoreReportPlayer {
  seatId: number;
  character: CharacterId;
  human: boolean;
  modifiers: ScoreReportModifier[];
  /** After min-1 clamp. */
  shares: number;
  /** 0–100 display. */
  sharePercent: number;
  takeGp: number;
  inventoryValueGp: number;
  eligibleForHighScore: boolean;
}

/**
 * Presentation-only end cinematic data; server-authored.
 * All GP values must match the rules evaluation used for
 * `totalTreasureGp` / takes. Clients must not re-derive official
 * values from `defId`.
 */
export interface EndCinemaData {
  /** Slowest → fastest (length 4). */
  tossOrderSeatIds: number[];
  /** First exit → last on final level. */
  exitOrderSeatIds: number[];
  players: {
    seatId: number;
    items: {
      instanceId: string;
      defId: string;
      displayName: string;
      valueGp: number;
      setId?: string;
    }[];
  }[];
  setCompletions: {
    setId: string;
    displayName: string;
    bonusGp: number;
    contributorSeatIds: number[];
    /** Which toss triggers the popout. */
    completingInstanceId: string;
  }[];
}

export interface ScoreReport {
  rulesetVersion: string;
  sessionId: string;
  totalTreasureGp: number;
  players: ScoreReportPlayer[];
  /** For score submit. */
  completionToken: string;
  /** Presentation-only end cinematic data (accepted delta #2). */
  cinema?: EndCinemaData;
  /** Top totalHaulGp on board; omit → client skips fanfare (delta #3). */
  recordFanfareThresholdGp?: number;
}

// ---------------------------------------------------------------------------
// REST high-score DTOs — docs/interfaces/lobby-and-scores.md §High scores.
// These are wire shapes for the lobby API, not in-game netcode messages.
// ---------------------------------------------------------------------------

/** One row on the leaderboard; immutable once written. */
export interface HighScoreRow {
  id: string;
  name: string;
  character: CharacterId;
  takeGp: number;
  sharePercent: number;
  totalHaulGp: number;
  createdAt: string; // ISO-8601
}

/** `POST /api/v1/highscores` body. */
export interface SubmitHighScoreRequest {
  /** Opaque token issued by the session's ScoreReport. */
  completionToken: string;
  /** Seat that submitted (validated against the cached report). */
  seatId: number;
  /** Player name — sanitized client-side to ALLOWED_CHARS before send. */
  name: string;
}

/** `POST /api/v1/highscores` response (201 on success). */
export type SubmitHighScoreResponse = HighScoreRow;

/** Last-run summary returned alongside the leaderboard. */
export interface LastRunSummary {
  sessionId: string;
  entries: {
    name?: string | null;
    character: CharacterId;
    takeGp: number;
    sharePercent: number;
  }[];
}

/** `GET /api/v1/highscores` response. */
export interface ListHighScoresResponse {
  top: HighScoreRow[];
  lastRun?: LastRunSummary;
  /** IDs of the three most-recently-added rows → "New!" tag on the client. */
  recentNewIds: string[];
}
