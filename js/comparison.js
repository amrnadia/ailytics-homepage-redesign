/* Comparison section: "Without" vs "With" stage stories.
   Web Animations API only (no GSAP), one timeline per card.

   The CSS resting state of every stage is its FINAL scene. A timeline is a list of
   element.animate() calls built paused: their first keyframes (backwards fill) form
   the pre-state, so nothing needs "hidden" classes. When a story ends, all of its
   animations are cancelled, which hands control back to the identical CSS final
   state. That keeps resizes and breakpoint changes purely CSS-driven afterwards.

   Desktop (cards side by side): Without plays when the cards come into view, With
   shows its final scene while it waits, then fades and plays its own story.
   Tablet / mobile (stacked): each card plays when its stage comes into view.
   The stage is the same 644 × 350 composition everywhere, scaled to its card. */

(function () {
  'use strict';

  const section = document.querySelector('[data-compare]');
  if (!section) return;

  /* ---------- Timing (seconds unless noted) ---------- */
  const TIMING = {
    // Scene 1 → 2 wait is half the original (tile 7 settles at 2.0 → tags from 2.4, was 2.8)
    without: {
      gridIn: 0, gridInDur: 900,
      watched: [1.2, 1.4], watchedDur: 600,
      missed: [2.4, 3.0, 3.6], missedDur: 450,
      gridLeft: 5.0, gridLeftDur: 1000,
      notifyIn: 5.5, notifyInDur: 600,
      marks: [6.2, 6.55, 6.9, 7.25, 7.6], markDur: 350,
      incident: 8.6, incidentDur: 500, incidentDotDur: 350,
      markerTravel: 9.4, markerTravelDur: 1600,
      replay: 11.6, replayDur: 400,
    },
    // Scene 1 → 2 wait halved (grid settles at 0.9 → detection at 1.45, was 2.0).
    // The scan sweeps once across each feed and is gone (2.85) just before the checks (3.0).
    with: {
      gridIn: 0, gridInDur: 900,
      rings: 1.45, ringsDur: 400,
      scan: 1.45, scanDur: 1400,
      checks: 3.0, checkStep: 0.14, checkDur: 300,
      gridLeft: 5.4, gridLeftDur: 1000,
      notifyIn: 5.9, notifyInDur: 600,
      fill: 6.7, fillDur: 2200,
      replay: 9.4, replayDur: 400,
    },
    handOffDelay: 800,   // ms after Without's replay button has appeared
    handOffFade: 400,    // ms, With's final scene fades out
    handOffPause: 200,   // ms, empty stage before With's scene 1
    replayFade: 200,     // ms, replay button fades out on click
  };

  const EASE = {
    out: 'cubic-bezier(0.22, 1, 0.36, 1)',
    inOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
    pop: 'cubic-bezier(0.34, 1.3, 0.64, 1)',   // slight overshoot, never bouncy
  };

  const STAGE_W = 644;
  const GRID_SHIFT = 139;   // px: centred (scenes 1–2) → left (final)
  const MARKER_SHIFT = 161; // px: right end of the incident track → the big dot

  const mqDesktop = window.matchMedia('(min-width: 72rem)');
  const mqMobile = window.matchMedia('(max-width: 47.99rem)');
  const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const canAnimate = typeof Element.prototype.animate === 'function';

  const layoutMode = () => (mqDesktop.matches ? 'desktop' : mqMobile.matches ? 'mobile' : 'tablet');
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  function shuffle(list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ---------- Timeline: a set of paused WAAPI animations ---------- */
  function createTimeline() {
    const anims = [];
    return {
      add(el, keyframes, { at = 0, dur, easing = EASE.out, fill = 'both' }) {
        const a = el.animate(keyframes, { delay: at * 1000, duration: dur, easing, fill });
        a.pause(); // built paused → first keyframes (pre-state) show immediately
        anims.push(a);
        return a;
      },
      play() { anims.forEach((a) => a.play()); },
      pause() { anims.forEach((a) => a.pause()); },
      seek(s) { anims.forEach((a) => { a.currentTime = s * 1000; }); },
      cancel() { anims.forEach((a) => a.cancel()); anims.length = 0; },
      get finished() { return Promise.all(anims.map((a) => a.finished)); },
    };
  }

  /* ---------- Cards ---------- */
  function setupCard(kind) {
    const root = section.querySelector(`[data-compare-card="${kind}"]`);
    const stage = root.querySelector('[data-stage]');
    const q = (sel) => stage.querySelector(sel);
    const qa = (sel) => Array.from(stage.querySelectorAll(sel));
    return {
      kind,
      stage,
      canvas: q('[data-stage-canvas]'),
      replay: q('[data-replay]'),
      monitor: q('.monitor'),
      feeds: qa('.feed'),
      notify: q('.notify'),
      collapse: q('.notify__collapse'),
      incidentItem: q('.notify__item--incident'),
      marks: qa('.timeline .mark'),
      fill: q('.timeline__fill'),
      incidentDot: q('.incident__dot'),
      marker: q('.incident__marker'),
      timeline: null,
      generation: 0,     // invalidates promises of cancelled runs
      state: 'idle',     // idle | ready (pre-state) | playing | done
      started: false,
      visibleRatio: 0,
      pausedByView: false,
    };
  }

  const cards = { without: setupCard('without'), with: setupCard('with') };
  const cardList = [cards.without, cards.with];

  /* Builds the story. Grid shift is 0 on mobile, where the wall is centred by layout. */
  function buildWithout(card) {
    const T = TIMING.without;
    const tl = createTimeline();
    const dx = GRID_SHIFT;

    // Scene 1: wall rises in at the centre, the two watched feeds colour in
    tl.add(card.monitor, { opacity: [0, 1] }, { at: T.gridIn, dur: T.gridInDur });
    tl.add(card.monitor, { translate: [`${dx}px 24px`, `${dx}px 0px`] }, { at: T.gridIn, dur: T.gridInDur });
    card.feeds.filter((f) => f.classList.contains('feed--watched')).forEach((feed, i) => {
      tl.add(feed.querySelector('.feed__img'), { filter: ['grayscale(1)', 'grayscale(0)'] }, { at: T.watched[i], dur: T.watchedDur });
      tl.add(feed.querySelector('.feed__ring'), { opacity: [0, 1] }, { at: T.watched[i], dur: T.watchedDur });
    });

    // Scene 2: three "Missed" tags, random order
    shuffle(card.feeds.map((f) => f.querySelector('.feed__tag')).filter(Boolean)).forEach((tag, i) => {
      tl.add(tag, { opacity: [0, 1], translate: ['0 6px', '0 0'] }, { at: T.missed[i], dur: T.missedDur });
    });

    // Scene 3: wall slides left, walkaround card with its marks
    tl.add(card.monitor, { translate: [`${dx}px 0px`, '0px 0px'] }, { at: T.gridLeft, dur: T.gridLeftDur, easing: EASE.inOut, fill: 'forwards' });
    tl.add(card.notify, { opacity: [0, 1], translate: ['0 16px', '0 0'] }, { at: T.notifyIn, dur: T.notifyInDur });
    card.marks.forEach((mark, i) => {
      const at = T.marks[i];
      if (mark.classList.contains('mark--dot')) {
        tl.add(mark.querySelector('.mark__dot'), { opacity: [0, 1], scale: [0.4, 1] }, { at, dur: T.markDur, easing: EASE.pop });
        tl.add(mark.querySelector('.mark__line'), { scale: ['1 0', '1 1'] }, { at, dur: T.markDur });
      } else {
        tl.add(mark, { opacity: [0, 1], scale: ['1 0', '1 1'] }, { at, dur: T.markDur });
      }
    });

    // Scene 4: "Found after the incident" opens below, the marker travels back to the incident
    const h = card.collapse.scrollHeight;
    tl.add(card.collapse, { height: ['0px', `${h}px`] }, { at: T.incident, dur: T.incidentDur });
    tl.add(card.incidentItem, { opacity: [0, 1], translate: ['0 8px', '0 0'] }, { at: T.incident, dur: T.incidentDur });
    tl.add(card.incidentDot, { opacity: [0, 1], scale: [0.6, 1] }, { at: T.incident, dur: T.incidentDotDur, easing: EASE.pop });
    tl.add(card.marker, { opacity: [0, 1] }, { at: T.incident, dur: T.incidentDotDur });
    tl.add(card.marker, { translate: [`${MARKER_SHIFT}px 0`, '0 0'] }, { at: T.markerTravel, dur: T.markerTravelDur, easing: EASE.inOut });

    addReplayEntrance(tl, card, T);
    return tl;
  }

  function buildWith(card) {
    const T = TIMING.with;
    const tl = createTimeline();
    const dx = GRID_SHIFT;

    // Scene 1: wall rises in at the centre (all feeds already in full colour)
    tl.add(card.monitor, { opacity: [0, 1] }, { at: T.gridIn, dur: T.gridInDur });
    tl.add(card.monitor, { translate: [`${dx}px 24px`, `${dx}px 0px`] }, { at: T.gridIn, dur: T.gridInDur });

    // Scene 2: every feed is detected at once and scanned left → right in one sweep.
    // The band enters from off the left edge and leaves past the right edge (clipped by
    // the feed), so it's simply gone once it reaches the end; it does not come back.
    card.feeds.forEach((feed) => {
      tl.add(feed.querySelector('.feed__ring'), { opacity: [0, 1] }, { at: T.rings, dur: T.ringsDur });
      tl.add(feed.querySelector('.feed__scan'), { translate: ['-35px 0', '122px 0'] }, { at: T.scan, dur: T.scanDur, easing: EASE.inOut });
    });

    // Scene 3: check badges, random order
    shuffle(card.feeds.map((f) => f.querySelector('.feed__check'))).forEach((check, i) => {
      const base = parseFloat(getComputedStyle(check).scale) || 1; // mobile minimum label size
      tl.add(check, {
        opacity: [0, 1],
        translate: ['0 4px', '0 0'],
        scale: [String(base * 0.9), String(base)],
      }, { at: T.checks + i * T.checkStep, dur: T.checkDur });
    });

    // Scene 4: wall slides left, the coverage card fills from 0 to 100 %
    tl.add(card.monitor, { translate: [`${dx}px 0px`, '0px 0px'] }, { at: T.gridLeft, dur: T.gridLeftDur, easing: EASE.inOut, fill: 'forwards' });
    tl.add(card.notify, { opacity: [0, 1], translate: ['0 16px', '0 0'] }, { at: T.notifyIn, dur: T.notifyInDur });
    tl.add(card.fill, { scale: ['0 1', '1 1'] }, { at: T.fill, dur: T.fillDur, easing: EASE.inOut });

    addReplayEntrance(tl, card, T);
    return tl;
  }

  function addReplayEntrance(tl, card, T) {
    // visibility animates discretely: hidden (not focusable) until the entrance starts
    tl.add(card.replay, {
      opacity: [0, 1],
      translate: ['0 4px', '0 0'],
      visibility: ['hidden', 'visible'],
    }, { at: T.replay, dur: T.replayDur });
  }

  /* ---------- Card lifecycle ---------- */
  function clearTimeline(card) {
    card.generation += 1;
    if (card.timeline) card.timeline.cancel();
    card.timeline = null;
    card.stage.classList.remove('is-animating');
  }

  // Pre-state, paused (the stage looks empty apart from its gradient)
  function prepare(card) {
    clearTimeline(card);
    card.stage.classList.remove('is-replayable');
    card.timeline = card.kind === 'without' ? buildWithout(card) : buildWith(card);
    card.state = 'ready';
  }

  // CSS final scene, optionally with the replay button
  function settle(card, { replayable = true } = {}) {
    clearTimeline(card);
    card.stage.classList.toggle('is-replayable', replayable);
    card.state = 'done';
  }

  function play(card) {
    if (!card.timeline) prepare(card);
    const gen = card.generation;
    card.started = true;
    card.state = 'playing';
    card.stage.classList.add('is-animating');

    const offscreen = card.visibleRatio < 0.15 || document.hidden;
    if (offscreen) card.pausedByView = true;
    else card.timeline.play();

    return card.timeline.finished.then(
      () => {
        if (gen !== card.generation) return false;
        settle(card);
        return true;
      },
      () => false // cancelled
    );
  }

  /* ---------- Desktop sequence: Without, then With hands off from its final scene ---------- */
  let sequenceStarted = false;

  async function runDesktopSequence() {
    sequenceStarted = true;
    const completed = await play(cards.without);
    if (!completed || layoutMode() !== 'desktop' || cards.with.started) return;
    await wait(TIMING.handOffDelay);
    if (layoutMode() !== 'desktop' || cards.with.started) return;
    await handOffWith();
  }

  async function handOffWith() {
    const card = cards.with;
    card.started = true;
    const fade = card.canvas.animate({ opacity: [1, 0] }, { duration: TIMING.handOffFade, easing: EASE.out, fill: 'forwards' });
    try { await fade.finished; } catch (e) { return; }
    prepare(card);              // pre-state is hidden, so the reset can't be seen
    fade.cancel();              // canvas back to opacity 1 instantly
    await wait(TIMING.handOffPause);
    if (card.state !== 'ready') return;
    play(card);
  }

  /* ---------- Replay ---------- */
  cardList.forEach((card) => {
    card.replay.addEventListener('click', async () => {
      if (card.state !== 'done') return;
      card.state = 'replaying';
      const fade = card.replay.animate({ opacity: [1, 0] }, { duration: TIMING.replayFade, easing: 'ease-out', fill: 'forwards' });
      try { await fade.finished; } catch (e) { /* ignore */ }
      prepare(card);
      fade.cancel();
      card.canvas.focus({ preventScroll: true });   // keyboard users keep their place
      play(card);
    });
  });

  /* ---------- Stage scale ---------- */
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(({ target }) => {
      // Same composition at every size: the 644 × 350 canvas scales to the card
      const scale = Math.min(1, target.clientWidth / STAGE_W);
      target.style.setProperty('--stage-scale', scale.toFixed(4));
    });
  });
  cardList.forEach((card) => resizeObserver.observe(card.stage));

  /* ---------- Start triggers ---------- */
  const cardsEl = section.querySelector('[data-compare-cards]');

  // Desktop: Without starts when ≥ 35 % of the card row is visible (once per page view)
  const rowObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.intersectionRatio >= 0.35 && layoutMode() === 'desktop' && !sequenceStarted && motionAllowed()) {
        runDesktopSequence();
      }
    });
  }, { threshold: [0, 0.35] });

  // Per stage: visibility for pause/resume, and the stacked layouts' start trigger
  const stageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const card = cardList.find((c) => c.stage === entry.target);
      card.visibleRatio = entry.intersectionRatio;

      if (card.state === 'playing') {
        if (entry.intersectionRatio < 0.15 && !card.pausedByView) {
          card.timeline.pause();
          card.pausedByView = true;
        } else if (entry.intersectionRatio >= 0.4 && card.pausedByView && !document.hidden) {
          card.timeline.play();
          card.pausedByView = false;
        }
        return;
      }

      if (entry.intersectionRatio >= 0.4 && layoutMode() !== 'desktop' && !card.started && card.state === 'ready' && motionAllowed()) {
        play(card);
      }
    });
  }, { threshold: [0, 0.15, 0.4] });

  document.addEventListener('visibilitychange', () => {
    cardList.forEach((card) => {
      if (card.state !== 'playing') return;
      if (document.hidden) {
        card.timeline.pause();
        card.pausedByView = true;
      } else if (card.visibleRatio >= 0.15) {
        card.timeline.play();
        card.pausedByView = false;
      }
    });
  });

  /* ---------- Modes ---------- */
  const motionAllowed = () => canAnimate && !mqReduced.matches;

  function initialState() {
    if (!motionAllowed()) {
      cardList.forEach((card) => settle(card, { replayable: false }));
      return;
    }
    prepare(cards.without);
    if (layoutMode() === 'desktop') settle(cards.with, { replayable: false }); // waits on its final scene
    else prepare(cards.with);
  }

  // Layout change mid-story (e.g. rotating a tablet): jump to the end, offer replay, no auto restart
  let lastMode = layoutMode();
  function onLayoutChange() {
    const mode = layoutMode();
    if (mode === lastMode) return;
    lastMode = mode;
    if (!motionAllowed()) return;
    sequenceStarted = true;
    cardList.forEach((card) => {
      card.started = true;
      settle(card);
    });
  }
  mqDesktop.addEventListener('change', onLayoutChange);
  mqMobile.addEventListener('change', onLayoutChange);

  mqReduced.addEventListener('change', () => {
    if (mqReduced.matches) {
      cardList.forEach((card) => settle(card, { replayable: false }));
    } else {
      cardList.forEach((card) => { if (card.state === 'done') card.stage.classList.add('is-replayable'); });
    }
  });

  /* ---------- Start (after fonts, so item 2 is measured with Switzer) ---------- */
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  fontsReady.then(() => {
    initialState();
    if (!motionAllowed()) return;
    rowObserver.observe(cardsEl);
    cardList.forEach((card) => stageObserver.observe(card.stage));
  });

  /* ---------- Debug hook (checkpoints): __compare.seek('without', 8.8) ---------- */
  window.__compare = {
    seek(kind, seconds) {
      const card = cards[kind];
      if (!card.timeline) prepare(card);
      card.timeline.pause();
      card.timeline.seek(seconds);
    },
    play(kind) { play(cards[kind]); },
    pause(kind) { if (cards[kind].timeline) cards[kind].timeline.pause(); },
  };
})();
