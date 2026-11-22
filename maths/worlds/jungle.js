/* World pack: Jungle — objects, look, background and 3D intro, shared by every maths skill */
window.WORLD = {
  id:'jungle', hide:"behind the big tree", box:"the basket", name:'Jungle', icon:'🦁', mascot:'🦜', rewardIcon:'🐘', dotColour:'#14532d',
  items:[['🦁','lions','lion'],['🐵','monkeys','monkey'],['🍌','bananas','banana']],
  games:{flash:'Quick Look Safari', flashIcon:'🔭', match:'Same or Different?', matchIcon:'🌴', make:'Fill the Treehouse', makeIcon:'🛖'},
  menuLine:'Squawk! Welcome to the jungle! Pick a game!',
  cheer:['Roar-some!','Wild!','Jungle genius!','Squawk! Brilliant!'],
  action:'Roar like a lion {n} times!',

  /* ---- Animated 2D background: sunbeams, swaying leaves at the edges, fireflies ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, flies = [], t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr;
      flies = Array.from({length:26}, ()=>({x:Math.random()*w, y:Math.random()*h, p:Math.random()*6, s:.4+Math.random()})); };
    resize(); addEventListener('resize', resize);
    function leaf(x, y, len, ang, col){ ctx.save(); ctx.translate(x,y); ctx.rotate(ang); ctx.fillStyle = col; ctx.beginPath();
      ctx.moveTo(0,0); ctx.quadraticCurveTo(len*.5,-len*.28,len,0); ctx.quadraticCurveTo(len*.5,len*.28,0,0); ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,.15)'; ctx.lineWidth = 2*dpr; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(len,0); ctx.stroke(); ctx.restore(); }
    const loop = (now)=>{
      requestAnimationFrame(loop); if(document.hidden) return;
      const t = (now-t0)/1000; ctx.clearRect(0,0,w,h);
      // sunbeams
      for(let i=0;i<4;i++){ ctx.save(); ctx.translate(w*(.2+i*.22), -20*dpr); ctx.rotate(.35 + Math.sin(t*.2+i)*.03);
        const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'rgba(255,250,200,.13)'); g.addColorStop(1,'rgba(255,250,200,0)');
        ctx.fillStyle = g; ctx.fillRect(-40*dpr,0,80*dpr,h*1.2); ctx.restore(); }
      // fireflies
      for(const f of flies){ f.x += Math.sin(t*f.s+f.p)*.3*dpr; f.y += Math.cos(t*f.s*.8+f.p)*.25*dpr;
        ctx.globalAlpha = .35 + .35*Math.sin(t*2*f.s+f.p); ctx.fillStyle = '#fff6a0'; ctx.beginPath(); ctx.arc(f.x, f.y, 2.2*dpr, 0, 7); ctx.fill(); }
      ctx.globalAlpha = 1;
      // swaying leaves at the corners
      const sw = Math.sin(t*.8)*.06;
      [['#1f7a34',0,0,1],['#2f9a46',0,0,1],['#16602a',w,0,-1],['#2a8a40',w,0,-1],['#1f7a34',0,h,1],['#16602a',w,h,-1]].forEach(([c,x,y,d],i)=>{
        for(let k=0;k<4;k++) leaf(x, y, (150+k*30)*dpr, (y? -1:1)*(.3+k*.32)*d + (d<0?Math.PI:0) + sw*(k%2?1:-1), c); });
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: a river-boat safari ---- */
  intro(done){
    const T = THREE;
    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp"><span data-i="0">🍌</span><span data-i="1">🍌</span><span data-i="2">🍌</span><span data-i="3">🦜</span><span data-i="4">🐘</span><span data-i="5">🐊</span><span data-i="6">🦁</span></div>
      <div class="ov" id="ov"><h1>JUNGLE</h1><div class="sub">All aboard for a river safari!</div>
        <button class="launch" id="launch" style="background:linear-gradient(135deg,#22c55e,#15803d)">🛶 All aboard!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
    const showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };
    const lightDot = i=>{ const d = pp.querySelector(`[data-i="${i}"]`); if(d) d.classList.add('on'); };
    function roar(){ if(!settings.sfx) return; const a = audio(); if(!a) return; const len = a.sampleRate*1.3, b = a.createBuffer(1,len,a.sampleRate), d = b.getChannelData(0);
      for(let i=0;i<len;i++){ const e = Math.min(1,i/(a.sampleRate*.15))*Math.pow(1-i/len,1.5); d[i] = (Math.random()*2-1)*e; }
      const s = a.createBufferSource(); s.buffer = b; const f = a.createBiquadFilter(); f.type='lowpass'; f.frequency.value = 320; const g = a.createGain(); g.gain.value = .7;
      s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }
    function squawk(){ if(!settings.sfx) return; [0,.18].forEach(d=>{ tone(1800,d,.08,'square',.04); tone(1300,d+.05,.08,'square',.04); }); }
    function trumpet(){ if(!settings.sfx) return; const a = audio(); if(!a) return; const o = a.createOscillator(), g = a.createGain(); o.type='sawtooth';
      const t = a.currentTime; o.frequency.setValueAtTime(300,t); o.frequency.linearRampToValueAtTime(620,t+.25); o.frequency.linearRampToValueAtTime(520,t+.9);
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.06,t+.1); g.gain.linearRampToValueAtTime(0,t+1); o.connect(g); g.connect(a.destination); o.start(t); o.stop(t+1.05); }
    function snap(){ if(!settings.sfx) return; tone(180,0,.06,'square',.12); tone(140,.05,.06,'square',.1); }

    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0xbfeccb); scene.fog = new T.Fog(0xa8dcb4, 22, 62);
    const cam = new T.PerspectiveCamera(55, innerWidth/innerHeight, .1, 200);
    scene.add(new T.HemisphereLight(0xf2fff0, 0x2d5a1e, .9));
    const sun = new T.DirectionalLight(0xfff3cc, .8); sun.position.set(6, 14, 4); scene.add(sun);
    const canvasTex = (w, h, draw)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
    const L = c => new T.MeshLambertMaterial({color:c});

    /* ---- River and banks ---- */
    const river = new T.CatmullRomCurve3([[0,8],[0,-4],[4.5,-15],[3,-27],[-4.5,-37],[-6,-49],[0,-60],[5,-70]].map(([x,z])=>new T.Vector3(x,0,z)));
    const riverPts = river.getSpacedPoints(220);
    const distToRiver = (x,z)=>{ let m = 1e9; for(const p of riverPts){ const d = (p.x-x)**2+(p.z-z)**2; if(d<m) m = d; } return Math.sqrt(m); };
    const groundTex = canvasTex(512,512,(x,w,h)=>{ x.fillStyle='#3f8f3a'; x.fillRect(0,0,w,h);
      for(let i=0;i<4000;i++){ x.fillStyle = pick(['#357f32','#4aa045','#2f7030','#56ad4c']); x.fillRect(Math.random()*w, Math.random()*h, 3, 6); } });
    groundTex.wrapS = groundTex.wrapT = T.RepeatWrapping; groundTex.repeat.set(8,10);
    const ground = new T.Mesh(new T.PlaneGeometry(90,110), new T.MeshLambertMaterial({map:groundTex})); ground.rotation.x = -Math.PI/2; ground.position.set(0,0,-30); scene.add(ground);
    const waterTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#2b7f9e'; x.fillRect(0,0,w,h);
      for(let i=0;i<120;i++){ x.strokeStyle = pick(['rgba(255,255,255,.25)','rgba(110,190,210,.5)']); x.lineWidth = 2; const cx = Math.random()*w, cy = Math.random()*h;
        x.beginPath(); x.moveTo(cx,cy); x.quadraticCurveTo(cx+10,cy-4,cx+20,cy); x.stroke(); } });
    waterTex.wrapS = waterTex.wrapT = T.RepeatWrapping;
    const waterMat = new T.MeshLambertMaterial({map:waterTex});
    for(let i=0;i<riverPts.length-1;i++){ const a = riverPts[i], b = riverPts[i+1], m = a.clone().add(b).multiplyScalar(.5), len = a.distanceTo(b);
      const seg = new T.Mesh(new T.PlaneGeometry(8, len+.1), waterMat); seg.rotation.x = -Math.PI/2; seg.rotation.z = -Math.atan2(b.x-a.x, -(b.z-a.z));
      seg.position.set(m.x,.03,m.z); scene.add(seg);
      if(i%3===0){ [-1,1].forEach(sd=>{ const nx = (b.z-a.z)/len, nz = -(b.x-a.x)/len;
        const bank = new T.Mesh(new T.SphereGeometry(.9,8,6), L(0x7a5a33)); bank.scale.set(1,.35,1.4); bank.position.set(m.x+nx*sd*4.1, .05, m.z+nz*sd*4.1); scene.add(bank); }); } }

    /* ---- Trees: round-top jungle trees and palms, kept off the river ---- */
    const trunkM = L(0x6b4423), leafA = L(0x2e8b3a), leafB = L(0x3fae4a), leafC = L(0x1f6f2c);
    function roundTree(x,z,s){ const g = new T.Group(); g.position.set(x,0,z); scene.add(g);
      const tr = new T.Mesh(new T.CylinderGeometry(.25*s,.4*s,4*s,8), trunkM); tr.position.y = 2*s; g.add(tr);
      [[0,4.4,0,1.8],[1,4,.5,1.3],[-1,4.1,-.3,1.4],[.2,5.2,-.4,1.2]].forEach(([dx,y,dz,r],i)=>{ const f = new T.Mesh(new T.SphereGeometry(r*s,12,9), [leafA,leafB,leafC][i%3]);
        f.position.set(dx*s,y*s,dz*s); g.add(f); }); return g; }
    function palm(x,z,s){ const g = new T.Group(); g.position.set(x,0,z); scene.add(g); let px = 0, py = 0;
      for(let i=0;i<6;i++){ const seg = new T.Mesh(new T.CylinderGeometry(.18*s,.22*s,1*s,8), trunkM); px += .08*s*i*.3; py += .95*s; seg.position.set(px,py-.4*s,0); seg.rotation.z = -.05*i; g.add(seg); }
      for(let i=0;i<7;i++){ const lf = new T.Mesh(new T.SphereGeometry(1,10,6), i%2?leafA:leafB); lf.scale.set(1.7*s,.08*s,.45*s);
        const a = i*Math.PI*2/7; lf.position.set(px+Math.cos(a)*1.5*s, py+.1*s - .25*s, Math.sin(a)*1.5*s); lf.rotation.y = -a; lf.rotation.z = -.35; g.add(lf); } return g; }
    let placed = 0, tries = 0;
    while(placed < 75 && tries < 2000){ tries++; const x = -34 + Math.random()*68, z = -78 + Math.random()*92;
      if(distToRiver(x,z) < 6.2) continue;
      if([[-4.5,4.5],[-6.2,-12],[10.5,-21],[-12,-52],[0,12]].some(([ax,az])=>Math.hypot(ax-x,az-z) < 5)) continue;   /* keep clear of the animals */ (Math.random()<.4 ? palm : roundTree)(x, z, .8+Math.random()*.6); placed++; }
    // ferns and flowers on the banks
    for(let i=0;i<90;i++){ const p = riverPts[Math.floor(Math.random()*riverPts.length)], sd = Math.random()<.5?-1:1;
      const x = p.x + sd*(4.8+Math.random()*1.5), z = p.z + (Math.random()-.5)*2;
      const f = new T.Mesh(new T.SphereGeometry(.45,8,6), pick([leafA,leafB,leafC])); f.scale.set(1,.5,1); f.position.set(x,.2,z); scene.add(f);
      if(Math.random()<.3){ const fl = new T.Mesh(new T.SphereGeometry(.13,8,6), L(pick([0xff4fa3,0xffd23f,0xff7a3d,0xffffff]))); fl.position.set(x,.5,z); scene.add(fl); } }

    /* ---- Boat ---- */
    const boat = new T.Group(); scene.add(boat);
    const hull = new T.Mesh(new T.BoxGeometry(1.5,.55,3.6), L(0x9c6a3a)); hull.position.y = .25; boat.add(hull);
    [[-1],[1]].forEach(([d])=>{ const tip = new T.Mesh(new T.ConeGeometry(.78,1.1,4), L(0x9c6a3a)); tip.rotation.x = d*Math.PI/2; tip.rotation.y = Math.PI/4; tip.scale.set(1,1,.5); tip.position.set(0,.25,-d*2.3); boat.add(tip); });
    const inside = new T.Mesh(new T.BoxGeometry(1.2,.1,3.3), L(0x6b4423)); inside.position.y = .45; boat.add(inside);
    [-0.9,.9].forEach(z=>{ const seat = new T.Mesh(new T.BoxGeometry(1.4,.08,.35), L(0xd9b380)); seat.position.set(0,.55,z); boat.add(seat); });
    const flag = new T.Mesh(new T.PlaneGeometry(.6,.4), new T.MeshLambertMaterial({color:0xe3262f, side:T.DoubleSide})); flag.position.set(.3,1.7,1.7); boat.add(flag);
    const pole = new T.Mesh(new T.CylinderGeometry(.03,.03,1.4,6), L(0x3a2a1a)); pole.position.set(0,1.2,1.7); boat.add(pole);
    // bananas that will land in the boat
    function banana(){ const b = new T.Mesh(new T.TorusGeometry(.28,.07,8,16,Math.PI*.8), L(0xffd23f)); scene.add(b); return b; }
    const bananas = [banana(), banana(), banana()];
    const BOAT_SPOTS = [[-.35,.62,-.3],[0,.62,.2],[.35,.62,-.1]];

    /* ---- Animals: cartoon (toon) shading, rounded shapes, big friendly eyes ---- */
    const grad = new T.DataTexture(new Uint8Array([70, 140, 215]), 3, 1, T.LuminanceFormat);
    grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
    const toon = c => new T.MeshToonMaterial({color:c, gradientMap:grad});
    const toonDS = c => new T.MeshToonMaterial({color:c, gradientMap:grad, side:T.DoubleSide});
    const BLACK = new T.MeshBasicMaterial({color:0x111111}), WHITE = toon(0xffffff), SHINE = new T.MeshBasicMaterial({color:0xffffff});
    const SPH = new T.SphereGeometry(1, 24, 18);
    function blob(parent, mat, sx, sy, sz, x, y, z){ const m = new T.Mesh(SPH, mat); m.scale.set(sx,sy,sz); m.position.set(x,y,z); parent.add(m); return m; }
    function limb(parent, mat, r1, r2, len, x, y, z, rx=0, rz=0){ const g = new T.Group(); g.position.set(x,y,z); g.rotation.set(rx,0,rz); parent.add(g);
      const c = new T.Mesh(new T.CylinderGeometry(r1, r2, len, 18), mat); c.position.y = -len/2; g.add(c);
      blob(g, mat, r2, r2, r2, 0, -len, 0); blob(g, mat, r1, r1, r1, 0, 0, 0); return g; }
    // big cartoon eye looking forward (+z): white, coloured iris, pupil, two sparkles
    function cEye(parent, x, y, z, r, iris){ const g = new T.Group(); g.position.set(x,y,z); parent.add(g);
      blob(g, WHITE, r, r, r*.8, 0, 0, 0);
      blob(g, toon(iris), r*.62, r*.62, r*.3, 0, -r*.05, r*.62);
      blob(g, BLACK, r*.36, r*.36, r*.2, 0, -r*.05, r*.78);
      blob(g, SHINE, r*.14, r*.14, r*.08, r*.22, r*.2, r*.86);
      blob(g, SHINE, r*.07, r*.07, r*.05, -r*.15, -r*.22, r*.86); return g; }

    // ---------- Monkey hanging from a branch over the river ----------
    const MBROWN = toon(0x8a4f2a), MFACE = toon(0xf2cfa0), MDARK = toon(0x5e3218);
    const branchTree = roundTree(-4.5, 4.5, 1.1);
    const branch = new T.Mesh(new T.CylinderGeometry(.12,.16,5,8), trunkM); branch.rotation.z = Math.PI/2 - .1; branch.position.set(-2.2,4.7,4.5); scene.add(branch);
    const monkey = new T.Group(); monkey.position.set(-.3,4.6,4.5); scene.add(monkey);
    const mSwing = new T.Group(); monkey.add(mSwing);
    limb(mSwing, MBROWN, .085, .075, .85, 0, 0, 0, Math.PI, 0);          // arm up to the branch
    blob(mSwing, MBROWN, .1, .1, .1, 0, .02, 0);                          // hand on the branch
    blob(mSwing, MBROWN, .4, .5, .36, 0, -1.25, 0);                      // body
    blob(mSwing, MFACE, .27, .36, .2, 0, -1.3, .2);                      // tummy
    const mHead = new T.Group(); mHead.position.set(0,-.55,.05); mSwing.add(mHead);
    blob(mHead, MBROWN, .36, .33, .33, 0, 0, 0);
    blob(mHead, MFACE, .16, .17, .12, -.1, .06, .22); blob(mHead, MFACE, .16, .17, .12, .1, .06, .22);   // heart-shaped face
    blob(mHead, MFACE, .2, .14, .14, 0, -.1, .24);                                                   // muzzle
    [-1,1].forEach(s=>{ blob(mHead, MBROWN, .14, .14, .07, s*.36, .06, 0); blob(mHead, MFACE, .09, .09, .05, s*.37, .06, .03); });
    cEye(mHead, -.1, .08, .3, .065, 0x4a2a12); cEye(mHead, .1, .08, .3, .065, 0x4a2a12);
    blob(mHead, MDARK, .025, .02, .02, -.035, -.06, .37); blob(mHead, MDARK, .025, .02, .02, .035, -.06, .37);   // nostrils
    const mSmile = new T.Mesh(new T.TorusGeometry(.08,.016,8,16,Math.PI), BLACK); mSmile.rotation.z = Math.PI; mSmile.position.set(0,-.13,.36); mHead.add(mSmile);
    const mArm2 = limb(mSwing, MBROWN, .08, .07, .65, .32, -.95, .08, 0, -2.2);   // waving arm (bananas come from here)
    limb(mSwing, MBROWN, .09, .08, .6, -.18, -1.65, .05, 0, .35); limb(mSwing, MBROWN, .09, .08, .6, .18, -1.65, .05, 0, -.35);
    const tailCurve = new T.CatmullRomCurve3([[0,-1.5,-.3],[0,-1.9,-.6],[.15,-2.4,-.5],[.35,-2.55,-.15],[.25,-2.3,.0]].map(p=>new T.Vector3(...p)));
    mSwing.add(new T.Mesh(new T.TubeGeometry(tailCurve, 30, .045, 8), MBROWN));

    // ---------- Scarlet macaw on a branch ----------
    const parrotTree = roundTree(-6.2,-12,1); const pBranch = new T.Mesh(new T.CylinderGeometry(.08,.1,3,8), trunkM); pBranch.rotation.z = Math.PI/2; pBranch.position.set(-4.4,3.4,-12); scene.add(pBranch);
    const parrot = new T.Group(); parrot.position.set(-3.6,3.5,-12); parrot.rotation.y = .9; parrot.scale.setScalar(1.35); scene.add(parrot);
    const PRED = toon(0xe0262f), PYEL = toon(0xffcf2e), PBLUE = toon(0x1f63d6), PGREEN = toon(0x2fae5a), IVORY = toon(0xf3ead6), PDARK = toon(0x2b2b2b);
    blob(parrot, PRED, .24, .38, .24, 0, .42, 0);                       // body
    blob(parrot, PRED, .2, .2, .2, 0, .86, .04);                        // head
    [-1,1].forEach(s=>blob(parrot, IVORY, .03, .11, .1, s*.17, .85, .1));   // white face patches
    cEye(parrot, -.15, .9, .12, .045, 0xf2d24a); cEye(parrot, .15, .9, .12, .045, 0xf2d24a);
    parrot.children.slice(-2).forEach((e,i)=>e.rotation.y = (i?1:-1)*.9);    // eyes on the sides of the head
    blob(parrot, IVORY, .08, .09, .1, 0, .84, .22);                     // upper beak
    const hook = new T.Mesh(new T.ConeGeometry(.05,.17,12), IVORY); hook.position.set(0,.74,.29); hook.rotation.x = Math.PI - .4; parrot.add(hook);
    blob(parrot, PDARK, .055, .045, .06, 0, .77, .2);                   // lower beak
    const wings = [-1,1].map(s=>{ const pv = new T.Group(); pv.position.set(s*.22,.6,-.02); parrot.add(pv);
      blob(pv, PRED, .06, .22, .17, s*.03, -.12, 0);
      blob(pv, PYEL, .055, .16, .15, s*.04, -.28, -.02);
      blob(pv, PGREEN, .05, .1, .12, s*.045, -.36, -.03);
      blob(pv, PBLUE, .05, .3, .13, s*.05, -.55, -.05); return pv; });
    [[0,PRED,.62],[-.05,PBLUE,.5],[.05,PBLUE,.5]].forEach(([x,m,l])=>{ const f = blob(parrot, m, .05, l, .08, x, -.15, -.26); f.rotation.x = .45; });
    [-1,1].forEach(s=>blob(parrot, PDARK, .05, .04, .07, s*.07, .05, .07));   // feet gripping the branch

    // ---------- Elephant on the bank ----------
    const EGREY = toon(0x8a93a8), EPINK = toonDS(0xf0a8b8), EDARK = toon(0x7d8597), TUSK = toon(0xfaf6ea);
    const elephant = new T.Group(); elephant.position.set(10.5,0,-21); elephant.rotation.y = -1.9; scene.add(elephant);
    blob(elephant, EGREY, 1.45, 1.3, 1.95, 0, 2.3, 0);                 // body
    [[-.75,1.1],[.75,1.1],[-.75,-1.1],[.75,-1.1]].forEach(([x,z])=>{ const lg = new T.Mesh(new T.CylinderGeometry(.46,.42,1.6,20), EGREY); lg.position.set(x,.8,z); elephant.add(lg);
      blob(elephant, EGREY, .44, .16, .44, x, .1, z); [-.18,0,.18].forEach(dx=>blob(elephant, TUSK, .08, .07, .05, x+dx, .12, z+.4)); });   // feet + toenails
    const eHead = new T.Group(); eHead.position.set(0,3.05,1.75); elephant.add(eHead);
    blob(eHead, EGREY, .95, .9, .9, 0, 0, 0);                         // head
    blob(eHead, EGREY, .6, .5, .5, 0, .35, .3);                       // forehead dome
    cEye(eHead, -.42, .18, .72, .14, 0x3a2a1a); cEye(eHead, .42, .18, .72, .14, 0x3a2a1a);
    const ears = [-1,1].map(s=>{ const pv = new T.Group(); pv.position.set(s*.78,.1,-.15); eHead.add(pv);
      const eg = new T.CircleGeometry(1, 40); const ep = eg.attributes.position;
      for(let i=0;i<ep.count;i++){ const x = ep.getX(i), y = ep.getY(i); ep.setZ(i, -.25*(x*x) - .1*(y*y)); ep.setY(i, y*1.15); }   // cupped, slightly tall
      eg.computeVertexNormals();
      const outer = new T.Mesh(eg, toonDS(0x8a93a8)); outer.position.x = s*.75; outer.rotation.y = s*1.15; pv.add(outer);
      const inner = new T.Mesh(eg, EPINK); inner.scale.setScalar(.72); inner.position.set(s*.72,-.02,.06*s); inner.rotation.y = s*1.15; pv.add(inner);
      return pv; });
    const trunk = []; let tParent = eHead;
    for(let i=0;i<8;i++){ const pv = new T.Group(); pv.position.set(0, i===0?-.3:-.3, i===0?.78:0); tParent.add(pv);
      const r = .3 - i*.021; const seg = new T.Mesh(new T.CylinderGeometry(r - .02, r, .32, 18), EGREY); seg.position.y = -.15; pv.add(seg);
      blob(pv, EGREY, r, r, r, 0, 0, 0);
      if(i%2===0) { const ring = new T.Mesh(new T.TorusGeometry(r*.98, .012, 6, 24), EDARK); ring.rotation.x = Math.PI/2; ring.position.y = -.15; pv.add(ring); }
      trunk.push(pv); tParent = pv; }
    blob(trunk[7], EDARK, .13, .06, .13, 0, -.32, 0);                 // trunk tip
    [-1,1].forEach(s=>{ const tk = new T.Mesh(new T.ConeGeometry(.09,.75,14), TUSK); tk.position.set(s*.32,-.55,.72); tk.rotation.set(2.25,0,s*.15); eHead.add(tk); });
    blob(eHead, toon(0x6b4f5a), .16, .08, .1, 0, -.6, .6);           // mouth
    const eTail = limb(elephant, EGREY, .05, .04, .9, 0, 2.3, -1.9, .5, 0); blob(eTail, EDARK, .09, .14, .09, 0, -.95, 0);
    const spray = Array.from({length:30}, ()=>{ const d = new T.Mesh(new T.SphereGeometry(.07,6,5), new T.MeshLambertMaterial({color:0x9fdcff, transparent:true, opacity:.85})); d.visible = false; scene.add(d); return d; });

    // ---------- Crocodile lurking in the water ----------
    const CG = toon(0x5d8f3c), CGD = toon(0x40702a), CBELLY = toon(0xb9cf7a);
    const croc = new T.Group(); croc.position.set(-1.5,-.08,-40.5); croc.rotation.y = .55; croc.scale.setScalar(1.45); scene.add(croc);
    [[.72,.36,.9,.6],[.66,.33,.8,-.6],[.52,.28,.75,-1.6],[.38,.22,.75,-2.5],[.25,.15,.7,-3.3],[.14,.1,.6,-4]].forEach(([sx,sy,sz,z])=>blob(croc, CG, sx, sy, sz, 0, .15, z));
    for(let i=0;i<12;i++){ const z = .9 - i*.42, w = Math.max(.08, .5 - i*.04);
      [-1,1].forEach(s=>{ const sc = new T.Mesh(new T.ConeGeometry(.08,.18,5), CGD); sc.position.set(s*w*.45, .45 - i*.025, z); croc.add(sc); }); }
    [[-1,.6],[1,.6],[-1,-.9],[1,-.9]].forEach(([s,z])=>{ const lg = blob(croc, CG, .14, .1, .3, s*.72, .05, z); lg.rotation.y = s*.6; });
    const jawTop = new T.Group(); jawTop.position.set(0,.26,1.25); croc.add(jawTop);
    blob(jawTop, CG, .5, .26, .5, 0, .02, .05);                       // head
    blob(jawTop, CG, .36, .15, 1.05, 0, 0, .95);                      // long snout
    [-1,1].forEach(s=>{ blob(jawTop, CG, .17, .15, .17, s*.24, .22, .05); cEye(jawTop, s*.24, .3, .12, .1, 0xf2c230);
      blob(jawTop, CGD, .04, .03, .04, s*.07, .14, 1.9); });           // eye bumps, eyes, nostrils
    jawTop.children.filter(c=>c.type==='Group').forEach(e=>e.rotation.x = -.35);
    const jawBot = new T.Group(); jawBot.position.set(0,.16,1.25); croc.add(jawBot);
    blob(jawBot, CBELLY, .33, .1, 1.0, 0, 0, .95);
    for(let i=0;i<7;i++) [-1,1].forEach(s=>{ const w = .32 - i*.012;
      const th = new T.Mesh(new T.ConeGeometry(.045,.14,6), WHITE); th.position.set(s*w,-.12,.35+i*.24); th.rotation.x = Math.PI; jawTop.add(th);
      const tb = new T.Mesh(new T.ConeGeometry(.04,.12,6), WHITE); tb.position.set(s*(w-.03),.1,.47+i*.24); jawBot.add(tb); });

    // ---------- Lion resting on a rock ----------
    const LGOLD = toon(0xe8b154), LCREAM = toon(0xfbe3b0), LMANE1 = toon(0xb4561d), LMANE2 = toon(0xd9782e), LDARK = toon(0x4a2418);
    const rock = new T.Mesh(new T.SphereGeometry(2,20,14), toon(0x9aa0a8)); rock.scale.set(1.5,.6,1.3); rock.position.set(-12,0,-52); scene.add(rock);
    const lion = new T.Group(); lion.position.set(-12,1.1,-52); lion.rotation.y = 1.45; lion.scale.setScalar(1.3); scene.add(lion);
    blob(lion, LGOLD, .72, .58, 1.35, 0, .55, 0);                      // body
    [-1,1].forEach(s=>{ blob(lion, LGOLD, .38, .4, .55, s*.48, .45, -.75);                       // haunches
      const fl = blob(lion, LGOLD, .17, .15, .55, s*.32, .2, 1.1); blob(lion, LCREAM, .2, .12, .24, s*.32, .13, 1.62); });   // front legs + paws
    const lHead = new T.Group(); lHead.position.set(0,1.15,1.45); lion.add(lHead);
    blob(lHead, LMANE1, .78, .78, .45, 0, 0, -.18);                   // back of the mane
    for(let ring=0; ring<2; ring++) for(let i=0;i<22;i++){ const a = i/22*Math.PI*2 + ring*.14, rr = ring ? .5 : .66;
      const tuft = new T.Mesh(new T.ConeGeometry(.2 - ring*.04, .55 - ring*.12, 10), (i+ring)%2 ? LMANE1 : LMANE2);
      tuft.position.set(Math.cos(a)*rr, Math.sin(a)*rr, -.05 + ring*.06); tuft.rotation.z = a - Math.PI/2; lHead.add(tuft); }
    blob(lHead, LGOLD, .48, .46, .42, 0, 0, .12);                     // face
    blob(lHead, LCREAM, .17, .14, .14, -.11, -.17, .45); blob(lHead, LCREAM, .17, .14, .14, .11, -.17, .45);   // muzzle
    blob(lHead, LCREAM, .13, .09, .1, 0, -.3, .4);                    // chin
    blob(lHead, LDARK, .1, .07, .07, 0, -.06, .55);                   // nose
    const lMouth = blob(lHead, toon(0x7a1f1f), .13, .1, .06, 0, -.27, .45);
    cEye(lHead, -.17, .1, .43, .085, 0xc07a1e); cEye(lHead, .17, .1, .43, .085, 0xc07a1e);
    [-1,1].forEach(s=>{ blob(lHead, LGOLD, .13, .13, .07, s*.36, .38, .05); blob(lHead, LDARK, .07, .07, .04, s*.36, .38, .1); });
    const lTail = new T.Group(); lTail.position.set(0,.6,-1.3); lion.add(lTail);
    const ltCurve = new T.CatmullRomCurve3([[0,0,0],[0,-.1,-.5],[.25,0,-.95],[.55,.25,-1.15]].map(p=>new T.Vector3(...p)));
    lTail.add(new T.Mesh(new T.TubeGeometry(ltCurve, 24, .05, 8), LGOLD)); blob(lTail, LMANE1, .13, .16, .13, .58, .3, -1.18);

    const STOPS = [
      {obj:parrot,   name:'Parrot',    fact:'Parrots have bright, colourful feathers.', dot:3, look:new T.Vector3(-3.6,4.4,-12), sound:squawk, D:3.4, H:.5},
      {obj:elephant, name:'Elephant',  fact:'An elephant uses its long trunk like a hand.', dot:4, look:new T.Vector3(10,2.8,-21), sound:trumpet, D:8.5, H:.6},
      {obj:croc,     name:'Crocodile', fact:'A crocodile has lots of sharp teeth. Snap!', dot:5, look:new T.Vector3(-.6,.6,-37.6), sound:snap, D:6, H:1.8},
      {obj:lion,     name:'Lion',      fact:'A lion has a big furry mane and a very loud ROAR!', dot:6, look:new T.Vector3(-12,2.6,-52), sound:roar, D:6.8, H:.9}
    ];
    STOPS.forEach(s=>s.said = false);

    /* ---- animation ---- */
    let phase = 'idle', t = 0, phaseT = 0, raf = 0, ended = false, last = performance.now();
    let dropped = 0, dropT = 0, riverU = 0, speed = 0, focus = null, focusT = 0;
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const tmp = new T.Vector3(), camLook = new T.Vector3(0,2,0);
    const placeBoat = u=>{ const p = river.getPointAt(u), tan = river.getTangentAt(u); boat.position.set(p.x, Math.sin(t*1.6)*.05, p.z); boat.rotation.y = Math.atan2(-tan.x, -tan.z); boat.rotation.z = Math.sin(t*1.3)*.03; return {p, tan}; };
    // bananas start in the monkey's hand
    bananas.forEach(b=>{ b.visible = false; });

    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67)*(window.INTRO_SPEED||1); last = now; t += k/60; phaseT += k/60;
      waterTex.offset.y += .0025*k;
      mSwing.rotation.z = Math.sin(t*1.8)*.35;
      wings.forEach((w,i)=>w.rotation.z = (i?-1:1)*(focus && focus.obj===parrot ? .4+Math.abs(Math.sin(t*14))*.9 : .05));
      ears.forEach((e,i)=>e.rotation.y = (i?-1:1)*Math.sin(t*2)*.25);
      trunk.forEach((s,i)=>s.rotation.x = (focus && focus.obj===elephant) ? -.32 - Math.sin(t*3)*.05 : Math.sin(t*1.5+i*.4)*.12 + .05);
      jawTop.rotation.x = (focus && focus.obj===croc) ? -Math.abs(Math.sin(t*3))*.6 : -.05;
      lHead.rotation.x = (focus && focus.obj===lion && focusT < 1.6) ? -.35 : Math.sin(t*.8)*.05; lMouth.scale.y = (focus && focus.obj===lion && focusT < 1.6) ? .22 : .06;
      lTail.rotation.y = Math.sin(t*2)*.5;
      if(focus && focus.obj===elephant && Math.random()<.5){ const d = spray.find(x=>!x.visible); if(d){ trunk[7].updateMatrixWorld(true); trunk[7].getWorldPosition(d.position); d.visible = true;
        d.userData.v = new T.Vector3((Math.random()-.5)*.05, .14+Math.random()*.05, (Math.random()-.5)*.05); } }
      spray.forEach(d=>{ if(d.visible){ d.position.add(d.userData.v); d.userData.v.y -= .008*k; if(d.position.y < 0) d.visible = false; } });

      if(phase==='idle'){
        placeBoat(0);
        cam.position.lerp(tmp.set(4.5 + Math.sin(t*.3)*1.5, 3.4, 14), .04*k); camLook.lerp(tmp.set(-.5, 2.4, 3), .05*k); cam.lookAt(camLook);
      }
      else if(phase==='bananas'){
        placeBoat(0);
        cam.position.lerp(tmp.set(3.2, 3.2, 11), .04*k); camLook.lerp(tmp.set(-.2, 2.6, 4.5), .05*k); cam.lookAt(camLook);
        dropT += k/60;
        if(dropped < 3 && dropT > 1.0){
          const b = bananas[dropped]; b.visible = true; mSwing.updateMatrixWorld(true); mArm2.getWorldPosition(b.position);
          b.userData = {from:b.position.clone(), to:new T.Vector3(...BOAT_SPOTS[dropped]).add(boat.position), t:0, i:dropped};
          dropped++; dropT = 0;
        }
        bananas.forEach(b=>{ if(b.visible && b.userData.from){ const u = b.userData; u.t = Math.min(1, u.t + k/60/.8);
          b.position.lerpVectors(u.from, u.to, u.t); b.position.y += Math.sin(u.t*Math.PI)*.6; b.rotation.z += .2*k*(1-u.t);
          if(u.t>=1 && !u.landed){ u.landed = true; b.rotation.set(Math.PI/2, 0, u.i); const n = ['One!','Two!','Three!'][u.i];
            showCap(n, ['One banana in the boat!','Two bananas!','Three bananas — let’s go!'][u.i]); speak(n, 1); tone(880,0,.1,'triangle',.08); lightDot(u.i); } } });
        if(dropped===3 && bananas[2].userData.landed && dropT > 1.6){ phase = 'river'; phaseT = 0;
          showCap('Off we go!', 'Look out for jungle animals!'); speak("Off we go! Let's look for jungle animals!", 1); }
      }
      else if(phase==='river'){
        let near = null, nd = 1e9;
        STOPS.forEach(s=>{ const d = Math.hypot(s.obj.position.x-boat.position.x, s.obj.position.z-boat.position.z); if(d<nd){ nd = d; near = s; } });
        const target = nd < 10 ? (focus && focusT < 5 ? .03 : .05) : .23;
        speed += (target-speed)*.04*k; riverU = Math.min(1, riverU + speed*k/river.getLength());
        const {p, tan} = placeBoat(riverU);
        bananas.forEach((b,i)=>{ b.position.copy(new T.Vector3(...BOAT_SPOTS[i]).applyAxisAngle(new T.Vector3(0,1,0), boat.rotation.y).add(boat.position)); });
        if(near && nd < 10.5 && !near.said){ near.said = true; focus = near; focusT = 0;
          { const dx = boat.position.x - near.look.x, dz = boat.position.z - near.look.z, l = Math.hypot(dx,dz)||1;
            near.camPos = new T.Vector3(near.look.x + dx/l*near.D, near.look.y + near.H, near.look.z + dz/l*near.D); } showCap(near.name, near.fact); speak(near.fact, .95); near.sound(); lightDot(near.dot); }
        if(focus){ focusT += k/60; if(Math.hypot(focus.obj.position.x-boat.position.x, focus.obj.position.z-boat.position.z) > 13) focus = null; }
        const back = tmp.set(tan.x, 0, tan.z).normalize();
        const closeUp = focus && focusT < 5;          // swoop in for a close look at the animal, then back to the boat
        if(closeUp){ cam.position.lerp(focus.camPos, .03*k); camLook.lerp(focus.look, .05*k); }
        else { cam.position.lerp(new T.Vector3(p.x - back.x*8.5 + back.z*2.5, 4.2, p.z - back.z*8.5 - back.x*2.5), .03*k);
          camLook.lerp(new T.Vector3(p.x + back.x*6, 1.5, p.z + back.z*6), .05*k); }
        cam.lookAt(camLook);
        if(riverU >= 1){ phase = 'finale'; phaseT = 0; showCap('Your turn!', "Let's play jungle maths!"); speak("What an adventure! Your turn! Let's play!", 1); }
      }
      else if(phase==='finale'){
        cam.position.lerp(tmp.set(9, 7, -76), .02*k); camLook.lerp(tmp.set(-4, 1, -48), .03*k); cam.lookAt(camLook);
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
      phase = 'bananas'; phaseT = 0; dropT = 0;
      showCap('Ooh ooh! Hello!', 'Count the bananas I drop!'); speak("Ooh ooh! Hello! I'm a monkey. Count the bananas I drop in your boat!", 1);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    requestAnimationFrame(frame);
    speak('Welcome to the jungle! Tap all aboard!');
  }
};
