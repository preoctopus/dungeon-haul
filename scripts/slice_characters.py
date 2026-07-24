import os
import shutil
import numpy as np
from collections import deque
from PIL import Image
from asset_processor import create_phaser_atlas

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

# Exact 1024x1024 sheet Y ranges & column configurations
anim_rows = [
    (45, 250, [("idle", 4)]),
    (295, 500, [("run", 6)]),
    (545, 750, [("jump", 3), ("duck", 2)]),
    (795, 1000, [("hurt", 3), ("stunned", 4)])
]

def remove_outer_background(crop_img):
    """
    Flood-fill background removal that strips both white outer canvas (R>210, G>210, B>210)
    AND dark grid boxes/lines (R<55, G<55, B<65) connected to the outer boundary,
    preserving character pixel colors, outlines, and body intact.
    """
    crop = crop_img.convert("RGBA")
    arr = np.array(crop)
    h, w, _ = arr.shape

    bg_mask = np.zeros((h, w), dtype=bool)
    for y in range(h):
        for x in range(w):
            r, g, b, _ = arr[y, x]
            if (r > 210 and g > 210 and b > 210) or (r < 55 and g < 55 and b < 65):
                bg_mask[y, x] = True

    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    for x in range(w):
        if bg_mask[0, x]:
            queue.append((0, x))
            visited[0, x] = True
        if bg_mask[h - 1, x]:
            queue.append((h - 1, x))
            visited[h - 1, x] = True
    for y in range(h):
        if bg_mask[y, 0]:
            queue.append((y, 0))
            visited[y, 0] = True
        if bg_mask[y, w - 1]:
            queue.append((y, w - 1))
            visited[y, w - 1] = True

    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                if bg_mask[ny, nx]:
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    for y in range(h):
        for x in range(w):
            if visited[y, x]:
                arr[y, x] = [0, 0, 0, 0]

    return Image.fromarray(arr)

for char_name, src_path in chars:
    if not os.path.exists(src_path):
        continue

    raw_master = os.path.join(RAW_DIR, f"{char_name}_master_1024.jpg")
    shutil.copyfile(src_path, raw_master)
    print(f"Processing master: {src_path}")

    img = Image.open(src_path)
    char_sprites = []

    for y_min, y_max, anim_list in anim_rows:
        total_cols = sum(fc for _, fc in anim_list)
        col_w = img.width / total_cols

        col_idx = 0
        for anim_name, frame_count in anim_list:
            for f in range(frame_count):
                x_min = int(col_idx * col_w)
                x_max = int((col_idx + 1) * col_w)

                cell = img.crop((x_min, y_min, x_max, y_max))
                cleaned = remove_outer_background(cell)

                frame_id = f"char_{char_name}_{anim_name}_{f}"

                # Trim bounding box around non-transparent character pixels
                bbox = cleaned.getbbox()
                if bbox:
                    trimmed = cleaned.crop(bbox)
                else:
                    trimmed = cleaned

                w_trim, h_trim = trimmed.size

                # Scale character smoothly while preserving aspect ratio (max 40x42 inside 48x48)
                scale = min(38.0 / max(w_trim, 1), 42.0 / max(h_trim, 1))
                w_new = max(1, int(w_trim * scale))
                h_new = max(1, int(h_trim * scale))

                scaled = trimmed.resize((w_new, h_new), Image.Resampling.LANCZOS)

                # Center character: feet anchored at y=44, centered horizontally at x=24
                resized = Image.new("RGBA", (48, 48), (0, 0, 0, 0))
                off_x = (48 - w_new) // 2
                off_y = 44 - h_new  # Align feet to baseline y=44

                resized.paste(scaled, (off_x, off_y), scaled)

                char_sprites.append((frame_id, resized))
                col_idx += 1

    create_phaser_atlas(
        sprite_list=char_sprites,
        output_name=f"char_{char_name}",
        output_dir=PUBLIC_DIR,
        max_cols=6,
        cell_size=(48, 48)
    )

print("\n--- All 4 Character Atlases Cleaned & Re-Processed! ---")
