/* ================================================================
   calcs-fluid.js — Core fluid mechanics calculators
   Sections: Y+, dimensionless numbers, turbulence BCs,
             boundary layer, pipe flow, non-Newtonian rheology,
             pulsatile flow / WSS / OSI, porous media, y-star.

   HOW TO ADD A NEW CARD:
     1. Write a calc function here (see existing functions for style).
     2. Add the card HTML to index.html in the appropriate <section>.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── §1  Y+ calculator ─────────────────────────────────────── */
function ypCalc() {
  const U   = v('yp-U')   * su('yp-U-u');
  const L   = v('yp-L')   * su('yp-L-u');
  const rho = v('yp-rho') * su('yp-rho-u');
  const mu  = v('yp-mu')  * su('yp-mu-u');
  const yp  = v('yp-yplus');
  if ([U, L, rho, mu, yp].some(x => !x || x <= 0)) return errOut('yp-out', 'All values must be positive.');
  const nu    = mu / rho;
  const Re    = rho * U * L / mu;
  const geom  = document.querySelector('#yp-tabs .tab.active')?.textContent || 'Pipe';
  let Cf;
  if      (geom.includes('Plate'))    Cf = 0.0592  * Math.pow(Re, -0.2);
  else if (geom.includes('External')) Cf = 0.074   * Math.pow(Re, -0.2);
  else                                Cf = 0.079   * Math.pow(Re, -0.25); // pipe
  const tau_w  = Cf * 0.5 * rho * U * U;
  const u_tau  = Math.sqrt(tau_w / rho);
  const dy     = yp * nu / u_tau;
  const regime = Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transitional' : 'Turbulent';
  showOut('yp-out', [
    { label: 'Reynolds number Re',    val: fmtN(Re, 5), unit: '' },
    { label: 'Flow regime',           val: regime,       unit: '', cls: Re < 2300 ? 'warn' : '' },
    { label: 'Skin friction Cƒ',      val: fmtN(Cf),     unit: '' },
    { label: 'Wall shear stress τ_w', val: fmtN(tau_w),  unit: 'Pa' },
    { label: 'Friction velocity u_τ', val: fmtN(u_tau),  unit: 'm/s' },
    { label: 'Δy (SI)',               val: fmtN(dy),      unit: 'm',  cls: 'good' },
    { label: 'Δy',                    val: fmtN(dy * 1000), unit: 'mm', cls: 'good' },
    { label: 'Δy',                    val: fmtN(dy * 1e6),  unit: 'μm' },
    { label: 'Verification y⁺',       val: fmtN(u_tau * dy / nu), unit: '' },
  ], 'Δy is the first cell wall distance. Recommended: y⁺≈1 for wall-resolving k-ω SST, y⁺≈30–300 for wall functions.');
}

/* ── §2  Dimensionless numbers ─────────────────────────────── */
function reCalc() {
  const U = v('re-U') * su('re-U-u'), L = v('re-L') * su('re-L-u');
  const rho = v('re-rho') * su('re-rho-u'), mu = v('re-mu') * su('re-mu-u');
  if ([U, L, rho, mu].some(x => !x || x <= 0)) return errOut('re-out', 'All values required.');
  const Re = rho * U * L / mu;
  const regime = Re < 2300 ? 'Laminar — Hagen-Poiseuille applies'
               : Re < 4000 ? 'Transitional — caution!'
               :              'Turbulent — use turbulence model';
  const cls = Re < 2300 ? 'good' : Re < 4000 ? 'warn' : '';
  showOut('re-out', [
    { label: 'Reynolds number',      val: fmtN(Re, 5), unit: '' },
    { label: 'Flow regime',          val: regime,       unit: '', cls },
    { label: 'Kinematic viscosity ν',val: fmtN(mu / rho), unit: 'm²/s' },
  ], 'Re<2300: laminar (Hagen-Poiseuille valid). Re>4000: turbulent (use k-ε or k-ω SST). Transition 2300–4000 is unpredictable.');
}

function maCalc() {
  const U = v('ma-U');
  const sel = g('ma-T-u');
  let T = v('ma-T');
  const opt = sel.options[sel.selectedIndex];
  if (opt.dataset.offset) T = T - (-parseFloat(opt.dataset.offset));
  else if (opt.dataset.scale) T = T * parseFloat(opt.dataset.scale) + parseFloat(opt.dataset.offset);
  const UmS = U * su('ma-U-u'), gam = v('ma-gamma');
  const R_air = 287, a = Math.sqrt(gam * R_air * T), Ma = UmS / a;
  const regime = Ma < 0.3 ? 'Incompressible (Ma<0.3)' : Ma < 0.8 ? 'Subsonic' : Ma < 1.2 ? 'Transonic' : 'Supersonic / Hypersonic';
  showOut('ma-out', [
    { label: 'Speed of sound a', val: fmtN(a),  unit: 'm/s' },
    { label: 'Mach number Ma',   val: fmtN(Ma), unit: '', cls: Ma < 0.3 ? 'good' : Ma > 1 ? 'bad' : 'warn' },
    { label: 'Regime',           val: regime,   unit: '' },
  ], 'For Ma<0.3 compressibility effects <1% — incompressible CFD is valid.');
}

function stCalc() {
  const f = v('st-f') * su('st-f-u'), L = v('st-L') * su('st-L-u'), U = v('st-U') * su('st-U-u');
  if ([f, L, U].some(x => !x || x <= 0)) return errOut('st-out', 'All values required.');
  const St = f * L / U;
  showOut('st-out', [
    { label: 'Strouhal number St',  val: fmtN(St),    unit: '' },
    { label: 'Period T',            val: fmtN(1 / f),  unit: 's' },
    { label: 'Convection time L/U', val: fmtN(L / U),  unit: 's' },
  ], 'St≈0.2 for vortex shedding from a cylinder (100<Re<100000).');
}

function deCalc() {
  const Re = v('de-Re'), r = v('de-r') * su('de-r-u'), R = v('de-R') * su('de-R-u');
  if ([Re, r, R].some(x => !x || x <= 0)) return errOut('de-out', 'All values required.');
  const De = Re * Math.sqrt(r / R);
  const regime = De < 36 ? 'No secondary vortices' : De < 64 ? 'Weak Dean vortices' : 'Strong Dean vortices (4-vortex pattern)';
  showOut('de-out', [
    { label: 'Dean number De',      val: fmtN(De),   unit: '', cls: De > 36 ? 'warn' : 'good' },
    { label: 'Curvature ratio r/R', val: fmtN(r / R), unit: '' },
    { label: 'Secondary flow',      val: regime,      unit: '' },
  ], 'De<36: no secondary vortices. De 36–64: weak Dean vortices. De>64: strong 4-vortex pattern.');
}

