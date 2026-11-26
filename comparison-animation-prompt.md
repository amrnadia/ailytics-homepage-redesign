# Build prompt: Ailytics comparison section animation ("Without" vs "With" cards)

> Paste everything below the line into Claude Code. Run it from the project root
> (`/Users/nadia/Documents/2026 Mac/Ailytics homepage redesign`).
> Do the steps in §11 in order, and check each one before you move on.

---

## 0. Role and goal

You are adding the **comparison section** ("Without vs with Ailytics") to the existing Ailytics homepage. It has two cards side by side:

- **Without card**, labelled "Traditional monitoring": *One operator watching 2/12 cameras*
- **With card**, labelled "With Ailytics": *Ailytics watching all 12 cameras*

Each card has an animated area, called the **stage** in this prompt: a camera grid plus a notification card. Each stage plays a 4-scene story, then shows a **replay button** that replays that card's story.

**Only the two stages animate.** Everything else in the section (eyebrow, headline, tabs, card titles, the ✕/✓ lists, dividers) is static and must match Paper exactly.

**Tech:** plain HTML + CSS + **vanilla JavaScript**. No frameworks, no build step, no npm.
The project already ships GSAP in `js/vendor/` for other sections. **Don't use GSAP for this section.** Use the Web Animations API (`element.animate()`) as described in §7.

### 0.1 Design source (Paper file "Ailytics homepage redesign", page `homepage`)

| What | Paper artboard / node |
|---|---|
| Whole homepage (context and final static state) | `homepage-default` (`15K-0`) |
| Comparison section, final resting state | `comparison section` (`29R-0`) |
| Without, scene 1 | `without-compare-box-scene1` (`40N-0`) |
| Without, scene 2 | `without-compare-box-scene2` (`47F-0`) |
| Without, scene 3 | `without-compare-box-scene3` (`45S-0`) |
| Without, scene 4 (final) | `without-compare-box-scene4` (`4HP-0`) |
| With, scene 1 | `with-compare-box-scene1` (`5B9-0`) |
| With, scene 2 | `with-compare-box-scene2` (`5KX-0`) |
| With, scene 3 | `with-compare-box-scene3` (`5HP-0`) |
| With, scene 4 (final) | `with-compare-box-scene4` (`5EH-0`) |

If the Paper MCP is connected, use `get_jsx` (with `includeNodeIds: false`), `get_computed_styles` and `get_screenshot` on these nodes for exact values and to check your work. **The values in this prompt were read from those nodes. If anything here disagrees with Paper, Paper wins. Tell me about each disagreement.**

Notes on the Paper frames:
- The scene artboards have a **dark strip behind the tab**. That's only the artboard background. On the page, the section background is `--light-blue` `#F9FAFB` (see §3).
- In the Without frames, the "missed" tiles have an **orange** border, but with `mix-blend-mode: luminosity` they render **grey**. That's intended. Keep them grey.
- In the With frames, **tile 1 has two identical check badges stacked**. That's a Paper duplicate. Build only one.

---

## 1. Files to touch

```
index.html          ← add the comparison <section> after the logos section, inside <main>
css/styles.css      ← append a new block: /* ============ COMPARISON ============ */
js/comparison.js    ← NEW: all comparison animation logic (one IIFE, 'use strict')
images/comparison-images/   ← already exists (see §2)
```

- Load `js/comparison.js` with `defer`, **after** `js/main.js`.
- Don't change the hero, nav, logos, `simulation.js`, `main.js` or `data.js`.
- Reuse the existing `:root` tokens, `.container`, `--gutter`, `--ease-out` and breakpoints in `css/styles.css`. Don't redefine them.
- Paper's homepage-default shows a second "logo section" below the comparison section. That's a placeholder. **Don't build it.**

---

## 2. Assets

The 12 camera images are in `images/comparison-images/`. They are in **grid order, row by row** (I checked them against Paper):

| Tile | File | Without role | Row / col |
|---|---|---|---|
| 1 | `comparison-1.jpeg` | unwatched | r1 c1 |
| 2 | `comparison-2.jpeg` | **watched** (teal) | r1 c2 |
| 3 | `comparison-3.jpeg` | unwatched | r1 c3 |
| 4 | `comparison-4.jpeg` | **missed** | r1 c4 |
| 5 | `comparison-5.jpeg` | unwatched | r2 c1 |
| 6 | `comparison-6.jpeg` | **missed** | r2 c2 |
| 7 | `comparison-7.jpeg` | **watched** (teal) | r2 c3 |
| 8 | `comparison-8.jpeg` | unwatched | r2 c4 |
| 9 | `comparison-9.jpeg` | unwatched | r3 c1 |
| 10 | `comparison-10.jpeg` | unwatched | r3 c2 |
| 11 | `comparison-11.jpeg` | **missed** | r3 c3 |
| 12 | `comparison-12.jpeg` | unwatched | r3 c4 |

