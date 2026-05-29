/* ================================================================
   ui.js — UI framework: unit converters, unit system switcher,
           card search, card resize/restore, formula fit,
           accessibility panel, and page initialisation.
   Depends on: utils.js
================================================================ */

/* ── Unit converter data ───────────────────────────────────── */
const CONV_SETS = [
  { title: 'Pressure',          icon: '🔴', base: 'Pa',
    units: [['Pa',1],['kPa',1e-3],['MPa',1e-6],['bar',1e-5],['atm',1/101325],
            ['psi',1/6894.76],['mmHg',1/133.322],['cmH₂O',1/98.0665],['inHg',1/3386.39]] },
  { title: 'Dynamic Viscosity', icon: '🟡', base: 'Pa·s',
    units: [['Pa·s',1],['mPa·s (cP)',1000],['μPa·s (μP)',1e6],['kPa·s',1e-3],
            ['lbf·s/ft²',1/47.880],['poise',10]] },
  { title: 'Kinematic Viscosity', icon: '🟠', base: 'm²/s',
    units: [['m²/s',1],['mm²/s (cSt)',1e6],['cm²/s (St)',1e4],['ft²/s',10.7639],['in²/s',1550.0031]] },
  { title: 'Velocity',          icon: '🔵', base: 'm/s',
    units: [['m/s',1],['mm/s',1000],['cm/s',100],['km/h',3.6],['ft/s',3.28084],['mph',2.23694],['in/s',39.3701]] },
  { title: 'Length',            icon: '⚪', base: 'm',
    units: [['m',1],['cm',100],['mm',1000],['μm',1e6],['nm',1e9],['in',39.3701],['ft',3.28084],['mile',1/1609.34]] },
  { title: 'Force',             icon: '🟢', base: 'N',
    units: [['N',1],['kN',0.001],['MN',1e-6],['lbf',0.224809],['kgf',0.101972],['dyne',1e5]] },
  { title: 'Density',           icon: '🟣', base: 'kg/m³',
    units: [['kg/m³',1],['g/cm³',0.001],['g/mL',0.001],['kg/L',0.001],['lb/ft³',0.0624280],['lb/gal',0.00834540]] },
];

/* Builds the converter card grid from CONV_SETS. */
function buildConverters() {
  const wrap = g('unit-converters');
  CONV_SETS.forEach((cs, ci) => {
    const id = `conv${ci}`;
    const inputRows = cs.units.map((u, ui) => `
      <tr>
        <td class="unit-cell">${u[0]}</td>
        <td class="val-cell"><input type="number" id="${id}-${ui}" class="field"
          style="width:100%;padding:4px 8px;font-size:.8em" placeholder="0"
          oninput="convertUnit(${ci},${ui})"></td>
      </tr>`).join('');
    wrap.insertAdjacentHTML('beforeend', `
      <div class="card">
        <div class="card-header">
          <div class="card-icon">${cs.icon}</div>
          <div><div class="card-title">${cs.title}</div>
               <div class="card-subtitle">Base unit: ${cs.base}</div></div>
        </div>
        <div class="card-body" style="padding:12px 14px">
          <table class="conv-table"><tbody>${inputRows}</tbody></table>
        </div>
      </div>`);
  });
}

/* Propagates a changed converter input to all other fields in the same card. */
function convertUnit(ci, srcUi) {
  const cs = CONV_SETS[ci];
  const srcVal = parseFloat(g(`conv${ci}-${srcUi}`).value);
  if (isNaN(srcVal)) return;
  const baseVal = srcVal / cs.units[srcUi][1];
  cs.units.forEach((_, ui) => {
    if (ui === srcUi) return;
    const el = g(`conv${ci}-${ui}`);
    if (el) el.value = parseFloat((baseVal * cs.units[ui][1]).toPrecision(7));
  });
}

