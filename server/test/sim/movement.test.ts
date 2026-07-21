import { beforeEach, describe, expect, it } from "vitest";
import { DEFAULT_SIM_CONFIG } from "../../src/sim/config.js";
import { boxLevel, cmd, makeSim, resetSeq, runTape } from "./helpers.js";

const KIN = DEFAULT_SIM_CONFIG.kinematics;
// Box level: floor top at y = 5*32 = 160; resting body center ≈ 160 - halfH.
const FLOOR_TOP = 5 * 32;
const REST_Y = FLOOR_TOP - KIN.halfH;

beforeEach(resetSeq);

function hauler(snapshot: { haulers: { seatId: number }[] }, seatId: number) {
  const h = snapshot.haulers.find((x) => x.seatId === seatId);
  if (!h) throw new Error(`no hauler ${seatId}`);
  return h as (typeof snapshot.haulers)[number] & {
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: number;
    anim: string;
    control: string;
  };
}

describe("sim: determinism", () => {
  it("identical input tapes produce identical positions", () => {
    const tape = () => {
      resetSeq();
      return [
        ...Array.from({ length: 10 }, () => cmd({ x: 1 })),
        ...Array.from({ length: 5 }, () => cmd({ x: 1, jump: true })),
        ...Array.from({ length: 15 }, () => cmd({ x: -1 })),
      ];
    };
    const a = makeSim();
    a.bindHuman(0, "h1");
    const snapsA = runTape(a, 0, tape());

    const b = makeSim();
    b.bindHuman(0, "h1");
    const snapsB = runTape(b, 0, tape());

    expect(snapsA.map((s) => hauler(s, 0))).toEqual(
      snapsB.map((s) => hauler(s, 0)),
    );
  });

  it("settles onto the floor and never produces NaN", () => {
    // AI off (TEST_SIM_CONFIG) so seats stay idle after landing.
    const sim = makeSim();
    for (let i = 0; i < 60; i++) sim.step();
    const snap = sim.buildSnapshot();
    for (const h of snap.haulers) {
      expect(Number.isFinite(h.x) && Number.isFinite(h.y)).toBe(true);
      expect(h.y).toBeGreaterThan(REST_Y - 1);
      expect(h.y).toBeLessThan(REST_Y + 1);
      expect(h.anim === "idle" || h.anim === "run").toBe(true);
      expect(Math.abs(h.vx)).toBeLessThan(1);
    }
  });
});

describe("sim: run", () => {
  it("moves right under held input and faces the run direction", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    const snaps = runTape(sim, 0, Array.from({ length: 30 }, () => cmd({ x: 1 })));
    const first = hauler(snaps[0]!, 0);
    const last = hauler(snaps.at(-1)!, 0);
    expect(last.x).toBeGreaterThan(first.x + 100);
    expect(last.facing).toBe(1);
    expect(Math.abs(last.vx)).toBeLessThanOrEqual(KIN.maxSpeed);
  });

  it("stops against the left wall without penetrating it", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    const snaps = runTape(sim, 0, Array.from({ length: 90 }, () => cmd({ x: -1 })));
    const last = hauler(snaps.at(-1)!, 0);
    // Left wall occupies cell 0 → inner face at x = 32; body min x = 32 + halfW.
    expect(last.x).toBeGreaterThanOrEqual(32 + KIN.halfW - 0.01);
    expect(last.x).toBeLessThan(32 + KIN.halfW + 1);
    expect(last.vx).toBe(0);
  });
});

describe("sim: jump", () => {
  it("jump edge triggers once per press cycle (held jump does not re-fire)", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    // Settle.
    runTape(sim, 0, Array.from({ length: 20 }, () => cmd()));
    // Hold jump for 40 ticks: one launch, land, and stay grounded after.
    const snaps = runTape(
      sim,
      0,
      Array.from({ length: 40 }, () => cmd({ jump: true })),
    );
    const apex = Math.min(...snaps.map((s) => hauler(s, 0).y));
    expect(apex).toBeLessThan(REST_Y - 40); // actually left the ground
    const tail = snaps.slice(-5).map((s) => hauler(s, 0));
    for (const h of tail) {
      expect(h.y).toBeCloseTo(REST_Y, 0); // no re-jump while held
      expect(h.anim).toBe("idle");
    }
    // Release then press again → second jump fires.
    runTape(sim, 0, [cmd()]);
    const again = runTape(
      sim,
      0,
      Array.from({ length: 10 }, () => cmd({ jump: true })),
    );
    expect(Math.min(...again.map((s) => hauler(s, 0).y))).toBeLessThan(REST_Y - 20);
  });

  it("air steer moves the hauler horizontally mid-jump", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    runTape(sim, 0, Array.from({ length: 20 }, () => cmd())); // settle
    const x0 = hauler(sim.buildSnapshot(), 0).x;
    const snaps = runTape(sim, 0, [
      cmd({ jump: true }),
      ...Array.from({ length: 12 }, () => cmd({ x: 1, jump: true })),
    ]);
    const mid = snaps[8]!;
    expect(hauler(mid, 0).y).toBeLessThan(REST_Y - 10); // airborne
    expect(hauler(snaps.at(-1)!, 0).x).toBeGreaterThan(x0 + 20);
  });
});

