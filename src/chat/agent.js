// src/chat/agent.js
import { canonicalNames, cvDownloadOptions, followUpsFor, knowledgeBase, suggestedQuestions } from './knowledge.js';

export const AGENT_NAME = '#askToTPM_agentic';

const STOPWORDS = new Set((
  'a an and are as at be been but by can could did do does for from had has have how i if in into is it its of on or ' +
  'me my our please so than that the their them then there these they this to us was we were what when where which who whom why will with would you your ' +
  'o os um uma uns umas de do da dos das em no na nos nas por para com sem como que qual quais когда onde quem porque ' +
  'ele ela dele dela voce seu sua seus suas sobre tem teve pode fazer faz foi sao esta mais muito'
).split(' '));

// Words that are conversational glue, not evidence the CV must contain.
const GENERIC_TERMS = new Set((
  'he him his wesley candidate know knows knew experience experienced work worked working project projects tell about any much many ' +
  'tool tools stack skill skills good great strong ever yet also really well proficient familiar familiarity hands-on handson ' +
  'let say give show share example examples detail details more lot big biggest best top main key recruiter team teams ' +
  'deliver delivered delivery handle handled use used using led ' +
  'conhece sabe experiencia trabalhou trabalha projeto projetos fale conte diga exemplo exemplos detalhe detalhes ' +
  'ferramenta ferramentas habilidade habilidades time times equipe equipes liderou entrega entregas'
).split(' '));

// Tech names stay checkable even though they also act as synonym keys.
const TECH_TERMS = new Set(['aws', 'azure', 'gcp', 'kubernetes', 'k8s', 'qa', 'test', 'testing', 'llm', 'rag', 'genai', 'ml', 'scrum', 'agile', 'fintech', 'payments', 'cloud', 'data', 'security']);

