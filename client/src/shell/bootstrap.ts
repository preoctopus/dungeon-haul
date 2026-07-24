import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene.js";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type ClientShellConfig } from "./config.js";
import { STUB_SCENES } from "./scenes/stubs.js";

/** Pure config builder so scale/scene wiring is testable without a DOM/canvas. */
export function buildGameConfig(config: ClientShellConfig): Phaser.Types.Core.GameConfig {
  return {
    type: Phaser.AUTO,
    parent: config.parent,
    width: LOGICAL_WIDTH,
    height: LOGICAL_HEIGHT,
    backgroundColor: "#1a1626",
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [BootScene, ...STUB_SCENES],
  };
}

/** Bootstraps the Phaser game at the frozen 960×540 logical resolution (Q5). */
export function createGame(config: ClientShellConfig): Phaser.Game {
  return new Phaser.Game(buildGameConfig(config));
}
