import Link from 'next/link';
import { site } from '@/lib/site';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-6">
      <p className="eyebrow mb-5">404</p>
      <h1 className="max-w-[16ch] text-[clamp(38px,6vw,72px)] font-bold leading-[0.98] tracking-[-0.035em]">
        That page doesn&rsquo;t exist.
      </h1>
      <p className="mt-6 max-w-[46ch] text-[18px] leading-relaxed text-ink-2">
        Everything on this site lives on one page — you probably want the top of it.
      </p>
      <div className="mt-9 flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-4 text-[16px] font-bold text-on-accent shadow-[var(--btn-glow)]"
        >
          Back to the start
        </Link>
        <a
          href={`mailto:${site.email}`}
          className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-card px-7 py-4 text-[16px] font-bold text-ink shadow-[var(--shadow)]"
        >
          Email me
        </a>
      </div>
    </main>
  );
}
