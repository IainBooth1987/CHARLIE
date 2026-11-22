/* ===== Charlie's Learning — shared helpers (storage, voice, sounds, grown-ups) ===== */
const store = {
  get(k, d){ try{ const v = localStorage.getItem('cl_'+k); return v==null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem('cl_'+k, JSON.stringify(v)); }catch(e){} }
};
const settings = Object.assign({ name:'Charlie', speech:true, look:'auto', answers:'both', sfx:true, rate:0.85, cSkin:'#f2c79b', cHair:'#d2571d', cShirt:'#7d1a22' }, store.get('settings', {}));
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
/* Bricks earned (tower = list of earned brick colours) and bricks placed in Charlie's Tower (build) */
let build = store.get('build', []);
function saveBuild(){ store.set('build', build); }
const brickCost = b => b.k ? 0 : (b.w>=4 ? 2 : 1);
const bricksUsed = () => build.reduce((t,b)=>t+brickCost(b), 0);
const bricksLeft = () => Math.max(0, tower.length - bricksUsed());
function earnBricks(n){ const got = []; for(let i=0;i<n;i++){ const c = pick(COLS); tower.push(c); got.push(c); } save(); return got; }

/* Charlie — an original brick-built guide. pose: 'stand' | 'wave' | 'cheer' */
function charlieSVG(pose='wave', size=160){
  const sk = settings.cSkin, hr = settings.cHair, sh = settings.cShirt, tr = sh;
  const armL = pose==='cheer' ? 'rotate(150 18 94)' : '';
  const armR = pose==='cheer' ? 'rotate(-150 102 94)' : pose==='wave' ? '' : '';
  const waveCls = pose==='wave' ? 'ch-wave' : '';
  return `<svg class="charlie ch-${pose}" viewBox="0 0 120 200" width="${size}" height="${size*200/120}" role="img" aria-label="Charlie">
  <ellipse cx="60" cy="194" rx="40" ry="5" fill="rgba(27,42,107,.15)"/>
  <rect x="31" y="144" width="27" height="46" rx="4" fill="${tr}"/><rect x="62" y="144" width="27" height="46" rx="4" fill="${tr}"/>
  <rect x="31" y="182" width="27" height="8" rx="3" fill="rgba(0,0,0,.28)"/><rect x="62" y="182" width="27" height="8" rx="3" fill="rgba(0,0,0,.28)"/>
  <rect x="27" y="132" width="66" height="16" rx="4" fill="${tr}"/><rect x="27" y="142" width="66" height="6" rx="3" fill="rgba(0,0,0,.18)"/>
  <g class="ch-arm-l" transform="${armL}"><rect x="8" y="90" width="18" height="44" rx="9" fill="${sh}"/><rect x="8" y="90" width="18" height="44" rx="9" fill="rgba(0,0,0,.12)"/><circle cx="17" cy="138" r="9" fill="${sk}"/></g>
  <g class="ch-arm-r ${waveCls}" transform="${armR}"><rect x="94" y="90" width="18" height="44" rx="9" fill="${sh}"/><rect x="94" y="90" width="18" height="44" rx="9" fill="rgba(0,0,0,.12)"/><circle cx="103" cy="138" r="9" fill="${sk}"/></g>
  <rect x="22" y="86" width="76" height="50" rx="10" fill="${sh}"/>
  <rect x="22" y="126" width="76" height="10" rx="5" fill="rgba(0,0,0,.16)"/><rect x="28" y="90" width="64" height="5" rx="2.5" fill="rgba(255,255,255,.28)"/>
  <path d="M46 86 L60 104 L74 86 Z" fill="#8cc4f0"/><path d="M46 86 L53 96 L58 88 Z M74 86 L67 96 L62 88 Z" fill="#b9dcf7"/>
  <circle cx="60" cy="97" r="1.6" fill="#3b82c4"/>
  <path d="M40 87 Q48 100 60 106 Q72 100 80 87" stroke="rgba(0,0,0,.35)" stroke-width="2.5" fill="none"/>
  <line x1="60" y1="104" x2="60" y2="134" stroke="#c2304a" stroke-width="3"/><line x1="60" y1="104" x2="60" y2="134" stroke="rgba(0,0,0,.35)" stroke-width="1"/>
  <rect x="57" y="106" width="6" height="10" rx="1.5" fill="#9ca3af"/>
  <path d="M33 120 L45 122 M87 120 L75 122" stroke="rgba(0,0,0,.35)" stroke-width="2" stroke-linecap="round"/>
  <rect x="50" y="78" width="20" height="10" rx="3" fill="${sk}"/><rect x="50" y="84" width="20" height="4" fill="rgba(0,0,0,.12)"/>
  <rect x="26" y="24" width="68" height="60" rx="24" fill="${sk}"/>
  <ellipse cx="45" cy="56" rx="5" ry="6.5" fill="#1b2a6b"/><ellipse cx="75" cy="56" rx="5" ry="6.5" fill="#1b2a6b"/>
  <circle cx="46.8" cy="53.6" r="1.8" fill="#fff"/><circle cx="76.8" cy="53.6" r="1.8" fill="#fff"/>
  <ellipse cx="37" cy="68" rx="6" ry="4" fill="#f59e9e" opacity=".55"/><ellipse cx="83" cy="68" rx="6" ry="4" fill="#f59e9e" opacity=".55"/>
  <path d="M46 68 Q60 81 74 68" stroke="#1b2a6b" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="M20 52 Q16 20 44 12 Q60 2 80 10 Q102 18 100 50 L94 44 Q90 36 82 34 L84 44 Q74 34 64 36 L66 44 Q56 34 46 38 L44 46 Q36 38 30 40 L26 54 Z" fill="${hr}"/>
  <path d="M34 22 Q48 12 64 13 M70 15 Q84 18 92 30" stroke="rgba(0,0,0,.14)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M38 47 Q45 43 52 47 M68 47 Q75 43 82 47" stroke="${hr}" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M38 47 Q45 43 52 47 M68 47 Q75 43 82 47" stroke="rgba(0,0,0,.2)" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M30 30 Q44 18 60 17" stroke="rgba(255,255,255,.3)" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`;
}

