'use client';

import { brand, nav, socials } from '@/lib/content';
import { scrollToId, scrollToTop } from '@/lib/scroll';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-ink">
      <div
        aria-hidden="true"
        className="text-outline pointer-events-none px-4 text-center font-display text-[clamp(4.5rem,21vw,22rem)] leading-[0.85] font-bold tracking-tighter select-none"
      >
        REUDE
      </div>

      <div className="relative mx-auto grid max-w-[1500px] gap-12 px-5 pt-8 pb-10 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr] lg:px-12">
        <div>
          <img src="/logos/reude-horizontal.webp" width={487} height={137} alt={brand.name} className="h-10 w-auto" loading="lazy" />
          <p className="mt-5 max-w-sm font-display text-xl leading-snug font-semibold">{brand.tagline}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">{brand.industry}</p>
          <p className="mt-6 font-mono text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">{brand.gps}</p>
        </div>

        <nav aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <ul className="mt-5 space-y-3">
            {nav.map((n) => (
              <li key={n.id}>
                <a
                  href={`#${n.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToId(n.id);
                  }}
                  className="text-sm text-white/70 transition-colors hover:text-orange"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="eyebrow">Reach us</p>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li>
              <a href={`mailto:${brand.email}`} className="transition-colors hover:text-orange">
                {brand.email}
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.businessEmail}`} className="transition-colors hover:text-orange">
                {brand.businessEmail}
              </a>
            </li>
            <li>
              <a href={`tel:${brand.phone.replace(/\s/g, '')}`} className="transition-colors hover:text-orange">
                {brand.phone}
              </a>
            </li>
            <li className="max-w-xs leading-relaxed text-white/50">{brand.address}</li>
          </ul>
          <ul className="mt-6 flex flex-wrap gap-2">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block rounded-full border border-white/15 px-4 py-1.5 font-mono text-[0.68rem] tracking-[0.14em] text-white/70 uppercase transition-colors hover:border-orange hover:text-orange"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-[1500px] flex-col items-start justify-between gap-4 border-t border-white/10 px-5 py-6 sm:flex-row sm:items-center sm:px-8 lg:px-12">
        <p className="font-mono text-[0.68rem] tracking-[0.14em] text-white/40 uppercase">
          © {year} {brand.name}. All rights reserved.
        </p>
        <button
          type="button"
          onClick={scrollToTop}
          className="inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.14em] text-white/60 uppercase transition-colors hover:text-orange"
        >
          Back to top
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
