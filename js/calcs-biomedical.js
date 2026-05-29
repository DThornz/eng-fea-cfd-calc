/* ================================================================
   calcs-biomedical.js — Biomedical engineering calculators
   Sections: cardiac output / SVR, Poiseuille (bio), Nernst
             potential, Goldman-Hodgkin-Katz membrane potential,
             Windkessel model, pulse wave velocity, Michaelis-Menten
             kinetics, Hill equation, cell doubling, pharmacokinetics
             (one-compartment), dosing, coronary flow reserve / FFR,
             Henderson-Hasselbalch buffer equation.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Biomedical Engineering <section>.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Cardiac output and systemic vascular resistance ────────── */
function coCalc() {
  const SV  = gv('co-SV') * gu('co-SV-u'), HR = gv('co-HR');
  const MAP = gv('co-MAP') * gu('co-MAP-u');
  if (!SV || !HR) return;
  const CO_m3s  = SV * HR / 60;
  const CO_Lmin = CO_m3s * 1000 * 60;
  const SVR     = MAP ? MAP / CO_m3s : null;
  const EF      = SV * 1e6 / 150 * 100;
  res('co-body', [
    ['Cardiac output CO', CO_Lmin.toFixed(2) + ' L/min', 'CO = SV × HR'],
    ['CO (m³/s)',         CO_m3s.toExponential(3) + ' m³/s', ''],
    ...(MAP ? [['SVR', (SVR / 1e6).toFixed(3) + ' mmHg·s/mL  =  ' + SVR.toFixed(0) + ' Pa·s/m³', 'SVR = MAP / CO']] : []),
    ['Est. EF (EDV=150 mL)', EF.toFixed(1) + '%', 'Rough estimate only'],
  ]);
  const _e = document.getElementById('co-out');
  if (_e) _e.classList.add('visible');
}

/* ── Hagen-Poiseuille (biomedical) ─────────────────────────── */
function poisCalc() {
  const dP = gv('poi-dP') * gu('poi-dP-u'), r = gv('poi-r') * gu('poi-r-u');
  const L  = gv('poi-L')  * gu('poi-L-u'),  mu = gv('poi-mu') * gu('poi-mu-u');
  if (!dP || !r || !L || !mu) return;
  const Q       = Math.PI * dP * r ** 4 / (8 * mu * L);
  const R_poise = 8 * mu * L / (Math.PI * r ** 4);
  const v_max   = dP * r * r / (4 * mu * L);
  const v_mean  = Q / (Math.PI * r * r);
  res('poi-body', [
    ['Volumetric flow Q', (Q * 1e6).toFixed(4) + ' mL/s  =  ' + (Q * 60000).toFixed(4) + ' mL/min', 'Q = πΔP·r⁴/(8μL)'],
    ['Hydraulic resistance R', R_poise.toExponential(3) + ' Pa·s/m³', 'R = 8μL/(πr⁴)'],
    ['Max velocity v_max',  (v_max  * 1000).toFixed(3) + ' mm/s', 'At centreline'],
    ['Mean velocity v̄',     (v_mean * 1000).toFixed(3) + ' mm/s', 'v̄ = v_max/2 (Poiseuille)'],
    ['Re', (2 * v_mean * r * 1060 / mu).toFixed(1), 'Blood density ~1060 kg/m³'],
  ]);
  const _e = document.getElementById('poi-out');
  if (_e) _e.classList.add('visible');
}

/* ── Nernst equilibrium potential ───────────────────────────── */
function nernstCalc() {
  const z    = gv('ne-z');
  const cout = gv('ne-out') * gu('ne-out-u');
  const cin  = gv('ne-in')  * gu('ne-in-u');
  const Traw = gv('ne-T'), Tu = document.getElementById('ne-T-u').value;
  const T    = Tu === 'C' ? Traw + 273.15 : Traw;
  const R = 8.314, F = 96485;
  if (!z || !cout || !cin || !T) return;
  const E = (R * T / (z * F)) * Math.log(cout / cin) * 1000;
  res('ne-body', [
    ['Nernst potential E_X', E.toFixed(2) + ' mV',   'E = (RT/zF)·ln([X]_out/[X]_in)'],
    ['At 37°C:', 'RT/F = 26.73 mV',                   'Thermal voltage'],
    ['log₁₀ ratio', Math.log10(cout / cin).toFixed(4), ''],
  ]);
  const _e = document.getElementById('ne-out-r');
  if (_e) _e.classList.add('visible');
}

