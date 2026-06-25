# xr-ui-victory-defeat-enhanced.js

File này đã chỉnh sửa giao diện **Victory** và **Defeat** cho VR theo hướng rõ ràng, đẹp hơn và thân thiện hơn.

## Các thay đổi chính

### Victory
- Làm lại banner **VICTORY** lớn hơn, có khung hologram, crown và badge **HOÀN THÀNH XUẤT SẮC**.
- Tách thống kê thành 4 thẻ rõ ràng: **LEVEL**, **SCORE**, **TIME**, **COMBO**.
- Thêm icon cho từng thẻ: ngôi sao, cúp, đồng hồ, combo.
- Tăng kích thước nút **MENU** và **CHƠI LẠI**, thêm glow và hover scale rõ hơn.
- Thêm vòng sáng, bục hologram, orbs và sparkles để tạo cảm giác chiến thắng.

### Defeat
- Làm lại banner **TRY AGAIN** với khung cảnh báo mềm, không quá tiêu cực.
- Thêm dòng phụ: **BÌNH TĨNH • RÚT KINH NGHIỆM • THỬ LẠI**.
- Chuyển phần thống kê Defeat từ dạng text dọc sang 4 thẻ trực quan.
- Tăng độ nổi bật của nút **MENU** và **THỬ LẠI**.
- Thêm smoke, ring và shard nhẹ để tạo cảm giác thất bại nhưng vẫn thân thiện.

## Code đầy đủ

