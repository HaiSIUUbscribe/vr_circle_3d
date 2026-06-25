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
  xrArchery.hitColorKeys.clear();
  xrArchery.lastHitColorName='';
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
    if(!quiet) toast('Đã chọn rune '+cd.name.toUpperCase(), 'inf', 700);
  }
}

const ARCHERY_BOW_RADIUS=.27;
const ARCHERY_MAX_DRAW=.35;
const ARCHERY_STRING_GRAB_RADIUS=.08;
const ARCHERY_STRING_RELEASE_LATERAL=.12;
const ARCHERY_TRAJECTORY_GRAVITY=9.8*.08;
const ARCHERY_TRAJECTORY_POINTS=16;

function makeArcheryArrowMesh(cd){
  const g=new THREE.Group();
  const teal=new THREE.Color(0x00e5cc);
  const arrowMat=new THREE.MeshStandardMaterial({
    color:teal,
    emissive:teal,
    emissiveIntensity:.6,
    metalness:.18,
    roughness:.3
  });
  const shaft=new THREE.Mesh(
    new THREE.CylinderGeometry(.006,.006,.22,6),
    arrowMat
  );
  g.add(shaft);
  const tip=new THREE.Mesh(
    new THREE.ConeGeometry(.012,.04,6),
    arrowMat
  );
  tip.position.y=.13;
  g.add(tip);
  g.userData.archeryColor=cd;
  return g;
}

function makeArcheryColorSelector(cd){
  const g=new THREE.Group();
  const col=new THREE.Color(cd.hex);
  const core=new THREE.Mesh(
    new THREE.CylinderGeometry(.055,.062,.026,6),
    new THREE.MeshStandardMaterial({
      color:col,
      emissive:col,
      emissiveIntensity:.55,
      metalness:.35,
      roughness:.3
    })
  );
  g.add(core);
  const rune=new THREE.Mesh(
    new THREE.TorusGeometry(.032,.005,6,18),
    new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  rune.rotation.x=Math.PI*.5;
  rune.position.y=.017;
  g.add(rune);
  g.userData.archeryColor=cd;
  return g;
}

function buildArcheryBow(){
  const bow=new THREE.Group();
  const bowMat=new THREE.MeshStandardMaterial({
    color:0x7b6fe8,
    emissive:0x3a2a8a,
    emissiveIntensity:.3,
    metalness:.6,
    roughness:.25
  });
  const arc=new THREE.Mesh(
    new THREE.TorusGeometry(ARCHERY_BOW_RADIUS,.015,6,36,Math.PI),
    bowMat
  );
  arc.rotation.z=Math.PI/2;
  bow.add(arc);

  const grip=new THREE.Mesh(
    new THREE.BoxGeometry(.035,.12,.032),
    new THREE.MeshStandardMaterial({color:0x31275f,roughness:.42,metalness:.35,emissive:0x17113d,emissiveIntensity:.25})
  );
  bow.add(grip);

  const runeMat=new THREE.MeshStandardMaterial({
    color:0xc4b8ff,
    emissive:0xc4b8ff,
    emissiveIntensity:1.2,
    roughness:.2,
    metalness:.1
  });
  const runeDots=[];
  [Math.PI*.24,Math.PI*.5,Math.PI*.76].forEach(angle=>{
    const dot=new THREE.Mesh(new THREE.SphereGeometry(.008,6,5),runeMat.clone());
    dot.position.set(
      -Math.sin(angle)*ARCHERY_BOW_RADIUS,
      Math.cos(angle)*ARCHERY_BOW_RADIUS,
      0
    );
    bow.add(dot);
    runeDots.push(dot);
  });

  const stringGeo=new THREE.BufferGeometry();
  stringGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array([
    0,ARCHERY_BOW_RADIUS,0,
    0,0,0,
    0,-ARCHERY_BOW_RADIUS,0
  ]),3));
  const stringLine=new THREE.Line(
    stringGeo,
    new THREE.LineBasicMaterial({color:0xe8e0ff,transparent:true,opacity:.9,linewidth:2,depthWrite:false})
  );
  stringLine.frustumCulled=false;
  bow.add(stringLine);

  const trajectoryGeo=new THREE.BufferGeometry();
  trajectoryGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(ARCHERY_TRAJECTORY_POINTS*3),3));
  const trajectoryLine=new THREE.Line(
    trajectoryGeo,
    new THREE.LineDashedMaterial({
      color:0x00ced1,
      transparent:true,
      opacity:.75,
      dashSize:.045,
      gapSize:.03,
      depthWrite:false
    })
  );
  trajectoryLine.visible=false;
  trajectoryLine.frustumCulled=false;
  bow.add(trajectoryLine);

  bow.userData.stringLine=stringLine;
  bow.userData.runeDots=runeDots;
  bow.userData.trajectoryLine=trajectoryLine;
  bow.userData.stringPull=new THREE.Vector3();
  bow.userData.stringSnapFrom=new THREE.Vector3();
  bow.userData.stringSnapStart=0;
  return bow;
}

