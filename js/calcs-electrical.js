/* ================================================================
   calcs-electrical.js — Electrical engineering calculators
   Sections: Ohm's law (auto-solve), RC, RL, RLC circuits,
             dB / dBm gain, op-amp configurations.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Electrical Engineering <section>.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Ohm's law (solves any 2 known of V, I, R, P) ──────────── */
function ohmCalc(changed) {
  const ids = ['V', 'I', 'R', 'P'];
  const vals = {}, units = {};
  ids.forEach(id => {
    const raw = document.getElementById('ohm-' + id).value;
    const u   = document.getElementById('ohm-' + id + '-u');
    units[id] = u ? parseFloat(u.value) : 1;
    vals[id]  = raw === '' || raw === null ? null : parseFloat(raw) * units[id];
  });
  const known = ids.filter(id => vals[id] !== null && !isNaN(vals[id]));
  if (known.length < 2) {
    res('ohm-body', [['', 'Enter any two values', '']]);
    const _e = document.getElementById('ohm-out');
    if (_e) _e.classList.add('visible');
    return;
  }
  let V = vals.V, I = vals.I, R = vals.R, P = vals.P;
  if      (V && I) { R = V / I;             P = V * I; }
  else if (V && R) { I = V / R;             P = V * V / R; }
  else if (V && P) { I = P / V;             R = V * V / P; }
  else if (I && R) { V = I * R;             P = I * I * R; }
  else if (I && P) { V = P / I;             R = P / (I * I); }
  else if (R && P) { V = Math.sqrt(P * R);  I = Math.sqrt(P / R); }
  if (isNaN(V) || isNaN(I) || isNaN(R) || isNaN(P) || R <= 0 || V < 0 || I < 0) {
    res('ohm-body', [['Error', 'Invalid combination', '']]);
    const _e = document.getElementById('ohm-out');
    if (_e) _e.classList.add('visible');
    return;
  }
  res('ohm-body', [
    ['Voltage V',    V.toFixed(4) + ' V', ''],
    ['Current I',    (I * 1000).toFixed(4) + ' mA  =  ' + I.toFixed(6) + ' A', ''],
    ['Resistance R', R >= 1e6 ? (R / 1e6).toFixed(4) + ' MΩ' : R >= 1000 ? (R / 1000).toFixed(4) + ' kΩ' : R.toFixed(4) + ' Ω', ''],
    ['Power P',      P >= 1000 ? (P / 1000).toFixed(4) + ' kW' : P >= 1 ? P.toFixed(4) + ' W' : (P * 1000).toFixed(4) + ' mW', ''],
  ]);
  const _e = document.getElementById('ohm-out');
  if (_e) _e.classList.add('visible');
}

/* ── RC circuit ─────────────────────────────────────────────── */
function rcCalc() {
  const R = gv('rc-R') * gu('rc-R-u'), C = gv('rc-C') * gu('rc-C-u');
  if (!R || !C) return;
  const tau = R * C, fc = 1 / (2 * Math.PI * R * C);
  res('rc-body', [
    ['Time constant τ', tau < 1e-3 ? (tau * 1e6).toFixed(3) + ' μs' : tau < 1 ? (tau * 1000).toFixed(3) + ' ms' : tau.toFixed(4) + ' s', 'τ = R·C'],
    ['Cutoff freq f_c', fc >= 1e6 ? (fc / 1e6).toFixed(3) + ' MHz' : fc >= 1000 ? (fc / 1000).toFixed(3) + ' kHz' : fc.toFixed(2) + ' Hz', 'f_c = 1/(2π·RC)'],
    ['ω_c', (2 * Math.PI * fc).toFixed(2) + ' rad/s', ''],
  ]);
  const _e = document.getElementById('rc-out');
  if (_e) _e.classList.add('visible');
}

