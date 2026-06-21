const xrUiPanel = new THREE.Group();
const xrUiButtons = [];
const xrUiToggleGroup = new THREE.Group();
const xrMenuPanel = new THREE.Group();
const xrVictoryArena = new THREE.Group();
const xrDefeatArena = new THREE.Group();
const xrVictoryButtons = [];
const xrDefeatButtons = [];
const xrInteractiveButtons = [];
const xrMenuModeButtons = {};
const xrMenuAmbientNodes = [];
const xrUiWorldForward = new THREE.Vector3();
const xrUiWorldRight = new THREE.Vector3();
const xrUiTargetPos = new THREE.Vector3();
const xrUiCamPos = new THREE.Vector3();
const xrUiCamQuat = new THREE.Quaternion();
const xrUiCamScale = new THREE.Vector3();
const vrDesktopStandPos = new THREE.Vector3(0,0,6.3);
const vrAlignForward = new THREE.Vector3();
const vrAlignQuat = new THREE.Quaternion();
const vrSessionOffset = new THREE.Vector2(0,0);
const xrDragPoint = new THREE.Vector3();
const xrForwardRef = new THREE.Vector3(0,0,-1);
const xrMouseAimDir = new THREE.Vector3();
const xrMouseSim={enabled:false,controller:null};
const dragPlane = new THREE.Plane(new THREE.Vector3(0,1,0),-.26);
const dragHit = new THREE.Vector3();

let lastHov = null;
let mouseScreen = { x: 0, y: 0 };
let hasDragged = false;
let xrDragController = null;
let xrUiToggleButton = null;
let xrUiVolumeFill = null;
let xrUiVolumeThumb = null;
let xrIngameMenuOpen = false;
let xrUiVolumeSliderHit = null;
let xrUiSliderDragController = null;
let xrUiOpenAnim = 0;
let xrUiView = 'main';
const xrUiMainNodes = [];
const xrUiLevelNodes = [];
const xrUiSettingNodes = [];
const xrUiLevelButtons = {};
const xrCurvedHolo = new THREE.Group();
const xrWristHud = new THREE.Group();

let xrHoloCanvas = null;
let xrHoloCtx = null;
let xrHoloTexture = null;
let xrHoloPanelMesh = null;
let xrHoloAccentGlow = null;
let xrHoloPulse = 0;
let xrHoloReveal = 0;
const xrHoloStoneOffset = new THREE.Vector3(2.7,1.02,1.85);
const xrHoloStoneOffsetWorld = new THREE.Vector3();
let xrWristHudAnchor = null;
let xrWristHudCanvas = null;
let xrWristHudCtx = null;
let xrWristHudTexture = null;
let xrWristHudPanel = null;
let xrWristHudGlow = null;
let xrWristHudPanelRig = null;
let xrWristMenuButton = null;
let xrWristHudLastText = '';
const xrWristHudAnchorPos = new THREE.Vector3();
const xrWristHudAnchorQuat = new THREE.Quaternion();
const xrWristHudAnchorScale = new THREE.Vector3();
let xrVictoryActive = false;
let xrVictoryTitleCanvas = null;
let xrVictoryTitleCtx = null;
let xrVictoryTitleTexture = null;
let xrVictoryStatsCanvas = null;
let xrVictoryStatsCtx = null;
let xrVictoryStatsTexture = null;
let xrVictoryTitleMesh = null;
let xrVictoryStatsMesh = null;
let xrVictoryTitleRig = null;
let xrVictoryStatsRig = null;
let xrVictoryButtonsRig = null;
const xrVictoryStatCanvases = [];
const xrVictoryStatTextures = [];
const xrVictoryStatMeshes = [];
let xrVictoryPulse = 0;
const xrVictoryData = { level:'3/3', score:'0', time:'0:00', maxCombo:'x1' };
const xrVictoryCamPos = new THREE.Vector3();
const xrVictoryCamQuat = new THREE.Quaternion();
const xrVictoryCamScale = new THREE.Vector3();
const xrVictoryForward = new THREE.Vector3();
const xrVictoryLookTarget = new THREE.Vector3();
const xrVictoryAnimatedNodes = [];
let xrDefeatActive = false;
let xrDefeatTitleCanvas = null;
let xrDefeatTitleCtx = null;
let xrDefeatTitleTexture = null;
let xrDefeatStatsCanvas = null;
let xrDefeatStatsCtx = null;
let xrDefeatStatsTexture = null;
let xrDefeatTitleMesh = null;
let xrDefeatStatsMesh = null;
let xrDefeatTitleRig = null;
let xrDefeatStatsRig = null;
let xrDefeatButtonsRig = null;
let xrDefeatPulse = 0;
const xrDefeatData = { level:'1/3', score:'0', time:'0:00', maxCombo:'x1' };
const xrDefeatLookTarget = new THREE.Vector3();
const xrDefeatAnimatedNodes = [];
let xrMenuTitleRig = null;
let xrMenuFocusCore = null;
let xrMenuAnchorReady = false;
let xrMenuReveal = 0;
const xrMenuAnchorPos = new THREE.Vector3();

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  HOVER (idle & selected phases)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
function checkHover(t){
  if(!G.active) return;
  if(G.mode==='archery'){
    cursor.classList.remove('aiming');
    tip.style.opacity='0';
    return;
  }
  const specialDark=(G.mode==='special'&&G.specialHidden);

  if(G.phase==='dragging'&&G.selectedMb){
    const hovSlot=findNearestSlotForMarble(G.selectedMb,.95)||findAimedSlot();
    G.aimSlot=hovSlot;
    drawAimLine(G.selectedMb,hovSlot||G.slots.find(s=>!s.filled),hovSlot!=null);

    const pwr=(.5+.5*Math.sin(t*4));
    document.getElementById('power-fill').style.width=(55+pwr*45)+'%';
    const c=pwr>.7?'#ff4500':pwr>.4?'#ffd700':'#00ff88';
    document.getElementById('power-fill').style.background=c;

    G.slots.forEach(s=>{
      if(s.filled) return;
      const isHov=s===hovSlot;
      const isMatch=G.selectedMb&&s.color.hex.toLowerCase()===G.selectedMb.cd.hex.toLowerCase();
      s.rim.material.emissiveIntensity=specialDark?(isHov?0.8:0.12):(isHov?3.2:(isMatch?2.35:0.18));
      if(s.lightCol&&s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
        if(specialDark){
          s.lightCol.visible=false;
          s.lightCol.material.uniforms.uAmp.value=0;
        }else{
          s.lightCol.visible=true;
          s.lightCol.material.uniforms.uAmp.value=isHov?1.65:(isMatch?1.25:.42);
        }
      }
    });

    G.selectedMb.grp.scale.setScalar(1+.06*Math.sin(t*6));
    cursor.classList.add('aiming');
    return;
  }

  G.slots.forEach(s=>{
    if(s.filled) return;
    s.rim.material.emissiveIntensity=specialDark?0.12:0.85;
    if(s.lightCol&&s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
      if(specialDark){
        s.lightCol.visible=false;
        s.lightCol.material.uniforms.uAmp.value=0;
      }else{
        s.lightCol.visible=true;
        s.lightCol.material.uniforms.uAmp.value=.95;
      }
    }
  });

  ray.setFromCamera(mouse,camera);
  const active=G.marbles.filter(m=>!m.grp.userData.placed&&!m.grp.userData.inFlight);
  const hits=ray.intersectObjects(active.map(m=>m.grp.userData.mm));
  if(hits.length){
    const found=active.find(m=>m.grp.userData.mm===hits[0].object);
    if(found&&found!==lastHov){
      if(lastHov){setMarbleOutlineOpacity(lastHov,.08);lastHov.grp.scale.setScalar(1);}
      lastHov=found;setMarbleOutlineOpacity(found,.38);
      cursor.classList.add('grab');tip.style.opacity='1';tip.textContent=found.cd.name;sfx.hov();
    }
    if(found){
      const targetHex=found.cd.hex.toLowerCase();
      G.slots.forEach(s=>{
        if(s.filled) return;
        s.rim.material.emissiveIntensity=specialDark?0.12:(s.color.hex.toLowerCase()===targetHex?2.4:0.18);
        if(s.lightCol&&s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
          if(specialDark){
            s.lightCol.visible=false;
            s.lightCol.material.uniforms.uAmp.value=0;
          }else{
            s.lightCol.visible=true;
            s.lightCol.material.uniforms.uAmp.value=(s.color.hex.toLowerCase()===targetHex)?1.45:.36;
          }
        }
      });
    }
  } else {
    if(lastHov){setMarbleOutlineOpacity(lastHov,.08);lastHov.grp.scale.setScalar(1);lastHov=null;}
    cursor.classList.remove('grab');tip.style.opacity='0';
    G.slots.forEach(s=>{
      if(s.filled) return;
      s.rim.material.emissiveIntensity=specialDark?0.12:0.85;
      if(s.lightCol&&s.lightCol.material&&s.lightCol.material.uniforms&&s.lightCol.material.uniforms.uAmp){
        if(specialDark){
          s.lightCol.visible=false;
          s.lightCol.material.uniforms.uAmp.value=0;
        }else{
          s.lightCol.visible=true;
          s.lightCol.material.uniforms.uAmp.value=.95;
        }
      }
    });
  }
}


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ANIMATIONS & VR CONTROLLERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

