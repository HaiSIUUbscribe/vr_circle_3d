// Web/Desktop input logic (kept outside index.html)

window.VR_DEV_MODE = window.VR_DEV_MODE ?? (
  location.protocol === 'file:' ||
  location.hostname === 'localhost' ||
  location.hostname === '127.0.0.1' ||
  location.search.includes('dev=1')
);

function setAimUI(show,cd){
  document.getElementById('aim-label').style.display=show?'flex':'none';
  document.getElementById('power-wrap').style.display=show?'flex':'none';
  if(cd){
    document.getElementById('aim-target-name').textContent=cd.name.toUpperCase();
    document.getElementById('aim-target-name').style.color=cd.hex;
  }
  syncHoloPanel(LEVELS[G.lvIdx],show?cd:null);
}

function animReturn(mb){
  const s=mb.grp.position.clone(),e=mb.grp.userData.origPos.clone();let t=0;
  (function step(){t+=.055;if(t>=1){mb.grp.position.copy(e);return;}
  mb.grp.position.lerpVectors(s,e,1-(1-t)*(1-t));requestAnimationFrame(step);})();
}
function pulseM(mesh){let t=0;(function step(){t+=.09;mesh.scale.setScalar(t>=1?1:1+.3*Math.sin(t*Math.PI));if(t<1)requestAnimationFrame(step);})();}

function spawnParticles(pos,hex,success){
  const {r,g,b}=h2c(hex);
  const n=success?20:12;
  for(let i=0;i<n;i++){
    const geo=new THREE.SphereGeometry(.045,6,6);
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(r,g,b),transparent:true,opacity:.9});
    const m=new THREE.Mesh(geo,mat);m.position.copy(pos);
    const spd=success?3.2:2;
    const vel=new THREE.Vector3((Math.random()-.5)*spd,(Math.random()*.5+(success ? .5 : .2))*spd,(Math.random()-.5)*spd);
    scene.add(m);burstParticles.push({mesh:m,vel,life:1});
  }
  if(success){
    const rg=new THREE.Mesh(new THREE.TorusGeometry(.1,.06,8,32),new THREE.MeshBasicMaterial({color:new THREE.Color(r,g,b),transparent:true,opacity:.8,blending:THREE.AdditiveBlending}));
    rg.position.copy(pos);rg.rotation.x=Math.PI/2;scene.add(rg);
    burstParticles.push({mesh:rg,vel:new THREE.Vector3(0,0,0),life:1,ring:true});
  }
}
function updateBurst(dt){
  for(let i=burstParticles.length-1;i>=0;i--){
    const p=burstParticles[i];p.life-=dt*(p.ring?2:1.5);
    if(p.life<=0){scene.remove(p.mesh);burstParticles.splice(i,1);continue;}
    if(p.ring){p.mesh.scale.setScalar(1+(1-p.life)*3.5);p.mesh.material.opacity=p.life*.7;}
    else{p.vel.y-=dt*4;p.mesh.position.addScaledVector(p.vel,dt);p.mesh.material.opacity=p.life*.9;p.mesh.scale.setScalar(Math.max(.1,p.life*.9));}
  }
}

function showCombo(n,pts){
  if(n<2) return;
  const el=document.getElementById('combo-pop');
  const msgs=['','','DOUBLE!','TRIPLE!','QUAD!!','ULTRA!!!'];
  const cols=['','','#ff9500','#ff2d78','#a855f7','#00f5ff'];
  el.textContent=(msgs[Math.min(n,5)]||'COMBO x'+n);
  el.style.color=cols[Math.min(n,5)]||'#fff';
  el.style.fontSize=(n>=4?'3.5rem':'2.8rem');
  el.style.opacity='1';el.style.transform='translate(-50%,-50%) scale(1.35)';
  el.style.transition='none';
  setTimeout(()=>{el.style.transition='all .6s';el.style.opacity='0';el.style.transform='translate(-50%,-50%) scale(1) translateY(-30px)';},800);
}

function lvDone(){
  if(!G.active) return;
  clearTimeout(lvDoneTmr);lvDoneTmr=null;
  clearInterval(G.timerInt);
  const bonus=G.mode==='hard'?G.timer*2:0;G.score+=bonus;sfx.up();
  if(G.lvIdx<LEVELS.length-1){
    toast('🎉 Level '+(G.lvIdx+1)+' xong! +'+(bonus||0)+' bonus','ok',2500);
    clearTimeout(lvAdvanceTmr);
    lvAdvanceTmr=setTimeout(()=>{lvAdvanceTmr=null;if(!G.active) return;G.lvIdx++;buildLevel();},2700);
  } else {
    sfx.win();
    clearTimeout(endGameTmr);
    endGameTmr=setTimeout(()=>{endGameTmr=null;endGame(true);},1200);
  }
}

