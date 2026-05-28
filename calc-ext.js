/* ════════════════════════════════════════════════════════
   EXTENDED CALCULATORS
════════════════════════════════════════════════════════ */

/* ── MATHEMATICS ── */
function qdCalc(){
  const a=v('qd-a'),b=v('qd-b'),c=v('qd-c');
  if(!isFinite(a)||a===0) return errOut('qd-out','Coefficient a cannot be zero.');
  const disc=b*b-4*a*c;
  if(disc>=0){
    const x1=(-b+Math.sqrt(disc))/(2*a), x2=(-b-Math.sqrt(disc))/(2*a);
    showOut('qd-out',[
      {label:'Discriminant Δ',val:fmtN(disc),unit:''},
      {label:'Nature',val:disc===0?'One real root (repeated)':'Two distinct real roots',unit:''},
      {label:'x₁',val:fmtN(x1),unit:'',cls:'good'},
      {label:'x₂',val:fmtN(x2),unit:'',cls:'good'},
      {label:'Vertex x',val:fmtN(-b/(2*a)),unit:''},
      {label:'Vertex y',val:fmtN(c-b*b/(4*a)),unit:''},
    ]);
  } else {
    const re=-b/(2*a), im=Math.sqrt(-disc)/(2*a);
    showOut('qd-out',[
      {label:'Discriminant Δ',val:fmtN(disc),unit:''},
      {label:'Nature',val:'Complex conjugate roots',unit:'',cls:'warn'},
      {label:'x₁',val:`${fmtN(re)} + ${fmtN(im)}i`,unit:''},
      {label:'x₂',val:`${fmtN(re)} − ${fmtN(im)}i`,unit:''},
    ]);
  }
}

