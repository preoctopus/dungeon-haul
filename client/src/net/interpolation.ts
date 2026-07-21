/**
 * C-04 remote hauler interpolation (netcode-client DESIGN §9).
 * Pure module: buffers timed snapshots per seat, samples ~2 ticks in the
 * past to absorb jitter, holds the last transform on underrun (no long
 * extrapolation).
 */

import type { HaulerPublic, WorldSnapshot } from "@dhaul/protocol";

export interface RemoteSample {
  x: number;
  y: number;
  facing: 1 | -1;
  anim: string;
  control: string;
  name?: string;
}

interface TimedHauler {
  atMs: number;
  hauler: HaulerPublic;
}

const BUFFER_MAX = 12;

export class RemoteInterpolator {
  private readonly buffers = new Map<number, TimedHauler[]>();

  constructor(
    /** Render delay in ms (~2 ticks at 30 Hz). */
    private readonly delayMs = 66,
  ) {}

  /** Ingest an authoritative snapshot (client receive time). */
  push(snapshot: WorldSnapshot, nowMs: number, excludeSeatId?: number): void {
    for (const hauler of snapshot.haulers) {
      if (hauler.seatId === excludeSeatId) continue;
      let buf = this.buffers.get(hauler.seatId);
      if (!buf) {
        buf = [];
        this.buffers.set(hauler.seatId, buf);
      }
      buf.push({ atMs: nowMs, hauler });
      while (buf.length > BUFFER_MAX) buf.shift();
    }
  }

  /** Sample a seat's transform at `nowMs - delayMs`. Null if never seen. */
  sample(seatId: number, nowMs: number): RemoteSample | null {
    const buf = this.buffers.get(seatId);
    if (!buf || buf.length === 0) return null;
    const t = nowMs - this.delayMs;

    // Find the segment [a, b] spanning t.
    let a = buf[0]!;
    let b = buf[buf.length - 1]!;
    for (let i = 0; i < buf.length - 1; i++) {
      if (buf[i]!.atMs <= t && buf[i + 1]!.atMs >= t) {
        a = buf[i]!;
        b = buf[i + 1]!;
        break;
      }
    }
    if (t <= a.atMs) return toSample(a.hauler);
    if (t >= b.atMs) return toSample(b.hauler); // underrun: hold last
    const alpha = (t - a.atMs) / (b.atMs - a.atMs);
    const near = alpha < 0.5 ? a.hauler : b.hauler;
    const sample = toSample(near);
    sample.x = a.hauler.x + (b.hauler.x - a.hauler.x) * alpha;
    sample.y = a.hauler.y + (b.hauler.y - a.hauler.y) * alpha;
    return sample;
  }
}

function toSample(h: HaulerPublic): RemoteSample {
  const s: RemoteSample = {
    x: h.x,
    y: h.y,
    facing: h.facing,
    anim: h.anim,
    control: h.control,
  };
  if (h.name !== undefined) s.name = h.name;
  return s;
}
