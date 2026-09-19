import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { liveGate } from '../src/live-gate.mjs';
import { digest, generateFixtures, eligible } from '../src/fixtures.mjs';
import { buildPlan } from '../src/plan.mjs';
import { executionProfile } from '../src/transport.mjs';
import { EXTERNAL_FACTS } from '../src/external-facts.mjs';

const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
const protocolHash=digest(protocol);
const plan=buildPlan(generateFixtures());
const diagnostics=plan.manifest.filter(r=>r.stage==='diagnostic-separate-approval');
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
  const p={...setup(t),approvedDiagnosticIds:diagnostics.map(r=>r.id)},gate=liveGate(p);
  for(const r of plan.manifest.filter(r=>r.stage==='smoke').concat(diagnostics))gate.reserve(r.id,r.kind);
  const resumed=liveGate(p);
  assert.throws(()=>resumed.reserve('smoke-jev','jev'),e=>e.category==='request_already_reserved');
  assert.throws(()=>resumed.reserve('request-9','jev'),e=>e.category==='request_outside_approved_manifest');
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
  assert.throws(()=>liveGate(p).reserve('smoke-plan','astra'),e=>e.category==='approved_budget_exhausted');
  assert.equal(readFileSync(p.ledgerPath,'utf8').trim().split('\n').length,1);
  writeFileSync(p.ledgerPath,JSON.stringify({requestId:'previous',protocolHash,reserveUSD:29.99})+'\n');
  assert.throws(()=>liveGate({...p,phase:'full'}).reserve('smoke-plan','astra'),e=>e.category==='approved_budget_exhausted');
});
test('frozen data matches generator, opaque IDs have no shared label code, all requests fit cap',()=>{
  const data=generateFixtures();assert.equal(digest(data),protocol.datasetHash);
  assert.equal(new Set(data.flatMap(eligible).map(c=>c.id)).size,960);
  const prep=JSON.parse(readFileSync(new URL('../results/preparation.json',import.meta.url),'utf8'));
  assert.ok(prep.requestBytes.every(x=>x.jev<=12000&&x.frontier<=12000&&(x.resolver??0)<=12000));
  assert.equal(digest(plan),protocol.planHash);
});

test('125 normal reservations plus three separately approved diagnostics fit 128 calls and $30 including smoke',t=>{
  const p={...setup(t),phase:'full'},gate=liveGate(p);let last;
  for(const r of plan.manifest.filter(r=>r.stage!=='diagnostic-separate-approval'))last=gate.reserve(r.id,r.kind);
  assert.equal(last.count,125);assert.ok(last.reservedUSD<30);
  assert.throws(()=>gate.reserve('diagnostic-1','astra'),e=>e.category==='request_outside_approved_manifest');
  assert.throws(()=>gate.reserve('tidal-bell-resolver-A','astra'),e=>e.category==='request_outside_approved_manifest');
  const explicit=liveGate({...p,approvedDiagnosticIds:diagnostics.map(r=>r.id)});
  for(const r of diagnostics)last=explicit.reserve(r.id,r.kind);
  assert.equal(last.count,128);assert.ok(Math.abs(last.reservedUSD-28.25712)<1e-8);
  assert.equal(plan.manifest.filter(r=>r.stage==='sentinel').length,24);
});

test('synthetic transport privacy omission never confers production eligibility or weakens provider pins',()=>{
  for(const key of ['astra','jev']){
    const p=executionProfile(key);
    assert.equal(p.scope,'authored-synthetic-only');assert.deepEqual(p.providerOptions.gateway,{only:[p.provider]});
    assert.equal(p.maxRetries,0);assert.ok(Object.isFrozen(p.providerOptions.gateway.only));
  }
  assert.equal(EXTERNAL_FACTS.jev.productionPrivacyEligibility,'NOT_ELIGIBLE');
  assert.equal(EXTERNAL_FACTS.jev.embeddedInputUSDPerMillion,0.042);
  assert.deepEqual(EXTERNAL_FACTS.jev.providerListingPrivacy,{zdr:'NOT_LISTED',noTraining:'NOT_LISTED'});
});
