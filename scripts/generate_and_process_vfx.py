import os
import json
import math
from PIL import Image, ImageDraw
from asset_processor import remove_background_chroma, create_phaser_atlas

RAW_DIR = "art_raw/vfx"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# -------------------------------------------------------------
# 1. GENERATE RAW MASTER IMAGES
# -------------------------------------------------------------

def create_stun_stars_master():
    # 4 frames, 32x32 each -> 128x32 image
    img = Image.new("RGBA", (128, 32), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        angle_base = f * (math.pi / 2) # 90 deg rotation per frame
        cx, cy = 16, 16
        rx, ry = 10, 5 # Elliptical orbit overhead
        
        # 3 orbiting stars spaced around ellipse
        for i in range(3):
            ang = angle_base + i * (2 * math.pi / 3)
            sx = int(cx + rx * math.cos(ang))
            sy = int(cy + ry * math.sin(ang))
            
            # Star size & brightness based on depth (sin(ang))
            depth = math.sin(ang)
            star_r = 3 if depth > 0 else 2
            color = (255, 235, 60) if depth > 0 else (230, 180, 40)
            core_color = (255, 255, 220)
            
            # Draw 4-point star shape
            draw.polygon([(sx, sy - star_r - 1), (sx + 1, sy), (sx, sy + star_r + 1), (sx - 1, sy)], fill=color)
            draw.polygon([(sx - star_r - 1, sy), (sx, sy + 1), (sx + star_r + 1, sy), (sx, sy - 1)], fill=color)
            draw.rectangle([sx - 1, sy - 1, sx + 1, sy + 1], fill=core_color)
            
            # Motion trail dot behind star
            tx = int(cx + rx * math.cos(ang - 0.4))
            ty = int(cy + ry * math.sin(ang - 0.4))
            draw.point((tx, ty), fill=(255, 200, 50))

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_stun_stars.png"))
    print("Created raw master: vfx_stun_stars.png")

def create_spill_master():
    # 5 frames, 64x64 each -> 320x64 image
    img = Image.new("RGBA", (320, 64), (255, 255, 255, 255))
    
    for f in range(5):
        offset_x = f * 64
        frame = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        cx, cy = 32, 32
        
        if f == 0:
            # Impact flash at center
            draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=(255, 240, 120))
            draw.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(255, 255, 255))
            for dx, dy in [(-12, 0), (12, 0), (0, -12), (0, 12), (-8, -8), (8, 8), (-8, 8), (8, -8)]:
                draw.line([(cx, cy), (cx + dx, cy + dy)], fill=(255, 215, 0), width=2)
        else:
            # Bursting coins and gems outward
            t = f / 4.0 # 0.25, 0.5, 0.75, 1.0
            dist = int(t * 26)
            drop_y = int(t * t * 10) # gravity arc
            
            particles = [
                # (angle_deg, type, color, size)
                (0, "coin", (255, 215, 0), 4),
                (45, "ruby", (240, 50, 60), 3),
                (90, "coin", (255, 220, 50), 5),
                (135, "sapphire", (40, 160, 240), 3),
                (180, "coin", (255, 215, 0), 4),
                (225, "emerald", (50, 220, 100), 3),
                (270, "coin", (255, 200, 30), 4),
                (315, "sparkle", (255, 255, 255), 2),
            ]
            
            for ang_deg, ptype, color, psize in particles:
                rad = math.radians(ang_deg)
                px = int(cx + dist * math.cos(rad))
                py = int(cy + dist * math.sin(rad) + drop_y)
                
                if ptype == "coin":
                    draw.ellipse([px - psize, py - psize, px + psize, py + psize], fill=color, outline=(180, 140, 0))
                    draw.point((px - 1, py - 1), fill=(255, 255, 220))
                elif ptype in ("ruby", "sapphire", "emerald"):
                    draw.polygon([(px, py - psize), (px + psize, py), (px, py + psize), (px - psize, py)], fill=color, outline=(20, 20, 20))
                else: # sparkle
                    draw.rectangle([px - psize, py - psize, px + psize, py + psize], fill=color)
                
                # Trailing glint
                tx = int(cx + (dist * 0.6) * math.cos(rad))
                ty = int(cy + (dist * 0.6) * math.sin(rad) + drop_y * 0.6)
                draw.point((tx, ty), fill=(255, 240, 150))

        bg_frame = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_spill.png"))
    print("Created raw master: vfx_spill.png")

