/* =========================================================
   Charlie's Learning — Number bonds (runs on maths/shared/core.js)
   Composition of number: one number is made of smaller numbers (NCETM Early Years).
     • hiding games: "5 went in the cave, 3 are out — how many are hiding?"
     • part–part–whole (the "cherry" model): 3 is a part, 2 is a part, 5 is the whole
     • making a number from two colours on a five / ten frame
     • doubles
   ELG: recall number bonds to 5 (including subtraction facts) and some to 10, including doubles.
   ========================================================= */
(function(){
const W = window.WORLD;
const HIDE = W.hide || 'the den';
const NW = n => window.SUB.api.NUMWORD[n];

const LEVELS = {
  hide: [
    {n:'Level 1', lo:3, hi:4,  s:'Wholes of 3 and 4', show:'num'},
    {n:'Level 2', lo:5, hi:5,  s:'Bonds to 5',        show:'num'},
    {n:'Level 3', lo:6, hi:7,  s:'Wholes of 6 and 7', show:'num'},
    {n:'Level 4', lo:10, hi:10, s:'Bonds to 10',      show:'num', mode:'🔟 Bonds to 10'}
  ],
  cherry: [
    {n:'Level 1', lo:3, hi:4,  s:'Wholes of 3 and 4', show:'num'},
    {n:'Level 2', lo:5, hi:5,  s:'Bonds to 5',        show:'num'},
    {n:'Level 3', lo:6, hi:10, s:'Wholes of 6 to 10', show:'num'},
    {n:'Level 4', lo:3, hi:10, s:'Find the part or the whole', show:'num', mode:'🔀 Part or whole', wholeToo:true}
  ],
  frame: [
    {n:'Level 1', lo:3, hi:5,  s:'Make 3, 4 and 5',   show:'num'},
    {n:'Level 2', lo:5, hi:5,  s:'All the ways to make 5', show:'num'},
    {n:'Level 3', lo:6, hi:9,  s:'Make 6 to 9',       show:'num'},
    {n:'Level 4', lo:10, hi:10, s:'All the ways to make 10', show:'num', mode:'🔟 Bonds to 10'}
  ],
  doubles: [
    {n:'Level 1', lo:1, hi:3, s:'Double 1, 2, 3', show:'num'},
    {n:'Level 2', lo:1, hi:5, s:'Double 1 to 5',  show:'num'},
    {n:'Level 3', lo:3, hi:5, s:'Double 3, 4, 5', show:'num', mode:'⚡ Quick'}
  ]
};

/* pick a split of the whole into two parts, avoiding the same split twice in a row */
function split(g, whole, minPart=1){
  let a; let tries = 0;
  do{ a = minPart + rnd(whole - 2*minPart + 1); tries++; }while(g.lastSplit === `${whole}-${a}` && tries < 10);
  g.lastSplit = `${whole}-${a}`; return [a, whole - a];
}
/* a 3×3 grid inside a half-plate, for up to 9 things */
function halfGrid(k){
  const P = [22,50,78], order = [[1,1],[0,0],[2,2],[2,0],[0,2],[1,0],[1,2],[0,1],[2,1]];
  const pre = {1:[4], 2:[1,2], 3:[1,0,2], 4:[1,3,4,2], 5:[1,3,0,4,2]}[k];
  const idx = pre ? pre.map(i=>order[i]) : order.slice(0,k);
  return (k<=5 ? window.SUB.api.dicePos(k).map(([x,y])=>[x,y]) : idx.map(([c,r])=>[P[c],P[r]]));
}

/* ---------- Game 1: How Many Hiding? ---------- */
function qHide(g, A){
  const whole = A.levelNum(g), [out, hidden] = split(g, whole);
  A.shell(g, `
    <div class="prompt" id="q">There are <span class="target">${whole}</span> ${A.word(g,whole)}</div>
    <div class="halves">
      <div class="plate half2">${A.objs(halfGrid(out), g.it[0])}</div>
      <div class="plate half2 denwrap">${A.objs(halfGrid(hidden), g.it[0])}<div class="den" id="den"><div class="denlbl">${HIDE}</div><div class="q">?</div></div></div>
    </div>
    <div class="opts hidden" id="opts">${A.numOpts(hidden, 0, whole-1).map(A.ansCard).join('')}</div>`);
  A.say(`There are ${NW(whole)} ${A.word(g,whole)}. Watch!`);
  A.later(()=>{ if(g.locked) return; $('#den').classList.add('closed'); sfx.click();
    $('#q').innerHTML = `<span class="target">${out}</span> ${out===1?'is':'are'} out. How many are hiding?`;
    A.say(`Some hide ${HIDE}! ${NW(out)} ${out===1?'is':'are'} out. How many are hiding?`, {hold:5000}); $('#opts').classList.remove('hidden'); }, 2600);
  $('#opts').querySelectorAll('.ans').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(+b.dataset.n===hidden){
      A.right(g, b); $('#den').classList.remove('closed');
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${out}</b> and <b>${hidden}</b> make <b>${whole}</b>!</div>`);
      A.praise(`${NW(out)} and ${NW(hidden)} make ${NW(whole)}!`); A.advance(g, 3600);
    } else A.wrong(g, b);
  });
}

/* ---------- Game 2: Part–part–whole (cherry model) ---------- */
function qCherry(g, A){
  const L = g.L, whole = A.levelNum(g), [a, b] = split(g, whole);
  const missing = L.wholeToo && Math.random()<.35 ? 'whole' : (Math.random()<.5 ? 'a' : 'b');
  const ans = missing==='whole' ? whole : missing==='a' ? a : b;
  const circ = (n, isMissing, cls) => `<div class="cc ${cls} ${isMissing?'miss':''}">${isMissing ? '<span class="qm">?</span>' : `<div class="ccn">${n}</div><div class="ccobjs">${g.it[0].repeat(n)}</div>`}</div>`;
  A.shell(g, `
    <div class="prompt">${missing==='whole' ? 'What is the whole?' : 'What is the missing part?'}</div>
    <div class="cherry">
      ${circ(whole, missing==='whole', 'whole')}
      <svg class="stems" viewBox="0 0 100 40" preserveAspectRatio="none"><path d="M50 0 L22 40 M50 0 L78 40"/></svg>
      <div class="parts">${circ(a, missing==='a', 'part')}${circ(b, missing==='b', 'part')}</div>
    </div>
    <div class="opts" id="opts">${A.numOpts(ans, missing==='whole'?2:1, missing==='whole'?10:Math.max(3,whole-1)).map(A.ansCard).join('')}</div>`);
  A.say(missing==='whole' ? `${NW(a)} and ${NW(b)}. What is the whole?` : `The whole is ${NW(whole)}. One part is ${NW(missing==='a'?b:a)}. What is the other part?`, {hold:5000});
  $('#opts').querySelectorAll('.ans').forEach(btn=>btn.onclick=()=>{
    if(g.locked) return;
    if(+btn.dataset.n===ans){
      A.right(g, btn); const m = document.querySelector('.cc.miss'); const n = ans;
      m.classList.remove('miss'); m.innerHTML = `<div class="ccn">${n}</div><div class="ccobjs">${g.it[0].repeat(n)}</div>`; m.classList.add('filled');
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">One part is <b>${a}</b>, the other part is <b>${b}</b>, the whole is <b>${whole}</b>.</div>`);
      A.praise(`${NW(a)} and ${NW(b)} make ${NW(whole)}!`); A.advance(g, 3800);
    } else A.wrong(g, btn);
  });
}

