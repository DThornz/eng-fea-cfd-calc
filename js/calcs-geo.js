/* ================================================================
   calcs-geo.js — Geometry and calculus calculators
   Sections: 2D shapes (circle, rectangle, triangle, ellipse,
             annulus), 3D solids (sphere, cylinder, cone, box,
             torus), triangle solver (SSS/SAS/ASA/AAS), coordinate
             geometry (distance/midpoint, line equation, circle
             equation), numerical differentiation, numerical
             integration (trapezoidal, Simpson), Taylor series,
             vector calculus (gradient, divergence, curl).

   HOW TO ADD A NEW CARD:
     1. Write a calc function here.
     2. Add the card HTML in the Geometry or Calculus <section>.
     3. Wire the button: onclick="yourCalcFn()".
   Depends on: utils.js
================================================================ */

const _PI = Math.PI;

/* Geometry-specific formatter (slightly wider range than fmtSci). */
function fmt(n, dp = 4) {
  if (isNaN(n) || n === undefined) return '—';
  const a = Math.abs(n);
  if (a === 0) return '0';
  if (a >= 0.001 && a < 1e7) return parseFloat(n.toPrecision(dp)).toString();
  return n.toExponential(3);
}

/* ── 2D shapes ──────────────────────────────────────────────── */

function gCircle() {
  const r = v('gc-r') * su('gc-r-u');
  if (!r) return;
  const A = _PI * r * r, P = 2 * _PI * r, Ix = _PI * r ** 4 / 4, Sx = _PI * r ** 3 / 4;
  res('gc-body', [
    ['Area A',               fmt(A)    + ' m²', 'πr²'],
    ['Perimeter (circumference)', fmt(P) + ' m', '2πr'],
    ['Ix = Iy (2nd moment)', fmt(Ix)   + ' m⁴', 'πr⁴/4'],
    ['Polar moment Ip = J',  fmt(2*Ix) + ' m⁴', 'πr⁴/2'],
    ['Section modulus Sx',   fmt(Sx)   + ' m³', 'πr³/4'],
    ['Centroid (from base)', fmt(r)    + ' m',  'at centre'],
  ]);
}

function gRect() {
  const b = v('gr-b') * su('gr-b-u'), h = v('gr-h') * su('gr-h-u');
  if (!b || !h) return;
  const A = b * h, P = 2 * (b + h), Ix = b * h ** 3 / 12, Iy = h * b ** 3 / 12;
  res('gr-body', [
    ['Area A',                    fmt(A)      + ' m²', 'b·h'],
    ['Perimeter',                 fmt(P)      + ' m',  '2(b+h)'],
    ['Ix (centroidal, about x)',  fmt(Ix)     + ' m⁴', 'bh³/12'],
    ['Iy (centroidal, about y)',  fmt(Iy)     + ' m⁴', 'hb³/12'],
    ['Polar moment Ip',           fmt(Ix + Iy)+ ' m⁴', 'Ix+Iy'],
    ['Centroid (from corner)',    fmt(b/2)+' m, '+fmt(h/2)+' m', '(b/2, h/2)'],
  ]);
}

function gTriangle() {
  const b = v('gt-b') * su('gt-b-u'), h = v('gt-h') * su('gt-h-u');
  if (!b || !h) return;
  const cRaw = parseFloat(document.getElementById('gt-c').value);
  const A  = 0.5 * b * h, Ix = b * h ** 3 / 36;
  const rows = [
    ['Area A',           fmt(A)   + ' m²', 'bh/2'],
    ['Ix (centroidal)',  fmt(Ix)  + ' m⁴', 'bh³/36'],
    ['Centroid height',  fmt(h/3) + ' m',  'h/3 from base'],
  ];
  if (!isNaN(cRaw)) {
    const c = cRaw * su('gt-b-u');
    const s = (b + h + c) / 2;
    const AH = Math.sqrt(Math.max(0, s * (s - b) * (s - h) * (s - c)));
    rows.push(['Area (Heron)', fmt(AH) + ' m²', '— with side c']);
  }
  res('gt-body', rows);
}

