/* ================================================================
   calcs-solid.js — Solid mechanics calculators
   Sections: elastic constants, stress/failure criteria,
             beam deflection, section properties, fracture,
             fatigue, torsion, pressure vessels, buckling.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the matching <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── §9a  Elastic constant converter ───────────────────────── */
/* Derives all isotropic constants from any two independent inputs. */
function elCalc() {
  const Ev  = v('el-E'), nuv = v('el-nu'), Gv = v('el-G'), Kv = v('el-K'), lamv = v('el-lam');
  const EU  = su('el-E-u'), GU = su('el-G-u'), KU = su('el-K-u'), lamU = su('el-lam-u');
  const have = {
    E:   !isNaN(Ev)   && Ev  > 0,
    nu:  !isNaN(nuv)  && nuv > -1 && nuv < 0.5,
    G:   !isNaN(Gv)   && Gv  > 0,
    K:   !isNaN(Kv)   && Kv  > 0,
    lam: !isNaN(lamv),
  };
  const Esi = have.E   ? Ev   * EU   : null;
  const Gsi = have.G   ? Gv   * GU   : null;
  const Ksi = have.K   ? Kv   * KU   : null;
  const lamsi = have.lam ? lamv * lamU : null;
  let E, nu, G, K, lam;
  if      (have.E  && have.nu) { E=Esi; nu=nuv; G=E/(2*(1+nu));    K=E/(3*(1-2*nu));        lam=E*nu/((1+nu)*(1-2*nu)); }
  else if (have.E  && have.G ) { E=Esi; G=Gsi;  nu=E/(2*G)-1;      K=E*G/(3*(3*G-E));       lam=G*(E-2*G)/(3*G-E); }
  else if (have.K  && have.G ) { K=Ksi; G=Gsi;  E=9*K*G/(3*K+G);   nu=(3*K-2*G)/(2*(3*K+G)); lam=K-2*G/3; }
  else if (have.E  && have.K ) { E=Esi; K=Ksi;  G=3*K*E/(9*K-E);   nu=(3*K-E)/(6*K);         lam=K-2*G/3; }
  else return errOut('el-out', 'Provide exactly two independent constants (E+ν recommended).');
  if (nu >= 0.5 || nu <= -1) return errOut('el-out', 'Poisson ratio out of physical range (−1 < ν < 0.5).');
  const M = lam + 2 * G;
  showOut('el-out', [
    { label: "Young's modulus E",  val: fmtN(E / 1e6),   unit: 'MPa', cls: 'good' },
    { label: "Poisson's ratio ν",  val: fmtN(nu),         unit: '',    cls: 'good' },
    { label: 'Shear modulus G',    val: fmtN(G / 1e6),   unit: 'MPa', cls: 'good' },
    { label: 'Bulk modulus K',     val: fmtN(K / 1e6),   unit: 'MPa', cls: 'good' },
    { label: "Lamé's λ",           val: fmtN(lam / 1e6), unit: 'MPa' },
    { label: 'P-wave modulus M',   val: fmtN(M / 1e6),   unit: 'MPa' },
    { label: 'G/E ratio',          val: fmtN(G / E),      unit: '(0.333 for ν=0)' },
  ], 'Valid isotropic linear elasticity: −1 < ν < 0.5. Incompressible material: ν→0.5 (rubber, soft tissue).');
}

/* ── §9b  Stress / failure criteria ────────────────────────── */
function vmCalc() {
  const Sy  = v('vm-Sy');
  const tab = document.querySelector('#vm-tabs .tab.active')?.textContent || '';
  let svm, tresca;
  if (tab.includes('2D')) {
    const sx  = v('vm-sx')  * su('vm-sx-u');
    const sy  = v('vm-sy')  * su('vm-sy-u');
    const txy = v('vm-txy') * su('vm-txy-u');
    svm    = Math.sqrt(sx * sx - sx * sy + sy * sy + 3 * txy * txy);
    const s1 = 0.5 * (sx + sy) + Math.sqrt(0.25 * (sx - sy) ** 2 + txy * txy);
    const s2 = 0.5 * (sx + sy) - Math.sqrt(0.25 * (sx - sy) ** 2 + txy * txy);
    tresca = Math.max(Math.abs(s1 - s2), Math.abs(s1), Math.abs(s2));
  } else {
    const s1 = v('vm-s1'), s2 = v('vm-s2'), s3 = v('vm-s3');
    svm    = Math.sqrt(0.5 * ((s1 - s2) ** 2 + (s2 - s3) ** 2 + (s1 - s3) ** 2));
    tresca = Math.max(Math.abs(s1 - s2), Math.abs(s2 - s3), Math.abs(s1 - s3));
  }
  const SF = Sy / svm;
  showOut('vm-out', [
    { label: 'Von Mises σ_vm', val: fmtN(svm),    unit: 'MPa', cls: 'good' },
    { label: 'Tresca σ_T',     val: fmtN(tresca), unit: 'MPa' },
    { label: 'Safety factor (VM)', val: fmtN(SF), unit: '', cls: SF < 1 ? 'bad' : SF < 2 ? 'warn' : 'good' },
    { label: 'Status', val: SF >= 1 ? `OK — ${fmtN(SF, 3)}× safety` : '⚠ YIELDING — SF < 1', unit: '', cls: SF < 1 ? 'bad' : 'good' },
  ], 'SF<1.0: material has yielded. SF 1.5–2.0: typical design margin. SF>4: over-designed. For fatigue use Goodman correction.');
}

