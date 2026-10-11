/* ===================================================================
   GENESIS — simulation core
   Diploid polygenic genetics + reproductive physiology + evolving brains
   Pure logic, no DOM. Works in browser and Node.
   =================================================================== */
(function (root) {
'use strict';

/* ---------- seeded RNG ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/* ---------- constants ---------- */
const TRAITS = ['size', 'speed', 'vision', 'heat', 'fert', 'thrift'];
const NT = TRAITS.length;
const LOCI = 8;                    // loci per trait
const NLOC = NT * LOCI;            // 48 loci
const H2_FOUNDER = [0.45, 0.35, 0.30, 0.30, 0.10, 0.25]; // founder heritabilities
const SA = H2_FOUNDER.map(h => Math.sqrt(h / (2 * LOCI)));  // allele SD
const SE = H2_FOUNDER.map(h => Math.sqrt(1 - h));           // environmental SD

const WORLD_W = 1200, WORLD_H = 800;
const CELL = 20, GW = WORLD_W / CELL, GH = WORLD_H / CELL;
const HC = 50, HW = WORLD_W / HC, HH = WORLD_H / HC;         // spatial hash
const SEASON = 3000;                 // ticks per year
const PUBERTY = 320;
const GESTATION = 380;
const ESTRUS_LEN = 40;
const PHEROMONE = 3.2;              // estrus detectable at vision × this
const POP_CAP = 1400;

/* brain: 9 inputs -> 6 hidden (tanh) -> 2 outputs */
const NI = 9, NH = 6, NO = 2;
const NW = NI * NH + (NH + 1) * NO;   // 54 + 14 = 68

function brainPrior() {
  const w = new Float32Array(NW);
  const W1 = (h, i) => h * NI + i;               // hidden h, input i
  const W2 = (o, h) => NI * NH + o * (NH + 1) + h; // output o, hidden h (h=NH is bias)
  // inputs: 0 foodL 1 foodR 2 foodHere 3 energy 4 mateSin 5 mateCos 6 heat 7 osc 8 bias
  w[W1(0, 1)] = 3; w[W1(0, 0)] = -3;            // h0: right-left food gradient
  w[W1(1, 4)] = 2.5;                             // h1: turn toward mate
  w[W1(2, 2)] = -4; w[W1(2, 8)] = 1.2;           // h2: move when nothing to eat here
  w[W1(2, 4)] = 0; w[W1(2, 5)] = 0.8;            // and when chasing a mate
  w[W1(3, 7)] = 1.5;                             // h3: wandering oscillator
  w[W1(4, 3)] = -2; w[W1(4, 8)] = 1;             // h4: hunger
  w[W2(0, 0)] = 1.6; w[W2(0, 1)] = 1.8; w[W2(0, 3)] = 0.35;
  w[W2(1, 2)] = 2.2; w[W2(1, 4)] = 0.6; w[W2(1, NH)] = -0.2;
  return w;
}
const PRIOR = brainPrior();

/* ---------- simulation ---------- */
class Sim {
  constructor(seed = 7, opts = {}) {
    this.seed = seed;
    this.rnd = mulberry32(seed);
    this.p = Object.assign({
      temp: 30,          // mean temperature °C
      food: 1.0,         // food richness multiplier
      mut: 0.003,        // mutation rate per allele per meiosis
      inbDep: true,      // inbreeding depression
      mode: 'natural',   // natural | selective | ai
      target: 0,         // trait index for selection
      dir: 1,            // +1 up, -1 down
      criterion: 'pheno',// pheno | genomic
      accuracy: 0.7,     // genomic accuracy r
      sireFrac: 0.10,    // proportion of males selected
      damFrac: 1.0,      // proportion of females selected
      heatDet: 0.7,      // heat detection rate (AI)
      bankSize: 10,      // sires in semen bank
    }, opts);
    this.reset();
  }

  /* gaussian */
  g() {
    let u = 0, v = 0;
    while (u === 0) u = this.rnd();
    v = this.rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * v);
  }

  reset() {
    this.rnd = mulberry32(this.seed);
    this.t = 0;
    this.nextId = 1;
    this.nextTag = 1;
    this.agents = [];
    this.records = new Map();     // pedigree registry
    this.bank = [];               // cryopreserved semen
    this.births = [];             // galton records (ring)
    this.hist = [];               // time-series
    this.events = [];             // log
    this.drought = 0;
    this.totalBirths = 0; this.totalDeaths = 0; this.aiBirths = 0;
    this.selStart = null; this.lastGenMile = 0; this.extinctLogged = false;
    // fertility landscape: oases
    this.fert = new Float32Array(GW * GH);
    const blobs = [];
    for (let i = 0; i < 9; i++) blobs.push([this.rnd() * GW, this.rnd() * GH, 3 + this.rnd() * 8, 0.5 + this.rnd() * 0.6]);
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      let f = 0.12;
      for (const [bx, by, r, a] of blobs) {
        let dx = Math.abs(x - bx); dx = Math.min(dx, GW - dx);
        let dy = Math.abs(y - by); dy = Math.min(dy, GH - dy);
        f += a * Math.exp(-(dx * dx + dy * dy) / (2 * r * r));
      }
      this.fert[y * GW + x] = Math.min(1, f);
    }
    this.food = new Float32Array(GW * GH);
    for (let i = 0; i < this.food.length; i++) this.food[i] = this.fert[i] * 0.8;
    this.hash = new Array(HW * HH);
    for (let i = 0; i < this.hash.length; i++) this.hash[i] = [];
    for (let i = 0; i < 260; i++) this.addAgent(this.founder());
    this.stats = this.computeStats();
    this.log('start', {});
  }

  log(type, data) {
    this.events.push({ t: this.t, type, data });
    if (this.events.length > 60) this.events.shift();
  }

  /* ---------- genome construction ---------- */
  founder() {
    const a = new Float32Array(2 * NLOC), tg = new Int32Array(2 * NLOC), b = new Float32Array(2 * NW);
    for (let l = 0; l < NLOC; l++) {
      const tr = (l / LOCI) | 0;
      for (let k = 0; k < 2; k++) { a[2 * l + k] = this.g() * SA[tr]; tg[2 * l + k] = this.nextTag++; }
    }
    for (let i = 0; i < NW; i++) for (let k = 0; k < 2; k++) b[2 * i + k] = PRIOR[i] + this.g() * 0.25;
    return this.makeAgent(a, tg, b, 0, 0, 0, this.rnd() * WORLD_W, this.rnd() * WORLD_H, 0, this.rnd() * 1500);
  }

  gamete(pa, ptg, pb, oa, otg, ob, slot) {
    const mu = this.p.mut;
    for (let l = 0; l < NLOC; l++) {
      const k = this.rnd() < 0.5 ? 0 : 1;
      let v = pa[2 * l + k], tag = ptg[2 * l + k];
      if (this.rnd() < mu) { v += this.g() * SA[(l / LOCI) | 0] * 0.6; tag = this.nextTag++; }
      oa[2 * l + slot] = v; otg[2 * l + slot] = tag;
    }
    for (let i = 0; i < NW; i++) {
      let v = pb[2 * i + (this.rnd() < 0.5 ? 0 : 1)];
      if (this.rnd() < 0.03) v += this.g() * 0.2;
      ob[2 * i + slot] = v;
    }
  }

  makeAgent(a, tg, b, sire, dam, gen, x, y, energyFrac, age) {
    const ag = {
      id: this.nextId++, sex: this.rnd() < 0.5 ? 0 : 1, alive: true,
      x, y, h: this.rnd() * 6.2832, v: 0,
      age: age || 0, maxAge: 3300 + this.g() * 450,
      gen, sire, dam, a, tg, b,
      w: new Float32Array(NW), G: new Float32Array(NT), P: new Float32Array(NT), noise: new Float32Array(NT),
      F: 0, kids: 0, born: this.t,
      cyc: Math.floor(this.rnd() * 200), preg: 0, fetus: null, refr: 0, detected: false, wasEstrus: false,
      target: null, eligible: true, heatFert: 1, ai: false, ebv: 0,
    };
    for (let i = 0; i < NW; i++) ag.w[i] = 0.5 * (b[2 * i] + b[2 * i + 1]);
    let hom = 0;
    for (let t = 0; t < NT; t++) {
      let s = 0;
      for (let l = t * LOCI; l < (t + 1) * LOCI; l++) { s += a[2 * l] + a[2 * l + 1]; if (tg[2 * l] === tg[2 * l + 1]) hom++; }
      ag.G[t] = s;
      ag.P[t] = s + this.g() * SE[t];
      ag.noise[t] = this.g();
    }
    ag.F = hom / NLOC;
    this.derive(ag);
    ag.energy = ag.maxE * (energyFrac || 0.6);
    return ag;
  }

  derive(ag) {
    const z = ag.P;
    const c = (v) => Math.max(-3, Math.min(3, v));
    ag.mass = Math.exp(0.22 * c(z[0]));
    ag.maxSpeed = 1.15 * Math.exp(0.18 * c(z[1])) / Math.pow(ag.mass, 0.12);
    ag.vision = 46 * Math.exp(0.22 * c(z[2]));
    ag.heatOpt = 33 + 3.2 * c(z[3]);
    ag.cycleLen = 210 * Math.exp(-0.12 * c(z[4]));
    ag.concProb = 1 / (1 + Math.exp(-(0.75 + 0.8 * c(z[4]))));
    ag.metab = Math.exp(-0.12 * c(z[5])) * (1 + 0.05 * c(z[3]));
    ag.maxE = 10 * ag.mass * Math.exp(-0.08 * c(z[5]));
    ag.radius = 2.4 + 2.2 * Math.cbrt(ag.mass);
  }

  addAgent(ag) {
    this.agents.push(ag);
    this.records.set(ag.id, {
      id: ag.id, sex: ag.sex, sire: ag.sire, dam: ag.dam, gen: ag.gen, born: ag.born,
      P: Array.from(ag.P), G: Array.from(ag.G), F: ag.F, kids: 0, died: null, ai: ag.ai, cause: null,
    });
    if (this.records.size > 9000) {
      const it = this.records.keys();
      for (let i = 0; i < 1000; i++) this.records.delete(it.next().value);
    }
  }

  /* ---------- environment ---------- */
  temperature() { return this.p.temp + 7 * Math.sin(6.2832 * this.t / SEASON); }
  seasonFactor() {
    const s = 0.62 + 0.38 * Math.sin(6.2832 * this.t / SEASON + 1.2);
    return s * (this.drought > 0 ? 0.12 : 1);
  }
  foodAt(x, y) {
    let cx = Math.floor(x / CELL), cy = Math.floor(y / CELL);
    cx = ((cx % GW) + GW) % GW; cy = ((cy % GH) + GH) % GH;
    return cy * GW + cx;
  }

  /* ---------- selection ---------- */
  /* Genomic EBV with accuracy r, built to be unbiased (regression of BV on EBV = 1):
     EBV = mu + r^2 (G - mu) + r sqrt(1 - r^2) sigmaG z  ->  corr(EBV, G) = r, var(EBV) = r^2 var(G) */
  ebvOf(obj, t) {
    const s = this.stats;
    const mu = s ? s.meanG[t] : 0, vg = Math.max(1e-6, s ? s.vg[t] : H2_FOUNDER[t]);
    const r = Math.max(0.05, Math.min(0.999, this.p.accuracy));
    return mu + r * r * (obj.G[t] - mu) + r * Math.sqrt(1 - r * r) * Math.sqrt(vg) * obj.noise[t];
  }
  criterionOf(obj) { // obj has P,G,noise
    const t = this.p.target;
    return this.p.criterion === 'genomic' ? this.ebvOf(obj, t) : obj.P[t];
  }

  updateSelection() {
    const mode = this.p.mode;
    for (const a of this.agents) { a.eligible = true; a.ebv = this.criterionOf(a); }
    if (mode === 'natural') return;
    const dir = this.p.dir;
    const adultsM = this.agents.filter(a => a.sex === 1 && a.age > PUBERTY);
    const adultsF = this.agents.filter(a => a.sex === 0 && a.age > PUBERTY);
    adultsM.sort((x, y) => dir * (y.ebv - x.ebv));
    adultsF.sort((x, y) => dir * (y.ebv - x.ebv));
    const nm = Math.max(1, Math.round(adultsM.length * this.p.sireFrac));
    const nf = Math.max(1, Math.round(adultsF.length * this.p.damFrac));
    const topM = new Set(adultsM.slice(0, nm).map(a => a.id));
    const topF = new Set(adultsF.slice(0, nf).map(a => a.id));
    for (const a of this.agents) {
      if (a.age <= PUBERTY) continue;
      a.eligible = a.sex === 1 ? topM.has(a.id) : topF.has(a.id);
    }
    if (mode === 'ai') {
      // collect semen from top sires into the bank
      for (const m of adultsM.slice(0, Math.min(nm, this.p.bankSize))) {
        if (this.bank.some(b => b.id === m.id)) continue;
        this.bank.push({
          id: m.id, a: m.a.slice(), tg: m.tg.slice(), b: m.b.slice(),
          P: Float32Array.from(m.P), G: Float32Array.from(m.G), noise: Float32Array.from(m.noise),
          gen: m.gen, collected: this.t, used: 0, F: m.F,
        });
      }
      for (const s of this.bank) s.score = this.criterionOf(s);
      this.bank.sort((x, y) => dir * (y.score - x.score));
      if (this.bank.length > this.p.bankSize) this.bank.length = this.p.bankSize;
    }
  }

  /* ---------- conception / birth ---------- */
  conceive(fem, sire, viaAI) {
    const a = new Float32Array(2 * NLOC), tg = new Int32Array(2 * NLOC), b = new Float32Array(2 * NW);
    this.gamete(fem.a, fem.tg, fem.b, a, tg, b, 0);
    this.gamete(sire.a, sire.tg, sire.b, a, tg, b, 1);
    fem.preg = GESTATION;
    fem.fetus = { a, tg, b, sire: sire.id, sireP: Array.from(sire.P), sireG: Array.from(sire.G), gen: Math.max(fem.gen, sire.gen) + 1, ai: viaAI };
  }

  birth(m) {
    const f = m.fetus;
    const kid = this.makeAgent(f.a, f.tg, f.b, f.sire, m.id, f.gen,
      m.x + this.g() * 4, m.y + this.g() * 4, 0, 0);
    kid.ai = f.ai;
    const give = Math.min(m.energy * 0.45, kid.maxE * 0.55);
    m.energy -= give; kid.energy = give;
    m.preg = 0; m.fetus = null; m.cyc = -140; // postpartum anestrus
    m.kids++;
    const rm = this.records.get(m.id); if (rm) rm.kids++;
    const rs = this.records.get(f.sire); if (rs) rs.kids++;
    const bank = this.bank.find(s => s.id === f.sire); if (bank) bank.used++;
    for (const a of this.agents) if (a.id === f.sire) { a.kids++; break; }
    this.addAgent(kid);
    this.totalBirths++;
    if (f.ai) { if (this.aiBirths === 0) this.log('firstAI', {}); this.aiBirths++; }
    // galton record
    const s = this.stats;
    const rec = { t: this.t, mid: new Float32Array(NT), off: Float32Array.from(kid.P), mean: Float32Array.from(s.meanP), h2: Float32Array.from(s.h2), sel: this.p.mode !== 'natural', target: this.p.target, ai: f.ai };
    for (let t = 0; t < NT; t++) rec.mid[t] = 0.5 * (m.P[t] + f.sireP[t]);
    this.births.push(rec);
    if (this.births.length > 1500) this.births.shift();
  }

  /* ---------- main step ---------- */
  step() {
    this.t++;
    const T = this.temperature();
    const sf = this.seasonFactor() * this.p.food;
    if (this.drought > 0) { this.drought--; if (this.drought === 0) this.log('rain', {}); }

    // regrow food
    const rg = 0.0032 * sf;
    for (let i = 0; i < this.food.length; i++) {
      const cap = this.fert[i];
      this.food[i] += rg * (cap - this.food[i] + 0.02);
      if (this.food[i] > cap) this.food[i] = cap;
    }

    // spatial hash
    for (const c of this.hash) c.length = 0;
    for (const a of this.agents) {
      const hx = Math.min(HW - 1, (a.x / HC) | 0), hy = Math.min(HH - 1, (a.y / HC) | 0);
      this.hash[hy * HW + hx].push(a);
    }

    const pop = this.agents.length;
    const useAI = this.p.mode === 'ai' && this.bank.length > 0;
    const inp = new Float32Array(NI), hid = new Float32Array(NH);

    for (let ai = 0; ai < this.agents.length; ai++) {
      const a = this.agents[ai];
      if (!a.alive) continue;
      a.age++;
      const adult = a.age > PUBERTY;
      const efrac = a.energy / a.maxE;

      /* reproductive physiology */
      let estrus = false;
      if (a.sex === 0) {
        if (a.preg > 0) {
          a.preg--;
          if (a.preg === 0) this.birth(a);
        } else if (adult) {
          if (efrac > 0.42) a.cyc++;      // nutritional anestrus below threshold
          if (a.cyc >= a.cycleLen) { a.cyc = 0; a.detected = false; }
          estrus = a.cyc >= 0 && a.cyc < ESTRUS_LEN && a.eligible;
          // artificial insemination at detected heat
          if (estrus && !a.wasEstrus && useAI && pop < POP_CAP) {
            if (this.rnd() < this.p.heatDet) {
              a.detected = true;
              const sire = this.bank[(this.rnd() * this.bank.length) | 0];
              if (this.rnd() < a.concProb * a.heatFert * 0.92) this.conceive(a, sire, true);
            }
          }
        }
        a.wasEstrus = estrus;
        a.estrus = estrus && a.preg === 0;
      } else {
        if (a.refr > 0) a.refr--;
        a.estrus = false;
      }

      /* mate search: males seek estrous females; estrous females seek eligible males */
      let mateSin = 0, mateCos = 0;
      a.target = null;
      const maleSeek = a.sex === 1 && adult && a.eligible && a.refr === 0 && efrac > 0.35 && !useAI;
      const femSeek = a.sex === 0 && a.estrus && !useAI;
      if (maleSeek || femSeek) {
        const R = a.vision * PHEROMONE * Math.min(3, Math.max(1, Math.sqrt(350 / Math.max(1, pop)))), rc = Math.ceil(R / HC);
        const hx = (a.x / HC) | 0, hy = (a.y / HC) | 0;
        let best = null, bd = R * R, bdx = 0, bdy = 0;
        for (let dy = -rc; dy <= rc; dy++) for (let dx = -rc; dx <= rc; dx++) {
          const cx = (hx + dx + HW) % HW, cy = (hy + dy + HH) % HH;
          for (const o of this.hash[cy * HW + cx]) {
            if (!o.alive) continue;
            if (maleSeek ? !o.estrus : !(o.sex === 1 && o.eligible && o.age > PUBERTY && o.refr === 0)) continue;
            let ddx = o.x - a.x, ddy = o.y - a.y;
            if (ddx > WORLD_W / 2) ddx -= WORLD_W; else if (ddx < -WORLD_W / 2) ddx += WORLD_W;
            if (ddy > WORLD_H / 2) ddy -= WORLD_H; else if (ddy < -WORLD_H / 2) ddy += WORLD_H;
            const d2 = ddx * ddx + ddy * ddy;
            if (d2 < bd) { bd = d2; best = o; bdx = ddx; bdy = ddy; }
          }
        }
        if (best) {
          a.target = best;
          const ang = Math.atan2(bdy, bdx) - a.h;
          mateSin = Math.sin(ang); mateCos = Math.cos(ang);
          if (mateCos < 0) mateSin = mateSin >= 0 ? 1 : -1;
          const d = Math.sqrt(bd);
          if (d < a.radius + best.radius + 3) {
                        const female = maleSeek ? best : a, male = maleSeek ? a : best;
            male.refr = 12;
            if (pop < POP_CAP && this.rnd() < female.concProb * female.heatFert) this.conceive(female, male, false);
            female.estrus = false;
            if (femSeek) a.target = null;
          }
        }
      }

      /* senses */
      const sd = a.vision * 0.5;
      const fl = this.food[this.foodAt(a.x + Math.cos(a.h - 0.6) * sd, a.y + Math.sin(a.h - 0.6) * sd)];
      const fr = this.food[this.foodAt(a.x + Math.cos(a.h + 0.6) * sd, a.y + Math.sin(a.h + 0.6) * sd)];
      const ci = this.foodAt(a.x, a.y);
      const fh = this.food[ci];
      const stress = Math.max(0, T - a.heatOpt) / 8;
      inp[0] = fl; inp[1] = fr; inp[2] = fh; inp[3] = efrac; inp[4] = mateSin; inp[5] = mateCos;
      inp[6] = stress; inp[7] = Math.sin(a.age * 0.045 + a.id); inp[8] = 1;

      /* brain */
      const w = a.w;
      for (let h = 0; h < NH; h++) {
        let s = 0; const o = h * NI;
        for (let i = 0; i < NI; i++) s += w[o + i] * inp[i];
        hid[h] = Math.tanh(s);
      }
      let o0 = 0, o1 = 0; const b0 = NI * NH, b1 = b0 + NH + 1;
      for (let h = 0; h < NH; h++) { o0 += w[b0 + h] * hid[h]; o1 += w[b1 + h] * hid[h]; }
      o0 += w[b0 + NH]; o1 += w[b1 + NH];
      let turn = Math.tanh(o0) * 0.28;
      let thrust = 1 / (1 + Math.exp(-o1));
      if (a.target) { turn += 0.3 * mateSin; thrust = Math.max(thrust, a.sex ? 0.95 : 0.7); } // innate courtship drive
      a.h += turn;
      const juv = adult ? 1 : 0.55 + 0.45 * a.age / PUBERTY;
      a.v = thrust * a.maxSpeed * (a.preg > 0 ? 0.8 : 1) * (a.estrus && !a.target ? 1.3 : 1); // restless in heat (what activity collars detect)
      a.x += Math.cos(a.h) * a.v; a.y += Math.sin(a.h) * a.v;
      if (a.x < 0) a.x += WORLD_W; else if (a.x >= WORLD_W) a.x -= WORLD_W;
      if (a.y < 0) a.y += WORLD_H; else if (a.y >= WORLD_H) a.y -= WORLD_H;

      /* feeding */
      const bite = Math.min(this.food[ci], 0.045 * Math.pow(a.mass, 0.75) * juv * (1.15 - 0.5 * thrust));
      this.food[ci] -= bite;
      a.energy += bite * 5.5;

      /* energetics */
      let cost = 0.0105 * Math.pow(a.mass, 0.75) * a.metab * juv;
      if (this.p.inbDep) cost *= 1 + 1.2 * a.F;
      cost *= 1 + 0.9 * stress;
      a.heatFert = 1 - 0.6 * Math.min(1, stress); // heat stress depresses conception
      cost += 0.0036 * a.mass * a.v * a.v;
      cost += 0.0016 * (a.vision / 46) * (a.vision / 46);
      if (a.preg > 0) cost += 0.006 * a.mass;
      a.energy -= cost;
      if (a.energy > a.maxE) a.energy = a.maxE;

      /* death */
      let cause = null;
      if (a.energy <= 0) cause = stress > 0.4 ? 'heat' : 'starve';
      else if (a.age > a.maxAge) cause = 'age';
      if (cause) {
        a.alive = false;
        const r = this.records.get(a.id); if (r) { r.died = this.t; r.cause = cause; r.kids = a.kids; }
        this.totalDeaths++;
      }
    }
    // compaction
    if (this.agents.some(a => !a.alive)) {
      for (const a of this.agents) if (a.target && !a.target.alive) a.target = null;
      this.agents = this.agents.filter(a => a.alive);
    }
    if (this.t % 20 === 0) {
      this.stats = this.computeStats();
      this.updateSelection();
      if (this.t % 60 === 0) this.pushHist();
    }
  }

  /* ---------- statistics ---------- */
  computeStats() {
    const n = this.agents.length;
    const meanG = new Float32Array(NT), meanP = new Float32Array(NT), vg = new Float32Array(NT), vp = new Float32Array(NT), h2 = new Float32Array(NT);
    let F = 0, gen = 0, males = 0, preg = 0, estrus = 0, energy = 0;
    for (const a of this.agents) {
      for (let t = 0; t < NT; t++) { meanG[t] += a.G[t]; meanP[t] += a.P[t]; }
      F += a.F; gen += a.gen; if (a.sex) males++; if (a.preg > 0) preg++; if (a.estrus) estrus++;
      energy += a.energy / a.maxE;
    }
    if (n) for (let t = 0; t < NT; t++) { meanG[t] /= n; meanP[t] /= n; }
    for (const a of this.agents) for (let t = 0; t < NT; t++) {
      const dg = a.G[t] - meanG[t], dp = a.P[t] - meanP[t];
      vg[t] += dg * dg; vp[t] += dp * dp;
    }
    for (let t = 0; t < NT; t++) {
      vg[t] = n > 1 ? vg[t] / (n - 1) : 0; vp[t] = n > 1 ? vp[t] / (n - 1) : 0;
      h2[t] = vp[t] > 0 ? vg[t] / vp[t] : 0;
    }
    return {
      n, males, females: n - males, preg, estrus, meanG, meanP, vg, vp, h2,
      F: n ? F / n : 0, gen: n ? gen / n : 0, energy: n ? energy / n : 0, temp: this.temperature(),
    };
  }

  pushHist() {
    const s = this.stats;
    const gm = Math.floor(s.gen / 5) * 5;
    if (gm > 0 && gm !== this.lastGenMile) { this.lastGenMile = gm; this.log('genmile', { g: gm }); }
    if (s.n === 0 && !this.extinctLogged) { this.extinctLogged = true; this.log('extinct', {}); }
    this.hist.push({ t: this.t, n: s.n, m: s.males, f: s.females, preg: s.preg, G: Array.from(s.meanG), F: s.F, gen: s.gen, temp: s.temp, h2: Array.from(s.h2) });
    if (this.hist.length > 900) { // thin older half
      const keep = [];
      for (let i = 0; i < this.hist.length; i++) if (i >= 450 || i % 2 === 0) keep.push(this.hist[i]);
      this.hist = keep;
    }
  }

  /* parent-offspring regression on midparent for trait t */
  galton(t, onlySel) {
    const pts = [];
    for (const r of this.births) {
      if (onlySel && !r.sel) continue;
      pts.push([r.mid[t] - r.mean[t], r.off[t] - r.mean[t], r.h2[t], r.ai]);
    }
    const use = pts.slice(-500);
    let sx = 0, sy = 0, sxx = 0, sxy = 0, sh = 0;
    for (const [x, y, h] of use) { sx += x; sy += y; sxx += x * x; sxy += x * y; sh += h; }
    const n = use.length;
    let slope = NaN, icpt = 0, S = 0, R = 0, h2 = 0;
    if (n > 8) {
      const mx = sx / n, my = sy / n;
      const vx = sxx / n - mx * mx;
      slope = vx > 1e-6 ? (sxy / n - mx * my) / vx : NaN;
      icpt = my - slope * mx;
      S = mx; R = my; h2 = sh / n;
    }
    return { pts: use, n, slope, icpt, S, R, h2, pred: h2 * S };
  }

  /* ---------- interventions ---------- */
  doDrought() { this.drought = 1400; this.log('drought', {}); }
  doBottleneck(keep = 16) {
    const arr = this.agents.slice();
    for (let i = arr.length - 1; i > 0; i--) { const j = (this.rnd() * (i + 1)) | 0; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    const survivors = new Set(arr.slice(0, keep).map(a => a.id));
    for (const a of this.agents) if (!survivors.has(a.id)) {
      a.alive = false; const r = this.records.get(a.id); if (r) { r.died = this.t; r.cause = 'bottleneck'; }
    }
    for (const a of this.agents) if (a.target && !a.target.alive) a.target = null;
    this.agents = this.agents.filter(a => a.alive);
    this.log('bottleneck', { keep });
    this.stats = this.computeStats();
  }
  setParam(k, v) {
    const old = this.p[k];
    this.p[k] = v;
    if (k === 'mode' && v !== old) {
      if (v === 'natural') this.selStart = null; else this.selStart = this.t;
      if (v !== 'ai') this.bank = [];
      this.log('mode', { mode: v });
    }
    if (k === 'target' && v !== old && this.p.mode !== 'natural') { this.selStart = this.t; this.bank = []; }
    if (k === 'dir' && v !== old) this.bank = [];
    this.updateSelection();
  }

  find(x, y, r = 14) {
    let best = null, bd = r * r;
    for (const a of this.agents) {
      const dx = a.x - x, dy = a.y - y, d = dx * dx + dy * dy;
      if (d < bd) { bd = d; best = a; }
    }
    return best;
  }
  agentById(id) { return this.agents.find(a => a.id === id) || null; }
}

const API = { Sim, TRAITS, NT, LOCI, NLOC, NW, NI, NH, H2_FOUNDER, WORLD_W, WORLD_H, GW, GH, CELL, PUBERTY, GESTATION, ESTRUS_LEN, SEASON };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.Genesis = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
