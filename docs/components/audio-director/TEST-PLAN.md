# C-13 — Audio Director — Test Plan

> **Status:** Complete component plan (documentation only).  
> **Global strategy:** [docs/testing/AUTOMATED-TEST-STRATEGY.md](../../testing/AUTOMATED-TEST-STRATEGY.md)  
> **Approach:** [docs/testing/COMPONENT-TEST-PLAN-APPROACH.md](../../testing/COMPONENT-TEST-PLAN-APPROACH.md)  
> **Design:** [DESIGN.md](DESIGN.md) · **Tasks:** [TASKS.md](TASKS.md)  
> **Catalog:** [COMPONENTS.md](../../COMPONENTS.md) §C-13  
> **Owner cluster:** SE-8

---

## 1. Scope

### In scope

| Area | Under test |
|---|---|
| Unlock | First gesture resumes AudioContext; pre-unlock queue policy |
| Music | `setScreen` stems (title/credits/scores/level biome/fork/end); same-stem no restart |
| SFX routing | Logical `AudioEvent` → manifest → channels with polyphony caps |
| Net map | `S2C_Event` / `GameEvent` → AudioEvent (pickup/drop/throw/spill/stun/trap/switch…) |
| Character banks | perCharacter resolve; generic fallback |
| Rate limits | Land/jump/spill multi-drop / switch bounce |
| Missing asset | No-throw; one dev warn; silent play |
| Volume buses | master / music / sfx multipliers; mute |
| Safe construct | Boot without WebAudio; no exception before unlock |

### Out of scope

| Out | Owner |
|---|---|
| Asset generation / composition | Art pipeline |
| Networking / sim truth | C-04 / C-06 |
| Spatial 3D / voice chat | Stretch / out |
| Server telemetry of audio | N/A MVP |

---

## 2. Interfaces consumed & produced

| Direction | Contract |
|---|---|
| Consumes | [netcode-messages.md](../../interfaces/netcode-messages.md) `S2C_Event` types |
| Consumes | C-01 scene enter (`setScreen`); C-11 end cues; C-02 optional presentation cues |
| Produces | Stable `AudioEvent` catalog (DESIGN §7); play/stop channel API |

---

## 3. Test levels

| Level | What | Automation |
|---|---|---|
| **Unit** | Event→manifest resolve; channel drop-oldest; pre-unlock queue; rate-limit; missing key safe | CI with mock backend |
| **Property** | Channel counts never exceed caps after N random plays | CI |
| **Scenario** | Screen music transitions; fromNetEvent table for core events | CI mock |
| **Visual/manual smoke** | Chrome/Safari/Firefox unlock; attract silent until gesture; loot chaos; end stingers | Manual |
| **CI smoke** | Audio manager constructs without throw | CI |

Coverage pragmatism: **mostly mock-backend unit + manual browser unlock**. No CI requirement for real decode/loudness.

---

## 4. Case table