function makeXRButtonTexture(label,bg='#11263a',fg='#e9fbff'){
  const cnv=document.createElement('canvas');
  cnv.width=512;cnv.height=192;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  const grd=ctx.createLinearGradient(0,0,0,h);
  grd.addColorStop(0,bg);
  grd.addColorStop(1,'#0b1420');
  pathRoundedRect(ctx,10,10,w-20,h-20,22);
  ctx.fillStyle=grd;
  ctx.fill();

  const edge=ctx.createLinearGradient(0,0,w,0);
  edge.addColorStop(0,'rgba(94,235,255,.96)');
  edge.addColorStop(.5,'rgba(205,230,255,.9)');
  edge.addColorStop(1,'rgba(94,235,255,.96)');
  ctx.strokeStyle=edge;
  ctx.lineWidth=8;
  pathRoundedRect(ctx,10,10,w-20,h-20,22);
  ctx.stroke();

  ctx.strokeStyle='rgba(180,230,255,.2)';
  ctx.lineWidth=2;
  pathRoundedRect(ctx,22,20,w-44,h-40,16);
  ctx.stroke();

  ctx.fillStyle=fg;
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font='700 72px Segoe UI,Arial,sans-serif';
  ctx.shadowColor='rgba(0,245,255,.26)';
  ctx.shadowBlur=10;
  ctx.fillText(label,w/2,h/2+2);
  ctx.shadowBlur=0;
  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function makeXRLabelTexture(label,fg='#d4ffd8'){
  const cnv=document.createElement('canvas');
  cnv.width=512;cnv.height=128;
  const ctx=cnv.getContext('2d');
  ctx.clearRect(0,0,cnv.width,cnv.height);
  ctx.fillStyle=fg;
  ctx.textAlign='left';
  ctx.textBaseline='middle';
  ctx.font='700 64px Segoe UI,Arial,sans-serif';
  ctx.fillText(label,18,cnv.height/2+2);
  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function createXRUIButton(label,x,y,action,bg){
  const tex=makeXRButtonTexture(label,bg||'#11263a');
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.92,depthTest:false,depthWrite:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.34,.13),mat);
  mesh.position.set(x,y,.02);
  mesh.userData.xrUiAction=action;
  mesh.userData.xrUiTex=tex;
  mesh.userData.xrUiHover=false;
  mesh.userData.xrUiBaseOpacity=.92;

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(.4,.16),
    new THREE.MeshBasicMaterial({color:0x74ecff,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:false})
  );
  glow.position.z=-.006;
  mesh.add(glow);
  mesh.userData.xrUiGlow=glow;

  xrUiPanel.add(mesh);
  xrUiButtons.push(mesh);
  xrInteractiveButtons.push(mesh);
  return mesh;
}

function setupXRUI(){
  ensureXRCurvedHoloPanel();

  const panelBack=new THREE.Mesh(
    createCurvedPanelGeometry(.82,.82,.06,36),
    new THREE.MeshBasicMaterial({color:0x050d1f,transparent:true,opacity:.74,depthTest:false,depthWrite:false})
  );
  panelBack.position.set(0,-.02,0);
  xrUiPanel.add(panelBack);

  const panelEdge=new THREE.Mesh(
    createCurvedPanelGeometry(.88,.88,.07,36),
    new THREE.MeshBasicMaterial({color:0x62e8ff,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false})
  );
  panelEdge.position.set(0,-.02,-.01);
  xrUiPanel.add(panelEdge);

  const floorRing=new THREE.Mesh(
    new THREE.TorusGeometry(.38,.012,10,80),
    new THREE.MeshBasicMaterial({color:0x5ce9ff,transparent:true,opacity:.32,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false})
  );
  floorRing.rotation.x=Math.PI/2;
  floorRing.position.set(0,-.46,-.02);
  xrUiPanel.add(floorRing);

  const titleTex=makeXRButtonTexture('MENU','#291338','#f6e6ff');
  const title=new THREE.Mesh(
    new THREE.PlaneGeometry(.58,.13),
    new THREE.MeshBasicMaterial({map:titleTex,transparent:true,opacity:.95,depthTest:false,depthWrite:false})
  );
  title.position.set(0,.3,.02);
  xrUiPanel.add(title);
  xrUiMainNodes.push(title);

  const bNew=createXRUIButton('NEW GAME',0,.16,'ui-new-game','#18314c');
  const bLevel=createXRUIButton('LEVEL',0,.055,'ui-open-level','#2b2547');
  const bSetting=createXRUIButton('SETTINGS',0,-.05,'ui-open-setting','#12384a');
  const bQuit=createXRUIButton('QUIT',0,-.155,'ui-quit-game','#3b1020');
  const bClose=createXRUIButton('CLOSE',0,-.26,'ui-close','#13352a');
  xrUiMainNodes.push(bNew,bLevel,bSetting,bQuit,bClose);

  const lvTitleTex=makeXRButtonTexture('LEVEL','#1a1f4a','#cfd4ff');
  const lvTitle=new THREE.Mesh(new THREE.PlaneGeometry(.4,.1),new THREE.MeshBasicMaterial({map:lvTitleTex,transparent:true,opacity:.92,depthTest:false,depthWrite:false}));
  lvTitle.position.set(0,.16,.02);
  xrUiPanel.add(lvTitle);xrUiLevelNodes.push(lvTitle);
  xrUiLevelButtons.easy=createXRUIButton('EASY',0,.05,'mode-easy','#113b2b');
  xrUiLevelButtons.hard=createXRUIButton('HARD',0,-.05,'mode-hard','#3b1027');
  xrUiLevelButtons.special=createXRUIButton('SPECIAL',0,-.15,'mode-special','#2b103b');
  xrUiLevelButtons.archery=createXRUIButton('ARCHERY',0,-.25,'mode-archery','#0f2f48');
  const lvBack=createXRUIButton('BACK',0,-.35,'ui-back-main','#1f3244');
  xrUiLevelNodes.push(xrUiLevelButtons.easy,xrUiLevelButtons.hard,xrUiLevelButtons.special,xrUiLevelButtons.archery,lvBack);

  const volLabelTex=makeXRLabelTexture('Music','#c8ffd6');
  const volLabel=new THREE.Mesh(new THREE.PlaneGeometry(.24,.06),new THREE.MeshBasicMaterial({map:volLabelTex,transparent:true,opacity:.95,depthTest:false,depthWrite:false}));
  volLabel.position.set(-.24,.16,.02);
  xrUiPanel.add(volLabel);xrUiSettingNodes.push(volLabel);

  const barBg=new THREE.Mesh(new THREE.PlaneGeometry(.46,.022),new THREE.MeshBasicMaterial({color:0x3a4f67,transparent:true,opacity:.95,depthTest:false,depthWrite:false}));
  barBg.position.set(0,.07,.02);
  xrUiPanel.add(barBg);xrUiSettingNodes.push(barBg);

  xrUiVolumeFill=new THREE.Mesh(
    new THREE.PlaneGeometry(.44,.014),
    new THREE.MeshBasicMaterial({color:0x9bf344,transparent:true,opacity:.95,depthTest:false,depthWrite:false})
  );
  xrUiVolumeFill.position.set(0,.07,.022);
  xrUiPanel.add(xrUiVolumeFill);xrUiSettingNodes.push(xrUiVolumeFill);

  xrUiVolumeThumb=new THREE.Mesh(
    new THREE.PlaneGeometry(.032,.05),
    new THREE.MeshBasicMaterial({color:0x8eeeff,transparent:true,opacity:.96,depthTest:false,depthWrite:false})
  );
  xrUiVolumeThumb.position.set(.23,.07,.024);
  xrUiPanel.add(xrUiVolumeThumb);xrUiSettingNodes.push(xrUiVolumeThumb);

  xrUiVolumeSliderHit=new THREE.Mesh(
    new THREE.PlaneGeometry(.46,.09),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.001,depthTest:false,depthWrite:false})
  );
  xrUiVolumeSliderHit.position.set(0,.07,.03);
  xrUiVolumeSliderHit.userData.xrUiAction='vol-slider';
  xrUiVolumeSliderHit.userData.xrUiHover=false;
  xrUiVolumeSliderHit.userData.xrUiBaseOpacity=.001;
  xrUiVolumeSliderHit.userData.xrUiBaseScale=1;
  xrUiPanel.add(xrUiVolumeSliderHit);
  xrInteractiveButtons.push(xrUiVolumeSliderHit);
  xrUiSettingNodes.push(xrUiVolumeSliderHit);
  const setBack=createXRUIButton('BACK',0,-.25,'ui-back-main','#1f3244');
  xrUiSettingNodes.push(setBack);

  xrUiButtons.forEach(b=>{
    if(!b.userData.xrUiBaseScale){
      b.scale.set(.68,.68,1);
      b.userData.xrUiBaseScale=.68;
    }
  });

  xrUiPanel.visible=false;
  xrUiPanel.renderOrder=9999;
  scene.add(xrUiPanel);

  const toggleTex=makeXRButtonTexture('MENU','#113241','#c9f4ff');
  xrUiToggleButton=new THREE.Mesh(
    new THREE.PlaneGeometry(.2,.085),
    new THREE.MeshBasicMaterial({map:toggleTex,transparent:true,opacity:.88,depthTest:false,depthWrite:false})
  );
  xrUiToggleButton.position.set(0,0,.02);
  xrUiToggleButton.userData.xrUiAction='ui-toggle';
  xrUiToggleButton.userData.xrUiHover=false;
  xrUiToggleButton.userData.xrUiBaseOpacity=.88;
  xrUiToggleButton.userData.xrUiBaseScale=1;
  xrUiToggleGroup.add(xrUiToggleButton);
  xrInteractiveButtons.push(xrUiToggleButton);
  xrUiToggleGroup.visible=false;
  xrUiToggleGroup.renderOrder=9999;
  scene.add(xrUiToggleGroup);

  updateXRUIViews();
  updateXRVolumeBar();
}

