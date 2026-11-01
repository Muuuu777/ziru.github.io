/* A small, dependency-free parametric sculpture renderer. */
(()=>{
'use strict';
const canvas=document.querySelector('#motion-canvas');
if(!canvas)return;
const ctx=canvas.getContext('2d',{alpha:true});
if(!ctx){canvas.hidden=true;document.querySelector('.cover-controls').hidden=true;return;}
const section=canvas.closest('section'),change=document.querySelector('#change-form'),toggle=document.querySelector('#toggle-motion');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const forms=[['KNOT','无限联结'],['ORBIT','循环轨迹'],['BLOOM','生长形态']];
let width=0,height=0,dpr=1,form=0,blend=1,clock=0,last=0,frame=0,paused=reduce.matches,visible=true,drag=false,activePointer=null,down=null,moved=false;
let yaw=-.35,pitch=.45,targetYaw=-.35,targetPitch=.45,impulse=0;
const pointer={x:0,y:0},stars=[];
const U=100,V=22,TAU=Math.PI*2;
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l)};
const center=t=>[(2+Math.cos(3*t)*.65)*Math.cos(2*t),(2+Math.cos(3*t)*.65)*Math.sin(2*t),Math.sin(3*t)*.9];
function geometry(kind,u,v){
 const t=u*TAU,s=v*TAU;
 if(kind===0){const c=center(t),next=center(t+.001),tan=norm(next.map((n,i)=>n-c[i])),n=norm(cross(tan,[0,0,1])),b=cross(tan,n),r=.43;return c.map((p,i)=>(p+r*(Math.cos(s)*n[i]+Math.sin(s)*b[i]))*.88);}
 if(kind===1){const r=1.95+.22*Math.cos(t*3),tube=.53;return [(r+tube*Math.cos(s))*Math.cos(t),(r+tube*Math.cos(s))*Math.sin(t),tube*Math.sin(s)+.35*Math.sin(t*3)];}
 const phi=u*Math.PI,r=2.2+.23*Math.sin(phi*6)*Math.cos(s*5);return [r*Math.sin(phi)*Math.cos(s),r*Math.sin(phi)*Math.sin(s),r*Math.cos(phi)];
}
let from=[],to=[];
function build(kind){const points=[];for(let i=0;i<=U;i++)for(let j=0;j<=V;j++)points.push(geometry(kind,i/U,j/V));return points;}
to=build(0);from=to;
const faces=[];for(let i=0;i<U;i++)for(let j=0;j<V;j++){const a=i*(V+1)+j;faces.push([a,a+V+1,a+V+2,a+1]);}
for(let i=0;i<30;i++)stars.push({x:((i*73.37)%100)/100,y:((i*31.79)%100)/100,r:i%3===0?1.4:.65});
function resize(){const r=section.getBoundingClientRect();width=r.width;height=r.height;dpr=Math.min(devicePixelRatio||1,1.7);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render();}
function rotate(p,ay,ax){const c=Math.cos(ay),s=Math.sin(ay),c2=Math.cos(ax),s2=Math.sin(ax),x=p[0]*c+p[2]*s,z=-p[0]*s+p[2]*c;return [x,p[1]*c2-z*s2,p[1]*s2+z*c2];}
function render(){
 if(!width)return;
 ctx.clearRect(0,0,width,height);
 const mobile=width<600,scale=mobile?Math.min(width*.105,height*.058):Math.min(width*.105,height*.15),cx=mobile?width*.52:width*.72,cy=mobile?height*.58:height*.47;
 const ease=blend*blend*(3-2*blend),ay=yaw+clock*.105,ax=pitch+Math.sin(clock*.22)*.14;
 const vertices=to.map((p,k)=>{let q=p.map((x,i)=>from[k][i]+(x-from[k][i])*ease);if(impulse>.001){const r=1+impulse*.11*Math.sin(q[1]*4+clock*5);q=q.map(x=>x*r);}return rotate(q,ay,ax);});
 const projected=vertices.map(p=>{const perspective=8.5/(8.5-p[2]);return [cx+p[0]*scale*perspective,cy+p[1]*scale*perspective];});
 ctx.fillStyle='#aba5ce';for(const s of stars){ctx.globalAlpha=.16+.12*Math.sin(clock*.5+s.x*30);ctx.beginPath();ctx.arc(s.x*width,s.y*height,s.r,0,TAU);ctx.fill();}ctx.globalAlpha=1;
 // Grounding shadow and a thin orbit give the sculpture a sense of depth.
 ctx.save();ctx.translate(cx,cy+scale*2.4);ctx.scale(1,.14);const glow=ctx.createRadialGradient(0,0,0,0,0,scale*2.4);glow.addColorStop(0,'#00000066');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(-scale*3,-scale*3,scale*6,scale*6);ctx.restore();
 const light=norm([-.5,-.8,1.2]);
 const sorted=faces.map(f=>({f,z:f.reduce((s,i)=>s+vertices[i][2],0)/4})).sort((a,b)=>a.z-b.z);
 for(const {f,z} of sorted){const a=vertices[f[0]],b=vertices[f[1]],c=vertices[f[3]],normal=norm(cross(b.map((x,i)=>x-a[i]),c.map((x,i)=>x-a[i])));let diffuse=Math.abs(dot(normal,light)),spec=Math.pow(Math.abs(dot(normal,norm([-.2,-.4,1]))),24),rim=Math.pow(1-Math.abs(normal[2]),3);const hue=247+normal[0]*20+Math.sin(clock*.1)*8,sat=36+rim*22,lit=24+diffuse*39+spec*30+rim*9;ctx.fillStyle=`hsl(${hue} ${sat}% ${Math.min(92,lit)}%)`;ctx.beginPath();f.forEach((i,k)=>{const p=projected[i];if(k===0)ctx.moveTo(p[0],p[1]);else ctx.lineTo(p[0],p[1]);});ctx.closePath();ctx.fill();
 // Sparse lime seams trace the form rather than cover it in particles.
 if(f[0]%47===0&&z>-.5){ctx.strokeStyle=`rgba(216,255,115,${.25+diffuse*.45})`;ctx.lineWidth=.8;ctx.stroke();}}
 if(impulse>.05){ctx.beginPath();ctx.strokeStyle=`rgba(216,255,115,${impulse*.3})`;ctx.lineWidth=1;ctx.ellipse(cx,cy,scale*(3.5-impulse),scale*(1.9-impulse*.3),-.3,0,TAU);ctx.stroke();}
}
function tick(now){frame=0;const dt=Math.min((now-last)/1000||.016,.04);last=now;if(!paused){clock+=dt;blend=Math.min(1,blend+dt*.85);impulse=Math.max(0,impulse-dt*.85);}yaw+=(targetYaw-yaw)*.08;pitch+=(targetPitch-pitch)*.08;render();if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
function start(){if(!frame&&visible&&!document.hidden){last=performance.now();frame=requestAnimationFrame(tick);}}
function syncPause(){toggle.setAttribute('aria-pressed',String(paused));toggle.setAttribute('aria-label',paused?'播放动画':'暂停动画');toggle.innerHTML=paused?'<span aria-hidden="true">▷</span>':'<span aria-hidden="true">Ⅱ</span>';section.classList.toggle('is-paused',paused);if(paused){cancelAnimationFrame(frame);frame=0;render();}else start();}
canvas.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect();pointer.x=(e.clientX-r.left)/width-.5;pointer.y=(e.clientY-r.top)/height-.5;if(drag&&e.pointerId===activePointer&&down){const dx=e.clientX-down.x,dy=e.clientY-down.y;if(Math.abs(dx)+Math.abs(dy)>4)moved=true;targetYaw+=dx*.007;targetPitch+=dy*.006;down={x:e.clientX,y:e.clientY};}else if(e.pointerType!=='touch'){targetYaw=-.35+pointer.x*.8;targetPitch=.45+pointer.y*.5;}if(paused){yaw=targetYaw;pitch=targetPitch;render();}});
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag=true;activePointer=e.pointerId;moved=false;down={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});
function release(e){if(e.pointerId!==activePointer)return;if(e.type==='pointerup'&&!moved){impulse=1;render();start();}drag=false;activePointer=null;down=null;}
canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);
canvas.addEventListener('pointerleave',()=>{if(!drag){targetYaw=-.35;targetPitch=.45;}});
change.addEventListener('click',()=>{const ease=blend*blend*(3-2*blend);from=to.map((p,k)=>p.map((v,i)=>from[k][i]+(v-from[k][i])*ease));form=(form+1)%forms.length;to=build(form);blend=paused?1:0;impulse=paused?0:.5;document.querySelector('#form-number').textContent=String(form+1).padStart(2,'0');document.querySelector('#form-name').innerHTML=forms[form].join('<br>');document.querySelector('#form-announcement').textContent='当前形态：'+forms[form][1];render();start();});
toggle.addEventListener('click',()=>{paused=!paused;syncPause();});
reduce.addEventListener('change',e=>{paused=e.matches;syncPause();});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else if(!paused)start();},{threshold:0}).observe(section);
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else if(!paused)start();});
new ResizeObserver(resize).observe(section);syncPause();resize();
})();
