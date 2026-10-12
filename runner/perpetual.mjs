// ===================================================================
// GENESIS · perpetual run
// Resumes the water column from its last checkpoint, lets it evolve for a
// time budget, then writes the checkpoint and a public record:
//   data/state.json.gz   full simulation state (resume point)
//   data/meta.json       run bookkeeping (eras, totals, records)
//   data/history.json    long-term time series (thinned as it grows)
//   data/fossils.json    snapshots of the largest organisms ever seen
//   data/milestones.json first time each milestone was reached, per era
//   data/summary.json    small file the website reads first
// Usage: MINUTES=20 DATA_DIR=data node runner/perpetual.mjs
// ===================================================================
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { Column, MODEL_VERSION, ADH, SOMA, SWIM, BOND, BUOY, DT } = require('../src/column.js');

const DATA = process.env.DATA_DIR || 'data';
const MINUTES = +(process.env.MINUTES || 20);
const CLIMATE = process.env.CLIMATE !== 'off';
if (!Number.isFinite(MINUTES) || MINUTES < 0) throw new Error('MINUTES must be a finite nonnegative number');
fs.mkdirSync(DATA, { recursive: true });

const readJSON = (f, d) => {
  try { return JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') return d; throw new Error(`Cannot read ${f}; existing world left unchanged`, { cause: error }); }
};
function writeFile(f, data) {
  const target = path.join(DATA, f), temporary = target + '.tmp-' + process.pid;
  try { fs.writeFileSync(temporary, data); fs.renameSync(temporary, target); }
  finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
const writeJSON = (f, v) => writeFile(f, JSON.stringify(v));

const now = () => new Date().toISOString();
let meta = readJSON('meta.json', null);
let sim;
const stPath = path.join(DATA, 'state.json.gz');
const hasMeta = fs.existsSync(path.join(DATA, 'meta.json')), hasState = fs.existsSync(stPath);
if (hasMeta !== hasState) throw new Error('Incomplete world checkpoint: meta.json and state.json.gz must both exist');
const history = readJSON('history.json', []);
let fossils = readJSON('fossils.json', []);
const milestones = readJSON('milestones.json', []);
if (![history, fossils, milestones].every(Array.isArray)) throw new Error('Invalid world records: expected arrays');
if (!hasMeta && ([history, fossils, milestones].some(rows => rows.length) || fs.existsSync(path.join(DATA, 'summary.json')))) throw new Error('World records exist without their checkpoint');
if (hasMeta) {
  if (!meta || !Number.isInteger(meta.era) || meta.era < 1 || !Array.isArray(meta.eras) || !meta.eras.length ||
      !meta.records || typeof meta.records !== 'object' || !['runs', 'stepsTotal', 'gensPast', 'bornPast', 'wallSeconds'].every(key => Number.isFinite(meta[key]) && meta[key] >= 0) ||
      (meta.modelChanges !== undefined && !Array.isArray(meta.modelChanges))) throw new Error('Invalid world metadata');
  const st = JSON.parse(zlib.gunzipSync(fs.readFileSync(stPath)).toString('utf8'));
  if (!st || st.v !== 1 || !Number.isInteger(st.t) || st.t < 0 || meta.eras[meta.eras.length - 1].steps !== st.t) throw new Error('Invalid or inconsistent world checkpoint');
  if (meta.modelVersion !== undefined && st.modelVersion !== undefined && meta.modelVersion !== st.modelVersion) throw new Error('Checkpoint model versions disagree');
  sim = Column.fromState(st);
  meta.modelChanges ||= [];
  const previousModel = st.modelVersion === undefined ? 'legacy' : st.modelVersion;
  if (previousModel !== MODEL_VERSION) meta.modelChanges.push({ from: previousModel, to: MODEL_VERSION,
    step: meta.stepsTotal, generations: meta.gensPast + sim.gens, at: now() });
  console.log(`resumed era ${meta.era} at step ${sim.t} with ${sim.cells.length} cells`);
} else {
  const seed = (Date.now() % 2147483647) | 0;
  sim = new Column(seed, {});
  meta = {
    started: now(), era: 1, eras: [{ era: 1, seed, started: now(), ended: null, steps: 0 }],
    runs: 0, stepsTotal: 0, gensPast: 0, bornPast: 0, wallSeconds: 0,
    records: { maxSize: 0, maxInGroups: 0, maxSoma: 0, maxGape: 0, maxColonyGen: 0, maxBuoy: 0 },
    modelChanges: [],
  };
  console.log(`new perpetual world, seed ${seed}`);
}
meta.modelVersion = MODEL_VERSION;

const t0 = Date.now(), budget = MINUTES * 60 * 1000;
let lastEvents = sim.events.length ? sim.events[sim.events.length - 1].t : -1;
const seenMs = new Set(milestones.filter(m => m.era === meta.era).map(m => m.key));
let steps = 0;

function record(st) {
  const r = meta.records;
  if (st.maxSize > r.maxSize) r.maxSize = st.maxSize;
  if (st.inGroups > r.maxInGroups) r.maxInGroups = +st.inGroups.toFixed(3);
  if (st.soma > r.maxSoma) r.maxSoma = +st.soma.toFixed(3);
  if (st.gape > r.maxGape) r.maxGape = +st.gape.toFixed(1);
  if (st.mg[BUOY] > r.maxBuoy) r.maxBuoy = +st.mg[BUOY].toFixed(3);
  let g = 0; for (const c of sim.colonies.values()) if (c.gen > g) g = c.gen;
  if (g > r.maxColonyGen) r.maxColonyGen = g;
}
function fossil() {
  let big = null;
  for (const c of sim.colonies.values()) if (!big || c.cells.length > big.cells.length) big = c;
  if (!big || big.cells.length < 4) return;
  const info = sim.colonyInfo(big);
  let dx0 = big.cells[0].x;
  const cells = big.cells.map(c => { let dx = c.x - big.cx; if (dx > 2000) dx -= 4000; if (dx < -2000) dx += 4000; return [Math.round(dx * 10) / 10, Math.round((c.z - big.cz) * 10) / 10, c.soma ? 1 : 0]; });
  const bonds = [];
  const idx = new Map(big.cells.map((c, i) => [c, i]));
  big.cells.forEach((c, i) => c.bonds.forEach(o => { const j = idx.get(o); if (j > i) bonds.push([i, j]); }));
  fossils.push({
    modelVersion: MODEL_VERSION,
    wall: now(), era: meta.era, step: meta.stepsTotal + steps, gens: +(meta.gensPast + sim.gens).toFixed(1),
    id: big.id, n: big.cells.length, gen: big.gen, hue: Math.round(big.hue), depth: Math.round(big.cz),
    genes: Array.from(info.gm, v => +v.toFixed(3)), soma: +info.soma.toFixed(2), cells, bonds,
  });
  // keep the record bounded: all-time largest per era plus the most recent ones
  if (fossils.length > 240) {
    const keep = new Set();
    const byEra = new Map();
    for (const f of fossils) { const b = byEra.get(f.era); if (!b || f.n > b.n) byEra.set(f.era, f); }
    byEra.forEach(f => keep.add(f));
    const sorted = fossils.slice().sort((a, b) => b.n - a.n).slice(0, 80); sorted.forEach(f => keep.add(f));
    fossils.slice(-120).forEach(f => keep.add(f));
    fossils = fossils.filter(f => keep.has(f));
  }
}

while (Date.now() - t0 < budget) {
  sim.step(); steps++;
  if (CLIMATE && sim.t % 4000 === 0) sim.climate(1);
  if (sim.t % 1000 === 0) {
    const st = sim.stats;
    record(st);
    history.push({
      modelVersion: MODEL_VERSION,
      w: now(), era: meta.era, s: meta.stepsTotal + steps, g: +(meta.gensPast + sim.gens).toFixed(2),
      n: st.n, inG: +st.inGroups.toFixed(3), ms: +st.meanSize.toFixed(2), mx: st.maxSize,
      mg: Array.from(st.mg, v => +v.toFixed(3)), gape: +st.gape.toFixed(1), preds: st.preds,
      rms: +st.rms.toFixed(1), soma: +st.soma.toFixed(3), depth: Math.round(st.depth),
      env: { L: +sim.p.light.toFixed(2), K: +(sim.p.turbidity * 1000).toFixed(2), N: +sim.p.nutrient.toFixed(2), P: +sim.p.predRatio.toFixed(2), S: sim.p.source === 'mixed' ? 0 : 1 },
    });
  }
  if (sim.t % 5000 === 0) fossil();
  // new milestones
  for (const e of sim.events) {
    if (e.t <= lastEvents) continue;
    if (e.type.startsWith('ms_') && !seenMs.has(e.type)) {
      seenMs.add(e.type);
      milestones.push({ modelVersion: MODEL_VERSION, key: e.type, era: meta.era, wall: now(), step: meta.stepsTotal + steps, gens: +(meta.gensPast + sim.gens).toFixed(1) });
    }
  }
  if (sim.events.length) lastEvents = sim.events[sim.events.length - 1].t;
  // extinction ends an era; life restarts from a fresh inoculum in the current climate
  if (!sim.cells.length) {
    const cur = meta.eras[meta.eras.length - 1];
    cur.ended = now(); cur.steps = sim.t; cur.cause = 'extinction';
    meta.gensPast += sim.gens; meta.bornPast += sim.born;
    meta.era++;
    const seed = (Date.now() % 2147483647) | 0;
    sim = new Column(seed, Object.assign({}, sim.p));
    meta.eras.push({ era: meta.era, seed, started: now(), ended: null, steps: 0 });
    seenMs.clear(); lastEvents = -1;
    milestones.push({ modelVersion: MODEL_VERSION, key: 'extinction', era: meta.era - 1, wall: now(), step: meta.stepsTotal + steps, gens: +meta.gensPast.toFixed(1) });
    console.log(`extinction → era ${meta.era}`);
  }
}

// thin the history once it grows long: keep the recent 1500 points dense, older ones every other
if (history.length > 3000) {
  const cut = history.length - 1500, thin = [];
  for (let i = 0; i < history.length; i++) if (i >= cut || i % 2 === 0) thin.push(history[i]);
  history.length = 0; history.push(...thin);
}
meta.runs++; meta.stepsTotal += steps; meta.wallSeconds += Math.round((Date.now() - t0) / 1000);
meta.eras[meta.eras.length - 1].steps = sim.t;
meta.lastRun = now();

const st = sim.computeStats();
const summary = {
  modelVersion: MODEL_VERSION, modelChanges: meta.modelChanges,
  updated: now(), started: meta.started, runs: meta.runs, era: meta.era, eras: meta.eras.length,
  stepsTotal: meta.stepsTotal, physicalSeconds: meta.stepsTotal * DT, biologicalHours: Math.round(meta.stepsTotal * DT * sim.p.acc / 3600),
  generations: +(meta.gensPast + sim.gens).toFixed(1), divisions: meta.bornPast + sim.born,
  now: { cells: st.n, inGroups: +st.inGroups.toFixed(3), meanSize: +st.meanSize.toFixed(2), maxSize: st.maxSize, soma: +st.soma.toFixed(3), predators: st.preds, gape: +st.gape.toFixed(1), rms: +st.rms.toFixed(1), genes: { adh: +st.mg[ADH].toFixed(3), soma: +st.mg[SOMA].toFixed(3), swim: +st.mg[SWIM].toFixed(3), bond: +st.mg[BOND].toFixed(3), buoy: +st.mg[BUOY].toFixed(3) }, env: history.length ? history[history.length - 1].env : null },
  records: meta.records,
};
// Each replacement is atomic; checkpoint consistency is checked before the next resume.
writeFile('state.json.gz', zlib.gzipSync(JSON.stringify(sim.serialize()), { level: 9 }));
writeJSON('meta.json', meta);
writeJSON('history.json', history);
writeJSON('fossils.json', fossils);
writeJSON('milestones.json', milestones);
writeJSON('summary.json', summary);
console.log(`ran ${steps} steps in ${((Date.now() - t0) / 1000).toFixed(0)} s; era ${meta.era}; cells ${st.n}; in organisms ${(st.inGroups * 100).toFixed(0)}%; generations ${summary.generations}`);
