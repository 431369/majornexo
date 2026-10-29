// Bounded binary parts, at most three in flight. No Base64 or full-file buffering.
const hex=buffer=>[...new Uint8Array(buffer)].map(n=>n.toString(16).padStart(2,'0')).join('');
export async function fileFingerprint(file){
 const head=await file.slice(0,65536).arrayBuffer(),tail=await file.slice(Math.max(0,file.size-65536)).arrayBuffer();
 const metadata=new TextEncoder().encode(JSON.stringify([file.name,file.size,file.lastModified]));
 const data=new Uint8Array(metadata.length+head.byteLength+tail.byteLength);data.set(metadata);data.set(new Uint8Array(head),metadata.length);data.set(new Uint8Array(tail),metadata.length+head.byteLength);
 return hex(await crypto.subtle.digest('SHA-256',data));
}
export class ResumableVideoUpload {
 constructor({api,request=fetch,storage=globalThis.localStorage,onProgress=()=>{},parallel=3}){Object.assign(this,{api,request,storage,onProgress,parallel:Math.max(1,Math.min(3,parallel))});this.controllers=new Set();this.paused=false;this.running=false;}
 pause(){this.paused=true;for(const c of this.controllers)c.abort();}
 async cancel(){this.pause();if(this.id){await this.api('/upload/cancel',{id:this.id});this.storage.removeItem(this.key);}}
 async start(file,createProject){
  if(this.running)throw Error('Um envio já está em andamento.');
  if(file.size<1||file.size>20*1024**3)throw Error('Selecione um arquivo de até 20 GB.');
  this.running=true;this.paused=false;this.file=file;
  try{
   const fingerprint=await fileFingerprint(file);this.key='iris-upload-v1:'+fingerprint;
   let prior;try{prior=JSON.parse(this.storage.getItem(this.key)??'null');}catch{}
   let state;
   if(prior?.id){try{state=await this.api('/upload/status?id='+encodeURIComponent(prior.id));if(state.bytes!==file.size||!['uploading','completed'].includes(state.status))state=null;}catch(e){if(![400,403,404].includes(e.status))throw e;}}
   if(!state){const projectId=await createProject();state=await this.api('/upload/begin',{projectId,name:file.name,bytes:file.size,fingerprint});}
   this.id=state.id;this.projectId=state.projectId;this.storage.setItem(this.key,JSON.stringify({id:state.id}));
   // Sample fingerprints find the session; each stored part proves the file is the same.
   for(const index of state.received){const bytes=await file.slice(index*state.partBytes,Math.min(file.size,(index+1)*state.partBytes)).arrayBuffer();const hash=hex(await crypto.subtle.digest('SHA-256',bytes));if(hash!==state.partHashes?.[index])throw Error('Este arquivo difere do envio iniciado. Selecione o original para retomar.');if(this.paused)return null;}
   if(state.status==='completed'){const asset=await this.api('/upload/finish',{id:this.id});this.storage.removeItem(this.key);return asset;}
   const received=new Set(state.received),total=Math.ceil(file.size/state.partBytes),pending=Array.from({length:total},(_,i)=>i).filter(i=>!received.has(i));
   let sent=state.receivedBytes,cursor=0;const start=performance.now(),initial=sent;
   const progress=()=>{const speed=(sent-initial)/Math.max(.001,(performance.now()-start)/1000);this.onProgress({received:sent,total:file.size,speed,remainingSeconds:speed>0?(file.size-sent)/speed:null,phase:sent===file.size?'validating':'uploading',projectId:state.projectId});};progress();
   let failure;
   await Promise.all(Array.from({length:Math.min(this.parallel,pending.length)},async()=>{
    while(!this.paused&&!failure&&cursor<pending.length){const index=pending[cursor++],begin=index*state.partBytes,bytes=await file.slice(begin,Math.min(file.size,begin+state.partBytes)).arrayBuffer(),sha256=hex(await crypto.subtle.digest('SHA-256',bytes));
     for(let attempt=0;attempt<3;attempt++){
      if(this.paused||failure)break;const controller=new AbortController();this.controllers.add(controller);
      try{const response=await this.request('/api/video-edits/upload/part?id='+encodeURIComponent(state.id)+'&index='+index,{method:'POST',headers:{'content-type':'application/octet-stream','x-nexo-request':'1','x-part-sha256':sha256},body:bytes,signal:controller.signal});
       if(!response.ok){const e=new Error((await response.json()).error??'Envio não concluído.');e.status=response.status;throw e;}
       sent+=bytes.byteLength;progress();break;
      }catch(e){if(this.paused)break;if(attempt===2||e.status&&e.status<500){failure=e;for(const c of this.controllers)c.abort();break;}await new Promise(r=>setTimeout(r,400*(attempt+1)));}
      finally{this.controllers.delete(controller);}
     }
    }
   }));
   if(failure)throw failure;
   if(this.paused)return null;
   const asset=await this.api('/upload/finish',{id:state.id});this.storage.removeItem(this.key);return asset;
  }finally{this.running=false;}
 }
}
