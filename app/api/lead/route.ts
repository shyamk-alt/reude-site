import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

type Lead = {
  name?: unknown;
  email?: unknown;
  company?: unknown;
  useCase?: unknown;
  message?: unknown;
  website?: unknown; // honeypot — real users never fill this
};

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * Demo-request endpoint.
 * Set LEAD_WEBHOOK_URL (Formspree, Make, Zapier, a Google Apps Script…) in Vercel
 * and every request is forwarded there. Without it, `delivered` is false and the
 * form falls back to one-tap WhatsApp / email so no lead is silently lost.
 */
export async function POST(req: Request) {
  let body: Lead;
  try {
    body = (await req.json()) as Lead;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (str(body.website, 100)) return NextResponse.json({ ok: true, delivered: false }); // bot

  const lead = {
    name: str(body.name, 120),
    email: str(body.email, 160),
    company: str(body.company, 160),
    useCase: str(body.useCase, 120),
    message: str(body.message, 2000),
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
    return NextResponse.json({ ok: false, error: 'Name and a valid email are required.' }, { status: 422 });
  }

  const hook = process.env.LEAD_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: true, delivered: false });

  try {
    const res = await fetch(hook, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ ...lead, source: 'reude-site', at: new Date().toISOString() }),
    });
    return NextResponse.json({ ok: res.ok, delivered: res.ok }, { status: res.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, delivered: false }, { status: 502 });
  }
}
