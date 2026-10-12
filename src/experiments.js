/* Paired water-column experiments: one treatment, identical initial state. */
(function (root) {
'use strict';
const engine = typeof module !== 'undefined' && module.exports ? require('./column.js') : root.GenesisColumn;
const MODEL = 'water-column/' + (engine.MODEL_VERSION || '1');
const PROTOCOL_VERSION = 1;
const MAX_SEED = 2147483646;
const BASELINE = Object.freeze({ predators: true, predRatio: 3, flow: true, light: 1,
  turbidity: 0.0012, nutrient: 1, source: 'mixed', acc: 400, mut: 0.08, cap: 3200 });
const FACTORS = Object.freeze({
  predators: Object.freeze({ a: true, b: false }),
  flow: Object.freeze({ a: true, b: false }),
  source: Object.freeze({ a: 'mixed', b: 'sediment' }),
  light: Object.freeze({ a: 1, b: 0.5 }),
});
const METRICS = Object.freeze(['cells', 'inGroups', 'adhesion', 'meanSize', 'gape', 'generations']);

function integer(value, min, max, name) {
  if (!Number.isInteger(value) || value < min || value > max) throw new RangeError(name + ' must be an integer from ' + min + ' to ' + max);
  return value;
}
function validateConfig(config) {
  if (!config || typeof config !== 'object' || Array.isArray(config)) throw new TypeError('Experiment configuration required');
  if (!Object.prototype.hasOwnProperty.call(FACTORS, config.factor)) throw new RangeError('Unknown experiment factor');
  return { seed: integer(config.seed, 1, MAX_SEED, 'seed'), repeats: integer(config.repeats, 1, 12, 'repeats'),
    steps: integer(config.steps, 100, 36000, 'steps'), factor: config.factor };
}
function createPair(input, repIndex = 0) {
  const config = validateConfig(input);
  integer(repIndex, 0, config.repeats - 1, 'repIndex');
  const seed = (config.seed - 1 + repIndex) % MAX_SEED + 1;
  const a = new engine.Column(seed, BASELINE), b = new engine.Column(seed, BASELINE);
  // Applying treatment after construction preserves initialization and RNG state in both arms.
  b.setParam(config.factor, FACTORS[config.factor].b);
  if (config.factor === 'predators') b.preds.length = 0;
  return { seed, a, b, conditions: FACTORS[config.factor] };
}
function sample(sim) {
  const st = sim.computeStats(), extinct = sim.cells.length === 0;
  return { step: sim.t, cells: st.n, inGroups: extinct ? 0 : st.inGroups,
    adhesion: extinct ? 0 : st.mg[engine.ADH], meanSize: extinct ? 0 : st.meanSize,
    gape: st.gape, generations: sim.gens, extinct };
}
function checkSample(point) {
  if (!point || typeof point !== 'object') throw new TypeError('Experiment sample required');
  integer(point.step, 0, 36000, 'sample step');
  for (const key of METRICS) if (!Number.isFinite(point[key]) || point[key] < 0) throw new RangeError('Invalid sample ' + key);
  if (!Number.isInteger(point.cells) || point.inGroups > 1 || point.adhesion > 1 || typeof point.extinct !== 'boolean' || point.extinct !== (point.cells === 0)) throw new RangeError('Invalid sample population');
  return point;
}
function maximumObserved(arm) {
  let maximum = checkSample(arm).inGroups;
  if (arm.trajectory !== undefined) {
    if (!Array.isArray(arm.trajectory) || arm.trajectory.length > 36001) throw new RangeError('Invalid trajectory length');
    for (const point of arm.trajectory) maximum = Math.max(maximum, checkSample(point).inGroups);
  }
  return maximum;
}
function distribution(values) {
  const n = values.length;
  if (!n) return { mean: null, min: null, max: null, se: null };
  const mean = values.reduce((sum, value) => sum + value, 0) / n;
  const variance = n > 1 ? values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (n - 1) : null;
  return { mean, min: Math.min(...values), max: Math.max(...values), se: n > 1 ? Math.sqrt(variance / n) : null };
}
function summarize(runs) {
  if (!Array.isArray(runs) || runs.length > 12) throw new RangeError('Invalid number of paired runs');
  const result = { n: runs.length, a: { extinctions: 0, transitions: 0, means: {} },
    b: { extinctions: 0, transitions: 0, means: {} }, difference: {} };
  for (const run of runs) {
    integer(run.seed, 1, MAX_SEED, 'run seed');
    for (const arm of ['a', 'b']) {
      if (maximumObserved(run[arm]) >= 0.5) result[arm].transitions++;
      if (run[arm].extinct) result[arm].extinctions++;
    }
  }
  for (const key of METRICS) {
    for (const arm of ['a', 'b']) result[arm].means[key] = distribution(runs.map(run => run[arm][key])).mean;
    result.difference[key] = distribution(runs.map(run => run.b[key] - run.a[key]));
  }
  return result;
}
function csvCell(value) {
  let text = String(value);
  if (typeof value === 'string' && /^[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
function toCSV(record) {
  const config = validateConfig(record.config);
  summarize(record.runs);
  if (record.runs.length > config.repeats) throw new RangeError('Too many runs for configuration');
  const model = record.model === undefined ? MODEL : record.model;
  const protocol = record.protocolVersion === undefined ? PROTOCOL_VERSION : record.protocolVersion;
  if (typeof model !== 'string' || model.length > 80) throw new RangeError('Invalid model version');
  integer(protocol, 1, 1000000, 'protocol version');
  const complete = record.complete === undefined ? record.runs.length === config.repeats : record.complete;
  const rows = [['model', 'protocolVersion', 'initialSeed', 'requestedRepeats', 'completedRepeats', 'complete', 'requestedSteps', 'factor',
    'repeat', 'seed', 'arm', 'condition', 'step', ...METRICS, 'extinct', 'maxObservedInGroups', 'observedTransition']];
  record.runs.forEach((run, index) => {
    for (const arm of ['a', 'b']) rows.push([model, protocol, config.seed, config.repeats, record.runs.length, complete, config.steps, config.factor,
      index + 1, run.seed, arm, FACTORS[config.factor][arm], run[arm].step, ...METRICS.map(key => run[arm][key]),
      run[arm].extinct, maximumObserved(run[arm]), maximumObserved(run[arm]) >= 0.5]);
  });
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n';
}
const API = { MODEL, PROTOCOL_VERSION, BASELINE, FACTORS, METRICS, validateConfig, createPair, sample, summarize, toCSV };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.GenesisExperiments = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
