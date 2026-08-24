/** Straight from the resume. Nothing here is embellished. */

export type Tech = { name: string; slug?: string };

export type Role = {
  id: string;
  title: string;
  company: string;
  start: string;
  end: string;
  period: string;
  location: string;
  /** One line of context before the detail opens. */
  summary: string;
  points: string[];
  tech: Tech[];
};

export const roles: Role[] = [
  {
    id: 'cognizant',
    title: 'Programmer Analyst Trainee',
    company: 'Cognizant Technology Solutions',
    start: 'Jan 2026',
    end: 'Present',
    period: 'Jan 2026 — Present',
    location: 'Chennai, India',
    summary:
      'Building the onboarding and compliance core of an enterprise banking platform in .NET.',
    points: [
      'Engineered core modules of an enterprise Banking Customer Onboarding and KYC Compliance system in .NET Core.',
      'Built the business logic for registration, document tracking, risk-engine scoring and multi-step account approval.',
      'Designed normalised SQL Server schemas with Entity Framework Core code-first, keeping transactional integrity strict.',
      'Developed authenticated REST endpoints on a clean Controller–Service–Repository architecture.',
    ],
    tech: [
      { name: '.NET Core', slug: 'dotnet' },
      { name: 'C#', slug: 'csharp' },
      { name: 'Entity Framework Core' },
      { name: 'SQL Server', slug: 'microsoftsqlserver' },
      { name: 'RESTful APIs' },
      { name: 'Git', slug: 'git' },
    ],
  },
  {
    id: 'revive-tek',
    title: 'AI & Frontend Development Intern',
    company: 'Revive Tek Solutions',
    start: 'Apr 2025',
    end: 'Jan 2026',
    period: 'Apr 2025 — Jan 2026',
    location: 'Hyderabad, India',
    summary:
      'Shipped AI-driven CRM and recruitment interfaces, and the generative pipelines behind them.',
    points: [
      'Architected AI-driven CRM platforms and ATS dashboards in React and Tailwind, wired to live REST APIs.',
      'Built generative-AI pipelines for email drafting, resume parsing and scheduling, using the OpenAI API and LangChain.',
      'Improved model accuracy through data preprocessing and prompt engineering, cutting manual HR effort by over 30%.',
    ],
    tech: [
      { name: 'React.js', slug: 'react' },
      { name: 'Tailwind CSS', slug: 'tailwindcss' },
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'OpenAI API', slug: 'openai' },
      { name: 'LangChain', slug: 'langchain' },
      { name: 'Python', slug: 'python' },
    ],
  },
];
