import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { liveGate } from '../src/live-gate.mjs';
import { digest, generateFixtures, eligible } from '../src/fixtures.mjs';

const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
const protocolHash=digest(protocol);
function setup(t){
  const directory=mkdtempSync(join(tmpdir(),'rpg-bakeoff-test-'));
  t.after(()=>rmSync(directory,{recursive:true,force:true}));
  return {approved:true,apiKey:'SYNTHETIC_ONLY',protocolHash,phase:'smoke',ledgerPath:join(directory,'ledger.jsonl')};
}
test('explicit approval and isolated credential required; no existing app environment is loaded',t=>{
  const p=setup(t);
  assert.throws(()=>liveGate({...p,approved:false}),/configuration/);
  assert.throws(()=>liveGate({...p,apiKey:undefined}),/configuration/);
  assert.throws(()=>liveGate({...p,protocolHash:'different'}),/configuration/);
});
test('CLI without approval stops before credentials, provider calls or ledger writes',()=>{
  const r=spawnSync(process.execPath,['src/run-live.mjs','--smoke'],{cwd:new URL('..',import.meta.url),encoding:'utf8',env:{PATH:process.env.PATH}});
  assert.equal(r.status,2);assert.match(r.stdout,/BLOCKED/);assert.equal(r.stderr,'');
});
test('request budget survives restart; reservations and failed/uncertain requests cannot be retried',t=>{
  const p=setup(t),gate=liveGate(p);
  for(let i=0;i<8;i++)gate.reserve(`request-${i}`,'jev');
  const resumed=liveGate(p);
  assert.throws(()=>resumed.reserve('request-0','jev'),/configuration/);
  assert.throws(()=>resumed.reserve('request-9','jev'),/configuration/);
  assert.equal(readFileSync(p.ledgerPath,'utf8').trim().split('\n').length,8);
});
test('unknown model and stale ledger cannot borrow approval',t=>{
  const p=setup(t),gate=liveGate(p);
  assert.throws(()=>gate.reserve('wrong','other'),/configuration/);
  writeFileSync(p.ledgerPath,JSON.stringify({protocolHash:'old',reserveUSD:0.1})+'\n');
  assert.throws(()=>liveGate(p),/configuration/);
});
test('dollar limit rejects a call before reservation even with request headroom',t=>{
  const p=setup(t);
  writeFileSync(p.ledgerPath,JSON.stringify({requestId:'previous',protocolHash,reserveUSD:2.99})+'\n');
  assert.throws(()=>liveGate(p).reserve('over-budget','astra'),/configuration/);
  assert.equal(readFileSync(p.ledgerPath,'utf8').trim().split('\n').length,1);
});
test('frozen data matches generator, opaque IDs have no shared label code, all requests fit cap',()=>{
  const data=generateFixtures();assert.equal(digest(data),protocol.datasetHash);
  assert.equal(new Set(data.flatMap(eligible).map(c=>c.id)).size,1536);
  const prep=JSON.parse(readFileSync(new URL('../results/preparation.json',import.meta.url),'utf8'));
  assert.ok(prep.requestBytes.every(x=>x.jev<=12000&&x.frontier<=12000));
});
