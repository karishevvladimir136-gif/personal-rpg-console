import {readFileSync,writeFileSync,mkdtempSync,rmSync,readdirSync} from 'node:fs';
import {join} from 'node:path';import {tmpdir} from 'node:os';
import {digest} from '../../src/fixtures.mjs';
import {executionProfile,safeMetadata} from '../../src/transport.mjs';
import {fileHash,PROTOCOL_HASH} from '../../src/smoke-recovery.mjs';
import {RESERVATION} from '../../src/plan.mjs';
import {inspectAcceptedSmoke,money} from '../../src/smoke-evidence.mjs';
const fixture=name=>JSON.parse(readFileSync(new URL('../../fixtures/'+name,import.meta.url),'utf8'));
export function syntheticHistory(t){
 const outputDir=mkdtempSync(join(tmpdir(),'rpg-full-history-'));t.after(()=>rmSync(outputDir,{recursive:true,force:true}));
 const write=(name,value)=>writeFileSync(join(outputDir,name),JSON.stringify(value)+'\n');
 const lines=(name,rows)=>writeFileSync(join(outputDir,name),rows.map(r=>JSON.stringify(r)).join('\n')+'\n');
 const manifests=[fixture('smoke-recovery-1.json'),fixture('smoke-recovery-2.json')],accepted=fixture('accepted-smoke-recovery-2.json');
 const original=['smoke-plan','smoke-narration'].map(id=>({id,kind:'astra',protocolHash:PROTOCOL_HASH,status:'failed',error:{category:'unsupported_or_denied'}}));
 for(const r of original)write(r.id+'.json',r);
 lines('reservations.jsonl',original.map(r=>({requestId:r.id,kind:'astra',protocolHash:PROTOCOL_HASH,reserveUSD:RESERVATION.astra})));
 let knownCost=0;
 for(const manifest of manifests){
  manifest.historyHashes=Object.fromEntries(readdirSync(outputDir).sort().map(n=>[n,fileHash(join(outputDir,n))]));
  const hash=digest(manifest),isSecond=manifest.id==='smoke-recovery-2',executionCommit=isSecond?accepted.executionCommit:accepted.priorRecoveryCommit;
  const requests=manifest.requests.slice(0,isSecond?5:1);
  const rows=requests.map(r=>{
    const p=executionProfile(r.kind),cost=isSecond?0.00001:0.0283175;
    const metadata=safeMetadata({gateway:{cost,routing:{originalModelId:p.model,canonicalSlug:p.model,finalProvider:p.provider,modelAttemptCount:1,totalProviderAttemptCount:1,modelAttempts:[{canonicalSlug:p.model,success:true,providerAttemptCount:1,providerAttempts:[{provider:p.provider,success:true}]}]}}},{inputTokens:20,outputTokens:10},p,1);
    if(!isSecond)metadata.routingVerified=false;
    return {id:r.id,kind:r.kind,capability:r.capability,protocolHash:PROTOCOL_HASH,recoveryManifestHash:hash,requestHash:r.requestHash,status:isSecond?'success':'failed',error:isSecond?null:{category:'unverified_routing'},metadata,outputHash:digest('synthetic output'),httpStatus:200,httpRequests:1,warningsCount:0};
  });
  write(manifest.id+'-manifest.json',{manifest,manifestHash:hash,executionCommit,startedAtUTC:'2026-09-19T00:00:00.000Z'});
  lines(manifest.id+'-reservations.jsonl',requests.map(r=>({requestId:r.id,kind:r.kind,protocolHash:PROTOCOL_HASH,recoveryManifestHash:hash,reserveUSD:RESERVATION[r.kind]})));
  for(const r of rows)write(r.id+'.json',r);
  const cost=money(rows.reduce((n,r)=>n+r.metadata.costUSD,0));knownCost=money(knownCost+cost);
  const completed={event:'completed',status:isSecond?'RECOVERY_SMOKE_PASSED':'RECOVERY_SMOKE_STOPPED',executionCommit,protocolHash:PROTOCOL_HASH,recoveryManifestHash:hash,additionalHTTPRequests:requests.length,additionalReservations:requests.length,cumulativeHTTPRequests:isSecond?8:3,cumulativeReservedUSD:isSecond?2.43696:1.03584,reportedAdditionalCostUSD:cost,reportedCumulativeKnownCostUSD:knownCost,retries:0,fallbackConfigured:false,originalHistoryPreserved:true,capabilities:Object.fromEntries(manifest.requests.map(r=>[r.capability,isSecond?'success':r.capability==='plan'?'failed':'not_attempted']))};
  lines(manifest.id+'-results.jsonl',[{event:'started',manifestHash:hash,executionCommit},...rows.map(r=>({event:'observation',...r})),completed]);
  accepted.manifestHashes[manifest.id]=hash;
 }
 accepted.artifactHashes=Object.fromEntries(readdirSync(outputDir).map(n=>[n,fileHash(join(outputDir,n))]));
 const options={outputDir,protocolHash:PROTOCOL_HASH,accepted,manifests,isAncestor:()=>true};
 return {...options,write,lines,read:name=>JSON.parse(readFileSync(join(outputDir,name),'utf8')),readLines:name=>readFileSync(join(outputDir,name),'utf8').trim().split('\n').map(JSON.parse),readHistory:()=>inspectAcceptedSmoke(options),reanchor:name=>{accepted.artifactHashes[name]=fileHash(join(outputDir,name));}};
}
