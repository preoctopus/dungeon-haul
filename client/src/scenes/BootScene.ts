import Phaser from "phaser";
import { getShellNavigator } from "../shell/registry.js";

/** Shape of client/public/assets/manifest.json (written by the asset pipeline). */
interface ManifestAtlas {
  key: string;
  texture: string;
  atlas: string;
}
interface ManifestImage {
  key: string;
  path: string;
}
export interface Manifest {
  name: string;
  version: string;
  atlases: ManifestAtlas[];
  images: ManifestImage[];
}

/** Scene params passed from ManifestLoader into Boot. */
interface BootParams {
  manifest: Manifest | null;
}

// ── ManifestLoader: tiny scene that pulls in the JSON index only ────────────

/**
 * Loads just `assets/manifest.json` so Boot can discover every atlas / image
 * on disk without hard-coding paths. Kept as a separate scene because Phaser's
 * loader queues files synchronously in preload() — you cannot read from cache
 * inside the same preload that queues them.
 */
export class ManifestLoader extends Phaser.Scene {
  constructor() {
    super("ManifestLoader");
  }

  preload(): void {
    const progress = this.add.text(10, 10, "Loading manifest…", { fontSize: "14px" });
    this.load.on("progress", (value: number) => {
      progress.setText(`Loading manifest… ${(Math.round(value * 100))}%`);
    });
    this.load.json("dh_manifest", "assets/manifest.json");
  }

  create(): void {
    const raw = this.cache.json.get("dh_manifest") as Manifest | undefined;
    if (!raw || !Array.isArray(raw.atlases) || raw.atlases.length === 0) {
      this.add.text(
        10, 10,
        "ERROR: missing or empty asset manifest.\nRun scripts/ to regenerate.",
        { fontSize: "14px", color: "#f55" },
      );
      return;
    }
    this.scene.start("Boot", { manifest: raw });
  }
}

// ── Boot: queue every atlas + background image declared by the manifest ─────

/**
 * Preload + minimal asset preload for the dev client. Loads all atlases and
 * screen images from manifest.json so GameScene can draw haulers, loot,
 * enemies, VFX, UI icons, props, and backgrounds without falling back to
 * colored rectangles / gold circles.
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