function gEllipse() {
  const a = v('ge-a') * su('ge-a-u'), b = v('ge-b') * su('ge-b-u');
  if (!a || !b) return;
  const P  = _PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const A  = _PI * a * b, Ix = _PI * a * b ** 3 / 4, Iy = _PI * b * a ** 3 / 4;
  res('ge-body', [
    ['Area A',                fmt(A)  + ' m²', 'πab'],
    ['Perimeter (Ramanujan)', fmt(P)  + ' m',  'approx.'],
    ['Eccentricity e',        fmt(Math.sqrt(1 - (b*b)/(a*a))), 'e=√(1−b²/a²)'],
    ['Ix',                    fmt(Ix) + ' m⁴', 'πab³/4'],
    ['Iy',                    fmt(Iy) + ' m⁴', 'πba³/4'],
  ]);
}

function gAnnulus() {
  const R = v('gan-R') * su('gan-R-u'), r = v('gan-r') * su('gan-r-u');
  if (!R || !r || r >= R) { res('gan-body', [['Error', 'r must be < R', '']]); return; }
  const A  = _PI * (R * R - r * r), Ix = _PI * (R ** 4 - r ** 4) / 4;
  res('gan-body', [
    ['Area A',         fmt(A)     + ' m²', 'π(R²−r²)'],
    ['Outer perimeter', fmt(2*_PI*R)+ ' m', '2πR'],
    ['Inner perimeter', fmt(2*_PI*r)+ ' m', '2πr'],
    ['Ix = Iy',        fmt(Ix)    + ' m⁴', 'π(R⁴−r⁴)/4'],
    ['Polar moment',   fmt(2*Ix)  + ' m⁴', 'π(R⁴−r⁴)/2'],
  ]);
}

/* ── 3D solids ──────────────────────────────────────────────── */

function gSphere() {
  const r = v('gs-r') * su('gs-r-u');
  if (!r) return;
  const V = 4 * _PI * r ** 3 / 3, SA = 4 * _PI * r * r;
  res('gs-body', [
    ['Volume V',        fmt(V)  + ' m³', '(4/3)πr³'],
    ['Surface area SA', fmt(SA) + ' m²', '4πr²'],
    ['Centroid',        '0',             'by symmetry'],
  ]);
}

function gCyl() {
  const r = v('gcyl-r') * su('gcyl-r-u'), h = v('gcyl-h') * su('gcyl-h-u');
  if (!r || !h) return;
  const V = _PI * r * r * h, SA_lat = 2 * _PI * r * h, SA_cap = 2 * _PI * r * r;
  res('gcyl-body', [
    ['Volume V',           fmt(V)             + ' m³', 'πr²h'],
    ['Lateral surface area', fmt(SA_lat)      + ' m²', '2πrh'],
    ['Total surface area',   fmt(SA_lat+SA_cap)+ ' m²', '2πr(r+h)'],
    ['Centroid height',    fmt(h / 2)         + ' m',  'h/2 from base'],
  ]);
}

function gCone() {
  const r = v('gcone-r') * su('gcone-r-u'), h = v('gcone-h') * su('gcone-h-u');
  if (!r || !h) return;
  const l = Math.sqrt(r * r + h * h);
  const V = _PI * r * r * h / 3, SA_lat = _PI * r * l, SA = SA_lat + _PI * r * r;
  res('gcone-body', [
    ['Volume V',           fmt(V)      + ' m³', 'πr²h/3'],
    ['Slant height l',     fmt(l)      + ' m',  '√(r²+h²)'],
    ['Lateral surface area', fmt(SA_lat)+' m²', 'πrl'],
    ['Total surface area', fmt(SA)     + ' m²', 'πr(r+l)'],
    ['Centroid height',    fmt(h / 4)  + ' m',  'h/4 from base'],
  ]);
}

function gBox() {
  const a = v('gbox-a') * su('gbox-a-u'), b = v('gbox-b') * su('gbox-b-u'), c_ = v('gbox-c') * su('gbox-c-u');
  if (!a || !b || !c_) return;
  const V = a * b * c_, SA = 2 * (a * b + b * c_ + a * c_), diag = Math.sqrt(a * a + b * b + c_ * c_);
  res('gbox-body', [
    ['Volume V',       fmt(V)    + ' m³', 'abc'],
    ['Surface area SA', fmt(SA)  + ' m²', '2(ab+bc+ac)'],
    ['Space diagonal', fmt(diag) + ' m',  '√(a²+b²+c²)'],
    ['Centroid',       '(a/2, b/2, c/2)', ''],
  ]);
}

