/* ════════════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════════════ */
function g(id){ return document.getElementById(id); }
function v(id){ return parseFloat(g(id).value); }
function su(id){ return parseFloat(g(id)?.value || 1); }

function fmtSci(n, dp=4){
  if(n===undefined||isNaN(n)) return '—';
  if(n===0) return '0';
  const abs=Math.abs(n);
  if(abs>=0.001&&abs<1e6) return n.toPrecision(dp);
  return n.toExponential(3);
}
function fmtN(n,dp=4){
  if(isNaN(n)||n===undefined) return '—';
  return fmtSci(n,dp);
}

function showOut(id, rows, note){
  const el = g(id);
  const body = g(id+'-body');
  let html = rows.map(r=>{
    const cls = r.cls ? `class="out-val ${r.cls}"` : 'class="out-val"';
    return `<div class="out-row"><span class="out-label">${r.label}</span><span ${cls}>${r.val} ${r.unit||''}</span></div>`;
  }).join('');
  if(note) html += `<div class="out-note">${note}</div>`;
  body.innerHTML = html;
  el.classList.add('visible');
}

function errOut(id, msg){
  const el=g(id); const body=g(id+'-body');
  body.innerHTML=`<div class="err-msg">⚠ ${msg}</div>`;
  el.classList.add('visible');
}

/* ── Tab system ──────────────────────────────────────── */
function setTab(group, tab){
  const tabs  = document.querySelectorAll(`#${group}-tabs .tab`);
  const panels= document.querySelectorAll(`[id^="${group}-"]`);
  tabs.forEach(t=>t.classList.toggle('active', t.onclick.toString().includes(`'${tab}'`)));
  document.querySelectorAll(`[id^="${group}-"]`).forEach(p=>{
    if(p.classList.contains('tab-panel')) p.classList.toggle('active', p.id===`${group}-${tab}`);
  });
}

/* ── Sidebar nav scrollTo ─────────────────────────────── */
function scrollToSection(id){
  const el=document.getElementById(id);
  if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); }
  document.querySelectorAll('.nav-item').forEach(n=>n.classList.remove('active'));
  event.target.closest('.nav-item').classList.add('active');
}
window.addEventListener('scroll',()=>{
  const sections=['yplus','reynolds','turbulence','boundary-layer','pipe-flow','non-newt','pulsatile','porous','elastic','stress','beam','units'];
  let current=sections[0];
  sections.forEach(id=>{const el=document.getElementById(id);if(el&&el.getBoundingClientRect().top<200)current=id;});
  document.querySelectorAll('.nav-item').forEach(n=>{
    const matches=n.onclick&&n.onclick.toString().includes(`'${current}'`);
    n.classList.toggle('active',matches);
  });
},{passive:true});

/* ════════════════════════════════════════════════════════
   §1  Y+ CALCULATOR
════════════════════════════════════════════════════════ */
function ypCalc(){
  const U   = v('yp-U')  * su('yp-U-u');
  const L   = v('yp-L')  * su('yp-L-u');
  const rho = v('yp-rho')* su('yp-rho-u');
  const mu  = v('yp-mu') * su('yp-mu-u');
  const yp  = v('yp-yplus');
  if([U,L,rho,mu,yp].some(x=>!x||x<=0)) return errOut('yp-out','All values must be positive.');
  const nu  = mu/rho;
  const Re  = rho*U*L/mu;
  const geom= document.querySelector('#yp-tabs .tab.active')?.textContent||'Pipe';
  let Cf;
  if(geom.includes('Plate')) Cf=0.0592*Math.pow(Re,-0.2);
  else if(geom.includes('External')) Cf=0.074*Math.pow(Re,-0.2);
  else Cf=0.079*Math.pow(Re,-0.25); // pipe
  const tau_w = Cf*0.5*rho*U*U;
  const u_tau = Math.sqrt(tau_w/rho);
  const dy    = yp*nu/u_tau;
  const regime= Re<2300?'Laminar':Re<4000?'Transitional':'Turbulent';
  const ypCheck= u_tau*dy/nu;
  showOut('yp-out',[
    {label:'Reynolds number Re',   val:fmtN(Re,5),     unit:''},
    {label:'Flow regime',          val:regime,          unit:'', cls:Re<2300?'warn':''},
    {label:'Skin friction Cƒ',     val:fmtN(Cf),        unit:''},
    {label:'Wall shear stress τ_w',val:fmtN(tau_w),     unit:'Pa'},
    {label:'Friction velocity u_τ',val:fmtN(u_tau),     unit:'m/s'},
    {label:'Δy (SI)',              val:fmtN(dy),         unit:'m',  cls:'good'},
    {label:'Δy',                   val:fmtN(dy*1000),    unit:'mm', cls:'good'},
    {label:'Δy',                   val:fmtN(dy*1e6),     unit:'μm'},
    {label:'Verification y⁺',      val:fmtN(ypCheck),    unit:''},
  ],'Δy is the first cell wall distance. Recommended: y⁺≈1 for wall-resolving k-ω SST, y⁺≈30–300 for wall functions.');
}

/* ════════════════════════════════════════════════════════
   §2  DIMENSIONLESS NUMBERS
════════════════════════════════════════════════════════ */
function reCalc(){
  const U=v('re-U')*su('re-U-u'), L=v('re-L')*su('re-L-u');
  const rho=v('re-rho')*su('re-rho-u'), mu=v('re-mu')*su('re-mu-u');
  if([U,L,rho,mu].some(x=>!x||x<=0)) return errOut('re-out','All values required.');
  const Re=rho*U*L/mu;
  const regime=Re<2300?'Laminar — Hagen-Poiseuille applies':Re<4000?'Transitional — caution!':'Turbulent — use turbulence model';
  const cls=Re<2300?'good':Re<4000?'warn':'';
  showOut('re-out',[
    {label:'Reynolds number',val:fmtN(Re,5),unit:''},
    {label:'Flow regime',val:regime,unit:'',cls},
    {label:'Kinematic viscosity ν',val:fmtN(mu/rho),unit:'m²/s'},
  ]);
}

function maCalc(){
  const U=v('ma-U'); const sel=g('ma-T-u');
  let T=v('ma-T');
  const opt=sel.options[sel.selectedIndex];
  if(opt.dataset.offset) T=T-(-parseFloat(opt.dataset.offset));
  else if(opt.dataset.scale){ T=T*parseFloat(opt.dataset.scale)+parseFloat(opt.dataset.offset); }
  const UmS=U*su('ma-U-u'), gam=v('ma-gamma');
  const R_air=287, a=Math.sqrt(gam*R_air*T), Ma=UmS/a;
  const regime=Ma<0.3?'Incompressible (Ma<0.3)':Ma<0.8?'Subsonic':Ma<1.2?'Transonic':'Supersonic / Hypersonic';
  showOut('ma-out',[
    {label:'Speed of sound a',val:fmtN(a),unit:'m/s'},
    {label:'Mach number Ma',val:fmtN(Ma),unit:'',cls:Ma<0.3?'good':Ma>1?'bad':'warn'},
    {label:'Regime',val:regime,unit:''},
  ],'For Ma<0.3 compressibility effects <1% — incompressible CFD is valid.');
}

function stCalc(){
  const f=v('st-f')*su('st-f-u'), L=v('st-L')*su('st-L-u'), U=v('st-U')*su('st-U-u');
  if([f,L,U].some(x=>!x||x<=0)) return errOut('st-out','All values required.');
  const St=f*L/U;
  showOut('st-out',[
    {label:'Strouhal number St',val:fmtN(St),unit:''},
    {label:'Period T',val:fmtN(1/f),unit:'s'},
    {label:'Convection time L/U',val:fmtN(L/U),unit:'s'},
  ],'St≈0.2 for vortex shedding from a cylinder (100<Re<100000).');
}

function deCalc(){
  const Re=v('de-Re'), r=v('de-r')*su('de-r-u'), R=v('de-R')*su('de-R-u');
  if([Re,r,R].some(x=>!x||x<=0)) return errOut('de-out','All values required.');
  const De=Re*Math.sqrt(r/R);
  const regime=De<36?'No secondary vortices':De<64?'Weak Dean vortices':'Strong Dean vortices (4-vortex pattern)';
  showOut('de-out',[
    {label:'Dean number De',val:fmtN(De),unit:'',cls:De>36?'warn':'good'},
    {label:'Curvature ratio r/R',val:fmtN(r/R),unit:''},
    {label:'Secondary flow regime',val:regime,unit:''},
  ]);
}

function peCalc(){
  const U=v('pe-U')*su('pe-U-u'), L=v('pe-L')*su('pe-L-u'), D=v('pe-D')*su('pe-D-u');
  if([U,L,D].some(x=>!x||x<=0)) return errOut('pe-out','All values required.');
  const Pe=U*L/D;
  showOut('pe-out',[
    {label:'Péclet number Pe',val:fmtN(Pe),unit:''},
    {label:'Diffusion time L²/D',val:fmtN(L*L/D),unit:'s'},
    {label:'Convection time L/U',val:fmtN(L/U),unit:'s'},
    {label:'Dominant transport',val:Pe>1?'Advection dominated':'Diffusion dominated',unit:''},
  ]);
}

/* ════════════════════════════════════════════════════════
   §3  TURBULENCE BCs
════════════════════════════════════════════════════════ */
function tbCalc(){
  const U=v('tb-U')*su('tb-U-u'), I=v('tb-I')/100;
  const l=v('tb-l')*su('tb-l-u'), nu=v('tb-nu')*su('tb-nu-u');
  if([U,I,l,nu].some(x=>!x||x<=0)) return errOut('tb-out','All values required.');
  const Cmu=0.09;
  const k  = 1.5*Math.pow(U*I,2);
  const eps= Math.pow(Cmu,0.75)*Math.pow(k,1.5)/l;
  const om = Math.sqrt(k)/(Math.pow(Cmu,0.25)*l);
  const nut= k/om;
  const muT= nut/nu;
  showOut('tb-out',[
    {label:'TKE k',               val:fmtN(k),    unit:'m²/s²', cls:'good'},
    {label:'Dissipation ε',       val:fmtN(eps),   unit:'m²/s³', cls:'good'},
    {label:'Spec. dissipation ω', val:fmtN(om),    unit:'1/s',   cls:'good'},
    {label:'Eddy viscosity νₜ',   val:fmtN(nut),   unit:'m²/s',  cls:'good'},
    {label:'Viscosity ratio νₜ/ν',val:fmtN(muT),   unit:''},
    {label:'Turbulent Re_t',      val:fmtN(k*k/(nu*eps)), unit:''},
  ],'Use k & ε for k-ε solvers. Use k & ω for k-ω SST (ANSYS Fluent, OpenFOAM). νₜ for Spalart-Allmaras.');
}

function tiCalc(){
  const Re=v('ti-Re');
  if(!Re||Re<=0) return errOut('ti-out','Enter Reynolds number.');
  const Ipipe=0.16*Math.pow(Re,-1/8)*100;
  const Ibl=0.4/Math.log(Re)*100;
  showOut('ti-out',[
    {label:'Intensity I (pipe, fully developed)',val:fmtN(Ipipe)+'%',unit:''},
    {label:'Intensity I (flat plate BL, approx)',val:fmtN(Ibl)+'%',unit:''},
    {label:'Typical free-stream',val:'0.1 – 1 %',unit:'(wind tunnel/clin. inlet)'},
  ],'Higher I = more turbulent mixing. Use measured values when available.');
}

function lsCalc(){
  const fac=parseFloat(g('ls-type').value);
  const L=v('ls-L')*su('ls-L-u');
  if(!L||L<=0) return errOut('ls-out','Enter dimension.');
  const ls=fac*L;
  showOut('ls-out',[
    {label:'Length scale ℓ',val:fmtN(ls),unit:'m'},
    {label:'ℓ (mm)',val:fmtN(ls*1000),unit:'mm'},
  ],'The turbulent length scale sets the size of energy-containing eddies. Multiply by 1/κ≈0.41 for mixing length.');
}

/* ════════════════════════════════════════════════════════
   §4  BOUNDARY LAYER
════════════════════════════════════════════════════════ */
function blCalc(){
  const x=v('bl-x')*su('bl-x-u'), U=v('bl-U')*su('bl-U-u'), nu=v('bl-nu')*su('bl-nu-u');
  if([x,U,nu].some(n=>!n||n<=0)) return errOut('bl-out','All values required.');
  const Rex=U*x/nu;
  const lam=Rex<5e5;
  let rows;
  if(lam){
    const d=5*x/Math.sqrt(Rex), ds=1.72*x/Math.sqrt(Rex), th=0.664*x/Math.sqrt(Rex), Cf=0.664/Math.sqrt(Rex);
    rows=[
      {label:'Re_x',val:fmtN(Rex,4),unit:'',cls:'good'},
      {label:'Regime',val:'Laminar (Blasius)',unit:''},
      {label:'δ (99% thickness)',val:fmtN(d*1000),unit:'mm'},
      {label:'δ* (displacement)',val:fmtN(ds*1000),unit:'mm'},
      {label:'θ (momentum)',val:fmtN(th*1000),unit:'mm'},
      {label:'Cƒ (local skin friction)',val:fmtN(Cf),unit:''},
      {label:'H = δ*/θ (shape factor)',val:fmtN(ds/th),unit:''},
    ];
  } else {
    const d=0.37*x/Math.pow(Rex,0.2), Cf=0.0592/Math.pow(Rex,0.2);
    rows=[
      {label:'Re_x',val:fmtN(Rex,4),unit:'',cls:'warn'},
      {label:'Regime',val:'Turbulent (Schlichting)',unit:''},
      {label:'δ (99% thickness)',val:fmtN(d*1000),unit:'mm'},
      {label:'δ* (approx)',val:fmtN(d/8*1000),unit:'mm'},
      {label:'Cƒ (local)',val:fmtN(Cf),unit:''},
    ];
  }
  showOut('bl-out',rows,'Transition typically occurs at Re_x ≈ 5×10⁵. Blasius solution is exact for laminar flat plate.');
}

function leCalc(){
  const D=v('le-D')*su('le-D-u'), Re=v('le-Re'), Pr=v('le-Pr');
  if([D,Re].some(n=>!n||n<=0)) return errOut('le-out','D and Re required.');
  const lam=Re<2300;
  const Lhyd=lam?0.06*Re*D:4.4*Math.pow(Re,1/6)*D;
  const Lth=0.05*Re*Pr*D;
  showOut('le-out',[
    {label:'Regime',val:lam?'Laminar':'Turbulent',unit:''},
    {label:'Hydrodynamic entry L_e',val:fmtN(Lhyd),unit:'m'},
    {label:'L_e / D',val:fmtN(Lhyd/D),unit:''},
    ...(Pr?[{label:'Thermal entry L_t (lam.)',val:fmtN(Lth),unit:'m'},{label:'L_t / D',val:fmtN(Lth/D),unit:''}]:[]),
  ],'Ensure pipe is longer than L_e for fully-developed flow assumption in simulations.');
}

