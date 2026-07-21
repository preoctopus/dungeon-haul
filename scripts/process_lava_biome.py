import os
import json
import math
import random
from PIL import Image, ImageDraw, ImageFilter

RAW_LAVA_DIR = "art_raw/tiles_lava"
PUBLIC_ATLAS_DIR = "client/public/assets/atlases"
os.makedirs(RAW_LAVA_DIR, exist_ok=True)
os.makedirs(PUBLIC_ATLAS_DIR, exist_ok=True)

# Helper function to remove solid background color if present (chroma keying)
def remove_background_chroma(img, bg_color=(255, 255, 255), tolerance=20):
    img = img.convert("RGBA")
    datas = img.getdata()
    new_data = []
    r_bg, g_bg, b_bg = bg_color[:3]

    for item in datas:
        r, g, b, a = item
        if a == 0:
            new_data.append((0, 0, 0, 0))
            continue
        dist = ((r - r_bg)**2 + (g - g_bg)**2 + (b - b_bg)**2) ** 0.5
        if dist < tolerance:
            new_data.append((0, 0, 0, 0))
        elif dist < tolerance * 1.5:
            alpha = int(255 * ((dist - tolerance) / (tolerance * 0.5)))
            new_data.append((r, g, b, min(a, alpha)))
        else:
            new_data.append((r, g, b, a))

    img.putdata(new_data)
    return img


# --- ART GENERATION FUNCTIONS ---

def generate_blk_lava_rock():
    # 32x32 Basalt Rock with lava cracks
    w, h = 32, 32
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base basalt stone background with noise/grain
    c_base = (30, 26, 36, 255)
    c_mid = (45, 40, 55, 255)
    c_dark = (20, 17, 25, 255)
    c_high = (70, 62, 85, 255)

    for y in range(h):
        for x in range(w):
            v = ((x * 7 + y * 13) % 17) / 17.0
            if v > 0.7:
                draw.point((x, y), c_high)
            elif v > 0.3:
                draw.point((x, y), c_mid)
            elif v > 0.1:
                draw.point((x, y), c_base)
            else:
                draw.point((x, y), c_dark)

    # Bevel border
    for x in range(w):
        draw.point((x, 0), c_high)
        draw.point((x, h - 1), c_dark)
    for y in range(h):
        draw.point((0, y), c_high)
        draw.point((w - 1, y), c_dark)

    # Fiery lava cracks
    cracks = [
        [(4, 12), (9, 15), (14, 12), (20, 18), (27, 16)],
        [(14, 12), (16, 22), (22, 26)],
        [(8, 4), (10, 9), (4, 12)]
    ]

    # Draw crack glow then inner core
    for path in cracks:
        for i in range(len(path) - 1):
            p1, p2 = path[i], path[i+1]
            draw.line([p1, p2], fill=(200, 40, 0, 255), width=2)
    for path in cracks:
        for i in range(len(path) - 1):
            p1, p2 = path[i], path[i+1]
            draw.line([p1, p2], fill=(255, 180, 0, 255), width=1)
    
    # Hot spot dots
    draw.point((14, 12), (255, 240, 150, 255))
    draw.point((9, 15), (255, 220, 100, 255))

    return img