function endGame(win){
  clearGameTimeouts();
  G.active=false;clearInterval(G.timerInt);
  const elapsed=Math.round((Date.now()-G.startTime)/1000);
  const m=Math.floor(elapsed/60),s=elapsed%60;

  if(renderer.xr.isPresenting||xrMouseSim.enabled){
    if(win&&typeof showXRVictoryArena==='function'){
      showXRVictoryArena(elapsed);
      return;
    }
    if(!win&&typeof showXRDefeatArena==='function'){
      showXRDefeatArena(elapsed);
      return;
    }
  }

  document.getElementById('re').textContent=win?'🏆':'💀';
  document.getElementById('rt').textContent=win?'CHIẾN THẮNG!':'HẾT THỜI GIAN!';
  document.getElementById('rs').textContent=win?'Bạn hoàn thành cả 3 cấp độ!':'Dừng ở Level '+(G.lvIdx+1)+'. Thử lại!';
  document.getElementById('rs-sc').textContent=G.score;
  document.getElementById('rs-lv').textContent=(G.lvIdx+(win?1:0))+'/3';
  document.getElementById('rs-cb').textContent='x'+G.maxCombo;
  document.getElementById('rs-tm').textContent=m+':'+(s+'').padStart(2,'0');
  document.getElementById('scr-result').classList.remove('off');
  ['hud','prog-wrap','badge','hint'].forEach(id=>document.getElementById(id).style.display='none');
  document.getElementById('aim-label').style.display='none';
  document.getElementById('power-wrap').style.display='none';
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);
}

function selMode(m){
  G.mode=m;
  const modes=['easy','hard','special','archery'];
  modes.forEach(k=>{
    const el=document.getElementById('mc-'+k);
    if(!el) return;
    const selected=(k===m);
    el.className='mc'+(selected?(k==='hard'?' sh':' se'):'' );
  });
  syncHoloPanel(LEVELS[G.lvIdx],G.selectedMb?G.selectedMb.cd:null);
}
function startGame(){
  if(G.mode==='archery'&&!renderer.xr.isPresenting&&!xrMouseSim.enabled){
    toast('ARCHERY cần vào VR hoặc bật giả lập VR Controller.', 'err', 1800);
    return false;
  }
  if(typeof hideXRArenas==='function') hideXRArenas();
  else {
    if(typeof hideXRVictoryArena==='function') hideXRVictoryArena();
    if(typeof hideXRDefeatArena==='function') hideXRDefeatArena();
  }
  clearGameTimeouts();
  resumeAC();G.lvIdx=0;G.score=0;G.combo=1;G.maxCombo=1;G.active=true;G.phase='idle';G.specialHidden=false;G.specialLocked=false;xrDragController=null;xrIngameMenuOpen=false;xrUiSliderDragController=null;xrUiView='main';updateXRUIViews();
  document.getElementById('scr-menu').classList.add('off');
  document.getElementById('scr-result').classList.add('off');
  ['hud','prog-wrap'].forEach(id=>{document.getElementById(id).style.display=id==='hud'?'flex':'block';});
  updateGameplayOverlayVisibility();
  buildLevel();startAmb();
  return true;
}
function showMenu(){
  if(typeof hideXRArenas==='function') hideXRArenas();
  else {
    if(typeof hideXRVictoryArena==='function') hideXRVictoryArena();
    if(typeof hideXRDefeatArena==='function') hideXRDefeatArena();
  }
  clearGameTimeouts();
  G.active=false;xrDragController=null;xrIngameMenuOpen=false;xrUiSliderDragController=null;xrUiView='main';updateXRUIViews();clearLevel();clearInterval(G.timerInt);
  document.getElementById('scr-result').classList.add('off');
  document.getElementById('scr-menu').classList.remove('off');
  ['hud','prog-wrap','badge','hint'].forEach(id=>document.getElementById(id).style.display='none');
  startAmb();
}
window.selMode=selMode;window.startGame=startGame;window.showMenu=showMenu;
function exitToMenu(){
  clearGameTimeouts();
  G.active=false;
  xrIngameMenuOpen=false;
  xrUiSliderDragController=null;
  clearLevel();
  clearInterval(G.timerInt);
  showMenu();
}

let toastTmr;
function toast(msg,tp,dur=2000){const e=document.getElementById('toast');e.textContent=msg;e.className='show '+tp;clearTimeout(toastTmr);toastTmr=setTimeout(()=>e.classList.remove('show'),dur);}

