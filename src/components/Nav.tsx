'use client';

import { useEffect, useRef, useState } from 'react';
import { sections, site } from '@/lib/site';
import Icon from './Icon';
import Magnetic from './Magnetic';
import ThemeToggle from './ThemeToggle';

export default function Nav() {
  const [active, setActive] = useState<string>('');
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);
  const [panelHeight, setPanelHeight] = useState(0);
  const burgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /* Animate to the panel's real content height rather than a guessed pixel
     value, so the menu keeps working if its contents ever change. */
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    const measure = () => setPanelHeight(open ? el.scrollHeight : 0);
    measure();
    if (!open) return;
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [open]);

  /* Which section is in view. rootMargin biases toward the upper third so a
     heading counts as "current" once it settles under the bar. */
  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.6, 1] },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  /* Bar gains a background once the page has moved at all. */
  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Escape closes the mobile menu and returns focus to the control that opened it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        burgerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* Close on resize up to desktop so the panel can't be left stranded open. */
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 900px)');
    const onChange = () => mq.matches && setOpen(false);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        lifted ? 'border-b border-line bg-bg/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav aria-label="Primary" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a
          href="#top"
          data-cursor
          className="font-display text-[19px] font-bold tracking-tight text-ink"
        >
          {site.shortName}
          <span className="text-accent">.</span>
        </a>

        <ul className="hidden items-center gap-7 min-[900px]:flex">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                data-cursor
                aria-current={active === s.id ? 'true' : undefined}
                className={`group relative text-[15px] font-medium transition-colors ${
                  active === s.id ? 'text-ink' : 'text-ink-2 hover:text-ink'
                }`}
              >
                {s.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-0.5 rounded-full bg-accent transition-all duration-300 ${
                    active === s.id ? 'w-full opacity-100' : 'w-0 opacity-0 group-hover:w-full group-hover:opacity-60'
                  }`}
                />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Magnetic className="hidden min-[900px]:inline-block">
            <a
              href={site.resume}
              download
              data-cursor
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-on-ink transition-opacity hover:opacity-90"
            >
              <Icon name="download" className="h-4 w-4" />
              Resume
            </a>
          </Magnetic>

          <button
            ref={burgerRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            data-cursor
            className="relative h-10 w-10 flex-none rounded-xl border border-line-2 bg-card min-[900px]:hidden"
          >
            <span
              className={`absolute left-1/2 block h-[1.8px] w-4 -translate-x-1/2 rounded bg-ink transition-transform duration-300 ${
                open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-[15px]'
              }`}
            />
            <span
              className={`absolute left-1/2 block h-[1.8px] w-4 -translate-x-1/2 rounded bg-ink transition-transform duration-300 ${
                open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'top-[22px]'
              }`}
            />
          </button>
        </div>
      </nav>

      {/* mobile panel */}
      <div
        id="mobile-menu"
        ref={panelRef}
        // keeps the panel out of the tab order while collapsed without
        // removing it from the DOM, so the height transition still runs
        inert={!open}
        style={{ maxHeight: panelHeight }}
        className="overflow-hidden border-t border-line bg-card transition-[max-height] duration-[380ms] ease-out min-[900px]:hidden"
      >
        <ul className="px-6 pt-2">
          {sections.map((s) => (
            <li key={s.id} className="border-b border-line last:border-b-0">
              <a
                href={`#${s.id}`}
                onClick={() => setOpen(false)}
                className="block py-3.5 text-[17px] font-bold text-ink"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2.5 px-6 py-5">
          <a
            href={site.resume}
            download
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-on-accent"
          >
            <Icon name="download" className="h-4 w-4" />
            Download resume
          </a>
          <a
            href={`mailto:${site.email}`}
            onClick={() => setOpen(false)}
            className="inline-flex items-center gap-2 rounded-full border border-line-2 px-4 py-2.5 text-sm font-bold text-ink"
          >
            <Icon name="mail" className="h-4 w-4" />
            Email me
          </a>
        </div>
      </div>
    </header>
  );
}
