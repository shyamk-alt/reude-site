'use client';

import { useEffect, useRef } from 'react';
import { story } from '@/lib/content';
import { smooth } from '@/lib/flight';
import { ScrollTrigger } from '@/lib/gsap';

/** One turbine blade, pointing up from the hub at (0,0), 200 units long. */
const BLADE = 'M-12,-6 C-20,-40 -13,-130 -3,-200 L3,-200 C13,-130 20,-40 12,-6 Z';
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const STARS: [number, number, number][] = [
  [60, 40, 1.2], [150, 90, 0.9], [240, 30, 1.1], [330, 70, 0.8], [520, 36, 1.2], [610, 84, 0.9],
  [700, 28, 1.3], [760, 110, 0.8], [110, 150, 0.8], [660, 160, 0.9], [450, 20, 0.8], [20, 120, 1],
];

/**
 * The inspection story, scrubbed by scroll: the section is tall, a sticky stage holds the picture,
 * and one ScrollTrigger writes the drone, thermal sweep, AI box, camera zoom and report straight to the DOM.
 * 0–25% takeoff · 25–50% thermal scan · 50–75% AI detection · 75–100% report.
 */
export default function WindmillStory() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const q = <T extends Element>(s: string) => el.querySelector<T>(s);
    const world = q<SVGGElement>('[data-world]');
    const drone = q<SVGGElement>('[data-drone]');
    const beam = q<SVGPolygonElement>('[data-beam]');
    const scan = q<SVGRectElement>('[data-scan]');
    const rv = q<SVGRectElement>('[data-rv]');
    const thermal = q<SVGGElement>('[data-thermal]');
    const crack = q<SVGPathElement>('[data-crack]');
    const box = q<SVGGElement>('[data-box]');
    const clouds = q<SVGGElement>('[data-clouds]');
    const report = q<HTMLElement>('[data-report]');
    const mode = q<HTMLElement>('[data-mode]');
    const stepNo = q<HTMLElement>('[data-stepno]');
    const bar = q<HTMLElement>('[data-sbar]');
    const steps = Array.from(el.querySelectorAll<HTMLElement>('[data-step]'));
    const dots = Array.from(el.querySelectorAll<HTMLElement>('[data-dot]'));
    let last = -1;

    const apply = (p: number) => {
      // ---- drone path -------------------------------------------------------------------------
      let x: number;
      let y: number;
      let rot = 0;
      if (p < 0.25) {
        const e = smooth(0, 0.25, p);
        x = lerp(110, 330, e);
        y = lerp(498, 220, e) - 40 * Math.sin(Math.PI * e);
        rot = -8 * Math.sin(Math.PI * e);
      } else if (p < 0.5) {
        const s = smooth(0.25, 0.5, p);
        x = 330 + Math.sin(s * 9) * 2.5;
        y = lerp(220, 62, s);
      } else if (p < 0.75) {
        const u = (p - 0.5) / 0.25;
        x = 330;
        y = lerp(62, 113, smooth(0, 0.4, u));
      } else {
        const v = smooth(0.75, 1, p);
        x = lerp(330, 140, v);
        y = lerp(113, 64, v);
      }
      y += Math.sin(p * 90) * 1.4;
      drone?.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(1.1)`);

      const beamOn = smooth(0.2, 0.27, p) * (1 - smooth(0.76, 0.84, p));
      beam?.setAttribute('opacity', beamOn.toFixed(3));

      // ---- thermal sweep: everything the drone has passed is revealed -------------------------
      const top = p < 0.25 ? 232 : p < 0.5 ? Math.min(232, y) : 25;
      rv?.setAttribute('y', top.toFixed(1));
      rv?.setAttribute('height', Math.max(0, 232 - top).toFixed(1));
      thermal?.setAttribute('opacity', smooth(0.25, 0.3, p).toFixed(3));
      const scanLine = p >= 0.25 && p < 0.5 ? 1 : 0;
      scan?.setAttribute('opacity', String(scanLine));
      scan?.setAttribute('y', (y - 1).toFixed(1));
      crack?.setAttribute('opacity', smooth(0.36, 0.42, p).toFixed(3));

      // ---- AI detection box --------------------------------------------------------------------
      const b = smooth(0.52, 0.62, p);
      const bs = 0.6 + 0.4 * b;
      box?.setAttribute('transform', `translate(402 113) scale(${bs.toFixed(3)}) translate(-402 -113)`);
      box?.setAttribute('opacity', b.toFixed(3));

      // ---- camera: push in on the crack, then ease back for the report ------------------------
      const z = smooth(0.42, 0.56, p) * (1 - 0.6 * smooth(0.76, 0.9, p));
      const sc = 1 + 0.85 * z;
      const fx = 400 + 2 * z;
      const fy = 300 + (118 - 300) * z;
      world?.setAttribute('transform', `translate(400 300) scale(${sc.toFixed(3)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);
      clouds?.setAttribute('transform', `translate(${(-p * 36).toFixed(1)} 0)`);

      // ---- report card -------------------------------------------------------------------------
      if (report) {
        const r = smooth(0.76, 0.9, p);
        report.style.opacity = String(r);
        report.style.transform = `translate3d(${(1 - r) * 40}px, 0, 0)`;
      }
      if (bar) bar.style.transform = `scaleX(${p})`;

      // ---- step text (only touch the DOM when the step changes) ---------------------------------
      const idx = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.75 ? 2 : 3;
      if (idx !== last) {
        last = idx;
        steps.forEach((s, i) => {
          s.dataset.on = String(i === idx);
        });
        dots.forEach((d, i) => {
          d.dataset.on = String(i <= idx);
        });
        if (mode) mode.textContent = story.steps[idx].mode;
        if (stepNo) stepNo.textContent = `0${idx + 1} / 0${story.steps.length}`;
      }
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      apply(1);
      steps.forEach((s) => {
        s.dataset.on = 'true';
      });
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
    <section ref={section} id="technology" aria-labelledby="story-title" className="relative h-[520svh] bg-ink motion-reduce:h-auto">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-5 pt-20 pb-4 sm:px-8 lg:px-12 lg:pt-16 lg:pb-0 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        <div className="story-stage mx-auto h-full w-full max-w-[1500px] lg:h-auto">
          {/* heading */}
          <div className="story-head">
            <p className="eyebrow">{story.eyebrow}</p>
            <h2
              id="story-title"
              className="mt-2 font-display text-[clamp(1.55rem,3.4vw,3.2rem)] leading-[1.02] font-bold tracking-tight"
            >
              {story.heading}
            </h2>
          </div>

          {/* scene */}
          <div className="story-scene relative overflow-hidden rounded-3xl border border-white/10 bg-[#060a12]">
            <svg
              viewBox="0 0 800 600"
              className="h-full w-full overflow-visible"
              role="img"
              aria-label="Illustration: an inspection drone takes off, scans a wind turbine blade with a thermal camera, an AI flags a crack, and a report is generated."
            >
              <defs>
                <linearGradient id="ws-sky" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="520">
                  <stop offset="0" stopColor="#060a12" />
                  <stop offset="0.5" stopColor="#111d33" />
                  <stop offset="0.85" stopColor="#4a3350" />
                  <stop offset="1" stopColor="#d9733a" />
                </linearGradient>
                <linearGradient id="ws-thermal" gradientUnits="userSpaceOnUse" x1="0" y1="25" x2="0" y2="232">
                  <stop offset="0" stopColor="#3b1fa8" />
                  <stop offset="0.35" stopColor="#d81f5a" />
                  <stop offset="0.7" stopColor="#ff7a18" />
                  <stop offset="1" stopColor="#ffe14d" />
                </linearGradient>
                <radialGradient id="ws-hot">
                  <stop offset="0" stopColor="#ffffff" />
                  <stop offset="0.25" stopColor="#ffd24a" />
                  <stop offset="0.6" stopColor="#ff2d1a" />
                  <stop offset="1" stopColor="#ff2d1a" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="ws-beam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#ff8a1f" stopOpacity="0.6" />
                  <stop offset="1" stopColor="#ff8a1f" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="ws-tower" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor="#aab3c0" />
                  <stop offset="0.5" stopColor="#e6ebf2" />
                  <stop offset="1" stopColor="#8f98a6" />
                </linearGradient>
                <clipPath id="ws-blade-a">
                  <path d={BLADE} transform="translate(400 225)" />
                </clipPath>
                <clipPath id="ws-reveal">
                  <rect data-rv x="340" y="232" width="120" height="0" />
                </clipPath>
                <g id="ws-mini">
                  <path d="M-2,0 L-1,-90 L1,-90 L2,0 Z" fill="#6b7686" />
                  <g transform="translate(0 -90)">
                    <path d={BLADE} transform="scale(0.45)" fill="#8d97a6" />
                    <path d={BLADE} transform="rotate(120) scale(0.45)" fill="#8d97a6" />
                    <path d={BLADE} transform="rotate(240) scale(0.45)" fill="#8d97a6" />
                    <circle r="4" fill="#aab3c0" />
                  </g>
                </g>
              </defs>

              {/* sky (does not zoom) */}
              <rect x="-1200" y="-1200" width="3200" height="2600" fill="url(#ws-sky)" />
              {STARS.map(([sx, sy, r]) => (
                <circle key={`${sx}-${sy}`} cx={sx} cy={sy} r={r} fill="#fff" opacity="0.65" />
              ))}

              <g data-world>
                <g data-clouds opacity="0.18" fill="#cfd8e6">
                  <ellipse cx="170" cy="190" rx="70" ry="9" />
                  <ellipse cx="215" cy="180" rx="44" ry="8" />
                  <ellipse cx="620" cy="140" rx="84" ry="10" />
                  <ellipse cx="575" cy="131" rx="46" ry="8" />
                </g>

                {/* far hills + mini turbines */}
                <path
                  d="M-1200 520 L-1200 468 C-600 436 -300 498 0 470 S 400 428 800 480 S 1400 438 2000 470 L2000 520 Z"
                  fill="#0c1220"
                />
                <use href="#ws-mini" x="640" y="480" opacity="0.55" />
                <use href="#ws-mini" x="720" y="490" opacity="0.4" />
                <use href="#ws-mini" x="60" y="486" opacity="0.4" />

                {/* ground + pad */}
                <rect x="-1200" y="520" width="3200" height="1000" fill="#070b12" />
                <rect x="-1200" y="520" width="3200" height="2" fill="#ff6b00" opacity="0.35" />
                <rect x="66" y="517" width="88" height="5" rx="2.5" fill="#ff6b00" />

                {/* the inspected turbine */}
                <path d="M394,236 L390,520 L410,520 L406,236 Z" fill="url(#ws-tower)" />
                <rect x="392" y="214" width="46" height="22" rx="9" fill="#e4e9f0" />
                <g transform="translate(400 225)" fill="#eef2f7">
                  <path d={BLADE} />
                  <path d={BLADE} transform="rotate(120)" />
                  <path d={BLADE} transform="rotate(240)" />
                </g>
                <circle cx="400" cy="225" r="11" fill="#f6f8fb" />

                {/* thermal overlay on blade A, revealed as the drone climbs */}
                <g clipPath="url(#ws-blade-a)" data-thermal opacity="0">
                  <g clipPath="url(#ws-reveal)">
                    <rect x="370" y="20" width="60" height="215" fill="url(#ws-thermal)" />
                    <ellipse cx="401" cy="113" rx="22" ry="27" fill="url(#ws-hot)" />
                  </g>
                </g>
                <path
                  data-crack
                  d="M399,98 L404,106 L398,113 L405,121 L401,129"
                  fill="none"
                  stroke="#0a0a0a"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0"
                />

                {/* AI detection box */}
                <g data-box opacity="0">
                  <circle cx="402" cy="113" r="34" fill="none" stroke="#ff3b30" strokeWidth="1.2" className="pulse-ring" />
                  <rect x="372" y="84" width="60" height="58" fill="rgba(255,59,48,0.08)" stroke="#ff3b30" strokeWidth="1.6" strokeDasharray="5 3" />
                  <path d="M372,94 V84 H382 M422,84 H432 V94 M432,132 V142 H422 M382,142 H372 V132" fill="none" stroke="#ff3b30" strokeWidth="3" />
                  <rect x="372" y="68" width="92" height="13" rx="2" fill="#ff3b30" />
                  <text x="377" y="78" fontFamily="var(--font-jetbrains), monospace" fontSize="8" fontWeight="700" fill="#0a0a0a" letterSpacing="0.6">
                    CRACK · AI
                  </text>
                </g>

                {/* scan line across the blade */}
                <rect data-scan x="368" y="0" width="64" height="2" fill="#ffd9a8" opacity="0" />

                {/* the drone */}
                <g data-drone transform="translate(110 498) scale(1.1)" style={{ filter: 'drop-shadow(0 0 6px rgba(255,107,0,0.55))' }}>
                  <polygon data-beam points="10,4 62,-24 62,32" fill="url(#ws-beam)" opacity="0" />
                  <path d="M-12,4 L-16,14 M12,4 L16,14 M-19,14 H-13 M13,14 H19" stroke="#ff8a1f" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                  <path d="M-30,-9 L-10,-3 M30,-9 L10,-3" stroke="#2a2a2a" strokeWidth="3" strokeLinecap="round" />
                  <rect x="-14" y="-7" width="28" height="12" rx="5" fill="#161616" stroke="#ff8a1f" strokeWidth="1.2" />
                  <circle cx="0" cy="9" r="4" fill="#ff6b00" />
                  <ellipse cx="-30" cy="-11" rx="17" ry="3" fill="#fff" opacity="0.14" />
                  <ellipse cx="30" cy="-11" rx="17" ry="3" fill="#fff" opacity="0.14" />
                  <ellipse cx="-30" cy="-11" rx="17" ry="1.8" fill="#dfe5ee" className="spin-fast" />
                  <ellipse cx="30" cy="-11" rx="17" ry="1.8" fill="#dfe5ee" className="spin-fast" />
                </g>
              </g>
            </svg>

            {/* HUD chip */}
            <div className="glass absolute top-3 left-3 flex items-center gap-2.5 rounded-full px-3.5 py-1.5 sm:top-4 sm:left-4">
              <span className="blink h-2 w-2 rounded-full bg-orange" />
              <span data-mode className="font-mono text-[0.62rem] tracking-[0.2em] text-white uppercase">
                {story.steps[0].mode}
              </span>
              <span data-stepno className="font-mono text-[0.62rem] tracking-[0.14em] text-white/45">
                01 / 0{story.steps.length}
              </span>
            </div>

            {/* report card */}
            <div
              data-report
              className="pointer-events-none absolute right-2.5 bottom-3 w-[min(80%,310px)] rounded-2xl border border-white/15 bg-[#0e0e0e]/90 p-4 shadow-2xl backdrop-blur-md sm:right-4 sm:bottom-4"
              style={{ opacity: 0 }}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 font-display text-sm font-bold">
                  <span className="grid h-5 w-5 place-items-center rounded bg-orange text-[0.6rem] font-bold text-ink">Q</span>
                  CompliQ
                </span>
                <span className="font-mono text-[0.56rem] tracking-[0.2em] text-white/50 uppercase">Inspection report</span>
              </div>
              <dl className="mt-3 space-y-1.5 text-[0.72rem] leading-tight">
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Asset</dt>
                  <dd className="text-right text-white/90">Wind turbine · Blade A</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Finding</dt>
                  <dd className="text-right font-semibold text-[#ff6a5e]">Crack · AI detected</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-white/45">Data</dt>
                  <dd className="text-right text-white/90">RGB + thermal + telemetry</dd>
                </div>
              </dl>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[0.6rem] text-white/40">{story.note}</span>
                <span className="rounded-full bg-orange px-3 py-1 font-mono text-[0.58rem] font-semibold tracking-[0.14em] text-ink uppercase">
                  Export PDF
                </span>
              </div>
            </div>

            {/* progress */}
            <div className="absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
              <div data-sbar className="h-full origin-left bg-orange" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>

          {/* steps */}
          <div className="story-steps">
            <div className="mb-3 flex gap-1.5 lg:hidden motion-reduce:hidden" aria-hidden="true">
              {story.steps.map((s, i) => (
                <span
                  key={s.n}
                  data-dot
                  data-on={i === 0 ? 'true' : 'false'}
                  className="h-1 flex-1 rounded-full bg-white/15 transition-colors duration-500 data-[on=true]:bg-orange"
                />
              ))}
            </div>
            <ol className="relative min-h-[8.75rem] lg:min-h-0 motion-reduce:min-h-0">
              {story.steps.map((s, i) => (
                <li
                  key={s.n}
                  data-step
                  data-on={i === 0 ? 'true' : 'false'}
                  className="group absolute inset-x-0 top-0 opacity-0 transition-opacity duration-500 data-[on=true]:opacity-100 lg:static lg:border-t lg:border-white/10 lg:py-4 lg:opacity-40 lg:data-[on=true]:opacity-100 motion-reduce:static motion-reduce:opacity-100"
                >
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs tracking-[0.2em] text-white/40 transition-colors duration-500 group-data-[on=true]:text-orange">
                      {s.n}
                    </span>
                    <h3 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">{s.title}</h3>
                  </div>
                  <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 lg:grid-rows-[0fr] lg:group-data-[on=true]:grid-rows-[1fr]">
                    <div className="overflow-hidden">
                      <p className="max-w-xl pt-2 pl-9 text-[0.9rem] leading-relaxed text-white/65">{s.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
