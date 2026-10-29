// Structure Flow geometry and camera ported from the supplied ThreeUI source.
// Native WebGL avoids adding React/Three.js to this vanilla application.
// Original source is preserved in work/structure-flow-source.md.
function setupLifaBackground(){
 const auth=document.querySelector('#auth');if(!auth||auth.querySelector('.login-background'))return;
 const canvas=document.createElement('canvas');canvas.className='login-background';canvas.setAttribute('aria-hidden','true');auth.prepend(canvas);
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,depth:false,powerPreference:'low-power'});
 if(!gl)return;
 const vertex=`attribute vec3 aPoint;uniform float uTime,uAspect,uHeight;uniform vec2 uPointer;
 void main(){vec3 p=aPoint;float ry=uTime*.048,rz=uTime*.012;
 p.xy=mat2(cos(rz),sin(rz),-sin(rz),cos(rz))*p.xy;
 p.xz=mat2(cos(ry),-sin(ry),sin(ry),cos(ry))*p.xz;
 float depth=max(.1,30.-p.z);vec2 screen=vec2(p.x/uAspect,p.y-5.)*1.7320508/depth;
 screen+=uPointer*.015;gl_Position=vec4(screen,0.,1.);
 gl_PointSize=max(1.,.08*uHeight*.5/depth);}`;
 const fragment=`precision mediump float;void main(){gl_FragColor=vec4(1.,.72,.70,.4);}`;
 function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){gl.deleteShader(s);return null;}return s;}
 const vs=shader(gl.VERTEX_SHADER,vertex),fs=shader(gl.FRAGMENT_SHADER,fragment);if(!vs||!fs)return;
 const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))return;
 gl.useProgram(program);const total=15000,data=new Float32Array(total*3);let seed=17;
 const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<total;i++){const u=random();random();const theta=u*2*Math.PI,phi=Math.acos(random()*.8+.2);data.set([25*Math.sin(phi)*Math.cos(theta),25*Math.cos(phi)-20,25*Math.sin(phi)*Math.sin(theta)],i*3);}
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);const point=gl.getAttribLocation(program,'aPoint');gl.enableVertexAttribArray(point);gl.vertexAttribPointer(point,3,gl.FLOAT,false,0,0);
 const uniforms=Object.fromEntries(['uTime','uAspect','uHeight','uPointer'].map(k=>[k,gl.getUniformLocation(program,k)]));
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.clearColor(0,0,0,0);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');let frame=0,count=total,dpr=1,last=0,samples=0,sum=0,quality=1,px=0,py=0,lost=false;
 function resize(){dpr=Math.min(devicePixelRatio||1,innerWidth<700?1:1.5)*quality;canvas.width=Math.max(1,Math.round(innerWidth*dpr));canvas.height=Math.max(1,Math.round(innerHeight*dpr));gl.viewport(0,0,canvas.width,canvas.height);count=Math.round((innerWidth<700?10000:total)*quality);}
 function draw(t){gl.clear(gl.COLOR_BUFFER_BIT);gl.uniform1f(uniforms.uTime,reduced.matches?0:t/1000);gl.uniform1f(uniforms.uAspect,canvas.width/canvas.height);gl.uniform1f(uniforms.uHeight,canvas.height);gl.uniform2f(uniforms.uPointer,px,py);gl.drawArrays(gl.POINTS,0,count);}
 function visible(){return !document.hidden&&!auth.classList.contains('hidden')&&!lost;}
 function paint(t){frame=0;if(!visible())return;if(!last||t-last>=15){if(last){sum+=t-last;samples++;if(samples===120){const fps=1000/(sum/samples);canvas.dataset.fps=String(Math.round(fps));canvas.dataset.particles=String(count);if(fps<48&&quality>.5){quality=Math.max(.5,quality-.2);resize();}samples=0;sum=0;}}draw(t);last=t;}if(!reduced.matches)frame=requestAnimationFrame(paint);}
 function sync(){cancelAnimationFrame(frame);frame=0;last=0;samples=0;sum=0;canvas.dataset.running=String(visible()&&!reduced.matches);if(visible()){resize();frame=requestAnimationFrame(paint);}}
 new MutationObserver(sync).observe(auth,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
 window.addEventListener('resize',()=>{resize();if(reduced.matches&&visible())draw(0);},{passive:true});
 auth.addEventListener('pointermove',e=>{px=e.clientX/innerWidth-.5;py=.5-e.clientY/innerHeight;},{passive:true});auth.addEventListener('pointerleave',()=>{px=py=0;});
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);canvas.style.opacity='0';});
 sync();
}
