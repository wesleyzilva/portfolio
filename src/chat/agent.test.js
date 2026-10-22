import test from 'node:test';
import assert from 'node:assert/strict';
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