function gTorus() {
  const R = v('gtor-R') * su('gtor-R-u'), r = v('gtor-r') * su('gtor-r-u');
  if (!R || !r || r >= R) { res('gtor-body', [['Error', 'Tube radius r must be < R', '']]); return; }
  const V = 2 * _PI * _PI * R * r * r, SA = 4 * _PI * _PI * R * r;
  res('gtor-body', [
    ['Volume V',        fmt(V)  + ' m³', '2π²Rr²'],
    ['Surface area SA', fmt(SA) + ' m²', '4π²Rr'],
    ['Centroid',        'At centre',     'by symmetry'],
  ]);
}

/* ── Triangle solver (SSS / SAS / ASA / AAS) ────────────────── */
function triSolve() {
  let a = parseFloat(document.getElementById('tri-a').value);
  let b = parseFloat(document.getElementById('tri-b').value);
  let c = parseFloat(document.getElementById('tri-c').value);
  let A = parseFloat(document.getElementById('tri-A').value) * _PI / 180;
  let B = parseFloat(document.getElementById('tri-B').value) * _PI / 180;
  let C = parseFloat(document.getElementById('tri-C').value) * _PI / 180;
  const nan   = n => isNaN(n);
  const known = x => !isNaN(x) && x > 0;

  if ([known(A), known(B), known(C)].filter(Boolean).length === 2) {
    if (nan(C) && known(A) && known(B)) C = _PI - A - B;
    else if (nan(B) && known(A) && known(C)) B = _PI - A - C;
    else if (nan(A) && known(B) && known(C)) A = _PI - B - C;
  }

  if (known(A) && known(B) && known(C) && known(a) && !known(b) && !known(c)) { b = a * Math.sin(B) / Math.sin(A); c = a * Math.sin(C) / Math.sin(A); }
  else if (known(A) && known(B) && known(C) && known(b) && !known(a) && !known(c)) { a = b * Math.sin(A) / Math.sin(B); c = b * Math.sin(C) / Math.sin(B); }
  else if (known(A) && known(B) && known(C) && known(c) && !known(a) && !known(b)) { a = c * Math.sin(A) / Math.sin(C); b = c * Math.sin(B) / Math.sin(C); }
  else if (known(a) && known(b) && known(C) && !known(c)) { c = Math.sqrt(a*a+b*b-2*a*b*Math.cos(C)); A = Math.acos((b*b+c*c-a*a)/(2*b*c)); B = _PI-A-C; }
  else if (known(a) && known(c) && known(B) && !known(b)) { b = Math.sqrt(a*a+c*c-2*a*c*Math.cos(B)); A = Math.acos((b*b+c*c-a*a)/(2*b*c)); C = _PI-A-B; }
  else if (known(b) && known(c) && known(A) && !known(a)) { a = Math.sqrt(b*b+c*c-2*b*c*Math.cos(A)); B = Math.acos((a*a+c*c-b*b)/(2*a*c)); C = _PI-A-B; }
  else if (known(a) && known(b) && known(c))              { A = Math.acos((b*b+c*c-a*a)/(2*b*c)); B = Math.acos((a*a+c*c-b*b)/(2*a*c)); C = _PI-A-B; }

  if (!known(a) || !known(b) || !known(c) || isNaN(A) || isNaN(B) || isNaN(C)) {
    res('tri-body', [['Error', 'Insufficient information or inconsistent values. Need at least 3 knowns (one must be a side).', '']]); return;
  }

  const area  = 0.5 * a * b * Math.sin(C);
  const s     = (a + b + c) / 2;
  const r_in  = area / s;
  const R_circ = a / (2 * Math.sin(A));
  res('tri-body', [
    ['Side a',    fmt(a), ''],
    ['Side b',    fmt(b), ''],
    ['Side c',    fmt(c), ''],
    ['Angle A',   (A * 180 / _PI).toFixed(4) + '°', ''],
    ['Angle B',   (B * 180 / _PI).toFixed(4) + '°', ''],
    ['Angle C',   (C * 180 / _PI).toFixed(4) + '°', 'sum = ' + ((A + B + C) * 180 / _PI).toFixed(2) + '°'],
    ['Area',      fmt(area), '(1/2)ab sin C'],
    ['Perimeter', fmt(a + b + c), ''],
    ['Inradius r',    fmt(r_in),  'A/s'],
    ['Circumradius R', fmt(R_circ), 'a/(2 sin A)'],
  ]);
}

