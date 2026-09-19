import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,unlinkSync,readdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';import {execFileSync,spawnSync} from 'node:child_process';
import {syntheticHistory} from './helpers/accepted-history.mjs';
import {inspectAcceptedSmoke,aggregateHistoricalAccounting,verifyPinnedMetadata} from '../src/smoke-evidence.mjs';
import {fullRunGate,fullWorkload,assertCumulativeCapacity} from '../src/full-gate.mjs';
import {fileHash,PROTOCOL_HASH} from '../src/smoke-recovery.mjs';
import {executionProfile} from '../src/transport.mjs';import {buildPlan,RESERVATION} from '../src/plan.mjs';import {digest,generateFixtures} from '../src/fixtures.mjs';
globalThis.fetch=()=>{throw new Error('NETWORK_DISABLED_IN_TESTS');};
const gate=p=>fullRunGate({approved:true,apiKey:'SYNTHETIC_ONLY',protocolHash:PROTOCOL_HASH,outputDir:p.outputDir,readHistory:p.readHistory});
const hashes=dir=>Object.fromEntries(readdirSync(dir).map(n=>[n,fileHash(join(dir,n))]));
function changeObservation(p,mutate){
 const name='smoke-plan-recovery-2.json',row=p.read(name);mutate(row);p.write(name,row);p.reanchor(name);
 const log='smoke-recovery-2-results.jsonl',events=p.readLines(log);events[1]={event:'observation',...row};p.lines(log,events);p.reanchor(log);
}
test('accepted recovery-2 qualifies without original smoke-summary and retains UNKNOWN actual model',t=>{
 const p=syntheticHistory(t),before=hashes(p.outputDir),r=p.readHistory();
 assert.equal(r.qualifyingSmoke,'smoke-recovery-2');assert.deepEqual(r.qualifyingCapabilities,['plan','narration','feedback','summary','jev']);
 assert.equal(p.read('smoke-plan-recovery-2.json').metadata.actualModel,null);assert.equal(existsSync(join(p.outputDir,'smoke-summary.json')),false);assert.deepEqual(hashes(p.outputDir),before);
});
test('all three ledgers count, known Gateway spend is separate, absent charges never become zero',t=>{
 const r=syntheticHistory(t).readHistory();assert.equal(r.attempts,8);assert.equal(r.reservedUSD,2.43696);assert.equal(r.remainingReservationUSD,27.56304);
 assert.deepEqual(r.ledgerTotals.map(r=>[r.attempts,r.reservedUSD]),[[2,0.69056],[1,0.34528],[5,1.40112]]);
 assert.equal(r.knownReportedCostUSD,0.0283675);assert.equal(r.reportedCostUSD,null);assert.deepEqual(r.unknownChargeRequestIds,['smoke-plan','smoke-narration']);
 assert.equal(r.ownerReportedPrior403SpendUSD,0);assert.equal(r.ownerReportedPrior403Source,'owner_report');
});
for(const missing of ['smoke-recovery-2-manifest.json','smoke-summary-recovery-2.json','smoke-jev-recovery-2.json','smoke-recovery-2-results.jsonl','smoke-recovery-1-reservations.jsonl'])test('missing/partial history rejects: '+missing,t=>{
 const p=syntheticHistory(t);unlinkSync(join(p.outputDir,missing));assert.throws(()=>p.readHistory());assert.throws(()=>gate(p));assert.equal(existsSync(join(p.outputDir,'full-reservations.jsonl')),false);
});
test('altered historical bytes or acceptance hashes reject, without rewriting originals',t=>{
 const p=syntheticHistory(t);writeFileSync(join(p.outputDir,'smoke-plan.json'),'changed');assert.throws(()=>p.readHistory(),e=>e.category==='accepted_historical_artifact_changed');
 const q=syntheticHistory(t);q.accepted.artifactHashes['smoke-plan.json']='0'.repeat(64);assert.throws(()=>q.readHistory());
});
test('wrong protocol, manifest digest, snapshot execution commit or lineage cannot qualify',t=>{
 const p=syntheticHistory(t);assert.throws(()=>inspectAcceptedSmoke({...p,protocolHash:'wrong'}));
 const q=syntheticHistory(t);q.accepted.manifestHashes['smoke-recovery-2']='wrong';assert.throws(()=>q.readHistory());
 const z=syntheticHistory(t),snapshot=z.read('smoke-recovery-2-manifest.json');snapshot.executionCommit='a'.repeat(40);z.write('smoke-recovery-2-manifest.json',snapshot);z.reanchor('smoke-recovery-2-manifest.json');assert.throws(()=>z.readHistory(),e=>e.category==='accepted_execution_snapshot_mismatch');
 assert.throws(()=>inspectAcceptedSmoke({...p,isAncestor:()=>false}),e=>e.category==='accepted_execution_lineage_mismatch');
 const checks=[];inspectAcceptedSmoke({...p,isAncestor:(a,b)=>{checks.push([a,b]);return true;}});assert.deepEqual(checks,[[p.accepted.baseCommit,p.accepted.priorRecoveryCommit],[p.accepted.priorRecoveryCommit,p.accepted.executionCommit],[p.accepted.executionCommit,'HEAD']]);
});
for(const [name,mutate] of [
 ['failed observation',r=>{r.status='failed';}],['wrong provider',r=>{r.metadata.finalProvider='azure';}],
 ['extra provider attempt',r=>{r.metadata.providerAttempts=2;}],['extra model attempt',r=>{r.metadata.modelAttempts=2;}],
 ['extra successful provider',r=>{r.metadata.successfulProviderAttempts=2;}],['missing cost',r=>{r.metadata.costUSD=null;}],
 ['missing usage',r=>{r.metadata.inputTokens=null;}],['wrong canonical',r=>{r.metadata.gatewayCanonicalModel='openai/gpt-5.4';}],
 ['SDK echo only',r=>{r.metadata={response:{modelId:'openai/gpt-6-astra'}};}],['warning',r=>{r.warningsCount=1;}],
 ['multiple HTTP attempts',r=>{r.httpRequests=2;}],['request hash',r=>{r.requestHash='wrong';}],
])test('qualifying evidence rejects '+name+' even after matching synthetic byte hashes',t=>{const p=syntheticHistory(t);changeObservation(p,mutate);assert.throws(()=>p.readHistory());});
for(const [name,mutate] of [
 ['partial capability set',e=>{delete e.at(-1).capabilities.jev;}],['retry',e=>{e.at(-1).retries=1;}],
 ['fallback',e=>{e.at(-1).fallbackConfigured=true;}],['missing completion',e=>{e.pop();}],
 ['partial observation log',e=>{e.splice(1,1);}],
])test('completion rejects '+name,t=>{const p=syntheticHistory(t),name='smoke-recovery-2-results.jsonl',events=p.readLines(name);mutate(events);p.lines(name,events);p.reanchor(name);assert.throws(()=>p.readHistory());});
function ledger(entries,requests,observations){return [{name:'synthetic-ledger',entries,requests,manifestHash:null,observations}];}
const reservation=id=>({requestId:id,kind:'astra',protocolHash:PROTOCOL_HASH,reserveUSD:RESERVATION.astra});
const observation=id=>({id,kind:'astra',protocolHash:PROTOCOL_HASH,metadata:{costUSD:0}});
test('duplicate historical IDs fail even across independently valid ledger manifests',()=>{
 const item=ledger([reservation('one')],[{id:'one',kind:'astra'}],[observation('one')])[0];
 assert.throws(()=>aggregateHistoricalAccounting([item,{...item,name:'second'}],PROTOCOL_HASH),e=>e.category==='duplicate_historical_request_id');
});
test('historical ledger protocol, model, reservation value and manifest membership must match',()=>{
 for(const patch of [{protocolHash:'wrong'},{kind:'jev'},{reserveUSD:0},{requestId:'unknown'}])assert.throws(()=>aggregateHistoricalAccounting(ledger([{...reservation('one'),...patch}],[{id:'one',kind:'astra'}],[observation('one')]),PROTOCOL_HASH));
});
test('cumulative historical reservations exceeding $30 reject before any full call',()=>{
 const ids=Array.from({length:87},(_,i)=>'id-'+i);
 assert.throws(()=>aggregateHistoricalAccounting(ledger(ids.map(reservation),ids.map(id=>({id,kind:'astra'})),ids.map(observation)),PROTOCOL_HASH),e=>e.category==='historical_budget_exhausted');
 assert.throws(()=>assertCumulativeCapacity({attempts:8,reservedUSD:4.2},fullWorkload()),e=>e.category==='cumulative_full_budget_exhausted');
 assert.throws(()=>assertCumulativeCapacity({attempts:9,reservedUSD:2.5},fullWorkload()),e=>e.category==='cumulative_full_budget_exhausted');
});
test('full workload is exactly the frozen 32/64/24 projection; no smoke or diagnostics scheduled',()=>{
 const w=fullWorkload(),original=buildPlan(generateFixtures());assert.equal(w.manifest.length,120);assert.deepEqual(w.counts,{development:32,heldout:64,sentinel:24});assert.equal(w.reservedUSD,25.82016);
 assert.deepEqual(w.manifest,original.manifest.filter(r=>['development','heldout','sentinel'].includes(r.stage)));
 assert.equal(w.planHash,JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url))).planHash);
 assert.equal(w.manifest.some(r=>r.id.startsWith('smoke-')||r.id.startsWith('diagnostic-')),false);
});
test('120 full reservations start at all eight old attempts, use a separate ledger and preserve all historical bytes',t=>{
 const p=syntheticHistory(t),before=hashes(p.outputDir),g=gate(p);let last;
 assert.equal(g.snapshot().cumulativeReservedAttempts,8);assert.equal(g.snapshot().cumulativeReservedUSD,2.43696);
 for(const r of g.workload.manifest)last=g.reserve(r.id,r.kind);
 assert.equal(last.count,128);assert.equal(last.reservedUSD,28.25712);assert.equal(g.snapshot().remainingReservationUSD,1.74288);
 assert.equal(p.readLines('full-reservations.jsonl').length,120);
 for(const [n,h] of Object.entries(before))assert.equal(fileHash(join(p.outputDir,n)),h);
 const again=gate(p),first=g.workload.manifest[0];assert.throws(()=>again.reserve(first.id,first.kind),e=>e.category==='request_already_reserved');
 assert.equal(again.snapshot().cumulativeReservedAttempts,128);assert.equal(again.snapshot().cumulativeReservedUSD,28.25712);
});
test('full gate rejects every smoke and diagnostic ID, including explicit historical names',t=>{
 const p=syntheticHistory(t),g=gate(p);
 for(const id of ['smoke-plan','smoke-jev','smoke-plan-recovery-1','smoke-plan-recovery-2','smoke-jev-recovery-2','diagnostic-1'])assert.throws(()=>g.reserve(id,id.includes('jev')?'jev':'astra'),e=>e.category==='request_outside_full_manifest');
 assert.equal(existsSync(join(p.outputDir,'full-reservations.jsonl')),false);
});
test('history or concurrent full-ledger changes stop new reservations; no reset semantics',t=>{
 const p=syntheticHistory(t),g=gate(p),[a,b]=g.workload.manifest;g.reserve(a.id,a.kind);const prior=readFileSync(join(p.outputDir,'full-reservations.jsonl'),'utf8');
 writeFileSync(join(p.outputDir,'smoke-plan.json'),'changed');assert.throws(()=>g.reserve(b.id,b.kind));assert.equal(readFileSync(join(p.outputDir,'full-reservations.jsonl'),'utf8'),prior);
 const q=syntheticHistory(t),h=gate(q);writeFileSync(join(q.outputDir,'full-reservations.jsonl'),'{}\n');assert.throws(()=>h.reserve(a.id,a.kind));assert.throws(()=>gate(q));
});
test('cached observations need a reservation and validated pinned metadata; UNKNOWN still passes',t=>{
 const p=syntheticHistory(t),g=gate(p),r=g.workload.manifest.find(r=>r.kind==='astra'),metadata=p.read('smoke-plan-recovery-2.json').metadata;
 const row={id:r.id,kind:r.kind,protocolHash:PROTOCOL_HASH,status:'success',result:{metadata}};
 assert.throws(()=>g.validateObservation(r.id,r.kind,row));g.reserve(r.id,r.kind);g.validateObservation(r.id,r.kind,row);
 assert.throws(()=>g.validateObservation(r.id,r.kind,{...row,result:{metadata:{...metadata,providerAttempts:2}}}));
 verifyPinnedMetadata({...metadata,gatewayCanonicalModel:null,modelAttemptCanonicalModel:null},executionProfile('astra'));
});
test('full CLI without approval makes no call and writes no ledger',()=>{
 const r=spawnSync(process.execPath,['src/run-live.mjs','--full'],{cwd:new URL('..',import.meta.url),encoding:'utf8',env:{PATH:process.env.PATH}});assert.equal(r.status,2);assert.match(r.stdout,/BLOCKED/);assert.equal(r.stderr,'');
});
test('experiment changes only experiment files, status and authorized evidence report; frozen algorithms and production files untouched',()=>{
 const root=new URL('../../../',import.meta.url),base='65a90280b01e7d461cc62c0580d50d810b6818a6';
 const git=(...args)=>execFileSync('git',['-c','core.safecrlf=false',...args],{cwd:root,encoding:'utf8'}).trim();
 const paths=git('diff','--name-only',base).split('\n').filter(Boolean);assert.ok(paths.every(p=>p==='DEV_STATUS.md'||p==='PHASE375_TECHNICAL_BAKEOFF.md'||p.startsWith('experiments/phase375-bakeoff/')));
 const frozen=['fixtures/frozen-protocol.json','src/fixtures.mjs','src/policy.mjs','src/plan.mjs','src/resolver.mjs','src/requests.mjs','src/transport.mjs','package.json','pnpm-lock.yaml'];
 for(const p of frozen)assert.equal(git('diff',base,'--','experiments/phase375-bakeoff/'+p),'');
 const source=readFileSync(new URL('../src/run-live.mjs',import.meta.url),'utf8'),prior=git('show',base+':experiments/phase375-bakeoff/src/run-live.mjs');
 const calibration=s=>s.slice(s.indexOf('    const development=data.filter'),s.indexOf("    save('live-summary.json'"));assert.equal(calibration(source).replaceAll('\r\n','\n'),calibration(prior).replaceAll('\r\n','\n'));
 assert.equal(digest(buildPlan(generateFixtures())),fullWorkload().planHash);
});