def generate_blk_lava_glow_edge():
    # 32x32 Lava top edge block (lava surface over basalt rock base)
    w, h = 32, 32
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Bottom part: dark rock base (y: 12..31)
    for y in range(12, h):
        for x in range(w):
            v = ((x * 11 + y * 5) % 13) / 13.0
            col = (40, 32, 45, 255) if v > 0.5 else (25, 20, 30, 255)
            draw.point((x, y), col)

    # Top part: wavy molten lava flow (y: 0..14)
    c_red = (204, 34, 0, 255)
    c_orange = (255, 102, 0, 255)
    c_yellow = (255, 214, 0, 255)
    c_white = (255, 255, 200, 255)

    for x in range(w):
        # Wave height
        surf_y = int(3 + math.sin(x * 0.4) * 2 + math.cos(x * 0.2) * 1.5)
        for y in range(0, 16):
            if y < surf_y:
                continue
            elif y == surf_y:
                draw.point((x, y), c_white)
            elif y < surf_y + 3:
                draw.point((x, y), c_yellow)
            elif y < surf_y + 8:
                draw.point((x, y), c_orange)
            elif y < surf_y + 13:
                draw.point((x, y), c_red)

    # Heat ambient bleed into bottom rock
    for y in range(14, 20):
        alpha = int(180 * (1 - (y - 14) / 6.0))
        for x in range(w):
            if random.random() > 0.4:
                r, g, b, _ = img.getpixel((x, y))
                img.putpixel((x, y), (min(255, r + alpha), min(255, g + alpha // 3), b, 255))

    return img


def generate_px_lava_far():
    # 256x256 Parallax Far background (cavern with distant lava rivers and ember sky)
    w, h = 256, 256
    img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)

    # Atmospheric gradient: dark purple sky to deep orange horizon
    for y in range(h):
        ratio = y / float(h)
        r = int(15 + ratio * 80)
        g = int(8 + ratio * 20)
        b = int(24 + ratio * 10)
        draw.line([(0, y), (w - 1, y)], fill=(r, g, b, 255))

    # Distant mountain silhouettes (Background layer 1)
    pts1 = [(0, 160)]
    for x in range(0, w + 20, 20):
        py = int(120 + math.sin(x * 0.05) * 30 + math.cos(x * 0.02) * 20)
        pts1.append((x, py))
    pts1.extend([(w, h), (0, h)])
    draw.polygon(pts1, fill=(28, 16, 34, 255))

    # Magma river glowing along the mountain base
    for x in range(w):
        river_y = int(155 + math.sin(x * 0.04) * 15)
        for ry in range(river_y, river_y + 12):
            if 0 <= ry < h:
                d = abs(ry - (river_y + 6))
                if d < 2:
                    col = (255, 230, 120, 255)
                elif d < 4:
                    col = (255, 120, 0, 255)
                else:
                    col = (180, 30, 0, 255)
                draw.point((x, ry), col)

    # Closer mountain ridge silhouette (Foreground layer 2)
    pts2 = [(0, 200)]
    for x in range(0, w + 15, 15):
        py = int(170 + math.sin(x * 0.08) * 25 + math.cos(x * 0.03) * 15)
        pts2.append((x, py))
    pts2.extend([(w, h), (0, h)])
    draw.polygon(pts2, fill=(18, 10, 22, 255))

    # Floating ember sparks
    random.seed(42)
    for _ in range(80):
        ex = random.randint(0, w - 1)
        ey = random.randint(20, h - 30)
        sz = random.choice([1, 2])
        col = random.choice([(255, 200, 50, 220), (255, 100, 0, 200), (255, 50, 0, 180)])
        if sz == 1:
            draw.point((ex, ey), col)
        else:
            draw.rectangle([ex, ey, ex + 1, ey + 1], fill=col)

    return img


def generate_px_lava_near_spire():
    # 64x192 Jagged obsidian spire prop with glowing lava veins
    w, h = 64, 192
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Main spire polygon (tapered rock column)
    spire_pts = [
        (32, 8),    # Tip
        (46, 40),
        (42, 80),
        (54, 130),
        (58, 191),  # Base right
        (6, 191),   # Base left
        (12, 120),
        (20, 60),
        (18, 30)
    ]
    
    # Fill body
    draw.polygon(spire_pts, fill=(24, 18, 28, 255))

    # Facet shading lines
    facets = [
        [(32, 8), (34, 60), (42, 120), (38, 191)],
        [(32, 8), (24, 50), (28, 110), (22, 191)]
    ]
    for f in facets[0]:
        pass
    draw.polygon([(32, 8), (34, 60), (42, 120), (38, 191), (58, 191), (54, 130), (42, 80), (46, 40)], fill=(36, 28, 44, 255))
    draw.polygon([(32, 8), (24, 50), (28, 110), (22, 191), (6, 191), (12, 120), (20, 60), (18, 30)], fill=(16, 12, 20, 255))

    # Highlights on edges
    draw.line([(32, 8), (46, 40), (42, 80), (54, 130), (58, 191)], fill=(55, 45, 68, 255), width=1)

    # Glowing lava veins traversing down the spire
    veins = [
        [(32, 15), (30, 45), (36, 85), (30, 135), (34, 191)],
        [(24, 50), (18, 90), (24, 140)],
        [(40, 70), (48, 110), (42, 160)]
    ]

    for v in veins:
        for i in range(len(v) - 1):
            draw.line([v[i], v[i+1]], fill=(204, 34, 0, 255), width=3)
    for v in veins:
        for i in range(len(v) - 1):
            draw.line([v[i], v[i+1]], fill=(255, 153, 0, 255), width=1)

    return img


def generate_px_lava_near_crack():
    # 64x32 Floor Crack Glow prop
    w, h = 64, 32
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer ground crack rim (dark rock)
    crack_outer = [(4, 16), (16, 10), (28, 18), (44, 8), (60, 16), (48, 24), (32, 20), (16, 26)]
    draw.polygon(crack_outer, fill=(28, 22, 34, 255))

    # Inner glowing magma fissure
    crack_inner = [(8, 16), (18, 12), (28, 17), (44, 11), (56, 16), (46, 22), (32, 19), (18, 23)]
    draw.polygon(crack_inner, fill=(235, 45, 0, 255))

    # Bright intense molten center line
    center_line = [(10, 16), (18, 13), (28, 17), (44, 12), (54, 16)]
    for i in range(len(center_line) - 1):
        draw.line([center_line[i], center_line[i+1]], fill=(255, 230, 100, 255), width=2)

    return img


def generate_trap_spikes_biome_lava():
    # 32x32 Lava Spike Trap (obsidian spikes with glowing fiery tips)
    w, h = 32, 32
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Base plate (y: 26..31)
    draw.rectangle([0, 26, 31, 31], fill=(30, 24, 36, 255))
    draw.line([(0, 26), (31, 26)], fill=(55, 45, 65, 255))

    # Spikes (3 spikes across width)
    spikes = [
        [(2, 26), (7, 4), (12, 26)],
        [(11, 26), (16, 1), (21, 26)],
        [(20, 26), (25, 6), (30, 26)]
    ]

    for sp in spikes:
        # Obsidian dark body
        draw.polygon(sp, fill=(22, 17, 28, 255))
        # Left side highlight
        draw.line([sp[0], sp[1]], fill=(48, 38, 58, 255), width=1)
        # Right side shadow
        draw.line([sp[1], sp[2]], fill=(12, 9, 16, 255), width=1)

    # Fiery glowing tips (top 8px of spikes)
    tips = [
        [(7, 4), (5, 10), (9, 10)],
        [(16, 1), (14, 8), (18, 8)],
        [(25, 6), (23, 12), (27, 12)]
    ]
    for tp in tips:
        draw.polygon(tp, fill=(255, 100, 0, 255))
        draw.line([(tp[0][0], tp[0][1]), (tp[0][0], tp[0][1] + 3)], fill=(255, 230, 120, 255), width=1)

    return img


def generate_gate_gold_closed():
    # 32x64 Gold Hoard Gate Closed (ornate gold bars & portcullis)
    w, h = 32, 64
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer golden frame (left/right posts & top arch)
    c_gold = (218, 165, 32, 255)
    c_gold_hi = (255, 223, 80, 255)
    c_gold_dark = (140, 95, 10, 255)

    # Left post (x: 0..3), Right post (x: 28..31)
    draw.rectangle([0, 0, 3, 63], fill=c_gold)
    draw.rectangle([28, 0, 31, 63], fill=c_gold)
    draw.line([(0, 0), (0, 63)], fill=c_gold_hi)
    draw.line([(3, 0), (3, 63)], fill=c_gold_dark)
    draw.line([(28, 0), (28, 63)], fill=c_gold_hi)
    draw.line([(31, 0), (31, 63)], fill=c_gold_dark)

    # Top beam (y: 0..5) and middle crossbeam (y: 30..33)
    draw.rectangle([0, 0, 31, 5], fill=c_gold)
    draw.line([(0, 0), (31, 0)], fill=c_gold_hi)
    draw.line([(0, 5), (31, 5)], fill=c_gold_dark)

    draw.rectangle([0, 30, 31, 33], fill=c_gold)
    draw.line([(0, 30), (31, 30)], fill=c_gold_hi)
    draw.line([(0, 33), (31, 33)], fill=c_gold_dark)

    # Vertical gold bars (at x = 7, 12, 17, 22)
    bar_x_list = [7, 12, 17, 22]
    for bx in bar_x_list:
        draw.rectangle([bx, 4, bx + 2, 58], fill=c_gold)
        draw.line([(bx, 4), (bx, 58)], fill=c_gold_hi)
        draw.line([(bx + 2, 4), (bx + 2, 58)], fill=c_gold_dark)
        
        # Bottom spike tips on bars
        draw.polygon([(bx, 58), (bx + 1, 63), (bx + 2, 58)], fill=c_gold_hi)

    # Decorative studs/rivets
    for bx in bar_x_list:
        draw.point((bx + 1, 31), (255, 255, 200, 255))
        draw.point((bx + 1, 2), (255, 255, 200, 255))

    return img


# --- MAIN BUILD AND PACKING PROCESS ---

def main():
    print("=== Generating Lava Biome Master Assets ===")

    asset_generators = [
        ("blk_lava_rock", generate_blk_lava_rock),
        ("blk_lava_glow_edge", generate_blk_lava_glow_edge),
        ("px_lava_far", generate_px_lava_far),
        ("px_lava_near_spire", generate_px_lava_near_spire),
        ("px_lava_near_crack", generate_px_lava_near_crack),
        ("trap_spikes_biome_lava", generate_trap_spikes_biome_lava),
        ("gate_gold_closed", generate_gate_gold_closed),
    ]

    processed_sprites = []

    for item_id, gen_fn in asset_generators:
        img = gen_fn()

        # Save raw master image in art_raw/tiles_lava/
        raw_path = os.path.join(RAW_LAVA_DIR, f"{item_id}.png")
        img.save(raw_path, "PNG")
        print(f"Saved raw master image: {raw_path} ({img.width}x{img.height})")

        # Background removal check (already transparent RGBA)
        clean_img = remove_background_chroma(img)
        processed_sprites.append((item_id, clean_img))

    # --- ATLAS PACKING ---
    # Shelf packing algorithm for variable-sized frames into standard Phaser 3 JSON Hash atlas
    print("\n=== Packing into Phaser 3 Atlas (atlas_tiles_lava) ===")

    # Calculate atlas dimensions (shelf packing)
    padding = 4
    current_x = padding
    current_y = padding
    shelf_h = 0
    max_w = 512

    placements = []
    
    # Sort items by height descending for optimal shelf placement
    sorted_sprites = sorted(processed_sprites, key=lambda s: s[1].height, reverse=True)

    for item_id, sprite in sorted_sprites:
        sw, sh = sprite.width, sprite.height
        if current_x + sw + padding > max_w:
            # Wrap to next row
            current_x = padding
            current_y += shelf_h + padding
            shelf_h = 0

        placements.append((item_id, sprite, current_x, current_y))
        current_x += sw + padding
        if sh > shelf_h:
            shelf_h = sh

    total_w = max_w
    total_h = current_y + shelf_h + padding

    # Make dimensions power of 2 or smooth multiple
    def next_pow2(n):
        return 1 << (n - 1).bit_length()

    sheet_w = next_pow2(total_w)
    sheet_h = next_pow2(total_h)

    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_dict = {}

    for item_id, sprite, px, py in placements:
        sw, sh = sprite.width, sprite.height
        atlas_img.paste(sprite, (px, py), sprite)

        frames_dict[item_id] = {
            "frame": {"x": px, "y": py, "w": sw, "h": sh},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": sw, "h": sh},
            "sourceSize": {"w": sw, "h": sh},
            "pivot": {"x": 0.5, "y": 0.5}
        }

    atlas_data = {
        "frames": frames_dict,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_tiles_lava.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }

    # Save outputs into client/public/assets/atlases/
    webp_path = os.path.join(PUBLIC_ATLAS_DIR, "atlas_tiles_lava.webp")
    png_path = os.path.join(PUBLIC_ATLAS_DIR, "atlas_tiles_lava.png")
    json_path = os.path.join(PUBLIC_ATLAS_DIR, "atlas_tiles_lava.json")

    atlas_img.save(webp_path, "WEBP", quality=95)
    atlas_img.save(png_path, "PNG")
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"Atlas texture saved: {webp_path}")
    print(f"Atlas JSON saved:    {json_path}")

    # --- UPDATE MANIFEST.JSON ---
    print("\n=== Updating client/public/assets/manifest.json ===")
    manifest_path = "client/public/assets/manifest.json"
    with open(manifest_path, "r") as f:
        manifest = json.load(f)

    # Check if atlas_tiles_lava already in atlases list
    existing_keys = [a.get("key") for a in manifest.get("atlases", [])]
    if "atlas_tiles_lava" not in existing_keys:
        manifest["atlases"].append({
            "key": "atlas_tiles_lava",
            "texture": "assets/atlases/atlas_tiles_lava.webp",
            "atlas": "assets/atlases/atlas_tiles_lava.json"
        })
        with open(manifest_path, "w") as f:
            json.dump(manifest, f, indent=2)
        print("Successfully added atlas_tiles_lava to manifest.json")
    else:
        print("atlas_tiles_lava is already present in manifest.json")

if __name__ == "__main__":
    main()
