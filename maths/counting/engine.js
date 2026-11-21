/* =========================================================
   Charlie's Learning — Counting (runs on maths/shared/core.js)
   Built on the counting principles (Gelman & Gallistel 1978) and Development Matters (Reception):
     • one-to-one: one number for each thing (tap each one once)
     • stable order: the number words always come in the same order
     • cardinal: the last number you say tells you how many
     • abstraction / order irrelevance: count anything, in any order
     • count objects, actions and sounds · count out a number · count beyond ten
   ========================================================= */
(function(){
const W = window.WORLD;
const BOX = W.box || 'the box';

const LEVELS = {
  /* Count & Tap — tap each thing once, then "how many altogether?" */
  tap: [
    {n:'Level 1', lo:1,  hi:5,  s:'1 to 5',  show:'small'},
    {n:'Level 2', lo:1,  hi:10, s:'1 to 10', show:'num'},
    {n:'Level 3', lo:6,  hi:10, s:'6 to 10', show:'num'},
    {n:'Level 4', lo:11, hi:15, s:'11 to 15 · beyond ten', show:'num', mode:'🚀 Beyond ten'},
    {n:'Level 5', lo:11, hi:20, s:'11 to 20', show:'num', mode:'🚀 Beyond ten'}
  ],
  /* Count Out — take just the right number from a bigger pile */
  out: [
    {n:'Level 1', lo:1, hi:5,  s:'1 to 5',  show:'small', extra:[2,3]},
    {n:'Level 2', lo:1, hi:10, s:'1 to 10', show:'num',   extra:[2,4]},
    {n:'Level 3', lo:6, hi:10, s:'6 to 10', show:'num',   extra:[3,5]},
    {n:'Level 4', lo:1, hi:10, s:'Big pile · 1 to 10', show:'mix', extra:[5,8]}
  ],
  /* Count the Beats — count sounds and actions */
  beats: [
    {n:'Level 1', lo:1, hi:3,  s:'1 to 3',  show:'small', gap:900},
    {n:'Level 2', lo:1, hi:5,  s:'1 to 5',  show:'small', gap:800},
    {n:'Level 3', lo:4, hi:8,  s:'4 to 8',  show:'num',   gap:700},
    {n:'Level 4', lo:1, hi:10, s:'Mix 1 to 10', show:'mix', gap:650}
  ],
  /* What Comes Next? — the counting order, past ten and up to 20 */
  next: [
    {n:'Level 1', lo:1,  hi:5,  s:'1 to 5',  show:'num'},
    {n:'Level 2', lo:1,  hi:10, s:'1 to 10', show:'num'},
    {n:'Level 3', lo:10, hi:20, s:'10 to 20 · beyond ten', show:'num', mode:'🚀 Beyond ten'},
    {n:'Level 4', lo:1,  hi:20, s:'Find the gap · to 20', show:'num', mode:'🔍 Missing number', gapMid:true}
  ]
};

/* answer choices for any range (numbers 1–20) */
function choices(n, lo, hi){
  const near = shuffle([n-2,n-1,n+1,n+2].filter(x=>x>=Math.max(1,lo-1) && x<=Math.min(20,hi+1)));
  near.sort((a,b)=>Math.abs(a-n)-Math.abs(b-n));
  return shuffle([n, ...near.slice(0,2)]);
}
/* a counting field big enough for up to 20 things, spread out in no particular order */
/* The field is 16:10, so work in real distances (x in % of width, y converted to the same units)
   and keep every picture fully inside the edges. */
const ASPECT = 10/16;
function fieldHTML(n, e){
  const size = n<=5 ? 15 : n<=10 ? 12 : n<=15 ? 9.5 : 8.5;          // picture size, % of field width
  const pos = spread(n, size);
  return `<div class="field" style="--os:${size}cqw">${pos.map(([x,y])=>`<div class="obj in" style="left:${x}%;top:${y}%">${e}</div>`).join('')}</div>`;
}
function spread(n, size){
  const padX = size*.6 + 2, padY = (size*.6 + 2)/ASPECT;               // y padding in % of height
  let minD = size*1.25;
  for(let t=0;t<400;t++){
    const pts = [];
    for(let i=0;i<n;i++){ for(let k=0;k<150;k++){
      const p = [padX + Math.random()*(100-2*padX), padY + Math.random()*(100-2*padY)];
      if(pts.every(q=>Math.hypot(p[0]-q[0], (p[1]-q[1])*ASPECT) > minD)){ pts.push(p); break; } } }
    if(pts.length===n) return pts;
    if(t%50===49) minD *= .93;
  }
  // fallback: a loose grid
  const cols = Math.ceil(Math.sqrt(n*1.6)), rows = Math.ceil(n/cols);
  return Array.from({length:n},(_,i)=>[padX + (i%cols+.5)*(100-2*padX)/cols, padY + (Math.floor(i/cols)+.5)*(100-2*padY)/rows]);
}

/* ---------- Game 1: Count & Tap ---------- */
function qTap(g, A){
  const n = A.levelNum(g), L = g.L;
  A.shell(g, `
    <div class="prompt">Count the ${g.it[1]}!</div>
    ${fieldHTML(n, g.it[0])}
    <div class="hint" id="hint">👆 Tap each ${g.it[2]} as you count</div>
    <div class="opts hidden" id="opts">${choices(n, L.lo, L.hi).map(A.ansCard).join('')}</div>`);
  A.say(g.q===0 ? `Count the ${g.it[1]}. Tap each one as you count!` : `Count the ${g.it[1]}!`);
  let c = 0;
  document.querySelectorAll('.obj').forEach(o=>{
    o.classList.add('tapcount');
    o.onclick = ()=>{
      if(g.locked || o.dataset.c) return;
      c++; o.dataset.c = c; o.classList.add('counted'); sfx.click(); speak(A.NUMWORD[c], 1);
      if(c===n){   // every one counted once — now the cardinal question
        A.later(()=>{ $('#hint').textContent = 'So how many altogether?'; $('#opts').classList.remove('hidden');
          A.say(`So how many ${g.it[1]} altogether?`); }, 700);
      }
    };
  });
  $('#opts').querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(+b.dataset.n===n){
      A.right(g, b);
      g.cardTip = (g.cardTip||0)+1;
      if(g.cardTip%3===1){
        $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">💡 The <b>last number</b> you said was <b>${n}</b> — so there are <b>${n}</b>!</div>`);
        A.praise(`The last number you said tells you how many!`); A.advance(g, 4200);
      } else { A.praise(); A.later(()=>speak(`${A.NUMWORD[n]} ${A.word(g,n)}!`), 1100); A.advance(g, 2600); }
    } else { A.wrong(g, b); A.later(()=>A.say(`What was the last number you said?`), 1400); }
  });
}

