'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Fades a block up as it enters the viewport, once.
 *
 * Deliberately starts *visible* and is only hidden on mount, after we know an
 * IntersectionObserver is available and motion is allowed. If anything goes
 * wrong — no JS, no IO, reduced motion — the content is simply there, rather
 * than stranded at opacity 0.
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !('IntersectionObserver' in window)
    ) {
      return;
    }

    // already past it on load? leave it alone
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.classList.add('reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          window.setTimeout(() => el.setAttribute('data-in', 'true'), delay);
          io.unobserve(e.target);
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
