window.AtlasUX=(()=>{
 let phase='input',free=false,changing=false,id='',pane='diagram';
 const ordered={transformer:[0,2,4,5,6,7,1,3,8,9,10,11,12,13,14,15],vit:[0,1,2,3,7,8,9,10,11,12,4,5,6],clip:[0,1,5,2,3,6,4,7,8,9,10,11,12],llms:[7,0,1,2,3,4,5,6]};
 const goals={redes:'Acompanhe como representações de pessoa e relação se combinam para prever uma relação familiar.',cnn:'Veja uma imagem passar pelos filtros, pela redução espacial e pela leitura de classe.',transformer:'Acompanhe a fonte no encoder e os tokens de alvo no decoder até a distribuição do próximo token.',bert:'Observe como o contexto bidirecional permite prever um token mascarado.',vit:'Veja a imagem virar patches, formar uma sequência e produzir probabilidades de classe.',clip:'Acompanhe os ramos de imagem e texto até a comparação no espaço de embeddings.',llms:'Observe os tokens do contexto produzirem uma distribuição para o próximo token.'};
 const names={input:'1 · Entrada',flow:'2 · Transformações',result:'3 · Saída',loss:'4 · Perda',gradient:'5 · Gradientes'};
 const group=()=>diagramView==='paper'?paperPick:focus;
 function route(){const seq=diagramView==='paper'?(ordered[topic.id]||paperFigure().groups.map((_,i)=>i)):topic.steps.map((_,i)=>i);return back?[...seq].reverse():seq}
 function save(){if(!id)return;try{localStorage.setItem('atlas-percurso-'+id,JSON.stringify({phase,free,view:diagramView,group:group(),back,alt:numericWalk.snapshot().alt}))}catch{}}
 function select(i){changing=true;choose(i);changing=false;refresh()}
 function selected(){if(!changing){phase=back?'gradient':'flow'}}
 function enter(nextId){id=nextId;phase='input';free=false;back=false;pane='diagram';$('ux-options').open=false;$('ux-prediction').value='';refresh()}
 function goto(next){manual();phase=next;free=false;if(next==='result'||next==='loss')pane='calc';back=next==='gradient';numericWalk.reset();if(next==='flow'||next==='gradient')select(route()[0]);else {changing=true;draw();changing=false}refresh()}
 function move(delta){manual();if(phase==='input'){if(delta>0)goto('flow');return}
  if(phase==='result'){goto(delta>0?'loss':'flow');if(delta<0)select(route().at(-1));return}
  if(phase==='loss'){goto(delta>0?'gradient':'result');return}
  const seq=route(),pos=seq.indexOf(group()),at=pos+delta;
  if(at<0){goto(back?'loss':'input');return}
  if(at>=seq.length){if(back)window.AtlasStudio.show('experiment');else goto('result');return}
  select(seq[at]);
 }
 function resume(){let state;try{state=JSON.parse(localStorage.getItem('atlas-percurso-'+id))}catch{}if(!state)return;numericWalk.change(state.alt===1?1:0);free=!!state.free;phase=Object.hasOwn(names,state.phase)?state.phase:'input';diagramView=state.view==='lab'?'lab':'paper';back=!!state.back;const total=diagramView==='paper'?paperFigure().groups.length:topic.steps.length;if(Number.isInteger(state.group)&&state.group>=0&&state.group<total)select(state.group);else draw();refresh()}
 function refresh(){if(!id||id!==topic.id)return;
  const entry=$('ux-entry'),example=$('nw-example'),seq=route(),pos=seq.indexOf(group());
  let previous=null;try{previous=JSON.parse(localStorage.getItem('atlas-percurso-'+id))}catch{}
  const bridge=topic.id==='transformer'&&group()===1?'A memória do encoder está pronta. Agora o decoder recebe os tokens do alvo deslocados.':topic.id==='clip'&&group()===2?'O ramo textual já foi projetado. Agora acompanhe o ramo visual até o espaço compartilhado.':'';
  entry.innerHTML='<div class="ux-heading"><div><span class="eyebrow">'+(free?'Exploração livre':names[phase])+'</span><h2>'+(phase==='input'?'O que acontece com este dado?':phase==='result'?'Como interpretar a saída?':phase==='loss'?'Qual erro orienta o aprendizado?':phase==='gradient'?'Como a perda influencia cada camada?':'Acompanhe o exemplo pela arquitetura')+'</h2><p>'+esc(bridge||goals[topic.id])+'</p></div>'+(phase==='input'&&previous&&previous.phase!=='input'?'<button id="ux-resume">Retomar estudo</button>':'')+'</div>';
  entry.append(example);
  if(phase==='input'){const input=document.createElement('div');input.className='ux-input-data';input.innerHTML='<p>Exemplo reduzido com pesos ilustrativos fixos. Estes valores são a entrada da execução que você acompanhará.</p>'+numericWalk.overview('input');entry.append(input);math(input)}
  const overview=phase==='result'||phase==='loss';
  $('ux-work').hidden=phase==='input';
  if(overview){$('theory').innerHTML='<div class="eyebrow">'+names[phase]+'</div><h3>'+(phase==='loss'?'Objetivo da execução':'Saída usada pelo objetivo')+'</h3><section class="nw-panel">'+numericWalk.overview(phase)+'<p>'+(phase==='loss'?'Esta perda escalar é o ponto de partida da retropropagação. O próximo passo acompanha suas derivadas pelas operações já calculadas.':'Os valores vêm da mesma execução que percorreu as camadas. Com pesos ilustrativos, a distribuição demonstra o mecanismo; não representa a qualidade de um modelo treinado.')+'</p></section>';math($('theory'))}
  $('ux-free').textContent=free?'Voltar ao percurso':'Explorar livremente';
  const progress=$('ux-progress');progress.innerHTML='<button id="ux-prev" '+(phase==='input'?'disabled':'')+'>← Voltar</button><div><span>'+(free?'Exploração livre':names[phase])+'</span><strong>'+(phase==='flow'||phase==='gradient'?'Camada '+Math.max(1,pos+1)+' de '+seq.length:phase==='input'?'Conheça os dados antes de calcular':phase==='result'?'Leia o significado dos valores':'Da previsão ao objetivo')+'</strong><progress max="'+(seq.length+4)+'" value="'+(phase==='input'?0:phase==='flow'?pos+1:phase==='result'?seq.length+1:phase==='loss'?seq.length+2:seq.length+3)+'"></progress></div><button id="ux-next" class="primary">'+(phase==='input'?'Percorrer o exemplo →':phase==='result'?'Entender a perda →':phase==='loss'?'Acompanhar gradientes →':pos===seq.length-1?(back?'Experimentar →':'Interpretar saída →'):'Próxima etapa →')+'</button>';
  $('ux-prev').onclick=()=>move(-1);$('ux-next').onclick=()=>move(1);$('ux-resume')?.addEventListener('click',resume);
  $('ux-work').dataset.pane=pane;document.querySelector('.ux-mobile').hidden=phase==='input';document.querySelectorAll('[data-ux-pane]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.uxPane===pane)));
  if(phase!=='input')save();
 }
 $('ux-free').onclick=()=>{manual();free=!free;phase=back?'gradient':'flow';$('ux-options').open=free;if(group()<0)select(route()[0]);else refresh()};
 document.querySelectorAll('[data-ux-pane]').forEach(button=>button.onclick=()=>{pane=button.dataset.uxPane;$('inspector').open=true;refresh()});
 // Different diagram views share the conceptual step, with a disclosed reduced execution.
 function switchView(view){manual();const old=group(),wasLab=diagramView==='lab';let target=old;
  if(wasLab&&view==='paper')target=numericWalk.map[topic.id][Math.max(0,old)]?.[0]??0;
  if(!wasLab&&view==='lab')target=numericWalk.map[topic.id].findIndex(ids=>ids.includes(old));
  diagramView=view;const count=view==='paper'?paperFigure().groups.length:topic.steps.length;target=Math.max(0,Math.min(count-1,target));numericWalk.reset();select(target)}
 $('fig-paper').onclick=()=>switchView('paper');$('fig-lab').onclick=()=>switchView('lab');
 return {enter,refresh,selected,move,complete(){if(!back)goto('result')},goto};
})();
