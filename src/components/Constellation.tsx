'use client';

import { BRAND } from '@/lib/brand';

/**
 * The floating stack marks beside the hero headline. Purely decorative and
 * static — they establish the technologies at a glance without competing with
 * the headline for attention.
 */
const CHIPS = [
  { slug: 'react', x: 69, y: 10 },
  { slug: 'googlegemini', x: 88, y: 6 },
  { slug: 'python', x: 76, y: 29 },
  { slug: 'tailwindcss', x: 68, y: 46 },
  { slug: 'csharp', x: 87, y: 43 },
  { slug: 'postgresql', x: 72, y: 68 },
  { slug: 'docker', x: 89, y: 70 },
  { slug: 'dotnet', x: 75, y: 87 },
] as const;

export default function Constellation() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
      {CHIPS.map((c) => {
        const icon = BRAND[c.slug];
        if (!icon) return null;
        return (
          <div
            key={c.slug}
            className="group pointer-events-auto absolute grid h-[60px] w-[60px] place-items-center rounded-[17px] border border-line bg-card shadow-[var(--shadow)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)]"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
            }}
          >
            <svg viewBox="0 0 24 24" className="h-[27px] w-[27px]" role="img" aria-label={icon.title}>
              <title>{icon.title}</title>
              <path d={icon.path} fill={icon.color} />
            </svg>
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-md bg-ink px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-on-ink opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100">
              {icon.title}
            </span>
          </div>
        );
      })}
    </div>
  );
}
