import {
  tabs,
  projectCards,
  skillGroups,
  chronologyEntries,
  certifications,
  atsCvDownloads,
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
    lead: 'Wesley is an Agentic Project Manager (PSM III) and Product Delivery Lead with 14+ years managing global engineering squads across LATAM, the US, the UK, South Africa and India.',
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
    title: 'Updated CV (ATS format)',
    section: 'contact',
    lead: "Wesley's latest CV is available in an ATS-friendly format, ready to import into any recruiting platform.",
    bullets: [
      ...atsCvDownloads.map((cv) => `${cv.label}: ${cv.description}`),
      'The classic CV is also available in Portuguese, English, French, Arabic, Hindi and Chinese from the Contact section.',
    ],
    keywords: 'cv resume curriculum download pdf ats updated latest language languages english portuguese french arabic hindi chinese',
  },
  {
    id: 'profile-current-role',
    type: 'profile',
    title: 'Current role',
    section: 'about',
    lead: 'Wesley is currently an Agentic Product Owner (Data Centric) at Serasa Experian, since August 2026.',
    bullets: [
      'Orchestrates technical product discovery for B2B payment flows with agentic workflows (MCP, Databricks, Amplitude, Datadog).',
      'Accelerates engineering and product definition with GenAI tools: Claude, ChatGPT, Cursor and GitHub Copilot.',
      'Previously IT Coordinator and Agentic Tech Project Manager (Nov 2024 to Aug 2026).',
    ],
    keywords: 'current present role job title position currently working employer serasa agentic product owner data centric',
  },
  {
    id: 'profile-certifications',
    type: 'profile',
    title: 'Certifications',
    section: 'about',
    lead: 'Wesley holds Scrum, Lean Six Sigma, Angular, JavaScript and Datadog certifications.',
    bullets: certifications,
    maxBullets: 6,
    keywords: 'certification certifications certified certificate credential psm scrum master professional lean six sigma yellow belt angular javascript datadog training',
  },
  {
    id: 'brand-latam-aigile',
    type: 'profile',
    title: 'LatAm.AIgile brand',
    section: 'about',
    showMatch: false,
    lead: 'LatAm.AIgile is the brand Wesley is building to deliver projects with AI agents while keeping people at the center, making work easier for the people who use it.',
    bullets: [
      'Agent-powered project delivery with a people-first focus.',
      'Combines AI and Agile delivery discipline with LATAM nearshore collaboration.',
      'Fits his current work with agentic workflows and MCP connections for business context.',
    ],
    keywords: 'latamaigile aigile brand company venture initiative project agents agentic people human facilitate easier',
  },
  {
    id: 'profile-languages',
    type: 'profile',
    plainLead: true,
    title: 'Languages',
    section: 'about',
    lead: "English is Wesley's working language (Full Professional), and he also speaks Spanish and Chinese at Elementary level.",
    bullets: [
      'Currently improving his English toward C2 level with AI.',
      'Currently learning Chinese with AI.',
    ],
    keywords: 'language languages speak spoken fluent fluency english spanish chinese mandarin portuguese c2 proficiency communication',
  },
  {
    id: 'interests-overview',
    type: 'interest',
    standalone: true,
    title: 'Beyond the CV: curiosities',
    section: 'about',
    showMatch: false,
    lead: 'Beyond delivery work, Wesley is curious about healthcare, automation, trading and learning with AI.',
    bullets: [
      'Healthcare, especially dentistry and orofacial harmonization.',
      'Updating administrative and secretarial routines, and automating processes with n8n.',
      'Trading.',
      'Learning Chinese with AI.',
      'Improving his English to C2 level with AI.',
    ],
    maxBullets: 6,
    keywords: 'interests interest hobbies hobby curiosity curiosities curious outside personal passion passions free time fun beyond cv person human',
  },
  {
    id: 'interest-healthcare',
    type: 'interest',
    title: 'Curiosity: healthcare and dentistry',
    section: 'about',
    showMatch: false,
    lead: 'Healthcare is a personal interest of Wesley, especially dentistry and orofacial harmonization.',
    bullets: ['A personal curiosity, separate from his professional delivery experience.'],
    keywords: 'healthcare health dentist dentists dentistry dental teeth orofacial harmonization aesthetic clinic medical interest curious personal',
  },
  {
    id: 'interest-automation',
    type: 'interest',
    title: 'Curiosity: process automation with n8n',
    section: 'about',
    showMatch: false,
    lead: 'Wesley is interested in modernizing secretarial and administrative routines and automating processes with n8n.',
    bullets: ['A personal interest in making everyday administrative work easier for people.'],
    keywords: 'n8n automation automate workflow workflows secretary secretaries secretarial administrative assistant routine routines process processes no-code low-code interest curious personal',
  },
  {
    id: 'interest-trading',
    type: 'interest',
    title: 'Curiosity: trading',
    section: 'about',
    showMatch: false,
    lead: 'Trading is one of the things Wesley follows out of personal interest.',
    bullets: ['A personal curiosity, outside his professional delivery experience.'],
    keywords: 'trade trader trading markets market interest curious personal hobby',
  },
  {
    id: 'interest-learning',
    type: 'interest',
    title: 'Curiosity: learning languages with AI',
    section: 'about',
    showMatch: false,
    lead: 'Wesley uses AI to keep learning: studying Chinese and working toward C2 level English.',
    bullets: [
      'Chinese: currently Elementary, learning with AI.',
      'English: currently Full Professional, aiming for C2 with AI.',
    ],
    keywords: 'learning learn study studying chinese mandarin english c2 ai tutor improve improving language languages education curious personal',
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
  'Can I get an updated CV in ATS format?',
  'What is LatAm.AIgile?',
  'What is Wesley curious about outside work?',
  'What AI projects has he delivered?',
  'Is he available for nearshore roles?',
];

export const cvDownloadOptions = atsCvDownloads;
