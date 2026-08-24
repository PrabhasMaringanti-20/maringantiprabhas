import { site } from '@/lib/site';
import EmailAction from './EmailAction';
import Icon from './Icon';
import type { UIIcon } from '@/lib/ui-icons';
import Reveal from './Reveal';

const DESTINATIONS: { icon: UIIcon; label: string; value: string; href: string; external?: boolean; download?: boolean }[] = [
  {
    icon: 'mail',
    label: 'Email',
    value: site.email,
    href: `mailto:${site.email}`,
  },
  {
    icon: 'github',
    label: 'GitHub',
    value: 'PrabhasMaringanti-20',
    href: site.github,
    external: true,
  },
  {
    icon: 'linkedin',
    label: 'LinkedIn',
    value: 'prabhasmaringanti',
    href: site.linkedin,
    external: true,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-accent-line px-7 py-14 shadow-[var(--shadow-lg)] sm:px-12 md:px-16 md:py-20"
          style={{
            background:
              'linear-gradient(135deg, var(--accent-soft), var(--card) 42%, var(--card) 68%, color-mix(in oklab, var(--aqua) 10%, var(--card)))',
          }}>
          <p className="eyebrow mb-6">Contact</p>

          <h2 className="max-w-[16ch] text-[clamp(32px,5vw,64px)] font-semibold leading-[1.02]">
            Let&rsquo;s build something that ships.
          </h2>

          <p className="mt-7 max-w-[50ch] text-[18.5px] leading-relaxed text-ink-2">
            If you&rsquo;ve read this far, you may as well say hello. There&rsquo;s no contact form
            here — that&rsquo;s my actual inbox, and I do read it.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <EmailAction variant="primary" label="Email me" />
          </div>

          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map((d) => (
              <li key={d.label}>
                <a
                  href={d.href}
                  {...(d.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  {...(d.download ? { download: true } : {})}
                  className="contact-card flex items-center gap-4 rounded-2xl border border-line bg-bg px-5 py-4"
                >
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl border border-line bg-card text-accent">
                    <Icon name={d.icon} className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-bold text-ink">{d.label}</span>
                    <span className="block truncate font-mono text-[11.5px] text-ink-3">
                      {d.value}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-9 font-mono text-[12px] text-ink-3">
            Based in {site.location}. Every link on this page is real — click one and check.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