describe("sim: no tunneling", () => {
  it("a body dropped from far above the floor lands on it (fixed dt, capped fall)", () => {
    // Direct kinematics check at terminal velocity: worst case per-tick move is
    // maxFallSpeed * dt = 18px < blockSize; sub-stepping must still land.
    const sim = makeSim();
    // Teleport-free equivalent: run many ticks; the seats spawn airborne and
    // must come to rest exactly on the floor, never below it.
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i < 120; i++) {
      const { snapshot } = sim.step();
      for (const h of snapshot.haulers) {
        minY = Math.min(minY, h.y);
        maxY = Math.max(maxY, h.y);
      }
    }
    expect(maxY).toBeLessThanOrEqual(REST_Y + 0.5);
  });

  it("kinematics config caps fall distance below one block per tick", () => {
    const bs = boxLevel().blockSizePx;
    expect((KIN.maxFallSpeed * KIN.dt)).toBeLessThan(bs);
  });
});

describe("sim: input seq handling", () => {
  it("ignores duplicate and stale seqs, tolerates gaps, acks last processed", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");

    expect(sim.applyInput(0, cmd({ seq: 5, x: 1 }))).toBe(true);
    expect(sim.applyInput(0, cmd({ seq: 5, x: -1 }))).toBe(false); // dup
    expect(sim.applyInput(0, cmd({ seq: 3, x: -1 }))).toBe(false); // stale
    expect(sim.applyInput(0, cmd({ seq: 9, x: 1 }))).toBe(true); // gap OK

    let snap = sim.step().snapshot;
    expect(snap.lastProcessedInputSeq[0]).toBe(5);
    snap = sim.step().snapshot;
    expect(snap.lastProcessedInputSeq[0]).toBe(9);
    // Queue drained: ack stays.
    snap = sim.step().snapshot;
    expect(snap.lastProcessedInputSeq[0]).toBe(9);
  });

  it("bounds the per-seat queue, dropping oldest", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    for (let i = 1; i <= 20; i++) sim.applyInput(0, cmd({ seq: i }));
    const snap = sim.step().snapshot;
    // Only the newest inputQueueMax remain; first applied is 20 - max + 1.
    expect(snap.lastProcessedInputSeq[0]).toBe(20 - DEFAULT_SIM_CONFIG.inputQueueMax + 1);
  });
});

describe("sim: seats and control", () => {
  it("always exposes exactly 4 hauler seats", () => {
    const snap = makeSim().step().snapshot;
    expect(snap.haulers.map((h) => h.seatId)).toEqual([0, 1, 2, 3]);
    expect(snap.haulers.every((h) => h.control === "ai")).toBe(true);
  });

  it("AI seats stay controlled and produce finite motion (P3 decide)", () => {
    const sim = makeSim();
    let snap = sim.buildSnapshot();
    for (let i = 0; i < 60; i++) snap = sim.step().snapshot;
    // P2 stood idle; P3 AI may walk (exit bias / flock). Assert stability only.
    expect(snap.haulers).toHaveLength(4);
    for (const h of snap.haulers) {
      expect(h.control).toBe("ai");
      expect(Number.isFinite(h.x) && Number.isFinite(h.y)).toBe(true);
    }
  });

  it("flips human → AI after the 20s idle window and back on a human packet", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    const idle = DEFAULT_SIM_CONFIG.humanIdleAiTicks;

    let takeover;
    for (let i = 0; i < idle + 2; i++) {
      const { events } = sim.step();
      takeover = events.find((e) => e.type === "ai_takeover") ?? takeover;
    }
    expect(takeover).toEqual({ type: "ai_takeover", seatId: 0 });
    expect(sim.seatState(0).control).toBe("ai");

    sim.applyInput(0, cmd({ x: 1 }));
    const { events } = sim.step();
    expect(events).toContainEqual({ type: "human_takeover", seatId: 0 });
    expect(sim.seatState(0).control).toBe("human");
  });

  it("releaseHuman flips to AI immediately; permanent release clears binding", () => {
    const sim = makeSim();
    sim.bindHuman(1, "h2", "Bea");
    expect(sim.seatsPublic()[1]).toMatchObject({
      occupied: true,
      control: "human",
      displayName: "Bea",
    });

    const events = sim.releaseHuman(1, false);
    expect(events).toContainEqual({ type: "ai_takeover", seatId: 1 });
    expect(sim.seatsPublic()[1]).toMatchObject({ occupied: true, control: "ai" });

    sim.releaseHuman(1, true);
    expect(sim.seatsPublic()[1]).toMatchObject({ occupied: false, control: "ai" });
  });

  it("soft-takeover keeps position on rebind", () => {
    const sim = makeSim();
    sim.bindHuman(0, "h1");
    runTape(sim, 0, Array.from({ length: 30 }, () => cmd({ x: 1 })));
    const before = hauler(sim.buildSnapshot(), 0);
    sim.releaseHuman(0, false);
    sim.bindHuman(0, "h1");
    const after = hauler(sim.buildSnapshot(), 0);
    expect(after.x).toBe(before.x);
    expect(after.y).toBe(before.y);
  });
});

describe("sim: snapshot contract fields", () => {
  it("emits phase/level/config fields per WorldSnapshot", () => {
    const snap = makeSim().step().snapshot;
    expect(snap.phase).toBe("level");
    expect(snap.levelId).toBe("box_level");
    expect(snap.levelsCompleted).toBe(0);
    expect(snap.levelsAfterHoard).toBe(DEFAULT_SIM_CONFIG.levelsAfterHoard);
    expect(snap.treasures).toEqual([]);
    expect(snap.traps).toEqual([]);
    expect(snap.switches).toEqual([]);
    expect(Object.keys(snap.lastProcessedInputSeq)).toHaveLength(4);
  });
});
