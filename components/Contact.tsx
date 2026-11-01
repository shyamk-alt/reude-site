'use client';

import { useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { brand, useCases } from '@/lib/content';
import { fireConfetti } from '@/lib/confetti';
import Magnetic from '@/components/Magnetic';

type Status = 'idle' | 'sending' | 'sent' | 'fallback' | 'error';

const waLink = (text: string) => `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(text)}`;

export default function Contact() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = form.current;
    if (!f || status === 'sending') return;
    const data = Object.fromEntries(new FormData(f).entries()) as Record<string, string>;

    setStatus('sending');
    setError('');

    const text = [
      `Hi REUDE, I'd like a demo.`,
      `Name: ${data.name}`,
      data.company ? `Company: ${data.company}` : '',
      data.useCase ? `Use case: ${data.useCase}` : '',
      data.message ? `Notes: ${data.message}` : '',
      `Email: ${data.email}`,
    ]
      .filter(Boolean)
      .join('\n');
    setSummary(text);

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; delivered?: boolean; error?: string };

      if (res.status === 422) {
        setStatus('error');
        setError(json.error ?? 'Please check your name and email.');
        return;
      }

      const r = f.getBoundingClientRect();
      fireConfetti(0.5, Math.min(0.8, Math.max(0.3, (r.top + r.height / 2) / window.innerHeight)));
      // delivered: true only when a webhook accepted the lead. Otherwise we are honest and hand off to WhatsApp / email.
      setStatus(json.ok && json.delivered ? 'sent' : 'fallback');
      f.reset();
    } catch {
      setStatus('fallback');
    }
  }

  const done = status === 'sent' || status === 'fallback';

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative overflow-hidden bg-ink px-5 py-24 sm:px-8 lg:px-12 lg:py-36">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 -right-40 h-[38rem] w-[38rem] rounded-full opacity-40 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,107,0,.45), transparent 65%)' }}
      />
      <div className="relative mx-auto grid max-w-[1500px] gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <div>
          <div data-reveal>
            <p className="eyebrow">Book a demo</p>
            <h2 id="contact-title" className="mt-4 font-display text-[clamp(2.2rem,6vw,5rem)] leading-[0.98] font-bold tracking-tight">
              Let&rsquo;s put one drone <span className="text-gradient-orange">to work.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/65">
              Tell us the job — inspection, delivery, farming, testing — and we&rsquo;ll show you which REUDE platform fits and what a first deployment looks like.
            </p>
          </div>

          <ul data-reveal className="mt-10 space-y-5 text-sm">
            <li>
              <p className="font-mono text-[0.66rem] tracking-[0.2em] text-white/40 uppercase">WhatsApp / Call</p>
              <a href={waLink("Hi REUDE, I'd like to know more about your drones.")} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-display text-2xl font-semibold transition-colors hover:text-orange">
                {brand.phone}
              </a>
            </li>
            <li>
              <p className="font-mono text-[0.66rem] tracking-[0.2em] text-white/40 uppercase">Email</p>
              <a href={`mailto:${brand.businessEmail}`} className="mt-1 inline-block text-white/80 transition-colors hover:text-orange">
                {brand.businessEmail}
              </a>
            </li>
            <li>
              <p className="font-mono text-[0.66rem] tracking-[0.2em] text-white/40 uppercase">Factory &amp; HQ</p>
              <p className="mt-1 max-w-sm leading-relaxed text-white/60">{brand.address}</p>
            </li>
          </ul>
        </div>

        <div data-reveal className="glass relative rounded-[1.75rem] p-6 sm:p-9">
          {done ? (
            <div role="status" aria-live="polite" className="flex min-h-[26rem] flex-col items-start justify-center">
              <svg viewBox="0 0 52 52" className="h-16 w-16 text-orange" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="26" cy="26" r="23" className="draw-check" style={{ '--cw': 145 } as CSSProperties} />
                <path d="M15 27l8 8 15-17" className="draw-check" style={{ '--cw': 40, animationDelay: '.45s' } as CSSProperties} />
              </svg>
              {status === 'sent' ? (
                <>
                  <h3 className="mt-6 font-display text-3xl font-bold">Request received.</h3>
                  <p className="mt-3 max-w-md text-white/65">Our team will reply to your email shortly. Want an even faster answer? Message us on WhatsApp.</p>
                </>
              ) : (
                <>
                  <h3 className="mt-6 font-display text-3xl font-bold">One last tap.</h3>
                  <p className="mt-3 max-w-md text-white/65">
                    We couldn&rsquo;t file this automatically, so nothing has been sent yet. Send it to the team in one tap — it&rsquo;s already written for you.
                  </p>
                </>
              )}
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href={waLink(summary || "Hi REUDE, I'd like a demo.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-orange px-6 py-3 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                >
                  Send on WhatsApp
                </a>
                <a
                  href={`mailto:${brand.businessEmail}?subject=${encodeURIComponent('Demo request — REUDE')}&body=${encodeURIComponent(summary)}`}
                  className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition-colors hover:border-orange hover:text-orange"
                >
                  Send by email
                </a>
                <button type="button" onClick={() => setStatus('idle')} className="px-3 py-3 text-sm text-white/50 underline-offset-4 hover:text-white hover:underline">
                  New request
                </button>
              </div>
            </div>
          ) : (
            <form ref={form} onSubmit={onSubmit} noValidate={false} className="space-y-4" aria-describedby={error ? 'form-error' : undefined}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.66rem] tracking-[0.18em] text-white/50 uppercase">Name *</span>
                  <input name="name" required maxLength={120} autoComplete="name" placeholder="Your name" className="field" />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.66rem] tracking-[0.18em] text-white/50 uppercase">Email *</span>
                  <input name="email" type="email" required maxLength={160} autoComplete="email" placeholder="you@company.com" className="field" />
                </label>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.66rem] tracking-[0.18em] text-white/50 uppercase">Company</span>
                  <input name="company" maxLength={160} autoComplete="organization" placeholder="Company / institution" className="field" />
                </label>
                <label className="block">
                  <span className="mb-2 block font-mono text-[0.66rem] tracking-[0.18em] text-white/50 uppercase">Use case</span>
                  <select name="useCase" defaultValue="" className="field">
                    <option value="" disabled>
                      Choose one
                    </option>
                    {useCases.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="block">
                <span className="mb-2 block font-mono text-[0.66rem] tracking-[0.18em] text-white/50 uppercase">What should the drone do?</span>
                <textarea name="message" rows={4} maxLength={2000} placeholder="Site, payload, range, timeline…" className="field resize-y" />
              </label>

              {/* honeypot — hidden from people and assistive tech */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              {status === 'error' && (
                <p id="form-error" role="alert" className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Magnetic>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    data-cursor-label="Send"
                    className="rounded-full bg-orange px-8 py-4 text-sm font-semibold text-black transition-opacity disabled:opacity-60"
                  >
                    {status === 'sending' ? 'Sending…' : 'Request a demo'}
                  </button>
                </Magnetic>
                <a
                  href={waLink("Hi REUDE, I'd like to know more about your drones.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 underline-offset-4 transition-colors hover:text-orange hover:underline"
                >
                  or WhatsApp us directly
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
