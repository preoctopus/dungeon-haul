import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";

/** Frozen logical resolution: 960×540, integer-friendly FIT + letterbox. */
export const LOGICAL_WIDTH = 960;
export const LOGICAL_HEIGHT = 540;

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  backgroundColor: "#1a1626",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene],
});
