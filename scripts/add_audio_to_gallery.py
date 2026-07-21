import os
import json

APP_JS_PATH = "asset_gallery_website/app.js"

AUDIO_ENTRIES = [
  {
    "id": "char.jump",
    "name": "Jump Sound Effect",
    "category": "audio",
    "priority": "p0",
    "dimensions": "16-bit 44.1kHz WAV (150ms)",
    "path": "client/public/assets/audio/sfx/char/char_jump.wav",
    "rawPath": "scripts/generate_sfx_jump.py",
    "audioSrc": "../client/public/assets/audio/sfx/char/char_jump.wav",
    "isAudio": True,
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
    "isAudio": True,
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
    "isAudio": True,
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
    "isAudio": True,
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
    "isAudio": True,
    "description": "Upbeat 128 BPM 8-bit NES chiptune lead, bassline & drums"
  }
]

def update_app_js():
    with open(APP_JS_PATH, "r", encoding="utf-8") as f:
        content = f.read()

    # Find the GALLERY_DATA array declaration
    prefix = "const GALLERY_DATA = ["
    if prefix in content:
        # Prepend AUDIO_ENTRIES JSON string into GALLERY_DATA
        audio_json_items = ",\n".join(json.dumps(entry, indent=2) for entry in AUDIO_ENTRIES)
        content = content.replace(prefix, f"{prefix}\n{audio_json_items},")
        
        with open(APP_JS_PATH, "w", encoding="utf-8") as f:
            f.write(content)
        print("Successfully prepended audio assets to GALLERY_DATA in app.js!")
    else:
        print("Could not locate GALLERY_DATA in app.js")

if __name__ == "__main__":
    update_app_js()
