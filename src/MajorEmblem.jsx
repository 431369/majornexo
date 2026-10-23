import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// An authored, continuous folded ribbon: three asymmetric wings around an open core.
function center(u) {
  const a = u * Math.PI * 2;
  const r = 1.12 + .38 * Math.cos(3*a + .35) + .09 * Math.sin(2*a);
  return new THREE.Vector3(Math.cos(a)*r, Math.sin(a)*r*1.12, .44*Math.sin(3*a)+.15*Math.cos(a));
}
function ribbonGeometry() {
  const positions=[], indices=[], n=280;
  for(let i=0;i<=n;i++) {
    const u=i/n, a=u*Math.PI*2, p=center(u);
    const tangent=center(u+.0001).sub(center(u-.0001)).normalize();
    const side=new THREE.Vector3(-tangent.y,tangent.x,0).normalize();
    const normal=new THREE.Vector3().crossVectors(tangent,side).normalize();
    const twist=a*1.5+.35*Math.sin(a*3);
    const direction=side.multiplyScalar(Math.cos(twist)).addScaledVector(normal,Math.sin(twist));
    const width=.22+.12*Math.sin(a*3+.6)**2;
    for(let j=0;j<2;j++){const v=p.clone().addScaledVector(direction,(j===0?-1:1)*width);positions.push(v.x,v.y,v.z);}
    if(i<n){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
export default function MajorEmblem() {
  const host=useRef(null);
  useEffect(()=>{
    const el=host.current, reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
    const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(36,1,.1,30);camera.position.z=7.2;
    scene.add(new THREE.HemisphereLight(0xffe1bf,0x180603,3));
    [[0xffa35f,70,3,3,4],[0xffe6c1,65,-3,1,3],[0xff410b,40,0,-3,1]].forEach(([color,intensity,x,y,z])=>{const l=new THREE.PointLight(color,intensity,18);l.position.set(x,y,z);scene.add(l);});
    const sculpture=new THREE.Group();scene.add(sculpture);
    const geometry=ribbonGeometry();
    const material=new THREE.MeshStandardMaterial({color:0xe58a48,metalness:.72,roughness:.24,side:THREE.DoubleSide,emissive:0x601303,emissiveIntensity:.18});
    sculpture.add(new THREE.Mesh(geometry,material));
    const traceMaterial=new THREE.LineBasicMaterial({color:0xffd298,transparent:true,opacity:.7});
    const edgePoints=[];const pos=geometry.attributes.position;
    for(let i=0;i<pos.count;i+=2)edgePoints.push(new THREE.Vector3(pos.getX(i),pos.getY(i),pos.getZ(i)));
    const traceGeometry=new THREE.BufferGeometry().setFromPoints(edgePoints);sculpture.add(new THREE.Line(traceGeometry,traceMaterial));
    const sparkMaterial=new THREE.MeshBasicMaterial({color:0xffdc9c});
    const sparkGeometry=new THREE.SphereGeometry(.025,6,6);
    const sparks=Array.from({length:5},()=>{const s=new THREE.Mesh(sparkGeometry,sparkMaterial);sculpture.add(s);return s;});
    let raf,visible=true,x=0,y=0,rx=0,ry=0;
    const move=e=>{x=e.clientX/innerWidth-.5;y=e.clientY/innerHeight-.5;};window.addEventListener('pointermove',move,{passive:true});
    const resize=new ResizeObserver(([e])=>{const {width,height}=e.contentRect;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(el);
    const observer=new IntersectionObserver(([e])=>visible=e.isIntersecting);observer.observe(el);
    const start=performance.now();let previous=start;
    function draw(now){raf=requestAnimationFrame(draw);const dt=Math.min((now-previous)/1000,.05);previous=now;if(!visible||document.hidden)return;const t=reduced.matches?0:(now-start)/1000;const blend=1-Math.exp(-dt*3);rx+=(y*.3-rx)*blend;ry+=(x*.35-ry)*blend;
      sculpture.rotation.set(.2+rx+Math.sin(t*.21)*.2,ry+t*.12,.18+Math.sin(t*.18)*.13);
      sculpture.position.set(Math.sin(t*.35)*.16,Math.sin(t*.65)*.22,0);sculpture.scale.setScalar(1+Math.sin(t*.7)*.025);
      sparks.forEach((s,i)=>s.position.copy(center((t*.035+i/5)%1)));renderer.render(scene,camera);
    }
    raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);resize.disconnect();observer.disconnect();window.removeEventListener('pointermove',move);geometry.dispose();traceGeometry.dispose();sparkGeometry.dispose();material.dispose();traceMaterial.dispose();sparkMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className="major-identity" aria-hidden="true"><div className="major-emblem" ref={host}/></div>;
}
