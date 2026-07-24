import Phaser from "phaser";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from "./shell/config.js";
import { ManifestLoader, BootScene } from "./scenes/BootScene";
import { mountDevLobby } from "./devLobby";

const game = new Phaser.Game({
  type: Phaser.AUTO,
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
