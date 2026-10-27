import {useMemo,useState} from 'react';
import {studios,bridges,lookup} from './catalog.js';
import {MAX_LEDGER_BYTES,MAX_FILE_HASH_BYTES,ASSET_KINDS,REVIEW_DECISIONS,
 newProduction,registerAsset,planHandoff,reportHandoff,reviewAsset,parseLedger,
 serialiseLedger,possibleHandoffs,availableTargets} from './ledger/model.js';

const stamp=()=>new Date().toISOString();
function fileDownload(data,name){
 const blob=new Blob([data],{type:'application/json'});
 const url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=name;
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function fileDigest(file){
 if(!globalThis.crypto?.subtle)throw Error('Secure HTTPS context required for local SHA-256.');
 if(file.size>MAX_FILE_HASH_BYTES)throw Error('File exceeds 128 MiB local hashing limit. No record added.');
 const bytes=await file.arrayBuffer();
 const digest=await crypto.subtle.digest('SHA-256',bytes);
 return [...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
}
const byId=id=>studios.find(s=>s.id===id)?.name||id;
const bridgeById=id=>bridges.find(b=>b.id===id);
const size=n=>n>=1048576?(n/1048576).toFixed(2)+' MiB':n>=1024?(n/1024).toFixed(1)+' KiB':n+' B';

export default function ProductionLedger({production,onChange}){
 const [title,setTitle]=useState('BPC Production 001');
 const [kind,setKind]=useState('scene'),[studio,setStudio]=useState('frame'),[file,setFile]=useState(null);
 const [selectedAsset,setSelectedAsset]=useState(''),[selectedBridge,setSelectedBridge]=useState('');
 const [reviewAssetId,setReviewAssetId]=useState(''),[decision,setDecision]=useState('reviewed'),[reviewNote,setReviewNote]=useState('');
 const [handoffTargets,setHandoffTargets]=useState({}),[handoffNotes,setHandoffNotes]=useState({});
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[busy,setBusy]=useState(false);
 const activeAsset=production?.assets.find(a=>a.id===selectedAsset);
 const bridgeOptions=useMemo(()=>activeAsset?possibleHandoffs(activeAsset.studioId):[],[activeAsset?.studioId]);
 const targetBridge=bridgeOptions.find(b=>b.id===selectedBridge)||bridgeOptions[0];
 const assetById=id=>production?.assets.find(a=>a.id===id);
 const announce=(message)=>{setNotice(message);setError('');};
 function create(){
   try{
     const m=newProduction(title,{now:stamp()});
     onChange(m);setSelectedAsset('');setSelectedBridge('');setReviewAssetId('');
     announce('Created an in-memory production. Download a backup to preserve it after this browser session.');
   }catch(e){setError(e.message);}
 }
 function exportManifest(){
   try{
     if(!production)throw Error('Create a production first.');
     const name=production.name.toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-|-$/g,'').slice(0,65)||'bpc-production';
     fileDownload(serialiseLedger(production),name+'.bpc-production.json');
     announce('Downloaded a portable manifest. Assets are referenced by hashes; their bytes are not bundled.');
   }catch(e){setError(e.message);}
 }
 async function importManifest(event){
   const candidate=event.target.files?.[0];event.target.value='';
   if(!candidate)return;
   setBusy(true);
   try{
     if(candidate.size>MAX_LEDGER_BYTES)throw Error('Manifest exceeds the 1 MiB size limit.');
     const parsed=parseLedger(new TextDecoder('utf-8',{fatal:true}).decode(await candidate.arrayBuffer()));
     if(production&&!window.confirm('Replace the in-memory production? Download a backup of the current one first.'))return;
     onChange(parsed);setSelectedAsset('');setSelectedBridge('');setReviewAssetId('');
     setHandoffTargets({});setHandoffNotes({});
     announce('Imported '+parsed.name+'. This is user-supplied metadata, not independently verified source evidence.');
   }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function addFile(){
   if(!file||!production)return;
   setBusy(true);setError('');
   try{
     const sha256=await fileDigest(file);
     const result=registerAsset(production,{filename:file.name,kind,studioId:studio,
       byteLength:file.size,sha256},{now:stamp()});
     const last=result.assets.at(-1);
     onChange(result);setSelectedAsset(last.id);setFile(null);
     announce('Recorded '+last.filename+' and its SHA-256. Bytes remain on your device.');
   }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 async function verifyFile(asset,event){
   const candidate=event.target.files?.[0];event.target.value='';
   if(!candidate)return;
   setBusy(true);
   try{
     const result=await fileDigest(candidate);
     if(result===asset.sha256&&candidate.size===asset.byteLength)
       announce('MATCH: the selected file matches '+asset.filename+' by size and SHA-256 bytes. Identity/rights are not established.');
     else setError('MISMATCH: the selected bytes do not match '+asset.filename+'. Ledger remains unchanged.');
   }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 function plan(){
   if(!targetBridge||!activeAsset)return;
   try{
     const result=planHandoff(production,activeAsset.id,targetBridge.id,{now:stamp()});
     onChange(result);announce('Planned '+activeAsset.filename+' → '+byId(targetBridge.to)+'. No transfer happened automatically.');
   }catch(e){setError(e.message);}
 }
 function report(h){
   const chosen=handoffTargets[h.id];
   if(!chosen){setError('Choose a registered target artifact first.');return;}
   try{
     const next=reportHandoff(production,h.id,chosen,handoffNotes[h.id]||'',{now:stamp()});
     onChange(next);announce('Recorded operator-reported handoff. This does not claim automated verification.');
   }catch(e){setError(e.message);}
 }
 function addReview(){
   const id=reviewAssetId||production?.assets[0]?.id;
   if(!id)return;
   try{
     const updated=reviewAsset(production,id,decision,reviewNote,{now:stamp()});
     onChange(updated);setReviewNote('');
     announce('Saved local review note. It grants no execution or publishing permission.');
   }catch(e){setError(e.message);}
 }
 return <section className="ledger" aria-labelledby="section-title">
   <div className="section-head"><div><p className="eyebrow">BPC / PRODUCTION LEDGER V0.3</p>
     <h2 id="section-title">Keep the receipts. Own the work.</h2>
     <p>Portable production records, with local file fingerprints and explicit human decisions. No accounts. No uploads.</p></div></div>
   <div className="lab-topline"><span>LOCAL-FIRST METADATA</span><span>NO FILE UPLOADS</span>
     <span>NO RELEASE AUTHORITY</span><span>MANUAL BACKUP</span></div>
   <div className="ledger-toolbar">
     <div className="ledger-file-group">
       <label className="lab-file-button">Import manifest <input type="file" accept=".json,application/json" onChange={importManifest} disabled={busy}/></label>
       {production&&<button className="button primary" onClick={exportManifest} disabled={busy}>Download backup ↓</button>}
     </div>
     <span className="ledger-safety">Nothing autosaves. Download the manifest before closing or refreshing this page.</span>
   </div>
   {error&&<p role="alert" className="lab-error">{error}</p>}
   {notice&&<p role="status" className="lab-message">{notice}</p>}
   {!production?<div className="lab-panel ledger-new">
     <p className="eyebrow">01 / CREATE PRODUCTION</p><h3>Every production starts somewhere.</h3>
     <p>Start with a portable manifest, not a cloud workspace that owns your files.</p>
     <div className="ledger-inline">
       <label>Production name<input value={title} maxLength={90} onChange={e=>setTitle(e.target.value)} placeholder="BPC Production 001"/></label>
       <button className="button primary" onClick={create}>Create production</button>
     </div>
   </div>:<>
     <div className="ledger-project">
       <div><p className="eyebrow">CURRENT PRODUCTION</p><h3>{production.name}</h3>
         <span className="ledger-subtext">Updated {new Date(production.updatedAt).toLocaleString()} · Local manifest, not a shared account</span></div>
       <div className="ledger-overview"><span><b>{production.assets.length}</b> assets</span><span><b>{production.handoffs.length}</b> handoffs</span>
         <span><b>{production.reviews.length}</b> reviews</span></div>
     </div>
     <div className="ledger-grid">
       <div className="lab-panel">
         <p className="eyebrow">02 / EVIDENCE</p><h3>Register local file.</h3>
         <p>BPC fingerprints the file you choose. The contents aren't included in the manifest. Files above 128 MiB aren't supported by this browser hashing pass.</p>
         <div className="ledger-fields">
           <label>Source studio<select value={studio} onChange={e=>setStudio(e.target.value)}>{studios.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
           <label>Asset type<select value={kind} onChange={e=>setKind(e.target.value)}>{ASSET_KINDS.map(k=><option key={k}>{k}</option>)}</select></label>
           <label className="ledger-wide">Choose asset<input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
           {file&&<p className="ledger-wide ledger-subtext">Selected {file.name} ({size(file.size)})</p>}
           <button className="button primary ledger-wide" disabled={!file||busy} onClick={addFile}>Record fingerprint</button>
         </div>
       </div>
       <div className="lab-panel">
         <p className="eyebrow">03 / ROUTING</p><h3>Plan a studio handoff.</h3>
         <p>Planning a transfer does not trigger other apps. Only actual documented bridges can later be marked operator-reported.</p>
         <div className="ledger-fields">
           <label className="ledger-wide">Source asset<select value={activeAsset?.id||''} onChange={e=>{setSelectedAsset(e.target.value);setSelectedBridge('');}}>
             <option value="">Choose an asset</option>{production.assets.map(a=><option key={a.id} value={a.id}>{a.filename} ({byId(a.studioId)})</option>)}</select></label>
           <label className="ledger-wide">Bridge<select value={targetBridge?.id||''} onChange={e=>setSelectedBridge(e.target.value)} disabled={!bridgeOptions.length}>
             {bridgeOptions.length?bridgeOptions.map(b=><option key={b.id} value={b.id}>{byId(b.from)} → {byId(b.to)} · {b.status}</option>):<option value="">No source asset selected / bridge available</option>}</select></label>
           <button className="button primary ledger-wide" onClick={plan} disabled={!targetBridge}>Plan handoff</button>
         </div>
       </div>
     </div>
     <div className="ledger-section">
       <p className="eyebrow">ASSET REGISTRY</p><h3>Source files and fingerprints</h3>
       {production.assets.length===0?<p className="ledger-subtext">No assets yet. Register a local file to start the production.</p>:
         <div className="ledger-entries">{production.assets.map(a=><article key={a.id} className="ledger-entry">
           <div><strong>{a.filename}</strong><span>{byId(a.studioId)} · {a.kind} · {size(a.byteLength)}</span>
             <code>SHA-256: {a.sha256}</code></div>
           <label className="ledger-verify">Compare local file<input type="file" disabled={busy} onChange={e=>verifyFile(a,e)}/></label>
         </article>)}</div>}
     </div>
     <div className="ledger-section">
       <p className="eyebrow">HANDOFFS</p><h3>What moved, and what didn't</h3>
       {production.handoffs.length===0?<p className="ledger-subtext">No transfers planned yet.</p>:
         <div className="ledger-entries">{production.handoffs.map(h=>{
           const bridge=bridgeById(h.bridgeId),source=assetById(h.sourceAssetId);
           const targets=availableTargets(production,h.bridgeId);
           return <article key={h.id} className="ledger-entry ledger-handoff">
             <div><strong>{bridge?byId(bridge.from)+' → '+byId(bridge.to):h.bridgeId}</strong>
               <span>{source?.filename||'Unresolved asset'} · {h.state==='planned'?'Planned only':'Operator-reported transfer'}</span>
               {h.state==='operator-reported'&&<span>Result: {assetById(h.targetAssetId)?.filename||'Unknown'} · {h.note||'No note'}</span>}
             </div>
             {h.state==='planned'&&bridge?.status==='implemented'&&<div className="ledger-report">
               <label>Result artifact<select value={handoffTargets[h.id]||''} onChange={e=>setHandoffTargets(s=>({...s,[h.id]:e.target.value}))}>
                 <option value="">Choose registered destination file</option>
                 {targets.map(a=><option key={a.id} value={a.id}>{a.filename}</option>)}</select></label>
               <label>Operator note<input value={handoffNotes[h.id]||''} maxLength={320} onChange={e=>setHandoffNotes(s=>({...s,[h.id]:e.target.value}))} placeholder="What did you actually test?"/></label>
               <button className="button secondary" onClick={()=>report(h)} disabled={!handoffTargets[h.id]}>Record reported handoff</button>
             </div>}
             {h.state==='planned'&&bridge?.status!=='implemented'&&<span className="ledger-subtext">Not qualified. This is a proposed route only.</span>}
           </article>;
         })}</div>}
     </div>
     <div className="ledger-grid">
       <div className="lab-panel">
         <p className="eyebrow">04 / HUMAN REVIEW</p><h3>Decisions without pretending.</h3>
         <p>A review note is an operator's own statement, not cryptographic proof, publishing approval, or automation authorization.</p>
         <div className="ledger-fields">
           <label className="ledger-wide">Asset<select value={reviewAssetId||production.assets[0]?.id||''} onChange={e=>setReviewAssetId(e.target.value)}>
             {production.assets.length===0?<option value="">No assets yet</option>:production.assets.map(a=><option key={a.id} value={a.id}>{a.filename}</option>)}</select></label>
           <label className="ledger-wide">Review outcome<select value={decision} onChange={e=>setDecision(e.target.value)}>
             {REVIEW_DECISIONS.map(s=><option value={s} key={s}>{s.replaceAll('-',' ')}</option>)}</select></label>
           <label className="ledger-wide">Review note<textarea rows={3} maxLength={400} value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="What was inspected and what remains unknown?"/></label>
           <button className="button primary ledger-wide" disabled={!production.assets.length} onClick={addReview}>Record review</button>
         </div>
       </div>
       <div className="lab-panel">
         <p className="eyebrow">05 / DECISION HISTORY</p><h3>Ledger above ego.</h3>
         {production.reviews.length===0?<p>No review notes recorded.</p>:
           <div className="ledger-reviews">{production.reviews.map(r=><div key={r.id}><strong>{r.decision.replaceAll('-',' ')}</strong>
             <span>{assetById(r.assetId)?.filename} · {new Date(r.createdAt).toLocaleString()}</span><p>{r.note||'No written note'}</p></div>)}</div>}
         <div className="ledger-denied">EXECUTE: DENIED · IMPORT INTO EDITOR: DENIED · PUBLISH: DENIED · EXTERNAL STORAGE: DENIED</div>
       </div>
     </div>
     <div className="principles"><strong>PORTABILITY RULE</strong>
       <p>The JSON manifest contains only filenames, SHA-256 digests and your own recorded actions. It cannot recreate a missing file. Keep the original project, linked assets and the downloaded manifest together in your own backup.</p></div>
   </>}
 </section>;
}
