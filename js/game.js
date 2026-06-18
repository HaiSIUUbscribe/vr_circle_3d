//  WHEEL GROUP
const WG=new THREE.Group();scene.add(WG);
const RING_R=2.8,SLOT_R=.32,MARBLE_R=.27;
const MARBLE_RACK=new THREE.Group();scene.add(MARBLE_RACK);
const BOARD=new THREE.Group();scene.add(BOARD);
BOARD.position.set(5.15,1.55,-.85);
BOARD.rotation.y=-.55;

const outerRing=new THREE.Mesh(new THREE.TorusGeometry(RING_R+.12,.07,12,90),new THREE.MeshStandardMaterial({color:0x00f5ff,emissive:0x004455,roughness:.25,metalness:.85}));
outerRing.rotation.x=Math.PI/2;WG.add(outerRing);
const innerRing=new THREE.Mesh(new THREE.TorusGeometry(RING_R*.36,.045,8,60),new THREE.MeshStandardMaterial({color:0x00f5ff,emissive:0x003344,roughness:.3,metalness:.8}));
innerRing.rotation.x=Math.PI/2;WG.add(innerRing);
const midRing=new THREE.Mesh(new THREE.TorusGeometry(RING_R*.7,.02,6,60),new THREE.MeshStandardMaterial({color:0xa855f7,emissive:0x220044,roughness:.4,metalness:.6,transparent:true,opacity:.6}));
midRing.rotation.set(Math.PI/2,0,0);
WG.add(midRing);
WG.add(new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.06,32),new THREE.MeshStandardMaterial({color:0x000d1a,roughness:.5,metalness:.9,emissive:0x001a33})));
const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.18),new THREE.MeshStandardMaterial({color:0x00f5ff,emissive:0x004466,roughness:.1,metalness:.9}));
gem.position.y=.08;WG.add(gem);
const baseRing=new THREE.Mesh(new THREE.CylinderGeometry(RING_R+.4,RING_R+.5,.08,64),new THREE.MeshStandardMaterial({color:0x010810,roughness:.8,metalness:.4,transparent:true,opacity:.85}));
baseRing.position.set(0,-.07,0);
WG.add(baseRing);

//  AIM CANVAS (2D overlay for trajectory)
const aimCanvas=document.getElementById('aim-canvas');
const aimCtx=aimCanvas.getContext('2d');
// NgÄƒn khÃ´ng cho canvas cháº·n click cá»§a chuá»™t
aimCanvas.style.pointerEvents = 'none';

function resizeAimCanvas(){aimCanvas.width=innerWidth;aimCanvas.height=innerHeight;}
resizeAimCanvas();

//  GAME STATE
let G={
  mode:'easy',lvIdx:0,score:0,combo:1,maxCombo:1,
  timer:0,timerInt:null,startTime:0,
  slots:[],marbles:[],placed:{},
  boardItems:[],
  boardFx:{rings:[],starMat:null},
  phase:'idle',
  selectedMb:null,
  aimSlot:null,
  active:false,
  specialHidden:false,
  specialLocked:false,
  specialRevealEnd:0,
};

const inFlight=[];
const burstParticles=[];
const xrArchery={
  active:false,
  root:new THREE.Group(),
  targetRig:new THREE.Group(),
  quiverRig:new THREE.Group(),
  tableRig:new THREE.Group(),
  rings:[],
  colorNodes:[],
  arrowStands:[],
  projectiles:[],
  selectedCd:null,
  selectedNode:null,
  bowMesh:null,
  bowPickup:null,
  bowHoldController:null,
  arrowHoldController:null,
  heldArrow:null,
  pullStrength:0,
  hitGoal:0,
  correctHits:0,
  totalShots:0,
  lastShotAt:0,
  wind:new THREE.Vector3(),
};
const xrArcheryGravity=new THREE.Vector3(0,-7.2,0);
const xrArcheryRay=new THREE.Raycaster();
const xrArcheryPrevPos=new THREE.Vector3();
const xrArcheryStepDir=new THREE.Vector3();
const ARCHERY_PROJECTILE_TTL=4.2;
const ARCHERY_PROJECTILE_FLOOR_PAD=.08;
let lvDoneTmr=null;
let lvAdvanceTmr=null;
let endGameTmr=null;
let specialHideTmr=null;
let specialGuideInt=null;

function getLevelShortName(badge){
  return (badge.split('-').slice(1).join('-')||badge).trim();
}

function getHoloGuideLines(lv=LEVELS[G.lvIdx],targetCd=null){
  const revealLeft=Math.max(0,Math.ceil((G.specialRevealEnd-Date.now())/1000));
  const interactingWithMarble = !!G.selectedMb || G.phase==='dragging';

  if(G.mode==='archery'){
    return [
      'Left trigger: hold bow. Right trigger: pull arrow.',
      'Release right trigger to shoot. Grip: move.',
      targetCd
        ? 'Target color: '+targetCd.name+'. Aim at wrist MENU to open menu.'
        : 'Match arrow color to target color. Aim at wrist MENU to open menu.'
    ];
  }

  return [
    'Chọn bi trong marble rack để kích hoạt đường ném.',
    'Giữ và kéo thả vào ô cùng màu.',
    interactingWithMarble
      ? ''
      : ((G.mode==='special'&&G.specialLocked)
          ? 'Chế độ Special: màu sẽ tắt sau '+revealLeft+'s.'
          : ((G.mode==='special'&&G.specialHidden)
              ? 'Chế độ Special: màu đang bị ẩn, hãy đặt theo trí nhớ.'
              : 'Mục tiêu: chọn một viên bi để bắt đầu.'))
  ];
}

function pathRoundedRect(ctx,x,y,w,h,r){
  const rr=Math.min(r,w*.5,h*.5);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.lineTo(x+w-rr,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+rr);
  ctx.lineTo(x+w,y+h-rr);
  ctx.quadraticCurveTo(x+w,y+h,x+w-rr,y+h);
  ctx.lineTo(x+rr,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-rr);
  ctx.lineTo(x,y+rr);
  ctx.quadraticCurveTo(x,y,x+rr,y);
  ctx.closePath();
}

function createCurvedPanelGeometry(width,height,curveDepth,segments=40){
  const geo=new THREE.PlaneGeometry(width,height,segments,16);
  const pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i);
    const y=pos.getY(i);
    const nx=x/(width*.5);
    const ny=y/(height*.5);
    pos.setZ(i,curveDepth*(nx*nx*.92+ny*ny*.12));
  }
  pos.needsUpdate=true;
  geo.computeVertexNormals();
  return geo;
}

