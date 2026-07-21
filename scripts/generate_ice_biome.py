import os
import json
from PIL import Image, ImageDraw, ImageFilter, ImageChops

# Directories
RAW_ICE_DIR = "art_raw/tiles_ice"
ATLAS_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_ICE_DIR, exist_ok=True)
os.makedirs(ATLAS_DIR, exist_ok=True)

print("Generating Ice Biome Master Raw Images...")

# --- 1. blk_ice_crack (32x32) ---
def generate_blk_ice_crack():
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Base ice block
    draw.rectangle([4, 4, 59, 59], fill=(180, 225, 248, 255), outline=(24, 48, 80, 255), width=3)
    
    # Top & Left bevel highlight
    draw.line([(6, 6), (57, 6)], fill=(235, 250, 255, 255), width=3)
    draw.line([(6, 6), (6, 57)], fill=(235, 250, 255, 255), width=3)
    
    # Bottom & Right shadow
    draw.line([(6, 57), (57, 57)], fill=(80, 130, 175, 255), width=3)
    draw.line([(57, 6), (57, 57)], fill=(80, 130, 175, 255), width=3)
    
    # Dark blue crack lines
    crack_color = (24, 48, 80, 255)
    draw.line([(20, 8), (28, 24)], fill=crack_color, width=2)
    draw.line([(28, 24), (22, 38)], fill=crack_color, width=2)
    draw.line([(28, 24), (44, 30)], fill=crack_color, width=2)
    draw.line([(44, 30), (52, 22)], fill=crack_color, width=2)
    draw.line([(44, 30), (48, 48)], fill=crack_color, width=2)
    draw.line([(22, 38), (14, 52)], fill=crack_color, width=2)
    
    # Inner specular glints
    draw.rectangle([12, 12, 16, 16], fill=(255, 255, 255, 220))
    draw.rectangle([36, 14, 38, 16], fill=(255, 255, 255, 200))
    
    # Resize to target 32x32
    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "blk_ice_crack_raw.png"))
    return img_32

# --- 2. px_ice_far (960x540) ---
def generate_px_ice_far():
    w, h = 960, 540
    img = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(img)
    
    # Vertical sky gradient: Pale cyan to deeper ice blue
    for y in range(h):
        r = int(200 - (y / h) * 90)
        g = int(232 - (y / h) * 70)
        b = int(248 - (y / h) * 40)
        draw.line([(0, y), (w, y)], fill=(r, g, b, 255))
        
    # Layer 1: Distant ice mountain peaks (softest)
    mountains_1 = [(0, 320), (120, 220), (220, 290), (350, 180), (480, 300), (620, 200), (760, 280), (880, 190), (960, 260), (960, 540), (0, 540)]
    draw.polygon(mountains_1, fill=(155, 195, 225, 255))
    
    # Layer 2: Mid-distance icy crags
    mountains_2 = [(0, 380), (90, 310), (200, 370), (310, 260), (420, 350), (550, 270), (690, 360), (820, 280), (960, 340), (960, 540), (0, 540)]
    draw.polygon(mountains_2, fill=(110, 160, 198, 255))
    
    # Layer 3: Closer dark ice cavern silhouettes & icy ground
    mountains_3 = [(0, 440), (140, 370), (260, 420), (400, 340), (520, 410), (660, 330), (790, 400), (910, 350), (960, 390), (960, 540), (0, 540)]
    draw.polygon(mountains_3, fill=(65, 115, 155, 255))
    
    # Aurora overlay glow band
    aurora = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    aurora_draw = ImageDraw.Draw(aurora)
    aurora_points = [(0, 80), (200, 140), (450, 90), (700, 160), (960, 100), (960, 180), (700, 240), (450, 160), (200, 220), (0, 160)]
    aurora_draw.polygon(aurora_points, fill=(160, 245, 230, 90))
    aurora = aurora.filter(ImageFilter.GaussianBlur(15))
    img.paste(aurora, (0, 0), aurora)
    
    img.save(os.path.join(RAW_ICE_DIR, "px_ice_far_raw.png"))
    return img

