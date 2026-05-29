/* ================================================================
   calcs-heat.js — Heat transfer and mass transfer calculators
   Sections: conduction (flat/cylindrical), convection (pipe/plate),
             radiation, fin efficiency, Biot, Fourier, lumped
             capacitance, LMTD, NTU-effectiveness, Fick diffusion,
             Schmidt, Sherwood, membrane flux.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Heat Transfer <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Unit helper (temperature) ─────────────────────────────── */
function toK(T, unit) {
  return unit === 'C' ? T + 273.15
       : unit === 'F' ? (T - 32) * 5 / 9 + 273.15
       : T; // already Kelvin
}

/* ── Fourier conduction — flat wall ─────────────────────────── */
function htCondFlat() {
  const k  = gv('htcf-k')  * gu('htcf-k-u');
  const A  = gv('htcf-A')  * gu('htcf-A-u');
  const L  = gv('htcf-L')  * gu('htcf-L-u');
  const dT = gv('htcf-dT');
  if (!k || !A || !L || isNaN(dT)) return;
  const q = k * A * dT / L, Rth = L / (k * A);
  res('htcf-body', [
    ['Heat flux q',          q.toFixed(3)        + ' W',    'Q = k·A·ΔT/L'],
    ['Thermal resistance R_th', Rth.toExponential(3) + ' K/W', 'R = L/(k·A)'],
    ['Heat flux q"',         (q / A).toFixed(2)  + ' W/m²', 'q" = q/A'],
  ]);
  const _e = document.getElementById('htcf-out');
  if (_e) _e.classList.add('visible');
}

/* Auto-solve: if one of k, A, L, ΔT is blank, back-calculate it from target q. */
function htCondFlatAuto() {
  const ids   = ['htcf-k', 'htcf-A', 'htcf-L', 'htcf-dT'];
  const raw   = ids.map(id => document.getElementById(id).value);
  const units = [su('htcf-k-u'), su('htcf-A-u'), su('htcf-L-u'), 1];
  const vals  = raw.map((r, i) => r === '' || r === null ? null : parseFloat(r) * units[i]);
  const blank = vals.findIndex(v => v === null);
  const known = vals.filter(v => v !== null).length;
  if (known < 3) { return; }
  let [k_v, A_v, L_v, dT_v] = vals;
  const q_target = v('htcf-q-target');
  if (!isNaN(q_target) && q_target > 0) {
    if      (blank === 0) k_v  = q_target * L_v / (A_v * dT_v);
    else if (blank === 1) A_v  = q_target * L_v / (k_v * dT_v);
    else if (blank === 2) L_v  = k_v * A_v * dT_v / q_target;
    else if (blank === 3) dT_v = q_target * L_v / (k_v * A_v);
  }
  htCondFlat();
}

/* ── Fourier conduction — cylindrical wall ───────────────────── */
function htCondCyl() {
  const k  = gv('htcc-k'), L = gv('htcc-L'), r1 = gv('htcc-r1'), r2 = gv('htcc-r2'), dT = gv('htcc-dT');
  if (!k || !L || !r1 || !r2 || r2 <= r1 || isNaN(dT)) return;
  const q   = 2 * Math.PI * k * L * dT / Math.log(r2 / r1);
  const Rth = Math.log(r2 / r1) / (2 * Math.PI * k * L);
  res('htcc-body', [
    ['Heat transfer rate q', q.toFixed(3)        + ' W',    'q = 2πkL·ΔT/ln(r₂/r₁)'],
    ['Thermal resistance R_th', Rth.toExponential(3) + ' K/W', 'R = ln(r₂/r₁)/(2πkL)'],
  ]);
  const _e = document.getElementById('htcc-out');
  if (_e) _e.classList.add('visible');
}

