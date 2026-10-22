import { canonicalNames, cvDownloadOptions, followUpsFor, knowledgeBase, suggestedQuestions } from './knowledge.js';

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
  'latam.aigile': ['latamaigile'],
  'latam aigile': ['latamaigile'],
  qaws: ['qa', 'aws'],
  'service now': ['servicenow'],
  'service-now': ['servicenow'],
  'available for a call': ['schedule', 'call'],
  'available for a meeting': ['schedule', 'meeting'],
  'available for an interview': ['schedule', 'interview'],
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
const CV_REQUEST = /\b(cv|resume|résumé|curriculum|curriculo|currículo|ats)\b/i;
const IT_ROLE = /\bit (coordinator|manager|coordination)\b|coordinator|itil|itsm|operations|service desk/i;

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

const STEMMED_SYNONYMS = Object.fromEntries(
  Object.entries(SYNONYMS).map(([key, values]) => [stem(key), values.map(stem)]),
);
const STEMMED_TECH_TERMS = new Set([...TECH_TERMS].map(stem));

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
    (STEMMED_SYNONYMS[token] ?? []).forEach((synonym) => {
      if (!weights.has(synonym)) weights.set(synonym, 0.45);
    });
  });

  return { base, weights };
};

const TOOL_QUESTION = /\b(know|knows|experience|familiar|skill|skills|tool|tools|stack|use|used|proficient)\b/i;