function drawXRCurvedHoloPanel(lv=LEVELS[G.lvIdx],guideLines=getHoloGuideLines(lv),targetCd=null){
  if(!xrHoloCtx||!xrHoloCanvas||!xrHoloTexture||!lv) return;
  const ctx=xrHoloCtx;
  const w=xrHoloCanvas.width;
  const h=xrHoloCanvas.height;

  ctx.clearRect(0,0,w,h);

  const accent='#00eaff';
  const accentStrong='rgba(0,234,255,.92)';
  const accentSoft='rgba(120,248,255,.36)';
  const textWhite='rgba(244,252,255,.98)';
  const textGold='rgba(255,216,122,.95)';

  const drawSharpPanel=(x,y,pw,ph,cut)=>{
    ctx.beginPath();
    ctx.moveTo(x+cut,y);
    ctx.lineTo(x+pw-cut,y);
    ctx.lineTo(x+pw,y+cut);
    ctx.lineTo(x+pw,y+ph-cut);
    ctx.lineTo(x+pw-cut,y+ph);
    ctx.lineTo(x+cut,y+ph);
    ctx.lineTo(x,y+ph-cut);
    ctx.lineTo(x,y+cut);
    ctx.closePath();
  };

  drawSharpPanel(16,16,w-32,h-32,44);
  const bg=ctx.createLinearGradient(0,16,0,h-16);
  bg.addColorStop(0,'rgba(6,22,36,.2)');
  bg.addColorStop(.5,'rgba(5,18,28,.28)');
  bg.addColorStop(1,'rgba(4,14,24,.18)');
  ctx.fillStyle=bg;
  ctx.fill();
  ctx.shadowColor='rgba(0,240,255,.52)';
  ctx.shadowBlur=22;
  ctx.strokeStyle=accentStrong;
  ctx.lineWidth=3.2;
  ctx.stroke();
  ctx.shadowBlur=0;

  drawSharpPanel(36,32,w-72,h-64,34);
  ctx.strokeStyle='rgba(144,246,255,.28)';
  ctx.lineWidth=1.8;
  ctx.stroke();

  const cornerGlyph=(x,y,sx,sy)=>{
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+sx*22,y);
    ctx.lineTo(x+sx*30,y+sy*10);
    ctx.lineTo(x+sx*52,y+sy*10);
    ctx.stroke();
  };
  ctx.strokeStyle='rgba(150,252,255,.82)';
  ctx.lineWidth=2;
  cornerGlyph(58,62,1,1);
  cornerGlyph(w-58,62,-1,1);
  cornerGlyph(58,h-62,1,-1);
  cornerGlyph(w-58,h-62,-1,-1);

  drawSharpPanel(w*.5-194,40,388,72,28);
  ctx.fillStyle='rgba(8,26,40,.26)';
  ctx.fill();
  ctx.strokeStyle='rgba(136,246,255,.8)';
  ctx.lineWidth=2.1;
  ctx.stroke();

  pathRoundedRect(ctx,90,142,w-180,h-196,20);
  ctx.fillStyle='rgba(6,20,34,.16)';
  ctx.fill();
  ctx.strokeStyle='rgba(126,236,255,.34)';
  ctx.lineWidth=1.8;
  ctx.stroke();

  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='rgba(170,250,255,.72)';
  ctx.font='700 17px "Courier New",Consolas,monospace';
  ctx.fillText('VR TRAINING PANEL',w*.5,64);

  ctx.fillStyle=textGold;
  ctx.shadowColor='rgba(255,214,120,.56)';
  ctx.shadowBlur=12;
  ctx.font='700 38px "Courier New",Consolas,monospace';
  ctx.fillText(lv.badge,w*.5,98);
  ctx.shadowBlur=0;

  ctx.textAlign='left';
  ctx.fillStyle=textGold;
  ctx.font='700 33px "Courier New",Consolas,monospace';
  ctx.fillText('Huong dan:',124,192);

  const mainGuide=(guideLines&&guideLines[1])||'Giu bi va keo tha vao o dich';
  ctx.fillStyle=textWhite;
  ctx.font='700 31px "Courier New",Consolas,monospace';
  ctx.fillText('> '+mainGuide,124,258);

  const modeGuide=(guideLines&&guideLines[2])||'';
  if(modeGuide){
    const modeGuideY=targetCd?372:316;
    ctx.fillStyle=(G.mode==='special'&&G.specialHidden&&!targetCd)
      ? 'rgba(255,218,132,.98)'
      : 'rgba(224,248,255,.94)';
    ctx.font='700 26px "Courier New",Consolas,monospace';
    ctx.fillText('- '+modeGuide,124,modeGuideY);
  }

  if(targetCd){
    const labelText='Muc tieu: ';
    const nameText=targetCd.name.toUpperCase();
    ctx.font='700 28px "Courier New",Consolas,monospace';
    const tagW=ctx.measureText(labelText).width+ctx.measureText(nameText).width+52;
    drawSharpPanel(124,286,tagW,52,14);
    ctx.fillStyle='rgba(8,24,40,.22)';
    ctx.fill();
    ctx.strokeStyle='rgba(0,234,255,.9)';
    ctx.lineWidth=1.7;
    ctx.stroke();

    ctx.fillStyle='rgba(196,248,255,.98)';
    ctx.fillText(labelText,146,320);

    ctx.fillStyle=targetCd.hex||textGold;
    ctx.shadowColor=targetCd.hex||textGold;
    ctx.shadowBlur=12;
    ctx.fillText(nameText,146+ctx.measureText(labelText).width,320);
    ctx.shadowBlur=0;
  }

  xrHoloTexture.needsUpdate=true;
}

function ensureXRCurvedHoloPanel(){
  if(xrHoloPanelMesh) return;

  xrHoloCanvas=document.createElement('canvas');
  xrHoloCanvas.width=1024;
  xrHoloCanvas.height=560;
  xrHoloCtx=xrHoloCanvas.getContext('2d');
  xrHoloTexture=new THREE.CanvasTexture(xrHoloCanvas);
  xrHoloTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrHoloTexture.needsUpdate=true;

  const panelGeo=createCurvedPanelGeometry(2.34,1.06,0.3,56);
  const panelMat=new THREE.MeshBasicMaterial({
    map:xrHoloTexture,
    transparent:true,
    opacity:.98,
    depthWrite:false,
    side:THREE.DoubleSide
  });
  xrHoloPanelMesh=new THREE.Mesh(panelGeo,panelMat);
  xrCurvedHolo.add(xrHoloPanelMesh);

  xrHoloAccentGlow=new THREE.Mesh(
    createCurvedPanelGeometry(2.48,1.16,.42,56),
    new THREE.MeshBasicMaterial({color:0x8fefff,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})
  );
  xrHoloAccentGlow.position.z=-.01;
  xrCurvedHolo.add(xrHoloAccentGlow);

  xrCurvedHolo.visible=false;
  xrCurvedHolo.renderOrder=9997;
  scene.add(xrCurvedHolo);
  drawXRCurvedHoloPanel(LEVELS[G.lvIdx],getHoloGuideLines(LEVELS[G.lvIdx]));
}

function getXRHudTimeText(){
  return G.mode==='hard' ? String(Math.max(0,G.timer)) : '∞';
}

function getXRWristHudText(){
  return 'Score: '+G.score+' | Times: '+getXRHudTimeText()+' | Combo: x'+G.combo;
}

function drawXRWristHud(){
  if(!xrWristHudCtx||!xrWristHudTexture) return;
  const nextText=getXRWristHudText();
  if(nextText===xrWristHudLastText) return;
  xrWristHudLastText=nextText;

  const ctx=xrWristHudCtx;
  const w=xrWristHudCanvas.width;
  const h=xrWristHudCanvas.height;
  ctx.clearRect(0,0,w,h);

  ctx.save();
  ctx.shadowColor='rgba(56,220,255,.45)';
  ctx.shadowBlur=28;
  pathRoundedRect(ctx,26,24,w-52,h-48,42);
  const bg=ctx.createLinearGradient(0,24,0,h-24);
  bg.addColorStop(0,'rgba(6,18,34,.2)');
  bg.addColorStop(.5,'rgba(9,28,52,.72)');
  bg.addColorStop(1,'rgba(3,10,24,.28)');
  ctx.fillStyle=bg;
  ctx.fill();
  ctx.restore();

  const edge=ctx.createLinearGradient(0,0,w,0);
  edge.addColorStop(0,'rgba(110,255,255,.22)');
  edge.addColorStop(.5,'rgba(170,242,255,.82)');
  edge.addColorStop(1,'rgba(110,255,255,.22)');
  ctx.strokeStyle=edge;
  ctx.lineWidth=3;
  pathRoundedRect(ctx,26,24,w-52,h-48,42);
  ctx.stroke();

  for(let i=0;i<8;i++){
    const y=48+i*22;
    ctx.strokeStyle='rgba(115,210,255,.08)';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.moveTo(58,y);
    ctx.lineTo(w-58,y);
    ctx.stroke();
  }

  ctx.textBaseline='middle';
  ctx.textAlign='left';
  ctx.fillStyle='rgba(174,239,255,.76)';
  ctx.font='700 24px Segoe UI,Arial,sans-serif';
  ctx.fillText('LEFT WRIST HUD',64,56);

  ctx.beginPath();
  ctx.arc(w-74,56,8,0,Math.PI*2);
  ctx.fillStyle='rgba(44,255,194,.92)';
  ctx.fill();

  let fontSize=62;
  do{
    ctx.font='700 '+fontSize+'px Segoe UI,Arial,sans-serif';
    if(ctx.measureText(nextText).width<=w-136) break;
    fontSize-=4;
  }while(fontSize>42);

  ctx.textAlign='center';
  ctx.fillStyle='rgba(236,250,255,.98)';
  ctx.shadowColor='rgba(94,235,255,.7)';
  ctx.shadowBlur=18;
  ctx.fillText(nextText,w*.5,126);
  ctx.shadowBlur=0;

  xrWristHudTexture.needsUpdate=true;
}

