import os
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter
from asset_processor import remove_background_chroma

RAW_DIR = "art_raw/tiles_cavern"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

CHROMA_BG = (0, 255, 0, 255) # Green screen chroma key for background removal

def draw_cavern_rock():
    """Generates 32x32 cavern rock block master image."""
    w, h = 32, 32
    scale = 4 # Draw at 4x for high-res master then downsample
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Base rock fill
    rock_rect = (0, 0, sw, sh)
    draw.rectangle(rock_rect, fill=(45, 35, 57)) # Dark purple/grey slate base

    # Jagged rock facets and cracks
    # Midtone facets
    facets = [
        [(0, 0), (sw, 0), (sw*0.7, sh*0.3), (sw*0.2, sh*0.2)],
        [(0, 0), (sw*0.2, sh*0.2), (sw*0.4, sh*0.8), (0, sh)],
        [(sw*0.7, sh*0.3), (sw, 0), (sw, sh), (sw*0.5, sh*0.7)],
        [(sw*0.2, sh*0.2), (sw*0.7, sh*0.3), (sw*0.5, sh*0.7), (sw*0.4, sh*0.8)],
        [(0, sh), (sw*0.4, sh*0.8), (sw*0.5, sh*0.7), (sw*0.8, sh)],
    ]
    colors = [(67, 54, 89), (55, 43, 72), (75, 62, 98), (40, 30, 52), (50, 38, 65)]
    for poly, col in zip(facets, colors):
        draw.polygon(poly, fill=col)

    # Light stone edge highlights (top & left bevels)
    draw.line([(0, 0), (sw, 0)], fill=(130, 110, 160), width=6)
    draw.line([(0, 0), (0, sh)], fill=(110, 92, 140), width=6)

    # Dark chiseled cracks
    cracks = [
        [(sw*0.2, sh*0.2), (sw*0.4, sh*0.5), (sw*0.3, sh*0.8)],
        [(sw*0.7, sh*0.3), (sw*0.5, sh*0.7)],
        [(sw*0.4, sh*0.5), (sw*0.7, sh*0.6)]
    ]
    for crack in cracks:
        draw.line(crack, fill=(22, 16, 32), width=4)

    # Subtle texture noise
    rng = random.Random(42)
    for _ in range(300):
        nx = rng.randint(0, sw-1)
        ny = rng.randint(0, sh-1)
        val = rng.randint(-15, 15)
        r, g, b, _ = img.getpixel((nx, ny))
        img.putpixel((nx, ny), (max(0, min(255, r+val)), max(0, min(255, g+val)), max(0, min(255, b+val)), 255))

    return img.resize((w, h), Image.Resampling.LANCZOS)

def draw_sand_block():
    """Generates 32x32 sand block master image."""
    w, h = 32, 32
    scale = 4
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Base warm sand
    draw.rectangle((0, 0, sw, sh), fill=(212, 163, 89))

    # Wavy dune layers
    dunes = [
        [(0, sh*0.3), (sw*0.4, sh*0.2), (sw*0.8, sh*0.4), (sw, sh*0.3), (sw, sh), (0, sh)],
        [(0, sh*0.6), (sw*0.3, sh*0.5), (sw*0.7, sh*0.7), (sw, sh*0.6), (sw, sh), (0, sh)]
    ]
    dune_cols = [(190, 142, 70), (166, 118, 56)]
    for dune, col in zip(dunes, dune_cols):
        draw.polygon(dune, fill=col)

    # Top highlight
    draw.line([(0, 2), (sw, 2)], fill=(242, 200, 128), width=6)

    # Grainy sand specks
    rng = random.Random(101)
    for _ in range(400):
        nx = rng.randint(0, sw-1)
        ny = rng.randint(0, sh-1)
        grain_col = rng.choice([(245, 210, 140, 255), (140, 95, 40, 255), (220, 175, 100, 255)])
        draw.point((nx, ny), fill=grain_col)

    return img.resize((w, h), Image.Resampling.LANCZOS)

