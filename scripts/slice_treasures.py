import os
import shutil
import json
from PIL import Image
from asset_processor import remove_background_chroma, create_phaser_atlas

# 1. Preserve high-quality original in raw folder
RAW_DIR = "art_raw/treasures"
PUBLIC_DIR = "client/public/assets/atlases"
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

src_path = "docs/art/preview/treasures_and_chests_1784606181188.jpg"
raw_master = os.path.join(RAW_DIR, "treasures_master_1024.jpg")
shutil.copyfile(src_path, raw_master)

print(f"Preserved high-quality original at {raw_master}")

# Load master
img = Image.open(src_path)
width, height = img.size

# Grid dimensions (5x5)
cols, rows = 5, 5
cell_w = width / cols
cell_h = height / rows

# P0 Treasure IDs according to docs/art/ASSET-INVENTORY.md
item_ids = [
    # Row 0
    "tre_coin_sack", "tre_big_coin_sack", "tre_brass_watch", "tre_gold_watch", "tre_stone_icon",
    # Row 1
    "tre_bronze_icon", "tre_gemstone_ruby", "tre_gemstone_emerald", "tre_crown", "tre_wooden_chest_closed",
    # Row 2
    "tre_wooden_chest_open", "tre_silver_chest_closed", "tre_gold_chest_closed", "tre_goat_icon", "tre_nes_cartridge",
    # Row 3
    "tre_crystal_skull", "tre_magic_scepter", "tre_set_armor_helmet", "tre_set_armor_breastplate", "tre_set_armor_gauntlets",
    # Row 4
    "tre_crystal_skull_blue", "tre_gold_scepter", "tre_set_armor_helmet_alt", "tre_set_armor_breastplate_alt", "tre_set_armor_greaves"
]

sprites_32 = []
raw_sprites = []

for idx, item_id in enumerate(item_ids):
    c = idx % cols
    r = idx // cols
    
    left = int(c * cell_w)
    top = int(r * cell_h)
    right = int((c + 1) * cell_w)
    bottom = int((r + 1) * cell_h)

    box = (left, top, right, bottom)
    crop_img = img.crop(box)
    
    # Remove light background
    # Background color in the preview is approximately light blue-gray (225, 230, 235)
    rgba_img = remove_background_chroma(crop_img, bg_color=(230, 232, 236), tolerance=35)

    # Save high-quality cropped PNG in art_raw
    raw_item_path = os.path.join(RAW_DIR, f"{item_id}_raw.png")
    rgba_img.save(raw_item_path, "PNG")
    raw_sprites.append(raw_item_path)

    # Scale down to 32x32 for game resolution while maintaining aspect ratio
    resized_sprite = Image.new("RGBA", (32, 32), (0, 0, 0, 0))
    # Aspect fit inside 32x32
    w_orig, h_orig = rgba_img.size
    scale = min(30.0 / w_orig, 30.0 / h_orig)
    w_new = int(w_orig * scale)
    h_new = int(h_orig * scale)
    
    scaled = rgba_img.resize((w_new, h_new), Image.Resampling.LANCZOS)
    
    # Center inside 32x32
    off_x = (32 - w_new) // 2
    off_y = (32 - h_new) // 2
    resized_sprite.paste(scaled, (off_x, off_y), scaled)

    sprites_32.append((item_id, resized_sprite))

# Pack into Phaser 3 atlas
create_phaser_atlas(
    sprite_list=sprites_32,
    output_name="atlas_treasures",
    output_dir=PUBLIC_DIR,
    max_cols=8,
    cell_size=(32, 32)
)

print("\n--- Treasure Atlas Processing Complete! ---")
