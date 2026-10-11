/* ===================================================================
   GENESIS · ORIGINS — the evolution of multicellularity
   Cells divide, may stay stuck together, share a secreted public good,
   differentiate into sterile swimming soma, and are hunted by predators
   whose gape evolves. Colonies reproduce by single-cell propagules or by
   fragmentation. Nothing about "being multicellular" is scripted.
   =================================================================== */
(function (root) {
'use strict';

function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

const W = 1200, H = 800, R = 4;
const GS = 10, GX = W / GS, GY = H / GS;           // chemical fields grid
const HS = 12, HX = Math.ceil(W / HS), HY = Math.ceil(H / HS); // contact hash
const GENES = ['adh', 'secr', 'soma', 'single', 'fis'];
const NG = GENES.length;
const ADH = 0, SECR = 1, SOMA = 2, SINGLE = 3, FIS = 4;
const GMIN = [0, 0, 0, 0, 0], GMAX = [1, 1, 0.9, 1, 8];
const MUT_SD = [0.06, 0.05, 0.05, 0.08, 0.35];
const MAXB = 3;                                    // bonds per cell (tree-like, snowflake geometry)
const CLASSES = [1, 4, 16, 64];                    // size class edges: 1 | 2-3 | 4-15 | 16-63 | 64+

class Origins {
  constructor(seed = 11, opts = {}) {
    this.seed = seed;
    this.p = Object.assign({
      predators: false,     // predation on
      aggregation: false,   // cells may bond to strangers on contact (chimeras)
      lifecycle: 'free',    // free | single | chunk
      mut: 0.08,            // per-gene mutation probability per division
      nutrient: 1.0,        // nutrient supply multiplier
      patchSpeed: 1.0,      // how fast nutrient patches drift
      polymer: 1.0,
      secrCost: 0.0042,     // energy cost of secreting the enzyme         // supply of complex food that needs the secreted enzyme
      cap: 2600,            // hard cap on cells
    }, opts);
    this.reset();
  }

  g() { let u = 0; while (u === 0) u = this.rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * this.rnd()); }

  reset() {
    this.rnd = mulberry32(this.seed);
    this.t = 0;
    this.nextId = 1; this.nextCol = 1; this.nextGeno = 1;
    this.N = new Float32Array(GX * GY);
    this.E = new Float32Array(GX * GY);
    this.P = new Float32Array(GX * GY);   // complex polymer: only digestible with secreted enzyme
    this.P.fill(0.5);
    this.tmp = new Float32Array(GX * GY);
    for (let i = 0; i < this.N.length; i++) this.N[i] = 0.25;
    this.patches = [];
    for (let i = 0; i < 5; i++) {
      const a = this.rnd() * 6.283;
      this.patches.push({ x: 100 + this.rnd() * (W - 200), y: 100 + this.rnd() * (H - 200), vx: Math.cos(a), vy: Math.sin(a), s: 45 + this.rnd() * 35, rate: 0.0028 + this.rnd() * 0.0016 });
    }
    this.cells = [];
    this.colonies = new Map();
    this.archive = new Map();   // light records of every colony, for lineage strips
    this.preds = [];
    this.gens = 0; this.nAvg = 320;
    this.hash = new Array(HX * HY); for (let i = 0; i < this.hash.length; i++) this.hash[i] = [];
    this.stamp = 1; this.stack = [];
    this.pairs = [];          // [log2 parent repro size, log2 child repro size, aggregated?]
    this.price = [];          // multilevel selection partitions
    this.hist = [];
    this.events = [];
    this.eaten = 0; this.born = 0; this.merges = 0; this.predImmigr = 0;
    this.milestones = {};
    for (let i = 0; i < 320; i++) {
      const gn = new Float32Array(NG);
      gn[ADH] = Math.max(0, 0.04 + this.g() * 0.02);
      gn[SECR] = Math.min(1, Math.max(0, 0.35 + this.g() * 0.1));
      gn[SOMA] = Math.max(0, 0.02 + this.g() * 0.01);
      gn[SINGLE] = Math.min(1, Math.max(0, 0.5 + this.g() * 0.1));
      gn[FIS] = 2.5 + this.g() * 0.3;
      const c = this.makeCell(30 + this.rnd() * (W - 60), 30 + this.rnd() * (H - 60), gn, 0.4 + this.rnd() * 0.5, 0, this.nextGeno++);
      c.age = Math.floor(this.rnd() * 800);
      this.newColony(null, [c]);
      this.cells.push(c);
    }
    if (this.p.predators) this.seedPredators(6, 1.6);
    this.snapshot();
    this.stats = this.computeStats();
    this.log('start', {});
  }

  log(type, data) { this.events.push({ t: this.t, type, data }); if (this.events.length > 60) this.events.shift(); }

  makeCell(x, y, genes, e, type, geno) {
    return {
      id: this.nextId++, x, y, vx: 0, vy: 0, e, age: 0, maxAge: 1100 + this.g() * 220,
      g: genes, type, b: [], col: null, ci: -1, anc: -1, geno, alive: true, vis: 0, born: this.t,
    };
  }

  newColony(parent, cells) {
    const col = {
      id: this.nextCol++, parent: parent ? parent.id : 0, gen: parent ? parent.gen + 1 : 0, born: this.t,
      cells: [], alive: true, reproSize: null, parentRepro: parent ? parent.reproSize : null,
      hue: parent ? (parent.hue + this.g() * 9 + 360) % 360 : this.rnd() * 360,
      kids: 0, peak: 0, gm: new Float32Array(NG), sum: new Float32Array(NG), cx: 0, cy: 0, rad: R, chimera: false, aggr: false,
    };
    for (const c of cells) { c.col = col; c.ci = col.cells.length; col.cells.push(c); }
    col.peak = cells.length;
    this.updateGenes(col);
    this.colonies.set(col.id, col);
    col.rec = { id: col.id, parent: col.parent, gen: col.gen, born: this.t, died: null, peak: col.peak, hue: col.hue, repro: null, chimera: false };
    this.archive.set(col.id, col.rec);
    if (this.archive.size > 40000) { const it = this.archive.keys(); for (let i = 0; i < 5000; i++) this.archive.delete(it.next().value); }
    return col;
  }

  updateGenes(col) {
    const sm = col.sum; sm.fill(0);
    const n = col.cells.length; if (!n) { col.gm.fill(0); return; }
    for (const c of col.cells) for (let k = 0; k < NG; k++) sm[k] += c.g[k];
    for (let k = 0; k < NG; k++) col.gm[k] = sm[k] / n;
  }
  joinGenes(col, c) {
    const n = col.cells.length;
    for (let k = 0; k < NG; k++) { col.sum[k] += c.g[k]; col.gm[k] = col.sum[k] / n; }
  }

  colonyReproduced(col, sizeBefore) {
    col.kids++;
    if (col.reproSize === null) {
      col.reproSize = sizeBefore;
      if (col.parentRepro !== null) {
        this.pairs.push([Math.log2(col.parentRepro), Math.log2(sizeBefore), col.chimera]);
        if (this.pairs.length > 900) this.pairs.shift();
      }
    }
  }

  /* ---------- bond graph ---------- */
  bfs(start, stamp, out) {
    const st = this.stack; st.length = 0; st.push(start); start.vis = stamp;
    while (st.length) {
      const c = st.pop(); out.push(c);
      for (const n of c.b) if (n.vis !== stamp && n.alive) { n.vis = stamp; st.push(n); }
    }
    return out;
  }
  unbond(a, b) {
    let i = a.b.indexOf(b); if (i >= 0) a.b.splice(i, 1);
    i = b.b.indexOf(a); if (i >= 0) b.b.splice(i, 1);
  }
  /* recompute connected components of a colony after deaths/breaks; extra components become offspring colonies */
  resolve(col) {
    if (!col.alive) return;
    const before = col.cells.length;
    const living = col.cells.filter(c => c.alive);
    if (!living.length) { this.retire(col); return; }
    const stamp = ++this.stamp;
    const comps = [];
    for (const c of living) if (c.vis !== stamp) comps.push(this.bfs(c, stamp, []));
    comps.sort((a, b) => b.length - a.length);
    col.cells = comps[0];
    for (let i = 0; i < col.cells.length; i++) { col.cells[i].ci = i; col.cells[i].col = col; }
    if (comps.length > 1) {
      this.colonyReproduced(col, Math.max(before, living.length));
      for (let k = 1; k < comps.length; k++) {
        const child = this.newColony(col, comps[k]);
        child.chimera = col.chimera;
      }
    }
    this.updateGenes(col);
  }

  retire(col) {
    col.alive = false; this.colonies.delete(col.id);
    if (col.rec) { col.rec.died = this.t; col.rec.peak = col.peak; col.rec.repro = col.reproSize; col.rec.chimera = col.chimera; }
  }

  fission(col) {
    let mode = this.p.lifecycle;
    if (mode === 'free') mode = this.rnd() < col.gm[SINGLE] ? 'single' : 'chunk';
    const cs = col.cells;
    if (mode === 'single') {
      // release one germ cell from the periphery: a single-cell bottleneck
      let pick = null;
      for (let tries = 0; tries < 12 && !pick; tries++) {
        const c = cs[(this.rnd() * cs.length) | 0];
        if (c.type === 0 && c.b.length === 1) pick = c;
      }
      if (!pick) for (const c of cs) if (c.type === 0 && c.b.length <= 1) { pick = c; break; }
      if (!pick) mode = 'chunk';
      else { for (const n of pick.b.slice()) this.unbond(pick, n); }
    }
    if (mode === 'chunk') {
      // fracture a random bond: binary fragmentation into two multicellular pieces
      const c = cs[(this.rnd() * cs.length) | 0];
      if (!c.b.length) return;
      this.unbond(c, c.b[(this.rnd() * c.b.length) | 0]);
    }
    this.resolve(col);
  }

  mutate(src) {
    const g = new Float32Array(src);
    let mutated = false;
    for (let k = 0; k < NG; k++) {
      if (this.rnd() < this.p.mut) {
        // most mutations nudge a gene; a few are large-effect (e.g. losing the cell-separation enzyme)
        if (this.rnd() < 0.04) g[k] = GMIN[k] + this.rnd() * (GMAX[k] - GMIN[k]);
        else g[k] = Math.min(GMAX[k], Math.max(GMIN[k], g[k] + this.g() * MUT_SD[k]));
        mutated = true;
      }
    }
    return { g, mutated };
  }

  seedPredators(n, gape) {
    for (let i = 0; i < n; i++) this.preds.push(this.makePred(this.rnd() * W, this.rnd() * H, gape * Math.exp(this.g() * 0.15), 1.5));
  }
  makePred(x, y, gape, e) {
    return { id: this.nextId++, x, y, vx: 0, vy: 0, e, gape: Math.max(1, gape), age: 0, maxAge: 2600 + this.rnd() * 1400, digest: 0, phase: this.rnd() * 6.28, target: null, flash: 0, meals: 0 };
  }
  predRadius(p) { return 9 + 2.2 * Math.sqrt(p.gape); }

  /* ---------- main step ---------- */
  step() {
    this.t++;
    const p = this.p, N = this.N, E = this.E;
    const cells = this.cells;

    /* --- nutrient patches drift and inject --- */
    for (const pt of this.patches) {
      const a = Math.atan2(pt.vy, pt.vx) + this.g() * 0.08;
      const sp = 0.35 * p.patchSpeed;
      pt.vx = Math.cos(a) * sp; pt.vy = Math.sin(a) * sp;
      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 60 || pt.x > W - 60) { pt.vx = -pt.vx; pt.x = Math.min(W - 60, Math.max(60, pt.x)); }
      if (pt.y < 60 || pt.y > H - 60) { pt.vy = -pt.vy; pt.y = Math.min(H - 60, Math.max(60, pt.y)); }
      const gx = pt.x / GS, gy = pt.y / GS, s = pt.s / GS, rr = Math.ceil(2 * s);
      const inv = 1 / (2 * s * s), amp = pt.rate * p.nutrient;
      for (let y = Math.max(0, (gy - rr) | 0); y < Math.min(GY, gy + rr); y++)
        for (let x = Math.max(0, (gx - rr) | 0); x < Math.min(GX, gx + rr); x++) {
          const dx = x + 0.5 - gx, dy = y + 0.5 - gy;
          N[y * GX + x] += amp * Math.exp(-(dx * dx + dy * dy) * inv);
        }
    }
    /* --- diffusion: nutrient slow, enzyme fast + decay --- */
    if (this.t % 3 === 0) this.diffuse(N, 0.12, 0.0015, 0.00012 * p.nutrient * 3);
    if (this.t % 2 === 0) this.diffuse(E, 0.18, 0.16, 0);
    if (this.t % 3 === 1) this.diffuse(this.P, 0.08, 0, 0.00025 * p.polymer * 3);

    /* --- contact hash --- */
    for (const h of this.hash) h.length = 0;
    for (const c of cells) {
      const hx = Math.min(HX - 1, (c.x / HS) | 0), hy = Math.min(HY - 1, (c.y / HS) | 0);
      this.hash[hy * HX + hx].push(c);
    }

    /* --- physics: repulsion, adhesion on contact (aggregation) --- */
    const d2min = 4 * R * R;
    for (const c of cells) {
      const hx = Math.min(HX - 1, (c.x / HS) | 0), hy = Math.min(HY - 1, (c.y / HS) | 0);
      for (let dy = -1; dy <= 1; dy++) {
        const yy = hy + dy; if (yy < 0 || yy >= HY) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = hx + dx; if (xx < 0 || xx >= HX) continue;
          const bucket = this.hash[yy * HX + xx];
          for (let k = 0; k < bucket.length; k++) {
            const o = bucket[k];
            if (o.id <= c.id) continue;
            const ex = o.x - c.x, ey = o.y - c.y, d2 = ex * ex + ey * ey;
            if (d2 >= d2min || d2 < 1e-6) continue;
            const d = Math.sqrt(d2), f = 0.28 * (2 * R - d) / d;
            c.vx -= ex * f; c.vy -= ey * f; o.vx += ex * f; o.vy += ey * f;
            if (p.aggregation && c.col !== o.col && c.b.length < MAXB && o.b.length < MAXB &&
                this.rnd() < 0.06 * c.g[ADH] * o.g[ADH]) this.merge(c, o);
          }
        }
      }
    }
    /* --- bonds as springs --- */
    for (const c of cells) {
      for (const o of c.b) {
        if (o.id <= c.id) continue;
        const ex = o.x - c.x, ey = o.y - c.y, d = Math.sqrt(ex * ex + ey * ey) || 1e-3;
        const f = 0.22 * (d - 2 * R) / d;
        c.vx += ex * f; c.vy += ey * f; o.vx -= ex * f; o.vy -= ey * f;
      }
    }

    /* --- metabolism, chemotaxis, division --- */
    const deaths = [];
    const births = [];
    const pop = cells.length;
    const P = this.P;
    for (const c of cells) {
      if (!c.alive) continue;
      c.age++;
      const gx = Math.min(GX - 1, (c.x / GS) | 0), gy = Math.min(GY - 1, (c.y / GS) | 0), gi = gy * GX + gx;
      // chemotaxis up the nutrient gradient; soma cells are the strong swimmers
      const gxp = N[gy * GX + Math.min(GX - 1, gx + 1)] - N[gy * GX + Math.max(0, gx - 1)];
      const gyp = N[Math.min(GY - 1, gy + 1) * GX + gx] - N[Math.max(0, gy - 1) * GX + gx];
      const gm = Math.sqrt(gxp * gxp + gyp * gyp) + 0.01;
      const m = c.type === 1 ? 0.13 : 0.025;
      c.vx += m * gxp / gm + this.g() * 0.06;
      c.vy += m * gyp / gm + this.g() * 0.06;
      // uptake, boosted by the shared enzyme around the cell
      // the enzyme a colony keeps for itself grows with its size: a lone cell loses its own to diffusion
      const cn = c.col.cells.length, rho = (cn - 1) / (cn + 4);
      const nl = N[gi];
      const u = 0.02 * nl / (nl + 0.25);
      N[gi] = Math.max(0, nl - u * 0.75);
      c.e += u;
      // complex food: digested only by enzyme the cell experiences (diffuse field + what its colony retains)
      const X = E[gi] + 0.8 * rho * c.col.gm[SECR], pl = P[gi];
      const up = 0.024 * pl / (pl + 0.3) * X / (X + 0.15);
      P[gi] = Math.max(0, pl - up * 0.9);
      c.e += up * 0.8;
      // secretion: a costly public good
      E[gi] += 0.02 * c.g[SECR];
      let cost = 0.0042 + p.secrCost * c.g[SECR] + 0.0005 * c.b.length;
      if (c.type === 1) cost += 0.0025;
      c.e -= cost;
      if (c.e <= 0 || c.age > c.maxAge) { c.alive = false; deaths.push(c); continue; }
      if (c.type === 0 && c.e >= 0.6 && pop + births.length < p.cap) births.push(c);
    }

    /* --- integrate --- */
    for (const c of cells) {
      if (!c.alive) continue;
      c.vx *= 0.72; c.vy *= 0.72;
      c.x += c.vx; c.y += c.vy;
      if (c.x < R) { c.x = R; c.vx = Math.abs(c.vx); } else if (c.x > W - R) { c.x = W - R; c.vx = -Math.abs(c.vx); }
      if (c.y < R) { c.y = R; c.vy = Math.abs(c.vy); } else if (c.y > H - R) { c.y = H - R; c.vy = -Math.abs(c.vy); }
    }

    /* --- divisions --- */
    for (const m of births) {
      if (!m.alive) continue;
      const { g, mutated } = this.mutate(m.g);
      const a = this.rnd() * 6.283;
      const d = this.makeCell(m.x + Math.cos(a) * 2 * R, m.y + Math.sin(a) * 2 * R, g, m.e * 0.5 - 0.02, 0, mutated ? this.nextGeno++ : m.geno);
      m.e *= 0.5;
      d.anc = m.anc;
      d.x = Math.min(W - R, Math.max(R, d.x)); d.y = Math.min(H - R, Math.max(R, d.y));
      this.born++;
      const col = m.col;
      if (m.b.length < MAXB && this.rnd() < m.g[ADH]) {
        // daughter stays attached: the group grows clonally
        d.b.push(m); m.b.push(d);
        if (this.rnd() < m.g[SOMA]) d.type = 1;
        d.col = col; d.ci = col.cells.length; col.cells.push(d);
        this.joinGenes(col, d);
        if (col.cells.length > col.peak) col.peak = col.cells.length;
        cells.push(d);
        const maxSize = Math.pow(2, col.gm[FIS]);
        if (col.cells.length > Math.max(2, maxSize)) this.fission(col);
      } else {
        // daughter swims away: a new single-cell individual
        cells.push(d);
        this.colonyReproduced(col, col.cells.length);
        this.newColony(col, [d]);
      }
    }

    /* --- predators --- */
    if (p.predators) this.stepPredators(deaths);
    else if (this.preds.length) this.preds.length = 0;

    /* --- deaths: break bonds, fragment colonies --- */
    if (deaths.length) {
      const dirty = new Set();
      for (const c of deaths) {
        for (const n of c.b) { const i = n.b.indexOf(c); if (i >= 0) n.b.splice(i, 1); }
        c.b.length = 0;
        dirty.add(c.col);
      }
      for (const col of dirty) this.resolve(col);
      this.cells = cells.filter(c => c.alive);
    }

    // cell generations elapsed ~ births per average population
    this.nAvg += (cells.length - this.nAvg) * 0.001;
    this.gens = this.born / Math.max(50, this.nAvg);
    if (this.t % 30 === 0) {
      this.stats = this.computeStats();
      if (this.t % 60 === 0) this.pushHist();
    }
    if (this.t % 900 === 0) this.snapshot();
  }

  diffuse(F, D, decay, input) {
    const T = this.tmp;
    for (let y = 0; y < GY; y++) {
      const y0 = y > 0 ? y - 1 : y, y1 = y < GY - 1 ? y + 1 : y;
      for (let x = 0; x < GX; x++) {
        const x0 = x > 0 ? x - 1 : x, x1 = x < GX - 1 ? x + 1 : x;
        const i = y * GX + x, v = F[i];
        const lap = F[y * GX + x0] + F[y * GX + x1] + F[y0 * GX + x] + F[y1 * GX + x] - 4 * v;
        T[i] = Math.max(0, v + D * lap - decay * v + input);
      }
    }
    F.set(T);
  }

  merge(a, b) {
    // aggregative bonding: two different colonies fuse into a chimera
    let A = a.col, B = b.col;
    a.b.push(b); b.b.push(a);
    if (A.cells.length < B.cells.length) { const t = A; A = B; B = t; }
    for (const c of B.cells) { c.col = A; c.ci = A.cells.length; A.cells.push(c); }
    this.retire(B); if (B.rec) B.rec.mergedInto = A.id;
    A.chimera = true; A.aggr = true;
    if (A.cells.length > A.peak) A.peak = A.cells.length;
    this.updateGenes(A);
    this.merges++;
    const maxSize = Math.pow(2, A.gm[FIS]);
    if (A.cells.length > Math.max(2, maxSize) * 1.5) this.fission(A);
  }

  stepPredators(deaths) {
    const t = this.t;
    if (t % 5 === 0) for (const col of this.colonies.values()) {
      let sx = 0, sy = 0; const cs = col.cells;
      for (const c of cs) { sx += c.x; sy += c.y; }
      col.cx = sx / cs.length; col.cy = sy / cs.length;
      col.rad = R * (1 + Math.sqrt(cs.length) * 1.1);
    }
    const born = [];
    for (const pr of this.preds) {
      pr.age++; pr.phase += 0.05;
      if (pr.flash > 0) pr.flash--;
      const rad = this.predRadius(pr);
      const speed = 1.25 / (1 + 0.06 * Math.sqrt(pr.gape));
      if (pr.digest > 0) pr.digest--;
      else {
        if (t % 6 === 0 || !pr.target || !pr.target.alive) {
          let best = null, bs = 0;
          for (const col of this.colonies.values()) {
            const n = col.cells.length;
            if (n > pr.gape) continue;
            const dx = col.cx - pr.x, dy = col.cy - pr.y, d2 = dx * dx + dy * dy;
            if (d2 > 200 * 200) continue;
            const s = n / (d2 + 400);
            if (s > bs) { bs = s; best = col; }
          }
          pr.target = best;
        }
        const tg = pr.target;
        if (tg && tg.alive && tg.cells.length <= pr.gape) {
          const dx = tg.cx - pr.x, dy = tg.cy - pr.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
          pr.vx += dx / d * 0.18; pr.vy += dy / d * 0.18;
          if (d < rad + tg.rad * 0.4) {
            // engulf the whole colony
            const n = tg.cells.length;
            tg.eaten = true; if (tg.rec) tg.rec.cause = 'eaten';
            for (const c of tg.cells) if (c.alive) { c.alive = false; deaths.push(c); }
            pr.e += n * 0.25; pr.digest = 12 + n * 1.5; pr.flash = 18; pr.meals++;
            this.eaten += n; pr.target = null;
          }
        } else {
          pr.vx += this.g() * 0.12; pr.vy += this.g() * 0.12;
        }
      }
      const v = Math.sqrt(pr.vx * pr.vx + pr.vy * pr.vy);
      if (v > speed) { pr.vx *= speed / v; pr.vy *= speed / v; }
      pr.x += pr.vx; pr.y += pr.vy;
      if (pr.x < rad) { pr.x = rad; pr.vx = Math.abs(pr.vx); } else if (pr.x > W - rad) { pr.x = W - rad; pr.vx = -Math.abs(pr.vx); }
      if (pr.y < rad) { pr.y = rad; pr.vy = Math.abs(pr.vy); } else if (pr.y > H - rad) { pr.y = H - rad; pr.vy = -Math.abs(pr.vy); }
      pr.e -= 0.0026 * (1 + 0.03 * pr.gape);
      if (pr.e > 2.6 && this.preds.length + born.length < 60) {
        pr.e /= 2;
        born.push(this.makePred(pr.x + this.g() * 8, pr.y + this.g() * 8, pr.gape * Math.exp(this.g() * 0.15 + (this.rnd() < 0.05 ? 0.5 : 0)), pr.e));
      }
    }
    this.preds = this.preds.filter(pr => pr.e > 0 && pr.age < pr.maxAge).concat(born);
    if (this.preds.length === 0) {
      if (!this.predGone) { this.predGone = t; this.log('predExtinct', {}); }
      if (t - this.predGone > 600) {
        const sizes = this.stats ? this.stats.meanSize : 2;
        this.seedPredators(3, Math.max(1.5, sizes * 0.6)); this.predGone = 0; this.predImmigr++;
        this.log('predImmigr', {});
      }
    } else this.predGone = 0;
  }

  /* ---------- multilevel selection: Price equation partition ---------- */
  snapshot() {
    const prev = this.snap;
    if (prev && prev.n > 20) {
      const w = new Float32Array(prev.n);
      for (const c of this.cells) if (c.anc >= 0 && c.anc < prev.n) w[c.anc]++;
      const res = {};
      for (const [key, gi] of [['secr', SECR], ['adh', ADH]]) {
        const z = prev.z[key];
        let wb = 0, zb = 0;
        for (let i = 0; i < prev.n; i++) { wb += w[i]; zb += z[i]; }
        wb /= prev.n; zb /= prev.n;
        if (wb <= 0) continue;
        // group means
        const G = new Map();
        for (let i = 0; i < prev.n; i++) {
          let o = G.get(prev.grp[i]); if (!o) { o = { n: 0, w: 0, z: 0, idx: [] }; G.set(prev.grp[i], o); }
          o.n++; o.w += w[i]; o.z += z[i]; o.idx.push(i);
        }
        let between = 0, within = 0, vb = 0, vt = 0;
        for (const o of G.values()) {
          const W_ = o.w / o.n, Z_ = o.z / o.n;
          between += o.n * (W_ - wb) * (Z_ - zb);
          vb += o.n * (Z_ - zb) * (Z_ - zb);
          for (const i of o.idx) { within += (w[i] - W_) * (z[i] - Z_); vt += (z[i] - zb) * (z[i] - zb); }
        }
        vt += 0; // vt holds within-group SS; total = vb + vt
        between /= prev.n * wb; within /= prev.n * wb;
        // realized change in the population mean
        let zn = 0, nn = 0;
        for (const c of this.cells) { zn += c.g[gi]; nn++; }
        const dz = nn ? zn / nn - zb : 0;
        res[key] = { between, within, total: between + within, trans: dz - (between + within), dz, r: (vb + vt) > 0 ? vb / (vb + vt) : 0 };
      }
      if (res.secr) { this.price.push({ t: this.t, ...res }); if (this.price.length > 160) this.price.shift(); }
    }
    // new snapshot
    const n = this.cells.length;
    const snap = { n, z: { secr: new Float32Array(n), adh: new Float32Array(n) }, grp: new Int32Array(n) };
    this.cells.forEach((c, i) => { c.anc = i; snap.z.secr[i] = c.g[SECR]; snap.z.adh[i] = c.g[ADH]; snap.grp[i] = c.col.id; });
    this.snap = snap;
  }

  /* ---------- statistics ---------- */
  computeStats() {
    const n = this.cells.length;
    const mg = new Float32Array(NG);
    const cls = new Float32Array(CLASSES.length + 1);
    let inGroups = 0, ss = 0, maxSize = 0, somaN = 0, bondedN = 0, cols = 0, multiCols = 0, chimeraCells = 0, maxGen = 0;
    for (const c of this.cells) { for (let k = 0; k < NG; k++) mg[k] += c.g[k]; if (c.b.length) { bondedN++; if (c.type === 1) somaN++; } }
    if (n) for (let k = 0; k < NG; k++) mg[k] /= n;
    let vb = 0, vt = 0;
    for (const col of this.colonies.values()) {
      const s = col.cells.length; if (!s) continue;
      cols++; if (s > 1) { multiCols++; inGroups += s; }
      if (col.chimera && s > 1) chimeraCells += s;
      ss += s * s; if (s > maxSize) maxSize = s;
      if (col.gen > maxGen) maxGen = col.gen;
      // class index: 1 -> 0, 2-3 -> 1, 4-15 -> 2, 16-63 -> 3, 64+ -> 4
      const k = s === 1 ? 0 : s < 4 ? 1 : s < 16 ? 2 : s < 64 ? 3 : 4;
      cls[k] += s;
      this.updateGenes(col);
    }
    // relatedness among cells living in multicellular colonies: share of secretion variance that lies between colonies
    let mm = 0, mn = 0;
    for (const col of this.colonies.values()) if (col.cells.length > 1) { mm += col.sum[SECR]; mn += col.cells.length; }
    if (mn > 1) {
      mm /= mn;
      for (const col of this.colonies.values()) {
        const s = col.cells.length; if (s < 2) continue;
        const d = col.gm[SECR] - mm; vb += s * d * d;
        for (const c of col.cells) { const e = c.g[SECR] - mm; vt += e * e; }
      }
    }
    if (n) for (let k = 0; k < cls.length; k++) cls[k] /= n;
    let pg = 0; for (const p of this.preds) pg += p.gape;
    const st = {
      n, cols, multiCols, inGroups: n ? inGroups / n : 0, meanSize: n ? ss / n : 0, maxSize, mg, cls,
      soma: bondedN ? somaN / bondedN : 0, preds: this.preds.length, gape: this.preds.length ? pg / this.preds.length : 0,
      rel: vt > 0 ? vb / vt : 0, chimera: n ? chimeraCells / n : 0, maxGen,
    };
    this.checkMilestones(st);
    return st;
  }

  checkMilestones(st) {
    const M = this.milestones;
    const hit = (k, cond, data) => { if (!M[k] && cond) { M[k] = this.t; this.log(k, data || {}); } };
    hit('ms_first16', st.maxSize >= 16, { s: st.maxSize });
    hit('ms_half', st.inGroups >= 0.5);
    hit('ms_64', st.maxSize >= 64, { s: st.maxSize });
    hit('ms_soma', st.soma >= 0.15);
    hit('ms_majority', st.inGroups >= 0.9);
    hit('ms_256', st.maxSize >= 256, { s: st.maxSize });
    hit('ms_gape4', st.preds > 0 && st.gape >= 4);
    hit('ms_gape8', st.preds > 0 && st.gape >= 8);
  }

  pushHist() {
    const s = this.stats;
    const last = this.price.length ? this.price[this.price.length - 1] : null;
    this.hist.push({ t: this.t, n: s.n, cls: Array.from(s.cls), mg: Array.from(s.mg), meanSize: s.meanSize, maxSize: s.maxSize, soma: s.soma, preds: s.preds, gape: s.gape, rel: s.rel, inGroups: s.inGroups, chimera: s.chimera });
    if (this.hist.length > 900) {
      const keep = [];
      for (let i = 0; i < this.hist.length; i++) if (i >= 450 || i % 2 === 0) keep.push(this.hist[i]);
      this.hist = keep;
    }
  }

  groupGalton() {
    const pts = this.pairs.slice(-500);
    let sx = 0, sy = 0, sxx = 0, sxy = 0;
    for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
    const n = pts.length;
    let slope = NaN, icpt = 0;
    if (n > 10) {
      const mx = sx / n, my = sy / n, vx = sxx / n - mx * mx;
      if (vx > 0.02) { slope = (sxy / n - mx * my) / vx; icpt = my - slope * mx; }
    }
    return { pts, n, slope, icpt };
  }

  /* ---------- interaction ---------- */
  colonyAt(x, y, r = 14) {
    let best = null, bd = r * r;
    for (const c of this.cells) {
      const dx = c.x - x, dy = c.y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = c; }
    }
    return best ? best.col : null;
  }
  colonyInfo(col) {
    const cs = col.cells, n = cs.length;
    const counts = new Map(); let soma = 0;
    for (const c of cs) { counts.set(c.geno, (counts.get(c.geno) || 0) + 1); if (c.type === 1) soma++; }
    let modal = 0; for (const v of counts.values()) modal = Math.max(modal, v);
    return { n, soma: n ? soma / n : 0, clonality: n ? modal / n : 0, genotypes: counts.size, age: this.t - col.born };
  }
  setParam(k, v) {
    const old = this.p[k];
    this.p[k] = v;
    if (k === 'predators' && v && !old) { this.seedPredators(6, Math.max(1.6, (this.stats ? this.stats.meanSize : 2) * 0.5)); this.log('predOn', {}); }
    if (k === 'predators' && !v && old) this.log('predOff', {});
    if (k === 'aggregation' && v !== old) this.log(v ? 'aggrOn' : 'aggrOff', {});
    if (k === 'lifecycle' && v !== old) this.log('life_' + v, {});
  }
  bigPredators() {
    const g = Math.max(3, (this.stats ? this.stats.meanSize : 2) * 1.6);
    if (!this.p.predators) this.p.predators = true;
    this.seedPredators(8, g);
    this.log('bigPred', { g: Math.round(g) });
  }
  lineage(col, max = 40) {
    const out = []; let id = col.id;
    while (id && out.length < max) {
      const r = this.archive.get(id); if (!r) break;
      const live = this.colonies.get(id); if (live) { r.peak = live.peak; r.repro = live.reproSize; }
      out.push(r); id = r.parent;
    }
    return out;
  }
  plague() {
    // a cull that kills 85% of cells at random, sparing nothing in particular
    for (const c of this.cells) if (this.rnd() < 0.85) c.alive = false;
    const dirty = new Set();
    for (const c of this.cells) if (!c.alive) {
      for (const n of c.b) { const i = n.b.indexOf(c); if (i >= 0) n.b.splice(i, 1); }
      c.b.length = 0; dirty.add(c.col);
    }
    for (const col of dirty) this.resolve(col);
    this.cells = this.cells.filter(c => c.alive);
    this.log('plague', {});
    this.stats = this.computeStats();
  }
}

const API = { Origins, GENES, NG, ADH, SECR, SOMA, SINGLE, FIS, W, H, R, GX, GY, GS, CLASSES };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.GenesisOrigins = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
