import os
import numpy as np
from PIL import Image

def ramer_douglas_peucker(points, epsilon):
    if len(points) < 3:
        return points
    pts = np.array(points, dtype=float)
    start, end = pts[0], pts[-1]
    
    line_vec = end - start
    line_len = np.linalg.norm(line_vec)
    if line_len == 0:
        dists = np.linalg.norm(pts - start, axis=1)
    else:
        line_unit = line_vec / line_len
        vecs = pts - start
        proj = np.outer(np.dot(vecs, line_unit), line_unit)
        dists = np.linalg.norm(vecs - proj, axis=1)
        
    index = np.argmax(dists)
    max_d = dists[index]
    
    if max_d > epsilon:
        left = ramer_douglas_peucker(points[:index+1], epsilon)
        right = ramer_douglas_peucker(points[index:], epsilon)
        return left[:-1] + right
    else:
        return [points[0], points[-1]]

def get_contours(bw):
    h, w = bw.shape
    padded = np.pad(bw, 1, mode='constant', constant_values=False)
    dirs = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]
    visited = np.zeros_like(padded, dtype=bool)
    contours = []
    
    for r in range(1, h + 1):
        for c in range(1, w + 1):
            if padded[r, c] and not visited[r, c]:
                is_boundary = any(not padded[r+dr, c+dc] for dr, dc in [(-1,0), (1,0), (0,-1), (0,1)])
                if not is_boundary:
                    continue
                
                contour = []
                curr_r, curr_c = r, c
                back_idx = 6
                start_r, start_c = curr_r, curr_c
                
                while True:
                    contour.append((curr_c - 1, curr_r - 1))
                    visited[curr_r, curr_c] = True
                    search_start = (back_idx + 1) % 8
                    found = False
                    for i in range(8):
                        dir_idx = (search_start + i) % 8
                        dr, dc = dirs[dir_idx]
                        nr, nc = curr_r + dr, curr_c + dc
                        if 0 <= nr < h+2 and 0 <= nc < w+2 and padded[nr, nc]:
                            back_idx = (dir_idx + 4) % 8
                            curr_r, curr_c = nr, nc
                            found = True
                            break
                    if not found or (curr_r == start_r and curr_c == start_c):
                        break
                if len(contour) > 40:
                    contours.append(contour)
    return contours

def build_svg(img_path, eps=1.2):
    img = Image.open(img_path).convert('L')
    w, h = img.size
    bw = np.array(img) > 128
    contours = get_contours(bw)
    
    d_parts = []
    for c in contours:
        simplified = ramer_douglas_peucker(c + [c[0]], eps)
        if len(simplified) < 4:
            continue
        p_str = f'M {simplified[0][0]:.1f} {simplified[0][1]:.1f} ' + ' '.join([f'L {p[0]:.1f} {p[1]:.1f}' for p in simplified[1:]]) + ' Z'
        d_parts.append(p_str)
        
    all_d = ' '.join(d_parts)
    
    svg_dark = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <rect width="{w}" height="{h}" fill="#000000" />
  <path d="{all_d}" fill="#FFFFFF" fill-rule="evenodd" />
</svg>'''

    svg_light = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <rect width="{w}" height="{h}" fill="#FFFFFF" />
  <path d="{all_d}" fill="#000000" fill-rule="evenodd" />
</svg>'''

    svg_trans = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="100%" height="100%">
  <path d="{all_d}" fill="currentColor" fill-rule="evenodd" />
</svg>'''

    return w, h, svg_dark, svg_light, svg_trans

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    res_dir = os.path.join(script_dir, "..", "resources")
    
    sq_dark_path = os.path.join(res_dir, "thub-square-dark.png")
    sq_w, sq_h, sq_dark, sq_light, sq_trans = build_svg(sq_dark_path, 1.2)
    with open(os.path.join(res_dir, "thub-logo-square-dark.svg"), 'w', encoding='utf-8') as f:
        f.write(sq_dark)
    with open(os.path.join(res_dir, "thub-logo-square-light.svg"), 'w', encoding='utf-8') as f:
        f.write(sq_light)
    with open(os.path.join(res_dir, "thub-logo-square-symbol.svg"), 'w', encoding='utf-8') as f:
        f.write(sq_trans)

    hz_dark_path = os.path.join(res_dir, "thub-horizontal-dark.png")
    hz_w, hz_h, hz_dark, hz_light, hz_trans = build_svg(hz_dark_path, 1.2)
    with open(os.path.join(res_dir, "thub-logo-horizontal-dark.svg"), 'w', encoding='utf-8') as f:
        f.write(hz_dark)
    with open(os.path.join(res_dir, "thub-logo-horizontal-light.svg"), 'w', encoding='utf-8') as f:
        f.write(hz_light)
    with open(os.path.join(res_dir, "thub-logo-horizontal-symbol.svg"), 'w', encoding='utf-8') as f:
        f.write(hz_trans)

    print("SVG assets generated successfully in resources/")

if __name__ == "__main__":
    main()
