import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene.js";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type ClientShellConfig } from "./config.js";
import type { SceneSwitcher } from "./navigator.js";
import { STUB_SCENES } from "./scenes/stubs.js";
import type { SceneKey } from "./scenes/types.js";

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

/** Real {@link SceneSwitcher} adapter over Phaser's scene manager, for {@link ShellNavigator} at runtime. */
export class PhaserSceneSwitcher implements SceneSwitcher {
  constructor(private readonly game: Phaser.Game) {}

  start(key: SceneKey, data?: unknown): void {
    this.game.scene.start(key, data as object | undefined);
  }
}
