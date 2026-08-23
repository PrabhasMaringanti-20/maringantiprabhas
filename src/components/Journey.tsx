import type { CSSProperties } from 'react';
import { credentials, milestones } from '@/data/journey';
import Reveal from './Reveal';

export default function Journey() {
  return (
    <section id="journey" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <p className="eyebrow mb-5">Journey</p>
        <h2 className="max-w-[20ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.04]">
          Five years, in order.
        </h2>
      </Reveal>

      {/* Horizontal on desktop, vertical on mobile — one rail either way. */}
      <Reveal delay={80}>
        <ol className="relative mt-14 grid gap-8 md:grid-cols-4 md:gap-5">
          <span
            aria-hidden
            className="absolute left-[7px] top-2 bottom-2 w-px bg-line md:left-2 md:right-2 md:top-[7px] md:h-px md:w-auto md:bottom-auto"
          />
          {milestones.map((m) => (
            <li key={m.when + m.title} className="relative pl-8 md:pl-0 md:pt-8">
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 md:top-0 ${
                  m.current ? 'border-accent bg-accent' : 'border-line-2 bg-bg'
                }`}
                style={
                  m.current
                    ? { boxShadow: '0 0 0 5px color-mix(in oklab, var(--accent) 16%, transparent)' }
                    : undefined
                }
              />
              <p
                className={`font-mono text-[11.5px] uppercase tracking-[0.14em] ${
                  m.current ? 'text-accent' : 'text-ink-3'
                }`}
              >
                {m.when}
              </p>
              <h3 className="mt-2.5 text-[17px] font-bold leading-snug tracking-tight text-ink">
                {m.title}
              </h3>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-ink-2">{m.detail}</p>
            </li>
          ))}
        </ol>
      </Reveal>

      <Reveal delay={140}>
        <ul className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {credentials.map((c, i) => (
            <li
              key={c.title}
              className="hued rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow)]"
              style={
                {
                  '--hue': ['var(--accent)', 'var(--warm)', 'var(--aqua)', 'var(--accent)'][i],
                } as CSSProperties
              }
            >
              <p className="eyebrow relative mb-4">{c.kind}</p>
              <h3 className="relative text-[17.5px] font-bold leading-snug tracking-tight text-ink">
                {c.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">{c.issuer}</p>
              {c.meta && (
                <p className="mt-3 font-mono text-[12px] text-ink-3">{c.meta}</p>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
