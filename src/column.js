/* ===================================================================
   GENESIS · WATER COLUMN — physics-first evolution of multicellularity
   Units: micrometres (µm), seconds (s), piconewtons (pN).
   Physics (real, physical clock):
     · Stokes flow (Re ≈ 1e-4), solved spectrally each step from the
       buoyancy-corrected weight of every cell (stream-function form,
       periodic in x, free-slip/no-penetration at surface and bottom)
     · gyrotactic swimmers: bottom-heavy torque + rotation by vorticity
       + rotational noise  →  the ingredients of bioconvection
     · colony drag from Stokes law with a fractal hydrodynamic radius
     · Beer–Lambert light with self-shading by cells
     · nutrient advection (semi-Lagrangian) + diffusion (D = 1900 µm²/s)
       + exchange with sediment pore water
     · bond fracture when tension (fluid shear + packing strain) exceeds
       the bond strength gene
   Biology (accelerated clock, ×ACC relative to physics):
     · Liebig growth limited by light and nutrient, division, death,
       flagellation constraint (no swimming while dividing), soma,
       resource sharing inside organisms, gape-limited predators.
   =================================================================== */
(function (root) {
'use strict';


/* ---------- physical constants ---------- */
const ETA = 1e-3;                 // water viscosity, pN·s/µm² (= 1 mPa·s)
const A = 5;                      // cell radius, µm
const VCELL = 4 / 3 * Math.PI * A * A * A;
const WPP = 9.81 * VCELL * 1e-6;  // weight in pN per kg/m³ of excess density
const ZETA1 = 6 * Math.PI * ETA * A;   // Stokes drag of one cell, pN·s/µm
const DF = 0.45;                  // R_h = A · N^DF (fractal colony)
const F0 = 6;                     // flagellar thrust of one cell at SWIM = 1, pN (≈ 60 µm/s swimming)
const B_GYRO = 3.4;               // gyrotactic reorientation time, s (Chlamydomonas)
const DROT = 0.1;                 // rotational diffusion of a swimmer, rad²/s
const D_N = 1900;                 // nutrient (nitrate) diffusivity, µm²/s
const KB = 0.3;                   // bond stiffness for packing strain, pN/µm (softened: 2D packing is tighter than 3D)

/* ---------- domain ---------- */
const LX = 4000, LZ = 2000, NX = 64, NZ = 32, DX = LX / NX;     // 62.5 µm grid
const HSL = 25;                   // thickness of the simulated slice, µm (sets the 3D concentration each cell represents)
const VNODE = DX * DX * HSL;      // µm³ per grid node
const KXM = 20, MZM = 20;         // retained Fourier (x) and sine (z) modes
const DT = 0.5;                   // physical time step, s
const HS = 12, HX = Math.ceil(LX / HS), HZ = Math.ceil(LZ / HS);

/* ---------- genes ---------- */
const NG = 5;
const ADH = 0, SOMA = 1, SWIM = 2, BOND = 3, BUOY = 4;
const GENES = ['adh', 'soma', 'swim', 'bond', 'buoy'];
const GMIN = [0, 0, 0, 0.3, 0], GMAX = [1, 0.9, 1.5, 14, 1];
const MUT_SD = [0.06, 0.05, 0.08, 0.5, 0.06];

const wrapX = (x) => (x < 0 ? x + LX : x >= LX ? x - LX : x);
const dxMin = (d) => (d > LX / 2 ? d - LX : d < -LX / 2 ? d + LX : d);

class Column {
  constructor(seed = 21, opts = {}) {
    this.seed = seed;
    this.p = Object.assign({
      predators: true,
      predRatio: 3,      // predators per 100 algal cells (ratio-dependent, chemostat-style)
      flow: true,        // hydrodynamic coupling on/off (for comparison)
      light: 1.0,        // surface irradiance (relative)
      turbidity: 0.0012, // light attenuation, 1/µm (the 2 mm column stands in for a deeper, murkier pond)
      nutrient: 1.0,     // nutrient supply multiplier
      source: 'mixed',   // 'mixed': remineralised throughout the water | 'sediment': released from the bottom
      acc: 400,          // biological clock acceleration
      mut: 0.08,
      cap: 3200,
    }, opts);
    this.buildTables();
    this.reset();
  }
  g() { let u = 0; while (u === 0) u = this.rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * this.rnd()); }
  gq() { return (this.rnd() + this.rnd() + this.rnd() - 1.5) * 2; }   // cheap unit-variance noise

  buildTables() {
    // Fourier in x (cell-centred nodes), sine/cosine in z
    this.kx = new Float64Array(KXM + 1);
    this.cx = new Float64Array((KXM + 1) * NX); this.sx = new Float64Array((KXM + 1) * NX);
    for (let j = 0; j <= KXM; j++) {
      const k = 2 * Math.PI * j / LX; this.kx[j] = k;
      for (let i = 0; i < NX; i++) { const x = (i + 0.5) * DX; this.cx[j * NX + i] = Math.cos(k * x); this.sx[j * NX + i] = Math.sin(k * x); }
    }
    this.q = new Float64Array(MZM);
    this.S = new Float64Array(MZM * NZ); this.Cq = new Float64Array(MZM * NZ);
    for (let m = 0; m < MZM; m++) {
      const q = Math.PI * (m + 1) / LZ; this.q[m] = q;
      for (let k = 0; k < NZ; k++) { const z = (k + 0.5) * DX; this.S[m * NZ + k] = Math.sin(q * z); this.Cq[m * NZ + k] = Math.cos(q * z); }
    }
    const NN = NX * NZ;
    this.fz = new Float64Array(NN); this.U = new Float64Array(NN); this.Wv = new Float64Array(NN);
    this.OM = new Float64Array(NN); this.GAM = new Float64Array(NN);
    this.Fr = new Float64Array((KXM + 1) * NZ); this.Fi = new Float64Array((KXM + 1) * NZ);
    this.Pr = new Float64Array((KXM + 1) * MZM); this.Pi = new Float64Array((KXM + 1) * MZM);
    this.Zr = new Float64Array((KXM + 1) * NZ * 3); this.Zi = new Float64Array((KXM + 1) * NZ * 3);
    this.C = new Float64Array(NN); this.Ct = new Float64Array(NN);
    this.I = new Float64Array(NN); this.ncount = new Float64Array(NN);
    this.head = new Int32Array(HX * HZ); this.next = new Int32Array(8192);
  }

  /* mulberry32 with its state held on the instance, so a run can be saved and resumed exactly */
  seedRng(seed) {
    this._rs = seed | 0;
    this.rnd = () => {
      const a = this._rs = (this._rs + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  reset() {
    this.seedRng(this.seed);
    this.t = 0; this.nextId = 1; this.nextCol = 1; this.nextGeno = 1;
    this.C.fill(0.5); this.fz.fill(0); this.U.fill(0); this.Wv.fill(0); this.OM.fill(0); this.GAM.fill(0);
    this.cells = []; this.colonies = new Map(); this.archive = new Map(); this.preds = [];
    this.hist = []; this.events = []; this.milestones = {}; this.pairs = [];
    this.stamp = 1; this.stack = [];
    this.born = 0; this.eaten = 0; this.fractures = 0; this.fracShear = 0; this.fracPack = 0; this.gens = 0; this.nAvg = 400;
    this.flowStats = { rms: 0, max: 0 };
    for (let i = 0; i < 420; i++) {
      const g = new Float32Array(NG);
      g[ADH] = Math.max(0, 0.04 + this.g() * 0.02);
      g[SOMA] = Math.max(0, 0.02 + this.g() * 0.01);
      g[SWIM] = Math.max(0, 1 + this.g() * 0.08);
      g[BOND] = Math.max(0.3, 2 + this.g() * 0.3);
      g[BUOY] = Math.max(0, 0.05 + this.g() * 0.02);
      const c = this.makeCell(this.rnd() * LX, 100 + this.rnd() * (LZ - 200), g, 0.5 + this.rnd() * 0.45, false, this.nextGeno++);
      this.cells.push(c);
      this.newColony(null, [c]);
    }
    // tracers: passive particles that reveal the flow
    this.tr = new Float32Array(1800 * 4);
    for (let i = 0; i < 1800; i++) { this.tr[4 * i] = this.rnd() * LX; this.tr[4 * i + 1] = this.rnd() * LZ; this.tr[4 * i + 2] = this.tr[4 * i]; this.tr[4 * i + 3] = this.tr[4 * i + 1]; }
    if (this.p.predators) this.seedPredators(this.predTarget(), 13);
    this.stats = this.computeStats();
    this.log('start', {});
  }
  log(type, data) { this.events.push({ t: this.t, type, data }); if (this.events.length > 60) this.events.shift(); }

  makeCell(x, z, g, b, soma, geno) {
    return { id: this.nextId++, x, z, g, b, soma, geno, age: 0, bonds: [], col: null, alive: true, vis: 0, born: this.t, ph: -Math.PI / 2 };
  }
  newColony(parent, cells) {
    const col = {
      id: this.nextCol++, parent: parent ? parent.id : 0, gen: parent ? parent.gen + 1 : 0, born: this.t,
      cells: [], alive: true, hue: parent ? (parent.hue + this.g() * 8 + 360) % 360 : 70 + this.rnd() * 120,
      ph: parent ? parent.ph : -Math.PI / 2 + this.g() * 0.6, cx: 0, cz: 0, vx: 0, vz: 0, vrel: 0, gam: 0, tension: 0, kids: 0,
      peak: cells.length, reproSize: null, parentRepro: parent ? parent.reproSize : null, eaten: false, depth: 0,
    };
    for (const c of cells) { c.col = col; col.cells.push(c); }
    this.colonies.set(col.id, col);
    col.rec = { id: col.id, parent: col.parent, gen: col.gen, born: this.t, died: null, peak: col.peak, hue: col.hue, repro: null };
    this.archive.set(col.id, col.rec);
    if (this.archive.size > 40000) { const it = this.archive.keys(); for (let i = 0; i < 5000; i++) this.archive.delete(it.next().value); }
    this.updateCOM(col);
    return col;
  }
  retire(col) {
    col.alive = false; this.colonies.delete(col.id);
    if (col.rec) { col.rec.died = this.t; col.rec.peak = col.peak; col.rec.repro = col.reproSize; col.rec.eaten = col.eaten; }
  }
  reproduced(col, size) {
    col.kids++;
    if (col.reproSize === null) {
      col.reproSize = size;
      if (col.parentRepro !== null) { this.pairs.push([Math.log2(col.parentRepro), Math.log2(size)]); if (this.pairs.length > 900) this.pairs.shift(); }
    }
  }
  updateCOM(col) {
    const cs = col.cells, x0 = cs[0].x;
    let sx = 0, sz = 0;
    for (const c of cs) { sx += dxMin(c.x - x0); sz += c.z; }
    col.cx = wrapX(x0 + sx / cs.length); col.cz = sz / cs.length;
  }

  /* ---------- bond graph ---------- */
  bfs(start, stamp, out) {
    const st = this.stack; st.length = 0; st.push(start); start.vis = stamp;
    while (st.length) { const c = st.pop(); out.push(c); for (const n of c.bonds) if (n.vis !== stamp && n.alive) { n.vis = stamp; st.push(n); } }
    return out;
  }
  unbond(a, b) { let i = a.bonds.indexOf(b); if (i >= 0) a.bonds.splice(i, 1); i = b.bonds.indexOf(a); if (i >= 0) b.bonds.splice(i, 1); }
  resolve(col) {
    if (!col.alive) return;
    const before = col.cells.length;
    const living = col.cells.filter(c => c.alive);
    if (!living.length) { this.retire(col); return; }
    const stamp = ++this.stamp, comps = [];
    for (const c of living) if (c.vis !== stamp) comps.push(this.bfs(c, stamp, []));
    comps.sort((a, b) => b.length - a.length);
    col.cells = comps[0];
    for (const c of col.cells) c.col = col;
    if (comps.length > 1) {
      this.reproduced(col, Math.max(before, living.length));
      for (let k = 1; k < comps.length; k++) this.newColony(col, comps[k]);
    }
    this.updateCOM(col);
  }

  mutate(src) {
    const g = new Float32Array(src); let mutated = false;
    for (let k = 0; k < NG; k++) if (this.rnd() < this.p.mut) {
      if (this.rnd() < 0.04) g[k] = GMIN[k] + this.rnd() * (GMAX[k] - GMIN[k]);
      else g[k] = Math.min(GMAX[k], Math.max(GMIN[k], g[k] + this.g() * MUT_SD[k]));
      mutated = true;
    }
    return { g, mutated };
  }

  /* ---------- predators (rotifer-like, gape-limited) ---------- */
  seedPredators(n, gape) {
    for (let i = 0; i < n; i++) this.preds.push(this.makePred(this.rnd() * LX, 200 + this.rnd() * (LZ - 400), gape * Math.exp(this.g() * 0.08), 1.4));
  }
  makePred(x, z, gape, e) {
    return { id: this.nextId++, x, z, e, gape: Math.max(10, gape), age: 0, maxAge: 2600 + this.rnd() * 1400, digest: 0, phase: this.rnd() * 6.28, target: null, flash: 0, h: this.rnd() * 6.28 };
  }
  predTarget() { return Math.max(2, Math.min(48, Math.round(this.p.predRatio * this.cells.length / 100))); }
  colonyDiameter(n) { return 2 * A * Math.pow(n, DF); }

  /* ---------- grid helpers ---------- */
  sample(F, x, z) {
    let fx = x / DX - 0.5, fz = z / DX - 0.5;
    let i0 = Math.floor(fx), k0 = Math.floor(fz);
    const tx = fx - i0, tz = fz - k0;
    let k1 = k0 + 1;
    if (k0 < 0) { k0 = 0; k1 = 0; } if (k1 > NZ - 1) { k1 = NZ - 1; if (k0 > NZ - 1) k0 = NZ - 1; }
    const i0w = ((i0 % NX) + NX) % NX, i1w = (i0w + 1) % NX;
    return (F[k0 * NX + i0w] * (1 - tx) + F[k0 * NX + i1w] * tx) * (1 - tz) + (F[k1 * NX + i0w] * (1 - tx) + F[k1 * NX + i1w] * tx) * tz;
  }
  nodeOf(x, z) {
    const i = Math.min(NX - 1, Math.max(0, (x / DX) | 0)), k = Math.min(NZ - 1, Math.max(0, (z / DX) | 0));
    return k * NX + i;
  }

  /* ---------- Stokes flow: η∇⁴ψ = ∂f_z/∂x ---------- */
  solveStokes() {
    const F = this.fz, cx = this.cx, sx = this.sx, Fr = this.Fr, Fi = this.Fi;
    // 1. Fourier transform each row in x
    for (let k = 0; k < NZ; k++) {
      const row = k * NX;
      for (let j = 0; j <= KXM; j++) {
        let sr = 0, si = 0; const o = j * NX;
        for (let i = 0; i < NX; i++) { const v = F[row + i]; sr += v * cx[o + i]; si -= v * sx[o + i]; }
        Fr[j * NZ + k] = sr; Fi[j * NZ + k] = si;
      }
    }
    // 2. sine projection in z, 3. invert the biharmonic operator
    const S = this.S, Pr = this.Pr, Pi = this.Pi, norm = 2 / NZ;
    for (let j = 1; j <= KXM; j++) {
      const kx = this.kx[j];
      for (let m = 0; m < MZM; m++) {
        let ar = 0, ai = 0; const o = m * NZ, f0 = j * NZ;
        for (let k = 0; k < NZ; k++) { const s = S[o + k]; ar += Fr[f0 + k] * s; ai += Fi[f0 + k] * s; }
        ar *= norm; ai *= norm;
        const k2 = kx * kx + this.q[m] * this.q[m], den = ETA * k2 * k2;
        // ψ̂ = i kx F̂ / (η k⁴)
        Pr[j * MZM + m] = -kx * ai / den; Pi[j * MZM + m] = kx * ar / den;
      }
    }
    // 4. back to physical z: u = ψ_z, w = -ψ_x, ω = ∇²ψ
    const Zr = this.Zr, Zi = this.Zi, Cq = this.Cq, ZN = (KXM + 1) * NZ;
    Zr.fill(0); Zi.fill(0);
    for (let j = 1; j <= KXM; j++) {
      const kx = this.kx[j];
      for (let m = 0; m < MZM; m++) {
        const pr = Pr[j * MZM + m], pi = Pi[j * MZM + m]; if (pr === 0 && pi === 0) continue;
        const q = this.q[m], k2 = kx * kx + q * q, o = m * NZ, b = j * NZ;
        for (let k = 0; k < NZ; k++) {
          const s = S[o + k], c = Cq[o + k];
          Zr[b + k] += pr * q * c; Zi[b + k] += pi * q * c;                      // u
          Zr[ZN + b + k] += kx * pi * s; Zi[ZN + b + k] += -kx * pr * s;         // w
          Zr[2 * ZN + b + k] += -k2 * pr * s; Zi[2 * ZN + b + k] += -k2 * pi * s; // ω
        }
      }
    }
    // 5. inverse Fourier in x
    const outs = [this.U, this.Wv, this.OM];
    for (let f = 0; f < 3; f++) {
      const out = outs[f], off = f * ZN;
      for (let k = 0; k < NZ; k++) {
        for (let i = 0; i < NX; i++) {
          let v = 0;
          for (let j = 1; j <= KXM; j++) { const b = off + j * NZ + k; v += Zr[b] * cx[j * NX + i] - Zi[b] * sx[j * NX + i]; }
          out[k * NX + i] = 2 * v / NX;
        }
      }
    }
    // shear rate |γ̇| from the strain-rate tensor, and flow statistics
    let s2 = 0, mx = 0;
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const n = k * NX + i, ip = k * NX + (i + 1) % NX, im = k * NX + (i - 1 + NX) % NX;
      const kp = Math.min(NZ - 1, k + 1) * NX + i, km = Math.max(0, k - 1) * NX + i;
      const ux = (this.U[ip] - this.U[im]) / (2 * DX), wz = (this.Wv[kp] - this.Wv[km]) / (2 * DX);
      const uz = (this.U[kp] - this.U[km]) / (2 * DX), wx = (this.Wv[ip] - this.Wv[im]) / (2 * DX);
      const exz = 0.5 * (uz + wx);
      this.GAM[n] = Math.sqrt(2 * (ux * ux + wz * wz + 2 * exz * exz));
      const sp = this.U[n] * this.U[n] + this.Wv[n] * this.Wv[n];
      s2 += this.Wv[n] * this.Wv[n]; if (sp > mx) mx = sp;
    }
    this.flowStats.rms = Math.sqrt(s2 / (NX * NZ)); this.flowStats.max = Math.sqrt(mx);
  }

  /* ---------- light: Beer–Lambert with self-shading ---------- */
  computeLight() {
    const n = this.ncount; n.fill(0);
    for (const c of this.cells) n[this.nodeOf(c.x, c.z)]++;
    const sig = 40 / (DX * HSL);   // optical depth per cell in a node column (σ = 40 µm²)
    const I0 = this.p.light, kw = this.p.turbidity;
    for (let i = 0; i < NX; i++) {
      let tau = 0;
      for (let k = 0; k < NZ; k++) {
        const nn = n[k * NX + i] * sig;
        this.I[k * NX + i] = I0 * Math.exp(-kw * (k + 0.5) * DX - tau - 0.5 * nn);
        tau += nn;
      }
    }
  }

  /* ---------- nutrients: sediment exchange, advection, diffusion ---------- */
  transport() {
    const C = this.C, T = this.Ct, U = this.U, Wv = this.Wv;
    if (this.p.source === 'sediment') {
      const csed = 3 * this.p.nutrient;
      for (let i = 0; i < NX; i++) { const n = (NZ - 1) * NX + i; C[n] += 0.03 * (csed - C[n]) * DT; }
    } else {
      // remineralisation in the water: relaxation toward a background concentration everywhere
      const cb = 0.6 * this.p.nutrient;
      for (let n = 0; n < C.length; n++) C[n] += 0.007 * (cb - C[n]) * DT;
    }
    if (this.p.flow) {
      // semi-Lagrangian advection
      for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
        const n = k * NX + i, x = (i + 0.5) * DX - U[n] * DT, z = (k + 0.5) * DX - Wv[n] * DT;
        T[n] = this.sample(C, wrapX(((x % LX) + LX) % LX), Math.min(LZ, Math.max(0, z)));
      }
      C.set(T);
    }
    // explicit diffusion, 2 sub-steps (r = D·dt/dx² ≈ 0.12 < 1/4)
    const r = D_N * (DT / 2) / (DX * DX);
    for (let s = 0; s < 2; s++) {
      for (let k = 0; k < NZ; k++) {
        const km = k > 0 ? k - 1 : k, kp = k < NZ - 1 ? k + 1 : k;
        for (let i = 0; i < NX; i++) {
          const im = (i - 1 + NX) % NX, ip = (i + 1) % NX, n = k * NX + i;
          T[n] = C[n] + r * (C[k * NX + im] + C[k * NX + ip] + C[km * NX + i] + C[kp * NX + i] - 4 * C[n]);
        }
      }
      C.set(T);
    }
  }

  /* ---------- main step ---------- */
  step() {
    this.t++;
    const p = this.p, cells = this.cells;

    /* 1. body force: buoyancy-corrected weight of every cell (swimmers are force-free) */
    const fz = this.fz; fz.fill(0);
    const inv = 1 / VNODE;
    for (const c of cells) {
      const w = this.cellWeight(c) * inv;
      const gx = c.x / DX - 0.5, gz = Math.min(NZ - 1.001, Math.max(0, c.z / DX - 0.5));
      const i0 = Math.floor(gx), k0 = Math.floor(gz), tx = gx - i0, tz = gz - k0;
      const ia = ((i0 % NX) + NX) % NX, ib = (ia + 1) % NX, kb = Math.min(NZ - 1, k0 + 1);
      fz[k0 * NX + ia] += w * (1 - tx) * (1 - tz); fz[k0 * NX + ib] += w * tx * (1 - tz);
      fz[kb * NX + ia] += w * (1 - tx) * tz; fz[kb * NX + ib] += w * tx * tz;
    }
    if (p.flow) this.solveStokes();
    else { this.U.fill(0); this.Wv.fill(0); this.OM.fill(0); this.GAM.fill(0); this.flowStats.rms = 0; this.flowStats.max = 0; }

    /* 2. light field */
    this.computeLight();

    /* 3. organisms move as Stokes bodies in the flow */
    for (const col of this.colonies.values()) this.moveColony(col);

    /* 4. mechanics: bonds, steric contact, fracture */
    this.relax(3);
    for (const col of Array.from(this.colonies.values())) if (col.cells.length > 1) this.fracture(col);

    /* 5. predators */
    const deaths = [];
    if (p.predators) this.stepPredators(deaths);
    else if (this.preds.length) this.preds.length = 0;

    /* 6. biology (accelerated clock) */
    this.biology(deaths);

    /* 7. nutrient transport, tracers */
    this.transport();
    this.moveTracers();

    if (deaths.length) {
      const dirty = new Set();
      for (const c of deaths) { for (const n of c.bonds) { const i = n.bonds.indexOf(c); if (i >= 0) n.bonds.splice(i, 1); } c.bonds.length = 0; dirty.add(c.col); }
      for (const col of dirty) this.resolve(col);
      this.cells = this.cells.filter(c => c.alive);
    }
    // generations elapsed: each division adds 1/N of a generation (monotonic, robust to crashes in N)
    this.nAvg += (this.cells.length - this.nAvg) * 0.002;
    const nb = this.born - (this._bornSeen || 0);
    if (nb > 0) { this.gens += nb / Math.max(1, this.cells.length); this._bornSeen = this.born; }
    if (this.t % 20 === 0) { this.stats = this.computeStats(); if (this.t % 40 === 0) this.pushHist(); }
  }

  cellWeight(c) { return (60 - 80 * c.g[BUOY]) * WPP; }   // Δρ from +60 (dense) to −20 kg/m³ (gas vesicles/lipid)

  moveColony(col) {
    const cs = col.cells, n = cs.length;
    this.updateCOM(col);
    let W = 0, T = 0, ns = 0;
    for (const c of cs) {
      W += this.cellWeight(c);
      const swimming = c.soma || c.b < 0.9 || !(c.gr > 0);   // flagellation constraint: no flagella while dividing (regrown if starving)
      if (swimming) { T += F0 * c.g[SWIM] * (c.soma ? 1.3 : 1); ns++; }
    }
    col.ns = ns; col.W = W; col.T = T;
    const zeta = ZETA1 * Math.pow(n, DF);
    const u = this.sample(this.U, col.cx, col.cz), w = this.sample(this.Wv, col.cx, col.cz);
    const om = this.sample(this.OM, col.cx, col.cz);
    col.gam = this.sample(this.GAM, col.cx, col.cz);
    // gyrotaxis: bottom-heavy torque toward "up" + rotation by vorticity + rotational noise
    if (ns > 0) {
      // taxis: swim up toward light unless nutrient is the scarcer resource, then swim down (vertical migration)
      const Il = this.sample(this.I, col.cx, col.cz), Cl = Math.max(0, this.sample(this.C, col.cx, col.cz));
      const fI = Il / (Il + 0.2), fN = Cl / (Cl + 0.15);
      // chemotaxis by klinokinesis is summarised as: if nutrient limits growth, swim along the vertical nutrient gradient
      const dC = this.sample(this.C, col.cx, Math.min(LZ - 1, col.cz + 120)) - this.sample(this.C, col.cx, Math.max(1, col.cz - 120));
      col.down = fN < 0.85 * fI && dC > 0.02;
      const target = col.down ? Math.PI / 2 : -Math.PI / 2;
      const dr = DROT / Math.sqrt(n);
      col.ph += (-Math.sin(col.ph - target) / (2 * B_GYRO) - 0.5 * om) * DT + Math.sqrt(2 * dr * DT) * this.gq();
    }
    const vx = T * Math.cos(col.ph) / zeta, vz = (T * Math.sin(col.ph) + W) / zeta;
    col.vrel = Math.hypot(vx, vz); col.vx = u + vx; col.vz = w + vz;
    // rigid-body rotation with the local fluid (Jeffery, sphere): dθ = −ω/2 dt
    const rot = n > 1 ? -0.5 * om * DT : 0;
    const cr = Math.cos(rot), sr = Math.sin(rot);
    if (n > 1 && Math.abs(rot) > 1e-5) for (const c of cs) {
      const rx = dxMin(c.x - col.cx), rz = c.z - col.cz;
      c.x = wrapX(((col.cx + rx * cr - rz * sr) % LX + LX) % LX); c.z = col.cz + rx * sr + rz * cr;
    }
    // the surface and the sediment stop the organism as a whole (no squashing)
    let zmin = Infinity, zmax = -Infinity;
    for (const c of cs) { if (c.z < zmin) zmin = c.z; if (c.z > zmax) zmax = c.z; }
    let dz = col.vz * DT;
    if (zmin + dz < A) dz = A - zmin;
    if (zmax + dz > LZ - A) dz = Math.min(dz, LZ - A - zmax);
    const dxs = col.vx * DT;
    for (const c of cs) {
      c.x = wrapX(((c.x + dxs) % LX + LX) % LX);
      c.z += dz;
      c.ph = col.ph;
    }
    col.vz = dz / DT;
  }

  relax(iters) {
    const cells = this.cells, head = this.head, next = this.next;
    if (next.length < cells.length) this.next = new Int32Array(cells.length * 2);
    for (let it = 0; it < iters; it++) {
      // bonds as stiff springs (rest length 2a), symmetric so the COM is preserved
      for (const c of cells) for (const o of c.bonds) {
        if (o.id <= c.id) continue;
        let dx = dxMin(o.x - c.x), dz = o.z - c.z, d = Math.sqrt(dx * dx + dz * dz);
        if (d < 1e-3) { dx = 1e-3 * (this.rnd() - 0.5); dz = 1e-3; d = Math.hypot(dx, dz); }
        const corr = 0.5 * (d - 2 * A) / d * 0.8;
        c.x = wrapX(((c.x + dx * corr) % LX + LX) % LX); c.z += dz * corr;
        o.x = wrapX(((o.x - dx * corr) % LX + LX) % LX); o.z -= dz * corr;
      }
      // steric exclusion via a linked-cell hash
      head.fill(-1);
      const nx = this.next;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i], h = Math.min(HZ - 1, Math.max(0, (c.z / HS) | 0)) * HX + Math.min(HX - 1, (c.x / HS) | 0);
        nx[i] = head[h]; head[h] = i;
      }
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i], hx = Math.min(HX - 1, (c.x / HS) | 0), hz = Math.min(HZ - 1, Math.max(0, (c.z / HS) | 0));
        for (let dz = -1; dz <= 1; dz++) {
          const zz = hz + dz; if (zz < 0 || zz >= HZ) continue;
          for (let dxh = -1; dxh <= 1; dxh++) {
            const xx = (hx + dxh + HX) % HX;
            for (let j = head[zz * HX + xx]; j >= 0; j = nx[j]) {
              if (j <= i) continue;
              const o = cells[j];
              if (o.col !== c.col) continue;   // dilute suspension: different organisms pass each other in 3D
              const ex = dxMin(o.x - c.x), ez = o.z - c.z, d2 = ex * ex + ez * ez;
              if (d2 >= 4 * A * A || d2 < 1e-6) continue;
              const d = Math.sqrt(d2), corr = 0.5 * (2 * A - d) / d;
              c.x = wrapX(((c.x - ex * corr) % LX + LX) % LX); c.z -= ez * corr;
              o.x = wrapX(((o.x + ex * corr) % LX + LX) % LX); o.z += ez * corr;
            }
          }
        }
      }
    }
    for (const c of cells) for (const o of c.bonds) {
      if (o.id <= c.id) continue;
      const dx = dxMin(o.x - c.x), dz = o.z - c.z, d = Math.sqrt(dx * dx + dz * dz) || 1e-3;
      const corr = 0.5 * (d - 2 * A) / d * 0.5;
      c.x = wrapX(((c.x + dx * corr) % LX + LX) % LX); c.z += dz * corr;
      o.x = wrapX(((o.x - dx * corr) % LX + LX) % LX); o.z -= dz * corr;
    }
    for (const c of cells) { if (c.z < A) c.z = A; else if (c.z > LZ - A) c.z = LZ - A; }
  }

  fracture(col) {
    const cs = col.cells, n = cs.length;
    // packing strain left in bonds after relaxation
    let tmax = 0, worst = null;
    for (const c of cs) for (const o of c.bonds) {
      if (o.id <= c.id) continue;
      const d = Math.hypot(dxMin(o.x - c.x), o.z - c.z);
      const tns = KB * Math.max(0, d - 2 * A);
      if (tns > tmax) { tmax = tns; worst = [c, o]; }
    }
    // viscous stress across the organism from the local shear rate
    const R = A * Math.pow(n, DF);
    const tsh = 0.5 * 6 * Math.PI * ETA * R * R * col.gam;
    let str = 0; for (const c of cs) str += c.g[BOND]; str /= n;
    col.tension = Math.max(tmax, tsh); col.strength = str;
    if (col.tension <= str) return;
    let a, b;
    if (tsh >= tmax) {
      // shear breaks the most central bond: the one that splits the tree most evenly
      const sub = this.subtree(col);
      let best = -1;
      for (const [c, o, s] of sub) { const v = Math.min(s, n - s); if (v > best) { best = v; a = c; b = o; } }
      this.fracShear++;
    } else { [a, b] = worst; this.fracPack++; }
    if (!a) return;
    this.unbond(a, b);
    this.fractures++;
    this.resolve(col);
  }
  subtree(col) {
    // returns [parent, child, size of child's subtree] for every bond (tree assumed)
    const root = col.cells[0], stamp = ++this.stamp, order = [], par = new Map();
    const st = [root]; root.vis = stamp;
    while (st.length) { const c = st.pop(); order.push(c); for (const o of c.bonds) if (o.vis !== stamp) { o.vis = stamp; par.set(o, c); st.push(o); } }
    const size = new Map(); const out = [];
    for (let i = order.length - 1; i >= 0; i--) {
      const c = order[i]; let s = 1;
      for (const o of c.bonds) if (par.get(o) === c) s += size.get(o) || 1;
      size.set(c, s);
      const pa = par.get(c); if (pa) out.push([pa, c, s]);
    }
    return out;
  }

  stepPredators(deaths) {
    for (const pr of this.preds) {
      pr.age++; pr.phase += 0.15; if (pr.flash > 0) pr.flash--;
      const speed = 80 / (1 + pr.gape / 60);
      let sx = 0, sz = 0;
      if (pr.digest > 0) pr.digest--;
      else {
        if (this.t % 4 === 0 || !pr.target || !pr.target.alive) {
          let best = null, bs = 0;
          for (const col of this.colonies.values()) {
            const n = col.cells.length;
            if (this.colonyDiameter(n) > pr.gape) continue;
            const dx = dxMin(col.cx - pr.x), dz = col.cz - pr.z, d2 = dx * dx + dz * dz;
            if (d2 > 200 * 200) continue;
            const s = n / (d2 + 2500); if (s > bs) { bs = s; best = col; }
          }
          pr.target = best;
        }
        const tg = pr.target;
        if (tg && tg.alive && this.colonyDiameter(tg.cells.length) <= pr.gape) {
          const dx = dxMin(tg.cx - pr.x), dz = tg.cz - pr.z, d = Math.hypot(dx, dz) || 1;
          pr.h = Math.atan2(dz, dx);
          sx = dx / d * speed; sz = dz / d * speed;
          if (d < 20 + this.colonyDiameter(tg.cells.length) / 2 + speed * DT * 0.5) {
            const n = tg.cells.length;
            tg.eaten = true;
            for (const c of tg.cells) if (c.alive) { c.alive = false; deaths.push(c); this.C[this.nodeOf(c.x, c.z)] += 0.5 * c.b / (VNODE * 2.5e-6); }
            pr.e += n * 0.18; pr.digest = 40 + n * 3; pr.flash = 14; this.eaten += n; pr.target = null;
          }
        } else {
          pr.h += this.g() * 0.25; sx = Math.cos(pr.h) * speed * 0.6; sz = Math.sin(pr.h) * speed * 0.6;
        }
      }
      const u = this.sample(this.U, pr.x, pr.z), w = this.sample(this.Wv, pr.x, pr.z);
      pr.x = wrapX((((pr.x + (u + sx) * DT) % LX) + LX) % LX);
      pr.z = Math.min(LZ - 20, Math.max(20, pr.z + (w + sz) * DT));
      pr.e = Math.max(0, pr.e - 0.0032 * (1 + pr.gape / 40));
    }
    // predator turnover (Moran process): the best-fed predator replaces the hungriest one
    const P = this.preds;
    const target = this.predTarget();
    while (P.length < target) P.push(this.makePred(this.rnd() * LX, 200 + this.rnd() * (LZ - 400), P.length ? P[0].gape : 13, 1));
    if (P.length > target) { P.sort((a, b) => b.e - a.e); P.length = target; }
    if (this.t % 60 === 0 && P.length > 1) {
      let hi = P[0], lo = P[0];
      for (const pr of P) { if (pr.e > hi.e) hi = pr; if (pr.e < lo.e) lo = pr; }
      if (hi !== lo && hi.e > lo.e + 0.3) {
        const child = this.makePred(hi.x, hi.z, hi.gape * Math.exp(this.g() * 0.07 + (this.rnd() < 0.04 ? 0.25 : 0)), hi.e / 2);
        hi.e /= 2;
        P[P.indexOf(lo)] = child;
      }
    }
  }

  biology(deaths) {
    const p = this.p, dtb = DT * p.acc;
    const mu = 2.9e-5;                       // max growth rate, 1/s (doubling ≈ 6.6 h)
    const KI = 0.2, KN = 0.15, kappa = 2.5e-6;
    const births = [];
    // resource sharing inside organisms: soma export surplus to germ cells
    for (const col of this.colonies.values()) col.pool = 0;
    for (const c of this.cells) {
      if (!c.alive) continue;
      c.age++;
      const n = this.nodeOf(c.x, c.z);
      const N = c.col.cells.length;
      const Il = this.I[n] / (1 + N / 300);                     // self-shading inside the organism
      const Cn = Math.max(0, this.C[n]);
      const lim = Math.min(Il / (Il + KI), Cn / (Cn + KN));
      let grow = mu * c.b * lim * dtb;
      c.lim = lim; c.fI = Il / (Il + KI); c.fN = Cn / (Cn + KN);
      const need = grow / (VNODE * kappa);
      if (need > Cn) grow = Cn * VNODE * kappa;
      this.C[n] -= grow / (VNODE * kappa);
      const swimming = c.soma || c.b < 0.9 || !(c.gr > 0);
      const cost = mu * dtb * c.b * (0.04 + (swimming ? 0.12 * c.g[SWIM] : 0) + 0.006 * c.g[BOND] * c.bonds.length + 0.22 * c.g[BUOY] + 0.02);
      if (c.soma) { c.col.pool += Math.max(0, grow - cost); c.b = Math.min(1, c.b - Math.max(0, cost - grow)); }
      else c.b += grow - cost;
      c.gr = grow - cost;
      const old = (c.soma && c.age > 1500) || this.rnd() < 0.1 * mu * dtb;
      if (c.b < 0.3 || old) {
        c.alive = false; deaths.push(c);
        this.C[n] += 0.5 * c.b / (VNODE * kappa);   // half recycled, half buried in the sediment
        continue;
      }
      if (!c.soma && c.b >= 1 && this.cells.length + births.length < p.cap) births.push(c);
    }
    // distribute soma surplus to germ cells
    for (const col of this.colonies.values()) {
      if (!col.pool) continue;
      let ng = 0; for (const c of col.cells) if (!c.soma && c.alive) ng++;
      if (!ng) continue;
      const share = col.pool / ng; for (const c of col.cells) if (!c.soma && c.alive) c.b += share;
    }
    for (const m of births) {
      if (!m.alive) continue;
      const { g, mutated } = this.mutate(m.g);
      const col = m.col;
      // bud away from the organism's centre
      const ax = dxMin(m.x - col.cx), az = m.z - col.cz, base = (ax || az) ? Math.atan2(az, ax) : this.rnd() * 6.28;
      const a = base + this.g() * 0.9;
      const d = this.makeCell(wrapX((((m.x + Math.cos(a) * 2 * A) % LX) + LX) % LX), Math.min(LZ - A, Math.max(A, m.z + Math.sin(a) * 2 * A)), g, m.b * 0.5, false, mutated ? this.nextGeno++ : m.geno);
      m.b *= 0.5; this.born++;
      if (m.bonds.length < 3 && this.rnd() < m.g[ADH]) {
        d.bonds.push(m); m.bonds.push(d);
        if (this.rnd() < m.g[SOMA]) d.soma = true;
        d.col = col; col.cells.push(d); this.cells.push(d);
        if (col.cells.length > col.peak) col.peak = col.cells.length;
      } else {
        this.cells.push(d);
        this.reproduced(col, col.cells.length);
        this.newColony(col, [d]);
      }
    }
  }

  moveTracers() {
    const tr = this.tr;
    for (let i = 0; i < tr.length; i += 4) {
      let x = tr[i], z = tr[i + 1];
      tr[i + 2] = x; tr[i + 3] = z;
      const u = this.sample(this.U, x, z), w = this.sample(this.Wv, x, z);
      x += u * DT + this.gq() * 0.6; z += w * DT + this.gq() * 0.6;
      if (z < 2) z = 2 + this.rnd() * 4; else if (z > LZ - 2) z = LZ - 2 - this.rnd() * 4;
      if (x < 0 || x >= LX) { x = ((x % LX) + LX) % LX; tr[i + 2] = x; }
      tr[i] = x; tr[i + 1] = z;
    }
  }

  /* ---------- statistics ---------- */
  computeStats() {
    const n = this.cells.length;
    const mg = new Float32Array(NG), cls = new Float32Array(5);
    let inG = 0, ss = 0, maxS = 0, multi = 0, soma = 0, bonded = 0, depth = 0, swimmers = 0;
    const prof = new Float32Array(16), profM = new Float32Array(16);
    for (const c of this.cells) {
      for (let k = 0; k < NG; k++) mg[k] += c.g[k];
      if (c.bonds.length) { bonded++; if (c.soma) soma++; }
      depth += c.z;
      const bin = Math.min(15, (c.z / LZ * 16) | 0);
      if (c.col.cells.length > 1) profM[bin]++; else prof[bin]++;
    }
    if (n) { for (let k = 0; k < NG; k++) mg[k] /= n; depth /= n; }
    for (const col of this.colonies.values()) {
      const s = col.cells.length; if (!s) continue;
      if (s > 1) { multi++; inG += s; }
      ss += s * s; if (s > maxS) maxS = s;
      cls[s === 1 ? 0 : s < 4 ? 1 : s < 16 ? 2 : s < 64 ? 3 : 4] += s;
      swimmers += col.ns || 0;
    }
    if (n) for (let k = 0; k < 5; k++) cls[k] /= n;
    let pg = 0; for (const p of this.preds) pg += p.gape;
    // horizontally averaged light and nutrient profiles
    const Iz = new Float32Array(NZ), Cz = new Float32Array(NZ);
    for (let k = 0; k < NZ; k++) { let si = 0, sc = 0; for (let i = 0; i < NX; i++) { si += this.I[k * NX + i]; sc += this.C[k * NX + i]; } Iz[k] = si / NX; Cz[k] = sc / NX; }
    const st = {
      n, multi, inGroups: n ? inG / n : 0, meanSize: n ? ss / n : 0, maxSize: maxS, mg, cls,
      soma: bonded ? soma / bonded : 0, preds: this.preds.length, gape: this.preds.length ? pg / this.preds.length : 0,
      depth, prof, profM, Iz, Cz, rms: this.flowStats.rms, vmax: this.flowStats.max,
    };
    this.checkMilestones(st);
    return st;
  }
  checkMilestones(st) {
    const M = this.milestones;
    const hit = (k, cond) => { if (!M[k] && cond) { M[k] = this.t; this.log(k, {}); } };
    hit('ms_plumes', this.t > 40 && st.rms > 12);
    hit('ms_first8', st.maxSize >= 8);
    hit('ms_half', st.inGroups >= 0.5);
    hit('ms_32', st.maxSize >= 32);
    hit('ms_soma', st.soma >= 0.15);
    hit('ms_float', st.mg[BUOY] >= 0.6);
    hit('ms_majority', st.inGroups >= 0.9);
    hit('ms_gape', st.preds > 0 && st.gape >= 30);
  }
  pushHist() {
    const s = this.stats;
    this.hist.push({ t: this.t, n: s.n, cls: Array.from(s.cls), mg: Array.from(s.mg), meanSize: s.meanSize, maxSize: s.maxSize, soma: s.soma, preds: s.preds, gape: s.gape, inGroups: s.inGroups, rms: s.rms, vmax: s.vmax, depth: s.depth, frac: this.fractures });
    if (this.hist.length > 900) { const keep = []; for (let i = 0; i < this.hist.length; i++) if (i >= 450 || i % 2 === 0) keep.push(this.hist[i]); this.hist = keep; }
  }
  groupGalton() {
    const pts = this.pairs.slice(-500); let sx = 0, sy = 0, sxx = 0, sxy = 0; const n = pts.length;
    for (const [x, y] of pts) { sx += x; sy += y; sxx += x * x; sxy += x * y; }
    let slope = NaN, icpt = 0;
    if (n > 10) { const mx = sx / n, my = sy / n, vx = sxx / n - mx * mx; if (vx > 0.02) { slope = (sxy / n - mx * my) / vx; icpt = my - slope * mx; } }
    return { pts, n, slope, icpt };
  }

  /* ---------- interaction ---------- */
  colonyAt(x, z, r = 14) {
    let best = null, bd = r * r;
    for (const c of this.cells) { const dx = dxMin(c.x - x), dz = c.z - z, d = dx * dx + dz * dz; if (d < bd) { bd = d; best = c; } }
    return best ? best.col : null;
  }
  lineage(col, max = 40) {
    const out = []; let id = col.id;
    while (id && out.length < max) { const r = this.archive.get(id); if (!r) break; const live = this.colonies.get(id); if (live) { r.peak = live.peak; r.repro = live.reproSize; } out.push(r); id = r.parent; }
    return out;
  }
  colonyInfo(col) {
    const cs = col.cells, n = cs.length; let soma = 0; const gm = new Float32Array(NG); const genos = new Set();
    for (const c of cs) { if (c.soma) soma++; for (let k = 0; k < NG; k++) gm[k] += c.g[k]; genos.add(c.geno); }
    for (let k = 0; k < NG; k++) gm[k] /= n;
    const light = this.sample(this.I, col.cx, col.cz), nut = this.sample(this.C, col.cx, col.cz);
    return { n, soma: n ? soma / n : 0, gm, genotypes: genos.size, light, nut, vrel: col.vrel, vz: col.vz, gam: col.gam, tension: col.tension || 0, strength: col.strength || gm[BOND], depth: col.cz, W: col.W, T: col.T, ns: col.ns, diam: this.colonyDiameter(n) };
  }
  setParam(k, v) {
    const old = this.p[k]; this.p[k] = v;
    if (k === 'predators' && v && !old) { this.seedPredators(this.predTarget(), 13); this.log('predOn', {}); }
    if (k === 'predators' && !v && old) this.log('predOff', {});
    if (k === 'flow' && v !== old) this.log(v ? 'flowOn' : 'flowOff', {});
  }
  /* ---------- persistence ---------- */
  serialize() {
    const r6 = (v) => Math.round(v * 1e6) / 1e6, r3 = (v) => Math.round(v * 1e3) / 1e3;
    const cells = this.cells.map(c => [c.id, r3(c.x), r3(c.z), r6(c.b), c.soma ? 1 : 0, c.geno, c.age, c.born, r3(c.ph), Array.from(c.g, r6), c.col.id, c.bonds.map(o => o.id), r6(c.gr || 0)]);
    const cols = [];
    for (const col of this.colonies.values()) cols.push([col.id, col.parent, col.gen, col.born, r3(col.hue), r3(col.ph), col.peak, col.reproSize, col.parentRepro, col.kids]);
    const preds = this.preds.map(p => [p.id, r3(p.x), r3(p.z), r6(p.e), r6(p.gape), p.age, p.maxAge, p.digest, r3(p.h)]);
    const arch = Array.from(this.archive.values()).slice(-6000).map(r => [r.id, r.parent, r.gen, r.born, r.died, r.peak, r3(r.hue), r.repro]);
    return {
      v: 1, seed: this.seed, rs: this._rs, t: this.t, p: this.p,
      next: [this.nextId, this.nextCol, this.nextGeno],
      counters: { born: this.born, eaten: this.eaten, fractures: this.fractures, fracShear: this.fracShear, fracPack: this.fracPack, gens: this.gens, nAvg: this.nAvg, _bornSeen: this.born },
      C: Array.from(this.C, r6), cells, cols, preds, arch,
      hist: this.hist, events: this.events, milestones: this.milestones, pairs: this.pairs.slice(-500),
    };
  }
  static fromState(st) {
    const sim = new Column(st.seed, st.p);
    sim._rs = st.rs; sim.t = st.t; sim.p = Object.assign(sim.p, st.p);
    [sim.nextId, sim.nextCol, sim.nextGeno] = st.next;
    Object.assign(sim, st.counters);
    sim.C.set(st.C);
    sim.colonies = new Map(); sim.archive = new Map(); sim.cells = [];
    for (const r of st.arch) sim.archive.set(r[0], { id: r[0], parent: r[1], gen: r[2], born: r[3], died: r[4], peak: r[5], hue: r[6], repro: r[7] });
    const colById = new Map();
    for (const a of st.cols) {
      const col = { id: a[0], parent: a[1], gen: a[2], born: a[3], cells: [], alive: true, hue: a[4], ph: a[5], cx: 0, cz: 0, vx: 0, vz: 0, vrel: 0, gam: 0, tension: 0, kids: a[9], peak: a[6], reproSize: a[7], parentRepro: a[8], eaten: false, depth: 0 };
      col.rec = sim.archive.get(col.id) || { id: col.id, parent: col.parent, gen: col.gen, born: col.born, died: null, peak: col.peak, hue: col.hue, repro: col.reproSize };
      sim.archive.set(col.id, col.rec);
      colById.set(col.id, col); sim.colonies.set(col.id, col);
    }
    const cellById = new Map();
    for (const a of st.cells) {
      const c = sim.makeCell(a[1], a[2], Float32Array.from(a[9]), a[3], !!a[4], a[5]);
      c.id = a[0]; c.age = a[6]; c.born = a[7]; c.ph = a[8]; c.gr = a[12];
      c.col = colById.get(a[10]); c.col.cells.push(c);
      cellById.set(c.id, c); sim.cells.push(c);
    }
    st.cells.forEach(a => { const c = cellById.get(a[0]); c.bonds = a[11].map(id => cellById.get(id)).filter(Boolean); });
    for (const col of Array.from(sim.colonies.values())) { if (!col.cells.length) sim.colonies.delete(col.id); else sim.updateCOM(col); }
    sim.preds = st.preds.map(a => ({ id: a[0], x: a[1], z: a[2], e: a[3], gape: a[4], age: a[5], maxAge: a[6], digest: a[7], h: a[8], phase: 0, target: null, flash: 0 }));
    sim.hist = st.hist || []; sim.events = st.events || []; sim.milestones = st.milestones || {}; sim.pairs = st.pairs || [];
    sim.computeLight();
    sim.stats = sim.computeStats();
    return sim;
  }

  /* slow environmental change for long runs: a bounded random walk of the "climate" */
  climate(rate = 1) {
    const walk = (k, sd, lo, hi) => { this.p[k] = Math.min(hi, Math.max(lo, this.p[k] + this.g() * sd * rate)); };
    walk('light', 0.05, 0.4, 1.4);
    walk('turbidity', 0.00006, 0.0004, 0.002);
    walk('nutrient', 0.05, 0.5, 1.6);
    walk('predRatio', 0.15, 0.5, 5);
    if (this.rnd() < 0.005 * rate) this.p.source = this.p.source === 'mixed' ? 'sediment' : 'mixed';
  }

  stir() {
    // shake the jar: every organism is displaced vertically as a rigid body
    for (const col of this.colonies.values()) {
      const dz = this.g() * 400;
      let zmin = Infinity, zmax = -Infinity; for (const c of col.cells) { zmin = Math.min(zmin, c.z); zmax = Math.max(zmax, c.z); }
      const d = Math.max(A - zmin, Math.min(LZ - A - zmax, dz));
      for (const c of col.cells) c.z += d;
    }
    this.log('stir', {});
  }
}

const API = { Column, GENES, NG, ADH, SOMA, SWIM, BOND, BUOY, LX, LZ, NX, NZ, DX, A, ETA, WPP, ZETA1, DF, F0, D_N, DT, B_GYRO, HSL };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.GenesisColumn = API;
})(typeof globalThis !== 'undefined' ? globalThis : this);
