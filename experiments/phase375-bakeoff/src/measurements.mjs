import { eligible } from './fixtures.mjs';
import { quantile, wilson } from './metrics.mjs';
import { INSTRUCTIONS, questions, classificationSchema } from './requests.mjs';
import { payload } from './fixtures.mjs';
/** @typedef {import('./fixtures.mjs').Snapshot} Snapshot */
/** @typedef {{id:string,status:string,wallMs:number,result?:Record<string,any>}} Observation */

/** Raw labels, separately from threshold-based admission and mandatory protection.
 * @param {Snapshot[]} snapshots @param {Observation[]} observations @param {'jev'|'astra'} kind
 */
export function classificationMeasurements(snapshots,observations,kind){
  const indexed=new Map(observations.map(row=>[row.id,row]));
  /** @type {Record<string,number>} */ const confusion={};
  let n=0,correct=0,uncertain=0,omitted=0,missingScores=0,failedSnapshots=0;
  for(const s of snapshots){
    const row=indexed.get(`${s.id}-${kind}`);
    if(row?.status!=='success')failedSnapshots++;
    const decisions=row?.result?.envelope?.decisions??[];
    for(const c of eligible(s)){
      n++;const d=decisions.find((/** @type {{id:string}} */ x)=>x.id===c.id);
      const actual=d?.label??'omitted',expected=s.truth[c.id].label,key=`${expected}->${actual}`;
      confusion[key]=(confusion[key]??0)+1;
      if(actual===expected)correct++;
      if(actual==='uncertain')uncertain++;
      if(!d)omitted++;
      if(!d?.probabilities)missingScores++;
    }
  }
  return {n,correct,accuracy:n?correct/n:null,accuracyWilson95:wilson(correct,n),uncertain,omitted,missingScores,failedSnapshots,confusion};
}

/** Measured full-path costs/latency, with failed billing explicitly unknown.
 * @param {Snapshot[]} snapshots @param {Observation[]} observations
 * @param {{snapshot:string,path:string,bytes:number}[]} decisions
 */
export function pipelineMeasurements(snapshots,observations,decisions){
  const index=new Map(observations.map(row=>[row.id,row]));
  /** @type {Record<string,unknown>} */ const paths={};
  for(const path of ['A','B','C']){
    const classifier=path==='B'?'jev':path==='C'?'astra':null;
    /** @type {number[]} */ const total=[],resolver=[],overhead=[];
    let requestBytes=0,classificationOutputBytes=0,failed=0;
    /** @type {Observation[]} */ const rows=[];
    for(const s of snapshots){
      const r=index.get(`${s.id}-resolver-${path}`),c=classifier?index.get(`${s.id}-${classifier}`):undefined;
      if(r)rows.push(r);if(c)rows.push(c);
      if(r?.status!=='success'||classifier&&c?.status!=='success')failed++;
      if(r){resolver.push(r.wallMs);total.push(r.wallMs+(c?.wallMs??0));}
      if(c){
        overhead.push(c.wallMs);
        requestBytes+=Buffer.byteLength(JSON.stringify(classifier==='jev'?{state:payload(s),questions:questions(s)}:{instructions:INSTRUCTIONS,input:payload(s),schema:classificationSchema(s)}));
        classificationOutputBytes+=Buffer.byteLength(JSON.stringify(c.result?.envelope??null));
      }
    }
    const baseline=decisions.filter(d=>d.path==='A').reduce((n,d)=>n+d.bytes,0);
    const bytes=decisions.filter(d=>d.path===path).reduce((n,d)=>n+d.bytes,0);
    /** @param {number[]} values */ const latency=values=>({n:values.length,p50:quantile(values,0.5),p95:quantile(values,0.95)});
    const metadata=rows.map(r=>r.result?.metadata);
    /** @param {'costUSD'|'inputTokens'|'outputTokens'} key */
    const sum=key=>failed===0&&rows.length>0&&rows.every((r,i)=>r.status==='success'&&typeof metadata[i]?.[key]==='number')?metadata.reduce((n,m)=>n+m?.[key],0):null;
    paths[path]={snapshots:snapshots.length,failedOrIncompleteSnapshots:failed,wallTimeMs:latency(total),resolverMs:latency(resolver),classifierOverheadMs:latency(overhead),strongCandidateBytes:bytes,strongCandidateBytesAvoided:baseline-bytes,strongCandidateFractionAvoided:baseline?1-bytes/baseline:null,classifierInputBytes:requestBytes,normalizedClassifierOutputBytes:classificationOutputBytes,netSerializedBytesAvoided:baseline-bytes-requestBytes-classificationOutputBytes,reportedCostUSD:sum('costUSD'),inputTokens:sum('inputTokens'),outputTokens:sum('outputTokens')};
  }
  return paths;
}
