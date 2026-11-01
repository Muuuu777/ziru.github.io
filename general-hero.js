/* The supplied illustration is animated as 2D art. Geometry weights pin the
   face, torso, hands and legs; only robe panels and cape receive the wind. */
(()=>{
 const canvas=document.querySelector('#general-portrait');if(!canvas)return;try{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),button=document.querySelector('#general-wind'),wrap=canvas.closest('.general-art');
 let wind=!reduced.matches,visible=true,frame=0,time=0,last=0,strength=.18,target=.18,direction=.4,dirTarget=.4,mouseY=.6,lastX=null;
 const imagePath='assets/longshu/general-cutout.png',renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(1);renderer.setSize(canvas.width,canvas.height,false);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.55,.55,.825,-.825,.1,10);camera.position.z=2;
 const geo=new THREE.PlaneGeometry(1,1.5,64,112),original=geo.attributes.position.array.slice(),weights=[];
 const cape=[[527,349],[633,440],[781,591],[1000,840],[1019,1103],[783,1258],[621,1092],[577,861],[567,615]],robe=[[284,527],[472,482],[598,731],[711,1094],[797,1237],[412,1160],[279,954]],leftRobe=[[247,662],[362,591],[383,897],[222,1106],[91,1082],[162,908]];
 function inside(x,y,poly){let value=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)value=!value;}return value;}
 for(let i=0;i<geo.attributes.position.count;i++){const x=(original[i*3]+.5)*1024,y=(.75-original[i*3+1])/1.5*1536;let f=0;if(inside(x,y,cape))f=Math.max(0,(y-400)/850);if(inside(x,y,robe))f=Math.max(f,Math.max(0,(y-530)/710)*.7);if(inside(x,y,leftRobe))f=Math.max(f,Math.max(0,(y-590)/520)*.6);
 // Pin exposed hands and forearms, even where the cape passes behind them.
 if((x>88&&x<207&&y>578&&y<836)||(x>572&&x<653&&y>590&&y<820))f=0;weights.push(Math.min(1,f));}
 const texture=new THREE.TextureLoader().load(window.__portfolioAssets?.[imagePath]||imagePath,()=>kick());texture.colorSpace=THREE.SRGBColorSpace;scene.add(new THREE.Mesh(geo,new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false})));
 function draw(now){frame=0;if(!visible||document.hidden)return;const dt=Math.min(.04,(now-last)/1000||.016);last=now;if(wind)time+=dt;strength+=(target-strength)*Math.min(1,dt*4);direction+=(dirTarget-direction)*Math.min(1,dt*5);const p=geo.attributes.position;
 for(let i=0;i<p.count;i++){const x=original[i*3],y=original[i*3+1],f=weights[i],down=(.75-y)/1.5,near=.45+.55*Math.exp(-Math.pow((down-mouseY)*3,2));const gust=wind?strength*near:0;
 const flutter=(Math.sin(time*2.1+down*7+x*4)*.014+direction*.015)*f*gust,lift=(.012+Math.sin(time*1.7+down*6)*.008)*f*gust;
 p.setXYZ(i,x+flutter,y+lift,Math.sin(time*1.5+down*4)*.008*f*gust);}p.needsUpdate=true;renderer.render(scene,camera);if(wind)frame=requestAnimationFrame(draw);}
 function kick(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(draw);}
 function label(){button.setAttribute('aria-pressed',String(wind));button.textContent=wind?'移近衣袂，掀起微风':'风停了 · 点击开启';}label();button.title='鼠标靠近披风与衣摆可以让衣服飘起，点击暂停动画。';button.addEventListener('click',()=>{wind=!wind;last=performance.now();label();kick();});
 window.addEventListener('pointermove',e=>{const r=canvas.getBoundingClientRect(),near=e.clientX<Math.min(r.right+35,innerWidth*.4)&&e.clientY>r.top&&e.clientY<r.bottom;target=near?1.9:.18;mouseY=Math.max(0,Math.min(1,(e.clientY-r.top)/r.height));if(near){const dx=lastX===null?0:e.clientX-lastX;dirTarget=Math.max(-1,Math.min(1,dx*.2+(e.clientX-r.left)/r.width-.3));}else dirTarget=.4;lastX=e.clientX;kick();},{passive:true});
 window.addEventListener('pointerout',e=>{if(!e.relatedTarget){target=.18;lastX=null;}},{passive:true});
 new IntersectionObserver(es=>{visible=es[0].isIntersecting;if(visible){last=performance.now();kick();}else{cancelAnimationFrame(frame);frame=0;}}).observe(wrap);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else kick();});kick();
}catch(error){const image=document.createElement('img'),path='assets/longshu/general-cutout.png';image.src=window.__portfolioAssets?.[path]||path;image.alt='川剧面具将军立绘';image.style.cssText='width:100%;height:auto;display:block';canvas.replaceWith(image);document.querySelector('#general-wind')?.setAttribute('hidden','');}
})();
