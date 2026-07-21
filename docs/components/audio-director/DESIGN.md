# C-13 — Audio Director — Design

> **Component ID:** C-13  
> **Ownership:** SE-8  
> **Status:** Documentation only (no application code)  
> **Sources:** Design doc §4.0–4.4 Sound Design, §5.3 Sound Assets; [ARCHITECTURE.md](../../ARCHITECTURE.md) NFR Audio; [COMPONENTS.md](../../COMPONENTS.md) C-13; [netcode-messages.md](../../interfaces/netcode-messages.md) `S2C_Event`

---

## 1. Purpose

Own **all client-side music and SFX policy**: when audio unlocks, which stem plays per screen/biome, how one-shot events map to channels, and volume/duck rules. Presentation (C-02) and Shell (C-01) fire **logical audio events**; Audio Director resolves them to assets and plays them.

Goals:

1. Unlock/resume `AudioContext` on first user gesture (browser autoplay policy).
2. Music follows screen + biome (design §4.1).
3. Character-specific vs generic SFX (design §4.2).
4. Object/trap/interface SFX (design §4.3–4.4) as a stable **event → sound** API.
5. Channel limits so loot chaos doesn’t clip into noise floor mush.

Non-goals:

- Asset generation / composition.
- Networking or authoritative sim.
- Spatial 3D audio (2D pan optional stretch).
- Voice chat.

---

## 2. Responsibilities & non-responsibilities

### Responsibilities

| Area | Detail |
|---|---|
| Unlock | First pointer/key/gamepad gesture → resume context; queue pre-unlock plays |
| Music | Crossfade or cut between title/credits/scores/instructions/level/fork/end stems |
| Biome music | Level stem keyed by biome (Hoard, Dungeon, Lava, Ice, Cavern, Mist, …) |
| SFX routing | Map logical events → asset keys → channels with polyphony caps |
| Character banks | Per-character unique set; shared generic set |
| UI stingers | End Director / Shell skip-start-count-share-spoils beeps |
| Settings hooks | Master / music / sfx volume (MVP: simple multipliers; persistence stretch) |
| Mute | Global mute for attract/dev; tab-blur optional duck |

### Non-responsibilities

- Creating waveform assets (art/audio pipeline → `docs/art/` later).
- Deciding *when* gameplay events happened (consumes `S2C_Event` / UI callbacks).
- Server telemetry (may log client audio errors only to console in MVP).

---

## 3. Placement in the system

```text
  C-01 Shell / Scenes ──scene enter/exit──┐
  C-02 Presentation ──anim/VFX hooks─────┼──► AudioDirector
  C-04 Netcode ──────S2C_Event/Phase─────┤         │
  C-11 End Director ─cinematic cues──────┘         ▼
                                            Phaser Sound / WebAudio
                                            asset manifest
```

- **Client-only** component (Phaser 3 sound system or thin WebAudio wrapper).
- Server never plays audio; server events are the *triggers*.
- Lost events while disconnected are not replayed (snapshots don’t re-fire SFX); acceptable MVP.

---

## 4. Browser unlock policy

Browsers block audio until a user gesture.

### 4.1 Unlock flow

```text
Boot → AudioDirector.create() → state = Locked
Any first gesture (pointerdown | keydown | gamepad button) on game canvas/document
  → sound.context.resume() / Phaser unlock
  → state = Unlocked
  → flush PendingQueue (music start, UI click if any)
```

### 4.2 Rules

| Rule | Detail |
|---|---|
| Single unlock | Idempotent; subsequent gestures no-op |
| Pre-unlock | `playMusic` / `playSfx` enqueue max N items (drop oldest SFX; keep last music request) |
| Attract loop | May remain silent until first gesture, then start Title/attract music |
| Autoplay failure | Log once; retry on next gesture |

NFR (architecture): *Resume AudioContext on first user gesture.*

---

## 5. Music director

### 5.1 Stems (design §4.1)