const ARCHERY_BOW_REST_POS=new THREE.Vector3(-.18,.084,.02);
const ARCHERY_BOW_REST_ROT=new THREE.Euler(-Math.PI*.5,0,-.08);
const ARCHERY_BOW_HOLD_FORWARD_OFFSET=.035;
const ARCHERY_BOW_HOLD_VERTICAL_OFFSET=-.025;
const ARCHERY_BOW_HOLD_LATERAL_OFFSET=.035;
const ARCHERY_BOW_SIM_FORWARD_OFFSET=.055;
const ARCHERY_BOW_SIM_VERTICAL_OFFSET=-.018;
const ARCHERY_BOW_SIM_LATERAL_OFFSET=.015;
const ARCHERY_BOW_INWARD_YAW=.16;
const xrArcheryBowWorldPos=new THREE.Vector3();
const xrArcheryBowControllerQuat=new THREE.Quaternion();
const xrArcheryBowForward=new THREE.Vector3();
const xrArcheryBowUp=new THREE.Vector3();
const xrArcheryBowRight=new THREE.Vector3();
const xrArcheryBowZ=new THREE.Vector3();
const xrArcheryBowMatrix=new THREE.Matrix4();
const xrArcheryBowCenterWorld=new THREE.Vector3();
const xrArcheryControllerWorld=new THREE.Vector3();
const xrArcheryPullLocal=new THREE.Vector3();
const xrArcheryLaunchLocal=new THREE.Vector3();
const xrArcheryLaunchWorld=new THREE.Vector3();
const xrArcheryArrowWorldPos=new THREE.Vector3();
const xrArcheryTrajectoryPoint=new THREE.Vector3();
const xrArcheryLocalUp=new THREE.Vector3(0,1,0);

function pulseXRController(controller,intensity,duration){
  const gamepad=controller&&controller.userData&&controller.userData.inputSource
    ? controller.userData.inputSource.gamepad
    : null;
  if(!gamepad) return;
  const actuator=(gamepad.hapticActuators&&gamepad.hapticActuators[0])||gamepad.vibrationActuator;
  if(!actuator||typeof actuator.pulse!=='function') return;
  try{
    const result=actuator.pulse(intensity,duration);
    if(result&&typeof result.catch==='function') result.catch(()=>{});
  }catch(_err){}
}

