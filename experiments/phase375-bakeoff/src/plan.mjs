import { EXTERNAL_FACTS } from './external-facts.mjs';
/** @typedef {import('./fixtures.mjs').Snapshot} Snapshot */
export const LIMITS=Object.freeze({requestBytes:12000,framingTokenReserve:2048,maxOutputTokens:4096,timeoutMs:60000,smokeCalls:8,smokeUSD:3,totalCalls:128,totalUSD:30});
export const RESERVATION=Object.freeze({astra:((LIMITS.requestBytes+LIMITS.framingTokenReserve)*10+LIMITS.maxOutputTokens*50)/1e6,jev:0.02});
/** @param {readonly Snapshot[]} data */
export function buildPlan(data){
  const development=data.filter(s=>s.split==='development'),held=data.filter(s=>s.split==='heldout'),sentinels=held.filter(s=>s.sentinel);
  const manifest=[
    ...['plan','narration','feedback','summary'].map(name=>({id:`smoke-${name}`,kind:'astra',stage:'smoke'})),
    {id:'smoke-jev',kind:'jev',stage:'smoke'},
    ...data.flatMap(s=>['jev','astra'].map(kind=>({id:`${s.id}-${kind}`,kind,stage:s.split}))),
    ...sentinels.flatMap(s=>['A','B','C'].map(path=>({id:`${s.id}-resolver-${path}`,kind:'astra',stage:'sentinel'}))),
    ...[1,2,3].map(i=>({id:`diagnostic-${i}`,kind:'astra',stage:'diagnostic-separate-approval'})),
  ];
  const maximumAstra=manifest.filter(r=>r.kind==='astra').length,maximumJev=manifest.filter(r=>r.kind==='jev').length;
  const reserveUSD=maximumAstra*RESERVATION.astra+maximumJev*RESERVATION.jev;
  if(data.length!==48||development.length!==16||held.length!==32||sentinels.length!==8||manifest.length!==LIMITS.totalCalls||reserveUSD>LIMITS.totalUSD)throw new Error('plan_scope_or_budget');
  return {version:'owner-correction-v2',status:'OWNER_REVIEW_REQUIRED_BEFORE_CREDENTIALS_OR_LIVE_CALLS',calls:{smokeNormal:5,smokeMaximum:8,developmentClassification:development.length*2,heldoutClassification:held.length*2,sentinelResolvers:sentinels.length*3,explicitDiagnosticHeadroom:3,normalTotal:manifest.length-3,totalMaximum:manifest.length,astraMaximum:maximumAstra,jevMaximum:maximumJev,retries:0,concurrency:1},limits:LIMITS,reservationsUSD:RESERVATION,maximumReservedUSD:reserveUSD,pricing:EXTERNAL_FACTS,sentinelIds:sentinels.map(s=>s.id),resolverOrders:Object.fromEntries(sentinels.map((s,i)=>[s.id,[['A','B','C'],['B','C','A'],['C','A','B']][i%3]])),manifest,notes:'128 includes smoke and 3 separately authorized diagnostics. No automatic use of headroom. No subscription upgrade for synthetic privacy profile. API-key quota is defense in depth, not a guarantee against billing lag. Stop if current tariffs exceed reservations.'};
}
