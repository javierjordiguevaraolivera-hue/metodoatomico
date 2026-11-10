// ===== SETTINGS =====
var CONFIG = {
  // US page: the welcome video is Spanish-only, so it never opens on its own
  videoSoloPrimeraVisita: true
};
// =========================

(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function setIf(key, on) { $$('x-if[data-if="' + key + '"]').forEach(function (el) { el.hidden = !on; }); }
  function bind(key, val) { $$('[data-bind="' + key + '"]').forEach(function (el) { el.textContent = val; }); }

  // Buy buttons: open the checkout on the same page
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-checkout]'); if (!a) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('ma:checkout'));
  });

  function pad(n) { return String(n).padStart(2, '0'); }

  // Sticky bar: on desktop it shows up after scrolling past the hero
  var bar = document.getElementById('buybar');
  function barTick() { if (bar) bar.classList.toggle('oculto', window.innerWidth >= 1000 && window.scrollY < 560); }
  window.addEventListener('scroll', barTick, { passive: true }); window.addEventListener('resize', barTick); barTick();

  // Smooth scroll to prices
  var precio = document.getElementById('precio');
  function goPrecio(e) { if (e) e.preventDefault(); if (precio) precio.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  // Intro video
  var iv = $('#intro-video'), prog = $('#intro-progress');
  var state = { open: false, replay: false, ended: false, muted: false, needTap: false };
  var unlock = null;
  function render() {
    setIf('intro.show', state.open);
    setIf('intro.hasSrc', true); setIf('intro.noSrc', false);
    setIf('intro.ended', state.ended);
    setIf('intro.canClose', state.ended || state.replay);
    setIf('intro.locked', !(state.ended || state.replay));
    setIf('intro.showUnmute', false);
    setIf('intro.tapToPlay', state.needTap && !state.ended);
    setIf('intro.canSpeed', !state.ended);
    document.body.style.overflow = state.open ? 'hidden' : '';
  }
  function removeUnlock() { if (unlock) { ['pointerdown', 'touchstart', 'keydown', 'click'].forEach(function (t) { document.removeEventListener(t, unlock, true); }); unlock = null; } }
  function startWithSound() {
    iv.currentTime = 0; iv.muted = false; iv.volume = 1; iv.playbackRate = speed;
    var p = iv.play();
    if (p && p.catch) p.catch(function () {
      // The browser won't start with sound without a tap: wait for the tap instead of muting.
      try { iv.pause(); } catch (e) {}
      state.needTap = true; render();
    });
  }
  function tapPlay() {
    iv.muted = false; iv.volume = 1; iv.playbackRate = speed;
    state.needTap = false; render(); armStall();
    var r = iv.play(); if (r && r.catch) r.catch(function () { state.needTap = true; render(); });
  }
  var speed = 1;
  function toggleSpeed() { speed = speed === 1 ? 2 : 1; if (iv) iv.playbackRate = speed; bind('intro.speed', speed + 'x'); }
  // If the video doesn't load (slow internet), after 10 s it can be closed so nobody gets stuck.
  var stallT = null;
  function armStall() { clearTimeout(stallT); stallT = setTimeout(function () { if (state.open && !state.ended && !state.replay && !state.needTap) { state.replay = true; render(); } }, 10000); }
  function openIntro(replay) { state = { open: true, replay: !!replay, ended: false, muted: false, needTap: false }; render(); startWithSound(); armStall(); }
  function closeIntro() { try { iv.pause(); } catch (e) {} state.open = false; render(); removeUnlock(); }
  if (iv) {
    iv.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    iv.addEventListener('waiting', armStall);
    iv.addEventListener('playing', function () { clearTimeout(stallT); });
    iv.addEventListener('error', function () { clearTimeout(stallT); if (state.open) closeIntro(); });
    iv.addEventListener('timeupdate', function () {
      var left = Math.max(0, Math.ceil(((iv.duration || 0) - iv.currentTime) / (iv.playbackRate || 1)));
      bind('intro.left', Math.floor(left / 60) + ':' + pad(left % 60));
      if (prog && iv.duration) prog.style.width = Math.min(100, iv.currentTime / iv.duration * 100) + '%';
    });
    iv.addEventListener('pause', function () { if (state.open && !state.needTap && !iv.ended && !state.ended && !state.replay) { var p = iv.play(); if (p && p.catch) p.catch(function () {}); } });
    iv.addEventListener('ended', function () { try { localStorage.setItem('ma_intro_visto', '1'); } catch (e) {} closeIntro(); window.scrollTo(0, 0); });
    var seen = false;
    try { seen = CONFIG.videoSoloPrimeraVisita && localStorage.getItem('ma_intro_visto') === '1'; } catch (e) {}
    // US page: never auto-open the (Spanish) welcome video
    void seen; render();
  }

  // Calendar Agent: the next 30 days with their real dates
  (function () {
    var grid = $('[data-cal]'); if (!grid) return;
    var meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var hoy = new Date();
    var dia = function (i) { return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i); };
    $$('.cal-dot', grid).forEach(function (el, i) { var d = dia(i); el.textContent = d.getDate(); el.title = meses[d.getMonth()] + ' ' + d.getDate(); });
    var fin = dia(29), r = $('[data-cal-range]');
    if (r) r.textContent = meses[hoy.getMonth()] + ' ' + hoy.getDate() + ' to ' + meses[fin.getMonth()] + ' ' + fin.getDate() + ' · one topic a day';
  })();

  // Sample videos: they only download when the visitor scrolls to them
  var lazyV = $$('video[data-src]');
  if ('IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { if (!v.getAttribute('src')) v.src = v.getAttribute('data-src'); var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else if (v.getAttribute('src')) { try { v.pause(); } catch (x) {} }
      });
    }, { rootMargin: '300px 0px' });
    lazyV.forEach(function (v) { vio.observe(v); });
  } else { lazyV.forEach(function (v) { v.src = v.getAttribute('data-src'); v.autoplay = true; }); }

  // Reels lightbox
  var rv = $('#reel-video');
  var REELS = {
    openTuerca: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-tuerca.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-tuerca.jpg', 'Why do nuts come loose?'],
    openMontana: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-montana.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-montana.jpg', 'Why is it colder up in the mountains?'],
    openBostezo: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-bostezo.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-bostezo.jpg', 'Why are yawns contagious?'],
    openPollo: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-pollo.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-pollo.jpg', 'This chicken has no head'],
    openEstiloAtom: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-tuerca.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-tuerca.jpg', 'Atomic style'],
    openEstiloCine: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-cine.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-cine.jpg', 'Night Cinema style'],
    openEstiloDatos: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-datos.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-datos.jpg', 'Neon Data style'],
    openSal: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-sal.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-sal.jpg', 'Where does the salt in the sea come from?'],
    openBrazo: ['https://videos-brazo.proyectoatom.pages.dev/full-brazo.mp4', '/v/cover-brazo.jpg', 'Why does your arm rise on its own?'],
    openSuenos: ['https://videos-suenos.proyectoatom.pages.dev/full-suenos.mp4', '/v/cover-suenos.jpg', 'Why do we dream and have nightmares?'],
    openAvion: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-avion.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-avion.jpg', "Why don't planes fly in a straight line?"],
    openClinica: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-clinica.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-clinica.jpg', 'Example for a dental clinic'],
    openAtomin: ['https://e45064e0.proyectoatom.pages.dev/atomin-elite.mp4', '/atomin-elite.jpg', 'Atomin has a message for you']
  };
  function openReel(k) {
    var r = REELS[k]; rv.src = r[0]; rv.poster = r[1]; bind('reel.title', r[2]);
    setIf('reel.open', true); document.body.style.overflow = 'hidden';
    rv.muted = false; var p = rv.play(); if (p && p.catch) p.catch(function () {});
  }
  function closeReel() { try { rv.pause(); } catch (e) {} rv.removeAttribute('src'); setIf('reel.open', false); document.body.style.overflow = ''; }

  // Actions
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-action]'); if (!el) return;
    var a = el.getAttribute('data-action');
    if (a === 'stop') { e.stopPropagation(); return; }
    if (a === 'goPrecio') return goPrecio(e);
    if (a === 'close') { e.preventDefault(); return closeIntro(); }
    if (a === 'buyFromVideo') { e.preventDefault(); closeIntro(); window.dispatchEvent(new CustomEvent('ma:checkout')); return; }
    if (a === 'unmute') { if (unlock) unlock(); return; }
    if (a === 'tapPlay') { e.preventDefault(); return tapPlay(); }
    if (a === 'speed') { e.preventDefault(); return toggleSpeed(); }
    if (a === 'shareLink') {
      e.preventDefault();
      var url = location.origin + '/us', btn = el;
      var done = function (t) { btn.innerHTML = t; };
      if (navigator.share) { navigator.share({ title: 'Atomic Method', text: 'To watch it on your computer: Atomic Method, your AI makes your videos', url: url }).catch(function () {}); return; }
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { done('<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 9l-5.5 5.5L8 12"/></g></svg> Link copied. Paste it wherever you want to save it'); }, function () { done('Copy this link: ' + url); }); return; }
      done('Copy this link: ' + url); return;
    }
    if (a === 'replay') return openIntro(true);
    if (a === 'closeReel') { if (e.target.closest('#reel-video')) return; return closeReel(); }
    if (REELS[a]) return openReel(a);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('x-if[data-if="reel.open"]').hidden) closeReel(); else if (state.open && (state.ended || state.replay)) closeIntro(); } });
})();

