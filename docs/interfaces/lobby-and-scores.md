# Contract: Lobby REST & High Scores API

**Producers:** Lobby & Session Service, High Score & Persistence  
**Consumers:** Client Shell, optional tools  
**Auth model (MVP):** Opaque seat/completion tokens (no full user accounts)

---

## Base

- JSON over HTTPS  
- Prefix: `/api/v1`  
- Errors: `{ "error": { "code": string, "message": string } }`

---

## Lobby / Sessions

### `POST /api/v1/sessions`

Create a private room.

**Request**
```text
{ "displayName?: string", "region?: string" }
```

**Response 201**
```text
{
  "sessionId": string
  "joinCode": string          // short human code, e.g. 6 chars
  "wsUrl": string
  "seats": SeatStatus[4]
  "hostSeatToken": string     // creator auto-claimed seat 0 (or first free)
  "reconnectToken": string
}
```

### `POST /api/v1/sessions/join`

**Request**
```text
{ "joinCode": string, "displayName?: string" }
```

**Response 200**
```text
{
  "sessionId": string
  "wsUrl": string
  "seatId": number
  "seatToken": string
  "reconnectToken": string
  "seats": SeatStatus[4]
  "phase": SessionPhase
}
```

**Errors:** `NOT_FOUND`, `FULL`, `CLOSED`

### `GET /api/v1/sessions/:sessionId`

Public lobby view (no tokens).

**Response**
```text
{
  "sessionId": string
  "joinCode": string
  "phase": SessionPhase
  "seats": SeatStatus[4]
  "levelsCompleted": number
}
```

### `SeatStatus`

```text
{
  "seatId": number
  "occupied": bool
  "control": "human" | "ai" | "empty"
  "character"?: CharacterId
  "ready": bool
  "displayName"?: string
}
```

### Character claim

Preferred via WS `C2S_ClaimCharacter`. Optional REST:

`POST /api/v1/sessions/:id/claim`  
Headers: `Authorization: Seat <seatToken>`  
Body: `{ "character": CharacterId }`

**Policy (assumption):** unique characters preferred; if taken, `409 CONFLICT`.

---

## High scores

### `GET /api/v1/highscores`

**Query:** `?limit=25`

**Response**
```text
{
  "top": HighScoreRow[]
  "lastRun"?: {
    "sessionId": string
    "entries": { name?: string, character: CharacterId, takeGp: number, sharePercent: number }[]
  }
  "recentNewIds": string[]    // last three highscore row ids for "New!" tag
}
```

### `HighScoreRow`

```text
{
  "id": string
  "name": string
  "character": CharacterId
  "takeGp": number
  "sharePercent": number
  "totalHaulGp": number
  "createdAt": string  // ISO-8601
}
```

### `POST /api/v1/highscores`

**Request**
```text
{
  "completionToken": string
  "seatId": number
  "name": string
}
```

**Server validation**
1. Token matches completed session `ScoreReport`.  
2. Seat was human.  
3. `eligibleForHighScore` true.  
4. Name: 1–12 chars, allowlist charset.  
5. Single submit per seat/token.

**Response 201:** `HighScoreRow`  
**Errors:** `UNAUTHORIZED`, `CONFLICT`, `VALIDATION`

---

## Health

### `GET /health`

```text
{ "ok": true, "version": string, "rooms"?: number }
```

---

## CORS & static

- API may be same-origin with static client or explicit CORS allowlist.  
- Static SPA fallback must not swallow `/api/*` or WS paths (Build Plan warning still applies if reverse-proxied).

---

## Test contract

- Create → join ×3 → fourth join succeeds → fifth `FULL`  
- Join bad code → `NOT_FOUND`  
- Submit score without token → fail  
- Submit twice → `CONFLICT`  
- AI seat submit → fail  
