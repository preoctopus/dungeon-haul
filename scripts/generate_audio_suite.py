#!/usr/bin/env python3
"""
Dungeon Haul — Audio Suite Generation Script
Synthesizes all P0 MVP retro 8-bit NES sound effects and music stems
into client/public/assets/audio/ for game presentation & audio director.
"""

from generate_sfx_jump import generate_jump_sfx
from generate_sfx_pickup import generate_pickup_sfx
from generate_spikes_sfx import generate_spikes_sfx
from generate_sfx_ui_start import generate_ui_start_sfx
from generate_music_title import generate_title_music

def main():
    print("=== Generating Dungeon Haul Audio Suite ===")
    generate_jump_sfx()
    generate_pickup_sfx()
    generate_spikes_sfx()
    generate_ui_start_sfx()
    generate_title_music()
    print("=== All Audio Suite Assets Successfully Generated! ===")

if __name__ == "__main__":
    main()
