/* ═══════════════════════════════════════════
   RASTREADORES — script.js
   Cursor, Nav, Reveal, Counters, Hamburger
   Three.js/satélite → assets/js/satellite.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

/* ─── CURSOR ─── */
const cursor     = document.getElementById('cursor');
const cursorRing = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;

if (cursor && cursorRing) {
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top  = my + 'px';
  });

  (function animRing() {
    rx += (mx - rx) * 0.14;
    ry += (my - ry) * 0.14;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  })();

  document.querySelectorAll('a, button, .scard, .feat, .step').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('expand'); cursorRing.classList.add('expand'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('expand'); cursorRing.classList.remove('expand'); });
  });
}

/* ─── NAVBAR SCROLL ─── */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY > 40;
    navbar.classList.toggle('scrolled', scrolled);
    
    const logo = document.querySelector('.nav-logo img');
    if (logo) {
      logo.src = scrolled 
        ? 'assets/logos/rastreadores-branco.png'
        : 'assets/logos/rastreadores-azul.png';
    }
  }, { passive: true });
}

/* ─── SCROLL REVEAL ─── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── COUNTERS ─── */
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function runCounter(el, target, duration) {
  duration = duration || 1800;
  var start = performance.now();
  (function tick(now) {
    var progress = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor(easeOutCubic(progress) * target).toLocaleString('pt-BR');
    if (progress < 1) requestAnimationFrame(tick);
    else el.textContent = target.toLocaleString('pt-BR');
  })(start);
}

var statObs = new IntersectionObserver(function(entries) {
  entries.forEach(function(e) {
    if (e.isIntersecting) {
      document.querySelectorAll('.count[data-target]').forEach(function(el) {
        runCounter(el, parseInt(el.dataset.target));
      });
      statObs.disconnect();
    }
  });
}, { threshold: 0.3 });

var numerosSection = document.getElementById('numeros');
if (numerosSection) statObs.observe(numerosSection);

/* ─── HAMBURGER / NAV DRAWER (mobile) ─── */
var hamburger = document.getElementById('hamburger');
var drawer    = document.getElementById('nav-drawer');
var overlay   = document.getElementById('nav-overlay');
var closeBtn  = document.getElementById('nav-drawer-close');

if (hamburger && drawer) {
  function openMenu() {
    drawer.classList.add('open');
    if (overlay)   overlay.classList.add('open');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    drawer.classList.remove('open');
    if (overlay)   overlay.classList.remove('open');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (overlay)  overlay.addEventListener('click', closeMenu);

  /* Fecha ao clicar em qualquer link dentro do drawer */
  drawer.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', closeMenu);
  });

  /* Fecha com ESC */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeMenu();
  });
}

}); // fim DOMContentLoaded