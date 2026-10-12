'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function worker() {
  const messages = [];
  const context = vm.createContext({ postMessage: message => messages.push(structuredClone(message)) });
  context.self = context;
  for (const file of ['column.js', 'experiments.js', 'experiments-worker.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../src', file), 'utf8'), context, { filename: file });
  }
  return { context, messages };
}
function finiteNumbers(value) {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), 'all reported numbers must be finite');
  else if (value && typeof value === 'object') for (const child of Object.values(value)) finiteNumbers(child);
}

test('worker produces two actual same-seed comparisons with complete trajectories and finite messages', () => {
  const { context, messages } = worker();
  const config = { seed: 21, repeats: 2, steps: 100, factor: 'predators' };
  context.onmessage({ data: { config } });
  assert.equal(messages.filter(message => message.type === 'error').length, 0);
  assert.equal(messages.filter(message => message.type === 'done').length, 1);
  assert.equal(messages.filter(message => message.type === 'replicate').length, 2);
  const done = messages.at(-1);
  assert.equal(done.type, 'done');
  assert.deepEqual(done.runs.map(run => run.seed), [21, 22]);
  assert.equal(done.summary.n, config.repeats);
  for (const run of done.runs) for (const arm of ['a', 'b']) {
    assert.equal(run[arm].step, config.steps);
    assert.equal(run[arm].trajectory[0].step, 0);
    assert.equal(run[arm].trajectory[0].cells, 420);
    assert.equal(run[arm].trajectory.at(-1).step, run[arm].step);
    const { trajectory, ...endpoint } = run[arm];
    assert.deepEqual(trajectory.at(-1), endpoint);
  }
  const progress = messages.filter(message => message.type === 'progress');
  assert.equal(progress.length, 10);
  for (const message of progress) {
    assert.equal(message.total, config.steps);
    assert.equal(message.repeats, config.repeats);
    assert.ok(message.repeat >= 1 && message.repeat <= config.repeats);
    assert.ok(message.step >= 1 && message.step <= config.steps);
  }
  messages.forEach(finiteNumbers);
  assert.deepEqual(config, { seed: 21, repeats: 2, steps: 100, factor: 'predators' });
});

test('worker rejects invalid configuration without a done message', () => {
  const { context, messages } = worker();
  context.onmessage({ data: { config: { seed: 0, repeats: 2, steps: 100, factor: 'predators' } } });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].type, 'error');
  assert.match(messages[0].message, /seed/);
  assert.ok(!messages.some(message => message.type === 'done'));
});

test('worker keeps the real extinction step in trajectories and stops extinct engines', () => {
  const { context, messages } = worker();
  vm.runInContext(`
    const originalCreatePair = GenesisExperiments.createPair;
    GenesisExperiments.createPair = (config, repeat) => {
      const pair = originalCreatePair(config, repeat);
      for (const arm of ['a', 'b']) {
        pair[arm].step = function () {
          this.t++;
          if (this.t >= (arm === 'a' ? 3 : 5)) { this.cells.length = 0; this.colonies.clear(); }
        };
      }
      return pair;
    };
  `, context);
  context.onmessage({ data: { config: { seed: 21, repeats: 1, steps: 100, factor: 'light' } } });
  const done = messages.at(-1);
  assert.equal(done.type, 'done');
  assert.equal(done.summary.a.extinctions, 1);
  assert.equal(done.summary.b.extinctions, 1);
  for (const arm of ['a', 'b']) {
    const result = done.runs[0][arm];
    assert.equal(result.step, arm === 'a' ? 3 : 5);
    assert.equal(result.trajectory.at(-1).step, result.step);
    assert.ok(result.trajectory.every(point => point.step <= result.step));
    assert.equal(result.trajectory.at(-1).cells, 0);
  }
  messages.forEach(finiteNumbers);
});
