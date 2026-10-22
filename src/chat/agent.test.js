import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { askAgent, retrieve, tokenize } from './agent.js';
import { allFollowUpQuestions, knowledgeBase, suggestedQuestions } from './knowledge.js';

const ask = (question) => askAgent(question, { latency: 0 });

test('knowledge base has unique chunk ids', () => {
  const ids = knowledgeBase.map((chunk) => chunk.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('QAWS is expanded into QA and AWS', () => {
  assert.deepEqual(tokenize('QAWS'), ['qa', 'aws']);
});

test('"he know QAWS projects?" shows a match percentage and QA-adjacent evidence', async () => {
  const answer = await ask('he know QAWS projects?');
  assert.equal(answer.matchPercent, 75);
  assert.match(answer.text, /^Yes, AWS/);
  assert.ok(answer.sources.some((source) => source.id.startsWith('skills-cloud')));
  assert.ok(answer.sources.some((source) => source.id === 'profile-quality'));
});

test('tool questions answer from the skills chunk with a yes and 100% match', async () => {
  const answer = await ask('Does he know AWS?');
  assert.match(answer.text, /^Yes, AWS/);
  assert.equal(answer.matchPercent, 100);
});

test('"service now" resolves to ServiceNow in ITSM skills', async () => {
  const answer = await ask('service now');
  assert.equal(answer.sources[0].id, 'skills-itsm-incident-management');
  assert.match(answer.text, /^ServiceNow/);
});

test('partial matches never use negative wording', async () => {
  const answers = await Promise.all([
    ask('Does he know Rust and Kubernetes?'),
    ask('Does he know QA and AWS projects?'),
    ask('voltar'),
    ask('what is the weather today'),
  ]);
  answers.forEach((answer) => {
    const everything = [answer.text, ...answer.bullets].join(' ');
    assert.doesNotMatch(everything, /not found|couldn't find|don't know|partially|no experience/i);
  });
  assert.equal(answers[0].matchPercent, 50);
});

test('impact questions return headline numbers', async () => {
  const answer = await ask('What was his biggest measurable impact?');
  assert.equal(answer.sources[0].id, 'profile-impact');
  assert.ok(answer.bullets.some((line) => line.includes('1200')));
});

test('availability questions use the availability chunk', async () => {
  const answer = await ask('Is he available for nearshore roles?');
  assert.equal(answer.sources[0].id, 'profile-availability');
});

test('unknown input gets a guided, positive reply with suggestions and contact', async () => {
  const answer = await ask('what is the weather today');
  assert.equal(answer.confidence, 'none');
  assert.ok(answer.suggestions.length > 0);
  assert.ok(answer.bullets.some((line) => line.includes('wesley.zilva@gmail.com')));
});

test('greetings do not trigger retrieval', async () => {
  const answer = await ask('hello');
  assert.equal(answer.confidence, 'smalltalk');
});

test('retrieve ranks the Databricks project first', () => {
  assert.equal(retrieve('databricks migration')[0].chunk.id, 'project-data-modernization');
});

test('CV requests return ATS downloads that exist in public/', async () => {
  const answer = await ask('Can I get an updated CV in ATS format?');
  assert.equal(answer.downloads.length, 2);
  answer.downloads.forEach((cv) => {
    assert.ok(fs.existsSync(path.join('public', cv.fileName)), `${cv.fileName} is missing from public/`);
  });
  assert.doesNotMatch([answer.text, ...answer.bullets].join(' '), /not found|couldn't find/i);
});

test('CV requests for an IT role list the IT Coordinator CV first', async () => {
  const answer = await ask('I need his resume for an IT Coordinator role');
  assert.equal(answer.downloads[0].id, 'it-coordinator');
  const agentic = await ask('send me his resume');
  assert.equal(agentic.downloads[0].id, 'agentic-tpm');
});

test('certification and current role questions use the updated profile', async () => {
  const certs = await ask('Is he PSM certified?');
  assert.equal(certs.sources[0].id, 'profile-certifications');
  const current = await ask('What does he do currently?');
  assert.equal(current.sources[0].id, 'profile-current-role');
});

test('LatAm.AIgile brand question explains the brand without a match badge', async () => {
  const answer = await ask('What is LatAm.AIgile?');
  assert.equal(answer.sources[0].id, 'brand-latam-aigile');
  assert.equal(answer.matchPercent, null);
  assert.match(answer.text, /people/);
});

test('personal interests are presented as interests, never as CV skills', async () => {
  const cases = [
    ['Does he know n8n?', 'interest-automation'],
    ['Is he interested in healthcare or dentists?', 'interest-healthcare'],
    ['does he do trade?', 'interest-trading'],
    ['What is Wesley curious about outside work?', 'interests-overview'],
  ];
  for (const [question, expectedId] of cases) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, expectedId, question);
    assert.equal(answer.matchPercent, null, question);
    assert.doesNotMatch(answer.text, /^Yes/, question);
  }
});

test('language questions keep levels honest and mention learning goals', async () => {
  const answer = await ask('Does he speak Chinese?');
  assert.equal(answer.sources[0].id, 'profile-languages');
  assert.match(answer.text, /Elementary/);
  assert.doesNotMatch(answer.text, /^Yes/);
  assert.ok(answer.bullets.some((line) => /C2/.test(line)));
});

test('professional questions never surface personal interests as related', async () => {
  const ai = await ask('What AI projects has he delivered?');
  assert.ok(ai.sources.every((source) => source.type !== 'interest'));
  const latam = await ask('Has he worked in LATAM?');
  assert.notEqual(latam.sources[0].id, 'brand-latam-aigile');
});

const sampleQuestions = [
  'hi', 'thanks', 'teste', 'voltar', 'what is the weather today',
  'Does he know AWS?', 'he know QAWS projects?', 'service now', 'Can I get a resume?',
  'Is he available for nearshore roles?', 'How can I contact Wesley?', 'What is LatAm.AIgile?',
  'What is Wesley curious about outside work?', 'Does he speak Chinese?', 'What certifications does he hold?',
  'Does he know Databricks?', 'Tell me about the Six Sigma Empower program', 'Does he know Rust?',
];

test('every answer offers follow-up questions that differ from the one asked', async () => {
  for (const question of sampleQuestions) {
    const answer = await ask(question);
    assert.ok(answer.suggestions.length >= 2, `${question}: ${answer.suggestions.length} suggestions`);
    assert.equal(new Set(answer.suggestions).size, answer.suggestions.length, question);
    assert.ok(!answer.suggestions.includes(question), question);
  }
});

test('at least one follow-up stays in the context of the question', async () => {
  const aws = await ask('Does he know AWS?');
  assert.ok(aws.suggestions.some((item) => /vulnerability|Databricks|legacy/.test(item)), aws.suggestions.join(' | '));

  const brand = await ask('What is LatAm.AIgile?');
  assert.ok(brand.suggestions.some((item) => /AI projects|curious/.test(item)));

  const healthcare = await ask('Is Wesley interested in healthcare?');
  assert.ok(healthcare.suggestions.some((item) => /automation|curious|LatAm/.test(item)));

  const cv = await ask('Can I get an updated CV in ATS format?');
  assert.ok(cv.suggestions.some((item) => /current role|nearshore|certifications/.test(item)));
});

test('follow-ups skip questions already asked in the conversation', async () => {
  const history = ['What is his current role?', 'Is he available for nearshore roles?'];
  const answer = await askAgent('How can I contact Wesley?', { latency: 0, history });
  assert.ok(answer.suggestions.length >= 2);
  history.forEach((item) => assert.ok(!answer.suggestions.includes(item), item));
});

test('every suggested follow-up question is answerable from the CV', async () => {
  for (const question of [...allFollowUpQuestions, ...suggestedQuestions]) {
    const answer = await ask(question);
    assert.notEqual(answer.confidence, 'none', question);
    assert.ok(answer.sources.length > 0, question);
  }
});

test('education answers lead with the electrical engineering degree', async () => {
  for (const question of ['What is his education?', 'Does he have an electrical engineering degree?']) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, 'profile-education', question);
    assert.match(answer.text, /Electrical Engineering/);
  }
  const interest = await ask('Is he interested in electrical engineering and AI?');
  assert.equal(interest.sources[0].id, 'interest-engineering-ai');
  assert.equal(interest.matchPercent, null);
});

