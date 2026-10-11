/* ===================================================================
   GENESIS — interface
   =================================================================== */
(function () {
'use strict';
const { Sim, TRAITS, NT, LOCI, NLOC, NW, NI, NH, WORLD_W, WORLD_H, GW, GH, PUBERTY, GESTATION, SEASON } = Genesis;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

/* ---------------- i18n ---------------- */
const I18N = {
  ar: {
    title: 'جينيسيس', tagline: 'مختبر حيّ للتطور: من الخلية الأولى إلى برامج التربية.',
    w_obs: 'المرصد', w_obs_d: 'العالم الأبدي والقوانين', w_col: 'عمود الماء', w_col_d: 'فيزياء حقيقية وتعدد الخلايا', w_or: 'الأصول', w_or_d: 'نموذج مبسّط للانتقال', w_herd: 'القطيع', w_herd_d: 'الوراثة الكمية والتربية',
    year: 'السنة', season: 'الموسم', temp: 'الحرارة', gen: 'متوسط الجيل', pop: 'حجم القطيع',
    pause: 'إيقاف مؤقت', play: 'تشغيل', hide: 'إخفاء',
    intro: 'كل كائن هنا يحمل <b>جينومًا ثنائي الصيغة</b> من 48 موقعًا جينيًا لست صفات، و<b>دماغًا عصبيًا</b> يُورَّث ويتطوّر. الإناث تمرّ بـ<b>دورة شبق</b> وحمل وولادة، والجوع يوقف الشبق، والحرارة تخفض الخصوبة. لا شيء مكتوب مسبقًا: الانتخاب الطبيعي أو برنامجك التربوي هو ما يغيّر القطيع. المعادلات تُحسب من البيانات الحية، ويمكنك مقارنة المكافئ الوراثي المقدَّر من السجلات بالقيمة الحقيقية المعروفة من الجينوم.',
    program: 'برنامج التربية',
    m_nat: 'الطبيعة وحدها', m_nat_d: 'تزاوج حر، والبقاء للأصلح',
    m_sel: 'تزاوج طبيعي انتخابي', m_sel_d: 'فقط الذكور المنتخبة تُلقّح بالتزاوج',
    m_ai: 'برنامج تلقيح اصطناعي', m_ai_d: 'بنك سائل منوي مجمّد من نخبة الطلائق',
    target: 'الصفة المستهدفة', criterion: 'معيار الانتخاب', pheno: 'المظهر', genomic: 'التقييم الجينومي',
    acc: 'دقة التقييم الجينومي r', sire: 'نسبة الطلائق المنتخبة', dam: 'نسبة الإناث المستبقاة للتربية',
    sireWarn: 'عدد قليل جدًا من الطلائق لا يكفي لتغطية القطيع بالتزاوج الطبيعي. هذا بالضبط ما يحلّه التلقيح الاصطناعي.',
    heatDet: 'كفاءة اكتشاف الشبق', bankSize: 'عدد الطلائق في البنك',
    canister: 'الحاوية: قصبات السائل المنوي المجمّد (اضغط لعرض الطلوقة)', bankEmpty: 'البنك فارغ، يُجمع السائل المنوي من الطلائق المنتخبة البالغة…',
    env: 'البيئة', meanTemp: 'متوسط الحرارة السنوي', food: 'وفرة المرعى', mut: 'معدل الطفرات لكل أليل',
    inbDep: 'تدهور التربية الداخلية (تكلفة أيضية لكل موقع متماثل)', drought: 'موجة جفاف', bottle: 'عنق الزجاجة (16 فردًا)',
    colorBy: 'تلوين الكائنات حسب', cb_sex: 'الجنس والحالة التناسلية', cb_bv: 'القيمة التربوية للصفة المستهدفة', cb_F: 'معامل التربية الداخلية F', cb_gen: 'رقم الجيل',
    reset: 'بداية جديدة', extinctT: 'انقرض القطيع', extinctD: 'جرّب ظروفًا أرحم أو انتخابًا أقل حدّة.',
    log: 'سجلّ الأحداث',
    galton: 'انحدار النسل على متوسط الأبوين', galtonS: 'أسلوب غالتون',
    h2est: 'h² المقدَّر (الميل)', h2true: 'h² الحقيقي (الجينوم)', nRec: 'عدد المواليد', S: 'فارق الانتخاب S', Rp: 'الاستجابة المتوقعة h²S', Rr: 'الاستجابة المحققة',
    trend: 'الاتجاه الوراثي', trendS: 'متوسط القيمة التربوية بوحدات الانحراف المعياري',
    popT: 'القطيع', popS: 'الحجم، الإناث، الحوامل', inbT: 'التربية الداخلية والتباين', inbS: 'F و h² للصفة المستهدفة',
    insp: 'بطاقة الحيوان', inspEmpty: 'اضغط على أي كائن في العالم لعرض جينومه ونسبه وقيمه التربوية.',
    gcap: 'كل عمود موقع جيني: النصف العلوي أليل الأم والسفلي أليل الأب. الإطار الذهبي = موقع متماثل بالنسب (IBD).',
    foot: 'النموذج: وراثة إضافية متعددة الجينات (8 مواقع لكل صفة)، انعزال مندلي مستقل، طفرات، مكافئات وراثية أولية: الحجم 0.45، السرعة 0.35، الرؤية 0.30، تحمل الحرارة 0.30، الخصوبة 0.10، الكفاءة الغذائية 0.25.',
    traits: ['حجم الجسم', 'السرعة', 'مدى الرؤية', 'تحمّل الحرارة', 'الخصوبة', 'الكفاءة الغذائية'],
    seasons: ['ربيع', 'صيف', 'خريف', 'شتاء'],
    female: 'أنثى', male: 'ذكر', estrus: 'في الشبق', pregnant: 'حامل', juvenile: 'غير بالغ', anestrus: 'انقطاع شبق (هزال)', elite: 'طلوقة منتخبة', aiBorn: 'مولود بالتلقيح الاصطناعي', frozen: 'مجمّد في البنك', dead: 'نافق',
    id: 'الرقم', age: 'العمر', days: 'يوم', generation: 'الجيل', sireL: 'الأب', damL: 'الأم', kids: 'النسل', F: 'التربية الداخلية F', energy: 'حالة الجسم', founder: 'مؤسس',
    trait: 'الصفة', P: 'المظهر', BV: 'القيمة التربوية', EBV: 'التقدير الجينومي',
    lg_f: 'أنثى', lg_m: 'ذكر', lg_e: 'شبق', lg_p: 'حامل', lg_s: 'طلوقة منتخبة', lg_low: 'منخفض', lg_high: 'مرتفع',
    hud_drought: 'جفاف', hud_heat: 'إجهاد حراري', hud_ai: 'تلقيح اصطناعي', hud_births: 'مواليد', hud_ai_births: 'منها بالتلقيح',
    ev_start: 'بدأ القطيع المؤسس: 260 حيوانًا بتباين وراثي طبيعي', ev_drought: 'موجة جفاف: انهار نمو المرعى', ev_rain: 'عادت الأمطار',
    ev_bottleneck: 'عنق زجاجة: نجا 16 حيوانًا فقط', ev_mode_natural: 'التحوّل إلى الانتخاب الطبيعي وحده', ev_mode_selective: 'بدء برنامج تزاوج طبيعي انتخابي', ev_mode_ai: 'بدء برنامج التلقيح الاصطناعي',
    ev_extinct: 'انقرض القطيع', ev_firstAI: 'وُلد أول عجل بالتلقيح الاصطناعي', ev_genmile: 'متوسط القطيع بلغ الجيل {g}', ev_preset: 'تجربة',
    pr_nat: 'الطبيعة وحدها', pr_nat_d: 'لا تدخّل. راقب ماذا تختار البيئة.',
    pr_heat: 'صيف 40 درجة', pr_heat_d: 'حرارة قاسية. هل يتكيّف القطيع قبل أن ينهار؟',
    pr_ai: 'نخبة بالتلقيح الاصطناعي', pr_ai_d: 'انتخاب جينومي لحجم الجسم، 5% من الطلائق.',
    pr_fert: 'الخصوبة: صفة عنيدة', pr_fert_d: 'h² = 0.10. انتخاب مظهري فقط. ثم جرّب الجينومي.',
    pr_bottle: 'عنق الزجاجة', pr_bottle_d: '16 ناجيًا فقط. شاهد F يقفز.',
    sel_off: 'في الانتخاب الطبيعي يبقى S قريبًا من الصفر، والانحدار يقيس h² مباشرة.',
    trendLegend: 'الصفات', popN: 'الكل', popF: 'إناث', popP: 'حوامل', inbF: 'F', inbH: 'h² (الصفة المستهدفة)',
    alive: 'حي', clickParent: 'عرض',
  },
  en: {
    title: 'Genesis', tagline: 'A living laboratory of evolution, from the first cells to breeding programs.',
    w_obs: 'Observatory', w_obs_d: 'The perpetual world and the laws', w_col: 'Water column', w_col_d: 'Real physics and multicellularity', w_or: 'Origins', w_or_d: 'A simplified transition model', w_herd: 'Herd', w_herd_d: 'Quantitative genetics & breeding',
    year: 'Year', season: 'Season', temp: 'Temp', gen: 'Mean generation', pop: 'Herd size',
    pause: 'Pause', play: 'Play', hide: 'Hide',
    intro: 'Every creature carries a <b>diploid genome</b> of 48 loci across six traits and an inherited, evolving <b>neural brain</b>. Females go through an <b>estrous cycle</b>, pregnancy and calving; poor body condition stops cycling and heat stress lowers conception. Nothing is scripted: natural selection, or your breeding program, is what changes the herd. The equations are computed from live records, and you can compare the heritability estimated from records against the true value known from the genome.',
    program: 'Breeding program',
    m_nat: 'Nature alone', m_nat_d: 'Free mating, survival of the fittest',
    m_sel: 'Selected natural service', m_sel_d: 'Only selected males breed by mating',
    m_ai: 'Artificial insemination', m_ai_d: 'Frozen-semen bank from elite sires',
    target: 'Target trait', criterion: 'Selection criterion', pheno: 'Phenotype', genomic: 'Genomic EBV',
    acc: 'Genomic accuracy r', sire: 'Sires selected', dam: 'Females kept for breeding',
    sireWarn: 'Too few sires cannot cover the herd by natural service. This is exactly the problem AI solves.',
    heatDet: 'Heat detection rate', bankSize: 'Sires in the bank',
    canister: 'Canister: frozen semen straws (tap to view the sire)', bankEmpty: 'Bank empty; collecting from selected adult sires…',
    env: 'Environment', meanTemp: 'Mean annual temperature', food: 'Pasture richness', mut: 'Mutation rate per allele',
    inbDep: 'Inbreeding depression (metabolic cost per homozygous locus)', drought: 'Drought', bottle: 'Bottleneck (16 survive)',
    colorBy: 'Color creatures by', cb_sex: 'Sex and reproductive state', cb_bv: 'Breeding value, target trait', cb_F: 'Inbreeding coefficient F', cb_gen: 'Generation number',
    reset: 'Start over', extinctT: 'The herd went extinct', extinctD: 'Try gentler conditions or less intense selection.',
    log: 'Event log',
    galton: 'Offspring on mid-parent regression', galtonS: 'Galton’s method',
    h2est: 'h² estimated (slope)', h2true: 'h² true (genome)', nRec: 'Births used', S: 'Selection differential S', Rp: 'Predicted response h²S', Rr: 'Realized response',
    trend: 'Genetic trend', trendS: 'Mean breeding value, in SD units',
    popT: 'Herd', popS: 'Size, females, pregnant', inbT: 'Inbreeding and variance', inbS: 'F and h² of the target trait',
    insp: 'Animal card', inspEmpty: 'Click any creature in the world to see its genome, pedigree and breeding values.',
    gcap: 'Each column is a locus: top half is the dam’s allele, bottom half the sire’s. Gold frame = identical by descent (IBD).',
    foot: 'Model: additive polygenic inheritance (8 loci per trait), independent Mendelian segregation, mutation. Founder heritabilities: size 0.45, speed 0.35, vision 0.30, heat tolerance 0.30, fertility 0.10, feed efficiency 0.25.',
    traits: ['Body size', 'Speed', 'Vision', 'Heat tolerance', 'Fertility', 'Feed efficiency'],
    seasons: ['Spring', 'Summer', 'Autumn', 'Winter'],
    female: 'Female', male: 'Male', estrus: 'In estrus', pregnant: 'Pregnant', juvenile: 'Juvenile', anestrus: 'Anestrous (low condition)', elite: 'Selected sire', aiBorn: 'Born by AI', frozen: 'Frozen in bank', dead: 'Dead',
    id: 'ID', age: 'Age', days: 'days', generation: 'Generation', sireL: 'Sire', damL: 'Dam', kids: 'Offspring', F: 'Inbreeding F', energy: 'Body condition', founder: 'founder',
    trait: 'Trait', P: 'Phenotype', BV: 'Breeding value', EBV: 'Genomic EBV',
    lg_f: 'Female', lg_m: 'Male', lg_e: 'Estrus', lg_p: 'Pregnant', lg_s: 'Selected sire', lg_low: 'low', lg_high: 'high',
    hud_drought: 'Drought', hud_heat: 'Heat stress', hud_ai: 'AI', hud_births: 'births', hud_ai_births: 'by AI',
    ev_start: 'Founder herd released: 260 animals with natural genetic variation', ev_drought: 'Drought: pasture growth collapsed', ev_rain: 'The rains returned',
    ev_bottleneck: 'Bottleneck: only 16 animals survived', ev_mode_natural: 'Switched to natural selection only', ev_mode_selective: 'Selected natural service started', ev_mode_ai: 'AI breeding program started',
    ev_extinct: 'The herd went extinct', ev_firstAI: 'First calf born by AI', ev_genmile: 'Herd average reached generation {g}', ev_preset: 'Experiment',
    pr_nat: 'Nature alone', pr_nat_d: 'No intervention. Watch what the environment selects.',
    pr_heat: 'A 40° summer', pr_heat_d: 'Harsh heat. Does the herd adapt before it collapses?',
    pr_ai: 'Elite AI program', pr_ai_d: 'Genomic selection for body size, top 5% of sires.',
    pr_fert: 'Fertility, the stubborn trait', pr_fert_d: 'h² = 0.10, phenotypic selection. Then try genomic.',
    pr_bottle: 'Bottleneck', pr_bottle_d: 'Only 16 survivors. Watch F jump.',
    sel_off: 'Under natural selection S stays near zero, and the slope measures h² directly.',
    trendLegend: 'Traits', popN: 'All', popF: 'Females', popP: 'Pregnant', inbF: 'F', inbH: 'h² (target trait)',
    alive: 'alive', clickParent: 'view',
  },
};
let lang = 'ar';
try { lang = localStorage.getItem('genesis.lang') || 'ar'; } catch (e) {}
const t = (k) => (I18N[lang][k] !== undefined ? I18N[lang][k] : k);
const tn = (i) => I18N[lang].traits[i];

/* ---------------- state ---------------- */
let seed = 20261011;
let sim = new Sim(seed);
let running = true, speed = 4, selected = null, selectedRec = null, colorBy = 'sex';
const trendOn = new Array(NT).fill(true);
let gTrait = 0;
let frame = 0, lastEventCount = -1;
const TCOL = () => [0, 1, 2, 3, 4, 5].map(i => css('--t' + i));

/* ---------------- canvas helpers ---------------- */
function fit(c) {
  const r = c.getBoundingClientRect(), d = Math.min(2, window.devicePixelRatio || 1);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d');
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

/* ---------------- world rendering ---------------- */
const world = $('#world');
const foodCanvas = document.createElement('canvas');
foodCanvas.width = GW; foodCanvas.height = GH;
const fctx = foodCanvas.getContext('2d');
const fimg = fctx.createImageData(GW, GH);

function drawFood() {
  const d = fimg.data, heat = Math.max(0, Math.min(1, (sim.temperature() - 30) / 14));
  const dr = sim.drought > 0 ? 1 : 0;
  for (let i = 0; i < GW * GH; i++) {
    const f = sim.food[i], cap = sim.fert[i];
    const v = Math.min(1, f / 0.9);
    // sand → oasis green; drought bleaches
    const sr = 70 + 26 * cap + heat * 22, sg = 58 + 14 * cap, sb = 42 + 4 * cap;
    const gr = 64, gg = 138 - dr * 40, gb = 72;
    d[4 * i] = sr + (gr - sr) * v;
    d[4 * i + 1] = sg + (gg - sg) * v;
    d[4 * i + 2] = sb + (gb - sb) * v;
    d[4 * i + 3] = 255;
  }
  fctx.putImageData(fimg, 0, 0);
}

function lerpColor(a, b, x) {
  return [a[0] + (b[0] - a[0]) * x, a[1] + (b[1] - a[1]) * x, a[2] + (b[2] - a[2]) * x];
}
const DIV_LO = [99, 179, 221], DIV_MID = [235, 223, 196], DIV_HI = [227, 87, 46];
function diverge(z) { // z in SD units
  const x = Math.max(-1, Math.min(1, z / 2));
  const c = x < 0 ? lerpColor(DIV_MID, DIV_LO, -x) : lerpColor(DIV_MID, DIV_HI, x);
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
}
function seqColor(x) { // 0..1 sand→saffron→red
  x = Math.max(0, Math.min(1, x));
  const c = x < 0.5 ? lerpColor([120, 140, 130], [227, 163, 59], x * 2) : lerpColor([227, 163, 59], [228, 60, 46], (x - 0.5) * 2);
  return `rgb(${c[0] | 0},${c[1] | 0},${c[2] | 0})`;
}

function drawWorld() {
  const { ctx, w, h } = fit(world);
  const sx = w / WORLD_W, sy = h / WORLD_H;
  drawFood();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(foodCanvas, 0, 0, w, h);
  // night vignette
  const vg = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(4,8,10,0.35)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, w, h);

  const female = css('--female'), male = css('--male'), saff = css('--saffron'), pink = css('--t4');
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 180);
  const s = sim.stats, tgt = sim.p.target;
  const sel = sim.p.mode !== 'natural';
  const maxGen = Math.max(1, ...sim.agents.map(a => a.gen));

  // selected agent: vision + pheromone field
  if (selected && selected.alive) {
    const a = selected;
    ctx.strokeStyle = 'rgba(235,223,196,0.25)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(a.x * sx, a.y * sy, a.vision * sx, 0, 6.2832); ctx.stroke();
    if (a.target && a.target.alive) {
      ctx.setLineDash([4, 4]); ctx.strokeStyle = pink;
      ctx.beginPath(); ctx.moveTo(a.x * sx, a.y * sy); ctx.lineTo(a.target.x * sx, a.target.y * sy); ctx.stroke();
      ctx.setLineDash([]);
    }
    // lines to living kin
    ctx.strokeStyle = 'rgba(227,163,59,0.55)';
    for (const o of sim.agents) {
      if (o === a) continue;
      if (o.id === a.sire || o.id === a.dam || o.sire === a.id || o.dam === a.id) {
        ctx.beginPath(); ctx.moveTo(a.x * sx, a.y * sy); ctx.lineTo(o.x * sx, o.y * sy); ctx.stroke();
      }
    }
  }

  for (const a of sim.agents) {
    const x = a.x * sx, y = a.y * sy;
    const juv = a.age > PUBERTY ? 1 : 0.55 + 0.45 * a.age / PUBERTY;
    const r = a.radius * juv * Math.max(0.8, sx * 1.3);
    let col;
    if (colorBy === 'sex') col = a.sex ? male : female;
    else if (colorBy === 'bv') col = diverge((a.G[tgt] - s.meanG[tgt]) / Math.sqrt(Math.max(0.02, s.vg[tgt])) * 0.8);
    else if (colorBy === 'F') col = seqColor(a.F / 0.4);
    else col = seqColor(a.gen / maxGen);
    if (a.estrus) {
      ctx.strokeStyle = pink; ctx.globalAlpha = 0.35 + 0.5 * pulse; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, y, r + 3 + 3 * pulse, 0, 6.2832); ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = col;
    ctx.globalAlpha = a.age > PUBERTY ? 0.95 : 0.7;
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.2832); ctx.fill();
    ctx.globalAlpha = 1;
    // heading tick
    ctx.strokeStyle = 'rgba(10,14,16,0.75)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a.h) * r, y + Math.sin(a.h) * r); ctx.stroke();
    if (a.preg > 0) {
      const prog = 1 - a.preg / GESTATION;
      ctx.fillStyle = '#fff6e6';
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.2, r * 0.25 + r * 0.25 * prog), 0, 6.2832); ctx.fill();
    }
    if (sel && a.sex === 1 && a.eligible && a.age > PUBERTY) {
      ctx.strokeStyle = saff; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(x, y, r + 2, 0, 6.2832); ctx.stroke();
    }
    if (a === selected) {
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, r + 6, 0, 6.2832); ctx.stroke();
    }
  }
}

