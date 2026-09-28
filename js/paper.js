'use strict';
/* paper.js — 공용 유틸, 종이 오리기 그리기 도구(D), 종이 마감(finishPaper), 펼침면 바닥 도구(G)
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   기본 유틸
   ========================================================= */
const W = 5, H = 7, TAU = Math.PI * 2;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeBack = t => { const c1 = 1.25, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
function rng(seed){ return function(){ seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mk(w, h){ const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function hexA(h, a){ if(h[0] !== '#') return h; const n = parseInt(h.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }

const grainCv = (() => { const c = mk(128, 128), g = c.getContext('2d'), d = g.createImageData(128, 128), r = rng(3);
  for(let i = 0; i < d.data.length; i += 4){ const v = r() < .5 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = r() * 26; }
  g.putImageData(d, 0, 0); return c; })();

/* =========================================================
   종이 오리기 도구 (세계 단위로 그림)
   ========================================================= */
const D = {
  lg(g, x0, y0, x1, y1, st){ const q = g.createLinearGradient(x0, y0, x1, y1); st.forEach(s => q.addColorStop(s[0], s[1])); return q; },
  rg(g, x, y, r0, r1, st){ const q = g.createRadialGradient(x, y, r0, x, y, r1); st.forEach(s => q.addColorStop(s[0], s[1])); return q; },
  ell(g, c, x, y, rx, ry, rot){ g.beginPath(); g.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot || 0, 0, TAU); g.fillStyle = c; g.fill(); },
  rect(g, c, x, y, w, h){ g.fillStyle = c; g.fillRect(x, y, w, h); },
  rr(g, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); },
  rrf(g, c, x, y, w, h, r){ D.rr(g, x, y, w, h, r); g.fillStyle = c; g.fill(); },
  poly(g, c, p){ g.beginPath(); g.moveTo(p[0], p[1]); for(let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.closePath(); g.fillStyle = c; g.fill(); },
  line(g, c, lw, p){ g.beginPath(); g.moveTo(p[0], p[1]); for(let i = 2; i < p.length; i += 2) g.lineTo(p[i], p[i + 1]); g.strokeStyle = c; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); },
  back(g, w, h, fill, r){ r = r ?? .35; g.beginPath(); g.moveTo(0, h); g.lineTo(0, r); g.quadraticCurveTo(0, 0, r, 0); g.lineTo(w - r, 0); g.quadraticCurveTo(w, 0, w, r); g.lineTo(w, h); g.closePath(); g.fillStyle = fill; g.fill(); },
  arch(g, w, h, fill, k){ k = k ?? .3; g.beginPath(); g.moveTo(0, h); g.lineTo(0, h * k); g.bezierCurveTo(w * .08, -h * .03, w * .92, -h * .03, w, h * k); g.lineTo(w, h); g.closePath(); g.fillStyle = fill; g.fill(); },
  atop(g, fn){ g.save(); g.globalCompositeOperation = 'source-atop'; fn(); g.restore(); },
  cut(g, fn){ g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.strokeStyle = '#000'; fn(); g.restore(); },
  stars(g, w, h, n, seed, c, rmax){ const r = rng(seed); g.fillStyle = c; for(let i = 0; i < n; i++){ g.globalAlpha = .35 + r() * .65; g.beginPath(); g.arc(r() * w, r() * h, .008 + r() * (rmax || .022), 0, TAU); g.fill(); } g.globalAlpha = 1; },
  window(g, x, y, w, h, frame, glass, fw){ fw = fw || .07; D.rrf(g, frame, x, y, w, h, .04); D.rrf(g, glass, x + fw, y + fw, w - fw * 2, h - fw * 2, .02); },

  person(g, x, base, Hh, o){
    o = o || {}; const k = o.kind || 'child', c = o.color || '#222', d = o.dir || 1, pose = o.pose || 'stand';
    const child = k === 'child', woman = k === 'woman', mecha = k === 'mecha';
    const hr = Hh * (child ? .1 : mecha ? .06 : .066);
    const headH = mecha ? hr * 1.7 : hr;
    const hy = base - Hh + headH;
    const shY = hy + headH + Hh * (child ? .03 : mecha ? .03 : .045);
    const shW = Hh * (child ? .2 : woman ? .16 : mecha ? .12 : .21);
    const hipY = base - Hh * (child ? .43 : mecha ? .53 : .48);
    const hipW = Hh * (child ? .15 : woman ? .15 : mecha ? .07 : .15);
    const lw = Hh * (child ? .062 : mecha ? .024 : .048);
    const kneel = pose === 'kneel';
    g.fillStyle = c;
    if(woman) D.ell(g, c, x - d * hr * .12, hy + hr * .6, hr * 1.12, hr * 1.55);
    if(!kneel){
      const st = (o.stride || 0) * Hh;
      D.line(g, c, lw * 1.05, [x - hipW * .28, hipY, x - hipW * .3 - st, base - lw * .5]);
      D.line(g, c, lw * 1.05, [x + hipW * .28, hipY, x + hipW * .3 + st, base - lw * .5]);
      D.ell(g, c, x - hipW * .3 - st + d * lw * .15, base - lw * .38, lw * .8, lw * .38);
      D.ell(g, c, x + hipW * .3 + st + d * lw * .15, base - lw * .38, lw * .8, lw * .38);
    }
    g.beginPath(); g.moveTo(x - shW / 2, shY + lw * .6); g.quadraticCurveTo(x - shW / 2, shY, x - shW / 2 + lw * .8, shY);
    g.lineTo(x + shW / 2 - lw * .8, shY); g.quadraticCurveTo(x + shW / 2, shY, x + shW / 2, shY + lw * .6);
    g.lineTo(x + hipW / 2, hipY + lw * .3); g.lineTo(x - hipW / 2, hipY + lw * .3); g.closePath(); g.fillStyle = c; g.fill();
    if(woman || kneel){
      const sb = kneel ? base : base - Hh * .16, sw = Hh * (kneel ? .38 : .3), wy = hipY - Hh * .05;
      g.beginPath(); g.moveTo(x - hipW * .5, wy); g.lineTo(x + hipW * .5, wy);
      g.quadraticCurveTo(x + sw * .42, sb - Hh * .12, x + sw / 2, sb); g.lineTo(x - sw / 2, sb);
      g.quadraticCurveTo(x - sw * .42, sb - Hh * .12, x - hipW * .5, wy); g.closePath(); g.fill();
    }
    if(o.coat){ g.beginPath(); g.moveTo(x - shW / 2, shY + lw * .5); g.lineTo(x + shW / 2, shY + lw * .5); g.lineTo(x + Hh * .16, base - Hh * .22); g.lineTo(x - Hh * .16, base - Hh * .22); g.closePath(); g.fill(); }
    g.fillRect(x - hr * .3, hy + headH * .5, hr * .6, shY - hy - headH * .3);
    D.ell(g, c, x, hy, hr * (mecha ? .68 : .9), headH);
    if(child) D.ell(g, c, x - d * hr * .06, hy - hr * .26, hr * .98, hr * .8);
    if(woman) D.ell(g, c, x + d * hr * .25, hy - hr * .58, hr * .58, hr * .44);
    if(o.hat){ D.ell(g, c, x, hy - hr * .62, hr * 1.65, hr * .22); D.rrf(g, c, x - hr * .82, hy - hr * 1.6, hr * 1.64, hr * 1.02, hr * .26); }
    const al = Hh * (child ? .31 : mecha ? .44 : .37), sx = shW / 2 - lw * .45, sy = shY + lw * .5;
    const P = { stand:[[-1,.1,.06],[1,.1,.06]], hold:[[-1,.35,-1.9],[1,.35,-1.9]], pray:[[-1,.22,-2.4],[1,.22,-2.4]],
      open:[[-1,2.35,.25],[1,2.35,.25]], reach:[[-d,.12,.06],[d,1.95,.2]], out:[[-d,.12,.06],[d,1.4,.1]], wave:[[-d,.12,.06],[d,2.6,.3]] };
    let hand = [x, sy];
    (P[o.arms || (kneel ? 'out' : pose)] || P.stand).forEach(([s, a, b]) => {
      const ex = x + s * sx + Math.sin(a) * s * al * .5, ey = sy + Math.cos(a) * al * .5, a2 = a + b;
      const hx = ex + Math.sin(a2) * s * al * .5, hy2 = ey + Math.cos(a2) * al * .5;
      D.line(g, c, lw * .88, [x + s * sx, sy, ex, ey, hx, hy2]); D.ell(g, c, hx, hy2, lw * .55, lw * .55); hand = [hx, hy2];
    });
    return hand;
  },
  teddy(g, x, base, h, c, c2){
    const r = h * .2, hy = base - h + r * 1.1, e = '#2a1d14';
    D.ell(g, c, x - r * .8, hy - r * .75, r * .36, r * .36); D.ell(g, c, x + r * .8, hy - r * .75, r * .36, r * .36);
    D.ell(g, c2, x - r * .8, hy - r * .75, r * .18, r * .18); D.ell(g, c2, x + r * .8, hy - r * .75, r * .18, r * .18);
    D.ell(g, c, x - r * .62, base - r * .42, r * .44, r * .42); D.ell(g, c, x + r * .62, base - r * .42, r * .44, r * .42);
    D.ell(g, c, x, base - h * .34, r * 1.02, h * .27);
    D.ell(g, c, x - r * 1.0, base - h * .42, r * .3, r * .58, .55); D.ell(g, c, x + r * 1.0, base - h * .42, r * .3, r * .58, -.55);
    D.ell(g, c, x, hy, r, r * .94); D.ell(g, c2, x, hy + r * .36, r * .42, r * .3); D.ell(g, c2, x, base - h * .3, r * .55, h * .15);
    D.ell(g, e, x, hy + r * .24, r * .13, r * .09); D.ell(g, e, x - r * .38, hy - r * .12, r * .08, r * .09); D.ell(g, e, x + r * .38, hy - r * .12, r * .08, r * .09);
  },
  pine(g, x, base, h, c){ g.fillStyle = c; g.fillRect(x - h * .025, base - h * .2, h * .05, h * .2);
    for(let i = 0; i < 4; i++){ const t = i / 4, y0 = base - h * .12 - t * h * .6, ww = h * .44 * (1 - t * .62); g.beginPath(); g.moveTo(x - ww / 2, y0); g.lineTo(x, y0 - h * .36); g.lineTo(x + ww / 2, y0); g.closePath(); g.fill(); } },
  tree(g, x, base, h, c, seed){ const r = rng(seed || 1); D.line(g, c, h * .05, [x, base, x + (r() - .5) * h * .05, base - h * .55]);
    for(let i = 0; i < 8; i++) D.ell(g, c, x + (r() - .5) * h * .5, base - h * .64 - (r() - .35) * h * .32, h * (.13 + r() * .1), h * (.11 + r() * .08)); },
  trunks(g, x0, x1, base, top, n, seed, c, wmin, wmax){ const r = rng(seed);
    for(let i = 0; i < n; i++){ const x = x0 + (x1 - x0) * (i + .1 + r() * .8) / n, w = wmin + (wmax - wmin) * r(), tt = top + r() * (base - top) * .22;
      g.fillStyle = c; g.beginPath(); g.moveTo(x - w / 2, base); g.lineTo(x - w * .3, tt); g.lineTo(x + w * .3, tt); g.lineTo(x + w / 2, base); g.closePath(); g.fill();
      for(let b = 0; b < 3; b++){ const by = tt + (base - tt) * (.08 + r() * .42), s = r() < .5 ? -1 : 1, bl = w * (1.8 + r() * 3); D.line(g, c, w * .22, [x, by, x + s * bl, by - bl * .7]); } } },
  skyline(g, x0, x1, base, o){ const r = rng(o.seed || 1); let x = x0; const wins = [];
    while(x < x1){ const bw = o.wmin + (o.wmax - o.wmin) * r(), bh = o.hmin + (o.hmax - o.hmin) * r(), top = base - bh;
      g.fillStyle = o.c; g.fillRect(x, top, bw * .94, bh + .01);
      if(r() < .38){ g.fillRect(x + bw * .22, top - bh * .1, bw * .5, bh * .1 + .01); if(r() < .6) g.fillRect(x + bw * .44, top - bh * .3, bw * .05, bh * .2); }
      const cols = Math.max(2, Math.floor(bw / .14)), rows = Math.floor((bh - .1) / .2);
      for(let i = 0; i < cols; i++) for(let j = 0; j < rows; j++) if(r() < o.win){ const lc = Array.isArray(o.lit) ? o.lit[Math.floor(r() * o.lit.length)] : o.lit; wins.push([x + (i + .5) * (bw * .94) / cols - .03, top + .12 + j * .2, .06, .09, lc]); }
      x += bw; }
    wins.forEach(w => { g.fillStyle = w[4]; g.fillRect(w[0], w[1], w[2], w[3]); }); return wins; },
  wins(g, wins, c){ wins.forEach(w => { g.fillStyle = c || w[4]; g.fillRect(w[0], w[1], w[2], w[3]); }); },
  moon(g, x, y, r, c, c2){ g.beginPath(); g.arc(x, y, r, 0, TAU); g.fillStyle = D.rg(g, x - r * .3, y - r * .3, r * .1, r * 1.1, [[0, c], [1, c2]]); g.fill();
    const q = rng(5); for(let i = 0; i < 8; i++){ const a = q() * TAU, dd = q() * r * .68; D.ell(g, 'rgba(120,105,90,.16)', x + Math.cos(a) * dd, y + Math.sin(a) * dd, r * (.06 + q() * .12), r * (.06 + q() * .1)); } },
  wheel(g, cx, cy, r, c, lw){ g.strokeStyle = c; g.lineWidth = lw; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, r * .9, 0, TAU); g.stroke();
    for(let i = 0; i < 16; i++){ const a = i / 16 * TAU; D.line(g, c, lw * .55, [cx, cy, cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    for(let i = 0; i < 12; i++){ const a = i / 12 * TAU; D.rrf(g, c, cx + Math.cos(a) * r - r * .07, cy + Math.sin(a) * r, r * .14, r * .12, r * .03); }
    D.ell(g, c, cx, cy, r * .08, r * .08); },
  car(g, x, base, s, c){ g.beginPath(); g.moveTo(x - s * .5, base - s * .1); g.quadraticCurveTo(x - s * .48, base - s * .42, x - s * .05, base - s * .45);
    g.quadraticCurveTo(x + s * .36, base - s * .44, x + s * .5, base - s * .18); g.lineTo(x + s * .5, base - s * .08); g.closePath(); g.fillStyle = c; g.fill();
    D.ell(g, c, x - s * .3, base - s * .08, s * .09, s * .09); D.ell(g, c, x + s * .3, base - s * .08, s * .09, s * .09); },
  sub(g, x, y, s, c, c2, dir, inner){ g.save(); g.translate(x, y); g.scale(dir || 1, 1);
    D.line(g, c, s * .03, [-s * .36, -s * .36, s * .36, -s * .36]); g.fillStyle = c; g.fillRect(-s * .02, -s * .36, s * .04, s * .14);
    D.ell(g, c, -s * .58, 0, s * .1, s * .15); D.ell(g, c, 0, 0, s * .55, s * .26);
    D.ell(g, c2, s * .12, -s * .08, s * .24, s * .18); if(inner) inner(s * .12, -s * .08);
    D.line(g, c, s * .035, [-s * .36, s * .31, s * .36, s * .31]); D.line(g, c, s * .03, [-s * .2, s * .2, -s * .22, s * .31]); D.line(g, c, s * .03, [s * .2, s * .2, s * .22, s * .31]);
    D.ell(g, '#fff4c8', s * .52, s * .05, s * .06, s * .05); g.restore(); },
  fairy(g, x, base, h, c1, c2){ const gr = D.lg(g, x, base - h, x, base, [[0, c1], [1, c2]]); g.fillStyle = gr;
    g.beginPath(); g.moveTo(x - h * .07, base - h * .7); g.quadraticCurveTo(x - h * .12, base - h * .3, x - h * .3, base); g.lineTo(x + h * .3, base); g.quadraticCurveTo(x + h * .12, base - h * .3, x + h * .07, base - h * .7); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(x - h * .08, base - h * .79); g.lineTo(x + h * .08, base - h * .79); g.lineTo(x + h * .06, base - h * .62); g.lineTo(x - h * .06, base - h * .62); g.closePath(); g.fill();
    D.ell(g, gr, x, base - h * .86, h * .05, h * .06); D.ell(g, gr, x - h * .01, base - h * .895, h * .066, h * .045);
    D.poly(g, c1, [x - h * .05, base - h * .92, x - h * .03, base - h * .975, x, base - h * .935, x + h * .03, base - h * .975, x + h * .05, base - h * .92]);
    D.line(g, gr, h * .026, [x - h * .08, base - h * .76, x - h * .14, base - h * .6, x - h * .12, base - h * .5]);
    D.line(g, gr, h * .026, [x + h * .08, base - h * .76, x + h * .17, base - h * .83, x + h * .21, base - h * .93]);
    D.line(g, c1, h * .012, [x + h * .21, base - h * .93, x + h * .27, base - h * .985]);
    D.star(g, c1, x + h * .27, base - h * .985, h * .03); },
  star(g, c, x, y, r){ g.beginPath(); for(let i = 0; i < 10; i++){ const a = i / 10 * TAU - Math.PI / 2, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fillStyle = c; g.fill(); },
  crowd(g, x0, x1, base, n, hmin, hmax, c, seed){ const r = rng(seed);
    for(let i = 0; i < n; i++){ const x = x0 + (x1 - x0) * (i + r()) / n, hh = hmin + (hmax - hmin) * r(), hr = .085 + r() * .03;
      D.ell(g, c, x, base - hh + hr, hr * .9, hr); D.rrf(g, c, x - hr * 1.7, base - hh + hr * 1.9, hr * 3.4, hh, hr * 1.2);
      if(r() < .35) D.line(g, c, .05, [x + hr * 1.3, base - hh + hr * 2.4, x + hr * 2.3, base - hh - hr * 1.2]); } },
  weed(g, w, h, c, seed){ const r = rng(seed);
    for(let i = 0; i < 5; i++){ const x = w * (.2 + .6 * r()), hh = h * (.55 + .45 * r()), b = (r() - .5) * .6;
      g.beginPath(); g.moveTo(x - .05, h); g.bezierCurveTo(x + b - .1, h - hh * .4, x - b, h - hh * .7, x + b * .5, h - hh);
      g.bezierCurveTo(x - b + .06, h - hh * .7, x + b, h - hh * .4, x + .05, h); g.closePath(); g.fillStyle = c; g.fill(); } },
  letter(g, w, h){ D.rrf(g, '#fbf7ee', 0, 0, w, h, .02); for(let i = 0; i < 4; i++) D.rect(g, 'rgba(70,80,130,.55)', w * .12, h * .2 + i * h * .16, w * (i === 3 ? .4 : .76), h * .035); D.ell(g, '#d8544c', w * .8, h * .8, w * .05, w * .05); },
  bed(g, w, o){ D.rrf(g, o.head, .1, 0, w - .2, 1.05, .25);
    o.pillows.forEach(p => D.ell(g, o.pillow, p, .74, .5, .2));
    (o.sleepers || []).forEach(s => { D.ell(g, s.hair, s.x + .04, .64, s.r * 1.7, s.r * 1.1); D.ell(g, s.face, s.x - .02, .67, s.r * .9, s.r); });
    D.rect(g, o.matt, 0, .95, w, .65);
    g.beginPath(); g.moveTo(o.bx, 1.6); g.lineTo(o.bx, .92); g.bezierCurveTo(o.bx + .2, .7, w * .55, .66, w - .1, .8); g.lineTo(w, 1.6); g.closePath(); g.fillStyle = o.blanket; g.fill(); }
};

/* 오려낸 종이의 흰 단면, 결, 음영을 입힘 */
function finishPaper(cv, g, rimColor, rimPx){
  const w = cv.width, h = cv.height, t = mk(w, h), tg = t.getContext('2d');
  tg.drawImage(cv, 0, 0); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = rimColor; tg.fillRect(0, 0, w, h);
  g.save(); g.globalCompositeOperation = 'destination-over';
  [rimPx * .5, rimPx].forEach(rp => { for(let a = 0; a < 8; a++) g.drawImage(t, Math.cos(a * Math.PI / 4) * rp, Math.sin(a * Math.PI / 4) * rp); });
  g.globalCompositeOperation = 'source-atop'; g.fillStyle = g.createPattern(grainCv, 'repeat'); g.fillRect(0, 0, w, h);
  const q = g.createLinearGradient(0, 0, 0, h); q.addColorStop(0, 'rgba(255,255,255,.05)'); q.addColorStop(1, 'rgba(0,0,0,.16)'); g.fillStyle = q; g.fillRect(0, 0, w, h);
  g.restore();
}

/* 펼침면 바닥 그림용 도구 (10 × 7 단위) */
const G = {
  fill(g, c){ g.fillStyle = c; g.fillRect(0, 0, 10, 7); },
  wash(g, x, y, rx, ry, c, a){ g.save(); g.globalAlpha = a ?? 1; g.translate(x, y); g.scale(rx, ry); const q = g.createRadialGradient(0, 0, 0, 0, 0, 1); q.addColorStop(0, hexA(c, 1)); q.addColorStop(1, hexA(c, 0)); g.fillStyle = q; g.beginPath(); g.arc(0, 0, 1, 0, TAU); g.fill(); g.restore(); },
  boards(g, c, gap){ g.strokeStyle = c; g.lineWidth = .018; for(let y = gap; y < 7; y += gap){ g.beginPath(); g.moveTo(0, y); g.lineTo(10, y); g.stroke(); } },
  dots(g, c, n, seed, x0, y0, x1, y1, r0, r1){ const r = rng(seed); g.fillStyle = c; for(let i = 0; i < n; i++){ g.beginPath(); g.arc(x0 + (x1 - x0) * r(), y0 + (y1 - y0) * r(), r0 + (r1 - r0) * r(), 0, TAU); g.fill(); } },
  ripples(g, c, n, seed, y1){ const r = rng(seed); g.strokeStyle = c; g.lineWidth = .022; for(let i = 0; i < n; i++){ const x = r() * 10, y = r() * (y1 || 5.6), l = .3 + r() * .9; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + l / 2, y - .05, x + l, y); g.stroke(); } },
  clear(g, fn){ g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; fn(); g.restore(); }
};
