import os
from PIL import Image
import numpy as np

def process_assets():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    res_dir = os.path.join(script_dir, "..", "resources")
    
    def process_image_pair(src_filename, out_prefix):
        src_path = os.path.join(res_dir, src_filename)
        if not os.path.exists(src_path):
            print(f"File not found: {src_path}")
            return
        
        img = Image.open(src_path).convert('RGB')
        arr = np.array(img, dtype=np.float32)
        gray = 0.299 * arr[:,:,0] + 0.587 * arr[:,:,1] + 0.114 * arr[:,:,2]
        
        # 1. Dark PNG
        img.save(os.path.join(res_dir, f"{out_prefix}-dark.png"), "PNG")
        
        # 2. Light PNG (Inverted)
        inverted = 255 - arr
        Image.fromarray(inverted.astype(np.uint8)).save(os.path.join(res_dir, f"{out_prefix}-light.png"), "PNG")
        
        # 3. Transparent with White Glyphs
        alpha = np.clip((gray - 30) / (220 - 30) * 255, 0, 255).astype(np.uint8)
        rgba_white = np.zeros((img.height, img.width, 4), dtype=np.uint8)
        rgba_white[:, :, 0:3] = 255
        rgba_white[:, :, 3] = alpha
        Image.fromarray(rgba_white).save(os.path.join(res_dir, f"{out_prefix}-trans-white.png"), "PNG")
        
        # 4. Transparent with Black Glyphs
        rgba_black = np.zeros((img.height, img.width, 4), dtype=np.uint8)
        rgba_black[:, :, 0:3] = 0
        rgba_black[:, :, 3] = alpha
        Image.fromarray(rgba_black).save(os.path.join(res_dir, f"{out_prefix}-trans-black.png"), "PNG")
        
        # 5. Export WebP
        img.save(os.path.join(res_dir, f"{out_prefix}-dark.webp"), "WEBP")
        Image.fromarray(rgba_white).save(os.path.join(res_dir, f"{out_prefix}-trans-white.webp"), "WEBP")
        
        # Favicons for square
        if "square" in out_prefix:
            for sz in [16, 32, 64, 128, 192, 512]:
                resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
                resized.save(os.path.join(res_dir, f"favicon-{sz}x{sz}.png"), "PNG")
            
        print(f"Successfully processed {out_prefix} assets.")

    process_image_pair("thub-logo-square.png", "thub-square")
    process_image_pair("thub-logo-horizontal.png", "thub-horizontal")

if __name__ == "__main__":
    process_assets()

