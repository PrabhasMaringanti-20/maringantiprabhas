import { site } from '@/lib/site';
import Icon from './Icon';

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-display text-[17px] font-bold tracking-tight text-ink">
            {site.name}
            <span className="text-accent">.</span>
          </p>
          <p className="mt-1 text-[14.5px] text-ink-2">{site.role}</p>
        </div>

        <nav aria-label="Elsewhere" className="flex items-center gap-2">
          <a
            href={`mailto:${site.email}`}
            aria-label="Email"
            title="Email"
            data-cursor
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="mail" className="h-[17px] w-[17px]" />
          </a>
          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            title="GitHub"
            data-cursor
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="github" className="h-[17px] w-[17px]" />
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            title="LinkedIn"
            data-cursor
            className="grid h-10 w-10 place-items-center rounded-full border border-line-2 bg-card text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="linkedin" className="h-[17px] w-[17px]" />
          </a>
        </nav>

        <p className="font-mono text-[11.5px] text-ink-3">
          &copy; {new Date().getFullYear()} {site.name}
        </p>
      </div>
    </footer>
  );
}