function peCalc() {
  const U = v('pe-U') * su('pe-U-u'), L = v('pe-L') * su('pe-L-u'), D = v('pe-D') * su('pe-D-u');
  if ([U, L, D].some(x => !x || x <= 0)) return errOut('pe-out', 'All values required.');
  const Pe = U * L / D;
  showOut('pe-out', [
    { label: 'Péclet number Pe',    val: fmtN(Pe),          unit: '' },
    { label: 'Diffusion time L²/D', val: fmtN(L * L / D),   unit: 's' },
    { label: 'Convection time L/U', val: fmtN(L / U),        unit: 's' },
    { label: 'Dominant transport',  val: Pe > 1 ? 'Advection dominated' : 'Diffusion dominated', unit: '' },
  ], 'Pe>>1: convection dominates. Pe<<1: diffusion dominates. Pe≈1: balanced — upwind schemes may introduce artificial diffusion.');
}

/* ── §3  Turbulence boundary conditions ────────────────────── */
function tbCalc() {
  const U = v('tb-U') * su('tb-U-u'), I = v('tb-I') / 100;
  const l = v('tb-l') * su('tb-l-u'), nu = v('tb-nu') * su('tb-nu-u');
  if ([U, I, l, nu].some(x => !x || x <= 0)) return errOut('tb-out', 'All values required.');
  const Cmu = 0.09;
  const k   = 1.5 * Math.pow(U * I, 2);
  const eps = Math.pow(Cmu, 0.75) * Math.pow(k, 1.5) / l;
  const om  = Math.sqrt(k) / (Math.pow(Cmu, 0.25) * l);
  const nut = k / om;
  showOut('tb-out', [
    { label: 'TKE k',                val: fmtN(k),        unit: 'm²/s²', cls: 'good' },
    { label: 'Dissipation ε',        val: fmtN(eps),      unit: 'm²/s³', cls: 'good' },
    { label: 'Spec. dissipation ω',  val: fmtN(om),       unit: '1/s',   cls: 'good' },
    { label: 'Eddy viscosity νₜ',    val: fmtN(nut),      unit: 'm²/s',  cls: 'good' },
    { label: 'Viscosity ratio νₜ/ν', val: fmtN(nut / nu), unit: '' },
    { label: 'Turbulent Re_t',       val: fmtN(k * k / (nu * eps)), unit: '' },
  ], 'Use k & ε for k-ε solvers. Use k & ω for k-ω SST (ANSYS Fluent, OpenFOAM). νₜ for Spalart-Allmaras.');
}

function tiCalc() {
  const Re = v('ti-Re');
  if (!Re || Re <= 0) return errOut('ti-out', 'Enter Reynolds number.');
  const Ipipe = 0.16 * Math.pow(Re, -1 / 8) * 100;
  const Ibl   = 0.4  / Math.log(Re)          * 100;
  showOut('ti-out', [
    { label: 'Intensity I (pipe, fully developed)', val: fmtN(Ipipe) + '%', unit: '' },
    { label: 'Intensity I (flat plate BL, approx)', val: fmtN(Ibl)   + '%', unit: '' },
    { label: 'Typical free-stream',                 val: '0.1 – 1 %',        unit: '(wind tunnel/clin. inlet)' },
  ], 'Higher I = more turbulent mixing. Use measured values when available.');
}

function lsCalc() {
  const fac = parseFloat(g('ls-type').value);
  const L   = v('ls-L') * su('ls-L-u');
  if (!L || L <= 0) return errOut('ls-out', 'Enter dimension.');
  const ls = fac * L;
  showOut('ls-out', [
    { label: 'Length scale ℓ',  val: fmtN(ls),        unit: 'm' },
    { label: 'ℓ (mm)',           val: fmtN(ls * 1000), unit: 'mm' },
  ], 'The turbulent length scale sets the size of energy-containing eddies. Multiply by 1/κ≈0.41 for mixing length.');
}

/* ── §4  Boundary layer ────────────────────────────────────── */
function blCalc() {
  const x  = v('bl-x')  * su('bl-x-u');
  const U  = v('bl-U')  * su('bl-U-u');
  const nu = v('bl-nu') * su('bl-nu-u');
  if ([x, U, nu].some(n => !n || n <= 0)) return errOut('bl-out', 'All values required.');
  const Rex = U * x / nu;
  const lam = Rex < 5e5;
  let rows;
  if (lam) {
    const d = 5 * x / Math.sqrt(Rex), ds = 1.72 * x / Math.sqrt(Rex);
    const th = 0.664 * x / Math.sqrt(Rex), Cf = 0.664 / Math.sqrt(Rex);
    rows = [
      { label: 'Re_x',                     val: fmtN(Rex, 4),    unit: '', cls: 'good' },
      { label: 'Regime',                    val: 'Laminar (Blasius)', unit: '' },
      { label: 'δ (99% thickness)',         val: fmtN(d  * 1000), unit: 'mm' },
      { label: 'δ* (displacement)',         val: fmtN(ds * 1000), unit: 'mm' },
      { label: 'θ (momentum)',              val: fmtN(th * 1000), unit: 'mm' },
      { label: 'Cƒ (local skin friction)',  val: fmtN(Cf),        unit: '' },
      { label: 'H = δ*/θ (shape factor)',   val: fmtN(ds / th),   unit: '' },
    ];
  } else {
    const d = 0.37 * x / Math.pow(Rex, 0.2), Cf = 0.0592 / Math.pow(Rex, 0.2);
    rows = [
      { label: 'Re_x',                    val: fmtN(Rex, 4),    unit: '', cls: 'warn' },
      { label: 'Regime',                   val: 'Turbulent (Schlichting)', unit: '' },
      { label: 'δ (99% thickness)',        val: fmtN(d  * 1000), unit: 'mm' },
      { label: 'δ* (approx)',              val: fmtN(d / 8 * 1000), unit: 'mm' },
      { label: 'Cƒ (local)',               val: fmtN(Cf),        unit: '' },
    ];
  }
  showOut('bl-out', rows, 'Transition typically occurs at Re_x ≈ 5×10⁵. Blasius solution is exact for laminar flat plate.');
}

