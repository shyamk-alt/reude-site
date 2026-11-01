'use client';

import { useEffect, useRef } from 'react';
import { brand } from '@/lib/content';
import { clamp01 } from '@/lib/flight';
import { ScrollTrigger } from '@/lib/gsap';

const WORDS = brand.sub.replace(' - ', ' — ').split(' ');
const HOT = new Set(['drone', 'multiple', 'functions,', 'farming,', 'defense,']);
const PROOF = ['Dual-patented', 'Cable-less', 'Autonomous', 'Built in Chennai'];

/**
 * Scroll-scrubbed statement: the section pins and the sentence lights up word by word as you scroll,
 * then the four proof points follow. Everything is written straight to the DOM from one ScrollTrigger.
 */
export default function Manifesto() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-w]'));
    const chips = Array.from(el.querySelectorAll<HTMLElement>('[data-chip]'));
    const rule = el.querySelector<HTMLElement>('[data-rule]');
    const n = words.length;

    const apply = (p: number) => {
      const r = p * (n + 4);
      words.forEach((w, i) => {
        w.style.opacity = String(0.14 + 0.86 * clamp01(r - i));
      });
      chips.forEach((c, i) => {
        const k = clamp01((p - 0.72) / 0.16 - i * 0.22);
        c.style.opacity = String(k);
        c.style.transform = `translate3d(0, ${(1 - k) * 18}px, 0)`;
      });
      if (rule) rule.style.transform = `scaleX(${clamp01(p / 0.9)})`;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply(1);
      return;
    }
    apply(0);
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    return () => st.kill();
  }, []);

  return (
    <section ref={section} aria-label="About REUDE" className="relative h-[250svh] bg-ink">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-5 sm:px-8 lg:px-12">
        <div className="grid-bg pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -right-40 top-1/2 h-[46rem] w-[46rem] -translate-y-1/2 rounded-full bg-orange/10 blur-[140px]" />
        <div className="relative mx-auto w-full max-w-[1500px]">
          <p className="eyebrow mb-8 flex items-center gap-3">
            <span className="h-px w-10 bg-orange" />
            Next-Gen Industrial UAV
          </p>
          <p className="max-w-[18ch] font-display text-[clamp(2.1rem,6.4vw,6.4rem)] leading-[1.02] font-semibold tracking-tight sm:max-w-[22ch] lg:max-w-[24ch]">
            {WORDS.map((w, i) => (
              <span key={i} data-w className={HOT.has(w.toLowerCase()) ? 'text-orange' : 'text-white'} style={{ opacity: 0.14 }}>
                {w}{' '}
              </span>
            ))}
          </p>
          <div className="mt-12 h-px w-full max-w-3xl origin-left bg-gradient-to-r from-orange to-transparent" data-rule style={{ transform: 'scaleX(0)' }} />
          <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-3 font-mono text-xs tracking-[0.2em] text-white/80 uppercase sm:text-sm">
            {PROOF.map((c) => (
              <li key={c} data-chip className="flex items-center gap-3" style={{ opacity: 0 }}>
                <span className="h-1.5 w-1.5 rounded-full bg-orange" />
                {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
