/**
 * Lobby REST routes — docs/interfaces/lobby-and-scores.md (sessions half).
 * Error envelope: { error: { code, message } }.
 */

import { Hono } from "hono";
import type { CreateSessionRequest, JoinSessionRequest } from "@dhaul/protocol";
import { LobbyError, type LobbyService } from "./service.js";

const STATUS_BY_CODE: Record<string, number> = {
  NOT_FOUND: 404,
  FULL: 409,
  CLOSED: 410,
  UNAUTHORIZED: 401,
  VALIDATION: 400,
  RATE_LIMITED: 429,
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

  return app;
}