| Logical stem | When |
|---|---|
| `music.title` | Title / Idle_Title |
| `music.credits` | Credits |
| `music.high_scores` | High Scores |
| `music.instructions` | Instructions |
| `music.level.hoard` | Level 0 Hoard (Gold/Horde room) |
| `music.level.dungeon` | Dungeon biome levels |
| `music.level.lava` | Lava |
| `music.level.ice` | Ice |
| `music.level.cavern` | Cavern |
| `music.level.mist` | Mist |
| `music.level.outside` | Outside biome if used |
| `music.fork` | Fork “Discussion” |
| `music.ending` | End sequence (count/shares/spoils) |

Legacy asset table (§5.3) used names like `menu-bg`, `attract-bg`, `credits-bg`, `reward-bg` — map those filenames in the manifest; logical keys above are stable API.

### 5.2 Transitions

| From → To | Policy MVP |
|---|---|
| Any → any music | Crossfade 200–400 ms if both loop; else cut |
| Level → Fork | Switch to `music.fork` |
| Fork → Level | Switch to target biome stem |
| Level → End | Switch to `music.ending` |
| Same stem re-enter | No restart (keep playhead) unless `forceRestart` |

### 5.3 API

```text
AudioDirector.setScreen(screen: AudioScreen, detail?: { biome?: BiomeId, levelId?: string })
AudioDirector.setMusicEnabled(on: bool)
AudioDirector.setMusicVolume(v: 0..1)
```

`setScreen` is the primary Shell hook on scene wake/sleep.

```text
AudioScreen =
  | "boot" | "title" | "credits" | "high_scores"
  | "lobby" | "instructions" | "level" | "fork"
  | "end" | "attract"
```

Lobby reuses `music.title` or a quiet bed (assumption: title stem MVP).

---

## 6. SFX system

### 6.1 Channels

| Channel | Polyphony cap (MVP) | Examples |
|---|---|---|
| `music` | 1 (+1 during crossfade) | stems |
| `char` | 4 | per-character vocalizations / jumps |
| `object` | 6 | impact, drop, throw, switch |
| `trap` | 4 | spikes, gas, lightning, golem, hand |
| `ui` | 4 | menus, end count, name entry |
| `stinger` | 2 | fanfares, place awards |

When cap exceeded: **drop oldest** one-shot on that channel (music never dropped mid-crossfade without replace policy).

### 6.2 Bus volumes

```text
masterVolume
  ├─ musicVolume
  └─ sfxVolume  (applies to char/object/trap/ui/stinger)
```

Optional duck: on `stinger` play, lower music −6 dB for duration (stretch).

### 6.3 Core play API

```text
AudioDirector.play(event: AudioEvent, ctx?: AudioEventContext): void
AudioDirector.stopChannel(channel: ChannelId): void
AudioDirector.stopAllSfx(): void

AudioEventContext {
  seatId?: number
  character?: CharacterId    // required for character-unique events
  defId?: string             // treasure id for unique/set distinction
  trapKind?: string
  volume?: number            // 0..1 local multiply
  pan?: number               // -1..1 stretch
}
```

Callers should prefer **logical `AudioEvent` names**, not raw filenames.

---

## 7. Design §4 sounds as API events

This section is the **contract** between gameplay/UI and audio. Asset files may be placeholders; event names stay stable.

### 7.1 Character — unique per character (§4.2)

Resolve with `ctx.character` ∈ { Gnome, Sprite, Halfling, Dwarf }.

| `AudioEvent` | Notes |
|---|---|
| `char.hurt` | On hurt / trap non-stun damage feel |
| `char.stunned` | Stun applied |
| `char.fell_off_screen` | Fall death / recycle |
| `char.argue` | Fork argue pulse; ≥3 variants — random pick |
| `char.jump` | Jump just-pressed confirm (local + optional remote thin) |
| `char.pickup_treasure` | Normal pickup |
| `char.pickup_unique_or_set` | Unique or Set rarity pickup |

**Net policy:** Prefer playing character SFX for **local seat** always; remote seats play at reduced volume or only for “important” events (stun, unique pickup) to reduce cacophony (MVP: all seats, rely on channel caps).

### 7.2 Character — generic shared (§4.2)

| `AudioEvent` | Notes |
|---|---|
| `char.pickup_coin_bag` | Coin sack defs |
| `char.land` | Landing on ground (rate-limit per seat ~100 ms) |
| `char.throw` | Throw treasure |
| `char.drop` | Drop treasure |
| `char.push` | Push contact |
| `char.trip` | Trip attack |

