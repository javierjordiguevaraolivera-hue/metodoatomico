import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';
// Sonidos de la página Método Atómico, sintetizados con Web Audio (sin archivos).
// Suenan solo después del primer toque del visitante. Botón [data-snd-toggle] para silenciar.
const SFX = (() => {
  let ctx = null, master = null, on = true, humNode = null, tBase = 0, H = null;
  try { on = localStorage.getItem('atom_snd') !== '0'; } catch (e) {}
  function ac() {
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      ctx = new C();
      const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4; comp.connect(ctx.destination);
      master = ctx.createGain(); master.gain.value = 0.32; master.connect(comp);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // iPhone/iPad: el audio solo arranca con un toque completo, y el interruptor de silencio
  // apaga Web Audio salvo que haya un <audio> sonando: tocamos un silencio en bucle.
  let silent = null;
  function iosSession() {
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    try { if (!silent) { silent = new Audio('data:audio/wav;base64,UklGRvQHAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YdAHAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgA=='); silent.loop = true; silent.setAttribute('playsinline', ''); silent.preload = 'auto'; } if (on && silent.paused) { const p = silent.play(); if (p && p.catch) p.catch(() => {}); } } catch (e) {}
  }
  const EVTS = ['pointerdown', 'pointerup', 'touchstart', 'touchend', 'click', 'keydown'];
  const unlock = () => {
    const c = ac(); if (!c) return; if (on) iosSession();
    const done = () => { MUSIC.start(); if (c.state === 'running') EVTS.forEach(t => removeEventListener(t, unlock, true)); };
    if (c.state !== 'running') c.resume().then(done, () => {}); else done();
  };
  EVTS.forEach(t => addEventListener(t, unlock, { capture: true, passive: true }));

  // ---- bloques ----
  function tone(f, dur, o = {}) {
    const c = ctx, t = c.currentTime + tBase + (o.delay || 0);
    const osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t);
    if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + (o.glide || dur));
    if (o.vib) { const l = c.createOscillator(), lg = c.createGain(); l.frequency.value = o.vib; lg.gain.value = o.vibAmt || 12; l.connect(lg); lg.connect(osc.frequency); l.start(t); l.stop(t + dur + 0.05); }
    const v = o.vol == null ? 0.5 : o.vol, a = o.attack || 0.004;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node = osc;
    if (o.lp) { const f2 = c.createBiquadFilter(); f2.type = 'lowpass'; f2.frequency.value = o.lp; osc.connect(f2); node = f2; }
    node.connect(g); g.connect(o.dest || master); osc.start(t); osc.stop(t + dur + 0.05);
  }
  let noiseBuf = null;
  function noise(dur, o = {}) {
    const c = ctx, t = c.currentTime + tBase + (o.delay || 0);
    if (!noiseBuf) { noiseBuf = c.createBuffer(1, c.sampleRate * 1.5, c.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const src = c.createBufferSource(); src.buffer = noiseBuf;
    const f = c.createBiquadFilter(); f.type = o.ftype || 'bandpass'; f.frequency.setValueAtTime(o.f || 1200, t); f.Q.value = o.q || 1;
    if (o.fto) f.frequency.exponentialRampToValueAtTime(o.fto, t + dur);
    const g = c.createGain(); const v = o.vol == null ? 0.4 : o.vol;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + (o.attack || 0.005)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(o.dest || master); src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.05);
  }


  // ---- música de fondo (generada, bajita, en loop) ----
  const MUSIC = (() => {
    // "La fábrica cósmica de Atomín": pad espacial que respira, partículas que orbitan,
    // un groove de máquinas suave, bajo saltarín y una cajita musical cada 8 compases.
    let bus = null, dly = null, padF = null, timer = null, next = 0, step = 0, playing = false, ducked = false;
    const LEVEL = 0.1, BPM = 100, S16 = 60 / BPM / 4;
    const FILE_URL = '/atom-musica.mp3', FILE_LEVEL = 0.12; let fileBuf = null, loading = null, src = null, useFile = false;
    function loadFile() { if (fileBuf) return Promise.resolve(fileBuf); if (!loading) loading = fetch(FILE_URL).then(r => { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(ab => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej))).then(b => (fileBuf = b)).catch(() => null); return loading; }
    const CH = [[53, 57, 60, 64], [55, 59, 62, 66], [52, 55, 59, 62], [57, 60, 64, 67]]; // Fmaj7 · D/G (lidio) · Em7 · Am7
    const PENTA = [72, 74, 76, 79, 81, 84, 86, 88];
    const BOX = [84, 88, 91, 93, 91, 88, 86, 84];
    const hz = m => 440 * Math.pow(2, (m - 69) / 12);
    function setup() {
      bus = ctx.createGain(); bus.gain.value = 0.0001; bus.connect(ctx.destination);
      // eco espacial
      dly = ctx.createDelay(1.5); dly.delayTime.value = S16 * 6; const fb = ctx.createGain(); fb.gain.value = 0.42; const wet = ctx.createGain(); wet.gain.value = 0.35;
      const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2600;
      dly.connect(dlp); dlp.connect(fb); fb.connect(dly); dlp.connect(wet); wet.connect(bus);
      // filtro del pad que "respira"
      padF = ctx.createBiquadFilter(); padF.type = 'lowpass'; padF.frequency.value = 700; padF.Q.value = 2; padF.connect(bus);
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 450; lfo.connect(lg); lg.connect(padF.frequency); lfo.start();
    }
    function v(f, t, dur, o) {
      const osc = ctx.createOscillator(), g = ctx.createGain(); osc.type = o.type; osc.frequency.setValueAtTime(f, t); if (o.det) osc.detune.value = o.det;
      if (o.drop) osc.frequency.exponentialRampToValueAtTime(f * o.drop, t + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.v, t + o.a); g.gain.setValueAtTime(o.v, t + Math.max(o.a, dur - o.r)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + o.r * 0.3);
      let n = osc; n.connect(g);
      let out = g; if (o.pan != null && ctx.createStereoPanner) { const pn = ctx.createStereoPanner(); pn.pan.value = o.pan; g.connect(pn); out = pn; }
      out.connect(o.dest || bus); if (o.echo) out.connect(dly); osc.start(t); osc.stop(t + dur + o.r + 0.1);
    }
    function schedule() {
      while (next < (H != null ? H : ctx.currentTime + 0.35)) {
        const t = next, s16 = step % 16, bar = Math.floor(step / 16), chord = CH[Math.floor(bar / 2) % 4];
        // pad atmosférico (cada 2 compases)
        if (step % 32 === 0) chord.forEach((m, i) => { v(hz(m), t, S16 * 32, { type: 'sawtooth', v: 0.03, a: 1.8, r: 2.2, det: i % 2 ? 8 : -8, dest: padF }); v(hz(m + 12), t, S16 * 32, { type: 'triangle', v: 0.018, a: 2.4, r: 2.4, dest: padF }); });
        // groove de máquinas
        if (s16 === 0 || s16 === 8) v(110, t, 0.16, { type: 'sine', v: 0.22, a: 0.004, r: 0.12, drop: 0.45 });
        if (s16 === 4 || s16 === 12) { noise(0.09, { f: 1700, q: 0.8, vol: 0.05, delay: t - ctx.currentTime, dest: bus }); v(hz(91), t, 0.06, { type: 'triangle', v: 0.02, a: 0.002, r: 0.05, pan: 0.3 }); }
        if (s16 % 2 === 1) noise(0.035, { f: 8500, q: 0.6, vol: s16 % 4 === 3 ? 0.016 : 0.009, ftype: 'highpass', delay: t - ctx.currentTime, dest: bus });
        if (s16 === 14 && bar % 2 === 1) v(hz(79), t, 0.08, { type: 'square', v: 0.008, a: 0.002, r: 0.06, pan: -0.4, echo: true });
        // bajo saltarín
        const bp = [0, 3, 6, 10, 12]; if (bp.includes(s16)) { const m = chord[0] - 12 + (s16 === 10 ? 7 : s16 === 6 ? 12 : 0); v(hz(m), t, S16 * 1.6, { type: 'triangle', v: 0.11, a: 0.006, r: 0.12 }); }
        // partículas que orbitan (notas pentatónicas con paneo y eco)
        if ((s16 === 2 || s16 === 7 || s16 === 11 || (s16 === 15 && bar % 2 === 0)) && Math.random() < 0.8) { const m = PENTA[(step * 7 + bar * 3) % PENTA.length]; v(hz(m), t, 0.22, { type: 'sine', v: 0.03, a: 0.004, r: 0.2, pan: Math.sin(step * 0.7) * 0.8, echo: true }); }
        // cajita musical cada 8 compases
        if (bar % 8 === 4 && s16 % 2 === 0) { const m = BOX[(s16 / 2) % 8]; v(hz(m), t, 0.5, { type: 'triangle', v: 0.035, a: 0.004, r: 0.45, pan: 0.15, echo: true }); }
        // barrido de "máquina que arranca" al inicio de cada ciclo
        if (step % 128 === 0) noise(2.2, { f: 300, fto: 3200, q: 1.5, vol: 0.02, attack: 1.4, delay: t - ctx.currentTime, dest: bus });
        next += S16; step++;
      }
    }
    function fade(to, sec) { if (!bus) return; const t = ctx.currentTime; bus.gain.cancelScheduledValues(t); bus.gain.setValueAtTime(Math.max(0.0001, bus.gain.value), t); bus.gain.exponentialRampToValueAtTime(Math.max(0.0001, to), t + sec); }
    const level = () => (ducked ? 0.0001 : (useFile ? FILE_LEVEL : LEVEL));
    return {
      start() { if (!on || !ctx || playing) return; if (!bus) setup(); playing = true;
        loadFile().then(b => { if (!playing || src || timer) return; if (b) { useFile = true; src = ctx.createBufferSource(); src.buffer = b; src.loop = true; src.connect(bus); src.start(); } else { useFile = false; next = ctx.currentTime + 0.1; schedule(); timer = setInterval(schedule, 100); } fade(level(), 4); }); },
      stop() { if (!playing) return; playing = false; fade(0.0001, 0.6); setTimeout(() => { if (!playing) { clearInterval(timer); timer = null; if (src) { try { src.stop(); } catch (e) {} src = null; } } }, 700); },
      duck(d) { ducked = d; if (playing) fade(level(), d ? 0.4 : 2); },
      renderAll(dur, lvl) { setup(); bus.gain.value = lvl; next = 0; step = 0; H = dur; schedule(); H = null; },
      reset() { bus = null; playing = false; },
      state() { return { playing, ducked, gain: bus ? +bus.gain.value.toFixed(4) : 0 }; }
    };
  })();
  // bajar la música mientras suena un video con audio
  function watchVideos() {
    const anyPlaying = () => [...document.querySelectorAll('video')].some(v => !v.paused && !v.muted && !v.ended && v.currentTime > 0);
    const upd = () => MUSIC.duck(anyPlaying());
    document.querySelectorAll('video').forEach(v => ['play', 'playing', 'pause', 'ended', 'volumechange', 'emptied'].forEach(ev => v.addEventListener(ev, upd)));
    setInterval(upd, 1500);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchVideos); else watchVideos();
  document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) { ctx.suspend(); try { silent && silent.pause(); } catch (e) {} } else if (on) { ctx.resume(); iosSession(); } });

  // ---- biblioteca ----
  const LIB = {
    pop() { tone(520, 0.09, { to: 880, glide: 0.06, vol: 0.35 }); noise(0.03, { f: 3000, q: 2, vol: 0.12 }); },
    tick() { tone(1900, 0.035, { type: 'triangle', vol: 0.16 }); },
    boing() { tone(190, 0.42, { to: 620, glide: 0.12, vol: 0.4, vib: 18, vibAmt: 40 }); tone(620, 0.25, { to: 300, delay: 0.14, vol: 0.18, type: 'triangle' }); },
    whoosh() { noise(0.32, { f: 380, fto: 2600, q: 0.8, vol: 0.32, attack: 0.08 }); },
    ding() { tone(1318, 0.5, { type: 'triangle', vol: 0.22 }); tone(1975, 0.35, { type: 'sine', vol: 0.08, delay: 0.005 }); },
    drop() { tone(900, 0.5, { to: 220, glide: 0.45, vol: 0.18, type: 'triangle' }); tone(110, 0.18, { to: 60, delay: 0.5, vol: 0.45 }); },
    lupa() { tone(392, 0.18, { type: 'triangle', vol: 0.18, to: 523 }); tone(523, 0.22, { type: 'triangle', vol: 0.16, delay: 0.2, to: 659 }); },
    scribble() { for (let i = 0; i < 7; i++) noise(0.06, { f: 2600 + Math.random() * 1500, q: 4, vol: 0.14, delay: i * 0.075 }); },
    voice() { for (let i = 0; i < 6; i++) tone(260 + Math.random() * 320, 0.07, { type: 'square', vol: 0.06, lp: 1400, delay: i * 0.085 }); },
    taps() { for (let i = 0; i < 3; i++) { tone(1200, 0.04, { type: 'triangle', vol: 0.15, delay: i * 0.13 }); noise(0.03, { f: 1800, q: 3, vol: 0.08, delay: i * 0.13 }); } },
    swoosh() { noise(0.28, { f: 2400, fto: 500, q: 1.2, vol: 0.28, attack: 0.04 }); tone(660, 0.15, { to: 1320, delay: 0.24, vol: 0.12, type: 'triangle' }); },
    brush() { noise(0.22, { f: 900, fto: 1600, q: 0.7, vol: 0.2, attack: 0.05, ftype: 'lowpass' }); noise(0.22, { f: 1600, fto: 900, q: 0.7, vol: 0.18, attack: 0.05, ftype: 'lowpass', delay: 0.26 }); },
    beep() { tone(1046, 0.08, { vol: 0.16 }); tone(1568, 0.12, { vol: 0.16, delay: 0.11 }); },
    drum() { const k = (d) => tone(150, 0.18, { to: 50, glide: 0.12, vol: 0.55, delay: d }); const sn = (d) => noise(0.12, { f: 1800, q: 0.6, vol: 0.25, delay: d }); k(0); sn(0.15); k(0.3); k(0.38); sn(0.45); },
    box() { tone(130, 0.2, { to: 60, vol: 0.45 }); noise(0.25, { f: 1500, fto: 3000, q: 1, vol: 0.12, delay: 0.12 }); },
    alarm() { [0, 0.22, 0.44].forEach((d, i) => tone(i % 2 ? 660 : 880, 0.18, { type: 'square', vol: 0.07, lp: 2200, delay: d })); },
    approve() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.075 })); },
    fanfare() { [523, 659, 784].forEach((f, i) => tone(f, 0.18, { type: 'triangle', vol: 0.2, delay: i * 0.1 })); [523, 659, 784, 1046].forEach(f => tone(f, 0.9, { type: 'triangle', vol: 0.12, delay: 0.32 })); for (let i = 0; i < 10; i++) noise(0.05, { f: 4000 + Math.random() * 3000, q: 6, vol: 0.08, delay: 0.35 + Math.random() * 0.8 }); },
    open() { tone(400, 0.12, { to: 800, vol: 0.18, type: 'triangle' }); }
  };
  function play(n) { if (!on || !ctx || !LIB[n]) return; if (ctx.state !== 'running') { ctx.resume().then(() => { try { LIB[n](); } catch (e) {} }, () => {}); return; } try { LIB[n](); } catch (e) {} }
  function hum(start) {
    if (!ctx || ctx.state !== 'running') return;
    if (start && on && !humNode) {
      const t = ctx.currentTime, o = ctx.createOscillator(), o2 = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      o.type = 'sawtooth'; o.frequency.value = 55; o2.type = 'sawtooth'; o2.frequency.value = 55.7; f.type = 'lowpass'; f.frequency.value = 260;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.09, t + 0.15);
      o.connect(f); o2.connect(f); f.connect(g); g.connect(master); o.start(t); o2.start(t); humNode = { o, o2, g };
    } else if (!start && humNode) {
      const t = ctx.currentTime, h = humNode; humNode = null;
      h.g.gain.cancelScheduledValues(t); h.g.gain.setValueAtTime(h.g.gain.value, t); h.g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15); h.o.stop(t + 0.2); h.o2.stop(t + 0.2);
    }
  }
  function paint() { document.querySelectorAll('[data-snd-toggle]').forEach(b => { b.innerHTML = on ? '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298zM16 9a5 5 0 0 1 0 6m3.364 3.364a9 9 0 0 0 0-12.728"/></svg>' : '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4.702a.7.7 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.7.7 0 0 0 11 19.298zm5.5 9.798l5-5m-5 0l5 5"/></svg>'; b.setAttribute('aria-label', on ? 'Silenciar sonidos' : 'Activar sonidos'); b.setAttribute('aria-pressed', on ? 'false' : 'true'); }); }
  function toggle() { on = !on; try { localStorage.setItem('atom_snd', on ? '1' : '0'); } catch (e) {} if (!on) { hum(false); MUSIC.stop(); try { silent && silent.pause(); } catch (e) {} } else { const c = ac(); iosSession(); const go = () => { MUSIC.start(); play('pop'); }; if (c && c.state !== 'running') c.resume().then(go, () => {}); else go(); } paint(); }
  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-snd-toggle]')) { e.preventDefault(); toggle(); return; }
    if (t.closest('summary')) return play('tick');
    const act = t.closest('[data-action]'); const a = act && act.getAttribute('data-action');
    if (a && /^open/.test(a)) return play('whoosh');
    if (t.closest('a.btn-pop, .cta-mid a, [data-checkout], .fx-go, .fx-ghost, .fx-chip, .fx-rail button, .fx-ctrl button, nav a, a[href="#precio"], button')) return play('pop');
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint); else paint();
  async function renderOffline(dur, events, musicLevel) {
    const sv = [ctx, master, noiseBuf]; const sr = 44100;
    ctx = new OfflineAudioContext(2, Math.ceil(sr * dur), sr); noiseBuf = null;
    master = ctx.createGain(); master.gain.value = 0.32; master.connect(ctx.destination);
    MUSIC.reset(); if (musicLevel) MUSIC.renderAll(dur, musicLevel);
    for (const [t, n] of events) { tBase = t; try { LIB[n](); } catch (e) {} } tBase = 0;
    const buf = await ctx.startRendering(); [ctx, master, noiseBuf] = sv; MUSIC.reset();
    // WAV 16-bit estéreo
    const L = buf.getChannelData(0), Rr = buf.getChannelData(1), n = L.length, ab = new ArrayBuffer(44 + n * 4), dv = new DataView(ab);
    const ws = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
    ws(0, 'RIFF'); dv.setUint32(4, 36 + n * 4, true); ws(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 2, true); dv.setUint32(24, sr, true); dv.setUint32(28, sr * 4, true); dv.setUint16(32, 4, true); dv.setUint16(34, 16, true); ws(36, 'data'); dv.setUint32(40, n * 4, true);
    for (let i = 0; i < n; i++) { dv.setInt16(44 + i * 4, Math.max(-1, Math.min(1, L[i])) * 32767, true); dv.setInt16(46 + i * 4, Math.max(-1, Math.min(1, Rr[i])) * 32767, true); }
    let bin = ''; const u = new Uint8Array(ab); for (let i = 0; i < u.length; i += 0x8000) bin += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(bin);
  }
  return { play, hum, toggle, music: MUSIC, renderOffline, get on() { return on; } };
})();

