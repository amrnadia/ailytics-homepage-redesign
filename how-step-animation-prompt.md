# Build prompt: Ailytics "How it works" section (5-step animated slider)

> Paste everything below the line into Claude Code. Run it from the project root
> (`/Users/nadia/Documents/2026 Mac/Ailytics homepage redesign`).
> Do the steps in §13 in order, and check each one before you move on.

---

## 0. Role and goal

You are adding the **How section** ("How Ailytics works") to the existing Ailytics homepage. It has three parts:

1. A centred header (eyebrow and h2). It is static.
2. A large **camera stage** (1312 × 766 at desktop) showing one CCTV frame. Five step animations play on top of it.
3. A **step slider**: five step items in a row. Each item has a thin **progress bar**, a number, a title and a description. The row is wider than the container, so item 4 is cut off by default.

The five steps play automatically, **7 s each, then loop**. The active item's progress bar fills from 0 % to 100 % over its step. The active item is at 100 % opacity and the others are at 20 %. Clicking an item jumps to that step. When step 4 starts, the slider glides left so items 4 and 5 are fully visible. Users can drag the slider with the mouse and move through it with the keyboard.

**Tech:** plain HTML + CSS + **vanilla JavaScript**. No frameworks, no build step, no npm.
The project ships GSAP in `js/vendor/` for other sections. **Don't use GSAP here.** Use CSS transitions driven by a small JS cue clock, with the Web Animations API for the progress bar (§7). The progress bar is the master clock, so the slider and the animation can't drift apart.

### 0.1 Design source (Paper file "Ailytics homepage redesign", page `homepage`)

| What | Paper artboard / node |
|---|---|
| Whole homepage (context and order of sections) | `homepage-default` (`15K-0`) |
| How section, default state (as placed in the homepage) | `how-section-step1-scene1` (`B74-0`) |
| Step 1, scene 1 | `how-section-step1-scene1` (`C0X-0`) |
| Step 1, scene 2 | `how-section-step1-scene2` (`AOS-0`) |
| Step 2, scene 1 | `how-section-step2-scene1` (`B3G-0`) |
| Step 2, scene 2 | `how-section-step2-scene2` (`BAU-0`) |
| Step 3, scene 1 | `how-section-step3-scene1` (`BI8-0`) |
| Step 3, scene 2 | `how-section-step3-scene2` (`BLX-0`) |
| Step 4, scene 1 | `how-section-step4-scene1` (`AW4-0`) |
| Step 4, scene 2 | `how-section-step4-scene2` (`BPN-0`) |
| Step 5, scene 1 | `how-section-step5-scene1` (`ASG-0`) |
| Step 5, scene 2 | `how-section-step5-scene2` (`BTD-0`) |

If the Paper MCP is connected, use `get_jsx` (with `includeNodeIds: false`), `get_computed_styles` and `get_screenshot` on these nodes for exact values and to check your work. **Every value in this prompt was read from those nodes. If anything here disagrees with Paper, Paper wins. Tell me about each disagreement.**

Notes on the Paper frames:
- Paper has **no mobile or tablet frame** for this section. §9 **is** the tablet and mobile design. Build it exactly as written there. It uses only this section's visual language (navy ground, 2px white rails, Switzer, teal accents), so it should feel designed rather than just stacked.
- Each scene frame is a **still**. Paper shows where each scene ends up, not how it moves. The motion in §6 is the spec.
- Inside the step-4 ellipse SVG, Paper has a stray rotated **teal gradient `div`**. It's a leftover. **Don't build it.**
- Paper's arrow column draws **9** arrows, but its 24 × 299 box clips the last two. Build **7**.
- The progress-bar widths in the frames (20 %, 60 %, 80 %) are only snapshots. The real bar fills linearly over the whole step.

---

## 1. Files to touch

```
index.html          ← add the How <section> AFTER the projects section (</section> of .projects), inside <main>
css/styles.css      ← append a new block: /* ============ HOW ============ */
js/how.js           ← NEW: all How logic (one IIFE, 'use strict')
images/web/how/     ← NEW: optimised images (see §2)
```

- Load `js/how.js` with `defer`, **after** `js/projects.js`.
- Don't change the hero, nav, logos, comparison, projects, `simulation.js`, `main.js`, `data.js`, `comparison.js` or `projects.js`.
- Reuse the existing `:root` tokens (`--navy`, `--dark-navy`, `--teal`, `--dark-teal`, `--white`, `--light-white`, `--light-navy`, `--orange`, `--fs-*`, `--ease-out`, `--ease-in-out`), plus `.container`, `--gutter`, `.eyebrow` and `.visually-hidden`. Don't redefine them.
- Breakpoints are the site's: **desktop ≥ 72rem (1152px)**, **tablet 48rem–71.99rem**, **mobile < 48rem (768px)**.
- In Paper's homepage, the section after How ("Every camera covered") is not part of this task. **Don't build it.**

---

## 2. Assets

### 2.1 Camera image (exists)
`images/how-images/how-slider-image.png` is the Paper camera image at 2× (2624 × 1532, ratio 1312 : 766). It's **6.7 MB**, so optimise it. `sips` can write WebP on this Mac (the project already uses WebP):

```bash
mkdir -p images/web/how
sips -s format webp -s formatOptions 80 -Z 2624 images/how-images/how-slider-image.png --out images/web/how/how-camera-2624.webp
sips -s format webp -s formatOptions 80 -Z 1312 images/how-images/how-slider-image.png --out images/web/how/how-camera-1312.webp
sips -s format webp -s formatOptions 78 -Z 800  images/how-images/how-slider-image.png --out images/web/how/how-camera-800.webp
```
- Keep the original. Reference only the WebP files.
- Target sizes: about 400 KB or less for 2624 and about 150 KB or less for 1312. If a file is much bigger, lower the quality by 5 and try again.
- `sizes="(min-width: 86.25rem) 1312px, calc(100vw - 2 * var(--gutter))"`. If `var()` isn't allowed in `sizes`, use `calc(100vw - 4.25rem)`.
- `width="1312" height="766"`, `loading="lazy"`, `decoding="async"`.

### 2.2 Ground grid (step 3): exists
`images/how-images/how-ground-grid.png` is **2624 × 372**: Paper's "ground grid" layer exported at 2×, already cropped to the 1312 × 186 strip.
- **The layer's 50 % opacity is already in the pixels** (alpha 128 on the teal fill, transparent above the horizon). In CSS it therefore runs at **opacity 1**. Don't apply Paper's 0.5 again, or it'll come out at 25 %.
- Don't use Paper's `background-size: 158.84% 177.52%` either. That was for the uncropped 3200 × 507 source. This file fills the strip exactly: `width: 100%; height: 100%; object-fit: fill` (or `background-size: 100% 100%`).
- Make WebP copies and reference only these:
  ```bash
  sips -s format webp -s formatOptions 85 -Z 2624 images/how-images/how-ground-grid.png --out images/web/how/how-ground-grid-2624.webp
  sips -s format webp -s formatOptions 85 -Z 1312 images/how-images/how-ground-grid.png --out images/web/how/how-ground-grid-1312.webp
  ```
  Check that the WebP keeps the transparency (open it and look at the area above the horizon). If it doesn't, use the PNG.

