import os
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter
from asset_processor import remove_background_chroma

RAW_DIR = "art_raw/level_props"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. RAW MASTER IMAGE GENERATORS
# -------------------------------------------------------------

def create_candelabra_master():
    """px_gold_near_candelabra: 32x96 cell, 3 frames -> 96x96 master image."""
    img = Image.new("RGBA", (96, 96), (255, 255, 255, 255))
    
    for f in range(3):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 96), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        # Heavy ornate gold pedestal at bottom
        draw.ellipse([8, 80, 24, 92], fill=(180, 135, 15), outline=(90, 65, 5))
        draw.rectangle([10, 78, 22, 84], fill=(220, 175, 30), outline=(90, 65, 5))
        
        # Main central stem
        draw.rectangle([14, 28, 18, 80], fill=(230, 185, 35), outline=(90, 65, 5))
        draw.line([(15, 28), (15, 80)], fill=(255, 230, 130), width=1) # Highlight
        
        # Decorative stem knop
        draw.ellipse([11, 48, 21, 58], fill=(220, 175, 30), outline=(90, 65, 5))
        
        # Curved side arms
        draw.arc([3, 32, 17, 58], start=90, end=270, fill=(180, 135, 15), width=3)
        draw.arc([15, 32, 29, 58], start=270, end=450, fill=(180, 135, 15), width=3)
        
        # Candle cups (3 cups at x=4, 14, 24)
        for cx in [4, 14, 24]:
            draw.rectangle([cx-1, 28, cx+5, 33], fill=(220, 175, 30), outline=(90, 65, 5))
            # Candle wax pillar
            draw.rectangle([cx, 16, cx+4, 28], fill=(245, 240, 220), outline=(150, 145, 125))
            # Wick
            draw.line([(cx+2, 12), (cx+2, 16)], fill=(40, 40, 40), width=1)
            
        # 3 Frames of flickering flame shapes
        flame_shapes = [
            # Frame 0
            [ [(6, 12), (4, 6), (6, 2), (8, 6)], [(16, 12), (14, 4), (16, 0), (18, 4)], [(26, 12), (24, 6), (26, 2), (28, 6)] ],
            # Frame 1
            [ [(6, 12), (3, 5), (5, 1), (8, 5)], [(16, 12), (13, 5), (15, 0), (18, 3)], [(26, 12), (23, 5), (25, 1), (28, 5)] ],
            # Frame 2
            [ [(6, 12), (5, 7), (7, 3), (9, 7)], [(16, 12), (15, 3), (17, 1), (19, 5)], [(26, 12), (25, 7), (27, 3), (29, 7)] ]
        ][f]
        
        for pts in flame_shapes:
            # Outer flame (orange)
            draw.polygon(pts, fill=(255, 120, 0))
            # Inner flame (yellow)
            inner_pts = [(p[0], p[1]+2) for p in pts]
            draw.polygon(inner_pts, fill=(255, 220, 40))
            # Core glow (white)
            core_pts = [(p[0], p[1]+4) for p in pts]
            draw.polygon(core_pts, fill=(255, 255, 210))

        bg_frame = Image.new("RGBA", (32, 96), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "px_gold_near_candelabra.png"))
    print("Created raw master: px_gold_near_candelabra.png")


