/**
 * BPC cross-repository acceptance gate.
 * The workflow checks out exactly pinned upstream revisions into .interop/.
 * This deliberately imports the REAL Framefield source exporter and the REAL
 * Domistika XR source receiver rather than duplicating either contract.
 *
 * No network use in the test, no editor mutations, no browser/XR assertions.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {demoScene,makeObject,atFrame} from '../.interop/framefield/src/scene.js';
import {makeBpcXrPacket} from '../.interop/framefield/src/bpcExport.js';
import {readBpcFramefieldPreview,normalizeBpcFramefieldPacket,sampleFramefieldPose,FRAMEFIELD_EULER_ORDER}
  from '../.interop/domistika/src/xr/framefieldPreview.js';
import {makeSpatialPreview,SAMPLE_FRAMEFIELD} from '../src/bridge/contract.js';
const clone=source=>structuredClone(source);
const tolerance=1e-6;
const close=(actual,expected,label)=>assert.ok(Math.abs(actual-expected)<tolerance,
  label+': expected '+expected+', got '+actual);

test('REAL Framefield built-in scene exports and REAL Domistika XR parses all shapes',()=>{
  const original=demoScene();
  const before=clone(original);
  const packet=makeBpcXrPacket(original);
  assert.deepEqual(original,before,'Exporter cannot mutate authored Framefield scene');
  const receiver=readBpcFramefieldPreview(JSON.stringify(packet));
  assert.equal(receiver.sourceName,original.name);
  assert.equal(receiver.assets.length,2);
  assert.equal(receiver.fps,24);
  assert.equal(receiver.duration,120);
  assert.equal(receiver.assumedTiming,false);
  assert.ok(receiver.triangles>20,'Both cube and sphere should be triangulated');
  for(const [i,asset] of receiver.assets.entries()){
    assert.equal(asset.sourceId,original.objects[i].id);
    assert.equal(asset.label,original.objects[i].name);
    assert.ok(asset.positions.length>0);
    assert.equal(asset.positions.length,asset.triangleCount*9);
    assert.equal(asset.keyframes.length,original.objects[i].keyframes.length);
    assert.equal(asset.visible,true);
  }
  assert.deepEqual(packet.permissions,{execute:false,importIntoEditor:false,render:false,publish:false});
  assert.equal(FRAMEFIELD_EULER_ORDER,'ZYX');
});

test('REAL Framefield easing and multi-axis animated transforms survive REAL receiver',()=>{
  const project=demoScene();
  project.objects=[makeObject('box',0)];
  project.objects[0].keyframes=[
    {frame:0,position:[0,1,0],rotation:[15,-30,45],scale:[1,1,1],
      curves:{'position.0':'hold','rotation.1':[.42,0,.58,1], 'scale.2':[0,0,1,1]}},
    {frame:60,position:[2,-1,5],rotation:[-90,160,135],scale:[1.5,1,2]},
    {frame:120,position:[3,2,0],rotation:[270,-90,360],scale:[1,1,1]}
  ];
  const packet=makeBpcXrPacket(project);
  const receiver=normalizeBpcFramefieldPacket(packet);
  for(const frame of [0,1,12,30,45,60,75,90,119,120]){
    const expected=atFrame(project.objects[0],frame);
    const actual=sampleFramefieldPose(receiver.assets[0].keyframes,frame);
    ['position','scale'].forEach(channel=>expected[channel].forEach((number,axis)=>
      close(actual[channel][axis],number,channel+' axis '+axis+' @'+frame)));
    expected.rotation.forEach((degree,axis)=>
      close(actual.rotationRadians[axis],degree*Math.PI/180,'rotation axis '+axis+' @'+frame));
  }
  assert.equal(sampleFramefieldPose(receiver.assets[0].keyframes,30).position[0],0,
    'Framefield hold curve must not move before its next key');
});

test('enabled non-destructive Framefield modifiers export only evaluated geometry',()=>{
  const project=demoScene();
  project.objects=[{...makeObject('box',0),
    modifiers:[{type:'subdivide',levels:1,enabled:true}]}];
  const before=clone(project);
  const packet=makeBpcXrPacket(project);
  assert.deepEqual(project,before);
  assert.deepEqual(packet.assets[0].modifiers,[]);
  const receiver=readBpcFramefieldPreview(JSON.stringify(packet));
  assert.ok(receiver.assets[0].triangleCount>12);
});

test('legacy BPC Bridge Lab project packet still reads in real Domistika receiver',()=>{
  const packet=makeSpatialPreview(SAMPLE_FRAMEFIELD);
  const decoded=readBpcFramefieldPreview(JSON.stringify(packet));
  assert.equal(decoded.assets.length,1);
  assert.equal(decoded.assets[0].triangleCount,12);
  assert.equal(decoded.assumedTiming,false);
  assert.equal(decoded.fps,SAMPLE_FRAMEFIELD.fps);
});

test('receiver fails closed on invalid authority and malicious geometry envelope',()=>{
  const packet=makeBpcXrPacket(demoScene());
  packet.permissions.execute=true;
  assert.throws(()=>normalizeBpcFramefieldPacket(packet),/deny execution/);
  packet.permissions.execute=false;
  packet.assets[0].mesh.faces[0]=[0,1,999999];
  assert.throws(()=>normalizeBpcFramefieldPacket(packet),/face index/);
  packet.assets[0].mesh.faces[0]=[0,1,2];
  packet.source.sourceObjectCount=999;
  assert.throws(()=>normalizeBpcFramefieldPacket(packet),/asset count mismatch/);
});
