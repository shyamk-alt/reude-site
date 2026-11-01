'use client';

import dynamic from 'next/dynamic';
import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { brand } from '@/lib/content';
import { flight, stations } from '@/lib/flight';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { useReducedMotion } from '@/lib/hooks';
import { playFilm, scrollToId } from '@/lib/scroll';
import Magnetic from './Magnetic';

// The 3D world is a separate chunk: the page paints first, the scene streams in behind it.
const Scene = dynamic(() => import('./Scene'), { ssr: false });

class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('REUDE: 3D scene unavailable, showing the poster instead.', error);
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function canWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* HUD: simulated flight telemetry, written straight into the DOM       */
/* ------------------------------------------------------------------ */

const HUD_ITEMS = [
  { key: 'alt', label: 'ALT' },
  { key: 'spd', label: 'SPEED' },
  { key: 'bat', label: 'BATTERY' },
  { key: 'wind', label: 'WIND' },
] as const;

function Telemetry() {
  const refs = useRef<Record<string, HTMLSpanElement | null>>({});

  useEffect(() => {
    const set = (k: string, v: string) => {
      const el = refs.current[k];
      if (el && el.textContent !== v) el.textContent = v;
    };
    const tick = () => {
      const t = performance.now() / 1000;
      const p = flight.progress;
      set('alt', `${Math.round(120 + (flight.alt - 13) * 6 + Math.sin(t * 1.7) * 2)}m`);
      set('spd', `${Math.round(68 + Math.min(flight.speed, 30) * 0.6 + Math.sin(t * 1.1) * 3)} km/h`);
      set('bat', `${Math.round(92 - p * 13 - Math.sin(t * 0.3) * 0.3)}%`);
      set('wind', `${Math.round(12 + Math.sin(t * 0.8) * 3)} km/h`);
      set('gps', `${(13.1067 + p * 0.004).toFixed(4)}°N ${(80.0977 + p * 0.012).toFixed(4)}°E`);
    };
    tick();
    const id = window.setInterval(tick, 140);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="glass pointer-events-auto rounded-2xl px-4 py-3 sm:px-6">
      <div className="mb-2 flex items-center justify-between font-mono text-[0.6rem] tracking-[0.22em] text-white/45 uppercase">
        <span className="flex items-center gap-2">
          <span className="blink inline-block h-1.5 w-1.5 rounded-full bg-orange" />
          Flight telemetry · simulated
        </span>
        <span className="hidden sm:inline">Avadi, Chennai</span>
      </div>
      <dl className="grid grid-cols-4 gap-x-3 gap-y-2 sm:gap-x-8 lg:grid-cols-5">
        {HUD_ITEMS.map((it) => (
          <div key={it.key}>
            <dt className="font-mono text-[0.6rem] tracking-[0.2em] text-white/45">{it.label}</dt>
            <dd className="font-mono text-[0.78rem] font-medium text-white tabular-nums sm:text-base">
              <span
                ref={(el) => {
                  refs.current[it.key] = el;
                }}
              >
                —
              </span>
            </dd>
          </div>
        ))}
        <div className="col-span-4 lg:col-span-1">
          <dt className="font-mono text-[0.6rem] tracking-[0.2em] text-white/45">GPS</dt>
          <dd className="font-mono text-[0.78rem] font-medium whitespace-nowrap text-white tabular-nums sm:text-base">
            <span
              ref={(el) => {
                refs.current.gps = el;
              }}
            >
              {brand.gps}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  );
}

/** Station card + 5-step rail. It polls flight.progress and only re-renders when the station changes. */
function StationPanel() {
  const [idx, setIdx] = useState(0);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let cur = 0;
    const loop = () => {
      const p = flight.progress;
      let k = 0;
      for (let i = 0; i < stations.length; i++) if (p >= stations[i].at - 0.04) k = i;
      if (k !== cur) {
        cur = k;
        setIdx(k);
      }
      if (box.current) {
        const v = Math.min(1, Math.max(0, (p - 0.06) / 0.05));
        box.current.style.opacity = String(v);
        box.current.style.transform = `translate3d(0, ${(1 - v) * 18}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const st = stations[idx];
  return (
    <div ref={box} className="max-w-[min(100%,26rem)] opacity-0" aria-live="polite">
      <div className="flex items-center gap-3 font-mono text-[0.7rem] tracking-[0.22em] text-orange uppercase">
        <span>Station {st.index}</span>
        <span className="h-px flex-1 bg-white/15" />
        <span className="text-white/40">/ 04</span>
      </div>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-white md:text-4xl">{st.title}</h2>
      <p className="mt-1 text-sm text-white/70 md:text-base">{st.tag}</p>
      <div className="mt-4 flex gap-1.5" aria-hidden="true">
        {stations.map((s, i) => (
          <span key={s.index} className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i <= idx ? 'bg-orange' : 'bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                 */
/* ------------------------------------------------------------------ */

export default function Hero3D() {
  const reduced = useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const hint = useRef<HTMLDivElement>(null);
  const [env, setEnv] = useState<{ mobile: boolean; webgl: boolean } | null>(null);
  const [inView, setInView] = useState(true);
  const [loaded, setLoaded] = useState(false);

  // The page is interactive immediately; the heavy 3D chunk only starts once the browser is idle,
  // and weaker phones get the lighter scene settings.
  useEffect(() => {
    const nav = navigator as Navigator & { deviceMemory?: number };
    const lowEnd = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 3;
    const start = () => setEnv({ mobile: window.innerWidth < 768 || lowEnd, webgl: canWebGL() });
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 800 });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(start, 300);
    return () => window.clearTimeout(t);
  }, []);

  // keep the render loop asleep while the hero is off-screen
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: '120px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // scroll → flight progress, headline fade
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          flight.progress = p;
          const out = Math.min(1, Math.max(0, (p - 0.02) / 0.08));
          if (copy.current) {
            copy.current.style.opacity = String(1 - out);
            copy.current.style.transform = `translate3d(0, ${-out * 60}px, 0)`;
            copy.current.style.pointerEvents = out > 0.6 ? 'none' : '';
          }
          const c = Math.min(1, Math.max(0, p / 0.03));
          if (cue.current) cue.current.style.opacity = String(1 - c);
          if (hint.current && p > 0.1) hint.current.style.opacity = '0';
        },
      });
    }, el);
    return () => {
      ctx.revert();
      flight.progress = 0;
    };
  }, []);

  const onFirstDrag = useCallback(() => {
    if (hint.current) hint.current.style.opacity = '0';
  }, []);
  const onLoaded = useCallback(() => setLoaded(true), []);

  return (
    <section id="home" ref={section} className="relative h-[560svh] bg-ink md:h-[620svh]" aria-label="REUDE Technologies — hero">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* poster: what you see before (or without) the 3D scene */}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#10183a_0%,#8a3b2f_45%,#d9602b_72%,#f3b277_100%)]" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center opacity-20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/reude-stacked.webp" width={792} height={709} alt="" className="w-[min(60vw,420px)]" />
        </div>

        {/* the real-time 3D world */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`} data-cursor-label="Drag" aria-hidden="true">
          {env?.webgl && (
            <SceneBoundary onFail={() => setLoaded(false)}>
              <Scene mobile={env.mobile} reduced={reduced} active={inView} onLoaded={onLoaded} onFirstDrag={onFirstDrag} />
            </SceneBoundary>
          )}
        </div>

        {/* legibility scrims */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        {/* overlay */}
        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-5 pt-28 pb-4 sm:px-8 sm:pb-6 lg:px-12">
          <div ref={copy} className="max-w-3xl will-change-transform">
            <p className="hero-in eyebrow mb-5 flex items-center gap-3" style={{ animationDelay: '0.02s' }}>
              <span className="h-px w-8 bg-orange" />
              Industrial UAV · Chennai, India
            </p>
            <h1 className="text-shadow-hero font-display text-[clamp(2.4rem,6.2vw,6rem)] leading-[0.92] font-bold tracking-tight uppercase">
              <span className="hero-in block text-white" style={{ animationDelay: '0.08s' }}>One Drone</span>
              <span className="hero-in text-gradient-orange block" style={{ animationDelay: '0.14s' }}>Endless</span>
              <span className="hero-in text-gradient-orange block" style={{ animationDelay: '0.2s' }}>Possibilities</span>
            </h1>
            <p className="hero-in mt-6 max-w-xl text-base text-white/85 md:text-lg" style={{ animationDelay: '0.28s' }}>{brand.sub}</p>
            <div className="hero-in pointer-events-auto mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: '0.36s' }}>
              <Magnetic>
                <button
                  type="button"
                  onClick={() => scrollToId('contact')}
                  className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange to-orange-light px-7 py-4 font-semibold text-ink shadow-[0_10px_40px_rgba(255,107,0,0.5)]"
                >
                  Book a Demo
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </Magnetic>
              <Magnetic>
                <button
                  type="button"
                  onClick={playFilm}
                  className="glass inline-flex items-center gap-3 rounded-full py-3 pr-6 pl-3 font-semibold text-white"
                  aria-label="Watch film: the drone flies the whole route on its own"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-ink">
                    <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                  Watch Film
                </button>
              </Magnetic>
            </div>
          </div>

          <div className="relative">
            <div ref={cue} className="pointer-events-none absolute -top-28 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 sm:flex">
              <span className="font-mono text-[0.65rem] tracking-[0.3em] text-white/70 uppercase">Scroll to Fly</span>
              <span className="h-12 w-px overflow-hidden bg-white/15">
                <span className="scroll-line block h-full w-full bg-orange" />
              </span>
            </div>

            <div className="mb-4 flex items-end justify-between gap-6">
              <StationPanel />
              <div ref={hint} className="hidden shrink-0 items-center gap-3 font-mono text-[0.65rem] tracking-[0.22em] text-white/60 uppercase transition-opacity duration-500 md:flex">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-orange" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5" />
                </svg>
                Drag to orbit 360°
              </div>
            </div>
            <Telemetry />
          </div>
        </div>
      </div>
    </section>
  );
}