/* ════════════════════════════════════════════════════════
   §5  PIPE FLOW
════════════════════════════════════════════════════════ */
function hpCalc(){
  const R=v('hp-R')*su('hp-R-u'), L=v('hp-L')*su('hp-L-u'), mu=v('hp-mu')*su('hp-mu-u');
  const tab=document.querySelector('#hp-tabs .tab.active')?.textContent||'';
  let Q,dP,U,tau;
  if(tab.includes('ΔP')){
    dP=v('hp-dP')*su('hp-dP-u');
    Q=Math.PI*Math.pow(R,4)*dP/(8*mu*L);
    U=R*R*dP/(4*mu*L);
    tau=R*dP/(2*L);
  } else {
    Q=v('hp-Q')*su('hp-Q-u');
    dP=8*mu*L*Q/(Math.PI*Math.pow(R,4));
    U=Q/(Math.PI*R*R);
    tau=4*mu*U/R;
  }
  const Re=2*rhoHp()*U*R/mu;
  function rhoHp(){return 1060;}
  if(Q<=0||dP<=0) return errOut('hp-out','Check inputs.');
  const Re2=2*1060*U*R/mu;
  showOut('hp-out',[
    {label:'Flow rate Q',val:fmtN(Q*1e6),unit:'mL/s'},
    {label:'Q',val:fmtN(Q),unit:'m³/s'},
    {label:'Mean velocity U',val:fmtN(U),unit:'m/s'},
    {label:'Pressure drop ΔP',val:fmtN(dP),unit:'Pa'},
    {label:'ΔP',val:fmtN(dP/133.322),unit:'mmHg'},
    {label:'Wall shear stress τ_w',val:fmtN(tau),unit:'Pa'},
    {label:'Re (blood density est.)',val:fmtN(Re2),unit:'',cls:Re2<2300?'good':'bad'},
    {label:'Max velocity (centre)',val:fmtN(2*U),unit:'m/s'},
  ],'Hagen-Poiseuille assumes laminar, steady, Newtonian, fully-developed flow. Verify Re < 2300.');
}

function dwCalc(){
  const U=v('dw-U')*su('dw-U-u'), D=v('dw-D')*su('dw-D-u');
  const L=v('dw-L')*su('dw-L-u'), rho=v('dw-rho')*su('dw-rho-u');
  const mu=v('dw-mu')*su('dw-mu-u'), eps=v('dw-eps')*su('dw-eps-u');
  if([U,D,L,rho,mu].some(x=>!x||x<=0)) return errOut('dw-out','All values required.');
  const Re=rho*U*D/mu;
  let f;
  if(Re<2300){ f=64/Re; }
  else {
    // Colebrook-White iteration
    f=0.02;
    for(let i=0;i<50;i++){
      const rhs=-2*Math.log10(eps/(3.7*D)+2.51/(Re*Math.sqrt(f)));
      f=1/(rhs*rhs);
    }
  }
  const dP=f*(L/D)*0.5*rho*U*U;
  const hf=f*(L/D)*U*U/(2*9.81);
  showOut('dw-out',[
    {label:'Reynolds number Re',val:fmtN(Re),unit:''},
    {label:'Friction factor f',val:fmtN(f),unit:''},
    {label:'Pressure drop ΔP',val:fmtN(dP),unit:'Pa'},
    {label:'ΔP',val:fmtN(dP/1000),unit:'kPa'},
    {label:'ΔP',val:fmtN(dP/133.322),unit:'mmHg'},
    {label:'Head loss h_f',val:fmtN(hf),unit:'m'},
    {label:'Dynamic pressure',val:fmtN(0.5*rho*U*U),unit:'Pa'},
  ],'Colebrook-White equation solved iteratively for turbulent regime. For smooth pipes (ε=0) approaches Blasius correlation.');
}

function dhCalc(){
  const tab=document.querySelector('#dh-tabs .tab.active')?.textContent||'';
  let A,P,Dh;
  if(tab.includes('Rect')){
    const w=v('dh-w')*su('dh-w-u'), h=v('dh-h')*su('dh-h-u');
    A=w*h; P=2*(w+h); Dh=4*A/P;
    showOut('dh-out',[{label:'Hydraulic diameter D_h',val:fmtN(Dh*1000),unit:'mm'},{label:'D_h (m)',val:fmtN(Dh),unit:'m'},{label:'Area A',val:fmtN(A*1e6),unit:'mm²'},{label:'Wetted perimeter P',val:fmtN(P*1000),unit:'mm'},{label:'Aspect ratio w/h',val:fmtN(w/h),unit:''}]);
  } else if(tab.includes('Annul')){
    const Do=v('dh-Do')*su('dh-Do-u'), Di=v('dh-Di')*su('dh-Di-u');
    Dh=Do-Di;
    showOut('dh-out',[{label:'Hydraulic diameter D_h',val:fmtN(Dh*1000),unit:'mm'},{label:'D_h = D_o − D_i',val:fmtN(Dh),unit:'m'}]);
  } else {
    const b=v('dh-b')*su('dh-b-u'), h=v('dh-ht')*su('dh-ht-u');
    const hyp=Math.sqrt(b*b/4+h*h);
    A=0.5*b*h; P=b+2*hyp; Dh=4*A/P;
    showOut('dh-out',[{label:'Hydraulic diameter D_h',val:fmtN(Dh*1000),unit:'mm'},{label:'Area A',val:fmtN(A*1e6),unit:'mm²'},{label:'Perimeter P',val:fmtN(P*1000),unit:'mm'}]);
  }
}

/* ════════════════════════════════════════════════════════
   §6  NON-NEWTONIAN
════════════════════════════════════════════════════════ */
function plCalc(){
  const K=v('pl-K'), n=v('pl-n'), gd=v('pl-gd');
  if([K,n,gd].some(x=>isNaN(x)||x<=0)) return errOut('pl-out','All values required.');
  const mu=K*Math.pow(gd,n-1), tau=K*Math.pow(gd,n);
  showOut('pl-out',[
    {label:'Eff. viscosity μ_eff',val:fmtN(mu*1000),unit:'mPa·s'},
    {label:'μ_eff (Pa·s)',val:fmtN(mu),unit:'Pa·s'},
    {label:'Shear stress τ',val:fmtN(tau),unit:'Pa'},
    {label:'Behaviour',val:n<0.99?'Shear-thinning':n>1.01?'Shear-thickening':'Newtonian',unit:''},
  ]);
}

function caCalc(){
  const mu0=v('ca-mu0')*su('ca-mu0-u'), muinf=v('ca-muinf')*su('ca-muinf-u');
  const lam=v('ca-lam'), n=v('ca-n'), gd=v('ca-gd');
  if([mu0,muinf,lam,n,gd].some(x=>isNaN(x)||x<=0)) return errOut('ca-out','All values required.');
  const mu=muinf+(mu0-muinf)*Math.pow(1+Math.pow(lam*gd,2),(n-1)/2);
  const tau=mu*gd;
  const muN=0.0035; // Newtonian blood approx
  showOut('ca-out',[
    {label:'Eff. viscosity μ_eff',val:fmtN(mu*1000),unit:'mPa·s',cls:'good'},
    {label:'μ_eff (Pa·s)',val:fmtN(mu),unit:'Pa·s'},
    {label:'Shear stress τ',val:fmtN(tau),unit:'Pa'},
    {label:'vs Newtonian (3.5 mPa·s)',val:fmtN((mu/muN-1)*100)+'%',unit:'difference',cls:Math.abs(mu-muN)/muN>0.05?'warn':'good'},
    {label:'Low-shear region?',val:gd<100?'⚠ Yes — non-Newtonian significant':'OK — Newtonian valid',unit:'',cls:gd<100?'warn':'good'},
  ],'Cho & Kensey (1991) blood parameters. At γ̇ > 100 s⁻¹ Carreau converges to ≈3.5 mPa·s.');
}

function nvCalc(){
  const U=v('nv-U')*su('nv-U-u'), R=v('nv-R')*su('nv-R-u');
  if([U,R].some(x=>!x||x<=0)) return errOut('nv-out','All values required.');
  const gdMean=4*U/(R); // 8U/D = 4U/R for pipe Newtonian
  const cls=gdMean<100?'bad':gdMean<500?'warn':'good';
  showOut('nv-out',[
    {label:'Mean wall shear rate γ̇_w',val:fmtN(gdMean),unit:'s⁻¹',cls},
    {label:'Newtonian valid?',val:gdMean>=100?'✓ Yes (γ̇ > 100 s⁻¹)':'⚠ No — use Carreau/Quemada',unit:'',cls},
    {label:'Recommendation',val:gdMean<100?'Use non-Newtonian model':'Newtonian blood acceptable',unit:''},
  ],'Blood behaves non-Newtonian below ~100 s⁻¹. This is relevant in vessel segments with low flow or recirculation zones.');
}

/* ════════════════════════════════════════════════════════
   §7  PULSATILE / WSS
════════════════════════════════════════════════════════ */
function woCalc(){
  const R=v('wo-R')*su('wo-R-u'), f=v('wo-f')*su('wo-f-u'), nu=v('wo-nu')*su('wo-nu-u');
  if([R,f,nu].some(x=>!x||x<=0)) return errOut('wo-out','All values required.');
  const omega=2*Math.PI*f, alpha=R*Math.sqrt(omega/nu);
  const regime=alpha<2?'Quasi-steady — Poiseuille profile applies':alpha<10?'Transitional pulsatile':'Inertia-dominated — plug-like profile';
  showOut('wo-out',[
    {label:'Womersley number α',val:fmtN(alpha),unit:'',cls:alpha>2?'warn':'good'},
    {label:'Angular frequency ω',val:fmtN(omega),unit:'rad/s'},
    {label:'Flow regime',val:regime,unit:''},
    {label:'Oscillatory BL thickness δ',val:fmtN(Math.sqrt(2*nu/omega)*1000),unit:'mm'},
  ],'Reference: Aorta α≈12–22, Coronary α≈3–6, Cerebral artery α≈2–5, Capillary α≪1.');
}

function wssCalc(){
  const R=v('wss-R')*su('wss-R-u'), mu=v('wss-mu')*su('wss-mu-u');
  const tab=document.querySelector('#wss-tabs .tab.active')?.textContent||'';
  let tau,gd,Q2;
  if(tab.includes('Flow')){
    const Q=v('wss-Q')*su('wss-Q-u');
    tau=4*mu*Q/(Math.PI*Math.pow(R,3));
    gd=4*Q/(Math.PI*Math.pow(R,3));
    Q2=Q;
  } else {
    const dP=v('wss-dP')*su('wss-dP-u'), L=v('wss-L')*su('wss-L-u');
    tau=R*dP/(2*L);
    gd=tau/mu;
    Q2=Math.PI*Math.pow(R,4)*dP/(8*mu*L);
  }
  const Umean=Q2/(Math.PI*R*R);
  showOut('wss-out',[
    {label:'Wall shear stress τ_w',val:fmtN(tau),unit:'Pa',cls:'good'},
    {label:'Wall shear rate γ̇_w',val:fmtN(gd),unit:'s⁻¹'},
    {label:'Mean velocity U',val:fmtN(Umean),unit:'m/s'},
    {label:'Physiological range (artery)',val:'0.5 – 4 Pa (1–10 Pa coronary)',unit:''},
    {label:'WSS status',val:tau<0.4?'Low WSS — atherogenic risk':tau>10?'High WSS — stenosis/calcification':'Normal range',unit:'',cls:tau<0.4?'bad':tau>10?'warn':'good'},
  ],'Low WSS (<0.5 Pa) correlates with plaque development. High WSS (>10 Pa) associated with vulnerable plaque and calcific remodeling.');
}

function osiCalc(){
  const raw=g('osi-data').value.trim();
  if(!raw) return errOut('osi-out','Enter WSS time series data.');
  const vals=raw.split(/[\s,]+/).map(Number).filter(x=>!isNaN(x));
  if(vals.length<3) return errOut('osi-out','Need at least 3 data points.');
  const intTau=vals.reduce((a,b)=>a+b,0);
  const intAbsTau=vals.reduce((a,b)=>a+Math.abs(b),0);
  const OSI=0.5*(1-Math.abs(intTau)/intAbsTau);
  const TAWSS=intAbsTau/vals.length;
  const maxWSS=Math.max(...vals.map(Math.abs));
  const minWSS=Math.min(...vals);
  showOut('osi-out',[
    {label:'TAWSS (time-averaged |τ|)',val:fmtN(TAWSS),unit:'Pa',cls:'good'},
    {label:'OSI',val:fmtN(OSI,4),unit:'',cls:OSI>0.2?'bad':OSI>0.1?'warn':'good'},
    {label:'OSI interpretation',val:OSI>0.3?'⚠ Highly oscillatory — pro-calcific':OSI>0.1?'Moderate oscillation':'Predominantly unidirectional',unit:''},
    {label:'|τ|_max',val:fmtN(maxWSS),unit:'Pa'},
    {label:'Cycle integral ∫τ dt',val:fmtN(intTau),unit:'Pa'},
    {label:'N data points',val:vals.length,unit:''},
  ],'OSI→0: unidirectional flow. OSI→0.5: fully reversing flow. OSI>0.2 marks pro-atherosclerotic / pro-calcific regions.');
}

