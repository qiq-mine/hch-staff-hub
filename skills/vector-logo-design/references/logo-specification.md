# THUB Logo Specification & Usage Guidelines

## 1. Clear Space Requirement

To maintain maximum visual impact and brand recognizability, maintain an exclusion zone around the logo.

* **Clear Space ($X$)**: The minimum margin surrounding the logo must be equal to at least $\frac{1}{4}$ of the overall logo height ($H / 4$).
* No text, icons, background graphics, or screen edges may intrude into this boundary.

```
       +---------------------------------------------+
       |                  Clear Space X              |
       |     +---------------------------------+     |
       |  X  |              [thub]             |  X  |
       |     +---------------------------------+     |
       |                  Clear Space X              |
       +---------------------------------------------+
```

---

## 2. Minimum Sizing

* **Square Monogram (`thub` 2x2)**:
  * Minimum digital display: `24px x 24px`.
  * Minimum print size: `8mm x 8mm`.
* **Horizontal Wordmark (`thub`)**:
  * Minimum digital display: `64px x 28px`.
  * Minimum print size: `20mm x 9mm`.

---

## 3. Approved Logo Variants

1. **Dark Theme Solid**:
   * Black canvas (`#000000`) with white glyphs (`#FFFFFF`).
   * Primary application for developer tools, dark mode consoles, terminal headers, high-tech branding.
2. **Light Theme Solid**:
   * White canvas (`#FFFFFF`) with black glyphs (`#000000`).
   * Primary application for light documents, print media, clean white UI backgrounds.
3. **Symbol / Transparent (`currentColor`)**:
   * Alpha background, glyphs inherit text fill via SVG `fill="currentColor"`.
   * Adapts automatically across UI themes, buttons, badges, and navigation bars.

---

## 4. Brand Do's and Don'ts

### Do's:
* Use the SVG vector files whenever possible for razor-sharp rendering on Retina and 4K displays.
* Use the 2x2 Square monogram as the primary app icon, avatar, and square favicon.
* Use the Horizontal Wordmark in wide navigation bars and footers.
* Maintain the high-contrast monochromatic relationship.

### Don'ts:
* **DO NOT** stretch, squeeze, skew, or distort the aspect ratio.
* **DO NOT** add outer drop shadows, glow effects, bevels, or rainbow gradients.
* **DO NOT** alter the relative positions of the 4 characters.
* **DO NOT** replace the rounded caps with flat or serif terminals.

