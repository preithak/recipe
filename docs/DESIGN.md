# Design System: The Heirloom Editorial

## 1. Overview & Creative North Star: "The Modern Alchemist"
The North Star of this design system is **The Modern Alchemist**. This isn't just a recipe app; it is a digital kitchen heirloom. We are moving away from the "utility-first" grid of modern SaaS and toward a high-end editorial experience that feels like a heavy-stock linen cookbook. 

The aesthetic is driven by **Intentional Asymmetry** and **Tonal Depth**. We break the "template" look by overlapping high-resolution food photography with elegant serif typography, using generous whitespace (`spacing.20` and `spacing.24`) to let the content breathe. This system rejects the clinical coldness of modern web design in favor of warmth, tactile grain, and organic shapes.

---

## 2. Colors & Surface Architecture
Our palette is rooted in the earth. It is warm, appetizing, and sophisticated.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Structural boundaries must be defined solely through background color shifts.
- To separate a hero section from a recipe list, transition from `surface` (#fff8f6) to `surface-container-low` (#fff1eb).
- High-contrast lines create visual "noise" that breaks the premium editorial flow.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine paper.
- **Base Level:** `surface` (#fff8f6)
- **Secondary Content:** `surface-container-low` (#fff1eb)
- **High-Emphasis Cards:** `surface-container` (#ffeae1)
- **Nested Detail Elements:** `surface-container-high` (#ffe2d6) or `highest` (#ffdbcc)

### The "Glass & Grain" Rule
To achieve a signature look, use **Glassmorphism** for floating navigation and overlay cards. Use `surface_container_low` at 80% opacity with a `20px` backdrop blur. This allows the vibrant food photography to bleed through the UI, softening the experience. 
*Note: Apply a subtle SVG noise texture (2% opacity) over all backgrounds to mimic linen paper.*

---

## 3. Typography
We use a high-contrast pairing to balance authority with readability.

- **Display & Headlines (Playfair Display / Noto Serif):** These are our "Editorial Voices." Use `display-lg` (3.5rem) for recipe titles and `headline-md` for section headers. The serif nature conveys history and trust.
- **Body & Labels (Inter):** Our "Functional Voice." Inter provides a clean, modern counter-balance. Use `body-lg` (1rem) for ingredient lists and `label-md` for metadata.
- **Hierarchy Tip:** Always use `on_surface_variant` (#53433b) for body text to maintain a soft, "printed" feel rather than a harsh digital black.

---

## 4. Elevation & Depth
Hierarchy is achieved through **Tonal Layering**, not structural lines.

- **The Layering Principle:** Instead of a shadow, place a `surface-container-lowest` (#ffffff) card on top of a `surface-container` (#ffeae1) background. This creates a natural, soft lift.
- **Ambient Shadows:** When a card must "float" (e.g., a featured recipe card), use a shadow with a large blur (`40px`) and low opacity (`6%`). The shadow color must be a tinted version of `on_surface` (#2d1509), never pure black.
- **The "Ghost Border":** If a container requires a border for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons & Actions
- **Primary Action:** Use `primary` (#8c4b20) with a subtle gradient transitioning to `primary_container` (#aa6236) at a 45-degree angle. This adds "soul" and prevents the button from looking flat. Radius: `rounded-full`.
- **Secondary Action:** Use `secondary_container` (#d3e5c5) with `on_secondary_container` text. This provides a soft, "sage" highlight for secondary paths.

### Elegant Recipe Cards
- **Construction:** No borders. Use `surface_container_low`. 
- **Imagery:** Aspect ratio 4:5. The image should have a `rounded-xl` corner. 
- **Typography:** The title should slightly overlap the image container to break the grid.

### Organic Category Badges (Chips)
- **Style:** Instead of standard rectangles, use "Organic Shapes"—slightly irregular pill shapes using `rounded-full` or asymmetric rounding (e.g., `top-left: xl`, `bottom-right: xl`, others `md`).
- **Color:** Use `tertiary_fixed` (#ffdea6) for a soft gold accent that draws the eye without shouting.

### Refined Navigation Bar
- **Visual:** Use a Glassmorphic effect (80% `surface` + backdrop blur).
- **Layout:** Centered logo with wide-spaced `label-md` links. No bottom border; use a very soft `ambient shadow` to separate it from the content scroll.

### Input Fields
- **Style:** Minimalist. No box. Use a `surface-container-high` background with a `rounded-md` corner. 
- **Active State:** On focus, the background shifts to `surface-container-highest` with a `2px` "Ghost Border" of `primary` at 30% opacity.

---

## 6. Do's and Don'ts

### Do
- **Do** use "Negative Space" as a design element. If a section feels crowded, increase the spacing to `spacing.16`.
- **Do** use large-scale food photography. The UI is a frame for the art of cooking.
- **Do** use `secondary` (#536349) for success states and health-related badges (e.g., "Vegan," "Gluten-Free").

### Don't
- **Don't** use 100% black (#000000) for anything. It breaks the "Heirloom" warmth.
- **Don't** use sharp `0px` corners. Everything in a kitchen is organic; the UI should reflect that with `rounded-md` or larger.
- **Don't** use dividers or lines to separate list items. Use `spacing.4` of vertical whitespace or a subtle background tint change.
- **Don't** use "Default" shadows. If the shadow looks like a standard CSS drop-shadow, it is too heavy. Decrease opacity and increase blur.