function pvCalc() {
  const P  = v('pv-P')  * su('pv-P-u') / 1000;
  const ri = v('pv-ri') * su('pv-ri-u') / 1000;
  const ro = v('pv-ro') * su('pv-ro-u') / 1000;
  const Sy = v('pv-Sy');
  if ([P, ri, ro].some(x => !x || x <= 0) || ro <= ri) return errOut('pv-out', 'Check radii (r_o > r_i).');
  const t = ro - ri, tRatio = t / ri;
  let s_h, s_a;
  if (tRatio < 0.1) {
    s_h = P * ri / t;  s_a = P * ri / (2 * t);
  } else {
    const A = P * ri * ri / (ro * ro - ri * ri);
    const B = P * ri * ri * ro * ro / (ro * ro - ri * ri);
    s_h = A + B / (ri * ri);  s_a = A;
  }
  const svm = Math.sqrt(s_h * s_h - s_h * s_a + s_a * s_a);
  const SF  = Sy / svm;
  showOut('pv-out', [
    { label: 't/r_i (wall ratio)',        val: fmtN(tRatio), unit: '', cls: tRatio < 0.1 ? 'warn' : 'good' },
    { label: 'Wall classification',       val: tRatio < 0.1 ? 'Thin-wall' : 'Thick-wall (Lamé)', unit: '' },
    { label: 'Hoop stress σ_h (inner)',   val: fmtN(s_h),   unit: 'MPa', cls: 'good' },
    { label: 'Axial stress σ_a',          val: fmtN(s_a),   unit: 'MPa' },
    { label: 'Von Mises σ_vm',            val: fmtN(svm),   unit: 'MPa' },
    { label: 'Safety factor',             val: fmtN(SF),    unit: '', cls: SF < 1 ? 'bad' : SF < 2 ? 'warn' : 'good' },
  ], 'Thin-wall valid when t/r < 0.1. For t/r > 0.1 use Lamé thick-wall equations. ASME VIII: SF≥4 on UTS.');
}

/* ── §10a  Beam deflection and bending ─────────────────────── */
function bmCalc() {
  const F = v('bm-F') * su('bm-F-u'), L = v('bm-L') * su('bm-L-u');
  const E = v('bm-E') * su('bm-E-u'), I = v('bm-I') * su('bm-I-u');
  const c = v('bm-c') * su('bm-c-u');
  if ([F, L, E, I, c].some(x => !x || x <= 0)) return errOut('bm-out', 'All values required.');
  const tab = document.querySelector('#beam-tabs .tab.active')?.textContent || '';
  let delta, sigma;
  if      (tab.includes('Cantilever')) { delta = F * L ** 3 / (3 * E * I);      sigma = F * L * c / I; }
  else if (tab.includes('Simply'))     { delta = F * L ** 3 / (48 * E * I);     sigma = F * L * c / (4 * I); }
  else                                 { delta = 5 * F * L ** 3 / (384 * E * I); sigma = F * L * c / (8 * I); }
  showOut('bm-out', [
    { label: 'Max deflection δ', val: fmtN(delta * 1000), unit: 'mm',  cls: 'good' },
    { label: 'δ (m)',             val: fmtN(delta),         unit: 'm' },
    { label: 'δ/L ratio',         val: fmtN(delta / L),     unit: '(L/' + fmtN(L / delta, 3) + ')' },
    { label: 'Max bending stress σ', val: fmtN(sigma / 1e6), unit: 'MPa' },
  ], 'δ/L < 1/300 for stiffness-critical structures. σ must be below yield for elastic behaviour.');
}

