import Phaser from "phaser";
import { ManifestLoader, BootScene } from "./scenes/BootScene";
import { mountDevLobby } from "./devLobby";
import { createGame } from "./shell/bootstrap.js";

const game = createGame({
  parent: "game",
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  backgroundColor: "#1a1626",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [ManifestLoader, BootScene],
});

// P2: DOM create/join UI overlays the canvas; on connect it starts GameScene.
mountDevLobby(game);
