# Projects accordion: step-by-step guide

**What we're making:** the "+400 active projects around the world" section. It's a list of four customer stories. **Only one story is open at a time.** Opening a story closes the one that was open. Stripe's homepage uses the same pattern for its customer stories.

**Design source:** Paper file "Ailytics homepage redesign", page `homepage`

| State | Paper frame |
|---|---|
| Page loads (story 1 open) | `project-section-default` and `project-section-accordion1` (they look the same) |
| Mouse over a closed story | `project-section-hover` |
| Story 2 open | `project-section-accordion2` |
| Story 3 open | `project-section-accordion3` |
| Story 4 open | `project-section-accordion4` |
| All content on one sheet | `project section` (a working sheet with every story open, **not** a real state) |

If this guide and Paper disagree, Paper wins. Use the six state frames above for sizes. The `project section` working sheet still has a few older values (a 26px headline and 24px logo padding), so ignore it for measurements.

---

## 1. The idea in one picture

Picture a drawer cabinet where only one drawer can be open. When you pull a drawer out, the open one slides shut.

```
┌───────────────────────────────────────────────────────────────┐
│ [CHANGI]  Changi Airport monitors 1,400+ cameras…             │  ← open story: no + button
│ ┌───────────────────────────────────────────────────────────┐ │
│ │                    big project photo                      │ │
│ └───────────────────────────────────────────────────────────┘ │
│ Project: Changi Terminal 5          Location: Singapore       │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤  ← dashed line
│ [RO]      Rogers-O'Brien builds the future tallest…     [ + ] │  ← closed story
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ [LAING]   Laing O'Rourke renovates the Fremantle Bridge [ + ] │
├ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┤
│ [SIME]    Sime Darby Property builds a new residential… [ + ] │
└───────────────────────────────────────────────────────────────┘
```

### The three rules

1. **One story is always open.** When the page loads, story 1 (Changi) is open. The list is never fully closed.
2. **Opening a story closes the open one.** Both happen together in one smooth motion.
3. **You can't close the open story by clicking it.** It has no + button, so there's nothing to click. To close it, open a different story. Paper and Stripe both work this way.

---

## 2. What's inside each story

Every story has two parts.

**A. The title row** (always visible)
- **Logo box** on the left: a small white card with the company logo
- **Headline** in the middle: one sentence about the project
- **+ button** on the right: a small rounded square with a plus sign. It shows **only when the story is closed.**

**B. The details panel** (visible only when open)
- **Project photo**: full width, slightly rounded corners
- **Details line**: "Project: *name*" on the left and "Location: *country*" on the right

### The four stories

All files are in `images/project-images/`.

| # | Company | Headline | Project | Location | Logo file | Photo file |
|---|---|---|---|---|---|---|
| 1 | Changi Airport | Changi Airport monitors 1,400+ cameras with AI video analytics | Changi Terminal 5 | Singapore | `project-logo-1.png` | `project-1.png` |
| 2 | Rogers-O'Brien | Rogers-O'Brien builds the future tallest student housing tower | 250 Church Avenue | United States of America | `project-logo-2.png` | `project-2.png` |
| 3 | Laing O'Rourke | Laing O'Rourke renovates the Fremantle Bridge | Fremantle Bridge | Australia | `project-logo-3.png` | `project-3.png` |
| 4 | Sime Darby Property | Sime Darby Property builds a new residential development in Putra Heights | Damayan Residences | Malaysia | `project-logo-4.png` | `project-4.png` |

---

## 3. Build the look (desktop first)

### Step 1: The section

- Background: very light grey-blue, `#F9FAFB`
- Space above the section: 130px. Space below: 180px
- Space on the left and right: 64px. The content is 1312px wide on a 1440px screen.

### Step 2: The header

- **Small label** "PROJECTS": 12px, all capitals, navy. A tiny 6×6px teal square (`#34C1C3`) sits 11px to its left.
- **Big headline** "+400 active projects around the world": 60px, Switzer Medium, navy `#263C5C`, slightly tight letter spacing (-3%). It wraps onto two lines inside a 583px-wide box.
- **"See all projects" button**: on the far right, lined up with the **bottom** of the headline. Navy pill with white 16px text, 10px top and bottom padding, 24px side padding.
- Gap between the small label and the big headline: 20px
- **Gap from the header to the list: 80px**

### Step 3: The dashed lines between stories

- A thin 1px **dashed** line in light grey `#D8DDE2`, with 6px dashes and 6px gaps
- It goes **above** stories 2, 3 and 4. Story 1 has no line above it.
- Gap from a dashed line down to the title row: 30px
- Gap from the end of one story to the next dashed line: 30px

### Step 4: The title row

From left to right, with 23px between each part, everything centred vertically:

| Part | Look |
|---|---|
| Logo box | 166 × 56px, white, 1px border `#D8DDE2`, 4px rounded corners. **16px** space inside on the left and right and 10px on the top and bottom (the same for all four stories). The logo sits in the centre. |
| Headline | **25px** for all four stories. Switzer Medium, navy `#263C5C`, -3% letter spacing, line height 110%. It takes all the leftover width. |
| + button | 44 × 44px square, 8px rounded corners, pale blue background `#E7EDF7`, navy plus sign. The plus is 14px across with 2px rounded strokes. |

