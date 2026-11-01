'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { products, type Product } from '@/lib/content';
import { clamp01 } from '@/lib/flight';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { scrollToId } from '@/lib/scroll';

const N = products.length;
const pad = (n: number) => String(n).padStart(2, '0');

/** "Enquire" on a card: tell the contact form which use case to pre-select, then scroll to it. */
function enquire(useCase: string) {
  window.dispatchEvent(new CustomEvent('reude:enquire', { detail: useCase }));
  scrollToId('contact');
}

/**
 * One product. Drag it (mouse or finger) to spin it 360°, let go and it settles on the nearest face;
 * a tap or the Flip button turns it over. Front = the product, back = what it does.
 */
function ProductCard({ p, index }: { p: Product; index: number }) {
  const inner = useRef<HTMLDivElement>(null);
  const angle = useRef({ y: 0 });
  const showingBack = useRef(false);
  const drag = useRef<{ x: number; start: number; last: number; v: number; moved: boolean } | null>(null);
  const [back, setBack] = useState(false);

  const paint = useCallback(() => {
    const y = angle.current.y;
    if (inner.current) gsap.set(inner.current, { rotationY: y });
    const m = ((y % 360) + 360) % 360;
    const b = m > 90 && m < 270;
    if (b !== showingBack.current) {
      showingBack.current = b;
      setBack(b);
    }
  }, []);

  const settle = useCallback(
    (to: number) => {
      gsap.killTweensOf(angle.current);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        angle.current.y = to;
        paint();
        return;
      }
      gsap.to(angle.current, { y: to, duration: 0.9, ease: 'back.out(1.5)', onUpdate: paint });
    },
    [paint],
  );

  const flip = useCallback(() => settle(Math.round(angle.current.y / 180) * 180 + 180), [settle]);

  useEffect(() => {
    const a = angle.current;
    return () => {
      gsap.killTweensOf(a);
    };
  }, []);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button,a')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gsap.killTweensOf(angle.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, start: angle.current.y, last: e.clientX, v: 0, moved: false };
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 4) d.moved = true;
    d.v = e.clientX - d.last;
    d.last = e.clientX;
    if (d.moved) {
      angle.current.y = d.start + dx * 0.55;
      paint();
    }
  };
  const up = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    const y = angle.current.y;
    settle(d.moved ? Math.round((y + d.v * 6) / 180) * 180 : Math.round(y / 180) * 180 + 180);
  };
  const cancel = () => {
    if (!drag.current) return;
    drag.current = null;
    settle(Math.round(angle.current.y / 180) * 180);
  };

  return (
    <div
      className="card3d h-full w-full touch-pan-y select-none"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={cancel}
    >
      <div ref={inner} className="card3d__inner">
        {/* FRONT */}
        <div
          className="card3d__face absolute inset-0 flex flex-col border border-white/10 bg-[#0e0e0e]"
          inert={back || undefined}
          aria-hidden={back || undefined}
        >
          <div
            data-cursor-label="Drag"
            className="relative h-[54%] shrink-0 overflow-hidden bg-[radial-gradient(80%_80%_at_50%_30%,#232323,#0e0e0e)]"
          >
            <img
              src={p.image}
              alt={`${p.name} — ${p.kicker}`}
              width={1100}
              height={720}
              loading="lazy"
              decoding="async"
              draggable={false}
              className={`h-full w-full ${p.fit === 'cover' ? 'object-cover' : 'object-contain p-4'}`}
            />
            <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 font-mono text-[0.62rem] tracking-[0.2em] text-white/85 uppercase">
              {p.division} · {p.divisionName}
            </span>
            <span className="text-outline absolute top-3 right-4 font-display text-5xl leading-none font-bold">{pad(index + 1)}</span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
            <p className="eyebrow">{p.kicker}</p>
            <h3 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-none font-bold tracking-tight">{p.name}</h3>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {p.chips.map((c) => (
                <li key={c} className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[0.68rem] text-white/75">
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center justify-between pt-3">
              <span className="font-mono text-[0.62rem] tracking-[0.2em] text-white/40 uppercase">Drag to rotate</span>
              <button
                type="button"
                onClick={flip}
                className="rounded-full border border-white/20 px-3.5 py-1.5 font-mono text-[0.62rem] tracking-[0.18em] text-white uppercase transition-colors hover:border-orange hover:text-orange"
              >
                Flip ↻
              </button>
            </div>
          </div>
        </div>

        {/* BACK */}
        <div
          className="card3d__face card3d__back flex flex-col border border-orange/30 bg-[#0e0e0e]"
          inert={back ? undefined : true}
          aria-hidden={back ? undefined : true}
        >
          <div data-lenis-prevent className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-5 sm:p-6">
            <p className="eyebrow">{p.useCase}</p>
            <h3 className="mt-2 font-display text-[clamp(1.5rem,2.4vw,2.1rem)] leading-none font-bold tracking-tight">{p.name}</h3>
            <p className="mt-3 text-[0.95rem] leading-snug font-medium text-white">{p.tagline}</p>
            <p className="mt-2 text-[0.8rem] leading-snug text-white/60">{p.desc}</p>
            <dl data-cursor-label="Drag" className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {p.features.map((f) => (
                <div key={f.label + f.value} className="rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
                  <dt className="font-mono text-[0.68rem] leading-tight font-semibold text-orange">{f.value}</dt>
                  <dd className="mt-0.5 text-[0.66rem] leading-tight text-white/50">{f.label}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <button
                type="button"
                onClick={() => enquire(p.useCase)}
                className="rounded-full bg-orange px-5 py-2.5 font-mono text-[0.68rem] font-semibold tracking-[0.16em] text-ink uppercase transition-transform hover:scale-105"
              >
                Enquire →
              </button>
              <button
                type="button"
                onClick={flip}
                className="rounded-full border border-white/20 px-3.5 py-2 font-mono text-[0.62rem] tracking-[0.18em] text-white uppercase transition-colors hover:border-orange hover:text-orange"
              >
                ↺ Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Scroll-driven product reel: the section is as tall as the reel is wide, a sticky stage holds the
 * viewport and the page scroll slides the cards sideways. The card nearest the centre is the one in focus.
 * Under reduced motion it becomes a plain horizontally-scrolling, snap-aligned row.
 */
export default function Products() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const sec = section.current;
    const tr = track.current;
    if (!sec || !tr) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const wraps = Array.from(tr.children) as HTMLElement[];
    const bar = sec.querySelector<HTMLElement>('[data-bar]');
    const cur = sec.querySelector<HTMLElement>('[data-cur]');
    const div = sec.querySelector<HTMLElement>('[data-div]');

    let dist = 0;
    let vw = 0;
    let lefts: number[] = [];
    let widths: number[] = [];
    let focus = -1;

    const measure = () => {
      vw = document.documentElement.clientWidth;
      dist = Math.max(0, tr.offsetWidth - vw);
      sec.style.height = `calc(100svh + ${dist}px)`;
      lefts = wraps.map((w) => w.offsetLeft);
      widths = wraps.map((w) => w.offsetWidth);
    };

    const apply = (p: number) => {
      const x = -dist * p;
      tr.style.transform = `translate3d(${x}px,0,0)`;
      const mid = vw / 2;
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i < wraps.length; i++) {
        const d = Math.abs(lefts[i] + widths[i] / 2 + x - mid);
        const k = clamp01(d / (vw * 0.6));
        wraps[i].style.transform = `scale(${1 - 0.07 * k})`;
        wraps[i].style.opacity = String(1 - 0.5 * k);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      if (bar) bar.style.transform = `scaleX(${clamp01(p)})`;
      if (best !== focus) {
        focus = best;
        if (cur) cur.textContent = pad(best + 1);
        if (div) div.textContent = products[best].divisionName;
      }
    };

    measure();
    apply(0);
    ScrollTrigger.addEventListener('refreshInit', measure);
    const st = ScrollTrigger.create({
      trigger: sec,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => apply(self.progress),
      onRefresh: (self) => apply(self.progress),
    });
    ScrollTrigger.refresh();

    return () => {
      st.kill();
      ScrollTrigger.removeEventListener('refreshInit', measure);
      sec.style.height = '';
      tr.style.transform = '';
      wraps.forEach((w) => {
        w.style.transform = '';
        w.style.opacity = '';
      });
    };
  }, []);

  return (
    <section ref={section} id="products" aria-labelledby="products-title" className="relative h-[600svh] bg-dark motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-20 md:pt-24 motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-24">
        <div className="px-5 sm:px-8 lg:px-12">
          <div className="mx-auto flex max-w-[1500px] items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Products</p>
              <h2
                id="products-title"
                className="mt-2 font-display text-[clamp(1.9rem,4.8vw,4.4rem)] leading-[0.98] font-bold tracking-tight"
              >
                Six systems. <span className="text-gradient-orange">Three divisions.</span>
              </h2>
            </div>
            <p className="hidden max-w-xs pb-1 text-sm text-white/60 md:block">Scroll to move through the line-up. Drag any card to turn it around.</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden motion-reduce:overflow-x-auto motion-reduce:snap-x motion-reduce:snap-mandatory">
          <ul ref={track} className="flex w-max gap-5 px-5 will-change-transform sm:px-8 lg:gap-8 lg:px-12">
            {products.map((p, i) => (
              <li
                key={p.id}
                className="reel-card h-[clamp(420px,calc(100svh-17rem),640px)] w-[min(82vw,500px)] shrink-0 motion-reduce:snap-center"
              >
                <ProductCard p={p} index={i} />
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto mt-5 flex w-full max-w-[1500px] items-center gap-4 px-5 sm:px-8 lg:px-12 motion-reduce:hidden">
          <span data-cur className="font-mono text-xs text-orange tabular-nums">
            01
          </span>
          <div className="h-px flex-1 bg-white/15">
            <div data-bar className="h-full origin-left bg-orange" style={{ transform: 'scaleX(0)' }} />
          </div>
          <span className="font-mono text-xs text-white/40 tabular-nums">{pad(N)}</span>
          <span data-div className="hidden w-40 text-right font-mono text-[0.66rem] tracking-[0.18em] text-white/60 uppercase sm:block">
            {products[0].divisionName}
          </span>
        </div>
      </div>
    </section>
  );
}
