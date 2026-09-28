'use strict';
/* main.js — 책장 넘기기 제어, 자막, 언어 전환, 입력, 렌더 루프와 시작
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   책장 넘기기 제어
   ========================================================= */
const $ = s => document.querySelector(s);
const ui = { cap:$('#capText'), no:$('#chapNo'), ti:$('#chapTitle'), dots:$('#dots'), count:$('#count'), prev:$('#prevBtn'), next:$('#nextBtn'), again:$('#againBtn'),
  music:$('#tgMusic'), voice:$('#tgVoice'), auto:$('#tgAuto'), replay:$('#tgReplay'), note:$('#voiceNote'), open:$('#openBtn'), loading:$('#loading'),
  home:$('#homeBtn'), lang:$('#tgLang') };
const ST = { cur:-1, busy:false, turn:null, auto:true, started:false };
let autoTimer = null, capTimer = null, noteTimer = null;

function setCaption(t){ ui.cap.classList.add('out'); clearTimeout(capTimer); capTimer = setTimeout(() => { ui.cap.textContent = t; if(t) ui.cap.classList.remove('out'); }, REDUCED ? 0 : 320); }
function setChapter(i){ ui.no.textContent = `${String(i + 1).padStart(2, '0')} / ${SC.length}`; ui.ti.textContent = TX(i).title; ui.count.textContent = `${i + 1} / ${SC.length}`;
  [...ui.dots.children].forEach((d, k) => { d.classList.toggle('on', k === i); d.setAttribute('aria-current', k === i ? 'page' : 'false'); });
  ui.prev.disabled = i <= 0; ui.next.hidden = i >= SC.length - 1; ui.again.hidden = true; }
SC.forEach((s, i) => { const b = document.createElement('button'); b.className = 'dot'; b.onclick = () => go(i); ui.dots.appendChild(b); });

/* to === -1 은 책을 덮고 표지로 돌아가는 넘김 */
function go(to){
  if(!ST.started || ST.busy || to === ST.cur || to < -1 || to >= SC.length) return;
  clearTimeout(autoTimer); Narr.stop(); setCaption('');
  const from = ST.cur, fwd = to > from, toCover = to < 0;
  ensure(toCover ? 0 : to);
  if(from >= 0 && objs[from]) foldScene(objs[from]);
  setMap(leafFrontMat, fwd ? (from < 0 ? coverTex : spreadOf(from).R) : (toCover ? coverTex : spreadOf(to).R));
  setMap(leafBackMat, fwd ? spreadOf(to).L : spreadOf(from).L);
  ST.turn = { t:0, fwd, from, to, started:false, landed:false, rose:false, half:false };
  ST.busy = true; camMode = toCover ? 'cover' : 'open';
  if(toCover){ LT = lookOf(COVER_LOOK); document.body.classList.add('closing'); }
  else { LT = lookOf(SC[to].look); Music.setMood(SC[to].mood); setChapter(to); }
}
function updateTurn(dt){
  const T = ST.turn; T.t += dt;
  const L0 = T.from < 0 ? .2 : (REDUCED ? .3 : .55), LD = REDUCED ? .6 : 1.45;
  const p = clamp((T.t - L0) / LD);
  if(T.t >= L0 && !T.started){ T.started = true; showLeaf(true); Sfx.turn();
    if(T.fwd) setMap(pageMatR, spreadOf(T.to).R); else if(T.to >= 0) setMap(pageMatL, spreadOf(T.to).L); else pageL.visible = false; }
  if(!T.started) return;
  const e = ease(p), theta = T.fwd ? Math.PI * e : Math.PI * (1 - e);
  setLeaf(theta, (T.fwd ? -1 : 1) * .75 * Math.sin(theta));
  if(T.from < 0 && !T.half && theta > Math.PI * .5){ T.half = true; [pageL, stackL, boardL].forEach(m => m.visible = true); setMap(pageMatL, spreadOf(T.to).L); }
  if(T.to < 0 && !T.half && theta < Math.PI * .5){ T.half = true; [stackL, boardL].forEach(m => m.visible = false); }
  if(T.to >= 0 && p >= .86 && !T.rose){ T.rose = true; riseScene(objs[T.to]); Sfx.pop(); }
  if(p >= 1 && !T.landed){ T.landed = true; Sfx.land();
    if(T.to < 0) setMap(pageMatR, spreadOf(0).R);
    else { showLeaf(false); if(T.fwd) setMap(pageMatL, spreadOf(T.to).L); else setMap(pageMatR, spreadOf(T.to).R); } }
  if(T.landed && T.t > L0 + LD + .25){
    ST.cur = T.to; ST.busy = false; ST.turn = null;
    const c = ST.cur;
    if(c < 0){ prune([0, 1]); document.body.classList.remove('open', 'closing'); applyPendingLang(); return; }
    prune([c - 1, c, c + 1]);
    setTimeout(() => { if(ST.cur === c){ ensure(c + 1); ensure(c - 1); } }, 3200);
    if(applyPendingLang()) return;
    setTimeout(() => { if(ST.cur === c && !ST.busy) narrate(c); }, 900);
  }
}
function narrate(i){
  clearTimeout(autoTimer);
  Narr.play(TX(i).narr, (k, line) => setCaption(line), () => {
    if(i === SC.length - 1){ ui.again.hidden = false; return; }
    if(ST.auto) autoTimer = setTimeout(() => { if(!ST.busy && ST.cur === i) go(i + 1); }, 2600);
  });
}
function showNote(t){ ui.note.textContent = t; ui.note.hidden = false; clearTimeout(noteTimer); noteTimer = setTimeout(() => ui.note.hidden = true, 6500); }
function voiceCheck(){ if(!Narr.supported) showNote(UI[LANG].noSpeech); else if(Narr.on && !Narr.pick()) showNote(UI[LANG].noVoice); else ui.note.hidden = true; }

