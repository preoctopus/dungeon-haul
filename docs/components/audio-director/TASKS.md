# C-13 — Audio Director — Tasks

> **Component ID:** C-13  
> **Ownership:** SE-8  
> **Task ID prefix:** `C13-T##`  
> **Design:** [DESIGN.md](DESIGN.md)  
> **Depends on:** C-01 scene hooks, C-02/C-04 events, asset placeholders later under `assets/audio/`

Documentation / planning tasks only in this phase. Implementation sequenced for build phases; no application code here.

---

## Phase alignment

| Plan phase | Audio work |
|---|---|
| **P0–P2** | Unlock stub + silent-safe director; optional boot click |
| **P3** | Core gameplay SFX from `S2C_Event` |
| **P4** | Screen music + end stingers + UI |
| **P6** | Full §4 event coverage + biome stems |

---

## Tasks

### C13-T01 — Freeze `AudioEvent` catalog from design §4

**Goal:** Treat DESIGN §7 as the authoritative event enum for all producers.  
**Deliverable:** Event tables reviewed against design doc §4.1–4.4; gaps listed.  
**Acceptance:**

- [ ] Every §4.1 music stem has a logical key  
- [ ] Every §4.2 character unique + generic sound has an event  
- [ ] Every §4.3 object/trap sound has an event  
- [ ] Every §4.4 idle + ending interface sound has an event  
- [ ] Online extras (§7.7) marked optional  

---

### C13-T02 — Manifest schema + placeholder asset list

**Goal:** Document `AudioManifest` shape and minimal placeholder files needed for MVP.  
**Depends on:** C13-T01  
**Acceptance:**

- [ ] Manifest fields documented (DESIGN §9)  
- [ ] MVP subset checklist: title music, jump, pickup, drop, throw, stun, spikes, count, fanfare, start/skip  
- [ ] Path convention agreed with future `docs/art/`  
- [ ] Missing-asset = silent + one dev warn  

---

### C13-T03 — Unlock-on-first-gesture design verification

**Goal:** Specify gesture sources and queue behavior for autoplay policy.  
**Acceptance:**

- [ ] Gestures: pointer, key, gamepad listed  
- [ ] Pre-unlock queue policy (last music wins; SFX capped)  
- [ ] Attract remains silent until unlock (assumption confirmed)  

---

### C13-T04 — AudioDirector skeleton (client)

**Goal:** Construct director in Boot; no throw if WebAudio unavailable.  
**Phase:** P0–P2  
**Depends on:** Phaser boot scene (C-01)  
**Acceptance:**

- [ ] `create`, `setScreen`, `play`, unlock handler exist  
- [ ] Safe no-op when sound system missing  
- [ ] Unit/mock: play before unlock enqueues  

---

### C13-T05 — Music by screen

**Goal:** `setScreen` switches stems for Title, Credits, HighScores, Instructions, Lobby, Level, Fork, End.  
**Phase:** P4  
**Depends on:** C13-T04, placeholder music files or silent loops  
**Acceptance:**

- [ ] Scene wake calls `setScreen`  
- [ ] Re-entering same stem does not restart (unless forced)  
- [ ] Level without biome falls back to dungeon or hoard stem  

---

### C13-T06 — Music by biome

**Goal:** Map biome → `music.level.*` including Hoard.  
**Phase:** P4–P6  
**Depends on:** C13-T05, level biome metadata (C-09)  
**Acceptance:**

- [ ] Hoard → `music.level.hoard`  
- [ ] Dungeon/Lava/Ice/Cavern/Mist mapped  
- [ ] Fork → `music.fork`; End → `music.ending`  
- [ ] Crossfade or cut policy implemented per DESIGN  

---

### C13-T07 — SFX channels + polyphony caps

**Goal:** Enforce channel buses and drop-oldest under load.  
**Phase:** P3  
**Depends on:** C13-T04  
**Acceptance:**

- [ ] Channels: music, char, object, trap, ui, stinger  
- [ ] Caps per DESIGN §6.1  
- [ ] Unit test: overflow drops oldest one-shot  

---

### C13-T08 — Wire `S2C_Event` → AudioEvent

**Goal:** Net event adapter per DESIGN §8.  
**Phase:** P3  
**Depends on:** C-04 event dispatch, C13-T07  
**Acceptance:**