function updateXRVolumeBar(){
  if(!xrUiVolumeFill) return;
  const vol=Math.max(0,Math.min(1,bgmVolume));
  xrUiVolumeFill.scale.x=Math.max(.02,vol);
  xrUiVolumeFill.position.x=-((1-vol)*.22);
  if(xrUiVolumeThumb){
    xrUiVolumeThumb.position.x=-.23+vol*.46;
  }
}

function updateXRUIViews(){
  xrUiMainNodes.forEach(n=>{if(n) n.visible=(xrUiView==='main');});
  xrUiLevelNodes.forEach(n=>{if(n) n.visible=(xrUiView==='level');});
  xrUiSettingNodes.forEach(n=>{if(n) n.visible=(xrUiView==='setting');});
  ['easy','hard','special','archery'].forEach(mode=>{
    const b=xrUiLevelButtons[mode];
    if(!b) return;
    const selected=(G.mode===mode);
    b.userData.xrUiBaseOpacity=selected?1:.82;
    b.userData.xrUiBaseScale=selected ? .68 : .62;
    if(!b.userData.xrUiHover){
      b.material.opacity=b.userData.xrUiBaseOpacity;
      b.scale.setScalar(b.userData.xrUiBaseScale);
    }
  });
}

function setXrVolumeFromHit(hit){
  if(!hit||!hit.object||hit.object!==xrUiVolumeSliderHit) return;
  const u=hit.uv?Math.max(0,Math.min(1,hit.uv.x)):.5;
  bgmVolume=Math.max(0,Math.min(1,u));
  if(volEl) volEl.value=String(Math.round(bgmVolume*100));
  applyBgmVolume();
  updateXRVolumeBar();
  startAmb();
}

