// Dungeon Haul Asset Gallery Application Logic
const GALLERY_DATA = [
{
  "id": "char.jump",
  "name": "Jump Sound Effect",
  "category": "audio",
  "priority": "p0",
  "dimensions": "16-bit 44.1kHz WAV (150ms)",
  "path": "client/public/assets/audio/sfx/char/char_jump.wav",
  "rawPath": "scripts/generate_sfx_jump.py",
  "audioSrc": "../client/public/assets/audio/sfx/char/char_jump.wav",
  "isAudio": true,
  "description": "8-bit NES square wave pitch sweep from 220Hz to 660Hz"
},
{
  "id": "char.pickup_treasure",
  "name": "Treasure Pickup Sound Effect",
  "category": "audio",
  "priority": "p0",
  "dimensions": "16-bit 44.1kHz WAV (120ms)",
  "path": "client/public/assets/audio/sfx/object/pickup_treasure.wav",
  "rawPath": "scripts/generate_sfx_pickup.py",
  "audioSrc": "../client/public/assets/audio/sfx/object/pickup_treasure.wav",
  "isAudio": true,
  "description": "Retro 8-bit two-tone arpeggio (B5 -> E6) with bell decay"
},
{
  "id": "trap.spikes",
  "name": "Spike Trap Snap Sound Effect",
  "category": "audio",
  "priority": "p0",
  "dimensions": "16-bit 44.1kHz WAV (180ms)",
  "path": "client/public/assets/audio/sfx/trap/trap_spikes.wav",
  "rawPath": "scripts/generate_spikes_sfx.py",
  "audioSrc": "../client/public/assets/audio/sfx/trap/trap_spikes.wav",
  "isAudio": true,
  "description": "Metallic snap click with noise burst and pitch drop"
},
{
  "id": "ui.start_game",
  "name": "Title Start Arcade SFX",
  "category": "audio",
  "priority": "p0",
  "dimensions": "16-bit 44.1kHz WAV (250ms)",
  "path": "client/public/assets/audio/sfx/ui/ui_start_game.wav",
  "rawPath": "scripts/generate_sfx_ui_start.py",
  "audioSrc": "../client/public/assets/audio/sfx/ui/ui_start_game.wav",
  "isAudio": true,
  "description": "4-note ascending arcade triumph blip (C5 -> E5 -> G5 -> C6)"
},
{
  "id": "music_title",
  "name": "Title Music Stem Loop",
  "category": "audio",
  "priority": "p0",
  "dimensions": "16-bit 44.1kHz WAV (15.0s Loop)",
  "path": "client/public/assets/audio/music/music_title.wav",
  "rawPath": "scripts/generate_music_title.py",
  "audioSrc": "../client/public/assets/audio/music/music_title.wav",
  "isAudio": true,
  "description": "Upbeat 128 BPM 8-bit NES chiptune lead, bassline & drums"
},
  {
    "id": "char_title_stick_gnome",
    "name": "Title Stick Gnome Walk",
    "category": "characters",
    "priority": "p0",
    "dimensions": "64\u00d796px (4 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_title_stick_gnome)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 64,
      "h": 96
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_title_stick_gnome_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_gnome_1",
        "coords": {
          "x": 64,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_gnome_2",
        "coords": {
          "x": 128,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_gnome_3",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 64,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "char_title_stick_sprite",
    "name": "Title Stick Sprite Walk",
    "category": "characters",
    "priority": "p0",
    "dimensions": "64\u00d796px (4 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_title_stick_sprite)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 256,
      "y": 0,
      "w": 64,
      "h": 96
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_title_stick_sprite_0",
        "coords": {
          "x": 256,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_sprite_1",
        "coords": {
          "x": 320,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_sprite_2",
        "coords": {
          "x": 384,
          "y": 0,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_sprite_3",
        "coords": {
          "x": 448,
          "y": 0,
          "w": 64,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "char_title_stick_halfling",
    "name": "Title Stick Halfling Walk",
    "category": "characters",
    "priority": "p0",
    "dimensions": "64\u00d796px (4 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_title_stick_halfling)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 0,
      "y": 96,
      "w": 64,
      "h": 96
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_title_stick_halfling_0",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_halfling_1",
        "coords": {
          "x": 64,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_halfling_2",
        "coords": {
          "x": 128,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_halfling_3",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 64,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "char_title_stick_dwarf",
    "name": "Title Stick Dwarf Walk",
    "category": "characters",
    "priority": "p0",
    "dimensions": "64\u00d796px (4 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_title_stick_dwarf)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 256,
      "y": 96,
      "w": 64,
      "h": 96
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_title_stick_dwarf_0",
        "coords": {
          "x": 256,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_dwarf_1",
        "coords": {
          "x": 320,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_dwarf_2",
        "coords": {
          "x": 384,
          "y": 96,
          "w": 64,
          "h": 96
        }
      },
      {
        "name": "char_title_stick_dwarf_3",
        "coords": {
          "x": 448,
          "y": 96,
          "w": 64,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "char_all_argue",
    "name": "Argue Pose Overlay",
    "category": "characters",
    "priority": "p1",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_all_argue)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 0,
      "y": 192,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_all_argue_0",
        "coords": {
          "x": 0,
          "y": 192,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_all_argue_1",
        "coords": {
          "x": 48,
          "y": 192,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_all_argue_2",
        "coords": {
          "x": 96,
          "y": 192,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_all_rummage",
    "name": "Rummage Pose",
    "category": "characters",
    "priority": "p1",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_all_rummage)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 144,
      "y": 192,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_all_rummage_0",
        "coords": {
          "x": 144,
          "y": 192,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_all_rummage_1",
        "coords": {
          "x": 192,
          "y": 192,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_all_rummage_2",
        "coords": {
          "x": 240,
          "y": 192,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_all_rummage_3",
        "coords": {
          "x": 288,
          "y": 192,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_ai_badge",
    "name": "AI Control Badge",
    "category": "characters",
    "priority": "p1",
    "dimensions": "16\u00d716px",
    "path": "client/public/assets/atlases/atlas_char_extras.webp (Frame: char_ai_badge)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_char_extras.webp",
    "coords": {
      "x": 336,
      "y": 192,
      "w": 16,
      "h": 16
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "char_ai_badge",
        "coords": {
          "x": 336,
          "y": 192,
          "w": 16,
          "h": 16
        }
      }
    ]
  },
  {
    "id": "enemy_golem_idle",
    "name": "Stone Golem Enemy Idle",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "64\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_golem_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 64,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "enemy_golem_idle_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_idle",
        "coords": {
          "x": 64,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_idle_1",
        "coords": {
          "x": 128,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_idle_2",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_idle_3",
        "coords": {
          "x": 256,
          "y": 0,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "enemy_golem_walk",
    "name": "Stone Golem Walk",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "64\u00d764px (6 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_golem_walk)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 320,
      "y": 0,
      "w": 64,
      "h": 64
    },
    "frameCount": 7,
    "allFrames": [
      {
        "name": "enemy_golem_walk_0",
        "coords": {
          "x": 320,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk",
        "coords": {
          "x": 384,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk_1",
        "coords": {
          "x": 448,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk_2",
        "coords": {
          "x": 0,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk_3",
        "coords": {
          "x": 64,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk_4",
        "coords": {
          "x": 128,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_walk_5",
        "coords": {
          "x": 192,
          "y": 64,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "enemy_golem_attack",
    "name": "Stone Golem Attack Stomp",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "64\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_golem_attack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 256,
      "y": 64,
      "w": 64,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "enemy_golem_attack_0",
        "coords": {
          "x": 256,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_attack",
        "coords": {
          "x": 320,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_attack_1",
        "coords": {
          "x": 384,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_attack_2",
        "coords": {
          "x": 448,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "enemy_golem_attack_3",
        "coords": {
          "x": 0,
          "y": 128,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "enemy_phantom_idle",
    "name": "Phantom Hand Enemy Idle",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "48\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_phantom_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 72,
      "y": 128,
      "w": 48,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "enemy_phantom_idle_0",
        "coords": {
          "x": 72,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_idle",
        "coords": {
          "x": 136,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_idle_1",
        "coords": {
          "x": 200,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_idle_2",
        "coords": {
          "x": 264,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_idle_3",
        "coords": {
          "x": 328,
          "y": 128,
          "w": 48,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "enemy_phantom_drop",
    "name": "Phantom Hand Steal Drop",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "48\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_phantom_drop)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 392,
      "y": 128,
      "w": 48,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "enemy_phantom_drop_0",
        "coords": {
          "x": 392,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_drop",
        "coords": {
          "x": 456,
          "y": 128,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_drop_1",
        "coords": {
          "x": 8,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_drop_2",
        "coords": {
          "x": 72,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_drop_3",
        "coords": {
          "x": 136,
          "y": 192,
          "w": 48,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "enemy_phantom_flee",
    "name": "Phantom Hand Flee",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "48\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: enemy_phantom_flee)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 200,
      "y": 192,
      "w": 48,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "enemy_phantom_flee_0",
        "coords": {
          "x": 200,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_flee",
        "coords": {
          "x": 264,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_flee_1",
        "coords": {
          "x": 328,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_flee_2",
        "coords": {
          "x": 392,
          "y": 192,
          "w": 48,
          "h": 64
        }
      },
      {
        "name": "enemy_phantom_flee_3",
        "coords": {
          "x": 456,
          "y": 192,
          "w": 48,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "trap_lightning_bolt",
    "name": "Lightning Arc Bolt",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "16\u00d764px (5 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: trap_lightning_bolt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 24,
      "y": 256,
      "w": 16,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "trap_lightning_bolt_0",
        "coords": {
          "x": 24,
          "y": 256,
          "w": 16,
          "h": 64
        }
      },
      {
        "name": "trap_lightning_bolt",
        "coords": {
          "x": 88,
          "y": 256,
          "w": 16,
          "h": 64
        }
      },
      {
        "name": "trap_lightning_bolt_1",
        "coords": {
          "x": 152,
          "y": 256,
          "w": 16,
          "h": 64
        }
      },
      {
        "name": "trap_lightning_bolt_2",
        "coords": {
          "x": 216,
          "y": 256,
          "w": 16,
          "h": 64
        }
      },
      {
        "name": "trap_lightning_bolt_3",
        "coords": {
          "x": 280,
          "y": 256,
          "w": 16,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "trap_gas_cloud",
    "name": "Poison Gas Billow Cloud",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "48\u00d748px (7 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: trap_gas_cloud)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 328,
      "y": 264,
      "w": 48,
      "h": 48
    },
    "frameCount": 7,
    "allFrames": [
      {
        "name": "trap_gas_cloud_0",
        "coords": {
          "x": 328,
          "y": 264,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud",
        "coords": {
          "x": 392,
          "y": 264,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud_1",
        "coords": {
          "x": 456,
          "y": 264,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud_2",
        "coords": {
          "x": 8,
          "y": 328,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud_3",
        "coords": {
          "x": 72,
          "y": 328,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud_4",
        "coords": {
          "x": 136,
          "y": 328,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "trap_gas_cloud_5",
        "coords": {
          "x": 200,
          "y": 328,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "trap_falling_rock_fall",
    "name": "Falling Rock Projectile",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "32\u00d732px (5 frames)",
    "path": "client/public/assets/atlases/atlas_enemies.webp (Frame: trap_falling_rock_fall)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_enemies.webp",
    "coords": {
      "x": 272,
      "y": 336,
      "w": 32,
      "h": 32
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "trap_falling_rock_fall_0",
        "coords": {
          "x": 272,
          "y": 336,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "trap_falling_rock_fall",
        "coords": {
          "x": 336,
          "y": 336,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "trap_falling_rock_fall_1",
        "coords": {
          "x": 400,
          "y": 336,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "trap_falling_rock_fall_2",
        "coords": {
          "x": 464,
          "y": 336,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "trap_falling_rock_fall_3",
        "coords": {
          "x": 16,
          "y": 400,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_gold_near_candelabra",
    "name": "Vault Candelabra Flame Prop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d796px (4 frames)",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_gold_near_candelabra)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 32,
      "h": 96
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "px_gold_near_candelabra_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 32,
          "h": 96
        }
      },
      {
        "name": "px_gold_near_candelabra_1",
        "coords": {
          "x": 32,
          "y": 0,
          "w": 32,
          "h": 96
        }
      },
      {
        "name": "px_gold_near_candelabra_2",
        "coords": {
          "x": 64,
          "y": 0,
          "w": 32,
          "h": 96
        }
      },
      {
        "name": "px_gold_near_candelabra",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 32,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_ice_near_icicle",
    "name": "Glacial Wall Icicle Prop",
    "category": "uivfx",
    "priority": "p1",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_ice_near_icicle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 128,
      "y": 0,
      "w": 32,
      "h": 96
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_near_icicle",
        "coords": {
          "x": 128,
          "y": 0,
          "w": 32,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_dun_near_banner",
    "name": "Px Dun Near Banner",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d796px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_dun_near_banner)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 160,
      "y": 0,
      "w": 48,
      "h": 96
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_dun_near_banner",
        "coords": {
          "x": 160,
          "y": 0,
          "w": 48,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_gold_near_chest_stack",
    "name": "Decorative Chest Stack Prop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d764px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_gold_near_chest_stack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 208,
      "y": 0,
      "w": 96,
      "h": 80
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_gold_near_chest_stack",
        "coords": {
          "x": 208,
          "y": 0,
          "w": 96,
          "h": 80
        }
      }
    ]
  },
  {
    "id": "px_gold_near_pile",
    "name": "Px Gold Near Pile",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "96\u00d764px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_gold_near_pile)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 304,
      "y": 0,
      "w": 96,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_gold_near_pile",
        "coords": {
          "x": 304,
          "y": 0,
          "w": 96,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_dun_near_grate",
    "name": "Px Dun Near Grate",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d764px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_dun_near_grate)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 400,
      "y": 0,
      "w": 64,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_dun_near_grate",
        "coords": {
          "x": 400,
          "y": 0,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_cav_near_crystal_geode",
    "name": "Px Cav Near Crystal Geode",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d748px",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_cav_near_crystal_geode)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 464,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_near_crystal_geode",
        "coords": {
          "x": 464,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "px_dun_near_torch",
    "name": "Px Dun Near Torch",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d764px (5 frames)",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_dun_near_torch)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 0,
      "y": 96,
      "w": 32,
      "h": 64
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "px_dun_near_torch_0",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 32,
          "h": 64
        }
      },
      {
        "name": "px_dun_near_torch_1",
        "coords": {
          "x": 32,
          "y": 96,
          "w": 32,
          "h": 64
        }
      },
      {
        "name": "px_dun_near_torch_2",
        "coords": {
          "x": 64,
          "y": 96,
          "w": 32,
          "h": 64
        }
      },
      {
        "name": "px_dun_near_torch_3",
        "coords": {
          "x": 96,
          "y": 96,
          "w": 32,
          "h": 64
        }
      },
      {
        "name": "px_dun_near_torch",
        "coords": {
          "x": 128,
          "y": 96,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_mist_near_lantern",
    "name": "Floating Ghost Lantern Prop",
    "category": "uivfx",
    "priority": "p1",
    "dimensions": "32\u00d748px (5 frames)",
    "path": "client/public/assets/atlases/atlas_level_props.webp (Frame: px_mist_near_lantern)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_level_props.webp",
    "coords": {
      "x": 160,
      "y": 96,
      "w": 32,
      "h": 48
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "px_mist_near_lantern_0",
        "coords": {
          "x": 160,
          "y": 96,
          "w": 32,
          "h": 48
        }
      },
      {
        "name": "px_mist_near_lantern_1",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 32,
          "h": 48
        }
      },
      {
        "name": "px_mist_near_lantern_2",
        "coords": {
          "x": 224,
          "y": 96,
          "w": 32,
          "h": 48
        }
      },
      {
        "name": "px_mist_near_lantern_3",
        "coords": {
          "x": 256,
          "y": 96,
          "w": 32,
          "h": 48
        }
      },
      {
        "name": "px_mist_near_lantern",
        "coords": {
          "x": 288,
          "y": 96,
          "w": 32,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "px_cav_far",
    "name": "Cavern Deep Backdrop",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "512\u00d7512px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: px_cav_far)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 512,
      "h": 512
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_far",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 512,
          "h": 512
        }
      }
    ]
  },
  {
    "id": "px_cav_fore_roots",
    "name": "Cavern Ceiling Roots",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "96\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: px_cav_fore_roots)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 512,
      "y": 0,
      "w": 96,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_fore_roots",
        "coords": {
          "x": 512,
          "y": 0,
          "w": 96,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_cav_near_stalactite",
    "name": "Cavern Stalactite",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d796px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: px_cav_near_stalactite)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 608,
      "y": 0,
      "w": 32,
      "h": 96
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_near_stalactite",
        "coords": {
          "x": 608,
          "y": 0,
          "w": 32,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_cav_near_stalagmite",
    "name": "Cavern Stalagmite",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d796px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: px_cav_near_stalagmite)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 640,
      "y": 0,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_near_stalagmite",
        "coords": {
          "x": 640,
          "y": 0,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_cav_near_mushroom",
    "name": "Bioluminescent Mushroom",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "48\u00d748px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: px_cav_near_mushroom)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 672,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_cav_near_mushroom",
        "coords": {
          "x": 672,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_cavern_rock",
    "name": "Cavern Rough Stone",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: blk_cavern_rock)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 512,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_cavern_rock",
        "coords": {
          "x": 512,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_sand",
    "name": "High-Friction Sand Block",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: blk_sand)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 544,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_sand",
        "coords": {
          "x": 544,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_cavern_moss",
    "name": "Mossy Rock Tile",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_cavern.webp (Frame: blk_cavern_moss)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_cavern.webp",
    "coords": {
      "x": 576,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_cavern_moss",
        "coords": {
          "x": 576,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_ice_crack",
    "name": "Glacial Ice Crack",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: blk_ice_crack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 240,
      "y": 544,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_ice_crack",
        "coords": {
          "x": 240,
          "y": 544,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_ice_far",
    "name": "Pale Sky Ice Far BG",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "960\u00d7540px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: px_ice_far)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 960,
      "h": 540
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_far",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 960,
          "h": 540
        }
      }
    ]
  },
  {
    "id": "px_ice_near_icicle",
    "name": "Glacial Wall Icicle Prop",
    "category": "uivfx",
    "priority": "p1",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: px_ice_near_icicle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 56,
      "y": 544,
      "w": 32,
      "h": 96
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_near_icicle",
        "coords": {
          "x": 56,
          "y": 544,
          "w": 32,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_ice_near_crystal",
    "name": "Crystal Cluster",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "48\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: px_ice_near_crystal)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 96,
      "y": 544,
      "w": 64,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_near_crystal",
        "coords": {
          "x": 96,
          "y": 544,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "px_ice_near_pillar",
    "name": "Glacial Pillar",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "64\u00d7256px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: px_ice_near_pillar)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 0,
      "y": 544,
      "w": 48,
      "h": 256
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_near_pillar",
        "coords": {
          "x": 0,
          "y": 544,
          "w": 48,
          "h": 256
        }
      }
    ]
  },
  {
    "id": "px_ice_fore_frost",
    "name": "Px Ice Fore Frost",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: px_ice_fore_frost)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 168,
      "y": 544,
      "w": 64,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_ice_fore_frost",
        "coords": {
          "x": 168,
          "y": 544,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "trap_spikes_biome_ice",
    "name": "Glacial Ice Spike",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_ice.webp (Frame: trap_spikes_biome_ice)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_ice.webp",
    "coords": {
      "x": 280,
      "y": 544,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_spikes_biome_ice",
        "coords": {
          "x": 280,
          "y": 544,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_lava_far",
    "name": "Magma Cavern Far BG",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "512\u00d7288px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: px_lava_far)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 4,
      "y": 4,
      "w": 256,
      "h": 256
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_lava_far",
        "coords": {
          "x": 4,
          "y": 4,
          "w": 256,
          "h": 256
        }
      }
    ]
  },
  {
    "id": "px_lava_near_spire",
    "name": "Lava Spire Column",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "64\u00d7256px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: px_lava_near_spire)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 264,
      "y": 4,
      "w": 64,
      "h": 192
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_lava_near_spire",
        "coords": {
          "x": 264,
          "y": 4,
          "w": 64,
          "h": 192
        }
      }
    ]
  },
  {
    "id": "gate_gold_closed",
    "name": "Gold Vault Gate",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: gate_gold_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 332,
      "y": 4,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "gate_gold_closed",
        "coords": {
          "x": 332,
          "y": 4,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "blk_lava_rock",
    "name": "Lava Basalt Block",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: blk_lava_rock)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 368,
      "y": 4,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_lava_rock",
        "coords": {
          "x": 368,
          "y": 4,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_lava_glow_edge",
    "name": "Magma Edge Glow",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: blk_lava_glow_edge)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 404,
      "y": 4,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_lava_glow_edge",
        "coords": {
          "x": 404,
          "y": 4,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_lava_near_crack",
    "name": "Px Lava Near Crack",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: px_lava_near_crack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 440,
      "y": 4,
      "w": 64,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_lava_near_crack",
        "coords": {
          "x": 440,
          "y": 4,
          "w": 64,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_spikes_biome_lava",
    "name": "Lava Spike Hazard",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_lava.webp (Frame: trap_spikes_biome_lava)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_lava.webp",
    "coords": {
      "x": 4,
      "y": 264,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_spikes_biome_lava",
        "coords": {
          "x": 4,
          "y": 264,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_mist_stone",
    "name": "Mist Stone Block",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: blk_mist_stone)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 608,
      "y": 128,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_mist_stone",
        "coords": {
          "x": 608,
          "y": 128,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_mist_rune",
    "name": "Ancient Rune Stone",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: blk_mist_rune)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 640,
      "y": 128,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_mist_rune",
        "coords": {
          "x": 640,
          "y": 128,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_mist_far",
    "name": "Ethereal Mist Far BG",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "512\u00d7512px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: px_mist_far)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 512,
      "h": 512
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_mist_far",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 512,
          "h": 512
        }
      }
    ]
  },
  {
    "id": "px_mist_near_wisp",
    "name": "Spirit Wisp Lamp",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d748px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: px_mist_near_wisp)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 672,
      "y": 128,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_mist_near_wisp",
        "coords": {
          "x": 672,
          "y": 128,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "px_mist_near_arch",
    "name": "Ruined Arch Structure",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "96\u00d7192px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: px_mist_near_arch)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 768,
      "y": 0,
      "w": 128,
      "h": 160
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_mist_near_arch",
        "coords": {
          "x": 768,
          "y": 0,
          "w": 128,
          "h": 160
        }
      }
    ]
  },
  {
    "id": "px_mist_near_moss",
    "name": "Mist Overgrown Moss",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: px_mist_near_moss)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 512,
      "y": 128,
      "w": 48,
      "h": 96
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_mist_near_moss",
        "coords": {
          "x": 512,
          "y": 128,
          "w": 48,
          "h": 96
        }
      }
    ]
  },
  {
    "id": "px_mist_fore_fog",
    "name": "Px Mist Fore Fog",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "256\u00d7128px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: px_mist_fore_fog)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 512,
      "y": 0,
      "w": 256,
      "h": 128
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "px_mist_fore_fog",
        "coords": {
          "x": 512,
          "y": 0,
          "w": 256,
          "h": 128
        }
      }
    ]
  },
  {
    "id": "trap_gas_biome_mist",
    "name": "Ethereal Gas Vent",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "48\u00d748px",
    "path": "client/public/assets/atlases/atlas_tiles_mist.webp (Frame: trap_gas_biome_mist)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mist.webp",
    "coords": {
      "x": 560,
      "y": 128,
      "w": 48,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_gas_biome_mist",
        "coords": {
          "x": 560,
          "y": 128,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "blk_brick_dungeon",
    "name": "Dungeon Brick Tile",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: blk_brick_dungeon)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 4,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_brick_dungeon",
        "coords": {
          "x": 4,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_brick_outside",
    "name": "Outside Dirt/Grass Tile",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: blk_brick_outside)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 44,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_brick_outside",
        "coords": {
          "x": 44,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_brick_gold",
    "name": "Hoard Vault Stone Tile",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: blk_brick_gold)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 84,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_brick_gold",
        "coords": {
          "x": 84,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "blk_ice",
    "name": "Ice Surface Block",
    "category": "biomes",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: blk_ice)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 124,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_ice",
        "coords": {
          "x": 124,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "sw_switch_up",
    "name": "Red Switch Up",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d724px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: sw_switch_up)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 164,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "sw_switch_up",
        "coords": {
          "x": 164,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "sw_switch_down",
    "name": "Red Switch Down",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d716px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: sw_switch_down)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 204,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "sw_switch_down",
        "coords": {
          "x": 204,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "sw_heavy_up",
    "name": "Heavy Pressure Switch Up",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "40\u00d728px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: sw_heavy_up)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 0,
      "y": 80,
      "w": 40,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "sw_heavy_up",
        "coords": {
          "x": 0,
          "y": 80,
          "w": 40,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "sw_heavy_down",
    "name": "Heavy Pressure Switch Down",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "40\u00d720px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: sw_heavy_down)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 40,
      "y": 80,
      "w": 40,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "sw_heavy_down",
        "coords": {
          "x": 40,
          "y": 80,
          "w": 40,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "gate_iron_closed",
    "name": "Iron Gate Closed",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: gate_iron_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 84,
      "y": 64,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "gate_iron_closed",
        "coords": {
          "x": 84,
          "y": 64,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "gate_iron_open",
    "name": "Iron Gate Open",
    "category": "biomes",
    "priority": "p0",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: gate_iron_open)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 124,
      "y": 64,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "gate_iron_open",
        "coords": {
          "x": 124,
          "y": 64,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "door_closed",
    "name": "Door Closed",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: door_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 164,
      "y": 64,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "door_closed",
        "coords": {
          "x": 164,
          "y": 64,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "blk_exit_banner",
    "name": "Blk Exit Banner",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d764px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: blk_exit_banner)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 204,
      "y": 64,
      "w": 32,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "blk_exit_banner",
        "coords": {
          "x": 204,
          "y": 64,
          "w": 32,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "trap_spikes_idle",
    "name": "Floor Spikes Hazard",
    "category": "enemies",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_spikes_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 4,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_spikes_idle",
        "coords": {
          "x": 4,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_spikes_retracted",
    "name": "Trap Spikes Retracted",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_spikes_retracted)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 44,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_spikes_retracted",
        "coords": {
          "x": 44,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_crumble_idle",
    "name": "Crumbling Floor Brick",
    "category": "enemies",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_crumble_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 84,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_crumble_idle",
        "coords": {
          "x": 84,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_crumble_break",
    "name": "Trap Crumble Break",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_crumble_break)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 124,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_crumble_break",
        "coords": {
          "x": 124,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_recede_idle",
    "name": "Receding Trap Block",
    "category": "enemies",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_recede_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 164,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_recede_idle",
        "coords": {
          "x": 164,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_recede_out",
    "name": "Trap Recede Out",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_recede_out)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 204,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_recede_out",
        "coords": {
          "x": 204,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "trap_lightning_emitter",
    "name": "Lightning Coil Emitter",
    "category": "enemies",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_tiles_mvp.webp (Frame: trap_lightning_emitter)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_tiles_mvp.webp",
    "coords": {
      "x": 4,
      "y": 208,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "trap_lightning_emitter",
        "coords": {
          "x": 4,
          "y": 208,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_coin_sack",
    "name": "Coin Sack (20 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d728px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_coin_sack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_coin_sack",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_big_coin_sack",
    "name": "Big Coin Sack (100 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "36\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_big_coin_sack)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 32,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_big_coin_sack",
        "coords": {
          "x": 32,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_brass_watch",
    "name": "Brass Watch (20 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_brass_watch)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 64,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_brass_watch",
        "coords": {
          "x": 64,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_gold_watch",
    "name": "Gold Watch (75 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_gold_watch)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 96,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_gold_watch",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_stone_icon",
    "name": "Stone Icon (5 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_stone_icon)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 128,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_stone_icon",
        "coords": {
          "x": 128,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_bronze_icon",
    "name": "Bronze Icon (50 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_bronze_icon)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 160,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_bronze_icon",
        "coords": {
          "x": 160,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_gemstone_ruby",
    "name": "Tre Gemstone Ruby",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_gemstone_ruby)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 192,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_gemstone_ruby",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_gemstone_emerald",
    "name": "Tre Gemstone Emerald",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_gemstone_emerald)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 224,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_gemstone_emerald",
        "coords": {
          "x": 224,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_crown",
    "name": "Crown (750 gp)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "36\u00d728px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_crown)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 0,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_crown",
        "coords": {
          "x": 0,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_wooden_chest_closed",
    "name": "Wooden Chest Closed",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "40\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_wooden_chest_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 32,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_wooden_chest_closed",
        "coords": {
          "x": 32,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_wooden_chest_open",
    "name": "Wooden Chest Open",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "40\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_wooden_chest_open)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 64,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_wooden_chest_open",
        "coords": {
          "x": 64,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_silver_chest_closed",
    "name": "Silver Chest Closed",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "40\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_silver_chest_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 96,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_silver_chest_closed",
        "coords": {
          "x": 96,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_gold_chest_closed",
    "name": "Gold Chest Closed",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "40\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_gold_chest_closed)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 128,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_gold_chest_closed",
        "coords": {
          "x": 128,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_goat_icon",
    "name": "Goat Icon (800 gp Unique)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d740px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_goat_icon)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 160,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_goat_icon",
        "coords": {
          "x": 160,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_nes_cartridge",
    "name": "NES Cartridge (1000 gp Unique)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "28\u00d736px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_nes_cartridge)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 192,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_nes_cartridge",
        "coords": {
          "x": 192,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_crystal_skull",
    "name": "Tre Crystal Skull",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_crystal_skull)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 224,
      "y": 32,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_crystal_skull",
        "coords": {
          "x": 224,
          "y": 32,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_magic_scepter",
    "name": "Tre Magic Scepter",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_magic_scepter)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 0,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_magic_scepter",
        "coords": {
          "x": 0,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_helmet",
    "name": "Armor Helmet (Armor Set)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_helmet)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 32,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_helmet",
        "coords": {
          "x": 32,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_breastplate",
    "name": "Armor Breastplate (Armor Set)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d736px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_breastplate)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 64,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_breastplate",
        "coords": {
          "x": 64,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_gauntlets",
    "name": "Armor Gauntlets (Armor Set)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d728px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_gauntlets)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 96,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_gauntlets",
        "coords": {
          "x": 96,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_crystal_skull_blue",
    "name": "Tre Crystal Skull Blue",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_crystal_skull_blue)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 128,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_crystal_skull_blue",
        "coords": {
          "x": 128,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_gold_scepter",
    "name": "Tre Gold Scepter",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_gold_scepter)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 160,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_gold_scepter",
        "coords": {
          "x": 160,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_helmet_alt",
    "name": "Tre Set Armor Helmet Alt",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_helmet_alt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 192,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_helmet_alt",
        "coords": {
          "x": 192,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_breastplate_alt",
    "name": "Tre Set Armor Breastplate Alt",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_breastplate_alt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 224,
      "y": 64,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_breastplate_alt",
        "coords": {
          "x": 224,
          "y": 64,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_armor_greaves",
    "name": "Armor Greaves (Armor Set)",
    "category": "treasures",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures.webp (Frame: tre_set_armor_greaves)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures.webp",
    "coords": {
      "x": 0,
      "y": 96,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_armor_greaves",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_celestial_sun",
    "name": "Sun Sculpture (Celestial Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d736px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_celestial_sun)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 32,
      "h": 36
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_celestial_sun",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 32,
          "h": 36
        }
      }
    ]
  },
  {
    "id": "tre_set_celestial_moon",
    "name": "Moon Sculpture (Celestial Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d736px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_celestial_moon)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 34,
      "y": 0,
      "w": 32,
      "h": 36
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_celestial_moon",
        "coords": {
          "x": 34,
          "y": 0,
          "w": 32,
          "h": 36
        }
      }
    ]
  },
  {
    "id": "tre_set_celestial_star",
    "name": "Star Sculpture (Celestial Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d736px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_celestial_star)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 68,
      "y": 0,
      "w": 32,
      "h": 36
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_celestial_star",
        "coords": {
          "x": 68,
          "y": 0,
          "w": 32,
          "h": 36
        }
      }
    ]
  },
  {
    "id": "tre_set_divine_spade",
    "name": "Divine Spade (Divine Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_divine_spade)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 102,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_divine_spade",
        "coords": {
          "x": 102,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_divine_club",
    "name": "Divine Club (Divine Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_divine_club)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 136,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_divine_club",
        "coords": {
          "x": 136,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_divine_heart",
    "name": "Divine Heart (Divine Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_divine_heart)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 170,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_divine_heart",
        "coords": {
          "x": 170,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_divine_diamond",
    "name": "Divine Diamond (Divine Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_divine_diamond)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 204,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_divine_diamond",
        "coords": {
          "x": 204,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_song_flame_guitar",
    "name": "Flame Guitar (Song Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "24\u00d748px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_song_flame_guitar)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 238,
      "y": 0,
      "w": 24,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_song_flame_guitar",
        "coords": {
          "x": 238,
          "y": 0,
          "w": 24,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "tre_set_song_ice_bass",
    "name": "Ice Bass (Song Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "24\u00d748px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_song_ice_bass)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 264,
      "y": 0,
      "w": 24,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_song_ice_bass",
        "coords": {
          "x": 264,
          "y": 0,
          "w": 24,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "tre_set_veg_turnip",
    "name": "Turnip (Veggie Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "28\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_veg_turnip)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 290,
      "y": 0,
      "w": 28,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_veg_turnip",
        "coords": {
          "x": 290,
          "y": 0,
          "w": 28,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_veg_pepper",
    "name": "Green Pepper (Veggie Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "28\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_veg_pepper)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 320,
      "y": 0,
      "w": 28,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_veg_pepper",
        "coords": {
          "x": 320,
          "y": 0,
          "w": 28,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_veg_pumpkin",
    "name": "Pumpkin (Veggie Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "32\u00d728px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_veg_pumpkin)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 350,
      "y": 0,
      "w": 32,
      "h": 28
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_veg_pumpkin",
        "coords": {
          "x": 350,
          "y": 0,
          "w": 32,
          "h": 28
        }
      }
    ]
  },
  {
    "id": "tre_set_veg_onion",
    "name": "Onion (Veggie Set)",
    "category": "treasures",
    "priority": "p1",
    "dimensions": "28\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_veg_onion)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 384,
      "y": 0,
      "w": 28,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_veg_onion",
        "coords": {
          "x": 384,
          "y": 0,
          "w": 28,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_box_andrew",
    "name": "Box Andrew (Jam Box Set)",
    "category": "treasures",
    "priority": "p2",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_box_andrew)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 414,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_box_andrew",
        "coords": {
          "x": 414,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_box_greg",
    "name": "Box Greg (Jam Box Set)",
    "category": "treasures",
    "priority": "p2",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_box_greg)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 448,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_box_greg",
        "coords": {
          "x": 448,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_box_lindsey",
    "name": "Box Lindsey (Jam Box Set)",
    "category": "treasures",
    "priority": "p2",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_box_lindsey)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 0,
      "y": 50,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_box_lindsey",
        "coords": {
          "x": 0,
          "y": 50,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_box_megan",
    "name": "Box Megan (Jam Box Set)",
    "category": "treasures",
    "priority": "p2",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_box_megan)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 34,
      "y": 50,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_box_megan",
        "coords": {
          "x": 34,
          "y": 50,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "tre_set_box_darius",
    "name": "Box Darius (Jam Box Set)",
    "category": "treasures",
    "priority": "p2",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_treasures_sets.webp (Frame: tre_set_box_darius)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_treasures_sets.webp",
    "coords": {
      "x": 68,
      "y": 50,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_box_darius",
        "coords": {
          "x": 68,
          "y": 50,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "icon_controller_nes",
    "name": "NES Retro Controller Icon",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "128\u00d764px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: icon_controller_nes)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 128,
      "h": 64
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "icon_controller_nes",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 128,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "ui_instr_dpad",
    "name": "D-Pad Directional Glyph",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d748px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_instr_dpad)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 130,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "ui_instr_dpad",
        "coords": {
          "x": 130,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "tre_set_complete_badge",
    "name": "Set Complete UI Badge",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "96\u00d748px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: tre_set_complete_badge)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 180,
      "y": 0,
      "w": 96,
      "h": 48
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "tre_set_complete_badge",
        "coords": {
          "x": 180,
          "y": 0,
          "w": 96,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "ui_instr_btn_a",
    "name": "Action Button A Glyph",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_instr_btn_a)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 278,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "ui_instr_btn_a",
        "coords": {
          "x": 278,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "ui_instr_btn_b",
    "name": "Action Button B Glyph",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_instr_btn_b)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 312,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "ui_instr_btn_b",
        "coords": {
          "x": 312,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "ui_hs_rank_medal",
    "name": "Ui Hs Rank Medal",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (3 frames)",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_hs_rank_medal)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 346,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "ui_hs_rank_medal_1",
        "coords": {
          "x": 346,
          "y": 0,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_hs_rank_medal_2",
        "coords": {
          "x": 380,
          "y": 0,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_hs_rank_medal_3",
        "coords": {
          "x": 414,
          "y": 0,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "ui_spinner",
    "name": "Ui Spinner",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (9 frames)",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_spinner)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 448,
      "y": 0,
      "w": 32,
      "h": 32
    },
    "frameCount": 9,
    "allFrames": [
      {
        "name": "ui_spinner",
        "coords": {
          "x": 448,
          "y": 0,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_0",
        "coords": {
          "x": 0,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_1",
        "coords": {
          "x": 34,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_2",
        "coords": {
          "x": 68,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_3",
        "coords": {
          "x": 102,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_4",
        "coords": {
          "x": 136,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_5",
        "coords": {
          "x": 170,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_6",
        "coords": {
          "x": 204,
          "y": 66,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "ui_spinner_7",
        "coords": {
          "x": 238,
          "y": 66,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "icon_keyboard",
    "name": "Icon Keyboard",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d724px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: icon_keyboard)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 272,
      "y": 66,
      "w": 32,
      "h": 24
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "icon_keyboard",
        "coords": {
          "x": 272,
          "y": 66,
          "w": 32,
          "h": 24
        }
      }
    ]
  },
  {
    "id": "icon_gamepad",
    "name": "Icon Gamepad",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d724px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: icon_gamepad)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 306,
      "y": 66,
      "w": 32,
      "h": 24
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "icon_gamepad",
        "coords": {
          "x": 306,
          "y": 66,
          "w": 32,
          "h": 24
        }
      }
    ]
  },
  {
    "id": "ui_hs_badge_new",
    "name": "Ui Hs Badge New",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d724px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: ui_hs_badge_new)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 340,
      "y": 66,
      "w": 64,
      "h": 24
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "ui_hs_badge_new",
        "coords": {
          "x": 340,
          "y": 66,
          "w": 64,
          "h": 24
        }
      }
    ]
  },
  {
    "id": "icon_wifi",
    "name": "Multiplayer Wi-Fi Indicator",
    "category": "uivfx",
    "priority": "p1",
    "dimensions": "24\u00d724px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: icon_wifi)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 406,
      "y": 66,
      "w": 24,
      "h": 24
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "icon_wifi",
        "coords": {
          "x": 406,
          "y": 66,
          "w": 24,
          "h": 24
        }
      }
    ]
  },
  {
    "id": "icon_disconnect",
    "name": "Connection Lost Alert",
    "category": "uivfx",
    "priority": "p1",
    "dimensions": "24\u00d724px",
    "path": "client/public/assets/atlases/atlas_ui_icons.webp (Frame: icon_disconnect)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_ui_icons.webp",
    "coords": {
      "x": 432,
      "y": 66,
      "w": 24,
      "h": 24
    },
    "frameCount": 1,
    "allFrames": [
      {
        "name": "icon_disconnect",
        "coords": {
          "x": 432,
          "y": 66,
          "w": 24,
          "h": 24
        }
      }
    ]
  },
  {
    "id": "vfx_stun_stars",
    "name": "Stun Star Burst VFX",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (4 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_stun_stars)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 16,
      "y": 16,
      "w": 32,
      "h": 32
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "vfx_stun_stars_0",
        "coords": {
          "x": 16,
          "y": 16,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_stun_stars",
        "coords": {
          "x": 80,
          "y": 16,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_stun_stars_1",
        "coords": {
          "x": 144,
          "y": 16,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_stun_stars_2",
        "coords": {
          "x": 208,
          "y": 16,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_stun_stars_3",
        "coords": {
          "x": 272,
          "y": 16,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "vfx_spill",
    "name": "Vfx Spill",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d764px (6 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_spill)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 320,
      "y": 0,
      "w": 64,
      "h": 64
    },
    "frameCount": 6,
    "allFrames": [
      {
        "name": "vfx_spill_0",
        "coords": {
          "x": 320,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "vfx_spill",
        "coords": {
          "x": 384,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "vfx_spill_1",
        "coords": {
          "x": 448,
          "y": 0,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "vfx_spill_2",
        "coords": {
          "x": 0,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "vfx_spill_3",
        "coords": {
          "x": 64,
          "y": 64,
          "w": 64,
          "h": 64
        }
      },
      {
        "name": "vfx_spill_4",
        "coords": {
          "x": 128,
          "y": 64,
          "w": 64,
          "h": 64
        }
      }
    ]
  },
  {
    "id": "vfx_pickup_flash",
    "name": "Loot Pickup Sparkle VFX",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (3 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_pickup_flash)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 208,
      "y": 80,
      "w": 32,
      "h": 32
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "vfx_pickup_flash_0",
        "coords": {
          "x": 208,
          "y": 80,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_pickup_flash",
        "coords": {
          "x": 272,
          "y": 80,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_pickup_flash_1",
        "coords": {
          "x": 336,
          "y": 80,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_pickup_flash_2",
        "coords": {
          "x": 400,
          "y": 80,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "vfx_pickup_unique",
    "name": "Vfx Pickup Unique",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d748px (5 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_pickup_unique)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 456,
      "y": 72,
      "w": 48,
      "h": 48
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "vfx_pickup_unique_0",
        "coords": {
          "x": 456,
          "y": 72,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_pickup_unique",
        "coords": {
          "x": 8,
          "y": 136,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_pickup_unique_1",
        "coords": {
          "x": 72,
          "y": 136,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_pickup_unique_2",
        "coords": {
          "x": 136,
          "y": 136,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_pickup_unique_3",
        "coords": {
          "x": 200,
          "y": 136,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "vfx_land_dust",
    "name": "Landing Dust Puff VFX",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d724px (3 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_land_dust)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 272,
      "y": 144,
      "w": 32,
      "h": 32
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "vfx_land_dust_0",
        "coords": {
          "x": 272,
          "y": 144,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_land_dust",
        "coords": {
          "x": 336,
          "y": 144,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_land_dust_1",
        "coords": {
          "x": 400,
          "y": 144,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_land_dust_2",
        "coords": {
          "x": 464,
          "y": 144,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "vfx_switch_click",
    "name": "Vfx Switch Click",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (4 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_switch_click)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 16,
      "y": 208,
      "w": 32,
      "h": 32
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "vfx_switch_click_0",
        "coords": {
          "x": 16,
          "y": 208,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_switch_click",
        "coords": {
          "x": 80,
          "y": 208,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_switch_click_1",
        "coords": {
          "x": 144,
          "y": 208,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_switch_click_2",
        "coords": {
          "x": 208,
          "y": 208,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "vfx_spawn_poof",
    "name": "Spawn Smoke Poof VFX",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_spawn_poof)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 264,
      "y": 200,
      "w": 48,
      "h": 48
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "vfx_spawn_poof_0",
        "coords": {
          "x": 264,
          "y": 200,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_spawn_poof",
        "coords": {
          "x": 328,
          "y": 200,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_spawn_poof_1",
        "coords": {
          "x": 392,
          "y": 200,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_spawn_poof_2",
        "coords": {
          "x": 456,
          "y": 200,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "vfx_spawn_poof_3",
        "coords": {
          "x": 8,
          "y": 264,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "vfx_exit_speedlines",
    "name": "Level Exit Speed Lines VFX",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "64\u00d764px (4 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_exit_speedlines)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 64,
      "y": 272,
      "w": 64,
      "h": 32
    },
    "frameCount": 5,
    "allFrames": [
      {
        "name": "vfx_exit_speedlines_0",
        "coords": {
          "x": 64,
          "y": 272,
          "w": 64,
          "h": 32
        }
      },
      {
        "name": "vfx_exit_speedlines",
        "coords": {
          "x": 128,
          "y": 272,
          "w": 64,
          "h": 32
        }
      },
      {
        "name": "vfx_exit_speedlines_1",
        "coords": {
          "x": 192,
          "y": 272,
          "w": 64,
          "h": 32
        }
      },
      {
        "name": "vfx_exit_speedlines_2",
        "coords": {
          "x": 256,
          "y": 272,
          "w": 64,
          "h": 32
        }
      },
      {
        "name": "vfx_exit_speedlines_3",
        "coords": {
          "x": 320,
          "y": 272,
          "w": 64,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "vfx_ice_slide",
    "name": "Vfx Ice Slide",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "32\u00d732px (4 frames)",
    "path": "client/public/assets/atlases/atlas_vfx.webp (Frame: vfx_ice_slide)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/atlas_vfx.webp",
    "coords": {
      "x": 400,
      "y": 272,
      "w": 32,
      "h": 32
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "vfx_ice_slide_0",
        "coords": {
          "x": 400,
          "y": 272,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_ice_slide",
        "coords": {
          "x": 464,
          "y": 272,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_ice_slide_1",
        "coords": {
          "x": 16,
          "y": 336,
          "w": 32,
          "h": 32
        }
      },
      {
        "name": "vfx_ice_slide_2",
        "coords": {
          "x": 80,
          "y": 336,
          "w": 32,
          "h": 32
        }
      }
    ]
  },
  {
    "id": "char_dwarf_idle",
    "name": "Dwarf Idle",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames loop)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_dwarf_idle_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_idle_1",
        "coords": {
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_idle_2",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_idle_3",
        "coords": {
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_dwarf_run",
    "name": "Dwarf Run",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (6 frames loop)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_run)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 192,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 6,
    "allFrames": [
      {
        "name": "char_dwarf_run_0",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_run_1",
        "coords": {
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_run_2",
        "coords": {
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_run_3",
        "coords": {
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_run_4",
        "coords": {
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_run_5",
        "coords": {
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_dwarf_jump",
    "name": "Dwarf Jump",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_jump)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 192,
      "y": 48,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_dwarf_jump_0",
        "coords": {
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_jump_1",
        "coords": {
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_jump_2",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_dwarf_duck",
    "name": "Dwarf Duck / Pickup",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (2 frames)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_duck)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 48,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 2,
    "allFrames": [
      {
        "name": "char_dwarf_duck_0",
        "coords": {
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_duck_1",
        "coords": {
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_dwarf_hurt",
    "name": "Dwarf Hurt",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_hurt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 144,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_dwarf_hurt_0",
        "coords": {
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_hurt_1",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_hurt_2",
        "coords": {
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_dwarf_stunned",
    "name": "Dwarf Stunned",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/char_dwarf.webp (Frame: char_dwarf_stunned)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_dwarf.webp",
    "coords": {
      "x": 0,
      "y": 144,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_dwarf_stunned_0",
        "coords": {
          "x": 0,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_stunned_1",
        "coords": {
          "x": 48,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_stunned_2",
        "coords": {
          "x": 96,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_dwarf_stunned_3",
        "coords": {
          "x": 144,
          "y": 144,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_idle",
    "name": "Gnome Idle",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames loop)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_gnome_idle_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_idle_1",
        "coords": {
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_idle_2",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_idle_3",
        "coords": {
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_run",
    "name": "Gnome Run",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (6 frames loop)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_run)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 192,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 6,
    "allFrames": [
      {
        "name": "char_gnome_run_0",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_run_1",
        "coords": {
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_run_2",
        "coords": {
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_run_3",
        "coords": {
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_run_4",
        "coords": {
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_run_5",
        "coords": {
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_jump",
    "name": "Gnome Jump",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_jump)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 192,
      "y": 48,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_gnome_jump_0",
        "coords": {
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_jump_1",
        "coords": {
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_jump_2",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_duck",
    "name": "Gnome Duck / Pickup",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (2 frames)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_duck)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 48,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 2,
    "allFrames": [
      {
        "name": "char_gnome_duck_0",
        "coords": {
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_duck_1",
        "coords": {
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_hurt",
    "name": "Gnome Hurt",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_hurt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 144,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_gnome_hurt_0",
        "coords": {
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_hurt_1",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_hurt_2",
        "coords": {
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_gnome_stunned",
    "name": "Gnome Stunned",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/char_gnome.webp (Frame: char_gnome_stunned)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_gnome.webp",
    "coords": {
      "x": 0,
      "y": 144,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_gnome_stunned_0",
        "coords": {
          "x": 0,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_stunned_1",
        "coords": {
          "x": 48,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_stunned_2",
        "coords": {
          "x": 96,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_gnome_stunned_3",
        "coords": {
          "x": 144,
          "y": 144,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_idle",
    "name": "Halfling Idle",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames loop)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_halfling_idle_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_idle_1",
        "coords": {
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_idle_2",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_idle_3",
        "coords": {
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_run",
    "name": "Halfling Run",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (6 frames loop)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_run)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 192,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 6,
    "allFrames": [
      {
        "name": "char_halfling_run_0",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_run_1",
        "coords": {
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_run_2",
        "coords": {
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_run_3",
        "coords": {
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_run_4",
        "coords": {
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_run_5",
        "coords": {
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_jump",
    "name": "Halfling Jump",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_jump)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 192,
      "y": 48,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_halfling_jump_0",
        "coords": {
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_jump_1",
        "coords": {
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_jump_2",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_duck",
    "name": "Halfling Duck / Pickup",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (2 frames)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_duck)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 48,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 2,
    "allFrames": [
      {
        "name": "char_halfling_duck_0",
        "coords": {
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_duck_1",
        "coords": {
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_hurt",
    "name": "Halfling Hurt",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_hurt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 144,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_halfling_hurt_0",
        "coords": {
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_hurt_1",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_hurt_2",
        "coords": {
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_halfling_stunned",
    "name": "Halfling Stunned",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/char_halfling.webp (Frame: char_halfling_stunned)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_halfling.webp",
    "coords": {
      "x": 0,
      "y": 144,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_halfling_stunned_0",
        "coords": {
          "x": 0,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_stunned_1",
        "coords": {
          "x": 48,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_stunned_2",
        "coords": {
          "x": 96,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_halfling_stunned_3",
        "coords": {
          "x": 144,
          "y": 144,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_idle",
    "name": "Sprite Idle",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames loop)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_idle)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 0,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_sprite_idle_0",
        "coords": {
          "x": 0,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_idle_1",
        "coords": {
          "x": 48,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_idle_2",
        "coords": {
          "x": 96,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_idle_3",
        "coords": {
          "x": 144,
          "y": 0,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_run",
    "name": "Sprite Run",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (6 frames loop)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_run)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 192,
      "y": 0,
      "w": 48,
      "h": 48
    },
    "frameCount": 6,
    "allFrames": [
      {
        "name": "char_sprite_run_0",
        "coords": {
          "x": 192,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_run_1",
        "coords": {
          "x": 240,
          "y": 0,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_run_2",
        "coords": {
          "x": 0,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_run_3",
        "coords": {
          "x": 48,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_run_4",
        "coords": {
          "x": 96,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_run_5",
        "coords": {
          "x": 144,
          "y": 48,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_jump",
    "name": "Sprite Jump",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_jump)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 192,
      "y": 48,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_sprite_jump_0",
        "coords": {
          "x": 192,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_jump_1",
        "coords": {
          "x": 240,
          "y": 48,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_jump_2",
        "coords": {
          "x": 0,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_duck",
    "name": "Sprite Duck / Pickup",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (2 frames)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_duck)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 48,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 2,
    "allFrames": [
      {
        "name": "char_sprite_duck_0",
        "coords": {
          "x": 48,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_duck_1",
        "coords": {
          "x": 96,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_hurt",
    "name": "Sprite Hurt",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (3 frames)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_hurt)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 144,
      "y": 96,
      "w": 48,
      "h": 48
    },
    "frameCount": 3,
    "allFrames": [
      {
        "name": "char_sprite_hurt_0",
        "coords": {
          "x": 144,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_hurt_1",
        "coords": {
          "x": 192,
          "y": 96,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_hurt_2",
        "coords": {
          "x": 240,
          "y": 96,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "char_sprite_stunned",
    "name": "Sprite Stunned",
    "category": "characters",
    "priority": "p0",
    "dimensions": "48\u00d748px (4 frames)",
    "path": "client/public/assets/atlases/char_sprite.webp (Frame: char_sprite_stunned)",
    "rawPath": "art_raw/...",
    "atlasImage": "../client/public/assets/atlases/char_sprite.webp",
    "coords": {
      "x": 0,
      "y": 144,
      "w": 48,
      "h": 48
    },
    "frameCount": 4,
    "allFrames": [
      {
        "name": "char_sprite_stunned_0",
        "coords": {
          "x": 0,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_stunned_1",
        "coords": {
          "x": 48,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_stunned_2",
        "coords": {
          "x": 96,
          "y": 144,
          "w": 48,
          "h": 48
        }
      },
      {
        "name": "char_sprite_stunned_3",
        "coords": {
          "x": 144,
          "y": 144,
          "w": 48,
          "h": 48
        }
      }
    ]
  },
  {
    "id": "bg_title",
    "name": "Title Screen Backdrop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/bg_title.webp",
    "rawPath": "art_raw/ui/bg_title.png",
    "imageUrl": "../client/public/assets/images/bg_title.webp",
    "frameCount": 1
  },
  {
    "id": "bg_hoard",
    "name": "Gold Hoard Vault Backdrop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/bg_hoard.webp",
    "rawPath": "art_raw/ui/bg_hoard.png",
    "imageUrl": "../client/public/assets/images/bg_hoard.webp",
    "frameCount": 1
  },
  {
    "id": "bg_dungeon",
    "name": "Dungeon Corridor Backdrop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/bg_dungeon.webp",
    "rawPath": "art_raw/ui/bg_dungeon.png",
    "imageUrl": "../client/public/assets/images/bg_dungeon.webp",
    "frameCount": 1
  },
  {
    "id": "bg_fork",
    "name": "Path Fork Choice Backdrop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/bg_fork.webp",
    "rawPath": "art_raw/ui/bg_fork.png",
    "imageUrl": "../client/public/assets/images/bg_fork.webp",
    "frameCount": 1
  },
  {
    "id": "ui_end_scoring",
    "name": "End Spoils Scoring Screen",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/ui_end_scoring.webp",
    "rawPath": "art_raw/ui/ui_end_scoring.png",
    "imageUrl": "../client/public/assets/images/ui_end_scoring.webp",
    "frameCount": 1
  },
  {
    "id": "ui_instructions_hs",
    "name": "Instructions & Highscores Backdrop",
    "category": "uivfx",
    "priority": "p0",
    "dimensions": "960\u00d7540px WebP",
    "path": "client/public/assets/images/ui_instructions_hs.webp",
    "rawPath": "art_raw/ui/ui_instructions_hs.png",
    "imageUrl": "../client/public/assets/images/ui_instructions_hs.webp",
    "frameCount": 1
  },
  {
    "id": "atlas_enemies_preview",
    "name": "Enemies & Traps Production Sheet",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/atlas_enemies_traps_preview.jpg",
    "rawPath": "docs/art/preview/atlas_enemies_traps_preview.jpg",
    "imageUrl": "../docs/art/preview/atlas_enemies_traps_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "atlas_level_props_preview",
    "name": "Level Props Production Sheet Showcase",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/atlas_level_props_preview.jpg",
    "rawPath": "docs/art/preview/atlas_level_props_preview.jpg",
    "imageUrl": "../docs/art/preview/atlas_level_props_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "atlas_treasures_sets_preview",
    "name": "Secondary Loot Sets Production Sheet",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/atlas_treasures_sets_preview.jpg",
    "rawPath": "docs/art/preview/atlas_treasures_sets_preview.jpg",
    "imageUrl": "../docs/art/preview/atlas_treasures_sets_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "atlas_ui_icons_preview",
    "name": "UI Glyphs & Controller Icons Sheet",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/atlas_ui_icons_preview.jpg",
    "rawPath": "docs/art/preview/atlas_ui_icons_preview.jpg",
    "imageUrl": "../docs/art/preview/atlas_ui_icons_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "atlas_vfx_preview",
    "name": "Particle VFX Effects Production Sheet",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/atlas_vfx_preview.jpg",
    "rawPath": "docs/art/preview/atlas_vfx_preview.jpg",
    "imageUrl": "../docs/art/preview/atlas_vfx_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "char_sheet_dwarf",
    "name": "Dwarf Hauler Character Sheet",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/dwarf_character_sheet_1784606165897.jpg",
    "rawPath": "docs/art/preview/dwarf_character_sheet_1784606165897.jpg",
    "imageUrl": "../docs/art/preview/dwarf_character_sheet_1784606165897.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_cavern_level",
    "name": "Cavern Biome Level Artwork Showcase",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_cavern_level_preview.jpg",
    "rawPath": "docs/art/preview/gameplay_cavern_level_preview.jpg",
    "imageUrl": "../docs/art/preview/gameplay_cavern_level_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_dungeon_level",
    "name": "Dungeon Gameplay Level Showcase",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_dungeon_level_1784606326370.jpg",
    "rawPath": "docs/art/preview/gameplay_dungeon_level_1784606326370.jpg",
    "imageUrl": "../docs/art/preview/gameplay_dungeon_level_1784606326370.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_fork_screen",
    "name": "Fork Choice Screen Gameplay Showcase",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_fork_screen_1784606363655.jpg",
    "rawPath": "docs/art/preview/gameplay_fork_screen_1784606363655.jpg",
    "imageUrl": "../docs/art/preview/gameplay_fork_screen_1784606363655.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_hoard_room",
    "name": "Gold Hoard Room Gameplay Showcase",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_hoard_room_1784606344537.jpg",
    "rawPath": "docs/art/preview/gameplay_hoard_room_1784606344537.jpg",
    "imageUrl": "../docs/art/preview/gameplay_hoard_room_1784606344537.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_ice_level",
    "name": "Ice Biome Level Artwork Showcase",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_ice_level_preview.jpg",
    "rawPath": "docs/art/preview/gameplay_ice_level_preview.jpg",
    "imageUrl": "../docs/art/preview/gameplay_ice_level_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_lava_level",
    "name": "Lava Biome Level Artwork Showcase",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_lava_level_preview.jpg",
    "rawPath": "docs/art/preview/gameplay_lava_level_preview.jpg",
    "imageUrl": "../docs/art/preview/gameplay_lava_level_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "gameplay_mist_level",
    "name": "Mist Biome Level Artwork Showcase",
    "category": "showcase",
    "priority": "p1",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/gameplay_mist_level_preview.jpg",
    "rawPath": "docs/art/preview/gameplay_mist_level_preview.jpg",
    "imageUrl": "../docs/art/preview/gameplay_mist_level_preview.jpg",
    "frameCount": 1
  },
  {
    "id": "char_sheet_gnome",
    "name": "Gnome Hauler Character Sheet",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/gnome_sprite_sheet_1784605988611.jpg",
    "rawPath": "docs/art/preview/gnome_sprite_sheet_1784605988611.jpg",
    "imageUrl": "../docs/art/preview/gnome_sprite_sheet_1784605988611.jpg",
    "frameCount": 1
  },
  {
    "id": "char_sheet_halfling",
    "name": "Halfling Hauler Character Sheet",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/halfling_character_sheet_1784606150621.jpg",
    "rawPath": "docs/art/preview/halfling_character_sheet_1784606150621.jpg",
    "imageUrl": "../docs/art/preview/halfling_character_sheet_1784606150621.jpg",
    "frameCount": 1
  },
  {
    "id": "char_sheet_sprite",
    "name": "Sprite Hauler Character Sheet",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/sprite_character_sheet_1784606136069.jpg",
    "rawPath": "docs/art/preview/sprite_character_sheet_1784606136069.jpg",
    "imageUrl": "../docs/art/preview/sprite_character_sheet_1784606136069.jpg",
    "frameCount": 1
  },
  {
    "id": "title_screen_art",
    "name": "Title Screen Concept & Arcade Key Art",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/title_screen_art_1784605975053.jpg",
    "rawPath": "docs/art/preview/title_screen_art_1784605975053.jpg",
    "imageUrl": "../docs/art/preview/title_screen_art_1784605975053.jpg",
    "frameCount": 1
  },
  {
    "id": "showcase_treasures",
    "name": "Treasures & Chests Artwork Showcase",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/treasures_and_chests_1784606181188.jpg",
    "rawPath": "docs/art/preview/treasures_and_chests_1784606181188.jpg",
    "imageUrl": "../docs/art/preview/treasures_and_chests_1784606181188.jpg",
    "frameCount": 1
  },
  {
    "id": "ui_screen_end_scoring",
    "name": "End Scoring Screen UI Layout Showcase",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/ui_end_scoring_screen_1784606213891.jpg",
    "rawPath": "docs/art/preview/ui_end_scoring_screen_1784606213891.jpg",
    "imageUrl": "../docs/art/preview/ui_end_scoring_screen_1784606213891.jpg",
    "frameCount": 1
  },
  {
    "id": "ui_screen_instructions",
    "name": "Instructions & Highscores UI Layout",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "960\u00d7540px JPG",
    "path": "docs/art/preview/ui_instructions_highscores_1784606230270.jpg",
    "rawPath": "docs/art/preview/ui_instructions_highscores_1784606230270.jpg",
    "imageUrl": "../docs/art/preview/ui_instructions_highscores_1784606230270.jpg",
    "frameCount": 1
  },
  {
    "id": "website_hero_banner",
    "name": "Dungeon Haul Key Art & Hero Banner",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1200\u00d7630px JPG",
    "path": "docs/art/preview/website_hero_banner_art.jpg",
    "rawPath": "docs/art/preview/website_hero_banner_art.jpg",
    "imageUrl": "../docs/art/preview/website_hero_banner_art.jpg",
    "frameCount": 1
  },
  {
    "id": "showcase_tiles_traps",
    "name": "World Tiles & Traps Showcase Sheet",
    "category": "showcase",
    "priority": "p0",
    "dimensions": "1920\u00d71080px JPG",
    "path": "docs/art/preview/world_tiles_and_traps_1784606198126.jpg",
    "rawPath": "docs/art/preview/world_tiles_and_traps_1784606198126.jpg",
    "imageUrl": "../docs/art/preview/world_tiles_and_traps_1784606198126.jpg",
    "frameCount": 1
  }
];

document.addEventListener('DOMContentLoaded', () => {
  let activeCategory = 'all';
  let activePriority = 'all';
  let searchQuery = '';
  let filteredItems = [...GALLERY_DATA];
  let currentModalItem = null;
  let currentAnimationFrame = 0;
  let animationInterval = null;

  const galleryGrid = document.getElementById('galleryGrid');
  const searchInput = document.getElementById('searchInput');
  const categoryFilters = document.querySelectorAll('.filter-btn[data-category]');
  const priorityFilters = document.querySelectorAll('.filter-btn[data-priority]');
  const resultCounter = document.getElementById('resultCounter');
  const modal = document.getElementById('assetModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const toast = document.getElementById('toast');

  // Stats Counters
  document.getElementById('statTotal').textContent = GALLERY_DATA.length;
  document.getElementById('statP0').textContent = GALLERY_DATA.filter(i => i.priority === 'p0').length;
  document.getElementById('statP1').textContent = GALLERY_DATA.filter(i => i.priority === 'p1').length;
  document.getElementById('statP2').textContent = GALLERY_DATA.filter(i => i.priority === 'p2').length;
  document.getElementById('statShowcase').textContent = GALLERY_DATA.filter(i => i.category === 'showcase').length;

  function renderGallery() {
    filteredItems = GALLERY_DATA.filter(item => {
      const matchCategory = activeCategory === 'all' || item.category === activeCategory;
      const matchPriority = activePriority === 'all' || item.priority === activePriority;
      const query = searchQuery.toLowerCase().trim();
      const matchSearch = !query || 
        item.name.toLowerCase().includes(query) || 
        item.id.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.dimensions.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query);

      return matchCategory && matchPriority && matchSearch;
    });

    resultCounter.textContent = `Showing ${filteredItems.length} of ${GALLERY_DATA.length} assets`;

    galleryGrid.innerHTML = '';

    if (filteredItems.length === 0) {
      galleryGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No matching assets found</h3>
          <p>Try adjusting your search query or filter selections.</p>
        </div>
      `;
      return;
    }

    filteredItems.forEach(item => {
      const card = document.createElement('div');
      card.className = 'asset-card';
      card.dataset.id = item.id;

      const priorityLabel = item.priority === 'p0' ? 'P0 MVP' : (item.priority === 'p1' ? 'P1 Expansion' : 'P2 Stretch');
      const categoryLabel = getCategoryLabel(item.category);

      let thumbHtml = '';
      if (item.isAudio || item.audioSrc) {
        thumbHtml = `
          <div style="padding: 16px; text-align: center; background: rgba(16, 12, 32, 0.95); width: 100%; border-bottom: 1px solid var(--border-muted);">
            <div style="font-size: 2.2rem; margin-bottom: 6px;">🔊</div>
            <audio controls src="${item.audioSrc}" style="width: 95%; height: 32px; filter: invert(0.85) hue-rotate(180deg);"></audio>
          </div>`;
      } else if (item.imageUrl) {
        thumbHtml = `<img src="${item.imageUrl}" alt="${item.name}" class="card-img" loading="lazy" />`;
      } else {
        thumbHtml = `<canvas class="card-canvas" data-id="${item.id}"></canvas>`;
      }

      card.innerHTML = `
        <div class="card-thumb-container">
          <span class="badge badge-priority badge-${item.priority}">${priorityLabel}</span>
          <span class="badge badge-category">${categoryLabel}</span>
          ${thumbHtml}
          ${item.frameCount > 1 ? `<span class="frame-count-tag">🎬 ${item.frameCount} frames</span>` : ''}
        </div>
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(item.name)}</h3>
          <div class="doc-id-box" title="Click to copy Doc ID">
            <code>${escapeHtml(item.id)}</code>
            <span class="copy-icon">📋</span>
          </div>
          <div class="card-meta-row">
            <span class="meta-item"><span class="meta-label">Dims:</span> ${escapeHtml(item.dimensions)}</span>
          </div>
          <div class="card-path" title="${escapeHtml(item.path)}">${escapeHtml(item.path)}</div>
        </div>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('.doc-id-box') || e.target.tagName === 'AUDIO') {
          if (e.target.closest('.doc-id-box')) copyToClipboard(item.id, 'Doc ID copied to clipboard!');
          e.stopPropagation();
          return;
        }
        openModal(item);
      });

      galleryGrid.appendChild(card);

      if (!item.isAudio && !item.audioSrc && !item.imageUrl && item.coords) {
        const canvas = card.querySelector('.card-canvas');
        renderCanvasFrame(canvas, item.atlasImage, item.coords);
      }
    });
  }

  // Atlas image cache — each WebP loaded once, all frames reuse the same Image object
  const _atlasImageCache = {};
  function getAtlasImage(url) {
    if (!_atlasImageCache[url]) {
      const entry = { img: new Image(), loaded: false, waiting: [] };
      entry.img.onload = () => {
        entry.loaded = true;
        entry.waiting.forEach(cb => cb(entry.img));
        entry.waiting = [];
      };
      entry.img.src = url;
      _atlasImageCache[url] = entry;
    }
    return _atlasImageCache[url];
  }

  function renderCanvasFrame(canvas, atlasImageUrl, coords) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const containerW = 200;
    const containerH = 165;

    // Scale small sprites up (max 4×) then clamp to container
    const rawW = coords.w;
    const rawH = coords.h;
    const scaleUp = Math.min(Math.floor(containerW / rawW), Math.floor(containerH / rawH));
    const scaleFactor = Math.max(1, Math.min(scaleUp, 4));
    let drawW = rawW * scaleFactor;
    let drawH = rawH * scaleFactor;

    if (drawW > containerW || drawH > containerH) {
      const fit = Math.min(containerW / drawW, containerH / drawH);
      drawW = Math.round(drawW * fit);
      drawH = Math.round(drawH * fit);
    }

    canvas.width = drawW;
    canvas.height = drawH;

    const draw = (img) => {
      ctx.clearRect(0, 0, drawW, drawH);
      ctx.drawImage(img, coords.x, coords.y, rawW, rawH, 0, 0, drawW, drawH);
    };

    const entry = getAtlasImage(atlasImageUrl);
    if (entry.loaded) {
      draw(entry.img);
    } else {
      ctx.clearRect(0, 0, drawW, drawH);
      entry.waiting.push(draw);
    }
  }

  function openModal(item) {
    currentModalItem = item;
    currentAnimationFrame = 0;
    if (animationInterval) clearInterval(animationInterval);

    document.getElementById('modalTitle').textContent = item.name;
    document.getElementById('modalDocId').textContent = item.id;
    document.getElementById('modalCategory').textContent = getCategoryLabel(item.category);
    document.getElementById('modalPriority').textContent = item.priority === 'p0' ? 'P0 MVP' : (item.priority === 'p1' ? 'P1 Expansion' : 'P2 Stretch');
    document.getElementById('modalPriority').className = `badge badge-priority badge-${item.priority}`;
    document.getElementById('modalDims').textContent = item.dimensions;
    document.getElementById('modalPath').textContent = item.path;

    const modalPreviewContainer = document.getElementById('modalPreviewContainer');
    modalPreviewContainer.innerHTML = '';

    if (item.isAudio || item.audioSrc) {
      modalPreviewContainer.innerHTML = `
        <div style="padding: 30px; text-align: center; background: rgba(16, 12, 32, 0.95); width: 100%; border-radius: 8px; border: 1px solid var(--border-gold);">
          <div style="font-size: 3.5rem; margin-bottom: 16px;">🔊</div>
          <audio controls autoplay src="${item.audioSrc}" style="width: 85%; height: 40px; filter: invert(0.85) hue-rotate(180deg);"></audio>
          <div style="margin-top: 12px; color: var(--gold-light); font-size: 0.9rem;">${escapeHtml(item.description || '')}</div>
        </div>`;
    } else if (item.imageUrl) {

      modalPreviewContainer.innerHTML = `<img src="${item.imageUrl}" alt="${item.name}" class="modal-large-img" />`;
    } else if (item.allFrames && item.allFrames.length > 0) {
      const canvas = document.createElement('canvas');
      canvas.className = 'modal-large-canvas';
      modalPreviewContainer.appendChild(canvas);

      function updateModalFrame() {
        const f = item.allFrames[currentAnimationFrame];
        renderModalCanvasFrame(canvas, item.atlasImage, f.coords);
        const frameCounterEl = document.getElementById('modalFrameCounter');
        if (frameCounterEl) {
          frameCounterEl.textContent = `Frame ${currentAnimationFrame + 1} of ${item.allFrames.length} (${f.name})`;
        }
      }

      updateModalFrame();

      if (item.allFrames.length > 1) {
        const controls = document.createElement('div');
        controls.className = 'modal-anim-controls';
        controls.innerHTML = `
          <button id="btnPrevFrame" class="btn-anim">◀ Prev</button>
          <span id="modalFrameCounter" class="frame-counter-badge">Frame 1 of ${item.allFrames.length}</span>
          <button id="btnNextFrame" class="btn-anim">Next ▶</button>
          <button id="btnTogglePlay" class="btn-anim btn-play">⏸ Pause</button>
        `;
        modalPreviewContainer.appendChild(controls);

        let isPlaying = true;
        animationInterval = setInterval(() => {
          if (isPlaying) {
            currentAnimationFrame = (currentAnimationFrame + 1) % item.allFrames.length;
            updateModalFrame();
          }
        }, 200);

        document.getElementById('btnPrevFrame').addEventListener('click', () => {
          currentAnimationFrame = (currentAnimationFrame - 1 + item.allFrames.length) % item.allFrames.length;
          updateModalFrame();
        });

        document.getElementById('btnNextFrame').addEventListener('click', () => {
          currentAnimationFrame = (currentAnimationFrame + 1) % item.allFrames.length;
          updateModalFrame();
        });

        const btnPlay = document.getElementById('btnTogglePlay');
        btnPlay.addEventListener('click', () => {
          isPlaying = !isPlaying;
          btnPlay.textContent = isPlaying ? '⏸ Pause' : '▶ Play';
        });
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function renderModalCanvasFrame(canvas, atlasImageUrl, coords) {
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const modalMax = 360; // max pixels wide/tall in the modal
    const rawW = coords.w;
    const rawH = coords.h;
    const scaleUp = Math.min(Math.floor(modalMax / rawW), Math.floor(modalMax / rawH));
    const scaleFactor = Math.max(1, Math.min(scaleUp, 6));
    let drawW = rawW * scaleFactor;
    let drawH = rawH * scaleFactor;

    if (drawW > modalMax || drawH > modalMax) {
      const fit = Math.min(modalMax / drawW, modalMax / drawH);
      drawW = Math.round(drawW * fit);
      drawH = Math.round(drawH * fit);
    }

    canvas.width = drawW;
    canvas.height = drawH;

    const draw = (img) => {
      ctx.clearRect(0, 0, drawW, drawH);
      ctx.drawImage(img, coords.x, coords.y, rawW, rawH, 0, 0, drawW, drawH);
    };

    const entry = getAtlasImage(atlasImageUrl);
    if (entry.loaded) {
      draw(entry.img);
    } else {
      ctx.clearRect(0, 0, drawW, drawH);
      entry.waiting.push(draw);
    }
  }


  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (animationInterval) clearInterval(animationInterval);
  }

  function copyToClipboard(text, message = 'Copied to clipboard!') {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message);
    }).catch(() => {
      const input = document.createElement('input');
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      showToast(message);
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  function getCategoryLabel(cat) {
    switch (cat) {
      case 'characters': return '🧙 Characters';
      case 'biomes': return '🧱 Biome Tiles';
      case 'enemies': return '⚔️ Enemies & Traps';
      case 'treasures': return '🪙 Treasures & Loot';
      case 'uivfx': return '⚡ UI & VFX';
      case 'showcase': return '🎨 Showcase';
      default: return cat;
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Event Listeners
  categoryFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      categoryFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderGallery();
    });
  });

  priorityFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePriority = btn.dataset.priority;
      renderGallery();
    });
  });

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderGallery();
  });

  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.getElementById('btnCopyPath').addEventListener('click', () => {
    if (currentModalItem) {
      copyToClipboard(currentModalItem.path, 'Asset path copied to clipboard!');
    }
  });

  document.getElementById('btnCopyDocId').addEventListener('click', () => {
    if (currentModalItem) {
      copyToClipboard(currentModalItem.id, 'Doc ID copied to clipboard!');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
    if (modal.classList.contains('active') && filteredItems.length > 1) {
      const idx = filteredItems.findIndex(i => i.id === currentModalItem.id);
      if (e.key === 'ArrowRight' && idx !== -1) {
        openModal(filteredItems[(idx + 1) % filteredItems.length]);
      } else if (e.key === 'ArrowLeft' && idx !== -1) {
        openModal(filteredItems[(idx - 1 + filteredItems.length) % filteredItems.length]);
      }
    }
  });

  // Initial Render
  renderGallery();
});