/* Temperature converter card (non-linear — needs special handling). */
(function addTempConverter() {
  const wrap = g('unit-converters');
  wrap.insertAdjacentHTML('beforeend', `
    <div class="card">
      <div class="card-header">
        <div class="card-icon">🌡</div>
        <div><div class="card-title">Temperature</div>
             <div class="card-subtitle">°C · °F · K · °R</div></div>
      </div>
      <div class="card-body" style="padding:12px 14px">
        <table class="conv-table"><tbody>
          <tr><td class="unit-cell">Celsius (°C)</td>
              <td class="val-cell"><input type="number" id="temp-C" class="field"
                style="width:100%;padding:4px 8px;font-size:.8em" placeholder="0"
                oninput="convertTemp('C')"></td></tr>
          <tr><td class="unit-cell">Fahrenheit (°F)</td>
              <td class="val-cell"><input type="number" id="temp-F" class="field"
                style="width:100%;padding:4px 8px;font-size:.8em" placeholder="32"
                oninput="convertTemp('F')"></td></tr>
          <tr><td class="unit-cell">Kelvin (K)</td>
              <td class="val-cell"><input type="number" id="temp-K" class="field"
                style="width:100%;padding:4px 8px;font-size:.8em" placeholder="273.15"
                oninput="convertTemp('K')"></td></tr>
          <tr><td class="unit-cell">Rankine (°R)</td>
              <td class="val-cell"><input type="number" id="temp-R" class="field"
                style="width:100%;padding:4px 8px;font-size:.8em" placeholder="491.67"
                oninput="convertTemp('R')"></td></tr>
        </tbody></table>
      </div>
    </div>`);
})();

function convertTemp(src) {
  let C;
  if      (src === 'C') C = parseFloat(g('temp-C').value);
  else if (src === 'F') C = (parseFloat(g('temp-F').value) - 32) * 5 / 9;
  else if (src === 'K') C = parseFloat(g('temp-K').value) - 273.15;
  else                  C = parseFloat(g('temp-R').value) * 5 / 9 - 273.15;
  if (isNaN(C)) return;
  if (src !== 'C') g('temp-C').value = C.toPrecision(7);
  if (src !== 'F') g('temp-F').value = (C * 9 / 5 + 32).toPrecision(7);
  if (src !== 'K') g('temp-K').value = (C + 273.15).toPrecision(7);
  if (src !== 'R') g('temp-R').value = ((C + 273.15) * 9 / 5).toPrecision(7);
}

/* ── Unit system switcher ──────────────────────────────────── */
/*
 * Each system lists preferred units per category in priority order.
 * applyUnitSystem() walks all .unit-sel selects on the page and
 * snaps each one to its highest-priority matching option.
 */
