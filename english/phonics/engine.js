/* =========================================================
   Charlie's Learning — Phonics (Reception), runs on maths/shared/core.js
   Order of sounds and tricky words follows Little Wandle Letters and Sounds Revised (Reception):
     Autumn 1: s a t p · i n m d · g o c k · ck e u r · h b f l        tricky: is I the
     Autumn 2: ff ll ss j · v w x y · z zz qu ch · sh th ng nk         tricky: put pull full as and has his her go no to into she push he of we me be
     Spring 1: ai ee igh oa · oo ar or · ur ow oi ear · air ure er        tricky: was you they my by all are sure pure
   The four games mirror a phonics lesson: revisit sounds, read (blend), spell (segment), tricky words.
   Pure sounds need a real voice: a clip named "sound s" etc. in assets/voice/manifest.js is played
   when present. There is no computer voice on the site at all.
   ========================================================= */
(function(){
const W = window.WORLD;
const later = (f, ms) => window.SUB.api.later(f, ms);

/* ---------- Little Wandle blocks (cumulative) ---------- */
const BLOCKS = [
  {n:'Level 1', s:'Autumn 1 · weeks 1–2', em:'s a t p i n m d', g:['s','a','t','p','i','n','m','d'], tricky:[]},
  {n:'Level 2', s:'Autumn 1 · weeks 3–4', em:'g o c k ck e u r', g:['g','o','c','k','ck','e','u','r'], tricky:['is','I']},
  {n:'Level 3', s:'Autumn 1 · week 5',    em:'h b f l', g:['h','b','f','l'], tricky:['the']},
  {n:'Level 4', s:'Autumn 2 · weeks 1–2', em:'ff ll ss j v w x y', g:['ff','ll','ss','j','v','w','x','y'], tricky:['put','pull','full','as','and','has','his','her']},
  {n:'Level 5', s:'Autumn 2 · weeks 3–4', em:'z zz qu ch sh th ng nk', g:['z','zz','qu','ch','sh','th','ng','nk'], tricky:['go','no','to','into','she','push','he','of','we','me','be']},
  {n:'Level 6', s:'Spring 1',             em:'ai ee igh oa oo ar or…', g:['ai','ee','igh','oa','oo','ar','or','ur','ow','oi','ear','air','ure','er'], tricky:['was','you','they','my','by','all','are','sure','pure']}
];
const taught = lvl => BLOCKS.slice(0, lvl+1).flatMap(b=>b.g);
const newOf  = lvl => BLOCKS[lvl].g;
const trickyTaught = lvl => BLOCKS.slice(0, lvl+1).flatMap(b=>b.tricky);

/* same sound, different spelling — never offered as a wrong answer next to each other */
const SAME = [['c','k','ck'],['s','ss'],['f','ff'],['l','ll'],['z','zz'],['ur','er']];
/* sounds you can genuinely hear inside another one (the end of "think" sounds like k; "queen" starts with a k sound) */
const OVERLAP = {nk:['k','c','ck','n','ng'], qu:['k','c','ck'], ng:['n','nk'], x:['k','c','ck','s']};
const twins = g => [...(SAME.find(s=>s.includes(g)) || [g]), ...(OVERLAP[g]||[])];

/* ---------- picture for each sound (own pictures, not a scheme's mnemonics) ---------- */
const SOUNDPIC = {
  s:['snake','🐍','start'], a:['ant','🐜','start'], t:['tiger','🐯','start'], p:['penguin','🐧','start'],
  i:['insect','🐞','start'], n:['nest','🪺','start'], m:['mouse','🐭','start'], d:['dinosaur','🦕','start'],
  g:['goat','🐐','start'], o:['octopus','🐙','start'], c:['cat','🐱','start'], k:['kite','🪁','start'],
  ck:['duck','🦆','end'], e:['egg','🥚','start'], u:['umbrella','☂️','start'], r:['rainbow','🌈','start'],
  h:['horse','🐴','start'], b:['balloon','🎈','start'], f:['fish','🐟','start'], l:['lion','🦁','start'],
  ff:['muffin','🧁','middle'], ll:['bell','🔔','end'], ss:['dress','👗','end'], j:['jellyfish','🪼','start'],
  v:['volcano','🌋','start'], w:['worm','🪱','start'], x:['box','📦','end'], y:['yo-yo','🪀','start'],
  z:['zebra','🦓','start'], zz:['buzz','🐝','end'], qu:['queen','👸','start'], ch:['cheese','🧀','start'],
  sh:['shell','🐚','start'], th:['thumb','👍','start'], ng:['ring','💍','end'], nk:['think','🤔','end'],
  ai:['rain','🌧️','middle'], ee:['green','🟢','middle'], igh:['light','💡','middle'], oa:['boat','⛵','middle'],
  oo:['food','🍲','middle'], ar:['car','🚗','end'], or:['fork','🍴','middle'], ur:['surf','🏄','middle'],
  ow:['cow','🐄','end'], oi:['coin','🪙','middle'], ear:['beard','🧔','middle'], air:['chair','🪑','end'], ure:['pure','💧','end'], er:['fern','🌿','middle']
};

/* ---------- decodable words with pictures (split into graphemes) ---------- */
const WORDS = [
  'a-n-t🐜','p-i-n📌','m-a-p🗺️','p-a-n🍳','t-a-p🚰','m-a-n👨','t-i-n🥫','s-a-d😢','n-a-p😴',
  'c-a-t🐱','d-o-g🐶','p-i-g🐷','s-u-n☀️','c-u-p☕','n-u-t🥜','r-a-t🐀','n-e-t🥅','p-e-n🖊️','d-u-ck🦆','s-o-ck🧦','r-o-ck🪨',
  'c-o-g⚙️','r-e-d🔴','r-u-n🏃','t-e-n🔟','p-o-t🍯','t-i-ck✔️',
  'h-a-t🎩','b-a-t🦇','b-u-s🚌','b-e-d🛏️','b-a-g👜','h-e-n🐔','f-a-n🪭','l-o-g🪵','l-e-g🦵','l-i-p👄','l-o-ck🔒','h-u-t🛖','b-i-n🗑️','b-u-g🐛','f-o-g🌫️','h-u-g🤗',
  'b-e-ll🔔','d-o-ll🪆','h-i-ll⛰️','j-e-t✈️','v-a-n🚐','w-e-b🕸️','b-o-x📦','f-o-x🦊','s-i-x6️⃣','y-a-k🐃','k-i-ss💋','y-u-m😋',
  'b-u-zz🐝','f-i-zz🥤','qu-i-z❓','ch-i-ck🐤','ch-i-p🍟','sh-e-ll🐚','sh-i-p🚢','f-i-sh🐟','sh-o-p🏪','d-i-sh🍽️','c-a-sh💷','b-a-th🛁','r-i-ng💍','k-i-ng👑','w-i-ng🪽','s-i-ng🎤','b-a-ng💥','w-i-nk😉',
  'n-ai-l💅','s-ai-l⛵','r-ai-n🌧️','sh-ee-p🐑','s-ee-d🌱','f-ee-t🦶','l-igh-t💡','n-igh-t🌃','g-oa-t🐐','c-oa-t🧥','s-oa-p🧼','r-oa-d🛣️',
  'm-oo-n🌙','b-oo-k📖','h-oo-k🪝','c-ar🚗','sh-ar-k🦈','j-ar🫙','f-or-k🍴','c-or-n🌽','c-ow🐄','ow-l🦉','c-oi-n🪙','ear👂','ch-air🪑','f-air🎡','s-ur-f🏄','h-ur-t🤕','ch-ur-ch⛪','b-ur-g-er🍔',
  'l-e-tt-er✉️','h-a-mm-er🔨','l-a-dd-er🪜'
].map(s=>{ const m = s.match(/^([a-z-]+)(.+)$/); const g = m[1].split('-'); return {w:g.join(''), g, e:m[2]}; });
/* "tt", "mm", "dd" in Spring 1 week 4 count as already-taught double letters */
const EXTRA_OK = {6:['tt','mm','dd']};
const wordsFor = lvl => { const ok = new Set([...taught(lvl), ...(lvl>=5 ? EXTRA_OK[6] : [])]); return WORDS.filter(x=>x.g.every(g=>ok.has(g))); };
/* prefer words that use the sounds from this level */
function pickWord(g, lvl){
  const all = wordsFor(lvl), nw = new Set(newOf(lvl));
  const fresh = all.filter(x=>x.g.some(q=>nw.has(q)));
  const pool = (fresh.length && Math.random()<.7) ? fresh : all;
  let x; let t=0; do{ x = pick(pool); }while((g.used||[]).includes(x.w) && t++<20);
  g.used = [...(g.used||[]).slice(-5), x.w]; return x;
}

/* tricky words and their tricky part (from the programme's parent guides) */
const TRICKY_PART = {is:[1], I:[0], the:[2], put:[1], pull:[1], full:[1], push:[1], as:[1], has:[2], his:[2], her:[1,2],
  go:[1], no:[1], to:[1], into:[3], she:[2], he:[1], we:[1], me:[1], be:[1], of:[1],
  was:[1,2], you:[1,2], they:[2,3], my:[1], by:[1], all:[1,2], are:[1,2], sure:[1,2,3], pure:[1,2,3]};

/* ---------- pure sounds: recorded clip only ---------- */
function hasSound(gr){ const c = window.VOICE_CLIPS || {}; return Object.keys(c).some(k=>k.toLowerCase().trim()===('sound '+gr)); }
function playSound(gr){ return hasSound(gr) ? playClip('sound '+gr) : false; }
const card = (gr, extra='') => `<button class="gtile ${gr.length>1?'multi':''} ${extra}" data-g="${gr}">${gr}</button>`;
/* sound buttons: a dot under one letter, a line under two or three letters that make one sound */
const buttonsHTML = gs => gs.map((gr,i)=>`<span class="gph" data-i="${i}"><span class="glet">${gr}</span><span class="sb ${gr.length>1?'sbline':'sbdot'}"></span></span>`).join('');


/* ---------- blending: play the recorded sounds in a row, slowly then quickly (Web Audio for tight timing) ---------- */
const bufCache = {};
function soundBuf(gr){
  const c = window.VOICE_CLIPS || {}; const k = Object.keys(c).find(k=>k.toLowerCase().trim()===('sound '+gr)); if(!k) return Promise.resolve(null);
  const f = c[k], a = audio(); if(!a) return Promise.resolve(null);
  if(!bufCache[f]) bufCache[f] = fetch(ASSET_BASE + 'voice/' + f).then(r=>r.arrayBuffer())
    .then(b=>new Promise((res,rej)=>a.decodeAudioData(b, res, rej))).catch(()=>null);
  return bufCache[f];
}
/* where the real sound starts and ends inside a clip (clips carry a little silence either side) */
const trimCache = new WeakMap();
function trimOf(b){
  if(trimCache.has(b)) return trimCache.get(b);
  const d = b.getChannelData(0), n = d.length; let pk = 0;
  for(let i=0;i<n;i++){ const v = Math.abs(d[i]); if(v>pk) pk = v; }
  const th = pk * .05; let s = 0, e = n-1;
  while(s<n && Math.abs(d[s])<th) s++; while(e>s && Math.abs(d[e])<th) e--;
  const r = {off: Math.max(0, s/b.sampleRate - .01), len: (e-s)/b.sampleRate + .03};
  trimCache.set(b, r); return r;
}
/* quick "bouncy" sounds stay short in a blend; stretchy sounds (vowels, m, s, sh…) are held */
const STOPS = new Set(['b','c','d','g','k','p','t','ck','j','ch','qu','x']);
async function blendPlay(gs, els, wordEl){
  const a = audio(); const bufs = await Promise.all(gs.map(soundBuf));
  if(!a || bufs.some(b=>!b)) return 0;
  let t = a.currentTime + .1; const start = t; const marks = [];
  const play = (b, at, max, fadeIn) => { const tr = trimOf(b), len = Math.min(tr.len, max);
    const src = a.createBufferSource(), g = a.createGain(); src.buffer = b; src.connect(g); g.connect(a.destination);
    g.gain.setValueAtTime(fadeIn ? 0 : 1, at); if(fadeIn) g.gain.linearRampToValueAtTime(1, at + fadeIn);
    g.gain.setValueAtTime(1, at + Math.max(fadeIn||0, len - .06)); g.gain.linearRampToValueAtTime(0, at + len);
    src.start(at, tr.off, len + .01); return len; };
  /* 1) sound talk: each sound on its own, cards apart */
  bufs.forEach((b,i)=>{ marks.push([t - start, i]); t += play(b, t, .6) + .38; });
  t += .25;
  /* 2) the child blends: cards slide together in silence (stitched sounds never sound like the real word) */
  const swoopAt = t - start, swoopDur = .9; t += swoopDur;
  marks.forEach(([ms,i])=>later(()=>{ const el = els[i]; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit','lit'); }, ms*1000 + 100));
  later(()=>{ wordEl.style.transitionDuration = swoopDur+'s'; wordEl.classList.add('blended');
    const sw = wordEl.querySelector('.swoop'); if(sw){ sw.style.animationDuration = swoopDur+'s'; sw.classList.add('go'); } }, swoopAt*1000 + 100);
  return (t - start)*1000 + 250;
}

const LEVELS = BLOCKS.map(b=>({n:b.n, s:b.s, em:b.em}));

/* =========================================================
   Game 1 — Sound Spotter (revisit and teach)
   ========================================================= */
function qSounds(g, A){
  const lvl = g.lvl, all = taught(lvl), nw = newOf(lvl);
  let gr; let t=0; do{ gr = Math.random()<.65 ? pick(nw) : pick(all); }while((gr===g.lastG) && t++<10); g.lastG = gr;
  const [word, emo, pos] = SOUNDPIC[gr];
  const bad = new Set(twins(gr));
  const opts = shuffle([gr, ...shuffle(all.filter(x=>!bad.has(x))).slice(0, lvl===0 ? 2 : 3)]);
  const listen = hasSound(gr) && Math.random()<.5;
  const where = pos==='start' ? 'at the start of' : pos==='end' ? 'at the end of' : 'in the middle of';
  A.shell(g, `
    <div class="prompt">${listen ? 'Which one makes this sound?' : `What sound can you hear ${where} <b>${word}</b>?`}</div>
    <div class="spic">${listen ? '<button class="brick c-blue bigbtn" id="again">🔊 Hear it again</button>' : `<button class="bigpic" id="again" aria-label="${word}">${emo}</button>`}</div>
    <div class="gtiles" id="opts">${opts.map(o=>card(o)).join('')}</div>`);
  const ask = () => { if(listen) return playSound(gr); A.say(`${word}… What sound can you hear ${where} ${word}?`, {hold:5000}); if(hasClip(word)) later(()=>speak(word), 250); };
  ask(); $('#again').onclick = ()=>{ sfx.click(); listen ? playSound(gr) : speak(word); };   // silent until recordings are added
  $('#opts').querySelectorAll('.gtile').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(b.dataset.g===gr){
      A.right(g, b);
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><span class="gbig">${gr}</span> ${listen ? '' : `as in ${word} ${emo}`}${gr.length>1 ? ` — ${gr.length===2?'two':'three'} letters, one sound` : ''}</div>`);
      later(()=>playSound(gr), 200); A.praise(''); A.advance(g, 3200);
    } else A.wrong(g, b);
  });
}

/* =========================================================
   Game 2 — Read It (blending with sound buttons)
   ========================================================= */
function qRead(g, A){
  const lvl = g.lvl, x = pickWord(g, lvl);
  const others = shuffle(wordsFor(lvl).filter(o=>o.w!==x.w && o.e!==x.e)).slice(0,2);
  const opts = shuffle([x, ...others]);
  A.shell(g, `
    <div class="prompt">Read the word. Tap the sound buttons!</div>
    <div class="word" id="word">${buttonsHTML(x.g)}<span class="swoop"></span></div>
    <button class="brick c-green bigbtn hidden" id="blend">Blend it! ➰</button>
    <div class="picopts hidden" id="opts">${opts.map(o=>`<button class="pic" data-w="${o.w}">${o.e}</button>`).join('')}</div>`);
  A.say('Say each sound, then blend them together. Which picture is it?', {hold:4500});
  $('#word').classList.add('cards'); const els = [...document.querySelectorAll('.gph')], tapped = new Set();
  const nextPulse = () => { els.forEach(e=>e.classList.remove('next')); const n = els.findIndex((_,i)=>!tapped.has(i)); if(n>=0) els[n].classList.add('next'); };
  nextPulse();
  els.forEach(el=>el.onclick=()=>{
    if(g.locked) return; const i = +el.dataset.i; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit','lit');
    if(!playSound(x.g[i])) sfx.click();
    tapped.add(i); nextPulse();
    if(tapped.size===x.g.length){ $('#blend').classList.remove('hidden'); }
  });
  let blending = false;
  $('#blend').onclick = async ()=>{
    if(blending) return; blending = true; sfx.click(); $('#blend').classList.add('hidden'); stopVoice();
    const ms = await blendPlay(x.g, els, $('#word'));
    if(!ms) $('#word').classList.add('blended');
    later(()=>{ A.say('Now you blend it! What is the word?', {hold:2500}); }, ms || 0);
    later(()=>{ if(hasClip(x.w)) speak(x.w); }, (ms || 0) + 2200);
    later(()=>{ $('#opts').classList.remove('hidden'); A.say('Which picture is it?'); blending = false; }, (ms || 0) + (hasClip(x.w) ? 3400 : 2600));
  };
  /* children who blend in their head can choose straight away after a short look */
  later(()=>{ if(!g.locked && !blending){ $('#opts').classList.remove('hidden'); } }, 6000);
  $('#opts').querySelectorAll('.pic').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(b.dataset.w===x.w){
      A.right(g, b); $('#word').classList.add('blended');
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${x.g.join(' – ')}</b> … <b>${x.w}</b>!</div>`);
      speak(x.w); later(()=>A.praise(''), 900); A.advance(g, 3200);
    } else A.wrong(g, b);
  });
}

/* =========================================================
   Game 3 — Spell It (segmenting)
   ========================================================= */
function qSpell(g, A){
  const lvl = g.lvl, x = pickWord(g, lvl);
  const bad = new Set(x.g.flatMap(twins));
  const extra = shuffle(taught(lvl).filter(q=>!bad.has(q))).slice(0, x.g.length<=3 ? 2 : 3);
  const tray = shuffle([...new Set([...x.g, ...extra])]);
  let got = [];
  A.shell(g, `
    <div class="prompt">Spell the word</div>
    <div class="spellrow"><button class="bigpic" id="say" aria-label="hear the word">${x.e}</button>
      <div class="slots" id="slots">${x.g.map((_,i)=>`<div class="slot" data-i="${i}"></div>`).join('')}</div></div>
    <div class="gtiles" id="opts">${tray.map(t=>card(t,'small')).join('')}</div>
    <div class="row"><button class="brick c-orange bigbtn" id="undo">⬅ Back</button></div>
    <div class="hint">${x.g.length} sounds — one box for each sound.</div>`);
  const sayW = () => { A.say('What is it? Say the sounds, then find them!', {hold:4000}); later(()=>speak(x.w), 1600); };
  sayW(); $('#say').onclick = ()=>{ sfx.click(); speak(x.w); };
  const draw = () => document.querySelectorAll('.slot').forEach((s,i)=>{ s.textContent = got[i] || ''; s.classList.toggle('on', !!got[i]); s.classList.toggle('next', i===got.length); });
  draw();
  $('#undo').onclick = ()=>{ if(g.locked||!got.length) return; sfx.click(); got.pop(); draw(); };
  $('#opts').querySelectorAll('.gtile').forEach(b=>b.onclick=()=>{
    if(g.locked || got.length>=x.g.length) return; sfx.click(); playSound(b.dataset.g);
    got.push(b.dataset.g); draw();
    if(got.length===x.g.length){
      if(got.join('')===x.g.join('')){
        A.right(g, $('#slots'));
        $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${x.w}</b> — ${x.g.join(' – ')}</div>`);
        speak(x.w); later(()=>A.praise(''), 900); A.advance(g, 3200);
      } else {
        g.tries++; sfx.oops();
        const wrongAt = got.findIndex((q,i)=>q!==x.g[i]);
        document.querySelectorAll('.slot')[wrongAt].classList.add('bad');
        later(()=>{ got = got.slice(0, wrongAt); draw(); document.querySelectorAll('.slot').forEach(s=>s.classList.remove('bad')); }, 900);
        A.say('Nearly! Say it slowly and listen for each sound.'); later(()=>speak(x.w), 1400);
      }
    }
  });
}

/* =========================================================
   Game 4 — Tricky Words
   ========================================================= */
function qTricky(g, A){
  const lvl = g.lvl + 1, pool = trickyTaught(lvl);   // tricky words start in Autumn 1 week 3, so its Level 1 = block 2
  const nw = BLOCKS[lvl].tricky.length ? BLOCKS[lvl].tricky : pool;
  let w; let t=0; do{ w = Math.random()<.65 ? pick(nw) : pick(pool); }while(w===g.lastW && t++<10); g.lastW = w; g.target = w;
  const parts = TRICKY_PART[w] || [];
  const marked = [...w].map((ch,i)=>parts.includes(i) ? `<span class="tpart">${ch}</span>` : ch).join('');
  /* With a recording of the word: listen and find it. Without one: flashcard — the child reads it, a grown-up checks. */
  if(!hasClip(w)){
    A.shell(g, `
      <div class="prompt">Can you read this word?</div>
      <div class="wcards"><div class="wcard big" id="card">${w}</div></div>
      <div class="hint">Grown-up: listen as your child reads it, then tap a button.</div>
      <div class="row"><button class="brick c-green bigbtn" id="yes">✅ Read it!</button><button class="brick c-orange bigbtn" id="tip">💡 Show the tricky part</button></div>`);
    A.say('Can you read this word?', {hold:4000});
    $('#tip').onclick = ()=>{ sfx.click(); g.tries++; $('#card').innerHTML = marked; $('#tip').classList.add('hidden');
      A.say("The red part is tricky — it doesn't sound the way we'd expect. Try again!"); };
    $('#yes').onclick = ()=>{ if(g.locked) return; A.right(g, $('#card')); $('#card').innerHTML = marked;
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${w}</b> is a tricky word — the <span class="tpart">red</span> part is the tricky bit.</div>`);
      A.praise(''); A.advance(g, 2800); };
    return;
  }
  const decoys = [...shuffle(pool.filter(o=>o.toLowerCase()!==w.toLowerCase())), ...shuffle(wordsFor(lvl).map(o=>o.w).filter(o=>o.length<=w.length+1))].slice(0, 2);   // other tricky words first
  const opts = shuffle([w, ...decoys]);
  A.shell(g, `
    <div class="prompt">Find the word</div>
    <div class="spic"><button class="brick c-blue bigbtn" id="again">🔊 Hear it again</button></div>
    <div class="wcards" id="opts">${opts.map(o=>`<button class="wcard" data-w="${o}">${o}</button>`).join('')}</div>`);
  A.say('Listen, then find the word!', {hold:4000}); later(()=>speak(w), 1500);   // the word is heard, never written in the bubble
  $('#again').onclick = ()=>{ sfx.click(); speak(w); };
  $('#opts').querySelectorAll('.wcard').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(b.dataset.w===w){
      A.right(g, b); b.innerHTML = marked;
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${w}</b> is a tricky word — the <span class="tpart">red</span> part doesn't sound the way we'd expect.</div>`);
      speak(w); later(()=>A.praise(''), 900); A.advance(g, 3600);
    } else A.wrong(g, b);
  });
}

GAME({
  id:'phonics', name:'Phonics', icon:'🔤', tagline:'🔤 Sounds, reading and spelling!', keyPrefix:'phw', itemModes:false,
  siblings:[],
  acts:[
    {id:'sounds', ico:'👂', t:'Sound Spotter', d:'Which sound can you hear?', step:'GAME 1 · SOUNDS'},
    {id:'read',   ico:'📖', t:'Read It',       d:'Sound buttons, then blend', step:'GAME 2 · READ'},
    {id:'spell',  ico:'✏️', t:'Spell It',      d:'One box for each sound',    step:'GAME 3 · SPELL'},
    {id:'tricky', ico:'🌀', t:'Tricky Words',  d:'Words with a tricky part',  step:'GAME 4 · TRICKY'}
  ],
  levelsFor: act => act==='tricky' ? BLOCKS.slice(1).map((b,i)=>({n:'Level '+(i+1), s:b.s, em:b.tricky.slice(0,4).join(' ')+(b.tricky.length>4?'…':'')})) : LEVELS,
  games:{ sounds:qSounds, read:qRead, spell:qSpell, tricky:qTricky }
});
window.PHONICS = {BLOCKS, WORDS, wordsFor, taught, SOUNDPIC};
})();
