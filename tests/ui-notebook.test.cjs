'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const E = require('../src/experiments.js');
const uiSource = fs.readFileSync(path.join(__dirname, '../src/experiments-ui.js'), 'utf8');
const markup = fs.readFileSync(path.join(__dirname, '../src/experiments.html'), 'utf8');
const KEY = 'genesis.experiments.v1';
const config = { seed: 777, repeats: 1, steps: 100, factor: 'predators' };
const pair = E.createPair(config);
const run = { seed: pair.seed };
for (const arm of ['a', 'b']) {
  const start = E.sample(pair[arm]), end = { ...start, step: 100 };
  run[arm] = { ...end, trajectory: [start, end] };
}
const record = () => ({ v: 1, id: 'saved-1', created: '2026-10-12T00:00:00.000Z', model: E.MODEL,
  protocolVersion: E.PROTOCOL_VERSION, config, notes: 'Original notes', runs: [run], complete: true });

// Exercise the production event handlers; only browser effects are replaced.
function browser(stored = null, quota = false) {
  const nodes = new Map(), blobs = new Map(), workers = [], downloads = [], created = [];
  let writes = 0;
  class Element {
    constructor(tag) { this.tagName = tag.toUpperCase(); this.children = []; this.dataset = {}; this.style = {}; this.value = ''; this.disabled = false; this._text = ''; created.push(this); }
    set textContent(value) { this._text = String(value); this.children = []; }
    get textContent() { return this._text + this.children.map(n => n.textContent).join(''); }
    set innerHTML(_) { throw new Error('Notebook content must not be rendered as HTML'); }
    append(...items) { items.forEach(n => { n.parent = this; this.children.push(n); }); }
    prepend(...items) { items.forEach(n => { n.parent = this; }); this.children.unshift(...items); }
    replaceChildren(...items) { this._text = ''; this.children = []; this.append(...items); }
    setAttribute(key, value) { this[key] = String(value); }
    reportValidity() { return true; }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(n => n !== this); }
    click() { if (this.disabled) return; if (this.tagName === 'A') downloads.push({ name: this.download, blob: blobs.get(this.href) }); else this.onclick?.(); }
  }
  for (const match of markup.matchAll(/<(\w+)[^>]*\bid="([^"]+)"[^>]*>/g)) {
    const el = new Element(match[1]); el.disabled = /\bdisabled\b/.test(match[0]); nodes.set(match[2], el);
  }
  for (const id of ['column-engine', 'experiment-engine', 'experiment-worker']) nodes.set(id, new Element('script'));
  for (const [key, id] of Object.entries({ factor: 'xFactor', seed: 'xSeed', repeats: 'xRepeats', steps: 'xSteps' })) nodes.get(id).value = config[key];
  class Worker {
    constructor() { this.terminated = false; workers.push(this); }
    postMessage(message) { this.config = message.config; }
    terminate() { this.terminated = true; }
    emit(data) { this.onmessage({ data: structuredClone(data) }); }
  }
  const document = { documentElement: { lang: 'en' }, body: new Element('body'), getElementById: id => nodes.get(id),
    createElement: tag => new Element(tag), createElementNS: (_, tag) => new Element(tag), querySelectorAll: () => [], addEventListener() {} };
  const localStorage = { getItem(key) { assert.equal(key, KEY); return stored; }, setItem(key, value) {
    assert.equal(key, KEY); writes++; if (quota) throw new Error('QuotaExceededError'); stored = value;
  } };
  let nextUrl = 0;
  vm.runInNewContext(uiSource, { GenesisExperiments: E, document, localStorage, Worker, Blob,
    URL: { createObjectURL(blob) { const url = 'blob:test/' + ++nextUrl; blobs.set(url, blob); return url; }, revokeObjectURL(url) { blobs.delete(url); } },
    window: { addEventListener() {}, confirm: () => true }, setTimeout: callback => callback() });
  return { node: id => nodes.get(id), created, workers, downloads, stored: () => stored, writes: () => writes,
    start(repeats = 1) { nodes.get('xRepeats').value = repeats; nodes.get('xForm').onsubmit({ preventDefault() {} }); return workers.at(-1); },
    complete() { const worker = this.start(); worker.emit({ type: 'done', runs: [run] }); return worker; },
    action(label) { const find = el => el.children.flatMap(child => [child, ...find(child)]); return find(nodes.get('xNotebook')).find(el => el.tagName === 'BUTTON' && el.textContent === label); } };
}

test('corrupt and semantically invalid notebooks are preserved and cannot be overwritten', () => {
  const invalid = record(); invalid.runs = [{ ...run, a: { ...run.a, cells: -1 } }];
  for (const stored of ['{"broken":', JSON.stringify([invalid])]) {
    const b = browser(stored);
    assert.match(b.node('xNotebookStatus').textContent, /Could not read the notebook/);
    b.complete();
    assert.equal(b.node('xSave').disabled, true);
    b.node('xSave').onclick();
    assert.equal(b.writes(), 0);
    assert.equal(b.stored(), stored);
    assert.equal(b.node('xJSON').disabled, false);
  }
});

test('quota failure preserves existing notebook records and leaves downloading available', () => {
  const stored = JSON.stringify([record()]), b = browser(stored, true);
  b.complete(); b.node('xNotes').value = 'New result'; b.node('xSave').click();
  assert.equal(b.writes(), 1);
  assert.equal(b.stored(), stored);
  assert.match(b.node('xNotebookStatus').textContent, /Previous data was not replaced/);
  assert.equal(b.node('xJSON').disabled, false);
  b.action('View').click();
  assert.equal(b.node('xNotes').value, 'Original notes');
});

test('completed runs save and reopen notes as text without interpreting markup', () => {
  const b = browser(), notes = '<img src=x onerror="throw 1"> توقع عربي & notes';
  const worker = b.complete();
  assert.equal(worker.terminated, true);
  assert.equal(b.node('xSave').disabled, false);
  b.node('xNotes').value = notes; b.node('xSave').click();
  const stored = JSON.parse(b.stored());
  assert.equal(stored.length, 1);
  assert.equal(stored[0].notes, notes);
  assert.equal(stored[0].complete, true);
  b.node('xNotes').value = ''; b.action('View').click();
  assert.equal(b.node('xNotes').value, notes);
  stored[0].model = '<img src=x onerror="throw 1">';
  const reopened = browser(JSON.stringify(stored));
  assert.ok(reopened.node('xNotebook').textContent.includes(stored[0].model));
  assert.equal(reopened.created.some(n => n.tagName === 'IMG'), false);
  reopened.action('View').click();
  assert.equal(reopened.node('xNotes').value, notes);
  assert.match(reopened.node('xInterpretation').textContent, /older version/);
});

test('cancellation exports completed pairs as partial while complete-notebook save stays disabled', async () => {
  const b = browser(), worker = b.start(2);
  worker.emit({ type: 'replicate', run });
  b.node('xCancel').click();
  assert.equal(worker.terminated, true);
  assert.equal(b.node('xSave').disabled, true);
  assert.equal(b.node('xCSV').disabled, false);
  assert.equal(b.node('xJSON').disabled, false);
  b.node('xJSON').click(); b.node('xCSV').click();
  assert.equal(b.downloads.length, 2);
  const partial = JSON.parse(await b.downloads[0].blob.text());
  assert.equal(partial.complete, false);
  assert.equal(partial.config.repeats, 2);
  assert.equal(partial.runs.length, 1);
  const csv = await b.downloads[1].blob.text();
  assert.match(csv, /"completedRepeats"/);
  assert.match(csv, /"requestedRepeats"/);
  assert.equal(b.writes(), 0);
});