/* ---------- 한국어 ⇄ English ---------- */
let pendingLang = null;
function applyTexts(){
  const t = UI[LANG];
  document.documentElement.lang = LANG; document.body.classList.toggle('en', LANG === 'en'); document.title = t.doc;
  document.querySelectorAll('[data-t]').forEach(el => { if(el.hasAttribute('data-html')) el.innerHTML = t[el.dataset.t]; else el.textContent = t[el.dataset.t]; });
  document.querySelectorAll('[data-tt]').forEach(el => el.title = t[el.dataset.tt]);
  document.querySelectorAll('[data-ta]').forEach(el => el.setAttribute('aria-label', t[el.dataset.ta]));
  ui.lang.setAttribute('aria-label', t.langTip);
  [...ui.dots.children].forEach((b, i) => { b.title = t.dot(i, TX(i).title); b.setAttribute('aria-label', b.title); });
  if(ST.cur >= 0) setChapter(ST.cur);
}
function rebuildTextures(){
  if(coverTex){ coverTex.dispose(); coverTex = makeCover(); }
  Object.keys(spreads).forEach(k => { spreads[k].L.dispose(); spreads[k].R.dispose(); delete spreads[k]; });
  if(ST.cur < 0){ setMap(leafFrontMat, coverTex); setMap(leafBackMat, spreadOf(0).L); setMap(pageMatR, spreadOf(0).R); }
  else { setMap(pageMatL, spreadOf(ST.cur).L); setMap(pageMatR, spreadOf(ST.cur).R); }
}
function setLang(l){
  LANG = l; try { localStorage.setItem('ai-popup-lang', l); } catch(e){}
  applyTexts(); if(coverTex) rebuildTextures();
  if(ST.started){ voiceCheck(); if(ST.cur >= 0) narrate(ST.cur); }
}
function applyPendingLang(){ if(!pendingLang) return false; const l = pendingLang; pendingLang = null; if(l !== LANG){ setLang(l); return ST.cur >= 0; } return false; }

/* ---------- 입력 ---------- */
ui.prev.onclick = () => go(ST.cur - 1);
ui.next.onclick = () => go(ST.cur + 1);
ui.again.onclick = () => go(0);
ui.home.onclick = () => go(-1);
ui.lang.onclick = () => { const l = (pendingLang || LANG) === 'ko' ? 'en' : 'ko';
  if(ST.busy){ pendingLang = l; const t = UI[l]; ui.lang.querySelector('span').textContent = t.lang; return; }
  setLang(l); };