function sleCalc(){
  const tab=document.querySelector('#sle-tabs .tab.active').dataset.tab;
  if(tab==='2x2'){
    const a=v('sle-a11'),b=v('sle-a12'),c=v('sle-b1'),d=v('sle-a21'),e=v('sle-a22'),f=v('sle-b2');
    const det=a*e-b*d;
    if(Math.abs(det)<1e-12) return errOut('sle-out','System is singular (no unique solution).');
    const x=(c*e-b*f)/det, y=(a*f-c*d)/det;
    showOut('sle-out',[{label:'det(A)',val:fmtN(det),unit:''},{label:'x',val:fmtN(x),unit:'',cls:'good'},{label:'y',val:fmtN(y),unit:'',cls:'good'}]);
  } else {
    const a=[[v('sle-a11b'),v('sle-a12b'),v('sle-a13b')],[v('sle-a21b'),v('sle-a22b'),v('sle-a23b')],[v('sle-a31b'),v('sle-a32b'),v('sle-a33b')]];
    const b=[v('sle-b1b'),v('sle-b2b'),v('sle-b3b')];
    const det=a[0][0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
    if(Math.abs(det)<1e-12) return errOut('sle-out','System is singular.');
    const dx=b[0]*(a[1][1]*a[2][2]-a[1][2]*a[2][1])-a[0][1]*(b[1]*a[2][2]-a[1][2]*b[2])+a[0][2]*(b[1]*a[2][1]-a[1][1]*b[2]);
    const dy=a[0][0]*(b[1]*a[2][2]-a[1][2]*b[2])-b[0]*(a[1][0]*a[2][2]-a[1][2]*a[2][0])+a[0][2]*(a[1][0]*b[2]-b[1]*a[2][0]);
    const dz=a[0][0]*(a[1][1]*b[2]-b[1]*a[2][1])-a[0][1]*(a[1][0]*b[2]-b[1]*a[2][0])+b[0]*(a[1][0]*a[2][1]-a[1][1]*a[2][0]);
    showOut('sle-out',[{label:'det(A)',val:fmtN(det),unit:''},{label:'x',val:fmtN(dx/det),unit:'',cls:'good'},{label:'y',val:fmtN(dy/det),unit:'',cls:'good'},{label:'z',val:fmtN(dz/det),unit:'',cls:'good'}]);
  }
}

function matCalc(){
  const tab=document.querySelector('#mat-tabs .tab.active').dataset.tab;
  if(tab==='2x2'){
    const a=v('mat-a'),b=v('mat-b'),c=v('mat-c'),d=v('mat-d');
    const det=a*d-b*c;
    const tr=a+d;
    const disc=tr*tr-4*det;
    const rows=[{label:'det(A)',val:fmtN(det),unit:'',cls:det===0?'warn':'good'},{label:'trace',val:fmtN(tr),unit:''}];
    if(Math.abs(det)>1e-14){
      rows.push({label:'A⁻¹ row 1',val:`[${fmtN(d/det)}, ${fmtN(-b/det)}]`,unit:''});
      rows.push({label:'A⁻¹ row 2',val:`[${fmtN(-c/det)}, ${fmtN(a/det)}]`,unit:''});
    }
    if(disc>=0){
      rows.push({label:'λ₁',val:fmtN((tr+Math.sqrt(disc))/2),unit:''});
      rows.push({label:'λ₂',val:fmtN((tr-Math.sqrt(disc))/2),unit:''});
    } else {
      rows.push({label:'λ₁',val:`${fmtN(tr/2)} + ${fmtN(Math.sqrt(-disc)/2)}i`,unit:''});
      rows.push({label:'λ₂',val:`${fmtN(tr/2)} − ${fmtN(Math.sqrt(-disc)/2)}i`,unit:''});
    }
    showOut('mat-out',rows);
  } else {
    const r=[[v('mat3-a11'),v('mat3-a12'),v('mat3-a13')],[v('mat3-a21'),v('mat3-a22'),v('mat3-a23')],[v('mat3-a31'),v('mat3-a32'),v('mat3-a33')]];
    const det=r[0][0]*(r[1][1]*r[2][2]-r[1][2]*r[2][1])-r[0][1]*(r[1][0]*r[2][2]-r[1][2]*r[2][0])+r[0][2]*(r[1][0]*r[2][1]-r[1][1]*r[2][0]);
    const tr=r[0][0]+r[1][1]+r[2][2];
    showOut('mat-out',[
      {label:'det(A)',val:fmtN(det),unit:'',cls:Math.abs(det)<1e-10?'warn':'good'},
      {label:'trace',val:fmtN(tr),unit:''},
      {label:'Note',val:'Eigenvalues for 3×3 require numerical solver — use QR iteration in production.',unit:''},
    ]);
  }
}

function errpCalc(){
  const x=v('errp-x'),sx=v('errp-sx'),y=v('errp-y'),sy=v('errp-sy'),n=v('errp-n');
  const mode=g('errp-mode').value;
  let f,sf;
  if(mode==='add'){f=x+y;sf=Math.sqrt(sx*sx+sy*sy);}
  else if(mode==='sub'){f=x-y;sf=Math.sqrt(sx*sx+sy*sy);}
  else if(mode==='mul'){f=x*y;sf=Math.abs(f)*Math.sqrt((sx/x)**2+(sy/y)**2);}
  else if(mode==='div'){f=x/y;sf=Math.abs(f)*Math.sqrt((sx/x)**2+(sy/y)**2);}
  else{f=Math.pow(x,n);sf=Math.abs(n)*Math.pow(Math.abs(x),n-1)*sx;}
  showOut('errp-out',[
    {label:'Result f',val:fmtN(f),unit:'',cls:'good'},
    {label:'σf (absolute)',val:fmtN(sf),unit:''},
    {label:'σf/f (relative)',val:fmtN(Math.abs(sf/f)*100),unit:'%'},
    {label:'95% CI',val:`${fmtN(f-1.96*sf)} to ${fmtN(f+1.96*sf)}`,unit:''},
  ]);
}

function mcuCalc(){
  const mx=v('mcu-mx'),sx=v('mcu-sx'),my=v('mcu-my'),sy=v('mcu-sy');
  const N=Math.min(parseInt(g('mcu-N').value)||10000,50000);
  const mode=g('mcu-mode').value;
  function randn(){let u=0,v=0;while(!u)u=Math.random();while(!v)v=Math.random();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  const samples=[];
  for(let i=0;i<N;i++){
    const xi=mx+sx*randn(), yi=my+sy*randn();
    if(mode==='mul') samples.push(xi*yi);
    else if(mode==='div' && yi!==0) samples.push(xi/yi);
    else samples.push(xi+yi);
  }
  const mean=samples.reduce((a,b)=>a+b,0)/N;
  const std=Math.sqrt(samples.reduce((a,b)=>a+(b-mean)**2,0)/N);
  const sorted=[...samples].sort((a,b)=>a-b);
  const lo=sorted[Math.floor(0.025*N)], hi=sorted[Math.floor(0.975*N)];
  showOut('mcu-out',[
    {label:'N samples',val:N,unit:''},
    {label:'Mean f',val:fmtN(mean),unit:'',cls:'good'},
    {label:'Std dev σ',val:fmtN(std),unit:''},
    {label:'95% CI (low)',val:fmtN(lo),unit:''},
    {label:'95% CI (high)',val:fmtN(hi),unit:''},
  ],'Results vary slightly each run due to random sampling.');
}

/* ── STATISTICS ── */
function ciCalc(){
  const xbar=v('ci-xbar'),s=v('ci-s'),n=v('ci-n');
  const conf=parseFloat(g('ci-conf').value);
  if(n<1||s<0) return errOut('ci-out','Invalid inputs.');
  const zMap={90:1.645,95:1.96,99:2.576};
  const z=n<30?(conf===90?1.833:conf===95?2.045:2.756):zMap[conf];
  const me=z*s/Math.sqrt(n);
  showOut('ci-out',[
    {label:'Margin of error',val:fmtN(me),unit:'',cls:'good'},
    {label:'Lower bound',val:fmtN(xbar-me),unit:''},
    {label:'Upper bound',val:fmtN(xbar+me),unit:''},
    {label:'z/t critical',val:fmtN(z),unit:''},
    {label:'Standard error',val:fmtN(s/Math.sqrt(n)),unit:''},
  ],n<30?'Using t-approximation for n<30.':'Using z-distribution.');
}

function ssCalc(){
  const tab=document.querySelector('#ss-tabs .tab.active').dataset.tab;
  const conf=parseFloat(g('ss-conf').value);
  const z={90:1.645,95:1.96,99:2.576}[conf]||1.96;
  if(tab==='means'){
    const s=v('ss-s'),E=v('ss-E');
    if(s<=0||E<=0) return errOut('ss-out','Enter positive σ and E.');
    const n=Math.ceil((z*s/E)**2);
    showOut('ss-out',[{label:'Required n',val:n,unit:'',cls:'good'},{label:'z critical',val:fmtN(z),unit:''},{label:'σ/E ratio',val:fmtN(s/E),unit:''}]);
  } else {
    const p=v('ss-p')||0.5, E=v('ss-Ep');
    const n=Math.ceil(z*z*p*(1-p)/(E*E));
    showOut('ss-out',[{label:'Required n',val:n,unit:'',cls:'good'},{label:'p assumed',val:fmtN(p),unit:''},{label:'z critical',val:fmtN(z),unit:''}]);
  }
}

function cohCalc(){
  const m1=v('coh-m1'),m2=v('coh-m2'),s1=v('coh-s1'),s2=v('coh-s2');
  if(s1<=0||s2<=0) return errOut('coh-out','Standard deviations must be positive.');
  const sp=Math.sqrt((s1*s1+s2*s2)/2);
  const d=Math.abs(m1-m2)/sp;
  const interp=d<0.2?'Negligible':d<0.5?'Small':d<0.8?'Medium':'Large';
  showOut('coh-out',[
    {label:"Cohen's d",val:fmtN(d),unit:'',cls:'good'},
    {label:'Interpretation',val:interp,unit:''},
    {label:'Pooled SD',val:fmtN(sp),unit:''},
    {label:'Mean difference',val:fmtN(Math.abs(m1-m2)),unit:''},
  ]);
}

function chiCalc(){
  const obs=(g('chi-obs').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  const exp=(g('chi-exp').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  if(obs.length!==exp.length||obs.length<2) return errOut('chi-out','Enter equal-length observed and expected lists (≥2 values).');
  const chi2=obs.reduce((acc,o,i)=>acc+(o-exp[i])**2/exp[i],0);
  const df=obs.length-1;
  // simple p-value via chi-squared CDF approximation (Wilson-Hilferty)
  const z=(Math.cbrt(chi2/df)-( 1-2/(9*df)))/Math.sqrt(2/(9*df));
  const p=z>0?0.5*Math.exp(-0.717*z-0.416*z*z):1-0.5*Math.exp(-0.717*(-z)-0.416*z*z);
  const pApprox=Math.max(0,Math.min(1,p));
  showOut('chi-out',[
    {label:'χ²',val:fmtN(chi2),unit:'',cls:'good'},
    {label:'df',val:df,unit:''},
    {label:'p-value (approx)',val:fmtN(pApprox),unit:'',cls:pApprox<0.05?'warn':'good'},
    {label:'Significant (α=0.05)?',val:pApprox<0.05?'Yes — reject H₀':'No — fail to reject H₀',unit:''},
  ]);
}

function rmseCalc(){
  const act=(g('rmse-act').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  const pred=(g('rmse-pred').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  if(act.length!==pred.length||act.length<1) return errOut('rmse-out','Enter equal-length actual and predicted lists.');
  const n=act.length;
  const mae=act.reduce((a,y,i)=>a+Math.abs(y-pred[i]),0)/n;
  const mse=act.reduce((a,y,i)=>a+(y-pred[i])**2,0)/n;
  const rmse=Math.sqrt(mse);
  const mean_act=act.reduce((a,b)=>a+b,0)/n;
  const ss_tot=act.reduce((a,y)=>a+(y-mean_act)**2,0);
  const ss_res=act.reduce((a,y,i)=>a+(y-pred[i])**2,0);
  const r2=1-ss_res/ss_tot;
  const mape=act.reduce((a,y,i)=>a+Math.abs((y-pred[i])/y),0)/n*100;
  showOut('rmse-out',[
    {label:'n',val:n,unit:''},
    {label:'RMSE',val:fmtN(rmse),unit:'',cls:'good'},
    {label:'MAE',val:fmtN(mae),unit:''},
    {label:'R²',val:fmtN(r2),unit:'',cls:r2>0.9?'good':r2>0.7?'warn':'bad'},
    {label:'MAPE',val:fmtN(mape),unit:'%'},
  ]);
}

function logfCalc(){
  const b0=v('logf-b0'),b1=v('logf-b1'),x=v('logf-x');
  const z=b0+b1*x;
  const p=1/(1+Math.exp(-z));
  showOut('logf-out',[
    {label:'Linear predictor z',val:fmtN(z),unit:''},
    {label:'Probability p',val:fmtN(p),unit:'',cls:'good'},
    {label:'Odds p/(1-p)',val:fmtN(p/(1-p)),unit:''},
    {label:'Log-odds (logit)',val:fmtN(z),unit:''},
    {label:'Class prediction',val:p>=0.5?'1 (positive)':'0 (negative)',unit:''},
  ]);
}

/* ── SIGNAL PROCESSING ── */
function rmsCalc(){
  const mode=g('rms-mode').value;
  let vals=[];
  if(mode==='data'){
    vals=(g('rms-data').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
    if(vals.length<2) return errOut('rms-out','Enter at least 2 comma-separated values.');
  } else {
    const A=v('rms-A'),N=256;
    for(let i=0;i<N;i++) vals.push(A*(mode==='sine'?Math.sin(2*Math.PI*i/N):mode==='square'?(i<N/2?1:-1):1-4*Math.abs(i/N-Math.round(i/N))));
  }
  const n=vals.length;
  const mean=vals.reduce((a,b)=>a+b,0)/n;
  const rms=Math.sqrt(vals.reduce((a,b)=>a+b*b,0)/n);
  const peak=Math.max(...vals.map(Math.abs));
  const cf=rms>0?peak/rms:NaN;
  showOut('rms-out',[
    {label:'RMS',val:fmtN(rms),unit:'',cls:'good'},
    {label:'Peak',val:fmtN(peak),unit:''},
    {label:'Crest Factor',val:fmtN(cf),unit:''},
    {label:'Mean (DC)',val:fmtN(mean),unit:''},
    {label:'n samples',val:n,unit:''},
  ]);
}

function nyqCalc(){
  const fs=v('nyq-fs'),f=v('nyq-f'),N=v('nyq-N')||1024;
  if(fs<=0) return errOut('nyq-out','Sampling rate must be positive.');
  const fN=fs/2;
  const df=fs/N;
  const alias=f>fN?Math.abs(f-Math.round(f/fs)*fs):null;
  const rows=[
    {label:'Nyquist frequency',val:fmtN(fN),unit:'Hz',cls:'good'},
    {label:'Spectral resolution Δf',val:fmtN(df),unit:'Hz'},
    {label:'Signal aliased?',val:f>fN?'YES — aliasing occurs':'No — signal is resolved',unit:'',cls:f>fN?'warn':'good'},
  ];
  if(alias!==null) rows.push({label:'Alias frequency',val:fmtN(alias),unit:'Hz'});
  rows.push({label:'Min. fs needed',val:fmtN(2*f),unit:'Hz'});
  showOut('nyq-out',rows);
}

function mavCalc(){
  const vals=(g('mav-data').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  const W=Math.max(2,parseInt(v('mav-W'))||3);
  if(vals.length<W) return errOut('mav-out','Need more data points than window size.');
  const smooth=[];
  for(let i=W-1;i<vals.length;i++) smooth.push(vals.slice(i-W+1,i+1).reduce((a,b)=>a+b,0)/W);
  const orig_mean=vals.reduce((a,b)=>a+b,0)/vals.length;
  showOut('mav-out',[
    {label:'Window size',val:W,unit:'pts'},
    {label:'Original mean',val:fmtN(orig_mean),unit:''},
    {label:'Smoothed last value',val:fmtN(smooth[smooth.length-1]),unit:''},
    {label:'Smoothed values',val:smooth.map(x=>fmtN(x,3)).join(', '),unit:''},
  ]);
}

function hrvCalc(){
  const rr=(g('hrv-rr').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  if(rr.length<3) return errOut('hrv-out','Enter at least 3 RR intervals (ms).');
  const n=rr.length;
  const mean_rr=rr.reduce((a,b)=>a+b,0)/n;
  const hr=60000/mean_rr;
  const sdnn=Math.sqrt(rr.reduce((a,r)=>a+(r-mean_rr)**2,0)/n);
  const diffs=rr.slice(1).map((r,i)=>r-rr[i]);
  const rmssd=Math.sqrt(diffs.reduce((a,d)=>a+d*d,0)/(n-1));
  const pnn50=diffs.filter(d=>Math.abs(d)>50).length/(n-1)*100;
  showOut('hrv-out',[
    {label:'Mean HR',val:fmtN(hr),unit:'bpm',cls:'good'},
    {label:'Mean RR',val:fmtN(mean_rr),unit:'ms'},
    {label:'SDNN',val:fmtN(sdnn),unit:'ms'},
    {label:'RMSSD',val:fmtN(rmssd),unit:'ms'},
    {label:'pNN50',val:fmtN(pnn50),unit:'%'},
    {label:'Min RR',val:fmtN(Math.min(...rr)),unit:'ms'},
    {label:'Max RR',val:fmtN(Math.max(...rr)),unit:'ms'},
  ]);
}

function fftCalc(){
  const vals=(g('fft-data').value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  const fs=v('fft-fs')||1;
  const N=Math.min(vals.length,256);
  if(N<4) return errOut('fft-out','Enter at least 4 data points.');
  // DFT
  const re=new Array(N).fill(0), im=new Array(N).fill(0);
  for(let k=0;k<N/2;k++){
    for(let n=0;n<N;n++){
      const a=2*Math.PI*k*n/N;
      re[k]+=vals[n]*Math.cos(a);
      im[k]-=vals[n]*Math.sin(a);
    }
  }
  const mag=re.slice(0,N/2).map((r,i)=>Math.sqrt(r*r+im[i]*im[i])/N);
  mag[0]/=2;
  const df=fs/N;
  const peaks=mag.map((m,i)=>({m,f:i*df})).sort((a,b)=>b.m-a.m).slice(0,3);
  showOut('fft-out',[
    {label:'N (used)',val:N,unit:'pts'},
    {label:'Spectral resolution',val:fmtN(df),unit:'Hz'},
    {label:'DC component',val:fmtN(2*mag[0]),unit:''},
    {label:'Peak freq #1',val:fmtN(peaks[0].f),unit:'Hz',cls:'good'},
    {label:'Peak mag #1',val:fmtN(peaks[0].m),unit:''},
    {label:'Peak freq #2',val:fmtN(peaks[1].f),unit:'Hz'},
    {label:'Peak freq #3',val:fmtN(peaks[2]?.f??0),unit:'Hz'},
  ],'DFT computed directly (O(N²)) — suitable for N≤256.');
}

/* ── CONTROL SYSTEMS ── */
function pidCalc(){
  const Ku=v('pid-Ku'),Tu=v('pid-Tu');
  if(Ku<=0||Tu<=0) return errOut('pid-out','Ku and Tu must be positive.');
  showOut('pid-out',[
    {label:'— Classic Ziegler-Nichols (PID) —',val:'',unit:''},
    {label:'Kp',val:fmtN(0.6*Ku),unit:'',cls:'good'},
    {label:'Ki (= Kp/Ti)',val:fmtN(0.6*Ku/(0.5*Tu)),unit:''},
    {label:'Kd (= Kp·Td)',val:fmtN(0.6*Ku*0.125*Tu),unit:''},
    {label:'— Tyreus–Luyben (PID) —',val:'',unit:''},
    {label:'Kp',val:fmtN(Ku/3.2),unit:''},
    {label:'Ki',val:fmtN(Ku/(3.2*2.2*Tu)),unit:''},
    {label:'Kd',val:fmtN(Ku*Tu/(3.2*6.3)),unit:''},
  ],'Ti = 0.5·Tu, Td = 0.125·Tu (Classic Z-N). Tune further with process testing.');
}

function sosCalc(){
  const wn=v('sos-wn'),z=v('sos-zeta');
  if(wn<=0||z<0) return errOut('sos-out','ωn must be positive, ζ ≥ 0.');
  const wd=wn*Math.sqrt(Math.max(0,1-z*z));
  const os=z<1?Math.exp(-Math.PI*z/Math.sqrt(1-z*z))*100:0;
  const ts2=z>0?4/(z*wn):Infinity;
  const ts5=z>0?3/(z*wn):Infinity;
  const tr=z<1?(Math.PI-Math.acos(z))/(wd):NaN;
  const type=z===0?'Undamped':z<1?'Underdamped':z===1?'Critically damped':'Overdamped';
  showOut('sos-out',[
    {label:'System type',val:type,unit:'',cls:z<1?'warn':z===1?'good':''},
    {label:'Damped freq ωd',val:fmtN(wd),unit:'rad/s'},
    {label:'Peak overshoot',val:fmtN(os),unit:'%',cls:os>20?'warn':'good'},
    {label:'Rise time tr',val:isFinite(tr)?fmtN(tr):'—',unit:'s'},
    {label:'Settling time (2%)',val:isFinite(ts2)?fmtN(ts2):'—',unit:'s'},
    {label:'Settling time (5%)',val:isFinite(ts5)?fmtN(ts5):'—',unit:'s'},
  ]);
}

function gpmCalc(){
  const K=v('gpm-K'),t1=v('gpm-t1'),t2=v('gpm-t2');
  if(K<=0||t1<=0||t2<=0) return errOut('gpm-out','All values must be positive.');
  // G(s) = K / (s(τ1s+1)(τ2s+1)) — find gain crossover ωgc numerically
  let lo=0.001,hi=1e6,wgc=NaN;
  for(let i=0;i<60;i++){
    const wm=(lo+hi)/2;
    const mag=K/(wm*Math.sqrt(1+t1*t1*wm*wm)*Math.sqrt(1+t2*t2*wm*wm));
    if(mag>1) lo=wm; else hi=wm;
    if(Math.abs(mag-1)<1e-7){wgc=wm;break;}
  }
  wgc=(lo+hi)/2;
  const phase=-(90+Math.atan(t1*wgc)*180/Math.PI+Math.atan(t2*wgc)*180/Math.PI);
  const pm=180+phase;
  // phase crossover: where phase = -180
  // -90 - atan(τ1ω) - atan(τ2ω) = -180 → atan(τ1ω)+atan(τ2ω) = 90
  // → τ1τ2ω² = 1 → ωpc = 1/√(τ1τ2)
  const wpc=1/Math.sqrt(t1*t2);
  const magpc=K/(wpc*Math.sqrt(1+t1*t1*wpc*wpc)*Math.sqrt(1+t2*t2*wpc*wpc));
  const gm=20*Math.log10(1/magpc);
  showOut('gpm-out',[
    {label:'Gain crossover ωgc',val:fmtN(wgc),unit:'rad/s'},
    {label:'Phase margin',val:fmtN(pm),unit:'°',cls:pm>30?'good':pm>0?'warn':'bad'},
    {label:'Phase crossover ωpc',val:fmtN(wpc),unit:'rad/s'},
    {label:'Gain margin',val:fmtN(gm),unit:'dB',cls:gm>6?'good':gm>0?'warn':'bad'},
    {label:'Stability',val:(pm>0&&gm>0)?'Stable':'Unstable',unit:'',cls:(pm>0&&gm>0)?'good':'bad'},
  ]);
}

function cobCalc(){
  const a11=v('cob-a11'),a12=v('cob-a12'),a21=v('cob-a21'),a22=v('cob-a22');
  const b1=v('cob-b1'),b2=v('cob-b2'),c1=v('cob-c1'),c2=v('cob-c2');
  // Controllability matrix C = [B, AB]
  const ab1=a11*b1+a12*b2, ab2=a21*b1+a22*b2;
  const detC=b1*ab2-b2*ab1;
  // Observability matrix O = [C; CA]
  const ca1=c1*a11+c2*a21, ca2=c1*a12+c2*a22;
  const detO=c1*ca2-c2*ca1;
  showOut('cob-out',[
    {label:'det(Controllability)',val:fmtN(detC),unit:'',cls:Math.abs(detC)>1e-10?'good':'bad'},
    {label:'Controllable?',val:Math.abs(detC)>1e-10?'Yes':'No — rank deficient',unit:''},
    {label:'det(Observability)',val:fmtN(detO),unit:'',cls:Math.abs(detO)>1e-10?'good':'bad'},
    {label:'Observable?',val:Math.abs(detO)>1e-10?'Yes':'No — rank deficient',unit:''},
  ]);
}

/* ── MECHANICAL DESIGN ── */
function grCalc(){
  const N1=v('gr-N1'),N2=v('gr-N2'),rpm1=v('gr-rpm1'),T1=v('gr-T1'),eta=v('gr-eta')||1;
  if(N1<=0||N2<=0) return errOut('gr-out','Tooth counts must be positive.');
  const GR=N2/N1;
  const rpm2=rpm1/GR;
  const T2=T1*GR*eta;
  const P=T1*rpm1*2*Math.PI/60;
  showOut('gr-out',[
    {label:'Gear ratio GR',val:fmtN(GR),unit:'',cls:'good'},
    {label:'Output speed',val:fmtN(rpm2),unit:'RPM'},
    {label:'Output torque',val:fmtN(T2),unit:'N·m'},
    {label:'Power (input)',val:fmtN(P),unit:'W'},
  ]);
}

function brgCalc(){
  const C=v('brg-C')*su('brg-C-u'),P=v('brg-P')*su('brg-P-u'),n=v('brg-n');
  const type=g('brg-type').value;
  const p=type==='ball'?3:10/3;
  if(C<=0||P<=0||n<=0) return errOut('brg-out','All values must be positive.');
  const L10m=Math.pow(C/P,p);
  const L10h=L10m*1e6/(60*n);
  const L50h=L10h*5;
  showOut('brg-out',[
    {label:'L10 life',val:fmtN(L10m),unit:'× 10⁶ rev',cls:'good'},
    {label:'L10 life',val:fmtN(L10h),unit:'hours'},
    {label:'L50 life (median)',val:fmtN(L50h),unit:'hours'},
    {label:'C/P ratio',val:fmtN(C/P),unit:''},
  ],'ISO 281 basic rating life. Does not include lubrication or misalignment factors.');
}

function boltCalc(){
  const mode=g('bolt-mode').value;
  const K=v('bolt-K')||0.2, d=v('bolt-d')*su('bolt-d-u');
  if(d<=0) return errOut('bolt-out','Diameter must be positive.');
  if(mode==='T2F'){
    const T=v('bolt-T')*su('bolt-T-u');
    const F=T/(K*d);
    const At=Math.PI/4*(d-0.9743/v('bolt-pitch')*su('bolt-pitch-u'))**2;
    showOut('bolt-out',[
      {label:'Preload F',val:fmtN(F),unit:'N',cls:'good'},
      {label:'Clamping stress',val:fmtN(F/At),unit:'MPa'},
    ]);
  } else {
    const F=v('bolt-F')*su('bolt-F-u');
    const T=K*d*F;
    showOut('bolt-out',[{label:'Required torque T',val:fmtN(T),unit:'N·m',cls:'good'},{label:'Preload F',val:fmtN(F),unit:'N'}]);
  }
}

function sprCalc(){
  const mode=g('spr-mode').value;
  if(mode==='coil'){
    const dw=v('spr-dw')*su('spr-dw-u'),D=v('spr-D')*su('spr-D-u'),nc=v('spr-nc'),G=v('spr-G')*su('spr-G-u');
    if(dw<=0||D<=0||nc<=0||G<=0) return errOut('spr-out','All values must be positive.');
    const k=G*dw**4/(8*D**3*nc);
    const C=D/dw;
    const delta=v('spr-delta')*su('spr-delta-u');
    const F=k*delta;
    showOut('spr-out',[{label:'Spring rate k',val:fmtN(k),unit:'N/m',cls:'good'},{label:'Spring index C',val:fmtN(C),unit:''},{label:'Force at δ',val:fmtN(F),unit:'N'},{label:'Energy stored',val:fmtN(0.5*k*delta**2),unit:'J'}]);
  } else {
    const F=v('spr-F2')*su('spr-F2-u'),delta=v('spr-delta2')*su('spr-delta2-u');
    if(delta===0) return errOut('spr-out','Deflection cannot be zero.');
    const k=F/delta;
    showOut('spr-out',[{label:'Spring rate k',val:fmtN(k),unit:'N/m',cls:'good'},{label:'Energy stored',val:fmtN(0.5*F*delta),unit:'J'}]);
  }
}

function htzCalc(){
  const F=v('htz-F')*su('htz-F-u'),R1=v('htz-R1')*su('htz-R1-u');
  const R2v=v('htz-R2'), R2=(R2v===0||!isFinite(R2v))?Infinity:R2v*su('htz-R2-u');
  const E1=v('htz-E1')*1e9,nu1=v('htz-nu1'),E2=v('htz-E2')*1e9,nu2=v('htz-nu2');
  if(F<=0||R1<=0||E1<=0||E2<=0) return errOut('htz-out','Positive F, R1, E1, E2 required.');
  const Estar=1/((1-nu1**2)/E1+(1-nu2**2)/E2);
  const Rstar=1/(1/R1+(R2===Infinity?0:1/R2));
  const a=Math.cbrt(3*F*Rstar/(4*Estar));
  const p0=3*F/(2*Math.PI*a**2);
  showOut('htz-out',[
    {label:'Contact radius a',val:fmtN(a*1000),unit:'mm',cls:'good'},
    {label:'Peak pressure p₀',val:fmtN(p0/1e6),unit:'MPa'},
    {label:'Max shear stress depth',val:fmtN(0.48*a*1000),unit:'mm'},
    {label:'Max shear stress τ_max',val:fmtN(0.31*p0/1e6),unit:'MPa'},
    {label:'Effective modulus E*',val:fmtN(Estar/1e9),unit:'GPa'},
  ]);
}

function thrCalc(){
  const d=v('thr-d')*su('thr-d-u'),p=v('thr-p')*su('thr-p-u'),Sut=v('thr-Sut')*su('thr-Sut-u');
  if(d<=0||p<=0) return errOut('thr-out','Positive d and pitch required.');
  const At=Math.PI/4*(d-0.9743*p)**2;
  const Le_same=d, Le_al=1.5*d;
  showOut('thr-out',[
    {label:'Tensile stress area',val:fmtN(At*1e6),unit:'mm²'},
    {label:'Min engagement (same mat.)',val:fmtN(Le_same*1000),unit:'mm',cls:'good'},
    {label:'Min engagement (steel→Al)',val:fmtN(Le_al*1000),unit:'mm'},
    {label:'Shear area (per mm engage.)',val:fmtN(Math.PI*d*p/2*1e6),unit:'mm²/mm'},
  ]);
}

/* ── MATERIALS ENGINEERING ── */
function romCalc(){
  const Ef=v('rom-Ef')*su('rom-Ef-u'),Em=v('rom-Em')*su('rom-Em-u'),Vf=v('rom-Vf')/100;
  if(Ef<=0||Em<=0||Vf<=0||Vf>=1) return errOut('rom-out','E values must be positive; Vf between 0–100%.');
  const Vm=1-Vf;
  const Ec_long=Vf*Ef+Vm*Em;
  const Ec_trans=1/(Vf/Ef+Vm/Em);
  showOut('rom-out',[
    {label:'Vf',val:fmtN(Vf*100),unit:'%'},
    {label:'Vm',val:fmtN(Vm*100),unit:'%'},
    {label:'E longitudinal',val:fmtN(Ec_long/1e9),unit:'GPa',cls:'good'},
    {label:'E transverse',val:fmtN(Ec_trans/1e9),unit:'GPa'},
    {label:'Anisotropy ratio E₁/E₂',val:fmtN(Ec_long/Ec_trans),unit:''},
  ]);
}

function temCalc(){
  const E=v('tem-E')*su('tem-E-u'),nu=v('tem-nu'),a1=v('tem-a1')*1e-6,a2=v('tem-a2')*1e-6,dT=v('tem-dT');
  if(E<=0) return errOut('tem-out','E must be positive.');
  const da=Math.abs(a1-a2);
  const eps=da*dT;
  const sig=E*da*dT/(1-nu);
  showOut('tem-out',[
    {label:'Δα',val:fmtN(da*1e6),unit:'μm/(m·K)'},
    {label:'Thermal strain ε',val:fmtN(eps*1000),unit:'× 10⁻³'},
    {label:'Thermal stress σ (constrained)',val:fmtN(sig/1e6),unit:'MPa',cls:'good'},
    {label:'Tensile or compressive?',val:dT>0?(a1>a2?'Tensile in mat 1':'Compressive in mat 1'):'Reversed',unit:''},
  ]);
}

function crpCalc(){
  const A=v('crp-A'),n=v('crp-n'),Q=v('crp-Q')*1000,sig=v('crp-sig')*su('crp-sig-u'),T=v('crp-T')+273.15;
  const R=8.314;
  if(A<=0||T<=0||sig<=0) return errOut('crp-out','A, T, σ must be positive.');
  const edot=A*Math.pow(sig,n)*Math.exp(-Q/(R*T));
  const t1pct=0.01/edot/3600;
  showOut('crp-out',[
    {label:'Creep rate ε̇',val:fmtN(edot),unit:'s⁻¹',cls:'good'},
    {label:'Time to 1% strain',val:fmtN(t1pct),unit:'hours'},
    {label:'Time to 1% strain',val:fmtN(t1pct/8760),unit:'years'},
  ]);
}

function lmpCalc(){
  const T=v('lmp-T')+273.15,t=v('lmp-t'),C=v('lmp-C')||20;
  if(T<=0||t<=0) return errOut('lmp-out','T and t must be positive.');
  const P=T*(C+Math.log10(t));
  showOut('lmp-out',[
    {label:'Larson-Miller Parameter P',val:fmtN(P),unit:'K',cls:'good'},
    {label:'T (K)',val:fmtN(T),unit:'K'},
    {label:'log₁₀(t)',val:fmtN(Math.log10(t)),unit:''},
    {label:'Note',val:'Compare P to material Larson-Miller curves for rupture prediction.',unit:''},
  ]);
}

function tsaiCalc(){
  const Xt=v('tsai-Xt'),Xc=v('tsai-Xc'),Yt=v('tsai-Yt'),Yc=v('tsai-Yc'),S=v('tsai-S');
  const s1=v('tsai-s1'),s2=v('tsai-s2'),t12=v('tsai-t12');
  if(Xt<=0||Xc<=0||Yt<=0||Yc<=0||S<=0) return errOut('tsai-out','All strength values must be positive.');
  const F1=1/Xt-1/Xc, F2=1/Yt-1/Yc;
  const F11=1/(Xt*Xc), F22=1/(Yt*Yc), F66=1/(S*S);
  const FI=F1*s1+F2*s2+F11*s1**2+F22*s2**2+F66*t12**2;
  showOut('tsai-out',[
    {label:'Failure Index (FI)',val:fmtN(FI),unit:'',cls:FI>=1?'bad':'good'},
    {label:'Margin of Safety',val:fmtN(1/FI-1),unit:''},
    {label:'Failure?',val:FI>=1?'YES — failure predicted':'No — safe',unit:'',cls:FI>=1?'bad':'good'},
  ]);
}

/* ── COMPRESSIBLE FLOW ── */
function cflCalc(){
  const u=v('cfl-u')*su('cfl-u-u'),dt=v('cfl-dt'),dx=v('cfl-dx')*su('cfl-dx-u');
  if(dx<=0||dt<=0) return errOut('cfl-out','Δx and Δt must be positive.');
  const CFL=u*dt/dx;
  showOut('cfl-out',[
    {label:'CFL number',val:fmtN(CFL),unit:'',cls:CFL<=1?'good':CFL<=2?'warn':'bad'},
    {label:'Stability (explicit)',val:CFL<=1?'Stable (CFL ≤ 1)':CFL<=2?'Marginal — check scheme':'Unstable for explicit schemes',unit:''},
    {label:'Max stable Δt',val:fmtN(dx/u),unit:'s'},
  ],'CFL ≤ 1 required for most explicit time-marching schemes. Implicit schemes tolerate CFL > 1.');
}

function isoCalc(){
  const M=v('iso-M'),gam=v('iso-gam')||1.4;
  if(M<0) return errOut('iso-out','Mach number must be ≥ 0.');
  const base=1+(gam-1)/2*M*M;
  const P0P=Math.pow(base,gam/(gam-1));
  const T0T=base;
  const rho0rho=Math.pow(base,1/(gam-1));
  const AAstar=M>0?(1/M)*Math.pow(2/(gam+1)*base,(gam+1)/(2*(gam-1))):Infinity;
  showOut('iso-out',[
    {label:'Mach number M',val:fmtN(M),unit:'',cls:M<0.3?'good':M<1?'warn':''},
    {label:'P₀/P (total/static)',val:fmtN(P0P),unit:'',cls:'good'},
    {label:'T₀/T',val:fmtN(T0T),unit:''},
    {label:'ρ₀/ρ',val:fmtN(rho0rho),unit:''},
    {label:'A/A*',val:M>0?fmtN(AAstar):'∞',unit:''},
    {label:'Regime',val:M<0.3?'Incompressible':M<0.8?'Subsonic':M<1.2?'Transonic':'Supersonic',unit:''},
  ]);
}

function nshCalc(){
  const M1=v('nsh-M1'),gam=v('nsh-gam')||1.4;
  if(M1<1) return errOut('nsh-out','Upstream Mach M₁ must be ≥ 1 for a normal shock.');
  const M2sq=((gam-1)*M1*M1+2)/(2*gam*M1*M1-(gam-1));
  const M2=Math.sqrt(M2sq);
  const P2P1=(2*gam*M1*M1-(gam-1))/(gam+1);
  const T2T1=P2P1*(2+(gam-1)*M1*M1)/((gam+1)*M1*M1);
  const rho2rho1=(gam+1)*M1*M1/(2+(gam-1)*M1*M1);
  const P02P01=Math.pow((gam+1)*M1*M1/(2+(gam-1)*M1*M1),gam/(gam-1))*Math.pow((gam+1)/(2*gam*M1*M1-(gam-1)),1/(gam-1));
  showOut('nsh-out',[
    {label:'M₂',val:fmtN(M2),unit:'',cls:'good'},
    {label:'P₂/P₁',val:fmtN(P2P1),unit:''},
    {label:'T₂/T₁',val:fmtN(T2T1),unit:''},
    {label:'ρ₂/ρ₁',val:fmtN(rho2rho1),unit:''},
    {label:'P₀₂/P₀₁',val:fmtN(P02P01),unit:'',cls:'warn'},
    {label:'Entropy increase?',val:P02P01<1?'Yes (irreversible shock)':'No',unit:''},
  ]);
}

function oshCalc(){
  const M1=v('osh-M1'),theta=v('osh-theta')*Math.PI/180,gam=v('osh-gam')||1.4;
  if(M1<1) return errOut('osh-out','M₁ must be ≥ 1.');
  // Solve θ-β-M numerically via bisection
  const f=beta=>Math.tan(theta)-2/Math.tan(beta)*(M1*M1*Math.sin(beta)**2-1)/(M1*M1*(gam+Math.cos(2*beta))+2);
  let lo=theta+0.001,hi=Math.PI/2-0.001,beta=NaN;
  if(f(lo)*f(hi)>0) return errOut('osh-out','No attached shock solution — deflection exceeds detachment angle.');
  for(let i=0;i<60;i++){const m=(lo+hi)/2;f(m)>0?lo=m:hi=m;}
  beta=(lo+hi)/2;
  const Mn1=M1*Math.sin(beta);
  const Mn2sq=((gam-1)*Mn1**2+2)/(2*gam*Mn1**2-(gam-1));
  const M2=Math.sqrt(Mn2sq)/Math.sin(beta-theta);
  const P2P1=(2*gam*Mn1**2-(gam-1))/(gam+1);
  showOut('osh-out',[
    {label:'Shock angle β',val:fmtN(beta*180/Math.PI),unit:'°',cls:'good'},
    {label:'M₂',val:fmtN(M2),unit:''},
    {label:'P₂/P₁',val:fmtN(P2P1),unit:''},
    {label:'Mn₁ (normal component)',val:fmtN(Mn1),unit:''},
  ]);
}

function pmeCalc(){
  const M1=v('pme-M1'),dtheta=v('pme-dtheta')*Math.PI/180,gam=v('pme-gam')||1.4;
  if(M1<=1) return errOut('pme-out','M₁ must be > 1 for Prandtl-Meyer expansion.');
  const nu=M=>{const r=Math.sqrt((gam+1)/(gam-1));return r*Math.atan(Math.sqrt((gam-1)/(gam+1)*(M*M-1)))-Math.atan(Math.sqrt(M*M-1));};
  const nu1=nu(M1);
  const nu2=nu1+dtheta;
  // find M2 from nu2 via bisection
  let lo=M1,hi=20;
  for(let i=0;i<80;i++){const m=(lo+hi)/2;nu(m)<nu2?lo=m:hi=m;}
  const M2=(lo+hi)/2;
  const base1=1+(gam-1)/2*M1*M1, base2=1+(gam-1)/2*M2*M2;
  const P2P1=Math.pow(base1/base2,gam/(gam-1));
  showOut('pme-out',[
    {label:'ν(M₁)',val:fmtN(nu1*180/Math.PI),unit:'°'},
    {label:'ν(M₂)',val:fmtN(nu2*180/Math.PI),unit:'°'},
    {label:'M₂',val:fmtN(M2),unit:'',cls:'good'},
    {label:'P₂/P₁',val:fmtN(P2P1),unit:''},
  ]);
}

function pmpCalc(){
  const Q1=v('pmp-Q1'),H1=v('pmp-H1'),P1=v('pmp-P1'),N1=v('pmp-N1'),N2=v('pmp-N2');
  if(N1<=0||N2<=0) return errOut('pmp-out','Speeds must be positive.');
  const r=N2/N1;
  showOut('pmp-out',[
    {label:'Speed ratio N₂/N₁',val:fmtN(r),unit:'',cls:'good'},
    {label:'Q₂ (flow rate)',val:fmtN(Q1*r),unit:'(same unit as Q₁)'},
    {label:'H₂ (head)',val:fmtN(H1*r*r),unit:'(same unit as H₁)'},
    {label:'P₂ (power)',val:fmtN(P1*r*r*r),unit:'(same unit as P₁)'},
  ],'Pump affinity laws assume geometrically similar conditions and constant efficiency.');
}

function cavCalc(){
  const Pinlet=v('cav-Pi')*su('cav-Pi-u'),Pv=v('cav-Pv')*su('cav-Pv-u');
  const rho=v('cav-rho'),vel=v('cav-v'),g=9.81,NPSHr=v('cav-NPSHr');
  if(rho<=0) return errOut('cav-out','Density must be positive.');
  const NPSHa=(Pinlet-Pv)/(rho*g)+vel*vel/(2*g);
  const margin=NPSHa-NPSHr;
  showOut('cav-out',[
    {label:'NPSH available',val:fmtN(NPSHa),unit:'m',cls:margin>0?'good':'bad'},
    {label:'NPSH required',val:fmtN(NPSHr),unit:'m'},
    {label:'Cavitation margin',val:fmtN(margin),unit:'m',cls:margin>0.5?'good':margin>0?'warn':'bad'},
    {label:'Risk',val:margin>0.5?'Low':margin>0?'Marginal — add safety factor':'HIGH — cavitation likely',unit:''},
  ]);
}

function stkCalc(){
  const d=v('stk-d')*su('stk-d-u'),rhop=v('stk-rhop'),rhof=v('stk-rhof'),mu=v('stk-mu')*su('stk-mu-u');
  if(d<=0||mu<=0) return errOut('stk-out','d and μ must be positive.');
  const Vt=(rhop-rhof)*9.81*d*d/(18*mu);
  const Re=rhof*Math.abs(Vt)*d/mu;
  showOut('stk-out',[
    {label:'Settling velocity Vt',val:fmtN(Vt*1000),unit:'mm/s',cls:'good'},
    {label:'Particle Re',val:fmtN(Re),unit:'',cls:Re<0.5?'good':'warn'},
    {label:'Stokes regime valid?',val:Re<0.5?'Yes (Re < 0.5)':'No — use intermediate law',unit:''},
  ]);
}

function dim3Calc(){
  const rho=v('d3-rho'),V=v('d3-V')*su('d3-V-u'),L=v('d3-L')*su('d3-L-u');
  const mu=v('d3-mu')*su('d3-mu-u'),sig=v('d3-sig'),drho=v('d3-drho');
  const We=rho*V*V*L/sig;
  const Ca=mu*V/sig;
  const Bo=drho*9.81*L*L/sig;
  showOut('d3-out',[
    {label:'Weber number We',val:fmtN(We),unit:'',cls:'good'},
    {label:'  → We >> 1',val:'Inertia dominates surface tension',unit:''},
    {label:'Capillary number Ca',val:fmtN(Ca),unit:''},
    {label:'  → Ca << 1',val:'Surface tension dominates viscosity',unit:''},
    {label:'Bond number Bo',val:fmtN(Bo),unit:''},
    {label:'  → Bo >> 1',val:'Gravity dominates capillary forces',unit:''},
  ]);
}

function fanCalc(){
  const M1=v('fan-M1'),fLD=v('fan-fLD'),gam=v('fan-gam')||1.4;
  if(M1<=0) return errOut('fan-out','M₁ must be positive.');
  const fLstar=M=>( (1-M*M)/(gam*M*M)+(gam+1)/(2*gam)*Math.log((gam+1)*M*M/(2+(gam-1)*M*M)) );
  const fLs1=fLstar(M1);
  const fLs2=fLs1-fLD;
  if(fLs2<0) return errOut('fan-out','fL/D exceeds maximum — flow reaches M=1 before exit.');
  // find M2 from fLstar(M2) = fLs2
  const target=fLs2;
  let lo=M1<1?0.001:1.001,hi=M1<1?0.999:50,M2=NaN;
  for(let i=0;i<80;i++){const m=(lo+hi)/2;fLstar(m)>target?lo=m:hi=m;}
  M2=(lo+hi)/2;
  const T2T1=(1+(gam-1)/2*M1*M1)/(1+(gam-1)/2*M2*M2);
  const P2P1=M1/M2*Math.sqrt(T2T1);
  showOut('fan-out',[
    {label:'M₂',val:fmtN(M2),unit:'',cls:'good'},
    {label:'T₂/T₁',val:fmtN(T2T1),unit:''},
    {label:'P₂/P₁',val:fmtN(P2P1),unit:''},
    {label:'fL*/D at inlet',val:fmtN(fLs1),unit:''},
  ]);
}

function rayCalc(){
  const M1=v('ray-M1'),T02T01=v('ray-T02T01'),gam=v('ray-gam')||1.4;
  if(M1<=0||T02T01<=0) return errOut('ray-out','M₁ and T₀₂/T₀₁ must be positive.');
  const TT=(M,g)=>(g+1)*M*M/(1+g*M*M)**2*(1+(g-1)/2*M*M);
  const TTs1=TT(M1,gam);
  const TTs2=TTs1*T02T01;
  // solve TT(M2) = TTs2 numerically
  let lo=M1<1?0.001:1.001,hi=M1<1?0.999:50;
  for(let i=0;i<80;i++){const m=(lo+hi)/2;TT(m,gam)<TTs2?lo=m:hi=m;}
  const M2=(lo+hi)/2;
  const T2T1=(1+gam*M1*M1)**2*M2*M2/((1+gam*M2*M2)**2*M1*M1);
  const P2P1=(1+gam*M1*M1)/(1+gam*M2*M2);
  showOut('ray-out',[
    {label:'M₂',val:fmtN(M2),unit:'',cls:'good'},
    {label:'T₂/T₁',val:fmtN(T2T1),unit:''},
    {label:'P₂/P₁',val:fmtN(P2P1),unit:''},
  ]);
}

/* ── HEAT TRANSFER EXTENSIONS ── */
function biCalc(){
  const h=v('bi-h'),k=v('bi-k'),Lc=v('bi-Lc')*su('bi-Lc-u');
  if(h<=0||k<=0||Lc<=0) return errOut('bi-out','All values must be positive.');
  const Bi=h*Lc/k;
  showOut('bi-out',[
    {label:'Biot number Bi',val:fmtN(Bi),unit:'',cls:Bi<0.1?'good':'warn'},
    {label:'Lumped capacitance valid?',val:Bi<0.1?'Yes (Bi < 0.1)':'No — use distributed model',unit:''},
    {label:'Interpretation',val:Bi<0.1?'Internal resistance ≪ external':'Significant internal temperature gradient',unit:''},
  ]);
}

function foCalc(){
  const k=v('fo-k'),rho=v('fo-rho'),cp=v('fo-cp'),t=v('fo-t'),Lc=v('fo-Lc')*su('fo-Lc-u');
  if(k<=0||rho<=0||cp<=0||t<=0||Lc<=0) return errOut('fo-out','All values must be positive.');
  const alpha=k/(rho*cp);
  const Fo=alpha*t/(Lc*Lc);
  showOut('fo-out',[
    {label:'Thermal diffusivity α',val:fmtN(alpha*1e6),unit:'mm²/s',cls:'good'},
    {label:'Fourier number Fo',val:fmtN(Fo),unit:''},
    {label:'Interpretation',val:Fo>0.2?'Quasi-steady (Fo > 0.2)':'Transient dominated',unit:''},
  ]);
}

function lcCalc(){
  const Ti=v('lc-Ti'),Tinf=v('lc-Tinf'),h=v('lc-h'),rho=v('lc-rho'),cp=v('lc-cp'),VA=v('lc-VA'),t=v('lc-t');
  if(h<=0||rho<=0||cp<=0||VA<=0) return errOut('lc-out','h, ρ, cp, V/A must be positive.');
  const tau=rho*cp*VA/h;
  const Tt=Tinf+(Ti-Tinf)*Math.exp(-t/tau);
  const t90=tau*Math.log(10);
  const t95=tau*Math.log(20);
  showOut('lc-out',[
    {label:'Time constant τ',val:fmtN(tau),unit:'s',cls:'good'},
    {label:'T at t',val:fmtN(Tt),unit:'°C'},
    {label:'Time to 90% equil.',val:fmtN(t90),unit:'s'},
    {label:'Time to 95% equil.',val:fmtN(t95),unit:'s'},
  ],'Valid only when Bi < 0.1.');
}

function lmtdCalc(){
  const Thi=v('lmtd-Thin'),Tho=v('lmtd-Thout'),Tci=v('lmtd-Tcin'),Tco=v('lmtd-Tcout');
  const dT1=Thi-Tco, dT2=Tho-Tci;
  if(dT1<=0||dT2<=0) return errOut('lmtd-out','Temperature differences must be positive. Check arrangement.');
  const lmtd=Math.abs(dT1-dT2)<0.001?dT1:(dT1-dT2)/Math.log(dT1/dT2);
  showOut('lmtd-out',[
    {label:'LMTD',val:fmtN(lmtd),unit:'°C',cls:'good'},
    {label:'ΔT₁ (T_h,in − T_c,out)',val:fmtN(dT1),unit:'°C'},
    {label:'ΔT₂ (T_h,out − T_c,in)',val:fmtN(dT2),unit:'°C'},
    {label:'Arrangement',val:'Counter-flow (more efficient)',unit:''},
  ]);
}
function lmtdParCalc(){
  const Thi=v('lmtdp-Thin'),Tho=v('lmtdp-Thout'),Tci=v('lmtdp-Tcin'),Tco=v('lmtdp-Tcout');
  const dT1=Thi-Tci, dT2=Tho-Tco;
  if(dT1<=0||dT2<=0) return errOut('lmtdp-out','Temperature differences must be positive. Check arrangement.');
  const lmtd=Math.abs(dT1-dT2)<0.001?dT1:(dT1-dT2)/Math.log(dT1/dT2);
  showOut('lmtdp-out',[
    {label:'LMTD',val:fmtN(lmtd),unit:'°C',cls:'good'},
    {label:'ΔT₁ (T_h,in − T_c,in)',val:fmtN(dT1),unit:'°C'},
    {label:'ΔT₂ (T_h,out − T_c,out)',val:fmtN(dT2),unit:'°C'},
    {label:'Arrangement',val:'Parallel-flow',unit:''},
  ]);
}

function entuCalc(){
  const Ch=v('entu-Ch'),Cc=v('entu-Cc'),NTU=v('entu-NTU');
  const type=g('entu-type').value;
  if(Ch<=0||Cc<=0||NTU<=0) return errOut('entu-out','All values must be positive.');
  const Cmin=Math.min(Ch,Cc),Cmax=Math.max(Ch,Cc),Cr=Cmin/Cmax;
  let eps;
  if(type==='counter'){eps=Cr<1?(1-Math.exp(-NTU*(1-Cr)))/(1-Cr*Math.exp(-NTU*(1-Cr))):(NTU/(1+NTU));}
  else if(type==='parallel'){eps=(1-Math.exp(-NTU*(1+Cr)))/(1+Cr);}
  else{// shell-and-tube 1-2
    const E=Math.exp(-NTU*Math.sqrt(1+Cr*Cr));
    eps=2/(1+Cr+Math.sqrt(1+Cr*Cr)*(1+E)/(1-E));
  }
  const Qmax=Cmin*Math.abs(v('entu-Thi')-v('entu-Tci'));
  const Q=eps*Qmax;
  showOut('entu-out',[
    {label:'Effectiveness ε',val:fmtN(eps),unit:'',cls:'good'},
    {label:'Capacity ratio Cr',val:fmtN(Cr),unit:''},
    {label:'Q (if T given)',val:isFinite(Q)&&Q>0?fmtN(Q):'—',unit:'W'},
  ]);
}

/* ── MASS TRANSFER ── */
function fickCalc(){
  const D=v('fick-D')*su('fick-D-u'),dC=v('fick-dC'),L=v('fick-L')*su('fick-L-u');
  if(D<=0||L<=0) return errOut('fick-out','D and L must be positive.');
  const J=D*dC/L;
  const t_diff=L*L/D;
  showOut('fick-out',[
    {label:'Flux J',val:fmtN(J),unit:'mol/(m²·s)',cls:'good'},
    {label:'Diffusion timescale',val:fmtN(t_diff),unit:'s'},
    {label:'Diffusion timescale',val:fmtN(t_diff/60),unit:'min'},
  ]);
}

function scCalc(){
  const mu=v('sc-mu')*su('sc-mu-u'),rho=v('sc-rho'),D=v('sc-D')*su('sc-D-u');
  if(mu<=0||rho<=0||D<=0) return errOut('sc-out','All values must be positive.');
  const nu=mu/rho;
  const Sc=nu/D;
  showOut('sc-out',[
    {label:'Schmidt number Sc',val:fmtN(Sc),unit:'',cls:'good'},
    {label:'ν (kinematic visc.)',val:fmtN(nu),unit:'m²/s'},
    {label:'Interpretation',val:Sc>1?'Momentum diffusion faster than mass':'Mass diffusion faster than momentum',unit:''},
  ]);
}

function shCalc(){
  const Re=v('sh-Re'),Sc=v('sh-Sc'),L=v('sh-L')*su('sh-L-u'),D=v('sh-D')*su('sh-D-u');
  if(Re<=0||Sc<=0||D<=0||L<=0) return errOut('sh-out','All values must be positive.');
  const Sh=0.023*Math.pow(Re,0.8)*Math.pow(Sc,0.333);
  const hm=Sh*D/L;
  showOut('sh-out',[
    {label:'Sherwood number Sh',val:fmtN(Sh),unit:'',cls:'good'},
    {label:'Mass transfer coeff hm',val:fmtN(hm),unit:'m/s'},
    {label:'Analogy note',val:'Dittus-Boelter analogy (turbulent pipe)',unit:''},
  ]);
}

function mflxCalc(){
  const tab=document.querySelector('#mflx-tabs .tab.active').dataset.tab;
  if(tab==='diff'){
    const Pm=v('mflx-Pm'),dC=v('mflx-dC'),A=v('mflx-A');
    const J=Pm*dC;
    showOut('mflx-out',[{label:'Flux J',val:fmtN(J),unit:'mol/(m²·s)',cls:'good'},{label:'Total flow (×A)',val:isFinite(A)&&A>0?fmtN(J*A):'—',unit:'mol/s'}]);
  } else {
    const Lp=v('mflx-Lp'),dP=v('mflx-dP')*su('mflx-dP-u'),dpi=v('mflx-dpi')*su('mflx-dpi-u'),A=v('mflx-A2');
    const J=Lp*(dP-dpi);
    showOut('mflx-out',[{label:'Filtration flux J',val:fmtN(J*1e6),unit:'μm/s',cls:J>0?'good':'warn'},{label:'Total flow (×A)',val:isFinite(A)&&A>0?fmtN(J*A*1e6):'—',unit:'μL/s'}]);
  }
}

/* ── CHEMICAL ENGINEERING ── */
function iglCalc(){
  const mode=g('igl-mode').value;
  const R=8.314;
  const P=v('igl-P')*su('igl-P-u'), V=v('igl-V'), n=v('igl-n'), T=v('igl-T')+273.15;
  if(mode==='P'){ const Pout=n*R*T/V; showOut('igl-out',[{label:'Pressure P',val:fmtN(Pout/1000),unit:'kPa',cls:'good'},{label:'P',val:fmtN(Pout/101325),unit:'atm'}]); }
  else if(mode==='V'){ const Vout=n*R*T/P; showOut('igl-out',[{label:'Volume V',val:fmtN(Vout),unit:'m³',cls:'good'},{label:'V',val:fmtN(Vout*1000),unit:'L'}]); }
  else if(mode==='n'){ const nout=P*V/(R*T); showOut('igl-out',[{label:'Moles n',val:fmtN(nout),unit:'mol',cls:'good'}]); }
  else { const Tout=P*V/(n*R)-273.15; showOut('igl-out',[{label:'Temperature T',val:fmtN(Tout),unit:'°C',cls:'good'},{label:'T',val:fmtN(Tout+273.15),unit:'K'}]); }
}

function antCalc(){
  const preset=g('ant-preset').value;
  let A,B,C;
  const presets={water:[8.07131,1730.63,233.426],ethanol:[8.20417,1642.89,230.300],acetone:[7.02447,1161.0,224.0],toluene:[6.95334,1343.943,219.377]};
  if(preset!=='custom'){[A,B,C]=presets[preset];}
  else{A=v('ant-A');B=v('ant-B');C=v('ant-C');}
  const T=v('ant-T');
  const logP=A-B/(C+T);
  const P_mmHg=Math.pow(10,logP);
  showOut('ant-out',[
    {label:'log₁₀(P)',val:fmtN(logP),unit:''},
    {label:'Vapor pressure',val:fmtN(P_mmHg),unit:'mmHg',cls:'good'},
    {label:'Vapor pressure',val:fmtN(P_mmHg*133.322),unit:'Pa'},
    {label:'Vapor pressure',val:fmtN(P_mmHg/750.062),unit:'bar'},
  ]);
}

function cstrCalc(){
  const F0=v('cstr-F0'),CA0=v('cstr-CA0'),X=v('cstr-X')/100,k=v('cstr-k');
  if(F0<=0||CA0<=0||X<=0||X>=1||k<=0) return errOut('cstr-out','Check inputs: X must be 0–100%, k>0.');
  const CA=CA0*(1-X);
  const rA=k*CA;
  const V=F0*CA0*X/rA;
  const tau=V/F0;
  showOut('cstr-out',[
    {label:'Reactor volume V',val:fmtN(V),unit:'m³',cls:'good'},
    {label:'CA,out',val:fmtN(CA),unit:'mol/m³'},
    {label:'Residence time τ',val:fmtN(tau),unit:'s'},
    {label:'Conversion X',val:fmtN(X*100),unit:'%'},
  ]);
}

function pfrCalc(){
  const F0=v('pfr-F0'),CA0=v('pfr-CA0'),X=v('pfr-X')/100,k=v('pfr-k');
  if(F0<=0||CA0<=0||X<=0||X>=1||k<=0) return errOut('pfr-out','Check inputs: X must be 0–100%, k>0.');
  const V=F0/k*(-Math.log(1-X));
  const tau=V/F0;
  const V_cstr=F0*CA0*X/(k*CA0*(1-X));
  showOut('pfr-out',[
    {label:'PFR volume V',val:fmtN(V),unit:'m³',cls:'good'},
    {label:'Residence time τ',val:fmtN(tau),unit:'s'},
    {label:'CSTR volume (same X)',val:fmtN(V_cstr),unit:'m³'},
    {label:'PFR/CSTR volume ratio',val:fmtN(V/V_cstr),unit:''},
  ],'PFR is more efficient than CSTR for positive-order reactions (V_PFR < V_CSTR).');
}

function damCalc(){
  const k=v('dam-k'),tau=v('dam-tau'),D=v('dam-D')*su('dam-D-u'),L=v('dam-L')*su('dam-L-u'),Dif=v('dam-Dif')*su('dam-Dif-u');
  const Da1=k*tau;
  const Da2=k*L*L/Dif;
  showOut('dam-out',[
    {label:'Da I (conv.)',val:fmtN(Da1),unit:'',cls:'good'},
    {label:'  Regime (Da I)',val:Da1<0.1?'Transport limited':Da1>10?'Reaction limited':'Mixed',unit:''},
    {label:'Da II (diff.)',val:fmtN(Da2),unit:''},
    {label:'  Regime (Da II)',val:Da2<0.1?'Kinetically limited':Da2>10?'Diffusion limited':'Mixed',unit:''},
  ]);
}

function vdwCalc(){
  const P=v('vdw-P')*su('vdw-P-u'),T=v('vdw-T')+273.15;
  const preset=g('vdw-preset').value;
  const gases={ideal:[0,0],co2:[0.3658,4.286e-5],n2:[0.1370,3.87e-5],h2o:[0.5536,3.049e-5],ch4:[0.2303,4.306e-5],custom:[v('vdw-a'),v('vdw-b')]};
  const [a,b]=gases[preset]||[0,0];
  const R=8.314;
  const Videal=R*T/P;
  // iterative: V = RT/(P + a/V²) + b
  let V=Videal;
  for(let i=0;i<50;i++) V=R*T/(P+a/(V*V))+b;
  const Z=P*V/(R*T);
  showOut('vdw-out',[
    {label:'Molar volume V',val:fmtN(V*1000),unit:'L/mol',cls:'good'},
    {label:'Compressibility Z',val:fmtN(Z),unit:''},
    {label:'Ideal gas Z',val:'1.000',unit:''},
    {label:'Deviation from ideal',val:fmtN(Math.abs(Z-1)*100),unit:'%',cls:Math.abs(Z-1)>0.05?'warn':'good'},
  ]);
}

/* ── BIOMEDICAL EXTENSIONS ── */
function wkCalc(){
  const R=v('wk-R'),C=v('wk-C'),Q=v('wk-Q')/1e6,HR=v('wk-HR');
  if(R<=0||C<=0||Q<=0) return errOut('wk-out','R, C, Q must be positive.');
  const MAP=Q*R;
  const tau=R*C;
  const T=60/HR;
  const td=2*T/3; // diastole ~ 2/3 of cycle
  const Psys=MAP+Q*R*(1-Math.exp(-td/tau))/(1-Math.exp(-T/tau));
  const Pdias=Psys*Math.exp(-T/tau);
  showOut('wk-out',[
    {label:'Mean arterial pressure',val:fmtN(MAP/133.322),unit:'mmHg',cls:'good'},
    {label:'RC time constant',val:fmtN(tau),unit:'s'},
    {label:'Systolic est.',val:fmtN(Psys/133.322),unit:'mmHg'},
    {label:'Diastolic est.',val:fmtN(Pdias/133.322),unit:'mmHg'},
  ],'2-element Windkessel. Simplified — does not model wave reflections.');
}

function pwvCalc(){
  const E=v('pwv-E')*su('pwv-E-u'),h=v('pwv-h')*su('pwv-h-u'),r=v('pwv-r')*su('pwv-r-u'),rho=v('pwv-rho');
  if(E<=0||h<=0||r<=0||rho<=0) return errOut('pwv-out','All values must be positive.');
  const pwv=Math.sqrt(E*h/(2*rho*r));
  showOut('pwv-out',[
    {label:'PWV (Moens-Korteweg)',val:fmtN(pwv),unit:'m/s',cls:pwv<7?'good':'warn'},
    {label:'Normal range (young)',val:'4 – 7 m/s',unit:''},
    {label:'Stiffness assessment',val:pwv<7?'Within normal range':pwv<10?'Mildly elevated':'Significantly elevated (stiff artery)',unit:''},
  ]);
}

function mmCalc(){
  const Vmax=v('mm-Vmax'),Km=v('mm-Km'),S=v('mm-S');
  if(Vmax<=0||Km<=0||S<0) return errOut('mm-out','Vmax and Km must be positive.');
  const velo=Vmax*S/(Km+S);
  showOut('mm-out',[
    {label:'Reaction velocity v',val:fmtN(velo),unit:'(same as Vmax)',cls:'good'},
    {label:'v/Vmax',val:fmtN(velo/Vmax),unit:''},
    {label:'Regime',val:S>>Km?'Saturated (v ≈ Vmax)':S<<Km?'Linear (v ≈ Vmax·[S]/Km)':'Mixed',unit:''},
    {label:'Lineweaver-Burk 1/v',val:fmtN(1/velo),unit:''},
    {label:'LB slope (Km/Vmax)',val:fmtN(Km/Vmax),unit:''},
  ]);
}

function hillCalc(){
  const K=v('hill-K'),n=v('hill-n'),S=v('hill-S');
  if(K<=0||n<=0||S<0) return errOut('hill-out','K and n must be positive.');
  const Y=Math.pow(S,n)/(Math.pow(K,n)+Math.pow(S,n));
  showOut('hill-out',[
    {label:'Fractional occupancy Y',val:fmtN(Y),unit:'',cls:'good'},
    {label:'Hill coefficient n',val:fmtN(n),unit:'',cls:n>1?'warn':''},
    {label:'Cooperativity',val:n>1?'Positive (sigmoid)':n<1?'Negative':'Hyperbolic (MM)',unit:''},
    {label:'EC50 K',val:fmtN(K),unit:'(same as [S])'},
  ]);
}

function cdtCalc(){
  const N0=v('cdt-N0'),N=v('cdt-N'),t=v('cdt-t');
  if(N0<=0||N<=N0||t<=0) return errOut('cdt-out','N > N₀ and t > 0 required.');
  const td=t*Math.log(2)/Math.log(N/N0);
  showOut('cdt-out',[{label:'Doubling time td',val:fmtN(td),unit:'(same time unit)',cls:'good'},{label:'Doublings',val:fmtN(Math.log2(N/N0)),unit:''}]);
}
function cdtPredCalc(){
  const N0=v('cdtp-N0'),td=v('cdtp-td'),t=v('cdtp-t');
  if(N0<=0||td<=0||t<=0) return errOut('cdtp-out','All values must be positive.');
  const N=N0*Math.pow(2,t/td);
  showOut('cdtp-out',[{label:'Cell count N(t)',val:fmtN(N),unit:'',cls:'good'},{label:'Doublings',val:fmtN(t/td),unit:''}]);
}

function pkCalc(){
  const C0=v('pk-C0'),k=v('pk-ke'),t=v('pk-t');
  if(C0<=0||k<=0||t<0) return errOut('pk-out','C0, k > 0; t ≥ 0.');
  const Ct=C0*Math.exp(-k*t);
  const t12=Math.log(2)/k;
  const AUCt=C0/k*(1-Math.exp(-k*t));
  const AUCinf=C0/k;
  showOut('pk-out',[
    {label:'C(t)',val:fmtN(Ct),unit:'(same as C₀)',cls:'good'},
    {label:'t½',val:fmtN(t12),unit:'(same time unit)'},
    {label:'AUC (0→t)',val:fmtN(AUCt),unit:''},
    {label:'AUC (0→∞)',val:fmtN(AUCinf),unit:''},
  ]);
}

function doseCalc(){
  const Ct=v('dose-Ct'),Vd=v('dose-Vd'),F=v('dose-F')||1,CL=v('dose-CL'),tau=v('dose-tau');
  if(Ct<=0||Vd<=0||F<=0) return errOut('dose-out','Ct, Vd, F must be positive.');
  const LD=Ct*Vd/F;
  const MD=CL*Ct*tau/F;
  showOut('dose-out',[
    {label:'Loading dose LD',val:fmtN(LD),unit:'(same mass unit as Ct×Vd)',cls:'good'},
    {label:'Maintenance dose MD',val:isFinite(MD)&&MD>0?fmtN(MD):'— (enter CL and τ)',unit:''},
    {label:'CL·τ/F',val:CL>0?fmtN(CL*tau/F):'—',unit:''},
  ]);
}

/* ── FEA TOOLS ── */
function gciCalc(){
  const f1=v('gci-f1'),f2=v('gci-f2'),f3=v('gci-f3'),r=v('gci-r')||Math.SQRT2;
  if(r<=1) return errOut('gci-out','Refinement ratio r must be > 1.');
  const e32=(f3-f2)/f2, e21=(f2-f1)/f1;
  const p=Math.log(Math.abs(e32/e21))/Math.log(r);
  const f_exact=f1+(f1-f2)/(Math.pow(r,p)-1);
  const Fs=1.25;
  const GCI21=Fs*Math.abs(e21)/(Math.pow(r,p)-1);
  const GCI32=Fs*Math.abs(e32)/(Math.pow(r,p)-1);
  const asym=GCI21/(Math.pow(r,p)*GCI32);
  showOut('gci-out',[
    {label:'Order of convergence p',val:fmtN(p),unit:'',cls:p>1?'good':'warn'},
    {label:'Extrapolated value',val:fmtN(f_exact),unit:'',cls:'good'},
    {label:'GCI₂₁ (fine grid)',val:fmtN(GCI21*100),unit:'%'},
    {label:'GCI₃₂ (medium grid)',val:fmtN(GCI32*100),unit:'%'},
    {label:'Asymptotic range check',val:Math.abs(asym-1)<0.25?'Yes — in asymptotic range':'No — refine further',unit:'',cls:Math.abs(asym-1)<0.25?'good':'warn'},
  ],'Roache GCI method. Fs = 1.25 safety factor for 3-grid studies.');
}

function arqCalc(){
  const L1=v('arq-L1'),L2=v('arq-L2'),L3=v('arq-L3'),L4=v('arq-L4');
  const sides=[L1,L2,L3,L4].filter(x=>isFinite(x)&&x>0);
  if(sides.length<2) return errOut('arq-out','Enter at least 2 side lengths.');
  const AR=Math.max(...sides)/Math.min(...sides);
  showOut('arq-out',[
    {label:'Aspect ratio',val:fmtN(AR),unit:'',cls:AR<3?'good':AR<5?'warn':'bad'},
    {label:'Quality',val:AR<3?'Good':AR<5?'Acceptable — monitor':'Poor — consider remeshing',unit:''},
    {label:'Max / Min length',val:`${fmtN(Math.max(...sides))} / ${fmtN(Math.min(...sides))}`,unit:''},
  ]);
}

function exptsCalc(){
  const tab=document.querySelector('#expts-tabs .tab.active').dataset.tab;
  if(tab==='struct'){
    const L=v('expts-L')*su('expts-L-u'),E=v('expts-E')*1e9,rho=v('expts-rho');
    if(L<=0||E<=0||rho<=0) return errOut('expts-out','All values must be positive.');
    const c=Math.sqrt(E/rho);
    const dt=L/c;
    showOut('expts-out',[{label:'Wave speed c',val:fmtN(c),unit:'m/s',cls:'good'},{label:'Critical Δt',val:fmtN(dt*1e6),unit:'μs'},{label:'Recommended Δt',val:fmtN(dt*0.9e6),unit:'μs (0.9 × critical)'}]);
  } else {
    const L=v('expts-dx')*su('expts-dx-u'),u=v('expts-u')*su('expts-u-u');
    if(L<=0||u<=0) return errOut('expts-out','Δx and u must be positive.');
    const dt=L/u;
    showOut('expts-out',[{label:'Max stable Δt (CFL=1)',val:fmtN(dt*1e6),unit:'μs',cls:'good'},{label:'Recommended (CFL=0.8)',val:fmtN(dt*0.8e6),unit:'μs'}]);
  }
}

function mpfCalc(){
  const m=[v('mpf-m1'),v('mpf-m2'),v('mpf-m3')];
  const phi=[v('mpf-p1'),v('mpf-p2'),v('mpf-p3')];
  if(m.some(x=>x<=0)) return errOut('mpf-out','All masses must be positive.');
  const Lm=phi.reduce((a,p,i)=>a+p*m[i],0);
  const Mm=phi.reduce((a,p,i)=>a+p*p*m[i],0);
  const Mtot=m.reduce((a,b)=>a+b,0);
  const gamma=Lm/Mm;
  const Meff=Lm*Lm/Mm;
  showOut('mpf-out',[
    {label:'Γ (participation factor)',val:fmtN(gamma),unit:'',cls:'good'},
    {label:'Effective mass',val:fmtN(Meff),unit:'kg'},
    {label:'Effective mass fraction',val:fmtN(Meff/Mtot*100),unit:'%'},
  ],'For the first mode. Sum effective mass fractions across all modes to verify ≥90% total mass captured.');
}

/* ── AEROSPACE ── */
function ldCalc(){
  const rho=v('ld-rho'),V=v('ld-V')*su('ld-V-u'),S=v('ld-S'),CL=v('ld-CL'),CD=v('ld-CD');
  if(rho<=0||V<=0||S<=0) return errOut('ld-out','ρ, V, S must be positive.');
  const q=0.5*rho*V*V;
  const L=q*S*CL, D=q*S*CD;
  showOut('ld-out',[
    {label:'Dynamic pressure q',val:fmtN(q),unit:'Pa'},
    {label:'Lift L',val:fmtN(L),unit:'N',cls:'good'},
    {label:'Drag D',val:fmtN(D),unit:'N'},
    {label:'L/D ratio',val:CD>0?fmtN(CL/CD):'—',unit:''},
  ]);
}

function stallCalc(){
  const W=v('stall-W')*su('stall-W-u'),rho=v('stall-rho'),S=v('stall-S'),CLmax=v('stall-CLmax');
  if(W<=0||rho<=0||S<=0||CLmax<=0) return errOut('stall-out','All values must be positive.');
  const Vs=Math.sqrt(2*W/(rho*S*CLmax));
  showOut('stall-out',[
    {label:'Stall speed Vs',val:fmtN(Vs),unit:'m/s',cls:'good'},
    {label:'Stall speed',val:fmtN(Vs*1.944),unit:'knots'},
    {label:'Wing loading W/S',val:fmtN(W/S),unit:'N/m²'},
  ]);
}

function rktCalc(){
  const Isp=v('rkt-Isp'),m0=v('rkt-m0'),mf=v('rkt-mf'),g0=9.80665;
  if(mf<=0||m0<=mf||Isp<=0) return errOut('rkt-out','m0 > mf > 0, Isp > 0.');
  const dV=Isp*g0*Math.log(m0/mf);
  const mr=m0/mf;
  const pf=(m0-mf)/m0;
  showOut('rkt-out',[
    {label:'ΔV',val:fmtN(dV),unit:'m/s',cls:'good'},
    {label:'ΔV',val:fmtN(dV/1000),unit:'km/s'},
    {label:'Mass ratio m₀/mf',val:fmtN(mr),unit:''},
    {label:'Propellant fraction',val:fmtN(pf*100),unit:'%'},
  ]);
}

function orbCalc(){
  const h=v('orb-h')*1000;
  const body=g('orb-body').value;
  const bodies={earth:{mu:3.986e14,R:6.371e6},moon:{mu:4.9e12,R:1.737e6},mars:{mu:4.282e13,R:3.39e6}};
  const {mu,R}=bodies[body];
  const r=R+h;
  const T=2*Math.PI*Math.sqrt(r**3/mu);
  const vc=Math.sqrt(mu/r);
  const ve=Math.sqrt(2*mu/r);
  showOut('orb-out',[
    {label:'Orbital radius r',val:fmtN(r/1e6),unit:'× 10³ km'},
    {label:'Orbital period T',val:fmtN(T/60),unit:'min',cls:'good'},
    {label:'Circular velocity',val:fmtN(vc),unit:'m/s'},
    {label:'Escape velocity',val:fmtN(ve),unit:'m/s'},
  ]);
}

function hohCalc(){
  const r1=v('hoh-r1')*1e3,r2=v('hoh-r2')*1e3;
  const body=g('hoh-body').value;
  const mu={earth:3.986e14,moon:4.9e12,mars:4.282e13}[body];
  if(r1<=0||r2<=0) return errOut('hoh-out','Both radii must be positive.');
  const dv1=Math.sqrt(mu/r1)*(Math.sqrt(2*r2/(r1+r2))-1);
  const dv2=Math.sqrt(mu/r2)*(1-Math.sqrt(2*r1/(r1+r2)));
  const ttrans=Math.PI*Math.sqrt((r1+r2)**3/(8*mu));
  showOut('hoh-out',[
    {label:'Δv₁',val:fmtN(dv1),unit:'m/s',cls:'good'},
    {label:'Δv₂',val:fmtN(dv2),unit:'m/s'},
    {label:'Total ΔV',val:fmtN(Math.abs(dv1)+Math.abs(dv2)),unit:'m/s'},
    {label:'Transfer time',val:fmtN(ttrans/3600),unit:'hours'},
  ]);
}

/* ── ACOUSTICS & OPTICS ── */
function splCalc(){
  const mode=g('spl-mode').value;
  let spl;
  if(mode==='P'){const P=v('spl-P')*su('spl-P-u');if(P<=0)return errOut('spl-out','P must be positive.');spl=20*Math.log10(P/20e-6);}
  else{const I=v('spl-I');if(I<=0)return errOut('spl-out','I must be positive.');spl=10*Math.log10(I/1e-12);}
  const levels=['Threshold of hearing (~0 dB)','Rustling leaves (~20 dB)','Quiet room (~30 dB)','Normal conversation (~60 dB)','Busy street (~80 dB)','Lawn mower (~90 dB)','Jet at 100m (~120 dB)','Painful (~130 dB)'];
  const interp=spl<20?levels[0]:spl<35?levels[2]:spl<65?levels[3]:spl<85?levels[4]:spl<95?levels[5]:spl<125?levels[6]:levels[7];
  showOut('spl-out',[
    {label:'SPL',val:fmtN(spl),unit:'dB',cls:spl>85?'warn':'good'},
    {label:'Reference',val:mode==='P'?'20 μPa (acoustic)':'10⁻¹² W/m²',unit:''},
    {label:'Interpretation',val:interp,unit:''},
  ]);
}

function rtCalc(){
  const V=v('rt-V');
  const S1=v('rt-S1'),a1=v('rt-a1'),S2=v('rt-S2'),a2=v('rt-a2'),S3=v('rt-S3'),a3=v('rt-a3'),S4=v('rt-S4'),a4=v('rt-a4');
  const A=S1*a1+(isFinite(S2)&&S2>0?S2*a2:0)+(isFinite(S3)&&S3>0?S3*a3:0)+(isFinite(S4)&&S4>0?S4*a4:0);
  if(V<=0||A<=0) return errOut('rt-out','Volume and absorption area must be positive.');
  const RT=0.161*V/A;
  showOut('rt-out',[
    {label:'RT60',val:fmtN(RT),unit:'s',cls:RT<2?'good':'warn'},
    {label:'Total absorption A',val:fmtN(A),unit:'m² sabins'},
    {label:'Guidance',val:RT<0.5?'Very dry':RT<1.5?'Good for speech':RT<2.5?'Music/lecture hall':'Reverberant — add absorbers',unit:''},
  ]);
}

function lensCalc(){
  const tab=document.querySelector('#lens-tabs .tab.active').dataset.tab;
  if(tab==='design'){
    const n=v('lens-n'),R1=v('lens-R1')*su('lens-R1-u'),R2=v('lens-R2')*su('lens-R2-u');
    if(n<=1) return errOut('lens-out','Refractive index must be > 1.');
    const f=1/((n-1)*(1/R1-1/R2));
    showOut('lens-out',[{label:'Focal length f',val:fmtN(f*1000),unit:'mm',cls:'good'},{label:'Power',val:fmtN(1/f),unit:'diopters'}]);
  } else {
    const f=v('lens-f2')*su('lens-f2-u'),do_=v('lens-do')*su('lens-do-u');
    if(f===0||do_===0) return errOut('lens-out','f and object distance required.');
    const di=1/(1/f-1/do_);
    const m=-di/do_;
    showOut('lens-out',[
      {label:'Image distance di',val:fmtN(di*1000),unit:'mm',cls:'good'},
      {label:'Magnification m',val:fmtN(m),unit:''},
      {label:'Image type',val:di>0?'Real (same side as refracted light)':'Virtual',unit:''},
    ]);
  }
}

function opresCalc(){
  const lam=v('opres-lam')*1e-9,D=v('opres-D')*su('opres-D-u'),n=v('opres-n')||1,theta=v('opres-theta')*Math.PI/180;
  const NA=n*Math.sin(theta);
  const rayleigh=1.22*lam/(D>0?D:NA/n*lam);
  const abbe=NA>0?lam/(2*NA):NaN;
  showOut('opres-out',[
    {label:'NA',val:fmtN(NA),unit:'',cls:'good'},
    {label:'Rayleigh limit',val:fmtN(rayleigh*1e9),unit:'nm'},
    {label:'Abbe diffraction limit',val:isFinite(abbe)?fmtN(abbe*1e9):'— (enter NA)',unit:'nm'},
  ]);
}

/* ── LAB & RESEARCH TOOLS ── */
function dilCalc(){
  const mode=g('dil-mode').value;
  const C1=v('dil-C1'),V1=v('dil-V1')*su('dil-V1-u'),C2=v('dil-C2'),V2=v('dil-V2')*su('dil-V2-u');
  let result,label,prep;
  if(mode==='C2'){result=C1*V1/V2;label='C₂';prep=`Take ${fmtN(V1*1e3)} mL of stock (${fmtN(C1)} units), dilute to ${fmtN(V2*1e3)} mL total.`;}
  else if(mode==='V2'){result=C1*V1/C2;label='V₂ (final volume)';prep=`Take ${fmtN(V1*1e3)} mL of stock (${fmtN(C1)} units), dilute to ${fmtN(result*1e3)} mL total.`;}
  else if(mode==='C1'){result=C2*V2/V1;label='C₁ (stock needed)';}
  else{result=C2*V2/C1;label='V₁ (stock volume)';prep=`Take ${fmtN(result*1e3)} mL of stock, dilute to ${fmtN(V2*1e3)} mL.`;}
  showOut('dil-out',[
    {label:label,val:fmtN(result),unit:'',cls:'good'},
    {label:'Dilution factor',val:fmtN(C1/(mode==='C2'?result:C2)),unit:'×'},
    {label:'Prep',val:prep||'',unit:''},
  ]);
}

function molCalc(){
  const mode=g('mol-mode').value;
  const MW=v('mol-MW'),V=v('mol-V');
  if(MW<=0||V<=0) return errOut('mol-out','MW and V must be positive.');
  if(mode==='m2M'){
    const m=v('mol-m');const n=m/MW;const M=n/V;
    showOut('mol-out',[{label:'Moles n',val:fmtN(n),unit:'mol',cls:'good'},{label:'Molarity M',val:fmtN(M),unit:'mol/L'},{label:'Concentration',val:fmtN(M*1000),unit:'mmol/L'}]);
  } else {
    const M=v('mol-M');const n=M*V;const m=n*MW;
    showOut('mol-out',[{label:'Moles n',val:fmtN(n),unit:'mol',cls:'good'},{label:'Mass m',val:fmtN(m),unit:'g'},{label:'Molarity check',val:fmtN(M),unit:'mol/L'}]);
  }
}

function pcrCalc(){
  const seq=(g('pcr-seq').value||'').toUpperCase().replace(/[^ATGC]/g,'');
  if(seq.length<6) return errOut('pcr-out','Enter a primer sequence (A, T, G, C only, ≥6 bases).');
  const A=(seq.match(/A/g)||[]).length,T=(seq.match(/T/g)||[]).length;
  const G=(seq.match(/G/g)||[]).length,C=(seq.match(/C/g)||[]).length;
  const N=seq.length;
  const GCpct=(G+C)/N*100;
  const Tm_wallace=2*(A+T)+4*(G+C);
  const Tm_nn=81.5+16.6*Math.log10(0.05)+0.41*GCpct-675/N;
  showOut('pcr-out',[
    {label:'Length',val:N,unit:'bp'},
    {label:'GC%',val:fmtN(GCpct),unit:'%',cls:GCpct>=40&&GCpct<=60?'good':'warn'},
    {label:'A / T / G / C',val:`${A} / ${T} / ${G} / ${C}`,unit:''},
    {label:'Tm (Wallace rule)',val:fmtN(Tm_wallace),unit:'°C',cls:'good'},
    {label:'Tm (nearest-neighbor est.)',val:fmtN(Tm_nn),unit:'°C'},
    {label:'Annealing temp',val:fmtN(Tm_nn-5),unit:'°C (Tm − 5)'},
  ]);
}

function scbCalc(){
  const mag=v('scb-mag'),pxSize=v('scb-px'),barPx=v('scb-bar');
  if(mag<=0||pxSize<=0||barPx<=0) return errOut('scb-out','All values must be positive.');
  const nmPerPx=pxSize*1000/mag;
  const barLen=barPx*nmPerPx;
  showOut('scb-out',[
    {label:'nm per pixel',val:fmtN(nmPerPx),unit:'nm/px',cls:'good'},
    {label:'Scale bar length',val:fmtN(barLen),unit:'nm'},
    {label:'Scale bar length',val:fmtN(barLen/1000),unit:'μm'},
  ]);
}

function hidxCalc(){
  const cites=(g('hidx-data').value||'').split(',').map(s=>parseInt(s.trim())).filter(isFinite).sort((a,b)=>b-a);
  if(cites.length===0) return errOut('hidx-out','Enter comma-separated citation counts.');
  let h=0;
  for(let i=0;i<cites.length;i++){if(cites[i]>=i+1)h=i+1;else break;}
  const i10=cites.filter(c=>c>=10).length;
  const total=cites.reduce((a,b)=>a+b,0);
  showOut('hidx-out',[
    {label:'h-index',val:h,unit:'',cls:'good'},
    {label:'i10-index',val:i10,unit:''},
    {label:'Total citations',val:total,unit:''},
    {label:'Mean citations/paper',val:fmtN(total/cites.length),unit:''},
    {label:'Papers',val:cites.length,unit:''},
  ]);
}

function dpiCalc(){
  const dpi=v('dpi-dpi'),W=v('dpi-W')*su('dpi-W-u'),H=v('dpi-H')*su('dpi-H-u'),bits=v('dpi-bits')||8;
  if(dpi<=0||W<=0||H<=0) return errOut('dpi-out','DPI, width, height must be positive.');
  const px_w=Math.round(dpi*W/0.0254),px_h=Math.round(dpi*H/0.0254);
  const bytes=px_w*px_h*(bits/8)*3;
  showOut('dpi-out',[
    {label:'Pixel dimensions',val:`${px_w} × ${px_h}`,unit:'px',cls:'good'},
    {label:'Total megapixels',val:fmtN(px_w*px_h/1e6),unit:'MP'},
    {label:'Uncompressed size (RGB)',val:fmtN(bytes/1e6),unit:'MB'},
    {label:'JPEG est. (~10:1)',val:fmtN(bytes/10/1e6),unit:'MB'},
  ]);
}

/* ── STATISTICAL POWER ── */
function powerCalc(){
  const d=v('pow-d'),n=v('pow-n'),alpha=parseFloat(g('pow-alpha').value),test=g('pow-test').value;
  if(d<=0||n<2) return errOut('pow-out','Effect size d > 0 and n ≥ 2 required.');
  const za={0.05:1.96,0.01:2.576,0.1:1.645}[alpha]||1.96;
  const erf=x=>{const t=1/(1+0.3275911*Math.abs(x));const p=t*(0.254829592+t*(-0.284496736+t*(1.421413741+t*(-1.453152027+t*1.061405429))));return(1-p*Math.exp(-x*x))*(x>=0?1:-1);};
  const Phi=z=>0.5*(1+erf(z/Math.SQRT2));
  const lambda=d*Math.sqrt(test==='one'?n:n/2);
  const power=Math.max(0,Math.min(1,Phi(lambda-za)+Phi(-lambda-za)));
  const nFor80=test==='one'?Math.ceil(Math.pow((za+0.842)/d,2)):Math.ceil(Math.pow((za+0.842)/d,2)*2);
  showOut('pow-out',[
    {label:'Power (1−β)',val:fmtN(power*100),unit:'%',cls:power>=0.8?'good':power>=0.6?'warn':'bad'},
    {label:'Type II error β',val:fmtN((1-power)*100),unit:'%'},
    {label:'n for 80% power',val:test==='two'?`${nFor80} per group`:nFor80,unit:'',cls:'good'},
    {label:'Effect size',val:d<0.2?'Negligible':d<0.5?'Small':d<0.8?'Medium':'Large',unit:`(d=${fmtN(d)})`},
  ]);
}

/* ── ONE-WAY ANOVA ── */
function anovaCalc(){
  const parse=id=>(g(id).value||'').split(',').map(s=>parseFloat(s.trim())).filter(isFinite);
  const groups=[parse('anova-g1'),parse('anova-g2'),parse('anova-g3'),parse('anova-g4')].filter(gr=>gr.length>=2);
  if(groups.length<2) return errOut('anova-out','Enter data for ≥ 2 groups (each ≥ 2 values).');
  const k=groups.length,N=groups.reduce((a,gr)=>a+gr.length,0);
  const grandMean=groups.flat().reduce((a,b)=>a+b,0)/N;
  const SSB=groups.reduce((a,gr)=>{const m=gr.reduce((s,x)=>s+x,0)/gr.length;return a+gr.length*(m-grandMean)**2;},0);
  const SSW=groups.reduce((a,gr)=>{const m=gr.reduce((s,x)=>s+x,0)/gr.length;return a+gr.reduce((s,x)=>s+(x-m)**2,0);},0);
  const dfB=k-1,dfW=N-k,MSB=SSB/dfB,MSW=SSW/dfW,F=MSB/MSW;
  const chi2=F*dfB;
  const zz=(Math.cbrt(chi2/dfB)-(1-2/(9*dfB)))/Math.sqrt(2/(9*dfB));
  const p=Math.max(0,Math.min(1,zz>0?0.5*Math.exp(-0.717*zz-0.416*zz*zz):1-0.5*Math.exp(0.717*zz-0.416*zz*zz)));
  const eta2=SSB/(SSB+SSW);
  showOut('anova-out',[
    {label:'F statistic',val:fmtN(F),unit:'',cls:'good'},
    {label:'df between / within',val:`${dfB} / ${dfW}`,unit:''},
    {label:'MS between / within',val:`${fmtN(MSB)} / ${fmtN(MSW)}`,unit:''},
    {label:'p-value (approx.)',val:fmtN(p),unit:'',cls:p<0.05?'warn':'good'},
    {label:'Significant (α=0.05)?',val:p<0.05?'Yes — reject H₀ (groups differ)':'No — fail to reject H₀',unit:''},
    {label:'η² (effect size)',val:fmtN(eta2),unit:'',cls:eta2>0.14?'warn':eta2>0.06?'':''},
    {label:'N total / groups',val:`${N} / ${k}`,unit:''},
  ]);
}

/* ── CORONARY FLOW RESERVE & FFR ── */
function cfrCalc(){
  const tab=document.querySelector('#cfr-tabs .tab.active').dataset.tab;
  if(tab==='cfr'){
    const Qh=v('cfr-Qh'),Qb=v('cfr-Qb');
    if(Qb<=0||Qh<=0) return errOut('cfr-out','Both flows must be positive.');
    const CFR=Qh/Qb;
    showOut('cfr-out',[
      {label:'CFR',val:fmtN(CFR),unit:'',cls:CFR>=2.5?'good':CFR>=2.0?'warn':'bad'},
      {label:'Clinical threshold',val:'≥ 2.5 normal · 2.0–2.5 borderline · < 2.0 impaired',unit:''},
      {label:'Assessment',val:CFR>=2.5?'Normal — adequate reserve':CFR>=2.0?'Borderline':'Impaired — reduced microvascular reserve',unit:'',cls:CFR>=2.5?'good':CFR>=2.0?'warn':'bad'},
    ]);
  } else {
    const Pd=v('cfr-Pd'),Pa=v('cfr-Pa');
    if(Pa<=0||Pd<=0||Pd>Pa) return errOut('cfr-out','0 < Pd ≤ Pa required.');
    const FFR=Pd/Pa;
    showOut('cfr-out',[
      {label:'FFR (Pd/Pa)',val:fmtN(FFR),unit:'',cls:FFR>0.80?'good':'warn'},
      {label:'Ischaemia threshold',val:'FFR ≤ 0.80 → revascularise',unit:''},
      {label:'Recommendation',val:FFR<=0.80?'Revascularisation indicated (FFR ≤ 0.80)':'Defer PCI — FFR > 0.80',unit:'',cls:FFR<=0.80?'warn':'good'},
    ]);
  }
}

/* ── HENDERSON-HASSELBALCH ── */
function hhCalc(){
  const tab=document.querySelector('#hh-tabs .tab.active').dataset.tab;
  if(tab==='pH'){
    const pKa=v('hh-pKa'),ratio=v('hh-ratio');
    if(ratio<=0) return errOut('hh-out','[A⁻]/[HA] ratio must be positive.');
    const pH=pKa+Math.log10(ratio);
    showOut('hh-out',[
      {label:'pH',val:fmtN(pH),unit:'',cls:'good'},
      {label:'Buffer range',val:`${fmtN(pKa-1)} – ${fmtN(pKa+1)}`,unit:'(pKa ± 1)'},
      {label:'Buffering capacity',val:ratio>=0.1&&ratio<=10?'Effective (ratio within 10:1)':'Weak — near capacity limit',unit:''},
    ]);
  } else {
    const pKa=v('hh-pKa2'),pH=v('hh-pH');
    const ratio=Math.pow(10,pH-pKa);
    showOut('hh-out',[
      {label:'[A⁻]/[HA] ratio needed',val:fmtN(ratio),unit:'',cls:'good'},
      {label:'% conjugate base [A⁻]',val:fmtN(ratio/(1+ratio)*100),unit:'%'},
      {label:'% weak acid [HA]',val:fmtN(1/(1+ratio)*100),unit:'%'},
    ]);
  }
}