function ensureXRWristHud(){
  if(xrWristHudPanel) return;

  const metalDark=new THREE.MeshStandardMaterial({color:0x38414e,metalness:.92,roughness:.22});
  const metalTrim=new THREE.MeshStandardMaterial({color:0xa9b4c4,metalness:.98,roughness:.18,emissive:0x0b1620,emissiveIntensity:.22});
  const watchGlass=new THREE.MeshPhysicalMaterial({color:0x0f1824,metalness:.16,roughness:.04,transmission:.08,transparent:true,opacity:.94,clearcoat:1,clearcoatRoughness:.08});

  const cuff=new THREE.Mesh(new THREE.TorusGeometry(.043,.007,14,42,Math.PI*1.18),metalDark);
  cuff.rotation.z=Math.PI*.5;
  cuff.rotation.x=.22;
  cuff.position.set(0,-.006,.01);
  xrWristHud.add(cuff);

  const caseFrame=new THREE.Mesh(new THREE.BoxGeometry(.104,.066,.016),metalTrim);
  caseFrame.position.set(0,.005,.016);
  xrWristHud.add(caseFrame);

  const caseFace=new THREE.Mesh(new THREE.BoxGeometry(.09,.052,.01),watchGlass);
  caseFace.position.set(0,.007,.024);
  xrWristHud.add(caseFace);

  const crown=new THREE.Mesh(new THREE.CylinderGeometry(.005,.005,.015,18),metalTrim);
  crown.rotation.z=Math.PI*.5;
  crown.position.set(-.058,.002,.016);
  xrWristHud.add(crown);

  xrWristHudPanelRig=new THREE.Group();
  xrWristHudPanelRig.position.set(0,.095,.03);
  xrWristHud.add(xrWristHudPanelRig);

  xrWristHudCanvas=document.createElement('canvas');
  xrWristHudCanvas.width=1024;
  xrWristHudCanvas.height=176;
  xrWristHudCtx=xrWristHudCanvas.getContext('2d');
  xrWristHudTexture=new THREE.CanvasTexture(xrWristHudCanvas);
  xrWristHudTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrWristHudTexture.needsUpdate=true;

  xrWristHudGlow=new THREE.Mesh(
    createCurvedPanelGeometry(.58,.13,.05,28),
    new THREE.MeshBasicMaterial({color:0x73ecff,transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,side:THREE.DoubleSide})
  );
  xrWristHudGlow.position.z=-.008;
  xrWristHudPanelRig.add(xrWristHudGlow);

  xrWristHudPanel=new THREE.Mesh(
    createCurvedPanelGeometry(.54,.11,.045,28),
    new THREE.MeshBasicMaterial({map:xrWristHudTexture,transparent:true,opacity:.98,depthTest:false,depthWrite:false,side:THREE.DoubleSide})
  );
  xrWristHudPanelRig.add(xrWristHudPanel);

  const menuTex=makeXRButtonTexture('MENU','#113241','#c9f4ff');
  xrWristMenuButton=new THREE.Mesh(
    new THREE.PlaneGeometry(.15,.055),
    new THREE.MeshBasicMaterial({map:menuTex,transparent:true,opacity:.96,depthTest:false,depthWrite:false})
  );
  xrWristMenuButton.position.set(.17,-.072,.065);
  xrWristMenuButton.userData.xrUiAction='ui-toggle';
  xrWristMenuButton.userData.xrUiBaseOpacity=.96;
  xrWristMenuButton.userData.xrUiBaseScale=1;
  xrWristMenuButton.renderOrder=10002;
  xrWristHud.add(xrWristMenuButton);
  xrInteractiveButtons.push(xrWristMenuButton);

  xrWristHud.renderOrder=9998;
  xrWristHud.visible=false;
  scene.add(xrWristHud);
  drawXRWristHud();
}

function refreshXRWristHudAnchor(){
  const realControllers=xrControllers.filter(c=>c&&!c.userData.isMouseSim&&c.userData.xrConnected);
  xrWristHudAnchor=
    realControllers.find(c=>c.userData.handedness==='left')||
    realControllers[0]||
    (xrMouseSim.enabled?xrMouseSim.controller:null)||
    null;
}

function updateXRWristHudTransform(){
  if((!renderer.xr.isPresenting&&!xrMouseSim.enabled)||!G.active){
    xrWristHud.visible=false;
    return;
  }
  ensureXRWristHud();
  refreshXRWristHudAnchor();
  if(!xrWristHudAnchor){
    // Fallback Ä‘á»ƒ HUD luÃ´n tháº¥y Ä‘Æ°á»£c ká»ƒ cáº£ khi controller chÆ°a bÃ¡o tráº¡ng thÃ¡i.
    xrWristHud.position.copy(xrUiCamPos)
      .add(new THREE.Vector3(-.26,-.16,-.46).applyQuaternion(xrUiCamQuat));
    xrWristHud.quaternion.copy(xrUiCamQuat);
    xrWristHud.visible=true;
    xrWristHud.updateMatrixWorld(true);
    if(xrWristHudPanelRig){
      xrWristHudPanelRig.lookAt(xrUiCamPos.x,xrUiCamPos.y-.02,xrUiCamPos.z);
    }
    if(xrWristMenuButton){
      xrWristMenuButton.lookAt(xrUiCamPos.x,xrUiCamPos.y-.02,xrUiCamPos.z);
    }
    return;
  }

  drawXRWristHud();

  xrWristHudAnchor.matrixWorld.decompose(xrWristHudAnchorPos,xrWristHudAnchorQuat,xrWristHudAnchorScale);
  const handSign=xrWristHudAnchor.userData.handedness==='right'?1:-1;
  xrWristHud.position.copy(xrWristHudAnchorPos)
    .add(new THREE.Vector3(.055*handSign,.012,.072).applyQuaternion(xrWristHudAnchorQuat));
  xrWristHud.quaternion.copy(xrWristHudAnchorQuat);
  xrWristHud.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(-.48,0,handSign*.22,'YXZ')));
  xrWristHud.visible=true;
  xrWristHud.updateMatrixWorld(true);

  if(xrWristHudPanelRig){
    xrWristHudPanelRig.lookAt(xrUiCamPos.x,xrUiCamPos.y-.02,xrUiCamPos.z);
  }
  if(xrWristMenuButton){
    xrWristMenuButton.lookAt(xrUiCamPos.x,xrUiCamPos.y-.02,xrUiCamPos.z);
  }
  if(xrWristHudGlow&&xrWristHudGlow.material){
    xrWristHudGlow.material.opacity=.1+Math.sin(performance.now()*.0023)*.03;
  }
}

function syncHoloPanel(lv=LEVELS[G.lvIdx],targetCd=null){
  if(!lv) return;
  const guideLines=getHoloGuideLines(lv,targetCd);
  drawXRCurvedHoloPanel(lv,guideLines,targetCd);
}

function isImmersiveVR(){
  return !!(renderer&&renderer.xr&&renderer.xr.isPresenting);
}

function updateGameplayOverlayVisibility(){
  const inVr=isImmersiveVR();
  if(!G.active){
    ['badge','hint'].forEach(id=>document.getElementById(id).style.display='none');
    return;
  }
  document.getElementById('badge').style.display=inVr?'none':'block';
  document.getElementById('hint').style.display=inVr?'none':'block';
}

function refreshPresentationMode(){
  updateGameplayOverlayVisibility();
  if(G.active&&Object.keys(G.placed).length===0){
    buildLevel();
  }
}

function clearGameTimeouts(){
  clearTimeout(lvDoneTmr);lvDoneTmr=null;
  clearTimeout(lvAdvanceTmr);lvAdvanceTmr=null;
  clearTimeout(endGameTmr);endGameTmr=null;
  clearTimeout(specialHideTmr);specialHideTmr=null;
  clearInterval(specialGuideInt);specialGuideInt=null;
  G.specialRevealEnd=0;
}

