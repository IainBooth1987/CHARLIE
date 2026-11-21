/* =========================================================
   Charlie's Learning — Shapes & patterns (runs on maths/shared/core.js)
   Development Matters: talk about 2D shapes using 'sides', 'corners', 'straight', 'round';
     select, rotate and manipulate shapes; compose shapes (a shape can be made of other shapes);
     continue, copy and create repeating patterns; notice and correct an error in a pattern.
   NCETM pattern progression: AB → ABB / ABC; spot an error (extra item first, then items swapped);
     say which part repeats. Shapes are shown in different sizes and turned round, not only "upright".
   ========================================================= */
(function(){
const W = window.WORLD;
const later = (f, ms) => window.SUB.api.later(f, ms);
const COLOURS = ['#ef4444','#3b82f6','#22c55e','#f59e0b','#a855f7','#ec4899','#14b8a6'];
const FACT = {
  circle:   'A circle is round. It has no corners.',
  square:   'A square has 4 straight sides, all the same length, and 4 corners.',
  triangle: 'A triangle has 3 straight sides and 3 corners.',
  rectangle:'A rectangle has 4 straight sides and 4 corners — 2 long sides and 2 short sides.'
};
const SAYFACT = {
  circle:'A circle is round. It has no corners.',
  square:'A square has four straight sides, all the same, and four corners.',
  triangle:'A triangle has three straight sides and three corners.',
  rectangle:'A rectangle has four straight sides and four corners. Two long sides and two short sides.'
};

/* ---------- drawing shapes (viewBox 0 0 100 100) ---------- */
const TRI = [ [[50,10],[92,84],[8,84]], [[14,14],[14,86],[86,86]], [[50,6],[78,92],[22,92]], [[22,16],[90,80],[10,88]] ];
function geom(type, v){                      // → {el, pts} (pts = corners, for the corner dots)
  if(type==='circle'){ const r = v.small ? 30 : 40; return {el:`<circle cx="50" cy="50" r="${r}"/>`, pts:[]}; }
  let pts;
  if(type==='square'){ const s = v.small ? 52 : 72, o = (100-s)/2; pts = [[o,o],[o+s,o],[o+s,o+s],[o,o+s]]; }
  if(type==='rectangle'){ pts = v.tall ? [[30,6],[70,6],[70,94],[30,94]] : [[6,30],[94,30],[94,70],[6,70]]; }
  if(type==='triangle'){ pts = TRI[v.tri||0]; }
  return {el:`<polygon points="${pts.map(p=>p.join(',')).join(' ')}"/>`, pts};
}
function shapeSVG(type, colour, v={}){
  const {el, pts} = geom(type, v);
  const t = v.rot ? `rotate(${v.rot} 50 50) translate(50 50) scale(.82) translate(-50 -50)` : '';
  return `<svg class="shp" viewBox="0 0 100 100"><g transform="${t}" fill="${colour}" stroke="#1e293b" stroke-width="4" stroke-linejoin="round">${el}
    <g class="corners">${pts.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="7" style="animation-delay:${i*.35}s"/>`).join('')}</g></g></svg>`;
}
function variant(type, turned){
  if(!turned) return {tri:0, tall:false};
  return { rot: [0,20,45,-30,90,180,135][rnd(7)], tri: rnd(4), tall: Math.random()<.5, small: Math.random()<.4 };
}

/* ---------- levels ---------- */
const LEVELS = {
  hunt: [
    {n:'Level 1', s:'Circle, square, triangle',   em:'● ■ ▲', shapes:['circle','square','triangle']},
    {n:'Level 2', s:'Add the rectangle',          em:'● ■ ▲ ▬', shapes:['circle','square','triangle','rectangle']},
    {n:'Level 3', s:'Shapes turned round',        em:'⟳', shapes:['circle','square','triangle','rectangle'], turned:true, mode:'🔄 Turned and stretched'},
    {n:'Level 4', s:'Sides and corners',          em:'📐', prop:true, turned:true, mode:'📐 Find it by its corners'}
  ],
  next: [
    {n:'Level 1', s:'Two things take turns', em:'AB AB', units:['AB']},
    {n:'Level 2', s:'Longer bits that repeat', em:'ABB', units:['ABB','AAB']},
    {n:'Level 3', s:'Three things take turns', em:'ABC', units:['ABC']},
    {n:'Level 4', s:'Fill the gap',          em:'A_A', units:['AB','ABB','ABC'], gap:true, mode:'🕳️ Missing in the middle'}
  ],
  oops: [
    {n:'Level 1', s:'An extra one has sneaked in', em:'ABB AB', units:['AB'], kind:'extra'},
    {n:'Level 2', s:'One is wrong',                em:'ABAA', units:['AB'], kind:'swap'},
    {n:'Level 3', s:'Find it in ABB patterns',      em:'ABB', units:['ABB','AAB'], kind:'swap'},
    {n:'Level 4', s:'Find it in ABC patterns',      em:'ABC', units:['ABC'], kind:'swap'}
  ],
  build: [
    {n:'Level 1', s:'2 or 3 shapes', em:'🏠', pics:['house','tree','icecream'], labels:true},
    {n:'Level 2', s:'4 shapes',      em:'🚚', pics:['truck','boat','fish'], labels:true},
    {n:'Level 3', s:'5 or more',     em:'🚀', pics:['rocket','train','castle'], mode:'🧩 Big builds'}
  ]
};

/* =========================================================
   Game 1 — Shape Hunt
   ========================================================= */
function qHunt(g, A){
  const L = g.L; let target, opts, prompt, sayQ;
  if(L.prop){
    const Q = [ {p:'Find the round shape', s:'Find the round shape — the one with no corners.', t:'circle'},
                {p:'Find the shape with 3 corners', s:'Find the shape with three corners.', t:'triangle'},
                {p:'Find the shape with 3 straight sides', s:'Find the shape with three straight sides.', t:'triangle'},
                {p:'Find the shape with 4 corners', s:'Find the shape with four corners.', t:pick(['square','rectangle'])} ];
    let q; do{ q = pick(Q); }while(q.p===g.lastP); g.lastP = q.p;
    target = q.t; prompt = q.p; sayQ = q.s;
    const four = target==='square'||target==='rectangle';
    opts = [target, ...shuffle(['circle','triangle','square','rectangle'].filter(s=>s!==target && !(four && (s==='square'||s==='rectangle')))).slice(0, four?2:2)];
  } else {
    do{ target = pick(L.shapes); }while(target===g.lastT && L.shapes.length>1); g.lastT = target;
    /* a square IS a special rectangle — so never put a square in the line-up when we ask for "the rectangle" */
    opts = [target, ...L.shapes.filter(s=>s!==target && !(target==='rectangle' && s==='square'))];
    prompt = `Find the ${target}`; sayQ = `Can you find the ${target}?`;
  }
  const cols = shuffle(COLOURS.slice());
  opts = shuffle(opts);
  A.shell(g, `
    <div class="prompt">${prompt.replace(/(\d)/,'<span class="target">$1</span>')}</div>
    <div class="shapes" id="opts">${opts.map((t,i)=>`<button class="shpbtn" data-t="${t}" aria-label="shape">${shapeSVG(t, cols[i], variant(t, L.turned))}</button>`).join('')}</div>`);
  A.say(sayQ, {hold:5000});
  $('#opts').querySelectorAll('.shpbtn').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(b.dataset.t===target){
      A.right(g, b); b.classList.add('show-corners');
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">${FACT[target]}</div>`);
      A.praise(`That's the ${target}! ${SAYFACT[target]}`); A.advance(g, 4200);
    } else { A.wrong(g, b); if(L.prop || L.turned) later(()=>A.say(`That's a ${b.dataset.t}. ${SAYFACT[b.dataset.t]}`), 900); }
  });
}

