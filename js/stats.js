/* Stats: every number counts up from 0 together, once, when the row comes into view.
   The markup already holds the final values (no-JS and reduced motion show them as is).
   Digits are tabular (equal width), so a number only re-centres when it gains a digit,
   which happens in the first moments of the count. */

(function () {
  'use strict';

  const row = document.querySelector('[data-stats-list]');
  if (!row) return;

  const nums = Array.from(row.querySelectorAll('[data-count-to]'));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (!nums.length || reduced.matches || !('IntersectionObserver' in window)) return;

  const DURATION = 2200;                                 // ms: unhurried, never a flicker of digits
  const ease = (t) => 1 - Math.pow(1 - t, 4);            // quick start, long soft landing

  const targets = nums.map((el) => Number(el.dataset.countTo));
  nums.forEach((el) => { el.textContent = '0'; });

  function run() {
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / DURATION);
      const k = ease(t);
      nums.forEach((el, i) => { el.textContent = String(Math.round(targets[i] * k)); });
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) {
      io.disconnect();
      run();
    }
  }, { threshold: 0.6 });
  io.observe(row);

  // If motion gets reduced before the row is reached, show the final values
  reduced.addEventListener('change', () => {
    if (!reduced.matches) return;
    io.disconnect();
    nums.forEach((el, i) => { el.textContent = String(targets[i]); });
  });
})();
