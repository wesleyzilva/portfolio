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

test('"he know QAWS projects?" finds AWS and flags missing QA evidence', async () => {
  const answer = await ask('he know QAWS projects?');
  assert.equal(answer.confidence, 'partial');
  assert.ok(answer.sources.some((source) => source.id.startsWith('skills-cloud')));
  assert.ok(answer.bullets.some((line) => /Not found in the CV.*QA/.test(line)));
});

test('tool questions answer from the skills chunk with a yes', async () => {
  const answer = await ask('Does he know AWS?');
  assert.match(answer.text, /^Yes\./);
  assert.ok(answer.bullets.some((line) => line.includes('AWS')));
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

test('unknown topics fall back instead of guessing', async () => {
  const answer = await ask('what is the weather today');
  assert.equal(answer.confidence, 'none');
  assert.equal(answer.sources.length, 0);
});

test('greetings do not trigger retrieval', async () => {
  const answer = await ask('hello');
  assert.equal(answer.confidence, 'smalltalk');
});

test('retrieve ranks the Databricks project first', () => {
  assert.equal(retrieve('databricks migration')[0].chunk.id, 'project-data-modernization');
});