/* ---------- Game 3: Two-colour frame ---------- */
function qFrame(g, A){
  const whole = A.levelNum(g), [a, need] = split(g, whole);
  const size = whole <= 5 ? 5 : 10;
  g.added = 0;
  A.shell(g, `
    <div class="prompt">Make <span class="target">${whole}</span></div>
    <div class="frame ${size===5?'five':''}">${Array.from({length:size},(_,i)=>`<button class="cell ${i<a?'on ga2':''}" data-i="${i}" aria-label="space ${i+1}">${i<a?`<span>${g.it[0]}</span>`:''}</button>`).join('')}</div>
    <div class="hint">${a} are already in. Tap to add more until there are ${whole}.</div>
    <div class="row"><button class="brick c-orange bigbtn" id="clear">Clear 🧹</button><button class="brick c-green bigbtn" id="check">Done! ✅</button></div>`);
  A.say(`${NW(a)} ${a===1?'is':'are'} already in. Add more to make ${NW(whole)}!`, {hold:5000});
  document.querySelectorAll('.cell').forEach(c=>c.onclick=()=>{
    if(g.locked || c.classList.contains('ga2')) return; sfx.click();
    if(c.classList.contains('on')){ c.classList.remove('on','gb2'); c.innerHTML=''; g.added--; }
    else { c.classList.add('on','gb2'); c.innerHTML = `<span>${g.it[0]}</span>`; g.added++; speak(NW(a + g.added), 1); }
  });
  $('#clear').onclick = ()=>{ if(g.locked) return; sfx.click(); document.querySelectorAll('.cell.gb2').forEach(c=>{ c.classList.remove('on','gb2'); c.innerHTML=''; }); g.added = 0; };
  $('#check').onclick = ()=>{
    if(g.locked) return;
    if(g.added===need){
      A.right(g, $('.frame'));
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip"><b>${a}</b> and <b>${need}</b> make <b>${whole}</b>!${size===10 && whole===10 ? ' (a number bond to 10)' : ''}</div>`);
      A.praise(`${NW(a)} and ${NW(need)} make ${NW(whole)}!`); A.advance(g, 3400);
    } else { g.tries++; sfx.oops(); const now = a + g.added;
      A.say(now<whole ? `That makes ${NW(now)}. We need ${NW(whole)} — add some more!` : `That makes ${NW(now)}. Too many — take some away.`); }
  };
}