function updateArcheryDrawVisuals(bow,pullPoint,drawRatio,t=0){
  if(!bow||!bow.userData.stringLine) return;
  const stringLine=bow.userData.stringLine;
  const positions=stringLine.geometry.attributes.position;
  positions.setXYZ(0,0,ARCHERY_BOW_RADIUS,0);
  positions.setXYZ(1,pullPoint.x,pullPoint.y,pullPoint.z);
  positions.setXYZ(2,0,-ARCHERY_BOW_RADIUS,0);
  positions.needsUpdate=true;

  const stringColor=drawRatio>.85?0xff4400:(drawRatio>.5?0xffaa00:0xffffff);
  stringLine.material.color.setHex(stringColor);
  stringLine.material.opacity=.9;

  const runeIntensity=.8+drawRatio*1.5+Math.sin(t*9)*drawRatio*.12;
  (bow.userData.runeDots||[]).forEach(dot=>{
    if(dot.material) dot.material.emissiveIntensity=runeIntensity;
  });

  xrArcheryLaunchLocal.copy(pullPoint).multiplyScalar(-1);
  if(xrArcheryLaunchLocal.lengthSq()<1e-6) xrArcheryLaunchLocal.set(0,0,-1);
  else xrArcheryLaunchLocal.normalize();

  if(xrArchery.heldArrow){
    xrArchery.heldArrow.position.copy(pullPoint).addScaledVector(xrArcheryLaunchLocal,.11);
    xrArchery.heldArrow.quaternion.setFromUnitVectors(xrArcheryLocalUp,xrArcheryLaunchLocal);
  }

  const trajectory=bow.userData.trajectoryLine;
  if(!trajectory) return;
  trajectory.visible=drawRatio>.3;
  if(!trajectory.visible) return;

  const speed=8+drawRatio*12;
  const trajectoryPositions=trajectory.geometry.attributes.position;
  for(let i=0;i<ARCHERY_TRAJECTORY_POINTS;i++){
    const flightTime=i*.075;
    xrArcheryTrajectoryPoint.copy(xrArcheryLaunchLocal).multiplyScalar(speed*flightTime);
    xrArcheryTrajectoryPoint.y-=.5*ARCHERY_TRAJECTORY_GRAVITY*flightTime*flightTime;
    xrArcheryTrajectoryPoint.addScaledVector(xrArcheryLaunchLocal,.14);
    trajectoryPositions.setXYZ(i,xrArcheryTrajectoryPoint.x,xrArcheryTrajectoryPoint.y,xrArcheryTrajectoryPoint.z);
  }
  trajectoryPositions.needsUpdate=true;
  trajectory.computeLineDistances();
}

function setArcheryBowRestTransform(){
  if(!xrArchery.bowMesh) return;
  xrArchery.bowMesh.position.copy(ARCHERY_BOW_REST_POS);
  xrArchery.bowMesh.rotation.copy(ARCHERY_BOW_REST_ROT);
  xrArchery.bowMesh.scale.setScalar(1);
  xrArchery.bowMesh.userData.stringPull.set(0,0,0);
  xrArchery.bowMesh.userData.stringSnapStart=0;
  updateArcheryDrawVisuals(xrArchery.bowMesh,xrArchery.bowMesh.userData.stringPull,0);
}

function updateHeldArcheryBowTransform(){
  const controller=xrArchery.bowHoldController;
  const bow=xrArchery.bowMesh;
  if(!controller||!bow) return;

  const handedness=controller.userData&&controller.userData.handedness==='right'?'right':'left';
  const handSign=handedness==='left'?-1:1;
  const isMouseSim=controller.userData&&controller.userData.isMouseSim;
  const poseSource=!isMouseSim&&controller.userData&&controller.userData.grip&&controller.userData.inputSource&&controller.userData.inputSource.gripSpace
    ? controller.userData.grip
    : controller;
  poseSource.getWorldPosition(xrArcheryBowWorldPos);
  const viewCamera=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;
  viewCamera.getWorldQuaternion(xrArcheryBowControllerQuat);
  xrArcheryBowForward.set(0,0,-1).applyQuaternion(xrArcheryBowControllerQuat);
  xrArcheryBowForward.y=0;
  if(xrArcheryBowForward.lengthSq()<1e-6){
    xrArcheryBowForward.set(0,0,-1).applyQuaternion(xrArchery.root.quaternion);
  }
  xrArcheryBowForward.normalize();

  xrArcheryBowUp.set(0,1,0);
  if(isMouseSim){
    xrArcheryBowRight.copy(xrArcheryBowForward).multiplyScalar(-1);
    xrArcheryBowZ.crossVectors(xrArcheryBowRight,xrArcheryBowUp).normalize();
  }else{
    poseSource.getWorldQuaternion(xrArcheryBowControllerQuat);
    xrArcheryBowForward.set(0,0,-1).applyQuaternion(xrArcheryBowControllerQuat).normalize();
    xrArcheryBowUp.set(0,1,0).applyQuaternion(xrArcheryBowControllerQuat).normalize();
    xrArcheryBowZ.copy(xrArcheryBowForward).multiplyScalar(-1);
    xrArcheryBowZ.applyAxisAngle(xrArcheryBowUp,-handSign*ARCHERY_BOW_INWARD_YAW);
    xrArcheryBowRight.crossVectors(xrArcheryBowUp,xrArcheryBowZ).normalize();
    if(xrArcheryBowRight.lengthSq()<1e-6){
      xrArcheryBowUp.set(0,1,0);
      xrArcheryBowRight.crossVectors(xrArcheryBowUp,xrArcheryBowZ).normalize();
    }
    xrArcheryBowUp.crossVectors(xrArcheryBowZ,xrArcheryBowRight).normalize();
  }
  xrArcheryBowMatrix.makeBasis(xrArcheryBowRight,xrArcheryBowUp,xrArcheryBowZ);

  if(isMouseSim){
    const simSide=handedness==='left'?1:-1;
    xrArcheryBowWorldPos
      .addScaledVector(xrArcheryBowZ,ARCHERY_BOW_SIM_LATERAL_OFFSET*simSide)
      .addScaledVector(xrArcheryBowUp,ARCHERY_BOW_SIM_VERTICAL_OFFSET)
      .addScaledVector(xrArcheryBowForward,ARCHERY_BOW_SIM_FORWARD_OFFSET);
  }else{
    xrArcheryBowWorldPos
      .addScaledVector(xrArcheryBowRight,ARCHERY_BOW_HOLD_LATERAL_OFFSET*-handSign)
      .addScaledVector(xrArcheryBowUp,ARCHERY_BOW_HOLD_VERTICAL_OFFSET)
      .addScaledVector(xrArcheryBowForward,ARCHERY_BOW_HOLD_FORWARD_OFFSET);
  }

  bow.position.copy(xrArcheryBowWorldPos);
  bow.quaternion.setFromRotationMatrix(xrArcheryBowMatrix);
  bow.scale.setScalar(1);
  bow.updateMatrixWorld(true);
}