# --- 3. px_ice_near_icicle (32x96) ---
def generate_px_ice_near_icicle():
    w, h = 64, 192
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Rock ceiling mount
    draw.polygon([(4, 0), (60, 0), (52, 24), (12, 20)], fill=(40, 56, 72, 255), outline=(20, 30, 45, 255))
    
    # Main center Icicle
    icicle_main = [(18, 16), (46, 16), (40, 80), (34, 175), (28, 80)]
    draw.polygon(icicle_main, fill=(215, 245, 255, 240), outline=(24, 48, 80, 255))
    draw.line([(24, 18), (32, 170)], fill=(255, 255, 255, 255), width=3) # specular highlight
    draw.polygon([(32, 16), (46, 16), (40, 80), (34, 175)], fill=(110, 175, 220, 180)) # shadow side
    
    # Left smaller icicle
    icicle_left = [(8, 18), (22, 18), (18, 95), (14, 18)]
    draw.polygon(icicle_left, fill=(190, 235, 255, 230), outline=(24, 48, 80, 255))
    
    # Right smaller icicle
    icicle_right = [(42, 18), (56, 18), (50, 120), (44, 18)]
    draw.polygon(icicle_right, fill=(190, 235, 255, 230), outline=(24, 48, 80, 255))
    
    img_target = img.resize((32, 96), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "px_ice_near_icicle_raw.png"))
    return img_target

# --- 4. px_ice_near_crystal (64x64) ---
def generate_px_ice_near_crystal():
    w, h = 128, 128
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark rock base
    draw.ellipse([20, 95, 108, 125], fill=(40, 56, 72, 255), outline=(20, 30, 45, 255))
    
    # Crystal 1: Center tall crystal
    c1 = [(64, 10), (84, 45), (76, 105), (52, 105), (44, 45)]
    draw.polygon(c1, fill=(160, 230, 255, 240), outline=(24, 48, 80, 255))
    draw.polygon([(64, 10), (84, 45), (76, 105), (64, 105)], fill=(80, 150, 200, 200)) # shadow facet
    draw.line([(64, 10), (52, 45), (52, 105)], fill=(255, 255, 255, 255), width=3) # highlight edge
    
    # Crystal 2: Left angled crystal
    c2 = [(22, 35), (46, 55), (48, 105), (28, 105), (14, 60)]
    draw.polygon(c2, fill=(130, 210, 245, 240), outline=(24, 48, 80, 255))
    draw.polygon([(22, 35), (46, 55), (48, 105), (35, 105)], fill=(65, 130, 180, 200))
    
    # Crystal 3: Right angled crystal
    c3 = [(106, 40), (114, 65), (96, 108), (76, 108), (86, 55)]
    draw.polygon(c3, fill=(180, 240, 255, 240), outline=(24, 48, 80, 255))
    draw.polygon([(106, 40), (114, 65), (96, 108), (90, 108)], fill=(90, 160, 210, 200))
    
    img_target = img.resize((64, 64), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "px_ice_near_crystal_raw.png"))
    return img_target

# --- 5. px_ice_near_pillar (48x256) ---
def generate_px_ice_near_pillar():
    w, h = 96, 512
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Main ice pillar body
    pillar_pts = [(16, 0), (80, 0), (88, 40), (78, 160), (86, 320), (76, 480), (88, 512), (8, 512), (18, 480), (10, 320), (20, 160), (8, 40)]
    draw.polygon(pillar_pts, fill=(170, 225, 250, 240), outline=(24, 48, 80, 255))
    
    # Vertical facet lines & shading
    draw.line([(36, 0), (40, 512)], fill=(245, 255, 255, 255), width=4) # main highlight ridge
    draw.polygon([(40, 0), (80, 0), (88, 40), (78, 160), (86, 320), (76, 480), (88, 512), (40, 512)], fill=(90, 155, 205, 150)) # shaded right half
    
    # Frost & ice notches
    for y_notch in range(60, 480, 80):
        draw.line([(12, y_notch), (36, y_notch + 15)], fill=(24, 48, 80, 200), width=3)
        draw.line([(40, y_notch + 20), (82, y_notch + 35)], fill=(24, 48, 80, 200), width=3)
        
    img_target = img.resize((48, 256), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "px_ice_near_pillar_raw.png"))
    return img_target

# --- 6. px_ice_fore_frost (64x64) ---
def generate_px_ice_fore_frost():
    w, h = 128, 128
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Frost crystal overlay crawling from top & left edges
    draw.polygon([(0, 0), (128, 0), (90, 25), (40, 45), (15, 100), (0, 128)], fill=(225, 248, 255, 220))
    
    # Crystal branches / needles
    needles = [
        [(40, 45), (65, 75), (55, 78)],
        [(90, 25), (115, 50), (105, 55)],
        [(15, 100), (45, 115), (38, 120)],
        [(60, 20), (85, 45), (75, 48)]
    ]
    for n in needles:
        draw.polygon(n, fill=(180, 235, 255, 240), outline=(40, 90, 140, 255))
        
    # Highlights
    draw.line([(0, 0), (90, 25)], fill=(255, 255, 255, 255), width=3)
    draw.line([(0, 0), (15, 100)], fill=(255, 255, 255, 255), width=3)
    
    img_target = img.resize((64, 64), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "px_ice_fore_frost_raw.png"))
    return img_target