def draw_cavern_moss():
    """Generates 32x32 mossy cavern rock block master image."""
    w, h = 32, 32
    scale = 4
    sw, sh = w * scale, h * scale
    
    # Start with cavern rock
    rock = draw_cavern_rock().resize((sw, sh), Image.Resampling.NEAREST)
    draw = ImageDraw.Draw(rock)

    # Layer lush bioluminescent moss on top & sides
    moss_top = [(0, 0), (sw, 0), (sw, sh*0.45), (sw*0.8, sh*0.35), (sw*0.6, sh*0.5), (sw*0.3, sh*0.3), (0, sh*0.4)]
    draw.polygon(moss_top, fill=(31, 138, 76)) # Deep emerald base

    # Neon glowing moss accents
    moss_glow = [(0, 0), (sw, 0), (sw, sh*0.25), (sw*0.7, sh*0.2), (sw*0.5, sh*0.3), (sw*0.2, sh*0.15), (0, sh*0.25)]
    draw.polygon(moss_glow, fill=(58, 217, 117)) # Vibrant neon green

    # Bright bioluminescent spores / spots
    rng = random.Random(202)
    for _ in range(60):
        mx = rng.randint(2, sw-4)
        my = rng.randint(2, int(sh*0.35))
        r = rng.randint(2, 5)
        draw.ellipse([mx-r, my-r, mx+r, my+r], fill=(136, 254, 165))

    return rock.resize((w, h), Image.Resampling.LANCZOS)

def draw_px_cav_far():
    """Generates 512x512 cavern background tile image."""
    w, h = 512, 512
    img = Image.new("RGBA", (w, h), (11, 8, 19, 255))
    draw = ImageDraw.Draw(img)

    # Vertical gradient
    for y in range(h):
        ratio = y / float(h)
        r = int(11 * (1 - ratio) + 24 * ratio)
        g = int(8 * (1 - ratio) + 17 * ratio)
        b = int(19 * (1 - ratio) + 36 * ratio)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Distant parallax rock arches and cavern silhouettes
    # Arch 1
    arch1 = [(0, 100), (80, 80), (160, 120), (220, 240), (260, h), (0, h)]
    draw.polygon(arch1, fill=(20, 15, 30, 255))
    # Arch 2 (right)
    arch2 = [(300, h), (340, 200), (420, 90), (512, 110), (512, h)]
    draw.polygon(arch2, fill=(18, 13, 28, 255))

    # Hanging distant stalactite silhouettes
    stal_pts = [
        [(50, 0), (70, 0), (60, 140)],
        [(140, 0), (170, 0), (155, 190)],
        [(280, 0), (300, 0), (290, 110)],
        [(400, 0), (430, 0), (415, 160)],
        [(470, 0), (490, 0), (480, 100)]
    ]
    for pts in stal_pts:
        draw.polygon(pts, fill=(15, 11, 22, 255))

    # Bioluminescent spores / floating magic crystals
    rng = random.Random(777)
    colors = [(58, 150, 212, 180), (182, 72, 242, 180), (72, 216, 242, 180)]
    for _ in range(120):
        cx = rng.randint(0, w)
        cy = rng.randint(0, h)
        cr = rng.randint(1, 4)
        col = rng.choice(colors)
        draw.ellipse([cx-cr, cy-cr, cx+cr, cy+cr], fill=col)

    return img

def draw_px_cav_near_stalactite():
    """Generates 32x96 stalactite image with green screen chroma background."""
    w, h = 32, 96
    scale = 4
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Tapering cone pointing downward
    # Base at top: x=sw*0.1..sw*0.9, y=0. Tip at bottom: x=sw*0.5, y=sh*0.95
    cone = [(sw*0.1, 0), (sw*0.9, 0), (sw*0.5, sh*0.95)]
    draw.polygon(cone, fill=(45, 37, 58)) # Slate base

    # Left shadow / Right highlight
    shadow_side = [(sw*0.1, 0), (sw*0.5, 0), (sw*0.5, sh*0.95)]
    highlight_side = [(sw*0.5, 0), (sw*0.9, 0), (sw*0.5, sh*0.95)]
    draw.polygon(shadow_side, fill=(32, 25, 43))
    draw.polygon(highlight_side, fill=(67, 56, 84))

    # Mineral striations (horizontal ridges)
    for y_pct in [0.2, 0.4, 0.6, 0.8]:
        y_pos = sh * y_pct
        width_at_y = (1.0 - y_pct) * sw * 0.4
        draw.line([(sw*0.5 - width_at_y, y_pos), (sw*0.5 + width_at_y, y_pos)], fill=(86, 75, 107), width=4)

    # Specular water drip at tip
    tip_x, tip_y = sw*0.5, sh*0.93
    draw.ellipse([tip_x-6, tip_y-6, tip_x+6, tip_y+6], fill=(134, 221, 240))
    draw.ellipse([tip_x-3, tip_y-3, tip_x+3, tip_y+3], fill=(220, 250, 255))

    return img.resize((w, h), Image.Resampling.LANCZOS)