function setSpecialSlotsHidden(hidden){
  G.specialHidden=hidden;
  G.slots.forEach(s=>{
    if(s.filled) return;
    if(hidden){
      const darkCol=new THREE.Color(0x2a2f38);
      s.rim.material.color.copy(darkCol);
      s.rim.material.emissive.set(0x000000);
      s.rim.material.opacity=.9;
      if(s.halo){
        s.halo.material.color.copy(darkCol);
        s.halo.material.opacity=.04;
      }
      if(s.haloOuter){
        s.haloOuter.material.color.copy(darkCol);
        s.haloOuter.material.opacity=.02;
      }
      if(s.sprite) s.sprite.visible=false;
      if(s.lightCol){
        s.lightCol.visible=false;
        if(s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
          s.lightCol.material.uniforms.uAmp.value=0;
        }
      }
    }else{
      const col=new THREE.Color(s.color.hex);
      s.rim.material.color.copy(col);
      s.rim.material.emissive.copy(col).multiplyScalar(1.95);
      s.rim.material.opacity=.92;
      if(s.halo) s.halo.material.color.copy(col);
      if(s.haloOuter) s.haloOuter.material.color.copy(col);
      if(s.sprite) s.sprite.visible=true;
      if(s.lightCol){
        s.lightCol.visible=true;
        if(s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
          s.lightCol.material.uniforms.uAmp.value=.95;
        }
      }
    }
  });
}

function startSpecialReveal(){
  if(G.mode!=='special') return;
  G.specialLocked=true;
  G.specialRevealEnd=Date.now()+5000;
  setSpecialSlotsHidden(false);
  syncHoloPanel(LEVELS[G.lvIdx]);
  clearInterval(specialGuideInt);
  specialGuideInt=setInterval(()=>{
    if(!G.active||G.mode!=='special'||!G.specialLocked){clearInterval(specialGuideInt);specialGuideInt=null;return;}
    syncHoloPanel(LEVELS[G.lvIdx],G.selectedMb?G.selectedMb.cd:null);
  },250);
  toast('SPECIAL: Ghi nhớ vị trí màu trong 5 giây!', 'inf', 2200);
  clearTimeout(specialHideTmr);
  specialHideTmr=setTimeout(()=>{
    specialHideTmr=null;
    if(!G.active||G.mode!=='special') return;
    G.specialLocked=false;
    G.specialRevealEnd=0;
    clearInterval(specialGuideInt);specialGuideInt=null;
    setSpecialSlotsHidden(true);
    syncHoloPanel(LEVELS[G.lvIdx]);
    toast('Màu đã tắt. Hãy đặt bi theo trí nhớ!', 'inf', 1800);
  },5000);
}

function disposeMaterial(mat){
  if(!mat) return;
  if(Array.isArray(mat)){mat.forEach(disposeMaterial);return;}
  if(typeof mat.dispose==='function') mat.dispose();
}

function disposeObject3D(obj){
  if(!obj) return;
  obj.traverse(child=>{
    if(child.geometry&&typeof child.geometry.dispose==='function') child.geometry.dispose();
    if(child.material) disposeMaterial(child.material);
  });
}

function removeAndDispose(parent,obj){
  if(!obj) return;
  if(parent) parent.remove(obj);
  else if(obj.parent) obj.parent.remove(obj);
  disposeObject3D(obj);
}

function clearColorBoard(){
  BOARD.children.filter(c=>c.userData.dynamicBoardPart).forEach(c=>removeAndDispose(BOARD,c));
  G.boardItems=[];
  G.boardFx={rings:[],starMat:null};
}

function makeFresnelShell(hex,rad){
  return new THREE.Mesh(
    new THREE.SphereGeometry(rad,24,24),
    new THREE.ShaderMaterial({
      uniforms:{uCol:{value:new THREE.Color(hex)},uPow:{value:2.6},uInt:{value:.9}},
      vertexShader:`varying vec3 vN;varying vec3 vW;void main(){vN=normalize(normalMatrix*normal);vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}`,
      fragmentShader:`uniform vec3 uCol;uniform float uPow;uniform float uInt;varying vec3 vN;varying vec3 vW;void main(){vec3 v=normalize(cameraPosition-vW);float f=pow(1.-max(dot(vN,v),0.),uPow);gl_FragColor=vec4(uCol*f*uInt,f*.75);}`,
      transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.BackSide
    })
  );
}

function getVRRackLayout(count){
  return {
    posY:-0.03,
    posZ:2.8,
    rotX:0,
    frameRadius:count>10?1.96:(count>6?1.72:1.5),
    frameArc:count>10?Math.PI*1.02:(count>6?Math.PI*.92:Math.PI*.8),
    seatRadius:count>10?1.62:(count>6?1.42:1.22),
    seatArc:count>10?Math.PI*.84:(count>6?Math.PI*.74:Math.PI*.58),
    shellTube:count>10 ? .11 : (count>6 ? .12 : .14),
    marbleYOffset:0,
    marbleForward:0
  };
}

function getRackGridLayout(count,inVr){
  const rows=count<=4?1:(count<=8?2:3);
  const cols=Math.max(1,Math.ceil(count/rows));
  const colSpacing=inVr?.36:.58;
  const rowSpacing=inVr?.26:.36;
  return {
    rows,
    cols,
    colSpacing,
    rowSpacing,
    width:Math.max(colSpacing*(cols-1)+(inVr?.34:.48),inVr?1.05:1.7),
    depth:inVr?.46:.62,
    baseY:inVr?.22:.28,
    railGap:inVr?.11:.15,
    postRadius:inVr?.024:.03,
    topLift:inVr?.32:.42
  };
}

function getVRRackWorldPosition(localPos){
  return localPos.applyEuler(MARBLE_RACK.rotation.clone()).add(MARBLE_RACK.position.clone());
}

function setMarbleOutlineOpacity(mb,opacity){
  if(!mb||!mb.grp||!mb.grp.userData.om) return;
  mb.grp.userData.om.material.opacity=opacity;
}

function rebuildMarbleRack(count){
  MARBLE_RACK.children.filter(c=>c.userData.dynamicRackPart).forEach(c=>MARBLE_RACK.remove(c));
  const inVr=isImmersiveVR();
  if(!inVr){
    MARBLE_RACK.position.set(WG.position.x-3.5,WG.position.y-0.06,WG.position.z+3);
    MARBLE_RACK.rotation.set(0,-Math.PI*.5,0);
  }else{
    const layout=getVRRackLayout(count);
    MARBLE_RACK.position.set(WG.position.x-3.2,layout.posY,WG.position.z+layout.posZ);
    MARBLE_RACK.rotation.set(layout.rotX,-Math.PI*.5,0);
  }

  const grid=getRackGridLayout(count,inVr);
  const frameMat=new THREE.MeshStandardMaterial({
    color:0xd8e8f4,
    roughness:.3,
    metalness:.78,
    emissive:0x2a4c66,
    emissiveIntensity:.18
  });

  const postH=grid.baseY+(grid.rows-1)*grid.rowSpacing+grid.topLift;
  const postY=postH*.5;
  const sideX=grid.width*.5+grid.postRadius*1.3;
  const sideZ=grid.depth*.5+grid.postRadius*.6;

  [[-sideX,-sideZ],[-sideX,sideZ],[sideX,-sideZ],[sideX,sideZ]].forEach(p=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(grid.postRadius,grid.postRadius,postH,14),frameMat);
    post.position.set(p[0],postY,p[1]);
    post.userData.dynamicRackPart=true;
    MARBLE_RACK.add(post);
  });

  const topBar=new THREE.Mesh(
    new THREE.CylinderGeometry(grid.postRadius*.86,grid.postRadius*.86,grid.width+grid.postRadius*2.6,14),
    frameMat
  );
  topBar.rotation.z=Math.PI/2;
  topBar.position.set(0,postH-grid.postRadius*1.25,sideZ);
  topBar.userData.dynamicRackPart=true;
  MARBLE_RACK.add(topBar);

  const topBarBack=topBar.clone();
  topBarBack.position.z=-sideZ;
  topBarBack.userData.dynamicRackPart=true;
  MARBLE_RACK.add(topBarBack);

  for(let r=0;r<grid.rows;r++){
    const y=grid.baseY+(grid.rows-1-r)*grid.rowSpacing;
    const railF=new THREE.Mesh(
      new THREE.CylinderGeometry(grid.postRadius*.72,grid.postRadius*.72,grid.width+grid.postRadius*1.8,14),
      frameMat
    );
    railF.rotation.z=Math.PI/2;
    railF.position.set(0,y,grid.railGap);
    railF.userData.dynamicRackPart=true;
    MARBLE_RACK.add(railF);

    const railB=railF.clone();
    railB.position.z=-grid.railGap;
    railB.userData.dynamicRackPart=true;
    MARBLE_RACK.add(railB);
  }
}

