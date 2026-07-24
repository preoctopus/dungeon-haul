import type { SessionPhase } from "@dhaul/protocol";
import type { ShellBus } from "./events/shellBus.js";
import type { SceneKey } from "./scenes/types.js";

/** Minimal seam over Phaser's scene manager so the navigator is testable with fakes. */
export interface SceneSwitcher {
  start(key: SceneKey, data?: unknown): void;
}

export interface ShellError {
  code: "PROTOCOL" | "AUTH" | "FULL" | "PHASE" | "NETWORK" | "INTERNAL" | "HTTP";
  message: string;
  recoverable: boolean;
}

/**
 * Pure phase→scene mapping (DESIGN.md §4.5). Returns null for "closed", since
 * the caller decides between HighScores and Title for the disconnect UX.
 */
export function phaseToSceneKey(phase: SessionPhase): SceneKey | null {
  switch (phase) {
    case "lobby":
      return "Lobby";
    case "instructions":
      return "Instructions";
    case "level":
      return "Level";
    case "fork":
      return "Fork";
    case "end_count":
    case "end_shares":
    case "end_spoils":
    case "end_entry":
      return "End";
    case "closed":
      return null;
  }
}

/** DESIGN.md §4.3 — scene switch helpers; no business UI, just navigation + events. */
export class ShellNavigator {
  private current: SceneKey | undefined;

  constructor(
    private readonly scenes: SceneSwitcher,
    private readonly bus: ShellBus,
  ) {}

  goTitle(_reason?: "user" | "idle" | "session_end" | "error"): void {
    this.go("Title");
  }

  goCredits(): void {
    this.go("Credits");
  }

  goHighScores(opts?: { fromEndFlow?: boolean }): void {
    this.go("HighScores", opts);
  }

  goLobby(mode: "create" | "join" | "resume"): void {
    this.go("Lobby", { mode });
  }

  enterSessionPlay(phase: SessionPhase): void {
    const key = phaseToSceneKey(phase);
    if (key) {
      this.go(key, { phase });
    }
  }

  showConnecting(message?: string): void {
    this.go("Connecting", { message });
  }

  showError(error: ShellError): void {
    this.go("ErrorOverlay", { error });
  }

  leaveSessionToTitle(): void {
    this.go("Title", { reason: "session_end" });
  }

  private go(key: SceneKey, data?: unknown): void {
    const from = this.current;
    if (from) {
      this.bus.emit({ type: "scene_exit", scene: from });
    }
    this.scenes.start(key, data);
    this.current = key;
    this.bus.emit(from ? { type: "scene_enter", scene: key, from } : { type: "scene_enter", scene: key });
  }
}
