/**
 * "The preloader has finished" signal. Hero copy waits for it before it animates in,
 * so the entrance is seen instead of happening behind the loader.
 */
declare global {
  interface Window {
    __reudeReady?: boolean;
  }
}

export function markReady() {
  if (typeof window === 'undefined') return;
  window.__reudeReady = true;
  window.dispatchEvent(new Event('reude:ready'));
}

export function onReady(cb: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  if (window.__reudeReady) {
    cb();
    return () => {};
  }
  const handler = () => cb();
  window.addEventListener('reude:ready', handler, { once: true });
  return () => window.removeEventListener('reude:ready', handler);
}