### 2.3 Background pattern: keep, at **2 %**, recreated in CSS (no file)
Paper puts a square-grid PNG behind the stage (`B76-0`, 1.5 % in Paper). **Use 2 % opacity.** The source is a plain grid: 2px white lines (`#FDFEFE`) every 64px on navy (`#2A3D5F`, the same as the section), rendered at 0.9125×. That works out to **lines 1.8px wide every 58.4px**. The navy fill is invisible on the navy section, so recreate only the lines, in CSS, with no image request:
```css
.how__box { position: relative; }
.how__box::before {                     /* sits behind the stage; only the band above it and the sides show */
  content: ""; position: absolute; z-index: -1; pointer-events: none;
  top: -9.9375rem;                      /* 159px above the stage, as in Paper */
  bottom: 1.875rem;                     /* stops 30px above the stage's bottom edge, as in Paper */
  left: 50%; width: 100vw; translate: -50% 0;   /* full section width; the section's overflow: clip stops page scroll */
  opacity: 0.02;
  background:
    linear-gradient(to right,  #FDFEFE 1.8px, transparent 1.8px) 18.3px 54.6px / 58.4px 58.4px,
    linear-gradient(to bottom, #FDFEFE 1.8px, transparent 1.8px) 18.3px 54.6px / 58.4px 58.4px;
}
```
- Keep the cell size fixed in px at every breakpoint (it's a texture, not part of the stage composition).
- `.how__inner` needs `position: relative; z-index: 0` (or `isolation: isolate`) so `z-index: -1` stays above the section background and the top band.

Font: Switzer 400/500, which `index.html` already loads.

---

## 3. Static section layout (desktop 1440, exact values from Paper `B74-0`)

```
section.how                              background #2A3C5F (literal, not a token), position relative, overflow clip
│                                        padding-top 160, padding-bottom 100 (responsive in §9)
├─ ::before  top band                    absolute; width 2061px; height 483px; top -147px; left 50%;
│                                        translate: calc(-50% + 45.5px) 0; filter: blur(25px); pointer-events none
│                                        background: linear-gradient(359.85deg, #192439 -48%, #2F446C 26%, #D8DDE2 73.7%, #F8FAFB 100%)
│                                        → inside @supports (background: linear-gradient(in oklab 0deg, red, blue))
│                                          use "linear-gradient(in oklab 359.85deg, …same stops…)"
│                                        (This fades the light projects section above into the navy section.)
└─ .container  > .how__inner             position relative (above ::before), flex column, gap 80px
   ├─ header.how__header                 flex column, align center, gap 20px
   │   ├─ p.eyebrow.eyebrow--light       "How ailytics works" (uppercase via the existing .eyebrow), colour var(--white)
   │   └─ h2.how__title#how-title        "Understand depth from a single camera, with no new hardware"
   │                                     max-width 48.4375rem (775); var(--fs-h2) (54); weight 500; line-height 1.1;
   │                                     letter-spacing -0.03em; centred; var(--white); text-wrap balance
   └─ .how__box                          flex column, gap 60px
       ├─ .how-stage   (§4)              width 100%; aspect-ratio 1312 / 766; radius 4px
       └─ .how-steps   (§8)              the slider
```

### 3.1 Step item (`.how-step`), desktop, from `B9J-0` and its siblings
```
.how-step                     flex column, gap 24px, flex: 0 0 23.65rem (378.39)   ← items are 24px apart
├─ .how-step__progress        relative, height 2px, width 100%
│   ├─ track (::before)       full width, 2px, radius 2px, var(--white) at opacity 0.2
│   └─ .how-step__fill        absolute 0,0; full width; 2px; radius 2px; var(--white);
│                             transform-origin left; transform scaleX(0)   ← animated (§7)
└─ .how-step__details         flex column, gap 16px; opacity 1 when active, 0.2 when inactive
    ├─ .how-step__num         "01"…"05", 16px / 150%, regular, var(--light-white)
    └─ .how-step__text        flex column, gap 10px
        ├─ .how-step__title   var(--fs-h5) (25), weight 500, line-height 1.1, -0.03em, var(--white)
        └─ .how-step__desc    16px / 150%, regular, var(--light-white), max-width 18.75rem (300)
```
- Only `.how-step__details` dims to 0.2. The track is always 20 % white.
- Active/inactive change: `transition: opacity 400ms var(--ease-out)`.
- Hover (on `(hover: hover)` devices only, inactive items): details opacity 0.45, 200 ms. A pointer cursor on the whole item.

### 3.2 Copy (exact, from Paper)

| # | Title | Description |
|---|---|---|
| 01 | A camera you already own | One of the CCTV feeds the site already has. No new camera or sensors, and usually nobody watching it. |
| 02 | Spot the people and the load | Ailytics finds the workers and the suspended load in every frame. |
| 03 | Work out depth from one camera | From that single camera it rebuilds the ground in 3D. No LiDAR, radar or second camera. |
| 04 | Project the drop zone | It marks where the load would land if it fell, as a live exclusion zone on the ground. |
| 05 | Measure real distance | It measures how far each worker is from the zone in metres and alerts the lifting supervisor the moment someone steps inside. |

Use the copy exactly as in this table. Three Paper typos are already corrected here: "framer" → **"frame"**, "dept" → **"depth"** and "One of CCTV feeds" → **"One of the CCTV feeds"**. Everything else is verbatim from Paper. Paper has a double space after "already has."; render it as a single space.

---

## 4. The stage: structure and exact values

### 4.1 Coordinate system and scaling
All positions below are in **stage px**, the stage's own 1312 × 766 space (Paper's camera image box).