def create_gold_pile_master():
    """px_gold_near_pile: 96x64 master image."""
    img = Image.new("RGBA", (96, 64), (255, 255, 255, 255))
    frame = Image.new("RGBA", (96, 64), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    # Base stone/gold shadow mound
    draw.ellipse([4, 24, 92, 62], fill=(100, 70, 10))
    
    # Layered coin mound
    piles = [
        ([8, 30, 88, 60], (180, 130, 10), (100, 70, 5)),
        ([12, 24, 84, 56], (215, 160, 20), (120, 85, 10)),
        ([18, 18, 78, 50], (240, 185, 30), (140, 100, 15)),
        ([26, 12, 70, 42], (255, 210, 50), (160, 120, 20)),
        ([36, 6, 60, 32], (255, 235, 100), (180, 140, 25))
    ]
    for box, fill, out in piles:
        draw.ellipse(box, fill=fill, outline=out)

    # Coin texture dots
    rng = random.Random(42)
    for _ in range(120):
        cx = rng.randint(14, 82)
        cy = rng.randint(16, 54)
        if ((cx - 48)/36)**2 + ((cy - 36)/20)**2 <= 1.0:
            c_fill = rng.choice([(255, 240, 150), (255, 210, 40), (200, 145, 15)])
            draw.ellipse([cx-2, cy-1, cx+2, cy+1], fill=c_fill, outline=(120, 80, 10))

    # Embedded Gems
    gems = [
        (32, 36, (230, 30, 40), (110, 10, 20)),   # Ruby
        (64, 40, (30, 140, 240), (10, 50, 120)),  # Sapphire
        (48, 28, (40, 220, 100), (10, 100, 40)),  # Emerald
        (22, 44, (240, 50, 180), (120, 10, 90)),  # Amethyst
        (72, 30, (230, 30, 40), (110, 10, 20)),   # Ruby
    ]
    for gx, gy, gcol, gout in gems:
        draw.polygon([(gx, gy-4), (gx+4, gy), (gx, gy+4), (gx-4, gy)], fill=gcol, outline=gout)
        draw.point((gx-1, gy-1), fill=(255, 255, 255))

    # Golden Chalice
    draw.polygon([(70, 16), (82, 16), (78, 26), (74, 26)], fill=(255, 220, 50), outline=(130, 90, 10))
    draw.rectangle([75, 26, 77, 32], fill=(220, 175, 30), outline=(130, 90, 10))
    draw.ellipse([72, 30, 80, 35], fill=(255, 220, 50), outline=(130, 90, 10))

    # Crown on top
    draw.polygon([(42, 10), (45, 16), (48, 8), (51, 16), (54, 10), (54, 18), (42, 18)], fill=(255, 215, 0), outline=(140, 95, 10))
    draw.rectangle([42, 18, 54, 21], fill=(220, 170, 20), outline=(140, 95, 10))

    # Sparkle glints
    for sx, sy in [(48, 6), (30, 24), (66, 22)]:
        draw.line([(sx-3, sy), (sx+3, sy)], fill=(255, 255, 255), width=1)
        draw.line([(sx, sy-3), (sx, sy+3)], fill=(255, 255, 255), width=1)

    bg_frame = Image.new("RGBA", (96, 64), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_gold_near_pile.png"))
    print("Created raw master: px_gold_near_pile.png")


def create_chest_stack_master():
    """px_gold_near_chest_stack: 96x80 master image."""
    img = Image.new("RGBA", (96, 80), (255, 255, 255, 255))
    frame = Image.new("RGBA", (96, 80), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    # 1. Bottom Left Wooden Chest
    draw.rectangle([4, 44, 52, 76], fill=(110, 65, 30), outline=(40, 22, 10))
    draw.rectangle([4, 44, 10, 76], fill=(70, 75, 80), outline=(30, 32, 35))
    draw.rectangle([46, 44, 52, 76], fill=(70, 75, 80), outline=(30, 32, 35))
    draw.rectangle([25, 44, 31, 76], fill=(70, 75, 80), outline=(30, 32, 35))
    draw.rectangle([24, 54, 32, 64], fill=(220, 175, 30), outline=(90, 65, 5))
    draw.ellipse([26, 56, 30, 60], fill=(20, 20, 20))

    # 2. Bottom Right Gold Chest
    draw.rectangle([44, 44, 92, 76], fill=(215, 160, 25), outline=(110, 75, 10))
    draw.rectangle([44, 44, 92, 49], fill=(255, 215, 50), outline=(110, 75, 10))
    draw.rectangle([44, 71, 92, 76], fill=(255, 215, 50), outline=(110, 75, 10))
    draw.rectangle([44, 44, 50, 76], fill=(255, 215, 50), outline=(110, 75, 10))
    draw.rectangle([86, 44, 92, 76], fill=(255, 215, 50), outline=(110, 75, 10))
    draw.ellipse([64, 54, 72, 64], fill=(230, 30, 40), outline=(100, 10, 15))
    draw.point((66, 56), fill=(255, 200, 200))

    # 3. Top Center Open Chest overflowing with loot
    draw.polygon([(26, 10), (70, 10), (66, 22), (30, 22)], fill=(130, 80, 35), outline=(40, 22, 10))
    draw.rectangle([26, 24, 70, 46], fill=(110, 65, 30), outline=(40, 22, 10))
    draw.rectangle([26, 24, 30, 46], fill=(70, 75, 80), outline=(30, 32, 35))
    draw.rectangle([66, 24, 70, 46], fill=(70, 75, 80), outline=(30, 32, 35))
    draw.ellipse([28, 18, 68, 28], fill=(255, 215, 40), outline=(140, 95, 10))
    for cx in range(32, 65, 5):
        draw.ellipse([cx-3, 19, cx+3, 25], fill=(255, 240, 120), outline=(140, 95, 10))
    draw.arc([36, 24, 54, 38], start=0, end=180, fill=(240, 240, 255), width=2)

    bg_frame = Image.new("RGBA", (96, 80), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_gold_near_chest_stack.png"))
    print("Created raw master: px_gold_near_chest_stack.png")


def create_torch_master():
    """px_dun_near_torch: 32x64 cell, 4 frames -> 128x64 master image."""
    img = Image.new("RGBA", (128, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Stone wall plate & iron sconce bracket
        draw.rectangle([10, 38, 14, 52], fill=(60, 60, 65), outline=(25, 25, 30))
        draw.polygon([(14, 42), (20, 36), (20, 42), (14, 46)], fill=(80, 80, 85), outline=(25, 25, 30))
        
        # Torch handle
        draw.polygon([(18, 30), (22, 30), (20, 56), (16, 56)], fill=(90, 55, 25), outline=(35, 20, 10))
        draw.rectangle([16, 26, 24, 33], fill=(45, 35, 30), outline=(20, 15, 10))

        # Animated flames
        flame_shapes = [
            [ [(15, 26), (25, 26), (22, 14), (20, 4), (17, 14)], [(17, 26), (23, 26), (21, 16), (20, 8), (18, 16)] ],
            [ [(15, 26), (25, 26), (24, 14), (23, 3), (18, 15)], [(17, 26), (23, 26), (22, 16), (21, 7), (19, 17)] ],
            [ [(15, 26), (25, 26), (20, 13), (17, 2), (16, 14)], [(17, 26), (23, 26), (19, 15), (18, 6), (17, 16)] ],
            [ [(15, 26), (25, 26), (23, 12), (21, 5), (18, 13)], [(17, 26), (23, 26), (21, 14), (20, 9), (18, 15)] ]
        ][f]

        outer_f, inner_f = flame_shapes
        draw.polygon(outer_f, fill=(255, 110, 0))
        draw.polygon(inner_f, fill=(255, 220, 30))
        core_f = [(p[0], p[1]+4) for p in inner_f]
        draw.polygon(core_f, fill=(255, 255, 220))

        sparks = [[(24, 8), (26, 2)], [(25, 7), (27, 4)], [(14, 6), (12, 1)], [(23, 6), (25, 3)]][f]
        for sx, sy in sparks:
            draw.point((sx, sy), fill=(255, 200, 50))

        bg_frame = Image.new("RGBA", (32, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "px_dun_near_torch.png"))
    print("Created raw master: px_dun_near_torch.png")


def create_banner_master():
    """px_dun_near_banner: 48x96 master image."""
    img = Image.new("RGBA", (48, 96), (255, 255, 255, 255))
    frame = Image.new("RGBA", (48, 96), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    # Top wooden crossbar
    draw.rectangle([2, 4, 46, 10], fill=(80, 50, 25), outline=(35, 20, 10))
    draw.rectangle([0, 2, 5, 12], fill=(220, 175, 30), outline=(100, 70, 10))
    draw.rectangle([43, 2, 48, 12], fill=(220, 175, 30), outline=(100, 70, 10))

    # Crimson cloth
    cloth_pts = [
        (6, 10), (42, 10),
        (42, 80), (36, 90), (30, 82), (24, 92), (18, 82), (12, 90), (6, 80)
    ]
    draw.polygon(cloth_pts, fill=(155, 20, 35), outline=(70, 10, 15))

    # Folds
    draw.polygon([(6, 10), (14, 10), (14, 84), (6, 80)], fill=(120, 15, 25))
    draw.polygon([(34, 10), (42, 10), (42, 80), (34, 86)], fill=(120, 15, 25))
    draw.line([(24, 10), (24, 90)], fill=(185, 30, 45), width=2)

    # Gold trim
    draw.line([(8, 12), (40, 12)], fill=(220, 175, 30), width=2)
    draw.line([(8, 12), (8, 76)], fill=(220, 175, 30), width=2)
    draw.line([(40, 12), (40, 76)], fill=(220, 175, 30), width=2)

    # Golden Skull Emblem
    draw.ellipse([18, 32, 30, 46], fill=(230, 185, 40), outline=(100, 70, 10))
    draw.rectangle([20, 38, 23, 42], fill=(70, 10, 15))
    draw.rectangle([25, 38, 28, 42], fill=(70, 10, 15))
    draw.rectangle([21, 46, 27, 50], fill=(230, 185, 40), outline=(100, 70, 10))
    draw.line([(23, 46), (23, 50)], fill=(70, 10, 15))
    draw.line([(25, 46), (25, 50)], fill=(70, 10, 15))

    bg_frame = Image.new("RGBA", (48, 96), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_dun_near_banner.png"))
    print("Created raw master: px_dun_near_banner.png")


def create_grate_master():
    """px_dun_near_grate: 64x64 master image."""
    img = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
    frame = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    # Dark sewer pit abyss
    draw.rectangle([4, 4, 60, 60], fill=(12, 14, 18))
    
    # Toxic green slime water
    draw.ellipse([8, 12, 56, 56], fill=(20, 90, 45))
    draw.ellipse([14, 20, 50, 48], fill=(40, 180, 80))
    draw.ellipse([22, 28, 42, 40], fill=(90, 240, 130))

    # Outer stone rim
    draw.rectangle([0, 0, 64, 64], outline=(50, 55, 60), width=4)
    draw.rectangle([2, 2, 62, 62], outline=(30, 32, 35), width=2)

    # Iron Grate Grid Bars
    for y in [12, 24, 36, 48]:
        draw.line([(4, y), (60, y)], fill=(65, 70, 75), width=4)
        draw.line([(4, y-1), (60, y-1)], fill=(110, 115, 120), width=1)
        draw.line([(4, y+1), (60, y+1)], fill=(30, 32, 35), width=1)

    for x in [12, 24, 36, 48]:
        draw.line([(x, 4), (x, 60)], fill=(65, 70, 75), width=4)
        draw.line([(x-1, 4), (x-1, 60)], fill=(110, 115, 120), width=1)
        draw.line([(x+1, 4), (x+1, 60)], fill=(30, 32, 35), width=1)

    # Rust patches
    for rx, ry in [(12, 24), (36, 12), (48, 48), (24, 36)]:
        draw.ellipse([rx-3, ry-3, rx+3, ry+3], fill=(140, 60, 25))

    bg_frame = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_dun_near_grate.png"))
    print("Created raw master: px_dun_near_grate.png")


def create_icicle_master():
    """px_ice_near_icicle: 32x96 master image."""
    img = Image.new("RGBA", (32, 96), (255, 255, 255, 255))
    frame = Image.new("RGBA", (32, 96), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    cone = [(2, 0), (30, 0), (24, 40), (19, 70), (16, 92), (13, 70), (8, 40)]
    draw.polygon(cone, fill=(70, 150, 220), outline=(30, 80, 140))

    shadow_side = [(2, 0), (16, 0), (14, 40), (16, 92), (13, 70), (8, 40)]
    draw.polygon(shadow_side, fill=(45, 110, 180))

    highlight_side = [(16, 0), (30, 0), (24, 40), (19, 70), (16, 92), (14, 40)]
    draw.polygon(highlight_side, fill=(150, 220, 255))

    draw.line([(18, 2), (22, 38), (17, 72), (16, 90)], fill=(245, 255, 255), width=2)

    for y_pos in [15, 32, 50, 68]:
        draw.line([(6, y_pos), (26, y_pos+4)], fill=(200, 240, 255), width=1)

    draw.ellipse([14, 90, 18, 95], fill=(230, 250, 255))

    bg_frame = Image.new("RGBA", (32, 96), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_ice_near_icicle.png"))
    print("Created raw master: px_ice_near_icicle.png")


def create_geode_master():
    """px_cav_near_crystal_geode: 48x48 master image."""
    img = Image.new("RGBA", (48, 48), (255, 255, 255, 255))
    frame = Image.new("RGBA", (48, 48), (255, 255, 255, 0))
    draw = ImageDraw.Draw(frame)

    draw.ellipse([4, 4, 44, 44], fill=(65, 55, 75), outline=(30, 24, 38))
    draw.ellipse([10, 10, 38, 38], fill=(25, 15, 40), outline=(50, 38, 65))

    crystals = [
        ([(14, 24), (20, 20), (22, 24), (16, 26)], (190, 60, 240), (100, 20, 140)),
        ([(24, 14), (28, 20), (24, 22), (20, 18)], (80, 220, 255), (20, 110, 160)),
        ([(28, 24), (34, 22), (32, 28), (26, 28)], (220, 90, 250), (120, 30, 150)),
        ([(20, 28), (26, 34), (20, 34), (18, 30)], (80, 220, 255), (20, 110, 160)),
        ([(16, 18), (20, 14), (22, 18), (18, 20)], (160, 50, 210), (80, 15, 110)),
    ]
    for pts, fill, out in crystals:
        draw.polygon(pts, fill=fill, outline=out)
        draw.point(pts[1], fill=(255, 255, 255))

    draw.ellipse([20, 20, 28, 28], fill=(180, 240, 255))
    draw.ellipse([22, 22, 26, 26], fill=(255, 255, 255))

    bg_frame = Image.new("RGBA", (48, 48), (255, 255, 255, 255))
    bg_frame.paste(frame, (0, 0), frame)
    img.paste(bg_frame, (0, 0))

    img.save(os.path.join(RAW_DIR, "px_cav_near_crystal_geode.png"))
    print("Created raw master: px_cav_near_crystal_geode.png")


def create_lantern_master():
    """px_mist_near_lantern: 32x48 cell, 4 frames -> 128x48 master image."""
    img = Image.new("RGBA", (128, 48), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 48), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        draw.line([(16, 0), (16, 8)], fill=(60, 65, 70), width=2)
        draw.ellipse([13, 6, 19, 12], fill=None, outline=(80, 85, 90), width=2)

        draw.polygon([(8, 14), (24, 14), (28, 18), (4, 18)], fill=(50, 52, 58), outline=(25, 26, 30))
        draw.polygon([(4, 38), (28, 38), (24, 44), (8, 44)], fill=(50, 52, 58), outline=(25, 26, 30))
        draw.rectangle([5, 18, 8, 38], fill=(65, 68, 75), outline=(25, 26, 30))
        draw.rectangle([24, 18, 27, 38], fill=(65, 68, 75), outline=(25, 26, 30))
        draw.line([(16, 18), (16, 38)], fill=(65, 68, 75), width=1)

        draw.rectangle([8, 18, 24, 38], fill=(20, 35, 45))

        orb_y = [28, 26, 27, 29][f]
        orb_r = [5, 6, 7, 5][f]

        draw.ellipse([16-orb_r-3, orb_y-orb_r-3, 16+orb_r+3, orb_y+orb_r+3], fill=(30, 160, 180))
        draw.ellipse([16-orb_r, orb_y-orb_r, 16+orb_r, orb_y+orb_r], fill=(80, 230, 240))
        draw.ellipse([14, orb_y-2, 18, orb_y+2], fill=(230, 255, 255))
        draw.polygon([(16, orb_y+orb_r), (13, orb_y+orb_r+5), (16, orb_y+orb_r+3)], fill=(50, 200, 220))

        bg_frame = Image.new("RGBA", (32, 48), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "px_mist_near_lantern.png"))
    print("Created raw master: px_mist_near_lantern.png")


# -------------------------------------------------------------
# 2. PROCESS BACKGROUNDS & PACK INTO ATLAS_LEVEL_PROPS
# -------------------------------------------------------------

def process_and_pack_atlas():
    asset_defs = [
        # (key_base, filename, cell_w, cell_h, frame_count)
        ("px_gold_near_candelabra", "px_gold_near_candelabra.png", 32, 96, 3),
        ("px_gold_near_pile", "px_gold_near_pile.png", 96, 64, 1),
        ("px_gold_near_chest_stack", "px_gold_near_chest_stack.png", 96, 80, 1),
        ("px_dun_near_torch", "px_dun_near_torch.png", 32, 64, 4),
        ("px_dun_near_banner", "px_dun_near_banner.png", 48, 96, 1),
        ("px_dun_near_grate", "px_dun_near_grate.png", 64, 64, 1),
        ("px_ice_near_icicle", "px_ice_near_icicle.png", 32, 96, 1),
        ("px_cav_near_crystal_geode", "px_cav_near_crystal_geode.png", 48, 48, 1),
        ("px_mist_near_lantern", "px_mist_near_lantern.png", 32, 48, 4)
    ]

    processed_sprites = {}

    for key_base, filename, cell_w, cell_h, frame_count in asset_defs:
        filepath = os.path.join(RAW_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Error: {filepath} not found!")
            continue

        raw_img = Image.open(filepath)
        
        for f in range(frame_count):
            crop_box = (f * cell_w, 0, (f + 1) * cell_w, cell_h)
            frame_crop = raw_img.crop(crop_box)
            
            # Remove background chroma (solid white -> transparent RGBA)
            rgba_frame = remove_background_chroma(frame_crop, bg_color=(255, 255, 255), tolerance=20)
            
            if frame_count > 1:
                frame_id = f"{key_base}_{f}"
                processed_sprites[frame_id] = rgba_frame
                if f == 0:
                    processed_sprites[key_base] = rgba_frame
            else:
                processed_sprites[key_base] = rgba_frame

    # Power-of-two 512x512 canvas for atlas_level_props
    atlas_w, atlas_h = 512, 512
    atlas_img = Image.new("RGBA", (atlas_w, atlas_h), (0, 0, 0, 0))
    frames_json = {}

    # Packing layout coordinates:
    # Row 1 (y=0, h=96):
    # px_gold_near_candelabra_0 (32x96 at 0,0)
    # px_gold_near_candelabra_1 (32x96 at 32,0)
    # px_gold_near_candelabra_2 (32x96 at 64,0)
    # px_gold_near_candelabra   (32x96 at 96,0)
    # px_ice_near_icicle        (32x96 at 128,0)
    # px_dun_near_banner        (48x96 at 160,0)
    # px_gold_near_chest_stack  (96x80 at 208,0)
    # px_gold_near_pile         (96x64 at 304,0)
    # px_dun_near_grate         (64x64 at 400,0)
    # px_cav_near_crystal_geode (48x48 at 464,0)
    #
    # Row 2 (y=96, h=64):
    # px_dun_near_torch_0       (32x64 at 0,96)
    # px_dun_near_torch_1       (32x64 at 32,96)
    # px_dun_near_torch_2       (32x64 at 64,96)
    # px_dun_near_torch_3       (32x64 at 96,96)
    # px_dun_near_torch         (32x64 at 128,96)
    # px_mist_near_lantern_0    (32x48 at 160,96)
    # px_mist_near_lantern_1    (32x48 at 192,96)
    # px_mist_near_lantern_2    (32x48 at 224,96)
    # px_mist_near_lantern_3    (32x48 at 256,96)
    # px_mist_near_lantern      (32x48 at 288,96)

    layout_map = {
        "px_gold_near_candelabra_0": (0, 0, 32, 96),
        "px_gold_near_candelabra_1": (32, 0, 32, 96),
        "px_gold_near_candelabra_2": (64, 0, 32, 96),
        "px_gold_near_candelabra":   (96, 0, 32, 96),
        "px_ice_near_icicle":        (128, 0, 32, 96),
        "px_dun_near_banner":        (160, 0, 48, 96),
        "px_gold_near_chest_stack":  (208, 0, 96, 80),
        "px_gold_near_pile":         (304, 0, 96, 64),
        "px_dun_near_grate":         (400, 0, 64, 64),
        "px_cav_near_crystal_geode": (464, 0, 48, 48),

        "px_dun_near_torch_0":       (0, 96, 32, 64),
        "px_dun_near_torch_1":       (32, 96, 32, 64),
        "px_dun_near_torch_2":       (64, 96, 32, 64),
        "px_dun_near_torch_3":       (96, 96, 32, 64),
        "px_dun_near_torch":         (128, 96, 32, 64),
        "px_mist_near_lantern_0":    (160, 96, 32, 48),
        "px_mist_near_lantern_1":    (192, 96, 32, 48),
        "px_mist_near_lantern_2":    (224, 96, 32, 48),
        "px_mist_near_lantern_3":    (256, 96, 32, 48),
        "px_mist_near_lantern":      (288, 96, 32, 48),
    }

    for frame_id, (x, y, w, h) in layout_map.items():
        if frame_id not in processed_sprites:
            print(f"Warning: {frame_id} missing from processed sprites!")
            continue
        sprite = processed_sprites[frame_id]
        if sprite.size != (w, h):
            sprite = sprite.resize((w, h), Image.Resampling.LANCZOS)

        atlas_img.paste(sprite, (x, y), sprite)

        frames_json[frame_id] = {
            "frame": {"x": x, "y": y, "w": w, "h": h},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": w, "h": h},
            "sourceSize": {"w": w, "h": h},
            "pivot": {"x": 0.5, "y": 0.5}
        }

    atlas_data = {
        "frames": frames_json,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_level_props.webp",
            "format": "RGBA8888",
            "size": {"w": atlas_w, "h": atlas_h},
            "scale": "1"
        }
    }

    webp_path = os.path.join(PUBLIC_DIR, "atlas_level_props.webp")
    png_path = os.path.join(PUBLIC_DIR, "atlas_level_props.png")
    json_path = os.path.join(PUBLIC_DIR, "atlas_level_props.json")

    atlas_img.save(webp_path, "WEBP", quality=90)
    atlas_img.save(png_path, "PNG")
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"\nSuccessfully generated atlas_level_props:")
    print(f" WebP: {webp_path}")
    print(f" JSON: {json_path}")


# -------------------------------------------------------------
# 3. UPDATE MANIFEST.JSON
# -------------------------------------------------------------

def update_manifest():
    if not os.path.exists(MANIFEST_PATH):
        print(f"Manifest path {MANIFEST_PATH} not found!")
        return

    with open(MANIFEST_PATH, "r") as f:
        manifest_data = json.load(f)

    atlases = manifest_data.get("atlases", [])
    exists = any(a.get("key") == "atlas_level_props" for a in atlases)

    if not exists:
        atlases.append({
            "key": "atlas_level_props",
            "texture": "assets/atlases/atlas_level_props.webp",
            "atlas": "assets/atlases/atlas_level_props.json"
        })
        manifest_data["atlases"] = atlases
        
        with open(MANIFEST_PATH, "w") as f:
            json.dump(manifest_data, f, indent=2)
        print("Updated manifest.json with atlas_level_props!")
    else:
        print("atlas_level_props already in manifest.json.")


if __name__ == "__main__":
    print("Generating raw master images in art_raw/level_props/...")
    create_candelabra_master()
    create_gold_pile_master()
    create_chest_stack_master()
    create_torch_master()
    create_banner_master()
    create_grate_master()
    create_icicle_master()
    create_geode_master()
    create_lantern_master()

    print("\nProcessing backgrounds and packing into atlas_level_props...")
    process_and_pack_atlas()

    print("\nUpdating manifest.json...")
    update_manifest()

    print("\nLevel Decor & Props processing complete!")
