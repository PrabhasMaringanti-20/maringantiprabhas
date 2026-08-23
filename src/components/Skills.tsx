'use client';

import { useRef, useState } from 'react';
import { skillGroups } from '@/data/skills';
import { BRAND } from '@/lib/brand';
import Reveal from './Reveal';

export default function Skills() {
  const [activeId, setActiveId] = useState(skillGroups[0].id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const active = skillGroups.find((g) => g.id === activeId) ?? skillGroups[0];
  const activeIndex = skillGroups.findIndex((g) => g.id === activeId);

  /* Arrow keys move between tabs, as expected of a real tablist. */
  function onKeyDown(e: React.KeyboardEvent) {
    const keys: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      Home: -Infinity,
      End: Infinity,
    };
    const move = keys[e.key];
    if (move === undefined) return;
    e.preventDefault();
    let next: number;
    if (move === -Infinity) next = 0;
    else if (move === Infinity) next = skillGroups.length - 1;
    else next = (activeIndex + move + skillGroups.length) % skillGroups.length;
    setActiveId(skillGroups[next].id);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="stack" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <p className="eyebrow mb-5">Stack</p>
        <h2 className="max-w-[20ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.04]">
          What I reach for, by job.
        </h2>
        <p className="mt-5 max-w-[60ch] text-[18px] leading-relaxed text-ink-2">
          Grouped the way I actually use them. No proficiency bars &mdash; a chart claiming
          &ldquo;C# 87%&rdquo; is a number neither of us could defend.
        </p>
      </Reveal>

      <Reveal delay={90}>
        <div
          role="tablist"
          aria-label="Technology categories"
          onKeyDown={onKeyDown}
          className="mt-12 flex flex-wrap gap-2.5"
        >
          {skillGroups.map((g, i) => {
            const selected = g.id === activeId;
            return (
              <button
                key={g.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${g.id}`}
                aria-selected={selected}
                aria-controls={`panel-${g.id}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveId(g.id)}
                data-cursor
                className={`rounded-full border px-5 py-3 text-[15px] font-bold transition-colors duration-200 ${
                  selected
                    ? 'border-ink bg-ink text-on-ink'
                    : 'border-line-2 bg-card text-ink-2 hover:text-ink'
                }`}
                style={{ boxShadow: selected ? 'none' : 'var(--shadow)' }}
              >
                {g.label}
              </button>
            );
          })}
        </div>

        <div
          role="tabpanel"
          id={`panel-${active.id}`}
          aria-labelledby={`tab-${active.id}`}
          className="mt-9"
        >
          {/* keyed on the group so the stagger replays on every switch */}
          <ul
            key={active.id}
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {active.skills.map((s, i) => {
              const icon = s.slug ? BRAND[s.slug] : undefined;
              return (
                <li
                  key={s.name}
                  data-cursor
                  className="skill-tile group relative flex flex-col items-center gap-3.5 overflow-hidden rounded-2xl border border-line bg-card px-4 pb-5 pt-6 text-center"
                  style={{
                    boxShadow: 'var(--shadow)',
                    animationDelay: `${i * 45}ms`,
                    // the tile's hover bloom takes the brand's own colour
                    ['--tile-glow' as string]: icon?.color ?? 'var(--accent)',
                  }}
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-[0.18]"
                    style={{
                      background:
                        'radial-gradient(120px 70px at 50% 0%, var(--tile-glow), transparent 72%)',
                    }}
                  />
                  {icon ? (
                    <svg viewBox="0 0 24 24" aria-hidden className="relative h-9 w-9">
                      <path d={icon.path} fill={icon.color} />
                    </svg>
                  ) : (
                    <span
                      aria-hidden
                      className="relative grid h-9 w-9 place-items-center rounded-xl font-mono text-[12.5px] font-bold text-accent"
                      style={{ background: 'var(--mg-bg)' }}
                    >
                      {s.mono ?? '··'}
                    </span>
                  )}
                  <span className="relative text-[14.5px] font-bold leading-tight text-ink">
                    {s.name}
                  </span>
                </li>
              );
            })}
          </ul>

          <p className="mt-7 font-mono text-[12.5px] text-ink-3">{active.blurb}</p>
        </div>
      </Reveal>
    </section>
  );
}
