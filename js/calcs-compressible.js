/* ================================================================
   calcs-compressible.js — Compressible flow and related calculators
   Sections: CFL stability, isentropic relations, normal shock,
             oblique shock, Prandtl-Meyer expansion, Fanno flow,
             Rayleigh flow, pump affinity laws, cavitation (NPSH),
             Stokes settling, surface tension numbers
             (Weber / Capillary / Bond).

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Compressible Flow <section> in index.html.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

/* ── CFL stability number ───────────────────────────────────── */
function cflCalc() {
  const u  = v('cfl-u')  * su('cfl-u-u');
  const dt = v('cfl-dt');
  const dx = v('cfl-dx') * su('cfl-dx-u');
  if (dx <= 0 || dt <= 0) return errOut('cfl-out', 'Δx and Δt must be positive.');
  const CFL = u * dt / dx;
  showOut('cfl-out', [
    { label: 'CFL number',      val: fmtN(CFL),    unit: '', cls: CFL <= 1 ? 'good' : CFL <= 2 ? 'warn' : 'bad' },
    { label: 'Stability (explicit)', val: CFL <= 1 ? 'Stable (CFL ≤ 1)' : CFL <= 2 ? 'Marginal — check scheme' : 'Unstable for explicit schemes', unit: '' },
    { label: 'Max stable Δt',   val: fmtN(dx / u), unit: 's' },
  ], 'CFL ≤ 1 required for most explicit time-marching schemes. Implicit schemes tolerate CFL > 1.');
}

/* ── Isentropic flow relations ──────────────────────────────── */
function isoCalc() {
  const M = v('iso-M'), gam = v('iso-gam') || 1.4;
  if (M < 0) return errOut('iso-out', 'Mach number must be ≥ 0.');
  const base    = 1 + (gam - 1) / 2 * M * M;
  const P0P     = Math.pow(base, gam / (gam - 1));
  const T0T     = base;
  const rho0rho = Math.pow(base, 1 / (gam - 1));
  const AAstar  = M > 0 ? (1 / M) * Math.pow(2 / (gam + 1) * base, (gam + 1) / (2 * (gam - 1))) : Infinity;
  showOut('iso-out', [
    { label: 'Mach number M',     val: fmtN(M),       unit: '', cls: M < 0.3 ? 'good' : M < 1 ? 'warn' : '' },
    { label: 'P₀/P (total/static)', val: fmtN(P0P),   unit: '', cls: 'good' },
    { label: 'T₀/T',              val: fmtN(T0T),     unit: '' },
    { label: 'ρ₀/ρ',             val: fmtN(rho0rho), unit: '' },
    { label: 'A/A*',             val: M > 0 ? fmtN(AAstar) : '∞', unit: '' },
    { label: 'Regime', val: M < 0.3 ? 'Incompressible' : M < 0.8 ? 'Subsonic' : M < 1.2 ? 'Transonic' : 'Supersonic', unit: '' },
  ], 'Isentropic relations assume adiabatic, reversible (shock-free) flow. Choked flow at M=1 — maximum mass flow.');
}

/* ── Normal shock relations ─────────────────────────────────── */
function nshCalc() {
  const M1 = v('nsh-M1'), gam = v('nsh-gam') || 1.4;
  if (M1 < 1) return errOut('nsh-out', 'Upstream Mach M₁ must be ≥ 1 for a normal shock.');
  const M2sq    = ((gam - 1) * M1 * M1 + 2) / (2 * gam * M1 * M1 - (gam - 1));
  const M2      = Math.sqrt(M2sq);
  const P2P1    = (2 * gam * M1 * M1 - (gam - 1)) / (gam + 1);
  const T2T1    = P2P1 * (2 + (gam - 1) * M1 * M1) / ((gam + 1) * M1 * M1);
  const rho2rho = (gam + 1) * M1 * M1 / (2 + (gam - 1) * M1 * M1);
  const P02P01  = Math.pow((gam + 1) * M1 * M1 / (2 + (gam - 1) * M1 * M1), gam / (gam - 1)) *
                  Math.pow((gam + 1) / (2 * gam * M1 * M1 - (gam - 1)), 1 / (gam - 1));
  showOut('nsh-out', [
    { label: 'M₂',           val: fmtN(M2),      unit: '', cls: 'good' },
    { label: 'P₂/P₁',        val: fmtN(P2P1),    unit: '' },
    { label: 'T₂/T₁',        val: fmtN(T2T1),    unit: '' },
    { label: 'ρ₂/ρ₁',       val: fmtN(rho2rho), unit: '' },
    { label: 'P₀₂/P₀₁',     val: fmtN(P02P01),  unit: '', cls: 'warn' },
    { label: 'Entropy increase?', val: P02P01 < 1 ? 'Yes (irreversible shock)' : 'No', unit: '' },
  ], 'Normal shocks always produce M₂<1. Total pressure loss (P₀₂/P₀₁<1) measures entropy generation.');
}

