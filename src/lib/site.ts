export const site = {
  name: 'Maringanti Prabhas',
  shortName: 'Prabhas',
  role: 'Software Engineer',
  location: 'Hyderabad, Telangana',
  email: 'maringantiprabhas@gmail.com',
  github: 'https://github.com/PrabhasMaringanti-20',
  linkedin: 'https://www.linkedin.com/in/prabhasmaringanti/',
  resume: '/Prabhas_Maringanti_Resume.pdf',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  tagline: 'I build things that hold up.',
  summary:
    'Full-stack engineer working across backend systems and generative AI. The interesting ' +
    'part was never the demo — it is everything that has to be true before real people can rely on it.',
  friendly: 'Based in Hyderabad. Always up for a conversation about systems that misbehave.',
} as const;

/** Order here drives both the nav and the page: who I am → where I've worked
 *  → what I work with → what I've built → how to reach me. */
export const sections = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'stack', label: 'Stack' },
  { id: 'work', label: 'Work' },
  { id: 'contact', label: 'Contact' },
] as const;

export type SectionId = (typeof sections)[number]['id'];
