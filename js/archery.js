function clearArcheryLevel(){
  xrArchery.active=false;
  xrArchery.projectiles.forEach(p=>removeAndDispose(scene,p.mesh));
  xrArchery.projectiles.length=0;
  xrArchery.rings.length=0;
  xrArchery.colorNodes.forEach(n=>{
    const idx=xrInteractiveButtons.indexOf(n);
    if(idx>=0) xrInteractiveButtons.splice(idx,1);
  });
  xrArchery.colorNodes.length=0;
  xrArchery.arrowStands.length=0;
  if(xrArchery.heldArrow) removeAndDispose(null,xrArchery.heldArrow);
  if(xrArchery.bowMesh) removeAndDispose(null,xrArchery.bowMesh);
  xrArchery.selectedCd=null;
  xrArchery.selectedNode=null;
  xrArchery.bowMesh=null;
  xrArchery.bowPickup=null;
  xrArchery.bowHoldController=null;
  xrArchery.arrowHoldController=null;
  xrArchery.pullStrength=0;
  xrArchery.heldArrow=null;
  xrArchery.correctHits=0;
  xrArchery.totalShots=0;
  xrArchery.hitGoal=0;
  while(xrArchery.root.children.length) removeAndDispose(xrArchery.root,xrArchery.root.children[0]);
  if(xrArchery.root.parent) scene.remove(xrArchery.root);
}

function setArcherySelectedColor(cd,node=null,quiet=false){
  xrArchery.selectedCd=cd||null;
  xrArchery.selectedNode=node||null;
  xrArchery.arrowStands.forEach(n=>{
    const selected=(cd&&n.userData&&n.userData.archeryColor&&n.userData.archeryColor.hex===cd.hex);
    n.scale.setScalar(selected?1.08:1);
    if(n.userData.modeGlow&&n.userData.modeGlow.material){
      n.userData.modeGlow.material.opacity=selected?.38:.15;
    }
  });
  if(cd){
    syncHoloPanel(LEVELS[G.lvIdx],cd);
    if(!quiet) toast('Đã chọn mũi tên '+cd.name.toUpperCase(), 'inf', 700);
  }
}

function makeArcheryArrowMesh(cd){
  const g=new THREE.Group();
  const col=new THREE.Color(cd.hex);
  const shaft=new THREE.Mesh(
    new THREE.CylinderGeometry(.01,.01,.28,8),
    new THREE.MeshStandardMaterial({color:0xc6d5e6,roughness:.42,metalness:.65})
  );
  shaft.position.y=.12;
  g.add(shaft);
  const tip=new THREE.Mesh(
    new THREE.ConeGeometry(.018,.06,10),
    new THREE.MeshStandardMaterial({color:col,roughness:.2,metalness:.18,emissive:col.clone().multiplyScalar(.35),emissiveIntensity:.85})
  );
  tip.position.y=.29;
  g.add(tip);
  const tail=new THREE.Mesh(
    new THREE.ConeGeometry(.02,.055,8),
    new THREE.MeshStandardMaterial({color:0x0e1f34,roughness:.56,metalness:.2})
  );
  tail.position.y=-.01;
  tail.rotation.x=Math.PI;
  g.add(tail);
  g.userData.archeryColor=cd;
  return g;
}