function makeXRSharpTextTexture(text,opt={}){
  const cnv=document.createElement('canvas');
  cnv.width=1024;
  cnv.height=256;
  const ctx=cnv.getContext('2d');
  ctx.clearRect(0,0,cnv.width,cnv.height);
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font=opt.font||'900 88px Orbitron,Segoe UI,Arial,sans-serif';
  if(opt.gradient&&opt.gradient.length){
    const gradient=ctx.createLinearGradient(0,0,cnv.width,0);
    const last=Math.max(1,opt.gradient.length-1);
    opt.gradient.forEach((color,index)=>gradient.addColorStop(index/last,color));
    ctx.fillStyle=gradient;
  }else{
    ctx.fillStyle=opt.color||'#e8fbff';
  }
  ctx.shadowColor=opt.glow||'rgba(0,245,255,.4)';
  ctx.shadowBlur=18;
  ctx.fillText(text,cnv.width*.5,cnv.height*.52);
  ctx.shadowBlur=0;
  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function createXRMenuTitleBlock(text,y,opt={}){
  const g=new THREE.Group();
  const w=opt.w||1.36;
  const h=opt.h||.18;
  const d=opt.d||.06;

  const body=new THREE.Mesh(
    new THREE.BoxGeometry(w,h,d),
    new THREE.MeshPhysicalMaterial({
      color:opt.body||0x12212d,
      metalness:.32,
      roughness:.1,
      transmission:.42,
      transparent:true,
      opacity:.9,
      clearcoat:1,
      clearcoatRoughness:.02,
      emissive:opt.emissive||0x1f4e74,
      emissiveIntensity:.28
    })
  );
  g.add(body);

  const frame=new THREE.Mesh(
    new THREE.BoxGeometry(w*1.035,h*1.18,d*.58),
    new THREE.MeshStandardMaterial({color:0x60727d,metalness:.96,roughness:.16,emissive:opt.frameGlow||0x356f9c,emissiveIntensity:.54})
  );
  frame.position.z=-d*.3;
  g.add(frame);

  const glassGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(w*1.08,h*1.42),
    new THREE.MeshBasicMaterial({color:opt.frameGlow||0x74e9ff,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  glassGlow.position.z=-d*.65;
  g.add(glassGlow);

  const bracketMat=new THREE.MeshStandardMaterial({
    color:0xa5b3ba,metalness:1,roughness:.12,
    emissive:opt.frameGlow||0x356f9c,emissiveIntensity:.7
  });
  [-1,1].forEach(side=>{
    const bracket=new THREE.Mesh(new THREE.BoxGeometry(.035,h*1.32,d*1.1),bracketMat);
    bracket.position.x=side*w*.515;
    bracket.rotation.z=side*.1;
    g.add(bracket);
  });

  const t=makeXRSharpTextTexture(text,{
    font:opt.font,
    color:opt.textColor,
    gradient:opt.textGradient,
    glow:opt.textGlow
  });
  const label=new THREE.Mesh(
    new THREE.PlaneGeometry(w*.9,h*.6),
    new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,toneMapped:false})
  );
  label.position.z=d*.52;
  g.add(label);

  g.position.set(0,y,.02);
  xrMenuPanel.add(g);
  xrMenuTitleRig=g;
  return g;
}


function makeXRHubPanelTexture(){
  const cnv=document.createElement('canvas');
  cnv.width=1400;cnv.height=820;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  ctx.clearRect(0,0,w,h);

  const glass=ctx.createLinearGradient(0,0,0,h);
  glass.addColorStop(0,'rgba(72,92,112,.7)');
  glass.addColorStop(.45,'rgba(20,34,49,.78)');
  glass.addColorStop(1,'rgba(9,18,29,.88)');
  pathRoundedRect(ctx,18,16,w-36,h-32,32);
  ctx.fillStyle=glass;
  ctx.fill();

  const topLight=ctx.createLinearGradient(0,0,w,0);
  topLight.addColorStop(0,'rgba(95,230,255,.15)');
  topLight.addColorStop(.45,'rgba(255,255,255,.32)');
  topLight.addColorStop(1,'rgba(151,103,255,.16)');
  pathRoundedRect(ctx,18,16,w-36,h-32,32);
  ctx.strokeStyle=topLight;
  ctx.lineWidth=5;
  ctx.stroke();

  pathRoundedRect(ctx,35,32,w-70,h-64,24);
  ctx.strokeStyle='rgba(220,244,255,.13)';
  ctx.lineWidth=2;
  ctx.stroke();

  for(let y=70;y<h-40;y+=44){
    ctx.strokeStyle='rgba(145,205,235,.025)';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(w-42,y);ctx.stroke();
  }

  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function drawXRHubModeIcon(ctx,mode,cx,cy,size,accent){
  ctx.save();
  ctx.translate(cx,cy);
  ctx.strokeStyle=accent;
  ctx.fillStyle=accent;
  ctx.lineWidth=10;
  ctx.shadowColor=accent;
  ctx.shadowBlur=28;
  if(mode==='easy'){
    ctx.beginPath();ctx.arc(0,0,size*.68,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=-Math.PI*.5+i*Math.PI/3;
      const r=i%2?size*.48:size*.62;
      const x=Math.cos(a)*r,y=Math.sin(a)*r;
      if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.closePath();ctx.globalAlpha=.72;ctx.fill();
  }else if(mode==='hard'){
    ctx.rotate(Math.PI*.25);
    ctx.strokeRect(-size*.46,-size*.46,size*.92,size*.92);
    ctx.globalAlpha=.76;ctx.fillRect(-size*.3,-size*.3,size*.6,size*.6);
    ctx.globalAlpha=1;
    ctx.beginPath();ctx.moveTo(-size*.55,0);ctx.lineTo(size*.55,0);ctx.moveTo(0,-size*.55);ctx.lineTo(0,size*.55);ctx.stroke();
  }else if(mode==='special'){
    for(let i=0;i<4;i++){
      ctx.beginPath();
      ctx.arc(0,0,size*(.25+i*.12),i*.9,Math.PI*1.45+i*.9);
      ctx.stroke();
    }
    ctx.beginPath();ctx.arc(0,0,size*.12,0,Math.PI*2);ctx.fill();
  }else{
    [1,.68,.35].forEach(r=>{ctx.beginPath();ctx.arc(0,0,size*.62*r,0,Math.PI*2);ctx.stroke();});
    ctx.lineWidth=13;
    ctx.beginPath();ctx.moveTo(-size*.1,size*.1);ctx.lineTo(size*.72,-size*.72);ctx.stroke();
    ctx.beginPath();ctx.moveTo(size*.72,-size*.72);ctx.lineTo(size*.42,-size*.66);ctx.lineTo(size*.66,-size*.42);ctx.closePath();ctx.fill();
  }
  ctx.restore();
}

function makeXRHubCardTexture(mode,title,descLines,accent){
  const cnv=document.createElement('canvas');
  cnv.width=560;cnv.height=980;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  const ac=h2c(accent);
  const rgb=`${ac.r*255|0},${ac.g*255|0},${ac.b*255|0}`;

  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,`rgba(${rgb},.2)`);
  bg.addColorStop(.48,'rgba(12,23,35,.93)');
  bg.addColorStop(1,`rgba(${rgb},.12)`);
  pathRoundedRect(ctx,18,16,w-36,h-32,36);
  ctx.fillStyle=bg;ctx.fill();

  const edge=ctx.createLinearGradient(0,0,w,h);
  edge.addColorStop(0,`rgba(${rgb},.98)`);
  edge.addColorStop(.5,'rgba(235,250,255,.65)');
  edge.addColorStop(1,`rgba(${rgb},.72)`);
  pathRoundedRect(ctx,18,16,w-36,h-32,36);
  ctx.strokeStyle=edge;ctx.lineWidth=9;ctx.stroke();
  pathRoundedRect(ctx,36,34,w-72,h-68,25);
  ctx.strokeStyle=`rgba(${rgb},.28)`;ctx.lineWidth=3;ctx.stroke();

  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle='#f5fbff';ctx.shadowColor=accent;ctx.shadowBlur=20;
  ctx.font='900 64px Segoe UI,Arial,sans-serif';
  ctx.fillText(title,w*.5,145);
  drawXRHubModeIcon(ctx,mode,w*.5,450,125,accent);

  ctx.shadowBlur=0;ctx.fillStyle='rgba(235,247,255,.9)';
  ctx.font='700 39px Segoe UI,Arial,sans-serif';
  descLines.forEach((line,index)=>ctx.fillText(line,w*.5,760+index*50));

  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

const XR_HUB_WIDTH=2.55;
const XR_HUB_HEIGHT=1.48;
const XR_HUB_CURVE=.17;
const XR_HUB_CENTER_Y=1.4;

function getXRHubCurveZ(x){
  const nx=x/(XR_HUB_WIDTH*.5);
  return -.025+XR_HUB_CURVE*nx*nx*.92+.025;
}

function createXRMenuHubCard(mode,title,descLines,accent,x,index){
  const texture=makeXRHubCardTexture(mode,title,descLines,accent);
  const card=new THREE.Mesh(
    createCurvedPanelGeometry(.55,1.08,.024,18),
    new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.94,depthWrite:false,toneMapped:false})
  );
  card.position.set(x,1.45,getXRHubCurveZ(x)+.038);
  card.rotation.y=-x*.19;

  const glow=new THREE.Mesh(
    createCurvedPanelGeometry(.61,1.15,.028,18),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(accent),transparent:true,opacity:.08,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  glow.position.z=-.018;
  card.add(glow);

  const selectedBar=new THREE.Mesh(
    new THREE.PlaneGeometry(.34,.018),
    new THREE.MeshBasicMaterial({color:new THREE.Color(accent),transparent:true,opacity:.76,depthWrite:false})
  );
  selectedBar.position.set(0,-.54,.018);
  card.add(selectedBar);

  const statusTex=makeXRSharpTextTexture('TRUY CẬP',{
    font:'800 54px Segoe UI,Arial,sans-serif',color:'#f4fbff',glow:'rgba(255,255,255,.35)'
  });
  const status=new THREE.Mesh(
    new THREE.PlaneGeometry(.3,.05),
    new THREE.MeshBasicMaterial({map:statusTex,transparent:true,opacity:.9,depthWrite:false,toneMapped:false})
  );
  status.position.set(0,-.59,.02);
  status.visible=false;
  card.add(status);

  card.userData.xrUiAction='mode-'+mode;
  card.userData.xrUiHover=false;
  card.userData.xrUiBaseOpacity=.94;
  card.userData.xrUiBaseScale=1;
  card.userData.xrUiHoverScale=1.05;
  card.userData.xrUiBaseZ=card.position.z;
  card.userData.xrUiHoverZBoost=.055;
  card.userData.modeColor=new THREE.Color(accent).getHex();
  card.userData.modeGlow=glow;
  card.userData.selectedBar=selectedBar;
  card.userData.status=status;
  card.userData.phase=index*.8;
  card.userData.xrMenuHubCard=true;

  xrMenuPanel.add(card);
  xrInteractiveButtons.push(card);
  xrMenuModeButtons[mode]=card;
}

function setupXRMenuUI(){
  const panelTexture=makeXRHubPanelTexture();
  const hubPanel=new THREE.Mesh(
    createCurvedPanelGeometry(XR_HUB_WIDTH,XR_HUB_HEIGHT,XR_HUB_CURVE,56),
    new THREE.MeshBasicMaterial({
      map:panelTexture,transparent:true,opacity:.9,
      depthWrite:false,toneMapped:false,side:THREE.DoubleSide
    })
  );
  hubPanel.position.set(0,XR_HUB_CENTER_Y,-.025);
  xrMenuPanel.add(hubPanel);

  const panelGlow=new THREE.Mesh(
    createCurvedPanelGeometry(2.68,1.6,XR_HUB_CURVE+.018,56),
    new THREE.MeshBasicMaterial({
      color:0x82eaff,transparent:true,opacity:.055,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  panelGlow.position.set(0,XR_HUB_CENTER_Y,-.06);
  xrMenuPanel.add(panelGlow);

  const floorDisc=new THREE.Mesh(
    new THREE.CircleGeometry(.98,72),
    new THREE.MeshBasicMaterial({
      color:0x07566c,transparent:true,opacity:.1,
      blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide
    })
  );
  floorDisc.rotation.x=-Math.PI*.5;
  floorDisc.position.set(0,.018,.76);
  xrMenuPanel.add(floorDisc);

  [.28,.58,.94].forEach((radius,index)=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(radius,.013+index*.003,10,96),
      new THREE.MeshBasicMaterial({
        color:index===1?0xa3f7ff:0x58e8ff,
        transparent:true,
        opacity:.68-index*.08,
        blending:THREE.AdditiveBlending,
        depthWrite:false
      })
    );
    ring.rotation.x=Math.PI*.5;
    ring.position.set(0,.032+index*.004,.76);
    ring.userData.baseOpacity=.58-index*.07;
    ring.userData.phase=index*.85;
    ring.userData.baseScale=new THREE.Vector3(1,1,1);
    xrMenuPanel.add(ring);
    xrMenuAmbientNodes.push(ring);
  });

  xrMenuFocusCore=new THREE.Mesh(
    new THREE.OctahedronGeometry(.058,1),
    new THREE.MeshStandardMaterial({
      color:0xffffff,metalness:.15,roughness:.08,
      emissive:0x45eaff,emissiveIntensity:2.1
    })
  );
  xrMenuFocusCore.position.set(0,.078,.76);
  xrMenuPanel.add(xrMenuFocusCore);

  const focusHalo=new THREE.Mesh(
    new THREE.SphereGeometry(.13,22,16),
    new THREE.MeshBasicMaterial({
      color:0x6df3ff,transparent:true,opacity:.14,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  xrMenuFocusCore.add(focusHalo);
  xrMenuFocusCore.userData.halo=focusHalo;

  createXRMenuTitleBlock('COLOR CIRCLE VR',2.16,{
    w:1.5,h:.27,d:.085,
    body:0x12212d,
    emissive:0x0c3446,
    frameGlow:0xb8f0ff,
    font:'900 104px Arial Black,Segoe UI,sans-serif',
    textColor:'#f3fdff',
    textGradient:['#71eaff','#ffffff','#ffd487'],
    textGlow:'rgba(120,235,255,.5)'
  });

  createXRMenuHubCard('easy','DỄ',['TRẢI NGHIỆM','THƯ GIÃN'],'#65dcff',-.87,1);
  createXRMenuHubCard('hard','KHÓ',['THỬ THÁCH','TỐC ĐỘ'],'#ff9a3d',-.29,2);
  createXRMenuHubCard('special','ĐẶC BIỆT',['QUY TẮC & CÂU ĐỐ','ĐỘC ĐÁO'],'#bd70ff',.29,3);
  createXRMenuHubCard('archery','BẮN CUNG',['ĐỘ CHÍNH XÁC','TUYỆT ĐỐI'],'#62e98e',.87,4);

  const particleCount=42;
  const particlePositions=new Float32Array(particleCount*3);
  const particleBase=new Float32Array(particleCount*3);
  const particlePhase=new Float32Array(particleCount);
  for(let i=0;i<particleCount;i++){
    const p=i*3;
    particlePositions[p]=particleBase[p]=(Math.random()-.5)*(XR_HUB_WIDTH-.2);
    particlePositions[p+1]=particleBase[p+1]=.75+Math.random()*1.3;
    particlePositions[p+2]=particleBase[p+2]=getXRHubCurveZ(particlePositions[p])+.045+Math.random()*.018;
    particlePhase[i]=Math.random()*Math.PI*2;
  }
  const particleGeo=new THREE.BufferGeometry();
  particleGeo.setAttribute('position',new THREE.BufferAttribute(particlePositions,3));
  const hubParticles=new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({
      color:0xc9f7ff,size:.012,transparent:true,opacity:.55,
      blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:true
    })
  );
  hubParticles.userData.base=particleBase;
  hubParticles.userData.phase=particlePhase;
  xrMenuPanel.userData.hubParticles=hubParticles;
  xrMenuPanel.add(hubParticles);

  xrMenuPanel.visible=false;
  xrMenuPanel.renderOrder=9999;
  scene.add(xrMenuPanel);
}

function updateXRMenuVisual(){
  const t=performance.now()*.001;
  ['easy','hard','special','archery'].forEach((mode,index)=>{
    const card=xrMenuModeButtons[mode];
    if(!card) return;
    const selected=G.mode===mode;
    const hovered=card.userData.xrUiHover;
    card.userData.xrUiBaseOpacity=selected?1:.9;
    card.userData.xrUiBaseScale=selected?1.018:1;
    if(!hovered){
      card.material.opacity=card.userData.xrUiBaseOpacity;
      card.scale.setScalar(card.userData.xrUiBaseScale);
      card.position.z=card.userData.xrUiBaseZ;
    }
    card.userData.modeGlow.material.opacity=hovered
      ? .3
      : (selected?.16:.07)+Math.sin(t*2+index)*.018;
    card.userData.selectedBar.material.opacity=hovered?.95:(selected?.72:.3);
    card.userData.selectedBar.scale.x=hovered?1.14:(selected?1:0.72);
    card.userData.status.visible=hovered;
  });

  xrMenuAmbientNodes.forEach((node,index)=>{
    const pulse=.5+.5*Math.sin(t*(1.8+index*.2)+node.userData.phase);
    node.material.opacity=node.userData.baseOpacity+pulse*.14;
    const scale=1+pulse*(.018+index*.008);
    const baseScale=node.userData.baseScale||new THREE.Vector3(1,1,1);
    node.scale.set(baseScale.x*scale,baseScale.y*scale,baseScale.z*scale);
  });
  const hubParticles=xrMenuPanel.userData.hubParticles;
  if(hubParticles){
    const pos=hubParticles.geometry.attributes.position.array;
    const base=hubParticles.userData.base;
    const phase=hubParticles.userData.phase;
    for(let i=0;i<phase.length;i++){
      const p=i*3;
      pos[p]=base[p]+Math.sin(t*.8+phase[i])*.012;
      pos[p+1]=base[p+1]+Math.sin(t*1.15+phase[i])*.018;
    }
    hubParticles.geometry.attributes.position.needsUpdate=true;
    hubParticles.material.opacity=.42+Math.sin(t*1.7)*.12;
  }
  if(xrMenuFocusCore){
    xrMenuFocusCore.rotation.y=t*1.1;
    xrMenuFocusCore.rotation.x=t*.58;
    const pulse=1+Math.sin(t*2.6)*.07;
    xrMenuFocusCore.scale.setScalar(pulse);
  }
  if(xrMenuTitleRig){
    xrMenuTitleRig.position.y=2.16+Math.sin(t*1.2)*.006;
    xrMenuTitleRig.rotation.z=Math.sin(t*.62)*.0025;
  }
}

function formatClockTime(totalSec){
  const s=Math.max(0,Math.floor(totalSec||0));
  const m=Math.floor(s/60);
  return m+':'+String(s%60).padStart(2,'0');
}

function createXRVictoryButton(label,x,y,action,bg='#13344b'){
  const tex=makeXRButtonTexture(label,bg,'#e7fbff');
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.58,.2),mat);
  mesh.position.set(x,y,.11);
  mesh.renderOrder=10020;

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(.66,.24),
    new THREE.MeshBasicMaterial({color:0x95f4ff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  glow.position.z=-.01;
  glow.renderOrder=10019;
  mesh.add(glow);

  mesh.userData.xrUiAction=action;
  mesh.userData.xrUiTex=tex;
  mesh.userData.xrUiHover=false;
  mesh.userData.xrUiBaseOpacity=1;
  mesh.userData.xrUiBaseScale=1.02;
  xrVictoryButtonsRig.add(mesh);
  xrVictoryButtons.push(mesh);
  xrInteractiveButtons.push(mesh);
  return mesh;
}

function createXRDefeatButton(label,x,y,action,bg='#40222b'){
  const tex=makeXRButtonTexture(label,bg,'#ffe9ef');
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.58,.2),mat);
  mesh.position.set(x,y,.11);
  mesh.renderOrder=10020;

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(.66,.24),
    new THREE.MeshBasicMaterial({color:0xff9fbe,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  glow.position.z=-.01;
  glow.renderOrder=10019;
  mesh.add(glow);

  mesh.userData.xrUiAction=action;
  mesh.userData.xrUiTex=tex;
  mesh.userData.xrUiHover=false;
  mesh.userData.xrUiBaseOpacity=1;
  mesh.userData.xrUiBaseScale=1.02;
  xrDefeatButtonsRig.add(mesh);
  xrDefeatButtons.push(mesh);
  xrInteractiveButtons.push(mesh);
  return mesh;
}

function drawXRVictoryTexts(){
  if(!xrVictoryTitleCtx||!xrVictoryTitleTexture) return;

  const tctx=xrVictoryTitleCtx;
  const tw=xrVictoryTitleCanvas.width;
  const th=xrVictoryTitleCanvas.height;
  tctx.clearRect(0,0,tw,th);
  const tg=tctx.createLinearGradient(0,0,tw,th);
  tg.addColorStop(0,'rgba(106,255,255,.95)');
  tg.addColorStop(.5,'rgba(152,214,255,.98)');
  tg.addColorStop(1,'rgba(192,126,255,.95)');
  tctx.textAlign='center';
  tctx.textBaseline='middle';
  tctx.font='900 168px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(106,245,255,.85)';
  tctx.shadowBlur=34;
  tctx.fillStyle=tg;
  tctx.fillText('VICTORY',tw*.5,th*.5+8);
  tctx.shadowBlur=0;
  xrVictoryTitleTexture.needsUpdate=true;

  const statItems=[
    {k:'LEVEL',v:xrVictoryData.level,c:'#8ee8ff'},
    {k:'SCORE',v:xrVictoryData.score,c:'#7ea2ff'},
    {k:'TIME',v:xrVictoryData.time,c:'#7cd5ff'},
    {k:'COMBO',v:xrVictoryData.maxCombo,c:'#b48fff'}
  ];
  statItems.forEach((item,i)=>{
    const canvas=xrVictoryStatCanvases[i];
    const texture=xrVictoryStatTextures[i];
    if(!canvas||!texture) return;
    const sctx=canvas.getContext('2d');
    const sw=canvas.width;
    const sh=canvas.height;
    sctx.clearRect(0,0,sw,sh);

    const bg=sctx.createLinearGradient(0,0,0,sh);
    bg.addColorStop(0,'rgba(18,46,84,.88)');
    bg.addColorStop(1,'rgba(8,18,36,.95)');
    pathRoundedRect(sctx,20,14,sw-40,sh-28,28);
    sctx.fillStyle=bg;
    sctx.fill();

    sctx.strokeStyle='rgba(136,228,255,.52)';
    sctx.lineWidth=2.4;
    pathRoundedRect(sctx,20,14,sw-40,sh-28,28);
    sctx.stroke();

    sctx.textAlign='center';
    sctx.textBaseline='middle';
    sctx.fillStyle='rgba(214,238,255,.92)';
    sctx.font='700 34px Segoe UI,Arial,sans-serif';
    sctx.fillText(item.k,sw*.5,52);

    sctx.fillStyle=item.c;
    sctx.font='900 60px Segoe UI,Arial,sans-serif';
    sctx.shadowColor=item.c;
    sctx.shadowBlur=14;
    sctx.fillText(item.v,sw*.5,122);
    sctx.shadowBlur=0;

    texture.needsUpdate=true;
  });
}

function ensureXRVictoryArena(){
  if(xrVictoryTitleMesh) return;

  const floor=new THREE.Mesh(
    new THREE.CircleGeometry(1.86,96),
    new THREE.MeshBasicMaterial({color:0x07142a,transparent:true,opacity:.72,depthWrite:false})
  );
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.9;
  xrVictoryArena.add(floor);

  const floorGlow=new THREE.Mesh(
    new THREE.CircleGeometry(2.05,96),
    new THREE.MeshBasicMaterial({color:0x49dfff,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  floorGlow.rotation.x=-Math.PI/2;
  floorGlow.position.y=-.89;
  xrVictoryArena.add(floorGlow);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(1.38,.04,10,96),
    new THREE.MeshBasicMaterial({color:0x7aefff,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  ring.rotation.x=Math.PI/2;
  ring.position.y=-.76;
  ring.userData.vt='ring';
  ring.userData.vSpeed=.52;
  ring.userData.baseOpacity=.34;
  xrVictoryArena.add(ring);
  xrVictoryAnimatedNodes.push(ring);

  const ring2=new THREE.Mesh(
    new THREE.TorusGeometry(1.02,.026,10,84),
    new THREE.MeshBasicMaterial({color:0xa58bff,transparent:true,opacity:.26,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  ring2.rotation.x=Math.PI/2;
  ring2.position.y=-.68;
  ring2.userData.vt='ring';
  ring2.userData.vSpeed=-.68;
  ring2.userData.baseOpacity=.26;
  xrVictoryArena.add(ring2);
  xrVictoryAnimatedNodes.push(ring2);

  for(let i=0;i<16;i++){
    const col=i%3===0?0x8eefff:(i%3===1?0xa992ff:0x68b7ff);
    const orb=new THREE.Mesh(
      new THREE.SphereGeometry(.022+(i%4)*.002,10,10),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    orb.userData.vt='orb';
    orb.userData.orbitRadius=.62+Math.random()*.58;
    orb.userData.orbitSpeed=.34+Math.random()*.48;
    orb.userData.orbitPhase=Math.random()*Math.PI*2;
    orb.userData.orbitYOffset=-.08+Math.random()*.8;
    orb.userData.baseOpacity=.46+Math.random()*.26;
    xrVictoryArena.add(orb);
    xrVictoryAnimatedNodes.push(orb);
  }

  xrVictoryTitleCanvas=document.createElement('canvas');
  xrVictoryTitleCanvas.width=1024;
  xrVictoryTitleCanvas.height=260;
  xrVictoryTitleCtx=xrVictoryTitleCanvas.getContext('2d');
  xrVictoryTitleTexture=new THREE.CanvasTexture(xrVictoryTitleCanvas);
  xrVictoryTitleTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrVictoryTitleTexture.needsUpdate=true;

  xrVictoryStatCanvases.length=0;
  xrVictoryStatTextures.length=0;
  xrVictoryStatMeshes.length=0;
  for(let i=0;i<4;i++){
    const c=document.createElement('canvas');
    c.width=512;
    c.height=180;
    const tex=new THREE.CanvasTexture(c);
    tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
    tex.needsUpdate=true;
    xrVictoryStatCanvases.push(c);
    xrVictoryStatTextures.push(tex);
  }

  xrVictoryTitleRig=new THREE.Group();
  xrVictoryStatsRig=new THREE.Group();
  xrVictoryButtonsRig=new THREE.Group();

  xrVictoryTitleMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(1.56,.36),
    new THREE.MeshBasicMaterial({map:xrVictoryTitleTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );

  for(let i=0;i<4;i++){
    const depthLayer=new THREE.Mesh(
      new THREE.PlaneGeometry(1.56,.36),
      new THREE.MeshBasicMaterial({map:xrVictoryTitleTexture,transparent:true,opacity:.18,depthTest:false,depthWrite:false,toneMapped:false,color:0x1a2d54})
    );
    depthLayer.position.set(0,-.002*i,-.012*(i+1));
    xrVictoryTitleRig.add(depthLayer);
  }

  const titleGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(1.74,.44),
    new THREE.MeshBasicMaterial({color:0x82eaff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  titleGlow.position.z=-.035;
  xrVictoryTitleRig.add(titleGlow);

  xrVictoryTitleMesh.position.z=.01;
  xrVictoryTitleMesh.renderOrder=10003;
  xrVictoryTitleRig.add(xrVictoryTitleMesh);

  const statAngles=[-.72,-.24,.24,.72];
  statAngles.forEach((a,i)=>{
    const cardRig=new THREE.Group();
    const r=.9;
    cardRig.position.set(Math.sin(a)*r,-.2+Math.abs(a)*.04,.08+Math.cos(a)*.24);
    cardRig.rotation.y=-a*.42;

    const cardBack=new THREE.Mesh(
      new THREE.PlaneGeometry(.6,.22),
      new THREE.MeshBasicMaterial({color:0x0b1f3c,transparent:true,opacity:.72,depthTest:false,depthWrite:false,toneMapped:false})
    );
    cardBack.position.z=-.008;
    cardRig.add(cardBack);

    const cardGlow=new THREE.Mesh(
      new THREE.PlaneGeometry(.66,.26),
      new THREE.MeshBasicMaterial({color:i%2?0x9b8dff:0x82e9ff,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
    );
    cardGlow.position.z=-.02;
    cardRig.add(cardGlow);

    const statMesh=new THREE.Mesh(
      new THREE.PlaneGeometry(.58,.2),
      new THREE.MeshBasicMaterial({map:xrVictoryStatTextures[i],transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
    );
    statMesh.renderOrder=10002;
    cardRig.add(statMesh);
    xrVictoryStatMeshes.push(statMesh);

    cardRig.userData.vt='stat-card';
    cardRig.userData.floatPhase=i*.9;
    cardRig.userData.baseY=cardRig.position.y;
    xrVictoryStatsRig.add(cardRig);
    xrVictoryAnimatedNodes.push(cardRig);
  });

  const buttonBack=new THREE.Mesh(
    new THREE.PlaneGeometry(1.4,.32),
    new THREE.MeshBasicMaterial({color:0x0b2340,transparent:true,opacity:.34,depthTest:false,depthWrite:false,toneMapped:false})
  );
  buttonBack.position.z=-.02;
  buttonBack.renderOrder=10001;
  xrVictoryButtonsRig.add(buttonBack);

  xrVictoryTitleRig.position.set(0,.74,.08);
  xrVictoryStatsRig.position.set(0,-.04,.04);
  xrVictoryButtonsRig.position.set(0,-.86,.11);
  xrVictoryArena.add(xrVictoryTitleRig);
  xrVictoryArena.add(xrVictoryStatsRig);
  xrVictoryArena.add(xrVictoryButtonsRig);

  const menuBtn=createXRVictoryButton('MENU',-.3,0,'victory-menu','#34133f');
  const replayBtn=createXRVictoryButton('CHOI LAI',.3,0,'victory-replay','#123b2f');
  menuBtn.position.z=.02;
  replayBtn.position.z=.08;
  menuBtn.userData.xrUiBaseZ=menuBtn.position.z;
  replayBtn.userData.xrUiBaseZ=replayBtn.position.z;
  menuBtn.userData.xrUiHoverZBoost=.085;
  replayBtn.userData.xrUiHoverZBoost=.1;
  menuBtn.userData.xrUiBaseScale=1.02;
  replayBtn.userData.xrUiBaseScale=1.02;

  xrVictoryArena.visible=false;
  xrVictoryArena.renderOrder=10000;
  scene.add(xrVictoryArena);
  drawXRVictoryTexts();
}

function drawXRDefeatTexts(){
  if(!xrDefeatTitleCtx||!xrDefeatStatsCtx||!xrDefeatTitleTexture||!xrDefeatStatsTexture) return;

  const tctx=xrDefeatTitleCtx;
  const tw=xrDefeatTitleCanvas.width;
  const th=xrDefeatTitleCanvas.height;
  tctx.clearRect(0,0,tw,th);
  const tg=tctx.createLinearGradient(0,0,tw,th);
  tg.addColorStop(0,'rgba(255,166,191,.95)');
  tg.addColorStop(.55,'rgba(255,126,173,.98)');
  tg.addColorStop(1,'rgba(255,80,120,.95)');
  tctx.textAlign='center';
  tctx.textBaseline='middle';
  tctx.font='900 144px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(255,118,169,.72)';
  tctx.shadowBlur=28;
  tctx.fillStyle=tg;
  tctx.fillText('TRY AGAIN',tw*.5,th*.5+6);
  tctx.shadowBlur=0;
  xrDefeatTitleTexture.needsUpdate=true;

  const sctx=xrDefeatStatsCtx;
  const sw=xrDefeatStatsCanvas.width;
  const sh=xrDefeatStatsCanvas.height;
  sctx.clearRect(0,0,sw,sh);
  const bg=sctx.createLinearGradient(0,0,0,sh);
  bg.addColorStop(0,'rgba(84,22,45,.88)');
  bg.addColorStop(1,'rgba(32,10,18,.95)');
  pathRoundedRect(sctx,26,18,sw-52,sh-36,34);
  sctx.fillStyle=bg;
  sctx.fill();

  sctx.fillStyle='rgba(255,236,244,.98)';
  sctx.textAlign='left';
  sctx.textBaseline='middle';
  sctx.font='700 58px Segoe UI,Arial,sans-serif';
  sctx.shadowColor='rgba(255,158,198,.65)';
  sctx.shadowBlur=11;
  sctx.fillText('Level: '+xrDefeatData.level,70,96);
  sctx.fillText('Score: '+xrDefeatData.score,70,174);
  sctx.fillText('Times: '+xrDefeatData.time,70,252);
  sctx.fillText('Max Combo: '+xrDefeatData.maxCombo,70,330);
  sctx.shadowBlur=0;
  xrDefeatStatsTexture.needsUpdate=true;
}

function ensureXRDefeatArena(){
  if(xrDefeatTitleMesh) return;

  const floor=new THREE.Mesh(
    new THREE.CircleGeometry(1.65,88),
    new THREE.MeshBasicMaterial({color:0x1a0810,transparent:true,opacity:.74,depthWrite:false})
  );
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.92;
  xrDefeatArena.add(floor);

  const ring=new THREE.Mesh(
    new THREE.TorusGeometry(1.32,.045,10,96),
    new THREE.MeshBasicMaterial({color:0xff7ea8,transparent:true,opacity:.36,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  ring.rotation.x=Math.PI/2;
  ring.position.y=-.73;
  xrDefeatArena.add(ring);
  xrDefeatAnimatedNodes.push(ring);

  const smokeGeo=new THREE.BufferGeometry();
  const smokeN=180;
  const smokePos=new Float32Array(smokeN*3);
  for(let i=0;i<smokeN;i++){
    const a=Math.random()*Math.PI*2;
    const rr=.2+Math.random()*1.15;
    smokePos[i*3]=Math.cos(a)*rr;
    smokePos[i*3+1]=-.62+Math.random()*.95;
    smokePos[i*3+2]=Math.sin(a)*rr;
  }
  smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokePos,3));
  const smoke=new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({color:0xff9fbd,size:.02,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  xrDefeatArena.add(smoke);
  xrDefeatAnimatedNodes.push(smoke);

  xrDefeatTitleCanvas=document.createElement('canvas');
  xrDefeatTitleCanvas.width=1024;
  xrDefeatTitleCanvas.height=260;
  xrDefeatTitleCtx=xrDefeatTitleCanvas.getContext('2d');
  xrDefeatTitleTexture=new THREE.CanvasTexture(xrDefeatTitleCanvas);
  xrDefeatTitleTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrDefeatTitleTexture.needsUpdate=true;

  xrDefeatStatsCanvas=document.createElement('canvas');
  xrDefeatStatsCanvas.width=1024;
  xrDefeatStatsCanvas.height=380;
  xrDefeatStatsCtx=xrDefeatStatsCanvas.getContext('2d');
  xrDefeatStatsTexture=new THREE.CanvasTexture(xrDefeatStatsCanvas);
  xrDefeatStatsTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrDefeatStatsTexture.needsUpdate=true;

  xrDefeatTitleRig=new THREE.Group();
  xrDefeatStatsRig=new THREE.Group();
  xrDefeatButtonsRig=new THREE.Group();

  xrDefeatTitleMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(1.82,.46),
    new THREE.MeshBasicMaterial({map:xrDefeatTitleTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );
  xrDefeatStatsMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(1.46,.56),
    new THREE.MeshBasicMaterial({map:xrDefeatStatsTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );

  const statsGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(1.58,.66),
    new THREE.MeshBasicMaterial({color:0xff91b6,transparent:true,opacity:.12,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  statsGlow.position.z=-.01;
  xrDefeatStatsRig.add(statsGlow);

  const buttonBack=new THREE.Mesh(
    new THREE.PlaneGeometry(1.34,.28),
    new THREE.MeshBasicMaterial({color:0x34101a,transparent:true,opacity:.5,depthTest:false,depthWrite:false,toneMapped:false})
  );
  buttonBack.position.z=.01;
  buttonBack.renderOrder=10001;
  xrDefeatButtonsRig.add(buttonBack);

  xrDefeatTitleRig.position.set(0,.54,.02);
  xrDefeatStatsRig.position.set(0,-.22,.03);
  xrDefeatButtonsRig.position.set(0,-.9,.06);
  xrDefeatTitleRig.add(xrDefeatTitleMesh);
  xrDefeatStatsRig.add(xrDefeatStatsMesh);
  xrDefeatTitleMesh.renderOrder=10002;
  xrDefeatStatsMesh.renderOrder=10002;
  xrDefeatArena.add(xrDefeatTitleRig);
  xrDefeatArena.add(xrDefeatStatsRig);
  xrDefeatArena.add(xrDefeatButtonsRig);

  createXRDefeatButton('MENU',-.3,0,'defeat-menu','#3a1325');
  createXRDefeatButton('CHOI LAI',.3,0,'defeat-replay','#3a1f13');

  xrDefeatArena.visible=false;
  xrDefeatArena.renderOrder=10000;
  scene.add(xrDefeatArena);
  drawXRDefeatTexts();
}

function showXRVictoryArena(elapsedSeconds){
  ensureXRVictoryArena();
  if(xrDefeatActive) xrDefeatActive=false;
  if(xrDefeatArena) xrDefeatArena.visible=false;
  xrVictoryData.level=(G.lvIdx+1)+'/3';
  xrVictoryData.score=String(G.score);
  xrVictoryData.time=formatClockTime(elapsedSeconds);
  xrVictoryData.maxCombo='x'+G.maxCombo;
  drawXRVictoryTexts();

  xrVictoryPulse=0;
  xrVictoryActive=true;
  xrVictoryArena.visible=true;
  xrIngameMenuOpen=false;
  xrUiOpenAnim=0;
  xrUiSliderDragController=null;
  xrDragController=null;

  WG.visible=false;
  MARBLE_RACK.visible=false;
  BOARD.visible=false;

  const rs=document.getElementById('scr-result');
  if(rs) rs.classList.add('off');
  ['hud','prog-wrap','badge','hint','aim-label','power-wrap'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='none';
  });
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);

  resumeAC();
  playVictoryApplause();
}

function showXRDefeatArena(elapsedSeconds){
  ensureXRDefeatArena();
  if(xrVictoryActive) xrVictoryActive=false;
  if(xrVictoryArena) xrVictoryArena.visible=false;
  xrDefeatData.level=(G.lvIdx+1)+'/3';
  xrDefeatData.score=String(G.score);
  xrDefeatData.time=formatClockTime(elapsedSeconds);
  xrDefeatData.maxCombo='x'+G.maxCombo;
  drawXRDefeatTexts();

  xrDefeatPulse=0;
  xrDefeatActive=true;
  xrDefeatArena.visible=true;
  xrIngameMenuOpen=false;
  xrUiOpenAnim=0;
  xrUiSliderDragController=null;
  xrDragController=null;

  WG.visible=false;
  MARBLE_RACK.visible=false;
  BOARD.visible=false;

  const rs=document.getElementById('scr-result');
  if(rs) rs.classList.add('off');
  ['hud','prog-wrap','badge','hint','aim-label','power-wrap'].forEach(id=>{
    const el=document.getElementById(id);
    if(el) el.style.display='none';
  });
  aimCtx.clearRect(0,0,aimCanvas.width,aimCanvas.height);

  resumeAC();
  sfx.lose();
}

function hideXRVictoryArena(){
  xrVictoryActive=false;
  if(xrVictoryArena) xrVictoryArena.visible=false;
}

function hideXRDefeatArena(){
  xrDefeatActive=false;
  if(xrDefeatArena) xrDefeatArena.visible=false;
}

function hideXRArenas(){
  hideXRVictoryArena();
  hideXRDefeatArena();
  WG.visible=true;
  MARBLE_RACK.visible=true;
  BOARD.visible=true;
}

function updateXRVictoryArena(dt){
  if(!xrVictoryActive||!xrVictoryArena.visible) return;
  xrVictoryPulse+=dt*1.9;
  const p=1+Math.sin(xrVictoryPulse)*.026;
  if(xrVictoryTitleRig){
    xrVictoryTitleRig.scale.setScalar(p);
    xrVictoryTitleRig.position.set(
      Math.sin(xrVictoryPulse*1.2)*.03,
      .74+Math.cos(xrVictoryPulse*1.5)*.02,
      .08+Math.sin(xrVictoryPulse*.9)*.02
    );
    xrVictoryTitleRig.rotation.y=Math.sin(xrVictoryPulse*.45)*.12;
  }
  if(xrVictoryStatsRig) xrVictoryStatsRig.scale.setScalar(1+Math.sin(xrVictoryPulse*.8)*.015);
  xrVictoryAnimatedNodes.forEach((n,i)=>{
    if(!n) return;
    if(n.userData&&n.userData.vt==='ring'){
      n.rotation.y+=dt*(n.userData.vSpeed||.3);
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.24)+Math.sin(xrVictoryPulse*1.1+i)*.06;
      return;
    }
    if(n.userData&&n.userData.vt==='orb'){
      const a=xrVictoryPulse*(n.userData.orbitSpeed||.42)+(n.userData.orbitPhase||0);
      const r=n.userData.orbitRadius||.8;
      n.position.set(Math.cos(a)*r,n.userData.orbitYOffset+Math.sin(a*1.7)*.06,Math.sin(a)*r*.55);
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.54)+Math.sin(xrVictoryPulse*2.4+i)*.1;
      return;
    }
    if(n.userData&&n.userData.vt==='stat-card'){
      n.position.y=(n.userData.baseY||n.position.y)+Math.sin(xrVictoryPulse*1.35+(n.userData.floatPhase||0))*.012;
      n.rotation.z=Math.sin(xrVictoryPulse*.7+(n.userData.floatPhase||0))*.02;
      return;
    }
    n.rotation.z+=dt*(.18+i*.04);
  });
}

function updateXRDefeatArena(dt){
  if(!xrDefeatActive||!xrDefeatArena.visible) return;
  xrDefeatPulse+=dt*1.5;
  if(xrDefeatTitleRig){
    xrDefeatTitleRig.scale.setScalar(1+Math.sin(xrDefeatPulse)*.015);
    xrDefeatTitleRig.position.set(
      Math.sin(xrDefeatPulse*2.15)*.005,
      .54+Math.cos(xrDefeatPulse*1.9)*.0035,
      .02
    );
  }
  if(xrDefeatStatsRig) xrDefeatStatsRig.scale.setScalar(1+Math.cos(xrDefeatPulse*.7)*.008);
  xrDefeatAnimatedNodes.forEach((n,i)=>{
    if(!n) return;
    n.rotation.z-=dt*(.1+i*.03);
    if(n.material) n.material.opacity=.2+Math.sin(xrDefeatPulse*.9+i)*.08;
  });
}

function updateXRUITransform(){
  if(!renderer.xr.isPresenting&&!xrMouseSim.enabled){
    xrUiPanel.visible=false;
    xrUiToggleGroup.visible=false;
    xrMenuPanel.visible=false;
    xrCurvedHolo.visible=false;
    xrWristHud.visible=false;
    xrVictoryArena.visible=false;
    xrDefeatArena.visible=false;
    xrMenuAnchorReady=false;
    xrMenuReveal=0;
    return;
  }
  const xrCam=renderer.xr.isPresenting?renderer.xr.getCamera(camera):camera;
  xrCam.matrixWorld.decompose(xrUiCamPos,xrUiCamQuat,xrUiCamScale);
  xrUiWorldForward.set(0,0,-1).applyQuaternion(xrUiCamQuat).setY(0).normalize();
  xrUiWorldRight.set(1,0,0).applyQuaternion(xrUiCamQuat).setY(0).normalize();

  if(xrVictoryActive){
    xrUiPanel.visible=false;
    xrUiToggleGroup.visible=false;
    xrMenuPanel.visible=false;
    xrCurvedHolo.visible=false;
    xrWristHud.visible=false;
    xrVictoryArena.visible=true;
    xrUiTargetPos.copy(xrUiCamPos)
      .addScaledVector(xrUiWorldForward,2.05)
      .add(new THREE.Vector3(0,-0.03,0));
    xrVictoryArena.position.lerp(xrUiTargetPos,0.18);
    xrVictoryLookTarget.copy(xrUiCamPos).add(new THREE.Vector3(0,0.02,0));
    xrVictoryArena.lookAt(xrVictoryLookTarget);
    return;
  }

  if(xrDefeatActive){
    xrUiPanel.visible=false;
    xrUiToggleGroup.visible=false;
    xrMenuPanel.visible=false;
    xrCurvedHolo.visible=false;
    xrWristHud.visible=false;
    xrDefeatArena.visible=true;
    xrUiTargetPos.copy(xrUiCamPos)
      .addScaledVector(xrUiWorldForward,1.95)
      .add(new THREE.Vector3(0,-.05,0));
    xrDefeatArena.position.lerp(xrUiTargetPos,.18);
    xrDefeatLookTarget.copy(xrUiCamPos).add(new THREE.Vector3(0,.01,0));
    xrDefeatArena.lookAt(xrDefeatLookTarget);
    return;
  }

  updateXRWristHudTransform();
  if(G.active){
    xrMenuAnchorReady=false;
    xrMenuReveal=0;
    xrMenuPanel.visible=false;
    xrUiToggleGroup.visible=xrMouseSim.enabled&&!renderer.xr.isPresenting;
    xrCurvedHolo.visible=true;
    xrUiTargetPos.copy(WG.position).add(new THREE.Vector3(0,2.4,2.2));
    xrCurvedHolo.position.lerp(xrUiTargetPos,.2);
    xrCurvedHolo.lookAt(xrUiCamPos.x,xrCurvedHolo.position.y-.04,xrUiCamPos.z);
    xrCurvedHolo.scale.setScalar(1.6);
    if(xrHoloAccentGlow&&xrHoloAccentGlow.material){
      xrHoloPulse+=(.045+xrUiOpenAnim*.015);
      xrHoloAccentGlow.material.opacity=.06+Math.sin(xrHoloPulse)*.025;
    }
    const targetOpen=xrIngameMenuOpen?1:0;
    xrUiOpenAnim+=(targetOpen-xrUiOpenAnim)*.2;
    xrUiPanel.visible=xrUiOpenAnim>.03;
    if(xrIngameMenuOpen&&xrWristHud){
      xrWristHud.visible=false;
    }
    if(xrUiToggleGroup.visible){
      xrUiTargetPos.copy(xrUiCamPos)
        .addScaledVector(xrUiWorldForward,.72)
        .addScaledVector(xrUiWorldRight,.45)
        .add(new THREE.Vector3(0,.2,0));
      xrUiToggleGroup.position.lerp(xrUiTargetPos,.24);
      xrUiToggleGroup.lookAt(xrUiCamPos.x,xrUiToggleGroup.position.y,xrUiCamPos.z);
    }
    if(xrUiOpenAnim<=.03) return;
    xrUiTargetPos.copy(xrUiCamPos)
      .addScaledVector(xrUiWorldForward,1.02)
      .add(new THREE.Vector3(0,.02,0));
    xrUiPanel.position.lerp(xrUiTargetPos,.2);
    xrUiPanel.lookAt(xrUiCamPos.x,xrUiPanel.position.y,xrUiCamPos.z);
    const s=.86+.14*xrUiOpenAnim;
    xrUiPanel.scale.set(s,s,s);
    updateXRUIViews();
  }else{
    xrUiPanel.visible=false;
    xrUiToggleGroup.visible=false;
    xrCurvedHolo.visible=false;
    xrWristHud.visible=false;
    xrIngameMenuOpen=false;
    xrUiOpenAnim=0;
    xrMenuPanel.visible=true;
    updateXRMenuVisual();
    if(!xrMenuAnchorReady){
      xrMenuAnchorPos.copy(xrUiCamPos)
        .addScaledVector(xrUiWorldForward,1.72);
      xrMenuAnchorPos.y=WORLD_FLOOR_Y;
      xrMenuPanel.position.copy(xrMenuAnchorPos);
      xrMenuPanel.lookAt(xrUiCamPos.x,xrMenuAnchorPos.y,xrUiCamPos.z);
      xrMenuAnchorReady=true;
      xrMenuReveal=0;
    }
    xrMenuReveal+=(1-xrMenuReveal)*.12;
    const revealScale=.84+xrMenuReveal*.16;
    xrMenuPanel.scale.setScalar(revealScale);
  }
}

function setXRUIButtonHover(mesh,hovered){
  if(!mesh||mesh.userData.xrUiHover===hovered) return;
  mesh.userData.xrUiHover=hovered;
  if(mesh.userData.xrUiAction==='vol-slider') return;
  const base=mesh.userData.xrUiBaseOpacity ?? .92;
  const baseScale=mesh.userData.xrUiBaseScale ?? 1;
  const hoverScale=mesh.userData.xrUiHoverScale ?? 1.1;
  if(mesh.material&&typeof mesh.material.opacity==='number'){
    mesh.material.opacity=hovered?1:base;
  }
  const target=mesh.userData.xrUiScaleTarget||mesh;
  if(target&&target.scale) target.scale.setScalar(hovered?baseScale*hoverScale:baseScale);
  if(typeof mesh.userData.xrUiBaseZ==='number'){
    const zBoost=mesh.userData.xrUiHoverZBoost ?? 0;
    mesh.position.z=hovered ? (mesh.userData.xrUiBaseZ+zBoost) : mesh.userData.xrUiBaseZ;
  }
  if(mesh.userData.xrUiGlow&&mesh.userData.xrUiGlow.material){
    mesh.userData.xrUiGlow.material.opacity=hovered?.3:.08;
  }
  if(mesh.userData.modeGlow&&mesh.userData.modeGlow.material){
    mesh.userData.modeGlow.material.opacity=hovered?.38:.1;
  }
  if(mesh.userData.xrMenuHubCard&&mesh.userData.status){
    mesh.userData.status.visible=hovered;
  }
}

function applyXRUIAction(action){
  function startXRMode(mode,label){
    selMode(mode);
    xrIngameMenuOpen=false;
    xrUiView='main';
    updateXRUIViews();
    const started=startGame();
    if(started!==false) toast('Đã chọn '+label, 'inf', 700);
  }

  if(action==='victory-menu'){hideXRVictoryArena();showMenu();return;}
  if(action==='victory-replay'){hideXRVictoryArena();startGame();return;}
  if(action==='defeat-menu'){hideXRDefeatArena();showMenu();return;}
  if(action==='defeat-replay'){hideXRDefeatArena();startGame();return;}
  if(action==='ui-toggle'){
    xrIngameMenuOpen=!xrIngameMenuOpen;
    if(xrIngameMenuOpen){xrUiView='main';updateXRUIViews();}
    return;
  }
  if(action==='ui-close'){xrIngameMenuOpen=false;return;}
  if(action==='ui-new-game'){startGame();xrIngameMenuOpen=false;return;}
  if(action==='ui-open-level'){xrUiView='level';updateXRUIViews();return;}
  if(action==='ui-open-setting'){xrUiView='setting';updateXRUIViews();return;}
  if(action==='ui-back-main'){xrUiView='main';updateXRUIViews();return;}
  if(action==='ui-quit-game'){exitToMenu();toast('Đã thoát về menu', 'inf', 900);return;}
  if(action==='vol-slider') return;
  if(action==='mode-easy'){
    startXRMode('easy','EASY');
    return;
  }
  if(action==='mode-hard'){
    startXRMode('hard','HARD');
    return;
  }
  if(action==='mode-special'){
    startXRMode('special','SPECIAL');
    return;
  }
  if(action==='mode-archery'){
    startXRMode('archery','ARCHERY');
    return;
  }
  if(action&&action.indexOf('archery-select-')===0){
    const idx=Number(action.replace('archery-select-',''));
    const node=xrArchery.colorNodes[idx];
    if(node&&node.userData&&node.userData.archeryColor){
      setArcherySelectedColor(node.userData.archeryColor,node);
    }
    return;
  }
  if(action==='exit'){
    exitToMenu();
    toast('Đã thoát về menu', 'inf', 900);
  }
}


