import os
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from asset_processor import remove_background_chroma

RAW_MIST_DIR = "art_raw/tiles_mist"
PUBLIC_ATLAS_DIR = "client/public/assets/atlases"

os.makedirs(RAW_MIST_DIR, exist_ok=True)
os.makedirs(PUBLIC_ATLAS_DIR, exist_ok=True)

CHROMA_BG = (235, 238, 240, 255)

# Helper function to create base canvas
def create_raw_canvas(width, height, transparent=False):
    if transparent:
        return Image.new("RGBA", (width, height), (0, 0, 0, 0))
    else:
        return Image.new("RGBA", (width, height), CHROMA_BG)

# 1. blk_mist_stone (32x32)
def gen_blk_mist_stone():
    w, h = 32, 32
    img = create_raw_canvas(w, h, transparent=False)
    draw = ImageDraw.Draw(img)
    
    # Base block rectangle (inset 1px for border)
    # Color palette: Mist stone
    c_base = (64, 54, 84, 255)
    c_shadow = (35, 28, 52, 255)
    c_highlight = (110, 95, 140, 255)
    c_moss = (50, 75, 65, 255)
    c_border = (20, 15, 30, 255)

    # Draw border
    draw.rectangle([1, 1, 30, 30], fill=c_base, outline=c_border, width=1)
    
    # Top and Left bevel (highlight)
    draw.line([(2, 2), (29, 2)], fill=c_highlight, width=1)
    draw.line([(2, 2), (2, 29)], fill=c_highlight, width=1)
    
    # Bottom and Right shadow
    draw.line([(2, 29), (29, 29)], fill=c_shadow, width=1)
    draw.line([(29, 2), (29, 29)], fill=c_shadow, width=1)
    
    # Brick seam texture
    draw.line([(2, 16), (29, 16)], fill=c_shadow, width=1)
    draw.line([(15, 2), (15, 15)], fill=c_shadow, width=1)
    draw.line([(22, 16), (22, 28)], fill=c_shadow, width=1)

    # Moss patches on edges
    draw.polygon([(2, 2), (8, 2), (5, 6), (2, 4)], fill=c_moss)
    draw.polygon([(24, 2), (29, 2), (29, 5), (22, 4)], fill=c_moss)
    draw.polygon([(12, 16), (18, 16), (15, 19)], fill=c_moss)

    return img

# 2. blk_mist_rune (32x32)
def gen_blk_mist_rune():
    img = gen_blk_mist_stone()
    draw = ImageDraw.Draw(img)
    
    # Glowing rune overlay (cyan / lavender magic)
    c_rune_glow = (60, 220, 210, 255)
    c_rune_core = (220, 255, 250, 255)
    
    # Carve rune glyph in center (Diamond & sigil)
    rune_pts = [
        (16, 6), (23, 16), (16, 26), (9, 16)
    ]
    draw.polygon(rune_pts, outline=c_rune_glow, width=1)
    draw.line([(16, 6), (16, 26)], fill=c_rune_core, width=1)
    draw.line([(9, 16), (23, 16)], fill=c_rune_core, width=1)
    
    # Sparkle pips
    draw.point([(12, 12), (20, 12), (12, 20), (20, 20)], fill=c_rune_glow)
    
    return img