def create_pickup_flash_master():
    # 3 frames, 32x32 each -> 96x32 image
    img = Image.new("RGBA", (96, 32), (255, 255, 255, 255))
    
    for f in range(3):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        cx, cy = 16, 16
        
        if f == 0:
            # Small intense flash point
            draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 255, 220))
            draw.rectangle([cx - 1, cy - 1, cx + 1, cy + 1], fill=(255, 255, 255))
        elif f == 1:
            # Large 4-point yellow/white starburst
            draw.polygon([(cx, cy - 12), (cx + 3, cy - 3), (cx + 12, cy), (cx + 3, cy + 3), (cx, cy + 12), (cx - 3, cy + 3), (cx - 12, cy), (cx - 3, cy - 3)], fill=(255, 230, 60))
            draw.polygon([(cx, cy - 7), (cx + 2, cy - 2), (cx + 7, cy), (cx + 2, cy + 2), (cx, cy + 7), (cx - 2, cy + 2), (cx - 7, cy), (cx - 2, cy - 2)], fill=(255, 255, 240))
            # Corner pips
            draw.point((cx - 6, cy - 6), fill=(255, 200, 50))
            draw.point((cx + 6, cy - 6), fill=(255, 200, 50))
            draw.point((cx - 6, cy + 6), fill=(255, 200, 50))
            draw.point((cx + 6, cy + 6), fill=(255, 200, 50))
        else:
            # Fading spark dots
            for dx, dy in [(-8, -8), (8, -8), (-8, 8), (8, 8), (0, -10), (0, 10), (-10, 0), (10, 0)]:
                draw.rectangle([cx + dx - 1, cy + dy - 1, cx + dx + 1, cy + dy + 1], fill=(255, 220, 100))

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_pickup_flash.png"))
    print("Created raw master: vfx_pickup_flash.png")

