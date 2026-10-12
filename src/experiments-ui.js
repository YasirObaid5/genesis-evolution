(function () {
'use strict';
const E = GenesisExperiments, $ = id => document.getElementById(id);
const KEY = 'genesis.experiments.v1';
const L = {
  ar: {
    title: 'ماذا لو أعدنا شريط الحياة؟', subtitle: 'تجربتان · بداية واحدة · عامل مختلف', settings: 'إعدادات المقارنة',
    intro: 'ابدأ بنسختين من المجتمع نفسه، ثم غيّر شرطًا واحدًا. كرّر المقارنة ببدايات مختلفة لترى ما يتكرر وما يتغير. هذه التجارب مستقلة عن العمود الحي أسفل الصفحة.',
    factor: 'العامل الذي نغيّره', seed: 'بذرة البداية', repeats: 'عدد التكرارات', steps: 'خطوات كل تجربة',
    predators: 'وجود المفترسات', flow: 'حركة الماء', source: 'مصدر الغذاء', light: 'شدة الضوء',
    conditions: { predators: ['مع مفترسات', 'بلا مفترسات'], flow: ['ماء متحرك', 'بلا اقتران مائي'], source: ['غذاء في الماء', 'غذاء من الرواسب'], light: ['ضوء كامل', 'نصف شدة الضوء'] },
    protocol: 'إعدادات البركة الافتراضية ثابتة؛ يتغير العامل المختار فقط. تبدأ البذور من الرقم المحدد وتزيد واحدًا لكل تكرار. الخطوة = نصف ثانية فيزيائية، والبيولوجيا أسرع ×400. تتباعد الأحداث العشوائية بعد التدخل؛ المطابقة تخص البداية فقط. التجارب الأطول قد تستغرق دقائق.',
    run: 'ابدأ المقارنة', cancel: 'إلغاء التشغيل', ready: 'اختر سؤالًا وابدأ التجربة.', running: 'جارٍ التشغيل', repeat: 'التكرار', step: 'الخطوة',
    completed: 'اكتملت المقارنة. يمكنك حفظها أو تنزيل بياناتها.', cancelled: 'أُلغي التشغيل. يمكنك تنزيل التكرارات المكتملة كبيانات جزئية.', failed: 'تعذّر إكمال التجربة. يمكنك تنزيل التكرارات المكتملة؛ جرّب مدة أقصر أو متصفحًا حديثًا.', invalid: 'تحقق من البذرة وعدد التكرارات والخطوات.',
    results: 'نتائج المقارنة', paired: 'متوسط الفرق: B − A', pp: 'نقطة مئوية', cells: 'خلية', groups: 'الخلايا داخل كائنات', population: 'عدد الخلايا النهائي', extinctions: 'تجارب انتهت بالانقراض', range: 'مدى الفروق المرصودة',
    trajectory: 'نسبة الخلايا داخل كائنات · آخر تكرار مكتمل', chartNote: 'المحور الأفقي: خطوات المحاكاة. المحور الرأسي: نسبة الخلايا داخل كائنات متعددة الخلايا. الصفر عند الانقراض يعني غياب الخلايا، ولا يعني عودتها إلى حياة منفردة.',
    individual: 'افتح نتائج كل تكرار', endpoint: 'القياسات عند نهاية التجربة', arm: 'الحالة', adhesion: 'الالتصاق', size: 'الحجم المرجّح بالخلايا', extinct: 'منقرض', alive: 'باقٍ', state: 'الحالة',
    caution: 'هذه فروق داخل النموذج وليست إثباتًا عن الطبيعة. يشمل الملخص التجارب المنقرضة. زد التكرارات والمدة لفحص استقرار النتيجة؛ المدى المعروض ليس فاصل ثقة.',
    single: 'تكرار واحد لا يكفي لتقدير تباين النتائج.', partial: 'نتائج جزئية للتكرارات المكتملة فقط.',
    notes: 'توقّعك وملاحظاتك', save: 'احفظ في دفتر التجارب', csv: 'تنزيل CSV', json: 'تنزيل التجربة كاملة', notebook: 'دفتر التجارب',
    local: 'يُحفظ الدفتر في هذا المتصفح فقط، حتى 12 تجربة. نزّل نسخة للاحتفاظ بها خارج المتصفح؛ مسح بياناته يزيل الدفتر.',
    empty: 'لا توجد تجارب محفوظة بعد.', saved: 'حُفظت التجربة في هذا المتصفح.', storageError: 'تعذّر حفظ الدفتر. لم نستبدل البيانات السابقة؛ يمكنك تنزيل التجربة.', corrupt: 'تعذّرت قراءة الدفتر. البيانات السابقة محفوظة دون تغيير؛ استخدم التنزيل لحفظ النتائج الجديدة.', full: 'الدفتر ممتلئ. نزّل تجربة ثم احذفها لإتاحة مكان.',
    open: 'عرض', rerun: 'إعادة التجربة', remove: 'حذف', confirmDelete: 'حذف هذه التجربة من دفتر هذا المتصفح؟ نزّلها أولًا إذا أردت الاحتفاظ بها.', removed: 'حُذفت التجربة من الدفتر.', old: 'هذه تجربة من إصدار سابق؛ إعادة تشغيلها تستخدم النموذج الحالي.', model: 'إصدار النموذج', protocolVersion: 'بروتوكول المقارنة', progress: 'تقدم التجربة'
  },
  en: {
    title: 'What if we replayed life?', subtitle: 'Two worlds · one beginning · one changed condition', settings: 'Comparison settings',
    intro: 'Start with two copies of the same population, then change one condition. Repeat with different starting seeds to see what persists. These experiments are independent of the live column below.',
    factor: 'Condition to change', seed: 'Starting seed', repeats: 'Replicates', steps: 'Steps per experiment',
    predators: 'Predator presence', flow: 'Water movement', source: 'Nutrient source', light: 'Light intensity',
    conditions: { predators: ['With predators', 'Without predators'], flow: ['Flow enabled', 'Hydrodynamics disabled'], source: ['Nutrients in water', 'Nutrients from sediment'], light: ['Full light', 'Half light'] },
    protocol: 'Default pond settings are fixed; only the selected condition changes. Seeds increase by one per replicate. Each step is 0.5 physical seconds; biology runs ×400 faster. Random events diverge after treatment; only initialization is matched. Longer experiments may take minutes.',
    run: 'Start comparison', cancel: 'Cancel run', ready: 'Choose a question and start an experiment.', running: 'Running', repeat: 'Replicate', step: 'Step',
    completed: 'Comparison complete. Save it or download the data.', cancelled: 'Run cancelled. Completed replicates can be downloaded as partial data.', failed: 'Could not finish the experiment. Completed replicates can be downloaded; try a shorter run or a modern browser.', invalid: 'Check the seed, replicate count and step count.',
    results: 'Comparison results', paired: 'Mean difference: B − A', pp: 'percentage points', cells: 'cells', groups: 'Cells in multicellular organisms', population: 'Final cell population', extinctions: 'Runs ending in extinction', range: 'Observed difference range',
    trajectory: 'Cells in organisms · last completed replicate', chartNote: 'Horizontal: simulation steps. Vertical: share of cells in multicellular organisms. Zero at extinction means no cells remain, not a return to single-cell life.',
    individual: 'Show every replicate', endpoint: 'Measurements at the end of each experiment', arm: 'Arm', adhesion: 'Adhesion', size: 'Cell-weighted organism size', extinct: 'Extinct', alive: 'Surviving', state: 'State',
    caution: 'These are differences inside the model, not proof about nature. Extinct runs are included. Increase replicates and duration to examine stability; the observed range is not a confidence interval.',
    single: 'One replicate cannot estimate variation between runs.', partial: 'Partial results from completed replicates only.',
    notes: 'Your prediction and notes', save: 'Save to notebook', csv: 'Download CSV', json: 'Download full experiment', notebook: 'Experiment notebook',
    local: 'Saved in this browser only, up to 12 experiments. Download a copy to keep it outside the browser; clearing browser data removes this notebook.',
    empty: 'No saved experiments yet.', saved: 'Saved in this browser.', storageError: 'Could not save the notebook. Previous data was not replaced; you can download the experiment.', corrupt: 'Could not read the notebook. Previous data is unchanged; download new results to keep them.', full: 'Notebook full. Download and remove an experiment to make room.',
    open: 'View', rerun: 'Run again', remove: 'Remove', confirmDelete: 'Remove this experiment from this browser? Download it first if you want to keep it.', removed: 'Experiment removed from notebook.', old: 'This experiment used an older version; running it again uses the current model.', model: 'Model version', protocolVersion: 'Comparison protocol', progress: 'Experiment progress'
  }
};
const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ar';
const t = k => L[lang()][k];
const make = (tag, text, cls) => { const n = document.createElement(tag); if (text !== undefined) n.textContent = text; if (cls) n.className = cls; return n; };
const num = (x, digits = 1) => Number.isFinite(x) ? x.toFixed(digits) : '—';
let worker = null, current = null, notebook = [], notebookOK = true, status = 'ready', progress = null;
function configFromForm() { return E.validateConfig({ factor: $('xFactor').value, seed: +$('xSeed').value, repeats: +$('xRepeats').value, steps: +$('xSteps').value }); }
function describe(c) { return `${t(c.factor)} · ${t('seed')} ${c.seed} · ${c.repeats} × ${c.steps}`; }
function validateRecord(r) {
  if (!r || r.v !== 1 || typeof r.id !== 'string' || r.id.length > 80 || typeof r.created !== 'string' || !Number.isFinite(Date.parse(r.created)) || typeof r.model !== 'string' || r.model.length > 80 || !Number.isInteger(r.protocolVersion) || r.protocolVersion < 1 || typeof r.notes !== 'string' || r.notes.length > 1000 || !Array.isArray(r.runs)) throw new Error('record');
  const c = E.validateConfig(r.config);
  if (r.runs.length !== c.repeats) throw new Error('incomplete');
  for (const run of r.runs) for (const arm of ['a', 'b']) {
    const s = run[arm];
    if (!s || !Number.isInteger(run.seed) || !Array.isArray(s.trajectory) || s.trajectory.length > 200) throw new Error('run');
    for (const p of [s, ...s.trajectory]) if (!['step','cells','inGroups','adhesion','meanSize','gape','generations'].every(k => Number.isFinite(p[k]))) throw new Error('sample');
  }
  E.summarize(r.runs);
  return r;
}
try { const stored = localStorage.getItem(KEY); if (stored) { const parsed = JSON.parse(stored); if (!Array.isArray(parsed) || parsed.length > 12) throw new Error('notebook'); notebook = parsed.map(validateRecord); } }
catch (_) { notebookOK = false; }
function setStatus(key) { status = key; renderStatus(); }
function renderStatus() {
  $('xStatus').textContent = status === 'running' && progress ? `${t('running')} · ${t('repeat')} ${progress.repeat}/${progress.repeats} · ${t('step')} ${progress.step}/${progress.total}` : t(status);
}
function setBusy(busy) {
  $('xSettings').disabled = busy; $('xRun').disabled = busy; $('xCancel').disabled = !busy;
  document.body.dataset.experimentRunning = busy ? 'true' : 'false';
  $('xSave').disabled = busy || !current || !current.complete || !notebookOK;
  for (const id of ['xCSV','xJSON']) $(id).disabled = busy || !current || !current.runs.length;
  renderNotebook();
}
function finish(key) { if (worker) worker.terminate(); worker = null; if (current) current.status = key; setBusy(false); setStatus(key); }
function start(event) {
  if (event) event.preventDefault();
  if (worker || !$('xForm').reportValidity()) return;
  let config;
  try { config = configFromForm(); } catch (_) { setStatus('invalid'); return; }
  current = { v: 1, id: Date.now().toString(36), created: new Date().toISOString(), model: E.MODEL, protocolVersion: E.PROTOCOL_VERSION, config, notes: '', runs: [], complete: false };
  $('xNotes').value = ''; $('xResults').hidden = false; $('xProgress').value = 0; progress = null;
  renderResults(); setBusy(true); setStatus('running');
  let url;
  try {
    const source = ['column-engine', 'experiment-engine', 'experiment-worker'].map(id => $(id).textContent).join('\n;\n');
    url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    worker = new Worker(url); renderNotebook();
    worker.onmessage = ({ data }) => {
      if (data.type === 'progress') { progress = data; $('xProgress').value = ((data.repeat - 1) + data.step / data.total) / data.repeats; renderStatus(); }
      if (data.type === 'replicate') { current.runs.push(data.run); renderResults(); }
      if (data.type === 'done') { current.runs = data.runs; current.complete = true; $('xProgress').value = 1; renderResults(); finish('completed'); }
      if (data.type === 'error') finish('failed');
    };
    worker.onerror = () => finish('failed');
    worker.postMessage({ config });
  } catch (_) { finish('failed'); }
  finally { if (url) URL.revokeObjectURL(url); }
}
function metric(label, value, detail, unit) {
  const box = make('article'), number = make('b'), isolated = make('bdi', value); isolated.dir = 'ltr'; number.append(isolated);
  if (unit) number.append(make('span', ' ' + unit));
  box.append(make('span', label), number, make('small', detail)); $('xMetrics').append(box);
}
function renderResults() {
  if (!current) return;
  const c = current.config, labels = t('conditions')[c.factor], summary = E.summarize(current.runs), d = summary.difference;
  $('xResultConfig').textContent = `${describe(c)} · ${t('model')} ${current.model} · ${t('protocolVersion')} ${current.protocolVersion}`;
  $('xMetrics').replaceChildren();
  metric(t('groups'), d.inGroups.mean === null ? '—' : num(d.inGroups.mean * 100), `${t('paired')} · ${t('range')}: ${d.inGroups.min === null ? '—' : num(d.inGroups.min * 100) + ' … ' + num(d.inGroups.max * 100)}`, t('pp'));
  metric(t('population'), num(d.cells.mean, 0), `${t('paired')} · A: ${num(summary.a.means.cells, 0)} · B: ${num(summary.b.means.cells, 0)}`);
  metric(t('extinctions'), `A ${summary.a.extinctions}/${summary.n} · B ${summary.b.extinctions}/${summary.n}`, `A: ${labels[0]} · B: ${labels[1]}`);
  $('xLegend').replaceChildren();
  labels.forEach((label, i) => { const span = make('span', `${i ? 'B' : 'A'} · ${label}`); const dot = make('i'); dot.style.background = i ? '#e3a33b' : '#7ad8ff'; span.prepend(dot); $('xLegend').append(span); });
  drawChart(current.runs[current.runs.length - 1]);
  $('xTableHead').replaceChildren(); const head = make('tr');
  ['seed','arm','population','groups','adhesion','size','state'].forEach(k => { const cell = make('th',t(k)); cell.scope = 'col'; head.append(cell); }); $('xTableHead').append(head);
  $('xTableCaption').textContent = t('endpoint'); $('xTableBody').replaceChildren();
  current.runs.forEach(run => ['a','b'].forEach((arm, i) => {
    const s = run[arm], row = make('tr');
    [run.seed, `${arm.toUpperCase()} · ${labels[i]}`, s.cells, num(s.inGroups * 100) + '%', num(s.adhesion,3), num(s.meanSize,2), t(s.extinct ? 'extinct' : 'alive')].forEach(value => row.append(make('td', value)));
    $('xTableBody').append(row);
  }));
  $('xInterpretation').textContent = [current.complete ? '' : t('partial'), t('caution'), summary.n < 2 ? t('single') : '', current.model !== E.MODEL || current.protocolVersion !== E.PROTOCOL_VERSION ? t('old') : ''].filter(Boolean).join(' ');
}
function drawChart(run) {
  const svg = $('xChart'), NS = 'http://www.w3.org/2000/svg'; svg.replaceChildren();
  const add = (tag, attrs, text) => { const el = document.createElementNS(NS,tag); for (const [k,v] of Object.entries(attrs)) el.setAttribute(k,v); if (text !== undefined) el.textContent = text; svg.append(el); return el; };
  add('title',{id:'xChartTitle'},t('trajectory'));
  const W = 670, H = 170, left = 55, top = 20;
  [0,.5,1].forEach(v => { const y=top+(1-v)*H; add('line',{x1:left,y1:y,x2:left+W,y2:y,stroke:'#26363c'}); add('text',{x:left-8,y:y+4,fill:'#a99f8a','font-size':12,'text-anchor':'end'},(v*100)+'%'); });
  [0,.5,1].forEach(v => add('text',{x:left+v*W,y:216,fill:'#a99f8a','font-size':12,'text-anchor':'middle'},Math.round(v*current.config.steps)));
  if (run) ['a','b'].forEach((arm,i) => add('polyline',{points:run[arm].trajectory.map(p => `${left+p.step/current.config.steps*W},${top+(1-p.inGroups)*H}`).join(' '),fill:'none',stroke:i?'#e3a33b':'#7ad8ff','stroke-width':2.5,'stroke-dasharray':i?'7 4':'none'}));
}
function persist(next, message) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); notebook = next; $('xNotebookStatus').textContent = t(message); renderNotebook(); return true; }
  catch (_) { $('xNotebookStatus').textContent = t('storageError'); return false; }
}
function save() {
  if (!current || !current.complete || !notebookOK) return;
  current.notes = $('xNotes').value;
  const next = notebook.filter(r => r.id !== current.id);
  if (next.length >= 12) { $('xNotebookStatus').textContent = t('full'); return; }
  try { validateRecord(current); } catch (_) { $('xNotebookStatus').textContent = t('storageError'); return; }
  persist([JSON.parse(JSON.stringify(current)), ...next], 'saved');
}
function download(kind) {
  if (!current || !current.runs.length || worker) return;
  current.notes = $('xNotes').value;
  const content = kind === 'csv' ? '\ufeff' + E.toCSV(current) : JSON.stringify(current, null, 2);
  const url = URL.createObjectURL(new Blob([content], {type:kind === 'csv' ? 'text/csv;charset=utf-8' : 'application/json'}));
  const a = make('a'); a.href = url; a.download = `genesis-${current.config.factor}-${current.config.seed}.${kind}`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url),1000);
}
function renderNotebook() {
  const list = $('xNotebook'); list.replaceChildren();
  if (!notebookOK) { $('xNotebookStatus').textContent = t('corrupt'); return; }
  if (!notebook.length) { list.append(make('p',t('empty'),'note')); return; }
  notebook.forEach(record => {
    const item = make('article'), info = make('div'), actions = make('div',undefined,'x-actions');
    info.append(make('p',describe(record.config)),make('small',new Date(record.created).toLocaleString(lang()) + ' · ' + record.model));
    for (const action of ['open','rerun','remove']) {
      const button = make('button',t(action),'btn'); button.type='button'; button.disabled=!!worker;
      button.onclick = () => {
        if (worker) return;
        if (action === 'remove') { if (window.confirm(t('confirmDelete'))) persist(notebook.filter(r=>r.id!==record.id),'removed'); return; }
        for (const [key,id] of Object.entries({factor:'xFactor',seed:'xSeed',repeats:'xRepeats',steps:'xSteps'})) $(id).value=record.config[key];
        renderConditions();
        if (action === 'rerun') { start(); return; }
        current=JSON.parse(JSON.stringify(record)); current.complete=true; $('xNotes').value=current.notes; $('xResults').hidden=false; $('xProgress').value=1; renderResults(); setBusy(false); setStatus('completed');
      };
      actions.append(button);
    }
    item.append(info,actions); list.append(item);
  });
}
function renderConditions() { const labels = t('conditions')[$('xFactor').value]; $('xConditions').textContent=`A · ${labels[0]}     /     B · ${labels[1]}`; }
function applyLang() {
  document.querySelectorAll('[data-x18n]').forEach(el=>el.textContent=t(el.dataset.x18n));
  $('xProgress').setAttribute('aria-label',t('progress')); renderConditions(); renderStatus(); renderNotebook(); if (current) renderResults();
}
$('xForm').onsubmit=start; $('xCancel').onclick=()=>finish('cancelled'); $('xFactor').onchange=renderConditions;
$('xSave').onclick=save; $('xCSV').onclick=()=>download('csv'); $('xJSON').onclick=()=>download('json');
document.addEventListener('genesis:lang',applyLang); window.addEventListener('pagehide',()=>{if(worker)finish('cancelled');});
applyLang();
})();
