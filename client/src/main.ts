import { mountDevLobby } from "./devLobby";
import { createGame } from "./shell/bootstrap.js";

const game = createGame({
  parent: "game",
  apiBaseUrl: import.meta.env["VITE_SERVER_URL"] ?? "http://localhost:8080",
});

// P2: DOM create/join UI overlays the canvas; on connect it starts GameScene.
mountDevLobby(game);
