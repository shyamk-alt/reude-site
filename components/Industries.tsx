'use client';

import type { PointerEvent, ReactNode } from 'react';
import { industries } from '@/lib/content';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const ICONS: Record<string, ReactNode> = {
  Farming: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M12 21v-9" />
      <path d="M12 12c0-4 3-6 7-6 0 4-3 6-7 6Z" />
      <path d="M12 15c0-3-2.5-5-6-5 0 3 2.5 5 6 5Z" />
    </svg>
  ),
  Defense: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Logistics: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
      <path d="M3 7.5 12 12l9-4.5" />
      <path d="M12 12v9" />
    </svg>
  ),
  'Renewable Energy': (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M12 11v10M9.5 21h5" />
      <circle cx="12" cy="10" r="1.4" />
      <path d="M12 8.6V2.5M10.8 10.7 5.5 13.7M13.2 10.7l5.3 3" />
    </svg>
  ),
  Infrastructure: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M2 18h20M6 18V7M18 18V7M6 7c2 7 10 7 12 0M10 18v-4M14 18v-4" />
    </svg>
  ),
  Industrial: (
    <svg viewBox="0 0 24 24" className="h-7 w-7" {...stroke} aria-hidden="true">
      <path d="M3 21V11l6 3.5V11l6 3.5V5h6v16H3Z" />
      <path d="M7 18h2M12 18h2M17 18h2" />
    </svg>
  ),
};

function spotlight(e: PointerEvent<HTMLElement>) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function Industries() {
  return (
    <section id="industries" className="relative bg-dark px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-[1500px]">
        <div data-reveal className="mb-14 grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">Industries</p>
            <h2 className="mt-3 font-display text-[clamp(1.9rem,4.8vw,4.4rem)] leading-[0.98] font-bold tracking-tight">
              One drone. <span className="text-gradient-orange">Six jobs.</span>
            </h2>
          </div>
          <p className="max-w-md text-base text-white/65 lg:justify-self-end">
            Swappable payloads and a modular platform put the same aircraft to work from the field to the factory floor.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((it, i) => (
            <div key={it.title} data-reveal>
              <article
                onPointerMove={spotlight}
                className="spot group flex min-h-[290px] flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-[transform,border-color] duration-500 hover:-translate-y-1.5 hover:border-orange/40 sm:p-8"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border border-orange/30 bg-orange/10 text-orange transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
                    {ICONS[it.title]}
                  </span>
                  <span className="font-mono text-xs tracking-[0.2em] text-white/30">0{i + 1}</span>
                </div>
                <h3 className="mt-auto pt-10 font-display text-3xl font-bold tracking-tight">{it.title}</h3>
                <p className="mt-1 font-mono text-[0.7rem] tracking-[0.18em] text-orange uppercase">{it.sub}</p>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-white/65">{it.body}</p>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
