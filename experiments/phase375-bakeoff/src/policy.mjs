import { digest, eligible, payload } from './fixtures.mjs';
/** @typedef {import('./fixtures.mjs').Snapshot} Snapshot */
/** @typedef {import('./fixtures.mjs').Label} Label */
/** @typedef {{id:string,label:Label,probabilities:Record<string,number>|null}} Decision */
/** @typedef {{snapshotHash:string,decisions:Decision[]}} Envelope */
export const POLICY = Object.freeze({
  version:'recall-first-v2-sentinels', labels:['relevant','irrelevant','uncertain','similar','divergent'],
  irrelevantThreshold:0.99, relevanceThreshold:0.01, maxCandidates:24, maxBytes:12000,
  calibration:'identity probabilities; development ECE<=0.05 and Brier<=0.1; no raw critical miss; fixed policy, no held-out tuning',
  adoption:'held-out recall>=0.995 and Wilson lower bound>=0.99; zero raw/protected critical misses, required-uncertainty losses or scope leaks; complete sentinel transports, baseline A all required findings correct, no per-finding loss versus A, zero unsupported claims/scope failures; positive paired context savings >=10%; review calibration, latency/cost and per-case errors. Baseline failures require review, never relaxation of gold after seeing held-out results. Synthetic quality does not establish production privacy eligibility.',
});
/** @param {Snapshot} snapshot */
export const snapshotKey=snapshot=>digest({campaign:snapshot.campaign,timeline:snapshot.timeline,revision:snapshot.revision,actor:snapshot.actor,payload:payload(snapshot)});
/** @param {string} family @returns {Label[]} */
export const labelsFor=family=>family==='comparison'?['similar','divergent','irrelevant','uncertain']:['relevant','irrelevant','uncertain'];
/** @param {unknown} value @param {string[]} labels */
export function validProbabilities(value,labels) {
  if(!value||typeof value!=='object'||Array.isArray(value))return false;
  const entries=Object.entries(value);
  return entries.length===labels.length&&entries.every(([k,v])=>labels.includes(k)&&typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1)&&Math.abs(entries.reduce((n,[,v])=>n+v,0)-1)<0.001;
}
/** No mutation: returns admission status, not events or state patches.
 * @param {Snapshot} snapshot @param {Envelope|null} envelope
 * @param {{calibrated?:boolean,maxCandidates?:number,maxBytes?:number}} [options]
 */
export function protect(snapshot,envelope,{calibrated=false,maxCandidates=POLICY.maxCandidates,maxBytes=POLICY.maxBytes}={}) {
  const authorized=eligible(snapshot), allowed=labelsFor(snapshot.family);
  const valid=envelope?.snapshotHash===snapshotKey(snapshot)&&Array.isArray(envelope.decisions)&&
    new Set(envelope.decisions.map(x=>x.id)).size===envelope.decisions.length&&
    envelope.decisions.every(x=>authorized.some(c=>c.id===x.id));
  const results=new Map((valid?envelope.decisions:[]).map(x=>[x.id,x]));
  const rows=authorized.map(c=>{
    const d=results.get(c.id);
    const wellFormed=d&&allowed.includes(d.label)&&validProbabilities(d.probabilities,allowed);
    const prune=Boolean(!c.mandatory&&calibrated&&wellFormed&&d.label==='irrelevant'&&d.probabilities&&d.probabilities.irrelevant>=POLICY.irrelevantThreshold);
    return {id:c.id,retain:!prune,reason:c.mandatory?'mandatory':!valid?'bypass':!wellFormed?'uncertain':!calibrated?'uncalibrated':prune?'confident-irrelevant':'retained'};
  });
  const retained=authorized.filter(c=>rows.find(r=>r.id===c.id)?.retain);
  const bytes=Buffer.byteLength(JSON.stringify(retained.map(({id,text})=>({id,text}))));
  return {rows,retainedIds:retained.map(c=>c.id),status:retained.length>maxCandidates||bytes>maxBytes?'paused_overflow':'ready',bytes,bypassed:!valid};
}

/** Raw classification admission, explicitly without mandatory protection. @param {Snapshot} snapshot @param {Envelope|null} envelope */
export function rawAdmission(snapshot,envelope) {
  const result=protect({...snapshot,candidates:snapshot.candidates.map(c=>({...c,mandatory:null}))},envelope,{calibrated:true});
  return result;
}
