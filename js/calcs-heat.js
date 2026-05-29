/* ================================================================
   calcs-heat.js — Heat transfer, mass transfer, and psychrometrics
   Sections: conduction (flat/cylindrical), convection (pipe/plate),
             radiation, fin efficiency, Biot, Fourier, lumped
             capacitance, LMTD, NTU-effectiveness, Fick diffusion,
             Schmidt, Sherwood, membrane flux, psychrometric state,
             HVAC process analysis (heating/cooling/humidification/mixing).

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
    { label: 'Analogy note', val: 'Chilton-Colburn analogy (turbulent pipe)', unit: '' },
  ], 'Chilton-Colburn analogy: Sh = 0.023·Re⁰·⁸·Sc^(1/3) — mirrors the Dittus-Boelter heat transfer form with Sc replacing Pr. Use h_m to find molar flux: J = h_m × ΔC. Applies to membrane, electrode, and dissolution systems in turbulent pipe flow.');
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

/* ================================================================
   PSYCHROMETRICS / HVAC
   Core moist-air thermodynamic property engine.
   All internal calculations in SI (°C, kPa, kg/kg).
================================================================ */

/* ── Internal helpers ───────────────────────────────────────── */

/* Magnus formula: saturation vapour pressure [kPa] at T [°C]. */
function _pws(T) {
  return 0.61078 * Math.exp(17.2694 * T / (T + 237.3));
}

/* Convert any temperature input to °C. */
function _toC(val, unit) {
  if (unit === 'F') return (val - 32) * 5 / 9;
  if (unit === 'K') return val - 273.15;
  return val;                         // already °C
}

/* Dew-point [°C] from actual vapour pressure [kPa] (inverse Magnus). */
function _dewPoint(Pw) {
  const lnP = Math.log(Pw / 0.61078);
  return 237.3 * lnP / (17.2694 - lnP);
}

/* Wet-bulb [°C] by bisection (ASHRAE heat-balance psychrometric equation). */
function _wetBulb(T, W, P) {
  /* Solve for Twb: W = ((2501-2.381·Twb)·Ws(Twb) - 1.006·(T-Twb))
   *                    / (2501 + 1.86·T - 4.186·Twb)              */
  let lo = -40, hi = T;
  for (let i = 0; i < 80; i++) {
    const mid    = (lo + hi) / 2;
    const Ws_mid = 0.62198 * _pws(mid) / (P - _pws(mid));
    const W_mid  = ((2501 - 2.381 * mid) * Ws_mid - 1.006 * (T - mid))
                  / (2501 + 1.86 * T - 4.186 * mid);
    if (W_mid > W) hi = mid; else lo = mid;
  }
  return (lo + hi) / 2;
}

/* Enthalpy [kJ/kg dry air] from T [°C] and W [kg/kg]. */
function _enthalpy(T, W) {
  return 1.006 * T + W * (2501 + 1.86 * T);
}

/* Specific volume [m³/kg dry air]. */
function _specVol(T, W, P) {
  return 0.287 * (T + 273.15) * (1 + 1.607 * W) / P;
}

/* Compute full state from T [°C], W [kg/kg], P [kPa]. Returns object. */
function _psyState(T, W, P) {
  const Pws  = _pws(T);
  const Pw   = P * W / (0.62198 + W);
  const RH   = Math.min(1, Pw / Pws);
  const Ws   = 0.62198 * Pws / (P - Pws);       // saturation humidity ratio
  const mu   = W / Ws;                           // degree of saturation
  const Tdp  = _dewPoint(Pw);
  const Twb  = _wetBulb(T, W, P);
  const h    = _enthalpy(T, W);
  const v    = _specVol(T, W, P);
  const rho  = 1 / v;
  const MC   = W * 1000 * rho;                  // moisture content g/m³
  return { T, W, P, Pws, Pw, RH, Ws, mu, Tdp, Twb, h, v, rho, MC };
}

/* ── Altitude → pressure helper ─────────────────────────────── */
function psyAltToP() {
  const z   = v('psy-alt') * su('psy-alt-u');   // metres
  if (!isFinite(z) || z < 0) return;
  const P   = 101.325 * Math.pow(1 - 2.2577e-5 * z, 5.2559);
  g('psy-P').value = P.toFixed(3);
  g('psy-P-u').value = '1';                     // kPa
}

