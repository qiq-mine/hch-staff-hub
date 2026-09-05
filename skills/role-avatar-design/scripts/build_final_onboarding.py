import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_clean_cutout(img_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img, dtype=float)
    
    # Estimate bg color from outer corners
    bg_corners = np.concatenate([arr[:10, :10], arr[:10, -10:], arr[-10:, :10], arr[-10:, -10:]], axis=0)
    bg_color = np.mean(bg_corners, axis=(0, 1))
    
    dist = np.sqrt(np.sum((arr - bg_color) ** 2, axis=2))
    is_bg = (dist < 30).astype(np.uint8) * 255
    mask = Image.fromarray(is_bg, mode='L')
    
    w, h = img.size
    for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), 
               (w // 2, 0), (0, h // 2), (w - 1, h // 2), (w // 2, h - 1)]:
        if mask.getpixel(pt) == 255:
            ImageDraw.floodfill(mask, pt, 128)
            
    mask_arr = np.array(mask)
    is_exterior = (mask_arr == 128)
    
    alpha = np.ones((h, w), dtype=np.uint8) * 255
    alpha[is_exterior] = 0
    
    alpha_img = Image.fromarray(alpha).filter(ImageFilter.GaussianBlur(0.7))
    res = img.convert('RGBA')
    res.putalpha(alpha_img)
    return res

def get_rounded_thub_logo(size):
    logo_path = r"E:\Projects\hch-staff-hub\skills\vector-logo-design\resources\thub-square-dark.png"
    logo = Image.open(logo_path).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    mask = Image.new("L", (size, size), 0)
    rx = int(size * 0.22)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size, size], radius=rx, fill=255)
    logo.putalpha(mask)
    return logo

def build_perfect_gallery():
    g_path = r"E:\Projects\hch-staff-hub\frontend-service\src\assets\onboarding-gallery.png"
    g = Image.open(g_path).convert("RGBA")
    
    # 1. Top-left logo
    logo = get_rounded_thub_logo(38)
    g.paste(logo, (74, 68), logo)
    
    # 2. Cutouts
    roles_dir = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\resources"
    brain_dir = r"C:\Users\qiuwe\.gemini\antigravity\brain\dcbee328-d73e-47bd-8ebe-bb9fdba6c528"
    
    fin_cut = make_clean_cutout(os.path.join(roles_dir, "financial-analyst.png"))
    rd_cut = make_clean_cutout(os.path.join(roles_dir, "rd-engineer.png"))
    hr_cut = make_clean_cutout(os.path.join(roles_dir, "hr-manager.png"))
    legal_cut = make_clean_cutout(os.path.join(brain_dir, "legal_avatar_design_1788577512417.jpg"))
    admin_cut = make_clean_cutout(os.path.join(brain_dir, "admin_avatar_design_1788577557586.jpg"))
    
    capsule_bg = (246, 246, 246, 255)
    
    def place_card_avatar(avatar_img, clear_rect, paste_x, paste_bottom_y, scale_w, scale_h):
        draw = ImageDraw.Draw(g)
        # Clear old avatar inside capsule
        draw.rectangle(clear_rect, fill=capsule_bg)
        
        # Resize avatar
        resized = avatar_img.resize((scale_w, scale_h), Image.Resampling.LANCZOS)
        paste_y = paste_bottom_y - scale_h
        
        # Alpha composite
        g.alpha_composite(resized, (paste_x, paste_y))
        
        # Clean clip at paste_bottom_y
        draw.rectangle([paste_x, paste_bottom_y, paste_x + scale_w, paste_bottom_y + 10], fill=(255, 255, 255, 255))
        draw.line([clear_rect[0], paste_bottom_y, paste_x + scale_w + 10, paste_bottom_y], fill=(238, 238, 238, 255), width=1)

    # Row 1 cards: bottom at y = 325. Avatar width=108, height=128
    # Card 1 (Finance)
    place_card_avatar(fin_cut, [358, 160, 480, 324], 368, 325, 108, 128)
    
    # Card 2 (R&D)
    place_card_avatar(rd_cut, [838, 160, 960, 324], 848, 325, 108, 128)
    
    # Card 3 (Legal)
    place_card_avatar(legal_cut, [1318, 160, 1440, 324], 1328, 325, 108, 128)
    
    # Row 2 cards: bottom at y = 610. Avatar width=108, height=128
    # Card 4 (Admin)
    place_card_avatar(admin_cut, [358, 445, 480, 609], 368, 610, 108, 128)
    
    # Card 5 (HR)
    place_card_avatar(hr_cut, [838, 445, 960, 609], 848, 610, 108, 128)
    
    # 3. Sidebar user avatar ("财务"):
    # In sidebar, avatar sits in x: [68, 148], y: [365, 480]
    draw = ImageDraw.Draw(g)
    draw.rectangle([68, 365, 148, 480], fill=(255, 255, 255, 255))
    sb_fin = fin_cut.resize((80, 80), Image.Resampling.LANCZOS)
    sb_mask = Image.new("L", (80, 80), 0)
    ImageDraw.Draw(sb_mask).rounded_rectangle([0, 0, 80, 80], radius=18, fill=255)
    sb_fin.putalpha(sb_mask)
    g.alpha_composite(sb_fin, (68, 380))
    
    out_path = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\examples\final_gallery.png"
    g.save(out_path, "PNG")
    print(f"Final gallery preview saved: {out_path}")
    return g

def build_perfect_profile():
    p_path = r"E:\Projects\hch-staff-hub\frontend-service\src\assets\onboarding-profile.png"
    p = Image.open(p_path).convert("RGBA")
    
    # 1. Top-left logo in collapsed sidebar: x=68, y=68, size=38x38
    logo = get_rounded_thub_logo(36)
    p.paste(logo, (68, 68), logo)
    
    roles_dir = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\resources"
    rd_cut = make_clean_cutout(os.path.join(roles_dir, "rd-engineer.png"))
    
    # 2. Sidebar active avatar (R&D):
    # In sidebar, avatar sits in x: [60, 95], y: [350, 395]
    draw = ImageDraw.Draw(p)
    draw.rectangle([58, 348, 98, 395], fill=(255, 255, 255, 255))
    sb_rd = rd_cut.resize((36, 36), Image.Resampling.LANCZOS)
    sb_mask = Image.new("L", (36, 36), 0)
    ImageDraw.Draw(sb_mask).rounded_rectangle([0, 0, 36, 36], radius=10, fill=255)
    sb_rd.putalpha(sb_mask)
    p.alpha_composite(sb_rd, (61, 353))
    
    # 3. Hero character ("研发"):
    # Clear hero area: x in [150, 395], y in [65, 285]
    draw.rectangle([160, 65, 395, 284], fill=(255, 255, 255, 255))
    
    hero_rd = rd_cut.resize((185, 215), Image.Resampling.LANCZOS)
    p.alpha_composite(hero_rd, (190, 70))
    
    out_path = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\examples\final_profile.png"
    p.save(out_path, "PNG")
    print(f"Final profile preview saved: {out_path}")
    return p

if __name__ == "__main__":
    build_perfect_gallery()
    build_perfect_profile()

