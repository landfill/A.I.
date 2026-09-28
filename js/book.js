'use strict';
/* book.js — Three.js 무대, 책과 넘기는 책장, 팝업 조각·빛·물, 펼침면/표지 종이, 분위기 전환, 카메라
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   Three.js 무대
   ========================================================= */
const canvas = document.getElementById('gl');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' }); }
catch(e){ document.getElementById('loading').textContent = '이 브라우저에서는 입체 장면을 그릴 수 없어요 (WebGL 필요)'; throw new Error('WebGL을 사용할 수 없습니다'); }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const MOBILE = Math.min(innerWidth, innerHeight) < 600;

const scene = new THREE.Scene();
scene.background = new THREE.Color('#0a0c16');
scene.fog = new THREE.Fog('#0a0c16', 20, 50);
const cam = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, .1, 200);

const hemi = new THREE.HemisphereLight('#b8c0e0', '#141624', .5); scene.add(hemi);
const key = new THREE.DirectionalLight('#fff2dc', 1); key.castShadow = true;
key.shadow.mapSize.set(MOBILE ? 1024 : 2048, MOBILE ? 1024 : 2048);
Object.assign(key.shadow.camera, { left:-8, right:8, top:8, bottom:-8, near:1, far:40 });
key.shadow.bias = -.0006; key.shadow.normalBias = .03; key.shadow.radius = 3;
scene.add(key); scene.add(key.target);
const p1 = new THREE.PointLight('#ffd9a0', 0, 8, 1.4); const p2 = new THREE.PointLight('#8fb8ff', 0, 8, 1.4); scene.add(p1, p2);

function tex(cv){ const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.anisotropy = ANISO; return t; }

const glowTex = (() => { const c = mk(128, 128), g = c.getContext('2d'), q = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  q.addColorStop(0, 'rgba(255,255,255,1)'); q.addColorStop(.25, 'rgba(255,255,255,.45)'); q.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = q; g.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); })();
const beamTex = (() => { const c = mk(64, 256), g = c.getContext('2d'), d = g.createImageData(64, 256);
  for(let y = 0; y < 256; y++) for(let x = 0; x < 64; x++){ const u = (x - 31.5) / 32, v = y / 255, a = Math.exp(-u * u * 5) * Math.pow(1 - v, 1.4) * (v < .04 ? v / .04 : 1), i = (y * 64 + x) * 4;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = 255; d.data[i + 3] = a * 255; }
  g.putImageData(d, 0, 0); return new THREE.CanvasTexture(c); })();

/* ---------- 책 ---------- */
const book = new THREE.Group(); scene.add(book);
const boardMat = new THREE.MeshStandardMaterial({ color:'#18203a', roughness:.85 });
const edgeMat = new THREE.MeshStandardMaterial({ color:'#e2d6bf', roughness:.95 });
const mkBox = (w, h, d, m, x, y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, 0); b.castShadow = b.receiveShadow = true; book.add(b); return b; };
const boardL = mkBox(W + .16, .06, H + .3, boardMat, -W / 2 - .08, -.25);
const boardR = mkBox(W + .16, .06, H + .3, boardMat, W / 2 + .08, -.25);
const stackL = mkBox(W - .03, .22, H - .03, edgeMat, -W / 2, -.11);
const stackR = mkBox(W - .03, .22, H - .03, edgeMat, W / 2, -.11);
const pageGeo = x => { const g = new THREE.PlaneGeometry(W, H); g.rotateX(-Math.PI / 2); g.translate(x, .003, 0); return g; };
const pageMatL = new THREE.MeshStandardMaterial({ roughness:.95, color:'#ffffff' });
const pageMatR = new THREE.MeshStandardMaterial({ roughness:.95, color:'#ffffff' });
const pageL = new THREE.Mesh(pageGeo(-W / 2), pageMatL), pageR = new THREE.Mesh(pageGeo(W / 2), pageMatR);
pageL.receiveShadow = pageR.receiveShadow = true; book.add(pageL, pageR);