def draw_px_cav_near_stalagmite():
    """Generates 32x64 stalagmite image with green screen chroma background."""
    w, h = 32, 64
    scale = 4
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Tapering cone pointing upward
    # Base at bottom: x=0..sw, y=sh. Tip at top: x=sw*0.5, y=sh*0.08
    cone = [(0, sh), (sw, sh), (sw*0.5, sh*0.08)]
    draw.polygon(cone, fill=(48, 38, 61))

    # Shading
    left_side = [(0, sh), (sw*0.5, sh), (sw*0.5, sh*0.08)]
    right_side = [(sw*0.5, sh), (sw, sh), (sw*0.5, sh*0.08)]
    draw.polygon(left_side, fill=(35, 27, 45))
    draw.polygon(right_side, fill=(78, 62, 97))

    # Moss encrustation at base
    moss_base = [(0, sh), (sw, sh), (sw*0.8, sh*0.7), (sw*0.5, sh*0.85), (sw*0.2, sh*0.75)]
    draw.polygon(moss_base, fill=(46, 209, 162))

    return img.resize((w, h), Image.Resampling.LANCZOS)

def draw_px_cav_near_mushroom():
    """Generates 32x32 bioluminescent mushroom with green screen chroma background."""
    w, h = 32, 32
    scale = 4
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Stem
    stem_pts = [(sw*0.42, sh*0.9), (sw*0.58, sh*0.9), (sw*0.55, sh*0.45), (sw*0.45, sh*0.45)]
    draw.polygon(stem_pts, fill=(208, 192, 240))
    draw.line([(sw*0.42, sh*0.9), (sw*0.45, sh*0.45)], fill=(150, 130, 190), width=3)

    # Mushroom Cap Dome
    cap_box = [sw*0.1, sh*0.15, sw*0.9, sh*0.55]
    draw.chord(cap_box, start=180, end=360, fill=(168, 50, 212))

    # Bioluminescent spots on cap
    spots = [(sw*0.3, sh*0.25), (sw*0.5, sh*0.2), (sw*0.7, sh*0.3), (sw*0.4, sh*0.35)]
    for sx, sy in spots:
        draw.ellipse([sx-5, sy-5, sx+5, sy+5], fill=(75, 245, 245))

    # Under-cap glow
    draw.ellipse([sw*0.15, sh*0.45, sw*0.85, sh*0.55], fill=(240, 98, 242))

    return img.resize((w, h), Image.Resampling.LANCZOS)

def draw_px_cav_fore_roots():
    """Generates 96x64 foreground roots with green screen chroma background."""
    w, h = 96, 64
    scale = 4
    sw, sh = w * scale, h * scale
    img = Image.new("RGBA", (sw, sh), CHROMA_BG)
    draw = ImageDraw.Draw(img)

    # Main root horizontal trunk along top
    draw.rectangle([0, 0, sw, sh*0.25], fill=(61, 38, 24))

    # Twisting root tendrils hanging down
    roots = [
        [(sw*0.1, sh*0.2), (sw*0.15, sh*0.6), (sw*0.12, sh*0.95)],
        [(sw*0.3, sh*0.2), (sw*0.38, sh*0.5), (sw*0.35, sh*0.8)],
        [(sw*0.55, sh*0.2), (sw*0.5, sh*0.6), (sw*0.58, sh*0.9)],
        [(sw*0.8, sh*0.2), (sw*0.85, sh*0.7), (sw*0.82, sh*0.95)]
    ]
    for r_pts in roots:
        draw.line(r_pts, fill=(61, 38, 24), width=16)
        draw.line(r_pts, fill=(90, 58, 38), width=8)

    # Hanging vine leaf / moss drips
    vines = [
        [(sw*0.2, sh*0.2), (sw*0.22, sh*0.7)],
        [(sw*0.45, sh*0.2), (sw*0.47, sh*0.85)],
        [(sw*0.7, sh*0.2), (sw*0.68, sh*0.6)]
    ]
    for v_pts in vines:
        draw.line(v_pts, fill=(42, 168, 92), width=6)

    return img.resize((w, h), Image.Resampling.LANCZOS)

