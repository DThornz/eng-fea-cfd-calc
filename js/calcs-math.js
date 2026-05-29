/* ================================================================
   calcs-math.js — Mathematics, statistics, signal processing,
                   and control systems calculators
   Sections: quadratic formula, linear systems (2×2/3×3), matrix
             ops, error propagation, Monte Carlo uncertainty,
             confidence intervals, sample size, Cohen's d, chi²,
             RMSE/R², logistic regression, RMS analysis, Nyquist,
             moving average, HRV, DFT/FFT, PID tuning (Z-N),
             second-order system, gain/phase margins, state-space
             controllability/observability, statistical power,
             one-way ANOVA.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the relevant <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── Mathematics ───────────────────────────────────────────── */

/* Quadratic formula — ax² + bx + c = 0 */
function qdCalc() {
  const a = v('qd-a'), b = v('qd-b'), c = v('qd-c');
  if (!isFinite(a) || a === 0) return errOut('qd-out', 'Coefficient a cannot be zero.');
  const disc = b * b - 4 * a * c;
  if (disc >= 0) {
    const x1 = (-b + Math.sqrt(disc)) / (2 * a), x2 = (-b - Math.sqrt(disc)) / (2 * a);
    showOut('qd-out', [
      { label: 'Discriminant Δ', val: fmtN(disc), unit: '' },
      { label: 'Nature', val: disc === 0 ? 'One real root (repeated)' : 'Two distinct real roots', unit: '' },
      { label: 'x₁', val: fmtN(x1), unit: '', cls: 'good' },
      { label: 'x₂', val: fmtN(x2), unit: '', cls: 'good' },
      { label: 'Vertex x', val: fmtN(-b / (2 * a)),    unit: '' },
      { label: 'Vertex y', val: fmtN(c - b * b / (4 * a)), unit: '' },
    ], 'Δ>0: two real roots. Δ=0: one repeated root. Δ<0: complex roots (no real crossings).');
  } else {
    const re = -b / (2 * a), im = Math.sqrt(-disc) / (2 * a);
    showOut('qd-out', [
      { label: 'Discriminant Δ', val: fmtN(disc), unit: '' },
      { label: 'Nature', val: 'Complex conjugate roots', unit: '', cls: 'warn' },
      { label: 'x₁', val: `${fmtN(re)} + ${fmtN(im)}i`, unit: '' },
      { label: 'x₂', val: `${fmtN(re)} − ${fmtN(im)}i`, unit: '' },
    ], 'Complex roots occur in conjugate pairs. In engineering, they indicate oscillatory (underdamped) system response.');
  }
}

/* System of linear equations (Cramer's rule, 2×2 and 3×3) */
function sleCalc() {
  const tab = document.querySelector('#sle-tabs .tab.active').dataset.tab;
  if (tab === '2x2') {
    const a = v('sle-a11'), b = v('sle-a12'), c = v('sle-b1'), d = v('sle-a21'), e = v('sle-a22'), f = v('sle-b2');
    const det = a * e - b * d;
    if (Math.abs(det) < 1e-12) return errOut('sle-out', 'System is singular (no unique solution).');
    const x = (c * e - b * f) / det, y = (a * f - c * d) / det;
    showOut('sle-out', [
      { label: 'det(A)', val: fmtN(det), unit: '' },
      { label: 'x', val: fmtN(x), unit: '', cls: 'good' },
      { label: 'y', val: fmtN(y), unit: '', cls: 'good' },
    ], "det≠0: unique solution (Cramer's rule). det=0: singular — no solution or infinitely many.");
  } else {
    const a = [[v('sle-a11b'), v('sle-a12b'), v('sle-a13b')],
               [v('sle-a21b'), v('sle-a22b'), v('sle-a23b')],
               [v('sle-a31b'), v('sle-a32b'), v('sle-a33b')]];
    const b = [v('sle-b1b'), v('sle-b2b'), v('sle-b3b')];
    const det = a[0][0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1])
              - a[0][1] * (a[1][0] * a[2][2] - a[1][2] * a[2][0])
              + a[0][2] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    if (Math.abs(det) < 1e-12) return errOut('sle-out', 'System is singular.');
    const dx = b[0] * (a[1][1] * a[2][2] - a[1][2] * a[2][1]) - a[0][1] * (b[1] * a[2][2] - a[1][2] * b[2]) + a[0][2] * (b[1] * a[2][1] - a[1][1] * b[2]);
    const dy = a[0][0] * (b[1] * a[2][2] - a[1][2] * b[2]) - b[0] * (a[1][0] * a[2][2] - a[1][2] * a[2][0]) + a[0][2] * (a[1][0] * b[2] - b[1] * a[2][0]);
    const dz = a[0][0] * (a[1][1] * b[2] - b[1] * a[2][1]) - a[0][1] * (a[1][0] * b[2] - b[1] * a[2][0]) + b[0] * (a[1][0] * a[2][1] - a[1][1] * a[2][0]);
    showOut('sle-out', [
      { label: 'det(A)', val: fmtN(det),        unit: '' },
      { label: 'x',      val: fmtN(dx / det),   unit: '', cls: 'good' },
      { label: 'y',      val: fmtN(dy / det),   unit: '', cls: 'good' },
      { label: 'z',      val: fmtN(dz / det),   unit: '', cls: 'good' },
    ], "det≠0: unique solution. Small |det| indicates near-singularity.");
  }
}