function setBoardItemPlaced(slotIdx, placed){
  const item=G.boardItems.find(b=>b.idx===slotIdx);
  if(!item) return;
  if(placed){
    item.dot.material.color.set(item.color.hex);
    item.dot.material.opacity=.98;
    if(item.dot.material.emissive) item.dot.material.emissive.set(item.color.hex).multiplyScalar(.65);
    item.glow.material.color.set(item.color.hex);
    item.glow.material.opacity=.78;
    item.dot.scale.set(1.1,1.1,1.1);
  }else{
    item.dot.material.color.set(0x3d4554);
    item.dot.material.opacity=.88;
    if(item.dot.material.emissive) item.dot.material.emissive.set(0x04070d);
    item.glow.material.color.set(0x202838);
    item.glow.material.opacity=.08;
    item.dot.scale.set(1,1,1);
  }
}

function buildColorBoard(lv){
  clearColorBoard();

  const slabGeo=new THREE.CylinderGeometry(1.18,1.32,.22,72,1);
  const slabPos=slabGeo.attributes.position;
  for(let i=0;i<slabPos.count;i++){
    const y=slabPos.getY(i);
    const x=slabPos.getX(i);
    const z=slabPos.getZ(i);
    const r=Math.hypot(x,z);
    if(Math.abs(y)>.095){
      const jitter=.02*(Math.sin(i*1.37)+Math.cos(i*.71));
      const scale=1+jitter*(r>.9?1:.25);
      slabPos.setX(i,x*scale);
      slabPos.setZ(i,z*scale);
      slabPos.setY(i,y+(Math.random()-.5)*.01);
    }else if(r>.95){
      slabPos.setX(i,x*(1+(Math.random()-.5)*.012));
      slabPos.setZ(i,z*(1+(Math.random()-.5)*.012));
    }
  }
  slabPos.needsUpdate=true;
  slabGeo.computeVertexNormals();

  const slabMat=new THREE.MeshStandardMaterial({
    color:0xb3a894,
    roughness:1,
    metalness:.03,
    emissive:0x1e1913,
    emissiveIntensity:.06,
    map:ancientWallTex,
    normalMap:ancientRockNormal,
    roughnessMap:ancientRockRough,
    normalScale:new THREE.Vector2(1.35,1.35)
  });
  const slab=new THREE.Mesh(slabGeo,slabMat);
  slab.rotation.x=Math.PI*.5;
  slab.position.z=-.04;
  slab.userData.dynamicBoardPart=true;
  BOARD.add(slab);

  const slabTop=new THREE.Mesh(
    new THREE.CircleGeometry(1.08,72),
    new THREE.MeshStandardMaterial({
      color:0xc0b39e,
      roughness:1,
      metalness:.02,
      map:ancientWallTex,
      normalMap:ancientRockNormal,
      roughnessMap:ancientRockRough,
      normalScale:new THREE.Vector2(1.1,1.1)
    })
  );
  slabTop.position.z=.045;
  slabTop.userData.dynamicBoardPart=true;
  BOARD.add(slabTop);

  const frameOuter=new THREE.Mesh(
    new THREE.RingGeometry(1.0,1.08,96),
    new THREE.MeshBasicMaterial({color:0x89cfff,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  frameOuter.position.z=.058;
  frameOuter.userData.dynamicBoardPart=true;
  BOARD.add(frameOuter);

  const frameInner=new THREE.Mesh(
    new THREE.RingGeometry(.86,.92,96),
    new THREE.MeshBasicMaterial({color:0x8c78cf,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  frameInner.position.z=.059;
  frameInner.userData.dynamicBoardPart=true;
  BOARD.add(frameInner);

  const ringBg=new THREE.Mesh(
    new THREE.RingGeometry(.42,.84,80),
    new THREE.MeshBasicMaterial({color:0x2d2e33,transparent:true,opacity:.55})
  );
  ringBg.position.z=.052;
  ringBg.userData.dynamicBoardPart=true;
  BOARD.add(ringBg);

  const center=new THREE.Mesh(
    new THREE.CircleGeometry(.2,42),
    new THREE.MeshStandardMaterial({color:0x2f2b26,roughness:.95,metalness:.03,map:ancientWallTex,normalMap:ancientWallNormal,roughnessMap:ancientWallRough,normalScale:new THREE.Vector2(.6,.6)})
  );
  center.position.z=.062;
  center.userData.dynamicBoardPart=true;
  BOARD.add(center);

  const orb1=new THREE.Mesh(new THREE.TorusGeometry(.76,.01,8,68),new THREE.MeshBasicMaterial({color:0x71e5ff,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false}));
  orb1.position.z=.07;
  orb1.rotation.x=.16;
  orb1.userData.dynamicBoardPart=true;
  BOARD.add(orb1);

  const orb2=new THREE.Mesh(new THREE.TorusGeometry(.56,.008,8,58),new THREE.MeshBasicMaterial({color:0xa472ff,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false}));
  orb2.position.z=.071;
  orb2.rotation.x=-.2;
  orb2.userData.dynamicBoardPart=true;
  BOARD.add(orb2);

  const starGeo=new THREE.BufferGeometry();
  const starN=60;
  const starPos=new Float32Array(starN*3);
  for(let i=0;i<starN;i++){
    const a=Math.random()*Math.PI*2;
    const rr=.18+Math.random()*.88;
    starPos[i*3]=Math.cos(a)*rr;
    starPos[i*3+1]=Math.sin(a)*rr;
    starPos[i*3+2]=.03+Math.random()*.014;
  }
  starGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
  const starMat=new THREE.PointsMaterial({color:0x9fe8ff,size:.013,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false});
  const stars=new THREE.Points(starGeo,starMat);
  stars.userData.dynamicBoardPart=true;
  BOARD.add(stars);
  G.boardFx={rings:[orb1,orb2,frameOuter,frameInner],starMat};

  lv.colors.forEach((c,i)=>{
    const a=(c.angle-90)*Math.PI/180;
    const r=.69;
    const x=Math.cos(a)*r;
    const y=Math.sin(a)*r;

    const spoke=new THREE.Mesh(new THREE.PlaneGeometry(.012,.46),new THREE.MeshBasicMaterial({color:0x243246,transparent:true,opacity:.56}));
    spoke.position.set(Math.cos(a)*.43,Math.sin(a)*.43,.036);
    spoke.rotation.z=a;
    spoke.userData.dynamicBoardPart=true;
    BOARD.add(spoke);

    const dot=new THREE.Mesh(
      new THREE.SphereGeometry(.085,24,20),
      new THREE.MeshStandardMaterial({color:0x3d4554,emissive:0x04070d,roughness:.14,metalness:.84,transparent:true,opacity:.88})
    );
    dot.position.set(x,y,.1);
    dot.userData.dynamicBoardPart=true;
    BOARD.add(dot);

    const glow=new THREE.Mesh(new THREE.RingGeometry(.11,.16,28),new THREE.MeshBasicMaterial({color:0x202838,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false}));
    glow.position.set(x,y,.104);
    glow.userData.dynamicBoardPart=true;
    BOARD.add(glow);

    G.boardItems.push({idx:i,color:c,dot,glow});
  });
}


//  BUILD LEVEL
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function clearLevel(){
  clearArcheryLevel();
  G.slots.forEach(s=>{
    removeAndDispose(WG,s.mesh);
    removeAndDispose(WG,s.rim);
    removeAndDispose(WG,s.sprite);
    if(s.halo) removeAndDispose(WG,s.halo);
    if(s.haloOuter) removeAndDispose(WG,s.haloOuter);
    if(s.lightCol) removeAndDispose(WG,s.lightCol);
  });
  G.marbles.forEach(m=>removeAndDispose(scene,m.grp));
  MARBLE_RACK.children.filter(c=>c.userData.dynamicRackPart).forEach(c=>removeAndDispose(MARBLE_RACK,c));
  WG.children.filter(c=>c.userData.spoke).forEach(c=>removeAndDispose(WG,c));
  // Hard cleanup: remove any dynamic slot/marble objects that may remain from async transitions
  WG.children.filter(c=>c.userData.dynamicLevelPart).forEach(c=>removeAndDispose(WG,c));
  scene.children.filter(c=>c.userData.dynamicMarble).forEach(c=>removeAndDispose(scene,c));
  inFlight.forEach(f=>removeAndDispose(scene,f.mesh));
  inFlight.length=0;
  burstParticles.forEach(p=>removeAndDispose(scene,p.mesh));
  burstParticles.length=0;
  clearColorBoard();
  G.slots=[];G.marbles=[];G.placed={};
  G.phase='idle';G.selectedMb=null;G.aimSlot=null;
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);
  setAimUI(false);
  WG.visible=true;
  MARBLE_RACK.visible=true;
  BOARD.visible=true;
}

function buildLevel(){
  clearLevel();
  if(G.mode==='archery'){
    buildArcheryLevel();
    return;
  }
  const lv=LEVELS[G.lvIdx];
  const cols=lv.colors;
  const slotAngles=G.mode==='special'?shuffle(cols.map(c=>c.angle)):cols.map(c=>c.angle);
  buildColorBoard(lv);
  rebuildMarbleRack(cols.length);

  cols.forEach(c=>{
    const a=(c.angle-90)*Math.PI/180;
    const pts=[new THREE.Vector3(Math.cos(a)*.38,0,Math.sin(a)*.38),new THREE.Vector3(Math.cos(a)*(RING_R-.36),0,Math.sin(a)*(RING_R-.36))];
    const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0x003355,transparent:true,opacity:.35}));
    l.userData.spoke=true;
    l.userData.dynamicLevelPart=true;
    WG.add(l);
  });

  const badge=document.getElementById('badge');
  badge.textContent=lv.badge;badge.style.borderColor=lv.bc+'55';badge.style.color=lv.bc;
  document.getElementById('hv-lv').textContent=lv.id+'/3';
  document.getElementById('hv-sc').textContent=G.score;
  document.getElementById('hv-co').textContent='0';
  document.getElementById('hv-cb').textContent='x1';
  syncHoloPanel(lv);

  cols.forEach((c,i)=>{
    const a=(slotAngles[i]-90)*Math.PI/180;
    const x=Math.cos(a)*RING_R,z=Math.sin(a)*RING_R;
    const {r,g,b}=h2c(c.hex);
    const baseCol=new THREE.Color(c.hex);
    const ledCol=baseCol.clone();
    const mesh=new THREE.Mesh(new THREE.CylinderGeometry(SLOT_R,SLOT_R,.1,28),new THREE.MeshStandardMaterial({color:0x050f1e,roughness:.7,metalness:.2,transparent:true,opacity:.88}));
    mesh.userData.dynamicLevelPart=true;
    mesh.position.set(x,0,z);WG.add(mesh);
    const rim=new THREE.Mesh(new THREE.TorusGeometry(SLOT_R+.025,.026,8,36),new THREE.MeshStandardMaterial({color:ledCol,emissive:ledCol.clone().multiplyScalar(1.95),roughness:.16,metalness:.72,transparent:true,opacity:.92}));
    rim.userData.dynamicLevelPart=true;
    rim.position.set(x,.055,z);rim.rotation.x=Math.PI/2;WG.add(rim);
    const halo=new THREE.Mesh(
      new THREE.TorusGeometry(SLOT_R+.03,.024,8,40),
      new THREE.MeshBasicMaterial({
        color:ledCol,
        transparent:true,
        opacity:.42,
        blending:THREE.AdditiveBlending,
        depthWrite:false
      })
    );
    halo.userData.dynamicLevelPart=true;
    halo.position.set(x,.09,z);
    halo.rotation.x=Math.PI/2;
    WG.add(halo);
    const haloOuter=new THREE.Mesh(
      new THREE.TorusGeometry(SLOT_R+.075,.032,8,44),
      new THREE.MeshBasicMaterial({
        color:ledCol,
        transparent:true,
        opacity:.24,
        blending:THREE.AdditiveBlending,
        depthWrite:false
      })
    );
    haloOuter.userData.dynamicLevelPart=true;
    haloOuter.position.set(x,.1,z);
    haloOuter.rotation.x=Math.PI/2;
    WG.add(haloOuter);
    const colShader=new THREE.ShaderMaterial({
      uniforms:{uCol:{value:new THREE.Color(c.hex)},uAmp:{value:.95}},
      vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader:`uniform vec3 uCol;uniform float uAmp;varying vec2 vUv;void main(){float a=smoothstep(0.0,0.12,vUv.y)*(1.-smoothstep(0.55,1.0,vUv.y));gl_FragColor=vec4(uCol,a*.35*uAmp);}`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide
    });
    const lightCol=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,1.45,20,1,true),colShader);
    lightCol.userData.dynamicLevelPart=true;
    lightCol.position.set(x,.8,z);
    WG.add(lightCol);
    const cv=document.createElement('canvas');cv.width=128;cv.height=48;
    const ct=cv.getContext('2d');ct.font='bold 15px monospace';ct.fillStyle='rgba(255,255,255,.65)';ct.textAlign='center';ct.textBaseline='middle';
    ct.fillText(c.name.split('-').map(w=>w[0].toUpperCase()).join(''),64,24);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),transparent:true,depthTest:false}));
    sp.userData.dynamicLevelPart=true;
    sp.scale.set(.38,.15,1);sp.position.set(x,.28,z);WG.add(sp);
    G.slots.push({idx:i,color:c,x,z,mesh,rim,halo,haloOuter,sprite:sp,lightCol,filled:false});
  });

  const shuffled=shuffle([...cols]);
  const inVrMode=isImmersiveVR();
  const gridLayout=getRackGridLayout(shuffled.length,inVrMode);
  const vrRackLayout=inVrMode?getVRRackLayout(shuffled.length):null;
  shuffled.forEach((c,i)=>{
    const {r,g,b}=h2c(c.hex);
    const col=new THREE.Color(r,g,b);
    const grp=new THREE.Group();
    const n=shuffled.length;
    const marbleR=inVrMode
      ? Math.min(.2,Math.max(.22,gridLayout.colSpacing*.40))
      : Math.min(MARBLE_R,Math.max(.22,gridLayout.colSpacing*.42));
    const mat=inVrMode
      ? new THREE.MeshStandardMaterial({
          color:col,
          emissive:new THREE.Color(r*.18,g*.18,b*.18),
          roughness:.2,
          metalness:.24
        })
      : new THREE.MeshStandardMaterial({
          color:col,
          emissive:new THREE.Color(r*.18,g*.18,b*.18),
          roughness:.24,
          metalness:.28
        });
    const main=new THREE.Mesh(new THREE.SphereGeometry(marbleR,inVrMode?34:36,inVrMode?34:36),mat);main.castShadow=true;grp.add(main);
    if(!inVrMode){
      grp.add(new THREE.Mesh(new THREE.SphereGeometry(marbleR*.62,18,18),new THREE.MeshBasicMaterial({color:new THREE.Color(Math.min(1,r*.72+.28),Math.min(1,g*.72+.28),Math.min(1,b*.72+.28)),transparent:true,opacity:.36,blending:THREE.AdditiveBlending,depthWrite:false})));
      grp.add(makeFresnelShell(c.hex,marbleR*1.15));
      const outM=new THREE.Mesh(new THREE.SphereGeometry(marbleR*1.18,18,18),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.08,side:THREE.BackSide,depthWrite:false}));
      grp.add(outM);
      grp.userData.om=outM;
    }
    const shine=new THREE.Mesh(new THREE.SphereGeometry(marbleR*(inVrMode ? .3 : .42),inVrMode?8:10,inVrMode?8:10),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:inVrMode ? .52 : .38}));
    shine.position.set(marbleR*.34,marbleR*.4,marbleR*.52);grp.add(shine);
    const row=Math.floor(i/gridLayout.cols);
    const colIdx=i%gridLayout.cols;
    const localX=(colIdx-(gridLayout.cols-1)*.5)*gridLayout.colSpacing;
    const localY=gridLayout.baseY+(gridLayout.rows-1-row)*gridLayout.rowSpacing+marbleR*.56;
    const localZ=(inVrMode?(vrRackLayout?.marbleForward||0):0)+(row%2===0?.006:-.006);
    grp.position.copy(getVRRackWorldPosition(new THREE.Vector3(localX,localY,localZ)));
    grp.userData={dynamicMarble:true,cd:c,origPos:grp.position.clone(),placed:false,inFlight:false,fo:Math.random()*Math.PI*2,mm:main,om:grp.userData.om||null,mat,core:null,rackMarble:true};
    scene.add(grp);
    G.marbles.push({grp,cd:c,mat});
  });

  clearInterval(G.timerInt);
  if(G.mode==='hard'){
    G.timer=lv.tl;
    const tmIcon=document.getElementById('hv-tm-icon');
    const tmVal=document.getElementById('hv-tm-val');
    if(tmIcon) tmIcon.style.display='none';
    if(tmVal){
      tmVal.textContent=G.timer;
      tmVal.style.color='#00f5ff';
    }
    G.timerInt=setInterval(()=>{
      G.timer--;
      const e=document.getElementById('hv-tm-val');
      if(e) e.textContent=G.timer;
      if(G.timer<=10){if(e)e.style.color='#ff4500';if(G.timer%2===0)sfx.hov();}
      if(G.timer<=0){clearInterval(G.timerInt);sfx.lose();endGame(false);}
    },1000);
  } else {
    const tmIcon=document.getElementById('hv-tm-icon');
    const tmVal=document.getElementById('hv-tm-val');
    if(tmIcon) tmIcon.style.display='inline-block';
    if(tmVal){
      tmVal.textContent='';
      tmVal.style.color='#00f5ff';
    }
  }
  G.startTime=Date.now();
  updateProg();
  toast('LEVEL '+lv.id+' - Kéo thả bi vào ô cùng màu!','inf',2200);
  if(G.mode==='special') startSpecialReveal();
}