const UNIT_SYSTEM_PREFS = {
  SI:   { length:['m','cm','mm','μm','nm','in','ft'],          velocity:['m/s','cm/s','mm/s','km/h','ft/s','mph','in/s'],    flowrate:['m³/s','mL/s','mL/min'],   force:['N','kN','MN','lbf','kgf','dyne'],  pressure:['Pa','kPa','MPa','bar','atm','psi','mmHg','cmH₂O','inHg'], stress:['MPa','kPa','psi'],  modulus:['GPa','MPa','kPa','psi'],  viscosity:['Pa·s','mPa·s (cP)','μPa·s (μP)','kPa·s','lbf·s/ft²','poise'],   'kin-visc':['m²/s','mm²/s (cSt)','cm²/s (St)','ft²/s','in²/s'],  density:['kg/m³','g/cm³','g/mL','kg/L','lb/ft³','lb/gal'] },
  MMKS: { length:['mm','m','cm','μm','nm','in','ft'],          velocity:['mm/s','m/s','cm/s','km/h','ft/s','mph','in/s'],    flowrate:['mL/s','mL/min','m³/s'],   force:['N','kN','MN','lbf','kgf','dyne'],  pressure:['MPa','kPa','Pa','bar','atm','psi','mmHg','cmH₂O','inHg'], stress:['MPa','kPa','psi'],  modulus:['GPa','MPa','kPa','psi'],  viscosity:['mPa·s (cP)','Pa·s','μPa·s (μP)','kPa·s','lbf·s/ft²','poise'],  'kin-visc':['mm²/s (cSt)','m²/s','cm²/s (St)','ft²/s','in²/s'],  density:['kg/m³','g/cm³','g/mL','kg/L','lb/ft³','lb/gal'] },
  CGS:  { length:['cm','m','mm','μm','nm','in','ft'],          velocity:['cm/s','m/s','mm/s','km/h','ft/s','mph','in/s'],    flowrate:['m³/s','mL/s','mL/min'],   force:['dyne','N','kN','lbf','kgf'],       pressure:['Pa','kPa','MPa','bar','atm','psi','mmHg'],              stress:['MPa','kPa','psi'],  modulus:['GPa','MPa','kPa'],        viscosity:['mPa·s (cP)','Pa·s','poise','μPa·s (μP)','lbf·s/ft²'],           'kin-visc':['cm²/s (St)','m²/s','mm²/s (cSt)','ft²/s','in²/s'],  density:['g/cm³','g/mL','kg/m³','kg/L','lb/ft³'] },
  IPS:  { length:['in','ft','m','cm','mm','μm'],               velocity:['in/s','ft/s','mph','m/s','cm/s','mm/s'],           flowrate:['m³/s','mL/s'],            force:['lbf','N','kN','kgf','dyne'],       pressure:['psi','inHg','kPa','Pa','MPa','mmHg','bar','atm'],       stress:['psi','MPa','kPa'],  modulus:['ksi','psi','GPa','MPa'],  viscosity:['lbf·s/ft²','Pa·s','mPa·s (cP)','poise'],                        'kin-visc':['in²/s','ft²/s','m²/s','mm²/s (cSt)'],                density:['lb/ft³','lb/gal','kg/m³','g/cm³'] },
  BIN:  { length:['in','ft','m','cm','mm','μm'],               velocity:['in/s','ft/s','mph','m/s','mm/s'],                  flowrate:['m³/s','mL/s'],            force:['lbf','N','kN','kgf','dyne'],       pressure:['psi','inHg','kPa','Pa','MPa','mmHg','bar'],             stress:['psi','MPa','kPa'],  modulus:['ksi','psi','GPa','MPa'],  viscosity:['lbf·s/ft²','Pa·s','mPa·s (cP)'],                                'kin-visc':['in²/s','ft²/s','m²/s'],                               density:['lb/ft³','lb/gal','kg/m³','g/cm³'] },
  BFT:  { length:['ft','in','m','cm','mm'],                    velocity:['ft/s','mph','in/s','m/s','mm/s'],                  flowrate:['m³/s','mL/s'],            force:['lbf','N','kN','kgf','dyne'],       pressure:['psi','inHg','kPa','Pa','MPa','mmHg','bar'],             stress:['psi','MPa','kPa'],  modulus:['ksi','psi','GPa','MPa'],  viscosity:['lbf·s/ft²','Pa·s','mPa·s (cP)'],                                'kin-visc':['ft²/s','in²/s','m²/s'],                               density:['lb/ft³','lb/gal','kg/m³','g/cm³'] },
};

const UNIT_HINTS = {
  SI:  'm · kg · N · Pa',  MMKS: 'mm · kg · N · MPa', CGS: 'cm · g · dyne',
  IPS: 'in · slug · lbf · psi', BIN: 'in · lbm · lbf · psi', BFT: 'ft · lbm · lbf · psi',
};