/* ---------------- charts ---------------- */
function niceTicks(lo, hi, n = 4) {
  const span = hi - lo || 1, step0 = span / n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= step0) || step0;
  const out = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) out.push(+v.toFixed(6));
  return out;
}
function lineChart(canvas, { series, ymin, ymax, xmin, xmax, fmt = (v) => v, zero = false }) {
  const { ctx, w, h } = fit(canvas);
  ctx.clearRect(0, 0, w, h);
  ctx.direction = 'ltr';
  const padL = 34, padR = 8, padT = 8, padB = 18;
  const X = (v) => padL + (v - xmin) / (xmax - xmin || 1) * (w - padL - padR);
  const Y = (v) => padT + (1 - (v - ymin) / (ymax - ymin || 1)) * (h - padT - padB);
  ctx.font = '10px ' + css('--mono');
  ctx.fillStyle = css('--sand-3'); ctx.strokeStyle = css('--line'); ctx.lineWidth = 1;
  ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
  for (const v of niceTicks(ymin, ymax)) {
    const y = Y(v);
    ctx.globalAlpha = v === 0 && zero ? 1 : 0.5;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillText(fmt(v), padL - 4, y);
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  const yearTicks = niceTicks(xmin / SEASON, xmax / SEASON, 5).filter(v => Number.isInteger(v) || v % 0.5 === 0);
  for (const yv of yearTicks) {
    const x = X(yv * SEASON);
    if (x < padL || x > w - padR) continue;
    ctx.fillText((lang === 'ar' ? 'س' : 'y') + yv, x, h - padB + 4);
  }
  for (const s of series) {
    if (!s.data.length) continue;
    if (s.fill) {
      ctx.beginPath();
      s.data.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
      ctx.lineTo(X(s.data[s.data.length - 1][0]), Y(Math.max(ymin, 0))); ctx.lineTo(X(s.data[0][0]), Y(Math.max(ymin, 0))); ctx.closePath();
      ctx.fillStyle = s.color; ctx.globalAlpha = 0.14; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 1.6; ctx.lineJoin = 'round';
    if (s.dash) ctx.setLineDash(s.dash);
    ctx.beginPath();
    s.data.forEach(([x, y], i) => i ? ctx.lineTo(X(x), Y(y)) : ctx.moveTo(X(x), Y(y)));
    ctx.stroke(); ctx.setLineDash([]);
    const [lx, ly] = s.data[s.data.length - 1];
    ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(X(lx), Y(ly), 2.6, 0, 6.2832); ctx.fill();
  }
  return { X, Y };
}

function drawCharts() {
  const H = sim.hist;
  const xmin = H.length ? H[0].t : 0, xmax = H.length ? Math.max(H[H.length - 1].t, xmin + SEASON / 2) : SEASON;
  const cols = TCOL();
  // trend
  let lo = -0.5, hi = 0.5;
  for (const r of H) for (let i = 0; i < NT; i++) if (trendOn[i]) { lo = Math.min(lo, r.G[i]); hi = Math.max(hi, r.G[i]); }
  const pad = (hi - lo) * 0.08;
  const sel = sim.p.mode !== 'natural';
  lineChart($('#cTrend'), {
    xmin, xmax, ymin: lo - pad, ymax: hi + pad, zero: true, fmt: (v) => (v > 0 ? '+' : '') + v.toFixed(1),
    series: [0, 1, 2, 3, 4, 5].filter(i => trendOn[i]).map(i => ({ data: H.map(r => [r.t, r.G[i]]), color: cols[i], width: sel && i === sim.p.target ? 3 : 1.5 })),
  });
  // population
  let pm = 50;
  for (const r of H) pm = Math.max(pm, r.n);
  lineChart($('#cPopC'), {
    xmin, xmax, ymin: 0, ymax: pm * 1.1, fmt: (v) => v | 0,
    series: [
      { data: H.map(r => [r.t, r.n]), color: css('--sand'), fill: true, width: 1.6 },
      { data: H.map(r => [r.t, r.f]), color: css('--female'), width: 1.4 },
      { data: H.map(r => [r.t, r.preg]), color: css('--t4'), width: 1.4, dash: [3, 3] },
    ],
  });
  // inbreeding
  const tg = sim.p.target;
  let im = 0.2;
  for (const r of H) im = Math.max(im, r.F, r.h2[tg]);
  lineChart($('#cInb'), {
    xmin, xmax, ymin: 0, ymax: Math.min(1, im * 1.15), fmt: (v) => v.toFixed(2),
    series: [
      { data: H.map(r => [r.t, r.F]), color: css('--heat'), width: 1.8, fill: true },
      { data: H.map(r => [r.t, r.h2[tg]]), color: cols[tg], width: 1.6 },
    ],
  });
  drawGalton();
}

function fmtS(v, d = 2) { if (!isFinite(v)) return '—'; return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(d); }

function drawGalton() {
  const c = $('#cGalton');
  const { ctx, w, h } = fit(c);
  ctx.clearRect(0, 0, w, h);
  ctx.direction = 'ltr';
  const g = sim.galton(gTrait, false);
  const cols = TCOL(), col = cols[gTrait];
  const pad = 28, R = 3.2;
  const X = (v) => pad + (v + R) / (2 * R) * (w - pad - 8);
  const Y = (v) => 8 + (1 - (v + R) / (2 * R)) * (h - 8 - pad);
  ctx.font = '10px ' + css('--mono');
  ctx.strokeStyle = css('--line'); ctx.fillStyle = css('--sand-3'); ctx.lineWidth = 1;
  for (const v of [-3, -2, -1, 0, 1, 2, 3]) {
    ctx.globalAlpha = v === 0 ? 1 : 0.45;
    ctx.beginPath(); ctx.moveTo(X(v), 8); ctx.lineTo(X(v), h - pad); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(pad, Y(v)); ctx.lineTo(w - 8, Y(v)); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top'; ctx.fillText(v, X(v), h - pad + 4);
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle'; ctx.fillText(v, pad - 4, Y(v));
  }
  ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.fillStyle = css('--sand-2');
  ctx.fillText(lang === 'ar' ? 'متوسط الأبوين (انحراف عن متوسط القطيع)' : 'mid-parent (deviation from herd mean)', (w + pad) / 2, h - 1);
  // points: newest brightest
  const n = g.pts.length;
  g.pts.forEach(([x, y, , ai], i) => {
    ctx.globalAlpha = 0.15 + 0.6 * (i / Math.max(1, n));
    ctx.fillStyle = ai ? css('--saffron') : col;
    ctx.beginPath(); ctx.arc(X(Math.max(-R, Math.min(R, x))), Y(Math.max(-R, Math.min(R, y))), 2.2, 0, 6.2832); ctx.fill();
  });
  ctx.globalAlpha = 1;
  // true h² line (dashed) and fitted line
  if (g.n > 8) {
    ctx.setLineDash([5, 4]); ctx.strokeStyle = css('--sand-2'); ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(X(-R), Y(-R * g.h2)); ctx.lineTo(X(R), Y(R * g.h2)); ctx.stroke();
    ctx.setLineDash([]);
    if (isFinite(g.slope)) {
      ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(X(-R), Y(g.icpt - R * g.slope)); ctx.lineTo(X(R), Y(g.icpt + R * g.slope)); ctx.stroke();
    }
    // mean of selected parents
    if (Math.abs(g.S) > 0.05) {
      ctx.fillStyle = css('--saffron');
      ctx.beginPath(); ctx.arc(X(g.S), Y(g.R), 5, 0, 6.2832); ctx.fill();
      ctx.strokeStyle = css('--ink-0'); ctx.lineWidth = 1.5; ctx.stroke();
    }
  }
  $('#eH2e').textContent = isFinite(g.slope) ? g.slope.toFixed(2) : '—';
  $('#eH2t').textContent = g.n ? g.h2.toFixed(2) : '—';
  $('#eN').textContent = g.n;
  $('#eS').textContent = fmtS(g.S);
  $('#eRp').textContent = fmtS(g.pred);
  $('#eRr').textContent = fmtS(g.R);
  $('#formula').textContent = g.n > 8
    ? `R = h²·S  →  ${g.h2.toFixed(2)} × ${g.S.toFixed(2)} = ${g.pred.toFixed(2)}   |   observed ${g.R.toFixed(2)}`
    : 'R = h² · S';
}

/* ---------------- HUD / legend / ticker ---------------- */
function updateHud() {
  const s = sim.stats;
  const T = sim.temperature();
  const yr = Math.floor(sim.t / SEASON) + 1;
  const ph = ((sim.t % SEASON) / SEASON);
  $('#cYear').textContent = yr;
  $('#cSeason').textContent = I18N[lang].seasons[Math.floor((ph + 0.125) * 4) % 4];
  $('#cTemp').textContent = T.toFixed(0) + '°';
  $('#cGen').textContent = s.gen.toFixed(1);
  $('#cPop').textContent = s.n;
  const chips = [];
  chips.push(`<span class="chip"><span class="dot" style="background:var(--female)"></span>${s.females} · <span class="dot" style="background:var(--male)"></span>${s.males}</span>`);
  chips.push(`<span class="chip">${sim.totalBirths} ${t('hud_births')}${sim.aiBirths ? ' · ' + sim.aiBirths + ' ' + t('hud_ai_births') : ''}</span>`);
  if (sim.drought > 0) chips.push(`<span class="chip alert">${t('hud_drought')}</span>`);
  if (T > 37) chips.push(`<span class="chip alert">${t('hud_heat')} ${T.toFixed(0)}°C</span>`);
  $('#hud').innerHTML = chips.join('');
  $('#extinct').hidden = s.n > 0;
}
function updateLegend() {
  let html = '';
  if (colorBy === 'sex') {
    html = `<span class="chip"><span class="dot" style="background:var(--female)"></span>${t('lg_f')}</span>
      <span class="chip"><span class="dot" style="background:var(--male)"></span>${t('lg_m')}</span>
      <span class="chip"><span class="dot" style="background:transparent;border:1.5px solid var(--t4)"></span>${t('lg_e')}</span>
      <span class="chip"><span class="dot" style="background:#fff6e6;width:5px;height:5px"></span>${t('lg_p')}</span>`;
  } else {
    const grad = colorBy === 'bv' ? 'linear-gradient(90deg,rgb(99,179,221),rgb(235,223,196),rgb(227,87,46))' : 'linear-gradient(90deg,rgb(120,140,130),rgb(227,163,59),rgb(228,60,46))';
    html = `<span class="chip">${t('lg_low')} <span style="display:inline-block;width:70px;height:6px;border-radius:3px;background:${grad}"></span> ${t('lg_high')}</span>`;
  }
  if (sim.p.mode !== 'natural') html += `<span class="chip"><span class="dot" style="background:transparent;border:1.5px solid var(--saffron)"></span>${t('lg_s')}</span>`;
  $('#legend').innerHTML = html;
}
function evText(e) {
  if (e.type === 'mode') return t('ev_mode_' + e.data.mode);
  if (e.type === 'preset') return t('ev_preset') + ': ' + t(e.data.key);
  if (e.type === 'genmile') return t('ev_genmile').replace('{g}', e.data.g);
  return t('ev_' + e.type);
}
function updateTicker() {
  if (sim.events.length === lastEventCount && !updateTicker.force) return;
  updateTicker.force = false;
  lastEventCount = sim.events.length;
  $('#ticker').innerHTML = sim.events.slice().reverse().map(e => {
    const y = Math.floor(e.t / SEASON) + 1, d = Math.floor((e.t % SEASON) / SEASON * 365);
    return `<div><time>${lang === 'ar' ? 'س' : 'Y'}${y} · ${d}${lang === 'ar' ? 'ي' : 'd'}</time><span>${evText(e)}</span></div>`;
  }).join('');
}

/* ---------------- semen bank ---------------- */
function updateBank() {
  const box = $('#canister');
  if (sim.p.mode !== 'ai') return;
  if (!sim.bank.length) { box.innerHTML = `<span class="bank-empty">${t('bankEmpty')}</span>`; return; }
  const n = sim.bank.length;
  box.innerHTML = sim.bank.map((b, i) => {
    const h = 54 - (n > 1 ? i / (n - 1) : 0) * 26;   // bank is sorted best-first
    return `<button class="straw" data-id="${b.id}" style="height:${h.toFixed(0)}px" title="#${b.id} · ${b.used}"><i></i></button>`;
  }).join('');
}

/* ---------------- inspector ---------------- */
function inspect(a) {
  selected = a && a.alive !== undefined ? a : null;
  selectedRec = a && a.alive === undefined ? a : null;
  renderInspector();
}
function statusPills(a) {
  const p = [];
  p.push(`<span class="pill ${a.sex ? 'm' : 'f'}">${a.sex ? t('male') : t('female')}</span>`);
  if (a.alive === false || a.died) p.push(`<span class="pill">${t('dead')}</span>`);
  if (a.alive) {
    if (a.age <= PUBERTY) p.push(`<span class="pill">${t('juvenile')}</span>`);
    if (a.estrus) p.push(`<span class="pill hot">${t('estrus')}</span>`);
    if (a.preg > 0) p.push(`<span class="pill hot">${t('pregnant')} ${Math.round(100 * (1 - a.preg / GESTATION))}%</span>`);
    if (a.sex === 0 && a.age > PUBERTY && !a.preg && a.energy / a.maxE <= 0.42) p.push(`<span class="pill">${t('anestrus')}</span>`);
    if (a.sex === 1 && sim.p.mode !== 'natural' && a.eligible && a.age > PUBERTY) p.push(`<span class="pill gold">${t('elite')}</span>`);
    if (sim.bank.some(b => b.id === a.id)) p.push(`<span class="pill gold">${t('frozen')}</span>`);
  }
  if (a.ai) p.push(`<span class="pill gold">${t('aiBorn')}</span>`);
  return p.join('');
}
function parentLink(id) {
  if (!id) return `<span>${t('founder')}</span>`;
  const live = sim.agentById(id);
  const inBank = sim.bank.some(b => b.id === id);
  return `<button class="link" data-goto="${id}">#${id}</button> <span class="note">${live ? t('alive') : inBank ? t('frozen') : t('dead')}</span>`;
}
function renderInspector() {
  const box = $('#insp'), gc = $('#genome'), cap = $('#gcap');
  const a = selected || selectedRec;
  if (!a) { box.innerHTML = `<p class="insp-empty">${t('inspEmpty')}</p>`; gc.hidden = true; cap.hidden = true; return; }
  const live = !!selected;
  const cols = TCOL();
  const gen = a.gen, F = a.F;
  const age = live ? a.age : null;
  let html = `<div class="idline"><b class="mono">#${a.id}</b>${statusPills(a)}</div>`;
  html += `<dl class="kv">
    <dt>${t('generation')}</dt><dd>${gen}</dd>
    ${live ? `<dt>${t('age')}</dt><dd>${Math.round(age / SEASON * 365)} ${t('days')}</dd>` : ''}
    <dt>${t('sireL')}</dt><dd>${parentLink(a.sire)}</dd>
    <dt>${t('damL')}</dt><dd>${parentLink(a.dam)}</dd>
    <dt>${t('kids')}</dt><dd>${live ? a.kids : (sim.records.get(a.id) || a).kids}</dd>
    <dt>${t('F')}</dt><dd>${F.toFixed(3)}</dd>
  </dl>`;
  if (live) html += `<div class="note">${t('energy')}</div><div class="ebar"><i style="width:${Math.round(100 * Math.max(0, a.energy / a.maxE))}%"></i></div>`;
  const genomic = sim.p.criterion === 'genomic' && sim.p.mode !== 'natural';
  html += `<table class="traits"><thead><tr><th>${t('trait')}</th><th>${t('P')}</th><th>${t('BV')}</th>${genomic && live ? `<th>${t('EBV')}</th>` : ''}</tr></thead><tbody>`;
  for (let i = 0; i < NT; i++) {
    const ebv = genomic && live ? sim.ebvOf(a, i) : null;
    html += `<tr><td><span class="sw" style="background:${cols[i]}"></span>${tn(i)}</td><td>${fmtS(a.P[i])}</td><td>${fmtS(a.G[i])}</td>${ebv !== null ? `<td>${fmtS(ebv)}</td>` : ''}</tr>`;
  }
  html += `</tbody></table>`;
  box.innerHTML = html;
  if (live) { gc.hidden = false; cap.hidden = false; drawGenome(a); } else { gc.hidden = true; cap.hidden = true; }
}
function drawGenome(a) {
  const { ctx, w, h } = fit($('#genome'));
  ctx.clearRect(0, 0, w, h);
  const cols = TCOL();
  const rowH = h / NT, lab = 0, cw = (w - lab) / LOCI;
  if (a.a === undefined) return;
  const rtl = document.dir === 'rtl';
  for (let tr = 0; tr < NT; tr++) {
    for (let l = 0; l < LOCI; l++) {
      const li = tr * LOCI + l;
      const x = rtl ? w - (l + 1) * cw : lab + l * cw, y = tr * rowH;
      const sa = Genesis.H2_FOUNDER[tr];
      const sd = Math.sqrt(sa / (2 * LOCI));
      ctx.fillStyle = diverge(a.a[2 * li] / sd);
      ctx.fillRect(x + 1, y + 1, cw - 2, rowH / 2 - 1);
      ctx.fillStyle = diverge(a.a[2 * li + 1] / sd);
      ctx.fillRect(x + 1, y + rowH / 2, cw - 2, rowH / 2 - 1);
      if (a.tg[2 * li] === a.tg[2 * li + 1]) {
        ctx.strokeStyle = css('--saffron'); ctx.lineWidth = 2;
        ctx.strokeRect(x + 1.5, y + 1.5, cw - 3, rowH - 3);
      }
    }
    ctx.fillStyle = cols[tr];
    ctx.fillRect(rtl ? w - 3 : 0, tr * rowH + 2, 3, rowH - 4);
  }
}

/* ---------------- controls ---------------- */
function fillTraitSelects() {
  for (const id of ['#target', '#gTrait']) {
    const s = $(id), v = s.value;
    s.innerHTML = TRAITS.map((_, i) => `<option value="${i}">${tn(i)}</option>`).join('');
    s.value = v || (id === '#target' ? sim.p.target : gTrait);
  }
}
function buildLegends() {
  const cols = TCOL();
  $('#trendLeg').innerHTML = TRAITS.map((_, i) => `<button data-i="${i}" class="${trendOn[i] ? '' : 'off'}"><i style="background:${cols[i]}"></i>${tn(i)}</button>`).join('');
  $('#popLeg').innerHTML = `<span><i style="background:var(--sand)"></i> ${t('popN')}</span><span><i style="background:var(--female)"></i> ${t('popF')}</span><span><i style="background:var(--t4)"></i> ${t('popP')}</span>`;
  $('#inbLeg').innerHTML = `<span><i style="background:var(--heat)"></i> ${t('inbF')}</span><span><i style="background:${cols[sim.p.target]}"></i> ${t('inbH')}</span>`;
}
function syncControls() {
  const p = sim.p;
  $$('#modes .mode').forEach(b => b.classList.toggle('on', b.dataset.mode === p.mode));
  $('#selBox').hidden = p.mode === 'natural';
  $('#aiBox').hidden = p.mode !== 'ai';
  $('#accBox').hidden = p.criterion !== 'genomic';
  $('#target').value = p.target;
  $$('#dir button').forEach(b => b.classList.toggle('on', +b.dataset.v === p.dir));
  $$('#crit button').forEach(b => b.classList.toggle('on', b.dataset.v === p.criterion));
  $('#acc').value = p.accuracy; $('#accO').textContent = (+p.accuracy).toFixed(2);
  $('#sire').value = p.sireFrac; $('#sireO').textContent = Math.round(p.sireFrac * 100) + '%';
  $('#sireWarn').hidden = !(p.mode === 'selective' && p.sireFrac < 0.15);
  $('#dam').value = p.damFrac; $('#damO').textContent = Math.round(p.damFrac * 100) + '%';
  $('#heat').value = p.heatDet; $('#heatO').textContent = Math.round(p.heatDet * 100) + '%';
  $('#bank').value = p.bankSize; $('#bankO').textContent = p.bankSize;
  $('#tempR').value = p.temp; $('#tempO').textContent = p.temp + '°C';
  $('#foodR').value = p.food; $('#foodO').textContent = Math.round(p.food * 100) + '%';
  $('#mutR').value = p.mut; $('#mutO').textContent = (+p.mut).toFixed(3);
  $('#inb').checked = p.inbDep;
  $('#colorBy').value = colorBy;
  $('#seedLbl').textContent = 'seed ' + seed;
  updateLegend(); buildLegends(); updateBank();
}
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  $$('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (I18N[lang][k]) el.textContent = I18N[lang][k]; });
  $$('[data-i18n-html]').forEach(el => { el.innerHTML = I18N[lang][el.dataset.i18nHtml]; });
  $('#lang').textContent = lang === 'ar' ? 'English' : 'العربية';
  $('#play').textContent = running ? t('pause') : t('play');
  fillTraitSelects();
  $('#presets').innerHTML = PRESETS.map((p, i) => `<button class="preset" data-p="${i}"><b>${t(p.key)}</b><span>${t(p.key + '_d')}</span></button>`).join('');
  updateTicker.force = true; updateTicker();
  syncControls(); renderInspector();
  document.dispatchEvent(new Event('genesis:lang'));
}

const PRESETS = [
  { key: 'pr_nat', run() { newSim(); } },
  { key: 'pr_heat', run() { newSim({ temp: 40 }); } },
  { key: 'pr_ai', run() { sim.setParam('target', 0); sim.setParam('dir', 1); sim.setParam('criterion', 'genomic'); sim.setParam('accuracy', 0.8); sim.setParam('sireFrac', 0.05); sim.setParam('bankSize', 10); sim.setParam('heatDet', 0.75); sim.setParam('mode', 'ai'); gTrait = 0; colorBy = 'bv'; } },
  { key: 'pr_fert', run() { sim.setParam('target', 4); sim.setParam('dir', 1); sim.setParam('criterion', 'pheno'); sim.setParam('sireFrac', 0.05); sim.setParam('bankSize', 10); sim.setParam('mode', 'ai'); gTrait = 4; colorBy = 'bv'; } },
  { key: 'pr_bottle', run() { sim.setParam('inbDep', true); sim.doBottleneck(16); colorBy = 'F'; } },
];
function newSim(opts) {
  seed = (seed * 1103515245 + 12345) % 2147483647;
  sim = new Sim(seed, opts || {});
  selected = null; selectedRec = null; lastEventCount = -1;
  gTrait = 0; colorBy = 'sex';
}

function bind() {
  $('#play').onclick = () => { running = !running; $('#play').textContent = running ? t('pause') : t('play'); $('#play').classList.toggle('on', running); };
  $$('#speed button').forEach(b => b.onclick = () => { speed = +b.dataset.v; $$('#speed button').forEach(x => x.classList.toggle('on', x === b)); });
  $('#lang').onclick = () => { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('genesis.lang', lang); } catch (e) {} applyLang(); drawCharts(); };
  $('#introClose').onclick = () => { $('#intro').hidden = true; try { localStorage.setItem('genesis.intro', '0'); } catch (e) {} };
  try { if (localStorage.getItem('genesis.intro') === '0') $('#intro').hidden = true; } catch (e) {}
  $$('#modes .mode').forEach(b => b.onclick = () => {
    const m = b.dataset.mode;
    if (m === 'selective' && sim.p.sireFrac < 0.2) sim.setParam('sireFrac', 0.25);
    sim.setParam('mode', m); syncControls(); updateTicker();
  });
  $('#target').onchange = (e) => { sim.setParam('target', +e.target.value); gTrait = +e.target.value; $('#gTrait').value = gTrait; syncControls(); };
  $('#gTrait').onchange = (e) => { gTrait = +e.target.value; drawGalton(); };
  $$('#dir button').forEach(b => b.onclick = () => { sim.setParam('dir', +b.dataset.v); syncControls(); });
  $$('#crit button').forEach(b => b.onclick = () => { sim.setParam('criterion', b.dataset.v); syncControls(); renderInspector(); });
  const rng = (id, key, conv = (v) => +v) => { $(id).oninput = (e) => { sim.setParam(key, conv(e.target.value)); syncControls(); }; };
  rng('#acc', 'accuracy'); rng('#sire', 'sireFrac'); rng('#dam', 'damFrac'); rng('#heat', 'heatDet'); rng('#bank', 'bankSize', v => parseInt(v, 10));
  rng('#tempR', 'temp'); rng('#foodR', 'food'); rng('#mutR', 'mut');
  $('#inb').onchange = (e) => sim.setParam('inbDep', e.target.checked);
  $('#drought').onclick = () => { sim.doDrought(); updateTicker(); };
  $('#bottle').onclick = () => { sim.doBottleneck(16); if (selected && !selected.alive) selected = null; updateTicker(); };
  $('#colorBy').onchange = (e) => { colorBy = e.target.value; updateLegend(); };
  $('#reset').onclick = $('#restart').onclick = () => { newSim(); syncControls(); updateTicker(); renderInspector(); };
  $('#presets').onclick = (e) => {
    const b = e.target.closest('.preset'); if (!b) return;
    const p = PRESETS[+b.dataset.p];
    p.run(); sim.log('preset', { key: p.key });
    $('#gTrait').value = gTrait; syncControls(); updateTicker(); renderInspector();
    if (!running) $('#play').click();
  };
  $('#trendLeg').onclick = (e) => { const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i; trendOn[i] = !trendOn[i]; buildLegends(); drawCharts(); };
  world.addEventListener('click', (e) => {
    const r = world.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width * WORLD_W, y = (e.clientY - r.top) / r.height * WORLD_H;
    inspect(sim.find(x, y, 22));
  });
  $('#insp').addEventListener('click', (e) => {
    const b = e.target.closest('[data-goto]'); if (!b) return;
    const id = +b.dataset.goto;
    const live = sim.agentById(id);
    if (live) return inspect(live);
    const bank = sim.bank.find(s => s.id === id);
    const rec = sim.records.get(id);
    if (rec) inspect(Object.assign({}, rec, { P: rec.P, G: rec.G, gen: rec.gen, F: rec.F, ai: rec.ai, died: rec.died || (bank ? null : rec.died) }));
  });
  $('#canister').addEventListener('click', (e) => {
    const b = e.target.closest('.straw'); if (!b) return;
    const id = +b.dataset.id;
    const live = sim.agentById(id);
    if (live) return inspect(live);
    const rec = sim.records.get(id);
    if (rec) inspect(Object.assign({}, rec));
  });
  window.addEventListener('resize', () => drawCharts());
}

/* ---------------- loop ---------------- */
function loop() {
  if (document.body.dataset.world !== 'herd') { requestAnimationFrame(loop); return; }
  if (running && sim.agents.length) {
    const t0 = performance.now();
    for (let i = 0; i < speed; i++) {
      sim.step();
      if (performance.now() - t0 > 22) break;
    }
    if (selected && !selected.alive) { const rec = sim.records.get(selected.id); selected = null; selectedRec = rec ? Object.assign({}, rec) : null; renderInspector(); }
  }
  drawWorld();
  frame++;
  if (frame % 6 === 0) updateHud();
  if (frame % 15 === 0) { drawCharts(); updateTicker(); }
  if (frame % 10 === 0 && selected) renderInspector();
  if (frame % 30 === 0) updateBank();
  requestAnimationFrame(loop);
}

/* boot */
bind();
applyLang();
updateHud();
drawCharts();
window.__genesis = { get sim() { return sim; } };
requestAnimationFrame(loop);
})();