/* Special pieces unlock as more bricks are earned (each can be placed once) */
const SPECIALS = [
  {k:'door',  e:'🚪', w:2, at:5,  n:'a door'},   {k:'window', e:'🪟', w:2, at:10, n:'a window'},
  {k:'tree',  e:'🌳', w:2, at:15, n:'a tree'},   {k:'flag',   e:'🚩', w:2, at:20, n:'a flag'},
  {k:'car',   e:'🚗', w:2, at:30, n:'a car'},    {k:'crown',  e:'👑', w:2, at:40, n:'a crown'},
  {k:'star',  e:'⭐', w:2, at:55, n:'a star'},    {k:'rainbow',e:'🌈', w:4, at:75, n:'a rainbow'}
];
const PLATE_COLS = 16;
function colTops(){ const t = new Array(PLATE_COLS).fill(0); build.forEach(b=>{ for(let i=b.x;i<b.x+b.w;i++) t[i] = Math.max(t[i], b.y+1); }); return t; }
const buildHeight = () => Math.max(0, ...colTops());
/* One placed piece as HTML; cell = width of one stud in px */
function pieceHTML(b, cell, extra=''){
  const h = cell*1.2, sp = SPECIALS.find(s=>s.k===b.k);
  const pos = `left:${b.x*cell}px;bottom:${b.y*h}px;width:${b.w*cell}px;height:${h}px;--s:${cell}px`;
  if(sp) return `<div class="tp sp ${extra}" style="${pos};font-size:${h*1.05}px">${sp.e}</div>`;
  return `<div class="tp ${extra}" style="${pos};--c:${CSSCOL[b.c]||b.c}"></div>`;
}
function buildHTML(cell){ return build.map(b=>pieceHTML(b, cell)).join(''); }

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
    <div class="grp"><b>Charlie's look</b>
      <div class="note" style="margin:2px 0 6px">Skin</div>${seg('cSkin',[['#f7d7bd','Light'],['#f2c79b','Medium'],['#c68a5a','Tan'],['#8d5a35','Brown'],['#5b3a23','Dark']])}
      <div class="note" style="margin:10px 0 6px">Hair</div>${seg('cHair',[['#d2571d','Ginger'],['#6b3f1d','Brown'],['#e0b44c','Blonde'],['#1f1a17','Black']])}
      <div class="note" style="margin:10px 0 6px">Outfit</div>${seg('cShirt',[['#7d1a22','Dark red'],['#e3262f','Red'],['#0b6fd6','Blue'],['#16a34a','Green'],['#f97316','Orange'],['#8b46d6','Purple']])}</div>
    <div class="grp"><b>Progress</b><p class="note">${tower.length} bricks earned. Progress is saved on this device only.</p>
      <div class="seg"><button id="rst" style="background:#fee2e2">Reset progress</button></div></div>
    <div class="row"><button class="brick c-green bigbtn" id="sdone">Done</button></div>
  </div></div>`;
  m.querySelectorAll('.seg button[data-k]').forEach(b=>b.onclick=()=>{ settings[b.dataset.k] = JSON.parse(b.dataset.v); save(); openSettings(); });
  m.querySelector('.modal-bg').onclick = e=>{ if(e.target.classList.contains('modal-bg')) closeSettings(); };
  $('#sdone').onclick = closeSettings;
  $('#rst').onclick = function(){
    if(this.dataset.c){ for(const k in progress) delete progress[k]; tower = []; build = []; save(); saveBuild(); closeSettings(); }
    else { this.dataset.c = 1; this.textContent = 'Tap again to confirm reset'; }
  };
}
function closeSettings(){
  const n = $('#nm'); if(n){ settings.name = n.value.trim() || 'Charlie'; save(); }
  const m = document.getElementById('modal'); if(m) m.innerHTML='';
  if(window.onSettingsClosed) window.onSettingsClosed();
}
