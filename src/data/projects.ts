/**
 * The single source of truth for every project URL on this site. Nothing here
 * is aspirational: `status: 'live'` means the deployment was opened and
 * verified, and a project without a deployment says so rather than shipping a
 * demo button that goes nowhere.
 */

export type ProjectStatus = 'live' | 'source';

export type Screenshot = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type FlowNode = {
  label: string;
  detail: string;
  /** simple-icons slug, where an official mark exists */
  slug?: string;
};

export type Project = {
  id: string;
  order: number;
  featured: boolean;
  title: string;
  subtitle: string;
  category: string;
  status: ProjectStatus;
  /** one line, used on the card */
  description: string;
  /** the fuller story */
  longDescription: string;
  problem: string;
  solution: string;
  features: string[];
  technologies: { name: string; slug?: string }[];
  /** the real request path through the system */
  architecture: FlowNode[];
  githubUrl: string;
  liveUrl?: string;
  screenshots: Screenshot[];
  /** why this deployment might be slow to wake, shown honestly in the UI */
  note?: string;
};

export const projects: Project[] = [
  {
    id: 'helpdesk',
    order: 1,
    featured: true,
    title: 'Enterprise Multi-Agent AI Helpdesk',
    subtitle: 'An IT helpdesk where the AI actually does the work',
    category: 'Multi-agent AI · RAG',
    status: 'live',
    description:
      'A 14-node LangGraph pipeline that retrieves from a knowledge base, verifies its own draft answer against those sources, then answers, digs deeper, or hands off to a human.',
    longDescription:
      'Most "AI chatbot" demos are one model call in a text box. This one is built around what actually makes an answer trustworthy: grounded retrieval, a separate verification pass, and a confidence gate that decides between answering, digging deeper, and handing off to a person.',
    problem:
      'The dangerous failure for a support bot is not a wrong answer. It is a confident wrong answer, with no way to check it.',
    solution:
      'Answers are assembled from retrieved passages, then checked against those same passages before anyone sees them. Low confidence escalates through L1 → L2 → L3 instead of guessing.',
    features: [
      'A 14-node LangGraph state machine runs every chat turn',
      'Hybrid retrieval — full-text and vector search fused by Reciprocal Rank Fusion',
      'A grounding verifier checks each answer against its sources before delivery',
      'Every human resolution becomes a new knowledge article, so the system improves itself',
    ],
    technologies: [
      { name: 'Python', slug: 'python' },
      { name: 'FastAPI' },
      { name: 'LangGraph', slug: 'langchain' },
      { name: 'React', slug: 'react' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'Docker', slug: 'docker' },
    ],
    architecture: [
      { label: 'React client', detail: 'A question in plain English', slug: 'react' },
      { label: 'FastAPI', detail: 'Authenticated, role-scoped endpoint' },
      { label: 'LangGraph', detail: '14-node agent graph', slug: 'langchain' },
      { label: 'Hybrid retrieval', detail: 'Full-text + vector, fused by RRF', slug: 'postgresql' },
      { label: 'Grounding gate', detail: 'Answer · search wider · escalate' },
    ],
    githubUrl: 'https://github.com/PrabhasMaringanti-20/multi-agent-ai-helpdesk',
    liveUrl: 'https://multi-agent-helpdesk.vercel.app',
    note: 'The API sleeps on a free tier — the first request can take up to a minute to wake it.',
    screenshots: [
      {
        src: '/projects/helpdesk-03-ai-chat.png',
        alt: 'The AI chat answering a VPN question with cited sources and an L1 self-service tier badge',
        width: 2880,
        height: 1900,
      },
      {
        src: '/projects/helpdesk-02-admin-dashboard.png',
        alt: 'Admin dashboard showing ticket volume and knowledge base health',
        width: 2880,
        height: 1900,
      },
      {
        src: '/projects/helpdesk-05-knowledge-base.png',
        alt: 'Knowledge base view listing articles generated from resolved tickets',
        width: 2880,
        height: 1900,
      },
      {
        src: '/projects/helpdesk-06-tickets.png',
        alt: 'Ticket queue with escalation tiers and assignment state',
        width: 2880,
        height: 1900,
      },
    ],
  },
  {
    id: 'vet-ai',
    order: 2,
    featured: false,
    title: 'VET-AI — Idea & Competitor Intelligence',
    subtitle: 'Stress-test a business idea against the live market',
    category: 'Generative AI · Web research',
    status: 'live',
    description:
      'Searches the web for the companies already doing what you propose, then grades the idea with Gemini under one of three analyst personas.',
    longDescription:
      'Rather than asking a model what it thinks, VET-AI finds evidence first: a live web search for real competitors, fed into a persona-shaped prompt and validated before it reaches the dashboard.',
    problem:
      'Asking a language model to judge a business idea with no evidence produces confident, agreeable fiction.',
    solution:
      'Ground the judgement in live search results, force a strict JSON schema, and validate the response against the evidence before rendering it.',
    features: [
      'Live competitor discovery through Tavily, falling back to DuckDuckGo',
      'Three analyst personas that materially change the verdict',
      'Forced JSON from Gemini, strictly validated before it renders',
    ],
    technologies: [
      { name: 'Python', slug: 'python' },
      { name: 'FastAPI' },
      { name: 'Gemini', slug: 'googlegemini' },
      { name: 'React', slug: 'react' },
      { name: 'Tavily' },
    ],
    architecture: [
      { label: 'React client', detail: 'The idea, plus budget and timeline', slug: 'react' },
      { label: 'FastAPI', detail: 'Validates and plans the analysis' },
      { label: 'Live web search', detail: 'Tavily, falling back to DuckDuckGo' },
      { label: 'Gemini', detail: 'Persona prompt, forced JSON', slug: 'googlegemini' },
      { label: 'Validation', detail: 'Checked against the evidence, then stored' },
    ],
    githubUrl: 'https://github.com/PrabhasMaringanti-20/ai-idea-validator',
    liveUrl: 'https://vet-ai-frontend-two.vercel.app',
    screenshots: [],
  },
  {
    id: 'mentor-hub',
    order: 3,
    featured: false,
    title: 'AI Mentor Hub',
    subtitle: 'A personalised e-learning platform',
    category: 'Generative AI · Education',
    status: 'live',
    description:
      'A full-stack learning platform with Gemini-powered tutoring and automatic quiz generation from course material.',
    longDescription:
      'Learners ask questions and get answers from Gemini in context, and quizzes are generated from the material rather than hand-authored. The initial release was validated by student users at NIT Warangal.',
    problem:
      'Static course content cannot tell whether a learner has actually understood something, or adapt when they have not.',
    solution:
      'Generate assessment from the material itself and answer questions in context, so the platform responds to the individual learner rather than serving everyone the same page.',
    features: [
      'Gemini-powered tutoring, answered in the context of the course material',
      'Automatic quiz generation from lesson content',
      'Firebase auth with role-based access control',
    ],
    technologies: [
      { name: 'Node.js' },
      { name: 'Express' },
      { name: 'Gemini', slug: 'googlegemini' },
      { name: 'JavaScript', slug: 'javascript' },
      { name: 'Firebase' },
    ],
    architecture: [
      { label: 'Browser client', detail: 'Course, chat and quiz views', slug: 'html5' },
      { label: 'Express server', detail: 'Session and content routes' },
      { label: 'Gemini', detail: 'Tutoring answers and quiz generation', slug: 'googlegemini' },
      { label: 'Firebase', detail: 'Auth, roles and progress state' },
    ],
    githubUrl: 'https://github.com/PrabhasMaringanti-20/ai-mentor-hub',
    liveUrl: 'https://ai-mentor-hub.onrender.com',
    screenshots: [],
  },
  {
    id: 'royalbank',
    order: 4,
    featured: false,
    title: 'RoyalBank — Onboarding & KYC Compliance',
    subtitle: 'Enterprise banking workflow in ASP.NET Core',
    category: 'Backend architecture · .NET',
    status: 'source',
    description:
      'A banking onboarding system with separated compliance, KYC and risk officer roles, built on a full Controller–Service–Repository stack.',
    longDescription:
      'The closest thing here to the enterprise work I do day to day. RoyalBank models onboarding the way a bank structures it: separate KYC, compliance and admin roles, tracked documents, risk profiles that decide routing, and an audit log behind it all.',
    problem:
      'Onboarding a bank customer is not a form submission — it is a multi-party approval workflow with separation of duties and an audit trail.',
    solution:
      'Model each officer role as its own controller and service boundary, keep persistence behind repository interfaces, and drive approvals through explicit risk scoring rather than implicit trust.',
    features: [
      'Separate controllers and services per officer role',
      'Risk profiling that classifies applications and routes them accordingly',
      'Repository interfaces over every data path, keeping controllers free of persistence detail',
      'EF Core code-first migrations against SQL Server',
    ],
    technologies: [
      { name: 'C#', slug: 'csharp' },
      { name: 'ASP.NET Core MVC', slug: 'dotnet' },
      { name: 'Entity Framework Core' },
      { name: 'SQL Server', slug: 'microsoftsqlserver' },
    ],
    architecture: [
      { label: 'Razor views', detail: 'Role-specific dashboards' },
      { label: 'Controllers', detail: 'One per officer role', slug: 'dotnet' },
      { label: 'Services', detail: 'Onboarding, KYC, risk, compliance' },
      { label: 'Repositories', detail: 'Every data path behind an interface' },
      { label: 'SQL Server', detail: 'EF Core code-first migrations', slug: 'microsoftsqlserver' },
    ],
    githubUrl: 'https://github.com/PrabhasMaringanti-20/Mvc_Project',
    note: 'No public deployment — .NET with SQL Server does not fit the free tiers the other three run on. The source and architecture are the deliverable here.',
    screenshots: [],
  },
];

export const featuredProject = projects.find((p) => p.featured)!;
