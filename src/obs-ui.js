/* ===================================================================
   GENESIS · OBSERVATORY — the perpetual run and the laws it tests
   Reads the data the scheduled runs publish (summary, history, fossils,
   milestones, laws) and can load the latest saved world into the
   water-column view so a visitor watches it continue live.
   =================================================================== */
(function () {
'use strict';
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

// where the scheduled runs publish their data (a branch of the GitHub repository); local "data/" is tried first
const SOURCES = [
  (window.GENESIS_DATA || '').replace(/\/?$/, '/'),
  'data/',
  'https://raw.githubusercontent.com/YasirObaid5/genesis-evolution/perpetual-data/',
].filter(s => s && s !== '/');

const L = {
  ar: {
    since: 'يعمل منذ', gens: 'جيل خلوي', bio: 'زمن بيولوجي', era: 'الحقبة', runs: 'جلسات تشغيل', updated: 'آخر تحديث',
    watch: 'شاهد العالم الأبدي الآن', reload: 'تحديث',
    intro: 'هذا هو <b>العالم الأبدي</b>: عمود الماء نفسه، لكنه لا يُعاد من الصفر أبدًا. كل بضع ساعات يستأنف خادم مجاني من حيث توقف، ويشغّله ساعات بيولوجية إضافية، ويغيّر المناخ ببطء (الضوء، العكارة، الغذاء، ضغط الافتراس)، ثم يحفظ الحالة. إن انقرضت الحياة تبدأ <b>حقبة</b> جديدة. وفي الأسفل <b>مرصد القوانين</b>: تجارب تتكرر ببذور عشوائية جديدة في كل تشغيل، وتقارن ما يحدث بما تتنبأ به النظرية.',
    ladder: 'سلّم التعقيد', ladder_s: 'متى وصلت الحياة إلى كل درجة',
    records: 'الأرقام القياسية', nowT: 'الآن',
    h_org: 'تعدد الخلايا عبر الزمن', h_org_s: 'المحور الأفقي: أجيال خلوية تراكمية',
    h_genes: 'الجينات عبر الزمن', h_arms: 'سباق التسلح الطويل', h_arms_s: 'قطر الكائن مقابل فم المفترس (µm)',
    h_env: 'المناخ', h_env_s: 'التغيّر البطيء الذي يفرضه العالم',
    fossils: 'سجلّ الأحافير', fossils_s: 'أكبر الكائنات في كل حقبة وأحدثها',
    laws: 'قوانين التطور: النظرية مقابل التجربة', mslog: 'سجلّ المحطات',
    foot: 'كل الأرقام هنا من محاكاة. القوانين التي «تُدعَم» هنا مدعومة داخل هذا النموذج، وهذا اختبار لاتساق النموذج مع النظرية، لا برهان على الطبيعة.',
    r_maxSize: 'أكبر كائن', r_maxInGroups: 'أعلى نسبة خلايا داخل كائنات', r_maxSoma: 'أعلى نسبة خلايا جسدية', r_maxGape: 'أوسع فم مفترس', r_maxColonyGen: 'أطول سلالة كائنات', r_maxBuoy: 'أعلى طفو',
    n_cells: 'الخلايا', n_inG: 'داخل كائنات', n_size: 'متوسط الحجم', n_pred: 'المفترسات', n_gape: 'فم المفترس', n_env: 'المناخ',
    cells: 'خلية', gen: 'جيل', µm: 'µm', years: 'سنة', days: 'يوم', hours: 'ساعة', ago: 'منذ', min: 'دقيقة',
    l_inG: 'داخل كائنات', l_ms: 'متوسط الحجم', l_mx: 'أكبر كائن', l_diam: 'قطر الكائن', l_gape: 'فم المفترس', l_L: 'الضوء', l_N: 'الغذاء', l_P: 'مفترسات/100', l_S: 'غذاء من الرواسب',
    g_adh: 'الالتصاق', g_soma: 'التخصص الجسدي', g_swim: 'قوة السوط', g_bond: 'متانة الرابطة', g_buoy: 'الطفو',
    v_supported: 'مدعوم', v_deviates: 'ينحرف', v_pending: 'يجمع الأدلة', 'v_not general': 'ليس عامًا', 'v_same direction, different scale': 'الاتجاه صحيح والمقدار مختلف',
    n_exp: 'تجربة', fitk: 'الميل', r2: 'R²', threshold: 'العتبة', withP: 'مع مفترسات', withoutP: 'بلا مفترسات', transitions: 'انتقالات', collapses: 'انهيارات',
    clonal: 'نسيلية', chimeric: 'خيمرية', rel: 'الارتباط r',
    w_herd: 'القطيع', w_column: 'عمود الماء', w_origins: 'الأصول',
    nodata: 'لا توجد بيانات بعد. ستظهر هنا بعد أول تشغيل مجدول على GitHub.', loaded: 'المصدر',
    ladder_ceiling: 'سقف هذا النموذج', ceiling_note: 'يحتاج قوانين أو جينات غير موجودة في هذا العالم',
    rung_single: 'خلايا منفردة تسبح بأسواطها', rung_ms_plumes: 'الحمل الحيوي: أعمدة من صنع الخلايا', rung_ms_first8: 'أول كائن من 8 خلايا', rung_ms_half: 'نصف الحياة داخل كائنات',
    rung_ms_32: 'كائن من 32 خلية', rung_ms_soma: 'تقسيم العمل: خلايا جسدية عقيمة', rung_ms_float: 'الطفو بدل السباحة', rung_ms_majority: 'اكتمال الانتقال: 90% داخل كائنات', rung_ms_gape: 'سباق تسلح: أفواه بقطر 30 µm',
    rung_types: 'أكثر من نوعين من الخلايا', rung_dev: 'تطوّر جنيني ومحاور جسم', rung_nerve: 'خلايا عصبية وسلوك', rung_brain: 'دماغ وتعلّم', rung_human: 'شيء شبيه بالإنسان 🙂',
    ms_extinction: 'انقراض، وبداية حقبة جديدة',
  },
  en: {
    since: 'running since', gens: 'cell generations', bio: 'biological time', era: 'era', runs: 'runs', updated: 'last update',
    watch: 'Watch the perpetual world now', reload: 'Refresh',
    intro: 'This is the <b>perpetual world</b>: the same water column, but it is never restarted. Every few hours a free server resumes it where it stopped, runs more biological hours, nudges the climate (light, turbidity, nutrient, predation pressure), and saves it again. If life goes extinct a new <b>era</b> begins. Below is the <b>laws observatory</b>: experiments repeated with fresh random seeds on every run, compared with what theory predicts.',
    ladder: 'Ladder of complexity', ladder_s: 'when life reached each rung',
    records: 'Records', nowT: 'Right now',
    h_org: 'Multicellularity over time', h_org_s: 'x axis: cumulative cell generations',
    h_genes: 'Genes over time', h_arms: 'The long arms race', h_arms_s: 'Organism diameter vs predator gape (µm)',
    h_env: 'Climate', h_env_s: 'the slow change the world imposes',
    fossils: 'Fossil record', fossils_s: 'the largest organism of each era, and the latest',
    laws: 'Laws of evolution: theory vs experiment', mslog: 'Milestone log',
    foot: 'Everything here comes from simulation. A law marked “supported” is supported inside this model: a test of the model’s consistency with theory, not proof about nature.',
    r_maxSize: 'Largest organism', r_maxInGroups: 'Highest share of cells in organisms', r_maxSoma: 'Highest share of somatic cells', r_maxGape: 'Widest predator mouth', r_maxColonyGen: 'Longest organism lineage', r_maxBuoy: 'Highest buoyancy',
    n_cells: 'Cells', n_inG: 'In organisms', n_size: 'Mean size', n_pred: 'Predators', n_gape: 'Predator gape', n_env: 'Climate',
    cells: 'cells', gen: 'gen', µm: 'µm', years: 'years', days: 'days', hours: 'hours', ago: 'ago', min: 'min',
    l_inG: 'In organisms', l_ms: 'Mean size', l_mx: 'Largest', l_diam: 'Organism diameter', l_gape: 'Predator gape', l_L: 'Light', l_N: 'Nutrient', l_P: 'Predators/100', l_S: 'Food from sediment',
    g_adh: 'Adhesion', g_soma: 'Somatic fate', g_swim: 'Flagellar force', g_bond: 'Bond strength', g_buoy: 'Buoyancy',
    v_supported: 'Supported', v_deviates: 'Deviates', v_pending: 'Gathering evidence', 'v_not general': 'Not general', 'v_same direction, different scale': 'Right direction, different scale',
    n_exp: 'experiments', fitk: 'slope', r2: 'R²', threshold: 'threshold', withP: 'with predators', withoutP: 'without predators', transitions: 'transitions', collapses: 'collapses',
    clonal: 'clonal', chimeric: 'chimeric', rel: 'relatedness r',
    w_herd: 'Herd', w_column: 'Water column', w_origins: 'Origins',
    nodata: 'No data yet. It will appear after the first scheduled run on GitHub.', loaded: 'source',
    ladder_ceiling: 'This model’s ceiling', ceiling_note: 'needs laws or genes that do not exist in this world',
    rung_single: 'Single cells swimming with flagella', rung_ms_plumes: 'Bioconvection: plumes made by cells', rung_ms_first8: 'The first 8-cell organism', rung_ms_half: 'Half of life inside organisms',
    rung_ms_32: 'A 32-cell organism', rung_ms_soma: 'Division of labour: sterile soma', rung_ms_float: 'Floating instead of swimming', rung_ms_majority: 'Transition complete: 90% in organisms', rung_ms_gape: 'Arms race: 30 µm mouths',
    rung_types: 'More than two cell types', rung_dev: 'Embryonic development and body axes', rung_nerve: 'Nerve cells and behaviour', rung_brain: 'A brain that learns', rung_human: 'Something human-like 🙂',
    ms_extinction: 'Extinction, and a new era begins',
  },
};
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
const t = (k) => (L[lang()][k] !== undefined ? L[lang()][k] : k);

const LAW_EXTRA = {
  breeder: { ar: 'نسبة الاستجابة المحققة إلى المتوقعة عبر التجارب', en: 'realized vs predicted response across runs' },
  genomic: { ar: 'الانتخاب الجينومي: المحقق مقابل h²S', en: 'genomic selection: realized vs h²S' },
  heritability: { ar: 'كل نقطة صفة في تجربة', en: 'each point is one trait in one run' },
  inbreeding: { ar: 'كل نقطة تجربة بحجم بنك مختلف', en: 'each point is a run with a different bank size' },
  bioconvection: { ar: 'متوسط سرعة الماء حسب التركيز', en: 'mean flow speed by concentration' },
};

let D = { summary: null, history: [], fossils: [], milestones: [], laws: null, source: null };

async function fetchJSON(base, f) { const r = await fetch(base + f, { cache: 'no-store' }); if (!r.ok) throw new Error(r.status); return r.json(); }
async function load() {
  for (const base of SOURCES) {
    try {
      const summary = await fetchJSON(base, 'summary.json');
      const [history, fossils, milestones, laws] = await Promise.all(['history.json', 'fossils.json', 'milestones.json', 'laws.json'].map(f => fetchJSON(base, f).catch(() => null)));
      D = { summary, history: history || [], fossils: fossils || [], milestones: milestones || [], laws, source: base };
      render(); return;
    } catch (e) { /* try next source */ }
  }
  D = { summary: null, history: [], fossils: [], milestones: [], laws: null, source: null };
  render();
}
async function watch() {
  if (!D.source) return;
  try {
    const r = await fetch(D.source + 'state.json.gz', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    let text;
    if (typeof DecompressionStream !== 'undefined') text = await new Response(r.body.pipeThrough(new DecompressionStream('gzip'))).text();
    else throw new Error('no gzip');
    const st = JSON.parse(text);
    if (window.__column && window.__column.load) {
      window.__column.load(st);
      document.querySelector('#worlds button[data-world="column"]').click();
    }
  } catch (e) { $('#bSource').textContent = (lang() === 'ar' ? 'تعذّر تحميل الحالة: ' : 'Could not load the state: ') + e.message; }
}

/* ---------------- formatting ---------------- */
function ago(iso) {
  if (!iso) return '—';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return Math.max(1, Math.round(s / 60)) + ' ' + t('min');
  if (s < 86400 * 2) return Math.round(s / 3600) + ' ' + t('hours');
  return Math.round(s / 86400) + ' ' + t('days');
}
function bioTime(h) { return h > 24 * 365 * 2 ? (h / 24 / 365).toFixed(1) + ' ' + t('years') : h > 72 ? Math.round(h / 24) + ' ' + t('days') : Math.round(h) + ' ' + t('hours'); }

/* ---------------- charts ---------------- */
function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return { ctx, w: r.width, h: r.height };
}
function chart(c, series, { ymin, ymax, fmt = (v) => v, ticks }) {
  const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const H = D.history, pad = { l: 36, r: 8, t: 8, b: 18 };
  if (H.length < 2) { ctx.fillStyle = css('--sand-3'); ctx.font = '12px ' + css('--body'); ctx.textAlign = 'center'; ctx.fillText(t('nodata'), w / 2, h / 2); return; }
  const xmin = H[0].g, xmax = H[H.length - 1].g || 1;
  const X = (v) => pad.l + (v - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
  ctx.direction = 'ltr'; ctx.font = '10px ' + css('--mono'); ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of ticks) { const y = Y(v); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.globalAlpha = 1; ctx.fillText(fmt(v), pad.l - 4, y); }
  // x ticks in generations
  const span = xmax - xmin, step = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000].find(s => span / s <= 6) || 100000;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  for (let v = Math.ceil(xmin / step) * step; v <= xmax; v += step) ctx.fillText(v >= 1000 ? (v / 1000) + 'k' : v, X(v), h - pad.b + 4);
  // era boundaries
  ctx.strokeStyle = css('--heat'); ctx.setLineDash([3, 3]);
  for (let i = 1; i < H.length; i++) if (H[i].era !== H[i - 1].era) { const x = X(H[i].g); ctx.beginPath(); ctx.moveTo(x, pad.t); ctx.lineTo(x, h - pad.b); ctx.stroke(); }
  ctx.setLineDash([]);
  for (const s of series) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.7; ctx.globalAlpha = s.alpha || 1;
    ctx.beginPath(); let st = false;
    for (const r of H) { const v = s.f(r); if (v === null || !isFinite(v)) { st = false; continue; } const x = X(r.g), y = Y(Math.min(ymax, Math.max(ymin, v))); st ? ctx.lineTo(x, y) : ctx.moveTo(x, y); st = true; }
    ctx.stroke(); ctx.globalAlpha = 1;
    if (s.fill) { ctx.lineTo(X(H[H.length - 1].g), Y(ymin)); ctx.lineTo(X(H[0].g), Y(ymin)); ctx.closePath(); ctx.fillStyle = s.color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1; }
  }
}
const diam = (n) => 10 * Math.pow(Math.max(1, n), 0.45);
const GC = ['#7ad8ff', '#ffb86b', '#a6e3a1', '#c59cff', '#f0c04a'];
function drawCharts() {
  let mx = 4; for (const r of D.history) mx = Math.max(mx, r.mx);
  chart($('#bOrg'), [
    { f: r => r.inG * Math.log2(mx + 1), color: '#86c95e', width: 2.2, fill: true },
    { f: r => Math.log2(r.ms + 1), color: '#f0c04a', width: 1.6 },
    { f: r => Math.log2(r.mx + 1), color: '#f0c04a', width: 1, alpha: 0.45 },
  ], { ymin: 0, ymax: Math.log2(mx + 1), ticks: [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(v => v <= Math.log2(mx + 1)), fmt: v => Math.round(2 ** v - 1) });
  const sc = [1, 0.9, 1.5, 8, 1];
  chart($('#bGenesC'), [0, 1, 2, 3, 4].map(k => ({ f: r => r.mg[k] / sc[k], color: GC[k], width: k === 0 ? 2.2 : 1.5 })), { ymin: 0, ymax: 1, ticks: [0, 0.5, 1], fmt: v => v.toFixed(1) });
  let am = 20; for (const r of D.history) am = Math.max(am, r.gape || 0, diam(r.mx) * 0.7);
  chart($('#bArms'), [
    { f: r => diam(r.ms), color: '#86c95e', width: 2 },
    { f: r => (r.preds ? r.gape : null), color: '#ff7aa8', width: 2 },
  ], { ymin: 0, ymax: Math.ceil(am / 10) * 10, ticks: [0, Math.ceil(am / 20) * 10, Math.ceil(am / 10) * 10], fmt: v => v });
  chart($('#bEnv'), [
    { f: r => r.env && r.env.L, color: '#f0c04a', width: 1.8 },
    { f: r => r.env && r.env.N, color: '#7ad8ff', width: 1.8 },
    { f: r => r.env && r.env.P / 5, color: '#ff7aa8', width: 1.4 },
    { f: r => r.env && r.env.S * 1.5, color: '#9a7a52', width: 1, alpha: 0.7 },
  ], { ymin: 0, ymax: 1.6, ticks: [0, 0.5, 1, 1.5], fmt: v => v.toFixed(1) });
  $('#bOrgLeg').innerHTML = `<span><i style="background:#86c95e"></i> ${t('l_inG')}</span><span><i style="background:#f0c04a"></i> ${t('l_ms')}</span><span><i style="background:#f0c04a;opacity:.45"></i> ${t('l_mx')}</span>`;
  $('#bGenesLeg').innerHTML = ['g_adh', 'g_soma', 'g_swim', 'g_bond', 'g_buoy'].map((k, i) => `<span><i style="background:${GC[i]}"></i> ${t(k)}</span>`).join('');
  $('#bArmsLeg').innerHTML = `<span><i style="background:#86c95e"></i> ${t('l_diam')}</span><span><i style="background:#ff7aa8"></i> ${t('l_gape')}</span>`;
  $('#bEnvLeg').innerHTML = `<span><i style="background:#f0c04a"></i> ${t('l_L')}</span><span><i style="background:#7ad8ff"></i> ${t('l_N')}</span><span><i style="background:#ff7aa8"></i> ${t('l_P')} ÷5</span><span><i style="background:#9a7a52"></i> ${t('l_S')}</span>`;
}

/* ---------------- fossils ---------------- */
function drawFossil(cv, f) {
  const { ctx, w, h } = fit(cv);
  ctx.fillStyle = '#041016'; ctx.fillRect(0, 0, w, h);
  let mr = 10; for (const [x, z] of f.cells) mr = Math.max(mr, Math.hypot(x, z) + 8);
  const s = Math.min(w, h) / (2 * mr) * 0.9, ox = w / 2, oy = h / 2;
  ctx.strokeStyle = 'rgba(225,245,230,0.55)'; ctx.lineWidth = Math.max(0.8, s * 0.6); ctx.beginPath();
  for (const [i, j] of f.bonds || []) { const a = f.cells[i], b = f.cells[j]; if (!a || !b) continue; ctx.moveTo(ox + a[0] * s, oy + a[1] * s); ctx.lineTo(ox + b[0] * s, oy + b[1] * s); }
  ctx.stroke();
  const cr = Math.max(1.5, 5 * s * 0.95);
  for (const [x, z, so] of f.cells) { ctx.fillStyle = so ? '#ffc06e' : `hsl(${f.hue},70%,62%)`; ctx.beginPath(); ctx.arc(ox + x * s, oy + z * s, cr, 0, 6.2832); ctx.fill(); }
}
function renderFossils() {
  const box = $('#bFossils');
  if (!D.fossils.length) { box.innerHTML = `<p class="insp-empty">${t('nodata')}</p>`; return; }
  // largest per era first, then the biggest overall, then the latest
  const byEra = new Map(); for (const f of D.fossils) { const b = byEra.get(f.era); if (!b || f.n > b.n) byEra.set(f.era, f); }
  const pick = []; const add = (f) => { if (f && !pick.includes(f)) pick.push(f); };
  Array.from(byEra.values()).forEach(add);
  D.fossils.slice().sort((a, b) => b.n - a.n).slice(0, 8).forEach(add);
  D.fossils.slice(-6).forEach(add);
  const show = pick.slice(0, 16);
  box.innerHTML = show.map((f, i) => `<figure class="fossil"><canvas data-f="${i}"></canvas><figcaption><b class="mono">${f.n} ${t('cells')}</b><span>${t('era')} ${f.era} · ${t('gen')} ${Math.round(f.gens)}</span><span>${new Date(f.wall).toLocaleDateString(lang() === 'ar' ? 'ar' : 'en')}</span></figcaption></figure>`).join('');
  box.querySelectorAll('canvas').forEach(cv => drawFossil(cv, show[+cv.dataset.f]));
}

/* ---------------- ladder, records ---------------- */
function renderLadder() {
  const reached = new Map();
  for (const m of D.milestones) if (m.key.startsWith('ms_') && !reached.has(m.key)) reached.set(m.key, m);
  const rungs = ['single', 'ms_plumes', 'ms_first8', 'ms_half', 'ms_32', 'ms_soma', 'ms_float', 'ms_majority', 'ms_gape'];
  let html = rungs.map(k => {
    const m = k === 'single' ? (D.summary ? { gens: 0, wall: D.summary.started } : null) : reached.get(k);
    return `<li class="${m ? 'on' : ''}"><span>${t('rung_' + k)}</span><em class="mono">${m ? (t('gen') + ' ' + Math.round(m.gens) + ' · ' + new Date(m.wall).toLocaleDateString(lang() === 'ar' ? 'ar' : 'en')) : '—'}</em></li>`;
  }).join('');
  html += `<li class="ceiling"><span>${t('ladder_ceiling')}</span></li>`;
  html += ['types', 'dev', 'nerve', 'brain', 'human'].map(k => `<li class="locked"><span>${t('rung_' + k)}</span><em>${t('ceiling_note')}</em></li>`).join('');
  $('#bLadder').innerHTML = html;
}
function renderRecords() {
  const S = D.summary;
  if (!S) { $('#bRecords').innerHTML = ''; $('#bNow').innerHTML = `<dt></dt><dd>${t('nodata')}</dd>`; return; }
  const r = S.records;
  $('#bRecords').innerHTML = `
    <dt>${t('r_maxSize')}</dt><dd>${r.maxSize} ${t('cells')}</dd>
    <dt>${t('r_maxInGroups')}</dt><dd>${Math.round(r.maxInGroups * 100)}%</dd>
    <dt>${t('r_maxSoma')}</dt><dd>${Math.round(r.maxSoma * 100)}%</dd>
    <dt>${t('r_maxGape')}</dt><dd>${r.maxGape} µm</dd>
    <dt>${t('r_maxColonyGen')}</dt><dd>${r.maxColonyGen}</dd>
    <dt>${t('r_maxBuoy')}</dt><dd>${r.maxBuoy}</dd>`;
  const n = S.now;
  $('#bNow').innerHTML = `
    <dt>${t('n_cells')}</dt><dd>${n.cells}</dd>
    <dt>${t('n_inG')}</dt><dd>${Math.round(n.inGroups * 100)}%</dd>
    <dt>${t('n_size')}</dt><dd>${n.meanSize} (max ${n.maxSize})</dd>
    <dt>${t('n_pred')}</dt><dd>${n.predators} · ${n.gape} µm</dd>
    ${n.env ? `<dt>${t('n_env')}</dt><dd>L ${n.env.L} · N ${n.env.N} · P ${n.env.P}${n.env.S ? ' · sed' : ''}</dd>` : ''}`;
}
function renderStatus() {
  const S = D.summary;
  $('#bSince').textContent = S ? ago(S.started) : '—';
  $('#bGens').textContent = S ? Math.round(S.generations).toLocaleString('en') : '—';
  $('#bBio').textContent = S ? bioTime(S.biologicalHours) : '—';
  $('#bEra').textContent = S ? S.era : '—';
  $('#bRuns').textContent = S ? S.runs : '—';
  $('#bUpd').textContent = S ? ago(S.updated) : '—';
  $('#bSource').textContent = D.source ? `${t('loaded')}: ${D.source}` : t('nodata');
  $('#bWatch').disabled = !D.source;
}
function renderMs() {
  const box = $('#bMs');
  if (!D.milestones.length) { box.innerHTML = `<p class="insp-empty">${t('nodata')}</p>`; return; }
  box.innerHTML = D.milestones.slice().reverse().map(m => `<div class="ms"><time>${new Date(m.wall).toLocaleString(lang() === 'ar' ? 'ar' : 'en', { dateStyle: 'short', timeStyle: 'short' })}</time><span>${m.key === 'extinction' ? t('ms_extinction') : t('rung_' + m.key)} · ${t('era')} ${m.era} · ${t('gen')} ${Math.round(m.gens)}</span></div>`).join('');
}

/* ---------------- laws ---------------- */
function lawScatter(cv, law) {
  const { ctx, w, h } = fit(cv); ctx.clearRect(0, 0, w, h);
  const pts = law.pts || []; const pad = { l: 34, r: 8, t: 8, b: 20 };
  ctx.direction = 'ltr'; ctx.font = '10px ' + css('--mono');
  if (law.id === 'bioconvection') {
    if (!pts.length) return;
    const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
    const xmax = Math.max(...xs) * 1.05, ymax = Math.max(15, Math.max(...ys) * 1.1);
    const X = (v) => pad.l + v / xmax * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - v / ymax) * (h - pad.t - pad.b);
    ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (const v of [0, ymax / 2, ymax]) { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); ctx.fillText(Math.round(v), pad.l - 4, Y(v)); }
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (const v of [0, xmax / 2, xmax]) ctx.fillText((v / 1e6).toFixed(1) + 'M/mL', X(v), h - pad.b + 4);
    ctx.strokeStyle = '#7ad8ff'; ctx.lineWidth = 2; ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(X(p[0]), Y(p[1])) : ctx.moveTo(X(p[0]), Y(p[1]))); ctx.stroke();
    ctx.fillStyle = '#7ad8ff'; for (const p of pts) { ctx.beginPath(); ctx.arc(X(p[0]), Y(p[1]), 3, 0, 6.2832); ctx.fill(); }
    if (law.threshold) { ctx.strokeStyle = css('--saffron'); ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(law.threshold), pad.t); ctx.lineTo(X(law.threshold), h - pad.b); ctx.stroke(); ctx.setLineDash([]); }
    return;
  }
  if (!pts.length) { ctx.fillStyle = css('--sand-3'); ctx.textAlign = 'center'; ctx.fillText('…', w / 2, h / 2); return; }
  let mx = 0; for (const [x, y] of pts) mx = Math.max(mx, Math.abs(x), Math.abs(y));
  mx = mx * 1.1 || 1;
  let mn = 0; for (const [x, y] of pts) mn = Math.min(mn, x, y); mn = mn < 0 ? mn * 1.1 : 0;
  const X = (v) => pad.l + (v - mn) / (mx - mn) * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - (v - mn) / (mx - mn)) * (h - pad.t - pad.b);
  ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of [mn, (mn + mx) / 2, mx]) { ctx.beginPath(); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); ctx.fillText(v.toFixed(mx < 0.1 ? 3 : 2), pad.l - 4, Y(v)); }
  // theory: y = x
  ctx.strokeStyle = css('--sand-2'); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(mn), Y(mn)); ctx.lineTo(X(mx), Y(mx)); ctx.stroke(); ctx.setLineDash([]);
  if (law.fit) { ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(mn), Y(mn * law.fit.k)); ctx.lineTo(X(mx), Y(mx * law.fit.k)); ctx.stroke(); }
  ctx.fillStyle = 'rgba(122,216,255,0.75)';
  for (const [x, y] of pts) { ctx.beginPath(); ctx.arc(X(x), Y(y), 2.6, 0, 6.2832); ctx.fill(); }
  if (law.axes) { ctx.fillStyle = css('--sand-2'); ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillText(law.axes[0] + ' →', (pad.l + w) / 2, h); }
}
function renderLaws() {
  const box = $('#bLaws');
  if (!D.laws) { box.innerHTML = `<p class="insp-empty">${t('nodata')}</p>`; $('#bLawsMeta').textContent = ''; return; }
  const total = Object.values(D.laws.counts || {}).reduce((a, b) => a + b, 0);
  $('#bLawsMeta').textContent = `${total} ${t('n_exp')} · ${ago(D.laws.updated)}`;
  const cls = (v) => v === 'supported' ? 'good' : v === 'pending' ? 'wait' : 'bad';
  box.innerHTML = D.laws.laws.map((law, i) => {
    let body = '';
    if (law.pts !== undefined) {
      const f = law.fit;
      body = `<canvas class="lawc" data-l="${i}"></canvas><p class="note">${(LAW_EXTRA[law.id] || {})[lang()] || ''}${f ? ` · ${t('fitk')} ${f.k} ± ${f.se} · ${t('r2')} ${f.r2} · n ${f.n}` : ''}${law.threshold ? ` · ${t('threshold')} ≈ ${(law.threshold / 1e6).toFixed(1)}M/mL` : ''}</p>`;
    } else if (law.id === 'predation') {
      body = `<div class="eq"><div><span>${t('withP')}</span><b>${law.withPred.frac === null ? '—' : Math.round(law.withPred.frac * 100) + '%'}</b><span class="mono">n ${law.withPred.n}</span></div><div><span>${t('withoutP')}</span><b>${law.without.frac === null ? '—' : Math.round(law.without.frac * 100) + '%'}</b><span class="mono">n ${law.without.n}</span></div></div>`;
    } else if (law.id === 'redqueen') {
      body = `<div class="eq"><div><span>${t('transitions')}</span><b>${law.transitions}</b></div><div><span>${t('collapses')}</span><b>${law.collapses}</b></div><div><span>gape / ⌀</span><b>${law.gapeRatio ?? '—'}</b></div></div>`;
    } else if (law.id === 'chimeras') {
      body = `<div class="eq"><div><span>${t('clonal')} · ${t('rel')}</span><b>${law.clonal.rel ?? '—'}</b><span class="mono">n ${law.clonal.n}</span></div><div><span>${t('chimeric')} · ${t('rel')}</span><b>${law.chimeric.rel ?? '—'}</b><span class="mono">n ${law.chimeric.n}</span></div></div>`;
    }
    return `<article class="law"><header><span class="pill ${cls(law.verdict)}">${t('v_' + law.verdict)}</span><span class="note">${t('w_' + law.world)}</span></header><h3>${law.statement[lang()]}</h3>${body}</article>`;
  }).join('');
  box.querySelectorAll('canvas.lawc').forEach(cv => lawScatter(cv, D.laws.laws[+cv.dataset.l]));
}

function render() { renderStatus(); renderLadder(); renderRecords(); drawCharts(); renderFossils(); renderLaws(); renderMs(); }
function applyLang() {
  $$('[data-b18n]').forEach(el => { const v = L[lang()][el.dataset.b18n]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-b18n-html]').forEach(el => { el.innerHTML = L[lang()][el.dataset.b18nHtml]; });
  render();
}
$('#bWatch').onclick = watch;
$('#bReload').onclick = load;
document.addEventListener('genesis:lang', applyLang);
window.addEventListener('resize', () => { if (document.body.dataset.world === 'obs') { drawCharts(); renderFossils(); renderLaws(); } });
applyLang();
load();
setInterval(() => { if (document.body.dataset.world === 'obs') load(); }, 10 * 60 * 1000);
})();
