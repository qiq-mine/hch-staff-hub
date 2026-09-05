# THUB Brand Design Tokens & Geometric DNA

## 1. Color Palette

The THUB brand follows an ultra-high contrast monochromatic palette inspired by modern AI labs and brutalist-yet-approachable geometric design.

| Token Name | Hex Code | RGB | Role / Usage |
| :--- | :--- | :--- | :--- |
| `color-brand-black` | `#000000` | `rgb(0, 0, 0)` | Primary dark background / Light-mode glyphs |
| `color-brand-white` | `#FFFFFF` | `rgb(255, 255, 255)` | Dark-mode glyphs / Light-mode background |
| `color-brand-surface-dark` | `#09090B` | `rgb(9, 9, 11)` | Dark mode elevated cards and popovers |
| `color-brand-border-dark` | `#27272A` | `rgb(39, 39, 42)` | Dark mode borders and separators |
| `color-brand-surface-light`| `#FAFAFA` | `rgb(250, 250, 250)`| Light mode container surface |
| `color-brand-border-light` | `#E4E4E7` | `rgb(228, 228, 231)`| Light mode subtle outline |

---

## 2. Geometric Typography Anatomy

The logo glyphs are derived directly from the visual DNA of the `ace` style:

* **Stroke Profile**: Uniform, unmodulated heavy tubular stroke (weight ratio $\approx 1:5.5$ relative to glyph bounding box).
* **Terminal Caps**: Full hemispherical rounded caps (`stroke-linecap: round`). No sharp corners, beveled facets, or serif feet.
* **Counters (Negative Space)**:
  * The interior cavity of the `b` bowl forms a near-perfect circle, mirroring the spherical counter in the original `a` glyph.
  * The trough of the `u` has a continuous circular arc with vertical parallel side stems.
* **Proportions**:
  * **Square 2x2 Monogram**:
    * Top row: `t` and `h`
    * Bottom row: `u` and `b`
    * Grid alignment: Optical centers aligned vertically at $X_1 = 32.5\%$ and $X_2 = 67.5\%$, and horizontally at $Y_1 = 33\%$ and $Y_2 = 67\%$.
  * **Horizontal Lockup**:
    * Order: `t`, `h`, `u`, `b`
    * Shared baseline and x-height alignment for lower segments; matching ascender tops for `t`, `h`, and `b`.

---

## 3. Responsive Scaling Matrix

| Platform / Context | Target Variant | Recommended Sizing | Format |
| :--- | :--- | :--- | :--- |
| **Browser Favicon** | 2x2 Square | 16x16, 32x32, 48x48 | `favicon-32x32.png` / SVG |
| **Mobile App Icon / PWA** | 2x2 Square | 192x192, 512x512 | `favicon-512x512.png` |
| **Navigation Header** | Horizontal Wordmark | Height: 24px - 36px | `thub-logo-horizontal-*.svg` |
| **Splash / Auth Screen** | 2x2 Square / Lockup | Width: 120px - 240px | `thub-logo-square-*.svg` |
| **Avatar / Profile Mark** | 2x2 Square | 40x40 - 64x64 | SVG or PNG |

