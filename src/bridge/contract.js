// BPC v0.2: preview adapter only. No downstream editor import, render or publishing authority.
export const SCHEMA='bpc.spatial-preview.v1';
export const MAX_JSON_BYTES=5*1024*1024;
const TYPES=new Set(['box','sphere','pyramid','cylinder','torus']);
const COLOR=/^#[0-9a-f]{6}$/i;
const die=s=>{throw Error(s);};
const obj=(v,s)=>v&&typeof v==='object'&&!Array.isArray(v)?v:die('Invalid '+s);
const num=(v,lo,hi,s)=>typeof v==='number'&&Number.isFinite(v)&&v>=lo&&v<=hi?v:die('Invalid '+s);
const count=(v,lo,hi,s)=>Array.isArray(v)&&v.length>=lo&&v.length<=hi?v:die('Invalid '+s+' count');
const vec=(v,n,lo,hi,s)=>count(v,n,n,s).map((x,i)=>num(x,lo,hi,s+' '+i));
const whole=(v,lo,hi,s)=>Number.isInteger(num(v,lo,hi,s))?v:die('Invalid integer '+s);
const hex=(s,name)=>typeof s==='string'&&COLOR.test(s)?s.toLowerCase():die('Invalid '+name);
const text=(s,max,name)=>typeof s==='string'&&s.length>0&&s.length<=max?s:die('Invalid '+name);
const pose=(p,r,s,units)=>({
  position:vec(p,3,-10000,10000,'position'),
  rotationRadians:vec(r,3,-10000,10000,'rotation').map(n=>units==='degrees'?n*Math.PI/180:n),
  scale:vec(s,3,-10000,10000,'scale')
});
function domScene(scene){
  const ids=new Set();
  const assets=count(scene.boards,1,12,'boards').map((b,i)=>{
    obj(b,'board');const id=text(b.id,80,'board ID');
    if(ids.has(id))die('Duplicate board ID');ids.add(id);
    const strokes=count(b.strokes,0,600,'strokes').map(st=>{
      obj(st,'stroke');
      return {color:hex(st.color,'stroke color'),widthPx:num(st.width,2,120,'stroke width'),
        erase:st.erase===true,pointsUV:count(st.points,1,2500,'UV points')
          .map(p=>vec(p,2,0,1,'UV point'))};
    });
    return {kind:'surface-strokes',sourceId:id,label:String(b.name||'Canvas '+(i+1)).slice(0,60),
      pose:pose(vec(b.position,3,-30,30,'board position'),
        vec(b.rotation,3,-Math.PI*8,Math.PI*8,'board rotation'),
        vec(b.scale,3,.25,4,'board scale'),'radians'),strokes};
  });
  if(typeof scene.selectedId==='string'&&!ids.has(scene.selectedId))die('Selected board does not exist');
  return {source:{format:'domistika.xr.scene.v1',projectName:'Domistika XR scene',sourceObjectCount:assets.length},
    assets,disclosures:[
      'Board strokes are two-dimensional UV coordinates, NOT free-air polylines or solid meshes.',
      'Widths are source canvas pixels; this is not world-scale geometry.',
      'Raster pixels, selection, lighting and undo history are not included.',
      'Framefield cannot directly import this BPC preview. No source file was modified.'
    ]};
}
function mesh(raw){
  if(raw===undefined)return {representation:'primitive-reference'};
  obj(raw,'mesh');
  const vertices=count(raw.vertices,3,800,'vertices').map(p=>vec(p,3,-10000,10000,'vertex'));
  const faces=count(raw.faces,1,1200,'faces').map(f=>{
    const indices=count(f,3,16,'face').map(i=>whole(i,0,vertices.length-1,'face index'));
    if(new Set(indices).size!==indices.length)die('Duplicate face indices');
    return [...indices];
  });
  return {representation:'editable-source-cage',vertices,faces};
}
function modifiers(raw){
  if(raw===undefined)return [];
  return count(raw,0,4,'modifiers').map(m=>{
    obj(m,'modifier');
    if(m.type==='mirror')return {type:'mirror',axis:whole(m.axis,0,2,'mirror axis'),enabled:m.enabled!==false};
    if(m.type==='subdivide')return {type:'subdivide',levels:whole(m.levels,1,2,'subdivide levels'),enabled:m.enabled!==false};
    die('Invalid modifier type');
  });
}
function keys(raw,duration){
  const seen=new Set();
  return count(raw,1,600,'keyframes').map(k=>{
    obj(k,'keyframe');const frame=whole(k.frame,0,duration,'frame');
    if(seen.has(frame))die('Duplicate keyframe');seen.add(frame);
    const result={frame,...pose(k.position,k.rotation,k.scale,'degrees')};
    if(k.curves!==undefined){
      obj(k.curves,'curves');const curves={};
      for(const [id,v] of Object.entries(k.curves)){
        if(!/^(position|rotation|scale)\.[012]$/.test(id))die('Invalid curve channel');
        curves[id]=v==='hold'?'hold':vec(v,4,0,1,'Bezier curve');
      }
      result.curves=curves;
    }
    return result;
  }).sort((a,b)=>a.frame-b.frame);
}
function frameScene(scene){
  const duration=whole(scene.duration,12,600,'duration');
  const fps=whole(scene.fps,12,60,'fps');
  if(![12,24,30,60].includes(fps))die('Unsupported Framefield fps');
  const assets=count(scene.objects,0,100,'objects').map((s,i)=>{
    obj(s,'Framefield object');if(!TYPES.has(s.type))die('Unknown Framefield primitive');
    return {kind:'framefield-object',sourceId:String(s.id||'object-'+i).slice(0,80),
      label:String(s.name||'Object '+(i+1)).slice(0,65),primitive:s.type,color:hex(s.color,'object color'),
      mesh:mesh(s.geometry),modifiers:modifiers(s.modifiers),keyframes:keys(s.keyframes,duration),visible:s.visible!==false};
  });
  return {source:{format:'framefield.scene.v1',projectName:String(scene.name||'Untitled').slice(0,80),
    fps,duration,sourceObjectCount:assets.length},assets,disclosures:[
      'Source rotations expressed in degrees are converted to radians.',
      'Modifiers are preserved as intent, NOT evaluated or baked.',
      'Implicit primitives remain references, not polygon meshes.',
      'Lighting, shot camera, materials and renderer settings are omitted.',
      'Domistika XR cannot directly import this preview; it is NOT a GLB, STL or print-ready asset.'
    ]};
}
export function makeSpatialPreview(raw){
  obj(raw,'source');
  const result=raw.schema==='domistika.xr.scene.v1'?domScene(raw)
    :raw.version===1&&Array.isArray(raw.objects)?frameScene(raw)
    :die('Unsupported source. Select Domistika XR scene v1 or Framefield project v1.');
  return {schema:SCHEMA,purpose:'inspection-only',coordinateSpace:'source-native',
    ...result,permissions:{execute:false,importIntoEditor:false,render:false,publish:false}};
}
export function inspectSourceText(s){
  if(typeof s!=='string')die('Input must be JSON text');
  if(new TextEncoder().encode(s).byteLength>MAX_JSON_BYTES)die('File exceeds the 5 MiB Bridge Lab limit');
  let raw;try{raw=JSON.parse(s)}catch{die('Invalid JSON')}
  return makeSpatialPreview(raw);
}
export function inspectPacket(p){
  obj(p,'packet');if(p.schema!==SCHEMA||p.purpose!=='inspection-only')die('Unsupported packet');
  if(!p.permissions||Object.keys(p.permissions).sort().join(',')!=='execute,importIntoEditor,publish,render'||
    Object.values(p.permissions).some(x=>x!==false))die('Packet must deny all execution and release authority');
  if(!['domistika.xr.scene.v1','framefield.scene.v1'].includes(p.source?.format))die('Unknown source format');
  if(!Array.isArray(p.assets)||!Array.isArray(p.disclosures)||p.assets.length!==p.source.sourceObjectCount)
    die('Malformed packet asset count');
  return true;
}
export const SAMPLE_DOMISTIKA={
 schema:'domistika.xr.scene.v1',selectedId:'bpc-board',
 boards:[{id:'bpc-board',name:'Sketch canvas',position:[0,1.5,-1.35],rotation:[0,0,Math.PI/4],scale:[1,1,1],
   strokes:[{color:'#68e4ff',width:10,erase:false,points:[[.1,.15],[.5,.8],[.9,.15]]}]}]
};
export const SAMPLE_FRAMEFIELD={
 version:1,name:'Workshop study',fps:24,duration:120,
 objects:[{id:'cube',name:'Sample cube',type:'box',color:'#eeaa77',visible:true,
   geometry:{vertices:[[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5],
     [-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]],
     faces:[[0,1,2,3],[4,5,6,7],[0,1,5,4],[3,2,6,7],[0,4,7,3],[1,5,6,2]]},
   modifiers:[{type:'mirror',axis:0,enabled:false}],
   keyframes:[{frame:0,position:[0,0,0],rotation:[0,0,0],scale:[1,1,1]},
     {frame:120,position:[1,0,0],rotation:[0,90,0],scale:[1,1,1]}]}]
};
