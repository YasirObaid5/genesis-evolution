/* ===================================================================
   GENESIS · WATER COLUMN — interface (side view of a 4 × 2 mm pond slice)
   =================================================================== */
(function () {
'use strict';
const K = GenesisColumn;
const { Column, ADH, SOMA, SWIM, BOND, BUOY, LX, LZ, NX, NZ, DX, A, DT } = K;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

const L = {
  ar: {
    c_intro: 'شريحة من بركة بعرض 4 مم وعمق 2 مم، تُرى من الجانب. الماء هنا <b>لزج</b> بالنسبة للخلية (رقم رينولدز ≈ 10⁻⁴)، لذلك تُحَل <b>معادلات ستوكس</b> في كل خطوة. وزن كل خلية يدفع الماء، والطحالب ثقيلة القاع تميل نحو الأعلى بينما تديرها دوّامات الماء (<b>الانجذاب الجيروسكوبي</b>). يأتي الضوء من السطح ويخفت مع العمق وبظلال الخلايا نفسها، والغذاء ينتشر بمعامل انتشار حقيقي ويحمله التيار. الروابط بين الخلايا تنكسر حين يتجاوز الشدّ متانتها. لم يُبرمَج هنا أي عمود أو تيار؛ كل ما تراه يتولد من هذه القوانين.',
    phys_t: 'زمن فيزيائي', bio_t: 'زمن بيولوجي', gens: 'جيل خلوي', cells: 'خلية', inOrg: 'داخل كائنات', preds: 'مفترس', flow: 'سرعة التيار (rms)',
    physics: 'الفيزياء', c_flow: 'الاقتران الهيدروديناميكي', c_flow_d: 'وزن الخلايا يحرّك الماء (معادلات ستوكس)',
    c_light: 'شدة الضوء عند السطح', c_turb: 'عكارة الماء', c_nut: 'إمداد الغذاء', c_source: 'مصدر الغذاء', src_mixed: 'في الماء', src_sed: 'من الرواسب',
    c_stir: 'رجّ الوعاء', biology: 'الأحياء', c_pred: 'مفترسات (دوّارات)', c_pred_d: 'نجاح الالتقاط يعتمد على نسبة حجم الفريسة إلى الفم، والفم يتطور',
    c_ratio: 'مفترسات لكل 100 خلية', c_mut: 'معدل الطفرات لكل جين', c_clock: 'الساعة البيولوجية أسرع من الفيزيائية ×400',
    view: 'العرض', c_tracers: 'جسيمات تتبّع التيار', c_quiver: 'أسهم السرعة', c_color: 'التلوين',
    cb_lin: 'السلالة', cb_type: 'نوع الخلية (تكاثرية / جسدية)', cb_swim: 'قوة السباحة', cb_buoy: 'الطفو', cb_bond: 'متانة الرابطة',
    c_reset: 'عمود جديد',
    ch_flow: 'الحمل الحيوي', ch_flow_s: 'سرعة الماء الرأسية (µm/s)', ch_rms: 'المتوسط التربيعي', ch_max: 'الأقصى',
    ch_prof: 'المقطع الرأسي الآن', ch_prof_s: 'الخلايا والضوء والغذاء حسب العمق', ch_uni: 'خلايا منفردة', ch_multi: 'داخل كائنات', ch_light: 'الضوء', ch_nut: 'الغذاء',
    ch_river: 'نهر الأشكال', ch_river_s: 'نسبة الخلايا حسب حجم الكائن', cls: ['خلية منفردة', '2–3', '4–15', '16–63', '64+'],
    ch_arms: 'سباق التسلح', ch_arms_s: 'قطر الكائن مقابل فم المفترس (µm)', ch_diam: 'قطر الكائن', ch_gape: 'فم المفترس',
    ch_genes: 'الجينات', ch_genes_s: 'متوسطات العمود',
    g_adh: 'الالتصاق', g_soma: 'التخصص الجسدي', g_swim: 'قوة السوط', g_bond: 'متانة الرابطة', g_buoy: 'الطفو',
    card: 'بطاقة الكائن', card_empty: 'اضغط على أي خلية أو كائن لعرض القوى المؤثرة فيه: وزنه، دفع أسواطه، سرعته عبر الماء، والشدّ في روابطه.',
    follow: 'تتبّع', unfollow: 'إيقاف التتبّع', zoomto: 'اقترب',
    multi: 'متعدد الخلايا', uni: 'وحيد الخلية', eaten: 'التُهم', gone: 'انتهى',
    k_cells: 'الخلايا (السبّاحة)', k_diam: 'القطر الهيدروديناميكي', k_depth: 'العمق', k_vrel: 'سرعته عبر الماء', k_vz: 'سرعته الرأسية', k_W: 'الوزن الظاهري', k_T: 'دفع الأسواط',
    k_gam: 'معدل القص حوله', k_ten: 'الشدّ / المتانة', k_light: 'الضوء', k_nut: 'الغذاء', k_gen: 'جيل الكائن', k_kids: 'كائنات وُلدت منه', k_peak: 'أقصى حجم',
    lineage: 'السلالة: أقصى حجم لكل سلف (الأقدم ← الأحدث)', up: 'صعودًا', down: 'هبوطًا',
    log: 'سجلّ الأحداث',
    ev_start: 'عمود جديد: 420 طحلبًا منفردًا تسبح بأسواطها', ev_ms_plumes: 'بدأ الحمل الحيوي: انقلبت الطبقة العليا الكثيفة إلى أعمدة هابطة',
    ev_ms_first8: 'ظهر أول كائن من 8 خلايا', ev_ms_half: 'نصف الخلايا تعيش الآن داخل كائنات', ev_ms_32: 'كائن من 32 خلية', ev_ms_soma: 'تقسيم العمل: 15% من الخلايا الملتصقة صارت جسدية',
    ev_ms_float: 'تطوّر الطفو: الكائنات تحمل نفسها دون سباحة', ev_ms_majority: '90% من الخلايا داخل كائنات', ev_ms_gape: 'أفواه المفترسات تجاوزت 30 ميكرومتر',
    ev_stir: 'رُجّ الوعاء', ev_predOn: 'أُطلقت المفترسات', ev_predOff: 'أُزيلت المفترسات', ev_flowOn: 'أُعيد الاقتران الهيدروديناميكي', ev_flowOff: 'أُوقف الاقتران الهيدروديناميكي: الماء لم يعد يتحرك', ev_preset: 'تجربة',
    banner_ms_plumes: 'بدأ الحمل الحيوي', banner_ms_first8: 'أول كائن من 8 خلايا', banner_ms_half: 'نصف الحياة صار جماعيًا', banner_ms_32: 'كائن من 32 خلية',
    banner_ms_soma: 'ظهر تقسيم العمل', banner_ms_float: 'تطوّر الطفو', banner_ms_majority: 'اكتمل الانتقال إلى تعدد الخلايا', banner_ms_gape: 'المفترسات تردّ: أفواه بقطر 30 ميكرومتر',
    p_lake: 'بركة بمفترسات', p_lake_d: 'الإعداد الافتراضي. راقب الأعمدة ثم الالتصاق ثم سباق التسلح.',
    p_nopred: 'بلا مفترسات', p_nopred_d: 'هل تظهر الكائنات دون خطر الافتراس؟',
    p_sed: 'الغذاء من الرواسب', p_sed_d: 'الضوء في الأعلى والغذاء في القاع.',
    p_noflow: 'ماء ساكن', p_noflow_d: 'نفس الخلايا بلا اقتران هيدروديناميكي: لا أعمدة.',
    p_dim: 'ضوء خافت', p_dim_d: 'نصف شدة الضوء عند السطح.',
    p_stir: 'رجّ الوعاء', p_stir_d: 'اخلط العمود وراقب عودة الأعمدة.',
    hint: 'اسحب للتحريك · عجلة الفأرة للتكبير · اضغط على كائن', hist_empty: 'تتراكم البيانات خلال ثوانٍ…', s: 'ث', min: 'د', h: 'س', surface: 'السطح', sediment: 'الرواسب',
    footer: 'الفيزياء الحقيقية هنا: معادلات ستوكس لسائل لزوجته 1 ملّي باسكال·ثانية، قانون ستوكس للسحب، الانجذاب الجيروسكوبي (B = 3.4 ث)، بير–لامبرت للضوء، انتشار الغذاء (D = 1900 µm²/s). التبسيطات: شريحة ثنائية الأبعاد سماكتها 25 µm، السطح والقاع منزلقان، الكائنات أجسام صلبة بنصف قطر هيدروديناميكي كسوري، والساعة البيولوجية مسرّعة ×400.',
  },
  en: {
    c_intro: 'A slice of pond 4 mm wide and 2 mm deep, seen from the side. To a cell, water is <b>viscous</b> (Reynolds number ≈ 10⁻⁴), so the <b>Stokes equations</b> are solved every step. Each cell’s weight pushes the water; bottom-heavy algae tilt upward while the water’s vorticity turns them (<b>gyrotaxis</b>). Light enters at the surface and fades with depth and with the cells’ own shade; nutrients diffuse with a real diffusivity and ride the flow. Bonds between cells break when tension exceeds their strength. No plume or current is scripted here; everything you see comes from these laws.',
    phys_t: 'physical time', bio_t: 'biological time', gens: 'cell generations', cells: 'cells', inOrg: 'in organisms', preds: 'predators', flow: 'flow speed (rms)',
    physics: 'Physics', c_flow: 'Hydrodynamic coupling', c_flow_d: 'Cell weight moves the water (Stokes equations)',
    c_light: 'Surface light', c_turb: 'Water turbidity', c_nut: 'Nutrient supply', c_source: 'Nutrient source', src_mixed: 'In the water', src_sed: 'From sediment',
    c_stir: 'Shake the jar', biology: 'Biology', c_pred: 'Predators (rotifers)', c_pred_d: 'Capture depends on prey size relative to the evolving mouth',
    c_ratio: 'Predators per 100 cells', c_mut: 'Mutation rate per gene', c_clock: 'Biological clock runs ×400 faster than physics',
    view: 'View', c_tracers: 'Flow tracer particles', c_quiver: 'Velocity arrows', c_color: 'Colour by',
    cb_lin: 'Lineage', cb_type: 'Cell type (germ / soma)', cb_swim: 'Swimming force', cb_buoy: 'Buoyancy', cb_bond: 'Bond strength',
    c_reset: 'New column',
    ch_flow: 'Bioconvection', ch_flow_s: 'Vertical water speed (µm/s)', ch_rms: 'rms', ch_max: 'max',
    ch_prof: 'Vertical profile now', ch_prof_s: 'Cells, light and nutrient by depth', ch_uni: 'Single cells', ch_multi: 'In organisms', ch_light: 'Light', ch_nut: 'Nutrient',
    ch_river: 'River of forms', ch_river_s: 'Share of cells by organism size', cls: ['Single cell', '2–3', '4–15', '16–63', '64+'],
    ch_arms: 'Arms race', ch_arms_s: 'Organism diameter vs predator gape (µm)', ch_diam: 'Organism diameter', ch_gape: 'Predator gape',
    ch_genes: 'Genes', ch_genes_s: 'Means across the column',
    g_adh: 'Adhesion', g_soma: 'Somatic fate', g_swim: 'Flagellar force', g_bond: 'Bond strength', g_buoy: 'Buoyancy',
    card: 'Organism card', card_empty: 'Click any cell or organism to see the forces acting on it: its weight, flagellar thrust, speed through the water and the tension in its bonds.',
    follow: 'Follow', unfollow: 'Stop following', zoomto: 'Zoom in',
    multi: 'Multicellular', uni: 'Unicellular', eaten: 'Eaten', gone: 'Gone',
    k_cells: 'Cells (swimming)', k_diam: 'Hydrodynamic diameter', k_depth: 'Depth', k_vrel: 'Speed through water', k_vz: 'Vertical speed', k_W: 'Apparent weight', k_T: 'Flagellar thrust',
    k_gam: 'Local shear rate', k_ten: 'Tension / strength', k_light: 'Light', k_nut: 'Nutrient', k_gen: 'Organism generation', k_kids: 'Offspring organisms', k_peak: 'Peak size',
    lineage: 'Lineage: peak size of each ancestor (oldest → newest)', up: 'up', down: 'down',
    log: 'Event log',
    ev_start: 'New column: 420 single algae swimming with flagella', ev_ms_plumes: 'Bioconvection began: the dense top layer overturned into sinking plumes',
    ev_ms_first8: 'The first 8-cell organism appeared', ev_ms_half: 'Half of all cells now live inside organisms', ev_ms_32: 'A 32-cell organism', ev_ms_soma: 'Division of labour: 15% of bonded cells are somatic',
    ev_ms_float: 'Buoyancy evolved: organisms hold themselves up without swimming', ev_ms_majority: '90% of cells live in organisms', ev_ms_gape: 'Predator mouths exceeded 30 µm',
    ev_stir: 'The jar was shaken', ev_predOn: 'Predators released', ev_predOff: 'Predators removed', ev_flowOn: 'Hydrodynamic coupling restored', ev_flowOff: 'Hydrodynamic coupling off: the water no longer moves', ev_preset: 'Experiment',
    banner_ms_plumes: 'Bioconvection has begun', banner_ms_first8: 'The first 8-cell organism', banner_ms_half: 'Half of life is now collective', banner_ms_32: 'A 32-cell organism',
    banner_ms_soma: 'Division of labour has appeared', banner_ms_float: 'Buoyancy has evolved', banner_ms_majority: 'The transition to multicellularity is complete', banner_ms_gape: 'Predators answer: 30 µm mouths',
    p_lake: 'Pond with predators', p_lake_d: 'Default. Watch the plumes, then adhesion, then the arms race.',
    p_nopred: 'No predators', p_nopred_d: 'Do organisms appear without the threat of being eaten?',
    p_sed: 'Food from sediment', p_sed_d: 'Light at the top, nutrients at the bottom.',
    p_noflow: 'Still water', p_noflow_d: 'Same cells, no hydrodynamic coupling: no plumes.',
    p_dim: 'Dim light', p_dim_d: 'Half the surface light.',
    p_stir: 'Shake the jar', p_stir_d: 'Mix the column and watch the plumes return.',
    hint: 'Drag to pan · scroll to zoom · click an organism', hist_empty: 'Data accumulates within seconds…', s: 's', min: 'min', h: 'h', surface: 'surface', sediment: 'sediment',
    footer: 'Real physics here: Stokes equations for water of viscosity 1 mPa·s, Stokes drag, gyrotaxis (B = 3.4 s), Beer–Lambert light, nutrient diffusion (D = 1900 µm²/s). Simplifications: a 2D slice 25 µm thick, free-slip surface and bottom, organisms as rigid bodies with a fractal hydrodynamic radius, and a biological clock accelerated ×400.',
  },
};
const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'ar');
const t = (k) => (L[lang()][k] !== undefined ? L[lang()][k] : k);

/* ---------------- state ---------------- */
let seed = 777;
let sim = new Column(seed);
let resumedModel = null;
let running = true, speed = 4, selected = null, follow = false, colorBy = 'lin', showTr = true, showQ = false;
const cam = { z: 1, x: LX / 2, y: LZ / 2 };
let banner = null, lastEv = -1, lastMs = 0, frame = 0;

function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

/* sprites */
const SPR = 64, HB = 36, halo = [];
for (let i = 0; i < HB; i++) {
  const c = document.createElement('canvas'); c.width = c.height = SPR;
  const x = c.getContext('2d'), h = i * 10;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `hsla(${h},90%,70%,0.9)`); g.addColorStop(0.4, `hsla(${h},85%,55%,0.3)`); g.addColorStop(1, `hsla(${h},80%,45%,0)`);
  x.fillStyle = g; x.fillRect(0, 0, SPR, SPR); halo.push(c);
}
const fieldC = document.createElement('canvas'); fieldC.width = NX; fieldC.height = NZ;
const fctx = fieldC.getContext('2d'), fimg = fctx.createImageData(NX, NZ);
const SEQ = 12;
const seqCols = Array.from({ length: SEQ }, (_, i) => { const x = i / (SEQ - 1); return `hsl(${200 - x * 160},${60 + x * 20}%,${48 + x * 18}%)`; });
const linMulti = Array.from({ length: HB }, (_, i) => `hsl(${i * 10},70%,62%)`);
const linSingle = Array.from({ length: HB }, (_, i) => `hsl(${i * 10},40%,74%)`);
const buckets = Array.from({ length: 2 * HB + SEQ + 4 }, () => []);
const typeCols = ['#a6e3a1', '#ffc06e', '#d9e6dc'];

