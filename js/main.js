/* Future Vision — interactions (no libraries) */
(function () {
  'use strict';
  var CONTACT_EMAIL = 'hello@your-studio.com'; // where the contact form sends (via the visitor's email app)
  var WORDS = ['websites', 'brands', 'image videos', 'campaigns'];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  $('#year').textContent = new Date().getFullYear();

  /* ---- intro loader: shown once per visit, leaves on click or after 2.6 s ---- */
  var intro = $('#intro'), wipe = $('.intro-wipe'), seen = false;
  try { seen = sessionStorage.getItem('fv-intro') === '1'; } catch (e) { /* private mode */ }
  if (seen || reduce) { document.documentElement.classList.add('intro-skip'); }
  else {
    document.body.style.overflow = 'hidden';
    var left = false;
    var leave = function () {
      if (left) return; left = true;
      try { sessionStorage.setItem('fv-intro', '1'); } catch (e) { /* ignore */ }
      intro.classList.add('is-leaving', 'is-gone'); wipe.classList.add('is-on');
      setTimeout(function () { intro.remove(); wipe.remove(); document.body.style.overflow = ''; }, 2800);
    };
    $('.intro__btn', intro).addEventListener('click', leave);
    intro.addEventListener('click', leave);
    document.addEventListener('keydown', function k() { leave(); document.removeEventListener('keydown', k); });
    setTimeout(leave, 2600);
  }

  /* ---- full-screen menu: circle grows from the button, gold circle closes it ---- */
  var btn = $('.menu-btn'), menu = $('#menu'), layOpen = $('.menu-layer--open'), layClose = $('.menu-layer--close'), busy = false;
  function placeLayers() {
    var r = $('.menu-btn__icon').getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var d = 2 * Math.sqrt(Math.pow(Math.max(x, innerWidth - x), 2) + Math.pow(Math.max(y, innerHeight - y), 2));
    [layOpen, layClose].forEach(function (l) { l.style.setProperty('--x', x + 'px'); l.style.setProperty('--y', y + 'px'); l.style.setProperty('--d', d + 'px'); });
  }
  function openMenu() {
    if (busy) return; busy = true; placeLayers();
    document.body.classList.add('menu-open'); btn.setAttribute('aria-expanded', 'true');
    layOpen.classList.add('is-on');
    setTimeout(function () { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('is-visible'); }); $('a', menu).focus({ preventScroll: true }); busy = false; }, reduce ? 0 : 550);
  }
  function closeMenu(then) {
    if (busy || menu.hidden) return; busy = true;
    btn.setAttribute('aria-expanded', 'false');
    layClose.classList.add('is-on');
    setTimeout(function () {
      menu.classList.remove('is-visible'); menu.hidden = true; layOpen.classList.remove('is-on');
      document.body.classList.remove('menu-open');
      if (then) then();
      layClose.classList.add('is-fade');
      setTimeout(function () { var sp = $('span', layClose); sp.style.transition = 'none'; layClose.classList.remove('is-on', 'is-fade'); void sp.offsetWidth; sp.style.transition = ''; busy = false; }, 650);
    }, reduce ? 0 : 650);
  }
  btn.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
  $$('a', menu).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href'); if (href.charAt(0) !== '#') return;
      e.preventDefault();
      closeMenu(function () { var t = $(href); if (t) t.scrollIntoView({ behavior: 'instant' }); });
    });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); btn.focus(); } });
  addEventListener('resize', placeLayers);

  /* ---- header: solid after hero, hides on scroll down ---- */
  var header = $('.header'), lastY = 0;
  function onScroll() {
    var y = scrollY;
    header.classList.toggle('is-solid', y > 80);
    header.classList.toggle('is-hidden', y > lastY && y > 600);
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---- typing effect ---- */
  var typed = $('#typed');
  if (!reduce) (function () {
    var wi = 0, ci = WORDS[0].length, del = true;
    (function loop() {
      if (del) { ci--; if (ci === 0) { del = false; wi = (wi + 1) % WORDS.length; } }
      else { ci++; if (ci === WORDS[wi].length) { del = true; typed.textContent = WORDS[wi]; return setTimeout(loop, 2200); } }
      typed.textContent = WORDS[wi].slice(0, ci) || ' ';
      setTimeout(loop, del ? 45 : 85);
    })();
  })();

  /* ---- custom cursor, magnetic buttons, tilt cards (desktop only) ---- */
  if (fine && !reduce) {
    var ring = $('.cursor'), dot = $('.cursor-dot'), mx = 0, my = 0, rx = 0, ry = 0;
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; document.body.classList.add('has-cursor'); });
    document.addEventListener('mouseleave', function () { document.body.classList.remove('has-cursor'); });
    (function follow() { rx += (mx - rx) * .18; ry += (my - ry) * .18; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)'; requestAnimationFrame(follow); })();
    document.addEventListener('pointerover', function (e) { ring.classList.toggle('is-hover', !!e.target.closest('a, button, [data-tilt], label')); });
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * .25) + 'px,' + ((e.clientY - r.top - r.height / 2) * .35) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    $$('[data-tilt]').forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = 'perspective(800px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg)'; });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  /* ---- reveal + counters ---- */
  function count(el) {
    var target = +el.getAttribute('data-count'), t0 = performance.now(), dur = reduce ? 0 : 1800;
    (function f(now) { var p = dur ? Math.min(1, (now - t0) / dur) : 1; el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  var els = $$('[data-reveal], [data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (!x.isIntersecting) return; if (x.target.hasAttribute('data-count')) count(x.target); else x.target.classList.add('is-in'); io.unobserve(x.target); }); }, { threshold: .15 });
    els.forEach(function (el) { io.observe(el); });
  } else els.forEach(function (el) { if (el.hasAttribute('data-count')) count(el); else el.classList.add('is-in'); });

  /* ---- contact form ---- */
  $('#form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = $('.form__msg', f), bad = $$('[required]', f).filter(function (i) { return !i.checkValidity(); });
    $$('.is-bad', f).forEach(function (i) { i.classList.remove('is-bad'); });
    if (bad.length) { bad.forEach(function (i) { i.classList.add('is-bad'); }); bad[0].focus(); return; }
    var needs = $$('input[name="need"]:checked', f).map(function (i) { return i.value; }).join(', ') || 'Not sure yet';
    msg.textContent = 'Thank you! Your email app will open to send the message.';
    location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + encodeURIComponent('New project — ' + needs) + '&body=' + encodeURIComponent(f.message.value + '\n\n' + f.name.value + ' — ' + f.email.value);
  });
})();
