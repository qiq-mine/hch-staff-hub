import os
import shutil
from PIL import Image

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    res_dir = os.path.join(script_dir, "..", "resources")
    fe_target_dir = r"E:\Projects\hch-staff-hub\frontend-service\src\assets\teamerhub"
    
    brain_dir = r"C:\Users\qiuwe\.gemini\antigravity\brain\dcbee328-d73e-47bd-8ebe-bb9fdba6c528"
    
    generated_map = {
        "hr_avatar_design_1788576797384.jpg": "hr-manager",
        "rd_avatar_design_1788576835540.jpg": "rd-engineer",
        "finance_avatar_design_1788576908039.jpg": "financial-analyst",
        "product_avatar_design_1788577040095.jpg": "product-manager",
    }
    
    # Process each generated avatar
    for src_name, target_base in generated_map.items():
        src_path = os.path.join(brain_dir, src_name)
        if not os.path.exists(src_path):
            print(f"File not found: {src_path}")
            continue
            
        img = Image.open(src_path).convert("RGB")
        
        # 1. Master PNG (1024x1024)
        master_path = os.path.join(res_dir, f"{target_base}.png")
        img.save(master_path, "PNG", optimize=True)
        
        # 2. Frontend 256x256 PNG
        img_256 = img.resize((256, 256), Image.Resampling.LANCZOS)
        fe_path = os.path.join(fe_target_dir, f"{target_base}.png")
        img_256.save(fe_path, "PNG", optimize=True)
        
        # Also save 256x256 in skill resources
        res_256_path = os.path.join(res_dir, f"{target_base}-256.png")
        img_256.save(res_256_path, "PNG", optimize=True)
        
        # WebP
        webp_path = os.path.join(fe_target_dir, f"{target_base}.webp")
        img_256.save(webp_path, "WEBP", quality=90)
        
        print(f"Processed: {target_base} -> {fe_path}")
        
    # Also copy existing reference images to skill resources
    for ref_name in ["frontend-engineer.png", "software-architect.png"]:
        ref_src = os.path.join(fe_target_dir, ref_name)
        if os.path.exists(ref_src):
            shutil.copy(ref_src, os.path.join(res_dir, ref_name))
            print(f"Copied reference: {ref_name}")

    print("All avatar assets processed successfully!")

if __name__ == "__main__":
    main()

