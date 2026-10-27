import {useState} from 'react';
import {MAX_JSON_BYTES,SAMPLE_DOMISTIKA,SAMPLE_FRAMEFIELD,makeSpatialPreview,inspectPacket,inspectSourceText} from './bridge/contract.js';

async function sourceHash(bytes){
 if(!globalThis.crypto?.subtle)throw Error('Secure context required for local SHA-256 inspection.');
 const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',bytes));
 return [...digest].map(x=>x.toString(16).padStart(2,'0')).join('');
}
export default function BridgeLab(){
 const [packet,setPacket]=useState(null),[hash,setHash]=useState(''),[filename,setFilename]=useState('');
 const [error,setError]=useState(''),[busy,setBusy]=useState(false);
 async function inspect(bytes,label){
   setBusy(true);setError('');setPacket(null);setHash('');setFilename('');
   try{
     if(bytes.byteLength>MAX_JSON_BYTES)throw Error('File exceeds the 5 MiB inspection limit.');
     const decoded=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
     const ready=inspectSourceText(decoded);
     const sha=await sourceHash(bytes);
     inspectPacket(ready);
     setPacket(ready);setFilename(label);setHash(sha);
   }catch(e){setError(e instanceof Error?e.message:'Unable to inspect this file.');}
   finally{setBusy(false);}
 }
 async function demo(type){
   const source=type==='xr'?SAMPLE_DOMISTIKA:SAMPLE_FRAMEFIELD;
   await inspect(new TextEncoder().encode(JSON.stringify(source)),type==='xr'?'domistika-xr-demo.json':'framefield-demo.json');
 }
 async function chooseFile(event){
   const file=event.currentTarget.files?.[0];
   event.currentTarget.value='';
   if(!file)return;
   if(file.size>MAX_JSON_BYTES){setError('File exceeds the 5 MiB inspection limit.');setPacket(null);return;}
   try{await inspect(new Uint8Array(await file.arrayBuffer()),file.name);}
   catch(e){setPacket(null);setError(e instanceof Error?e.message:'Could not read the selected file.');}
 }
 function exportPacket(){
   if(!packet)return;
   inspectPacket(packet);
   const blob=new Blob([JSON.stringify({...packet,sourceSha256:hash},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob);
   const a=document.createElement('a');a.href=url;a.download='bpc-spatial-preview-v1.json';
   document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 }
 return <section aria-labelledby="section-title" className="bridge-lab">
   <div className="section-head">
     <div><p className="eyebrow">BRIDGE LAB / V0.2 CANDIDATE</p>
       <h2 id="section-title">Inspect it before you connect it.</h2>
       <p>Domistika XR and Framefield are different creative formats. Our first bridge keeps their data honest.</p></div>
   </div>
   <div className="lab-topline"><span>LOCAL FILES ONLY</span><span>5 MiB LIMIT</span><span>NO EDITOR MODIFICATIONS</span><span>PREVIEW, NOT IMPORT</span></div>
   <div className="lab-layout">
     <div className="lab-workspace">
       <div className="lab-panel">
         <p className="eyebrow">01 / LOAD SOURCE</p><h3>Start with a real project or sample.</h3>
         <p>Choose a JSON exported by Domistika XR or FramefieldStudio. Nothing is uploaded or stored.</p>
         <div className="lab-actions">
           <label className="lab-file-button">Choose local project <input type="file" accept=".json,application/json" onChange={chooseFile} disabled={busy}/></label>
           <button onClick={()=>demo('xr')} disabled={busy}>XR canvas sample</button>
           <button onClick={()=>demo('frame')} disabled={busy}>Framefield mesh sample</button>
         </div>
       </div>
       {busy&&<p role="status" className="lab-message">Verifying local geometry and file SHA-256…</p>}
       {error&&<p role="alert" className="lab-error">{error}</p>}
       {packet&&<div className="lab-panel lab-result">
         <p className="eyebrow">02 / VALIDATED SOURCE PREVIEW</p>
         <div className="lab-identity"><div><h3>{packet.source.projectName}</h3><span>{filename}</span></div><span className="lab-ok">PARSED</span></div>
         <div className="lab-metrics">
           <div><strong>{packet.assets.length}</strong><span>{packet.assets.length===1?'Asset':'Assets'}</span></div>
           <div><strong>{packet.source.format==='domistika.xr.scene.v1'?'UV strokes':'3D objects'}</strong><span>Source geometry type</span></div>
           <div><strong>{packet.source.fps||'N/A'}</strong><span>Frames per second</span></div>
         </div>
         <dl className="lab-data"><div><dt>Source format</dt><dd>{packet.source.format}</dd></div><div><dt>BPC packet</dt><dd>{packet.schema}</dd></div><div><dt>SHA-256 of input bytes</dt><dd className="digest">{hash}</dd></div></dl>
         <h4>Assets</h4><div className="lab-assets">{packet.assets.map((item,i)=><div key={item.sourceId+'-'+i}><strong>{item.label}</strong><span>{item.kind==='surface-strokes'?item.strokes.length+' strokes, UV on canvas':item.mesh.representation+' · '+item.keyframes.length+' keyframes'}</span></div>)}</div>
         <h4>Honest export limits</h4><ul className="lab-warnings">{packet.disclosures.map((x,i)=><li key={i}>{x}</li>)}</ul>
         <div className="lab-permissions">Execution <b>DENIED</b> · Direct editor import <b>DENIED</b> · Render <b>DENIED</b> · Publish <b>DENIED</b></div>
         <button className="button primary" onClick={exportPacket}>Download neutral preview JSON ↓</button>
       </div>}
     </div>
     <aside className="lab-sidebar">
       <p className="eyebrow">THE FORMAT GAP</p><h3>Two editors. Different geometry.</h3>
       <div className="lab-format"><strong>DOMISTIKA XR</strong><span>Floating canvases with 2D UV stroke points. Board positions and rotations live in 3D space.</span><code>domistika.xr.scene.v1</code></div>
       <div className="lab-between">⇅</div>
       <div className="lab-format"><strong>FRAMEFIELD</strong><span>3D editable polygon cages, primitive references and keyframes. Stored rotation values are degrees.</span><code>version: 1</code></div>
       <p className="lab-honesty">This BPC lab can inspect and export a neutral representation. A real two-way editor bridge requires separate receiver implementations, compatibility tests and user-approved imports.</p>
       <a href="https://github.com/MichaelWave369/BackyardProductionCompany/blob/main/docs/SPATIAL_BRIDGE_LAB_V02.md" target="_blank" rel="noopener noreferrer">Read the bridge design ↗</a>
     </aside>
   </div>
 </section>;
}
