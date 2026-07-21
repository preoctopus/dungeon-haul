import os
import shutil
from PIL import Image

RAW_DIR = "art_raw/ui"
PUBLIC_IMG_DIR = "client/public/assets/images"
os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_IMG_DIR, exist_ok=True)

screens = [
    ("bg_title", "docs/art/preview/title_screen_art_1784605975053.jpg"),
    ("bg_hoard", "docs/art/preview/gameplay_hoard_room_1784606344537.jpg"),
    ("bg_dungeon", "docs/art/preview/gameplay_dungeon_level_1784606326370.jpg"),
    ("bg_fork", "docs/art/preview/gameplay_fork_screen_1784606363655.jpg"),
    ("ui_end_scoring", "docs/art/preview/ui_end_scoring_screen_1784606213891.jpg"),
    ("ui_instructions_hs", "docs/art/preview/ui_instructions_highscores_1784606230270.jpg")
]

for name, src_path in screens:
    if not os.path.exists(src_path):
        continue

    # Preserve raw master
    raw_path = os.path.join(RAW_DIR, f"{name}_master.jpg")
    shutil.copyfile(src_path, raw_path)

    # Convert & resize to 960x540 (game logical resolution)
    img = Image.open(src_path).convert("RGB")
    resized = img.resize((960, 540), Image.Resampling.LANCZOS)

    # Save high quality PNG in raw
    png_raw = os.path.join(RAW_DIR, f"{name}_960x540.png")
    resized.save(png_raw, "PNG")

    # Export compressed WebP to client public folder
    webp_path = os.path.join(PUBLIC_IMG_DIR, f"{name}.webp")
    resized.save(webp_path, "WEBP", quality=85)

    print(f"Processed screen: {name}")
    print(f"  Raw: {raw_path}")
    print(f"  WebP: {webp_path}")

print("\n--- Screen & Background Processing Complete! ---")