const SEG = 48, LEAF_Y = .012;
const leafGeo = new THREE.PlaneGeometry(W, H, SEG, 1); leafGeo.rotateX(-Math.PI / 2);
const leafBackGeo = new THREE.BufferGeometry(); leafBackGeo.setIndex(leafGeo.index);
leafBackGeo.setAttribute('position', leafGeo.attributes.position); leafBackGeo.setAttribute('normal', leafGeo.attributes.normal);
{ const uv = leafGeo.attributes.uv.clone(); for(let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i)); leafBackGeo.setAttribute('uv', uv); }
const leafFrontMat = new THREE.MeshStandardMaterial({ roughness:.95, side:THREE.FrontSide });
const leafBackMat = new THREE.MeshStandardMaterial({ roughness:.95, side:THREE.BackSide });
const leafF = new THREE.Mesh(leafGeo, leafFrontMat), leafB = new THREE.Mesh(leafBackGeo, leafBackMat);
[leafF, leafB].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; book.add(m); });
function setLeaf(theta, curl){
  const pos = leafGeo.attributes.position, xs = [0], ys = [0], dx = W / SEG; let px = 0, py = 0;
  for(let i = 1; i <= SEG; i++){ const u = (i - .5) / SEG, phi = theta + curl * Math.pow(u, 1.6); px += Math.cos(phi) * dx; py += Math.sin(phi) * dx; xs.push(px); ys.push(py); }
  for(let v = 0; v < pos.count; v++){ const c = v % (SEG + 1); pos.setX(v, xs[c]); pos.setY(v, ys[c] + LEAF_Y); }
  pos.needsUpdate = true; leafGeo.computeVertexNormals();
}
function showLeaf(b){ leafF.visible = leafB.visible = b; }
function setMap(m, t){ if(m.map !== t){ m.map = t; m.needsUpdate = true; } }

const table = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ color:'#15182a', roughness:1 }));
table.rotation.x = -Math.PI / 2; table.position.y = -.29; scene.add(table);

/* ---------- 먼지·거품·눈 입자 ---------- */
const NP = MOBILE ? 260 : 420;
const pGeo = new THREE.BufferGeometry(); { const pp = new Float32Array(NP * 3), sd = new Float32Array(NP * 3), r = rng(77);
  for(let i = 0; i < NP; i++){ pp[i * 3] = (r() - .5) * 11.5; pp[i * 3 + 1] = r() * 7; pp[i * 3 + 2] = -3.6 + r() * 6.8; sd[i * 3] = r(); sd[i * 3 + 1] = r(); sd[i * 3 + 2] = r(); }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pp, 3)); pGeo.setAttribute('seed', new THREE.BufferAttribute(sd, 3)); }
const pMat = new THREE.ShaderMaterial({ transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
  uniforms:{ uTime:{ value:0 }, uOff:{ value:0 }, uColor:{ value:new THREE.Color('#ffe8c0') }, uSize:{ value:4 }, uWob:{ value:.4 }, uOp:{ value:.4 }, uPR:{ value:renderer.getPixelRatio() } },
  vertexShader:`attribute vec3 seed; uniform float uTime,uOff,uSize,uWob,uOp,uPR; varying float vA;
    void main(){ vec3 p=position; float hh=7.0; p.y=mod(position.y+uOff*(0.6+seed.x*0.8),hh);
      p.x+=sin(uTime*0.3*(0.5+seed.y)+seed.z*6.283)*uWob; p.z+=cos(uTime*0.25*(0.5+seed.x)+seed.z*6.283)*uWob;
      vec4 mv=modelViewMatrix*vec4(p,1.0); gl_Position=projectionMatrix*mv;
      gl_PointSize=uSize*(0.45+seed.y)*uPR*(34.0/-mv.z);
      vA=uOp*smoothstep(0.0,0.7,p.y)*smoothstep(hh,hh-1.6,p.y)*(0.55+0.45*sin(uTime*1.7*(0.5+seed.x)+seed.z*40.0)); }`,
  fragmentShader:`uniform vec3 uColor; varying float vA; void main(){ float d=length(gl_PointCoord-0.5); float a=smoothstep(0.5,0.0,d); gl_FragColor=vec4(uColor,a*a*vA); }` });
