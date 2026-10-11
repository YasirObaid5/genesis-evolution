/* ===================================================================
   GENESIS · ORIGINS — dark-field microscope interface
   =================================================================== */
(function () {
'use strict';
const { Origins, ADH, SECR, SOMA, SINGLE, FIS, W, H, R, GX, GY } = GenesisOrigins;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const MIN_PER_TICK = 0.5;            // one step ≈ 30 s of microbial time
const UM_PER_UNIT = 0.625;           // cell diameter 8 units ≈ 5 µm, yeast-sized

/* ---------------- i18n ---------------- */
const L = {
  ar: {
    o_intro: 'خلايا منفردة في قطرة ماء. كل خلية تحمل خمسة جينات: <b>الالتصاق</b> (هل تبقى ابنتها ملتصقة بها بعد الانقسام؟)، و<b>إفراز إنزيم</b> يهضم الغذاء المعقد وينفع كل من حولها، و<b>التخصص الجسدي</b> (خلايا عقيمة تسبح وتجرّ المجموعة)، و<b>نمط التكاثر</b> (خلية واحدة أم قطعة)، و<b>حجم الانقسام</b>. المفترسات تبتلع ما يتسع له فمها، وفمها يتطور أيضًا. لا شيء هنا يقول «كن متعدد الخلايا». راقب ماذا يحدث.',
    hours: 'ساعة', gens: 'جيل خلوي', cells: 'خلية', colonies: 'كائن', o_multiCols: 'كائن متعدد الخلايا', inGroups: 'في مجموعات', predators: 'مفترس',
    forces: 'قوى الانتخاب', o_pred: 'مفترسات محدودة الفم', o_pred_d: 'تبتلع الوحدات الأصغر من فمها',
    o_aggr: 'الالتحام بالغرباء', o_aggr_d: 'خلايا من سلالات مختلفة تلتصق عند التلامس',
    lifecycle: 'دورة الحياة', lc_free: 'تتطور', lc_single: 'خلية واحدة', lc_chunk: 'تفتّت',
    o_env: 'البيئة', o_simple: 'غذاء بسيط (بقع متحركة)', o_poly: 'غذاء معقد يحتاج إنزيمًا', o_patch: 'سرعة انجراف البقع', o_cost: 'تكلفة إفراز الإنزيم', o_mut: 'معدل الطفرات لكل جين',
    o_actions: 'تدخلات', o_big: 'أطلق مفترسات أكبر', o_plague: 'انقراض جماعي 85%', o_reset: 'قطرة جديدة',
    o_color: 'التلوين', cb_lin: 'السلالة', cb_type: 'نوع الخلية (تكاثرية / جسدية)', cb_secr: 'التعاون (إفراز الإنزيم)', cb_adh: 'الالتصاق',
    o_river: 'نهر الأشكال', o_river_s: 'نسبة الخلايا حسب حجم الكائن الذي تعيش فيه',
    o_price: 'معادلة برايس', o_price_s: 'الانتخاب على التعاون: بين الكائنات مقابل داخلها',
    o_between: 'بين الكائنات', o_within: 'داخل الكائن', o_rel: 'الارتباط r',
    o_galton: 'توريث حجم الكائن', o_galton_s: 'حجم الابن عند تكاثره الأول مقابل حجم أمه (log₂)',
    o_slope: 'الميل', o_pairs: 'أزواج أم-ابن', o_meanS: 'متوسط الحجم',
    o_arms: 'سباق التسلح', o_arms_s: 'حجم الكائن مقابل فم المفترس (بالخلايا، مقياس log₂)',
    o_size: 'حجم الكائن', o_gape: 'فم المفترس', o_npred: 'عدد المفترسات',
    o_genes: 'الجينات', o_genes_s: 'متوسطات القطرة',
    g_adh: 'الالتصاق', g_secr: 'الإفراز', g_soma: 'التخصص الجسدي', g_single: 'التكاثر بخلية واحدة', g_fis: 'حجم الانقسام',
    cls: ['خلية منفردة', '2–3', '4–15', '16–63', '64+'],
    o_card: 'بطاقة الكائن', o_card_empty: 'اضغط على أي خلية أو كائن تحت المجهر لعرض بنيته وجيناته وسلالته.',
    o_follow: 'تتبّع', o_unfollow: 'إيقاف التتبّع', o_zoomto: 'اقترب',
    multi: 'متعدد الخلايا', uni: 'وحيد الخلية', chimera: 'خيمري', eaten: 'التُهم', dead: 'انتهى',
    o_age: 'العمر', o_kids: 'كائنات وُلدت منه', o_repro: 'حجمه عند أول تكاثر', o_peak: 'أقصى حجم', o_genos: 'طرز وراثية داخله', o_somaF: 'خلايا جسدية', o_gen: 'جيل الكائن',
    o_lineage: 'السلالة: أقصى حجم لكل سلف (الأقدم ← الأحدث)', min: 'دقيقة', hr: 'ساعة',
    ev_start: 'قطرة جديدة: 320 خلية منفردة لا تلتصق تقريبًا', ev_ms_first16: 'ظهر أول كائن من 16 خلية', ev_ms_half: 'نصف الخلايا تعيش الآن داخل كائنات متعددة الخلايا',
    ev_ms_64: 'كائن من 64 خلية', ev_ms_256: 'كائن عملاق من 256 خلية', ev_ms_soma: 'تقسيم العمل: 15% من الخلايا الملتصقة صارت جسدية عقيمة', ev_ms_majority: 'اكتمل الانتقال: 90% من الخلايا داخل كائنات',
    ev_ms_gape4: 'المفترسات طوّرت أفواهًا تبتلع 4 خلايا', ev_ms_gape8: 'المفترسات تبتلع الآن كائنات من 8 خلايا',
    ev_predExtinct: 'انقرضت المفترسات: لم يعد هناك ما تبتلعه', ev_predImmigr: 'هاجرت مفترسات جديدة إلى القطرة', ev_predOn: 'أُطلقت المفترسات', ev_predOff: 'أُزيلت المفترسات',
    ev_aggrOn: 'صار الالتحام بالغرباء ممكنًا', ev_aggrOff: 'أُلغي الالتحام بالغرباء', ev_life_free: 'دورة الحياة تتطور بحرية', ev_life_single: 'فُرض التكاثر عبر خلية واحدة', ev_life_chunk: 'فُرض التكاثر بالتفتّت',
    ev_plague: 'انقراض جماعي: ماتت 85% من الخلايا عشوائيًا', ev_bigPred: 'أُطلقت مفترسات بفم يتسع لـ{g} خلية', ev_preset: 'تجربة',
    op_origin: 'من خلية واحدة', op_origin_d: 'مفترسات + غذاء معقد. هل تظهر الكائنات متعددة الخلايا؟',
    op_pg: 'الإنزيم وحده', op_pg_d: 'بلا مفترسات. هل يكفي التعاون في الهضم؟',
    op_aggr: 'كائنات خيمرية', op_aggr_d: 'الخلايا تلتحم بالغرباء. كائنات عملاقة وارتباط أقل.',
    op_arms: 'سباق التسلح', op_arms_d: 'مفترسات بفم أكبر من متوسط الكائنات الحالية.',
    op_plague: 'انقراض جماعي', op_plague_d: 'تموت 85% من الخلايا. من ينجو؟',
    op_single: 'عنق زجاجة إلزامي', op_single_d: 'كل كائن يبدأ من خلية واحدة.',
    log: 'سجلّ الأحداث', scale: 'ميكرومتر', mag: 'تكبير', field: 'مجهر الحقل المظلم',
    o_hint: 'اسحب للتحريك · عجلة الفأرة للتكبير · اضغط على كائن',
    banner_ms_first16: 'أول كائن من 16 خلية', banner_ms_half: 'نصف الحياة صار جماعيًا', banner_ms_64: 'كائن من 64 خلية',
    banner_ms_256: 'كائن عملاق: 256 خلية', banner_ms_soma: 'ظهر تقسيم العمل', banner_ms_majority: 'اكتمل الانتقال إلى تعدد الخلايا', banner_ms_gape4: 'المفترسات تردّ: أفواه أكبر', banner_ms_gape8: 'سباق تسلح: أفواه تتسع لـ 8 خلايا',
    o_hist_empty: 'تتراكم البيانات خلال ثوانٍ…', o_footer: 'النموذج مستلهم من تجارب «خميرة ندفة الثلج» (Ratcliff وزملاؤه 2012، Bozdag وزملاؤه 2023) ومن استخدام الإنزيم كمنفعة عامة. الوحدات تقريبية: خطوة ≈ 30 ثانية، قطر الخلية ≈ 5 ميكرومتر.',
  },
  en: {
    o_intro: 'Single cells in a drop of water. Each carries five genes: <b>adhesion</b> (does the daughter stay stuck after division?), <b>enzyme secretion</b> that digests complex food and helps every neighbour, <b>somatic specialisation</b> (sterile swimmer cells that pull the group), <b>propagule mode</b> (one cell or a chunk) and <b>fission size</b>. Predators swallow anything that fits their mouth, and their mouth evolves too. Nothing here says “become multicellular”. Watch what happens.',
    hours: 'hours', gens: 'cell generations', cells: 'cells', colonies: 'organisms', o_multiCols: 'multicellular organisms', inGroups: 'in groups', predators: 'predators',
    forces: 'Selective forces', o_pred: 'Gape-limited predators', o_pred_d: 'They swallow units smaller than their mouth',
    o_aggr: 'Stick to strangers', o_aggr_d: 'Cells of different lineages bond on contact',
    lifecycle: 'Life cycle', lc_free: 'Evolves', lc_single: 'Single cell', lc_chunk: 'Fragments',
    o_env: 'Environment', o_simple: 'Simple food (drifting patches)', o_poly: 'Complex food needing enzyme', o_patch: 'Patch drift speed', o_cost: 'Cost of secreting enzyme', o_mut: 'Mutation rate per gene',
    o_actions: 'Interventions', o_big: 'Release bigger predators', o_plague: 'Mass extinction 85%', o_reset: 'New drop',
    o_color: 'Colour by', cb_lin: 'Lineage', cb_type: 'Cell type (germ / soma)', cb_secr: 'Cooperation (enzyme secretion)', cb_adh: 'Adhesion',
    o_river: 'River of forms', o_river_s: 'Share of cells by the size of the organism they live in',
    o_price: 'Price equation', o_price_s: 'Selection on cooperation: between organisms vs within them',
    o_between: 'Between organisms', o_within: 'Within organism', o_rel: 'Relatedness r',
    o_galton: 'Heritability of organism size', o_galton_s: 'Offspring size at first reproduction vs its parent’s (log₂)',
    o_slope: 'Slope', o_pairs: 'Parent–offspring pairs', o_meanS: 'Mean size',
    o_arms: 'Arms race', o_arms_s: 'Organism size vs predator gape (cells, log₂ scale)',
    o_size: 'Organism size', o_gape: 'Predator gape', o_npred: 'Predators',
    o_genes: 'Genes', o_genes_s: 'Means across the drop',
    g_adh: 'Adhesion', g_secr: 'Secretion', g_soma: 'Somatic fate', g_single: 'Single-cell propagule', g_fis: 'Fission size',
    cls: ['Single cell', '2–3', '4–15', '16–63', '64+'],
    o_card: 'Organism card', o_card_empty: 'Click any cell or organism under the microscope to see its body plan, genes and lineage.',
    o_follow: 'Follow', o_unfollow: 'Stop following', o_zoomto: 'Zoom in',
    multi: 'Multicellular', uni: 'Unicellular', chimera: 'Chimeric', eaten: 'Eaten', dead: 'Gone',
    o_age: 'Age', o_kids: 'Offspring organisms', o_repro: 'Size at first reproduction', o_peak: 'Peak size', o_genos: 'Genotypes inside', o_somaF: 'Somatic cells', o_gen: 'Organism generation',
    o_lineage: 'Lineage: peak size of each ancestor (oldest → newest)', min: 'min', hr: 'h',
    ev_start: 'New drop: 320 single cells that barely stick', ev_ms_first16: 'The first 16-cell organism appeared', ev_ms_half: 'Half of all cells now live inside multicellular organisms',
    ev_ms_64: 'A 64-cell organism', ev_ms_256: 'A giant 256-cell organism', ev_ms_soma: 'Division of labour: 15% of bonded cells are sterile soma', ev_ms_majority: 'Transition complete: 90% of cells live in organisms',
    ev_ms_gape4: 'Predators evolved mouths that swallow 4 cells', ev_ms_gape8: 'Predators now swallow 8-cell organisms',
    ev_predExtinct: 'Predators went extinct: nothing left that fits their mouths', ev_predImmigr: 'New predators drifted into the drop', ev_predOn: 'Predators released', ev_predOff: 'Predators removed',
    ev_aggrOn: 'Cells can now bond to strangers', ev_aggrOff: 'Bonding to strangers switched off', ev_life_free: 'Life cycle evolves freely', ev_life_single: 'Reproduction forced through a single cell', ev_life_chunk: 'Reproduction forced by fragmentation',
    ev_plague: 'Mass extinction: 85% of cells died at random', ev_bigPred: 'Released predators that swallow {g} cells', ev_preset: 'Experiment',
    op_origin: 'From a single cell', op_origin_d: 'Predators + complex food. Will multicellular organisms appear?',
    op_pg: 'Enzyme alone', op_pg_d: 'No predators. Is cooperative digestion enough?',
    op_aggr: 'Chimeric organisms', op_aggr_d: 'Cells fuse with strangers. Giant bodies, lower relatedness.',
    op_arms: 'Arms race', op_arms_d: 'Predators with a mouth bigger than today’s organisms.',
    op_plague: 'Mass extinction', op_plague_d: '85% of cells die. Who survives?',
    op_single: 'Forced bottleneck', op_single_d: 'Every organism starts from one cell.',
    log: 'Event log', scale: 'µm', mag: 'magnification', field: 'dark-field microscope',
    o_hint: 'Drag to pan · scroll to zoom · click an organism',
    banner_ms_first16: 'The first 16-cell organism', banner_ms_half: 'Half of life is now collective', banner_ms_64: 'A 64-cell organism',
    banner_ms_256: 'A giant: 256 cells', banner_ms_soma: 'Division of labour has appeared', banner_ms_majority: 'The transition to multicellularity is complete', banner_ms_gape4: 'Predators answer: bigger mouths', banner_ms_gape8: 'Arms race: mouths that fit 8 cells',
    o_hist_empty: 'Data accumulates within seconds…', o_footer: 'Model inspired by the snowflake-yeast experiments (Ratcliff et al. 2012; Bozdag et al. 2023) and by secreted enzymes as public goods. Units are approximate: one step ≈ 30 s, cell diameter ≈ 5 µm.',
  },
};
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
const t = (k) => (L[lang()][k] !== undefined ? L[lang()][k] : k);

/* ---------------- state ---------------- */
let seed = 4242;
let sim = new Origins(seed, { predators: true });
let running = true, speed = 4, selected = null, follow = false, colorBy = 'lin';
const cam = { z: 1, x: W / 2, y: H / 2 };
let banner = null, lastEv = -1, frame = 0, lastMsSeen = 0;

/* ---------------- canvas helpers ---------------- */
function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d');
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

/* halo sprites, one per hue bucket */
const SPR = 64, HB = 36;
const halo = [];
for (let i = 0; i < HB; i++) {
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const x = c.getContext('2d'), h = i * (360 / HB);
  const g = x.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
  g.addColorStop(0, `hsla(${h},95%,72%,0.95)`); g.addColorStop(0.35, `hsla(${h},90%,58%,0.38)`); g.addColorStop(1, `hsla(${h},85%,45%,0)`);
  x.fillStyle = g; x.fillRect(0, 0, SPR, SPR); halo.push(c);
}
const glowW = (() => {
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const x = c.getContext('2d'); const g = x.createRadialGradient(SPR / 2, SPR / 2, 0, SPR / 2, SPR / 2, SPR / 2);
  g.addColorStop(0, 'rgba(200,235,255,0.8)'); g.addColorStop(0.4, 'rgba(160,210,240,0.2)'); g.addColorStop(1, 'rgba(160,210,240,0)');
  x.fillStyle = g; x.fillRect(0, 0, SPR, SPR); return c;
})();
const fieldC = document.createElement('canvas'); fieldC.width = GX; fieldC.height = GY;
const fctx = fieldC.getContext('2d'); const fimg = fctx.createImageData(GX, GY);

/* colour buckets for cells */
const SEQ = 12;
const seqCols = Array.from({ length: SEQ }, (_, i) => {
  const x = i / (SEQ - 1);
  // cheater (dim ember) → cooperator (bright aqua)
  const h = 12 + x * 160, l = 42 + x * 26, s = 75;
  return `hsl(${h},${s}%,${l}%)`;
});
const linMulti = Array.from({ length: HB }, (_, i) => `hsl(${i * 10},78%,66%)`);
const linSingle = Array.from({ length: HB }, (_, i) => `hsl(${i * 10},22%,72%)`);
const buckets = Array.from({ length: 2 * HB + SEQ + 4 }, () => []);

/* ---------------- camera ---------------- */
function view(w, h) {
  const s = (w / W) * cam.z;
  const hw = w / (2 * s), hh = h / (2 * s);
  cam.x = Math.min(W - hw, Math.max(hw, cam.x));
  cam.y = Math.min(H - hh, Math.max(hh, cam.y));
  return { s, ox: w / 2 - cam.x * s, oy: h / 2 - cam.y * s };
}

/* ---------------- world rendering ---------------- */
const canvas = $('#scope');
function drawScope() {
  const { ctx, w, h } = fit(canvas);
  if (follow && selected && selected.alive) {
    let sx = 0, sy = 0; for (const c of selected.cells) { sx += c.x; sy += c.y; }
    const n = selected.cells.length || 1;
    cam.x += (sx / n - cam.x) * 0.12; cam.y += (sy / n - cam.y) * 0.12;
  }
  const { s, ox, oy } = view(w, h);
  ctx.fillStyle = '#03070a'; ctx.fillRect(0, 0, w, h);

  // chemical fields: simple food teal, complex food violet, enzyme amber
  const d = fimg.data, N = sim.N, P = sim.P, E = sim.E;
  for (let i = 0; i < GX * GY; i++) {
    const n = Math.min(1, N[i] * 1.8), p = Math.min(1, P[i] * 0.9), e = Math.min(1, E[i] * 9);
    d[4 * i] = 4 + 46 * p + 150 * e;
    d[4 * i + 1] = 10 + 92 * n + 90 * e;
    d[4 * i + 2] = 16 + 80 * n + 70 * p + 10 * e;
    d[4 * i + 3] = 255;
  }
  fctx.putImageData(fimg, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.globalAlpha = 0.75; ctx.drawImage(fieldC, ox, oy, W * s, H * s); ctx.globalAlpha = 1;

  const cells = sim.cells;
  const cr = Math.max(1.3, R * s * 0.92);
  const inView = (x, y, m) => x > -m && x < w + m && y > -m && y < h + m;

  // halos (additive): the soft bodies of organisms
  ctx.globalCompositeOperation = 'lighter';
  const hr = R * s * 5.2;
  for (const c of cells) {
    const x = c.x * s + ox, y = c.y * s + oy;
    if (!inView(x, y, hr)) continue;
    const n = c.col.cells.length;
    if (n > 1) { ctx.globalAlpha = 0.16; ctx.drawImage(halo[((c.col.hue / 10) | 0) % HB], x - hr, y - hr, 2 * hr, 2 * hr); }
    else { ctx.globalAlpha = 0.1; ctx.drawImage(glowW, x - hr * 0.6, y - hr * 0.6, hr * 1.2, hr * 1.2); }
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';

  // bonds
  ctx.beginPath();
  for (const c of cells) {
    if (!c.b.length) continue;
    const x = c.x * s + ox, y = c.y * s + oy;
    if (!inView(x, y, 30)) continue;
    for (const o of c.b) if (o.id > c.id) { ctx.moveTo(x, y); ctx.lineTo(o.x * s + ox, o.y * s + oy); }
  }
  ctx.strokeStyle = 'rgba(214,240,255,0.42)'; ctx.lineWidth = Math.max(0.6, 0.35 * s); ctx.stroke();

  // cell bodies, batched by colour bucket
  for (const b of buckets) b.length = 0;
  for (const c of cells) {
    const x = c.x * s + ox, y = c.y * s + oy;
    if (!inView(x, y, cr)) continue;
    let k;
    if (colorBy === 'lin') k = (c.col.cells.length > 1 ? 0 : HB) + (((c.col.hue / 10) | 0) % HB);
    else if (colorBy === 'type') k = 2 * HB + SEQ + (c.col.cells.length === 1 ? 2 : c.type);
    else k = 2 * HB + Math.min(SEQ - 1, Math.round((colorBy === 'secr' ? c.g[SECR] : c.g[ADH]) * (SEQ - 1)));
    buckets[k].push(x, y);
  }
  const typeCols = ['#8fe8d4', '#ffb86b', '#9fb4c0'];
  for (let k = 0; k < buckets.length; k++) {
    const b = buckets[k]; if (!b.length) continue;
    ctx.fillStyle = k < HB ? linMulti[k] : k < 2 * HB ? linSingle[k - HB] : k < 2 * HB + SEQ ? seqCols[k - 2 * HB] : typeCols[k - 2 * HB - SEQ];
    ctx.beginPath();
    for (let i = 0; i < b.length; i += 2) { ctx.moveTo(b[i] + cr, b[i + 1]); ctx.arc(b[i], b[i + 1], cr, 0, 6.2832); }
    ctx.fill();
  }
  // nuclei and flagella when zoomed in
  if (s > 1.6) {
    const now = performance.now() / 120;
    ctx.fillStyle = 'rgba(3,7,10,0.45)';
    ctx.beginPath();
    for (const c of cells) {
      const x = c.x * s + ox, y = c.y * s + oy;
      if (!inView(x, y, cr)) continue;
      ctx.moveTo(x + cr * 0.35, y); ctx.arc(x, y, cr * 0.35, 0, 6.2832);
    }
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,196,130,0.85)'; ctx.lineWidth = Math.max(0.7, 0.3 * s);
    ctx.beginPath();
    for (const c of cells) {
      if (c.type !== 1) continue;
      const x = c.x * s + ox, y = c.y * s + oy;
      if (!inView(x, y, 40)) continue;
      const a = Math.atan2(c.vy, c.vx) + Math.PI, L2 = cr * 2.4;
      const wig = Math.sin(now + c.id) * 0.5;
      ctx.moveTo(x + Math.cos(a) * cr, y + Math.sin(a) * cr);
      ctx.quadraticCurveTo(x + Math.cos(a + wig) * L2 * 0.6, y + Math.sin(a + wig) * L2 * 0.6, x + Math.cos(a - wig * 0.6) * L2, y + Math.sin(a - wig * 0.6) * L2);
    }
    ctx.stroke();
  } else {
    // soma as bright rims at low zoom
    ctx.strokeStyle = 'rgba(255,190,120,0.9)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (const c of cells) {
      if (c.type !== 1) continue;
      const x = c.x * s + ox, y = c.y * s + oy;
      if (!inView(x, y, cr)) continue;
      ctx.moveTo(x + cr + 0.8, y); ctx.arc(x, y, cr + 0.8, 0, 6.2832);
    }
    ctx.stroke();
  }

  // predators: amoeboid hunters
  const tt = performance.now() / 600;
  for (const pr of sim.preds) {
    const x = pr.x * s + ox, y = pr.y * s + oy, rp = sim.predRadius(pr) * s;
    if (!inView(x, y, rp * 2)) continue;
    ctx.beginPath();
    for (let i = 0; i <= 24; i++) {
      const a = i / 24 * 6.2832;
      const rr = rp * (1 + 0.13 * Math.sin(3 * a + pr.phase + tt) + 0.07 * Math.sin(5 * a - pr.phase * 1.3 - tt));
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    const g = ctx.createRadialGradient(x, y, rp * 0.1, x, y, rp * 1.15);
    g.addColorStop(0, pr.flash ? 'rgba(255,170,205,0.55)' : 'rgba(255,120,170,0.32)');
    g.addColorStop(1, 'rgba(255,80,140,0.05)');
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = pr.flash ? 'rgba(255,215,235,0.95)' : 'rgba(255,140,190,0.7)'; ctx.lineWidth = pr.flash ? 2 : 1.2; ctx.stroke();
    ctx.fillStyle = 'rgba(255,200,225,0.55)';
    ctx.beginPath(); ctx.arc(x + rp * 0.25 * Math.cos(pr.phase), y + rp * 0.25 * Math.sin(pr.phase), rp * 0.22, 0, 6.2832); ctx.fill();
    if (pr.digest > 0) { ctx.fillStyle = 'rgba(255,230,160,0.5)'; ctx.beginPath(); ctx.arc(x - rp * 0.2, y + rp * 0.1, rp * 0.14 * Math.min(1, pr.digest / 30), 0, 6.2832); ctx.fill(); }
    if (s > 1.4) {
      ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(255,190,215,0.9)'; ctx.font = `${Math.max(9, 3.2 * s)}px ${css('--mono')}`; ctx.textAlign = 'center';
      ctx.fillText('≤' + Math.floor(pr.gape), x, y - rp - 4);
    }
  }

  // selected organism
  if (selected && selected.alive && selected.cells.length) {
    let sx = 0, sy = 0, mr = 0; const cs = selected.cells;
    for (const c of cs) { sx += c.x; sy += c.y; }
    sx /= cs.length; sy /= cs.length;
    for (const c of cs) mr = Math.max(mr, Math.hypot(c.x - sx, c.y - sy));
    const x = sx * s + ox, y = sy * s + oy, rr = (mr + R * 3) * s;
    ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 1.6; ctx.setLineDash([6, 5]);
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = css('--saffron'); ctx.font = `12px ${css('--mono')}`; ctx.textAlign = 'center';
    ctx.fillText(`#${selected.id} · ${cs.length}`, x, y - rr - 6);
  }

  // eyepiece vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.38, w / 2, h / 2, Math.max(w, h) * 0.72);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

  // scale bar
  const pxPerUm = s / UM_PER_UNIT;
  const um = [5, 10, 20, 50, 100, 200, 500].find(v => v * pxPerUm >= 70) || 500;
  const bw = um * pxPerUm;
  ctx.direction = 'ltr';
  const bx = w - bw - 18, by = h - 18;
  ctx.fillStyle = 'rgba(235,223,196,0.9)'; ctx.fillRect(bx, by, bw, 3);
  ctx.font = `11px ${css('--mono')}`; ctx.textAlign = 'center'; ctx.fillText(`${um} µm`, bx + bw / 2, by - 6);
  ctx.textAlign = 'left'; ctx.fillStyle = 'rgba(235,223,196,0.55)';
  ctx.fillText(`×${Math.round(40 * cam.z)} · ${t('field')}`, 14, h - 14);

  // milestone banner
  if (banner) {
    const age = (performance.now() - banner.t0) / 1000;
    if (age > 6) banner = null;
    else {
      const a = Math.min(1, age / 0.6) * Math.min(1, (6 - age) / 1.2);
      ctx.globalAlpha = a;
      ctx.textAlign = 'center';
      ctx.direction = lang() === 'ar' ? 'rtl' : 'ltr';
      ctx.font = `600 ${Math.max(18, Math.min(34, w / 26))}px ${css('--display')}`;
      ctx.fillStyle = 'rgba(3,7,10,0.55)';
      const tw = ctx.measureText(banner.text).width;
      ctx.fillRect(w / 2 - tw / 2 - 22, h * 0.16 - 34, tw + 44, 54);
      ctx.fillStyle = css('--saffron');
      ctx.fillText(banner.text, w / 2, h * 0.16);
      ctx.globalAlpha = 1;
    }
  }
}

/* ---------------- charts ---------------- */
function axes(ctx, w, h, pad, ymin, ymax, ticks, fmt) {
  ctx.direction = 'ltr';
  ctx.font = '10px ' + css('--mono');
  ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.lineWidth = 1;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of ticks) {
    const y = pad.t + (1 - (v - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillText(fmt(v), pad.l - 4, y);
  }
}
function xHours(ctx, w, h, pad, xmin, xmax) {
  const hrs = (v) => v * MIN_PER_TICK / 60;
  const span = hrs(xmax) - hrs(xmin);
  const step = [1, 2, 5, 10, 20, 50, 100, 200, 500].find(s => span / s <= 5) || 1000;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = css('--sand-3');
  for (let v = Math.ceil(hrs(xmin) / step) * step; v <= hrs(xmax); v += step) {
    const x = pad.l + (v * 60 / MIN_PER_TICK - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r);
    ctx.fillText(v + t('hr'), x, h - pad.b + 4);
  }
}
const CLS_COL = ['#56707e', '#3fb3a6', '#86c95e', '#f0c04a', '#ff7a59'];
const GENE_COL = ['#7ad8ff', '#f0c04a', '#ffb86b', '#c59cff', '#86c95e'];

function drawRiver() {
  const c = $('#oRiver'); const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const Hh = sim.hist; const pad = { l: 34, r: 8, t: 6, b: 18 };
  if (Hh.length < 2) { ctx.fillStyle = css('--sand-3'); ctx.font = '12px ' + css('--body'); ctx.textAlign = 'center'; ctx.fillText(t('o_hist_empty'), w / 2, h / 2); return; }
  const xmin = Hh[0].t, xmax = Hh[Hh.length - 1].t;
  const X = (v) => pad.l + (v - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r);
  const Y = (v) => pad.t + (1 - v) * (h - pad.t - pad.b);
  // stacked from bottom: 64+ at the bottom so the multicellular flood rises
  const order = [4, 3, 2, 1, 0];
  const base = Hh.map(() => 0);
  for (const k of order) {
    ctx.beginPath();
    Hh.forEach((r, i) => { const y = Y(base[i] + r.cls[k]); i ? ctx.lineTo(X(r.t), y) : ctx.moveTo(X(r.t), y); });
    for (let i = Hh.length - 1; i >= 0; i--) ctx.lineTo(X(Hh[i].t), Y(base[i]));
    ctx.closePath(); ctx.fillStyle = CLS_COL[k]; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    Hh.forEach((r, i) => { base[i] += r.cls[k]; });
  }
  axes(ctx, w, h, pad, 0, 1, [0, 0.25, 0.5, 0.75, 1], v => Math.round(v * 100) + '%');
  xHours(ctx, w, h, pad, xmin, xmax);
}

function drawPrice() {
  const c = $('#oPrice'); const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const P = sim.price.slice(-36); const pad = { l: 44, r: 8, t: 8, b: 18 };
  if (!P.length) { ctx.fillStyle = css('--sand-3'); ctx.font = '12px ' + css('--body'); ctx.textAlign = 'center'; ctx.fillText(t('o_hist_empty'), w / 2, h / 2); return; }
  let m = 0.005; for (const p of P) m = Math.max(m, Math.abs(p.secr.between), Math.abs(p.secr.within));
  m *= 1.1;
  const Y = (v) => pad.t + (1 - (v + m) / (2 * m)) * (h - pad.t - pad.b);
  axes(ctx, w, h, pad, -m, m, [-m * 0.9, -m * 0.45, 0, m * 0.45, m * 0.9].map(v => +v.toPrecision(2)), v => (v > 0 ? '+' : '') + v.toFixed(3));
  ctx.strokeStyle = css('--sand-2'); ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.moveTo(pad.l, Y(0)); ctx.lineTo(w - pad.r, Y(0)); ctx.stroke(); ctx.globalAlpha = 1;
  const slot = (w - pad.l - pad.r) / 36, bw = Math.max(2, slot * 0.36);
  P.forEach((p, i) => {
    const x = pad.l + i * slot + slot * 0.1;
    const b = p.secr.between, wi = p.secr.within;
    ctx.fillStyle = '#3fb3a6'; ctx.fillRect(x, Math.min(Y(0), Y(b)), bw, Math.abs(Y(b) - Y(0)) || 1);
    ctx.fillStyle = '#ff7a59'; ctx.fillRect(x + bw + 1, Math.min(Y(0), Y(wi)), bw, Math.abs(Y(wi) - Y(0)) || 1);
  });
  const last = P.slice(-6);
  const avg = (f) => last.reduce((a, p) => a + f(p), 0) / last.length;
  $('#oPB').textContent = fmtS(avg(p => p.secr.between), 4);
  $('#oPW').textContent = fmtS(avg(p => p.secr.within), 4);
  $('#oPR').textContent = (sim.stats.rel).toFixed(2);
}
function fmtS(v, d = 2) { if (!isFinite(v)) return '—'; return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d); }

function drawGalton() {
  const c = $('#oGalton'); const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const g = sim.groupGalton(); const pad = { l: 30, r: 8, t: 8, b: 22 };
  let mx = 4; for (const [x, y] of g.pts) mx = Math.max(mx, x, y);
  mx = Math.ceil(mx);
  const X = (v) => pad.l + v / mx * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - v / mx) * (h - pad.t - pad.b);
  ctx.direction = 'ltr'; ctx.font = '10px ' + css('--mono'); ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3');
  for (let v = 0; v <= mx; v++) {
    ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.moveTo(X(v), pad.t); ctx.lineTo(X(v), h - pad.b); ctx.moveTo(pad.l, Y(v)); ctx.lineTo(w - pad.r, Y(v)); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(2 ** v, X(v), h - pad.b + 4);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(2 ** v, pad.l - 4, Y(v));
  }
  const n = g.pts.length;
  g.pts.forEach(([x, y, ch], i) => {
    const jx = ((i * 7919) % 100) / 100 - 0.5, jy = ((i * 104729) % 100) / 100 - 0.5;
    ctx.globalAlpha = 0.15 + 0.6 * i / Math.max(1, n);
    ctx.fillStyle = ch ? '#ff7a59' : '#86c95e';
    ctx.beginPath(); ctx.arc(X(x + jx * 0.18), Y(y + jy * 0.18), 2, 0, 6.2832); ctx.fill();
  });
  ctx.globalAlpha = 1;
  if (isFinite(g.slope)) {
    ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(X(0), Y(g.icpt)); ctx.lineTo(X(mx), Y(g.icpt + g.slope * mx)); ctx.stroke();
  }
  $('#oSlope').textContent = isFinite(g.slope) ? g.slope.toFixed(2) : '—';
  $('#oPairs').textContent = n;
  $('#oMeanS').textContent = sim.stats.meanSize.toFixed(1);
}

function lines(c, series, { ymin, ymax, ticks, fmt, log2 }) {
  const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const Hh = sim.hist; const pad = { l: 34, r: 8, t: 8, b: 18 };
  if (Hh.length < 2) { ctx.fillStyle = css('--sand-3'); ctx.font = '12px ' + css('--body'); ctx.textAlign = 'center'; ctx.fillText(t('o_hist_empty'), w / 2, h / 2); return; }
  const xmin = Hh[0].t, xmax = Hh[Hh.length - 1].t;
  axes(ctx, w, h, pad, ymin, ymax, ticks, fmt);
  xHours(ctx, w, h, pad, xmin, xmax);
  const X = (v) => pad.l + (v - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r);
  const Y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
  for (const s of series) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.7; ctx.globalAlpha = s.alpha || 1;
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath(); let started = false;
    for (const r of Hh) {
      let v = s.f(r); if (v === null || !isFinite(v)) { started = false; continue; }
      if (log2) v = Math.log2(Math.max(1, v));
      const x = X(r.t), y = Y(Math.min(ymax, Math.max(ymin, v)));
      started ? ctx.lineTo(x, y) : ctx.moveTo(x, y); started = true;
    }
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
  }
}
function drawArms() {
  let mx = 3;
  for (const r of sim.hist) mx = Math.max(mx, Math.log2(Math.max(1, r.meanSize)), Math.log2(Math.max(1, r.gape || 1)));
  mx = Math.ceil(mx + 0.3);
  lines($('#oArms'), [
    { f: r => r.meanSize, color: '#86c95e', width: 2.2 },
    { f: r => (r.preds ? r.gape : null), color: '#ff7aa8', width: 2.2 },
    { f: r => r.maxSize, color: '#86c95e', width: 1, alpha: 0.4, dash: [3, 3] },
  ], { ymin: 0, ymax: mx, ticks: Array.from({ length: mx + 1 }, (_, i) => i), fmt: v => 2 ** v, log2: true });
}
function drawGenes() {
  lines($('#oGenes'), [0, 1, 2, 3, 4].map(k => ({ f: r => (k === 4 ? r.mg[k] / 8 : r.mg[k]), color: GENE_COL[k], width: k === 0 ? 2.4 : 1.6 })),
    { ymin: 0, ymax: 1, ticks: [0, 0.25, 0.5, 0.75, 1], fmt: v => v.toFixed(2) });
}

/* ---------------- HUD / status / ticker ---------------- */
function updateStatus() {
  const st = sim.stats;
  const hrs = sim.t * MIN_PER_TICK / 60;
  $('#oHours').textContent = hrs < 10 ? hrs.toFixed(1) : Math.round(hrs);
  $('#oGens').textContent = sim.gens.toFixed(0);
  $('#oCells').textContent = st.n;
  $('#oCols').textContent = st.multiCols;
  $('#oInG').textContent = Math.round(st.inGroups * 100) + '%';
  $('#oPreds').textContent = st.preds;
  const chips = [
    `<span class="chip"><span class="dot" style="background:#86c95e"></span>${t('o_size')} ${st.meanSize.toFixed(1)} · max ${st.maxSize}</span>`,
  ];
  if (st.preds) chips.push(`<span class="chip"><span class="dot" style="background:#ff7aa8"></span>${t('o_gape')} ≤${st.gape.toFixed(1)}</span>`);
  if (st.soma > 0.02) chips.push(`<span class="chip"><span class="dot" style="background:#ffb86b"></span>${t('o_somaF')} ${Math.round(st.soma * 100)}%</span>`);
  $('#oHud').innerHTML = chips.join('');
  $('#oExtinct').hidden = st.n > 0;
}
function evText(e) {
  if (e.type === 'preset') return t('ev_preset') + ': ' + t(e.data.key);
  if (e.type === 'bigPred') return t('ev_bigPred').replace('{g}', e.data.g);
  return t('ev_' + e.type);
}
function updateTicker(force) {
  if (!force && sim.events.length === lastEv) return;
  // banner for fresh milestones
  for (const e of sim.events) {
    if (e.type.startsWith('ms_') && e.t > lastMsSeen) { lastMsSeen = e.t; banner = { text: t('banner_' + e.type), t0: performance.now() }; }
  }
  lastEv = sim.events.length;
  $('#oTicker').innerHTML = sim.events.slice().reverse().map(e => {
    const hrs = e.t * MIN_PER_TICK / 60;
    return `<div class="${e.type.startsWith('ms_') ? 'ms' : ''}"><time>${hrs.toFixed(1)}${t('hr')}</time><span>${evText(e)}</span></div>`;
  }).join('');
}

/* ---------------- organism card ---------------- */
function renderCard() {
  const box = $('#oCard'), mini = $('#oMini'), lin = $('#oLin'), tools = $('#oCardTools');
  if (!selected) { box.innerHTML = `<p class="insp-empty">${t('o_card_empty')}</p>`; mini.hidden = lin.hidden = tools.hidden = true; $('#oLinCap').hidden = true; return; }
  const col = selected, alive = col.alive && col.cells.length > 0;
  const info = alive ? sim.colonyInfo(col) : null;
  const n = alive ? col.cells.length : 0;
  const pills = [];
  if (alive) pills.push(`<span class="pill ${n > 1 ? 'gold' : ''}">${n > 1 ? t('multi') : t('uni')}</span>`);
  if (col.chimera) pills.push(`<span class="pill hot">${t('chimera')}</span>`);
  if (!alive) pills.push(`<span class="pill">${col.eaten ? t('eaten') : t('dead')}</span>`);
  const ageMin = (sim.t - col.born) * MIN_PER_TICK;
  const ageTxt = ageMin < 90 ? Math.round(ageMin) + ' ' + t('min') : (ageMin / 60).toFixed(1) + ' ' + t('hr');
  let html = `<div class="idline"><b class="mono">#${col.id}</b>${pills.join('')}</div>`;
  html += `<dl class="kv">
    <dt>${t('cells')}</dt><dd>${n}</dd>
    <dt>${t('o_gen')}</dt><dd>${col.gen}</dd>
    <dt>${t('o_age')}</dt><dd>${ageTxt}</dd>
    <dt>${t('o_peak')}</dt><dd>${col.peak}</dd>
    <dt>${t('o_repro')}</dt><dd>${col.reproSize ?? '—'}</dd>
    <dt>${t('o_kids')}</dt><dd>${col.kids}</dd>
    ${info ? `<dt>${t('o_somaF')}</dt><dd>${Math.round(info.soma * 100)}%</dd><dt>${t('o_genos')}</dt><dd>${info.genotypes}</dd>` : ''}
  </dl>`;
  const gm = col.gm;
  const gl = [['g_adh', gm[ADH], 1], ['g_secr', gm[SECR], 1], ['g_soma', gm[SOMA], 0.9], ['g_single', gm[SINGLE], 1], ['g_fis', gm[FIS], 8]];
  html += `<div class="genes">` + gl.map(([k, v, mx], i) => `<div class="gene"><span>${t(k)}</span><i><b style="width:${Math.round(100 * v / mx)}%;background:${GENE_COL[i]}"></b></i><em class="mono">${k === 'g_fis' ? '≈' + Math.round(2 ** v) : v.toFixed(2)}</em></div>`).join('') + `</div>`;
  box.innerHTML = html;
  tools.hidden = !alive;
  $('#oFollow').textContent = follow ? t('o_unfollow') : t('o_follow');
  mini.hidden = !alive;
  if (alive) drawMini(col);
  lin.hidden = false; $('#oLinCap').hidden = false;
  drawLineage(col);
}
function drawMini(col) {
  const { ctx, w, h } = fit($('#oMini'));
  ctx.fillStyle = '#03070a'; ctx.fillRect(0, 0, w, h);
  const cs = col.cells; let sx = 0, sy = 0;
  for (const c of cs) { sx += c.x; sy += c.y; } sx /= cs.length; sy /= cs.length;
  let mr = R * 2; for (const c of cs) mr = Math.max(mr, Math.hypot(c.x - sx, c.y - sy) + R * 2);
  const s = Math.min(w, h) / (2 * mr) * 0.9, ox = w / 2 - sx * s, oy = h / 2 - sy * s;
  ctx.globalCompositeOperation = 'lighter';
  const hr = R * s * 4;
  for (const c of cs) { ctx.globalAlpha = 0.22; ctx.drawImage(halo[((col.hue / 10) | 0) % HB], c.x * s + ox - hr, c.y * s + oy - hr, 2 * hr, 2 * hr); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  ctx.strokeStyle = 'rgba(214,240,255,0.55)'; ctx.lineWidth = Math.max(1, s * 0.5);
  ctx.beginPath();
  for (const c of cs) for (const o of c.b) if (o.id > c.id) { ctx.moveTo(c.x * s + ox, c.y * s + oy); ctx.lineTo(o.x * s + ox, o.y * s + oy); }
  ctx.stroke();
  const cr = Math.max(2, R * s * 0.92);
  for (const c of cs) {
    const x = c.x * s + ox, y = c.y * s + oy;
    ctx.fillStyle = c.type === 1 ? '#ffb86b' : `hsl(${col.hue},78%,66%)`;
    ctx.beginPath(); ctx.arc(x, y, cr, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(3,7,10,0.4)'; ctx.beginPath(); ctx.arc(x, y, cr * 0.35, 0, 6.2832); ctx.fill();
  }
}
function drawLineage(col) {
  const { ctx, w, h } = fit($('#oLin'));
  ctx.clearRect(0, 0, w, h);
  const lin = sim.lineage(col, 48).reverse();
  if (!lin.length) return;
  let mx = 2; for (const r of lin) mx = Math.max(mx, Math.log2(r.peak + 1));
  const bw = (w - 4) / lin.length;
  ctx.direction = 'ltr';
  lin.forEach((r, i) => {
    const v = Math.log2(r.peak + 1) / mx, bh = Math.max(2, v * (h - 16));
    ctx.fillStyle = `hsl(${r.hue},70%,${r.peak > 1 ? 62 : 45}%)`;
    const x = 2 + i * bw;
    ctx.fillRect(x, h - 14 - bh, Math.max(1, bw - 1.5), bh);
  });
  ctx.fillStyle = css('--sand-3'); ctx.font = '10px ' + css('--mono'); ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
  ctx.fillText('gen ' + lin[0].gen, 2, h); ctx.textAlign = 'right'; ctx.fillText('gen ' + lin[lin.length - 1].gen, w - 2, h);
}

/* ---------------- controls ---------------- */
const PRESETS = [
  { key: 'op_origin', run() { newSim({ predators: true }); } },
  { key: 'op_pg', run() { newSim({ predators: false, polymer: 1.3 }); } },
  { key: 'op_aggr', run() { newSim({ predators: true, aggregation: true }); } },
  { key: 'op_arms', run() { sim.bigPredators(); } },
  { key: 'op_plague', run() { sim.plague(); } },
  { key: 'op_single', run() { sim.setParam('lifecycle', 'single'); } },
];
function newSim(opts) {
  seed = (seed * 1103515245 + 12345) % 2147483647;
  sim = new Origins(seed, opts || { predators: true });
  selected = null; follow = false; lastEv = -1; lastMsSeen = 0; banner = null;
  cam.z = 1; cam.x = W / 2; cam.y = H / 2;
}
function syncControls() {
  const p = sim.p;
  $('#oPred').checked = p.predators; $('#oAggr').checked = p.aggregation;
  $$('#oLife button').forEach(b => b.classList.toggle('on', b.dataset.v === p.lifecycle));
  const set = (id, v, txt) => { $(id).value = v; $(id + 'O').textContent = txt; };
  set('#oSimple', p.nutrient, Math.round(p.nutrient * 100) + '%');
  set('#oPoly', p.polymer, Math.round(p.polymer * 100) + '%');
  set('#oPatch', p.patchSpeed, p.patchSpeed.toFixed(1) + '×');
  set('#oCost', p.secrCost, (p.secrCost * 1000).toFixed(1));
  set('#oMut', p.mut, p.mut.toFixed(2));
  $('#oColor').value = colorBy;
  $('#oSeed').textContent = 'seed ' + seed;
  buildLegends();
}
function buildLegends() {
  $('#oRiverLeg').innerHTML = [4, 3, 2, 1, 0].map(k => `<span><i style="background:${CLS_COL[k]}"></i> ${L[lang()].cls[k]}</span>`).join('');
  $('#oPriceLeg').innerHTML = `<span><i style="background:#3fb3a6"></i> ${t('o_between')}</span><span><i style="background:#ff7a59"></i> ${t('o_within')}</span>`;
  $('#oArmsLeg').innerHTML = `<span><i style="background:#86c95e"></i> ${t('o_size')}</span><span><i style="background:#ff7aa8"></i> ${t('o_gape')}</span><span><i style="background:#86c95e;opacity:.45"></i> max</span>`;
  $('#oGenesLeg').innerHTML = ['g_adh', 'g_secr', 'g_soma', 'g_single', 'g_fis'].map((k, i) => `<span><i style="background:${GENE_COL[i]}"></i> ${t(k)}${i === 4 ? ' /8' : ''}</span>`).join('');
}
function applyLang() {
  $$('[data-o18n]').forEach(el => { const v = L[lang()][el.dataset.o18n]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-o18n-html]').forEach(el => { el.innerHTML = L[lang()][el.dataset.o18nHtml]; });
  $('#oPresets').innerHTML = PRESETS.map((p, i) => `<button class="preset" data-p="${i}"><b>${t(p.key)}</b><span>${t(p.key + '_d')}</span></button>`).join('');
  $('#oPlay').textContent = running ? L[lang()].o_pause || (lang() === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (lang() === 'ar' ? 'تشغيل' : 'Play');
  syncControls(); updateTicker(true); renderCard(); drawCharts();
}
function drawCharts() { drawRiver(); drawPrice(); drawGalton(); drawArms(); drawGenes(); }

function bind() {
  $('#oPlay').onclick = () => { running = !running; $('#oPlay').classList.toggle('on', running); $('#oPlay').textContent = running ? (lang() === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (lang() === 'ar' ? 'تشغيل' : 'Play'); };
  $$('#oSpeed button').forEach(b => b.onclick = () => { speed = +b.dataset.v; $$('#oSpeed button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#oPred').onchange = (e) => { sim.setParam('predators', e.target.checked); updateTicker(); };
  $('#oAggr').onchange = (e) => { sim.setParam('aggregation', e.target.checked); updateTicker(); };
  $$('#oLife button').forEach(b => b.onclick = () => { sim.setParam('lifecycle', b.dataset.v); syncControls(); updateTicker(); });
  const rng = (id, key) => { $(id).oninput = (e) => { sim.setParam(key, +e.target.value); syncControls(); }; };
  rng('#oSimple', 'nutrient'); rng('#oPoly', 'polymer'); rng('#oPatch', 'patchSpeed'); rng('#oCost', 'secrCost'); rng('#oMut', 'mut');
  $('#oBig').onclick = () => { sim.bigPredators(); syncControls(); updateTicker(); };
  $('#oPlague').onclick = () => { sim.plague(); updateTicker(); };
  $('#oReset').onclick = $('#oRestart').onclick = () => { newSim(); syncControls(); updateTicker(true); renderCard(); };
  $('#oColor').onchange = (e) => { colorBy = e.target.value; };
  $('#oIntroClose').onclick = () => { $('#oIntro').hidden = true; try { localStorage.setItem('genesis.ointro', '0'); } catch (e) {} };
  try { if (localStorage.getItem('genesis.ointro') === '0') $('#oIntro').hidden = true; } catch (e) {}
  $('#oPresets').onclick = (e) => {
    const b = e.target.closest('.preset'); if (!b) return;
    const p = PRESETS[+b.dataset.p]; p.run(); sim.log('preset', { key: p.key });
    syncControls(); updateTicker(true); renderCard();
    if (!running) $('#oPlay').click();
  };
  $('#oFollow').onclick = () => { follow = !follow; renderCard(); };
  $('#oZoomTo').onclick = () => { if (!selected || !selected.alive) return; cam.z = Math.max(cam.z, 4); follow = true; renderCard(); };
  $('#oZin').onclick = () => zoomAt(null, 1.5); $('#oZout').onclick = () => zoomAt(null, 1 / 1.5);
  $('#oZreset').onclick = () => { cam.z = 1; cam.x = W / 2; cam.y = H / 2; follow = false; renderCard(); };

  // pan / zoom / pick
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const r = canvas.getBoundingClientRect(); const s = (r.width / W) * cam.z;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; follow = false; }
    if (drag.moved) { cam.x = drag.cx - dx / s; cam.y = drag.cy - dy / s; }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (drag && !drag.moved) {
      const r = canvas.getBoundingClientRect(); const s = (r.width / W) * cam.z;
      const { ox, oy } = view(r.width, r.height);
      const wx = (e.clientX - r.left - ox) / s, wy = (e.clientY - r.top - oy) / s;
      selected = sim.colonyAt(wx, wy, 10 + 8 / cam.z);
      if (!selected) follow = false;
      renderCard();
    }
    drag = null;
  });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e, e.deltaY < 0 ? 1.15 : 1 / 1.15); }, { passive: false });
  canvas.addEventListener('dblclick', () => { cam.z = 1; follow = false; });
  document.addEventListener('genesis:lang', applyLang);
  window.addEventListener('resize', drawCharts);
}
function zoomAt(e, f) {
  const r = canvas.getBoundingClientRect();
  const before = view(r.width, r.height); const s0 = (r.width / W) * cam.z;
  const px = e ? e.clientX - r.left : r.width / 2, py = e ? e.clientY - r.top : r.height / 2;
  const wx = (px - before.ox) / s0, wy = (py - before.oy) / s0;
  cam.z = Math.min(8, Math.max(1, cam.z * f));
  const s1 = (r.width / W) * cam.z;
  cam.x = wx - (px - r.width / 2) / s1; cam.y = wy - (py - r.height / 2) / s1;
}

/* ---------------- loop ---------------- */
function loop() {
  if (document.body.dataset.world === 'origins') {
    if (running && sim.cells.length) {
      const t0 = performance.now();
      for (let i = 0; i < speed; i++) { sim.step(); if (performance.now() - t0 > 24) break; }
    }
    drawScope();
    frame++;
    if (frame % 8 === 0) updateStatus();
    if (frame % 20 === 0) { drawCharts(); updateTicker(); }
    if (frame % 12 === 0 && selected) renderCard();
  }
  requestAnimationFrame(loop);
}

bind();
applyLang();
updateStatus();
window.__origins = { get sim() { return sim; }, cam };
requestAnimationFrame(loop);
})();
