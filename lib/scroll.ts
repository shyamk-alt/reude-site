import type Lenis from 'lenis';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function getLenis(): Lenis | undefined {
  return typeof window === 'undefined' ? undefined : window.__lenis;
}

export function scrollToId(id: string, offset = 0) {
  if (typeof window === 'undefined') return;
  const el = document.getElementById(id.replace('#', ''));
  if (!el) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset, duration: 1.7 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function scrollToTop() {
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(0, { duration: 1.7 });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * "Watch Film": there is no video file — the film IS the hero scene.
 * We auto-scroll the pinned hero from the windmill to the city so the drone
 * flies the whole route on its own. Any manual scroll takes control back.
 */
export function playFilm() {
  if (typeof window === 'undefined') return;
  const hero = document.getElementById('home');
  if (!hero) return;
  const top = hero.getBoundingClientRect().top + window.scrollY;
  const end = top + hero.offsetHeight - window.innerHeight;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(end, {
      duration: 30,
      lock: false,
      easing: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
    });
  } else {
    scrollToId('products');
  }
}
