// Show preloader only once (per session)
const PRELOADER_KEY = 'preloader_seen_v1';
const storageForPreloader = sessionStorage; // use localStorage to make it once-ever

const pre = document.getElementById('preloader');

if (pre) {
  const alreadySeen = storageForPreloader.getItem(PRELOADER_KEY) === '1';

  if (alreadySeen) {
    // Never show it again
    pre.remove();
  } else {
    // We do want to show it this first time
    pre.hidden = false;

    // ---- your existing preloader code starts here ----
    // (percentage updates + notes + finish animation)
    // When you finish hiding/removing the loader, also set the flag:
    // pre.classList.add('hide'); setTimeout(() => pre.remove(), 600);
    try { storageForPreloader.setItem(PRELOADER_KEY, '1'); } catch {}
    // ---- your existing preloader code ends here ----
  




/* ========= Pumpjack Preloader, NO background-only phase ========= */

const percEl = document.getElementById('loaderPercentage');
const noteEl = document.getElementById('loaderNote');
const oilFill = document.getElementById('oilFill');

// Only four notes, as requested
const dataNotes = [
  "SELECT * FROM insights WHERE curisouty = TURE;",   // (keeping your fun typo as-is)
  "Transforming raw data into meaningful insights",
  "Extracting -> Transforming -> Loading",
  "python app.py -load_insights"
];


/* ---- Duration controls ---- */
const MIN_DURATION_MS  = 3000;  // total minimum duration (~26s) – tweak as you like
const SOFT_CAP         = 0.98;   // hold here until finish is allowed
const FINISH_TIME_MS   = 1800;   // 98% → 100% glide
const NOTE_STEP        = 15;      // change note every X%

let start = performance.now();
let current = 0;                 // 0..1
let loaded = false;
let finishing = false;
let lastNoteAt = -NOTE_STEP;

/* show loader content immediately (no bg-only) */
pre?.classList.add('show-loader');

function updateUI(p){
  const pct = Math.max(0, Math.min(100, Math.round(p * 100)));
  if (percEl) percEl.textContent = pct + '%';
  if (oilFill) oilFill.style.height = pct + '%';
  if (pct >= lastNoteAt + NOTE_STEP && noteEl){
    noteEl.textContent = dataNotes[Math.floor(Math.random() * dataNotes.length)];
    lastNoteAt = pct;
  }
}

function loop(now){
  if (!pre || finishing) return;

  const elapsed = now - start;
  const fraction = Math.min(elapsed / Math.max(1, MIN_DURATION_MS), 1);
  const simTarget = Math.min(SOFT_CAP, fraction * SOFT_CAP);

  // Slow easing as we approach the cap
  const ease = current > 0.9 ? 0.035 : current > 0.7 ? 0.05 : 0.08;

  // Only finish after minimum duration AND window load
  const canFinish = loaded && elapsed >= MIN_DURATION_MS;
  const target = canFinish ? SOFT_CAP : simTarget;

  current += (target - current) * ease;
  updateUI(current);

  if (canFinish && current >= SOFT_CAP - 0.002){
    finishing = true;
    const endStart = performance.now();
    const step = (t)=>{
      const p = Math.min(1, (t - endStart) / FINISH_TIME_MS);
      updateUI(SOFT_CAP + (1 - SOFT_CAP) * p);
      if (p < 1) requestAnimationFrame(step);
      else {
        setTimeout(()=>{ pre.classList.add('hide'); setTimeout(()=>pre.remove(), 700); }, 900);
      }
    };
    requestAnimationFrame(step);
    return;
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
window.addEventListener('load', ()=>{ loaded = true; });
  // Theme + mobile-nav + scrollspy are handled in the always-run section below.
  }
}

/* ===== Footer year (always runs) ===== */
(function () {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

/* ===== Project filtering (always runs) ===== */
(function () {
  const filterBar = document.querySelector('.filters');
  if (!filterBar) return;

  const buttons = filterBar.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.cards .project');

  function applyFilter(filter) {
    cards.forEach(card => {
      const cats = (card.getAttribute('data-category') || '').split(/\s+/);
      const show = filter === 'all' || cats.includes(filter);
      card.classList.toggle('is-hidden', !show);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');
      applyFilter(btn.getAttribute('data-filter'));
    });
  });
})();

/* ===== Reveal-on-scroll (always runs) ===== */
(function () {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window)) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
})();

/* ===== Theme toggle (light / dark, persisted) ===== */
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('themeToggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch {}
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0e0f17' : '#f7f7fb');
    if (btn) btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }

  // Honour stored choice; default to dark
  let current = 'dark';
  try { current = localStorage.getItem('theme') || 'dark'; } catch {}
  apply(current);

  if (btn) {
    btn.addEventListener('click', () => {
      current = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(current);
    });
  }
})();

/* ===== Mobile navigation (always runs) ===== */
(function () {
  const btn = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!btn || !nav) return;

  function close() {
    nav.classList.remove('open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open navigation menu');
    document.body.style.overflow = '';
  }
  function open() {
    nav.classList.add('open');
    btn.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    btn.setAttribute('aria-label', 'Close navigation menu');
  }

  btn.addEventListener('click', () => {
    nav.classList.contains('open') ? close() : open();
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) close(); });
})();

/* ===== Scrollspy: highlight active nav link (always runs) ===== */
(function () {
  const links = Array.from(document.querySelectorAll('#primaryNav a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  const map = new Map();
  links.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const sec = document.getElementById(id);
    if (sec) map.set(sec, a);
  });
  if (!map.size) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = map.get(entry.target);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  map.forEach((_, sec) => io.observe(sec));
})();