export const retrieve = (question, { limit = 3 } = {}) => {
  const { base, weights } = buildQuery(question);
  if (weights.size === 0) return [];
  const skillsBoost = TOOL_QUESTION.test(question) || base.length <= 2 ? 1.35 : 1;

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
    if (STEMMED_SYNONYMS[token] && !STEMMED_TECH_TERMS.has(token)) return false;
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

const SUMMARY = knowledgeBase.find((chunk) => chunk.id === 'profile-summary');
const CONTACT_LINE = 'Want to go deeper? Wesley replies within 24h at wesley.zilva@gmail.com.';

const CANONICAL = Object.fromEntries(Object.entries(canonicalNames).map(([key, value]) => [stem(key), value]));

const labelFor = (term, question) => {
  if (CANONICAL[term]) return CANONICAL[term];
  const raw = question.toLowerCase().match(/[a-z0-9+#.]+/g)?.find((word) => stem(word) === term);
  const label = raw ?? term;
  return label.length <= 3 ? label.toUpperCase() : `${label[0].toUpperCase()}${label.slice(1)}`;
};

const joinLabels = (labels) => {
  if (labels.length <= 1) return labels.join('');
  return `${labels.slice(0, -1).join(', ')} and ${labels[labels.length - 1]}`;
};

const normalizeQuestion = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// Contextual follow-ups come first (closest topic first), then generic ones fill the remaining slots.
export const buildFollowUps = (question, chunks = [], asked = [], { max = 3, contextual = 2 } = {}) => {
  const seen = new Set([question, ...asked].map(normalizeQuestion));
  const picked = [];
  const add = (candidate) => {
    const key = normalizeQuestion(candidate);
    if (seen.has(key)) return false;
    seen.add(key);
    picked.push(candidate);
    return true;
  };

  chunks.flatMap((chunk) => followUpsFor(chunk)).some((candidate) => {
    add(candidate);
    return picked.length >= contextual;
  });
  suggestedQuestions.some((candidate) => {
    add(candidate);
    return picked.length >= max;
  });

  return picked;
};

const chunkById = (id) => knowledgeBase.find((chunk) => chunk.id === id);

const guided = (text, confidence, extraBullets = [], suggestions = suggestedQuestions.slice(0, 4)) => ({
  text,
  bullets: [...SUMMARY.bullets.slice(0, 3), ...extraBullets, CONTACT_LINE],
  sources: [{ id: SUMMARY.id, title: SUMMARY.title, section: SUMMARY.section, type: SUMMARY.type }],
  suggestions,
  matchPercent: null,
  confidence,
});

const findAdjacent = (term, excludedIds) => {
  const synonyms = STEMMED_SYNONYMS[term] ?? [];
  if (synonyms.length === 0) return null;

  const best = index.docs
    .filter((doc) => !excludedIds.has(doc.chunk.id))
    .map((doc) => ({
      chunk: doc.chunk,
      score: synonyms.reduce((sum, token) => {
        const frequency = doc.weighted.get(token);
        return frequency ? sum + index.idf(token) * (1 + Math.log(frequency)) : sum;
      }, 0),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)[0];

  return best?.chunk ?? null;
};

const cvAnswer = (question, asked) => {
  const wantsIt = IT_ROLE.test(question);
  const ordered = wantsIt ? [...cvDownloadOptions].reverse() : cvDownloadOptions;
  const profile = knowledgeBase.find((chunk) => chunk.id === 'profile-cv');

  return {
    text: "Absolutely! Here is Wesley's latest CV in an ATS-friendly format: single column, plain text and standard sections, so it imports cleanly into any recruiting platform. Pick the version closest to the role you are hiring for.",
    bullets: [
      ...ordered.map((cv) => `${cv.label}: ${cv.description}`),
      'Both are 2-page PDFs in English, built from his current profile.',
      'Need another language? The classic CV comes in 6 languages in the Contact section.',
      CONTACT_LINE,
    ],
    downloads: ordered.map(({ id, label, fileName }) => ({ id, label, fileName })),
    sources: [{ id: profile.id, title: profile.title, section: profile.section, type: profile.type }],
    suggestions: buildFollowUps(question, [profile], asked),
    matchPercent: null,
    confidence: 'high',
  };
};

const toSource = (chunk) => ({ id: chunk.id, title: chunk.title, section: chunk.section, type: chunk.type });

export const composeAnswer = (question, results, { asked = [] } = {}) => {
  const trimmed = question.trim();

  if (GREETING.test(trimmed)) {
    return {
      text: `Hi! I'm ${AGENT_NAME}. I can answer your screening questions about Wesley's projects, skills, career and availability. Tap a question or type your own.`,
      bullets: [],
      sources: [],
      suggestions: buildFollowUps(trimmed, [], asked, { max: 4, contextual: 0 }),
      matchPercent: null,
      confidence: 'smalltalk',
    };
  }

  if (THANKS.test(trimmed)) {
    return {
      text: 'My pleasure! If you would like to talk to Wesley directly, he replies within 24h at wesley.zilva@gmail.com.',
      bullets: [],
      sources: [],
      suggestions: buildFollowUps(trimmed, [chunkById('profile-contact')], asked),
      matchPercent: null,
      confidence: 'smalltalk',
    };
  }

  if (CV_REQUEST.test(trimmed)) return cvAnswer(trimmed, asked);

  const terms = specificTerms(trimmed);
  const covered = (term) => results.some((entry) => entry.vocabulary.has(term));
  const matched = terms.filter(covered);
  const missing = terms.filter((term) => !covered(term));
  const labels = (list) => list.map((term) => labelFor(term, trimmed));

  if (results.length === 0 || (terms.length > 0 && matched.length === 0 && !missing.some((term) => findAdjacent(term, new Set())))) {
    const asksAboutTool = terms.length > 0 && (YES_NO_START.test(trimmed) || TOOL_QUESTION.test(trimmed));
    return guided(
      "Happy to help with your screening! Here is a quick snapshot of Wesley. Tap a question below, or ask about his projects, skills, career or availability.",
      'none',
      asksAboutTool ? [`For ${joinLabels(labels(terms))}, Wesley will gladly walk you through the details.`] : [],
      buildFollowUps(trimmed, [SUMMARY], asked, { max: 4, contextual: 2 }),
    );
  }

  const [primary, ...candidates] = results;
  const isInterest = primary.chunk.type === 'interest';
  const relatable = candidates.filter((entry) => isInterest || entry.chunk.type !== 'interest');
  const related = primary.chunk.standalone
    ? []
    : terms.length > 0
      ? relatable.filter((entry) => terms.some((term) => entry.vocabulary.has(term)))
      : relatable;
  const queryTokens = [...buildQuery(trimmed).weights.keys()];
  const isYesNo = YES_NO_START.test(trimmed) || /\b(know|knows|experience with)\b/i.test(trimmed);
  const showFit = terms.length > 0 && (isYesNo || TOOL_QUESTION.test(trimmed) || buildQuery(trimmed).base.length <= 3);

  const shownIds = new Set([primary, ...related].map((entry) => entry.chunk.id));
  const adjacent = new Map();
  missing.forEach((term) => {
    const chunk = findAdjacent(term, shownIds);
    if (chunk) {
      adjacent.set(term, chunk);
      shownIds.add(chunk.id);
    }
  });
  const unmatched = missing.filter((term) => !adjacent.has(term));

  const matchPercent = showFit && primary.chunk.showMatch !== false
    ? Math.round(((matched.length + 0.5 * adjacent.size) / terms.length) * 100)
    : null;

  const matchedNames = joinLabels(labels(matched));
  let lead = primary.chunk.lead;
  if (primary.chunk.type === 'skills' && matched.length > 0) {
    lead = `${isYesNo ? 'Yes, ' : ''}${matchedNames} ${matched.length > 1 ? 'are' : 'is'} part of Wesley's toolkit, listed under ${primary.chunk.title}.`;
  }

  const synthesizedLead = lead !== primary.chunk.lead;
  let opening = '';
  if (!synthesizedLead && !isInterest && !primary.chunk.plainLead && showFit && matched.length > 0 && (isYesNo || TOOL_QUESTION.test(trimmed))) {
    opening = missing.length === 0 ? (isYesNo ? 'Yes. ' : '') : `Yes for ${matchedNames}. `;
  }

  const bullets = pickBullets(primary.chunk, queryTokens, primary.chunk.maxBullets ?? 4);
  if (primary.chunk.facts) bullets.unshift(`Scope: ${primary.chunk.facts}`);
  if (primary.chunk.type === 'skills' && matched.length > 0) bullets.push(`Context: ${primary.chunk.lead}`);

  related.forEach((entry) => {
    bullets.push(`Related, ${entry.chunk.title}: ${truncate(entry.chunk.lead)}`);
  });

  adjacent.forEach((chunk, term) => {
    bullets.push(`Closest to ${labelFor(term, trimmed)}, ${chunk.title}: ${truncate(chunk.lead)}`);
  });

  if (unmatched.length > 0) {
    bullets.push(`For ${joinLabels(labels(unmatched))}, Wesley will gladly walk you through the details. ${CONTACT_LINE}`);
  }

  const sourceChunks = [primary, ...related].map((entry) => entry.chunk).concat([...adjacent.values()]);

  return {
    text: `${opening}${lead}`,
    bullets,
    sources: sourceChunks.map(toSource),
    suggestions: buildFollowUps(trimmed, sourceChunks, asked),
    matchPercent,
    confidence: matchPercent === null || matchPercent >= 100 ? 'high' : 'partial',
  };
};

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

// Single integration point: swap the body for a real retrieval + LLM call later.
export const askAgent = async (question, { onStatus, latency = 1, history = [] } = {}) => {
  onStatus?.('Searching Wesley\'s CV…');
  await wait(450 * latency);

  const results = retrieve(question);
  onStatus?.(`Reading ${results.length} passage${results.length === 1 ? '' : 's'}…`);
  await wait(500 * latency);

  onStatus?.('Drafting answer…');
  await wait(350 * latency);

  return composeAnswer(question, results, { asked: history });
};
