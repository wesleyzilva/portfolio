import { knowledgeBase } from './knowledge.js';

export const AGENT_NAME = '#askToTPM_agentic';

const STOPWORDS = new Set((
  'a an and are as at be been but by can could did do does for from had has have how i if in into is it its of on or ' +
  'me my our please so than that the their them then there these they this to us was we were what when where which who whom why will with would you your'
).split(' '));

// Words that are conversational glue, not evidence the CV must contain.
const GENERIC_TERMS = new Set((
  'he him his wesley candidate know knows knew experience experienced work worked working project projects tell about any much many ' +
  'tool tools stack skill skills good great strong ever yet also really well proficient familiar familiarity hands-on handson ' +
  'let say give show share example examples detail details more lot big biggest best top main key recruiter team teams ' +
  'deliver delivered delivery handle handled use used using'
).split(' '));

// Tech names stay checkable even though they also act as synonym keys.
const TECH_TERMS = new Set(['aws', 'azure', 'gcp', 'kubernetes', 'k8s', 'qa', 'test', 'testing', 'llm', 'rag', 'genai', 'ml', 'scrum', 'agile', 'fintech', 'payments', 'cloud', 'data', 'security']);

const ALIASES = {
  qaws: ['qa', 'aws'],
  'q.a.': ['qa'],
  'ci/cd': ['ci', 'cd', 'pipeline'],
  'm&a': ['manda'],
};

const SYNONYMS = {
  aws: ['cloud', 'amazon'],
  azure: ['cloud'],
  gcp: ['cloud'],
  cloud: ['aws', 'azure', 'gcp', 'migration'],
  kubernetes: ['docker', 'container'],
  k8s: ['kubernetes', 'docker'],
  qa: ['quality', 'test', 'compliance'],
  test: ['quality', 'qa'],
  testing: ['quality', 'qa'],
  security: ['devsecops', 'vulnerability', 'compliance'],
  secure: ['security', 'devsecops'],
  llm: ['ai'],
  rag: ['ai', 'search'],
  genai: ['ai'],
  agentic: ['ai', 'agent'],
  agents: ['ai', 'agent'],
  ml: ['mlops', 'ai'],
  impact: ['result', 'reduction', 'increase'],
  measurable: ['result', 'reduction', 'increase'],
  metrics: ['result', 'kpi', 'dora'],
  numbers: ['result', 'reduction'],
  achievement: ['result', 'reduction'],
  achievements: ['result', 'reduction'],
  acquisition: ['manda'],
  merger: ['manda'],
  global: ['international', 'distributed', 'countries'],
  distributed: ['global', 'international', 'remote'],
  international: ['global', 'countries'],
  remote: ['distributed', 'async', 'timezone'],
  scrum: ['agile'],
  agile: ['scrum', 'safe', 'kanban'],
  manager: ['lead', 'leadership', 'coordinator'],
  leader: ['lead', 'leadership'],
  leadership: ['lead', 'mentoring'],
  data: ['analytics', 'etl'],
  hire: ['available', 'availability', 'contact'],
  available: ['availability', 'open', 'nearshore'],
  salary: ['contact'],
  resume: ['cv'],
  curriculum: ['cv'],
  payments: ['pix', 'fintech'],
  fintech: ['payments', 'pix'],
};

const GREETING = /^\s*(hi|hello|hey|hola|oi|good (morning|afternoon|evening))\b[\s!.,?]*$/i;
const THANKS = /^\s*(thanks|thank you|thx|cheers|great,? thanks)\b[\s!.,?]*$/i;
const YES_NO_START = /^\s*(does|do|did|has|have|had|is|are|was|can|could|will|would)\b/i;

const stem = (word) => {
  if (word.length <= 3) return word;
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss')) return word.slice(0, -1);
  return word;
};

const expandAliases = (text) => {
  let output = text.toLowerCase();
  Object.entries(ALIASES).forEach(([alias, replacement]) => {
    output = output.split(alias).join(` ${replacement.join(' ')} `);
  });
  return output;
};