/* ── Shared output renderer for a full psychrometric state ───── */
function _psyShowState(outId, st, label) {
  const f = (n, dp) => fmtN(n, dp || 4);
  showOut(outId, [
    { label: 'Dry-bulb temperature DBT',   val: f(st.T, 3),            unit: '°C' },
    { label: 'Wet-bulb temperature WBT',   val: f(st.Twb, 3),          unit: '°C', cls: 'good' },
    { label: 'Dew-point temperature DPT',  val: f(st.Tdp, 3),          unit: '°C' },
    { label: 'Relative humidity RH',       val: f(st.RH * 100, 3),     unit: '%',  cls: st.RH > 0.7 ? 'warn' : 'good' },
    { label: 'Humidity ratio W',           val: f(st.W * 1000, 4),     unit: 'g/kg dry air', cls: 'good' },
    { label: 'Vapour pressure Pᵥ',         val: f(st.Pw, 4),           unit: 'kPa' },
    { label: 'Saturation pressure Pₛₐₜ',  val: f(st.Pws, 4),          unit: 'kPa' },
    { label: 'Enthalpy h',                 val: f(st.h, 4),            unit: 'kJ/kg', cls: 'good' },
    { label: 'Specific volume v',          val: f(st.v, 4),            unit: 'm³/kg' },
    { label: 'Density ρ',                  val: f(st.rho, 4),          unit: 'kg/m³' },
    { label: 'Degree of saturation μ',     val: f(st.mu * 100, 3),     unit: '%' },
    { label: 'Moisture content MC',        val: f(st.MC, 3),           unit: 'g/m³' },
  ], label || 'Barometric pressure: ' + fmtN(st.P) + ' kPa');
}

/* ── Human-readable summary text ───────────────────────────── */
function _psySummary(st) {
  const comf = (st.T >= 18 && st.T <= 26 && st.RH >= 0.3 && st.RH <= 0.6);
  const RHpct = (st.RH * 100).toFixed(0);
  const Wg    = (st.W * 1000).toFixed(1);
  const Tdp   = st.Tdp.toFixed(1);
  const Twb   = st.Twb.toFixed(1);
  const h     = st.h.toFixed(1);
  const comfStr = comf
    ? 'This falls within the ASHRAE comfort zone (18–26 °C, 30–60% RH).'
    : st.T > 26
      ? 'This air is above the ASHRAE comfort range — cooling is likely needed.'
      : st.T < 18
        ? 'This air is below the ASHRAE comfort range — heating is recommended.'
        : st.RH > 0.6
          ? 'High relative humidity may cause discomfort and promote mould growth above 70%.'
          : 'Low relative humidity may cause dryness — consider humidification.';
  return `Air at ${st.T.toFixed(1)} °C and ${RHpct}% RH contains approximately ${Wg} g of water vapour `
       + `per kg of dry air. The dew point is ${Tdp} °C — condensation will form on any surface below this temperature. `
       + `The wet-bulb temperature is ${Twb} °C, which represents the theoretical limit of evaporative cooling. `
       + `The air enthalpy is ${h} kJ/kg, representing the total sensible and latent energy content. ${comfStr}`;
}