function leCalc() {
  const D  = v('le-D')  * su('le-D-u');
  const Re = v('le-Re'), Pr = v('le-Pr');
  if ([D, Re].some(n => !n || n <= 0)) return errOut('le-out', 'D and Re required.');
  const lam  = Re < 2300;
  const Lhyd = lam ? 0.06 * Re * D : 4.4 * Math.pow(Re, 1 / 6) * D;
  const Lth  = 0.05 * Re * Pr * D;
  showOut('le-out', [
    { label: 'Regime',              val: lam ? 'Laminar' : 'Turbulent', unit: '' },
    { label: 'Hydrodynamic entry L_e', val: fmtN(Lhyd),      unit: 'm' },
    { label: 'L_e / D',               val: fmtN(Lhyd / D),  unit: '' },
    ...(Pr ? [{ label: 'Thermal entry L_t (lam.)', val: fmtN(Lth),     unit: 'm' },
               { label: 'L_t / D',                val: fmtN(Lth / D), unit: '' }] : []),
  ], 'Ensure pipe is longer than L_e for fully-developed flow assumption in simulations.');
}

/* ── §5  Pipe flow ─────────────────────────────────────────── */
function hpCalc() {
  const R  = v('hp-R')  * su('hp-R-u');
  const L  = v('hp-L')  * su('hp-L-u');
  const mu = v('hp-mu') * su('hp-mu-u');
  const tab = document.querySelector('#hp-tabs .tab.active')?.textContent || '';
  let Q, dP, U, tau;
  if (tab.includes('ΔP')) {
    dP  = v('hp-dP') * su('hp-dP-u');
    Q   = Math.PI * Math.pow(R, 4) * dP / (8 * mu * L);
    U   = R * R * dP / (4 * mu * L);
    tau = R * dP / (2 * L);
  } else {
    Q   = v('hp-Q') * su('hp-Q-u');
    dP  = 8 * mu * L * Q / (Math.PI * Math.pow(R, 4));
    U   = Q / (Math.PI * R * R);
    tau = 4 * mu * U / R;
  }
  if (Q <= 0 || dP <= 0) return errOut('hp-out', 'Check inputs.');
  const Re2 = 2 * 1060 * U * R / mu;
  showOut('hp-out', [
    { label: 'Flow rate Q',           val: fmtN(Q * 1e6),        unit: 'mL/s' },
    { label: 'Q',                     val: fmtN(Q),               unit: 'm³/s' },
    { label: 'Mean velocity U',       val: fmtN(U),               unit: 'm/s' },
    { label: 'Pressure drop ΔP',      val: fmtN(dP),              unit: 'Pa' },
    { label: 'ΔP',                    val: fmtN(dP / 133.322),    unit: 'mmHg' },
    { label: 'Wall shear stress τ_w', val: fmtN(tau),             unit: 'Pa' },
    { label: 'Re (blood density est.)',val: fmtN(Re2),             unit: '', cls: Re2 < 2300 ? 'good' : 'bad' },
    { label: 'Max velocity (centre)', val: fmtN(2 * U),           unit: 'm/s' },
  ], 'Hagen-Poiseuille assumes laminar, steady, Newtonian, fully-developed flow. Verify Re < 2300.');
}

function dwCalc() {
  const U   = v('dw-U')   * su('dw-U-u');
  const D   = v('dw-D')   * su('dw-D-u');
  const L   = v('dw-L')   * su('dw-L-u');
  const rho = v('dw-rho') * su('dw-rho-u');
  const mu  = v('dw-mu')  * su('dw-mu-u');
  const eps = v('dw-eps') * su('dw-eps-u');
  if ([U, D, L, rho, mu].some(x => !x || x <= 0)) return errOut('dw-out', 'All values required.');
  const Re = rho * U * D / mu;
  let f;
  if (Re < 2300) {
    f = 64 / Re;
  } else {
    f = 0.02;
    for (let i = 0; i < 50; i++) {
      const rhs = -2 * Math.log10(eps / (3.7 * D) + 2.51 / (Re * Math.sqrt(f)));
      f = 1 / (rhs * rhs);
    }
  }
  const dP = f * (L / D) * 0.5 * rho * U * U;
  const hf  = f * (L / D) * U * U / (2 * 9.81);
  showOut('dw-out', [
    { label: 'Reynolds number Re', val: fmtN(Re),             unit: '' },
    { label: 'Friction factor f',  val: fmtN(f),              unit: '' },
    { label: 'Pressure drop ΔP',   val: fmtN(dP),             unit: 'Pa' },
    { label: 'ΔP',                 val: fmtN(dP / 1000),      unit: 'kPa' },
    { label: 'ΔP',                 val: fmtN(dP / 133.322),   unit: 'mmHg' },
    { label: 'Head loss h_f',       val: fmtN(hf),             unit: 'm' },
    { label: 'Dynamic pressure',   val: fmtN(0.5 * rho * U * U), unit: 'Pa' },
  ], 'Colebrook-White solved iteratively for turbulent regime. For smooth pipes (ε=0) approaches Blasius correlation.');
}