const points = new THREE.Points(pGeo, pMat); points.renderOrder = 30; points.frustumCulled = false; scene.add(points);

/* =========================================================
   조각 · 빛 · 물 만들기
   ========================================================= */
const PXU = 110;
function makePiece(p){
  const cw = Math.max(8, Math.min(1400, Math.round(p.w * PXU))), ch = Math.max(8, Math.min(1400, Math.round(p.h * PXU))), S = {};
  const cv = mk(cw, ch), g = cv.getContext('2d');
  g.save(); g.scale(cw / p.w, ch / p.h); p.draw(g, p.w, p.h, S); g.restore();
  finishPaper(cv, g, p.rim || '#f3ead9', 2.4);
  const map = tex(cv);
  const mat = new THREE.MeshStandardMaterial({ map, transparent:true, alphaTest:.06, side:THREE.DoubleSide, roughness:.9, metalness:0, opacity:0 });
  if(p.glow){ const ec = mk(cw, ch), eg = ec.getContext('2d'); eg.fillStyle = '#000'; eg.fillRect(0, 0, cw, ch);
    eg.save(); eg.scale(cw / p.w, ch / p.h); p.glow(eg, p.w, p.h, S); eg.restore();
    mat.emissive = new THREE.Color('#ffffff'); mat.emissiveMap = tex(ec); mat.emissiveIntensity = p.ei ?? 1; }
  const geo = new THREE.PlaneGeometry(p.w, p.h); geo.translate(0, p.h / 2, 0);
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true;
  mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking:THREE.RGBADepthPacking, map, alphaTest:.5 });
  const hinge = new THREE.Group(); hinge.rotation.order = 'YXZ'; hinge.position.set(p.x || 0, Math.max(p.y0 || 0, .006), p.z || 0); hinge.rotation.y = p.yaw || 0; hinge.add(mesh);
  hinge.rotation.x = -Math.PI / 2; mesh.visible = false;
  return { hinge, mesh, mat, spec:p, base:hinge.position.clone(), f:0, f0:0 };
}
function makeBeam(b){
  const A = new THREE.Vector3(...b.from), B = new THREE.Vector3(...b.to), len = A.distanceTo(B);
  const geo = new THREE.PlaneGeometry(b.w, len); geo.translate(0, -len / 2, 0);
  const pa = geo.attributes.position; for(let i = 0; i < pa.count; i++){ const y = pa.getY(i); pa.setX(i, pa.getX(i) * (y < -len / 2 ? (b.spread || 2) : .6)); }
  const mat = new THREE.MeshBasicMaterial({ map:beamTex, color:new THREE.Color(b.c), transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, side:THREE.DoubleSide, fog:false });
  const m = new THREE.Mesh(geo, mat); m.renderOrder = 20;
  const y = A.clone().sub(B).normalize(), zf = b.flat ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, .6, 1).normalize();
  const x = new THREE.Vector3().crossVectors(y, zf); if(x.lengthSq() < 1e-5) x.set(1, 0, 0); x.normalize();
  const z = new THREE.Vector3().crossVectors(x, y).normalize();
  m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z)); m.position.copy(A);
  return { m, spec:b, ph:Math.random() * 6 };
}
function makeWater(w){
  const geo = new THREE.PlaneGeometry(w.w, w.d, 36, 26); geo.rotateX(-Math.PI / 2);
  const col = new THREE.Color(w.c);
  const mat = new THREE.MeshStandardMaterial({ color:col.clone().multiplyScalar(.55), emissive:col.clone().multiplyScalar(.12), transparent:true, opacity:0, roughness:.3, metalness:.35, side:THREE.DoubleSide, depthWrite:false });
  const m = new THREE.Mesh(geo, mat); m.position.set(w.x || 0, 0, w.z || 0); m.renderOrder = 10;
  return { m, spec:w, base:Float32Array.from(geo.attributes.position.array) };
}

