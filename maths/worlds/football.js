/* World pack: Football — objects, look, background and 3D intro, shared by every maths skill */
window.WORLD = {
  id:'football', hide:"in the changing room", box:"the kit bag", name:'Football', icon:'⚽', mascot:'🥅', rewardIcon:'🏆', dotColour:'#14532d',
  items:[['⚽','footballs','football'],['🏆','trophies','trophy'],['👟','trainers','trainer']],
  games:{flash:'Quick Look Kick', flashIcon:'⚽', match:'Same or Different?', matchIcon:'🥅', make:'Fill the Team', makeIcon:'👕'},
  menuLine:'Welcome to the stadium! Pick a game!',
  cheer:['Goal!','What a save!','Top of the league!','Back of the net!'],
  action:'Kick the air {n} times!',

  /* ---- Animated 2D background: mown stripes, pitch lines, floodlight glow, a ball rolling by ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, t0 = performance.now(), ball = null;
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr; };
    resize(); addEventListener('resize', resize);
    const loop = (now)=>{
      requestAnimationFrame(loop); if(document.hidden) return;
      const t = (now-t0)/1000;
      // stripes
      const sw = 70*dpr;
      for(let x=-sw*2, i=0; x<w+sw; x+=sw, i++){ ctx.fillStyle = i%2 ? '#1c7a38' : '#22893f'; ctx.fillRect(x + (t*4*dpr)%(sw*2), 0, sw, h); }
      // pitch lines
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 5*dpr;
      ctx.strokeRect(30*dpr, 30*dpr, w-60*dpr, h-60*dpr);
      ctx.beginPath(); ctx.moveTo(w/2, 30*dpr); ctx.lineTo(w/2, h-30*dpr); ctx.stroke();
      ctx.beginPath(); ctx.arc(w/2, h/2, Math.min(w,h)*.16, 0, 7); ctx.stroke();
      ctx.strokeRect(30*dpr, h*.28, w*.12, h*.44); ctx.strokeRect(w-30*dpr-w*.12, h*.28, w*.12, h*.44);
      // floodlight glow
      [[.1,0],[.9,0]].forEach(([x,y],i)=>{ const g = ctx.createRadialGradient(x*w, y*h, 0, x*w, y*h, Math.max(w,h)*.6);
        g.addColorStop(0, `rgba(255,255,230,${.22+.04*Math.sin(t*1.3+i)})`); g.addColorStop(1,'rgba(255,255,230,0)'); ctx.fillStyle = g; ctx.fillRect(0,0,w,h); });
      // vignette
      const v = ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.3,w/2,h/2,Math.max(w,h)*.75); v.addColorStop(0,'rgba(0,0,0,0)'); v.addColorStop(1,'rgba(0,30,10,.55)');
      ctx.fillStyle = v; ctx.fillRect(0,0,w,h);
      // occasional ball rolling across the bottom
      if(!ball && document.body.dataset.mode!=='game' && Math.random()<.003) ball = {x:-60*dpr, r:22*dpr, y:h-70*dpr};
      if(ball){ ball.x += 5*dpr; ctx.save(); ctx.translate(ball.x, ball.y); ctx.rotate(ball.x/ball.r);
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,ball.r,0,7); ctx.fill();
        ctx.fillStyle='#222'; for(let k=0;k<5;k++){ const a=k*1.256; ctx.beginPath(); ctx.arc(Math.cos(a)*ball.r*.6, Math.sin(a)*ball.r*.6, ball.r*.22, 0, 7); ctx.fill(); }
        ctx.beginPath(); ctx.arc(0,0,ball.r*.25,0,7); ctx.fill(); ctx.restore();
        if(ball.x > w+60*dpr) ball = null; }
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: kick off, dribble past three defenders, score! ---- */
  intro(done){
    const T = THREE, NAME = (settings.name || 'Charlie').toUpperCase();
    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp"><span data-i="0">🛡️</span><span data-i="1">🛡️</span><span data-i="2">🛡️</span><span data-i="3">🥅</span></div>
      <div class="ov" id="ov"><h1>FOOTBALL</h1><div class="sub">Dribble past the defenders… and score!</div>
      <button class="launch" id="launch">⚽ Kick off!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>
      <div class="ov" id="goal" style="display:none"><h1 class="goaltxt">GOAL!</h1></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
    const showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };

    /* ---- sounds: whistle + crowd ---- */
    function whistle(long){ if(!settings.sfx) return; const a = audio(); if(!a) return;
      const o = a.createOscillator(), g = a.createGain(), lfo = a.createOscillator(), lg = a.createGain();
      o.frequency.value = 2600; lfo.frequency.value = 28; lg.gain.value = 160; lfo.connect(lg); lg.connect(o.frequency);
      o.connect(g); g.connect(a.destination); const t = a.currentTime, d = long ? .9 : .35;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.05,t+.02); g.gain.setValueAtTime(.05,t+d-.05); g.gain.linearRampToValueAtTime(0,t+d);
      o.start(t); lfo.start(t); o.stop(t+d); lfo.stop(t+d); }
    function crowd(peak, dur){ if(!settings.sfx) return; const a = audio(); if(!a) return;
      const len = a.sampleRate*dur, buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
      for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
      const src = a.createBufferSource(); src.buffer = buf; const bp = a.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value = 900; bp.Q.value = .6;
      const g = a.createGain(); src.connect(bp); bp.connect(g); g.connect(a.destination); const t = a.currentTime;
      g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(peak,t+.4); g.gain.linearRampToValueAtTime(peak*.6,t+dur*.6); g.gain.linearRampToValueAtTime(0,t+dur);
      src.start(t); }

    /* ---- renderer + scene ---- */
    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0x7fc4ff); scene.fog = new T.Fog(0x9fd2ff, 90, 220);
    const cam = new T.PerspectiveCamera(55, innerWidth/innerHeight, .1, 500);
    scene.add(new T.HemisphereLight(0xdff2ff, 0x2f6b2f, .85));
    const sun = new T.DirectionalLight(0xffffff, .9); sun.position.set(30, 60, 20); scene.add(sun);

    const canvasTex = (w, h, draw)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };

    /* Pitch 68 × 105 m, 10px per metre, goals at z = ±52.5 */
    const pitchTex = canvasTex(680, 1050, (x, w, h)=>{
      for(let i=0;i<21;i++){ x.fillStyle = i%2 ? '#2f9a46' : '#38a94f'; x.fillRect(0, i*50, w, 50); }
      x.strokeStyle = 'rgba(255,255,255,.95)'; x.lineWidth = 3;
      x.strokeRect(6,6,w-12,h-12); x.beginPath(); x.moveTo(6,h/2); x.lineTo(w-6,h/2); x.stroke();
      x.beginPath(); x.arc(w/2,h/2,91.5,0,7); x.stroke(); x.fillStyle='#fff'; x.beginPath(); x.arc(w/2,h/2,4,0,7); x.fill();
      [[6,1],[h-6,-1]].forEach(([y,d])=>{ x.strokeRect(w/2-201.6, d>0?y:y-165, 403.2, 165); x.strokeRect(w/2-91.6, d>0?y:y-55, 183.2, 55);
        x.beginPath(); x.arc(w/2, y+d*110, 4, 0, 7); x.fill();
        x.beginPath(); x.arc(w/2, y+d*110, 91.5, d>0?.65:Math.PI+.65, d>0?Math.PI-.65:2*Math.PI-.65); x.stroke(); });
    });
    const pitch = new T.Mesh(new T.PlaneGeometry(68, 105), new T.MeshLambertMaterial({map:pitchTex}));
    pitch.rotation.x = -Math.PI/2; scene.add(pitch);
    const surround = new T.Mesh(new T.PlaneGeometry(130, 170), new T.MeshLambertMaterial({color:0x2a8a40})); surround.rotation.x = -Math.PI/2; surround.position.y = -.02; scene.add(surround);

    /* Stands with a crowd */
    const crowdTex = canvasTex(512, 128, (x, w, h)=>{ x.fillStyle = '#2b2f45'; x.fillRect(0,0,w,h);
      const cols = ['#e3262f','#ffffff','#0b6fd6','#ffcd00','#f97316','#16a34a','#ec4899','#f5d0a9','#8b5a3c'];
      for(let r=0;r<10;r++) for(let c=0;c<64;c++){ x.fillStyle = cols[Math.random()*cols.length|0]; x.beginPath(); x.arc(c*8+4+(r%2)*4, r*12+7, 3.2, 0, 7); x.fill(); } });
    crowdTex.wrapS = T.RepeatWrapping;
    const stand = (w, x, z, ry)=>{ const t = crowdTex.clone(); t.needsUpdate = true; t.repeat.set(w/30, 1);
      const m = new T.Mesh(new T.BoxGeometry(w, 12, 10), [0,0,0,0,1,1].map(k=>k ? new T.MeshLambertMaterial({map:t}) : new T.MeshLambertMaterial({color:0x3a3f5c})));
      m.position.set(x, 4, z); m.rotation.set(-.35, ry, 0, 'YXZ'); scene.add(m); };
    stand(110, 0, -66, 0); stand(110, 0, 66, Math.PI); stand(140, -46, 0, Math.PI/2); stand(140, 46, 0, -Math.PI/2);
    // advertising boards
    const adTex = canvasTex(512, 64, (x, w, h)=>{ const g = x.createLinearGradient(0,0,w,0); g.addColorStop(0,'#0b6fd6'); g.addColorStop(.5,'#e3262f'); g.addColorStop(1,'#ffcd00');
      x.fillStyle = g; x.fillRect(0,0,w,h); x.fillStyle='#fff'; x.font='bold 40px Fredoka, sans-serif'; x.textAlign='center'; x.fillText("CHARLIE'S LEARNING ⚽", w/2, 46); });
    [[-56.5,0],[56.5,Math.PI]].forEach(([z,r])=>{ const b = new T.Mesh(new T.PlaneGeometry(40,1.4), new T.MeshBasicMaterial({map:adTex})); b.position.set(-22, .7, z); b.rotation.y = r; scene.add(b);
      const b2 = b.clone(); b2.position.x = 22; scene.add(b2); });

    /* Goal with a net */
    const goal = new T.Group(); goal.position.z = -52.5; scene.add(goal);
    const postMat = new T.MeshLambertMaterial({color:0xffffff});
    [[-3.66],[3.66]].forEach(([x])=>{ const p = new T.Mesh(new T.CylinderGeometry(.07,.07,2.44,12), postMat); p.position.set(x,1.22,0); goal.add(p); });
    const bar = new T.Mesh(new T.CylinderGeometry(.07,.07,7.46,12), postMat); bar.rotation.z = Math.PI/2; bar.position.y = 2.44; goal.add(bar);
    const netTex = canvasTex(256, 128, (x,w,h)=>{ x.strokeStyle='rgba(255,255,255,.85)'; x.lineWidth=2; for(let i=0;i<=w;i+=12){ x.beginPath(); x.moveTo(i,0); x.lineTo(i,h); x.stroke(); } for(let j=0;j<=h;j+=12){ x.beginPath(); x.moveTo(0,j); x.lineTo(w,j); x.stroke(); } });
    const netMat = new T.MeshBasicMaterial({map:netTex, transparent:true, side:T.DoubleSide, depthWrite:false});
    const netBack = new T.Mesh(new T.PlaneGeometry(7.32, 2.44, 12, 6), netMat); netBack.position.set(0,1.22,-2); goal.add(netBack);
    const netTop = new T.Mesh(new T.PlaneGeometry(7.32, 2), netMat); netTop.rotation.x = Math.PI/2; netTop.position.set(0,2.44,-1); goal.add(netTop);
    [-3.66,3.66].forEach(x=>{ const s = new T.Mesh(new T.PlaneGeometry(2, 2.44), netMat); s.rotation.y = Math.PI/2; s.position.set(x,1.22,-1); goal.add(s); });
    const netBase = netBack.geometry.attributes.position.array.slice();

    /* Players built from simple shapes */
    function person(shirt, shorts, skin, hair, name, number){
      const g = new T.Group();
      const M = c => new T.MeshLambertMaterial({color:c});
      const legs = [-.14,.14].map(x=>{ const pv = new T.Group(); pv.position.set(x,.95,0);
        const thigh = new T.Mesh(new T.CylinderGeometry(.13,.12,.4,10), M(shorts)); thigh.position.y = -.18; pv.add(thigh);
        const shin = new T.Mesh(new T.CylinderGeometry(.11,.09,.55,10), M(shirt)); shin.position.y = -.62; pv.add(shin);
        const boot = new T.Mesh(new T.BoxGeometry(.16,.12,.32), M(0x111111)); boot.position.set(0,-.88,-.06); pv.add(boot);
        g.add(pv); return pv; });
      const torso = new T.Mesh(new T.CylinderGeometry(.3,.26,.72,14), M(shirt)); torso.position.y = 1.32; g.add(torso);
      const arms = [-.4,.4].map(x=>{ const pv = new T.Group(); pv.position.set(x,1.62,0);
        const arm = new T.Mesh(new T.CylinderGeometry(.08,.07,.58,8), M(shirt)); arm.position.y = -.28; pv.add(arm);
        const hand = new T.Mesh(new T.SphereGeometry(.08,8,8), M(skin)); hand.position.y = -.6; pv.add(hand); g.add(pv); return pv; });
      const head = new T.Mesh(new T.SphereGeometry(.22,16,12), M(skin)); head.position.y = 1.96; g.add(head);
      const hr = new T.Mesh(new T.SphereGeometry(.235,16,12,0,Math.PI*2,0,Math.PI/2), M(hair)); hr.position.y = 1.99; g.add(hr);
      if(name){ const nt = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#fff'; x.textAlign='center'; x.font='bold 46px Fredoka, sans-serif'; x.fillText(name.slice(0,9), w/2, 70);
          x.font='bold 130px Fredoka, sans-serif'; x.fillText(number, w/2, 200); });
        const back = new T.Mesh(new T.PlaneGeometry(.52,.52), new T.MeshBasicMaterial({map:nt, transparent:true})); back.position.set(0,1.36,.305); g.add(back); }
      const sh = new T.Mesh(new T.CircleGeometry(.5, 20), new T.MeshBasicMaterial({color:0x000000, transparent:true, opacity:.25})); sh.rotation.x = -Math.PI/2; sh.position.y = .02; g.add(sh);
      scene.add(g); return {g, legs, arms, phase:Math.random()*6};
    }
    function runAnim(p, speed, k){ p.phase += speed*k; const s = Math.sin(p.phase);
      p.legs[0].rotation.x = s*.9; p.legs[1].rotation.x = -s*.9; p.arms[0].rotation.x = -s*.7; p.arms[1].rotation.x = s*.7; p.g.position.y = Math.abs(Math.cos(p.phase))*.06; }

    const hero = person(0xe3262f, 0xffffff, 0xf2c29b, 0xc2571a, NAME, '10');   // red shirt, ginger hair
    const DEF_Z = [-10, -20, -30];
    const defenders = DEF_Z.map((z,i)=>{ const d = person(0x0b6fd6, 0x0a3d91, [0x8d5524,0xf1c27d,0xc68642][i], 0x2b1b0e);
      d.g.position.set(i%2 ? -.6 : .8, 0, z); d.g.rotation.y = 0; d.home = d.g.position.clone(); d.state = 'wait'; d.t = 0; return d; });
    window.__fbIntro = {defenders:()=>defenders, keeper:()=>keeper, T};   // used by automated checks only
    const keeper = person(0x16a34a, 0x111111, 0xe0ac69, 0x3b2314); keeper.g.position.set(0,0,-51.6); keeper.g.rotation.y = Math.PI;

    /* Ball */
    const ballTex = canvasTex(256,128,(x,w,h)=>{ x.fillStyle='#fff'; x.fillRect(0,0,w,h); x.fillStyle='#1a1a1a';
      for(let i=0;i<14;i++){ const cx=(i%7)*38+((i/7|0)%2)*19+10, cy=(i/7|0)*64+32; x.beginPath(); for(let k=0;k<5;k++){ const a=k*1.2566-1.57; x.lineTo(cx+Math.cos(a)*13, cy+Math.sin(a)*13); } x.fill(); } });
    const ball = new T.Mesh(new T.SphereGeometry(.22, 24, 16), new T.MeshLambertMaterial({map:ballTex})); scene.add(ball);
    const ballSh = new T.Mesh(new T.CircleGeometry(.24, 16), new T.MeshBasicMaterial({color:0, transparent:true, opacity:.3})); ballSh.rotation.x = -Math.PI/2; ballSh.position.y = .015; scene.add(ballSh);

    /* Dribble path: kick off at the centre spot, weave round three defenders, shoot from the edge of the box */
    const path = new T.CatmullRomCurve3([[0,0],[0,-4.5],[-3.2,-10],[0,-15],[3.2,-20],[0,-25],[-3.2,-30],[-1.4,-35.5]].map(([x,z])=>new T.Vector3(x,0,z)));
    const pathLen = path.getLength();

    /* ---- animation ---- */
    let phase = 'idle', t = 0, phaseT = 0, u = 0, raf = 0, ended = false, last = performance.now(), passed = 0;
    let shot = null, scored = false;
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const lerp = (a,b,k)=>a+(b-a)*k, tmp = new T.Vector3(), look = new T.Vector3();
    hero.g.position.set(0,0,0);

    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67)*(window.INTRO_SPEED||1); last = now; t += k/60; phaseT += k/60;
      // keeper shuffles on the line
      if(phase!=='shot' && phase!=='goal' && phase!=='finale'){ keeper.g.position.x = Math.sin(t*1.6)*1.2; runAnim(keeper, .12, k); }

      if(phase==='idle'){
        // keepy-uppy on the centre spot, camera circles the stadium
        hero.g.rotation.y = 0; hero.legs[0].rotation.x = Math.max(0, Math.sin(t*5))*-.8;
        ball.position.set(0, .3 + Math.abs(Math.sin(t*5))*1.4, -.35); ball.rotation.x += .1*k;
        const a = t*.12; cam.position.set(Math.sin(a)*34, 22, Math.cos(a)*34 - 8); cam.lookAt(0, 0, -12);
      }
      else if(phase==='kickoff'){
        ball.position.set(0,.22,-.4); hero.g.rotation.y = 0;
        cam.position.lerp(tmp.set(0, 4.5, 8), .04*k); cam.lookAt(0, 1, -10);
      }
      else if(phase==='dribble'){
        u = Math.min(1, u + (4.6/pathLen)*k/60);
        const p = path.getPointAt(u), tan = path.getTangentAt(u);
        hero.g.position.x = p.x; hero.g.position.z = p.z; hero.g.rotation.y = Math.atan2(-tan.x, -tan.z);
        runAnim(hero, .32, k);
        // ball stays just ahead, with little touches
        const ahead = path.getPointAt(Math.min(1, u + .018 + .006*Math.max(0,Math.sin(t*9))));
        ball.position.set(ahead.x, .22, ahead.z); ball.rotation.x -= .35*k;
        // defenders lunge — and miss
        defenders.forEach((d,i)=>{
          const dz = hero.g.position.z - d.home.z;
          if(d.state==='wait') d.g.rotation.y = Math.atan2(-(hero.g.position.x - d.g.position.x), -(hero.g.position.z - d.g.position.z));
          if(d.state==='wait' && dz < 5.5){ d.state = 'lunge'; d.t = 0; d.dir = Math.sign(hero.g.position.x - d.home.x) || 1; }
          if(d.state==='lunge'){ d.t += k/60;
            // slide tackle: tip over sideways and skid along the grass (lifted so nothing goes underground),
            // lie there for a moment, then get back up
            const down = d.t < 1.7 ? Math.min(1, d.t/.4) : Math.max(0, 1 - (d.t-1.7)/.6);
            const ang = 1.3*down;
            d.g.position.x = d.home.x + d.dir*Math.min(1.8, d.t*4.5);
            d.g.rotation.z = ang*-d.dir;
            d.g.position.y = .5*Math.sin(ang);
            d.legs[0].rotation.x = -1.1*down; d.legs[1].rotation.x = .3*down;
            d.arms[0].rotation.x = d.arms[1].rotation.x = -.6*down; }
          if(dz < -1.2 && passed===i){ passed++; const n = ['One!','Two!','Three!'][i];
            showCap(n, ['Past the first defender!','Past the second!','Past the third!'][i]); speak(n, 1); crowd(.05, 1.2);
            const dot = pp.querySelector(`[data-i="${i}"]`); if(dot) dot.classList.add('on'); }
        });
        // camera follows from behind
        cam.position.lerp(tmp.set(hero.g.position.x*.6, 5, hero.g.position.z + 10), .06*k);
        cam.lookAt(look.set(hero.g.position.x*.5, 1, hero.g.position.z - 10));
        if(u >= 1){ phase = 'shot'; phaseT = 0; showCap(`${settings.name} shoots…`, ''); speak('Shoot!', 1.05);
          shot = {from: ball.position.clone(), to: new T.Vector3(2.75, 2.0, -53.6)}; hero.legs[1].rotation.x = -1.4; }
      }
      else if(phase==='shot'){
        const d = Math.min(1, phaseT/.85);
        ball.position.lerpVectors(shot.from, shot.to, d); ball.position.y = lerp(shot.from.y, shot.to.y, d) + Math.sin(d*Math.PI)*1.3; ball.rotation.y += .5*k;
        hero.legs[1].rotation.x = lerp(hero.legs[1].rotation.x, .6, .08*k);
        // keeper dives the wrong way
        keeper.g.position.x = lerp(keeper.g.position.x, -2.6, .09*k); keeper.g.rotation.z = lerp(keeper.g.rotation.z, 1.25, .08*k); keeper.g.position.y = Math.sin(Math.min(1,d*1.2)*Math.PI)*.8;
        cam.position.lerp(tmp.set(-1, 3.2, -27), .05*k); cam.lookAt(look.set(0, 1.4, -52));
        if(d >= 1 && !scored){ scored = true; phase = 'goal'; phaseT = 0; goalMoment(); }
      }
      else if(phase==='goal'){
        // net bulges where the ball hit
        const pos = netBack.geometry.attributes.position.array, bulge = Math.max(0, 1 - phaseT*1.2);
        for(let i=0;i<pos.length;i+=3){ const dx = netBase[i]-2.75, dy = netBase[i+1]-0.78; pos[i+2] = netBase[i+2] - .9*bulge*Math.exp(-(dx*dx+dy*dy)/2); }
        netBack.geometry.attributes.position.needsUpdate = true;
        ball.position.y = Math.max(.22, ball.position.y - .05*k); ball.position.z = Math.max(-54.3, ball.position.z - .02*k);
        // celebration: run towards the camera with arms up
        hero.g.rotation.y = lerp(hero.g.rotation.y, Math.PI, .05*k); hero.arms.forEach(a=>a.rotation.x = lerp(a.rotation.x, -2.8, .1*k));
        hero.g.position.z += .06*k; hero.legs[0].rotation.x = Math.sin(t*14)*.8; hero.legs[1].rotation.x = -Math.sin(t*14)*.8; hero.g.position.y = Math.abs(Math.sin(t*7))*.35;
        cam.position.lerp(tmp.set(hero.g.position.x + 3, 2.6, hero.g.position.z + 7), .03*k); cam.lookAt(look.set(hero.g.position.x, 1.4, hero.g.position.z));
        if(phaseT > 3.6){ phase = 'finale'; phaseT = 0; wrap.querySelector('#goal').style.display = 'none';
          showCap('Your turn!', "Let's play football maths!"); speak("Your turn! Let's play football maths!", 1); }
      }
      else if(phase==='finale'){
        hero.g.position.y = Math.abs(Math.sin(t*7))*.3;
        cam.position.lerp(tmp.set(hero.g.position.x + 1.5, 2, hero.g.position.z + 4), .03*k); cam.lookAt(look.set(hero.g.position.x, 1.6, hero.g.position.z));
        if(phaseT > 2.8) finish();
      }
      ballSh.position.x = ball.position.x; ballSh.position.z = ball.position.z;
      renderer.render(scene, cam);
    }
    function goalMoment(){
      wrap.querySelector('#goal').style.display = 'flex'; cap.classList.remove('show');
      const dot = pp.querySelector('[data-i="3"]'); if(dot) dot.classList.add('on');
      speak('Goal! What a goal!', 1); crowd(.16, 3.2); whistle(false); confetti(140);
    }
    function finish(){
      if(ended) return; ended = true; stopVoice();
      wrap.classList.add('out');
      setTimeout(()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); wrap.remove(); }, 750);
      done();
    }
    wrap.querySelector('#launch').onclick = ()=>{
      if(phase!=='idle') return; sfx.click(); audio();
      wrap.querySelector('#ov').classList.add('go'); phase = 'kickoff'; phaseT = 0; pp.classList.add('show');
      speak('Here we go! Can you beat three defenders?', 1); crowd(.04, 2);
      setTimeout(()=>{ whistle(true); showCap('Kick off!', 'Can you beat three defenders?'); }, 1300);
      setTimeout(()=>{ phase = 'dribble'; phaseT = 0; }, 2400);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    requestAnimationFrame(frame);
    speak('Welcome to the stadium! Tap kick off!');
  }
};
