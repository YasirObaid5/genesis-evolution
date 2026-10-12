// ===================================================================
// GENESIS · laws observatory
// Each invocation adds replicate experiments (new random seeds) within a time
// budget, keeps every raw result in data/laws-raw.json, and recomputes the
// verdict for each law in data/laws.json. Evidence accumulates run after run.
// Usage: MINUTES=25 DATA_DIR=data node runner/laws.mjs
// ===================================================================
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const Herd = require('../src/core.js');
const { Origins } = require('../src/origins.js');
const Col = require('../src/column.js');

export const MODEL_VERSION = String(Col.MODEL_VERSION);
export const PROTOCOL_VERSION = '2';
const now = () => new Date().toISOString();
const newSeed = () => (Math.floor(Math.random() * 2147483646) + 1);
const pick = (a, rnd = Math.random) => a[Math.floor(rnd() * a.length)];
export const isCurrentEvidence = r => r.modelVersion === MODEL_VERSION && r.protocolVersion === PROTOCOL_VERSION;

export function readRaw(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch (e) { if (e.code === 'ENOENT') return {}; throw e; }
  const raw = JSON.parse(text);
  if (!raw || Array.isArray(raw) || typeof raw !== 'object' || Object.values(raw).some(rows => !Array.isArray(rows) || rows.some(r => !r || typeof r !== 'object' || Array.isArray(r)))) {
    throw new Error('Invalid laws evidence file; existing data has not been changed.');
  }
  return raw;
}

function writeJSON(file, value) {
  const text = JSON.stringify(value), temp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(temp, text, { flag: 'wx' });
  try { fs.renameSync(temp, file); } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
}

export function herdDesign(rnd = Math.random) {
  return { mode: pick(['selective', 'ai'], rnd), target: Math.floor(rnd() * Herd.NT), criterion: pick(['pheno', 'genomic'], rnd) };
}

// shortcut: crossings are observed every 500 steps, sample more often for event timing studies.
export function summarizePredation(tr) {
  const peak = tr.reduce((m, r) => Math.max(m, r[1]), 0);
  const first = tr.findIndex(r => r[1] >= 0.5);
  const collapseAt = first < 0 ? -1 : tr.findIndex((r, i) => i > first && r[1] < 0.2);
  const crossing = collapseAt < 0 ? -1 : tr.findIndex((r, i) => i > first && i < collapseAt && tr[i - 1][3] <= tr[i - 1][4] && r[3] > r[4]);
  return { peak, transition: first >= 0, transitionAt: first < 0 ? null : tr[first][0], collapse: collapseAt >= 0,
    collapseAt: collapseAt < 0 ? null : tr[collapseAt][0], gapeCrossedBeforeCollapse: crossing >= 0,
    gapeCrossingAt: crossing < 0 ? null : tr[crossing][0],
    gapeRatio: collapseAt < 0 ? null : +(tr[collapseAt - 1][3] / Math.max(1, tr[collapseAt - 1][4])).toFixed(2) };
}