/* ── Coordinate geometry ─────────────────────────────────────── */

function coordPts() {
  const x1 = v('cp-x1'), y1 = v('cp-y1'), x2 = v('cp-x2'), y2 = v('cp-y2');
  if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) return;
  const d  = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const dx = x2 - x1, dy = y2 - y1;
  const m  = dx === 0 ? Infinity : dy / dx;
  const angle = Math.atan2(dy, dx) * 180 / _PI;
  res('cp-body', [
    ['Distance',         fmt(d),                                '√((x₂−x₁)²+(y₂−y₁)²)'],
    ['Midpoint',         '(' + fmt(mx) + ', ' + fmt(my) + ')', ''],
    ['Slope m',          dx === 0 ? '∞ (vertical)' : fmt(m),   'Δy/Δx'],
    ['Angle with x-axis', angle.toFixed(3) + '°',              'atan2(Δy,Δx)'],
    ['Δx',               fmt(dx),                               ''],
    ['Δy',               fmt(dy),                               ''],
  ]);
}

function lineEq() {
  const m = v('le-m'), x0 = v('le-x0'), y0 = v('le-y0');
  if (isNaN(m) || isNaN(x0) || isNaN(y0)) return;
  const b_int = y0 - m * x0;
  const sign  = b_int >= 0 ? '+' : '-';
  res('le-body', [
    ['Slope-intercept', 'y = ' + fmt(m) + 'x ' + sign + ' ' + fmt(Math.abs(b_int)), ''],
    ['Point-slope',     'y − ' + fmt(y0) + ' = ' + fmt(m) + '(x − ' + fmt(x0) + ')', ''],
    ['Standard form',   fmt(m) + 'x − y + ' + fmt(b_int) + ' = 0', ''],
    ['y-intercept',     '(0, ' + fmt(b_int) + ')', ''],
    ['x-intercept',     m === 0 ? 'none (horizontal)' : '(' + fmt(-b_int / m) + ', 0)', ''],
    ['Angle with x-axis', (Math.atan(m) * 180 / _PI).toFixed(3) + '°', ''],
  ]);
}

function circEq() {
  const h = v('ce-h'), k = v('ce-k'), r = v('ce-r');
  if (isNaN(h) || isNaN(k) || !r) return;
  const A = _PI * r * r, P = 2 * _PI * r;
  const hs = h >= 0 ? '−' + fmt(h) : '+' + fmt(-h);
  const ks = k >= 0 ? '−' + fmt(k) : '+' + fmt(-k);
  res('ce-body', [
    ['Equation',     '(x' + hs + ')² + (y' + ks + ')² = ' + fmt(r * r), 'Standard form'],
    ['Centre',       '(' + fmt(h) + ', ' + fmt(k) + ')', ''],
    ['Radius',       fmt(r),    ''],
    ['Area',         fmt(A),    'πr²'],
    ['Circumference', fmt(P),   '2πr'],
    ['Diameter',     fmt(2 * r), '2r'],
  ]);
}

/* ── Calculus ───────────────────────────────────────────────── */

/* Factorial helper for Taylor series */
function factorial(n) { if (n <= 1) return 1; let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }

/* Numerical differentiation (central, forward, backward; 2nd order) */
function numDiff() {
  const fm = v('nd-fm'), f0 = v('nd-f0'), fp = v('nd-fp'), h = v('nd-h');
  if (isNaN(fm) || isNaN(f0) || isNaN(fp) || !h) return;
  const f1c = (fp - fm) / (2 * h);
  const f1f = (fp - f0) / h;
  const f1b = (f0 - fm) / h;
  const f2  = (fp - 2 * f0 + fm) / (h * h);
  res('nd-body', [
    ["f′(x) — central difference",  fmt(f1c), '(f(x+h)−f(x−h))/(2h)  O(h²)'],
    ["f′(x) — forward difference",  fmt(f1f), '(f(x+h)−f(x))/h  O(h)'],
    ["f′(x) — backward difference", fmt(f1b), '(f(x)−f(x−h))/h  O(h)'],
    ["f″(x) — central difference",  fmt(f2),  '(f(x+h)−2f(x)+f(x−h))/h²  O(h²)'],
    ['Truncation error estimate',   fmt(Math.abs(f1f - f1b)), '|fwd − bwd|'],
  ]);
}