function attachArcheryBow(controller){
  if(!xrArchery.bowMesh||xrArchery.bowHoldController) return false;
  xrArchery.bowHoldController=controller;
  scene.attach(xrArchery.bowMesh);
  updateHeldArcheryBowTransform();
  toast('Đã cầm cung', 'inf', 650);
  return true;
}

function releaseArcheryBow(){
  if(!xrArchery.bowMesh) return;
  if(xrArchery.heldArrow) releaseArcheryHeldArrow(false);
  xrArchery.tableRig.attach(xrArchery.bowMesh);
  setArcheryBowRestTransform();
  xrArchery.bowHoldController=null;
}

function getArcherySelectorHit(controller){
  const visibles=xrArchery.arrowStands.filter(a=>a.visible);
  if(!visibles.length) return null;
  const selectorMeshes=[];
  visibles.forEach(stand=>{
    stand.traverse(obj=>{
      if(obj.isMesh) selectorMeshes.push(obj);
    });
  });
  const hits=getControllerIntersections(controller,selectorMeshes);
  if(!hits.length) return null;
  let node=hits[0].object;
  while(node&&node!==xrArchery.tableRig){
    if(node.userData&&node.userData.archeryColor) return node;
    node=node.parent;
  }
  return null;
}

function trySelectArcheryColor(controller){
  const selector=getArcherySelectorHit(controller);
  if(!selector) return false;
  setArcherySelectedColor(selector.userData.archeryColor,selector);
  return true;
}

function tryGrabArcheryString(controller){
  if(!xrArchery.active||xrArchery.arrowHoldController||!xrArchery.bowHoldController||!xrArchery.bowMesh) return false;
  const bow=xrArchery.bowMesh;
  bow.updateMatrixWorld(true);
  bow.getWorldPosition(xrArcheryBowCenterWorld);
  controller.getWorldPosition(xrArcheryControllerWorld);

  let grabDistance=xrArcheryControllerWorld.distanceTo(xrArcheryBowCenterWorld);
  if(controller.userData&&controller.userData.isMouseSim){
    grabDistance=ray.ray.distanceToPoint(xrArcheryBowCenterWorld);
    if(grabDistance<ARCHERY_STRING_GRAB_RADIUS){
      ray.ray.closestPointToPoint(xrArcheryBowCenterWorld,xrArcheryControllerWorld);
      xrMouseSim.handDepth=ray.ray.origin.distanceTo(xrArcheryControllerWorld);
      xrMouseSim.grabStartDepth=xrMouseSim.handDepth;
      controller.position.copy(xrArcheryControllerWorld);
      controller.updateMatrixWorld(true);
    }
  }
  if(grabDistance>=ARCHERY_STRING_GRAB_RADIUS) return false;

  const held=makeArcheryArrowMesh(xrArchery.selectedCd||LEVELS[G.lvIdx].colors[0]);
  bow.add(held);

  xrArchery.heldArrow=held;
  xrArchery.arrowHoldController=controller;
  xrArchery.pullStrength=0;
  bow.userData.stringSnapStart=0;
  bow.userData.stringPull.set(0,0,0);
  updateArcheryDrawVisuals(bow,bow.userData.stringPull,0);
  pulseXRController(xrArchery.bowHoldController,.2,80);
  toast('Đã nock tên · Kéo tay phải và thả trigger để bắn', 'inf', 900);
  return true;
}

