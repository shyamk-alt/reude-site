'use client';

import { useEffect, useRef } from 'react';
import { clients, supporters } from '@/lib/content';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Trusted-by wall. Scroll-driven: the giant outlined word slides sideways as the section passes,
 * and the white supporters band drifts the opposite way. Under reduced motion everything is static.
 */
export default function Clients() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-slide="l"]',
        { xPercent: 8 },
        { xPercent: -14, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      );
      const band = el.querySelector<HTMLElement>('[data-band]');
      if (band) {
        gsap.fromTo(
          '[data-slide="r"]',
          { xPercent: -3 },
          { xPercent: 3, ease: 'none', scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        );
      }
    }, el);

    return () => {
      ctx.revert();
      ScrollTrigger.refresh();
    };
  }, []);

  return (
    <section ref={section} id="clients" aria-labelledby="clients-title" className="relative overflow-hidden bg-dark py-24 lg:py-36">
      <div
        aria-hidden="true"
        data-slide="l"
        className="text-outline pointer-events-none absolute top-6 left-0 font-display text-[clamp(5rem,16vw,15rem)] leading-none font-bold tracking-tighter whitespace-nowrap select-none"
      >
        TRUSTED · TRUSTED · TRUSTED
      </div>

      <div className="relative mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div data-reveal className="max-w-2xl pt-10 lg:pt-20">
          <p className="eyebrow">Clients &amp; Partners</p>
          <h2 id="clients-title" className="mt-4 font-display text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-bold tracking-tight">
            Trusted by teams that <span className="text-gradient-orange">can&rsquo;t afford to fail.</span>
          </h2>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {clients.map((c) => (
            <li key={c.name} data-reveal>
              <div className="glass group flex h-28 items-center justify-center rounded-2xl p-6 transition-colors duration-300 hover:border-orange/50 sm:h-32">
                <img
                  src={c.logo}
                  alt={c.name}
                  loading="lazy"
                  decoding="async"
                  style={{ width: `min(100%, ${c.w}px)` }}
                  className="max-h-14 object-contain opacity-70 grayscale transition duration-300 group-hover:opacity-100 group-hover:grayscale-0 sm:max-h-16"
                />
              </div>
            </li>
          ))}
          <li data-reveal className="col-span-2 sm:col-span-1">
            <div className="flex h-28 items-center justify-center rounded-2xl border border-dashed border-white/15 p-6 text-center sm:h-32">
              <span className="font-mono text-[0.68rem] tracking-[0.2em] text-white/45 uppercase">
                Your name here —{' '}
                <a href="#contact" className="text-orange underline-offset-4 hover:underline">
                  talk to us
                </a>
              </span>
            </div>
          </li>
        </ul>

        <div data-reveal className="mt-20">
          <p className="eyebrow">Backed &amp; supported by</p>
        </div>
      </div>

      <div data-band className="relative mt-8 overflow-hidden">
        <div data-slide="r" className="mx-auto flex w-max max-w-none items-center gap-10 rounded-[2rem] bg-white/95 px-10 py-8 sm:gap-16 sm:px-16">
          {supporters.map((s) => (
            <img
              key={s.name}
              src={s.logo}
              alt={s.name}
              loading="lazy"
              decoding="async"
              style={{ width: s.w * 0.72 }}
              className="h-auto max-h-14 shrink-0 object-contain"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
