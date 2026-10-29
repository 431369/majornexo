import {ResumableVideoUpload} from './resumable-video-upload.js';
import {VoiceChat} from './voice.js?v=iris-chat-20261028';
const $=id=>document.getElementById(id),node=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
let state,projectId='',sourceId='',mode='',consent=false,previewUrl,selectedFile,busy=false,extra=[];
async function api(path='',data){const response=await fetch('/api/video-edits'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'content-type':'application/json','x-nexo-request':'1'},body:data===undefined?undefined:JSON.stringify(data)});const result=await response.json();if(!response.ok){const e=new Error(result.error??'Não foi possível concluir.');e.status=response.status;throw e;}return result;}
const notice=text=>{$('notice').textContent=text;};
function processing(){if(!mode){$('settings').showModal();throw Error('Escolha recursos locais ou IA integrada.');}if(mode==='local'&&!state.processing.localAvailable)throw Error('O motor deste computador ainda não está conectado.');if(mode==='ai'&&!consent)throw Error('Confirme o consumo do pacote de IA.');return {processingMode:mode,aiUsageConfirmed:consent};}
function message(role,text){const e=node('article',undefined,'message '+role);if(role==='assistant')e.append(node('span','Íris','message-label'));e.append(node('div',text));return e;}
function paint(){
 const projects=state.projects.slice().sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
 $('history').replaceChildren();for(const p of projects){const b=node('button',p.title);b.setAttribute('aria-current',String(projectId===p.id));b.onclick=()=>{if(uploader.running||uploader.id&&selectedFile&&$('attachment').hidden===false){notice('Conclua ou cancele o envio antes de trocar de conversa.');return;}select(p.id);};$('history').append(b);}
 $('welcome').hidden=!!projectId||extra.length>0;
 const log=$('messages');log.replaceChildren();
 const proposals=state.proposals.filter(p=>p.projectId===projectId).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)));
 for(const p of proposals){log.append(message('user',p.command),message('assistant',p.result.message));if(p.result.action==='render'||p.result.action==='preset'){
  const card=node('section',undefined,'proposal-card');card.append(node('strong',p.result.action==='render'?'Sua proposta de edição':'Alteração dos seus padrões'));
  if(p.result.clips){const ul=node('ul');for(const c of p.result.clips)ul.append(node('li',`${c.kind==='short'?'Short':'Vídeo'} · ${formatTime(c.start)} → ${formatTime(c.end)}`));card.append(ul);}
  if(p.result.preset){const list=node('p','Ajustes: '+Object.entries(p.result.preset).map(([k,v])=>k+': '+v).join(' · '));card.append(list);}
  if(p.status==='proposed'){const apply=node('button','Confirmar edição','primary');apply.onclick=()=>action(async()=>{await api('/apply',{id:p.id,confirm:true});notice('Edição na fila. Seus arquivos originais foram preservados.');await load();});card.append(apply);}else card.append(node('p','Proposta aplicada. Acompanhe a entrega abaixo.'));
  log.append(card);
 }}
 for(const item of extra)log.append(message(item.role,item.text));
 const outputs=state.assets.filter(a=>a.projectId===projectId),deliveries=$('deliveries');deliveries.replaceChildren();
 const jobs=state.jobs.filter(j=>j.projectId===projectId);for(const j of jobs){const card=node('section',undefined,'delivery');card.append(node('strong',({queued:'Edição na fila',running:'Editando seu vídeo',needs_review:'Pronto para sua revisão',failed:'A edição precisa de atenção',interrupted:'Execução interrompida',cancelled:'Edição cancelada'})[j.status]??j.status),node('p',`${j.completed??0} de ${j.clips.length} entregas`));if(j.error)card.append(node('p',j.error));if(['queued','running'].includes(j.status)){const b=node('button','Cancelar após o trecho atual','quiet');b.onclick=()=>action(async()=>{await api('/cancel',{id:j.id});await load();});card.append(b);}deliveries.append(card);}
 for(const a of outputs.filter(a=>!a.source&&a.kind==='video')){const card=node('section',undefined,'delivery');card.append(node('strong',a.name));const v=node('video');v.controls=true;v.playsInline=true;v.preload='metadata';v.src='/api/video-edits/asset?id='+encodeURIComponent(a.id);card.append(v);const review=node('a','Revisar esta versão ↗');review.href='/video-review?project='+encodeURIComponent(projectId);const download=node('a','Baixar vídeo');download.href=v.src+'&download=1';card.append(review,download);deliveries.append(card);}
 const originals=outputs.filter(a=>a.source);if(originals.length&&!sourceId)sourceId=originals[0].id;
 if(originals.length){const sources=node('details');sources.append(node('summary','Vídeos desta conversa'));for(const a of originals){const row=node('section',undefined,'delivery');row.append(node('p',a.name));const v=node('video');v.controls=true;v.playsInline=true;v.preload='none';v.src='/api/video-edits/asset?id='+encodeURIComponent(a.id);row.append(v);const select=node('button',a.id===sourceId?'Vídeo selecionado':'Usar este vídeo','quiet');select.onclick=()=>{sourceId=a.id;paint();notice('Vídeo selecionado: '+a.name);};row.append(select);sources.append(row);}deliveries.append(sources);}
 for(const turn of (state.voiceTurns??[]).filter(t=>t.projectId===projectId).sort((a,b)=>String(a.createdAt).localeCompare(String(b.createdAt)))){if(turn.user)log.append(message('user',turn.user));if(turn.assistant)log.append(message('assistant',turn.assistant));} 
 $('local-status').textContent=state.processing.localAvailable?'Motor local conectado. Você pode editar sem enviar a gravação inteira.':'Motor local não conectado. Abrir esta página não libera a CPU/GPU do aparelho.';
 $('local-actions').hidden=!state.processing.localAvailable;$('package-notice').textContent=state.processing.aiNotice;
 document.querySelector('input[name="mode"][value="local"]').disabled=!state.processing.localAvailable;
}
function formatTime(t){return [Math.floor(t/3600),Math.floor(t/60)%60,Math.floor(t%60)].map(v=>String(v).padStart(2,'0')).join(':');}
async function load(){state=await api();paint();}
function select(id){projectId=id;sourceId='';extra=[];document.body.classList.remove('sidebar-open');$('menu').setAttribute('aria-expanded','false');paint();}
async function ensureProject(){if(!projectId){const p=await api('/create',{title:selectedFile?.name.replace(/\.[^.]+$/,'').slice(0,120)||$('message').value.trim().slice(0,100)||'Nova conversa'});projectId=p.id;await load();}return projectId;}
async function action(fn){if(busy)return;busy=true;$('send').disabled=true;try{await fn();}catch(e){extra=extra.filter(m=>!m.text.endsWith('…'));extra.push({role:'assistant',text:e.message});if(state)paint();notice(e.message);}finally{busy=false;$('send').disabled=false;}}
const uploader=new ResumableVideoUpload({api,onProgress:p=>{projectId=p.projectId;$('upload-progress').value=100*p.received/p.total;const speed=p.speed?`${(p.speed/1024**2).toFixed(1)} MB/s`:'calculando velocidade';const eta=p.remainingSeconds===null?'':` · ~${Math.ceil(p.remainingSeconds/60)} min restantes`;$('upload-status').textContent=p.phase==='validating'?'Transferência concluída. Conferindo o arquivo…':`${Math.floor(100*p.received/p.total)}% · ${speed}${eta}`;}});
async function uploadFile(){
 $('pause-upload').hidden=false;$('resume-upload').hidden=true;$('upload-status').textContent='Preparando envio…';
 try{const asset=await uploader.start(selectedFile,ensureProject);if(!asset){$('upload-status').textContent='Envio pausado. Os blocos recebidos estão preservados.';$('resume-upload').hidden=false;return;}projectId=asset.projectId;sourceId=asset.id;uploader.id=null;$('pause-upload').hidden=true;$('cancel-upload').hidden=true;$('upload-status').textContent='Arquivo recebido e verificado. Pronto para editar.';await load();notice('Vídeo pronto. Me conte o que você quer editar.');}
 catch(e){$('upload-status').textContent=e.message+' Selecione Retomar para continuar.';$('resume-upload').hidden=false;}
 finally{$('pause-upload').hidden=true;}
}
$('attach').onclick=()=>$('file').click();
async function selectFile(file){
 if(!file)return;
 if(uploader.running||uploader.id){notice('Conclua ou cancele o envio atual antes de anexar outro.');return;}
 selectedFile=file;if(previewUrl)URL.revokeObjectURL(previewUrl);previewUrl=URL.createObjectURL(file);
 $('attachment').hidden=false;$('file-name').textContent=file.name;$('cancel-upload').hidden=false;
 const image=file.type.startsWith('image/');$('local-preview').hidden=image;$('image-preview').hidden=!image;
 if(image)$('image-preview').src=previewUrl;else $('local-preview').src=previewUrl;
 $('preview-label').textContent='Prévia local · ainda não significa envio concluído';
 await uploadFile();
}
$('file').onchange=()=>selectFile($('file').files[0]);
document.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault();});
document.addEventListener('drop',e=>{if(e.dataTransfer?.files.length){e.preventDefault();selectFile(e.dataTransfer.files[0]);}});
$('message').addEventListener('paste',e=>{const file=[...e.clipboardData.items].find(i=>i.kind==='file')?.getAsFile();if(file){e.preventDefault();selectFile(file);}});
$('local-preview').onerror=()=>{$('preview-label').textContent='Este navegador não reproduz a prévia deste formato. O envio continua disponível.';};
$('pause-upload').onclick=()=>{uploader.pause();notice('Pausando envio. Os blocos já recebidos serão reaproveitados.');};
$('resume-upload').onclick=uploadFile;
$('cancel-upload').onclick=async()=>{try{await uploader.cancel();uploader.id=null;selectedFile=null;$('attachment').hidden=true;if(previewUrl){URL.revokeObjectURL(previewUrl);previewUrl=null;}notice('Envio cancelado. O original permanece no seu aparelho.');}catch(e){notice(e.message);}};
$('composer').onsubmit=e=>{e.preventDefault();action(async()=>{const input=processing(),command=$('message').value.trim();if(!command)return;if(uploader.running||uploader.id)throw Error('Você pode escrever enquanto o vídeo sobe. Aguarde a verificação antes de enviar a edição.');await ensureProject();extra=[{role:'user',text:command},{role:'assistant',text:input.processingMode==='ai'?'Preparando a proposta com sua IA…':'Preparando o corte sem usar IA…'}];paint();const p=await api('/chat',{projectId,sourceId:sourceId||undefined,command,...input});extra=[];$('message').value='';await load();notice(p.result.message);$('conversation').scrollTop=$('conversation').scrollHeight;});};
$('message').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();$('composer').requestSubmit();}};
$('new-chat').onclick=()=>{if(uploader.running||uploader.id){notice('Conclua ou cancele o envio antes de abrir outra conversa.');return;}selectedFile=null;$('attachment').hidden=true;if(previewUrl)URL.revokeObjectURL(previewUrl);select('');$('message').focus();};
for(const b of document.querySelectorAll('[data-prompt]'))b.onclick=()=>{$('message').value=b.dataset.prompt;$('message').focus();};
$('history-close').onclick=()=>{document.body.classList.remove('sidebar-open');$('menu').setAttribute('aria-expanded','false');};
$('menu').onclick=()=>{$('menu').setAttribute('aria-expanded',String(document.body.classList.toggle('sidebar-open')));};
for(const id of ['mode-open','settings-open'])$(id).onclick=()=>$('settings').showModal();
$('settings-close').onclick=()=>$('settings').close();
$('mode-save').onclick=()=>{const selected=document.querySelector('input[name="mode"]:checked')?.value;if(!selected){notice('Escolha uma opção.');return;}if(selected==='ai'&&!$('ai-consent').checked){notice('Confirme o consumo do pacote.');return;}mode=selected;consent=selected==='ai'&&$('ai-consent').checked;$('mode-open').textContent=mode==='ai'?'IA integrada ⌄':'Recursos locais ⌄';$('settings').close();notice(mode==='ai'?'IA selecionada. Seus pedidos consumirão a cota conectada.':'Modo local selecionado. Nenhuma API de IA será chamada.');};
for(const radio of document.querySelectorAll('input[name="mode"]'))radio.onchange=()=>{$('ai-consent').checked=false;};
$('pick-local').onclick=()=>action(async()=>{const p=await api('/local/pick',{});if(p.cancelled)return;if(!confirm('Vincular esta gravação finalizada? O original não será alterado.'))return;await ensureProject();const a=await api('/local/import',{projectId,path:p.path,confirm:true});sourceId=a.id;extra=[{role:'assistant',text:'Gravação vinculada sem upload: '+a.name}];await load();$('settings').close();});
const voice=new VoiceChat({button:$('speak'),status:$('notice'),input:$('message'),canSend:()=>{try{if(processing().processingMode!=='ai')throw Error('A conversa por voz em tempo real consome IA. Selecione IA integrada para usá-la.');if(!projectId)throw Error('Anexe um vídeo ou envie sua primeira mensagem antes de abrir a voz.');if(!state.connection.connected)throw Error('Conecte sua IA nas Opções para usar a voz.');return true;}catch(e){notice(e.message);return false;}},voiceControl:()=>api('/voice/control',processing()),liveStart:resume_handle=>api('/voice/live',{resume_handle,...processing()}),liveTool:async data=>{const r=await api('/voice/tool',{...data,projectId,sourceId,...processing()});await load();return r;},liveRecord:data=>api('/voice/turn',{...data,projectId}),onTurn:()=>{load().catch(e=>notice(e.message));}});
voice.dialog.querySelector('h2').textContent='Conversar com a Íris';
setInterval(()=>{if(!document.hidden&&!busy&&!uploader.running&&state?.jobs.some(j=>['queued','running','cancel_requested'].includes(j.status)))load().catch(e=>notice(e.message));},4000);
window.addEventListener('beforeunload',()=>{uploader.pause();if(previewUrl)URL.revokeObjectURL(previewUrl);});
load().catch(e=>notice(e.message));
