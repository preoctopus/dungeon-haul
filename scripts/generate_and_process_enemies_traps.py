import os
import json
import math
from PIL import Image, ImageDraw, ImageFilter
from asset_processor import remove_background_chroma, create_phaser_atlas

RAW_DIR = "art_raw/enemies_traps"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

# Helper for drawing pixel art outlines and shaded shapes
def draw_pixel_circle(draw, cx, cy, r, fill, outline=None):
    for y in range(cy - r, cy + r + 1):
        for x in range(cx - r, cx + r + 1):
            if (x - cx)**2 + (y - cy)**2 <= r**2:
                draw.point((x, y), fill=fill)
    if outline:
        for y in range(cy - r - 1, cy + r + 2):
            for x in range(cx - r - 1, cx + r + 2):
                dist_sq = (x - cx)**2 + (y - cy)**2
                if r**2 < dist_sq <= (r + 1.5)**2:
                    draw.point((x, y), fill=outline)

# -------------------------------------------------------------
# 1. GENERATE RAW MASTER IMAGES
# -------------------------------------------------------------

def create_golem_idle_master():
    # 4 frames, 64x64 each -> 256x64 image
    img = Image.new("RGBA", (256, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 64
        frame = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        bob_y = [0, -1, -2, -1][f]
        eye_brightness = [200, 230, 255, 230][f]
        
        # Shadows & legs
        # Left Foot
        draw.rectangle([14, 48, 26, 58], fill=(45, 40, 38), outline=(20, 18, 16))
        draw.rectangle([16, 46, 24, 52], fill=(75, 68, 64), outline=(20, 18, 16))
        # Right Foot
        draw.rectangle([38, 48, 50, 58], fill=(45, 40, 38), outline=(20, 18, 16))
        draw.rectangle([40, 46, 48, 52], fill=(75, 68, 64), outline=(20, 18, 16))
        
        # Torso / Chest
        cy = 32 + bob_y
        draw.ellipse([18, cy - 12, 46, cy + 14], fill=(90, 82, 76), outline=(20, 18, 16))
        # Chest plates (rock texture)
        draw.polygon([(22, cy - 8), (32, cy - 10), (32, cy + 2), (20, cy + 4)], fill=(120, 110, 102), outline=(25, 22, 20))
        draw.polygon([(32, cy - 10), (42, cy - 8), (44, cy + 4), (32, cy + 2)], fill=(105, 96, 88), outline=(25, 22, 20))
        # Moss details
        draw.rectangle([24, cy - 2, 29, cy + 4], fill=(70, 110, 50))
        draw.rectangle([36, cy + 1, 41, cy + 6], fill=(70, 110, 50))

        # Shoulders & Arms
        # Left Arm
        draw.ellipse([8, cy - 8, 20, cy + 10], fill=(75, 68, 64), outline=(20, 18, 16))
        draw.rectangle([6, cy + 4, 16, cy + 18], fill=(60, 54, 50), outline=(20, 18, 16))
        # Right Arm
        draw.ellipse([44, cy - 8, 56, cy + 10], fill=(75, 68, 64), outline=(20, 18, 16))
        draw.rectangle([48, cy + 4, 58, cy + 18], fill=(60, 54, 50), outline=(20, 18, 16))

        # Head
        hy = cy - 16
        draw.rectangle([24, hy - 8, 40, hy + 6], fill=(110, 100, 92), outline=(20, 18, 16))
        draw.rectangle([22, hy - 10, 42, hy - 4], fill=(130, 120, 110), outline=(20, 18, 16))
        # Glowing Eyes
        draw.rectangle([27, hy - 3, 31, hy + 1], fill=(255, eye_brightness // 2, 0))
        draw.rectangle([33, hy - 3, 37, hy + 1], fill=(255, eye_brightness // 2, 0))
        
        # Paste frame onto master sheet (solid white background)
        bg_frame = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_golem_idle.png"))
    print("Created raw master: enemy_golem_idle.png")

def create_golem_walk_master():
    # 6 frames, 64x64 each -> 384x64 image
    img = Image.new("RGBA", (384, 64), (255, 255, 255, 255))
    
    for f in range(6):
        offset_x = f * 64
        frame = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)
        
        # Stomp walk cycle offsets
        leg_l_off = [0, 4, 8, 4, -2, -4][f]
        leg_r_off = [0, -4, -2, 4, 8, 4][f]
        arm_l_off = [0, -4, -6, 0, 4, 6][f]
        arm_r_off = [0, 4, 6, 0, -4, -6][f]
        body_y = [0, -1, 1, 0, -1, 1][f]

        # Legs
        draw.rectangle([14 + leg_l_off, 44, 26 + leg_l_off, 58], fill=(45, 40, 38), outline=(20, 18, 16))
        draw.rectangle([38 + leg_r_off, 44, 50 + leg_r_off, 58], fill=(45, 40, 38), outline=(20, 18, 16))

        # Body
        cy = 32 + body_y
        draw.ellipse([18, cy - 12, 46, cy + 14], fill=(90, 82, 76), outline=(20, 18, 16))
        draw.polygon([(22, cy - 8), (32, cy - 10), (32, cy + 2), (20, cy + 4)], fill=(120, 110, 102), outline=(25, 22, 20))
        draw.polygon([(32, cy - 10), (42, cy - 8), (44, cy + 4), (32, cy + 2)], fill=(105, 96, 88), outline=(25, 22, 20))

        # Arms swinging
        draw.ellipse([8 + arm_l_off, cy - 8, 20 + arm_l_off, cy + 10], fill=(75, 68, 64), outline=(20, 18, 16))
        draw.rectangle([6 + arm_l_off, cy + 4, 16 + arm_l_off, cy + 18], fill=(60, 54, 50), outline=(20, 18, 16))

        draw.ellipse([44 + arm_r_off, cy - 8, 56 + arm_r_off, cy + 10], fill=(75, 68, 64), outline=(20, 18, 16))
        draw.rectangle([48 + arm_r_off, cy + 4, 58 + arm_r_off, cy + 18], fill=(60, 54, 50), outline=(20, 18, 16))

        # Head
        hy = cy - 16
        draw.rectangle([24, hy - 8, 40, hy + 6], fill=(110, 100, 92), outline=(20, 18, 16))
        draw.rectangle([27, hy - 3, 31, hy + 1], fill=(255, 120, 0))
        draw.rectangle([33, hy - 3, 37, hy + 1], fill=(255, 120, 0))

        bg_frame = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_golem_walk.png"))
    print("Created raw master: enemy_golem_walk.png")

def create_golem_attack_master():
    # 4 frames, 64x64 each -> 256x64 image
    img = Image.new("RGBA", (256, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 64
        frame = Image.new("RGBA", (64, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Attack phases: 0: Windup raise right arm, 1: Slamming down, 2: Impact ground shock, 3: Recover
        body_tilt = [-2, 2, 4, 0][f]
        r_arm_y = [-16, 4, 16, 0][f]
        
        # Legs
        draw.rectangle([12, 46, 24, 58], fill=(45, 40, 38), outline=(20, 18, 16))
        draw.rectangle([40, 46, 52, 58], fill=(45, 40, 38), outline=(20, 18, 16))

        # Body
        cy = 32 + body_tilt
        draw.ellipse([18, cy - 12, 46, cy + 14], fill=(90, 82, 76), outline=(20, 18, 16))
        draw.polygon([(22, cy - 8), (32, cy - 10), (32, cy + 2), (20, cy + 4)], fill=(120, 110, 102), outline=(25, 22, 20))
        
        # Left Arm (bracing)
        draw.ellipse([6, cy - 6, 18, cy + 12], fill=(75, 68, 64), outline=(20, 18, 16))
        
        # Right Arm (slamming fist)
        fist_y = cy + r_arm_y
        draw.ellipse([42, fist_y - 10, 58, fist_y + 12], fill=(130, 120, 110), outline=(20, 18, 16))
        draw.rectangle([40, fist_y, 60, fist_y + 16], fill=(90, 80, 72), outline=(20, 18, 16))

        # Impact dust on frame 2
        if f == 2:
            draw.polygon([(36, 58), (44, 48), (52, 58)], fill=(220, 180, 100))
            draw.polygon([(48, 58), (56, 50), (62, 58)], fill=(240, 200, 120))

        # Head
        hy = cy - 16
        draw.rectangle([24, hy - 8, 40, hy + 6], fill=(110, 100, 92), outline=(20, 18, 16))
        draw.rectangle([27, hy - 3, 31, hy + 1], fill=(255, 40, 0)) # Red anger eyes
        draw.rectangle([33, hy - 3, 37, hy + 1], fill=(255, 40, 0))

        bg_frame = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_golem_attack.png"))
    print("Created raw master: enemy_golem_attack.png")

def create_phantom_idle_master():
    # 4 frames, 48x64 each -> 192x64 image
    img = Image.new("RGBA", (192, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        hover_y = [0, 2, 4, 2][f]
        finger_curl = [0, 1, 2, 1][f]

        # Ceiling tether / wisps
        draw.line([(24, 0), (24, 12 + hover_y)], fill=(120, 50, 180), width=3)

        # Palm / Hand Body
        hy = 20 + hover_y
        draw.ellipse([12, hy, 36, hy + 26], fill=(92, 43, 138), outline=(25, 10, 45))
        draw.ellipse([16, hy + 4, 32, hy + 20], fill=(148, 67, 212), outline=(25, 10, 45))
        # Glowing eye/gem in palm
        draw.ellipse([20, hy + 8, 28, hy + 16], fill=(80, 255, 240))

        # Spectral Clawed Fingers hanging down
        finger_x_base = [14, 20, 26, 32]
        for i, fx in enumerate(finger_x_base):
            fy_end = hy + 24 + 10 + (i % 2) * 3 + finger_curl
            draw.line([(fx, hy + 20), (fx + (i - 1.5) * 2, fy_end)], fill=(180, 100, 240), width=3)
            draw.point((fx + (i - 1.5) * 2, fy_end), fill=(220, 180, 255))

        bg_frame = Image.new("RGBA", (48, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_phantom_idle.png"))
    print("Created raw master: enemy_phantom_idle.png")

def create_phantom_drop_master():
    # 4 frames, 48x64 each -> 192x64 image
    img = Image.new("RGBA", (192, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Drop animation: swooping down towards bottom
        drop_y = [4, 16, 28, 34][f]

        # Stretch streak behind hand
        draw.polygon([(24, 0), (16, drop_y), (32, drop_y)], fill=(110, 40, 160))

        # Palm / Hand Body
        hy = drop_y
        draw.ellipse([10, hy, 38, hy + 24], fill=(120, 50, 180), outline=(25, 10, 45))
        draw.ellipse([20, hy + 6, 28, hy + 14], fill=(255, 50, 120)) # Red eager eye

        # Reaching claws open wide
        draw.line([(12, hy + 20), (4, hy + 32)], fill=(200, 120, 255), width=3)
        draw.line([(20, hy + 22), (16, hy + 36)], fill=(200, 120, 255), width=3)
        draw.line([(28, hy + 22), (32, hy + 36)], fill=(200, 120, 255), width=3)
        draw.line([(36, hy + 20), (44, hy + 32)], fill=(200, 120, 255), width=3)

        bg_frame = Image.new("RGBA", (48, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_phantom_drop.png"))
    print("Created raw master: enemy_phantom_drop.png")

def create_phantom_flee_master():
    # 4 frames, 48x64 each -> 192x64 image
    img = Image.new("RGBA", (192, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Flee animation: retreating upward frantically
        flee_y = [32, 22, 12, 2][f]

        # Puff of smoke / recoil aura
        draw.ellipse([8, flee_y + 16, 40, flee_y + 32], fill=(160, 100, 220))

        # Palm retreating
        hy = flee_y
        draw.ellipse([14, hy, 34, hy + 22], fill=(80, 30, 120), outline=(25, 10, 45))

        # Claws retracted inward
        draw.line([(16, hy + 18), (20, hy + 24)], fill=(160, 90, 210), width=2)
        draw.line([(24, hy + 18), (24, hy + 26)], fill=(160, 90, 210), width=2)
        draw.line([(32, hy + 18), (28, hy + 24)], fill=(160, 90, 210), width=2)

        bg_frame = Image.new("RGBA", (48, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "enemy_phantom_flee.png"))
    print("Created raw master: enemy_phantom_flee.png")

def create_lightning_bolt_master():
    # 4 frames, 16x64 each -> 64x64 image
    img = Image.new("RGBA", (64, 64), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 16
        frame = Image.new("RGBA", (16, 64), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Zap beam pattern for 4 frames
        bolt_points = [
            [(8, 0), (4, 16), (12, 32), (5, 48), (8, 64)],
            [(8, 0), (12, 14), (3, 30), (11, 46), (8, 64)],
            [(8, 0), (6, 18), (14, 34), (4, 50), (8, 64)],
            [(8, 0), (11, 15), (5, 33), (12, 49), (8, 64)]
        ][f]

        # Outer glow line
        draw.line(bolt_points, fill=(0, 160, 255), width=7)
        # Mid Cyan line
        draw.line(bolt_points, fill=(100, 230, 255), width=4)
        # Inner White core
        draw.line(bolt_points, fill=(255, 255, 255), width=2)

        # Side spark branches
        if f % 2 == 0:
            draw.line([(8, 20), (15, 26)], fill=(255, 230, 80), width=2)
            draw.line([(8, 44), (1, 50)], fill=(255, 230, 80), width=2)
        else:
            draw.line([(8, 16), (1, 22)], fill=(255, 230, 80), width=2)
            draw.line([(8, 40), (15, 46)], fill=(255, 230, 80), width=2)

        bg_frame = Image.new("RGBA", (16, 64), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "trap_lightning_bolt.png"))
    print("Created raw master: trap_lightning_bolt.png")

def create_gas_cloud_master():
    # 6 frames, 48x48 each -> 288x48 image
    img = Image.new("RGBA", (288, 48), (255, 255, 255, 255))
    
    for f in range(6):
        offset_x = f * 48
        frame = Image.new("RGBA", (48, 48), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        rot = f * (math.pi / 3)
        scale_r = 16 + (f % 3) * 2

        # Draw multiple overlapping billows of toxic gas
        centers = [
            (24 + int(6 * math.cos(rot)), 24 + int(6 * math.sin(rot))),
            (16 + int(4 * math.sin(rot)), 20 + int(4 * math.cos(rot))),
            (32 + int(4 * math.cos(rot)), 28 + int(4 * math.sin(rot))),
            (22, 32)
        ]
        
        for cx, cy in centers:
            draw_pixel_circle(draw, cx, cy, scale_r - 2, fill=(60, 180, 40), outline=(20, 70, 15))
            draw_pixel_circle(draw, cx - 2, cy - 2, scale_r - 6, fill=(140, 240, 60))

        # Toxic bubbles / skull pips
        b_x = 18 + (f * 5) % 16
        b_y = 36 - (f * 6) % 24
        draw.ellipse([b_x, b_y, b_x + 4, b_y + 4], fill=(220, 255, 120))

        bg_frame = Image.new("RGBA", (48, 48), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "trap_gas_cloud.png"))
    print("Created raw master: trap_gas_cloud.png")

def create_falling_rock_fall_master():
    # 4 frames, 32x32 each -> 128x32 image
    img = Image.new("RGBA", (128, 32), (255, 255, 255, 255))
    
    for f in range(4):
        offset_x = f * 32
        frame = Image.new("RGBA", (32, 32), (255, 255, 255, 0))
        draw = ImageDraw.Draw(frame)

        # Base jagged boulder shape rotated across 4 frames
        angles = [0, 90, 180, 270]
        ang_rad = math.radians(angles[f])
        cos_a = math.cos(ang_rad)
        sin_a = math.sin(ang_rad)

        base_poly = [(-10, -8), (2, -12), (11, -5), (12, 6), (3, 11), (-9, 9), (-12, 0)]
        rot_poly = []
        for px, py in base_poly:
            rx = int(16 + px * cos_a - py * sin_a)
            ry = int(16 + px * sin_a + py * cos_a)
            rot_poly.append((rx, ry))

        draw.polygon(rot_poly, fill=(110, 102, 95), outline=(30, 26, 24))
        
        # Highlight facets
        h_poly = [rot_poly[0], rot_poly[1], rot_poly[2], (16, 16)]
        draw.polygon(h_poly, fill=(150, 140, 130))

        # Speed streak trails above falling rock
        draw.line([(12, 2), (12, 6)], fill=(200, 190, 180))
        draw.line([(20, 1), (20, 5)], fill=(200, 190, 180))

        bg_frame = Image.new("RGBA", (32, 32), (255, 255, 255, 255))
        bg_frame.paste(frame, (0, 0), frame)
        img.paste(bg_frame, (offset_x, 0))

    img.save(os.path.join(RAW_DIR, "trap_falling_rock_fall.png"))
    print("Created raw master: trap_falling_rock_fall.png")

# -------------------------------------------------------------
# 2. PROCESS & PACK INTO ATLAS_ENEMIES
# -------------------------------------------------------------

def process_and_pack_atlas():
    asset_defs = [
        # (key_base, raw_image_filename, cell_w, cell_h, frame_count)
        ("enemy_golem_idle", "enemy_golem_idle.png", 64, 64, 4),
        ("enemy_golem_walk", "enemy_golem_walk.png", 64, 64, 6),
        ("enemy_golem_attack", "enemy_golem_attack.png", 64, 64, 4),
        ("enemy_phantom_idle", "enemy_phantom_idle.png", 48, 64, 4),
        ("enemy_phantom_drop", "enemy_phantom_drop.png", 48, 64, 4),
        ("enemy_phantom_flee", "enemy_phantom_flee.png", 48, 64, 4),
        ("trap_lightning_bolt", "trap_lightning_bolt.png", 16, 64, 4),
        ("trap_gas_cloud", "trap_gas_cloud.png", 48, 48, 6),
        ("trap_falling_rock_fall", "trap_falling_rock_fall.png", 32, 32, 4)
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

    # Pack into atlas_enemies (Phaser 3 JSON Hash + WebP)
    create_phaser_atlas(
        sprite_list=all_sprites,
        output_name="atlas_enemies",
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

    # Check if atlas_enemies is already in manifest
    atlases = manifest_data.get("atlases", [])
    exists = any(a.get("key") == "atlas_enemies" for a in atlases)

    if not exists:
        atlases.append({
            "key": "atlas_enemies",
            "texture": "assets/atlases/atlas_enemies.webp",
            "atlas": "assets/atlases/atlas_enemies.json"
        })
        manifest_data["atlases"] = atlases
        
        with open(MANIFEST_PATH, "w") as f:
            json.dump(manifest_data, f, indent=2)
        print("Updated manifest.json with atlas_enemies!")
    else:
        print("atlas_enemies already in manifest.json.")

if __name__ == "__main__":
    print("Generating raw master images in art_raw/enemies_traps/...")
    create_golem_idle_master()
    create_golem_walk_master()
    create_golem_attack_master()
    create_phantom_idle_master()
    create_phantom_drop_master()
    create_phantom_flee_master()
    create_lightning_bolt_master()
    create_gas_cloud_master()
    create_falling_rock_fall_master()

    print("\nProcessing backgrounds and packing into atlas_enemies...")
    process_and_pack_atlas()

    print("\nUpdating manifest.json...")
    update_manifest()

    print("\nEnemies & Advanced Traps processing complete!")
