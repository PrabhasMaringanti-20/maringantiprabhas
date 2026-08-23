/** Real dates and real facts only — nothing invented to fill the line. */

export type Milestone = {
  when: string;
  title: string;
  detail: string;
  current?: boolean;
};

export const milestones: Milestone[] = [
  {
    when: '2021 – 2025',
    title: 'B.Tech, Computer Science',
    detail: 'Vaagdevi College of Engineering under JNTU, graduating with a CGPA of 8.00.',
  },
  {
    when: 'Apr 2025',
    title: 'AI & frontend engineering',
    detail: 'Joined Revive Tek Solutions, building AI-driven CRM and ATS interfaces.',
  },
  {
    when: 'Jan 2026',
    title: 'Enterprise software engineering',
    detail: 'Joined Cognizant as a Programmer Analyst Trainee, on banking onboarding and KYC.',
  },
  {
    when: 'Now',
    title: 'Building and shipping',
    detail: 'Three deployed applications you can open from this page.',
    current: true,
  },
];

export type Credential = {
  kind: string;
  title: string;
  issuer: string;
  meta?: string;
};

export const credentials: Credential[] = [
  {
    kind: 'Education',
    title: 'B.Tech, Computer Science and Engineering',
    issuer: 'Vaagdevi College of Engineering (JNTU)',
    meta: '2021 – 2025 · CGPA 8.00',
  },
  {
    kind: 'Award',
    title: 'Best Project Award',
    issuer: 'Siemens Centre of Excellence, NIT Warangal',
  },
  {
    kind: 'Certification',
    title: 'AI for Everyone',
    issuer: 'Coursera — authorised by DeepLearning.AI',
    meta: 'Andrew Ng',
  },
  {
    kind: 'Leadership',
    title: 'IEEE Design Chair',
    issuer: 'VCE Student Branch',
    meta: 'Managing design',
  },
];
