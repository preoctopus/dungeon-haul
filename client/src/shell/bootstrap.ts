import Phaser from "phaser";
import { BootScene } from "../scenes/BootScene.js";
import { LOGICAL_HEIGHT, LOGICAL_WIDTH, type ClientShellConfig } from "./config.js";
import { ShellBus } from "./events/shellBus.js";
import { ShellNavigator, type SceneSwitcher } from "./navigator.js";
import { setShellRegistry } from "./registry.js";
import { STUB_SCENES } from "./scenes/stubs.js";
import { TitleScene } from "./scenes/TitleScene.js";
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
    scene: [BootScene, TitleScene, ...STUB_SCENES],
  };
}

/** Real {@link SceneSwitcher} adapter over Phaser's scene manager, for {@link ShellNavigator} at runtime. */
export class PhaserSceneSwitcher implements SceneSwitcher {
  constructor(private readonly game: Phaser.Game) {}

  start(key: SceneKey, data?: unknown): void {
    this.game.scene.start(key, data as object | undefined);
  }
}

/** Bootstraps the Phaser game at the frozen 960×540 logical resolution (Q5). */
export function createGame(config: ClientShellConfig): Phaser.Game {
  const game = new Phaser.Game(buildGameConfig(config));
  const bus = new ShellBus();
  const navigator = new ShellNavigator(new PhaserSceneSwitcher(game), bus);
  setShellRegistry(game, navigator, bus);
  return game;
}
