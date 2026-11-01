'use client';

import { useEffect, useRef } from 'react';

/**
 * Orange dot + trailing ring, only where a fine pointer exists.
 * Hovering anything interactive swells the ring; elements with data-cursor-label="Drag" fill it with that word.
 */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const root = document.documentElement;
    root.classList.add('has-cursor');

    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let visible = false;
    let raf = 0;

    const show = (on: boolean) => {
      visible = on;
      const o = on ? '1' : '0';
      if (dot.current) dot.current.style.opacity = o;
      if (ring.current) ring.current.style.opacity = o;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        rx = x;
        ry = y;
        show(true);
      }
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const r = ring.current;
      if (!t || !r || typeof t.closest !== 'function') return;
      const lab = t.closest<HTMLElement>('[data-cursor-label]');
      const hot = t.closest('a,button,[data-cursor],input,select,textarea,label');
      r.classList.toggle('is-label', !!lab);
      r.classList.toggle('is-hover', !!hot && !lab);
      if (label.current) label.current.textContent = lab?.dataset.cursorLabel ?? '';
    };

    const onLeave = () => show(false);

    const frame = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.documentElement.removeEventListener('mouseleave', onLeave);
      root.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
      <div ref={ring} className="cursor-ring" aria-hidden="true">
        <span ref={label} className="cursor-label" />
      </div>
    </>
  );
}
