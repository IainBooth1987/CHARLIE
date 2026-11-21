/* =========================================================
   Phonics worlds — shared 3D kit (Three.js r128)
   Cartoon (toon) shading, big friendly eyes, letter blocks, intro shell and frame loop.
   Every phonics intro tells the same idea: three sounds join together to make a word.
   ========================================================= */
window.KIT = function(opts){
  const T = THREE;
  const wrap = document.createElement('div'); wrap.id = 'intro';
  wrap.innerHTML = `<button class="skip">Skip ⏭</button>
    <div class="passport" id="pp">${opts.passport.map((p,i)=>`<span data-i="${i}">${p}</span>`).join('')}</div>
    <div class="ov" id="ov"><h1>${opts.title}</h1><div class="sub">${opts.sub}</div>
    <button class="launch" id="launch">${opts.button}</button></div>
    <div class="cap" id="cap"><div class="pn"></div><div class="pf"></div></div>
    <div class="ov" id="big" style="display:none"><h1 class="bigword"></h1></div>`;
  document.body.appendChild(wrap);
  const cap = wrap.querySelector('#cap'), pp = wrap.querySelector('#pp');
  const K = {T, wrap};
  K.showCap = (a, b)=>{ cap.querySelector('.pn').textContent = a; cap.querySelector('.pf').textContent = b || '';
    cap.classList.remove('show'); void cap.offsetWidth; cap.classList.add('show'); };
  K.hideCap = ()=>cap.classList.remove('show');
  K.dot = i => { const d = pp.querySelector(`[data-i="${i}"]`); if(d) d.classList.add('on'); };
  K.bigWord = w => { const b = wrap.querySelector('#big'); b.querySelector('h1').textContent = w; b.style.display = 'flex'; K.hideCap(); };
  K.hideBig = () => { wrap.querySelector('#big').style.display = 'none'; };

  /* renderer, scene, camera, lights */
  const renderer = new T.WebGLRenderer({antialias:true});
  renderer.setPixelRatio(Math.min(1.5, devicePixelRatio||1)); renderer.setSize(innerWidth, innerHeight);
  wrap.prepend(renderer.domElement);
  const scene = new T.Scene(); scene.background = new T.Color(opts.sky); if(opts.fog) scene.fog = new T.Fog(opts.fog[0], opts.fog[1], opts.fog[2]);
  const cam = new T.PerspectiveCamera(50, innerWidth/innerHeight, .1, 600);
  scene.add(new T.HemisphereLight(opts.hemi ? opts.hemi[0] : 0xeaf6ff, opts.hemi ? opts.hemi[1] : 0x4a6a3a, .9));
  const sun = new T.DirectionalLight(0xffffff, .85); sun.position.set(20, 40, 25); scene.add(sun);
  Object.assign(K, {renderer, scene, cam, sun});
  const onResize = ()=>{ cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); };
  addEventListener('resize', onResize);

  /* cartoon materials and shapes */
  const grad = new T.DataTexture(new Uint8Array([70, 140, 215]), 3, 1, T.LuminanceFormat);
  grad.minFilter = grad.magFilter = T.NearestFilter; grad.needsUpdate = true;
  K.toon = c => new T.MeshToonMaterial({color:c, gradientMap:grad});
  K.toonDS = c => new T.MeshToonMaterial({color:c, gradientMap:grad, side:T.DoubleSide});
  K.glow = c => new T.MeshBasicMaterial({color:c});
  const BLACK = new T.MeshBasicMaterial({color:0x111111}), WHITE = K.toon(0xffffff), SHINE = new T.MeshBasicMaterial({color:0xffffff});
  const SPH = new T.SphereGeometry(1, 24, 18);
  K.blob = (parent, mat, sx, sy, sz, x, y, z) => { const m = new T.Mesh(SPH, mat); m.scale.set(sx,sy,sz); m.position.set(x,y,z); parent.add(m); return m; };
  K.box = (parent, mat, w, h, d, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w,h,d), mat); m.position.set(x,y,z); parent.add(m); return m; };
  K.cyl = (parent, mat, r1, r2, h, x, y, z, seg=20) => { const m = new T.Mesh(new T.CylinderGeometry(r1,r2,h,seg), mat); m.position.set(x,y,z); parent.add(m); return m; };
  K.limb = (parent, mat, r1, r2, len, x, y, z, rx=0, rz=0) => { const g = new T.Group(); g.position.set(x,y,z); g.rotation.set(rx,0,rz); parent.add(g);
    const c = new T.Mesh(new T.CylinderGeometry(r1, r2, len, 18), mat); c.position.y = -len/2; g.add(c);
    K.blob(g, mat, r2, r2, r2, 0, -len, 0); K.blob(g, mat, r1, r1, r1, 0, 0, 0); return g; };
  /* big cartoon eye looking along +z */
  K.eye = (parent, x, y, z, r, iris) => { const g = new T.Group(); g.position.set(x,y,z); parent.add(g);
    K.blob(g, WHITE, r, r, r*.8, 0, 0, 0);
    K.blob(g, K.toon(iris), r*.62, r*.62, r*.3, 0, -r*.05, r*.62);
    K.blob(g, BLACK, r*.36, r*.36, r*.2, 0, -r*.05, r*.78);
    K.blob(g, SHINE, r*.14, r*.14, r*.08, r*.22, r*.2, r*.86);
    K.blob(g, SHINE, r*.07, r*.07, r*.05, -r*.15, -r*.22, r*.86); return g; };
  K.canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new T.CanvasTexture(c); t.anisotropy = 4; return t; };
  /* a letter (or two/three letters for one sound) on a coloured tile — Andika is made for beginning readers */
  K.letterTex = (txt, bg, fg='#ffffff') => K.canvasTex(256, 256, (x, w, h)=>{
    x.fillStyle = bg; x.fillRect(0,0,w,h);
    x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 14; x.strokeRect(10,10,w-20,h-20);
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `bold ${txt.length>1 ? 130 : 190}px Andika, Fredoka, sans-serif`;
    x.lineWidth = 10; x.strokeStyle = 'rgba(0,0,0,.25)'; x.strokeText(txt, w/2, h/2+8); x.fillText(txt, w/2, h/2+8); });
  K.letterCube = (txt, bg, size=1) => { const tex = K.letterTex(txt, bg);
    return new T.Mesh(new T.BoxGeometry(size,size,size), new T.MeshLambertMaterial({map:tex})); };
  /* soft puffs (steam, dust, sparkles) */
  const puffs = [];
  K.puff = (x, y, z, c=0xffffff, s=.5, vy=.04, life=1.6) => { const m = new T.Mesh(SPH, new T.MeshLambertMaterial({color:c, transparent:true, opacity:.85}));
    m.position.set(x,y,z); m.scale.setScalar(s*.4); scene.add(m); puffs.push({m, s, vy, life, t:0, vx:(Math.random()-.5)*.02, vz:(Math.random()-.5)*.02}); };
  const stepPuffs = k => { for(let i=puffs.length-1;i>=0;i--){ const p = puffs[i]; p.t += k/60; const f = p.t/p.life;
    p.m.position.y += p.vy*k; p.m.position.x += p.vx*k; p.m.position.z += p.vz*k; p.m.scale.setScalar(p.s*(.4+f)); p.m.material.opacity = .85*(1-f);
    if(f>=1){ scene.remove(p.m); p.m.material.dispose(); puffs.splice(i,1); } } };

  /* little synth sounds (no voices in the intros) */
  K.sfx = (kind) => { if(!settings.sfx) return; const a = audio(); if(!a) return; const t = a.currentTime;
    const beep = (f, d, type='triangle', v=.12, at=0) => { const o = a.createOscillator(), g = a.createGain(); o.type = type; o.frequency.value = f; o.connect(g); g.connect(a.destination);
      g.gain.setValueAtTime(0,t+at); g.gain.linearRampToValueAtTime(v,t+at+.01); g.gain.exponentialRampToValueAtTime(.001,t+at+d); o.start(t+at); o.stop(t+at+d+.02); };
    if(kind==='clank'){ beep(220,.12,'square',.08); beep(330,.1,'square',.06,.05); }
    if(kind==='ding'){ beep(880,.4); beep(1320,.5,'sine',.08,.05); }
    if(kind==='pop'){ beep(600,.08,'sine',.12); beep(900,.1,'sine',.1,.04); }
    if(kind==='whoo'){ [0,.25].forEach(at=>{ const o = a.createOscillator(), g = a.createGain(); o.type='sawtooth'; o.frequency.setValueAtTime(520,t+at); o.frequency.linearRampToValueAtTime(600,t+at+.2);
        const f = a.createBiquadFilter(); f.type='lowpass'; f.frequency.value = 1400; o.connect(f); f.connect(g); g.connect(a.destination);
        g.gain.setValueAtTime(0,t+at); g.gain.linearRampToValueAtTime(.05,t+at+.03); g.gain.linearRampToValueAtTime(0,t+at+.22); o.start(t+at); o.stop(t+at+.25); }); }
    if(kind==='word'){ [523,659,784,1047].forEach((f,i)=>beep(f,.25,'triangle',.12,i*.09)); }
    if(kind==='chomp'){ beep(140,.12,'square',.1); beep(110,.12,'square',.08,.13); }
    if(kind==='beep'){ beep(1200,.08,'square',.05); beep(1600,.08,'square',.05,.1); }
  };

  /* frame loop: run(fn) calls fn(k, t, dt) every frame; finish() ends the intro */
  let raf = 0, ended = false, last = performance.now(), t = 0;
  K.state = {phase:'idle', pt:0};
  K.go = p => { K.state.phase = p; K.state.pt = 0; };
  K.run = fn => { const loop = now => { raf = requestAnimationFrame(loop); const k = Math.min(6, (now-last)/16.67); last = now; t += k/60; K.state.pt += k/60;
    fn(k, t); stepPuffs(k); renderer.render(scene, cam); }; raf = requestAnimationFrame(loop); };
  K.finish = () => { if(ended) return; ended = true; stopVoice(); wrap.classList.add('out');
    setTimeout(()=>{ cancelAnimationFrame(raf); removeEventListener('resize', onResize); renderer.dispose(); wrap.remove(); }, 750); opts.done(); };
  K.onLaunch = fn => { wrap.querySelector('#launch').onclick = ()=>{ if(K.state.phase!=='idle') return; sfx.click(); audio();
    wrap.querySelector('#ov').classList.add('go'); pp.classList.add('show'); fn(); }; };
  wrap.querySelector('.skip').onclick = ()=>{ sfx.click(); K.finish(); };
  K.lerp = (a,b,k) => a+(b-a)*k;
  K.v = new T.Vector3(); K.look = new T.Vector3();
  return K;
};