```
.how-stage                      position relative; aspect-ratio 1312/766; overflow clip; border-radius 4px;
                                background #2A3C5F; isolation isolate   ← the blend backdrop for the luminosity image
├─ img.how-stage__img--color    absolute inset 0; 100% × 100%; object-fit cover; object-position 50% 50%; opacity 0
├─ img.how-stage__img--mono     same image (same URL/srcset, so it downloads once); mix-blend-mode luminosity;
│                               opacity 0.9; aria-hidden="true", alt=""
└─ .how-stage__canvas           absolute top 0 left 0; width 1312px; height 766px;
                                transform-origin 0 0; transform: scale(var(--how-k, 1)); pointer-events none
                                (all overlay layers live in here, positioned in stage px)
```
- JS sets `--how-k = stage.clientWidth / 1312` with a `ResizeObserver` (it's 1 at 1440 and on wider screens).
- The two images sit **outside** the scaled canvas so `srcset` picks a sharp file. Both have Paper's radius 4px (the stage clips them).
- **Image states:** step 1 starts with mono at 0.9 and colour at 0. "Normal" means colour at **0.9** and mono at **0** (Paper: opacity 0.9, no blend).
  You can't animate `mix-blend-mode`, so the switch is a **cross-fade of the two images**. Use the sibling selector `.how-stage__img--color.is-on + .how-stage__img--mono { opacity: 0 }`.
- **Minimum label size:** JS also sets `--how-label-k = max(1, 0.6 / k)`. Apply `scale: var(--how-label-k)` to every `.how-tag` and to `.how-card`, so on phones labels never render below 60 % of their desktop size. Use the **`scale` property, not `transform`**: the enter transitions use `transform`, and the two compose. Give each one a `transform-origin` at its anchor corner (listed per element below).

### 4.2 Shared label (`.how-tag`)
`position absolute; display flex; padding 6px 8px; width max-content; font 12px (var(--fs-tiny)) / line-height 1.1, weight 500, letter-spacing -0.03em; white-space nowrap`
- Variants: **white** (bg var(--white), text var(--navy)), **teal** (bg var(--dark-teal), text white), **orange** (bg var(--orange), text white).
- The step-1 tag is larger: padding 8px 12px, 16px font (same 1.1 / 500 / -0.03em), bg var(--dark-teal), white text.

### 4.3 Layers, in stacking order (Paper order, bottom → top)

**① Step-1 frame (`.how-frame`)**: Paper `AP4-0`
- Box: left **39**, top **39**, **1234 × 687** (centred). No fill.
- Build it as **4 edge elements**, not one border, so each edge can draw on its own:
  top `left 0; top 0; width 100%; height 2px; border-top: 2px dashed var(--teal)`; right `right 0; top 0; width 2px; height 100%; border-right: 2px dashed var(--teal)`; bottom and left likewise.
- Tag `CAM 14 ・ A CAMERA A SITE ALREADY HAS` (U+30FB "・" with a space each side, exactly as Paper): absolute **left -2, top -2** of the frame, teal 16px variant (§4.2). transform-origin: top left.

**② Worker target 1 (`.how-target--w1`)**: Paper `B3V-0`
- Group at left **955**, top **375**, flex column: white tag `WORKERS` on top, then the box.
- Box: **114 × 293**, `border: 2px solid var(--white)`, `overflow: clip`, position relative. Tag transform-origin: bottom left.

**③ Worker target 2 (`.how-target--w2`)**: Paper `B40-0`. The same, at left **1049**, top **392**.

**④ Ground grid (`.how-grid`)**: Paper `BIX-0`
- Strip: left 0, top **580**, **1312 × 186**, `overflow: clip`.
- Image layer: `<img class="how-grid__img" src="images/web/how/how-ground-grid-1312.webp" srcset="…-1312.webp 1312w, …-2624.webp 2624w" sizes="(min-width: 86.25rem) 1312px, 100vw" width="1312" height="186" alt="" aria-hidden="true" loading="lazy" decoding="async">`, absolute inset 0, 100% × 100%, **opacity 1** (the 50 % is in the file, §2.2).
- Scan layer (`.how-grid__scan`): full strip, `opacity 0.8`, `background: linear-gradient(0.51deg, rgba(53,193,195,.6) 3.33%, rgba(53,193,195,0) 66.83%)` (use the `in oklab` version inside the same `@supports`).

**⑤ Drop-zone group (`.how-load`)**: Paper `C5I-0`
- Group: left **162**, top **318**, **574 × 397**. Each part is its **own absolutely positioned `<svg>`** (as in Paper), so CSS opacity, transform and clip-path apply to an HTML-level box. Put `aria-hidden="true"` on all of them.
- **Ellipse** (`.how-load__ellipse`) at left 12, top 271, `width 562 height 126 viewBox="0 -6 562 126" overflow visible`:
  ```html
  <path d="M281.001-6C436.193-6 562.001 22.206 562.001 57 562.001 91.793 436.193 120 281.001 120 125.809 120 0.001 91.793 0.001 57 0.001 22.206 125.809-6 281.001-6Z" fill="rgb(255 108 47 / 30%)"/>
  <path d="M281.001-4.425C434.965-4.425 559.777 23.075 559.777 57 559.777 90.924 434.965 118.425 281.001 118.425 127.037 118.425 2.225 90.924 2.225 57 2.225 23.075 127.037-4.425 281.001-4.425Z" fill="none" stroke="#FF6C2F" stroke-width="3" vector-effect="non-scaling-stroke"/>
  ```
- **Left side line** (`.how-load__side`) at left 0, top 1, `width 81 height 347 viewBox="0 0 81 347" overflow visible`:
  `<path d="M73 -1L15 328" pathLength="1" fill="none" stroke="var(--orange)" stroke-width="3"/>`
  (This is Paper's transformed path, simplified. It runs top → bottom.)
- **Right side line** (`.how-load__side`) at left 501, top 1, `width 80 height 339 viewBox="0 0 80 339" overflow visible`:
  `<path d="M10 0L71 330" pathLength="1" fill="none" stroke="var(--orange)" stroke-width="3"/>`
- **Orange gradient** (`.how-load__fill`) at left 29, top 0, `width 527.29 height 242 viewBox="0 0 527.29 242"`:
  `<path d="M482.169 0L527.294 242L0 242L43.669 0L482.169 0Z" fill="url(#how-drop-grad)"/>`. The gradient is vertical (x1 .5 y1 0 x2 .5 y2 1), `rgba(255,108,47,.6)` → `rgba(255,108,47,0)`.
- **Arrow column** (`.how-load__arrows`) at left 275, top 15, `width 24 height 299 viewBox="0 0 24 299"` (overflow hidden). It holds **exactly 7 arrows** (decided; don't copy Paper's 9), 44px apart (y = 0, 44, 88, 132, 176, 220, 264). Each arrow:
  ```html
  <g transform="translate(0 44)">            <!-- position on the attribute -->
    <g class="how-arrow" style="--i:1">      <!-- CSS animates THIS inner g -->
      <path d="M12 2V22M8 18L12 22L16 18" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </g>
  ```
  ⚠️ A CSS `transform` on a `<g>` **replaces** its `transform` attribute. That's why the position sits on the outer `<g>` and the animation on the inner one. Set `transform-box: fill-box; transform-origin: center` on `.how-arrow`.
- **Tag** `PROJECTED DROP ZONE`: orange variant, left **307**, top **209** of the group. transform-origin: left center.

**⑥ Suspended-load target (`.how-target--load`)**: Paper `B5E-0`
- Group at left **235**, top **18**, flex column: **box first, tag below**.
- Box **439 × 301**, `border: 2px solid var(--white)`, `overflow: clip`. White tag `SUSPENDED LOAD` (transform-origin: top left).

**Scan items inside the three target boxes** (`.how-target__scan`, Paper `BBD-0`, `BBI-0`, `BCU-0`)
- Paper draws them as rotated divs. The equivalent unrotated version is: absolute `top -2px; left -2px; width calc(100% + 4px)`, `background: linear-gradient(to bottom, rgba(53,193,195,.6) 2.4%, rgba(53,193,195,0) 99.98%)` (use the `in oklab` version too).
- Height: **189px** in the worker boxes, **295px** in the load box (the full box).

**⑦ Safe-zone group (`.how-safe`)**: Paper `BVG-0`
- Group: left **704**, top **471**, **409 × 256**.
- Line SVG at 0,0, `width 409 height 256 viewBox="-61 0 409 256" overflow visible`:
  `<path d="M-30.5 185L285 224" pathLength="1" fill="none" stroke="var(--dark-teal)" stroke-width="6"/>`
  (This is Paper's path reversed, so it draws **left → right**.)
- Left end cap `.how-safe__cap--l`: left 25, top 169, **8 × 32**, bg var(--dark-teal).
- Right end cap `.how-safe__cap--r`: left 342, top 208, **8 × 32**, bg var(--dark-teal).
- Tag `3.4 M FROM DROP ZONE ・SAFE`: teal variant (12px), left **-62**, top **121**. transform-origin: left center.

**⑧ Notification card (`.how-card`)**: Paper `BVN-0`
- Absolute **top 32, right 32** (Paper: left 892 + its 388 width = right edge at 1280). Anchor it on the **right** so the minimum-size scale keeps it inside the stage. transform-origin: top right.
- **Stacking:** `z-index: 10`. Every other canvas layer stays at `z-index: auto` or ≤ 5, so the card is **always above every step-5 element**: the safe-zone line, caps and tag, the dimmed drop-zone group, all three targets and their tags. That matters most on phones, where the minimum label size makes the card overlap the suspended-load box (§9.4).
- `background var(--white); border-radius 8px; padding 24px; display flex; flex-direction column; gap 10px; width max-content`
- Title `LIFT IN PROGRESS ・CAM 14`: var(--fs-medium) (18), weight 500, line-height 1.1, -0.03em, var(--navy).
- Body `2 workers outside the drop zone. No alert sent.`: width 340px (21.25rem), 16px / 150%, regular, var(--light-navy).

Everything in the canvas is `aria-hidden="true"` (§11 gives the stage one accessible description).

---

## 5. Pacing: why 7 s per step

You asked for 6–8 s. **Use 7 s (`STEP_MS = 7000`, one constant), so a full loop is 35 s.**
- Each step's build (the motion) finishes by about 3.0–3.5 s. That leaves **about 3.5 s of stillness** to read the active item's description (12–25 words), which is the minimum for comfortable reading.
- At 6 s, step 4 (the busiest: 7 layers) would get under 2 s of the looping arrows. That's too short to notice before the cut.
- At 8 s, steps 2 and 3 would sit idle for over 4.5 s, and the section would feel slow.
- All five steps use the same length, so the progress bars move at the same speed. Uneven bars look like bugs.

---

## 6. Step timelines

Times are **ms from the start of that step**. "On" means the part's `is-on` class is added (§7), which runs its **enter** transition. Every enter transition below is CSS on `.is-on`. Every **exit** (class removed) is the generic exit in §7.3.

Easing names: `out` = `var(--ease-out)` (cubic-bezier(.22,1,.36,1)), `inOut` = `var(--ease-in-out)` (cubic-bezier(.65,0,.35,1)), `draw` = `cubic-bezier(.45,0,.55,1)`.

### Step 1: "A camera you already own" (Paper C0X → AOS)
Base state: nothing on. The image is **mono** (luminosity).

| t | Part on | Enter transition |
|---|---|---|
| 0 | (item 01 active, progress starts) | |
| 600 | `frame-top` | clip-path `inset(0 100% 0 0)` → `inset(0)`, **520 ms draw** (draws left → right) |
| 1120 | `frame-right` | `inset(0 0 100% 0)` → `inset(0)`, **320 ms draw** (top → bottom) |
| 1440 | `frame-bottom` | `inset(0 0 0 100%)` → `inset(0)`, **520 ms draw** (right → left) |
| 1960 | `frame-left` | `inset(100% 0 0 0)` → `inset(0)`, **320 ms draw** (bottom → top) |
| 2280 | `frame-tag` | opacity 0 → 1 and translateY(6px) → 0, **500 ms out** |
| 3000 | `color` | colour image opacity 0 → 0.9 and mono 0.9 → 0, **1600 ms inOut** (luminosity → normal) |
| 4600–7000 | hold | |

The edge durations follow the edge lengths (1234 vs 687), so the line keeps one even speed as it goes round clockwise. Edge opacity switches instantly on enter; only the clip moves.

### Step 2: "Spot the people and the load" (B3G → BAU)
Base state: `color`. The step-1 frame and tag fade out through the generic exit.

| t | Part on | Enter transition |
|---|---|---|
| 400 | `w1` (right-bottom worker, first) | opacity 0 → 1, **450 ms out**; scale 0.98 → 1, 450 ms out |
| 700 | `w2` | the same |
| 1200 | `load-target` (suspended load) | the same |
| 2200 | `target-scan` (all 3 scan items at once) | translateY(-100%) → 0, **1200 ms out** (opacity instant) |
| 3400–7000 | hold | |

### Step 3: "Work out depth from one camera" (BI8 → BLX)
Base state: `color`. The step-2 targets fade out.

| t | Part on | Enter transition |
|---|---|---|
| 400 | `grid` | opacity 0 → **1** (the file already holds Paper's 50 %) **900 ms inOut**; translateY(12px) → 0, 900 ms out |
| 1600 | `grid-scan` | translateY(100%) → 0, **1400 ms out** (rises from below until it's fully in place; opacity instant) |
| 3000–7000 | hold | |

### Step 4: "Project the drop zone" (AW4 → BPN)
Base state: `color`. The step-3 grid fades out. **At t = 0 the slider auto-reveals** items 4 and 5 (§8.2).

| t | Part on | Enter transition |
|---|---|---|
| 0 | slider glides to show items 4 and 5 | 900 ms inOut (JS tween, §8.2) |
| 400 | `w1` | as in step 2 (no scan item this time) |
| 700 | `w2` | the same |
| 1000 | `load-target` | the same |
| 1800 | `ellipse` | opacity 0 → 1 and scale 0.92 → 1 (origin centre), **600 ms out** |
| 2300 | `side-lines` (left and right together) | stroke-dashoffset 1 → 0, **500 ms inOut** (top → bottom) |
| 2700 | `drop-fill` | clip-path `inset(0 0 100% 0)` → `inset(0)` **700 ms out** (pours top → bottom) + opacity 0 → 1, 300 ms |
| 3400 | `drop-tag` + `arrows` | tag: opacity and translateY(4px) → 0, 400 ms out. Arrows: container opacity 0 → 1, 400 ms; the arrow loop starts |
| 3400–7000 | arrows keep looping | |

**Arrow loop** (runs only while `arrows` is on):
```css
@keyframes how-arrow {
  0%       { opacity: .15; transform: translateY(-3px); }
  22%      { opacity: 1;   transform: translateY(0); }
  48%,100% { opacity: .15; transform: translateY(3px); }
}
.how-load__arrows.is-on .how-arrow { animation: how-arrow 1400ms var(--ease-in-out) infinite; animation-delay: calc(var(--i) * 140ms); }
```
Arrows `--i` 0–6, top to bottom. The result is a soft wave that runs down the column, one arrow after another, over and over. Base arrow opacity is 0.15, so between pulses the column stays faintly visible.

### Step 5: "Measure real distance" (ASG → BTD)
Base state: `color`, `w1`, `w2`, `load-target`, `ellipse`, `side-lines`, `drop-fill`. This is step 4's end state **without** the arrows and the orange tag, so those two fade out through the generic exit.

| t | Part on | Enter transition |
|---|---|---|
| 0 | `load-dim` | whole `.how-load` group opacity 1 → **0.6**, **500 ms inOut** |
| 700 | `safe-line` + `safe-cap-l` | line: dashoffset 1 → 0, **1000 ms inOut**, left → right. Left cap: opacity and scaleY(0) → 1 (origin centre), 250 ms out |
| 1700 | `safe-cap-r` | the same as the left cap, when the line reaches 100 % |
| 2000 | `safe-tag` | opacity 0 → 1, **500 ms out** (fade only) |
| 2900 | `card` | opacity 0 → 1 and translateY(16px) → 0, **600 ms out** (rises from slightly below) |
| 3500–7000 | hold | |

### After step 5 → step 1 (loop)
Step 1's base is empty, so every part fades out (generic exit). The colour image fades back to mono (600 ms, §7.3). The slider glides back to the start (§8.2). Step 1's first cue (600 ms) only fires once that's done.

---

## 7. Animation engine (vanilla JS)

### 7.1 The model: parts and cues
- Every animatable element carries `data-part="<name>"`. Several elements can share a name, as `side-lines` and `target-scan` do.
  The parts are: `color`, `frame-top`, `frame-right`, `frame-bottom`, `frame-left`, `frame-tag`, `w1`, `w2`, `load-target`, `target-scan`, `grid`, `grid-scan`, `ellipse`, `side-lines`, `drop-fill`, `drop-tag`, `arrows`, `load-dim` (on `.how-load`, adds `.is-on` → opacity .6), `safe-line`, `safe-cap-l`, `safe-cap-r`, `safe-tag`, `card`.
- A part is shown by adding `.is-on` and hidden by removing it. **All motion is CSS transitions.** JS only decides *when* classes change.
- Data, at the top of `how.js`:
  ```js
  const STEP_MS = 7000;
  const STEPS = [
    { base: [],  cues: [[600,'frame-top'],[1120,'frame-right'],[1440,'frame-bottom'],[1960,'frame-left'],[2280,'frame-tag'],[3000,'color']] },
    { base: ['color'], cues: [[400,'w1'],[700,'w2'],[1200,'load-target'],[2200,'target-scan']] },
    { base: ['color'], cues: [[400,'grid'],[1600,'grid-scan']] },
    { base: ['color'], cues: [[400,'w1'],[700,'w2'],[1000,'load-target'],[1800,'ellipse'],[2300,'side-lines'],[2700,'drop-fill'],[3400,'drop-tag'],[3400,'arrows']] },
    { base: ['color','w1','w2','load-target','ellipse','side-lines','drop-fill'],
      cues: [[0,'load-dim'],[700,'safe-line'],[700,'safe-cap-l'],[1700,'safe-cap-r'],[2000,'safe-tag'],[2900,'card']] },
  ];
  ```

### 7.2 The master clock is the progress bar
- `go(index)`:
  1. Cancel the previous item's fill animation (its fill snaps back to `scaleX(0)`, which is fine because that item dims in the same moment). Remove `is-active` and `aria-selected` from the old item; add them to the new one.
  2. **Apply the base:** for every part, toggle `.is-on` to whether it's in `STEPS[index].base`. Parts that turn off run their exit; parts that stay on don't move.
  3. Start the fill: `fill.animate([{transform:`${axis}(0)`},{transform:`${axis}(1)`}], {duration: STEP_MS, easing: 'linear', fill: 'forwards'})`. `axis` is `'scaleX'` on desktop and tablet (a horizontal bar) and `'scaleY'` on mobile (the vertical rail, §9.4). Keep this `Animation` as `clock`.
     When the breakpoint changes mid-step, call `clock.effect.setKeyframes(…)` with the other axis. That keeps `currentTime`, so the step doesn't restart.
  4. Reset the cue pointer and start the rAF loop. On each frame, read `clock.currentTime` and fire every cue whose time has passed and hasn't fired yet. Cues at 0 fire on the first frame.
  5. `clock.onfinish = () => go((index + 1) % 5)`.
- **Pause** = `clock.pause()`, stop the rAF loop, and add `.is-paused` to the stage. That sets `animation-play-state: paused` on the arrows. CSS transitions already running (≤ 1.6 s) are allowed to finish.
  **Resume** = `clock.play()`, restart the rAF loop, and remove `.is-paused`. The bar and the cues can't drift apart, because the cues read the bar's own clock.
- Use **no `setTimeout` chains** for cues. Everything goes through the clock.

### 7.3 CSS pattern for enter and exit (apply to every part)
```css
/* OFF (also the exit): fade out fast, then reset the geometry invisibly */
.how-part        { opacity: 0; transition: opacity 300ms ease, transform 0s linear 300ms, clip-path 0s linear 300ms; }
.how-part path   { transition: stroke-dashoffset 0s linear 300ms; }
/* ON: each part sets its own enter durations from §6 */
.how-frame__edge--top.is-on { opacity: 1; clip-path: inset(0); transition: clip-path 520ms cubic-bezier(.45,0,.55,1); }
```
- Off geometry per part: frame edges use their start `inset()` (§6). Targets: `scale(.98)`. Scans: `translateY(-100%)` (target) and `translateY(100%)` (grid). Grid: `translateY(12px)`. Ellipse: `scale(.92)`. Lines: `stroke-dasharray: 1; stroke-dashoffset: 1`. Drop fill: `inset(0 0 100% 0)`. Tags: `translateY(4–6px)`. Caps: `scaleY(0)`. Card: `translateY(16px)`.
- Exceptions:
  - The scans' opacity is instant on enter (`transition: transform …` only), so they *slide* in rather than fade.
  - The colour/mono image pair uses **600 ms inOut** as its exit (back to mono) and 1600 ms inOut as its enter.
  - `load-dim` isn't a `.how-part`. Its off state is opacity 1 and its on state 0.6, transition 500 ms inOut both ways.
- **Why this works:** clicking any step at any moment just re-applies a base. Removed parts fade out in 300 ms, kept parts stay put, and cues re-add the rest. No state can be left behind, so rapid clicking is safe.

### 7.4 Clicking a step
- Clicking any item calls `go(i)`. That includes **the active item, which restarts its step from 0**.
- The auto-advance carries on from the clicked step: 3 → 4 → 5 → 1 …
- A click that ends a mouse drag must **not** activate anything (§8.3).

### 7.5 Debug hook (for verification only)
Only when the URL contains `?debug-how`, expose `window.__how = { go(i), pause(), play(), seek(i, ms) }`.
`seek` does this:
1. Add `.is-instant` to the section (`*, *::before { transition: none !important }`).
2. `go(i)`, then pause.
3. Set `clock.currentTime = ms`, apply every cue ≤ ms, and run any slider tween to its end instantly.
4. Remove `.is-instant` after two frames.

Without the flag, the hook must not exist.

---

## 8. The slider (desktop and tablet)

### 8.1 Structure
```
.how-steps                   the viewport: width 100% (the container's content box, so it's clipped exactly at the
│                            container edge as in Paper); overflow-x auto; overflow-y hidden;
│                            scrollbar-width none (+ ::-webkit-scrollbar { display:none });
│                            overscroll-behavior-x contain; scroll-behavior auto (JS tweens it); cursor grab
└─ ol.how-steps__list        display flex; gap 24px; width max-content; list-style none; margin 0; padding 0
   └─ li > button.how-step   (§3.1) role="tab", one per step
```
At 1440 the list is 5 × 378.39 + 4 × 24 = **1988px** wide in a **1312px** viewport. Item 4 shows about 105px, and the maximum scroll is **676px**. Paper's step-4 and step-5 frames show exactly that end position (list left at −612 in artboard px).

### 8.2 Auto-reveal when a step starts
`reveal(i)` runs at t = 0 of every step (horizontal layouts only):
- If item *i* is already fully inside the viewport, do nothing. On desktop this is the case for steps 2 and 3.
- Otherwise, target `scrollLeft = clamp(item.offsetLeft − list.offsetLeft, 0, max)`. On desktop that gives step 4 → 676 (the end, so items 4 and 5 are fully visible), step 5 → stays at the end, and step 1 (after the loop) → 0.
- Animate `scrollLeft` with a **rAF tween over 900 ms using ease-in-out** (`t<.5 ? 4t³ : 1−(−2t+2)³/2`). Don't use `scrollTo({behavior:'smooth'})`, because its speed can't be controlled and it feels abrupt.
- **The user wins:** any `pointerdown`, `wheel`, `touchstart` or `keydown` on the viewport cancels a running tween immediately.

### 8.3 Mouse drag
- On `pointerdown` with `pointerType === 'mouse'` and the main button: store `startX` and `startScroll`, and call `setPointerCapture`.
- On `pointermove`: `scrollLeft = startScroll − (x − startX)`. Once the pointer has moved more than **6px**, mark the gesture as a drag. While dragging, add `.is-dragging` (cursor grabbing, `user-select: none`). Images inside must not ghost-drag (`draggable="false"`).
- On `pointerup`: if it was a drag, swallow the next `click` with a capture-phase listener and `preventDefault` plus `stopPropagation`, so the drag doesn't activate a step.
- Touch and trackpad use **native** scrolling. Don't intercept them.

### 8.4 Keyboard
Follow the ARIA tabs pattern with **manual activation**, so keyboard users can browse the slider without restarting the animation each time:
- The tablist has **one tab stop**: the active tab has `tabindex="0"` and the others `-1`.
- **← / →** move focus to the previous/next tab and wrap at the ends. **Home / End** go to the first/last. Moving focus brings the focused item fully into view with the same 900 ms tween (smooth keyboard scrolling). Never use `scrollIntoView`, because it can scroll the page vertically.
- **Enter / Space** activates the focused tab (`go(i)`).
- On mobile (the vertical timeline, §9.4), set `aria-orientation="vertical"` on the tablist and accept **↑ / ↓** as well. On desktop and tablet, set `aria-orientation="horizontal"`. Update it when the breakpoint changes.
- Visible focus ring: `outline: 2px solid var(--teal); outline-offset: 6px; border-radius: 2px` on `:focus-visible` only.

---

## 9. Responsive behaviour

### 9.1 Spacing (fluid: desktop values from Paper, mobile values part of the §9.4 design)
- Section padding-top `clamp(6rem, 4.51rem + 6.1vw, 10rem)` (160 → 96). Padding-bottom `clamp(4rem, 3.16rem + 3.43vw, 6.25rem)` (100 → 64).
- Header → stage gap `clamp(3rem, 2.26rem + 3.05vw, 5rem)` (80 → 48). Stage → slider gap `clamp(2.5rem, 2.04rem + 1.9vw, 3.75rem)` (60 → 40).

### 9.2 Desktop (≥ 72rem)
- Exactly as Paper: a horizontal slider, items at 23.65rem, item 4 cut off by default, the auto-reveal at step 4, drag and keyboard as in §8.

### 9.3 Tablet (48rem – 71.99rem): "the slider with a horizon"
Paper has no tablet frame, so this is the design. It keeps the desktop structure, but the cut-off edge is designed on purpose instead of being a hard crop.

```
 768 ───────────────────────────────────────────────────────────
                    ■ HOW AILYTICS WORKS
          Understand depth from a single camera,
                   with no new hardware              ← h2 balanced on 2 lines
 ┌─────────────────────────────────────────────────────────────┐
 │                                                             │
 │              stage, full container width, 1312:766          │ k ≈ 0.53
 │                                                             │
 └─────────────────────────────────────────────────────────────┘
 ━━━━━━━━━━━━━━━──────   ─────────────────────   ──────────░░░
 01                      02                      03        ░░░  ← right edge fades
 A camera you            Spot the people         Work out  ░░░    out over 3rem
 already own             and the load            depth fr  ░░░
 One of the CCTV feeds…  Ailytics finds…         From that ░░░
```
- **Header:** centred as on desktop, h2 `max-width: 40rem` with `text-wrap: balance`, so it always breaks into two even lines.
- **Stage:** full container width, same 1312 : 766 ratio, scaled by `--how-k` (≈ 0.53 at 768, ≈ 0.84 at 1151). Labels stay at least 60 % of their desktop size through `--how-label-k`.
- **Slider:** the same horizontal slider, drag and keyboard as desktop. Item width `flex: 0 0 clamp(17.5rem, calc((100% - 3rem) / 2.35), 22rem)`. That always shows **two whole items plus a slice of the third**, the same "there's more" cue as Paper's cut-off item 4.
- **Edge fades (tablet only; desktop keeps Paper's hard cut):** the cut-off side fades out over 3rem, so it reads as a horizon rather than a crop.
  ```css
  @property --how-fade-l { syntax: '<length>'; inherits: false; initial-value: 0px; }
  @property --how-fade-r { syntax: '<length>'; inherits: false; initial-value: 0px; }
  .how-steps {
    transition: --how-fade-l 300ms ease, --how-fade-r 300ms ease;
    -webkit-mask-image: linear-gradient(to right, transparent 0, #000 var(--how-fade-l), #000 calc(100% - var(--how-fade-r)), transparent 100%);
            mask-image: linear-gradient(to right, transparent 0, #000 var(--how-fade-l), #000 calc(100% - var(--how-fade-r)), transparent 100%);
  }
  .how-steps.has-more-start { --how-fade-l: 3rem; }
  .how-steps.has-more-end   { --how-fade-r: 3rem; }
  ```
  JS toggles `has-more-start` (`scrollLeft > 1`) and `has-more-end` (`scrollLeft < max − 1`) on `scroll` (throttled with rAF), on resize, and after every reveal tween.
- **Reveal:** the same `reveal(i)` rule. On tablet it runs on **every** step change, because steps 2–5 can all start partly hidden.
- Descriptions are visible on every item (20 % when inactive), as on desktop.

### 9.4 Mobile (< 48rem): "the timeline"
The five desktop progress segments, turned 90°. Each item becomes a segment of one **vertical rail**, so the list reads as a single timeline and not as five stacked cards. The whole block (stage plus five rows) fits in one phone screen, so the animation and the active text are visible together without scrolling.

```
 390 ─────────────────────────────────
         ■ HOW AILYTICS WORKS
     Understand depth from a
     single camera, with no
          new hardware                  ← ≈ 33px, balanced, centred
 ┌───────────────────────────────────┐
 │        stage, 1312:766            │  k ≈ 0.27 (≈ 209px tall)
 └───────────────────────────────────┘
                                        ← 2rem
 ┃  01  A camera you already own        ← ACTIVE: rail fills top → bottom over 7 s
 ┃      One of the CCTV feeds the  ← description opens (only on the active row)
 ┃      site already has. No new…
 ┃                                      ← 0.5rem gap = a break in the rail
 │  02  Spot the people and the load    ← inactive rows: number + title at 20 %
 │
 │  03  Work out depth from one camera
 │
 │  04  Project the drop zone
 │
 │  05  Measure real distance
```
- **Header:** centred, the site's mobile `--fs-h2` (≈ 33px at 390), `text-wrap: balance`, max-width 22rem.
- **Stage on top:** full container width, with the radius 4 and the **same 1312 : 766 ratio** and composition as desktop, scaled by `--how-k`. Labels and the card keep the 60 % minimum (§4.1).
  - The notification card gets `z-index: 10` (§4.3 ⑧), so in step 5 it sits **above every other step-5 element** where it overlaps the suspended-load box.
  - On mobile only, the card also gets `box-shadow: 0 8px 24px rgb(25 36 57 / 0.3)` (canvas px), so the overlap reads as an intentional layer, not a collision.
- **Stage → list:** 2rem.
- **The list** (`.how-steps` with `overflow: visible`, no scroll; `.how-steps__list` `flex-direction: column; gap: 0.5rem; width: auto`):
  - Each item: `display: grid; grid-template-columns: 2px 1fr; column-gap: 1.25rem; min-height: 2.75rem` (a 44px tap target).
  - **Rail** (`.how-step__progress`): `grid-row: 1 / -1; width: 2px; height: auto` (it stretches to the item's full height). Track: 2px white at 20 %, radius 2px. Fill: white, `transform-origin: top`, animated with **`scaleY`** (see §7.2, step 3). The 0.5rem gaps between items break the rail into five segments, like the desktop bars.
  - **Details:** `padding-block: 0.875rem`. Inside, use `display: grid; grid-template-columns: 2rem 1fr; align-items: baseline`:
    - the number ("01", 16px / 150%, light-white) sits in the fixed **2rem lane**, so all five titles line up on one vertical edge;
    - the title (`--fs-h5`, ≈ 18px) goes in column 2;
    - the description sits in column 2 on the next row (`grid-column: 2`), aligned under the title, not under the number.
  - **Active vs inactive:** details at 100 % vs 20 % (the same rule as desktop, 400 ms).
  - **Description only on the active row:** wrap it in a collapse: `display: grid; grid-template-rows: 0fr` → `1fr`, with `transition: grid-template-rows 450ms var(--ease-out), opacity 300ms ease 100ms`; inner `overflow: hidden; min-height: 0`. Inactive is rows 0fr plus opacity 0; active is 1fr plus opacity 1. The opening and closing rows animate at the same time, so the list height barely changes.
- **Interaction:** tapping any row activates it (and restarts it if it's already active), as on desktop. The drag code, `reveal()` and the edge fades are **off** on mobile (check with `matchMedia('(max-width: 47.99rem)')`). Keyboard on mobile uses ↑ / ↓ as well as ← / →.
- **The page must never auto-scroll** on mobile. Nothing in the loop may change the window's scroll position.

### 9.5 On resize or breakpoint change
Recompute `--how-k` and `--how-label-k` (ResizeObserver), clamp `scrollLeft` to the new maximum, and re-reveal the active item **instantly** (no tween). The animation clock doesn't restart.

---

## 10. When it plays

- An `IntersectionObserver` on `.how-stage` (threshold 0.35) handles playback:
  - The **first time** the stage becomes visible, call `go(0)`, so every visitor sees step 1 from the start. Before that, show the step-1 base (mono image, item 01 active, bar at 0).
  - When it **leaves** the viewport, pause. When it **returns**, resume where it stopped.
- `document.visibilitychange`: pause while the tab is hidden, and resume when it's visible again (only if the stage is in view).
- **No JS:** use the existing `.js` class on `<html>`. Without it, show the step-1 scene-2 look (colour image, frame and tag visible, item 01 at 100 % with a full bar). Never show a blank stage.

---

## 11. Accessibility and reduced motion

- `<section class="how" aria-labelledby="how-title" data-how>`.
- `ol.how-steps__list` gets `role="tablist"` and `aria-label="How Ailytics works, 5 steps"`. Each `button.how-step` gets `role="tab"`, `id="how-tab-N"`, `aria-controls="how-stage"`, `aria-selected`, `aria-labelledby` = its title id and `aria-describedby` = its description id.
- `.how-stage` gets `id="how-stage" role="tabpanel"`, and `aria-labelledby` updates to the active tab.
  The colour `<img>` has `alt="CCTV view of a construction site where a crane lifts a load while two workers stand beside a 'Danger: lifting in' sign"`. All overlays are `aria-hidden="true"`.
- **No `aria-live`**: an announcement every 7 s would be noise.
- `prefers-reduced-motion: reduce`:
  - Steps still change every 7 s and the bar still fills (it's a timer, not decoration).
  - Every enter and exit becomes a **plain 250 ms opacity fade**: no clip, scale, translate or line drawing (parts appear complete).
  - The arrow loop is off (arrows static at full opacity).
  - Slider reveals jump instantly.
- Listen for changes to the reduced-motion media query at runtime. Don't only read it once.

---

## 12. Things that must NOT change

- No other section's markup, CSS or JS. No new dependencies. No GSAP in this section.
- No layout shift: the stage reserves its space with `aspect-ratio` before the image loads.
- No horizontal page scroll at any width (only `.how-steps` scrolls sideways).
- Nothing may scroll the window except the user.

---

## 13. Build steps: do them in this order and check each one

1. **Assets (§2).** Make the WebP files (camera and ground grid) and check their sizes. Check the ground-grid WebP kept its transparency.
2. **Static markup and CSS (§3, §4)** with every part forced on (temporary class `.how--all-on`). Compare against Paper `BTD-0` plus `BLX-0` at 1440 using the built-in browser preview (`.claude/launch.json` → `static`). Check positions, sizes, colours and stacking order. Then remove the force class.
3. **Slider (§8)** without the animation: drag, native trackpad scroll, keyboard focus movement, and `reveal()` with the tween. Check the maximum scroll is 676px at 1440.
4. **Engine (§7)**: progress clock, base and cues, auto-advance, loop, click to jump, restart on clicking the active item.
5. **All five timelines (§6)**, one step at a time. Use `?debug-how` plus `seek()` to freeze each Paper checkpoint (§14) and compare screenshots.
6. **Responsive (§9)** at 1440, 1280, 1152, 1024, 768, 390 and 360.
7. **Triggers, a11y and reduced motion (§10, §11).**
8. **Final check (§15)**, then report.

---

## 14. Verification checkpoints (compare each one to its Paper frame)

Use `__how.seek(step, ms)` at 1440 × 900, take a screenshot of the section, and compare it with the Paper frame (positions, colours, which layers are visible, the slider's position, which item is active).

| Paper frame | Seek | Must match |
|---|---|---|
| step1-scene1 `C0X-0` | (0, 500) | mono image, no overlays, item 01 active, list at 0 |
| step1-scene2 `AOS-0` | (0, 6500) | colour image, dashed teal frame and CAM 14 tag |
| step2-scene1 `B3G-0` | (1, 1900) | 3 white targets, no scan items |
| step2-scene2 `BAU-0` | (1, 6500) | 3 targets with teal scans fully in place |
| step3-scene1 `BI8-0` | (2, 1500) | ground grid (same strength as Paper, not lighter), no scan, no targets |
| step3-scene2 `BLX-0` | (2, 6500) | grid with teal scan fully risen |
| step4-scene1 `AW4-0` | (3, 1700) | 3 targets only; **list scrolled to the end** (items 4 and 5 fully visible) |
| step4-scene2 `BPN-0` | (3, 6500) | ellipse, sides, orange gradient, arrows, PROJECTED DROP ZONE tag |
| step5-scene1 `ASG-0` | (4, 2700) | load group at 60 %, no arrows or orange tag, teal line with both caps, teal tag, no card |
| step5-scene2 `BTD-0` | (4, 6500) | as above plus the notification card |

Then watch **two full real-time loops** with no debug flag and check the motion itself: it should be smooth, refined and subtle, with no flicker on step changes, no jumps when parts are removed, and no layout shift.

---

## 15. Final check (all must be true before you call it done)

- [ ] Each of the 10 checkpoints matches its Paper frame at 1440.
- [ ] Each step lasts 7 s, the bar fills linearly 0 → 100 % over exactly that time, and step 5 loops to step 1.
- [ ] The active item's details are at 100 % and the others at 20 %, with a 400 ms transition. Only the active item shows a fill.
- [ ] Step 4 glides the slider so items 4 and 5 show. The loop back to step 1 glides it back to 0.
- [ ] Clicking any item, mid-step or mid-transition, switches cleanly. Clicking the active item restarts it. Ten fast random clicks leave no stray layers.
- [ ] Mouse drag scrolls the slider and never activates a step. Trackpad and touch scroll natively. Keyboard ← → Home End move focus and scroll smoothly. Enter/Space activates.
- [ ] Off-screen or hidden tab pauses everything (bar included). Returning resumes in sync.
- [ ] Mobile (390, 360) matches the §9.4 wireframe:
  - the stage is on top with the same ratio and composition;
  - there's one vertical rail in 5 segments, and the active segment fills top → bottom;
  - the numbers sit in one lane and the titles line up on one edge;
  - only the active description shows, and it opens and closes smoothly;
  - tapping works, and there's no page auto-scroll;
  - the stage plus all 5 rows fit in a 390 × 844 screen.
- [ ] Mobile step 5: the notification card is above every other element where they overlap.
- [ ] Tablet (768, 1024) matches the §9.3 wireframe: two whole items plus a slice, the edge fades appear and disappear with the scroll position, and the active item is always revealed.
- [ ] Ground grid looks as strong as in Paper (not halved), and the background pattern shows at 2 % above and beside the stage.
- [ ] Step 4 shows exactly 7 arrows.
- [ ] There's no pause button.
- [ ] Reduced motion: fades only, no loop on the arrows, instant slider moves.
- [ ] No console errors. No horizontal page scroll at 360. The rest of the homepage is unchanged.
- [ ] The camera image downloads once (both layers share the same URL).

### Report back
1. Screenshots of the 10 checkpoints next to the Paper frames.
2. Screenshots at 1024, 768, 390 and 360, in step 1 and step 5.
3. Anything you could not match, and why.
4. Any value in this prompt that disagreed with Paper.

### Already decided (don't change, don't ask)
- **No pause button.** It's a deliberate choice, made knowing that WCAG 2.2.2 recommends one for auto-advancing content.
- **7 arrows** in step 4.
- **Background pattern at 2 %**, recreated in CSS.
- **Copy fixes:** "frame", "depth" and "One of the CCTV feeds".
- **Notification card** is above every other step-5 element (`z-index: 10`).
- **Tablet and mobile designs** are as in §9.3 and §9.4.

### Decisions this prompt makes that Paper doesn't specify (confirm or change)
- 7 s per step (35 s loop), and all of the motion timings in §6.
- Manual keyboard activation (arrows move focus, Enter/Space activates).
- The minimum label size on phones: 60 % of desktop (§4.1).
