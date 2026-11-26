/* How it works: five 7-second step animations on one camera stage, with a step slider.

   Model: every overlay is a "part" (data-part). A part is shown by adding `.is-on`,
   which runs its CSS enter transition; removing it runs the shared CSS exit.
   Each step has a base (parts that are on from t = 0) and timed cues.
   The active item's progress-bar animation (WAAPI) is the master clock: cues read
   its currentTime, so the bar, the cues and pause/resume can never drift apart. */

(function () {
  'use strict';

  const section = document.querySelector('[data-how]');
  if (!section) return;

  /* ---------- Steps ---------- */
  const STEP_MS = 7000;
  // Steps 1, 2, 3 and 5 spread their motion over most of the 7 s (it settles around
  // 5.2–6.1 s), so the scene keeps changing instead of idling. Step 4 is unchanged.
  // Enter durations live in styles.css next to each part.
  const STEPS = [
    { base: [], cues: [[500, 'frame-top'], [1350, 'frame-right'], [1850, 'frame-bottom'], [2700, 'frame-left'], [3200, 'frame-tag'], [3900, 'color']] },
    { base: ['color'], cues: [[600, 'w1'], [1200, 'w2'], [2000, 'load-target'], [3100, 'target-scan']] },
    { base: ['color'], cues: [[600, 'grid'], [2700, 'grid-scan']] },
    { base: ['color'], cues: [[400, 'w1'], [700, 'w2'], [1000, 'load-target'], [1800, 'ellipse'], [2300, 'side-lines'], [2700, 'drop-fill'], [3400, 'drop-tag'], [3400, 'arrows']] },
    { base: ['color', 'w1', 'w2', 'load-target', 'ellipse', 'side-lines', 'drop-fill'],
      cues: [[0, 'load-dim'], [900, 'safe-line'], [900, 'safe-cap-l'], [2500, 'safe-cap-r'], [2900, 'safe-tag'], [4300, 'card']] },
  ];
  const REVEAL_MS = 900;

  /* ---------- Elements ---------- */
  const stage = section.querySelector('[data-how-stage]');
  const viewport = section.querySelector('[data-how-steps]');
  const list = viewport.querySelector('[role="tablist"]');
  const tabs = Array.from(list.querySelectorAll('[role="tab"]'));
  const items = tabs.map((tab) => tab.parentElement);
  const fills = tabs.map((tab) => tab.querySelector('.how-step__fill'));

  const parts = new Map();
  section.querySelectorAll('[data-part]').forEach((el) => {
    const name = el.dataset.part;
    if (!parts.has(name)) parts.set(name, []);
    parts.get(name).push(el);
  });

  const mqMobile = window.matchMedia('(max-width: 47.99rem)');
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = typeof Element.prototype.animate === 'function';

  /* ---------- State ---------- */
  let index = 0;
  let clock = null;      // the active fill's Animation
  let fired = 0;         // cues fired in the current step
  let frame = 0;         // cue rAF
  let playing = false;
  let started = false;
  let inView = false;

  const setPart = (name, on) => (parts.get(name) || []).forEach((el) => el.classList.toggle('is-on', on));
  const fillFrames = () => [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }];   // horizontal bar at every size

  function applyBase(i) {
    const base = new Set(STEPS[i].base);
    parts.forEach((_, name) => setPart(name, base.has(name)));
  }

  function setActive(i) {
    const focusInList = list.contains(document.activeElement);
    tabs.forEach((tab, k) => {
      const on = k === i;
      tab.classList.toggle('is-active', on);
      tab.setAttribute('aria-selected', String(on));
      if (!focusInList) tab.tabIndex = on ? 0 : -1;
    });
    stage.setAttribute('aria-labelledby', tabs[i].id);
    stage.dataset.step = String(i + 1);     // lets CSS tune a part's enter speed per step
  }

  function fireCues() {
    if (!clock) return;
    const t = clock.currentTime || 0;
    const cues = STEPS[index].cues;
    while (fired < cues.length && cues[fired][0] <= t) {
      setPart(cues[fired][1], true);
      fired += 1;
    }
  }

  function loop() {
    cancelAnimationFrame(frame);
    if (!playing) return;
    const tick = () => {
      fireCues();
      if (playing) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  /* go(i): switch to step i from its start */
  function go(i, { instant = false } = {}) {
    if (clock) {
      clock.onfinish = null;
      clock.cancel();             // that bar snaps back to 0 as its item dims
    }
    index = i;
    fired = 0;
    setActive(i);
    applyBase(i);

    if (canAnimate) {
      clock = fills[i].animate(fillFrames(), { duration: STEP_MS, easing: 'linear', fill: 'forwards' });
      clock.onfinish = () => go((index + 1) % STEPS.length);
      if (!playing) clock.pause();
    }
    reveal(i, { instant });
    loop();
  }

  function play() {
    if (playing) return;
    playing = true;
    stage.classList.remove('is-paused');
    if (clock) clock.play();
    loop();
  }

  function pause() {
    playing = false;
    stage.classList.add('is-paused');
    if (clock) clock.pause();
    cancelAnimationFrame(frame);
  }

  /* ---------- Slider: reveal, tween, edge fades ---------- */
  const horizontal = () => !mqMobile.matches;
  const maxScroll = () => Math.max(0, viewport.scrollWidth - viewport.clientWidth);
  let tweenFrame = 0;
  let tweenEnd = null;

  function cancelTween() {
    cancelAnimationFrame(tweenFrame);
    tweenEnd = null;
  }

  function scrollToX(x, { instant = false } = {}) {
    cancelTween();
    const to = Math.min(Math.max(0, x), maxScroll());
    const from = viewport.scrollLeft;
    if (Math.abs(to - from) < 1) return;
    if (instant || mqReduced.matches) {
      viewport.scrollLeft = to;
      updateFades();
      return;
    }
    const start = performance.now();
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    tweenEnd = () => { viewport.scrollLeft = to; updateFades(); };
    const step = (now) => {
      const t = Math.min(1, (now - start) / REVEAL_MS);
      viewport.scrollLeft = from + (to - from) * ease(t);
      if (t < 1) tweenFrame = requestAnimationFrame(step);
      else { tweenEnd = null; updateFades(); }
    };
    tweenFrame = requestAnimationFrame(step);
  }

  // Bring item i fully into view if it isn't (step 4 → end, loop → start)
  function reveal(i, opts) {
    if (!horizontal()) return;
    const item = items[i];
    const left = item.offsetLeft - list.offsetLeft;
    const right = left + item.offsetWidth;
    const viewLeft = viewport.scrollLeft;
    const viewRight = viewLeft + viewport.clientWidth;
    if (left >= viewLeft - 1 && right <= viewRight + 1) return;
    scrollToX(left, opts);
  }

  let fadeFrame = 0;
  function updateFades() {
    const x = viewport.scrollLeft;
    const max = maxScroll();
    viewport.classList.toggle('has-more-start', horizontal() && x > 1);
    viewport.classList.toggle('has-more-end', horizontal() && x < max - 1);
  }
  viewport.addEventListener('scroll', () => {
    cancelAnimationFrame(fadeFrame);
    fadeFrame = requestAnimationFrame(updateFades);
  }, { passive: true });

  // The user always wins over an automatic glide
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((type) => {
    viewport.addEventListener(type, cancelTween, { passive: true });
  });

  /* Mouse drag (touch and trackpad scroll natively) */
  let drag = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !horizontal()) return;
    drag = { x: e.clientX, scroll: viewport.scrollLeft, moved: false, id: e.pointerId };
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      viewport.setPointerCapture(drag.id);
      viewport.classList.add('is-dragging');
    }
    if (drag.moved) viewport.scrollLeft = drag.scroll - dx;
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (drag.moved) {
      viewport.classList.remove('is-dragging');
      // a drag must never activate a step
      const swallow = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
    }
    drag = null;
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------- Tabs: click + keyboard (manual activation) ---------- */
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      go(i);
      if (!started) { started = true; if (inView && !document.hidden) play(); }
    });
  });

  list.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    const last = tabs.length - 1;
    const keys = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    };
    if (mqMobile.matches) {
      keys.ArrowDown = keys.ArrowRight;
      keys.ArrowUp = keys.ArrowLeft;
    }
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = keys[e.key];
    tabs.forEach((tab, k) => { tab.tabIndex = k === next ? 0 : -1; });
    tabs[next].focus({ preventScroll: true });
    reveal(next);
  });
  // When focus leaves the tablist, the tab stop returns to the active step
  list.addEventListener('focusout', (e) => {
    if (list.contains(e.relatedTarget)) return;
    tabs.forEach((tab, k) => { tab.tabIndex = k === index ? 0 : -1; });
  });

  /* ---------- Scale + breakpoint changes ---------- */
  new ResizeObserver(() => {
    const k = stage.clientWidth / 1312;
    stage.style.setProperty('--how-k', k.toFixed(4));
    stage.style.setProperty('--how-label-k', Math.max(1, 0.6 / k).toFixed(4));
  }).observe(stage);

  new ResizeObserver(() => {
    if (viewport.scrollLeft > maxScroll()) viewport.scrollLeft = maxScroll();
    updateFades();
  }).observe(viewport);

  mqMobile.addEventListener('change', () => {
    list.setAttribute('aria-orientation', mqMobile.matches ? 'vertical' : 'horizontal');
    cancelTween();
    if (mqMobile.matches) viewport.scrollLeft = 0;
    else reveal(index, { instant: true });
    updateFades();
  });
  list.setAttribute('aria-orientation', mqMobile.matches ? 'vertical' : 'horizontal');

  /* ---------- Playback: only while the stage is on screen ---------- */
  function sync() {
    if (inView && !document.hidden) {
      if (!started) {
        started = true;
        go(0);
      }
      play();
    } else {
      pause();
    }
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => { inView = entry.isIntersecting && entry.intersectionRatio >= 0.35; });
    sync();
  }, { threshold: [0, 0.35] }).observe(stage);

  document.addEventListener('visibilitychange', sync);

  /* ---------- Deep links: <a href="#how-title" data-how-step="4"> ----------
     Glides to this section and cues that step up from its start; it plays as soon
     as the stage is on screen (the normal in-view rule above). */
  document.querySelectorAll('a[data-how-step]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const i = Number(link.dataset.howStep) - 1;
      if (!(i >= 0 && i < STEPS.length)) return;
      e.preventDefault();
      started = true;
      pause();
      go(i, { instant: true });
      section.scrollIntoView({ behavior: mqReduced.matches ? 'auto' : 'smooth', block: 'start' });
      sync();
    });
  });

  /* ---------- Initial state: step 1 base, bar at 0, nothing playing ---------- */
  pause();
  setActive(0);
  applyBase(0);
  updateFades();

  /* ---------- Debug hook (verification only): ?debug-how ---------- */
  if (/[?&]debug-how\b/.test(location.search)) {
    window.__how = {
      go: (i) => { started = true; go(i); },
      pause,
      play,
      seek(i, ms) {
        started = true;
        section.classList.add('is-instant');
        pause();
        go(i, { instant: true });
        if (clock) clock.currentTime = ms;
        fireCues();
        if (tweenEnd) { const end = tweenEnd; cancelTween(); end(); }
        requestAnimationFrame(() => requestAnimationFrame(() => section.classList.remove('is-instant')));
      },
    };
  }
})();
