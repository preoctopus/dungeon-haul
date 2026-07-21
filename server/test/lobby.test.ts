import { describe, expect, it } from "vitest";
import type { Hono } from "hono";
import type {
  CreateSessionResponse,
  JoinSessionResponse,
  PublicSessionView,
} from "@dhaul/protocol";
import { createApp } from "../src/app.js";
import { LobbyService } from "../src/lobby/service.js";

/** REST behavior tests with an injected no-op room spawner (no Colyseus). */
function makeApp(now?: () => number): { app: Hono; lobby: LobbyService } {
  let n = 0;
  const opts = {
    spawnRoom: async () => `room_${++n}`,
    wsUrl: () => "ws://test:0",
    ...(now ? { now } : {}),
  };
  const lobby = new LobbyService(opts);
  return { app: createApp({ lobby, roomCount: () => n }), lobby };
}

async function create(app: Hono, displayName?: string): Promise<CreateSessionResponse> {
  const res = await app.request("/api/v1/sessions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(displayName === undefined ? {} : { displayName }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as CreateSessionResponse;
}

async function join(app: Hono, joinCode: string, displayName?: string) {
  return app.request("/api/v1/sessions/join", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ joinCode, displayName }),
  });
}

describe("POST /api/v1/sessions", () => {
  it("creates a session: 6-char code, wsUrl, host seat 0 tokens, 4 seats", async () => {
    const { app } = makeApp();
    const created = await create(app, "Alice");
    expect(created.sessionId).toBe("room_1");
    expect(created.joinCode).toMatch(/^[A-HJ-NP-Z2-9]{6}$/);
    expect(created.wsUrl).toBe("ws://test:0");
    expect(created.hostSeatToken.length).toBeGreaterThan(20);
    expect(created.reconnectToken.length).toBeGreaterThan(20);
    expect(created.seats).toHaveLength(4);
    expect(created.seats[0]).toMatchObject({ seatId: 0, occupied: true, displayName: "Alice" });
    expect(created.seats.slice(1).every((s) => !s.occupied)).toBe(true);
  });

  it("rejects invalid display names", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/v1/sessions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: "x".repeat(40) }),
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("VALIDATION");
  });
});

describe("POST /api/v1/sessions/join (contract test list)", () => {
  it("create → join ×3 fills seats 1-3 → fifth join FULL", async () => {
    const { app } = makeApp();
    const created = await create(app);
    for (const expectSeat of [1, 2, 3]) {
      const res = await join(app, created.joinCode);
      expect(res.status).toBe(200);
      const body = (await res.json()) as JoinSessionResponse;
      expect(body.seatId).toBe(expectSeat);
      expect(body.sessionId).toBe(created.sessionId);
      expect(body.seatToken.length).toBeGreaterThan(20);
      expect(body.phase).toBe("level");
    }
    const fifth = await join(app, created.joinCode);
    expect(fifth.status).toBe(409);
    expect(((await fifth.json()) as { error: { code: string } }).error.code).toBe("FULL");
  });

  it("join code lookup is case-insensitive", async () => {
    const { app } = makeApp();
    const created = await create(app);
    const res = await join(app, created.joinCode.toLowerCase());
    expect(res.status).toBe(200);
  });

  it("bad code → NOT_FOUND", async () => {
    const { app } = makeApp();
    await create(app);
    const res = await join(app, "ZZZZZZ");
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("NOT_FOUND");
  });

  it("closed session → CLOSED", async () => {
    const { app, lobby } = makeApp();
    const created = await create(app);
    lobby.markClosed(created.sessionId);
    const res = await join(app, created.joinCode);
    expect(res.status).toBe(410);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("CLOSED");
  });

  it("a disconnect-expired seat is reclaimable by a new joiner", async () => {
    let t = 1_000_000;
    const { app, lobby } = makeApp(() => t);
    const created = await create(app);
    for (let i = 0; i < 3; i++) await join(app, created.joinCode);

    // Seat 2 human connects then drops; grace (30s) expires.
    lobby.markConnected(created.sessionId, 2);
    lobby.markDisconnected(created.sessionId, 2, false);
    t += 31_000;

    const res = await join(app, created.joinCode, "Newcomer");
    expect(res.status).toBe(200);
    expect(((await res.json()) as JoinSessionResponse).seatId).toBe(2);
  });
});