function buildArcheryBow(){
  const bow=new THREE.Group();
  const arc=new THREE.Mesh(
    new THREE.TorusGeometry(.38,.014,8,44,Math.PI),
    new THREE.MeshStandardMaterial({color:0x8ccfff,roughness:.3,metalness:.78,emissive:0x12355d,emissiveIntensity:.75})
  );
  arc.rotation.z=Math.PI/2;
  bow.add(arc);

  const grip=new THREE.Mesh(
    new THREE.CylinderGeometry(.02,.02,.18,10),
    new THREE.MeshStandardMaterial({color:0x18283f,roughness:.42,metalness:.55,emissive:0x10233b,emissiveIntensity:.5})
  );
  bow.add(grip);

  const stringGeo=new THREE.BufferGeometry().setFromPoints([
    new THREE.Vector3(0,.38,0),new THREE.Vector3(0,0,0),new THREE.Vector3(0,-.38,0)
  ]);
  const stringLine=new THREE.Line(
    stringGeo,
    new THREE.LineBasicMaterial({color:0x9deaff,transparent:true,opacity:.65,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  bow.add(stringLine);
  bow.userData.stringLine=stringLine;
  return bow;
}

function attachArcheryBow(controller){
  if(!xrArchery.bowMesh||xrArchery.bowHoldController) return false;
  xrArchery.bowHoldController=controller;
  controller.attach(xrArchery.bowMesh);
  xrArchery.bowMesh.position.set(-.02,-.03,-.24);
  xrArchery.bowMesh.rotation.set(0,0,.12);
  xrArchery.bowMesh.scale.setScalar(1.02);
  toast('Đã cầm cung', 'inf', 650);
  return true;
}

function releaseArcheryBow(){
  if(!xrArchery.bowMesh) return;
  xrArchery.tableRig.attach(xrArchery.bowMesh);
  xrArchery.bowMesh.position.set(-.32,.16,0);
  xrArchery.bowMesh.rotation.set(0,Math.PI*.25,.2);
  xrArchery.bowMesh.scale.setScalar(1);
  xrArchery.bowHoldController=null;
}

function tryGrabArcheryArrow(controller){
  if(!xrArchery.active||xrArchery.arrowHoldController||!xrArchery.bowHoldController) return false;
  const visibles=xrArchery.arrowStands.filter(a=>a.visible);
  if(!visibles.length) return false;
  const arrowHitMeshes=[];
  visibles.forEach(stand=>{
    stand.traverse(obj=>{
      if(obj.isMesh) arrowHitMeshes.push(obj);
    });
  });
  const hits=getControllerIntersections(controller,arrowHitMeshes);
  if(!hits.length) return false;
  const stand=hits[0].object.parent&&hits[0].object.parent.userData&&hits[0].object.parent.userData.archeryColor
    ? hits[0].object.parent
    : hits[0].object;
  if(!stand||!stand.userData||!stand.userData.archeryColor) return false;

  const held=makeArcheryArrowMesh(stand.userData.archeryColor);
  held.userData.standRef=stand;
  scene.add(held);
  controller.attach(held);
  held.position.set(0,-.02,-.16);
  held.rotation.set(-Math.PI*.5,0,0);

  xrArchery.heldArrow=held;
  xrArchery.arrowHoldController=controller;
  xrArchery.pullStrength=.04;
  stand.visible=false;
  setArcherySelectedColor(stand.userData.archeryColor,stand,true);
  toast('Kéo dây và thả trigger để bắn', 'inf', 800);
  return true;
}

function releaseArcheryHeldArrow(shoot=false){
  const held=xrArchery.heldArrow;
  const ctrl=xrArchery.arrowHoldController;
  if(!held) return false;

  const stand=held.userData.standRef||null;
  const cd=held.userData.archeryColor||xrArchery.selectedCd;

  if(shoot&&ctrl&&xrArchery.bowHoldController){
    scene.attach(held);
    const arrowPos=new THREE.Vector3().setFromMatrixPosition(ctrl.matrixWorld);
    const bowPos=new THREE.Vector3().setFromMatrixPosition(xrArchery.bowHoldController.matrixWorld);
    const targetPos=new THREE.Vector3().setFromMatrixPosition(xrArchery.targetRig.matrixWorld);
    const targetDir=new THREE.Vector3().subVectors(targetPos,bowPos).normalize();
    const pullVec=new THREE.Vector3().subVectors(bowPos,arrowPos);
    const pullDistance=pullVec.length();
    tempMatrix.identity().extractRotation(xrArchery.bowHoldController.matrixWorld);
    const bowFwd=new THREE.Vector3(0,0,-1).applyMatrix4(tempMatrix).normalize();
    const dir=pullDistance>.05 ? pullVec.normalize() : bowFwd;
    if(dir.dot(targetDir)<.2) dir.lerp(targetDir,.72).normalize();
    else dir.lerp(targetDir,.24).normalize();
    const strength=Math.max(.18,Math.min(1,Math.max(xrArchery.pullStrength,(pullDistance-.14)/.5)));
    const mass=.9+Math.random()*.45;
    const speed=10.5+strength*16.5;
    held.position.copy(bowPos).addScaledVector(dir,.14);
    held.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.clone().normalize());
    xrArchery.projectiles.push({
      mesh:held,
      vel:dir.multiplyScalar(speed),
      mass,
      drag:.16+mass*.1,
      life:0,
      cd
    });
    xrArchery.totalShots++;
    xrArchery.lastShotAt=performance.now();
    sfx.throw();
  }else{
    if(held.parent) held.parent.remove(held);
    scene.remove(held);
  }

  if(stand) stand.visible=true;
  xrArchery.heldArrow=null;
  xrArchery.arrowHoldController=null;
  xrArchery.pullStrength=0;
  return true;
}

function buildArcheryLevel(){
  clearArcheryLevel();

  const lv=LEVELS[G.lvIdx];
  const cols=lv.colors;

  WG.visible=false;
  MARBLE_RACK.visible=false;
  BOARD.visible=false;
  setAimUI(false);

  xrArchery.active=true;
  xrArchery.wind.set((Math.random()-.5)*.9,0,(Math.random()-.5)*.5);
  xrArchery.hitGoal=Math.max(cols.length+2,6);
  xrArchery.correctHits=0;
  xrArchery.totalShots=0;
  xrArchery.lastShotAt=0;
  xrArchery.pullStrength=0;
  xrArchery.bowHoldController=null;
  xrArchery.arrowHoldController=null;

  const basePos=new THREE.Vector3(0,0,0);
  xrArchery.root.position.copy(basePos);
  xrArchery.root.rotation.set(0,0,0);
  if(renderer.xr.isPresenting||xrMouseSim.enabled){
    const xrCam=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;
    xrCam.getWorldPosition(xrHeadPos);
    xrCam.getWorldQuaternion(vrAlignQuat);
    vrAlignForward.set(0,0,-1).applyQuaternion(vrAlignQuat).setY(0);
    if(vrAlignForward.lengthSq()<1e-6) vrAlignForward.set(0,0,-1);
    else vrAlignForward.normalize();
    xrArchery.root.position.set(xrHeadPos.x,0,xrHeadPos.z);
    xrArchery.root.rotation.y=Math.atan2(-vrAlignForward.x,-vrAlignForward.z);
  }
  xrArchery.root.add(xrArchery.targetRig);
  xrArchery.root.add(xrArchery.tableRig);
  scene.add(xrArchery.root);

  xrArchery.targetRig.clear();
  xrArchery.tableRig.clear();
  xrArchery.arrowStands.length=0;

  const targetPos=new THREE.Vector3(0,1.58,-2.55);
  xrArchery.targetRig.position.copy(targetPos);

  const targetBack=new THREE.Mesh(
    new THREE.CylinderGeometry(.92,.92,.24,72,1),
    new THREE.MeshStandardMaterial({
      color:0xf2ece3,
      roughness:.88,
      metalness:.03,
      emissive:0x24180f,
      emissiveIntensity:.1,
      map:archeryTargetDiff,
      normalMap:archeryTargetNormal,
      roughnessMap:archeryTargetRough,
      normalScale:new THREE.Vector2(.95,.95)
    })
  );
  targetBack.rotation.x=Math.PI*.5;
  targetBack.position.z=-.04;
  xrArchery.targetRig.add(targetBack);

  [0.78,0.62,0.46,0.3].forEach((r,idx)=>{
    const groove=new THREE.Mesh(
      new THREE.RingGeometry(r-.012,r+.006,96),
      new THREE.MeshBasicMaterial({color:0x3f2b1a,transparent:true,opacity:.34,depthWrite:false})
    );
    groove.position.z=.082+idx*.001;
    xrArchery.targetRig.add(groove);
  });

  const ringGlow=new THREE.Mesh(
    new THREE.TorusGeometry(.93,.026,12,84),
    new THREE.MeshBasicMaterial({color:0x9bf3ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  ringGlow.position.z=.084;
  xrArchery.targetRig.add(ringGlow);

  const segLen=(Math.PI*2)/cols.length;
  cols.forEach((cd,i)=>{
    const seg=new THREE.Mesh(
      new THREE.RingGeometry(.34,.78,42,1,i*segLen,segLen*.96),
      new THREE.MeshStandardMaterial({color:new THREE.Color(cd.hex),roughness:.36,metalness:.22,emissive:new THREE.Color(cd.hex).multiplyScalar(.22),emissiveIntensity:.65,side:THREE.DoubleSide})
    );
    seg.position.z=.086;
    seg.userData.archeryColor=cd;
    xrArchery.targetRig.add(seg);
    xrArchery.rings.push(seg);
  });

  const centerDisc=new THREE.Mesh(
    new THREE.CircleGeometry(.11,32),
    new THREE.MeshStandardMaterial({
      color:0xffd579,
      roughness:.25,
      metalness:.28,
      emissive:0x8f5e1f,
      emissiveIntensity:.65
    })
  );
  centerDisc.position.z=.092;
  centerDisc.userData.archeryCenter=true;
  xrArchery.targetRig.add(centerDisc);
  xrArchery.rings.push(centerDisc);

  const tablePos=new THREE.Vector3(0,.74,-.78);
  xrArchery.tableRig.position.copy(tablePos);

  const tableTop=new THREE.Mesh(
    new THREE.CylinderGeometry(1.05,1.05,.08,56),
    new THREE.MeshStandardMaterial({color:0x071020,roughness:.64,metalness:.58,emissive:0x0a1f38,emissiveIntensity:.6})
  );
  xrArchery.tableRig.add(tableTop);

  const tableLeg=new THREE.Mesh(
    new THREE.CylinderGeometry(.18,.22,.62,28),
    new THREE.MeshStandardMaterial({color:0x0c1a2f,roughness:.72,metalness:.55,emissive:0x07162a,emissiveIntensity:.32})
  );
  tableLeg.position.y=-.35;
  xrArchery.tableRig.add(tableLeg);

  xrArchery.bowMesh=buildArcheryBow();
  xrArchery.bowMesh.position.set(-.32,.16,0);
  xrArchery.bowMesh.rotation.set(0,Math.PI*.25,.2);
  xrArchery.tableRig.add(xrArchery.bowMesh);

  xrArchery.bowPickup=new THREE.Mesh(
    new THREE.SphereGeometry(.22,12,12),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.001,depthWrite:false})
  );
  xrArchery.bowPickup.position.copy(xrArchery.bowMesh.position);
  xrArchery.tableRig.add(xrArchery.bowPickup);

  cols.forEach((cd,i)=>{
    const a=(-Math.PI*.55)+(i/(Math.max(1,cols.length-1)))*(Math.PI*1.1);
    const stand=makeArcheryArrowMesh(cd);
    stand.position.set(Math.sin(a)*.72,.08,Math.cos(a)*.26);
    stand.rotation.y=Math.PI*.5+Math.sin(a)*.3;
    stand.userData.archeryColor=cd;
    stand.userData.baseY=stand.position.y;

    const glow=new THREE.Mesh(
      new THREE.SphereGeometry(.12,12,12),
      new THREE.MeshBasicMaterial({color:new THREE.Color(cd.hex),transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    glow.position.y=.12;
    stand.add(glow);
    stand.userData.modeGlow=glow;

    xrArchery.tableRig.add(stand);
    xrArchery.arrowStands.push(stand);
  });

  const badge=document.getElementById('badge');
  badge.textContent=lv.badge+' · ARCHERY';
  badge.style.borderColor=lv.bc+'55';
  badge.style.color=lv.bc;
  document.getElementById('hv-lv').textContent=lv.id+'/3';
  document.getElementById('hv-sc').textContent=G.score;
  document.getElementById('hv-co').textContent='0';
  document.getElementById('hv-cb').textContent='x1';

  clearInterval(G.timerInt);
  if(G.mode==='hard'){
    G.timer=lv.tl;
    const tmIcon=document.getElementById('hv-tm-icon');
    const tmVal=document.getElementById('hv-tm-val');
    if(tmIcon) tmIcon.style.display='none';
    if(tmVal){tmVal.textContent=G.timer;tmVal.style.color='#00f5ff';}
    G.timerInt=setInterval(()=>{
      G.timer--;
      const e=document.getElementById('hv-tm-val');
      if(e) e.textContent=G.timer;
      if(G.timer<=10){if(e)e.style.color='#ff4500';if(G.timer%2===0)sfx.hov();}
      if(G.timer<=0){clearInterval(G.timerInt);sfx.lose();endGame(false);}
    },1000);
  }else{
    const tmIcon=document.getElementById('hv-tm-icon');
    const tmVal=document.getElementById('hv-tm-val');
    if(tmIcon) tmIcon.style.display='inline-block';
    if(tmVal){tmVal.textContent='';tmVal.style.color='#00f5ff';}
  }

  G.startTime=Date.now();
  updateProg();
  setArcherySelectedColor(cols[0],null,true);
  toast('ARCHERY VR: lấy cung + mũi tên trên bàn rồi kéo-thả để bắn!', 'inf', 2300);
  syncHoloPanel(lv,cols[0]);
}

function resolveArcheryHit(projectile,ring,hitPoint){
  const hitCd=ring.userData.archeryColor;
  const shotCd=projectile.cd;
  const isCenter=!!(ring.userData&&ring.userData.archeryCenter);
  const correct=isCenter||!!(hitCd&&shotCd&&hitCd.hex.toLowerCase()===shotCd.hex.toLowerCase());

  if(correct){
    G.combo++;
    G.maxCombo=Math.max(G.maxCombo,G.combo);
    const basePts=(G.mode==='hard'?24:14)*Math.min(G.combo,6);
    const pts=isCenter?Math.round(basePts*2.6):basePts;
    G.score+=pts;
    xrArchery.correctHits++;
    sfx.ok();
    showCombo(G.combo,pts);
    spawnParticles(hitPoint.clone(),isCenter?'#ffd579':shotCd.hex,true);
    toast(isCenter?('BULLSEYE +'+pts):('✓ '+shotCd.name+' chính xác!'), 'ok', isCenter?1100:900);
  }else{
    G.combo=1;
    if(G.mode==='hard') G.score=Math.max(0,G.score-6);
    sfx.bad();
    spawnParticles(hitPoint.clone(),shotCd?shotCd.hex:'#66d7ff',false);
    toast('✕ Sai màu! Trúng '+(hitCd?hitCd.name.toUpperCase():'mục tiêu'), 'err', 1000);
  }

  ring.scale.setScalar(1.08);
  setTimeout(()=>{if(ring&&ring.scale) ring.scale.setScalar(1);},130);

  document.getElementById('hv-sc').textContent=G.score;
  document.getElementById('hv-co').textContent=String(xrArchery.correctHits);
  document.getElementById('hv-cb').textContent='x'+G.combo;
  updateProg();

  if(xrArchery.correctHits>=xrArchery.hitGoal){
    clearTimeout(lvDoneTmr);
    lvDoneTmr=setTimeout(()=>{lvDoneTmr=null;lvDone();},850);
  }
}

function tryXRArcherySelectStart(controller){
  if(!G.active||G.mode!=='archery'||!xrArchery.active) return false;

  const handedness=(controller.userData&&controller.userData.handedness)||'right';
  if(handedness==='left'){
    if(xrArchery.bowHoldController&&xrArchery.bowHoldController!==controller) return false;
    if(xrArchery.bowHoldController===controller) return true;
    if(!xrArchery.bowPickup||!xrArchery.bowPickup.visible) return false;
    const hits=getControllerIntersections(controller,[xrArchery.bowPickup]);
    if(!hits.length) return false;
    return attachArcheryBow(controller);
  }

  if(xrArchery.arrowHoldController&&xrArchery.arrowHoldController!==controller) return false;
  if(xrArchery.arrowHoldController===controller) return true;
  return tryGrabArcheryArrow(controller);
}

function tryXRArcherySelectEnd(controller){
  if(!G.active||G.mode!=='archery'||!xrArchery.active) return false;

  if(xrArchery.arrowHoldController&&xrArchery.arrowHoldController===controller){
    const canShoot=!!xrArchery.bowHoldController;
    releaseArcheryHeldArrow(canShoot);
    return true;
  }
  if(xrArchery.bowHoldController&&xrArchery.bowHoldController===controller){
    releaseArcheryBow();
    return true;
  }
  return false;
}

function updateArcheryProjectiles(dt){
  for(let i=xrArchery.projectiles.length-1;i>=0;i--){
    const p=xrArchery.projectiles[i];
    p.life+=dt;
    if(p.life>ARCHERY_PROJECTILE_TTL){
      removeAndDispose(scene,p.mesh);
      xrArchery.projectiles.splice(i,1);
      continue;
    }

    xrArcheryPrevPos.copy(p.mesh.position);
    p.vel.addScaledVector(xrArcheryGravity,dt*(1+p.mass*.28));
    p.vel.addScaledVector(xrArchery.wind,dt*.36);
    p.vel.multiplyScalar(Math.max(.72,1-p.drag*dt));
    p.mesh.position.addScaledVector(p.vel,dt);

    if(p.vel.lengthSq()>0.0001){
      p.mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),p.vel.clone().normalize());
    }

    xrArcheryStepDir.subVectors(p.mesh.position,xrArcheryPrevPos);
    const stepLen=xrArcheryStepDir.length();
    if(stepLen>0.0001&&xrArchery.rings.length){
      xrArcheryRay.set(xrArcheryPrevPos,xrArcheryStepDir.normalize());
      const hits=xrArcheryRay.intersectObjects(xrArchery.rings,false);
      if(hits.length&&hits[0].distance<=stepLen+.02){
        resolveArcheryHit(p,hits[0].object,hits[0].point.clone());
        removeAndDispose(scene,p.mesh);
        xrArchery.projectiles.splice(i,1);
        continue;
      }
    }

    const floorY=(typeof WORLD_FLOOR_Y==='number'?WORLD_FLOOR_Y:-.18)+ARCHERY_PROJECTILE_FLOOR_PAD;
    if(p.mesh.position.y<=floorY&&p.vel.y<=0){
      spawnParticles(p.mesh.position.clone(),p.cd?p.cd.hex:'#8ee8ff',false);
      removeAndDispose(scene,p.mesh);
      xrArchery.projectiles.splice(i,1);
    }
  }
}

function updateArcheryMode(dt,t){
  if(!G.active||G.mode!=='archery'||!xrArchery.active) return;
  updateArcheryProjectiles(dt);
  xrArchery.targetRig.rotation.y=Math.sin(t*.45)*.14;
  xrArchery.targetRig.position.y=1.58+Math.sin(t*1.4)*.035;
  xrArchery.tableRig.rotation.y=Math.sin(t*.5)*.05;

  xrArchery.arrowStands.forEach((n,i)=>{
    if(!n.visible) return;
    n.position.y=(n.userData.baseY||.08)+Math.sin(t*2.1+i*.55)*.01;
    if(n.userData.modeGlow&&n.userData.modeGlow.material){
      const selected=(xrArchery.selectedCd&&n.userData.archeryColor&&n.userData.archeryColor.hex===xrArchery.selectedCd.hex);
      n.userData.modeGlow.material.opacity=(selected?.35:.14)+Math.sin(t*2.8+i)*.03;
    }
  });

  if(xrArchery.bowHoldController&&xrArchery.heldArrow&&xrArchery.arrowHoldController){
    const lp=new THREE.Vector3().setFromMatrixPosition(xrArchery.bowHoldController.matrixWorld);
    const rp=new THREE.Vector3().setFromMatrixPosition(xrArchery.arrowHoldController.matrixWorld);
    xrArchery.pullStrength=Math.max(0,Math.min(1,(lp.distanceTo(rp)-.17)/.46));
    if(xrArchery.bowMesh&&xrArchery.bowMesh.userData&&xrArchery.bowMesh.userData.stringLine){
      const line=xrArchery.bowMesh.userData.stringLine;
      const pts=line.geometry.attributes.position;
      pts.setXYZ(1,0,-xrArchery.pullStrength*.22,0);
      pts.needsUpdate=true;
      line.material.opacity=.55+xrArchery.pullStrength*.35;
    }
  }else{
    xrArchery.pullStrength=0;
    if(xrArchery.bowMesh&&xrArchery.bowMesh.userData&&xrArchery.bowMesh.userData.stringLine){
      const line=xrArchery.bowMesh.userData.stringLine;
      const pts=line.geometry.attributes.position;
      pts.setXYZ(1,0,0,0);
      pts.needsUpdate=true;
      line.material.opacity=.65;
    }
  }
}
