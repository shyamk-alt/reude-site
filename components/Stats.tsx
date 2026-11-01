'use client';

import { useEffect, useRef } from 'react';
import { stats } from '@/lib/content';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/** Six headline numbers that count up the first time they scroll into view. */
export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // final values are already in the markup
    const ctx = gsap.context(() => {
      el.querySelectorAll<HTMLElement>('[data-count]').forEach((cell) => {
        const out = cell.querySelector<HTMLElement>('[data-num]');
        if (!out) return;
        const to = Number(cell.dataset.count);
        const o = { v: 0 };
        out.textContent = '0';
        ScrollTrigger.create({
          trigger: cell,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(o, {
              v: to,
              duration: 2.4,
              ease: 'power3.out',
              onUpdate: () => {
                out.textContent = String(Math.round(o.v));
              },
            }),
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} aria-label="REUDE by the numbers" className="relative bg-ink px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">By the numbers</p>
            <h2 className="mt-3 max-w-3xl font-display text-[clamp(1.9rem,4.4vw,4rem)] leading-[1] font-bold tracking-tight">
              Proven on the ground, <span className="text-gradient-orange">in the air.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm text-white/60">Figures from the REUDE product brochure.</p>
        </div>

        <div className="grid grid-cols-2 gap-x-6 lg:grid-cols-3 lg:gap-x-12">
          {stats.map((s) => (
            <div key={s.label} data-reveal data-count={s.to} className="border-t border-white/10 pt-6 pb-10 lg:pb-14">
              <div className="font-display text-[clamp(2.4rem,6.4vw,6rem)] leading-none font-bold tracking-tight tabular-nums">
                {s.prefix && <span className="text-white/45">{s.prefix}</span>}
                <span data-num className="text-gradient-orange">
                  {s.to}
                </span>
                {s.suffix && <span className="text-orange">{s.suffix}</span>}
                {s.unit && <span className="ml-2 text-[0.36em] font-semibold tracking-[0.18em] text-white/60">{s.unit}</span>}
              </div>
              <p className="mt-3 font-mono text-[0.68rem] tracking-[0.2em] text-grey uppercase sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
