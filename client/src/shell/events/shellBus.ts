import type { ScoreReport } from "@dhaul/protocol";
import type { SceneKey } from "../scenes/types.js";

/** DESIGN.md §4.6 — events surfaced to C-02 presentation / C-13 audio / C-11 end director. */
export type ShellEvent =
  | { type: "scene_enter"; scene: SceneKey; from?: SceneKey }
  | { type: "scene_exit"; scene: SceneKey }
  | { type: "attract_tick"; screen: "title" | "credits" | "highscores" }
  | { type: "ui_confirm" | "ui_cancel" | "ui_any" }
  | { type: "transition"; kind: "fade_out" | "fade_in" | "run_off"; ms: number }
  | { type: "local_menu"; open: boolean }
  | { type: "end_host_ready"; scoreReport?: ScoreReport };

export type ShellEventListener = (event: ShellEvent) => void;

/** Typed pub/sub for {@link ShellEvent}; DOM/Phaser-free so it's unit-testable. */
export class ShellBus {
  private readonly listeners = new Set<ShellEventListener>();

  on(listener: ShellEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(event: ShellEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}