function view(w, h) {
  const s = (w / LX) * cam.z;
  const hw = w / (2 * s), hh = h / (2 * s);
  cam.x = hw * 2 >= LX ? LX / 2 : Math.min(LX - hw, Math.max(hw, cam.x));
  cam.y = hh * 2 >= LZ ? LZ / 2 : Math.min(LZ - hh, Math.max(hh, cam.y));
  return { s, ox: w / 2 - cam.x * s, oy: h / 2 - cam.y * s };
}

/* ---------------- tank rendering ---------------- */
const canvas = $('#tank');
function drawTank() {
  const { ctx, w, h } = fit(canvas);
  if (follow && selected && selected.alive) { cam.x += (selected.cx - cam.x) * 0.15; cam.y += (selected.cz - cam.y) * 0.15; }
  const { s, ox, oy } = view(w, h);
  ctx.fillStyle = '#041016'; ctx.fillRect(0, 0, w, h);
  // water coloured by the computed light field, nutrient as a faint green-cyan cast
  const d = fimg.data, I = sim.I, C = sim.C;
  for (let i = 0; i < NX * NZ; i++) {
    const li = Math.min(1, I[i] / Math.max(0.2, sim.p.light)), nu = Math.min(1, C[i] / 1.2);
    d[4 * i] = 6 + 34 * li; d[4 * i + 1] = 22 + 70 * li + 22 * nu; d[4 * i + 2] = 32 + 62 * li + 30 * nu; d[4 * i + 3] = 255;
  }
  fctx.putImageData(fimg, 0, 0);
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(fieldC, ox, oy, LX * s, LZ * s);
  // sunlight at the surface
  const sy0 = oy;
  if (sy0 > -40) {
    const g = ctx.createLinearGradient(0, sy0, 0, sy0 + 160 * Math.min(1.5, cam.z));
    g.addColorStop(0, `rgba(255,236,170,${0.22 * sim.p.light})`); g.addColorStop(1, 'rgba(255,236,170,0)');
    ctx.fillStyle = g; ctx.fillRect(0, sy0, w, 160 * Math.min(1.5, cam.z));
    ctx.strokeStyle = 'rgba(255,245,210,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, sy0 + 0.5); ctx.lineTo(w, sy0 + 0.5); ctx.stroke();
  }
  // sediment
  const sb = oy + LZ * s;
  if (sb < h + 20) {
    const g = ctx.createLinearGradient(0, sb - 6, 0, sb + 30);
    g.addColorStop(0, 'rgba(92,68,44,0)'); g.addColorStop(0.2, 'rgba(92,68,44,0.9)'); g.addColorStop(1, 'rgba(48,34,22,1)');
    ctx.fillStyle = g; ctx.fillRect(0, sb - 6, w, 40);
  }
  // flow tracers
  if (showTr && sim.p.flow) {
    const tr = sim.tr;
    ctx.strokeStyle = 'rgba(190,235,255,0.32)'; ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < tr.length; i += 4) {
      const x1 = tr[i] * s + ox, y1 = tr[i + 1] * s + oy, x0 = tr[i + 2] * s + ox, y0 = tr[i + 3] * s + oy;
      if (Math.abs(x1 - x0) > 60 || x1 < -5 || x1 > w + 5 || y1 < -5 || y1 > h + 5) continue;
      const ex = x1 + (x1 - x0) * 2, ey = y1 + (y1 - y0) * 2;
      ctx.moveTo(x0, y0); ctx.lineTo(ex, ey);
    }
    ctx.stroke();
  }
  if (showQ && sim.p.flow) {
    // velocity arrows: 100 µm/s ≈ 18 px
    ctx.strokeStyle = 'rgba(255,240,200,0.75)'; ctx.lineWidth = 1.2;
    ctx.beginPath();
    const step = cam.z > 3 ? 1 : 3, sc = 0.18;
    for (let k = 1; k < NZ; k += step) for (let i = 1; i < NX; i += step) {
      const n = k * NX + i, x = (i + 0.5) * DX * s + ox, y = (k + 0.5) * DX * s + oy;
      if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;
      const u = sim.U[n] * sc, v = sim.Wv[n] * sc, L2 = Math.hypot(u, v); if (L2 < 1.5) continue;
      const ex = x + u, ey = y + v, a = Math.atan2(v, u);
      ctx.moveTo(x, y); ctx.lineTo(ex, ey);
      ctx.moveTo(ex, ey); ctx.lineTo(ex - 4 * Math.cos(a - 0.5), ey - 4 * Math.sin(a - 0.5));
      ctx.moveTo(ex, ey); ctx.lineTo(ex - 4 * Math.cos(a + 0.5), ey - 4 * Math.sin(a + 0.5));
    }
    ctx.stroke();
  }

  const cells = sim.cells;
  const cr = Math.max(1.4, A * s);
  const inV = (x, y, m) => x > -m && x < w + m && y > -m && y < h + m;
  // organism halos when zoomed in
  {
    // organisms glow as soft bodies at every zoom level
    ctx.globalCompositeOperation = 'lighter';
    const hr = Math.max(6, A * s * 4.5);
    for (const c of cells) {
      if (c.col.cells.length < 2) continue;
      const x = c.x * s + ox, y = c.z * s + oy; if (!inV(x, y, hr)) continue;
      ctx.globalAlpha = s > 0.6 ? 0.14 : 0.1; ctx.drawImage(halo[((c.col.hue / 10) | 0) % HB], x - hr, y - hr, 2 * hr, 2 * hr);
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  }
  // bonds
  if (s > 0.45) {
    ctx.beginPath();
    for (const c of cells) for (const o of c.bonds) {
      if (o.id <= c.id) continue;
      const x = c.x * s + ox, y = c.z * s + oy, x2 = o.x * s + ox, y2 = o.z * s + oy;
      if (Math.abs(x - x2) > 40 * s || !inV(x, y, 20)) continue;
      ctx.moveTo(x, y); ctx.lineTo(x2, y2);
    }
    ctx.strokeStyle = 'rgba(225,245,230,0.5)'; ctx.lineWidth = Math.max(0.6, 0.6 * s); ctx.stroke();
  }
  for (const b of buckets) b.length = 0;
  for (const c of cells) {
    const x = c.x * s + ox, y = c.z * s + oy; if (!inV(x, y, cr)) continue;
    const n = c.col.cells.length; let k;
    if (colorBy === 'lin') k = (n > 1 ? 0 : HB) + (((c.col.hue / 10) | 0) % HB);
    else if (colorBy === 'type') k = 2 * HB + SEQ + (n === 1 ? 2 : c.soma ? 1 : 0);
    else {
      const v = colorBy === 'swim' ? c.g[SWIM] / 1.5 : colorBy === 'buoy' ? c.g[BUOY] : c.g[BOND] / 8;
      k = 2 * HB + Math.max(0, Math.min(SEQ - 1, Math.round(v * (SEQ - 1))));
    }
    buckets[k].push(x, y);
  }
  for (let k = 0; k < buckets.length; k++) {
    const b = buckets[k]; if (!b.length) continue;
    ctx.fillStyle = k < HB ? linMulti[k] : k < 2 * HB ? linSingle[k - HB] : k < 2 * HB + SEQ ? seqCols[k - 2 * HB] : typeCols[k - 2 * HB - SEQ];
    ctx.beginPath();
    for (let i = 0; i < b.length; i += 2) { ctx.moveTo(b[i] + cr, b[i + 1]); ctx.arc(b[i], b[i + 1], cr, 0, 6.2832); }
    ctx.fill();
  }
  // flagella and chloroplast detail when zoomed
  if (s > 1.1) {
    const now = performance.now() / 90;
    ctx.strokeStyle = 'rgba(235,255,240,0.7)'; ctx.lineWidth = Math.max(0.6, 0.18 * s);
    ctx.beginPath();
    for (const c of cells) {
      const swimming = c.soma || c.b < 0.9 || !(c.gr > 0);
      if (!swimming || c.g[SWIM] < 0.05) continue;
      const x = c.x * s + ox, y = c.z * s + oy; if (!inV(x, y, 30)) continue;
      const a = c.ph, wig = Math.sin(now + c.id) * 0.6, Lf = cr * 2.2;
      for (const sgn of [-1, 1]) {
        const b0 = a + sgn * 0.5;
        ctx.moveTo(x + Math.cos(a) * cr, y + Math.sin(a) * cr);
        ctx.quadraticCurveTo(x + Math.cos(b0 + wig * sgn) * Lf * 0.7, y + Math.sin(b0 + wig * sgn) * Lf * 0.7, x + Math.cos(b0 - wig * sgn * 0.5) * Lf * 1.2, y + Math.sin(b0 - wig * sgn * 0.5) * Lf * 1.2);
      }
    }
    ctx.stroke();
    ctx.fillStyle = 'rgba(10,40,20,0.35)';
    ctx.beginPath();
    for (const c of cells) { const x = c.x * s + ox, y = c.z * s + oy; if (!inV(x, y, cr)) continue; ctx.moveTo(x + cr * 0.4, y + cr * 0.15); ctx.arc(x, y + cr * 0.15, cr * 0.4, 0, 6.2832); }
    ctx.fill();
  }
  // predators: rotifer-like, with a ciliary corona at the mouth
  const tt = performance.now() / 160;
  for (const pr of sim.preds) {
    const x = pr.x * s + ox, y = pr.z * s + oy, R = Math.max(4, 20 * s);
    if (!inV(x, y, R * 3)) continue;
    ctx.save(); ctx.translate(x, y); ctx.rotate(pr.h);
    const g = ctx.createRadialGradient(-R * 0.3, 0, R * 0.1, 0, 0, R * 1.5);
    g.addColorStop(0, pr.flash ? 'rgba(255,190,215,0.6)' : 'rgba(255,150,185,0.35)'); g.addColorStop(1, 'rgba(255,110,160,0.05)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(-R * 0.2, 0, R * 1.4, R * 0.85, 0, 0, 6.2832); ctx.fill();
    ctx.strokeStyle = pr.flash ? 'rgba(255,225,240,0.95)' : 'rgba(255,160,200,0.7)'; ctx.lineWidth = 1; ctx.stroke();
    // corona
    const mouth = Math.max(2, pr.gape / 2 * s);
    ctx.strokeStyle = 'rgba(255,215,235,0.8)'; ctx.beginPath();
    for (let i = 0; i < 9; i++) {
      const a = -0.9 + i * 0.225, bx = R * 1.15 + Math.cos(a) * mouth * 0.3, by = Math.sin(a) * (mouth + R * 0.3);
      const l = R * 0.35 * (1 + 0.3 * Math.sin(tt + i));
      ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a) * l, by + Math.sin(a) * l);
    }
    ctx.stroke();
    if (pr.digest > 0) { ctx.fillStyle = 'rgba(160,230,150,0.6)'; ctx.beginPath(); ctx.arc(-R * 0.5, 0, R * 0.3, 0, 6.2832); ctx.fill(); }
    ctx.restore();
    if (s > 0.9) { ctx.direction = 'ltr'; ctx.fillStyle = 'rgba(255,200,225,0.9)'; ctx.font = `10px ${css('--mono')}`; ctx.textAlign = 'center'; ctx.fillText(Math.round(pr.gape) + ' µm', x, y - R * 1.4 - 4); }
  }
  // selection
  if (selected && selected.alive && selected.cells.length) {
    let mr = 0; for (const c of selected.cells) mr = Math.max(mr, Math.hypot(((c.x - selected.cx + LX * 1.5) % LX) - LX / 2, c.z - selected.cz));
    const x = selected.cx * s + ox, y = selected.cz * s + oy, rr = Math.max(10, (mr + A * 3) * s);
    ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 1.6; ctx.setLineDash([5, 4]);
    ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.2832); ctx.stroke(); ctx.setLineDash([]);
    // velocity relative to water
    ctx.strokeStyle = css('--saffron'); ctx.beginPath(); ctx.moveTo(x, y);
    const vx = selected.vx, vz = selected.vz, sc = 0.5 * Math.max(1, s * 2);
    ctx.lineTo(x + vx * sc, y + vz * sc); ctx.stroke();
  }
  // depth scale and labels
  ctx.direction = 'ltr';
  ctx.font = `10px ${css('--mono')}`; ctx.fillStyle = 'rgba(235,223,196,0.7)'; ctx.textAlign = 'left';
  for (let z = 0; z <= LZ; z += 500) { const y = z * s + oy; if (y < 8 || y > h - 4) continue; ctx.fillText((z / 1000).toFixed(1) + ' mm', 6, y + 3); ctx.fillRect(0, y, 4, 1); }
  // scale bar
  const um = [20, 50, 100, 200, 500, 1000].find(v => v * s >= 60) || 1000;
  const bw = um * s, bx = w - bw - 16, by = h - 16;
  ctx.fillStyle = 'rgba(235,223,196,0.9)'; ctx.fillRect(bx, by, bw, 3);
  ctx.textAlign = 'center'; ctx.fillText(um >= 1000 ? '1 mm' : um + ' µm', bx + bw / 2, by - 6);
  // banner
  if (banner) {
    const age = (performance.now() - banner.t0) / 1000;
    if (age > 6) banner = null;
    else {
      ctx.globalAlpha = Math.min(1, age / 0.6) * Math.min(1, (6 - age) / 1.2);
      ctx.direction = lang() === 'ar' ? 'rtl' : 'ltr'; ctx.textAlign = 'center';
      ctx.font = `600 ${Math.max(18, Math.min(32, w / 28))}px ${css('--display')}`;
      const tw = ctx.measureText(banner.text).width;
      ctx.fillStyle = 'rgba(3,10,14,0.6)'; ctx.fillRect(w / 2 - tw / 2 - 22, h * 0.22 - 32, tw + 44, 50);
      ctx.fillStyle = css('--saffron'); ctx.fillText(banner.text, w / 2, h * 0.22);
      ctx.globalAlpha = 1;
    }
  }
}