/* ---------- Game 2: Count Out ("Put 6 stars in the box") ---------- */
function qOut(g, A){
  const n = A.levelNum(g), L = g.L, total = n + L.extra[0] + rnd(L.extra[1]-L.extra[0]+1);
  A.shell(g, `
    <div class="prompt">Put <span class="target">${n}</span> ${A.word(g,n)} in ${BOX}</div>
    ${fieldHTML(total, g.it[0]).replace('class="field"','class="field pile"')}
    <div class="box" id="box"><div class="boxlbl">${BOX}</div><div class="boxin" id="boxin"></div></div>
    <div class="row"><button class="brick c-orange bigbtn" id="clear">Tip it out 🔄</button><button class="brick c-green bigbtn" id="check">Done! ✅</button></div>`);
  A.say(`Put ${A.NUMWORD[n]} ${A.word(g,n)} in ${BOX}!`);
  const boxin = $('#boxin');
  const count = ()=>boxin.children.length;
  function renumber(){ [...boxin.children].forEach((c,i)=>c.dataset.c = i+1); }
  document.querySelectorAll('.pile .obj').forEach(o=>{
    o.classList.add('tapcount');
    o.onclick = ()=>{
      if(g.locked || o.classList.contains('gone')) return;
      o.classList.add('gone'); sfx.click();
      const it = document.createElement('div'); it.className = 'inbox counted'; it.innerHTML = g.it[0]; it.dataset.c = count()+1;
      it.onclick = ()=>{ if(g.locked) return; it.remove(); o.classList.remove('gone'); renumber(); sfx.click(); };
      boxin.appendChild(it); speak(A.NUMWORD[count()], 1);
    };
  });
  $('#clear').onclick = ()=>{ if(g.locked) return; sfx.click(); boxin.innerHTML = ''; document.querySelectorAll('.pile .obj').forEach(o=>o.classList.remove('gone')); };
  $('#check').onclick = ()=>{
    if(g.locked) return;
    const k = count();
    if(k===n){ A.right(g, $('#box')); A.praise(`${A.NUMWORD[n]} in ${BOX}!`); A.advance(g, 2800); }
    else { g.tries++; sfx.oops();
      A.say(k<n ? `You have ${A.NUMWORD[k]}. You need ${A.NUMWORD[n]}. Put in some more!` : `You have ${A.NUMWORD[k]}. That's too many — take some out.`); }
  };
}

