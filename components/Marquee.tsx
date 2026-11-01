'use client';

import { useEffect, useRef } from 'react';
import { marquee } from '@/lib/content';
import { gsap } from '@/lib/gsap';

function Set({ hidden = false, outline = false }: { hidden?: boolean; outline?: boolean }) {
  return (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {marquee.map((word) => (
        <li key={word} className="flex items-center">
          <span
            className={`font-display text-[clamp(2.6rem,8vw,7rem)] leading-none font-bold tracking-tight uppercase ${
              outline ? 'text-outline' : 'text-white'
            }`}
          >
            {word}
          </span>
          <span className="mx-[3vw] h-[clamp(0.6rem,1.2vw,1rem)] w-[clamp(0.6rem,1.2vw,1rem)] shrink-0 rounded-full bg-orange" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );
}

/** Infinite strip: a CSS loop for the constant drift, plus a scroll-scrubbed sideways push on top of it. */
export default function Marquee() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-row]').forEach((row, i) => {
        gsap.fromTo(
          row,
          { xPercent: i % 2 ? -7 : 7 },
          {
            xPercent: i % 2 ? 7 : -7,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="What REUDE drones do" className="relative overflow-hidden border-y border-white/10 bg-dark py-10 md:py-14">
      <p className="sr-only">{marquee.join(', ')}</p>
      <div className="marquee" aria-hidden="true">
        <div data-row className="will-change-transform">
          <div className="marquee-track">
            <Set outline />
            <Set outline hidden />
          </div>
        </div>
      </div>
      <div className="marquee mt-3 md:mt-5" aria-hidden="true">
        <div data-row className="will-change-transform">
          <div className="marquee-track reverse">
            <Set />
            <Set hidden />
          </div>
        </div>
      </div>
    </section>
  );
}
