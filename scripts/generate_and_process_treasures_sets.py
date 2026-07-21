import os
import json
import math
from PIL import Image, ImageDraw, ImageFilter
from asset_processor import remove_background_chroma

RAW_DIR = "art_raw/treasures_sets"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

CHROMA_BG = (235, 238, 240, 255)

def create_raw_canvas(w, h, bg=CHROMA_BG):
    return Image.new("RGBA", (w, h), bg)

# -------------------------------------------------------------
# 1. CELESTIAL SET (32x36)
# -------------------------------------------------------------

def gen_tre_set_celestial_sun():
    w, h = 32, 36
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Base Pedestal
    draw.rectangle([6, 28, 26, 34], fill=(70, 55, 40, 255), outline=(35, 25, 15, 255))
    draw.rectangle([4, 31, 28, 34], fill=(90, 70, 50, 255), outline=(35, 25, 15, 255))
    draw.line([(7, 29), (25, 29)], fill=(140, 110, 70, 255))

    # Sun Rays (8 rays)
    cx, cy = 16, 16
    ray_r_in = 7
    ray_r_out = 13
    for i in range(8):
        angle = i * (math.pi / 4)
        x1 = cx + math.cos(angle - 0.25) * ray_r_in
        y1 = cy + math.sin(angle - 0.25) * ray_r_in
        x2 = cx + math.cos(angle) * ray_r_out
        y2 = cy + math.sin(angle) * ray_r_out
        x3 = cx + math.cos(angle + 0.25) * ray_r_in
        y3 = cy + math.sin(angle + 0.25) * ray_r_in
        draw.polygon([(x1, y1), (x2, y2), (x3, y3)], fill=(255, 180, 0, 255), outline=(200, 100, 0, 255))

    # Central Sun Orb
    draw.ellipse([cx - 7, cy - 7, cx + 7, cy + 7], fill=(255, 220, 40, 255), outline=(210, 130, 0, 255))
    draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 245, 140, 255))
    draw.ellipse([cx - 2, cy - 3, cx + 1, cy], fill=(255, 255, 255, 255))

    return img

def gen_tre_set_celestial_moon():
    w, h = 32, 36
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Base Pedestal (Silver/Blue)
    draw.rectangle([6, 28, 26, 34], fill=(50, 60, 80, 255), outline=(20, 25, 40, 255))
    draw.rectangle([4, 31, 28, 34], fill=(70, 85, 110, 255), outline=(20, 25, 40, 255))
    draw.line([(7, 29), (25, 29)], fill=(120, 145, 180, 255))

    # Outer Moon Circle
    cx, cy = 16, 15
    r = 11
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(200, 225, 245, 255), outline=(70, 90, 130, 255))
    # Cutout for Crescent
    draw.ellipse([cx - r + 5, cy - r - 2, cx + r + 7, cy + r - 2], fill=CHROMA_BG)
    # Re-draw inner crescent highlight
    draw.ellipse([cx - r + 2, cy - r + 2, cx + r - 3, cy + r - 2], outline=(240, 250, 255, 255))

    # Star sparkles next to moon
    draw.point([(6, 8), (7, 8), (6, 7), (6, 9)], fill=(255, 255, 255, 255))
    draw.point([(25, 22), (26, 22), (25, 21)], fill=(180, 230, 255, 255))

    return img

def gen_tre_set_celestial_star():
    w, h = 32, 36
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Base Pedestal (Bronze/Purple)
    draw.rectangle([6, 28, 26, 34], fill=(65, 45, 75, 255), outline=(30, 15, 40, 255))
    draw.rectangle([4, 31, 28, 34], fill=(90, 65, 105, 255), outline=(30, 15, 40, 255))
    draw.line([(7, 29), (25, 29)], fill=(140, 100, 160, 255))

    # 5-pointed Star
    cx, cy = 16, 15
    outer_r = 12
    inner_r = 5
    pts = []
    for i in range(10):
        r = outer_r if i % 2 == 0 else inner_r
        angle = i * (math.pi / 5) - (math.pi / 2)
        pts.append((cx + math.cos(angle) * r, cy + math.sin(angle) * r))

    draw.polygon(pts, fill=(255, 205, 30, 255), outline=(180, 110, 0, 255))

    # Facet lines radiating from center
    for i in range(5):
        angle = i * (2 * math.pi / 5) - (math.pi / 2)
        tip_x = cx + math.cos(angle) * outer_r
        tip_y = cy + math.sin(angle) * outer_r
        draw.line([(cx, cy), (tip_x, tip_y)], fill=(255, 245, 160, 255), width=1)

    # Center Gem (Amethyst)
    draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(180, 60, 220, 255), outline=(90, 20, 120, 255))
    draw.point([(cx - 1, cy - 1)], fill=(240, 180, 255, 255))

    return img

