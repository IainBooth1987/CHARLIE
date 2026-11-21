/* Phonics world: Trains — each sound is a carriage; couple them up and the train says the word */
window.WORLD = {
  id:'trains', name:'Trains', icon:'🚂', mascot:'🚂', rewardIcon:'🎫', dotColour:'#1e3a8a',
  items:[['🚂','trains','train'],['🚃','carriages','carriage'],['🎫','tickets','ticket']],
  menuLine:'All aboard the Sound Express! Pick a game!',
  cheer:['Choo choo!','Full steam ahead!','All aboard!','Right on time!'],
  action:'Chug like a train and say choo choo {n} times!',

  /* ---- 2D background: sky, rolling hills, a railway along the bottom ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now(), train = null;
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const hill = (base, amp, len, off, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, h);
      for(let x=0; x<=w; x+=8*dpr) ctx.lineTo(x, base + Math.sin((x+off)/len)*amp + Math.sin((x+off)/(len*.37))*amp*.3); ctx.lineTo(w, h); ctx.fill(); };
    const loop = now => {
      requestAnimationFrame(loop); if(document.hidden) return; const t = (now-t0)/1000;
      const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#5fb6f5'); g.addColorStop(1,'#cdeafe'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      // clouds drifting
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for(let i=0;i<5;i++){ const x = ((i*w*.27 + t*12*dpr*(1+i%2)) % (w+300*dpr)) - 150*dpr, y = h*(.08+.07*(i%3));
        [0,1,2].forEach(j=>{ ctx.beginPath(); ctx.arc(x + j*38*dpr, y - (j===1?16*dpr:0), (j===1?34:26)*dpr, 0, 7); ctx.fill(); }); }
      hill(h*.62, 40*dpr, 260*dpr, t*6*dpr, '#8fd17a');
      hill(h*.72, 30*dpr, 180*dpr, t*14*dpr, '#5fb653');
      hill(h*.82, 18*dpr, 120*dpr, t*24*dpr, '#3f9a45');
      // the railway
      const ry = h - 46*dpr; ctx.fillStyle = '#8b5a3c';
      for(let x = -(t*60*dpr % (34*dpr)); x < w; x += 34*dpr) ctx.fillRect(x, ry, 18*dpr, 12*dpr);
      ctx.fillStyle = '#6b7280'; ctx.fillRect(0, ry-2*dpr, w, 5*dpr); ctx.fillRect(0, ry+10*dpr, w, 5*dpr);
      // now and then a little train chuffs by (only on menus)
      if(!train && document.body.dataset.mode!=='game' && Math.random()<.002) train = {x:w+40*dpr};
      if(train){ train.x -= 3*dpr; const x = train.x, y = ry - 30*dpr, s = dpr;
        ctx.fillStyle = '#e3262f'; ctx.fillRect(x, y, 70*s, 26*s); ctx.fillRect(x+44*s, y-20*s, 26*s, 20*s); ctx.fillStyle = '#1b2a6b'; ctx.fillRect(x+8*s, y-14*s, 12*s, 14*s);
        ['#2563eb','#f59e0b','#22c55e'].forEach((c,i)=>{ ctx.fillStyle = c; ctx.fillRect(x + 80*s + i*62*s, y+4*s, 54*s, 22*s); });
        ctx.fillStyle = '#111'; for(let i=0;i<9;i++){ ctx.beginPath(); ctx.arc(x + 12*s + i*26*s, y+28*s, 7*s, 0, 7); ctx.fill(); }
        ctx.fillStyle = 'rgba(255,255,255,.8)'; for(let i=0;i<3;i++){ ctx.beginPath(); ctx.arc(x+14*s+i*14*s, y-22*s-i*12*s, (8+i*3)*s, 0, 7); ctx.fill(); }
        if(train.x < -320*dpr) train = null; }
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D intro: the engine backs up to collect three sound carriages — s, u, n — and off they go: sun! ---- */
  intro(done){
    const K = KIT({done, title:'SOUND EXPRESS', sub:'Collect the sound carriages… what word will they make?', button:'🚂 All aboard!',
      passport:['🚃','🚃','🚃','☀️'], sky:0x8fd0ff, fog:[0xbfe4ff, 60, 170], hemi:[0xf1f8ff, 0x4f8a3a]});
    const {T, scene, cam, toon, blob, box, cyl} = K;
    const WORD = ['s','u','n'], COLS = ['#2563eb','#f59e0b','#16a34a'];

    /* ground, hills, trees, clouds */
    const ground = new T.Mesh(new T.PlaneGeometry(400, 200), toon(0x6cc35a)); ground.rotation.x = -Math.PI/2; scene.add(ground);
    for(let i=0;i<26;i++){ const hx = -150 + i*12 + Math.random()*6, hz = -30 - Math.random()*40, r = 8 + Math.random()*10;
      blob(scene, toon(pick([0x58b04c,0x6fc15c,0x4a9e42])), r, r*.45, r, hx, -1, hz); }
    for(let i=0;i<40;i++){ const x = -120 + Math.random()*240, z = -7 - Math.random()*22;   // trees behind the line only, so the camera always sees the train
      const g = new T.Group(); g.position.set(x,0,z); scene.add(g); const s = .8 + Math.random()*.6;
      cyl(g, toon(0x7a4a2a), .18*s, .25*s, 1.4*s, 0, .7*s, 0, 8);
      blob(g, toon(pick([0x2f8f3a,0x3aa046,0x2a7d34])), 1.1*s, 1.3*s, 1.1*s, 0, 2.1*s, 0); }
    const clouds = []; for(let i=0;i<10;i++){ const g = new T.Group(); g.position.set(-100 + i*22, 18 + Math.random()*8, -50 - Math.random()*30); scene.add(g);
      [[0,0,3],[3,.6,2.4],[-3,.3,2.2],[1.4,1.6,2]].forEach(([x,y,r])=>blob(g, toon(0xffffff), r, r*.75, r, x, y, 0)); clouds.push(g); }

    /* the railway along x */
    const sleeperM = toon(0x7a4a2a), railM = toon(0x9aa3ad);
    for(let x=-120; x<=60; x+=1.2) box(scene, sleeperM, .5, .14, 2.4, x, .07, 0);
    [-.72,.72].forEach(z=>box(scene, railM, 180, .14, .12, -30, .2, z));

    /* a little station with a sign */
    const st = new T.Group(); st.position.set(-62, 0, -4.2); scene.add(st);
    box(st, toon(0xd6c3a5), 12, .6, 3, 0, .3, 0);
    box(st, toon(0xe3262f), 13, .3, 3.6, 0, 4, 0); [-5.5,5.5].forEach(x=>cyl(st, toon(0xffffff), .12,.12, 3.4, x, 2.2, .8, 8));
    const signTex = K.canvasTex(512,128,(x,w,h)=>{ x.fillStyle='#1b2a6b'; x.fillRect(0,0,w,h); x.fillStyle='#fff'; x.font='bold 64px Fredoka, sans-serif'; x.textAlign='center'; x.fillText('WORD STATION', w/2, 86); });
    const sign = new T.Mesh(new T.PlaneGeometry(6,1.5), new T.MeshBasicMaterial({map:signTex})); sign.position.set(0, 5, 1.85); st.add(sign);

    /* the engine (faces −x) */
    const engine = new T.Group(); scene.add(engine);
    const RED = toon(0xe3262f), DARK = toon(0x1f2937), GOLD = toon(0xf5c542), BLUE = toon(0x1e40af);
    box(engine, DARK, 6.4, .5, 2.1, 0, .85, 0);                                        // chassis
    const boiler = cyl(engine, RED, .95, .95, 3.8, -.9, 2.05, 0, 28); boiler.rotation.z = Math.PI/2;
    const front = cyl(engine, DARK, .98, .98, .4, -2.9, 2.05, 0, 28); front.rotation.z = Math.PI/2;
    blob(engine, GOLD, .1, .4, .4, -3.12, 2.05, 0);
    cyl(engine, DARK, .32, .45, 1.2, -2.2, 3.4, 0, 18);                                 // chimney
    cyl(engine, DARK, .5, .5, .18, -2.2, 4.02, 0, 18);
    blob(engine, GOLD, .45, .42, .45, -.6, 3.05, 0);                                    // dome
    box(engine, BLUE, 2.1, 2.6, 2.2, 1.9, 2.4, 0);                                      // cab
    box(engine, DARK, 2.5, .25, 2.5, 1.9, 3.8, 0);                                      // roof
    [-1.11,1.11].forEach(z=>{ const win = box(engine, toon(0xbfe7ff), .9, .8, .05, 1.9, 2.9, z); });
    box(engine, RED, .3, .5, 2.4, -3.25, .85, 0);                                       // buffer beam
    [-.7,.7].forEach(z=>{ const b = cyl(engine, DARK, .16,.16,.4, -3.5, .85, z, 12); b.rotation.z = Math.PI/2; });
    const wheels = [];
    [-2,-.4,1.3].forEach((x,i)=>[-1.08,1.08].forEach(z=>{ const r = i===2 ? .62 : .72;
      const wh = new T.Group(); wh.position.set(x, r, z); engine.add(wh);
      const tyre = new T.Mesh(new T.CylinderGeometry(r, r, .22, 24), RED); tyre.rotation.x = Math.PI/2; wh.add(tyre);
      const hub = new T.Mesh(new T.CylinderGeometry(r*.3, r*.3, .26, 12), GOLD); hub.rotation.x = Math.PI/2; wh.add(hub);
      for(let s=0;s<4;s++){ const sp = box(wh, DARK, .09, r*1.7, .24, 0, 0, 0); sp.rotation.z = s*Math.PI/4; }
      wheels.push(wh); }));
    const rods = [-1.2,1.2].map(z=>box(engine, toon(0xc0c7cf), 3.4, .12, .06, -.5, .7, z));
    box(engine, DARK, .4, .3, .4, 3.35, .85, 0);                                        // coupling hook
    engine.position.set(0, 0, 0);

    /* three carriages, each carrying a sound block */
    function carriage(i){ const g = new T.Group(); scene.add(g);
      box(g, DARK, 3.6, .4, 2, 0, .8, 0);
      box(g, toon([0x93c5fd,0xfcd34d,0x86efac][i]), 3.4, .8, 1.9, 0, 1.4, 0);
      [-1.1,1.1].forEach(x=>[-1.02,1.02].forEach(z=>{ const w = new T.Mesh(new T.CylinderGeometry(.48,.48,.2,20), RED); w.rotation.x = Math.PI/2; w.position.set(x,.48,z); g.add(w); }));
      box(g, DARK, .3, .25, .3, -1.95, .85, 0); box(g, DARK, .3, .25, .3, 1.95, .85, 0);
      const cube = K.letterCube(WORD[i], COLS[i], 1.7); cube.position.set(0, 2.75, 0); g.add(cube);
      return {g, cube}; }
    const LEN_E = 3.6, LEN_C = 4.0;           // half-lengths: engine back at +3.4, carriage ±1.95
    const cars = [0,1,2].map(i=>{ const c = carriage(i); c.home = 10 + i*9; c.g.position.x = c.home; c.coupled = false; return c; });
    /* the sun that rises at the end */
    const sunG = new T.Group(); sunG.position.set(-70, -8, -40); scene.add(sunG);
    blob(sunG, K.glow(0xffd84d), 6, 6, 1.5, 0, 0, 0);
    for(let i=0;i<12;i++){ const r = box(sunG, K.glow(0xffb020), .9, 3, .4, 0, 0, 0); r.position.set(Math.cos(i*Math.PI/6)*8.6, Math.sin(i*Math.PI/6)*8.6, 0); r.rotation.z = i*Math.PI/6 - Math.PI/2; }
    K.eye(sunG, -2, 1.2, 1.1, 1.1, 0x6b3b0a); K.eye(sunG, 2, 1.2, 1.1, 1.1, 0x6b3b0a);
    const smile = new T.Mesh(new T.TorusGeometry(2, .3, 8, 24, Math.PI), K.glow(0x8a3b0a)); smile.rotation.z = Math.PI; smile.position.set(0, -.8, 1.4); sunG.add(smile);

    /* animation */
    let speed = 0, coupled = 0;
    const trainX = () => engine.position.x;
    function moveTrain(dx){ engine.position.x += dx; cars.forEach((c, i)=>{ if(c.coupled) c.g.position.x = engine.position.x + LEN_E - .2 + 1.95 + i*LEN_C; }); }
    function spinWheels(dx){ wheels.forEach(w=>w.rotation.z -= dx/.7); cars.forEach(c=>{ if(c.coupled || Math.abs(dx)>0) {} }); }
    K.run((k, t)=>{
      const S = K.state;
      clouds.forEach((c,i)=>c.position.x += .01*k*(1+i%3));
      if(Math.random() < (Math.abs(speed)>.01 ? .35 : .06)*k) K.puff(engine.position.x - 2.2, 4.2, 0, 0xffffff, .9 + Math.random()*.5, .05);
      if(S.phase==='idle'){
        const a = t*.15; cam.position.set(Math.sin(a)*16 + 4, 6, Math.cos(a)*16 + 2); cam.lookAt(6, 1.5, 0);
      }
      else if(S.phase==='back'){            // back up (+x) to the next carriage, couple it, repeat
        const c = cars[coupled];
        const target = c.home - 1.95 - (LEN_E - .2) - coupled*LEN_C;
        speed = K.lerp(speed, .09, .05*k); const dx = Math.min(speed*k, Math.max(0, target - trainX()));
        moveTrain(dx); spinWheels(-dx);
        if(trainX() >= target - .001){ c.coupled = true; coupled++; speed = 0; K.sfx('clank'); K.dot(coupled-1);
          K.showCap(WORD[coupled-1], ['The first sound!','The next sound…','The last sound!'][coupled-1]);
          c.cube.scale.setScalar(1.25); K.go(coupled < 3 ? 'pause' : 'whistle'); }
        cam.position.lerp(K.v.set(trainX() + 7, 4.5, 15), .05*k); cam.lookAt(K.look.set(trainX() + 7, 2, 0));
      }
      else if(S.phase==='pause'){
        cars.forEach(c=>c.cube.scale.setScalar(K.lerp(c.cube.scale.x, 1, .1*k)));
        cam.position.lerp(K.v.set(trainX() + 7, 4.5, 15), .05*k); cam.lookAt(K.look.set(trainX() + 7, 2, 0));
        if(S.pt > 1.3) K.go('back');
      }
      else if(S.phase==='whistle'){
        cars.forEach(c=>c.cube.scale.setScalar(K.lerp(c.cube.scale.x, 1, .1*k)));
        if(S.pt > .2 && !S.w){ S.w = true; K.sfx('whoo'); K.showCap('Toot toot!', 'Off we go!'); }
        cam.position.lerp(K.v.set(trainX() + 4, 7, 22), .04*k); cam.lookAt(K.look.set(trainX() + 8, 2, 0));
        if(S.pt > 1.8) K.go('drive');
      }
      else if(S.phase==='drive'){           // chuff along to Word Station
        const stop = -64.5; const left = trainX() - stop;
        speed = left > 12 ? K.lerp(speed, .22, .02*k) : Math.max(.02, left*.018);
        const dx = Math.min(speed*k, left); moveTrain(-dx); spinWheels(dx);
        cars.forEach((c,i)=>{ c.g.position.y = Math.abs(Math.sin(t*9 + i))*.04; });
        cam.position.lerp(K.v.set(trainX() + 6, 3.6, 13), .05*k); cam.lookAt(K.look.set(trainX() + 6, 2, 0));
        if(left < .05){ speed = 0; K.go('read'); K.showCap('Word Station!', 'Say the sounds…'); }
      }
      else if(S.phase==='read'){            // each sound lights up in turn, then they blend
        cam.position.lerp(K.v.set(trainX() + 9, 4.2, 15), .05*k); cam.lookAt(K.look.set(trainX() + 9, 2.4, 0));
        const i = Math.floor((S.pt - .8)/1.1);
        cars.forEach((c,j)=>{ const on = j===i; c.cube.scale.setScalar(K.lerp(c.cube.scale.x, on ? 1.35 : 1, .15*k)); c.cube.position.y = K.lerp(c.cube.position.y, on ? 3.3 : 2.75, .15*k); });
        if(i>=0 && i<3 && S.last!==i){ S.last = i; K.sfx('pop'); K.showCap(WORD.slice(0,i+1).join(' – '), ''); }
        if(S.pt > 4.4){ K.go('word'); K.bigWord('sun!'); K.sfx('word'); K.dot(3); confetti(120); }
      }
      else if(S.phase==='word'){            // the sun rises, smiling
        sunG.position.y = K.lerp(sunG.position.y, 22, .02*k); sunG.rotation.z = Math.sin(t*1.5)*.05;
        cars.forEach((c,j)=>{ c.cube.position.y = 2.75 + Math.abs(Math.sin(t*6 + j))*.5; c.cube.scale.setScalar(K.lerp(c.cube.scale.x, 1, .1*k)); });
        cam.position.lerp(K.v.set(trainX() + 6, 5, 26), .02*k); cam.lookAt(K.look.set(trainX() - 6, 8, -10));
        if(S.pt > 3.2){ K.go('end'); K.hideBig(); K.showCap('Your turn!', 'Let’s play with sounds!'); }
      }
      else if(S.phase==='end'){ sunG.position.y = K.lerp(sunG.position.y, 22, .02*k); if(S.pt > 2.4) K.finish(); }
    });
    K.onLaunch(()=>{ K.go('wait'); K.showCap('All aboard!', 'Back up to the sound carriages…'); setTimeout(()=>K.go('back'), 1500); });
  }
};
