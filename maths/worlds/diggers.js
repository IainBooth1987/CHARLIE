/* World pack: Building Site — objects, look, background and 3D intro, shared by every maths skill */
window.WORLD = {
  id:'diggers', hide:"in the site hut", box:"the skip", name:'Building Site', icon:'🏗️', mascot:'👷', rewardIcon:'🏗️', dotColour:'#2a2418',
  items:[['🚜','tractors','tractor'],['🚚','trucks','truck'],['🧱','bricks','brick']],
  games:{flash:'Quick Look Dig', flashIcon:'🚜', match:'Same or Different?', matchIcon:'🚧', make:'Load the Truck', makeIcon:'🚚'},
  menuLine:'Hard hats on! Pick a game!',
  cheer:['Brick-tastic!','Top building!','Beep beep, brilliant!','Dig it!'],
  action:'Beep like a truck {n} times!',

  /* ---- Animated 2D background: blueprint grid, hazard band, a little truck driving past ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, truck = null, t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const loop = (now)=>{
      requestAnimationFrame(loop); if(document.hidden) return;
      const t = (now-t0)/1000; ctx.clearRect(0,0,w,h);
      ctx.strokeStyle = 'rgba(30,80,160,.07)'; ctx.lineWidth = 1*dpr; const g = 40*dpr;
      for(let x=0;x<w;x+=g){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke(); }
      for(let y=0;y<h;y+=g){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      // hazard band
      const bh = 26*dpr, y0 = h - bh; ctx.save(); ctx.beginPath(); ctx.rect(0,y0,w,bh); ctx.clip();
      ctx.fillStyle = '#ffcd00'; ctx.fillRect(0,y0,w,bh); ctx.fillStyle = '#1b1b1b';
      const off = (t*30*dpr) % (bh*2);
      for(let x=-bh*2; x<w+bh*2; x+=bh*2){ ctx.beginPath(); ctx.moveTo(x+off,y0+bh); ctx.lineTo(x+off+bh,y0); ctx.lineTo(x+off+bh*2,y0); ctx.lineTo(x+off+bh,y0+bh); ctx.fill(); }
      ctx.restore();
      // little truck
      if(!truck && document.body.dataset.mode!=='game' && Math.random()<.003) truck = {x:-140*dpr};
      if(truck){ truck.x += 3*dpr; const y = y0 - 8*dpr; ctx.save(); ctx.translate(truck.x, y); ctx.globalAlpha = .9;
        ctx.fillStyle = '#f59e0b'; ctx.fillRect(0,-46*dpr,70*dpr,30*dpr); ctx.fillStyle = '#e3262f'; ctx.fillRect(72*dpr,-40*dpr,34*dpr,24*dpr);
        ctx.fillStyle = '#9bd3ff'; ctx.fillRect(86*dpr,-36*dpr,16*dpr,10*dpr); ctx.fillStyle = '#7a4f2c'; ctx.beginPath(); ctx.arc(35*dpr,-46*dpr,26*dpr,Math.PI,0); ctx.fill();
        ctx.fillStyle = '#222'; [16,56,92].forEach(wx=>{ ctx.beginPath(); ctx.arc(wx*dpr,-12*dpr,10*dpr,0,7); ctx.fill(); }); ctx.restore();
        if(truck.x > w + 40*dpr) truck = null; }
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: the digger loads the truck three times, then the truck drives off ---- */
  intro(done){
    const T = THREE;
    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp"><span data-i="0">🪣</span><span data-i="1">🪣</span><span data-i="2">🪣</span><span data-i="3">🚚</span></div>
      <div class="ov" id="ov"><h1>BUILDING SITE</h1><div class="sub">The digger has a big job to do…</div>
        <button class="launch" id="launch" style="background:linear-gradient(135deg,#ffcd00,#f59e0b);color:#1b1b1b">🚧 Start the engines!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
    const showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };

    /* sounds: engine rumble, reversing beeps, dirt thud */
    let engine = null;
    function startEngine(){ if(!settings.sfx) return; const a = audio(); if(!a) return;
      const o = a.createOscillator(), lfo = a.createOscillator(), lg = a.createGain(), f = a.createBiquadFilter(), g = a.createGain();
      o.type = 'sawtooth'; o.frequency.value = 52; lfo.frequency.value = 9; lg.gain.value = 6; lfo.connect(lg); lg.connect(o.frequency);
      f.type = 'lowpass'; f.frequency.value = 260; o.connect(f); f.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(.06, a.currentTime+.6); o.start(); lfo.start(); engine = {o, lfo, g, a}; }
    function stopEngine(){ if(!engine) return; const {o,lfo,g,a} = engine; g.gain.linearRampToValueAtTime(0, a.currentTime+.4); o.stop(a.currentTime+.5); lfo.stop(a.currentTime+.5); engine = null; }
    function beeps(n){ if(!settings.sfx) return; for(let i=0;i<n;i++) tone(1050, i*.45, .22, 'square', .05); }
    function thud(){ if(!settings.sfx) return; const a = audio(); if(!a) return; const len = a.sampleRate*.5, b = a.createBuffer(1,len,a.sampleRate), d = b.getChannelData(0);
      for(let i=0;i<len;i++) d[i] = (Math.random()*2-1)*Math.pow(1-i/len, 3);
      const s = a.createBufferSource(); s.buffer = b; const f = a.createBiquadFilter(); f.type='lowpass'; f.frequency.value = 400; const g = a.createGain(); g.gain.value = .5;
      s.connect(f); f.connect(g); g.connect(a.destination); s.start(); }

    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0x9fd4ff); scene.fog = new T.Fog(0xcfe9ff, 30, 70);
    const cam = new T.PerspectiveCamera(50, innerWidth/innerHeight, .1, 200);
    scene.add(new T.HemisphereLight(0xfff7e6, 0x8a6a3a, .85));
    const sun = new T.DirectionalLight(0xffffff, .9); sun.position.set(8, 14, 6); scene.add(sun);
    const canvasTex = (w, h, draw)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
    const L = c => new T.MeshLambertMaterial({color:c});
    const YEL = L(0xffc400), DARK = L(0x2b2b2b), GREY = L(0x6b7280), DIRT = L(0x7a4f2c);

    /* ---- Site ---- */
    const groundTex = canvasTex(512,512,(x,w,h)=>{ x.fillStyle='#b98a55'; x.fillRect(0,0,w,h);
      for(let i=0;i<6000;i++){ x.fillStyle = pick(['#a87b47','#c79a63','#9c7040','#d2a874','#8f6a3f']); x.fillRect(Math.random()*w, Math.random()*h, 3, 3); }
      x.strokeStyle='rgba(80,55,30,.25)'; x.lineWidth=6; for(let i=0;i<18;i++){ x.beginPath(); x.moveTo(Math.random()*w,0); x.bezierCurveTo(Math.random()*w,h/3,Math.random()*w,h*2/3,Math.random()*w,h); x.stroke(); } });
    groundTex.wrapS = groundTex.wrapT = T.RepeatWrapping; groundTex.repeat.set(5,5);
    const ground = new T.Mesh(new T.PlaneGeometry(90,90), new T.MeshLambertMaterial({map:groundTex})); ground.rotation.x = -Math.PI/2; scene.add(ground);
    // the pit and spoil heap
    const pit = new T.Mesh(new T.CircleGeometry(1.9, 32), L(0x4a3018)); pit.rotation.x = -Math.PI/2; pit.position.set(0,.02,4.2); scene.add(pit);
    const heap = new T.Mesh(new T.SphereGeometry(1.4,20,12,0,Math.PI*2,0,Math.PI/2), DIRT); heap.scale.set(1,.55,1); heap.position.set(-2.8,0,4.4); scene.add(heap);
    // cones and barriers
    const coneMat = L(0xff6a00), white = L(0xffffff);
    [[-4,7],[-1.5,7.6],[1.5,7.6],[4,7],[6.5,5.5]].forEach(([x,z])=>{ const c = new T.Mesh(new T.ConeGeometry(.22,.7,16), coneMat); c.position.set(x,.35,z); scene.add(c);
      const s = new T.Mesh(new T.CylinderGeometry(.13,.16,.12,16), white); s.position.set(x,.4,z); scene.add(s);
      const b = new T.Mesh(new T.BoxGeometry(.5,.05,.5), DARK); b.position.set(x,.025,z); scene.add(b); });
    // site hut + sign
    const hut = new T.Mesh(new T.BoxGeometry(4,2.4,2.2), L(0x2f6fd0)); hut.position.set(-8,1.2,-3); scene.add(hut);
    const hw = new T.Mesh(new T.BoxGeometry(1.2,.7,.05), L(0xbfe6ff)); hw.position.set(-8.6,1.5,-1.88); scene.add(hw);
    const signTex = canvasTex(512,160,(x,w,h)=>{ x.fillStyle='#1b1b1b'; x.fillRect(0,0,w,h);
      for(let i=-h;i<w;i+=40){ x.fillStyle='#ffcd00'; x.beginPath(); x.moveTo(i,0); x.lineTo(i+20,0); x.lineTo(i+20+h,h); x.lineTo(i+h,h); x.fill(); }
      x.fillStyle='#fff'; x.fillRect(16,16,w-32,h-32); x.fillStyle='#1b1b1b'; x.font='bold 40px Fredoka, sans-serif'; x.textAlign='center';
      x.fillText("CHARLIE'S", w/2, 70); x.fillText('BUILDING SITE', w/2, 118); });
    const sign = new T.Mesh(new T.PlaneGeometry(3.2,1), new T.MeshBasicMaterial({map:signTex})); sign.position.set(-8,3,-1.85); scene.add(sign);
    // pile of giant toy bricks (brand colours)
    function toyBrick(c, x, y, z, ry){ const g = new T.Group(); const m = L(c);
      const b = new T.Mesh(new T.BoxGeometry(1.6,.6,.8), m); g.add(b);
      for(let i=0;i<4;i++) for(let j=0;j<2;j++){ const s = new T.Mesh(new T.CylinderGeometry(.13,.13,.14,16), m); s.position.set(-.6+i*.4, .37, -.2+j*.4); g.add(s); }
      g.position.set(x,y,z); g.rotation.y = ry; scene.add(g); return g; }
    toyBrick(0xe3262f,-5.2,.3,-5.6,.1); toyBrick(0x0b6fd6,-4,.3,-5.4,-.2); toyBrick(0xffcd00,-4.6,.9,-5.5,.05); toyBrick(0x16a34a,-6.2,.3,-4.6,.6);
    // tower crane swinging a brick
    const crane = new T.Group(); crane.position.set(7,0,-9); scene.add(crane);
    for(let i=0;i<12;i++){ const seg = new T.Mesh(new T.BoxGeometry(.6,1,.6), new T.MeshLambertMaterial({color:0xffc400, wireframe:true})); seg.position.y = .5+i; crane.add(seg); }
    const jibPv = new T.Group(); jibPv.position.y = 12.2; crane.add(jibPv);
    const jib = new T.Mesh(new T.BoxGeometry(11,.5,.5), YEL); jib.position.x = -3; jibPv.add(jib);
    const cw = new T.Mesh(new T.BoxGeometry(1.2,.9,.9), GREY); cw.position.x = 2.3; jibPv.add(cw);
    const cabC = new T.Mesh(new T.BoxGeometry(.9,.9,.9), L(0xffffff)); cabC.position.set(.6,-.6,0); jibPv.add(cabC);
    const rope = new T.Mesh(new T.CylinderGeometry(.02,.02,5,6), DARK); rope.position.set(-7,-2.5,0); jibPv.add(rope);
    const hookBrick = new T.Group(); hookBrick.position.set(-7,-5.3,0); jibPv.add(hookBrick);
    const hb = new T.Mesh(new T.BoxGeometry(1.4,.55,.7), L(0xe3262f)); hookBrick.add(hb);
    for(let i=0;i<4;i++) for(let j=0;j<2;j++){ const s = new T.Mesh(new T.CylinderGeometry(.11,.11,.12,12), L(0xe3262f)); s.position.set(-.52+i*.35,.33,-.17+j*.34); hookBrick.add(s); }

    /* ---- Digger (excavator) ---- */
    const dig = new T.Group(); scene.add(dig);
    [-1,1].forEach(s=>{ const tr = new T.Mesh(new T.BoxGeometry(.7,.7,3.2), DARK); tr.position.set(s*1.05,.35,0); dig.add(tr);
      for(let i=0;i<5;i++){ const r = new T.Mesh(new T.CylinderGeometry(.22,.22,.72,14), GREY); r.rotation.z = Math.PI/2; r.position.set(s*1.05,.32,-1.2+i*.6); dig.add(r); } });
    const turret = new T.Group(); turret.position.y = .75; dig.add(turret);
    const body = new T.Mesh(new T.BoxGeometry(2.2,.9,2.4), YEL); body.position.set(0,.5,-.2); turret.add(body);
    const cwt = new T.Mesh(new T.BoxGeometry(2.2,.7,.6), GREY); cwt.position.set(0,.45,-1.5); turret.add(cwt);
    const cab = new T.Mesh(new T.BoxGeometry(1,1.2,1.1), YEL); cab.position.set(-.55,1.5,.35); turret.add(cab);
    const glass = new T.Mesh(new T.BoxGeometry(.9,.8,1.12), new T.MeshLambertMaterial({color:0x8fd3ff, transparent:true, opacity:.75})); glass.position.set(-.55,1.6,.36); turret.add(glass);
    const roofC = new T.Mesh(new T.BoxGeometry(1.1,.1,1.2), DARK); roofC.position.set(-.55,2.15,.35); turret.add(roofC);
    const beacon = new T.Mesh(new T.SphereGeometry(.13,12,10), new T.MeshBasicMaterial({color:0xff9a00})); beacon.position.set(-.3,2.28,.1); turret.add(beacon);
    const boomPv = new T.Group(); boomPv.position.set(.45,1.1,.9); turret.add(boomPv);
    const boom = new T.Mesh(new T.BoxGeometry(.38,.45,2.6), YEL); boom.position.z = 1.3; boomPv.add(boom);
    const stickPv = new T.Group(); stickPv.position.z = 2.6; boomPv.add(stickPv);
    const stick = new T.Mesh(new T.BoxGeometry(.3,.35,1.9), YEL); stick.position.z = .95; stickPv.add(stick);
    const bucketPv = new T.Group(); bucketPv.position.z = 1.9; stickPv.add(bucketPv);
    const bucket = new T.Mesh(new T.CylinderGeometry(.5,.5,.8,16,1,true,0,Math.PI), new T.MeshLambertMaterial({color:0x3a3a3a, side:T.DoubleSide}));
    bucket.rotation.z = Math.PI/2; bucket.position.set(0,-.1,.35); bucketPv.add(bucket);
    const teeth = new T.Mesh(new T.BoxGeometry(.8,.08,.15), GREY); teeth.position.set(0,-.55,.4); bucketPv.add(teeth);
    const load = new T.Mesh(new T.SphereGeometry(.42,14,10), DIRT); load.scale.set(1,.6,1); load.position.set(0,-.05,.35); load.visible = false; bucketPv.add(load);

    /* ---- Dump truck ---- */
    const truck = new T.Group(); truck.position.set(4.7,0,.2); scene.add(truck);
    const chassis = new T.Mesh(new T.BoxGeometry(2.3,.4,4.6), DARK); chassis.position.y = .8; truck.add(chassis);
    const tcab = new T.Mesh(new T.BoxGeometry(2.2,1.5,1.3), L(0xe3262f)); tcab.position.set(0,1.75,-1.6); truck.add(tcab);
    const tglass = new T.Mesh(new T.BoxGeometry(2.0,.6,.05), new T.MeshLambertMaterial({color:0x8fd3ff})); tglass.position.set(0,2.1,-2.26); truck.add(tglass);
    const bedMat = L(0xff8c00);
    [[0,1.05,.55,2.3,.12,3.1],[-1.1,1.6,.55,.1,1.1,3.1],[1.1,1.6,.55,.1,1.1,3.1],[0,1.6,2.05,2.3,1.1,.1],[0,1.6,-.95,2.3,1.1,.1]].forEach(([x,y,z,w,h,d])=>{
      const p = new T.Mesh(new T.BoxGeometry(w,h,d), bedMat); p.position.set(x,y,z); truck.add(p); });
    const pile = new T.Mesh(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2), DIRT); pile.position.set(0,1.1,.55); pile.scale.set(.01,.01,.01); truck.add(pile);
    const wheels = [[-1.2,-1.5],[1.2,-1.5],[-1.2,.4],[1.2,.4],[-1.2,1.5],[1.2,1.5]].map(([x,z])=>{ const w = new T.Mesh(new T.CylinderGeometry(.55,.55,.45,20), DARK);
      w.rotation.z = Math.PI/2; w.position.set(x,.55,z); truck.add(w); return w; });

    /* ---- Site tour: a road the full truck drives along, past five working vehicles ---- */
    const roadPath = new T.CatmullRomCurve3([[4.7,.2],[4.7,-8],[4.3,-16],[1,-24],[-6,-29],[-14,-30],[-21,-26],[-25,-18],[-26,-9]].map(([x,z])=>new T.Vector3(x,0,z)));
    const roadLen = roadPath.getLength();
    { // the road itself
      const pts = roadPath.getSpacedPoints(120);
      for(let i=0;i<pts.length-1;i++){ const a = pts[i], b = pts[i+1], m = a.clone().add(b).multiplyScalar(.5), len = a.distanceTo(b);
        const seg = new T.Mesh(new T.PlaneGeometry(3.4, len+.05), L(0x5a5e66)); seg.rotation.x = -Math.PI/2; seg.rotation.z = -Math.atan2(b.x-a.x, -(b.z-a.z)); seg.position.set(m.x,.015,m.z); scene.add(seg);
        if(i%4===0){ const dash = new T.Mesh(new T.PlaneGeometry(.15, len*.9), L(0xffffff)); dash.rotation.copy(seg.rotation); dash.position.set(m.x,.02,m.z); scene.add(dash); } }
    }
    const ORANGE = L(0xff8c00), WHITE = L(0xf4f4f4), BLUE = L(0x2563eb);
    const glassMat = new T.MeshLambertMaterial({color:0x8fd3ff, transparent:true, opacity:.8});
    function wheel(r, w, x, y, z, grp){ const m = new T.Mesh(new T.CylinderGeometry(r,r,w,20), DARK); m.rotation.z = Math.PI/2; m.position.set(x,y,z); grp.add(m); return m; }

    // Bulldozer — pushes dirt with its blade
    const dozer = new T.Group(); dozer.position.set(10.8,0,-17.5); dozer.rotation.y = -Math.PI/2; scene.add(dozer);
    [-1,1].forEach(sd=>{ const tr = new T.Mesh(new T.BoxGeometry(.6,.7,2.8), DARK); tr.position.set(sd*.9,.35,0); dozer.add(tr); });
    const dzBody = new T.Mesh(new T.BoxGeometry(1.7,1,2.2), YEL); dzBody.position.set(0,1.1,-.2); dozer.add(dzBody);
    const dzCab = new T.Mesh(new T.BoxGeometry(1.2,1,1), YEL); dzCab.position.set(0,2.1,-.6); dozer.add(dzCab);
    const dzGlass = new T.Mesh(new T.BoxGeometry(1.1,.6,1.02), glassMat); dzGlass.position.set(0,2.2,-.6); dozer.add(dzGlass);
    const dzBlade = new T.Mesh(new T.BoxGeometry(2.6,1.1,.25), GREY); dzBlade.position.set(0,.6,1.75); dzBlade.rotation.x = -.15; dozer.add(dzBlade);
    const dzPipe = new T.Mesh(new T.CylinderGeometry(.08,.08,.8,8), DARK); dzPipe.position.set(.5,2,.5); dozer.add(dzPipe);
    const dzPile = new T.Mesh(new T.SphereGeometry(1,16,10,0,Math.PI*2,0,Math.PI/2), DIRT); dzPile.scale.set(1.3,.6,.8); dzPile.position.set(dozer.position.x - 2.6, 0, dozer.position.z); scene.add(dzPile);

    // Cement mixer — the drum spins round and round
    const mixer = new T.Group(); mixer.position.set(1.5,0,-30.5); mixer.rotation.y = .45; scene.add(mixer);
    const mxCh = new T.Mesh(new T.BoxGeometry(2,.4,5), DARK); mxCh.position.y = .8; mixer.add(mxCh);
    const mxCab = new T.Mesh(new T.BoxGeometry(2,1.5,1.3), WHITE); mxCab.position.set(0,1.75,-1.9); mixer.add(mxCab);
    const mxGl = new T.Mesh(new T.BoxGeometry(1.8,.6,.05), glassMat); mxGl.position.set(0,2.1,-2.56); mixer.add(mxGl);
    const drumTex = canvasTex(256,128,(x,w,h)=>{ x.fillStyle='#ff8c00'; x.fillRect(0,0,w,h); x.strokeStyle='#ffffff'; x.lineWidth=14;
      for(let i=-h;i<w+h;i+=60){ x.beginPath(); x.moveTo(i,0); x.lineTo(i+h,h); x.stroke(); } });
    const drumPv = new T.Group(); drumPv.position.set(0,2.2,.6); drumPv.rotation.x = -.25; mixer.add(drumPv);
    const drum = new T.Mesh(new T.SphereGeometry(1,24,16), new T.MeshLambertMaterial({map:drumTex})); drum.scale.set(1,1,1.8); drumPv.add(drum);
    [-1.6,-.2,1.2].forEach(z=>wheel(.5,.4,-1.05,.5,z,mixer)); [-1.6,-.2,1.2].forEach(z=>wheel(.5,.4,1.05,.5,z,mixer));

    // Road roller — rolls the road flat and smooth
    const roller = new T.Group(); roller.position.set(-12,0,-37); scene.add(roller);
    const rlDrum = new T.Mesh(new T.CylinderGeometry(.8,.8,2,24), GREY); rlDrum.rotation.z = Math.PI/2; rlDrum.position.set(0,.8,1.4); roller.add(rlDrum);
    const rlFrame = new T.Mesh(new T.BoxGeometry(2.2,.5,.6), YEL); rlFrame.position.set(0,1.75,1.4); roller.add(rlFrame);
    const rlBody = new T.Mesh(new T.BoxGeometry(1.8,1.1,2), YEL); rlBody.position.set(0,1.2,-.6); roller.add(rlBody);
    const rlRoof = new T.Mesh(new T.BoxGeometry(1.8,.1,1.6), DARK); rlRoof.position.set(0,2.8,-.5); roller.add(rlRoof);
    [-.8,.8].forEach(x=>{ const post = new T.Mesh(new T.CylinderGeometry(.05,.05,1.1,6), DARK); post.position.set(x,2.2,-.5); roller.add(post); });
    const rlBack = [wheel(.55,.4,-1.05,.55,-.9,roller), wheel(.55,.4,1.05,.55,-.9,roller)];
    const tarmac = new T.Mesh(new T.PlaneGeometry(9,3.2), L(0x2f3238)); tarmac.rotation.x = -Math.PI/2; tarmac.position.set(-12,.02,-37); scene.add(tarmac);

    // Forklift — lifts things with its two forks
    const fork = new T.Group(); fork.position.set(-26.5,0,-28.5); fork.rotation.y = 1.1; scene.add(fork);
    const fkBody = new T.Mesh(new T.BoxGeometry(1.4,1,2), ORANGE); fkBody.position.set(0,.9,0); fork.add(fkBody);
    const fkCw = new T.Mesh(new T.BoxGeometry(1.4,.8,.5), DARK); fkCw.position.set(0,1,-1.1); fork.add(fkCw);
    [[-.6,-.7],[.6,-.7],[-.6,.7],[.6,.7]].forEach(([x,z])=>{ const post = new T.Mesh(new T.CylinderGeometry(.05,.05,1.4,6), DARK); post.position.set(x,2.1,z); fork.add(post); });
    const fkRoof = new T.Mesh(new T.BoxGeometry(1.4,.08,1.6), DARK); fkRoof.position.set(0,2.8,0); fork.add(fkRoof);
    [-.45,.45].forEach(x=>{ const mast = new T.Mesh(new T.BoxGeometry(.12,3.2,.12), GREY); mast.position.set(x,1.6,1.15); fork.add(mast); });
    const carriage = new T.Group(); carriage.position.set(0,.25,1.2); fork.add(carriage);
    [-.3,.3].forEach(x=>{ const tine = new T.Mesh(new T.BoxGeometry(.12,.06,1.1), GREY); tine.position.set(x,0,.6); carriage.add(tine); });
    const pallet = new T.Mesh(new T.BoxGeometry(1.1,.14,1), L(0xc9935b)); pallet.position.set(0,.1,.6); carriage.add(pallet);
    const fkBrick = new T.Group(); fkBrick.position.set(0,.45,.6); carriage.add(fkBrick);
    const fkb = new T.Mesh(new T.BoxGeometry(1,.5,.5), L(0x0b6fd6)); fkBrick.add(fkb);
    for(let i=0;i<3;i++){ const st = new T.Mesh(new T.CylinderGeometry(.1,.1,.12,12), L(0x0b6fd6)); st.position.set(-.33+i*.33,.31,0); fkBrick.add(st); }
    [[-.75,-.6],[.75,-.6],[-.75,.6],[.75,.6]].forEach(([x,z])=>wheel(.35,.3,x,.35,z,fork));

    const STOPS = [
      {obj:crane, name:'Tower crane', fact:'A crane lifts heavy things way up high.', lookY:7, pull:.75},
      {obj:dozer, name:'Bulldozer',   fact:'A bulldozer pushes dirt with its big blade.'},
      {obj:mixer, name:'Cement mixer',fact:'A cement mixer spins round and round to mix the concrete.'},
      {obj:roller,name:'Road roller', fact:'A road roller squashes the road flat and smooth.'},
      {obj:fork,  name:'Forklift',    fact:'A forklift lifts things up with its two forks.'}
    ];
    STOPS.forEach(st=>st.said = false);
    const dozerHome = dozer.position.clone(), rollerHome = roller.position.clone();

    /* falling dirt */
    const bits = Array.from({length:40}, ()=>{ const d = new T.Mesh(new T.SphereGeometry(.09,6,5), DIRT); d.visible = false; scene.add(d); return d; });
    function spill(at){ bits.forEach(d=>{ if(Math.random()<.6){ d.visible = true; d.position.copy(at).add(new T.Vector3((Math.random()-.5)*.6,0,(Math.random()-.5)*.6));
      d.userData.v = new T.Vector3((Math.random()-.5)*.02, -.02, (Math.random()-.5)*.02); } }); }

    /* ---- Digger moves: keyframes for one load (seconds; turret angle and arm joints) ---- */
    const TO_TRUCK = Math.PI/2;
    const KEYS = [
      [0.0, 0,        -.5, 1.0, 1.2],   // arm up, facing the pit
      [0.9, 0,         .42, .7, -.3],   // reach down, bucket open
      [1.7, 0,         .32, 1.45, 1.35],// scoop!
      [2.5, 0,        -.55, 1.0, 1.35], // lift
      [3.6, TO_TRUCK, -.55, .95, 1.35], // swing round to the truck
      [4.3, TO_TRUCK, -.42, .75, -.5],  // tip it in
      [5.0, TO_TRUCK, -.5, .95, .6]     // shake it out
    ];
    const ease = x => x<.5 ? 2*x*x : 1-Math.pow(-2*x+2,2)/2;
    function pose(time){
      let a = KEYS[0], b = KEYS[KEYS.length-1];
      for(let i=0;i<KEYS.length-1;i++) if(time >= KEYS[i][0] && time <= KEYS[i+1][0]){ a = KEYS[i]; b = KEYS[i+1]; break; }
      const u = b[0]===a[0] ? 1 : ease(Math.min(1, Math.max(0, (time-a[0])/(b[0]-a[0]))));
      turret.rotation.y = a[1]+(b[1]-a[1])*u; boomPv.rotation.x = a[2]+(b[2]-a[2])*u; stickPv.rotation.x = a[3]+(b[3]-a[3])*u; bucketPv.rotation.x = a[4]+(b[4]-a[4])*u;
    }
    pose(0);

    /* ---- animation ---- */
    let phase = 'idle', t = 0, phaseT = 0, raf = 0, ended = false, last = performance.now(), loads = 0, scooped = false, dumped = false;
    let roadU = 0, driveSpeed = 0; const camLook = new T.Vector3(2,1,0);
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const tmp = new T.Vector3(), wp = new T.Vector3();
    cam.position.set(12, 9, 14);

    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67); last = now; t += k/60; phaseT += k/60;
      jibPv.rotation.y = Math.sin(t*.18)*.9; hookBrick.rotation.y = Math.sin(t*.7)*.3;
      hookBrick.position.y = -5.3 + Math.sin(t*.8)*1.6; rope.scale.y = 1 + Math.sin(t*.8)*-.32; rope.position.y = -2.5 + Math.sin(t*.8)*.8;
      { const ph = (t*.5)%2, f = ph<1 ? ph : 2-ph; dozer.position.x = dozerHome.x - f*1.6; dzPile.position.x = dozer.position.x - 2.6 - (1-f)*.1; dzPile.scale.x = 1.1 + f*.5; }
      drum.rotation.z += .05*k;
      roller.position.x = rollerHome.x + Math.sin(t*.6)*3; rlDrum.rotation.x = -roller.position.x/.8; rlBack.forEach(w=>w.rotation.x = -roller.position.x/.55);
      carriage.position.y = .25 + (Math.sin(t*.9)*.5+.5)*1.9;
      beacon.material.color.setHex(Math.sin(t*8) > 0 ? 0xffb000 : 0xff5a00);
      bits.forEach(d=>{ if(d.visible){ d.position.add(d.userData.v); d.userData.v.y -= .012*k; if(d.position.y < 1.2 && Math.abs(d.position.x-truck.position.x)<1.1) d.visible = false; if(d.position.y<0) d.visible = false; } });

      if(phase==='idle'){
        const a = t*.15; cam.position.set(Math.sin(a)*15 + 1, 8.5, Math.cos(a)*15 + 2); cam.lookAt(1.5, 1, 1.5);
        dig.position.y = Math.sin(t*20)*.004;
      }
      else if(phase==='start'){
        dig.position.y = Math.sin(t*30)*.01; truck.position.y = Math.sin(t*28)*.008;
        cam.position.lerp(tmp.set(-3.5, 6.2, 11.5), .03*k); cam.lookAt(2, 1.2, 1.8);
        if(phaseT > 2.6){ phase = 'load'; phaseT = 0; scooped = dumped = false; }
      }
      else if(phase==='load'){
        dig.position.y = Math.sin(t*30)*.01;
        pose(phaseT);
        if(!scooped && phaseT > 1.6){ scooped = true; load.visible = true; thud(); }
        if(!dumped && phaseT > 4.1){ dumped = true; load.visible = false; bucketPv.updateMatrixWorld(true); load.getWorldPosition(wp); spill(wp); thud();
          loads++; const s = .35 + loads*.22; pile.scale.set(.85, s*.7, 1.2);
          const n = ['One!','Two!','Three!'][loads-1]; showCap(n, ['One load in the truck!','Two loads!','Three loads — it’s full!'][loads-1]); speak(n, 1);
          const dot = pp.querySelector(`[data-i="${loads-1}"]`); if(dot) dot.classList.add('on'); }
        cam.position.lerp(tmp.set(-3.5, 6.2, 11.5), .03*k); cam.lookAt(2, 1.2, 1.8);
        if(phaseT > 5.2){ phaseT = 0; scooped = dumped = false;
          if(loads >= 3){ phase = 'driveoff'; showCap('Off it goes!', 'Beep beep!'); speak('The truck is full. Off it goes! Beep beep!', 1); beeps(3);
            const dot = pp.querySelector('[data-i="3"]'); if(dot) dot.classList.add('on'); } }
      }
      else if(phase==='driveoff' || phase==='tour'){
        // the digger rests its arm while the full truck tours the site
        turret.rotation.y += (0 - turret.rotation.y)*.03*k; boomPv.rotation.x += (-.55 - boomPv.rotation.x)*.05*k;
        // slow down beside each vehicle, speed up between them
        let target = .2, near = null, nd = 1e9;
        STOPS.forEach(st=>{ const d = Math.hypot(st.obj.position.x-truck.position.x, st.obj.position.z-truck.position.z); if(d < nd){ nd = d; near = st; } });
        if(nd < 11) target = .055;
        if(near && nd < 10.5 && !near.said){ near.said = true; showCap(near.name, near.fact); speak(near.fact, .95); tone(660,0,.12,'sine',.06); tone(990,.1,.16,'sine',.06); }
        driveSpeed += (target - driveSpeed)*.05*k;
        if(phase==='driveoff' && phaseT > 1.2) phase = 'tour';
        roadU = Math.min(1, roadU + driveSpeed*k/roadLen);
        const p = roadPath.getPointAt(roadU), tan = roadPath.getTangentAt(roadU);
        truck.position.set(p.x, 0, p.z); truck.rotation.y = Math.atan2(-tan.x, -tan.z);
        wheels.forEach(w=>w.rotation.x -= driveSpeed*k/.55);
        // camera rides behind and to the side, turning towards the vehicle being visited
        const back = tmp.set(tan.x, 0, tan.z).normalize();
        const want = new T.Vector3(p.x - back.x*9 + back.z*4.5, (near && nd < 12 && near.lookY) ? 7.5 : 5.2, p.z - back.z*9 - back.x*4.5);
        cam.position.lerp(want, .04*k);
        const lookAt = new T.Vector3(p.x + back.x*5, 1.2, p.z + back.z*5);
        if(near && nd < 12) lookAt.lerp(new T.Vector3(near.obj.position.x, near.lookY||1.5, near.obj.position.z), near.pull||.55);
        camLook.lerp(lookAt, .06*k); cam.lookAt(camLook);
        if(roadU >= 1){ phase = 'finale'; phaseT = 0; stopEngine(); showCap('Your turn!', "Let's build some numbers!"); speak("What a busy building site! Your turn! Let's play!", 1); }
      }
      else if(phase==='finale'){
        cam.position.lerp(tmp.set(-33, 9, 4), .025*k); camLook.lerp(tmp.set(-12, 1, -20), .03*k); cam.lookAt(camLook);
        boomPv.rotation.x = -.5 + Math.sin(t*3)*.15;   // the digger waves its arm
        if(phaseT > 3) finish();
      }
      renderer.render(scene, cam);
    }
    function finish(){
      if(ended) return; ended = true; stopEngine(); stopVoice();
      wrap.classList.add('out');
      setTimeout(()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); wrap.remove(); }, 750);
      done();
    }
    wrap.querySelector('#launch').onclick = ()=>{
      if(phase!=='idle') return; sfx.click(); audio();
      wrap.querySelector('#ov').classList.add('go'); pp.classList.add('show');
      phase = 'start'; phaseT = 0; startEngine(); beeps(2);
      showCap('Brrrrm!', 'Fill the truck with 3 loads'); speak('Brrrm! The digger needs to fill the truck with three loads. Let’s count them!', 1);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    requestAnimationFrame(frame);
    speak('Welcome to the building site! Tap start the engines!');
  }
};