/* ── Goldman-Hodgkin-Katz membrane potential ────────────────── */
function goldmanCalc() {
  const Ko  = parseFloat(document.getElementById('gk-Ko').value)  || 5;
  const Ki  = parseFloat(document.getElementById('gk-Ki').value)  || 140;
  const Nao = parseFloat(document.getElementById('gk-Nao').value) || 145;
  const Nai = parseFloat(document.getElementById('gk-Nai').value) || 15;
  const Clo = parseFloat(document.getElementById('gk-Clo').value) || 120;
  const Cli = parseFloat(document.getElementById('gk-Cli').value) || 10;
  const PK  = parseFloat(document.getElementById('gk-PK').value)  || 1;
  const PNa = parseFloat(document.getElementById('gk-PNa').value) || 0.04;
  const PCl = parseFloat(document.getElementById('gk-PCl').value) || 0.45;
  const T = 310.15, R = 8.314, F = 96485;
  const num = PK * Ko  + PNa * Nao + PCl * Cli;
  const den = PK * Ki  + PNa * Nai + PCl * Clo;
  const Vm  = (R * T / F) * Math.log(num / den) * 1000;
  res('gk-body', [
    ['Membrane potential V_m', Vm.toFixed(2) + ' mV',              'Goldman-Hodgkin-Katz'],
    ['Typical resting V_m',    '−70 to −90 mV',                    'Mammalian neuron/cardiac'],
    ['Numerator factor',       num.toFixed(2),                      'P_K·Ko + P_Na·Nao + P_Cl·Cli'],
    ['Denominator factor',     den.toFixed(2),                      'P_K·Ki + P_Na·Nai + P_Cl·Clo'],
  ]);
  const _e = document.getElementById('gk-out');
  if (_e) _e.classList.add('visible');
}

/* ── Two-element Windkessel model ───────────────────────────── */
function wkCalc() {
  const R = v('wk-R'), C = v('wk-C'), Q = v('wk-Q') / 1e6, HR = v('wk-HR');
  if (R <= 0 || C <= 0 || Q <= 0) return errOut('wk-out', 'R, C, Q must be positive.');
  const MAP = Q * R, tau = R * C;
  const T   = 60 / HR, td = 2 * T / 3;
  const Psys  = MAP + Q * R * (1 - Math.exp(-td / tau)) / (1 - Math.exp(-T / tau));
  const Pdias = Psys * Math.exp(-T / tau);
  showOut('wk-out', [
    { label: 'Mean arterial pressure', val: fmtN(MAP / 133.322),  unit: 'mmHg', cls: 'good' },
    { label: 'RC time constant',       val: fmtN(tau),             unit: 's' },
    { label: 'Systolic est.',          val: fmtN(Psys  / 133.322), unit: 'mmHg' },
    { label: 'Diastolic est.',         val: fmtN(Pdias / 133.322), unit: 'mmHg' },
  ], 'RC time constant τ=R₂C sets diastolic decay rate. Normal τ≈1.5 s (aorta). 2-element model — no wave reflections.');
}

/* ── Moens-Korteweg pulse wave velocity ─────────────────────── */
function pwvCalc() {
  const E   = v('pwv-E') * su('pwv-E-u'), h = v('pwv-h') * su('pwv-h-u');
  const r   = v('pwv-r') * su('pwv-r-u'), rho = v('pwv-rho');
  if (E <= 0 || h <= 0 || r <= 0 || rho <= 0) return errOut('pwv-out', 'All values must be positive.');
  const pwv = Math.sqrt(E * h / (2 * rho * r));
  showOut('pwv-out', [
    { label: 'PWV (Moens-Korteweg)', val: fmtN(pwv), unit: 'm/s', cls: pwv < 7 ? 'good' : 'warn' },
    { label: 'Normal range (young)', val: '4 – 7 m/s', unit: '' },
    { label: 'Stiffness assessment', val: pwv < 7 ? 'Within normal range' : pwv < 10 ? 'Mildly elevated' : 'Significantly elevated (stiff artery)', unit: '' },
  ], 'Normal aortic PWV: 5–7 m/s (young adult). PWV>10 m/s indicates significant stiffening and elevated cardiovascular risk.');
}

