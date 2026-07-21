import { Hono } from "hono";

export const serverVersion = "0.1.0";

/** Builds the HTTP app. P0 scope: health endpoint only (no game rooms yet). */
export function createApp(): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json({ ok: true, version: serverVersion }));

  return app;
}
