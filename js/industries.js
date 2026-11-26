/* Industries slider: a native horizontal scroller (touch swipe and trackpads work as is)
   plus mouse drag and arrow keys. Same drag handling as the How step slider:
   a drag never opens a card, a plain click does. Keyboard focus glides the card
   into view (scroll-behavior: smooth in the CSS). */

(function () {
  'use strict';

  const viewport = document.querySelector('[data-industries]');
  if (!viewport) return;

  const list = viewport.querySelector('.industries__list');
  const links = Array.from(viewport.querySelectorAll('.industry__link'));

  const reveal = (link) => link.scrollIntoView({ block: 'nearest', inline: 'nearest' });

  /* ---------- Mouse drag ---------- */
  let drag = null;
  viewport.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
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
      // the release after a drag must not open the card under the pointer
      const swallow = (ev) => { ev.preventDefault(); ev.stopPropagation(); };
      window.addEventListener('click', swallow, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
    }
    drag = null;
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  /* ---------- Keyboard: ← → move card to card, Home / End jump to the ends ---------- */
  list.addEventListener('keydown', (e) => {
    const i = links.indexOf(document.activeElement);
    if (i === -1) return;
    const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: links.length - 1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const next = links[Math.max(0, Math.min(links.length - 1, keys[e.key]))];
    next.focus({ preventScroll: true });
    reveal(next);
  });
})();