// Mascota Método Atómico en 3D: monta un personaje animado dentro de un contenedor.
// Uso: mountMascot(THREE, el, {mode:'hero'|'cheer'|'think', interactive:true})
function mountMascot(THREE, el, opts = {}) {
  const mode = opts.mode || 'hero';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .5s ease';
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opts.capture, powerPreference: 'low-power' });
  } catch (e) { return null; }
  el.appendChild(canvas);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight('#d8ccff', '#3a1a5c', 0.75));
  const key = new THREE.DirectionalLight('#fff1dc', 2.6); key.position.set(3.5, 6, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.radius = 6;
  Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4 }); key.shadow.bias = -0.0005; scene.add(key);
  const rim1 = new THREE.DirectionalLight('#ff5cc0', 2.4); rim1.position.set(-5, 3, -3); scene.add(rim1);
  const rim2 = new THREE.DirectionalLight('#7fd8ff', 1.3); rim2.position.set(5, 2, -4); scene.add(rim2);
  const bounce = new THREE.PointLight('#2FD39B', 3, 6); bounce.position.set(0, -1.2, 2); scene.add(bounce);

  const toon = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .42, metalness: 0, ...o });
  const gem = c => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .35, metalness: .05 });
  const BODY = toon('#7A46F0'), YEL = gem('#2FD39B'), PNK = gem('#FF4FAE'), SHOE = toon('#2FD39B'),
    WHT = toon('#FFFFFF', { roughness: .2 }), DRK = toon('#1A0B3A', { roughness: .15 }), CHK = toon('#FF8FD0'), TNG = toon('#FF5C8A');
  const mesh = (g, m) => { const x = new THREE.Mesh(g, m); x.castShadow = true; x.receiveShadow = true; return x; };

  const shadow = new THREE.Mesh(new THREE.CircleGeometry(1.5, 48), new THREE.ShadowMaterial({ opacity: .42 }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.55; shadow.receiveShadow = true; scene.add(shadow);

  const root = new THREE.Group(); scene.add(root);
  const squash = new THREE.Group(); root.add(squash); squash.position.y = -1.5;
  const pivot = new THREE.Group(); squash.add(pivot); pivot.position.y = 1.5;
  const body = new THREE.Group(); pivot.add(body);

  const bodyGeo = new THREE.SphereGeometry(1, 64, 48);
  { const p = bodyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 1 + (y < 0 ? 0.08 * (-y) : -0.06 * y); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k * 0.94); p.setY(i, y * 1.02); } bodyGeo.computeVertexNormals(); }
  { const p = bodyGeo.attributes.position, col = [], a = new THREE.Color('#7342EC'), b = new THREE.Color('#A988FF'), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = Math.max(0, Math.min(1, (z - 0.25) / 0.5)) * Math.exp(-Math.pow((y - 0.02) / 0.55, 4)) * Math.exp(-Math.pow(x / 0.75, 4)); c.copy(a).lerp(b, f); col.push(c.r, c.g, c.b); }
    bodyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  body.add(mesh(bodyGeo, toon('#ffffff', { vertexColors: true })));

  const eyes = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group();
    const w = mesh(new THREE.SphereGeometry(0.235, 32, 24), WHT); w.scale.set(0.92, 1.15, 0.5); e.add(w);
    const p = mesh(new THREE.SphereGeometry(0.15, 32, 24), DRK); p.scale.set(1, 1.15, 0.55); p.position.set(0, -0.02, 0.07); e.add(p);
    const h1 = mesh(new THREE.SphereGeometry(0.05, 12, 8), WHT); h1.position.set(0.05, 0.07, 0.15); e.add(h1);
    const h2 = mesh(new THREE.SphereGeometry(0.022, 10, 6), WHT); h2.position.set(-0.04, -0.07, 0.15); e.add(h2);
    e.position.set(0.31 * s, 0.18, 0.9); e.rotation.y = 0.28 * s; body.add(e);
    const brow = mesh(new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), DRK); brow.rotation.z = Math.PI / 2 - 0.22 * s; brow.position.set(0.31 * s, 0.5, 0.86); brow.rotation.y = 0.28 * s; body.add(brow);
    const ck = mesh(new THREE.SphereGeometry(0.11, 20, 12), CHK); ck.scale.set(1.25, 0.7, 0.35); ck.position.set(0.58 * s, -0.12, 0.78); ck.rotation.y = 0.6 * s; body.add(ck);
    eyes.push({ g: e, p, h1, brow, s });
  }
  const mouth = new THREE.Group();
  const mShape = new THREE.Shape(); mShape.moveTo(-0.2, 0); mShape.quadraticCurveTo(0, -0.27, 0.2, 0); mShape.quadraticCurveTo(0, 0.03, -0.2, 0);
  mouth.add(mesh(new THREE.ExtrudeGeometry(mShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }), DRK));
  const tg = mesh(new THREE.SphereGeometry(0.075, 16, 10), TNG); tg.scale.set(1.3, 0.6, 0.5); tg.position.set(0.02, -0.13, 0.035); mouth.add(tg);
  mouth.position.set(0, -0.14, 0.97); mouth.rotation.x = -0.12; body.add(mouth);

  const crown = new THREE.Group(); crown.position.set(0, 0.95, 0.05); body.add(crown);
  const cr = [[0, 0.18, 0, 0.3, YEL], [-0.3, 0.05, 0.1, 0.24, YEL], [0.3, 0.06, 0.08, 0.25, PNK], [-0.12, 0.08, 0.3, 0.2, PNK], [0.14, 0.1, 0.28, 0.21, YEL], [0.0, 0.42, -0.05, 0.21, YEL], [-0.24, 0.3, -0.12, 0.19, PNK], [0.26, 0.3, -0.1, 0.2, YEL], [0.06, 0.62, 0.02, 0.15, PNK]];
  const crownBalls = cr.map(([x, y, z, r, m]) => { const b = mesh(new THREE.IcosahedronGeometry(r, 1), m); b.position.set(x, y, z); b.userData.base = b.position.clone(); crown.add(b); return b; });

  function arm(s) {
    const sh = new THREE.Group(); sh.position.set(0.98 * s, -0.12, 0.08);
    const up = mesh(new THREE.CapsuleGeometry(0.135, 0.34, 6, 12), BODY); up.position.y = -0.26; sh.add(up);
    const hand = new THREE.Group(); hand.position.y = -0.54; sh.add(hand);
    const palm = mesh(new THREE.SphereGeometry(0.17, 20, 14), SHOE); palm.scale.set(1, 1.05, 0.85); hand.add(palm);
    const th = mesh(new THREE.SphereGeometry(0.075, 12, 8), SHOE); th.position.set(-0.13 * s, 0.05, 0.04); hand.add(th);
    body.add(sh); return { sh, hand };
  }
  const aL = arm(-1), aR = arm(1);
  function leg(s) {
    const g = new THREE.Group(); g.position.set(0.36 * s, -0.92 + 1.5, 0.02);
    const l = mesh(new THREE.CapsuleGeometry(0.14, 0.22, 6, 12), BODY); l.position.y = -0.2; g.add(l);
    const shoe = mesh(new THREE.SphereGeometry(0.24, 24, 16), SHOE); shoe.scale.set(1, 0.62, 1.35); shoe.position.set(0.02 * s, -0.43, 0.1); g.add(shoe);
    squash.add(g); return g;
  }
  const lL = leg(-1), lR = leg(1);

  const orbits = [];
  const ringMat = new THREE.MeshBasicMaterial({ color: '#FFB4E4', transparent: true, opacity: .6 });
  const eMat = new THREE.MeshStandardMaterial({ color: '#FFF6C9', emissive: '#2FD39B', emissiveIntensity: 3 });
  [[1.42, 0.5], [1.42, -0.5]].forEach(([rx, ry], k) => {
    const g = new THREE.Group(); g.rotation.order = 'YXZ'; g.rotation.y = ry; g.rotation.x = rx; g.position.y = -0.72;
    g.add(new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.014, 8, 160), ringMat));
    const e = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11, 2), eMat); g.add(e);
    const trail = []; for (let i = 1; i < 7; i++) { const t = new THREE.Mesh(new THREE.SphereGeometry(0.09 * (1 - i / 8), 10, 8), new THREE.MeshBasicMaterial({ color: '#FFE27A', transparent: true, opacity: 0.5 * (1 - i / 7) })); g.add(t); trail.push(t); }
    g.userData = { e, trail, ph: k * Math.PI }; pivot.add(g); orbits.push(g);
  });

  // mirada: sigue al puntero (en PC) con suavizado
  const look = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  if (opts.interactive !== false) {
    window.addEventListener('pointermove', ev => {
      if (ev.pointerType && ev.pointerType !== 'mouse') return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height * 0.45;
      look.tx = Math.max(-1, Math.min(1, (ev.clientX - cx) / (innerWidth * 0.45)));
      look.ty = Math.max(-1, Math.min(1, (ev.clientY - cy) / (innerHeight * 0.55)));
      look.active = true;
    }, { passive: true });
  }
  // toque: salto con vuelta (deleite)
  let spinAt = -10;
  const hit = document.createElement('div');
  hit.style.cssText = 'position:absolute;left:28%;right:28%;top:22%;bottom:6%;pointer-events:auto;cursor:pointer;border-radius:50%';
  el.appendChild(hit);
  hit.addEventListener('click', () => { spinAt = clock(); if (opts.onTap) opts.onTap(); });

  const D = 4;
  function pose(t, dt) {
    const T = ((t % D) + D) % D / D, w = T * 2 * Math.PI;
    look.x += (look.tx - look.x) * Math.min(1, dt * 6); look.y += (look.ty - look.y) * Math.min(1, dt * 6);
    const hopsPerLoop = mode === 'cheer' ? 2 : mode === 'think' ? 0 : 2;
    const hopH = mode === 'cheer' ? 0.42 : 0.32;
    const hop = (T * Math.max(1, hopsPerLoop)) % 1;
    let y = 0, sy = 1;
    if (hopsPerLoop) {
      if (hop < 0.18) { const k = hop / 0.18; sy = 1 - 0.12 * Math.sin(k * Math.PI); }
      else if (hop < 0.68) { const k = (hop - 0.18) / 0.5; y = Math.sin(k * Math.PI) * hopH; sy = 1 + 0.07 * Math.sin(k * Math.PI); }
      else { const k = (hop - 0.68) / 0.32; sy = 1 - 0.08 * Math.sin(k * Math.PI) * (1 - k); }
    } else { sy = 1 + Math.sin(w) * 0.015; }
    // salto especial al tocar
    const sp = (t - spinAt) / 0.9; let spin = 0;
    if (sp >= 0 && sp < 1) { y += Math.sin(sp * Math.PI) * 0.55; spin = (1 - Math.pow(1 - sp, 3)) * Math.PI * 2; sy = 1 + 0.06 * Math.sin(sp * Math.PI); }
    root.position.y = y; squash.scale.set(1 + (1 - sy) * 0.9, sy, 1 + (1 - sy) * 0.9);
    shadow.scale.setScalar(Math.max(0.3, 1 - y * 0.6)); shadow.material.opacity = Math.max(0.1, .42 - y * .5);

    const lx = look.x, ly = look.y;
    if (mode === 'think') {
      pivot.rotation.z = 0.16 + Math.sin(w) * 0.04; pivot.rotation.y = -0.25 + Math.sin(w) * 0.08 + lx * 0.3; pivot.rotation.x = -0.12 + ly * 0.15;
    } else {
      pivot.rotation.z = Math.sin(w) * 0.07; pivot.rotation.y = Math.sin(w) * (look.active ? 0.08 : 0.22) + lx * 0.55; pivot.rotation.x = -0.04 + Math.sin(w * 2) * 0.03 + ly * 0.22;
    }
    pivot.rotation.y += spin;
    crownBalls.forEach((b, i) => { const lag = Math.sin(w * 2 - 0.9 - i * 0.25); b.position.copy(b.userData.base); b.position.y += (1 - sy) * -0.25 + lag * 0.025 * (1 + b.userData.base.y); b.position.x += Math.sin(w - i) * 0.012; });
    crown.rotation.z = Math.sin(w - 0.6) * 0.08;

    const wave = Math.sin(w * 4);
    if (mode === 'cheer') {
      const up = Math.sin(w * 4);
      aR.sh.rotation.z = 2.75 + up * 0.18; aR.sh.rotation.x = -0.15; aR.hand.rotation.z = Math.sin(w * 4 - 0.8) * 0.3;
      aL.sh.rotation.z = -2.75 - up * 0.18; aL.sh.rotation.x = -0.15; aL.hand.rotation.z = -Math.sin(w * 4 - 0.8) * 0.3;
    } else if (mode === 'think') {
      aR.sh.rotation.z = 0.35 + Math.sin(w) * 0.04; aR.sh.rotation.x = 0.05; aR.hand.rotation.z = 0.1;
      aL.sh.rotation.z = -0.35 - Math.sin(w) * 0.04; aL.sh.rotation.x = 0.05; aL.hand.rotation.z = -0.1;
    } else {
      aR.sh.rotation.z = 2.55 + wave * 0.32; aR.sh.rotation.x = -0.25; aR.hand.rotation.z = Math.sin(w * 4 - 0.8) * 0.35;
      aL.sh.rotation.z = -0.32 - Math.sin(w * 2) * 0.08; aL.sh.rotation.x = 0.1; aL.hand.rotation.z = Math.sin(w * 2 - 0.5) * 0.2;
    }
    lL.rotation.x = hopsPerLoop ? Math.sin(w * 2) * 0.12 : 0; lR.rotation.x = hopsPerLoop ? -Math.sin(w * 2) * 0.12 : 0;

    orbits.forEach((o, k) => { const spd = k ? -2 : 2; const a = w * spd + o.userData.ph, R = 1.5; o.userData.e.position.set(Math.cos(a) * R, Math.sin(a) * R, 0);
      o.userData.trail.forEach((tr, i) => { const b = a - spd * 0.055 * (i + 1); tr.position.set(Math.cos(b) * R, Math.sin(b) * R, 0); }); });

    const bl = (T > 0.46 && T < 0.49) || (T > 0.53 && T < 0.56) ? 0.1 : 1;
    const thinkEyes = mode === 'think';
    eyes.forEach(e => {
      e.g.scale.y = bl;
      const px = thinkEyes ? 0.05 + lx * 0.03 : (look.active ? lx * 0.06 : Math.sin(w) * 0.035);
      const py = thinkEyes ? 0.05 : (look.active ? -ly * 0.05 : Math.sin(w * 2) * 0.015);
      e.p.position.x = px; e.p.position.y = -0.02 + py;
      e.brow.position.y = 0.5 + (bl < 1 ? -0.04 : 0) + (thinkEyes ? (e.s > 0 ? 0.06 : 0) : Math.max(0, Math.sin(w * 4)) * 0.02);
    });
    const open = mode === 'cheer' ? 1.15 + Math.max(0, Math.sin(w * 4)) * 0.25 : mode === 'think' ? 0.55 : 0.9 + Math.max(0, Math.sin(w * 4)) * 0.2;
    mouth.scale.set(mode === 'think' ? 0.7 : 1, open, 1);
    cam.position.set(Math.sin(w * 0.5) * 0.3, 0.7, 8.3); cam.lookAt(0, 0.3, 0);
  }

  function resize() {
    const r = el.getBoundingClientRect(); const dpr = Math.min(2, devicePixelRatio || 1);
    const w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
  }
  const t0 = performance.now(); const clock = () => (performance.now() - t0) / 1000;
  let visible = true, last = clock(), raf = 0, shown = false;
  function frame() {
    raf = 0; if (!visible) return;
    const t = clock(), dt = Math.min(0.1, t - last); last = t;
    pose(reduce ? 0.35 : t, dt); renderer.render(scene, cam);
    if (!shown) { shown = true; canvas.style.opacity = '1'; el.classList.add('m-ready'); }
    if (!reduce || look.active) raf = requestAnimationFrame(frame);
  }
  resize(); addEventListener('resize', () => { resize(); if (!raf) raf = requestAnimationFrame(frame); });
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible && !raf) { last = clock(); raf = requestAnimationFrame(frame); } }, { rootMargin: '120px' }).observe(el);
  raf = requestAnimationFrame(frame);
  return { setT: t => { pose(t, 1); renderer.render(scene, cam); }, look, el };
}