/* ---------- pattern helpers ---------- */
function makeMap(unit){                       // letters → three different world things
  const its = shuffle(W.items.slice()); const m = {}; [...new Set(unit)].forEach((c,i)=>m[c]=its[i]); return m;
}
const tileHTML = (it, i, extra='') => `<div class="ptile ${extra}" data-i="${i}">${it ? `<span>${it[0]}</span>` : '<span class="qm">?</span>'}</div>`;
function sayPattern(seq, m, n){ speak(seq.slice(0, n||seq.length).map(c=>m[c][2]).join(', ') + '…', 1); }
function shadeUnits(unitLen){
  document.querySelectorAll('.ptile').forEach((t,i)=>{ t.classList.add(Math.floor(i/unitLen)%2 ? 'u2' : 'u1'); });
}

/* =========================================================
   Game 2 — What Comes Next?
   ========================================================= */
function qNext(g, A){
  const L = g.L, unit = pick(L.units), m = makeMap(unit), U = unit.length;
  const full = Array.from({length: L.gap ? Math.max(8, U*3) : U*3 + 1}, (_,i)=>unit[i%U]);
  let shown, gapAt, ans;
  if(L.gap){ gapAt = U + rnd(full.length - U - 1); ans = full[gapAt]; shown = full.length; }
  else { shown = Math.max(4, U*2) + rnd(U); ans = full[shown]; gapAt = shown; }
  const seqShown = full.slice(0, L.gap ? full.length : shown);
  const letters = [...new Set(unit)];
  const choices = shuffle(letters.length < 3 ? [...letters, '*'] : letters);
  const extraIt = W.items.find(it=>!Object.values(m).includes(it));
  const itFor = c => c==='*' ? extraIt : m[c];
  A.shell(g, `
    <div class="prompt">${L.gap ? 'What is missing?' : 'What comes next?'}</div>
    <div class="ptrack" id="track">${seqShown.map((c,i)=>tileHTML(i===gapAt ? null : m[c], i, i===gapAt?'gap':'')).join('')}${L.gap ? '' : tileHTML(null, shown, 'gap')}</div>
    <div class="pchoices" id="opts">${choices.map(c=>`<button class="pbtn" data-c="${c}">${itFor(c)[0]}</button>`).join('')}</div>`);
  A.say(L.gap ? 'Say the pattern. What is missing?' : 'Say the pattern with me. What comes next?', {hold:3000});
  later(()=>sayPattern(L.gap ? full.slice(0,gapAt) : seqShown, m), 1700);
  $('#opts').querySelectorAll('.pbtn').forEach(b=>b.onclick=()=>{
    if(g.locked) return;
    if(b.dataset.c===ans){
      A.right(g, b); const gap = document.querySelector('.ptile.gap'); gap.classList.remove('gap'); gap.classList.add('filled'); gap.innerHTML = `<span>${m[ans][0]}</span>`;
      shadeUnits(U);
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">The shaded groups show <b>the part that repeats</b>.</div>`);
      A.praise(''); later(()=>sayPattern(L.gap ? full : full.slice(0, shown+1), m), 1300); A.advance(g, 5200);
    } else A.wrong(g, b);
  });
}