**Logo size inside the box.** Each logo has its own size so they look balanced next to each other. Don't stretch them all to the same width.

| Logo | Size on screen | File size (3× for sharp screens) |
|---|---|---|
| Changi Airport | 117 × 30px | 351 × 90px |
| Rogers-O'Brien | 131 × 27px | 393 × 80px |
| Laing O'Rourke | 124 × 36px | 372 × 108px |
| Sime Darby Property | 56 × 42px | 168 × 126px |

### Step 5: The details panel (open story only)

Directly under the title row:

1. **30px gap**
2. **Project photo**: full width, **562px tall**, 4px rounded corners. It fills the box and crops evenly from the centre.
3. **30px gap**
4. **Details line**, split into two equal halves:
   - Left: "Project:" in soft navy (navy at 80%, regular weight), then the project name in navy medium weight. Both 18px with an 8px gap.
   - Right: "Location:" and the country, styled the same way.
5. **30px** extra space at the bottom of the panel

---

## 4. How it behaves: every interaction

### 4.1 When the page loads
- Story 1 (Changi) is open, with its photo and details showing.
- Stories 2–4 are closed, and each shows its + button.
- Nothing moves on load. The section should look finished straight away.

### 4.2 Hovering a closed story (mouse users only)

This matches the Paper frame `project-section-hover`. Hovering **anywhere on the title row** (logo, headline, empty space or + button) does all of this:

| What changes | Normal | Hovered |
|---|---|---|
| Headline colour | Navy `#263C5C` | Darker teal `#1DAAAE` |
| + button background | Pale blue `#E7EDF7` | Navy `#263C5C` |
| Plus sign colour | Navy | White |
| Mouse pointer | Arrow | Pointing hand |

- **Speed:** each colour fades over about **0.2 seconds**. That's fast enough to feel responsive but still soft.
- When the mouse leaves, everything fades back at the same speed.
- **The open story doesn't react to hover.** It has no button, the headline stays navy, and the pointer stays an arrow. This tells people it's already open.

### 4.3 Clicking a closed story

People can click **anywhere on the title row**, not only the + button. A bigger target is easier to hit, and Stripe works the same way.

Here's what happens in order. The steps overlap, so it feels like one motion.

| Time | Story being **opened** | Story being **closed** |
|---|---|---|
| 0s | The + button shrinks a little and fades out (0.2s). The headline settles back to navy. | Its photo and details fade out quickly (0.15s). |
| 0s → 0.45s | The panel **grows** from zero height to full height. | The panel **shrinks** to zero height at the same time. |
| 0.1s → 0.45s | The photo and details **fade in**. They also drift up about 8px and settle into place. | The + button fades back in (starting about 0.25s). |
| 0.45s | Done. Exactly one story is open. | Done. It's a normal closed row again. |

**How the motion should feel:**
- **Ease-out:** it starts quickly and slows gently to a stop, like a drawer with a soft-close hinge. It shouldn't bounce or snap.
- **About 0.45 seconds in total.** Anything over 0.6s feels slow. Anything under 0.3s feels jumpy, because the panel is very tall (around 650px).
- **The closing and opening happen at the same time.** Don't close one, pause, then open the other.
- **Fade the photo, don't slide it.** If you want a premium touch, the photo can start at 102% size and settle to 100% while it fades in. Keep it subtle.

### 4.4 Keep the clicked row where it is ⚠️ (important)

When someone opens a story **below** the one that's open, the open panel above collapses. Everything below moves up by about 650px, so the row the person just clicked can jump off the top of the screen.

**Fix:** keep the clicked title row in the same spot on screen while the panel above collapses. The page scrolls along with it, so to the user it looks like only their story opened. If you can't do that, gently scroll the clicked row back into view after the animation. Leave about 100px of space above it so it isn't hidden behind a sticky navigation bar.

Test this by opening story 1, scrolling down and clicking story 4. The Sime Darby row should stay under your mouse.

### 4.5 Clicking the open story
Nothing happens. One story is always open (rule 3).

### 4.6 Clicking quickly, many times
If someone clicks story 2, then story 3 before the animation finishes, **the last click wins.** The animation turns towards story 3 smoothly, with no flicker or jump, and there's never a moment with two stories open.

### 4.7 Keyboard users
- Press **Tab** to move between the closed title rows. The open story's row is skipped because there's nothing to press.
- When a row is focused, show a clear **focus ring**: a 2px teal (`#1DAAAE`) outline with 4px of space around the row and slightly rounded corners. Show it only for keyboard focus, not on mouse click.
- Press **Enter** or **Space** to open the focused story. It works just like a click.
- After opening, keep focus on that row so the user doesn't lose their place.

### 4.8 Screen readers
- Each title row should announce itself as a button that's **"collapsed"** or **"expanded"**.
- The + icon is decoration. The headline is the button's name.
- Keep the closed panels' text on the page, hidden from view, so search engines can still read every story.