/* Inspects the option set of a <select> to determine which physical category it belongs to. */
function detectUnitCategory(sel) {
  const t = new Set(Array.from(sel.options).map(o => o.text.trim()));
  if (t.has('Pa·s') || t.has('mPa·s (cP)') || t.has('lbf·s/ft²') || t.has('poise')) return 'viscosity';
  if (t.has('m²/s') || t.has('mm²/s (cSt)') || t.has('cm²/s (St)') || t.has('ft²/s') || t.has('in²/s')) return 'kin-visc';
  if (t.has('m/s')  || t.has('ft/s')  || t.has('in/s')  || t.has('mph'))    return 'velocity';
  if (t.has('m³/s') || t.has('mL/s')  || t.has('mL/min'))                   return 'flowrate';
  if (t.has('kg/m³')|| t.has('g/cm³') || t.has('lb/ft³'))                   return 'density';
  if (t.has('N')    || t.has('kN')    || t.has('lbf')    || t.has('dyne'))  return 'force';
  if (t.has('GPa')  || t.has('ksi'))                                         return 'modulus';
  if (!t.has('Pa') && !t.has('mmHg') && !t.has('bar') && !t.has('atm') &&
      (t.has('MPa') || t.has('kPa') || t.has('psi')))                        return 'stress';
  if (t.has('Pa') || t.has('kPa') || t.has('MPa') || t.has('psi') ||
      t.has('mmHg') || t.has('bar'))                                          return 'pressure';
  if (t.has('m')  || t.has('mm')  || t.has('cm')  || t.has('in') ||
      t.has('ft') || t.has('μm'))                                             return 'length';
  return null;
}

/* Snaps all unit selects to the preferred unit for the chosen system. */
function applyUnitSystem(sys) {
  const prefs = UNIT_SYSTEM_PREFS[sys];
  if (!prefs) return;
  document.querySelectorAll('.usb-btn').forEach(b => b.classList.toggle('active', b.dataset.system === sys));
  const hint = document.getElementById('usb-hint');
  if (hint) hint.textContent = UNIT_HINTS[sys] || '';
  document.querySelectorAll('select.unit-sel').forEach(sel => {
    const cat = detectUnitCategory(sel);
    if (!cat || !prefs[cat]) return;
    for (const pref of prefs[cat]) {
      const opt = Array.from(sel.options).find(o => o.text.trim() === pref);
      if (opt && opt.value !== sel.value) { sel.value = opt.value; sel.dispatchEvent(new Event('change')); break; }
    }
  });
}

/* ── Card search ───────────────────────────────────────────── */
let _searchIdx = [];

function buildSearchIndex() {
  _searchIdx = [];
  document.querySelectorAll('.section').forEach(sec => {
    const sText = (sec.querySelector('.section-title')?.textContent || '') + ' ' +
                  (sec.querySelector('.section-tag')?.textContent   || '') + ' ' +
                  (sec.querySelector('.section-desc')?.textContent  || '');
    sec.querySelectorAll('.card').forEach(card => {
      const text = [
        sText,
        card.querySelector('.card-title')?.textContent    || '',
        card.querySelector('.card-subtitle')?.textContent || '',
        ...Array.from(card.querySelectorAll('.input-label')).map(l => l.textContent),
      ].join(' ').toLowerCase();
      _searchIdx.push({ card, sec, text });
    });
  });
}

function searchCards(q) {
  q = (q || '').trim().toLowerCase();
  const countEl = document.getElementById('search-count');
  if (!q) {
    _searchIdx.forEach(({ card, sec }) => { card.style.display = ''; sec.style.display = ''; });
    if (countEl) countEl.textContent = '';
    setTimeout(fitFormulas, 0);
    return;
  }
  const terms = q.split(/\s+/).filter(Boolean);
  let hits = 0;
  const secVis = new Map();
  _searchIdx.forEach(({ card, sec, text }) => {
    const match = terms.every(t => text.includes(t));
    card.style.display = match ? '' : 'none';
    if (match) { hits++; secVis.set(sec, true); }
    else if (!secVis.has(sec)) secVis.set(sec, false);
  });
  secVis.forEach((vis, sec) => { sec.style.display = vis ? '' : 'none'; });
  if (countEl) countEl.textContent = hits ? `${hits} result${hits > 1 ? 's' : ''}` : 'no results';
  setTimeout(fitFormulas, 0);
}

/* ── Formula overflow fix ──────────────────────────────────── */
/*
 * KaTeX display blocks that are wider than their card column get
 * shrunk via CSS zoom so they never overflow or trigger scrollbars.
 */