/* ── Dittus-Boelter — internal pipe convection ──────────────── */
function htConvPipe() {
  const Re = gv('htcp-Re'), Pr = gv('htcp-Pr'), k = gv('htcp-k');
  const D  = gv('htcp-D') * gu('htcp-D-u');
  const n  = parseFloat(document.getElementById('htcp-mode').value);
  if (!Re || !Pr || !k || !D) return;
  if (Re < 10000) {
    res('htcp-body', [['Warning', 'Re < 10,000: Dittus-Boelter not valid (use Gnielinski for 3000<Re<5M)', '']]);
    const _e = document.getElementById('htcp-out');
    if (_e) _e.classList.add('visible');
    return;
  }
  const Nu = 0.023 * Math.pow(Re, 0.8) * Math.pow(Pr, n);
  const h  = Nu * k / D;
  res('htcp-body', [
    ['Nusselt number Nu', Nu.toFixed(2),            'Nu = 0.023·Re⁰·⁸·Prⁿ'],
    ['Conv. coeff h',     h.toFixed(2) + ' W/(m²·K)', 'h = Nu·k/D'],
    ['Notes', Re > 5e6 ? 'Re > 5×10⁶: check Gnielinski' : 'Valid range', ''],
  ]);
  const _e = document.getElementById('htcp-out');
  if (_e) _e.classList.add('visible');
}

/* ── Flat plate external convection ─────────────────────────── */
function htConvPlate() {
  const Re = gv('htpl-Re'), Pr = gv('htpl-Pr'), k = gv('htpl-k'), L = gv('htpl-L');
  if (!Re || !Pr || !k || !L) return;
  const lam = Re < 5e5;
  const Nu  = lam ? 0.664 * Math.pow(Re, 0.5) * Math.pow(Pr, 1 / 3)
                  : 0.037 * Math.pow(Re, 0.8) * Math.pow(Pr, 1 / 3);
  const h = Nu * k / L;
  res('htpl-body', [
    ['Flow regime', lam ? 'Laminar (Re<5×10⁵)' : 'Turbulent (Re≥5×10⁵)', ''],
    ['Nusselt Nu', Nu.toFixed(2), lam ? 'Nu=0.664·Re^0.5·Pr^(1/3)' : 'Nu=0.037·Re^0.8·Pr^(1/3)'],
    ['h (average)', h.toFixed(2) + ' W/(m²·K)', 'h = Nu·k/L'],
  ]);
  const _e = document.getElementById('htpl-out');
  if (_e) _e.classList.add('visible');
}

/* ── Stefan-Boltzmann radiation ─────────────────────────────── */
function htRad() {
  const eps = gv('htr-eps'), A = gv('htr-A') * gu('htr-A-u');
  const T1  = toK(gv('htr-T1'), document.getElementById('htr-T1-u').value);
  const T2  = toK(gv('htr-T2'), document.getElementById('htr-T2-u').value);
  const sig = 5.6704e-8;
  if (!eps || !A || isNaN(T1) || isNaN(T2)) return;
  const q = eps * sig * A * (T1 ** 4 - T2 ** 4);
  res('htr-body', [
    ['Net heat transfer q', q.toFixed(2) + ' W',                         'q = ε·σ·A·(T₁⁴−T₂⁴)'],
    ['Blackbody emission (T₁)', (sig * A * T1 ** 4).toFixed(2) + ' W',  'ε=1 max'],
    ['Direction', q > 0 ? 'Surface → Surroundings' : 'Surroundings → Surface', ''],
  ]);
  const _e = document.getElementById('htr-out');
  if (_e) _e.classList.add('visible');
}

/* ── Fin efficiency (rectangular profile) ───────────────────── */
function finCalc() {
  const h  = gv('fin-h'), k = gv('fin-k');
  const w  = gv('fin-w')  * gu('fin-w-u');
  const t  = gv('fin-t')  * gu('fin-t-u');
  const L  = gv('fin-L')  * gu('fin-L-u');
  const dT = gv('fin-dT');
  if (!h || !k || !w || !t || !L || isNaN(dT)) return;
  const Ac = w * t, P = 2 * (w + t);
  const m  = Math.sqrt(h * P / (k * Ac));
  const mL = m * L;
  const eta = Math.tanh(mL) / mL;
  const qfin = eta * h * P * L * dT;
  const qmax = h * P * L * dT;
  res('fin-body', [
    ['Fin parameter m', m.toFixed(3) + ' m⁻¹',         'm = √(h·P/(k·A_c))'],
    ['mL',              mL.toFixed(4),                   '—'],
    ['Fin efficiency η', (eta * 100).toFixed(1) + '%',   'η = tanh(mL)/(mL)'],
    ['Actual q_fin',    qfin.toFixed(3) + ' W',          'q = η·h·P·L·ΔT'],
    ['Maximum q (ideal)', qmax.toFixed(3) + ' W',        'η_ideal = 1'],
  ]);
  const _e = document.getElementById('fin-out');
  if (_e) _e.classList.add('visible');
}