### 7.3 Object sounds (§4.3)

| `AudioEvent` | Notes |
|---|---|
| `object.impact` | Thrown/dropped treasure hits surface or hauler |
| `object.switch_regular_down` | Regular switch pressed |
| `object.switch_regular_up` | Regular switch released |
| `object.switch_heavy_down` | Heavy switch pressed |
| `object.switch_heavy_up` | Heavy switch released |

### 7.4 Trap sounds (§4.3)

| `AudioEvent` | Notes |
|---|---|
| `trap.crumbling_strain` | Crumbling block under stress |
| `trap.crumbling_break` | Collapse |
| `trap.receding_in` | Receding block slide in |
| `trap.receding_out` | Slide out |
| `trap.lightning_zap` | Lightning trap fire |
| `trap.gas_release` | Gas trap |
| `trap.golem_stomp` | Golem move |
| `trap.golem_attack` | Golem hit |
| `trap.golem_stunned` | Golem stunned |
| `trap.phantom_drop` | Phantom Hand drop |
| `trap.phantom_escape` | Hand flees |
| `trap.phantom_hurt` | Hand damaged |
| `trap.spikes` | MVP spike trap (asset table example) |
| `trap.generic` | Fallback unknown `trapKind` |

### 7.5 Interface — Idle (§4.4)

| `AudioEvent` | Notes |
|---|---|
| `ui.skip_to_title` | Any-button return to Title from attract chain |
| `ui.start_game` | Start / create-join flow begin |

### 7.6 Interface — Ending scene (§4.4)

| `AudioEvent` | Notes |
|---|---|
| `end.count_treasure` | Each common toss into pile |
| `end.count_unique_treasure` | Unique toss |
| `end.set_complete` | Set popout |
| `end.count_complete_fanfare` | Total flash / high haul fanfare |
| `end.unique_reward` | Unique gold share title |
| `end.unique_penalty` | Unique red penalty |
| `end.common_modifier` | Common white/blue title |
| `end.place_1` … `end.place_4` | Placement stingers |
| `end.rummage` | Spoils rummage loop/one-shots |
| `end.take_finish_1` … `end.take_finish_4` | Finished taking spoils |
| `end.highscore_awarded` | Qualifies for entry / new high |
| `end.highscore_change_char` | Letter/slot change beep |
| `end.highscore_enter_char` | Confirm letter beep |
| `end.highscore_submit` | Submitted entry |

### 7.7 Extra online/UI events (architecture-era)

| `AudioEvent` | Notes |
|---|---|
| `ui.ready_toggle` | Lobby ready |
| `ui.error` | Join fail / full room |
| `ui.connect` | WS connected (subtle) |
| `ui.disconnect` | Connection lost |
| `game.ai_takeover` | Optional soft cue on `ai_takeover` event |
| `game.human_takeover` | Drop-in cue |
| `game.level_exit` | Hauler reaches exit (optional) |
| `game.phase_change` | Generic fallback if stem not yet mapped |

---

## 8. Mapping from `S2C_Event` → `AudioEvent`

Netcode examples → director plays:

| `S2C_Event.type` | Audio mapping |
|---|---|
| `pickup` | If coin bag def → `char.pickup_coin_bag`; else if Unique/Set → `char.pickup_unique_or_set`; else `char.pickup_treasure` |
| `drop` | `char.drop` |
| `throw` | `char.throw` |
| `spill` | `char.drop` ×n rate-limited + optional `object.impact` |
| `stun` | `char.stunned` |
| `trip` | `char.trip` (+ `char.hurt` on target optional) |
| `trap_trigger` | Map `kind` → `trap.*` |
| `switch` | `pressed` → `*_down` else `*_up`; heavy vs regular from payload/level meta |
| `level_exit` | `game.level_exit` optional |
| `ai_takeover` | `game.ai_takeover` optional |
| `human_takeover` | `game.human_takeover` optional |

Hurt / land / jump may also come from **local prediction** (Input Mapper / Presentation) for responsiveness; server events remain source for remote haulers.

