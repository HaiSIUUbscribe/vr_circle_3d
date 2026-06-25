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

const VR_MOVE_RADIUS = 6.35;
let xrMoveRejectToastAt = 0;

function isVRMovePointAllowed(point){
  if(!point) return false;
  const cx=ancientEnv?ancientEnv.position.x:WG.position.x;
  const cz=ancientEnv?ancientEnv.position.z:WG.position.z;
  const dx=point.x-cx;
  const dz=point.z-cz;
  return dx*dx+dz*dz <= VR_MOVE_RADIUS*VR_MOVE_RADIUS;
}

function warnVRMoveRejected(){
  const now=performance.now();
  if(now-xrMoveRejectToastAt<900) return;
  xrMoveRejectToastAt=now;
  toast('Grip: vị trí ngoài sàn chơi', 'err', 850);
}

function onXRSelectStart(e){
  resumeAC();
  const controller=e.target;
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
    return;
  }

  if(G.mode==='special'&&G.specialLocked) return;

  if(G.phase==='idle'){
    const pickable=G.marbles.filter(m=>!m.grp.userData.placed&&!m.grp.userData.inFlight);
    const hits=getControllerIntersections(controller,pickable.map(m=>m.grp.userData.mm));
    if(!hits.length){
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

  return;
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
  if(!isVRMovePointAllowed(point)){
    warnVRMoveRejected();
    return;
  }

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
  if(!isVRMovePointAllowed(point)){
    warnVRMoveRejected();
    return true;
  }
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
  let boardInfoHit=null;
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
      const boardInfoItems=G.mode!=='archery'
        ? G.boardItems.filter(item=>item.placed&&item.dot&&item.dot.visible)
        : [];
      const boardHits=boardInfoItems.length
        ? getControllerIntersections(controller,boardInfoItems.map(item=>item.dot))
        : [];
      if(boardHits.length){
        const hit=boardHits[0];
        const item=boardInfoItems.find(entry=>entry.dot===hit.object);
        if(item&&!boardInfoHit) boardInfoHit={item,point:hit.point.clone()};
        line.scale.z=Math.max(.08,hit.distance/5);
        if(line.userData.tip) line.userData.tip.position.z=-5*line.scale.z;
        setXRControllerHoverVisual(controller,true);
        return;
      }

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
  if(boardInfoHit) showXRBoardColorInfo(boardInfoHit.item,boardInfoHit.point);
  else hideXRBoardColorInfo();
  if(xrMouseSim.enabled){
    tip.style.opacity=hasMouseSimUiHit?'1':'0';
  }
}

const xrMouseSimCamPos=new THREE.Vector3();
const xrMouseSimCamQuat=new THREE.Quaternion();
const xrMouseSimRight=new THREE.Vector3();
const xrMouseSimUp=new THREE.Vector3();
const xrMouseSimForward=new THREE.Vector3();

function createXRLowPolyHand(handedness){
  const hand=new THREE.Group();
  const isLeft=handedness==='left';
  const handSign=isLeft?-1:1;
  const gloveMat=new THREE.MeshStandardMaterial({
    color:isLeft?0x7adcf5:0xc6a0f6,
    roughness:.72,
    metalness:.02,
    flatShading:true
  });

  const palm=new THREE.Mesh(new THREE.BoxGeometry(.052,.06,.018),gloveMat);
  palm.position.set(0,0,.012);
  hand.add(palm);

  const wrist=new THREE.Mesh(new THREE.BoxGeometry(.038,.024,.018),gloveMat);
  wrist.position.set(0,-.041,.012);
  hand.add(wrist);

  [-.0195,-.0065,.0065,.0195].forEach((x,index)=>{
    const fingerLength=.031-Math.abs(index-1.5)*.003;
    const finger=new THREE.Mesh(
      new THREE.CylinderGeometry(.0058,.0064,fingerLength,6),
      gloveMat
    );
    finger.position.set(x,.03+fingerLength*.5,.012);
    hand.add(finger);
  });

  const thumb=new THREE.Mesh(
    new THREE.CylinderGeometry(.0064,.007,.029,6),
    gloveMat
  );
  thumb.position.set(.033*handSign,-.002,.012);
  thumb.rotation.z=-handSign*.9;
  hand.add(thumb);

  hand.position.set(0,-.015,.025);
  hand.rotation.x=-.12;
  hand.scale.setScalar(.62);
  hand.traverse(obj=>{if(obj.isMesh)obj.renderOrder=9997;});
  return hand;
}

function createXRSimHandModel(handedness){
  return createXRLowPolyHand(handedness);
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
  c.userData.handedness='right';
  c.add(createXRSimHandModel('right'));
  c.add(tipDot);
  c.add(line);
  scene.add(c);
  xrControllers.push(c);
  xrMouseSim.controller=c;

  const bowController=new THREE.Group();
  bowController.visible=false;
  bowController.userData.isMouseSim=true;
  bowController.userData.handedness='left';
  bowController.add(createXRSimHandModel('left'));
  scene.add(bowController);
  xrMouseSim.bowController=bowController;
}

function updateXRMouseSimController(){
  if(!xrMouseSim.enabled||!xrMouseSim.controller) return;
  ray.setFromCamera(mouse,camera);
  xrMouseAimDir.copy(ray.ray.direction).normalize();
  xrMouseSim.controller.position.copy(ray.ray.origin)
    .addScaledVector(xrMouseAimDir,xrMouseSim.handDepth);
  xrMouseSim.controller.quaternion.setFromUnitVectors(xrForwardRef,xrMouseAimDir);
  xrMouseSim.controller.updateMatrixWorld(true);

  if(xrMouseSim.bowController){
    camera.getWorldPosition(xrMouseSimCamPos);
    camera.getWorldQuaternion(xrMouseSimCamQuat);
    xrMouseSimRight.set(1,0,0).applyQuaternion(xrMouseSimCamQuat);
    xrMouseSimUp.set(0,1,0).applyQuaternion(xrMouseSimCamQuat);
    xrMouseSimForward.set(0,0,-1).applyQuaternion(xrMouseSimCamQuat);
    xrMouseSim.bowController.position.copy(xrMouseSimCamPos)
      .addScaledVector(xrMouseSimRight,-.28)
      .addScaledVector(xrMouseSimUp,-.06)
      .addScaledVector(xrMouseSimForward,.72);
    xrMouseSim.bowController.quaternion.copy(xrMouseSimCamQuat);
    xrMouseSim.bowController.updateMatrixWorld(true);
  }
}

function toggleXRMouseSimBow(){
  if(!xrMouseSim.enabled||!G.active||G.mode!=='archery'||!xrArchery.active) return false;
  const bowController=xrMouseSim.bowController;
  if(!bowController||!xrArchery.bowMesh) return false;
  if(xrArchery.bowHoldController===bowController){
    if(xrArchery.heldArrow) releaseArcheryHeldArrow(false);
    releaseArcheryBow();
    toast('Giả lập: đã đặt cung xuống bàn', 'inf', 800);
    return true;
  }
  if(xrArchery.bowHoldController) return false;
  updateXRMouseSimController();
  attachArcheryBow(bowController);
  toast('Giả lập: chọn rune màu · Click tâm dây để kéo', 'inf', 1100);
  return true;
}

function setXRMouseSimEnabled(enabled){
  if(!VR_DEV_MODE){
    if(enabled) setXRStatus('VR mouse simulator is available only on localhost or ?dev=1');
    return;
  }
  if(xrMouseSim.enabled===enabled) return;
  xrMouseSim.enabled=enabled;
  if(xrMouseSim.controller) xrMouseSim.controller.visible=enabled;
  if(xrMouseSim.bowController) xrMouseSim.bowController.visible=enabled;
  xrMouseSim.archeryMouseDown=false;
  xrMouseSim.handDepth=.38;
  refreshXRWristHudAnchor();

  if(!enabled){
    xrUiSliderDragController=null;
    if(xrArchery.arrowHoldController===xrMouseSim.controller&&xrArchery.heldArrow){
      releaseArcheryHeldArrow(false);
    }
    if(xrDragController===xrMouseSim.controller&&G.phase==='dragging'&&G.selectedMb){
      onXRSelectEnd({target:xrMouseSim.controller});
    }
    if(xrArchery.bowHoldController===xrMouseSim.bowController) releaseArcheryBow();
    setXRStatus('Đã tắt giả lập VR Controller bằng chuột');
    const simBtn=document.getElementById('archery-sim-btn');
    if(simBtn) simBtn.textContent='TEST ARCHERY';
    return;
  }

  mouse.x=0;
  mouse.y=0;
  updateXRMouseSimController();
  setXRStatus('Giả lập Archery · R=Cầm cung · Click rune/chạm dây · Kéo/Thả=Bắn · T=Di chuyển','ok');
  const simBtn=document.getElementById('archery-sim-btn');
  if(simBtn) simBtn.textContent='STOP TEST';
  toast('Giả lập VR ON', 'inf', 900);
}

function setupXRControllers(){
  const lineGeo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-5)]);
  const lineMat=new THREE.LineBasicMaterial({color:0x00f5ff,transparent:true,opacity:.98,depthTest:false,blending:THREE.AdditiveBlending});
  for(let i=0;i<2;i++){
    const c=renderer.xr.getController(i);
    const grip=renderer.xr.getControllerGrip(i);
    c.userData.isMouseSim=false;
    c.userData.handedness=i===0?'left':'right';
    c.userData.xrConnected=false;
    c.userData.grip=grip;
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
    c.add(tipDot);
    c.add(line);
    c.addEventListener('connected',e=>{
      c.userData.xrConnected=true;
      c.userData.inputSource=e.data||null;
      if(e.data&&e.data.handedness) c.userData.handedness=e.data.handedness;
      refreshXRWristHudAnchor();
    });
    c.addEventListener('disconnected',()=>{
      c.userData.xrConnected=false;
      c.userData.inputSource=null;
      refreshXRWristHudAnchor();
    });
    c.addEventListener('selectstart',onXRSelectStart);
    c.addEventListener('selectend',onXRSelectEnd);
    c.addEventListener('squeezestart',onXRSqueezeStart);
    scene.add(c);
    scene.add(grip);
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