```js
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
const xrMouseSim={
  enabled:false,
  controller:null,
  bowController:null,
  archeryMouseDown:false,
  grabStartY:0,
  grabStartDepth:.38,
  handDepth:.38
};
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
const xrArcheryGuideLocal = new THREE.Vector3(-1.45,2.08,-3.35);
const xrArcheryAimGuideLocal = new THREE.Vector3(-1.7,1.82,-2.95);
const xrArcheryGuideWorld = new THREE.Vector3();
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
let xrMenuGuideRig = null;
let xrMenuLeftInfoRig = null;
let xrMenuRightInfoRig = null;
let xrMenuPortalRig = null;
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

  const vignette=ctx.createRadialGradient(w*.5,h*.42,80,w*.5,h*.45,w*.72);
  vignette.addColorStop(0,'rgba(122,238,255,.09)');
  vignette.addColorStop(.55,'rgba(16,28,42,.12)');
  vignette.addColorStop(1,'rgba(0,0,0,.38)');
  pathRoundedRect(ctx,18,16,w-36,h-32,32);
  ctx.fillStyle=vignette;
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

  const header=ctx.createLinearGradient(0,56,w,124);
  header.addColorStop(0,'rgba(83,218,255,.03)');
  header.addColorStop(.5,'rgba(255,255,255,.11)');
  header.addColorStop(1,'rgba(174,117,255,.04)');
  ctx.fillStyle=header;
  ctx.beginPath();
  ctx.moveTo(118,88);
  ctx.lineTo(w-118,88);
  ctx.lineTo(w-165,142);
  ctx.lineTo(165,142);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle='rgba(160,234,255,.18)';
  ctx.lineWidth=2;
  ctx.stroke();

  const bottom=ctx.createLinearGradient(0,h-118,w,h-78);
  bottom.addColorStop(0,'rgba(72,232,255,.04)');
  bottom.addColorStop(.5,'rgba(255,255,255,.08)');
  bottom.addColorStop(1,'rgba(126,92,255,.04)');
  ctx.fillStyle=bottom;
  ctx.beginPath();
  ctx.moveTo(150,h-96);
  ctx.lineTo(w-150,h-96);
  ctx.lineTo(w-204,h-58);
  ctx.lineTo(204,h-58);
  ctx.closePath();
  ctx.fill();

  const cornerStroke='rgba(151,238,255,.45)';
  ctx.strokeStyle=cornerStroke;
  ctx.lineWidth=6;
  [[70,68,1,1],[w-70,68,-1,1],[70,h-68,1,-1],[w-70,h-68,-1,-1]].forEach(([x,y,sx,sy])=>{
    ctx.beginPath();
    ctx.moveTo(x,y+sy*56);
    ctx.lineTo(x,y);
    ctx.lineTo(x+sx*70,y);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x+sx*18,y+sy*18,7,0,Math.PI*2);
    ctx.fillStyle='rgba(178,244,255,.7)';
    ctx.fill();
  });

  for(let x=135;x<w-135;x+=92){
    ctx.fillStyle='rgba(145,230,255,.1)';
    ctx.fillRect(x,70,34,2);
    ctx.fillRect(x,h-72,34,2);
  }

  for(let y=70;y<h-40;y+=44){
    ctx.strokeStyle='rgba(145,205,235,.025)';
    ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(42,y);ctx.lineTo(w-42,y);ctx.stroke();
  }

  ctx.font='800 25px Segoe UI,Arial,sans-serif';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillStyle='rgba(212,246,255,.62)';
  ctx.fillText('CHỌN CHẾ ĐỘ LUYỆN TẬP',w*.5,h-104);
  ctx.font='700 21px Segoe UI,Arial,sans-serif';
  ctx.fillStyle='rgba(219,248,255,.44)';
  ctx.fillText('Nhìn vào thẻ • Nhấn Trigger để bắt đầu',w*.5,h-70);

  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}


function makeXRMenuInfoPanelTexture(title,lines,accent='#65dcff',footer=''){
  const cnv=document.createElement('canvas');
  cnv.width=760;cnv.height=620;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  const ac=h2c(accent);
  const rgb=`${ac.r*255|0},${ac.g*255|0},${ac.b*255|0}`;
  ctx.clearRect(0,0,w,h);

  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,`rgba(${rgb},.18)`);
  bg.addColorStop(.45,'rgba(8,18,31,.86)');
  bg.addColorStop(1,'rgba(3,8,18,.92)');
  pathRoundedRect(ctx,18,16,w-36,h-32,34);
  ctx.fillStyle=bg;
  ctx.fill();

  const halo=ctx.createRadialGradient(w*.5,h*.18,20,w*.5,h*.38,w*.8);
  halo.addColorStop(0,`rgba(${rgb},.26)`);
  halo.addColorStop(.55,'rgba(255,255,255,.025)');
  halo.addColorStop(1,'rgba(0,0,0,.22)');
  pathRoundedRect(ctx,18,16,w-36,h-32,34);
  ctx.fillStyle=halo;
  ctx.fill();

  const edge=ctx.createLinearGradient(0,0,w,0);
  edge.addColorStop(0,`rgba(${rgb},.9)`);
  edge.addColorStop(.5,'rgba(246,252,255,.55)');
  edge.addColorStop(1,`rgba(${rgb},.8)`);
  pathRoundedRect(ctx,18,16,w-36,h-32,34);
  ctx.strokeStyle=edge;
  ctx.lineWidth=5;
  ctx.stroke();

  ctx.strokeStyle=`rgba(${rgb},.2)`;
  ctx.lineWidth=2;
  pathRoundedRect(ctx,38,38,w-76,h-76,24);
  ctx.stroke();

  ctx.textAlign='left';
  ctx.textBaseline='middle';
  ctx.fillStyle='#f5fdff';
  ctx.shadowColor=accent;
  ctx.shadowBlur=18;
  ctx.font='900 48px Segoe UI,Arial,sans-serif';
  ctx.fillText(title,62,86);
  ctx.shadowBlur=0;

  ctx.strokeStyle=`rgba(${rgb},.38)`;
  ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(60,132);ctx.lineTo(w-60,132);ctx.stroke();

  ctx.font='700 32px Segoe UI,Arial,sans-serif';
  ctx.fillStyle='rgba(234,248,255,.92)';
  lines.forEach((line,index)=>{
    const y=188+index*68;
    ctx.fillStyle=`rgba(${rgb},.78)`;
    ctx.beginPath();ctx.arc(74,y,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(234,248,255,.92)';
    ctx.fillText(line,102,y+1);
  });

  if(footer){
    ctx.textAlign='center';
    ctx.font='800 25px Segoe UI,Arial,sans-serif';
    ctx.fillStyle=`rgba(${rgb},.75)`;
    ctx.fillText(footer,w*.5,h-66);
  }

  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function createXRMenuInfoPanel(title,lines,x,y,accent,footer,side=1){
  const tex=makeXRMenuInfoPanelTexture(title,lines,accent,footer);
  const rig=new THREE.Group();
  const panel=new THREE.Mesh(
    createCurvedPanelGeometry(.78,.62,.045,28),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.88,depthWrite:false,toneMapped:false,side:THREE.DoubleSide})
  );
  panel.position.z=.02;
  rig.add(panel);

  const glow=new THREE.Mesh(
    createCurvedPanelGeometry(.84,.68,.05,28),
    new THREE.MeshBasicMaterial({color:new THREE.Color(accent),transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})
  );
  glow.position.z=-.02;
  rig.add(glow);

  rig.position.set(x,y,.12);
  rig.rotation.y=-side*.16;
  rig.userData.baseY=y;
  rig.userData.phase=Math.abs(x)*1.7;
  rig.userData.glow=glow;
  xrMenuPanel.add(rig);
  xrMenuAmbientNodes.push(rig);
  return rig;
}

function makeXRGuidePillTexture(text){
  const cnv=document.createElement('canvas');
  cnv.width=1300;cnv.height=180;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  ctx.clearRect(0,0,w,h);
  const bg=ctx.createLinearGradient(0,0,w,0);
  bg.addColorStop(0,'rgba(88,235,255,.18)');
  bg.addColorStop(.5,'rgba(12,22,38,.9)');
  bg.addColorStop(1,'rgba(255,214,123,.16)');
  pathRoundedRect(ctx,20,22,w-40,h-44,44);
  ctx.fillStyle=bg;
  ctx.fill();
  ctx.strokeStyle='rgba(190,245,255,.42)';
  ctx.lineWidth=4;
  pathRoundedRect(ctx,20,22,w-40,h-44,44);
  ctx.stroke();
  ctx.fillStyle='rgba(241,252,255,.96)';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.font='800 48px Segoe UI,Arial,sans-serif';
  ctx.shadowColor='rgba(100,235,255,.45)';
  ctx.shadowBlur=18;
  ctx.fillText(text,w*.5,h*.5+3);
  ctx.shadowBlur=0;
  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

function createXRMenuGuidePill(text,y){
  const tex=makeXRGuidePillTexture(text);
  const rig=new THREE.Group();
  const panel=new THREE.Mesh(
    new THREE.PlaneGeometry(1.55,.2),
    new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:.92,depthWrite:false,toneMapped:false})
  );
  rig.add(panel);
  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(1.72,.25),
    new THREE.MeshBasicMaterial({color:0x82eaff,transparent:true,opacity:.08,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  glow.position.z=-.018;
  rig.add(glow);
  rig.position.set(0,y,.12);
  rig.userData.baseY=y;
  rig.userData.phase=.35;
  rig.userData.glow=glow;
  xrMenuPanel.add(rig);
  xrMenuAmbientNodes.push(rig);
  return rig;
}

function createXRMenuColorPortal(){
  const rig=new THREE.Group();
  const colors=[0x65dcff,0xffd487,0xbd70ff,0x62e98e,0xff6b8f];
  colors.forEach((color,index)=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(.56+index*.12,.012+index*.002,10,120),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:.14-index*.012,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    ring.position.set(0,0,-.035-index*.018);
    ring.userData.baseOpacity=.14-index*.012;
    ring.userData.phase=index*.75;
    ring.userData.portalRing=true;
    rig.add(ring);
  });
  const core=new THREE.Mesh(
    new THREE.CircleGeometry(.48,80),
    new THREE.MeshBasicMaterial({color:0x152a44,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})
  );
  core.position.z=-.12;
  rig.add(core);
  rig.position.set(0,1.45,-.26);
  rig.userData.phase=1.1;
  xrMenuPanel.add(rig);
  xrMenuPortalRig=rig;
  return rig;
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
  cnv.width=620;cnv.height=1040;
  const ctx=cnv.getContext('2d');
  const w=cnv.width,h=cnv.height;
  const ac=h2c(accent);
  const rgb=`${ac.r*255|0},${ac.g*255|0},${ac.b*255|0}`;
  const modeMeta={
    easy:{tag:'LÀM QUEN',hint:['Mục tiêu lớn','Tốc độ chậm','Dễ quan sát']},
    hard:{tag:'THỬ THÁCH',hint:['Tốc độ cao','Yêu cầu phản xạ','Tính điểm combo']},
    special:{tag:'TƯ DUY MÀU',hint:['Luật chơi đổi mới','Có câu đố','Ghi nhớ màu']},
    archery:{tag:'BẮN CUNG',hint:['Ngắm bằng tay VR','Kéo dây cung','Bắn đúng màu']}
  }[mode]||{tag:'VR MODE',hint:[]};

  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,`rgba(${rgb},.28)`);
  bg.addColorStop(.34,'rgba(13,26,42,.96)');
  bg.addColorStop(1,`rgba(${rgb},.16)`);
  pathRoundedRect(ctx,18,16,w-36,h-32,38);
  ctx.fillStyle=bg;ctx.fill();

  const innerGlow=ctx.createRadialGradient(w*.5,h*.43,26,w*.5,h*.44,w*.68);
  innerGlow.addColorStop(0,`rgba(${rgb},.30)`);
  innerGlow.addColorStop(.38,`rgba(${rgb},.07)`);
  innerGlow.addColorStop(1,'rgba(0,0,0,.30)');
  pathRoundedRect(ctx,18,16,w-36,h-32,38);
  ctx.fillStyle=innerGlow;
  ctx.fill();

  const edge=ctx.createLinearGradient(0,0,w,h);
  edge.addColorStop(0,`rgba(${rgb},1)`);
  edge.addColorStop(.5,'rgba(245,253,255,.76)');
  edge.addColorStop(1,`rgba(${rgb},.82)`);
  pathRoundedRect(ctx,18,16,w-36,h-32,38);
  ctx.strokeStyle=edge;ctx.lineWidth=10;ctx.stroke();
  pathRoundedRect(ctx,40,38,w-80,h-76,27);
  ctx.strokeStyle=`rgba(${rgb},.34)`;ctx.lineWidth=3;ctx.stroke();

  ctx.strokeStyle=`rgba(${rgb},.16)`;
  ctx.lineWidth=2;
  for(let y=230;y<720;y+=52){
    ctx.beginPath();
    ctx.moveTo(76,y);
    ctx.lineTo(w-76,y+Math.sin(y*.05)*4);
    ctx.stroke();
  }

  ctx.fillStyle=`rgba(${rgb},.24)`;
  ctx.fillRect(78,226,w-156,3);
  ctx.fillRect(102,722,w-204,3);
  ctx.fillStyle='rgba(235,250,255,.24)';
  [88,w-88].forEach(x=>{
    ctx.beginPath();ctx.arc(x,100,9,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x,h-100,7,0,Math.PI*2);ctx.fill();
  });

  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=`rgba(${rgb},.78)`;
  ctx.font='900 24px Segoe UI,Arial,sans-serif';
  ctx.fillText(modeMeta.tag,w*.5,92);

  ctx.fillStyle='#f8fdff';ctx.shadowColor=accent;ctx.shadowBlur=24;
  ctx.font='900 76px Segoe UI,Arial,sans-serif';
  ctx.fillText(title,w*.5,158);
  ctx.shadowBlur=0;

  ctx.shadowColor=accent;
  ctx.shadowBlur=24;
  drawXRHubModeIcon(ctx,mode,w*.5,455,132,accent);
  ctx.shadowBlur=0;

  ctx.fillStyle='rgba(235,247,255,.94)';
  ctx.font='800 36px Segoe UI,Arial,sans-serif';
  descLines.slice(0,2).forEach((line,index)=>ctx.fillText(line,w*.5,760+index*44));

  ctx.textAlign='left';
  ctx.font='700 25px Segoe UI,Arial,sans-serif';
  modeMeta.hint.slice(0,3).forEach((line,index)=>{
    const y=868+index*35;
    ctx.fillStyle=`rgba(${rgb},.76)`;
    ctx.beginPath();ctx.arc(112,y,6,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(238,249,255,.82)';
    ctx.fillText(line,132,y+1);
  });

  ctx.textAlign='center';
  ctx.fillStyle=`rgba(${rgb},.72)`;
  ctx.font='900 26px Segoe UI,Arial,sans-serif';
  ctx.fillText('NHẤN TRIGGER',w*.5,h-78);

  const tex=new THREE.CanvasTexture(cnv);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  tex.needsUpdate=true;
  return tex;
}

const XR_HUB_WIDTH=2.72;
const XR_HUB_HEIGHT=1.56;
const XR_HUB_CURVE=.18;
const XR_HUB_CENTER_Y=1.4;

function getXRHubCurveZ(x){
  const nx=x/(XR_HUB_WIDTH*.5);
  return -.025+XR_HUB_CURVE*nx*nx*.92+.025;
}

function createXRMenuHubCard(mode,title,descLines,accent,x,index){
  const texture=makeXRHubCardTexture(mode,title,descLines,accent);
  const backPlate=new THREE.Mesh(
    createCurvedPanelGeometry(.63,1.18,.028,18),
    new THREE.MeshBasicMaterial({
      color:0x06111d,
      transparent:true,
      opacity:.54,
      depthWrite:false,
      side:THREE.DoubleSide
    })
  );
  backPlate.position.set(x,1.46,getXRHubCurveZ(x)+.018);
  backPlate.rotation.y=-x*.19;
  xrMenuPanel.add(backPlate);

  const card=new THREE.Mesh(
    createCurvedPanelGeometry(.58,1.13,.026,18),
    new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:.94,depthWrite:false,toneMapped:false})
  );
  card.position.set(x,1.46,getXRHubCurveZ(x)+.04);
  card.rotation.y=-x*.19;

  const glow=new THREE.Mesh(
    createCurvedPanelGeometry(.66,1.22,.03,18),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(accent),transparent:true,opacity:.08,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  glow.position.z=-.018;
  card.add(glow);

  const selectedBar=new THREE.Mesh(
    new THREE.PlaneGeometry(.38,.02),
    new THREE.MeshBasicMaterial({color:new THREE.Color(accent),transparent:true,opacity:.76,depthWrite:false})
  );
  selectedBar.position.set(0,-.575,.018);
  card.add(selectedBar);

  const railMat=new THREE.MeshBasicMaterial({
    color:new THREE.Color(accent),
    transparent:true,
    opacity:.38,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  });
  const sideRails=[];
  [-1,1].forEach(side=>{
    const rail=new THREE.Mesh(new THREE.PlaneGeometry(.014,.92),railMat.clone());
    rail.position.set(side*.312,-.005,.022);
    card.add(rail);
    sideRails.push(rail);
  });

  const topNode=new THREE.Mesh(
    new THREE.SphereGeometry(.025,12,8),
    new THREE.MeshBasicMaterial({
      color:new THREE.Color(accent),transparent:true,opacity:.8,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  topNode.position.set(0,.535,.026);
  card.add(topNode);

  const statusTex=makeXRSharpTextTexture('NHẤN TRIGGER',{
    font:'800 44px Segoe UI,Arial,sans-serif',color:'#f4fbff',glow:'rgba(255,255,255,.35)'
  });
  const status=new THREE.Mesh(
    new THREE.PlaneGeometry(.46,.055),
    new THREE.MeshBasicMaterial({map:statusTex,transparent:true,opacity:.9,depthWrite:false,toneMapped:false})
  );
  status.position.set(0,-.635,.02);
  status.visible=false;
  card.add(status);

  card.userData.xrUiAction='mode-'+mode;
  card.userData.xrUiHover=false;
  card.userData.xrUiBaseOpacity=.94;
  card.userData.xrUiBaseScale=1;
  card.userData.xrUiHoverScale=1.075;
  card.userData.xrUiBaseZ=card.position.z;
  card.userData.xrUiHoverZBoost=.075;
  card.userData.modeColor=new THREE.Color(accent).getHex();
  card.userData.backPlate=backPlate;
  card.userData.modeGlow=glow;
  card.userData.selectedBar=selectedBar;
  card.userData.sideRails=sideRails;
  card.userData.topNode=topNode;
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

  const frameMat=new THREE.MeshStandardMaterial({
    color:0x9cb6c7,
    metalness:.88,
    roughness:.16,
    emissive:0x173a4e,
    emissiveIntensity:.42
  });
  const railMat=new THREE.MeshBasicMaterial({
    color:0x8ff4ff,
    transparent:true,
    opacity:.2,
    blending:THREE.AdditiveBlending,
    depthWrite:false
  });
  [
    {x:0,y:XR_HUB_CENTER_Y+XR_HUB_HEIGHT*.5+.035,w:2.28,h:.026},
    {x:0,y:XR_HUB_CENTER_Y-XR_HUB_HEIGHT*.5-.035,w:2.15,h:.022},
    {x:-XR_HUB_WIDTH*.5-.055,y:XR_HUB_CENTER_Y,w:.026,h:1.22},
    {x:XR_HUB_WIDTH*.5+.055,y:XR_HUB_CENTER_Y,w:.026,h:1.22}
  ].forEach((bar,index)=>{
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(bar.w,bar.h,.035),frameMat);
    mesh.position.set(bar.x,bar.y,-.005);
    mesh.userData.baseOpacity=.2;
    xrMenuPanel.add(mesh);
    if(index<2){
      const light=new THREE.Mesh(new THREE.PlaneGeometry(bar.w*.86,.012),railMat.clone());
      light.position.set(bar.x,bar.y,.022);
      light.userData.baseOpacity=.18;
      light.userData.phase=index*.9;
      xrMenuPanel.add(light);
      xrMenuAmbientNodes.push(light);
    }
  });

  [[-1,1],[-1,-1],[1,1],[1,-1]].forEach(([sx,sy],index)=>{
    const node=new THREE.Mesh(
      new THREE.OctahedronGeometry(.055,1),
      new THREE.MeshStandardMaterial({
        color:0xe8fdff,
        metalness:.45,
        roughness:.08,
        emissive:0x62eaff,
        emissiveIntensity:.85,
        transparent:true,
        opacity:.92
      })
    );
    node.position.set(sx*(XR_HUB_WIDTH*.5+.06),XR_HUB_CENTER_Y+sy*(XR_HUB_HEIGHT*.5+.04),.03);
    node.userData.baseOpacity=1;
    node.userData.phase=index*.72;
    node.userData.baseScale=new THREE.Vector3(1,1,1);
    xrMenuPanel.add(node);
    xrMenuAmbientNodes.push(node);
  });

  const panelGlow=new THREE.Mesh(
    createCurvedPanelGeometry(2.68,1.6,XR_HUB_CURVE+.018,56),
    new THREE.MeshBasicMaterial({
      color:0x82eaff,transparent:true,opacity:.055,
      blending:THREE.AdditiveBlending,depthWrite:false
    })
  );
  panelGlow.position.set(0,XR_HUB_CENTER_Y,-.06);
  xrMenuPanel.add(panelGlow);

  const rearAura=new THREE.Mesh(
    createCurvedPanelGeometry(2.96,1.82,XR_HUB_CURVE+.04,56),
    new THREE.MeshBasicMaterial({
      color:0x4d8dff,
      transparent:true,
      opacity:.035,
      blending:THREE.AdditiveBlending,
      depthWrite:false,
      side:THREE.DoubleSide
    })
  );
  rearAura.position.set(0,XR_HUB_CENTER_Y,-.13);
  xrMenuPanel.add(rearAura);

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

  [.24,.42,.62,.82,1.04].forEach((radius,index)=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(radius,.013+index*.003,10,96),
      new THREE.MeshBasicMaterial({
        color:index%2?0xa3f7ff:0x58e8ff,
        transparent:true,
        opacity:.58-index*.055,
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

  [-.78,0,.78].forEach((x,index)=>{
    const beam=new THREE.Mesh(
      new THREE.PlaneGeometry(.018,1.42),
      new THREE.MeshBasicMaterial({
        color:index===1?0xd9fbff:0x65eaff,
        transparent:true,
        opacity:.07,
        blending:THREE.AdditiveBlending,
        depthWrite:false,
        side:THREE.DoubleSide
      })
    );
    beam.position.set(x,1.43,.06);
    beam.userData.baseOpacity=.055;
    beam.userData.phase=index*.8;
    xrMenuPanel.add(beam);
    xrMenuAmbientNodes.push(beam);
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

  createXRMenuColorPortal();

  createXRMenuTitleBlock('COLOR CIRCLE VR',2.21,{
    w:1.65,h:.29,d:.09,
    body:0x12212d,
    emissive:0x0c3446,
    frameGlow:0xb8f0ff,
    font:'900 108px Arial Black,Segoe UI,sans-serif',
    textColor:'#f3fdff',
    textGradient:['#71eaff','#ffffff','#ffd487'],
    textGlow:'rgba(120,235,255,.5)'
  });

  xrMenuGuideRig=createXRMenuGuidePill('Nhìn vào thẻ và nhấn Trigger để bắt đầu',.55);
  xrMenuLeftInfoRig=createXRMenuInfoPanel(
    'CÁCH CHƠI',
    ['Chọn chế độ bằng tia VR','Ghép đúng màu vào vòng','Tạo combo để tăng điểm'],
    -1.62,1.35,'#65dcff','Gợi ý: đứng yên khi chọn',-1
  );
  xrMenuRightInfoRig=createXRMenuInfoPanel(
    'TRẢI NGHIỆM VR',
    ['Thẻ sáng khi trỏ vào','Có phản hồi hover rõ ràng','Menu cong dễ nhìn trong kính'],
    1.62,1.35,'#ffd487','Ưu tiên đọc rõ, ít gây chóng mặt',1
  );

  createXRMenuHubCard('easy','DỄ',['TRẢI NGHIỆM','THƯ GIÃN'],'#65dcff',-.93,1);
  createXRMenuHubCard('hard','KHÓ',['THỬ THÁCH','TỐC ĐỘ'],'#ff9a3d',-.31,2);
  createXRMenuHubCard('special','ĐẶC BIỆT',['QUY TẮC & CÂU ĐỐ','ĐỘC ĐÁO'],'#bd70ff',.31,3);
  createXRMenuHubCard('archery','BẮN CUNG',['ĐỘ CHÍNH XÁC','TUYỆT ĐỐI'],'#62e98e',.93,4);

  const particleCount=72;
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
      color:0xc9f7ff,size:.014,transparent:true,opacity:.58,
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
    if(card.userData.backPlate&&card.userData.backPlate.material){
      card.userData.backPlate.material.opacity=selected?.66:.46;
      card.userData.backPlate.position.z=card.position.z-.022;
      card.userData.backPlate.scale.setScalar(card.scale.x*(hovered?1.02:1));
    }
    card.userData.modeGlow.material.opacity=hovered
      ? .42
      : (selected?.22:.08)+Math.sin(t*2+index)*.022;
    card.userData.selectedBar.material.opacity=hovered?.95:(selected?.72:.3);
    card.userData.selectedBar.scale.x=hovered?1.14:(selected?1:0.72);
    if(card.userData.sideRails){
      card.userData.sideRails.forEach((rail,railIndex)=>{
        rail.material.opacity=(hovered?.7:(selected?.48:.26))+Math.sin(t*2.4+railIndex+index)*.04;
      });
    }
    if(card.userData.topNode){
      const nodePulse=1+(hovered?.16:(selected?.08:.035))*Math.sin(t*3.2+index);
      card.userData.topNode.scale.setScalar(nodePulse);
      card.userData.topNode.material.opacity=hovered?1:(selected?.78:.55);
    }
    card.userData.status.visible=hovered;
  });

  xrMenuAmbientNodes.forEach((node,index)=>{
    const pulse=.5+.5*Math.sin(t*(1.8+index*.2)+(node.userData.phase||0));
    if(node.material&&typeof node.material.opacity==='number'){
      node.material.opacity=(node.userData.baseOpacity||.24)+pulse*.14;
    }
    if(node.userData&&typeof node.userData.baseY==='number'){
      node.position.y=node.userData.baseY+Math.sin(t*1.05+(node.userData.phase||0))*.012;
      if(node.userData.glow&&node.userData.glow.material){
        node.userData.glow.material.opacity=.07+pulse*.065;
      }
    }
    const scale=1+pulse*(.018+Math.min(index,.8)*.008);
    const baseScale=node.userData.baseScale||new THREE.Vector3(1,1,1);
    node.scale.set(baseScale.x*scale,baseScale.y*scale,baseScale.z*scale);
    if(node.rotation&&!(node.userData&&typeof node.userData.baseY==='number')){
      node.rotation.z+=.0015*(index%2?1:-1);
    }
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
    xrMenuTitleRig.position.y=2.21+Math.sin(t*1.2)*.008;
    xrMenuTitleRig.rotation.z=Math.sin(t*.62)*.0025;
  }
  if(xrMenuGuideRig){
    const guidePulse=.5+.5*Math.sin(t*2.2);
    xrMenuGuideRig.position.y=(xrMenuGuideRig.userData.baseY||.55)+Math.sin(t*1.35)*.008;
    xrMenuGuideRig.scale.setScalar(1+guidePulse*.012);
    if(xrMenuGuideRig.userData.glow&&xrMenuGuideRig.userData.glow.material){
      xrMenuGuideRig.userData.glow.material.opacity=.08+guidePulse*.06;
    }
  }
  if(xrMenuPortalRig){
    xrMenuPortalRig.rotation.z+=.0025;
    xrMenuPortalRig.children.forEach((child,index)=>{
      if(child.userData&&child.userData.portalRing){
        child.rotation.z+=(index%2?.003:-.002);
        child.material.opacity=(child.userData.baseOpacity||.1)+Math.sin(t*(1.1+index*.12)+child.userData.phase)*.035;
      }
    });
  }
}

function formatClockTime(totalSec){
  const s=Math.max(0,Math.floor(totalSec||0));
  const m=Math.floor(s/60);
  return m+':'+String(s%60).padStart(2,'0');
}


function drawXRResultCard(ctx,x,y,w,h,item,opt={}){
  const accent=item.c||'#7eeaff';
  const dark=opt.dark||'rgba(6,18,34,.92)';
  const warm=opt.warm||false;
  const bg=ctx.createLinearGradient(x,y,x,y+h);
  bg.addColorStop(0,opt.bgTop||'rgba(25,52,88,.94)');
  bg.addColorStop(1,opt.bgBot||dark);
  pathRoundedRect(ctx,x,y,w,h,34);
  ctx.fillStyle=bg;
  ctx.fill();

  const glow=ctx.createRadialGradient(x+w*.5,y+h*.34,10,x+w*.5,y+h*.48,w*.72);
  glow.addColorStop(0,accent.replace(')',',.24)').replace('rgb','rgba'));
  glow.addColorStop(1,'rgba(0,0,0,0)');
  pathRoundedRect(ctx,x,y,w,h,34);
  ctx.fillStyle=glow;
  ctx.fill();

  ctx.lineWidth=7;
  const edge=ctx.createLinearGradient(x,y,x+w,y+h);
  edge.addColorStop(0,accent);
  edge.addColorStop(.52,'rgba(238,252,255,.88)');
  edge.addColorStop(1,accent);
  ctx.strokeStyle=edge;
  pathRoundedRect(ctx,x+4,y+4,w-8,h-8,30);
  ctx.stroke();

  ctx.lineWidth=2;
  ctx.strokeStyle=warm?'rgba(255,217,132,.35)':'rgba(172,238,255,.28)';
  pathRoundedRect(ctx,x+23,y+21,w-46,h-42,22);
  ctx.stroke();

  ctx.save();
  ctx.translate(x+w*.5,y+82);
  ctx.strokeStyle=accent;
  ctx.fillStyle=accent;
  ctx.lineWidth=8;
  ctx.shadowColor=accent;
  ctx.shadowBlur=22;
  if(item.icon==='star'){
    ctx.beginPath();
    for(let i=0;i<10;i++){
      const a=-Math.PI/2+i*Math.PI/5;
      const r=i%2?22:42;
      const px=Math.cos(a)*r,py=Math.sin(a)*r;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fill();
  }else if(item.icon==='cup'){
    pathRoundedRect(ctx,-32,-24,64,50,12);ctx.stroke();
    ctx.beginPath();ctx.arc(-40,-6,18,Math.PI*.5,Math.PI*1.5);ctx.stroke();
    ctx.beginPath();ctx.arc(40,-6,18,-Math.PI*.5,Math.PI*.5);ctx.stroke();
    ctx.fillRect(-9,26,18,24);ctx.fillRect(-34,48,68,10);
  }else if(item.icon==='time'){
    ctx.beginPath();ctx.arc(0,0,40,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-24);ctx.moveTo(0,0);ctx.lineTo(22,14);ctx.stroke();
    ctx.fillRect(-12,-55,24,10);
  }else if(item.icon==='combo'){
    ctx.beginPath();
    ctx.moveTo(0,-42);ctx.bezierCurveTo(33,-16,12,1,32,35);ctx.bezierCurveTo(7,50,-36,31,-18,-4);ctx.bezierCurveTo(-7,-20,-5,-27,0,-42);
    ctx.fill();
  }else if(item.icon==='warn'){
    ctx.beginPath();ctx.moveTo(0,-44);ctx.lineTo(48,38);ctx.lineTo(-48,38);ctx.closePath();ctx.stroke();
    ctx.fillRect(-5,-8,10,28);ctx.beginPath();ctx.arc(0,29,6,0,Math.PI*2);ctx.fill();
  }else{
    ctx.beginPath();ctx.arc(0,0,42,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();

  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.shadowBlur=0;
  ctx.fillStyle='rgba(232,246,255,.92)';
  ctx.font='800 36px Segoe UI,Arial,sans-serif';
  ctx.fillText(item.k,x+w*.5,y+h*.58);
  ctx.fillStyle=item.c;
  ctx.font='900 72px Segoe UI,Arial,sans-serif';
  ctx.shadowColor=item.c;
  ctx.shadowBlur=16;
  ctx.fillText(item.v,x+w*.5,y+h*.78);
  ctx.shadowBlur=0;
}

function drawXRTitleFrame(ctx,w,h,mode='victory'){
  const isVictory=mode==='victory';
  const main=isVictory?'#75f2ff':'#ff7fa9';
  const gold=isVictory?'#ffd777':'#ffb069';
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,isVictory?'rgba(8,44,70,.86)':'rgba(72,12,32,.88)');
  bg.addColorStop(1,isVictory?'rgba(5,14,30,.92)':'rgba(24,6,18,.94)');
  pathRoundedRect(ctx,58,46,w-116,h-86,48);
  ctx.fillStyle=bg;
  ctx.fill();

  ctx.lineWidth=8;
  const edge=ctx.createLinearGradient(70,0,w-70,0);
  edge.addColorStop(0,main);edge.addColorStop(.5,'rgba(255,255,255,.95)');edge.addColorStop(1,main);
  ctx.strokeStyle=edge;
  pathRoundedRect(ctx,58,46,w-116,h-86,48);
  ctx.stroke();

  ctx.lineWidth=2;
  ctx.strokeStyle=isVictory?'rgba(255,220,130,.45)':'rgba(255,170,205,.4)';
  pathRoundedRect(ctx,86,70,w-172,h-134,34);
  ctx.stroke();

  // decorative corner brackets
  ctx.strokeStyle=main;
  ctx.lineWidth=6;
  [[92,78,1,1],[w-92,78,-1,1],[92,h-78,1,-1],[w-92,h-78,-1,-1]].forEach(([x,y,sx,sy])=>{
    ctx.beginPath();ctx.moveTo(x,y+sy*42);ctx.lineTo(x,y);ctx.lineTo(x+sx*72,y);ctx.stroke();
  });

  if(isVictory){
    // crown
    ctx.save();ctx.translate(w*.5,40);
    ctx.fillStyle=gold;ctx.strokeStyle='rgba(255,245,210,.95)';ctx.lineWidth=4;ctx.shadowColor=gold;ctx.shadowBlur=18;
    ctx.beginPath();ctx.moveTo(-70,40);ctx.lineTo(-48,-18);ctx.lineTo(-18,30);ctx.lineTo(0,-34);ctx.lineTo(18,30);ctx.lineTo(48,-18);ctx.lineTo(70,40);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.fillRect(-70,42,140,14);
    [-48,0,48].forEach(x=>{ctx.beginPath();ctx.arc(x,-18,8,0,Math.PI*2);ctx.fill();});
    ctx.restore();
  }else{
    // warning diamond
    ctx.save();ctx.translate(w*.5,52);ctx.rotate(Math.PI/4);
    ctx.strokeStyle=gold;ctx.lineWidth=7;ctx.shadowColor=gold;ctx.shadowBlur=18;
    ctx.strokeRect(-38,-38,76,76);ctx.restore();
  }
}


function createXRVictoryButton(label,x,y,action,bg='#13344b'){
  const tex=makeXRButtonTexture(label,bg,'#f5feff');
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.72,.23),mat);
  mesh.position.set(x,y,.12);
  mesh.renderOrder=10020;

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(.84,.31),
    new THREE.MeshBasicMaterial({color:0x86f6ff,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  glow.position.z=-.012;
  glow.renderOrder=10019;
  mesh.add(glow);

  const underGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(.78,.055),
    new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  underGlow.position.set(0,-.13,-.014);
  mesh.add(underGlow);

  mesh.userData.xrUiAction=action;
  mesh.userData.xrUiTex=tex;
  mesh.userData.xrUiHover=false;
  mesh.userData.xrUiBaseOpacity=1;
  mesh.userData.xrUiBaseScale=1.02;
  mesh.userData.xrUiHoverScale=1.13;
  mesh.userData.xrUiGlow=glow;
  xrVictoryButtonsRig.add(mesh);
  xrVictoryButtons.push(mesh);
  xrInteractiveButtons.push(mesh);
  return mesh;
}

function createXRDefeatButton(label,x,y,action,bg='#40222b'){
  const tex=makeXRButtonTexture(label,bg,'#fff4f7');
  const mat=new THREE.MeshBasicMaterial({map:tex,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.72,.23),mat);
  mesh.position.set(x,y,.12);
  mesh.renderOrder=10020;

  const glow=new THREE.Mesh(
    new THREE.PlaneGeometry(.84,.31),
    new THREE.MeshBasicMaterial({color:0xff8fb4,transparent:true,opacity:.28,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  glow.position.z=-.012;
  glow.renderOrder=10019;
  mesh.add(glow);

  const underGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(.78,.055),
    new THREE.MeshBasicMaterial({color:0xffd4e2,transparent:true,opacity:.16,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  underGlow.position.set(0,-.13,-.014);
  mesh.add(underGlow);

  mesh.userData.xrUiAction=action;
  mesh.userData.xrUiTex=tex;
  mesh.userData.xrUiHover=false;
  mesh.userData.xrUiBaseOpacity=1;
  mesh.userData.xrUiBaseScale=1.02;
  mesh.userData.xrUiHoverScale=1.13;
  mesh.userData.xrUiGlow=glow;
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
  drawXRTitleFrame(tctx,tw,th,'victory');

  const tg=tctx.createLinearGradient(0,0,tw,0);
  tg.addColorStop(0,'rgba(94,238,255,.98)');
  tg.addColorStop(.45,'rgba(255,255,255,1)');
  tg.addColorStop(.78,'rgba(255,218,122,.98)');
  tg.addColorStop(1,'rgba(113,235,255,.98)');
  tctx.textAlign='center';
  tctx.textBaseline='middle';
  tctx.font='900 172px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(82,240,255,.95)';
  tctx.shadowBlur=34;
  tctx.fillStyle=tg;
  tctx.fillText('VICTORY',tw*.5,th*.48+14);
  tctx.shadowBlur=0;

  const badgeX=tw*.5-220,badgeY=th*.75,badgeW=440,badgeH=62;
  const badgeGrad=tctx.createLinearGradient(badgeX,badgeY,badgeX+badgeW,badgeY);
  badgeGrad.addColorStop(0,'rgba(50,26,12,.72)');
  badgeGrad.addColorStop(.5,'rgba(96,55,18,.92)');
  badgeGrad.addColorStop(1,'rgba(50,26,12,.72)');
  pathRoundedRect(tctx,badgeX,badgeY,badgeW,badgeH,20);
  tctx.fillStyle=badgeGrad;tctx.fill();
  tctx.strokeStyle='rgba(255,218,122,.9)';tctx.lineWidth=4;pathRoundedRect(tctx,badgeX,badgeY,badgeW,badgeH,20);tctx.stroke();
  tctx.fillStyle='#fff1b8';
  tctx.font='900 38px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(255,214,120,.7)';tctx.shadowBlur=14;
  tctx.fillText('HOÀN THÀNH XUẤT SẮC',tw*.5,badgeY+badgeH*.55);
  tctx.shadowBlur=0;
  xrVictoryTitleTexture.needsUpdate=true;

  const statItems=[
    {k:'LEVEL',v:xrVictoryData.level,c:'#8ee8ff',icon:'star'},
    {k:'SCORE',v:xrVictoryData.score,c:'#a688ff',icon:'cup'},
    {k:'TIME',v:xrVictoryData.time,c:'#6df4ff',icon:'time'},
    {k:'COMBO',v:xrVictoryData.maxCombo,c:'#ffcf72',icon:'combo'}
  ];
  statItems.forEach((item,i)=>{
    const canvas=xrVictoryStatCanvases[i];
    const texture=xrVictoryStatTextures[i];
    if(!canvas||!texture) return;
    const sctx=canvas.getContext('2d');
    const sw=canvas.width;
    const sh=canvas.height;
    sctx.clearRect(0,0,sw,sh);
    drawXRResultCard(sctx,20,14,sw-40,sh-28,item,{bgTop:'rgba(22,54,92,.95)',bgBot:'rgba(5,16,34,.96)'});
    texture.needsUpdate=true;
  });
}

function ensureXRVictoryArena(){
  if(xrVictoryTitleMesh) return;

  const floor=new THREE.Mesh(
    new THREE.CircleGeometry(2.08,120),
    new THREE.MeshBasicMaterial({color:0x07142a,transparent:true,opacity:.72,depthWrite:false})
  );
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.93;
  xrVictoryArena.add(floor);

  const floorGlow=new THREE.Mesh(
    new THREE.CircleGeometry(2.32,120),
    new THREE.MeshBasicMaterial({color:0x49dfff,transparent:true,opacity:.15,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  floorGlow.rotation.x=-Math.PI/2;
  floorGlow.position.y=-.925;
  xrVictoryArena.add(floorGlow);

  [.78,1.12,1.48,1.84].forEach((radius,index)=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(radius,.025+index*.006,10,128),
      new THREE.MeshBasicMaterial({color:index%2?0xa58bff:0x7aefff,transparent:true,opacity:.34-index*.035,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    ring.rotation.x=Math.PI/2;
    ring.position.y=-.78+index*.035;
    ring.userData.vt='ring';
    ring.userData.vSpeed=(index%2?-.66:.54)+index*.08;
    ring.userData.baseOpacity=.34-index*.035;
    xrVictoryArena.add(ring);
    xrVictoryAnimatedNodes.push(ring);
  });

  for(let i=0;i<28;i++){
    const col=i%4===0?0x8eefff:(i%4===1?0xa992ff:(i%4===2?0xffd978:0x68b7ff));
    const orb=new THREE.Mesh(
      new THREE.SphereGeometry(.022+(i%4)*.003,12,10),
      new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.72,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    orb.userData.vt='orb';
    orb.userData.orbitRadius=.68+Math.random()*1.02;
    orb.userData.orbitSpeed=.34+Math.random()*.58;
    orb.userData.orbitPhase=Math.random()*Math.PI*2;
    orb.userData.orbitYOffset=-.04+Math.random()*1.05;
    orb.userData.baseOpacity=.48+Math.random()*.3;
    xrVictoryArena.add(orb);
    xrVictoryAnimatedNodes.push(orb);
  }

  const sparkGeo=new THREE.BufferGeometry();
  const sparkN=140;
  const sparkPos=new Float32Array(sparkN*3);
  for(let i=0;i<sparkN;i++){
    const a=Math.random()*Math.PI*2;
    const r=.32+Math.random()*1.85;
    sparkPos[i*3]=Math.cos(a)*r;
    sparkPos[i*3+1]=-.2+Math.random()*1.75;
    sparkPos[i*3+2]=Math.sin(a)*r*.5;
  }
  sparkGeo.setAttribute('position',new THREE.BufferAttribute(sparkPos,3));
  const sparks=new THREE.Points(
    sparkGeo,
    new THREE.PointsMaterial({color:0xe9fbff,size:.018,transparent:true,opacity:.42,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  sparks.userData.vt='sparkles';
  sparks.userData.baseOpacity=.42;
  xrVictoryArena.add(sparks);
  xrVictoryAnimatedNodes.push(sparks);

  xrVictoryTitleCanvas=document.createElement('canvas');
  xrVictoryTitleCanvas.width=1280;
  xrVictoryTitleCanvas.height=360;
  xrVictoryTitleCtx=xrVictoryTitleCanvas.getContext('2d');
  xrVictoryTitleTexture=new THREE.CanvasTexture(xrVictoryTitleCanvas);
  xrVictoryTitleTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrVictoryTitleTexture.needsUpdate=true;

  xrVictoryStatCanvases.length=0;
  xrVictoryStatTextures.length=0;
  xrVictoryStatMeshes.length=0;
  for(let i=0;i<4;i++){
    const c=document.createElement('canvas');
    c.width=560;
    c.height=260;
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
    new THREE.PlaneGeometry(2.28,.64),
    new THREE.MeshBasicMaterial({map:xrVictoryTitleTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );

  for(let i=0;i<4;i++){
    const depthLayer=new THREE.Mesh(
      new THREE.PlaneGeometry(2.28,.64),
      new THREE.MeshBasicMaterial({map:xrVictoryTitleTexture,transparent:true,opacity:.12,depthTest:false,depthWrite:false,toneMapped:false,color:0x1a2d54})
    );
    depthLayer.position.set(0,-.002*i,-.016*(i+1));
    xrVictoryTitleRig.add(depthLayer);
  }

  const titleGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(2.56,.76),
    new THREE.MeshBasicMaterial({color:0x82eaff,transparent:true,opacity:.24,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  titleGlow.position.z=-.04;
  xrVictoryTitleRig.add(titleGlow);

  xrVictoryTitleMesh.position.z=.02;
  xrVictoryTitleMesh.renderOrder=10003;
  xrVictoryTitleRig.add(xrVictoryTitleMesh);

  const statXs=[-.9,-.3,.3,.9];
  statXs.forEach((x,i)=>{
    const cardRig=new THREE.Group();
    cardRig.position.set(x,-.08,.14+Math.abs(x)*.035);
    cardRig.rotation.y=-x*.16;

    const cardGlow=new THREE.Mesh(
      new THREE.PlaneGeometry(.64,.35),
      new THREE.MeshBasicMaterial({color:i%2?0x9b8dff:0x82e9ff,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
    );
    cardGlow.position.z=-.02;
    cardRig.add(cardGlow);

    const statMesh=new THREE.Mesh(
      new THREE.PlaneGeometry(.6,.31),
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
    new THREE.PlaneGeometry(1.72,.38),
    new THREE.MeshBasicMaterial({color:0x0b2340,transparent:true,opacity:.38,depthTest:false,depthWrite:false,toneMapped:false})
  );
  buttonBack.position.z=-.025;
  buttonBack.renderOrder=10001;
  xrVictoryButtonsRig.add(buttonBack);

  xrVictoryTitleRig.position.set(0,.9,.1);
  xrVictoryStatsRig.position.set(0,.03,.06);
  xrVictoryButtonsRig.position.set(0,-.78,.12);
  xrVictoryArena.add(xrVictoryTitleRig);
  xrVictoryArena.add(xrVictoryStatsRig);
  xrVictoryArena.add(xrVictoryButtonsRig);

  const menuBtn=createXRVictoryButton('MENU',-.42,0,'victory-menu','#31175f');
  const replayBtn=createXRVictoryButton('CHƠI LẠI',.42,0,'victory-replay','#0f4a3c');
  menuBtn.position.z=.03;
  replayBtn.position.z=.09;
  menuBtn.userData.xrUiBaseZ=menuBtn.position.z;
  replayBtn.userData.xrUiBaseZ=replayBtn.position.z;
  menuBtn.userData.xrUiHoverZBoost=.09;
  replayBtn.userData.xrUiHoverZBoost=.11;
  menuBtn.userData.xrUiBaseScale=1.02;
  replayBtn.userData.xrUiBaseScale=1.04;

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
  drawXRTitleFrame(tctx,tw,th,'defeat');

  const tg=tctx.createLinearGradient(0,0,tw,0);
  tg.addColorStop(0,'rgba(255,155,190,.98)');
  tg.addColorStop(.45,'rgba(255,244,248,1)');
  tg.addColorStop(1,'rgba(255,116,154,.98)');
  tctx.textAlign='center';
  tctx.textBaseline='middle';
  tctx.font='900 146px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(255,118,169,.84)';
  tctx.shadowBlur=30;
  tctx.fillStyle=tg;
  tctx.fillText('TRY AGAIN',tw*.5,th*.48+8);
  tctx.shadowBlur=0;

  const badgeX=tw*.5-260,badgeY=th*.74,badgeW=520,badgeH=58;
  const badgeGrad=tctx.createLinearGradient(badgeX,badgeY,badgeX+badgeW,badgeY);
  badgeGrad.addColorStop(0,'rgba(58,18,24,.72)');
  badgeGrad.addColorStop(.5,'rgba(92,32,38,.92)');
  badgeGrad.addColorStop(1,'rgba(58,18,24,.72)');
  pathRoundedRect(tctx,badgeX,badgeY,badgeW,badgeH,18);
  tctx.fillStyle=badgeGrad;tctx.fill();
  tctx.strokeStyle='rgba(255,176,105,.82)';tctx.lineWidth=4;pathRoundedRect(tctx,badgeX,badgeY,badgeW,badgeH,18);tctx.stroke();
  tctx.fillStyle='#ffe2d8';
  tctx.font='900 35px Segoe UI,Arial,sans-serif';
  tctx.shadowColor='rgba(255,155,120,.7)';tctx.shadowBlur=12;
  tctx.fillText('BÌNH TĨNH • RÚT KINH NGHIỆM • THỬ LẠI',tw*.5,badgeY+badgeH*.55);
  tctx.shadowBlur=0;
  xrDefeatTitleTexture.needsUpdate=true;

  const sctx=xrDefeatStatsCtx;
  const sw=xrDefeatStatsCanvas.width;
  const sh=xrDefeatStatsCanvas.height;
  sctx.clearRect(0,0,sw,sh);

  const panel=sctx.createLinearGradient(0,0,0,sh);
  panel.addColorStop(0,'rgba(48,12,28,.68)');
  panel.addColorStop(1,'rgba(9,7,18,.82)');
  pathRoundedRect(sctx,20,24,sw-40,sh-48,42);
  sctx.fillStyle=panel;sctx.fill();
  sctx.strokeStyle='rgba(255,143,180,.25)';sctx.lineWidth=3;pathRoundedRect(sctx,20,24,sw-40,sh-48,42);sctx.stroke();

  const statItems=[
    {k:'LEVEL',v:xrDefeatData.level,c:'#ffb0c8',icon:'warn'},
    {k:'SCORE',v:xrDefeatData.score,c:'#ffd08a',icon:'cup'},
    {k:'TIME',v:xrDefeatData.time,c:'#ff8fb5',icon:'time'},
    {k:'COMBO',v:xrDefeatData.maxCombo,c:'#c89cff',icon:'combo'}
  ];
  const gap=24;
  const cardW=(sw-100-gap*3)/4;
  statItems.forEach((item,i)=>{
    drawXRResultCard(sctx,50+i*(cardW+gap),62,cardW,sh-124,item,{
      bgTop:'rgba(86,26,48,.94)',
      bgBot:'rgba(29,7,18,.96)',
      warm:true
    });
  });
  xrDefeatStatsTexture.needsUpdate=true;
}

function ensureXRDefeatArena(){
  if(xrDefeatTitleMesh) return;

  const floor=new THREE.Mesh(
    new THREE.CircleGeometry(1.92,110),
    new THREE.MeshBasicMaterial({color:0x1a0810,transparent:true,opacity:.74,depthWrite:false})
  );
  floor.rotation.x=-Math.PI/2;
  floor.position.y=-.94;
  xrDefeatArena.add(floor);

  const floorGlow=new THREE.Mesh(
    new THREE.CircleGeometry(2.12,110),
    new THREE.MeshBasicMaterial({color:0xff5d8c,transparent:true,opacity:.11,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  floorGlow.rotation.x=-Math.PI/2;
  floorGlow.position.y=-.935;
  xrDefeatArena.add(floorGlow);

  [.74,1.06,1.42].forEach((radius,index)=>{
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(radius,.034+index*.007,10,112),
      new THREE.MeshBasicMaterial({color:index%2?0xffb06b:0xff7ea8,transparent:true,opacity:.34-index*.035,blending:THREE.AdditiveBlending,depthWrite:false})
    );
    ring.rotation.x=Math.PI/2;
    ring.position.y=-.76+index*.038;
    ring.userData.vt='defeat-ring';
    ring.userData.vSpeed=-(.28+index*.08);
    ring.userData.baseOpacity=.32-index*.04;
    xrDefeatArena.add(ring);
    xrDefeatAnimatedNodes.push(ring);
  });

  const smokeGeo=new THREE.BufferGeometry();
  const smokeN=220;
  const smokePos=new Float32Array(smokeN*3);
  for(let i=0;i<smokeN;i++){
    const a=Math.random()*Math.PI*2;
    const rr=.18+Math.random()*1.38;
    smokePos[i*3]=Math.cos(a)*rr;
    smokePos[i*3+1]=-.62+Math.random()*1.02;
    smokePos[i*3+2]=Math.sin(a)*rr*.58;
  }
  smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokePos,3));
  const smoke=new THREE.Points(
    smokeGeo,
    new THREE.PointsMaterial({color:0xff9fbd,size:.022,transparent:true,opacity:.22,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  smoke.userData.vt='defeat-smoke';
  smoke.userData.baseOpacity=.22;
  xrDefeatArena.add(smoke);
  xrDefeatAnimatedNodes.push(smoke);

  for(let i=0;i<12;i++){
    const shard=new THREE.Mesh(
      new THREE.PlaneGeometry(.035,.09),
      new THREE.MeshBasicMaterial({color:i%2?0xffa069:0xff7ea8,transparent:true,opacity:.34,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide})
    );
    const a=Math.random()*Math.PI*2;
    const r=.55+Math.random()*1.05;
    shard.position.set(Math.cos(a)*r,-.04+Math.random()*1.05,Math.sin(a)*r*.5);
    shard.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
    shard.userData.vt='defeat-shard';
    shard.userData.baseOpacity=.28+Math.random()*.14;
    shard.userData.spin=.25+Math.random()*.4;
    xrDefeatArena.add(shard);
    xrDefeatAnimatedNodes.push(shard);
  }

  xrDefeatTitleCanvas=document.createElement('canvas');
  xrDefeatTitleCanvas.width=1280;
  xrDefeatTitleCanvas.height=340;
  xrDefeatTitleCtx=xrDefeatTitleCanvas.getContext('2d');
  xrDefeatTitleTexture=new THREE.CanvasTexture(xrDefeatTitleCanvas);
  xrDefeatTitleTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrDefeatTitleTexture.needsUpdate=true;

  xrDefeatStatsCanvas=document.createElement('canvas');
  xrDefeatStatsCanvas.width=1280;
  xrDefeatStatsCanvas.height=390;
  xrDefeatStatsCtx=xrDefeatStatsCanvas.getContext('2d');
  xrDefeatStatsTexture=new THREE.CanvasTexture(xrDefeatStatsCanvas);
  xrDefeatStatsTexture.anisotropy=renderer.capabilities.getMaxAnisotropy();
  xrDefeatStatsTexture.needsUpdate=true;

  xrDefeatTitleRig=new THREE.Group();
  xrDefeatStatsRig=new THREE.Group();
  xrDefeatButtonsRig=new THREE.Group();

  xrDefeatTitleMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(2.18,.58),
    new THREE.MeshBasicMaterial({map:xrDefeatTitleTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );
  xrDefeatStatsMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(2.0,.6),
    new THREE.MeshBasicMaterial({map:xrDefeatStatsTexture,transparent:true,opacity:1,depthTest:false,depthWrite:false,toneMapped:false})
  );

  const titleGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(2.38,.68),
    new THREE.MeshBasicMaterial({color:0xff8fb4,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  titleGlow.position.z=-.035;
  xrDefeatTitleRig.add(titleGlow);

  const statsGlow=new THREE.Mesh(
    new THREE.PlaneGeometry(2.14,.72),
    new THREE.MeshBasicMaterial({color:0xff91b6,transparent:true,opacity:.14,blending:THREE.AdditiveBlending,depthTest:false,depthWrite:false,toneMapped:false})
  );
  statsGlow.position.z=-.025;
  xrDefeatStatsRig.add(statsGlow);

  const buttonBack=new THREE.Mesh(
    new THREE.PlaneGeometry(1.72,.38),
    new THREE.MeshBasicMaterial({color:0x34101a,transparent:true,opacity:.46,depthTest:false,depthWrite:false,toneMapped:false})
  );
  buttonBack.position.z=-.02;
  buttonBack.renderOrder=10001;
  xrDefeatButtonsRig.add(buttonBack);

  xrDefeatTitleRig.position.set(0,.76,.04);
  xrDefeatStatsRig.position.set(0,-.08,.05);
  xrDefeatButtonsRig.position.set(0,-.82,.08);
  xrDefeatTitleRig.add(xrDefeatTitleMesh);
  xrDefeatStatsRig.add(xrDefeatStatsMesh);
  xrDefeatTitleMesh.renderOrder=10002;
  xrDefeatStatsMesh.renderOrder=10002;
  xrDefeatArena.add(xrDefeatTitleRig);
  xrDefeatArena.add(xrDefeatStatsRig);
  xrDefeatArena.add(xrDefeatButtonsRig);

  const menuBtn=createXRDefeatButton('MENU',-.42,0,'defeat-menu','#3a1325');
  const replayBtn=createXRDefeatButton('THỬ LẠI',.42,0,'defeat-replay','#4a2412');
  menuBtn.userData.xrUiBaseZ=menuBtn.position.z;
  replayBtn.userData.xrUiBaseZ=replayBtn.position.z;
  menuBtn.userData.xrUiHoverZBoost=.085;
  replayBtn.userData.xrUiHoverZBoost=.1;

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
  const p=1+Math.sin(xrVictoryPulse)*.028;
  if(xrVictoryTitleRig){
    xrVictoryTitleRig.scale.setScalar(p);
    xrVictoryTitleRig.position.set(
      Math.sin(xrVictoryPulse*1.2)*.025,
      .9+Math.cos(xrVictoryPulse*1.5)*.018,
      .1+Math.sin(xrVictoryPulse*.9)*.018
    );
    xrVictoryTitleRig.rotation.y=Math.sin(xrVictoryPulse*.45)*.08;
  }
  if(xrVictoryStatsRig) xrVictoryStatsRig.scale.setScalar(1+Math.sin(xrVictoryPulse*.8)*.016);
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
    if(n.userData&&n.userData.vt==='sparkles'){
      n.rotation.y+=dt*.08;
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.42)+Math.sin(xrVictoryPulse*1.2+i)*.08;
      return;
    }
    if(n.userData&&n.userData.vt==='stat-card'){
      n.position.y=(n.userData.baseY||n.position.y)+Math.sin(xrVictoryPulse*1.35+(n.userData.floatPhase||0))*.014;
      n.rotation.z=Math.sin(xrVictoryPulse*.7+(n.userData.floatPhase||0))*.018;
      return;
    }
    n.rotation.z+=dt*(.18+i*.04);
  });
}

function updateXRDefeatArena(dt){
  if(!xrDefeatActive||!xrDefeatArena.visible) return;
  xrDefeatPulse+=dt*1.5;
  if(xrDefeatTitleRig){
    xrDefeatTitleRig.scale.setScalar(1+Math.sin(xrDefeatPulse)*.018);
    xrDefeatTitleRig.position.set(
      Math.sin(xrDefeatPulse*2.15)*.008,
      .76+Math.cos(xrDefeatPulse*1.9)*.008,
      .04
    );
    xrDefeatTitleRig.rotation.y=Math.sin(xrDefeatPulse*.42)*.05;
  }
  if(xrDefeatStatsRig) xrDefeatStatsRig.scale.setScalar(1+Math.cos(xrDefeatPulse*.7)*.01);
  xrDefeatAnimatedNodes.forEach((n,i)=>{
    if(!n) return;
    if(n.userData&&n.userData.vt==='defeat-ring'){
      n.rotation.y+=dt*(n.userData.vSpeed||-.25);
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.24)+Math.sin(xrDefeatPulse*.9+i)*.045;
      return;
    }
    if(n.userData&&n.userData.vt==='defeat-smoke'){
      n.rotation.y-=dt*.08;
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.2)+Math.sin(xrDefeatPulse*.7+i)*.045;
      return;
    }
    if(n.userData&&n.userData.vt==='defeat-shard'){
      n.rotation.x+=dt*(n.userData.spin||.25);
      n.rotation.z-=dt*((n.userData.spin||.25)*.7);
      if(n.material) n.material.opacity=(n.userData.baseOpacity||.3)+Math.sin(xrDefeatPulse*1.2+i)*.05;
      return;
    }
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
    const isArcheryGuide=G.mode==='archery'&&xrArchery.active;
    const isArcheryAiming=isArcheryGuide&&!!xrArchery.bowHoldController;
    if(G.mode==='archery'&&xrArchery.active){
      xrArchery.root.updateMatrixWorld(true);
      xrArcheryGuideWorld.copy(isArcheryAiming?xrArcheryAimGuideLocal:xrArcheryGuideLocal);
      xrArchery.root.localToWorld(xrArcheryGuideWorld);
      xrUiTargetPos.copy(xrArcheryGuideWorld);
    }else{
      xrUiTargetPos.copy(WG.position).add(new THREE.Vector3(0,2.4,2.2));
    }
    xrCurvedHolo.position.lerp(xrUiTargetPos,.2);
    xrCurvedHolo.lookAt(xrUiCamPos.x,xrCurvedHolo.position.y-.04,xrUiCamPos.z);
    xrCurvedHolo.scale.setScalar(isArcheryGuide?(isArcheryAiming?.74:.95):1.6);
    if(xrHoloPanelMesh&&xrHoloPanelMesh.material){
      xrHoloPanelMesh.material.opacity=isArcheryAiming?.78:.98;
    }
    if(xrHoloAccentGlow&&xrHoloAccentGlow.material){
      xrHoloPulse+=(.045+xrUiOpenAnim*.015);
      const guideGlowBase=isArcheryAiming?.025:.06;
      xrHoloAccentGlow.material.opacity=guideGlowBase+Math.sin(xrHoloPulse)*.018;
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



```
