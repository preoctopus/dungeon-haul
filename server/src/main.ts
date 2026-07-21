import { startGameServer } from "./gameServer.js";

startGameServer().catch((err) => {
  console.error("fatal: server failed to start", err);
  process.exit(1);
});
