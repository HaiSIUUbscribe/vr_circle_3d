//  DATA
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const LEVELS=[
  {id:1,badge:'LEVEL 1 â€” PRIMARY',bc:'#ff6b6b',tl:60,colors:[{name:'Red',hex:'#FF0000',angle:0},{name:'Yellow',hex:'#FFFF00',angle:120},{name:'Blue',hex:'#0055FF',angle:240}]},
  {id:2,badge:'LEVEL 2 â€” SECONDARY',bc:'#c45eff',tl:40,colors:[{name:'Red',hex:'#FF0000',angle:0},{name:'Orange',hex:'#FF4500',angle:60},{name:'Yellow',hex:'#FFFF00',angle:120},{name:'Green',hex:'#008000',angle:180},{name:'Blue',hex:'#0055FF',angle:240},{name:'Violet',hex:'#AA00FF',angle:300}]},
  {id:3,badge:'LEVEL 3 â€” TERTIARY',bc:'#00f5ff',tl:60,colors:[{name:'Red',hex:'#FF0000',angle:0},{name:'Red-Org',hex:'#FF5349',angle:30},{name:'Orange',hex:'#FF6600',angle:60},{name:'Yel-Org',hex:'#FFAE42',angle:90},{name:'Yellow',hex:'#FFFF00',angle:120},{name:'Yel-Grn',hex:'#9ACD32',angle:150},{name:'Green',hex:'#008000',angle:180},{name:'Blu-Grn',hex:'#0D98BA',angle:210},{name:'Blue',hex:'#0055FF',angle:240},{name:'Blu-Vlt',hex:'#8A2BE2',angle:270},{name:'Violet',hex:'#AA00FF',angle:300},{name:'Red-Vlt',hex:'#C71585',angle:330}]}
];
function h2c(hex){return{r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255};}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

