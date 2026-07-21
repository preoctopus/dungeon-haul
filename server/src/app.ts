import { Hono } from "hono";
import { cors } from "hono/cors";
import type { LobbyService } from "./lobby/service.js";
import { lobbyRoutes } from "./lobby/routes.js";
import { getLevel } from "./content.js";
import { CELL_FLAGS } from "@dhaul/levels";

export const serverVersion = "0.2.0";

export interface AppDeps {
  lobby?: LobbyService;
  /** Live room count for /health (C-14 cooperation). */
  roomCount?: () => number;
}

/** Builds the HTTP app. P2 scope: health + lobby sessions REST + level shim. */
export function createApp(deps: AppDeps = {}): Hono {
  const app = new Hono();

  app.get("/health", (c) => {
    const body: { ok: true; version: string; rooms?: number } = {
      ok: true,
      version: serverVersion,
    };
    if (deps.roomCount) body.rooms = deps.roomCount();
    return c.json(body);
  });

  app.use("/api/*", cors());

  if (deps.lobby) {
    app.route("/api/v1", lobbyRoutes(deps.lobby));
  }

  // P2 dev shim (NOT a frozen interface): render/prediction geometry for the
  // client until the client-side level loader (C-09 consumer path) lands.
  // Exposes only solidity + spawns + exit of an already-public content pack.
  app.get("/api/v1/levels/:levelId", (c) => {
    const levelId = c.req.param("levelId");
    if (!/^[a-z0-9_]+$/.test(levelId)) {
      return c.json({ error: { code: "VALIDATION", message: "bad level id" } }, 400);
    }
    try {
      const level = getLevel(levelId);
      return c.json({
        id: level.id,
        blockSizePx: level.blockSizePx,
        width: level.width,
        height: level.height,
        /** Row strings: '#' solid, '.' passable. */
        solid: level.cells.map((row) =>
          row.map((cell) => (CELL_FLAGS[cell].solid ? "#" : ".")).join(""),
        ),
        spawns: level.spawns,
        exit: level.exit,
      });
    } catch {
      return c.json({ error: { code: "NOT_FOUND", message: "unknown level" } }, 404);
    }
  });

  return app;
}
