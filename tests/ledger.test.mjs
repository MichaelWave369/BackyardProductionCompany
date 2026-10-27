import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {newProduction,registerAsset,planHandoff,reportHandoff,reviewAsset,validateLedger,parseLedger,serialiseLedger,possibleHandoffs,availableTargets,LEDGER_SCHEMA}
 from '../src/ledger/model.js';
const TIME='2026-10-27T08:00:00.000Z';
const NEXT='2026-10-27T08:01:00.000Z';
const file=(text,filename,studioId,kind='scene')=>({
 filename,studioId,kind,byteLength:Buffer.byteLength(text),
 sha256:createHash('sha256').update(text).digest('hex')
});
const example=()=>{
 let m=newProduction('First Motion',{id:'production-one',now:TIME});
 m=registerAsset(m,file('native scene bytes','first-motion.framefield.json','frame'),{id:'framefield-source',now:NEXT});
 m=registerAsset(m,file('BPC packet bytes','first-motion.bpc-xr.json','xr','mesh'),{id:'domistika-preview',now:NEXT});
 return m;
};
test('a portable production is bounded metadata only, default deny authority',()=>{
 const m=example();
 assert.equal(m.schema,LEDGER_SCHEMA);
 assert.deepEqual(m.permissions,{execute:false,importIntoEditor:false,publish:false,externalStorage:false});
 assert.equal(m.assets.length,2);
 assert.match(m.assets[0].sha256,/^[0-9a-f]{64}$/);
 assert.equal(validateLedger(parseLedger(serialiseLedger(m))),true);
 assert.doesNotMatch(serialiseLedger(m),/native scene bytes/);
});
test('record an honest source/target handoff without claiming CI or publisher authorization',()=>{
 const m=example();
 const planned=planHandoff(m,'framefield-source','frame-xr-preview',{id:'handoff-one',now:NEXT});
 assert.equal(planned.handoffs[0].state,'planned');
 const reported=reportHandoff(planned,'handoff-one','domistika-preview','I tested the transfer on my machine.',{now:NEXT});
 assert.equal(reported.handoffs[0].state,'operator-reported');
 assert.equal(reported.handoffs[0].targetAssetId,'domistika-preview');
 assert.equal(m.handoffs.length,0,'original snapshot should not mutate');
 assert.equal(reported.permissions.publish,false);
});
test('record human review without granting release permissions',()=>{
 const reviewed=reviewAsset(example(),'domistika-preview','approved-for-planning','Approved for next edit, not release.',
   {id:'review-one',now:NEXT});
 assert.equal(reviewed.reviews[0].reviewedBy,'local-operator');
 assert.equal(reviewed.reviews[0].decision,'approved-for-planning');
 assert.equal(reviewed.permissions.execute,false);
 assert.equal(reviewed.permissions.publish,false);
});
test('only permitted source to destination studio references may be linked',()=>{
 const m=example();
 assert.ok(possibleHandoffs('frame').some(x=>x.id==='frame-xr-preview'));
 assert.ok(availableTargets(m,'frame-xr-preview').some(x=>x.id==='domistika-preview'));
 assert.throws(()=>planHandoff(m,'domistika-preview','frame-xr-preview',{id:'bad-one',now:NEXT}),/source studio/);
 const p=planHandoff(m,'framefield-source','frame-xr-preview',{id:'handoff-one',now:NEXT});
 assert.throws(()=>reportHandoff(p,'handoff-one','framefield-source','',{now:NEXT}),/wrong studio/);
 const proposed=planHandoff(m,'domistika-preview','xr-frame',{id:'proposed-one',now:NEXT});
 assert.throws(()=>reportHandoff(proposed,'proposed-one','framefield-source','',{now:NEXT}),/only documented/);
});
test('fail closed on source identity, authority, forged reviews, dangerous paths',()=>{
 const m=example();
 const forged=structuredClone(m);forged.permissions.publish=true;
 assert.throws(()=>validateLedger(forged),/unauthorized publish/);
 const path=structuredClone(m);path.assets[0].filename='../evil.js';
 assert.throws(()=>validateLedger(path),/basename/);
 const tampered=structuredClone(m);tampered.reviews.push({
   id:'pretend',assetId:'nonexistent',decision:'approved-for-planning',note:'',
   reviewedBy:'local-operator',createdAt:TIME
 });
 assert.throws(()=>validateLedger(tampered),/unknown asset/);
 const extra=structuredClone(m);extra.secretCredentials='abc';
 assert.throws(()=>validateLedger(extra),/fields/);
 const dup=structuredClone(m);dup.assets.push(dup.assets[0]);
 assert.throws(()=>validateLedger(dup),/duplicate asset/);
});
test('reject invalid hashes, duplicate registrations, oversized manifests and unknown formats',()=>{
 const m=example();
 assert.throws(()=>registerAsset(m,{...file('bytes','something.wav','box','audio'),sha256:'not-a-hash'},
   {id:'asset-new',now:NEXT}),/SHA-256/);
 assert.throws(()=>registerAsset(m,file('native scene bytes','same content.file','frame'),
   {id:'same-sha',now:NEXT}),/already registered/);
 assert.throws(()=>parseLedger('{'),/invalid JSON/);
 assert.throws(()=>parseLedger(' '.repeat(1024*1024+1)),/1 MiB/);
 const unknown=structuredClone(m);unknown.schema='bpc.production.v99';
 assert.throws(()=>validateLedger(unknown),/unsupported production schema/);
 const x=structuredClone(m);x.reviews.push({
   id:'invalid',assetId:m.assets[0].id,decision:'publish-live',reviewedBy:'local-operator',note:'',createdAt:TIME
 });
 assert.throws(()=>validateLedger(x),/unsupported review decision/);
});
test('all operator timestamps and stable IDs survive round trips',()=>{
 const a=example();
 const b=reviewAsset(planHandoff(a,'framefield-source','frame-xr-preview',{id:'h-1',now:NEXT}),
  'framefield-source','reviewed','Metadata and content hash inspected.',{id:'r-1',now:NEXT});
 assert.deepEqual(parseLedger(serialiseLedger(b)),b);
 assert.equal(b.updatedAt,NEXT);
});
