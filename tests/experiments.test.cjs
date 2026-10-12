'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const experiments = require('../src/experiments.js');
const config = { seed: 21, repeats: 2, steps: 100, factor: 'predators' };

test('paired arms have identical algae and RNG initialization, with only the chosen option differing', () => {
  for (const factor of Object.keys(experiments.FACTORS)) {
    const pair = experiments.createPair({ ...config, factor });
    assert.equal(pair.a._rs, pair.b._rs);
    const algae = sim => sim.cells.map(cell => [cell.id, cell.x, cell.z, cell.b, Array.from(cell.g)]);
    assert.deepEqual(algae(pair.a), algae(pair.b));
    assert.deepEqual(Array.from(pair.a.C), Array.from(pair.b.C));
    assert.deepEqual(Object.keys(pair.a.p).filter(key => pair.a.p[key] !== pair.b.p[key]), [factor]);
    assert.equal(pair.b.p[factor], experiments.FACTORS[factor].b);
    if (factor === 'predators') {
      assert.ok(pair.a.preds.length > 0);
      assert.equal(pair.b.preds.length, 0);
    }
  }
});

test('rerunning the same paired experiment reproduces outcomes and samples current state', () => {
  const run = () => {
    const pair = experiments.createPair(config);
    for (let i = 0; i < config.steps; i++) { pair.a.step(); pair.b.step(); }
    return { seed: pair.seed, a: experiments.sample(pair.a), b: experiments.sample(pair.b) };
  };
  assert.deepEqual(run(), run());
  const pair = experiments.createPair(config);
  pair.a.stats = { n: -1 };
  assert.equal(experiments.sample(pair.a).cells, 420);
});

test('extinction cannot retain stale population or gene measures', () => {
  const pair = experiments.createPair(config);
  pair.a.cells.length = 0;
  pair.a.colonies.clear();
  const point = experiments.sample(pair.a);
  assert.equal(point.extinct, true);
  for (const key of ['cells', 'inGroups', 'adhesion', 'meanSize']) assert.equal(point[key], 0);
});

test('extra sampling leaves dynamics and the random stream unchanged', () => {
  const observed = experiments.createPair(config), unobserved = experiments.createPair(config);
  for (let step = 0; step < 100; step++) {
    for (const arm of ['a', 'b']) {
      observed[arm].step();
      unobserved[arm].step();
      experiments.sample(observed[arm]);
    }
  }
  for (const arm of ['a', 'b']) {
    assert.equal(observed[arm]._rs, unobserved[arm]._rs);
    assert.deepEqual(experiments.sample(observed[arm]), experiments.sample(unobserved[arm]));
    const physical = sim => sim.cells.map(cell => [cell.id, cell.x, cell.z, cell.b, Array.from(cell.g), cell.bonds.map(other => other.id)]);
    assert.deepEqual(physical(observed[arm]), physical(unobserved[arm]));
    assert.deepEqual(Array.from(observed[arm].C), Array.from(unobserved[arm].C));
  }
});

test('summary includes extinct runs and reports observed transitions and paired uncertainty', () => {
  const point = { step: 100, cells: 10, inGroups: 0.1, adhesion: 0.2, meanSize: 1, gape: 13, generations: 2, extinct: false };
  const runs = [
    { seed: 21, a: { ...point }, b: { ...point, cells: 20, inGroups: 0.6 } },
    { seed: 22, a: { ...point }, b: { ...point, cells: 0, inGroups: 0, adhesion: 0, meanSize: 0, extinct: true,
      trajectory: [{ ...point, step: 20, inGroups: 0.8 }] } },
  ];
  const result = experiments.summarize(runs);
  assert.equal(result.n, 2);
  assert.equal(result.b.extinctions, 1);
  assert.equal(result.b.transitions, 2);
  assert.equal(result.b.means.cells, 10);
  assert.deepEqual(result.difference.cells, { mean: 0, min: -10, max: 10, se: 10 });
  assert.equal(experiments.summarize(runs.slice(0, 1)).difference.cells.se, null);
  assert.equal(experiments.summarize([]).difference.cells.mean, null);
  const record = { config, runs };
  const csv = experiments.toCSV(record);
  assert.equal(csv.split('\r\n').length, 6);
  assert.match(csv, /"requestedSteps"/);
  assert.match(csv, /"observedTransition"/);
  assert.equal(experiments.toCSV(record), csv);
  assert.ok(experiments.toCSV({ ...record, model: '=1+1' }).includes('"\'=1+1"'));
});

test('configuration, repeat bounds and invalid samples are rejected before execution or export', () => {
  for (const change of [{ seed: 0 }, { seed: 2147483647 }, { seed: '21' }, { repeats: 0 }, { repeats: 13 },
    { steps: 99 }, { steps: 36001 }, { steps: NaN }, { factor: 'constructor' }, { factor: 'unknown' }]) {
    assert.throws(() => experiments.createPair({ ...config, ...change }));
  }
  assert.throws(() => experiments.validateConfig(null));
  assert.throws(() => experiments.createPair(config, 2));
  assert.equal(experiments.createPair({ ...config, seed: 2147483646 }, 1).seed, 1);
  assert.throws(() => experiments.summarize(Array(13).fill({})));
  const pair = experiments.createPair(config);
  const point = experiments.sample(pair.a);
  assert.throws(() => experiments.summarize([{ seed: 21, a: point, b: { ...point, cells: NaN } }]));
  assert.throws(() => experiments.toCSV({ config, runs: [{ seed: 21, a: point, b: point }], model: 'x'.repeat(81) }));
});