/* Numerical integration — trapezoidal, Simpson 1/3, Simpson 3/8 */
function numInt() {
  const a = v('ni-a'), b = v('ni-b');
  if (isNaN(a) || isNaN(b) || a >= b) return;
  const raw = document.getElementById('ni-y').value;
  const ys  = raw.split(',').map(s => parseFloat(s.trim())).filter(y => !isNaN(y));
  const n   = ys.length - 1;
  if (n < 1) { res('ni-body', [['Error', 'Need at least 2 y values', '']]); return; }
  const h   = (b - a) / n;

  let trap = ys[0] + ys[n];
  for (let i = 1; i < n; i++) trap += 2 * ys[i];
  trap *= h / 2;

  let simp13 = NaN;
  if (n % 2 === 0) { let s = ys[0] + ys[n]; for (let i = 1; i < n; i++) s += (i % 2 === 1 ? 4 : 2) * ys[i]; simp13 = s * h / 3; }

  let simp38 = NaN;
  if (n % 3 === 0) { let s = ys[0] + ys[n]; for (let i = 1; i < n; i++) s += (i % 3 === 0 ? 2 : 3) * ys[i]; simp38 = s * 3 * h / 8; }

  res('ni-body', [
    ['n (intervals)',  n,                                        ''],
    ['Step size h',    fmt(h),                                   '(b−a)/n'],
    ['Trapezoidal',    fmt(trap),                                'O(h²)'],
    ['Simpson 1/3',    isNaN(simp13) ? 'needs even n' : fmt(simp13), 'O(h⁴)'],
    ["Simpson 3/8",   isNaN(simp38) ? 'n not ÷ 3'   : fmt(simp38), 'O(h⁴)'],
    ['Best estimate',  isNaN(simp13) ? fmt(trap)     : fmt(simp13), ''],
  ]);
}

/* Taylor series approximation */
function taylorCalc() {
  const fn    = document.getElementById('ts-fn').value;
  const x     = v('ts-x'), terms = Math.min(12, Math.max(1, Math.round(v('ts-terms'))));
  const nRow  = document.getElementById('ts-n-row');
  nRow.style.display = fn === 'binomial' ? 'flex' : 'none';
  const nExp = v('ts-n');
  if (isNaN(x)) return;
  let approx = 0, exact;

  if (fn === 'sin')      { exact = Math.sin(x);   for (let k = 0; k < terms; k++) approx += Math.pow(-1, k) * Math.pow(x, 2*k+1) / factorial(2*k+1); }
  else if (fn === 'cos') { exact = Math.cos(x);   for (let k = 0; k < terms; k++) approx += Math.pow(-1, k) * Math.pow(x, 2*k)   / factorial(2*k); }
  else if (fn === 'exp') { exact = Math.exp(x);   for (let k = 0; k < terms; k++) approx += Math.pow(x, k) / factorial(k); }
  else if (fn === 'ln1p') {
    if (x <= -1) { res('ts-body', [['Error', 'ln(1+x) requires x > −1', '']]); return; }
    exact = Math.log(1 + x);
    for (let k = 1; k <= terms; k++) approx += Math.pow(-1, k + 1) * Math.pow(x, k) / k;
  } else if (fn === 'binomial') {
    const n = isNaN(nExp) ? 2 : nExp;
    if (Math.abs(x) >= 1) { res('ts-body', [['Error', 'Binomial series converges for |x| < 1', '']]); return; }
    exact = Math.pow(1 + x, n);
    approx = 1;
    for (let k = 1; k <= terms; k++) { let c = 1; for (let j = 0; j < k; j++) c *= (n - j) / (j + 1); approx += c * Math.pow(x, k); }
  }

  const err    = Math.abs(exact - approx);
  const relErr = Math.abs(err / exact) * 100;
  res('ts-body', [
    ['Exact value',                    fmt(exact,  8), fn],
    ['Taylor approx (' + terms + ' terms)', fmt(approx, 8), ''],
    ['Absolute error',  err    < 1e-14 ? '< 1×10⁻¹⁴' : fmt(err),    ''],
    ['Relative error',  relErr < 1e-12 ? '< 1×10⁻¹⁰%' : fmt(relErr) + '%', ''],
  ]);
}

