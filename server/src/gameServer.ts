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

  // Fail fast if the port is already in use. Node's http.Server emits 'error'
  // on EADDRINUSE; without an error handler, that event becomes unhandled and
  // colyseus.listen() hangs (never resolves or rejects). We attach a one-shot
  // listener that rejects a promise, then race it against listen() so any
  // failure surfaces within milliseconds instead of the next test timeout.
  let _wsErr: NodeJS.ErrnoException | undefined;
  const errorPromise = new Promise<void>((_resolve, reject) => {
    const onErr = (err: NodeJS.ErrnoException) => {
      _wsErr = err;
      wsHttpServer.removeListener("error", onErr);
      reject(
        Object.assign(new Error(`dhaul server: ws port already in use (${err.code})`), { err }),
      );
    };
    wsHttpServer.once("error", onErr);
  });

  const colyseus = new Server({
    transport: new WebSocketTransport({ server: wsHttpServer }),
    greet: false,
    gracefullyShutdown: false,
  });
  colyseus
    .define("haul_session", HaulSession)
    .on("create", () => activeRooms++)
    .on("dispose", () => activeRooms--);
  const wsPortArg = opts.wsPort ?? Number(process.env["WS_PORT"] ?? 2567);

  // Race listen() resolution against the 'error' event. If colyseus.listen()
  // hangs on EADDRINUSE (as it does in older Node), errorPromise wins the race.
  await Promise.race([colyseus.listen(wsPortArg), errorPromise]);

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
