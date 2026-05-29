/* ================================================================
   utils.js — Core helpers, formatters, and DOM utilities
   Loaded first; every other module depends on these.
================================================================ */

/* ── DOM shortcuts ─────────────────────────────────────────── */
function g(id)  { return document.getElementById(id); }
function v(id)  { return parseFloat(g(id).value); }
function su(id) { return parseFloat(g(id)?.value || 1); }

/* ── Number formatters ─────────────────────────────────────── */
function fmtSci(n, dp = 4) {
  if (n === undefined || isNaN(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs >= 0.001 && abs < 1e6) return n.toPrecision(dp);
  return n.toExponential(3);
}

function fmtN(n, dp = 4) {
  if (isNaN(n) || n === undefined) return '—';
  return fmtSci(n, dp);
}

/* ── Output renderers ──────────────────────────────────────── */
/* Renders a structured result table inside an .output element. */
function showOut(id, rows, note) {
  const el   = g(id);
  const body = g(id + '-body');
  let html = rows.map(r => {
    const cls = r.cls ? `class="out-val ${r.cls}"` : 'class="out-val"';
    return `<div class="out-row"><span class="out-label">${r.label}</span><span ${cls}>${r.val} ${r.unit || ''}</span></div>`;
  }).join('');
  if (note) html += `<div class="out-note">${note}</div>`;
  body.innerHTML = html;
  el.classList.add('visible');
}

/* Renders an error message inside an .output element. */
function errOut(id, msg) {
  const el   = g(id);
  const body = g(id + '-body');
  body.innerHTML = `<div class="err-msg">⚠ ${msg}</div>`;
  el.classList.add('visible');
}

/* ── Tab system ────────────────────────────────────────────── */
function setTab(group, tab) {
  const tabs = document.querySelectorAll(`#${group}-tabs .tab`);
  tabs.forEach(t => t.classList.toggle('active', t.onclick.toString().includes(`'${tab}'`)));
  document.querySelectorAll(`[id^="${group}-"]`).forEach(p => {
    if (p.classList.contains('tab-panel'))
      p.classList.toggle('active', p.id === `${group}-${tab}`);
  });
}

/* ── Sidebar nav ───────────────────────────────────────────── */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event.target.closest('.nav-item').classList.add('active');
}

window.addEventListener('scroll', () => {
  const sections = ['yplus','reynolds','turbulence','boundary-layer','pipe-flow',
                    'non-newt','pulsatile','porous','elastic','stress','beam','units'];
  let current = sections[0];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top < 200) current = id;
  });
  document.querySelectorAll('.nav-item').forEach(n => {
    const matches = n.onclick && n.onclick.toString().includes(`'${current}'`);
    n.classList.toggle('active', matches);
  });
}, { passive: true });

/* ── Compatibility shims for extended sections ─────────────── */
/* gv/gu mirror v/su for code written after the refactor. */
function gv(id) { return v(id); }
function gu(id) { return su(id); }

/* res() — lightweight row renderer used by later calc sections. */
function res(bodyId, rows) {
  const body = document.getElementById(bodyId);
  if (!body) return;
  body.innerHTML = rows.map(([lbl, val, note]) =>
    `<div class="out-row"><span class="out-label">${lbl}</span>` +
    `<span class="out-val">${val}${note
      ? ' <span style="font-size:.72em;opacity:.6;margin-left:6px">' + note + '</span>'
      : ''}</span></div>`
  ).join('');
  const out = body.closest('.output') || body.parentElement;
  if (out) out.classList.add('visible');
}