test('EdTech, teaching programming and gamification are grounded in real evidence', async () => {
  for (const question of ['Does he have EdTech experience?', 'Does he teach programming?', 'gamification']) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, 'profile-edtech', question);
    assert.doesNotMatch(answer.text, /^Yes/, question);
    assert.ok(answer.bullets.some((line) => /XBot/.test(line)), question);
    assert.ok(answer.bullets.some((line) => /gamified/i.test(line)), question);
  }
});

test('calendar and scheduling questions explain how to book time without inventing links', async () => {
  for (const question of ['calendar', 'How can I schedule an interview with Wesley?', 'Is he available for a call next week?']) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, 'profile-calendar', question);
    assert.ok(answer.bullets.some((line) => /wesley\.zilva@gmail\.com/.test(line)), question);
    assert.ok(answer.bullets.every((line) => !/calendly|zoom\.us|meet\.google/i.test(line)), question);
  }
  const plain = await ask('Is he available?');
  assert.equal(plain.sources[0].id, 'profile-availability');
});

test('compensation and start date questions point to a direct conversation', async () => {
  for (const question of ['What are his salary expectations?', 'What is his notice period?', 'When can he start?']) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, 'profile-compensation', question);
    assert.doesNotMatch(answer.text, /\$|R\$|\d{2,}k/i, question);
  }
});