| ID | Title | Setup | Steps | Expected | Priority |
|---|---|---|---|---|---|
| AUD-01 | No exception before gesture unlock | Fresh director Locked | create; setScreen; play SFX without gesture | No throw; state Locked; plays enqueued or dropped per policy | P0 |
| AUD-02 | First gesture unlocks idempotent | Locked director | pointerdown/keydown/gamepad press twice | resume once; state Unlocked; second gesture no-op | P0 |
| AUD-03 | Pre-unlock queue keeps last music | Locked; request music A then B; N SFX | unlock | Flush last music B; SFX capped max N drop oldest | P0 |
| AUD-04 | Attract silent until unlock | Title attract | no gesture | No autoplay; after unlock title music may start | P0 |
| AUD-05 | setScreen music stems | Unlocked mock backend | title→level(dungeon)→fork→end | Correct stem keys; level uses biome | P0 |
| AUD-06 | Same stem re-enter no restart | Playing title | setScreen title again | Keep playhead unless forceRestart | P1 |
| AUD-07 | Event bus spill/stun/UI clicks | Mock backend + counters | play char.stunned, ui.start_game, end.count_treasure | Mapped channel plays; no throw | P1 |
| AUD-08 | fromNetEvent pickup variants | pickup coin bag / unique / normal | fromNetEvent | coin_bag / unique_or_set / treasure events | P1 |
| AUD-09 | fromNetEvent trap_trigger kind map | trap kinds spikes, gas, unknown | fromNetEvent | trap.spikes / trap.gas_release / trap.generic | P1 |
| AUD-10 | Channel cap drop-oldest | object channel cap 6 | Play 10 impacts | ≤6 concurrent; oldest dropped; no crash | P0 |
| AUD-11 | Music never mid-crossfade dropped illegally | music playing | spam SFX | Music continues; SFX caps only | P1 |
| AUD-12 | Missing asset silent | Manifest path missing | play event | No throw; one warn; production silent | P0 |
| AUD-13 | Per-character path resolve | char.jump + character Gnome | play | perCharacter path if present else shared | P1 |
| AUD-14 | Argue variants rotate | char.argue paths×3 | play thrice | Random/rotate among variants; channel cap | P2 |
| AUD-15 | Land rate-limit 100 ms | land spam same seat | play many | ≤1 per 100 ms window | P1 |
| AUD-16 | Jump edge only | jump held multi-frame | local jump cue | No hold spam (edge policy) | P1 |
| AUD-17 | Spill multi-item max 3 drop SFX | spill many items | fromNetEvent spill | ≤3 drop SFX | P1 |
| AUD-18 | Volume buses | master 0.5; music 0.5; sfx 1 | play music + sfx | Effective levels multiplied; mute silences | P2 |
| AUD-19 | Autoplay failure retry | resume rejects once | gesture then next gesture | Log once; retry next gesture | P1 |
| AUD-20 | Tab hidden optional duck | document hidden | policy hook | Mute/pause music optional; no throw | P2 |
| AUD-21 | WebAudio unavailable construct | Sound system null | create | Safe no-op director | P0 |
| AUD-22 | End stinger place order contract | place cues 1–4 | play sequence | Resolves end.place_1…4 without throw (order owned by C-11) | P2 |
| AUD-23 | Switch bounce cooldown | switch spam 50 ms | play down/up | Cooldown per switchId | P2 |

---

## 5. Edge cases

| Case | Expected |
|---|---|
| Safari autoplay policies | Manual AUD-02/04; Ogg/MP3 fallback note |
| Loot chaos polyphony | AUD-10 under chaos; no tab freeze |
| Lost net events after reconnect | No SFX invent; snapshot heals visual only |
| Local pause UI | Music continues unless local mute (Q10 server unpaused) |
| Remote jump cacophony | Channel caps; optional reduced remote volume later |

---

## 6. Fixtures & determinism

| Fixture | Use |
|---|---|
| Minimal AudioManifest | title music + MVP SFX set |
| MockAudioBackend | records play/stop; simulates unlock |
| Net event fixtures | pickup/drop/throw/spill/stun/trap/switch |
| Fake clock | cooldowns, rate limits |

**Determinism:** Mock backend only in CI. Random argue variants may be seeded for tests. No real device audio required in unit suite.

---

## 7. Mocks / fakes

| Double | Role |
|---|---|
| MockAudioBackend | construct/resume/play/stop |
| FakeClock | cooldowns |
| Manifest JSON | missing-key and perCharacter cases |
| Event feed | fromNetEvent unit table |

---

## 8. Integration / system hooks

| Hook | Relationship |
|---|---|
| C-01 Boot/Title | construct + setScreen + unlock gesture |
| C-04 eventsQueue | gameplay SFX |
| C-11 end cues | stingers/fanfare |
| Human playtest | mute-ability, loudness free notes |
| SYS client perf | chaos must not freeze tab |

---

## 9. Exit criteria

- [ ] Desktop browsers resume AudioContext after gesture (manual matrix)  
- [ ] No exception before unlock; missing asset never breaks scene flow  
- [ ] Channel caps hold under chaos  
- [ ] Core fromNetEvent mappings for MVP SFX green  
- [ ] setScreen music for title/level/end at least  
- [ ] CI: director constructs + unit resolve/queue/cap suite green  

---

## 10. Open risks

| Risk | Mitigation |
|---|---|
| Safari autoplay / format | Manual; dual format manifest |
| Placeholder shared banks | perCharacter optional until art |
| Over-eager remote SFX | Caps + later seat policy |

---

## 11. Related docs

- [DESIGN.md](DESIGN.md), [TASKS.md](TASKS.md)  
- [netcode-messages.md](../../interfaces/netcode-messages.md)  
- [client-shell/TEST-PLAN.md](../client-shell/TEST-PLAN.md)  
- [end-screen/TEST-PLAN.md](../end-screen/TEST-PLAN.md)  
- [HUMAN-PLAYTEST-PLAN.md](../../testing/HUMAN-PLAYTEST-PLAN.md)  
