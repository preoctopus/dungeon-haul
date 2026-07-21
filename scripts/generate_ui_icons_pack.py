import os
import json
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from asset_processor import remove_background_chroma

RAW_DIR = "art_raw/ui_icons"
PUBLIC_DIR = "client/public/assets/atlases"
MANIFEST_PATH = "client/public/assets/manifest.json"

os.makedirs(RAW_DIR, exist_ok=True)
os.makedirs(PUBLIC_DIR, exist_ok=True)

CHROMA_BG = (235, 238, 240, 255)

def create_raw_canvas(w, h):
    return Image.new("RGBA", (w, h), CHROMA_BG)

# 1. ui_instr_dpad (48x48)
def gen_ui_instr_dpad():
    w, h = 48, 48
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)
    
    # D-Pad Cross geometry
    # Body colors
    c_pad = (35, 38, 44, 255)
    c_pad_light = (70, 75, 88, 255)
    c_border = (15, 17, 22, 255)
    c_arrow = (210, 225, 240, 255)
    c_arrow_shadow = (100, 115, 130, 255)

    # Vertical bar: x: 17..31 (w:14), y: 4..44 (h:40)
    # Horizontal bar: x: 4..44 (w:40), y: 17..31 (h:14)
    # Outer dark border
    draw.rectangle([16, 3, 31, 44], fill=c_border)
    draw.rectangle([3, 16, 44, 31], fill=c_border)

    # Inner D-Pad body
    draw.rectangle([17, 4, 30, 43], fill=c_pad)
    draw.rectangle([4, 17, 43, 30], fill=c_pad)

    # Bevel highlights on top/left edges
    draw.line([(18, 5), (29, 5)], fill=c_pad_light, width=1)
    draw.line([(5, 18), (17, 18)], fill=c_pad_light, width=1)
    draw.line([(30, 18), (42, 18)], fill=c_pad_light, width=1)
    draw.line([(18, 5), (18, 17)], fill=c_pad_light, width=1)
    draw.line([(5, 18), (5, 29)], fill=c_pad_light, width=1)

    # Center circle pivot recess
    draw.ellipse([20, 20, 27, 27], fill=(22, 24, 28, 255), outline=(12, 14, 16, 255))

    # Directional Arrows
    # UP Arrow
    draw.polygon([(24, 7), (19, 13), (29, 13)], fill=c_arrow)
    draw.line([(19, 14), (29, 14)], fill=c_arrow_shadow)
    # DOWN Arrow
    draw.polygon([(24, 40), (19, 34), (29, 34)], fill=c_arrow)
    draw.line([(19, 34), (29, 34)], fill=c_arrow_shadow)
    # LEFT Arrow
    draw.polygon([(7, 24), (13, 19), (13, 29)], fill=c_arrow)
    draw.line([(14, 19), (14, 29)], fill=c_arrow_shadow)
    # RIGHT Arrow
    draw.polygon([(40, 24), (34, 19), (34, 29)], fill=c_arrow)
    draw.line([(34, 19), (34, 29)], fill=c_arrow_shadow)

    return img

# 2. ui_instr_btn_a (32x32)
def gen_ui_instr_btn_a():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Outer border & shadow
    draw.ellipse([1, 2, 30, 31], fill=(25, 10, 12, 255))
    draw.ellipse([1, 1, 30, 30], fill=(50, 12, 16, 255))

    # Main red button body
    draw.ellipse([3, 3, 28, 28], fill=(215, 35, 45, 255))
    draw.ellipse([4, 4, 27, 27], fill=(235, 55, 65, 255))

    # Top-left specular highlight curve
    draw.arc([5, 5, 26, 26], start=190, end=300, fill=(255, 170, 175, 255), width=2)

    # Capital "A" glyph
    c_text = (255, 255, 255, 255)
    c_shadow = (110, 15, 20, 255)
    # Text shadow
    draw.polygon([(16, 8), (9, 23), (12, 23), (14, 18), (18, 18), (20, 23), (23, 23)], fill=c_shadow)
    # Main "A" legs
    draw.line([(15, 7), (8, 22)], fill=c_text, width=3)
    draw.line([(16, 7), (23, 22)], fill=c_text, width=3)
    draw.line([(11, 16), (20, 16)], fill=c_text, width=2)

    return img

