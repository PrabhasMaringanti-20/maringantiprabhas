import { BRAND } from '@/lib/brand';

/**
 * A technology's official mark, in its own brand colour. Falls back to a plain
 * dot when no official logo exists — we never invent one.
 */
export default function BrandMark({
  slug,
  className = 'h-4 w-4',
}: {
  slug?: string;
  className?: string;
}) {
  const icon = slug ? BRAND[slug] : undefined;

  if (!icon) {
    return (
      <span
        aria-hidden
        className={`${className} inline-block rounded-full border border-line-2`}
      />
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d={icon.path} fill={icon.color} />
    </svg>
  );
}
