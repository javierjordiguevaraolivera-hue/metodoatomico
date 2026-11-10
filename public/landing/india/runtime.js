// ===== CONFIGURATION (Atomic Method India) =====
var CONFIG = {
  // Welcome video सिर्फ़ पहली visit पर दिखाएँ
  videoSoloPrimeraVisita: true
};
// =========================

(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function setIf(key, on) { $$('x-if[data-if="' + key + '"]').forEach(function (el) { el.hidden = !on; }); }
  function bind(key, val) { $$('[data-bind="' + key + '"]').forEach(function (el) { el.textContent = val; }); }

  // Buy buttons: इसी page पर checkout (Whop) खोलते हैं
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-checkout]'); if (!a) return;
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('ma:checkout'));
  });

  function pad(n) { return String(n).padStart(2, '0'); }

  // Fixed bar: PC पर hero से नीचे scroll करने पर दिखती है
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
      // Browser बिना tap के sound के साथ start नहीं होने देता: mute करने की जगह tap का इंतज़ार करते हैं।
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
  // अगर video load न हो (slow internet), तो 10 s बाद close हो सकता है ताकि कोई फँसे नहीं।
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
    if (!seen) openIntro(false); else render();
  }

  // Calendar agent: अगले 30 दिन, असली तारीखों के साथ
  (function () {
    var grid = $('[data-cal]'); if (!grid) return;
    var meses = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुला', 'अग', 'सित', 'अक्टू', 'नव', 'दिस'];
    var hoy = new Date();
    var dia = function (i) { return new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + i); };
    $$('.cal-dot', grid).forEach(function (el, i) { var d = dia(i); el.textContent = d.getDate(); el.title = d.getDate() + ' ' + meses[d.getMonth()]; });
    var fin = dia(29), r = $('[data-cal-range]');
    if (r) r.textContent = hoy.getDate() + ' ' + meses[hoy.getMonth()] + ' से ' + fin.getDate() + ' ' + meses[fin.getMonth()] + ' तक · रोज़ एक topic';
  })();

  // Sample videos: तभी download होते हैं जब visitor उन तक पहुँचता है
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
    openTuerca: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-tuerca.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-tuerca.jpg', 'नट अपने आप ढीला क्यों हो जाता है?'],
    openMontana: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-montana.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-montana.jpg', 'पहाड़ों पर ज़्यादा ठंड क्यों होती है?'],
    openBostezo: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-bostezo.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-bostezo.jpg', 'उबासी एक से दूसरे को क्यों लगती है?'],
    openPollo: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-pollo.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-pollo.jpg', 'इस मुर्गे का सिर नहीं है'],
    openEstiloAtom: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-tuerca.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-tuerca.jpg', 'ATOM style'],
    openEstiloCine: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-cine.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-cine.jpg', 'Cine Nocturno style'],
    openEstiloDatos: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-datos.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-datos.jpg', 'Datos Neón style'],
    openSal: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-sal.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-sal.jpg', 'समुद्र में नमक कहाँ से आता है?'],
    openBrazo: ['https://videos-brazo.proyectoatom.pages.dev/full-brazo.mp4', '/v/cover-brazo.jpg', 'हाथ अपने आप ऊपर क्यों उठ जाता है?'],
    openSuenos: ['https://videos-suenos.proyectoatom.pages.dev/full-suenos.mp4', '/v/cover-suenos.jpg', 'हम सपने और डरावने सपने क्यों देखते हैं?'],
    openAvion: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-avion.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-avion.jpg', 'हवाई जहाज़ सीधा क्यों नहीं जाता?'],
    openClinica: ['https://cc59a9fd.proyectoatom.pages.dev/assets/full-clinica.mp4', 'https://cc59a9fd.proyectoatom.pages.dev/assets/cover-clinica.jpg', 'Dental clinic के लिए example'],
    openAtomin: ['https://e45064e0.proyectoatom.pages.dev/atomin-elite.mp4', '/atomin-elite.jpg', 'Atomin के पास आपके लिए एक message है']
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
      var url = location.origin + '/india', btn = el;
      var done = function (t) { btn.innerHTML = t; };
      if (navigator.share) { navigator.share({ title: 'Atomic Method', text: 'Computer पर देखने के लिए: Atomic Method, आपका AI आपके videos बनाता है', url: url }).catch(function () {}); return; }
      if (navigator.clipboard) { navigator.clipboard.writeText(url).then(function () { done('<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 9l-5.5 5.5L8 12"/></g></svg> Link copy हो गया। जहाँ save करना है वहाँ paste करें'); }, function () { done('ये link copy करें: ' + url); }); return; }
      done('ये link copy करें: ' + url); return;
    }
    if (a === 'replay') return openIntro(true);
    if (a === 'closeReel') { if (e.target.closest('#reel-video')) return; return closeReel(); }
    if (REELS[a]) return openReel(a);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!$('x-if[data-if="reel.open"]').hidden) closeReel(); else if (state.open && (state.ended || state.replay)) closeIntro(); } });
})();