const objs = {};
function buildScene(i){
  const s = SC[i], grp = new THREE.Group(); grp.visible = false; book.add(grp);
  const o = { i, grp, pieces:[], glows:[], beams:[], waters:[], state:'hidden', timer:0, tOpen:0, gf:0, gf0:0, maxDelay:0 };
  s.pieces.forEach((p, k) => { const pc = makePiece(p); pc.delay = p.d ?? k * .12; o.maxDelay = Math.max(o.maxDelay, pc.delay); grp.add(pc.hinge); o.pieces.push(pc); });
  (s.glows || []).forEach(gs => { const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:new THREE.Color(gs.c), transparent:true, opacity:0, depthWrite:false, blending:THREE.AdditiveBlending, fog:false }));
    spr.position.set(gs.x, gs.y, gs.z); spr.renderOrder = 21; grp.add(spr); o.glows.push({ spr, spec:gs, ph:Math.random(), fired:false }); });
  (s.beams || []).forEach(b => { const bm = makeBeam(b); grp.add(bm.m); o.beams.push(bm); });
  (s.water || []).forEach(w => { const wm = makeWater(w); grp.add(wm.m); o.waters.push(wm); });
  return o;
}
function disposeScene(o){
  book.remove(o.grp);
  o.grp.traverse(n => { if(n.geometry) n.geometry.dispose(); if(n.material){ const m = n.material; if(m.map && m.map !== glowTex && m.map !== beamTex) m.map.dispose(); if(m.emissiveMap) m.emissiveMap.dispose(); m.dispose(); }
    if(n.customDepthMaterial) n.customDepthMaterial.dispose(); });
}
const RISE = REDUCED ? .5 : 1.15, FOLD = REDUCED ? .3 : .55;
function riseScene(o){ o.state = 'rising'; o.timer = 0; o.tOpen = 0; o.grp.visible = true; o.glows.forEach(g => g.fired = false); }
function foldScene(o){ if(o.state === 'hidden') return; o.pieces.forEach(pc => pc.f0 = pc.f); o.gf0 = o.gf; o.state = 'folding'; o.timer = 0; }
function updateScene(o, dt, t){
  if(o.state === 'hidden') return;
  o.timer += dt; if(o.state !== 'folding') o.tOpen += dt;
  const fold = o.state === 'folding', fk = fold ? 1 - ease(clamp(o.timer / FOLD)) : 1;
  for(const pc of o.pieces){
    let f = fold ? pc.f0 * fk : easeBack(clamp((o.timer - pc.delay * (REDUCED ? .4 : 1)) / RISE));
    if(!fold && o.timer - pc.delay * (REDUCED ? .4 : 1) <= 0) f = 0;
    pc.f = f; pc.hinge.rotation.x = -(1 - f) * Math.PI / 2;
    const vis = f > .004; pc.mesh.visible = vis; pc.mat.opacity = clamp(f * 5);
    if(vis && pc.spec.anim) pc.spec.anim(pc, t, o.tOpen, f);
  }
  o.gf = fold ? o.gf0 * fk : ease(clamp((o.timer - .25) / 1.6));
  const gf = o.gf;
  for(const G of o.glows){ const s = G.spec; let a = s.op * gf;
    if(s.seq != null){ const k = clamp((o.tOpen - s.seq) / .9); a *= k; if(k > 0 && !G.fired && !fold){ G.fired = true; Sfx.chime(); } }
    if(s.pulse) a *= .72 + .28 * Math.sin(t * s.pulse * 2 + G.ph * 6);
    if(s.flicker) a *= .8 + .2 * Math.sin(t * 13 + G.ph * 9) * Math.sin(t * 7.3 + G.ph * 17);
    if(s.rise){ const fr = (t * .12 + G.ph) % 1; G.spr.position.y = s.y + fr * 3.4; G.spr.position.x = s.x + Math.sin(t * .5 + G.ph * 6) * .3; a *= Math.sin(fr * Math.PI); }
    const sc = s.s * (.55 + .45 * gf); G.spr.scale.set(sc, sc, 1); G.spr.material.opacity = a; G.spr.visible = a > .003; }
  for(const B of o.beams){ B.m.material.opacity = B.spec.op * gf * (.82 + .18 * Math.sin(t * .7 + B.ph)); B.m.visible = gf > .01; }
  for(const Wt of o.waters){ const s = Wt.spec, pa = Wt.m.geometry.attributes.position, b = Wt.base;
    Wt.m.visible = gf > .01; if(!Wt.m.visible) continue;
    Wt.m.position.y = s.level * gf; Wt.m.material.opacity = s.op * gf;
    for(let i = 0; i < pa.count; i++){ const x = b[i * 3], z = b[i * 3 + 2]; pa.setY(i, .028 * (Math.sin(x * 1.6 + t * 1.2) + .6 * Math.sin(z * 2.1 - t * .85))); }
    pa.needsUpdate = true; Wt.m.geometry.computeVertexNormals(); }
  if(o.state === 'rising' && o.timer > o.maxDelay + RISE + .1) o.state = 'open';
  if(fold && o.timer > FOLD + .05){ o.state = 'hidden'; o.grp.visible = false; }
}

