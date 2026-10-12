const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { pathToFileURL } = require('node:url');
const api = import('../runner/laws.mjs');

function temporaryDirectory(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'genesis-laws-test-'));
  t.after(() => { for (const name of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, name)); fs.rmdirSync(dir); });
  return dir;
}

test('extinct runs remain in transition denominators and collapse totals', async () => {
  const { summarizeEvidence, MODEL_VERSION, PROTOCOL_VERSION } = await api;
  const row = r => ({ modelVersion: MODEL_VERSION, protocolVersion: PROTOCOL_VERSION, ...r });
  const summary = summarizeEvidence({ predation: [
    row({ predators: true, transition: true, extinct: true, collapse: true, gapeCrossedBeforeCollapse: true, gapeRatio: 1.2 }),
    row({ predators: true, transition: false, extinct: true }),
    row({ predators: true, transition: true, extinct: false, collapse: false }),
    row({ predators: false, transition: false, extinct: true }),
    row({ predators: false, transition: false, extinct: false }),
  ] });
  const predation = summary.laws.find(l => l.id === 'predation');
  assert.deepEqual(predation.withPred, { n: 3, transitions: 2, extinct: 2, frac: 0.67 });
  assert.deepEqual(predation.without, { n: 2, transitions: 0, extinct: 1, frac: 0 });
  const redqueen = summary.laws.find(l => l.id === 'redqueen');
  assert.equal(redqueen.transitions, 2);
  assert.equal(redqueen.collapses, 1);
  assert.equal(redqueen.preceded, 1);
  assert.equal(redqueen.extinct, 1);
});

test('collapse does not imply a gape crossing, and crossing must precede it', async () => {
  const { summarizePredation } = await api;
  const start = [[0, 0, 0.1, 8, 10], [500, 0.6, 0.2, 10, 20]];
  const crossed = summarizePredation([...start, [1000, 0.7, 0.3, 21, 20], [1500, 0.1, 0.2, 22, 10], [2000, 0.9, 0.4, 15, 30]]);
  assert.equal(crossed.collapseAt, 1500);
  assert.equal(crossed.gapeCrossingAt, 1000);
  assert.equal(crossed.gapeCrossedBeforeCollapse, true);
  assert.equal(crossed.gapeRatio, 1.05);
  assert.equal(crossed.peak, 0.9);
  const sameSample = summarizePredation([...start, [1000, 0.1, 0.2, 30, 10]]);
  assert.equal(sameSample.collapse, true);
  assert.equal(sameSample.gapeCrossedBeforeCollapse, false);
  const neverCrossed = summarizePredation([...start, [1000, 0.7, 0.3, 15, 40], [1500, 0.1, 0.2, 10, 15]]);
  assert.equal(neverCrossed.gapeCrossedBeforeCollapse, false);
  assert.equal(neverCrossed.gapeRatio, 0.38);
  assert.equal(summarizePredation([]).transition, false);
});

test('redqueen support counts observed crossings, not simply collapses', async () => {
  const { summarizeEvidence, MODEL_VERSION, PROTOCOL_VERSION } = await api;
  const rows = Array.from({ length: 3 }, () => ({ modelVersion: MODEL_VERSION, protocolVersion: PROTOCOL_VERSION,
    predators: true, transition: true, collapse: true, gapeCrossedBeforeCollapse: false }));
  const law = summarizeEvidence({ predation: rows }).laws.find(l => l.id === 'redqueen');
  assert.equal(law.collapses, 3);
  assert.equal(law.preceded, 0);
  assert.equal(law.verdict, 'not general');
  assert.equal(law.gapeRatio, null);
});

test('legacy and different-version evidence is retained but not pooled', async () => {
  const { summarizeEvidence, MODEL_VERSION, PROTOCOL_VERSION } = await api;
  const raw = { predation: [
    { predators: true, transition: true },
    { modelVersion: 'old', protocolVersion: PROTOCOL_VERSION, predators: true, transition: true },
    { modelVersion: MODEL_VERSION, protocolVersion: 'old', predators: true, transition: true },
    { modelVersion: MODEL_VERSION, protocolVersion: PROTOCOL_VERSION, predators: true, transition: false, extinct: true },
  ] };
  const before = JSON.stringify(raw), summary = summarizeEvidence(raw);
  assert.equal(JSON.stringify(raw), before);
  assert.deepEqual(summary.counts, { predation: 1 });
  assert.deepEqual(summary.historicalCounts, { predation: 3 });
  assert.equal(summary.laws.find(l => l.id === 'predation').withPred.frac, 0);
  assert.equal(summary.modelVersion, MODEL_VERSION);
  assert.equal(summary.protocolVersion, PROTOCOL_VERSION);
});

test('breeding mode, target and criterion use independent random draws', async () => {
  const { herdDesign } = await api;
  const combinations = new Set();
  for (const mode of [0.1, 0.9]) for (let target = 0; target < 6; target++) for (const criterion of [0.1, 0.9]) {
    const draws = [mode, (target + 0.5) / 6, criterion];
    const d = herdDesign(() => draws.shift());
    assert.equal(d.target, target);
    assert.equal(draws.length, 0);
    combinations.add(`${d.mode}:${d.target}:${d.criterion}`);
  }
  assert.equal(combinations.size, 24);
});

test('malformed existing evidence aborts before touching either file', async t => {
  const { readRaw, runLaws } = await api;
  const dir = temporaryDirectory(t), rawPath = path.join(dir, 'laws-raw.json'), summaryPath = path.join(dir, 'laws.json');
  assert.deepEqual(readRaw(rawPath), {});
  for (const broken of ['{"predation":', '{"predation":{}}', 'null', '[{}]', '{"predation":[null]}']) {
    fs.writeFileSync(rawPath, broken); fs.writeFileSync(summaryPath, 'original summary');
    assert.throws(() => runLaws({ dataDir: dir, minutes: 0 }));
    assert.equal(fs.readFileSync(rawPath, 'utf8'), broken);
    assert.equal(fs.readFileSync(summaryPath, 'utf8'), 'original summary');
    assert.equal(fs.readdirSync(dir).length, 2);
  }
});

test('import has no side effects; zero-minute refresh preserves raw legacy rows', async t => {
  const dir = temporaryDirectory(t), file = path.resolve(__dirname, '../runner/laws.mjs');
  execFileSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(pathToFileURL(file).href)});`],
    { env: { ...process.env, DATA_DIR: dir, MINUTES: '999' }, timeout: 3000 });
  assert.deepEqual(fs.readdirSync(dir), []);
  const legacy = { predation: [{ seed: 123, transition: true, predators: true, extinct: false }] };
  fs.writeFileSync(path.join(dir, 'laws-raw.json'), JSON.stringify(legacy));
  execFileSync(process.execPath, [file], { env: { ...process.env, DATA_DIR: dir, MINUTES: '0' }, timeout: 3000 });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'laws-raw.json'), 'utf8')), legacy);
  const summary = JSON.parse(fs.readFileSync(path.join(dir, 'laws.json'), 'utf8'));
  assert.equal(summary.historicalCounts.predation, 1);
  assert.equal(summary.counts.predation, 0);
  assert.deepEqual(fs.readdirSync(dir).sort(), ['laws-raw.json', 'laws.json']);
});