# 3. px_mist_far (512x512) - Seamless tileable low contrast purple mist far BG
def gen_px_mist_far():
    w, h = 512, 512
    img = Image.new("RGBA", (w, h), (36, 28, 52, 255))
    draw = ImageDraw.Draw(img)
    
    # Gradient sky backdrop
    for y in range(h):
        t = y / h
        r = int(36 + (55 - 36) * t)
        g = int(28 + (42 - 28) * t)
        b = int(52 + (80 - 52) * t)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))

    # Distant ruined mountain & pillar silhouettes
    c_sil1 = (30, 22, 44, 255)
    c_sil2 = (45, 34, 64, 255)
    c_sil3 = (60, 46, 82, 255)
    
    # Silhouettes layer 1
    pts1 = [(0, 340)]
    for x in range(0, w + 1, 32):
        sy = 300 + math.sin(x * 0.02) * 40 + math.cos(x * 0.05) * 20
        pts1.append((x, sy))
    pts1.extend([(w, h), (0, h)])
    draw.polygon(pts1, fill=c_sil1)
    
    # Distant ruined arches / pillars in silhouette
    for px in [60, 180, 320, 440]:
        draw.rectangle([px, 180, px + 24, 340], fill=c_sil2)
        draw.rectangle([px - 6, 170, px + 30, 182], fill=c_sil2)
    # Arch connections
    draw.arc([60, 170, 204, 230], start=180, end=360, fill=c_sil2, width=8)
    draw.arc([320, 170, 464, 230], start=180, end=360, fill=c_sil2, width=8)

    # Silhouettes layer 2 (Nearer mist hills)
    pts2 = [(0, 420)]
    for x in range(0, w + 1, 16):
        sy = 380 + math.sin(x * 0.03 + 1.0) * 30 + math.sin(x * 0.08) * 15
        pts2.append((x, sy))
    pts2.extend([(w, h), (0, h)])
    draw.polygon(pts2, fill=c_sil3)

    # Soft rolling fog overlay band
    fog_layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    fog_draw = ImageDraw.Draw(fog_layer)
    for i in range(12):
        fy = 150 + i * 25
        fw = 180 + (i % 4) * 40
        fx = (i * 90) % w
        fog_draw.ellipse([fx - fw, fy, fx + fw, fy + 60], fill=(138, 120, 168, 45))
        fog_draw.ellipse([(fx + w/2) % w - fw, fy + 20, (fx + w/2) % w + fw, fy + 80], fill=(110, 95, 140, 35))
    
    fog_layer = fog_layer.filter(ImageFilter.GaussianBlur(15))
    img = Image.alpha_composite(img, fog_layer)
    
    return img

# 4. px_mist_near_wisp (32x32)
def gen_px_mist_near_wisp():
    w, h = 32, 32
    img = create_raw_canvas(w, h, transparent=False)
    draw = ImageDraw.Draw(img)
    
    # Outer mist aura (purple/teal)
    draw.ellipse([4, 4, 28, 28], fill=(70, 40, 100, 255), outline=(40, 20, 60, 255))
    draw.ellipse([7, 7, 25, 25], fill=(40, 180, 190, 255))
    draw.ellipse([11, 11, 21, 21], fill=(140, 245, 240, 255))
    draw.ellipse([13, 13, 19, 19], fill=(240, 255, 255, 255))
    
    # Wisp tail / swirling tendrils
    draw.polygon([(16, 25), (10, 30), (14, 27)], fill=(40, 180, 190, 255))
    draw.polygon([(20, 22), (26, 28), (22, 24)], fill=(70, 40, 100, 255))
    draw.polygon([(12, 10), (6, 5), (10, 8)], fill=(140, 245, 240, 255))
    
    return img

# 5. px_mist_near_arch (128x160) - Ruined Arch
def gen_px_mist_near_arch():
    w, h = 128, 160
    img = create_raw_canvas(w, h, transparent=False)
    draw = ImageDraw.Draw(img)
    
    c_stone = (52, 44, 68, 255)
    c_dark = (28, 22, 40, 255)
    c_light = (90, 78, 114, 255)
    c_moss = (45, 70, 58, 255)

    # Left pillar
    draw.rectangle([16, 40, 40, 156], fill=c_stone, outline=c_dark, width=2)
    draw.line([(18, 42), (18, 154)], fill=c_light, width=2)
    # Block cracks & seams on left pillar
    for y in range(55, 150, 20):
        draw.line([(16, y), (40, y)], fill=c_dark, width=2)

    # Right pillar
    draw.rectangle([88, 40, 112, 156], fill=c_stone, outline=c_dark, width=2)
    draw.line([(90, 42), (90, 154)], fill=c_light, width=2)
    # Block cracks & seams on right pillar
    for y in range(55, 150, 20):
        draw.line([(88, y), (112, y)], fill=c_dark, width=2)

    # Top Arch Curve (Ruined broken top)
    draw.arc([16, 10, 112, 80], start=180, end=360, fill=c_stone, width=20)
    draw.arc([16, 10, 112, 80], start=180, end=360, fill=c_dark, width=2)
    draw.arc([26, 20, 102, 70], start=180, end=360, fill=c_light, width=2)

    # Ruined broken gap at top center
    draw.polygon([(54, 5), (74, 5), (68, 25), (58, 22)], fill=CHROMA_BG)

    # Pillar caps
    draw.rectangle([10, 36, 46, 46], fill=c_stone, outline=c_dark, width=2)
    draw.rectangle([82, 36, 118, 46], fill=c_stone, outline=c_dark, width=2)
    
    # Hanging moss and ivy details on arch
    draw.polygon([(20, 46), (30, 46), (26, 75), (22, 60)], fill=c_moss)
    draw.polygon([(88, 46), (98, 46), (95, 85), (90, 70)], fill=c_moss)
    draw.polygon([(36, 25), (50, 22), (44, 45)], fill=c_moss)

    return img

