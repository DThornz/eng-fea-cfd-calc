/* ================================================================
   calcs-misc.js — Miscellaneous engineering calculators
   Sections: dynamics (mass-spring-damper, projectile), civil /
             geotechnical (Manning, Darcy flow), FEA tools (GCI,
             aspect ratio, time step, modal participation), aerospace
             (lift/drag, stall speed, Tsiolkovsky rocket, orbital
             mechanics, Hohmann transfer), acoustics (SPL, RT60),
             optics (thin lens / lensmaker, diffraction limit),
             lab & research (dilution C₁V₁, molarity, PCR Tm,
             SEM scale bar, h-index, image DPI), chemical
             engineering (ideal gas, Antoine vapour pressure,
             CSTR, PFR, Damköhler, van der Waals).

   HOW TO ADD A NEW CARD:
     1. Write a calc function here (or in the file matching its domain).
     2. Add the card HTML in the relevant <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Dynamics ───────────────────────────────────────────────── */

/* Mass-spring-damper system (natural frequency, damping ratio, type) */
function msdCalc() {
  const m = gv('msd-m') * gu('msd-m-u'), k = gv('msd-k') * gu('msd-k-u'), c = gv('msd-c') * gu('msd-c-u');
  if (!m || !k) return;
  const wn   = Math.sqrt(k / m), cc = 2 * Math.sqrt(k * m);
  const zeta = c / cc, wd = wn * Math.sqrt(Math.max(0, 1 - zeta * zeta));
  const fn   = wn / (2 * Math.PI), fd = wd / (2 * Math.PI);
  const type = zeta < 0 ? 'Negative damping' : zeta === 0 ? 'Undamped' : zeta < 1 ? 'Underdamped' : zeta === 1 ? 'Critically damped' : 'Overdamped';
  const td   = zeta < 1 && zeta > 0 ? 2 * Math.PI / wd : null;
  res('msd-body', [
    ['Natural freq ω_n',   wn.toFixed(4) + ' rad/s',   'ω_n = √(k/m)'],
    ['Natural freq f_n',   fn.toFixed(4) + ' Hz',       'f_n = ω_n/(2π)'],
    ['Critical damping c_cr', cc.toFixed(4) + ' N·s/m', 'c_cr = 2√(km)'],
    ['Damping ratio ζ',    zeta.toFixed(4),              'ζ = c/c_cr'],
    ['Response type',      type,                         ''],
    ...(zeta < 1 && zeta > 0 ? [
      ['Damped freq ω_d',  wd.toFixed(4) + ' rad/s',   'ω_d = ω_n√(1−ζ²)'],
      ['Damped period T_d', td.toFixed(4) + ' s',       'T_d = 2π/ω_d'],
    ] : []),
  ]);
  const _e = document.getElementById('msd-out');
  if (_e) _e.classList.add('visible');
}

/* Projectile motion */
function projCalc() {
  const v0    = gv('proj-v0') * gu('proj-v0-u');
  const theta = gv('proj-th') * Math.PI / 180;
  const h0    = gv('proj-h0') * gu('proj-h0-u');
  const gc    = gv('proj-g');
  if (!v0 || isNaN(theta) || !gc) return;
  const vx = v0 * Math.cos(theta), vy = v0 * Math.sin(theta);
  const disc = vy * vy + 2 * gc * h0;
  if (disc < 0) { res('proj-body', [['Error', 'No real solution (cannot reach ground)', '']]); const _e = document.getElementById('proj-out'); if (_e) _e.classList.add('visible'); return; }
  const tf = (vy + Math.sqrt(disc)) / gc;
  const R  = vx * tf, Hmax = h0 + vy * vy / (2 * gc);
  res('proj-body', [
    ['Range R',           R.toFixed(2) + ' m',              'R = v_x·t_f'],
    ['Max height H',      Hmax.toFixed(2) + ' m',           'H = h₀ + v_y²/(2g)'],
    ['Time of flight',    tf.toFixed(4) + ' s',             ''],
    ['Time to peak',      (vy / gc).toFixed(4) + ' s',      ''],
    ['Impact velocity',   Math.sqrt(vx*vx + (vy - gc*tf)**2).toFixed(3) + ' m/s', ''],
    ['Optimum angle',     h0 === 0 ? '45°' : 'Depends on h₀', ''],
  ]);
  const _e = document.getElementById('proj-out');
  if (_e) _e.classList.add('visible');
}

/* ── Civil / geotechnical ───────────────────────────────────── */

