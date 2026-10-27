import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../src/ProductionLedger.jsx',import.meta.url),'utf8');
const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
test('BPC site wires the production ledger as a navigable local application section',()=>{
 assert.match(app,/<ProductionLedger production=\{production\} onChange=\{setProduction\}\/>/);
 assert.match(app,/id:'ledger',text:'Production Ledger'/);
 assert.match(app,/const \[production,setProduction\]=useState\(null\)/);
 assert.match(source,/newProduction/);
 assert.match(source,/registerAsset/);
 assert.match(source,/planHandoff/);
 assert.match(source,/reportHandoff/);
 assert.match(source,/reviewAsset/);
});
test('user actions own imported metadata and registered file hashes, not BPC servers',()=>{
 assert.match(source,/await crypto\.subtle\.digest\('SHA-256',bytes\)/);
 assert.match(source,/await file\.arrayBuffer\(\)/);
 assert.match(source,/Download backup/);
 assert.match(source,/window\.confirm\(/);
 assert.match(source,/event\.target\.files\?\.\[0\]/);
 assert.doesNotMatch(source,/\bfetch\s*\(/);
 assert.doesNotMatch(source,/localStorage|sessionStorage/);
 assert.doesNotMatch(source,/publishMedia|createToken/);
});
test('UI communicates the actual restrictions instead of claiming publication rights',()=>{
 assert.match(source,/No accounts\. No uploads\./);
 assert.match(source,/NO RELEASE AUTHORITY/);
 assert.match(source,/operator-reported/i);
 assert.match(source,/approved-for-planning/=== ''?'impossible':/REVIEW_DECISIONS/);
 assert.match(source,/128 MiB/);
 assert.match(source,/Nothing autosaves/);
});