# -------------------------------------------------------------
# 2. DIVINE SET (32x32)
# -------------------------------------------------------------

def gen_tre_set_divine_spade():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Ornate Gold Frame & Base Stem
    # Stem
    draw.polygon([(16, 20), (12, 28), (20, 28)], fill=(210, 160, 30, 255), outline=(100, 70, 10, 255))

    # Spade Lobes & Tip
    spade_pts = [
        (16, 4),   # Tip
        (26, 15),  # Right outer
        (22, 22),  # Right bottom lobe
        (16, 18),  # Inner arch
        (10, 22),  # Left bottom lobe
        (6, 15),   # Left outer
    ]
    draw.polygon(spade_pts, fill=(240, 190, 40, 255), outline=(120, 80, 10, 255))

    # Inner Divine Gem (Cyan / Sapphire)
    draw.polygon([(16, 8), (20, 14), (16, 18), (12, 14)], fill=(40, 200, 240, 255), outline=(10, 90, 130, 255))
    draw.point([(15, 11)], fill=(220, 255, 255, 255))

    # Golden Filigree Accents
    draw.line([(16, 4), (16, 8)], fill=(255, 240, 150, 255))
    draw.line([(6, 15), (12, 14)], fill=(255, 240, 150, 255))
    draw.line([(26, 15), (20, 14)], fill=(255, 240, 150, 255))

    return img

def gen_tre_set_divine_club():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Stem
    draw.polygon([(16, 18), (11, 28), (21, 28)], fill=(210, 160, 30, 255), outline=(100, 70, 10, 255))

    # 3 Club Circles
    c_gold = (240, 190, 40, 255)
    c_outline = (120, 80, 10, 255)
    # Top
    draw.ellipse([11, 4, 21, 14], fill=c_gold, outline=c_outline)
    # Left
    draw.ellipse([5, 12, 15, 22], fill=c_gold, outline=c_outline)
    # Right
    draw.ellipse([17, 12, 27, 22], fill=c_gold, outline=c_outline)

    # Emerald Gem in Center
    draw.ellipse([13, 11, 19, 17], fill=(30, 210, 110, 255), outline=(10, 90, 40, 255))
    draw.point([(14, 12)], fill=(200, 255, 220, 255))

    return img

def gen_tre_set_divine_heart():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Golden Wings on Sides
    # Left wing
    draw.polygon([(8, 14), (2, 8), (4, 18), (8, 20)], fill=(240, 190, 40, 255), outline=(120, 80, 10, 255))
    # Right wing
    draw.polygon([(24, 14), (30, 8), (28, 18), (24, 20)], fill=(240, 190, 40, 255), outline=(120, 80, 10, 255))

    # Heart Body (Ruby Red)
    # Left lobe, right lobe, bottom tip
    draw.ellipse([7, 8, 17, 18], fill=(220, 30, 60, 255), outline=(110, 10, 25, 255))
    draw.ellipse([15, 8, 25, 18], fill=(220, 30, 60, 255), outline=(110, 10, 25, 255))
    draw.polygon([(7, 14), (25, 14), (16, 27)], fill=(220, 30, 60, 255), outline=(110, 10, 25, 255))

    # Crown on Top
    draw.polygon([(11, 8), (13, 4), (16, 7), (19, 4), (21, 8)], fill=(255, 215, 0, 255), outline=(130, 90, 0, 255))

    # Highlight
    draw.ellipse([9, 10, 13, 14], fill=(255, 120, 140, 255))
    draw.point([(10, 11)], fill=(255, 230, 240, 255))

    return img

def gen_tre_set_divine_diamond():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Golden Frame Diamond
    draw.polygon([(16, 3), (29, 16), (16, 29), (3, 16)], fill=(240, 190, 40, 255), outline=(120, 80, 10, 255))

    # Inner Sapphire Diamond
    draw.polygon([(16, 6), (26, 16), (16, 26), (6, 16)], fill=(30, 160, 240, 255), outline=(10, 70, 130, 255))

    # Diamond Facets
    draw.line([(16, 6), (16, 26)], fill=(120, 210, 255, 255))
    draw.line([(6, 16), (26, 16)], fill=(120, 210, 255, 255))

    # Flare sparkle at top right
    draw.line([(22, 8), (26, 8)], fill=(255, 255, 255, 255))
    draw.line([(24, 6), (24, 10)], fill=(255, 255, 255, 255))

    return img