/* Matrix properties — determinant, inverse, eigenvalues */
function matCalc() {
  const tab = document.querySelector('#mat-tabs .tab.active').dataset.tab;
  if (tab === '2x2') {
    const a = v('mat-a'), b = v('mat-b'), c = v('mat-c'), d = v('mat-d');
    const det = a * d - b * c, tr = a + d;
    const disc = tr * tr - 4 * det;
    const rows = [
      { label: 'det(A)', val: fmtN(det), unit: '', cls: det === 0 ? 'warn' : 'good' },
      { label: 'trace',  val: fmtN(tr),  unit: '' },
    ];
    if (Math.abs(det) > 1e-14) {
      rows.push({ label: 'A⁻¹ row 1', val: `[${fmtN(d / det)}, ${fmtN(-b / det)}]`, unit: '' });
      rows.push({ label: 'A⁻¹ row 2', val: `[${fmtN(-c / det)}, ${fmtN(a / det)}]`, unit: '' });
    }
    if (disc >= 0) {
      rows.push({ label: 'λ₁', val: fmtN((tr + Math.sqrt(disc)) / 2), unit: '' });
      rows.push({ label: 'λ₂', val: fmtN((tr - Math.sqrt(disc)) / 2), unit: '' });
    } else {
      rows.push({ label: 'λ₁', val: `${fmtN(tr / 2)} + ${fmtN(Math.sqrt(-disc) / 2)}i`, unit: '' });
      rows.push({ label: 'λ₂', val: `${fmtN(tr / 2)} − ${fmtN(Math.sqrt(-disc) / 2)}i`, unit: '' });
    }
    showOut('mat-out', rows, 'det=0: singular. Condition number κ=|λ_max/λ_min|: κ>1000 → ill-conditioned.');
  } else {
    const r = [[v('mat3-a11'), v('mat3-a12'), v('mat3-a13')],
               [v('mat3-a21'), v('mat3-a22'), v('mat3-a23')],
               [v('mat3-a31'), v('mat3-a32'), v('mat3-a33')]];
    const det = r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1])
              - r[0][1] * (r[1][0] * r[2][2] - r[1][2] * r[2][0])
              + r[0][2] * (r[1][0] * r[2][1] - r[1][1] * r[2][0]);
    const tr = r[0][0] + r[1][1] + r[2][2];
    showOut('mat-out', [
      { label: 'det(A)', val: fmtN(det), unit: '', cls: Math.abs(det) < 1e-10 ? 'warn' : 'good' },
      { label: 'trace',  val: fmtN(tr),  unit: '' },
      { label: 'Note',   val: 'Eigenvalues for 3×3 require numerical solver — use QR iteration.', unit: '' },
    ], 'Trace = sum of eigenvalues; det = product of eigenvalues. det=0 in FEA stiffness matrix → unconstrained model.');
  }
}

/* ── Statistics ─────────────────────────────────────────────── */

/* Gaussian error propagation */
function errpCalc() {
  const x = v('errp-x'), sx = v('errp-sx'), y = v('errp-y'), sy = v('errp-sy'), n = v('errp-n');
  const mode = g('errp-mode').value;
  let f, sf;
  if      (mode === 'add') { f = x + y; sf = Math.sqrt(sx * sx + sy * sy); }
  else if (mode === 'sub') { f = x - y; sf = Math.sqrt(sx * sx + sy * sy); }
  else if (mode === 'mul') { f = x * y; sf = Math.abs(f) * Math.sqrt((sx / x) ** 2 + (sy / y) ** 2); }
  else if (mode === 'div') { f = x / y; sf = Math.abs(f) * Math.sqrt((sx / x) ** 2 + (sy / y) ** 2); }
  else                     { f = Math.pow(x, n); sf = Math.abs(n) * Math.pow(Math.abs(x), n - 1) * sx; }
  showOut('errp-out', [
    { label: 'Result f',         val: fmtN(f),                      unit: '', cls: 'good' },
    { label: 'σf (absolute)',    val: fmtN(sf),                     unit: '' },
    { label: 'σf/f (relative)', val: fmtN(Math.abs(sf / f) * 100), unit: '%' },
    { label: '95% CI',          val: `${fmtN(f - 1.96 * sf)} to ${fmtN(f + 1.96 * sf)}`, unit: '' },
  ], 'The largest fractional contributor dominates total uncertainty. Improve precision of that measurement first.');
}

