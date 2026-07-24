/**
 * High-score persistence (C01-T06, C12-T09/T16). P4 scope: read-only in-memory
 * mock with fixture data. Real impl (P5/C-12) swaps in PostgreSQL on the same
 * interface — see `HighScoresStore` contract below.
 */

import type {
  HighScoreRow,
  LastRunSummary,
  ListHighScoresResponse,
  SubmitHighScoreRequest,
  SubmitHighScoreResponse,
} from "@dhaul/protocol";

/** Allowed characters in a player name (frozen charset). */
const NAME_ALLOWED = /^[A-Za-z0-9 _.'-]+$/;
const NAME_MAX = 12;
const RECENT_NEW_COUNT = 3;

export class HighScoreError extends Error {
  constructor(
    public readonly code: "VALIDATION" | "UNAUTHORIZED" | "CONFLICT" | "INTERNAL",
    message: string,
  ) {
    super(message);
    this.name = "HighScoreError";
  }
}

/** Shape of a cached completion token → report metadata pair. */
interface CompletionTokenRecord {
  sessionId: string;
  seatId: number;
  character: string; // CharacterId as string (protocol exports it)
  takeGp: number;
  sharePercent: number;
}

/** In-memory high-score store for P4. */
export class HighScoresStore {
  private rows: HighScoreRow[] = [];
  /** completionToken → record of who submitted and their report values. */
  private tokens = new Map<string, CompletionTokenRecord>();
  /** seatId per sessionId — prevents duplicate submissions from same seat. */
  private submittedSeats = new Set<string>(); // `${sessionId}:${seatId}`

  constructor() {
    this.seed();
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  list(limit: number): ListHighScoresResponse {
    const top = [...this.rows].sort((a, b) => b.totalHaulGp - a.totalHaulGp).slice(0, limit);
    const lastRun = this.buildLastRun();
    const recentNewIds = top.slice(0, RECENT_NEW_COUNT).map((r) => r.id);
    return { top, ...(lastRun ? { lastRun } : {}), recentNewIds };
  }

  submit(req: SubmitHighScoreRequest): SubmitHighScoreResponse {
    // 1. Validate the completion token exists and is unclaimed.
    const record = this.tokens.get(req.completionToken);
    if (!record) {
      throw new HighScoreError("UNAUTHORIZED", "unknown or expired completion token");
    }
    if (this.submittedSeats.has(`${record.sessionId}:${req.seatId}`)) {
      throw new HighScoreError(
        "CONFLICT",
        `seat ${req.seatId} already submitted for this run`,
      );
    }

    // 2. Validate seat/token match the cached report.
    if (record.seatId !== req.seatId) {
      throw new HighScoreError(
        "UNAUTHORIZED",
        `seat ${req.seatId} does not match token owner`,
      );
    }

    // 3. Validate name.
    const name = this.validateName(req.name);

    // 4. Build row (id is deterministic so the same player can't game the board).
    const id = hashRow(record.sessionId, req.seatId, record.takeGp, Date.now());
    const row: HighScoreRow = {
      id,
      name,
      character: record.character as HighScoreRow["character"],
      takeGp: record.takeGp,
      sharePercent: record.sharePercent,
      totalHaulGp: record.takeGp, // P4 mock — haul equals take
      createdAt: new Date().toISOString(),
    };

    this.rows.push(row);
    this.submittedSeats.add(`${record.sessionId}:${req.seatId}`);
    return { ...row };
  }

  /** Register a completion token from an ended session (called by HaulSession). */
  registerCompletion(
    sessionId: string,
    seatId: number,
    character: string,
    takeGp: number,
    sharePercent: number,
    completionToken: string,
  ): void {
    this.tokens.set(completionToken, {
      sessionId,
      seatId,
      character,
      takeGp,
      sharePercent,
    });
  }

  /** Test helper — drop all rows and tokens. */
  reset(): void {
    this.rows = [];
    this.tokens.clear();
    this.submittedSeats.clear();
    this.seed();
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private validateName(raw: string): string {
    if (!raw || raw.length === 0) {
      throw new HighScoreError("VALIDATION", "name is required");
    }
    if (raw.length > NAME_MAX) {
      throw new HighScoreError(
        "VALIDATION",
        `name must be ${NAME_MAX} chars or fewer`,
      );
    }
    if (!NAME_ALLOWED.test(raw)) {
      throw new HighScoreError(
        "VALIDATION",
        "name: letters, digits, space, and .'_-' only",
      );
    }
    return raw.trim();
  }

  private buildLastRun(): LastRunSummary | undefined {
    // Return the most recently registered completion token's report as lastRun.
    const entries = [...this.tokens.values()].slice(-4);
    if (entries.length === 0) return undefined;
    // The lobby only sees one seat per submission, but we return what we have.
    return {
      sessionId: entries[entries.length - 1]!.sessionId,
      entries: entries.map((e) => ({
        name: this.rows.find((r) => r.id === hashRow(e.sessionId, e.seatId, e.takeGp, Date.now()))?.name ?? null,
        character: e.character as LastRunSummary["entries"][0]["character"],
        takeGp: e.takeGp,
        sharePercent: e.sharePercent,
      })),
    };
  }

  private seed(): void {
    // Fixture data so the P4 mock leaderboard has something to show.
    const now = Date.now();
    this.rows.push(
      makeFixtureRow("Glitterpox", "sprite", 1240, 34, offsetDays(now, -3)),
      makeFixtureRow("Bumper", "gnome", 980, 28, offsetDays(now, -7)),
      makeFixtureRow("Nutzy", "halfling", 875, 25, offsetDays(now, -14)),
      makeFixtureRow("Clanksworth III", "dwarf", 760, 22, offsetDays(now, -30)),
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function hashRow(sessionId: string, seatId: number, takeGp: number, ts: number): string {
  // Simple deterministic id — collisions extremely unlikely across runs.
  const h = simpleHash(`${sessionId}:${seatId}:${takeGp}:${ts}`);
  return `hs_${h.toString(36).padStart(8, "0")}`;
}

function simpleHash(s: string): number {
  let h = 0x811c9dc5; // FNV-1a 32-bit offset basis
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0; // unsigned
}

function makeFixtureRow(
  name: string,
  character: HighScoreRow["character"],
  takeGp: number,
  sharePercent: number,
  createdAt: string,
): HighScoreRow {
  return { id: hashRow("fixture", -1, takeGp, createdAt.charCodeAt(0)), name, character, takeGp, sharePercent, totalHaulGp: takeGp, createdAt };
}

function offsetDays(now: number, days: number): string {
  return new Date(now + days * 86400000).toISOString();
}
