/**
 * C07-T06/T07 — computeInventoryValue (DESIGN §6.5, §6.7).
 *
 * - Non-set items: baseValueGp (or valueOverrideGp) summed to owner seat.
 * - Incomplete set pieces: contribute pieceBaseValueGp (or override) to owner.
 * - Complete sets (all pieces present party-wide): piece values superseded by
 *   setGrossGp = floor(pieceBase * pieceCount * (100 + bonus) / 100), split
 *   per contributor as floor(setGrossGp * piecesHeld / pieceCount); remainder
 *   GP → contributor with most pieces, tie → lowest seatId.
 *
 * Owner attribution requires per-seat inventories; a flat TreasureInstance[]
 * is accepted for the share-modifier-api signature and attributed to seat 0.
 */
import type {
  InventoryValueResult,
  SeatId,
  SeatInventory,
  SetCompletion,
  SetDef,
  TreasureInstance,
} from "../types.js";
import { getTreasureDef } from "./catalog.js";
import { SET_DEFS } from "./sets.js";

function isSeatInventoryArray(
  input: readonly SeatInventory[] | readonly TreasureInstance[],
): input is readonly SeatInventory[] {
  return input.length === 0 || "items" in (input[0] as object);
}

export function computeInventoryValue(
  inventories: readonly SeatInventory[] | readonly TreasureInstance[],
  setCatalog: readonly SetDef[] = SET_DEFS,
): InventoryValueResult {
  const seats: readonly SeatInventory[] = isSeatInventoryArray(inventories)
    ? inventories
    : [{ seatId: 0, items: inventories }];

  const setById = new Map(setCatalog.map((s) => [s.id, s]));
  // Membership comes from the active set catalog (supports test overrides),
  // falling back to the def's own setId tag.
  const setIdByPiece = new Map<string, string>();
  for (const set of setCatalog) {
    for (const pieceId of set.pieceDefIds) setIdByPiece.set(pieceId, set.id);
  }
  const perSeatGp = new Map<SeatId, number>(seats.map((s) => [s.seatId, 0]));
  const add = (seatId: SeatId, gp: number) =>
    perSeatGp.set(seatId, (perSeatGp.get(seatId) ?? 0) + gp);

  // Partition: set pieces per set vs everything else.
  // setPieces: setId → per-seat piece instances (with override values).
  const setPieces = new Map<
    string,
    { seatId: SeatId; defId: string; valueGp: number }[]
  >();

  for (const seat of seats) {
    for (const item of seat.items) {
      const def = getTreasureDef(item.defId);
      if (!def) {
        throw new Error(`computeInventoryValue: unknown defId "${item.defId}"`);
      }
      const value = item.valueOverrideGp ?? def.baseValueGp;
      const memberSetId = setIdByPiece.get(def.id);
      if (memberSetId !== undefined) {
        const list = setPieces.get(memberSetId) ?? [];
        list.push({ seatId: seat.seatId, defId: def.id, valueGp: value });
        setPieces.set(memberSetId, list);
      } else {
        add(seat.seatId, value);
      }
    }
  }

  const setCompletions: SetCompletion[] = [];

  for (const [setId, pieces] of setPieces) {
    const set = setById.get(setId);
    if (!set) continue;
    const heldDefIds = new Set(pieces.map((p) => p.defId));
    const complete = set.pieceDefIds.every((id) => heldDefIds.has(id));

    if (!complete) {
      // Incomplete: pieces contribute base (or override) to their owner.
      for (const p of pieces) add(p.seatId, p.valueGp);
      continue;
    }

    // Complete: supersede piece values with set valuation (§6.5).
    const pieceCount = set.pieceDefIds.length;
    const setGrossGp = Math.floor(
      (set.pieceBaseValueGp * pieceCount * (100 + set.setBonusPercent)) / 100,
    );
    const bonusGp = setGrossGp - set.pieceBaseValueGp * pieceCount;

    // Pieces held per contributing seat (instance count).
    const piecesBySeat = new Map<SeatId, number>();
    for (const p of pieces) {
      piecesBySeat.set(p.seatId, (piecesBySeat.get(p.seatId) ?? 0) + 1);
    }
    const contributors = [...piecesBySeat.entries()]
      .map(([seatId, count]) => ({
        seatId,
        pieces: count,
        awardedGp: Math.floor((setGrossGp * count) / pieceCount),
      }))
      .sort((a, b) => a.seatId - b.seatId);

    // Remainder → most pieces, tie → lowest seatId.
    const awarded = contributors.reduce((sum, c) => sum + c.awardedGp, 0);
    let remainder = setGrossGp - awarded;
    if (remainder > 0) {
      const target = [...contributors].sort(
        (a, b) => b.pieces - a.pieces || a.seatId - b.seatId,
      )[0];
      if (target) target.awardedGp += remainder;
      remainder = 0;
    }

    for (const c of contributors) add(c.seatId, c.awardedGp);
    setCompletions.push({
      setId: set.id,
      name: set.name,
      bonusGp,
      setGrossGp,
      contributors,
    });
  }

  // Stable order: catalog set order for completions.
  const setOrder = new Map(setCatalog.map((s, i) => [s.id, i]));
  setCompletions.sort(
    (a, b) => (setOrder.get(a.setId) ?? 0) - (setOrder.get(b.setId) ?? 0),
  );

  const perSeat = [...perSeatGp.entries()]
    .map(([seatId, gp]) => ({ seatId, gp }))
    .sort((a, b) => a.seatId - b.seatId);

  return {
    totalGp: perSeat.reduce((sum, s) => sum + s.gp, 0),
    perSeatGp: perSeat,
    setCompletions,
  };
}
