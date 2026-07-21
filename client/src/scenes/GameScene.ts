/**
 * P2 dev render scene: draws the box level's solid grid + 4 haulers as
 * colored placeholder rects (own hauler predicted, remotes interpolated).
 * Not the real C-02 presentation — placeholders per Implementation Plan P2.
 */

import Phaser from "phaser";
import type { SessionClient } from "../net/sessionClient.js";
import type { LevelGeometry } from "../net/lobbyClient.js";

const SEAT_COLORS = [0xff5555, 0x55aaff, 0x55dd55, 0xffcc44];

export class GameScene extends Phaser.Scene {
  private session!: SessionClient;
  private geometry!: LevelGeometry;
  private gfx!: Phaser.GameObjects.Graphics;
  private labels: Phaser.GameObjects.Text[] = [];
  private hud!: Phaser.GameObjects.Text;

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
    g.fillStyle(0x2a2740, 1);
    for (let cy = 0; cy < this.geometry.height; cy++) {
      const row = this.geometry.solid[cy] ?? "";
      for (let cx = 0; cx < this.geometry.width; cx++) {
        if (row[cx] === "#") g.fillRect(cx * bs, cy * bs, bs - 1, bs - 1);
      }
    }
    const e = this.geometry.exit;
    g.fillStyle(0x3a6, 0.5);
    g.fillRect(e.x, e.y, e.width, e.height);
  }

  override update(): void {
    if (!this.gfx) return;
    this.gfx.clear();
    const kin = { halfW: 12, halfH: 14 };
    const now = performance.now();
    const snap = this.session.latestSnapshot();
    const local = this.session.localState();
    const localSeat = this.session.seatId;

    for (let seatId = 0; seatId < 4; seatId++) {
      let x: number | null = null;
      let y: number | null = null;
      let facing = 1;
      let tag = "";
      if (seatId === localSeat && local) {
        x = local.x;
        y = local.y;
        facing = local.facing;
        tag = "you";
      } else {
        const s = this.session.interpolator().sample(seatId, now);
        if (s) {
          x = s.x;
          y = s.y;
          facing = s.facing;
          tag = s.control === "ai" ? "ai" : (s.name ?? "human");
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
      label.setText(tag).setPosition(x - kin.halfW, y - kin.halfH - 12);
    }

    const cstate = this.session.connectionState;
    this.hud.setText(
      `seat ${localSeat}  ${cstate}  tick ${snap?.tick ?? "-"}  ack ${
        snap ? (snap.lastProcessedInputSeq[localSeat] ?? 0) : "-"
      }`,
    );
  }
}
