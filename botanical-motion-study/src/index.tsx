import React from 'react';
import {AbsoluteFill, Composition, registerRoot, staticFile, useCurrentFrame} from 'remotion';
import {Audio} from '@remotion/media';
import events from './events.json';

const FPS=60;
const rnd=(n:number)=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const e=(t:number,s:number,d:number)=>{const u=clamp((t-s)/d);return u*u*u*(u*(u*6-15)+10);};
const lerp=(a:number,b:number,p:number)=>a+(b-a)*p;
const cue=(t:number,frame:number,d=.7)=>e(t,frame/FPS,d);
const burst=(t:number,frame:number,d=.6)=>{const u=(t-frame/FPS)/d;return u<0||u>1?0:Math.sin(u*Math.PI)*(1-u*.45);};
const bez=(p:number,a:number,b:number,c:number,d:number)=>Math.pow(1-p,3)*a+3*(1-p)*(1-p)*p*b+3*(1-p)*p*p*c+p*p*p*d;
const C={sky:'#163941',forest:'#103934',soil:'#172725',bark:'#B9885A',gold:'#FFE59A',mint:'#A5E6A0',green:'#3AA46E',deep:'#205D48',cyan:'#8FE4DC',coral:'#F1A08B',paper:'#E9F4DD'};
const clusters=[[735,390],[820,280],[998,270],[1160,365],[680,520],[855,440],[1070,490],[1240,520],[940,580]];
const rootEnds=Array.from({length:12},(_,i)=>({x:180+i*143,y:1050+rnd(i+201)*250}));

const Leaf=({x,y,r,angle=0,fill=C.green}:{x:number;y:number;r:number;angle?:number;fill?:string})=><g transform={`translate(${x} ${y}) rotate(${angle})`}><path d={`M ${-r} 0 C ${-r*.55} ${-r*.9} ${r*.55} ${-r*.9} ${r} 0 C ${r*.5} ${r*.85} ${-r*.55} ${r*.8} ${-r} 0`} fill={fill}/><path d={`M ${-r*.85} 0 Q 0 ${-r*.12} ${r*.8} 0`} fill="none" stroke="#173E35" strokeOpacity=".25" strokeWidth={Math.max(1,r*.035)}/></g>;

function Defs(){return <defs>
 <linearGradient id="sky" x2="0" y2="1"><stop stopColor="#142C3C"/><stop offset="1" stopColor="#5A9286"/></linearGradient>
 <linearGradient id="earth" x2="0" y2="1"><stop stopColor="#29443A"/><stop offset=".12" stopColor="#1C3830"/><stop offset="1" stopColor="#111F23"/></linearGradient>
 <linearGradient id="trunk"><stop stopColor="#755841"/><stop offset=".55" stopColor="#C49A6D"/><stop offset="1" stopColor="#9D7852"/></linearGradient>
 <linearGradient id="leaf" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#2A8054"/><stop offset=".6" stopColor="#75C88B"/><stop offset="1" stopColor="#BCEAA0"/></linearGradient>
 <linearGradient id="cell" x2="0" y2="1"><stop stopColor="#BADCA0"/><stop offset="1" stopColor="#629974"/></linearGradient>
 <radialGradient id="sun"><stop stopColor="#FFE9A2" stopOpacity=".45"/><stop offset="1" stopColor="#FFE9A2" stopOpacity="0"/></radialGradient>
 <radialGradient id="micro"><stop stopColor="#286657"/><stop offset="1" stopColor="#123438"/></radialGradient>
 <linearGradient id="chloro" x2="0" y2="1"><stop stopColor="#A8D489"/><stop offset="1" stopColor="#3C8E66"/></linearGradient>
 </defs>;}