function updateProg(){
  if(G.mode==='archery'){
    const tot=Math.max(1,xrArchery.hitGoal||1);
    const done=Math.min(tot,xrArchery.correctHits||0);
    document.getElementById('prog-fill').style.width=(done/tot*100)+'%';
    document.getElementById('prog-txt').textContent=done+' / '+tot+' hit đúng màu';
    return;
  }
  const lv=LEVELS[G.lvIdx],tot=lv.colors.length,done=Object.keys(G.placed).length;
  document.getElementById('prog-fill').style.width=(done/tot*100)+'%';
  document.getElementById('prog-txt').textContent=done+' / '+tot+' bi đặt đúng';
}

//  AIM CANVAS (2D overlay for trajectory)
function worldToScreen(v3){
  const v=v3.clone().project(camera);
  return {x:(v.x+1)/2*aimCanvas.width, y:(-v.y+1)/2*aimCanvas.height};
}

function calcArcPoints(start, end, nPts=28){
  const pts=[];
  const peakY=Math.max(start.y,end.y)+2.2;
  for(let i=0;i<=nPts;i++){
    const t=i/nPts;
    const x=start.x+(end.x-start.x)*t;
    const z=start.z+(end.z-start.z)*t;
    const y=start.y*(1-t)*(1-t)+peakY*2*t*(1-t)+end.y*t*t;
    pts.push(new THREE.Vector3(x,y,z));
  }
  return pts;
}