// La fábrica de Método Atómico: Atomín + 9 atomcitos, cada uno hace un paso.
// mountFactory(THREE, root) — root contiene .fx-stage, .fx-rail y .fx-panel
const FX_STEPS = [
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></g></svg>', who: 'Tú + Atomín, el jefe', t: 'Tú eliges el tema y el estilo', d: 'Una frase basta. Atomín la recibe y reparte el trabajo entre sus atomcitos.', l: 'Tú' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="m21 21l-4.34-4.34"/><circle cx="11" cy="11" r="8"/></g></svg>', who: 'Atomcito investigador', t: 'Investiga', d: 'Busca el tema en la web y lee la fuente original. Saca lo sorprendente, las cifras y comparaciones con cosas de casa.', l: 'Investiga' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 21h8m.174-14.188a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/></svg>', who: 'Atomcito guionista', t: 'Escribe el guion', d: 'Pensado para verse: un gancho de 8 a 10 segundos y una palabra clave por frase.', l: 'Guion' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 19v3m7-12v2a7 7 0 0 1-14 0v-2"/><rect width="6" height="13" x="9" y="2" rx="3"/></g></svg>', who: 'Atomcito locutor', t: 'Pone la voz', d: 'En una sola toma, como habla una persona. Sin cortes raros.', l: 'Voz' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><path d="M14 4h7m-7 5h7m-7 6h7m-7 5h7"/></g></svg>', who: 'Atomcito planificador', t: 'Planea cada escena', d: 'Qué se ve en cada frase, en qué palabra pasa lo más fuerte y a dónde va la cámara.', l: 'Plan' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m12 15l4 4M2.352 10.648a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.029-6.029a1 1 0 1 1 3 3l-6.029 6.029a1.205 1.205 0 0 0 0 1.704l2.296 2.296a1.205 1.205 0 0 0 1.704 0l6.365-6.367A1 1 0 0 0 8.716 4.282zM5 8l4 4"/></svg>', who: 'Atomcito del gancho', t: 'Dibuja el gancho primero', d: 'Lo más espectacular, desde el primer segundo, para que nadie pase de largo.', l: 'Gancho' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></g></svg>', who: 'Atomcito dibujante', t: 'Dibuja y anima el resto', d: 'Cosas reales, con luz y volumen, moviéndose con cada palabra. Con subtítulos.', l: 'Dibuja' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m16 9l-5.5 5.5L8 12"/></g></svg>', who: 'Atomcito revisor', t: 'Revisa en movimiento', d: 'Mira el video en marcha y arregla lo que no se entiende. Es lo que más cuenta.', l: 'Revisa' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2 10v3m4-7v11m4-14v18m4-13v7m4-10v13m4-8v3"/></svg>', who: 'Atomcito sonidista', t: 'Pone el sonido', d: 'Efectos en los momentos clave.', l: 'Sonido' },
  { icon: '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73zm1 .27V12"/><path d="M3.29 7L12 12l8.71-5M7.5 4.27l9 5.15"/></g></svg>', who: 'Atomcito repartidor', t: 'Te lo entrega', d: 'El video vertical, la portada y el texto del post, listos para subir. Nada se publica solo.', l: 'Entrega' }
];

