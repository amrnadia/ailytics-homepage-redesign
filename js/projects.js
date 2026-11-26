/* Projects accordion: one story is always open.
   The open/close motion is pure CSS (grid-template-rows 0fr ↔ 1fr, 450ms ease-out),
   so a fast second click reverses smoothly from wherever the motion is.
   This file only switches the open story, keeps the clicked row from sliding under
   the navbar, and warms up the photos before they're needed. */

(function () {
  'use strict';

  const list = document.querySelector('[data-accordion]');
  if (!list) return;

  const items = Array.from(list.querySelectorAll('[data-accordion-item]'));
  const triggerOf = (item) => item.querySelector('[data-accordion-trigger]');
  const FOLLOW_MS = 520; // a little longer than the 450ms panel motion

  function setOpen(item, open) {
    const trigger = triggerOf(item);
    item.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', String(open));
    // The open story has nothing to press, so keyboard users skip it
    if (open) trigger.setAttribute('tabindex', '-1');
    else trigger.removeAttribute('tabindex');
  }

  /* The page itself never scrolls: when a story above the clicked one closes, the
     clicked row rises with it and its own photo opens into view. The only correction:
     the row may not slide under the fixed navbar. Checked every frame before paint
     (rAF), so the row simply comes to rest below the nav instead of disappearing. */
  const nav = document.querySelector('[data-nav]');
  const NAV_GAP = 24; // px of breathing room under the navbar

  let followFrame = 0;
  function keepBelowNav(row) {
    cancelAnimationFrame(followFrame);
    const startTop = row.getBoundingClientRect().top;
    const limit = Math.min(startTop, (nav ? nav.offsetHeight : 0) + NAV_GAP);
    const start = performance.now();
    const step = (now) => {
      const top = row.getBoundingClientRect().top;
      if (top < limit - 0.5) window.scrollBy(0, top - limit);
      if (now - start < FOLLOW_MS) followFrame = requestAnimationFrame(step);
    };
    followFrame = requestAnimationFrame(step);
  }

  function open(item) {
    if (item.classList.contains('is-open')) return; // rule 3: the open story can't be closed
    const trigger = triggerOf(item);

    items.forEach((other) => { if (other !== item) setOpen(other, false); });
    setOpen(item, true);
    trigger.focus({ preventScroll: true }); // focus stays on the row that was opened
    keepBelowNav(trigger);
  }

  items.forEach((item) => {
    triggerOf(item).addEventListener('click', () => open(item));
  });

  /* Load (and decode) every photo as the section approaches, so a panel never
     opens onto an empty box. The photo's aspect-ratio fixes its height anyway. */
  const photos = Array.from(list.querySelectorAll('.project__photo'));
  const warmUp = () => {
    photos.forEach((img) => {
      img.loading = 'eager';
      if (img.decode) img.decode().catch(() => {});
    });
  };
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        warmUp();
        io.disconnect();
      }
    }, { rootMargin: '800px 0px' });
    io.observe(list);
  } else {
    warmUp();
  }
})();
