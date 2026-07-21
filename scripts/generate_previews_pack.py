import os
import time
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

PREVIEW_DIR = "docs/art/preview"
os.makedirs(PREVIEW_DIR, exist_ok=True)

# Helper to create styled card background
def create_dark_canvas(width=960, height=540, bg_color=(11, 11, 18, 255)):
    return Image.new("RGBA", (width, height), bg_color)

# Draw Title Header bar
def draw_header(draw, title_text, category_text="DUNGEON HAUL — ART ASSET SHOWCASE"):
    draw.rectangle([(0, 0), (960, 48)], fill=(26, 26, 34, 255))
    draw.line([(0, 48), (960, 48)], fill=(232, 192, 64, 255), width=2)
    
    # Text fallback with default font
    draw.text((20, 14), category_text, fill=(160, 160, 180, 255))
    draw.text((360, 14), title_text, fill=(232, 192, 64, 255))

# 1. Gameplay Lava Level Preview
def make_lava_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    
    # Far BG gradient
    for y in range(48, 540):
        r = int(25 + (y - 48) * 0.15)
        g = int(10 + (y - 48) * 0.05)
        b = int(15)
        draw.line([(0, y), (960, y)], fill=(r, g, b, 255))
        
    # Lava river at bottom
    for y in range(460, 540):
        draw.line([(0, y), (960, y)], fill=(240, y - 260, 20, 255))
        
    # Basalt Ledges
    draw.rectangle([(60, 360), (340, 460)], fill=(35, 30, 45, 255), outline=(75, 65, 90, 255), width=2)
    draw.rectangle([(420, 300), (700, 460)], fill=(35, 30, 45, 255), outline=(75, 65, 90, 255), width=2)
    draw.rectangle([(760, 240), (920, 460)], fill=(35, 30, 45, 255), outline=(75, 65, 90, 255), width=2)
    
    # Spire prop & Gold Gate
    draw.polygon([(820, 120), (790, 240), (850, 240)], fill=(50, 40, 60, 255))
    draw.rectangle([(860, 140), (910, 240)], fill=(212, 160, 23, 255), outline=(255, 225, 100, 255), width=2)
    
    # Haulers (represented by crisp colored figures)
    # Gnome (Amber)
    draw.rectangle([(160, 312), (200, 360)], fill=(240, 160, 64, 255), outline=(20, 20, 20, 255), width=2)
    # Sprite (Blue)
    draw.rectangle([(500, 252), (540, 300)], fill=(80, 160, 232, 255), outline=(20, 20, 20, 255), width=2)
    # Dwarf (Red)
    draw.rectangle([(620, 252), (660, 300)], fill=(224, 80, 64, 255), outline=(20, 20, 20, 255), width=2)
    
    draw_header(draw, "LAVA BIOME — BASALT LEDGES & MAGMA VAULT")
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/gameplay_lava_level_preview.jpg", quality=92)
    print("Saved gameplay_lava_level_preview.jpg")

# 2. Gameplay Ice Level Preview
def make_ice_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    
    # Ice cave BG
    for y in range(48, 540):
        r = int(10 + (y - 48) * 0.05)
        g = int(25 + (y - 48) * 0.12)
        b = int(50 + (y - 48) * 0.2)
        draw.line([(0, y), (960, y)], fill=(r, g, b, 255))
        
    # Hanging Icicles from ceiling
    for x in range(80, 900, 120):
        draw.polygon([(x, 48), (x + 30, 48), (x + 15, 140)], fill=(180, 230, 255, 255))
        
    # Ice Ledges
    draw.rectangle([(80, 380), (380, 480)], fill=(120, 190, 230, 255), outline=(200, 240, 255, 255), width=2)
    draw.rectangle([(460, 320), (740, 480)], fill=(120, 190, 230, 255), outline=(200, 240, 255, 255), width=2)
    
    # Crystal Geode
    draw.polygon([(580, 250), (610, 220), (640, 250), (620, 320), (600, 320)], fill=(80, 220, 255, 255))
    
    # Haulers on ice
    draw.rectangle([(200, 332), (240, 380)], fill=(224, 112, 176, 255), outline=(20, 20, 20, 255), width=2)
    draw.rectangle([(520, 272), (560, 320)], fill=(240, 160, 64, 255), outline=(20, 20, 20, 255), width=2)
    
    draw_header(draw, "ICE BIOME — FROZEN GLACIER & CRYSTAL CAVERN")
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/gameplay_ice_level_preview.jpg", quality=92)
    print("Saved gameplay_ice_level_preview.jpg")