# 6. px_mist_near_moss (48x96) - Hanging Moss
def gen_px_mist_near_moss():
    w, h = 48, 96
    img = create_raw_canvas(w, h, transparent=False)
    draw = ImageDraw.Draw(img)
    
    c_moss_dark = (32, 50, 40, 255)
    c_moss_mid = (55, 85, 68, 255)
    c_moss_light = (90, 135, 105, 255)
    c_spore = (80, 230, 200, 255)

    # Top anchor bar
    draw.rectangle([0, 0, 48, 12], fill=c_moss_dark)

    # Hanging tendrils
    tendrils = [
        [(4, 10), (14, 10), (12, 70), (6, 85), (2, 50)],
        [(14, 10), (28, 10), (26, 92), (20, 94), (16, 60)],
        [(26, 10), (38, 10), (36, 78), (30, 80), (28, 45)],
        [(36, 10), (46, 10), (44, 55), (40, 60), (38, 35)]
    ]
    
    for t in tendrils:
        draw.polygon(t, fill=c_moss_dark)
    
    # Mid & highlight layers
    draw.polygon([(8, 10), (22, 10), (20, 80), (14, 75)], fill=c_moss_mid)
    draw.polygon([(24, 10), (34, 10), (32, 65), (28, 60)], fill=c_moss_mid)
    
    draw.polygon([(10, 10), (18, 10), (16, 50), (12, 45)], fill=c_moss_light)
    draw.polygon([(26, 10), (30, 10), (29, 40), (27, 35)], fill=c_moss_light)

    # Glowing mist spore droplets
    draw.ellipse([18, 86, 22, 90], fill=c_spore)
    draw.ellipse([8, 78, 11, 81], fill=c_spore)
    draw.ellipse([32, 72, 35, 75], fill=c_spore)

    return img

# 7. px_mist_fore_fog (256x128) - Fore Fog Sheet
def gen_px_mist_fore_fog():
    w, h = 256, 128
    # Transparency direct creation for soft fog sheet
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Layered translucent fog ellipses
    fog_blobs = [
        (40, 64, 110, 50, (138, 120, 168, 160)),
        (140, 70, 130, 45, (110, 95, 145, 140)),
        (220, 55, 90, 40, (160, 140, 190, 150)),
        (80, 80, 140, 40, (100, 180, 195, 120)),
        (180, 85, 120, 35, (140, 125, 175, 130)),
        (30, 90, 100, 30, (80, 160, 180, 110))
    ]
    
    for cx, cy, rx, ry, col in fog_blobs:
        draw.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=col)
        
    img = img.filter(ImageFilter.GaussianBlur(12))
    return img

# 8. trap_gas_biome_mist (48x48) - Mist Gas Cloud
def gen_trap_gas_biome_mist():
    w, h = 48, 48
    img = create_raw_canvas(w, h, transparent=False)
    draw = ImageDraw.Draw(img)
    
    # Swirling toxic mist gas cloud
    c_dark_purple = (60, 20, 80, 255)
    c_mid_purple = (110, 40, 140, 255)
    c_poison_green = (40, 190, 130, 255)
    c_glow_cyan = (90, 245, 200, 255)
    
    # Outer dark cloud puff
    draw.ellipse([4, 6, 44, 42], fill=c_dark_purple)
    draw.ellipse([2, 14, 30, 44], fill=c_dark_purple)
    draw.ellipse([18, 2, 46, 32], fill=c_dark_purple)

    # Inner swirling mid purple
    draw.ellipse([8, 10, 40, 38], fill=c_mid_purple)
    draw.ellipse([14, 6, 42, 28], fill=c_mid_purple)
    
    # Poison swirls
    draw.ellipse([12, 16, 36, 34], fill=c_poison_green)
    draw.ellipse([18, 14, 32, 26], fill=c_glow_cyan)
    
    # Bubbles / spores
    draw.ellipse([8, 12, 14, 18], fill=c_glow_cyan)
    draw.ellipse([34, 18, 38, 22], fill=c_glow_cyan)
    draw.ellipse([22, 32, 27, 37], fill=c_poison_green)
    draw.ellipse([12, 28, 16, 32], fill=c_glow_cyan)
    
    return img