### 4.9 People who turn off motion
Some people set their device to "reduce motion". For them:
- Skip the grow and shrink animation. The panels swap instantly.
- A very short fade (0.15s) on the photo is fine.
- Hover colour changes can stay.

### 4.10 Images
- Load all four photos when the section comes near the screen, not at the moment someone clicks. Otherwise the panel opens onto an empty grey box.
- The panel's height must stay the same before and after the photo loads, so nothing jumps.

---

## 5. Desktop, tablet and mobile

> Paper only has **desktop (1440px)** frames. The tablet and mobile sizes below are my recommendation, based on the desktop design and Stripe's behaviour. Check them with your design before building.

### Desktop: 1024px and wider
- Use the design exactly as above.
- **Photo size:** instead of a fixed 562px height, keep the photo's **shape**: about 7 wide to 3 tall (1312 × 562). On a 1280px laptop it shrinks in proportion rather than getting squashed.
- Hover effects are on.

### Tablet: 768px to 1023px

| Part | Change |
|---|---|
| Left/right space | 40px |
| Space above/below the section | 96px / 120px |
| Big headline | 48px. "See all projects" stays at the bottom right. |
| Logo box | 140 × 48px |
| Headline in rows | 22px. It can wrap to two lines. |
| + button | Stays 44 × 44px |
| Photo | Keep the 7:3 shape |
| Details line | Still two halves side by side |
| Hover | On for tablets with a mouse or trackpad. **Off for touch-only tablets**, otherwise the teal colour can get "stuck" after a tap. |

Interaction is the same as on desktop: tap a row to open it, and the open one closes.

### Mobile: below 768px

| Part | Change |
|---|---|
| Left/right space | 20px |
| Space above/below the section | 72px / 96px |
| Header | Stacks: small label, then a 36–40px headline, then the "See all projects" button **under** the headline on the left. 24px gap. |
| Title row layout | **Two lines.** Line 1: logo box (112 × 40px) on the left and + button on the right. Line 2: the headline across the full width. 12px between the lines. |
| Headline in rows | 18px, line height 120%. It can wrap to 2–3 lines. |
| + button | Stays **44 × 44px** because it's the minimum comfortable size for a thumb |
| Gaps (dashed line ↔ row, row ↔ photo) | 20px instead of 30px |
| Photo | Taller shape, about **4:3**, so it isn't a thin strip. It still crops from the centre. |
| Details line | Stacks: "Project: …" on one line and "Location: …" below it. 16px text. |

**On touch screens:**
- **No hover effect.** Tapping gives a brief pressed look instead. The + button darkens to navy for a moment, then the story opens.
- The whole title row is the tap area.
- Keeping the tapped row in place (section 4.4) matters most on mobile, because the panels are tall compared with the screen.
- Keep the animation at the same speed as desktop (about 0.45s). Phones don't need faster motion.

---

## 6. Assets

| Asset | Where | Notes |
|---|---|---|
| Project photos 1–4 | `images/project-images/project-1.png` … `project-4.png` | These match the four stories in order. Convert to **WebP** to make them much smaller. |
| Project logos 1–4 | `images/project-images/project-logo-1.png` … `project-logo-4.png` | Colour logos that match the stories in order. Each is exactly 3× its on-screen size, so they stay sharp on high-resolution screens. |
| Font | Switzer (Regular and Medium) | Already used across the homepage |

Don't use `images/logo/` here. Those are the grey "trusted by" logos for a different section.

---

## 7. Final checklist

Open the page next to the Paper frames and check each line:

- [ ] When the page loads, story 1 is open and stories 2–4 are closed. This matches `project-section-default`.
- [ ] Hovering story 2 turns its headline teal and its button navy with a white plus. This matches `project-section-hover`.
- [ ] Clicking stories 2, 3 and 4 in turn matches `accordion2`, `accordion3` and `accordion4`.
- [ ] Exactly one story is open at all times, including after fast repeated clicks.
- [ ] The open story has no + button.
- [ ] There's no dashed line above story 1. There's one above stories 2, 3 and 4.
- [ ] Opening a lower story doesn't throw the clicked row off screen.
- [ ] The motion is one smooth movement of about 0.45s. It slows gently at the end and doesn't bounce or flicker.
- [ ] Photos never show as empty boxes when a story opens.
- [ ] You can open every story with the keyboard alone, and the focus ring is visible.
- [ ] With "reduce motion" on, stories swap with no sliding.
- [ ] Tablet (768px) and mobile (375px) look tidy, with no sideways scrolling and buttons at least 44px.

---

## 8. Differences between Stripe and this design

| Stripe | Ailytics (Paper) | What to do |
|---|---|---|
| Light purple + buttons | Pale blue `#E7EDF7` + buttons, navy on hover | Follow Paper |
| Stat line under the photo ("160 countries", "Products used…") | "Project:" and "Location:" | Follow Paper |
| Solid thin dividers | Dashed dividers | Follow Paper |
