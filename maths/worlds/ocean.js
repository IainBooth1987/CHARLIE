/* World pack: Under the Sea — objects, look, background and 3D intro, shared by every maths skill */
window.WORLD = {
  id:'ocean', hide:"in the cave", box:"the treasure chest", name:'Under the Sea', icon:'🐠', mascot:'🐳', rewardIcon:'🐬', dotColour:'#0b4f86',
  items:[['🐠','fish','fish'],['🐙','octopuses','octopus'],['🐚','shells','shell']],
  games:{flash:'Quick Look Dive', flashIcon:'🤿', match:'Same or Different?', matchIcon:'🫧', make:'Fill the Rock Pool', makeIcon:'🪸'},
  menuLine:'Splash! Welcome under the sea! Pick a game!',
  cheer:['Fin-tastic!','Splashing!','Swimmingly done!','Shell-ebrate!'],
  action:'Swim your arms {n} times!',

  /* ---- Animated 2D background: light rays, swaying seaweed, bubbles (bubbles only on menus) ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, bubbles = [], weeds = [], t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr;
      bubbles = Array.from({length:30}, ()=>({x:Math.random()*w, y:Math.random()*h, r:(3+Math.random()*9)*dpr, v:(.4+Math.random()*.9)*dpr, p:Math.random()*6}));
      weeds = Array.from({length:Math.ceil(w/(60*dpr))}, (_,i)=>({x:i*60*dpr + Math.random()*30*dpr, hgt:(60+Math.random()*110)*dpr, c:pick(['#0f7a5a','#138a64','#0b6a4d']), p:Math.random()*6})); };
    resize(); addEventListener('resize', resize);
    const loop = (now)=>{
      requestAnimationFrame(loop); if(document.hidden) return;
      const t = (now-t0)/1000; ctx.clearRect(0,0,w,h);
      for(let i=0;i<5;i++){ ctx.save(); ctx.translate(w*(.1+i*.2) + Math.sin(t*.2+i)*30*dpr, 0); ctx.rotate(.25 + Math.sin(t*.15+i)*.05);
        const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(170,240,255,.14)'); g.addColorStop(1,'rgba(170,240,255,0)');
        ctx.fillStyle = g; ctx.fillRect(-30*dpr,0,60*dpr,h*1.1); ctx.restore(); }
      for(const wd of weeds){ ctx.strokeStyle = wd.c; ctx.lineWidth = 10*dpr; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(wd.x, h);
        for(let s=1;s<=6;s++){ const y = h - wd.hgt*s/6, x = wd.x + Math.sin(t*1.2 + wd.p + s*.6)*10*dpr*s/6; ctx.lineTo(x,y); } ctx.stroke(); }
      if(document.body.dataset.mode !== 'game'){
        for(const b of bubbles){ b.y -= b.v; if(b.y < -20) { b.y = h + 20; b.x = Math.random()*w; }
          const x = b.x + Math.sin(t*2+b.p)*6*dpr; ctx.strokeStyle = 'rgba(210,245,255,.45)'; ctx.lineWidth = 1.5*dpr; ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 7); ctx.stroke();
          ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(x-b.r*.35, b.y-b.r*.35, b.r*.25, 0, 7); ctx.fill(); } }
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: a submarine dive ---- */
  intro(done){
    const T = THREE;
    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp"><span data-i="0">⚪</span><span data-i="1">⚪</span><span data-i="2">⚪</span><span data-i="3">🐠</span><span data-i="4">🐢</span><span data-i="5">🐙</span><span data-i="6">🐋</span></div>
      <div class="ov" id="ov"><h1>UNDER THE SEA</h1><div class="sub">Hop in the submarine and explore the ocean!</div>
        <button class="launch" id="launch" style="background:linear-gradient(135deg,#14b8c4,#3b82f6)">🫧 Dive!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
    const showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };
    const lightDot = i=>{ const d = pp.querySelector(`[data-i="${i}"]`); if(d) d.classList.add('on'); };
    function bloop(n=3){ if(!settings.sfx) return; for(let i=0;i<n;i++){ const a = audio(); if(!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + i*.12;
      o.frequency.setValueAtTime(300+Math.random()*200,t); o.frequency.exponentialRampToValueAtTime(900+Math.random()*300,t+.1);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.06,t+.01); g.gain.exponentialRampToValueAtTime(.001,t+.12); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+.13); } }
    function sonar(){ if(!settings.sfx) return; tone(1200,0,.5,'sine',.05); tone(1200,.6,.5,'sine',.025); }
    function whaleSong(){ if(!settings.sfx) return; const a = audio(); if(!a) return; const o = a.createOscillator(), g = a.createGain(), t = a.currentTime;
      o.type='sine'; o.frequency.setValueAtTime(180,t); o.frequency.linearRampToValueAtTime(420,t+.8); o.frequency.linearRampToValueAtTime(240,t+1.8);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.08,t+.3); g.gain.linearRampToValueAtTime(0,t+1.9); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+2); }

    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0x0d5f8f); scene.fog = new T.Fog(0x0e6a98, 12, 50);
    const cam = new T.PerspectiveCamera(55, innerWidth/innerHeight, .1, 200);
    scene.add(new T.HemisphereLight(0xaef0ff, 0x1a3b5a, .72));
    const sun = new T.DirectionalLight(0xdff8ff, .55); sun.position.set(3, 20, 4); scene.add(sun);
    const canvasTex = (w, h, draw)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
    const L = c => new T.MeshLambertMaterial({color:c});

    /* toon helpers (same style as the Jungle animals) */
    const grad = new T.DataTexture(new Uint8Array([70, 140, 215]), 3, 1, T.LuminanceFormat); grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
    const toon = c => new T.MeshToonMaterial({color:c, gradientMap:grad});
    const BLACK = new T.MeshBasicMaterial({color:0x111111}), WHITE = toon(0xffffff), SHINE = new T.MeshBasicMaterial({color:0xffffff});
    const SPH = new T.SphereGeometry(1, 20, 14);
    function blob(parent, mat, sx, sy, sz, x, y, z){ const m = new T.Mesh(SPH, mat); m.scale.set(sx,sy,sz); m.position.set(x,y,z); parent.add(m); return m; }
    function cEye(parent, x, y, z, r, iris){ const g = new T.Group(); g.position.set(x,y,z); parent.add(g);
      blob(g, WHITE, r, r, r*.8, 0, 0, 0); blob(g, toon(iris), r*.62, r*.62, r*.3, 0, -r*.05, r*.62);
      blob(g, BLACK, r*.36, r*.36, r*.2, 0, -r*.05, r*.78); blob(g, SHINE, r*.14, r*.14, r*.08, r*.22, r*.2, r*.86);
      blob(g, SHINE, r*.07, r*.07, r*.05, -r*.15, -r*.22, r*.86); return g; }

    /* ---- Seabed ---- */
    const sandTex = canvasTex(512,512,(x,w,h)=>{ x.fillStyle='#cbb27c'; x.fillRect(0,0,w,h);
      for(let i=0;i<3000;i++){ x.fillStyle = pick(['#bfa46c','#d6bf8a','#b39760']); x.fillRect(Math.random()*w, Math.random()*h, 2, 2); }
      x.strokeStyle = 'rgba(160,130,80,.25)'; x.lineWidth = 4; for(let y=0;y<h;y+=26){ x.beginPath(); for(let xx=0;xx<=w;xx+=16) x.lineTo(xx, y + Math.sin(xx*.05)*5); x.stroke(); } });
    sandTex.wrapS = sandTex.wrapT = T.RepeatWrapping; sandTex.repeat.set(8,10);
    const sand = new T.Mesh(new T.PlaneGeometry(90,110), new T.MeshLambertMaterial({map:sandTex})); sand.rotation.x = -Math.PI/2; sand.position.set(0,0,-28); scene.add(sand);
    // light shafts from the surface
    const rayTex = canvasTex(64,256,(x,w,h)=>{ const g = x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(220,250,255,.5)'); g.addColorStop(1,'rgba(220,250,255,0)'); x.fillStyle = g; x.fillRect(0,0,w,h); });
    const rays = Array.from({length:6}, (_,i)=>{ const r = new T.Mesh(new T.PlaneGeometry(2.5,22), new T.MeshBasicMaterial({map:rayTex, transparent:true, depthWrite:false, blending:T.AdditiveBlending, side:T.DoubleSide}));
      r.position.set(-15+Math.random()*30, 11, -60+i*12); r.rotation.z = .25; r.rotation.y = Math.random()*3; scene.add(r); return r; });
    // floating specks
    const N = 500, sp = new Float32Array(N*3); for(let i=0;i<N;i++){ sp[i*3] = (Math.random()-.5)*50; sp[i*3+1] = Math.random()*14; sp[i*3+2] = -70 + Math.random()*85; }
    const specG = new T.BufferGeometry(); specG.setAttribute('position', new T.BufferAttribute(sp,3));
    scene.add(new T.Points(specG, new T.PointsMaterial({color:0xdff8ff, size:.08, transparent:true, opacity:.7})));

    const subPath = new T.CatmullRomCurve3([[0,2.6,6],[0,2.6,-5],[4.5,2.8,-16],[2.5,3,-28],[-4,2.8,-38],[-5,3.2,-49],[0,3.5,-60]].map(p=>new T.Vector3(...p)));
    const pathPts = subPath.getSpacedPoints(160);
    const distToPath = (x,z)=>{ let m = 1e9; for(const p of pathPts){ const d = (p.x-x)**2+(p.z-z)**2; if(d<m) m = d; } return Math.sqrt(m); };
    const AVOID = [[-4.5,-12],[8.5,-24],[-8.5,-38],[0,-1]];
    const freeSpot = (x,z,r=3.5)=> distToPath(x,z) > 3.2 && !AVOID.some(([ax,az])=>Math.hypot(ax-x,az-z) < r);

    // coral, seaweed, rocks
    const coralCols = [0xff6f91, 0xff9f43, 0xb06bff, 0xff5c5c, 0xffd23f];
    function coral(x,z,s){ const g = new T.Group(); g.position.set(x,0,z); g.scale.setScalar(s); scene.add(g); const m = toon(pick(coralCols));
      for(let i=0;i<6;i++){ const br = new T.Mesh(new T.CylinderGeometry(.07,.12,1.2,8), m); const a = i*1.05; br.position.set(Math.cos(a)*.25,.55,Math.sin(a)*.25);
        br.rotation.set(Math.sin(a)*.5,0,Math.cos(a)*.5); g.add(br); blob(g, m, .14,.14,.14, Math.cos(a)*.55, 1.1, Math.sin(a)*.55); } return g; }
    function brain(x,z,s){ blob(scene, toon(pick([0xf2a65a,0xe88aa7,0xc7a0ff])), .9*s,.55*s,.9*s, x,.2,z); }
    const weeds = [];
    function seaweed(x,z,hgt){ const g = new T.Group(); g.position.set(x,0,z); scene.add(g); let parent = g; const m = toon(pick([0x1f9e62,0x2bbf75,0x168a52]));
      for(let i=0;i<hgt;i++){ const pv = new T.Group(); pv.position.y = i===0?0:.55; parent.add(pv); blob(pv, m, .16,.34,.08, 0,.28,0); weeds.push({pv, i, p:x*.7+z*.3}); parent = pv; } }
    function rock(x,z,s){ const r = blob(scene, toon(pick([0x6b7c93,0x55667c,0x7a8aa0])), 1.2*s,.7*s,1*s, x,.2,z); r.rotation.y = Math.random()*3; }
    let placed = 0, tries = 0;
    while(placed < 60 && tries < 3000){ tries++; const x = -28 + Math.random()*56, z = -68 + Math.random()*80; if(!freeSpot(x,z)) continue;
      const r = Math.random(); if(r<.35) coral(x,z,.7+Math.random()*.8); else if(r<.65) seaweed(x,z,3+Math.floor(Math.random()*5)); else if(r<.8) brain(x,z,.6+Math.random()*.7); else rock(x,z,.6+Math.random()*1.2); placed++; }

    // little fish swimming in loops
    const schools = [];
    [[-6,4,-8],[7,5,-32],[-3,6,-46],[5,4.5,-6]].forEach(([cx,cy,cz],si)=>{ const col = [0xffd23f,0x4fc3f7,0xff8a65,0xb388ff][si];
      for(let i=0;i<6;i++){ const f = new T.Group(); scene.add(f); const m = toon(col);
        blob(f, m, .12,.16,.3, 0,0,0); const tl = new T.Mesh(new T.ConeGeometry(.14,.25,4), m); tl.rotation.x = -Math.PI/2; tl.scale.set(.4,1,1); tl.position.z = -.35; f.add(tl);
        blob(f, BLACK, .03,.03,.03, .1,.05,.18); blob(f, BLACK, .03,.03,.03, -.1,.05,.18);
        schools.push({f, cx, cy, cz, r:2+Math.random()*1.5, a:i*.7, sp:.5+Math.random()*.2, y:(Math.random()-.5)*1.2}); } });

    /* ---- Submarine ---- */
    const sub = new T.Group(); scene.add(sub);
    const SUBY = toon(0xffcd00), SUBD = toon(0xe0a800);
    const hull = new T.Mesh(new T.CylinderGeometry(.85,.85,2.6,28), SUBY); hull.rotation.x = Math.PI/2; sub.add(hull);
    blob(sub, SUBY, .85,.85,.85, 0,0,-1.3); blob(sub, SUBY, .85,.85,.85, 0,0,1.3);
    const tower = new T.Mesh(new T.CylinderGeometry(.42,.5,.7,20), SUBD); tower.position.set(0,.95,.1); sub.add(tower);
    const peri = new T.Mesh(new T.CylinderGeometry(.05,.05,.7,8), toon(0x555555)); peri.position.set(.1,1.55,.1); sub.add(peri);
    const peri2 = new T.Mesh(new T.CylinderGeometry(.05,.05,.3,8), toon(0x555555)); peri2.rotation.x = Math.PI/2; peri2.position.set(.1,1.9,.25); sub.add(peri2);
    [-.7,0,.7].forEach(z=>[-1,1].forEach(s=>{ const ring = new T.Mesh(new T.TorusGeometry(.2,.05,8,20), toon(0xb0b0b0)); ring.position.set(s*.85,.1,z); ring.rotation.y = Math.PI/2; sub.add(ring);
      const win = new T.Mesh(new T.CircleGeometry(.18,20), new T.MeshBasicMaterial({color:0x8fe8ff})); win.position.set(s*.86,.1,z); win.rotation.y = s*Math.PI/2; sub.add(win); }));
    const prop = new T.Group(); prop.position.set(0,0,2.25); sub.add(prop);
    for(let i=0;i<3;i++){ const bl = blob(prop, toon(0x8a8a8a), .08,.4,.04, 0,.2,0); bl.parent.remove(bl); const pv = new T.Group(); pv.rotation.z = i*Math.PI*2/3; pv.add(bl); prop.add(pv); }
    const fin = new T.Mesh(new T.BoxGeometry(.06,.8,.6), SUBD); fin.position.set(0,.3,1.9); sub.add(fin);
    const lamp = new T.Mesh(new T.CircleGeometry(.22,20), new T.MeshBasicMaterial({color:0xfff6c0})); lamp.position.set(0,-.1,-2.16); lamp.rotation.y = Math.PI; sub.add(lamp);
    const beamTex = canvasTex(64,128,(x,w,h)=>{ const g = x.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(255,250,210,.45)'); g.addColorStop(1,'rgba(255,250,210,0)'); x.fillStyle=g; x.fillRect(0,0,w,h); });
    const beam = new T.Mesh(new T.ConeGeometry(1.4,6,24,1,true), new T.MeshBasicMaterial({map:beamTex, transparent:true, depthWrite:false, blending:T.AdditiveBlending, side:T.DoubleSide}));
    beam.rotation.x = Math.PI/2; beam.position.set(0,-.1,-5.1); sub.add(beam);
    // bubbles from the propeller
    const bubbleMat = new T.MeshBasicMaterial({color:0xdff8ff, transparent:true, opacity:.6});
    const bubbles = Array.from({length:40}, ()=>{ const b = new T.Mesh(new T.SphereGeometry(.07,8,6), bubbleMat); b.visible = false; scene.add(b); return b; });
    function puff(at, n=2){ let k = 0; for(const b of bubbles){ if(!b.visible && k<n){ b.visible = true; b.position.copy(at).add(new T.Vector3((Math.random()-.5)*.3,(Math.random()-.5)*.3,(Math.random()-.5)*.3));
      b.userData.v = .02 + Math.random()*.03; b.scale.setScalar(.6 + Math.random()*1.2); k++; } } }

    /* ---- Clams with pearls ---- */
    const clams = [[-2.2,-2.2],[0,-3.2],[2.2,-2.2]].map(([x,z],i)=>{ const g = new T.Group(); g.position.set(x,.15,z); scene.add(g);
      const shellM = toon([0xf29bb8,0xb8a0ff,0x8fd3ff][i]);
      const bot = blob(g, shellM, .6,.2,.5, 0,0,0);
      const lidPv = new T.Group(); lidPv.position.set(0,.05,-.45); g.add(lidPv);
      const lid = blob(lidPv, shellM, .6,.22,.5, 0,.05,.45);
      const pearl = blob(g, toon(0xfffaf0), .16,.16,.16, 0,.2,0); pearl.material = new T.MeshPhongMaterial({color:0xfffaf0, specular:0xffffff, shininess:100});
      return {g, lidPv, pearl, open:0}; });

    /* ---- Clownfish in an anemone ---- */
    const anem = new T.Group(); anem.position.set(-4.5,0,-12); scene.add(anem);
    const ANEM = toon(0xc06bff), ANEMT = toon(0xf0b3ff);
    blob(anem, ANEM, .9,.4,.9, 0,.25,0);
    const tentacles = [];
    for(let i=0;i<24;i++){ const a = Math.random()*Math.PI*2, r = Math.random()*.75; const pv = new T.Group(); pv.position.set(Math.cos(a)*r,.45,Math.sin(a)*r); anem.add(pv);
      const tc = new T.Mesh(new T.CylinderGeometry(.07,.11,.9,8), ANEM); tc.position.y = .45; pv.add(tc); blob(pv, ANEMT, .12,.12,.12, 0,.92,0); tentacles.push({pv, p:Math.random()*6}); }
    const clown = new T.Group(); clown.position.set(-4.5,1.6,-12); scene.add(clown);
    const ORG = toon(0xff7a1a);
    blob(clown, ORG, .32,.4,.62, 0,0,0);
    [[.28,.9],[-.05,.95],[-.38,.75]].forEach(([z,sc])=>{ blob(clown, WHITE, .34*sc,.42*sc,.07, 0,0,z); });
    const cTail = new T.Group(); cTail.position.z = -.6; clown.add(cTail); blob(cTail, ORG, .06,.32,.22, 0,0,-.15);
    blob(clown, ORG, .05,.25,.3, 0,.38,-.05);
    cEye(clown, .2,.12,.38, .1, 0x2a1a10); cEye(clown, -.2,.12,.38, .1, 0x2a1a10);
    clown.children.filter(c=>c.type==='Group' && c!==cTail).forEach((e,i)=>e.rotation.y = (i?-1:1)*.7);

    /* ---- Sea turtle ---- */
    const turtle = new T.Group(); turtle.position.set(8.5,3.4,-24); scene.add(turtle);
    const shellTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#3f8f4a'; x.fillRect(0,0,w,h); x.strokeStyle='#e8d48a'; x.lineWidth=7;
      for(let r=0;r<5;r++) for(let c=0;c<5;c++){ const cx = c*56+(r%2)*28, cy = r*52+10; x.beginPath(); for(let k=0;k<6;k++){ const a = k*Math.PI/3; x.lineTo(cx+Math.cos(a)*26, cy+Math.sin(a)*26); } x.closePath(); x.stroke(); } });
    const shell = new T.Mesh(new T.SphereGeometry(1,28,16,0,Math.PI*2,0,Math.PI/2), new T.MeshToonMaterial({map:shellTex, gradientMap:grad})); shell.scale.set(1.1,.55,1.35); turtle.add(shell);
    blob(turtle, toon(0xe8d48a), 1.05,.18,1.3, 0,0,0);
    const TSKIN = toon(0x7cc576);
    const tHead = new T.Group(); tHead.position.set(0,.15,1.55); turtle.add(tHead); blob(tHead, TSKIN, .38,.32,.42, 0,0,0);
    cEye(tHead, .2,.1,.28, .1, 0x2a1a10); cEye(tHead, -.2,.1,.28, .1, 0x2a1a10);
    const tSmile = new T.Mesh(new T.TorusGeometry(.1,.018,6,14,Math.PI), BLACK); tSmile.rotation.z = Math.PI; tSmile.position.set(0,-.1,.38); tHead.add(tSmile);
    const flippers = [[-1,1],[1,1],[-1,-1],[1,-1]].map(([s,f])=>{ const pv = new T.Group(); pv.position.set(s*.95,0,f*.8); turtle.add(pv);
      blob(pv, TSKIN, .7*(f>0?1:.6),.07,.28, s*.6*(f>0?1:.6),0,f*.1); return {pv, s, f}; });

    /* ---- Octopus on a rock ---- */
    const oRock = blob(scene, toon(0x55667c), 1.8,.8,1.5, -8.5,.2,-38);
    const octo = new T.Group(); octo.position.set(-8.5,1.5,-38); octo.rotation.y = .8; scene.add(octo);
    const OCT = toon(0xff6fa8), OCTL = toon(0xffb3d1);
    blob(octo, OCT, .85,1,.85, 0,1.15,0);
    cEye(octo, .32,1.2,.68, .2, 0x2a1a10); cEye(octo, -.32,1.2,.68, .2, 0x2a1a10);
    const oSmile = new T.Mesh(new T.TorusGeometry(.16,.03,6,16,Math.PI), BLACK); oSmile.rotation.z = Math.PI; oSmile.position.set(0,.85,.8); octo.add(oSmile);
    [-1,1].forEach(s=>blob(octo, toon(0xff9cc4), .12,.08,.05, s*.48,.9,.72));    // rosy cheeks
    const arms = [];
    for(let a=0;a<8;a++){ const ang = a*Math.PI/4; let parent = new T.Group(); parent.position.set(Math.cos(ang)*.55,.4,Math.sin(ang)*.55); parent.rotation.y = -ang + Math.PI/2; octo.add(parent);
      const segs = [];
      for(let i=0;i<7;i++){ const pv = new T.Group(); pv.position.z = i===0 ? 0 : .3; parent.add(pv); const r = .2 - i*.022;
        blob(pv, OCT, r, r, .2, 0,0,.15); if(i%2===0) blob(pv, OCTL, r*.4, r*.4, r*.4, 0,-r*.8,.15); segs.push(pv); parent = pv; }
      arms.push({segs, p:a*.8}); }

    /* ---- Whale gliding overhead ---- */
    const whale = new T.Group(); whale.position.set(3,8,-62); whale.rotation.y = -1.9; scene.add(whale);
    const WB = toon(0x3f6fb5), WBL = toon(0xcfe3f5);
    blob(whale, WB, 2.2,1.8,4.4, 0,0,0);
    blob(whale, WBL, 1.8,1.2,3.6, 0,-.75,.4);
    const wTail = new T.Group(); wTail.position.z = -4; whale.add(wTail);
    blob(wTail, WB, .9,.7,1.8, 0,0,-1); const flukes = new T.Group(); flukes.position.z = -2.6; wTail.add(flukes);
    blob(flukes, WB, 1.6,.12,.7, -1,0,-.2); blob(flukes, WB, 1.6,.12,.7, 1,0,-.2);
    [-1,1].forEach(s=>{ const fl = blob(whale, WB, 1.2,.12,.5, s*2.1,-.6,1.2); fl.rotation.z = s*.5; });
    cEye(whale, 1.55,.1,2.6, .32, 0x1a1a3a); cEye(whale, -1.55,.1,2.6, .32, 0x1a1a3a);
    whale.children.filter(c=>c.type==='Group' && c!==wTail).forEach((e,i)=>e.rotation.y = (i?-1:1)*1.0);
    const wSmile = new T.Mesh(new T.TorusGeometry(1.1,.07,8,24,Math.PI*.7), BLACK); wSmile.rotation.set(0,0,Math.PI*1.15); wSmile.position.set(0,-.4,4); whale.add(wSmile);

    const STOPS = [
      {obj:clown,  name:'Clownfish',  fact:'Clownfish live in wiggly sea anemones.', dot:3, look:new T.Vector3(-4.5,1.4,-12), D:3.6, H:.6, sound:()=>bloop(3)},
      {obj:turtle, name:'Sea turtle', fact:'Sea turtles swim with their four flippers.', dot:4, look:new T.Vector3(8.5,3.4,-24), D:5, H:.8, sound:()=>bloop(2)},
      {obj:octo,   name:'Octopus',    fact:'An octopus has eight arms!', dot:5, look:new T.Vector3(-8.5,2.5,-38), D:5.5, H:.8, sound:()=>bloop(4)},
      {obj:whale,  name:'Whale',      fact:'A blue whale is the biggest animal in the whole world!', dot:6, look:new T.Vector3(3,7,-62), D:13, H:-2.5, sound:whaleSong}
    ];
    STOPS.forEach(s=>s.said = false);

    /* ---- animation ---- */
    let phase = 'idle', t = 0, phaseT = 0, raf = 0, ended = false, last = performance.now();
    let pearls = 0, pearlT = 0, subU = 0, speed = 0, focus = null, focusT = 0;
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const tmp = new T.Vector3(), camLook = new T.Vector3(0,2,0);
    const placeSub = (u, extraY=0)=>{ const p = subPath.getPointAt(u), tan = subPath.getTangentAt(u);
      sub.position.set(p.x, p.y + Math.sin(t*1.3)*.08 + extraY, p.z); sub.rotation.y = Math.atan2(-tan.x, -tan.z); sub.rotation.z = Math.sin(t*.9)*.04; return {p, tan}; };
    placeSub(0, 4); cam.position.set(4, 7.5, 13);

    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67)*(window.INTRO_SPEED||1); last = now; t += k/60; phaseT += k/60;
      prop.rotation.z += (phase==='idle' ? .08 : .3)*k;
      weeds.forEach(w=>w.pv.rotation.z = Math.sin(t*1.1 + w.p + w.i*.5)*.12);
      tentacles.forEach(tc=>{ tc.pv.rotation.x = Math.sin(t*1.6+tc.p)*.25; tc.pv.rotation.z = Math.cos(t*1.3+tc.p)*.25; });
      rays.forEach((r,i)=>{ r.material.opacity = .45 + Math.sin(t*.6+i)*.2; });
      schools.forEach(s=>{ s.a += s.sp*k/60; const x = s.cx + Math.cos(s.a)*s.r, z = s.cz + Math.sin(s.a)*s.r; s.f.position.set(x, s.cy + s.y + Math.sin(s.a*2)*.2, z); s.f.rotation.y = -s.a; });
      clown.position.y = 1.6 + Math.sin(t*2)*.15; clown.rotation.y = Math.sin(t*.7)*.6; cTail.rotation.y = Math.sin(t*12)*.4;
      turtle.position.y = 3.4 + Math.sin(t*.8)*.25; flippers.forEach(f=>f.pv.rotation.z = f.s*Math.sin(t*2.2 + (f.f>0?0:1))*.45);
      arms.forEach(a=>a.segs.forEach((s,i)=>{ s.rotation.x = Math.sin(t*2 + a.p + i*.5)*.22 + .12; }));
      octo.position.y = 1.5 + Math.sin(t*1.5)*.08;
      whale.position.x = 3 + Math.sin(t*.15)*2; wTail.rotation.x = Math.sin(t*1.2)*.25; flukes.rotation.x = Math.sin(t*1.2-.6)*.3;
      bubbles.forEach(b=>{ if(b.visible){ b.position.y += b.userData.v*k; b.position.x += Math.sin(t*4+b.id)*.004; if(b.position.y > 12) b.visible = false; } });
      if(phase!=='idle' && Math.random()<.5){ prop.updateMatrixWorld(true); prop.getWorldPosition(tmp); puff(tmp, 1); }

      if(phase==='idle'){
        placeSub(0, 4 + Math.sin(t)*.2);
        cam.position.lerp(tmp.set(4 + Math.sin(t*.3)*1.5, 7.5, 13), .03*k); camLook.lerp(tmp.set(0, 5.5, 4), .05*k); cam.lookAt(camLook);
      }
      else if(phase==='dive'){
        const d = Math.min(1, phaseT/2.6); placeSub(0, 4*(1-d*d*(3-2*d))); sub.rotation.x = Math.sin(d*Math.PI)*.35;
        cam.position.lerp(tmp.set(3.5, 4.2, 11.5), .03*k); camLook.lerp(tmp.set(0, 1.5, 1), .04*k); cam.lookAt(camLook);
        if(phaseT > 3){ phase = 'pearls'; phaseT = 0; pearlT = 0; showCap('3 sleepy clams!', 'Count the pearls!'); speak("Look, three clams! Let's count the pearls!", 1); }
      }
      else if(phase==='pearls'){
        placeSub(0); sub.rotation.x *= .9;
        cam.position.lerp(tmp.set(5.2, 2.6, -.2), .03*k); camLook.lerp(tmp.set(-.4, .9, -2.2), .04*k); cam.lookAt(camLook);
        pearlT += k/60;
        if(pearls < 3 && pearlT > 1.6){ const c = clams[pearls]; c.opening = true; c.t = 0; pearls++; pearlT = 0; sonar(); }
        clams.forEach((c,i)=>{ if(!c.opening) return; c.t += k/60;
          c.lidPv.rotation.x = -Math.min(1, c.t/.5)*1.0;
          if(c.t > .6){ const u = Math.min(1, (c.t-.6)/1.1); const to = tmp.copy(sub.position).sub(c.g.position);   // pearl floats up into the submarine
            c.pearl.position.set(to.x*u, .2 + (to.y-.2)*u + Math.sin(u*Math.PI)*.8, to.z*u); c.pearl.scale.setScalar(.16*(1-u*.3));
            if(u>=1 && !c.counted){ c.counted = true; c.pearl.visible = false; const n = ['One!','Two!','Three!'][i];
              showCap(n, ['One pearl!','Two pearls!','Three pearls — treasure!'][i]); speak(n, 1); bloop(2); lightDot(i); if(i===2) pearlT = 0; } } });
        if(clams[2].counted && pearlT > 2.4){ phase = 'tour'; phaseT = 0; showCap('Full speed ahead!', "Let's meet some sea creatures!"); speak("Full speed ahead! Let's meet some sea creatures!", 1); }
      }
      else if(phase==='tour'){
        let near = null, nd = 1e9;
        STOPS.forEach(s=>{ const d = Math.hypot(s.look.x-sub.position.x, s.look.z-sub.position.z); if(d<nd){ nd = d; near = s; } });
        const target = nd < 11 ? (focus && focusT < 5 ? .03 : .05) : .2;
        speed += (target-speed)*.04*k; subU = Math.min(1, subU + speed*k/subPath.getLength());
        const {p, tan} = placeSub(subU);
        if(near && nd < 10.5 && !near.said){ near.said = true; focus = near; focusT = 0;
          const dx = sub.position.x - near.look.x, dz = sub.position.z - near.look.z, l = Math.hypot(dx,dz)||1;
          near.camPos = new T.Vector3(near.look.x + dx/l*near.D, near.look.y + near.H, near.look.z + dz/l*near.D);
          showCap(near.name, near.fact); speak(near.fact, .95); near.sound(); lightDot(near.dot); }
        if(focus){ focusT += k/60; if(focusT > 6.5) focus = null; }
        const back = tmp.set(tan.x, 0, tan.z).normalize();
        if(focus && focusT < 5){ cam.position.lerp(focus.camPos, .03*k); camLook.lerp(focus.look, .05*k); }
        else { cam.position.lerp(new T.Vector3(p.x - back.x*7.5 + back.z*2.5, p.y + 2.2, p.z - back.z*7.5 - back.x*2.5), .03*k);
          camLook.lerp(new T.Vector3(p.x + back.x*6, p.y, p.z + back.z*6), .05*k); }
        cam.lookAt(camLook);
        if(subU >= 1 && (!focus || focusT > 4.5)){ phase = 'finale'; phaseT = 0; showCap('Your turn!', "Let's play under the sea!"); speak("What an adventure! Your turn! Let's play!", 1); }
      }
      else if(phase==='finale'){
        sub.position.y += .01*k;
        cam.position.lerp(tmp.set(sub.position.x + 6, sub.position.y + 1, sub.position.z + 6), .02*k); camLook.lerp(tmp.copy(sub.position), .04*k); cam.lookAt(camLook);
        if(phaseT > 3.2) finish();
      }
      renderer.render(scene, cam);
    }
    function finish(){
      if(ended) return; ended = true; stopVoice();
      wrap.classList.add('out');
      setTimeout(()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); wrap.remove(); }, 750);
      done();
    }
    wrap.querySelector('#launch').onclick = ()=>{
      if(phase!=='idle') return; sfx.click(); audio();
      wrap.querySelector('#ov').classList.add('go'); pp.classList.add('show');
      phase = 'dive'; phaseT = 0; bloop(5);
      showCap('Dive, dive, dive!', 'Down to the bottom of the sea'); speak('Dive, dive, dive! Down to the bottom of the sea!', 1);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    requestAnimationFrame(frame);
    speak('Welcome under the sea! Tap dive!');
  }
};