# 3. Gameplay Cavern Preview
def make_cavern_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    
    # Cavern BG
    for y in range(48, 540):
        r = int(18 + y * 0.02)
        g = int(22 + y * 0.03)
        b = int(28 + y * 0.04)
        draw.line([(0, y), (960, y)], fill=(r, g, b, 255))
        
    # Dark rock ledges & moss
    draw.rectangle([(100, 370), (420, 490)], fill=(40, 48, 42, 255), outline=(80, 100, 85, 255), width=2)
    draw.rectangle([(500, 310), (820, 490)], fill=(40, 48, 42, 255), outline=(80, 100, 85, 255), width=2)
    
    # Bioluminescent mushrooms
    draw.ellipse([(140, 320), (180, 370)], fill=(40, 220, 180, 255))
    draw.ellipse([(700, 260), (740, 310)], fill=(180, 60, 240, 255))
    
    # Hauler
    draw.rectangle([(240, 322), (280, 370)], fill=(80, 160, 232, 255), outline=(20, 20, 20, 255), width=2)
    
    draw_header(draw, "CAVERN BIOME — NEON MUSHROOM UNDERGROUND")
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/gameplay_cavern_level_preview.jpg", quality=92)
    print("Saved gameplay_cavern_level_preview.jpg")

# 4. Gameplay Mist Preview
def make_mist_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    
    # Mist BG
    for y in range(48, 540):
        v = int(20 + y * 0.06)
        draw.line([(0, y), (960, y)], fill=(v, v + 10, v + 15, 255))
        
    # Ancient Ruin Arch
    draw.rectangle([(120, 150), (180, 420)], fill=(60, 70, 75, 255), outline=(100, 120, 130, 255), width=2)
    draw.rectangle([(320, 150), (380, 420)], fill=(60, 70, 75, 255), outline=(100, 120, 130, 255), width=2)
    draw.rectangle([(120, 150), (380, 200)], fill=(60, 70, 75, 255), outline=(100, 120, 130, 255), width=2)
    
    # Rune glow
    draw.text((140, 220), "ᚱ ᚢ ᚾ ᛖ", fill=(80, 220, 240, 255))
    
    # Fog layer
    draw.rectangle([(0, 420), (960, 540)], fill=(120, 140, 150, 128))
    
    draw_header(draw, "MIST BIOME — ANCIENT RUINS & SPIRIT FOG")
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/gameplay_mist_level_preview.jpg", quality=92)
    print("Saved gameplay_mist_level_preview.jpg")

# 5. Enemies & Hazards Atlas Grid
def make_enemies_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    draw_header(draw, "EXPANSION ENEMIES & ADVANCED TRAPS ATLAS")
    
    # Grid elements
    labels = ["Stone Golem", "Phantom Hand", "Tesla Coil", "Poison Gas Vent", "Crushing Block", "Shock Floor"]
    colors = [(100, 90, 80), (160, 80, 220), (60, 180, 255), (60, 220, 100), (140, 60, 60), (240, 200, 60)]
    
    for i in range(6):
        col = i % 3
        row = i // 3
        x = 60 + col * 290
        y = 80 + row * 220
        
        draw.rectangle([(x, y), (x + 260, y + 190)], fill=(20, 22, 32, 255), outline=(232, 192, 64, 255), width=2)
        draw.rectangle([(x + 80, y + 30), (x + 180, y + 130)], fill=colors[i], outline=(255, 255, 255, 255), width=2)
        draw.text((x + 20, y + 155), labels[i], fill=(232, 192, 64, 255))
        
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/atlas_enemies_traps_preview.jpg", quality=92)
    print("Saved atlas_enemies_traps_preview.jpg")

# 6. Treasure Sets Showcase
def make_treasure_sets_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    draw_header(draw, "SECONDARY LOOT SETS — CELESTIAL, DIVINE, ROCKER & VEGGIES")
    
    set_names = ["Celestial Set", "Divine Suits", "Rocker Gear", "Veggie Harvest", "Team Box Set"]
    for i, name in enumerate(set_names):
        y = 75 + i * 88
        draw.rectangle([(40, y), (920, y + 70)], fill=(20, 22, 32, 255), outline=(80, 90, 110, 255), width=1)
        draw.text((60, y + 24), name, fill=(232, 192, 64, 255))
        
        # Draw 4-5 dummy icons per row
        for k in range(5):
            ix = 260 + k * 120
            draw.ellipse([(ix, y + 15), (ix + 40, y + 55)], fill=(200, 160 - k * 20, 40 + k * 30, 255))
            
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/atlas_treasures_sets_preview.jpg", quality=92)
    print("Saved atlas_treasures_sets_preview.jpg")

# 7. Level Props Preview
def make_level_props_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    draw_header(draw, "LEVEL DECOR & PARALLAX PROPS SHEET")
    
    props = ["Candelabra", "Coin Pile", "Wall Torch", "Dungeon Banner", "Sewer Grate", "Ghost Lantern"]
    for i, p in enumerate(props):
        col = i % 3
        row = i // 3
        x = 60 + col * 290
        y = 80 + row * 220
        
        draw.rectangle([(x, y), (x + 260, y + 190)], fill=(20, 24, 30, 255), outline=(70, 80, 100, 255), width=1)
        draw.rectangle([(x + 90, y + 40), (x + 170, y + 130)], fill=(180, 120, 60, 255), outline=(232, 192, 64, 255), width=1)
        draw.text((x + 20, y + 155), p, fill=(244, 239, 228, 255))
        
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/atlas_level_props_preview.jpg", quality=92)
    print("Saved atlas_level_props_preview.jpg")

