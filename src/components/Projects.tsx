import { projects, type Project } from '@/data/projects';
import ArchitectureFlow from './ArchitectureFlow';
import BrandMark from './BrandMark';
import Icon from './Icon';
import Reveal from './Reveal';
import ScreenshotGallery from './ScreenshotGallery';

function StatusBadge({ project }: { project: Project }) {
  const live = project.status === 'live';
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-2">
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${live ? 'bg-live' : 'bg-ink-3'}`}
        style={live ? { boxShadow: '0 0 0 3px color-mix(in oklab, var(--live) 22%, transparent)' } : undefined}
      />
      {live ? 'Verified live' : 'Source only'}
    </span>
  );
}

function Links({ project }: { project: Project }) {
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-6 py-3.5 text-[15.5px] font-bold text-on-accent shadow-[var(--btn-glow)]"
          >
            Open the live app
            <Icon name="arrow" className="h-4 w-4" />
          </a>
      ) : null}
        <a
          href={project.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-card px-6 py-3.5 text-[15.5px] font-bold text-ink shadow-[var(--shadow)]"
        >
          <Icon name="github" className="h-4 w-4" />
          {project.status === 'live' ? 'Source' : 'Read the source'}
        </a>
    </div>
  );
}

function TechList({ project }: { project: Project }) {
  return (
    <ul className="mt-7 flex flex-wrap gap-2">
      {project.technologies.map((t) => (
        <li
          key={t.name}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-3 py-1.5 text-[13.5px] font-medium text-ink-2"
        >
          <BrandMark slug={t.slug} className="h-[15px] w-[15px]" />
          {t.name}
        </li>
      ))}
    </ul>
  );
}

function Header({ project }: { project: Project }) {
  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11.5px] uppercase tracking-[0.14em] text-ink-3">
        <span className="text-accent">{String(project.order).padStart(2, '0')}</span>
        <span>{project.category}</span>
        {project.featured && (
          <span className="rounded-full border border-accent-line bg-accent-wash px-2.5 py-1 text-accent">
            Featured
          </span>
        )}
      </div>
      <h3 className="max-w-[20ch] font-display text-[clamp(26px,3.2vw,40px)] font-semibold leading-[1.06] tracking-tight text-ink">
        {project.title}
      </h3>
      <p className="mt-3 text-[17px] font-medium text-accent">{project.subtitle}</p>
    </>
  );
}

function Note({ project }: { project: Project }) {
  if (!project.note) return null;
  return (
    <p className="mt-5 max-w-[58ch] rounded-xl border border-line bg-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-ink-3">
      {project.note}
    </p>
  );
}

/** The featured project gets the full treatment: real screenshots, the whole
 *  problem/solution story, and every feature listed. */
function FeaturedBand({ project }: { project: Project }) {
  return (
    <article className="border-t border-line pt-16">
      <div className="grid gap-x-14 gap-y-12 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <Reveal>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Header project={project} />
              </div>
              <StatusBadge project={project} />
            </div>

            <p className="mt-6 max-w-[54ch] text-[18px] leading-[1.7] text-ink-2">
              {project.longDescription}
            </p>
            <TechList project={project} />
            <Links project={project} />
            <Note project={project} />
          </Reveal>
        </div>

        <Reveal delay={90}>
          <ScreenshotGallery shots={project.screenshots} />
        </Reveal>
      </div>

      <div className="mt-16 grid gap-x-14 gap-y-10 lg:grid-cols-[1fr_1.05fr]">
        <Reveal>
          <div className="space-y-7">
            <div>
              <p className="eyebrow mb-3">The problem</p>
              <p className="max-w-[54ch] text-[17px] leading-relaxed text-ink-2">
                {project.problem}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">The approach</p>
              <p className="max-w-[54ch] text-[17px] leading-relaxed text-ink-2">
                {project.solution}
              </p>
            </div>
            <div>
              <p className="eyebrow mb-3">What it does</p>
              <ul className="space-y-3.5">
                {project.features.map((f) => (
                  <li key={f} className="flex gap-3.5 text-[16px] leading-relaxed text-ink-2">
                    <span aria-hidden className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="lg:sticky lg:top-28">
            <ArchitectureFlow nodes={project.architecture} label="How a request flows" />
          </div>
        </Reveal>
      </div>
    </article>
  );
}

function StandardBand({ project, flip }: { project: Project; flip: boolean }) {
  return (
    <article className="border-t border-line pt-16">
      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-2">
        <div className={flip ? 'lg:order-2' : undefined}>
          <Reveal>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Header project={project} />
              </div>
              <StatusBadge project={project} />
            </div>

            <p className="mt-6 max-w-[54ch] text-[17.5px] leading-[1.7] text-ink-2">
              {project.longDescription}
            </p>

            <ul className="mt-7 space-y-3">
              {project.features.map((f) => (
                <li key={f} className="flex gap-3.5 text-[15.5px] leading-relaxed text-ink-2">
                  <span aria-hidden className="mt-[9px] h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <TechList project={project} />
            <Links project={project} />
            <Note project={project} />
          </Reveal>
        </div>

        {/* On phones the diagram is the heaviest block on the page and the tech
            chips above already carry the stack, so it is desktop-only here.
            The featured project keeps its diagram at every width. */}
        <Reveal delay={90} className={`hidden lg:block ${flip ? 'lg:order-1' : ''}`}>
          <div className="lg:sticky lg:top-28">
            <ArchitectureFlow nodes={project.architecture} label="How a request flows" />
          </div>
        </Reveal>
      </div>
    </article>
  );
}

export default function Projects() {
  const liveCount = projects.filter((p) => p.status === 'live').length;
  const ordered = [...projects].sort((a, b) => a.order - b.order);

  return (
    <section id="work" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <p className="eyebrow mb-5">Work</p>
        <h2 className="max-w-[20ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.04]">
          Don&rsquo;t just read about it. Open it.
        </h2>
        <p className="mt-5 max-w-[60ch] text-[18px] leading-relaxed text-ink-2">
          Four projects. {liveCount} are deployed and running right now — the buttons below open the
          real applications. The fourth has no deployment, so it offers its architecture and source
          instead of a demo that goes nowhere.
        </p>
      </Reveal>

      <div className="mt-20 space-y-20 md:space-y-28">
        {ordered.map((p, i) =>
          p.featured ? (
            <FeaturedBand key={p.id} project={p} />
          ) : (
            <StandardBand key={p.id} project={p} flip={i % 2 === 1} />
          ),
        )}
      </div>
    </section>
  );
}