/* ════════════════════════════════════════════════════════
   §8  POROUS MEDIA FLOW
════════════════════════════════════════════════════════ */
function pmCalc(){
  const tab = document.querySelector('#pm-tabs .tab.active')?.textContent || '';
  const useKC = tab.includes('Kozeny');
  const dP  = v('pm-dP') * su('pm-dP-u');
  const L   = v('pm-L')  * su('pm-L-u');
  const mu  = v('pm-mu') * su('pm-mu-u');
  const rho = v('pm-rho')* su('pm-rho-u');
  if([dP,L,mu,rho].some(x=>!x||x<=0)) return errOut('pm-out','ΔP, L, μ and ρ must be positive.');
  let k, dp;
  if(useKC){
    const eps = v('pm-eps');
    dp = v('pm-dp') * su('pm-dp-u');
    if(!eps||eps<=0||eps>=1) return errOut('pm-out','Porosity ε must be between 0 and 1.');
    if(!dp||dp<=0) return errOut('pm-out','Particle diameter d_p must be positive.');
    k = Math.pow(eps,3) * dp*dp / (180 * Math.pow(1-eps,2));
    const u   = k/mu * dP/L;
    const Rep = rho*u*dp/mu;
    showOut('pm-out',[
      {label:'Permeability k (K-C)',      val:fmtSci(k),           unit:'m²',    cls:'good'},
      {label:'k',                         val:fmtSci(k/9.869e-13), unit:'darcy'},
      {label:'Superficial velocity u',    val:fmtSci(u),           unit:'m/s',   cls:'good'},
      {label:'u',                         val:fmtSci(u*1e3),       unit:'mm/s'},
      {label:'u',                         val:fmtSci(u*1e6),       unit:'μm/s'},
      {label:'Pore Reynolds number Re_p', val:fmtSci(Rep,3),       unit:'',      cls:Rep<1?'good':Rep<10?'warn':'bad'},
      {label:'Darcy law valid?',          val:Rep<1?'✓ Yes (Re_p < 1)':Rep<10?'⚠ Marginal — check Forchheimer':'✗ No — use Forchheimer',unit:'',cls:Rep<1?'good':Rep<10?'warn':'bad'},
      {label:'Interstitial velocity u/ε', val:fmtSci(u/eps),        unit:'m/s'},
    ],'Kozeny–Carman: k = ε³d_p²/[180(1−ε)²]. Darcy valid when Re_p = ρud_p/μ ≪ 1. Saliva: μ ≈ 1.5 mPa·s, ρ ≈ 1000 kg/m³.');
  } else {
    k = v('pm-k-direct') * su('pm-k-direct-u');
    if(!k||k<=0) return errOut('pm-out','Enter a valid permeability k > 0.');
    const u = k/mu * dP/L;
    showOut('pm-out',[
      {label:'Permeability k (input)',    val:fmtSci(k),           unit:'m²',    cls:'good'},
      {label:'k',                         val:fmtSci(k/9.869e-13), unit:'darcy'},
      {label:'Superficial velocity u',    val:fmtSci(u),           unit:'m/s',   cls:'good'},
      {label:'u',                         val:fmtSci(u*1e3),       unit:'mm/s'},
      {label:'u',                         val:fmtSci(u*1e6),       unit:'μm/s'},
      {label:'Volume flux (= u)',         val:fmtSci(u),           unit:'m³/(m²·s)'},
    ],'Superficial (Darcy) velocity = volume flux per unit cross-section. Actual interstitial velocity ≈ u/ε.');
  }
}

function fchCalc(){
  const tab = document.querySelector('#fch-tabs .tab.active')?.textContent || '';
  const useKC = tab.includes('Kozeny');
  const u   = v('fch-u')  * su('fch-u-u');
  const mu  = v('fch-mu') * su('fch-mu-u');
  const rho = v('fch-rho')* su('fch-rho-u');
  if([u,mu,rho].some(x=>!x||x<=0)) return errOut('fch-out','Velocity, viscosity, and density must be positive.');
  let k, beta;
  if(useKC){
    const eps = v('fch-eps');
    const dp  = v('fch-dp') * su('fch-dp-u');
    if(!eps||eps<=0||eps>=1) return errOut('fch-out','Porosity ε must be between 0 and 1.');
    if(!dp||dp<=0) return errOut('fch-out','Particle diameter d_p must be positive.');
    k    = Math.pow(eps,3)*dp*dp / (180*Math.pow(1-eps,2));
    beta = 1.75*(1-eps) / (Math.pow(eps,3)*dp);
  } else {
    k    = v('fch-k') * su('fch-k-u');
    beta = parseFloat(document.getElementById('fch-beta').value);
    if(!k||k<=0) return errOut('fch-out','Enter valid permeability k > 0.');
    if(isNaN(beta)||beta<0) return errOut('fch-out','Enter valid Forchheimer β ≥ 0.');
  }
  const viscTerm  = mu/k * u;
  const inertTerm = beta * rho * u*u;
  const total     = viscTerm + inertTerm;
  const inertPct  = inertTerm/total*100;
  showOut('fch-out',[
    {label:'Permeability k',              val:fmtSci(k),           unit:'m²'},
    {label:'Forchheimer β',               val:fmtSci(beta),        unit:'m⁻¹'},
    {label:'Viscous term μ/k · u',        val:fmtSci(viscTerm),    unit:'Pa/m', cls:'good'},
    {label:'Inertial term β·ρ·u²',       val:fmtSci(inertTerm),   unit:'Pa/m', cls:inertPct>15?'warn':'good'},
    {label:'Total ΔP/L',                 val:fmtSci(total),        unit:'Pa/m', cls:'good'},
    {label:'Inertial contribution',       val:fmtSci(inertPct,3),  unit:'%',    cls:inertPct<5?'good':inertPct<20?'warn':'bad'},
    {label:'Plain Darcy sufficient?',     val:inertPct<5?'✓ Yes — inertial < 5%':inertPct<20?'⚠ Borderline — consider Forchheimer':'✗ No — Forchheimer required',unit:'',cls:inertPct<5?'good':inertPct<20?'warn':'bad'},
  ],'Ergun: β = 1.75(1−ε)/(ε³d_p). For slow biomedical filtration (μm/s–mm/s range) the inertial term is typically < 1% — plain Darcy is sufficient.');
}

/* ════════════════════════════════════════════════════════
   §9  ELASTIC CONSTANTS
════════════════════════════════════════════════════════ */
function elCalc(){
  const Ev=v('el-E'), nuv=v('el-nu'), Gv=v('el-G'), Kv=v('el-K'), lamv=v('el-lam');
  const EU=su('el-E-u'), GU=su('el-G-u'), KU=su('el-K-u'), lamU=su('el-lam-u');
  const have={E:!isNaN(Ev)&&Ev>0, nu:!isNaN(nuv)&&nuv>-1&&nuv<0.5, G:!isNaN(Gv)&&Gv>0, K:!isNaN(Kv)&&Kv>0, lam:!isNaN(lamv)};
  const Esi=have.E?Ev*EU:null, Gsi=have.G?Gv*GU:null, Ksi=have.K?Kv*KU:null, lamsi=have.lam?lamv*lamU:null;
  let E,nu,G,K,lam;
  if(have.E&&have.nu){E=Esi;nu=nuv;G=E/(2*(1+nu));K=E/(3*(1-2*nu));lam=E*nu/((1+nu)*(1-2*nu));}
  else if(have.E&&have.G){E=Esi;G=Gsi;nu=E/(2*G)-1;K=E*G/(3*(3*G-E));lam=G*(E-2*G)/(3*G-E);}
  else if(have.K&&have.G){K=Ksi;G=Gsi;E=9*K*G/(3*K+G);nu=(3*K-2*G)/(2*(3*K+G));lam=K-2*G/3;}
  else if(have.E&&have.K){E=Esi;K=Ksi;G=3*K*E/(9*K-E);nu=(3*K-E)/(6*K);lam=K-2*G/3;}
  else return errOut('el-out','Provide exactly two independent constants (E+ν recommended).');
  if(nu>=0.5||nu<=-1) return errOut('el-out','Poisson ratio out of physical range (−1 < ν < 0.5).');
  const M=lam+2*G;
  showOut('el-out',[
    {label:"Young's modulus E",val:fmtN(E/1e6),unit:'MPa',cls:'good'},
    {label:"Poisson's ratio ν",val:fmtN(nu),unit:'',cls:'good'},
    {label:'Shear modulus G',val:fmtN(G/1e6),unit:'MPa',cls:'good'},
    {label:'Bulk modulus K',val:fmtN(K/1e6),unit:'MPa',cls:'good'},
    {label:"Lamé's λ",val:fmtN(lam/1e6),unit:'MPa'},
    {label:'P-wave modulus M',val:fmtN(M/1e6),unit:'MPa'},
    {label:'G/E ratio',val:fmtN(G/E),unit:'(0.333 for ν=0)'},
  ],'Valid isotropic linear elasticity: −1 < ν < 0.5. Incompressible material: ν→0.5 (rubber, soft tissue).');
}

/* ════════════════════════════════════════════════════════
   §9  STRESS / FAILURE
════════════════════════════════════════════════════════ */
function vmCalc(){
  const Sy=v('vm-Sy');
  const tab=document.querySelector('#vm-tabs .tab.active')?.textContent||'';
  let svm, tresca;
  if(tab.includes('2D')){
    const su1=su('vm-sx-u');
    const sx=v('vm-sx')*su1, sy=v('vm-sy')*su1, txy=v('vm-txy')*su1;
    svm=Math.sqrt(sx*sx-sx*sy+sy*sy+3*txy*txy);
    const s1=0.5*(sx+sy)+Math.sqrt(0.25*(sx-sy)*(sx-sy)+txy*txy);
    const s2=0.5*(sx+sy)-Math.sqrt(0.25*(sx-sy)*(sx-sy)+txy*txy);
    tresca=Math.max(Math.abs(s1-s2),Math.abs(s1),Math.abs(s2));
  } else {
    const s1=v('vm-s1'), s2=v('vm-s2'), s3=v('vm-s3');
    svm=Math.sqrt(0.5*((s1-s2)*(s1-s2)+(s2-s3)*(s2-s3)+(s1-s3)*(s1-s3)));
    tresca=Math.max(Math.abs(s1-s2),Math.abs(s2-s3),Math.abs(s1-s3));
  }
  const SF=Sy/svm;
  showOut('vm-out',[
    {label:'Von Mises σ_vm',val:fmtN(svm),unit:'MPa',cls:'good'},
    {label:'Tresca σ_T',val:fmtN(tresca),unit:'MPa'},
    {label:'Safety factor (VM)',val:fmtN(SF),unit:'',cls:SF<1?'bad':SF<2?'warn':'good'},
    {label:'Status',val:SF>=1?`OK — ${fmtN(SF,3)}× safety`:'⚠ YIELDING — SF < 1',unit:'',cls:SF<1?'bad':'good'},
  ]);
}

function pvCalc(){
  const P=v('pv-P')*su('pv-P-u')/1000, ri=v('pv-ri')*su('pv-ri-u')/1000, ro=v('pv-ro')*su('pv-ro-u')/1000, Sy=v('pv-Sy');
  if([P,ri,ro].some(x=>!x||x<=0)||ro<=ri) return errOut('pv-out','Check radii (r_o > r_i).');
  const t=ro-ri, tRatio=t/ri;
  const Pmpa=P;
  let s_h,s_a;
  if(tRatio<0.1){
    s_h=Pmpa*ri/t*1e-3; s_a=Pmpa*ri/(2*t)*1e-3;
  } else {
    const A=Pmpa*ri*ri/(ro*ro-ri*ri)*1e-3;
    const B=Pmpa*ri*ri*ro*ro/(ro*ro-ri*ri)*1e-3;
    s_h=A+B/(ri*ri); s_a=A;
  }
  const svm=Math.sqrt(s_h*s_h-s_h*s_a+s_a*s_a);
  const SF=Sy/svm;
  showOut('pv-out',[
    {label:'t/r_i (wall ratio)',val:fmtN(tRatio),unit:'',cls:tRatio<0.1?'warn':'good'},
    {label:'Wall classification',val:tRatio<0.1?'Thin-wall':'Thick-wall (Lamé)',unit:''},
    {label:'Hoop stress σ_h (inner)',val:fmtN(s_h),unit:'MPa',cls:'good'},
    {label:'Axial stress σ_a',val:fmtN(s_a),unit:'MPa'},
    {label:'Von Mises σ_vm',val:fmtN(svm),unit:'MPa'},
    {label:'Safety factor',val:fmtN(SF),unit:'',cls:SF<1?'bad':SF<2?'warn':'good'},
  ]);
}

/* ════════════════════════════════════════════════════════
   §10  BEAM / SMA
════════════════════════════════════════════════════════ */
function bmCalc(){
  const F=v('bm-F')*su('bm-F-u'), L=v('bm-L')*su('bm-L-u');
  const E=v('bm-E')*su('bm-E-u'), I=v('bm-I')*su('bm-I-u');
  const c=v('bm-c')*su('bm-c-u');
  if([F,L,E,I,c].some(x=>!x||x<=0)) return errOut('bm-out','All values required.');
  const tab=document.querySelector('#beam-tabs .tab.active')?.textContent||'';
  let delta, sigma;
  if(tab.includes('Cantilever')){delta=F*L*L*L/(3*E*I);sigma=F*L*c/I;}
  else if(tab.includes('Simply')){delta=F*L*L*L/(48*E*I);sigma=F*L*c/(4*I);}
  else{delta=5*F*L*L*L*L/(384*E*I);sigma=F*L*L*c/(8*I);} // UDL w=F/L
  showOut('bm-out',[
    {label:'Max deflection δ',val:fmtN(delta*1000),unit:'mm',cls:'good'},
    {label:'δ (m)',val:fmtN(delta),unit:'m'},
    {label:'δ/L ratio',val:fmtN(delta/L),unit:'(L/'+fmtN(L/delta,3)+')'},
    {label:'Max bending stress σ',val:fmtN(sigma/1e6),unit:'MPa'},
  ],'δ/L < 1/300 for stiffness-critical structures. σ must be below yield for elastic behavior.');
}

function smaCalc(){
  const tab=document.querySelector('#sma-tabs .tab.active')?.textContent||'';
  let I,A,c;
  if(tab.includes('Rect')){
    const b=v('sma-b')*su('sma-b-u'), h=v('sma-h')*su('sma-h-u');
    I=b*h*h*h/12; A=b*h; c=h/2;
  } else if(tab.includes('Circle')){
    const D=v('sma-D')*su('sma-D-u');
    I=Math.PI*Math.pow(D,4)/64; A=Math.PI*D*D/4; c=D/2;
  } else {
    const Do=v('sma-Do')*su('sma-Do-u'), Di=v('sma-Di')*su('sma-Di-u');
    if(Di>=Do) return errOut('sma-out','D_i must be less than D_o.');
    I=Math.PI*(Math.pow(Do,4)-Math.pow(Di,4))/64; A=Math.PI*(Do*Do-Di*Di)/4; c=Do/2;
  }
  showOut('sma-out',[
    {label:'Second moment of area I',val:fmtN(I*1e12),unit:'mm⁴',cls:'good'},
    {label:'I (m⁴)',val:fmtN(I),unit:'m⁴'},
    {label:'Cross-sectional area A',val:fmtN(A*1e6),unit:'mm²'},
    {label:'Neutral axis c',val:fmtN(c*1000),unit:'mm'},
    {label:'Section modulus Z = I/c',val:fmtN(I/c*1e9),unit:'mm³'},
  ]);
}

