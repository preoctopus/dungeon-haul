/**
 * High-score REST endpoints — E2E via the Hono app (no Colyseus). Covers:
 *   - Fixture data is returned by GET /highscores
 *   - POST creates a row after registering a completion token
 *   - Seat mismatch → UNAUTHORIZED
 *   - Duplicate submission → CONFLICT
 *   - Bad name → VALIDATION
 *   - Unknown token → UNAUTHORIZED
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { Hono } from "hono";
import type { HighScoreRow, ListHighScoresResponse, SubmitHighScoreResponse } from "@dhaul/protocol";
import { createApp } from "../src/app.js";
import { LobbyService } from "../src/lobby/service.js";

let app: Hono;
let lobby: LobbyService;

function setup() {
  let n = 0;
  lobby = new LobbyService({
    spawnRoom: async () => `room_${++n}`,
    wsUrl: () => "ws://test:0",
  });
  app = createApp({ lobby, roomCount: () => n });
}

beforeEach(() => setup());

async function getScores(limit = 25) {
  const res = await app.request(`/api/v1/highscores?limit=${limit}`);
  expect(res.status).toBe(200);
  return (await res.json()) as ListHighScoresResponse;
}

async function postScore(body: { completionToken?: string; seatId?: number; name?: string }) {
  const res = await app.request("/api/v1/highscores", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  return { status: res.status, body: (await res.json()) as Record<string, unknown> };
}

describe("GET /api/v1/highscores", () => {
  it("returns fixture rows sorted by totalHaulGp descending", async () => {
    const body = await getScores();
    expect(body.top.length).toBeGreaterThanOrEqual(4);
    for (let i = 0; i < body.top.length - 1; i++) {
      expect(body.top[i]!.totalHaulGp).toBeGreaterThanOrEqual(body.top[i + 1]!.totalHaulGp);
    }
    expect(Array.isArray(body.recentNewIds)).toBe(true);
  });

  it("limits the response", async () => {
    const body = await getScores(2);
    expect(body.top).toHaveLength(2);
  });

  it("rejects an invalid limit", async () => {
    const res = await app.request("/api/v1/highscores?limit=0");
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/highscores", () => {
  it("submits a score and returns the row with status 201", async () => {
    // Register a completion token for seat 0 (a human sprite with take=500).
    lobby.registerCompletion(
      "sess-abc",
      [{ seatId: 0, character: "sprite" as const, takeGp: 500, sharePercent: 25 }],
      "tok-1234",
    );

    const res = await postScore({ completionToken: "tok-1234", seatId: 0, name: "Zap" });
    expect(res.status).toBe(201);
    const row = res.body as unknown as SubmitHighScoreResponse;
    expect(row.name).toBe("Zap");
    expect(row.character).toBe("sprite");
    expect(row.takeGp).toBe(500);
    expect(row.id).toMatch(/^hs_/);
  });

  it("rejects a seat that is not eligible", async () => {
    lobby.registerCompletion(
      "sess-abc",
      [{ seatId: 0, character: "gnome" as const, takeGp: 500, sharePercent: 25 }],
      "tok-1234",
    );

    const res = await postScore({ completionToken: "tok-1234", seatId: 3, name: "Nope" });
    expect(res.status).toBe(401);
  });

  it("rejects a duplicate submission from the same seat", async () => {
    lobby.registerCompletion(
      "sess-abc",
      [{ seatId: 0, character: "dwarf" as const, takeGp: 300, sharePercent: 20 }],
      "tok-1234",
    );

    await postScore({ completionToken: "tok-1234", seatId: 0, name: "First" });
    const res = await postScore({ completionToken: "tok-1234", seatId: 0, name: "Second" });
    expect(res.status).toBe(409);
  });

  it("rejects an unknown token", async () => {
    const res = await postScore({ completionToken: "bogus", seatId: 0, name: "Hi" });
    expect(res.status).toBe(401);
  });

  it("validates the name charset and length", async () => {
    lobby.registerCompletion(
      "sess-abc",
      [{ seatId: 0, character: "halfling" as const, takeGp: 200, sharePercent: 15 }],
      "tok-ok",
    );

    const tooLong = await postScore({ completionToken: "tok-ok", seatId: 0, name: "A".repeat(13) });
    expect(tooLong.status).toBe(400);

    const badChars = await postScore({ completionToken: "tok-ok", seatId: 0, name: "bad@name!" });
    expect(badChars.status).toBe(400);
  });

  it("appears in the leaderboard after submission", async () => {
    lobby.registerCompletion(
      "sess-abc",
      [{ seatId: 0, character: "sprite" as const, takeGp: 9999, sharePercent: 50 }],
      "tok-big",
    );

    await postScore({ completionToken: "tok-big", seatId: 0, name: "RecBreakr" });

    const { top } = (await getScores()) as ListHighScoresResponse & { top: HighScoreRow[] };
    expect(top.find((r) => r.name === "RecBreakr")).toBeDefined();
    // Should be at the very top (9999 > any fixture value).
    expect(top[0]!.name).toBe("RecBreakr");
  });
});
