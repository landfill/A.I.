'use strict';
/* audio.js — Web Audio로 합성하는 배경음악(Music)과 효과음(Sfx)
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   소리: 배경음악과 효과음 (Web Audio로 합성)
   ========================================================= */
const MODES = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10], lydian:[0,2,4,6,7,9,11], mixolydian:[0,2,4,5,7,9,10] };
const dm = (m, d) => { const sc = MODES[m.mode], o = Math.floor(d / 7); return m.root + sc[((d % 7) + 7) % 7] + 12 * o; };
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const Aud = {
  ctx:null, on:true, duckOn:false,
  init(){
    if(this.ctx){ if(this.ctx.state !== 'running') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
    const c = this.ctx = new AC();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -20; comp.knee.value = 18; comp.ratio.value = 3.5; comp.attack.value = .01; comp.release.value = .35;
    this.master = c.createGain(); this.master.gain.value = .85; this.master.connect(comp); comp.connect(c.destination);
    this.rev = c.createConvolver(); this.rev.buffer = this.impulse(4.2, 2.4); const rv = c.createGain(); rv.gain.value = .8; this.rev.connect(rv); rv.connect(this.master);
    this.mus = c.createGain(); this.mus.gain.value = 0; this.mus.connect(this.master); const ms = c.createGain(); ms.gain.value = .65; this.mus.connect(ms); ms.connect(this.rev);
    this.fx = c.createGain(); this.fx.gain.value = .7; this.fx.connect(this.master); const fs = c.createGain(); fs.gain.value = .35; this.fx.connect(fs); fs.connect(this.rev);
    const n = c.sampleRate * 2, b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0); for(let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; this.noise = b;
    if(c.state !== 'running') c.resume();
    this.level();
  },
  impulse(sec, decay){ const c = this.ctx, n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
    for(let ch = 0; ch < 2; ch++){ const d = b.getChannelData(ch); for(let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); } return b; },
  level(){ if(!this.ctx) return; const v = this.on ? (this.duckOn ? .26 : .5) : 0; this.mus.gain.setTargetAtTime(v, this.ctx.currentTime, .7); },
  duck(b){ this.duckOn = b; this.level(); },
  setOn(b){ this.on = b; this.level(); }
};
const Music = {
  mood:null, nextBar:0, nextNote:0, barIdx:0, md:9, deg:0, timer:null,
  start(m){ if(!Aud.ctx) return; this.mood = m; const t = Aud.ctx.currentTime + .1; this.nextBar = t; this.nextNote = t + 1.6;
    if(!this.timer) this.timer = setInterval(() => this.tick(), 120); },
  setMood(m){ if(!Aud.ctx) return; if(!this.mood){ this.start(m); return; } this.mood = m; this.barIdx = 0; this.nextBar = Math.min(this.nextBar, Aud.ctx.currentTime + .4); },
  tick(){ const c = Aud.ctx; if(!c || !this.mood) return; const now = c.currentTime;
    if(this.nextBar < now - 2) this.nextBar = now + .1; if(this.nextNote < now - 2) this.nextNote = now + .2;
    while(this.nextBar < now + 1.2){ this.bar(this.nextBar); this.nextBar += this.mood.bar; }
    while(this.nextNote < now + 1.2){ this.note(this.nextNote); this.nextNote += this.mood.beat * (Math.random() < .22 ? 2 : 1); } },
  bar(t){ const m = this.mood, deg = m.prog[this.barIdx++ % m.prog.length]; this.deg = deg; const dur = m.bar + 3.6;
    [deg, deg + 2, deg + 4, deg + 6].forEach((d, i) => this.pad(t + i * .05, dm(m, d) + 12, dur, .03 - i * .004, m.bright));
    this.bass(t, dm(m, deg) - 12, dur); },
  pad(t, midi, dur, vol, cut){ const c = Aud.ctx, f = mtof(midi), g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = cut; lp.Q.value = .5;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 2.4); g.gain.setValueAtTime(vol, t + dur - 3.2); g.gain.linearRampToValueAtTime(0, t + dur);
    [[-7,'sawtooth',1],[7,'sawtooth',1],[0,'triangle',.5]].forEach(([dt, ty, mul]) => { const o = c.createOscillator(); o.type = ty; o.frequency.value = f * mul; o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + dur + .05); });
    lp.connect(g); g.connect(Aud.mus); },
  bass(t, midi, dur){ const c = Aud.ctx, g = c.createGain(), o = c.createOscillator(); o.type = 'sine'; o.frequency.value = mtof(midi);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.07, t + 1.6); g.gain.setValueAtTime(.07, t + dur - 3); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(Aud.mus); o.start(t); o.stop(t + dur + .05); },
  note(t){ const m = this.mood; if(Math.random() < m.rest) return;
    const chord = [this.deg, this.deg + 2, this.deg + 4].map(d => ((d % 7) + 7) % 7);
    for(let k = 0; k < 4; k++){ this.md += [-2,-1,-1,1,1,2,0,3,-3][Math.floor(Math.random() * 9)]; this.md = Math.max(7, Math.min(16, this.md));
      if(chord.includes(((this.md % 7) + 7) % 7) || Math.random() < .3) break; }
    this.box(t, dm(m, this.md) + 12, .07);
    if(Math.random() < .12) this.box(t + m.beat * .5, dm(m, this.md + 2) + 12, .04); },
  box(t, midi, vol){ const c = Aud.ctx, f = mtof(midi), g = c.createGain(), o = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(), out = c.createGain();
    o.type = 'sine'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 4.01;
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .006); g.gain.exponentialRampToValueAtTime(.0001, t + 2.8);
    g2.gain.setValueAtTime(.0001, t); g2.gain.exponentialRampToValueAtTime(vol * .3, t + .004); g2.gain.exponentialRampToValueAtTime(.0001, t + .5);
    o.connect(g); o2.connect(g2); g.connect(out); g2.connect(out);
    if(c.createStereoPanner){ const p = c.createStereoPanner(); p.pan.value = (Math.random() - .5) * .7; out.connect(p); p.connect(Aud.mus); } else out.connect(Aud.mus);
    o.start(t); o2.start(t); o.stop(t + 2.9); o2.stop(t + .6); }
};
const Sfx = {
  noise(t, dur, type, f0, f1, vol, q){ const c = Aud.ctx, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = Aud.noise; f.type = type; f.Q.value = q || .7; f.frequency.setValueAtTime(f0, t); if(f1) f.frequency.exponentialRampToValueAtTime(f1, t + dur * .45);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * .18); g.gain.linearRampToValueAtTime(0, t + dur);
    s.connect(f); f.connect(g); g.connect(Aud.fx); s.start(t, Math.random() * .8); s.stop(t + dur + .05); },
  turn(){ if(!Aud.ctx) return; const t = Aud.ctx.currentTime + .02; this.noise(t, 1.3, 'bandpass', 700, 2600, .3, .7); this.noise(t + .2, .5, 'highpass', 3000, 0, .06); },
  land(){ if(!Aud.ctx) return; this.noise(Aud.ctx.currentTime + .01, .28, 'lowpass', 420, 0, .35, .5); },
  pop(){ if(!Aud.ctx || !Music.mood) return; const t = Aud.ctx.currentTime + .05, m = Music.mood;
    this.noise(t, .16, 'highpass', 1800, 0, .1); [0, 2, 4, 7].forEach((d, i) => Music.box(t + .12 + i * .09, dm(m, Music.deg + d) + 24, .045)); },
  chime(){ if(!Aud.ctx || !Music.mood) return; Music.box(Aud.ctx.currentTime + .02, dm(Music.mood, Music.deg + 7 + Math.floor(Math.random() * 5)) + 24, .06); }
};
