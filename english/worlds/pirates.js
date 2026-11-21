/* Phonics world: Pirates — sail the seas collecting sounds; the treasure is the word */
window.WORLD = {
  id:'pirates', name:'Pirates', icon:'🏴‍☠️', mascot:'🦜', rewardIcon:'💰', dotColour:'#1e3a5f',
  items:[['🏴‍☠️','flags','flag'],['💰','bags of gold','bag of gold'],['🗺️','maps','map']],
  menuLine:'Ahoy, shipmate! Pick a game!',
  cheer:['Ahoy! Brilliant!','Yo ho ho!','Treasure found!','Shiver me timbers — great!'],
  action:'Climb the rigging — reach up high {n} times!',

  /* ---- 2D background: sky, sun, rolling waves and a passing ship ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now(), ship = null;
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const wave = (base, amp, len, sp, col, t) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0,h);
      for(let x=0;x<=w;x+=6*dpr) ctx.lineTo(x, base + Math.sin(x/len + t*sp)*amp); ctx.lineTo(w,h); ctx.fill(); };
    const loop = now => {
      requestAnimationFrame(loop); if(document.hidden) return; const t = (now-t0)/1000;
      const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#38bdf8'); g.addColorStop(.6,'#bae6fd'); g.addColorStop(1,'#fde68a'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      const sg = ctx.createRadialGradient(w*.85, h*.16, 0, w*.85, h*.16, 120*dpr); sg.addColorStop(0,'rgba(255,240,150,1)'); sg.addColorStop(.35,'rgba(255,220,90,.9)'); sg.addColorStop(1,'rgba(255,220,90,0)');
      ctx.fillStyle = sg; ctx.fillRect(0,0,w,h);
      // a little island on the horizon
      ctx.fillStyle = '#f3d59a'; ctx.beginPath(); ctx.ellipse(w*.18, h*.6, 120*dpr, 26*dpr, 0, Math.PI, 0); ctx.fill();
      ctx.strokeStyle = '#7a4a2a'; ctx.lineWidth = 7*dpr; ctx.beginPath(); ctx.moveTo(w*.18, h*.6-20*dpr); ctx.quadraticCurveTo(w*.18+12*dpr, h*.6-70*dpr, w*.18+4*dpr, h*.6-110*dpr); ctx.stroke();
      ctx.fillStyle = '#2f9a46'; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(w*.18+4*dpr + Math.cos(i*1.25)*34*dpr, h*.6-110*dpr + Math.sin(i*1.25)*8*dpr, 40*dpr, 10*dpr, i*1.25, 0, 7); ctx.fill(); }
      // ship sailing past (menus only)
      if(!ship && document.body.dataset.mode!=='game' && Math.random()<.002) ship = {x:-200*dpr};
      if(ship){ ship.x += 1.2*dpr; const x = ship.x, y = h*.63 + Math.sin(t*2)*4*dpr, s = dpr;
        ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+150*s, y); ctx.lineTo(x+130*s, y+30*s); ctx.lineTo(x+20*s, y+30*s); ctx.fill();
        ctx.fillStyle = '#5b3418'; ctx.fillRect(x+72*s, y-100*s, 6*s, 100*s);
        ctx.fillStyle = '#fff7e6'; ctx.beginPath(); ctx.moveTo(x+80*s, y-95*s); ctx.quadraticCurveTo(x+125*s, y-60*s, x+80*s, y-20*s); ctx.fill();
        ctx.beginPath(); ctx.moveTo(x+70*s, y-88*s); ctx.quadraticCurveTo(x+30*s, y-55*s, x+70*s, y-22*s); ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillRect(x+78*s, y-118*s, 26*s, 16*s);
        if(ship.x > w + 200*dpr) ship = null; }
      wave(h*.66, 6*dpr, 50*dpr, 1.2, '#0ea5e9', t);
      wave(h*.74, 8*dpr, 70*dpr, -1, '#0284c7', t);
      wave(h*.84, 10*dpr, 90*dpr, 1.5, '#0369a1', t);
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D intro: sail past three barrels — sh, i, p — land on Treasure Island and open the chest: ship! ---- */
  intro(done){
    const K = KIT({done, title:'TREASURE ISLAND', sub:'Sail the seas and collect the sounds… what word is the treasure?', button:'🏴‍☠️ Set sail!',
      passport:['🛢️','🛢️','🛢️','💰'], sky:0x7cc8f5, fog:[0xbfe6ff, 50, 150], hemi:[0xffffff, 0x2a6a8a]});
    const {T, scene, cam, toon, blob, box, cyl} = K;
    const WORD = ['sh','i','p'], COLS = ['#8b5cf6','#ef4444','#0ea5e9'];

    /* sea with gentle waves */
    const seaG = new T.PlaneGeometry(320, 140, 64, 28); seaG.rotateX(-Math.PI/2);
    const sea = new T.Mesh(seaG, new T.MeshLambertMaterial({color:0x0e5fae, flatShading:true})); scene.add(sea);
    const base = seaG.attributes.position.array.slice();
    const sunM = blob(scene, K.glow(0xfff1a8), 8, 8, 1, 60, 40, -110);

    /* the island */
    const island = new T.Group(); island.position.set(-66, 0, -2); scene.add(island);
    blob(island, toon(0xf3d59a), 16, 2.2, 11, 0, -.6, 0);
    blob(island, toon(0x6cc35a), 9, 2.4, 6, -4, .4, -3);
    function palm(x, z, s, lean){ const g = new T.Group(); g.position.set(x, 1, z); island.add(g); let px = 0, py = 0;
      for(let i=0;i<7;i++){ px += lean*.18*i*s; py += .9*s; cyl(g, toon(0x8b5a2b), .2*s, .26*s, 1*s, px, py-.4*s, 0, 8).rotation.z = -lean*.08*i; }
      for(let i=0;i<7;i++){ const lf = blob(g, toon(i%2?0x2f9a46:0x3fb556), 1.9*s, .1*s, .5*s, 0, 0, 0); const a = i*Math.PI*2/7;
        lf.position.set(px + Math.cos(a)*1.6*s, py - .2*s, Math.sin(a)*1.6*s); lf.rotation.y = -a; lf.rotation.z = -.4; }
      [[.3,0],[-.2,.25],[0,-.3]].forEach(([a,b])=>blob(g, toon(0x6b3e1e), .25*s, .25*s, .25*s, px+a*s, py-.5*s, b*s)); }
    palm(-5, -4, 1.1, 1); palm(-9, -1, .9, -1); palm(6, -5, 1, -.6);
    // the treasure chest (lid hinged at the back)
    const chest = new T.Group(); chest.position.set(2, 1.5, 3); chest.rotation.y = .25; island.add(chest);
    const WOOD = toon(0x8b4a1f), GOLD = toon(0xf5c542);
    box(chest, WOOD, 2.6, 1.4, 1.6, 0, .7, 0); [-1,0,1].forEach(x=>box(chest, GOLD, .18, 1.45, 1.65, x*1.05, .7, 0));
    const lid = new T.Group(); lid.position.set(0, 1.4, -.8); chest.add(lid);
    const lidTop = new T.Mesh(new T.CylinderGeometry(.8, .8, 2.6, 20, 1, false, 0, Math.PI), WOOD); lidTop.rotation.z = Math.PI/2; lidTop.position.set(0, 0, .8); lid.add(lidTop);
    box(lid, GOLD, .4, .5, .15, 0, -.05, 1.62);
    const gold = new T.Group(); gold.position.y = 1.2; gold.visible = false; chest.add(gold);
    for(let i=0;i<22;i++) blob(gold, K.glow(i%5 ? 0xffd84d : 0xfff3a3), .22, .1, .22, (Math.random()-.5)*2, Math.random()*.4, (Math.random()-.5)*1.1);
    const beam = new T.Mesh(new T.ConeGeometry(2.2, 9, 24, 1, true), new T.MeshBasicMaterial({color:0xffe27a, transparent:true, opacity:0, side:T.DoubleSide, depthWrite:false}));
    beam.position.y = 5.5; beam.rotation.x = Math.PI; chest.add(beam);
    // a friendly crab on the beach
    const crab = new T.Group(); crab.position.set(7, 1.1, 5); island.add(crab);
    const CR = toon(0xef4444);
    blob(crab, CR, .9, .5, .7, 0, .5, 0);
    [-1,1].forEach(s=>{ const st = K.cyl(crab, CR, .07, .07, .5, s*.3, 1, .3, 8); K.eye(crab, s*.3, 1.35, .35, .2, 0x1e293b);
      for(let l=0;l<3;l++){ const leg = K.limb(crab, CR, .07, .06, .6, s*.7, .4, -.3 + l*.3, 0, s*1.1); } });
    const claws = [-1,1].map(s=>{ const c = new T.Group(); c.position.set(s*1.05, .7, .5); crab.add(c); blob(c, CR, .35, .3, .3, 0, 0, 0); return c; });

    /* the pirate ship, sailing towards −x */
    const ship = new T.Group(); ship.position.set(36, 0, 0); scene.add(ship);
    const HULL = toon(0x8b5a2b), DARKW = toon(0x5b3418), TRIM = toon(0xf5c542), SAIL = K.toonDS(0xfff7e6);
    box(ship, HULL, 8, 1.8, 3.2, 0, .6, 0);
    const bow = new T.Mesh(new T.CylinderGeometry(0, 1.6, 2.6, 4), HULL); bow.rotation.z = Math.PI/2; bow.rotation.x = Math.PI/4; bow.scale.set(1, 1, 1.05); bow.position.set(-5.2, .75, 0); ship.add(bow);
    box(ship, toon(0xc8935a), 7.8, .15, 2.9, 0, 1.55, 0);                         // deck
    box(ship, DARKW, 2.6, 1.6, 3.2, 2.9, 2.3, 0);                                 // stern cabin
    box(ship, TRIM, 8.1, .18, 3.3, 0, 1.2, 0);
    [-2.2,-.6,1].forEach(x=>{ const p = cyl(ship, toon(0x1f2937), .22, .22, .1, x, .55, 1.62, 14); p.rotation.x = Math.PI/2; });
    cyl(ship, DARKW, .16, .2, 9, .8, 6, 0, 10);                                   // mast
    const sails = [[5.2, 3.2, 5.2],[8.5, 2.2, 3.6]].map(([y, hgt, wd])=>{ const half = Math.asin((wd/2)/5);   // sails run along the ship, bellied towards us
      const s = new T.Mesh(new T.CylinderGeometry(5, 5, hgt, 18, 1, true, -half, half*2), SAIL); s.position.set(.8, y, -4.6); ship.add(s);
      box(ship, DARKW, wd + .4, .14, .14, .8, y + hgt/2, .1); box(ship, DARKW, wd + .4, .14, .14, .8, y - hgt/2, .1); return s; });
    const flagTex = K.canvasTex(256,160,(x,w,h)=>{ x.fillStyle='#111'; x.fillRect(0,0,w,h); x.fillStyle='#fff'; x.beginPath(); x.arc(w/2, h/2-12, 34, 0, 7); x.fill();
      x.fillRect(w/2-22, h/2+10, 44, 22); x.fillStyle='#111'; x.beginPath(); x.arc(w/2-13, h/2-14, 9, 0, 7); x.arc(w/2+13, h/2-14, 9, 0, 7); x.fill();
      x.strokeStyle='#fff'; x.lineWidth = 12; x.beginPath(); x.moveTo(w/2-60, h/2+44); x.lineTo(w/2+60, h/2-58); x.moveTo(w/2-60, h/2-58); x.lineTo(w/2+60, h/2+44); x.stroke(); });
    const flag = new T.Mesh(new T.PlaneGeometry(1.8, 1.1, 8, 1), new T.MeshBasicMaterial({map:flagTex, side:T.DoubleSide})); flag.position.set(1.75, 10.1, 0); ship.add(flag);
    const flagBase = flag.geometry.attributes.position.array.slice();

    /* three barrels with sounds, bobbing ahead */
    const SLOTS = [-3.3, -2, -.7].map(x=>new T.Vector3(x, 1.95, 0));
    const barrels = WORD.map((L,i)=>{ const g = new T.Group(); g.position.set(20 - i*16, 0, -4.2); scene.add(g);
      cyl(g, toon(0x9a6232), .7, .7, 1.4, 0, .3, 0, 18); [-.35,.35].forEach(y=>cyl(g, toon(0x52525b), .73, .73, .12, 0, .3 + y, 0, 18));
      const cube = K.letterCube(L, COLS[i], 1.1); cube.position.set(0, 1.6, 0); g.add(cube);
      return {g, cube, got:false, phase:i}; });

    function seaH(x, z, t){ return Math.sin(x*.18 + t*1.4)*.35 + Math.sin(z*.3 + t*1.1)*.25; }
    let got = 0;
    K.run((k, t)=>{
      const S = K.state;
      // waves
      const p = seaG.attributes.position.array;
      for(let i=0;i<p.length;i+=3) p[i+1] = seaH(base[i], base[i+2], t);
      seaG.attributes.position.needsUpdate = true; seaG.computeVertexNormals();
      // flag flutters
      const fp = flag.geometry.attributes.position.array;
      for(let i=0;i<fp.length;i+=3) fp[i+2] = Math.sin(flagBase[i]*3 + t*7)*.12*(flagBase[i]+.9);
      flag.geometry.attributes.position.needsUpdate = true;
      // ship rides the waves
      ship.position.y = seaH(ship.position.x, 0, t)*.8; ship.rotation.z = Math.sin(t*1.4)*.04; ship.rotation.x = Math.sin(t*1.1)*.03;
      barrels.forEach(b=>{ if(!b.got){ b.g.position.y = seaH(b.g.position.x, b.g.position.z, t)*.9 - .2; b.g.rotation.z = Math.sin(t*2 + b.phase)*.12; } });
      claws.forEach((c,i)=>c.rotation.z = Math.sin(t*4 + i*Math.PI)*.5);
      if(S.phase==='idle'){ const a = t*.15; cam.position.set(36 + Math.sin(a)*18, 7, Math.cos(a)*18); cam.lookAt(36, 3, 0); }
      else if(S.phase==='sail'){
        const stop = -50.5, left = ship.position.x - stop;
        ship.position.x -= Math.min(left, (left > 10 ? .16 : Math.max(.02, left*.016))*k);
        // scoop up barrels as we pass
        barrels.forEach((b,i)=>{
          if(!b.got && b.g.position.x > ship.position.x - 1){ b.got = true; b.t = 0; b.from = b.g.position.clone(); K.sfx('pop');
            for(let j=0;j<6;j++) K.puff(b.from.x, .3, b.from.z, 0xffffff, .6, .05, .8); }
          if(b.got && b.t < 1){ b.t = Math.min(1, b.t + k/50); const to = ship.localToWorld(SLOTS[i].clone());
            b.g.position.lerpVectors(b.from, to, b.t); b.g.position.y += Math.sin(b.t*Math.PI)*4; b.g.rotation.z = 0; b.g.rotation.y = b.t*Math.PI*2;
            if(b.t >= 1){ ship.attach(b.g); b.g.position.copy(SLOTS[i]); b.g.rotation.set(0,0,0); b.g.scale.setScalar(.75); got++; K.dot(i); K.sfx('clank');
              K.showCap(WORD[i], ['The first sound!','The next sound…','The last sound!'][i]); } }
        });
        cam.position.lerp(K.v.set(ship.position.x - 2, 6, 17), .05*k); cam.lookAt(K.look.set(ship.position.x - 4, 3, 0));
        if(left < .05 && got===3){ K.go('land'); K.showCap('Land ho!', 'Treasure Island!'); }
      }
      else if(S.phase==='land'){
        cam.position.lerp(K.v.set(-58, 7, 18), .03*k); cam.lookAt(K.look.set(-62, 2.5, 0));
        if(S.pt > 2.2) K.go('read');
      }
      else if(S.phase==='read'){            // say the sounds from the barrels on deck
        cam.position.lerp(K.v.set(-54, 5.6, 13), .04*k); cam.lookAt(K.look.set(-53.5, 2.8, 0));
        const i = Math.floor((S.pt - .6)/1.1);
        barrels.forEach((b,j)=>{ b.cube.scale.setScalar(K.lerp(b.cube.scale.x, j===i ? 1.5 : 1, .15*k)); });
        if(i>=0 && i<3 && S.last!==i){ S.last = i; K.sfx('pop'); K.showCap(WORD.slice(0,i+1).join(' – '), i===0 ? 's and h together make one sound: sh' : ''); }
        if(S.pt > 4.2){ K.go('open'); K.sfx('word'); K.dot(3); }
      }
      else if(S.phase==='open'){            // the chest bursts open
        lid.rotation.x = K.lerp(lid.rotation.x, -1.5, .08*k);
        if(S.pt > .4 && !S.shown){ S.shown = true; gold.visible = true; K.bigWord('ship!'); confetti(140); }
        beam.material.opacity = K.lerp(beam.material.opacity, .35 + Math.sin(t*5)*.08, .05*k);
        gold.children.forEach((c,i)=>c.position.y = Math.abs(Math.sin(t*4 + i))*.25);
        cam.position.lerp(K.v.set(-56, 6, 14), .03*k); cam.lookAt(K.look.set(-62, 3.5, 1));
        if(S.pt > 3.4){ K.go('end'); K.hideBig(); K.showCap('Your turn!', 'Let’s hunt for sounds!'); }
      }
      else if(S.phase==='end'){ beam.material.opacity = .3 + Math.sin(t*5)*.08; if(S.pt > 2.4) K.finish(); }
    });
    K.onLaunch(()=>{ K.go('wait'); K.showCap('Set sail!', 'Scoop up the sound barrels…'); setTimeout(()=>K.go('sail'), 1300); });
  }
};