# -------------------------------------------------------------
# 3. SONG SET (24x48)
# -------------------------------------------------------------

def gen_tre_set_song_flame_guitar():
    w, h = 24, 48
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Neck
    draw.rectangle([10, 6, 14, 28], fill=(60, 40, 25, 255), outline=(30, 20, 10, 255))
    # Frets & Strings
    for y in range(8, 28, 4):
        draw.line([(10, y), (14, y)], fill=(160, 160, 160, 255))
    draw.line([(11, 4), (11, 38)], fill=(220, 220, 220, 255))
    draw.line([(13, 4), (13, 38)], fill=(220, 220, 220, 255))

    # Headstock (Flame Shape)
    draw.polygon([(8, 6), (12, 2), (16, 6), (14, 8), (10, 8)], fill=(220, 50, 20, 255), outline=(100, 10, 0, 255))
    # Tuning Pegs
    draw.point([(7, 4), (7, 7), (17, 4), (17, 7)], fill=(255, 215, 0, 255))

    # Flame Body
    body_pts = [
        (12, 25), (18, 27), (22, 33), (19, 39), (21, 44),
        (15, 46), (9, 46), (3, 44), (5, 39), (2, 33), (6, 27)
    ]
    draw.polygon(body_pts, fill=(230, 40, 20, 255), outline=(110, 10, 0, 255))

    # Inner Flame Layer (Yellow/Orange)
    inner_pts = [
        (12, 29), (16, 31), (19, 35), (16, 41),
        (12, 44), (8, 41), (5, 35), (8, 31)
    ]
    draw.polygon(inner_pts, fill=(255, 170, 0, 255))
    draw.polygon([(12, 33), (15, 36), (12, 41), (9, 36)], fill=(255, 240, 60, 255))

    # Pickups & Bridge
    draw.rectangle([9, 32, 15, 35], fill=(30, 30, 30, 255))
    draw.rectangle([9, 38, 15, 40], fill=(200, 200, 200, 255))

    return img

def gen_tre_set_song_ice_bass():
    w, h = 24, 48
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Neck (Silver Frost)
    draw.rectangle([10, 6, 14, 28], fill=(140, 170, 190, 255), outline=(60, 80, 100, 255))
    # Frets & Strings (4 thick bass strings)
    for y in range(8, 28, 4):
        draw.line([(10, y), (14, y)], fill=(200, 230, 255, 255))
    draw.line([(10, 4), (10, 38)], fill=(240, 250, 255, 255))
    draw.line([(11, 4), (11, 38)], fill=(240, 250, 255, 255))
    draw.line([(12, 4), (12, 38)], fill=(240, 250, 255, 255))
    draw.line([(13, 4), (13, 38)], fill=(240, 250, 255, 255))

    # Headstock (Ice Spike)
    draw.polygon([(8, 8), (12, 1), (16, 8)], fill=(160, 220, 255, 255), outline=(50, 100, 140, 255))
    # 4 Pegs
    draw.point([(7, 4), (7, 7), (17, 4), (17, 7)], fill=(220, 245, 255, 255))

    # Crystalline Body
    body_pts = [
        (12, 25), (19, 26), (23, 32), (18, 38), (22, 45),
        (12, 47), (2, 45), (6, 38), (1, 32), (5, 26)
    ]
    draw.polygon(body_pts, fill=(50, 140, 210, 255), outline=(20, 60, 110, 255))

    # Crystal Facet Overlays
    draw.polygon([(12, 25), (19, 26), (12, 36)], fill=(120, 200, 255, 255))
    draw.polygon([(12, 25), (5, 26), (12, 36)], fill=(170, 225, 255, 255))
    draw.polygon([(12, 47), (22, 45), (12, 36)], fill=(90, 175, 240, 255))
    draw.polygon([(12, 47), (2, 45), (12, 36)], fill=(140, 210, 255, 255))

    # Pickups & Bridge
    draw.rectangle([9, 32, 15, 35], fill=(20, 40, 60, 255))
    draw.rectangle([9, 39, 15, 41], fill=(220, 240, 255, 255))

    return img