/* ── Main psychrometric state calculator ────────────────────── */
function psyCalc() {
  const P   = v('psy-P') * su('psy-P-u');
  if (!P || P <= 0) return errOut('psy-out', 'Enter a valid barometric pressure.');
  const tab = document.querySelector('#psy-tabs .tab.active')?.textContent?.trim() || 'DBT + RH';
  let T, W;

  if (tab.includes('RH')) {
    T = _toC(v('psy-rh-T'), g('psy-rh-T-u').value);
    const RH = v('psy-rh-RH') / 100;
    if (!isFinite(T) || !isFinite(RH) || RH < 0 || RH > 1.001)
      return errOut('psy-out', 'Enter valid DBT and RH (0–100%).');
    const Pw = RH * _pws(T);
    W = 0.62198 * Pw / (P - Pw);

  } else if (tab.includes('WBT')) {
    T  = _toC(v('psy-wb-T'),  g('psy-wb-T-u').value);
    const Twb = _toC(v('psy-wb-WB'), g('psy-wb-WB-u').value);
    if (!isFinite(T) || !isFinite(Twb) || Twb > T)
      return errOut('psy-out', 'WBT must be ≤ DBT.');
    const Ws_wb = 0.62198 * _pws(Twb) / (P - _pws(Twb));
    W = ((2501 - 2.381 * Twb) * Ws_wb - 1.006 * (T - Twb))
      / (2501 + 1.86 * T - 4.186 * Twb);

  } else if (tab.includes('DPT')) {
    T  = _toC(v('psy-dp-T'),  g('psy-dp-T-u').value);
    const Tdp = _toC(v('psy-dp-DP'), g('psy-dp-DP-u').value);
    if (!isFinite(T) || !isFinite(Tdp) || Tdp > T)
      return errOut('psy-out', 'DPT must be ≤ DBT.');
    const Pw = _pws(Tdp);
    W = 0.62198 * Pw / (P - Pw);

  } else if (tab.includes('W')) {
    T = _toC(v('psy-w-T'), g('psy-w-T-u').value);
    W = v('psy-w-W') / 1000;                 // g/kg → kg/kg
    if (!isFinite(T) || !isFinite(W) || W < 0)
      return errOut('psy-out', 'Enter valid DBT and humidity ratio.');

  } else {                                    // DBT + h
    T = _toC(v('psy-e-T'), g('psy-e-T-u').value);
    const h = v('psy-e-h');
    if (!isFinite(T) || !isFinite(h))
      return errOut('psy-out', 'Enter valid DBT and enthalpy.');
    W = (h - 1.006 * T) / (2501 + 1.86 * T);
    if (W < 0) return errOut('psy-out', 'Enthalpy too low for this temperature (W < 0).');
  }

  if (W < 0) return errOut('psy-out', 'Humidity ratio is negative — check inputs.');
  const Pws_T = _pws(T);
  if (W > 0.62198 * Pws_T / (P - Pws_T) * 1.001)
    return errOut('psy-out', 'Humidity ratio exceeds saturation at this temperature and pressure.');

  const st = _psyState(T, W, P);
  _psyShowState('psy-out', st);

  const sumEl = document.getElementById('psy-summary');
  if (sumEl) { sumEl.style.display = 'block'; sumEl.textContent = _psySummary(st); }
}

/* ── Sensible heating ───────────────────────────────────────── */
function psyHeatCalc() {
  const P   = 101.325;
  const T1  = _toC(v('ph-T1'), g('ph-T1-u').value);
  const RH1 = v('ph-RH1') / 100;
  const T2  = _toC(v('ph-T2'), g('ph-T2-u').value);
  const mdot = v('ph-mdot') * su('ph-mdot-u');
  if (!isFinite(T1) || !isFinite(T2) || !isFinite(RH1) || !isFinite(mdot) || mdot <= 0)
    return errOut('ph-out', 'Check all inputs.');
  if (T2 <= T1) return errOut('ph-out', 'T₂ must be greater than T₁ for heating.');
  const Pw1 = RH1 * _pws(T1);
  const W   = 0.62198 * Pw1 / (P - Pw1);      // W constant (sensible only)
  const h1  = _enthalpy(T1, W), h2 = _enthalpy(T2, W);
  const Q   = mdot * (h2 - h1);               // kW
  const Pws2 = _pws(T2);
  const RH2  = Math.min(1, Pw1 / Pws2);
  showOut('ph-out', [
    { label: 'Sensible heat added Q', val: fmtN(Q),              unit: 'kW',  cls: 'good' },
    { label: 'Q',                     val: fmtN(Q * 3412),        unit: 'BTU/h' },
    { label: 'Inlet enthalpy h₁',     val: fmtN(h1),              unit: 'kJ/kg' },
    { label: 'Outlet enthalpy h₂',   val: fmtN(h2),              unit: 'kJ/kg' },
    { label: 'Humidity ratio W',      val: fmtN(W * 1000),        unit: 'g/kg (unchanged)' },
    { label: 'Outlet RH',            val: fmtN(RH2 * 100, 3),   unit: '% (decreases with heating)' },
    { label: 'ΔT',                   val: fmtN(T2 - T1),         unit: '°C' },
  ], 'Sensible heating: W constant, RH drops. Q = ṁ·Δh. To maintain comfort humidity after heating, consider humidification.');
}