function dhCalc() {
  const tab = document.querySelector('#dh-tabs .tab.active')?.textContent || '';
  if (tab.includes('Rect')) {
    const w = v('dh-w') * su('dh-w-u'), h = v('dh-h') * su('dh-h-u');
    const A = w * h, P = 2 * (w + h), Dh = 4 * A / P;
    showOut('dh-out', [
      { label: 'Hydraulic diameter D_h', val: fmtN(Dh * 1000), unit: 'mm' },
      { label: 'D_h (m)',                 val: fmtN(Dh),         unit: 'm' },
      { label: 'Area A',                 val: fmtN(A * 1e6),    unit: 'mm²' },
      { label: 'Wetted perimeter P',     val: fmtN(P * 1000),   unit: 'mm' },
      { label: 'Aspect ratio w/h',       val: fmtN(w / h),      unit: '' },
    ], 'D_h = 4A/P_wetted. Use D_h in Re, Darcy-Weisbach, and Nu correlations. Aspect ratio>4 reduces heat transfer.');
  } else if (tab.includes('Annul')) {
    const Do = v('dh-Do') * su('dh-Do-u'), Di = v('dh-Di') * su('dh-Di-u');
    const Dh = Do - Di;
    showOut('dh-out', [
      { label: 'Hydraulic diameter D_h', val: fmtN(Dh * 1000), unit: 'mm' },
      { label: 'D_h = D_o − D_i',       val: fmtN(Dh),         unit: 'm' },
    ], 'D_h = 4A/P_wetted = D_o − D_i for annulus.');
  } else {
    const b = v('dh-b') * su('dh-b-u'), h = v('dh-ht') * su('dh-ht-u');
    const hyp = Math.sqrt(b * b / 4 + h * h);
    const A = 0.5 * b * h, P = b + 2 * hyp, Dh = 4 * A / P;
    showOut('dh-out', [
      { label: 'Hydraulic diameter D_h', val: fmtN(Dh * 1000), unit: 'mm' },
      { label: 'Area A',                 val: fmtN(A * 1e6),    unit: 'mm²' },
      { label: 'Perimeter P',            val: fmtN(P * 1000),   unit: 'mm' },
    ], 'D_h = 4A/P_wetted. Correlations based on D_h are approximate — accuracy improves for shapes closer to circular.');
  }
}

/* ── §6  Non-Newtonian rheology ────────────────────────────── */
function plCalc() {
  const K = v('pl-K'), n = v('pl-n'), gd = v('pl-gd');
  if ([K, n, gd].some(x => isNaN(x) || x <= 0)) return errOut('pl-out', 'All values required.');
  const mu  = K * Math.pow(gd, n - 1);
  const tau = K * Math.pow(gd, n);
  showOut('pl-out', [
    { label: 'Eff. viscosity μ_eff', val: fmtN(mu * 1000), unit: 'mPa·s' },
    { label: 'μ_eff (Pa·s)',          val: fmtN(mu),         unit: 'Pa·s' },
    { label: 'Shear stress τ',        val: fmtN(tau),        unit: 'Pa' },
    { label: 'Behaviour',             val: n < 0.99 ? 'Shear-thinning' : n > 1.01 ? 'Shear-thickening' : 'Newtonian', unit: '' },
  ], 'Power Law diverges as γ̇→0. Use Carreau model for low-shear regions. Valid range for blood: γ̇=1–1000 s⁻¹.');
}

function caCalc() {
  const mu0  = v('ca-mu0')  * su('ca-mu0-u');
  const muinf= v('ca-muinf')* su('ca-muinf-u');
  const lam  = v('ca-lam'), n = v('ca-n'), gd = v('ca-gd');
  if ([mu0, muinf, lam, n, gd].some(x => isNaN(x) || x <= 0)) return errOut('ca-out', 'All values required.');
  const mu   = muinf + (mu0 - muinf) * Math.pow(1 + Math.pow(lam * gd, 2), (n - 1) / 2);
  const tau  = mu * gd;
  const muN  = 0.0035;
  showOut('ca-out', [
    { label: 'Eff. viscosity μ_eff',        val: fmtN(mu * 1000), unit: 'mPa·s', cls: 'good' },
    { label: 'μ_eff (Pa·s)',                 val: fmtN(mu),         unit: 'Pa·s' },
    { label: 'Shear stress τ',               val: fmtN(tau),        unit: 'Pa' },
    { label: 'vs Newtonian (3.5 mPa·s)',     val: fmtN((mu / muN - 1) * 100) + '%', unit: 'difference', cls: Math.abs(mu - muN) / muN > 0.05 ? 'warn' : 'good' },
    { label: 'Low-shear region?',            val: gd < 100 ? '⚠ Yes — non-Newtonian significant' : 'OK — Newtonian valid', unit: '', cls: gd < 100 ? 'warn' : 'good' },
  ], 'Cho & Kensey (1991) blood parameters. At γ̇ > 100 s⁻¹ Carreau converges to ≈3.5 mPa·s.');
}

function nvCalc() {
  const U = v('nv-U') * su('nv-U-u'), R = v('nv-R') * su('nv-R-u');
  if ([U, R].some(x => !x || x <= 0)) return errOut('nv-out', 'All values required.');
  const gdMean = 4 * U / R;
  const cls    = gdMean < 100 ? 'bad' : gdMean < 500 ? 'warn' : 'good';
  showOut('nv-out', [
    { label: 'Mean wall shear rate γ̇_w', val: fmtN(gdMean), unit: 's⁻¹', cls },
    { label: 'Newtonian valid?',         val: gdMean >= 100 ? '✓ Yes (γ̇ > 100 s⁻¹)' : '⚠ No — use Carreau/Quemada', unit: '', cls },
    { label: 'Recommendation',          val: gdMean < 100 ? 'Use non-Newtonian model' : 'Newtonian blood acceptable', unit: '' },
  ], 'Blood behaves non-Newtonian below ~100 s⁻¹.');
}

/* ── §7  Pulsatile flow / WSS / OSI ────────────────────────── */
function woCalc() {
  const R  = v('wo-R')  * su('wo-R-u');
  const f  = v('wo-f')  * su('wo-f-u');
  const nu = v('wo-nu') * su('wo-nu-u');
  if ([R, f, nu].some(x => !x || x <= 0)) return errOut('wo-out', 'All values required.');
  const omega  = 2 * Math.PI * f;
  const alpha  = R * Math.sqrt(omega / nu);
  const regime = alpha < 2 ? 'Quasi-steady — Poiseuille profile applies'
               : alpha < 10 ? 'Transitional pulsatile'
               :               'Inertia-dominated — plug-like profile';
  showOut('wo-out', [
    { label: 'Womersley number α', val: fmtN(alpha),                          unit: '', cls: alpha > 2 ? 'warn' : 'good' },
    { label: 'Angular frequency ω', val: fmtN(omega),                          unit: 'rad/s' },
    { label: 'Flow regime',         val: regime,                               unit: '' },
    { label: 'Oscillatory BL δ',   val: fmtN(Math.sqrt(2 * nu / omega) * 1000), unit: 'mm' },
  ], 'Reference: Aorta α≈12–22, Coronary α≈3–6, Cerebral artery α≈2–5, Capillary α≪1.');
}

