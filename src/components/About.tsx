import Reveal from './Reveal';

const IDENTITY = [
  { k: 'I build', v: 'Enterprise banking and KYC compliance systems' },
  { k: 'I work with', v: 'Full-stack, backend and generative AI' },
  { k: 'I ship', v: 'Real deployed software you can open right now' },
];

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-28 md:py-36">
      <Reveal>
        <p className="eyebrow mb-5">About</p>
        <h2 className="max-w-[18ch] text-[clamp(30px,4.4vw,56px)] font-semibold leading-[1.04]">
          I build systems that check their own answers.
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-x-16 gap-y-10 lg:grid-cols-[1.15fr_1fr]">
        <Reveal delay={80}>
          <div className="space-y-6 text-[18px] leading-[1.72] text-ink-2">
            <p>
              I&rsquo;m a software engineer working across the full stack, with the centre of gravity
              in backend systems and generative AI. At{' '}
              <strong className="font-bold text-ink">Cognizant</strong> I&rsquo;m building the
              onboarding and KYC compliance core of an enterprise banking platform — registration,
              document tracking, risk scoring and multi-step approvals — on a clean
              Controller–Service–Repository architecture in .NET Core.
            </p>
            <p>
              Before that, at <strong className="font-bold text-ink">Revive Tek</strong>, I built
              AI-driven CRM and applicant-tracking interfaces in React, and the generative pipelines
              sitting behind them: context-aware email drafting, resume parsing and scheduling
              optimisation with the OpenAI API and LangChain.
            </p>
            <p>
              What holds my attention is the part most demos skip — making a system that can tell
              when it&rsquo;s wrong. Retrieval that cites its sources. A confidence gate that
              escalates instead of guessing. A risk engine that routes an application to a person
              rather than approving it on trust. That thread runs through everything below.
            </p>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-card shadow-[var(--shadow)]">
            {IDENTITY.map((item) => (
              <li key={item.k} className="px-7 py-7">
                <p className="eyebrow mb-2.5">{item.k}</p>
                <p className="text-[20.5px] font-bold leading-snug text-ink">{item.v}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
