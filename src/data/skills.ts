/** Exactly the skills listed on the resume, grouped as the resume groups them.
 *  No proficiency scores — a number neither of us could defend is worse than
 *  no number at all. `slug` maps to an official brand mark; omit it where no
 *  official logo exists and the tile falls back to a monogram. */

export type Skill = { name: string; slug?: string; mono?: string };

export type SkillGroup = {
  id: string;
  label: string;
  blurb: string;
  skills: Skill[];
};

export const skillGroups: SkillGroup[] = [
  {
    id: 'ai',
    label: 'AI & GenAI',
    blurb: 'Shipped in production across the helpdesk, VET-AI and Mentor Hub.',
    skills: [
      { name: 'Python', slug: 'python' },
      { name: 'OpenAI API', slug: 'openai' },
      { name: 'LangChain', slug: 'langchain' },
      { name: 'Gemini AI', slug: 'googlegemini' },
      { name: 'Hugging Face', slug: 'huggingface' },
      { name: 'Prompt Engineering', mono: 'PE' },
    ],
  },
  {
    id: 'backend',
    label: 'Backend',
    blurb: 'The Cognizant stack — and the stack behind RoyalBank.',
    skills: [
      { name: 'C#', slug: 'csharp' },
      { name: 'ASP.NET Core MVC', slug: 'dotnet' },
      { name: 'Entity Framework Core', mono: 'EF' },
      { name: 'ADO.NET', mono: 'AD' },
      { name: 'RESTful APIs', mono: 'API' },
    ],
  },
  {
    id: 'frontend',
    label: 'Frontend',
    blurb: 'Every deployed front end in my work is React and Tailwind.',
    skills: [
      { name: 'React.js', slug: 'react' },
      { name: 'JavaScript ES6+', slug: 'javascript' },
      { name: 'HTML5', slug: 'html5' },
      { name: 'CSS3', slug: 'css' },
      { name: 'Tailwind CSS', slug: 'tailwindcss' },
      { name: 'Bootstrap', slug: 'bootstrap' },
      { name: 'Figma', slug: 'figma' },
    ],
  },
  {
    id: 'data',
    label: 'Databases & Tools',
    blurb: 'PostgreSQL backs the helpdesk; SQL Server backs the banking work.',
    skills: [
      { name: 'SQL Server', slug: 'microsoftsqlserver' },
      { name: 'PostgreSQL', slug: 'postgresql' },
      { name: 'MySQL', slug: 'mysql' },
      { name: 'Git', slug: 'git' },
      { name: 'Docker', slug: 'docker' },
      { name: 'Postman', slug: 'postman' },
    ],
  },
];
