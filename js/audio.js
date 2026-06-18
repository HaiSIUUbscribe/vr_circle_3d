// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  AUDIO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AC=new(window.AudioContext||window.webkitAudioContext)();
const resumeAC=()=>AC.state==='suspended'&&AC.resume();
function tone(f,tp,d,v,t0=0){const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(AC.destination);o.type=tp;o.frequency.value=f;const t=AC.currentTime+t0;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.015);g.gain.exponentialRampToValueAtTime(.001,t+d);o.start(t);o.stop(t+d+.05);}
const sfx={
  pick:()=>{tone(700,'sine',.1,.12);tone(1100,'sine',.07,.07,.09);},
  aim:()=>{tone(500,'sine',.06,.07);},
  throw:()=>{tone(250,'sine',.15,.15);tone(400,'sine',.1,.1,.07);},
  ok:()=>{[523,659,784].forEach((f,i)=>tone(f,'sine',.14,.17,i*.09));},
  bad:()=>{tone(170,'sawtooth',.22,.14);tone(110,'sawtooth',.18,.1,.11);},
  combo:n=>{const fs=[523,659,784,1047];[...Array(Math.min(n-1,4))].forEach((_,i)=>tone(fs[i],'triangle',.16,.16,i*.08));},
  up:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,'sine',.2,.17,i*.1));},
  win:()=>{[523,659,784,1047,1319].forEach((f,i)=>tone(f,'triangle',.28,.19,i*.12));},
  lose:()=>{[300,210,150].forEach((f,i)=>tone(f,'sawtooth',.3,.13,i*.13));},
  hov:()=>{tone(1400,'sine',.04,.03);},
  cancel:()=>{tone(300,'sine',.1,.08);}
};
let ambO=null;
let bgmTrack=null;
let bgmUnavailable=false;
let bgmVolume=.35;
const BGM_SRC='audio/Color_Coded_Victory.mp3';

function playVictoryApplause(){
  const now=AC.currentTime+.03;
  const burst=(t,len=.085,amp=.11)=>{
    const sr=AC.sampleRate;
    const n=Math.max(1,Math.floor(sr*len));
    const buf=AC.createBuffer(1,n,sr);
    const d=buf.getChannelData(0);
    for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const src=AC.createBufferSource();
    src.buffer=buf;
    const hp=AC.createBiquadFilter();
    hp.type='highpass';hp.frequency.value=900;
    const bp=AC.createBiquadFilter();
    bp.type='bandpass';bp.frequency.value=2000+Math.random()*850;
    bp.Q.value=.7;
    const g=AC.createGain();
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(amp,t+.01);
    g.gain.exponentialRampToValueAtTime(.001,t+len);
    src.connect(hp);hp.connect(bp);bp.connect(g);g.connect(AC.destination);
    src.start(t);
    src.stop(t+len+.03);
  };
  for(let i=0;i<12;i++) burst(now+i*.08,.08+Math.random()*.03,.08+Math.random()*.06);
}

function applyBgmVolume(){
  if(bgmTrack) bgmTrack.volume=Math.max(0,Math.min(1,bgmVolume));
  const icon=document.querySelector('#btn-audio i');
  if(!icon) return;
  icon.className='fa-solid '+(bgmVolume<=0?'fa-volume-xmark':(bgmVolume<.5?'fa-volume-low':'fa-volume-high'));
}

function startAmb(){
  if(!bgmTrack){
    bgmTrack=new Audio(BGM_SRC);
    bgmTrack.loop=true;
    bgmTrack.preload='auto';
    bgmTrack.volume=bgmVolume;
  }

  if(!bgmUnavailable){
    if(Math.abs(bgmTrack.currentTime)<.01) bgmTrack.currentTime=0;
    const p=bgmTrack.play();
    if(p&&typeof p.then==='function'){
      p.catch(()=>{
        bgmUnavailable=true;
        if(!ambO){
          const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
          f.type='lowpass';f.frequency.value=140;
          o.connect(f);f.connect(g);g.connect(AC.destination);
          o.type='sine';o.frequency.value=42;
          g.gain.setValueAtTime(0,AC.currentTime);
          g.gain.linearRampToValueAtTime(.05,AC.currentTime+2);
          o.start();ambO={o,g};
        }
      });
      return;
    }
  }

  if(!ambO){
    const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
    f.type='lowpass';f.frequency.value=140;
    o.connect(f);f.connect(g);g.connect(AC.destination);
    o.type='sine';o.frequency.value=42;
    g.gain.setValueAtTime(0,AC.currentTime);
    g.gain.linearRampToValueAtTime(.05,AC.currentTime+2);
    o.start();ambO={o,g};
  }
}

function stopAmb(){
  if(bgmTrack){
    bgmTrack.pause();
    try{bgmTrack.currentTime=0;}catch(e){}
  }
  if(!ambO) return;
  ambO.g.gain.linearRampToValueAtTime(0,AC.currentTime+1.2);
  setTimeout(()=>{try{ambO.o.stop()}catch(e){}ambO=null;},1400);
}

let bgmUnlocked=false;
function unlockBgmOnce(){
  if(bgmUnlocked) return;
  bgmUnlocked=true;
  resumeAC();
  startAmb();
  window.removeEventListener('pointerdown',unlockBgmOnce);
  window.removeEventListener('touchstart',unlockBgmOnce);
  window.removeEventListener('keydown',unlockBgmOnce);
}
window.addEventListener('pointerdown',unlockBgmOnce,{passive:true});
window.addEventListener('touchstart',unlockBgmOnce,{passive:true});
window.addEventListener('keydown',unlockBgmOnce);

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

