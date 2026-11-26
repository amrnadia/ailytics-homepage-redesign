# Build prompt: Ailytics hero-right product simulation

> Paste everything below the line into Claude Code, run from the project root
> (`/Users/nadia/Documents/2026 Mac/Ailytics homepage redesign`).

---

## 0. Role and goal

You are building the **right column of the Ailytics homepage hero**: an animated "live camera wall" that plays 6 scenes. In each scene, one of 6 CCTV tiles is detected as having a problem: it turns on, shows its label, runs a scan sweep, and the alert button below shows matching text.

Use **plain HTML + CSS + vanilla JavaScript only.** No frameworks, no build step, no npm, no animation libraries. Opening `index.html` in a browser must just work.

The design source is the Paper file **"Ailytics homepage redesign"**, page `homepage`:

| What | Paper artboard |
|---|---|
| Full homepage context | `homepage-default` (node `15K-0`) |
| Scene 1 – Safety | `home-right-scene1 (safety)` (`20A-0`) |
| Scene 2 – Safety | `home-right-scene2 (safety)` (`1O3-0`) |
| Scene 3 – Security | `home-right-scene3 (security)` (`1KG-0`) |
| Scene 4 – Security | `home-right-scene4 (security)` (`XQ-0`) |
| Scene 5 – Productivity | `home-right-scene5 (productivity)` (`1WN-0`) |
| Scene 6 – Productivity | `home-right-scene6 (productivity)` (`1D6-0`) |
| Alert button hover state | `scene1-button hover` (`1GT-0`) |
| Camera tile off / on reference | `Frame 9171` (`25V-0` = on, no scan; `IE-0` = on, mid-scan) |

If the Paper MCP is connected, use `get_screenshot` / `get_jsx` on these nodes to check your work. **The values in this prompt were taken from those nodes, so if anything here disagrees with Paper, Paper wins.** Tell me about any disagreement you find.

**Scope:** build only the right column (720 × 900 at desktop). The left column (headline, CTA, etc.) and the navbar are out of scope. Leave the left half of the page empty, or show a plain light placeholder, so the column sits where it will in the real page.

---

## 1. Files to create

```
index.html          ← markup for the hero-right column
styles.css          ← tokens + all styles
simulation.js       ← scene data + state machine
images/hero-right-images/   ← already exists, see §2
```

Keep all scene content in **one data array** in `simulation.js` (see §5). The DOM for the 6 tiles is static in `index.html`. JS only toggles classes and swaps text. Don't rebuild the DOM on each scene.

---

## 2. Assets

Camera images are already in the project:

| Tile | File |
|---|---|
| CAM 1 · YARD | `images/hero-right-images/hero-cam1-yard .jpeg` ⚠️ the filename has a **space before `.jpeg`**. Rename it to `hero-cam1-yard.jpeg` first and use the new name |
| CAM 2 · DOCK | `images/hero-right-images/hero-cam2-dock.jpeg` |
| CAM 3 · TOWER A | `images/hero-right-images/hero-cam3-tower-a.jpeg` |
| CAM 4 · GATE | `images/hero-right-images/hero-cam4-gate.jpeg` |
| CAM 5 · PLANT 2 | `images/hero-right-images/hero-cam5-plant-2.jpeg` |
| CAM 6 · PLANT 2 | `images/hero-right-images/hero-cam6-plant-2.jpeg` |

Each tile uses **one image for both states.** The off state is made with CSS (navy border + `mix-blend-mode: luminosity`), not with a second image.

Column background: the design puts a faint site photo under a navy gradient. If you can't get the photo from Paper, use only the gradient (see §3.2). Don't block on it.

Font: **Switzer** (Regular 400, Medium 500), loaded from Fontshare:
```html
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500&display=swap" rel="stylesheet">
```
Fallback: `system-ui, sans-serif`.

---

## 3. Design tokens and layout (exact values)

