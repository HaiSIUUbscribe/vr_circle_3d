//  RENDER LOOP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const clk=new THREE.Clock();
function animate(){
  const t=clk.getElapsedTime(),dt=clk.getDelta();
  sMat.uniforms.uT.value=t;galMat.uniforms.uT.value=t;
  galaxy.rotation.z=t*.018;astGroup.rotation.y=t*.008;
  rim.intensity=3.5+Math.sin(t*.65)*.9;fill.intensity=2.5+Math.cos(t*.48)*.7;back.intensity=1+Math.sin(t*.3)*.5;
  ancientFlames.forEach((f,i)=>{
    const ph=(f.userData.phase||0)+t*4.2+i*.37;
    const s=.82+Math.sin(ph)*.16+Math.sin(ph*1.9)*.08;
    f.scale.set(1,s,1);
    f.material.opacity=.5+Math.sin(ph*1.7)*.16;
    f.position.y=.96+Math.sin(ph)*.02;
  });
  ancientFlameLights.forEach((l,i)=>{
    const ph=(l.userData.phase||0)+t*3.6+i*.29;
    l.intensity=1.05+Math.sin(ph)*.36+Math.sin(ph*2.1)*.14;
  });
  for(let i=0;i<pN;i++){pP[i*3+1]+=pV[i].y;pP[i*3]+=pV[i].x;if(pP[i*3+1]>7)pP[i*3+1]=-6;if(Math.abs(pP[i*3])>12)pV[i].x*=-1;}
  pGeo.attributes.position.needsUpdate=true;
  
  if(!G.active){WG.rotation.y=t*.28;}
  else{WG.rotation.y+=(.0-WG.rotation.y)*.025;}
  gem.rotation.y=t*1.2;gem.rotation.z=t*.7;
  outerRing.material.emissiveIntensity=.8+Math.sin(t*1.2)*.3;
  
  G.marbles.forEach(m=>{
    if(m.grp.userData.placed||m.grp.userData.inFlight||m===G.selectedMb) return;
    const fo=m.grp.userData.fo;
    const hoverAmp=m.grp.userData.rackMarble
      ? (isImmersiveVR() ? .0025 : .004)
      : (isImmersiveVR() ? .026 : .09);
    m.grp.position.y=m.grp.userData.origPos.y+Math.sin(t*.75+fo)*hoverAmp;
    const rotSpeed=m.grp.userData.rackMarble ? .14 : .55;
    m.grp.rotation.y=t*rotSpeed+fo;
    if(m.grp.userData.core){
      m.grp.userData.core.rotation.x+=dt*.95;
      m.grp.userData.core.rotation.y-=dt*1.15;
      const pulse=.72+.22*Math.sin(t*2.6+fo);
      m.grp.userData.core.scale.setScalar(pulse);
    }
    if(m.grp.userData.om){
      m.grp.userData.om.material.opacity=.06+Math.sin(t*2+fo)*.025;
    }
  });
  G.marbles.forEach(m=>{if(m.grp.userData.placed)m.grp.rotation.y=t*.4;});
  G.slots.forEach(s=>{
    if(!s.halo||!s.halo.material) return;
    const pulse=.5+.5*Math.sin(t*3.1+s.idx*.7);
    let op=s.filled ? .08 : .34+.16*pulse;
    let sc=1+.03*pulse;
    let opOuter=s.filled ? .04 : .2+.12*pulse;
    let scOuter=1.02+.04*pulse;
    const specialDark=(G.mode==='special'&&G.specialHidden);
    const guideMb=specialDark?null:((G.phase==='dragging'&&G.selectedMb)?G.selectedMb:lastHov);
    if(guideMb&&!s.filled){
      const isMatch=s.color.hex.toLowerCase()===guideMb.cd.hex.toLowerCase();
      if(isMatch){op=.72+.24*pulse;sc=1.05+.04*pulse;opOuter=.44+.18*pulse;scOuter=1.08+.06*pulse;}
      else{op=.09+.04*pulse;sc=.99+.01*pulse;opOuter=.05+.03*pulse;scOuter=1+.015*pulse;}
      if(G.phase==='dragging'&&G.aimSlot===s){op=.96+.26*pulse;sc=1.09+.05*pulse;opOuter=.7+.2*pulse;scOuter=1.12+.07*pulse;}
    }
    s.halo.material.opacity=op;
    s.halo.scale.set(sc,sc,sc);
    if(s.haloOuter&&s.haloOuter.material){
      s.haloOuter.material.opacity=opOuter;
      s.haloOuter.scale.set(scOuter,scOuter,scOuter);
    }
  });

  BOARD.position.y=1.55+Math.sin(t*1.05)*.012;
  BOARD.rotation.z=Math.sin(t*.45)*.004;
  if(G.boardFx.rings&&G.boardFx.rings.length){
    const [orb1,orb2,frameOuter,frameInner]=G.boardFx.rings;
    if(orb1) orb1.rotation.z=t*.35;
    if(orb2) orb2.rotation.z=-t*.52;
    if(frameOuter) frameOuter.material.opacity=.36+.14*Math.sin(t*1.8);
    if(frameInner) frameInner.material.opacity=.24+.1*Math.cos(t*1.4);
  }
  if(G.boardFx.starMat){
    G.boardFx.starMat.opacity=.28+.18*Math.sin(t*2.2);
  }
  G.boardItems.forEach((b,i)=>{
    if(!b.placed) return;
    const p=.5+.5*Math.sin(t*3.2+i*.7);
    b.glow.material.opacity=.62+.3*p;
    b.dot.scale.setScalar(1.06+.06*p);
  });
  
  updateFlight(dt);
  updateBurst(dt);
  if(G.mode==='archery') updateArcheryMode(dt,t);
  else checkHover(t);
  updateXRUITransform();
  updateXRHover();
  updateXRVictoryArena(dt);
  updateXRDefeatArena(dt);
  
  if(!renderer.xr.isPresenting){
    updateDesktopOrbitCamera(t);
    cursor.style.opacity='1';
    if(!xrMouseSim.enabled) tip.style.opacity='0';
  }else{
    cursor.style.opacity='0';
    tip.style.opacity='0';
  }
  renderer.render(scene,camera);
}
window.addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);resizeAimCanvas();});
renderer.setAnimationLoop(animate);

