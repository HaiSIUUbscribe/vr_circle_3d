function toggleXRIngameMenu(){
  xrIngameMenuOpen=!xrIngameMenuOpen;
  if(xrIngameMenuOpen){
    xrUiView='main';
    updateXRUIViews();
    toast('Menu VR: ON', 'inf', 650);
  }else{
    toast('Menu VR: OFF', 'inf', 650);
  }
}

function isXRInteractiveVisible(obj){
  for(let n=obj;n;n=n.parent){
    if(!n.visible) return false;
  }
  return true;
}

function onXRSelectStart(e){
  resumeAC();
  const controller=e.target;
  const isMouseSimController=(xrMouseSim.enabled&&controller===xrMouseSim.controller);
  if((renderer.xr.isPresenting||xrMouseSim.enabled)&&xrInteractiveButtons.length){
    const uiHits=getControllerIntersections(controller,xrInteractiveButtons.filter(isXRInteractiveVisible));
    if(uiHits.length){
      if(uiHits[0].object===xrUiVolumeSliderHit){
        xrUiSliderDragController=controller;
        setXrVolumeFromHit(uiHits[0]);
        return;
      }
      applyXRUIAction(uiHits[0].object.userData.xrUiAction);
      return;
    }
  }

  if(!G.active) return;

  if(G.mode==='archery'){
    if((renderer.xr.isPresenting||xrMouseSim.enabled)&&tryXRArcherySelectStart(controller)) return;
    if(renderer.xr.isPresenting&&!isMouseSimController&&tryXRMoveByTrigger(controller)) return;
    return;
  }

  if(G.mode==='special'&&G.specialLocked) return;

  if(G.phase==='idle'){
    const pickable=G.marbles.filter(m=>!m.grp.userData.placed&&!m.grp.userData.inFlight);
    const hits=getControllerIntersections(controller,pickable.map(m=>m.grp.userData.mm));
    if(!hits.length){
      if(renderer.xr.isPresenting&&!isMouseSimController&&tryXRMoveByTrigger(controller)) return;
      return;
    }
    const mb=G.marbles.find(m=>m.grp.userData.mm===hits[0].object);
    if(!mb) return;
    if(G.selectedMb&&G.selectedMb!==mb){
      setMarbleOutlineOpacity(G.selectedMb,.08);
      G.selectedMb.grp.scale.setScalar(1);
    }
    G.selectedMb=mb;
    G.phase='dragging';
    xrDragController=controller;
    setMarbleOutlineOpacity(mb,.5);
    sfx.pick();
    setAimUI(true,mb.cd);
    toast('Đã chọn '+mb.cd.name+' · Giữ trigger để ngắm, thả trigger để đặt', 'inf', 1400);
    updateXRDragFromController(controller);
    return;
  }

  if(renderer.xr.isPresenting&&!isMouseSimController&&tryXRMoveByTrigger(controller)) return;
}

function onXRSelectEnd(e){
  if(xrUiSliderDragController&&e.target===xrUiSliderDragController){
    xrUiSliderDragController=null;
    return;
  }
  if(G.active&&G.mode==='archery'&&(renderer.xr.isPresenting||xrMouseSim.enabled)){
    if(tryXRArcherySelectEnd(e.target)) return;
  }
  if(!G.active) return;
  if(G.mode==='special'&&G.specialLocked) return;
  if(G.phase!=='dragging'||!G.selectedMb) return;
  const controller=e.target;
  if(xrDragController&&controller!==xrDragController) return;
  const dropSlot=G.aimSlot||getControllerAimedSlot(controller)||findNearestSlotForMarble(G.selectedMb,.95);
  finishDragDrop(dropSlot||null);
  xrDragController=null;
}

function updateXRDragFromController(controller){
  if(!controller||!G.selectedMb) return;
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  ray.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
  if(ray.ray.intersectPlane(dragPlane,xrDragPoint)){
    G.selectedMb.grp.position.set(xrDragPoint.x,.26,xrDragPoint.z);
  }
}

function shiftPlayArea(dx,dz){
  WG.position.x+=dx;WG.position.z+=dz;
  MARBLE_RACK.position.x+=dx;MARBLE_RACK.position.z+=dz;
  BOARD.position.x+=dx;BOARD.position.z+=dz;
  ancientEnv.position.x+=dx;ancientEnv.position.z+=dz;
  floorM.position.x+=dx;floorM.position.z+=dz;
  gridHelper.position.x+=dx;gridHelper.position.z+=dz;
  floorFade.position.x+=dx;floorFade.position.z+=dz;

  G.marbles.forEach(m=>{
    m.grp.position.x+=dx;
    m.grp.position.z+=dz;
    m.grp.userData.origPos.x+=dx;
    m.grp.userData.origPos.z+=dz;
  });

  inFlight.forEach(f=>{
    f.mesh.position.x+=dx;
    f.mesh.position.z+=dz;
    f.startPos.x+=dx;f.startPos.z+=dz;
    f.endPos.x+=dx;f.endPos.z+=dz;
  });

  burstParticles.forEach(p=>{
    p.mesh.position.x+=dx;
    p.mesh.position.z+=dz;
  });

  if(renderer.xr.isPresenting){
    vrSessionOffset.x+=dx;
    vrSessionOffset.y+=dz;
  }
}