function wssCalc() {
  const R  = v('wss-R')  * su('wss-R-u');
  const mu = v('wss-mu') * su('wss-mu-u');
  const tab = document.querySelector('#wss-tabs .tab.active')?.textContent || '';
  let tau, gd, Q2;
  if (tab.includes('Flow')) {
    const Q = v('wss-Qval') * su('wss-Qval-u');
    tau = 4 * mu * Q / (Math.PI * Math.pow(R, 3));
    gd  = 4 * Q / (Math.PI * Math.pow(R, 3));
    Q2  = Q;
  } else {
    const dP = v('wss-dPval') * su('wss-dPval-u'), L = v('wss-L') * su('wss-L-u');
    tau = R * dP / (2 * L);
    gd  = tau / mu;
    Q2  = Math.PI * Math.pow(R, 4) * dP / (8 * mu * L);
  }
  const Umean = Q2 / (Math.PI * R * R);
  showOut('wss-out', [
    { label: 'Wall shear stress τ_w',        val: fmtN(tau),   unit: 'Pa', cls: 'good' },
    { label: 'Wall shear rate γ̇_w',          val: fmtN(gd),    unit: 's⁻¹' },
    { label: 'Mean velocity U',               val: fmtN(Umean), unit: 'm/s' },
    { label: 'Physiological range (artery)',  val: '0.5 – 4 Pa (1–10 Pa coronary)', unit: '' },
    { label: 'WSS status',                   val: tau < 0.4 ? 'Low WSS — atherogenic risk' : tau > 10 ? 'High WSS — stenosis/calcification' : 'Normal range', unit: '', cls: tau < 0.4 ? 'bad' : tau > 10 ? 'warn' : 'good' },
  ], 'Low WSS (<0.5 Pa) correlates with plaque development. High WSS (>10 Pa) associated with vulnerable plaque.');
}

function osiCalc() {
  const raw = g('osi-data').value.trim();
  if (!raw) return errOut('osi-out', 'Enter WSS time series data.');
  const vals = raw.split(/[\s,]+/).map(Number).filter(x => !isNaN(x));
  if (vals.length < 3) return errOut('osi-out', 'Need at least 3 data points.');
  const intTau    = vals.reduce((a, b) => a + b, 0);
  const intAbsTau = vals.reduce((a, b) => a + Math.abs(b), 0);
  const OSI   = 0.5 * (1 - Math.abs(intTau) / intAbsTau);
  const TAWSS = intAbsTau / vals.length;
  showOut('osi-out', [
    { label: 'TAWSS (time-averaged |τ|)', val: fmtN(TAWSS),                          unit: 'Pa', cls: 'good' },
    { label: 'OSI',                       val: fmtN(OSI, 4),                         unit: '', cls: OSI > 0.2 ? 'bad' : OSI > 0.1 ? 'warn' : 'good' },
    { label: 'OSI interpretation',        val: OSI > 0.3 ? '⚠ Highly oscillatory — pro-calcific' : OSI > 0.1 ? 'Moderate oscillation' : 'Predominantly unidirectional', unit: '' },
    { label: '|τ|_max',                   val: fmtN(Math.max(...vals.map(Math.abs))), unit: 'Pa' },
    { label: 'Cycle integral ∫τ dt',      val: fmtN(intTau),                         unit: 'Pa' },
    { label: 'N data points',             val: vals.length,                           unit: '' },
  ], 'OSI→0: unidirectional flow. OSI→0.5: fully reversing flow. OSI>0.2 marks pro-atherosclerotic regions.');
}

/* ── §8  Porous media ──────────────────────────────────────── */
function pmCalc() {
  const tab  = document.querySelector('#pm-tabs .tab.active')?.textContent || '';
  const useKC = tab.includes('Kozeny');
  const dP   = v('pm-dP') * su('pm-dP-u');
  const L    = v('pm-L')  * su('pm-L-u');
  const mu   = v('pm-mu') * su('pm-mu-u');
  const rho  = v('pm-rho')* su('pm-rho-u');
  if ([dP, L, mu, rho].some(x => !x || x <= 0)) return errOut('pm-out', 'ΔP, L, μ and ρ must be positive.');
  let k, dp;
  if (useKC) {
    const eps = v('pm-eps');
    dp = v('pm-dp') * su('pm-dp-u');
    if (!eps || eps <= 0 || eps >= 1) return errOut('pm-out', 'Porosity ε must be between 0 and 1.');
    if (!dp || dp <= 0) return errOut('pm-out', 'Particle diameter d_p must be positive.');
    k = Math.pow(eps, 3) * dp * dp / (180 * Math.pow(1 - eps, 2));
    const u   = k / mu * dP / L;
    const Rep = rho * u * dp / mu;
    showOut('pm-out', [
      { label: 'Permeability k (K-C)',      val: fmtSci(k),            unit: 'm²',   cls: 'good' },
      { label: 'k',                          val: fmtSci(k / 9.869e-13), unit: 'darcy' },
      { label: 'Superficial velocity u',    val: fmtSci(u),            unit: 'm/s',  cls: 'good' },
      { label: 'u',                          val: fmtSci(u * 1e3),      unit: 'mm/s' },
      { label: 'u',                          val: fmtSci(u * 1e6),      unit: 'μm/s' },
      { label: 'Pore Re Re_p',              val: fmtSci(Rep, 3),       unit: '', cls: Rep < 1 ? 'good' : Rep < 10 ? 'warn' : 'bad' },
      { label: 'Darcy law valid?',          val: Rep < 1 ? '✓ Yes (Re_p < 1)' : Rep < 10 ? '⚠ Marginal' : '✗ No — use Forchheimer', unit: '', cls: Rep < 1 ? 'good' : Rep < 10 ? 'warn' : 'bad' },
      { label: 'Interstitial velocity u/ε', val: fmtSci(u / eps),      unit: 'm/s' },
    ], 'Kozeny–Carman: k = ε³d_p²/[180(1−ε)²]. Darcy valid when Re_p ≪ 1.');
  } else {
    k = v('pm-k-direct') * su('pm-k-direct-u');
    if (!k || k <= 0) return errOut('pm-out', 'Enter a valid permeability k > 0.');
    const u = k / mu * dP / L;
    showOut('pm-out', [
      { label: 'Permeability k (input)',  val: fmtSci(k),            unit: 'm²',  cls: 'good' },
      { label: 'k',                        val: fmtSci(k / 9.869e-13), unit: 'darcy' },
      { label: 'Superficial velocity u', val: fmtSci(u),            unit: 'm/s', cls: 'good' },
      { label: 'u',                        val: fmtSci(u * 1e3),      unit: 'mm/s' },
      { label: 'u',                        val: fmtSci(u * 1e6),      unit: 'μm/s' },
      { label: 'Volume flux (= u)',       val: fmtSci(u),            unit: 'm³/(m²·s)' },
    ], 'Superficial (Darcy) velocity = volume flux per unit cross-section. Actual interstitial velocity ≈ u/ε.');
  }
}

