// Separate, one-shot smoke recovery. The frozen benchmark and original ledger remain read-only.
import { readFileSync,existsSync,openSync,writeSync,fsyncSync,closeSync,unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { digest,generateFixtures,payload } from './fixtures.mjs';
import { questions,requestContractHash } from './requests.mjs';
import { resolverContractHash } from './resolver.mjs';
import { buildPlan,RESERVATION,LIMITS } from './plan.mjs';
import { experimentalTransport,executionProfile,safeError,safeMetadata,SafeFailure } from './transport.mjs';

export const BASE_COMMIT='62772744d48a9c20611bd0c973dea9d0c7ba45cb';
export const PROTOCOL_HASH='5b8f0afccc8c2c4eeddbadb098188d1127cd3c3b58c7c98840706b171aac0a5d';
export const RECOVERY_ID='smoke-recovery-1';
export const IDS=['smoke-plan-recovery-1','smoke-narration-recovery-1','smoke-feedback','smoke-summary','smoke-jev'];
export const RECOVERY_2_ID='smoke-recovery-2';
export const IDS_2=['smoke-plan-recovery-2','smoke-narration-recovery-2','smoke-feedback-recovery-2','smoke-summary-recovery-2','smoke-jev-recovery-2'];
/** @param {string} id */
const idsFor=id=>id===RECOVERY_2_ID?IDS_2:IDS;
/** @param {string} id */
const historyNames=id=>['reservations.jsonl','smoke-plan.json','smoke-narration.json',...(id===RECOVERY_2_ID?['smoke-plan-recovery-1.json','smoke-recovery-1-manifest.json','smoke-recovery-1-reservations.jsonl','smoke-recovery-1-results.jsonl']:[])];
/** @param {string} path */
export const fileHash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
/** @param {string} category */
const fail=category=>{throw new SafeFailure('configuration',category);};
/** @param {string} path @param {unknown} value @param {'wx'|'a'} mode */
function durableWrite(path,value,mode){const fd=openSync(path,mode);try{writeSync(fd,JSON.stringify(value)+'\n');fsyncSync(fd);}finally{closeSync(fd);}}

// Verbatim smoke inputs; parity test executes the original frozen smoke block independently.
/** @param {string} [recoveryId] */
export async function recoveryRequests(recoveryId=RECOVERY_ID){
  const ids=idsFor(recoveryId);
  const domain=await import(new URL('../../../src/lib/gameplay/dm-schema.ts',import.meta.url).href);
  const summary=await import(new URL('../../../src/lib/memory/summary.ts',import.meta.url).href);
  const job={id:'synthetic-job',campaignId:'synthetic-campaign',visibility:'public',generation:1,stateRevision:1,settingsRevision:1,fromSequence:0,throughSequence:0,sources:[],requiredSourceIds:[]};
  const cases=[['plan',domain.planSchema,domain.parsePlan],['narration',domain.narrationSchema,domain.parseNarration],['feedback',domain.feedbackSchema,domain.parseFeedback],['summary',summary.summarySchemaFor(job),(/** @type {unknown} */ v)=>summary.parseSummary(v,job)]];
  /** @type {Record<string,any>[]} */
  const requests=cases.map(([capability,schema,parse],i)=>({id:ids[i],capability,kind:'astra',profile:executionProfile('astra'),instructions:'Return the smallest valid synthetic response. No changes or checks. For summary select no sources; for other stages give one short sentence with empty arrays and nullable fields null.',input:{scene:'An empty synthetic courtyard at rest.'},schema,parse}));
  const first=generateFixtures()[0];
  requests.push({id:ids[4],capability:'jev',kind:'jev',profile:executionProfile('jev'),state:payload(first),questions:questions(first)});
  return requests;
}
/** Hash all transmitted content/options, excluding only local attempt identity/parser function.
 * @param {Record<string,any>} r
 */
export const requestHash=r=>digest(r.kind==='jev'?{profile:r.profile,state:r.state,questions:r.questions}:{profile:r.profile,instructions:r.instructions,input:r.input,schema:r.schema});
/** @param {Record<string,any>} manifest @param {Record<string,any>[]} requests */
export function verifyFrozen(manifest,requests){
  const p=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8')),data=generateFixtures();
  if(manifest.baseCommit!==BASE_COMMIT||manifest.protocolHash!==PROTOCOL_HASH||digest(p)!==PROTOCOL_HASH||digest(data)!==p.datasetHash||requestContractHash(data)!==p.requestContractHash||resolverContractHash(data)!==p.resolverContractHash||digest(buildPlan(data))!==p.planHash)fail('frozen_contract_mismatch');
  if(![RECOVERY_ID,RECOVERY_2_ID].includes(manifest.id)||manifest.additionalCalls!==5||manifest.totalCalls!==8||manifest.cumulativeUSD!==3||manifest.retries!==0||manifest.concurrency!==1||manifest.requests.length!==5)fail('recovery_scope_mismatch');
  requests.forEach((r,i)=>{const m=manifest.requests[i];if(m.id!==idsFor(manifest.id)[i]||m.id!==r.id||m.kind!==r.kind||m.capability!==r.capability||m.requestHash!==requestHash(r)||digest(r.profile)!==digest(p.profiles[r.kind]))fail('recovery_request_mismatch');});
}
/** @param {Record<string,any>} manifest @param {string} outputDir */
export function verifyHistory(manifest,outputDir){
  const expected=historyNames(manifest.id);
  if(Object.keys(manifest.historyHashes).sort().join()!==expected.sort().join())fail('history_manifest_mismatch');
  for(const name of expected)if(fileHash(join(outputDir,name))!==manifest.historyHashes[name])fail('historical_artifact_changed');
}
/** All historical reservations count in full; funded old-gate failure remains a failure.
 * @param {Record<string,any>} manifest @param {string} outputDir
 */
function historicalBudget(manifest,outputDir){
  verifyHistory(manifest,outputDir);
  const ledgers=['reservations.jsonl',...(manifest.id===RECOVERY_2_ID?['smoke-recovery-1-reservations.jsonl']:[])];
  const prior=ledgers.flatMap(n=>readFileSync(join(outputDir,n),'utf8').trim().split('\n').map(x=>JSON.parse(x)));
  const expected=manifest.id===RECOVERY_2_ID?'smoke-plan,smoke-narration,smoke-plan-recovery-1':'smoke-plan,smoke-narration';
  if(prior.map(r=>r.requestId).join()!==expected||prior.some(r=>r.protocolHash!==PROTOCOL_HASH||r.kind!=='astra'||r.reserveUSD!==RESERVATION.astra))fail('historical_reservations_mismatch');
  let knownCostUSD=0;
  if(manifest.id===RECOVERY_2_ID){
    const funded=JSON.parse(readFileSync(join(outputDir,'smoke-plan-recovery-1.json'),'utf8'));
    if(funded.id!=='smoke-plan-recovery-1'||funded.status!=='failed'||funded.error?.category!=='unverified_routing'||funded.httpStatus!==200||!Number.isFinite(funded.metadata?.costUSD)||funded.metadata.costUSD<0||funded.metadata.costUSD>RESERVATION.astra)fail('historical_funded_observation_mismatch');
    knownCostUSD=funded.metadata.costUSD;
  }
  return {prior,knownCostUSD,reservedUSD:prior.reduce((n,r)=>n+r.reserveUSD,0)};
}
/** @param {Record<string,any>} manifest @param {string} outputDir */
export function recoveryGate(manifest,outputDir){
  const history=historicalBudget(manifest,outputDir),ledger=join(outputDir,manifest.id+'-reservations.jsonl');
  if(existsSync(ledger))fail('recovery_already_reserved_no_retry');
  let count=0,reserved=history.reservedUSD;
  return {
    /** @param {string} id @param {'astra'|'jev'} kind */
    reserve(id,kind){
      verifyHistory(manifest,outputDir);
      const r=manifest.requests[count];
      if(!r||r.id!==id||r.kind!==kind)fail('request_outside_recovery_manifest');
      const next=RESERVATION[kind];
      if(count>=manifest.additionalCalls||history.prior.length+count>=LIMITS.smokeCalls||reserved+next>=LIMITS.smokeUSD)fail('recovery_budget_exhausted');
      if(existsSync(join(outputDir,id+'.json')))fail('observation_already_exists');
      durableWrite(ledger,{requestId:id,kind,protocolHash:PROTOCOL_HASH,recoveryManifestHash:digest(manifest),reserveUSD:next},count===0?'wx':'a');
      count++;reserved+=next;return {additionalReserved:count,cumulativeReservedUSD:reserved};
    },
  };
}
/** Stricter smoke recovery gate: exactly one verified model/provider attempt and complete billing.
 * @param {Record<string,any>|null} m @param {Record<string,any>} profile
 */
export function metadataFailure(m,profile){
  if(!m||!m.routingVerified||m.finalProvider!==profile.provider)return 'unverified_routing';
  if(m.modelAttempts==null||m.providerAttempts==null)return 'missing_attempt_metadata';
  if(m.modelAttempts!==1||m.providerAttempts!==1)return 'unexpected_retry_or_fallback';
  if(['costUSD','inputTokens','outputTokens'].some(k=>!Number.isFinite(m[k])||m[k]<0))return 'missing_billing_metadata';
  return null;
}
/** Append-only local evidence; no raw bodies, errors, credentials or reasoning are persisted.
 * @param {{manifest:Record<string,any>,approvedHash:string,apiKey:string,outputDir:string,fetcher:typeof fetch,executionCommit:string}} options
 */
export async function runRecovery({manifest,approvedHash,apiKey,outputDir,fetcher,executionCommit}){
  if(!apiKey||approvedHash!==digest(manifest))fail('explicit_recovery_approval_required');
  const requests=await recoveryRequests(manifest.id);verifyFrozen(manifest,requests);verifyHistory(manifest,outputDir);
  for(const r of requests)if(existsSync(join(outputDir,`${r.id}.json`)))fail('recovery_observation_exists_no_retry');
  const history=historicalBudget(manifest,outputDir);
  const lockPath=join(outputDir,'run.lock'),lock=openSync(lockPath,'wx');
  /** @type {Record<string,any>[]} */ const rows=[];
  let httpCalls=0,cumulativeReservedUSD=history.reservedUSD;
  try{
    const gate=recoveryGate(manifest,outputDir);
    durableWrite(join(outputDir,manifest.id+'-manifest.json'),{manifest,manifestHash:approvedHash,executionCommit,startedAtUTC:new Date().toISOString()},'wx');
    const resultsPath=join(outputDir,manifest.id+'-results.jsonl');
    durableWrite(resultsPath,{event:'started',manifestHash:approvedHash,executionCommit},'wx');
    for(const r of requests){
      const reservation=gate.reserve(r.id,r.kind);cumulativeReservedUSD=reservation.cumulativeReservedUSD;
      const started=performance.now();
      let localCalls=0;
      /** @type {number|null} */ let httpStatus=null,warningsCount=null;
      /** @type {Record<string,any>|null} */ let observedMetadata=null;
      /** @type {Record<string,any>} */ let row={id:r.id,capability:r.capability,kind:r.kind,protocolHash:PROTOCOL_HASH,recoveryManifestHash:approvedHash,requestHash:requestHash(r),status:'failed',error:null};
      const port=experimentalTransport({apiKey,fetcher:async(url,init)=>{
        const u=new URL(String(url)),header=new Headers(init?.headers),wire=typeof init?.body==='string'?JSON.parse(init.body):null;
        const expectedEndpoint=r.kind==='jev'?'/evaluation-model':'/language-model';
        const requestedModel=header.get(r.kind==='jev'?'ai-model-id':'ai-language-model-id');
        if(localCalls!==0||httpCalls>=5||u.origin!=='https://ai-gateway.vercel.sh'||!u.pathname.endsWith(expectedEndpoint)||init?.method!=='POST'||requestedModel!==r.profile.model||digest(wire?.providerOptions)!==digest(r.profile.providerOptions))fail('unexpected_transport_or_pin');
        localCalls++;httpCalls++;
        // Forward the exact original SDK request. Inspect a clone only for safe status/metadata.
        const response=await fetcher(url,init);httpStatus=response.status;
        if(response.ok){try{
          const b=await response.clone().json();
          warningsCount=Array.isArray(b.warnings)?b.warnings.length:0;
          const usage=r.kind==='jev'?b.usage:{inputTokens:b.usage?.inputTokens?.total,outputTokens:b.usage?.outputTokens?.total};
          observedMetadata=safeMetadata(b.providerMetadata,usage,r.profile,performance.now()-started);
        }catch{observedMetadata=null;}}
        return response;
      }});
      try{
        const result=r.kind==='jev'?await port.classify(r.profile,r.state,r.questions):await port.structured(r.profile,r.instructions,r.input,r.schema,r.parse);
        const error=metadataFailure(result.metadata,r.profile);
        if(error)fail(error);
        if((result.metadata.costUSD??Infinity)>RESERVATION[/** @type {'astra'|'jev'} */(r.kind)])fail('reported_cost_exceeds_reservation');
        row={...row,status:'success',metadata:result.metadata,outputHash:digest('output' in result?result.output:result.answers),error:null};
      }catch(error){row.error=safeError(error);}
      row={...row,httpStatus,httpRequests:localCalls,warningsCount,metadata:row.metadata??observedMetadata,wallMs:performance.now()-started};
      if(httpStatus===403){row.status='failed';row.error={code:'configuration',category:'funded_http_403',retryable:false};}
      durableWrite(join(outputDir,`${r.id}.json`),row,'wx');
      durableWrite(resultsPath,{event:'observation',...row},'a');rows.push(row);
      verifyHistory(manifest,outputDir);
      if(row.status!=='success')break;
    }
    const success=rows.length===5&&rows.every(r=>r.status==='success');
    const costKnown=rows.every(r=>Number.isFinite(r.metadata?.costUSD));
    const result={event:'completed',status:success?'RECOVERY_SMOKE_PASSED':'RECOVERY_SMOKE_STOPPED',executionCommit,protocolHash:PROTOCOL_HASH,recoveryManifestHash:approvedHash,additionalHTTPRequests:httpCalls,cumulativeHTTPRequests:history.prior.length+httpCalls,additionalReservations:rows.length,cumulativeReservedUSD,reportedAdditionalCostUSD:costKnown?rows.reduce((n,r)=>n+r.metadata.costUSD,0):null,reportedHistoricalCostUSD:history.knownCostUSD,reportedCumulativeKnownCostUSD:costKnown?history.knownCostUSD+rows.reduce((n,r)=>n+r.metadata.costUSD,0):null,ownerReportedHistoricalSpendUSD:0,ownerReportedHistoricalStatus:403,dashboardSpendIndependentlyObserved:false,originalHistoryPreserved:true,capabilities:Object.fromEntries(requests.map(r=>[r.capability,rows.find(x=>x.id===r.id)?.status??'not_attempted'])),retries:0,fallbackConfigured:false};
    verifyHistory(manifest,outputDir);
    durableWrite(resultsPath,result,'a');
    return result;
  }finally{closeSync(lock);unlinkSync(lockPath);}
}
