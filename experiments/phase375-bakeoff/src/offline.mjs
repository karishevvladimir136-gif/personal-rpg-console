import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { generateFixtures,eligible,digest,BASELINE } from './fixtures.mjs';
import { protect,rawAdmission,snapshotKey,labelsFor } from './policy.mjs';
import { admissionMetrics,clusterRecallInterval } from './metrics.mjs';
// No model import or network dependency. These are safety simulations, not Jev/frontier predictions.
const data=generateFixtures();
const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
if(protocol.datasetHash!==digest(data))throw new Error('frozen_dataset_mismatch');
mkdirSync(new URL('../results/',import.meta.url),{recursive:true});
/** @param {string} name @param {unknown} value */
const write=(name,value)=>writeFileSync(new URL(`../results/${name}`,import.meta.url),JSON.stringify(value,null,2)+'\n');
const admission=new Map(),raw=new Map(),protectedMap=new Map();
const decisions=data.map(s=>{
  const envelope={snapshotHash:snapshotKey(s),decisions:eligible(s).map(c=>({id:c.id,label:/** @type {const} */('irrelevant'),probabilities:Object.fromEntries(labelsFor(s.family).map(l=>[l,l==='irrelevant'?1:0]))}))};
  const a=protect(s,null),worst=rawAdmission(s,envelope),safe=protect(s,envelope,{calibrated:true});
  admission.set(s.id,a.retainedIds);raw.set(s.id,worst.retainedIds);protectedMap.set(s.id,safe.retainedIds);
  return {snapshot:s.id,split:s.split,language:s.language,family:s.family,inputHash:snapshotKey(s),authorizedIds:eligible(s).map(c=>c.id),scopeRejectedIds:s.candidates.filter(c=>!eligible(s).includes(c)).map(c=>c.id),deterministic:a,adversarialClassifierRaw:worst,adversarialClassifierProtected:safe,overflow:protect(s,null,{maxCandidates:12})};
});
const held=data.filter(s=>s.split==='heldout');
const result={baseline:BASELINE,evidenceKind:'DETERMINISTIC_HARNESS_ONLY_NOT_MODEL_BENCHMARK',protocolHash:digest(protocol),liveCalls:0,liveCostUSD:0,
  deterministicAdmission:admissionMetrics(held,admission),
  adversarialStub:{description:'Artificial all-irrelevant answers to stress mandatory protection, NOT Jev output. Noncritical false negatives are expected and demonstrate why calibration/adoption gates matter.',raw:admissionMetrics(held,raw),protected:admissionMetrics(held,protectedMap)},
  recallClusterInterval:clusterRecallInterval(held.map(s=>({cluster:s.cluster,hit:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant').length,total:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant').length}))),
  pendingLive:{jev:null,frontierClassification:null,strongResolverA:null,strongResolverB:null,strongResolverC:null,p50ProviderLatency:null,p95ProviderLatency:null,contextSavings:null,calibration:null,providerCost:null},
  recommendation:'DO NOT ADOPT for live pruning pending authorized live evidence; no efficacy conclusion about Jev can be drawn from deterministic checks.'};
write('offline-decisions.json',decisions);write('offline-summary.json',result);
console.log(JSON.stringify({snapshots:data.length,heldoutAuthorized:held.reduce((n,s)=>n+eligible(s).length,0),criticalMisses:result.deterministicAdmission.criticalMisses,scopeLeaks:result.deterministicAdmission.scopeLeaks,liveCalls:0}));
