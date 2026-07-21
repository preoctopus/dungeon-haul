import os
import json
from PIL import Image, ImageDraw, ImageFilter
from asset_processor import remove_background_chroma

RAW_DIR = "art_raw/char_extras"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

CHROMA_BG = (255, 255, 255, 255)

# Helper function to create canvas with solid background for chroma keying
def create_canvas(w, h, bg=CHROMA_BG):
    return Image.new("RGBA", (w, h), bg)

# -------------------------------------------------------------
# 1. GENERATE RAW MASTER IMAGES
# -------------------------------------------------------------

def gen_title_stick_gnome():
    # 4 frames of 64x96 -> 256x96
    w, h = 256, 96
    img = create_canvas(w, h)
    
    # Palette
    c_orange = (240, 160, 64, 255)
    c_hat_brown = (130, 80, 40, 255)
    c_dark = (35, 25, 20, 255)
    c_wood = (160, 110, 60, 255)
    c_wood_dark = (100, 65, 30, 255)
    c_skin = (245, 205, 170, 255)
    c_white = (255, 255, 255, 255)
    
    for f in range(4):
        off_x = f * 64
        frame = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Walk frame bounce offsets
        bounce_y = [0, -2, 0, 2][f]
        leg_l = [(-6, 20), (-2, 22), (6, 20), (2, 18)][f]
        leg_r = [(6, 20), (2, 18), (-6, 20), (-2, 22)][f]
        stick_tilt = [-3, 0, 3, 0][f]
        
        py = 50 + bounce_y
        
        # Shadow underneath
        draw.ellipse([20, 84, 44, 90], fill=(200, 200, 200, 180))
        
        # Legs
        draw.line([(32, py + 12), (32 + leg_l[0], py + 12 + leg_l[1])], fill=c_dark, width=3)
        draw.line([(32, py + 12), (32 + leg_r[0], py + 12 + leg_r[1])], fill=c_dark, width=3)
        # Boots
        draw.rectangle([32 + leg_l[0] - 2, py + 12 + leg_l[1] - 1, 32 + leg_l[0] + 3, py + 12 + leg_l[1] + 3], fill=c_hat_brown, outline=c_dark)
        draw.rectangle([32 + leg_r[0] - 2, py + 12 + leg_r[1] - 1, 32 + leg_r[0] + 3, py + 12 + leg_r[1] + 3], fill=c_hat_brown, outline=c_dark)

        # Torso (Gnome tunic)
        draw.polygon([(26, py - 10), (38, py - 10), (40, py + 12), (24, py + 12)], fill=c_orange, outline=c_dark)
        # Belt
        draw.rectangle([24, py + 2, 40, py + 6], fill=c_hat_brown, outline=c_dark)
        draw.rectangle([30, py + 2, 34, py + 6], fill=(230, 190, 60, 255))
        
        # Head & Pointed Cap
        draw.ellipse([26, py - 26, 38, py - 14], fill=c_skin, outline=c_dark) # head
        draw.ellipse([34, py - 21, 38, py - 17], fill=c_orange) # cute nose
        draw.point([(30, py - 22), (35, py - 22)], fill=c_dark) # eyes
        
        # Pointed Gnome Hat
        hat_pts = [(24, py - 24), (39, py - 24), (35, py - 46), (28, py - 44)]
        draw.polygon(hat_pts, fill=c_hat_brown, outline=c_dark)
        draw.line([(24, py - 24), (39, py - 24)], fill=c_orange, width=2) # hat band
        
        # Title Stick Banner / Pole held overhead
        pole_x = 32 + stick_tilt
        draw.line([(pole_x - 12, py + 25), (pole_x + 12, py - 40)], fill=c_wood, width=4)
        draw.line([(pole_x - 12, py + 25), (pole_x + 12, py - 40)], fill=c_wood_dark, width=1)
        # Title Banner / Plaque on top of stick
        draw.rectangle([pole_x - 4, py - 46, pole_x + 22, py - 28], fill=(230, 210, 170, 255), outline=c_dark, width=1)
        draw.text((pole_x - 1, py - 44), "HAUL", fill=c_dark)

        # Arms holding stick
        draw.line([(26, py - 6), (pole_x - 4, py - 12)], fill=c_orange, width=3)
        draw.line([(pole_x - 4, py - 12), (pole_x + 2, py - 20)], fill=c_skin, width=2)

        # Paste onto master canvas with solid background
        bg_frame = Image.new("RGBA", (64, 96), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_title_stick_gnome.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_title_stick_sprite():
    # 4 frames of 64x96 -> 256x96
    w, h = 256, 96
    img = create_canvas(w, h)
    
    # Palette
    c_blue = (80, 160, 232, 255)
    c_wing = (200, 235, 255, 255)
    c_silver = (220, 230, 245, 255)
    c_dark = (15, 25, 45, 255)
    c_skin = (250, 220, 200, 255)
    c_magic = (100, 240, 255, 255)
    
    for f in range(4):
        off_x = f * 64
        frame = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        bounce_y = [-2, -4, -2, 0][f]
        wing_spread = [14, 8, 14, 18][f]
        leg_l = [(-4, 18), (0, 20), (4, 18), (0, 16)][f]
        leg_r = [(4, 18), (0, 16), (-4, 18), (0, 20)][f]
        
        py = 48 + bounce_y
        
        # Shadow
        draw.ellipse([24, 84, 40, 88], fill=(210, 210, 210, 180))

        # Fairy Wings behind body
        draw.polygon([(30, py - 14), (30 - wing_spread, py - 32), (30 - wing_spread + 4, py - 4)], fill=c_wing, outline=c_magic)
        draw.polygon([(34, py - 14), (34 + wing_spread, py - 32), (34 + wing_spread - 4, py - 4)], fill=c_wing, outline=c_magic)

        # Legs
        draw.line([(32, py + 10), (32 + leg_l[0], py + 10 + leg_l[1])], fill=c_blue, width=2)
        draw.line([(32, py + 10), (32 + leg_r[0], py + 10 + leg_r[1])], fill=c_blue, width=2)

        # Body / Leotard
        draw.polygon([(28, py - 12), (36, py - 12), (35, py + 10), (29, py + 10)], fill=c_blue, outline=c_dark)
        draw.line([(28, py - 2), (36, py - 2)], fill=c_silver, width=2)

        # Head & Antenna / Crown
        draw.ellipse([27, py - 26, 37, py - 14], fill=c_skin, outline=c_dark)
        draw.point([(30, py - 21), (34, py - 21)], fill=c_dark)
        # Star Antenna
        draw.line([(32, py - 26), (32, py - 34)], fill=c_silver, width=1)
        draw.rectangle([30, py - 37, 34, py - 33], fill=c_magic)

        # Wand / Title Stick
        draw.line([(20, py + 15), (44, py - 35)], fill=c_silver, width=2)
        draw.rectangle([40, py - 45, 54, py - 31], fill=c_magic, outline=c_dark)
        draw.text((43, py - 43), "S", fill=c_dark)

        # Arms
        draw.line([(29, py - 8), (38, py - 18)], fill=c_blue, width=2)

        bg_frame = Image.new("RGBA", (64, 96), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_title_stick_sprite.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_title_stick_halfling():
    # 4 frames of 64x96 -> 256x96
    w, h = 256, 96
    img = create_canvas(w, h)
    
    # Palette
    c_pink = (224, 112, 176, 255)
    c_hair = (210, 160, 80, 255)
    c_tan = (235, 190, 140, 255)
    c_dark = (35, 15, 30, 255)
    c_green = (80, 170, 90, 255)
    
    for f in range(4):
        off_x = f * 64
        frame = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        bounce_y = [0, -3, 0, 1][f]
        leg_l = [(-5, 18), (-1, 20), (5, 18), (1, 16)][f]
        leg_r = [(5, 18), (1, 16), (-5, 18), (-1, 20)][f]
        
        py = 50 + bounce_y
        
        # Shadow
        draw.ellipse([22, 84, 42, 89], fill=(200, 200, 200, 180))

        # Bare feet
        draw.line([(32, py + 12), (32 + leg_l[0], py + 12 + leg_l[1])], fill=c_tan, width=3)
        draw.line([(32, py + 12), (32 + leg_r[0], py + 12 + leg_r[1])], fill=c_tan, width=3)
        draw.ellipse([32 + leg_l[0] - 3, py + 12 + leg_l[1] - 1, 32 + leg_l[0] + 3, py + 12 + leg_l[1] + 3], fill=c_tan, outline=c_dark)
        draw.ellipse([32 + leg_r[0] - 3, py + 12 + leg_r[1] - 1, 32 + leg_r[0] + 3, py + 12 + leg_r[1] + 3], fill=c_tan, outline=c_dark)

        # Torso
        draw.rectangle([25, py - 10, 39, py + 12], fill=c_pink, outline=c_dark)
        draw.rectangle([27, py - 6, 37, py + 10], fill=c_green)

        # Head & Curly Hair
        draw.ellipse([25, py - 26, 39, py - 12], fill=c_tan, outline=c_dark)
        # Curly hair tufts
        draw.ellipse([23, py - 30, 31, py - 22], fill=c_hair)
        draw.ellipse([29, py - 32, 37, py - 24], fill=c_hair)
        draw.ellipse([33, py - 29, 41, py - 21], fill=c_hair)
        draw.point([(29, py - 20), (35, py - 20)], fill=c_dark)

        # Title Streamer Pole
        draw.line([(22, py + 10), (46, py - 38)], fill=c_hair, width=3)
        draw.polygon([(46, py - 38), (60, py - 34), (54, py - 24), (44, py - 28)], fill=c_pink, outline=c_dark)
        draw.text((47, py - 34), "H", fill=(255, 255, 255, 255))

        # Arms
        draw.line([(27, py - 4), (38, py - 12)], fill=c_tan, width=3)

        bg_frame = Image.new("RGBA", (64, 96), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_title_stick_halfling.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_title_stick_dwarf():
    # 4 frames of 64x96 -> 256x96
    w, h = 256, 96
    img = create_canvas(w, h)
    
    # Palette
    c_red = (224, 80, 64, 255)
    c_beard = (60, 45, 40, 255)
    c_metal = (140, 150, 160, 255)
    c_dark = (35, 15, 15, 255)
    c_gold = (230, 180, 50, 255)
    c_skin = (235, 185, 145, 255)
    
    for f in range(4):
        off_x = f * 64
        frame = Image.new("RGBA", (64, 96), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        bounce_y = [0, -1, 0, 1][f]
        leg_l = [(-6, 16), (-2, 18), (6, 16), (2, 14)][f]
        leg_r = [(6, 16), (2, 14), (-6, 16), (-2, 18)][f]
        beard_off = [-1, 0, 1, 0][f]
        
        py = 52 + bounce_y
        
        # Shadow
        draw.ellipse([18, 84, 46, 91], fill=(200, 200, 200, 180))

        # Legs (Short, stocky)
        draw.line([(32, py + 14), (32 + leg_l[0], py + 14 + leg_l[1])], fill=c_dark, width=4)
        draw.line([(32, py + 14), (32 + leg_r[0], py + 14 + leg_r[1])], fill=c_dark, width=4)
        # Heavy Boots
        draw.rectangle([32 + leg_l[0] - 3, py + 14 + leg_l[1] - 1, 32 + leg_l[0] + 4, py + 14 + leg_l[1] + 4], fill=c_beard, outline=c_dark)
        draw.rectangle([32 + leg_r[0] - 3, py + 14 + leg_r[1] - 1, 32 + leg_r[0] + 4, py + 14 + leg_r[1] + 4], fill=c_beard, outline=c_dark)

        # Broad Torso
        draw.rectangle([22, py - 8, 42, py + 14], fill=c_red, outline=c_dark)
        draw.rectangle([22, py + 4, 42, py + 9], fill=c_beard)
        draw.rectangle([29, py + 3, 35, py + 10], fill=c_gold, outline=c_dark)

        # Head, Helmet & Beard
        draw.ellipse([24, py - 24, 40, py - 8], fill=c_skin, outline=c_dark)
        # Helmet
        draw.chord([22, py - 28, 42, py - 14], 180, 360, fill=c_metal, outline=c_dark)
        draw.rectangle([30, py - 32, 34, py - 26], fill=c_gold)
        # Bushy Beard
        draw.polygon([(22 + beard_off, py - 14), (42 + beard_off, py - 14), (37 + beard_off, py + 4), (27 + beard_off, py + 4)], fill=c_beard, outline=c_dark)

        # Heavy Banner Pole
        draw.line([(16, py + 20), (48, py - 38)], fill=c_metal, width=4)
        draw.rectangle([40, py - 46, 58, py - 28], fill=c_red, outline=c_dark)
        draw.text((45, py - 43), "D", fill=c_gold)

        # Arms
        draw.line([(24, py - 2), (32, py - 10)], fill=c_red, width=4)

        bg_frame = Image.new("RGBA", (64, 96), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_title_stick_dwarf.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_all_argue():
    # 3 frames of 48x48 -> 144x48
    w, h = 144, 48
    img = create_canvas(w, h)
    
    c_red = (255, 60, 50, 255)
    c_amber = (255, 180, 0, 255)
    c_dark = (40, 20, 20, 255)
    c_white = (255, 255, 255, 255)
    
    for f in range(3):
        off_x = f * 48
        frame = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        if f == 0:
            # Frame 0: Exclamation mark + angry vein / sweat drops
            draw.polygon([(21, 6), (27, 6), (25, 26), (23, 26)], fill=c_red, outline=c_dark)
            draw.ellipse([22, 29, 26, 33], fill=c_red, outline=c_dark)
            # Sweat drop
            draw.ellipse([34, 12, 40, 20], fill=(100, 200, 255, 255), outline=c_dark)
            draw.polygon([(34, 14), (37, 8), (40, 14)], fill=(100, 200, 255, 255))
        elif f == 1:
            # Frame 1: Double exclamation + clashing spark
            draw.polygon([(15, 6), (20, 6), (19, 24), (16, 24)], fill=c_red, outline=c_dark)
            draw.ellipse([16, 27, 19, 30], fill=c_red, outline=c_dark)
            draw.polygon([(26, 6), (31, 6), (30, 24), (27, 24)], fill=c_amber, outline=c_dark)
            draw.ellipse([27, 27, 30, 30], fill=c_amber, outline=c_dark)
            # Lightning spark
            draw.polygon([(36, 10), (32, 20), (37, 20), (33, 32), (42, 18), (37, 18)], fill=c_amber)
        else:
            # Frame 2: Angry comic fight starburst + !
            pts = [(24, 4), (28, 12), (38, 8), (32, 18), (42, 24), (32, 30), (38, 40), (28, 36), (24, 44), (20, 36), (10, 40), (16, 30), (6, 24), (16, 18), (10, 8), (20, 12)]
            draw.polygon(pts, fill=c_amber, outline=c_red)
            draw.polygon([(21, 14), (27, 14), (25, 28), (23, 28)], fill=c_dark)
            draw.ellipse([22, 31, 26, 35], fill=c_dark)

        bg_frame = Image.new("RGBA", (48, 48), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_all_argue.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_all_rummage():
    # 4 frames of 48x48 -> 192x48
    w, h = 192, 48
    img = create_canvas(w, h)
    
    c_gold = (255, 215, 0, 255)
    c_bronze = (205, 127, 50, 255)
    c_dust = (180, 150, 110, 255)
    c_dark = (40, 40, 50, 255)
    c_white = (255, 255, 255, 255)
    c_char = (60, 80, 110, 255)

    for f in range(4):
        off_x = f * 48
        frame = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
        draw = ImageDraw.Draw(frame)
        
        # Gold pile base
        draw.ellipse([8, 30, 40, 44], fill=c_bronze, outline=c_dark)
        draw.ellipse([12, 28, 36, 40], fill=c_gold)

        if f == 0:
            # Bent over, reaching in
            draw.ellipse([14, 14, 26, 26], fill=c_char, outline=c_dark) # head
            draw.line([(20, 22), (28, 34)], fill=c_char, width=4) # back
            draw.line([(28, 34), (20, 36)], fill=c_char, width=3) # arm in pile
            draw.ellipse([6, 32, 12, 38], fill=c_dust)
        elif f == 1:
            # Digging deep, coins flying up
            draw.ellipse([16, 18, 28, 30], fill=c_char, outline=c_dark)
            draw.line([(22, 26), (30, 36)], fill=c_char, width=4)
            # Flying coins
            draw.ellipse([10, 10, 16, 16], fill=c_gold, outline=c_dark)
            draw.ellipse([32, 8, 38, 14], fill=c_gold, outline=c_dark)
            draw.point([(18, 6), (28, 4)], fill=c_white)
        elif f == 2:
            # Swishing arms left to right, dust cloud
            draw.ellipse([12, 16, 24, 28], fill=c_char, outline=c_dark)
            draw.line([(18, 24), (10, 34)], fill=c_char, width=3)
            draw.line([(18, 24), (28, 34)], fill=c_char, width=3)
            # Dust puff
            draw.ellipse([4, 26, 14, 36], fill=c_dust)
            draw.ellipse([32, 26, 44, 38], fill=c_dust)
            draw.ellipse([24, 10, 30, 16], fill=c_gold, outline=c_dark)
        else:
            # Holding up a shiny gem/trophy triumphantly
            draw.ellipse([14, 12, 26, 24], fill=c_char, outline=c_dark)
            draw.line([(20, 20), (20, 34)], fill=c_char, width=4)
            draw.line([(20, 20), (28, 10)], fill=c_char, width=3)
            # Gem held high
            draw.polygon([(28, 4), (34, 4), (37, 9), (31, 14), (25, 9)], fill=(240, 80, 120, 255), outline=c_dark)
            draw.point([(31, 6)], fill=c_white)

        bg_frame = Image.new("RGBA", (48, 48), CHROMA_BG)
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (off_x, 0))

    master_path = os.path.join(RAW_DIR, "char_all_rummage.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

def gen_ai_badge():
    # 16x16 static
    w, h = 16, 16
    img = create_canvas(w, h)
    
    frame = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    draw = ImageDraw.Draw(frame)
    
    # Outer cyan border & navy body
    c_navy = (20, 30, 55, 255)
    c_cyan = (60, 200, 255, 255)
    c_white = (240, 255, 255, 255)
    
    draw.rectangle([0, 0, 15, 15], fill=c_navy, outline=c_cyan, width=1)
    
    # "AI" lettering in pixel font (3x5 per letter)
    # 'A'
    draw.line([(2, 6), (2, 10)], fill=c_white)
    draw.line([(4, 6), (4, 10)], fill=c_white)
    draw.line([(2, 5), (4, 5)], fill=c_white)
    draw.line([(2, 8), (4, 8)], fill=c_white)

    # 'I'
    draw.line([(7, 5), (11, 5)], fill=c_white)
    draw.line([(9, 5), (9, 10)], fill=c_white)
    draw.line([(7, 10), (11, 10)], fill=c_white)
    
    # Glowing corner dots
    draw.point([(1, 1), (14, 1), (1, 14), (14, 14)], fill=c_cyan)

    bg_frame = Image.new("RGBA", (16, 16), CHROMA_BG)
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    master_path = os.path.join(RAW_DIR, "char_ai_badge.png")
    img.save(master_path)
    print(f"Created raw master: {master_path}")
    return master_path

# -------------------------------------------------------------
# 2. PROCESS & PACK INTO ATLAS
# -------------------------------------------------------------

def process_and_pack_atlas():
    print("\nProcessing raw master images and building Phaser 3 atlas...")
    
    # Generate all raw master files
    masters = {
        "char_title_stick_gnome": (gen_title_stick_gnome(), 64, 96, 4),
        "char_title_stick_sprite": (gen_title_stick_sprite(), 64, 96, 4),
        "char_title_stick_halfling": (gen_title_stick_halfling(), 64, 96, 4),
        "char_title_stick_dwarf": (gen_title_stick_dwarf(), 64, 96, 4),
        "char_all_argue": (gen_all_argue(), 48, 48, 3),
        "char_all_rummage": (gen_all_rummage(), 48, 48, 4),
        "char_ai_badge": (gen_ai_badge(), 16, 16, 1)
    }

    frames_data = {}
    
    # We will build a 512x512 atlas sheet
    sheet_w, sheet_h = 512, 512
    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    
    # Shelf packing layout
    current_x = 0
    current_y = 0
    row_h = 0

    for key, (path, fw, fh, count) in masters.items():
        master_img = Image.open(path)
        
        for f in range(count):
            # Crop frame
            box = (f * fw, 0, (f + 1) * fw, fh)
            crop_frame = master_img.crop(box)
            
            # Remove background chroma
            clean_frame = remove_background_chroma(crop_frame, bg_color=CHROMA_BG[:3], tolerance=25)
            
            # Check shelf space
            if current_x + fw > sheet_w:
                current_x = 0
                current_y += row_h
                row_h = 0
            
            x = current_x
            y = current_y
            
            # Paste into atlas
            atlas_img.paste(clean_frame, (x, y), clean_frame)
            
            # Frame key name
            frame_id = f"{key}_{f}" if count > 1 else key
            
            frames_data[frame_id] = {
                "frame": {"x": x, "y": y, "w": fw, "h": fh},
                "rotated": False,
                "trimmed": False,
                "spriteSourceSize": {"x": 0, "y": 0, "w": fw, "h": fh},
                "sourceSize": {"w": fw, "h": fh},
                "pivot": {"x": 0.5, "y": 0.5}
            }
            
            current_x += fw
            row_h = max(row_h, fh)

    atlas_json = {
        "frames": frames_data,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_char_extras.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }

    # Save outputs
    output_name = "atlas_char_extras"
    webp_path = os.path.join(PUBLIC_DIR, f"{output_name}.webp")
    png_path = os.path.join(PUBLIC_DIR, f"{output_name}.png")
    json_path = os.path.join(PUBLIC_DIR, f"{output_name}.json")

    atlas_img.save(webp_path, "WEBP", quality=95)
    atlas_img.save(png_path, "PNG")
    
    with open(json_path, "w") as f:
        json.dump(atlas_json, f, indent=2)

    print(f"Atlas generated successfully:")
    print(f"  WebP: {webp_path}")
    print(f"  PNG:  {png_path}")
    print(f"  JSON: {json_path}")

# -------------------------------------------------------------
# 3. UPDATE MANIFEST.JSON
# -------------------------------------------------------------

def update_manifest():
    print(f"\nUpdating {MANIFEST_PATH}...")
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r") as f:
            manifest = json.load(f)
    else:
        manifest = {"name": "Dungeon Haul Asset Manifest", "version": "1.0.0", "atlases": [], "images": []}

    atlases = manifest.get("atlases", [])
    
    # Check if atlas_char_extras is already present
    entry_exists = False
    for item in atlases:
        if item.get("key") == "atlas_char_extras":
            item["texture"] = "assets/atlases/atlas_char_extras.webp"
            item["atlas"] = "assets/atlases/atlas_char_extras.json"
            entry_exists = True
            break
            
    if not entry_exists:
        atlases.append({
            "key": "atlas_char_extras",
            "texture": "assets/atlases/atlas_char_extras.webp",
            "atlas": "assets/atlases/atlas_char_extras.json"
        })
        manifest["atlases"] = atlases

    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)

    print(f"Manifest updated with atlas_char_extras entry.")

if __name__ == "__main__":
    process_and_pack_atlas()
    update_manifest()
