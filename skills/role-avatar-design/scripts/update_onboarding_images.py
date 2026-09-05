import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

def make_clean_cutout(img_path):
    img = Image.open(img_path).convert('RGB')
    arr = np.array(img, dtype=float)
    
    # Estimate bg color from outer corners
    bg_corners = np.concatenate([arr[:10, :10], arr[:10, -10:], arr[-10:, :10], arr[-10:, -10:]], axis=0)
    bg_color = np.mean(bg_corners, axis=(0, 1))
    
    # Distance to bg
    dist = np.sqrt(np.sum((arr - bg_color) ** 2, axis=2))
    
    # Background candidates: light pixels near bg_color
    is_bg = (dist < 28).astype(np.uint8) * 255
    mask = Image.fromarray(is_bg, mode='L')
    
    # Floodfill from all 4 borders to isolate exterior background
    w, h = img.size
    for pt in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (0, h // 2), (w - 1, h // 2)]:
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
    # Load thub square logo
    logo_path = r"E:\Projects\hch-staff-hub\skills\vector-logo-design\resources\thub-square-dark.png"
    logo = Image.open(logo_path).convert("RGBA").resize((size, size), Image.Resampling.LANCZOS)
    
    # Make rounded corners
    mask = Image.new("L", (size, size), 0)
    draw = ImageDraw.Draw(mask)
    rx = int(size * 0.22)
    draw.rounded_rectangle([0, 0, size, size], radius=rx, fill=255)
    logo.putalpha(mask)
    return logo

def update_gallery():
    g_path = r"E:\Projects\hch-staff-hub\frontend-service\src\assets\onboarding-gallery.png"
    g = Image.open(g_path).convert("RGBA")
    
    # 1. Update Logo in top left
    logo = get_rounded_thub_logo(38)
    # Background of logo icon box:
    # Top-left logo is at x=74, y=68
    g.paste(logo, (74, 68), logo)
    
    # 2. Cutouts of all role avatars
    roles_dir = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\resources"
    brain_dir = r"C:\Users\qiuwe\.gemini\antigravity\brain\dcbee328-d73e-47bd-8ebe-bb9fdba6c528"
    
    fin_cut = make_clean_cutout(os.path.join(roles_dir, "financial-analyst.png"))
    rd_cut = make_clean_cutout(os.path.join(roles_dir, "rd-engineer.png"))
    hr_cut = make_clean_cutout(os.path.join(roles_dir, "hr-manager.png"))
    legal_cut = make_clean_cutout(os.path.join(brain_dir, "legal_avatar_design_1788577512417.jpg"))
    admin_cut = make_clean_cutout(os.path.join(brain_dir, "admin_avatar_design_1788577557586.jpg"))
    
    capsule_bg = (246, 246, 246, 255)
    
    # Function to replace avatar in a card
    def replace_card_avatar(avatar_img, clear_box, paste_box, crop_bottom_y):
        # 1. Clear old avatar in capsule
        draw = ImageDraw.Draw(g)
        draw.rectangle(clear_box, fill=capsule_bg)
        
        # 2. Scale avatar
        target_w, target_h = paste_box[2], paste_box[3]
        resized = avatar_img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        
        # 3. Clip at crop_bottom_y
        paste_x, paste_y = paste_box[0], paste_box[1]
        
        # Paste directly
        g.alpha_composite(resized, (paste_x, paste_y))
        
        # Ensure clean cut at bottom stats boundary (y >= crop_bottom_y)
        if paste_y + target_h > crop_bottom_y:
            draw.rectangle([paste_x, crop_bottom_y, paste_x + target_w, paste_y + target_h], fill=(255, 255, 255, 255))
            # Restore the subtle horizontal dividing line if needed
            draw.line([paste_x, crop_bottom_y, paste_x + target_w, crop_bottom_y], fill=(238, 238, 238, 255), width=1)

    # Card 1 (Finance): clear x: [356, 485], y: [160, 325]
    replace_card_avatar(fin_cut, [356, 160, 485, 324], [356, 168, 140, 160], 325)
    
    # Card 2 (R&D): clear x: [836, 965], y: [160, 325]
    replace_card_avatar(rd_cut, [836, 160, 965, 324], [836, 168, 140, 160], 325)
    
    # Card 3 (Legal): clear x: [1316, 1445], y: [160, 325]
    replace_card_avatar(legal_cut, [1316, 160, 1445, 324], [1316, 168, 140, 160], 325)
    
    # Card 4 (Admin): clear x: [356, 485], y: [445, 610]
    replace_card_avatar(admin_cut, [356, 445, 485, 609], [356, 453, 140, 160], 610)
    
    # Card 5 (HR): clear x: [836, 965], y: [445, 610]
    replace_card_avatar(hr_cut, [836, 445, 965, 609], [836, 453, 140, 160], 610)
    
    # 3. Sidebar user avatar ("财务"):
    # Clear region: x in [80, 155], y in [260, 335]
    draw = ImageDraw.Draw(g)
    # The sidebar card background is #FFFFFF
    draw.rectangle([78, 255, 156, 332], fill=(255, 255, 255, 255))
    sb_fin = fin_cut.resize((68, 68), Image.Resampling.LANCZOS)
    # Create squircle mask for sidebar
    sb_mask = Image.new("L", (68, 68), 0)
    ImageDraw.Draw(sb_mask).rounded_rectangle([0, 0, 68, 68], radius=16, fill=255)
    sb_fin.putalpha(sb_mask)
    g.alpha_composite(sb_fin, (84, 262))
    
    preview_path = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\examples\preview_updated_gallery.png"
    g.save(preview_path, "PNG")
    print(f"Updated gallery preview saved: {preview_path}")

def update_profile():
    p_path = r"E:\Projects\hch-staff-hub\frontend-service\src\assets\onboarding-profile.png"
    p = Image.open(p_path).convert("RGBA")
    
    # 1. Top-left logo in collapsed sidebar: x=65, y=56
    logo = get_rounded_thub_logo(38)
    p.paste(logo, (65, 56), logo)
    
    # 2. Sidebar active avatar (R&D):
    # Location: x=60 to 110, y=345 to 395
    draw = ImageDraw.Draw(p)
    draw.rectangle([58, 342, 114, 396], fill=(255, 255, 255, 255))
    
    rd_cut = make_clean_cutout(r"E:\Projects\hch-staff-hub\skills\role-avatar-design\resources\rd-engineer.png")
    sb_rd = rd_cut.resize((50, 50), Image.Resampling.LANCZOS)
    sb_mask = Image.new("L", (50, 50), 0)
    ImageDraw.Draw(sb_mask).rounded_rectangle([0, 0, 50, 50], radius=12, fill=255)
    sb_rd.putalpha(sb_mask)
    p.alpha_composite(sb_rd, (61, 344))
    
    # 3. Hero profile character (R&D):
    # Old character area: x in [210, 420], y in [55, 255]
    # Background color in profile hero area is #FAFAFA / #FFFFFF
    draw.rectangle([210, 55, 415, 255], fill=(255, 255, 255, 255))
    
    hero_rd = rd_cut.resize((190, 190), Image.Resampling.LANCZOS)
    p.alpha_composite(hero_rd, (220, 65))
    
    preview_path = r"E:\Projects\hch-staff-hub\skills\role-avatar-design\examples\preview_updated_profile.png"
    p.save(preview_path, "PNG")
    print(f"Updated profile preview saved: {preview_path}")

if __name__ == "__main__":
    update_gallery()
    update_profile()