/* Manning's equation — rectangular open channel */
function mannRect() {
  const n  = gv('mn-n'), b = gv('mn-b') * gu('mn-b-u'), y = gv('mn-y') * gu('mn-y-u'), S = gv('mn-S');
  if (!n || !b || !y || !S) return;
  const A = b * y, Pw = b + 2 * y, Rh = A / Pw;
  const Q = (1 / n) * A * Math.pow(Rh, 2 / 3) * Math.sqrt(S);
  const V = Q / A, Fr = V / Math.sqrt(9.81 * y);
  res('mn-body', [
    ['Discharge Q',       Q.toFixed(4) + ' m³/s  =  ' + (Q * 1000).toFixed(2) + ' L/s', 'Q=(1/n)·A·R_h^(2/3)·S^(1/2)'],
    ['Flow velocity V',   V.toFixed(4) + ' m/s',    'V = Q/A'],
    ['Hydraulic radius R_h', (Rh * 100).toFixed(3) + ' cm', 'R_h = A/P_w'],
    ['Froude number Fr',  Fr.toFixed(3), Fr < 1 ? 'Subcritical (Fr<1)' : Fr > 1 ? 'Supercritical (Fr>1)' : 'Critical'],
    ['Flow type',         Fr < 1 ? 'Subcritical' : Fr > 1 ? 'Supercritical' : 'Critical', ''],
  ]);
  const _e = document.getElementById('mn-out');
  if (_e) _e.classList.add('visible');
}

/* Manning's equation — circular pipe (full flow) */
function mannCirc() {
  const n  = gv('mnc-n'), D = gv('mnc-D') * gu('mnc-D-u'), S = gv('mnc-S');
  if (!n || !D || !S) return;
  const A = Math.PI * D * D / 4, Rh = D / 4, Pw = Math.PI * D;
  const Q = (1 / n) * A * Math.pow(Rh, 2 / 3) * Math.sqrt(S);
  const V = Q / A, Fr = V / Math.sqrt(9.81 * (D / 2));
  res('mnc-body', [
    ['Full-pipe discharge Q',  Q.toFixed(4) + ' m³/s', 'Q=(1/n)·A·R_h^(2/3)·S^(1/2)'],
    ['Full-pipe velocity V',  V.toFixed(4) + ' m/s', ''],
    ['Hydraulic radius R_h',  (Rh * 100).toFixed(3) + ' cm', 'D/4 for full circle'],
    ['Froude number Fr',      Fr.toFixed(3), ''],
  ]);
  const _e = document.getElementById('mnc-out');
  if (_e) _e.classList.add('visible');
}

/* Darcy's law — groundwater seepage */
function darcyCalc() {
  const k = gv('da-k') * gu('da-k-u'), dh = gv('da-dh') * gu('da-dh-u');
  const L = gv('da-L') * gu('da-L-u'), A  = gv('da-A')  * gu('da-A-u');
  if (!k || !dh || !L || !A) return;
  const i = dh / L, vel = k * i, Q = k * i * A;
  res('da-body', [
    ['Hydraulic gradient i', i.toFixed(6),                                             'i = Δh/L'],
    ['Darcy velocity v',     (vel * 1000).toFixed(4) + ' mm/s',                        'v = k·i'],
    ['Volumetric flow Q',    (Q * 1000).toFixed(4) + ' L/s  =  ' + (Q * 86400).toFixed(2) + ' m³/day', 'Q = k·i·A'],
    ['Seepage velocity v_s', 'Q/(n·A) — need porosity n', '≈ v/n for typical soils'],
  ]);
  const _e = document.getElementById('da-out');
  if (_e) _e.classList.add('visible');
}

/* ── FEA / numerical methods ────────────────────────────────── */

/* Grid Convergence Index (Richardson extrapolation) */
function gciCalc() {
  const f1 = v('gci-f1'), f2 = v('gci-f2'), f3 = v('gci-f3'), r = v('gci-r') || Math.SQRT2;
  if (r <= 1) return errOut('gci-out', 'Refinement ratio r must be > 1.');
  const e32    = (f3 - f2) / f2, e21 = (f2 - f1) / f1;
  const p      = Math.log(Math.abs(e32 / e21)) / Math.log(r);
  const f_exact = f1 + (f1 - f2) / (Math.pow(r, p) - 1);
  const Fs     = 1.25;
  const GCI21  = Fs * Math.abs(e21) / (Math.pow(r, p) - 1);
  const GCI32  = Fs * Math.abs(e32) / (Math.pow(r, p) - 1);
  const asym   = GCI21 / (Math.pow(r, p) * GCI32);
  showOut('gci-out', [
    { label: 'Order of convergence p',  val: fmtN(p),            unit: '', cls: p > 1 ? 'good' : 'warn' },
    { label: 'Extrapolated value',      val: fmtN(f_exact),      unit: '', cls: 'good' },
    { label: 'GCI₂₁ (fine grid)',      val: fmtN(GCI21 * 100),  unit: '%' },
    { label: 'GCI₃₂ (medium grid)',    val: fmtN(GCI32 * 100),  unit: '%' },
    { label: 'Asymptotic range check', val: Math.abs(asym - 1) < 0.25 ? 'Yes — in asymptotic range' : 'No — refine further', unit: '', cls: Math.abs(asym - 1) < 0.25 ? 'good' : 'warn' },
  ], 'GCI<1%: grid-independent. GCI 1–5%: acceptable. GCI>5%: refine mesh. Report all three GCI values in CFD publications.');
}