function mountFactory(THREE, root, opt = {}) {
  const snd = n => { try { opt.sound && opt.sound(n); } catch (e) {} }, hum = v => { try { opt.hum && opt.hum(v); } catch (e) {} };
  const ROLE_SND = ['boing', 'lupa', 'scribble', 'voice', 'taps', 'swoosh', 'brush', 'beep', 'drum', 'box'];
  const stage = root.querySelector('.fx-stage');
  const panel = root.querySelector('.fx-panel');
  const rail = root.querySelector('.fx-rail');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity .6s ease';
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: !!opt.capture, powerPreference: 'high-performance' }); }
  catch (e) { return null; }
  { const po = stage.querySelector('.fx-poster'); if (po) po.after(canvas); else stage.prepend(canvas); }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 2, 0.1, 120);
  const SP = 3.4, X = i => i * SP, GATE_X = 2.5 * SP;

  // ---------- luces ----------
  scene.add(new THREE.HemisphereLight('#d8ccff', '#2a1450', 0.95));
  const key = new THREE.DirectionalLight('#fff1dc', 1.9); key.position.set(4, 8, 7); scene.add(key);
  const rim = new THREE.DirectionalLight('#ff5cc0', 1.6); rim.position.set(-6, 4, -5); scene.add(rim);
  const rim2 = new THREE.DirectionalLight('#7fd8ff', 0.9); rim2.position.set(8, 3, -4); scene.add(rim2);
  const spot = new THREE.SpotLight('#fff3c4', 26, 12, 0.55, 0.6, 1.6); spot.position.set(0, 5.5, 2.5); scene.add(spot); scene.add(spot.target);

  // ---------- utilidades ----------
  const toon = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .45, metalness: 0, ...o });
  const gem = c => new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .35, metalness: .05 });
  const metal = c => new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .6 });
  const MESH = (g, m) => new THREE.Mesh(g, m);
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const rr = (x, a, b, w, h, r) => { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); };
  const FONT = "'Bricolage Grotesque', 'Inter', system-ui, sans-serif";
  const C = { body: '#7A46F0', yel: '#2FD39B', pnk: '#FF4FAE', dark: '#1A0B3A', white: '#FFFFFF' };
  const M = {
    BODY: toon(C.body), YEL: gem(C.yel), PNK: gem(C.pnk), SHOE: toon(C.yel), WHT: toon('#fff', { roughness: .2 }), DRK: toon(C.dark, { roughness: .15 }),
    CHK: toon('#FF8FD0'), TNG: toon('#FF5C8A'), FACE: toon('#ffffff', { vertexColors: true })
  };
  const blobTex = canvasTex(128, 128, (x, w, h) => { const g = x.createRadialGradient(64, 64, 4, 64, 64, 62); g.addColorStop(0, 'rgba(5,0,20,.55)'); g.addColorStop(1, 'rgba(5,0,20,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const blob = (r) => { const m = MESH(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; return m; };

  // geometría del cuerpo (compartida)
  const bodyGeos = {};
  function bodyGeoFor(ca, cb) { const key = ca + cb; if (bodyGeos[key]) return bodyGeos[key]; const bodyGeo = new THREE.SphereGeometry(1, 40, 30);
  { const p = bodyGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i); const k = 1 + (y < 0 ? 0.08 * (-y) : -0.06 * y); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k * 0.94); p.setY(i, y * 1.02); } bodyGeo.computeVertexNormals();
    const col = [], a = new THREE.Color(ca), b = new THREE.Color(cb), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const f = Math.max(0, Math.min(1, (z - 0.25) / 0.5)) * Math.exp(-Math.pow((y - 0.02) / 0.55, 4)) * Math.exp(-Math.pow(x / 0.75, 4)); c.copy(a).lerp(b, f); col.push(c.r, c.g, c.b); }
    bodyGeo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); }
  return (bodyGeos[key] = bodyGeo); }
  const G = {
    eyeW: new THREE.SphereGeometry(0.235, 24, 16), eyeP: new THREE.SphereGeometry(0.15, 20, 14), hl1: new THREE.SphereGeometry(0.05, 10, 8), hl2: new THREE.SphereGeometry(0.022, 8, 6),
    brow: new THREE.CapsuleGeometry(0.035, 0.16, 4, 8), cheek: new THREE.SphereGeometry(0.11, 14, 10), arm: new THREE.CapsuleGeometry(0.135, 0.34, 6, 10),
    palm: new THREE.SphereGeometry(0.17, 16, 12), thumb: new THREE.SphereGeometry(0.075, 10, 8), leg: new THREE.CapsuleGeometry(0.14, 0.22, 6, 10), shoe: new THREE.SphereGeometry(0.24, 18, 12)
  };
  const mShape = new THREE.Shape(); mShape.moveTo(-0.2, 0); mShape.quadraticCurveTo(0, -0.27, 0.2, 0); mShape.quadraticCurveTo(0, 0.03, -0.2, 0);
  G.mouth = new THREE.ExtrudeGeometry(mShape, { depth: 0.04, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 });

  // ---------- personaje (Atomín o atomcito) ----------
  function makeAtom(o = {}) {
    const g = new THREE.Group();
    const root = new THREE.Group(); g.add(root);
    const squash = new THREE.Group(); root.add(squash); squash.position.y = -1.5;
    const pivot = new THREE.Group(); squash.add(pivot); pivot.position.y = 1.5;
    const body = new THREE.Group(); pivot.add(body);
    const BM = o.color ? toon(o.color) : M.BODY;
    body.add(MESH(bodyGeoFor(o.color || '#7342EC', o.face || '#A988FF'), M.FACE));
    const eyes = [];
    for (const s of [-1, 1]) {
      const e = new THREE.Group();
      const w = MESH(G.eyeW, M.WHT); w.scale.set(0.92, 1.15, 0.5); e.add(w);
      const p = MESH(G.eyeP, M.DRK); p.scale.set(1, 1.15, 0.55); p.position.set(0, -0.02, 0.07); e.add(p);
      const h1 = MESH(G.hl1, M.WHT); h1.position.set(0.05, 0.07, 0.15); e.add(h1);
      const h2 = MESH(G.hl2, M.WHT); h2.position.set(-0.04, -0.07, 0.15); e.add(h2);
      e.position.set(0.31 * s, 0.18, 0.9); e.rotation.y = 0.28 * s; body.add(e);
      const brow = MESH(G.brow, M.DRK); brow.rotation.z = Math.PI / 2 - 0.22 * s; brow.position.set(0.31 * s, 0.5, 0.86); brow.rotation.y = 0.28 * s; body.add(brow);
      const ck = MESH(G.cheek, M.CHK); ck.scale.set(1.25, 0.7, 0.35); ck.position.set(0.58 * s, -0.12, 0.78); ck.rotation.y = 0.6 * s; body.add(ck);
      eyes.push({ g: e, p, brow, s });
    }
    const mouth = new THREE.Group(); mouth.add(MESH(G.mouth, M.DRK));
    const tg = MESH(new THREE.SphereGeometry(0.075, 12, 8), M.TNG); tg.scale.set(1.3, 0.6, 0.5); tg.position.set(0.02, -0.13, 0.035); mouth.add(tg);
    mouth.position.set(0, -0.14, 0.97); mouth.rotation.x = -0.12; body.add(mouth);
    const crown = new THREE.Group(); crown.position.set(0, 0.95, 0.05); body.add(crown);
    const cr = o.crown === 'full'
      ? [[0, 0.18, 0, 0.3, 'Y'], [-0.3, 0.05, 0.1, 0.24, 'Y'], [0.3, 0.06, 0.08, 0.25, 'P'], [-0.12, 0.08, 0.3, 0.2, 'P'], [0.14, 0.1, 0.28, 0.21, 'Y'], [0.0, 0.42, -0.05, 0.21, 'Y'], [-0.24, 0.3, -0.12, 0.19, 'P'], [0.26, 0.3, -0.1, 0.2, 'Y'], [0.06, 0.62, 0.02, 0.15, 'P']]
      : o.crown === 'none' ? [] : [[0, 0.1, 0, 0.24, 'Y'], [-0.2, 0.0, 0.08, 0.18, 'P'], [0.2, 0.02, 0.06, 0.18, 'P']];
    const crownBalls = cr.map(([x, y, z, r, m]) => { const b = MESH(new THREE.IcosahedronGeometry(r, 1), m === 'Y' ? M.YEL : M.PNK); b.position.set(x, y, z); b.userData.base = b.position.clone(); crown.add(b); return b; });
    function arm(s) {
      const sh = new THREE.Group(); sh.position.set(0.98 * s, -0.12, 0.08);
      const up = MESH(G.arm, BM); up.position.y = -0.26; sh.add(up);
      const hand = new THREE.Group(); hand.position.y = -0.54; sh.add(hand);
      const palm = MESH(G.palm, M.SHOE); palm.scale.set(1, 1.05, 0.85); hand.add(palm);
      const th = MESH(G.thumb, M.SHOE); th.position.set(-0.13 * s, 0.05, 0.04); hand.add(th);
      body.add(sh); return { sh, hand };
    }
    const aL = arm(-1), aR = arm(1);
    function leg(s) {
      const lg = new THREE.Group(); lg.position.set(0.36 * s, -0.92 + 1.5, 0.02);
      const l = MESH(G.leg, BM); l.position.y = -0.2; lg.add(l);
      const shoe = MESH(G.shoe, M.SHOE); shoe.scale.set(1, 0.62, 1.35); shoe.position.set(0.02 * s, -0.43, 0.1); lg.add(shoe);
      squash.add(lg); return lg;
    }
    const lL = leg(-1), lR = leg(1);
    const top = new THREE.Group(); top.position.set(0, 0.86, 0.02); body.add(top);
    return { g, root, squash, pivot, body, eyes, mouth, crown, crownBalls, aL, aR, lL, lR, top };
  }

  // ---------- sombreros y herramientas ----------
  const HAT = {
    explorer() { const g = new THREE.Group(); const m = toon('#D9B26A'); const brim = MESH(new THREE.CylinderGeometry(0.78, 0.78, 0.05, 32), m); g.add(brim); const dome = MESH(new THREE.SphereGeometry(0.52, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.75; g.add(dome); const band = MESH(new THREE.CylinderGeometry(0.53, 0.53, 0.1, 24), toon('#5A3A1A')); band.position.y = 0.06; g.add(band); g.position.y = 0.05; return g; },
    visor(c) { const g = new THREE.Group(); const m = toon(c); const dome = MESH(new THREE.SphereGeometry(0.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.7; g.add(dome); const v = MESH(new THREE.CylinderGeometry(0.42, 0.42, 0.05, 24, 1, false, -Math.PI / 2, Math.PI), m); v.position.set(0, 0.0, 0.42); v.scale.set(1, 1, 0.9); g.add(v); const btn = MESH(new THREE.SphereGeometry(0.07, 10, 8), m); btn.position.y = 0.42; g.add(btn); return g; },
    hard() { const g = new THREE.Group(); const m = toon('#2FD39B', { roughness: .3 }); const dome = MESH(new THREE.SphereGeometry(0.62, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), m); dome.scale.y = 0.85; g.add(dome); const brim = MESH(new THREE.CylinderGeometry(0.74, 0.74, 0.05, 32), m); g.add(brim); const ridge = MESH(new THREE.BoxGeometry(0.12, 0.1, 1.0), m); ridge.position.y = 0.45; g.add(ridge); return g; },
    bucket() { const g = new THREE.Group(); const m = toon('#4F7BFF'); const top = MESH(new THREE.CylinderGeometry(0.42, 0.55, 0.42, 24), m); top.position.y = 0.2; g.add(top); const brim = MESH(new THREE.CylinderGeometry(0.58, 0.82, 0.16, 32, 1, true), toon('#4F7BFF', { side: THREE.DoubleSide })); brim.position.y = -0.02; g.add(brim); return g; },
    beret() { const g = new THREE.Group(); const m = toon('#7A46F0'); const b = MESH(new THREE.SphereGeometry(0.66, 24, 14), m); b.scale.set(1, 0.32, 1); b.position.set(0.12, 0.12, 0); b.rotation.z = -0.2; g.add(b); const st = MESH(new THREE.CylinderGeometry(0.03, 0.05, 0.14, 8), m); st.position.set(0.16, 0.34, 0); g.add(st); return g; },
    capBack(c) { const g = HAT.visor(c); g.rotation.y = Math.PI; return g; },
    headphones() { const g = new THREE.Group(); const m = toon('#2B1A5E'); const band = MESH(new THREE.TorusGeometry(0.98, 0.06, 8, 32, Math.PI), m); band.position.y = -0.68; g.add(band); for (const s of [-1, 1]) { const cup = MESH(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 20), toon('#2FD39B')); cup.rotation.z = Math.PI / 2; cup.position.set(0.98 * s, -0.7, 0); g.add(cup); } return g; },
    glasses() { const g = new THREE.Group(); const m = toon('#1A0B3A'); for (const s of [-1, 1]) { const r = MESH(new THREE.TorusGeometry(0.25, 0.03, 8, 24), m); r.position.set(0.31 * s, -0.68, 0.98); r.rotation.y = 0.28 * s; g.add(r); } const br = MESH(new THREE.CylinderGeometry(0.02, 0.02, 0.14, 6), m); br.rotation.z = Math.PI / 2; br.position.set(0, -0.66, 1.05); g.add(br); return g; }
  };
  const TOOL = {
    lupa() { const g = new THREE.Group(); const h = MESH(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 10), toon('#5A3A1A')); h.position.y = -0.2; g.add(h); const ring = MESH(new THREE.TorusGeometry(0.24, 0.045, 10, 28), metal('#2FD39B')); ring.position.y = -0.62; g.add(ring); const gl = MESH(new THREE.CircleGeometry(0.22, 24), new THREE.MeshStandardMaterial({ color: '#BFF3FF', transparent: true, opacity: .45, roughness: .05, side: THREE.DoubleSide })); gl.position.y = -0.62; g.add(gl); g.userData.face = [ring, gl]; return g; },
    lapiz() { const g = new THREE.Group(); const b = MESH(new THREE.CylinderGeometry(0.07, 0.07, 0.7, 6), toon('#2FD39B')); b.position.y = -0.3; g.add(b); const tip = MESH(new THREE.ConeGeometry(0.07, 0.18, 6), toon('#F2C9A0')); tip.position.y = -0.74; tip.rotation.x = Math.PI; g.add(tip); const lead = MESH(new THREE.ConeGeometry(0.025, 0.06, 6), M.DRK); lead.position.y = -0.84; lead.rotation.x = Math.PI; g.add(lead); const er = MESH(new THREE.CylinderGeometry(0.072, 0.072, 0.1, 10), toon('#FF8FD0')); er.position.y = 0.08; g.add(er); return g; },
    hoja() { const g = new THREE.Group(); const t = canvasTex(128, 160, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.fillStyle = '#B9AEE0'; for (let i = 0; i < 8; i++) x.fillRect(14, 22 + i * 16, i === 0 ? 70 : 96 - (i % 3) * 14, 6); x.fillStyle = '#FF4FAE'; x.fillRect(14, 22, 40, 6); }); const p = MESH(new THREE.PlaneGeometry(0.5, 0.62), new THREE.MeshStandardMaterial({ map: t, side: THREE.DoubleSide, roughness: .8 })); p.position.y = -0.3; g.add(p); return g; },
    mic() { const g = new THREE.Group(); const h = MESH(new THREE.CylinderGeometry(0.06, 0.045, 0.36, 12), toon('#2B1A5E')); h.position.y = -0.16; g.add(h); const head = MESH(new THREE.SphereGeometry(0.13, 16, 12), metal('#C9C2E8')); head.position.y = -0.42; g.add(head); return g; },
    clip() { const g = new THREE.Group(); const b = MESH(new THREE.BoxGeometry(0.48, 0.62, 0.04), toon('#9A6A3A')); b.position.y = -0.3; g.add(b); const t = canvasTex(128, 160, (x, w, h) => { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7A46F0'; x.lineWidth = 5; for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) { x.strokeRect(12 + c * 56, 14 + r * 46, 48, 36); } x.fillStyle = '#2FD39B'; x.fillRect(68, 60, 48, 36); }); const p = MESH(new THREE.PlaneGeometry(0.4, 0.5), new THREE.MeshStandardMaterial({ map: t, roughness: .8 })); p.position.set(0, -0.32, 0.025); g.add(p); const c = MESH(new THREE.BoxGeometry(0.18, 0.07, 0.07), metal('#C9C2E8')); c.position.set(0, -0.02, 0.03); g.add(c); return g; },
    gancho() { const g = new THREE.Group(); const m = metal('#2FD39B'); const sh = MESH(new THREE.CylinderGeometry(0.045, 0.045, 0.7, 10), m); sh.position.y = -0.35; g.add(sh); const hk = MESH(new THREE.TorusGeometry(0.2, 0.05, 10, 24, Math.PI * 1.25), m); hk.position.set(0.2, -0.72, 0); hk.rotation.z = Math.PI; g.add(hk); const tip = MESH(new THREE.ConeGeometry(0.07, 0.14, 8), m); tip.position.set(0.37, -0.62, 0); g.add(tip); return g; },
    pincel() { const g = new THREE.Group(); const h = MESH(new THREE.CylinderGeometry(0.05, 0.035, 0.6, 10), toon('#C98B4F')); h.position.y = -0.25; g.add(h); const f = MESH(new THREE.CylinderGeometry(0.06, 0.05, 0.12, 10), metal('#C9C2E8')); f.position.y = -0.58; g.add(f); const tip = MESH(new THREE.ConeGeometry(0.07, 0.22, 10), toon('#FF4FAE')); tip.position.y = -0.74; tip.rotation.x = Math.PI; g.add(tip); return g; },
    paleta() { const g = new THREE.Group(); const p = MESH(new THREE.CylinderGeometry(0.34, 0.34, 0.04, 24), toon('#F2D3A8')); p.rotation.x = Math.PI / 2; p.position.y = -0.25; g.add(p); ['#2FD39B', '#FF4FAE', '#3FD0C9', '#7A46F0', '#39D98A'].forEach((c, i) => { const d = MESH(new THREE.SphereGeometry(0.06, 10, 8), toon(c)); const a = i / 5 * Math.PI * 1.6 + 0.3; d.position.set(Math.cos(a) * 0.2, -0.25 + Math.sin(a) * 0.2, 0.04); d.scale.z = 0.5; g.add(d); }); return g; },
    tablet() { const g = new THREE.Group(); const b = MESH(new THREE.BoxGeometry(0.62, 0.44, 0.04), M.DRK); b.position.y = -0.25; g.add(b); const t = canvasTex(160, 112, (x, w, h) => { const gr = x.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#7A46F0'); gr.addColorStop(1, '#FF4FAE'); x.fillStyle = gr; x.fillRect(0, 0, w, h); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(66, 34); x.lineTo(98, 56); x.lineTo(66, 78); x.fill(); x.fillStyle = '#2FD39B'; x.fillRect(12, 96, 90, 6); }); const s = MESH(new THREE.PlaneGeometry(0.56, 0.38), new THREE.MeshBasicMaterial({ map: t })); s.position.set(0, -0.25, 0.022); g.add(s); return g; },
    baqueta() { const g = new THREE.Group(); const s = MESH(new THREE.CylinderGeometry(0.03, 0.025, 0.6, 8), toon('#F2D3A8')); s.position.y = -0.28; g.add(s); const b = MESH(new THREE.SphereGeometry(0.05, 8, 6), toon('#F2D3A8')); b.position.y = -0.58; g.add(b); return g; },
    caja() { const g = new THREE.Group(); const b = MESH(new THREE.BoxGeometry(0.62, 0.48, 0.5), toon('#C98B4F')); g.add(b); const tape = MESH(new THREE.BoxGeometry(0.64, 0.08, 0.52), toon('#2FD39B')); g.add(tape); const tape2 = MESH(new THREE.BoxGeometry(0.1, 0.5, 0.52), toon('#2FD39B')); g.add(tape2); return g; }
  };

  // ---------- escenario ----------
  const world = new THREE.Group(); scene.add(world);
  const LEN = X(9) + 5;
  const floor = MESH(new THREE.PlaneGeometry(LEN + 30, 30), toon('#160C38', { roughness: .95 })); floor.rotation.x = -Math.PI / 2; floor.position.set(X(9) / 2, 0, 0); world.add(floor);
  const grid = new THREE.GridHelper(LEN + 30, Math.round((LEN + 30) / 1.7), '#2E1D66', '#21134D'); grid.position.set(X(9) / 2, 0.005, 0); grid.material.transparent = true; grid.material.opacity = .55; world.add(grid);
  const wallTex = canvasTex(32, 256, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0D0724'); g.addColorStop(.6, '#1C1048'); g.addColorStop(1, '#24145A'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  const wall = MESH(new THREE.PlaneGeometry(LEN + 30, 10), new THREE.MeshBasicMaterial({ map: wallTex })); wall.position.set(X(9) / 2, 5, -3.4); world.add(wall);
  // letrero de neón
  const signTex = canvasTex(1024, 160, (x, w, h) => { x.font = `800 88px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#FF4FAE'; x.shadowBlur = 28; x.fillStyle = '#FFD7F0'; x.fillText('LA FÁBRICA ATÓMICA', w / 2, h / 2 + 4); x.shadowBlur = 0; x.fillStyle = '#FFFFFF'; x.globalAlpha = .9; x.fillText('LA FÁBRICA ATÓMICA', w / 2, h / 2 + 4); });
  const sign = MESH(new THREE.PlaneGeometry(9, 1.4), new THREE.MeshBasicMaterial({ map: signTex, transparent: true })); sign.position.set(X(4.5), 5.4, -3.3); world.add(sign);
  // engranajes en la pared
  const gears = [];
  const gearGeo = (() => { const s = new THREE.Shape(); const n = 10, R = 0.7, r = 0.56; for (let i = 0; i < n * 2; i++) { const a0 = i / (n * 2) * Math.PI * 2, a1 = (i + 1) / (n * 2) * Math.PI * 2, rad = i % 2 ? r : R; if (i === 0) s.moveTo(Math.cos(a0) * rad, Math.sin(a0) * rad); s.lineTo(Math.cos(a0) * rad, Math.sin(a0) * rad); s.lineTo(Math.cos(a1) * rad, Math.sin(a1) * rad); } const hole = new THREE.Path(); hole.absarc(0, 0, 0.2, 0, Math.PI * 2, true); s.holes.push(hole); return new THREE.ExtrudeGeometry(s, { depth: 0.12, bevelEnabled: false }); })();
  [[1.7, 3.4, 1, '#3A2580'], [2.5, 2.9, .6, '#4B2FA0'], [X(5) + 1.7, 3.5, 1.1, '#3A2580'], [X(5) + 2.6, 2.95, .55, '#4B2FA0'], [X(8) + 1.7, 3.4, .9, '#3A2580'], [X(3) + 1.7, 3.6, .7, '#3A2580']].forEach(([x, y, s, c], i) => { const m = MESH(gearGeo, toon(c, { roughness: .6, metalness: .3 })); m.position.set(x, y, -3.3); m.scale.setScalar(s); m.userData.sp = (i % 2 ? -1 : 1) * 0.5 / s; world.add(m); gears.push(m); });
  // tubos
  const pipeM = metal('#3B2A78');
  { const p = MESH(new THREE.CylinderGeometry(0.12, 0.12, LEN + 6, 12), pipeM); p.rotation.z = Math.PI / 2; p.position.set(X(4.5), 4.55, -3.1); world.add(p); }

  // cinta transportadora
  const beltTex = canvasTex(64, 64, (x, w, h) => { x.fillStyle = '#2B1D55'; x.fillRect(0, 0, w, h); x.fillStyle = '#3A2875'; x.fillRect(0, 0, 10, h); x.fillStyle = '#2FD39B'; x.globalAlpha = .25; x.fillRect(0, 0, 3, h); });
  beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(LEN / 0.45, 1);
  const BELT_Y = 0.8, BELT_W = 1.5;
  const beltTop = MESH(new THREE.BoxGeometry(LEN, 0.08, BELT_W), [toon('#2B1D55'), toon('#2B1D55'), new THREE.MeshStandardMaterial({ map: beltTex, roughness: .7 }), toon('#2B1D55'), toon('#2B1D55'), toon('#2B1D55')]);
  beltTop.position.set(X(9) / 2, BELT_Y - 0.04, 0); world.add(beltTop);
  const beltSide = MESH(new THREE.BoxGeometry(LEN, 0.5, BELT_W + 0.16), toon('#4A2FA0', { roughness: .5 })); beltSide.position.set(X(9) / 2, BELT_Y - 0.33, 0); world.add(beltSide);
  const stripeTex = canvasTex(128, 32, (x, w, h) => { x.fillStyle = '#2FD39B'; x.fillRect(0, 0, w, h); x.fillStyle = '#120A2A'; for (let i = -1; i < 5; i++) { x.beginPath(); x.moveTo(i * 32, h); x.lineTo(i * 32 + 16, 0); x.lineTo(i * 32 + 32, 0); x.lineTo(i * 32 + 16, h); x.fill(); } });
  stripeTex.wrapS = THREE.RepeatWrapping; stripeTex.repeat.set(LEN / 1.2, 1);
  const stripe = MESH(new THREE.PlaneGeometry(LEN, 0.1), new THREE.MeshBasicMaterial({ map: stripeTex })); stripe.position.set(X(9) / 2, BELT_Y - 0.14, BELT_W / 2 + 0.081); world.add(stripe);
  for (let i = 0; i < 14; i++) { const leg = MESH(new THREE.BoxGeometry(0.14, BELT_Y - 0.55, 0.14), toon('#2B1D55')); leg.position.set(-1.8 + i * (LEN / 13), (BELT_Y - 0.55) / 2, 0.5); world.add(leg); const leg2 = leg.clone(); leg2.position.z = -0.5; world.add(leg2); }

  // embudo de entrada (aquí cae tu tema)
  const funnel = new THREE.Group(); funnel.position.set(X(0) + 1.6, 2.8, 0.3); world.add(funnel);
  { const f = MESH(new THREE.CylinderGeometry(0.75, 0.2, 0.9, 28, 1, true), new THREE.MeshStandardMaterial({ color: '#8B6CFF', roughness: .3, metalness: .4, side: THREE.DoubleSide })); funnel.add(f);
    const ring = MESH(new THREE.TorusGeometry(0.75, 0.06, 10, 32), metal('#2FD39B')); ring.rotation.x = Math.PI / 2; ring.position.y = 0.45; funnel.add(ring);
    const tube = MESH(new THREE.CylinderGeometry(0.2, 0.2, 0.5, 16), pipeM); tube.position.y = -0.6; funnel.add(tube);
    const p = MESH(new THREE.CylinderGeometry(0.1, 0.1, 2, 10), pipeM); p.position.y = 1.4; funnel.add(p); }

  // letreros por estación + lámparas + trabajadores
  const plates = [], lamps = [], workers = [];
  function plateTex(i, on) {
    const s = FX_STEPS[i];
    return canvasTex(512, 150, (x, w, h) => { rr(x, 6, 6, w - 12, h - 12, 28); x.fillStyle = on ? '#2FD39B' : '#1D1240'; x.fill(); x.lineWidth = 5; x.strokeStyle = on ? '#2FD39B' : '#5E4D94'; x.stroke();
      x.fillStyle = on ? '#120A2A' : '#9C8FD0'; x.font = `500 34px 'JetBrains Mono', monospace`; x.textBaseline = 'middle'; x.fillText(i === 0 ? 'TÚ' : String(i).padStart(2, '0'), 34, h / 2 + 2);
      x.fillStyle = on ? '#120A2A' : '#F7F4FF'; x.font = `800 58px ${FONT}`; x.fillText(i === 0 ? 'TU TEMA' : s.l.toUpperCase(), 124, h / 2 + 4); });
  }
  const lampGeo = new THREE.ConeGeometry(0.42, 0.42, 20, 1, true), bulbGeo = new THREE.SphereGeometry(0.16, 14, 10);
  for (let i = 0; i <= 9; i++) {
    const pl = MESH(new THREE.PlaneGeometry(2.2, 0.64), new THREE.MeshBasicMaterial({ map: plateTex(i, false), transparent: true }));
    pl.position.set(X(i), 3.3, -2.6); pl.userData = { off: pl.material.map, on: null, i }; world.add(pl); plates.push(pl);
    const lamp = new THREE.Group(); lamp.position.set(X(i), 4.3, -1.0); world.add(lamp);
    const sh = MESH(lampGeo, new THREE.MeshStandardMaterial({ color: '#2B1D55', side: THREE.DoubleSide, roughness: .4, metalness: .5 })); lamp.add(sh);
    const bulb = MESH(bulbGeo, new THREE.MeshBasicMaterial({ color: '#8a7cc0' })); bulb.position.y = -0.2; lamp.add(bulb);
    const wire = MESH(new THREE.CylinderGeometry(0.015, 0.015, 1.4, 6), toon('#1A0B3A')); wire.position.y = 0.9; lamp.add(wire);
    lamps.push(bulb);
  }
  // Atomín, el jefe (estación 0)
  const jefe = makeAtom({ crown: 'full' }); jefe.g.scale.setScalar(0.7); jefe.g.position.set(X(0) - 0.05, 0.42 + 1.55 * 0.7, -1.3); world.add(jefe.g);
  { const pod = MESH(new THREE.CylinderGeometry(0.8, 0.9, 0.42, 28), toon('#4A2FA0')); pod.position.set(X(0), 0.21, -1.3); world.add(pod); const b = blob(0.9); b.position.set(X(0), 0.43, -1.25); world.add(b); }
  workers.push({ a: jefe, role: 0, x: X(0) });
  const ROLES = [null,
    { c: '#1E9C93', f: '#79E3D8', hat: () => HAT.explorer(), r: 'lupa' }, { c: '#3A62F0', f: '#97B4FF', hat: () => HAT.visor('#2FD39B'), r: 'lapiz', l: 'hoja' }, { c: '#D9408F', f: '#FFA3D2', hat: () => HAT.headphones(), r: 'mic', crown: 'mini' },
    { c: '#EB7A1C', f: '#FFC27D', hat: () => HAT.hard(), l: 'clip' }, { c: '#2A9A55', f: '#86E0A8', hat: () => HAT.bucket(), r: 'gancho' }, { c: '#E0434A', f: '#FFA0A3', hat: () => HAT.beret(), r: 'pincel', l: 'paleta' },
    { c: '#178FC4', f: '#8ED9F7', hat: () => HAT.glasses(), l: 'tablet', crown: 'mini' }, { c: '#6FA826', f: '#C3EC86', hat: () => HAT.capBack('#7A46F0'), r: 'baqueta', l: 'baqueta' }, { c: '#B8692A', f: '#F5BC85', hat: () => HAT.visor('#FF4F6B'), box: true }];
  for (let i = 1; i <= 9; i++) {
    const R = ROLES[i];
    const a = makeAtom({ crown: R.crown || 'none', color: R.c, face: R.f });
    a.top.add(R.hat());
    if (!R.crown) { const pom = MESH(new THREE.IcosahedronGeometry(0.16, 1), i % 2 ? M.PNK : M.YEL); pom.position.y = i === 4 ? 0.62 : i === 6 ? 0.42 : i === 8 || i === 2 || i === 9 ? 0.46 : 0.5; a.top.add(pom); }
    if (R.r) { const t = TOOL[R.r](); a.aR.hand.add(t); a.toolR = t; }
    if (R.l) { const t = TOOL[R.l](); a.aL.hand.add(t); a.toolL = t; }
    if (R.box) { const b = TOOL.caja(); b.position.set(0, -0.15, 1.15); a.body.add(b); a.box = b; }
    a.g.scale.setScalar(0.64); a.g.position.set(X(i), 0.42 + 1.55 * 0.64, -1.45);
    const pod = MESH(new THREE.CylinderGeometry(0.72, 0.82, 0.42, 24), toon('#4A2FA0')); pod.position.set(X(i), 0.21, -1.45); world.add(pod);
    const b = blob(0.8); b.position.set(X(i), 0.43, -1.4); world.add(b);
    world.add(a.g); workers.push({ a, role: i, x: X(i) });
  }
  // tambor para el sonidista
  { const d = MESH(new THREE.CylinderGeometry(0.3, 0.3, 0.3, 20), toon('#FF4FAE')); d.position.set(X(8), BELT_Y + 0.15, -0.45); world.add(d); const top = MESH(new THREE.CylinderGeometry(0.31, 0.31, 0.03, 20), toon('#F7F4FF')); top.position.set(X(8), BELT_Y + 0.31, -0.45); world.add(top); }

  // puerta de control "TÚ APRUEBAS"
  const gate = new THREE.Group(); gate.position.set(GATE_X, 0, 0); world.add(gate);
  const gateM = toon('#4A2FA0', { roughness: .4 });
  for (const z of [-0.85, 0.85]) { const p = MESH(new THREE.BoxGeometry(0.18, 2.3, 0.18), gateM); p.position.set(0, 1.15, z); gate.add(p); }
  { const beam = MESH(new THREE.BoxGeometry(0.22, 0.22, 1.9), gateM); beam.position.set(0, 2.3, 0); gate.add(beam); }
  const gsTex = canvasTex(512, 160, (x, w, h) => { rr(x, 6, 6, w - 12, h - 12, 26); x.fillStyle = '#2FD39B'; x.fill(); x.fillStyle = '#120A2A'; x.font = `800 64px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('TÚ APRUEBAS', w / 2, h / 2 + 4); });
  const gSign = MESH(new THREE.PlaneGeometry(1.9, 0.6), new THREE.MeshBasicMaterial({ map: gsTex, transparent: true })); gSign.position.set(0, 2.62, 0.1); gSign.scale.setScalar(0.85); gate.add(gSign);
  const lightBox = MESH(new THREE.BoxGeometry(0.3, 0.62, 0.22), toon('#1A0B3A')); lightBox.position.set(0, 1.9, 1.0); gate.add(lightBox);
  const redL = MESH(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: '#552' })); redL.position.set(0, 2.05, 1.12); gate.add(redL);
  const grnL = MESH(new THREE.SphereGeometry(0.1, 12, 10), new THREE.MeshBasicMaterial({ color: '#253' })); grnL.position.set(0, 1.77, 1.12); gate.add(grnL);
  const barPivot = new THREE.Group(); barPivot.position.set(0, 1.25, 0.85); gate.add(barPivot);
  const barTex = canvasTex(256, 32, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#2FD39B' : '#FF4F6B'; x.fillRect(i * 32, 0, 32, h); } });
  const bar = MESH(new THREE.BoxGeometry(0.1, 0.1, 1.7), new THREE.MeshStandardMaterial({ map: barTex })); bar.position.z = -0.85; barPivot.add(bar);

  // ---------- el núcleo (tu tema) que viaja por la cinta ----------
  const pkg = new THREE.Group(); world.add(pkg);
  const PK = {};
  PK.core = MESH(new THREE.IcosahedronGeometry(0.3, 1), new THREE.MeshStandardMaterial({ color: '#2FD39B', emissive: '#FF9F00', emissiveIntensity: 0.45, flatShading: true, roughness: .3 }));
  pkg.add(PK.core);
  PK.rings = [0, 1].map(k => { const r = MESH(new THREE.TorusGeometry(0.48, 0.016, 6, 48), new THREE.MeshBasicMaterial({ color: '#FFB4E4' })); r.rotation.x = 1.2; r.rotation.y = k ? 0.9 : -0.9; pkg.add(r); return r; });
  PK.datos = [0, 1, 2].map(k => { const c = MESH(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshStandardMaterial({ color: '#7FF7FF', emissive: '#36E0FF', emissiveIntensity: 1.2 })); pkg.add(c); return c; });
  PK.hoja = TOOL.hoja().children[0]; PK.hoja.position.set(0, 0.05, -0.32); PK.hoja.scale.setScalar(1.1); pkg.add(PK.hoja);
  PK.onda = MESH(new THREE.TorusGeometry(0.4, 0.025, 6, 40), new THREE.MeshBasicMaterial({ color: '#FF4FAE', transparent: true })); pkg.add(PK.onda);
  PK.frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.9, 0.9)), new THREE.LineBasicMaterial({ color: '#FF4FAE' })); pkg.add(PK.frame);
  PK.star = MESH(new THREE.OctahedronGeometry(0.22), new THREE.MeshBasicMaterial({ color: '#FFFFFF' })); PK.star.position.set(0.32, 0.38, 0.2); pkg.add(PK.star);
  const STYLE = {
    atom: { a: '#3A1F8A', b: '#120A2A', acc: '#2FD39B', name: 'Atómico' },
    cine: { a: '#0F2340', b: '#02060E', acc: '#3FD0C9', name: 'Cine Nocturno' },
    datos: { a: '#06281A', b: '#000804', acc: '#39FF88', name: 'Datos Neón' }
  };
  function cardTex(st, title) {
    const S = STYLE[st] || STYLE.atom;
    return canvasTex(256, 456, (x, w, h) => {
      const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, S.a); g.addColorStop(1, S.b); x.fillStyle = g; x.fillRect(0, 0, w, h);
      if (st === 'datos') { x.strokeStyle = S.acc; x.globalAlpha = .18; for (let i = 0; i < w; i += 24) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let i = 0; i < h; i += 24) { x.beginPath(); x.moveTo(0, i); x.lineTo(w, i); x.stroke(); } x.globalAlpha = 1; }
      // objeto low-poly
      x.fillStyle = S.acc; x.globalAlpha = .95; x.beginPath(); x.moveTo(128, 120); x.lineTo(196, 230); x.lineTo(128, 300); x.lineTo(60, 230); x.closePath(); x.fill();
      x.globalAlpha = .55; x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(128, 120); x.lineTo(196, 230); x.lineTo(128, 210); x.closePath(); x.fill(); x.globalAlpha = 1;
      x.font = `800 30px ${FONT}`; x.textAlign = 'center'; x.fillStyle = '#fff';
      const words = (title || 'tu tema').toUpperCase().split(' ').slice(0, 4); x.fillText(words.slice(0, 2).join(' '), 128, 352); x.fillStyle = S.acc; x.fillText(words.slice(2).join(' ') || '¡VIRAL!', 128, 388);
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(24, 420, 208, 6); x.fillStyle = S.acc; x.fillRect(24, 420, 120, 6);
    });
  }
  PK.card = MESH(new THREE.BoxGeometry(0.62, 1.1, 0.05), [toon('#1A0B3A'), toon('#1A0B3A'), toon('#1A0B3A'), toon('#1A0B3A'), new THREE.MeshBasicMaterial({ map: cardTex('atom') }), toon('#1A0B3A')]);
  PK.card.position.y = 0.32; pkg.add(PK.card);
  const checkTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#39D98A'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 16; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(36, 66); x.lineTo(56, 86); x.lineTo(92, 44); x.stroke(); });
  PK.check = new THREE.Sprite(new THREE.SpriteMaterial({ map: checkTex })); PK.check.scale.setScalar(0.34); PK.check.position.set(0.34, 0.86, 0.1); pkg.add(PK.check);
  const noteTex = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#2FD39B'; x.font = `800 110px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('♪', 64, 70); });
  PK.notes = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: noteTex, transparent: true })); s.scale.setScalar(0.3); pkg.add(s); return s; });
  const playTex = canvasTex(128, 128, (x) => { x.fillStyle = 'rgba(255,255,255,.95)'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.fillStyle = '#120A2A'; x.beginPath(); x.moveTo(50, 36); x.lineTo(94, 64); x.lineTo(50, 92); x.fill(); });
  PK.play = new THREE.Sprite(new THREE.SpriteMaterial({ map: playTex })); PK.play.scale.setScalar(0.32); PK.play.position.set(0, 0.32, 0.12); pkg.add(PK.play);
  const pkgBlob = blob(0.55); world.add(pkgBlob);
  // anillos de voz que salen del locutor
  const voiceRings = [0, 1, 2].map(() => { const r = MESH(new THREE.TorusGeometry(0.3, 0.02, 6, 32), new THREE.MeshBasicMaterial({ color: '#FF8FD0', transparent: true, opacity: 0 })); world.add(r); return r; });
  // confeti
  const CONF = 70, confGeo = new THREE.PlaneGeometry(0.08, 0.14), confMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, vertexColors: false });
  const confetti = new THREE.InstancedMesh(confGeo, confMat, CONF); confetti.visible = false; world.add(confetti);
  const confData = []; { const cols = ['#2FD39B', '#FF4FAE', '#7FF7FF', '#39D98A', '#FFFFFF', '#8B6CFF'].map(c => new THREE.Color(c)); for (let i = 0; i < CONF; i++) { confetti.setColorAt(i, cols[i % cols.length]); confData.push({ p: new THREE.Vector3(), v: new THREE.Vector3(), r: new THREE.Euler(), w: new THREE.Vector3() }); } }
  const dummy = new THREE.Object3D();
  function burst(at) { confetti.visible = true; confData.forEach(d => { d.p.copy(at); d.v.set((Math.random() - .5) * 4, 3 + Math.random() * 3, (Math.random() - .3) * 3); d.r.set(Math.random() * 6, Math.random() * 6, 0); d.w.set(Math.random() * 8, Math.random() * 8, 0); }); confAge = 0; }
  let confAge = 99;

  // ---------- estado ----------
  const S = { mode: 'idle', seg: 0, phase: 'work', t: 0, stage: -1, x: X(0), topic: '¿De dónde sale la sal del mar?', style: 'atom', approved: false, paused: false, speed: 1, gateWait: 0, interacted: false, insp: -1 };
  const MOVE = 1.15, WORK = 2.5;
  const camT = { x: 0, lx: 0, y: 3, d: 10, l: 2 }; const camC = { x: 0, lx: 0, y: 3, d: 10, l: 2 };
  function overview() { const a = cam.aspect; return a > 1.2 ? { x: -2.5, lx: X(1.6), d: 9.6, y: 3.9, l: 1.4 } : { x: -0.6, lx: X(0.6), d: 9.8, y: 3.8, l: 1.5 }; }
  function closeD() { const a = cam.aspect; return a > 1.6 ? 9.6 : a > 1.1 ? 8.8 : 8.4; }

  function setStage(n) {
    S.stage = n;
    PK.core.visible = n < 6; PK.rings.forEach(r => r.visible = n < 6);
    PK.datos.forEach(d => d.visible = n >= 1 && n < 6);
    PK.hoja.visible = n >= 2 && n < 6; PK.onda.visible = n >= 3 && n < 6; PK.frame.visible = n >= 4 && n < 6; PK.star.visible = n >= 5 && n < 6;
    PK.card.visible = n >= 6; PK.check.visible = n >= 7; PK.notes.forEach(s => s.visible = n >= 8); PK.play.visible = n >= 9;
  }
  const pop = { t: 9 };
  function advanceStage(n) { if (n > S.stage) { setStage(n); pop.t = 0; } }

  // ---------- interfaz ----------
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const slug = s => { const stop = new Set(['de', 'la', 'el', 'los', 'las', 'por', 'que', 'qué', 'se', 'un', 'una', 'del', 'en', 'y', 'a', 'es', 'sale', 'donde', 'dónde', 'cómo', 'como', 'porque']); const w = s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]/g, ' ').split(/\s+/).filter(x => x && !stop.has(x)); return (w.slice(0, 3).join('-') || 'mi-video') + '.mp4'; };
  const tag = stage.querySelector('.fx-tag'), gateEl = stage.querySelector('.fx-gate'), btnPause = stage.querySelector('[data-fx="pause"]'), btnRestart = stage.querySelector('[data-fx="restart"]');
  rail.innerHTML = FX_STEPS.map((s, i) => `<button type="button" data-fx-i="${i}" aria-label="${i ? 'Paso ' + i + ': ' : ''}${esc(s.t)}">${i === 0 || i === 2 ? '<em class="tu">TÚ</em>' : ''}<span class="e" aria-hidden="true">${s.icon}</span><span class="l">${esc(s.l)}</span></button>`).join('');
  const railBtns = [...rail.querySelectorAll('button')];
  const TOPICS = ['¿De dónde sale la sal del mar?', '¿Por qué se afloja una tuerca?', '¿Por qué bostezar se contagia?'];
  function renderIntake() {
    panel.innerHTML = `<div class="fx-who">Paso 0 · Tú + Atomín, el jefe</div>
<h3>1. Tú eliges el tema</h3>
<div class="fx-chips" role="group" aria-label="Tema">${TOPICS.map(t => `<button type="button" class="fx-chip${t === S.topic ? ' on' : ''}" data-topic="${esc(t)}">${esc(t)}</button>`).join('')}</div>
<label class="fx-own"><span>…o escribe el tuyo:</span><input type="text" maxlength="60" placeholder="Ej: ¿Por qué el cielo es azul?" value="${TOPICS.includes(S.topic) ? '' : esc(S.topic)}"></label>
<h3>2. Tú eliges el estilo</h3>
<div class="fx-chips" role="group" aria-label="Estilo">${Object.entries(STYLE).map(([k, v]) => `<button type="button" class="fx-chip${k === S.style ? ' on' : ''}" data-style="${k}">${v.name}</button>`).join('')}</div>
<button type="button" class="fx-go" data-fx="start"><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z"/></svg> Encender la fábrica</button>`;
  }
  function renderStep(i, extra = '') {
    const s = FX_STEPS[i];
    panel.innerHTML = `<div class="fx-who">${i ? 'Paso ' + String(i).padStart(2, '0') + ' · ' : ''}${esc(s.who)}</div><h3>${esc(s.t)}</h3><p>${esc(s.d)}</p>${extra}`;
  }
  const PRESET = { '¿De dónde sale la sal del mar?': 'openSal', '¿Por qué se afloja una tuerca?': 'openTuerca', '¿Por qué bostezar se contagia?': 'openBostezo' };
  function videoFor() {
    const p = PRESET[S.topic];
    if (p && S.style === 'atom') return { a: p, l: 'Ver el video', n: 'Es el video real que hizo Método Atómico con este tema.' };
    const a = S.style === 'cine' ? 'openEstiloCine' : S.style === 'datos' ? 'openEstiloDatos' : 'openEstiloAtom';
    return { a, l: 'Ver un video de ejemplo', n: (p ? 'Este tema lo hicimos en estilo Atómico. ' : 'Tu tema todavía no está hecho, ') + 'así se ve un video real en estilo ' + STYLE[S.style].name + ' hecho con Método Atómico.' };
  }
  function renderDone() {
    if (!PRESET[S.topic]) {
      
      panel.innerHTML = `<div class="fx-who">Atomín tiene un mensaje para ti</div><h3>Tu video todavía no existe… ¡pero tú lo puedes fabricar! <svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 16h.01M16 16h.01M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2zm5-3h.01"/></svg></h3>
<div class="fx-files"><span><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4M2 6h4m-4 4h4m-4 4h4m-4 4h4"/><path d="M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z"/></g></svg> Tu tema: ${esc(S.topic)}</span><span><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M12 22a1 1 0 0 1 0-20a10 9 0 0 1 10 9a5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z"/><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/></g></svg> Estilo: ${esc(STYLE[S.style].name)}</span></div>
<p>Con <strong style="color:#2FD39B">Método Atómico</strong>, Atomín y sus 9 atomcitos trabajan para ti en tu compu: tú pones el tema y ellos hacen el guion, los dibujos, la voz y los subtítulos. Tú solo lo subes.</p>
<div class="fx-actions"><button type="button" class="fx-play" data-action="openAtomin"><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg> Escuchar a Atomín</button><a href="#precio" class="fx-go" data-checkout="elite">Quiero Método Atómico</a><button type="button" class="fx-ghost" data-fx="again">Probar otro tema</button></div><p class="fx-mini">Pago único · Garantía: pruébalo 7 días · Incluye los 3 estilos</p>`;
      return;
    }
    const v = videoFor();
    panel.innerHTML = `<div class="fx-who">Listo · Atomín y sus atomcitos terminaron</div><h3>Tu video salió de la fábrica <svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M5.8 11.3L2 22l10.7-3.79M4 3h.01M22 8h.01M15 2h.01M22 20h.01M22 2l-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10m8 3l-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17M11 2l.33.82c.34.86-.2 1.82-1.11 1.98c-.7.1-1.22.72-1.22 1.43V7"/><path d="M11 13c1.93 1.93 2.83 4.17 2 5s-3.07-.07-5-2s-2.83-4.17-2-5s3.07.07 5 2"/></g></svg></h3>
<div class="fx-files"><span><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5m-4.967 5.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z"/></g></svg> ${esc(slug(S.topic))} · 1080×1920</span><span><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></g></svg> portada.jpg</span><span><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/><path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8"/></g></svg> texto-del-post.txt</span></div>
<p>Nada se publica solo: tú lo revisas y lo subes. Estilo: ${esc(STYLE[S.style].name)}.</p>
<div class="fx-actions"><button type="button" class="fx-play" data-action="${v.a}"><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg> ${v.l}</button><a href="#precio" class="fx-go" data-action="goPrecio">Quiero mi fábrica</a><button type="button" class="fx-ghost" data-fx="again">Fabricar otro video</button></div><p class="fx-mini">${v.n}</p>`;
  }
  function setRail(i) { railBtns.forEach((b, k) => { b.classList.toggle('on', k === i); b.classList.toggle('ok', S.mode !== 'idle' && k < i); b.setAttribute('aria-current', k === i ? 'step' : 'false'); }); }
  function highlight(i) {
    plates.forEach((p, k) => { const on = k === i; if (on && !p.userData.on) p.userData.on = plateTex(k, true); p.material.map = on ? p.userData.on : p.userData.off; p.material.needsUpdate = true; });
    lamps.forEach((b, k) => b.material.color.set(k === i ? '#FFF1A8' : '#8a7cc0'));
    S.hl = i;
  }
  renderIntake(); setRail(0); highlight(0);

  function enterWork() { S.mid = false; snd('ding'); setTimeout(() => snd(ROLE_SND[S.seg]), 180); }
  function start() {
    S.interacted = true; S.mode = 'run'; S.seg = 0; S.phase = 'drop'; S.t = 0; S.approved = false; S.paused = false; S.insp = -1;
    PK.card.material[4].map = cardTex(S.style, S.topic); PK.card.material[4].needsUpdate = true;
    setStage(0); S.x = X(0); renderStep(0, `<p class="fx-mini">Tema: <b>${esc(S.topic)}</b> · Estilo: <b>${esc(STYLE[S.style].name)}</b></p>`); setRail(0); highlight(0);
    snd('drop'); hum(false);
    gateEl.classList.remove('on'); confetti.visible = false; btnPause.hidden = false; btnPause.innerHTML = '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="5" height="18" x="14" y="3" rx="1"/><rect width="5" height="18" x="5" y="3" rx="1"/></g></svg>'; btnPause.setAttribute('aria-label', 'Pausar');
  }
  function seek(i) {
    S.interacted = true;
    if (S.mode === 'idle') { start(); }
    S.mode = 'run'; S.paused = false; gateEl.classList.remove('on');
    if (i >= 3) S.approved = true;
    hum(false); enterWork();
    S.seg = i; S.phase = 'work'; S.t = 0; S.x = X(i); setStage(Math.max(0, i - 1)); renderStep(i); setRail(i); highlight(i); confetti.visible = false;
  }
  function openGate(approve) {
    S.approved = true; gateEl.classList.remove('on');
    S.gateMsg = approve ? '' : 'Listo, lo cambio.';
    snd('approve'); hum(true);
    S.seg = 3; S.phase = 'move'; S.t = 0; S.from = GATE_X; S.mode = 'run';
    renderStep(3); setRail(3); highlight(3);
  }
  root.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !root.contains(b)) return;
    if (b.dataset.topic) { S.topic = b.dataset.topic; S.interacted = true; root.querySelectorAll('[data-topic]').forEach(x => x.classList.toggle('on', x === b)); const inp = root.querySelector('.fx-own input'); if (inp) inp.value = ''; return; }
    if (b.dataset.style) { S.style = b.dataset.style; S.interacted = true; root.querySelectorAll('[data-style]').forEach(x => x.classList.toggle('on', x === b)); return; }
    if (b.dataset.fxI) return seek(+b.dataset.fxI);
    const a = b.dataset.fx;
    if (a === 'start') return start();
    if (a === 'again') { S.mode = 'idle'; S.stage = -1; setStage(0); S.x = X(0); renderIntake(); setRail(0); highlight(0); confetti.visible = false; btnPause.hidden = true; return; }
    if (a === 'approve') return openGate(true);
    if (a === 'change') { gateEl.querySelector('.fx-gate-msg').textContent = 'Se lo dices como en un chat… Listo, lo corrigió.'; setTimeout(() => openGate(false), 1300); return; }
    if (a === 'pause') { S.paused = !S.paused; if (S.paused) hum(false); else if (S.phase === 'move' || S.phase === 'toGate') hum(true); b.innerHTML = S.paused ? '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>' : '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><rect width="5" height="18" x="14" y="3" rx="1"/><rect width="5" height="18" x="5" y="3" rx="1"/></g></svg>'; b.setAttribute('aria-label', S.paused ? 'Continuar' : 'Pausar'); return; }
    if (a === 'restart') { start(); return; }
  });
  root.addEventListener('input', e => { if (e.target.matches('.fx-own input')) { const v = e.target.value.trim(); S.interacted = true; if (v) { S.topic = v; root.querySelectorAll('[data-topic]').forEach(x => x.classList.remove('on')); } } });
  root.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.matches('.fx-own input')) { e.preventDefault(); start(); } });

  // clic en un trabajador del 3D
  const ray = new THREE.Raycaster(), mouse = new THREE.Vector2();
  canvas.addEventListener('click', e => {
    const r = canvas.getBoundingClientRect(); mouse.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1); ray.setFromCamera(mouse, cam);
    let best = null; for (const w of workers) { const h = ray.intersectObject(w.a.g, true)[0]; if (h && (!best || h.distance < best.d)) best = { d: h.distance, i: w.role }; }
    if (S.mode === 'done' && ray.intersectObject(pkg, true)[0]) { const pb = panel.querySelector('.fx-play'); if (pb) pb.click(); return; }
    if (best) { seek(best.i); }
  });
  canvas.style.cursor = 'pointer';

  // ---------- animación de cada trabajador ----------
  const v3 = new THREE.Vector3();
  function animWorker(w, t, active, k, i) {
    const a = w.a, ph = i * 1.7;
    // reposo
    let y = 0, sy = 1 + Math.sin(t * 2.2 + ph) * 0.02;
    a.pivot.rotation.set(-0.02, 0, Math.sin(t * 1.1 + ph) * 0.04);
    const look = Math.max(-1, Math.min(1, (S.x - w.x) / 5));
    a.pivot.rotation.y = look * 0.35;
    const bl = ((t + ph) % 4.2) < 0.13 ? 0.1 : 1;
    a.eyes.forEach(e => { e.g.scale.y = bl; e.p.position.x = look * 0.06; e.p.position.y = -0.04; });
    a.mouth.scale.set(1, 0.85, 1);
    // pose base con herramienta
    const R = a.aR.sh.rotation, L = a.aL.sh.rotation;
    R.set(0, 0, 0.25); L.set(0, 0, -0.25); a.aR.hand.rotation.set(0, 0, 0); a.aL.hand.rotation.set(0, 0, 0);
    if (a.toolR) { R.x = -0.8; R.z = 0.2; }
    if (a.toolL) { L.x = -0.8; L.z = -0.2; }
    if (a.box) { R.set(-1.15, 0, -0.35); L.set(-1.15, 0, 0.35); }
    if (w.role === 0) { R.z = 2.55 + Math.sin(t * 6) * 0.3 * (active ? 1 : 0.4); R.x = -0.2; }
    if (active) {
      y = Math.abs(Math.sin(t * 6)) * 0.12; a.mouth.scale.set(1, 1.15, 1);
      switch (w.role) {
        case 0: R.z = 2.6 + Math.sin(t * 8) * 0.35; L.z = -2.6 - Math.sin(t * 8) * 0.35; L.x = -0.2; break;
        case 1: R.x = -1.2 + Math.sin(t * 3) * 0.2; R.z = 0.1 + Math.sin(t * 2.2) * 0.45; a.pivot.rotation.x = 0.12; a.eyes.forEach(e => { e.p.position.x = Math.sin(t * 2.2) * 0.07; }); break;
        case 2: R.x = -1.0 + Math.sin(t * 22) * 0.08; R.z = 0.15 + Math.sin(t * 13) * 0.14; L.x = -1.0; a.pivot.rotation.x = 0.1; break;
        case 3: R.x = -1.55; R.z = -0.55; a.mouth.scale.set(1, 0.5 + Math.abs(Math.sin(t * 13)) * 0.9, 1); break;
        case 4: L.x = -1.15; R.x = -1.0 + Math.sin(t * 9) * 0.12; R.z = -0.1; a.pivot.rotation.x = Math.sin(t * 6) * 0.1; break;
        case 5: R.z = 2.3 + Math.sin(t * 5) * 0.7; R.x = -0.3; y += 0.05; break;
        case 6: R.x = -1.0 + Math.cos(t * 4.5) * 0.35; R.z = 0.3 + Math.sin(t * 4.5) * 0.5; L.x = -0.9; break;
        case 7: L.x = -1.45; L.z = -0.05; a.pivot.rotation.x = 0.12; if (k > 0.6) { R.z = 2.3; R.x = -0.1; a.mouth.scale.set(1.1, 1.3, 1); } break;
        case 8: R.x = -1.0 + Math.sin(t * 16) * 0.35; L.x = -1.0 - Math.sin(t * 16) * 0.35; a.pivot.rotation.z = Math.sin(t * 8) * 0.08; break;
        case 9: { const up = k > 0.45 ? Math.min(1, (k - 0.45) * 4) : 0; R.x = L.x = -1.15 - up * 1.4; if (a.box) { a.box.position.y = -0.15 + up * 1.35; a.box.position.z = 1.15 - up * 0.5; } y += up * 0.08; } break;
      }
    } else if (a.box) { a.box.position.set(0, -0.15, 1.15); }
    a.root.position.y = y; a.squash.scale.set(1 + (1 - sy) * 0.9, sy, 1 + (1 - sy) * 0.9);
    a.crownBalls.forEach((b, j) => { b.position.copy(b.userData.base); b.position.y += Math.sin(t * 4 - j * 0.4 + ph) * 0.02; });
  }

  // ---------- bucle ----------
  function resize() {
    const r = stage.getBoundingClientRect(); const dpr = Math.min(1.75, devicePixelRatio || 1);
    renderer.setPixelRatio(dpr); renderer.setSize(Math.max(1, r.width | 0), Math.max(1, r.height | 0), false);
    cam.aspect = r.width / Math.max(1, r.height); cam.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);
  { const o = overview(); Object.assign(camC, o); Object.assign(camT, o); }
  setStage(0); pkg.position.set(X(0), BELT_Y + 0.35, 0);
  let tt = 0, last = performance.now(), visible = true, raf = 0, shown = false, seenAt = 0;
  const ease = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  function step(dt) {
    tt += dt;
    if (S.mode === 'run' && !S.paused) {
      S.t += dt * S.speed;
      if (S.phase === 'drop') {
        const k = Math.min(1, S.t / 1.1); pkg.position.y = 2.4 - (2.4 - (BELT_Y + 0.35)) * (k * k); S.x = X(0) + 1.6 * (1 - k);
        if (k >= 1) { S.phase = 'work'; S.t = 0; enterWork(); }
      } else if (S.phase === 'work') {
        const k = Math.min(1, S.t / WORK);
        if (k > 0.55) advanceStage(S.seg);
        if (k > 0.5 && !S.mid) { S.mid = true; snd(ROLE_SND[S.seg]); }
        if (k >= 1) {
          if (S.seg === 9) { snd('fanfare'); S.mode = 'done'; burst(new THREE.Vector3(S.x, 2, 0.3)); renderDone(); setRail(10); highlight(9); btnPause.hidden = true; }
          else if (S.seg === 2 && !S.approved) { S.phase = 'toGate'; S.t = 0; S.from = S.x; hum(true); }
          else { hum(true); S.phase = 'move'; S.from = S.x; S.seg++; S.t = 0; renderStep(S.seg); setRail(S.seg); highlight(S.seg); }
        }
      } else if (S.phase === 'toGate') {
        const k = Math.min(1, S.t / 0.8); S.x = S.from + (GATE_X - 0.45 - S.from) * ease(k);
        if (k >= 1) { hum(false); snd('alarm'); S.mode = 'gate'; S.gateWait = 0; gateEl.classList.add('on'); gateEl.querySelector('.fx-gate-msg').textContent = 'Atomín te enseña el guion antes de seguir. ¿Lo apruebas?'; renderStep(2, '<p class="fx-mini"><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M22 14a8 8 0 0 1-8 8m4-11v-1a2 2 0 0 0-2-2a2 2 0 0 0-2 2m0 0V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1m0-.5V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v10"/><path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></g></svg> Aquí la fábrica se detiene y espera tu OK.</p>'); }
      } else if (S.phase === 'move') {
        const k = Math.min(1, S.t / MOVE); S.x = S.from + (X(S.seg) - S.from) * ease(k);
        if (k >= 1) { S.phase = 'work'; S.t = 0; hum(false); enterWork(); }
      }
    }
    if (S.mode === 'gate' && !S.paused) { S.gateWait += dt; if (S.gateWait > 7 && !S.interacted) openGate(true); }
    // núcleo
    if (S.phase !== 'drop' || S.mode !== 'run') pkg.position.y = BELT_Y + 0.35 + Math.sin(tt * 3) * 0.04 + (S.mode === 'done' ? Math.min(1, confAge) * 0.5 : 0);
    pkg.position.x = S.x; pkg.position.z = 0.3;
    pkgBlob.position.set(S.x, BELT_Y + 0.005, 0.3);
    PK.core.rotation.y += dt * 1.2; PK.core.rotation.x += dt * 0.6;
    PK.rings[0].rotation.z += dt * 2; PK.rings[1].rotation.z -= dt * 2.4;
    PK.datos.forEach((d, j) => { const a = tt * 2.2 + j * 2.1; d.position.set(Math.cos(a) * 0.55, Math.sin(a * 1.3) * 0.15 + 0.1, Math.sin(a) * 0.55); d.rotation.set(tt, tt * 1.3, 0); });
    { const s = 1 + ((tt * 0.8) % 1) * 0.9; PK.onda.scale.setScalar(s); PK.onda.material.opacity = 1 - ((tt * 0.8) % 1); PK.onda.rotation.y = Math.PI / 2 * 0; }
    PK.frame.rotation.y = tt * 0.5; PK.star.rotation.y = tt * 3; PK.star.scale.setScalar(0.8 + Math.sin(tt * 8) * 0.3);
    PK.card.rotation.y = S.mode === 'done' ? tt * 1.6 : Math.sin(tt * 1.2) * 0.35;
    PK.notes.forEach((s, j) => { const a = tt * 1.8 + j * 2.1; s.position.set(Math.cos(a) * 0.62, 0.45 + Math.sin(tt * 3 + j) * 0.2, Math.sin(a) * 0.62); });
    if (pop.t < 1) { pop.t += dt * 3; const s = 1 + Math.sin(Math.min(1, pop.t) * Math.PI) * 0.35; pkg.scale.setScalar(s); } else pkg.scale.setScalar(1);
    // voz
    const wActive = S.mode === 'run' && S.phase === 'work' ? S.seg : S.mode === 'gate' ? 2 : S.mode === 'done' ? 9 : -1;
    voiceRings.forEach((r, j) => { const on = wActive === 3; const k = ((tt * 0.9) + j / 3) % 1; r.position.set(X(3) - 0.05, 1.55 - 0.05, -0.7 + k * 0.9); r.scale.setScalar(0.5 + k * 1.6); r.material.opacity = on ? (1 - k) * 0.8 : 0; });
    // puerta
    const open = S.approved ? 1 : 0; barPivot.rotation.x += ((open ? -1.45 : 0) - barPivot.rotation.x) * Math.min(1, dt * 5);
    redL.material.color.set(!S.approved && S.mode !== 'idle' ? '#FF4F6B' : '#552222'); grnL.material.color.set(S.approved ? '#39D98A' : '#1F3A2A');
    // trabajadores
    const kWork = S.phase === 'work' ? Math.min(1, S.t / WORK) : 0;
    workers.forEach(w => animWorker(w, tt, w.role === wActive || (S.mode === 'idle' && w.role === 0), kWork, w.role));
    gears.forEach(g => g.rotation.z += dt * g.userData.sp * (S.mode === 'run' && !S.paused ? 2.2 : 0.6));
    if (S.mode === 'run' && !S.paused && S.phase === 'move') { beltTex.offset.x -= dt * 2.2; stripeTex.offset.x -= dt * 1.1; }
    // confeti
    if (confetti.visible) { confAge += dt; confData.forEach((d, i) => { d.v.y -= 9 * dt; d.p.addScaledVector(d.v, dt); if (d.p.y < 0.05) { d.p.y = 0.05; d.v.set(0, 0, 0); } d.r.x += d.w.x * dt; d.r.y += d.w.y * dt; dummy.position.copy(d.p); dummy.rotation.copy(d.r); dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix); }); confetti.instanceMatrix.needsUpdate = true; }
    // cámara
    if (S.mode === 'idle') Object.assign(camT, overview());
    else { camT.x = S.x + (cam.aspect > 1.2 ? 0.5 : 0); camT.lx = camT.x; camT.d = closeD(); camT.y = cam.aspect > 1.2 ? 2.9 : 3.0; camT.l = 1.62; }
    const f = (reduce || window.FX_SNAP) ? 1 : Math.min(1, dt * 2.6);
    camC.x += (camT.x - camC.x) * f; camC.d += (camT.d - camC.d) * f; camC.y += (camT.y - camC.y) * f; camC.l += (camT.l - camC.l) * f; camC.lx += (camT.lx - camC.lx) * f;
    const sway = S.mode === 'idle' ? Math.sin(tt * 0.3) * 0.6 : 0;
    cam.position.set(camC.x + sway, camC.y, camC.d); cam.lookAt(camC.lx, camC.l, -0.6);
    spot.position.set(X(Math.max(0, S.hl)), 5.5, 2.4); spot.target.position.set(X(Math.max(0, S.hl)), 0.8, -1.2);
    // etiqueta del tema
    if (tag) {
      const show = S.mode !== 'idle' && S.stage < 6;
      if (show) { v3.set(S.x, BELT_Y - 0.3, BELT_W / 2 + 0.1).project(cam); const r = stage.getBoundingClientRect(); tag.style.left = ((v3.x + 1) / 2 * r.width) + 'px'; tag.style.top = ((1 - v3.y) / 2 * r.height) + 'px'; tag.innerHTML = '<svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9c-4.54-4.52-9.87-6.54-11.9-4.5c-2.04 2.03-.02 7.36 4.5 11.9c4.54 4.52 9.87 6.54 11.9 4.5"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9c-2.03-2.04-7.36-.02-11.9 4.5c-4.52 4.54-6.54 9.87-4.5 11.9c2.03 2.04 7.36.02 11.9-4.5"/></g></svg> ' + esc(S.topic); }
      tag.classList.toggle('on', show);
    }
  }
  let promoMode = false;
  function frame(now) {
    raf = 0; if (!visible || promoMode) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    step(dt); renderer.render(scene, cam);
    if (!shown) { shown = true; canvas.style.opacity = '1'; root.classList.add('fx-ready'); }
    raf = requestAnimationFrame(frame);
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(es => {
    visible = es[0].isIntersecting; if (!visible) hum(false);
    if (visible) { seenAt = performance.now(); setTimeout(() => { if (visible && S.mode === 'idle' && !S.interacted && performance.now() - seenAt > 3900) start(); }, 4000); if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  }, { threshold: 0.35 }).observe(stage);
  // ---------- modo video promocional (Atomín y los atomcitos le hablan al visitante) ----------
  function promoSetup() {
    promoMode = true; visible = false; if (raf) cancelAnimationFrame(raf); raf = 0;
    const keep = new Set([floor, grid, wall, sign, ...gears]);
    world.children.forEach(o => { if (!keep.has(o)) o.visible = false; });
    const XC = X(4.5);
    // Atomín al frente
    jefe.g.visible = true; jefe.g.scale.setScalar(0.72); jefe.g.position.set(XC, 1.55 * 0.72, 2.2);
    const jb = blob(1.0); jb.position.set(XC, 0.01, 2.3); world.add(jb);
    // atomcitos en dos filas detrás
    const spots = [[-1.75, -0.4, 0.46], [-0.6, -0.6, 0.46], [0.6, -0.6, 0.46], [1.75, -0.4, 0.46], [-2.1, -2.3, 0.43], [-1.05, -2.5, 0.43], [0, -2.6, 0.43], [1.05, -2.5, 0.43], [2.1, -2.3, 0.43]];
    workers.slice(1).forEach((w, i) => { const [dx, z, sc] = spots[i]; w.a.g.visible = true; w.a.g.scale.setScalar(sc); const h = z < -2 ? 1.25 : 0.45; w.a.g.position.set(XC + dx, 1.55 * sc + h, z); w.px = XC + dx; const b = blob(0.55); b.position.set(XC + dx, h + 0.01, z + 0.05); world.add(b); });
    sign.position.set(XC, 5.35, -3.3); sign.scale.setScalar(0.5);
    [[0.45, 1.45, 4.6], [1.25, 2.6, 6.2]].forEach(([hh, z0, wdt]) => { const st = MESH(new THREE.BoxGeometry(wdt, hh, 1.2), toon('#3A2580', { roughness: .6 })); st.position.set(XC, hh / 2, -z0 + 0.1); world.add(st); const edge = MESH(new THREE.BoxGeometry(wdt, 0.06, 0.06), new THREE.MeshBasicMaterial({ color: '#2FD39B' })); edge.position.set(XC, hh, -z0 + 0.7); world.add(edge); });
    spot.position.set(XC, 6, 5); spot.target.position.set(XC, 1.5, 1.2); spot.angle = 0.6; spot.intensity = 30;
    cam.fov = 40; cam.updateProjectionMatrix();
    confetti.visible = false;
    return XC;
  }
  function promoFrame(t, amp, cheer, XC) {
    const dt = 1 / 30; tt = t;
    // Atomín habla
    const a = jefe; a.root.position.y = Math.abs(Math.sin(t * 5)) * 0.06 * (0.4 + amp) + (cheer ? Math.abs(Math.sin(t * 7)) * 0.25 : 0);
    a.pivot.rotation.set(-0.04 + amp * 0.06, Math.sin(t * 0.9) * 0.15, Math.sin(t * 1.3) * 0.06);
    a.mouth.scale.set(1 + amp * 0.15, 0.35 + amp * 1.5, 1);
    const bl = (t % 3.3) < 0.12 ? 0.1 : 1; a.eyes.forEach(e => { e.g.scale.y = bl; e.p.position.set(Math.sin(t * 0.7) * 0.02, -0.02, 0.07); e.brow.position.y = 0.5 + amp * 0.05; });
    const R = a.aR.sh.rotation, L = a.aL.sh.rotation;
    if (cheer) { R.set(-0.2, 0, 2.7 + Math.sin(t * 9) * 0.3); L.set(-0.2, 0, -2.7 - Math.sin(t * 9) * 0.3); }
    else if (t < 1.6) { R.set(-0.2, 0, 2.55 + Math.sin(t * 12) * 0.35); L.set(0.1, 0, -0.3); }
    else { R.set(-0.5 - amp * 0.4, 0, 0.5 + Math.sin(t * 2.2) * 0.25 * (0.5 + amp)); L.set(-0.4 - amp * 0.3, 0, -0.45 - Math.sin(t * 1.7) * 0.2 * (0.5 + amp)); }
    a.crownBalls.forEach((b, j) => { b.position.copy(b.userData.base); b.position.y += Math.sin(t * 6 - j * 0.5) * 0.02 * (1 + amp * 2); });
    // atomcitos: miran a cámara, saludan al inicio, celebran al final
    workers.slice(1).forEach((w, i) => {
      animWorker(w, t, cheer || (t > 6.3 && t < 9.4 && (i % 3 === Math.floor(t * 1.5) % 3)), (t % 2.5) / 2.5, w.role);
      w.a.pivot.rotation.y = (XC - w.px) * 0.05 + Math.sin(t + i) * 0.08;
      w.a.eyes.forEach(e => { e.p.position.x = (XC - w.px) * 0.01; });
      if (t < 1.8 && i % 2 === 0) { w.a.aR.sh.rotation.set(-0.2, 0, 2.5 + Math.sin(t * 11 + i) * 0.35); }
      if (cheer) { w.a.aR.sh.rotation.set(-0.2, 0, 2.6 + Math.sin(t * 9 + i) * 0.3); w.a.aL.sh.rotation.set(-0.2, 0, -2.6 - Math.sin(t * 9 + i) * 0.3); w.a.root.position.y = Math.abs(Math.sin(t * 7 + i)) * 0.18; }
    });
    gears.forEach(g => g.rotation.z = t * g.userData.sp * 1.5);
    if (cheer && !confetti.visible) burst(new THREE.Vector3(XC, 3.4, 1));
    if (confetti.visible) { confAge += dt; confData.forEach((d, i) => { d.v.y -= 6 * dt; d.p.addScaledVector(d.v, dt); d.r.x += d.w.x * dt; d.r.y += d.w.y * dt; dummy.position.copy(d.p); dummy.rotation.copy(d.r); dummy.updateMatrix(); confetti.setMatrixAt(i, dummy.matrix); }); confetti.instanceMatrix.needsUpdate = true; }
    const push = Math.min(1, t / 14) * 0.9;
    cam.position.set(XC + Math.sin(t * 0.35) * 0.25, 3.2 - push * 0.25, 9.4 - push * 1.1); cam.lookAt(XC, 2.15, 0);
    renderer.render(scene, cam);
  }
  raf = requestAnimationFrame(frame);
  return {
    S, seek, start, openGate, setStage, promoSetup, promoFrame,
    internals: () => ({ scene, cam, renderer, world, jefe, workers, gears, sign, blob, MESH, toon, cardTex, confetti, confData, dummy, animWorker, spot, X, G, M, burst }),
    // para capturas
    renderAt(fn) { fn && fn(S); for (let i = 0; i < 90; i++) step(1 / 30); renderer.render(scene, cam); }
  };
}

const MSG=['¡Hola, soy <b>Atomín</b>! <svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2m0 4V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2m0 4.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></g></svg><br>Dame un tema y <b>yo hago el video.</b>','Soy <b>Atomín</b>: guion, dibujos, voz y subtítulos, <b>todo yo.</b>','Tú solo <b>lo subes.</b> <svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594zM20 2v4m2-2h-4"/><circle cx="4" cy="20" r="2"/></g></svg>','¡Ey, eso da cosquillas! <b><svg class="ic" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><circle cx="12" cy="12" r="1"/><path d="M20.2 20.2c2.04-2.03.02-7.36-4.5-11.9c-4.54-4.52-9.87-6.54-11.9-4.5c-2.04 2.03-.02 7.36 4.5 11.9c4.54 4.52 9.87 6.54 11.9 4.5"/><path d="M15.7 15.7c4.52-4.54 6.54-9.87 4.5-11.9c-2.03-2.04-7.36-.02-11.9 4.5c-4.52 4.54-6.54 9.87-4.5 11.9c2.03 2.04 7.36.02 11.9-4.5"/></g></svg></b>'];
let mi=0;
window.SFX=SFX; const FXR=document.getElementById('fabrica'); if(FXR){try{window.FX=mountFactory(THREE,FXR,{capture:!!window.FX_CAPTURE,sound:n=>SFX.play(n),hum:v=>SFX.hum(v)});}catch(e){console.error(e)}}
document.querySelectorAll('[data-mascot]').forEach(el=>{
  const b=el.querySelector('.m-bubble');
  try{mountMascot(THREE,el,{mode:el.dataset.mascot,onTap:()=>{SFX.play('boing');if(!b)return;mi=(mi+1)%MSG.length;b.innerHTML=MSG[mi];b.style.animation='none';b.offsetWidth;b.style.animation='';b.classList.remove('pop');void b.offsetWidth;b.classList.add('pop');}});}catch(e){}
});