def create_pickup_unique_master():
    # 4 frames, 48x48 each -> 192x48 image
    img = Image.new("RGBA", (192, 48), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 48), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        cx, cy = 24, 24
        
        if f == 0:
            # Concentrated magenta/gold magic orb
            draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(220, 80, 255))
            draw.ellipse([cx - 3, cy - 3, cx + 3, cy + 3], fill=(255, 240, 180))
        elif f == 1:
            # Radiant multi-point starburst with magenta/cyan rays
            draw.polygon([(cx, cy - 20), (cx + 4, cy - 4), (cx + 20, cy), (cx + 4, cy + 4), (cx, cy + 20), (cx - 4, cy + 4), (cx - 20, cy), (cx - 4, cy - 4)], fill=(255, 215, 0))
            draw.polygon([(cx - 14, cy - 14), (cx + 2, cy - 4), (cx + 14, cy - 14), (cx + 4, cy + 2), (cx + 14, cy + 14), (cx - 2, cy + 4), (cx - 14, cy + 14), (cx - 4, cy - 2)], fill=(230, 90, 255))
            draw.ellipse([cx - 8, cy - 8, cx + 8, cy + 8], fill=(255, 255, 255))
        elif f == 2:
            # Expanding ring of magical beads
            for i in range(12):
                ang = i * (math.pi / 6)
                rx = int(cx + 16 * math.cos(ang))
                ry = int(cy + 16 * math.sin(ang))
                col = (255, 215, 0) if i % 2 == 0 else (100, 240, 255)
                draw.ellipse([rx - 2, ry - 2, rx + 2, ry + 2], fill=col)
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 255, 255))
        else:
            # Dispersing glitter specks
            for i in range(16):
                ang = i * (math.pi / 8)
                rx = int(cx + 21 * math.cos(ang))
                ry = int(cy + 21 * math.sin(ang))
                draw.rectangle([rx - 1, ry - 1, rx + 1, ry + 1], fill=(255, 200, 255))

        bg_frame = Image.new("RGBA", (48, 48), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_pickup_unique.png"))
    print("Created raw master: vfx_pickup_unique.png")

def create_land_dust_master():
    # 3 frames, 32x32 each -> 96x32 image
    img = Image.new("RGBA", (96, 32), (255, 255, 255, 255))
    
    for f in range(3):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        dust_col = (210, 195, 175)
        outline_col = (130, 115, 95)
        
        if f == 0:
            # Ground impact squish puffs (center bottom)
            draw.ellipse([10, 24, 18, 30], fill=dust_col, outline=outline_col)
            draw.ellipse([14, 24, 22, 30], fill=dust_col, outline=outline_col)
        elif f == 1:
            # Puffs expanding left and right
            draw.ellipse([4, 20, 14, 29], fill=dust_col, outline=outline_col)
            draw.ellipse([8, 22, 16, 28], fill=dust_col, outline=outline_col)
            draw.ellipse([16, 22, 24, 28], fill=dust_col, outline=outline_col)
            draw.ellipse([18, 20, 28, 29], fill=dust_col, outline=outline_col)
        else:
            # Dissolving thinned dust
            draw.ellipse([2, 18, 11, 26], fill=(225, 215, 200), outline=(170, 155, 135))
            draw.ellipse([21, 18, 30, 26], fill=(225, 215, 200), outline=(170, 155, 135))
            draw.point((6, 16), fill=dust_col)
            draw.point((25, 16), fill=dust_col)

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_land_dust.png"))
    print("Created raw master: vfx_land_dust.png")

def create_switch_click_master():
    # 3 frames, 32x32 each -> 96x32 image
    img = Image.new("RGBA", (96, 32), (255, 255, 255, 255))
    
    for f in range(3):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        cx, cy = 16, 16
        
        if f == 0:
            # Click spark dot
            draw.ellipse([cx - 4, cy - 4, cx + 4, cy + 4], fill=(255, 170, 40))
            draw.rectangle([cx - 2, cy - 2, cx + 2, cy + 2], fill=(255, 255, 220))
        elif f == 1:
            # Expanding shock ring
            draw.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], outline=(180, 220, 240), width=2)
            for dx, dy in [(-11, 0), (11, 0), (0, -11), (0, 11)]:
                draw.line([(cx + dx // 2, cy + dy // 2), (cx + dx, cy + dy)], fill=(255, 190, 50), width=2)
        else:
            # Fading ring & pips
            draw.ellipse([cx - 13, cy - 13, cx + 13, cy + 13], outline=(200, 235, 250), width=1)
            draw.point((cx - 14, cy), fill=(255, 220, 100))
            draw.point((cx + 14, cy), fill=(255, 220, 100))
            draw.point((cx, cy - 14), fill=(255, 220, 100))
            draw.point((cx, cy + 14), fill=(255, 220, 100))

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_switch_click.png"))
    print("Created raw master: vfx_switch_click.png")

def create_spawn_poof_master():
    # 4 frames, 48x48 each -> 192x48 image
    img = Image.new("RGBA", (192, 48), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 48), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        cx, cy = 24, 24
        
        smoke_col = (235, 245, 255)
        outline_col = (140, 165, 190)
        
        if f == 0:
            # Compact cloud core
            draw.ellipse([cx - 10, cy - 10, cx + 10, cy + 10], fill=smoke_col, outline=outline_col)
            draw.ellipse([cx - 6, cy - 6, cx + 6, cy + 6], fill=(255, 255, 255))
        elif f == 1:
            # Expanding 5 lobes cloud + star sparkles
            lobes = [(cx, cy - 10), (cx + 10, cy - 4), (cx + 8, cy + 8), (cx - 8, cy + 8), (cx - 10, cy - 4)]
            for lx, ly in lobes:
                draw.ellipse([lx - 8, ly - 8, lx + 8, ly + 8], fill=smoke_col, outline=outline_col)
            # Sparkles
            draw.polygon([(cx, cy - 18), (cx + 2, cy - 14), (cx + 6, cy - 14), (cx + 3, cy - 11), (cx + 4, cy - 7), (cx, cy - 9), (cx - 4, cy - 7), (cx - 3, cy - 11), (cx - 6, cy - 14), (cx - 2, cy - 14)], fill=(255, 230, 100))
        elif f == 2:
            # Large billowy cloud opening center
            lobes = [(cx, cy - 14), (cx + 14, cy - 6), (cx + 12, cy + 10), (cx - 12, cy + 10), (cx - 14, cy - 6)]
            for lx, ly in lobes:
                draw.ellipse([lx - 9, ly - 9, lx + 9, ly + 9], fill=smoke_col, outline=outline_col)
        else:
            # Dissipating wisps
            wisps = [(cx - 16, cy - 12), (cx + 16, cy - 10), (cx + 14, cy + 14), (cx - 14, cy + 12)]
            for wx, wy in wisps:
                draw.ellipse([wx - 5, wy - 5, wx + 5, wy + 5], fill=(240, 248, 255), outline=(180, 200, 220))
            draw.point((cx - 8, cy - 16), fill=(255, 220, 80))
            draw.point((cx + 10, cy - 14), fill=(255, 220, 80))

        bg_frame = Image.new("RGBA", (48, 48), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_spawn_poof.png"))
    print("Created raw master: vfx_spawn_poof.png")

def create_exit_speedlines_master():
    # 4 frames, 64x32 each -> 256x32 image
    img = Image.new("RGBA", (256, 32), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 64
        frame = Image.new("RGBA", (64, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        white = (255, 255, 255)
        cyan = (160, 230, 255)
        
        if f == 0:
            # Speedlines forming
            draw.line([(10, 8), (40, 8)], fill=white, width=2)
            draw.line([(4, 16), (48, 16)], fill=cyan, width=2)
            draw.line([(16, 24), (36, 24)], fill=white, width=2)
        elif f == 1:
            # Full speed streaks
            draw.line([(2, 6), (58, 6)], fill=white, width=2)
            draw.line([(12, 12), (62, 12)], fill=cyan, width=3)
            draw.line([(6, 18), (56, 18)], fill=white, width=2)
            draw.line([(18, 24), (60, 24)], fill=cyan, width=2)
            # Arrow/dash tip glints
            draw.polygon([(58, 6), (62, 6), (58, 8)], fill=white)
            draw.polygon([(62, 12), (64, 12), (62, 14)], fill=white)
        elif f == 2:
            # Shifted wind streaks & dash dust
            draw.line([(14, 6), (60, 6)], fill=cyan, width=2)
            draw.line([(20, 14), (64, 14)], fill=white, width=2)
            draw.line([(10, 22), (54, 22)], fill=cyan, width=2)
            # Dust pips at left trailing end
            draw.ellipse([4, 14, 8, 18], fill=(210, 235, 255))
            draw.ellipse([8, 20, 12, 24], fill=(210, 235, 255))
        else:
            # Thinning dissipating speedlines
            draw.line([(28, 8), (62, 8)], fill=cyan, width=1)
            draw.line([(36, 16), (64, 16)], fill=white, width=1)
            draw.line([(24, 24), (58, 24)], fill=cyan, width=1)

        bg_frame = Image.new("RGBA", (64, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_exit_speedlines.png"))
    print("Created raw master: vfx_exit_speedlines.png")

def create_ice_slide_master():
    # 3 frames, 32x32 each -> 96x32 image
    img = Image.new("RGBA", (96, 32), (255, 255, 255, 255))
    
    for f in range(3):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        ice_cyan = (160, 235, 255)
        dark_blue = (30, 70, 110)
        white = (255, 255, 255)
        
        if f == 0:
            # Sharp angled ice shards along ground (y=20..30)
            shards = [
                [(14, 28), (18, 20), (22, 28)],
                [(8, 28), (11, 23), (14, 28)],
                [(20, 28), (25, 22), (28, 28)],
            ]
            for s in shards:
                draw.polygon(s, fill=ice_cyan, outline=dark_blue)
                draw.line([s[0], s[1]], fill=white, width=1)
        elif f == 1:
            # Fan of ice shards & frost spray backward
            shards = [
                [(10, 28), (14, 16), (18, 28)],
                [(4, 28), (7, 20), (10, 28)],
                [(16, 28), (22, 14), (25, 28)],
                [(22, 28), (27, 18), (30, 28)],
            ]
            for s in shards:
                draw.polygon(s, fill=ice_cyan, outline=dark_blue)
                draw.line([s[0], s[1]], fill=white, width=1)
            # Frost mist
            draw.ellipse([6, 22, 14, 28], fill=(210, 245, 255))
            draw.ellipse([14, 20, 22, 27], fill=(210, 245, 255))
        else:
            # Floating frost specks & dispersing mist
            draw.ellipse([2, 20, 9, 26], fill=(225, 248, 255))
            draw.ellipse([10, 18, 17, 24], fill=(225, 248, 255))
            draw.ellipse([18, 19, 26, 26], fill=(225, 248, 255))
            # Sparkle pips
            draw.point((6, 16), fill=white)
            draw.point((14, 14), fill=white)
            draw.point((22, 15), fill=white)

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "vfx_ice_slide.png"))
    print("Created raw master: vfx_ice_slide.png")

# -------------------------------------------------------------
# 2. PROCESS & PACK INTO ATLAS_VFX
# -------------------------------------------------------------

def process_and_pack_atlas():
    asset_defs = [
        # (key_base, raw_image_filename, cell_w, cell_h, frame_count)
        ("vfx_stun_stars", "vfx_stun_stars.png", 32, 32, 4),
        ("vfx_spill", "vfx_spill.png", 64, 64, 5),
        ("vfx_pickup_flash", "vfx_pickup_flash.png", 32, 32, 3),
        ("vfx_pickup_unique", "vfx_pickup_unique.png", 48, 48, 4),
        ("vfx_land_dust", "vfx_land_dust.png", 32, 32, 3),
        ("vfx_switch_click", "vfx_switch_click.png", 32, 32, 3),
        ("vfx_spawn_poof", "vfx_spawn_poof.png", 48, 48, 4),
        ("vfx_exit_speedlines", "vfx_exit_speedlines.png", 64, 32, 4),
        ("vfx_ice_slide", "vfx_ice_slide.png", 32, 32, 3)
    ]

    all_sprites = []

    for key_base, filename, cell_w, cell_h, frame_count in asset_defs:
        filepath = os.path.join(RAW_DIR, filename)
        if not os.path.exists(filepath):
            print(f"Error: {filepath} not found!")
            continue

        raw_img = Image.open(filepath)
        
        for f in range(frame_count):
            crop_box = (f * cell_w, 0, (f + 1) * cell_w, cell_h)
            frame_crop = raw_img.crop(crop_box)
            
            # Background removal using chroma key (solid white)
            rgba_frame = remove_background_chroma(frame_crop, bg_color=(255, 255, 255), tolerance=20)
            
            frame_id = f"{key_base}_{f}"
            all_sprites.append((frame_id, rgba_frame))
            
            # Also add un-indexed key for frame 0 if single frame lookup is used
            if f == 0:
                all_sprites.append((key_base, rgba_frame))

    # Pack into atlas_vfx (Phaser 3 JSON Hash + WebP)
    create_phaser_atlas(
        sprite_list=all_sprites,
        output_name="atlas_vfx",
        output_dir=PUBLIC_DIR,
        max_cols=8,
        cell_size=(64, 64)
    )

# -------------------------------------------------------------
# 3. UPDATE MANIFEST.JSON
# -------------------------------------------------------------

def update_manifest():
    if not os.path.exists(MANIFEST_PATH):
        print(f"Manifest path {MANIFEST_PATH} not found!")
        return

    with open(MANIFEST_PATH, "r") as f:
        manifest_data = json.load(f)

    # Check if atlas_vfx is already in manifest
    atlases = manifest_data.get("atlases", [])
    exists = any(a.get("key") == "atlas_vfx" for a in atlases)

    if not exists:
        atlases.append({
            "key": "atlas_vfx",
            "texture": "assets/atlases/atlas_vfx.webp",
            "atlas": "assets/atlases/atlas_vfx.json"
        })
        manifest_data["atlases"] = atlases
        
        with open(MANIFEST_PATH, "w") as f:
            json.dump(manifest_data, f, indent=2)
        print("Updated manifest.json with atlas_vfx!")
    else:
        print("atlas_vfx already in manifest.json.")

if __name__ == "__main__":
    print("Generating raw master images in art_raw/vfx/...")
    create_stun_stars_master()
    create_spill_master()
    create_pickup_flash_master()
    create_pickup_unique_master()
    create_land_dust_master()
    create_switch_click_master()
    create_spawn_poof_master()
    create_exit_speedlines_master()
    create_ice_slide_master()

    print("\nProcessing backgrounds and packing into atlas_vfx...")
    process_and_pack_atlas()

    print("\nUpdating manifest.json...")
    update_manifest()

    print("\nCore Particle VFX asset pack generation and processing complete!")