/* ---------------- experiments ---------------- */
const EXP = {
  // L1 + L2: selection response vs breeder's equation; regression estimate of h² vs the genome's truth
  herdBreeder() {
    const seed = newSeed();
    const { mode, target, criterion } = herdDesign();
    const s = new Herd.Sim(seed);
    for (let i = 0; i < 2500; i++) s.step();
    // natural mode first: parent–offspring regression for every trait
    const h2pts = [];
    for (let tr = 0; tr < Herd.NT; tr++) { const g = s.galton(tr, false); if (g.n > 80 && isFinite(g.slope)) h2pts.push([+g.h2.toFixed(3), +g.slope.toFixed(3), g.n]); }
    s.setParam('target', target); s.setParam('dir', 1); s.setParam('criterion', criterion);
    s.setParam('sireFrac', mode === 'ai' ? 0.06 : 0.25); s.setParam('mode', mode);
    s.births.length = 0;
    for (let i = 0; i < 12000 && s.agents.length; i++) s.step();
    const g = s.galton(target, true);
    return { seed, mode, target, criterion, n: g.n, pred: +(g.pred || 0).toFixed(4), real: +(g.R || 0).toFixed(4), S: +(g.S || 0).toFixed(4), h2: +(g.h2 || 0).toFixed(3), h2pts };
  },
  // L3: rate of inbreeding vs effective population size
  herdInbreeding() {
    const seed = newSeed(), banks = [2, 4, 8, 16];
    const bank = pick(banks);
    const s = new Herd.Sim(seed, { mut: 0 });
    for (let i = 0; i < 1500; i++) s.step();
    s.setParam('sireFrac', 0.05); s.setParam('bankSize', bank); s.setParam('heatDet', 0.9); s.setParam('mode', 'ai');
    const t0 = s.t;
    for (let i = 0; i < 16000 && s.agents.length; i++) s.step();
    const H = s.hist.filter(h => h.t > t0 + 4000);
    if (H.length < 10) return null;
    // ΔF per generation from the slope of ln(1−F) against mean generation
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const h of H) { const x = h.gen, y = Math.log(1 - Math.min(0.999, h.F)); sx += x; sy += y; sxx += x * x; sxy += x * y; }
    const n = H.length, slope = (sxy / n - sx / n * sy / n) / (sxx / n - (sx / n) ** 2);
    // effective number of parents per generation: split the window into generation-long slices,
    // compute Ne = 4·Nm·Nf/(Nm+Nf) from each slice's parental contributions, then take the harmonic mean
    const gens = Math.max(1, H[H.length - 1].gen - H[0].gen);
    const tA = t0 + 4000, L = (s.t - tA) / gens;
    const eff = (m) => { let a = 0, b = 0; for (const k of m.values()) { a += k; b += k * k; } return b ? a * a / b : 0; };
    let invSum = 0, nw = 0, NmS = 0, NfS = 0;
    for (let w0 = tA; w0 + L <= s.t + 1; w0 += L) {
      const sires = new Map(), dams = new Map();
      for (const r of s.records.values()) if (r.born >= w0 && r.born < w0 + L && r.sire && r.dam) { sires.set(r.sire, (sires.get(r.sire) || 0) + 1); dams.set(r.dam, (dams.get(r.dam) || 0) + 1); }
      const nm = eff(sires), nf = eff(dams); if (!nm || !nf) continue;
      invSum += (nm + nf) / (4 * nm * nf); nw++; NmS += nm; NfS += nf;
    }
    if (!nw) return null;
    const Ne = nw / invSum, Nm = NmS / nw, Nf = NfS / nw;
    return { seed, bank, dF: +(-slope).toFixed(5), theory: +(1 / (2 * Ne)).toFixed(5), Ne: +Ne.toFixed(1), Nm: +Nm.toFixed(1), Nf: +Nf.toFixed(1), gens: +gens.toFixed(1) };
  },
  // L4: bioconvection appears above a critical concentration of swimmers
  bioconvection() {
    const seed = newSeed(), Ns = [100, 200, 400, 700, 1000, 1500, 2200];
    const N = pick(Ns);
    const s = new Col.Column(seed, { predators: false, acc: 0 });
    s.biology = () => {};
    s.cells.length = 0; s.colonies.clear();
    for (let i = 0; i < N; i++) {
      const g = new Float32Array(5); g[Col.SWIM] = 1; g[Col.BOND] = 2; g[Col.BUOY] = 0.05;
      const c = s.makeCell(s.rnd() * Col.LX, s.rnd() * Col.LZ, g, 0.6, false, 1); s.cells.push(c); s.newColony(null, [c]);
    }
    let acc = 0, k = 0;
    for (let i = 0; i < 900; i++) { s.step(); if (i >= 300) { acc += s.flowStats.rms; k++; } }
    const conc = N / (Col.LX * Col.LZ * Col.HSL) * 1e12;   // cells per mL (1 mL = 1e12 µm³)
    return { seed, N, conc: Math.round(conc), rms: +(acc / k).toFixed(2) };
  },
  // L5 + L6: size-selective predation and multicellularity; the Red Queen collapse
  predation() {
    const seed = newSeed(), withPred = Math.random() >= 1 / 3;
    const s = new Col.Column(seed, { predators: withPred, predRatio: withPred ? pick([1.5, 2, 2.5, 3, 3.5, 4, 4.5]) : 0 });
    const tr = [];
    const sample = () => { const st = s.computeStats(); tr.push([s.t, +st.inGroups.toFixed(3), +st.mg[Col.ADH].toFixed(3), +st.gape.toFixed(1), +s.colonyDiameter(Math.max(1, st.meanSize)).toFixed(1)]); };
    sample();
    for (let i = 0; i < 36000 && s.cells.length; i++) {
      s.step();
      if (s.t % 500 === 0) sample();
    }
    if (tr.at(-1)[0] !== s.t) sample();
    return { seed, predators: withPred, predRatio: s.p.predRatio, ...summarizePredation(tr), extinct: !s.cells.length, tr };
  },
  // L7 tests relatedness; the recorded Price terms are descriptive only.
  chimeras() {
    const seed = newSeed(), aggr = Math.random() >= 0.5;
    const s = new Origins(seed, { predators: true, aggregation: aggr });
    for (let i = 0; i < 20000 && s.cells.length; i++) s.step();
    const late = s.price.slice(-8);
    const mean = (f) => late.length ? late.reduce((a, p) => a + f(p), 0) / late.length : null;
    return { seed, aggregation: aggr, rel: +(s.stats.rel || 0).toFixed(3), within: mean(p => p.secr.within), between: mean(p => p.secr.between), secr: +s.stats.mg[1].toFixed(3), meanSize: +s.stats.meanSize.toFixed(1) };
  },
};
const WEIGHT = { herdBreeder: 3, herdInbreeding: 3, bioconvection: 4, predation: 2, chimeras: 2 };