### 3.1 Tokens: define on `:root`

```css
--dark-navy:   #192439;
--navy:        #263C5C;
--light-navy:  #263C5CCC;
--white:       #FFFFFF;
--light-white: #FFFFFFCC;
--orange:      #FF6C2F;   /* Safety */
--yellow:      #FBC02D;   /* Security */
--teal:        #34C1C3;   /* Productivity */

/* set by JS per active category */
--accent: var(--orange);
--accent-60: #FF6C2F99;   /* accent at 60% alpha, for the scan band */
```

Category → accent:

| Category | `--accent` | `--accent-60` |
|---|---|---|
| safety | `#FF6C2F` | `#FF6C2F99` |
| security | `#FBC02D` | `#FBC02D99` |
| productivity | `#34C1C3` | `#34C1C399` |

### 3.2 Column container (`.hero-right`)

- Size 720 × 900, `position: relative`, `overflow: hidden`.
- Padding: top 140px, right 80px, bottom 90px, left 64px. Flex column, content vertically centered.
- Background: `#192439`, with this on top: `linear-gradient(132.8deg, #192439 56%, #192439A1 144%)`. This gives the slightly lighter bottom-right corner you see in the screenshots.

### 3.3 Simulation frame (`.sim`)

- `border: 1px dashed var(--accent)`. **The dashed border color follows the active category.**
- `padding: 48px`, flex column, `gap: 24px`.
- Animate `border-color` with a 300ms ease when the category changes.

### 3.4 Tabs (`.sim-tabs`), inside the frame at the top

- Row, `gap: 22px`, align center. Three tabs: **SAFETY · SECURITY · PRODUCTIVITY**.
- Each tab is a `<button>` with: a 5.55 × 5.55px square dot (no radius) + label, `gap: 10px`.
- Dot color is **fixed per tab** (orange / yellow / teal) and never changes.
- Label: Switzer Regular, 12px, line-height 150%, `text-transform: uppercase`, color `--white`.
- Active tab: `opacity: 1`. Inactive tabs: `opacity: 0.4`. Transition opacity 300ms.
- Hover on an inactive tab: `opacity: 0.7`, cursor pointer.
- No background, no border, no underline.

### 3.5 Camera grid (`.cam-grid`)

- 3 rows × 2 columns. Row gap 12px, column gap 12px.
- Each tile: **240.63 × 144.38px** (use `240.63px`/`144.38px`, or a 5:3 aspect ratio at the same width).

### 3.6 Camera tile (`.cam`): layered, top to bottom

All layers are `position: absolute` inside a `position: relative; overflow: hidden; border-radius: 4px` tile.

1. **Image layer** (`.cam__img`): full size, `background-size: cover; background-position: 50%`, `border: 1.925px solid`, `border-radius: 1.85px`, `background-origin: border-box`.
2. **Top shade** (`.cam__shade`): an 80px-tall band across the top of the tile that darkens it so the cam label stays readable. `linear-gradient(to bottom, #19243999 2.4%, #19243900 100%)`, top 0, full width, height 80px.
3. **Scan band** (`.cam__scan`): see §4.2. Hidden when off.
4. **Cam label** (`.cam__name`): e.g. `CAM 1 ・ YARD` (the separator is the full-width katakana middle dot `・`, U+30FB). Position top 11.6px, left 11.9px. Switzer Medium 500, 10px, line-height 150%, color `--white`. **Visible in both states.**
5. **Description pill** (`.cam__tag`): e.g. `Reversing`. Position left 11.6px, top 110.7px (≈ 10px from bottom). Background `--dark-navy`, `border-radius: 3.7px`, padding 2px 8px, height ~23.4px. Text: Switzer Medium 500, 12px, line-height 150%, `--white`. **Only visible in the on state.**

### 3.7 Alert button (`.sim-alert`), below the grid