/* ── Oblique shock (weak solution via θ-β-M bisection) ─────── */
function oshCalc() {
  const M1    = v('osh-M1');
  const theta = v('osh-theta') * Math.PI / 180;
  const gam   = v('osh-gam') || 1.4;
  if (M1 < 1) return errOut('osh-out', 'M₁ must be ≥ 1.');
  const f = beta =>
    Math.tan(theta) - 2 / Math.tan(beta) * (M1 * M1 * Math.sin(beta) ** 2 - 1) /
    (M1 * M1 * (gam + Math.cos(2 * beta)) + 2);
  let lo = theta + 0.001, hi = Math.PI / 2 - 0.001;
  if (f(lo) * f(hi) > 0) return errOut('osh-out', 'No attached shock solution — deflection exceeds detachment angle.');
  for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; f(m) > 0 ? lo = m : hi = m; }
  const beta = (lo + hi) / 2;
  const Mn1  = M1 * Math.sin(beta);
  const Mn2sq = ((gam - 1) * Mn1 ** 2 + 2) / (2 * gam * Mn1 ** 2 - (gam - 1));
  const M2   = Math.sqrt(Mn2sq) / Math.sin(beta - theta);
  const P2P1 = (2 * gam * Mn1 ** 2 - (gam - 1)) / (gam + 1);
  showOut('osh-out', [
    { label: 'Shock angle β',        val: fmtN(beta * 180 / Math.PI), unit: '°', cls: 'good' },
    { label: 'M₂',                   val: fmtN(M2),                   unit: '' },
    { label: 'P₂/P₁',               val: fmtN(P2P1),                 unit: '' },
    { label: 'Mn₁ (normal component)', val: fmtN(Mn1),               unit: '' },
  ], 'Weak solution (smaller β) is physically realised in most cases. Oblique shocks have lower total pressure loss than normal shocks.');
}

/* ── Prandtl-Meyer expansion ────────────────────────────────── */
function pmeCalc() {
  const M1     = v('pme-M1');
  const dtheta = v('pme-dtheta') * Math.PI / 180;
  const gam    = v('pme-gam') || 1.4;
  if (M1 <= 1) return errOut('pme-out', 'M₁ must be > 1 for Prandtl-Meyer expansion.');
  const nu = M => {
    const r = Math.sqrt((gam + 1) / (gam - 1));
    return r * Math.atan(Math.sqrt((gam - 1) / (gam + 1) * (M * M - 1))) - Math.atan(Math.sqrt(M * M - 1));
  };
  const nu1 = nu(M1), nu2 = nu1 + dtheta;
  let lo = M1, hi = 20;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; nu(m) < nu2 ? lo = m : hi = m; }
  const M2 = (lo + hi) / 2;
  const base1 = 1 + (gam - 1) / 2 * M1 * M1;
  const base2 = 1 + (gam - 1) / 2 * M2 * M2;
  const P2P1  = Math.pow(base1 / base2, gam / (gam - 1));
  showOut('pme-out', [
    { label: 'ν(M₁)', val: fmtN(nu1 * 180 / Math.PI), unit: '°' },
    { label: 'ν(M₂)', val: fmtN(nu2 * 180 / Math.PI), unit: '°' },
    { label: 'M₂',    val: fmtN(M2),                   unit: '', cls: 'good' },
    { label: 'P₂/P₁', val: fmtN(P2P1),                 unit: '' },
  ], 'Expansion fans are isentropic — no total pressure loss. Maximum turning ν_max = 130.45° (M→∞). P₂/P₁<1 always.');
}