Both cards use the same 12 images in the same order, so each file downloads once.

**Optimise them.** The originals are 1280px wide and 68 to 204 KB each (~1.7 MB in total). The tiles are only 122 × 73 CSS px.
- Make resized copies **400px wide** (keep the aspect ratio) in `images/comparison-images/optimized/`, as JPEG at quality ~80. `sips` is available: `sips -Z 400 -s formatOptions 80 in.jpeg --out out.jpg`.
- `cwebp` isn't installed. Only produce WebP if a WebP encoder is already on the machine. Don't install anything without asking me.
- Keep the originals. Reference only the optimised files from HTML.
- The originals are 4:3 (1–7) and 16:9 (8–12), and the tiles are ~5:3. Use `object-fit: cover; object-position: 50% 50%`, which matches Paper's `background-size: cover; background-position: 50%`.
- Use `<img>` with `width`/`height` attributes, `loading="lazy"`, `decoding="async"` and `alt=""`. The stage gets a single accessible label instead (§9).

The font is Switzer 400/500, which `index.html` already loads.

---

## 3. Static section layout (desktop 1440, exact values from Paper)

Build this to match `comparison section` (`29R-0`) in its **final** state. Use `get_jsx` on `2AC-0` (header), `5TN-0` (Without card), `5VY-0` (With card) and `5ZA-0` (✓ list) for anything not listed here.

```
section.compare                      background var(--light-blue) #F9FAFB, padding-inline = page gutter (64 at 1440)
├─ divider (top)                     1px line, var(--light-grey), full content width (1312)
├─ .compare__container               flex column, align center, gap 90px      ← gap 130px above and below it, to the dividers
│  ├─ header (827 wide, centered)    flex column, align center, gap 20px
│  │   ├─ eyebrow                    6×6 square #34C1C3 + 11px gap + "WITHOUT VS WITH AILYTICS"
│  │   │                             12px / 150%, uppercase, navy, regular
│  │   └─ h2 (775 wide)              54px, weight 500, line-height 110%, letter-spacing -0.03em, centered, navy
│  │                                 "Sites run dozens of cameras. Nobody can watch them all. "
│  │                                 + <span> "Ailytics does." in #1EAAAE (≈ var(--dark-teal) #1DAAAE, use the token)
│  └─ .compare__cards                flex row, gap 24px, each card flex 1 (644 wide at 1440)
│      └─ .compare-card ×2           flex column, gap 40px
│          ├─ .compare-box           position relative, padding-top 50px
│          │   ├─ tab (absolute 0,0) white, 1px var(--light-grey), radius 4, padding 16px 20px, 14px/150% navy regular
│          │   │                     "Traditional monitoring" / "With Ailytics"
│          │   └─ .compare-box__panel   white, 1px var(--light-grey), radius 4, padding-top 30px, gap 20px, overflow clip
│          │       ├─ h3             padding-inline 30px; 30px, weight 500, line-height 110%, letter-spacing -0.03em, navy
│          │       └─ .stage         644 × 350, overflow clip, position relative  ← THE ANIMATED LAYER (§4)
│          └─ list                   flex column, gap 20px; each item: flex, align center, gap 16px
│              icon box: padding 4, radius 4, 1px border, 20×20 svg, stroke-width 2, round caps/joins
│                Without: white bg, var(--light-grey) border, navy ✕
│                With:    var(--dark-teal) bg and border, white ✓
│              text: 16px / 150% navy regular
└─ divider (bottom)
```

Copy (exact):
- Without list: "Most cameras go unwatched" · "Walkarounds see one moment of one shift" · "Incidents are found in the footage afterwards"
- With list: "Every camera watched, all shift" · "Every hour covered, not just walkarounds" · "Your team alerted as it happens"

Card headings: use `<h3>`. The section heading is `<h2>`, with `aria-labelledby` on the section.

---

## 4. The stage (644 × 350): structure and final-state values

