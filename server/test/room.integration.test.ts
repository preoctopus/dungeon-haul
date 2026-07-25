/**
 * Room / WebSocket integration (AUTOMATED-TEST-STRATEGY §3.3): real Colyseus
 * server on an ephemeral port, minimal colyseus.js protocol client (no
 * Phaser). Covers the netcode-messages.md §Test contract items 1-5.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Client as ColyseusClient, type Room } from "@colyseus/sdk";
import type {
  CreateSessionResponse,
  InputCommand,
  JoinSessionResponse,
  S2C_Welcome,
  WorldSnapshot,
} from "@dhaul/protocol";
import { protocolVersion } from "@dhaul/protocol";
import { startGameServer, type RunningGameServer } from "../src/gameServer.js";

let server: RunningGameServer;

beforeAll(async () => {
  // Both ports ephemeral — avoids EADDRINUSE when a dev server already holds
  // the defaults (2567 / 8080). Without this, startGameServer hangs on
  // colyseus.listen() and beforeAll times out at 20 s.
  server = await startGameServer({ port: 0, wsPort: 0 });
});

afterAll(async () => {
  // Guarded against the case where beforeAll never resolved (server undefined).
  // Without this, a startup failure produces two errors — one from the test,
  // another from this hook — hiding the root cause.
  await server?.shutdown();
});

interface Session {
  room: Room;
  welcome: S2C_Welcome;
  messages: { type: string; payload: unknown }[];
  nextSnapshot(pred?: (s: WorldSnapshot) => boolean, timeoutMs?: number): Promise<WorldSnapshot>;
}

async function restCreate(displayName?: string): Promise<CreateSessionResponse> {
  const res = await fetch(`${server.httpUrl}/api/v1/sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ displayName }),
  });
  expect(res.status).toBe(201);
  return (await res.json()) as CreateSessionResponse;
}

async function restJoin(joinCode: string, displayName?: string): Promise<Response> {
  return fetch(`${server.httpUrl}/api/v1/sessions/join`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ joinCode, displayName }),
  });
}

async function wsConnect(
  sessionId: string,
  seatToken: string,
  reconnectToken?: string,
  version: number = protocolVersion,
): Promise<Session> {
  const client = new ColyseusClient(server.wsUrl);
  const room = await client.joinById(sessionId, {
    protocolVersion: version,
    sessionId,
    seatToken,
    ...(reconnectToken !== undefined ? { reconnectToken } : {}),
  });

  const messages: { type: string; payload: unknown }[] = [];
  let welcomeResolve: (w: S2C_Welcome) => void;
  const welcomePromise = new Promise<S2C_Welcome>((r) => (welcomeResolve = r));
  const snapshotWaiters: {
    pred: (s: WorldSnapshot) => boolean;
    resolve: (s: WorldSnapshot) => void;
  }[] = [];

  room.onMessage("*", (type, payload) => {
    messages.push({ type: String(type), payload });
    if (type === "welcome") welcomeResolve((payload as S2C_Welcome));
    if (type === "snapshot") {
      const snap = (payload as { snapshot: WorldSnapshot }).snapshot;
      for (let i = snapshotWaiters.length - 1; i >= 0; i--) {
        const w = snapshotWaiters[i]!;
        if (w.pred(snap)) {
          snapshotWaiters.splice(i, 1);
          w.resolve(snap);
        }
      }
    }
  });

  const welcome = await withTimeout(welcomePromise, 5000, "welcome");
  return {
    room,
    welcome,
    messages,
    nextSnapshot: (pred = () => true, timeoutMs = 5000) =>
      withTimeout(
        new Promise<WorldSnapshot>((resolve) => snapshotWaiters.push({ pred, resolve })),
        timeoutMs,
        "snapshot",
      ),
  };
}

function withTimeout<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timed out waiting for ${what}`)), ms),
    ),
  ]);
}

function makeCmd(seq: number, x: -1 | 0 | 1, jump = false): InputCommand {
  return { seq, axes: { x, y: 0 }, jump, action: false, start: false };
}

describe("HaulSession room", () => {
  it("join → Welcome → snapshot stream; input moves the hauler and acks seq", async () => {
    const created = await restCreate("Mover");
    const s = await wsConnect(created.sessionId, created.hostSeatToken);

    expect(s.welcome.protocolVersion).toBe(protocolVersion);
    expect(s.welcome.seatId).toBe(0);
    expect(s.welcome.tickRate).toBe(30);
    expect(s.welcome.reconnectToken.length).toBeGreaterThan(20);
    expect(s.welcome.snapshot.haulers).toHaveLength(4);
    expect(s.welcome.snapshot.levelId).toBe("box_level");

    const first = await s.nextSnapshot();
    const x0 = first.haulers.find((h) => h.seatId === 0)!.x;

    // Send held-right inputs at ~30 Hz.
    let seq = 0;
    const sender = setInterval(() => {
      s.room.send("input", { type: "input", seatId: 0, command: makeCmd(++seq, 1) });
    }, 33);
    try {
      const moved = await s.nextSnapshot(
        (snap) => snap.haulers.find((h) => h.seatId === 0)!.x > x0 + 40,
      );
      expect((moved.lastProcessedInputSeq[0] ?? 0)).toBeGreaterThan(0);
      expect(moved.haulers.find((h) => h.seatId === 0)!.control).toBe("human");
    } finally {
      clearInterval(sender);
    }
    await s.room.leave();
  });

  it("four seats join; REST fifth join is rejected FULL", async () => {
    const created = await restCreate("Host");
    const joins: JoinSessionResponse[] = [];
    for (let i = 0; i < 3; i++) {
      const res = await restJoin(created.joinCode);
      expect(res.status).toBe(200);
      joins.push((await res.json()) as JoinSessionResponse);
    }
    const fifth = await restJoin(created.joinCode);
    expect(fifth.status).toBe(409);
    expect(((await fifth.json()) as { error: { code: string } }).error.code).toBe("FULL");

    const sessions = [await wsConnect(created.sessionId, created.hostSeatToken)];
    for (const j of joins) {
      sessions.push(await wsConnect(j.sessionId, j.seatToken));
    }
    expect(sessions.map((s) => s.welcome.seatId)).toEqual([0, 1, 2, 3]);

    // Everyone sees 4 human-controlled haulers in the stream.
    const snap = await sessions[3]!.nextSnapshot(
      (sn) => sn.haulers.every((h) => h.control === "human"),
    );
    expect(snap.haulers).toHaveLength(4);
    for (const s of sessions) await s.room.leave();
  });

  it("invalid seat token → AUTH join error", async () => {
    const created = await restCreate();
    await expect(wsConnect(created.sessionId, "not-a-token")).rejects.toMatchObject({
      code: 4101,
    });
  });

  it("protocol mismatch → PROTOCOL join error (code 4100)", async () => {
    const created = await restCreate();
    await expect(
      wsConnect(created.sessionId, created.hostSeatToken, undefined, 999),
    ).rejects.toMatchObject({ code: 4100 });
  });

  it("unconsented drop → AI pilots seat; reconnect token restores seat within grace", async () => {
    const created = await restCreate("Dropper");
    const s1 = await wsConnect(created.sessionId, created.hostSeatToken);
    const reconnectToken = s1.welcome.reconnectToken;

    // Move right so restored position is distinguishable from spawn.
    let seq = 0;
    for (let i = 0; i < 30; i++) {
      s1.room.send("input", { type: "input", seatId: 0, command: makeCmd(++seq, 1) });
      await new Promise((r) => setTimeout(r, 20));
    }
    const before = await s1.nextSnapshot();
    const xBefore = before.haulers.find((h) => h.seatId === 0)!.x;
    expect(xBefore).toBeGreaterThan(before.haulers.find((h) => h.seatId === 1)!.x - 1);

    // Simulate network drop (non-consented close).
    await s1.room.leave(false);
    await new Promise((r) => setTimeout(r, 250)); // let server process the close

    // Observer sees the seat flip to AI during grace.
    const view = await fetch(
      `${server.httpUrl}/api/v1/sessions/${created.sessionId}`,
    ).then((r) => r.json() as Promise<{ seats: { occupied: boolean; control: string }[] }>);
    expect(view.seats[0]).toMatchObject({ occupied: true, control: "ai" });

    // Reconnect with the stored token: same seat, position preserved.
    const s2 = await wsConnect(created.sessionId, created.hostSeatToken, reconnectToken);
    expect(s2.welcome.seatId).toBe(0);
    const restoredX = s2.welcome.snapshot.haulers.find((h) => h.seatId === 0)!.x;
    // Friction may slide the hauler a few px after the drop; still same spot.
    // P3 AI may pilot/move the seat during the grace gap; soft continuity only.
    expect(Math.abs(restoredX - xBefore)).toBeLessThan(120);
    expect(s2.welcome.reconnectToken).not.toBe(reconnectToken); // rotated
    await s2.room.leave();
  });

  it("input with mismatched seatId → S2C_Error AUTH; host seq unchanged", async () => {
    const created = await restCreate();
    const s = await wsConnect(created.sessionId, created.hostSeatToken);
    const before = await s.nextSnapshot();
    const hostAck = before.lastProcessedInputSeq[0] ?? 0;

    s.room.send("input", { type: "input", seatId: 2, command: makeCmd(1, 1) });
    await new Promise((r) => setTimeout(r, 200));
    const err = s.messages.find((m) => m.type === "error");
    expect(err?.payload).toMatchObject({ type: "error", code: "AUTH" });
    const snap = await s.nextSnapshot();
    // Forged seat-2 input must not advance the host's ack.
    expect(snap.lastProcessedInputSeq[0] ?? 0).toBe(hostAck);
    await s.room.leave();
  });
});
