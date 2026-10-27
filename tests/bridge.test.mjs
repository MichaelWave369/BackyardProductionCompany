import test from 'node:test';
import assert from 'node:assert/strict';
import {makeSpatialPreview,inspectSourceText,inspectPacket,SAMPLE_DOMISTIKA,SAMPLE_FRAMEFIELD,MAX_JSON_BYTES} from '../src/bridge/contract.js';
const clone=x=>structuredClone(x);
test('recognizes actual XR UV strokes without claiming solid meshes',()=>{
 const p=makeSpatialPreview(SAMPLE_DOMISTIKA);
 assert.equal(p.source.format,'domistika.xr.scene.v1');
 assert.equal(p.assets[0].kind,'surface-strokes');
 assert.deepEqual(p.assets[0].strokes[0].pointsUV,[[.1,.15],[.5,.8],[.9,.15]]);
 assert.ok(p.disclosures.some(s=>s.includes('NOT free-air')));
 assert.equal(inspectPacket(JSON.parse(JSON.stringify(p))),true);
});
test('preserves source cage and transforms Framefield rotations deg to rad',()=>{
 const p=makeSpatialPreview(SAMPLE_FRAMEFIELD);
 assert.equal(p.assets[0].kind,'framefield-object');
 assert.equal(p.assets[0].mesh.representation,'editable-source-cage');
 assert.equal(p.assets[0].mesh.vertices.length,8);
 assert.equal(p.assets[0].keyframes[1].rotationRadians[1],Math.PI/2);
 assert.ok(p.disclosures.some(s=>s.includes('NOT evaluated')));
 assert.equal(inspectPacket(p),true);
});
test('inputs are immutable; packets deterministic and JSON round trippable',()=>{
 const a=clone(SAMPLE_DOMISTIKA),b=clone(SAMPLE_FRAMEFIELD);
 const one=makeSpatialPreview(a),two=makeSpatialPreview(b);
 assert.deepEqual(a,SAMPLE_DOMISTIKA);assert.deepEqual(b,SAMPLE_FRAMEFIELD);
 assert.deepEqual(JSON.parse(JSON.stringify(one)),makeSpatialPreview(a));
 assert.deepEqual(JSON.parse(JSON.stringify(two)),makeSpatialPreview(b));
});
test('reject invalid source, unsafe extents and invalid mesh indices',()=>{
 assert.throws(()=>inspectSourceText('{'),/Invalid JSON/);
 assert.throws(()=>makeSpatialPreview({version:3}),/Unsupported source/);
 assert.throws(()=>inspectSourceText(' '.repeat(MAX_JSON_BYTES+1)),/5 MiB/);
 const a=clone(SAMPLE_DOMISTIKA);a.boards[0].strokes[0].points=[[1.1,0]];
 assert.throws(()=>makeSpatialPreview(a),/UV point/);
 const b=clone(SAMPLE_FRAMEFIELD);b.objects[0].geometry.faces[0]=[0,1,100];
 assert.throws(()=>makeSpatialPreview(b),/face index/);
 const c=clone(SAMPLE_FRAMEFIELD);c.objects[0].keyframes[1].rotation[1]=Infinity;
 assert.throws(()=>makeSpatialPreview(c),/rotation/);
});
test('do not misinterpret unqualified modifiers or duplicate keyframes',()=>{
 const b=clone(SAMPLE_FRAMEFIELD);b.objects[0].modifiers=[{type:'boolean'}];
 assert.throws(()=>makeSpatialPreview(b),/modifier/);
 const c=clone(SAMPLE_FRAMEFIELD);c.objects[0].keyframes.push(clone(c.objects[0].keyframes[0]));
 assert.throws(()=>makeSpatialPreview(c),/Duplicate keyframe/);
});
test('preview rejects unauthorized publishing, execution or fake object count',()=>{
 const p=makeSpatialPreview(SAMPLE_FRAMEFIELD);
 assert.deepEqual(p.permissions,{execute:false,importIntoEditor:false,render:false,publish:false});
 const bad=clone(p);bad.permissions.publish=true;
 assert.throws(()=>inspectPacket(bad),/deny all/);
 const c=clone(p);c.assets=[];
 assert.throws(()=>inspectPacket(c),/asset count/);
});