/* ---------------- charts ---------------- */
function axes(ctx, w, h, pad, ymin, ymax, ticks, fmt) {
  ctx.direction = 'ltr'; ctx.font = '10px ' + css('--mono');
  ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.lineWidth = 1; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of ticks) {
    const y = pad.t + (1 - (v - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
    ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(w - pad.r, y); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.fillText(fmt(v), pad.l - 4, y);
  }
}
function xTime(ctx, w, h, pad, xmin, xmax) {
  // physical minutes on the x axis
  const toMin = (st) => st * DT / 60, span = toMin(xmax) - toMin(xmin);
  const step = [0.5, 1, 2, 5, 10, 20, 30, 60, 120].find(s => span / s <= 5) || 240;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillStyle = css('--sand-3');
  for (let v = Math.ceil(toMin(xmin) / step) * step; v <= toMin(xmax); v += step) {
    const x = pad.l + (v * 60 / DT - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r);
    ctx.fillText(v + t('min'), x, h - pad.b + 4);
  }
}
function empty(ctx, w, h) { ctx.fillStyle = css('--sand-3'); ctx.font = '12px ' + css('--body'); ctx.textAlign = 'center'; ctx.fillText(t('hist_empty'), w / 2, h / 2); }
function lines(c, series, { ymin, ymax, ticks, fmt }) {
  const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const H = sim.hist, pad = { l: 34, r: 8, t: 8, b: 18 };
  if (H.length < 2) return empty(ctx, w, h);
  const xmin = H[0].t, xmax = H[H.length - 1].t;
  axes(ctx, w, h, pad, ymin, ymax, ticks, fmt); xTime(ctx, w, h, pad, xmin, xmax);
  const X = (v) => pad.l + (v - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - (v - ymin) / (ymax - ymin)) * (h - pad.t - pad.b);
  for (const s of series) {
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.7; ctx.globalAlpha = s.alpha || 1; if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath(); let st = false;
    for (const r of H) { const v = s.f(r); if (v === null || !isFinite(v)) { st = false; continue; } const x = X(r.t), y = Y(Math.min(ymax, Math.max(ymin, v))); st ? ctx.lineTo(x, y) : ctx.moveTo(x, y); st = true; }
    ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    if (s.fill) { ctx.lineTo(X(H[H.length - 1].t), Y(ymin)); ctx.lineTo(X(H[0].t), Y(ymin)); ctx.closePath(); ctx.fillStyle = s.color; ctx.globalAlpha = 0.12; ctx.fill(); ctx.globalAlpha = 1; }
  }
}
const CLS_COL = ['#5d7480', '#3fb3a6', '#86c95e', '#f0c04a', '#ff7a59'];
const GENE_COL = ['#7ad8ff', '#ffb86b', '#a6e3a1', '#c59cff', '#f0c04a'];
function drawFlow() {
  let mx = 20; for (const r of sim.hist) mx = Math.max(mx, r.rms * 1.2, Math.min(400, r.vmax));
  mx = Math.ceil(mx / 20) * 20;
  lines($('#cFlow'), [{ f: r => r.vmax, color: '#7ad8ff', width: 1, alpha: 0.45 }, { f: r => r.rms, color: '#7ad8ff', width: 2.2, fill: true }],
    { ymin: 0, ymax: mx, ticks: [0, mx / 4, mx / 2, 3 * mx / 4, mx].map(v => Math.round(v)), fmt: v => v });
}
function drawRiver() {
  const c = $('#cRiver'); const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const H = sim.hist, pad = { l: 34, r: 8, t: 6, b: 18 };
  if (H.length < 2) return empty(ctx, w, h);
  const xmin = H[0].t, xmax = H[H.length - 1].t;
  const X = (v) => pad.l + (v - xmin) / (xmax - xmin || 1) * (w - pad.l - pad.r), Y = (v) => pad.t + (1 - v) * (h - pad.t - pad.b);
  const base = H.map(() => 0);
  for (const k of [4, 3, 2, 1, 0]) {
    ctx.beginPath();
    H.forEach((r, i) => { const y = Y(base[i] + r.cls[k]); i ? ctx.lineTo(X(r.t), y) : ctx.moveTo(X(r.t), y); });
    for (let i = H.length - 1; i >= 0; i--) ctx.lineTo(X(H[i].t), Y(base[i]));
    ctx.closePath(); ctx.fillStyle = CLS_COL[k]; ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1;
    H.forEach((r, i) => { base[i] += r.cls[k]; });
  }
  axes(ctx, w, h, pad, 0, 1, [0, 0.5, 1], v => Math.round(v * 100) + '%'); xTime(ctx, w, h, pad, xmin, xmax);
}
function drawProfile() {
  const c = $('#cProf'); const { ctx, w, h } = fit(c); ctx.clearRect(0, 0, w, h);
  const st = sim.stats, pad = { l: 40, r: 10, t: 6, b: 16 };
  const H = h - pad.t - pad.b, W = w - pad.l - pad.r;
  let mx = 1; for (let i = 0; i < 16; i++) mx = Math.max(mx, st.prof[i] + st.profM[i]);
  const bh = H / 16;
  for (let i = 0; i < 16; i++) {
    const y = pad.t + i * bh, a = st.prof[i] / mx * W, b = st.profM[i] / mx * W;
    ctx.fillStyle = '#5d7480'; ctx.fillRect(pad.l, y + 1, a, bh - 2);
    ctx.fillStyle = '#86c95e'; ctx.fillRect(pad.l + a, y + 1, b, bh - 2);
  }
  const line = (arr, col, scale) => {
    ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.beginPath();
    for (let k = 0; k < arr.length; k++) { const x = pad.l + Math.min(1, arr[k] / scale) * W, y = pad.t + (k + 0.5) / arr.length * H; k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  };
  line(st.Iz, '#f0c04a', Math.max(0.01, sim.p.light)); line(st.Cz, '#7ad8ff', 1.2);
  ctx.direction = 'ltr'; ctx.font = '10px ' + css('--mono'); ctx.fillStyle = css('--sand-3'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (let z = 0; z <= 2; z += 0.5) ctx.fillText(z.toFixed(1) + ' mm', pad.l - 4, pad.t + z / 2 * H);
}
function drawArms() {
  let mx = 20; for (const r of sim.hist) mx = Math.max(mx, r.gape || 0, sim.colonyDiameter(Math.max(1, r.meanSize)), sim.colonyDiameter(Math.max(1, r.maxSize)) * 0.8);
  mx = Math.ceil(mx / 10) * 10;
  lines($('#cArms'), [
    { f: r => sim.colonyDiameter(Math.max(1, r.meanSize)), color: '#86c95e', width: 2.2 },
    { f: r => (r.preds ? r.gape : null), color: '#ff7aa8', width: 2.2 },
    { f: r => sim.colonyDiameter(Math.max(1, r.maxSize)), color: '#86c95e', width: 1, alpha: 0.4, dash: [3, 3] },
  ], { ymin: 0, ymax: mx, ticks: [0, mx / 2, mx].map(Math.round), fmt: v => v });
}
function drawGenes() {
  const sc = [1, 0.9, 1.5, 8, 1];
  lines($('#cGenes'), [0, 1, 2, 3, 4].map(k => ({ f: r => r.mg[k] / sc[k], color: GENE_COL[k], width: k === 0 ? 2.4 : 1.6 })),
    { ymin: 0, ymax: 1, ticks: [0, 0.5, 1], fmt: v => v.toFixed(1) });
}
function drawCharts() { drawFlow(); drawProfile(); drawRiver(); drawArms(); drawGenes(); }

/* ---------------- status, ticker ---------------- */
function fmtTime(sec) { return sec < 120 ? Math.round(sec) + ' ' + t('s') : sec < 7200 ? (sec / 60).toFixed(1) + ' ' + t('min') : (sec / 3600).toFixed(1) + ' ' + t('h'); }
function updateStatus() {
  const st = sim.stats;
  $('#kPhys').textContent = fmtTime(sim.t * DT);
  $('#kBio').textContent = ((sim.t * DT * sim.p.acc) / 3600).toFixed(0) + ' ' + t('h');
  $('#kGens').textContent = sim.gens.toFixed(0);
  $('#kCells').textContent = st.n;
  $('#kOrg').textContent = Math.round(st.inGroups * 100) + '%';
  $('#kPred').textContent = st.preds;
  $('#kFlow').textContent = st.rms.toFixed(0) + ' µm/s';
  const chips = [`<span class="chip"><span class="dot" style="background:#7ad8ff"></span>max ${st.vmax.toFixed(0)} µm/s</span>`];
  if (st.preds) chips.push(`<span class="chip"><span class="dot" style="background:#ff7aa8"></span>${t('ch_gape')} ${st.gape.toFixed(0)} µm</span>`);
  if (st.multi) chips.push(`<span class="chip"><span class="dot" style="background:#86c95e"></span>${t('ch_diam')} ${sim.colonyDiameter(Math.max(1, st.meanSize)).toFixed(0)} µm</span>`);
  $('#cHud').innerHTML = chips.join('');
  $('#cExtinct').hidden = st.n > 0;
}
function evText(e) { if (e.type === 'preset') return t('ev_preset') + ': ' + t(e.data.key); return t('ev_' + e.type); }
function updateTicker(force) {
  if (!force && sim.events.length === lastEv) return;
  for (const e of sim.events) if (e.type.startsWith('ms_') && e.t > lastMs) { lastMs = e.t; banner = { text: t('banner_' + e.type), t0: performance.now() }; }
  lastEv = sim.events.length;
  $('#cTicker').innerHTML = sim.events.slice().reverse().map(e => `<div class="${e.type.startsWith('ms_') ? 'ms' : ''}"><time>${fmtTime(e.t * DT)}</time><span>${evText(e)}</span></div>`).join('');
}

/* ---------------- organism card ---------------- */
function renderCard() {
  const box = $('#cCard'), mini = $('#cMini'), lin = $('#cLin'), tools = $('#cTools');
  if (!selected) { box.innerHTML = `<p class="insp-empty">${t('card_empty')}</p>`; mini.hidden = lin.hidden = tools.hidden = true; $('#cLinCap').hidden = true; return; }
  const col = selected, alive = col.alive && col.cells.length > 0;
  let html = `<div class="idline"><b class="mono">#${col.id}</b>`;
  if (alive) html += `<span class="pill ${col.cells.length > 1 ? 'gold' : ''}">${col.cells.length > 1 ? t('multi') : t('uni')}</span>`;
  else html += `<span class="pill">${col.eaten ? t('eaten') : t('gone')}</span>`;
  html += `</div>`;
  if (alive) {
    const f = sim.colonyInfo(col);
    const dir = f.vz < 0 ? t('up') : t('down');
    html += `<dl class="kv">
      <dt>${t('k_cells')}</dt><dd>${f.n} (${f.ns || 0})</dd>
      <dt>${t('k_diam')}</dt><dd>${f.diam.toFixed(0)} µm</dd>
      <dt>${t('k_depth')}</dt><dd>${f.depth.toFixed(0)} µm</dd>
      <dt>${t('k_vrel')}</dt><dd>${f.vrel.toFixed(0)} µm/s</dd>
      <dt>${t('k_vz')}</dt><dd>${Math.abs(f.vz).toFixed(0)} µm/s ${dir}</dd>
      <dt>${t('k_W')}</dt><dd>${(f.W || 0).toFixed(2)} pN</dd>
      <dt>${t('k_T')}</dt><dd>${(f.T || 0).toFixed(1)} pN</dd>
      <dt>${t('k_gam')}</dt><dd>${f.gam.toFixed(3)} s⁻¹</dd>
      <dt>${t('k_ten')}</dt><dd>${f.tension.toFixed(2)} / ${f.strength.toFixed(2)} pN</dd>
      <dt>${t('k_light')}</dt><dd>${f.light.toFixed(2)}</dd>
      <dt>${t('k_nut')}</dt><dd>${f.nut.toFixed(2)}</dd>
      <dt>${t('k_gen')}</dt><dd>${col.gen} · ${t('k_kids')} ${col.kids} · ${t('k_peak')} ${col.peak}</dd>
    </dl>`;
    const gl = [['g_adh', f.gm[ADH], 1], ['g_soma', f.gm[SOMA], 0.9], ['g_swim', f.gm[SWIM], 1.5], ['g_bond', f.gm[BOND], 14], ['g_buoy', f.gm[BUOY], 1]];
    html += `<div class="genes">` + gl.map(([k, v, mx], i) => `<div class="gene"><span>${t(k)}</span><i><b style="width:${Math.round(100 * Math.min(1, v / mx))}%;background:${GENE_COL[i]}"></b></i><em class="mono">${k === 'g_bond' ? v.toFixed(1) + ' pN' : v.toFixed(2)}</em></div>`).join('') + `</div>`;
  }
  box.innerHTML = html;
  tools.hidden = !alive; $('#cFollow').textContent = follow ? t('unfollow') : t('follow');
  mini.hidden = !alive; if (alive) drawMini(col);
  lin.hidden = false; $('#cLinCap').hidden = false; drawLineage(col);
}
function drawMini(col) {
  const { ctx, w, h } = fit($('#cMini'));
  ctx.fillStyle = '#041016'; ctx.fillRect(0, 0, w, h);
  const cs = col.cells; let mr = A * 2;
  const rel = cs.map(c => { let dx = c.x - col.cx; if (dx > LX / 2) dx -= LX; if (dx < -LX / 2) dx += LX; return [dx, c.z - col.cz, c]; });
  for (const [x, z] of rel) mr = Math.max(mr, Math.hypot(x, z) + A * 2.5);
  const s = Math.min(w, h) / (2 * mr) * 0.9, ox = w / 2, oy = h / 2;
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, z] of rel) { const hr = A * s * 3.5; ctx.globalAlpha = 0.25; ctx.drawImage(halo[((col.hue / 10) | 0) % HB], ox + x * s - hr, oy + z * s - hr, 2 * hr, 2 * hr); }
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
  const pos = new Map(rel.map(([x, z, c]) => [c, [ox + x * s, oy + z * s]]));
  ctx.strokeStyle = 'rgba(225,245,230,0.6)'; ctx.lineWidth = Math.max(1, s * 0.6); ctx.beginPath();
  for (const [, , c] of rel) for (const o of c.bonds) if (o.id > c.id && pos.has(o)) { const a = pos.get(c), b = pos.get(o); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
  ctx.stroke();
  const cr = A * s * 0.95, now = performance.now() / 90;
  for (const [x, z, c] of rel) {
    const X = ox + x * s, Y = oy + z * s;
    ctx.fillStyle = c.soma ? '#ffc06e' : `hsl(${col.hue},70%,62%)`;
    ctx.beginPath(); ctx.arc(X, Y, cr, 0, 6.2832); ctx.fill();
    ctx.fillStyle = 'rgba(10,40,20,0.35)'; ctx.beginPath(); ctx.arc(X, Y + cr * 0.15, cr * 0.4, 0, 6.2832); ctx.fill();
    if ((c.soma || c.b < 0.9) && c.g[SWIM] > 0.05) {
      ctx.strokeStyle = 'rgba(235,255,240,0.8)'; ctx.lineWidth = 1; ctx.beginPath();
      for (const sg of [-1, 1]) { const a = c.ph + sg * 0.5, wg = Math.sin(now + c.id) * 0.6 * sg; ctx.moveTo(X + Math.cos(c.ph) * cr, Y + Math.sin(c.ph) * cr); ctx.quadraticCurveTo(X + Math.cos(a + wg) * cr * 1.6, Y + Math.sin(a + wg) * cr * 1.6, X + Math.cos(a) * cr * 2.6, Y + Math.sin(a) * cr * 2.6); }
      ctx.stroke();
    }
  }
}
function drawLineage(col) {
  const { ctx, w, h } = fit($('#cLin')); ctx.clearRect(0, 0, w, h);
  const lin = sim.lineage(col, 48).reverse(); if (!lin.length) return;
  let mx = 2; for (const r of lin) mx = Math.max(mx, Math.log2(r.peak + 1));
  const bw = (w - 4) / lin.length;
  lin.forEach((r, i) => { const v = Math.log2(r.peak + 1) / mx, bh = Math.max(2, v * (h - 16)); ctx.fillStyle = `hsl(${r.hue},65%,${r.peak > 1 ? 60 : 42}%)`; ctx.fillRect(2 + i * bw, h - 14 - bh, Math.max(1, bw - 1.5), bh); });
  ctx.direction = 'ltr'; ctx.fillStyle = css('--sand-3'); ctx.font = '10px ' + css('--mono'); ctx.textBaseline = 'bottom';
  ctx.textAlign = 'left'; ctx.fillText('gen ' + lin[0].gen, 2, h); ctx.textAlign = 'right'; ctx.fillText('gen ' + lin[lin.length - 1].gen, w - 2, h);
}

/* ---------------- controls ---------------- */
const PRESETS = [
  { key: 'p_lake', run() { newSim({}); } },
  { key: 'p_nopred', run() { newSim({ predators: false }); } },
  { key: 'p_sed', run() { newSim({ source: 'sediment' }); } },
  { key: 'p_noflow', run() { newSim({ flow: false }); } },
  { key: 'p_dim', run() { newSim({ light: 0.5 }); } },
  { key: 'p_stir', run() { sim.stir(); } },
];
function newSim(opts) {
  seed = (seed * 1103515245 + 12345) % 2147483647;
  sim = new Column(seed, opts || {}); resumedModel = null;
  selected = null; follow = false; lastEv = -1; lastMs = 0; banner = null; cam.z = 1; cam.x = LX / 2; cam.y = LZ / 2;
}
function sync() {
  const p = sim.p;
  $('#cFlowT').checked = p.flow; $('#cPredT').checked = p.predators;
  $$('#cSrc button').forEach(b => b.classList.toggle('on', b.dataset.v === p.source));
  const set = (id, v, txt) => { $(id).value = v; $(id + 'O').textContent = txt; };
  set('#cLight', p.light, Math.round(p.light * 100) + '%');
  set('#cTurb', p.turbidity, (p.turbidity * 1000).toFixed(1) + '/mm');
  set('#cNut', p.nutrient, Math.round(p.nutrient * 100) + '%');
  set('#cRatio', p.predRatio, p.predRatio.toFixed(1));
  set('#cMut', p.mut, p.mut.toFixed(2));
  $('#cColor').value = colorBy; $('#cTr').checked = showTr; $('#cQ').checked = showQ;
  $('#cSeed').textContent = 'seed ' + sim.seed;
  const notice = $('#cModelNotice');
  notice.hidden = !resumedModel;
  notice.textContent = resumedModel ? (lang() === 'ar' ? 'استُؤنف عالم من نموذج سابق بالقواعد الحالية. هذه متابعة محلية؛ تغير الإصدار قد يؤثر في المسار.' : 'A world from an earlier model is continuing under the current rules. This local continuation may follow a different trajectory after the version change.') : '';
  legends();
}
function legends() {
  $('#cFlowLeg').innerHTML = `<span><i style="background:#7ad8ff"></i> ${t('ch_rms')}</span><span><i style="background:#7ad8ff;opacity:.45"></i> ${t('ch_max')}</span>`;
  $('#cProfLeg').innerHTML = `<span><i style="background:#5d7480"></i> ${t('ch_uni')}</span><span><i style="background:#86c95e"></i> ${t('ch_multi')}</span><span><i style="background:#f0c04a"></i> ${t('ch_light')}</span><span><i style="background:#7ad8ff"></i> ${t('ch_nut')}</span>`;
  $('#cRiverLeg').innerHTML = [4, 3, 2, 1, 0].map(k => `<span><i style="background:${CLS_COL[k]}"></i> ${L[lang()].cls[k]}</span>`).join('');
  $('#cArmsLeg').innerHTML = `<span><i style="background:#86c95e"></i> ${t('ch_diam')}</span><span><i style="background:#ff7aa8"></i> ${t('ch_gape')}</span><span><i style="background:#86c95e;opacity:.45"></i> max</span>`;
  $('#cGenesLeg').innerHTML = ['g_adh', 'g_soma', 'g_swim', 'g_bond', 'g_buoy'].map((k, i) => `<span><i style="background:${GENE_COL[i]}"></i> ${t(k)}</span>`).join('');
}
function applyLang() {
  $$('[data-c18n]').forEach(el => { const v = L[lang()][el.dataset.c18n]; if (typeof v === 'string') el.textContent = v; });
  $$('[data-c18n-html]').forEach(el => { el.innerHTML = L[lang()][el.dataset.c18nHtml]; });
  $('#cPresets').innerHTML = PRESETS.map((p, i) => `<button class="preset" data-p="${i}"><b>${t(p.key)}</b><span>${t(p.key + '_d')}</span></button>`).join('');
  $('#cPlay').textContent = running ? (lang() === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (lang() === 'ar' ? 'تشغيل' : 'Play');
  sync(); updateTicker(true); renderCard(); drawCharts(); updateStatus();
}
function bind() {
  $('#cPlay').onclick = () => { running = !running; $('#cPlay').classList.toggle('on', running); $('#cPlay').textContent = running ? (lang() === 'ar' ? 'إيقاف مؤقت' : 'Pause') : (lang() === 'ar' ? 'تشغيل' : 'Play'); };
  $$('#cSpeed button').forEach(b => b.onclick = () => { speed = +b.dataset.v; $$('#cSpeed button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#cFlowT').onchange = (e) => { sim.setParam('flow', e.target.checked); updateTicker(); };
  $('#cPredT').onchange = (e) => { sim.setParam('predators', e.target.checked); updateTicker(); };
  $$('#cSrc button').forEach(b => b.onclick = () => { sim.setParam('source', b.dataset.v); sync(); });
  const rng = (id, key) => { $(id).oninput = (e) => { sim.setParam(key, +e.target.value); sync(); }; };
  rng('#cLight', 'light'); rng('#cTurb', 'turbidity'); rng('#cNut', 'nutrient'); rng('#cRatio', 'predRatio'); rng('#cMut', 'mut');
  $('#cStir').onclick = () => { sim.stir(); updateTicker(); };
  $('#cReset').onclick = $('#cRestart').onclick = () => { newSim({}); sync(); updateTicker(true); renderCard(); };
  $('#cColor').onchange = (e) => { colorBy = e.target.value; };
  $('#cTr').onchange = (e) => { showTr = e.target.checked; };
  $('#cQ').onchange = (e) => { showQ = e.target.checked; };
  $('#cIntroClose').onclick = () => { $('#cIntro').hidden = true; try { localStorage.setItem('genesis.cintro', '0'); } catch (e) {} };
  try { if (localStorage.getItem('genesis.cintro') === '0') $('#cIntro').hidden = true; } catch (e) {}
  $('#cPresets').onclick = (e) => {
    const b = e.target.closest('.preset'); if (!b) return;
    const p = PRESETS[+b.dataset.p]; p.run(); sim.log('preset', { key: p.key });
    sync(); updateTicker(true); renderCard(); if (!running) $('#cPlay').click();
  };
  $('#cFollow').onclick = () => { follow = !follow; renderCard(); };
  $('#cZoomTo').onclick = () => { if (!selected || !selected.alive) return; cam.z = Math.max(cam.z, 8); follow = true; renderCard(); };
  $('#cZin').onclick = () => zoomAt(null, 1.6); $('#cZout').onclick = () => zoomAt(null, 1 / 1.6);
  $('#cZreset').onclick = () => { cam.z = 1; cam.x = LX / 2; cam.y = LZ / 2; follow = false; renderCard(); };
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return; const r = canvas.getBoundingClientRect(), s = (r.width / LX) * cam.z;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; follow = false; }
    if (drag.moved) { cam.x = drag.cx - dx / s; cam.y = drag.cy - dy / s; }
  });
  canvas.addEventListener('pointerup', (e) => {
    if (drag && !drag.moved) {
      const r = canvas.getBoundingClientRect(), s = (r.width / LX) * cam.z, { ox, oy } = view(r.width, r.height);
      const wx = (e.clientX - r.left - ox) / s, wz = (e.clientY - r.top - oy) / s;
      selected = sim.colonyAt(wx, wz, 12 + 14 / cam.z); if (!selected) follow = false;
      renderCard();
    }
    drag = null;
  });
  canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoomAt(e, e.deltaY < 0 ? 1.2 : 1 / 1.2); }, { passive: false });
  canvas.addEventListener('dblclick', () => { cam.z = 1; follow = false; });
  document.addEventListener('genesis:lang', applyLang);
  window.addEventListener('resize', drawCharts);
}
function zoomAt(e, f) {
  const r = canvas.getBoundingClientRect(), before = view(r.width, r.height), s0 = (r.width / LX) * cam.z;
  const px = e ? e.clientX - r.left : r.width / 2, py = e ? e.clientY - r.top : r.height / 2;
  const wx = (px - before.ox) / s0, wz = (py - before.oy) / s0;
  cam.z = Math.min(24, Math.max(1, cam.z * f));
  const s1 = (r.width / LX) * cam.z; cam.x = wx - (px - r.width / 2) / s1; cam.y = wz - (py - r.height / 2) / s1;
}

function loop() {
  if (document.body.dataset.world === 'column') {
    if (running && document.body.dataset.experimentRunning !== 'true' && sim.cells.length) {
      const t0 = performance.now();
      for (let i = 0; i < speed; i++) { sim.step(); if (performance.now() - t0 > 26) break; }
    }
    drawTank();
    frame++;
    if (frame % 8 === 0) updateStatus();
    if (frame % 20 === 0) { drawCharts(); updateTicker(); }
    if (frame % 12 === 0 && selected) renderCard();
  }
  requestAnimationFrame(loop);
}
bind(); applyLang();
window.__column = {
  get sim() { return sim; }, cam,
  // load a saved world (from the perpetual run) and keep simulating it here
  load(st) { sim = Column.fromState(st); resumedModel = String(st.modelVersion || 'legacy') !== K.MODEL_VERSION; selected = null; follow = false; lastEv = -1; lastMs = sim.t; banner = null; cam.z = 1; cam.x = LX / 2; cam.y = LZ / 2; sync(); updateTicker(true); renderCard(); drawCharts(); updateStatus(); },
};
requestAnimationFrame(loop);
})();