const ALIASES = {
  'latam.aigile': ['latamaigile'],
  'latam aigile': ['latamaigile'],
  qaws: ['qa', 'aws'],
  'service now': ['servicenow'],
  'service-now': ['servicenow'],
  'trade-offs': ['tradeoff'],
  'trade-off': ['tradeoff'],
  'trade offs': ['tradeoff'],
  'how technical': ['technicaldepth'],
  'technical depth': ['technicaldepth'],
  'quao tecnico': ['technicaldepth'],
  'nivel tecnico': ['technicaldepth'],
  'about yourself': ['summary', 'overview'],
  'introduce yourself': ['summary', 'overview'],
  'who is wesley': ['summary', 'overview'],
  'quem e wesley': ['summary', 'overview'],
  'fale sobre voce': ['summary', 'overview'],
  'available for a call': ['schedule', 'call'],
  'available for a meeting': ['schedule', 'meeting'],
  'available for an interview': ['schedule', 'interview'],
  'agendar entrevista': ['schedule', 'interview'],
  'marcar entrevista': ['schedule', 'interview'],
  'q.a.': ['qa'],
  'ci/cd': ['ci', 'cd', 'pipeline'],
  'm&a': ['manda'],
  // Ponte semântica PT -> EN para o Retriever encontrar os chunks em inglês
  'dados': ['data'],
  'seguranca': ['security', 'vulnerability'],
  'vulnerabilidade': ['vulnerability', 'security'],
  'vulnerabilidades': ['vulnerability', 'security'],
  'nuvem': ['cloud'],
  'migracao': ['migration'],
  'pagamentos': ['payments'],
  'pagamento': ['payments'],
  'carreira': ['career', 'milestone'],
  'marcos': ['milestone'],
  'riscos': ['risk'],
  'risco': ['risk'],
  'dependencias': ['dependencies'],
  'metricas': ['metrics'],
  'prioridades': ['priorities', 'prioritization'],
  'conflito': ['conflict', 'conflicting'],
  'conflitos': ['conflict', 'conflicting'],
  'formacao': ['education', 'degree'],
  'faculdade': ['education', 'degree'],
  'engenharia eletrica': ['electrical', 'engineering'],
  'idioma': ['language'],
  'idiomas': ['languages'],
  'ingles': ['english'],
  'chines': ['chinese'],
  'salario': ['salary', 'compensation'],
  'pretensao': ['salary', 'compensation'],
  'disponivel': ['available', 'availability'],
  'disponibilidade': ['availability'],
  'contato': ['contact'],
  'certificacao': ['certification'],
  'certificacoes': ['certifications'],
  'curiosidades': ['curious', 'interests'],
  'interesses': ['interests'],
  'dentista': ['dentist', 'healthcare'],
  'odonto': ['dentistry', 'healthcare'],
  'odontologia': ['dentistry', 'healthcare'],
  'saude': ['healthcare'],
  'automacao': ['automation'],
  'cargo atual': ['current', 'role'],
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

const GREETING = /^\s*(hi|hello|hey|hola|oi|olá|ola|bom dia|boa tarde|boa noite|good (morning|afternoon|evening))\b[\s!.,?]*$/i;
const THANKS = /^\s*(thanks|thank you|thx|cheers|great,? thanks|obrigado|obrigada|valeu|muito obrigado)\b[\s!.,?]*$/i;
const CV_REQUEST = /\b(cv|resume|résumé|curriculum|curriculo|currículo|ats)\b/i;
const IT_ROLE = /\bit (coordinator|manager|coordination)\b|coordinator|coordenador|itil|itsm|operations|service desk/i;

const YES_NO_START = /^\s*(does|do|did|has|have|had|is|are|was|can|could|will|would|ele|tem|teve|sabe|conhece|ja|já|pode|foi|é)\b/i;

export const detectPortuguese = (text) => {
  const normalized = text.trim();
  if (/^(oi|olá|ola|bom dia|boa tarde|boa noite|obrigado|obrigada|valeu)\b/i.test(normalized)) return true;
  if (/[ãõçáéíóúâêôà]/i.test(normalized)) return true;
  const ptMarkers = /\b(ele|dele|voce|você|qual|quais|como|onde|quando|quem|sobre|conhece|sabe|trabalhou|trabalha|projetos|experiencia|experiência|curriculo|currículo|disponivel|disponível|fale|conte|tem|teve|pode|salario|salário|entrevista|carreira|riscos|equipe|times|nuvem|dados|seguranca|segurança|pagamentos)\b/i;
  const words = normalized.split(/\s+/);
  return words.length >= 2 && ptMarkers.test(normalized);
};

const stripAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

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
  let output = stripAccents(text.toLowerCase());
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

const TOOL_QUESTION = /\b(know|knows|experience|familiar|skill|skills|tool|tools|stack|use|used|proficient|conhece|sabe|experiencia|ferramenta|usa|usou|domina)\b/i;

export const retrieve = (question, { limit = 3 } = {}) => {
  const { base, weights } = buildQuery(question);
  if (weights.size === 0) return [];
  const skillsBoost = TOOL_QUESTION.test(stripAccents(question)) || base.length <= 2 ? 1.35 : 1;

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
const CONTACT_LINE_PT = 'Quer aprofundar? O Wesley responde em até 24h pelo e-mail wesley.zilva@gmail.com.';

const CANONICAL = Object.fromEntries(Object.entries(canonicalNames).map(([key, value]) => [stem(key), value]));

const labelFor = (term, question) => {
  if (CANONICAL[term]) return CANONICAL[term];
  const raw = stripAccents(question.toLowerCase()).match(/[a-z0-9+#.]+/g)?.find((word) => stem(word) === term);
  const label = raw ?? term;
  return label.length <= 3 ? label.toUpperCase() : `${label[0].toUpperCase()}${label.slice(1)}`;
};

const joinLabels = (labels, isPt = false) => {
  if (labels.length <= 1) return labels.join('');
  const conj = isPt ? ' e ' : ' and ';
  return `${labels.slice(0, -1).join(', ')}${conj}${labels[labels.length - 1]}`;
};

const normalizeQuestion = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

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

const guided = (text, confidence, extraBullets = [], suggestions = suggestedQuestions.slice(0, 4), isPt = false) => ({
  text,
  bullets: [...SUMMARY.bullets.slice(0, 3), ...extraBullets, isPt ? CONTACT_LINE_PT : CONTACT_LINE],
  sources: [{ id: SUMMARY.id, title: SUMMARY.title, section: SUMMARY.section, type: SUMMARY.type }],
  suggestions,
  matchPercent: null,
  confidence,
  lang: isPt ? 'pt' : 'en',
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

const cvAnswer = (question, asked, isPt = false) => {
  const wantsIt = IT_ROLE.test(question);
  const ordered = wantsIt ? [...cvDownloadOptions].reverse() : cvDownloadOptions;
  const profile = knowledgeBase.find((chunk) => chunk.id === 'profile-cv');

  return {
    text: isPt
      ? 'Com certeza! Aqui está o currículo atualizado do Wesley em formato compatível com ATS: coluna única, texto limpo e seções padronizadas. Escolha a versão mais alinhada à sua vaga.'
      : "Absolutely! Here is Wesley's latest CV in an ATS-friendly format: single column, plain text and standard sections, so it imports cleanly into any recruiting platform. Pick the version closest to the role you are hiring for.",
    bullets: isPt
      ? [
          ...ordered.map((cv) => `${cv.label}: ${cv.description}`),
          'Ambos são PDFs de 2 páginas em inglês, construídos a partir do perfil atual dele.',
          'Precisa do CV em Português ou outro idioma? A seção de Contato possui versões em 6 idiomas.',
          CONTACT_LINE_PT,
        ]
      : [
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
    lang: isPt ? 'pt' : 'en',
  };
};

const toSource = (chunk) => ({ id: chunk.id, title: chunk.title, section: chunk.section, type: chunk.type });

export const composeAnswer = (question, results, { asked = [] } = {}) => {
  const trimmed = question.trim();
  const isPt = detectPortuguese(trimmed);

  if (GREETING.test(trimmed)) {
    return {
      text: isPt
        ? `Olá! Eu sou o ${AGENT_NAME}. Posso responder suas perguntas sobre os projetos, habilidades, carreira e disponibilidade do Wesley em português ou inglês. Escolha uma pergunta abaixo ou digite a sua.`
        : `Hi! I'm ${AGENT_NAME}. I can answer your screening questions about Wesley's projects, skills, career and availability. Tap a question or type your own.`,
      bullets: [],
      sources: [],
      suggestions: buildFollowUps(trimmed, [], asked, { max: 4, contextual: 0 }),
      matchPercent: null,
      confidence: 'smalltalk',
      lang: isPt ? 'pt' : 'en',
    };
  }

  if (THANKS.test(trimmed)) {
    return {
      text: isPt
        ? 'Por nada! Se quiser falar diretamente com o Wesley, ele responde em até 24h no e-mail wesley.zilva@gmail.com.'
        : 'My pleasure! If you would like to talk to Wesley directly, he replies within 24h at wesley.zilva@gmail.com.',
      bullets: [],
      sources: [],
      suggestions: buildFollowUps(trimmed, [chunkById('profile-contact')], asked),
      matchPercent: null,
      confidence: 'smalltalk',
      lang: isPt ? 'pt' : 'en',
    };
  }

  if (CV_REQUEST.test(trimmed)) return cvAnswer(trimmed, asked, isPt);

  const terms = specificTerms(trimmed);
  const covered = (term) => results.some((entry) => entry.vocabulary.has(term));
  const matched = terms.filter(covered);
  const missing = terms.filter((term) => !covered(term));
  const labels = (list) => list.map((term) => labelFor(term, trimmed));

  if (results.length === 0 || (terms.length > 0 && matched.length === 0 && !missing.some((term) => findAdjacent(term, new Set())))) {
    const asksAboutTool = terms.length > 0 && (YES_NO_START.test(trimmed) || TOOL_QUESTION.test(stripAccents(trimmed)));
    return guided(
      isPt
        ? 'Com prazer ajudo na sua triagem! Aqui está um resumo rápido do Wesley. Toque em uma pergunta abaixo ou pergunte sobre os projetos, skills, carreira ou disponibilidade dele.'
        : 'Happy to help with your screening! Here is a quick snapshot of Wesley. Tap a question below, or ask about his projects, skills, career or availability.',
      'none',
      asksAboutTool
        ? [
            isPt
              ? `Sobre ${joinLabels(labels(terms), true)}, o Wesley terá prazer em detalhar sua experiência diretamente.`
              : `For ${joinLabels(labels(terms), false)}, Wesley will gladly walk you through the details.`,
          ]
        : [],
      buildFollowUps(trimmed, [SUMMARY], asked, { max: 4, contextual: 2 }),
      isPt,
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
  const isYesNo = YES_NO_START.test(trimmed) || /\b(know|knows|experience with|conhece|sabe|experiencia com)\b/i.test(stripAccents(trimmed));
  const showFit = terms.length > 0 && (isYesNo || TOOL_QUESTION.test(stripAccents(trimmed)) || buildQuery(trimmed).base.length <= 3);

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

  const matchedNames = joinLabels(labels(matched), isPt);
  let lead = primary.chunk.lead;
  if (primary.chunk.type === 'skills' && matched.length > 0) {
    lead = isPt
      ? `${isYesNo ? 'Sim, ' : ''}${matchedNames} ${matched.length > 1 ? 'fazem' : 'faz'} parte do toolkit do Wesley, listado em ${primary.chunk.title}.`
      : `${isYesNo ? 'Yes, ' : ''}${matchedNames} ${matched.length > 1 ? 'are' : 'is'} part of Wesley's toolkit, listed under ${primary.chunk.title}.`;
  }

  const synthesizedLead = lead !== primary.chunk.lead;
  let opening = '';
  if (!synthesizedLead && !isInterest && !primary.chunk.plainLead && showFit && matched.length > 0 && (isYesNo || TOOL_QUESTION.test(stripAccents(trimmed)))) {
    if (isPt) {
      opening = missing.length === 0 ? (isYesNo ? 'Sim. ' : '') : `Sim para ${matchedNames}. `;
    } else {
      opening = missing.length === 0 ? (isYesNo ? 'Yes. ' : '') : `Yes for ${matchedNames}. `;
    }
  }

  const bullets = pickBullets(primary.chunk, queryTokens, primary.chunk.maxBullets ?? 4);
  if (primary.chunk.facts) bullets.unshift(`${isPt ? 'Escopo' : 'Scope'}: ${primary.chunk.facts}`);
  if (primary.chunk.type === 'skills' && matched.length > 0) bullets.push(`${isPt ? 'Contexto' : 'Context'}: ${primary.chunk.lead}`);

  related.forEach((entry) => {
    bullets.push(`${isPt ? 'Relacionado' : 'Related'}, ${entry.chunk.title}: ${truncate(entry.chunk.lead)}`);
  });

  adjacent.forEach((chunk, term) => {
    bullets.push(`${isPt ? 'Mais próximo de' : 'Closest to'} ${labelFor(term, trimmed)}, ${chunk.title}: ${truncate(chunk.lead)}`);
  });

  if (unmatched.length > 0) {
    bullets.push(
      isPt
        ? `Para ${joinLabels(labels(unmatched), true)}, o Wesley terá prazer em apresentar os detalhes. ${CONTACT_LINE_PT}`
        : `For ${joinLabels(labels(unmatched), false)}, Wesley will gladly walk you through the details. ${CONTACT_LINE}`,
    );
  }

  const sourceChunks = [primary, ...related].map((entry) => entry.chunk).concat([...adjacent.values()]);

  return {
    text: `${opening}${lead}`,
    bullets,
    sources: sourceChunks.map(toSource),
    suggestions: buildFollowUps(trimmed, sourceChunks, asked),
    matchPercent,
    confidence: matchPercent === null || matchPercent >= 100 ? 'high' : 'partial',
    lang: isPt ? 'pt' : 'en',
  };
};

const wait = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

let llmWorker = null;
const getLlmWorker = () => {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return null;
  if (!llmWorker) {
    try {
      llmWorker = new Worker(new URL('./llmWorker.js', import.meta.url), { type: 'module' });
    } catch {
      llmWorker = null;
    }
  }
  return llmWorker;
};

export const askAgent = async (question, { onStatus, latency = 1, history = [], useLocalLlm = false } = {}) => {
  const isPt = detectPortuguese(question);

  onStatus?.(isPt ? 'Buscando no currículo do Wesley…' : 'Searching Wesley\'s CV…');
  await wait(450 * latency);

  const results = retrieve(question);
  onStatus?.(
    isPt
      ? `Lendo ${results.length} trecho${results.length === 1 ? '' : 's'}…`
      : `Reading ${results.length} passage${results.length === 1 ? '' : 's'}…`,
  );
  await wait(500 * latency);

  onStatus?.(isPt ? 'Elaborando resposta…' : 'Drafting answer…');
  await wait(350 * latency);

  const baseAnswer = composeAnswer(question, results, { asked: history });

  const worker = useLocalLlm ? getLlmWorker() : null;
  if (!worker || results.length === 0 || baseAnswer.confidence === 'smalltalk' || baseAnswer.downloads) {
    return baseAnswer;
  }

  const contextText = results
    .map((r) => `[${r.chunk.title}]: ${r.chunk.lead}\n${(r.chunk.bullets ?? []).join('\n')}`)
    .join('\n\n');

  const isInterest = results[0]?.chunk?.type === 'interest';

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      worker.removeEventListener('message', onWorkerMessage);
      resolve(baseAnswer);
    }, 15000);

    const onWorkerMessage = (event) => {
      const { type, text } = event.data || {};
      if (type === 'STATUS') {
        onStatus?.(text);
      } else if (type === 'SUCCESS') {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', onWorkerMessage);
        resolve({
          ...baseAnswer,
          text,
        });
      } else if (type === 'FALLBACK') {
        clearTimeout(timeoutId);
        worker.removeEventListener('message', onWorkerMessage);
        resolve(baseAnswer);
      }
    };

    worker.addEventListener('message', onWorkerMessage);
    worker.postMessage({
      action: 'synthesize',
      payload: { question, contextText, isInterest, lang: isPt ? 'pt' : 'en' },
    });
  });
};