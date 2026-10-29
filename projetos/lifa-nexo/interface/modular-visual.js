// Núcleo modular: six rounded pieces make a single connected identity.
const lifaModularReduced=matchMedia('(prefers-reduced-motion: reduce)');
const lifaModularScenes={login:{last:0,focus:[1,0,0,0,0,0]},workspace:{last:0,focus:[1,0,0,0,0,0]}};
function drawLifaModules(ctx,w,h,t,progress,login,energy=0,activity={}){
 if(!w||!h)return;
 const reduced=lifaModularReduced.matches,time=reduced?0:t/1000,smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const state=lifaModularScenes[login?'login':'workspace'],dt=Math.min(64,Math.max(1,t-(state.last||t-16)));state.last=t;
 const ids=['nexo','maia','atlas','iris','elo','prisma'],closing=login?smooth((progress-.84)/.14):0,working=ids.indexOf(activity.agentId);
 const focus=!login&&working>=0?working:Math.min(5,Math.floor((login?progress/.84:(time%42)/42)*6));
 for(let i=0;i<6;i++)state.focus[i]+=(Number(i===focus)-state.focus[i])*(reduced?1:1-Math.exp(-dt/320));
 updateLifaSummary(login?'login-agent-summary':'stage-agent-summary',closing>.4?6:focus);
 const opening=(login?smooth(progress*5):.55+.12*Math.sin(time*.2))*(1-closing);
 const unit=Math.min(w/400,h/375),cx=w/2,cy=h*(login?.48:.43)+(reduced?0:Math.sin(time*.7)*2);
 ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(cx,cy);ctx.scale(unit,unit);
 const halo=ctx.createRadialGradient(0,0,5,0,0,185);halo.addColorStop(0,'#ff45480c');halo.addColorStop(1,'#ff454800');ctx.fillStyle=halo;ctx.fillRect(-200,-180,400,360);
 ctx.save();ctx.translate(0,145);ctx.scale(1,.17);const shadow=ctx.createRadialGradient(0,0,4,0,0,145);shadow.addColorStop(0,'#bd717132');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(-160,-160,320,320);ctx.restore();
 const points=[];
 for(let i=0;i<6;i++){
  const active=state.focus[i],a=i*Math.PI/3-Math.PI/2,r=79+opening*28+active*opening*26,osc=reduced?0:Math.sin(time*.65+i)*opening*1.6;
  const p=[Math.cos(a)*(r+osc),Math.sin(a)*(r+osc)];points.push(p);
  if(opening>.2){ctx.strokeStyle='#e7b0a22b';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(Math.cos(a)*25,Math.sin(a)*25);ctx.lineTo(p[0],p[1]);ctx.stroke();}
  ctx.save();ctx.translate(p[0],p[1]);ctx.rotate(a+Math.PI/2);
  const shape=[[-21,31],[-36,-18],[-24,-38],[24,-38],[36,-18],[21,31]],round=9;
  const path=()=>{ctx.beginPath();for(let j=0;j<shape.length;j++){
   const prev=shape[(j+shape.length-1)%shape.length],curr=shape[j],next=shape[(j+1)%shape.length],l1=Math.hypot(curr[0]-prev[0],curr[1]-prev[1]),l2=Math.hypot(next[0]-curr[0],next[1]-curr[1]);
   const before=[curr[0]+(prev[0]-curr[0])*round/l1,curr[1]+(prev[1]-curr[1])*round/l1],after=[curr[0]+(next[0]-curr[0])*round/l2,curr[1]+(next[1]-curr[1])*round/l2];
   if(j===0)ctx.moveTo(before[0],before[1]);else ctx.lineTo(before[0],before[1]);ctx.quadraticCurveTo(curr[0],curr[1],after[0],after[1]);
  }ctx.closePath();};
  ctx.save();ctx.translate(0,5);path();ctx.fillStyle='#17141ab0';ctx.fill();ctx.restore();
  const tone=closing>.4?.8:active,gradient=ctx.createLinearGradient(-30,-40,30,35);
  const color=(a,b)=>'rgb('+a.map((v,k)=>Math.round(v+(b[k]-v)*tone)).join(',')+')';
  gradient.addColorStop(0,color([99,83,94],[255,136,129]));gradient.addColorStop(1,color([57,51,63],[215,68,88]));
  // Interpolate a coral wash over a matte violet base without swapping materials.
  path();ctx.fillStyle=gradient;ctx.fill();ctx.strokeStyle=tone>.5?'#ffc7b77a':'#c5a3b344';ctx.lineWidth=1;ctx.stroke();
  ctx.rotate(-a-Math.PI/2);ctx.strokeStyle=color([240,201,192],[50,28,41]);ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1.7;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
  if(i===0){ctx.moveTo(5,0);ctx.arc(0,0,5,0,Math.PI*2);for(let j=0;j<6;j++){const a=j*Math.PI/3,x=Math.cos(a)*15,y=Math.sin(a)*15;ctx.moveTo(Math.cos(a)*7,Math.sin(a)*7);ctx.lineTo(x,y);ctx.moveTo(x+2,y);ctx.arc(x,y,2,0,Math.PI*2);}}
  if(i===1){for(let x=-10;x<=10;x+=10)for(let y=-10;y<=10;y+=10){ctx.moveTo(x+1.6,y);ctx.arc(x,y,1.6,0,Math.PI*2);}}
  if(i===2){ctx.rect(-11,-10,15,15);ctx.rect(-3,-2,15,15);}
  if(i===3){ctx.moveTo(-16,0);ctx.quadraticCurveTo(0,-19,16,0);ctx.quadraticCurveTo(0,19,-16,0);ctx.moveTo(6,0);ctx.arc(0,0,6,0,Math.PI*2);}
  if(i===4){ctx.ellipse(-6,0,10,6,-.6,0,Math.PI*2);ctx.moveTo(16,0);ctx.ellipse(6,0,10,6,-.6,0,Math.PI*2);}
  if(i===5){ctx.moveTo(0,-14);ctx.lineTo(14,12);ctx.lineTo(-14,12);ctx.closePath();ctx.moveTo(0,-14);ctx.lineTo(4,7);ctx.lineTo(-14,12);}
  ctx.stroke();ctx.restore();
 }
 // The centre is the shared coordination layer, with real voice-state feedback.
 const pulse=activity.phase==='listening'?energy*(.6+.4*Math.sin(time*2)):0;
 ctx.beginPath();ctx.arc(0,0,22+pulse*6,0,Math.PI*2);ctx.fillStyle='#ff454814';ctx.fill();ctx.strokeStyle='#ff8e8270';ctx.lineWidth=1;ctx.stroke();
 ctx.font='700 11px Segoe UI,sans-serif';ctx.textAlign='center';ctx.fillStyle='#f8d3c8';ctx.fillText('L',0,4);
 if(activity.phase==='speaking')for(let i=0;i<6;i++){const p=points[i],travel=(time*.8+i/6)%1;ctx.beginPath();ctx.arc(p[0]*travel,p[1]*travel,1.5+energy*2,0,Math.PI*2);ctx.fillStyle='#ffc5b7';ctx.fill();}
 ctx.font='500 8px Segoe UI,sans-serif';ctx.fillStyle='#c9aaa3';for(let i=0;i<6;i++){const p=points[i],a=i*Math.PI/3-Math.PI/2;ctx.fillText(lifaAgentStories[i][0].toUpperCase(),p[0]+Math.cos(a)*56,p[1]+Math.sin(a)*56+3);}
 ctx.restore();
 ctx.font='500 10px Segoe UI,sans-serif';ctx.textAlign='center';ctx.fillStyle='#cdb0a5';ctx.fillText(closing>.4?'UMA EQUIPE. UM SÓ NÚCLEO.':'LIFA / NÚCLEO MODULAR',cx,Math.min(h-10,cy+185*unit));
}
