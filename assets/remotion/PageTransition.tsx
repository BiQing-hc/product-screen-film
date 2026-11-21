// Motion adapted from Video Shotcraft, Apache-2.0: CircleMatchIris and
// BottomPushStackWipe. See the accompanying LICENSE-Video-Shotcraft.
import React from 'react';
import {Easing} from 'remotion';

export type PagePoint = readonly [number, number]; // normalized picture-space coordinates
export type PageEffect = 'match-iris' | 'map-pullback' | 'sheet-lift';
export type PageEffectSpec = {
  effect:PageEffect; frames:number; source?:PagePoint; target?:PagePoint; axis?:'x'|'y';
};
type Props = {before:React.ReactNode; after:React.ReactNode; frame:number;
  spec:PageEffectSpec; width:number; height:number; accent?:string};
const span=(t:number,a:number,b:number)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const smooth=Easing.bezier(.4,0,.14,1);
const heavy=Easing.bezier(.16,.84,.20,1);
const accelerate=Easing.bezier(.42,0,.72,.39);
const full:React.CSSProperties={position:'absolute',inset:0,overflow:'hidden'};

function MatchedIris({before,after,frame,spec,width:w,height:h,accent}:Props){
 const t=frame/(spec.frames-1), a=spec.source??[.5,.5], b=spec.target??a;
 const travel=smooth(span(t,.10,.80));
 const x=mix(a[0],b[0],travel)*w,y=mix(a[1],b[1],travel)*h;
 const far=Math.hypot(Math.max(x,w-x),Math.max(y,h-y));
 // As in CircleMatchIris, the leading ring opens first and the accelerating matte overtakes it.
 const ring=w*(.011+.125*heavy(span(t,.06,.66)));
 const radius=(ring+far*accelerate(span(t,.25,.83)))*smooth(span(t,0,.14));
 const rimAlpha=smooth(span(t,.015,.16))*(1-smooth(span(t,.62,.83)));
 const targetScale=mix(.65,1,heavy(span(t,.03,.86)));
 return <>
  <div style={{...full,transformOrigin:`${a[0]*100}% ${a[1]*100}%`,transform:`scale(${1+.11*travel})`,filter:`brightness(${1-.14*travel})`}}>{before}</div>
  <div style={{...full,clipPath:`circle(${radius}px at ${x}px ${y}px)`}}>
   <div style={{...full,transformOrigin:`${b[0]*100}% ${b[1]*100}%`,transform:`translate(${x-b[0]*w}px,${y-b[1]*h}px) scale(${targetScale})`}}>{after}</div>
  </div>
  <svg width={w} height={h} style={{...full,pointerEvents:'none',opacity:rimAlpha}} aria-hidden>
   <circle cx={x} cy={y} r={radius} fill="none" stroke="#13453b" strokeWidth={w*.0026} opacity=".54"/>
   <circle cx={x} cy={y} r={radius+1} fill="none" stroke={accent} strokeWidth={w*.0014}/>
   <circle cx={x} cy={y} r={Math.max(0,radius-w*.006)} fill="none" stroke="white" strokeWidth="1.2" opacity=".73"/>
  </svg>
 </>;
}

function MapPullback({before,after,frame,spec,width:w,height:h,accent}:Props){
 const t=frame/(spec.frames-1),a=spec.source??[.5,.5],b=spec.target??[.57,.7];
 const pull=smooth(span(t,0,.9)), land=smooth(span(t,.15,.98));
 const sx=a[0]*w,sy=a[1]*h;
 const scale=mix(1,.135,pull),x=(b[0]-a[0])*w*pull,y=(b[1]-a[1])*h*pull;
 const opacity=1-smooth(span(t,.58,.89)),rotation=3.3*Math.sin(Math.PI*pull);
 const rectStyle:React.CSSProperties={position:'absolute',inset:0,transformOrigin:`${sx}px ${sy}px`,transform:`translate(${x}px,${y}px) perspective(${w*1.5}px) rotateY(${-rotation}deg) rotateZ(${rotation*.48}deg) scale(${scale})`,opacity,borderRadius:20*pull,overflow:'hidden',boxShadow:`0 ${22*pull}px ${70*pull}px rgba(10,36,41,.45)`};
 const wave=span(t,.56,.98), alpha=Math.sin(wave*Math.PI)*.83;
 return <>
  <div style={{...full,transformOrigin:`${b[0]*100}% ${b[1]*100}%`,transform:`scale(${mix(1.15,1,land)})`,filter:`brightness(${mix(.86,1,land)}) blur(${3*(1-land)}px)`}}>{after}</div>
  <div style={rectStyle}>{before}<div style={{...full,borderRadius:'inherit',boxShadow:`inset 0 0 0 ${4*pull}px rgba(242,255,248,.86)`}}/></div>
  {alpha>.01&&<svg width={w} height={h} style={full} aria-hidden><circle cx={b[0]*w} cy={b[1]*h} r={w*(.018+.046*wave)} stroke={accent} strokeWidth={2.5} fill="none" opacity={alpha}/></svg>}
 </>;
}

function SheetLift({before,after,frame,spec,width:w,height:h}:Props){
 const t=frame/(spec.frames-1), horizontal=spec.axis==='x',size=horizontal?w:h;
 // The two faces share one travel curve; the trailing shadow follows their common edge.
 const velocityCurve=(v:number)=>smooth(span(v,.055,.91));
 const p=velocityCurve(t),speed=(p-velocityCurve(Math.max(0,t-1/(spec.frames-1))))*size;
 const dist=(1-p)*size,depth=Math.sin(p*Math.PI),motionBlur=Math.min(3.4,speed*.020);
 const translate=(v:number)=>horizontal?`translateX(${v}px)`:`translateY(${v}px)`;
 const shadow=horizontal?'-18px 0 48px -6px':'0 -18px 48px -6px';
 return <>
  <div style={{...full,transform:`${translate(-p*size*.12)} scale(${1+.042*p})`,filter:`brightness(${1-.13*p})`}}>{before}</div>
  {p>0&&p<1&&[1,2].map(layer=><div key={layer} style={{...full,background:layer===1?'#adc8c0':'#e4eee9',transform:translate(dist-(3-layer)*9*depth),boxShadow:`${shadow} rgba(26,47,45,.12)`}}/>)}
  <div style={{...full,transform:translate(dist),boxShadow:`${shadow} rgba(23,47,42,${depth*.36})`}}>
   <div style={{...full,transformOrigin:horizontal?'0% 50%':'50% 0%',transform:`scale(${1+.025*depth})`,filter:motionBlur>.15?`blur(${motionBlur}px)`:undefined}}>{after}</div>
  </div>
 </>;
}
export const PageTransition:React.FC<Props>=props=>{
 const {frame,spec,width,height,accent='#8ce1c3',before,after}=props;
 if(frame<=0)return <>{before}</>;
 if(frame>=spec.frames-1)return <>{after}</>;
 const params={...props,accent};
 return <div style={{position:'absolute',left:0,top:0,width,height,overflow:'hidden',isolation:'isolate',background:'#d9e6e1'}}>
 {spec.effect==='match-iris'?<MatchedIris {...params}/>:spec.effect==='map-pullback'?<MapPullback {...params}/>:<SheetLift {...params}/>}
 </div>;
};
