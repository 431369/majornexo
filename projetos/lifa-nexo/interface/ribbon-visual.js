// Elo vivo: one continuous ribbon, six expressions of the same identity.
const lifaRibbonReduced=matchMedia('(prefers-reduced-motion: reduce)');
const lifaRibbonScene={login:{shape:0,last:0},workspace:{shape:0,last:0}};
function ribbonPoint(shape,u){
 const s=Math.sin(u),c=Math.cos(u);
 if(shape===0)return [s*128,Math.sin(u*2)*64,c*43];
 if(shape===1)return [Math.sin(u*2)*112,Math.sin(u*3)*76,Math.cos(u)*35];
 if(shape===2)return [Math.sign(c)*Math.sqrt(Math.abs(c))*104,Math.sign(s)*Math.sqrt(Math.abs(s))*82,Math.sin(u*2)*36];
 if(shape===3){const r=96+19*Math.cos(u*3);return [c*r,s*r*.82,Math.sin(u*3)*37];}
 if(shape===4){const r=94+20*Math.cos(u*3);return [Math.cos(u*2)*r,Math.sin(u*2)*r*.75,Math.sin(u*3)*48];}
 const corners=[[0,-105],[108,76],[-108,76]],v=(u/Math.PI/2*3)%3,i=Math.floor(v),t=v-i;
 const p0=corners[(i+2)%3],p1=corners[i],p2=corners[(i+1)%3],p3=corners[(i+2)%3];
 const value=k=>.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t*t+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t*t*t);
 return [value(0),value(1),Math.sin(u*3)*26];
}
function drawLifaModules(ctx,w,h,t,progress,login,energy=0,activity={}){
 if(!w||!h)return;
 const reduced=lifaRibbonReduced.matches,time=reduced?0:t/1000;
 const state=lifaRibbonScene[login?'login':'workspace'],dt=Math.min(64,Math.max(1,t-(state.last||t-16)));state.last=t;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 const closing=login?smooth((progress-.84)/.14):0;
 const ids=['nexo','maia','atlas','iris','elo','prisma'],working=ids.indexOf(activity.agentId);
 const target=login?Math.min(5,progress/.84*6):working>=0?working:(Math.floor(time/7)%6);
 state.shape+=(target-state.shape)*(reduced?1:1-Math.exp(-dt/440));
 const base=Math.min(5,Math.floor(state.shape)),next=Math.min(5,base+1),mix=smooth(state.shape-base);
 updateLifaSummary(login?'login-agent-summary':'stage-agent-summary',closing>.4?6:Math.min(5,Math.floor(target)));
 const size=Math.min(w/340,h/290),cx=w/2,cy=h*(login?.49:.43)+(reduced?0:Math.sin(time*.7)*3);
 ctx.clearRect(0,0,w,h);
 const bloom=ctx.createRadialGradient(cx,cy,10,cx,cy,Math.min(w,h)*.48);bloom.addColorStop(0,'#ff77790c');bloom.addColorStop(1,'#ff454800');ctx.fillStyle=bloom;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy+105*size);ctx.scale(1,.16);const shadow=ctx.createRadialGradient(0,0,0,0,0,150*size);shadow.addColorStop(0,'#db77752b');shadow.addColorStop(.55,'#00000022');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(-160*size,-160*size,320*size,320*size);ctx.restore();
 const point=u=>{
  const a=ribbonPoint(base,u),b=ribbonPoint(next,u),home=ribbonPoint(0,u);
  return a.map((v,k)=>(v+(b[k]-v)*mix)*(1-closing)+home[k]*closing);
 };
 const angle=reduced?.16:.16+Math.sin(time*.12)*.055,ca=Math.cos(angle),sa=Math.sin(angle);
 const project=p=>{const x=p[0]*ca+p[2]*sa,z=-p[0]*sa+p[2]*ca,scale=600/(600+z);return [cx+x*size*scale,cy+p[1]*size*scale,z];};
 const mesh=[],segments=w<420?150:220;
 for(let i=0;i<=segments;i++){
  const u=i/segments*Math.PI*2,p=point(u),ahead=point((u+.006)%(Math.PI*2)),dx=ahead[0]-p[0],dy=ahead[1]-p[1],length=Math.hypot(dx,dy)||1;
  const twist=u+.4+Math.sin(u*2)*.36+(activity.phase==='speaking'?energy*Math.sin(time*3-u)*.12:0);
  const pulse=activity.phase==='listening'?1+energy*.1*(.6+.4*Math.sin(time*2)):1;
  const width=(16+Math.sin(u*2+.4)*3)*pulse,n=[-dy/length*Math.cos(twist),dx/length*Math.cos(twist),Math.sin(twist)];
  mesh.push({left:project(p.map((v,k)=>v-n[k]*width)),right:project(p.map((v,k)=>v+n[k]*width)),light:Math.cos(twist)});
 }
 const faces=[];for(let i=0;i<segments;i++){const a=mesh[i],b=mesh[i+1];faces.push({points:[a.left,a.right,b.right,b.left],z:(a.left[2]+a.right[2]+b.left[2]+b.right[2])/4,light:(a.light+b.light)/2,i});}faces.sort((a,b)=>b.z-a.z);
 for(const f of faces){
  const shade=.5+.5*f.light,wave=activity.phase==='speaking'?energy*(.5+.5*Math.sin(time*4-f.i/segments*7)):0;
  const rgb=[Math.round(173+shade*76+wave*6),Math.round(53+shade*59+wave*20),Math.round(65+shade*55+wave*15)];
  ctx.beginPath();f.points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle='rgb('+rgb.join(',')+')';ctx.fill();ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=.8;ctx.stroke();
  ctx.beginPath();ctx.moveTo(f.points[0][0],f.points[0][1]);ctx.lineTo(f.points[3][0],f.points[3][1]);ctx.strokeStyle='rgba(255,209,197,'+(.12+shade*.3)+')';ctx.lineWidth=.9;ctx.stroke();
 }
 ctx.textAlign='center';ctx.font='500 10px Segoe UI,sans-serif';ctx.fillStyle='#d8b6ae';ctx.fillText(closing>.4?'UMA CONEXÃO. TODA A SUA EQUIPE.':'L I F A  /  E L O  V I V O',cx,cy+132*size);
}