/* Element aspect ratio check */
function arqCalc() {
  const L1 = v('arq-L1'), L2 = v('arq-L2'), L3 = v('arq-L3'), L4 = v('arq-L4');
  const sides = [L1, L2, L3, L4].filter(x => isFinite(x) && x > 0);
  if (sides.length < 2) return errOut('arq-out', 'Enter at least 2 side lengths.');
  const AR = Math.max(...sides) / Math.min(...sides);
  showOut('arq-out', [
    { label: 'Aspect ratio', val: fmtN(AR), unit: '', cls: AR < 3 ? 'good' : AR < 5 ? 'warn' : 'bad' },
    { label: 'Quality',      val: AR < 3 ? 'Good' : AR < 5 ? 'Acceptable — monitor' : 'Poor — consider remeshing', unit: '' },
    { label: 'Max / Min length', val: `${fmtN(Math.max(...sides))} / ${fmtN(Math.min(...sides))}`, unit: '' },
  ], 'AR<3: excellent. AR<5: acceptable. AR>10: accuracy may degrade. High AR is OK for aligned boundary layer elements.');
}

/* Explicit time step stability */
function exptsCalc() {
  const tab = document.querySelector('#expts-tabs .tab.active').dataset.tab;
  if (tab === 'struct') {
    const L = v('expts-L') * su('expts-L-u'), E = v('expts-E') * 1e9, rho = v('expts-rho');
    if (L <= 0 || E <= 0 || rho <= 0) return errOut('expts-out', 'All values must be positive.');
    const c  = Math.sqrt(E / rho);
    const dt = L / c;
    showOut('expts-out', [
      { label: 'Wave speed c',       val: fmtN(c),           unit: 'm/s', cls: 'good' },
      { label: 'Critical Δt',       val: fmtN(dt * 1e6),    unit: 'μs' },
      { label: 'Recommended Δt',    val: fmtN(dt * 0.9e6),  unit: 'μs (0.9 × critical)' },
    ], 'Use Δt_stable/2 for a safety margin. Implicit schemes allow larger Δt but require a matrix solve each step.');
  } else {
    const L = v('expts-dx') * su('expts-dx-u'), u = v('expts-u') * su('expts-u-u');
    if (L <= 0 || u <= 0) return errOut('expts-out', 'Δx and u must be positive.');
    const dt = L / u;
    showOut('expts-out', [
      { label: 'Max stable Δt (CFL=1)', val: fmtN(dt * 1e6),       unit: 'μs', cls: 'good' },
      { label: 'Recommended (CFL=0.8)', val: fmtN(dt * 0.8e6),     unit: 'μs' },
    ], 'CFL>1 for explicit schemes causes instability. Implicit schemes tolerate CFL>1 but accuracy suffers at large values.');
  }
}

/* Modal participation factor (3-DOF) */
function mpfCalc() {
  const m   = [v('mpf-m1'), v('mpf-m2'), v('mpf-m3')];
  const phi = [v('mpf-p1'), v('mpf-p2'), v('mpf-p3')];
  if (m.some(x => x <= 0)) return errOut('mpf-out', 'All masses must be positive.');
  const Lm   = phi.reduce((a, p, i) => a + p * m[i], 0);
  const Mm   = phi.reduce((a, p, i) => a + p * p * m[i], 0);
  const Mtot = m.reduce((a, b) => a + b, 0);
  const gamma = Lm / Mm, Meff = Lm * Lm / Mm;
  showOut('mpf-out', [
    { label: 'Γ (participation factor)', val: fmtN(gamma), unit: '', cls: 'good' },
    { label: 'Effective mass',           val: fmtN(Meff),  unit: 'kg' },
    { label: 'Effective mass fraction',  val: fmtN(Meff / Mtot * 100), unit: '%' },
  ], 'Sum of all modal effective masses = total structural mass (check). Modes with >1% fraction are seismically significant. ASCE 7: reach 90% cumulative mass participation.');
}

/* ── Aerospace ──────────────────────────────────────────────── */

/* Lift and drag from aerodynamic coefficients */
function ldCalc() {
  const rho = v('ld-rho'), V = v('ld-V') * su('ld-V-u'), S = v('ld-S'), CL = v('ld-CL'), CD = v('ld-CD');
  if (rho <= 0 || V <= 0 || S <= 0) return errOut('ld-out', 'ρ, V, S must be positive.');
  const q = 0.5 * rho * V * V, L = q * S * CL, D = q * S * CD;
  showOut('ld-out', [
    { label: 'Dynamic pressure q', val: fmtN(q), unit: 'Pa' },
    { label: 'Lift L',             val: fmtN(L), unit: 'N', cls: 'good' },
    { label: 'Drag D',             val: fmtN(D), unit: 'N' },
    { label: 'L/D ratio',          val: CD > 0 ? fmtN(CL / CD) : '—', unit: '' },
  ], 'Typical cruise L/D: commercial aircraft 15–20; glider 40+; helicopter 4–8. For level flight: L=W.');
}