function alignVRToDesktopView(){
  if(!renderer.xr.isPresenting) return;
  const xrCam=renderer.xr.getCamera(camera);
  xrCam.getWorldPosition(xrHeadPos);
  xrCam.getWorldQuaternion(vrAlignQuat);

  vrAlignForward.set(0,0,-1).applyQuaternion(vrAlignQuat).setY(0);
  if(vrAlignForward.lengthSq()<1e-6) vrAlignForward.set(0,0,-1);
  else vrAlignForward.normalize();

  const desiredDist=5.8;
  const targetX=xrHeadPos.x+vrAlignForward.x*desiredDist;
  const targetZ=xrHeadPos.z+vrAlignForward.z*desiredDist;
  const dx=targetX-WG.position.x;
  const dz=targetZ-WG.position.z;
  if(Math.abs(dx)<.001&&Math.abs(dz)<.001) return;
  shiftPlayArea(dx,dz);
}

function getControllerTeleportPoint(controller){
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  ray.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
  return ray.ray.intersectPlane(vrGroundPlane,vrTeleportPoint)?vrTeleportPoint:null;
}

function onXRSqueezeStart(e){
  if((!renderer.xr.isPresenting&&!xrMouseSim.enabled)||!G.active) return;
  const controller=e.target;
  const point=getControllerTeleportPoint(controller);
  if(!point) return;

  if(renderer.xr.isPresenting) renderer.xr.getCamera(camera).getWorldPosition(xrHeadPos);
  else camera.getWorldPosition(xrHeadPos);
  const dx=-(point.x-xrHeadPos.x);
  const dz=-(point.z-xrHeadPos.z);
  shiftPlayArea(dx,dz);
  toast('VR: Đã di chuyển tới vị trí ngắm', 'inf', 900);
}

function tryXRMoveByTrigger(controller){
  if((!renderer.xr.isPresenting&&!xrMouseSim.enabled)||!G.active) return false;
  if(G.phase==='dragging'&&G.selectedMb) return false;
  const point=getControllerTeleportPoint(controller);
  if(!point) return false;
  if(renderer.xr.isPresenting) renderer.xr.getCamera(camera).getWorldPosition(xrHeadPos);
  else camera.getWorldPosition(xrHeadPos);
  const dx=-(point.x-xrHeadPos.x);
  const dz=-(point.z-xrHeadPos.z);
  shiftPlayArea(dx,dz);
  toast('VR: Trigger để di chuyển', 'inf', 700);
  return true;
}

function setXRControllerHoverVisual(controller,hovered){
  const line=controller.getObjectByName('xr-line');
  if(!line) return;
  const baseCol=line.userData.baseColor ?? 0x00f5ff;
  const hovCol=line.userData.hoverColor ?? 0xff9b3d;
  if(line.material&&line.material.color){
    line.material.color.setHex(hovered?hovCol:baseCol);
    line.material.opacity=hovered?1:.95;
  }
  line.scale.x=hovered?1.18:1;
  line.scale.y=hovered?1.18:1;
  const tipDot=line.userData.tip;
  if(tipDot&&tipDot.material&&tipDot.material.color){
    const tipBase=line.userData.tipBaseColor ?? 0x9dffff;
    const tipHov=line.userData.tipHoverColor ?? 0xfff1b8;
    tipDot.material.color.setHex(hovered?tipHov:tipBase);
    tipDot.material.opacity=hovered?1:.95;
    tipDot.scale.setScalar(hovered?1.9:1);
  }
}

