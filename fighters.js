/* Original, reference-informed procedural models. Three.js renders geometry and lighting;
   body joints and cloth vertices are animated. No face-photo projection. */
(()=>{
'use strict';
const T=window.THREE;if(!T)return;
const V=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),lerp=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function pose(action='idle',phase=0,time=0){
 const q=Math.sin(Math.PI*Math.max(0,Math.min(1,(phase-.06)/.88))),p={ls:[-.37,.7,0],rs:[.37,.7,0],le:[-.55,.28,.23],re:[.55,.32,.23],lw:[-.26,.64,.55],rw:[.26,.7,.55],lh:[-.18,-.23,0],rh:[.18,-.23,0],lk:[-.24,-.85,.05],rk:[.25,-.85,.02],la:[-.3,-1.48,.12],ra:[.35,-1.48,-.08],lean:0,bob:Math.sin(time*2)*.012};
 if(action==='portrait'){p.le=[-.42,.16,0];p.re=[.44,.16,0];p.lw=[-.41,-.4,.04];p.rw=[.45,-.4,.08];}
 if(action==='punch'){p.re=lerp(p.re,[.38,.72,.77],q);p.rw=lerp(p.rw,[.18,.77,1.34],q);p.lw=lerp(p.lw,[-.21,.94,.44],q);p.lean=q*.09;}
 if(action==='kick'){p.rk=lerp(p.rk,[.2,-.12,.79],q);p.ra=lerp(p.ra,[.2,.06,1.55],q);p.rw=lerp(p.rw,[.59,.61,.02],q);p.lean=-q*.15;}
 if(action==='dodge'){p.lean=-q*.24;p.bob-=q*.18;for(const k of ['ls','rs','le','re','lw','rw'])p[k][2]-=q*.2;}
 if(action==='block'){p.lw=lerp(p.lw,[-.14,1.13,.47],q);p.rw=lerp(p.rw,[.14,1.12,.57],q);p.le=lerp(p.le,[-.44,.77,.18],q);p.re=lerp(p.re,[.43,.78,.22],q);}
 if(action==='walk'){const a=Math.sin(phase*Math.PI*4);p.lk[2]+=a*.18;p.rk[2]-=a*.18;p.la[2]+=a*.26;p.ra[2]-=a*.26;p.bob=Math.abs(a)*.04;}
 return p;
}
const mat=(c,metal=0,rough=.65)=>new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
function mesh(geo,m,parent,pos=[0,0,0],scale=[1,1,1]){const o=new T.Mesh(geo,m);o.position.set(...pos);o.scale.set(...scale);o.castShadow=true;parent.add(o);return o;}
const ball=(p,m,pos,sc)=>mesh(new T.SphereGeometry(1,20,14),m,p,pos,sc);
function tube(parent,points,r,m){return mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>V(...p))),Math.max(10,points.length*5),r,6,false),m,parent);}
function plate(parent,points,depth,m){const shape=new T.Shape();points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y));shape.closePath();const g=new T.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.009,bevelThickness:.008,bevelSegments:2,steps:1});return mesh(g,m,parent);}
function lathe(parent,rings,m,scale=[1,1,1],pos=[0,0,0]){return mesh(new T.LatheGeometry(rings.map(([r,y])=>new T.Vector2(r,y)),32),m,parent,pos,scale);}
function maskMap(){const c=document.createElement('canvas');c.width=512;c.height=640;const x=c.getContext('2d');x.fillStyle='#682936';x.fillRect(0,0,512,640);
 const fill=(pts,col)=>{x.fillStyle=col;x.beginPath();pts.forEach(([a,b],i)=>i?x.lineTo(a,b):x.moveTo(a,b));x.closePath();x.fill();};
 for(const s of [-1,1]){const pts=[[256+s*20,95],[256+s*170,145],[256+s*185,245],[256+s*70,310],[256+s*30,225]];fill(pts,'#efece3');fill([[256+s*25,130],[256+s*153,160],[256+s*135,224],[256+s*67,260]],'#20252b');fill([[256+s*41,300],[256+s*190,280],[256+s*148,388],[256+s*62,375]],'#eeeae0');fill([[256+s*52,321],[256+s*164,300],[256+s*118,352]],'#303139');}
 fill([[256,22],[298,99],[278,185],[256,254],[234,185],[214,99]],'#b99756');fill([[256,43],[278,102],[256,199],[235,102]],'#762d3c');
 fill([[190,420],[225,397],[256,411],[287,397],[322,420],[305,444],[275,432],[256,442],[235,432],[207,444]],'#c9bba0');fill([[190,447],[256,432],[322,447],[294,520],[256,574],[218,520]],'#24282b');fill([[225,505],[256,488],[287,505],[277,552],[256,566],[236,552]],'#8b3540');return new T.CanvasTexture(c);}
