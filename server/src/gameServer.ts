/**
 * Process composition (C-05 DESIGN §4 MVP): lobby REST (Hono) and the
 * Colyseus game server share one Node process. They listen on two ports —
 * Colyseus owns its HTTP listener for its matchmake/WS handshake routes;
 * the client receives the explicit `wsUrl` from the lobby contract, so the
 * split is invisible to the wire contracts. (Single-origin reverse proxy is
 * a P5 deploy concern.)
 *
 * Used by main.ts and by the WS integration tests (ephemeral ports).
 */

import { createServer } from "node:http";
import { serve, type ServerType } from "@hono/node-server";
import { matchMaker, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createApp } from "./app.js";
import { LobbyService } from "./lobby/service.js";
import { HaulSession, setHaulSessionDeps } from "./rooms/haulSession.js";

export interface RunningGameServer {
  port: number;
  wsPort: number;
  httpUrl: string;
  wsUrl: string;
  lobby: LobbyService;
  shutdown(): Promise<void>;
}

export interface GameServerOptions {
  /** REST port (0 = ephemeral). Default: $PORT or 8080. */
  port?: number;
  /** WebSocket/Colyseus port (0 = ephemeral). Default: $WS_PORT or 2567. */
  wsPort?: number;
}

export async function startGameServer(opts: GameServerOptions = {}): Promise<RunningGameServer> {
  let wsUrl = process.env["PUBLIC_WS_URL"] ?? "";
  let activeRooms = 0;

  const lobby = new LobbyService({
    wsUrl: () => wsUrl,
    spawnRoom: async () => {
      const listing = await matchMaker.createRoom("haul_session", {});
      return listing.roomId;
    },
    levelsAfterHoard: Number(process.env["LEVELS_AFTER_HOARD"] ?? 2),
  });
  setHaulSessionDeps({ lobby });

  // Colyseus game server (own listener → its matchmake routes just work).
  const wsHttpServer = createServer();
  const colyseus = new Server({
    transport: new WebSocketTransport({ server: wsHttpServer }),
    greet: false,
    gracefullyShutdown: false,
  });
  colyseus
    .define("haul_session", HaulSession)
    .on("create", () => activeRooms++)
    .on("dispose", () => activeRooms--);
  await colyseus.listen(opts.wsPort ?? Number(process.env["WS_PORT"] ?? 2567));
  const wsAddress = wsHttpServer.address();
  const wsPort = typeof wsAddress === "object" && wsAddress !== null ? wsAddress.port : 0;
  if (!wsUrl) wsUrl = `ws://localhost:${wsPort}`;

  // Lobby REST + health (Hono).
  const app = createApp({ lobby, roomCount: () => activeRooms });
  const httpServer = await new Promise<ServerType>((resolve) => {
    const s = serve(
      { fetch: app.fetch, port: opts.port ?? Number(process.env["PORT"] ?? 8080) },
      () => resolve(s),
    );
  });
  const address = httpServer.address();
  const port = typeof address === "object" && address !== null ? address.port : 0;

  console.log(`dhaul server: REST http://localhost:${port}  game ${wsUrl}`);

  return {
    port,
    wsPort,
    httpUrl: `http://localhost:${port}`,
    wsUrl,
    lobby,
    shutdown: async () => {
      await colyseus.gracefullyShutdown(false);
      await new Promise<void>((resolve) => httpServer.close(() => resolve()));
    },
  };
}