function updateXRHover(){
  xrInteractiveButtons.forEach(b=>setXRUIButtonHover(b,false));
  let hasMouseSimUiHit=false;
  xrControllers.forEach(controller=>{
    const line=controller.getObjectByName('xr-line');
    if(!line) return;
    setXRControllerHoverVisual(controller,false);
    if(!renderer.xr.isPresenting&&!xrMouseSim.enabled){line.scale.z=1;if(line.userData.tip) line.userData.tip.position.z=-5;return;}

    const hitTargets=xrInteractiveButtons.filter(isXRInteractiveVisible);
    const uiHits=hitTargets.length?getControllerIntersections(controller,hitTargets):[];
    if(uiHits.length){
      const hit=uiHits[0];
      if(xrUiSliderDragController&&controller===xrUiSliderDragController&&hit.object===xrUiVolumeSliderHit){
        setXrVolumeFromHit(hit);
      }
      line.scale.z=Math.max(.08,hit.distance/5);
      if(line.userData.tip) line.userData.tip.position.z=-5*line.scale.z;
      setXRUIButtonHover(hit.object,true);
      setXRControllerHoverVisual(controller,true);
      if(xrMouseSim.enabled&&controller===xrMouseSim.controller){
        hasMouseSimUiHit=true;
        const action=hit.object.userData.xrUiAction||'';
        tip.textContent='VR: '+action.toUpperCase();
      }
      return;
    }

    if(!G.active){line.scale.z=1;if(line.userData.tip) line.userData.tip.position.z=-5;return;}

    if(G.phase==='idle'){
      const pickable=G.marbles.filter(m=>!m.grp.userData.placed&&!m.grp.userData.inFlight);
      const hits=getControllerIntersections(controller,pickable.map(m=>m.grp.userData.mm));
      line.scale.z=hits.length?Math.max(.08,hits[0].distance/5):1;
      if(hits.length) setXRControllerHoverVisual(controller,true);
    } else if(G.phase==='dragging'){
      if(G.selectedMb&&xrDragController&&controller===xrDragController){
        updateXRDragFromController(controller);
      }
      const slotMeshes=G.slots.filter(s=>!s.filled).map(s=>s.mesh);
      const hits=getControllerIntersections(controller,slotMeshes);
      if(hits.length){
        line.scale.z=Math.max(.08,hits[0].distance/5);
        setXRControllerHoverVisual(controller,true);
        const mesh=hits[0].object;
        if(!xrDragController||controller===xrDragController){
          G.aimSlot=G.slots.find(s=>s.mesh===mesh&&!s.filled)||G.aimSlot;
        }
      }else{
        line.scale.z=1;
        if(G.selectedMb&&(!xrDragController||controller===xrDragController)){
          G.aimSlot=findNearestSlotForMarble(G.selectedMb,.95);
        }
      }
    } else {
      line.scale.z=1;
    }
    if(line.userData.tip) line.userData.tip.position.z=-5*line.scale.z;
  });
  if(xrMouseSim.enabled){
    tip.style.opacity=hasMouseSimUiHit?'1':'0';
  }
}

function setupXRMouseSimulator(){
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-5)]);
  const line=new THREE.Line(lineGeo,new THREE.LineBasicMaterial({color:0xffe066,transparent:true,opacity:.95,depthTest:false,blending:THREE.AdditiveBlending}));
  line.name='xr-line';
  line.renderOrder=9998;
  line.userData.baseColor=0xffe066;
  line.userData.hoverColor=0xff6b00;
  line.userData.tipBaseColor=0xfff2a8;
  line.userData.tipHoverColor=0xfff9e0;
  const tipDot=new THREE.Mesh(
    new THREE.SphereGeometry(.013,10,10),
    new THREE.MeshBasicMaterial({color:0xfff2a8,transparent:true,opacity:.98,depthTest:false})
  );
  tipDot.position.z=-5;
  tipDot.renderOrder=9999;
  line.userData.tip=tipDot;

  const c=new THREE.Group();
  c.visible=false;
  c.userData.isMouseSim=true;
  c.userData.handedness='left';
  c.add(tipDot);
  c.add(line);
  scene.add(c);
  xrControllers.push(c);
  xrMouseSim.controller=c;
}

function updateXRMouseSimController(){
  if(!xrMouseSim.enabled||!xrMouseSim.controller) return;
  ray.setFromCamera(mouse,camera);
  xrMouseSim.controller.position.copy(ray.ray.origin);
  xrMouseAimDir.copy(ray.ray.direction).normalize();
  xrMouseSim.controller.quaternion.setFromUnitVectors(xrForwardRef,xrMouseAimDir);
  xrMouseSim.controller.updateMatrixWorld(true);
}

function setXRMouseSimEnabled(enabled){
  if(!VR_DEV_MODE){
    if(enabled) setXRStatus('VR mouse simulator is available only on localhost or ?dev=1');
    return;
  }
  if(xrMouseSim.enabled===enabled) return;
  xrMouseSim.enabled=enabled;
  if(xrMouseSim.controller) xrMouseSim.controller.visible=enabled;
  refreshXRWristHudAnchor();

  if(!enabled){
    xrUiSliderDragController=null;
    if(xrDragController===xrMouseSim.controller&&G.phase==='dragging'&&G.selectedMb){
      onXRSelectEnd({target:xrMouseSim.controller});
    }
    setXRStatus('Đã tắt giả lập VR Controller bằng chuột');
    return;
  }

  mouse.x=0;
  mouse.y=0;
  updateXRMouseSimController();
  setXRStatus('Giả lập VR Controller ON · Chuột trái=Trigger · R/T=Di chuyển · F2=tắt','ok');
  toast('Giả lập VR ON', 'inf', 900);
}

