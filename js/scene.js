//  THREE SETUP
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const canvas=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.3;
renderer.xr.enabled=true;

function setXRStatus(message,type='warn'){
  let el=document.getElementById('xr-status');
  if(!el){
    el=document.createElement('div');
    el.id='xr-status';
    el.style.position='fixed';
    el.style.right='16px';
    el.style.bottom='64px';
    el.style.padding='8px 12px';
    el.style.borderRadius='10px';
    el.style.font='600 12px/1.2 system-ui,Segoe UI,Roboto,sans-serif';
    el.style.letterSpacing='.4px';
    el.style.zIndex='99999';
    el.style.pointerEvents='none';
    document.body.appendChild(el);
  }
  if(!message){el.style.display='none';return;}
  el.style.display='block';
  el.textContent=message;
  if(type==='ok'){
    el.style.color='#9dffd2';
    el.style.background='rgba(0,50,30,.78)';
    el.style.border='1px solid rgba(70,255,170,.4)';
  }else{
    el.style.color='#ffd3d3';
    el.style.background='rgba(64,10,10,.8)';
    el.style.border='1px solid rgba(255,110,110,.45)';
  }
}

function createNativeVRButton(){
  const btn=document.createElement('button');
  btn.id='enter-vr-btn';
  btn.textContent='ENTER VR';
  btn.style.position='fixed';
  btn.style.right='16px';
  btn.style.bottom='16px';
  btn.style.padding='10px 14px';
  btn.style.borderRadius='8px';
  btn.style.border='1px solid rgba(0,245,255,.7)';
  btn.style.background='rgba(0,12,30,.88)';
  btn.style.color='#9df6ff';
  btn.style.font='700 12px/1.1 Orbitron,Segoe UI,Arial,sans-serif';
  btn.style.letterSpacing='.08em';
  btn.style.cursor='pointer';
  btn.style.zIndex='99999';

  const setDisabled=(label)=>{
    btn.textContent=label;
    btn.disabled=true;
    btn.style.opacity='.65';
    btn.style.cursor='not-allowed';
  };

  if(!isSecureContext){
    setDisabled('HTTPS REQUIRED');
    setXRStatus('VR cần HTTPS hoặc localhost');
    document.body.appendChild(btn);
    return btn;
  }

  if(!navigator.xr||!navigator.xr.isSessionSupported){
    setDisabled('VR NOT SUPPORTED');
    setXRStatus('Không có navigator.xr (dùng Quest Browser/Chrome hỗ trợ WebXR)');
    document.body.appendChild(btn);
    return btn;
  }

  navigator.xr.isSessionSupported('immersive-vr').then(supported=>{
    if(!supported){
      setDisabled('VR NOT SUPPORTED');
      setXRStatus('Thiết bị/trình duyệt chưa hỗ trợ immersive-vr');
    }else{
      btn.disabled=false;
      btn.style.opacity='1';
      btn.style.cursor='pointer';
      btn.textContent='ENTER VR';
      setXRStatus('VR READY', 'ok');
    }
  }).catch(()=>{
    setDisabled('VR CHECK ERROR');
    setXRStatus('Không kiểm tra được trạng thái VR');
  });

  btn.addEventListener('click',async()=>{
    if(renderer.xr.isPresenting){
      const ses=renderer.xr.getSession();
      if(ses) await ses.end();
      return;
    }
    try{
      const session=await navigator.xr.requestSession('immersive-vr',{
        optionalFeatures:['local-floor','bounded-floor','hand-tracking']
      });
      await renderer.xr.setSession(session);
    }catch(err){
      const msg=(err&&err.message)?err.message:'Lỗi không xác định';
      setXRStatus('Không vào VR được: '+msg);
    }
  });

  renderer.xr.addEventListener('sessionstart',()=>{
    btn.textContent='EXIT VR';
    btn.style.opacity='1';
    setXRStatus('Đã vào VR', 'ok');
    alignVRToDesktopView();
    refreshPresentationMode();
  });
  renderer.xr.addEventListener('sessionend',()=>{
    btn.textContent='ENTER VR';
    setXRStatus('Đã thoát VR');
  });

  document.body.appendChild(btn);
  return btn;
}