- [ ] pickup/drop/throw/spill/stun/trip mapped  
- [ ] trap_trigger kind map with generic fallback  
- [ ] switch down/up regular vs heavy  
- [ ] Optional takeover cues behind flag  

---

### C13-T09 — Character banks (unique + generic)

**Goal:** Resolve per-character paths for unique events; shared for generic.  
**Phase:** P3–P6  
**Depends on:** C13-T02  
**Acceptance:**

- [ ] `ctx.character` selects bank  
- [ ] Argue uses ≥1 variant (3 when assets exist)  
- [ ] Coin bag uses generic event  
- [ ] Unique/Set pickup uses special event  

---

### C13-T10 — Local prediction SFX (jump / land)

**Goal:** Responsive local jump/land without waiting for server event.  
**Phase:** P3  
**Depends on:** C-03/C-02 hooks  
**Acceptance:**

- [ ] Local jump edge → `char.jump`  
- [ ] Land cooldown 100 ms per seat  
- [ ] No double-fire if server also emits (dedupe or server skip for local)  

---

### C13-T11 — UI idle sounds

**Goal:** Skip-to-title and start-game cues.  
**Phase:** P4  
**Depends on:** C-01 attract/title  
**Acceptance:**

- [ ] `ui.skip_to_title` on return-to-title  
- [ ] `ui.start_game` on lobby start path  
- [ ] Works only after unlock (or queues)  

---

### C13-T12 — End Director stinger API

**Goal:** Full ending event surface for C-11 sequencing.  
**Phase:** P4  
**Depends on:** C-11 End Director cues  
**Acceptance:**

- [ ] Count / unique count / set complete / fanfare  
- [ ] Unique reward/penalty + common modifier  
- [ ] Place 1–4 (can stub shared beep MVP)  
- [ ] Rummage + take finish 1–4  
- [ ] High-score change/enter/submit beeps  

---

### C13-T13 — Volume + mute controls

**Goal:** Master/music/sfx multipliers; global mute.  
**Phase:** P4–P5  
**Acceptance:**

- [ ] API for volumes 0..1  
- [ ] Mute silences all buses  
- [ ] Dev defaults documented  
- [ ] Persistence stretch (localStorage) optional  

---

### C13-T14 — Rate-limit spam control

**Goal:** Implement DESIGN §10 cooldowns.  
**Phase:** P3  
**Depends on:** C13-T07  
**Acceptance:**

- [ ] Land / switch / spill multi-drop limits  
- [ ] Chaos loot playtest does not peg CPU audio thread  

---

### C13-T15 — Manual browser matrix

**Goal:** Verify unlock + playback on target browsers.  
**Phase:** P4  
**Acceptance:**

- [ ] Chrome, Firefox, Safari, Edge notes filed under `docs/testing/` when ready  
- [ ] No audio before gesture  
- [ ] Music starts after first gesture on Title  

---

### C13-T16 — Full design §4 coverage pass

**Goal:** Fill remaining trap/enemy/UI events and biome music.  
**Phase:** P6  
**Depends on:** Asset availability  
**Acceptance:**

- [ ] Checklist of all DESIGN §7 events: implemented or explicitly deferred with reason  
- [ ] Manifest complete for shipped content set  

---

### C13-T17 — Docs sync after implementation

**Goal:** Update DESIGN paths, Phaser API notes, actual asset names.  
**Phase:** First audio PR  
**Acceptance:**

- [ ] DESIGN §9/§12 match repo  
- [ ] Cross-links from COMPONENTS.md still valid  

---

## Out of scope (explicit)

| Item | Reason |
|---|---|
| Procedural music generation | Non-goal |
| Voice chat / WebRTC audio | Non-goal |
| Server-side audio | Client-only |
| Asset composition | Art pipeline |
| Full 3D spatial audio | Stretch pan only |

---

## Dependency summary

```text
C13-T01 → C13-T02 → C13-T04 → C13-T05 → C13-T06
                  ↘ C13-T07 → C13-T08
                           ↘ C13-T09
                           ↘ C13-T10
                           ↘ C13-T14
C13-T04 → C13-T11
C-11 → C13-T12
C13-T04 → C13-T13
C13-T05.. → C13-T15 → C13-T16
```

## Producer handoffs

| Producer | Needs from audio |
|---|---|
| C-01 Shell | `setScreen`, UI events |
| C-02 Presentation | Optional local land/jump hooks |
| C-04 Netcode | Event stream subscription |
| C-11 End Director | Stinger event names §7.6 |
