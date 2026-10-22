import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { askAgent, retrieve, tokenize } from './agent.js';
import { knowledgeBase } from './knowledge.js';

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
