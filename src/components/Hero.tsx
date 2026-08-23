import { site } from '@/lib/site';
import Constellation from './Constellation';
import EmailAction from './EmailAction';
import Icon from './Icon';
import Magnetic from './Magnetic';

const ease = 'cubic-bezier(.2,.8,.2,1)';
const enter = (delay: string) => `fade-up .7s ${ease} ${delay} both`;

export default function Hero() {
  return (
    <section
      id="top"
      className="relative mx-auto flex min-h-[92svh] max-w-6xl flex-col justify-center px-6 pb-24 pt-32"
    >
      <Constellation />

      <div className="relative z-10 xl:max-w-[56%]">
        <p
          className="eyebrow mb-5 inline-flex items-center gap-2.5 rounded-full border border-accent-line bg-accent-wash px-4 py-2"
          style={{ animation: enter('0s') }}
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
          {site.role}
        </p>

        <h1
          className="max-w-[12ch] text-[clamp(46px,7.4vw,92px)] font-bold leading-[0.94] tracking-[-0.035em]"
          style={{ animation: enter('.08s') }}
        >
          I build things that{' '}
          <span className="gradient-text">hold&nbsp;up.</span>
        </h1>

        <p
          className="mt-6 max-w-[46ch] text-[19.5px] leading-relaxed text-ink-2"
          style={{ animation: enter('.16s') }}
        >
          {site.summary}
        </p>

        <p
          className="mt-4 max-w-[46ch] text-[16px] italic text-ink-3"
          style={{ animation: enter('.22s') }}
        >
          {site.friendly}
        </p>

        <div
          className="mt-8 flex flex-wrap items-center gap-3"
          style={{ animation: enter('.3s') }}
        >
          <Magnetic>
            <a
              href="#work"
              data-cursor
              className="inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-4 text-[16px] font-bold text-on-accent shadow-[var(--btn-glow)]"
            >
              Explore my work
              <Icon name="arrow" className="h-4 w-4" />
            </a>
          </Magnetic>

          <Magnetic>
            <a
              href={site.resume}
              download
              data-cursor
              className="inline-flex items-center gap-2.5 rounded-full border border-line-2 bg-card px-7 py-4 text-[16px] font-bold text-ink shadow-[var(--shadow)]"
            >
              <Icon name="download" className="h-4 w-4" />
              Download resume
            </a>
          </Magnetic>

          <EmailAction variant="quiet" label="Email" />

          <a
            href={site.github}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-2 px-2.5 py-4 text-[15.5px] font-medium text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="github" className="h-4 w-4" />
            GitHub
          </a>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor
            className="inline-flex items-center gap-2 px-2.5 py-4 text-[15.5px] font-medium text-ink-2 transition-colors hover:text-ink"
          >
            <Icon name="linkedin" className="h-4 w-4" />
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}
