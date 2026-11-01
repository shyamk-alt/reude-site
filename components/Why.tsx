'use client';

import { useEffect, useRef } from 'react';
import { brand, why } from '@/lib/content';
import { ScrollTrigger } from '@/lib/gsap';

/**
 * "Why REUDE": a sticky headline on the left, six reasons on the right. Whichever reason sits in the
 * middle of the screen lights up (scroll-driven), the rest fall back.
 */
export default function Why() {
  const list = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const ol = list.current;
    if (!ol) return;
    const rows = Array.from(ol.querySelectorAll<HTMLElement>('[data-row]'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rows.forEach((r) => (r.dataset.on = 'true'));
      return;
    }
    const triggers = rows.map((row) =>
      ScrollTrigger.create({
        trigger: row,
        start: 'top 62%',
        end: 'bottom 38%',
        onToggle: (self) => {
          row.dataset.on = self.isActive ? 'true' : 'false';
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  return (
    <section id="about" className="relative bg-ink px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto grid max-w-[1500px] gap-12 lg:grid-cols-[0.9fr_1.3fr] lg:gap-20">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div data-reveal>
            <p className="eyebrow">Why REUDE</p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4.8vw,4.4rem)] leading-[0.98] font-bold tracking-tight">
              Built in India. <span className="text-gradient-orange">Built to work.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
              {brand.name} is an {brand.industry.split(' · ')[0].toLowerCase()} company from {brand.industry.split(' · ')[1]}. {brand.positioning.split(' — ')[1]}.
            </p>
          </div>
        </div>

        <ol ref={list} className="relative">
          {why.map((w, i) => (
            <li
              key={w.title}
              data-row
              data-on="false"
              className="group relative border-t border-white/10 py-9 opacity-35 transition-opacity duration-500 data-[on=true]:opacity-100 sm:py-11"
            >
              <span className="absolute top-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-orange to-transparent transition-transform duration-700 group-data-[on=true]:scale-x-100" />
              <div className="grid grid-cols-[auto_1fr] gap-x-6 sm:gap-x-10">
                <span className="text-outline font-display text-[clamp(2.4rem,5vw,4.5rem)] leading-none font-bold">0{i + 1}</span>
                <div>
                  <h3 className="font-display text-[clamp(1.4rem,2.6vw,2.2rem)] leading-tight font-semibold tracking-tight">{w.title}</h3>
                  <p className="mt-3 max-w-xl text-[0.98rem] leading-relaxed text-white/65">{w.body}</p>
                </div>
              </div>
            </li>
          ))}
          <li className="border-t border-white/10" aria-hidden="true" />
        </ol>
      </div>
    </section>
  );
}