/* ---------------- statistics ---------------- */
function ols(pts) {
  const n = pts.length; if (n < 3) return null;
  let sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
  for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; syy += y * y; }
  const mx = sx / n, my = sy / n, vx = sxx / n - mx * mx, vy = syy / n - my * my, cxy = sxy / n - mx * my;
  if (vx <= 0) return null;
  const slope = cxy / vx, icpt = my - slope * mx, r2 = vy > 0 ? cxy * cxy / (vx * vy) : 0;
  let sse = 0; for (const [x, y] of pts) sse += (y - icpt - slope * x) ** 2;
  const se = Math.sqrt(sse / Math.max(1, n - 2) / (vx * n));
  return { n, slope: +slope.toFixed(3), icpt: +icpt.toFixed(4), r2: +r2.toFixed(3), se: +se.toFixed(3) };
}
// regression through the origin: is y = k·x with k ≈ 1?
function thru0(pts) {
  const n = pts.length; if (n < 3) return null;
  let sxy = 0, sxx = 0; for (const [x, y] of pts) { sxy += x * y; sxx += x * x; }
  if (sxx <= 0) return null;
  const k = sxy / sxx; let sse = 0, syy = 0, my = pts.reduce((a, p) => a + p[1], 0) / n;
  for (const [x, y] of pts) { sse += (y - k * x) ** 2; syy += (y - my) ** 2; }
  const se = Math.sqrt(sse / (n - 1) / sxx);
  return { n, k: +k.toFixed(3), se: +se.toFixed(3), r2: +(1 - sse / Math.max(1e-12, syy)).toFixed(3) };
}
const verdictK = (fit, tol = 0.25) => !fit ? 'pending' : Math.abs(fit.k - 1) <= Math.max(tol, 2 * fit.se) ? 'supported' : 'deviates';
export function summarizeEvidence(allRaw, updated = now()) {
const raw = Object.fromEntries(Object.entries(allRaw).map(([k, rows]) => [k, rows.filter(isCurrentEvidence)]));
const laws = [];

{ // L1 breeder's equation (phenotypic selection, where it applies)
  const pts = (raw.herdBreeder || []).filter(r => r.n > 40 && r.criterion === 'pheno').map(r => [r.pred, r.real]);
  const fit = thru0(pts);
  laws.push({ id: 'breeder', world: 'herd', pts, fit, verdict: verdictK(fit, 0.3),
    statement: { ar: 'تحت الانتخاب المظهري: الاستجابة تساوي المكافئ الوراثي مضروبًا في فارق الانتخاب، R = h²S', en: 'Under phenotypic selection the response equals heritability times the selection differential: R = h²S' },
    axes: ['h²S', 'R'] });
  // L1b genomic selection beats the phenotypic prediction
  const gp = (raw.herdBreeder || []).filter(r => r.n > 40 && r.criterion === 'genomic').map(r => [r.pred, r.real]);
  const gfit = thru0(gp);
  laws.push({ id: 'genomic', world: 'herd', pts: gp, fit: gfit, verdict: !gfit ? 'pending' : gfit.k > 1.3 ? 'supported' : 'deviates',
    statement: { ar: 'تحت الانتخاب الجينومي تتجاوز الاستجابة ما يتوقعه h²S، لأن الانتخاب يقع على القيمة التربوية مباشرة', en: 'Under genomic selection the response exceeds h²S, because selection acts on breeding values directly' },
    axes: ['h²S', 'R'] });
}
{ // L2 heritability estimated from relatives
  const pts = []; for (const r of raw.herdBreeder || []) for (const p of r.h2pts || []) pts.push([p[0], p[1]]);
  const fit = thru0(pts);
  laws.push({ id: 'heritability', world: 'herd', pts, fit, verdict: verdictK(fit, 0.2),
    statement: { ar: 'ميل انحدار النسل على متوسط الأبوين يقدّر المكافئ الوراثي الحقيقي', en: 'The slope of offspring on mid-parent estimates the true heritability' },
    axes: ['h² (genome)', 'slope'] });
}
{ // L3 inbreeding
  const pts = (raw.herdInbreeding || []).filter(r => isFinite(r.dF) && isFinite(r.theory)).map(r => [r.theory, r.dF]);
  const fit = thru0(pts), corr = ols(pts);
  laws.push({ id: 'inbreeding', world: 'herd', pts, fit, corr, verdict: !fit || pts.length < 4 ? 'pending' : verdictK(fit, 0.25) === 'supported' ? 'supported' : (corr && corr.slope > 0 && corr.r2 > 0.3) ? 'same direction, different scale' : 'deviates',
    statement: { ar: 'معدل التربية الداخلية لكل جيل ΔF ≈ 1/(2Ne)، فكلما قلّ عدد الآباء الفعّال ارتفع F أسرع', en: 'The rate of inbreeding per generation ΔF ≈ 1/(2Ne): fewer effective parents, faster rise in F' },
    axes: ['1/(2Ne)', 'ΔF'] });
}
{ // L4 bioconvection threshold
  const runs = raw.bioconvection || [];
  const byN = new Map(); for (const r of runs) { const a = byN.get(r.conc) || []; a.push(r.rms); byN.set(r.conc, a); }
  const pts = Array.from(byN.entries()).map(([c, a]) => [c, +(a.reduce((x, y) => x + y, 0) / a.length).toFixed(2), a.length]).sort((a, b) => a[0] - b[0]);
  // threshold: first concentration whose mean rms exceeds 10 µm/s
  const th = pts.find(p => p[1] > 10);
  laws.push({ id: 'bioconvection', world: 'column', pts, threshold: th ? th[0] : null, verdict: pts.length < 4 ? 'pending' : th && pts[0][1] < 10 ? 'supported' : 'deviates',
    statement: { ar: 'الحمل الحيوي لا يظهر إلا فوق تركيز حرج من السبّاحين', en: 'Bioconvection appears only above a critical concentration of swimmers' },
    axes: ['cells/mL', 'rms µm/s'] });
}
{ // L5 + L6 predation
  const runs = raw.predation || [];
  const wp = runs.filter(r => r.predators), np = runs.filter(r => !r.predators);
  const frac = (a) => a.length ? +(a.filter(r => r.transition).length / a.length).toFixed(2) : null;
  const group = a => ({ n: a.length, transitions: a.filter(r => r.transition).length, extinct: a.filter(r => r.extinct).length, frac: frac(a) });
  laws.push({ id: 'predation', world: 'column', withPred: group(wp), without: group(np),
    verdict: wp.length < 3 || np.length < 2 ? 'pending' : frac(wp) > frac(np) + 0.3 ? 'supported' : 'deviates',
    statement: { ar: 'اختبار: هل تزداد نسبة التجارب التي تصل إلى تعدد الخلايا مع الافتراس؟ تُحتسب جميع التجارب، بما فيها المنقرضة.', en: 'Test: does predation increase the share of runs reaching multicellularity? All runs are counted, including extinctions.' } });
  const tr = wp.filter(r => r.transition);
  const coll = tr.filter(r => r.collapse);
  const preceded = coll.filter(r => r.gapeCrossedBeforeCollapse);
  const ratios = coll.map(r => r.gapeRatio).filter(Number.isFinite);
  laws.push({ id: 'redqueen', world: 'column', transitions: tr.length, collapses: coll.length, frac: tr.length ? +(coll.length / tr.length).toFixed(2) : null,
    preceded: preceded.length, extinct: tr.filter(r => r.extinct).length,
    crossedFrac: coll.length ? +(preceded.length / coll.length).toFixed(2) : null,
    gapeRatio: ratios.length ? +(ratios.reduce((a, v) => a + v, 0) / ratios.length).toFixed(2) : null,
    examples: tr.slice(-4).map(r => r.tr),
    verdict: coll.length < 3 ? 'pending' : preceded.length / coll.length >= 0.5 ? 'supported' : 'not general',
    statement: { ar: 'اختبار زمني: هل يسبق نصف الانهيارات على الأقل تجاوز مرصود لفم المفترس قطر الكائنات بعد الانتقال؟ التعاقب لا يثبت السببية.', en: 'Temporal test: are at least half of collapses preceded by an observed gape crossing above organism diameter after transition? Sequence does not establish causation.' } });
}
{ // L7 chimeras
  const runs = raw.chimeras || [];
  const a = runs.filter(r => r.aggregation), c = runs.filter(r => !r.aggregation);
  const m = (arr, k) => arr.length ? +(arr.reduce((x, r) => x + (r[k] || 0), 0) / arr.length).toFixed(4) : null;
  laws.push({ id: 'chimeras', world: 'origins', clonal: { n: c.length, rel: m(c, 'rel'), within: m(c, 'within'), size: m(c, 'meanSize') }, chimeric: { n: a.length, rel: m(a, 'rel'), within: m(a, 'within'), size: m(a, 'meanSize') },
    verdict: a.length < 2 || c.length < 2 ? 'pending' : m(a, 'rel') < m(c, 'rel') ? 'supported' : 'deviates',
    statement: { ar: 'اختبار: هل تكون الكائنات الخيمرية أقل ارتباطًا وراثيًا من الكائنات النسيلية؟ هذا القياس لا يثبت ضعف التعاون.', en: 'Test: are chimeric organisms less related than clonal organisms? This measure does not establish weaker cooperation.' } });
}

const counts = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, v.length]));
const historicalCounts = Object.fromEntries(Object.entries(allRaw).map(([k, v]) => [k, v.length - counts[k]]));
return { updated, modelVersion: MODEL_VERSION, protocolVersion: PROTOCOL_VERSION, counts, historicalCounts, laws };
}