- It's an `<a href="https://www.ailytics.ai/use-cases">`. The whole card is the link.
- Width 494.95px (same as the grid width + a little; it's fine to use `width: 100%` of the grid width). Flex row, align center, `gap: 5.55px`, padding 14.8px 18.5px.
- `background: var(--dark-navy)`, `border: 1px solid var(--white)`, `border-radius: 7.4px`.
- Left content: flex column, `gap: 5.55px`, `flex: 1`.
  - Meta row, `gap: 14.8px`:
    - `[dot] LIVE`: 5.55px square dot in `--accent`, `gap: 10px`, text Switzer Medium 500, 12px, uppercase, `--light-white`.
    - Cam ref, e.g. `CAM 1 ・ YARD`, same text style.
  - Message, e.g. `Person behind reversing truck`: Switzer Regular, 16px, line-height 150%, `--white`.
- Right: arrow box, `background: var(--accent)`, `border-radius: 4px`, padding 10px, 24px arrow icon:
  ```html
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
  ```
- **Hover / focus-visible state** (from the `scene1-button hover` artboard):
  - `background: var(--white)`
  - LIVE and cam ref text → `--light-navy`
  - Message text → `--navy`
  - Dot and arrow box stay `--accent`
  - Transition background and colors over 200ms.

---

## 4. Camera tile states

### 4.1 OFF (default)

- Image layer: `mix-blend-mode: luminosity; border-color: var(--dark-navy);`. This gives the desaturated navy look.
- Cam label visible. Description pill hidden (`opacity: 0`). Scan band hidden.

> `mix-blend-mode: luminosity` only works if there's a colored backdrop behind the image. Give `.cam` a `background-color: var(--dark-navy)` so the blend has navy to mix with. Then check the off tiles look like the grayscale-navy tiles in the Paper screenshots. If they don't, tell me and propose a fallback (for example `filter: grayscale(1)` plus a navy overlay at ~35%) before you switch to it.

### 4.2 ON (the scene's active tile)

**Each scene lasts 4000ms in total.** The order matters:

1. **t = 0ms → 300ms, reveal:**
   - Image layer: `mix-blend-mode: normal` (full color), `border-color: var(--accent)`.
     Blend mode can't be transitioned, so crossfade instead: stack two copies of the image (one with luminosity, one normal) and fade the color copy's opacity 0 → 1 over 300ms. Transition `border-color` 300ms.
   - Description pill fades in: opacity 0 → 1, translateY(4px) → 0, 300ms ease-out.
   - Cam label stays as is.
2. **t = 300ms → 2300ms, scan sweep (exactly 2s, starts after the reveal finishes):**
   - `.cam__scan` is an 80px-wide, full-height band:
     `background: linear-gradient(to left, var(--accent-60) 2.4%, transparent 100%);`
     The accent edge is on the **right**, fading out to the left.
   - It starts **fully off the right edge** (`left: 100%`, i.e. `transform: translateX(tile width)`) and moves **right → left** until it's **fully off the left edge** (`translateX(-80px)` from left 0). So it actually disappears, not just reaches the edge.
   - Duration 2000ms, `linear` easing (or `cubic-bezier(.4,0,.2,1)` if linear looks mechanical, but keep the total at 2s).
   - Use a CSS `@keyframes` animation that starts when the `is-on` class is added. Use `transform`, not `left`, so it runs on the GPU.
3. **t = 2300ms → 4000ms, hold:** the tile stays on (color, accent border, pill visible), with no scan band. This gives the visitor time to read the pill and the alert text.
4. **t = 4000ms, scene end, deactivate:** reverse the reveal over 300ms (color copy fades out, border back to navy, pill fades out). The next scene's tile can start its reveal at the same moment, so the handover overlaps.

---

## 5. Scene data (put this in `simulation.js` as-is)

```js
const CAMS = [
  { id: 1, name: 'CAM 1 ・ YARD',    img: 'images/hero-right-images/hero-cam1-yard.jpeg' },
  { id: 2, name: 'CAM 2 ・ DOCK',    img: 'images/hero-right-images/hero-cam2-dock.jpeg' },
  { id: 3, name: 'CAM 3 ・ TOWER A', img: 'images/hero-right-images/hero-cam3-tower-a.jpeg' },
  { id: 4, name: 'CAM 4 ・ GATE',    img: 'images/hero-right-images/hero-cam4-gate.jpeg' },
  { id: 5, name: 'CAM 5 ・ PLANT 2', img: 'images/hero-right-images/hero-cam5-plant-2.jpeg' },
  { id: 6, name: 'CAM 6 ・ PLANT 2', img: 'images/hero-right-images/hero-cam6-plant-2.jpeg' },
];
// Grid order (row by row): [1, 2] / [3, 4] / [5, 6]

const SCENES = [
  { category: 'safety',       cam: 1, tag: 'Reversing',       message: 'Person behind reversing truck' },
  { category: 'safety',       cam: 6, tag: 'No hard hat',     message: 'Missing hard hat in low light' },
  { category: 'security',     cam: 4, tag: 'Wrong way',       message: 'Wrong-way vehicle at gate' },
  { category: 'security',     cam: 5, tag: 'Restricted area', message: 'After-hours restricted-area entry' },
  { category: 'productivity', cam: 2, tag: '14 on shift',     message: '14 workers on shift at dock' },
  { category: 'productivity', cam: 3, tag: 'Idle 2h 10m',     message: 'Piling rig idle since 07:40' },
];

const CATEGORIES = ['safety', 'security', 'productivity'];

const TIMING = {
  scene: 4000,     // total length of each scene, then go to the next one
  reveal: 300,     // tile color/border/pill in (t = 0 → 300)
  scan: 2000,      // scan sweep right → left (t = 300 → 2300)
  // hold = scene - reveal - scan = 1700ms, tile stays on for reading
  textSwap: 250,   // alert button text crossfade
};
// One scene = 4s, one full loop of 6 scenes = 24s.
```

(Paper has `14 on shif` on scene 5's pill. That's a typo, so `14 on shift` is used here.)

The alert button's cam ref comes from the active scene's cam (e.g. scene 2 → `CAM 6 ・ PLANT 2`).

---

## 6. Behavior / state machine

Keep one state object: `{ sceneIndex, timerId }`. Everything comes from `sceneIndex`.

### 6.1 Autoplay loop

- On load, start at scene 0 (Safety, CAM 1).
- Each scene lasts `TIMING.scene` (4000ms). Then go to `sceneIndex + 1`, and after scene 5 wrap to 0. **It loops forever while the page is open.**
- The active tab always matches the current scene's category. So the tabs auto-advance as a result: SAFETY (scenes 1–2) → SECURITY (3–4) → PRODUCTIVITY (5–6) → SAFETY…
- Use one `setTimeout` chain, not `setInterval`, and always `clearTimeout` before scheduling. This prevents overlapping timers when the user clicks.

### 6.2 Entering a scene, `goToScene(i)`

In this order:
1. Clear any pending timer.
2. Set `--accent` / `--accent-60` on `.sim` to the scene's category colors (dashed border, alert dot, arrow box and scan band all read from these).
3. Update the tabs: the active one gets `is-active` + `aria-selected="true"`, the others `false`.
4. Turn off the previous tile (remove `is-on`). Set the new tile's pill text, then add `is-on`. To restart the scan animation when the same tile is re-activated, remove the class, force a reflow (`void el.offsetWidth`), then add it again.
5. Crossfade the alert button text: fade content to opacity 0 over `textSwap/2`, swap the cam ref + message, fade back in.
6. Schedule `goToScene(next)` after the scene duration.

### 6.3 Tab click

- Clicking a tab jumps to the **first scene of that category** (Safety → 0, Security → 2, Productivity → 4) and **restarts** the timer from there. Autoplay then continues normally (e.g. click Security → scene 3 → scene 4 → Productivity…).
- Clicking the tab that's already active restarts that category from its first scene.
- Tabs must be keyboard-usable: `role="tablist"` on the container, `role="tab"` on buttons, Left/Right arrows move focus, Enter/Space activates.

### 6.4 Alert button click

- It's a plain link to `https://www.ailytics.ai/use-cases` (same tab, no `target="_blank"` unless I say otherwise). Same URL for every scene. Only the text changes.

### 6.5 Pause on hover and focus only (WCAG 2.2.2 Pause, Stop, Hide)

The loop pauses **only** while the visitor is hovering the simulation or has keyboard focus inside it. In every other case it keeps running.

- **Pause triggers** on the `.sim` frame (tabs + grid + alert button):
  - `pointerenter` with `pointerType === 'mouse'`. Ignore touch/pen, so a tap on a phone doesn't freeze the loop.
  - `focusin` (keyboard focus on a tab or the alert link).
- **Resume** only when **both** are false: the pointer has left (`pointerleave`) **and** focus has left the frame (`focusout` where `e.relatedTarget` is not inside `.sim`). Track this with two flags, `isHovered` and `hasFocus`, and pause while `isHovered || hasFocus`.
- **Freeze, don't reset.** Pausing freezes the scene exactly where it is:
  - Store the remaining time: `remaining = TIMING.scene - (performance.now() - sceneStartedAt)`, then `clearTimeout`.
  - Freeze the CSS scan animation with `animation-play-state: paused` (toggle a `.is-paused` class on `.sim`).
  - On resume, clear `.is-paused` and schedule the next scene after `remaining` ms, not a full 4000ms. Reset `sceneStartedAt` so a second pause in the same scene still works out correctly.
- **Tab click while paused:** go to that category's first scene as usual. The new scene starts in the paused state (tile on, scan frozen at its start) and plays once the pointer and focus leave.
- **No visible pause indicator** is needed. Hover/focus is the control.
- **No other pausing:** not when the browser tab is hidden. Don't add `visibilitychange` handling. Browsers slow down timers in background tabs. That's fine. The loop just carries on when the visitor returns, with no catch-up or skipping scenes.

### 6.6 Reduced motion (required)

- Support `prefers-reduced-motion: reduce` in both CSS (`@media (prefers-reduced-motion: reduce)`) and JS (`window.matchMedia('(prefers-reduced-motion: reduce)')`, with a `change` listener so it updates live).
- When it's on:
  - **No scan sweep.** Don't run the band animation (`.cam__scan { display: none; }`).
  - **No movement.** The pill has no translateY. Use only opacity fades of 200ms or less.
  - Tile color/border and the button text still change with short opacity fades.
  - The scene still advances every 4000ms and loops forever. Only the motion is removed, not the simulation.

---

## 7. Accessibility

- Every tile is a `<figure>` with `aria-label` = the cam name. Images are CSS backgrounds, so they're decorative.
- The alert link has an accessible name that includes the message, e.g. `aria-label="Person behind reversing truck — see use cases"`. Update it on each scene.
- Put an `aria-live="polite"` region on the alert message so screen readers announce new alerts. Keep it polite so it isn't noisy.
- Visible `:focus-visible` outline on tabs and the alert link (2px `--accent`, 2px offset).

---

## 8. Responsive

- Desktop (≥ 1200px): exact sizes above.
- Below that, scale the whole `.sim` block down proportionally so it fits the column. Wrap it in a container and use `transform: scale()` from JS on resize, or use `clamp()`/`%` sizing. Pick one and tell me which. The camera grid must stay 2 × 3 and the tiles must keep their 5:3 ratio.
- Phone (< 768px): the column goes full width (no 720 cap), with a 16px side gutter. No horizontal scroll.

---

## 9. Build steps: do them in this order, and check each one before moving on

1. **Rename** `hero-cam1-yard .jpeg` → `hero-cam1-yard.jpeg`.
2. **Static markup + tokens.** Build `index.html` + `styles.css` with all 6 tiles in the OFF state, the tabs (Safety active) and the alert button showing scene 1 text. No JS yet.
   ✅ Check: open it next to the Paper scene-1 screenshot. Spacing, sizes, fonts and the dashed orange frame should match, and all 6 tiles should look desaturated navy.
3. **Tile ON state, static.** Add the `.is-on` styles and put the class on CAM 1 by hand.
   ✅ Check: CAM 1 is full color with an orange border and the `Reversing` pill, matching Paper `Frame 9171` (`25V-0`).
4. **Scan animation.** Add the keyframes.
   ✅ Check: the band enters from beyond the right edge, crosses in 2.0s and fully leaves past the left edge, matching `IE-0` mid-way. Time it with DevTools Animations or `performance.now()` logs.
5. **Hover state on the alert button.**
   ✅ Check: matches the `scene1-button hover` artboard.
6. **JS state machine.** Add the scene data, `goToScene`, the autoplay loop and accent switching.
   ✅ Check: let it run for 2 full loops (~48s). Each scene changes every 4.0s. Each scene shows the right tile, pill, tab, border color, arrow color and button text from §5, and nothing goes out of sync.
7. **Tab clicks.**
   ✅ Check: click each tab at random times, including mid-scan and quickly several times in a row. There should never be two tiles on at once, never a double timer, and the scan restarts cleanly.
8. **Hover/focus pause + reduced motion.**
   ✅ Check pause:
   - Hover the panel mid-scan. The scan band freezes in place and the scene doesn't change, even after 10s.
   - Move the mouse out. It continues from the same point and finishes the remaining time, not a fresh 4s.
   - Tab into the tabs with the keyboard. It pauses. Tab out of the panel and it resumes.
   - Hover + focus together: it only resumes once both have left.
   - In mobile emulation, tap the panel. It doesn't freeze.
   - Switch browser tabs and come back. It never paused.

   ✅ Check reduced motion: in DevTools → Rendering, emulate `prefers-reduced-motion: reduce`. There's no sweep and no movement, but scenes still change every 4s. Turn it off again and the sweep comes back without a reload.
9. **Responsive + a11y pass.**
   ✅ Check: 1440, 1024, 768 and 375 widths, keyboard-only navigation, no console errors.

---

## 10. Acceptance checklist (all must be true)

- [ ] Pure HTML/CSS/vanilla JS, opens from `index.html` with no build step.
- [ ] 6 scenes play in order 1→6 and loop forever. Each lasts exactly 4s (24s per loop): 0.3s reveal, 2s scan, 1.7s hold.
- [ ] The active tab auto-follows the scene's category. Inactive tabs are at 40% opacity.
- [ ] Clicking a tab jumps to that category's first scene and continues autoplay from there.
- [ ] Off tile = navy border + luminosity blend. On tile = full color + accent border + description pill.
- [ ] Scan band: accent color, 80px wide, moves right → left in exactly 2s, starts and ends fully outside the tile.
- [ ] Dashed frame, alert dot, arrow box and scan band all use the current category color (orange / yellow / teal).
- [ ] Alert button text (cam ref + message) changes per scene with a crossfade. The whole card links to https://www.ailytics.ai/use-cases.
- [ ] Alert button hover = white background, navy text.
- [ ] Only one tile is ever on. No overlapping timers after fast clicking.
- [ ] Pauses (freezes, including the scan band) only while mouse-hovered or keyboard-focused. It resumes from the same point when both leave. It doesn't pause on touch or when the browser tab is hidden.
- [ ] With reduced motion on: no scan sweep or movement, but scenes still advance every 4s.
- [ ] Matches the Paper scene artboards at 1440px wide.

When you're done, list any place where you went against this prompt or the Paper design, and why.
