/* World pack: Pets with Cooper — objects, look, background and 3D intro, shared by every maths skill */
const WBASE = (document.currentScript && document.currentScript.src) ? document.currentScript.src.replace(/[^/]*$/,'') : '../worlds/';
const COOPER_IMG = '<img src="' + WBASE + 'media/cooper-face.webp" alt="Cooper the dog">';
window.WORLD = {
  id:'pets', hide:"in the kennel", box:"Cooper's toy box", name:'Pets', icon:'🐶', mascot:COOPER_IMG, rewardIcon:COOPER_IMG, dotColour:'#1f2a5a',
  items:[['🦴','bones','bone'],['🐱','kittens','kitten'],['🐰','bunnies','bunny']],
  games:{flash:'Quick Look Fetch', flashIcon:'🦴', match:'Same or Different?', matchIcon:'🐾', make:'Fill the Basket', makeIcon:'🧺'},
  menuLine:"Woof! I'm Cooper. Pick a game!",
  cheer:['Paw-some!','Woof woof!','Good job!','Tail-waggingly good!'],
  action:'Woof like Cooper {n} times!',

  /* ---- Animated 2D background: soft paw prints and bones drifting up ---- */
  background(cv){
    const ctx = cv.getContext('2d'); let w, h, dpr, bits = [];
    const resize = ()=>{ dpr = Math.min(1.5, devicePixelRatio||1); w = cv.width = innerWidth*dpr; h = cv.height = innerHeight*dpr;
      bits = Array.from({length:18}, ()=>({x:Math.random()*w, y:Math.random()*h, s:(22+Math.random()*26)*dpr, v:(.15+Math.random()*.3)*dpr, r:Math.random()*6, e:'🐾'})); };
    resize(); addEventListener('resize', resize);
    const loop = (now)=>{
      requestAnimationFrame(loop); if(document.hidden) return;
      ctx.clearRect(0,0,w,h);
      // gentle tartan band along the bottom, like Cooper's jumper
      const bh = 26*dpr; ctx.globalAlpha = .18;
      ctx.fillStyle = '#d32f2f'; ctx.fillRect(0, h-bh*3, w, bh*3);
      ctx.fillStyle = '#1f2a5a'; for(let x=0;x<w;x+=bh*4) ctx.fillRect(x, h-bh*3, bh, bh*3); ctx.fillRect(0, h-bh*2, w, bh*.6);
      ctx.globalAlpha = 1;
      for(const b of bits){ b.y -= b.v; b.r += .002; if(b.y < -60) { b.y = h + 40; b.x = Math.random()*w; }
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(Math.sin(b.r)*.5); ctx.globalAlpha = .16; ctx.font = `${b.s}px serif`; ctx.fillText(b.e, 0, 0); ctx.restore(); }
      ctx.globalAlpha = 1;
    };
    requestAnimationFrame(loop);
  },

  /* ---- 3D entrance: Cooper says hello, sniffs out three bones, runs back to play ---- */
  intro(done){
    const T = THREE;
    const wrap = document.createElement('div'); wrap.id = 'intro';
    wrap.innerHTML = `<button class="skip">Skip ⏭</button>
      <div class="passport" id="pp"><span data-i="0">🦴</span><span data-i="1">🦴</span><span data-i="2">🦴</span></div>
      <div class="ov" id="ov"><img class="badge-photo" src="${WBASE}media/cooper-face.webp" alt="Cooper"><h1>MEET COOPER</h1>
        <div class="sub">Cooper has hidden some bones in the garden…</div>
        <button class="launch" id="launch">🐾 Say hello!</button></div>
      <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>`;
    document.body.appendChild(wrap);
    const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
    const showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
      cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };
    function bark(n=2){ if(!settings.sfx) return; const a = audio(); if(!a) return;
      for(let i=0;i<n;i++){ const t = a.currentTime + i*.26;
        const o = a.createOscillator(), f = a.createBiquadFilter(), g = a.createGain(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(210, t+.14);
        f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1.2; o.connect(f); f.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(.22,t+.015); g.gain.exponentialRampToValueAtTime(.001,t+.18); o.start(t); o.stop(t+.2); } }

    const renderer = new T.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
    wrap.prepend(renderer.domElement);
    const scene = new T.Scene(); scene.background = new T.Color(0xa9dcff); scene.fog = new T.Fog(0xbfe6ff, 18, 45);
    const cam = new T.PerspectiveCamera(50, innerWidth/innerHeight, .05, 200);
    scene.add(new T.HemisphereLight(0xfff6e8, 0x6b8f3a, .9));
    const sun = new T.DirectionalLight(0xffeedd, .85); sun.position.set(5, 10, 6); scene.add(sun);
    const canvasTex = (w, h, draw)=>{ const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return new T.CanvasTexture(c); };
    const L = c => new T.MeshLambertMaterial({color:c});

    /* ---- Garden ---- */
    const grassTex = canvasTex(512,512,(x,w,h)=>{ x.fillStyle='#6fbf4f'; x.fillRect(0,0,w,h);
      for(let i=0;i<5000;i++){ x.fillStyle = pick(['#5fae42','#7fcc5c','#68b84a','#8ad468']); x.fillRect(Math.random()*w, Math.random()*h, 2, 5); }
      for(let i=0;i<70;i++){ x.fillStyle = pick(['#fff','#ffe14d','#ff8fb3']); x.beginPath(); x.arc(Math.random()*w, Math.random()*h, 3, 0, 7); x.fill(); } });
    grassTex.wrapS = grassTex.wrapT = T.RepeatWrapping; grassTex.repeat.set(6,6);
    const ground = new T.Mesh(new T.PlaneGeometry(70,70), new T.MeshLambertMaterial({map:grassTex})); ground.rotation.x = -Math.PI/2; scene.add(ground);
    // fence
    const wood = L(0xc9935b), woodDark = L(0xa8743f);
    for(let x=-12; x<=12; x+=.9){ const p = new T.Mesh(new T.BoxGeometry(.7,1.6,.12), wood); p.position.set(x,.8,-9); scene.add(p);
      const tip = new T.Mesh(new T.ConeGeometry(.35,.35,4), wood); tip.rotation.y = Math.PI/4; tip.position.set(x,1.78,-9); scene.add(tip); }
    [[.5],[1.25]].forEach(([y])=>{ const r = new T.Mesh(new T.BoxGeometry(25,.15,.08), woodDark); r.position.set(0,y,-9.08); scene.add(r); });
    // trees
    [[-8,-11],[7,-12],[10,-6]].forEach(([x,z],i)=>{ const tr = new T.Mesh(new T.CylinderGeometry(.25,.35,2.6,8), L(0x7a4a2a)); tr.position.set(x,1.3,z); scene.add(tr);
      [[0,3,0,1.6],[.8,2.6,.3,1.1],[-.8,2.7,-.2,1.2]].forEach(([dx,y,dz,r])=>{ const f = new T.Mesh(new T.SphereGeometry(r,16,12), L(i%2?0x3f9a3a:0x4aa845)); f.position.set(x+dx,y,z+dz); scene.add(f); }); });
    // kennel
    const kennel = new T.Group(); kennel.position.set(-4.2,0,-5.6); kennel.rotation.y = .5; scene.add(kennel);
    const kb = new T.Mesh(new T.BoxGeometry(1.8,1.3,1.8), L(0xd32f2f)); kb.position.y = .65; kennel.add(kb);
    const roof = new T.Mesh(new T.ConeGeometry(1.55,.9,4), L(0x1f2a5a)); roof.rotation.y = Math.PI/4; roof.position.y = 1.75; kennel.add(roof);
    const door = new T.Mesh(new T.CircleGeometry(.42,24), L(0x2a1a10)); door.position.set(0,.55,.91); kennel.add(door);
    const signT = canvasTex(256,64,(x,w,h)=>{ x.fillStyle='#fff3e0'; x.fillRect(0,0,w,h); x.fillStyle='#1f2a5a'; x.font='bold 44px Fredoka, sans-serif'; x.textAlign='center'; x.fillText('COOPER', w/2, 48); });
    const sign = new T.Mesh(new T.PlaneGeometry(1.1,.28), new T.MeshBasicMaterial({map:signT})); sign.position.set(0,1.12,.92); kennel.add(sign);
    // flower beds
    for(let i=0;i<40;i++){ const x = -11 + Math.random()*22, z = -8.4 + Math.random()*.8;
      const st = new T.Mesh(new T.CylinderGeometry(.02,.02,.5,4), L(0x3d8b37)); st.position.set(x,.25,z); scene.add(st);
      const fl = new T.Mesh(new T.SphereGeometry(.12,8,6), L(pick([0xff6b9a,0xffd23f,0xffffff,0x9b6bff,0xff8a3d]))); fl.position.set(x,.52,z); scene.add(fl); }
    // dog bowl (bones land here)
    const bowl = new T.Mesh(new T.CylinderGeometry(.42,.32,.22,24,1,true), new T.MeshLambertMaterial({color:0x1f2a5a, side:T.DoubleSide}));
    const BOWL = new T.Vector3(2.0, 0, 2.2); bowl.position.copy(BOWL).setY(.11); scene.add(bowl);
    const bowlBase = new T.Mesh(new T.CircleGeometry(.33,24), L(0x1f2a5a)); bowlBase.rotation.x = -Math.PI/2; bowlBase.position.copy(BOWL).setY(.01); scene.add(bowlBase);

    /* ---- Cooper: chocolate spaniel, curly ears, amber eyes, tartan jumper, silver tag ---- */
    const furTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#5b2f18'; x.fillRect(0,0,w,h);
      for(let i=0;i<900;i++){ x.strokeStyle = pick(['#7a4425','#8a5230','#46220f','#6a3a1e']); x.lineWidth = 2;
        const cx = Math.random()*w, cy = Math.random()*h, r = 3+Math.random()*5; x.beginPath(); x.arc(cx,cy,r,Math.random()*3,Math.random()*3+3); x.stroke(); } });
    furTex.wrapS = furTex.wrapT = T.RepeatWrapping;
    const curly = new T.MeshLambertMaterial({map:furTex});                    // long curly ears
    const coatTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#5b2f18'; x.fillRect(0,0,w,h);
      for(let i=0;i<1400;i++){ x.strokeStyle = pick(['rgba(122,68,37,.55)','rgba(60,30,14,.45)']); x.lineWidth = 1.5;
        const cx = Math.random()*w, cy = Math.random()*h; x.beginPath(); x.moveTo(cx,cy); x.lineTo(cx+(Math.random()-.5)*4, cy+6+Math.random()*6); x.stroke(); } });
    coatTex.wrapS = coatTex.wrapT = T.RepeatWrapping;
    const fur = new T.MeshLambertMaterial({map:coatTex});                     // smooth chocolate coat
    const furSmooth = new T.MeshLambertMaterial({color:0x5b2f18});
    const tartanTex = canvasTex(256,256,(x,w,h)=>{ x.fillStyle='#d32f2f'; x.fillRect(0,0,w,h);
      x.fillStyle='rgba(31,42,90,.9)'; for(let i=0;i<w;i+=64){ x.fillRect(i,0,26,h); x.fillRect(0,i,w,26); }
      x.fillStyle='rgba(255,255,255,.8)'; for(let i=36;i<w;i+=64){ x.fillRect(i,0,4,h); x.fillRect(0,i,w,4); }
      for(let i=0;i<3000;i++){ x.fillStyle = `rgba(0,0,0,${Math.random()*.12})`; x.fillRect(Math.random()*w, Math.random()*h, 3, 2); } });
    tartanTex.wrapS = tartanTex.wrapT = T.RepeatWrapping; tartanTex.repeat.set(3,2);
    const jumperMat = new T.MeshLambertMaterial({map:tartanTex});

    function makeCooper(){
      const g = new T.Group();
      const body = new T.Mesh(new T.SphereGeometry(1,32,24), fur); body.scale.set(.32,.34,.86); body.position.set(0,.84,0); g.add(body);
      const jumper = new T.Mesh(new T.SphereGeometry(1,32,24), jumperMat); jumper.scale.set(.355,.375,.62); jumper.position.set(0,.86,.14); g.add(jumper);
      const neck = new T.Mesh(new T.CylinderGeometry(.15,.19,.5,16), furSmooth); neck.position.set(0,1.1,.66); neck.rotation.x = .75; g.add(neck);
      const collar = new T.Mesh(new T.TorusGeometry(.18,.05,10,28), L(0x1f2a5a)); collar.position.set(0,1.02,.62); collar.rotation.x = Math.PI/2 + .75; g.add(collar);
      // silver tag
      const ring = new T.Mesh(new T.TorusGeometry(.04,.012,8,16), new T.MeshPhongMaterial({color:0xd9d9d9, specular:0xffffff, shininess:90})); ring.position.set(0,.88,.86); g.add(ring);
      const tag = new T.Mesh(new T.CylinderGeometry(.075,.075,.015,24), new T.MeshPhongMaterial({color:0xe2ddd0, specular:0xffffff, shininess:110, emissive:0x2a2a2a}));
      tag.rotation.x = Math.PI/2; tag.position.set(0,.78,.88); g.add(tag);
      // head
      const head = new T.Group(); head.position.set(0,1.36,.86); g.add(head);
      const skull = new T.Mesh(new T.SphereGeometry(.3,24,18), fur); skull.scale.set(1,.95,1.05); head.add(skull);
      const muzzle = new T.Mesh(new T.SphereGeometry(1,20,16), new T.MeshLambertMaterial({color:0x6e3a1e})); muzzle.scale.set(.16,.14,.22); muzzle.position.set(0,-.09,.27); head.add(muzzle);
      const nose = new T.Mesh(new T.SphereGeometry(.07,16,12), new T.MeshStandardMaterial({color:0x4a2620, roughness:.35})); nose.scale.set(1.25,.9,.9); nose.position.set(0,-.04,.47); head.add(nose);
      const mouth = new T.Mesh(new T.TorusGeometry(.06,.01,6,16,Math.PI), L(0x2a140a)); mouth.rotation.z = Math.PI; mouth.position.set(0,-.17,.43); head.add(mouth);
      [-1,1].forEach(s=>{
        const eye = new T.Mesh(new T.SphereGeometry(.062,16,12), new T.MeshStandardMaterial({color:0xc8741c, roughness:.3})); eye.position.set(s*.12,.06,.24); head.add(eye);
        const pupil = new T.Mesh(new T.SphereGeometry(.036,12,10), new T.MeshBasicMaterial({color:0x120804})); pupil.position.set(s*.12,.06,.29); head.add(pupil);
        const glint = new T.Mesh(new T.SphereGeometry(.013,8,6), new T.MeshBasicMaterial({color:0xffffff})); glint.position.set(s*.12-.015,.08,.31); head.add(glint);
        const brow = new T.Mesh(new T.SphereGeometry(.07,12,8), fur); brow.scale.set(1.2,.6,.8); brow.position.set(s*.12,.13,.2); head.add(brow);
      });
      // long curly ears, made from a chain of furry balls
      const ears = [-1,1].map(s=>{ const pv = new T.Group(); pv.position.set(s*.27,.1,-.02); head.add(pv);
        [[.11,0],[.12,-.12],[.125,-.24],[.12,-.36],[.11,-.47],[.085,-.56]].forEach(([r,y],i)=>{ const b = new T.Mesh(new T.SphereGeometry(r,14,10), curly);
          b.scale.set(.55,1,.9); b.position.set(s*(.02 + i*.012), y, (i%2)*.025); pv.add(b); });
        pv.rotation.z = s*.12; return pv; });
      // legs
      const legs = [[-.15,.55],[.15,.55],[-.15,-.52],[.15,-.52]].map(([x,z])=>{ const pv = new T.Group(); pv.position.set(x,.65,z); g.add(pv);
        const leg = new T.Mesh(new T.CylinderGeometry(.085,.075,.55,12), fur); leg.position.y = -.27; pv.add(leg);
        const paw = new T.Mesh(new T.SphereGeometry(.095,12,10), furSmooth); paw.scale.set(1,.6,1.3); paw.position.set(0,-.56,.04); pv.add(paw); return pv; });
      // feathery tail
      const tail = new T.Group(); tail.position.set(0,.98,-.8); g.add(tail);
      [[.1,0,0],[.09,.08,-.12],[.07,.17,-.22]].forEach(([r,y,z])=>{ const b = new T.Mesh(new T.SphereGeometry(r,12,10), curly); b.position.set(0,y,z); tail.add(b); });
      const sh = new T.Mesh(new T.CircleGeometry(.8,24), new T.MeshBasicMaterial({color:0, transparent:true, opacity:.22})); sh.scale.set(.5,1.25,1); sh.rotation.x = -Math.PI/2; sh.position.y = .01; g.add(sh);
      scene.add(g);
      return {g, head, ears, legs, tail, phase:0};
    }
    const cooper = makeCooper(); cooper.g.position.set(0,0,1);

    /* ---- Bones hidden under little mounds ---- */
    const boneMat = L(0xf3e6c8);
    function makeBone(){ const b = new T.Group();
      const shaft = new T.Mesh(new T.CylinderGeometry(.06,.06,.5,10), boneMat); shaft.rotation.z = Math.PI/2; b.add(shaft);
      [[-.25,.05],[-.25,-.05],[.25,.05],[.25,-.05]].forEach(([x,z])=>{ const k = new T.Mesh(new T.SphereGeometry(.08,10,8), boneMat); k.position.set(x,0,z); b.add(k); });
      scene.add(b); return b; }
    const SPOTS = [new T.Vector3(3.2,0,-1.6), new T.Vector3(-3,0,-3.2), new T.Vector3(1.2,0,-5.2)];
    const mounds = SPOTS.map(p=>{ const m = new T.Mesh(new T.SphereGeometry(.55,16,10,0,Math.PI*2,0,Math.PI/2), L(0x7a4f2c)); m.scale.set(1,.35,1); m.position.copy(p); scene.add(m); return m; });
    const bones = SPOTS.map(p=>{ const b = makeBone(); b.position.copy(p).setY(-.3); b.visible = false; return b; });
    // dirt flicks
    const dirt = Array.from({length:30}, ()=>{ const d = new T.Mesh(new T.SphereGeometry(.05,6,5), L(0x6b4426)); d.visible = false; scene.add(d); return d; });
    function flick(at){ dirt.forEach(d=>{ if(!d.visible && Math.random()<.35){ d.visible = true; d.position.copy(at).setY(.1);
      d.userData.v = new T.Vector3((Math.random()-.5)*.08, .08+Math.random()*.06, -.05 - Math.random()*.06); } }); }

    /* ---- animation ---- */
    let phase = 'idle', t = 0, phaseT = 0, raf = 0, ended = false, last = performance.now(), found = 0, fly = null;
    const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
    addEventListener('resize', onResize);
    const lerp = (a,b,k)=>a+(b-a)*k, tmp = new T.Vector3(), look = new T.Vector3();
    cam.position.set(0, 2.6, 4.4);
    const HOME = new T.Vector3(0,0,1);

    function face(target, k){ const dx = target.x - cooper.g.position.x, dz = target.z - cooper.g.position.z;
      const want = Math.atan2(dx, dz); let d = want - cooper.g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); cooper.g.rotation.y += d*.12*k; }
    function walk(target, speed, k){ face(target, k); const v = tmp.copy(target).sub(cooper.g.position); v.y = 0; const dist = v.length();
      if(dist > .05){ v.normalize().multiplyScalar(Math.min(dist, speed*k/60)); cooper.g.position.add(v); }
      cooper.phase += .3*k; const s = Math.sin(cooper.phase);
      cooper.legs[0].rotation.x = s*.7; cooper.legs[3].rotation.x = s*.7; cooper.legs[1].rotation.x = -s*.7; cooper.legs[2].rotation.x = -s*.7;
      cooper.g.position.y = Math.abs(Math.cos(cooper.phase))*.05; cooper.ears.forEach((e,i)=>e.rotation.x = Math.sin(cooper.phase+i)*.25);
      return dist; }
    function rest(){ cooper.legs.forEach(l=>l.rotation.x *= .8); cooper.g.position.y *= .8; }

    function frame(now){
      raf = requestAnimationFrame(frame);
      const k = Math.min(6, (now-last)/16.67)*(window.INTRO_SPEED||1); last = now; t += k/60; phaseT += k/60;
      // always: wagging tail and swaying ears
      cooper.tail.rotation.y = Math.sin(t*(phase==='idle'?9:14))*.6; cooper.tail.rotation.x = -.3;
      cooper.ears.forEach((e,i)=>{ e.rotation.z = (i?1:-1)*(.12 + Math.sin(t*2.2+i)*.05); });
      dirt.forEach(d=>{ if(d.visible){ d.position.add(d.userData.v); d.userData.v.y -= .006*k; if(d.position.y < 0) d.visible = false; } });

      if(phase==='idle'){
        rest(); cooper.head.rotation.z = Math.sin(t*1.3)*.18; cooper.head.rotation.x = -.15 + Math.sin(t*.9)*.05;
        cam.position.lerp(tmp.set(Math.sin(t*.3)*.8, 2.6, 4.4), .03*k); cam.lookAt(0, 1.05, 1);
      }
      else if(phase==='hello'){
        rest(); cooper.head.rotation.z *= .9; cooper.g.position.y = Math.max(0, Math.sin(Math.min(1, phaseT/.5)*Math.PI))*.45 + (phaseT>1.2 && phaseT<1.7 ? Math.sin((phaseT-1.2)/.5*Math.PI)*.35 : 0);
        cooper.head.rotation.x = -.25;
        cam.position.lerp(tmp.set(.6, 1.5, 5.2), .05*k); cam.lookAt(0, 1.05, 1);
        if(phaseT > 3){ phase = 'plan'; phaseT = 0; showCap('3 hidden bones!', "Let's sniff them out!"); speak("I've hidden three bones. Let's sniff them out!", 1); }
      }
      else if(phase==='plan'){
        rest(); cooper.head.rotation.x = Math.sin(t*6)*.12 + .25;   // sniffing the air
        cam.position.lerp(tmp.set(0, 5.5, 7), .03*k); cam.lookAt(0, .5, -2);
        if(phaseT > 3.2){ phase = 'seek'; phaseT = 0; }
      }
      else if(phase==='seek'){
        const spot = SPOTS[found]; cooper.head.rotation.x = .35 + Math.sin(t*10)*.08;
        const dist = walk(tmp.copy(spot).add(new T.Vector3(0,0,.95)).applyAxisAngle(new T.Vector3(0,1,0),0), 2.6, k);
        cam.position.lerp(look.set(cooper.g.position.x*.7, 4.2, cooper.g.position.z + 5.2), .04*k); cam.lookAt(cooper.g.position.x, .6, cooper.g.position.z - 1);
        if(dist < .12){ phase = 'dig'; phaseT = 0; face(spot, 8); }
      }
      else if(phase==='dig'){
        const spot = SPOTS[found]; face(spot, k);
        cooper.head.rotation.x = .55; cooper.legs[0].rotation.x = Math.sin(t*22)*.9; cooper.legs[1].rotation.x = -Math.sin(t*22)*.9;
        mounds[found].scale.y = Math.max(.08, .35 - phaseT*.2);
        if(Math.random()<.5) flick(spot);
        cam.position.lerp(look.set(cooper.g.position.x + 1.5, 2.6, cooper.g.position.z + 3.4), .04*k); cam.lookAt(spot.x, .4, spot.z);
        if(phaseT > 1.3){ phase = 'fly'; phaseT = 0; const b = bones[found]; b.visible = true; b.position.copy(spot).setY(.1);
          fly = {b, from:b.position.clone(), to:BOWL.clone().setY(.2 + found*.12)};
          const n = ['One!','Two!','Three!'][found]; showCap(n, ['Cooper found a bone!','Another bone!','The last bone!'][found]);
          speak(n, 1); bark(1); const dot = pp.querySelector(`[data-i="${found}"]`); if(dot) dot.classList.add('on'); }
      }
      else if(phase==='fly'){
        rest(); const d = Math.min(1, phaseT/1.1);
        fly.b.position.lerpVectors(fly.from, fly.to, d); fly.b.position.y = lerp(fly.from.y, fly.to.y, d) + Math.sin(d*Math.PI)*2.2;
        fly.b.rotation.z += .25*k; cooper.head.rotation.x = -.35;    // watching it fly
        cam.position.lerp(look.set(1, 4.5, 6.5), .03*k); cam.lookAt(fly.b.position.x*.5, .8, fly.b.position.z*.5 - 1);
        if(d >= 1){ fly.b.rotation.set(0, found*.9, 0); found++; phaseT = 0;
          if(found < 3){ phase = 'seek'; } else { phase = 'home'; showCap('All 3 bones!', 'Good boy, Cooper!'); speak('Three bones! Good boy, Cooper!', 1); } }
      }
      else if(phase==='home'){
        cooper.head.rotation.x = -.1;
        const dist = walk(HOME, 3.2, k);
        cam.position.lerp(look.set(0, 2.4, 4.6), .04*k); cam.lookAt(cooper.g.position.x, 1, cooper.g.position.z);
        if(dist < .1){ face(new T.Vector3(0,0,10), 8); phase = 'finale'; phaseT = 0; bark(3);
          showCap('Your turn!', "Let's play with Cooper!"); speak("Woof! Your turn! Let's play!", 1); }
      }
      else if(phase==='finale'){
        rest(); face(new T.Vector3(0,0,10), k); cooper.head.rotation.z = Math.sin(t*2)*.2; cooper.g.position.y = Math.abs(Math.sin(t*6))*.25;
        cam.position.lerp(tmp.set(-.5, 1.5, 5), .04*k); cam.lookAt(0, 1.05, 1);
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
      phase = 'hello'; phaseT = 0; bark(2); setTimeout(()=>bark(2), 1200);
      showCap("Hello! I'm Cooper!", 'Woof woof!'); speak("Woof woof! Hello! I'm Cooper!", 1);
    };
    wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); finish(); };
    window.__petsIntro = {cooper:()=>cooper, T};   // used by automated checks only
    requestAnimationFrame(frame);
    speak('Meet Cooper! Tap say hello!');
  }
};