/* ════════════════════════════════════════════════════════
   §11  UNIT CONVERTERS (generated)
════════════════════════════════════════════════════════ */
const CONV_SETS=[
  {title:'Pressure',icon:'🔴',base:'Pa',
   units:[['Pa',1],['kPa',1e-3],['MPa',1e-6],['bar',1e-5],['atm',1/101325],['psi',1/6894.76],['mmHg',1/133.322],['cmH₂O',1/98.0665],['inHg',1/3386.39]]},
  {title:'Dynamic Viscosity',icon:'🟡',base:'Pa·s',
   units:[['Pa·s',1],['mPa·s (cP)',1000],['μPa·s (μP)',1e6],['kPa·s',1e-3],['lbf·s/ft²',1/47.880],['poise',10]]},
  {title:'Kinematic Viscosity',icon:'🟠',base:'m²/s',
   units:[['m²/s',1],['mm²/s (cSt)',1e6],['cm²/s (St)',1e4],['ft²/s',10.7639],['in²/s',1550.0031]]},
  {title:'Velocity',icon:'🔵',base:'m/s',
   units:[['m/s',1],['mm/s',1000],['cm/s',100],['km/h',3.6],['ft/s',3.28084],['mph',2.23694],['in/s',39.3701]]},
  {title:'Length',icon:'⚪',base:'m',
   units:[['m',1],['cm',100],['mm',1000],['μm',1e6],['nm',1e9],['in',39.3701],['ft',3.28084],['mile',1/1609.34]]},
  {title:'Force',icon:'🟢',base:'N',
   units:[['N',1],['kN',0.001],['MN',1e-6],['lbf',0.224809],['kgf',0.101972],['dyne',1e5]]},
  {title:'Density',icon:'🟣',base:'kg/m³',
   units:[['kg/m³',1],['g/cm³',0.001],['g/mL',0.001],['kg/L',0.001],['lb/ft³',0.0624280],['lb/gal',0.00834540]]},
];

function buildConverters(){
  const wrap=g('unit-converters');
  CONV_SETS.forEach((cs,ci)=>{
    const id=`conv${ci}`;
    const inputRows=cs.units.map((u,ui)=>`
      <tr>
        <td class="unit-cell">${u[0]}</td>
        <td class="val-cell"><input type="number" id="${id}-${ui}" class="field" style="width:100%;padding:4px 8px;font-size:.8em" placeholder="0" oninput="convertUnit(${ci},${ui})"></td>
      </tr>`).join('');
    wrap.insertAdjacentHTML('beforeend',`
      <div class="card">
        <div class="card-header">
          <div class="card-icon">${cs.icon}</div>
          <div><div class="card-title">${cs.title}</div><div class="card-subtitle">Base unit: ${cs.base}</div></div>
        </div>
        <div class="card-body" style="padding:12px 14px">
          <table class="conv-table"><tbody>${inputRows}</tbody></table>
        </div>
      </div>`);
  });
}

function convertUnit(ci,srcUi){
  const cs=CONV_SETS[ci];
  const srcId=`conv${ci}-${srcUi}`;
  const srcVal=parseFloat(g(srcId).value);
  if(isNaN(srcVal)) return;
  const baseVal=srcVal/cs.units[srcUi][1]; // convert to base unit
  cs.units.forEach((_,ui)=>{
    if(ui===srcUi) return;
    const el=g(`conv${ci}-${ui}`);
    if(el) el.value=parseFloat((baseVal*cs.units[ui][1]).toPrecision(7));
  });
}

// Temperature converter (special — needs offset)
(function addTempConverter(){
  const wrap=g('unit-converters');
  wrap.insertAdjacentHTML('beforeend',`
    <div class="card">
      <div class="card-header">
        <div class="card-icon">🌡</div>
        <div><div class="card-title">Temperature</div><div class="card-subtitle">°C · °F · K · °R</div></div>
      </div>
      <div class="card-body" style="padding:12px 14px">
        <table class="conv-table"><tbody>
          <tr><td class="unit-cell">Celsius (°C)</td><td class="val-cell"><input type="number" id="temp-C" class="field" style="width:100%;padding:4px 8px;font-size:.8em" placeholder="0" oninput="convertTemp('C')"></td></tr>
          <tr><td class="unit-cell">Fahrenheit (°F)</td><td class="val-cell"><input type="number" id="temp-F" class="field" style="width:100%;padding:4px 8px;font-size:.8em" placeholder="32" oninput="convertTemp('F')"></td></tr>
          <tr><td class="unit-cell">Kelvin (K)</td><td class="val-cell"><input type="number" id="temp-K" class="field" style="width:100%;padding:4px 8px;font-size:.8em" placeholder="273.15" oninput="convertTemp('K')"></td></tr>
          <tr><td class="unit-cell">Rankine (°R)</td><td class="val-cell"><input type="number" id="temp-R" class="field" style="width:100%;padding:4px 8px;font-size:.8em" placeholder="491.67" oninput="convertTemp('R')"></td></tr>
        </tbody></table>
      </div>
    </div>`);
})();

function convertTemp(src){
  let C;
  if(src==='C') C=parseFloat(g('temp-C').value);
  else if(src==='F') C=(parseFloat(g('temp-F').value)-32)*5/9;
  else if(src==='K') C=parseFloat(g('temp-K').value)-273.15;
  else C=parseFloat(g('temp-R').value)*5/9-273.15;
  if(isNaN(C)) return;
  if(src!=='C') g('temp-C').value=C.toPrecision(7);
  if(src!=='F') g('temp-F').value=(C*9/5+32).toPrecision(7);
  if(src!=='K') g('temp-K').value=(C+273.15).toPrecision(7);
  if(src!=='R') g('temp-R').value=((C+273.15)*9/5).toPrecision(7);
}

/* ════════════════════════════════════════════════════════
   INIT
════════════════════════════════════════════════════════ */
buildConverters();
// Pre-compute defaults on load for better UX
window.addEventListener('load',()=>{ ypCalc(); reCalc(); tbCalc(); });


/* ── Compatibility shims for new sections ── */
function gv(id){ return v(id); }
function gu(id){ return su(id); }
function res(bodyId, rows){
  const body = document.getElementById(bodyId);
  if(!body) return;
  body.innerHTML = rows.map(([lbl,val,note])=>
    `<div class="out-row"><span class="out-label">${lbl}</span><span class="out-val">${val}${note?' <span style="font-size:.72em;opacity:.6;margin-left:6px">'+note+'</span>':''}</span></div>`
  ).join('');
  /* find parent output div and make visible */
  const out = body.closest('.output') || body.parentElement;
  if(out) out.classList.add('visible');
}


/* ════════════════════════════════════════════════════════
   AUTO-SOLVE UPGRADES
   Any starred field left blank → auto-computed from others
════════════════════════════════════════════════════════ */

/* Fourier flat wall — solve for any one blank field */
function htCondFlatAuto(){
  const ids=['htcf-k','htcf-A','htcf-L','htcf-dT'];
  const raw=ids.map(id=>document.getElementById(id).value);
  const units=[su('htcf-k-u'),su('htcf-A-u'),su('htcf-L-u'),1];
  const vals=raw.map((r,i)=>r===''||r===null?null:parseFloat(r)*units[i]);
  const blank=vals.findIndex(v=>v===null);
  const known=vals.filter(v=>v!==null).length;
  if(known<3){return;}  // need at least 3
  let [k_v,A_v,L_v,dT_v]=vals;
  // q = k*A*dT/L
  if(blank===0) k_v=(vals[4]||v('htcf-q-known')||NaN)*L_v/(A_v*dT_v);  // rarely used
  // Most useful: solve for q always, or for dT or L from q
  // Simple approach: just recompute q with the known inputs
  if(blank<0||blank===4){  // all known or q is the unknown (but there's no q input)
    htCondFlat(); return;
  }
  // Solve for the blank field:
  // q = k*A*dT/L → each variable:
  const q_target = v('htcf-q-target');  // optional target q
  if(!isNaN(q_target)&&q_target>0){
    if(blank===0) k_v=q_target*L_v/(A_v*dT_v);
    else if(blank===1) A_v=q_target*L_v/(k_v*dT_v);
    else if(blank===2) L_v=k_v*A_v*dT_v/q_target;
    else if(blank===3) dT_v=q_target*L_v/(k_v*A_v);
  }
  htCondFlat();
}

/* RC auto-solve: given any two of R, C, tau, fc → compute others */
function rcAutoCalc(){
  const R_raw=document.getElementById('rc-R').value;
  const C_raw=document.getElementById('rc-C').value;
  const R=R_raw===''?null:parseFloat(R_raw)*su('rc-R-u');
  const C=C_raw===''?null:parseFloat(C_raw)*su('rc-C-u');
  if(R&&C){ rcCalc(); return; }
  // Can't solve with just one known (τ=RC, fc=1/(2πRC) — two unknowns)
  const tauEl=document.getElementById('rc-tau-in');
  const fcEl=document.getElementById('rc-fc-in');
  const tau_in=tauEl?parseFloat(tauEl.value):NaN;
  const fc_in=fcEl?parseFloat(fcEl.value):NaN;
  if(!isNaN(tau_in)&&tau_in>0&&R){
    const C_calc=tau_in/R;
    document.getElementById('rc-C').value=(C_calc/su('rc-C-u')).toPrecision(4);
    rcCalc();
  } else if(!isNaN(fc_in)&&fc_in>0&&R){
    const C_calc=1/(2*Math.PI*R*fc_in);
    document.getElementById('rc-C').value=(C_calc/su('rc-C-u')).toPrecision(4);
    rcCalc();
  } else if(!isNaN(tau_in)&&tau_in>0&&C){
    const R_calc=tau_in/C;
    document.getElementById('rc-R').value=(R_calc/su('rc-R-u')).toPrecision(4);
    rcCalc();
  } else { rcCalc(); }
}

/* Beam auto-solve: leave P blank to get P from target deflection */
function bmAutoCalc(type){
  const Praw=document.getElementById('bm-P-'+type);
  const dRaw=document.getElementById('bm-del-'+type);  // target deflection input
  const E=v('bm-E-'+type)*su('bm-E-'+type+'-u');
  const L=v('bm-L-'+type)*su('bm-L-'+type+'-u');
  const I=v('bm-I-'+type)*su('bm-I-'+type+'-u');
  if(!Praw||!dRaw) { bmCalc(type); return; }
  const P_val=Praw.value; const d_val=dRaw.value;
  if((P_val===''||P_val===null)&&d_val&&E&&L&&I){
    const delta=parseFloat(d_val)*su('bm-del-'+type+'-u'||1);
    const coeff = type==='cant'?3:type==='ss'?48:384/5;
    const P_calc=delta*coeff*E*I/Math.pow(L,3);
    Praw.value=(P_calc/su('bm-P-'+type+'-u')).toPrecision(4);
  }
  bmCalc(type);
}

/* ════════════════════════════════════════════════════════
   HEAT TRANSFER
════════════════════════════════════════════════════════ */
function htCondFlat(){
  const k=gv('htcf-k')*gu('htcf-k-u'), A=gv('htcf-A')*gu('htcf-A-u');
  const L=gv('htcf-L')*gu('htcf-L-u'), dT=gv('htcf-dT');
  if(!k||!A||!L||isNaN(dT)) return;
  const q=k*A*dT/L, Rth=L/(k*A);
  res('htcf-body',[
    ['Heat flux q', q.toFixed(3)+' W', 'Q = k·A·ΔT/L'],
    ['Thermal resistance R_th', Rth.toExponential(3)+' K/W', 'R = L/(k·A)'],
    ['Heat flux q"', (q/A).toFixed(2)+' W/m²', 'q" = q/A']
  ]);
  (function(){const _e=document.getElementById('htcf-out');if(_e)_e.classList.add('visible')})();
}
function htCondCyl(){
  const k=gv('htcc-k'), L=gv('htcc-L'), r1=gv('htcc-r1'), r2=gv('htcc-r2'), dT=gv('htcc-dT');
  if(!k||!L||!r1||!r2||r2<=r1||isNaN(dT)) return;
  const q=2*Math.PI*k*L*dT/Math.log(r2/r1), Rth=Math.log(r2/r1)/(2*Math.PI*k*L);
  res('htcc-body',[
    ['Heat transfer rate q', q.toFixed(3)+' W', 'q = 2πkL·ΔT/ln(r₂/r₁)'],
    ['Thermal resistance R_th', Rth.toExponential(3)+' K/W', 'R = ln(r₂/r₁)/(2πkL)']
  ]);
  (function(){const _e=document.getElementById('htcc-out');if(_e)_e.classList.add('visible')})();
}
function htConvPipe(){
  const Re=gv('htcp-Re'), Pr=gv('htcp-Pr'), k=gv('htcp-k'), D=gv('htcp-D')*gu('htcp-D-u');
  const n=parseFloat(document.getElementById('htcp-mode').value);
  if(!Re||!Pr||!k||!D) return;
  if(Re<10000){
    res('htcp-body',[['Warning','Re < 10,000: Dittus-Boelter not valid (use Gnielinski for 3000<Re<5M)','']]);
    (function(){const _e=document.getElementById('htcp-out');if(_e)_e.classList.add('visible')})(); return;
  }
  const Nu=0.023*Math.pow(Re,0.8)*Math.pow(Pr,n);
  const h=Nu*k/D;
  res('htcp-body',[
    ['Nusselt number Nu', Nu.toFixed(2), 'Nu = 0.023·Re⁰·⁸·Prⁿ'],
    ['Conv. coeff h', h.toFixed(2)+' W/(m²·K)', 'h = Nu·k/D'],
    ['Notes', Re>5e6?'Re > 5×10⁶: check Gnielinski':'Valid range','']
  ]);
  (function(){const _e=document.getElementById('htcp-out');if(_e)_e.classList.add('visible')})();
}
function htConvPlate(){
  const Re=gv('htpl-Re'), Pr=gv('htpl-Pr'), k=gv('htpl-k'), L=gv('htpl-L');
  if(!Re||!Pr||!k||!L) return;
  const lam=Re<5e5;
  const Nu=lam ? 0.664*Math.pow(Re,0.5)*Math.pow(Pr,1/3) : 0.037*Math.pow(Re,0.8)*Math.pow(Pr,1/3);
  const h=Nu*k/L;
  res('htpl-body',[
    ['Flow regime', lam?'Laminar (Re<5×10⁵)':'Turbulent (Re≥5×10⁵)', ''],
    ['Nusselt Nu', Nu.toFixed(2), lam?'Nu=0.664·Re^0.5·Pr^(1/3)':'Nu=0.037·Re^0.8·Pr^(1/3)'],
    ['h (average)', h.toFixed(2)+' W/(m²·K)', 'h = Nu·k/L']
  ]);
  (function(){const _e=document.getElementById('htpl-out');if(_e)_e.classList.add('visible')})();
}
function toK(T, unit){ return unit==='C'?T+273.15:unit==='F'?(T-32)*5/9+273.15:T; }
function htRad(){
  const eps=gv('htr-eps'), A=gv('htr-A')*gu('htr-A-u');
  const T1=toK(gv('htr-T1'),document.getElementById('htr-T1-u').value);
  const T2=toK(gv('htr-T2'),document.getElementById('htr-T2-u').value);
  const sig=5.6704e-8;
  if(!eps||!A||isNaN(T1)||isNaN(T2)) return;
  const q=eps*sig*A*(Math.pow(T1,4)-Math.pow(T2,4));
  res('htr-body',[
    ['Net heat transfer q', q.toFixed(2)+' W', 'q = ε·σ·A·(T₁⁴−T₂⁴)'],
    ['Blackbody emission (T₁)', (sig*A*Math.pow(T1,4)).toFixed(2)+' W', 'ε=1 max'],
    ['Direction', q>0?'Surface → Surroundings':'Surroundings → Surface', '']
  ]);
  (function(){const _e=document.getElementById('htr-out');if(_e)_e.classList.add('visible')})();
}
function finCalc(){
  const h=gv('fin-h'), k=gv('fin-k');
  const w=gv('fin-w')*gu('fin-w-u'), t=gv('fin-t')*gu('fin-t-u');
  const L=gv('fin-L')*gu('fin-L-u'), dT=gv('fin-dT');
  if(!h||!k||!w||!t||!L||isNaN(dT)) return;
  const Ac=w*t, P=2*(w+t);
  const m=Math.sqrt(h*P/(k*Ac));
  const mL=m*L;
  const eta=Math.tanh(mL)/mL;
  const qfin=eta*h*P*L*dT;
  const qmax=h*P*L*dT;
  res('fin-body',[
    ['Fin parameter m', m.toFixed(3)+' m⁻¹', 'm = √(h·P/(k·A_c))'],
    ['mL', mL.toFixed(4), '—'],
    ['Fin efficiency η', (eta*100).toFixed(1)+'%', 'η = tanh(mL)/(mL)'],
    ['Actual heat transfer q_fin', qfin.toFixed(3)+' W', 'q = η·h·P·L·ΔT'],
    ['Maximum q (ideal)', qmax.toFixed(3)+' W', 'η_ideal = 1']
  ]);
  (function(){const _e=document.getElementById('fin-out');if(_e)_e.classList.add('visible')})();
}