function Background({t}:{t:number}){return <g>
 <rect width="1920" height="2100" fill="url(#sky)"/>
 <circle cx="1580" cy="150" r="380" fill="url(#sun)"/>
 <circle cx="1580" cy="150" r="68" fill={C.gold}/>
 {[0,1,2,3,4].map(i=><path key={i} d={`M ${1540+i*18} 190 L ${1000+i*115} 900 L ${1090+i*118} 900 Z`} fill={C.gold} opacity={.025+.012*Math.sin(t*.4+i)}/>)}
 <path d="M0 620 Q230 380 500 570 Q800 420 1150 530 Q1550 280 1920 520 L1920 1100H0Z" fill="#386C66"/>
 <path d="M0 780 Q230 520 610 730 Q950 480 1350 690 Q1650 520 1920 700V1200H0Z" fill="#25534C"/>
 {Array.from({length:28},(_,i)=>{const x=i*76-80,y=690+rnd(i)*100,h=80+rnd(i+80)*230;return <g key={i} transform={`translate(${x+Math.sin(t*.35+i)*2} ${y})`} opacity=".65"><path d={`M0 0L0 ${-h}`} stroke="#214A41" strokeWidth="8"/><path d={`M0 ${-h} C ${-h*.36} ${-h*.8} ${-h*.32} ${-h*.2} 0 ${-h*.1} C ${h*.4} ${-h*.2} ${h*.35} ${-h*.85} 0 ${-h}`} fill={i%2?'#244F42':'#19463F'}/></g>;})}
 <path d="M0 870 Q400 790 800 850 T1920 830V2100H0Z" fill="url(#earth)"/>
 <path d="M0 870 Q400 790 800 850 T1920 830" fill="none" stroke="#92B774" strokeWidth="10"/>
 {Array.from({length:95},(_,i)=>{const x=rnd(i+600)*1920,y=925+rnd(i+620)*960;return <ellipse key={i} cx={x} cy={y} rx={2+rnd(i+8)*5} ry={1+rnd(i+9)*2} fill="#719079" opacity=".16"/>;})}
 {Array.from({length:24},(_,i)=>{const x=rnd(i+460)*1920,y=940+rnd(i+560)*560,w=18+rnd(i+100)*32;return <path key={i} d={`M${x-w} ${y} L${x-w*.4} ${y-w*.55} L${x+w*.5} ${y-w*.6} L${x+w} ${y} L${x+w*.4} ${y+w*.35}L${x-w*.5} ${y+w*.2}Z`} fill={i%3?'#38534A':'#527168'} opacity=".7"/>;})}
 </g>;}

