'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { Screenshot } from '@/data/projects';

/** Real screenshots from the project's repository, in a browser frame. */
export default function ScreenshotGallery({ shots }: { shots: Screenshot[] }) {
  const [index, setIndex] = useState(0);
  if (!shots.length) return null;
  const shot = shots[index];

  return (
    <div>
      <div className="overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow-lg)]">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span className="ml-2 truncate font-mono text-[11.5px] text-ink-3">
            multi-agent-helpdesk.vercel.app
          </span>
        </div>
        <Image
          key={shot.src}
          src={shot.src}
          alt={shot.alt}
          width={shot.width}
          height={shot.height}
          sizes="(min-width: 1024px) 620px, 100vw"
          className="h-auto w-full"
          priority={false}
        />
      </div>

      {shots.length > 1 && (
        <div className="mt-4 flex flex-wrap gap-2.5">
          {shots.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={s.alt}
              aria-current={i === index}
              className={`h-14 w-20 overflow-hidden rounded-lg border transition-colors ${
                i === index ? 'border-accent' : 'border-line hover:border-line-2'
              }`}
            >
              <Image
                src={s.src}
                alt=""
                width={s.width}
                height={s.height}
                sizes="80px"
                className="h-full w-full object-cover object-top"
              />
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 font-mono text-[11.5px] text-ink-3">
        Real screenshots from the repository — {index + 1} of {shots.length}
      </p>
    </div>
  );
}
