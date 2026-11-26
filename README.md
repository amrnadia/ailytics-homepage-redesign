# Ailytics homepage redesign

A redesign of the [Ailytics](https://www.ailytics.ai) homepage. Ailytics adds AI video analytics to the CCTV cameras a site already has, and flags safety, security and productivity risks on construction sites, plants, ports and yards.

The page is built from a desktop design made in [Paper](https://paper.design), with tablet and mobile layouts designed to match. It is plain HTML, CSS and JavaScript, with no framework and no build step.

## Sections

| Section | What it does |
| --- | --- |
| Navigation | Transparent over the hero, fades to white as you scroll. Mobile menu. |
| Hero | Headline, plus a live camera-wall simulation that cycles through six detection scenes. |
| Logos | Scrolling ticker of customer logos. |
| Without vs with Ailytics | Two animated stage stories that compare a site with and without Ailytics. |
| Projects | Accordion of four customer stories; one is always open. |
| How it works | Five animated steps on one camera view, with a step slider. |
| Stats | Three numbers that count up once when they come into view. |
| Features | Five features; the intro stays pinned beside the list on desktop and tablet. |
| Results | Two proof points from live projects on a navy panel. |
| Industries | Slider of six industry cards. Drag, swipe, scroll sideways or use the arrow keys. |
| Security and privacy | Three assurance cards. |
| Call to action | Dashboard preview that eases into place as the section scrolls in. |
| Footer | Brand, link columns and LinkedIn. |

## Run it locally

Open `index.html` in a browser, or serve the folder so it behaves like a real site:

```bash
python3 -m http.server 5173
```

Then visit http://localhost:5173.

## Project structure

```
index.html            All markup, one page
css/styles.css        Every style: tokens, sections, tablet and mobile breakpoints
js/
  main.js             Page fade-in, navigation on scroll, mobile menu, logo ticker
  data.js             Content for the hero simulation
  simulation.js       Hero camera-wall simulation
  comparison.js       "Without vs with" stage animations (Web Animations API)
  projects.js         Projects accordion
  how.js              How it works steps and slider
  stats.js            Stats count-up
  industries.js       Industries slider: mouse drag and keyboard
  cta.js              Call-to-action dashboard scroll motion
  vendor/             GSAP 3.12.5 and ScrollTrigger, kept locally
images/
  web/                Compressed WebP images used by the page
  *-images/, logo*/   Original exports, kept untouched
*-prompt.md, *-guide.md   Build notes used while making the animated sections
```

## Design notes

- **Tokens.** Colours, type sizes, spacing and motion timings are CSS variables at the top of `styles.css`, named after the Paper tokens.
- **Responsive.** Sizes use `rem` and `clamp()`, so the layout scales smoothly between breakpoints. The main breakpoints are 72rem (1152px) for desktop and 48rem (768px) for mobile.
- **Motion.** Animations are meant to feel soft and controlled. Scroll effects use GSAP ScrollTrigger; most other motion is CSS transitions or the Web Animations API.
- **Accessibility.** Keyboard support for sliders, tabs and the accordion, visible focus outlines, text alternatives for images, and `prefers-reduced-motion` support (animations stop or show their final state).
- **Without JavaScript.** The page still reads correctly: animated sections show a finished scene and the stats show their final values.

## Browser support

Current versions of Chrome, Edge, Safari and Firefox.
