/* CTA dashboard: rises 100px into place while the section scrolls in.
   Start: the dashboard's resting top edge meets the bottom of the screen
          (starting at the section top would spend most of the rise off screen).
   End:   the section's bottom meets the bottom of the screen.
   Eased out (it slows down as it nears its place) and scrubbed with a 1.5s lag,
   so it follows the scroll softly instead of snapping.
   No GSAP or reduced motion: the dashboard simply stays in place. */

(function () {
  'use strict';

  const section = document.querySelector('[data-cta]');
  const screen = document.querySelector('[data-cta-screen]');
  if (!section || !screen || typeof window.gsap === 'undefined' || !window.ScrollTrigger) return;

  const OFFSET = 100;   // px below its resting place at the start

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(screen, { y: OFFSET }, {
      y: 0,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: screen.parentElement,      // .cta__peek: where the dashboard rests
        start: 'top bottom',
        endTrigger: section,
        end: 'bottom bottom',
        scrub: 1.5,
        invalidateOnRefresh: true,
      },
    });
  });
})();