# --- 7. trap_spikes_biome_ice (32x32) ---
def generate_trap_spikes_biome_ice():
    w, h = 64, 64
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Dark ice-rock base (bottom 16px)
    draw.rectangle([4, 48, 59, 63], fill=(35, 52, 70, 255), outline=(20, 30, 45, 255), width=2)
    
    # 4 Sharp crystalline ice spikes
    spikes = [
        [(8, 48), (16, 8), (24, 48)],
        [(20, 48), (32, 2), (40, 48)],
        [(36, 48), (46, 12), (52, 48)],
        [(48, 48), (56, 22), (60, 48)]
    ]
    
    for spike in spikes:
        draw.polygon(spike, fill=(200, 242, 255, 245), outline=(24, 48, 80, 255))
        # Highlight edge
        p1, p2, p3 = spike
        draw.line([p1, p2], fill=(255, 255, 255, 255), width=2)
        # Shadow side
        draw.polygon([p2, p3, ((p2[0]+p3[0])//2, (p2[1]+p3[1])//2)], fill=(90, 160, 210, 180))
        
    img_32 = img.resize((32, 32), Image.Resampling.LANCZOS)
    img.save(os.path.join(RAW_ICE_DIR, "trap_spikes_biome_ice_raw.png"))
    return img_32

# Generate all master images & scaled sprite objects
sprites = {
    "blk_ice_crack": generate_blk_ice_crack(),
    "px_ice_far": generate_px_ice_far(),
    "px_ice_near_icicle": generate_px_ice_near_icicle(),
    "px_ice_near_crystal": generate_px_ice_near_crystal(),
    "px_ice_near_pillar": generate_px_ice_near_pillar(),
    "px_ice_fore_frost": generate_px_ice_fore_frost(),
    "trap_spikes_biome_ice": generate_trap_spikes_biome_ice(),
}

# --- Atlas Packing ---
# Layout items onto a 1024x1024 power-of-two canvas (ASSET-INVENTORY.md section 9)
atlas_w, atlas_h = 1024, 1024
atlas_img = Image.new("RGBA", (atlas_w, atlas_h), (0, 0, 0, 0))

placements = {
    "px_ice_far": (0, 0),
    "px_ice_near_pillar": (0, 544),
    "px_ice_near_icicle": (56, 544),
    "px_ice_near_crystal": (96, 544),
    "px_ice_fore_frost": (168, 544),
    "blk_ice_crack": (240, 544),
    "trap_spikes_biome_ice": (280, 544),
}

frames_json = {}

for key, sprite in sprites.items():
    x, y = placements[key]
    sw, sh = sprite.size
    atlas_img.paste(sprite, (x, y), sprite if sprite.mode == "RGBA" else None)
    
    frames_json[key] = {
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
        "image": "atlas_tiles_ice.webp",
        "format": "RGBA8888",
        "size": {"w": atlas_w, "h": atlas_h},
        "scale": "1"
    }
}

# Save WebP, PNG, JSON
webp_path = os.path.join(ATLAS_DIR, "atlas_tiles_ice.webp")
png_path = os.path.join(ATLAS_DIR, "atlas_tiles_ice.png")
json_path = os.path.join(ATLAS_DIR, "atlas_tiles_ice.json")

atlas_img.save(webp_path, "WEBP", quality=90)
atlas_img.save(png_path, "PNG")

with open(json_path, "w") as f:
    json.dump(atlas_data, f, indent=2)

print(f"Atlas created successfully:")
print(f"  WebP: {webp_path}")
print(f"  PNG:  {png_path}")
print(f"  JSON: {json_path}")

# --- Update Manifest ---
with open(MANIFEST_PATH, "r") as f:
    manifest = json.load(f)

# Check if atlas_tiles_ice is already in manifest
existing_keys = [a["key"] for a in manifest.get("atlases", [])]
if "atlas_tiles_ice" not in existing_keys:
    manifest["atlases"].append({
        "key": "atlas_tiles_ice",
        "texture": "assets/atlases/atlas_tiles_ice.webp",
        "atlas": "assets/atlases/atlas_tiles_ice.json"
    })
    with open(MANIFEST_PATH, "w") as f:
        json.dump(manifest, f, indent=2)
    print("Updated client/public/assets/manifest.json with atlas_tiles_ice!")
else:
    print("atlas_tiles_ice already present in manifest.json.")

print("Ice Biome Asset Processing Complete!")