/* Auto-solve: if load P is blank, back-calculate it from a target deflection. */
function bmAutoCalc(type) {
  const Praw = document.getElementById('bm-P-' + type);
  const dRaw = document.getElementById('bm-del-' + type);
  const E = v('bm-E-' + type) * su('bm-E-' + type + '-u');
  const L = v('bm-L-' + type) * su('bm-L-' + type + '-u');
  const I = v('bm-I-' + type) * su('bm-I-' + type + '-u');
  if (!Praw || !dRaw) { bmCalc(type); return; }
  if ((Praw.value === '' || Praw.value === null) && dRaw.value && E && L && I) {
    const delta = parseFloat(dRaw.value) * (su('bm-del-' + type + '-u') || 1);
    const coeff = type === 'cant' ? 3 : type === 'ss' ? 48 : 384 / 5;
    Praw.value = (delta * coeff * E * I / Math.pow(L, 3) / su('bm-P-' + type + '-u')).toPrecision(4);
  }
  bmCalc(type);
}

/* ── §10b  Section moment of area ──────────────────────────── */
function smaCalc() {
  const tab = document.querySelector('#sma-tabs .tab.active')?.textContent || '';
  let I, A, c;
  if (tab.includes('Rect')) {
    const b = v('sma-b') * su('sma-b-u'), h = v('sma-h') * su('sma-h-u');
    I = b * h ** 3 / 12;  A = b * h;  c = h / 2;
  } else if (tab.includes('Circle')) {
    const D = v('sma-D') * su('sma-D-u');
    I = Math.PI * D ** 4 / 64;  A = Math.PI * D * D / 4;  c = D / 2;
  } else {
    const Do = v('sma-Do') * su('sma-Do-u'), Di = v('sma-Di') * su('sma-Di-u');
    if (Di >= Do) return errOut('sma-out', 'D_i must be less than D_o.');
    I = Math.PI * (Do ** 4 - Di ** 4) / 64;  A = Math.PI * (Do * Do - Di * Di) / 4;  c = Do / 2;
  }
  showOut('sma-out', [
    { label: 'Second moment of area I', val: fmtN(I * 1e12), unit: 'mm⁴', cls: 'good' },
    { label: 'I (m⁴)',                  val: fmtN(I),         unit: 'm⁴' },
    { label: 'Cross-sectional area A',  val: fmtN(A * 1e6),  unit: 'mm²' },
    { label: 'Neutral axis c',          val: fmtN(c * 1000), unit: 'mm' },
    { label: 'Section modulus Z = I/c', val: fmtN(I / c * 1e9), unit: 'mm³' },
  ], 'Moving material away from the neutral axis (I-beam, hollow section) maximises I per unit weight.');
}

/* ── Fracture mechanics ─────────────────────────────────────── */
function fracCalc() {
  const sig = gv('frac-sig') * gu('frac-sig-u');
  const a   = gv('frac-a')   * gu('frac-a-u');
  const Y   = gv('frac-Y');
  const Kic = gv('frac-Kic');
  if (!sig || !a || !Y || !Kic) return;
  const KI   = Y * sig * Math.sqrt(Math.PI * a);
  const safe = KI < Kic;
  res('frac-body', [
    ['K_I',                KI.toFixed(3) + ' MPa√m',  'K_I = Y·σ·√(π·a)'],
    ['K_IC',               Kic + ' MPa√m',              'Material toughness'],
    ['Safety factor K_IC/K_I', (Kic / KI).toFixed(3),  ''],
    ['Critical crack a_cr',    ((Kic / (Y * sig)) ** 2 / Math.PI * 1000).toFixed(2) + ' mm', 'a_cr=(K_IC/(Y·σ))²/π'],
    ['Status',             safe ? '✓ SAFE' : '✗ FRACTURE PREDICTED', ''],
  ]);
}

/* ── Fatigue / Basquin ─────────────────────────────────────── */
function fatCalc() {
  const sa = gv('fat-sa') * gu('fat-sa-u');
  const sf = gv('fat-sf') * gu('fat-sf-u');
  const b  = gv('fat-b');
  const sm = gv('fat-sm') * gu('fat-sm-u');
  const Su = gv('fat-Su') * gu('fat-Su-u');
  if (!sa || !sf || !b || isNaN(sm)) return;
  const Nf             = 0.5 * Math.pow(sa / sf, 1 / b);
  const saGoodman      = sm > 0 ? sa / (1 - sm / Su) : null;
  const goodmanRatio   = sm > 0 ? saGoodman / sf       : null;
  res('fat-body', [
    ['Cycles to failure N_f', Nf > 1e9 ? '>1×10⁹ (infinite life)' : Nf.toExponential(3), "Basquin: N_f=0.5·(σ_a/σ_f′)^(1/b)"],
    ['Life in years (1 Hz)',   (Nf / 31536000).toFixed(2) + ' yr', ''],
    ...(sm > 0 ? [
      ['Goodman σ_a (corrected)', saGoodman.toFixed(1) + ' MPa',  'σ_a_eff = σ_a/(1−σ_m/S_u)'],
      ['Goodman ratio',           goodmanRatio.toFixed(3),          '<1 safe, >1 failure'],
    ] : []),
  ]);
}

