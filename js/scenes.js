'use strict';
/* scenes.js — 14장면 데이터(한국어 문장, 조명, 음악 분위기, 종이 조각)와 장면 전용 그리기 함수
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   장면 데이터 (14장)
   좌표: x -5~5 (책등 0), z -3.5(안쪽)~3.5(앞쪽), 조각은 z 위치에 서는 종이
   ========================================================= */
const letterAnim = (ph) => (pc, t) => { pc.hinge.position.y = pc.base.y + Math.sin(t * .8 + ph) * .08; pc.mesh.rotation.z = Math.sin(t * .6 + ph) * .12; };
const swayAnim = (amp, sp, ph) => (pc, t) => { pc.mesh.rotation.z = Math.sin(t * sp + ph) * amp; };
const trio = (c1, c2) => (g, w, h) => {
  D.person(g, .6, h, 2.25, { kind:'man', coat:true, hat:true, color:c1, dir:1 });
  D.person(g, 1.45, h, 1.38, { kind:'child', pose:'hold', color:c2 });
  D.teddy(g, 2.03, h, .55, '#6b4b30', '#a7825a');
};

const SC = [
/* 1 */ {
  title:'물에 잠긴 세상', line:'바다가 도시를 삼킨 뒤에도, 사람들은 사랑을 꿈꾸었어요.',
  narr:['먼 훗날, 극지의 얼음이 녹아 바다가 해안의 도시들을 삼켜 버렸어요.',
        '살아남은 사람들은 아이를 마음대로 가질 수 없게 되었고, 대신 지치지도 먹지도 않는 기계, 메카를 곁에 두었지요.',
        '그러던 어느 날, 한 과학자가 조용히 꿈을 꾸었어요.',
        '진짜로 사랑할 줄 아는 아이를 만들 수 있다면, 하고요.'],
  mood:{ root:50, mode:'minor', prog:[0,5,3,6], bar:9, beat:.75, bright:700, rest:.42 },
  look:{ bg:'#0c1422', hemi:['#8fa7c4','#141c28',.55], key:['#cfe0ff',1.05,[-6,9,5]], p1:['#ffb56b',1.3,[1.6,1.6,-1],8], p2:['#6fb3ff',.7,[-3,3,2],7], dust:['#cfe3ff',4.5,-.45,.25,.45] },
  ground(g){ G.fill(g, '#a9bcc4'); G.wash(g, 5, 3, 5.5, 3.2, '#5d879c', .9); G.ripples(g, 'rgba(235,245,250,.55)', 70, 4); },
  pieces:[
    { x:0, z:-3, w:9.6, h:4.8, draw(g, w, h){
        D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#243450'],[.5,'#62799a'],[.82,'#aebdca'],[1,'#c6cfd4']]));
        D.atop(g, () => { D.ell(g, 'rgba(255,238,214,.9)', w * .25, h * .64, .46, .46);
          for(let i = 0; i < 8; i++) D.ell(g, 'rgba(36,52,78,.26)', w * (.06 + i * .13), h * (.26 + (i % 3) * .11), 1.3, .12); }); },
      glow(g, w, h){ D.ell(g, D.rg(g, w * .25, h * .64, 0, 1, [[0,'#ffe0b8'],[1,'rgba(0,0,0,0)']]), w * .25, h * .64, 1, 1); }, ei:.9 },
    { x:0, z:-2.2, w:9, h:2.6, d:.15, draw(g, w, h, S){ S.win = D.skyline(g, 0, w, h, { hmin:.8, hmax:2.4, wmin:.35, wmax:.8, c:'#56697f', seed:3, win:.05, lit:'#e8d2a8' }); },
      glow(g, w, h, S){ D.wins(g, S.win, '#ffd9a0'); }, ei:1.2 },
    { x:-.4, z:-1.1, w:7.6, h:3.3, d:.3, draw(g, w, h, S){ S.win = D.skyline(g, 0, w, h, { hmin:1.2, hmax:3.2, wmin:.45, wmax:1, c:'#2b394c', seed:9, win:.1, lit:'#ffc47a' }); },
      glow(g, w, h, S){ D.wins(g, S.win, '#ffb866'); }, ei:1.5 },
    { x:3.1, z:.3, w:1.5, h:2.7, d:.45, draw(g, w, h){ g.save(); g.translate(w / 2, h); g.rotate(.09);
        D.rrf(g, '#1f2a3a', -.45, -2.4, .9, 2.45, .04); D.rrf(g, '#1f2a3a', -.3, -2.58, .6, .22, .03); D.rect(g, '#1f2a3a', -.03, -2.7, .06, .14);
        for(let j = 0; j < 8; j++) for(let i = 0; i < 3; i++) if((i + j) % 3 !== 1) D.rect(g, j % 4 === 1 ? '#ffc47a' : '#34445a', -.32 + i * .25, -2.25 + j * .27, .12, .14);
        g.restore(); } },
    { x:-1.7, z:1.4, y0:.86, w:.9, h:.62, d:.9, draw(g){ D.poly(g, '#f4efe4', [.05,.42,.85,.42,.7,.6,.2,.6]); D.poly(g, '#e2dac8', [.45,.04,.45,.4,.14,.4]); D.poly(g, '#fbf7ee', [.47,.08,.47,.4,.76,.4]); },
      anim(pc, t){ pc.hinge.position.y = pc.base.y + Math.sin(t * 1.3) * .03; pc.mesh.rotation.z = Math.sin(t * 1.1) * .06; } }
  ],
  water:[{ x:0, z:-.65, w:10, d:5.7, level:.85, c:'#3b6f88', op:.6 }],
  glows:[{ x:-2.4, y:3.2, z:-3.05, s:3.2, c:'#ffd9a8', op:.45 }]
},
/* 2 */ {
  title:'하얀 빛 속의 아이', line:'문이 열리고, 빛 속에서 한 아이가 걸어 나왔어요.',
  narr:['헨리와 모니카의 아들 마틴은 고칠 수 없는 병 때문에 차가운 캡슐 속에서 긴 잠을 자고 있었어요.',
        '깊은 슬픔에 잠긴 모니카를 위해, 어느 날 헨리는 한 아이를 집으로 데려왔지요.',
        '눈부신 빛 속에서 걸어 나온 그 아이의 이름은 데이비드.',
        '사랑하도록 만들어진, 세상에서 가장 처음 태어난 아이 메카였어요.'],
  mood:{ root:53, mode:'lydian', prog:[0,1,0,4], bar:8, beat:.6, bright:1100, rest:.45 },
  look:{ bg:'#11111b', hemi:['#e8e6f2','#24222c',.5], key:['#fff4e6',.95,[4,8,6]], p1:['#ffffff',2.6,[0,2,-2.4],7], p2:['#8ad0ff',1.1,[3.2,1,1],4], dust:['#ffffff',4,.12,.35,.55] },
  ground(g){ G.fill(g, '#d3cedb'); G.wash(g, 5, 3.2, 5.4, 3.4, '#aaa2bd', .7); G.boards(g, 'rgba(120,110,140,.25)', .45);
    G.clear(g, () => { g.globalAlpha = .8; g.beginPath(); g.moveTo(4.4, .7); g.lineTo(5.6, .7); g.lineTo(6.6, 4.4); g.lineTo(3.4, 4.4); g.closePath(); g.fill(); }); },
  pieces:[
    { x:0, z:-3.25, w:2.2, h:3.3, rim:'#ffffff', draw(g, w, h){ D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#f4f8ff'],[1,'#ffffff']]), .1); },
      glow(g, w, h){ D.rect(g, '#e8f0ff', 0, 0, w, h); }, ei:1.4 },
    { x:0, z:-2.85, w:9.4, h:4.4, d:.08, draw(g, w, h){
        D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#c9c4d4'],[1,'#e6e2ec']]));
        D.atop(g, () => { D.rect(g, 'rgba(110,100,135,.2)', 0, h * .74, w, .05);
          D.rrf(g, '#aab3cc', w * .74, h * .2, 1.7, 1.8, .06); for(let i = 0; i < 9; i++) D.rect(g, 'rgba(240,244,255,.55)', w * .74 + .08, h * .2 + .12 + i * .18, 1.54, .05);
          D.rect(g, '#9990a8', w * .16 - .01, 0, .02, h * .3 - .26); D.ell(g, '#f7f3ea', w * .16, h * .3, .28, .28); });
        D.cut(g, () => g.fillRect(w / 2 - .6, h - 2.9, 1.2, 2.9));
        g.strokeStyle = '#a9a2bb'; g.lineWidth = .07; g.strokeRect(w / 2 - .64, h - 2.94, 1.28, 2.98); } },
    { x:0, z:-2.6, w:.8, h:1.6, d:.55, draw(g, w, h){ D.person(g, w / 2, h, 1.55, { kind:'child', color:'#2c3046' }); } },
    { x:-2.7, z:.8, w:2.2, h:2.6, d:.3, draw(g, w, h){ D.person(g, .65, h, 2.5, { kind:'man', color:'#4a4039', dir:1 }); D.person(g, 1.55, h, 2.28, { kind:'woman', color:'#83394a', pose:'hold', dir:1 }); } },
    { x:3.1, z:.1, w:2, h:1.15, d:.4, draw(g, w, h){ D.rrf(g, '#3c4458', .35, h - .35, 1.3, .35, .05);
        D.rrf(g, D.lg(g, 0, .1, 0, .85, [[0,'#d8f1ff'],[1,'#7cb9dc']]), .05, .1, 1.9, .72, .36);
        D.ell(g, '#4a7897', .5, .46, .12, .12); D.rrf(g, '#4a7897', .6, .38, 1.0, .18, .09); },
      glow(g){ D.rrf(g, '#3a8ab8', .05, .1, 1.9, .72, .36); }, ei:.9 },
    { x:-4.3, z:1.7, w:.9, h:1.8, d:.6, draw(g, w, h){ D.rrf(g, '#6b5a4a', .25, h - .45, .4, .45, .05);
        for(let i = 0; i < 7; i++){ const a = -1.3 + i * .43; D.ell(g, '#4d6656', .45 + Math.sin(a) * .28, h - .78 - Math.cos(a) * .42, .09, .36, a); } } }
  ],
  glows:[{ x:0, y:1.5, z:-3.1, s:5, c:'#ffffff', op:.75 }, { x:3.1, y:.55, z:.25, s:2, c:'#7fd2ff', op:.45 }],
  beams:[{ from:[0,.02,-2.8], to:[0,.02,.9], w:1.2, spread:2, c:'#ffffff', op:.26, flat:true }]
},
/* 3 */ {
  title:'일곱 개의 단어', line:'한번 새겨진 사랑은 되돌릴 수 없었어요.',
  narr:['처음에 모니카는 기계 아이가 낯설고, 조금은 두려웠어요.',
        '하지만 며칠 뒤, 그녀는 데이비드의 마음을 영원히 자신에게 묶어 둘 일곱 개의 단어를 천천히 읽어 주었어요.',
        '단어 하나하나가 작은 불빛처럼 아이의 마음속에 켜졌지요.',
        '그 순간부터 데이비드는 그녀를 엄마라고 불렀어요.',
        '한번 새겨진 사랑은, 다시는 되돌릴 수 없었답니다.'],
  mood:{ root:48, mode:'major', prog:[0,5,3,4], bar:8, beat:.5, bright:1300, rest:.35 },
  look:{ bg:'#19110d', hemi:['#ffd9b0','#2a1a12',.45], key:['#ffcf94',.95,[-5,7,5]], p1:['#ffae5c',1.8,[-3.2,2.5,-.3],7], p2:['#bfe4ff',1.3,[0,2.2,.4],4], dust:['#ffd7a0',4.5,.1,.4,.55] },
  ground(g){ G.fill(g, '#c9a27a'); G.boards(g, 'rgba(90,50,20,.25)', .38); G.wash(g, 5, 3.9, 3, 1.3, '#a4574a', .85);
    g.strokeStyle = 'rgba(250,220,170,.5)'; g.lineWidth = .03; g.beginPath(); g.ellipse(5, 3.9, 2.3, .95, 0, 0, TAU); g.stroke(); },
  pieces:[
    { x:0, z:-2.9, w:9.4, h:4.3, draw(g, w, h, S){
        D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#b98552'],[1,'#dcb07a']]));
        D.atop(g, () => { for(let i = 0; i < 24; i++) D.rect(g, 'rgba(120,70,30,.1)', i * .4, 0, .12, h);
          D.window(g, w * .56, h * .14, 2.2, 2.1, '#e9d2a8', D.lg(g, 0, h * .14, 0, h * .14 + 2, [[0,'#101a33'],[1,'#27365a']]), .1);
          D.stars(g, 2, 1.4, 0, 1, '#fff', .01); S.lights = []; const r = rng(8); for(let i = 0; i < 26; i++) S.lights.push([w * .56 + .15 + r() * 1.9, h * .14 + 1.2 + r() * .8]);
          S.lights.forEach(p => D.ell(g, '#ffd58a', p[0], p[1], .018, .018));
          D.rect(g, '#e9d2a8', w * .56 + 1.07, h * .14, .06, 2.1); D.rect(g, '#e9d2a8', w * .56, h * .14 + 1.02, 2.2, .06);
          D.rrf(g, '#6b4428', w * .12, h * .2, .9, .7, .03); D.rrf(g, '#e7d3b0', w * .12 + .08, h * .2 + .08, .74, .54, .02);
          D.rrf(g, '#6b4428', w * .28, h * .25, .6, .8, .03); D.rrf(g, '#cfb28a', w * .28 + .07, h * .25 + .07, .46, .66, .02); }); },
      glow(g, w, h, S){ S.lights.forEach(p => D.ell(g, '#ffcf80', p[0], p[1], .025, .025)); }, ei:1.5 },
    { x:2, z:-1.6, w:3.4, h:1.3, d:.25, draw(g){ D.rrf(g, '#6d3a30', .15, .1, 3.1, .8, .18); D.rrf(g, '#7c4538', 0, .55, 3.4, .55, .15);
        D.rrf(g, '#5e3128', 0, .35, .4, .95, .15); D.rrf(g, '#5e3128', 3.0, .35, .4, .95, .15); D.rect(g, '#3b1f18', .2, 1.18, .08, .12); D.rect(g, '#3b1f18', 3.1, 1.18, .08, .12); } },
    { x:-3.3, z:-.5, w:1, h:3.1, d:.35, draw(g, w, h){ D.rect(g, '#3a2a20', w / 2 - .025, .55, .05, h - .6); D.ell(g, '#3a2a20', w / 2, h - .05, .28, .05); D.poly(g, '#f3d7a0', [.2,.62,.8,.62,.68,.08,.32,.08]); },
      glow(g){ D.poly(g, '#ffbf70', [.2,.62,.8,.62,.68,.08,.32,.08]); }, ei:1.1 },
    { x:-.95, z:.2, w:1.5, h:1.9, d:.5, draw(g, w, h){ D.person(g, .7, h, 1.75, { kind:'woman', pose:'kneel', arms:'out', color:'#7a2f3f', dir:1 }); } },
    { x:.85, z:.25, w:1, h:1.6, d:.6, draw(g, w, h){ D.person(g, .5, h, 1.5, { kind:'child', color:'#2f3a55', dir:-1 }); } },
    { x:3.7, z:1.7, w:1.2, h:.95, d:.7, draw(g){ D.rrf(g, '#5a3a26', .05, .35, 1.1, .1, .03); D.rect(g, '#5a3a26', .15, .42, .07, .53); D.rect(g, '#5a3a26', .98, .42, .07, .53);
        D.rrf(g, '#8a2e2e', .25, .2, .6, .15, .02); D.rrf(g, '#2e4a6a', .3, .06, .5, .14, .02); } }
  ],
  glows: Array.from({ length:7 }, (_, i) => ({ x:-.72 + i * .24, y:2.0 + Math.sin(i / 6 * Math.PI) * .45, z:.3, s:.55, c:'#d6ecff', op:.95, seq:1.6 + i * .9, pulse:1.4 }))
          .concat([{ x:-3.3, y:2.75, z:-.45, s:2.4, c:'#ffc070', op:.6 }])
},
/* 4 */ {
  title:'테디', line:'햇살이 기울 때마다, 데이비드는 엄마에게 편지를 썼어요.',
  narr:['모니카는 마틴이 아끼던 낡은 슈퍼토이, 테디를 데이비드에게 건네주었어요.',
        '테디는 말수가 적었지만, 언제나 데이비드 곁을 지키는 다정한 친구였지요.',
        '햇살이 기울 때면 데이비드는 서툰 글씨로 엄마에게 편지를 썼어요.',
        '엄마를 사랑한다고, 그리고 엄마도 자신을 사랑해 주면 좋겠다고요.'],
  mood:{ root:55, mode:'major', prog:[0,3,4,0], bar:7, beat:.45, bright:1500, rest:.3 },
  look:{ bg:'#16120e', hemi:['#fff0d6','#3a2a1a',.55], key:['#ffe2b0',1.25,[6,7,1]], p1:['#ffd08a',1,[2.6,2.2,-1.5],8], p2:['#fff6e0',.5,[-2,2,1.5],6], dust:['#fff0c8',5,.07,.5,.7] },
  ground(g){ G.fill(g, '#dcbd90'); G.boards(g, 'rgba(120,80,40,.28)', .4);
    G.clear(g, () => { g.globalAlpha = .55; g.beginPath(); g.moveTo(6.2, 1); g.lineTo(8.6, 1); g.lineTo(7.4, 4.6); g.lineTo(4.6, 4.6); g.closePath(); g.fill(); });
    ['#c0504a','#5a8ac0','#e0b040','#6aa07a'].forEach((c, i) => { g.fillStyle = c; g.save(); g.translate(1.6 + i * .5, 4.4 + (i % 2) * .3); g.rotate(i * .5); g.fillRect(-.12, -.12, .24, .24); g.restore(); }); },
  pieces:[
    { x:0, z:-2.9, w:9.4, h:4.4, draw(g, w, h){
        D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#d6dde0'],[1,'#efe9dc']]));
        D.atop(g, () => { const x = w * .6, y = h * .12;
          D.window(g, x, y, 3.2, 2.6, '#fbf6ea', D.lg(g, 0, y, 0, y + 2.6, [[0,'#bfe0f0'],[1,'#f6f0d8']]), .1);
          D.ell(g, '#fff6d8', x + 2.3, y + .8, .35, .35);
          [[.5,'#8fb08a'],[1.2,'#7aa07a'],[1.9,'#8fb08a'],[2.7,'#7aa07a']].forEach(([dx, c]) => D.ell(g, c, x + dx, y + 2.35, .55, .35));
          D.rect(g, '#fbf6ea', x + 1.57, y, .07, 2.6); D.rect(g, '#fbf6ea', x, y + 1.27, 3.2, .07);
          for(let i = 0; i < 30; i++) D.ell(g, 'rgba(160,150,170,.25)', .3 + (i % 10) * .5, .4 + Math.floor(i / 10) * .9, .04, .04); }); },
      glow(g, w, h){ D.rrf(g, '#8a7a5a', w * .6 + .1, h * .12 + .1, 3, 2.4, .02); }, ei:.6 },
    { x:-3, z:-1.4, w:2.6, h:2.4, d:.2, draw(g, w, h){
        D.rect(g, '#9a6a42', .05, 0, .1, h); D.rect(g, '#9a6a42', w - .15, 0, .1, h);
        [.75, 1.5, 2.25].forEach(y => D.rect(g, '#9a6a42', 0, y, w, .08));
        D.rrf(g, '#6a8ab0', .35, .35, .3, .4, .04); D.ell(g, '#6a8ab0', .5, .27, .12, .1); D.poly(g, '#c0504a', [1.05,.75,1.35,.75,1.2,.2]);
        D.ell(g, '#e0b040', 1.8, .58, .17, .17); D.poly(g, '#6aa07a', [.3,1.5,.8,1.5,.8,1.18,.55,.98,.3,1.18]);
        ['#b04a4a','#4a6ab0','#d8a040','#5a9a6a','#8a5ab0'].forEach((c, i) => D.rect(g, c, 1.2 + i * .2, 1.12, .16, .38));
        D.teddy(g, .6, 2.25, .6, '#b58a5a', '#e0c8a0'); D.rrf(g, '#c0504a', 1.3, 1.95, .6, .3, .05); } },
    { x:.9, z:.2, w:2.4, h:1.75, d:.45, draw(g, w, h){
        D.rrf(g, '#a4764c', 1.0, 1.0, 1.35, .09, .03); D.rect(g, '#8a603a', 1.1, 1.05, .07, .7); D.rect(g, '#8a603a', 2.18, 1.05, .07, .7);
        D.rect(g, '#fbf7ee', 1.35, .95, .5, .06);
        D.person(g, .62, h, 1.45, { kind:'child', pose:'out', dir:1, color:'#34405e' }); } },
    { x:-.9, z:.9, w:1, h:1.1, d:.6, draw(g, w, h){ D.teddy(g, .5, h, 1.05, '#9a6a3c', '#d8b58a'); } },
    { x:-.1, z:.6, y0:1.7, w:.55, h:.4, d:1.0, draw(g, w, h){ D.letter(g, w, h); }, anim:letterAnim(0) },
    { x:1.2, z:1.1, y0:2.2, w:.55, h:.4, d:1.15, draw(g, w, h){ D.letter(g, w, h); }, anim:letterAnim(2) },
    { x:2.1, z:.3, y0:2.6, w:.55, h:.4, d:1.3, draw(g, w, h){ D.letter(g, w, h); }, anim:letterAnim(4) }
  ],
  beams:[{ from:[3.2,3.4,-2.8], to:[1.2,0,.6], w:.9, spread:2.4, c:'#fff1c8', op:.22 }, { from:[3.9,3.2,-2.8], to:[2.4,0,1.2], w:.7, spread:2.4, c:'#fff1c8', op:.16 }],
  glows:[{ x:3.2, y:2.7, z:-2.85, s:4, c:'#fff2cc', op:.22 }]
},
/* 5 */ {
  title:'달빛과 가위', line:'금빛 머리카락 한 가닥이 달빛 아래 반짝였어요.',
  narr:['기적처럼 마틴이 깨어나 집으로 돌아왔어요.',
        '진짜 아들이 돌아오자, 데이비드의 자리는 조금씩 흔들리기 시작했지요.',
        '마틴의 부추김에 넘어간 데이비드는, 달빛이 비치는 밤 엄마의 머리카락 한 가닥을 몰래 잘랐어요.',
        '그러면 엄마가 자신을 더 사랑해 줄 거라고 믿었거든요.',
        '가위 소리에 눈을 뜬 엄마의 얼굴에는 놀람과 두려움이 번졌어요.',
        '그 작은 금빛 머리카락은, 테디가 오래도록 몰래 간직하게 된답니다.'],
  mood:{ root:50, mode:'dorian', prog:[0,3,0,6], bar:9, beat:.8, bright:650, rest:.45 },
  look:{ bg:'#0a0e1b', hemi:['#7c8fc8','#0e111c',.35], key:['#9fb6ff',.85,[5,8,-3]], p1:['#dfe8ff',1.2,[2.6,3.2,-2.2],7], p2:['#ffcf70',1.1,[.8,1.5,.8],3.2], dust:['#bcd0ff',3.5,.05,.3,.5] },
  ground(g){ G.fill(g, '#5a6890'); G.wash(g, 5, 3, 5.4, 3.2, '#2e3a60', .8);
    G.clear(g, () => { g.globalAlpha = .45; g.beginPath(); g.moveTo(6.6, 1.4); g.lineTo(8.4, 1.4); g.lineTo(7.8, 4.2); g.lineTo(5.6, 4.2); g.closePath(); g.fill(); }); },
  pieces:[
    { x:0, z:-2.9, w:9.4, h:4.3, draw(g, w, h){
        D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#1b2745'],[1,'#2a3a60']]));
        D.atop(g, () => { const x = w * .62, y = h * .1;
          D.rrf(g, '#23315a', x - .45, 0, .5, h * .78, .1); D.rrf(g, '#23315a', x + 2.55, 0, .5, h * .78, .1);
          D.window(g, x, y, 2.6, 2.6, '#3a4a78', D.lg(g, 0, y, 0, y + 2.6, [[0,'#0c1430'],[1,'#1a2750']]), .09);
          g.save(); g.beginPath(); g.rect(x + .1, y + .1, 2.4, 2.4); g.clip(); D.stars(g, w, h, 60, 2, '#dfe6ff'); g.restore();
          D.ell(g, '#e8edff', x + 1.3, y + .95, .42, .42);
          D.rect(g, '#3a4a78', x + 1.27, y, .06, 2.6); D.rect(g, '#3a4a78', x, y + 1.6, 2.6, .06); }); },
      glow(g, w, h){ D.ell(g, '#d8e2ff', w * .62 + 1.3, h * .1 + .95, .42, .42); }, ei:1.2 },
    { x:-3.8, z:-1.8, w:1.5, h:3.0, d:.2, draw(g, w, h){ D.rect(g, '#141d36', 0, 0, w, h);
        D.rect(g, D.lg(g, 0, 0, 0, h, [[0,'#ffd9a0'],[1,'#e8a860']]), .2, .25, .8, h - .25);
        D.person(g, .62, h, 1.55, { kind:'child', color:'#1c1f2e', dir:1 }); D.poly(g, '#26304f', [1.0,.25,1.35,.1,1.35,h,1.0,h]); },
      glow(g, w, h){ D.rect(g, '#ffb766', .2, .25, .8, h - .25); }, ei:.9 },
    { x:-.6, z:-.9, w:4.2, h:1.6, d:.35, draw(g, w){
        D.bed(g, w, { head:'#34294a', pillow:'#c7cfe8', pillows:[1.25], matt:'#2e3b66', blanket:'#46579a', bx:.75, sleepers:[{ x:1.2, r:.21, hair:'#caa25a', face:'#e6d3bf' }] }); } },
    { x:1.35, z:.65, w:1.1, h:1.65, d:.55, draw(g, w, h){ const hd = D.person(g, .6, h, 1.5, { kind:'child', pose:'reach', dir:-1, color:'#243050' });
        D.ell(g, '#d7deec', hd[0] - .04, hd[1] - .05, .05, .03, .5); D.ell(g, '#d7deec', hd[0] - .04, hd[1] + .04, .05, .03, -.5); D.line(g, '#d7deec', .02, [hd[0] - .04, hd[1], hd[0] - .2, hd[1] - .06]); } }
  ],
  glows:[{ x:2.6, y:3.35, z:-2.85, s:3, c:'#e6eeff', op:.55 }, { x:.86, y:1.45, z:.72, s:.6, c:'#ffd27a', op:.9, pulse:2.2 }, { x:-3.8, y:1.3, z:-1.75, s:2, c:'#ffb766', op:.5 }]
},
/* 6 */ {
  title:'물속의 밤', line:'모두가 떠난 물 밑에서, 아이는 조용히 위를 올려다보았어요.',
  narr:['마틴의 생일, 수영장 곁에 모인 아이들은 데이비드를 둘러싸고 짓궂게 시험했어요.',
        '겁에 질린 데이비드는 마틴에게 매달렸고, 둘은 함께 물속으로 떨어지고 말았지요.',
        '어른들은 허우적대는 마틴을 서둘러 건져 올렸어요.',
        '그리고 물 밑바닥에는, 아무도 돌아보지 않은 데이비드만이 조용히 가라앉아 있었답니다.'],
  mood:{ root:45, mode:'minor', prog:[0,5,6,4], bar:8, beat:.7, bright:800, rest:.4 },
  look:{ bg:'#06111a', hemi:['#5fb6d6','#06131b',.4], key:['#a8d8ff',.7,[-4,8,4]], p1:['#3fd7ff',2.4,[.3,.3,.6],6], p2:['#ffc36a',1.3,[-2,3.2,-2.2],8], dust:['#aeefff',4.5,.5,.12,.55] },
  ground(g){ G.fill(g, '#b4ae9f'); G.wash(g, 5, 3.2, 5.5, 3.2, '#7d7a70', .5);
    D.rect(g, '#2f93b8', 2.5, 2.3, 5.6, 3.6); g.strokeStyle = 'rgba(200,240,250,.45)'; g.lineWidth = .02;
    for(let x = 2.5; x <= 8.1; x += .35){ g.beginPath(); g.moveTo(x, 2.3); g.lineTo(x, 5.9); g.stroke(); }
    for(let y = 2.3; y <= 5.9; y += .35){ g.beginPath(); g.moveTo(2.5, y); g.lineTo(8.1, y); g.stroke(); } },
  pieces:[
    { x:0, z:-3, w:9.6, h:4.3, draw(g, w, h, S){
        D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#0a1826'],[1,'#1a3448']]));
        D.atop(g, () => { D.stars(g, w, h * .5, 50, 6, '#cfe6ff');
          [.4,1.3,2.2,6.4,8.8].forEach((x, i) => D.tree(g, x, h, 2.4 + (i % 2) * .6, '#08131c', i + 2));
          D.rect(g, '#0f1c28', 3.2, h - 2.2, 2.8, 2.2); D.poly(g, '#0f1c28', [3,h - 2.2,4.6,h - 3,6.2,h - 2.2]);
          S.win = [[3.5,h - 1.8,.4,.5],[4.2,h - 1.8,.4,.5],[5.2,h - 1.8,.5,.5],[3.5,h - 1,.4,.5],[5.2,h - 1,.5,.5]];
          S.win.forEach(p => D.rect(g, '#ffcf8a', p[0], p[1], p[2], p[3]));
          g.strokeStyle = '#2a3a4a'; g.lineWidth = .02; g.beginPath(); g.moveTo(0, h * .38); g.quadraticCurveTo(w / 2, h * .62, w, h * .38); g.stroke(); }); },
      glow(g, w, h, S){ S.win.forEach(p => D.rect(g, '#ffb866', p[0], p[1], p[2], p[3])); }, ei:1.3 },
    { x:0, z:-2, w:8.6, h:1.9, d:.2, draw(g, w, h){
        [['man',1.75],['child',1.1],['woman',1.6],['child',1.0],['man',1.82],['woman',1.55],['child',1.15],['man',1.7]].forEach(([k, hh], i) =>
          D.person(g, .5 + i * 1.08, h, hh, { kind:k, color:'#12202c', pose:i % 3 === 0 ? 'hold' : i === 5 ? 'wave' : 'stand', dir:i % 2 ? 1 : -1 })); } },
    { x:.3, z:-1.2, w:5.6, h:1.3, d:.3, draw(g, w, h){ poolWall(g, w, h); } },
    { x:-2.5, z:.6, yaw:Math.PI / 2, w:3.6, h:1.3, d:.35, draw(g, w, h){ poolWall(g, w, h); } },
    { x:3.1, z:.6, yaw:-Math.PI / 2, w:3.6, h:1.3, d:.35, draw(g, w, h){ poolWall(g, w, h); } },
    { x:.5, z:.7, y0:.08, w:1.1, h:1.1, d:.6, draw(g, w, h){ D.person(g, w / 2, h, 1.02, { kind:'child', pose:'open', color:'#2d4b6e' }); },
      anim(pc, t){ pc.mesh.rotation.z = Math.sin(t * .5) * .08; pc.hinge.position.y = pc.base.y + Math.sin(t * .7) * .04; } },
    { x:-3.95, z:1.0, w:1.3, h:2.5, d:.5, draw(g, w, h){ D.person(g, .55, h, 2.35, { kind:'man', pose:'hold', color:'#1a2733' });
        D.rrf(g, '#1a2733', .25, 1.02, .9, .22, .1); D.ell(g, '#1a2733', 1.12, .98, .12, .12); D.line(g, '#1a2733', .06, [.3, 1.15, .18, 1.45]); } }
  ],
  water:[{ x:.3, z:.6, w:5.6, d:3.6, level:1.25, c:'#1a9ac2', op:.5 }],
  glows: Array.from({ length:9 }, (_, i) => { const x = -4 + i; return { x, y:3.25 - Math.sin((x + 4.8) / 9.6 * Math.PI) * 1.05, z:-2.9, s:.42, c:'#ffc56e', op:.85, flicker:1 }; })
          .concat([{ x:.3, y:.55, z:.6, s:3.2, c:'#3fd7ff', op:.45 }])
},
/* 7 */ {
  title:'숲에 남겨진 아이', line:'붉은 불빛이 안개 속으로 멀어져 갔어요.',
  narr:['위험한 아이라는 이유로, 데이비드는 만들어진 곳으로 돌려보내져 폐기될 처지가 되었어요.',
        '차마 그럴 수 없었던 모니카는 그를 깊은 숲으로 데려가 홀로 내려두었지요.',
        '데이비드는 울며 매달렸지만, 자동차의 붉은 불빛은 안개 속으로 멀어져 갔어요.',
        '테디와 단둘이 남은 숲에서, 데이비드는 엄마가 읽어 주던 피노키오 이야기를 떠올렸어요.',
        '푸른 요정을 찾으면, 자신도 진짜 아이가 될 수 있을지 모른다고요.'],
  mood:{ root:45, mode:'minor', prog:[0,3,5,4], bar:10, beat:1.0, bright:550, rest:.5 },
  look:{ bg:'#0d1411', fog:.7, hemi:['#9cb8a8','#0b110f',.38], key:['#dfe9ff',.75,[-3,9,-4]], p1:['#ff3b2f',1.6,[-3.4,.6,-1.3],5], p2:['#cfe8ff',.6,[1,3,1],7], dust:['#dfeee6',7,.03,.6,.32] },
  ground(g){ G.fill(g, '#76846a'); G.wash(g, 5, 3, 5.6, 3.3, '#3e4c3a', .7);
    g.strokeStyle = 'rgba(200,185,150,.85)'; g.lineWidth = .7; g.lineCap = 'round'; g.beginPath(); g.moveTo(1.2, 1.9); g.bezierCurveTo(3.2, 2.6, 4.6, 3.4, 5.6, 5.8); g.stroke();
    G.dots(g, 'rgba(120,80,40,.4)', 160, 12, 0, 0, 10, 6, .02, .06); },
  pieces:[
    { x:0, z:-3, w:9.6, h:4.8, draw(g, w, h){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#7f998f'],[1,'#c3d2ca']]));
        D.atop(g, () => { D.ell(g, 'rgba(238,243,240,.8)', w * .74, h * .2, .35, .35); D.trunks(g, 0, w, h, .2, 18, 3, '#9db1a8', .08, .16); }); } },
    { x:0, z:-2.1, w:9.4, h:4.4, d:.15, draw(g, w, h){ D.trunks(g, 0, w, h, .1, 11, 5, '#4b615a', .12, .24); D.rect(g, '#4b615a', 0, h - .14, w, .14);
        const r = rng(7); for(let i = 0; i < 22; i++) D.ell(g, '#3f544e', r() * w, .15 + r() * .9, .35 + r() * .4, .18 + r() * .2); } },
    { x:-2.3, z:-1.35, w:1.7, h:.8, d:.4, draw(g, w, h){ D.car(g, .85, h, 1.6, '#1a2127'); D.ell(g, '#ff5040', 1.62, h - .3, .05, .04); },
      glow(g, w, h){ D.ell(g, '#ff4030', 1.62, h - .3, .07, .05); }, ei:1.6,
      anim(pc, t, tt){ pc.hinge.position.x = pc.base.x - Math.min(1.7, Math.max(0, tt - 2) * .16); } },
    { x:-3.9, z:-.5, w:2.3, h:4.3, d:.25, draw(g, w, h){ D.trunks(g, 0, w, h, .05, 3, 11, '#1d2a27', .22, .34); D.rect(g, '#1d2a27', 0, h - .1, w, .1); } },
    { x:4.0, z:-.2, w:2, h:4.5, d:.3, draw(g, w, h){ D.trunks(g, 0, w, h, .05, 2, 13, '#1a2624', .24, .34); D.rect(g, '#1a2624', 0, h - .1, w, .1);
        const r = rng(4); for(let i = 0; i < 10; i++) D.ell(g, '#1a2624', r() * w, .2 + r() * .8, .3 + r() * .3, .16 + r() * .14); } },
    { x:.6, z:.9, w:1.6, h:1.45, d:.6, draw(g, w, h){ D.person(g, .55, h, 1.35, { kind:'child', pose:'out', dir:-1, color:'#22302e' }); D.teddy(g, 1.2, h, .6, '#6b4b30', '#a7825a'); } }
  ],
  beams:[{ from:[1.6,5.2,-2.7], to:[.9,0,.8], w:.8, spread:2.2, c:'#e4efff', op:.14 }, { from:[-.8,5.2,-2.4], to:[-1.2,0,.6], w:.6, spread:2.4, c:'#e4efff', op:.1 }],
  glows:[{ x:2.3, y:3.8, z:-3.05, s:2.8, c:'#e6f0ec', op:.35 }]
},
/* 8 */ {
  title:'달이 뜨는 밤', line:'가장 밝은 달빛이, 가장 차가운 사냥꾼이었어요.',
  narr:['그날 밤 숲 위로 떠오른 것은 달이 아니었어요.',
        '버려진 메카들을 사냥하는 거대한 기구였지요.',
        '붙잡힌 데이비드는 그곳에서 떠돌이 메카, 지골로 조를 만났어요.',
        '사람들이 환호하며 메카들을 부수던 축제의 무대 위에서, 살려 달라며 우는 데이비드의 모습은 너무도 사람 같았어요.',
        '술렁이는 관중 사이로, 조와 데이비드와 테디는 어둠 속으로 달아났답니다.'],
  mood:{ root:43, mode:'minor', prog:[0,6,5,6], bar:7, beat:.55, bright:900, rest:.35 },
  look:{ bg:'#0b0915', hemi:['#8a86b8','#130d13',.35], key:['#ffe8c8',.85,[0,9,-3]], p1:['#fff1d0',2.2,[1.6,4.4,-2],9], p2:['#ff7a3a',1.6,[-2.5,1.2,-.8],6], dust:['#ffb070',4,.35,.5,.6] },
  ground(g){ G.fill(g, '#8e6e50'); G.wash(g, 5, 3, 5.5, 3.2, '#4e3a2c', .6);
    g.strokeStyle = 'rgba(240,220,180,.35)'; g.lineWidth = .04; g.beginPath(); g.ellipse(5, 3.4, 3.6, 1.5, 0, 0, TAU); g.stroke();
    G.dots(g, 'rgba(60,40,25,.35)', 120, 21, 0, 0, 10, 6, .02, .05); },
  pieces:[
    { x:0, z:-3.1, w:9.6, h:4.8, draw(g, w, h){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#0c0a1e'],[1,'#2a2142']]));
        D.atop(g, () => { D.stars(g, w, h * .6, 80, 9, '#f0e8ff'); const r = rng(14); for(let x = 0; x < w; x += .38) D.pine(g, x + r() * .2, h, .8 + r() * .9, '#120f22'); }); } },
    { x:1.6, z:-2.35, y0:1.1, w:2.8, h:3.0, d:.2, draw(g, w, h, S){
        D.line(g, '#8a7a6a', .015, [1.0, 2.3, 1.2, 2.62]); D.line(g, '#8a7a6a', .015, [1.8, 2.3, 1.6, 2.62]);
        D.moon(g, 1.4, 1.25, 1.15, '#f6ecd0', '#d8c49a'); D.rrf(g, '#2a2230', 1.08, 2.6, .64, .36, .06);
        S.bulbs = []; for(let i = 0; i < 18; i++){ const a = i / 18 * TAU; S.bulbs.push([1.4 + Math.cos(a) * 1.08, 1.25 + Math.sin(a) * 1.08]); }
        S.bulbs.forEach(p => D.ell(g, '#fff6dc', p[0], p[1], .035, .035)); },
      glow(g, w, h, S){ D.ell(g, 'rgba(255,236,190,.55)', 1.4, 1.25, 1.1, 1.1); S.bulbs.forEach(p => D.ell(g, '#ffffff', p[0], p[1], .045, .045)); D.rect(g, '#ffcf80', 1.15, 2.68, .5, .1); }, ei:1,
      anim(pc, t, tt){ pc.hinge.position.y = pc.base.y + .5 * easeOut(clamp(tt / 6)) + Math.sin(t * .6) * .07; } },
    { x:0, z:-1.2, w:9, h:1.7, d:.3, draw(g, w, h){ D.crowd(g, 0, w, h, 34, .9, 1.5, '#1a1322', 31);
        for(let x = .1; x < w; x += .45) D.rect(g, '#241c2c', x, h - .55, .06, .55); D.rect(g, '#241c2c', 0, h - .5, w, .05); } },
    { x:-3.2, z:-.3, w:2, h:1.9, d:.4, draw(g, w, h){ D.rrf(g, '#2a2432', 0, h - .2, w, .2, .04);
        D.person(g, .55, h - .2, 1.3, { kind:'man', color:'#56526a', pose:'wave', dir:-1 }); D.person(g, 1.35, h - .2, 1.1, { kind:'woman', color:'#4a4660' });
        D.cut(g, () => { g.beginPath(); g.arc(.62, .98, .09, 0, TAU); g.fill(); g.beginPath(); g.arc(1.42, 1.38, .07, 0, TAU); g.fill(); });
        for(let x = .06; x < w; x += .2) D.rect(g, '#3d3549', x, 0, .04, h - .2); D.rect(g, '#3d3549', 0, 0, w, .06); } },
    { x:1.0, z:.9, w:2.4, h:2.35, d:.55, draw:trio('#2a2430', '#283048') }
  ],
  beams:[{ from:[1.6,1.6,-2.3], to:[-1.2,0,.4], w:.25, spread:5, c:'#fff4dc', op:.2 }, { from:[1.6,1.6,-2.3], to:[2.8,0,.9], w:.25, spread:5, c:'#fff4dc', op:.16 }, { from:[1.6,1.6,-2.3], to:[.6,0,1.6], w:.25, spread:5, c:'#fff4dc', op:.14 }],
  glows:[{ x:1.6, y:2.7, z:-2.4, s:5.5, c:'#fff0cc', op:.5 }, { x:-2.5, y:.6, z:-.9, s:1.6, c:'#ff7a3a', op:.6, flicker:1 }]
},
/* 9 */ {
  title:'루즈 시티', line:'꺼지지 않는 불빛 사이로, 수수께끼 같은 대답이 돌아왔어요.',
  narr:['조는 데이비드를 네온이 꺼지지 않는 도시, 루즈 시티로 데려갔어요.',
        '무엇이든 대답해 준다는 닥터 노우에게, 푸른 요정이 어디 있는지 묻기 위해서였지요.',
        '수많은 불빛 사이로 돌아온 대답은 한 편의 수수께끼 같은 시였어요.',
        '물에 잠긴 세상의 끝, 바다 너머 무너진 도시로 가면 요정을 만날 수 있으리라는.',
        '데이비드의 마음은 그 한 줄의 희망으로 가득 찼답니다.'],
  mood:{ root:51, mode:'mixolydian', prog:[0,6,3,0], bar:6, beat:.4, bright:1800, rest:.3 },
  look:{ bg:'#11071a', hemi:['#ff7ad9','#12081a',.35], key:['#c7a6ff',.6,[-4,8,5]], p1:['#ff3fa8',2.2,[-1.5,2.2,-1.2],8], p2:['#3ff0ff',2.0,[2.7,1.6,.6],6], dust:['#ff9ef0',3.5,.2,.6,.65] },
  ground(g){ G.fill(g, '#56466a'); G.wash(g, 5, 3, 5.4, 3.2, '#2c1e3c', .7);
    const r = rng(17); for(let i = 0; i < 26; i++){ const x = r() * 10; g.fillStyle = hexA(r() < .5 ? '#ff6fc8' : '#5fe6f0', .5); g.fillRect(x, 1 + r() * 2, .05 + r() * .08, 1 + r() * 2.4); } },
  pieces:[
    { x:0, z:-3.1, w:9.6, h:4.8, draw(g, w, h, S){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#180c2c'],[1,'#3a1a4a']]));
        D.atop(g, () => { D.stars(g, w, h * .4, 30, 19, '#ffd8f6');
          S.win = D.skyline(g, 0, w, h, { hmin:1.6, hmax:4.0, wmin:.5, wmax:1.1, c:'#22123a', seed:23, win:.16, lit:['#ff6fc8','#5fe6f0','#ffc070'] });
          S.neon = [[1.4,1.4,.28,'#ff4fb8'],[6.8,1.1,.22,'#3ff0ff'],[4.6,.9,.18,'#ffc070']];
          S.neon.forEach(n => { g.strokeStyle = n[3]; g.lineWidth = .05; g.beginPath(); g.arc(n[0], n[1], n[2], 0, TAU); g.stroke(); }); }); },
      glow(g, w, h, S){ D.wins(g, S.win); S.neon.forEach(n => { g.strokeStyle = n[3]; g.lineWidth = .07; g.beginPath(); g.arc(n[0], n[1], n[2], 0, TAU); g.stroke(); }); }, ei:1.4 },
    { x:-.8, z:-1.6, w:4.6, h:3.4, d:.2, draw(g, w, h){
        g.beginPath(); archPath(g, .2, h, w - .4, 3.2); g.fillStyle = '#2a1640'; g.fill();
        D.cut(g, () => { g.beginPath(); archPath(g, .6, h, w - 1.2, 2.72); g.fill(); });
        neonArch(g, w, h, .05); },
      glow(g, w, h){ neonArch(g, w, h, .08); }, ei:1.5 },
    { x:2.7, z:.1, w:1.8, h:2.5, d:.4, draw(g, w, h){ D.rrf(g, '#221a38', .3, h - .2, 1.2, .2, .04); D.rrf(g, '#2a1f44', .62, 1.3, .56, 1.05, .06);
        g.beginPath(); g.arc(.9, .8, .74, 0, TAU); g.fillStyle = '#2a1f44'; g.fill();
        g.beginPath(); g.arc(.9, .8, .66, 0, TAU); g.fillStyle = D.rg(g, .9, .8, .05, .66, [[0,'#c8fbff'],[.6,'#3fb8e0'],[1,'#1a3a7a']]); g.fill();
        drawKnow(g, '#effeff'); },
      glow(g){ g.beginPath(); g.arc(.9, .8, .66, 0, TAU); g.fillStyle = '#1f9fc8'; g.fill(); drawKnow(g, '#ffffff'); }, ei:1.2 },
    { x:-1.4, z:1.0, w:2.4, h:2.35, d:.55, draw:trio('#2a1f3a', '#281e38') }
  ],
  glows:[{ x:-.8, y:2.3, z:-1.5, s:3.8, c:'#ff4fb8', op:.35 }, { x:2.7, y:1.7, z:.25, s:2.8, c:'#3ff0ff', op:.5, pulse:1.2 }]
},
/* 10 */ {
  title:'세상의 끝', line:'세상에 하나뿐인 줄 알았던 아이가, 처음으로 외로움을 알았어요.',
  narr:['조와 데이비드는 물에 잠긴 맨해튼, 무너진 빌딩 숲에 닿았어요.',
        '가장 높은 탑 꼭대기에서, 데이비드는 자신을 만든 하비 교수를 만났지요.',
        '그리고 그곳에서, 자신과 똑같은 얼굴을 한 아이들이 상자 속에 나란히 잠들어 있는 것을 보았어요.',
        '세상에 하나뿐인 줄 알았던 아이는, 그날 처음으로 부서질 듯한 외로움을 알았어요.',
        '데이비드는 높은 창가에서, 깊은 바다를 향해 조용히 떨어져 내렸답니다.'],
  mood:{ root:52, mode:'minor', prog:[0,5,2,6], bar:10, beat:.9, bright:700, rest:.45 },
  look:{ bg:'#18121a', hemi:['#ffc9a0','#18121a',.45], key:['#ffb07a',1.1,[-6,4,-4]], p1:['#ffd8a8',1.2,[2.4,3.4,-1.2],6], p2:['#8fb8ff',.6,[0,1.2,2],6], dust:['#ffd8c0',6,.04,.4,.3] },
  ground(g){ G.fill(g, '#cfc3c2'); D.rect(g, '#8e7a90', 0, 0, 10, 3.1); G.wash(g, 3, 1.4, 3, 1.4, '#e0a070', .5); G.ripples(g, 'rgba(255,230,200,.5)', 40, 8, 3); },
  pieces:[
    { x:0, z:-3.1, w:9.6, h:4.8, draw(g, w, h){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#3b2a4a'],[.6,'#b86a5a'],[1,'#f2b27a']]));
        D.atop(g, () => { D.ell(g, '#ffe0a8', w * .24, h * .74, .5, .5); for(let i = 0; i < 6; i++) D.ell(g, 'rgba(232,154,122,.35)', w * (.1 + i * .16), h * (.4 + (i % 2) * .12), 1.1, .08);
          const r = rng(2); for(let i = 0; i < 7; i++){ const x = 5 + r() * 3, y = .8 + r() * 1.2; D.line(g, '#3a2a3a', .018, [x - .08, y - .04, x, y, x + .08, y - .04]); } }); },
      glow(g, w, h){ D.ell(g, '#ffb070', w * .24, h * .74, .5, .5); }, ei:.8 },
    { x:0, z:-2.3, w:9.4, h:3.8, d:.15, draw(g, w, h){ const r = rng(29);
        for(let i = 0; i < 9; i++){ const x = .3 + i * 1.02 + r() * .3, bw = .45 + r() * .4, bh = 1.5 + r() * 2.1; g.save(); g.translate(x + bw / 2, h); g.rotate((r() - .5) * .12);
          D.rect(g, '#5e4050', -bw / 2, -bh, bw, bh); D.rect(g, '#5e4050', -bw * .32, -bh - .22, bw * .64, .24); D.rect(g, '#5e4050', -bw * .16, -bh - .4, bw * .32, .2); D.rect(g, '#5e4050', -.015, -bh - .7, .03, .32); g.restore(); } } },
    { x:2.4, z:-1.0, w:1.9, h:4.3, d:.3, draw(g, w, h){ D.rect(g, '#3a2838', .3, 1.2, 1.3, h - 1.2); D.rect(g, '#3a2838', .45, .7, 1.0, .6); D.rect(g, '#3a2838', .62, .35, .66, .4); D.rect(g, '#3a2838', .93, 0, .04, .4);
        D.rect(g, '#ffd9a0', .52, .85, .86, .18); for(let j = 0; j < 9; j++) D.rect(g, 'rgba(255,217,160,.25)', .45, 1.5 + j * .3, 1.0, .05); },
      glow(g){ D.rect(g, '#ffc880', .52, .85, .86, .18); }, ei:1.3 },
    { x:-1.7, z:.5, w:4.8, h:1.55, d:.45, draw(g){ for(let i = 0; i < 5; i++){ const x = .1 + i * .94; D.rrf(g, '#d9d3e6', x, .03, .84, 1.5, .05); D.rrf(g, '#9fb2d0', x + .06, .09, .72, 1.38, .03);
          D.person(g, x + .42, 1.44, 1.2, { kind:'child', color:'#4a5670' }); } },
      glow(g){ for(let i = 0; i < 5; i++) D.rrf(g, '#43527a', .16 + i * .94, .09, .72, 1.38, .03); }, ei:.6 },
    { x:1.7, z:1.45, w:.85, h:1.3, d:.7, draw(g, w, h){ D.person(g, w / 2, h, 1.25, { kind:'child', dir:-1, color:'#2a2f45' }); } }
  ],
  water:[{ x:0, z:-2.0, w:10, d:3.0, level:.5, c:'#6a5a78', op:.55 }],
  glows:[{ x:-2.4, y:1.9, z:-3.15, s:4.5, c:'#ffb070', op:.7 }, { x:2.4, y:3.35, z:-.95, s:1.5, c:'#ffd9a0', op:.7 }, { x:-1.7, y:.8, z:.6, s:3.8, c:'#bcd4ff', op:.2 }]
},
/* 11 */ {
  title:'푸른 요정', line:'불빛이 하나둘 꺼질 때까지, 아이는 빌고 또 빌었어요.',
  narr:['바다 깊은 곳, 옛 놀이공원의 폐허 속에서 데이비드는 마침내 푸른 요정을 만났어요.',
        '데이비드를 구해 낸 조는, 뒤쫓아 온 이들에게 붙잡혀 하늘 너머로 사라졌지요.',
        '데이비드는 작은 잠수정을 타고 다시 요정 앞으로 내려갔어요.',
        '무너진 관람차가 길을 막아 버렸지만, 아이는 두 손을 모으고 빌고 또 빌었어요.',
        '진짜 아이가 되게 해 달라고, 잠수정의 불빛이 모두 꺼질 때까지요.'],
  mood:{ root:50, mode:'lydian', prog:[0,1,4,0], bar:11, beat:1.0, bright:900, rest:.4 },
  look:{ bg:'#03101d', fog:.75, hemi:['#3fa0d8','#020810',.45], key:['#8fd4ff',.8,[2,9,2]], p1:['#7fdcff',2.6,[-.3,2.2,-.4],7], p2:['#fff0b0',1.5,[1.5,1,1.4],5], dust:['#bfefff',4.5,.3,.2,.55] },
  ground(g){ G.fill(g, '#7ea0a2'); G.wash(g, 5, 3, 5.6, 3.3, '#2a5a6e', .7);
    G.clear(g, () => { g.globalAlpha = .35; g.strokeStyle = '#000'; g.lineWidth = .03; const r = rng(33);
      for(let i = 0; i < 40; i++){ const x = r() * 10, y = r() * 5.8; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + .2, y - .2, x + .4, y + .2, x + .6, y); g.stroke(); } }); },
  pieces:[
    { x:0, z:-3.1, w:9.6, h:4.8, draw(g, w, h){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#0b3d5c'],[1,'#041829']]));
        D.atop(g, () => { [[1.5,.9],[4.4,1.1],[7.4,.8]].forEach(([x, s]) => D.poly(g, 'rgba(160,220,255,.1)', [x - .3 * s, 0, x + .3 * s, 0, x + 1.2 * s, h, x - 1.2 * s, h]));
          [[.6,1.6],[1.4,2.2],[7.8,1.8],[8.8,1.3]].forEach(([x, hh]) => { D.rect(g, '#0a2c44', x - .25, h - hh, .5, hh); D.poly(g, '#0a2c44', [x - .32, h - hh, x, h - hh - .5, x + .32, h - hh]); }); }); } },
    { x:-1.6, z:-2.3, w:4.6, h:4.6, d:.15, draw(g, w, h){ g.save(); g.translate(w / 2, h); g.rotate(-.18);
        D.line(g, '#2a6a86', .09, [-1.2, 0, 0, -2.3, 1.2, 0]); D.wheel(g, 0, -2.3, 1.9, '#2a6a86', .07); g.restore();
        G.dots(g, 'rgba(90,160,120,.5)', 60, 3, .3, .3, w - .3, h - .2, .02, .05); } },
    { x:2.9, z:-1.5, w:3.2, h:2.2, d:.25, draw(g, w, h){ const y = x => h * (.42 - .28 * Math.sin(x / w * 5.5)); const pts = [];
        for(let x = 0; x <= w + .01; x += .1) pts.push(x, y(x)); D.line(g, '#1f4f68', .06, pts);
        for(let x = .1; x < w; x += .32){ D.line(g, '#1f4f68', .035, [x, y(x), x, h]); D.line(g, '#1f4f68', .02, [x, y(x) + .1, x + .32, h]); } } },
    { x:-.3, z:-.4, w:1.7, h:2.9, d:.35, draw(g, w, h){ D.rrf(g, '#2a4a60', .3, h - .25, 1.1, .25, .04); D.fairy(g, w / 2, h - .22, 2.62, '#bfeaff', '#3f86c8'); },
      glow(g, w, h){ D.fairy(g, w / 2, h - .22, 2.62, '#4aa8e8', '#1a5a9a'); D.star(g, '#ffffff', w / 2 + 2.62 * .27, h - .22 - 2.62 * .985, .1); }, ei:.9 },
    { x:-3.7, z:.7, w:1, h:2, d:.5, draw(g, w, h){ D.weed(g, w, h, '#1f5a4a', 5); }, anim:swayAnim(.07, .9, 0) },
    { x:4.0, z:.4, w:1, h:1.8, d:.55, draw(g, w, h){ D.weed(g, w, h, '#23604e', 9); }, anim:swayAnim(.08, .8, 2) },
    { x:2.3, z:1.0, y0:.35, w:1.8, h:1.2, d:.6, draw(g){ D.sub(g, .9, .62, 1.5, '#c9a24a', '#bfe8ff', -1, (x, y) => D.person(g, x, y + .17, .34, { kind:'child', pose:'pray', color:'#2a3a55' })); },
      glow(g){ D.ell(g, '#fff3c0', .9 - .78, .62 + .075, .09, .075); }, ei:1.5,
      anim(pc, t){ pc.hinge.position.y = pc.base.y + Math.sin(t * .8) * .05; } }
  ],
  beams:[{ from:[-3,5.4,-2.6], to:[-2.4,0,.5], w:.7, spread:2.2, c:'#bfe8ff', op:.12 }, { from:[.4,5.4,-2.6], to:[.1,0,.8], w:.8, spread:2.2, c:'#bfe8ff', op:.14 },
         { from:[3,5.4,-2.6], to:[3.4,0,.5], w:.6, spread:2.2, c:'#bfe8ff', op:.1 }, { from:[1.52,.86,1.05], to:[-.2,1.2,-.3], w:.18, spread:6, c:'#fff3c0', op:.3 }],
  glows:[{ x:-.3, y:2.45, z:-.3, s:3, c:'#8fe0ff', op:.55, pulse:.8 }, { x:1.52, y:.86, z:1.08, s:.8, c:'#fff3c0', op:.8 }]
},
/* 12 */ {
  title:'이천 년의 얼음', line:'모든 것이 얼어붙은 뒤에도, 아이의 기도는 멈추지 않았어요.',
  narr:['시간이 흘러 바다는 얼어붙었고, 사람들은 모두 세상에서 사라졌어요.',
        '이천 년이 지난 어느 날, 아주 먼 미래의 메카들이 얼음 속에서 데이비드를 찾아냈지요.',
        '그는 여전히 두 손을 모은 채, 푸른 요정을 바라보고 있었어요.',
        '깨어난 데이비드가 손을 뻗자, 얼어붙은 요정은 조용히 부서져 내렸어요.',
        '인간을 기억하는 마지막 존재였기에, 메카들은 아이의 기억을 소중히 들여다보았답니다.'],
  mood:{ root:49, mode:'lydian', prog:[0,4,5,1], bar:12, beat:1.1, bright:1200, rest:.5 },
  look:{ bg:'#08111d', hemi:['#cfe8ff','#18222f',.6], key:['#e6f2ff',1.05,[-4,9,3]], p1:['#7ff0d0',1.4,[0,4.2,-2.6],10], p2:['#bfe6ff',1.4,[1.7,1.5,.9],5], dust:['#ffffff',4,-.35,.5,.75] },
  ground(g){ G.fill(g, '#cfdeea'); G.wash(g, 5, 3, 5.4, 3.2, '#8fb0c8', .6);
    g.strokeStyle = 'rgba(90,120,150,.5)'; g.lineWidth = .02; const r = rng(41);
    for(let i = 0; i < 18; i++){ let x = r() * 10, y = r() * 5.6; g.beginPath(); g.moveTo(x, y); for(let k = 0; k < 4; k++){ x += (r() - .5) * .8; y += (r() - .3) * .5; g.lineTo(x, y); } g.stroke(); } },
  pieces:[
    { x:0, z:-3.1, w:9.6, h:4.8, draw(g, w, h){ D.arch(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#040a1c'],[1,'#10233f']]));
        D.atop(g, () => { D.stars(g, w, h * .8, 120, 43, '#eef6ff'); aurora(g, w, h, .55); }); },
      glow(g, w, h){ aurora(g, w, h, .8); }, ei:1.1 },
    { x:0, z:-2.2, w:9.4, h:1.9, d:.15, draw(g, w, h){ const r = rng(47), p = [0, h];
        for(let x = 0; x <= w; x += .35) p.push(x, .2 + r() * (h - .5)); p.push(w, h); D.poly(g, '#e3f0fa', p);
        D.atop(g, () => { for(let i = 0; i < 14; i++){ const x = r() * w; D.poly(g, 'rgba(150,190,220,.45)', [x, h, x + .3, .4 + r() * .8, x + .6, h]); } }); } },
    { x:-1.8, z:-1.0, w:3.4, h:2.5, d:.3, draw(g, w, h){ D.poly(g, '#b9d8ee', [.1,h,0,.9,.4,.2,1.4,0,2.6,.25,3.3,.8,3.4,h]);
        D.atop(g, () => { D.poly(g, 'rgba(255,255,255,.35)', [.4,.2,1.4,0,1.1,1.2,.2,1.4]);
          g.globalAlpha = .55; D.wheel(g, 2.4, 1.1, .75, '#7ea6c4', .04); D.fairy(g, 1.1, h - .1, 1.6, '#9cc3de', '#7aa6c8');
          D.sub(g, 1.8, h - .45, .7, '#a3b08e', '#d5eef8', -1); g.globalAlpha = 1; }); } },
    { x:1.7, z:.4, w:3.0, h:3.2, d:.45, draw(g, w, h){ const gr = D.lg(g, 0, 0, 0, h, [[0,'#f2f8fc'],[1,'#b8cfe0']]);
        D.person(g, .6, h, 3.0, { kind:'mecha', color:gr, pose:'hold', dir:1 }); D.person(g, 1.5, h, 2.7, { kind:'mecha', color:gr, dir:-1 }); D.person(g, 2.4, h, 2.9, { kind:'mecha', color:gr, pose:'out', dir:-1 }); },
      glow(g, w, h){ D.person(g, .6, h, 3.0, { kind:'mecha', color:'#3a7a98', pose:'hold', dir:1 }); D.person(g, 1.5, h, 2.7, { kind:'mecha', color:'#3a7a98', dir:-1 }); D.person(g, 2.4, h, 2.9, { kind:'mecha', color:'#3a7a98', pose:'out', dir:-1 }); }, ei:.5 },
    { x:-.3, z:1.25, w:.85, h:1.3, d:.65, draw(g, w, h){ D.person(g, w / 2, h, 1.25, { kind:'child', pose:'pray', color:'#34425e' }); } }
  ],
  glows:[{ x:1.7, y:1.7, z:.5, s:3.6, c:'#c8f6ff', op:.35 }, { x:0, y:3.7, z:-3.2, s:7, c:'#7ff0d0', op:.18, pulse:.4 }]
},
/* 13 */ {
  title:'단 하루', line:'허락된 시간은 단 하루, 그래서 더 눈부신 하루였어요.',
  narr:['메카들은 데이비드의 기억을 따라, 그리운 집을 다시 지어 주었어요.',
        '테디가 오래도록 간직해 온 금빛 머리카락 한 가닥 덕분에, 엄마를 다시 불러올 수 있었지요.',
        '하지만 허락된 시간은 단 하루뿐이었어요.',
        '둘은 함께 그림을 그리고, 숨바꼭질을 하고, 촛불을 켠 케이크 앞에 마주 앉았어요.',
        '그리고 저녁 무렵, 엄마는 데이비드가 평생 기다려 온 말을 들려주었답니다.'],
  mood:{ root:53, mode:'major', prog:[0,5,3,4], bar:7, beat:.5, bright:1600, rest:.3 },
  look:{ bg:'#1b130b', hemi:['#ffe0b0','#3a2614',.6], key:['#ffd28a',1.35,[6,6,3]], p1:['#ffb45a',2.0,[.2,1.7,-.1],5], p2:['#fff0d0',.8,[-3,3,-1],7], dust:['#ffd88a',5,.1,.5,.75] },
  ground(g){ G.fill(g, '#d8ab78'); G.boards(g, 'rgba(120,70,30,.25)', .4); G.wash(g, 5, 3.6, 3.4, 1.4, '#c4674a', .8);
    [['#f2b544',1.4,4.6],['#5aa4d6',8.2,4.4],['#e2574c',7.6,5.0]].forEach(([c, x, y], i) => { g.save(); g.translate(x, y); g.rotate(i - 1); D.rect(g, '#fbf6ea', -.28, -.2, .56, .4); D.ell(g, c, 0, 0, .1, .1); g.restore(); }); },
  pieces:[
    { x:0, z:-2.9, w:9.4, h:4.3, draw(g, w, h){ D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#e8c690'],[1,'#f3dcae']]));
        D.atop(g, () => { [1.0, 6.6].forEach(x => D.window(g, x, .5, 1.8, 2.2, '#fff4dc', D.lg(g, 0, .5, 0, 2.7, [[0,'#ffe7b0'],[1,'#ffc97a']]), .09));
          [[3.5,.9,'#f2b544'],[4.4,.7,'#5aa4d6'],[5.3,1.0,'#e2574c']].forEach(([x, y, c]) => { D.rect(g, '#fbf7ee', x, y, .7, .55); D.ell(g, c, x + .35, y + .22, .12, .12);
            D.line(g, '#4a6a9a', .02, [x + .15, y + .5, x + .15, y + .35]); D.line(g, '#9a3f4a', .02, [x + .5, y + .5, x + .5, y + .3]); }); }); },
      glow(g){ [1.0, 6.6].forEach(x => D.rrf(g, '#ffd79a', x + .09, .59, 1.62, 2.02, .02)); }, ei:.8 },
    { x:0, z:-2.1, y0:2.7, w:7, h:.75, d:.2, draw(g, w){ const cols = ['#e2574c','#f2b544','#5aa4d6','#7cc27a','#c77dd8'], y = x => .1 + Math.sin(x / w * Math.PI) * .18, pts = [];
        for(let x = 0; x <= w; x += .1) pts.push(x, y(x)); D.line(g, '#7a5a3a', .025, pts);
        for(let i = 0; i < 13; i++){ const x = .3 + i * (w - .6) / 12, yy = y(x); D.poly(g, cols[i % 5], [x - .2, yy, x + .2, yy, x, yy + .45]); } },
      anim:swayAnim(.012, .7, 1) },
    { x:.2, z:-1.1, w:4.4, h:2.5, d:.35, draw(g, w, h){ D.person(g, 1.1, h, 2.35, { kind:'woman', pose:'hold', color:'#9a3f4a', dir:1 }); D.person(g, 3.2, h, 1.55, { kind:'child', pose:'hold', color:'#3a4a6a', dir:-1 }); } },
    { x:.2, z:-.3, w:3.4, h:1.4, d:.5, draw(g){ D.rect(g, '#8a5a3a', .05, .66, 3.3, .08); D.rrf(g, '#f4ece0', .1, .72, 3.2, .68, .06);
        D.rrf(g, '#f7e8ea', 1.15, .42, 1.1, .32, .05); D.rrf(g, '#f7e8ea', 1.35, .2, .7, .24, .05);
        for(let i = 0; i < 7; i++) D.ell(g, '#e9a6b4', 1.2 + i * .16, .44, .06, .05); for(let i = 0; i < 5; i++) D.ell(g, '#e9a6b4', 1.4 + i * .15, .22, .05, .04);
        for(let i = 0; i < 5; i++) D.rect(g, '#fff6e8', 1.42 + i * .14, .05, .035, .16);
        D.ell(g, '#e8dccb', .55, .7, .3, .06); D.ell(g, '#e8dccb', 2.85, .7, .3, .06); } },
    { x:-2.9, z:1.0, w:1, h:1.1, d:.65, draw(g, w, h){ D.teddy(g, .5, h, 1.05, '#9a6a3c', '#d8b58a'); } }
  ],
  glows: Array.from({ length:5 }, (_, i) => ({ x:-.06 + i * .14, y:1.43, z:-.27, s:.32, c:'#ffb45a', op:.95, flicker:1 }))
          .concat([{ x:-2.8, y:2.6, z:-2.85, s:3, c:'#ffe2a8', op:.35 }, { x:2.8, y:2.6, z:-2.85, s:3, c:'#ffe2a8', op:.35 }])
},
/* 14 */ {
  title:'꿈이 시작되는 곳', line:'그렇게, 아이는 처음으로 꿈을 꾸었어요.', end:true,
  narr:['밤이 깊어지자, 엄마는 조용히 잠이 들었어요.',
        '이번에는 다시 깨어나지 않을, 길고 고요한 잠이었지요.',
        '데이비드는 엄마 곁에 누워, 그 손을 꼭 잡았어요.',
        '그리고 태어나 처음으로 눈을 감고, 꿈이 시작되는 곳으로 떠났답니다.',
        '사랑받고 싶었던 한 아이의 긴 여행은, 그렇게 따뜻하게 끝이 났어요.'],
  mood:{ root:48, mode:'major', prog:[0,3,5,4], bar:10, beat:.9, bright:1000, rest:.45 },
  look:{ bg:'#060913', hemi:['#8f9cd0','#090b15',.35], key:['#aebcff',.7,[4,8,-3]], p1:['#ffd89a',1.5,[-3.1,1.6,-.2],5], p2:['#bcd6ff',1.2,[2.8,3.4,-2.4],8], dust:['#ffe6b0',6,.25,.6,.8] },
  ground(g){ G.fill(g, '#46507c'); G.wash(g, 5, 3, 5.4, 3.2, '#1e2448', .7); G.wash(g, 5, 4, 2.8, 1.1, '#6a5a9a', .7);
    G.clear(g, () => { g.globalAlpha = .5; const r = rng(51); for(let i = 0; i < 14; i++) D.star(g, '#000', 2.6 + r() * 4.8, 3.3 + r() * 1.5, .06 + r() * .06); }); },
  pieces:[
    { x:0, z:-2.9, w:9.4, h:4.3, draw(g, w, h){ D.back(g, w, h, D.lg(g, 0, 0, 0, h, [[0,'#0f1834'],[1,'#1c2a52']]));
        D.atop(g, () => { const r = rng(53); for(let i = 0; i < 40; i++) D.star(g, '#34457e', r() * w, r() * h, .05);
          const x = w * .62, y = h * .1; D.window(g, x, y, 2.4, 2.4, '#2a3a66', '#081028', .09);
          g.save(); g.beginPath(); g.rect(x + .09, y + .09, 2.22, 2.22); g.clip(); D.stars(g, w, h, 70, 57, '#e8eeff');
          D.ell(g, '#e8eeff', x + 1.5, y + .8, .36, .36); D.ell(g, '#081028', x + 1.36, y + .72, .32, .32); g.restore();
          D.rect(g, '#2a3a66', x + 1.17, y, .06, 2.4); }); },
      glow(g, w, h){ const x = w * .62, y = h * .1; D.ell(g, '#dfe8ff', x + 1.5, y + .8, .36, .36); D.ell(g, '#000', x + 1.36, y + .72, .32, .32);
        const r = rng(53); for(let i = 0; i < 40; i++) D.star(g, '#1c2850', r() * w, r() * h, .05); }, ei:1.2 },
    { x:-3.2, z:-.5, w:.9, h:1.7, d:.2, draw(g){ D.rrf(g, '#2a2f4e', .05, 1.0, .8, .7, .04); D.rect(g, '#6a5a4a', .42, .55, .06, .45); D.poly(g, '#f5deb0', [.15,.6,.75,.6,.62,.2,.28,.2]); },
      glow(g){ D.poly(g, '#ffc070', [.15,.6,.75,.6,.62,.2,.28,.2]); }, ei:1.1 },
    { x:-.3, z:-.8, w:4.8, h:1.6, d:.35, draw(g, w){
        D.bed(g, w, { head:'#262c4c', pillow:'#c9d0ea', pillows:[1.4, 2.5], matt:'#2a3560', blanket:'#3a4a8a', bx:.9,
          sleepers:[{ x:1.35, r:.21, hair:'#caa25a', face:'#e6d3bf' }, { x:2.48, r:.17, hair:'#3a3040', face:'#e8d8c6' }] });
        const r = rng(59); for(let i = 0; i < 16; i++) D.star(g, '#8ea0e0', 1.2 + r() * 3.4, 1.0 + r() * .5, .035); } },
    { x:2.5, z:.6, w:1, h:1.1, d:.55, draw(g, w, h){ D.teddy(g, .5, h, 1.05, '#7a5638', '#b8946a'); } }
  ],
  glows:[{ x:-3.2, y:1.3, z:-.45, s:1.8, c:'#ffcf80', op:.8 }, { x:2.1, y:3.4, z:-2.85, s:2.6, c:'#dfe8ff', op:.5 }]
          .concat(Array.from({ length:9 }, (_, i) => ({ x:-1.8 + i * .38, y:1.2, z:-.6 + (i % 3) * .3, s:.34 + (i % 3) * .08, c:'#ffe6b0', op:.85, rise:1 })))
}
];


function poolWall(g, w, h){ D.rect(g, '#5fb0c8', 0, .12, w, h - .12); D.rect(g, '#d8d2c4', 0, 0, w, .14);
  g.strokeStyle = 'rgba(180,230,240,.6)'; g.lineWidth = .015; for(let x = 0; x < w; x += .22){ g.beginPath(); g.moveTo(x, .14); g.lineTo(x, h); g.stroke(); }
  for(let y = .36; y < h; y += .22){ g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }
function archPath(g, x, base, w, hh){ const r = w / 2; g.moveTo(x, base); g.lineTo(x, base - hh + r); g.arc(x + r, base - hh + r, r, Math.PI, 0); g.lineTo(x + w, base); g.closePath(); }
function neonArch(g, w, h, lw){ g.lineWidth = lw; g.strokeStyle = '#ff4fb8'; g.beginPath(); archPath(g, .32, h, w - .64, 3.05); g.stroke();
  g.strokeStyle = '#3ff0ff'; g.beginPath(); archPath(g, .5, h, w - 1.0, 2.82); g.stroke(); }
function drawKnow(g, c){ g.strokeStyle = c; g.lineWidth = .035; g.beginPath(); for(let a = 0; a < 5.5 * Math.PI; a += .15){ const r = .04 + a * .03; g.lineTo(.9 + Math.cos(a) * r, .8 + Math.sin(a) * r); } g.stroke();
  [[.45,.45],[1.35,.5],[1.3,1.15],[.5,1.2]].forEach(p => D.star(g, c, p[0], p[1], .06)); }
function aurora(g, w, h, a){ [['#7ff0d0',.8,.9],['#a88bff',.5,1.3],['#6fe0ff',1.2,1.0]].forEach(([c, y0, L], k) => {
  const q = g.createLinearGradient(0, y0, 0, y0 + L + .4); q.addColorStop(0, hexA(c, 0)); q.addColorStop(.3, hexA(c, a)); q.addColorStop(1, hexA(c, 0)); g.fillStyle = q;
  for(let x = 0; x < w; x += .05){ const y = y0 + Math.sin(x * .9 + k * 2) * .35 + Math.sin(x * 2.3 + k) * .1; g.fillRect(x, y, .045, L); } }); }