```text
// conceptual
net.onEvent(e => audio.fromNetEvent(e, snapshotLookup))
scene.events.on('jump', seat => audio.play('char.jump', { seatId, character }))
endDirector.on('countTreasure', meta => audio.play(...))
```

---

## 9. Asset manifest

Logical key → file(s). Placeholders allowed until art pass.

```text
AudioManifest {
  version: string
  music: { [stem: string]: { path: string, loop: bool, volume?: number } }
  sfx: {
    [event: string]: {
      path?: string
      paths?: string[]          // random variants (argue ×3)
      perCharacter?: { [CharacterId]: path | paths }
      channel: ChannelId
      cooldownMs?: number
      volume?: number
    }
  }
}
```

Missing asset: no-throw; dev warning once per key; silent production.

Suggested path conventions (from design §5.3, modernized):

```text
assets/audio/music/{stem}.ogg
assets/audio/sfx/char/{character}/{event}.ogg
assets/audio/sfx/object/{event}.ogg
assets/audio/sfx/trap/{event}.ogg
assets/audio/sfx/ui/{event}.ogg
assets/audio/sfx/end/{event}.ogg
```

Format: **Ogg Vorbis** primary, MP3 fallback if needed for Safari quirks (verify at implement time). Design left format open (“Discuss: Music Format?”).

---

## 10. Rate limits & spam control

| Event class | Rule |
|---|---|
| Land | Per-seat cooldown 100 ms |
| Jump | Edge only (no hold spam) |
| Argue | Variants rotate; channel cap |
| Spill multi-item | Max 3 drop SFX per spill event |
| Switch bounce | Cooldown 50 ms per switchId |
| Object impact | Channel drop-oldest |

---

## 11. Scene integration checklist

| Scene / system | Hooks |
|---|---|
| Boot | Construct director; load manifest; do not autoplay |
| Title | `setScreen('title')`; first gesture unlock |
| Credits / HighScores | `setScreen` |
| Lobby | `setScreen('lobby')`; UI ready/error |
| Instructions | `setScreen('instructions')` |
| Level | `setScreen('level', { biome })`; subscribe net events |
| Fork | `setScreen('fork')`; `char.argue` on argue pulses (local) |
| End Director | `setScreen('end')`; full §7.6 event stream |
| Tab hidden | Optional: mute or pause music |

---

## 12. Testing strategy

| Layer | Cases |
|---|---|
| Unit | Event → manifest resolve; per-character path; missing key safe |
| Unit | Channel polyphony drops oldest |
| Unit | Pre-unlock queue keeps last music, caps SFX |
| Manual | Chrome/Safari/Firefox: no audio until click; then title music |
| Manual | Hoard loot chaos: no audible breakup / tab freeze |
| Manual | End cinematic stingers order matches director script |

Automated audio decode optional later; MVP = resolve + mock backend.

---

## 13. MVP vs stretch

| Feature | MVP | Stretch |
|---|---|---|
| Unlock on gesture | ✅ | |
| Title + level + end music | ✅ (subset stems OK) | Full biome set |
| Core SFX: jump, pickup, drop, throw, stun, trap spikes | ✅ | Full trap/enemy set |
| End count + share stingers | ✅ basic | Full place/rummage set |
| Per-character banks | Placeholders shared OK | Full unique banks |
| Crossfade | Cut OK | Crossfade + duck |
| Settings UI | Console/dev volume | Options screen + persist |
| Spatial pan by x | ❌ | ✅ |

---

## 14. Open questions / assumptions

| ID | Question | Assumption |
|---|---|---|
| Q1 | Music format | Ogg + optional mp3 |
| Q2 | Lobby music | Reuse title stem |
| Q3 | Remote jump SFX | Play all seats; rely on caps |
| Q4 | Attract silent until gesture | Yes |
| Q5 | Pause mutes | Local pause UI does not stop server; music continues unless local mute |

---

## 15. Related docs

- [COMPONENTS.md](../../COMPONENTS.md) — C-13  
- [ARCHITECTURE.md](../../ARCHITECTURE.md) §9 Audio NFR  
- [netcode-messages.md](../../interfaces/netcode-messages.md)  
- [TASKS.md](TASKS.md)  
- Future: `docs/art/` audio naming checklist  