/* Monte Carlo uncertainty propagation */
function mcuCalc() {
  const mx = v('mcu-mx'), sx = v('mcu-sx'), my = v('mcu-my'), sy = v('mcu-sy');
  const N  = Math.min(parseInt(g('mcu-N').value) || 10000, 50000);
  const mode = g('mcu-mode').value;
  function randn() { let u = 0, vv = 0; while (!u) u = Math.random(); while (!vv) vv = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * vv); }
  const samples = [];
  for (let i = 0; i < N; i++) {
    const xi = mx + sx * randn(), yi = my + sy * randn();
    if      (mode === 'mul') samples.push(xi * yi);
    else if (mode === 'div' && yi !== 0) samples.push(xi / yi);
    else samples.push(xi + yi);
  }
  const mean   = samples.reduce((a, b) => a + b, 0) / N;
  const std    = Math.sqrt(samples.reduce((a, b) => a + (b - mean) ** 2, 0) / N);
  const sorted = [...samples].sort((a, b) => a - b);
  showOut('mcu-out', [
    { label: 'N samples',      val: N,        unit: '' },
    { label: 'Mean f',         val: fmtN(mean), unit: '', cls: 'good' },
    { label: 'Std dev σ',      val: fmtN(std),  unit: '' },
    { label: '95% CI (low)',   val: fmtN(sorted[Math.floor(0.025 * N)]), unit: '' },
    { label: '95% CI (high)',  val: fmtN(sorted[Math.floor(0.975 * N)]), unit: '' },
  ], 'Monte Carlo is exact for any function shape. N=10000: uncertainty on uncertainty ≈1%. Results vary each run.');
}

/* Confidence interval for a mean */
function ciCalc() {
  const xbar = v('ci-xbar'), s = v('ci-s'), n = v('ci-n');
  const conf = parseFloat(g('ci-conf').value);
  if (n < 1 || s < 0) return errOut('ci-out', 'Invalid inputs.');
  const zMap = { 90: 1.645, 95: 1.96, 99: 2.576 };
  const z    = n < 30 ? (conf === 90 ? 1.833 : conf === 95 ? 2.045 : 2.756) : zMap[conf];
  const me   = z * s / Math.sqrt(n);
  showOut('ci-out', [
    { label: 'Margin of error', val: fmtN(me),         unit: '', cls: 'good' },
    { label: 'Lower bound',     val: fmtN(xbar - me),  unit: '' },
    { label: 'Upper bound',     val: fmtN(xbar + me),  unit: '' },
    { label: 'z/t critical',    val: fmtN(z),           unit: '' },
    { label: 'Standard error',  val: fmtN(s / Math.sqrt(n)), unit: '' },
  ], (n < 30 ? 'Using t-approximation for n<30. ' : '') + 'If CI includes the null value, result is not significant at this confidence level.');
}

/* Required sample size */
function ssCalc() {
  const tab  = document.querySelector('#ss-tabs .tab.active').dataset.tab;
  const conf = parseFloat(g('ss-conf').value);
  const z    = { 90: 1.645, 95: 1.96, 99: 2.576 }[conf] || 1.96;
  if (tab === 'means') {
    const s = v('ss-s'), E = v('ss-E');
    if (s <= 0 || E <= 0) return errOut('ss-out', 'Enter positive σ and E.');
    const n = Math.ceil((z * s / E) ** 2);
    showOut('ss-out', [
      { label: 'Required n',   val: n,       unit: '', cls: 'good' },
      { label: 'z critical',   val: fmtN(z), unit: '' },
      { label: 'σ/E ratio',    val: fmtN(s / E), unit: '' },
    ], 'Halving the margin of error requires 4× more samples. For proportions, n is largest when p=0.5.');
  } else {
    const p = v('ss-p') || 0.5, E = v('ss-Ep');
    const n = Math.ceil(z * z * p * (1 - p) / (E * E));
    showOut('ss-out', [
      { label: 'Required n',  val: n,       unit: '', cls: 'good' },
      { label: 'p assumed',   val: fmtN(p), unit: '' },
      { label: 'z critical',  val: fmtN(z), unit: '' },
    ], 'Halving the margin of error requires 4× more samples.');
  }
}