/* Wing stall speed */
function stallCalc() {
  const W = v('stall-W') * su('stall-W-u'), rho = v('stall-rho'), S = v('stall-S'), CLmax = v('stall-CLmax');
  if (W <= 0 || rho <= 0 || S <= 0 || CLmax <= 0) return errOut('stall-out', 'All values must be positive.');
  const Vs = Math.sqrt(2 * W / (rho * S * CLmax));
  showOut('stall-out', [
    { label: 'Stall speed Vs',  val: fmtN(Vs),         unit: 'm/s', cls: 'good' },
    { label: 'Stall speed',     val: fmtN(Vs * 1.944), unit: 'knots' },
    { label: 'Wing loading W/S', val: fmtN(W / S),     unit: 'N/m²' },
  ], 'CLmax: clean wing 1.2–1.5; full flaps 2.5–3.5. Stall speed increases with altitude (lower ρ) and bank angle (factor √(1/cosφ)).');
}

/* Tsiolkovsky rocket equation */
function rktCalc() {
  const Isp = v('rkt-Isp'), m0 = v('rkt-m0'), mf = v('rkt-mf'), g0 = 9.80665;
  if (mf <= 0 || m0 <= mf || Isp <= 0) return errOut('rkt-out', 'm0 > mf > 0, Isp > 0.');
  const dV = Isp * g0 * Math.log(m0 / mf);
  const mr = m0 / mf, pf = (m0 - mf) / m0;
  showOut('rkt-out', [
    { label: 'ΔV',               val: fmtN(dV),       unit: 'm/s', cls: 'good' },
    { label: 'ΔV',               val: fmtN(dV / 1000), unit: 'km/s' },
    { label: 'Mass ratio m₀/mf', val: fmtN(mr),       unit: '' },
    { label: 'Propellant fraction', val: fmtN(pf * 100), unit: '%' },
  ], 'For LEO (ΔV≈9.4 km/s) with Isp=450 s: mass ratio≈8.6 — over 87% of launch mass is propellant. Multiple stages break this limit.');
}

/* Circular orbit mechanics */
function orbCalc() {
  const h    = v('orb-h') * 1000;
  const body = g('orb-body').value;
  const bodies = { earth: { mu: 3.986e14, R: 6.371e6 }, moon: { mu: 4.9e12, R: 1.737e6 }, mars: { mu: 4.282e13, R: 3.39e6 } };
  const { mu, R } = bodies[body];
  const r  = R + h;
  const T  = 2 * Math.PI * Math.sqrt(r ** 3 / mu);
  const vc = Math.sqrt(mu / r), ve = Math.sqrt(2 * mu / r);
  showOut('orb-out', [
    { label: 'Orbital radius r',  val: fmtN(r / 1e6),   unit: '× 10³ km' },
    { label: 'Orbital period T',  val: fmtN(T / 60),    unit: 'min', cls: 'good' },
    { label: 'Circular velocity', val: fmtN(vc),         unit: 'm/s' },
    { label: 'Escape velocity',   val: fmtN(ve),         unit: 'm/s' },
  ], 'LEO (~400 km): v≈7.67 km/s, T≈92 min. GEO (35786 km): v≈3.07 km/s, T≈24 h. Escape velocity = √2 × circular velocity.');
}

/* Hohmann transfer orbit */
function hohCalc() {
  const r1 = v('hoh-r1') * 1e3, r2 = v('hoh-r2') * 1e3;
  const body = g('hoh-body').value;
  const mu   = { earth: 3.986e14, moon: 4.9e12, mars: 4.282e13 }[body];
  if (r1 <= 0 || r2 <= 0) return errOut('hoh-out', 'Both radii must be positive.');
  const dv1  = Math.sqrt(mu / r1) * (Math.sqrt(2 * r2 / (r1 + r2)) - 1);
  const dv2  = Math.sqrt(mu / r2) * (1 - Math.sqrt(2 * r1 / (r1 + r2)));
  const ttrans = Math.PI * Math.sqrt((r1 + r2) ** 3 / (8 * mu));
  showOut('hoh-out', [
    { label: 'Δv₁',           val: fmtN(dv1),                         unit: 'm/s', cls: 'good' },
    { label: 'Δv₂',           val: fmtN(dv2),                         unit: 'm/s' },
    { label: 'Total ΔV',      val: fmtN(Math.abs(dv1) + Math.abs(dv2)), unit: 'm/s' },
    { label: 'Transfer time', val: fmtN(ttrans / 3600),               unit: 'hours' },
  ], 'Hohmann is the most propellant-efficient 2-burn transfer between circular coplanar orbits. For transfers >√2 times r₁, bi-elliptic may be more efficient.');
}

/* ── Acoustics ──────────────────────────────────────────────── */