describe("GET /api/v1/sessions/:sessionId", () => {
  it("returns the public view with levelsAfterHoard and no tokens", async () => {
    const { app } = makeApp();
    const created = await create(app, "Host");
    const res = await app.request(`/api/v1/sessions/${created.sessionId}`);
    expect(res.status).toBe(200);
    const view = (await res.json()) as PublicSessionView;
    expect(view).toMatchObject({
      sessionId: created.sessionId,
      joinCode: created.joinCode,
      phase: "level",
      levelsCompleted: 0,
      levelsAfterHoard: 2,
    });
    expect(view.seats).toHaveLength(4);
    expect(JSON.stringify(view)).not.toContain(created.hostSeatToken);
    expect(JSON.stringify(view)).not.toContain(created.reconnectToken);
  });

  it("unknown session → NOT_FOUND", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/v1/sessions/nope");
    expect(res.status).toBe(404);
  });
});

describe("token verification (room-facing API)", () => {
  it("verifies seat tokens and rejects garbage", async () => {
    const { app, lobby } = makeApp();
    const created = await create(app);
    expect(lobby.verifySeatToken(created.sessionId, created.hostSeatToken)).toBe(0);
    expect(lobby.verifySeatToken(created.sessionId, "garbage")).toBeNull();
    expect(lobby.verifySeatToken("other", created.hostSeatToken)).toBeNull();
  });

  it("reconnect token honors the 30s grace window", async () => {
    let t = 5_000_000;
    const { app, lobby } = makeApp(() => t);
    const created = await create(app);
    lobby.markConnected(created.sessionId, 0);
    const rotated = lobby.rotateReconnectToken(created.sessionId, 0);
    lobby.markDisconnected(created.sessionId, 0, false);

    t += 29_000;
    expect(lobby.verifyReconnectToken(created.sessionId, 0, rotated)).toBe(true);
    t += 2_000;
    expect(lobby.verifyReconnectToken(created.sessionId, 0, rotated)).toBe(false);
  });

  it("consented leave invalidates credentials and frees the seat", async () => {
    const { app, lobby } = makeApp();
    const created = await create(app);
    lobby.markConnected(created.sessionId, 0);
    lobby.markDisconnected(created.sessionId, 0, true);
    expect(lobby.verifySeatToken(created.sessionId, created.hostSeatToken)).toBeNull();
    const res = await join(app, created.joinCode);
    expect(((await res.json()) as JoinSessionResponse).seatId).toBe(0);
  });
});

describe("GET /api/v1/levels/:levelId (P2 dev shim)", () => {
  it("serves box_level solidity for client render/prediction", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/v1/levels/box_level");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { id: string; blockSizePx: number; width: number; height: number; solid: string[]; spawns: unknown[] };
    expect(body).toMatchObject({ id: "box_level", blockSizePx: 32, width: 21, height: 6 });
    expect(body.solid).toHaveLength(6);
    expect(body.solid[5]).toBe("#".repeat(21));
    expect(body.spawns).toHaveLength(4);
  });

  it("unknown level → 404", async () => {
    const { app } = makeApp();
    const res = await app.request("/api/v1/levels/nope_level");
    expect(res.status).toBe(404);
  });
});

describe("GET /health", () => {
  it("includes room count when wired", async () => {
    const { app } = makeApp();
    await create(app);
    const res = await app.request("/health");
    expect(await res.json()).toMatchObject({ ok: true, rooms: 1 });
  });
});