function fchCalc() {
  const tab   = document.querySelector('#fch-tabs .tab.active')?.textContent || '';
  const useKC = tab.includes('Kozeny');
  const u     = v('fch-u')   * su('fch-u-u');
  const mu    = v('fch-mu')  * su('fch-mu-u');
  const rho   = v('fch-rho') * su('fch-rho-u');
  if ([u, mu, rho].some(x => !x || x <= 0)) return errOut('fch-out', 'Velocity, viscosity, and density must be positive.');
  let k, beta;
  if (useKC) {
    const eps = v('fch-eps'), dp = v('fch-dp') * su('fch-dp-u');
    if (!eps || eps <= 0 || eps >= 1) return errOut('fch-out', 'Porosity ε must be between 0 and 1.');
    if (!dp || dp <= 0) return errOut('fch-out', 'Particle diameter d_p must be positive.');
    k    = Math.pow(eps, 3) * dp * dp / (180 * Math.pow(1 - eps, 2));
    beta = 1.75 * (1 - eps) / (Math.pow(eps, 3) * dp);
  } else {
    k    = v('fch-k') * su('fch-k-u');
    beta = parseFloat(document.getElementById('fch-beta').value);
    if (!k || k <= 0) return errOut('fch-out', 'Enter valid permeability k > 0.');
    if (isNaN(beta) || beta < 0) return errOut('fch-out', 'Enter valid Forchheimer β ≥ 0.');
  }
  const viscTerm  = mu / k * u;
  const inertTerm = beta * rho * u * u;
  const total     = viscTerm + inertTerm;
  const inertPct  = inertTerm / total * 100;
  showOut('fch-out', [
    { label: 'Permeability k',           val: fmtSci(k),          unit: 'm²' },
    { label: 'Forchheimer β',            val: fmtSci(beta),       unit: 'm⁻¹' },
    { label: 'Viscous term μ/k · u',    val: fmtSci(viscTerm),   unit: 'Pa/m',  cls: 'good' },
    { label: 'Inertial term β·ρ·u²',   val: fmtSci(inertTerm),  unit: 'Pa/m',  cls: inertPct > 15 ? 'warn' : 'good' },
    { label: 'Total ΔP/L',              val: fmtSci(total),      unit: 'Pa/m',  cls: 'good' },
    { label: 'Inertial contribution',   val: fmtSci(inertPct, 3),unit: '%',     cls: inertPct < 5 ? 'good' : inertPct < 20 ? 'warn' : 'bad' },
    { label: 'Plain Darcy sufficient?', val: inertPct < 5 ? '✓ Yes — inertial < 5%' : inertPct < 20 ? '⚠ Borderline' : '✗ No — Forchheimer required', unit: '', cls: inertPct < 5 ? 'good' : inertPct < 20 ? 'warn' : 'bad' },
  ], 'Ergun: β = 1.75(1−ε)/(ε³d_p). For slow biomedical filtration (μm/s–mm/s) the inertial term is typically < 1%.');
}