/* ---------- Game 4: Doubles ---------- */
function qDoubles(g, A){
  const k = A.levelNum(g), total = k*2, L = g.L;
  A.shell(g, `
    <div class="prompt">Double <span class="target">${k}</span> is…?</div>
    <div class="halves mirror"><div class="plate half2">${A.objs(halfGrid(k), g.it[0])}</div><div class="mline"></div><div class="plate half2 flip">${A.objs(halfGrid(k), g.it[0])}</div></div>
    <div class="opts" id="opts">${A.numOpts(total, 2, 10).map(A.ansCard).join('')}</div>`);
  A.say(`${NW(k)} and ${NW(k)} — the same on both sides. Double ${NW(k)} is…?`);
  $('#opts').querySelectorAll('.ans').forEach(btn=>btn.onclick=()=>{
    if(g.locked) return;
    if(+btn.dataset.n===total){
      A.right(g, btn);
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">Double <b>${k}</b> is <b>${total}</b> — ${k} and ${k} make ${total}.</div>`);
      A.praise(`Double ${NW(k)} is ${NW(total)}!`); A.advance(g, 3200);
    } else A.wrong(g, btn);
  });
}

GAME({
  id:'bonds', name:'Number bonds', icon:'🧩', tagline:'🧩 Two parts make a whole!', keyPrefix:'bndw', itemModes:false,
  acts:[
    {id:'hide',    ico:'🙈', t:'How Many Hiding?', d:`Some hide ${HIDE} — how many?`,   step:'GAME 1 · HIDING'},
    {id:'cherry',  ico:'🍒', t:'Part, Part, Whole', d:'Find the missing part',          step:'GAME 2 · PARTS'},
    {id:'frame',   ico:'🎨', t:'Two-Colour Frame', d:'Add more to make the number',     step:'GAME 3 · MAKE IT'},
    {id:'doubles', ico:'🦋', t:'Doubles',          d:'The same on both sides',          step:'GAME 4 · DOUBLES'}
  ],
  levelsFor: act => LEVELS[act],
  games:{ hide:qHide, cherry:qCherry, frame:qFrame, doubles:qDoubles },
  extraSettings:[
    ['answers','Answer cards show',[['both','Number + dots'],['numbers','Numbers only']], 'Dots help children see the number until they know their numerals.']
  ]
});
})();