/* ── Cooling (sensible + possible latent) ───────────────────── */
function psyCoolCalc() {
  const P    = v('pc-P');
  const T1   = _toC(v('pc-T1'), g('pc-T1-u').value);
  const RH1  = v('pc-RH1') / 100;
  const T2   = _toC(v('pc-T2'), g('pc-T2-u').value);
  const mdot = v('pc-mdot');
  if (!isFinite(T1) || !isFinite(T2) || !isFinite(RH1) || !isFinite(mdot) || mdot <= 0 || P <= 0)
    return errOut('pc-out', 'Check all inputs.');
  if (T2 >= T1) return errOut('pc-out', 'T₂ must be less than T₁ for cooling.');

  const Pw1  = RH1 * _pws(T1);
  const W1   = 0.62198 * Pw1 / (P - Pw1);
  const h1   = _enthalpy(T1, W1);
  const Tdp1 = _dewPoint(Pw1);

  let W2, h2, latent, condensate;
  const sensOnly = T2 >= Tdp1;

  if (sensOnly) {
    W2 = W1; h2 = _enthalpy(T2, W2);
    latent = 0; condensate = 0;
  } else {
    /* Dehumidification: cool to dew point, then continue to T2 at saturation */
    W2 = 0.62198 * _pws(T2) / (P - _pws(T2));
    h2 = _enthalpy(T2, W2);
    latent = mdot * (W1 - W2) * 2501;           // kW (latent at ~0 °C approx)
    condensate = mdot * (W1 - W2);              // kg/s water removed
  }

  const Qtotal   = mdot * (h1 - h2);
  const Qsensible = mdot * 1.006 * (T1 - T2);
  const RH2 = Math.min(1, (_pws(T2) * W2 / (0.62198 + W2)) / _pws(T2));

  showOut('pc-out', [
    { label: 'Total cooling load Q',  val: fmtN(Qtotal),             unit: 'kW',    cls: 'good' },
    { label: 'Sensible cooling Qs',   val: fmtN(Qsensible),          unit: 'kW' },
    { label: 'Latent cooling Ql',     val: fmtN(latent),             unit: 'kW',    cls: latent > 0 ? 'warn' : '' },
    { label: 'SHR (sensible heat ratio)', val: fmtN(Qsensible / Qtotal, 3), unit: '' },
    { label: 'Dehumidification',      val: sensOnly ? 'None (T₂ > DPT)' : 'Yes — below dew point', unit: '', cls: sensOnly ? 'good' : 'warn' },
    { label: 'Condensate rate',       val: fmtN(condensate * 1000, 3), unit: 'g/s' },
    { label: 'Outlet W₂',            val: fmtN(W2 * 1000, 3),       unit: 'g/kg' },
    { label: 'Outlet RH₂',           val: fmtN(RH2 * 100, 3),       unit: '%' },
  ], sensOnly
    ? 'T₂ > dew point: sensible cooling only, no condensation. SHR=1.'
    : 'T₂ < dew point: dehumidification occurs. Coil must handle both sensible and latent load. SHR < 1.');
}

/* ── Steam humidification ───────────────────────────────────── */
function psyHumidCalc() {
  const P    = v('pu-P');
  const T    = _toC(v('pu-T'), g('pu-T-u').value);
  const RH1  = v('pu-RH1') / 100;
  const RH2  = v('pu-RH2') / 100;
  const mdot = v('pu-mdot');
  if (!isFinite(T) || !isFinite(RH1) || !isFinite(RH2) || !isFinite(mdot) || mdot <= 0 || P <= 0)
    return errOut('pu-out', 'Check all inputs.');
  if (RH2 <= RH1) return errOut('pu-out', 'Target RH₂ must be greater than initial RH₁.');
  if (RH2 > 1)    return errOut('pu-out', 'Target RH cannot exceed 100%.');

  const Pws  = _pws(T);
  const Pw1  = RH1 * Pws, Pw2 = RH2 * Pws;
  const W1   = 0.62198 * Pw1 / (P - Pw1);
  const W2   = 0.62198 * Pw2 / (P - Pw2);
  const dW   = W2 - W1;
  const mw   = mdot * dW;                      // kg/s water added
  const h1   = _enthalpy(T, W1), h2 = _enthalpy(T, W2);
  const Ql   = mdot * dW * 2501;               // latent energy kW (approx steam at 100°C adds ~2676 kJ/kg)
  const Tdp2 = _dewPoint(Pw2);

  showOut('pu-out', [
    { label: 'Initial humidity ratio W₁', val: fmtN(W1 * 1000, 3), unit: 'g/kg' },
    { label: 'Target humidity ratio W₂',  val: fmtN(W2 * 1000, 3), unit: 'g/kg', cls: 'good' },
    { label: 'Water added ΔW',            val: fmtN(dW * 1000, 3), unit: 'g/kg dry air' },
    { label: 'Water flow rate ṁ_w',       val: fmtN(mw * 1000, 3), unit: 'g/s', cls: 'good' },
    { label: 'ṁ_w',                       val: fmtN(mw * 3600, 3), unit: 'kg/h' },
    { label: 'Latent load (approx)',       val: fmtN(Ql, 3),         unit: 'kW' },
    { label: 'Enthalpy change Δh',        val: fmtN(h2 - h1, 3),   unit: 'kJ/kg' },
    { label: 'New dew point',             val: fmtN(Tdp2, 3),       unit: '°C' },
  ], 'Steam humidification: W increases at approximately constant DBT. ṁ_w = ṁ_air × (W₂ − W₁). Choose dehumidifier capacity for peak summer latent load.');
}

