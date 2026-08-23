'use client';

import { useEffect, useRef, useState } from 'react';
import { roles, type Role } from '@/data/experience';
import BrandMark from './BrandMark';
import Reveal from './Reveal';

function RoleItem({
  role,
  index,
  open,
  onToggle,
}: {
  role: Role;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const body = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  /* Measure the real content height so the panel animates to whatever it
     actually contains, and stays correct when the text reflows. */
  useEffect(() => {
    const el = body.current;
    if (!el) return;
    const measure = () => setHeight(open ? el.scrollHeight : 0);
    measure();
    if (!open) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  const panelId = `role-panel-${role.id}`;

  return (
    <li className="relative pl-10 sm:pl-14">
      {/* rail marker */}
      <span
        aria-hidden
        className={`absolute left-0 top-[26px] grid h-[26px] w-[26px] place-items-center rounded-full border transition-colors duration-300 sm:left-1 ${
          open ? 'border-accent bg-accent' : 'border-line-2 bg-card'
        }`}
      >
        <span
          className={`block h-2 w-2 rounded-full transition-colors duration-300 ${
            open ? 'bg-on-accent' : 'bg-ink-3'
          }`}
        />
      </span>

      <div
        className={`rounded-2xl border bg-card transition-colors duration-300 ${
          open ? 'border-accent-line' : 'border-line'
        }`}
        style={{ boxShadow: open ? 'var(--shadow-lg)' : 'var(--shadow)' }}
      >
        <h3>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            data-cursor
            className="flex w-full items-start justify-between gap-5 px-6 py-6 text-left sm:px-8 sm:py-7"
          >
            <span className="min-w-0">
              <span className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">
                <span className="text-accent">{String(index + 1).padStart(2, '0')}</span>
                <span>{role.period}</span>
                <span aria-hidden className="text-line-2">
                  /
                </span>
                <span>{role.location}</span>
              </span>
              <span className="block font-display text-[21px] font-semibold leading-tight tracking-tight text-ink sm:text-[24px]">
                {role.title}
              </span>
              <span className="mt-1 block text-[15.5px] font-medium text-accent">{role.company}</span>
              <span className="mt-2.5 block max-w-[54ch] text-[16px] text-ink-2">
                {role.summary}
              </span>
            </span>

            <span
              aria-hidden
              className={`mt-1 grid h-9 w-9 flex-none place-items-center rounded-full border border-line-2 transition-transform duration-300 ${
                open ? 'rotate-45' : ''
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-2" fill="currentColor">
                <path d="M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6V5Z" />
              </svg>
            </span>
          </button>
        </h3>

        <div
          id={panelId}
          inert={!open}
          style={{ maxHeight: height, opacity: open ? 1 : 0 }}
          className="overflow-hidden transition-[max-height,opacity] duration-[420ms] ease-out"
        >
          <div ref={body} className="px-6 pb-7 sm:px-8">
            <ul className="space-y-4 border-t border-line pt-6">
              {role.points.map((p) => (
                <li key={p} className="flex gap-3.5 text-[16.5px] leading-[1.7] text-ink-2">
                  <span
                    aria-hidden
                    className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent"
                  />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-7 flex flex-wrap gap-2">
              {role.tech.map((t) => (
                <li
                  key={t.name}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-[13.5px] font-medium text-ink-2"
                >
                  <BrandMark slug={t.slug} className="h-[15px] w-[15px]" />
                  {t.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Experience() {
  const [openId, setOpenId] = useState<string | null>(roles[0]?.id ?? null);

  return (
    <section id="experience" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <p className="eyebrow mb-5">Experience</p>
        <h2 className="max-w-[20ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.04]">
          Two roles, both shipping to real users.
        </h2>
        <p className="mt-5 max-w-[58ch] text-[18px] leading-relaxed text-ink-2">
          Open either one for the engineering detail. Everything here is straight from my resume.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <ol className="relative mt-14 space-y-6">
          {/* the rail itself, behind the markers */}
          <span
            aria-hidden
            className="absolute bottom-8 left-[13px] top-8 w-px bg-line sm:left-[14px]"
          />
          {roles.map((role, i) => (
            <RoleItem
              key={role.id}
              role={role}
              index={i}
              open={openId === role.id}
              onToggle={() => setOpenId((cur) => (cur === role.id ? null : role.id))}
            />
          ))}
        </ol>
      </Reveal>
    </section>
  );
}
