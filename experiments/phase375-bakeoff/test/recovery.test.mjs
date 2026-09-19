import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync,readdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {digest,generateFixtures,payload} from '../src/fixtures.mjs';
import {questions} from '../src/requests.mjs';
import {executionProfile} from '../src/transport.mjs';
import {RESERVATION} from '../src/plan.mjs';
import {recoveryRequests,requestHash,verifyFrozen,verifyHistory,recoveryGate,runRecovery,fileHash,PROTOCOL_HASH,metadataFailure} from '../src/smoke-recovery.mjs';
import * as domain from '../../../src/lib/gameplay/dm-schema.ts';
import * as summary from '../../../src/lib/memory/summary.ts';
import {runtimeFixture} from '../../../tests/phase2-runtime-fixtures.mjs';

globalThis.fetch=()=>{throw new Error('NETWORK_DISABLED_IN_TESTS');};
const frozen=JSON.parse(readFileSync(new URL('../fixtures/smoke-recovery-1.json',import.meta.url),'utf8'));
const requests=await recoveryRequests();
const outputs=[runtimeFixture().plan,{narration:'The synthetic gate opens.',visualDescription:'A brass gate.',clarification:null},{narration:'A slower pace is possible.',guidanceProposal:null},{schemaVersion:1,selections:[]}];
const privateMarker='SYNTHETIC_ERROR_NEVER_LOG';
function setup(t){
  const dir=mkdtempSync(join(tmpdir(),'rpg-recovery-test-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
  writeFileSync(join(dir,'reservations.jsonl'),['smoke-plan','smoke-narration'].map(requestId=>JSON.stringify({requestId,kind:'astra',protocolHash:PROTOCOL_HASH,reserveUSD:RESERVATION.astra})).join('\n')+'\n');
  for(const id of ['smoke-plan','smoke-narration'])writeFileSync(join(dir,id+'.json'),JSON.stringify({id,status:'failed',error:{code:'configuration',category:'unsupported_or_denied',retryable:false}})+'\n');
  const manifest=structuredClone(frozen);manifest.historyHashes=Object.fromEntries(Object.keys(frozen.historyHashes).map(n=>[n,fileHash(join(dir,n))]));
  return {manifest,approvedHash:digest(manifest),apiKey:'SYNTHETIC_ONLY',outputDir:dir,executionCommit:'synthetic-test-commit'};
}
function body(index,mode='valid'){
  const provider=index===4?'typesafe-ai':'openai',model=index===4?'jev':'gpt-6-astra';
  const metadata={gateway:{cost:'0.00001',routing:{finalProvider:provider,resolvedProviderApiModelId:model,modelAttemptCount:1,totalProviderAttemptCount:1,modelAttempts:[{providerAttempts:[{provider,providerApiModelId:model,success:true}]}],planningReasoning:privateMarker}}};
  if(mode==='routing')delete metadata.gateway.routing;
  if(mode==='billing')delete metadata.gateway.cost;
  if(mode==='attempt-count')delete metadata.gateway.routing.totalProviderAttemptCount;
  if(mode==='fallback')metadata.gateway.routing.totalProviderAttemptCount=2;
  if(mode==='wrong-provider')metadata.gateway.routing.finalProvider='azure';
  const packet=index===4?{answers:Object.fromEntries(Object.keys(requests[4].questions).map(id=>[id,{type:'choice',choice:'uncertain',probabilities:{relevant:0.1,irrelevant:0.1,uncertain:0.8}}])),usage:{inputTokens:20,outputTokens:0},providerMetadata:metadata}:{content:[{type:'text',text:JSON.stringify(outputs[index])}],finishReason:{unified:'stop',raw:'stop'},usage:{inputTokens:{total:20,noCache:20,cacheRead:0,cacheWrite:0},outputTokens:{total:10,text:10,reasoning:0}},providerMetadata:metadata};
  if(mode==='warnings')packet.warnings=[{type:'unsupported',feature:privateMarker}];
  return packet;
}
const response=b=>new Response(JSON.stringify(b),{headers:{'Content-Type':'application/json'}});

test('recovery packets equal the original frozen smoke block: prompts, inputs, pins, schemas and parsers',async()=>{
  const original=readFileSync(new URL('../src/run-live.mjs',import.meta.url),'utf8');
  const block=original.slice(original.indexOf("    const job={id:'synthetic-job'"),original.indexOf("    save('smoke-summary.json'"));
  const captured=[];const port={structured:async(profile,instructions,input,schema,parse)=>captured.push({profile,instructions,input,schema,parse}),classify:async(profile,state,questions)=>captured.push({profile,state,questions})};
  const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
  await new AsyncFunction('domain','summary','attempt','port','profiles','payload','data','questions',block)(domain,summary,async(_id,_kind,call)=>call(),port,{astra:executionProfile('astra'),jev:executionProfile('jev')},payload,generateFixtures(),questions);
  assert.equal(captured.length,5);
  for(let i=0;i<5;i++){
    const r=requests[i],c=captured[i];
    assert.equal(requestHash(r),requestHash({...c,kind:r.kind}));
    if(i<3)assert.equal(r.parse,c.parse);
    if(i<4)assert.deepEqual(r.parse(outputs[i]),c.parse(outputs[i]));
  }
  verifyFrozen(frozen,requests);
});

test('recovery keeps original history byte-identical and counts all old reservations without refund',t=>{
  const p=setup(t),gate=recoveryGate(p.manifest,p.outputDir);let final;
  for(const r of requests)final=gate.reserve(r.id,r.kind);
  assert.equal(final.additionalReserved,5);assert.ok(Math.abs(final.cumulativeReservedUSD-2.09168)<1e-9);
  verifyHistory(p.manifest,p.outputDir);
  assert.throws(()=>gate.reserve('diagnostic-1','astra'));
  assert.throws(()=>gate.reserve(requests[0].id,'astra'));
  assert.throws(()=>recoveryGate(p.manifest,p.outputDir));
});

test('old IDs, out-of-order checks, changed history and reused observation IDs cannot reserve',t=>{
  const p=setup(t),gate=recoveryGate(p.manifest,p.outputDir);
  assert.throws(()=>gate.reserve('smoke-plan','astra'));
  assert.throws(()=>gate.reserve('smoke-feedback','astra'));
  writeFileSync(join(p.outputDir,requests[0].id+'.json'),'{}');assert.throws(()=>gate.reserve(requests[0].id,'astra'));
  writeFileSync(join(p.outputDir,'smoke-plan.json'),'changed');assert.throws(()=>verifyHistory(p.manifest,p.outputDir));
});

test('all five exact capabilities must pass, serialized; observation history is never overwritten',async t=>{
  const p=setup(t);let calls=0,inFlight=0,maxInFlight=0;
  const result=await runRecovery({...p,fetcher:async(url,init)=>{
    const index=calls++;inFlight++;maxInFlight=Math.max(maxInFlight,inFlight);
    const wire=JSON.parse(init.body);assert.deepEqual(wire.providerOptions,requests[index].profile.providerOptions);
    if(index<4)assert.deepEqual(wire.responseFormat.schema,requests[index].schema);
    assert.match(String(url),index===4?/\/evaluation-model$/:/\/language-model$/);
    await new Promise(resolve=>setTimeout(resolve,2));inFlight--;return response(body(index));
  }});
  assert.equal(calls,5);assert.equal(maxInFlight,1);assert.equal(result.status,'RECOVERY_SMOKE_PASSED');
  assert.equal(result.additionalHTTPRequests,5);assert.ok(Math.abs(result.reportedAdditionalCostUSD-0.00005)<1e-12);
  assert.deepEqual(Object.values(result.capabilities),['success','success','success','success','success']);
  verifyHistory(p.manifest,p.outputDir);
  const before=Object.fromEntries(readdirSync(p.outputDir).map(n=>[n,fileHash(join(p.outputDir,n))]));
  await assert.rejects(()=>runRecovery({...p,fetcher:async()=>{throw new Error('MUST_NOT_CALL');}}));
  assert.deepEqual(Object.fromEntries(readdirSync(p.outputDir).map(n=>[n,fileHash(join(p.outputDir,n))])),before);
});

for(const mode of ['403','routing','billing','attempt-count','fallback','wrong-provider','warnings']){
  test(`funded ${mode} stops after one request with safe metadata and no remaining calls`,async t=>{
    const p=setup(t);let calls=0;
    const result=await runRecovery({...p,fetcher:async()=>{calls++;return mode==='403'?new Response(JSON.stringify({error:{message:privateMarker}}),{status:403}):response(body(0,mode));}});
    assert.equal(calls,1);assert.equal(result.status,'RECOVERY_SMOKE_STOPPED');assert.equal(result.capabilities.jev,'not_attempted');
    assert.equal(existsSync(join(p.outputDir,'smoke-narration-recovery-1.json')),false);
    const raw=readFileSync(join(p.outputDir,'smoke-recovery-1-results.jsonl'),'utf8');assert.equal(raw.includes(privateMarker),false);
    if(mode==='403')assert.equal(JSON.parse(readFileSync(join(p.outputDir,requests[0].id+'.json'),'utf8')).httpStatus,403);
    verifyHistory(p.manifest,p.outputDir);
  });
}

test('missing approval, changed prompt, changed limit and active shared run lock block before provider calls',async t=>{
  const p=setup(t);const never=async()=>{throw new Error('MUST_NOT_CALL');};
  await assert.rejects(()=>runRecovery({...p,approvedHash:'wrong',fetcher:never}));
  const altered=structuredClone(frozen);altered.additionalCalls=6;assert.throws(()=>verifyFrozen(altered,requests));
  const changed=requests.map(r=>({...r}));changed[0].instructions+=' changed';assert.throws(()=>verifyFrozen(frozen,changed));
  writeFileSync(join(p.outputDir,'run.lock'),'another run');await assert.rejects(()=>runRecovery({...p,fetcher:never}));
  assert.equal(readFileSync(join(p.outputDir,'run.lock'),'utf8'),'another run');
  assert.equal(existsSync(join(p.outputDir,'smoke-recovery-1-reservations.jsonl')),false);
});

test('metadata gates reject missing counts, invalid cost and multiple provider/model attempts',()=>{
  const p=executionProfile('astra'),m={routingVerified:true,finalProvider:'openai',actualModel:'gpt-6-astra',modelAttempts:1,providerAttempts:1,costUSD:0,inputTokens:0,outputTokens:0};
  assert.equal(metadataFailure(m,p),null);
  for(const patch of [{modelAttempts:2},{providerAttempts:2},{costUSD:null},{inputTokens:null},{providerAttempts:null}])assert.notEqual(metadataFailure({...m,...patch},p),null);
});
