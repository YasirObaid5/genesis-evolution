# GENESIS: Handoff Document

**Purpose.** This file gives a new engineer or AI assistant (including Claude and Codex) everything needed to understand, run, verify and extend the Genesis project without access to the conversation that produced it.

**Written:** 2026-10-12, by Claude (Anthropic), for the project owner (GitHub user `YasirObaid5`).

**Updated:** 2026-10-12, by Codex, after implementing and checking the model-2 first batch. Read the dated handoff below before following the historical results or roadmap.

**Original status at writing (historical, model 1):**
- The site is live.
- The perpetual world is running on GitHub Actions.
- The laws observatory has initial evidence.

**Published revision, 2026-10-12 — model 2.** This bounded first batch implements the four P0 engine corrections (symmetric gape macro-mutations, a prey-size capture window, zero/one predators at low N, mean-reverting climate), paired water-column experiments and a local notebook, and versioned observatory evidence that includes extinct predation runs. The prior scientific results are historical. This revision is now published and checked as recorded below; no long scientific replication of model 2 is claimed. Engineering checks use `npm test`; rebuild with `python build.py` (UTF-8). Snapshot continuation remains approximate. GRNs, lineage revival/museum and multitrait herd selection are not implemented in this batch.

---

## Latest handoff for Claude — 2026-10-12

**ما أنجزه Codex:** نُفذت الدفعة الأولى داخل المشروع الأصلي: تصحيح النموذج والمرصد، وإضافة مقارنة «ماذا لو؟» من البذرة نفسها، والتكرارات والرسوم، ودفتر محلي وتصدير CSV/JSON. لا تكرر هذه الأعمال على أنها مقترحات غير منفذة. النتائج العلمية القديمة تخص النموذج 1؛ اجتياز الاختبارات وتشغيل المقارنة لا يثبتان نتائج علمية للنموذج 2.

**Release status: published and verified on 2026-10-12.** The code, runners, tests and documentation were pushed to the existing public repository `YasirObaid5/genesis-evolution`, branch `main`, and the existing Vercel Git integration deployed the site.

- Production URL: https://genesis-evolution.vercel.app/#column
- Implementation commit: `d98a032e6be88cc4a501f1aef2b7080232a57d73`.
- Verified implementation deployment: `dpl_7kB4WbQuH51GpDLuA6Qor5RXHt61`, state `READY`, production alias assigned to `genesis-evolution.vercel.app`. A documentation-only follow-up records this verification; it does not change the built app.
- Public `GET /`: HTTP 200; 350310 bytes; SHA-256 `68b2616ccb6932f79c2d3b05329d2294cb1eac7d3545d264778a567629b3b241`, equal to the local built `index.html` after normalizing Windows CRLF to Git LF.
- All 33 tests passed again before publication; `python build.py` succeeded. On the public site, a seed-777, one-replicate, 1000-step paired comparison completed; its Arabic note and result survived save/reload/reopen. Arabic RTL and English LTR were checked at a 390 × 844 viewport (document/scroll width 375, no horizontal overflow); no browser console errors were observed. This is a release smoke test, not scientific evidence.

Existing workflow files were preserved and **no manual world/laws run or data-branch reset was performed**. Publishing includes updated runner source, but it does not regenerate `perpetual-data` immediately: the scheduled runner must execute before new model-2 data appears. No successful model-2 scheduled execution is claimed in this release record; the next maintainer should check Actions before asserting that the external world has migrated. Localhost and production notebooks have separate browser storage.

The release checkout is `C:\Users\alshi\.codex\releases\genesis-20261012-model2`; the desktop folder remains the editable project source without `.git`. Remote reference/DOI improvements from main commit `6c8b228de965e09277b509fcd8214043c544df1e` were retained in section 20.

### Implemented files and behavior

| Area | Files | Completed behavior |
|---|---|---|
| Evolution engines | `src/column.js`, `src/origins.js` | Export `MODEL_VERSION = '2'`; symmetric positive/negative log-gape macro-mutations. Column additionally has the bounded prey-size capture window, failed-attack handling cost, protection against counting the same prey twice, zero/one predators at low population, and climate mean reversion with reflecting bounds. |
| Comparison engine | `src/experiments.js` | Validated one-factor A/B comparisons with the same initial algae and RNG state; fixed default baseline; sequential replicate seeds; current-state sampling; extinction-inclusive paired summaries; endpoint CSV export. |
| Comparison UI and worker | `src/experiments.html`, `src/experiments.css`, `src/experiments-ui.js`, `src/experiments-worker.js` | Arabic/English controls, worker progress/cancel, B−A metrics, trajectory chart and per-replicate table, notes, local notebook, view/rerun/delete, CSV/JSON downloads. Completed pairs remain exportable after cancellation as partial results. |
| Integration and build | `src/column.html`, `src/column-ui.js`, `src/template.html`, `build.py`, `index.html` | New panel in the water column; live-column stepping pauses while the comparison runs; resumed older worlds show a model notice and the correct seed. Build inlines the engines/worker/UI and reads/writes UTF-8 explicitly. `index.html` is generated, not edited separately. |
| Laws and observatory | `runner/laws.mjs`, `src/obs.html`, `src/obs-ui.js` | Extinct runs remain in denominators; Red Queen evidence requires an observed gape crossing before collapse; chimera claim is limited to relatedness; herd choices use independent draws. New evidence is versioned; old/mismatched evidence remains historical and is excluded from current verdicts. The UI labels historical/mixed-model data. |
| Perpetual continuity | `runner/perpetual.mjs` | Old worlds retain their counters, eras and historical rows when resumed. `modelChanges` records a version boundary; new rows are stamped with the current version. Malformed/inconsistent checkpoints fail before overwriting existing files. |
| Verification and documentation | `tests/*.test.cjs`, `package.json`, `README.md`, `HANDOFF.md` | Built-in Node test command, no added runtime dependencies, updated usage/model limits, and this continuation record. |

Three different identifiers must not be conflated:

- Column/Origins model: string `'2'`; Column snapshot schema remains numeric `v: 1`, with additive `modelVersion: '2'`.
- Browser comparisons: `model: 'water-column/2'`, numeric `protocolVersion: 1`.
- Laws evidence: string `modelVersion: '2'`, string `protocolVersion: '2'`.

### Verification completed during implementation

`npm test` passed **33 tests** across six files: engines (9), comparisons (6), worker (3), notebook UI (4), laws (7), and perpetual continuity (4). Coverage includes same-seed repeatability, legacy snapshots, treatment isolation, extinction semantics, cancellation export, corrupt/quota-limited notebook preservation, safe notes rendering, incompatible evidence exclusion and malformed checkpoint preservation. `node --check` passed for the JavaScript/modules, and `python build.py` produced the inline app without remaining build placeholders.

Actual local browser checks at `http://127.0.0.1:8769/#column` included:

- A completed three-seed comparison (777, 778, 779), 1000 steps per arm; saved/reopened after reload, with CSV and JSON downloads parsed. This was a short functionality check, not a scientific experiment establishing a finding.
- Cancellation after a completed pair: partial downloads stayed available and complete-notebook saving stayed disabled.
- Arabic RTL and English LTR, including a 390 × 844 viewport with no horizontal overflow in the inspected page; no observed console errors.
- Historical remote laws/world data displayed with the model notices instead of current-model evidence claims.

These implementation checks were supplemented by the separate production verification recorded above. Future releases should again confirm the public built asset and browser behavior; a build or deployment submission alone is insufficient.

### Continuation limits and next work

1. Keep historical model-1 data intact. Resume is approximate, not bit-exact, and mixed-version all-time records are not homogeneous model-2 evidence. Runner writes are atomic **per file**, not a transaction across all checkpoint files; inconsistent checkpoints are rejected rather than silently reset.
2. The comparison uses fixed baseline settings, not the live sliders. A and B share their initial RNG state; treatment-dependent events can make their subsequent random streams diverge. Mean organism size is cell-weighted; sampled trajectories can miss brief transitions; the displayed replicate range is not a confidence interval.
3. Notebook storage is browser-local (`genesis.experiments.v1`, at most 12 completed records). It is neither a server database nor synchronized across devices/origins; a localhost notebook does not transfer automatically to the public site. CSV/JSON downloads are the external copy. Corrupt/full storage must not be silently cleared.
4. The capture window is an uncalibrated educational assumption. Long controlled model-2 replications and parameter sensitivity remain pending. Keep observational sequence separate from causal evidence.
5. CI automation, lineage revival/museum, gene regulatory networks and multitrait herd selection remain future work. Do not treat them as completed or start them implicitly while maintaining this release.
6. Before modifying the external world, inspect the actual repository/workflows and current `perpetual-data`; the original local folder contained neither `.git`, `.github/` nor `data/`. The pre-change local backup is `C:\Users\alshi\.codex\backups\nto\20261012-081423\nto`. Do not create a new perpetual world or relabel old data merely to finish a website release.

---

## ملخص بالعربية

**جينيسيس** مختبر تطوّر حيّ يعمل في المتصفح، فيه ثلاثة عوالم ومرصد:

1. **عمود الماء:** شريحة من بركة (4 × 2 مم) فيها طحالب سبّاحة.
   - في كل خطوة تُحل معادلات ستوكس لجريان الماء، ويُحسب الضوء والغذاء وميكانيكا الروابط بين الخلايا.
   - الحمل الحيوي ينشأ من الفيزياء وحدها.
   - تعدد الخلايا ينشأ تحت ضغط مفترسات محدودة الفم، ولا شيء من ذلك مكتوب كسيناريو.
2. **الأصول:** نموذج مبسّط وسريع للانتقال إلى تعدد الخلايا، مع معادلة برايس لفصل الانتخاب بين الكائنات عن الانتخاب داخلها.
3. **القطيع:** وراثة كمية حقيقية بجينوم ثنائي الصيغة من 48 موقعًا، مع تربية انتخابية وتلقيح اصطناعي وتقييم جينومي.
4. **المرصد:**
   - **العالم الأبدي:** نسخة من عمود الماء لا تُعاد من الصفر. يستأنفها GitHub Actions كل 3 ساعات، ويحفظ حالتها في الفرع `perpetual-data`.
   - **مرصد القوانين:** يكرر تجارب ببذور جديدة يوميًا، ويقارن نتائجها بقوانين نظرية معروفة.

**ترتيب القراءة لمن سيكمل العمل:**
- القسم 3: البنية.
- القسم 6: فيزياء عمود الماء.
- القسم 10: صيغ البيانات.
- القسم 14: القيود المعروفة. هذا القسم مهم جدًا.
- القسم 16: خارطة الطريق.

---

## Table of contents