def generate_cavern_assets():
    print("Generating raw master images in art_raw/tiles_cavern/...")
    
    raw_generators = {
        "blk_cavern_rock": draw_cavern_rock,
        "blk_sand": draw_sand_block,
        "blk_cavern_moss": draw_cavern_moss,
        "px_cav_far": draw_px_cav_far,
        "px_cav_near_stalactite": draw_px_cav_near_stalactite,
        "px_cav_near_stalagmite": draw_px_cav_near_stalagmite,
        "px_cav_near_mushroom": draw_px_cav_near_mushroom,
        "px_cav_fore_roots": draw_px_cav_fore_roots
    }

    processed_sprites = {}

    for item_id, gen_fn in raw_generators.items():
        master_img = gen_fn()
        raw_path = os.path.join(RAW_DIR, f"{item_id}_raw.png")
        master_img.save(raw_path, "PNG")
        print(f" Saved master raw image: {raw_path}")

        # Process background removal if image has CHROMA_BG green screen
        if item_id == "px_cav_far":
            # Background wallpaper is fully opaque
            rgba_img = master_img.convert("RGBA")
        else:
            rgba_img = remove_background_chroma(master_img, bg_color=(0, 255, 0), tolerance=40)
        
        processed_sprites[item_id] = rgba_img

    # Build Atlas
    atlas_w, atlas_h = 1024, 512
    atlas_img = Image.new("RGBA", (atlas_w, atlas_h), (0, 0, 0, 0))
    frames_json = {}

    # Specific clean layout mapping:
    layout_map = {
        "px_cav_far": (0, 0, 512, 512),
        "px_cav_fore_roots": (512, 0, 96, 64),
        "px_cav_near_stalactite": (608, 0, 32, 96),
        "px_cav_near_stalagmite": (640, 0, 32, 64),
        "px_cav_near_mushroom": (672, 0, 32, 32),
        "blk_cavern_rock": (512, 64, 32, 32),
        "blk_sand": (544, 64, 32, 32),
        "blk_cavern_moss": (576, 64, 32, 32)
    }

    for item_id, (x, y, w, h) in layout_map.items():
        sprite = processed_sprites[item_id]
        if sprite.size != (w, h):
            sprite = sprite.resize((w, h), Image.Resampling.LANCZOS)

        atlas_img.paste(sprite, (x, y), sprite)

        frames_json[item_id] = {
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
            "image": "atlas_tiles_cavern.webp",
            "format": "RGBA8888",
            "size": {"w": atlas_w, "h": atlas_h},
            "scale": "1"
        }
    }

    # Save output WebP, PNG, and JSON
    webp_path = os.path.join(PUBLIC_DIR, "atlas_tiles_cavern.webp")
    png_path = os.path.join(PUBLIC_DIR, "atlas_tiles_cavern.png")
    json_path = os.path.join(PUBLIC_DIR, "atlas_tiles_cavern.json")

    atlas_img.save(webp_path, "WEBP", quality=90)
    atlas_img.save(png_path, "PNG")
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"\nSuccessfully generated Cavern Biome texture atlas:")
    print(f" WebP: {webp_path}")
    print(f" JSON: {json_path}")

    # Update manifest.json
    with open(MANIFEST_PATH, "r") as f:
        manifest = json.load(f)

    cavern_atlas_entry = {
        "key": "atlas_tiles_cavern",
        "texture": "assets/atlases/atlas_tiles_cavern.webp",
        "atlas": "assets/atlases/atlas_tiles_cavern.json"
    }

    # Check if already present
    existing_keys = [a["key"] for a in manifest.get("atlases", [])]
    if "atlas_tiles_cavern" not in existing_keys:
        manifest["atlases"].append(cavern_atlas_entry)
        with open(MANIFEST_PATH, "w") as f:
            json.dump(manifest, f, indent=2)
        print(f" Updated {MANIFEST_PATH} with atlas_tiles_cavern entry.")
    else:
        print(f" {MANIFEST_PATH} already contains atlas_tiles_cavern entry.")

if __name__ == "__main__":
    generate_cavern_assets()
