/* =========================================================
   Charlie's Learning — Subitising (runs on maths/shared/core.js)
   LEVELS — research-informed order (NRICH; Third Space Learning; EYFS ELG "subitise up to 5")
   Star Flash goes up through the number sizes. At each size: a supported look (picture stays,
   children can tap to check), then a quick look. New sizes start with familiar dice patterns;
   less tidy layouts come later. 6–10 are seen as "five and more" in two colours (conceptual).
   look = seconds the picture shows before the doors close (null = never hides).
   ========================================================= */
(function(){
const W = window.WORLD, G = W.games || {};
const FLASH_LEVELS = [
  {n:'Level 1', lo:1, hi:3,  s:'1 to 3', mode:'👀 Look & check', look:null, layout:'dice',   show:'small'},
  {n:'Level 2', lo:1, hi:3,  s:'1 to 3', mode:'⚡ Quick look',   look:3,    layout:'dice',   show:'small'},
  {n:'Level 3', lo:1, hi:5,  s:'1 to 5', mode:'👀 Look & check', look:null, layout:'dice',   show:'small'},
  {n:'Level 4', lo:1, hi:5,  s:'1 to 5 · new patterns', mode:'⚡ Quick look', look:3, layout:'varied', show:'small'},
  {n:'Level 5', lo:6, hi:10, s:'6 to 10 · five and more', mode:'🖐️ Five and more', look:5, layout:'five', show:'five'},
  {n:'Level 6', lo:1, hi:10, s:'Mix 1 to 10', mode:'🚀 Super quick', look:2, layout:'varied', show:'mix'}
];
/* Same or Different? and Make It never hide anything, so they only need number ranges */
const RANGE_LEVELS = [
  {n:'Level 1', lo:1, hi:3,  s:'1 to 3', layout:'dice',   show:'small'},
  {n:'Level 2', lo:1, hi:5,  s:'1 to 5', layout:'varied', show:'small'},
  {n:'Level 3', lo:6, hi:10, s:'6 to 10 · five and more', layout:'five', show:'five'},
  {n:'Level 4', lo:1, hi:10, s:'Mix 1 to 10', layout:'varied', show:'mix'}
];
/* Look-and-check levels always stay on screen. Grown-ups can change the look time for the others. */
function lookTime(L){
  if(L.look === null) return null;
  const v = settings.look;
  if(v === undefined || v === 'auto') return L.look;
  return v === 0 ? null : v;
}

/* ---------- Game 1: Flash ---------- */
function qFlash(g, A){
  const n = A.levelNum(g), L = g.L, look = lookTime(L), counting = L.look===null;
  A.shell(g, `
    <div class="prompt">How many ${g.it[1]}?
      ${look ? `<button class="brick c-blue say" id="peek" aria-label="Look again">👀</button>` : ''}</div>
    <div class="flashwrap">${A.plateHTML(n, g.it[0], undefined, L.layout)}
      <div class="shutter" id="sh"><div class="door l"></div><div class="door r"></div><div class="q">?</div></div></div>
    ${counting ? `<div class="hint">👆 Not sure? Tap each ${g.it[2]} to check</div>` : ''}
    <div class="opts hidden" id="opts">${A.numOpts(n, L.lo, L.hi).map(A.ansCard).join('')}</div>`);
  const sh = $('#sh'), opts = $('#opts');
  if(counting){
    A.say(g.q===0 ? `How many ${g.it[1]}? Not sure? Tap them to check.` : `How many ${g.it[1]}?`);
    let c = 0;
    document.querySelectorAll('.obj').forEach(o=>{
      o.classList.add('tapcount');
      o.onclick = ()=>{ if(g.locked || o.dataset.c) return; c++; o.dataset.c = c; o.classList.add('counted'); sfx.click(); speak(A.NUMWORD[c], .9); };
    });
    A.later(()=>opts.classList.remove('hidden'), 700);
  } else if(look){
    A.say(g.q===0 ? `Ready? Look at the ${g.it[1]}!` : pick([`Look!`,`Quick look!`,`Here they come!`]));
    A.later(()=>{ if(g.locked) return; sh.classList.add('closed'); opts.classList.remove('hidden'); A.say(`How many ${g.it[1]} did you see?`); }, look*1000 + 700);
    $('#peek').onclick = ()=>{ sfx.click(); sh.classList.remove('closed'); A.later(()=>{ if(!g.locked) sh.classList.add('closed'); }, look*1000); };
  } else {
    A.later(()=>{ opts.classList.remove('hidden'); A.say(`How many ${g.it[1]}?`); }, 900);
  }
  opts.querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(+b.dataset.n===n){
      A.right(g, b); sh.classList.remove('closed');
      A.praise(); A.later(()=>speak(`${A.NUMWORD[n]} ${A.word(g,n)}!`), 1100);
      g.how = (g.how||0)+1;
      if(!counting && g.how%2===0){
        A.later(()=>{ $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">💬 How did you know it was <b>${n}</b>? Tell a grown-up what you saw!</div>`);
          A.say(`How did you know it was ${A.NUMWORD[n]}? Tell a grown-up!`, {hold:5000}); }, 1900);
        A.advance(g, 6000);
      } else A.advance(g, 2600);
    } else A.wrong(g, b);
  });
}