/* ════════════════════════════════════════════════════════
   FRACTURE / FATIGUE / TORSION
════════════════════════════════════════════════════════ */
function fracCalc(){
  const sig=gv('frac-sig')*gu('frac-sig-u');  // MPa → Pa
  const a=gv('frac-a')*gu('frac-a-u');
  const Y=gv('frac-Y');
  const Kic=gv('frac-Kic');  // MPa√m (keep as-is)
  if(!sig||!a||!Y||!Kic) return;
  const sigMPa=sig/1e6;
  const KI=Y*sigMPa*Math.sqrt(Math.PI*a);
  const safe=KI<Kic;
  res('frac-body',[
    ['K_I', KI.toFixed(3)+' MPa√m', 'K_I = Y·σ·√(π·a)'],
    ['K_IC', Kic+' MPa√m', 'Material toughness'],
    ['Safety factor K_IC/K_I', (Kic/KI).toFixed(3), ''],
    ['Critical crack length a_cr', ((Kic/(Y*sigMPa))*(Kic/(Y*sigMPa))/Math.PI*1000).toFixed(2)+' mm', 'a_cr=(K_IC/(Y·σ))²/π'],
    ['Status', safe?'✓ SAFE — no fracture predicted':'✗ FRACTURE PREDICTED', '']
  ]);
  (function(){const _e=document.getElementById('frac-out');if(_e)_e.classList.add('visible')})();
}
function fatCalc(){
  const sa=gv('fat-sa')*gu('fat-sa-u')/1e6;  // to MPa
  const sf=gv('fat-sf')*gu('fat-sf-u')/1e6;
  const b=gv('fat-b');
  const sm=gv('fat-sm')*gu('fat-sm-u')/1e6;
  const Su=gv('fat-Su')*gu('fat-Su-u')/1e6;
  if(!sa||!sf||!b||isNaN(sm)) return;
  const Nf=0.5*Math.pow(sa/sf,1/b);
  // Goodman: σ_a/Se + σ_m/Su = 1 → check if σ_a + σ_m·(σ_a_corrected) exceeds limit
  const goodmanRatio=sm>0?(sa/sf)/(1-sm/Su):null;
  const saGoodman=sm>0?sa/(1-sm/Su):null;
  res('fat-body',[
    ['Cycles to failure N_f', Nf>1e9?'>1×10⁹ (infinite life)':Nf.toExponential(3), 'Basquin: N_f=0.5·(σ_a/σ_f′)^(1/b)'],
    ['Life in years (1 Hz)', (Nf/31536000).toFixed(2)+' yr', 'Nf/cycles per year'],
    ...(sm>0?[
      ['Goodman σ_a (corrected)', saGoodman.toFixed(1)+' MPa', 'σ_a_eff = σ_a/(1−σ_m/S_u)'],
      ['Goodman ratio', goodmanRatio.toFixed(3), '<1 safe, >1 failure']
    ]:[])
  ]);
  (function(){const _e=document.getElementById('fat-out');if(_e)_e.classList.add('visible')})();
}
function torCalcSolid(){
  const T=gv('tors-T')*gu('tors-T-u'), d=gv('tors-d')*gu('tors-d-u');
  const L=gv('tors-L')*gu('tors-L-u'), G=gv('tors-G')*gu('tors-G-u');
  if(!T||!d||!L||!G) return;
  const J=Math.PI*Math.pow(d,4)/32;
  const tau_max=T*(d/2)/J;
  const phi=T*L/(G*J);
  res('tors-body',[
    ['Polar moment J', J.toExponential(3)+' m⁴', 'J = π·d⁴/32'],
    ['Max shear stress τ_max', (tau_max/1e6).toFixed(2)+' MPa', 'τ = T·r/J'],
    ['Angle of twist φ', (phi*180/Math.PI).toFixed(4)+' °', 'φ = T·L/(G·J)'],
    ['φ (radians)', phi.toFixed(5)+' rad', '—']
  ]);
  (function(){const _e=document.getElementById('tors-out');if(_e)_e.classList.add('visible')})();
}
function torCalcHollow(){
  const T=gv('torh-T')*gu('torh-T-u'), do_=gv('torh-do')*gu('torh-do-u');
  const di=gv('torh-di')*gu('torh-di-u'), L=gv('torh-L')*gu('torh-L-u'), G=gv('torh-G')*gu('torh-G-u');
  if(!T||!do_||!di||!L||!G||di>=do_) return;
  const J=Math.PI*(Math.pow(do_,4)-Math.pow(di,4))/32;
  const tau_max=T*(do_/2)/J;
  const phi=T*L/(G*J);
  res('torh-body',[
    ['Polar moment J', J.toExponential(3)+' m⁴', 'J = π(d_o⁴−d_i⁴)/32'],
    ['Max shear stress τ_max', (tau_max/1e6).toFixed(2)+' MPa', 'τ = T·(d_o/2)/J'],
    ['Angle of twist φ', (phi*180/Math.PI).toFixed(4)+' °', 'φ = T·L/(G·J)']
  ]);
  (function(){const _e=document.getElementById('torh-out');if(_e)_e.classList.add('visible')})();
}
function pvCalcLame(){
  const p=v('pv-p')*gu('pv-p-u'), ri=gv('pv-ri')*gu('pv-ri-u'), ro=gv('pv-ro')*gu('pv-ro-u');
  if(!p||!ri||!ro||ro<=ri) return;
  // Lamé: inner surface (worst case r=ri)
  const sig_th=(p*(ro*ro+ri*ri))/(ro*ro-ri*ri);  // hoop at r=ri
  const sig_r=-p;  // radial at r=ri (equal to -p at inner surface)
  const sig_th_outer=p*2*ri*ri/(ro*ro-ri*ri);  // hoop at outer wall
  const t=ro-ri;
  res('pv-body',[
    ['Wall thickness t', (t*1000).toFixed(2)+' mm', ''],
    ['Hoop stress σ_θ (inner)', (sig_th/1e6).toFixed(2)+' MPa', 'Lamé, r=r_i'],
    ['Radial stress σ_r (inner)', (sig_r/1e6).toFixed(2)+' MPa', '= −p at inner wall'],
    ['Hoop stress σ_θ (outer)', (sig_th_outer/1e6).toFixed(2)+' MPa', 'Lamé, r=r_o'],
    ['Von Mises (inner)', (Math.sqrt(sig_th*sig_th+sig_r*sig_r-sig_th*sig_r)/1e6).toFixed(2)+' MPa', '—'],
    ['Thin-wall check (t/r_i)', (t/ri).toFixed(3), t/ri<0.1?'< 0.1: thin-wall approx OK':'≥ 0.1: use thick-wall (Lamé) — correct']
  ]);
  (function(){const _e=document.getElementById('pv-out');if(_e)_e.classList.add('visible')})();
}
function buckleCalc(){
  const E=gv('bk-E')*gu('bk-E-u'), I=gv('bk-I')*gu('bk-I-u');
  const L=gv('bk-L')*gu('bk-L-u'), K=parseFloat(document.getElementById('bk-K').value);
  if(!E||!I||!L||!K) return;
  const Le=K*L;
  const Pcr=Math.PI*Math.PI*E*I/(Le*Le);
  const sr=Le/Math.sqrt(I/1e-3);  // slenderness ratio approx
  res('bk-body',[
    ['Effective length K·L', Le.toFixed(3)+' m', ''],
    ['Critical (Euler) load P_cr', (Pcr/1000).toFixed(2)+' kN', 'P_cr = π²EI/(KL)²'],
    ['P_cr', (Pcr/1e6).toFixed(3)+' MN', ''],
    ['Note','Euler buckling assumes elastic, slender column (λ > 100 typical)','']
  ]);
  (function(){const _e=document.getElementById('bk-out');if(_e)_e.classList.add('visible')})();
}

/* ════════════════════════════════════════════════════════
   ELECTRICAL ENGINEERING
════════════════════════════════════════════════════════ */
function ohmCalc(changed){
  const ids=['V','I','R','P'];
  const vals={}, units={};
  ids.forEach(id=>{
    const v=document.getElementById('ohm-'+id).value;
    const u=document.getElementById('ohm-'+id+'-u');
    units[id]=u?parseFloat(u.value):1;
    vals[id]=v===''||v===null?null:parseFloat(v)*units[id];
  });
  const known=ids.filter(id=>vals[id]!==null&&!isNaN(vals[id]));
  if(known.length<2){res('ohm-body',[['','Enter any two values','']]);(function(){const _e=document.getElementById('ohm-out');if(_e)_e.classList.add('visible')})();return;}
  let V=vals.V,I=vals.I,R=vals.R,P=vals.P;
  // Solve using the two known quantities
  if(V&&I){R=V/I;P=V*I;}
  else if(V&&R){I=V/R;P=V*V/R;}
  else if(V&&P){I=P/V;R=V*V/P;}
  else if(I&&R){V=I*R;P=I*I*R;}
  else if(I&&P){V=P/I;R=P/(I*I);}
  else if(R&&P){V=Math.sqrt(P*R);I=Math.sqrt(P/R);}
  if(isNaN(V)||isNaN(I)||isNaN(R)||isNaN(P)||R<=0||V<0||I<0){
    res('ohm-body',[['Error','Invalid combination','']]);
    (function(){const _e=document.getElementById('ohm-out');if(_e)_e.classList.add('visible')})();return;
  }
  res('ohm-body',[
    ['Voltage V', V.toFixed(4)+' V', ''],
    ['Current I', (I*1000).toFixed(4)+' mA  =  '+(I).toFixed(6)+' A', ''],
    ['Resistance R', R>=1e6?(R/1e6).toFixed(4)+' MΩ':R>=1000?(R/1000).toFixed(4)+' kΩ':R.toFixed(4)+' Ω', ''],
    ['Power P', P>=1000?(P/1000).toFixed(4)+' kW':P>=1?(P).toFixed(4)+' W':(P*1000).toFixed(4)+' mW', '']
  ]);
  (function(){const _e=document.getElementById('ohm-out');if(_e)_e.classList.add('visible')})();
}
function rcCalc(){
  const R=gv('rc-R')*gu('rc-R-u'), C=gv('rc-C')*gu('rc-C-u');
  if(!R||!C) return;
  const tau=R*C, fc=1/(2*Math.PI*R*C);
  res('rc-body',[
    ['Time constant τ', tau<1e-3?(tau*1e6).toFixed(3)+' μs':tau<1?(tau*1000).toFixed(3)+' ms':tau.toFixed(4)+' s', 'τ = R·C'],
    ['Cutoff frequency f_c', fc>=1e6?(fc/1e6).toFixed(3)+' MHz':fc>=1000?(fc/1000).toFixed(3)+' kHz':fc.toFixed(2)+' Hz', 'f_c = 1/(2π·RC)'],
    ['ω_c', (2*Math.PI*fc).toFixed(2)+' rad/s', '']
  ]);
  (function(){const _e=document.getElementById('rc-out');if(_e)_e.classList.add('visible')})();
}
function rlCalc(){
  const R=gv('rl-R')*gu('rl-R-u'), L=gv('rl-L')*gu('rl-L-u');
  if(!R||!L) return;
  const tau=L/R, fc=R/(2*Math.PI*L);
  res('rl-body',[
    ['Time constant τ', tau<1e-3?(tau*1e6).toFixed(3)+' μs':tau<1?(tau*1000).toFixed(3)+' ms':tau.toFixed(4)+' s', 'τ = L/R'],
    ['Cutoff frequency f_c', fc>=1000?(fc/1000).toFixed(3)+' kHz':fc.toFixed(2)+' Hz', 'f_c = R/(2π·L)']
  ]);
  (function(){const _e=document.getElementById('rl-out');if(_e)_e.classList.add('visible')})();
}
function rlcCalc(){
  const R=gv('rlc-R')*gu('rlc-R-u'), L=gv('rlc-L')*gu('rlc-L-u'), C=gv('rlc-C')*gu('rlc-C-u');
  if(!R||!L||!C) return;
  const f0=1/(2*Math.PI*Math.sqrt(L*C)), w0=2*Math.PI*f0;
  const Q=w0*L/R, zeta=1/(2*Q);
  const bw=f0/Q;
  res('rlc-body',[
    ['Resonant frequency f₀', f0>=1e6?(f0/1e6).toFixed(3)+' MHz':f0>=1000?(f0/1000).toFixed(3)+' kHz':f0.toFixed(2)+' Hz', 'f₀ = 1/(2π√LC)'],
    ['Quality factor Q', Q.toFixed(3), 'Q = ω₀L/R'],
    ['Damping ratio ζ', zeta.toFixed(4), 'ζ = 1/(2Q)'],
    ['Response type', zeta<1?'Underdamped (oscillatory)':zeta===1?'Critically damped':'Overdamped', ''],
    ['Bandwidth BW', bw.toFixed(2)+' Hz', 'BW = f₀/Q']
  ]);
  (function(){const _e=document.getElementById('rlc-out');if(_e)_e.classList.add('visible')})();
}
function dbCalc(){
  const type=document.getElementById('db-type').value;
  const vin=gv('db-in'), vout=gv('db-out-v');
  if(!vin||!vout||vin<=0||vout<=0) return;
  const ratio=vout/vin;
  const dB=type==='voltage'?20*Math.log10(ratio):10*Math.log10(ratio);
  res('db-body',[
    ['Ratio', ratio.toFixed(4), ''],
    ['Gain', dB.toFixed(3)+' dB', type==='voltage'?'20·log₁₀(V_out/V_in)':'10·log₁₀(P_out/P_in)'],
    ['Linear amplitude factor', ratio.toFixed(4), '']
  ]);
  (function(){const _e=document.getElementById('db-res');if(_e)_e.classList.add('visible')})();
}
function dbmCalc(){
  const mw=gv('dbm-mw');
  if(!mw||mw<=0) return;
  const dbm=10*Math.log10(mw);
  const W=mw/1000;
  res('dbm-body',[['dBm', dbm.toFixed(3)+' dBm', '10·log₁₀(P_mW)'],['Power (W)', W.toFixed(6)+' W', '']]);
  (function(){const _e=document.getElementById('dbm-out');if(_e)_e.classList.add('visible')})();
}
function dbmRevCalc(){
  const dbm=gv('dbm-db');
  if(isNaN(dbm)) return;
  const mw=Math.pow(10,dbm/10);
  res('dbm-body',[['Power (mW)', mw.toFixed(4)+' mW', '10^(dBm/10)'],['Power (W)', (mw/1000).toFixed(6)+' W', ''],['Power (μW)', (mw*1000).toFixed(2)+' μW', '']]);
  (function(){const _e=document.getElementById('dbm-out');if(_e)_e.classList.add('visible')})();
}
function opampInv(){
  const Rin=gv('opai-Rin')*gu('opai-Rin-u'), Rf=gv('opai-Rf')*gu('opai-Rf-u');
  const Vin=gv('opai-Vin')*gu('opai-Vin-u');
  if(!Rin||!Rf||isNaN(Vin)) return;
  const Av=-Rf/Rin, Vout=Av*Vin;
  res('opai-body',[
    ['Voltage gain A_v', Av.toFixed(4), 'A_v = −R_f/R_in'],
    ['Gain (dB)', (20*Math.log10(Math.abs(Av))).toFixed(2)+' dB', ''],
    ['Output V_out', Vout.toFixed(4)+' V', 'Inverted from V_in']
  ]);
  (function(){const _e=document.getElementById('opai-out');if(_e)_e.classList.add('visible')})();
}
function opampNoninv(){
  const R1=gv('opan-R1')*gu('opan-R1-u'), Rf=gv('opan-Rf')*gu('opan-Rf-u');
  const Vin=gv('opan-Vin')*gu('opan-Vin-u');
  if(!R1||isNaN(Rf)||isNaN(Vin)) return;
  const Av=1+Rf/R1, Vout=Av*Vin;
  res('opan-body',[
    ['Voltage gain A_v', Av.toFixed(4), 'A_v = 1 + R_f/R₁'],
    ['Gain (dB)', (20*Math.log10(Av)).toFixed(2)+' dB', ''],
    ['Output V_out', Vout.toFixed(4)+' V', '']
  ]);
  (function(){const _e=document.getElementById('opan-out');if(_e)_e.classList.add('visible')})();
}
function opampDiff(){
  const Rin=gv('opad-Rin')*gu('opad-Rin-u'), Rf=gv('opad-Rf')*gu('opad-Rf-u');
  const Vp=gv('opad-Vp')*gu('opad-Vp-u'), Vm=gv('opad-Vm')*gu('opad-Vm-u');
  if(!Rin||!Rf||isNaN(Vp)||isNaN(Vm)) return;
  const Av=Rf/Rin, Vout=Av*(Vp-Vm);
  res('opad-body',[
    ['Differential gain A_d', Av.toFixed(4), 'A_d = R_f/R_in'],
    ['V+ − V−', (Vp-Vm).toFixed(4)+' V', ''],
    ['Output V_out', Vout.toFixed(4)+' V', 'V_out = A_d·(V+−V−)']
  ]);
  (function(){const _e=document.getElementById('opad-out');if(_e)_e.classList.add('visible')})();
}

