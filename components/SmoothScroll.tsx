'use client';

import Lenis from 'lenis';
import { useEffect, type ReactNode } from 'react';
import { flight } from '@/lib/flight';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/hooks';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker so ScrollTrigger and Lenis share one clock.
 * Also owns the site-wide "fade + slide up on enter" for every [data-reveal] element.
 */
export default function SmoothScroll({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    flight.reduced = reduced;
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    ScrollTrigger.config({ ignoreMobileResize: true });

    let lenis: Lenis | undefined;
    let tick: ((time: number) => void) | undefined;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
      window.__lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      tick = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
    }

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set('[data-reveal]', { opacity: 1, y: 0 });
        return;
      }
      ScrollTrigger.batch('[data-reveal]', {
        start: 'top 90%',
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'power3.out', stagger: 0.09, overwrite: true }),
      });
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    if (document.fonts?.ready) void document.fonts.ready.then(refresh);

    return () => {
      window.removeEventListener('load', refresh);
      ctx.revert();
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy();
      window.__lenis = undefined;
    };
  }, [reduced]);

  return <>{children}</>;
}