function drawAimLine(mb, slot, hovering){
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);
  if(!mb||!slot) return;

  const slotWorld=new THREE.Vector3(slot.x,0,slot.z);
  WG.localToWorld(slotWorld);

  const startPts=mb.grp.position.clone();
  const arcPts=calcArcPoints(startPts,slotWorld);
  const screenPts=arcPts.map(p=>worldToScreen(p));

  const visible=arcPts.every(p=>{const v=p.clone().project(camera);return v.z<1;});
  if(!visible){aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);return;}

  const {r,g,b}=h2c(mb.cd.hex);
  const hexCol=mb.cd.hex;

  aimCtx.save();
  aimCtx.shadowColor=hexCol;
  aimCtx.shadowBlur=hovering?18:10;

  aimCtx.beginPath();
  aimCtx.setLineDash([hovering?12:8,hovering?5:6]);
  aimCtx.lineDashOffset=-performance.now()*.04;
  screenPts.forEach((p,i)=>{i===0?aimCtx.moveTo(p.x,p.y):aimCtx.lineTo(p.x,p.y);});
  aimCtx.strokeStyle=hovering?hexCol:`rgba(${r*255|0},${g*255|0},${b*255|0},.6)`;
  aimCtx.lineWidth=hovering?2.5:1.8;
  aimCtx.stroke();
  aimCtx.setLineDash([]);

  arcPts.forEach((p,i)=>{
    if(i%4!==0) return;
    const sp=worldToScreen(p);
    const alpha=.3+.7*(i/arcPts.length);
    const size=hovering?3:2;
    aimCtx.beginPath();
    aimCtx.arc(sp.x,sp.y,size,0,Math.PI*2);
    aimCtx.fillStyle=`rgba(${r*255|0},${g*255|0},${b*255|0},${alpha})`;
    aimCtx.fill();
  });

  const endSp=screenPts[screenPts.length-1];
  const prevSp=screenPts[screenPts.length-3];
  if(endSp&&prevSp){
    const dx=endSp.x-prevSp.x,dy=endSp.y-prevSp.y;
    const angle=Math.atan2(dy,dx);
    aimCtx.save();
    aimCtx.translate(endSp.x,endSp.y);
    aimCtx.rotate(angle);
    aimCtx.beginPath();
    aimCtx.moveTo(0,0);
    aimCtx.lineTo(-14,-6);
    aimCtx.lineTo(-14,6);
    aimCtx.closePath();
    aimCtx.fillStyle=hovering?hexCol:`rgba(${r*255|0},${g*255|0},${b*255|0},.7)`;
    aimCtx.fill();
    aimCtx.restore();
  }

  const slotSp=worldToScreen(slotWorld);
  aimCtx.beginPath();
  aimCtx.arc(slotSp.x,slotSp.y,hovering?22:16,0,Math.PI*2);
  aimCtx.strokeStyle=hovering?hexCol:`rgba(${r*255|0},${g*255|0},${b*255|0},.5)`;
  aimCtx.lineWidth=hovering?2.5:1.5;
  aimCtx.stroke();
  [-8,8].forEach(off=>{
    aimCtx.beginPath();aimCtx.moveTo(slotSp.x+off,slotSp.y);aimCtx.lineTo(slotSp.x-off,slotSp.y);
    aimCtx.stroke();
    aimCtx.beginPath();aimCtx.moveTo(slotSp.x,slotSp.y+off);aimCtx.lineTo(slotSp.x,slotSp.y-off);
    aimCtx.stroke();
  });

  aimCtx.restore();
}

//  THROW BALL
function throwBall(mb, slot){
  const slotWorld=new THREE.Vector3(slot.x,0,slot.z);
  WG.localToWorld(slotWorld);

  const startPos=mb.grp.position.clone();
  const endPos=slotWorld.clone();
  const duration=0.72;
  const peakY=Math.max(startPos.y,endPos.y)+2.2;

  const {r,g,b}=h2c(mb.cd.hex);
  const col=new THREE.Color(r,g,b);
  const flyGeo=new THREE.SphereGeometry(MARBLE_R,20,20);
  const flyMat=new THREE.MeshStandardMaterial({color:col,emissive:new THREE.Color(r*.3,g*.3,b*.3),roughness:.08,metalness:.04});
  const flyMesh=new THREE.Mesh(flyGeo,flyMat);
  flyMesh.position.copy(startPos);
  const sh=new THREE.Mesh(new THREE.SphereGeometry(MARBLE_R*.42,6,6),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.38}));
  sh.position.set(MARBLE_R*.33,MARBLE_R*.38,MARBLE_R*.48);flyMesh.add(sh);
  scene.add(flyMesh);

  mb.grp.visible=false;
  mb.grp.userData.inFlight=true;

  inFlight.push({
    mesh:flyMesh,mb,slot,
    startPos,endPos,peakY,
    t:0,duration,resolved:false,
  });

  sfx.throw();
}