function releaseArcheryHeldArrow(shoot=false){
  const held=xrArchery.heldArrow;
  const ctrl=xrArchery.arrowHoldController;
  if(!held) return false;

  const cd=held.userData.archeryColor||xrArchery.selectedCd;
  const bow=xrArchery.bowMesh;
  const drawRatio=xrArchery.pullStrength;

  if(shoot&&ctrl&&xrArchery.bowHoldController&&bow){
    xrArcheryPullLocal.copy(bow.userData.stringPull);
    xrArcheryLaunchLocal.copy(xrArcheryPullLocal).multiplyScalar(-1);
    if(xrArcheryLaunchLocal.lengthSq()<1e-6) xrArcheryLaunchLocal.set(0,0,-1);
    else xrArcheryLaunchLocal.normalize();
    bow.getWorldQuaternion(xrArcheryBowControllerQuat);
    xrArcheryLaunchWorld.copy(xrArcheryLaunchLocal).applyQuaternion(xrArcheryBowControllerQuat).normalize();
    bow.getWorldPosition(xrArcheryBowCenterWorld);

    scene.attach(held);
    xrArcheryArrowWorldPos.copy(xrArcheryBowCenterWorld).addScaledVector(xrArcheryLaunchWorld,.14);
    held.position.copy(xrArcheryArrowWorldPos);
    held.quaternion.setFromUnitVectors(xrArcheryLocalUp,xrArcheryLaunchWorld);
    const speed=8+drawRatio*12;
    xrArchery.projectiles.push({
      mesh:held,
      vel:xrArcheryLaunchWorld.clone().multiplyScalar(speed),
      mass:1,
      drag:.035,
      life:0,
      cd
    });
    xrArchery.totalShots++;
    xrArchery.lastShotAt=performance.now();
    pulseXRController(ctrl,.7,40);
    sfx.throw();
  }else{
    removeAndDispose(null,held);
  }

  if(bow){
    bow.userData.stringSnapFrom.copy(bow.userData.stringPull);
    bow.userData.stringSnapStart=performance.now();
    if(bow.userData.trajectoryLine) bow.userData.trajectoryLine.visible=false;
  }
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
  xrArchery.hitGoal=cols.length;
  xrArchery.correctHits=0;
  xrArchery.hitColorKeys.clear();
  xrArchery.lastHitColorName='';
  xrArchery.totalShots=0;
  xrArchery.lastShotAt=0;
  xrArchery.pullStrength=0;
  xrArchery.bowHoldController=null;
  xrArchery.arrowHoldController=null;

  if(!xrArchery.anchorValid){
    xrArchery.anchorPosition.set(0,0,0);
    xrArchery.anchorYaw=0;
    if(renderer.xr.isPresenting||xrMouseSim.enabled){
      const xrCam=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;
      xrCam.getWorldPosition(xrHeadPos);
      xrCam.getWorldQuaternion(vrAlignQuat);
      vrAlignForward.set(0,0,-1).applyQuaternion(vrAlignQuat).setY(0);
      if(vrAlignForward.lengthSq()<1e-6) vrAlignForward.set(0,0,-1);
      else vrAlignForward.normalize();
      xrArchery.anchorPosition.set(xrHeadPos.x,0,xrHeadPos.z);
      xrArchery.anchorYaw=Math.atan2(-vrAlignForward.x,-vrAlignForward.z);
    }
    xrArchery.anchorValid=true;
  }
  xrArchery.root.position.copy(xrArchery.anchorPosition);
  xrArchery.root.rotation.set(0,xrArchery.anchorYaw,0);
  xrArchery.root.add(xrArchery.targetRig);
  xrArchery.root.add(xrArchery.tableRig);
  scene.add(xrArchery.root);

  if(xrMouseSim.enabled&&!renderer.xr.isPresenting){
    const simLookTarget=new THREE.Vector3(0,.72,-4.2);
    xrArchery.root.updateMatrixWorld(true);
    xrArchery.root.localToWorld(simLookTarget);
    camera.lookAt(simLookTarget);
    camera.updateMatrixWorld(true);
  }

  xrArchery.targetRig.clear();
  xrArchery.tableRig.clear();
  xrArchery.arrowStands.length=0;

  const targetPos=new THREE.Vector3(0,1.48,-5.9);
  xrArchery.targetRig.position.copy(targetPos);

  const inVrMode=isImmersiveVR();
  const targetSegments=inVrMode?48:72;
  const ringSegments=inVrMode?60:96;

  const targetBack=new THREE.Mesh(
    new THREE.CylinderGeometry(.92,.92,.24,targetSegments,1),
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
      new THREE.RingGeometry(r-.012,r+.006,ringSegments),
      new THREE.MeshBasicMaterial({color:0x3f2b1a,transparent:true,opacity:.34,depthWrite:false})
    );
    groove.position.z=.082+idx*.001;
    xrArchery.targetRig.add(groove);
  });

  const ringGlow=new THREE.Mesh(
    new THREE.TorusGeometry(.93,.026,8,inVrMode?56:84),
    new THREE.MeshBasicMaterial({color:0x9bf3ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  ringGlow.position.z=.084;
  xrArchery.targetRig.add(ringGlow);

  const segLen=(Math.PI*2)/cols.length;
  cols.forEach((cd,i)=>{
    const seg=new THREE.Mesh(
      new THREE.RingGeometry(.34,.78,inVrMode?30:42,1,i*segLen,segLen*.96),
      new THREE.MeshStandardMaterial({color:new THREE.Color(cd.hex),roughness:.36,metalness:.22,emissive:new THREE.Color(cd.hex).multiplyScalar(.22),emissiveIntensity:.65,side:THREE.DoubleSide})
    );
    seg.position.z=.086;
    seg.userData.archeryColor=cd;
    xrArchery.targetRig.add(seg);
    xrArchery.rings.push(seg);
  });

  const centerDisc=new THREE.Mesh(
    new THREE.CircleGeometry(.11,inVrMode?22:32),
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

  const tablePos=new THREE.Vector3(0,.85,-2.35);
  xrArchery.tableRig.position.copy(tablePos);

  const tableTop=new THREE.Mesh(
    new THREE.CylinderGeometry(1.05,1.05,.08,inVrMode?36:56),
    new THREE.MeshStandardMaterial({color:0x071020,roughness:.64,metalness:.58,emissive:0x0a1f38,emissiveIntensity:.6})
  );
  xrArchery.tableRig.add(tableTop);

  const tableLeg=new THREE.Mesh(
    new THREE.CylinderGeometry(.18,.22,.62,inVrMode?18:28),
    new THREE.MeshStandardMaterial({color:0x0c1a2f,roughness:.72,metalness:.55,emissive:0x07162a,emissiveIntensity:.32})
  );
  tableLeg.position.y=-.35;
  xrArchery.tableRig.add(tableLeg);

  const bowCradleMat=new THREE.MeshStandardMaterial({
    color:0x162a3d,
    roughness:.42,
    metalness:.72,
    emissive:0x0b4056,
    emissiveIntensity:.48
  });
  [-.24,.24].forEach(z=>{
    const cradle=new THREE.Mesh(new THREE.CylinderGeometry(.038,.046,.03,16),bowCradleMat);
    cradle.position.set(ARCHERY_BOW_REST_POS.x-.21,.055,ARCHERY_BOW_REST_POS.z+z*.78);
    xrArchery.tableRig.add(cradle);
  });

  xrArchery.bowMesh=buildArcheryBow();
  xrArchery.tableRig.add(xrArchery.bowMesh);
  setArcheryBowRestTransform();

  xrArchery.bowPickup=new THREE.Mesh(
    new THREE.BoxGeometry(.42,.14,.62),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.001,depthWrite:false})
  );
  xrArchery.bowPickup.position.set(
    ARCHERY_BOW_REST_POS.x-.19,
    ARCHERY_BOW_REST_POS.y+.025,
    ARCHERY_BOW_REST_POS.z
  );
  xrArchery.tableRig.add(xrArchery.bowPickup);

  cols.forEach((cd,i)=>{
    const a=(-Math.PI*.55)+(i/(Math.max(1,cols.length-1)))*(Math.PI*1.1);
    const stand=makeArcheryColorSelector(cd);
    stand.position.set(Math.sin(a)*.72,.035,Math.cos(a)*.26);
    stand.userData.archeryColor=cd;
    stand.userData.baseY=stand.position.y;

    const glow=new THREE.Mesh(
      new THREE.SphereGeometry(.12,12,12),
      new THREE.MeshBasicMaterial({color:new THREE.Color(cd.hex),transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    glow.position.y=.035;
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
  toast('ARCHERY VR: cầm cung, chọn rune màu, chạm tâm dây rồi kéo-thả để bắn!', 'inf', 2600);
  syncHoloPanel(lv,cols[0]);
}

function dimArcheryColorHit(ring,cd){
  if(!ring||!cd) return false;
  const key=cd.hex.toLowerCase();
  xrArchery.lastHitColorName=cd.name.toUpperCase();
  if(xrArchery.hitColorKeys.has(key)) return false;

  xrArchery.hitColorKeys.add(key);
  ring.userData.archeryCompleted=true;
  if(ring.material){
    ring.material.transparent=true;
    ring.material.opacity=.24;
    ring.material.emissiveIntensity=.06;
    ring.material.roughness=.9;
    ring.material.metalness=.04;
    ring.material.needsUpdate=true;
  }
  return true;
}

function stickArcheryProjectile(projectile,hitPoint){
  if(!projectile||!projectile.mesh||!hitPoint) return;
  xrArcheryLaunchWorld.copy(projectile.vel);
  if(xrArcheryLaunchWorld.lengthSq()<1e-6) xrArcheryLaunchWorld.set(0,0,-1);
  else xrArcheryLaunchWorld.normalize();
  projectile.mesh.position.copy(hitPoint).addScaledVector(xrArcheryLaunchWorld,-.12);
  projectile.mesh.quaternion.setFromUnitVectors(xrArcheryLocalUp,xrArcheryLaunchWorld);
  projectile.mesh.userData.archeryStuck=true;
  xrArchery.targetRig.attach(projectile.mesh);
}

function resolveArcheryHit(projectile,ring,hitPoint){
  const hitCd=ring.userData.archeryColor;
  const shotCd=projectile.cd;
  const isCenter=!!(ring.userData&&ring.userData.archeryCenter);
  const correct=isCenter||!!(hitCd&&shotCd&&hitCd.hex.toLowerCase()===shotCd.hex.toLowerCase());

  if(correct){
    const newColor=!isCenter&&hitCd ? dimArcheryColorHit(ring,hitCd) : false;
    G.combo++;
    G.maxCombo=Math.max(G.maxCombo,G.combo);
    const basePts=(G.mode==='hard'?24:14)*Math.min(G.combo,6);
    const pts=isCenter
      ? Math.round(basePts*2.6)
      : (newColor?basePts:Math.max(2,Math.round(basePts*.25)));
    G.score+=pts;
    xrArchery.correctHits=xrArchery.hitColorKeys.size;
    sfx.ok();
    showCombo(G.combo,pts);
    spawnParticles(hitPoint.clone(),isCenter?'#ffd579':shotCd.hex,true);
    const hitMessage=isCenter
      ? 'BULLSEYE +'+pts
      : (newColor
          ? '✓ '+shotCd.name.toUpperCase()+' đã tối đi!'
          : '↻ '+shotCd.name.toUpperCase()+' đã được xử lý');
    toast(hitMessage, 'ok', isCenter?1100:950);
  }else{
    G.combo=1;
    if(G.mode==='hard') G.score=Math.max(0,G.score-6);
    sfx.bad();
    spawnParticles(hitPoint.clone(),shotCd?shotCd.hex:'#66d7ff',false);
    toast('✕ Sai màu! Trúng '+(hitCd?hitCd.name.toUpperCase():'mục tiêu'), 'err', 1000);
  }

  if(ring.visible){
    ring.scale.setScalar(1.08);
    setTimeout(()=>{if(ring&&ring.scale) ring.scale.setScalar(1);},130);
  }

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
  if(tryGrabArcheryString(controller)) return true;
  return trySelectArcheryColor(controller);
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
    p.vel.addScaledVector(xrArcheryGravity,dt);
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
      const activeRings=xrArchery.rings.filter(r=>!(r.userData&&r.userData.archeryCompleted));
      const hits=activeRings.length?xrArcheryRay.intersectObjects(activeRings,false):[];
      if(hits.length&&hits[0].distance<=stepLen+.02){
        resolveArcheryHit(p,hits[0].object,hits[0].point.clone());
        stickArcheryProjectile(p,hits[0].point);
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
  if(xrArchery.bowHoldController) updateHeldArcheryBowTransform();
  updateArcheryProjectiles(dt);
  xrArchery.tableRig.rotation.y=Math.sin(t*.5)*.05;

  xrArchery.arrowStands.forEach((n,i)=>{
    if(!n.visible) return;
    n.position.y=(n.userData.baseY||.08)+Math.sin(t*2.1+i*.55)*.01;
    if(n.userData.modeGlow&&n.userData.modeGlow.material){
      const selected=(xrArchery.selectedCd&&n.userData.archeryColor&&n.userData.archeryColor.hex===xrArchery.selectedCd.hex);
      n.userData.modeGlow.material.opacity=(selected?.35:.14)+Math.sin(t*2.8+i)*.03;
    }
  });

  const bow=xrArchery.bowMesh;
  if(xrArchery.bowHoldController&&bow&&xrArchery.heldArrow&&xrArchery.arrowHoldController){
    xrArchery.arrowHoldController.getWorldPosition(xrArcheryControllerWorld);
    xrArcheryPullLocal.copy(xrArcheryControllerWorld);
    bow.worldToLocal(xrArcheryPullLocal);
    const rawDrawDistance=xrArcheryPullLocal.length();
    const isMouseDraw=xrArchery.arrowHoldController.userData&&xrArchery.arrowHoldController.userData.isMouseSim;
    if(!isMouseDraw&&rawDrawDistance>ARCHERY_MAX_DRAW+ARCHERY_STRING_RELEASE_LATERAL){
      xrArcheryPullLocal.normalize().multiplyScalar(ARCHERY_MAX_DRAW);
      xrArchery.pullStrength=1;
      bow.userData.stringPull.copy(xrArcheryPullLocal);
      updateArcheryDrawVisuals(bow,bow.userData.stringPull,1,t);
      releaseArcheryHeldArrow(true);
      return;
    }
    if(rawDrawDistance>ARCHERY_MAX_DRAW){
      xrArcheryPullLocal.multiplyScalar(ARCHERY_MAX_DRAW/rawDrawDistance);
    }
    xrArchery.pullStrength=Math.max(0,Math.min(1,rawDrawDistance/ARCHERY_MAX_DRAW));
    bow.userData.stringPull.copy(xrArcheryPullLocal);
    updateArcheryDrawVisuals(bow,bow.userData.stringPull,xrArchery.pullStrength,t);
  }else if(bow){
    xrArchery.pullStrength=0;
    if(bow.userData.stringSnapStart){
      const snapRatio=Math.min(1,(performance.now()-bow.userData.stringSnapStart)/80);
      const eased=1-Math.pow(1-snapRatio,3);
      bow.userData.stringPull.copy(bow.userData.stringSnapFrom).multiplyScalar(1-eased);
      updateArcheryDrawVisuals(
        bow,
        bow.userData.stringPull,
        bow.userData.stringPull.length()/ARCHERY_MAX_DRAW,
        t
      );
      if(snapRatio>=1){
        bow.userData.stringSnapStart=0;
        bow.userData.stringPull.set(0,0,0);
        updateArcheryDrawVisuals(bow,bow.userData.stringPull,0,t);
      }
    }else{
      bow.userData.stringPull.set(0,0,0);
      updateArcheryDrawVisuals(bow,bow.userData.stringPull,0,t);
    }
  }
}