/* ════════════════════════════════════════════════════════
   BIOMEDICAL ENGINEERING
════════════════════════════════════════════════════════ */
function coCalc(){
  const SV=gv('co-SV')*gu('co-SV-u'), HR=gv('co-HR');
  const MAP=gv('co-MAP')*gu('co-MAP-u');
  if(!SV||!HR) return;
  const CO_m3s=SV*HR/60;
  const CO_Lmin=CO_m3s*1000*60;
  const SVR=MAP?MAP/CO_m3s:null;
  const EF=(SV*1e6/150*100);  // rough EF assuming EDV=150mL
  res('co-body',[
    ['Cardiac output CO', CO_Lmin.toFixed(2)+' L/min', 'CO = SV × HR'],
    ['CO (m³/s)', CO_m3s.toExponential(3)+' m³/s', ''],
    ...(MAP?[['SVR', (SVR/1e6).toFixed(3)+' mmHg·s/mL  =  '+(SVR).toFixed(0)+' Pa·s/m³', 'SVR = MAP / CO']]:[] ),
    ['Est. EF (EDV=150 mL)', EF.toFixed(1)+'%', 'Rough estimate only']
  ]);
  (function(){const _e=document.getElementById('co-out');if(_e)_e.classList.add('visible')})();
}
function poisCalc(){
  const dP=gv('poi-dP')*gu('poi-dP-u'), r=gv('poi-r')*gu('poi-r-u');
  const L=gv('poi-L')*gu('poi-L-u'), mu=gv('poi-mu')*gu('poi-mu-u');
  if(!dP||!r||!L||!mu) return;
  const Q=Math.PI*dP*Math.pow(r,4)/(8*mu*L);
  const R_poise=8*mu*L/(Math.PI*Math.pow(r,4));
  const v_max=dP*r*r/(4*mu*L);
  const v_mean=Q/(Math.PI*r*r);
  res('poi-body',[
    ['Volumetric flow Q', (Q*1e6).toFixed(4)+' mL/s  =  '+(Q*60000).toFixed(4)+' mL/min', 'Q = πΔP·r⁴/(8μL)'],
    ['Hydraulic resistance R', R_poise.toExponential(3)+' Pa·s/m³', 'R = 8μL/(πr⁴)'],
    ['Max velocity v_max', (v_max*1000).toFixed(3)+' mm/s', 'At centreline'],
    ['Mean velocity v̄', (v_mean*1000).toFixed(3)+' mm/s', 'v̄ = v_max/2 (Poiseuille)'],
    ['Re', (2*v_mean*r*1060/mu).toFixed(1), 'Blood density ~1060 kg/m³']
  ]);
  (function(){const _e=document.getElementById('poi-out');if(_e)_e.classList.add('visible')})();
}
function nernstCalc(){
  const z=gv('ne-z'), cout=gv('ne-out')*gu('ne-out-u'), cin=gv('ne-in')*gu('ne-in-u');
  const Traw=gv('ne-T'), Tu=document.getElementById('ne-T-u').value;
  const T=Tu==='C'?Traw+273.15:Traw;
  const R=8.314, F=96485;
  if(!z||!cout||!cin||!T) return;
  const E=(R*T/(z*F))*Math.log(cout/cin)*1000;  // mV
  res('ne-body',[
    ['Nernst potential E_X', E.toFixed(2)+' mV', 'E = (RT/zF)·ln([X]_out/[X]_in)'],
    ['At 37°C:', 'RT/F = 26.73 mV', 'Thermal voltage'],
    ['log₁₀ ratio', Math.log10(cout/cin).toFixed(4), '']
  ]);
  (function(){const _e=document.getElementById('ne-out-r');if(_e)_e.classList.add('visible')})();
}
function goldmanCalc(){
  const Ko=parseFloat(document.getElementById('gk-Ko').value)||5;
  const Ki=parseFloat(document.getElementById('gk-Ki').value)||140;
  const Nao=parseFloat(document.getElementById('gk-Nao').value)||145;
  const Nai=parseFloat(document.getElementById('gk-Nai').value)||15;
  const Clo=parseFloat(document.getElementById('gk-Clo').value)||120;
  const Cli=parseFloat(document.getElementById('gk-Cli').value)||10;
  const PK=parseFloat(document.getElementById('gk-PK').value)||1;
  const PNa=parseFloat(document.getElementById('gk-PNa').value)||0.04;
  const PCl=parseFloat(document.getElementById('gk-PCl').value)||0.45;
  const T=310.15; // 37°C
  const R=8.314, F=96485;
  // Goldman-Hodgkin-Katz: V_m = (RT/F)·ln((P_K·Ko + P_Na·Nao + P_Cl·Cli)/(P_K·Ki + P_Na·Nai + P_Cl·Clo))
  const num=PK*Ko+PNa*Nao+PCl*Cli;
  const den=PK*Ki+PNa*Nai+PCl*Clo;
  const Vm=(R*T/F)*Math.log(num/den)*1000;
  res('gk-body',[
    ['Membrane potential V_m', Vm.toFixed(2)+' mV', 'Goldman-Hodgkin-Katz'],
    ['Typical resting V_m', '−70 to −90 mV', 'Mammalian neuron/cardiac'],
    ['Numerator factor', num.toFixed(2), 'P_K·Ko + P_Na·Nao + P_Cl·Cli'],
    ['Denominator factor', den.toFixed(2), 'P_K·Ki + P_Na·Nai + P_Cl·Clo']
  ]);
  (function(){const _e=document.getElementById('gk-out');if(_e)_e.classList.add('visible')})();
}

/* ════════════════════════════════════════════════════════
   DYNAMICS & CONTROL
════════════════════════════════════════════════════════ */
function msdCalc(){
  const m=gv('msd-m')*gu('msd-m-u'), k=gv('msd-k')*gu('msd-k-u'), c=gv('msd-c')*gu('msd-c-u');
  if(!m||!k) return;
  const wn=Math.sqrt(k/m), cc=2*Math.sqrt(k*m);
  const zeta=c/cc, wd=wn*Math.sqrt(Math.max(0,1-zeta*zeta));
  const fn=wn/(2*Math.PI), fd=wd/(2*Math.PI);
  const type=zeta<0?'Negative damping':zeta===0?'Undamped':zeta<1?'Underdamped':zeta===1?'Critically damped':'Overdamped';
  const td=zeta<1&&zeta>0?2*Math.PI/wd:null;
  res('msd-body',[
    ['Natural freq ω_n', wn.toFixed(4)+' rad/s', 'ω_n = √(k/m)'],
    ['Natural freq f_n', fn.toFixed(4)+' Hz', 'f_n = ω_n/(2π)'],
    ['Critical damping c_cr', cc.toFixed(4)+' N·s/m', 'c_cr = 2√(km)'],
    ['Damping ratio ζ', zeta.toFixed(4), 'ζ = c/c_cr'],
    ['Response type', type, ''],
    ...(zeta<1&&zeta>0?[
      ['Damped natural freq ω_d', wd.toFixed(4)+' rad/s', 'ω_d = ω_n√(1−ζ²)'],
      ['Damped period T_d', td.toFixed(4)+' s', 'T_d = 2π/ω_d']
    ]:[])
  ]);
  (function(){const _e=document.getElementById('msd-out');if(_e)_e.classList.add('visible')})();
}
function projCalc(){
  const v0=gv('proj-v0')*gu('proj-v0-u'), theta=gv('proj-th')*Math.PI/180;
  const h0=gv('proj-h0')*gu('proj-h0-u'), g=gv('proj-g');
  if(!v0||isNaN(theta)||!g) return;
  const vx=v0*Math.cos(theta), vy=v0*Math.sin(theta);
  // Time to land: h0 + vy*t - 0.5*g*t² = 0
  const disc=vy*vy+2*g*h0;
  if(disc<0){res('proj-body',[['Error','No real solution (cannot reach ground)','']]);(function(){const _e=document.getElementById('proj-out');if(_e)_e.classList.add('visible')})();return;}
  const tf=(vy+Math.sqrt(disc))/g;
  const R=vx*tf, Hmax=h0+vy*vy/(2*g);
  const t_peak=vy/g;
  res('proj-body',[
    ['Range R', R.toFixed(2)+' m', 'R = v_x·t_f'],
    ['Max height H', Hmax.toFixed(2)+' m', 'H = h₀ + v_y²/(2g)'],
    ['Time of flight', tf.toFixed(4)+' s', ''],
    ['Time to peak', t_peak.toFixed(4)+' s', ''],
    ['Impact velocity', Math.sqrt(vx*vx+Math.pow(vy-g*tf,2)).toFixed(3)+' m/s', ''],
    ['Optimum angle (flat ground)', (h0===0?'45°':'Depends on h₀'), '']
  ]);
  (function(){const _e=document.getElementById('proj-out');if(_e)_e.classList.add('visible')})();
}

