import Phaser from "phaser";
import { getShellNavigator } from "../shell/registry.js";

interface AssetManifest {
  atlases: { key: string; texture: string; atlas: string }[];
  images: { key: string; path: string }[];
}

/**
 * Boot + asset preload. Loads every atlas/image from the production
 * manifest (docs/art/PIPELINE-AND-PHASER-GUIDE.md §2 Option A) so scenes
 * can draw real art instead of placeholder rects, then hands off to Title.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload(): void {
    this.load.json("asset_manifest", "assets/manifest.json");
  }

  create(): void {
    const manifest = this.cache.json.get("asset_manifest") as AssetManifest;
    for (const atlasInfo of manifest.atlases) {
      this.load.atlas(atlasInfo.key, atlasInfo.texture, atlasInfo.atlas);
    }
    for (const imgInfo of manifest.images) {
      this.load.image(imgInfo.key, imgInfo.path);
    }
    this.load.once(Phaser.Loader.Events.COMPLETE, () => this.onAssetsLoaded());
    this.load.start();
  }

  private onAssetsLoaded(): void {
    this.cameras.main.setBackgroundColor("#1a1626");
    getShellNavigator(this).goTitle();
  }
}
