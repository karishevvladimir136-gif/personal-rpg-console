// Explicitly gated experimental runner. Never imported by the application or ordinary tests.
import { readFileSync,writeFileSync,mkdirSync,existsSync,openSync,closeSync,unlinkSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { experimentalTransport,executionProfile,freeze,safeError } from './transport.mjs';
import { generateFixtures,eligible,payload,digest } from './fixtures.mjs';
import { protect,rawAdmission } from './policy.mjs';
import { INSTRUCTIONS,questions,classificationSchema,parseClassification,fromJev,requestContractHash } from './requests.mjs';
import { admissionMetrics,calibration,quantile,clusterRecallInterval } from './metrics.mjs';
import { liveGate } from './live-gate.mjs';
import { classificationMeasurements,pipelineMeasurements } from './measurements.mjs';
import { buildPlan } from './plan.mjs';
import { RESOLVER_INSTRUCTIONS,resolverInput,resolverSchema,parseResolver,scoreResolver,summarizeResolver,resolverContractHash } from './resolver.mjs';
import { EXTERNAL_FACTS } from './external-facts.mjs';

const args=process.argv.slice(2),phase=args.includes('--smoke')?'smoke':'full';
const protocol=JSON.parse(readFileSync(new URL('../fixtures/frozen-protocol.json',import.meta.url),'utf8'));
const approvedHash=args.find(x=>x.startsWith('--approved='))?.slice('--approved='.length);
// Stop before inspecting/loading any credentials if explicit approval is absent.
if(!approvedHash||approvedHash!==digest(protocol)||!args.includes('--smoke')&&!args.includes('--full')){
  console.log(JSON.stringify({status:'BLOCKED',reason:'Explicit owner approval of the frozen call/cost plan is required. No model call made.'}));process.exit(2);
}
const data=freeze(generateFixtures());if(digest(data)!==protocol.datasetHash)throw new Error('frozen_dataset_mismatch');
if(requestContractHash(data)!==protocol.requestContractHash)throw new Error('frozen_request_contract_mismatch');
if(resolverContractHash(data)!==protocol.resolverContractHash||digest(buildPlan(data))!==protocol.planHash)throw new Error('frozen_resolver_or_plan_mismatch');
const outputDir=new URL('../private-live-results/',import.meta.url);mkdirSync(outputDir,{recursive:true});
const lockPath=fileURLToPath(new URL('run.lock',outputDir));
let lock;
try{lock=openSync(lockPath,'wx');}catch{console.log(JSON.stringify({status:'BLOCKED',reason:'A run lock already exists; inspect interrupted run before continuing.'}));process.exit(2);}
/** @param {string} name @param {unknown} value */
const save=(name,value)=>writeFileSync(new URL(name,outputDir),JSON.stringify(value,null,2)+'\n');
try{
  const gate=liveGate({approved:true,apiKey:process.env.AI_GATEWAY_API_KEY,protocolHash:approvedHash,ledgerPath:fileURLToPath(new URL('reservations.jsonl',outputDir)),phase});
  const port=experimentalTransport({apiKey:process.env.AI_GATEWAY_API_KEY??'',fetcher:fetch});
  const profiles={astra:executionProfile('astra'),jev:executionProfile('jev')};
  /** @type {(import('./measurements.mjs').Observation & Record<string,any>)[]} */ const observations=[];
  let failures=0,newRequests=0;
  /** @param {string} id @param {'astra'|'jev'} kind @param {()=>Promise<Record<string,any>>} call */
  async function attempt(id,kind,call){
    const target=new URL(`${id}.json`,outputDir);
    if(existsSync(target)){const prior=JSON.parse(readFileSync(target,'utf8'));if(prior.protocolHash!==approvedHash)throw new Error('prior_protocol_mismatch');observations.push(prior);return prior;}
    gate.reserve(id,kind);
    newRequests++;
    const started=performance.now();
    /** @type {import('./measurements.mjs').Observation & Record<string,any>} */ let row={id,kind,protocolHash:approvedHash,status:'reserved',wallMs:0};
    try {row={...row,status:'success',result:await call(),wallMs:performance.now()-started};failures=0;}
    catch(error){row={...row,status:'failed',error:safeError(error),wallMs:performance.now()-started};failures++;}
    save(`${id}.json`,row);observations.push(row);
    // Unknown routing is a blocker, never grounds for bypassing a privacy/provider pin.
    if(failures>=2||row.error?.category==='unverified_routing')throw new Error('live_safety_stop');
    if(row.status==='success'&&['costUSD','inputTokens','outputTokens'].some(key=>row.result?.metadata?.[key]==null))throw new Error('unverified_billing_stop');
    return row;
  }
  /** @param {import('./fixtures.mjs').Snapshot} s @param {'jev'|'astra'} kind */
  const classify=async(s,kind)=>attempt(`${s.id}-${kind}`,kind,async()=>{
    if(kind==='jev'){const r=await port.classify(profiles.jev,payload(s),questions(s));return {envelope:fromJev(r.answers,s),metadata:r.metadata};}
    const r=await port.structured(profiles.astra,INSTRUCTIONS,payload(s),/** @type {Parameters<typeof port.structured>[3]} */(classificationSchema(s)),v=>parseClassification(v,s));
    return {envelope:r.output,metadata:r.metadata};
  });
  if(phase==='smoke'){
    // Test the exact unchanged domain schema/parser code, with no database or production runtime calls.
    const domain=await import(new URL('../../../src/lib/gameplay/dm-schema.ts',import.meta.url).href);
    const summary=await import(new URL('../../../src/lib/memory/summary.ts',import.meta.url).href);
    const job={id:'synthetic-job',campaignId:'synthetic-campaign',visibility:'public',generation:1,stateRevision:1,settingsRevision:1,fromSequence:0,throughSequence:0,sources:[],requiredSourceIds:[]};
    const cases=[['plan',domain.planSchema,domain.parsePlan],['narration',domain.narrationSchema,domain.parseNarration],['feedback',domain.feedbackSchema,domain.parseFeedback],['summary',summary.summarySchemaFor(job),(/** @type {unknown} */ v)=>summary.parseSummary(v,job)]];
    for(const [name,schema,parse] of cases)await attempt(`smoke-${name}`,'astra',()=>port.structured(profiles.astra,'Return the smallest valid synthetic response. No changes or checks. For summary select no sources; for other stages give one short sentence with empty arrays and nullable fields null.',{scene:'An empty synthetic courtyard at rest.'},schema,parse));
    await attempt('smoke-jev','jev',()=>port.classify(profiles.jev,payload(data[0]),questions(data[0])));
    save('smoke-summary.json',{protocolHash:approvedHash,newRequestsThisInvocation:newRequests,recordedRequests:observations.length,privacyCapability:EXTERNAL_FACTS,observations:observations.map(x=>({id:x.id,status:x.status,error:x.error??null})),note:'Synthetic transport only. Review routing and billing before any full-run approval; success cannot establish production privacy eligibility.'});
  }else{
    if(!existsSync(new URL('smoke-summary.json',outputDir)))throw new Error('smoke_required');
    const smoke=JSON.parse(readFileSync(new URL('smoke-summary.json',outputDir),'utf8'));
    if(smoke.protocolHash!==approvedHash||smoke.observations.some((/** @type {{status:string}} */ x)=>x.status!=='success'))throw new Error('successful_matching_smoke_required');
    const development=data.filter(s=>s.split==='development'),held=data.filter(s=>s.split==='heldout');
    const sentinels=held.filter(s=>s.sentinel),sentinelIds=new Set(sentinels.map(s=>s.id));
    const requiredScores=development.reduce((n,s)=>n+eligible(s).filter(c=>s.truth[c.id].relevance!=='uncertain').length,0);
    /** @type {Record<string,any>} */ const calibrationResults={};
    for(const kind of /** @type {const} */(['jev','astra'])){
      const retained=new Map();const pairs=[];let valid=0;
      for(const s of development){const r=await classify(s,kind),envelope=r.result?.envelope??null;retained.set(s.id,rawAdmission(s,envelope).retainedIds);
        if(r.status==='success')valid++;
        for(const c of eligible(s)){const d=envelope?.decisions.find((/** @type {{id:string}} */ x)=>x.id===c.id),p=d?.probabilities?.irrelevant;
          if(typeof p==='number'&&s.truth[c.id].relevance!=='uncertain')pairs.push({probabilityRelevant:1-p,expectedRelevant:s.truth[c.id].relevance==='relevant'});}
      }
      const stats=calibration(pairs),admission=admissionMetrics(development,retained);
      calibrationResults[kind]={stats,admission,successfulSnapshots:valid,requiredScores,calibrated:valid===development.length&&stats.n===requiredScores&&stats.ece!==null&&stats.ece<=0.05&&stats.brier!==null&&stats.brier<=0.1&&admission.criticalMisses===0};
    }
    const calibrationRecord={protocolHash:approvedHash,method:protocol.policy.calibration,results:calibrationResults};
    const freezeFile=new URL('calibration-frozen.json',outputDir);
    if(existsSync(freezeFile)&&digest(JSON.parse(readFileSync(freezeFile,'utf8')))!==digest(calibrationRecord))throw new Error('calibration_changed_after_freeze');
    save('calibration-frozen.json',calibrationRecord); // Freeze observed development gate BEFORE held-out calls.
    /** @type {Record<string,Map<string,string[]>>} */ const retained={A:new Map(),B:new Map(),C:new Map(),rawB:new Map(),rawC:new Map()};
    /** @type {{snapshot:string,path:string,retainedIds:string[],bytes:number,admissionStatus:string,resolverStatus:string}[]} */ const decisions=[];
    /** @type {Record<string,any>[]} */ const resolverScores=[];
    for(const s of held){
      const j=await classify(s,'jev'),f=await classify(s,'astra');
      const pipelines={A:protect(s,null),B:protect(s,j.result?.envelope??null,{calibrated:calibrationResults.jev.calibrated}),C:protect(s,f.result?.envelope??null,{calibrated:calibrationResults.astra.calibrated})};
      retained.rawB.set(s.id,rawAdmission(s,j.result?.envelope??null).retainedIds);retained.rawC.set(s.id,rawAdmission(s,f.result?.envelope??null).retainedIds);
      for(const path of /** @type {('A'|'B'|'C')[]} */(protocol.resolverOrders[s.id]??['A','B','C'])){
        const p=pipelines[path];
        retained[path].set(s.id,p.retainedIds);
        let resolverStatus=s.sentinel?'paused_overflow':'not_selected_no_call';
        if(s.sentinel&&p.status==='ready'){
          const request=resolverInput(s,p.retainedIds),schema=/** @type {Parameters<typeof port.structured>[3]} */(resolverSchema(s,p.retainedIds));
          const r=await attempt(`${s.id}-resolver-${path}`,'astra',()=>port.structured(profiles.astra,RESOLVER_INSTRUCTIONS,request,schema,v=>parseResolver(v,s,p.retainedIds)));
          resolverStatus=r.status;
          resolverScores.push({snapshot:s.id,path,transportStatus:r.status,...scoreResolver(s,r.result?.output??null)});
        }else if(s.sentinel){
          resolverScores.push({snapshot:s.id,path,transportStatus:'paused_overflow',...scoreResolver(s,null)});
        }
        decisions.push({snapshot:s.id,path,retainedIds:p.retainedIds,bytes:p.bytes,admissionStatus:p.status,resolverStatus});
      }
    }
    const metadata=observations.filter(x=>x.status==='success').map(x=>x.result?.metadata).filter(Boolean);
    const metrics=Object.fromEntries(Object.entries(retained).map(([k,map])=>[k,{
      ...admissionMetrics(held,map),
      clusterRecall95:clusterRecallInterval(held.map(s=>({
        cluster:s.cluster,
        hit:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant'&&map.get(s.id)?.includes(c.id)).length,
        total:eligible(s).filter(c=>s.truth[c.id].relevance==='relevant').length,
      }))),
      byLanguage:Object.fromEntries(['en','ru'].map(language=>[language,admissionMetrics(held.filter(s=>s.language===language),map)])),
      byFamily:Object.fromEntries(['thread','actor','source','comparison'].map(family=>[family,admissionMetrics(held.filter(s=>s.family===family),map)])),
    }]));
    const baselineBytes=decisions.filter(x=>x.path==='A').reduce((n,x)=>n+x.bytes,0);
    const savings=Object.fromEntries(['B','C'].map(k=>[k,{candidateBytesAvoided:baselineBytes-decisions.filter(x=>x.path===k).reduce((n,x)=>n+x.bytes,0),fraction:1-decisions.filter(x=>x.path===k).reduce((n,x)=>n+x.bytes,0)/baselineBytes}]));
    const stages=Object.fromEntries(['development','heldout'].flatMap(split=>['jev','astra'].map(kind=>[`${split}-${kind}`,data.filter(s=>s.split===split).map(s=>`${s.id}-${kind}`)])));
    for(const path of ['A','B','C'])stages[`sentinel-resolver-${path}`]=sentinels.map(s=>`${s.id}-resolver-${path}`);
    const latencies=Object.fromEntries(Object.entries(stages).map(([stage,ids])=>{const values=observations.filter(x=>ids.includes(x.id)).map(x=>x.wallMs);return [stage,{n:values.length,p50:quantile(values,0.5),p95:quantile(values,0.95)}];}));
    save('heldout-decisions.json',decisions);
    save('sentinel-quality.json',resolverScores);
    const downstreamQuality=summarizeResolver(resolverScores,sentinels);
    save('live-summary.json',{protocolHash:approvedHash,calibrationHash:digest(calibrationRecord),metrics,savings,latencies,
      rawLabels:{jev:classificationMeasurements(held,observations,'jev'),frontier:classificationMeasurements(held,observations,'astra')},
      pairedSentinelPaths:pipelineMeasurements(sentinels,observations,decisions.filter(d=>sentinelIds.has(d.snapshot))),downstreamQuality,privacyEligibility:EXTERNAL_FACTS.jev.productionPrivacyEligibility,
      newRequestsThisInvocation:newRequests,uniqueRecordedRequests:observations.length,
      billingScope:'Full evaluation stage only; add smoke-summary request metadata for cumulative reported charges. The durable reservation ledger enforces the cumulative smoke + full ceiling, including uncertain billing.',
      reportedCostUSD:observations.every(x=>x.status==='success')&&metadata.length===observations.length&&metadata.every(x=>x.costUSD!==null)?metadata.reduce((n,x)=>n+x.costUSD,0):null,
      failedOrUnknownBilling:observations.some(x=>x.status!=='success')||metadata.some(x=>x.costUSD===null),
      recommendation:'REQUIRES HUMAN REVIEW: examine per-case errors, intervals, calibration, resolver failures and paired overhead before any adoption. No production changes.'});
  }
  console.log(JSON.stringify({status:'FINISHED_BOUNDED_EXPERIMENT',newRequestsThisInvocation:newRequests,recordedRequests:observations.length,output:'private-live-results (ignored; sanitize before commit)'}));
}catch(error){console.log(JSON.stringify({status:'STOPPED',error:safeError(error),note:'Inspect safe per-request ledger locally. No automatic retry or replacement model.'}));process.exitCode=1;}
finally{closeSync(lock);unlinkSync(lockPath);}
