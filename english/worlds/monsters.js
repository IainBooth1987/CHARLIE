/* Phonics world: Monsters — friendly monsters gobble up sounds and burp out words */
window.WORLD = {
  id:'monsters', name:'Monsters', icon:'👾', mascot:'👾', rewardIcon:'🍪', dotColour:'#4c1d95',
  items:[['👾','monsters','monster'],['🍪','cookies','cookie'],['🎈','balloons','balloon']],
  menuLine:'Hello from Monster Meadow! Pick a game!',
  cheer:['Monster-tastic!','Yum yum — brilliant!','Gobble gobble — great!','Roar-some!'],
  action:'Stomp like a big friendly monster {n} times!',

  /* ---- 2D background: twilight meadow, stars, friendly blob monsters peeking up ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const stars = Array.from({length:70}, ()=>[Math.random(), Math.random()*.55, Math.random()*6]);
    const peek = [[.08,'#22c55e'],[.9,'#f472b6'],[.5,'#38bdf8']];
    const loop = now => {
      requestAnimationFrame(loop); if(document.hidden) return; const t = (now-t0)/1000;
      const g = ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#2e1065'); g.addColorStop(.6,'#6d28d9'); g.addColorStop(1,'#db2777'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
      stars.forEach(([x,y,p])=>{ ctx.fillStyle = `rgba(255,255,255,${.4+.4*Math.sin(t*2+p)})`; ctx.beginPath(); ctx.arc(x*w, y*h, 1.8*dpr, 0, 7); ctx.fill(); });
      ctx.fillStyle = '#fef9c3'; ctx.beginPath(); ctx.arc(w*.82, h*.14, 46*dpr, 0, 7); ctx.fill();
      ctx.fillStyle = '#6d28d9'; ctx.beginPath(); ctx.arc(w*.82+20*dpr, h*.14-8*dpr, 40*dpr, 0, 7); ctx.fill();
      // hills
      ctx.fillStyle = '#7e22ce'; ctx.beginPath(); ctx.ellipse(w*.25, h*1.02, w*.45, h*.22, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#9333ea'; ctx.beginPath(); ctx.ellipse(w*.8, h*1.05, w*.5, h*.2, 0, 0, 7); ctx.fill();
      // friendly blobs peeking over the hills (menus only), blinking
      if(document.body.dataset.mode!=='game') peek.forEach(([x,c],i)=>{ const up = Math.max(0, Math.sin(t*.5 + i*2.1))*46*dpr, cx = x*w, cy = h - 30*dpr - up;
        ctx.fillStyle = c; ctx.beginPath(); ctx.arc(cx, cy, 44*dpr, Math.PI, 0); ctx.lineTo(cx+44*dpr, h); ctx.lineTo(cx-44*dpr, h); ctx.fill();
        const blink = Math.sin(t*3 + i*4) > .96;
        [-1,1].forEach(s=>{ ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(cx+s*15*dpr, cy-14*dpr, 11*dpr, blink?2*dpr:13*dpr, 0, 0, 7); ctx.fill();
          if(!blink){ ctx.fillStyle = '#1e1b4b'; ctx.beginPath(); ctx.arc(cx+s*15*dpr, cy-12*dpr, 5*dpr, 0, 7); ctx.fill(); } }); });
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D intro: Gobble the monster munches three sound bubbles — y, u, m — and burps out the word: yum! ---- */
  intro(done){
    const K = KIT({done, title:'MONSTER MEADOW', sub:'Gobble is hungry for sounds… what word will he make?', button:'👾 Feed Gobble!',
      passport:['🫧','🫧','🫧','😋'], sky:0x3b1673, fog:[0x4c1d95, 30, 80], hemi:[0xf5d0fe, 0x4c1d95]});
    const {T, scene, cam, toon, blob, box, cyl} = K;
    const WORD = ['y','u','m'], COLS = ['#f59e0b','#06b6d4','#ec4899'];

    /* meadow: soft ground, glowing mushrooms, fireflies, a moon */
    const ground = new T.Mesh(new T.CircleGeometry(60, 48), toon(0x7e3fd0)); ground.rotation.x = -Math.PI/2; scene.add(ground);
    for(let i=0;i<14;i++){ const a = Math.random()*Math.PI*2, r = 16 + Math.random()*20; blob(scene, toon(pick([0x6d28d9,0x8b5cf6,0x9d4edd])), 5+Math.random()*4, 2+Math.random()*2, 5, Math.cos(a)*r, -.5, Math.sin(a)*r - 8); }
    const shrooms = []; for(let i=0;i<16;i++){ const g = new T.Group(); const a = -Math.PI*.9 + i/15*Math.PI*.8 + (Math.random()-.5)*.2, r = 7 + Math.random()*6;
      g.position.set(Math.cos(a)*r, 0, Math.sin(a)*r*.6 - 2); scene.add(g); const s = .6 + Math.random()*.7;
      cyl(g, toon(0xfdf4ff), .18*s, .25*s, 1*s, 0, .5*s, 0, 10);
      const cap = new T.Mesh(new T.SphereGeometry(.7*s, 18, 10, 0, Math.PI*2, 0, Math.PI/2), K.glow(pick([0x22d3ee,0xf472b6,0xa3e635,0xfacc15]))); cap.position.y = 1*s; g.add(cap); shrooms.push(cap); }
    const flies = []; for(let i=0;i<30;i++){ const f = blob(scene, K.glow(0xfef08a), .07, .07, .07, (Math.random()-.5)*24, 1 + Math.random()*6, -8 + Math.random()*10); f.p = Math.random()*6; flies.push(f); }
    blob(scene, K.glow(0xfef9c3), 4, 4, .5, 18, 22, -45);
    const starsG = new T.BufferGeometry(); const sp = []; for(let i=0;i<300;i++) sp.push((Math.random()-.5)*200, 20 + Math.random()*60, -60 - Math.random()*30);
    starsG.setAttribute('position', new T.Float32BufferAttribute(sp, 3)); scene.add(new T.Points(starsG, new T.PointsMaterial({color:0xffffff, size:.5})));

    /* Gobble: round and fluffy, two horns, big eyes, a big mouth */
    const mon = new T.Group(); scene.add(mon);
    const FUR = toon(0x22c55e), BELLY = toon(0xbbf7d0);
    const bodyM = blob(mon, FUR, 1.7, 1.6, 1.5, 0, 1.75, 0);
    for(let i=0;i<60;i++){ const a = Math.random()*Math.PI*2, b = Math.random()*Math.PI; if(Math.sin(a)*Math.sin(b) > .35) continue;   /* keep fur off the face */ const tuft = blob(mon, FUR, .28, .28, .28, 0, 0, 0);
      tuft.position.set(Math.cos(a)*Math.sin(b)*1.62, 1.75 + Math.cos(b)*1.52, Math.sin(a)*Math.sin(b)*1.42); }
    const belly = blob(mon, BELLY, 1.05, 1, .5, 0, 1.4, 1.1);
    [-1,1].forEach(s=>{ const horn = new T.Mesh(new T.ConeGeometry(.22, .8, 14), toon(0xfde68a)); horn.position.set(s*.8, 3.35, 0); horn.rotation.z = -s*.35; mon.add(horn); });
    const eyes = [-.55,.55].map(x=>K.eye(mon, x, 2.55, 1.15, .42, 0x7c3aed));
    const mouth = new T.Group(); mouth.position.set(0, 1.85, 1.38); mon.add(mouth);
    const mouthIn = blob(mouth, new T.MeshBasicMaterial({color:0x3b0a2a}), .75, .3, .2, 0, 0, 0);
    const tongue = blob(mouth, toon(0xf472b6), .4, .14, .12, 0, -.15, .08);
    [-1,1].forEach(s=>box(mouth, toon(0xffffff), .2, .22, .1, s*.28, .22, .14));
    const arms = [-1,1].map(s=>{ const a = K.limb(mon, FUR, .22, .2, .9, s*1.55, 1.9, .2, 0, s*.6); return a; });
    [-1,1].forEach(s=>blob(mon, toon(0x16a34a), .5, .3, .7, s*.7, .25, .3));
    const sh = new T.Mesh(new T.CircleGeometry(1.8, 24), new T.MeshBasicMaterial({color:0, transparent:true, opacity:.25})); sh.rotation.x = -Math.PI/2; sh.position.y = .02; scene.add(sh);

    /* three sound bubbles floating down */
    const SPOTS = [-4.2, 0, 4.2];
    const bubbles = WORD.map((L,i)=>{ const g = new T.Group(); g.position.set(SPOTS[i], 14 + i*2, 0); scene.add(g);
      const shell = new T.Mesh(new T.SphereGeometry(1, 24, 18), new T.MeshLambertMaterial({color:0xe0f2fe, transparent:true, opacity:.35}));
      g.add(shell); const cube = K.letterCube(L, COLS[i], 1.05); g.add(cube); return {g, cube, shell, eaten:false}; });
    /* the word that comes back out */
    const out = WORD.map((L,i)=>{ const c = K.letterCube(L, COLS[i], 1.2); c.visible = false; scene.add(c); return c; });

    let eaten = 0, jump = 0;
    K.run((k, t)=>{
      const S = K.state;
      shrooms.forEach((c,i)=>c.scale.setScalar(1 + Math.sin(t*2 + i)*.06));
      flies.forEach(f=>{ f.position.y += Math.sin(t*2 + f.p)*.01*k; f.position.x += Math.cos(t + f.p)*.01*k; });
      // idle wobble and blinking
      mon.scale.set(1 + Math.sin(t*3)*.02, 1 - Math.sin(t*3)*.02, 1);
      const blink = Math.sin(t*1.7) > .97; eyes.forEach(e=>e.scale.y = blink ? .15 : 1);
      bubbles.forEach((b,i)=>{ if(!b.eaten){ b.g.position.y = K.lerp(b.g.position.y, 5.2 + Math.sin(t*1.5 + i)*.35, .02*k); b.cube.rotation.y += .02*k; } });
      sh.position.x = mon.position.x;
      if(S.phase==='idle'){ const a = t*.2; cam.position.set(Math.sin(a)*12, 5, Math.cos(a)*12); cam.lookAt(0, 3, 0); }
      else if(S.phase==='hunt'){            // shuffle under the next bubble, jump and gobble
        const b = bubbles[eaten]; const tx = b.g.position.x;
        if(Math.abs(mon.position.x - tx) > .05 && !S.jumping){ mon.position.x += Math.sign(tx - mon.position.x)*Math.min(.09*k, Math.abs(tx - mon.position.x));
          mon.position.y = Math.abs(Math.sin(t*10))*.25; mon.rotation.y = Math.sign(tx - mon.position.x)*.35; }
        else if(!S.jumping){ S.jumping = true; S.jt = 0; mon.rotation.y = 0; }
        if(S.jumping){ S.jt += k/60; const f = Math.min(1, S.jt/1.1);
          mon.position.y = Math.sin(f*Math.PI)*2.4; mouth.scale.set(1 + Math.sin(f*Math.PI)*.5, 1 + Math.sin(f*Math.PI)*2.4, 1);
          arms.forEach((a,i)=>a.rotation.z = (i?1:-1)*(.6 + Math.sin(f*Math.PI)*1.8));
          if(f > .45 && !b.eaten){ b.eaten = true; b.shell.visible = false; K.sfx('chomp'); K.dot(eaten); K.showCap(WORD[eaten], ['The first sound!','The next sound…','The last sound!'][eaten]);
            for(let j=0;j<8;j++) K.puff(b.g.position.x, b.g.position.y, b.g.position.z, 0xe0f2fe, .4, .03, .7); }
          if(b.eaten){ b.g.position.lerp(K.v.set(mon.position.x, mon.position.y + 1.85, 1.4), .3*k); b.g.scale.setScalar(Math.max(.01, b.g.scale.x - .06*k)); }
          if(f >= 1){ b.g.visible = false; S.jumping = false; mon.position.y = 0; eaten++; K.go(eaten < 3 ? 'chew' : 'full'); } }
        cam.position.lerp(K.v.set(mon.position.x*.5, 4.6, 12), .04*k); cam.lookAt(K.look.set(mon.position.x*.6, 3.6, 0));
      }
      else if(S.phase==='chew'){
        mouth.scale.set(1, 1 + Math.abs(Math.sin(S.pt*14))*.8, 1); arms.forEach((a,i)=>a.rotation.z = (i?1:-1)*.6);
        if(S.pt > 1.2){ mouth.scale.set(1,1,1); K.go('hunt'); }
      }
      else if(S.phase==='full'){             // back to the middle, rub tummy… BURP
        mon.position.x = K.lerp(mon.position.x, 0, .06*k); mon.rotation.y = 0;
        belly.material.color.setHSL(.35, .7, .75 + Math.sin(S.pt*10)*.1);
        arms.forEach((a,i)=>a.rotation.z = (i?1:-1)*(.2 + Math.sin(S.pt*8)*.2));
        cam.position.lerp(K.v.set(0, 4.2, 11), .05*k); cam.lookAt(K.look.set(0, 3.6, 0));
        if(S.pt > 1.6){ K.go('burp'); K.sfx('pop'); K.showCap('BURP!', 'Here come the sounds…'); }
      }
      else if(S.phase==='burp'){             // the sounds pop out one at a time, in order
        mouth.scale.set(1.4, 2.6, 1);
        out.forEach((c,i)=>{ const st = i*.9; if(S.pt > st){ if(!c.visible){ c.visible = true; c.position.set(0, 1.9, 1.6); K.sfx('pop'); K.showCap(WORD.slice(0,i+1).join(' – '), ''); }
          c.position.lerp(K.v.set(-2.4 + i*2.4, 5.6, 1.2), .08*k); c.rotation.y = K.lerp(c.rotation.y, 0, .1*k); } });
        cam.position.lerp(K.v.set(0, 4.8, 12), .05*k); cam.lookAt(K.look.set(0, 4.2, 0));
        if(S.pt > 3.6){ mouth.scale.set(1,1,1); K.go('word'); K.bigWord('yum!'); K.sfx('word'); K.dot(3); confetti(130); }
      }
      else if(S.phase==='word'){             // happy monster dance
        mon.position.y = Math.abs(Math.sin(t*6))*.6; mon.rotation.y = Math.sin(t*3)*.4;
        arms.forEach((a,i)=>a.rotation.z = (i?1:-1)*(.6 + Math.abs(Math.sin(t*6 + i))*1.6));
        tongue.position.z = .08 + Math.abs(Math.sin(t*6))*.15;
        out.forEach((c,i)=>{ c.position.y = 5.6 + Math.abs(Math.sin(t*5 + i))*.4; });
        if(S.pt > 3.2){ K.go('end'); K.hideBig(); K.showCap('Your turn!', 'Let’s feed Gobble some sounds!'); }
      }
      else if(S.phase==='end'){ mon.position.y = Math.abs(Math.sin(t*6))*.3; if(S.pt > 2.4) K.finish(); }
    });
    K.onLaunch(()=>{ K.go('wait'); K.showCap('Gobble is hungry!', 'Catch the sound bubbles…'); setTimeout(()=>K.go('hunt'), 1400); });
  }
};