/* ── Air stream mixing ──────────────────────────────────────── */
function psyMixCalc() {
  const P   = v('amx-P');
  const T1  = _toC(v('amx-T1'), g('amx-T1-u').value);
  const RH1 = v('amx-RH1') / 100;
  const m1  = v('amx-m1');
  const T2  = _toC(v('amx-T2'), g('amx-T2-u').value);
  const RH2 = v('amx-RH2') / 100;
  const m2  = v('amx-m2');
  if ([T1, RH1, m1, T2, RH2, m2, P].some(x => !isFinite(x)) || m1 <= 0 || m2 <= 0 || P <= 0)
    return errOut('amx-out', 'Check all inputs; both flow rates must be positive.');

  const Pw1 = RH1 * _pws(T1), W1 = 0.62198 * Pw1 / (P - Pw1), h1 = _enthalpy(T1, W1);
  const Pw2 = RH2 * _pws(T2), W2 = 0.62198 * Pw2 / (P - Pw2), h2 = _enthalpy(T2, W2);
  const mt  = m1 + m2;
  const Wm  = (m1 * W1 + m2 * W2) / mt;
  const hm  = (m1 * h1 + m2 * h2) / mt;
  /* Recover T_mix from h = 1.006T + W(2501+1.86T) → T = (h - 2501W)/(1.006 + 1.86W) */
  const Tm  = (hm - 2501 * Wm) / (1.006 + 1.86 * Wm);
  const Pwm = P * Wm / (0.62198 + Wm);
  const RHm = Math.min(1, Pwm / _pws(Tm));
  const Tdpm = _dewPoint(Pwm);

  showOut('amx-out', [
    { label: 'Mixed DBT T_m',          val: fmtN(Tm, 3),       unit: '°C', cls: 'good' },
    { label: 'Mixed W_m',              val: fmtN(Wm * 1000, 3), unit: 'g/kg dry air' },
    { label: 'Mixed enthalpy h_m',     val: fmtN(hm, 3),       unit: 'kJ/kg', cls: 'good' },
    { label: 'Mixed RH',               val: fmtN(RHm * 100, 3), unit: '%', cls: RHm > 1 ? 'bad' : RHm > 0.85 ? 'warn' : 'good' },
    { label: 'Dew point T_dp,m',       val: fmtN(Tdpm, 3),     unit: '°C' },
    { label: 'Condensation risk?',     val: RHm >= 1.0 ? 'YES — mixed air is supersaturated!' : RHm > 0.9 ? 'Marginal — near saturation' : 'No', unit: '', cls: RHm >= 1 ? 'bad' : RHm > 0.9 ? 'warn' : 'good' },
    { label: 'Stream 1 fraction',      val: fmtN(m1 / mt * 100, 3), unit: '%' },
    { label: 'Total flow ṁ_t',         val: fmtN(mt, 3),       unit: 'kg/s' },
  ], 'Mixing on straight lines on the psychrometric chart (mass-weighted average of W and h). Supersaturation (RH>100%) means condensation will occur — the mixed air state will fall on the saturation curve with fog formation.');
}