/* ── Michaelis-Menten enzyme kinetics ───────────────────────── */
function mmCalc() {
  const Vmax = v('mm-Vmax'), Km = v('mm-Km'), S = v('mm-S');
  if (Vmax <= 0 || Km <= 0 || S < 0) return errOut('mm-out', 'Vmax and Km must be positive.');
  const velo = Vmax * S / (Km + S);
  showOut('mm-out', [
    { label: 'Reaction velocity v', val: fmtN(velo),     unit: '(same as Vmax)', cls: 'good' },
    { label: 'v/Vmax',             val: fmtN(velo / Vmax), unit: '' },
    { label: 'Regime', val: S > Km * 10 ? 'Saturated (v ≈ Vmax)' : S < Km / 10 ? 'Linear (v ≈ Vmax·[S]/Km)' : 'Mixed', unit: '' },
    { label: 'Lineweaver-Burk 1/v', val: fmtN(1 / velo), unit: '' },
    { label: 'LB slope (Km/Vmax)', val: fmtN(Km / Vmax), unit: '' },
  ], 'At [S]<Km/10: first-order. At [S]>10×Km: zero-order (saturated). Km = substrate conc. at half-maximal rate.');
}

/* ── Hill equation (receptor/ligand binding) ────────────────── */
function hillCalc() {
  const K = v('hill-K'), n = v('hill-n'), S = v('hill-S');
  if (K <= 0 || n <= 0 || S < 0) return errOut('hill-out', 'K and n must be positive.');
  const Y = Math.pow(S, n) / (Math.pow(K, n) + Math.pow(S, n));
  showOut('hill-out', [
    { label: 'Fractional occupancy Y', val: fmtN(Y), unit: '', cls: 'good' },
    { label: 'Hill coefficient n',     val: fmtN(n), unit: '', cls: n > 1 ? 'warn' : '' },
    { label: 'Cooperativity', val: n > 1 ? 'Positive (sigmoid)' : n < 1 ? 'Negative' : 'Hyperbolic (MM)', unit: '' },
    { label: 'EC50 K', val: fmtN(K), unit: '(same as [S])' },
  ], 'n=1: Michaelis-Menten. n>1: positive cooperativity (e.g. haemoglobin-O₂ n≈2.7). EC50 = K at half-maximal response.');
}

/* ── Cell doubling time (from count data) ───────────────────── */
function cdtCalc() {
  const N0 = v('cdt-N0'), N = v('cdt-N'), t = v('cdt-t');
  if (N0 <= 0 || N <= N0 || t <= 0) return errOut('cdt-out', 'N > N₀ and t > 0 required.');
  const td = t * Math.log(2) / Math.log(N / N0);
  showOut('cdt-out', [
    { label: 'Doubling time td', val: fmtN(td), unit: '(same time unit)', cls: 'good' },
    { label: 'Doublings',        val: fmtN(Math.log2(N / N0)), unit: '' },
  ], 'Exponential doubling valid in log-phase only. E. coli: 20 min; mammalian cells: 18–24 h; tumour cells: 1–5 days.');
}

/* ── Cell count prediction ──────────────────────────────────── */
function cdtPredCalc() {
  const N0 = v('cdtp-N0'), td = v('cdtp-td'), t = v('cdtp-t');
  if (N0 <= 0 || td <= 0 || t <= 0) return errOut('cdtp-out', 'All values must be positive.');
  const N = N0 * Math.pow(2, t / td);
  showOut('cdtp-out', [
    { label: 'Cell count N(t)', val: fmtN(N),       unit: '', cls: 'good' },
    { label: 'Doublings',       val: fmtN(t / td), unit: '' },
  ], '>10⁹ cells/mL is beyond typical culture capacity. Account for cell death in long-term predictions.');
}

/* ── One-compartment pharmacokinetics ───────────────────────── */
function pkCalc() {
  const C0 = v('pk-C0'), k = v('pk-ke'), t = v('pk-t');
  if (C0 <= 0 || k <= 0 || t < 0) return errOut('pk-out', 'C0, k > 0; t ≥ 0.');
  const Ct    = C0 * Math.exp(-k * t);
  const t12   = Math.log(2) / k;
  const AUCt  = C0 / k * (1 - Math.exp(-k * t));
  const AUCinf = C0 / k;
  showOut('pk-out', [
    { label: 'C(t)',      val: fmtN(Ct),     unit: '(same as C₀)', cls: 'good' },
    { label: 't½',        val: fmtN(t12),    unit: '(same time unit)' },
    { label: 'AUC (0→t)',  val: fmtN(AUCt),  unit: '' },
    { label: 'AUC (0→∞)', val: fmtN(AUCinf), unit: '' },
  ], 'ke=ln2/t½. At 4–5×t½ steady state is reached with repeated dosing. AUC ∝ total drug exposure.');
}