/* ── Fanno flow (adiabatic with friction) ───────────────────── */
function fanCalc() {
  const M1  = v('fan-M1'), fLD = v('fan-fLD'), gam = v('fan-gam') || 1.4;
  if (M1 <= 0) return errOut('fan-out', 'M₁ must be positive.');
  const fLstar = M =>
    (1 - M * M) / (gam * M * M) + (gam + 1) / (2 * gam) * Math.log((gam + 1) * M * M / (2 + (gam - 1) * M * M));
  const fLs1 = fLstar(M1), fLs2 = fLs1 - fLD;
  if (fLs2 < 0) return errOut('fan-out', 'fL/D exceeds maximum — flow reaches M=1 before exit.');
  let lo = M1 < 1 ? 0.001 : 1.001, hi = M1 < 1 ? 0.999 : 50;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; fLstar(m) > fLs2 ? lo = m : hi = m; }
  const M2  = (lo + hi) / 2;
  const T2T1 = (1 + (gam - 1) / 2 * M1 * M1) / (1 + (gam - 1) / 2 * M2 * M2);
  const P2P1 = M1 / M2 * Math.sqrt(T2T1);
  showOut('fan-out', [
    { label: 'M₂',              val: fmtN(M2),   unit: '', cls: 'good' },
    { label: 'T₂/T₁',           val: fmtN(T2T1), unit: '' },
    { label: 'P₂/P₁',           val: fmtN(P2P1), unit: '' },
    { label: 'fL*/D at inlet',  val: fmtN(fLs1), unit: '' },
  ], 'Friction drives subsonic and supersonic flows toward Ma=1 (choking). Adding more pipe beyond L* chokes or induces shocks.');
}

/* ── Rayleigh flow (frictionless with heat addition) ────────── */
function rayCalc() {
  const M1    = v('ray-M1'), T02T01 = v('ray-T02T01'), gam = v('ray-gam') || 1.4;
  if (M1 <= 0 || T02T01 <= 0) return errOut('ray-out', 'M₁ and T₀₂/T₀₁ must be positive.');
  const TT     = (M, g) => (g + 1) * M * M / (1 + g * M * M) ** 2 * (1 + (g - 1) / 2 * M * M);
  const TTs1   = TT(M1, gam);
  const TTs2   = TTs1 * T02T01;
  let lo = M1 < 1 ? 0.001 : 1.001, hi = M1 < 1 ? 0.999 : 50;
  for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; TT(m, gam) < TTs2 ? lo = m : hi = m; }
  const M2   = (lo + hi) / 2;
  const T2T1 = (1 + gam * M1 * M1) ** 2 * M2 * M2 / ((1 + gam * M2 * M2) ** 2 * M1 * M1);
  const P2P1 = (1 + gam * M1 * M1) / (1 + gam * M2 * M2);
  showOut('ray-out', [
    { label: 'M₂',    val: fmtN(M2),   unit: '', cls: 'good' },
    { label: 'T₂/T₁', val: fmtN(T2T1), unit: '' },
    { label: 'P₂/P₁', val: fmtN(P2P1), unit: '' },
  ], 'Heat addition drives both subsonic and supersonic flows toward Ma=1 (thermal choking). Used in combustion/ramjet analysis.');
}

/* ── Pump affinity laws ─────────────────────────────────────── */
function pmpCalc() {
  const Q1 = v('pmp-Q1'), H1 = v('pmp-H1'), P1 = v('pmp-P1'), N1 = v('pmp-N1'), N2 = v('pmp-N2');
  if (N1 <= 0 || N2 <= 0) return errOut('pmp-out', 'Speeds must be positive.');
  const r = N2 / N1;
  showOut('pmp-out', [
    { label: 'Speed ratio N₂/N₁', val: fmtN(r),          unit: '', cls: 'good' },
    { label: 'Q₂ (flow rate)',    val: fmtN(Q1 * r),      unit: '(same unit as Q₁)' },
    { label: 'H₂ (head)',         val: fmtN(H1 * r * r),   unit: '(same unit as H₁)' },
    { label: 'P₂ (power)',        val: fmtN(P1 * r ** 3), unit: '(same unit as P₁)' },
  ], 'Power scales as N³ — small speed reduction dramatically cuts energy. Verify the new point stays on the stable pump curve.');
}

