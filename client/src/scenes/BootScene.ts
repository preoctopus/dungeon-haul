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

  preload(params: BootParams): void {
    const manifest = params?.manifest ?? null;
    if (!manifest) {
      this.add.text(
        10, 10,
        "ERROR: no manifest supplied by ManifestLoader.",
        { fontSize: "14px", color: "#f55" },
      );
      return;
    }

    const progress = this.add.text(10, 10, `Loading ${manifest.atlases.length + manifest.images.length} assets…`, { fontSize: "14px" });
    this.load.on("progress", (value: number) => {
      // value is a running fraction of the total bytes queued in THIS scene's loader.
      progress.setText(`Loading assets… ${(Math.round(value * 100))}%`);
    });

    for (const a of manifest.atlases) {
      this.load.atlas(a.key, a.texture, a.atlas);
    }
    for (const img of manifest.images) {
      this.load.image(img.key, img.path);
    }
  }

  create(_params: BootParams): void {
    this.cameras.main.setBackgroundColor("#1a1626");
    getShellNavigator(this).goTitle();
  }
}