/* ── Loading and maintenance dose ───────────────────────────── */
function doseCalc() {
  const Ct = v('dose-Ct'), Vd = v('dose-Vd'), F = v('dose-F') || 1, CL = v('dose-CL'), tau = v('dose-tau');
  if (Ct <= 0 || Vd <= 0 || F <= 0) return errOut('dose-out', 'Ct, Vd, F must be positive.');
  const LD = Ct * Vd / F;
  const MD = CL * Ct * tau / F;
  showOut('dose-out', [
    { label: 'Loading dose LD',   val: fmtN(LD), unit: '(mass unit)', cls: 'good' },
    { label: 'Maintenance dose MD', val: isFinite(MD) && MD > 0 ? fmtN(MD) : '— (enter CL and τ)', unit: '' },
    { label: 'CL·τ/F', val: CL > 0 ? fmtN(CL * tau / F) : '—', unit: '' },
  ], 'Loading dose achieves target concentration. Maintenance replaces drug eliminated per dosing interval.');
}

/* ── Coronary flow reserve / fractional flow reserve ────────── */
function cfrCalc() {
  const tab = document.querySelector('#cfr-tabs .tab.active').dataset.tab;
  if (tab === 'cfr') {
    const Qh = v('cfr-Qh'), Qb = v('cfr-Qb');
    if (Qb <= 0 || Qh <= 0) return errOut('cfr-out', 'Both flows must be positive.');
    const CFR = Qh / Qb;
    showOut('cfr-out', [
      { label: 'CFR',              val: fmtN(CFR), unit: '', cls: CFR >= 2.5 ? 'good' : CFR >= 2.0 ? 'warn' : 'bad' },
      { label: 'Clinical threshold', val: '≥ 2.5 normal · 2.0–2.5 borderline · < 2.0 impaired', unit: '' },
      { label: 'Assessment', val: CFR >= 2.5 ? 'Normal — adequate reserve' : CFR >= 2.0 ? 'Borderline' : 'Impaired — reduced microvascular reserve', unit: '', cls: CFR >= 2.5 ? 'good' : CFR >= 2.0 ? 'warn' : 'bad' },
    ], 'CFR<2.0: significant microvascular dysfunction. CFR cannot distinguish epicardial stenosis from microvascular disease without FFR.');
  } else {
    const Pd = v('cfr-Pd'), Pa = v('cfr-Pa');
    if (Pa <= 0 || Pd <= 0 || Pd > Pa) return errOut('cfr-out', '0 < Pd ≤ Pa required.');
    const FFR = Pd / Pa;
    showOut('cfr-out', [
      { label: 'FFR (Pd/Pa)',         val: fmtN(FFR), unit: '', cls: FFR > 0.80 ? 'good' : 'warn' },
      { label: 'Ischaemia threshold', val: 'FFR ≤ 0.80 → revascularise', unit: '' },
      { label: 'Recommendation', val: FFR <= 0.80 ? 'Revascularisation indicated (FFR ≤ 0.80)' : 'Defer PCI — FFR > 0.80', unit: '', cls: FFR <= 0.80 ? 'warn' : 'good' },
    ], 'FFR≤0.80: haemodynamically significant stenosis (FAME trial evidence). FFR measured under maximal hyperaemia (adenosine).');
  }
}

/* ── Henderson-Hasselbalch buffer equation ──────────────────── */
function hhCalc() {
  const tab = document.querySelector('#hh-tabs .tab.active').dataset.tab;
  if (tab === 'pH') {
    const pKa = v('hh-pKa'), ratio = v('hh-ratio');
    if (ratio <= 0) return errOut('hh-out', '[A⁻]/[HA] ratio must be positive.');
    const pH = pKa + Math.log10(ratio);
    showOut('hh-out', [
      { label: 'pH',           val: fmtN(pH), unit: '', cls: 'good' },
      { label: 'Buffer range', val: `${fmtN(pKa - 1)} – ${fmtN(pKa + 1)}`, unit: '(pKa ± 1)' },
      { label: 'Buffering capacity', val: ratio >= 0.1 && ratio <= 10 ? 'Effective (ratio within 10:1)' : 'Weak — near capacity limit', unit: '' },
    ], 'Buffer most effective within ±1 pH unit of pKa. Bicarbonate buffer (pKa=6.1) works at blood pH 7.4 via CO₂ equilibrium.');
  } else {
    const pKa = v('hh-pKa2'), pH = v('hh-pH');
    const ratio = Math.pow(10, pH - pKa);
    showOut('hh-out', [
      { label: '[A⁻]/[HA] ratio needed', val: fmtN(ratio),                  unit: '', cls: 'good' },
      { label: '% conjugate base [A⁻]', val: fmtN(ratio / (1 + ratio) * 100), unit: '%' },
      { label: '% weak acid [HA]',       val: fmtN(1 / (1 + ratio) * 100),    unit: '%' },
    ], 'Use this ratio to mix acid and conjugate base. Ratio >10:1 or <1:10 gives poor buffering capacity.');
  }
}