# -------------------------------------------------------------
# 4. VEG SET (Turnip 28x32, Pepper 28x32, Pumpkin 32x28, Onion 28x32)
# -------------------------------------------------------------

def gen_tre_set_veg_turnip():
    w, h = 28, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Green Leafy Top
    draw.polygon([(14, 10), (8, 2), (12, 7)], fill=(60, 170, 70, 255), outline=(20, 80, 30, 255))
    draw.polygon([(14, 10), (14, 1), (17, 7)], fill=(75, 190, 85, 255), outline=(20, 80, 30, 255))
    draw.polygon([(14, 10), (20, 3), (17, 8)], fill=(60, 170, 70, 255), outline=(20, 80, 30, 255))

    # Turnip Bulb (Purple Top -> Cream Bottom)
    cx, cy = 14, 20
    draw.ellipse([4, 10, 24, 28], fill=(245, 240, 220, 255), outline=(80, 40, 70, 255))
    # Purple Shoulder Cap
    draw.chord([4, 10, 24, 28], start=180, end=360, fill=(150, 50, 140, 255))
    draw.line([(5, 19), (23, 19)], fill=(170, 70, 160, 255))

    # Root Tip
    draw.polygon([(13, 27), (15, 27), (14, 31)], fill=(235, 230, 200, 255), outline=(80, 40, 70, 255))

    # Cute Face / Shine
    draw.ellipse([8, 15, 12, 19], fill=(255, 255, 255, 180))

    return img

def gen_tre_set_veg_pepper():
    w, h = 28, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Curled Stem
    draw.polygon([(14, 9), (13, 3), (17, 2), (16, 9)], fill=(100, 70, 30, 255), outline=(40, 25, 10, 255))

    # Pepper Body (3 lobes)
    draw.ellipse([4, 8, 16, 28], fill=(40, 170, 50, 255), outline=(15, 70, 20, 255))
    draw.ellipse([12, 8, 24, 28], fill=(30, 150, 40, 255), outline=(15, 70, 20, 255))
    draw.ellipse([8, 10, 20, 29], fill=(50, 190, 60, 255), outline=(15, 70, 20, 255))

    # Bottom Lobes
    draw.ellipse([7, 24, 13, 29], fill=(35, 155, 45, 255))
    draw.ellipse([15, 24, 21, 29], fill=(30, 140, 40, 255))

    # Highlight Streak
    draw.ellipse([7, 12, 11, 20], fill=(140, 240, 150, 255))

    return img

def gen_tre_set_veg_pumpkin():
    w, h = 32, 28
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Stem
    draw.polygon([(14, 7), (13, 2), (18, 1), (17, 7)], fill=(90, 60, 25, 255), outline=(40, 25, 10, 255))
    # Vine Curl
    draw.arc([17, 2, 23, 8], start=200, end=380, fill=(60, 150, 40, 255), width=2)

    # Ribbed Lobes (Outer -> Inner)
    c_orange = (240, 120, 20, 255)
    c_dark = (160, 60, 10, 255)
    draw.ellipse([2, 6, 16, 26], fill=c_orange, outline=c_dark)
    draw.ellipse([16, 6, 30, 26], fill=c_orange, outline=c_dark)
    draw.ellipse([6, 5, 26, 27], fill=(255, 140, 30, 255), outline=c_dark)
    draw.ellipse([10, 5, 22, 27], fill=(255, 160, 40, 255), outline=c_dark)

    # Highlight
    draw.ellipse([12, 7, 16, 14], fill=(255, 210, 120, 255))

    return img

def gen_tre_set_veg_onion():
    w, h = 28, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Sprout Top
    draw.polygon([(14, 10), (12, 2), (15, 7)], fill=(70, 170, 50, 255), outline=(20, 70, 20, 255))
    draw.polygon([(14, 10), (16, 3), (17, 8)], fill=(90, 190, 60, 255), outline=(20, 70, 20, 255))

    # Onion Bulb (Golden Papery Skin)
    draw.ellipse([4, 9, 24, 27], fill=(220, 160, 60, 255), outline=(110, 70, 20, 255))
    draw.polygon([(4, 16), (24, 16), (14, 9)], fill=(220, 160, 60, 255))

    # Skin Lines
    draw.arc([6, 9, 22, 27], start=100, end=260, fill=(190, 130, 40, 255), width=1)
    draw.arc([10, 9, 18, 27], start=100, end=260, fill=(190, 130, 40, 255), width=1)

    # Root Whiskers at bottom
    draw.line([(12, 27), (10, 30)], fill=(160, 120, 60, 255))
    draw.line([(14, 27), (14, 31)], fill=(160, 120, 60, 255))
    draw.line([(16, 27), (18, 30)], fill=(160, 120, 60, 255))

    # Highlight
    draw.ellipse([7, 12, 11, 18], fill=(255, 220, 140, 255))

    return img

