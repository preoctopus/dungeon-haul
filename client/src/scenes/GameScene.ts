/**
 * P3 dev render scene: solid grid + 4 haulers (predicted / interpolated) +
 * free treasure sprites from the game atlas. Not full C-02 presentation —
 * enough to playtest loot/spill online.
 */

import Phaser from "phaser";
import type { SessionClient } from "../net/sessionClient.js";
import type { LevelGeometry } from "../net/lobbyClient.js";

const SEAT_COLORS = [0xff5555, 0x55aaff, 0x55dd55, 0xffcc44];

/** Map rules defId → atlas frame. Frames use tre_ prefix (PIPELINE guide). */
function treasureFrame(defId: string): string {
  // Catalog ids are snake_case without prefix; art frames are tre_*.
  const direct = `tre_${defId}`;
  // Chests in atlas are tre_wooden_chest_closed etc.
  if (defId.endsWith("_chest")) return `tre_${defId}_closed`;
  return direct;
}

export class GameScene extends Phaser.Scene {
  private session!: SessionClient;
  private geometry!: LevelGeometry;
  private gfx!: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private hud!: Phaser.GameObjects.Text;
  private treasureSprites = new Map<string, Phaser.GameObjects.GameObject & { setPosition: (x: number, y: number) => unknown; setVisible: (v: boolean) => unknown; destroy: () => void }>();
  private carrySprites: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super("Game");
  }

  init(data: { session: SessionClient; geometry: LevelGeometry }): void {
    this.session = data.session;
    this.geometry = data.geometry;
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#12101c");
    this.drawStatic();
    this.gfx = this.add.graphics();
    for (let i = 0; i < 4; i++) {
      this.labels.push(
        this.add.text(0, 0, "", { fontSize: "10px", color: "#ffffff" }).setDepth(10),
      );
    }
    this.hud = this.add
      .text(8, 8, "", { fontSize: "12px", color: "#9fe" })
      .setScrollFactor(0)
      .setDepth(20);
  }

  private drawStatic(): void {
    const bs = this.geometry.blockSizePx;
    const g = this.add.graphics();
    const hasTiles = this.textures.exists("atlas_tiles_mvp");
    for (let cy = 0; cy < this.geometry.height; cy++) {
      const row = this.geometry.solid[cy] ?? "";
      for (let cx = 0; cx < this.geometry.width; cx++) {
        if (row[cx] !== "#") continue;
        if (hasTiles && this.textures.get("atlas_tiles_mvp").has("blk_brick_dungeon")) {
          this.add
            .image(cx * bs + bs / 2, cy * bs + bs / 2, "atlas_tiles_mvp", "blk_brick_dungeon")
            .setDisplaySize(bs, bs)
            .setDepth(0);
        } else {
          g.fillStyle(0x2a2740, 1);
          g.fillRect(cx * bs, cy * bs, bs - 1, bs - 1);
        }
      }
    }
    const e = this.geometry.exit;
    g.fillStyle(0x3a6, 0.5);
    g.fillRect(e.x, e.y, e.width, e.height);
  }

  private syncTreasures(
    treasures: { instanceId: string; defId: string; x: number; y: number }[],
  ): void {
    const seen = new Set<string>();
    const hasAtlas = this.textures.exists("atlas_treasures");
    for (const t of treasures) {
      seen.add(t.instanceId);
      let spr = this.treasureSprites.get(t.instanceId);
      if (!spr) {
        const frame = treasureFrame(t.defId);
        if (hasAtlas && this.textures.get("atlas_treasures").has(frame)) {
          const img = this.add.image(t.x, t.y, "atlas_treasures", frame).setDepth(5);
          img.setDisplaySize(20, 20);
          spr = img;
        } else {
          // Fallback if catalog id has no atlas frame yet.
          spr = this.add.circle(t.x, t.y, 6, 0xffd700).setDepth(5);
        }
        this.treasureSprites.set(t.instanceId, spr);
      }
      spr.setPosition(t.x, t.y);
      spr.setVisible(true);
    }
    for (const [id, spr] of this.treasureSprites) {
      if (!seen.has(id)) {
        spr.destroy();
        this.treasureSprites.delete(id);
      }
    }
  }

  private syncCarryIcons(
    localSeat: number,
    carry: { instanceId: string; defId: string }[] | undefined,
  ): void {
    for (const s of this.carrySprites) s.destroy();
    this.carrySprites = [];
    if (!carry || carry.length === 0) return;
    const hasAtlas = this.textures.exists("atlas_treasures");
    carry.slice(0, 8).forEach((c, i) => {
      const frame = treasureFrame(c.defId);
      const x = 12 + i * 18;
      const y = 28;
      if (hasAtlas && this.textures.get("atlas_treasures").has(frame)) {
        const spr = this.add
          .image(x, y, "atlas_treasures", frame)
          .setScrollFactor(0)
          .setDepth(21)
          .setDisplaySize(16, 16);
        this.carrySprites.push(spr);
      } else {
        this.carrySprites.push(
          this.add.circle(x, y, 6, 0xffd700).setScrollFactor(0).setDepth(21),
        );
      }
    });
    void localSeat;
  }

  override update(): void {
    if (!this.gfx) return;
    this.gfx.clear();
    const kin = { halfW: 12, halfH: 14 };
    const now = performance.now();
    const snap = this.session.latestSnapshot();
    const local = this.session.localState();
    const localSeat = this.session.seatId;

    if (snap) {
      this.syncTreasures(snap.treasures);
      const me = snap.haulers.find((h) => h.seatId === localSeat);
      this.syncCarryIcons(localSeat, me?.carry);
    }

    for (let seatId = 0; seatId < 4; seatId++) {
      let x: number | null = null;
      let y: number | null = null;
      let facing = 1;
      let tag = "";
      let carryN = 0;
      if (seatId === localSeat && local) {
        x = local.x;
        y = local.y;
        facing = local.facing;
        tag = "you";
        carryN = snap?.haulers.find((h) => h.seatId === seatId)?.carry.length ?? 0;
      } else {
        const s = this.session.interpolator().sample(seatId, now);
        if (s) {
          x = s.x;
          y = s.y;
          facing = s.facing;
          tag = s.control === "ai" ? "ai" : (s.name ?? "human");
          carryN = snap?.haulers.find((h) => h.seatId === seatId)?.carry.length ?? 0;
        }
      }
      const label = this.labels[seatId]!;
      if (x === null || y === null) {
        label.setText("");
        continue;
      }
      const color = SEAT_COLORS[seatId]!;
      this.gfx.fillStyle(color, 1);
      this.gfx.fillRect(x - kin.halfW, y - kin.halfH, kin.halfW * 2, kin.halfH * 2);
      // facing pip
      this.gfx.fillStyle(0xffffff, 1);
      this.gfx.fillRect(x + facing * (kin.halfW - 4) - 2, y - 4, 4, 4);
      // carry stack height pip
      if (carryN > 0) {
        this.gfx.fillStyle(0xffd700, 1);
        this.gfx.fillRect(x - kin.halfW, y - kin.halfH - 6, Math.min(carryN, 6) * 4, 3);
      }
      label.setText(tag).setPosition(x - kin.halfW, y - kin.halfH - 12);
    }

    const cstate = this.session.connectionState;
    const carryHud = snap?.haulers.find((h) => h.seatId === localSeat)?.carry.length ?? 0;
    this.hud.setText(
      `seat ${localSeat}  ${cstate}  tick ${snap?.tick ?? "-"}  ack ${
        snap ? (snap.lastProcessedInputSeq[localSeat] ?? 0) : "-"
      }  loot ${carryHud}`,
    );
  }
}
