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
      'Most "AI chatbot" demos are a single model call wrapped in a text box. This one is built around the machinery that makes an answer trustworthy: grounded retrieval with citations, a separate verification pass, and an explicit confidence gate that decides between answering, searching wider, and escalating to a person. When a human resolves a ticket, the system drafts a new knowledge article from that fix, so the next person gets an instant answer.',
    problem:
      'The dangerous failure mode for a support bot is not a wrong answer — it is a confident wrong answer, delivered with no way for anyone to check it.',
    solution:
      'Every answer is assembled from retrieved passages and then checked against those same passages before the user sees it. If the check fails or confidence is low, the request escalates through L1 → L2 → L3 instead of guessing.',
    features: [
      'A LangGraph state machine of 14 nodes runs every chat turn, from ingress guard through to memory persistence',
      'Hybrid retrieval: PostgreSQL full-text search and vector similarity, merged with Reciprocal Rank Fusion, then reranked',
      'A grounding verifier checks the drafted answer is actually supported by its sources before delivery',
      'A confidence gate routes between answering (L1), searching the whole knowledge base (L2), and creating a ticket with human handoff (L3)',
      'Every human resolution is turned into a reviewed knowledge article, so the knowledge base improves itself',
      'Role-based access control, persistent conversation memory, and a Dockerised deployment',
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
      'Rather than asking a model what it thinks of an idea, VET-AI goes and finds evidence first. It runs a live web search for real competitors, feeds that evidence into a persona-shaped prompt, forces structured JSON out of Gemini, validates it strictly, and renders the verdict as a dashboard — success probability, market saturation, capital required, and the flaws that are hard to see from inside your own idea.',
    problem:
      'Asking a language model to judge a business idea with no evidence produces confident, agreeable fiction.',
    solution:
      'Ground the judgement in live search results, force a strict JSON schema, and validate the response against the evidence before rendering it.',
    features: [
      'Live competitor discovery through Tavily with a DuckDuckGo fallback',
      'Three analyst personas — supportive, investor, and sceptical short-seller — that materially change the verdict',
      'Forced structured JSON output from Gemini, strictly validated before it reaches the UI',
      'A competitor grid with live website previews and recent news',
      'Runs without an API key in a clearly-labelled sample mode, so the app never pretends to have data it does not',
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
      'An educational prototype built around adaptive testing and course recommendation. Learners ask questions and get answers from Gemini in context, and quizzes are generated from the material rather than hand-authored. The initial release was validated by student users at NIT Warangal, and the architecture was later refactored locally for modular scalability.',
    problem:
      'Static course content cannot tell whether a learner has actually understood something, or adapt when they have not.',
    solution:
      'Generate assessment from the material itself and answer questions in context, so the platform responds to the individual learner rather than serving everyone the same page.',
    features: [
      'Gemini-powered tutoring that answers questions in the context of the course material',
      'Automatic quiz generation from lesson content',
      'Course recommendation and real-time progress tracking',
      'Firebase authentication with role-based access control',
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
      'The closest thing here to the enterprise work I do day to day. RoyalBank models customer onboarding the way a bank actually structures it: distinct roles for KYC officers, compliance officers and administrators, documents that must be tracked and verified, risk profiles that decide routing, and an audit log behind it all. It runs against SQL Server through Entity Framework Core migrations.',
    problem:
      'Onboarding a bank customer is not a form submission — it is a multi-party approval workflow with separation of duties and an audit trail.',
    solution:
      'Model each officer role as its own controller and service boundary, keep persistence behind repository interfaces, and drive approvals through explicit risk scoring rather than implicit trust.',
    features: [
      'Separate controllers and services for customer, KYC officer, compliance officer and admin roles',
      'Document tracking with verification state per customer',
      'Risk profiling that classifies applications and routes them accordingly',
      'Entity Framework Core code-first migrations against SQL Server',
      'Repository interfaces over every data path, keeping controllers free of persistence detail',
      'An audit log covering the actions that change an application’s state',
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