ui.music.onclick = () => { const on = ui.music.getAttribute('aria-pressed') !== 'true'; ui.music.setAttribute('aria-pressed', on); Aud.setOn(on); };
ui.voice.onclick = () => { const on = ui.voice.getAttribute('aria-pressed') !== 'true'; ui.voice.setAttribute('aria-pressed', on); Narr.on = on;
  if(!on && Narr.supported) try { speechSynthesis.cancel(); } catch(e){} };
ui.auto.onclick = () => { ST.auto = ui.auto.getAttribute('aria-pressed') !== 'true'; ui.auto.setAttribute('aria-pressed', ST.auto); if(!ST.auto) clearTimeout(autoTimer); };
ui.replay.onclick = () => { if(ST.started && !ST.busy && ST.cur >= 0) narrate(ST.cur); };
addEventListener('keydown', e => {
  if(e.target.closest && e.target.closest('button') && (e.key === 'Enter' || e.key === ' ')) return;
  if(ST.cur < 0){ if(e.key === 'Enter' && !ui.open.disabled && !ST.busy) ui.open.click(); return; }
  if(e.key === 'ArrowRight' || e.key === 'PageDown') go(ST.cur + 1);
  else if(e.key === 'ArrowLeft' || e.key === 'PageUp') go(ST.cur - 1);
  else if(e.key === 'Home' || e.key === 'Escape') go(-1);
});
let down = null;
canvas.addEventListener('pointerdown', e => { down = { x:e.clientX, y:e.clientY, t:performance.now() }; });
canvas.addEventListener('pointerup', e => { if(!down || ST.cur < 0) return; const dx = e.clientX - down.x, dy = e.clientY - down.y; down = null;
  if(Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(ST.cur + (dx < 0 ? 1 : -1)); });

ui.open.onclick = () => {
  if(ST.busy || ST.cur >= 0) return;
  Aud.init();
  if(!ST.started){ ST.started = true; Narr.prime(); Music.start(SC[0].mood); setTimeout(voiceCheck, 1600); }
  document.body.classList.add('open');
  go(0);
};

/* =========================================================
   시작
   ========================================================= */
let coverTex = null;
let last = performance.now(), T = 0;
function tick(dt){
  T += dt;
  if(ST.turn) updateTurn(dt);
  for(const k in objs) updateScene(objs[k], dt, T);
  updateLook(dt); updateCamera(dt, T, false);
  pMat.uniforms.uTime.value = T;
}
function frame(now){
  requestAnimationFrame(frame);
  tick(Math.min(.1, (now - last) / 1000)); last = now;
  renderer.render(scene, cam);
}
async function boot(){
  applyTexts();
  const sample = SC.map(s => s.title + s.line).join('') + '제장끝사랑을배운아이입체그림책열네개의장면영화에바치는헌정「」()·—0123456789';
  const enSample = EN.map(s => s.title + s.line).join('') + 'A.I. Chapter The End Pop-up Book Fourteen Scenes 0123456789 —·()';
  try { await Promise.race([ Promise.all([
      document.fonts.load('400 40px "Gowun Batang"', sample), document.fonts.load('700 40px "Gowun Batang"', sample),
      document.fonts.load('italic 500 80px "Cormorant Garamond"', enSample), document.fonts.load('500 80px "Cormorant Garamond"', enSample),
      document.fonts.load('italic 400 80px "Cormorant Garamond"', enSample) ]),
    new Promise(r => setTimeout(r, 4000)) ]); } catch(e){}
  resize();
  coverTex = makeCover();
  ensure(0);
  setMap(leafFrontMat, coverTex); setMap(leafBackMat, spreadOf(0).L); setMap(pageMatR, spreadOf(0).R);
  [pageL, stackL, boardL].forEach(m => m.visible = false);
  setLeaf(0, 0); showLeaf(true);
  updateLook(1); updateCamera(0, 0, true);
  requestAnimationFrame(t => { last = t; frame(t); });
  ui.loading.classList.add('gone'); ui.open.disabled = false;
  setTimeout(() => ensure(1), 600);
}
boot();