# -------------------------------------------------------------
# 5. BOX SET (32x32) - Team Jam Box Icons
# -------------------------------------------------------------

def gen_box_base(bg_col, trim_col, emblem_char, emblem_col=(255, 215, 0)):
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Outer Crate Body
    draw.rectangle([3, 3, 28, 28], fill=bg_col, outline=(20, 20, 20, 255), width=1)
    # Metal Corner Straps
    draw.rectangle([3, 3, 8, 8], fill=trim_col, outline=(20, 20, 20, 255))
    draw.rectangle([23, 3, 28, 8], fill=trim_col, outline=(20, 20, 20, 255))
    draw.rectangle([3, 23, 8, 28], fill=trim_col, outline=(20, 20, 20, 255))
    draw.rectangle([23, 23, 28, 28], fill=trim_col, outline=(20, 20, 20, 255))

    # Reinforcement Cross Bars
    draw.line([(4, 4), (27, 27)], fill=trim_col, width=2)
    draw.line([(4, 27), (27, 4)], fill=trim_col, width=2)

    # Center Emblem Shield / Plate
    draw.ellipse([9, 9, 22, 22], fill=(20, 20, 30, 255), outline=emblem_col, width=1)

    # Render Letter / Symbol in Center
    cx, cy = 16, 16
    if emblem_char == "A":  # Andrew - Blue Tech/A
        draw.polygon([(16, 11), (20, 20), (12, 20)], fill=emblem_col)
        draw.polygon([(16, 14), (18, 18), (14, 18)], fill=(20, 20, 30, 255))
        draw.line([(13, 17), (19, 17)], fill=emblem_col)
    elif emblem_char == "G":  # Greg - Green Skull/G
        draw.arc([11, 11, 20, 20], start=40, end=320, fill=emblem_col, width=2)
        draw.line([(16, 15), (20, 15)], fill=emblem_col, width=2)
        draw.line([(20, 15), (20, 19)], fill=emblem_col, width=2)
    elif emblem_char == "L":  # Lindsey - Purple Star/L
        draw.line([(13, 11), (13, 20)], fill=emblem_col, width=2)
        draw.line([(13, 20), (19, 20)], fill=emblem_col, width=2)
    elif emblem_char == "M":  # Megan - Gold Sun/M
        draw.polygon([(11, 20), (11, 11), (16, 16), (20, 11), (20, 20)], outline=emblem_col, width=2)
    elif emblem_char == "D":  # Darius - Red Shield/D
        draw.polygon([(12, 11), (17, 11), (20, 15), (17, 20), (12, 20)], fill=emblem_col)
        draw.polygon([(14, 13), (16, 13), (18, 15), (16, 18), (14, 18)], fill=(20, 20, 30, 255))

    # Keyhole rivet
    draw.point([(6, 6), (25, 6), (6, 25), (25, 25)], fill=(255, 255, 255, 255))

    return img

def gen_tre_set_box_andrew():
    # Sapphire Blue Crate with Gold Trim
    return gen_box_base((30, 80, 180, 255), (210, 160, 30, 255), "A", (255, 220, 50, 255))

def gen_tre_set_box_greg():
    # Emerald Green Crate with Silver Trim
    return gen_box_base((30, 160, 80, 255), (180, 190, 200, 255), "G", (255, 230, 80, 255))

def gen_tre_set_box_lindsey():
    # Amethyst Purple Crate with Rose Gold Trim
    return gen_box_base((160, 50, 180, 255), (230, 140, 170, 255), "L", (255, 240, 120, 255))

def gen_tre_set_box_megan():
    # Amber Gold Crate with Bronze Trim
    return gen_box_base((230, 150, 30, 255), (120, 80, 30, 255), "M", (255, 255, 200, 255))