/* Cohen's d effect size */
function cohCalc() {
  const m1 = v('coh-m1'), m2 = v('coh-m2'), s1 = v('coh-s1'), s2 = v('coh-s2');
  if (s1 <= 0 || s2 <= 0) return errOut('coh-out', 'Standard deviations must be positive.');
  const sp    = Math.sqrt((s1 * s1 + s2 * s2) / 2);
  const d     = Math.abs(m1 - m2) / sp;
  const interp = d < 0.2 ? 'Negligible' : d < 0.5 ? 'Small' : d < 0.8 ? 'Medium' : 'Large';
  showOut('coh-out', [
    { label: "Cohen's d",    val: fmtN(d),                    unit: '', cls: 'good' },
    { label: 'Interpretation', val: interp,                   unit: '' },
    { label: 'Pooled SD',    val: fmtN(sp),                   unit: '' },
    { label: 'Mean difference', val: fmtN(Math.abs(m1 - m2)), unit: '' },
  ], 'd=0.2: small. d=0.5: medium. d=0.8: large. MCID defines the target d for power calculations in clinical trials.');
}

/* Chi-squared goodness-of-fit */
function chiCalc() {
  const obs = (g('chi-obs').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  const exp = (g('chi-exp').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  if (obs.length !== exp.length || obs.length < 2) return errOut('chi-out', 'Enter equal-length observed and expected lists (≥2 values).');
  const chi2 = obs.reduce((acc, o, i) => acc + (o - exp[i]) ** 2 / exp[i], 0);
  const df   = obs.length - 1;
  const z    = (Math.cbrt(chi2 / df) - (1 - 2 / (9 * df))) / Math.sqrt(2 / (9 * df));
  const p    = Math.max(0, Math.min(1, z > 0 ? 0.5 * Math.exp(-0.717 * z - 0.416 * z * z) : 1 - 0.5 * Math.exp(-0.717 * (-z) - 0.416 * z * z)));
  showOut('chi-out', [
    { label: 'χ²',                  val: fmtN(chi2), unit: '', cls: 'good' },
    { label: 'df',                   val: df,          unit: '' },
    { label: 'p-value (approx)',    val: fmtN(p),     unit: '', cls: p < 0.05 ? 'warn' : 'good' },
    { label: 'Significant (α=0.05)?', val: p < 0.05 ? 'Yes — reject H₀' : 'No — fail to reject H₀', unit: '' },
  ], 'p<0.05: frequencies differ significantly from expected. Large χ² with many categories may be driven by one deviation.');
}

/* RMSE / R² model accuracy metrics */
function rmseCalc() {
  const act  = (g('rmse-act').value  || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  const pred = (g('rmse-pred').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  if (act.length !== pred.length || act.length < 1) return errOut('rmse-out', 'Enter equal-length actual and predicted lists.');
  const n        = act.length;
  const mae      = act.reduce((a, y, i) => a + Math.abs(y - pred[i]), 0) / n;
  const mse      = act.reduce((a, y, i) => a + (y - pred[i]) ** 2, 0) / n;
  const rmse     = Math.sqrt(mse);
  const mean_act = act.reduce((a, b) => a + b, 0) / n;
  const ss_tot   = act.reduce((a, y) => a + (y - mean_act) ** 2, 0);
  const ss_res   = act.reduce((a, y, i) => a + (y - pred[i]) ** 2, 0);
  const r2       = 1 - ss_res / ss_tot;
  const mape     = act.reduce((a, y, i) => a + Math.abs((y - pred[i]) / y), 0) / n * 100;
  showOut('rmse-out', [
    { label: 'n',    val: n,        unit: '' },
    { label: 'RMSE', val: fmtN(rmse), unit: '', cls: 'good' },
    { label: 'MAE',  val: fmtN(mae),  unit: '' },
    { label: 'R²',   val: fmtN(r2),   unit: '', cls: r2 > 0.9 ? 'good' : r2 > 0.7 ? 'warn' : 'bad' },
    { label: 'MAPE', val: fmtN(mape), unit: '%' },
  ], 'R²=1: perfect fit. R²=0: no better than predicting the mean. R²<0: model worse than mean. MAE less sensitive to outliers than RMSE.');
}

/* Logistic regression prediction */
function logfCalc() {
  const b0 = v('logf-b0'), b1 = v('logf-b1'), x = v('logf-x');
  const z  = b0 + b1 * x;
  const p  = 1 / (1 + Math.exp(-z));
  showOut('logf-out', [
    { label: 'Linear predictor z', val: fmtN(z), unit: '' },
    { label: 'Probability p',      val: fmtN(p), unit: '', cls: 'good' },
    { label: 'Odds p/(1-p)',        val: fmtN(p / (1 - p)), unit: '' },
    { label: 'Log-odds (logit)',    val: fmtN(z), unit: '' },
    { label: 'Class prediction',   val: p >= 0.5 ? '1 (positive)' : '0 (negative)', unit: '' },
  ], 'β₁>0: increasing x raises probability. Decision boundary at p≈0.5 — adjust threshold based on cost of false positives vs. negatives.');
}

/* ── Signal processing ──────────────────────────────────────── */

/* RMS value analysis */
function rmsCalc() {
  const mode = g('rms-mode').value;
  let vals = [];
  if (mode === 'data') {
    vals = (g('rms-data').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
    if (vals.length < 2) return errOut('rms-out', 'Enter at least 2 comma-separated values.');
  } else {
    const A = v('rms-A'), N = 256;
    for (let i = 0; i < N; i++) vals.push(A * (mode === 'sine' ? Math.sin(2 * Math.PI * i / N) : mode === 'square' ? (i < N / 2 ? 1 : -1) : 1 - 4 * Math.abs(i / N - Math.round(i / N))));
  }
  const n    = vals.length;
  const mean = vals.reduce((a, b) => a + b, 0) / n;
  const rms  = Math.sqrt(vals.reduce((a, b) => a + b * b, 0) / n);
  const peak = Math.max(...vals.map(Math.abs));
  const cf   = rms > 0 ? peak / rms : NaN;
  showOut('rms-out', [
    { label: 'RMS',          val: fmtN(rms),  unit: '', cls: 'good' },
    { label: 'Peak',         val: fmtN(peak), unit: '' },
    { label: 'Crest Factor', val: fmtN(cf),   unit: '' },
    { label: 'Mean (DC)',    val: fmtN(mean), unit: '' },
    { label: 'n samples',    val: n,           unit: '' },
  ], 'RMS = effective DC-equivalent for AC signals. Crest factor: sine 1.414, triangle 1.732, square 1.0. Crest>4 may indicate impulsive noise.');
}

/* Nyquist criterion / aliasing check */
function nyqCalc() {
  const fs = v('nyq-fs'), f = v('nyq-f'), N = v('nyq-N') || 1024;
  if (fs <= 0) return errOut('nyq-out', 'Sampling rate must be positive.');
  const fN    = fs / 2;
  const df    = fs / N;
  const alias = f > fN ? Math.abs(f - Math.round(f / fs) * fs) : null;
  const rows  = [
    { label: 'Nyquist frequency',  val: fmtN(fN), unit: 'Hz', cls: 'good' },
    { label: 'Spectral res. Δf', val: fmtN(df), unit: 'Hz' },
    { label: 'Signal aliased?',   val: f > fN ? 'YES — aliasing occurs' : 'No — signal is resolved', unit: '', cls: f > fN ? 'warn' : 'good' },
  ];
  if (alias !== null) rows.push({ label: 'Alias frequency', val: fmtN(alias), unit: 'Hz' });
  rows.push({ label: 'Min. fs needed', val: fmtN(2 * f), unit: 'Hz' });
  showOut('nyq-out', rows, 'Sample at ≥ 2×f_max. In practice 5–10× for good reconstruction. Apply anti-aliasing filter BEFORE sampling.');
}

/* Moving average filter */
function mavCalc() {
  const vals = (g('mav-data').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  const W    = Math.max(2, parseInt(v('mav-W')) || 3);
  if (vals.length < W) return errOut('mav-out', 'Need more data points than window size.');
  const smooth = [];
  for (let i = W - 1; i < vals.length; i++) smooth.push(vals.slice(i - W + 1, i + 1).reduce((a, b) => a + b, 0) / W);
  const orig_mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  showOut('mav-out', [
    { label: 'Window size',       val: W,                              unit: 'pts' },
    { label: 'Original mean',     val: fmtN(orig_mean),               unit: '' },
    { label: 'Smoothed last val', val: fmtN(smooth[smooth.length - 1]), unit: '' },
    { label: 'Smoothed values',  val: smooth.map(x => fmtN(x, 3)).join(', '), unit: '' },
  ], 'Moving average is a low-pass FIR filter with cutoff ≈ 0.45×f_s/W. Larger W smooths more but lags the signal.');
}

/* Heart rate variability from RR intervals */
function hrvCalc() {
  const rr = (g('hrv-rr').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  if (rr.length < 3) return errOut('hrv-out', 'Enter at least 3 RR intervals (ms).');
  const n       = rr.length;
  const mean_rr = rr.reduce((a, b) => a + b, 0) / n;
  const hr      = 60000 / mean_rr;
  const sdnn    = Math.sqrt(rr.reduce((a, r) => a + (r - mean_rr) ** 2, 0) / n);
  const diffs   = rr.slice(1).map((r, i) => r - rr[i]);
  const rmssd   = Math.sqrt(diffs.reduce((a, d) => a + d * d, 0) / (n - 1));
  const pnn50   = diffs.filter(d => Math.abs(d) > 50).length / (n - 1) * 100;
  showOut('hrv-out', [
    { label: 'Mean HR',  val: fmtN(hr),      unit: 'bpm', cls: 'good' },
    { label: 'Mean RR',  val: fmtN(mean_rr), unit: 'ms' },
    { label: 'SDNN',     val: fmtN(sdnn),    unit: 'ms' },
    { label: 'RMSSD',    val: fmtN(rmssd),   unit: 'ms' },
    { label: 'pNN50',    val: fmtN(pnn50),   unit: '%' },
    { label: 'Min RR',   val: fmtN(Math.min(...rr)), unit: 'ms' },
    { label: 'Max RR',   val: fmtN(Math.max(...rr)), unit: 'ms' },
  ], 'SDNN>50 ms: normal HRV. SDNN<20 ms: reduced HRV. RMSSD reflects parasympathetic activity. pNN50>3%: normal autonomic function.');
}

/* Discrete Fourier Transform — top spectral peaks */
function fftCalc() {
  const vals = (g('fft-data').value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  const fs   = v('fft-fs') || 1;
  const N    = Math.min(vals.length, 256);
  if (N < 4) return errOut('fft-out', 'Enter at least 4 data points.');
  const re = new Array(N).fill(0), im = new Array(N).fill(0);
  for (let k = 0; k < N / 2; k++) {
    for (let n = 0; n < N; n++) {
      const a = 2 * Math.PI * k * n / N;
      re[k] += vals[n] * Math.cos(a);
      im[k] -= vals[n] * Math.sin(a);
    }
  }
  const mag = re.slice(0, N / 2).map((r, i) => Math.sqrt(r * r + im[i] * im[i]) / N);
  mag[0] /= 2;
  const df    = fs / N;
  const peaks = mag.map((m, i) => ({ m, f: i * df })).sort((a, b) => b.m - a.m).slice(0, 3);
  showOut('fft-out', [
    { label: 'N (used)',           val: N,              unit: 'pts' },
    { label: 'Spectral resolution', val: fmtN(df),      unit: 'Hz' },
    { label: 'DC component',       val: fmtN(2 * mag[0]), unit: '' },
    { label: 'Peak freq #1',       val: fmtN(peaks[0].f), unit: 'Hz', cls: 'good' },
    { label: 'Peak mag #1',        val: fmtN(peaks[0].m), unit: '' },
    { label: 'Peak freq #2',       val: fmtN(peaks[1].f), unit: 'Hz' },
    { label: 'Peak freq #3',       val: fmtN(peaks[2]?.f ?? 0), unit: 'Hz' },
  ], 'Window the signal (Hanning, Hamming) to reduce spectral leakage. DFT O(N²) — suitable for N≤256.');
}

/* ── Control systems ─────────────────────────────────────────── */

/* PID tuning — Ziegler-Nichols and Tyreus-Luyben */
function pidCalc() {
  const Ku = v('pid-Ku'), Tu = v('pid-Tu');
  if (Ku <= 0 || Tu <= 0) return errOut('pid-out', 'Ku and Tu must be positive.');
  showOut('pid-out', [
    { label: '— Classic Ziegler-Nichols (PID) —', val: '', unit: '' },
    { label: 'Kp', val: fmtN(0.6 * Ku),                     unit: '', cls: 'good' },
    { label: 'Ki (= Kp/Ti)', val: fmtN(0.6 * Ku / (0.5 * Tu)), unit: '' },
    { label: 'Kd (= Kp·Td)', val: fmtN(0.6 * Ku * 0.125 * Tu), unit: '' },
    { label: '— Tyreus–Luyben (PID) —', val: '', unit: '' },
    { label: 'Kp', val: fmtN(Ku / 3.2),                          unit: '' },
    { label: 'Ki', val: fmtN(Ku / (3.2 * 2.2 * Tu)),             unit: '' },
    { label: 'Kd', val: fmtN(Ku * Tu / (3.2 * 6.3)),             unit: '' },
  ], 'Ziegler-Nichols tends to aggressive tuning. Tyreus-Luyben gives less oscillatory control. For dead-time processes, use a Smith predictor.');
}

/* Second-order system response */
function sosCalc() {
  const wn = v('sos-wn'), z = v('sos-zeta');
  if (wn <= 0 || z < 0) return errOut('sos-out', 'ωn must be positive, ζ ≥ 0.');
  const wd  = wn * Math.sqrt(Math.max(0, 1 - z * z));
  const os  = z < 1 ? Math.exp(-Math.PI * z / Math.sqrt(1 - z * z)) * 100 : 0;
  const ts2 = z > 0 ? 4 / (z * wn) : Infinity;
  const ts5 = z > 0 ? 3 / (z * wn) : Infinity;
  const tr  = z < 1 ? (Math.PI - Math.acos(z)) / wd : NaN;
  const type = z === 0 ? 'Undamped' : z < 1 ? 'Underdamped' : z === 1 ? 'Critically damped' : 'Overdamped';
  showOut('sos-out', [
    { label: 'System type',       val: type,         unit: '', cls: z < 1 ? 'warn' : z === 1 ? 'good' : '' },
    { label: 'Damped freq ωd',   val: fmtN(wd),     unit: 'rad/s' },
    { label: 'Peak overshoot',   val: fmtN(os),     unit: '%', cls: os > 20 ? 'warn' : 'good' },
    { label: 'Rise time tr',     val: isFinite(tr)  ? fmtN(tr)  : '—', unit: 's' },
    { label: 'Settling time (2%)', val: isFinite(ts2) ? fmtN(ts2) : '—', unit: 's' },
    { label: 'Settling time (5%)', val: isFinite(ts5) ? fmtN(ts5) : '—', unit: 's' },
  ], 'ζ=1: critically damped (fastest settling, no overshoot). ωₙ increases speed. For robust control: GM>6 dB, PM>45°.');
}

/* Gain/phase margin for G(s) = K/(s(τ₁s+1)(τ₂s+1)) */
function gpmCalc() {
  const K = v('gpm-K'), t1 = v('gpm-t1'), t2 = v('gpm-t2');
  if (K <= 0 || t1 <= 0 || t2 <= 0) return errOut('gpm-out', 'All values must be positive.');
  let lo = 0.001, hi = 1e6, wgc = NaN;
  for (let i = 0; i < 60; i++) {
    const wm = (lo + hi) / 2;
    const mag = K / (wm * Math.sqrt(1 + t1 * t1 * wm * wm) * Math.sqrt(1 + t2 * t2 * wm * wm));
    if (mag > 1) lo = wm; else hi = wm;
    if (Math.abs(mag - 1) < 1e-7) { wgc = wm; break; }
  }
  wgc = (lo + hi) / 2;
  const phase = -(90 + Math.atan(t1 * wgc) * 180 / Math.PI + Math.atan(t2 * wgc) * 180 / Math.PI);
  const pm    = 180 + phase;
  const wpc   = 1 / Math.sqrt(t1 * t2);
  const magpc = K / (wpc * Math.sqrt(1 + t1 * t1 * wpc * wpc) * Math.sqrt(1 + t2 * t2 * wpc * wpc));
  const gm    = 20 * Math.log10(1 / magpc);
  showOut('gpm-out', [
    { label: 'Gain crossover ωgc', val: fmtN(wgc), unit: 'rad/s' },
    { label: 'Phase margin',       val: fmtN(pm),  unit: '°', cls: pm > 30 ? 'good' : pm > 0 ? 'warn' : 'bad' },
    { label: 'Phase crossover ωpc', val: fmtN(wpc), unit: 'rad/s' },
    { label: 'Gain margin',        val: fmtN(gm),  unit: 'dB', cls: gm > 6 ? 'good' : gm > 0 ? 'warn' : 'bad' },
    { label: 'Stability',          val: (pm > 0 && gm > 0) ? 'Stable' : 'Unstable', unit: '', cls: (pm > 0 && gm > 0) ? 'good' : 'bad' },
  ], 'GM>6 dB and PM>45°: adequate stability margins. GM<3 dB or PM<30°: close to instability.');
}

/* State-space controllability and observability (2-state system) */
function cobCalc() {
  const a11 = v('cob-a11'), a12 = v('cob-a12'), a21 = v('cob-a21'), a22 = v('cob-a22');
  const b1  = v('cob-b1'),  b2  = v('cob-b2'),  c1  = v('cob-c1'),  c2  = v('cob-c2');
  const ab1 = a11 * b1 + a12 * b2, ab2 = a21 * b1 + a22 * b2;
  const detC = b1 * ab2 - b2 * ab1;
  const ca1  = c1 * a11 + c2 * a21, ca2 = c1 * a12 + c2 * a22;
  const detO = c1 * ca2 - c2 * ca1;
  showOut('cob-out', [
    { label: 'det(Controllability)', val: fmtN(detC), unit: '', cls: Math.abs(detC) > 1e-10 ? 'good' : 'bad' },
    { label: 'Controllable?',        val: Math.abs(detC) > 1e-10 ? 'Yes' : 'No — rank deficient', unit: '' },
    { label: 'det(Observability)',   val: fmtN(detO), unit: '', cls: Math.abs(detO) > 1e-10 ? 'good' : 'bad' },
    { label: 'Observable?',         val: Math.abs(detO) > 1e-10 ? 'Yes' : 'No — rank deficient', unit: '' },
  ], 'Uncontrollable modes cannot be driven to desired states. Unobservable modes cannot be inferred from output (Kalman filter limitation).');
}

/* ── Statistical power and ANOVA ────────────────────────────── */

/* Statistical power analysis */
function powerCalc() {
  const d     = v('pow-d'), n = v('pow-n');
  const alpha = parseFloat(g('pow-alpha').value), test = g('pow-test').value;
  if (d <= 0 || n < 2) return errOut('pow-out', 'Effect size d > 0 and n ≥ 2 required.');
  const za  = { 0.05: 1.96, 0.01: 2.576, 0.1: 1.645 }[alpha] || 1.96;
  const erf = x => { const t = 1 / (1 + 0.3275911 * Math.abs(x)); const p = t * (0.254829592 + t * (-0.284496736 + t * (1.421413741 + t * (-1.453152027 + t * 1.061405429)))); return (1 - p * Math.exp(-x * x)) * (x >= 0 ? 1 : -1); };
  const Phi = z => 0.5 * (1 + erf(z / Math.SQRT2));
  const lambda = d * Math.sqrt(test === 'one' ? n : n / 2);
  const power  = Math.max(0, Math.min(1, Phi(lambda - za) + Phi(-lambda - za)));
  const nFor80 = test === 'one' ? Math.ceil(((za + 0.842) / d) ** 2) : Math.ceil(((za + 0.842) / d) ** 2 * 2);
  showOut('pow-out', [
    { label: 'Power (1−β)',     val: fmtN(power * 100),     unit: '%', cls: power >= 0.8 ? 'good' : power >= 0.6 ? 'warn' : 'bad' },
    { label: 'Type II error β', val: fmtN((1 - power) * 100), unit: '%' },
    { label: 'n for 80% power', val: test === 'two' ? `${nFor80} per group` : nFor80, unit: '', cls: 'good' },
    { label: 'Effect size', val: d < 0.2 ? 'Negligible' : d < 0.5 ? 'Small' : d < 0.8 ? 'Medium' : 'Large', unit: `(d=${fmtN(d)})` },
  ], 'Power<0.8: underpowered — high risk of missing a real effect. Power>0.9 preferred for clinical/regulatory studies.');
}

/* One-way ANOVA (up to 4 groups) */
function anovaCalc() {
  const parse  = id => (g(id).value || '').split(',').map(s => parseFloat(s.trim())).filter(isFinite);
  const groups = [parse('anova-g1'), parse('anova-g2'), parse('anova-g3'), parse('anova-g4')].filter(gr => gr.length >= 2);
  if (groups.length < 2) return errOut('anova-out', 'Enter data for ≥ 2 groups (each ≥ 2 values).');
  const k         = groups.length, N = groups.reduce((a, gr) => a + gr.length, 0);
  const grandMean = groups.flat().reduce((a, b) => a + b, 0) / N;
  const SSB       = groups.reduce((a, gr) => { const m = gr.reduce((s, x) => s + x, 0) / gr.length; return a + gr.length * (m - grandMean) ** 2; }, 0);
  const SSW       = groups.reduce((a, gr) => { const m = gr.reduce((s, x) => s + x, 0) / gr.length; return a + gr.reduce((s, x) => s + (x - m) ** 2, 0); }, 0);
  const dfB = k - 1, dfW = N - k, MSB = SSB / dfB, MSW = SSW / dfW, F = MSB / MSW;
  const chi2 = F * dfB;
  const zz   = (Math.cbrt(chi2 / dfB) - (1 - 2 / (9 * dfB))) / Math.sqrt(2 / (9 * dfB));
  const p    = Math.max(0, Math.min(1, zz > 0 ? 0.5 * Math.exp(-0.717 * zz - 0.416 * zz * zz) : 1 - 0.5 * Math.exp(0.717 * zz - 0.416 * zz * zz)));
  const eta2 = SSB / (SSB + SSW);
  showOut('anova-out', [
    { label: 'F statistic',          val: fmtN(F),            unit: '', cls: 'good' },
    { label: 'df between / within', val: `${dfB} / ${dfW}`,   unit: '' },
    { label: 'MS between / within', val: `${fmtN(MSB)} / ${fmtN(MSW)}`, unit: '' },
    { label: 'p-value (approx.)',   val: fmtN(p),             unit: '', cls: p < 0.05 ? 'warn' : 'good' },
    { label: 'Significant (α=0.05)?', val: p < 0.05 ? 'Yes — reject H₀ (groups differ)' : 'No — fail to reject H₀', unit: '' },
    { label: 'η² (effect size)',    val: fmtN(eta2),          unit: '', cls: eta2 > 0.14 ? 'warn' : '' },
    { label: 'N total / groups',    val: `${N} / ${k}`,       unit: '' },
  ], 'p<0.05: at least one group mean differs. η²: 0.01 small, 0.06 medium, 0.14 large. Run post-hoc Tukey for specific pairs.');
}