function createXRControllerHandle(handedness){
  const g=new THREE.Group();
  g.name='xr-controller-handle';
  const isLeft=handedness==='left';
  const bodyMat=new THREE.MeshStandardMaterial({
    color:isLeft?0x203a55:0x3d284f,
    roughness:.34,
    metalness:.45,
    emissive:isLeft?0x082236:0x22082d,
    emissiveIntensity:.35
  });
  const accentMat=new THREE.MeshBasicMaterial({
    color:isLeft?0x73eaff:0xff9cff,
    transparent:true,
    opacity:.72,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  });
  const grip=new THREE.Mesh(new THREE.CylinderGeometry(.026,.032,.18,16),bodyMat);
  grip.rotation.x=Math.PI*.5;
  grip.position.set(0,-.015,.04);
  g.add(grip);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.04,18,14),bodyMat);
  head.scale.set(1,.78,1.18);
  head.position.set(0,.005,-.045);
  g.add(head);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.052,.006,8,28),accentMat);
  ring.rotation.x=Math.PI*.5;
  ring.position.set(0,.006,-.045);
  g.add(ring);
  const trigger=new THREE.Mesh(new THREE.BoxGeometry(.018,.035,.012),accentMat);
  trigger.position.set(0,-.038,-.035);
  g.add(trigger);
  g.traverse(o=>{if(o.isMesh) o.renderOrder=9997;});
  return g;
}

function setupXRControllers(){
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-5)]);
  const lineMat=new THREE.LineBasicMaterial({color:0x00f5ff,transparent:true,opacity:.98,depthTest:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<2;i++){
    const c=renderer.xr.getController(i);
    c.userData.isMouseSim=false;
    c.userData.handedness=i===0?'left':'right';
    c.userData.xrConnected=false;
    const line=new THREE.Line(lineGeo,lineMat.clone());
    line.name='xr-line';
    line.renderOrder=9998;
    line.userData.baseColor=0x00f5ff;
    line.userData.hoverColor=0xff8f3a;
    line.userData.tipBaseColor=0x9dffff;
    line.userData.tipHoverColor=0xfff1b8;
    const tipDot=new THREE.Mesh(
      new THREE.SphereGeometry(.012,10,10),
      new THREE.MeshBasicMaterial({color:0x9dffff,transparent:true,opacity:.95,depthTest:false})
    );
    tipDot.position.z=-5;
    tipDot.renderOrder=9999;
    line.userData.tip=tipDot;
    c.add(createXRControllerHandle(c.userData.handedness));
    c.add(tipDot);
    c.add(line);
    c.addEventListener('connected',e=>{
      c.userData.xrConnected=true;
      if(e.data&&e.data.handedness) c.userData.handedness=e.data.handedness;
      refreshXRWristHudAnchor();
    });
    c.addEventListener('disconnected',()=>{
      c.userData.xrConnected=false;
      refreshXRWristHudAnchor();
    });
    c.addEventListener('selectstart',onXRSelectStart);
    c.addEventListener('selectend',onXRSelectEnd);
    c.addEventListener('squeezestart',onXRSqueezeStart);
    scene.add(c);
    xrControllers.push(c);
  }
}
setupXRControllers();
if(VR_DEV_MODE) setupXRMouseSimulator();
setupXRUI();
setupXRMenuUI();
ensureXRWristHud();
ensureXRVictoryArena();
ensureXRDefeatArena();
refreshXRWristHudAnchor();
renderer.xr.addEventListener('sessionstart',refreshPresentationMode);
renderer.xr.addEventListener('sessionend',refreshPresentationMode);
renderer.xr.addEventListener('sessionend',()=>{
  if(Math.abs(vrSessionOffset.x)>.001||Math.abs(vrSessionOffset.y)>.001){
    shiftPlayArea(-vrSessionOffset.x,-vrSessionOffset.y);
  }
  vrSessionOffset.set(0,0);
});

function getControllerIntersections(controller, meshes){
  tempMatrix.identity().extractRotation(controller.matrixWorld);
  ray.ray.origin.setFromMatrixPosition(controller.matrixWorld);
  ray.ray.direction.set(0,0,-1).applyMatrix4(tempMatrix);
  return ray.intersectObjects(meshes,false);
}

function getControllerAimedSlot(controller){
  const slotMeshes=G.slots.filter(s=>!s.filled).map(s=>s.mesh);
  if(!slotMeshes.length) return null;
  const hits=getControllerIntersections(controller,slotMeshes);
  if(!hits.length) return null;
  const mesh=hits[0].object;
  return G.slots.find(s=>s.mesh===mesh&&!s.filled)||null;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•


