'use strict';
/* narration.js — Web Speech API 여성 나레이션
   이 프로젝트의 js 파일들은 모듈 없이 일반 <script>로 index.html에 적힌 순서대로 불러온다.
   각 파일의 최상위 const/let/function은 모든 스크립트가 함께 쓰는 전역 범위에 놓이므로
   앞선 파일에서 선언한 이름을 뒤 파일에서 그대로 쓸 수 있다. (파일을 직접 열어도 동작하도록 ES 모듈을 쓰지 않음) */

/* =========================================================
   낭독: Web Speech API 여성 목소리
   ========================================================= */
const Narr = {
  supported:'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window,
  on:true, vc:{}, pc:{}, token:0, timer:null, utts:[],
  /* 언어별로 여성 목소리만 고른다. 남성 목소리밖에 없으면 자막으로 대신한다. */
  VOICES:{
    ko:{ lang:/^ko/i, name:/korean|한국/i, male:/InJoon|Hyunsu|Gook|Bong|Jinho|Minjun|Hyunwoo|\bMale\b|남성|SMTm/i,
         pref:[/SunHi/i, /Heami/i, /Yuna/i, /Google.*(한국|Korean)/i, /Sora|Seoyeon|Jimin|Yujin|Hyejin|Hana|Sumi|Female|여성|SMTf/i] },
    en:{ lang:/^en/i, name:/^$/, male:/David|Mark|Guy|Ryan|Christopher|Eric|Roger|Steffan|Daniel|\bAlex\b|Fred|\bTom\b|Aaron|Arthur|Andrew|Brian|George|Thomas|Oliver|Rishi|\bMale\b/i,
         pref:[/Aria/i, /Jenny/i, /Sonia/i, /Libby/i, /Michelle/i, /\bAna\b/i, /Emma/i, /Samantha/i, /Google US English/i, /Google UK English Female/i, /Zira/i,
               /Karen|Moira|Tessa|Serena|Victoria|Allison|Ava|Susan|Hazel|Natasha|Clara|Female/i] }
  },
  pick(L){
    L = L || LANG; if(!this.supported) return null; if(this.vc[L]) return this.vc[L];
    const cfg = this.VOICES[L], list = speechSynthesis.getVoices().filter(v => cfg.lang.test(v.lang) || cfg.name.test(v.name)); if(!list.length) return null;
    for(const re of cfg.pref){ const v = list.find(v => re.test(v.name) && !cfg.male.test(v.name)); if(v){ this.vc[L] = v; this.pc[L] = 1.02; return v; } }
    const v = list.find(v => !cfg.male.test(v.name)); if(v){ this.vc[L] = v; this.pc[L] = 1.1; return v; }
    return null;
  },
  prime(){ if(!this.supported) return; try { const u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); } catch(e){} },
  stop(){ this.token++; clearTimeout(this.timer); let busy = false;
    if(this.supported) try { busy = speechSynthesis.speaking || speechSynthesis.pending; if(busy) speechSynthesis.cancel(); } catch(e){}
    Aud.duck(false); return busy; },
  play(lines, onLine, onDone){
    const wasBusy = this.stop(), tok = this.token; let i = 0;
    const next = () => {
      if(tok !== this.token) return;
      if(i >= lines.length){ Aud.duck(false); onDone && onDone(); return; }
      const line = lines[i]; onLine(i, line); i++;
      let done = false; const fin = () => { if(done || tok !== this.token) return; done = true; clearTimeout(this.timer); this.timer = setTimeout(next, 650); };
      const v = this.on ? this.pick() : null, en = LANG === 'en';
      if(v){
        const u = new SpeechSynthesisUtterance(line); u.voice = v; u.lang = v.lang; u.rate = en ? .9 : .92; u.pitch = this.pc[LANG] || 1; u.volume = 1;
        u.onend = fin; u.onerror = fin; this.utts.push(u); if(this.utts.length > 30) this.utts.splice(0, 15);
        Aud.duck(true); try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch(e){ fin(); }
        this.timer = setTimeout(fin, 3500 + line.length * (en ? 115 : 240));
      } else {
        Aud.duck(false); this.timer = setTimeout(fin, 1800 + line.length * (en ? 55 : 105));
      }
    };
    /* 방금 cancel()한 직후 곧바로 speak()하면 첫 문장이 버려지는 브라우저가 있어 잠깐 기다린다 */
    if(wasBusy) this.timer = setTimeout(next, 180); else next();
  }
};
if(Narr.supported){ speechSynthesis.onvoiceschanged = () => { Narr.pick('ko'); Narr.pick('en'); }; Narr.pick('ko'); Narr.pick('en'); }
