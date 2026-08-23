'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * Leans its child toward the pointer while the pointer is over it, then springs
 * back on leave. Disabled on coarse pointers and under reduced motion, where it
 * renders as a plain wrapper.
 */
export default function Magnetic({
  children,
  strength = 0.22,
  className = '',
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      !window.matchMedia('(pointer: fine)').matches ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .1s ease-out';
      el.style.transform = `translate(${dx * strength}px, ${dy * strength * 1.3}px)`;
    };

    const onLeave = () => {
      el.style.transition = 'transform .45s cubic-bezier(.2,1.3,.4,1)';
      el.style.transform = 'translate(0, 0)';
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return (
    <span ref={ref} className={`inline-block will-change-transform ${className}`}>
      {children}
    </span>
  );
}