/* ════════════════════════════════════════════════════════
   CIVIL / GEOTECHNICAL
════════════════════════════════════════════════════════ */
function mannRect(){
  const n=gv('mn-n'), b=gv('mn-b')*gu('mn-b-u'), y=gv('mn-y')*gu('mn-y-u'), S=gv('mn-S');
  if(!n||!b||!y||!S) return;
  const A=b*y, Pw=b+2*y, Rh=A/Pw;
  const Q=(1/n)*A*Math.pow(Rh,2/3)*Math.sqrt(S);
  const V=Q/A;
  const Re_h=V*Rh/1e-6;  // kinematic viscosity ~1e-6 m²/s for water
  const Fr=V/Math.sqrt(9.81*y);
  res('mn-body',[
    ['Discharge Q', Q.toFixed(4)+' m³/s  =  '+(Q*1000).toFixed(2)+' L/s', 'Q=(1/n)·A·R_h^(2/3)·S^(1/2)'],
    ['Flow velocity V', V.toFixed(4)+' m/s', 'V = Q/A'],
    ['Hydraulic radius R_h', (Rh*100).toFixed(3)+' cm', 'R_h = A/P_w'],
    ['Froude number Fr', Fr.toFixed(3), Fr<1?'Subcritical (Fr<1)':Fr>1?'Supercritical (Fr>1)':'Critical'],
    ['Flow type', Fr<1?'Subcritical':Fr>1?'Supercritical':'Critical', '']
  ]);
  (function(){const _e=document.getElementById('mn-out');if(_e)_e.classList.add('visible')})();
}
function mannCirc(){
  const n=gv('mnc-n'), D=gv('mnc-D')*gu('mnc-D-u'), S=gv('mnc-S');
  if(!n||!D||!S) return;
  const A=Math.PI*D*D/4, Rh=D/4, Pw=Math.PI*D;
  const Q=(1/n)*A*Math.pow(Rh,2/3)*Math.sqrt(S);
  const V=Q/A;
  const Fr=V/Math.sqrt(9.81*(D/2));
  res('mnc-body',[
    ['Full-pipe discharge Q', Q.toFixed(4)+' m³/s', 'Q=(1/n)·A·R_h^(2/3)·S^(1/2)'],
    ['Full-pipe velocity V', V.toFixed(4)+' m/s', ''],
    ['Hydraulic radius R_h', (Rh*100).toFixed(3)+' cm', 'D/4 for full circle'],
    ['Froude number Fr', Fr.toFixed(3), '']
  ]);
  (function(){const _e=document.getElementById('mnc-out');if(_e)_e.classList.add('visible')})();
}
function darcyCalc(){
  const k=gv('da-k')*gu('da-k-u'), dh=gv('da-dh')*gu('da-dh-u');
  const L=gv('da-L')*gu('da-L-u'), A=gv('da-A')*gu('da-A-u');
  if(!k||!dh||!L||!A) return;
  const i=dh/L, v=k*i, Q=k*i*A;
  res('da-body',[
    ['Hydraulic gradient i', i.toFixed(6), 'i = Δh/L'],
    ['Darcy velocity v', (v*1000).toFixed(4)+' mm/s', 'v = k·i'],
    ['Volumetric flow Q', (Q*1000).toFixed(4)+' L/s  =  '+(Q*86400).toFixed(2)+' m³/day', 'Q = k·i·A'],
    ['Seepage velocity v_s', 'Q/(n·A) — need porosity n', '≈ v/n for typical soils']
  ]);
  (function(){const _e=document.getElementById('da-out');if(_e)_e.classList.add('visible')})();
}




/* ════════════════════════════════════════════════════════
   GEOMETRY CALCULATORS
════════════════════════════════════════════════════════ */
const PI = Math.PI;
function fmt(n,dp=4){ if(isNaN(n)||n===undefined) return '—'; const a=Math.abs(n); if(a===0) return '0'; if(a>=0.001&&a<1e7) return parseFloat(n.toPrecision(dp)).toString(); return n.toExponential(3); }

function gCircle(){
  const r = v('gc-r') * su('gc-r-u'); if(!r) return;
  const A=PI*r*r, P=2*PI*r, Ix=PI*r*r*r*r/4, Sx=PI*r*r*r/4;
  res('gc-body',[
    ['Area A', fmt(A)+' m²', 'πr²'],
    ['Perimeter (circumference)', fmt(P)+' m', '2πr'],
    ['Ix = Iy (2nd moment)', fmt(Ix)+' m⁴', 'πr⁴/4'],
    ['Polar moment Ip = J', fmt(2*Ix)+' m⁴', 'πr⁴/2'],
    ['Section modulus Sx', fmt(Sx)+' m³', 'πr³/4'],
    ['Centroid (from base)', fmt(r)+' m', 'at centre']
  ]);
}
function gRect(){
  const b=v('gr-b')*su('gr-b-u'), h=v('gr-h')*su('gr-h-u'); if(!b||!h) return;
  const A=b*h, P=2*(b+h), Ix=b*h*h*h/12, Iy=h*b*b*b/12;
  res('gr-body',[
    ['Area A', fmt(A)+' m²', 'b·h'],
    ['Perimeter', fmt(P)+' m', '2(b+h)'],
    ['Ix (centroidal, about x)', fmt(Ix)+' m⁴', 'bh³/12'],
    ['Iy (centroidal, about y)', fmt(Iy)+' m⁴', 'hb³/12'],
    ['Polar moment Ip', fmt(Ix+Iy)+' m⁴', 'Ix+Iy'],
    ['Centroid (from corner)', fmt(b/2)+' m, '+fmt(h/2)+' m', '(b/2, h/2)']
  ]);
}
function gTriangle(){
  const b=v('gt-b')*su('gt-b-u'), h=v('gt-h')*su('gt-h-u'); if(!b||!h) return;
  const cRaw=parseFloat(document.getElementById('gt-c').value);
  const A=0.5*b*h, Ix=b*h*h*h/36;
  const rows = [
    ['Area A', fmt(A)+' m²', 'bh/2'],
    ['Ix (centroidal)', fmt(Ix)+' m⁴', 'bh³/36'],
    ['Centroid height', fmt(h/3)+' m', 'h/3 from base']
  ];
  if(!isNaN(cRaw)){
    const c=cRaw*su('gt-b-u'); // same unit
    const a2=b, b2=h, c2=c;
    // use Heron's if three sides given
    const s=(a2+b2+c2)/2;
    const AH=Math.sqrt(Math.max(0,s*(s-a2)*(s-b2)*(s-c2)));
    rows.push(['Area (Heron)', fmt(AH)+' m²', '— with side c']);
  }
  res('gt-body', rows);
}
function gEllipse(){
  const a=v('ge-a')*su('ge-a-u'), b=v('ge-b')*su('ge-b-u'); if(!a||!b) return;
  // Ramanujan approx perimeter
  const P=PI*(3*(a+b)-Math.sqrt((3*a+b)*(a+3*b)));
  const A=PI*a*b, Ix=PI*a*b*b*b/4, Iy=PI*b*a*a*a/4;
  res('ge-body',[
    ['Area A', fmt(A)+' m²', 'πab'],
    ['Perimeter (Ramanujan)', fmt(P)+' m', 'approx.'],
    ['Eccentricity e', fmt(Math.sqrt(1-(b*b)/(a*a))), 'e=√(1−b²/a²)'],
    ['Ix', fmt(Ix)+' m⁴', 'πab³/4'],
    ['Iy', fmt(Iy)+' m⁴', 'πba³/4']
  ]);
}
function gAnnulus(){
  const R=v('gan-R')*su('gan-R-u'), r=v('gan-r')*su('gan-r-u');
  if(!R||!r||r>=R){res('gan-body',[['Error','r must be < R','']]);return;}
  const A=PI*(R*R-r*r), P_out=2*PI*R, P_in=2*PI*r;
  const Ix=PI*(Math.pow(R,4)-Math.pow(r,4))/4;
  res('gan-body',[
    ['Area A', fmt(A)+' m²', 'π(R²−r²)'],
    ['Outer perimeter', fmt(P_out)+' m', '2πR'],
    ['Inner perimeter', fmt(P_in)+' m', '2πr'],
    ['Ix = Iy', fmt(Ix)+' m⁴', 'π(R⁴−r⁴)/4'],
    ['Polar moment', fmt(2*Ix)+' m⁴', 'π(R⁴−r⁴)/2']
  ]);
}
function gSphere(){
  const r=v('gs-r')*su('gs-r-u'); if(!r) return;
  const V=4*PI*r*r*r/3, SA=4*PI*r*r;
  res('gs-body',[
    ['Volume V', fmt(V)+' m³', '(4/3)πr³'],
    ['Surface area SA', fmt(SA)+' m²', '4πr²'],
    ['Centroid from centre', '0', 'by symmetry']
  ]);
}
function gCyl(){
  const r=v('gcyl-r')*su('gcyl-r-u'), h=v('gcyl-h')*su('gcyl-h-u'); if(!r||!h) return;
  const V=PI*r*r*h, SA_lat=2*PI*r*h, SA_cap=2*PI*r*r, SA=SA_lat+SA_cap;
  res('gcyl-body',[
    ['Volume V', fmt(V)+' m³', 'πr²h'],
    ['Lateral surface area', fmt(SA_lat)+' m²', '2πrh'],
    ['Total surface area', fmt(SA)+' m²', '2πr(r+h)'],
    ['Centroid height', fmt(h/2)+' m', 'h/2 from base']
  ]);
}
function gCone(){
  const r=v('gcone-r')*su('gcone-r-u'), h=v('gcone-h')*su('gcone-h-u'); if(!r||!h) return;
  const l=Math.sqrt(r*r+h*h);
  const V=PI*r*r*h/3, SA_lat=PI*r*l, SA=SA_lat+PI*r*r;
  res('gcone-body',[
    ['Volume V', fmt(V)+' m³', 'πr²h/3'],
    ['Slant height l', fmt(l)+' m', '√(r²+h²)'],
    ['Lateral surface area', fmt(SA_lat)+' m²', 'πrl'],
    ['Total surface area', fmt(SA)+' m²', 'πr(r+l)'],
    ['Centroid height', fmt(h/4)+' m', 'h/4 from base']
  ]);
}
function gBox(){
  const a=v('gbox-a')*su('gbox-a-u'), b=v('gbox-b')*su('gbox-b-u'), c_=v('gbox-c')*su('gbox-c-u');
  if(!a||!b||!c_) return;
  const V=a*b*c_, SA=2*(a*b+b*c_+a*c_), diag=Math.sqrt(a*a+b*b+c_*c_);
  res('gbox-body',[
    ['Volume V', fmt(V)+' m³', 'abc'],
    ['Surface area SA', fmt(SA)+' m²', '2(ab+bc+ac)'],
    ['Space diagonal', fmt(diag)+' m', '√(a²+b²+c²)'],
    ['Centroid', '(a/2, b/2, c/2)', '']
  ]);
}
function gTorus(){
  const R=v('gtor-R')*su('gtor-R-u'), r=v('gtor-r')*su('gtor-r-u');
  if(!R||!r||r>=R){res('gtor-body',[['Error','Tube radius r must be < R','']]);return;}
  const V=2*PI*PI*R*r*r, SA=4*PI*PI*R*r;
  res('gtor-body',[
    ['Volume V', fmt(V)+' m³', '2π²Rr²'],
    ['Surface area SA', fmt(SA)+' m²', '4π²Rr'],
    ['Centroid', 'At centre', 'by symmetry']
  ]);
}

function triSolve(){
  let a=parseFloat(document.getElementById('tri-a').value);
  let b=parseFloat(document.getElementById('tri-b').value);
  let c=parseFloat(document.getElementById('tri-c').value);
  let A=parseFloat(document.getElementById('tri-A').value)*PI/180;
  let B=parseFloat(document.getElementById('tri-B').value)*PI/180;
  let C=parseFloat(document.getElementById('tri-C').value)*PI/180;
  const nan=n=>isNaN(n), known=x=>!isNaN(x)&&x>0;
  
  // Count known values
  const knownSides=[known(a),known(b),known(c)].filter(Boolean).length;
  const knownAngles=[known(A),known(B),known(C)].filter(Boolean).length;
  
  // Fill in missing angle if two known
  if(knownAngles===2&&isNaN(C)&&known(A)&&known(B)) C=PI-A-B;
  else if(knownAngles===2&&isNaN(B)&&known(A)&&known(C)) B=PI-A-C;
  else if(knownAngles===2&&isNaN(A)&&known(B)&&known(C)) A=PI-B-C;
  
  // ASA or AAS: two angles + one side
  if(known(A)&&known(B)&&known(C)&&known(a)&&!known(b)&&!known(c)){
    b=a*Math.sin(B)/Math.sin(A); c=a*Math.sin(C)/Math.sin(A);
  } else if(known(A)&&known(B)&&known(C)&&known(b)&&!known(a)&&!known(c)){
    a=b*Math.sin(A)/Math.sin(B); c=b*Math.sin(C)/Math.sin(B);
  } else if(known(A)&&known(B)&&known(C)&&known(c)&&!known(a)&&!known(b)){
    a=c*Math.sin(A)/Math.sin(C); b=c*Math.sin(B)/Math.sin(C);
  }
  // SAS: two sides + included angle
  else if(known(a)&&known(b)&&known(C)&&!known(c)){
    c=Math.sqrt(a*a+b*b-2*a*b*Math.cos(C));
    A=Math.acos((b*b+c*c-a*a)/(2*b*c));
    B=PI-A-C;
  } else if(known(a)&&known(c)&&known(B)&&!known(b)){
    b=Math.sqrt(a*a+c*c-2*a*c*Math.cos(B));
    A=Math.acos((b*b+c*c-a*a)/(2*b*c));
    C=PI-A-B;
  } else if(known(b)&&known(c)&&known(A)&&!known(a)){
    a=Math.sqrt(b*b+c*c-2*b*c*Math.cos(A));
    B=Math.acos((a*a+c*c-b*b)/(2*a*c));
    C=PI-A-B;
  }
  // SSS
  else if(known(a)&&known(b)&&known(c)){
    A=Math.acos((b*b+c*c-a*a)/(2*b*c));
    B=Math.acos((a*a+c*c-b*b)/(2*a*c));
    C=PI-A-B;
  }
  
  if(!known(a)||!known(b)||!known(c)||isNaN(A)||isNaN(B)||isNaN(C)){
    res('tri-body',[['Error','Insufficient information or inconsistent values. Need at least 3 knowns (one must be a side).','']]);
    return;
  }
  
  const area=0.5*a*b*Math.sin(C);
  const s=(a+b+c)/2;
  const r_in=area/s;
  const R_circ=a/(2*Math.sin(A));
  
  res('tri-body',[
    ['Side a', fmt(a), ''],
    ['Side b', fmt(b), ''],
    ['Side c', fmt(c), ''],
    ['Angle A', (A*180/PI).toFixed(4)+'°', ''],
    ['Angle B', (B*180/PI).toFixed(4)+'°', ''],
    ['Angle C', (C*180/PI).toFixed(4)+'°', 'sum = '+(((A+B+C)*180/PI).toFixed(2))+'°'],
    ['Area', fmt(area), '(1/2)ab sin C'],
    ['Perimeter', fmt(a+b+c), ''],
    ['Inradius r', fmt(r_in), 'A/s'],
    ['Circumradius R', fmt(R_circ), 'a/(2 sin A)']
  ]);
}