/* ── Torsion — solid shaft ─────────────────────────────────── */
function torCalcSolid() {
  const T = gv('tors-T') * gu('tors-T-u'), d = gv('tors-d') * gu('tors-d-u');
  const L = gv('tors-L') * gu('tors-L-u'), G = gv('tors-G') * gu('tors-G-u');
  if (!T || !d || !L || !G) return;
  const J       = Math.PI * d ** 4 / 32;
  const tau_max = T * (d / 2) / J;
  const phi     = T * L / (G * J);
  res('tors-body', [
    ['Polar moment J',      J.toExponential(3) + ' m⁴',           'J = π·d⁴/32'],
    ['Max shear stress τ_max', (tau_max / 1e6).toFixed(2) + ' MPa', 'τ = T·r/J'],
    ['Angle of twist φ',   (phi * 180 / Math.PI).toFixed(4) + ' °', 'φ = T·L/(G·J)'],
    ['φ (radians)',         phi.toFixed(5) + ' rad',                 '—'],
  ]);
}

/* ── Torsion — hollow shaft ─────────────────────────────────── */
function torCalcHollow() {
  const T  = gv('torh-T')  * gu('torh-T-u');
  const do_ = gv('torh-do') * gu('torh-do-u');
  const di  = gv('torh-di') * gu('torh-di-u');
  const L  = gv('torh-L')  * gu('torh-L-u');
  const G  = gv('torh-G')  * gu('torh-G-u');
  if (!T || !do_ || !di || !L || !G || di >= do_) return;
  const J       = Math.PI * (do_ ** 4 - di ** 4) / 32;
  const tau_max = T * (do_ / 2) / J;
  const phi     = T * L / (G * J);
  res('torh-body', [
    ['Polar moment J',      J.toExponential(3) + ' m⁴',           'J = π(d_o⁴−d_i⁴)/32'],
    ['Max shear stress τ_max', (tau_max / 1e6).toFixed(2) + ' MPa', 'τ = T·(d_o/2)/J'],
    ['Angle of twist φ',   (phi * 180 / Math.PI).toFixed(4) + ' °', 'φ = T·L/(G·J)'],
  ]);
}

/* ── Thick-wall pressure vessel (Lamé) ─────────────────────── */
function pvCalcLame() {
  const p  = v('pv-p')   * gu('pv-p-u');
  const ri = gv('pv2-ri') * gu('pv2-ri-u');
  const ro = gv('pv2-ro') * gu('pv2-ro-u');
  if (!p || !ri || !ro || ro <= ri) return;
  const sig_th       = p * (ro * ro + ri * ri) / (ro * ro - ri * ri);
  const sig_r        = -p;
  const sig_th_outer = p * 2 * ri * ri / (ro * ro - ri * ri);
  const t            = ro - ri;
  res('pv2-body', [
    ['Wall thickness t',         (t * 1000).toFixed(2) + ' mm',                             ''],
    ['Hoop stress σ_θ (inner)',  (sig_th / 1e6).toFixed(2) + ' MPa',                        'Lamé, r=r_i'],
    ['Radial stress σ_r (inner)', (sig_r / 1e6).toFixed(2) + ' MPa',                        '= −p at inner wall'],
    ['Hoop stress σ_θ (outer)',  (sig_th_outer / 1e6).toFixed(2) + ' MPa',                  'Lamé, r=r_o'],
    ['Von Mises (inner)',        (Math.sqrt(sig_th ** 2 + sig_r ** 2 - sig_th * sig_r) / 1e6).toFixed(2) + ' MPa', '—'],
    ['Thin-wall check (t/r_i)',  (t / ri).toFixed(3), t / ri < 0.1 ? '< 0.1: thin-wall approx OK' : '≥ 0.1: use thick-wall (Lamé) — correct'],
  ]);
}

/* ── Euler column buckling ─────────────────────────────────── */
function buckleCalc() {
  const E  = gv('bk-E') * gu('bk-E-u');
  const I  = gv('bk-I') * gu('bk-I-u');
  const L  = gv('bk-L') * gu('bk-L-u');
  const K  = parseFloat(document.getElementById('bk-K').value);
  if (!E || !I || !L || !K) return;
  const Le  = K * L;
  const Pcr = Math.PI ** 2 * E * I / (Le * Le);
  res('bk-body', [
    ['Effective length K·L', Le.toFixed(3) + ' m',          ''],
    ['Critical (Euler) load P_cr', (Pcr / 1000).toFixed(2) + ' kN', 'P_cr = π²EI/(KL)²'],
    ['P_cr',                (Pcr / 1e6).toFixed(3) + ' MN', ''],
    ['Note', 'Euler buckling assumes elastic, slender column (λ > 100 typical)', ''],
  ]);
}
