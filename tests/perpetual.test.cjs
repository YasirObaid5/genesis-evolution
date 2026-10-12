'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const zlib = require('node:zlib');
const { spawnSync } = require('node:child_process');
const { MODEL_VERSION } = require('../src/column.js');
const runner = path.join(__dirname, '../runner/perpetual.mjs');
const json = (dir, name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
const writeJSON = (dir, name, data) => fs.writeFileSync(path.join(dir, name), JSON.stringify(data));
const state = dir => JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'state.json.gz'))));
const writeState = (dir, data) => fs.writeFileSync(path.join(dir, 'state.json.gz'), zlib.gzipSync(JSON.stringify(data)));
function run(dir) { return spawnSync(process.execPath, [runner], { env: { ...process.env, DATA_DIR: dir, MINUTES: '0', CLIMATE: 'off' }, encoding: 'utf8', timeout: 20000 }); }
function temporary(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'genesis-perpetual-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
function create(dir) { const result = run(dir); assert.equal(result.status, 0, result.stderr); }

test('zero-budget create and current-model resume retain the world and stamp model provenance', t => {
  const dir = temporary(t);
  create(dir);
  const first = json(dir, 'meta.json'), initial = state(dir);
  assert.equal(first.modelVersion, MODEL_VERSION);
  assert.deepEqual(first.modelChanges, []);
  assert.equal(initial.modelVersion, MODEL_VERSION);
  assert.equal(first.runs, 1);
  assert.equal(first.stepsTotal, 0);
  create(dir);
  const resumed = json(dir, 'meta.json'), summary = json(dir, 'summary.json');
  assert.equal(resumed.runs, 2);
  assert.equal(resumed.started, first.started);
  assert.deepEqual(resumed.eras, first.eras);
  assert.equal(state(dir).seed, initial.seed);
  assert.equal(state(dir).cells.length, initial.cells.length);
  assert.equal(summary.modelVersion, MODEL_VERSION);
  assert.deepEqual(summary.modelChanges, []);
  assert.ok(fs.readdirSync(dir).every(name => !name.includes('.tmp-')));
});

test('legacy resume records one version boundary without resetting counters or existing records', t => {
  const dir = temporary(t);
  create(dir);
  const meta = json(dir, 'meta.json'), saved = state(dir);
  delete meta.modelVersion; delete meta.modelChanges; delete saved.modelVersion;
  meta.stepsTotal = 1234; meta.gensPast = 9; meta.bornPast = 17;
  meta.records.maxSize = 23; saved.counters.gens = 0.25;
  writeJSON(dir, 'meta.json', meta); writeState(dir, saved);
  const oldHistory = [{ era: 1, s: 1234, n: 420 }], oldFossils = [{ era: 1, n: 23 }], oldMilestones = [{ era: 1, key: 'ms_first8' }];
  writeJSON(dir, 'history.json', oldHistory); writeJSON(dir, 'fossils.json', oldFossils); writeJSON(dir, 'milestones.json', oldMilestones);
  create(dir);
  const next = json(dir, 'meta.json'), summary = json(dir, 'summary.json');
  assert.equal(next.modelChanges.length, 1);
  assert.deepEqual({ ...next.modelChanges[0], at: null }, { from: 'legacy', to: MODEL_VERSION, step: 1234, generations: 9.25, at: null });
  assert.ok(Number.isFinite(Date.parse(next.modelChanges[0].at)));
  assert.equal(next.stepsTotal, 1234); assert.equal(next.gensPast, 9); assert.equal(next.bornPast, 17);
  assert.equal(next.records.maxSize, 23);
  assert.deepEqual(next.eras, meta.eras);
  assert.deepEqual(json(dir, 'history.json'), oldHistory);
  assert.deepEqual(json(dir, 'fossils.json'), oldFossils);
  assert.deepEqual(json(dir, 'milestones.json'), oldMilestones);
  assert.deepEqual(summary.modelChanges, next.modelChanges);
  create(dir);
  assert.equal(json(dir, 'meta.json').modelChanges.length, 1);
});

test('an explicit previous model version is retained in the boundary', t => {
  const dir = temporary(t); create(dir);
  const meta = json(dir, 'meta.json'), saved = state(dir);
  meta.modelVersion = '1'; saved.modelVersion = '1';
  writeJSON(dir, 'meta.json', meta); writeState(dir, saved);
  create(dir);
  assert.equal(json(dir, 'meta.json').modelChanges[0].from, '1');
});

test('malformed or incomplete checkpoints abort without overwriting any existing file', t => {
  for (const damage of ['meta.json', 'history.json', 'state.json.gz', 'missing-meta', 'missing-state', 'missing-both', 'inconsistent-step']) {
    const dir = temporary(t); create(dir);
    if (damage === 'missing-both') { fs.unlinkSync(path.join(dir, 'meta.json')); fs.unlinkSync(path.join(dir, 'state.json.gz')); }
    else if (damage.startsWith('missing-')) fs.unlinkSync(path.join(dir, damage === 'missing-meta' ? 'meta.json' : 'state.json.gz'));
    else if (damage === 'inconsistent-step') { const saved = state(dir); saved.t++; writeState(dir, saved); }
    else fs.writeFileSync(path.join(dir, damage), 'not valid JSON or gzip');
    const before = Object.fromEntries(fs.readdirSync(dir).map(name => [name, fs.readFileSync(path.join(dir, name))]));
    const result = run(dir);
    assert.notEqual(result.status, 0, damage);
    assert.deepEqual(fs.readdirSync(dir).sort(), Object.keys(before).sort(), damage);
    for (const [name, bytes] of Object.entries(before)) assert.deepEqual(fs.readFileSync(path.join(dir, name)), bytes, damage + ': ' + name);
  }
});