# 3. ui_instr_btn_b (32x32)
def gen_ui_instr_btn_b():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Outer border & shadow
    draw.ellipse([1, 2, 30, 31], fill=(25, 12, 8, 255))
    draw.ellipse([1, 1, 30, 30], fill=(55, 20, 10, 255))

    # Main amber/red button body
    draw.ellipse([3, 3, 28, 28], fill=(215, 70, 25, 255))
    draw.ellipse([4, 4, 27, 27], fill=(240, 95, 35, 255))

    # Top-left specular highlight curve
    draw.arc([5, 5, 26, 26], start=190, end=300, fill=(255, 190, 140, 255), width=2)

    # Capital "B" glyph
    c_text = (255, 255, 255, 255)
    c_shadow = (110, 30, 10, 255)
    
    # Shadow
    draw.rectangle([10, 8, 13, 23], fill=c_shadow)
    draw.ellipse([11, 8, 22, 16], fill=c_shadow)
    draw.ellipse([11, 14, 23, 23], fill=c_shadow)

    # B spine
    draw.line([(9, 7), (9, 22)], fill=c_text, width=3)
    # B loops
    draw.arc([9, 7, 20, 15], start=270, end=90, fill=c_text, width=2)
    draw.arc([9, 14, 21, 22], start=270, end=90, fill=c_text, width=2)
    draw.line([(9, 7), (15, 7)], fill=c_text, width=2)
    draw.line([(9, 14), (15, 14)], fill=c_text, width=2)
    draw.line([(9, 22), (15, 22)], fill=c_text, width=2)

    return img

# 4. icon_controller_nes (128x64)
def gen_icon_controller_nes():
    w, h = 128, 64
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Main NES Controller body
    # Outer border shadow
    draw.rectangle([8, 10, 120, 56], fill=(20, 22, 25, 255))
    # Grey chassis
    draw.rectangle([8, 8, 120, 54], fill=(205, 208, 212, 255), outline=(35, 38, 42, 255), width=2)
    # Top bevel highlight
    draw.line([(10, 10), (118, 10)], fill=(240, 243, 248, 255), width=1)
    draw.line([(10, 10), (10, 52)], fill=(240, 243, 248, 255), width=1)

    # Dark center recessed band
    draw.rectangle([14, 14, 114, 48], fill=(42, 45, 50, 255), outline=(20, 22, 25, 255), width=1)
    # Red accent stripes on band
    draw.line([(16, 17), (112, 17)], fill=(180, 35, 45, 255), width=1)
    draw.line([(16, 45), (112, 45)], fill=(180, 35, 45, 255), width=1)

    # D-Pad on Left (center at 32, 31)
    # Cross
    draw.rectangle([28, 21, 36, 41], fill=(20, 22, 25, 255))
    draw.rectangle([22, 27, 42, 35], fill=(20, 22, 25, 255))
    draw.rectangle([29, 22, 35, 40], fill=(50, 54, 60, 255))
    draw.rectangle([23, 28, 41, 34], fill=(50, 54, 60, 255))
    draw.ellipse([30, 29, 34, 33], fill=(30, 32, 36, 255))

    # Select & Start pill buttons in Middle (around x: 52 and x: 66)
    draw.rectangle([50, 34, 58, 39], fill=(20, 22, 25, 255))
    draw.rectangle([51, 33, 57, 38], fill=(160, 30, 40, 255))
    draw.rectangle([64, 34, 72, 39], fill=(20, 22, 25, 255))
    draw.rectangle([65, 33, 71, 38], fill=(160, 30, 40, 255))

    # Action Buttons B and A on Right (B at 86, A at 102)
    # Button B
    draw.ellipse([80, 24, 92, 36], fill=(20, 22, 25, 255))
    draw.ellipse([81, 23, 91, 35], fill=(215, 35, 45, 255))
    draw.ellipse([83, 25, 89, 31], fill=(240, 65, 75, 255))

    # Button A
    draw.ellipse([96, 24, 108, 36], fill=(20, 22, 25, 255))
    draw.ellipse([97, 23, 107, 35], fill=(215, 35, 45, 255))
    draw.ellipse([99, 25, 105, 31], fill=(240, 65, 75, 255))

    return img

