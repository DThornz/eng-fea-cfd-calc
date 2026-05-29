/* ================================================================
   calcs-materials.js — Materials science and mechanical design
   Sections: rule of mixtures, thermal mismatch stress, creep
             (Norton law), Larson-Miller parameter, Tsai-Wu failure
             (composites), gear ratios, bearing L10 life, bolt
             torque/preload, spring rate, Hertz contact, thread
             engagement length.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Materials or Mechanical Design
        <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Rule of mixtures — composite modulus ───────────────────── */
function romCalc() {
  const Ef = v('rom-Ef') * su('rom-Ef-u'), Em = v('rom-Em') * su('rom-Em-u');
  const Vf = v('rom-Vf') / 100;
  if (Ef <= 0 || Em <= 0 || Vf <= 0 || Vf >= 1)
    return errOut('rom-out', 'E values must be positive; Vf between 0–100%.');
  const Vm       = 1 - Vf;
  const Ec_long  = Vf * Ef + Vm * Em;
  const Ec_trans = 1 / (Vf / Ef + Vm / Em);
  showOut('rom-out', [
    { label: 'Vf',                    val: fmtN(Vf * 100),       unit: '%' },
    { label: 'Vm',                    val: fmtN(Vm * 100),       unit: '%' },
    { label: 'E longitudinal',        val: fmtN(Ec_long  / 1e9), unit: 'GPa', cls: 'good' },
    { label: 'E transverse',          val: fmtN(Ec_trans / 1e9), unit: 'GPa' },
    { label: 'Anisotropy ratio E₁/E₂', val: fmtN(Ec_long / Ec_trans), unit: '' },
  ], 'Longitudinal (parallel): iso-strain — fibres carry full load. Transverse: iso-stress — matrix deforms more.');
}

/* ── Thermal mismatch stress at bi-material interface ────────── */
function temCalc() {
  const E  = v('tem-E') * su('tem-E-u'), nu = v('tem-nu');
  const a1 = v('tem-a1') * 1e-6, a2 = v('tem-a2') * 1e-6, dT = v('tem-dT');
  if (E <= 0) return errOut('tem-out', 'E must be positive.');
  const da  = Math.abs(a1 - a2);
  const eps = da * dT;
  const sig = E * da * dT / (1 - nu);
  showOut('tem-out', [
    { label: 'Δα',                    val: fmtN(da * 1e6),  unit: 'μm/(m·K)' },
    { label: 'Thermal strain ε',      val: fmtN(eps * 1000), unit: '× 10⁻³' },
    { label: 'Thermal stress σ (constrained)', val: fmtN(sig / 1e6), unit: 'MPa', cls: 'good' },
    { label: 'Tensile or compressive?', val: dT > 0 ? (a1 > a2 ? 'Tensile in mat 1' : 'Compressive in mat 1') : 'Reversed', unit: '' },
  ], 'High σ_th indicates risk of delamination. Critical in PCB solder joints, thermal barrier coatings, and bonded dissimilar metals.');
}

/* ── Norton steady-state creep ──────────────────────────────── */
function crpCalc() {
  const A   = v('crp-A'), n = v('crp-n'), Q = v('crp-Q') * 1000;
  const sig = v('crp-sig') * su('crp-sig-u'), T = v('crp-T') + 273.15;
  const R = 8.314;
  if (A <= 0 || T <= 0 || sig <= 0) return errOut('crp-out', 'A, T, σ must be positive.');
  const edot  = A * Math.pow(sig, n) * Math.exp(-Q / (R * T));
  const t1pct = 0.01 / edot / 3600;
  showOut('crp-out', [
    { label: 'Creep rate ε̇',       val: fmtN(edot),        unit: 's⁻¹', cls: 'good' },
    { label: 'Time to 1% strain', val: fmtN(t1pct),        unit: 'hours' },
    { label: 'Time to 1% strain', val: fmtN(t1pct / 8760), unit: 'years' },
  ], 'Norton creep is valid in secondary (steady-state) creep. Creep rate doubles every ~10°C for metals.');
}

/* ── Larson-Miller creep-rupture parameter ──────────────────── */
function lmpCalc() {
  const T = v('lmp-T') + 273.15, t = v('lmp-t'), C = v('lmp-C') || 20;
  if (T <= 0 || t <= 0) return errOut('lmp-out', 'T and t must be positive.');
  const P = T * (C + Math.log10(t));
  showOut('lmp-out', [
    { label: 'Larson-Miller Parameter P', val: fmtN(P), unit: 'K', cls: 'good' },
    { label: 'T (K)',    val: fmtN(T),              unit: 'K' },
    { label: 'log₁₀(t)', val: fmtN(Math.log10(t)), unit: '' },
    { label: 'Note', val: 'Compare P to material Larson-Miller curves for rupture prediction.', unit: '' },
  ], 'C≈20 for most steels and Ni-alloys. Higher P (higher T or longer time) → lower allowable stress for same rupture life.');
}