/* Sound pressure level */
function splCalc() {
  const mode = g('spl-mode').value;
  let spl;
  if (mode === 'P') { const P = v('spl-P') * su('spl-P-u'); if (P <= 0) return errOut('spl-out', 'P must be positive.'); spl = 20 * Math.log10(P / 20e-6); }
  else              { const I = v('spl-I'); if (I <= 0) return errOut('spl-out', 'I must be positive.'); spl = 10 * Math.log10(I / 1e-12); }
  const interp = spl < 20 ? 'Threshold of hearing (~0 dB)' : spl < 35 ? 'Quiet room (~30 dB)' : spl < 65 ? 'Normal conversation (~60 dB)' : spl < 85 ? 'Busy street (~80 dB)' : spl < 95 ? 'Lawn mower (~90 dB)' : spl < 125 ? 'Jet at 100m (~120 dB)' : 'Painful (~130 dB)';
  showOut('spl-out', [
    { label: 'SPL',           val: fmtN(spl), unit: 'dB', cls: spl > 85 ? 'warn' : 'good' },
    { label: 'Reference',     val: mode === 'P' ? '20 μPa (acoustic)' : '10⁻¹² W/m²', unit: '' },
    { label: 'Interpretation', val: interp, unit: '' },
  ], '0 dBSPL: threshold. 40 dB: quiet room. 70 dB: conversation. 85 dB: OSHA 8-h limit. 120 dB: pain threshold. Every 10 dB = 10× intensity.');
}

/* Sabine reverberation time (RT60) */
function rtCalc() {
  const V = v('rt-V');
  const S1 = v('rt-S1'), a1 = v('rt-a1'), S2 = v('rt-S2'), a2 = v('rt-a2');
  const S3 = v('rt-S3'), a3 = v('rt-a3'), S4 = v('rt-S4'), a4 = v('rt-a4');
  const A = S1 * a1 + (isFinite(S2) && S2 > 0 ? S2 * a2 : 0) + (isFinite(S3) && S3 > 0 ? S3 * a3 : 0) + (isFinite(S4) && S4 > 0 ? S4 * a4 : 0);
  if (V <= 0 || A <= 0) return errOut('rt-out', 'Volume and absorption area must be positive.');
  const RT = 0.161 * V / A;
  showOut('rt-out', [
    { label: 'RT60',          val: fmtN(RT), unit: 's', cls: RT < 2 ? 'good' : 'warn' },
    { label: 'Total absorption A', val: fmtN(A), unit: 'm² sabins' },
    { label: 'Guidance', val: RT < 0.5 ? 'Very dry' : RT < 1.5 ? 'Good for speech' : RT < 2.5 ? 'Music/lecture hall' : 'Reverberant — add absorbers', unit: '' },
  ], 'Sabine most accurate for large rooms with low absorption. Good speech intelligibility: RT60<0.5 s. Music: 1–2.5 s.');
}

/* ── Optics ──────────────────────────────────────────────────── */

/* Thin lens / lensmaker equation */
function lensCalc() {
  const tab = document.querySelector('#lens-tabs .tab.active').dataset.tab;
  if (tab === 'design') {
    const n  = v('lens-n'), R1 = v('lens-R1') * su('lens-R1-u'), R2 = v('lens-R2') * su('lens-R2-u');
    if (n <= 1) return errOut('lens-out', 'Refractive index must be > 1.');
    const f = 1 / ((n - 1) * (1 / R1 - 1 / R2));
    showOut('lens-out', [
      { label: 'Focal length f', val: fmtN(f * 1000), unit: 'mm', cls: 'good' },
      { label: 'Power',          val: fmtN(1 / f),    unit: 'diopters' },
    ], 'f>0: converging (convex). f<0: diverging (concave). Both radii needed for full optical design.');
  } else {
    const f   = v('lens-f2') * su('lens-f2-u'), do_ = v('lens-do') * su('lens-do-u');
    if (f === 0 || do_ === 0) return errOut('lens-out', 'f and object distance required.');
    const di = 1 / (1 / f - 1 / do_), m = -di / do_;
    showOut('lens-out', [
      { label: 'Image distance di', val: fmtN(di * 1000), unit: 'mm', cls: 'good' },
      { label: 'Magnification m',   val: fmtN(m),          unit: '' },
      { label: 'Image type',        val: di > 0 ? 'Real (same side as refracted light)' : 'Virtual', unit: '' },
    ], 'Real image (di>0): inverted. Virtual (di<0): upright. |m|>1: image larger than object.');
  }
}

/* Optical resolution (Rayleigh / Abbe limit) */
function opresCalc() {
  const lam   = v('opres-lam') * 1e-9, D = v('opres-D') * su('opres-D-u');
  const n     = v('opres-n') || 1, theta = v('opres-theta') * Math.PI / 180;
  const NA    = n * Math.sin(theta);
  const rayleigh = 1.22 * lam / (D > 0 ? D : NA / n * lam);
  const abbe     = NA > 0 ? lam / (2 * NA) : NaN;
  showOut('opres-out', [
    { label: 'NA',              val: fmtN(NA),                       unit: '', cls: 'good' },
    { label: 'Rayleigh limit',  val: fmtN(rayleigh * 1e9),          unit: 'nm' },
    { label: 'Abbe diff. limit', val: isFinite(abbe) ? fmtN(abbe * 1e9) : '— (enter NA)', unit: 'nm' },
  ], 'Rayleigh: two points just resolved when first diffraction minimum of one falls on maximum of other. Super-resolution (STED, STORM) breaks Abbe limit. NA>1 requires immersion medium.');
}

/* ── Lab & research tools ───────────────────────────────────── */

