'use client';

import { useEffect, useRef, useState } from 'react';
import { markReady } from '@/lib/ready';

/**
 * REUDE mark + 0–100 counter. It holds until the page has really loaded (and at least ~1.9 s so the
 * moment lands), then the two halves part to reveal the hero. A hard 8 s cap means it can never trap a visitor.
 */
export default function Preloader() {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('is-loading');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minMs = reduced ? 350 : 1900;
    const maxMs = 8000;
    const t0 = performance.now();
    let loaded = document.readyState === 'complete';
    const onLoad = () => {
      loaded = true;
    };
    window.addEventListener('load', onLoad);

    let value = 0;
    let raf = 0;
    let finished = false;
    let timer = 0;

    const finish = () => {
      if (finished) return;
      finished = true;
      setLeaving(true);
      timer = window.setTimeout(
        () => {
          root.classList.remove('is-loading');
          setGone(true);
          markReady();
        },
        reduced ? 60 : 1000,
      );
    };

    const frame = (now: number) => {
      const elapsed = now - t0;
      const canFinish = (loaded && elapsed > minMs) || elapsed > maxMs;
      const target = canFinish ? 100 : Math.min(92, (elapsed / minMs) * 92);
      value += (target - value) * (canFinish ? 0.22 : 0.12);
      if (canFinish && value > 99.4) value = 100;
      const shown = Math.min(100, Math.round(value));
      if (num.current) num.current.textContent = String(shown).padStart(3, '0');
      if (bar.current) bar.current.style.transform = `scaleX(${shown / 100})`;
      if (shown >= 100) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      window.removeEventListener('load', onLoad);
      root.classList.remove('is-loading');
    };
  }, []);

  if (gone) return null;

  return (
    <div className={`preloader fixed inset-0 z-[180] ${leaving ? 'is-leaving' : ''}`} role="status" aria-live="polite" aria-label="Loading REUDE Technologies">
      <div className="preloader__half preloader__half--top" />
      <div className="preloader__half preloader__half--bottom" />
      <div className="preloader__content absolute inset-0 flex flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="relative grid place-items-center">
          <span className="preloader__ring absolute h-36 w-36 rounded-full border border-orange/40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/reude-mark.webp" width={340} height={403} alt="" className="preloader__mark h-24 w-auto" />
        </div>
        <div className="w-[min(72vw,320px)]">
          <div className="flex items-baseline justify-between font-mono text-[0.7rem] tracking-[0.22em] text-white/60 uppercase">
            <span>Preparing flight</span>
            <span>
              <span ref={num} className="text-[1.6rem] font-medium tracking-normal text-white">
                000
              </span>
              <span className="ml-1 text-orange">%</span>
            </span>
          </div>
          <div className="mt-3 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <div ref={bar} className="h-full origin-left rounded-full bg-gradient-to-r from-orange to-orange-light" style={{ transform: 'scaleX(0)' }} />
          </div>
        </div>
        <p className="font-display text-[0.7rem] font-medium tracking-[0.34em] text-white/40 uppercase">One drone · Endless possibilities</p>
      </div>
    </div>
  );
}