/* =========================================================
   Game 3 — Spot the Mistake
   ========================================================= */
function qOops(g, A){
  const L = g.L, unit = pick(L.units), m = makeMap(unit), U = unit.length;
  let seq = Array.from({length: U===2 ? 8 : 9}, (_,i)=>unit[i%U]);
  const good = seq.slice();
  let wrongIdx = [];
  if(L.kind==='extra'){
    const at = 3 + rnd(seq.length - 4);        // repeat one item: e.g. A B A B B A B A B
    seq.splice(at, 0, seq[at-1]); wrongIdx = [at-1, at];
  } else {
    const at = U*2 + rnd(seq.length - U*2);    // the first two repeats are always right, so the pattern is clear
    const others = [...new Set(unit)].filter(c=>c!==seq[at]); seq[at] = pick(others); wrongIdx = [at];
  }
  A.shell(g, `
    <div class="prompt">${L.kind==='extra' ? 'Oops! An extra one sneaked in.' : 'Oops! One is wrong.'} Tap it!</div>
    <div class="ptrack" id="track">${seq.map((c,i)=>tileHTML(m[c], i, 'tap')).join('')}</div>
    <div class="hint">Say the pattern from the start to find the mistake.</div>`);
  A.say(L.kind==='extra' ? 'Oops! An extra one sneaked in. Say the pattern from the start, and tap the one that should not be there.' : 'Oops! One is wrong. Say the pattern from the start, and tap the wrong one.', {hold:6000});
  const first = wrongIdx[wrongIdx.length-1];
  document.querySelectorAll('.ptile').forEach(t=>t.onclick=()=>{
    if(g.locked) return; const i = +t.dataset.i;
    if(wrongIdx.includes(i)){
      A.right(g, t);
      if(L.kind==='extra'){ t.classList.add('gone'); later(()=>{ t.remove(); shadeUnits(U); }, 500); }
      else { t.classList.add('flip'); later(()=>{ t.innerHTML = `<span>${m[good[i]][0]}</span>`; t.classList.add('fixed'); shadeUnits(U); }, 300); }
      $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">Fixed! Now the pattern repeats all the way along.</div>`);
      A.praise('You fixed it!'); later(()=>sayPattern(good, m), 1500); A.advance(g, 5400);
    } else {
      A.wrong(g, t); later(()=>t.classList.remove('wrong'), 700);
      if(g.tries>=2){              // help: track the pattern from the start, one at a time
        document.querySelectorAll('.ptile').forEach((p,k)=>{ if(k<=first) later(()=>{ p.classList.add('track'); later(()=>p.classList.remove('track'), 500); }, k*450); });
      }
    }
  });
}