def main():
    print("Generating raw master images in art_raw/tiles_mist/...")
    
    raw_generators = {
        "blk_mist_stone": gen_blk_mist_stone,
        "blk_mist_rune": gen_blk_mist_rune,
        "px_mist_far": gen_px_mist_far,
        "px_mist_near_wisp": gen_px_mist_near_wisp,
        "px_mist_near_arch": gen_px_mist_near_arch,
        "px_mist_near_moss": gen_px_mist_near_moss,
        "px_mist_fore_fog": gen_px_mist_fore_fog,
        "trap_gas_biome_mist": gen_trap_gas_biome_mist,
    }
    
    processed_sprites = []
    
    for item_id, gen_fn in raw_generators.items():
        raw_img = gen_fn()
        raw_path = os.path.join(RAW_MIST_DIR, f"{item_id}.png")
        raw_img.save(raw_path, "PNG")
        print(f" Saved raw master: {raw_path}")
        
        # Remove background if needed or process chroma
        if item_id in ["px_mist_far", "px_mist_fore_fog"]:
            # Backgrounds with explicit canvas/alpha
            rgba_img = raw_img.convert("RGBA")
        else:
            rgba_img = remove_background_chroma(raw_img, bg_color=CHROMA_BG[:3], tolerance=30)
            
        processed_sprites.append((item_id, rgba_img))

    # Pack into atlas_tiles_mist (Phaser 3 JSON Hash format)
    print("\nPacking assets into Phaser 3 JSON Hash Atlas...")
    
    # Shelf packing for mixed dimensions into 1024x512 canvas
    sheet_w, sheet_h = 1024, 512
    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_json = {}
    
    # Fixed packing coordinates for clean placement without overlap
    packing_coords = {
        "px_mist_far": (0, 0),             # 512x512
        "px_mist_fore_fog": (512, 0),      # 256x128
        "px_mist_near_arch": (768, 0),     # 128x160
        "px_mist_near_moss": (512, 128),   # 48x96
        "trap_gas_biome_mist": (560, 128),  # 48x48
        "blk_mist_stone": (608, 128),      # 32x32
        "blk_mist_rune": (640, 128),       # 32x32
        "px_mist_near_wisp": (672, 128)    # 32x32
    }
    
    for item_id, sprite in processed_sprites:
        x, y = packing_coords[item_id]
        sw, sh = sprite.size
        
        atlas_img.paste(sprite, (x, y), sprite)
        
        frames_json[item_id] = {
            "frame": {"x": x, "y": y, "w": sw, "h": sh},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": sw, "h": sh},
            "sourceSize": {"w": sw, "h": sh},
            "pivot": {"x": 0.5, "y": 0.5}
        }
        
    atlas_data = {
        "frames": frames_json,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_tiles_mist.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }
    
    webp_path = os.path.join(PUBLIC_ATLAS_DIR, "atlas_tiles_mist.webp")
    json_path = os.path.join(PUBLIC_ATLAS_DIR, "atlas_tiles_mist.json")
    
    atlas_img.save(webp_path, "WEBP", quality=90)
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)
        
    print(f"Atlas generated successfully:")
    print(f"  WebP: {webp_path}")
    print(f"  JSON: {json_path}")
    
    # 3. Update manifest.json
    manifest_path = "client/public/assets/manifest.json"
    if os.path.exists(manifest_path):
        with open(manifest_path, "r") as f:
            manifest = json.load(f)
            
        # Check if atlas_tiles_mist is already in manifest
        existing_keys = [a["key"] for a in manifest.get("atlases", [])]
        if "atlas_tiles_mist" not in existing_keys:
            manifest["atlases"].append({
                "key": "atlas_tiles_mist",
                "texture": "assets/atlases/atlas_tiles_mist.webp",
                "atlas": "assets/atlases/atlas_tiles_mist.json"
            })
            with open(manifest_path, "w") as f:
                json.dump(manifest, f, indent=2)
            print(f"Updated {manifest_path} with atlas_tiles_mist!")
        else:
            print(f"atlas_tiles_mist already present in {manifest_path}.")

if __name__ == "__main__":
    main()