function coordPts(){
  const x1=v('cp-x1'),y1=v('cp-y1'),x2=v('cp-x2'),y2=v('cp-y2');
  if(isNaN(x1)||isNaN(y1)||isNaN(x2)||isNaN(y2)) return;
  const d=Math.sqrt((x2-x1)**2+(y2-y1)**2);
  const mx=(x1+x2)/2, my=(y1+y2)/2;
  const dx=x2-x1, dy=y2-y1;
  const m=dx===0?Infinity:dy/dx;
  const angle=Math.atan2(dy,dx)*180/PI;
  res('cp-body',[
    ['Distance', fmt(d), '√((x₂−x₁)²+(y₂−y₁)²)'],
    ['Midpoint', '('+fmt(mx)+', '+fmt(my)+')', ''],
    ['Slope m', dx===0?'∞ (vertical)':fmt(m), 'Δy/Δx'],
    ['Angle with x-axis', angle.toFixed(3)+'°', 'atan2(Δy,Δx)'],
    ['Δx', fmt(dx), ''],
    ['Δy', fmt(dy), '']
  ]);
}
function lineEq(){
  const m=v('le-m'),x0=v('le-x0'),y0=v('le-y0');
  if(isNaN(m)||isNaN(x0)||isNaN(y0)) return;
  const b_int=y0-m*x0;
  const sign=b_int>=0?'+':'-';
  res('le-body',[
    ['Slope-intercept', 'y = '+fmt(m)+'x '+sign+' '+fmt(Math.abs(b_int)), ''],
    ['Point-slope', 'y − '+fmt(y0)+' = '+fmt(m)+'(x − '+fmt(x0)+')', ''],
    ['Standard form', fmt(m)+'x − y + '+fmt(b_int)+' = 0', ''],
    ['y-intercept', '(0, '+fmt(b_int)+')', ''],
    ['x-intercept', m===0?'none (horizontal)':'('+fmt(-b_int/m)+', 0)', ''],
    ['Angle with x-axis', (Math.atan(m)*180/PI).toFixed(3)+'°', '']
  ]);
}
function circEq(){
  const h=v('ce-h'),k=v('ce-k'),r=v('ce-r');
  if(isNaN(h)||isNaN(k)||!r) return;
  const A=PI*r*r, P=2*PI*r;
  const hs=h>=0?'−'+fmt(h):'+'+fmt(-h);
  const ks=k>=0?'−'+fmt(k):'+'+fmt(-k);
  res('ce-body',[
    ['Equation', '(x'+hs+')² + (y'+ks+')² = '+fmt(r*r), 'Standard form'],
    ['Centre', '('+fmt(h)+', '+fmt(k)+')', ''],
    ['Radius', fmt(r), ''],
    ['Area', fmt(A), 'πr²'],
    ['Circumference', fmt(P), '2πr'],
    ['Diameter', fmt(2*r), '2r']
  ]);
}

/* ════════════════════════════════════════════════════════
   CALCULUS CALCULATORS
════════════════════════════════════════════════════════ */
function numDiff(){
  const fm=v('nd-fm'), f0=v('nd-f0'), fp=v('nd-fp'), h=v('nd-h');
  if(isNaN(fm)||isNaN(f0)||isNaN(fp)||!h) return;
  const f1_central=(fp-fm)/(2*h);
  const f1_forward=(fp-f0)/h;
  const f1_backward=(f0-fm)/h;
  const f2=(fp-2*f0+fm)/(h*h);
  res('nd-body',[
    ['f′(x) — central difference', fmt(f1_central), '(f(x+h)−f(x−h))/(2h)  O(h²)'],
    ['f′(x) — forward difference', fmt(f1_forward), '(f(x+h)−f(x))/h  O(h)'],
    ['f′(x) — backward difference', fmt(f1_backward), '(f(x)−f(x−h))/h  O(h)'],
    ['f″(x) — central difference', fmt(f2), '(f(x+h)−2f(x)+f(x−h))/h²  O(h²)'],
    ['Truncation error estimate', fmt(Math.abs(f1_forward-f1_backward)), '|fwd − bwd|']
  ]);
}

function numInt(){
  const a=v('ni-a'), b=v('ni-b');
  if(isNaN(a)||isNaN(b)||a>=b) return;
  const raw=document.getElementById('ni-y').value;
  const ys=raw.split(',').map(s=>parseFloat(s.trim())).filter(y=>!isNaN(y));
  const n=ys.length-1;
  if(n<1){res('ni-body',[['Error','Need at least 2 y values','']]);return;}
  const h=(b-a)/n;
  
  // Trapezoidal
  let trap=ys[0]+ys[n];
  for(let i=1;i<n;i++) trap+=2*ys[i];
  trap*=h/2;
  
  // Simpson's 1/3 (needs even n)
  let simp13=NaN;
  if(n%2===0){
    let s=ys[0]+ys[n];
    for(let i=1;i<n;i++) s+=(i%2===1?4:2)*ys[i];
    simp13=s*h/3;
  }
  
  // Simpson's 3/8 (needs n divisible by 3)
  let simp38=NaN;
  if(n%3===0){
    let s=ys[0]+ys[n];
    for(let i=1;i<n;i++) s+=(i%3===0?2:3)*ys[i];
    simp38=s*3*h/8;
  }
  
  res('ni-body',[
    ['n (intervals)', n, ''],
    ['Step size h', fmt(h), '(b−a)/n'],
    ['Trapezoidal', fmt(trap), 'O(h²)'],
    ['Simpson 1/3', isNaN(simp13)?'needs even n':fmt(simp13), 'O(h⁴)'],
    ["Simpson 3/8", isNaN(simp38)?'n not ÷ 3':fmt(simp38), 'O(h⁴)'],
    ['Best estimate', isNaN(simp13)?fmt(trap):fmt(simp13), '']
  ]);
}

function taylorCalc(){
  const fn=document.getElementById('ts-fn').value;
  const x=v('ts-x'), terms=Math.min(12,Math.max(1,Math.round(v('ts-terms'))));
  const nRow=document.getElementById('ts-n-row');
  nRow.style.display=fn==='binomial'?'flex':'none';
  const nExp=v('ts-n');
  
  if(isNaN(x)) return;
  
  let approx=0, exact, termList='';
  
  if(fn==='sin'){
    exact=Math.sin(x);
    for(let k=0;k<terms;k++){
      const t=Math.pow(-1,k)*Math.pow(x,2*k+1)/factorial(2*k+1);
      approx+=t;
    }
  } else if(fn==='cos'){
    exact=Math.cos(x);
    for(let k=0;k<terms;k++){
      const t=Math.pow(-1,k)*Math.pow(x,2*k)/factorial(2*k);
      approx+=t;
    }
  } else if(fn==='exp'){
    exact=Math.exp(x);
    for(let k=0;k<terms;k++){
      approx+=Math.pow(x,k)/factorial(k);
    }
  } else if(fn==='ln1p'){
    if(x<=-1){res('ts-body',[['Error','ln(1+x) requires x > −1','']]);return;}
    exact=Math.log(1+x);
    for(let k=1;k<=terms;k++){
      approx+=Math.pow(-1,k+1)*Math.pow(x,k)/k;
    }
  } else if(fn==='binomial'){
    const n=isNaN(nExp)?2:nExp;
    if(Math.abs(x)>=1){res('ts-body',[['Error','Binomial series converges for |x| < 1','']]);return;}
    exact=Math.pow(1+x,n);
    approx=1;
    for(let k=1;k<=terms;k++){
      let c=1; for(let j=0;j<k;j++) c*=(n-j)/(j+1);
      approx+=c*Math.pow(x,k);
    }
  }
  
  const err=Math.abs(exact-approx);
  const relErr=Math.abs(err/exact)*100;
  
  res('ts-body',[
    ['Exact value', fmt(exact,8), fn],
    ['Taylor approx ('+(terms)+' terms)', fmt(approx,8), ''],
    ['Absolute error', err<1e-14?'< 1×10⁻¹⁴':fmt(err), ''],
    ['Relative error', relErr<1e-12?'< 1×10⁻¹⁰%':fmt(relErr)+'%', '']
  ]);
}

function factorial(n){ if(n<=1) return 1; let r=1; for(let i=2;i<=n;i++) r*=i; return r; }

function vcGrad(){
  const fxp=v('vg-xp'),fxm=v('vg-xm'),fyp=v('vg-yp'),fym=v('vg-ym'),fzp=v('vg-zp'),fzm=v('vg-zm'),h=v('vg-h');
  if([fxp,fxm,fyp,fym,fzp,fzm,h].some(isNaN)||!h) return;
  const gx=(fxp-fxm)/(2*h), gy=(fyp-fym)/(2*h), gz=(fzp-fzm)/(2*h);
  const mag=Math.sqrt(gx*gx+gy*gy+gz*gz);
  res('vg-body',[
    ['∂f/∂x', fmt(gx), '(f(x+h,y,z)−f(x−h,y,z))/(2h)'],
    ['∂f/∂y', fmt(gy), ''],
    ['∂f/∂z', fmt(gz), ''],
    ['|∇f| (gradient magnitude)', fmt(mag), '√(gx²+gy²+gz²)'],
    ['Unit gradient direction', '('+fmt(gx/mag)+', '+fmt(gy/mag)+', '+fmt(gz/mag)+')', '']
  ]);
}

function vcDiv(){
  const fxp=v('vd-fxp'),fxm=v('vd-fxm'),fyp=v('vd-fyp'),fym=v('vd-fym'),fzp=v('vd-fzp'),fzm=v('vd-fzm'),h=v('vd-h');
  if([fxp,fxm,fyp,fym,fzp,fzm,h].some(isNaN)||!h) return;
  const dFx=(fxp-fxm)/(2*h), dFy=(fyp-fym)/(2*h), dFz=(fzp-fzm)/(2*h);
  const div=dFx+dFy+dFz;
  res('vd-body',[
    ['∂Fx/∂x', fmt(dFx), ''],
    ['∂Fy/∂y', fmt(dFy), ''],
    ['∂Fz/∂z', fmt(dFz), ''],
    ['∇·F (divergence)', fmt(div), 'sum of partials'],
    ['Interpretation', div>0?'Source (positive divergence)':div<0?'Sink (negative divergence)':'Solenoidal field', '']
  ]);
}

function vcCurl(){
  const h=v('vc-h');
  const fzyp=v('vc-fzyp'),fzym=v('vc-fzym'),fyzp=v('vc-fyzp'),fyzm=v('vc-fyzm');
  const fxzp=v('vc-fxzp'),fxzm=v('vc-fxzm'),fzxp=v('vc-fzxp'),fzxm=v('vc-fzxm');
  const fyxp=v('vc-fyxp'),fyxm=v('vc-fyxm'),fxyp=v('vc-fxyp'),fxym=v('vc-fxym');
  if(!h) return;
  // curl_x = dFz/dy − dFy/dz
  const cx=(fzyp-fzym)/(2*h) - (fyzp-fyzm)/(2*h);
  // curl_y = dFx/dz − dFz/dx
  const cy=(fxzp-fxzm)/(2*h) - (fzxp-fzxm)/(2*h);
  // curl_z = dFy/dx − dFx/dy
  const cz=(fyxp-fyxm)/(2*h) - (fxyp-fxym)/(2*h);
  const mag=Math.sqrt(cx*cx+cy*cy+cz*cz);
  res('vcc-body',[
    ['(∇×F)_x', fmt(cx), '∂Fz/∂y − ∂Fy/∂z'],
    ['(∇×F)_y', fmt(cy), '∂Fx/∂z − ∂Fz/∂x'],
    ['(∇×F)_z', fmt(cz), '∂Fy/∂x − ∂Fx/∂y'],
    ['|∇×F| (curl magnitude)', fmt(mag), ''],
    ['Interpretation', mag<1e-10?'Irrotational field (curl ≈ 0)':'Rotational field', '']
  ]);
}



function ysCalc(){
  const y=v('ys-y')*su('ys-y-u'), dpdx=v('ys-dp')*su('ys-dp-u');
  const rho=v('ys-rho')*su('ys-rho-u'), mu=v('ys-mu')*su('ys-mu-u');
  if(!y||!dpdx||!rho||!mu) return;
  const nu=mu/rho;
  const up=Math.pow(nu*dpdx/rho, 1/3);
  const ystar=y*up/nu;
  const body=document.getElementById('ys-out-body');
  if(!body) return;
  body.innerHTML=[
    ['Pressure velocity u_p', up.toExponential(4)+' m/s', 'u_p=(ν|dp/dx|/ρ)^(1/3)'],
    ['y*', ystar.toFixed(4), 'y·u_p/ν'],
    ['ν (kinematic viscosity)', nu.toExponential(4)+' m²/s', 'μ/ρ'],
    ['Interpretation', ystar<5?'Viscous sublayer (y*<5)':ystar<30?'Buffer layer':'Log-law region (y*>30)', '']
  ].map(([lbl,val,note])=>
    `<div class="out-row"><span class="out-label">${lbl}</span><span class="out-val">${val}${note?' <span style="opacity:.6;font-size:.75em;margin-left:6px">'+note+'</span>':''}</span></div>`
  ).join('');
  document.getElementById('ys-out').classList.add('visible');
}

(function(){
  var FONTS=['','font-serif','font-mono'];
  var LS=window.localStorage;

  function lsGet(k){try{return LS?LS.getItem(k):null;}catch(e){return null;}}
  function lsSet(k,v){try{if(LS)LS.setItem(k,v);}catch(e){}}

  function applyPrefs(){
    var dark=lsGet('acc_dark')==='1';
    var sz=lsGet('acc_sz')||'md';
    var fi=parseInt(lsGet('acc_fi')||'0');
    var b=document.body;
    // Theme
    b.classList.toggle('dark-mode',dark);
    b.classList.toggle('light-mode',!dark);
    // Size
    b.classList.remove('size-sm','size-md','size-lg');
    b.classList.add('size-'+sz);
    // Font
    b.classList.remove('font-serif','font-mono');
    if(FONTS[fi]) b.classList.add(FONTS[fi]);
    // Sync controls
    var cb=document.getElementById('acc-dark');
    if(cb) cb.checked=dark;
    ['sm','md','lg'].forEach(function(s){
      var el=document.getElementById('acc-'+s);
      if(el) el.classList.toggle('active',s===sz);
    });
    [0,1,2].forEach(function(i){
      var el=document.getElementById('acc-f'+i);
      if(el) el.classList.toggle('active',i===fi);
    });
  }

  window.accToggle=function(){
    var p=document.getElementById('acc-panel');
    if(p) p.classList.toggle('open');
  };
  window.accDark=function(cb){lsSet('acc_dark',cb.checked?'1':'0');applyPrefs();};
  window.accSize=function(s){lsSet('acc_sz',s);applyPrefs();};
  window.accFont=function(i){lsSet('acc_fi',i);applyPrefs();};

  // Close on outside click
  document.addEventListener('click',function(e){
    var p=document.getElementById('acc-panel');
    var b2=document.getElementById('acc-btn');
    if(p&&b2&&p.classList.contains('open')&&!p.contains(e.target)&&e.target!==b2)
      p.classList.remove('open');
  });

  // Apply on load (before DOMContentLoaded to avoid flash)
  applyPrefs();
  document.addEventListener('DOMContentLoaded',applyPrefs);
})();