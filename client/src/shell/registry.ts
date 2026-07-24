import type Phaser from "phaser";
import type { ShellBus } from "./events/shellBus.js";
import type { ShellNavigator } from "./navigator.js";

const NAVIGATOR_KEY = "shellNavigator";
const BUS_KEY = "shellBus";

/** Publishes the shell singletons on the game registry so any scene can reach them. */
export function setShellRegistry(game: Phaser.Game, navigator: ShellNavigator, bus: ShellBus): void {
  game.registry.set(NAVIGATOR_KEY, navigator);
  game.registry.set(BUS_KEY, bus);
}

export function getShellNavigator(scene: Phaser.Scene): ShellNavigator {
  const navigator = scene.registry.get(NAVIGATOR_KEY) as ShellNavigator | undefined;
  if (!navigator) {
    throw new Error("ShellNavigator not registered — createGame() must run before scenes start");
  }
  return navigator;
}

export function getShellBus(scene: Phaser.Scene): ShellBus {
  const bus = scene.registry.get(BUS_KEY) as ShellBus | undefined;
  if (!bus) {
    throw new Error("ShellBus not registered — createGame() must run before scenes start");
  }
  return bus;
}