export const tokenize = (text) => expandAliases(text)
  .replace(/[^a-z0-9+#]+/g, ' ')
  .split(' ')
  .filter((token) => token && !STOPWORDS.has(token))
  .map(stem);

const FIELD_WEIGHTS = { title: 3, keywords: 2, lead: 1.5, body: 1 };

const buildIndex = (chunks) => {
  const docs = chunks.map((chunk) => {
    const weighted = new Map();
    const add = (text, weight) => tokenize(text).forEach((token) => {
      weighted.set(token, (weighted.get(token) ?? 0) + weight);
    });

    add(chunk.title, FIELD_WEIGHTS.title);
    add(chunk.keywords ?? '', FIELD_WEIGHTS.keywords);
    add(chunk.lead ?? '', FIELD_WEIGHTS.lead);
    add([...(chunk.bullets ?? []), chunk.facts ?? ''].join(' '), FIELD_WEIGHTS.body);

    return { chunk, weighted, vocabulary: new Set(weighted.keys()) };
  });

  const documentFrequency = new Map();
  docs.forEach((doc) => doc.vocabulary.forEach((token) => {
    documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
  }));

  const idf = (token) => Math.log(1 + docs.length / (1 + (documentFrequency.get(token) ?? 0)));

  return { docs, idf };
};

const index = buildIndex(knowledgeBase);

const isGeneric = (token) => GENERIC_TERMS.has(token) || GENERIC_TERMS.has(`${token}s`);

const buildQuery = (question) => {
  const tokens = tokenize(question);
  const informative = tokens.filter((token) => !isGeneric(token));
  const base = informative.length > 0 ? informative : tokens;
  const weights = new Map();
  base.forEach((token) => weights.set(token, 1));

  base.forEach((token) => {
    (SYNONYMS[token] ?? []).map(stem).forEach((synonym) => {
      if (!weights.has(synonym)) weights.set(synonym, 0.45);
    });
  });

  return { base, weights };
};

const TOOL_QUESTION = /\b(know|knows|experience|familiar|skill|skills|tool|tools|stack|use|used|proficient)\b/i;

export const retrieve = (question, { limit = 3 } = {}) => {
  const { weights } = buildQuery(question);
  if (weights.size === 0) return [];
  const skillsBoost = TOOL_QUESTION.test(question) ? 1.35 : 1;

  const scored = index.docs
    .map((doc) => {
      let score = 0;
      weights.forEach((queryWeight, token) => {
        const frequency = doc.weighted.get(token);
        if (frequency) score += queryWeight * index.idf(token) * (1 + Math.log(frequency));
      });
      if (doc.chunk.type === 'skills') score *= skillsBoost;
      return { chunk: doc.chunk, score, vocabulary: doc.vocabulary };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return [];

  const cutoff = scored[0].score * 0.5;
  return scored.filter((entry) => entry.score >= cutoff).slice(0, limit);
};

const specificTerms = (question) => {
  const seen = new Set();
  return tokenize(question).filter((token) => {
    if (isGeneric(token) || seen.has(token)) return false;
    if (SYNONYMS[token] && !TECH_TERMS.has(token)) return false;
    seen.add(token);
    return true;
  });
};

const truncate = (text, max = 190) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

const pickBullets = (chunk, queryTokens, max) => {
  const query = new Set(queryTokens);
  return (chunk.bullets ?? [])
    .map((text, position) => {
      const overlap = tokenize(text).filter((token) => query.has(token)).length;
      return { text, position, overlap };
    })
    .sort((a, b) => b.overlap - a.overlap || a.position - b.position)
    .slice(0, max)
    .sort((a, b) => a.position - b.position)
    .map((entry) => entry.text);
};

const formatTerm = (term) => (term.length <= 3 ? term.toUpperCase() : term);

const FALLBACK = {
  text: "I couldn't find that in Wesley's CV, and I'd rather not guess. Try asking about his projects, skills, career timeline, AI work or availability, or reach him directly for anything else.",
  bullets: ['Email: wesley.zilva@gmail.com', 'LinkedIn: linkedin.com/in/wesleyzilva'],
  sources: [],
  confidence: 'none',
};

export const composeAnswer = (question, results) => {
  const trimmed = question.trim();

  if (GREETING.test(trimmed)) {
    return {
      text: `Hi! I'm ${AGENT_NAME}, an assistant that answers questions about Wesley's CV. Ask me about his projects, skills, career or availability.`,
      bullets: [],
      sources: [],
      confidence: 'smalltalk',
    };
  }

  if (THANKS.test(trimmed)) {
    return {
      text: 'Happy to help. If you would like to talk to Wesley directly, he replies within 24h at wesley.zilva@gmail.com.',
      bullets: [],
      sources: [],
      confidence: 'smalltalk',
    };
  }

  if (results.length === 0) return { ...FALLBACK };

  const terms = specificTerms(trimmed);
  const covered = (term) => results.some((entry) => entry.vocabulary.has(term));
  const matched = terms.filter(covered);
  const missing = terms.filter((term) => !covered(term));

  if (terms.length > 0 && matched.length === 0) return { ...FALLBACK };

  const [primary, ...candidates] = results;
  const related = terms.length > 0
    ? candidates.filter((entry) => terms.some((term) => entry.vocabulary.has(term)))
    : candidates;
  const queryTokens = [...buildQuery(trimmed).weights.keys()];
  const isYesNo = YES_NO_START.test(trimmed) || /\b(know|knows|experience with)\b/i.test(trimmed);

  let opening;
  if (isYesNo && missing.length === 0) opening = 'Yes. ';
  else if (isYesNo && matched.length > 0) opening = 'Partially. ';
  else opening = '';

  const text = `${opening}${primary.chunk.lead}`;
  const bullets = pickBullets(primary.chunk, queryTokens, primary.chunk.maxBullets ?? 4);

  if (primary.chunk.facts) bullets.unshift(`Scope: ${primary.chunk.facts}`);

  if (missing.length > 0) {
    bullets.push(`Not found in the CV: explicit mention of ${missing.map(formatTerm).join(', ')}.`);
  }

  related.forEach((entry) => {
    bullets.push(`Related, ${entry.chunk.title}: ${truncate(entry.chunk.lead)}`);
  });

  return {
    text,
    bullets,
    sources: results.map((entry) => ({
      id: entry.chunk.id,
      title: entry.chunk.title,
      section: entry.chunk.section,
      type: entry.chunk.type,
    })),
    confidence: missing.length > 0 ? 'partial' : 'high',
  };
};

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// Single integration point: swap the body for a real retrieval + LLM call later.
export const askAgent = async (question, { onStatus, latency = 1 } = {}) => {
  onStatus?.('Searching Wesley\'s CV…');
  await wait(450 * latency);

  const results = retrieve(question);
  onStatus?.(`Reading ${results.length} passage${results.length === 1 ? '' : 's'}…`);
  await wait(500 * latency);

  onStatus?.('Drafting answer…');
  await wait(350 * latency);

  return composeAnswer(question, results);
};