function fitFormulas() {
  document.querySelectorAll('.formula-latex').forEach(wrap => {
    const disp = wrap.querySelector('.katex-display');
    if (!disp) return;
    disp.style.zoom = '';
    const overflow = disp.scrollWidth - wrap.clientWidth;
    if (overflow > 2 && wrap.clientWidth > 0)
      disp.style.zoom = Math.max(0.55, wrap.clientWidth / disp.scrollWidth);
  });
}
let _fitTimer;
window.addEventListener('resize', () => { clearTimeout(_fitTimer); _fitTimer = setTimeout(fitFormulas, 150); });

/* ── Unit auto-convert on selector change ──────────────────── */
/*
 * When a user switches a unit dropdown, the numeric field is
 * automatically scaled so the underlying SI value stays the same.
 * Each select's value is a multiplier: field_value × multiplier = SI.
 */
function initUnitAutoConvert() {
  document.querySelectorAll('select.unit-sel').forEach(sel => {
    sel.dataset.prevU = sel.value;
    const prev = sel.onchange;
    sel.onchange = function (e) {
      const oldU = parseFloat(this.dataset.prevU);
      const newU = parseFloat(this.value);
      if (isFinite(oldU) && isFinite(newU) && oldU !== 0 && newU !== 0 && oldU !== newU) {
        const inp = this.closest('.input-wrap')?.querySelector('input.field');
        if (inp && inp.value !== '') {
          const raw = parseFloat(inp.value);
          if (isFinite(raw)) inp.value = parseFloat((raw * oldU / newU).toPrecision(6));
        }
      }
      this.dataset.prevU = this.value;
      if (prev) prev.call(this, e);
    };
  });
}

/* ── Card restore button ───────────────────────────────────── */
/* Adds a ↺ button to each card header that resets size and inputs. */
function initCardRestore() {
  document.querySelectorAll('.card').forEach(card => {
    const header = card.querySelector('.card-header');
    if (!header) return;
    const btn = document.createElement('button');
    btn.className = 'card-restore';
    btn.title = 'Restore default size and values';
    btn.textContent = '↺';
    btn.addEventListener('click', () => {
      card.style.width = '';
      card.style.height = '';
      card.style.flexBasis = '';
      card.style.flexGrow = '';
      card.style.flexShrink = '';
      card.querySelectorAll('input').forEach(inp => { inp.value = inp.defaultValue; });
      card.querySelectorAll('select').forEach(sel => {
        const def = Array.from(sel.options).find(o => o.defaultSelected);
        sel.value = def ? def.value : (sel.options[0]?.value ?? '');
        sel.dataset.prevU = sel.value;
      });
    });
    header.appendChild(btn);
  });
}

/* ── Card resize reflow ────────────────────────────────────── */
/*
 * ResizeObserver: when the user drags a card's resize handle,
 * flex-basis is pinned to that width so the card stops growing
 * back to fill available space.
 */
function initResizeReflow() {
  if (!window.ResizeObserver) return;
  const ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      const card = entry.target;
      if (card.style.width !== '' || card.style.height !== '') {
        const w = parseFloat(card.style.width);
        if (isFinite(w)) {
          card.style.flexBasis  = w + 'px';
          card.style.flexGrow   = '0';
          card.style.flexShrink = '0';
        }
      }
    }
  });
  document.querySelectorAll('.card').forEach(c => ro.observe(c));
}

