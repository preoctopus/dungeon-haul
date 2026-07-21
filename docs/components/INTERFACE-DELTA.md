# Interface delta proposals (SE-1)

**Status:** ✅ **ACCEPTED 2026-07-20** (all four proposals) — applied to
[lobby-and-scores.md](../interfaces/lobby-and-scores.md) and
[netcode-messages.md](../interfaces/netcode-messages.md). Kept for history.  
**Scope:** Gaps found while designing **C-01 Client Shell** and **C-11 End Screen Director**.  
**Stack:** No stack changes. Phaser3+TS client, Colyseus server, existing packages remain.

---

## 1. Soft-unique character claim (Q9)

**Frozen decision:** Soft-unique characters — prefer distinct; **allow clash**.

**Current text:** [lobby-and-scores.md](../interfaces/lobby-and-scores.md) character claim notes `409 CONFLICT` if taken; [netcode-messages.md](../interfaces/netcode-messages.md) `C2S_ClaimCharacter` “may fail if taken (policy)”.

**Proposal:**
- Server **accepts** duplicate `CharacterId` across seats for MVP.
- Optional UX warning only on client (C-01).
- Replace hard-unique language with:  
  `Claim always succeeds for valid CharacterId; seats may share a character. Client may warn when selecting an already-claimed character.`
- Remove REST `409 CONFLICT` for “character taken” (keep `409` only for true conflicts e.g. double seat bind if any).

**Why:** Align wire docs with ARCHITECT-OPEN-QUESTIONS Q9 / ARCHITECTURE assumption 2.

---

## 2. End cinematic payload alongside `ScoreReport`

**Gap:** C-11 needs per-item toss data, set completion triggers, **slowest→fastest** order, and exit walk-on order. Current `ScoreReport` has aggregates (`inventoryValueGp`, modifiers, takes) but not item sequences or ordering.

**Proposal (additive):** Extend `S2C_ScoreReport` **or** sibling field on the same message:

```text
ScoreReport {
  // ...existing fields...
  cinema?: EndCinemaData
}

EndCinemaData {
  tossOrderSeatIds: number[]     // slowest → fastest (len 4)
  exitOrderSeatIds: number[]     // first exit → last on final level
  players: {
    seatId: number
    items: {
      instanceId: string
      defId: string
      displayName: string
      valueGp: number
      setId?: string
    }[]
  }[]
  setCompletions: {
    setId: string
    displayName: string
    bonusGp: number
    contributorSeatIds: number[]
    completingInstanceId: string
  }[]
}
```

**Rules:**
- All GP values and completion bonuses must match rules evaluation already used for `totalTreasureGp` / takes — **server-authored only**.
- Client must not re-derive values from `defId` for official totals (display names OK from shared catalog later).

**Why:** Independent C-11 development and multi-client deterministic cinematics without inventing scores client-side.

---

## 3. Optional: high-score fanfare threshold

**Gap:** Design: fanfare if haul higher than totals on high-score list.

**Proposal:** Include optional `recordFanfareThresholdGp?: number` on `ScoreReport` or pass via lobby snapshot at end. Server may query top `totalHaulGp` or omit (client skips fanfare).

---

## 4. Optional: expose `levelsAfterHoard` in public session view

**Gap:** C-01 progress UI should not hardcode 7; Q8 makes cap configurable (default 2 MVP / 7 full).

**Proposal:** Add to `GET /sessions/:id` and/or snapshots:

```text
levelsAfterHoard: number
levelsCompleted: number  // already on snapshot
```

**Why:** Progress copy “Level k / n” without client config drift.

---

## Non-proposals (explicitly out)

- No global pause message (Q10 remains).
- No public matchmaking endpoints (Q2).
- No client-authoritative `ScoreReport`.
- No stack / transport changes.