/* ── Biot number ────────────────────────────────────────────── */
function biCalc() {
  const h  = v('bi-h'), k = v('bi-k'), Lc = v('bi-Lc') * su('bi-Lc-u');
  if (h <= 0 || k <= 0 || Lc <= 0) return errOut('bi-out', 'All values must be positive.');
  const Bi = h * Lc / k;
  showOut('bi-out', [
    { label: 'Biot number Bi',          val: fmtN(Bi), unit: '', cls: Bi < 0.1 ? 'good' : 'warn' },
    { label: 'Lumped capacitance valid?', val: Bi < 0.1 ? 'Yes (Bi < 0.1)' : 'No — use distributed model', unit: '' },
    { label: 'Interpretation', val: Bi < 0.1 ? 'Internal resistance ≪ external' : 'Significant internal temperature gradient', unit: '' },
  ], 'Bi<0.1: lumped capacitance valid. Bi>1: must solve full 1D or 3D heat equation.');
}

/* ── Fourier number ─────────────────────────────────────────── */
function foCalc() {
  const k  = v('fo-k'), rho = v('fo-rho'), cp = v('fo-cp'), t = v('fo-t');
  const Lc = v('fo-Lc') * su('fo-Lc-u');
  if (k <= 0 || rho <= 0 || cp <= 0 || t <= 0 || Lc <= 0) return errOut('fo-out', 'All values must be positive.');
  const alpha = k / (rho * cp);
  const Fo    = alpha * t / (Lc * Lc);
  showOut('fo-out', [
    { label: 'Thermal diffusivity α', val: fmtN(alpha * 1e6), unit: 'mm²/s', cls: 'good' },
    { label: 'Fourier number Fo',     val: fmtN(Fo),           unit: '' },
    { label: 'Interpretation', val: Fo > 0.2 ? 'Quasi-steady (Fo > 0.2)' : 'Transient dominated', unit: '' },
  ], 'Fo>0.2: single-term approximation accurate to <2%.');
}

/* ── Lumped capacitance cooling/heating ─────────────────────── */
function lcCalc() {
  const Ti   = v('lc-Ti'), Tinf = v('lc-Tinf'), h = v('lc-h');
  const rho  = v('lc-rho'), cp = v('lc-cp'), VA = v('lc-VA'), t = v('lc-t');
  if (h <= 0 || rho <= 0 || cp <= 0 || VA <= 0) return errOut('lc-out', 'h, ρ, cp, V/A must be positive.');
  const tau = rho * cp * VA / h;
  const Tt  = Tinf + (Ti - Tinf) * Math.exp(-t / tau);
  showOut('lc-out', [
    { label: 'Time constant τ',     val: fmtN(tau), unit: 's', cls: 'good' },
    { label: 'T at t',              val: fmtN(Tt),  unit: '°C' },
    { label: 'Time to 90% equil.', val: fmtN(tau * Math.log(10)), unit: 's' },
    { label: 'Time to 95% equil.', val: fmtN(tau * Math.log(20)), unit: 's' },
  ], 'Valid only when Bi < 0.1.');
}

