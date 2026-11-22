/* World pack: Space — objects, look, background and 3D intro, shared by every maths skill */
window.WORLD = {
  id:'space', hide:"behind the planet", box:"the space bag", name:'Space', icon:'🚀', mascot:'🧑‍🚀', rewardIcon:'🛸', dotColour:'#2a2f8f',
  items:[['⭐','stars','star'],['🚀','rockets','rocket'],['🪐','planets','planet']],
  games:{flash:'Star Flash', flashIcon:'🌟', match:'Same or Different?', matchIcon:'🔭', make:'Build a Galaxy', makeIcon:'🛰️'},
  menuLine:'Welcome, space cadet! Pick a mission!',
  cheer:['Out of this world!','Blast off!','Stellar!','Rocket power!'],
  action:'Jump like a rocket {n} times!',

  /* ---- Animated 2D background: twinkling stars, drifting nebula, shooting stars ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, stars = [], shoot = null, t0 = performance.now();
    const resize = ()=>{ dpr = Math.min(1.5, window.devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr;
      stars = Array.from({length:Math.round(innerWidth*innerHeight/5000)}, ()=>({x:Math.random()*w, y:Math.random()*h, r:(Math.random()*1.4+.3)*dpr,
        p:Math.random()*Math.PI*2, s:.5+Math.random()*1.5, v:(Math.random()*.06+.01)*dpr, c:pick(['#ffffff','#cfe0ff','#ffe9b8','#e6d4ff'])})); };
    resize(); addEventListener('resize', resize);
    const loop = (now)=>{
      if(document.hidden){ requestAnimationFrame(loop); return; }
      const t = (now - t0)/1000; ctx.clearRect(0,0,w,h);
      // nebula clouds
      [[.2,.25,'rgba(124,92,255,.16)'],[.85,.7,'rgba(56,140,255,.14)'],[.6,.15,'rgba(255,90,190,.08)']].forEach(([x,y,c],i)=>{
        const cx = (x + Math.sin(t*.05+i)*.03)*w, cy = (y + Math.cos(t*.04+i)*.03)*h, R = Math.max(w,h)*.45;
        const g = ctx.createRadialGradient(cx,cy,0,cx,cy,R); g.addColorStop(0,c); g.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); });
      for(const s of stars){
        s.y += s.v; if(s.y > h) s.y = 0;
        ctx.globalAlpha = .45 + .55*Math.abs(Math.sin(t*s.s + s.p)); ctx.fillStyle = s.c;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      ctx.globalAlpha = 1;
      if(!shoot && Math.random() < .004) shoot = {x:Math.random()*w*.7, y:Math.random()*h*.3, l:0};
      if(shoot){ shoot.l += 14*dpr; const x = shoot.x + shoot.l, y = shoot.y + shoot.l*.45;
        const g = ctx.createLinearGradient(x-120*dpr, y-54*dpr, x, y); g.addColorStop(0,'rgba(255,255,255,0)'); g.addColorStop(1,'rgba(255,255,255,.9)');
        ctx.strokeStyle = g; ctx.lineWidth = 2*dpr; ctx.beginPath(); ctx.moveTo(x-120*dpr, y-54*dpr); ctx.lineTo(x, y); ctx.stroke();
        if(x > w || y > h) shoot = null; }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: a rocket among planets, then blast off through hyperspace ---- */
  intro(done){
    const T = THREE;
    /* The planet tour — simple facts a 4-year-old can hold on to */
    const TOUR = [
      {name:'Earth',   em:'🌍', fact:'That\'s Earth — our home!',               r:9,  tex:'earth',   clouds:true, glow:0x6fb6ff},
      {name:'The Moon',em:'🌑', fact:'The Moon is grey and bumpy.',            r:4,  tex:'moon',    glow:0xdddddd},
      {name:'Mars',    em:'🔴', fact:'Mars is the red planet.',                r:6,  tex:'mars',    glow:0xff7a4d},
      {name:'Jupiter', em:'🟠', fact:'Jupiter is the biggest planet of all!',  r:16, tex:'jupiter', glow:0xffc98a},
      {name:'Saturn',  em:'🪐', fact:'Saturn has beautiful rings.',            r:11, tex:'saturn',  rings:true, glow:0xffe3a1},
      {name:'Neptune', em:'🔵', fact:'Neptune is cold, blue and far, far away.', r:8, tex:'neptune', glow:0x5b8cff}
    ];

    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp">${TOUR.map((p,i)=>`<span data-i="${i}">${p.em}</span>`).join('')}</div>
      <div class="ov" id="ov"><h1>SPACE</h1><div class="sub">Fly past the planets, then spot the stars!</div>
      <button class="launch" id="launch">🚀 Blast off!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap');
    const showCap = (name, fact)=>{ cap.querySelector('.pn').textContent = name; cap.querySelector('.pf').textContent = fact;
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };

    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.fog = new T.FogExp2(0x050818, .0016);
    const cam = new T.PerspectiveCamera(60, innerWidth/innerHeight, .1, 3000); cam.position.set(0, 2, 22);
    scene.add(new T.AmbientLight(0x8899ff, .45));
    const sun = new T.DirectionalLight(0xfff4e0, 1.3); sun.position.set(30, 20, 25); scene.add(sun);
    const glow = new T.PointLight(0xff8a3d, 2.2, 30); scene.add(glow);

    /* ---- Procedural planet textures (no image files needed) ---- */
    function tex(kind){
      const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d');
      const blob = (cx, cy, rx, ry, col)=>{ x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, Math.random()*3, 0, 7); x.fill(); };
      const bands = cols => { const h = 256/cols.length; cols.forEach((cl,i)=>{ x.fillStyle = cl; x.fillRect(0, i*h, 512, h+1); });
        for(let i=0;i<60;i++){ x.fillStyle = `rgba(255,255,255,${Math.random()*.08})`; x.fillRect(0, Math.random()*256, 512, 2+Math.random()*4); } };
      if(kind==='earth'){
        x.fillStyle = '#2466c9'; x.fillRect(0,0,512,256);
        for(let i=0;i<9;i++){ const cx = Math.random()*512, cy = 50+Math.random()*156;
          for(let k=0;k<7;k++) blob(cx+(Math.random()-.5)*70, cy+(Math.random()-.5)*40, 14+Math.random()*30, 8+Math.random()*18, k%3?'#3fa34d':'#7a9a3a'); }
        x.fillStyle = '#f4f8ff'; x.fillRect(0,0,512,14); x.fillRect(0,242,512,14);
      } else if(kind==='clouds'){
        for(let i=0;i<45;i++) blob(Math.random()*512, 20+Math.random()*216, 8+Math.random()*26, 2+Math.random()*5, 'rgba(255,255,255,.4)');
      } else if(kind==='moon'){
        x.fillStyle = '#a9adb5'; x.fillRect(0,0,512,256);
        for(let i=0;i<20;i++) blob(Math.random()*512, Math.random()*256, 20+Math.random()*40, 14+Math.random()*30, 'rgba(90,95,105,.35)');
        for(let i=0;i<70;i++){ const cx = Math.random()*512, cy = Math.random()*256, r = 2+Math.random()*10;
          x.fillStyle = 'rgba(70,72,80,.55)'; x.beginPath(); x.arc(cx,cy,r,0,7); x.fill();
          x.strokeStyle = 'rgba(230,232,238,.5)'; x.lineWidth = 1.5; x.beginPath(); x.arc(cx-1,cy-1,r,3.6,5.8); x.stroke(); }
      } else if(kind==='mars'){
        x.fillStyle = '#c4532a'; x.fillRect(0,0,512,256);
        for(let i=0;i<30;i++) blob(Math.random()*512, Math.random()*256, 10+Math.random()*50, 6+Math.random()*20, pick(['rgba(120,40,20,.45)','rgba(230,140,90,.35)']));
        x.fillStyle = '#fbeee6'; x.fillRect(0,0,512,10); x.fillRect(0,248,512,8);
      } else if(kind==='jupiter'){
        bands(['#e9d3b0','#c99a6b','#f1e2c6','#b87a4b','#e6c9a0','#a86c42','#f0dcbc','#c9935f','#e9d3b0','#b98257']);
        blob(330, 165, 34, 16, '#c0502f'); blob(330, 165, 22, 9, '#d8754f');
      } else if(kind==='saturn'){
        bands(['#f3e1b0','#e3c88f','#f6e8c2','#d9b978','#f1dca8','#e0c286','#f4e4ba','#d6b673']);
      } else if(kind==='neptune'){
        bands(['#3d6fe0','#2f5fd0','#4a7cf0','#2a55c4','#3f72e6','#2c58c8']);
        blob(180, 150, 30, 12, 'rgba(20,40,120,.6)');
      }
      const t = new T.CanvasTexture(c); return t;
    }
    function glowSprite(color, size){
      const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
      const col = new T.Color(color); const rgb = `${col.r*255|0},${col.g*255|0},${col.b*255|0}`;
      const g = x.createRadialGradient(64,64,30,64,64,64); g.addColorStop(0,`rgba(${rgb},.55)`); g.addColorStop(1,`rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(0,0,128,128);
      const s = new T.Sprite(new T.SpriteMaterial({map:new T.CanvasTexture(c), transparent:true, depthWrite:false, blending:T.AdditiveBlending}));
      s.scale.set(size, size, 1); return s;
    }

    /* ---- Starfield (round sprites, recycled as we fly) ---- */
    const N = 2600, pos = new Float32Array(N*3), col = new Float32Array(N*3);
    const palette = [[1,1,1],[.8,.88,1],[1,.92,.75],[.9,.82,1]];
    for(let i=0;i<N;i++){ pos[i*3] = (Math.random()-.5)*500; pos[i*3+1] = (Math.random()-.5)*360; pos[i*3+2] = -Math.random()*900 + 60; col.set(pick(palette), i*3); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.BufferAttribute(pos,3)); sg.setAttribute('color', new T.BufferAttribute(col,3));
    const spr = document.createElement('canvas'); spr.width = spr.height = 64; const sc = spr.getContext('2d');
    const rg = sc.createRadialGradient(32,32,0,32,32,32); rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(.25,'rgba(255,255,255,.85)'); rg.addColorStop(1,'rgba(255,255,255,0)');
    sc.fillStyle = rg; sc.fillRect(0,0,64,64);
    const starMat = new T.PointsMaterial({size:1.6, map:new T.CanvasTexture(spr), vertexColors:true, transparent:true, depthWrite:false, blending:T.AdditiveBlending});
    scene.add(new T.Points(sg, starMat));

    /* ---- Opening scene: a few distant planets ---- */
    const simple = (r, c, x, y, z, ring) => {
      const m = new T.Mesh(new T.SphereGeometry(r, 48, 32), new T.MeshStandardMaterial({color:c, roughness:.85}));
      m.position.set(x,y,z); scene.add(m);
      if(ring){ const rr = new T.Mesh(new T.RingGeometry(r*1.4, r*2.1, 64), new T.MeshBasicMaterial({color:ring, side:T.DoubleSide, transparent:true, opacity:.7})); rr.rotation.x = 1.25; m.add(rr); }
      return m;
    };
    const opening = [simple(6,0x7c5cff,-18,6,-30,0xd9c8ff), simple(3.2,0xff7a59,16,-6,-18), simple(2,0x3bc7ff,12,9,-40)];

    /* ---- Tour planets, lined up along the flight path ---- */
    const tour = TOUR.map((p,i)=>{
      const g = new T.Group();
      const m = new T.Mesh(new T.SphereGeometry(p.r, 64, 48), new T.MeshStandardMaterial({map:tex(p.tex), roughness:.9, metalness:0}));
      m.rotation.z = .25; g.add(m);
      if(p.clouds){ const cl = new T.Mesh(new T.SphereGeometry(p.r*1.02, 48, 32), new T.MeshStandardMaterial({map:tex('clouds'), transparent:true, depthWrite:false})); g.add(cl); g.userData.clouds = cl; }
      if(p.rings){ [[1.35,1.7,0xe6d3a3,.85],[1.75,2.05,0xcdb37f,.7],[2.1,2.3,0xf1e6c8,.45]].forEach(([a,b,c,o])=>{
        const r = new T.Mesh(new T.RingGeometry(p.r*a, p.r*b, 96), new T.MeshBasicMaterial({color:c, side:T.DoubleSide, transparent:true, opacity:o}));
        r.rotation.x = 1.2; r.rotation.y = .2; g.add(r); }); }
      const halo = glowSprite(p.glow, p.r*3.1); g.add(halo);
      const side = i%2 ? -1 : 1;
      g.position.set(side*(p.r + 9), (i%3-1)*3, -160 - i*190);
      g.userData = Object.assign(g.userData, {p, i, said:false, spin:m});
      scene.add(g); return g;
    });

    /* ---- Rocket ---- */
    const rocket = new T.Group();
    const white = new T.MeshStandardMaterial({color:0xf3f5ff, roughness:.35, metalness:.25});
    const red = new T.MeshStandardMaterial({color:0xe3262f, roughness:.4, metalness:.2});
    rocket.add(new T.Mesh(new T.CylinderGeometry(1.1, 1.25, 5, 32), white));
    const nose = new T.Mesh(new T.ConeGeometry(1.1, 2.2, 32), red); nose.position.y = 3.6; rocket.add(nose);
    const win = new T.Mesh(new T.SphereGeometry(.5, 24, 16), new T.MeshStandardMaterial({color:0x5ec8ff, emissive:0x1b6fd6, emissiveIntensity:.6, roughness:.1}));
    win.position.set(0, 1, 1.05); win.scale.z = .5; rocket.add(win);
    const rim = new T.Mesh(new T.TorusGeometry(.55, .12, 12, 32), red); rim.position.set(0,1,1.08); rocket.add(rim);
    for(let i=0;i<3;i++){ const fin = new T.Mesh(new T.BoxGeometry(.2, 1.8, 1.3), red); const a = i*Math.PI*2/3;
      fin.position.set(Math.sin(a)*1.25, -2, Math.cos(a)*1.25); fin.rotation.y = a; rocket.add(fin); }
    const flame = new T.Mesh(new T.ConeGeometry(.8, 2.6, 24), new T.MeshBasicMaterial({color:0xffb43d, transparent:true, opacity:.9}));
    flame.position.y = -3.9; flame.rotation.x = Math.PI; rocket.add(flame);
    const core = new T.Mesh(new T.ConeGeometry(.45, 1.6, 20), new T.MeshBasicMaterial({color:0xfff1b0})); core.position.y = -3.4; core.rotation.x = Math.PI; rocket.add(core);
    rocket.rotation.z = -.35; rocket.rotation.x = .15; scene.add(rocket);

    /* ---- Animation ---- */
    let phase = 'idle', speed = .08, t = 0, raf = 0, phaseT = 0, ended = false, last = performance.now();
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const lerp = (a,b,k)=>a+(b-a)*k;
    const look = new T.Vector3(0,0,0);
    const pp = wrap.querySelector('#pp');

    function moveWorld(d){
      const p = sg.attributes.position.array;
      for(let i=0;i<N;i++){ p[i*3+2] += d; if(p[i*3+2] > cam.position.z + 5) p[i*3+2] -= 900; }
      sg.attributes.position.needsUpdate = true;
      opening.forEach(m=>m.position.z += d);
      tour.forEach(g=>g.position.z += d);
    }
    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67)*(window.INTRO_SPEED||1); last = now; t += k/60; phaseT += k/60;
      opening.forEach((m,i)=>m.rotation.y += .002*k);
      tour.forEach(g=>{ g.userData.spin.rotation.y += .003*k; if(g.userData.clouds) g.userData.clouds.rotation.y += .0045*k; });
      flame.scale.set(1, .85 + Math.random()*.35 + (phase!=='idle'?.8:0), 1);
      glow.position.copy(rocket.position).add(new T.Vector3(0,0,4)); glow.intensity = 1.6 + Math.random()*.8;

      if(phase==='idle'){
        moveWorld(speed*k*.2);
        rocket.position.y = Math.sin(t*1.4)*.6; rocket.rotation.y += .01*k;
        cam.position.x = Math.sin(t*.25)*3; cam.lookAt(0,0,0);
      } else if(phase==='count'){
        rocket.position.x = (Math.random()-.5)*.25; rocket.rotation.y += .03*k;
        cam.position.x += (0 - cam.position.x)*.05; cam.lookAt(0,0,0);
      } else if(phase==='turn'){
        // rocket swings round to fly forward; camera tucks in behind
        const e = Math.min(1, phaseT/1.4);
        rocket.rotation.x = lerp(rocket.rotation.x, -Math.PI/2, .06*k); rocket.rotation.z = lerp(rocket.rotation.z, 0, .06*k);
        rocket.rotation.y = lerp(rocket.rotation.y, 0, .06*k); rocket.position.set(0, lerp(rocket.position.y, -1.2, .05*k), 0);
        cam.position.set(lerp(cam.position.x, 0, .05*k), lerp(cam.position.y, 3.2, .05*k), lerp(cam.position.z, 13, .05*k));
        look.set(0, 0, -40); cam.lookAt(look);
        speed = lerp(speed, 1.6, .03*k); moveWorld(speed*k);
        if(e>=1){ phase = 'tour'; phaseT = 0; }
      } else if(phase==='tour'){
        // slow down beside each planet, speed up between them
        const next = tour.filter(g=>g.position.z < 25).sort((a,b)=>b.position.z-a.position.z)[0];
        let target = 1.7;
        if(next){
          const dz = Math.abs(next.position.z);
          target = .26 + 1.45*Math.max(0, Math.min(1, (dz-12)/110));
          if(!next.userData.said && next.position.z > -95){
            next.userData.said = true; const P = next.userData.p;
            showCap(P.name, P.fact); speak(P.fact, .9); tone(660,0,.12,'sine',.06); tone(990,.1,.16,'sine',.06);
            const dot = pp.querySelector(`[data-i="${next.userData.i}"]`); if(dot) dot.classList.add('on');
          }
          // bank the rocket gently towards the planet
          rocket.rotation.y = lerp(rocket.rotation.y, Math.sign(next.position.x)*-.25, .02*k);
        } else {
          phase = 'finale'; phaseT = 0; showCap('Next stop…', 'Let\'s go and spot some stars!'); speak('Next stop. Let\'s go and spot some stars!', .95);
        }
        speed = lerp(speed, target, .04*k);
        moveWorld(speed*k);
        rocket.position.x = Math.sin(t*.9)*.8; rocket.position.y = -1.2 + Math.sin(t*1.3)*.4; rocket.rotation.z = Math.sin(t*.9)*.15;
        cam.position.x = lerp(cam.position.x, rocket.position.x*.6, .04*k); cam.lookAt(look.set(rocket.position.x*.3, 0, -40));
      } else if(phase==='finale'){
        moveWorld(speed*k); speed = lerp(speed, 2, .03*k);
        if(phaseT > 2.6){ phase = 'warp'; phaseT = 0; cap.classList.remove('show');
          if(settings.sfx){ for(let i=0;i<10;i++) tone(120+i*60, i*.12, .25, 'sawtooth', .025); } }
      } else if(phase==='warp'){
        speed = Math.min(16, speed*1.07 + .05); moveWorld(speed*k);
        starMat.size = 1.6 + Math.min(1.6, phaseT*1.2);
        rocket.position.z -= speed*.3*k;
        cam.fov = Math.min(110, cam.fov + .6*k); cam.updateProjectionMatrix();
        cam.position.x = (Math.random()-.5)*.3; cam.position.y = 3.2 + (Math.random()-.5)*.3;
        if(phaseT > 2.2) finish();
      }
      renderer.render(scene, cam);
    }
    function finish(){
      if(ended) return; ended = true;
      stopVoice();
      wrap.classList.add('out');
      setTimeout(()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); wrap.remove(); }, 750);
      done();
    }
    const ov = wrap.querySelector('#ov');
    wrap.querySelector('#launch').onclick = ()=>{
      if(phase!=='idle') return; sfx.click(); audio();
      phase = 'count'; ov.classList.add('go');
      const cd = document.createElement('div'); cd.className = 'ov'; cd.innerHTML = '<h1 id="cdn">3</h1>'; wrap.appendChild(cd);
      speak('Three, two, one, blast off!', 1);
      [['2',700],['1',1400],['🚀',2100]].forEach(([s,ms])=>setTimeout(()=>{ const e = document.getElementById('cdn'); if(e) e.textContent = s; tone(s==='🚀'?880:440, 0, .15, 'square', .06); }, ms));
      setTimeout(()=>{ cd.remove(); phase = 'turn'; phaseT = 0; pp.classList.add('show');
        if(settings.sfx){ for(let i=0;i<6;i++) tone(90+i*30, i*.1, .3, 'sawtooth', .02); } }, 2300);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    requestAnimationFrame(frame);
    speak('Welcome to space! Tap blast off!');
  }
};
