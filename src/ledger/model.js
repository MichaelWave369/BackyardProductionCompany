/**
 * BPC Production Ledger v1. Portable METADATA only. No binary file storage,
 * remote communication, third-party authority or implicit publishing.
 * Fingerprints prove equality to a byte sequence, NOT authorship or rights.
 */
import {studios,bridges} from '../catalog.js';

export const LEDGER_SCHEMA='bpc.production.v1';
export const MAX_LEDGER_BYTES=1024*1024;
export const MAX_FILE_HASH_BYTES=128*1024*1024; // safe whole-buffer WebCrypto ceiling
export const ASSET_KINDS=Object.freeze(['image','audio','video','mesh','scene','document','other']);
export const REVIEW_DECISIONS=Object.freeze(['reviewed','needs-work','approved-for-planning']);
export const LEDGER_PERMISSIONS=Object.freeze({
  execute:false,importIntoEditor:false,publish:false,externalStorage:false
});
const MAX_ENTRIES=100;
const ID=/^[a-z0-9][a-z0-9-]{0,79}$/i;
const SHA=/^[0-9a-f]{64}$/;
const STUDIO_IDS=new Set(studios.map(x=>x.id));
const BRIDGES=new Map(bridges.map(x=>[x.id,x]));
function invalid(reason){throw new Error('BPC ledger: '+reason);}
function record(x,what){if(!x||typeof x!=='object'||Array.isArray(x))invalid('invalid '+what);return x;}
function arr(x,what,max=MAX_ENTRIES){if(!Array.isArray(x)||x.length>max)invalid('invalid '+what+' list');return x;}
function id(x,what){if(typeof x!=='string'||!ID.test(x))invalid('invalid '+what);return x;}
function description(x,limit,what,{allowEmpty=false}={}){
  if(typeof x!=='string'||x.length>limit||(!allowEmpty&&!x.trim())||/[\u0000-\u001f\u007f]/.test(x))
    invalid('invalid '+what);
  return x.trim();
}
function iso(x,label){if(typeof x!=='string'||!Number.isFinite(Date.parse(x))||new Date(x).toISOString()!==x)invalid('invalid '+label);return x;}
function bytes(n){if(!Number.isSafeInteger(n)||n<0||n>MAX_FILE_HASH_BYTES)invalid('invalid asset byte length');return n;}
function studio(x){if(!STUDIO_IDS.has(x))invalid('unknown studio '+x);return x;}
function kind(x){if(!ASSET_KINDS.includes(x))invalid('unknown asset type');return x;}
function filename(x){description(x,180,'filename');if(x.includes('/')||x.includes('\\'))invalid('filename must be a basename');return x;}
function assertFields(value,expected,label){
  if(Object.keys(value).sort().join('|')!==[...expected].sort().join('|'))
    invalid('unrecognized or missing '+label+' fields');
}
function noDuplicates(entries,label){
  const ids=entries.map(x=>x.id);
  if(ids.length!==new Set(ids).size)invalid('duplicate '+label+' identifier');
}
function assetIndex(m){return new Map(m.assets.map(a=>[a.id,a]));}

export function validateLedger(m){
  record(m,'production');
  assertFields(m,['schema','id','name','createdAt','updatedAt','assets','handoffs','reviews','permissions'],'production');
  if(m.schema!==LEDGER_SCHEMA)invalid('unsupported production schema');
  id(m.id,'production id');description(m.name,90,'production title');iso(m.createdAt,'creation time');iso(m.updatedAt,'update time');
  if(m.updatedAt<m.createdAt)invalid('update time precedes creation time');
  record(m.permissions,'permissions');
  assertFields(m.permissions,Object.keys(LEDGER_PERMISSIONS),'permissions');
  for(const [key,value] of Object.entries(LEDGER_PERMISSIONS))if(m.permissions[key]!==value)invalid('unauthorized '+key);
  arr(m.assets,'assets').forEach(a=>{
    record(a,'asset');
    assertFields(a,['id','filename','kind','studioId','byteLength','sha256','addedAt'],'asset');
    id(a.id,'asset id');filename(a.filename);kind(a.kind);studio(a.studioId);bytes(a.byteLength);
    if(typeof a.sha256!=='string'||!SHA.test(a.sha256))invalid('invalid SHA-256');
    iso(a.addedAt,'asset timestamp');
  });
  noDuplicates(m.assets,'asset');
  const assets=assetIndex(m);
  arr(m.handoffs,'handoffs').forEach(h=>{
    record(h,'handoff');
    assertFields(h,['id','bridgeId','sourceAssetId','targetAssetId','state','note','createdAt','reportedAt'],'handoff');
    id(h.id,'handoff id');description(h.note,320,'handoff note',{allowEmpty:true});iso(h.createdAt,'handoff timestamp');
    const bridge=BRIDGES.get(h.bridgeId);
    if(!bridge)invalid('unknown bridge');
    const from=assets.get(h.sourceAssetId);
    if(!from||from.studioId!==bridge.from)invalid('handoff source studio does not match bridge');
    if(h.state==='planned'){
      if(h.targetAssetId!==null||h.reportedAt!==null)invalid('planned handoff cannot have completion evidence');
    }else if(h.state==='operator-reported'){
      const target=assets.get(h.targetAssetId);
      if(bridge.status!=='implemented'||!target||target.studioId!==bridge.to)
        invalid('reported handoff needs a documented bridge and matching target asset');
      iso(h.reportedAt,'report timestamp');
    }else invalid('unsupported handoff state');
  });
  noDuplicates(m.handoffs,'handoff');
  arr(m.reviews,'reviews').forEach(r=>{
    record(r,'review');
    assertFields(r,['id','assetId','decision','note','reviewedBy','createdAt'],'review');
    id(r.id,'review id');
    if(!assets.has(r.assetId))invalid('review references unknown asset');
    if(!REVIEW_DECISIONS.includes(r.decision))invalid('unsupported review decision');
    description(r.note,400,'review note',{allowEmpty:true});
    if(r.reviewedBy!=='local-operator')invalid('unknown review identity');
    iso(r.createdAt,'review timestamp');
  });
  noDuplicates(m.reviews,'review');
  if(new TextEncoder().encode(JSON.stringify(m)).byteLength>MAX_LEDGER_BYTES)
    invalid('production exceeds 1 MiB metadata limit');
  return true;
}