# 5. icon_keyboard (32x24)
def gen_icon_keyboard():
    w, h = 32, 24
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Keycap base shadow
    draw.rectangle([2, 3, 29, 21], fill=(25, 28, 32, 255))

    # Keycap frame / chassis
    draw.rectangle([2, 1, 29, 19], fill=(200, 205, 212, 255), outline=(40, 44, 50, 255), width=1)
    draw.line([(3, 2), (28, 2)], fill=(245, 248, 255, 255), width=1)

    # Keycap top surface (concave inset)
    draw.rectangle([4, 3, 27, 17], fill=(225, 230, 238, 255))

    # WASD Cluster representation (4 mini keys: W top, A S D bottom)
    c_key_bg = (175, 182, 195, 255)
    c_key_top = (245, 248, 252, 255)
    c_text = (30, 35, 45, 255)

    # W (top middle: 13..18, y:4..9)
    draw.rectangle([13, 4, 18, 9], fill=c_key_bg, outline=(60, 65, 75, 255))
    draw.rectangle([14, 5, 17, 8], fill=c_key_top)
    draw.point([(15, 6)], fill=c_text)

    # A (bottom left: 6..11, y:11..16)
    draw.rectangle([6, 11, 11, 16], fill=c_key_bg, outline=(60, 65, 75, 255))
    draw.rectangle([7, 12, 10, 15], fill=c_key_top)
    draw.point([(8, 13)], fill=c_text)

    # S (bottom middle: 13..18, y:11..16)
    draw.rectangle([13, 11, 18, 16], fill=c_key_bg, outline=(60, 65, 75, 255))
    draw.rectangle([14, 12, 17, 15], fill=c_key_top)
    draw.point([(15, 13)], fill=c_text)

    # D (bottom right: 20..25, y:11..16)
    draw.rectangle([20, 11, 25, 16], fill=c_key_bg, outline=(60, 65, 75, 255))
    draw.rectangle([21, 12, 24, 15], fill=c_key_top)
    draw.point([(22, 13)], fill=c_text)

    return img

# 6. icon_gamepad (32x24)
def gen_icon_gamepad():
    w, h = 32, 24
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Gamepad body silhouette (twin grips + center bridge)
    c_shadow = (15, 18, 24, 255)
    c_body = (55, 60, 75, 255)
    c_light = (95, 102, 120, 255)

    # Base shadow
    draw.ellipse([2, 5, 14, 21], fill=c_shadow)
    draw.ellipse([17, 5, 29, 21], fill=c_shadow)
    draw.rectangle([8, 8, 23, 18], fill=c_shadow)

    # Main body
    draw.ellipse([2, 4, 14, 20], fill=c_body)
    draw.ellipse([17, 4, 29, 20], fill=c_body)
    draw.rectangle([8, 7, 23, 17], fill=c_body)

    # Bevel highlight on top edge
    draw.arc([2, 4, 14, 20], start=180, end=270, fill=c_light, width=1)
    draw.arc([17, 4, 29, 20], start=270, end=360, fill=c_light, width=1)
    draw.line([(8, 7), (23, 7)], fill=c_light, width=1)

    # D-Pad on Left grip (x:7, y:12)
    draw.rectangle([6, 11, 9, 14], fill=(20, 22, 28, 255))
    draw.rectangle([5, 12, 10, 13], fill=(20, 22, 28, 255))

    # Action buttons on Right grip (X, Y, A, B dots)
    draw.point([(23, 10)], fill=(235, 50, 50, 255))  # Top (Red)
    draw.point([(21, 12)], fill=(240, 200, 40, 255)) # Left (Yellow)
    draw.point([(25, 12)], fill=(40, 180, 240, 255)) # Right (Blue)
    draw.point([(23, 14)], fill=(50, 210, 90, 255))  # Bottom (Green)

    return img