/* ---------- Game 2: Same or Different? ---------- */
function qMatch(g, A){
  const L = g.L, a = A.levelNum(g), same = Math.random()<.5;
  let b = a;
  if(!same){ const c = [a-1,a+1,a-2,a+2].filter(x=>x>=Math.max(1,L.lo-1)&&x<=Math.min(10,L.hi+1)); b = pick(c.slice(0,2).concat(c)); }
  const sA = pick(['frame','fiveplus']), sB = Math.random()<.7 ? (sA==='frame'?'fiveplus':'frame') : sA;
  /* Half the time the second tray shows different things (another picture, or dots):
     the number stays the same whatever we are counting. */
  const others = [...W.items, A.DOT].filter(x=>x!==g.it);
  const i2 = Math.random()<.5 ? pick(others) : g.it;
  A.shell(g, `
    <div class="prompt">Same number, or different?</div>
    <div class="plates" style="gap:26px"><div class="tray">${A.plateHTML(a, g.it[0], sA, L.layout)}</div><div class="tray">${A.plateHTML(b, i2[0], sB, L.layout)}</div></div>
    <div class="sd">
      <div class="glass sdbtn same" role="button" tabindex="0" data-a="same"><span class="sym">=</span> Same</div>
      <div class="glass sdbtn diff" role="button" tabindex="0" data-a="diff"><span class="sym">≠</span> Different</div>
    </div>`);
  A.say('Same number, or different?');
  document.querySelectorAll('.sdbtn').forEach(btn=>btn.onclick=()=>{
    if(g.locked) return;
    if((btn.dataset.a==='same')===same){
      A.right(g, btn);
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">${same
        ? `${a} ${A.wordOf(g.it,a)} and ${b} ${A.wordOf(i2,b)} — the <b>same</b> number!`
        : `${a} ${A.wordOf(g.it,a)} and ${b} ${A.wordOf(i2,b)} — ${a>b?'the first':'the second'} has <b>more</b>.`}</div>`);
      A.praise(same ? `Both have ${A.NUMWORD[a]}!` : `${A.NUMWORD[a]} and ${A.NUMWORD[b]}.`);
      A.advance(g, 3600);
    } else A.wrong(g, btn);
  });
}

/* ---------- Game 3: Make It (ten frame) ---------- */
function qMake(g, A){
  const n = A.levelNum(g); g.on = new Set();
  A.shell(g, `
    <div class="prompt">Make <span class="target">${n}</span> ${A.word(g,n)}</div>
    <div class="frame">${Array.from({length:10},(_,i)=>`<button class="cell" data-i="${i}" aria-label="space ${i+1}"></button>`).join('')}</div>
    <div class="row"><button class="brick c-orange bigbtn" id="clear">Clear 🧹</button><button class="brick c-green bigbtn" id="check">Done! ✅</button></div>`);
  A.say(`Make ${A.NUMWORD[n]} ${A.word(g,n)}!`);
  document.querySelectorAll('.cell').forEach(c=>c.onclick=()=>{
    if(g.locked) return; const i = +c.dataset.i; sfx.click();
    if(g.on.has(i)){ g.on.delete(i); c.classList.remove('on'); c.innerHTML=''; }
    else { g.on.add(i); c.classList.add('on'); c.innerHTML = `<span>${g.it[0]}</span>`; }
  });
  $('#clear').onclick = ()=>{ if(g.locked) return; sfx.click(); g.on.clear(); document.querySelectorAll('.cell').forEach(c=>{ c.classList.remove('on'); c.innerHTML=''; }); };
  $('#check').onclick = ()=>{
    if(g.locked) return;
    const k = g.on.size;
    if(k===n){
      A.right(g, $('.frame'));
      document.querySelectorAll('.cell.on span').forEach(s=>{ s.style.animation='objJoy .7s'; });
      if(n>=5) $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">${n===5?'5 fills a whole row!':`${n} is <b>5</b> and <b>${n-5}</b> more!`}</div>`);
      A.praise(); A.advance(g, 2800);
    } else {
      g.tries++; sfx.oops();
      A.say(k<n ? `You have ${A.NUMWORD[k]}. You need ${A.NUMWORD[n]}. Add some more!` : `You have ${A.NUMWORD[k]}. That's too many — take some away.`);
    }
  };
}

GAME({
  id:'subitising', name:'Subitising', icon:'⚡', tagline:'⚡ Spot how many — no counting!', keyPrefix:'subw',
  acts:[
    {id:'flash', ico:G.flashIcon||'⚡', t:G.flash||'Flash!', d:'Quick look — how many did you see?', step:'GAME 1 · SEE IT'},
    {id:'match', ico:G.matchIcon||'🧩', t:G.match||'Same or Different?', d:'Do both show the same number?', step:'GAME 2 · COMPARE'},
    {id:'make',  ico:G.makeIcon||'🔨', t:G.make||'Make It', d:'Fill the frame to make the number', step:'GAME 3 · BUILD IT'}
  ],
  levelsFor: act => act==='flash' ? FLASH_LEVELS : RANGE_LEVELS,
  games:{ flash:qFlash, match:qMatch, make:qMake },
  extraSettings:[
    ['look','Flash games — how long the picture shows',[['auto','Gets quicker each level (recommended)'],[5,'5 secs'],[3,'3 secs'],[2,'2 secs'],[0,'Always stay on']],
     'Levels 1 and 3 always stay on screen so children can look and tap to check. The other levels hide the picture, so children "just see" the number instead of counting.'],
    ['pics','What children see',[['mix','Mix of pictures and dots (recommended)'],['pictures','Theme pictures only'],['dots','Simple dots only']],
     'Simple dots are easier to subitise than pictures, but pictures are more fun. A mix gives both — every few rounds uses dots.'],
    ['answers','Answer cards show',[['both','Number + dots'],['dots','Dots only'],['numbers','Numbers only']],
     'Dots only is best for children who don\'t know their numerals yet.']
  ]
});
})();