/* ── Log mean temperature difference (counter-flow) ─────────── */
function lmtdCalc() {
  const Thi = v('lmtd-Thin'), Tho = v('lmtd-Thout'), Tci = v('lmtd-Tcin'), Tco = v('lmtd-Tcout');
  const dT1 = Thi - Tco, dT2 = Tho - Tci;
  if (dT1 <= 0 || dT2 <= 0) return errOut('lmtd-out', 'Temperature differences must be positive. Check arrangement.');
  const lmtd = Math.abs(dT1 - dT2) < 0.001 ? dT1 : (dT1 - dT2) / Math.log(dT1 / dT2);
  showOut('lmtd-out', [
    { label: 'LMTD',                     val: fmtN(lmtd), unit: '°C', cls: 'good' },
    { label: 'ΔT₁ (T_h,in − T_c,out)',  val: fmtN(dT1),  unit: '°C' },
    { label: 'ΔT₂ (T_h,out − T_c,in)', val: fmtN(dT2),  unit: '°C' },
    { label: 'Arrangement', val: 'Counter-flow (more efficient)', unit: '' },
  ]);
}

/* ── LMTD (parallel-flow) ───────────────────────────────────── */
function lmtdParCalc() {
  const Thi = v('lmtdp-Thin'), Tho = v('lmtdp-Thout'), Tci = v('lmtdp-Tcin'), Tco = v('lmtdp-Tcout');
  const dT1 = Thi - Tci, dT2 = Tho - Tco;
  if (dT1 <= 0 || dT2 <= 0) return errOut('lmtdp-out', 'Temperature differences must be positive. Check arrangement.');
  const lmtd = Math.abs(dT1 - dT2) < 0.001 ? dT1 : (dT1 - dT2) / Math.log(dT1 / dT2);
  showOut('lmtdp-out', [
    { label: 'LMTD',                     val: fmtN(lmtd), unit: '°C', cls: 'good' },
    { label: 'ΔT₁ (T_h,in − T_c,in)',   val: fmtN(dT1),  unit: '°C' },
    { label: 'ΔT₂ (T_h,out − T_c,out)', val: fmtN(dT2),  unit: '°C' },
    { label: 'Arrangement', val: 'Parallel-flow', unit: '' },
  ]);
}

/* ── NTU-effectiveness method ───────────────────────────────── */
function entuCalc() {
  const Ch = v('entu-Ch'), Cc = v('entu-Cc'), NTU = v('entu-NTU');
  const type = g('entu-type').value;
  if (Ch <= 0 || Cc <= 0 || NTU <= 0) return errOut('entu-out', 'All values must be positive.');
  const Cmin = Math.min(Ch, Cc), Cmax = Math.max(Ch, Cc), Cr = Cmin / Cmax;
  let eps;
  if      (type === 'counter')  eps = Cr < 1 ? (1 - Math.exp(-NTU * (1 - Cr))) / (1 - Cr * Math.exp(-NTU * (1 - Cr))) : NTU / (1 + NTU);
  else if (type === 'parallel') eps = (1 - Math.exp(-NTU * (1 + Cr))) / (1 + Cr);
  else {
    const E = Math.exp(-NTU * Math.sqrt(1 + Cr * Cr));
    eps = 2 / (1 + Cr + Math.sqrt(1 + Cr * Cr) * (1 + E) / (1 - E));
  }
  const Qmax = Cmin * Math.abs(v('entu-Thi') - v('entu-Tci'));
  const Q    = eps * Qmax;
  showOut('entu-out', [
    { label: 'Effectiveness ε', val: fmtN(eps), unit: '', cls: 'good' },
    { label: 'Capacity ratio Cr', val: fmtN(Cr), unit: '' },
    { label: 'Q (if T given)', val: isFinite(Q) && Q > 0 ? fmtN(Q) : '—', unit: 'W' },
  ]);
}