# 7. ui_hs_rank_medal_1 (32x32) - Gold Medal
def gen_ui_hs_rank_medal_1():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Ribbon V-loop at top
    draw.polygon([(11, 2), (16, 10), (7, 10)], fill=(210, 35, 45, 255))
    draw.polygon([(20, 2), (16, 10), (24, 10)], fill=(180, 25, 35, 255))
    draw.line([(11, 2), (16, 10)], fill=(245, 205, 60, 255), width=1)

    # Outer medal ring shadow & border
    draw.ellipse([4, 9, 27, 31], fill=(45, 30, 5, 255))
    draw.ellipse([4, 8, 27, 30], fill=(200, 140, 10, 255))

    # Gold Medallion body
    draw.ellipse([6, 10, 25, 28], fill=(255, 200, 15, 255))
    draw.ellipse([7, 11, 24, 27], fill=(255, 225, 60, 255))

    # Glint / specular arc
    draw.arc([7, 11, 24, 27], start=180, end=290, fill=(255, 255, 210, 255), width=2)

    # Engraved "1" in center
    c_num = (165, 95, 0, 255)
    c_num_hi = (255, 255, 255, 255)
    # Shadow / outline
    draw.line([(16, 14), (16, 24)], fill=c_num, width=3)
    draw.line([(13, 16), (16, 14)], fill=c_num, width=3)
    draw.line([(13, 24), (19, 24)], fill=c_num, width=3)
    # Core
    draw.line([(15, 14), (15, 23)], fill=c_num_hi, width=1)

    return img

# 8. ui_hs_rank_medal_2 (32x32) - Silver Medal
def gen_ui_hs_rank_medal_2():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Ribbon V-loop at top (Blue)
    draw.polygon([(11, 2), (16, 10), (7, 10)], fill=(35, 80, 195, 255))
    draw.polygon([(20, 2), (16, 10), (24, 10)], fill=(25, 60, 160, 255))
    draw.line([(11, 2), (16, 10)], fill=(210, 225, 245, 255), width=1)

    # Outer medal ring shadow & border
    draw.ellipse([4, 9, 27, 31], fill=(25, 30, 40, 255))
    draw.ellipse([4, 8, 27, 30], fill=(130, 140, 155, 255))

    # Silver Medallion body
    draw.ellipse([6, 10, 25, 28], fill=(195, 205, 218, 255))
    draw.ellipse([7, 11, 24, 27], fill=(230, 238, 248, 255))

    # Glint / specular arc
    draw.arc([7, 11, 24, 27], start=180, end=290, fill=(255, 255, 255, 255), width=2)

    # Engraved "2" in center
    c_num = (85, 95, 110, 255)
    c_num_hi = (255, 255, 255, 255)
    # Shadow / outline
    draw.arc([12, 14, 19, 19], start=180, end=360, fill=c_num, width=2)
    draw.line([(19, 17), (13, 23)], fill=c_num, width=2)
    draw.line([(12, 23), (19, 23)], fill=c_num, width=2)

    return img

# 9. ui_hs_rank_medal_3 (32x32) - Bronze Medal
def gen_ui_hs_rank_medal_3():
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Ribbon V-loop at top (Green)
    draw.polygon([(11, 2), (16, 10), (7, 10)], fill=(30, 145, 75, 255))
    draw.polygon([(20, 2), (16, 10), (24, 10)], fill=(20, 115, 55, 255))
    draw.line([(11, 2), (16, 10)], fill=(235, 160, 95, 255), width=1)

    # Outer medal ring shadow & border
    draw.ellipse([4, 9, 27, 31], fill=(40, 20, 10, 255))
    draw.ellipse([4, 8, 27, 30], fill=(145, 75, 30, 255))

    # Bronze Medallion body
    draw.ellipse([6, 10, 25, 28], fill=(205, 120, 55, 255))
    draw.ellipse([7, 11, 24, 27], fill=(235, 155, 90, 255))

    # Glint / specular arc
    draw.arc([7, 11, 24, 27], start=180, end=290, fill=(255, 215, 175, 255), width=2)

    # Engraved "3" in center
    c_num = (110, 50, 15, 255)
    draw.arc([13, 14, 19, 18], start=210, end=90, fill=c_num, width=2)
    draw.arc([13, 18, 19, 23], start=270, end=150, fill=c_num, width=2)
    draw.line([(14, 14), (18, 14)], fill=c_num, width=2)

    return img