/* ── Y+ achieved from mesh parameters ────────────────────── */
function ypaCalc() {
  const dy1 = v('ypa-dy')  * su('ypa-dy-u');
  const gr  = v('ypa-gr');
  const N   = Math.max(1, Math.round(v('ypa-N')));
  const rho = v('ypa-rho') * su('ypa-rho-u');
  const mu  = v('ypa-mu')  * su('ypa-mu-u');
  if (!dy1 || dy1 <= 0 || !rho || rho <= 0 || !mu || mu <= 0 || isNaN(gr) || gr < 1)
    return errOut('ypa-out', 'All values must be positive; growth rate ≥ 1.');

  const geomTab = document.querySelector('#ypa-tabs .tab.active')?.textContent?.trim() || 'Pipe';
  const nu = mu / rho;
  let U, L, Cf, geomLabel, charVelLabel;

  if (geomTab.includes('Channel')) {
    U = v('ypa-U-sq') * su('ypa-U-sq-u');
    const W = v('ypa-W') * su('ypa-W-u');
    const H = v('ypa-H') * su('ypa-H-u');
    if (!U || U <= 0 || !W || W <= 0 || !H || H <= 0)
      return errOut('ypa-out', 'Velocity, width, and height must be positive.');
    L = 4 * W * H / (2 * (W + H));
    const ReC = rho * U * L / mu;
    Cf = ReC < 2300 ? 16 / ReC : 0.079 * Math.pow(ReC, -0.25);
    geomLabel = 'Square/rect. channel (D_h = ' + fmtN(L * 1000, 4) + ' mm)';
    charVelLabel = 'Mean velocity U';

  } else if (geomTab.includes('Orbital')) {
    const rpm   = v('ypa-rpm');
    const r_orb = v('ypa-rorb') * su('ypa-rorb-u');
    const D_v   = v('ypa-Dv')   * su('ypa-Dv-u');
    const h0    = v('ypa-h0')   * su('ypa-h0-u');
    const refl  = g('ypa-refl').value;
    if (!rpm || rpm <= 0 || !r_orb || r_orb <= 0 || !D_v || D_v <= 0)
      return errOut('ypa-out', 'RPM, orbital radius, and vessel diameter must be positive.');
    if (refl === 'h0' && (!h0 || h0 <= 0))
      return errOut('ypa-out', 'Fluid height h₀ must be positive when selected as reference length.');
    const omega = 2 * Math.PI * rpm / 60;
    U = omega * r_orb;
    L = refl === 'h0' ? h0 : D_v;
    const ReO = rho * U * L / mu;
    Cf = ReO < 5e5 ? 0.664 * Math.pow(ReO, -0.5) : 0.0592 * Math.pow(ReO, -0.2);
    const reflLabel = refl === 'h0'
      ? 'h₀ = ' + fmtN(h0  * 1000, 4) + ' mm'
      : 'D = '  + fmtN(D_v * 1000, 4) + ' mm';
    geomLabel = 'Orbital shaker (' + fmtN(rpm, 4) + ' RPM, L_Re = ' + reflLabel + ')';
    charVelLabel = 'Orbital tip speed ω·r_orb';

  } else {
    U = v('ypa-U') * su('ypa-U-u');
    L = v('ypa-D') * su('ypa-D-u');
    if (!U || U <= 0 || !L || L <= 0)
      return errOut('ypa-out', 'Velocity and diameter must be positive.');
    const ReP = rho * U * L / mu;
    Cf = ReP < 2300 ? 16 / ReP : 0.079 * Math.pow(ReP, -0.25);
    geomLabel = 'Pipe (D = ' + fmtN(L * 1000, 4) + ' mm)';
    charVelLabel = 'Mean velocity U';
  }

  const Re    = rho * U * L / mu;
  const tau_w = Cf * 0.5 * rho * U * U;
  const u_tau = Math.sqrt(tau_w / rho);
  const yp    = u_tau * dy1 / nu;
  const thick = Math.abs(gr - 1) < 1e-9 ? dy1 * N
                                         : dy1 * (Math.pow(gr, N) - 1) / (gr - 1);
  const ypOuter = u_tau * thick / nu;
  const regime  = Re < 2300 ? 'Laminar' : Re < 4000 ? 'Transitional' : 'Turbulent';

  let assessment, cls;
  if (yp < 1) {
    assessment = '✓ Resolved — viscous sublayer captured (y⁺ < 1)';
    cls = 'good';
  } else if (yp < 5) {
    assessment = '⚠ Marginal (1 ≤ y⁺ < 5) — buffer layer partially unresolved';
    cls = 'warn';
  } else if (yp < 30) {
    assessment = '✗ Buffer layer (5 ≤ y⁺ < 30) — SST k-ω requires y⁺ < 1';
    cls = 'bad';
  } else {
    assessment = '⚠ Wall function regime (y⁺ ≥ 30) — use wall functions';
    cls = 'warn';
  }

  showOut('ypa-out', [
    { label: 'Geometry',                  val: geomLabel,             unit: '' },
    { label: charVelLabel,                val: fmtN(U),               unit: 'm/s' },
    { label: 'Reynolds number Re',        val: fmtN(Re, 5),           unit: '' },
    { label: 'Flow regime',               val: regime,                unit: '', cls: Re > 4000 ? '' : Re > 2300 ? 'warn' : 'good' },
    { label: 'Skin friction Cƒ',          val: fmtN(Cf),              unit: '' },
    { label: 'Wall shear stress τ_w',     val: fmtN(tau_w),           unit: 'Pa' },
    { label: 'Friction velocity u_τ',     val: fmtN(u_tau),           unit: 'm/s' },
    { label: 'y⁺ — first layer',          val: fmtN(yp, 4),           unit: '',  cls },
    { label: 'SST k-ω assessment',        val: assessment,            unit: '',  cls },
    { label: 'Total inflation thickness', val: fmtN(thick * 1000, 4), unit: 'mm' },
    { label: 'y⁺ — outer inflation edge', val: fmtN(ypOuter, 4),      unit: '' },
  ], 'SST k-ω (Menter 1994): y⁺ < 1 resolves the viscous sublayer without wall functions. Avoid y⁺ = 5–30 (buffer layer). Wall functions require y⁺ = 30–300.');
}

/* ── Washburn–Lucas capillary wicking ──────────────────────── */
/* Penetration of a wetting liquid into a channel by capillary action:
   cylinder L² = (r·γ·cosθ)/(2μ)·t ; slit gap b: L² = (b·γ·cosθ)/(3μ)·t */
function washCalc() {
  const gamma = v('wash-gamma');
  const theta = v('wash-theta') * Math.PI / 180;
  const mu    = v('wash-mu') * su('wash-mu-u');
  const t     = v('wash-t')  * su('wash-t-u');
  const Lt    = v('wash-Lt') * su('wash-Lt-u');
  if (!gamma || gamma <= 0 || !mu || mu <= 0)
    return errOut('wash-out', 'Surface tension and viscosity must be positive.');
  const cosT = Math.cos(theta);
  if (cosT <= 0)
    return errOut('wash-out', 'Contact angle ≥ 90° → non-wetting surface; no spontaneous capillary uptake.');
  if (!t || t <= 0 || !Lt || Lt <= 0)
    return errOut('wash-out', 'Evaluation time and pathway length must be positive.');

  const geomTab = document.querySelector('#wash-tabs .tab.active')?.textContent?.trim() || 'Cylindrical';
  let a, C, dP, geomLabel;
  if (geomTab.includes('Slit')) {
    a = v('wash-b') * su('wash-b-u');                 // plate gap b
    if (!a || a <= 0) return errOut('wash-out', 'Plate gap must be positive.');
    C  = a * gamma * cosT / (3 * mu);                 // washburn coefficient
    dP = 2 * gamma * cosT / a;
    geomLabel = 'Parallel-plate slit (gap b = ' + fmtN(a * 1e6, 4) + ' μm)';
  } else {
    a = v('wash-r') * su('wash-r-u');                 // capillary radius r
    if (!a || a <= 0) return errOut('wash-out', 'Channel radius must be positive.');
    C  = a * gamma * cosT / (2 * mu);
    dP = 2 * gamma * cosT / a;
    geomLabel = 'Cylindrical channel (radius r = ' + fmtN(a * 1e6, 4) + ' μm)';
  }

  const L      = Math.sqrt(C * t);          // penetration at time t
  const vFront = 0.5 * Math.sqrt(C / t);    // dL/dt at time t
  const tFill  = Lt * Lt / C;               // time to reach pathway length Lt

  const reached = L >= Lt;
  let fillNote, cls;
  if (tFill <= 5)        { fillNote = '✓ Fast — fills the pathway in ≤ 5 s';               cls = 'good'; }
  else if (tFill <= 30)  { fillNote = '⚠ Moderate — 5–30 s to fill; usable but slow';      cls = 'warn'; }
  else                   { fillNote = '✗ Slow — > 30 s to fill; widen channel or raise θ wetting'; cls = 'bad'; }

  showOut('wash-out', [
    { label: 'Geometry',                     val: geomLabel,                 unit: '' },
    { label: 'cos θ (wetting factor)',       val: fmtN(cosT, 4),             unit: '' },
    { label: 'Capillary driving pressure',   val: fmtN(dP, 4),               unit: 'Pa' },
    { label: 'Wicking coefficient C',        val: fmtN(C, 4),                unit: 'm²/s' },
    { label: 'Penetration L at t = ' + fmtN(t, 3) + ' s', val: fmtN(L * 1000, 4), unit: 'mm', cls: reached ? 'good' : '' },
    { label: 'Front velocity dL/dt at t',    val: fmtN(vFront * 1000, 4),    unit: 'mm/s' },
    { label: 'Time to fill pathway (' + fmtN(Lt * 1000, 3) + ' mm)', val: fmtN(tFill, 4), unit: 's', cls },
    { label: 'Assessment',                   val: fillNote,                  unit: '', cls },
  ], 'Washburn–Lucas: L = √(C·t), C = r·γ·cosθ/2μ (tube) or b·γ·cosθ/3μ (slit). Assumes laminar, fully wetting front, negligible gravity & inertia (valid for Bo ≪ 1, t beyond the inertial regime). Whole saliva γ ≈ 0.053–0.060 N/m, μ ≈ 1–5 mPa·s.');
}

