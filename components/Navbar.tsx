'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { brand, nav } from '@/lib/content';
import { getLenis, scrollToId, scrollToTop } from '@/lib/scroll';
import Magnetic from './Magnetic';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState('home');
  const bar = useRef<HTMLDivElement>(null);

  // scroll progress bar + glass-on-scroll
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      setSolid(window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // which section is under the middle of the screen
  useEffect(() => {
    const els = nav.map((n) => document.getElementById(n.id)).filter((el): el is HTMLElement => !!el);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // lock page scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const lenis = getLenis();
    if (open) lenis?.stop();
    else lenis?.start();
    return () => {
      document.documentElement.classList.remove('menu-open');
      getLenis()?.start();
    };
  }, [open]);

  const go = (e: MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    if (id === 'home') scrollToTop();
    else window.setTimeout(() => scrollToId(id), open ? 250 : 0);
  };

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px]" aria-hidden="true">
        <div ref={bar} className="h-full origin-left bg-gradient-to-r from-orange via-orange-light to-[#ffb347]" style={{ transform: 'scaleX(0)' }} />
      </div>

      <header className="pointer-events-none fixed inset-x-0 top-0 z-[90]">
        <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/55 to-transparent transition-opacity duration-500 ${solid ? 'opacity-0' : 'opacity-100'}`} />
        <div className="relative mx-auto max-w-[1500px] px-3 pt-3 sm:px-6 lg:px-10 lg:pt-5">
          <div
            className={`pointer-events-auto flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6 ${
              solid ? 'glass shadow-[0_10px_40px_rgba(0,0,0,0.35)]' : 'border border-transparent bg-transparent'
            }`}
          >
            <a href="#home" onClick={(e) => go(e, 'home')} aria-label={`${brand.name} — back to top`} className="flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logos/reude-horizontal.webp" width={487} height={137} alt={brand.name} className="h-8 w-auto sm:h-9" />
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => go(e, item.id)}
                  aria-current={active === item.id ? 'true' : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${active === item.id ? 'text-white' : 'text-white/65 hover:text-white'}`}
                >
                  {active === item.id && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/10" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <Magnetic className="hidden sm:inline-block">
                <a
                  href="#contact"
                  onClick={(e) => go(e, 'contact')}
                  className="inline-flex items-center rounded-full bg-gradient-to-r from-orange to-orange-light px-5 py-2.5 text-sm font-semibold text-ink shadow-[0_8px_28px_rgba(255,107,0,0.4)] transition-shadow hover:shadow-[0_10px_36px_rgba(255,107,0,0.6)]"
                >
                  Get Demo
                </a>
              </Magnetic>
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? 'Close menu' : 'Open menu'}
                className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 lg:hidden"
              >
                <span className={`absolute h-[2px] w-5 bg-white transition-transform duration-300 ${open ? 'rotate-45' : '-translate-y-[5px]'}`} />
                <span className={`absolute h-[2px] w-5 bg-white transition-opacity duration-200 ${open ? 'opacity-0' : 'opacity-100'}`} />
                <span className={`absolute h-[2px] w-5 bg-white transition-transform duration-300 ${open ? '-rotate-45' : 'translate-y-[5px]'}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 44px) 44px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 44px) 44px)' }}
            transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[85] flex flex-col justify-center bg-ink px-8 lg:hidden"
          >
            <div className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
            <nav aria-label="Mobile" className="relative flex flex-col gap-1">
              {nav.map((item, i) => (
                <motion.a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => go(e, item.id)}
                  initial={{ opacity: 0, y: 36 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.6, ease: [0.2, 0.7, 0.1, 1] }}
                  className="flex items-baseline gap-4 border-b border-white/10 py-4 font-display text-[clamp(2rem,9vw,3.2rem)] font-semibold tracking-tight text-white"
                >
                  <span className="font-mono text-xs text-orange">0{i + 1}</span>
                  {item.label}
                </motion.a>
              ))}
            </nav>
            <motion.a
              href="#contact"
              onClick={(e) => go(e, 'contact')}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="relative mt-10 inline-flex w-fit items-center rounded-full bg-gradient-to-r from-orange to-orange-light px-8 py-4 font-semibold text-ink"
            >
              Get Demo
            </motion.a>
            <p className="relative mt-8 font-mono text-xs tracking-[0.2em] text-white/40 uppercase">{brand.tagline}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
