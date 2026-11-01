/**
 * Shared, mutable flight state. The hero ScrollTrigger writes `progress`
 * (0 → 1 across the pinned hero) and the 3D scene + HUD read it every frame.
 * It lives outside React on purpose: nothing re-renders while scrolling.
 */
export const flight = {
  progress: 0,
  reduced: false,
  /** written by the 3D scene each frame, read by the HUD */
  alt: 13,
  speed: 0,
};

/** Fly-through stations: where along the hero scroll each one is "reached". */
export const stations = [
  { at: 0.0, index: '00', title: 'Wind Farm', tag: 'Renewable energy · Blade inspection' },
  { at: 0.22, index: '01', title: 'Farm Field', tag: 'Agriculture · Precision crop spraying' },
  { at: 0.46, index: '02', title: 'Solar Plant', tag: 'Renewable energy · Thermal panel scans' },
  { at: 0.7, index: '03', title: 'Defense Base', tag: 'Defense · Border surveillance' },
  { at: 0.93, index: '04', title: 'City Logistics', tag: 'Logistics · 5–50 KG payload delivery' },
] as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export const smooth = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a));
  return t * t * (3 - 2 * t);
};