# 10. tre_set_complete_badge (96x48)
def gen_tre_set_complete_badge():
    w, h = 96, 48
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Ornate Gold Banner Frame with Purple Inset
    # Left and Right folded ribbon ends
    draw.polygon([(2, 14), (14, 8), (14, 40), (2, 34), (8, 24)], fill=(180, 120, 10, 255))
    draw.polygon([(94, 14), (82, 8), (82, 40), (94, 34), (88, 24)], fill=(180, 120, 10, 255))

    # Main gold frame rectangle
    draw.rectangle([10, 6, 85, 42], fill=(255, 195, 20, 255), outline=(35, 15, 45, 255), width=2)
    # Inner royal purple plate
    draw.rectangle([13, 9, 82, 39], fill=(68, 22, 98, 255), outline=(255, 230, 90, 255), width=1)

    # Gold corner dots
    draw.rectangle([14, 10, 16, 12], fill=(255, 230, 90, 255))
    draw.rectangle([79, 10, 81, 12], fill=(255, 230, 90, 255))
    draw.rectangle([14, 36, 16, 38], fill=(255, 230, 90, 255))
    draw.rectangle([79, 36, 81, 38], fill=(255, 230, 90, 255))

    # Bold Pixel Text "SET COMPLETE!"
    c_gold = (255, 225, 40, 255)
    c_shadow = (25, 8, 40, 255)

    # Text lines drawn via pixel glyphs
    # "SET COMPLETE" centered
    # Row 1: SET (y:14)
    # Row 2: COMPLETE (y:25)
    
    # We can draw stylized bold text or pixel characters:
    # "SET"
    draw.text((38, 11), "SET", fill=c_shadow)
    draw.text((37, 10), "SET", fill=(255, 255, 220, 255))

    # "COMPLETE"
    draw.text((20, 24), "COMPLETE", fill=c_shadow)
    draw.text((19, 23), "COMPLETE", fill=c_gold)

    # Four-point starburst accents
    for sx, sy in [(17, 15), (78, 15), (17, 32), (78, 32)]:
        draw.line([(sx-2, sy), (sx+2, sy)], fill=(255, 255, 220, 255))
        draw.line([(sx, sy-2), (sx, sy+2)], fill=(255, 255, 220, 255))

    return img

# 11. ui_hs_badge_new (64x24)
def gen_ui_hs_badge_new():
    w, h = 64, 24
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Angled ribbon banner background (Crimson red + Gold rim)
    pts_bg = [(2, 4), (60, 2), (62, 18), (4, 20)]
    pts_shadow = [(3, 6), (61, 4), (63, 20), (5, 22)]
    
    draw.polygon(pts_shadow, fill=(20, 5, 8, 255))
    draw.polygon(pts_bg, fill=(225, 35, 45, 255), outline=(255, 215, 40, 255))

    # Top highlight line
    draw.line([(3, 4), (59, 3)], fill=(255, 120, 130, 255), width=1)

    # Bold "NEW!" Text
    c_txt = (255, 255, 255, 255)
    c_shd = (120, 15, 20, 255)
    draw.text((19, 6), "NEW!", fill=c_shd)
    draw.text((18, 5), "NEW!", fill=c_txt)

    # Star icon on left
    draw.polygon([(9, 7), (11, 11), (15, 11), (12, 13), (13, 17), (9, 14), (5, 17), (6, 13), (3, 11), (7, 11)], fill=(255, 230, 50, 255))

    return img

