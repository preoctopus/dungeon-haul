import Phaser from "phaser";
import { getShellNavigator } from "../registry.js";

/**
 * Splash + Start affordance (C01-T03). Character walk-in/idle and the real
 * background scroll are C-02 art hooks; this scene only wires the navigation
 * behavior so later presentation work can slot in without touching flow.
 */
export class TitleScene extends Phaser.Scene {
  private onStart?: () => void;

  constructor() {
    super("Title");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#1a1626");

    this.add
      .text(480, 220, "DUNGEON HAUL", {
        fontFamily: "monospace",
        fontSize: "32px",
        color: "#f4d35e",
      })
      .setOrigin(0.5);

    const prompt = this.add
      .text(480, 320, "Press Start", {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#eeeeee",
      })
      .setOrigin(0.5);
    this.tweens.add({
      targets: prompt,
      alpha: { from: 1, to: 0.2 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.onStart = () => this.handleStart();
    this.input.keyboard?.on("keydown-ENTER", this.onStart);
    this.input.keyboard?.on("keydown-SPACE", this.onStart);
    this.input.once("pointerdown", this.onStart);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.onStart) {
        this.input.keyboard?.off("keydown-ENTER", this.onStart);
        this.input.keyboard?.off("keydown-SPACE", this.onStart);
        this.input.off("pointerdown", this.onStart);
      }
    });
  }

  /** No-op run-off-right hook until C-02 supplies the character sprite/animation. */
  runOff(onComplete: () => void): void {
    onComplete();
  }

  private handleStart(): void {
    this.runOff(() => {
      getShellNavigator(this).goLobby("create");
    });
  }
}