/* ── Fick's first law — diffusive flux ──────────────────────── */
function fickCalc() {
  const D  = v('fick-D') * su('fick-D-u');
  const dC = v('fick-dC');
  const L  = v('fick-L') * su('fick-L-u');
  if (D <= 0 || L <= 0) return errOut('fick-out', 'D and L must be positive.');
  const J      = D * dC / L;
  const t_diff = L * L / D;
  showOut('fick-out', [
    { label: 'Flux J',              val: fmtN(J),      unit: 'mol/(m²·s)', cls: 'good' },
    { label: 'Diffusion timescale', val: fmtN(t_diff), unit: 's' },
    { label: 'Diffusion timescale', val: fmtN(t_diff / 60), unit: 'min' },
  ], 'Diffusion timescale τ=L²/D. Small molecules in water: D≈10⁻⁹ m²/s; proteins: D≈10⁻¹¹ m²/s; gases in air: D≈10⁻⁵ m²/s.');
}

/* ── Schmidt number ─────────────────────────────────────────── */
function scCalc() {
  const mu  = v('sc-mu') * su('sc-mu-u'), rho = v('sc-rho'), D = v('sc-D') * su('sc-D-u');
  if (mu <= 0 || rho <= 0 || D <= 0) return errOut('sc-out', 'All values must be positive.');
  const nu = mu / rho, Sc = nu / D;
  showOut('sc-out', [
    { label: 'Schmidt number Sc', val: fmtN(Sc), unit: '', cls: 'good' },
    { label: 'ν (kinematic visc.)', val: fmtN(nu), unit: 'm²/s' },
    { label: 'Interpretation', val: Sc > 1 ? 'Momentum diffusion faster than mass' : 'Mass diffusion faster than momentum', unit: '' },
  ], 'Sc=1 (gases in air): equal BL thickness. Sc>>1 (liquids): concentration BL much thinner. Sc<<1 (liquid metals): much thicker.');
}

/* ── Sherwood number ────────────────────────────────────────── */
function shCalc() {
  const Re = v('sh-Re'), Sc = v('sh-Sc'), L = v('sh-L') * su('sh-L-u'), D = v('sh-D') * su('sh-D-u');
  if (Re <= 0 || Sc <= 0 || D <= 0 || L <= 0) return errOut('sh-out', 'All values must be positive.');
  const Sh = 0.023 * Math.pow(Re, 0.8) * Math.pow(Sc, 0.333);
  const hm = Sh * D / L;
  showOut('sh-out', [
    { label: 'Sherwood number Sh',  val: fmtN(Sh), unit: '', cls: 'good' },
    { label: 'Mass transfer coeff hm', val: fmtN(hm), unit: 'm/s' },
    { label: 'Analogy note', val: 'Dittus-Boelter analogy (turbulent pipe)', unit: '' },
  ], 'Sh↔Nu, Sc↔Pr. Use h_m to find molar flux: J = h_m × ΔC. Applies to membrane and electrode systems.');
}

/* ── Membrane flux (diffusive + filtration) ─────────────────── */
function mflxCalc() {
  const tab = document.querySelector('#mflx-tabs .tab.active').dataset.tab;
  if (tab === 'diff') {
    const Pm = v('mflx-Pm'), dC = v('mflx-dC'), A = v('mflx-A');
    const J = Pm * dC;
    showOut('mflx-out', [
      { label: 'Flux J',         val: fmtN(J),                                   unit: 'mol/(m²·s)', cls: 'good' },
      { label: 'Total flow (×A)', val: isFinite(A) && A > 0 ? fmtN(J * A) : '—', unit: 'mol/s' },
    ], 'Diffusive flux driven by concentration gradient. Membrane fouling reduces effective permeability over time.');
  } else {
    const Lp  = v('mflx-Lp');
    const dP  = v('mflx-dP')  * su('mflx-dP-u');
    const dpi = v('mflx-dpi') * su('mflx-dpi-u');
    const A   = v('mflx-A2');
    const J   = Lp * (dP - dpi);
    showOut('mflx-out', [
      { label: 'Filtration flux J', val: fmtN(J * 1e6), unit: 'μm/s', cls: J > 0 ? 'good' : 'warn' },
      { label: 'Total flow (×A)',   val: isFinite(A) && A > 0 ? fmtN(J * A * 1e6) : '—', unit: 'μL/s' },
    ], 'J<0 means osmotic pressure exceeds applied pressure (reverse osmosis). Monitor TMP increase at constant flux (fouling indicator).');
  }
}
