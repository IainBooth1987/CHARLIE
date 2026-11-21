/* ===== Charlie's Learning — shared helpers (storage, voice, sounds, grown-ups) ===== */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('cl_'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('cl_'+k, JSON.stringify(v)); }catch(e){} }
};
const settings = Object.assign({ name:'Charlie', speech:true, look:'auto', answers:'both', sfx:true, rate:0.85 }, store.get('settings', {}));
const progress = store.get('progress', {});
let tower = store.get('tower', []);
function save(){ store.set('settings', settings); store.set('progress', progress); store.set('tower', tower); }

const $ = s => document.querySelector(s);
const rnd = n => Math.floor(Math.random()*n);
const pick = a => a[rnd(a.length)];
const shuffle = a => { a = a.slice(); for(let i=a.length-1;i>0;i--){ const j=rnd(i+1); [a[i],a[j]]=[a[j],a[i]]; } return a; };
const COLS = ['red','blue','yellow','green','orange','purple','lime','pink','teal'];
const CSSCOL = {red:'#e3262f',blue:'#0b6fd6',yellow:'#ffcd00',green:'#16a34a',orange:'#f97316',purple:'#8b46d6',lime:'#8fd14f',pink:'#ec4899',teal:'#0ea5a4'};
const starsTxt = n => '★'.repeat(n) + '☆'.repeat(3-n);
const esc = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* Voice */
let voice = null;
function pickVoice(){
  if(!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v=>/en-GB/i.test(v.lang) && /Daniel|Kate|Serena|Martha|Google UK English Female|Libby|Sonia/i.test(v.name))
       || vs.find(v=>/en-GB/i.test(v.lang)) || vs.find(v=>/^en/i.test(v.lang)) || null;
}
if('speechSynthesis' in window){ pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
/* Recorded voice: assets/voice/manifest.js sets window.VOICE_CLIPS = {"line text": "folder/file.mp3"}.
   A line with a recording plays it. Inside a 3D intro there is no computer voice at all (captions only). */
const ASSET_BASE = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/site\.js(\?.*)?$/, '') : 'assets/';
(function(){ try{ const sc = document.createElement('script'); sc.src = ASSET_BASE + 'voice/manifest.js'; document.head.appendChild(sc); }catch(e){} })();
const normLine = t => String(t).toLowerCase().replace(/[’‘]/g,"'").replace(/[^a-z0-9' ]+/g,' ').replace(/\s+/g,' ').trim();
let clipAudio = null;
function stopVoice(){ try{ if(clipAudio){ clipAudio.pause(); clipAudio = null; } if('speechSynthesis' in window) speechSynthesis.cancel(); }catch(e){} }
function playClip(text){
  const clips = window.VOICE_CLIPS || {}; let f = null;
  for(const k in clips){ if(normLine(k) === normLine(text)){ f = clips[k]; break; } }
  if(!f) return false;
  try{ stopVoice(); clipAudio = new Audio(ASSET_BASE + 'voice/' + f); const p = clipAudio.play(); if(p && p.catch) p.catch(()=>{}); return true; }catch(e){ return false; }
}
/* Only real recordings are ever played — there is no computer (text-to-speech) voice anywhere on the site.
   A line with no recording is simply silent; the words still show in the speech bubble. */
function speak(text, rate){
  if(!settings.speech) return;
  playClip(text);
}
function hasClip(text){ const clips = window.VOICE_CLIPS || {}; return Object.keys(clips).some(k=>normLine(k)===normLine(text)); }

/* Sound effects */
let ac = null;
function audio(){ if(!ac){ try{ ac = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } if(ac && ac.state==='suspended') ac.resume(); return ac; }
function tone(f, t0, dur, type='sine', vol=.15){
  const a = audio(); if(!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = f; o.connect(g); g.connect(a.destination);
  const t = a.currentTime + t0;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t+.01); g.gain.exponentialRampToValueAtTime(.001, t+dur);
  o.start(t); o.stop(t+dur+.02);
}
const sfx = {
  click(){ if(settings.sfx){ tone(900,0,.05,'square',.06); tone(500,.03,.06,'square',.05); } },
  good(){ if(settings.sfx){ [523,659,784,1047].forEach((f,i)=>tone(f,i*.08,.18,'triangle',.14)); } },
  oops(){ if(settings.sfx){ tone(300,0,.15,'sine',.12); tone(240,.12,.2,'sine',.1); } },
  win(){ if(settings.sfx){ [523,659,784,659,784,1047].forEach((f,i)=>tone(f,i*.11,.22,'triangle',.15)); } }
};
document.addEventListener('pointerdown', ()=>audio(), {once:true});

function confetti(n=40){
  for(let i=0;i<n;i++){
    const d = document.createElement('div'); d.className='conf';
    d.style.left = Math.random()*100+'vw'; d.style.background = CSSCOL[pick(COLS)];
    d.style.animationDuration = (1.6+Math.random()*1.6)+'s'; d.style.animationDelay = (Math.random()*.4)+'s';
    document.body.appendChild(d); setTimeout(()=>d.remove(), 3600);
  }
}
function towerHTML(max=60){
  return tower.slice(-max).map(c=>`<div class="mini" style="--c:${CSSCOL[c]||c}"></div>`).join('')
    || '<span style="opacity:.6;font-size:17px">Finish a game to add your first brick!</span>';
}

/* Grown-ups: press and hold so little fingers don't open it by accident */
function holdToOpen(btn, bar, fn){
  let start = 0, raf = null;
  const tick = ()=>{ const p = Math.min(1,(Date.now()-start)/1500); bar.style.width = (p*100)+'%'; if(p>=1){ end(); fn(); } else raf = requestAnimationFrame(tick); };
  const end = ()=>{ cancelAnimationFrame(raf); bar.style.width = '0'; };
  btn.addEventListener('pointerdown', e=>{ e.preventDefault(); start = Date.now(); raf = requestAnimationFrame(tick); });
  ['pointerup','pointerleave','pointercancel'].forEach(ev=>btn.addEventListener(ev, end));
}
function grownupButton(){
  const b = document.createElement('button'); b.className='grownup'; b.innerHTML='🔒<div class="bar"></div>'; b.title = 'Grown-ups: press and hold for settings'; b.setAttribute('aria-label','Grown-ups: press and hold for settings');
  document.body.appendChild(b); holdToOpen(b, b.querySelector('.bar'), openSettings);
}
function seg(key, opts){
  return `<div class="seg">${opts.map(([v,l])=>`<button class="${settings[key]===v?'on':''}" data-k="${key}" data-v='${JSON.stringify(v)}'>${l}</button>`).join('')}</div>`;
}
/* Pages can add extra settings groups by defining window.EXTRA_SETTINGS = [[key,label,options,note]] */
function openSettings(){
  const extra = (window.EXTRA_SETTINGS||[]).map(([k,l,o,n])=>`<div class="grp"><b>${l}</b>${seg(k,o)}${n?`<p class="note">${n}</p>`:''}</div>`).join('');
  let m = document.getElementById('modal'); if(!m){ m = document.createElement('div'); m.id='modal'; document.body.appendChild(m); }
  m.innerHTML = `<div class="modal-bg"><div class="modal">
    <h2>👪 Grown-ups</h2>
    <div class="grp"><b>Child's name</b><input type="text" id="nm" value="${esc(settings.name)}" maxlength="20"></div>
    <div class="grp"><b>Recorded voice</b>${seg('speech',[[true,'On'],[false,'Off']])}</div>
    ${extra}
    <div class="grp"><b>Sound effects</b>${seg('sfx',[[true,'On'],[false,'Off']])}</div>
    <div class="grp"><b>Progress</b><p class="note">${tower.length} bricks earned. Progress is saved on this device only.</p>
      <div class="seg"><button id="rst" style="background:#fee2e2">Reset progress</button></div></div>
    <div class="row"><button class="brick c-green bigbtn" id="sdone">Done</button></div>
  </div></div>`;
  m.querySelectorAll('.seg button[data-k]').forEach(b=>b.onclick=()=>{ settings[b.dataset.k] = JSON.parse(b.dataset.v); save(); openSettings(); });
  m.querySelector('.modal-bg').onclick = e=>{ if(e.target.classList.contains('modal-bg')) closeSettings(); };
  $('#sdone').onclick = closeSettings;
  $('#rst').onclick = function(){
    if(this.dataset.c){ for(const k in progress) delete progress[k]; tower = []; save(); closeSettings(); }
    else { this.dataset.c = 1; this.textContent = 'Tap again to confirm reset'; }
  };
}
function closeSettings(){
  const n = $('#nm'); if(n){ settings.name = n.value.trim() || 'Charlie'; save(); }
  const m = document.getElementById('modal'); if(m) m.innerHTML='';
  if(window.onSettingsClosed) window.onSettingsClosed();
}
