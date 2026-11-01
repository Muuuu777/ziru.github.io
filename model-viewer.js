/* Interactive preview of the same jointed 3D geometry used on the home plate. */
(()=>{
 const host=document.querySelector('.character-model-viewer');if(!host)return;
 const canvas=host.querySelector('canvas'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const renderer=new CastFighter.Fighter(canvas,'mask');
 const models={mask:renderer.model,jackie:CastFighter.makeModel('jackie')};
 let kind='mask',yaw=.3,motion='idle',start=0,frame=0,visible=false,drag=null;
 function draw(now){frame=0;const phase=(now-start)/950;if(phase>=1)motion='idle';renderer.draw(motion,Math.min(1,phase),reduced.matches?0:now/1000,yaw);if(visible&&!document.hidden&&(motion!=='idle'||!reduced.matches))frame=requestAnimationFrame(draw);}
 function loop(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
 host.querySelectorAll('[data-model]').forEach(b=>b.addEventListener('click',()=>{renderer.scene.remove(renderer.model.root);kind=b.dataset.model;renderer.model=models[kind];renderer.scene.add(renderer.model.root);motion='idle';host.querySelectorAll('[data-model]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));loop();}));
 host.querySelectorAll('[data-motion]').forEach(b=>b.addEventListener('click',()=>{motion=b.dataset.motion;start=performance.now();if(motion==='idle')yaw=.3;else yaw=.65;loop();}));
 canvas.addEventListener('pointerdown',e=>{drag={x:e.clientX,yaw};canvas.setPointerCapture(e.pointerId);});
 canvas.addEventListener('pointermove',e=>{if(drag){yaw=drag.yaw+(e.clientX-drag.x)*.015;loop();}});
 canvas.addEventListener('pointerup',()=>drag=null);canvas.addEventListener('pointercancel',()=>drag=null);
 canvas.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();yaw+=(e.key==='ArrowLeft'?-.2:.2);loop();}});
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)loop();else{cancelAnimationFrame(frame);frame=0;}}).observe(host);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else loop();});
})();