function Tree({t}:{t:number}){return <g>
 <ellipse cx="960" cy="870" rx="240" ry="28" fill="#091E20" opacity=".3"/>
 {rootEnds.map((v,i)=>{const sx=960+(i-6)*6,control=lerp(sx,v.x,.65),d=`M${sx} 850 C${sx} 950 ${control} ${v.y-35} ${v.x} ${v.y}`;return <g key={i}>
  <path d={d} fill="none" stroke="#BC9674" strokeWidth={24-i%4*3} strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-e(t,.45+i*.07,1.4)}/>
  {[0,1].map(j=><path key={j} d={`M${lerp(sx,v.x,.7)} ${lerp(850,v.y,.85)} Q${v.x+(j?65:-85)} ${v.y+30} ${v.x+(j?135:-115)} ${v.y+70}`} fill="none" stroke="#AD9673" strokeWidth="5" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-e(t,.8+i*.06,1.6)}/>)}
  {[0,1,2].map(j=>{const p=1-((t*.32+i*.11+j/3)%1),a=e(t,5.8+i*.02,.35);return <circle key={j} cx={bez(p,sx,sx,control,v.x)} cy={bez(p,850,950,v.y-35,v.y)} r={4+j} fill={C.cyan} opacity={a*.8}/>;})}
  <circle cx={v.x} cy={v.y} r={12+burst(t,350+i*6,1)*32} fill="none" stroke={C.gold} strokeWidth="2" opacity={burst(t,350+i*6,1)*.5}/>
 </g>;})}
 <path d="M920 864 C940 760 917 680 950 595 C978 520 942 466 965 380" fill="none" stroke="url(#trunk)" strokeWidth="86" strokeLinecap="round" pathLength="1" strokeDasharray="1" strokeDashoffset={1-cue(t,20,1.15)}/>
 <path d="M958 828 Q950 720 974 617" fill="none" stroke="#E4BC80" strokeWidth="7" opacity={.4*e(t,.5,1)}/>
 {clusters.map(([x,y],i)=><g key={i}><path d={`M958 ${670-i*10} Q${lerp(958,x,.35)} ${y+100} ${x} ${y}`} fill="none" stroke="#AD895E" strokeLinecap="round" strokeWidth={28-i%3*3} pathLength="1" strokeDasharray="1" strokeDashoffset={1-e(t,.55+i*.07,.9)}/>
  {Array.from({length:16},(_,j)=>{const a=rnd(i*30+j+90)*Math.PI*2,rr=Math.sqrt(rnd(i*30+j+8))*118,lx=x+Math.cos(a)*rr,ly=y+Math.sin(a)*rr*.65,sz=(40+rnd(i*30+j+35)*39)*e(t,1.1+i*.09+j*.014,.6);return <Leaf key={j} x={lx+Math.sin(t*.9+i+j*.7)*2} y={ly+Math.sin(t*.7+j)*1.6} r={sz} angle={Math.sin(j*12)*40+Math.sin(t*.8+j)*2} fill={['#397D55','#59A46B','#75BC7E','#9AD18A'][j%4]}/>;})}
 </g>)}
 {Array.from({length:28},(_,i)=>{const x=80+i*70,y=858+Math.sin(x*.006)*15;return <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t*1.5+i)*4})`}><path d="M0 0Q-8-30-24-34Q-11-8 0 0M0 0Q4-41 23-45Q20-18 0 0" fill={i%2?'#648D61':'#4C7654'}/></g>;})}
 </g>;}

function Pollen({t,amount=36}:{t:number;amount?:number}){return <g>{Array.from({length:amount},(_,i)=>{const x=(rnd(i+1000)*2050+t*(5+rnd(i)*12))%2050-65,y=80+rnd(i+77)*750+Math.sin(t*.5+i)*16;return <circle key={i} cx={x} cy={y} r={1.2+rnd(i+80)*2.4} fill={i%4?C.paper:C.gold} opacity={.14+rnd(i+83)*.27}/>;})}</g>;}

function Molecule({x,y,s=1,a=0,water=false}:{x:number;y:number;s?:number;a?:number;water?:boolean}){return <g transform={`translate(${x} ${y}) scale(${s}) rotate(${a})`}>
 <path d={water?'M-18 12L0 0L18 12':'M-24 0H24'} stroke={water?'#BCD9DC':'#C7B7A1'} strokeWidth="7"/>
 <circle r={water?14:13} fill={water?C.cyan:'#355B5B'}/><circle cx={water?-18:-24} cy={water?12:0} r={water?8:14} fill={water?'#D9EEEE':C.coral}/><circle cx={water?18:24} cy={water?12:0} r={water?8:14} fill={water?'#D9EEEE':C.coral}/>
 </g>;}

function LeafWorld({t}:{t:number}){const enter=e(t,9.55,.9),cut=e(t,11.85,.9),cellEnter=e(t,15.92,.9);return <g opacity={enter}>
 <rect width="1920" height="1080" fill="url(#micro)" opacity={e(t,10,.65)*.93}/>
 <Pollen t={t} amount={45}/>
 <g transform={`translate(${lerp(1120,960,enter)} ${lerp(430,470,enter)}) scale(${lerp(.04,1,enter)}) rotate(${lerp(-24,-9,enter)})`} opacity={1-cut}>
  <path d="M-690 10C-330-430 365-390 690-30C440 350-280 430-690 10Z" fill="url(#leaf)"/>
  <path d="M-780 40Q-20-10 675-29" stroke="#D9E8A2" strokeWidth="17" fill="none"/>
  {Array.from({length:12},(_,i)=>{const x=-580+i*99;return <g key={i} opacity=".63"><path d={`M${x} 10Q${x+70}-170 ${x+160} ${-130-Math.sin(i/12*Math.PI)*120}`} fill="none" stroke="#C8DEA0" strokeWidth="7"/><path d={`M${x} 10Q${x+140}180 ${x+210} ${100+Math.sin(i/12*Math.PI)*120}`} fill="none" stroke="#B9DCA1" strokeWidth="7"/></g>;})}
  {Array.from({length:18},(_,i)=>{const p=(t*.45+i*.06)%1;return <circle key={i} cx={-700+p*1320} cy={10-p*32} r={4} fill={C.cyan} opacity=".7"/>;})}
 </g>
 <g opacity={cut*(1-cellEnter*.7)} transform={`translate(0 ${lerp(70,0,cut)})`}>
  <path d="M280 293Q700 269 1640 290L1640 354Q900 334 280 356Z" fill="#D8EAB2"/>
  {Array.from({length:17},(_,i)=><g key={i} transform={`translate(${290+i*79} 297)`}><path d="M0 0Q36-12 73 0L73 49Q32 60 0 49Z" fill={i%2?'#C6DFB0':'#E0ECC1'} stroke="#82AE8D" strokeWidth="3"/></g>)}
  {Array.from({length:16},(_,i)=>{const y=356+Math.sin(i*.7)*6,p=cue(t,739+i*3,.52);return <g key={i} transform={`translate(${299+i*82} ${y+70*(1-p)}) scale(1 ${p})`} opacity={p}>
    <path d="M0 15Q0-3 29 0L44 0Q66-2 70 20L73 238Q61 263 36 263Q4 263 1 241Z" fill="url(#cell)" stroke="#5A8970" strokeWidth="3"/>
    {Array.from({length:9},(_,j)=><g key={j} transform={`translate(${j%2?52:20} ${22+j*26}) rotate(${22*Math.sin(j+i+t*.8)})`}><ellipse rx="14" ry="8" fill="#236D4E"/><path d="M-7-2H7M-7 2H7" stroke="#9BCB81" strokeWidth="2"/></g>)}
    <ellipse cx="36" cy="130" rx="14" ry="17" fill="#C4DAAA" opacity=".7"/>
  </g>;})}
  {Array.from({length:19},(_,i)=>{const x=300+i*69,y=674+(i%2)*54;return <g key={i} transform={`translate(${x} ${y+Math.sin(t+i)*3}) rotate(${i%2?19:-15})`}><path d="M-28-25Q5-50 44-20Q66 6 33 28Q-3 49-27 16Q-38 0-28-25Z" fill={i%2?'#6FA283':'#83B28E'} stroke="#A5C498" strokeWidth="3"/><circle cx="6" cy="-3" r="12" fill="#487F64"/></g>;})}
  <path d="M265 741C700 670 1090 823 1660 722" fill="none" stroke="#306F6D" strokeWidth="48"/>
  <path d="M265 731C700 660 1090 813 1660 712" fill="none" stroke={C.cyan} strokeOpacity=".6" strokeWidth="13"/>
  {Array.from({length:15},(_,i)=>{const p=(t*.2+i/15)%1;return <circle key={i} cx={bez(p,265,700,1090,1660)} cy={bez(p,731,660,813,712)} r={5} fill="#D3FFFF"/>;})}
  <path d="M280 829Q920 845 1640 824V866Q900 886 280 870Z" fill="#8CBD94"/>
  {[500,930,1370].map((x,i)=>{const open=.5+.5*Math.sin(t*2+i);return <g key={i} transform={`translate(${x} 855)`}>
   <ellipse rx={18+open*14} ry="19" fill="#123C37"/>
   <path d={`M${-13-open*13}-24C-70-55-71 51 ${-13-open*13} 28Q-31 0 ${-13-open*13}-24Z`} fill="#C2DF9C" stroke="#5D9573" strokeWidth="3"/>
   <path d={`M${13+open*13}-24C70-55 71 51 ${13+open*13}28Q31 0 ${13+open*13}-24Z`} fill="#C2DF9C" stroke="#5D9573" strokeWidth="3"/>
  </g>;})}
  {Array.from({length:12},(_,i)=>{const p=(t*.28+i*.093)%1;return <Molecule key={i} x={460+(i%3)*430+Math.sin(p*Math.PI*2+i)*30} y={lerp(1030,680,p)} s={.34} a={t*14+i*50}/>;})}
  {Array.from({length:10},(_,i)=>{const p=(t*.31+i*.113)%1;return <Molecule key={i} water x={510+(i%3)*430+Math.sin(p*Math.PI*2)*45} y={lerp(825,1040,p)} s={.24} a={t*20+i*30}/>;})}
  {Array.from({length:10},(_,i)=>{const p=(t*.34+i*.11)%1;return <path key={i} d={`M${470+i*110+p*70} ${40+p*400}l-12 17 20-2-13 17`} fill="none" stroke={C.gold} strokeWidth="4" opacity={Math.sin(p*Math.PI)*.7}/>;})}
 </g>
 <Chloroplast t={t} p={cellEnter}/>
 </g>;}

function Chloroplast({t,p}:{t:number;p:number}){return <g opacity={p}>
 <rect width="1920" height="1080" fill="#143E3C" opacity={p*.7}/>
 <g transform={`translate(${lerp(803,960,p)} ${lerp(435,520,p)}) scale(${lerp(.035,1,p)}) rotate(${lerp(-18,-4,p)})`}>
  <path d="M-670 0C-650-390 640-440 680-50C710 410-650 400-670 0Z" fill="#285F4E" stroke="#C0D996" strokeWidth="15"/>
  <path d="M-630 0C-590-343 586-372 637-45C650 347-594 355-630 0Z" fill="url(#chloro)" stroke="#609867" strokeWidth="8"/>
  {Array.from({length:6},(_,i)=>{const x=-450+i*180,y=(i%2?90:-75);return <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t*.7+i)*1.5})`}>
   <path d={`M-65 30Q20 ${i%2?110:-90} 190 ${i%2?-125:200}`} fill="none" stroke="#82C18D" strokeWidth="14"/>
   {Array.from({length:6},(_,j)=><g key={j} transform={`translate(0 ${j*14-42})`}><path d="M-70-8V5C-62 32 65 33 71 6V-8Z" fill="#3E8258"/><ellipse rx="71" ry="23" cy="-8" fill={j===5?'#6DB775':'#519965'} stroke="#A2D68A" strokeWidth="3"/></g>)}
  </g>;})}
  {Array.from({length:24},(_,i)=>{const a=t*.6+i*2.399;return <circle key={i} cx={Math.cos(a)*(110+rnd(i)*460)} cy={Math.sin(a)*(70+rnd(i+1)*200)} r={3+rnd(i+2)*5} fill={i%3?C.gold:C.cyan} opacity={.4+.3*Math.sin(t*2+i)}/>;})}
 </g>
 {Array.from({length:7},(_,i)=>{const a=(t*.33+i*.15)%1;return <Molecule key={i} water x={lerp(-80,390,a)} y={440+Math.sin(i)*180+Math.sin(t+i)*30} s={.65} a={t*18+i*40}/>;})}
 {Array.from({length:6},(_,i)=>{const a=(t*.23+i*.17)%1;return <g key={i} transform={`translate(${lerp(1520,2060,a)} ${340+i*85+Math.sin(t+i)*20}) rotate(${t*20+i*40})`}><path d="M-13 0H13" stroke="#D9A28B" strokeWidth="8"/><circle cx="-15" r="17" fill={C.coral}/><circle cx="15" r="17" fill={C.coral}/></g>;})}
 {Array.from({length:8},(_,i)=>{const a=(t*.31+i*.13)%1;return <g key={i} opacity={Math.sin(a*Math.PI)*.8} transform={`translate(${400+i*110+a*130} ${lerp(-80,280,a)})`}><path d="M0 0l-20 27h23l-19 26" fill="none" stroke={C.gold} strokeWidth="6" strokeLinecap="round"/></g>;})}
 </g>;}

