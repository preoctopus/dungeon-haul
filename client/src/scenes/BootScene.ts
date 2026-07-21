import Phaser from "phaser";

/** P0 stub: clear-color boot scene only. Real scene flow lands with C-01. */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#1a1626");
  }
}