# 12. icon_wifi (24x24)
def gen_icon_wifi():
    w, h = 24, 24
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    c_cyan = (0, 230, 220, 255)
    c_cyan_glow = (180, 255, 250, 255)
    c_shadow = (0, 45, 55, 255)

    # Base Dot
    draw.ellipse([10, 18, 14, 22], fill=c_shadow)
    draw.ellipse([10, 17, 14, 21], fill=c_cyan)
    draw.ellipse([11, 18, 13, 20], fill=c_cyan_glow)

    # Arc 1 (Inner)
    draw.arc([7, 12, 17, 22], start=215, end=325, fill=c_shadow, width=3)
    draw.arc([7, 11, 17, 21], start=215, end=325, fill=c_cyan, width=2)

    # Arc 2 (Middle)
    draw.arc([4, 7, 20, 23], start=215, end=325, fill=c_shadow, width=3)
    draw.arc([4, 6, 20, 22], start=215, end=325, fill=c_cyan, width=2)

    # Arc 3 (Outer)
    draw.arc([1, 2, 23, 24], start=215, end=325, fill=c_shadow, width=3)
    draw.arc([1, 1, 23, 23], start=215, end=325, fill=c_cyan, width=2)

    return img

# 13. icon_disconnect (24x24)
def gen_icon_disconnect():
    w, h = 24, 24
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    # Dimmed wifi signal background
    c_dim = (100, 105, 115, 255)
    draw.ellipse([10, 17, 14, 21], fill=c_dim)
    draw.arc([7, 11, 17, 21], start=215, end=325, fill=c_dim, width=2)
    draw.arc([4, 6, 20, 22], start=215, end=325, fill=c_dim, width=2)

    # Red Disconnect Slash / X
    c_red = (235, 45, 55, 255)
    c_red_dark = (40, 5, 10, 255)
    
    # Red X / slash with outline
    draw.line([(3, 3), (21, 21)], fill=c_red_dark, width=5)
    draw.line([(21, 3), (3, 21)], fill=c_red_dark, width=5)
    draw.line([(3, 3), (21, 21)], fill=c_red, width=3)
    draw.line([(21, 3), (3, 21)], fill=c_red, width=3)

    return img

# 14. ui_spinner (32x32) + 8 animation frames (ui_spinner_0 .. 7)
def gen_ui_spinner_frame(frame_idx=0):
    w, h = 32, 32
    img = create_raw_canvas(w, h)
    draw = ImageDraw.Draw(img)

    cx, cy = 16, 16
    radius = 10
    num_dots = 8

    for i in range(num_dots):
        # Calculate angle for dot i
        angle_deg = (i * 360 / num_dots)
        angle_rad = math.radians(angle_deg)
        
        dx = int(cx + radius * math.cos(angle_rad))
        dy = int(cy + radius * math.sin(angle_rad))

        # Alpha / brightness falloff based on frame_idx offset
        step_diff = (i - frame_idx) % num_dots
        intensity = 1.0 - (step_diff / float(num_dots))

        # Color calculation
        r = int(0 * intensity)
        g = int(240 * intensity + 30 * (1 - intensity))
        b = int(240 * intensity + 50 * (1 - intensity))
        dot_color = (r, g, b, 255)

        dot_r = 2 if step_diff > 4 else 3
        draw.ellipse([dx - dot_r, dy - dot_r, dx + dot_r, dy + dot_r], fill=dot_color)

    return img