/* ── Cavitation / NPSH ──────────────────────────────────────── */
function cavCalc() {
  const Pinlet = v('cav-Pi') * su('cav-Pi-u');
  const Pv     = v('cav-Pv') * su('cav-Pv-u');
  const rho    = v('cav-rho'), vel = v('cav-v'), g = 9.81, NPSHr = v('cav-NPSHr');
  if (rho <= 0) return errOut('cav-out', 'Density must be positive.');
  const NPSHa = (Pinlet - Pv) / (rho * g) + vel * vel / (2 * g);
  const margin = NPSHa - NPSHr;
  showOut('cav-out', [
    { label: 'NPSH available',    val: fmtN(NPSHa),  unit: 'm', cls: margin > 0 ? 'good' : 'bad' },
    { label: 'NPSH required',     val: fmtN(NPSHr),  unit: 'm' },
    { label: 'Cavitation margin', val: fmtN(margin), unit: 'm', cls: margin > 0.5 ? 'good' : margin > 0 ? 'warn' : 'bad' },
    { label: 'Risk', val: margin > 0.5 ? 'Low' : margin > 0 ? 'Marginal — add safety factor' : 'HIGH — cavitation likely', unit: '' },
  ], 'NPSH_A > NPSH_R required. Add 0.5–1 m safety margin. Cavitation causes noise, erosion, and loss of head.');
}

/* ── Stokes settling velocity ───────────────────────────────── */
function stkCalc() {
  const d    = v('stk-d')  * su('stk-d-u');
  const rhop = v('stk-rhop'), rhof = v('stk-rhof'), mu = v('stk-mu') * su('stk-mu-u');
  if (d <= 0 || mu <= 0) return errOut('stk-out', 'd and μ must be positive.');
  const Vt = (rhop - rhof) * 9.81 * d * d / (18 * mu);
  const Re = rhof * Math.abs(Vt) * d / mu;
  showOut('stk-out', [
    { label: 'Settling velocity Vt',    val: fmtN(Vt * 1000), unit: 'mm/s', cls: 'good' },
    { label: 'Particle Re',             val: fmtN(Re),         unit: '', cls: Re < 0.5 ? 'good' : 'warn' },
    { label: 'Stokes regime valid?',    val: Re < 0.5 ? 'Yes (Re < 0.5)' : 'No — use intermediate law', unit: '' },
  ], 'Stokes valid for Re_p<1. For Re_p 1–1000 use Schiller-Naumann: C_D=24/Re×(1+0.15×Re^0.687). For Re_p>1000 use C_D≈0.44.');
}

/* ── Surface tension / interfacial numbers ──────────────────── */
function dim3Calc() {
  const rho = v('d3-rho'), V = v('d3-V') * su('d3-V-u'), L = v('d3-L') * su('d3-L-u');
  const mu  = v('d3-mu') * su('d3-mu-u'), sig = v('d3-sig'), drho = v('d3-drho');
  const We  = rho * V * V * L / sig;
  const Ca  = mu * V / sig;
  const Bo  = drho * 9.81 * L * L / sig;
  showOut('d3-out', [
    { label: 'Weber number We',  val: fmtN(We), unit: '', cls: 'good' },
    { label: '  → We >> 1',     val: 'Inertia dominates surface tension',  unit: '' },
    { label: 'Capillary number Ca', val: fmtN(Ca), unit: '' },
    { label: '  → Ca << 1',    val: 'Surface tension dominates viscosity', unit: '' },
    { label: 'Bond number Bo',  val: fmtN(Bo), unit: '' },
    { label: '  → Bo >> 1',    val: 'Gravity dominates capillary forces',  unit: '' },
  ], 'We<1, Ca<1, Bo<1: surface tension dominates — droplets remain spherical. We>>1: droplet breakup likely.');
}