export function runLaws({ dataDir = process.env.DATA_DIR || 'data', minutes = +(process.env.MINUTES ?? 25) } = {}) {
  if (!Number.isFinite(minutes) || minutes < 0) throw new Error('MINUTES must be a finite nonnegative number.');
  const rawPath = path.join(dataDir, 'laws-raw.json');
  const raw = readRaw(rawPath);
  const t0 = Date.now(), budget = minutes * 60 * 1000;
  let done = 0;
  while (Date.now() - t0 < budget * 0.92) {
    // Balance the current protocol only; archived rows must not delay new evidence.
    let experiment = null, best = Infinity;
    for (const k in EXP) { const n = (raw[k] || []).filter(isCurrentEvidence).length / WEIGHT[k]; if (n < best) { best = n; experiment = k; } }
    const ts = Date.now();
    let res = null;
    try { res = EXP[experiment](); } catch (e) { console.error(experiment, e.message); }
    if (res) {
      Object.assign(res, { modelVersion: MODEL_VERSION, protocolVersion: PROTOCOL_VERSION, at: now(), secs: Math.round((Date.now() - ts) / 1000) });
      (raw[experiment] = raw[experiment] || []).push(res); done++;
    }
    console.log(`${experiment} done in ${((Date.now() - ts) / 1000).toFixed(0)} s`);
  }
  const summary = summarizeEvidence(raw);
  fs.mkdirSync(dataDir, { recursive: true });
  writeJSON(rawPath, raw);
  writeJSON(path.join(dataDir, 'laws.json'), summary);
  console.log(`added ${done} experiments; current totals`, summary.counts);
  for (const l of summary.laws) console.log(l.id, l.verdict, l.fit ? JSON.stringify(l.fit) : '');
  return summary;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) runLaws();