/* Dilution C₁V₁ = C₂V₂ */
function dilCalc() {
  const mode = g('dil-mode').value;
  const C1 = v('dil-C1'), V1 = v('dil-V1') * su('dil-V1-u'), C2 = v('dil-C2'), V2 = v('dil-V2') * su('dil-V2-u');
  let result, label, prep;
  if      (mode === 'C2') { result = C1 * V1 / V2; label = 'C₂'; prep = `Take ${fmtN(V1 * 1e3)} mL of stock, dilute to ${fmtN(V2 * 1e3)} mL total.`; }
  else if (mode === 'V2') { result = C1 * V1 / C2; label = 'V₂ (final volume)'; prep = `Take ${fmtN(V1 * 1e3)} mL of stock, dilute to ${fmtN(result * 1e3)} mL total.`; }
  else if (mode === 'C1') { result = C2 * V2 / V1; label = 'C₁ (stock needed)'; }
  else                    { result = C2 * V2 / C1; label = 'V₁ (stock volume)'; prep = `Take ${fmtN(result * 1e3)} mL of stock, dilute to ${fmtN(V2 * 1e3)} mL.`; }
  showOut('dil-out', [
    { label,                         val: fmtN(result), unit: '', cls: 'good' },
    { label: 'Dilution factor',      val: fmtN(C1 / (mode === 'C2' ? result : C2)), unit: '×' },
    { label: 'Prep',                 val: prep || '',   unit: '' },
  ], 'C₁V₁=C₂V₂ assumes ideal mixing. Always add concentrated reagent to solvent (not the reverse). Serial dilutions for very low concentrations.');
}

/* Molarity calculator */
function molCalc() {
  const mode = g('mol-mode').value;
  const MW = v('mol-MW'), V = v('mol-V');
  if (MW <= 0 || V <= 0) return errOut('mol-out', 'MW and V must be positive.');
  if (mode === 'm2M') {
    const m = v('mol-m'), n = m / MW, M = n / V;
    showOut('mol-out', [
      { label: 'Moles n',      val: fmtN(n),     unit: 'mol', cls: 'good' },
      { label: 'Molarity M',   val: fmtN(M),     unit: 'mol/L' },
      { label: 'Concentration', val: fmtN(M * 1000), unit: 'mmol/L' },
    ], 'M = n/V(L). Physiological osmolarity ≈285 mOsm/kg. 0.9% NaCl = 154 mmol/L = 308 mOsm/L (isotonic).');
  } else {
    const M = v('mol-M'), n = M * V, m = n * MW;
    showOut('mol-out', [
      { label: 'Moles n',      val: fmtN(n), unit: 'mol', cls: 'good' },
      { label: 'Mass m',       val: fmtN(m), unit: 'g' },
      { label: 'Molarity check', val: fmtN(M), unit: 'mol/L' },
    ], 'M = n/V(L). 0.9% NaCl = 154 mmol/L = 308 mOsm/L (isotonic).');
  }
}

/* PCR primer Tm and GC% */
function pcrCalc() {
  const seq = (g('pcr-seq').value || '').toUpperCase().replace(/[^ATGC]/g, '');
  if (seq.length < 6) return errOut('pcr-out', 'Enter a primer sequence (A, T, G, C only, ≥6 bases).');
  const A = (seq.match(/A/g) || []).length, T = (seq.match(/T/g) || []).length;
  const G = (seq.match(/G/g) || []).length, C = (seq.match(/C/g) || []).length;
  const N = seq.length, GCpct = (G + C) / N * 100;
  const Tm_wallace = 2 * (A + T) + 4 * (G + C);
  const Tm_nn      = 81.5 + 16.6 * Math.log10(0.05) + 0.41 * GCpct - 675 / N;
  showOut('pcr-out', [
    { label: 'Length',                val: N,                           unit: 'bp' },
    { label: 'GC%',                   val: fmtN(GCpct),                unit: '%', cls: GCpct >= 40 && GCpct <= 60 ? 'good' : 'warn' },
    { label: 'A / T / G / C',        val: `${A} / ${T} / ${G} / ${C}`, unit: '' },
    { label: 'Tm (Wallace rule)',     val: fmtN(Tm_wallace),           unit: '°C', cls: 'good' },
    { label: 'Tm (nearest-neighbor est.)', val: fmtN(Tm_nn),          unit: '°C' },
    { label: 'Annealing temp',       val: fmtN(Tm_nn - 5),            unit: '°C (Tm − 5)' },
  ], 'Wallace rule accurate only for <14 nt. Nearest-neighbour better for longer primers. GC% 40–60% optimal for specificity.');
}

/* SEM/TEM scale bar calibration */
function scbCalc() {
  const mag = v('scb-mag'), pxSize = v('scb-px'), barPx = v('scb-bar');
  if (mag <= 0 || pxSize <= 0 || barPx <= 0) return errOut('scb-out', 'All values must be positive.');
  const nmPerPx = pxSize * 1000 / mag, barLen = barPx * nmPerPx;
  showOut('scb-out', [
    { label: 'nm per pixel',      val: fmtN(nmPerPx),      unit: 'nm/px', cls: 'good' },
    { label: 'Scale bar length', val: fmtN(barLen),        unit: 'nm' },
    { label: 'Scale bar length', val: fmtN(barLen / 1000), unit: 'μm' },
  ], 'Calibrate nm/px with a calibration grid at the same magnification — do not rely on manufacturer spec alone.');
}