let volEl=null;

window.addEventListener('load',()=>{
  const btnExit=document.getElementById('btn-exit');
  if(btnExit) btnExit.onclick=()=>{exitToMenu();};

  volEl=document.getElementById('bgm-vol');
  if(volEl){
    volEl.value=String(Math.round(bgmVolume*100));
    volEl.addEventListener('input',()=>{
      bgmVolume=Math.max(0,Math.min(1,Number(volEl.value)/100));
      applyBgmVolume();
      updateXRVolumeBar();
    });
  }

  const btnAudio=document.getElementById('btn-audio');
  if(btnAudio){
    btnAudio.addEventListener('click',()=>{
      if(bgmVolume>0){
        btnAudio.dataset.prevVol=String(bgmVolume);
        bgmVolume=0;
      }else{
        bgmVolume=Number(btnAudio.dataset.prevVol||0.35);
      }
      if(volEl) volEl.value=String(Math.round(bgmVolume*100));
      applyBgmVolume();
      updateXRVolumeBar();
      resumeAC();
      startAmb();
    });
  }

  applyBgmVolume();
  updateXRVolumeBar();
});

// Mở rộng vùng nhận diện đích đến
function findAimedSlot(){
  ray.setFromCamera(mouse,camera);
  const meshes=G.slots.filter(s=>!s.filled).map(s=>s.mesh);
  const hits=ray.intersectObjects(meshes,false);
  if(hits.length){
    const mesh=hits[0].object;
    return G.slots.find(s=>s.mesh===mesh&&!s.filled)||null;
  }

  // Fallback: Tự động bắt dính vào ô gần nhất trên màn hình (Vùng bắt cực rộng)
  let best=null, bestDist=Infinity;
  const maxDist = Math.max(innerWidth, innerHeight) * 0.25; // 25% màn hình
  G.slots.forEach(s=>{
    if(s.filled) return;
    const wp=new THREE.Vector3(s.x,0,s.z);WG.localToWorld(wp);
    const sp=worldToScreen(wp);
    const dx=sp.x-mouseScreen.x, dy=sp.y-mouseScreen.y;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d < maxDist && d < bestDist){
      bestDist=d;
      best=s;
    }
  });
  return best;
}

function findNearestSlotForMarble(mb,maxDist=.95){
  if(!mb) return null;
  let best=null,bestD=Infinity;
  G.slots.forEach(s=>{
    if(s.filled) return;
    const wp=new THREE.Vector3(s.x,0,s.z);WG.localToWorld(wp);
    const d=mb.grp.position.distanceTo(wp);
    if(d<maxDist&&d<bestD){bestD=d;best=s;}
  });
  return best;
}

function updateDraggedMarblePosition(clientX,clientY){
  if(!G.selectedMb) return;
  mouse.x = (clientX / innerWidth) * 2 - 1;
  mouse.y = -(clientY / innerHeight) * 2 + 1;
  ray.setFromCamera(mouse,camera);
  if(ray.ray.intersectPlane(dragPlane,dragHit)){
    G.selectedMb.grp.position.set(dragHit.x,.26,dragHit.z);
  }
}

function finishDragDrop(slot){
  if(!G.selectedMb) return false;
  const mb=G.selectedMb;
  setMarbleOutlineOpacity(mb,.08);
  mb.grp.scale.setScalar(1);
  G.selectedMb=null;
  G.phase='idle';
  G.aimSlot=null;
  xrDragController=null;
  cursor.classList.remove('aiming');
  setAimUI(false);
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);
  if(!slot){
    sfx.cancel();
    animReturn(mb);
    return false;
  }
  placeOrRejectMarble(mb,slot);
  return true;
}

// ---- Xử lý Chuột / Cảm ứng ----
function handleInputStart(clientX, clientY) {
  if(xrMouseSim.enabled) return;
  resumeAC();
  if (!G.active) return;
  if (G.mode==='archery') return;
  if (G.mode==='special' && G.specialLocked) return;

  hasDragged = false;
  mouse.x = (clientX / innerWidth) * 2 - 1;
  mouse.y = -(clientY / innerHeight) * 2 + 1;
  mouseScreen = { x: clientX, y: clientY };

  if (G.phase === 'dragging' && G.selectedMb) {
    updateDraggedMarblePosition(clientX,clientY);
    return;
  }

  ray.setFromCamera(mouse, camera);
  const pickable = G.marbles.filter(m => !m.grp.userData.placed && !m.grp.userData.inFlight);
  const hits = ray.intersectObjects(pickable.map(m => m.grp.userData.mm));

  if (hits.length) {
    const mb = G.marbles.find(m => m.grp.userData.mm === hits[0].object);
    if (mb) {
      if (G.selectedMb && G.selectedMb !== mb) {
        setMarbleOutlineOpacity(G.selectedMb,.08);
        G.selectedMb.grp.scale.setScalar(1);
      }
      G.selectedMb = mb;
      G.phase = 'dragging';
      setMarbleOutlineOpacity(mb,.5);
      sfx.pick();
      cursor.classList.add('aiming');
      setAimUI(true, mb.cd);
      updateDraggedMarblePosition(clientX,clientY);
      return;
    }
  }
}

