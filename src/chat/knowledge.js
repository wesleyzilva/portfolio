import {
  tabs,
  projectCards,
  skillGroups,
  chronologyEntries,
  lastTwoYearsFocus,
  recruiterQuickRead,
  workModel,
} from '../data/cvData.js';

const profileChunks = [
  {
    id: 'profile-summary',
    type: 'profile',
    title: 'Professional summary',
    section: 'about',
    lead: 'Wesley is a Global Agile Delivery Manager and Tech Product Owner with 15 years leading distributed teams across LATAM, the US and Europe.',
    bullets: [...recruiterQuickRead],
    keywords: 'summary overview who about background experience years seniority profile intro introduce wesley',
  },
  {
    id: 'profile-contact',
    type: 'profile',
    title: 'Contact channels',
    section: 'contact',
    lead: 'You can reach Wesley directly and he replies within 24h.',
    bullets: [
      'Email: wesley.zilva@gmail.com',
      'LinkedIn: linkedin.com/in/wesleyzilva',
      'GitHub: github.com/wesleyzilva',
      'WhatsApp and phone are available from the Contact section.',
    ],
    keywords: 'contact reach email phone whatsapp linkedin github interview schedule call talk hire hiring respond response',
  },
  {
    id: 'profile-availability',
    type: 'profile',
    title: 'Availability and work model',
    section: 'about',
    lead: 'Wesley is open to nearshore, offshore and international roles, working from Brazil.',
    bullets: [...workModel, 'Timezone overlap compatible with Brazil (±4h).'],
    keywords: 'availability available open remote timezone nearshore offshore international contract full-time hire start notice location brazil relocation overlap',
  },
  {
    id: 'profile-cv',
    type: 'profile',
    title: 'CV downloads',
    section: 'contact',
    lead: 'The CV is available for download in 6 languages from the Contact section.',
    bullets: ['Portuguese, English, French, Arabic, Hindi and Chinese.'],
    keywords: 'cv resume curriculum download pdf language languages english portuguese french arabic hindi chinese',
  },
  {
    id: 'profile-ai',
    type: 'profile',
    title: 'AI agents and MCP connections',
    section: 'about',
    lead: 'Wesley applies AI agents and MCP connections to bring business context into delivery work.',
    bullets: [
      'Currently runs distributed teams with an AI-powered squad framework and async-first delivery.',
      'Designed an AI-powered search and triage workflow for LegalTech that cut legal operation SLA by 12%.',
    ],
    keywords: 'ai artificial intelligence agents agentic mcp llm rag automation genai copilot machine learning',
  },
];

const impactChunk = {
  id: 'profile-impact',
  type: 'profile',
  title: 'Measurable impact highlights',
  section: 'portfolio',
  lead: 'Wesley backs his delivery work with measured numbers. These are the headline results from his projects.',
  bullets: projectCards.flatMap((project) => project.results
    .filter((result) => /\d/.test(result))
    .map((result) => `${result.replace(/\.$/, '')} (${project.category})`)),
  maxBullets: 6,
  keywords: 'impact result results measurable metrics numbers achievement achievements highlight highlights kpi outcome outcomes biggest proud best',
};

const qualityChunk = {
  id: 'profile-quality',
  type: 'profile',
  title: 'Quality and release guardrails',
  section: 'last-two-years',
  lead: 'Wesley builds quality into delivery through automated gates, policy checks and continuous improvement.',
  bullets: [
    'Automated security gates and policy checks embedded in every release (Veracode, Rapid7, Checkmarx, CI/CD).',
    'Risk-based prioritization with EPSS-scored dashboards, so effort goes where quality risk is highest.',
    'Continuous improvement cycles with Lean Six Sigma (DMAIC) and knowledge standardization.',
    'Observability and alerting with Datadog and Dynatrace to catch issues before users do.',
  ],
  keywords: 'quality guardrails gates release assurance compliance continuous improvement reliability',
};

const projectChunks = projectCards.map((project) => ({
  id: `project-${project.id}`,
  type: 'project',
  title: project.title,
  section: 'portfolio',
  lead: project.summary,
  bullets: [
    `Context: ${project.context}`,
    `Role: ${project.role}`,
    ...project.actions.map((item) => `Action: ${item}`),
    ...project.results.map((item) => `Result: ${item}`),
  ],
  facts: `${project.duration} · ${project.status} · ${project.location.join(', ')}`,
  keywords: [project.category, ...project.tags, ...project.references, ...project.location].join(' '),
}));

const skillChunks = skillGroups.map((group) => ({
  id: `skills-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  type: 'skills',
  title: group.title,
  section: 'skills',
  lead: group.description,
  bullets: [`Tools: ${group.items.join(', ')}`],
  keywords: group.items.join(' '),
}));

const careerChunks = chronologyEntries.map((entry) => ({
  id: `career-${entry.year}-${entry.title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  type: 'career',
  title: `${entry.title} (${entry.year})`,
  section: 'about',
  lead: entry.text,
  bullets: [`Company: ${entry.company}`, `Period: ${entry.year}`],
  keywords: `career job role position employer work history ${entry.company}`,
}));

const focusChunks = lastTwoYearsFocus.map((focus) => ({
  id: `focus-${focus.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
  type: 'focus',
  title: `Last 2 years: ${focus.title}`,
  section: 'last-two-years',
  lead: focus.summary,
  bullets: focus.highlights,
  keywords: `recent latest current serasa m&a acquisition payments pix ${focus.title}`,
}));

const recentChunk = {
  id: 'recent-journey',
  type: 'focus',
  title: 'Last 2 years: M&A and payments',
  section: 'last-two-years',
  lead: tabs.find((tab) => tab.id === 'last-two-years').summary,
  bullets: tabs.find((tab) => tab.id === 'last-two-years').points,
  keywords: 'recent latest current serasa acquired acquisition m&a payments gateway utilities pix nubank bacen regulated fintech',
};

export const knowledgeBase = [
  ...profileChunks,
  impactChunk,
  qualityChunk,
  recentChunk,
  ...focusChunks,
  ...careerChunks,
  ...projectChunks,
  ...skillChunks,
];

export const canonicalNames = Object.fromEntries(
  skillGroups
    .flatMap((group) => group.items)
    .flatMap((item) => item.split('/'))
    .map((item) => item.trim())
    .filter((item) => item && !item.includes(' '))
    .map((item) => [item.toLowerCase(), item]),
);

export const suggestedQuestions = [
  'Does he know QA and AWS projects?',
  'What was his biggest measurable impact?',
  'Has he led distributed or global teams?',
  'What AI projects has he delivered?',
  'Is he available for nearshore roles?',
];