export function newProduction(name,{now=new Date().toISOString(),id:projectId=globalThis.crypto?.randomUUID?.()}={}){
  const m={schema:LEDGER_SCHEMA,id:projectId,name:description(name,90,'production title'),
    createdAt:now,updatedAt:now,assets:[],handoffs:[],reviews:[],permissions:{...LEDGER_PERMISSIONS}};
  validateLedger(m);return m;
}
function changed(m,now,modify){
  validateLedger(m);iso(now,'change time');
  const next=JSON.parse(JSON.stringify(m));
  modify(next);
  next.updatedAt=now;
  validateLedger(next);
  return next;
}
function entryId(value){return id(value,'new entry id');}
function unique(m,idValue){
  if([...m.assets,...m.handoffs,...m.reviews].some(entry=>entry.id===idValue))
    invalid('entry id already exists');
}
export function registerAsset(m,{filename:sourceName,kind:assetKind,studioId,byteLength,sha256},
  {now=new Date().toISOString(),id:newId=globalThis.crypto?.randomUUID?.()}={}){
  return changed(m,now,next=>{
    if(next.assets.length>=MAX_ENTRIES)invalid('asset limit reached');
    unique(next,entryId(newId));
    const normalized={id:newId,filename:filename(sourceName),kind:kind(assetKind),studioId:studio(studioId),
      byteLength:bytes(byteLength),sha256:description(sha256,64,'SHA-256').toLowerCase(),addedAt:now};
    if(next.assets.some(a=>a.sha256===normalized.sha256&&a.studioId===normalized.studioId
      &&a.byteLength===normalized.byteLength))invalid('asset already registered for this studio');
    next.assets.push(normalized);
  });
}
export function planHandoff(m,sourceAssetId,bridgeId,{now=new Date().toISOString(),id:newId=globalThis.crypto?.randomUUID?.()}={}){
  return changed(m,now,next=>{
    if(next.handoffs.length>=MAX_ENTRIES)invalid('handoff limit reached');
    unique(next,entryId(newId));
    const bridge=BRIDGES.get(bridgeId),source=assetIndex(next).get(sourceAssetId);
    if(!bridge)invalid('unknown bridge');
    if(!source||source.studioId!==bridge.from)invalid('selected asset does not belong to source studio');
    next.handoffs.push({id:newId,bridgeId,sourceAssetId,targetAssetId:null,
      state:'planned',note:'',createdAt:now,reportedAt:null});
  });
}
export function reportHandoff(m,handoffId,targetAssetId,note,
  {now=new Date().toISOString()}={}){
  return changed(m,now,next=>{
    const handoff=next.handoffs.find(h=>h.id===handoffId);
    if(!handoff||handoff.state!=='planned')invalid('handoff is not awaiting a report');
    const bridge=BRIDGES.get(handoff.bridgeId),result=assetIndex(next).get(targetAssetId);
    if(bridge.status!=='implemented')invalid('only documented bridges can have operator-reported transfers');
    if(!result||result.studioId!==bridge.to)invalid('target asset belongs to wrong studio');
    handoff.state='operator-reported';
    handoff.targetAssetId=targetAssetId;
    handoff.reportedAt=now;
    handoff.note=description(note,320,'handoff note',{allowEmpty:true});
  });
}
export function reviewAsset(m,assetId,decision,note,
  {now=new Date().toISOString(),id:newId=globalThis.crypto?.randomUUID?.()}={}){
  return changed(m,now,next=>{
    if(next.reviews.length>=MAX_ENTRIES)invalid('review limit reached');
    unique(next,entryId(newId));
    if(!assetIndex(next).has(assetId))invalid('unknown review asset');
    if(!REVIEW_DECISIONS.includes(decision))invalid('unknown decision');
    next.reviews.push({id:newId,assetId,decision,note:description(note,400,'review note',{allowEmpty:true}),
      reviewedBy:'local-operator',createdAt:now});
  });
}
export function parseLedger(text){
  if(typeof text!=='string'||new TextEncoder().encode(text).byteLength>MAX_LEDGER_BYTES)
    invalid('manifest exceeds 1 MiB');
  let raw;try{raw=JSON.parse(text);}catch{invalid('invalid JSON manifest');}
  validateLedger(raw);
  return raw;
}
export function serialiseLedger(m){
  validateLedger(m);
  return JSON.stringify(m,null,2);
}
export const possibleHandoffs=studioId=>bridges.filter(b=>b.from===studioId);
export const availableTargets=(m,bridgeId)=>{
  const bridge=BRIDGES.get(bridgeId);
  return bridge?m.assets.filter(a=>a.studioId===bridge.to):[];
};
