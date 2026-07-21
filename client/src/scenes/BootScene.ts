import Phaser from "phaser";

/**
 * Boot + minimal asset preload for the P3 dev client.
 * Loads treasure atlas (game assets) so GameScene can draw free/carried loot.
 * Full C-01 scene flow lands later.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    this.load.atlas(
      "atlas_treasures",
      "assets/atlases/atlas_treasures.webp",
      "assets/atlases/atlas_treasures.json",
    );
    this.load.atlas(
      "atlas_tiles_mvp",
      "assets/atlases/atlas_tiles_mvp.webp",
      "assets/atlases/atlas_tiles_mvp.json",
    );
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#1a1626");
  }
}