/* h-index and i10-index from citation counts */
function hidxCalc() {
  const cites = (g('hidx-data').value || '').split(',').map(s => parseInt(s.trim())).filter(isFinite).sort((a, b) => b - a);
  if (cites.length === 0) return errOut('hidx-out', 'Enter comma-separated citation counts.');
  let h = 0;
  for (let i = 0; i < cites.length; i++) { if (cites[i] >= i + 1) h = i + 1; else break; }
  const i10  = cites.filter(c => c >= 10).length;
  const total = cites.reduce((a, b) => a + b, 0);
  showOut('hidx-out', [
    { label: 'h-index',             val: h,                          unit: '', cls: 'good' },
    { label: 'i10-index',           val: i10,                        unit: '' },
    { label: 'Total citations',     val: total,                      unit: '' },
    { label: 'Mean citations/paper', val: fmtN(total / cites.length), unit: '' },
    { label: 'Papers',             val: cites.length,                unit: '' },
  ], 'h-index is field-dependent — compare only within the same discipline. High h requires sustained productivity AND impact.');
}

/* Image resolution / print DPI check */
function dpiCalc() {
  const dpi = v('dpi-dpi'), W = v('dpi-W') * su('dpi-W-u'), H = v('dpi-H') * su('dpi-H-u'), bits = v('dpi-bits') || 8;
  if (dpi <= 0 || W <= 0 || H <= 0) return errOut('dpi-out', 'DPI, width, height must be positive.');
  const px_w = Math.round(dpi * W / 0.0254), px_h = Math.round(dpi * H / 0.0254);
  const bytes = px_w * px_h * (bits / 8) * 3;
  showOut('dpi-out', [
    { label: 'Pixel dimensions',          val: `${px_w} × ${px_h}`,    unit: 'px', cls: 'good' },
    { label: 'Total megapixels',          val: fmtN(px_w * px_h / 1e6), unit: 'MP' },
    { label: 'Uncompressed size (RGB)',   val: fmtN(bytes / 1e6),       unit: 'MB' },
    { label: 'JPEG est. (~10:1)',         val: fmtN(bytes / 10 / 1e6),  unit: 'MB' },
  ], 'Journal figures: 300 DPI minimum (raster). Line art: 600–1200 DPI. Screen: 72–96 PPI. A4 at 300 DPI: 2480×3508 px.');
}

/* ── Chemical engineering ───────────────────────────────────── */

/* Ideal gas law (solve for any one unknown) */
function iglCalc() {
  const mode = g('igl-mode').value;
  const R  = 8.314;
  const P  = v('igl-P') * su('igl-P-u'), Vv = v('igl-V'), nv = v('igl-n'), T = v('igl-T') + 273.15;
  const iglNote = 'At STP (0°C, 1 atm): 1 mol ideal gas occupies 22.4 L. Real gases deviate at high P or low T — use van der Waals for corrections.';
  if      (mode === 'P') { const Pout = nv * R * T / Vv; showOut('igl-out', [{ label: 'Pressure P', val: fmtN(Pout / 1000), unit: 'kPa', cls: 'good' }, { label: 'P', val: fmtN(Pout / 101325), unit: 'atm' }], iglNote); }
  else if (mode === 'V') { const Vout = nv * R * T / P;  showOut('igl-out', [{ label: 'Volume V',   val: fmtN(Vout),        unit: 'm³',  cls: 'good' }, { label: 'V', val: fmtN(Vout * 1000), unit: 'L' }], iglNote); }
  else if (mode === 'n') { const nout = P * Vv / (R * T); showOut('igl-out', [{ label: 'Moles n',    val: fmtN(nout),        unit: 'mol', cls: 'good' }], iglNote); }
  else                   { const Tout = P * Vv / (nv * R) - 273.15; showOut('igl-out', [{ label: 'Temperature T', val: fmtN(Tout), unit: '°C', cls: 'good' }, { label: 'T', val: fmtN(Tout + 273.15), unit: 'K' }], iglNote); }
}

/* Antoine vapour pressure correlation */
function antCalc() {
  const preset  = g('ant-preset').value;
  let A, B, C;
  const presets = { water: [8.07131, 1730.63, 233.426], ethanol: [8.20417, 1642.89, 230.300], acetone: [7.02447, 1161.0, 224.0], toluene: [6.95334, 1343.943, 219.377] };
  if (preset !== 'custom') { [A, B, C] = presets[preset]; } else { A = v('ant-A'); B = v('ant-B'); C = v('ant-C'); }
  const T    = v('ant-T'), logP = A - B / (C + T), P_mmHg = Math.pow(10, logP);
  showOut('ant-out', [
    { label: 'log₁₀(P)',       val: fmtN(logP),           unit: '' },
    { label: 'Vapor pressure', val: fmtN(P_mmHg),         unit: 'mmHg', cls: 'good' },
    { label: 'Vapor pressure', val: fmtN(P_mmHg * 133.322), unit: 'Pa' },
    { label: 'Vapor pressure', val: fmtN(P_mmHg / 750.062),  unit: 'bar' },
  ], 'Antoine constants are fitted to data in a specific T range — extrapolation is unreliable. Verify T is within the valid range.');
}

