import os
import shutil
from PIL import Image
from asset_processor import remove_background_chroma, create_phaser_atlas

RAW_DIR = "art_raw/characters"
PUBLIC_DIR = "client/public/assets/atlases"
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

chars = [
    ("gnome", "docs/art/preview/gnome_sprite_sheet_1784605988611.jpg"),
    ("sprite", "docs/art/preview/sprite_character_sheet_1784606136069.jpg"),
    ("halfling", "docs/art/preview/halfling_character_sheet_1784606150621.jpg"),
    ("dwarf", "docs/art/preview/dwarf_character_sheet_1784606165897.jpg")
]

# Layout specs for 4 rows in 1024x1024 sheets
# Row 0: Idle (4 frames) - y range ~ 80..240
# Row 1: Run (6 frames) - y range ~ 310..470
# Row 2: Jump (3 f) + Duck (2 f) - y range ~ 540..700
# Row 3: Hurt (3 f) + Stunned (4 f) - y range ~ 770..930

anim_rows = [
    # (row_index, y_min, y_max, [(anim_name, frame_count), ...])
    (0, 80, 240, [("idle", 4)]),
    (1, 310, 470, [("run", 6)]),
    (2, 540, 700, [("jump", 3), ("duck", 2)]),
    (3, 770, 930, [("hurt", 3), ("stunned", 4)])
]

for char_name, src_path in chars:
    if not os.path.exists(src_path):
        continue
        
    raw_master = os.path.join(RAW_DIR, f"{char_name}_master_1024.jpg")
    shutil.copyfile(src_path, raw_master)
    print(f"Preserved master: {raw_master}")

    img = Image.open(src_path)
    width, height = img.size

    char_sprites = []

    for row_idx, y_min, y_max, anim_list in anim_rows:
        total_frames_in_row = sum(fc for _, fc in anim_list)
        # Grid width approximately spans 50..950
        x_start = 20
        x_end = 980
        cell_width = (x_end - x_start) / 7.5 # up to 7-8 cells per row

        cur_frame_idx = 0
        for anim_name, frame_count in anim_list:
            for f in range(frame_count):
                x_min = int(x_start + (cur_frame_idx) * cell_width)
                x_max = int(x_start + (cur_frame_idx + 1) * cell_width)
                box = (x_min, y_min, x_max, y_max)
                
                crop_img = img.crop(box)
                rgba_img = remove_background_chroma(crop_img, bg_color=(255, 255, 255), tolerance=25)

                frame_id = f"char_{char_name}_{anim_name}_{f}"
                
                # Save raw frame
                raw_frame_path = os.path.join(RAW_DIR, f"{frame_id}_raw.png")
                rgba_img.save(raw_frame_path, "PNG")

                # Resize to standard 48x48
                resized = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
                w_orig, h_orig = rgba_img.size
                scale = min(44.0 / w_orig, 44.0 / h_orig)
                w_new = int(w_orig * scale)
                h_new = int(h_orig * scale)

                scaled = rgba_img.resize((w_new, h_new), Image.Resampling.LANCZOS)
                off_x = (48 - w_new) // 2
                off_y = (48 - h_new) // 2
                resized.paste(scaled, (off_x, off_y), scaled)

                char_sprites.append((frame_id, resized))
                cur_frame_idx += 1

    create_phaser_atlas(
        sprite_list=char_sprites,
        output_name=f"char_{char_name}",
        output_dir=PUBLIC_DIR,
        max_cols=6,
        cell_size=(48, 48)
    )

print("\n--- Character Atlases Processing Complete! ---")
