// Offline evidence analysis only. Never imported by run-live or the application.
import {generateFixtures,eligible,payload,digest} from './fixtures.mjs';
import {calibration,admissionMetrics,quantile,clusterRecallInterval} from './metrics.mjs';
import {classificationMeasurements} from './measurements.mjs';
import {rawAdmission,protect} from './policy.mjs';
import {parseClassification,questions,requestContractHash} from './requests.mjs';
import {resolverContractHash} from './resolver.mjs';
import {buildPlan,RESERVATION} from './plan.mjs';
import {verifyPinnedMetadata,money} from './smoke-evidence.mjs';
import {executionProfile} from './transport.mjs';

/** @typedef {import('./fixtures.mjs').Snapshot} Snapshot */
/** @param {boolean} condition @param {string} message */
function requireEvidence(condition,message){if(!condition)throw new Error(message);}
/** This intentionally describes ONLY the stopped first Jev development prefix, not resumable execution.
 * @param {Record<string,any>} evidence @param {Record<string,any>} protocol
 */
export function analyzePartialRun(evidence,protocol){
 const data=generateFixtures(),plan=buildPlan(data);
 requireEvidence(evidence.protocolHash===digest(protocol)&&digest(data)===protocol.datasetHash&&requestContractHash(data)===protocol.requestContractHash&&resolverContractHash(data)===protocol.resolverContractHash&&digest(plan)===protocol.planHash,'frozen_contract_mismatch');
 requireEvidence(evidence.executionCommit==='8c5a9f7e731a9ab2ce24b17a61423fe7b46e1e23','execution_checkpoint_mismatch');
 const history=evidence.history,ledger=evidence.fullLedger,rows=evidence.observations;
 requireEvidence(history.attempts===8&&history.reservedUSD===2.43696&&history.knownReportedCostUSD===0.0969725&&history.reportedCostUSD===null&&history.unknownChargeRequestIds.join() === 'smoke-plan,smoke-narration','historical_accounting_mismatch');
 requireEvidence(Array.isArray(ledger)&&Array.isArray(rows)&&ledger.length===rows.length&&rows.length>0&&rows.length<=16,'partial_coverage_mismatch');
 const development=data.filter(s=>s.split==='development'),seen=new Set(history.requestIds);
 for(let i=0;i<rows.length;i++){
  const row=rows[i],l=ledger[i],s=development[i];
  requireEvidence(row.id===s.id+'-jev'&&row.kind==='jev'&&l.requestId===row.id&&l.kind===row.kind&&!seen.has(row.id),'request_order_or_duplicate');
  seen.add(row.id);
  requireEvidence(l.protocolHash===evidence.protocolHash&&row.protocolHash===evidence.protocolHash&&l.acceptedSmokeEvidenceHash===history.evidenceHash&&l.reserveUSD===RESERVATION.jev,'reservation_mismatch');
  requireEvidence(digest(row)===evidence.observationDigests[row.id]&&Number.isFinite(row.wallMs)&&row.wallMs>=0,'observation_digest_or_time');
  requireEvidence(i===rows.length-1?row.status==='failed':row.status==='success','stop_prefix_mismatch');
  if(row.status==='success'){
   verifyPinnedMetadata(row.result.metadata,executionProfile('jev'),true);
   requireEvidence(row.result.metadata.costUSD<=l.reserveUSD,'cost_exceeds_reservation');
   requireEvidence(digest(parseClassification({decisions:row.result.envelope.decisions},s))===digest(row.result.envelope),'invalid_envelope');
  }else requireEvidence(row.result==null&&row.error?.category==='request_failed','unrecognized_failure');
 }
 const successful=rows.slice(0,-1),completed=development.slice(0,successful.length);
 /** @param {Snapshot[]} snapshots */
 function measure(snapshots){
  if(!snapshots.length)return null;
  const indexed=new Map(successful.map((/** @type {Record<string,any>} */ r)=>[r.id,r]));
  /** @type {{probabilityRelevant:number,expectedRelevant:boolean}[]} */ const pairs=[];
  /** @type {Map<string,string[]>} */ const raw=new Map(),protectedIds=new Map();
  /** @type {{snapshot:string,candidate:string,language:string,family:string,critical:boolean}[]} */const falseNegatives=[];
  let total=0,rawRetained=0,protectedRetained=0,baselineBytes=0,rawBytes=0,protectedBytes=0,inputBytes=0,outputBytes=0;
  for(const s of snapshots){
   const e=indexed.get(s.id+'-jev').result.envelope,r=rawAdmission(s,e),p=protect(s,e,{calibrated:false});
   raw.set(s.id,r.retainedIds);protectedIds.set(s.id,p.retainedIds);
   const candidates=eligible(s);total+=candidates.length;rawRetained+=r.retainedIds.length;protectedRetained+=p.retainedIds.length;
   baselineBytes+=protect(s,null).bytes;rawBytes+=r.bytes;protectedBytes+=p.bytes;
   inputBytes+=Buffer.byteLength(JSON.stringify({state:payload(s),questions:questions(s)}));
   outputBytes+=Buffer.byteLength(JSON.stringify(e));
   for(const c of candidates){
    const d=e.decisions.find((/** @type {{id:string}} */ x)=>x.id===c.id);
    if(s.truth[c.id].relevance!=='uncertain'&&d?.probabilities)pairs.push({probabilityRelevant:1-d.probabilities.irrelevant,expectedRelevant:s.truth[c.id].relevance==='relevant'});
    if(s.truth[c.id].relevance==='relevant'&&!r.retainedIds.includes(c.id))falseNegatives.push({snapshot:s.id,candidate:c.id,language:s.language,family:s.family,critical:s.truth[c.id].critical});
   }
  }
  const rawMetrics=admissionMetrics(snapshots,raw);
  return {snapshots:snapshots.length,candidates:total,calibrationDiagnostic:calibration(pairs),
   labels:classificationMeasurements(snapshots,successful,'jev'),rawThresholdDiagnostic:rawMetrics,
   rawRecallClusterInterval:clusterRecallInterval(snapshots.map(s=>({cluster:s.id,hit:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant'&&raw.get(s.id)?.includes(c.id)).length,total:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant').length}))),
   protectedUncalibratedReplay:admissionMetrics(snapshots,protectedIds),falseNegatives,
   candidateReduction:{baseline:total,rawRetained,rawAvoided:total-rawRetained,protectedRetained,protectedAvoided:total-protectedRetained},
   byteReduction:{baselineBytes,rawBytes,rawAvoided:baselineBytes-rawBytes,protectedBytes,protectedAvoided:baselineBytes-protectedBytes,classifierInputBytes:inputBytes,normalizedOutputBytes:outputBytes,protectedNetSerializedBytesAvoided:baselineBytes-protectedBytes-inputBytes-outputBytes}};
 }
 const subset=measure(completed);
 const costs=successful.map((/** @type {Record<string,any>} */r)=>r.result.metadata.costUSD);
 const knownCost=money(costs.reduce((/** @type {number} */n,/** @type {number} */v)=>n+v,0));
 const reserved=money(ledger.reduce((/** @type {number} */n,/** @type {Record<string,any>} */l)=>n+l.reserveUSD,0));
 const times=successful.map((/** @type {Record<string,any>} */r)=>r.wallMs);
 const failed=rows.at(-1),unknown=[...history.unknownChargeRequestIds,failed.id];
 return {status:'STOPPED_INCOMPLETE',executionCommit:evidence.executionCommit,protocolHash:evidence.protocolHash,
  counts:{plannedNew:120,attempted:rows.length,successful:successful.length,failed:1,notAttempted:120-rows.length,development:{planned:32,attempted:rows.length},heldout:{planned:64,attempted:0},sentinel:{planned:24,attempted:0},cumulativeAttempts:history.attempts+rows.length},
  money:{newReservedUSD:reserved,cumulativeReservedUSD:money(history.reservedUSD+reserved),newKnownReportedCostUSD:knownCost,newTotalCostUSD:null,cumulativeKnownReportedCostUSD:money(history.knownReportedCostUSD+knownCost),cumulativeTotalCostUSD:null,unknownChargeRequestIds:unknown,unspentReservationCeilingUSD:money(30-history.reservedUSD-reserved),permissionToUseHeadroom:false},
  usage:{successfulInputTokens:successful.reduce((/** @type {number} */n,/** @type {Record<string,any>} */r)=>n+r.result.metadata.inputTokens,0),successfulOutputTokens:successful.reduce((/** @type {number} */n,/** @type {Record<string,any>} */r)=>n+r.result.metadata.outputTokens,0),failedInputTokens:null,failedOutputTokens:null},
  routing:{requestedModel:'typesafe-ai/jev',verifiedCanonical:'typesafe-ai/jev',verifiedFinalProvider:'typesafe-ai',verifiedRequests:successful.length,modelAttemptsPerVerifiedRequest:1,providerAttemptsPerVerifiedRequest:1,successfulProviderAttemptsPerVerifiedRequest:1,actualModel:null,failedRouting:null,retriesMade:0,fallbackObserved:false,failedFallbackObservability:'unknown',warningsForSuccessfulRequests:'none (strict transport warning gate passed)',failedWarnings:null},
  development:{jev:{requiredSnapshots:16,successfulSnapshots:successful.length,requiredScores:288,observedScores:subset?.calibrationDiagnostic.n??0,calibrationFrozen:false,calibrated:false,subset},astra:{successfulSnapshots:0,calibrationFrozen:false,calibration:null},byFamily:Object.fromEntries(['thread','actor','source','comparison'].map(f=>[f,measure(completed.filter(s=>s.family===f))])),byLanguage:Object.fromEntries(['en','ru'].map(l=>[l,measure(completed.filter(s=>s.language===l))]))},
  heldout:{status:'NOT_RUN',recall:null,falseNegatives:null,criticalMisses:null,uncertainLosses:null,scopeTimelineFailures:null,contextReduction:null},
  sentinels:data.filter(s=>s.sentinel).map(s=>({id:s.id,family:s.family,language:s.language,A:null,B:null,C:null,lostFindingsVersusA:null,unsupportedClaims:null,scopeTimelineFailures:null,status:'NOT_RUN'})),
  latency:{unit:'ms',successfulRequests:times.length,p50:quantile(times,.5),p95:quantile(times,.95),failedAttempt:failed.wallMs,pairedPipelineSavings:null},
  failure:{requestId:failed.id,error:failed.error,httpStatus:null,routing:null,billing:null,rootCause:'Unresolved: generic safe error does not distinguish provider transport from local post-response validation.'},
  recommendations:Object.fromEntries(['thread','actor','source','comparison'].map(f=>[f,'DO NOT ADOPT']))};
}
