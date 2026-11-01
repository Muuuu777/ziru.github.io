/* Reference art, kept as 2D. Jackie uses clipped, jointed image parts;
   the warrior uses a cloth deformation on the supplied rendered illustration. */
(()=>{
const paths={mask:'assets/longshu/general-cutout.png',jackie:'assets/characters/jackie-rough.png'};
class Fighter{
 constructor(canvas,kind){if(kind==='mask'&&window.MiniGeneral)return new MiniGeneral.Fighter(canvas,'mask');this.canvas=canvas;this.ctx=canvas.getContext('2d');this.kind=kind;this.mask=0;this.image=new Image();this.image.onload=()=>this.draw('idle',0,0,0);this.image.src=window.__portfolioAssets?.[paths[kind]]||paths[kind];}
 draw(action='idle',phase=0,time=0,yaw=0){const c=this.ctx,I=this.image,W=this.canvas.width,H=this.canvas.height;if(!I.complete||!I.naturalWidth)return;c.clearRect(0,0,W,H);const beat=Math.sin(Math.PI*Math.max(0,Math.min(1,phase))),scale=Math.min(W/I.width,H/I.height)*.96;c.save();c.translate(W/2,H*.5);c.scale(scale,scale);c.translate(-I.width/2,-I.height/2);
 if(this.kind==='mask'){const iw=I.width,ih=I.height,rows=90,step=ih/rows;for(let i=0;i<rows;i++){const y=i*step,f=Math.max(0,(y/ih-.33)/.67),wave=Math.sin(time*1.8+y/ih*5)*f*8,move=action==='dodge'?-beat*60:0;c.drawImage(I,0,y,iw,step+1,wave+move,y,iw,step+1);}if(action==='block'||action==='punch'){c.strokeStyle='rgba(191,159,93,'+(beat*.7)+')';c.lineWidth=6;c.beginPath();c.arc(iw*.4,ih*.37,iw*.16,-1,.7);c.stroke();}}
 else{const sx=I.width/1140,sy=I.height/1380;c.scale(sx,sy);if(action==='dodge'){c.translate(-beat*100,beat*40);c.rotate(-beat*.12);}const part=(pts,pivot=[0,0],angle=0)=>{c.save();c.translate(...pivot);c.rotate(angle);c.translate(-pivot[0],-pivot[1]);c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.clip();c.drawImage(I,0,0,1140,1380);c.restore();};
 // Jackie stands on the right of the plate: the striking arm and leg travel left, toward the general.
 const kick=action==='kick'?beat*1.15:0,walk=action==='walk'?Math.sin(phase*Math.PI*4)*.15:0;
 part([[445,585],[591,590],[595,875],[635,1215],[562,1325],[444,1324],[440,1249],[481,1193],[438,917]],[510,610],walk);
 part([[566,585],[700,570],[747,853],[798,1200],[823,1294],[729,1347],[661,1291],[650,1212],[610,921]],[636,613],kick-walk);
 part([[493,235],[595,235],[654,257],[685,384],[689,581],[650,610],[456,603],[444,480],[421,359],[385,297]]);
 part([[451,42],[558,40],[622,99],[625,241],[594,295],[519,298],[486,250],[460,187]]);
 const punch=action==='punch'?beat*1.25:0;part([[387,267],[456,256],[468,361],[428,411],[417,493],[460,542],[447,580],[411,555],[397,607],[352,609],[319,570],[344,511],[360,474],[354,386],[345,347]],[408,300],punch);
 const guard=action==='block'?-beat*.32:action==='punch'?beat*.35:0;part([[622,255],[682,265],[733,307],[783,354],[814,403],[795,444],[748,441],[693,384],[642,365],[633,331]],[667,296],guard);
 }c.restore();}
}
window.CastFighter={Fighter};})();