/* CSTR design equation (first-order, liquid phase) */
function cstrCalc() {
  const F0 = v('cstr-F0'), CA0 = v('cstr-CA0'), X = v('cstr-X') / 100, k = v('cstr-k');
  if (F0 <= 0 || CA0 <= 0 || X <= 0 || X >= 1 || k <= 0) return errOut('cstr-out', 'Check inputs: X must be 0–100%, k>0.');
  const CA = CA0 * (1 - X), rA = k * CA, V = F0 * CA0 * X / rA, tau = V / F0;
  showOut('cstr-out', [
    { label: 'Reactor volume V', val: fmtN(V),     unit: 'm³', cls: 'good' },
    { label: 'CA,out',           val: fmtN(CA),    unit: 'mol/m³' },
    { label: 'Residence time τ', val: fmtN(tau),   unit: 's' },
    { label: 'Conversion X',     val: fmtN(X * 100), unit: '%' },
  ], 'CSTR always requires larger volume than PFR for same conversion (positive-order reactions). Temperature control is easier in CSTR.');
}

/* PFR design equation (first-order, liquid phase) */
function pfrCalc() {
  const F0 = v('pfr-F0'), CA0 = v('pfr-CA0'), X = v('pfr-X') / 100, k = v('pfr-k');
  if (F0 <= 0 || CA0 <= 0 || X <= 0 || X >= 1 || k <= 0) return errOut('pfr-out', 'Check inputs: X must be 0–100%, k>0.');
  const V      = F0 / k * (-Math.log(1 - X));
  const tau    = V / F0;
  const V_cstr = F0 * CA0 * X / (k * CA0 * (1 - X));
  showOut('pfr-out', [
    { label: 'PFR volume V',        val: fmtN(V),          unit: 'm³', cls: 'good' },
    { label: 'Residence time τ',    val: fmtN(tau),        unit: 's' },
    { label: 'CSTR volume (same X)', val: fmtN(V_cstr),   unit: 'm³' },
    { label: 'PFR/CSTR volume ratio', val: fmtN(V / V_cstr), unit: '' },
  ], 'PFR more efficient than CSTR for positive-order reactions (V_PFR < V_CSTR).');
}

/* Damköhler number */
function damCalc() {
  const k = v('dam-k'), tau = v('dam-tau');
  const D = v('dam-D') * su('dam-D-u'), L = v('dam-L') * su('dam-L-u'), Dif = v('dam-Dif') * su('dam-Dif-u');
  const Da1 = k * tau, Da2 = k * L * L / Dif;
  showOut('dam-out', [
    { label: 'Da I (conv.)',    val: fmtN(Da1), unit: '', cls: 'good' },
    { label: '  Regime (Da I)', val: Da1 < 0.1 ? 'Transport limited' : Da1 > 10 ? 'Reaction limited' : 'Mixed', unit: '' },
    { label: 'Da II (diff.)',   val: fmtN(Da2), unit: '' },
    { label: '  Regime (Da II)', val: Da2 < 0.1 ? 'Kinetically limited' : Da2 > 10 ? 'Diffusion limited' : 'Mixed', unit: '' },
  ], 'Da_I<0.1: kinetically limited — increasing catalyst activity helps most. Da_I>10: mass-transfer limited — improve mixing or reduce particle size.');
}

/* van der Waals equation of state */
function vdwCalc() {
  const P  = v('vdw-P') * su('vdw-P-u'), T = v('vdw-T') + 273.15;
  const preset = g('vdw-preset').value;
  const gases = { ideal: [0, 0], co2: [0.3658, 4.286e-5], n2: [0.1370, 3.87e-5], h2o: [0.5536, 3.049e-5], ch4: [0.2303, 4.306e-5], custom: [v('vdw-a'), v('vdw-b')] };
  const [a, b] = gases[preset] || [0, 0];
  const R = 8.314, Videal = R * T / P;
  let V = Videal;
  for (let i = 0; i < 50; i++) V = R * T / (P + a / (V * V)) + b;
  const Z = P * V / (R * T);
  showOut('vdw-out', [
    { label: 'Molar volume V',    val: fmtN(V * 1000),               unit: 'L/mol', cls: 'good' },
    { label: 'Compressibility Z', val: fmtN(Z),                      unit: '' },
    { label: 'Ideal gas Z',       val: '1.000',                      unit: '' },
    { label: 'Deviation from ideal', val: fmtN(Math.abs(Z - 1) * 100), unit: '%', cls: Math.abs(Z - 1) > 0.05 ? 'warn' : 'good' },
  ], 'Z=1: ideal. Z<1: attractive forces dominant (low T, moderate P). Z>1: repulsive dominant (very high P). Least accurate near liquid-gas critical point.');
}