/* ── Tsai-Wu composite failure index ────────────────────────── */
function tsaiCalc() {
  const Xt = v('tsai-Xt'), Xc = v('tsai-Xc'), Yt = v('tsai-Yt'), Yc = v('tsai-Yc'), S = v('tsai-S');
  const s1 = v('tsai-s1'), s2 = v('tsai-s2'), t12 = v('tsai-t12');
  if (Xt <= 0 || Xc <= 0 || Yt <= 0 || Yc <= 0 || S <= 0)
    return errOut('tsai-out', 'All strength values must be positive.');
  const F1 = 1 / Xt - 1 / Xc, F2 = 1 / Yt - 1 / Yc;
  const F11 = 1 / (Xt * Xc), F22 = 1 / (Yt * Yc), F66 = 1 / (S * S);
  const FI = F1 * s1 + F2 * s2 + F11 * s1 ** 2 + F22 * s2 ** 2 + F66 * t12 ** 2;
  showOut('tsai-out', [
    { label: 'Failure Index (FI)',  val: fmtN(FI),       unit: '', cls: FI >= 1 ? 'bad' : 'good' },
    { label: 'Margin of Safety',   val: fmtN(1 / FI - 1), unit: '' },
    { label: 'Failure?', val: FI >= 1 ? 'YES — failure predicted' : 'No — safe', unit: '', cls: FI >= 1 ? 'bad' : 'good' },
  ], 'FI<1: no first-ply failure. FI=1: first-ply failure onset. Check all plies — not just peak stress ply.');
}

/* ── Gear ratio and torque ──────────────────────────────────── */
function grCalc() {
  const N1 = v('gr-N1'), N2 = v('gr-N2'), rpm1 = v('gr-rpm1'), T1 = v('gr-T1'), eta = v('gr-eta') || 1;
  if (N1 <= 0 || N2 <= 0) return errOut('gr-out', 'Tooth counts must be positive.');
  const GR   = N2 / N1;
  const rpm2 = rpm1 / GR;
  const T2   = T1 * GR * eta;
  const P    = T1 * rpm1 * 2 * Math.PI / 60;
  showOut('gr-out', [
    { label: 'Gear ratio GR',   val: fmtN(GR),   unit: '', cls: 'good' },
    { label: 'Output speed',    val: fmtN(rpm2), unit: 'RPM' },
    { label: 'Output torque',   val: fmtN(T2),   unit: 'N·m' },
    { label: 'Power (input)',   val: fmtN(P),    unit: 'W' },
  ], 'Reflected inertia to motor = J_load/GR². Optimal GR for inertia matching: GR = √(J_load/J_motor).');
}

/* ── Bearing L10 life ───────────────────────────────────────── */
function brgCalc() {
  const C    = v('brg-C') * su('brg-C-u'), P = v('brg-P') * su('brg-P-u'), n = v('brg-n');
  const type = g('brg-type').value;
  const p    = type === 'ball' ? 3 : 10 / 3;
  if (C <= 0 || P <= 0 || n <= 0) return errOut('brg-out', 'All values must be positive.');
  const L10m = Math.pow(C / P, p);
  const L10h = L10m * 1e6 / (60 * n);
  showOut('brg-out', [
    { label: 'L10 life',          val: fmtN(L10m), unit: '× 10⁶ rev', cls: 'good' },
    { label: 'L10 life',          val: fmtN(L10h), unit: 'hours' },
    { label: 'L50 life (median)', val: fmtN(L10h * 5), unit: 'hours' },
    { label: 'C/P ratio',         val: fmtN(C / P),    unit: '' },
  ], 'L10: 10% failure rate (90% survival). For 95% survival: L5≈0.62×L10. Target L10=20,000–50,000 h for industrial machinery.');
}

/* ── Bolt torque ↔ preload ──────────────────────────────────── */
function boltCalc() {
  const mode = g('bolt-mode').value;
  const K    = v('bolt-K') || 0.2;
  const d    = v('bolt-d') * su('bolt-d-u');
  if (d <= 0) return errOut('bolt-out', 'Diameter must be positive.');
  if (mode === 'T2F') {
    const T  = v('bolt-T') * su('bolt-T-u');
    const F  = T / (K * d);
    const At = Math.PI / 4 * (d - 0.9743 / (v('bolt-pitch') * su('bolt-pitch-u'))) ** 2;
    showOut('bolt-out', [
      { label: 'Preload F',       val: fmtN(F),      unit: 'N', cls: 'good' },
      { label: 'Clamping stress', val: fmtN(F / At), unit: 'MPa' },
    ], 'Target preload F_i = 0.7×F_proof. K=0.2 (as-received steel); K=0.15 (lubricated); K=0.12 (waxed).');
  } else {
    const F = v('bolt-F') * su('bolt-F-u');
    const T = K * d * F;
    showOut('bolt-out', [
      { label: 'Required torque T', val: fmtN(T), unit: 'N·m', cls: 'good' },
      { label: 'Preload F',         val: fmtN(F), unit: 'N' },
    ], 'Target preload F_i = 0.7×F_proof. Verify joint does not separate under service load: F_service < F_i / joint factor.');
  }
}