/* ---------- 펼침면 종이 ---------- */
const spreads = {};
function wrapText(g, text, maxW){ const words = text.split(' '), lines = []; let cur = '';
  words.forEach(w => { const t = cur ? cur + ' ' + w : w; if(g.measureText(t).width > maxW && cur){ lines.push(cur); cur = w; } else cur = t; }); if(cur) lines.push(cur); return lines; }
function makeSpread(i){
  const s = SC[i], cw = 2048, ch = 1434, u = cw / 10, c = mk(cw, ch), g = c.getContext('2d');
  g.fillStyle = '#efe5d1'; g.fillRect(0, 0, cw, ch);
  const r = rng(100 + i); g.strokeStyle = 'rgba(120,90,60,.07)'; g.lineWidth = 1.2;
  for(let k = 0; k < 420; k++){ const x = r() * cw, y = r() * ch, l = 6 + r() * 18, a = r() * TAU; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l * .5 + 3, y + Math.sin(a) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  g.fillStyle = g.createPattern(grainCv, 'repeat'); g.fillRect(0, 0, cw, ch);
  const gc = mk(cw, ch), gg = gc.getContext('2d'); gg.save(); gg.scale(u, u); s.ground(gg); gg.restore();
  gg.globalCompositeOperation = 'destination-in';
  gg.fillStyle = D.lg(gg, 0, 0, 0, ch, [[0,'#000'],[.72,'#000'],[.85,'rgba(0,0,0,0)']]); gg.fillRect(0, 0, cw, ch);
  gg.fillStyle = D.lg(gg, 0, 0, cw, 0, [[0,'rgba(0,0,0,0)'],[.035,'#000'],[.965,'#000'],[1,'rgba(0,0,0,0)']]); gg.fillRect(0, 0, cw, ch);
  gg.fillStyle = D.lg(gg, 0, 0, 0, ch, [[0,'rgba(0,0,0,0)'],[.03,'#000'],[1,'#000']]); gg.fillRect(0, 0, cw, ch);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .92; g.drawImage(gc, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = D.lg(g, cw / 2 - 170, 0, cw / 2 + 170, 0, [[0,'rgba(70,45,25,0)'],[.5,'rgba(70,45,25,.34)'],[1,'rgba(70,45,25,0)']]); g.fillRect(cw / 2 - 170, 0, 340, ch);
  g.fillStyle = D.lg(g, 0, 0, 0, ch, [[0,'rgba(70,45,25,.12)'],[.05,'rgba(70,45,25,0)'],[.95,'rgba(70,45,25,0)'],[1,'rgba(70,45,25,.14)']]); g.fillRect(0, 0, cw, ch);
  const ink = '#3d302a', en = LANG === 'en', tx = TX(i), px = k => Math.round(u * k);
  const KF = '"Gowun Batang", serif', EF = '"Cormorant Garamond", Georgia, serif';
  g.textBaseline = 'alphabetic'; g.textAlign = 'left'; g.fillStyle = 'rgba(61,48,42,.7)';
  g.font = en ? `italic 400 ${px(.15)}px ${EF}` : `400 ${px(.13)}px ${KF}`; g.fillText(en ? `Chapter ${i + 1}` : `제${i + 1}장`, u * .5, u * 6.2);
  g.fillStyle = ink; g.font = en ? `500 ${px(.3)}px ${EF}` : `700 ${px(.26)}px ${KF}`; g.fillText(tx.title, u * .5, u * 6.55);
  g.fillStyle = 'rgba(61,48,42,.35)'; g.fillRect(u * .5, u * 6.66, u * .7, 2);
  g.textAlign = 'right'; g.fillStyle = 'rgba(61,48,42,.82)'; g.font = en ? `italic 400 ${px(.165)}px ${EF}` : `400 ${px(.135)}px ${KF}`;
  const lines = wrapText(g, tx.line, u * 3.7), ly = s.end ? 6.05 : 6.3;
  lines.forEach((ln, k) => g.fillText(ln, u * 9.5, u * (ly + k * .21)));
  if(s.end){ g.fillStyle = ink; g.font = en ? `italic 500 ${px(.28)}px ${EF}` : `700 ${px(.24)}px ${KF}`; g.fillText(en ? '— The End —' : '— 끝 —', u * 9.5, u * 6.62); }
  g.textAlign = 'center'; g.fillStyle = 'rgba(61,48,42,.55)'; g.font = `italic 500 ${Math.round(u * .15)}px "Cormorant Garamond", Georgia, serif`;
  g.fillText(String(i * 2 + 1), u * 2.5, u * 6.9); g.fillText(String(i * 2 + 2), u * 7.5, u * 6.9);
  const L = mk(cw / 2, ch), R = mk(cw / 2, ch); L.getContext('2d').drawImage(c, 0, 0); R.getContext('2d').drawImage(c, -cw / 2, 0);
  return { L:tex(L), R:tex(R) };
}
function makeCover(){
  const cw = 1024, ch = 1434, c = mk(cw, ch), g = c.getContext('2d');
  g.fillStyle = D.lg(g, 0, 0, 0, ch, [[0,'#1c2748'],[1,'#0f152b']]); g.fillRect(0, 0, cw, ch);
  const r = rng(11); g.globalAlpha = .05; for(let y = 0; y < ch; y += 3){ g.fillStyle = r() < .5 ? '#fff' : '#000'; g.fillRect(0, y, cw, 1); }
  for(let x = 0; x < cw; x += 3){ g.fillStyle = r() < .5 ? '#fff' : '#000'; g.fillRect(x, 0, 1, ch); } g.globalAlpha = 1;
  g.fillStyle = D.lg(g, 0, 0, 140, 0, [[0,'rgba(0,0,0,.5)'],[1,'rgba(0,0,0,0)']]); g.fillRect(0, 0, 140, ch);
  const gold = D.lg(g, 0, 0, cw, ch, [[0,'#f3dc9a'],[.5,'#b8904a'],[1,'#e8c77e']]);
  g.strokeStyle = gold; g.lineWidth = 3; g.strokeRect(100, 90, 834, 1254); g.lineWidth = 1.2; g.strokeRect(116, 106, 802, 1222);
  g.fillStyle = gold; D.stars(g, cw, 420, 40, 12, '#e8c77e', 2.2);
  g.textAlign = 'center'; g.fillStyle = gold;
  /* 제목의 두 마침표를 작은 금빛 별로 바꿔 그림 */
  g.font = 'italic 500 250px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'left';
  const wA = g.measureText('A').width, wI = g.measureText('I').width, gap = 62, x0 = 518 - (wA + wI + gap * 2) / 2;
  g.fillText('A', x0, 600); g.fillText('I', x0 + wA + gap, 600);
  D.star(g, gold, x0 + wA + gap * .42, 584, 19); D.star(g, gold, x0 + wA + gap + wI + gap * .42, 584, 19);
  g.textAlign = 'center';
  const en = LANG === 'en', EF = '"Cormorant Garamond", Georgia, serif';
  g.font = en ? `italic 500 60px ${EF}` : '400 50px "Gowun Batang", serif'; g.fillText(en ? 'The Boy Who Learned to Love' : '사랑을 배운 아이', 518, 720);
  g.fillRect(418, 760, 200, 2);
  g.font = en ? `500 30px ${EF}` : '400 26px "Gowun Batang", serif'; g.fillStyle = 'rgba(232,199,126,.85)'; g.fillText(en ? 'A Pop-up Book  ·  Fourteen Scenes' : '입체 그림책 · 열네 개의 장면', 518, 815);
  /* 옆모습의 아이가 별을 올려다보는 금박 그림 */
  g.strokeStyle = D.lg(g, 270, 0, 770, 0, [[0,'rgba(232,199,126,0)'],[.5,'rgba(232,199,126,.75)'],[1,'rgba(232,199,126,0)']]); g.lineWidth = 2;
  g.beginPath(); g.moveTo(270, 1192); g.lineTo(770, 1192); g.stroke();
  D.profileChild(g, 452, 1190, 300, q => D.lg(q, -.1, -1, .1, 0, [[0,'#f6e2a4'],[.55,'#c69f55'],[1,'#e8c77e']]));
  D.line(g, 'rgba(232,199,126,.55)', 1.5, [662, 896, 662, 966]); D.line(g, 'rgba(232,199,126,.55)', 1.5, [627, 931, 697, 931]);
  D.star(g, gold, 662, 931, 17); D.star(g, 'rgba(232,199,126,.6)', 724, 1012, 7); D.star(g, 'rgba(232,199,126,.5)', 598, 872, 5);
  g.font = en ? `italic 400 28px ${EF}` : '400 22px "Gowun Batang", serif'; g.fillStyle = 'rgba(232,199,126,.7)';
  g.fillText(en ? 'A tribute to the film A.I. (2001)' : '영화 「A.I.」(2001)에 바치는 헌정', 518, 1270);
  return tex(c);
}
function spreadOf(i){ return spreads[i] || (spreads[i] = makeSpread(i)); }
function ensure(i){ if(i < 0 || i >= SC.length) return; spreadOf(i); if(!objs[i]) objs[i] = buildScene(i); }
function prune(keep){ const k = new Set(keep);
  Object.keys(objs).forEach(i => { i = +i; if(!k.has(i) && objs[i].state === 'hidden'){ disposeScene(objs[i]); delete objs[i]; } });
  Object.keys(spreads).forEach(i => { i = +i; if(!k.has(i)){ spreads[i].L.dispose(); spreads[i].R.dispose(); delete spreads[i]; } }); }

/* =========================================================
   빛과 분위기 전환
   ========================================================= */
const C3 = c => new THREE.Color(c), V3 = a => new THREE.Vector3(...a);
const COVER_LOOK = { bg:'#0a0c16', hemi:['#b8c0e0','#141624',.55], key:['#fff2dc',1.05,[4,9,6]], p1:['#ffd9a0',.9,[3,3,2],9], p2:['#8fb8ff',.5,[-2,3,2],8], dust:['#ffe8c0',4,.08,.5,.4] };
function lookOf(l){ return { bg:C3(l.bg), fog:l.fog || 1, hs:C3(l.hemi[0]), hg:C3(l.hemi[1]), hi:l.hemi[2], kc:C3(l.key[0]), ki:l.key[1], kp:V3(l.key[2]).normalize().multiplyScalar(14),
  p1c:C3(l.p1[0]), p1i:l.p1[1], p1p:V3(l.p1[2]), p1d:l.p1[3], p2c:C3(l.p2[0]), p2i:l.p2[1], p2p:V3(l.p2[2]), p2d:l.p2[3],
  dc:C3(l.dust[0]), ds:l.dust[1], dsp:l.dust[2], dw:l.dust[3], dop:l.dust[4] }; }
const LK = lookOf(COVER_LOOK); let LT = lookOf(COVER_LOOK);
const tableCol = new THREE.Color();
function updateLook(dt){
  const k = 1 - Math.exp(-dt * 1.6), n = (a, b) => a + (b - a) * k;
  LK.bg.lerp(LT.bg, k); LK.hs.lerp(LT.hs, k); LK.hg.lerp(LT.hg, k); LK.kc.lerp(LT.kc, k); LK.p1c.lerp(LT.p1c, k); LK.p2c.lerp(LT.p2c, k); LK.dc.lerp(LT.dc, k);
  LK.kp.lerp(LT.kp, k); LK.p1p.lerp(LT.p1p, k); LK.p2p.lerp(LT.p2p, k);
  ['fog','hi','ki','p1i','p1d','p2i','p2d','ds','dsp','dw','dop'].forEach(f => LK[f] = n(LK[f], LT[f]));
  scene.background.copy(LK.bg); scene.fog.color.copy(LK.bg);
  tableCol.copy(LK.bg).multiplyScalar(.6); table.material.color.copy(tableCol);
  hemi.color.copy(LK.hs); hemi.groundColor.copy(LK.hg); hemi.intensity = LK.hi;
  key.color.copy(LK.kc); key.intensity = LK.ki; key.position.copy(LK.kp);
  p1.color.copy(LK.p1c); p1.intensity = LK.p1i; p1.position.copy(LK.p1p); p1.distance = LK.p1d;
  p2.color.copy(LK.p2c); p2.intensity = LK.p2i; p2.position.copy(LK.p2p); p2.distance = LK.p2d;
  const u = pMat.uniforms; u.uColor.value.copy(LK.dc); u.uSize.value = LK.ds; u.uWob.value = LK.dw; u.uOp.value = LK.dop;
  u.uOff.value += LK.dsp * dt * (REDUCED ? .4 : 1);
}

/* =========================================================
   카메라
   ========================================================= */
let camMode = 'cover', camDist = 20; const camPos = new THREE.Vector3(), camTgt = new THREE.Vector3(), mouse = { x:0, y:0, sx:0, sy:0 };
const CAM_DIR = new THREE.Vector3(0, .7, 1).normalize();
function camGoal(){
  const aspect = Math.max(1, innerWidth) / Math.max(1, innerHeight), t = Math.tan(cam.fov * Math.PI / 360);
  const cover = camMode === 'cover', tgt = cover ? new THREE.Vector3(2.5, .2, .4) : new THREE.Vector3(0, 1.35, .2);
  const nw = cover ? 7.2 : (aspect < .7 ? 10.4 : 11.2), nh = cover ? 9.2 : 10.4;
  const d = Math.max(nw / 2 / (t * aspect), nh / 2 / t);
  tgt.y -= d * t * (cover ? .24 : .13);
  return { pos:tgt.clone().addScaledVector(CAM_DIR, d), tgt, d };
}
function updateCamera(dt, T, snap){
  const gl = camGoal(), k = snap ? 1 : 1 - Math.exp(-dt * 1.3);
  camPos.lerp(gl.pos, k); camTgt.lerp(gl.tgt, k); camDist = gl.d;
  mouse.sx += (mouse.x - mouse.sx) * (1 - Math.exp(-dt * 2)); mouse.sy += (mouse.y - mouse.sy) * (1 - Math.exp(-dt * 2));
  const drift = REDUCED ? 0 : 1;
  cam.position.set(camPos.x + (mouse.sx * .9 + Math.sin(T * .13) * .25) * drift, camPos.y + (-mouse.sy * .5 + Math.sin(T * .17) * .15) * drift, camPos.z);
  cam.lookAt(camTgt);
  scene.fog.near = camDist - 2 + 4 * LK.fog; scene.fog.far = camDist + 30 * LK.fog;
}
function resize(){ const w = Math.max(1, innerWidth), h = Math.max(1, innerHeight); renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); pMat.uniforms.uPR.value = renderer.getPixelRatio(); }
addEventListener('resize', resize);
addEventListener('pointermove', e => { if(e.pointerType === 'mouse'){ mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = e.clientY / innerHeight * 2 - 1; } });
