/* Page-level motion: load fade, nav background on scroll, mobile menu, logo ticker.
   Uses GSAP (+ ScrollTrigger) from js/vendor, so it also runs when index.html is opened from disk.
   If GSAP is missing, the fade is skipped and the nav falls back to a plain scroll listener. */

(function () {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasGsap = typeof window.gsap !== 'undefined';

  /* ---------- 1. Page load: fade the whole site in over ~1.5s ---------- */
  if (hasGsap && !reducedMotion.matches) {
    gsap.to(document.body, { opacity: 1, duration: 1.5, ease: 'power1.out' });
  } else {
    document.body.style.opacity = '1';
  }

  /* ---------- 2. Navigation: transparent → white until it reaches the logo section ---------- */
  const nav = document.querySelector('[data-nav]');
  const logos = document.querySelector('[data-logos]');

  if (nav && logos) {
    // Fully white when the nav's bottom edge reaches the logo section
    // (or at the very bottom, if the page is too short to scroll that far).
    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const navEnd = () => Math.max(1, Math.min(logos.offsetTop - nav.offsetHeight, maxScroll()));

    if (hasGsap && window.ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      gsap.fromTo(
        nav,
        { '--nav-p': 0 },
        {
          '--nav-p': 1,
          ease: 'none',
          scrollTrigger: {
            start: 0,
            end: navEnd,
            scrub: reducedMotion.matches ? true : 0.6, // slight lag = "changes slowly"
            invalidateOnRefresh: true,
          },
        }
      );
    } else {
      const update = () => {
        const p = Math.min(1, Math.max(0, window.scrollY / navEnd()));
        nav.style.setProperty('--nav-p', p.toFixed(3));
      };
      window.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    }
  }

  /* ---------- 3. Mobile menu ---------- */
  const toggle = document.querySelector('[data-nav-toggle]');
  if (nav && toggle) {
    const menu = document.getElementById(toggle.getAttribute('aria-controls'));
    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('is-menu-open', open); // page underneath doesn't scroll
      nav.style.setProperty('--nav-open', open ? '1' : '0');
      toggle.setAttribute('aria-expanded', String(open));
    };
    toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 48rem)').addEventListener('change', (e) => { if (e.matches) setOpen(false); });
  }

  /* ---------- 4. Logo ticker: right → left at a steady 40px/s, linear ----------
     The motion itself is a CSS animation (works even if scripts fail to load).
     Here we only measure one logo set and set the duration so the speed is exactly 40px/s. */
  const SPEED = 40; // px per second
  const track = document.querySelector('[data-logos-track]');

  if (track) {
    const setDuration = () => {
      const setWidth = track.scrollWidth / 2; // the track holds the set twice
      if (setWidth > 0) track.style.setProperty('--ticker-duration', `${(setWidth / SPEED).toFixed(2)}s`);
    };

    let resizeTimer;
    let lastWidth = window.innerWidth;
    window.addEventListener('resize', () => {
      if (window.innerWidth === lastWidth) return; // ignore mobile URL-bar height changes
      lastWidth = window.innerWidth;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setDuration, 150);
    });
    setDuration();
  }
})();