/* ── Coil spring / rate from F/δ ────────────────────────────── */
function sprCalc() {
  const mode = g('spr-mode').value;
  if (mode === 'coil') {
    const dw = v('spr-dw') * su('spr-dw-u'), D = v('spr-D') * su('spr-D-u');
    const nc = v('spr-nc'), G = v('spr-G') * su('spr-G-u');
    if (dw <= 0 || D <= 0 || nc <= 0 || G <= 0) return errOut('spr-out', 'All values must be positive.');
    const k     = G * dw ** 4 / (8 * D ** 3 * nc);
    const C     = D / dw;
    const delta = v('spr-delta') * su('spr-delta-u');
    const F     = k * delta;
    showOut('spr-out', [
      { label: 'Spring rate k',  val: fmtN(k),              unit: 'N/m',  cls: 'good' },
      { label: 'Spring index C', val: fmtN(C),              unit: '' },
      { label: 'Force at δ',    val: fmtN(F),              unit: 'N' },
      { label: 'Energy stored', val: fmtN(0.5 * k * delta ** 2), unit: 'J' },
    ], 'Springs in series: 1/k_total = Σ(1/kᵢ). Parallel: k_total = Σkᵢ. For fatigue: limit stress amplitude to <0.45×τ_ult.');
  } else {
    const F = v('spr-F2') * su('spr-F2-u'), delta = v('spr-delta2') * su('spr-delta2-u');
    if (delta === 0) return errOut('spr-out', 'Deflection cannot be zero.');
    const k = F / delta;
    showOut('spr-out', [
      { label: 'Spring rate k',  val: fmtN(k),              unit: 'N/m', cls: 'good' },
      { label: 'Energy stored', val: fmtN(0.5 * F * delta), unit: 'J' },
    ], 'Springs in series: 1/k_total = Σ(1/kᵢ). Parallel: k_total = Σkᵢ.');
  }
}

/* ── Hertz contact (sphere on sphere / sphere on flat) ──────── */
function htzCalc() {
  const F   = v('htz-F') * su('htz-F-u'), R1 = v('htz-R1') * su('htz-R1-u');
  const R2v = v('htz-R2'), R2 = (R2v === 0 || !isFinite(R2v)) ? Infinity : R2v * su('htz-R2-u');
  const E1  = v('htz-E1') * 1e9, nu1 = v('htz-nu1'), E2 = v('htz-E2') * 1e9, nu2 = v('htz-nu2');
  if (F <= 0 || R1 <= 0 || E1 <= 0 || E2 <= 0) return errOut('htz-out', 'Positive F, R1, E1, E2 required.');
  const Estar = 1 / ((1 - nu1 ** 2) / E1 + (1 - nu2 ** 2) / E2);
  const Rstar = 1 / (1 / R1 + (R2 === Infinity ? 0 : 1 / R2));
  const a     = Math.cbrt(3 * F * Rstar / (4 * Estar));
  const p0    = 3 * F / (2 * Math.PI * a ** 2);
  showOut('htz-out', [
    { label: 'Contact radius a',     val: fmtN(a * 1000),    unit: 'mm', cls: 'good' },
    { label: 'Peak pressure p₀',     val: fmtN(p0 / 1e6),   unit: 'MPa' },
    { label: 'Max shear stress depth', val: fmtN(0.48 * a * 1000), unit: 'mm' },
    { label: 'Max shear stress τ_max', val: fmtN(0.31 * p0 / 1e6), unit: 'MPa' },
    { label: 'Effective modulus E*', val: fmtN(Estar / 1e9), unit: 'GPa' },
  ], 'Subsurface max shear occurs at depth ≈0.48a — where rolling contact fatigue cracks initiate (bearings, gears).');
}

/* ── Thread engagement length ───────────────────────────────── */
function thrCalc() {
  const d = v('thr-d') * su('thr-d-u'), p = v('thr-p') * su('thr-p-u');
  const Sut = v('thr-Sut') * su('thr-Sut-u');
  if (d <= 0 || p <= 0) return errOut('thr-out', 'Positive d and pitch required.');
  const At     = Math.PI / 4 * (d - 0.9743 * p) ** 2;
  const Le_same = d, Le_al = 1.5 * d;
  showOut('thr-out', [
    { label: 'Tensile stress area',           val: fmtN(At * 1e6),        unit: 'mm²' },
    { label: 'Min engagement (same mat.)',    val: fmtN(Le_same * 1000),  unit: 'mm', cls: 'good' },
    { label: 'Min engagement (steel→Al)',     val: fmtN(Le_al * 1000),    unit: 'mm' },
    { label: 'Shear area (per mm engage.)',   val: fmtN(Math.PI * d * p / 2 * 1e6), unit: 'mm²/mm' },
  ], 'Minimum engagement ensures bolt breaks before threads strip. L_e ≥ 1×D (steel-steel); ≥ 1.5×D (steel-Al); ≥ 2×D (soft metals).');
}