def main():
    print("Generating raw master images in art_raw/ui_icons/...")

    generators = {
        "ui_instr_dpad": gen_ui_instr_dpad,
        "ui_instr_btn_a": gen_ui_instr_btn_a,
        "ui_instr_btn_b": gen_ui_instr_btn_b,
        "icon_controller_nes": gen_icon_controller_nes,
        "icon_keyboard": gen_icon_keyboard,
        "icon_gamepad": gen_icon_gamepad,
        "ui_hs_rank_medal_1": gen_ui_hs_rank_medal_1,
        "ui_hs_rank_medal_2": gen_ui_hs_rank_medal_2,
        "ui_hs_rank_medal_3": gen_ui_hs_rank_medal_3,
        "tre_set_complete_badge": gen_tre_set_complete_badge,
        "ui_hs_badge_new": gen_ui_hs_badge_new,
        "icon_wifi": gen_icon_wifi,
        "icon_disconnect": gen_icon_disconnect,
        "ui_spinner": lambda: gen_ui_spinner_frame(0)
    }

    processed_sprites = []

    for item_id, gen_fn in generators.items():
        raw_img = gen_fn()
        raw_path = os.path.join(RAW_DIR, f"{item_id}.png")
        raw_img.save(raw_path, "PNG")
        print(f" Saved raw master: {raw_path}")

        # Chroma key removal
        rgba_img = remove_background_chroma(raw_img, bg_color=CHROMA_BG[:3], tolerance=25)
        processed_sprites.append((item_id, rgba_img))

    # Also generate spinner 8 frames: ui_spinner_0 .. ui_spinner_7
    for f in range(8):
        spinner_img = gen_ui_spinner_frame(f)
        rgba_spinner = remove_background_chroma(spinner_img, bg_color=CHROMA_BG[:3], tolerance=25)
        processed_sprites.append((f"ui_spinner_{f}", rgba_spinner))

    # Pack into atlas_ui_icons (Phaser 3 JSON Hash format)
    print("\nPacking assets into Phaser 3 JSON Hash Atlas...")

    # Dynamic shelf packer for sprite list
    # Sort sprites by height descending for optimal packing
    sprites_sorted = sorted(processed_sprites, key=lambda s: s[1].height, reverse=True)

    sheet_w, sheet_h = 512, 256
    atlas_img = Image.new("RGBA", (sheet_w, sheet_h), (0, 0, 0, 0))
    frames_json = {}

    cur_x, cur_y = 0, 0
    row_h = 0

    for item_id, sprite in sprites_sorted:
        sw, sh = sprite.size
        
        # Check if exceeds row width
        if cur_x + sw > sheet_w:
            cur_x = 0
            cur_y += row_h + 2
            row_h = 0

        atlas_img.paste(sprite, (cur_x, cur_y), sprite)

        frames_json[item_id] = {
            "frame": {"x": cur_x, "y": cur_y, "w": sw, "h": sh},
            "rotated": False,
            "trimmed": False,
            "spriteSourceSize": {"x": 0, "y": 0, "w": sw, "h": sh},
            "sourceSize": {"w": sw, "h": sh},
            "pivot": {"x": 0.5, "y": 0.5}
        }

        cur_x += sw + 2
        row_h = max(row_h, sh)

    atlas_data = {
        "frames": frames_json,
        "meta": {
            "app": "Dungeon Haul Asset Processor",
            "version": "1.0",
            "image": "atlas_ui_icons.webp",
            "format": "RGBA8888",
            "size": {"w": sheet_w, "h": sheet_h},
            "scale": "1"
        }
    }

    webp_path = os.path.join(PUBLIC_DIR, "atlas_ui_icons.webp")
    json_path = os.path.join(PUBLIC_DIR, "atlas_ui_icons.json")

    atlas_img.save(webp_path, "WEBP", quality=95)
    with open(json_path, "w") as f:
        json.dump(atlas_data, f, indent=2)

    print(f"Atlas generated successfully:")
    print(f"  WebP: {webp_path}")
    print(f"  JSON: {json_path}")

    # Update client/public/assets/manifest.json
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, "r") as f:
            manifest = json.load(f)

        existing_keys = [a["key"] for a in manifest.get("atlases", [])]
        if "atlas_ui_icons" not in existing_keys:
            manifest["atlases"].append({
                "key": "atlas_ui_icons",
                "texture": "assets/atlases/atlas_ui_icons.webp",
                "atlas": "assets/atlases/atlas_ui_icons.json"
            })
            with open(MANIFEST_PATH, "w") as f:
                json.dump(manifest, f, indent=2)
            print(f"Updated {MANIFEST_PATH} with atlas_ui_icons!")
        else:
            print(f"atlas_ui_icons already present in {MANIFEST_PATH}.")

if __name__ == "__main__":
    main()
