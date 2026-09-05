---
name: thub-logo-design
name: vector-logo-design
description: >-
  Guidelines, vector assets, specifications, and code components for the THUB brand logo, designed in the bold rounded-tubular geometric style of ACE. Use when styling, rendering, exporting, or integrating the THUB logo mark across web headers, avatars, favicons, or brand collateral.
  Guidelines, vector assets, specifications, and code components for minimalist geometric vector logo design, featuring the bold rounded-tubular geometric style of ACE / THUB. Use when designing, styling, rendering, exporting, or integrating vector logos, wordmarks, and brand marks across web headers, avatars, favicons, or brand collateral.
---

# THUB Brand Logo & Identity Skill

This skill defines the visual identity, vector assets, design tokens, and frontend integration components for **THUB** (Staff Hub), designed in direct continuation of the bold, rounded-tubular, high-contrast monochrome aesthetic of the reference `ace` mark.

---

## 1. Quick Asset Reference

All production-ready brand assets are stored in the [`resources/`](./resources) directory:

| Asset Name | Format | Theme / Style | Recommended Usage |
| :--- | :--- | :--- | :--- |
| [`thub-logo-square-dark.svg`](./resources/thub-logo-square-dark.svg) | SVG Vector | Dark (Black bg, White glyphs) | App icon, avatar, dark UI header |
| [`thub-logo-square-light.svg`](./resources/thub-logo-square-light.svg) | SVG Vector | Light (White bg, Black glyphs) | Light docs, print, white cards |
| [`thub-logo-square-symbol.svg`](./resources/thub-logo-square-symbol.svg) | SVG Vector | Transparent (`currentColor`) | Dynamic UI components & theme switches |
| [`thub-logo-horizontal-dark.svg`](./resources/thub-logo-horizontal-dark.svg) | SVG Vector | Dark (Black bg, White glyphs) | Full horizontal navbar, hero banners |
| [`thub-logo-horizontal-light.svg`](./resources/thub-logo-horizontal-light.svg) | SVG Vector | Light (White bg, Black glyphs) | Light website header, documents |
| [`thub-logo-horizontal-symbol.svg`](./resources/thub-logo-horizontal-symbol.svg) | SVG Vector | Transparent (`currentColor`) | Inline text lockups & flexible layouts |
| [`thub-logo-square.png`](./resources/thub-logo-square.png) | 1024x1024 PNG | Dark Mode Master Raster | High-res raster master render |
| [`thub-horizontal-dark.png`](./resources/thub-horizontal-dark.png) | 1376x768 PNG | Dark Horizontal Raster | High-res wordmark render |
| [`favicon-32x32.png`](./resources/favicon-32x32.png) | PNG Icon | 32x32 Favicon | Browser tab icon |
| [`favicon-512x512.png`](./resources/favicon-512x512.png) | PNG Icon | 512x512 App Icon | PWA & native mobile splash icon |

---

## 2. Visual DNA & Geometry

The THUB logo translates the distinct characteristics of the `ace` design language into the 4-letter mark `thub`:

1. **2x2 Balanced Monogram**:
   * **Top row**: `t` and `h`
   * **Bottom row**: `u` and `b`
   * Creates a compact, heavy square footprint matching the iconic visual mass of `ace`.
2. **Tubular Rounded Letterforms**:
   * Uniform stroke thickness throughout all letters.
   * Pill-like, fully hemispherical rounded end caps (`stroke-linecap: round`).
   * No sharp angles or acute serifs.
3. **Circular Geometry & Symmetry**:
   * The bowl and counter hole of `b` mirror the spherical geometry of `a` from `ace`.
   * The symmetrical trough of `u` balances the rounded arch of `h`.
4. **Monochrome Contrast**:
   * Absolute `#000000` Onyx Black and `#FFFFFF` Pure Signal White.

For full mathematical rules and color tokens, see [Design Tokens](./references/design-tokens.md) and [Logo Specification](./references/logo-specification.md).

---

## 3. Frontend Integration (React & TypeScript)

A drop-in React component is available in [`examples/ThubLogo.tsx`](./examples/ThubLogo.tsx).

### Usage Example:

```tsx
import { ThubLogo } from '@/skills/thub-logo-design/examples/ThubLogo';
import { ThubLogo } from '@/skills/vector-logo-design/examples/ThubLogo';

// 1. Navigation Header (Horizontal Wordmark)
export function Navbar() {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black text-white">
      <ThubLogo variant="horizontal" theme="dark" size={32} />
    </header>
  );
}

// 2. Square App Avatar or Icon
export function AppIcon() {
  return (
    <ThubLogo variant="square" theme="dark" size={48} className="rounded-xl shadow-lg" />
  );
}

// 3. Theme-Adaptive Symbol (currentColor)
export function AdaptiveLogo() {
  return (
    <div className="text-zinc-900 dark:text-zinc-50">
      <ThubLogo variant="square" theme="symbol" size={36} />
    </div>
  );
}
```

---

## 4. Automation & Maintenance Scripts

Helper scripts are located in [`scripts/`](./scripts):

* **Vector Generation**: [`scripts/build_svgs.py`](./scripts/build_svgs.py)  
  * Re-traces and optimizes SVG paths using contour tracing and Ramer-Douglas-Peucker polygon simplification.
* **Asset Processing**: [`scripts/process_assets.py`](./scripts/process_assets.py)  
  * Generates dark/light inverted variants, alpha-channel transparent PNGs, WebPs, and multi-size favicons (16px to 512px).

Run from the command line:
```bash
python skills/thub-logo-design/scripts/process_assets.py
python skills/thub-logo-design/scripts/build_svgs.py
python skills/vector-logo-design/scripts/process_assets.py
python skills/vector-logo-design/scripts/build_svgs.py
```

---

## 5. Visual Showcase

To preview all logo variants side-by-side in your browser, open [`examples/showcase.html`](./examples/showcase.html).