if(THREE.VRButton&&THREE.VRButton.createButton){
  const vrBtn=THREE.VRButton.createButton(renderer);
  vrBtn.style.position='fixed';
  vrBtn.style.right='16px';
  vrBtn.style.bottom='16px';
  vrBtn.style.left='auto';
  vrBtn.style.width='auto';
  vrBtn.style.zIndex='99999';
  vrBtn.style.pointerEvents='auto';
  vrBtn.style.opacity='1';
  document.body.appendChild(vrBtn);

  renderer.xr.addEventListener('sessionstart',()=>{setXRStatus('Đã vào VR', 'ok');alignVRToDesktopView();});
  renderer.xr.addEventListener('sessionend',()=>setXRStatus('Đã thoát VR'));

  if(!isSecureContext){
    setXRStatus('VR cần HTTPS hoặc localhost');
  }else if(!('xr' in navigator)){
    setXRStatus('Không có navigator.xr (hãy mở bằng trình duyệt hỗ trợ WebXR)');
    vrBtn.style.opacity='.7';
  }else if(navigator.xr&&navigator.xr.isSessionSupported){
    navigator.xr.isSessionSupported('immersive-vr').then(supported=>{
      if(!supported){
        setXRStatus('Thiết bị/trình duyệt chưa hỗ trợ immersive-vr');
        vrBtn.style.opacity='.7';
      }else{
        setXRStatus('VR READY', 'ok');
        vrBtn.style.opacity='1';
      }
    }).catch(()=>setXRStatus('Không kiểm tra được trạng thái VR'));
  }
}else{
  createNativeVRButton();
}

const scene=new THREE.Scene();
scene.fog=new THREE.FogExp2(0x000208,.016);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,300);
camera.position.set(0,1.8,8);camera.lookAt(0,.2,0);

const desktopOrbit={
  initialized:false,
  yaw:0,
  pitch:.08,
  distance:8,
  isDragging:false,
  lastX:0,
  lastY:0,
  userControlUntil:0,
};

function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function updateDesktopOrbitCamera(t){
  const targetX=WG.position.x;
  const targetY=.92;
  const targetZ=WG.position.z;

  if(!desktopOrbit.initialized){
    const ox=camera.position.x-targetX;
    const oy=camera.position.y-targetY;
    const oz=camera.position.z-targetZ;
    const d=Math.sqrt(ox*ox+oy*oy+oz*oz)||8;
    desktopOrbit.distance=clamp(d,4,16);
    desktopOrbit.yaw=Math.atan2(ox,oz);
    desktopOrbit.pitch=Math.asin(clamp(oy/desktopOrbit.distance,-1,1));
    desktopOrbit.initialized=true;
  }

  const userControl=performance.now()<desktopOrbit.userControlUntil;
  const camPitch=userControl?desktopOrbit.pitch:(desktopOrbit.pitch+Math.cos(t*.17)*.01);
  const cp=Math.cos(camPitch),sp=Math.sin(camPitch);
  const sy=Math.sin(desktopOrbit.yaw),cy=Math.cos(desktopOrbit.yaw);
  const d=desktopOrbit.distance;

  camera.position.set(
    targetX+sy*cp*d,
    targetY+sp*d,
    targetZ+cy*cp*d
  );
  camera.lookAt(targetX,targetY-.66,targetZ);
}

if(VR_DEV_MODE){
  window.addEventListener('mousedown',e=>{
    if(e.button!==2) return;
    if(renderer.xr.isPresenting||xrMouseSim.enabled) return;
    desktopOrbit.isDragging=true;
    desktopOrbit.lastX=e.clientX;
    desktopOrbit.lastY=e.clientY;
    desktopOrbit.userControlUntil=performance.now()+30000;
    e.preventDefault();
  });

  window.addEventListener('mousemove',e=>{
    if(!desktopOrbit.isDragging) return;
    if(renderer.xr.isPresenting||xrMouseSim.enabled) return;
    const dx=e.clientX-desktopOrbit.lastX;
    const dy=e.clientY-desktopOrbit.lastY;
    desktopOrbit.lastX=e.clientX;
    desktopOrbit.lastY=e.clientY;
    desktopOrbit.yaw-=dx*.0042;
    desktopOrbit.pitch=clamp(desktopOrbit.pitch-dy*.0032,-1.1,1.1);
    desktopOrbit.userControlUntil=performance.now()+30000;
  });

  window.addEventListener('mouseup',e=>{
    if(e.button===2) desktopOrbit.isDragging=false;
  });

  window.addEventListener('wheel',e=>{
    if(renderer.xr.isPresenting||xrMouseSim.enabled) return;
    desktopOrbit.distance=clamp(desktopOrbit.distance+e.deltaY*.008,3.6,18);
    desktopOrbit.userControlUntil=performance.now()+30000;
  },{passive:true});

  canvas.addEventListener('contextmenu',e=>{
    if(!renderer.xr.isPresenting) e.preventDefault();
  });
}

