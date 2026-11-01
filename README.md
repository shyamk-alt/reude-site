# REUDE Technologies — scroll-driven 3D website

Next.js 15 · React 19 · React Three Fiber · GSAP ScrollTrigger · Lenis · Framer Motion · Tailwind v4

## Run
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm run lint       # tsc --noEmit
```

## Deploy
Push to GitHub and import into Vercel or Netlify (framework preset: Next.js). Optionally set `LEAD_WEBHOOK_URL` (see `.env.example`).

## What scrolls
1. **Hero** — 620svh pinned scene; the drone flies a curve through 5 stations (wind farm → farm → solar → defense base → city). Drag to rotate 360°.
2. **Marquee** — two rows that drift opposite ways as you scroll.
3. **Manifesto** — pinned statement; words light up as you scroll.
4. **Stats** — count-up on enter.
5. **Products** — vertical scroll drives a horizontal reel of six draggable 360° cards.
6. **Windmill inspection story** — pinned SVG; the drone scans the turbine in four steps.
7. **Industries / Why REUDE / Clients** — spotlight cards, focus-follow rows, sliding logo wall.
8. **Contact** — form + confetti + WhatsApp fallback.

`prefers-reduced-motion` turns every pin and scrub into a normal static layout.

## Before launch — please verify
- Social links in `lib/content.ts` are search / best-guess URLs, not confirmed profiles.
- Hero telemetry is simulated; the inspection report card is illustrative.
- After the first clean `npm run lint`, set `ignoreBuildErrors: false` in `next.config.mjs`.
