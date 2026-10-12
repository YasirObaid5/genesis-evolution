'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const ColumnAPI = require('../src/column.js');
const OriginsAPI = require('../src/origins.js');
const { Sim } = require('../src/core.js');
const { Column } = ColumnAPI;
const { Origins } = OriginsAPI;

for (const [name, Engine, options] of [
  ['column', Column, { predators: true }],
  ['origins', Origins, { predators: true }],
  ['herd', Sim, {}],
]) {
  test(`${name}: seeded runs are repeatable and different seeds diverge`, () => {
    const a = new Engine(42, options), b = new Engine(42, options), other = new Engine(43, options);
    for (let i = 0; i < 40; i++) { a.step(); b.step(); other.step(); }
    const state = sim => ({
      stats: sim.computeStats(),
      individuals: (sim.cells || sim.agents).map(c => [c.id, c.x, c.y ?? c.z, c.g || c.a, c.e ?? c.b ?? c.energy]),
      predators: (sim.preds || []).map(p => [p.x, p.y ?? p.z, p.gape, p.e]),
    });
    assert.deepEqual(state(a), state(b));
    assert.notDeepEqual(state(a), state(other));
  });
}

test('column: sparse populations permit zero or one predator and zero pressure prevents attacks', () => {
  const sim = new Column(42, { predRatio: 3 });
  sim.cells = sim.cells.slice(0, 5);
  assert.equal(sim.predTarget(), 0);
  sim.stepPredators([]);
  assert.equal(sim.preds.length, 0);
  sim.p.predRatio = 20;
  assert.equal(sim.predTarget(), 1);
  sim.stepPredators([]);
  assert.equal(sim.preds.length, 1);
  sim.p.predRatio = 0;
  const before = sim.eaten;
  sim.stepPredators([]);
  assert.equal(sim.preds.length, 0);
  assert.equal(sim.eaten, before);
  sim.p.predRatio = 100;
  sim.p.predators = false;
  assert.equal(sim.predTarget(), 0);
});

test('gape macro-mutations are symmetric in log space in both engines', () => {
  for (const [Engine, stepSize] of [[Column, 0.25], [Origins, 0.5]]) {
    const changes = [];
    for (const signDraw of [0.25, 0.75]) {
      const sim = new Engine(42, { predators: true, predRatio: 200 / 420 });
      sim.t = 60;
      const parent = sim.makePred(200, 500, 100, 10);
      parent.digest = 100;
      sim.preds = [parent];
      if (Engine === Column) {
        const hungry = sim.makePred(300, 500, 100, 0);
        hungry.digest = 100;
        sim.preds.push(hungry);
      }
      const draws = [0, signDraw];
      sim.g = () => 0;
      sim.rnd = () => draws.length ? draws.shift() : 0.5;
      sim.stepPredators([]);
      const child = sim.preds.find(p => p.id !== parent.id);
      const change = Math.log(child.gape / parent.gape);
      assert.ok(Math.abs(change - (signDraw < 0.5 ? stepSize : -stepSize)) < 1e-12);
      changes.push(change);
    }
    assert.ok(Math.abs(changes[0] + changes[1]) < 1e-12);
  }
});

test('column: prey capture window is bounded, peaks at half gape and rejects oversized prey', () => {
  const sim = new Column(42);
  assert.equal(sim.captureEfficiency(0, 100), 0);
  assert.equal(sim.captureEfficiency(100, 100), 0);
  assert.equal(sim.captureEfficiency(110, 100), 0);
  assert.equal(sim.captureEfficiency(50, 100), 1);
  assert.ok(sim.captureEfficiency(5, 100) < 0.04);
  for (let diameter = 0; diameter <= 120; diameter++) {
    const efficiency = sim.captureEfficiency(diameter, 100);
    assert.ok(efficiency >= 0 && efficiency <= 1);
  }
});

test('column: failed capture costs handling time and a successful capture is counted once', () => {
  for (const [gape, expectedMeals] of [[200, 0], [20, 1]]) {
    const sim = new Column(42, { predRatio: 100 });
    const cell = sim.cells[0], col = cell.col;
    sim.cells = [cell]; sim.colonies = new Map([[col.id, col]]);
    col.cx = cell.x = 200; col.cz = cell.z = 500;
    sim.preds = [sim.makePred(200, 500, gape, 1)];
    sim.rnd = () => 0.5;
    sim.t = 1;
    const deaths = [];
    sim.stepPredators(deaths);
    assert.equal(deaths.length, expectedMeals);
    assert.equal(sim.eaten, expectedMeals);
    assert.equal(sim.preds[0].digest, expectedMeals ? 43 : 4);
    assert.ok(sim.preds[0].e < (expectedMeals ? 1.18 : 1));
    sim.preds[0].digest = 0;
    sim.stepPredators(deaths);
    assert.equal(sim.eaten, expectedMeals);
  }
});

test('column: climate returns toward reference conditions and reflects within its bounds', () => {
  const sim = new Column(42);
  const bounds = [['light', 1, 0.4, 1.4], ['turbidity', 0.0012, 0.0004, 0.002], ['nutrient', 1, 0.5, 1.6], ['predRatio', 3, 0, 5]];
  sim.g = () => 0; sim.rnd = () => 0.5;
  for (const side of [2, 3]) {
    for (const [key, , lo, hi] of bounds) sim.p[key] = side === 2 ? lo : hi;
    const before = { ...sim.p };
    sim.climate();
    for (const [key, mean] of bounds) assert.ok(Math.abs(sim.p[key] - mean) < Math.abs(before[key] - mean));
  }
  sim.g = () => 20;
  for (let i = 0; i < 30; i++) {
    sim.climate();
    for (const [key, , lo, hi] of bounds) assert.ok(sim.p[key] > lo && sim.p[key] < hi);
  }
  const before = { ...sim.p };
  sim.climate(0);
  assert.deepEqual(sim.p, before);
  assert.throws(() => sim.climate(-1), RangeError);
  assert.throws(() => sim.climate(Infinity), RangeError);
});

test('column: legacy schema v1 snapshots load and continue with finite state', () => {
  const original = new Column(42, { predators: true });
  for (let i = 0; i < 20; i++) original.step();
  const legacy = JSON.parse(JSON.stringify(original.serialize()));
  delete legacy.modelVersion;
  assert.equal(legacy.v, 1);
  const resumed = Column.fromState(legacy);
  assert.equal(resumed.t, original.t);
  assert.equal(resumed.cells.length, original.cells.length);
  for (let i = 0; i < 30; i++) resumed.step();
  for (const c of resumed.cells) {
    assert.ok([c.x, c.z, c.b, ...c.g].every(Number.isFinite));
    assert.ok(c.x >= 0 && c.x < ColumnAPI.LX && c.z >= 0 && c.z <= ColumnAPI.LZ);
  }
  assert.ok(Array.from(resumed.C).every(Number.isFinite));
  assert.equal(resumed.serialize().modelVersion, '2');
  assert.equal(ColumnAPI.MODEL_VERSION, '2');
  assert.equal(OriginsAPI.MODEL_VERSION, '2');
});