# 8. VFX Particles Preview
def make_vfx_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    draw_header(draw, "CORE PARTICLE VFX & ACTION EFFECTS SHEET")
    
    effects = ["Stun Stars", "Spill Burst", "Pickup Flash", "Land Dust", "Exit Speedlines", "Ice Skid"]
    for i, eff in enumerate(effects):
        col = i % 3
        row = i // 3
        x = 60 + col * 290
        y = 80 + row * 220
        
        draw.rectangle([(x, y), (x + 260, y + 190)], fill=(15, 18, 25, 255), outline=(60, 70, 90, 255), width=1)
        draw.text((x + 20, y + 155), eff, fill=(232, 192, 64, 255))
        
        # VFX bursts
        cx, cy = x + 130, y + 80
        for radius in [15, 30, 45]:
            draw.ellipse([(cx - radius, cy - radius), (cx + radius, cy + radius)], outline=(255, 220, 80, 255), width=2)
            
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/atlas_vfx_preview.jpg", quality=92)
    print("Saved atlas_vfx_preview.jpg")

# 9. UI Icons Preview
def make_ui_icons_preview():
    canvas = create_dark_canvas()
    draw = ImageDraw.Draw(canvas)
    draw_header(draw, "USER INTERFACE GLYPHS, BUTTONS & MEDALS")
    
    icons = ["D-Pad Controls", "Action Buttons A/B", "Rank 1-3 Medals", "Set Complete Badge", "High Score New!", "WiFi / Latency"]
    for i, ic in enumerate(icons):
        col = i % 3
        row = i // 3
        x = 60 + col * 290
        y = 80 + row * 220
        
        draw.rectangle([(x, y), (x + 260, y + 190)], fill=(24, 24, 34, 255), outline=(232, 192, 64, 255), width=1)
        draw.text((x + 20, y + 155), ic, fill=(232, 192, 64, 255))
        
        # Circle icon representation
        draw.ellipse([(x + 90, y + 40), (x + 170, y + 120)], fill=(232, 192, 64, 255), outline=(255, 255, 255, 255), width=2)
        
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/atlas_ui_icons_preview.jpg", quality=92)
    print("Saved atlas_ui_icons_preview.jpg")

# 10. Website Hero Banner
def make_website_hero_banner():
    canvas = create_dark_canvas(width=1200, height=675)
    draw = ImageDraw.Draw(canvas)
    
    # Dark navy theme gradient
    for y in range(675):
        r = int(11 + y * 0.02)
        g = int(11 + y * 0.02)
        b = int(24 + y * 0.04)
        draw.line([(0, y), (1200, y)], fill=(r, g, b, 255))
        
    # Gold radiant glow in center
    draw.ellipse([(350, 100), (850, 600)], fill=(60, 45, 15, 255))
    
    # Big DUNGEON HAUL banner
    draw.rectangle([(300, 240), (900, 360)], fill=(26, 26, 34, 255), outline=(232, 192, 64, 255), width=4)
    draw.text((440, 280), "DUNGEON HAUL", fill=(232, 192, 64, 255))
    draw.text((380, 380), "A 4-PLAYER CO-OP LOOT SCROLLER & HEIST GAME", fill=(244, 239, 228, 255))
    
    # 4 Haulers on banner
    # Gnome
    draw.rectangle([(150, 420), (220, 520)], fill=(240, 160, 64, 255), outline=(255, 255, 255, 255), width=2)
    # Sprite
    draw.rectangle([(350, 420), (420, 520)], fill=(80, 160, 232, 255), outline=(255, 255, 255, 255), width=2)
    # Halfling
    draw.rectangle([(780, 420), (850, 520)], fill=(224, 112, 176, 255), outline=(255, 255, 255, 255), width=2)
    # Dwarf
    draw.rectangle([(980, 420), (1050, 520)], fill=(224, 80, 64, 255), outline=(255, 255, 255, 255), width=2)
    
    canvas.convert("RGB").save(f"{PREVIEW_DIR}/website_hero_banner_art.jpg", quality=95)
    print("Saved website_hero_banner_art.jpg")

if __name__ == "__main__":
    make_lava_preview()
    make_ice_preview()
    make_cavern_preview()
    make_mist_preview()
    make_enemies_preview()
    make_treasure_sets_preview()
    make_level_props_preview()
    make_vfx_preview()
    make_ui_icons_preview()
    make_website_hero_banner()
    print("All 10 preview art assets generated successfully in docs/art/preview/!")