// Lights
scene.add(new THREE.AmbientLight(0x0a1530,2));
const sun=new THREE.DirectionalLight(0xffffff,2.5);sun.position.set(4,10,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);
const rim=new THREE.PointLight(0x00f5ff,4,40);rim.position.set(-7,5,-5);scene.add(rim);
const fill=new THREE.PointLight(0xa855f7,3,30);fill.position.set(7,3,3);scene.add(fill);
const back=new THREE.PointLight(0xff2d78,1.5,20);back.position.set(0,-2,-8);scene.add(back);

// Stars
const sGeo=new THREE.BufferGeometry();
const sN=1800,sP=new Float32Array(sN*3),sSz=new Float32Array(sN);
for(let i=0;i<sN;i++){sP[i*3]=(Math.random()-.5)*280;sP[i*3+1]=(Math.random()-.5)*280;sP[i*3+2]=(Math.random()-.5)*280;sSz[i]=Math.random()*1.8+.2;}
sGeo.setAttribute('position',new THREE.BufferAttribute(sP,3));
sGeo.setAttribute('size',new THREE.BufferAttribute(sSz,1));
const sMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:`attribute float size;varying float vA;uniform float uT;void main(){vA=.4+.6*abs(sin(position.x*.28+uT*.35));gl_PointSize=size*(1.+.3*sin(position.y+uT));gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying float vA;void main(){float d=length(gl_PointCoord-.5);if(d>.5)discard;gl_FragColor=vec4(.85,.92,1.,(.9-d*1.8)*vA);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});
scene.add(new THREE.Points(sGeo,sMat));

// Nebula
function nebula(x,y,z,r,col,op){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,10),new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:op,side:THREE.BackSide,depthWrite:false,blending:THREE.AdditiveBlending}));m.position.set(x,y,z);scene.add(m);}
nebula(-25,10,-65,38,0x1a0066,.13);nebula(28,-6,-70,30,0x001a77,.10);nebula(5,18,-60,24,0x440022,.12);nebula(-12,-12,-50,20,0x002244,.09);

// Galaxy
const galMat=new THREE.ShaderMaterial({uniforms:{uT:{value:0}},vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 vP;uniform float uT;void main(){float t=sin(vP.x*.07+vP.y*.04+uT*.15)*.5+.5;vec3 c=mix(vec3(0.,.08,.25),vec3(.12,0.,.28),t);gl_FragColor=vec4(c,.07);}`,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
const galaxy=new THREE.Mesh(new THREE.TorusGeometry(50,10,4,100),galMat);galaxy.rotation.x=Math.PI*.28;galaxy.position.z=-40;scene.add(galaxy);

// Asteroids
const astGroup=new THREE.Group();
for(let i=0;i<56;i++){const a=(i/56)*Math.PI*2,r=18+Math.random()*6;const m=new THREE.Mesh(new THREE.DodecahedronGeometry(Math.random()*.12+.04,0),new THREE.MeshStandardMaterial({color:0x223355,roughness:.9,metalness:.2}));m.position.set(Math.cos(a)*r,(Math.random()-.5)*3,Math.sin(a)*r-25);m.rotation.set(Math.random()*6,Math.random()*6,0);astGroup.add(m);}
scene.add(astGroup);