/* ── Young–Laplace capillary pressure, rise & Bond number ──── */
function capCalc() {
  const gamma = v('cap-gamma');
  const theta = v('cap-theta') * Math.PI / 180;
  const r     = v('cap-r')  * su('cap-r-u');
  const rho   = v('cap-rho');
  const grav  = v('cap-g');
  const H     = v('cap-H')  * su('cap-H-u');
  const Lc    = v('cap-Lc') * su('cap-Lc-u');
  if (!gamma || gamma <= 0 || !r || r <= 0 || !rho || rho <= 0 || !grav || grav <= 0)
    return errOut('cap-out', 'Surface tension, radius, density, and gravity must be positive.');
  const cosT = Math.cos(theta);

  const dPcap = 2 * gamma * cosT / r;            // Young–Laplace capillary pressure
  const hMax  = 2 * gamma * cosT / (rho * grav * r);  // max capillary rise
  const Ph    = rho * grav * H;                  // hydrostatic head over height H
  const net   = dPcap - Ph;
  const lamC  = Math.sqrt(gamma / (rho * grav)); // capillary length
  const Bo    = rho * grav * Lc * Lc / gamma;    // Bond number

  let capCls, capMsg;
  if (cosT <= 0) {
    capCls = 'bad'; capMsg = '✗ Non-wetting (θ ≥ 90°) — liquid is repelled, capillary depression';
  } else if (net > 0) {
    capCls = 'good'; capMsg = '✓ Capillary pressure overcomes ' + fmtN(H * 1000, 3) + ' mm head — fills against gravity';
  } else {
    capCls = 'warn'; capMsg = '⚠ Capillary pressure below the ' + fmtN(H * 1000, 3) + ' mm hydrostatic head — gravity wins at this height';
  }

  let boCls, boMsg;
  if (Bo < 0.1)      { boCls = 'good'; boMsg = '✓ Bo ≪ 1 — capillary forces dominate (passive wicking reliable)'; }
  else if (Bo < 10)  { boCls = 'warn'; boMsg = '⚠ Bo ~ 1 — capillary and gravity comparable'; }
  else               { boCls = 'bad';  boMsg = '✗ Bo ≫ 1 — gravity dominates at this length scale'; }

  showOut('cap-out', [
    { label: 'cos θ (wetting factor)',          val: fmtN(cosT, 4),         unit: '' },
    { label: 'Capillary pressure ΔP_cap',       val: fmtN(dPcap, 4),        unit: 'Pa', cls: capCls },
    { label: 'Max capillary rise h_max',        val: fmtN(hMax * 1000, 4),  unit: 'mm' },
    { label: 'Hydrostatic head ρgH (H = ' + fmtN(H * 1000, 3) + ' mm)', val: fmtN(Ph, 4), unit: 'Pa' },
    { label: 'Net available pressure',          val: fmtN(net, 4),          unit: 'Pa', cls: capCls },
    { label: 'Gravity check',                   val: capMsg,                unit: '', cls: capCls },
    { label: 'Capillary length √(γ/ρg)',        val: fmtN(lamC * 1000, 4),  unit: 'mm' },
    { label: 'Bond number Bo = ρgL²/γ',         val: fmtN(Bo, 4),           unit: '', cls: boCls },
    { label: 'Regime',                          val: boMsg,                 unit: '', cls: boCls },
  ], 'Young–Laplace ΔP = 2γcosθ/r drives spontaneous filling; max rise h = 2γcosθ/(ρgr). Bo = ρgL²/γ compares gravity to surface tension over length L. For a hydrophilic mm-scale saliva collector Bo ≪ 1, so capillary forces govern filling and gravity governs dispensing.');
}

/* ── y* (viscous/pressure-based wall unit) ─────────────────── */
function ysCalc() {
  const y    = v('ys-y')   * su('ys-y-u');
  const dpdx = v('ys-dp')  * su('ys-dp-u');
  const rho  = v('ys-rho') * su('ys-rho-u');
  const mu   = v('ys-mu')  * su('ys-mu-u');
  if (!y || !dpdx || !rho || !mu) return;
  const nu    = mu / rho;
  const up    = Math.pow(nu * dpdx / rho, 1 / 3);
  const ystar = y * up / nu;
  const body  = document.getElementById('ys-out-body');
  if (!body) return;
  body.innerHTML = [
    ['Pressure velocity u_p', up.toExponential(4) + ' m/s', 'u_p=(ν|dp/dx|/ρ)^(1/3)'],
    ['y*',                    ystar.toFixed(4),              'y·u_p/ν'],
    ['ν (kinematic viscosity)', nu.toExponential(4) + ' m²/s', 'μ/ρ'],
    ['Interpretation', ystar < 5 ? 'Viscous sublayer (y*<5)' : ystar < 30 ? 'Buffer layer' : 'Log-law region (y*>30)', ''],
  ].map(([lbl, val, note]) =>
    `<div class="out-row"><span class="out-label">${lbl}</span>` +
    `<span class="out-val">${val}${note ? ' <span style="opacity:.6;font-size:.75em;margin-left:6px">' + note + '</span>' : ''}</span></div>`
  ).join('');
  document.getElementById('ys-out').classList.add('visible');
}