function Study(){const f=useCurrentFrame(),t=f/FPS;const descend=cue(t,270,.95),ascend=cue(t,515,1.15);const y=25-460*descend+460*ascend;const zoom=1+.025*Math.sin(t*.15);const stage=t<4.5?'CANOPY':t<8.6?'ROOT NETWORK':t<12?'LEAF':t<16?'LIVING TISSUE':'CHLOROPLAST';return <AbsoluteFill style={{backgroundColor:'#143B3C'}}>
 <svg width="100%" height="100%" viewBox="0 0 1920 1080" style={{display:'block'}}>
  <Defs/>
  <g transform={`translate(${960*(1-zoom)} ${y}) scale(${zoom})`} opacity={1-e(t,10,.55)}><Background t={t}/><Tree t={t}/><Pollen t={t}/>
   {[0,1,2].map(i=><path key={i} d={`M${250+i*40+t*13} ${210+i*24}q15 ${-12+Math.sin(t*5+i)*7} 29 0q16 ${-12-Math.sin(t*5+i)*7} 30 0`} fill="none" stroke="#BDD7CA" strokeWidth="3" opacity=".45"/>)}
  </g>
  <LeafWorld t={t}/>
  <g fontFamily="Arial, sans-serif" fill={C.paper}><text x="76" y="73" fontSize="18" letterSpacing="4" opacity=".62">BOTANICAL / MOTION STUDY</text><text x="76" y="107" fontSize="24" letterSpacing="2" opacity=".88">{stage}</text><text x="76" y="1024" fontSize="15" letterSpacing="2" opacity=".5">ANIMATION &amp; SOUND TEST · NO NARRATION</text></g>
  <rect y="1076" height="4" width={1920*f/1199} fill={C.gold} opacity=".45"/>
 </svg>
 <Audio src={staticFile('audio/study-sound.wav')}/>
 </AbsoluteFill>;}
function Root(){return <Composition id="BotanicalMotionStudy" component={Study} width={3840} height={2160} fps={FPS} durationInFrames={1200}/>;}
registerRoot(Root);
