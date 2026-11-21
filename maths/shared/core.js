/* =========================================================
   Charlie's Learning — shared maths game core
   Used by every maths skill (Subitising, Counting, …) in every world.

   Page loads, in order:  site.js → worlds/<id>.js (sets window.WORLD) → shared/core.js → <skill>/engine.js
   The skill engine calls GAME(SKILL) with:
     SKILL = { id, name, icon, tagline, keyPrefix,
               acts:[{id, ico, t, d, step}], levelsFor(act) → [{n, lo, hi, s, mode?, show?}],
               extraSettings:[…], games:{ <actId>: function(g, api){…} },
               itemModes: true|false  (mix pictures and dots between rounds) }
   ========================================================= */
(function(){
const W = window.WORLD;
const HUB = 'index.html', HOME = '../../index.html';
const ROUND_LEN = 8;
const NUMWORD = ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
/* every maths skill and the folder it lives in — used for "also in this world" links */
const SKILLS = [
  {id:'subitising', name:'Subitising', icon:'⚡'},
  {id:'counting',   name:'Counting',   icon:'👆'},
  {id:'bonds',      name:'Number bonds', icon:'🧩'},
  {id:'shapes',     name:'Shapes & patterns', icon:'🔷'}
];
/* simple dots — easier to subitise than pictures (NRICH) */
const DOT = ['<span class="dotobj"></span>','dots','dot'];

window.GAME = function(SKILL){
  const key = (act,lvl) => `${SKILL.keyPrefix}:${W.id}:${act}-v2:${lvl}`;
  window.EXTRA_SETTINGS = SKILL.extraSettings || [];

  /* ---------- Page scaffold ---------- */
  document.body.classList.add('world');
  document.body.insertAdjacentHTML('afterbegin', `<canvas id="bg"></canvas><div id="ui"></div>
    <div id="mascot"><div class="face">${W.mascot}</div><div class="bubble hide" id="bubble"></div></div>`);
  const ui = document.getElementById('ui');
  if(W.background){ try{ W.background(document.getElementById('bg')); }catch(e){} }

  /* ---------- Mascot talks (text + voice together, for non-readers) ---------- */
  let bubbleT = null;
  function say(text, opts={}){
    const b = document.getElementById('bubble');
    b.textContent = text; b.classList.remove('hide');
    clearTimeout(bubbleT); bubbleT = setTimeout(()=>b.classList.add('hide'), opts.hold || 3800);
    if(opts.jump) jumpMascot();
    if(opts.voice !== false) speak(opts.speech || text);
  }
  function jumpMascot(){ const f = document.querySelector('#mascot .face'); f.classList.remove('jump'); void f.offsetWidth; f.classList.add('jump'); }
  function burst(el, n=26){
    const r = el.getBoundingClientRect(), cx = r.left + r.width/2, cy = r.top + r.height/2;
    for(let i=0;i<n;i++){
      const s = document.createElement('div'); s.className='spark';
      const a = Math.random()*Math.PI*2, d = 60 + Math.random()*120;
      s.style.left = cx+'px'; s.style.top = cy+'px';
      s.style.background = pick(['#ffd84d','#ffffff', getComputedStyle(document.body).getPropertyValue('--accent'), getComputedStyle(document.body).getPropertyValue('--accent2'), '#22c55e']);
      s.style.setProperty('--dx', Math.cos(a)*d+'px'); s.style.setProperty('--dy', Math.sin(a)*d+'px');
      document.body.appendChild(s); setTimeout(()=>s.remove(), 900);
    }
  }

  /* ---------- Router ---------- */
  let current = null, timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  function go(screen, arg){
    timers.forEach(clearTimeout); timers = [];
    stopVoice();
    current = null; window.scrollTo(0,0);
    ({menu:renderMenu, levels:renderLevels, game:startGame})[screen](arg);
  }
  window.SUB = { go };   // inline handlers + automated checks
  function topbar(title, backHref, backJS){
    const back = backHref
      ? `<a class="brick c-red iconbtn" href="${backHref}" onclick="sfx.click()" aria-label="Back">⬅️</a>`
      : `<button class="brick c-red iconbtn" onclick="sfx.click();SUB.go(${backJS})" aria-label="Back">⬅️</button>`;
    return `<div class="topbar">${back}<h1>${title}</h1>
      <a class="brick c-yellow iconbtn" href="${HOME}" onclick="sfx.click()" aria-label="Home">🏠</a></div>`;
  }
  const bestFor = p => Math.max(0, ...Object.keys(progress).filter(k=>k.startsWith(p)).map(k=>progress[k]));

  /* ---------- Menu: pick a game ---------- */
  function renderMenu(){
    document.body.dataset.mode = 'menu';
    const others = (SKILL.siblings || SKILLS).filter(s=>s.id!==SKILL.id);
    ui.innerHTML = topbar(`${W.icon} ${W.name}`, HUB) + `
     <p class="crumb">${SKILL.icon} ${SKILL.name}</p>
     <div class="chips">
       <span class="chip2">${SKILL.tagline}</span>
       ${W.intro && window.THREE ? `<button class="chip2" onclick="sfx.click();SUB.replayIntro()">🎬 Watch the intro</button>` : ''}
       <a class="chip2" href="grown-ups.html">👪 Grown-ups guide</a>
     </div>
     <div class="missions screen-in">${SKILL.acts.map(a=>{ const b = bestFor(`${SKILL.keyPrefix}:${W.id}:${a.id}-v2:`);
       return `<div class="glass mission" role="button" tabindex="0" data-a="${a.id}">
         <div class="big">${a.ico}</div><div class="n">${a.step}</div><div class="t">${a.t}</div><div class="d">${a.d}</div>
         <div class="stars">${b?starsTxt(b):''}</div><div class="go">▶</div></div>`; }).join('')}</div>
     <div class="chips" style="margin-top:18px">${others.map(s=>`<a class="chip2" href="../${s.id}/${W.file || (W.id + ".html")}#skip-intro">Also in ${W.name}: ${s.icon} ${s.name}</a>`).join('')}</div>`;
    ui.querySelectorAll('.mission').forEach(m=>m.onclick=()=>{ sfx.click(); const a = SKILL.acts.find(x=>x.id===m.dataset.a); speak(a.t.replace(/[^\w ?]/g,'')); go('levels', a.id); });
    say(W.menuLine || `Pick a game, ${settings.name}!`);
  }

  /* ---------- Levels ---------- */
  function renderLevels(act){
    document.body.dataset.mode = 'menu';
    const a = SKILL.acts.find(x=>x.id===act);
    const LV = SKILL.levelsFor(act);
    let rec = LV.findIndex((l,i)=>(progress[key(act,i)]||0) < 2); if(rec<0) rec = LV.length-1;
    const e = W.items[0][0];
    ui.innerHTML = topbar(`${a.ico} ${a.t}`, null, "'menu'") + `
     <p class="crumb">${W.name} › ${a.t}</p>
     <div class="levels screen-in">${LV.map((l,i)=>{ const best = progress[key(act,i)]||0;
       const show = l.em ? `<b style="font-size:26px">${l.em}</b>` : l.show==='five' ? e.repeat(5)+'<br>'+e.repeat(2) : l.show==='mix' ? '🔀' : l.show==='num' ? `<b style="font-size:30px">${l.lo}–${l.hi}</b>` : e.repeat(Math.min(l.hi,5));
       return `<div class="glass lv ${i===rec?'rec':''}" role="button" tabindex="0" data-l="${i}">
         ${i===rec?'<span class="rec-tag">NEXT</span>':''}<div class="t">${l.n}</div><div class="em">${show}</div><div class="s">${l.s}</div>${l.mode?`<div class="mode">${l.mode}</div>`:''}
         <div class="st">${best?starsTxt(best):''}</div></div>`; }).join('')}</div>`;
    ui.querySelectorAll('.lv').forEach(c=>c.onclick=()=>{ sfx.click(); go('game',{act, lvl:+c.dataset.l}); });
    say(`Pick a level! Level ${rec+1} is next.`);
  }

  /* =========================================================
     GAME LOOP — 8 questions, a brick break halfway, results.
     One object for the whole round, so the picture never swaps.
     ========================================================= */
  function startGame({act, lvl}){
    const rot = store.get('rot_'+W.id, 0); store.set('rot_'+W.id, rot+1);
    const mode = SKILL.itemModes === false ? 'pictures' : (settings.pics || 'mix');
    const seq = mode==='dots' ? [DOT] : mode==='pictures' ? W.items : [...W.items, DOT];
    const it = seq[rot % seq.length];
    current = { act, lvl, L:SKILL.levelsFor(act)[lvl], it, q:0, firstTry:0, tries:0 };
    nextQ(current);
  }
  function shell(g, inner){
    document.body.dataset.mode = 'game';   // backgrounds keep look-alike objects away during questions
    const a = SKILL.acts.find(x=>x.id===g.act);
    const cells = Array.from({length:ROUND_LEN},(_,i)=>`<div class="cellp ${i<g.q?'done':i===g.q?'now':''}"></div>`).join('');
    ui.innerHTML = topbar(a.t, null, `'levels','${g.act}'`) +   /* no icons in game titles — they could be counted */
      `<div class="power">${cells}<span class="lbl">${g.L.n}</span></div>
       <div class="glass stage screen-in" id="stage">${inner}</div>`;
  }
  function nextQ(g){
    if(g !== current) return;
    if(g.q >= ROUND_LEN) return results(g);
    if(g.q === ROUND_LEN/2 && !g.breakDone){ g.breakDone = true; return interlude(g); }
    g.tries = 0; g.locked = false;
    SKILL.games[g.act](g, api);
  }
  function right(g, el){
    if(g.tries===0) g.firstTry++;
    g.locked = true; sfx.good(); if(el){ el.classList.add('right'); burst(el); }
    document.querySelectorAll('.obj').forEach(o=>{ o.classList.remove('in'); o.classList.add('celebrate'); });
  }
  function wrong(g, el){
    g.tries++; sfx.oops(); if(el) el.classList.add('wrong');
    say(pick(['Have another look!','Nearly — try again!','Try again!']));
  }
  function praise(extra){
    const p = Math.random()<.6 ? pick(W.cheer) : pick(['Brilliant!','Well done!','Super!','You got it!']);
    const name = Math.random()<.35 ? ` ${settings.name}!` : '';
    say(p + name + (extra ? ' ' + extra : ''), {jump:true});
  }
  const advance = (g, ms) => later(()=>{ g.q++; nextQ(g); }, ms);
  const wordOf = (it, n) => n===1 ? it[2] : it[1];
  const word = (g, n) => wordOf(g.it, n);

  /* ---------- Arrangements ---------- */
  const P = [20,50,80];
  const DICE = {1:[[1,1]], 2:[[0,0],[2,2]], 3:[[0,0],[1,1],[2,2]], 4:[[0,0],[2,0],[0,2],[2,2]],
    5:[[0,0],[2,0],[1,1],[0,2],[2,2]], 6:[[0,0],[0,1],[0,2],[2,0],[2,1],[2,2]]};
  const dicePos = n => DICE[n].map(([x,y])=>[P[x],P[y]]);
  function rotatePos(pos){ const r = rnd(4); return pos.map(([x,y])=>{ let a=x,b=y; for(let i=0;i<r;i++){ [a,b]=[100-b,a]; } return [a,b]; }); }
  /* scatter n points in a box (percent), keeping them apart — minD shrinks for big numbers */
  function scatterPos(n, minD=25, pad=17){
    for(let t=0;t<300;t++){
      const pts = [];
      for(let i=0;i<n;i++){ for(let k=0;k<120;k++){ const p=[pad+Math.random()*(100-2*pad), pad+Math.random()*(100-2*pad)];
        if(pts.every(q=>Math.hypot(p[0]-q[0],p[1]-q[1])>minD)){ pts.push(p); break; } } }
      if(pts.length===n) return pts;
      if(t%40===39) minD *= .9;
    }
    return Array.from({length:n},(_,i)=>[10+(i%5)*20, 15+Math.floor(i/5)*22]);
  }
  const linePos = n => Array.from({length:n},(_,i)=>[10+80/n/2+i*80/n, 50]);
  function groupAt(k,cx,cy){ const s={1:[[0,0]],2:[[-11,0],[11,0]],3:[[-12,8],[12,8],[0,-12]]}; return s[k].map(([x,y])=>[cx+x,cy+y]); }
  const clusterPos = n => { const a = 1 + rnd(n-1); return [...groupAt(a,30,30), ...groupAt(n-a,70,70)]; };
  function arrangement(n, layout){
    if(layout==='dice') return rotatePos(dicePos(n));          // familiar dice patterns first
    const kinds = ['dice','scatter'];
    if(n<=4) kinds.push('line'); if(n>=3 && n<=4) kinds.push('cluster');
    const k = pick(kinds);
    return k==='dice' ? rotatePos(dicePos(n)) : k==='line' ? linePos(n) : k==='cluster' ? clusterPos(n) : scatterPos(n);
  }
  const objs = (pos, e, grp='') => pos.map(([x,y])=>`<div class="obj in ${grp}" style="left:${x}%;top:${y}%">${e}</div>`).join('');
  function framePos(n){ const pos=[]; for(let i=0;i<n;i++) pos.push([10+(i%5)*20, i<5?27:73]); return pos; }
  /* 6–10: a full five in one colour group and the rest in another (like 5 blue bricks and 2 orange) */
  function plateHTML(n, e, style, layout){
    if(n<=5) return `<div class="plate">${objs(arrangement(n, layout), e)}</div>`;
    style = style || pick(['frame','fiveplus']);
    if(style==='frame'){ const pos = framePos(n); return `<div class="plate wide">${objs(pos.slice(0,5), e, 'ga')}${objs(pos.slice(5), e, 'gb')}</div>`; }
    return `<div class="plates"><div class="plate half">${objs(dicePos(5), e, 'ga')}</div><div class="plate half">${objs(rotatePos(dicePos(n-5)), e, 'gb')}</div></div>`;
  }
  function miniPlate(n){
    const col = W.dotColour || '#1b2a6b';
    const pos = n<=6 ? dicePos(n) : framePos(n).map(([x,y])=>[x, y<50?28:72]);
    return `<div class="mini-plate ${n>6?'wide':''}">${pos.map(([x,y])=>`<div class="dot" style="left:${x}%;top:${y}%;--dotc:${col}"></div>`).join('')}</div>`;
  }
  function levelNum(g){ const L = g.L; let n; do{ n = L.lo + rnd(L.hi-L.lo+1); }while(n===g.lastN && L.hi>L.lo); g.lastN = n; return n; }
  function numOpts(n, lo, hi, max=10){
    const near = shuffle([n-2,n-1,n+1,n+2].filter(x=>x>=Math.max(1,lo-1) && x<=Math.min(max,hi+1)));
    near.sort((a,b)=>Math.abs(a-n)-Math.abs(b-n));
    return shuffle([n, ...near.slice(0,2)]);
  }
  /* answer card: numeral and/or dots (dots only shown up to 10) */
  function ansCard(x){
    const dots = settings.answers!=='numbers' && x<=10, num = settings.answers!=='dots' || x>10;
    return `<div class="glass ans" role="button" tabindex="0" data-n="${x}">${num?`<div class="num">${x}</div>`:''}${dots?miniPlate(x):''}</div>`;
  }

  /* ---------- Brick break — away from the screen ---------- */
  function interlude(g){
    const L = g.L, n = Math.min(10, L.lo + rnd(Math.min(L.hi,10)-L.lo+1)) || 3, fingers = Math.random()<.5;
    const big = `<b style="font-size:52px;color:#ffd84d">${n}</b>`;
    const p = fingers ? `Show me ${big} fingers — <i>all at once!</i>${n>5?'<br>Tip: one whole hand is 5…':''}` : W.action.replace('{n}', big);
    const sp = fingers ? `Brick break! Show me ${NUMWORD[n]} fingers, quick as you can!` : 'Brick break! ' + W.action.replace('{n}', NUMWORD[n]);
    shell(g, `<div class="inter"><div class="em">${fingers?'🖐️':W.mascot}</div><h2>Brick break!</h2><p>${p}</p>
      <div class="row"><button class="brick c-green bigbtn" id="done">Done! ✅</button><button class="brick c-white say" id="rep">🔊</button></div></div>`);
    say(sp.replace('Brick break! ',''), {speech:sp, hold:6000});
    $('#done').onclick = ()=>{ sfx.click(); nextQ(g); };
    $('#rep').onclick = ()=>speak(sp);
  }

  /* ---------- Results ---------- */
  function results(g){
    document.body.dataset.mode = 'menu';
    const pct = g.firstTry / ROUND_LEN, stars = pct>=.85 ? 3 : pct>=.55 ? 2 : 1;
    const k = key(g.act, g.lvl);
    progress[k] = Math.max(progress[k]||0, stars);
    const col = pick(COLS); tower.push(col); save();
    sfx.win(); confetti(70);
    ui.innerHTML = topbar('Round complete!', null, `'levels','${g.act}'`) + `<div class="glass stage screen-in"><div class="inter">
      <div class="em">${W.rewardIcon || W.mascot}</div>
      <div class="reward-stars">${[...starsTxt(stars)].map((s,i)=>`<span style="animation-delay:${.3+i*.25}s">${s}</span>`).join('')}</div>
      <h2>Well done, ${esc(settings.name)}!</h2>
      <p>You got <b>${g.firstTry}</b> out of ${ROUND_LEN} first time.</p>
      <p>New brick for your tower: <span class="mini" style="--c:${CSSCOL[col]};display:inline-block;vertical-align:middle;width:46px;height:24px"></span></p>
      <div class="row">
        <button class="brick c-green bigbtn" id="again">Play again 🔁</button>
        <button class="brick c-blue bigbtn" id="other">Other games 🎯</button>
        <a class="brick c-yellow bigbtn" href="${HUB}" style="text-align:center">New world 🌍</a>
      </div>
      <p style="margin-top:16px">🧱 Break time! Can you build a real tower with ${stars+2} bricks?</p></div></div>`;
    $('#again').onclick = ()=>{ sfx.click(); go('game',{act:g.act, lvl:g.lvl}); };
    $('#other').onclick = ()=>{ sfx.click(); go('menu'); };
    say(`${pick(W.cheer)} You earned a new brick for your tower!`, {jump:true, hold:6000});
  }

  /* ---------- Intro (3D) — plays when a world is picked; skipped when switching skill in the same world ---------- */
  function runIntro(){
    if(!(W.intro && window.THREE)) return go('menu');
    try{ W.intro(()=>go('menu')); }catch(e){ console.warn(e); go('menu'); }
  }
  window.SUB.replayIntro = runIntro;
  window.SUB.state = ()=>current;

  const api = { W, NUMWORD, DOT, say, jumpMascot, burst, later, shell, right, wrong, praise, advance, word, wordOf,
    dicePos, rotatePos, scatterPos, framePos, objs, arrangement, plateHTML, miniPlate, levelNum, numOpts, ansCard,
    get current(){ return current; } };
  window.SUB.api = api;

  grownupButton();
  if(location.hash === '#skip-intro') go('menu'); else runIntro();
};
})();