function handleInputMove(clientX, clientY) {
  if(xrMouseSim.enabled) return;
  if (G.mode==='archery') return;
  mouse.x = (clientX / innerWidth) * 2 - 1;
  mouse.y = -(clientY / innerHeight) * 2 + 1;
  mouseScreen = { x: clientX, y: clientY };
  cursor.style.left = clientX + 'px';
  cursor.style.top = clientY + 'px';
  tip.style.left = (clientX + 18) + 'px';
  tip.style.top = (clientY - 8) + 'px';

  if (G.phase === 'dragging' && G.selectedMb) {
    hasDragged = true;
    updateDraggedMarblePosition(clientX,clientY);
    G.aimSlot=findNearestSlotForMarble(G.selectedMb,.95)||findAimedSlot();
  }
}

function handleInputEnd() {
  if(xrMouseSim.enabled) return;
  if (G.mode==='archery') return;
  if (G.mode==='special' && G.specialLocked) return;
  if (!G.active || G.phase !== 'dragging' || !G.selectedMb) return;
  const dropSlot = G.aimSlot || findNearestSlotForMarble(G.selectedMb,.95) || findAimedSlot();
  finishDragDrop(dropSlot);
}

document.addEventListener('mousedown', e => {
  if(!VR_DEV_MODE&&!xrMouseSim.enabled) return;
  if(xrMouseSim.enabled){
    if(e.button===0) onXRSelectStart({target:xrMouseSim.controller});
    return;
  }
  if (e.button === 0) handleInputStart(e.clientX, e.clientY);
});

document.addEventListener('mousemove', e => {
  if(!VR_DEV_MODE&&!xrMouseSim.enabled) return;
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  mouseScreen = { x: e.clientX, y: e.clientY };
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  tip.style.left = (e.clientX + 18) + 'px';
  tip.style.top = (e.clientY - 8) + 'px';
  if(xrMouseSim.enabled){
    updateXRMouseSimController();
    return;
  }
  handleInputMove(e.clientX, e.clientY);
});

document.addEventListener('mouseup', e => {
  if(!VR_DEV_MODE&&!xrMouseSim.enabled) return;
  if(xrMouseSim.enabled){
    if(e.button===0) onXRSelectEnd({target:xrMouseSim.controller});
    return;
  }
  if (e.button === 0) handleInputEnd();
});

document.addEventListener('contextmenu', e=>{if(VR_DEV_MODE&&xrMouseSim.enabled)e.preventDefault();});

document.addEventListener('touchstart', e => {
  if(!VR_DEV_MODE) return;
  if (e.target.tagName !== 'BUTTON' && e.target.id === 'c') e.preventDefault();
  handleInputStart(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener('touchmove', e => {
  if(!VR_DEV_MODE) return;
  if (e.target.id === 'c') e.preventDefault();
  handleInputMove(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });

document.addEventListener('touchend', () => {
  if(!VR_DEV_MODE) return;
  handleInputEnd();
}, { passive: false });

document.addEventListener('keydown', e => {
  if(e.key==='F2'){
    if(!VR_DEV_MODE) return;
    e.preventDefault();
    setXRMouseSimEnabled(!xrMouseSim.enabled);
    return;
  }
  if(xrMouseSim.enabled&&(e.key==='r'||e.key==='R'||e.key==='t'||e.key==='T')){
    tryXRMoveByTrigger(xrMouseSim.controller);
    return;
  }
  if (e.key === 'Escape' && G.phase === 'dragging') {
    if (G.selectedMb) { setMarbleOutlineOpacity(G.selectedMb,.08); G.selectedMb.grp.scale.setScalar(1); G.selectedMb = null; }
    G.phase = 'idle'; cursor.classList.remove('aiming'); setAimUI(false);
    xrDragController=null;
    aimCtx.clearRect(0, 0, aimCanvas.width, aimCanvas.height); sfx.cancel();
  }
});
