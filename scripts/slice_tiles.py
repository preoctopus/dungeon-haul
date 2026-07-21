import os
import shutil
from PIL import Image
from asset_processor import remove_background_chroma, create_phaser_atlas

RAW_DIR = "art_raw/tiles"
PUBLIC_DIR = "client/public/assets/atlases"
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

src_path = "docs/art/preview/world_tiles_and_traps_1784606198126.jpg"
raw_master = os.path.join(RAW_DIR, "tiles_master_1024.jpg")
shutil.copyfile(src_path, raw_master)

print(f"Preserved high-quality original at {raw_master}")

img = Image.open(src_path)

# Tile definitions based on visual regions in world_tiles_and_traps_1784606198126.jpg
# 4 main horizontal sections:
# Section 1: Tilesets (top 260px) -> Grey Dungeon Brick, Dirt/Grass, Gold Hoard, Slick Ice
# Section 2: Mechanical Switches (y: 260..430px) -> Red Button Up/Pressed, Heavy Switch Up/Pressed
# Section 3: Doors & Gates (y: 430..720px) -> Iron Portcullis Closed/Open, Closed Door, Glowing Exit
# Section 4: Traps (y: 720..1024px) -> Sharp Spikes, Crumbling Brick/Break, Receding Block, Tesla Coil

tiles_def = [
    # Category, ID, Crop Box (left, top, right, bottom), Target cell size (w, h), bg_color
    ("blk_brick_dungeon", (30, 40, 220, 230), (32, 32), (235, 238, 240)),
    ("blk_brick_outside", (260, 40, 450, 230), (32, 32), (235, 238, 240)),
    ("blk_brick_gold", (490, 40, 680, 230), (32, 32), (235, 238, 240)),
    ("blk_ice", (720, 40, 910, 230), (32, 32), (235, 238, 240)),

    # Switches
    ("sw_switch_up", (75, 310, 195, 430), (32, 32), (235, 238, 240)),
    ("sw_switch_down", (315, 310, 435, 430), (32, 32), (235, 238, 240)),
    ("sw_heavy_up", (560, 310, 700, 430), (40, 32), (235, 238, 240)),
    ("sw_heavy_down", (805, 310, 945, 430), (40, 32), (235, 238, 240)),

    # Gates & Doors (2 tall: 32x64)
    ("gate_iron_closed", (40, 520, 210, 740), (32, 64), (235, 238, 240)),
    ("gate_iron_open", (280, 520, 450, 740), (32, 64), (235, 238, 240)),
    ("door_closed", (530, 520, 700, 740), (32, 64), (235, 238, 240)),
    ("blk_exit_banner", (780, 520, 950, 740), (32, 64), (235, 238, 240)),

    # Traps
    ("trap_spikes_idle", (40, 830, 160, 960), (32, 32), (235, 238, 240)),
    ("trap_spikes_retracted", (170, 830, 290, 960), (32, 32), (235, 238, 240)),
    ("trap_crumble_idle", (300, 830, 420, 960), (32, 32), (235, 238, 240)),
    ("trap_crumble_break", (430, 830, 550, 960), (32, 32), (235, 238, 240)),
    ("trap_recede_idle", (560, 830, 680, 960), (32, 32), (235, 238, 240)),
    ("trap_recede_out", (690, 830, 810, 960), (32, 32), (235, 238, 240)),
    ("trap_lightning_emitter", (820, 830, 950, 960), (32, 32), (235, 238, 240))
]

sprites_list = []

for tile_id, crop_box, (cell_w, cell_h), bg_color in tiles_def:
    crop_img = img.crop(crop_box)
    rgba_img = remove_background_chroma(crop_img, bg_color=bg_color, tolerance=30)
    
    # Save high-res original
    raw_item_path = os.path.join(RAW_DIR, f"{tile_id}_raw.png")
    rgba_img.save(raw_item_path, "PNG")

    # Scale to game size
    resized = Image.new("RGBA", (cell_w, cell_h), (0, 0, 0, 0))
    w_orig, h_orig = rgba_img.size
    scale = min(float(cell_w) / w_orig, float(cell_h) / h_orig)
    w_new = int(w_orig * scale)
    h_new = int(h_orig * scale)
    
    scaled = rgba_img.resize((w_new, h_new), Image.Resampling.LANCZOS)
    off_x = (cell_w - w_new) // 2
    off_y = (cell_h - h_new) // 2
    resized.paste(scaled, (off_x, off_y), scaled)

    sprites_list.append((tile_id, resized))

# Pack into Phaser 3 atlas
create_phaser_atlas(
    sprite_list=sprites_list,
    output_name="atlas_tiles_mvp",
    output_dir=PUBLIC_DIR,
    max_cols=6,
    cell_size=(40, 64) # Accommodate door heights up to 64px
)

print("\n--- Tiles MVP Atlas Processing Complete! ---")
