export const $=id=>document.getElementById(id);
export const node=(tag,text,className)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n;};
export async function api(path='',data){const r=await fetch('/api/video-edits'+path,{method:data===undefined?'GET':'POST',headers:data===undefined?{}:{'content-type':'application/json','x-nexo-request':'1'},body:data===undefined?undefined:JSON.stringify(data)});const d=await r.json();if(!r.ok)throw Error(d.error??'Operação não concluída.');return d;}
export const notify=message=>{$('notice').textContent=message;window.dispatchEvent(new CustomEvent('lifa-voice-message',{detail:String(message)}));};
export function time(value){if(/^\d+(?:\.\d+)?$/.test(value))return Number(value);const p=value.split(':').map(Number);if(p.length<2||p.length>3||p.some(n=>!Number.isFinite(n)||n<0)||p.slice(1).some(n=>n>=60))throw Error('Use HH:MM:SS ou segundos.');return p.reduce((v,n)=>v*60+n,0);}
export function voice(button,field,onCommand){
 const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;
 const dialog=node('dialog',undefined,'voice-dialog');dialog.setAttribute('aria-labelledby','voice-dialog-title');
 const heading=node('div',undefined,'section-heading'),title=node('h2','Converse com a Lifa');title.id='voice-dialog-title';
 const close=node('button','Fechar ✕','secondary');close.type='button';heading.append(title,close);
 const orb=node('div','✳','voice-orb');orb.setAttribute('aria-hidden','true');
 const status=node('p','Pronta para ouvir.','voice-state');status.setAttribute('role','status');
 const history=node('div',undefined,'voice-conversation');history.setAttribute('role','log');history.setAttribute('aria-live','polite');
 const transcript=node('textarea');transcript.rows=3;transcript.setAttribute('aria-label','Seu comando por voz ou texto');transcript.placeholder='Fale ou escreva seu pedido…';
 const controls=node('div',undefined,'voice-controls'),listen=node('button','🎙 Falar'),stop=node('button','Parar de ouvir','secondary'),send=node('button','Enviar comando');
 for(const b of [listen,stop,send])b.type='button';controls.append(listen,stop,send);
 const audioLabel=node('label',undefined,'voice-audio'),audio=node('input');audio.type='checkbox';audio.checked=true;audioLabel.append(audio,document.createTextNode(' Ouvir as respostas da Lifa'));
 const hint=node('small','Sua fala é enviada à IA conectada à sua conta para transcrição. A Lifa prepara propostas. Diga “confirmar proposta” somente depois de revisar o pedido.');
 dialog.append(heading,orb,status,history,transcript,controls,audioLabel,hint);document.body.append(dialog);
 let recognition=null,active=false;
 function line(who,text){const item=node('p');item.append(node('strong',who+' '),document.createTextNode(text));history.append(item);history.scrollTop=history.scrollHeight;}
 function endListening(){active=false;orb.classList.remove('listening');listen.disabled=!navigator.mediaDevices?.getUserMedia;stop.disabled=true;}
 function halt(){recordingEpoch++;finishCapture(true);recognition?.abort();endListening();window.speechSynthesis?.cancel();}
 function submit(){const text=transcript.value.trim();if(!text)return;recognition?.abort();endListening();field.value=text;line('Você:',text);status.textContent='A Lifa está preparando sua resposta…';onCommand?.(text);}
 let capture=null,recordingEpoch=0,recordingBusy=false;
 async function finishCapture(cancel=false){
  if(!capture)return;const c=capture;capture=null;clearTimeout(c.timer);c.processor.disconnect();c.source.disconnect();c.gain.disconnect();c.stream.getTracks().forEach(t=>t.stop());await c.context.close();endListening();if(cancel||!dialog.open)return;
  status.textContent='Transcrevendo com sua IA…';listen.disabled=true;recordingBusy=true;
  try{const length=c.chunks.reduce((n,a)=>n+a.length,0);if(!length)throw Error('Nenhum áudio capturado.');const pcm=new Float32Array(length);let offset=0;for(const a of c.chunks){pcm.set(a,offset);offset+=a.length;}
   const count=Math.floor(length*16000/c.rate),buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer);const word=(i,t)=>{for(let n=0;n<t.length;n++)v.setUint8(i+n,t.charCodeAt(n));};word(0,'RIFF');v.setUint32(4,36+count*2,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,count*2,true);for(let i=0;i<count;i++){const x=Math.max(-1,Math.min(1,pcm[Math.floor(i*c.rate/16000)]));v.setInt16(44+i*2,x<0?x*32768:x*32767,true);}let binary='';for(const byte of new Uint8Array(buffer))binary+=String.fromCharCode(byte);
   const result=await api('/ai/transcribe',{audio:btoa(binary)});if(dialog.open&&c.epoch===recordingEpoch){transcript.value=result.text;submit();}
  }catch(e){if(dialog.open)status.textContent=e.message;}finally{recordingBusy=false;listen.disabled=false;}
 }
 async function start(){
  if(active||recordingBusy)return;if(!navigator.mediaDevices?.getUserMedia){status.textContent='Microfone indisponível. Você pode escrever nesta janela.';return;}
  const epoch=++recordingEpoch;active=true;listen.disabled=true;status.textContent='Abrindo o microfone…';window.speechSynthesis?.cancel();document.querySelectorAll('video,audio').forEach(m=>m.pause());let stream,context;
  try{stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});if(!dialog.open||epoch!==recordingEpoch){stream.getTracks().forEach(t=>t.stop());return;}
   context=new AudioContext();await context.resume();const source=context.createMediaStreamSource(stream),processor=context.createScriptProcessor(4096,1,1),gain=context.createGain();gain.gain.value=0;const c={stream,context,source,processor,gain,chunks:[],rate:context.sampleRate,epoch};capture=c;processor.onaudioprocess=e=>{if(capture===c)c.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));};source.connect(processor);processor.connect(gain);gain.connect(context.destination);c.timer=setTimeout(()=>finishCapture(),20000);stop.disabled=false;orb.classList.add('listening');status.textContent='Ouvindo você… Clique em Parar de ouvir ao terminar (até 20 segundos).';
  }catch(e){stream?.getTracks().forEach(t=>t.stop());if(context)await context.close();endListening();status.textContent=e.name==='NotAllowedError'?'Permita o microfone no navegador. Você também pode escrever.':'Não consegui abrir o microfone: '+e.message;}
 }
 button.onclick=()=>{if(!dialog.open)dialog.showModal();transcript.value='';if(!history.children.length)line('Lifa:','Envie seu vídeo e me conte o que deseja fazer.');start();};
 close.onclick=()=>dialog.close();dialog.addEventListener('close',halt);dialog.addEventListener('cancel',halt);
 listen.onclick=start;stop.onclick=()=>finishCapture();send.onclick=()=>{recordingEpoch++;finishCapture(true);submit();};audio.onchange=()=>{if(!audio.checked)window.speechSynthesis?.cancel();};
 window.addEventListener('lifa-voice-message',e=>{if(!dialog.open)return;status.textContent='Resposta da Lifa';line('Lifa:',e.detail);if(audio.checked&&window.speechSynthesis){recognition?.abort();endListening();window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(e.detail);speech.lang='pt-BR';window.speechSynthesis.speak(speech);}});
 endListening();
}
export const labels={queued:'Na fila',running:'Renderizando',needs_review:'Pronto para revisão',cancel_requested:'Cancelamento solicitado',cancelled:'Cancelado',interrupted:'Interrompido',failed:'Falhou',approved:'Aprovado',rejected:'Rejeitado',changes_requested:'Ajustes solicitados'};