def gen_tre_set_box_darius():
    # Crimson Red Crate with Dark Steel Trim
    return gen_box_base((190, 40, 40, 255), (80, 90, 100, 255), "D", (255, 215, 0, 255))


# Map of item IDs to generator functions
ITEMS = {
    "tre_set_celestial_sun": gen_tre_set_celestial_sun,
    "tre_set_celestial_moon": gen_tre_set_celestial_moon,
    "tre_set_celestial_star": gen_tre_set_celestial_star,
    "tre_set_divine_spade": gen_tre_set_divine_spade,
    "tre_set_divine_club": gen_tre_set_divine_club,
    "tre_set_divine_heart": gen_tre_set_divine_heart,
    "tre_set_divine_diamond": gen_tre_set_divine_diamond,
    "tre_set_song_flame_guitar": gen_tre_set_song_flame_guitar,
    "tre_set_song_ice_bass": gen_tre_set_song_ice_bass,
    "tre_set_veg_turnip": gen_tre_set_veg_turnip,
    "tre_set_veg_pepper": gen_tre_set_veg_pepper,
    "tre_set_veg_pumpkin": gen_tre_set_veg_pumpkin,
    "tre_set_veg_onion": gen_tre_set_veg_onion,
    "tre_set_box_andrew": gen_tre_set_box_andrew,
    "tre_set_box_greg": gen_tre_set_box_greg,
    "tre_set_box_lindsey": gen_tre_set_box_lindsey,
    "tre_set_box_megan": gen_tre_set_box_megan,
    "tre_set_box_darius": gen_tre_set_box_darius,
}

def main():
    print(f"Generating 18 raw master images in {RAW_DIR}...")
    processed_sprites = []

    for item_id, gen_fn in ITEMS.items():
        raw_img = gen_fn()
        raw_path = os.path.join(RAW_DIR, f"{item_id}.png")
        raw_img.save(raw_path, "PNG")
        print(f" Saved raw master: {raw_path}")

        # Remove chroma background
        rgba_img = remove_background_chroma(raw_img, bg_color=CHROMA_BG[:3], tolerance=30)
        processed_sprites.append((item_id, rgba_img))

    # Pack into atlas_treasures_sets (Phaser 3 JSON Hash format)
    print("\nPacking assets into atlas_treasures_sets...")

    # Shelf packing for items up to 48px high
    sheet_w, sheet_h = 512, 256
    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_json = {}

    curr_x, curr_y = 0, 0
    row_h = 0
    padding = 2

    for item_id, sprite in processed_sprites:
        sw, sh = sprite.size
        if curr_x + sw + padding > sheet_w:
            curr_x = 0
            curr_y += row_h + padding
            row_h = 0

        x, y = curr_x, curr_y
        atlas_img.paste(sprite, (x, y), sprite)

        frames_json[item_id] = {
            "frame": {"x": x, "y": y, "w": sw, "h": sh},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": sw, "h": sh},
            "sourceSize": {"w": sw, "h": sh},
            "pivot": {"x": 0.5, "y": 0.5}
        }

        curr_x += sw + padding
        row_h = max(row_h, sh)

    atlas_data = {
        "frames": frames_json,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_treasures_sets.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }

    webp_path = os.path.join(PUBLIC_DIR, "atlas_treasures_sets.webp")
    png_path = os.path.join(PUBLIC_DIR, "atlas_treasures_sets.png")
    json_path = os.path.join(PUBLIC_DIR, "atlas_treasures_sets.json")

    atlas_img.save(webp_path, "WEBP", quality=90)
    atlas_img.save(png_path, "PNG")
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"Atlas generated successfully:")
    print(f"  WebP: {webp_path}")
    print(f"  JSON: {json_path}")

    # Update client/public/assets/manifest.json
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r") as f:
            manifest = json.load(f)

        existing_keys = [a["key"] for a in manifest.get("atlases", [])]
        if "atlas_treasures_sets" not in existing_keys:
            manifest["atlases"].append({
                "key": "atlas_treasures_sets",
                "texture": "assets/atlases/atlas_treasures_sets.webp",
                "atlas": "assets/atlases/atlas_treasures_sets.json"
            })
            with open(MANIFEST_PATH, "w") as f:
                json.dump(manifest, f, indent=2)
            print(f"Updated {MANIFEST_PATH} with atlas_treasures_sets!")
        else:
            print(f"atlas_treasures_sets already in {MANIFEST_PATH}.")

if __name__ == "__main__":
    main()
