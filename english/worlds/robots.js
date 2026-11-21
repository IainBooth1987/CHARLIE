/* Phonics world: Robots — robots talk in sounds ("h – a – t") and help build words */
window.WORLD = {
  id:'robots', name:'Robots', icon:'🤖', mascot:'🤖', rewardIcon:'🔋', dotColour:'#0f172a',
  items:[['🤖','robots','robot'],['🔩','bolts','bolt'],['🔋','batteries','battery']],
  menuLine:'Beep boop! Welcome to the Robot Factory. Pick a game!',
  cheer:['Beep boop — brilliant!','Systems: awesome!','Power up!','Robot high five!'],
  action:'Do a robot dance — move your arms like a robot {n} times!',

  /* ---- 2D background: factory wall with turning gears and blinking lights ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const gear = (x, y, r, teeth, a, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.fillStyle = col; ctx.beginPath();
      for(let i=0;i<teeth*2;i++){ const rr = i%2 ? r : r*1.18, ang = i*Math.PI/teeth; ctx.lineTo(Math.cos(ang)*rr, Math.sin(ang)*rr); } ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.arc(0,0,r*.35,0,7); ctx.fill(); ctx.restore(); };
    const loop = now => {
      requestAnimationFrame(loop); if(document.hidden) return; const t = (now-t0)/1000;
      const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#16213e'); g.addColorStop(1,'#0b1226'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      // wall panels
      ctx.strokeStyle = 'rgba(120,160,255,.10)'; ctx.lineWidth = 2*dpr; const s = 90*dpr;
      for(let x=0;x<w;x+=s) for(let y=0;y<h;y+=s){ ctx.strokeRect(x+4*dpr, y+4*dpr, s-8*dpr, s-8*dpr);
        ctx.fillStyle = 'rgba(160,190,255,.12)'; [[10,10],[s/dpr-10,10],[10,s/dpr-10],[s/dpr-10,s/dpr-10]].forEach(([a,b])=>{ ctx.beginPath(); ctx.arc(x+a*dpr, y+b*dpr, 2.5*dpr, 0, 7); ctx.fill(); }); }
      // gears in the corners
      gear(70*dpr, h-60*dpr, 70*dpr, 12, t*.4, 'rgba(96,165,250,.28)');
      gear(175*dpr, h-120*dpr, 42*dpr, 9, -t*.67, 'rgba(250,204,21,.25)');
      gear(w-80*dpr, 90*dpr, 64*dpr, 11, -t*.35, 'rgba(96,165,250,.25)');
      gear(w-30*dpr, 190*dpr, 36*dpr, 8, t*.62, 'rgba(244,114,182,.22)');
      // blinking lights along the top
      for(let i=0;i<14;i++){ const on = Math.sin(t*2 + i*1.7) > .3; ctx.fillStyle = on ? ['#22d3ee','#facc15','#f472b6','#4ade80'][i%4] : 'rgba(255,255,255,.08)';
        ctx.beginPath(); ctx.arc((i+.5)*w/14, 16*dpr, 6*dpr, 0, 7); ctx.fill(); }
      // conveyor belt
      ctx.fillStyle = '#334155'; ctx.fillRect(0, h-28*dpr, w, 28*dpr); ctx.fillStyle = '#facc15';
      for(let x = -(t*40*dpr % (40*dpr)); x < w; x += 40*dpr){ ctx.beginPath(); ctx.moveTo(x, h-28*dpr); ctx.lineTo(x+20*dpr, h-28*dpr); ctx.lineTo(x+8*dpr, h); ctx.lineTo(x-12*dpr, h); ctx.fill(); }
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D intro: three robot parts drop in — h, a, t — the robot powers up and reads the word: hat! ---- */
  intro(done){
    const K = KIT({done, title:'ROBOT FACTORY', sub:'Build a robot from sounds… what word will it say?', button:'🤖 Power on!',
      passport:['🔩','🔩','🔩','🎩'], sky:0x1a2340, fog:[0x1a2340, 40, 90], hemi:[0xdfe9ff, 0x2a3350]});
    const {T, scene, cam, toon, blob, box, cyl} = K;
    const WORD = ['h','a','t'], COLS = ['#ec4899','#22c55e','#3b82f6'];

    /* factory: floor tiles, back wall with lights, a lit platform */
    const floorTex = K.canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#3b4766'; x.fillRect(0,0,w,h); x.strokeStyle='#2a3450'; x.lineWidth=6; for(let i=0;i<=w;i+=64){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,h); x.stroke(); x.beginPath(); x.moveTo(0,i); x.lineTo(w,i); x.stroke(); } });
    floorTex.wrapS = floorTex.wrapT = T.RepeatWrapping; floorTex.repeat.set(16,16);
    const floor = new T.Mesh(new T.PlaneGeometry(120,120), new T.MeshLambertMaterial({map:floorTex})); floor.rotation.x = -Math.PI/2; scene.add(floor);
    const wall = box(scene, toon(0x2b3657), 80, 30, 1, 0, 15, -16);
    const lights = []; for(let i=0;i<12;i++){ const l = blob(scene, K.glow(0x22d3ee), .35, .35, .2, -22 + i*4, 12, -15.4); lights.push(l); }
    // big gears on the wall
    const gears = [[-12,6,3],[-7,9,1.8],[12,7,2.6]].map(([x,y,r])=>{ const g = new T.Group(); g.position.set(x,y,-15.3); scene.add(g);
      cyl(g, toon(0xf59e0b), r, r, .4, 0, 0, 0, 24).rotation.x = Math.PI/2;
      for(let i=0;i<10;i++){ const tth = box(g, toon(0xf59e0b), .5, r*.5, .4, 0, 0, 0); tth.position.set(Math.cos(i*.628)*r, Math.sin(i*.628)*r, 0); tth.rotation.z = i*.628 - Math.PI/2; }
      cyl(g, toon(0x7c2d12), r*.3, r*.3, .5, 0, 0, 0, 16).rotation.x = Math.PI/2; return g; });
    const plat = cyl(scene, toon(0x64748b), 3, 3.3, .6, 0, .3, 0, 40);
    const ring = new T.Mesh(new T.TorusGeometry(3.05, .09, 8, 48), K.glow(0x22d3ee)); ring.rotation.x = Math.PI/2; ring.position.y = .62; scene.add(ring);
    // a robot claw on a rail above
    const rail = box(scene, toon(0x475569), 30, .4, .6, 0, 13, 0);
    const claw = new T.Group(); claw.position.set(-14, 13, 0); scene.add(claw);
    box(claw, toon(0xfacc15), 1.2, .6, 1.2, 0, -.3, 0); cyl(claw, toon(0x94a3b8), .1, .1, 3, 0, -2, 0, 8);
    const pinch = [-1,1].map(s=>{ const p = box(claw, toon(0xfacc15), .2, 1, .6, s*.5, -3.8, 0); return p; });

    /* robot parts (built separately, assembled on the platform) */
    const SILVER = toon(0xcbd5e1), BLUE = toon(0x3b82f6), DARK = toon(0x1e293b);
    // legs + feet
    const legs = new T.Group(); scene.add(legs);
    [-.55,.55].forEach(x=>{ cyl(legs, SILVER, .28, .28, 1.4, x, 1.2, 0, 16); box(legs, BLUE, .8, .4, 1.1, x, .45, .12); blob(legs, DARK, .32, .32, .32, x, 1.9, 0); });
    box(legs, toon(0x94a3b8), 1.9, .35, .9, 0, 2.05, 0);
    // body with a chest screen
    const body = new T.Group(); scene.add(body);
    box(body, BLUE, 2.3, 2, 1.6, 0, 1, 0); box(body, SILVER, 2.4, .25, 1.7, 0, 2.05, 0);
    const scrTex = K.canvasTex(512, 256, ()=>{}); const scrCtx = scrTex.image.getContext('2d');
    function drawScreen(txt, glow){ const x = scrCtx; x.fillStyle = '#0b1226'; x.fillRect(0,0,512,256); x.strokeStyle = '#22d3ee'; x.lineWidth = 10; x.strokeRect(8,8,496,240);
      x.fillStyle = glow ? '#fef08a' : '#22d3ee'; x.font = `bold ${txt.length > 5 ? 96 : txt.length > 3 ? 120 : 150}px Andika, Fredoka, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 256, 138); scrTex.needsUpdate = true; }
    drawScreen('', false);
    const screen = new T.Mesh(new T.PlaneGeometry(1.7, .85), new T.MeshBasicMaterial({map:scrTex})); screen.position.set(0, 1.1, .81); body.add(screen);
    const arms = [-1,1].map(s=>{ const a = K.limb(body, SILVER, .22, .2, 1.4, s*1.35, 1.7, 0, 0, s*.25); blob(a, toon(0xfacc15), .32, .32, .32, 0, -1.55, 0); return a; });
    // head with big eyes and an antenna
    const head = new T.Group(); scene.add(head);
    box(head, SILVER, 1.9, 1.5, 1.5, 0, .75, 0);
    box(head, DARK, 1.6, .8, .1, 0, .85, .76);
    const eyes = [-.42,.42].map(x=>{ const e = blob(head, K.glow(0x22d3ee), .26, .26, .1, x, .9, .82); return e; });
    const mouth = box(head, K.glow(0x22d3ee), .7, .08, .05, 0, .45, .78);
    [-1,1].forEach(s=>{ cyl(head, toon(0xef4444), .28, .28, .3, s*1.05, .8, 0, 16).rotation.z = Math.PI/2; });
    const antenna = cyl(head, SILVER, .05, .05, .8, 0, 1.9, 0, 8);
    const bulb = blob(head, K.glow(0xf43f5e), .2, .2, .2, 0, 2.35, 0);
    // the hat for the end
    const hat = new T.Group(); hat.position.set(0, 20, 0); scene.add(hat);
    cyl(hat, toon(0x111827), .95, .95, .1, 0, 0, 0, 32); cyl(hat, toon(0x111827), .62, .66, 1.1, 0, .6, 0, 32); cyl(hat, toon(0xe3262f), .67, .67, .22, 0, .2, 0, 32);

    /* letter crates that come with each part */
    const crates = WORD.map((L,i)=>{ const c = K.letterCube(L, COLS[i], 1.2); c.position.set(-3 + i*3, 22, 4.2); c.visible = false; scene.add(c); return c; });   // the chest screen shows the sounds
    const PARTS = [legs, body, head], HOME_Y = [0, 2.2, 4.4], START_Y = 24;
    PARTS.forEach(p=>{ p.position.set(0, START_Y, 0); p.visible = false; });

    let dropped = 0;
    K.run((k, t)=>{
      const S = K.state;
      gears.forEach((g,i)=>g.rotation.z += (i%2 ? -.01 : .015)*k);
      lights.forEach((l,i)=>l.material.color.setHex(Math.sin(t*3 + i) > .2 ? [0x22d3ee,0xfacc15,0xf472b6,0x4ade80][i%4] : 0x334155));
      ring.material.color.setHSL((t*.1)%1, .8, .6);
      bulb.material.color.setHex(Math.sin(t*6) > 0 ? 0xf43f5e : 0x7f1d1d);
      if(S.phase==='idle'){ const a = t*.2; cam.position.set(Math.sin(a)*11, 6, Math.cos(a)*11); cam.lookAt(0, 3, 0); }
      else if(S.phase==='drop'){          // the claw carries a part across and lets go
        const p = PARTS[dropped]; p.visible = true;
        if(S.pt < 1.4){ const f = S.pt/1.4; claw.position.x = K.lerp(-14, 0, f); p.position.set(claw.position.x, 13 - 4.6 - (dropped===2?1.5:dropped===1?2:2.1), 0); pinch.forEach((q,j)=>q.position.x = (j?1:-1)*.5); }
        else { pinch.forEach((q,j)=>q.position.x = K.lerp(q.position.x, (j?1:-1)*1.1, .2*k));
          p.position.y = Math.max(HOME_Y[dropped], p.position.y - .3*k);
          if(p.position.y <= HOME_Y[dropped] && !S.landed){ S.landed = true; K.sfx('clank'); for(let i=0;i<8;i++) K.puff(Math.cos(i)*2, HOME_Y[dropped]+.5, Math.sin(i)*2, 0xcbd5e1, .5, .02, .8);
            K.dot(dropped); K.showCap(WORD[dropped], ['The first sound!','The next sound…','The last sound!'][dropped]);
            drawScreen(WORD.slice(0, dropped+1).join(' '), false); } }
        const c = crates[dropped]; c.position.y = Math.max(.6, c.position.y - .35*k); c.rotation.y = K.lerp(c.rotation.y, 0, .1*k);
        cam.position.lerp(K.v.set(0, 6.5, 14), .04*k); cam.lookAt(K.look.set(0, 4.4, 0));
        if(S.landed && S.pt > 2.8){ dropped++; S.landed = false; if(dropped < 3){ K.go('drop'); } else { K.go('power'); K.showCap('Power up!', ''); K.sfx('beep'); } }
      }
      else if(S.phase==='power'){         // eyes light, robot looks round, waves
        claw.position.x = K.lerp(claw.position.x, 14, .03*k);
        eyes.forEach(e=>e.scale.setScalar(.26*(1 + .3*Math.abs(Math.sin(t*8)))));
        head.rotation.y = Math.sin(S.pt*3)*.4; arms[1].rotation.z = .25 + Math.abs(Math.sin(S.pt*6))*1.6 + .6;
        cam.position.lerp(K.v.set(0, 5.5, 10), .04*k); cam.lookAt(K.look.set(0, 3.5, 0));
        if(S.pt > 2.4){ K.go('read'); head.rotation.y = 0; arms[1].rotation.z = .25; }
      }
      else if(S.phase==='read'){          // robot talk: h – a – t … hat!
        cam.position.lerp(K.v.set(0, 5.6, 11), .05*k); cam.lookAt(K.look.set(0, 4.8, 0));
        const i = Math.floor((S.pt - .5)/1.1);
        crates.forEach((c,j)=>{ c.scale.setScalar(K.lerp(c.scale.x, j===i ? 1.4 : 1, .15*k)); });
        if(i>=0 && i<3 && S.last!==i){ S.last = i; K.sfx('beep'); K.showCap(WORD.slice(0,i+1).join(' – '), ''); mouth.scale.x = 1.6; drawScreen(WORD.slice(0,i+1).join(' – '), true); }
        mouth.scale.x = K.lerp(mouth.scale.x, 1, .1*k);
        if(S.pt > 4){ K.go('hat'); K.bigWord('hat!'); K.sfx('word'); drawScreen('hat', true); K.dot(3); }
      }
      else if(S.phase==='hat'){           // the hat drops on, the robot dances
        hat.position.y = Math.max(5.95, hat.position.y - .35*k);
        if(hat.position.y <= 5.96 && !S.on){ S.on = true; antenna.visible = bulb.visible = false; confetti(120); K.sfx('pop'); }
        if(S.on){ const b = Math.abs(Math.sin(t*6))*.25; [legs, body, head].forEach((p,i)=>p.position.y = HOME_Y[i] + b*(i?1:0)); hat.position.y = 5.95 + b; hat.rotation.z = Math.sin(t*6)*.12;
          arms.forEach((a,i)=>a.rotation.z = (i?1:-1)*(.25 + Math.abs(Math.sin(t*6 + i))*1.8)); }
        crates.forEach((c,j)=>{ c.position.y = .6 + Math.abs(Math.sin(t*5 + j))*.5; c.scale.setScalar(K.lerp(c.scale.x, 1, .1*k)); });
        cam.position.lerp(K.v.set(3, 6, 13), .03*k); cam.lookAt(K.look.set(0, 4.8, 0));
        if(S.pt > 3.4){ K.go('end'); K.hideBig(); K.showCap('Your turn!', 'Let’s play with sounds!'); }
      }
      else if(S.phase==='end'){ hat.rotation.y += .02*k; if(S.pt > 2.4) K.finish(); }
    });
    K.onLaunch(()=>{ K.go('wait'); K.showCap('Power on!', 'Here come the robot parts…'); setTimeout(()=>K.go('drop'), 1300); });
  }
};