/* ---------- Game 3: Count the Beats (sounds and actions) ---------- */
function beatSound(){ if(!settings.sfx) return; tone(523,0,.22,'triangle',.16); tone(1046,0,.12,'sine',.05); }
function qBeats(g, A){
  const n = A.levelNum(g), L = g.L;
  A.shell(g, `
    <div class="prompt">Listen and count!</div>
    <div class="drum" id="drum"><div class="drumface">${W.mascot}</div><div class="ring" id="ring"></div></div>
    <div class="row"><button class="brick c-blue bigbtn" id="again">Again 🔁</button></div>
    <div class="opts hidden" id="opts">${choices(n, L.lo, L.hi).map(A.ansCard).join('')}</div>`);
  const drum = $('#drum'), ring = $('#ring');
  let playing = false;
  function play(){
    if(playing) return; playing = true; $('#again').disabled = true;
    for(let i=0;i<n;i++) A.later(()=>{ if(g!==A.current) return; beatSound(); drum.classList.remove('hit'); void drum.offsetWidth; drum.classList.add('hit');
      ring.classList.remove('pulse'); void ring.offsetWidth; ring.classList.add('pulse'); A.jumpMascot(); }, 900 + i*L.gap);
    A.later(()=>{ playing = false; $('#again').disabled = false; $('#opts').classList.remove('hidden'); A.say('How many did you hear?'); }, 900 + n*L.gap + 300);
  }
  A.say(g.q===0 ? 'Listen carefully and count the beats!' : 'Listen and count!', {voice:true});
  A.later(play, 1400);
  $('#again').onclick = ()=>{ sfx.click(); play(); };
  $('#opts').querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(+b.dataset.n===n){ A.right(g, b); A.praise(`${A.NUMWORD[n]} beats!`); A.advance(g, 2600); }
    else { A.wrong(g, b); A.later(()=>A.say('Listen again and count with me!'), 1400); }
  });
}

/* ---------- Game 4: What Comes Next? (counting order, to 20) ---------- */
function qNext(g, A){
  const L = g.L, len = 5;
  const start = L.lo + rnd(Math.max(1, L.hi - L.lo - len + 2));
  const seq = Array.from({length:len}, (_,i)=>start+i).filter(x=>x<=L.hi);
  const gapAt = L.gapMid ? 1 + rnd(seq.length-2) : seq.length-1;
  const n = seq[gapAt];
  const cols = ['red','blue','yellow','green','orange','purple','teal'];
  A.shell(g, `
    <div class="prompt">${L.gapMid ? 'Which number is missing?' : 'What comes next?'}</div>
    <div class="track">${seq.map((x,i)=>`<div class="brick c-${cols[(x)%cols.length]} nb ${i===gapAt?'gap':''}" data-i="${i}">${i===gapAt?'?':x}</div>`).join('')}</div>
    <div class="opts" id="opts">${choices(n, L.lo, L.hi).map(x=>`<div class="glass ans" role="button" tabindex="0" data-n="${x}"><div class="num">${x}</div></div>`).join('')}</div>`);
  // count along the track out loud, then ask
  const known = seq.map((x,i)=>i===gapAt ? '…' : A.NUMWORD[x]).join(', ');
  A.say(L.gapMid ? 'Which number is missing?' : 'What comes next?', {voice:false});
  speak(`${known}. ${L.gapMid ? 'Which number is missing?' : 'What comes next?'}`, .95);
  $('#opts').querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(+b.dataset.n===n){
      A.right(g, b); const gapEl = document.querySelector('.nb.gap'); gapEl.textContent = n; gapEl.classList.remove('gap'); gapEl.classList.add('filled');
      A.praise(); A.later(()=>speak(seq.map(x=>A.NUMWORD[x]).join(', '), 1), 1100); A.advance(g, 3400);
    } else { A.wrong(g, b); A.later(()=>speak(`Let's count: ${known}`, .9), 1300); }
  });
}

GAME({
  id:'counting', name:'Counting', icon:'👆', tagline:'👆 One number for each thing!', keyPrefix:'cntw', itemModes:false,
  acts:[
    {id:'tap',   ico:'👆', t:'Count & Tap',       d:'Tap each one as you count — how many altogether?', step:'GAME 1 · COUNT'},
    {id:'out',   ico:'🧺', t:'Count Out',          d:`Put the right number in ${BOX}`,                    step:'GAME 2 · COUNT OUT'},
    {id:'beats', ico:'🥁', t:'Count the Beats',    d:'Listen and count the sounds',                      step:'GAME 3 · LISTEN'},
    {id:'next',  ico:'🔢', t:'What Comes Next?',   d:'Numbers in order — up to 20!',                     step:'GAME 4 · ORDER'}
  ],
  levelsFor: act => LEVELS[act],
  games:{ tap:qTap, out:qOut, beats:qBeats, next:qNext },
  extraSettings:[
    ['answers','Answer cards show',[['both','Number + dots'],['numbers','Numbers only']],
     'Numbers above 10 always show as numbers only.']
  ]
});
})();
