import { describe, expect, it, vi } from "vitest";
import { ShellBus, type ShellEvent } from "../src/shell/events/shellBus.js";
import { phaseToSceneKey, ShellNavigator, type SceneSwitcher } from "../src/shell/navigator.js";

describe("phaseToSceneKey", () => {
  it("maps play phases to their scene keys", () => {
    expect(phaseToSceneKey("lobby")).toBe("Lobby");
    expect(phaseToSceneKey("instructions")).toBe("Instructions");
    expect(phaseToSceneKey("level")).toBe("Level");
    expect(phaseToSceneKey("fork")).toBe("Fork");
  });

  it("maps every end sub-phase to End", () => {
    expect(phaseToSceneKey("end_count")).toBe("End");
    expect(phaseToSceneKey("end_shares")).toBe("End");
    expect(phaseToSceneKey("end_spoils")).toBe("End");
    expect(phaseToSceneKey("end_entry")).toBe("End");
  });

  it("returns null for closed so the caller picks HighScores vs Title", () => {
    expect(phaseToSceneKey("closed")).toBeNull();
  });
});

function fakeSwitcher(): SceneSwitcher & { started: Array<{ key: string; data?: unknown }> } {
  const started: Array<{ key: string; data?: unknown }> = [];
  return {
    started,
    start(key, data) {
      started.push({ key, data });
    },
  };
}

describe("ShellNavigator", () => {
  it("switches between registered stub scenes", () => {
    const scenes = fakeSwitcher();
    const nav = new ShellNavigator(scenes, new ShellBus());

    nav.goTitle();
    nav.goLobby("create");
    nav.enterSessionPlay("fork");

    expect(scenes.started.map((s) => s.key)).toEqual(["Title", "Lobby", "Fork"]);
  });

  it("does not switch scenes for closed phase", () => {
    const scenes = fakeSwitcher();
    const nav = new ShellNavigator(scenes, new ShellBus());

    nav.enterSessionPlay("closed");

    expect(scenes.started).toEqual([]);
  });

  it("emits scene_enter/scene_exit around each switch", () => {
    const scenes = fakeSwitcher();
    const bus = new ShellBus();
    const events: ShellEvent[] = [];
    bus.on((event) => events.push(event));
    const nav = new ShellNavigator(scenes, bus);

    nav.goTitle();
    nav.goCredits();

    expect(events).toEqual([
      { type: "scene_enter", scene: "Title" },
      { type: "scene_exit", scene: "Title" },
      { type: "scene_enter", scene: "Credits", from: "Title" },
    ]);
  });

  it("stops notifying a listener after it unsubscribes", () => {
    const scenes = fakeSwitcher();
    const bus = new ShellBus();
    const listener = vi.fn();
    const off = bus.on(listener);
    const nav = new ShellNavigator(scenes, bus);

    nav.goTitle();
    off();
    nav.goCredits();

    expect(listener).toHaveBeenCalledTimes(1);
  });
});