1. [What Genesis is](#1-what-genesis-is)
2. [Live resources and accounts](#2-live-resources-and-accounts)
3. [Architecture](#3-architecture)
4. [Repository map](#4-repository-map)
5. [How to run, build, test](#5-how-to-run-build-test)
6. [World 1: Water column (physics-first)](#6-world-1-water-column-physics-first)
7. [World 2: Origins (simplified multicellularity)](#7-world-2-origins-simplified-multicellularity)
8. [World 3: Herd (quantitative genetics and breeding)](#8-world-3-herd-quantitative-genetics-and-breeding)
9. [The perpetual world](#9-the-perpetual-world)
10. [Data formats](#10-data-formats)
11. [The laws observatory](#11-the-laws-observatory)
12. [Front end](#12-front-end)
13. [Deployment and operations](#13-deployment-and-operations)
14. [Known limitations and open problems (read this)](#14-known-limitations-and-open-problems-read-this)
15. [Decision log and bugs already fixed](#15-decision-log-and-bugs-already-fixed)
16. [Roadmap](#16-roadmap)
17. [How researchers can use Genesis](#17-how-researchers-can-use-genesis)
18. [Rules for whoever continues](#18-rules-for-whoever-continues)
19. [Briefing prompt for the next assistant](#19-briefing-prompt-for-the-next-assistant)
20. [References](#20-references)

---

## 1. What Genesis is

Genesis is an agent-based evolution laboratory. All engines are plain JavaScript with no dependencies. They run in the browser, where they are inlined into a single `index.html`, and in Node for headless experiments and the perpetual run.

| World | Engine | Question it explores | Physical realism |
|---|---|---|---|
| Water column | `src/column.js` | How hydrodynamics, light, nutrients and gape-limited predation shape the evolution of multicellularity in swimming algae | High for the flow physics (Stokes flow, gyrotaxis, drag). Moderate for the biology, which runs on an accelerated clock with tuned costs. |
| Origins | `src/origins.js` | Multilevel selection in the transition to multicellularity: public goods, soma, life cycles, chimeras | Low (toy physics), but fast and instrumented with the Price equation |
| Herd | `src/core.js` | Quantitative genetics and animal breeding: heritability, the breeder's equation, inbreeding, AI, genomic selection | Genetics are exact for the additive model. Physiology and behaviour are stylized. |

The project has three experimental layers on top of the engines:

- **The perpetual world** (`runner/perpetual.mjs`) is one water-column world that never restarts.
  - It is resumed every few hours on GitHub Actions.
  - Its "climate" varies slowly around reference conditions, with reflecting bounds in model 2.
  - It writes a public record of eras, records, fossils and milestones.
- **The laws observatory** (`runner/laws.mjs`) holds standardized experiments with fresh random seeds.
  - Evidence accumulates across runs within a matching model/protocol version; older rows remain historical.
  - Each law gets a verdict computed from the accumulated evidence: *supported*, *deviates*, *pending*, *not general*, or *same direction, different scale*.
- **Paired browser experiments** (`src/experiments.js`, `src/experiments-worker.js`) compare two copies of the same seeded default pond after changing one factor. They run independently of the live and perpetual worlds; the notebook is local to the browser (section 12).

Honesty statement, also shown on the site: a "supported" verdict means the model is consistent with theory. It is **not** evidence about nature.

---

## 2. Live resources and accounts

| Resource | Value |
|---|---|
| Website (production) | https://genesis-evolution.vercel.app |
| Observatory tab | https://genesis-evolution.vercel.app/#obs |
| Other tabs | `#column`, `#origins`, `#herd` |
| GitHub repository (public) | https://github.com/YasirObaid5/genesis-evolution |
| Code branch | `main`: Vercel deploys it on every push |
| Data branch | `perpetual-data`: a single orphan commit, force-pushed by the runners. Never merge it into `main`. |
| Raw data base URL (CORS `*`) | https://raw.githubusercontent.com/YasirObaid5/genesis-evolution/perpetual-data/ |
| Hosting | Vercel project `genesis-evolution`, Git-connected to the repo. No build command; static output directory `.` (see `vercel.json`). |
| Scheduler | GitHub Actions workflows `perpetual-world` (every 3 h) and `laws-observatory` (daily) |
| Owner's local copy | `C:\Users\alshi\Desktop\nto` (the project files; `.github/` exists only in the repo) |

No secrets are stored anywhere. The workflows use the built-in `GITHUB_TOKEN` with `permissions: contents: write`. An optional VPS uses a fine-grained token in `GENESIS_PUSH_URL` (see section 13).

---

## 3. Architecture

```
                 ┌───────────────────────── GitHub repo: YasirObaid5/genesis-evolution ─────────────────────────┐
                 │                                                                                               │
  push to main ──►  branch main: src/*, runner/*, build.py, index.html (built), .github/workflows/*              │
                 │        │                                                                                      │
                 │        │ Vercel Git integration (auto deploy)                                                 │
                 │        ▼                                                                                      │
                 │   https://genesis-evolution.vercel.app  (static index.html, all engines inlined)              │
                 │                                                                                               │
  cron 17 */3 ───►  Action perpetual-world:                                                                     │
                 │    fetch-data.sh  (git archive of perpetual-data → ./data)                                    │
                 │    node runner/perpetual.mjs   (resume → evolve N minutes → write data/*)                     │
                 │    publish-data.sh  (git init in ./data, orphan commit, force-push → perpetual-data)          │
                 │                                                                                               │
  cron 41 1 ─────►  Action laws-observatory: same pattern with runner/laws.mjs                                  │
                 │    (both workflows share concurrency group "genesis-data": never two writers at once)         │
                 │                                                                                               │
                 │  branch perpetual-data: state.json.gz, meta.json, summary.json, history.json,                │
                 │                         fossils.json, milestones.json, laws.json, laws-raw.json, vercel.json │
                 └───────────────────────────────────────────────────────────────────────────────────────────────┘
                                   │ raw.githubusercontent.com (CORS *)
                                   ▼
          Browser, Observatory tab (src/obs-ui.js): reads summary/history/fossils/milestones/laws.
          The "watch" button downloads state.json.gz, gunzips it with DecompressionStream, and calls
          window.__column.load(state), so the perpetual world continues live in the water-column view.
```

Design choices behind this layout:

- **Static site, no backend.**
  - The site needs no rebuild when the data changes.
  - Vercel never redeploys for data: the data branch contains a `vercel.json` with `git.deploymentEnabled: false`.
- **Data branch is force-pushed as one commit.** This keeps the repo size flat forever.
- **Engines are DOM-free.** The same file runs in the browser, in Node runners and in tests.

---

## 4. Repository map

```
genesis-evolution/
├── index.html              BUILT single-file app (≈310 KB). Do not edit by hand; run build.py.
├── build.py                Inlines src/* into src/template.html → index.html, dist/index.html, dist/artifact.html
├── package.json            scripts: build:site, test, perpetual, laws (no "build" script: Vercel serves static)
├── vercel.json             outputDirectory ".", cleanUrls, Cache-Control max-age=300
├── .gitignore              data/, dist/, node_modules/, *.log
├── README.md               Bilingual overview, findings, limits
├── DEPLOY.md               GitHub / Vercel / Hostinger VPS operations (Arabic + English)
├── HANDOFF.md              This document
├── tests/*.test.cjs        Node built-in tests: engines, paired experiments and observatory
├── .github/workflows/
│   ├── perpetual.yml       cron '17 */3 * * *', default 40 min, timeout 120, concurrency genesis-data
│   └── laws.yml            cron '41 1 * * *', default 45 min, same concurrency group
├── runner/
│   ├── perpetual.mjs       Perpetual world (resume, evolve, climate, eras, fossils, milestones, summary)
│   ├── laws.mjs            Laws observatory (5 experiment types, 8 laws, verdicts)
│   ├── fetch-data.sh       git archive perpetual-data → ./data
│   ├── publish-data.sh     ./data → orphan commit → force-push perpetual-data (GITHUB_TOKEN or GENESIS_PUSH_URL)
│   └── daemon.sh           Endless loop for a VPS (perpetual every cycle, laws daily, publish)
└── src/
    ├── template.html       Page shell, CSS design tokens, header with world tabs and language button, Herd UI markup
    ├── worlds.js           Tab switcher (body[data-world] = obs|column|origins|herd; URL hash; localStorage)
    ├── column.js           ENGINE: water column (≈840 lines)
    ├── column.html         Water-column UI markup
    ├── column-ui.js        Water-column UI (canvas, camera, organism card, charts); exposes window.__column
    ├── experiments.js      Seeded paired-comparison API (CommonJS + GenesisExperiments)
    ├── experiments-worker.js Background replicate runner (inlined as a Blob worker)
    ├── experiments-ui.js   Bilingual results, notebook, CSV/JSON export
    ├── experiments.html    Comparison form and results markup
    ├── experiments.css     Responsive comparison styles
    ├── origins.js          ENGINE: Origins (≈670 lines)
    ├── origins.html        Origins UI markup
    ├── origins-ui.js       Origins UI
    ├── core.js             ENGINE: Herd (≈570 lines)
    ├── ui.js               Herd UI and global i18n (dispatches the 'genesis:lang' event)
    ├── obs.html            Observatory markup
    └── obs-ui.js           Observatory (reads published data, charts, law cards, "watch" button)
```

Build placeholders in `template.html`:

| Placeholder | Replaced with |
|---|---|
| `<!--@@OBS_HTML@@-->` | `obs.html` |
| `<!--@@COLUMN_HTML@@-->` | `column.html` |
| `<!--@@ORIGINS_HTML@@-->` | `origins.html` |
| `/*@@WORLDS@@*/` | `worlds.js` |
| `/*@@CORE@@*/` | `core.js` |
| `/*@@UI@@*/` | `ui.js` |
| `/*@@ORIGINS@@*/` | `origins.js` |
| `/*@@OUI@@*/` | `origins-ui.js` |
| `/*@@COLUMN@@*/` | `column.js` |
| `/*@@CUI@@*/` | `column-ui.js` |
| `/*@@BUI@@*/` | `obs-ui.js` |
| `<!--@@EXPERIMENT_HTML@@-->` | `experiments.html` |
| `/*@@EXPERIMENT_CSS@@*/` | `experiments.css` |
| `/*@@EXPERIMENTS@@*/` | `experiments.js` |
| `/*@@EXPERIMENT_WORKER@@*/` | `experiments-worker.js` |
| `/*@@EXPERIMENT_UI@@*/` | `experiments-ui.js` |

Engine module pattern (identical in all three):

```js
(function (root) {
  'use strict';
  /* ... */
  const API = { Column, GENES, /* constants */ };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;   // Node (CommonJS)
  root.GenesisColumn = API;                                                     // browser global
})(typeof globalThis !== 'undefined' ? globalThis : this);
```

Browser globals:
- `window.Genesis` (Herd)
- `window.GenesisOrigins`
- `window.GenesisColumn`
- `window.GenesisExperiments`

Runners are ES modules (`.mjs`). They load the engines with `createRequire`.

---

## 5. How to run, build, test

Requirements:
- Node ≥ 20. Node 20 is used on Actions.
- Python 3, only for `build.py`.
- No npm dependencies.

```bash
git clone https://github.com/YasirObaid5/genesis-evolution.git
cd genesis-evolution

# Open the app locally (any static server; data/ next to index.html is read first by the Observatory)
python3 -m http.server 8000         # → http://localhost:8000/#column

# Rebuild index.html after editing anything in src/ (all input/output is UTF-8)
python build.py

# Built-in Node tests; no dependency installation needed
npm test

# Perpetual world, locally, for 5 minutes (resumes from ./data if present)
MINUTES=5 DATA_DIR=data node runner/perpetual.mjs
CLIMATE=off MINUTES=5 DATA_DIR=data node runner/perpetual.mjs   # freeze the climate

# Laws observatory, locally, for 10 minutes (appends to data/laws-raw.json, rewrites data/laws.json)
MINUTES=10 DATA_DIR=data node runner/laws.mjs

# Pull the live published data into ./data
bash runner/fetch-data.sh
```

Headless use of an engine:

```js
const { Column, ADH, SOMA } = require('./src/column.js');
const sim = new Column(42, { predators: true, predRatio: 3, source: 'mixed' });
for (let i = 0; i < 20000; i++) sim.step();
console.log(sim.stats.inGroups, sim.stats.mg[ADH], sim.gens);
const snapshot = sim.serialize();            // JSON-safe
const again = Column.fromState(snapshot);    // resume
```

### Determinism and verification scope

- **Same seed, same options and same model version:** the current automated tests compare repeatability and distinct-seed divergence in all three engines over 40 steps. They also check actual symmetric mutation branches, capture bounds/handling, low-N predators, climate tendency and finite continuation of legacy schema-v1 snapshots. The original 1500-step check belonged to model 1. These are short engineering checks, not long-run scientific replication or a cross-runtime bit-identity guarantee.
- **Randomness source:**
  - All engine randomness comes from a seeded `mulberry32`.
  - The water column keeps its RNG state in `this._rs`, so `serialize()` can store it.
  - `Math.random` is used only in `runner/laws.mjs` (to draw new seeds) and in UI code.
- **`serialize()` → `fromState()` is approximate, not bit-exact.** Positions are rounded to 1e-3 µm and biomass to 1e-6, and transient state (predator targets/phases, `col.down`) is not stored. Resumed trajectories can diverge. Distributional equivalence has not been established by the current checks. Paired comparisons start fresh from the same seed instead of relying on snapshots.

The automated suite lives in `tests/*.test.cjs` and runs with `npm test`. The following longer standalone example illustrates a manual seeded check; it is not the scope of the current short engine tests:

```js
const { Column } = require('../src/column.js');
const run = (seed, n) => { const s = new Column(seed); for (let i = 0; i < n; i++) s.step(); return s; };
const a = run(5, 1500), b = run(5, 1500);
const sig = s => JSON.stringify([s.cells.length, s.born, s.cells.slice(0, 5).map(c => c.x.toFixed(6))]);
if (sig(a) !== sig(b)) { console.error('non-deterministic'); process.exit(1); }
console.log('ok');
```

Performance:
- The water column runs roughly 10³ steps/s in Node with a few hundred cells. Cost grows with the cell count; the cap is 3200 cells.
- A 40-minute Actions run gives on the order of 10⁶ steps.
- Origins and Herd are faster.

---

## 6. World 1: Water column (physics-first)

### 6.1 Domain, units, clocks

- **Units:**
  - length in **µm**
  - time in **s**
  - force in **pN**
  - viscosity in pN·s/µm² (1e-3 = water, 1 mPa·s)
- **Domain:** a vertical 2-D slice, `LX = 4000` µm wide by `LZ = 2000` µm deep.
  - `z` is depth: **z = 0 is the surface** and z = LZ is the sediment.
  - The domain is periodic in x.
- **Slice thickness `HSL = 25` µm.** This sets the 3-D concentration each simulated cell represents. It matters for every concentration statement.
- **Flow grid:**
  - `NX × NZ = 64 × 32` with `DX = 62.5` µm.
  - Spectral truncation `KXM = 20` Fourier modes in x and `MZM = 20` sine modes in z.
- **Clocks:**
  - Physical step `DT = 0.5` s.
  - Biology runs on an **accelerated clock**: `dt_bio = DT · acc`, with `acc = 400` by default, so each step is 200 s of biology.
  - Physics (flow, swimming, sinking) is in real time. Growth, division and death are 400× faster than real.

### 6.2 Physical constants (`src/column.js`)

| Symbol | Code | Value | Meaning |
|---|---|---|---|
| η | `ETA` | 1e-3 pN·s/µm² | viscosity of water |
| a | `A` | 5 µm | cell radius (Chlamydomonas-like) |
| V_cell | `VCELL` | 4/3·π·a³ ≈ 523.6 µm³ | cell volume |
| w per Δρ | `WPP` | 9.81·V_cell·1e-6 ≈ 5.14e-3 pN per kg/m³ | weight per unit excess density |
| ζ₁ | `ZETA1` | 6πηa ≈ 0.094 pN·s/µm | Stokes drag of one cell |
| D_f | `DF` | 0.45 | fractal exponent: hydrodynamic radius R_h = a·N^0.45 |
| F₀ | `F0` | 6 pN | flagellar thrust at swim gene = 1 (≈ 64 µm/s free swimming) |
| B | `B_GYRO` | 3.4 s | gyrotactic reorientation time (Chlamydomonas order of magnitude) |
| D_r | `DROT` | 0.1 rad²/s | rotational diffusion of a single swimmer |
| D_N | `D_N` | 1900 µm²/s | nutrient (nitrate) diffusivity |
| K_B | `KB` | 0.3 pN/µm | bond stiffness for packing strain (softened for 2-D) |
| σ | – | 40 µm² | optical cross-section per cell |

Derived checks:
- A single dense cell (Δρ = +60 kg/m³) weighs about 0.31 pN, so it sinks at about 3.3 µm/s.
- A swimmer reaches about 64 µm/s.
- The Reynolds number is about 1e-4.

### 6.3 Genes (5 per cell, continuous, haploid, clonal with mutation)

| Index | Name | Range | Mutation SD | Effect |
|---|---|---|---|---|
| 0 `ADH` | adhesion | 0–1 | 0.06 | Probability that a daughter stays bonded to its mother; a mother may have at most 3 bonds |
| 1 `SOMA` | soma | 0–0.9 | 0.05 | Probability that a bonded daughter becomes sterile soma: it swims 1.3× harder and exports its surplus to germ cells |
| 2 `SWIM` | swim | 0–1.5 | 0.08 | Flagellar thrust multiplier; costs energy |
| 3 `BOND` | bond strength | 0.3–14 pN | 0.5 | Tension a bond withstands before fracture; costs energy per bond |
| 4 `BUOY` | buoyancy | 0–1 | 0.06 | Excess density Δρ = 60 − 80·buoy kg/m³, from +60 down to −20 (gas vesicles or lipid); costs energy |

Mutation:
- Each gene mutates with probability `mut = 0.08` per division.
- 96% of mutations are Gaussian steps with the SD in the table.
- 4% are **macro-mutations**: the gene is redrawn uniformly within its range. This helps cross the "adhesion valley".
- Founders: 420 single cells, with adh ≈ 0.04, soma ≈ 0.02, swim ≈ 1, bond ≈ 2, buoy ≈ 0.05.

### 6.4 Step order (`Column.step()`)

1. **Body force.**
   - Each cell's buoyancy-corrected weight `w_c = (60 − 80·buoy)·WPP` pN is spread bilinearly onto the grid as force density `f_z = Σ w_c / V_node`, where V_node = DX²·HSL.
   - Swimmers are force-free: their thrust is balanced by their own drag on the fluid. Therefore **only weight drives the fluid**.
2. **Stokes flow:** `solveStokes()` (section 6.5).
3. **Light:** `computeLight()` (section 6.6).
4. **Organism motion:** `moveColony()` for each organism (section 6.7).
5. **Mechanics:**
   - `relax(3)` handles bonds and steric exclusion.
   - `fracture()` runs for each multicellular organism (section 6.8).
6. **Predators:** `stepPredators()` (section 6.10).
7. **Biology:** `biology()` on the accelerated clock (section 6.9).
8. **Transport:** nutrient `transport()` (section 6.6), then `moveTracers()` for 1800 passive tracers used for display.
9. **Bookkeeping:**
   - Remove dead cells and resolve broken organisms with a BFS over bonds.
   - Update the generation counter.
   - `computeStats()` every 20 steps; `pushHist()` every 40 steps.

### 6.5 Stokes solver

At Re ≈ 1e-4 inertia is negligible. In 2-D with stream function ψ, where u = ∂ψ/∂z and w = −∂ψ/∂x:

```
η ∇⁴ψ = ∂f_z/∂x
```

Boundary conditions:
- Periodic in x (Fourier basis).
- Free-slip and no-penetration at the surface z = 0 and the bottom z = LZ: ψ = 0 and ψ_zz = 0. This is satisfied by a sin(q_m z) basis with q_m = π(m+1)/LZ.

Algorithm:
1. Forward DFT of `f_z` along x for each row (modes j = 1..20). Mode j = 0 is dropped, because a horizontally uniform weight is balanced by hydrostatic pressure and drives no flow.
2. Sine projection in z.
3. Inversion of the biharmonic operator per mode: `ψ̂ = i·k_x·F̂ / (η·(k_x² + q_m²)²)`.
4. Synthesis of u = ψ_z, w = −ψ_x and vorticity ω = ∇²ψ back on the grid.
5. Shear rate `γ̇ = sqrt(2·e_ij·e_ij)` from centred finite differences of (u, w).
6. Statistics:
   - `flowStats.rms` is the **RMS of the vertical velocity w** over the grid.
   - `flowStats.max` is the maximum speed.

Validated earlier:
- The field is divergence-free.
- It is symmetric for symmetric forcing.
- It is linear in the force.
- It shows downflow under a heavy blob.

### 6.6 Light and nutrients

**Light (Beer–Lambert with self-shading).** For each column of nodes, from the surface down:

```
I(i,k) = I0 · exp( −k_w·z_k − τ_above − ½·n_ik·σ' )      σ' = σ/(DX·HSL),  τ accumulates n·σ' downward
```

- `I0 = p.light` (relative).
- `k_w = p.turbidity` in 1/µm, default 0.0012. This is deliberately high: the 2 mm column stands in for a deeper, murkier pond.
- Inside an organism of N cells, each cell sees `I/(1 + N/300)`, an extra self-shading term.

**Nutrient field C** (relative units, 64×32), in order:

1. **Source**, depending on `p.source`:
   - `'mixed'` (remineralization in the water): C relaxes everywhere toward `0.6·nutrient` at rate 0.007 /s.
   - `'sediment'`: the bottom row relaxes toward `3·nutrient` at rate 0.03 /s.
2. **Advection:** semi-Lagrangian, by the Stokes flow, applied when `flow` is on.
3. **Diffusion:** explicit, with D_N = 1900 µm²/s, in 2 substeps (r = D·dt/dx² ≈ 0.12).
4. **Uptake and recycling:**
   - Uptake by cells uses the conversion constant `κ = 2.5e-6` (biomass per nutrient unit per µm³).
   - Dead cells return half their biomass to C; the other half is "buried".

### 6.7 Organism motion (each organism moves as one rigid Stokes body)

For an organism of N cells:

- **Thrust:**
  - `T = Σ F0·swim·(1.3 if soma)` over the cells that are swimming.
  - **Flagellation constraint:** a germ cell does not swim while it prepares to divide (b ≥ 0.9 and growing). It regrows flagella if it is starving (`!(gr > 0)`).
- **Weight:** `W = Σ w_c`.
- **Drag:** `ζ = 6πηa · N^0.45`, from the fractal hydrodynamic radius.
- **Velocity:** `v = u_fluid(x) + (T·p̂ + W·ẑ)/ζ`, where p̂ = (cos φ, sin φ).
- **Gyrotaxis with chemotactic switching:**
  ```
  dφ = [ −sin(φ − φ*)/(2B) − ω/2 ] dt + sqrt(2·(D_r/√N)·dt)·ξ
  ```
  - The target φ* is −π/2 (up, toward light) by default.
  - φ* switches to +π/2 (down) when the nutrient limits growth more than light does (f_N < 0.85·f_I) **and** nutrient increases with depth (ΔC > 0.02 over ±120 µm).
  - This gives diel-migration-like behaviour.
- **Rotation:** multicellular bodies rotate rigidly with the local fluid by −ω/2·dt (Jeffery's result for a sphere).
- **Walls:** the surface and the sediment stop the organism **as a whole**. It is shifted rigidly and never squashed.

### 6.8 Mechanics and fracture

**Bonds** are handled by position-based relaxation:
- rest length 2a
- 3 iterations per step
- corrections are symmetric, so the centre of mass is preserved

**Steric exclusion** uses a linked-cell hash with 12 µm bins. It applies **only within the same organism**: different organisms pass each other, standing in for a dilute 3-D suspension.

**Fracture** is checked once per step for each multicellular organism. Two tensions are compared with the organism's mean bond-strength gene:

| Tension | Formula | Bond that breaks |
|---|---|---|
| Packing strain | `K_B·(d − 2a)`, the largest residual bond stretch | the most strained bond |
| Viscous shear | `½·6πη·R²·γ̇`, with R = a·N^0.45 and γ̇ the local shear rate | the most central bond, which splits the tree most evenly (`subtree()`) |

When the larger tension exceeds the bond strength, one bond breaks. The pieces become separate organisms with a parent link (`resolve()`, BFS over bonds). Counters: `fractures`, `fracShear`, `fracPack`.

### 6.9 Biology (accelerated clock)

Constants:
- `dt_bio = DT·acc = 200` s per step
- `μ = 2.9e-5 /s` (doubling about 6.6 h)
- `K_I = 0.2`, `K_N = 0.15`

Each cell holds biomass `b`:

- **Growth (Liebig law of the minimum):**
  ```
  lim  = min( I/(I + K_I), C/(C + K_N) )
  grow = μ · b · lim · dt_bio          (capped by the local nutrient available)
  ```
- **Maintenance cost:**
  ```
  cost = μ · dt_bio · b · ( 0.04 + [swimming]·0.12·swim + 0.006·bond·n_bonds + 0.22·buoy + 0.02 )
  ```
- **Soma cells:**
  - They do not accumulate biomass. Their surplus (grow − cost) goes to the organism's pool, which is shared equally among its germ cells.
  - They lose biomass only when cost exceeds growth.
  - They die at age > 1500 steps.
- **Death** happens when b < 0.3, or with background probability `0.1·μ·dt_bio` per step.
- **Division:**
  - Applies to a germ cell at b ≥ 1, while the total stays under `cap` (default 3200).
  - The daughter is placed 2a away from the mother, roughly away from the organism's centre.
  - Both cells get b/2.
  - The daughter stays bonded with probability `adh`, if the mother has fewer than 3 bonds. A bonded daughter becomes soma with probability `soma`.
  - Otherwise the daughter founds a new single-cell organism. This counts as a reproduction event of the parent organism, and its size is recorded.
- **Generation counter:** each division adds 1/N_cells of a generation. It is monotonic and robust to crashes in N.
- **Heritability of organism size:** `pairs` stores (log₂ parent reproduction size, log₂ offspring reproduction size); `groupGalton()` regresses them.

### 6.10 Predators (rotifer-like, gape-limited, ratio-dependent)

- **Count:** `predTarget() = clamp(round(predRatio·N_cells/100), 0, 48)`, or zero when predators are disabled.
  - This is ratio-dependent, chemostat-style, with zero or one predator permitted at low N. Excess predators are removed before attacks; zero pressure cannot cause a final extra attack.
- **Speed:** `80/(1 + gape/60)` µm/s. A bigger mouth means a slower predator.
- **Hunting:**
  - A predator searches within 200 µm, re-targeting every 4 steps.
  - Let `r = (2a·N^0.45)/gape`. Capture efficiency is `16r²(1−r)²` for `0 < r < 1`, otherwise zero. It peaks at half the gape. This is an explicit **simplified, uncalibrated assumption**, not an empirical feeding curve.
  - Targets are scored by `n·efficiency/(d² + 2500)`.
  - At contact, a seeded random draw determines success with that efficiency. Success **eats the whole organism**: energy rises by 0.18 per cell and digestion lasts 40 + 3n steps. Failure costs four steps of handling time while maintenance still drains energy. An already swallowed colony cannot be counted again in that step.
  - Half of the eaten biomass is recycled to C.
- **Energy drain:** `0.0032·(1 + gape/40)` per step.
- **Evolution (Moran process):**
  - Every 60 steps, the best-fed predator produces a child that replaces the hungriest one.
  - Child gape: `gape_child = gape_parent · exp(0.07·ξ + M)`, where M is zero with probability 0.96, +0.25 with probability 0.02 and −0.25 with probability 0.02.
  - Mutational log changes are symmetric before the existing 10 µm lower bound; this does not guarantee an unchanged arithmetic mean gape or remove selection.
- Predators are advected by the flow.

### 6.11 Options (`new Column(seed, opts)`, or `sim.setParam(key, value)` at run time)

| Option | Default | Meaning |
|---|---|---|
| `predators` | true | predation on or off |
| `predRatio` | 3 | predators per 100 algal cells |
| `flow` | true | hydrodynamic coupling. Off means no flow, which serves as a control for bioconvection. |
| `light` | 1.0 | surface irradiance (relative) |
| `turbidity` | 0.0012 | attenuation, 1/µm |
| `nutrient` | 1.0 | nutrient supply multiplier |
| `source` | `'mixed'` | `'mixed'` (remineralized in the water) or `'sediment'` (from the bottom) |
| `acc` | 400 | biological clock acceleration. In the bioconvection experiment, biology is disabled. |
| `mut` | 0.08 | per-gene mutation probability per division |
| `cap` | 3200 | hard cap on cells |

### 6.12 Statistics (`sim.stats`, refreshed every 20 steps)

| Field | Meaning |
|---|---|
| `n` | number of cells |
| `multi` | number of multicellular organisms |
| `inGroups` | fraction of cells living in organisms of size > 1 |
| `meanSize` | **cell-weighted** mean organism size, Σs²/n: the size of the organism the average cell lives in |
| `maxSize` | largest organism (cells) |
| `mg[5]` | mean gene values over cells, in gene order |
| `cls[5]` | fraction of cells in organisms of size 1, 2–3, 4–15, 16–63 and 64+ |
| `soma` | fraction of bonded cells that are soma |
| `preds`, `gape` | predator count and mean gape (µm) |
| `depth` | mean cell depth (µm) |
| `prof`, `profM` | 16-bin depth histograms of single cells and of cells in organisms |
| `Iz`, `Cz` | horizontally averaged light and nutrient profiles (32 rows) |
| `rms`, `vmax` | RMS vertical velocity and max speed (µm/s) |

**Milestones** (`checkMilestones`) record the first step at which each event happens:

| Key | Condition |
|---|---|
| `ms_plumes` | rms > 12 µm/s, after step 40 |
| `ms_first8` | maxSize ≥ 8 |
| `ms_half` | inGroups ≥ 0.5 |
| `ms_32` | maxSize ≥ 32 |
| `ms_soma` | soma ≥ 0.15 |
| `ms_float` | mean buoy ≥ 0.6 |
| `ms_majority` | inGroups ≥ 0.9 |
| `ms_gape` | mean gape ≥ 30 µm |

### 6.13 Other methods

| Method | Purpose |
|---|---|
| `colonyAt(x, z)` | Picking an organism, for the UI |
| `colonyInfo(col)` | Data for the organism card |
| `lineage(col)` | Ancestor chain from the archive (≤ 40,000 records, pruned) |
| `stir()` | Shakes the jar: rigid vertical displacement of every organism |
| `climate(rate)` | Mean-reverting light, turbidity, nutrient and predRatio with reflecting bounds, plus a rare source flip (section 9) |
| `serialize()`, `Column.fromState(st)` | Persistence (section 10.1) |

---

## 7. World 2: Origins (simplified multicellularity)

### 7.1 Model

- **Space:** a 1200×800 dish with cell radius R = 4 units.
- **Chemical fields** on a 10-unit grid (120×80):
  - `N`: nutrient, injected by 5 drifting Gaussian patches.
  - `E`: enzyme, which diffuses fast and decays.
  - `P`: complex polymer food, digestible only with enzyme.
- **Five genes:**

| Gene | Meaning |
|---|---|
| `adh` | Probability that a daughter stays bonded. Bonds form tree-like bodies with at most 3 bonds per cell ("snowflake yeast" geometry). |
| `secr` | Secretion of a costly enzyme (a public good). The cost is `secrCost·secr` per step, default 0.0042. A lone cell loses its enzyme to diffusion; an organism retains part of its enzyme, and that part grows with size (`0.8·ρ·mean secr`). |
| `soma` | Sterile swimming cells that pull the organism toward nutrient patches |
| `single` | Propagule mode: the probability of releasing a single peripheral germ cell (a bottleneck) instead of fragmenting into chunks |
| `fis` | Fission size: an organism reproduces when it reaches 2^fis cells |

- **Physics:** soft repulsion and spring bonds (toy).
- **Predators:**
  - Gape-limited: they swallow any unit smaller than their gape.
  - The gape evolves. In model 2 its log mutation is `0.15ξ + M`, with M = 0 (95%), +0.5 (2.5%) or −0.5 (2.5%), before the existing minimum gape of 1. The new Column capture window is not applied to this separate toy model.
  - Speed is `1.25/(1 + 0.06·√gape)`.
  - Lifespan is 2600–4000 steps, so the population turns over.
- **Options:**

| Option | Default | Meaning |
|---|---|---|
| `predators` | false | |
| `aggregation` | false | Cells can bond with strangers on contact, which creates chimeras |
| `lifecycle` | `'free'` | `'free'` (evolves via the `single` gene), `'single'`, or `'chunk'` |
| `mut` | 0.08 | |
| `nutrient` | 1 | |
| `patchSpeed` | 1 | |
| `polymer` | 1 | |
| `secrCost` | 0.0042 | |
| `cap` | 2600 | |

### 7.2 Multilevel selection instrumentation

`snapshot()` runs periodically and applies a **Price equation decomposition** to the `secr` and `adh` genes. Each living cell is mapped to its ancestor in the previous snapshot. The parent's fitness w is its number of descendants.

```
Δz̄ = Cov_between(W_g, Z_g)/w̄  +  E_g[Cov_within(w, z)]/w̄  +  transmission
```

The results go to `this.price` as `{ between, within, total, trans, dz, r }`.

Relatedness `r` is the between-organism share of the variance in `secr`. `stats.rel` is the same quantity computed over cells in multicellular organisms.

Other instruments:
- `groupGalton()`: heritability of organism size.
- `lineage()`: ancestor chain.
- `bigPredators()`: interventions.
- `plague()`: interventions.

---

## 8. World 3: Herd (quantitative genetics and breeding)

### 8.1 Genetics (exact for the additive model)

- **Six traits:** `size`, `speed`, `vision`, `heat`, `fert`, `thrift`, with **8 loci each**, so 48 loci in all.
- **Diploid and additive.** Founder heritabilities: `H2_FOUNDER = [0.45, 0.35, 0.30, 0.30, 0.10, 0.25]`.
  - Allele SD is `sqrt(h²/(2·8))`, so the founder genetic variance equals h².
  - Environmental SD is `sqrt(1 − h²)`, so the founder phenotypic variance equals 1.
- **Values:** `G = Σ alleles`; `P = G + e`.
- **Meiosis:**
  - Mendelian segregation with free recombination (there is no linkage).
  - Mutation rate `mut = 0.003` per allele per meiosis, with effect SD 0.6·allele SD. A mutation creates a new allele tag.
- **IBD tags:**
  - Every founder allele and every new mutation gets a unique integer tag.
  - **Genomic inbreeding** F is the fraction of loci whose two alleles carry the same tag. This is identity by descent relative to the founders.
- **Inbreeding depression** (`inbDep`, on by default): metabolic cost × (1 + 1.2·F).
- **Phenotype → physiology** (`derive()`):
  - size → mass
  - speed → max speed (which also scales with mass^-0.12)
  - vision → sensing radius
  - heat → thermal optimum `33 + 3.2·z`
  - fert → cycle length and conception probability
  - thrift → metabolism and energy store
- **Behaviour:**
  - A **9→6→2 tanh neural network** drives each animal. Inputs: food left/right/here, energy, mate direction (sin, cos), heat, oscillator, bias. Outputs: turn and speed.
  - Weights are diploid and averaged.
  - Weights are inherited with a 3% mutation rate (SD 0.2) from a hand-wired prior.

### 8.2 Reproduction and environment

- **World:** 1200×800, with a regrowing food grid (20-unit cells).
- **Seasons:** 3000 ticks per year. Temperature is `temp ± 7 °C` sinusoidal. Droughts can be triggered.
- **Life history constants:**
  - Puberty at 320 ticks.
  - Gestation 380 ticks.
  - Estrus lasts 40 ticks.
  - Estrus is detectable at range vision × 3.2 × density factor (a pheromone stand-in).
  - Postpartum anestrus.
  - Male refractory period of 12 ticks.
  - Heat stress lowers conception.
  - Population cap 1400.
- **Breeding modes** (`mode`):

| Mode | How mating works |
|---|---|
| `natural` | Free mating |
| `selective` | Only the top `sireFrac` of males (and `damFrac` of females) by the criterion may mate. Needs sireFrac ≥ 0.15–0.20, or the herd fails to reproduce; the UI warns about this. |
| `ai` | Artificial insemination. A frozen-semen bank holds the top `bankSize` sires. Females in estrus are detected with probability `heatDet` and inseminated. |

- **Selection criterion:** `pheno` (own phenotype) or `genomic` (simulated genomic EBV with accuracy r = `accuracy`):
  ```
  EBV = μ + r²(G − μ) + r·sqrt(1 − r²)·σ_G·z,   z ~ N(0,1) fixed per animal
  ⇒ corr(EBV, G) = r,  Var(EBV) = r²σ_G²,  regression of G on EBV = 1 (unbiased)
  ```
  This is **not GBLUP**. It is a statistically correct stand-in with a chosen accuracy.

### 8.3 Measurement

`galton(trait, onlySelected)` works from birth records. Each birth stores the mid-parent and offspring phenotypes as deviations from the population mean at that birth, together with the realized h² = Vg/Vp at that moment.

- **slope:** offspring deviation regressed on mid-parent deviation. This estimates h².
- **S:** mean mid-parent deviation, the selection differential.
- **R:** mean offspring deviation, the response.
- **pred = h²·S:** the breeder's equation.

`computeStats()` gives the per-trait mean G and P, Vg, Vp, h², and the mean F and generation.

`pushHist()` keeps a thinned time series.

Interventions: `doDrought()`, `doBottleneck(16)`, and any parameter via `setParam`.

---

## 9. The perpetual world

`runner/perpetual.mjs`, with environment variables `MINUTES` (default 20; the workflow passes 40), `DATA_DIR` (default `data`) and `CLIMATE` (`off` freezes it).

**Each run:**

1. **Start:**
   - Resume from `state.json.gz` and `meta.json` if both exist.
   - Otherwise create a new world with seed `Date.now() % 2147483647` and a new `meta`.
   - Schema-v1 checkpoints remain supported. Resuming an unversioned checkpoint records `{from: 'legacy', to: '2', step, generations, at}` in `meta.modelChanges`; other older versions are recorded by their version. State, era and cumulative counters are preserved rather than silently starting a new era. New history/fossil/milestone rows are stamped `modelVersion: '2'`; old rows are not relabeled. Meta and summary expose the current version and transition history, so all-time records spanning versions remain visibly mixed evidence.
   - Missing checkpoint pairs, malformed records and inconsistent checkpoint metadata cause an error before replacement instead of resetting the world. Individual file replacement is atomic; this is not a transaction across all files.
2. **Loop until the time budget is spent:**
   - Run `sim.step()`.
   - Every **4000 steps**, call `sim.climate(1)`, a mean-reverting stochastic update with reflected bounds:

     | Variable | Reference mean | Noise coefficient | Range |
     |---|---|---|---|
     | light | 1 | 0.05 | [0.4, 1.4] |
     | turbidity | 0.0012 | 6e-5 | [0.0004, 0.002] /µm |
     | nutrient | 1 | 0.05 | [0.5, 1.6] |
     | predRatio | 3 | 0.15 | [0, 5] |

     Before reflection, `x' = mean + (x−mean)·exp(−0.08·rate) + sd·sqrt((1−exp(−0.16·rate))/0.16)·ξ`. This is a stylized climate process, not a forecast. The nutrient source flips with probability `1−exp(−0.005·rate)`. A rate of zero leaves state/RNG unchanged; negative or nonfinite rates are rejected.
   - Every **1000 steps**, append a history point and update the all-time records.
   - Every **5000 steps**, save a fossil of the largest organism (if it has ≥ 4 cells): cell coordinates relative to its centre of mass, soma flags, bonds and genes. The list is capped at 240 entries, keeping the largest per era, the top 80 by size and the most recent 120.
   - **New milestones** are appended with wall time, cumulative step and cumulative generations.
   - **Extinction** (0 cells) closes the era with cause `extinction`. A new era starts from a fresh inoculum and seed, keeping the current climate parameters.
3. **Write files:**
   - Thin the history if it exceeds 3000 points: the last 1500 stay dense and older points are halved.
   - Write all data files (section 10).

### Historical model-1 state (data commit 2026-10-12 01:16 UTC)

The following records precede model-2 fixes and are not current-model evidence or a fresh live deployment check.

| Quantity | Value |
|---|---|
| Started | 2026-10-11 20:22 UTC |
| Runs | 3 |
| Steps | 2,445,200 |
| Physical time | ≈ 14.2 days |
| Biological time | 135,844 h (≈ 15.5 years) |
| Cumulative generations | 3,297.9 |
| Divisions | 1,345,267 |
| Era | 2 |

- **Era 1** (seed 748770971) lasted about 2,857 generations.
  - It reached:
    - plumes at 0.2 generations
    - soma ≥ 15% at 7.4
    - the first 8-cell organism at 11.2
    - mean gape ≥ 30 µm at 61
    - half of cells in organisms at 843.7
    - 90% in organisms at 2,013.5
  - It went **extinct** at about 2,857 generations. The climate had drifted to low light (0.40), low nutrient (0.56) and the maximum predation ratio (about 4.8–5). The population fell to about 50 cells and then 5.
- **Era 2** started at once. It reached "half in organisms" about 100 generations later.
- **All-time records:**

  | Record | Value |
  |---|---|
  | Largest organism | 24 cells |
  | Highest fraction of cells in organisms | 100% (at low N) |
  | Highest soma fraction | 0.60 |
  | Widest mean gape | 173 µm |
  | Longest organism lineage | 1,975 organism generations |
  | Highest mean buoyancy | 0.125 |

- **At the last data point:**
  - 217 cells, 3.7% in organisms.
  - Predator gape about 120–147 µm, far above any organism's diameter.
  - predRatio 4.79; nutrient source sediment.
  - Multicellularity gives no refuge in this state (see section 14, items 1–3).
- **Laws schedule:** at writing (03:20 UTC), the daily `laws-observatory` schedule (01:41 UTC) had **not yet fired**. GitHub sometimes delays or skips the first scheduled runs of a new repository. It can be run manually: **Actions → laws-observatory → Run workflow**.

---

## 10. Data formats

All files live on branch `perpetual-data` (and in `./data` locally).

### 10.1 `state.json.gz`

The full resumable state of the water column: gzip-compressed JSON from `Column.serialize()`, about 200 KB.

The schema remains `v: 1`; `modelVersion: '2'` is additive. `Column.fromState` accepts older v1 files without that marker. Resume is approximate (section 5), and the perpetual runner records an explicit model-change boundary (section 9).

```jsonc
{
  "v": 1, "modelVersion": "2", "seed": 765998173, "rs": <int RNG state>, "t": <step in this era>, "p": { /* options, see 6.11 */ },
  "next": [nextId, nextCol, nextGeno],
  "counters": { "born", "eaten", "fractures", "fracShear", "fracPack", "gens", "nAvg", "_bornSeen" },
  "C": [ /* 64*32 nutrient values, row-major: index = k*64 + i, k = depth row from the surface */ ],
  "cells": [[id, x, z, b, soma0/1, geno, age, born, phi, [adh,soma,swim,bond,buoy], colonyId, [bondedCellIds], gr], ...],
  "cols":  [[id, parentId, gen, born, hue, phi, peak, reproSize, parentRepro, kids], ...],
  "preds": [[id, x, z, energy, gape, age, maxAge, digest, heading], ...],
  "arch":  [[id, parentId, gen, born, died, peak, hue, repro], ...],    // last 6000 organism records
  "hist": [...], "events": [...], "milestones": { "ms_*": step }, "pairs": [[log2 parent size, log2 child size], ...]
}
```

### 10.2 `meta.json`

```jsonc
{ "modelVersion": "2", "modelChanges": [{ "from": "legacy", "to": "2", "step", "generations", "at" }],
  "started": ISO, "era": 2, "runs": 3, "stepsTotal": 2445200, "gensPast": 2857.09, "bornPast": 1243803,
  "wallSeconds": 3300, "lastRun": ISO,
  "eras": [{ "era": 1, "seed": 748770971, "started": ISO, "ended": ISO, "steps": 2105085, "cause": "extinction" }, ...],
  "records": { "maxSize", "maxInGroups", "maxSoma", "maxGape", "maxColonyGen", "maxBuoy" } }
```

### 10.3 `summary.json`

The website reads this file first.

```jsonc
{ "modelVersion": "2", "modelChanges": [...], "updated", "started", "runs", "era", "eras", "stepsTotal", "physicalSeconds", "biologicalHours", "generations", "divisions",
  "now": { "cells", "inGroups", "meanSize", "maxSize", "soma", "predators", "gape", "rms",
           "genes": { "adh", "soma", "swim", "bond", "buoy" }, "env": { "L", "K", "N", "P", "S" } },
  "records": { ... } }
```

### 10.4 `history.json`

An array with one point per 1000 steps. It is thinned beyond 3000 points. New history, fossil and milestone rows include the current `modelVersion`; earlier unversioned rows remain historical.

```jsonc
{ "modelVersion": "2", "w": wallISO, "era": 1, "s": cumulativeSteps, "g": cumulativeGenerations,
  "n": cells, "inG": fractionInOrganisms, "ms": cellWeightedMeanSize, "mx": maxSize,
  "mg": [adh, soma, swim, bond, buoy], "gape": meanGape_um, "preds": count,
  "rms": rmsVerticalVelocity_um_s, "soma": somaFractionOfBonded, "depth": meanDepth_um,
  "env": { "L": light, "K": turbidity_per_mm, "N": nutrient, "P": predRatio, "S": 0 mixed | 1 sediment } }
```

### 10.5 `fossils.json`

```jsonc
{ "modelVersion": "2", "wall", "era", "step", "gens", "id", "n", "gen", "hue", "depth",
  "genes": [5 means], "soma": fraction, "cells": [[dx_um, dz_um, soma0/1], ...], "bonds": [[i, j], ...] }
```

### 10.6 `milestones.json`

```jsonc
[{ "modelVersion": "2", "key": "ms_half" | ... | "extinction", "era", "wall", "step", "gens" }]
```

### 10.7 `laws-raw.json`

Every replicate ever run, keyed by experiment. New rows additionally carry `modelVersion: "2"` and `protocolVersion: "2"`; unversioned and mismatched rows remain historical and are excluded from current verdicts:

```jsonc
{ "herdBreeder":   [{ "seed", "mode", "target", "criterion", "n", "pred", "real", "S", "h2", "h2pts": [[h2_true, slope, n]], "at", "secs" }],
  "herdInbreeding":[{ "seed", "bank", "dF", "theory", "Ne", "Nm", "Nf", "gens", "at", "secs" }],
  "bioconvection": [{ "seed", "N", "conc", "rms", "at", "secs" }],
  "predation":     [{ "seed", "predators", "predRatio", "peak", "transition", "transitionAt", "collapse", "collapseAt", "gapeRatio", "gapeCrossedBeforeCollapse", "gapeCrossingAt", "extinct",
                      "tr": [[t, inG, adh, gape, diam]], "at", "secs" }],
  "chimeras":      [{ "seed", "aggregation", "rel", "within", "between", "secr", "meanSize", "at", "secs" }] }
```

### 10.8 `laws.json`

```jsonc
{ "updated", "modelVersion": "2", "protocolVersion": "2", "counts": { experiment: current_n }, "historicalCounts": { experiment: older_n },
  "laws": [{ "id", "world", "verdict", "statement": { "ar", "en" }, "pts"?, "fit"?: { "n", "k", "se", "r2" },
             "corr"?, "axes"?, ...law-specific fields }] }
```

---

## 11. The laws observatory

`runner/laws.mjs` (`MINUTES`, `DATA_DIR`) works as follows:

- **Choosing experiments.** It repeatedly picks the experiment furthest behind its target share. The weights are herdBreeder 3, herdInbreeding 3, bioconvection 4, predation 2 and chimeras 2.
- **Running them.** Each experiment runs with a fresh `Math.random` seed and is appended to `laws-raw.json`. Runs continue until 92% of the time budget is used.
- **Scoring.** Every verdict is recomputed only from accumulated rows matching current model/protocol `'2'`. Predation denominators include extinctions; historical rows are preserved and counted separately. The reader rejects corrupt evidence instead of silently replacing it. Files are written through temporary-file replacement.

### 11.1 Experiment protocols

| Experiment | Protocol |
|---|---|
| `herdBreeder` | 2500 natural steps, then the Galton slope for every trait vs. the true h² (needs n > 80). Then 12,000 steps of selection, randomized as follows: mode selective (sireFrac 0.25) or ai (0.06), target trait random, criterion pheno or genomic. Records pred = h²S and real = R. |
| `herdInbreeding` | mut = 0, 1500 warm-up steps, then AI with sireFrac 0.05, bankSize ∈ {2, 4, 8, 16}, heatDet 0.9, for 16,000 steps. ΔF is the slope of −ln(1−F) against mean generation, after 4000 steps. Ne is the harmonic mean, over generation-length windows, of 4·Nm·Nf/(Nm+Nf), where Nm and Nf are effective parent numbers from the contributions (Σk)²/Σk². Theory: 1/(2Ne). |
| `bioconvection` | Biology disabled; N ∈ {100, 200, 400, 700, 1000, 1500, 2200} identical swimmers (swim 1, buoy 0.05); 900 steps; mean rms vertical velocity over steps 300–900. Concentration = N/(LX·LZ·HSL)·1e12 cells/mL. |
| `predation` | One third of seeds have no predators; the rest have predRatio 1.5–4.5. Up to 36,000 steps; samples at start, every 500 steps and the endpoint (including extinction). Transition: sampled inGroups ≥ 0.5; collapse: a later sample < 0.2. A gape crossing must be observed strictly after transition and before collapse, from gape ≤ contemporary diameter to gape > contemporary diameter. gapeRatio uses both quantities from the same pre-collapse sample. The 500-step interval can miss short events; temporal order does not prove causation. |
| `chimeras` | Origins with predators, aggregation on or off, 20,000 steps. Records the final relatedness, the mean of the last 8 Price within/between terms for secretion, and the mean size. |

### 11.2 Laws, verdict rules and evidence

**Historical model-1/protocol-1 evidence and verdict rules** below are from 2026-10-11 20:37 UTC. Counts: herdBreeder 11, herdInbreeding 11, bioconvection 14, predation 7, chimeras 7. These rows do not support model-2 verdicts. The current Red Queen rule requires at least three collapses and an observed preceding crossing in at least half of them; see section 11.1. No long model-2 scientific replication was performed in this local update.

| Law | Verdict rule | Evidence | Verdict | Comment |
|---|---|---|---|---|
| **breeder**: R = h²S under phenotypic selection | Regression of R on h²S through the origin. Supported if \|k − 1\| ≤ max(0.3, 2·se). | k = 0.814 ± 0.125, n = 7 | supported | Small n and a generous tolerance. Needs many more replicates. |
| **genomic**: R > h²S under genomic selection | k > 1.3 | k = 2.95 ± 0.53, n = 4 | supported | The expected direction, since selection acts on breeding values. The fit is poor (r² < 0) and the magnitude depends on the accuracy r. Qualitative only. |
| **heritability**: the offspring-on-midparent slope estimates the true h² | k ≈ 1 within max(0.2, 2·se) | k = 1.015 ± 0.023, n = 66, r² 0.78 | supported | The strongest result so far |
| **inbreeding**: ΔF ≈ 1/(2Ne) | through-origin k ≈ 1, or else the OLS direction | k = 1.316 ± 0.104, n = 11, r² 0.82 | same direction, different scale | ΔF is about 30% faster than drift theory predicts (section 14, item 6) |
| **bioconvection**: plumes appear above a critical concentration | The first concentration with mean rms > 10 µm/s, with the lowest concentration below 10 | rms 1.25 at 0.5 M/mL, 2.5 at 1 M, 26 at 2 M, 31 at 3.5 M, 42 at 5 M, 54 at 11 M | supported; threshold between 1 and 2 million cells/mL | The existence of a threshold is robust. The absolute number depends on HSL, which was tuned (section 14, item 4). |
| **predation**: gape-limited predation drives multicellularity | The transition fraction with predators exceeds the fraction without by > 0.3 | 40% (2 of 5) vs 0% (0 of 2) | supported | Very small n |
| **redqueen**: multicellularity collapses when gape overtakes organism size | ≥ 3 transitions, ≥ 50% of them collapse | 2 transitions, 1 collapse, gapeRatio 1.66 | pending | See the gape mutation bias (section 14, item 1) |
| **chimeras**: chimeric organisms are less related than clonal ones | mean rel(chimeric) < mean rel(clonal) | 0.922 (n 4) vs 0.962 (n 3). Mean size 31 vs 8. Within-group selection term about −0.0006 in both. | supported for relatedness | The second half of the statement ("weakens cooperation") is **not** shown by these data |

---

## 12. Front end

### Paired comparison and local notebook (model 2)

`GenesisExperiments` exports `MODEL = 'water-column/2'`, `PROTOCOL_VERSION = 1`, `BASELINE`, `FACTORS`, `validateConfig`, `createPair`, `sample`, `summarize` and `toCSV`. This comparison protocol is separate from laws protocol `'2'`.

- `createPair` constructs A and B with the same seed and full default pond options, then applies one B treatment: predators off, flow off, source sediment, or light 0.5. A retains default predators/flow on, mixed source and light 1. It does not copy live sliders. Initialization and RNG states match before the treatment; subsequent random streams can diverge with different events.
- Config is `{factor, seed, repeats, steps}`: seed 1–2147483646, repeats 1–12, steps 100–36000. UI defaults are seed 777, 3 repeats, 5000 steps. Replicate seeds increase by one with wraparound. Repeatability is scoped to the same model, comparison protocol and settings.
- The inlined Blob worker records start/end and every `max(20, ceil(steps/100))` steps (roughly 100 points for long runs). An extinct arm freezes at its extinction step; execution stops early if both arms are extinct. Brief transitions between samples can be missed.
- Summaries include all completed pairs and extinctions. Extinct-arm cell count, multicellular fraction, adhesion and mean size are zero by convention; zero is absence, not reversal to unicellularity. Results show paired B−A means/ranges, per-arm extinction counts, per-replicate endpoints and the last completed pair's trajectory. Observed ranges are not confidence intervals.
- `localStorage['genesis.experiments.v1']` holds up to 12 completed experiments with notes, versions, settings and trajectories. Storage failures preserve old data. A full notebook requires deliberate deletion; it does not evict old experiments. Export CSV contains endpoints/version/config metadata, `completedRepeats` and `complete`; JSON retains full trajectories and notes. Clearing browser data removes the notebook. Rerun uses the current model/protocol and warns on older versions.
- Cancellation terminates the worker. Any already completed pairs can be downloaded as partial CSV/JSON (`complete: false`); the notebook accepts only fully completed experiments. Comparisons do not change the live column, its chosen preset, the perpetual world or its files.

- **Single page.** `body[data-world]` selects the visible world; CSS hides the others.
  - `worlds.js` reads the URL hash (`#obs`, `#column`, `#origins`, `#herd`).
  - It remembers the last world in `localStorage['genesis.world']`, wrapped in try/catch.
  - The default world is `column`.
- **Theme.** One dark theme defined by CSS tokens in `template.html`.
  - The overlay rule `[hidden]{display:none!important}` is required.
  - Fonts come from Google Fonts, with system fallbacks.
- **Internationalization (Arabic default, RTL, plus English).**
  - The language button lives in `ui.js`.
  - Toggling it sets `<html lang dir>` and dispatches a `genesis:lang` event that every UI listens to.
  - Elements use attributes that map to dictionaries in each UI file:
    - `data-i18n` (Herd and global)
    - `data-o18n` (Origins)
    - `data-c18n` (Column)
    - `data-b18n` (Observatory)
  - To add text, add a key to **both** the `ar` and `en` dictionaries of the right file.
- **RTL rules that matter:**
  - Canvas text uses `ctx.direction = 'ltr'` for numbers.
  - Mixed-direction strings are wrapped in `<bdi>` or use `unicode-bidi: plaintext`.
  - Never put punctuation directly against a URL in Arabic text; the punctuation corrupts the link.
- **Water-column UI** (`column-ui.js`):
  - Canvas tank with a pan/zoom camera, minimap and tracers.
  - Colour modes, quality setting, presets, seed input and stir.
  - Sliders for light, turbidity, nutrient, nutrient source, predators, predator ratio and mutation.
  - Organism card with lineage strip, "follow" and "zoom to".
  - Event ticker.
  - Charts: flow, light/nutrient profiles, "river of forms" (size classes over time), arms race (organism diameter vs. gape), genes.
  - It exposes `window.__column = { sim, cam, load(state) }`.
- **Observatory** (`obs-ui.js`):
  - Data sources are tried in order: `window.GENESIS_DATA`, then `data/`, then the raw GitHub URL. All are fetched with `cache: 'no-store'`.
  - Sections:
    - header counters
    - complexity ladder (milestones vs. generations)
    - records
    - "now" panel
    - long-term charts, with x = cumulative generations and era lines: multicellularity, genes, arms race, climate
    - fossil gallery (drawn from the fossil cell coordinates)
    - law cards with verdict pills
    - milestone log
  - The **watch** button streams `state.json.gz` through `DecompressionStream('gzip')`, loads it into the water-column world and switches tab.

---

## 13. Deployment and operations

- **Vercel:**
  - Production deploys on every push to `main`.
  - There is no build step; `index.html` is committed already built. **Always run `python3 build.py` and commit `index.html` after changing `src/`.**
- **GitHub Actions:**
  - Workflow schedules are UTC.
  - Both workflows share concurrency group `genesis-data` with `cancel-in-progress: false`, so a second writer waits. Only one run can be pending; a newer pending run replaces an older pending one.
  - **GitHub disables scheduled workflows in a public repository after 60 days without repository activity.** Any commit to `main` counts as activity. If the schedules get disabled, re-enable them in the Actions tab.
  - Scheduled runs can be delayed or occasionally skipped under GitHub load.
- **Data branch:** `publish-data.sh` does `git init` inside `./data`, creates an orphan commit authored by `genesis-bot`, and force-pushes to `perpetual-data`. It writes a `vercel.json` with `{"git":{"deploymentEnabled":false}}` so Vercel ignores that branch.
- **Continuous 24/7 on a VPS** (for example a Hostinger VPS; shared hosting cannot run long Node processes):
  ```bash
  export GENESIS_PUSH_URL="https://YasirObaid5:<FINE_GRAINED_TOKEN>@github.com/YasirObaid5/genesis-evolution.git"
  nohup bash runner/daemon.sh > genesis.log 2>&1 &
  ```
  - The token needs **Contents: read and write** on this repository only.
  - Disable the `perpetual-world` schedule while the VPS runs, so there is only one writer.
- **Security recommendation:** enable 2FA on the Vercel account. It was skipped at setup.

---

## 14. Known limitations and open problems (read this)

These are ordered by how much they can mislead a conclusion. Items 1–3 preserve the history of defects corrected in model 2; the new assumptions still need scientific validation.

1. **Upward gape macro-mutation bias — corrected in model 2.**
   - Model 1 added +0.25 with probability 0.04 in Column (mean log increment +0.01) and +0.5 with probability 0.05 in Origins (+0.025). Historical gape of 120–173 µm and Red Queen collapse may partly reflect this artifact.
   - Model 2 draws equally likely positive/negative macro steps in both engines. The existing minimum gape still truncates small values; symmetry in log space does not imply symmetry in arithmetic gape. Long predation/Red Queen/chimera experiments must be rerun before scientific claims are renewed.
2. **Prey-size capture window — added to Column in model 2, still uncalibrated.**
   - Model 1 treated any prey below gape as equally capturable. Column now uses `16r²(1−r)²` within `0 < r < 1`, weighted search and failed-attack handling time (section 6.10). Its shape and coefficients are assumptions requiring sensitivity analysis. Origins remains the separate simpler gape-limit model.
3. **Forced predator floor and clipped climate drift — corrected in model 2.**
   - Model 1 retained at least two predators even at five algal cells, and clamped its random climate walk. Era 1 extinction coincided with low resources and predRatio near 4.8–5; that association did not establish a single cause.
   - Column now allows zero/one predators at low N and uses mean reversion plus reflecting bounds (section 9). This reduces those numerical artifacts but does not guarantee survival. No algal spore bank was added.
4. **Concentration depends on a tuned slice thickness.**
   - `HSL = 25` µm and `F0 = 6` pN were tuned so that bioconvection appears.
   - The bioconvection threshold (1–2 M cells/mL) is of the order seen in laboratory suspensions, but it is **not an independent prediction**.
   - The flow is 2-D, which tends to exaggerate plumes compared with 3-D.
5. **Accelerated biology (×400).**
   - Nutrient depletion around cells is much harsher than in reality.
   - The non-swimming period before division is compressed.
   - Ecological timescales are not physical.
   - Many biological costs were tuned so that evolution happens in minutes.
6. **Inbreeding about 30% faster than 1/(2Ne).**
   - The likely cause is **Robertson's effect**: under truncation selection on a heritable trait, relatives are co-selected, which inflates ΔF above the drift expectation. Robertson (1961); see also Wray and Thompson (1990).
   - Overlapping generations and the generation-interval estimate may also contribute.
   - **Test:** the same experiment with *random* sire choice (no co-selection) should give k ≈ 1. If it does, this becomes a new, explanatory law card.
7. **Model geometry and mechanics:**
   - 2-D slice with a free-slip bottom (real sediment is no-slip).
   - No hydrodynamic interactions between organisms beyond the mean flow.
   - Organisms are rigid bodies.
   - No steric interaction between organisms, which stands in for a dilute 3-D suspension.
8. **Small replicate numbers** for every law except heritability. Treat every verdict as provisional.
9. **The old chimeras statement overreached — wording corrected.** The current card tests relatedness only. Historical Price terms did not establish weaker cooperation; that requires a separate test.
10. **Herd genetics:**
    - additive only (no dominance or epistasis)
    - no linkage
    - genomic selection is simulated with a chosen accuracy, not estimated (no GBLUP, no markers)
11. **Origins physics is a toy.** Units are only approximate: 1 step ≈ 30 s and a cell ≈ 5 µm.
12. **Engineering gaps:**
    - Automated Node tests now cover engines, paired comparisons and laws summaries. A CI workflow for these new checks remains pending.
    - No `LICENSE` file. Without one, others may not legally reuse the code; the owner must choose (suggested: MIT for code, CC BY 4.0 for data).
    - No `CITATION.cff`.
    - No pinned DOI.
    - `history.json` grows to about 0.6 MB and is thinned, but `laws-raw.json` grows without bound (slowly).
13. **Resume is not bit-exact** (section 5). Do not rely on it for exact replays; use fresh seeds with matching model/protocol/settings. The runner records model-version boundaries, preserving history and eras. Mixed-version all-time records cannot be treated as homogeneous model-2 evidence.

---

## 15. Decision log and bugs already fixed

This section exists so that solved problems are not reintroduced.

**Herd:**
- **Population collapsed from failed mating.** Fixed by:
  - a pheromone detection range
  - standing heat
  - mutual mate-seeking
  - a male refractory period of 12
- **Selective natural service with a low `sireFrac` fails** (too few sires to cover the herd). The UI warns below 15%. This is realistic, and AI exists to solve it.

**Origins:**
- **The cap was binding, so there was no selection.** Nutrients were reduced.
- **A global public good gave groups no advantage.** Added an enzyme retained by the organism, which grows with size, plus the polymer food that needs it.
- **An adhesion fitness valley stopped the transition.** Added 4% macro-mutations (biologically motivated: losing the cell-separation enzyme, as in snowflake yeast).
- **Predators stuck at the cap with no turnover.** Added a finite lifespan of 2600–4000 steps.

**Water column:**
- **Stokes solve too slow.** Moved to a 64×32 grid with 20×20 modes.
- **No bioconvection.** Set HSL to 25 µm and F0 to 6 pN (the represented concentration had been too low).
- **Predator boom-and-bust and extinction.** Replaced with a ratio-dependent Moran predator population.
- **Bonds stretched at the surface by per-cell clamping.** Organisms are now stopped as rigid bodies, with a guard for coincident cells.
- **Steric artifacts between different organisms.** Steric checks are now within the same organism only.
- **Cells trapped non-swimming in the dark.** They now swim whenever not growing (`!(gr > 0)`).
- **Slow evolution.** Set `acc = 400` and background mortality to 0.1·μ.
- **Added** the `'mixed'` nutrient source, which is now the default.
- **Rejected hypothesis: "multicellularity suppresses bioconvection".** A controlled test with fixed genes showed that the cause was the lower cell numbers under predation.

**Persistence:**
- The old generation metric (born / running-average N) was non-monotonic. It was replaced by an accumulated Σ(1/N) per division, and the perpetual world was restarted fresh.

**Laws:**
- **The bioconvection concentration was off by ×1000.** It is now ·1e12 for µm³ → mL, and the raw data were converted.
- **The breeder law was restricted to phenotypic selection.** Genomic selection became its own law, because R > h²S is *expected* there.
- **The inbreeding verdict was made stricter.** It now uses the through-origin fit plus a direction category.

**Infrastructure:**
- The data lives on a separate force-pushed branch, so the repo never grows.
- The data branch disables Vercel deploys.
- The site reads raw.githubusercontent.com directly, so there is no rebuild for data.

---

## 16. Roadmap

### P0: implementation completed locally; scientific reruns pending
1. **Done:** symmetric log macro-mutation in Column and Origins.
2. **Done:** uncalibrated Column capture window and failed-attack cost, without adding unused configuration.
3. **Done:** mean-reverting climate with reflecting bounds.
4. **Done:** zero/one predators at low N; no forced immigration/spore bank.
5. **Done locally:** built-in Node engine/comparison/observatory tests, `npm test`, model version exports, schema-v1 loading, additive snapshot `modelVersion`, paired controls and notebook, extinction-inclusive/versioned laws summaries. **Remaining:** CI automation, longer controls/replication and parameter sensitivity. Preserve schema compatibility in future changes; resume remains approximate.

### P1: science
6. **More replicates for every law.** Consider lengthening the daily laws run or adding a second daily slot.
7. **Robertson's-effect control.** In `herdInbreeding`, add a random-sire arm. Expect k ≈ 1 under random choice and k > 1 under truncation selection, which would make a new law card.
8. **Red Queen after the P0 fixes.** Record the fraction of collapses and the gapeRatio distribution. Test whether a size refuge is stable once prey-size windows exist.
9. **Bioconvection wavelength.** Measure the dominant plume spacing from the Fourier spectrum of w(x) at mid-depth. Compare it with the linear-stability scaling for gyrotactic suspensions (Pedley, Hill & Kessler 1988; Bees & Hill 1997), and run sensitivity to HSL, F0 and B.
10. **Sensitivity analysis.** Use Latin-hypercube sweeps over the tuned parameters (costs, KB, HSL, acc, predator efficiency). Report which findings survive.
11. **Benthic shift law.** Formalize the observation that sediment-sourced nutrients select for loss of swimming and benthic life (see README) as a law with replicates.

### P2: model extensions toward open-ended complexity
12. **Evolvable gene regulatory network (GRN).** Replace the fixed probabilities (adh, soma) with a small recurrent network per cell.
    - Inputs: position in the organism (number of bonds, distance from the centre of mass), local light and nutrient, the cell's own b, and a signal from neighbours.
    - Outputs: adhesion, soma fate, swim effort and division timing.
    - The genome holds the weights.
    - This allows positional differentiation (germ–soma patterning as in *Volvox*) to evolve rather than be parameterized.
13. **Quasi-3-D or 3-D flow.** At minimum, a no-slip bottom: the sine basis must change, for example to a Chebyshev or Galerkin basis with ψ = ψ_z = 0 at the bottom.
14. **Pairwise hydrodynamic interactions** between organisms (Stokeslet sums) for close encounters.
15. **Real-time biology option.** `acc = 1`, using the perpetual runner's long horizon.
16. **Life-cycle traits in the water column:** single-cell bottleneck vs. fragmentation, as in Origins.

### P3: product and research infrastructure
17. **Legal and citation files.**
    - `LICENSE` (the owner's decision).
    - `CITATION.cff`.
    - Zenodo archiving of releases and of the data branch, to get DOIs.
18. **CLI for parameter sweeps**, for example `node runner/sweep.mjs --world column --param predRatio=1,2,3 --reps 10 --steps 50000 --out sweep.csv`.
19. **CSV and Parquet export** of `history.json` and `laws-raw.json` (still pending). The paired-comparison notebook already exports endpoint CSV and full JSON; these are different datasets.
20. **Model description in the ODD protocol** (Overview, Design concepts, Details; Grimm et al. 2006, 2020), the standard way to document agent-based models for publication.
21. **Observatory improvements:** a downloadable data bundle, per-law raw scatter plots with confidence intervals, and an era comparison view.

---

## 17. How researchers can use Genesis

**What it is good for now:**
- **Teaching quantitative genetics and breeding.** In the Herd, every animal's true breeding value and IBD status are known. Students can see:
  - Galton's regression recovering h²
  - the breeder's equation
  - genetic trends
  - how AI with few sires raises F
  - why genomic selection speeds up response for low-h² traits such as fertility
- **Teaching multilevel selection and major transitions.** In Origins, a live Price-equation split shows selection between and within organisms. Relatedness, chimeras and life cycles can be manipulated.
- **Teaching microswimmer hydrodynamics.** The water column shows Stokes flow, gyrotaxis and bioconvection emerging from weight alone, with a flow on/off control.
- **Validating statistical methods against known truth.** Simulated data come with ground truth (true h², true breeding values, true IBD), so estimators can be stress-tested. Examples:
  - parent–offspring regression under selection
  - Ne estimators
  - ΔF under co-selection
- **Generating hypotheses for experiments.** For example:
  - Does size-selective predation followed by an escalating predator gape lead to collapse of the multicellular refuge?
  - Does a sediment nutrient source favour loss of motility and benthic life?

  These can be designed for real systems: *Chlamydomonas* with rotifer or *Paramecium* predators (Herron et al. 2019), and *Chlorella* with flagellate predators (Boraas et al. 1998).
- **A reproducible, open testbed:**
  - deterministic seeds
  - headless engines with no dependencies
  - JSON data
  - a free perpetual runner that anyone can fork

**How to start:**
1. Fork the repo.
2. Run the engines in Node (section 5).
3. Add an experiment to `EXP` in `runner/laws.mjs`, with a weight and a law block that has an explicit verdict rule.
4. Run it locally, or let your fork's Actions accumulate replicates.
5. Use the published JSON (section 10) for analysis.

**What it is not:**
- It is not calibrated to a specific organism.
- Its numbers are not predictions about nature.
- Any claim must be checked against the limitations in section 14 and, ideally, against laboratory data.

---

## 18. Rules for whoever continues

1. **Engines stay DOM-free and dependency-free.** UI code goes in `*-ui.js`.
2. **All randomness in engines goes through `this.rnd()` / `this.g()`.** Never use `Math.random` in an engine. Determinism is a feature.
3. **When you add state to the water column**, add it to `serialize()` and `fromState()` with a default for old states, or bump `v` and handle migration. The perpetual world must resume across code changes. If a change is incompatible, start a new era on purpose and record why in `meta.eras[].cause`.
4. **After editing `src/`, run `python3 build.py` and commit `index.html`.** Vercel does not build.
5. **Never commit `data/` to `main`.** Data lives only on `perpetual-data`, written by `publish-data.sh`.
6. **Every new law needs:**
   - a replicate experiment that returns a plain JSON object
   - a weight
   - an explicit verdict rule
   - an `ar` and `en` statement
   - honest wording: "consistent with theory in this model"
7. **UI text is bilingual.** Add keys to both `ar` and `en`. Keep numbers left-to-right inside RTL text. Never place punctuation directly next to a URL.
8. **Report negative results and rejected hypotheses** in README and on the law cards. The project's credibility depends on it.
9. **Before claiming a finding,** run controls (flow off, predators off, fixed genes) and enough seeds, and check section 14.

---

## 19. Briefing prompt for the next assistant

Paste this together with this file:

> You are continuing the Genesis project. Read HANDOFF.md before changing anything. The bounded model-2 P0 corrections, paired experiments/notebook and versioned law summaries are implemented locally. Verify current files and deployment independently; do not repeat completed fixes or treat model-1 evidence as current. Next scientific work is longer controlled replication and sensitivity analysis; CI remains pending. GRNs, lineage revival and multitrait breeding remain unimplemented extensions.
>
> Keep engines deterministic and DOM-free. Keep `serialize`/`fromState` backward compatible and document approximate continuation. Run `npm test` and rebuild `index.html` with `python build.py` (UTF-8). Never commit `data/` to `main`. For new scientific findings, run the relevant controls/replicates, report sample counts and model/protocol versions, and update the law statements honestly. Reply to the owner in Arabic.

---

## 20. References

Scientific background used in the design. APA 7th edition, all DOIs checked against Crossref on 2026-10-12.

- Pedley, T. J., & Kessler, J. O. (1992). Hydrodynamic phenomena in suspensions of swimming microorganisms. *Annual Review of Fluid Mechanics, 24*, 313–358. https://doi.org/10.1146/annurev.fl.24.010192.001525
- Pedley, T. J., Hill, N. A., & Kessler, J. O. (1988). The growth of bioconvection patterns in a uniform suspension of gyrotactic micro-organisms. *Journal of Fluid Mechanics, 195*, 223–237. https://doi.org/10.1017/S0022112088002393
- Bees, M. A., & Hill, N. A. (1997). Wavelengths of bioconvection patterns. *Journal of Experimental Biology, 200*(10), 1515–1526. https://doi.org/10.1242/jeb.200.10.1515
- Jeffery, G. B. (1922). The motion of ellipsoidal particles immersed in a viscous fluid. *Proceedings of the Royal Society A, 102*(715), 161–179. https://doi.org/10.1098/rspa.1922.0078
- Ratcliff, W. C., Denison, R. F., Borrello, M., & Travisano, M. (2012). Experimental evolution of multicellularity. *PNAS, 109*(5), 1595–1600. https://doi.org/10.1073/pnas.1115323109
- Bozdag, G. O., et al. (2023). De novo evolution of macroscopic multicellularity. *Nature, 617*, 747–754. https://doi.org/10.1038/s41586-023-06052-1
- Pineau, R. M., et al. (2024). Experimental evolution of multicellularity via cuboidal cell packing in fission yeast. *Evolution Letters, 8*(5), 695–704. https://doi.org/10.1093/evlett/qrae024
- Herron, M. D., et al. (2019). De novo origins of multicellularity in response to predation. *Scientific Reports, 9*, Article 2328. https://doi.org/10.1038/s41598-019-39558-8
- Boraas, M. E., Seale, D. B., & Boxhorn, J. E. (1998). Phagotrophy by a flagellate selects for colonial prey: a possible origin of multicellularity. *Evolutionary Ecology, 12*, 153–164. https://doi.org/10.1023/A:1006527528063
- Price, G. R. (1970). Selection and covariance. *Nature, 227*, 520–521. https://doi.org/10.1038/227520a0
- Falconer, D. S., & Mackay, T. F. C. (1996). *Introduction to Quantitative Genetics* (4th ed.). Longman. ISBN 978-0-582-24302-6
- Robertson, A. (1961). Inbreeding in artificial selection programmes. *Genetical Research, 2*(2), 189–194. https://doi.org/10.1017/S0016672300000690
- Wray, N. R., & Thompson, R. (1990). Prediction of rates of inbreeding in selected populations. *Genetical Research, 55*(1), 41–54. https://doi.org/10.1017/S0016672300025180
- Meuwissen, T. H. E., Hayes, B. J., & Goddard, M. E. (2001). Prediction of total genetic value using genome-wide dense marker maps. *Genetics, 157*(4), 1819–1829. https://doi.org/10.1093/genetics/157.4.1819
- Grimm, V., et al. (2020). The ODD protocol for describing agent-based and other simulation models: a second update to improve clarity, replication, and structural realism. *Journal of Artificial Societies and Social Simulation, 23*(2), 7. https://doi.org/10.18564/jasss.4259

*End of handoff.*
