import json
import os
from PIL import Image, ImageChops

def remove_background_chroma(img, bg_color=None, tolerance=30):
    """
    Removes background color from image using corner sampling or specified bg_color.
    Returns RGBA image with transparent background.
    """
    img = img.convert("RGBA")
    if bg_color is None:
        # Sample corners to determine background color
        corners = [
            img.getpixel((0, 0)),
            img.getpixel((img.width - 1, 0)),
            img.getpixel((0, img.height - 1)),
            img.getpixel((img.width - 1, img.height - 1))
        ]
        # Average color of top-left corner
        bg_color = corners[0][:3]
    
    datas = img.getdata()
    new_data = []
    r_bg, g_bg, b_bg = bg_color[:3]

    for item in datas:
        r, g, b, a = item
        # Distance calculation
        dist = ((r - r_bg)**2 + (g - g_bg)**2 + (b - b_bg)**2) ** 0.5
        if dist < tolerance:
            new_data.append((0, 0, 0, 0))
        elif dist < tolerance * 1.5:
            # Soft edge alpha blending
            alpha = int(255 * ((dist - tolerance) / (tolerance * 0.5)))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    return img

def create_phaser_atlas(sprite_list, output_name, output_dir, max_cols=8, cell_size=(32, 32)):
    """
    Takes a list of tuples [(frame_id, PIL_Image_or_path), ...]
    Packs them into a grid sheet, exports WebP/PNG and Phaser 3 JSON Hash Atlas.
    """
    os.makedirs(output_dir, exist_ok=True)
    count = len(sprite_list)
    cols = min(count, max_cols)
    rows = (count + cols - 1) // cols

    cell_w, cell_h = cell_size
    sheet_w = cols * cell_w
    sheet_h = rows * cell_h

    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_json = {}

    for idx, (frame_id, sprite) in enumerate(sprite_list):
        if isinstance(sprite, str):
            sprite = Image.open(sprite)
        
        sprite_w, sprite_h = sprite.size
        
        # Center in cell
        col = idx % cols
        row = idx // cols
        x = col * cell_w + (cell_w - sprite_w) // 2
        y = row * cell_h + (cell_h - sprite_h) // 2
        
        atlas_img.paste(sprite, (x, y), sprite if sprite.mode == "RGBA" else None)

        frames_json[frame_id] = {
            "frame": {"x": x, "y": y, "w": sprite_w, "h": sprite_h},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": sprite_w, "h": sprite_h},
            "sourceSize": {"w": cell_w, "h": cell_h},
            "pivot": {"x": 0.5, "y": 0.5}
        }

    atlas_data = {
        "frames": frames_json,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": f"{output_name}.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }

    # Save outputs
    webp_path = os.path.join(output_dir, f"{output_name}.webp")
    png_path = os.path.join(output_dir, f"{output_name}.png")
    json_path = os.path.join(output_dir, f"{output_name}.json")

    atlas_img.save(webp_path, "WEBP", quality=90)
    atlas_img.save(png_path, "PNG")
    
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"Successfully generated texture atlas: {output_name}")
    print(f"  WebP: {webp_path}")
    print(f"  JSON: {json_path}")

if __name__ == "__main__":
    print("Asset Processor Ready.")