function makeModel(kind){
 const root=new T.Group(),body=new T.Group();root.add(body);const isMask=kind==='mask';
 const skin=mat('#c58e68',0,.9),skinLight=mat('#d6a17b',0,.85),hair=mat('#211b18',0,.9),black=mat('#1d2226',.05,.68),gold=mat('#b59a66',.75,.31),goldDark=mat('#79603d',.65,.4),cloth=mat('#31343b',.08,.9),shirt=mat('#68717a',0,.92),pants=mat('#936c49',0,.92),white=mat('#e6dfcd',0,.72),eye=mat('#171a1a',0,.3),maskRed=mat('#813442',.25,.46);
 const weave=document.createElement('canvas');weave.width=weave.height=128;const wx=weave.getContext('2d');wx.fillStyle='#858585';wx.fillRect(0,0,128,128);for(let i=0;i<128;i++){wx.strokeStyle=i%2?'#a1a1a1':'#6b6b6b';wx.lineWidth=.6;wx.beginPath();wx.moveTo(i,0);wx.lineTo(i,128);wx.stroke();wx.strokeStyle=i%3?'#777':'#999';wx.beginPath();wx.moveTo(0,i);wx.lineTo(128,i);wx.stroke();}const bump=new T.CanvasTexture(weave);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(5,7);for(const m of [cloth,shirt,pants]){m.bumpMap=bump;m.bumpScale=.006;}
 const mats={skin,skinLight,hair,black,gold,goldDark,cloth,shirt,pants,white,eye,maskRed},limbs=[],clothParts=[];
 const torso=lathe(body,[[.24,-.26],[.26,-.17],[.29,.13],[.34,.48],[.35,.67],[.27,.78],[.13,.84]],isMask?cloth:shirt,[1,1,.65]);
 ball(body,isMask?cloth:skin,[0,.87,0],[.105,.16,.09]);
 const belt=lathe(body,[[.255,-.28],[.267,-.21],[.262,-.15]],isMask?goldDark:hair,[1,1,.69]);
 mesh(new T.BoxGeometry(.1,.075,.035),isMask?gold:mat('#a78f69',.7,.35),body,[.02,-.21,.188]);
 const head=new T.Group();head.position.set(0,1.18,0);body.add(head);
 if(!isMask){
 // Sculpted adult head: jaw, cheekbones, nose and eyelids are separate clean surfaces.
 lathe(head,[[.055,-.27],[.135,-.23],[.174,-.13],[.188,.02],[.18,.15],[.135,.235],[.02,.26]],skin,[1,1,.87]);
 ball(head,skinLight,[-.118,-.02,.115],[.061,.061,.035]);ball(head,skinLight,[.118,-.02,.115],[.061,.061,.035]);
 for(const s of [-1,1]){
  ball(head,skin,[s*.183,-.015,0],[.033,.065,.026]);ball(head,skinLight,[s*.073,.026,.147],[.052,.022,.023]);ball(head,white,[s*.072,.022,.164],[.035,.012,.008]);ball(head,eye,[s*.066,.023,.171],[.012,.013,.006]);
  tube(head,[[s*.115,.066,.144],[s*.074,.075,.166],[s*.033,.06,.158]],.012,hair);
  tube(head,[[s*.105,-.025,.152],[s*.13,-.065,.128]],.005,mat('#b38160'));
 }
 ball(head,skinLight,[0,-.025,.167],[.037,.073,.046]);ball(head,skin,[0,-.074,.184],[.045,.023,.024]);
 tube(head,[[-.053,-.142,.137],[0,-.15,.154],[.053,-.142,.137]],.008,mat('#936348'));ball(head,skinLight,[0,-.2,.108],[.058,.027,.027]);
 // Swept short hair, with an uneven fringe instead of a flat helmet.
 ball(head,hair,[0,.18,-.005],[.198,.135,.195]);ball(head,hair,[-.145,.07,-.018],[.052,.16,.13]);ball(head,hair,[.155,.07,-.018],[.043,.14,.12]);
 for(let i=0;i<7;i++){const h=ball(head,hair,[-.15+i*.046,.13-(i%3)*.012,.149],[.043,.057,.05]);h.rotation.z=-.35;}
 // Folded Polo collar and placket.
 for(const s of [-1,1]){const col=plate(body,[[s*.025,.81],[s*.13,.82],[s*.19,.7],[s*.08,.64]],.013,mat('#525e69'));col.position.z=.15;}
 mesh(new T.BoxGeometry(.035,.18,.015),mat('#596570'),body,[0,.63,.209]);for(const y of [.69,.63,.57])ball(body,mat('#a5a8a6'),[0,y,.222],[.008,.008,.004]);
 }else{
 // Shaped mask with a purpose-painted texture. No photo is stretched over the face.
 const g=new T.SphereGeometry(1,48,36,0,Math.PI*2,0,Math.PI);const maskMat=mat('#ffffff',.3,.5);maskMat.map=maskMap();maskMat.map.colorSpace=T.SRGBColorSpace;
 // The UV-painted front is a curved shield; surrounding head volume remains dark.
 ball(head,black,[0,0,-.025],[.18,.275,.125]);
 const fg=new T.PlaneGeometry(.36,.53,32,40),fp=fg.attributes.position;for(let i=0;i<fp.count;i++){const ox=fp.getX(i),y=fp.getY(i),factor=y>0?1-.4*Math.max(0,(y-.12)/.145):1-.65*Math.max(0,(-y-.04)/.225),x=ox*factor;fp.setX(i,x);fp.setZ(i,.12+Math.sqrt(Math.max(0,1-(x/.225)**2-(y/.4)**2))*.08);}fg.computeVertexNormals();mesh(fg,maskMat,head,[0,0,.025]);
 // Actual eye rims, brow ridges, nose, cheek fins, moustache and jaw plate.
 for(const s of [-1,1]){
  const brow=plate(head,[[s*.02,.095],[s*.16,.15],[s*.143,.114],[s*.035,.063]],.012,white);brow.position.z=.202;
  const socket=ball(head,black,[s*.082,.033,.21],[.059,.028,.024]);socket.rotation.z=s*.15;
  const iris=ball(head,white,[s*.077,.029,.232],[.026,.011,.009]);ball(head,eye,[s*.07,.029,.239],[.009,.012,.006]);
  const cheek=plate(head,[[s*.035,-.035],[s*.15,-.015],[s*.139,-.074],[s*.062,-.105]],.01,white);cheek.position.z=.193;
  tube(head,[[s*.045,-.115,.214],[s*.08,-.099,.207],[s*.12,-.13,.192]],.014,black);
  tube(head,[[s*.14,.16,.09],[s*.235,.24,.04],[s*.26,.37,-.02],[s*.24,.43,-.04]],.035,black);
  tube(head,[[s*.15,.17,.106],[s*.228,.25,.077],[s*.247,.35,.01]],.006,gold);
  for(let i=0;i<3;i++){const y=.18-i*.11,z=-.02;const f=plate(head,[[s*.15,y+.045],[s*.27,y+.10],[s*.23,y-.02]],.035,goldDark);f.position.z=z;}
 }
 ball(head,maskRed,[0,-.028,.222],[.035,.069,.038]);
 const beard=plate(head,[[-.09,-.16],[0,-.14],[.09,-.16],[.065,-.28],[0,-.32],[-.065,-.28]],.035,black);beard.position.z=.15;
 tube(head,[[0,.23,.184],[.035,.16,.211],[0,.075,.233],[-.035,.16,.211],[0,.23,.184]],.008,gold);
 for(let i=0;i<5;i++){const a=(i-2)*.38,x=Math.sin(a)*.19,y=.27+Math.cos(a)*.1;tube(head,[[x*.7,.21,-.08],[x,y,-.09]],.011,goldDark);ball(head,black,[x,y,-.09],[.029,.033,.027]);}
 // Sculpted belt plates, raised seams and a high, gilded collar.
 const buckle=mesh(new T.BoxGeometry(.13,.13,.055),gold,body,[.02,-.21,.22]);buckle.rotation.z=Math.PI/4;
 for(const s of [-1,1]){const waist=plate(body,[[s*.02,-.17],[s*.29,-.14],[s*.36,-.3],[s*.16,-.41],[s*.04,-.31]],.026,black);waist.position.z=.19;tube(body,[[s*.03,-.17,.235],[s*.27,-.15,.235],[s*.34,-.29,.235],[s*.17,-.38,.235]],.012,gold);
 const collar=plate(body,[[s*.06,.74],[s*.11,.97],[s*.19,.90],[s*.19,.7]],.025,black);collar.position.z=.07;tube(body,[[s*.07,.76,.10],[s*.12,.94,.10],[s*.17,.9,.10]],.012,gold);
 for(let j=0;j<2;j++)tube(body,[[s*.15,.57-j*.07,.28],[s*.20,.53-j*.07,.29],[s*.25,.51-j*.07,.28],[s*.23,.47-j*.07,.29]],.006,goldDark);
 }
 // Layered shoulder armour, lapels, vambraces and engraved gold bands.
 for(const s of [-1,1]){
  for(let j=0;j<3;j++){const pa=plate(body,[[s*.23,.74-j*.065],[s*(.66-j*.055),.9-j*.095],[s*(.53-j*.04),.58-j*.09],[s*.3,.52-j*.07]],.06,j%2?goldDark:black);pa.position.z=.03-j*.04;tube(body,[[s*.25,.76-j*.065,.11-j*.04],[s*(.65-j*.055),.9-j*.095,.11-j*.04],[s*(.53-j*.04),.59-j*.09,.11-j*.04]],.011,gold);}
  const la=plate(body,[[s*.04,.84],[s*.16,.75],[s*.36,.45],[s*.14,.22],[0,.32]],.025,black);la.position.z=.22;tube(body,[[s*.06,.81,.259],[s*.14,.62,.268],[s*.29,.44,.268],[s*.13,.28,.26],[0,.33,.26]],.013,gold);
  tube(body,[[s*.15,.45,.28],[s*.20,.42,.29],[s*.17,.36,.29],[s*.11,.4,.28]],.009,goldDark);
 }
 }
 function segment(a,b,r1,r2,m){const o=mesh(new T.CylinderGeometry(r2,r1,1,12),m,root);limbs.push({o,a,b});return o;}
 const joints=[];
 for(const s of ['l','r']){
  segment(s+'h',s+'k',.143,.12,isMask?cloth:pants);segment(s+'k',s+'a',.119,.092,isMask?black:pants);
  const knee=ball(root,isMask?black:pants,[0,0,0],[.12,.13,.115]);joints.push({o:knee,key:s+'k'});
  const shoe=ball(root,isMask?black:mat('#4d382c'),[0,0,0],[.113,.075,.225]);joints.push({o:shoe,key:s+'a',offset:[0,-.055,.12]});
  segment(s+'s',s+'e',.13,.105,isMask?cloth:shirt);
  segment(s+'e',s+'w',.09,.066,isMask?black:skin);
  const elbow=ball(root,isMask?cloth:skin,[0,0,0],[.089,.095,.09]);joints.push({o:elbow,key:s+'e'});
  const hand=new T.Group();root.add(hand);ball(hand,isMask?black:skin,[0,0,0],[.073,.095,.07]);for(let i=0;i<4;i++)ball(hand,isMask?black:skinLight,[-.046+i*.029,.027,.046],[.018,.049,.024]);ball(hand,isMask?black:skin,[-.066,-.015,.013],[.028,.042,.036]);joints.push({o:hand,key:s+'w'});
  if(isMask){const cuff=mesh(new T.CylinderGeometry(.095,.083,.16,8),goldDark,root);limbs.push({o:cuff,a:s+'e',b:s+'w',short:.42});}
 }
 function fabric(width,length,pos,material,seed=0){const geo=new T.PlaneGeometry(width,length,18,28);geo.translate(0,-length/2,0);const original=geo.attributes.position.array.slice(),o=mesh(geo,material,body,pos);material.side=T.DoubleSide;clothParts.push({o,original,seed,width,length});return o;}
 if(isMask){
 const capeMat=mat('#2c2932',.08,.84);capeMat.side=T.DoubleSide;
 fabric(1.05,2.2,[0,.75,-.23],capeMat,0);
 for(const s of [-1,1]){const f=fabric(.28,1.18,[s*.20,-.22,.22],cloth,s*2);f.rotation.z=s*.085;const edge=fabric(.018,1.18,[s*.34,-.22,.226],goldDark,s*2);edge.rotation.z=s*.085;}
 const sash=fabric(.16,1.6,[.02,.22,.30],mat('#39343b'),4);sash.rotation.z=.12;
 }
 function update(action,phase,time){const p=pose(action,phase,time);root.position.y=p.bob;body.rotation.x=p.lean;head.rotation.y=Math.sin(time*.45)*.025;
 for(const {o,a,b,short} of limbs){let av=V(...p[a]),bv=V(...p[b]);if(short){av.lerp(bv,.42);bv=V(...p[b]).lerp(av,.15);}const d=bv.clone().sub(av);o.position.copy(av).add(bv).multiplyScalar(.5);o.scale.y=d.length();o.quaternion.setFromUnitVectors(V(0,1,0),d.normalize());}
 for(const {o,key,offset}of joints){o.position.set(...p[key]);if(offset)o.position.add(V(...offset));}
 for(const {o,original,seed,length} of clothParts){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=original[i*3],y=original[i*3+1],f=-y/length;a.setXYZ(i,x+Math.sin(time*1.6+f*3+seed)*.08*f,y+Math.sin(time*1.2+x*4+seed)*.045*f,-.06*f-Math.sin(f*5-time*1.9+x*4+seed)*.13*f+Math.sin(x*24)*.018);}a.needsUpdate=true;o.geometry.computeVertexNormals();}
 }
 update('idle',0,0);return {root,update,head,clothParts};
}
class Fighter{
 constructor(canvas,kind,options={}){this.canvas=canvas;this.kind=kind;this.mask=0;this.renderer=new T.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});this.renderer.setPixelRatio(1);this.renderer.setSize(canvas.width,canvas.height,false);this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.9;
 this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(28,canvas.width/canvas.height,.1,30);this.camera.position.set(0,.12,7.9);this.camera.lookAt(0,0,0);this.model=makeModel(kind);this.scene.add(this.model.root);
 this.scene.add(new T.HemisphereLight('#fff6e9','#81909e',1.65));const key=new T.DirectionalLight('#fff2db',2.5);key.position.set(-3,5,6);this.scene.add(key);const rim=new T.DirectionalLight('#dbe8ff',2.5);rim.position.set(3,3,-2);this.scene.add(rim);const fill=new T.DirectionalLight('#f2dfd0',.7);fill.position.set(3,0,5);this.scene.add(fill);
 this.draw('idle',0,0,.3);}
 draw(action='idle',phase=0,time=0,yaw=.3){this.model.update(action,phase,time);this.model.root.rotation.y=yaw;this.model.head.rotation.z=this.mask?Math.sin(time*3)*.035:0;this.renderer.render(this.scene,this.camera);}
 portrait(time=0,yaw=-.65,wind=1){this.model.update('portrait',0,time*wind);this.model.root.rotation.y=yaw;this.camera.position.set(.05,.4,6.2);this.camera.lookAt(0,.25,0);this.model.head.rotation.y=-.18;this.renderer.render(this.scene,this.camera);}
}
window.CastFighter={Fighter,pose,makeModel};
})();