/* ── Accessibility / appearance panel ─────────────────────── */
(function () {
  const FONTS = ['', 'font-serif', 'font-mono'];
  const LS = window.localStorage;

  function lsGet(k) { try { return LS ? LS.getItem(k) : null; } catch (e) { return null; } }
  function lsSet(k, val) { try { if (LS) LS.setItem(k, val); } catch (e) {} }

  function applyPrefs() {
    const dark = lsGet('acc_dark') === '1';
    const sz   = lsGet('acc_sz')   || 'md';
    const fi   = parseInt(lsGet('acc_fi') || '0');
    const b    = document.body;
    b.classList.toggle('dark-mode',  dark);
    b.classList.toggle('light-mode', !dark);
    b.classList.remove('size-sm', 'size-md', 'size-lg');
    b.classList.add('size-' + sz);
    b.classList.remove('font-serif', 'font-mono');
    if (FONTS[fi]) b.classList.add(FONTS[fi]);
    const cb = document.getElementById('acc-dark');
    if (cb) cb.checked = dark;
    ['sm', 'md', 'lg'].forEach(s => {
      const el = document.getElementById('acc-' + s);
      if (el) el.classList.toggle('active', s === sz);
    });
    [0, 1, 2].forEach(i => {
      const el = document.getElementById('acc-f' + i);
      if (el) el.classList.toggle('active', i === fi);
    });
  }

  window.accToggle = function () {
    const p = document.getElementById('acc-panel');
    if (p) p.classList.toggle('open');
  };
  window.accDark = function (cb) { lsSet('acc_dark', cb.checked ? '1' : '0'); applyPrefs(); };
  window.accSize = function (s)  { lsSet('acc_sz', s); applyPrefs(); };
  window.accFont = function (i)  { lsSet('acc_fi', i); applyPrefs(); };

  document.addEventListener('click', function (e) {
    const p  = document.getElementById('acc-panel');
    const b2 = document.getElementById('acc-btn');
    if (p && b2 && p.classList.contains('open') && !p.contains(e.target) && e.target !== b2)
      p.classList.remove('open');
  });

  applyPrefs();
  document.addEventListener('DOMContentLoaded', applyPrefs);
})();

/* ── Tooltip toggle ─────────────────────────────────────────── */
/*
 * Tooltips are native browser title="" attributes on .input-label
 * elements. Toggling off moves title → data-tip (so nothing shows
 * on hover) and back on restores data-tip → title.
 * State is persisted in localStorage; default is ON.
 */
function setTooltips(on) {
  document.querySelectorAll('.input-label[title], .input-label[data-tip]').forEach(el => {
    if (on) {
      if (el.dataset.tip) { el.title = el.dataset.tip; delete el.dataset.tip; }
    } else {
      if (el.title) { el.dataset.tip = el.title; el.removeAttribute('title'); }
    }
  });
  const chk   = document.getElementById('tt-chk');
  const state = document.getElementById('tt-state');
  if (chk)   chk.checked     = on;
  if (state) state.textContent = on ? 'On' : 'Off';
  try { localStorage.setItem('tooltips_on', on ? '1' : '0'); } catch (e) {}
}

function initTooltipToggle() {
  const saved = (() => { try { return localStorage.getItem('tooltips_on'); } catch (e) { return null; } })();
  /* Default ON — only turn off if explicitly saved as '0'. */
  setTooltips(saved !== '0');
}

/* ── Sidebar nav counts ─────────────────────────────────────── */
/*
 * Counts the .card elements in every .section and writes the total
 * into the matching .nav-count badge in the sidebar. Runs once on
 * load so counts are always accurate even as cards are added.
 */
function updateNavCounts() {
  document.querySelectorAll('.section[id]').forEach(sec => {
    const count = sec.querySelectorAll('.card').length;
    if (!count) return;
    /* nav button has onclick="scrollToSection('id')" */
    const btn = document.querySelector(`.nav-item[onclick*="'${sec.id}'"]`);
    if (!btn) return;
    const badge = btn.querySelector('.nav-count');
    if (badge) badge.textContent = count;
  });
}

/* ── Page initialisation ───────────────────────────────────── */
/* buildConverters() runs immediately (scripts are at end of body). */
buildConverters();

/* All other inits run after the full page load so card DOM is ready. */
window.addEventListener('load', () => {
  initUnitAutoConvert();
  initCardRestore();
  initResizeReflow();
  initCardReferences();
  buildSearchIndex();
  fitFormulas();
  initTooltipToggle();
  updateNavCounts();
});