All positions below are in **stage px** (the stage's own 644 × 350 coordinate space). §8 explains how the stage scales on other screen sizes.

### 4.1 Stage background
- Without: `linear-gradient(159deg, #FFFFFF -8.08%, #FBFCFC 48.84%, #FF6C2F 105.76%)`
- With: `linear-gradient(156.62deg, #FFFFFF 5.72%, #FDFEFE 51.69%, #35C1C3 97.66%)`
- Paper interpolates these `in oklab`. Write the plain gradient first, then override it inside `@supports (background: linear-gradient(in oklab 0deg, red, blue))` with the `in oklab` version.

### 4.2 Camera grid (`.cam-grid`), absolute
- **Final position:** `left: -78px; top: 24px`. Scene 1/2 position (centered) = `left: 61px`. The grid's **resting CSS position is the final one (-78)**. The animation moves it with the `translate` property (`139px` → `0`, see §6 and §7.1).
- Box: white, 1px `--light-grey` border, radius 8px, padding `24px 10px 10px`, flex column, gap 4px. Outer size is **522 × 263**.
- 3 rows, each a flex row with gap 4px and 4 tiles.
- Window dots: absolute `left: 10px; top: 11px`, three 6.2px circles, fill `--light-grey`, gap 4.14px.

### 4.3 Camera tile (`.tile`), 122 × 73 (Paper: 121.92 × 73.15), radius 2px, `position: relative; overflow: hidden`
Layers, bottom to top:
1. `img`: fills the tile, cover.
2. `.tile__border`: absolute inset 0, `border: 2px solid var(--white)`, radius 2px. (In Paper the border sits on top of the image, which runs under it.)
3. `.tile__ring`: absolute inset 0, `border: 2px solid var(--teal)`, radius 2px. Shown/hidden with **opacity**. Watched tiles and all With tiles show it at the end.
4. `.tile__scan` (With only): absolute `top: 0; left: 0`, 35 × 73,
   `background: linear-gradient(270deg, rgba(53,193,195,.6) 2.4%, rgba(53,193,195,0) 99.98%)`, so the bright edge is on the **right**.
   Resting position (Paper): `translateX(24px)`. Tile 2 rests at `14px` and tile 3 at `22px`. Put the resting x in a CSS custom property per tile, e.g. `--scan-x`.
5. `.tile__tag` (Without, tiles 4, 6 and 11 only): "Missed". Absolute `left: 8px; top: 52px`, bg `--orange`, radius 2px, padding `1px 6px`, text 8px / 150%, weight 500, white, centered.
6. `.tile__check` (With, all 12): absolute `left: 8px; top: 52px`, bg `--navy`, radius 2px, padding `1px 6px`, white ✓ svg 12×12 (`M10 3L4.5 8.5l-2.5-2.5`, stroke 1, round).

**Greyscale (Without only):** every Without tile except tiles 2 and 7 is greyscale in **every** scene, and so are their borders. Missed tiles have an `--orange` `.tile__border` that turns grey because of this. Paper does it with `mix-blend-mode: luminosity` on a white backdrop. **Use `filter: grayscale(1)` on the tile element**, because it can be animated (blend modes can't) and looks the same on white. Check it next to Paper. If the greys look clearly different, keep `mix-blend-mode: luminosity` for the static tiles and use the filter only on tiles 2 and 7.
The With tiles are never greyscale.

### 4.4 Notification card (`.notify`), absolute `left: 336px; top: 137px`
- White, 1px `--light-grey`, radius 8px, padding 20px, `width: max-content` (283px), flex column.
- **Don't use `gap` between the two items.** Wrap item 2 in `.notify__collapse` (`overflow: hidden`) and give it `padding-top: 20px` instead, so it can collapse to 0 height in scene 3 (§6.1).
- Item title: 16px, weight 500, line-height 110%, letter-spacing -0.03em, navy.
- **Item 1, the "time length" bar** (title then bar, gap 10px): position relative, track 241 × 23, `#EEF3F8`, radius 2px.
  - Without, "Walkarounds": marks in this left-to-right order:
    `dot @ left 38` → `bar @ 108` → `dot @ 153` → `bar @ 176` → `dot @ 213`
    - **dot mark** = a 9 × 23 box with a 9px circle at `top 7`, `--orange`, plus a 1px full-height guide line at `left 4`, `#FF6C2F80`
    - **bar mark** = an 8 × 23 rectangle, `--navy`
  - With, "Every hour covered":
    - `.coverage-fill`: absolute `left 0; top 0`, 241 × 23, `--teal`, radius 2px, **below** the dots in DOM order. Animate it with the `scale` property (`0 1` → `1 1`) and `transform-origin: left center`.
    - Navy dot marks at `38`, `153` and `213`: 9px circle `--navy`, 1px line `#263C5C80`.
- **Item 2, incident row** (title then row, gap 19px): row is 241 × 23, position relative.
  - Track: 241 × 6, `#EEF3F8`, radius 2px, vertically centred.
  - Big dot: 17px circle at `left 69; top 3`. Without = `--orange`, With = `--teal`.
  - Marker: 4 × 23 `--navy` at `left 76`. Its centre lines up with the big dot's centre.
  - Without title: "Found after the incident". With title: "Alert sent as it happened".
- `#EEF3F8` isn't a Paper token. Add `--track: #EEF3F8;` scoped to `.compare`.

### 4.5 Replay button (`.replay`), absolute `left: 16px; top: 302px`
- `<button type="button" aria-label="Replay animation">`, bg `--navy`, radius 8px, padding 8px, 16×16 replay icon (copy the SVG from Paper node `5VC-0`), white stroke, round caps.
- Hover: bg `--dark-navy`. `:focus-visible`: 2px `--teal` outline, offset 2px.
- The visible box is 32px. Add a transparent `::before` at `inset: -6px` so the touch target is 44px.
- It's hidden (opacity 0, `visibility: hidden`, not focusable) while the card is playing. It appears at the end (§6).

---

## 5. Pacing (why these timings)

- Without ≈ **12.4 s** and With ≈ **11.4 s** to the replay button. That's inside the 10–14 s you asked for.
- **One focal change at a time.** Each new thing appears only after the previous one has settled. Each scene gets a short hold (~0.6–1.2 s) so the viewer can read it before the next change.
- Entrances are 300–600 ms with `--ease-out` (`cubic-bezier(0.22, 1, 0.36, 1)`). Travel (grid slide, marker, fill) is 1.0–2.2 s with an ease-in-out (`cubic-bezier(0.65, 0, 0.35, 1)`). Small "pop" moments use `cubic-bezier(0.34, 1.3, 0.64, 1)`: a slight overshoot, never bouncy.
- Movement distances are small (6–24 px). Nothing flashes, loops or pulses forever.
- Animate **only `transform`, `opacity` and `filter`**. The one exception is the height of `.notify__collapse` (§6.1), which is a small, absolutely positioned element.
- Put every timing in **one `TIMING` config object** at the top of `comparison.js`, so I can tune it later.

---

## 6. Scene timelines

`t` = seconds from the start of that card's timeline. "From → to" are WAAPI keyframes. Every animation uses `fill: 'both'` (§7). "Random" means a **new shuffle on every play** (Fisher–Yates).

### 6.1 WITHOUT card (~12.4 s)

**Pre-state, before the timeline starts.** These come from the first keyframes plus backwards fill. They aren't separate classes.
grid hidden and lowered · tiles 2 and 7 greyscale, ring hidden · tags hidden · notify card hidden · item 2 collapsed · all marks hidden · marker at the right end · replay hidden.

| Scene | t (s) | Element | Animation | Dur / ease |
|---|---|---|---|---|
| **1** grid in | 0.00 | `.cam-grid` | opacity 0→1, `translate(139px, 24px)` → `translate(139px, 0)` (fades in from bottom to top, at the centred position) | 900 ms, ease-out |
| | 1.20 | tile 2 | `filter: grayscale(1)`→`grayscale(0)` **and** `.tile__ring` opacity 0→1 | 600 ms, ease-out |
| | 1.40 | tile 7 | same as tile 2 | 600 ms, ease-out |
| | *hold* | | **Checkpoint 2.6 s must look like `40N-0`** | |
| **2** missed | 2.80 / 3.40 / 4.00 | tags on tiles 4, 6, 11, **random order** | opacity 0→1, `translateY(6px)`→`0` (fade in, bottom to top, one by one) | 450 ms each, ease-out |
| | *hold* | | **Checkpoint 5.0 s must look like `47F-0`** | |
| **3** walkarounds | 5.40 | `.cam-grid` | `translateX(139px)` → `0` (centre → left; ends at `left -78`) | 1000 ms, ease-in-out |
| | 5.90 | `.notify` (item 1 only; item 2 collapsed) | opacity 0→1, `translateY(16px)`→`0` | 600 ms, ease-out |
| | 6.60 | dot @38 | circle: opacity 0→1, `scale(.4)`→`1`; guide line: `scaleY(0)`→`1`, origin centre | 350 ms, pop |
| | 6.95 | bar @108 | opacity 0→1, `scaleY(0)`→`1`, origin bottom | 350 ms, ease-out |
| | 7.30 | dot @153 | as dot @38 | 350 ms, pop |
| | 7.65 | bar @176 | as bar @108 | 350 ms, ease-out |
| | 8.00 | dot @213 | as dot @38 | 350 ms, pop |
| | *hold* | | **Checkpoint 8.8 s must look like `45S-0`** | |
| **4** found after | 9.00 | `.notify__collapse` (item 2) | `height: 0px` → measured px (§7.3); inner content opacity 0→1, `translateY(8px)`→`0`. The card grows downward. | 500 ms, ease-out |
| | 9.00 | big orange dot | opacity 0→1, `scale(.6)`→`1` (at the same moment the item appears) | 350 ms, pop |
| | 9.00 | marker | opacity 0→1 while held at `translateX(161px)` (right end: 237 − 76) | 350 ms, ease-out |
| | 9.80 | marker | `translateX(161px)` → `0`. Travels back along the timeline to the dot's centre. | 1600 ms, ease-in-out |
| | 12.00 | `.replay` | opacity 0→1, `translateY(4px)`→`0`, then becomes focusable | 400 ms, ease-out |
| | | | **Checkpoint 12.4 s must look like `4HP-0` and the section in `29R-0`** | |

### 6.2 WITH card (~11.4 s)

**Waiting state (desktop only, see §7.5):** while Without plays, the With card shows its **final scene** (the `5EH-0` frame: grid at the left, all 12 tiles teal with check badges, scans at rest, notify card with the full teal bar). The only difference is that the replay button is hidden. It is **not** an empty card.

**Pre-state** (what the timeline starts from, right after the hand-off fade in §7.5): grid hidden and lowered · rings hidden · scans hidden (`translateX(-35px)`, opacity 0) · checks hidden · notify hidden · coverage fill `scaleX(0)` · replay hidden.
With tiles are full colour from the start ("normal blending": Ailytics watches every camera).

| Scene | t (s) | Element | Animation | Dur / ease |
|---|---|---|---|---|
| **1** grid in | 0.00 | `.cam-grid` | same as Without scene 1 (centred, bottom-to-top fade) | 900 ms, ease-out |
| | *hold* | | **Checkpoint 1.6 s must look like `5B9-0`** | |
| **2** detect | 2.00 | all 12 `.tile__ring` **at once** | opacity 0→1 | 400 ms, ease-out |
| | 2.00 | all 12 `.tile__scan` **at once** | pass 1: opacity 1, `translateX(-35px)` → `translateX(122px)` (sweeps fully across, left to right) | 1400 ms, ease-in-out |
| | 3.50 | all 12 `.tile__scan` | pass 2: `translateX(-35px)` → `translateX(var(--scan-x))` (comes back in and settles at its Paper position). The jump from 122 to −35 happens while the scan is clipped off-tile, so nobody sees it. | 800 ms, ease-out |
| | *hold* | | **Checkpoint 4.4 s must look like `5KX-0`** | |
| **3** checked | 4.60 + i × 0.14 | 12 `.tile__check`, **random order** (i = 0…11) | opacity 0→1, `translateY(4px) scale(.9)` → `none` | 300 ms each, ease-out |
| | *hold* | | **Checkpoint 6.8 s must look like `5HP-0`** | |
| **4** covered | 7.00 | `.cam-grid` | `translateX(139px)` → `0` | 1000 ms, ease-in-out |
| | 7.50 | `.notify` (**both items visible**; fill at `scaleX(0)`, only the 3 navy dots and the track showing) | opacity 0→1, `translateY(16px)`→`0` (slightly bottom to top) | 600 ms, ease-out |
| | 8.30 | `.coverage-fill` | `scaleX(0)` → `scaleX(1)`, origin left. 0 % → 100 %: Ailytics covers every hour. | 2200 ms, ease-in-out |
| | 11.00 | `.replay` | as Without | 400 ms, ease-out |
| | | | **Checkpoint 11.4 s must look like `5EH-0`** | |

The With "Alert sent as it happened" row (teal dot and marker) is **static**. It appears with the card, already in place. That's a deliberate contrast with Without, where the marker has to travel back to find the incident. (Paper doesn't specify this row's motion. See the decision list at the end.)

---

## 7. Animation engine (vanilla JS, Web Animations API)

### 7.1 One timeline object per card
Build each card's story as a list of `element.animate(keyframes, { delay, duration, easing, fill: 'both' })` calls. Keep every returned `Animation` in an array. Because of `fill: 'both'`:
- **Before** its delay, each element shows its first keyframe. That is the pre-state, so no extra "hidden" classes are needed.
- **After** it ends, it holds its last keyframe.

```js
function createTimeline() {
  const anims = [];
  return {
    add(el, keyframes, { at, dur, easing = EASE.out }) {
      const a = el.animate(keyframes, { delay: at * 1000, duration: dur, easing, fill: 'both' });
      a.pause();                // built paused → pre-state shows immediately
      anims.push(a);
      return a;
    },
    play()   { anims.forEach(a => a.play()); },
    pause()  { anims.forEach(a => a.pause()); },
    seek(s)  { anims.forEach(a => { a.currentTime = s * 1000; }); },   // for checkpoints/debug
    finish() { anims.forEach(a => a.finish()); },
    cancel() { anims.forEach(a => a.cancel()); anims.length = 0; },
    get finished() { return Promise.all(anims.map(a => a.finished)); },
  };
}
```

- Build each card's timeline **on page load, paused**, so it shows its pre-state until it plays. **Exception:** on desktop, the With card shows its final scene while it waits (§7.5).
- The **end of a card** = the replay-button animation's `finished` promise. Don't use `setTimeout` for sequencing. Timeouts drift and don't pause.
- **Same-property rule (important).** With `fill: 'both'`, an animation that starts later still applies its *first* keyframe during its delay. The animation created later wins. So if two animations on one element touch the same property, the second would override the first before it has even started. To avoid this:
  - The **first** animation of a property on an element uses `fill: 'both'` (that gives the pre-state).
  - **Every later** animation of the **same property on the same element** uses `fill: 'forwards'`.
  - This applies to: the grid's `translate` (scene 1 rise → scene 3/4 slide), the With scan's `translate` (pass 1 → pass 2), and the replay button if you animate it out.
- Animate with the **individual CSS properties** (`translate`, `scale`, `opacity`, `filter`) rather than the `transform` shorthand, so independent motions never overwrite each other. For example, the marker's `opacity` fade and its `translate` travel are separate animations. Mobile's static `scale` on tags doesn't fight their `translate` entrance.
- Keyframes include the element's resting offset. The grid's CSS resting position is `left: -78px` (final). On desktop and tablet, `dx = 139px`. Scene 1 = `translate: dx 24px` → `dx 0`. Scene 3/4 = `translate: dx 0` → `0 0`. **On mobile `dx = 0`**, because the grid is centred by layout there, so the slide becomes a no-op. Work out `dx` when you build the timeline.
- The replay button's opacity is a WAAPI animation. Set `visibility` and `tabindex` from JS: hidden and `-1` when the timeline is built, visible and focusable when its entrance animation starts.

### 7.2 Random order
Shuffle (Fisher–Yates) the 3 Without tags and the 12 With checks **each time the timeline is (re)built**, so every replay is different.

### 7.3 Item 2 height (Without scene 4)
Measure the natural height of `.notify__collapse`'s inner content (including its 20px `padding-top`) **after fonts load** (`document.fonts.ready`). Animate `height: 0px` → `Hpx`. Measure again on rebuild. The text is `max-content`, so the height doesn't change with viewport width.

### 7.4 Replay
On click: fade the button out (200 ms) and make it unfocusable. Then `cancel()` that card's timeline, rebuild it (new shuffle) and `play()`. **Replay only affects that card.** Replaying Without doesn't touch With, and the other way round. Then move focus to the stage container (`tabindex="-1"`) so keyboard users don't lose their place. When the replay button appears again, don't move focus to it automatically.

### 7.5 With card while it waits (desktop only)
On desktop the With card must **never look empty**. While Without plays, it shows its last scene (`5EH-0`), and then hands off smoothly into its own animation.

1. **On page load (desktop mode):** build the With timeline and call `finish()` on it, so every element holds its last keyframe. That is the `5EH-0` frame. Then hide the replay button with JS (`visibility: hidden`, `tabindex="-1"`). Nothing has played yet, so there's nothing to replay. This is also what With shows before the section is scrolled into view.
2. **Hand-off, when With's turn comes** (0.8 s after Without's replay button appears):
   1. Fade out the stage content: animate the `.stage__canvas` wrapper's `opacity` 1 → 0 over **400 ms**, ease-out. Only animate the wrapper, never the elements the scene timeline uses. The stage background gradient, the card title and the tab stay visible the whole time. Only the grid and the notify card fade.
   2. When that fade finishes: `cancel()` the With timeline, rebuild it with a new shuffle (this puts every element in its pre-state, which is hidden), then set the wrapper's `opacity` back to 1 instantly. You can't see the reset, because the pre-state is hidden anyway.
   3. Wait **200 ms**, then `play()` the With timeline from t = 0. Scene 1's grid fades in from bottom to top as normal.
   - Never jump straight from the final frame to the pre-state. The fade is what stops the card from flashing.
3. **If the user clicks With's replay button** (only possible after With has played), use the normal replay (§7.4). Hide the replay button while With waits, so the user can't start With early.
4. **Tablet and mobile:** With doesn't wait, so this section doesn't apply. It starts from its pre-state when the user scrolls to it, the same as Without.
5. **Breakpoint change while With is waiting** (desktop → stacked): leave the final scene showing and show its replay button. That matches §8.2's "jump to final state" rule.

### 7.6 Debug hook (for verification only)
Expose `window.__compare = { seek(card, seconds), play(card), pause(card) }` with `card` = `'without' | 'with'`. Use it in §11 to freeze each checkpoint and compare with Paper. It's harmless in production, but keep it small.

---

## 8. Responsive behaviour and triggers

Breakpoints are the ones already in `styles.css`: **desktop ≥ 72rem (1152px)**, **tablet 48rem–71.99rem**, **mobile < 48rem (768px)**.

### 8.1 Layout per breakpoint

| | Cards | Stage |
|---|---|---|
| **Desktop ≥ 1152** | side by side, gap 24px, `flex: 1` (644px at 1440; ~535px at 1152) | Scale the whole 644 × 350 stage proportionally: `--stage-scale = cardWidth / 644` (max 1). Set it with a `ResizeObserver` and apply `transform: scale(var(--stage-scale))` with `transform-origin: top left` to an inner 644 × 350 `.stage__canvas`. The outer `.stage` height = `350 × scale`. The composition is pixel-identical to Paper at every width. |
| **Tablet 768–1151** | stacked, gap 64px, each card `max-width: 644px`, centred | Scale 1 (the card is exactly 644 wide). Same composition as desktop. |
| **Mobile < 768** | stacked, gap 48px, card = full content width (e.g. 343 at 375) | **Mobile composition (no Paper frame exists, see the decision list at the end):** the stage switches to flow layout, `padding: 16px 16px 64px`. The grid is centred at the top, scaled by `--grid-scale = (stageWidth − 32) / 522` (≈ 0.6 at 375), and its box height is reserved (`263 × scale`). The notification card sits **below** the grid at native size (283px, readable 16px text), right-aligned, with `margin-top: -20px` so it overlaps the grid edge slightly. Reserve its final height with `min-height: 173px` so the page never jumps when item 2 expands. The replay button is absolute at `left 16; bottom 16`. **The "grid moves left" step becomes a no-op on mobile** (keyframes `translateX(0)` → `0`). Everything else is identical. On mobile, counter-scale `.tile__tag` and `.tile__check` with the individual `scale` property (`scale: calc(0.8 / var(--grid-scale))`, `transform-origin: left bottom`) so "Missed" stays legible. Animate them with `translate`/`opacity` so the two don't conflict. |

Other responsive type and spacing (follow the clamp patterns already used in `styles.css`):
- h2: `clamp(2rem, 1.2rem + 3.6vw, 3.375rem)`.
- Card h3: `clamp(1.375rem, 1rem + 1.6vw, 1.875rem)`.
- Card title padding: 30px, dropping to 20px on mobile.
- Section gaps: 130 → `clamp(4rem, 2rem + 6vw, 8.125rem)`. 90 → `clamp(3rem, 1.5rem + 4vw, 5.625rem)`.
- No horizontal page scroll at any width from 320px up.

### 8.2 When the animations start

Use `IntersectionObserver`. Decide the mode with `matchMedia('(min-width: 72rem)')`: **side by side = "sequenced"**, **stacked = "independent"**.

- **Desktop (sequenced):**
  1. Observe `.compare__cards`. When **≥ 35 %** of it is visible for the first time, play **Without**.
  2. While Without plays, With shows its **final scene** (`5EH-0`) with the replay button hidden, never an empty card. When Without's replay button has appeared, wait **0.8 s**, then run the With hand-off (§7.5): fade out over 400 ms, reset, pause 200 ms, then play With from scene 1.
  3. This runs once per page view. After that, each card replays only through its own replay button.
- **Tablet and mobile (independent):** observe each card's `.stage` separately. When a stage is **≥ 40 %** visible for the first time, play that card straight away. With doesn't wait for Without.
- **Pause when out of view:** if a playing card's stage drops below 15 % visibility, `pause()` its timeline. `play()` again when it's back to ≥ 40 %. Also pause everything on `document.visibilitychange` → hidden, and resume on visible. A viewer never misses a scene.
- **Breakpoint change mid-animation** (e.g. rotating a tablet): `finish()` both timelines (jump to the final state) and show both replay buttons. Don't restart automatically.

---

## 9. Accessibility and robustness

- **No JS:** the markup and CSS on their own show the **final state** (`29R-0`), with replay buttons hidden. All pre-state comes from WAAPI, so if the script doesn't run, nothing is stuck hidden. Scope the replay button's hidden default under `.js` (already added to `<html>` in `index.html`).
- **`prefers-reduced-motion: reduce`:** don't build timelines. Show the final state of both cards immediately and hide the replay buttons. Listen for changes to the media query.
- **WAAPI missing** (very old browsers): same as reduced motion, show the final state.
- Each `.stage` gets `role="img"` and an `aria-label`. All tiles, tags and marks inside it are `aria-hidden="true"`. The replay button stays **outside** the `aria-hidden` subtree. Labels:
  - Without: "Traditional monitoring: an operator watches 2 of 12 cameras, 3 incidents are missed, walkarounds catch moments, and the incident is found afterwards."
  - With: "With Ailytics: all 12 cameras are scanned and checked, every hour is covered, and alerts are sent as incidents happen."
- The whole story is under 15 s and stops by itself, so WCAG 2.2.2 (Pause, Stop, Hide) is satisfied without a pause control.
- `will-change` only on the grid, the scans and the coverage fill. Remove it when the timeline finishes.

---

## 10. Things that must NOT change

- Anything outside the two `.stage` elements: header, tabs, card titles, borders, lists, dividers, section spacing. Static. Match Paper.
- Existing sections, scripts and tokens.
- The final frame of each card must equal Paper's final state (`4HP-0` / `5EH-0` / `29R-0`), apart from the documented mobile composition.

---

## 11. Build steps: do them in this order and check each one

1. **Read** `index.html`, `css/styles.css` (tokens, `.container`, breakpoints, reduced-motion block) and `.claude/launch.json` (the `static` dev server on port 5173).
2. **Optimise images** (§2). Report the before and after sizes.
3. **Static section, final state only, no JS.** Build the markup and CSS (§3, §4) and insert them after the logos section.
   ✅ Start the `static` preview. At 1440 wide, screenshot the section and compare it side by side with `get_screenshot` of `29R-0`. Check: grid at -78, the 2 teal tiles, 3 grey "Missed" tiles, both notify cards, replay buttons visible (no JS yet), list icons, gradients, spacing. Fix any differences before going on.
4. **Stage scaling** (§8.1) at 1152 / 900 / 768 / 375 / 320.
   ✅ No horizontal scroll. Stage proportions stay the same on desktop. Mobile composition is readable.
5. **Timeline engine** (§7) and the **Without** timeline (§6.1).
   ✅ With `__compare.seek('without', t)` at **2.6 / 5.0 / 8.8 / 12.4**, screenshot the stage and compare with `40N-0` / `47F-0` / `45S-0` / `4HP-0`.
6. **With** timeline (§6.2).
   ✅ Seek to **1.6 / 4.4 / 6.8 / 11.4** and compare with `5B9-0` / `5KX-0` / `5HP-0` / `5EH-0`.
7. **Triggers** (§8.2): desktop sequencing, tablet and mobile independent starts, pause out of view, replay per card, breakpoint change.
8. **Reduced motion, no-JS and accessibility** (§9).
9. Run the **final check** (§12).

---

## 12. Final check (all must be true before you call it done)

**Match the design**
- [ ] Section at 1440 matches `homepage-default` / `29R-0` (header, cards, lists, dividers, spacing, colours, fonts).
- [ ] Each of the 8 checkpoints matches its Paper scene frame. Ignore the dark artboard strip behind the tab.
- [ ] Tile order matches Paper (watched = 2, 7; missed = 4, 6, 11). Tile 1 in With has one check badge, not two.

**Motion quality**
- [ ] Without runs ~12.4 s and With ~11.4 s to the replay button. On desktop, With starts ~0.8 s after Without finishes.
- [ ] On desktop, the With card is **never empty**. It shows its final scene (`5EH-0`, replay button hidden) on load and while Without plays. When its turn comes, the final scene fades out smoothly (no flash or jump), then scene 1 plays.
- [ ] Only one focal change at a time, a readable hold after each scene, no jank. Check DevTools Performance for no layout thrash; only the item-2 height is allowed to cause layout.
- [ ] Random order differs between replays (tags and checks).
- [ ] The scan sweeps all 12 tiles at once, left to right, then rests where Paper shows it.
- [ ] The marker travels from the right end to the centre of the big dot. The teal fill grows 0 → 100 % underneath the 3 navy dots.
- [ ] Replay works on each card on its own, any number of times, including mid-play of the other card.

**Responsive**
- [ ] Desktop (1440, 1280, 1152): side by side, sequenced.
- [ ] Tablet (1024, 900, 768): stacked, each card starts when its stage is reached, no waiting.
- [ ] Mobile (430, 375, 320): stacked, independent start, readable notify card, "Missed" legible, no layout jump when item 2 expands, no horizontal scroll.
- [ ] Scrolling away mid-animation pauses it, and coming back resumes it.

**Robustness**
- [ ] Reduced motion → final state, no animation, no replay button.
- [ ] JS disabled → final state.
- [ ] No console errors. Images are the optimised versions and load lazily.

**Report back to me with:**
1. Screenshots: the 8 checkpoints next to their Paper frames, plus desktop, tablet and mobile final states.
2. **What you could not match exactly, and why** (for example greyscale filter vs luminosity blend differences, sub-pixel tile sizes, gradient interpolation in browsers without `in oklab`).
3. Any place where you deviated from this prompt.

---

### Decisions this prompt makes that Paper doesn't specify (confirm or change)

1. **"Blue border" = teal (`--teal` #34C1C3).** That's the colour in the Paper frames for the 2 watched tiles.
2. **The pre-state of watched tiles 2 and 7** (before scene 1) is greyscale with a white border, then they colour in. Paper only shows the after state.
3. **The scan does two passes**: a full sweep, then it settles where Paper shows it. A single pass would end off-tile and not match the final frame.
4. **The With "Alert sent as it happened" row is static** (appears with the card). Your brief didn't describe motion for it.
5. **On desktop, while With waits**, it shows its final scene with the replay button hidden. When its turn comes, that scene fades out (400 ms), and then With plays from scene 1. *(Confirmed by you.)*
6. **Mobile composition** (grid on top, notify card below, no "move left") is invented. Paper has no tablet or mobile frames.
7. **Tablet uses the stacked, independent behaviour** (each card starts on arrival), because the cards aren't side by side there.
