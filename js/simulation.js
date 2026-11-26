/* Hero camera-wall simulation.
   Static DOM in index.html; this file only toggles classes and swaps text.
   One scene = 4s (0.3s reveal, 2s scan, 1.7s hold); 6 scenes loop forever.
   Pauses (freezes) only while a tab or the alert link has keyboard focus. */

(function () {
  'use strict';

  const sim = document.querySelector('[data-sim]');
  const data = window.AILYTICS_DATA;
  if (!sim || !data) return;

  const { CAMS, SCENES, TIMING } = data;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const tabs = Array.from(sim.querySelectorAll('[role="tab"]'));
  const panel = sim.querySelector('[role="tabpanel"]');
  const camEls = new Map(
    Array.from(sim.querySelectorAll('[data-cam]')).map((el) => [Number(el.dataset.cam), el])
  );
  const alert = sim.querySelector('[data-sim-alert]');
  const alertBody = sim.querySelector('[data-sim-alert-body]');
  const alertCam = sim.querySelector('[data-sim-alert-cam]');
  const alertMessage = sim.querySelector('[data-sim-alert-message]');

  const camName = (id) => (CAMS.find((c) => c.id === id) || {}).name || '';
  const firstSceneOf = (category) => SCENES.findIndex((s) => s.category === category);

  const state = {
    sceneIndex: 0,
    timerId: null,
    swapTimerId: null,
    sceneStartedAt: 0,
    remaining: TIMING.scene,
    hasFocus: false,
    paused: false,
    activeCam: null,
  };

  /* ---------- Timer ---------- */
  function schedule(ms) {
    clearTimeout(state.timerId);
    state.remaining = ms;
    state.sceneStartedAt = performance.now();
    state.timerId = setTimeout(() => goToScene((state.sceneIndex + 1) % SCENES.length), ms);
  }

  function pause() {
    clearTimeout(state.timerId);
    state.remaining = Math.max(0, state.remaining - (performance.now() - state.sceneStartedAt));
    state.paused = true;
    sim.classList.add('is-paused');
  }

  function resume() {
    state.paused = false;
    sim.classList.remove('is-paused');
    schedule(state.remaining);
  }

  function updatePause() {
    const shouldPause = state.hasFocus;
    if (shouldPause && !state.paused) pause();
    else if (!shouldPause && state.paused) resume();
  }

  /* ---------- Rendering ---------- */
  function setActiveTab(category) {
    tabs.forEach((tab) => {
      const active = tab.dataset.category === category;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      if (active) panel.setAttribute('aria-labelledby', tab.id);
    });
  }

  function activateTile(scene) {
    if (state.activeCam && state.activeCam !== scene.cam) {
      camEls.get(state.activeCam).classList.remove('is-on');
    }
    const tile = camEls.get(scene.cam);
    tile.querySelector('.cam__tag').textContent = scene.tag;
    // Remove + reflow + add so the scan restarts even on the same tile
    tile.classList.remove('is-on');
    void tile.offsetWidth;
    tile.classList.add('is-on');
    state.activeCam = scene.cam;
  }

  function writeAlert(scene) {
    alertCam.textContent = camName(scene.cam);
    alertMessage.textContent = scene.message;
    alert.setAttribute('aria-label', `${scene.message} — see use cases`);
  }

  function swapAlert(scene, immediate) {
    clearTimeout(state.swapTimerId);
    if (immediate) {
      alertBody.classList.remove('is-leaving', 'is-entering');
      writeAlert(scene);
      return;
    }
    // Camera name switches straight away (no effect, like the "Live" label);
    // only the message below it fades out, swaps while invisible, then fades in
    alertCam.textContent = camName(scene.cam);
    alertBody.classList.remove('is-entering');
    alertBody.classList.add('is-leaving');
    state.swapTimerId = setTimeout(() => {
      writeAlert(scene);
      alertBody.classList.add('is-entering');      // jump to the "below" start point, no transition
      alertBody.classList.remove('is-leaving');
      void alertBody.offsetWidth;                  // commit that start point
      alertBody.classList.remove('is-entering');   // transition in
    }, TIMING.textOut);
  }

  function goToScene(index, { immediate = false } = {}) {
    clearTimeout(state.timerId);
    const scene = SCENES[index];
    state.sceneIndex = index;

    sim.dataset.category = scene.category;   // drives --accent / --accent-60 in CSS
    setActiveTab(scene.category);
    activateTile(scene);
    swapAlert(scene, immediate);

    if (state.paused) {
      state.remaining = TIMING.scene;          // new scene waits, frozen, until keyboard focus leaves
    } else {
      schedule(TIMING.scene);
    }
  }

  /* ---------- Tabs ---------- */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => goToScene(firstSceneOf(tab.dataset.category)));
  });

  sim.querySelector('[role="tablist"]').addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    tabs.forEach((t, i) => { t.tabIndex = i === next ? 0 : -1; });
    tabs[next].focus();
  });

  /* ---------- Pause on keyboard focus only (hovering does not pause) ---------- */
  sim.addEventListener('focusin', (e) => {
    // Only keyboard focus counts; a mouse click or tap on a tab must not lock the loop
    state.hasFocus = e.target.matches(':focus-visible');
    updatePause();
  });
  sim.addEventListener('focusout', (e) => {
    if (sim.contains(e.relatedTarget)) return;
    state.hasFocus = false;
    updatePause();
  });

  /* ---------- Start ---------- */
  goToScene(0, { immediate: true });
})();