/* Auto-solve: if R or C is blank, solve from a known τ or f_c. */
function rcAutoCalc() {
  const R_raw = document.getElementById('rc-R').value;
  const C_raw = document.getElementById('rc-C').value;
  const R     = R_raw === '' ? null : parseFloat(R_raw) * su('rc-R-u');
  const C     = C_raw === '' ? null : parseFloat(C_raw) * su('rc-C-u');
  if (R && C) { rcCalc(); return; }
  const tauEl = document.getElementById('rc-tau-in');
  const fcEl  = document.getElementById('rc-fc-in');
  const tau_in = tauEl ? parseFloat(tauEl.value) : NaN;
  const fc_in  = fcEl  ? parseFloat(fcEl.value)  : NaN;
  if      (!isNaN(tau_in) && tau_in > 0 && R)  { document.getElementById('rc-C').value = (tau_in / R / su('rc-C-u')).toPrecision(4); rcCalc(); }
  else if (!isNaN(fc_in)  && fc_in  > 0 && R)  { document.getElementById('rc-C').value = (1 / (2 * Math.PI * R * fc_in) / su('rc-C-u')).toPrecision(4); rcCalc(); }
  else if (!isNaN(tau_in) && tau_in > 0 && C)  { document.getElementById('rc-R').value = (tau_in / C / su('rc-R-u')).toPrecision(4); rcCalc(); }
  else { rcCalc(); }
}

/* ── RL circuit ─────────────────────────────────────────────── */
function rlCalc() {
  const R = gv('rl-R') * gu('rl-R-u'), L = gv('rl-L') * gu('rl-L-u');
  if (!R || !L) return;
  const tau = L / R, fc = R / (2 * Math.PI * L);
  res('rl-body', [
    ['Time constant τ', tau < 1e-3 ? (tau * 1e6).toFixed(3) + ' μs' : tau < 1 ? (tau * 1000).toFixed(3) + ' ms' : tau.toFixed(4) + ' s', 'τ = L/R'],
    ['Cutoff freq f_c', fc >= 1000 ? (fc / 1000).toFixed(3) + ' kHz' : fc.toFixed(2) + ' Hz', 'f_c = R/(2π·L)'],
  ]);
  const _e = document.getElementById('rl-out');
  if (_e) _e.classList.add('visible');
}

/* ── RLC resonant circuit ───────────────────────────────────── */
function rlcCalc() {
  const R = gv('rlc-R') * gu('rlc-R-u'), L = gv('rlc-L') * gu('rlc-L-u'), C = gv('rlc-C') * gu('rlc-C-u');
  if (!R || !L || !C) return;
  const f0   = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const w0   = 2 * Math.PI * f0;
  const Q    = w0 * L / R;
  const zeta = 1 / (2 * Q);
  const bw   = f0 / Q;
  res('rlc-body', [
    ['Resonant frequency f₀', f0 >= 1e6 ? (f0 / 1e6).toFixed(3) + ' MHz' : f0 >= 1000 ? (f0 / 1000).toFixed(3) + ' kHz' : f0.toFixed(2) + ' Hz', 'f₀ = 1/(2π√LC)'],
    ['Quality factor Q',      Q.toFixed(3),                                                                                                             'Q = ω₀L/R'],
    ['Damping ratio ζ',       zeta.toFixed(4),                                                                                                          'ζ = 1/(2Q)'],
    ['Response type', zeta < 1 ? 'Underdamped (oscillatory)' : zeta === 1 ? 'Critically damped' : 'Overdamped', ''],
    ['Bandwidth BW',          bw.toFixed(2) + ' Hz',                                                                                                    'BW = f₀/Q'],
  ]);
  const _e = document.getElementById('rlc-out');
  if (_e) _e.classList.add('visible');
}

/* ── Decibel gain ───────────────────────────────────────────── */
function dbCalc() {
  const type = document.getElementById('db-type').value;
  const vin  = gv('db-in'), vout = gv('db-out-v');
  if (!vin || !vout || vin <= 0 || vout <= 0) return;
  const ratio = vout / vin;
  const dB    = type === 'voltage' ? 20 * Math.log10(ratio) : 10 * Math.log10(ratio);
  res('db-body', [
    ['Ratio',                 ratio.toFixed(4), ''],
    ['Gain',                  dB.toFixed(3) + ' dB', type === 'voltage' ? '20·log₁₀(V_out/V_in)' : '10·log₁₀(P_out/P_in)'],
    ['Linear amplitude factor', ratio.toFixed(4), ''],
  ]);
  const _e = document.getElementById('db-res');
  if (_e) _e.classList.add('visible');
}

