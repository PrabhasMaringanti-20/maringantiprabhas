'use client';

import { useEffect, useRef } from 'react';

/**
 * The whole pointer system in one place, driven by a single rAF loop:
 *  - a dot that tracks the cursor exactly, and a ring that trails behind it
 *  - a soft accent bloom that eases toward the pointer down the page
 *  - `--mx` / `--my` on <html>, normalised to roughly -0.5..0.5, which any
 *    component can use for parallax without subscribing to React state
 *
 * Everything here is skipped on coarse pointers and under reduced motion.
 */
export default function PointerLayer() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const bloom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reduced.matches) return;

    const d = dot.current;
    const r = ring.current;
    const b = bloom.current;
    if (!d || !r || !b) return;

    const root = document.documentElement;
    document.body.classList.add('has-cursor');

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let bx = mx;
    let by = my;
    let visible = false;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (!visible) {
        visible = true;
        d.style.opacity = '1';
        r.style.opacity = '1';
      }
    };

    const onLeave = () => {
      visible = false;
      d.style.opacity = '0';
      r.style.opacity = '0';
    };

    const interactive = '[data-cursor], a, button, input, textarea, select, summary';
    const onOver = (e: Event) => {
      if ((e.target as Element).closest?.(interactive)) r.dataset.wide = 'true';
    };
    const onOut = (e: Event) => {
      if ((e.target as Element).closest?.(interactive)) delete r.dataset.wide;
    };

    const tick = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      bx += (mx - bx) * 0.045;
      by += (my - by) * 0.045;

      d.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
      r.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
      b.style.transform = `translate3d(${bx}px, ${by}px, 0)`;

      root.style.setProperty('--mx', String(mx / window.innerWidth - 0.5));
      root.style.setProperty('--my', String(my / window.innerHeight - 0.5));

      frame = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseover', onOver, true);
    document.addEventListener('mouseout', onOut, true);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseover', onOver, true);
      document.removeEventListener('mouseout', onOut, true);
      document.body.classList.remove('has-cursor');
    };
  }, []);

  return (
    <>
      {/* ambient light: three fixed blooms plus one that follows the pointer */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -left-36 -top-48 h-[620px] w-[620px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-1), transparent 68%)',
          }}
        />
        <div
          className="absolute -right-48 top-[38%] h-[560px] w-[560px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-2), transparent 68%)',
          }}
        />
        <div
          className="absolute -bottom-44 left-[22%] h-[520px] w-[520px] rounded-full blur-[70px]"
          style={{
            opacity: 'var(--blob-opacity)',
            background: 'radial-gradient(circle, var(--glow-3), transparent 68%)',
          }}
        />
        <div
          ref={bloom}
          className="absolute left-0 top-0 -ml-[230px] -mt-[230px] h-[460px] w-[460px] rounded-full blur-[80px] will-change-transform"
          style={{ background: 'radial-gradient(circle, var(--glow-track), transparent 66%)' }}
        />
      </div>

      {/* dot grid, faded out toward the edges */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, var(--dot-grid) 1px, transparent 0)',
          backgroundSize: '26px 26px',
          WebkitMaskImage:
            'radial-gradient(ellipse 92% 62% at 50% 32%, #000 32%, transparent 78%)',
          maskImage: 'radial-gradient(ellipse 92% 62% at 50% 32%, #000 32%, transparent 78%)',
        }}
      />

      {/* cursor */}
      <div
        ref={ring}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] rounded-full opacity-0"
        data-ring
      />
      <div
        ref={dot}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[90] h-1.5 w-1.5 rounded-full opacity-0"
        style={{ background: 'var(--accent)' }}
      />
    </>
  );
}