/* =========================================================
   Game 4 — Shape Pictures (shapes make other things)
   viewBox 0 0 200 160; pieces are placed one at a time
   ========================================================= */
const R = (x,y,w,h) => ({x,y,w,h});
const PICS = {
  house:   {name:'a house', parts:[['square',R(60,70,80,80),'#f59e0b'], ['triangle','50,72 150,72 100,22','#ef4444']]},
  tree:    {name:'a tree', parts:[['rectangle',R(90,92,20,60),'#92400e'], ['circle',[100,62,44],'#22c55e']]},
  icecream:{name:'an ice cream', parts:[['triangle','72,74 128,74 100,150','#f59e0b'], ['circle',[100,56,30],'#ec4899'], ['circle',[100,22,14],'#ef4444']]},
  truck:   {name:'a truck', parts:[['rectangle',R(22,52,110,62),'#3b82f6'], ['square',R(134,72,42,42),'#ef4444'], ['circle',[54,124,17],'#334155'], ['circle',[150,124,17],'#334155']]},
  boat:    {name:'a boat', parts:[['rectangle',R(40,112,120,28),'#92400e'], ['rectangle',R(96,22,8,90),'#475569'], ['triangle','108,30 108,104 160,104','#f8fafc'], ['triangle','92,44 92,104 50,104','#38bdf8']]},
  fish:    {name:'a fish', parts:[['circle',[86,80,44],'#f97316'], ['triangle','124,80 178,44 178,116','#f59e0b'], ['triangle','70,40 104,40 88,16','#fb923c'], ['circle',[66,70,8],'#1e293b']]},
  rocket:  {name:'a rocket', parts:[['rectangle',R(80,52,40,84),'#e2e8f0'], ['triangle','80,52 120,52 100,10','#ef4444'], ['triangle','80,98 80,136 52,136','#ef4444'], ['triangle','120,98 120,136 148,136','#ef4444'], ['circle',[100,80,12],'#38bdf8']]},
  train:   {name:'a train', parts:[['rectangle',R(20,70,100,50),'#22c55e'], ['square',R(120,50,70,70),'#ef4444'], ['rectangle',R(40,36,16,34),'#334155'], ['circle',[45,130,15],'#334155'], ['circle',[95,130,15],'#334155'], ['circle',[155,130,15],'#334155']]},
  castle:  {name:'a castle', parts:[['rectangle',R(55,70,90,80),'#94a3b8'], ['rectangle',R(20,50,35,100),'#cbd5e1'], ['rectangle',R(145,50,35,100),'#cbd5e1'], ['triangle','16,50 59,50 37,14','#3b82f6'], ['triangle','141,50 184,50 162,14','#3b82f6'], ['square',R(85,110,30,30),'#92400e']]}
};
function partSVG([type, d, col], state){
  const cls = `part ${state}`, fill = state==='done' ? col : 'none';
  const a = `class="${cls}" fill="${fill}"`;
  if(type==='circle') return `<circle ${a} cx="${d[0]}" cy="${d[1]}" r="${d[2]}"/>`;
  if(type==='triangle') return `<polygon ${a} points="${d}"/>`;
  return `<rect ${a} x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}"/>`;
}
function qBuild(g, A){
  const L = g.L; let key; do{ key = pick(L.pics); }while(key===g.lastPic && L.pics.length>1); g.lastPic = key;
  const P = PICS[key]; let step = 0;
  const draw = () => {
    $('#pic').innerHTML = P.parts.map((p,i)=>partSVG(p, i<step ? 'done' : i===step ? 'now' : 'todo')).join('');
  };
  const tray = ['circle','square','triangle','rectangle'];
  A.shell(g, `
    <div class="prompt">Build ${P.name}!</div>
    <div class="buildrow">
      <svg class="pic" id="pic" viewBox="0 0 200 160"></svg>
      <div class="tray" id="opts">${tray.map((t,i)=>`<button class="shpbtn small" data-t="${t}" aria-label="${t}">${shapeSVG(t, COLOURS[i], {})}${L.labels?`<span class="sname">${t}</span>`:''}</button>`).join('')}</div>
    </div>`);
  draw();
  const ask = () => A.say(step===0 ? `Let's build ${P.name}! Which shape fits the flashing space?` : 'Which shape fits next?', {hold:4000});
  ask();
  $('#opts').querySelectorAll('.shpbtn').forEach(b=>b.onclick=()=>{
    if(g.locked) return; const need = P.parts[step][0];
    if(b.dataset.t===need){
      sfx.good(); step++; draw(); const placed = $('#pic').querySelectorAll('.part')[step-1]; placed.classList.add('pop');
      if(step===P.parts.length){
        A.right(g, $('#pic')); $('#pic').classList.add('done');
        $('#stage').insertAdjacentHTML('beforeend', `<div class="tip">You made ${P.name} out of shapes!</div>`);
        A.praise(`You made ${P.name}!`); A.advance(g, 3600);
      } else { speak(`Yes, a ${need}!`, 1); later(ask, 1200); }
    } else { g.tries++; sfx.oops(); b.classList.add('wrong'); later(()=>b.classList.remove('wrong'), 700);
      A.say(need==='circle' ? 'This space is round. Which shape is round?' : need==='triangle' ? 'Count the corners on the space. Three corners!' : need==='square' ? 'All four sides are the same length. Which shape is that?' : 'Two long sides and two short sides. Which shape is that?'); }
  });
}

GAME({
  id:'shapes', name:'Shapes & patterns', icon:'🔷', tagline:'🔷 Shapes, corners and patterns!', keyPrefix:'shpw', itemModes:false,
  acts:[
    {id:'hunt',  ico:'🔍', t:'Shape Hunt',      d:'Find the shape — even turned round', step:'GAME 1 · SHAPES'},
    {id:'next',  ico:'➡️', t:'What Comes Next?', d:'Carry on the pattern',               step:'GAME 2 · PATTERNS'},
    {id:'oops',  ico:'🔧', t:'Spot the Mistake', d:'Fix the broken pattern',             step:'GAME 3 · FIX IT'},
    {id:'build', ico:'🧱', t:'Shape Pictures',   d:'Build things out of shapes',         step:'GAME 4 · BUILD'}
  ],
  levelsFor: act => LEVELS[act],
  games:{ hunt:qHunt, next:qNext, oops:qOops, build:qBuild }
});
})();