function updateFlight(dt){
  const clk_dt=Math.min(dt,.033);
  for(let i=inFlight.length-1;i>=0;i--){
    const f=inFlight[i];
    f.t+=clk_dt/f.duration;
    const t=Math.min(f.t,1);
    const x=f.startPos.x+(f.endPos.x-f.startPos.x)*t;
    const z=f.startPos.z+(f.endPos.z-f.startPos.z)*t;
    const y=f.startPos.y*(1-t)*(1-t)+f.peakY*2*t*(1-t)+f.endPos.y*t*t;
    f.mesh.position.set(x,y,z);
    f.mesh.rotation.x+=clk_dt*9;f.mesh.rotation.z+=clk_dt*4;

    if(f.t>=1&&!f.resolved){
      f.resolved=true;
      resolveThrow(f);
    }
    if(f.t>1.4){scene.remove(f.mesh);inFlight.splice(i,1);}
  }
}

function resolveThrow(f){
  const mb=f.mb, slot=f.slot;
  const correct=mb.cd.hex.toLowerCase()===slot.color.hex.toLowerCase();
  if(correct){
    const slotWorld=new THREE.Vector3(slot.x,0,slot.z);
    WG.localToWorld(slotWorld);
    mb.grp.position.copy(slotWorld);mb.grp.position.y=.26;
    mb.grp.visible=true;mb.grp.userData.placed=true;mb.grp.userData.inFlight=false;
    slot.filled=true;G.placed[slot.idx]=true;
    setBoardItemPlaced(slot.idx,true);
    const slotCol=new THREE.Color(slot.color.hex);
    slot.rim.material.color.copy(slotCol);
    slot.rim.material.emissive.copy(slotCol).multiplyScalar(1.95);
    slot.rim.material.opacity=1;
    const {r,g,b}=h2c(mb.cd.hex);slot.rim.material.emissive.set(r*.45,g*.45,b*.45);
    if(slot.halo){slot.halo.material.color.copy(slotCol);slot.halo.material.opacity=.78;}
    if(slot.haloOuter){slot.haloOuter.material.color.copy(slotCol);slot.haloOuter.material.opacity=.5;}
    if(slot.sprite) slot.sprite.visible=true;
    if(slot.lightCol){
      slot.lightCol.visible=true;
      if(slot.lightCol.material&&slot.lightCol.material.uniforms&&slot.lightCol.material.uniforms.uAmp){
        slot.lightCol.material.uniforms.uAmp.value=1.18;
      }
    }
    G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);
    const pts=(G.mode==='hard'?20:10)*Math.min(G.combo,5);
    G.score+=pts;
    sfx.ok();if(G.combo>1)sfx.combo(G.combo);
    showCombo(G.combo,pts);
    document.getElementById('hv-sc').textContent=G.score;
    document.getElementById('hv-co').textContent=Object.keys(G.placed).length;
    document.getElementById('hv-cb').textContent='x'+G.combo;
    toast('✓ '+mb.cd.name+(G.combo>1?' · COMBO x'+G.combo:'')+(pts>10?' +'+pts:''),'ok',1300);
    pulseM(mb.grp.userData.mm);
    spawnParticles(mb.grp.position.clone(),mb.cd.hex,true);
    updateProg();
    if(Object.keys(G.placed).length===LEVELS[G.lvIdx].colors.length){
      clearTimeout(lvDoneTmr);
      lvDoneTmr=setTimeout(()=>{lvDoneTmr=null;lvDone();},900);
    }
  } else {
    G.combo=1;
    document.getElementById('hv-cb').textContent='x1';
    if(G.mode==='hard'){G.score=Math.max(0,G.score-5);document.getElementById('hv-sc').textContent=G.score;}
    sfx.bad();
    toast('✕ '+mb.cd.name+' - Sai ô!','err',1700);
    spawnParticles(f.endPos.clone(),mb.cd.hex,false);
    setTimeout(()=>{
      mb.grp.visible=true;mb.grp.userData.inFlight=false;
      animReturn(mb);
    },300);
  }
}

function placeOrRejectMarble(mb, slot){
  if(!mb||!slot) return;
  const correct=mb.cd.hex.toLowerCase()===slot.color.hex.toLowerCase();
  if(correct){
    const slotWorld=new THREE.Vector3(slot.x,0,slot.z);
    WG.localToWorld(slotWorld);
    mb.grp.position.copy(slotWorld);mb.grp.position.y=.26;
    mb.grp.visible=true;mb.grp.userData.placed=true;mb.grp.userData.inFlight=false;
    slot.filled=true;G.placed[slot.idx]=true;
    setBoardItemPlaced(slot.idx,true);
    const slotCol=new THREE.Color(slot.color.hex);
    slot.rim.material.color.copy(slotCol);
    slot.rim.material.emissive.copy(slotCol).multiplyScalar(1.95);
    slot.rim.material.opacity=1;
    const {r,g,b}=h2c(mb.cd.hex);slot.rim.material.emissive.set(r*.45,g*.45,b*.45);
    if(slot.halo){slot.halo.material.color.copy(slotCol);slot.halo.material.opacity=.78;}
    if(slot.haloOuter){slot.haloOuter.material.color.copy(slotCol);slot.haloOuter.material.opacity=.5;}
    if(slot.sprite) slot.sprite.visible=true;
    if(slot.lightCol){
      slot.lightCol.visible=true;
      if(slot.lightCol.material&&slot.lightCol.material.uniforms&&slot.lightCol.material.uniforms.uAmp){
        slot.lightCol.material.uniforms.uAmp.value=1.18;
      }
    }
    G.combo++;G.maxCombo=Math.max(G.maxCombo,G.combo);
    const pts=(G.mode==='hard'?20:10)*Math.min(G.combo,5);
    G.score+=pts;
    sfx.ok();if(G.combo>1)sfx.combo(G.combo);
    showCombo(G.combo,pts);
    document.getElementById('hv-sc').textContent=G.score;
    document.getElementById('hv-co').textContent=Object.keys(G.placed).length;
    document.getElementById('hv-cb').textContent='x'+G.combo;
    toast('✓ '+mb.cd.name+(G.combo>1?' · COMBO x'+G.combo:'')+(pts>10?' +'+pts:''),'ok',1300);
    pulseM(mb.grp.userData.mm);
    spawnParticles(mb.grp.position.clone(),mb.cd.hex,true);
    updateProg();
    if(Object.keys(G.placed).length===LEVELS[G.lvIdx].colors.length){
      clearTimeout(lvDoneTmr);
      lvDoneTmr=setTimeout(()=>{lvDoneTmr=null;lvDone();},900);
    }
  } else {
    G.combo=1;
    document.getElementById('hv-cb').textContent='x1';
    if(G.mode==='hard'){G.score=Math.max(0,G.score-5);document.getElementById('hv-sc').textContent=G.score;}
    sfx.bad();
    toast('✕ '+mb.cd.name+' - Sai ô!','err',1700);
    spawnParticles(mb.grp.position.clone(),mb.cd.hex,false);
    animReturn(mb);
    if(G.mode==='special'){
      toast('Sai rồi! Reset level đặc biệt...', 'err', 1400);
      setTimeout(()=>{
        if(!G.active||G.mode!=='special') return;
        buildLevel();
      },650);
    }
  }
}

//  INPUT HANDLING (DRAG & DROP)
const ray = new THREE.Raycaster();
const mouse = new THREE.Vector2(-9, -9);
const cursor = document.getElementById('cursor');
const tip = document.getElementById('tip');
const tempMatrix = new THREE.Matrix4();
const xrControllers = [];
const vrGroundPlane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
const vrTeleportPoint = new THREE.Vector3();
const xrHeadPos = new THREE.Vector3();

