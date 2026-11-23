import React, {useState, useEffect, useRef} from 'react';
import {createRoot, Root} from 'react-dom/client';
import {flushSync} from 'react-dom';
import sceneData from './scenes.json';

/** SVG primitives are data, never HTML fragments. Coordinates preserve paper topology. */
export type Primitive = string | {tag:string; attrs:Record<string,string|number>; children:Primitive[]};
export interface Module {title:string; description:string; op:string[]; shapes:Primitive[]; transform?:string}
export interface Connection {a:number; b:number; d:string}
export interface Scene {width:number; height:number; groups:Module[]; links:Connection[]; decor:Primitive[]}
export type Topic = 'redes'|'cnn'|'transformer'|'bert'|'vit'|'clip'|'llms';
export interface DiagramProps {id:Topic; mode:'paper'|'lab'; selected:number; backward:boolean; title:string; source?:string; sourceLabel?:string; onSelect:(index:number)=>void}
const scenes=sceneData as Record<Topic,Record<'paper'|'lab',Scene>>;
const order:Partial<Record<Topic,number[]>>={transformer:[0,2,4,5,6,7,1,3,8,9,10,11,12,13,14,15],vit:[0,1,2,3,7,8,9,10,11,12,4,5,6],clip:[0,1,5,2,3,6,4,7,8,9,10,11,12],llms:[7,0,1,2,3,4,5,6]};
function Shapes({items}:{items:Primitive[]}) {return <>{items.map((s,i)=>typeof s==='string'?s:React.createElement(s.tag,{...s.attrs,key:i},s.children.length?<Shapes items={s.children}/>:undefined))}</>}
function Layer({module,index,selected,related}:{module:Module;index:number;selected:number;related?:boolean}) {
 return <g tabIndex={0} role="button" aria-label={module.title} aria-pressed={selected===index} data-module={index} transform={module.transform} className={`interactive-node ${selected===index?'active':selected<0?'':related?'related':'dim'}`}><title>{module.title+' — '+module.description}</title><Shapes items={module.shapes}/></g>;
}
function Edge({edge,selected,backward,moving}:{edge:Connection;selected:number;backward:boolean;moving:boolean}) {
 const active=selected===edge.a||selected===edge.b;
 return <g opacity={selected<0||active?1:.35} className="atlas-connection"><path d={edge.d} fill="none" stroke={backward?'#bba2d0':'#83a5b0'} strokeWidth={1.8} markerStart={backward?'url(#atlas-arrow-back)':undefined} markerEnd={backward?undefined:'url(#atlas-arrow-forward)'}/>{active&&moving&&<path className="atlas-flow" d={edge.d} fill="none" stroke={backward?'#cfb5ff':'#76f4db'} strokeWidth={2.5}/>}</g>;
}
function downloadSource(){const data=document.getElementById('atlas-source')?.textContent?.trim();if(!data)return;const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0)),url=URL.createObjectURL(new Blob([bytes],{type:'application/zip'})),a=document.createElement('a');a.href=url;a.download='Atlas_React_TypeScript.zip';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function Architecture(props:DiagramProps) {
 const {id,mode,selected,backward,onSelect}=props,scene=scenes[id][mode];
 const [zoom,setZoom]=useState(1),[moving,setMoving]=useState(true);
 const scroll=useRef<HTMLDivElement>(null);
 useEffect(()=>{setZoom(1);if(scroll.current)scroll.current.scrollLeft=0},[id,mode]);
 const sequence=mode==='paper'?(order[id]||scene.groups.map((_,i)=>i)):scene.groups.map((_,i)=>i);
 const route=backward?[...sequence].reverse():sequence,pos=route.indexOf(selected);
 const step=(delta:number)=>onSelect(route[Math.max(0,Math.min(route.length-1,pos<0?0:pos+delta))]);
 const current=scene.groups[selected];
 return <section className="atlas-diagram" aria-label="Exploração da arquitetura">
  <div className="atlas-toolbar">
   <div><span className="atlas-overline">{mode==='paper'?'Topologia do artigo':'Percurso didático'} · {backward?'gradientes':'ativações'}</span><strong>{props.title}</strong></div>
   <div className="atlas-tools"><button type="button" onClick={()=>setMoving(v=>!v)} aria-pressed={moving} title="Animação das conexões">{moving?'Pausar fluxo':'Animar fluxo'}</button><button type="button" aria-label="Diminuir diagrama" disabled={zoom<=.8} onClick={()=>setZoom(z=>Math.max(.8,+(z-.2).toFixed(1)))}>−</button><button type="button" onClick={()=>setZoom(1)} title="Restaurar escala">{Math.round(zoom*100)}%</button><button type="button" aria-label="Ampliar diagrama" disabled={zoom>=1.8} onClick={()=>setZoom(z=>Math.min(1.8,+(z+.2).toFixed(1)))}>+</button></div>
  </div>
  <div className="paper-scroll atlas-viewport" ref={scroll} style={{'--figure-min':`${Math.round(scene.width*.83*zoom)}px`} as React.CSSProperties}>
   <svg className={`paper-svg atlas-svg ${backward?'back':''}`} viewBox={`0 0 ${scene.width} ${scene.height}`} style={{width:`${zoom*100}%`}} role="group" aria-label={props.title} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();(window as any).AtlasUX?.move(e.key==='ArrowRight'?1:-1)}}}>
    <defs>{['forward','back'].map((dir,i)=><marker key={dir} id={`atlas-arrow-${dir}`} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill={i?'#bba2d0':'#83a5b0'}/></marker>)}</defs>
    <g opacity={selected<0?1:.65}><Shapes items={scene.decor}/></g>
    {scene.links.map((edge,i)=><Edge key={i} edge={edge} selected={selected} backward={backward} moving={moving}/>)}
    {scene.groups.map((module,i)=><Layer key={i} module={module} index={i} selected={selected} related={scene.links.some(e=>(e.a===selected&&e.b===i)||(e.b===selected&&e.a===i))}/>)}
   </svg>
  </div>
  <footer className="atlas-figure-footer"><span>{current?current.description:'Clique nas camadas para ver entrada → cálculo → saída. Use Tab e Enter ou as setas do teclado.'}</span>{props.source&&<a href={props.source} target="_blank" rel="noopener">{props.sourceLabel} ↗</a>}<details><summary>Fonte e código</summary><button type="button" onClick={downloadSource}>Código React + TS ↓</button></details></footer>
 </section>;
}
const roots=new WeakMap<HTMLElement,Root>();
function render(host:HTMLElement,props:DiagramProps) {let root=roots.get(host);if(!root){root=createRoot(host);roots.set(host,root)}const active=document.activeElement as HTMLElement|null;const focused=host.contains(active)?active?.dataset.module:undefined;flushSync(()=>root!.render(<Architecture {...props}/>));if(focused)host.querySelector<SVGGElement>(`[data-module="${focused}"]`)?.focus({preventScroll:true})}
(window as any).AtlasDiagram={render,scenes};
