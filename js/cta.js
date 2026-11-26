/* CTA dashboard: rises 100px into place while the section scrolls in.
   Start: the dashboard's resting top edge is one visible-slice height below the bottom
          of the screen, so the rise is spread over twice the scroll distance
          (half the movement per frame) while most of it is still seen.
   End:   the section's bottom meets the bottom of the screen.
   Sine in-out easing (it eases into motion and slows down as it lands) and a 3s
   scrub lag, so the dashboard glides after the scroll instead of tracking it 1:1.
   No GSAP or reduced motion: the dashboard simply stays in place. */

(function () {
  'use strict';

  const section = document.querySelector('[data-cta]');
  const screen = document.querySelector('[data-cta-screen]');
  if (!section || !screen || typeof window.gsap === 'undefined' || !window.ScrollTrigger) return;

  const OFFSET = 100;   // px below its resting place at the start
  const peek = screen.parentElement;   // .cta__peek: the visible slice where the dashboard rests

  gsap.registerPlugin(ScrollTrigger);
  gsap.matchMedia().add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(screen, { y: OFFSET }, {
      y: 0,
      ease: 'sine.inOut',
      scrollTrigger: {
        trigger: peek,
        start: () => `top bottom+=${peek.offsetHeight}`,
        endTrigger: section,
        end: 'bottom bottom',
        scrub: 3,                           // seconds the dashboard takes to catch up with the scroll
        invalidateOnRefresh: true,
      },
    });
  });
})();