// Floor
const WORLD_FLOOR_Y=-0.18;
const floorM=new THREE.Mesh(new THREE.PlaneGeometry(40,40),new THREE.MeshStandardMaterial({color:0x000508,roughness:1,transparent:true,opacity:.7}));
floorM.rotation.x=-Math.PI/2;floorM.position.y=WORLD_FLOOR_Y;floorM.receiveShadow=true;scene.add(floorM);
const gridHelper=new THREE.GridHelper(40,40,0x001122,0x001122);
gridHelper.position.set(0,WORLD_FLOOR_Y,0);
scene.add(gridHelper);
if(Array.isArray(gridHelper.material)){
  gridHelper.material.forEach(m=>{m.transparent=true;m.opacity=.28;m.depthWrite=false;});
}else{
  gridHelper.material.transparent=true;
  gridHelper.material.opacity=.28;
  gridHelper.material.depthWrite=false;
}

const floorFadeMat=new THREE.ShaderMaterial({
  uniforms:{uInner:{value:8.0},uOuter:{value:19.5}},
  vertexShader:`varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`uniform float uInner;uniform float uOuter;varying vec3 vPos;void main(){float r=length(vPos.xz);float a=smoothstep(uInner,uOuter,r);gl_FragColor=vec4(0.0,0.03,0.07,a*.62);}`,
  transparent:true,depthWrite:false,side:THREE.DoubleSide
});
const floorFade=new THREE.Mesh(new THREE.CircleGeometry(20,96),floorFadeMat);
floorFade.rotation.x=-Math.PI/2;
floorFade.position.y=WORLD_FLOOR_Y+.04;
scene.add(floorFade);

// Floating particles
const pGeo=new THREE.BufferGeometry();
const pN=140,pP=new Float32Array(pN*3),pV=[];
for(let i=0;i<pN;i++){pP[i*3]=(Math.random()-.5)*24;pP[i*3+1]=(Math.random()-.5)*12;pP[i*3+2]=(Math.random()-.5)*16;pV.push({x:(Math.random()-.5)*.004,y:Math.random()*.004+.001});}
pGeo.setAttribute('position',new THREE.BufferAttribute(pP,3));
scene.add(new THREE.Points(pGeo,new THREE.PointsMaterial({color:0x00f5ff,size:.055,transparent:true,opacity:.35,blending:THREE.AdditiveBlending,depthWrite:false})));

// Energy pillars
for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2,r=12,h=4+Math.random()*8;const m=new THREE.Mesh(new THREE.CylinderGeometry(.04,.04,h,6),new THREE.MeshBasicMaterial({color:i%2===0?0x00f5ff:0xa855f7,transparent:true,opacity:.14,blending:THREE.AdditiveBlending}));m.position.set(Math.cos(a)*r,h/2+WORLD_FLOOR_Y,Math.sin(a)*r-5);scene.add(m);}

// Ancient architecture environment
const ancientEnv=new THREE.Group();
scene.add(ancientEnv);
const ancientFlames=[];
const ancientFlameLights=[];

const ancientTextureLoader=new THREE.TextureLoader();
function loadAncientTexture(path,repeatX=1,repeatY=1,useSRGB=true){
  const tex=ancientTextureLoader.load(path);
  tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
  tex.repeat.set(repeatX,repeatY);
  tex.anisotropy=renderer.capabilities.getMaxAnisotropy();
  if(useSRGB){
    if('colorSpace' in tex&&THREE.SRGBColorSpace) tex.colorSpace=THREE.SRGBColorSpace;
    else if('encoding' in tex&&THREE.sRGBEncoding) tex.encoding=THREE.sRGBEncoding;
  }
  return tex;
}

const ancientFloorTex=loadAncientTexture('assets/textures/floor/slab_tiles_diff_2k.jpg',3.4,3.4,true);
const ancientFloorNormal=loadAncientTexture('assets/textures/floor/slab_tiles_nor_gl_2k.jpg',3.4,3.4,false);
const ancientFloorRough=loadAncientTexture('assets/textures/floor/slab_tiles_rough_2k.jpg',3.4,3.4,false);

const ancientWallTex=loadAncientTexture('assets/textures/wall/grey_cartago_03_diff_2k.jpg',2.2,1.5,true);
const ancientWallNormal=loadAncientTexture('assets/textures/wall/grey_cartago_03_nor_gl_2k.jpg',2.2,1.5,false);
const ancientWallRough=loadAncientTexture('assets/textures/wall/grey_cartago_03_rough_2k.jpg',2.2,1.5,false);
const ancientRockNormal=loadAncientTexture('assets/textures/rock/lichen_rock_nor_gl_1k.jpg',2.6,2.6,false);
const ancientRockRough=loadAncientTexture('assets/textures/rock/lichen_rock_rough_1k.jpg',2.6,2.6,false);

const archeryTargetDiff=loadAncientTexture('assets/textures/target/diagonal_parquet_diff_1k.jpg',1,1,true);
const archeryTargetNormal=loadAncientTexture('assets/textures/target/diagonal_parquet_nor_gl_1k.jpg',1,1,false);
const archeryTargetRough=loadAncientTexture('assets/textures/target/diagonal_parquet_rough_1k.jpg',1,1,false);

floorM.material=new THREE.MeshStandardMaterial({
  color:0xf2ece1,
  roughness:1,
  metalness:.05,
  map:ancientFloorTex,
  normalMap:ancientFloorNormal,
  roughnessMap:ancientFloorRough,
  normalScale:new THREE.Vector2(.62,.62),
  transparent:true,
  opacity:.95
});

const stoneMat=new THREE.MeshStandardMaterial({
  color:0xb7ae9f,
  roughness:1,
  metalness:.03,
  emissive:0x241f18,
  emissiveIntensity:.08,
  map:ancientWallTex,
  normalMap:ancientWallNormal,
  roughnessMap:ancientWallRough,
  normalScale:new THREE.Vector2(.86,.86)
});
const stoneDarkMat=new THREE.MeshStandardMaterial({
  color:0x8f8474,
  roughness:1,
  metalness:.03,
  emissive:0x1a1510,
  emissiveIntensity:.08,
  map:ancientWallTex,
  normalMap:ancientWallNormal,
  roughnessMap:ancientWallRough,
  normalScale:new THREE.Vector2(1.05,1.05)
});
const stoneAccentMat=new THREE.MeshStandardMaterial({
  color:0xd8d0c2,
  roughness:1,
  metalness:.04,
  emissive:0x26211b,
  emissiveIntensity:.06,
  map:ancientWallTex,
  normalMap:ancientWallNormal,
  roughnessMap:ancientWallRough,
  normalScale:new THREE.Vector2(.72,.72)
});
const bronzeMat=new THREE.MeshStandardMaterial({
  color:0x7b6650,
  roughness:.44,
  metalness:.52,
  emissive:0x1f1712,
  emissiveIntensity:.1
});

const plinth=new THREE.Mesh(new THREE.CylinderGeometry(7.6,7.9,.22,56),stoneAccentMat);
plinth.position.set(0,WORLD_FLOOR_Y+.11,0);
plinth.receiveShadow=true;
ancientEnv.add(plinth);

const plinthRing=new THREE.Mesh(
  new THREE.TorusGeometry(7.58,.07,12,120),
  new THREE.MeshStandardMaterial({color:0xb8ad99,roughness:.42,metalness:.16,emissive:0x1a1b1f,emissiveIntensity:.1})
);
plinthRing.rotation.x=Math.PI/2;
plinthRing.position.y=WORLD_FLOOR_Y+.23;
ancientEnv.add(plinthRing);

for(let i=0;i<14;i++){
  const a=(i/14)*Math.PI*2;
  const r=9.8;
  const col=new THREE.Group();
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.38,.42,.24,16),stoneDarkMat);
  base.position.y=WORLD_FLOOR_Y+.12;
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.24,.28,3.7,16),stoneAccentMat);
  shaft.position.y=WORLD_FLOOR_Y+2.04;
  const cap=new THREE.Mesh(new THREE.CylinderGeometry(.42,.35,.26,16),stoneMat);
  cap.position.y=WORLD_FLOOR_Y+3.99;
  const shaftLines=new THREE.Mesh(
    new THREE.CylinderGeometry(.246,.286,3.72,24,1,true),
    new THREE.MeshBasicMaterial({color:0x5ef4ff,transparent:true,opacity:.18,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  shaftLines.position.y=WORLD_FLOOR_Y+2.04;
  col.add(base,shaft,cap);
  col.add(shaftLines);
  col.position.set(Math.cos(a)*r,0,Math.sin(a)*r);
  col.rotation.y=a;
  ancientEnv.add(col);
}

for(let i=0;i<10;i++){
  const a=(i/10)*Math.PI*2+Math.PI*.1;
  const r=13.5;
  const wall=new THREE.Mesh(new THREE.BoxGeometry(2.8,2.5,.52),stoneMat);
  wall.position.set(Math.cos(a)*r,WORLD_FLOOR_Y+1.25,Math.sin(a)*r);
  wall.rotation.y=-a+Math.PI/2;
  ancientEnv.add(wall);

  const relief=new THREE.Mesh(
    new THREE.PlaneGeometry(2.1,1.7),
    new THREE.MeshStandardMaterial({
      map:ancientWallTex,
      normalMap:ancientWallNormal,
      roughnessMap:ancientWallRough,
      normalScale:new THREE.Vector2(.78,.78),
      color:0xa79d8d,
      roughness:1,
      metalness:.03,
      emissive:0x1c1814,
      emissiveIntensity:.08
    })
  );
  relief.position.set(0,.2,.27);
  wall.add(relief);

  const techPanel=new THREE.Mesh(
    new THREE.PlaneGeometry(.42,.74),
    new THREE.MeshBasicMaterial({color:0x86ecff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  techPanel.position.set(-.88,-.12,.272);
  wall.add(techPanel);

  if(i%2===0){
    const crack=new THREE.Mesh(new THREE.BoxGeometry(.22,1.1,.62),stoneDarkMat);
    crack.position.set(0,.34,0);
    crack.rotation.z=.12;
    wall.add(crack);
  }
}

function addAncientGate(x,z,ry=0){
  const gate=new THREE.Group();
  gate.position.set(x,0,z);
  gate.rotation.y=ry;

  const p1=new THREE.Mesh(new THREE.BoxGeometry(.62,3.2,.62),stoneAccentMat);
  p1.position.set(-1.18,WORLD_FLOOR_Y+1.6,0);
  const p2=p1.clone();
  p2.position.x=1.18;
  const lintel=new THREE.Mesh(new THREE.BoxGeometry(2.9,.54,.68),stoneMat);
  lintel.position.set(0,WORLD_FLOOR_Y+3.46,0);
  gate.add(p1,p2,lintel);

  const emblem=new THREE.Mesh(
    new THREE.RingGeometry(.2,.34,20),
    new THREE.MeshBasicMaterial({color:0x9fdfff,transparent:true,opacity:.2,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  emblem.position.set(0,WORLD_FLOOR_Y+2.64,.36);
  gate.add(emblem);

  ancientEnv.add(gate);
}

addAncientGate(0,-10.6,0);
addAncientGate(10.6,0,Math.PI/2);

for(let i=0;i<6;i++){
  const a=(i/6)*Math.PI*2+Math.PI/6;
  const r=8.9;
  const brazier=new THREE.Group();
  brazier.position.set(Math.cos(a)*r,WORLD_FLOOR_Y,Math.sin(a)*r);

  const bowl=new THREE.Mesh(new THREE.CylinderGeometry(.24,.31,.18,18),bronzeMat);
  bowl.position.y=.88;
  const stand=new THREE.Mesh(new THREE.CylinderGeometry(.1,.14,.82,14),bronzeMat);
  stand.position.y=.41;
  brazier.add(bowl,stand);

  const flame=new THREE.Mesh(
    new THREE.SphereGeometry(.12,12,12),
    new THREE.MeshBasicMaterial({color:0xffb24f,transparent:true,opacity:.62,blending:THREE.AdditiveBlending,depthWrite:false})
  );
  flame.position.y=.99;
  flame.userData.phase=Math.random()*Math.PI*2;
  brazier.add(flame);
  ancientFlames.push(flame);

  const flameLight=new THREE.PointLight(0xffad5c,1.2,4.5,2);
  flameLight.position.y=.98;
  flameLight.userData.phase=Math.random()*Math.PI*2;
  brazier.add(flameLight);
  ancientFlameLights.push(flameLight);

  ancientEnv.add(brazier);
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

