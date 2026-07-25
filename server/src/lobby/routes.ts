/**
 * Lobby REST routes — docs/interfaces/lobby-and-scores.md (sessions half).
 * Error envelope: { error: { code, message } }.
 */

import { Hono } from "hono";
import type {
  CreateSessionRequest,
  JoinSessionRequest,
  ListHighScoresResponse,
  SubmitHighScoreRequest,
} from "@dhaul/protocol";
import { LobbyError, type LobbyService } from "./service.js";
import { HighScoreError } from "../highScores/store.js";

const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: 404,
  FULL: 409,
  CLOSED: 410,
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL: 500,
};

const HIGH_SCORE_STATUS_BY_CODE: Record<string, number> = {
  UNAUTHORIZED: 401,
  CONFLICT: 409,
  VALIDATION: 400,
  INTERNAL: 500,
};

export function lobbyRoutes(lobby: LobbyService): Hono {
  const app = new Hono();

  app.onError((err, c) => {
    if (err instanceof LobbyError) {
      return c.json(
        { error: { code: err.code, message: err.message } },
        (STATUS_BY_CODE[err.code] ?? 500) as 400,
      );
    }
    console.error("[lobby] unexpected error", err);
    return c.json({ error: { code: "INTERNAL", message: "internal error" } }, 500);
  });

  app.post("/sessions", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as CreateSessionRequest;
    return c.json(await lobby.create(body), 201);
  });

  app.post("/sessions/join", async (c) => {
    const body = (await c.req.json().catch(() => ({}))) as JoinSessionRequest;
    return c.json(lobby.join(body), 200);
  });

  app.get("/sessions/:sessionId", (c) => {
    return c.json(lobby.getPublic(c.req.param("sessionId")), 200);
  });

  // ------------------------------------------------------------------
  // High scores (C01-T06, C12-T09/T16)
  // ------------------------------------------------------------------

  app.get("/highscores", (c) => {
    const raw = c.req.query("limit");
    const limit = raw === undefined ? 25 : parseInt(raw, 10);
    if (!Number.isFinite(limit) || limit < 1 || limit > 100) {
      return c.json({ error: { code: "VALIDATION", message: "limit must be 1–100" } }, 400);
    }
    const body = lobby.listHighScores(limit) as ListHighScoresResponse;
    return c.json(body, 200);
  });

  app.post("/highscores", async (c) => {
    try {
      const body = (await c.req.json().catch(() => ({}))) as SubmitHighScoreRequest;
      if (
        typeof body.completionToken !== "string" ||
        typeof body.seatId !== "number" ||
        typeof body.name !== "string"
      ) {
        return c.json({ error: { code: "VALIDATION", message: "completionToken, seatId, name required" } }, 400 as const);
      }
      const row = lobby.submitHighScore(body);
      return c.json(row, 201 as const);
    } catch (err) {
      if (err instanceof HighScoreError) {
        const status = HIGH_SCORE_STATUS_BY_CODE[err.code] ?? 500;
        return c.json(
          { error: { code: err.code, message: err.message } },
          status as 400 | 401 | 409 | 500,
        );
      }
      console.error("[highscores] unexpected error", err);
      return c.json({ error: { code: "INTERNAL", message: "internal error" } }, 500 as const);
    }
  });

  return app;
}
