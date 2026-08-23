import { UI, type UIIcon } from '@/lib/ui-icons';

export default function Icon({
  name,
  className = 'h-4 w-4',
}: {
  name: UIIcon;
  className?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="currentColor">
      <path d={UI[name]} />
    </svg>
  );
}