/* ── Vector calculus (numerical, via central differences) ─────── */

function vcGrad() {
  const fxp = v('vg-xp'), fxm = v('vg-xm'), fyp = v('vg-yp'), fym = v('vg-ym');
  const fzp = v('vg-zp'), fzm = v('vg-zm'), h = v('vg-h');
  if ([fxp,fxm,fyp,fym,fzp,fzm,h].some(isNaN) || !h) return;
  const gx = (fxp - fxm) / (2 * h), gy = (fyp - fym) / (2 * h), gz = (fzp - fzm) / (2 * h);
  const mag = Math.sqrt(gx * gx + gy * gy + gz * gz);
  res('vg-body', [
    ['∂f/∂x',               fmt(gx), '(f(x+h,y,z)−f(x−h,y,z))/(2h)'],
    ['∂f/∂y',               fmt(gy), ''],
    ['∂f/∂z',               fmt(gz), ''],
    ['|∇f| (magnitude)',    fmt(mag), '√(gx²+gy²+gz²)'],
    ['Unit gradient dir.', '(' + fmt(gx/mag) + ', ' + fmt(gy/mag) + ', ' + fmt(gz/mag) + ')', ''],
  ]);
}

function vcDiv() {
  const fxp = v('vd-fxp'), fxm = v('vd-fxm'), fyp = v('vd-fyp'), fym = v('vd-fym');
  const fzp = v('vd-fzp'), fzm = v('vd-fzm'), h = v('vd-h');
  if ([fxp,fxm,fyp,fym,fzp,fzm,h].some(isNaN) || !h) return;
  const dFx = (fxp - fxm) / (2 * h), dFy = (fyp - fym) / (2 * h), dFz = (fzp - fzm) / (2 * h);
  const div = dFx + dFy + dFz;
  res('vd-body', [
    ['∂Fx/∂x',       fmt(dFx), ''],
    ['∂Fy/∂y',       fmt(dFy), ''],
    ['∂Fz/∂z',       fmt(dFz), ''],
    ['∇·F (divergence)', fmt(div), 'sum of partials'],
    ['Interpretation', div > 0 ? 'Source (positive divergence)' : div < 0 ? 'Sink (negative divergence)' : 'Solenoidal field', ''],
  ]);
}

function vcCurl() {
  const h = v('vc-h');
  const fzyp = v('vc-fzyp'), fzym = v('vc-fzym'), fyzp = v('vc-fyzp'), fyzm = v('vc-fyzm');
  const fxzp = v('vc-fxzp'), fxzm = v('vc-fxzm'), fzxp = v('vc-fzxp'), fzxm = v('vc-fzxm');
  const fyxp = v('vc-fyxp'), fyxm = v('vc-fyxm'), fxyp = v('vc-fxyp'), fxym = v('vc-fxym');
  if (!h) return;
  const cx = (fzyp - fzym) / (2 * h) - (fyzp - fyzm) / (2 * h);
  const cy = (fxzp - fxzm) / (2 * h) - (fzxp - fzxm) / (2 * h);
  const cz = (fyxp - fyxm) / (2 * h) - (fxyp - fxym) / (2 * h);
  const mag = Math.sqrt(cx * cx + cy * cy + cz * cz);
  res('vcc-body', [
    ['(∇×F)_x',           fmt(cx),  '∂Fz/∂y − ∂Fy/∂z'],
    ['(∇×F)_y',           fmt(cy),  '∂Fx/∂z − ∂Fz/∂x'],
    ['(∇×F)_z',           fmt(cz),  '∂Fy/∂x − ∂Fx/∂y'],
    ['|∇×F| (curl mag.)', fmt(mag), ''],
    ['Interpretation', mag < 1e-10 ? 'Irrotational field (curl ≈ 0)' : 'Rotational field', ''],
  ]);
}
