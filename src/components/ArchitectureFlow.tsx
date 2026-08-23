import type { FlowNode } from '@/data/projects';
import BrandMark from './BrandMark';

/**
 * The real request path through a project, drawn from its repository rather
 * than invented. A single pulse travels the connector so the diagram reads as
 * a flow; it stops entirely under reduced motion.
 */
export default function ArchitectureFlow({
  nodes,
  label,
}: {
  nodes: FlowNode[];
  label: string;
}) {
  return (
    <figure className="rounded-2xl border border-line bg-card p-6 shadow-[var(--shadow)] sm:p-8">
      <figcaption className="eyebrow mb-6">{label}</figcaption>

      <ol className="relative space-y-5">
        {/* connector + travelling pulse */}
        <span aria-hidden className="absolute bottom-5 left-[19px] top-5 w-px bg-line">
          <span className="flow-pulse absolute left-1/2 h-10 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent to-transparent" />
        </span>

        {nodes.map((n) => (
          <li key={n.label} className="relative flex items-start gap-4">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-line bg-bg">
              {n.slug ? (
                <BrandMark slug={n.slug} className="h-[18px] w-[18px]" />
              ) : (
                <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
              )}
            </span>
            <span className="min-w-0 pt-1">
              <span className="block text-[15.5px] font-bold leading-tight text-ink">
                {n.label}
              </span>
              <span className="mt-1 block text-[14.5px] leading-snug text-ink-2">{n.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}
