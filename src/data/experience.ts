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
      'Engineered core modules for an enterprise-level Banking Customer Onboarding and KYC Compliance system within a .NET Core ecosystem.',
      'Implemented business logic covering customer registration, digital document tracking, simulated risk-engine scoring (Low / Medium / High) and automated multi-step account approval workflows.',
      'Designed and normalised relational database schemas in SQL Server using an Entity Framework Core code-first approach, with data validation and strict transactional integrity.',
      'Developed structured, authenticated RESTful API endpoints on a clean Controller–Service–Repository multi-layer architecture.',
      'Managed codebase updates, versioning and continuous feature integration using Visual Studio and structured Git/GitHub branching strategies.',
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
      'Architected responsive AI-driven CRM platforms and intelligent Applicant Tracking System (ATS) dashboards using React.js and Tailwind CSS, integrated with live REST APIs.',
      'Built production-ready generative-AI automation pipelines for context-aware email drafting, resume parsing and scheduling optimisation, using the OpenAI API and LangChain orchestration.',
      'Executed data preprocessing workflows and structured prompt engineering to improve model response accuracy, cutting manual HR pipeline processing effort by over 30%.',
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