/* ── dBm — mW to dBm ────────────────────────────────────────── */
function dbmCalc() {
  const mw = gv('dbm-mw');
  if (!mw || mw <= 0) return;
  const dbm = 10 * Math.log10(mw);
  res('dbm-body', [
    ['dBm',       dbm.toFixed(3) + ' dBm', '10·log₁₀(P_mW)'],
    ['Power (W)', (mw / 1000).toFixed(6) + ' W', ''],
  ]);
  const _e = document.getElementById('dbm-out');
  if (_e) _e.classList.add('visible');
}

/* ── dBm — dBm to mW ────────────────────────────────────────── */
function dbmRevCalc() {
  const dbm = gv('dbm-db');
  if (isNaN(dbm)) return;
  const mw = Math.pow(10, dbm / 10);
  res('dbm-body', [
    ['Power (mW)', mw.toFixed(4) + ' mW',          '10^(dBm/10)'],
    ['Power (W)',  (mw / 1000).toFixed(6) + ' W',  ''],
    ['Power (μW)', (mw * 1000).toFixed(2) + ' μW', ''],
  ]);
  const _e = document.getElementById('dbm-out');
  if (_e) _e.classList.add('visible');
}

/* ── Op-amp — inverting configuration ──────────────────────── */
function opampInv() {
  const Rin = gv('opai-Rin') * gu('opai-Rin-u'), Rf = gv('opai-Rf') * gu('opai-Rf-u');
  const Vin = gv('opai-Vin') * gu('opai-Vin-u');
  if (!Rin || !Rf || isNaN(Vin)) return;
  const Av = -Rf / Rin, Vout = Av * Vin;
  res('opai-body', [
    ['Voltage gain A_v', Av.toFixed(4),                          'A_v = −R_f/R_in'],
    ['Gain (dB)',        (20 * Math.log10(Math.abs(Av))).toFixed(2) + ' dB', ''],
    ['Output V_out',    Vout.toFixed(4) + ' V',                  'Inverted from V_in'],
  ]);
  const _e = document.getElementById('opai-out');
  if (_e) _e.classList.add('visible');
}

/* ── Op-amp — non-inverting configuration ───────────────────── */
function opampNoninv() {
  const R1  = gv('opan-R1') * gu('opan-R1-u'), Rf = gv('opan-Rf') * gu('opan-Rf-u');
  const Vin = gv('opan-Vin') * gu('opan-Vin-u');
  if (!R1 || isNaN(Rf) || isNaN(Vin)) return;
  const Av = 1 + Rf / R1, Vout = Av * Vin;
  res('opan-body', [
    ['Voltage gain A_v', Av.toFixed(4),                    'A_v = 1 + R_f/R₁'],
    ['Gain (dB)',        (20 * Math.log10(Av)).toFixed(2) + ' dB', ''],
    ['Output V_out',    Vout.toFixed(4) + ' V',            ''],
  ]);
  const _e = document.getElementById('opan-out');
  if (_e) _e.classList.add('visible');
}

/* ── Op-amp — differential configuration ───────────────────── */
function opampDiff() {
  const Rin = gv('opad-Rin') * gu('opad-Rin-u'), Rf = gv('opad-Rf') * gu('opad-Rf-u');
  const Vp  = gv('opad-Vp') * gu('opad-Vp-u'), Vm = gv('opad-Vm') * gu('opad-Vm-u');
  if (!Rin || !Rf || isNaN(Vp) || isNaN(Vm)) return;
  const Av = Rf / Rin, Vout = Av * (Vp - Vm);
  res('opad-body', [
    ['Differential gain A_d', Av.toFixed(4),            'A_d = R_f/R_in'],
    ['V+ − V−',               (Vp - Vm).toFixed(4) + ' V', ''],
    ['Output V_out',          Vout.toFixed(4) + ' V',   'V_out = A_d·(V+−V−)'],
  ]);
  const _e = document.getElementById('opad-out');
  if (_e) _e.classList.add('visible');
}