test('agentic questions summarize what Wesley knows and the related projects', async () => {
  for (const question of ['What does he know about agentic delivery?', 'agentic projects']) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, 'profile-agentic', question);
    for (const needle of [/MCP/, /Claude/, /LegalTech/, /askToTPM_agentic/, /LatAm\.AIgile/]) {
      assert.ok(answer.bullets.some((line) => needle.test(line)), `${question}: ${needle}`);
    }
  }
});

const tpmExpectations = {
  'What are his key career milestones?': 'tpm-milestones-career',
  'How does he plan and track project milestones?': 'tpm-planning-milestones',
  'How does he manage stakeholders?': 'tpm-stakeholders',
  'How does he handle conflict with stakeholders?': 'tpm-stakeholders',
  'How does he handle risks and dependencies?': 'tpm-risk-dependencies',
  'What happens when a project slips behind schedule?': 'tpm-risk-dependencies',
  'Which delivery metrics does he report?': 'tpm-metrics',
  'How does he measure success?': 'tpm-metrics',
  'How does he prioritize and handle trade-offs?': 'tpm-prioritization',
  'How does he lead teams and vendors?': 'tpm-team-leadership',
  'Is he a good fit for a Technical Program Manager role?': 'tpm-role-fit',
  'Tell me about a time he delivered under a hard deadline': 'tpm-star-story',
  'What is his biggest challenge?': 'tpm-star-story',
  'How does he keep agentic delivery safe and governed?': 'tpm-agentic-governance',
  'How does he handle hallucinations and guardrails for AI agents?': 'tpm-agentic-governance',
  'Tell me about yourself': 'profile-summary',
};

test('typical TPM interview questions land on the right answer', async () => {
  for (const [question, expectedId] of Object.entries(tpmExpectations)) {
    const answer = await ask(question);
    assert.equal(answer.sources[0].id, expectedId, question);
    assert.notEqual(answer.confidence, 'none', question);
    assert.equal(answer.matchPercent, null, `${question} should not show a fit badge`);
  }
});

test('TPM answers cite concrete evidence from the CV', async () => {
  const stakeholders = await ask('How does he manage stakeholders?');
  assert.ok(stakeholders.bullets.some((line) => /C-level OKRs/.test(line)));
  const milestones = await ask('What are his key career milestones?');
  assert.ok(milestones.bullets.length >= 5);
  assert.ok(milestones.bullets.some((line) => /Agentic Product Owner/.test(line)));
  const story = await ask('Tell me about a time he delivered under a hard deadline');
  assert.ok(story.bullets.some((line) => /1200 to 300/.test(line)));
});

test('TPM follow-ups chain into each other so a screening call can keep going', async () => {
  const stakeholders = await ask('How does he manage stakeholders?');
  assert.ok(stakeholders.suggestions.some((item) => /metrics|risks|lead teams/.test(item)), stakeholders.suggestions.join(' | '));
  const planning = await ask('How does he plan and track project milestones?');
  assert.ok(planning.suggestions.some((item) => /risks|stakeholders|metrics/.test(item)), planning.suggestions.join(' | '));
});

test('the opening chips lead with the questions a TPM hiring manager asks first', () => {
  assert.deepEqual(suggestedQuestions.slice(0, 2), ['What are his key career milestones?', 'How does he manage stakeholders?']);
  assert.ok(suggestedQuestions.includes('Is he a good fit for a Technical Program Manager role?'));
});
