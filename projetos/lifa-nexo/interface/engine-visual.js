// Lifa mechanical assembly: local geometry, no remote models or assets.
const lifaEngineNames=['LIFA','MAIA','ATLAS','ÍRIS','ELO','PRISMA'];
const lifaEngineColors=['#ff4548','#ff6669','#e9ad8d','#ff8688','#bc787b','#e7c4b0'];
const lifaEngineReduced=matchMedia('(prefers-reduced-motion: reduce)');
const lifaFocusBlend={login:[1,0,0,0,0,0],workspace:[1,0,0,0,0,0]};
const lifaAgentStories=[
 ['Lifa','Coordenação','Entende seu objetivo, escolhe os especialistas e reúne as entregas da equipe.'],
 ['Maia','Operações','Organiza processos, prioridades e planos de ação para o dia a dia da sua empresa.'],
 ['Atlas','Engenharia','Estrutura soluções técnicas e cria implementações para transformar ideias em ferramentas.'],
 ['Íris','Conteúdo','Transforma a estratégia em textos e conteúdos com a linguagem da sua marca.'],
 ['Elo','Relacionamento','Apoia o relacionamento com clientes e organiza os próximos passos do atendimento.'],
 ['Prisma','Revisão','Revisa as entregas, aponta inconsistências e verifica os critérios de qualidade.']
];
function updateLifaSummary(id,index){
 const el=document.getElementById(id);if(!el||el.dataset.agentIndex===String(index))return;
 const [name,role,description]=lifaAgentStories[index];el.dataset.agentIndex=String(index);
 el.querySelector('.summary-counter').textContent=String(index+1).padStart(2,'0')+' / 06';
 el.querySelector('h2').textContent=name;el.querySelector('strong').textContent=role;el.querySelector('p').textContent=description;
 el.classList.remove('changing');requestAnimationFrame(()=>el.classList.add('changing'));
}
const lifaEngineGeometry=(()=>{
 const faces=[];
 const face=(module,points,color,edge='#080808')=>{
  const a=points[0],b=points[1],c=points[2],u=b.map((v,i)=>v-a[i]),v=c.map((p,i)=>p-a[i]);
  const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],length=Math.hypot(...n)||1;
  faces.push({module,points,color,edge,normal:n.map(x=>x/length),rgb:color.match(/\w\w/g).map(x=>parseInt(x,16))});
 };
 function ring(module,outer,inner,z,depth,segments=80){
  for(let i=0;i<segments;i++){
   const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2;
   const p=(r,angle,d)=>[Math.cos(angle)*r,Math.sin(angle)*r,d];
   const tint='#393a3b';
   face(module,[p(outer,a,z),p(outer,b,z),p(inner,b,z),p(inner,a,z)],tint);
   face(module,[p(outer,a,z+depth),p(inner,a,z+depth),p(inner,b,z+depth),p(outer,b,z+depth)],'#232222');
   face(module,[p(outer,a,z),p(outer,a,z+depth),p(outer,b,z+depth),p(outer,b,z)],'#343536');
   face(module,[p(inner,a,z),p(inner,b,z),p(inner,b,z+depth),p(inner,a,z+depth)],'#151515');
  }
 }
 function radialBox(module,angle,radius,width,height,z,depth,color){
  const point=(x,y,d)=>[Math.cos(angle)*x-Math.sin(angle)*y,Math.sin(angle)*x+Math.cos(angle)*y,d];
  const pts=[point(radius-height/2,-width/2,z),point(radius+height/2,-width/2,z),point(radius+height/2,width/2,z),point(radius-height/2,width/2,z)];
  const back=pts.map(([x,y])=>[x,y,z+depth]);face(module,pts,color);face(module,back,'#1b1b1b');
  for(let i=0;i<4;i++)face(module,[pts[i],back[i],back[(i+1)%4],pts[(i+1)%4]],i===1?'#3b3837':'#202020');
 }
 for(let m=0;m<6;m++){
  const z=-62+m*23;
  ring(m,m===0||m===5?106:101,m===0?88:75,z,8);
  if(m===0){ring(m,98,94,z-4,3);ring(m,86,83,z+5,2);}
  if(m===1||m===4){for(let i=0;i<40;i++)radialBox(m,i/40*Math.PI*2,95,4,12,z+7,12,i%5===0?'#454140':'#2c2928');}
  if(m===2||m===3){for(let i=0;i<10;i++)radialBox(m,i/10*Math.PI*2,88,28,23,z+8,16,i%2?'#302e2d':'#3d3937');
   // Segmented outer housing, with open channels between the plates.
   for(let i=0;i<6;i++)for(let j=0;j<7;j++){
    const a=i*Math.PI/3+j/7*.83,b=i*Math.PI/3+(j+1)/7*.83;
    const p=(theta,d)=>[Math.cos(theta)*108,Math.sin(theta)*108,d];
    face(m,[p(a,z-2),p(b,z-2),p(b,z+21),p(a,z+21)],j===0?'#48413d':'#34312f','#191817');
   }
  }
  if(m===5)for(let i=0;i<24;i++)radialBox(m,i/24*Math.PI*2,90,9,14,z-9,9,'#302d2c');
 }
 return faces;
})();
function drawLifaModules(ctx,w,h,t,progress,login,energy=0){
 if(!w||!h)return;
 const reduced=lifaEngineReduced.matches;
 const seconds=t/1000;
 const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
 // Front -> quarter turn -> exploded assembly, reversible with scrolling.
 const cycle=login?0:smooth((Math.sin(seconds*.16-1.57)+1)/2);
 const focus=Math.min(5,Math.floor((login?progress:cycle)*6));
 const blend=lifaFocusBlend[login?'login':'workspace'];for(let i=0;i<6;i++)blend[i]+=(Number(i===focus)-blend[i])*(reduced?1:.055);
 updateLifaSummary(login?'login-agent-summary':'stage-agent-summary',focus);
 const journey=reduced?0:login?progress:cycle*.78;
 const tilt=smooth(journey*2.4);
 const explode=smooth((journey-.28)/.65);
 const rx=tilt*.58,ry=tilt*1.16,rz=-tilt*.54+(login?Math.sin(seconds*.12)*.015:Math.sin(seconds*.12)*.07);
 const scale=Math.min(w*.82,h*.77)/(245+explode*170);
 const cx=w/2,cy=login?h*.5:h*.44;
 const project=([x,y,z],module=0)=>{
  z+=(module-2.5)*explode*52+blend[module]*explode*5;
  let yy=y*Math.cos(rx)-z*Math.sin(rx),zz=y*Math.sin(rx)+z*Math.cos(rx);
  let xx=x*Math.cos(ry)+zz*Math.sin(ry);zz=-x*Math.sin(ry)+zz*Math.cos(ry);
  let px=xx*Math.cos(rz)-yy*Math.sin(rz),py=xx*Math.sin(rz)+yy*Math.cos(rz);
  const depth=700/(700+zz);return [cx+px*scale*depth,cy+py*scale*depth,zz];
 };
 ctx.clearRect(0,0,w,h);
 const light=ctx.createRadialGradient(cx,cy,5,cx,cy,Math.min(w,h)*.47);
 light.addColorStop(0,'#ff45480b');light.addColorStop(1,'#ff454800');ctx.fillStyle=light;ctx.fillRect(0,0,w,h);
 ctx.save();ctx.translate(cx,cy+h*.29);ctx.scale(1,.13);const shadow=ctx.createRadialGradient(0,0,5,0,0,w*.31);shadow.addColorStop(0,'#00000065');shadow.addColorStop(1,'#00000000');ctx.fillStyle=shadow;ctx.fillRect(-w*.4,-w*.4,w*.8,w*.8);ctx.restore();
 const faces=lifaEngineGeometry.map(f=>{const pts=f.points.map(p=>project(p,f.module));return {...f,pts,z:pts.reduce((v,p)=>v+p[2],0)/pts.length};}).sort((a,b)=>b.z-a.z);
 for(const f of faces){
  const [nx,ny,nz]=f.normal,yy=ny*Math.cos(rx)-nz*Math.sin(rx),zz=ny*Math.sin(rx)+nz*Math.cos(rx),xx=nx*Math.cos(ry)+zz*Math.sin(ry),depthNormal=-nx*Math.sin(ry)+zz*Math.cos(ry);
  const diffuse=Math.abs(xx*-.35+yy*-.6+depthNormal*-.72),spec=Math.pow(diffuse,13)*27,brightness=.6+diffuse*.8;
  const highlight=blend[f.module],material=f.rgb.map((c,i)=>Math.round(Math.min(255,c*brightness+spec+highlight*(i===0?13:5))));
  const color='rgb('+material.join(',')+')';ctx.beginPath();f.pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=color;ctx.lineWidth=.5;ctx.stroke();
 }
 function path3(points,module,color,width=1,glow=0){ctx.beginPath();points.map(p=>project(p,module)).forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.shadowColor=color;ctx.shadowBlur=glow;ctx.stroke();ctx.shadowBlur=0;}
 // Six illuminated perimeter sectors: one subsystem per agent.
 for(let m=5;m>=0;m--){const z=-64+m*23,a=m*Math.PI/3;
  const arc=[];for(let j=0;j<=25;j++){const theta=a+j/25*(Math.PI/3-.045);arc.push([Math.cos(theta)*106,Math.sin(theta)*106,z]);}
  ctx.globalAlpha=.42+blend[m]*.58;path3(arc,m,lifaEngineColors[m],Math.max(1.4,scale*(1.1+blend[m]*1.6)),3+blend[m]*14+energy*9);ctx.globalAlpha=1;
  if(blend[m]>.02){const outline=[];for(let j=0;j<=80;j++){const theta=j/80*Math.PI*2;outline.push([Math.cos(theta)*105,Math.sin(theta)*105,z]);}ctx.globalAlpha=blend[m]*.35;path3(outline,m,'#ff787b',1,7);ctx.globalAlpha=1;}
  if(m>0&&tilt>.2){const angle=-1.1;path3([[Math.cos(angle)*101,Math.sin(angle)*101,z],[Math.cos(angle)*101,Math.sin(angle)*101,z+15]],m,'#dfab90',1.3);}
 }
 // Fine front graduations and a dynamic central coral surface.
 for(let i=0;i<120;i++){const a=i/120*Math.PI*2;path3([[Math.cos(a)*91,Math.sin(a)*91,-68],[Math.cos(a)*(i%5?95:98),Math.sin(a)*(i%5?95:98),-68]],0,i%5?'#6b3031':'#bf4d50',.8);}
 const faceFade=1-explode*.8;ctx.globalAlpha=faceFade;
 for(let i=-32;i<=32;i++){
  const y=i*1.9,span=68*Math.pow(1-Math.abs(i)/33,2.1);
  const wave=Math.sin(seconds*1.5+i*.075)*5*(1-tilt)+energy*8*Math.sin(i*.3);
  path3([[-span,y+wave,-67],[span,y+wave,-67]],0,'#ff4548',1.1+energy);
 }
 for(let i=0;i<44;i++){const a=i/44*Math.PI*1.25+seconds*.22;const p=project([Math.cos(a)*68,Math.sin(a)*38+8,-70],0);ctx.beginPath();ctx.fillStyle='#ff5b5e';ctx.arc(p[0],p[1],Math.max(.7,scale*1.25),0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=1;
 // Names follow their physical layer, rather than floating unrelated cards.
 if(explode>.12){ctx.font='600 '+Math.max(8,Math.min(11,w/48))+'px Segoe UI,sans-serif';ctx.textAlign='left';
  for(let m=0;m<6;m++){const p=project([0,-110,-62+m*23],m),side=m%2?1:-1;const tx=p[0]+side*20,ty=p[1]-12;
   ctx.strokeStyle=lifaEngineColors[m]+'88';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(tx,ty);ctx.lineTo(tx+side*28,ty);ctx.stroke();ctx.fillStyle=lifaEngineColors[m];ctx.textAlign=side===1?'left':'right';ctx.fillText(lifaEngineNames[m],tx+side*4,ty-5);
  }
 }else{ctx.fillStyle='#e9d7ce';ctx.textAlign='center';ctx.font='600 '+Math.max(10,scale*7)+'px Segoe UI,sans-serif';ctx.fillText('L I F A',cx,cy+Math.min(w,h)*.32);}
 if(journey>.12&&w>420){
  const p=project([-103,-16,-64+focus*23],focus),tx=Math.max(18,p[0]-78),ty=p[1]-28;
  ctx.strokeStyle='#ff8b8e';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(tx+35,ty);ctx.lineTo(tx,ty);ctx.stroke();
  ctx.beginPath();ctx.fillStyle='#ff777a';ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fill();ctx.font='600 12px Segoe UI,sans-serif';ctx.textAlign='left';ctx.fillStyle='#f1ddd5';ctx.fillText(lifaEngineNames[focus],tx,ty-7);
 }
}
