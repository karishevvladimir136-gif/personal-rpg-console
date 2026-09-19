import { createHash } from 'node:crypto';
import { threadScenarios } from './scenarios-thread.mjs';
import { actorScenarios } from './scenarios-actor.mjs';
import { sourceScenarios } from './scenarios-source.mjs';
import { comparisonScenarios } from './scenarios-comparison.mjs';
/** @typedef {'relevant'|'irrelevant'|'uncertain'|'similar'|'divergent'} Label */
/** @typedef {{id:string,text:string,campaign:string,timeline:string,revision:number,visibility:string,knownBy:string[],mandatory:string|null}} Candidate */
/** @typedef {{relevance:'relevant'|'irrelevant'|'uncertain',label:Label,critical:boolean,reason:string}} Truth */
/** @typedef {{id:string,statement:string,expected:'supported'|'contradicted'|'unresolved',evidenceIds:string[]}} Probe */
/** @typedef {{id:string,cluster:string,split:'development'|'heldout',language:'en'|'ru',family:string,structure:string,synthetic:true,sentinel:boolean,query:string,campaign:string,timeline:string,revision:number,actor:string,candidates:Candidate[],truth:Record<string,Truth>,resolverGold:Probe[]}} Snapshot */
export const BASELINE='cb7f6be2fb513de13604d381046a3240f3261383';
export const FOUNDATION='68126be972b2fdecfd650fde08d64f8b768eec01';
export const GENERATOR_VERSION='authored-heterogeneous-v2';
export const FAMILIES=['thread','actor','source','comparison'];
/** @param {unknown} value */
export const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
/** @type {Record<string,number[]>} */
const sentinelCritical={
  'orchard-smoke':[0,1,10,11], 'ferry-debt':[0,1,7,11],
  'treaty-release':[2,4,5,11], 'archive-witness':[3,4,9,11],
  'island-veto':[0,2,3,8], 'hospital-generator':[0,5,8,9],
  'flood-branches':[1,3,9,10], 'embassy-delay':[5,7,8,10],
};
/** The generator supplies only stable IDs, scope and projections, not prose templates. @returns {Snapshot[]} */
export function generateFixtures(){
  /** @type {Snapshot[]} */ const snapshots=[];
  for(const [family,scenarios] of Object.entries({thread:threadScenarios,actor:actorScenarios,source:sourceScenarios,comparison:comparisonScenarios})){
    for(const raw of scenarios){
      const s=/** @type {{id:string,split:'development'|'heldout',language:'en'|'ru',structure:string,query:string,relevant:string[],unknown:string[],irrelevant:string[],sentinel?:boolean,probes?:[string,Probe['expected'],number[]][]}} */(raw);
      if(s.relevant.length!==12||s.unknown.length!==2||s.irrelevant.length!==6)throw new Error(`authored_count:${s.id}`);
      const campaign=`synthetic-${s.id}`,timeline='branch-copper',revision=3,actor='player';
      const critical=sentinelCritical[s.id]??[0,11];
      /** @type {Record<string,Truth>} */ const truth={};
      const candidates=[...s.relevant,...s.unknown,...s.irrelevant].map((authored,index)=>{
        const id=`c${digest([s.id,index]).slice(0,8)}`,relevant=index<12,unknown=index>=12&&index<14;
        const text=family==='comparison'&&relevant?authored.slice(2):authored;
        /** @type {Label} */ const label=unknown?'uncertain':!relevant?'irrelevant':family==='comparison'?(authored.startsWith('S|')?'similar':'divergent'):'relevant';
        if(family==='comparison'&&relevant&&!/^[SD]\|/.test(authored))throw new Error('comparison_gold_missing');
        truth[id]={relevance:unknown?'uncertain':relevant?'relevant':'irrelevant',label,critical:critical.includes(index),reason:unknown?'explicit-insufficient-evidence':relevant?s.structure:'explicit-no-causal-bearing'};
        return {id,text,campaign,timeline,revision,visibility:'public',knownBy:[actor],mandatory:critical.includes(index)?'required-causal-anchor-or-agency':null};
      });
      const resolverGold=(s.probes??[]).map(([statement,expected,indices],i)=>({id:`p${digest([s.id,'probe',i]).slice(0,7)}`,statement,expected,evidenceIds:indices.map(index=>{if(!candidates[index])throw new Error('bad_gold_reference');return candidates[index].id;})}));
      if(Boolean(s.sentinel)!==(resolverGold.length>0)||s.sentinel&&s.split!=='heldout')throw new Error('invalid_sentinel');
      const exclusions=[{visibility:'private',text:'SYNTHETIC_DM_PRIVATE_CANARY'},{campaign:'unrelated-campaign',text:'SYNTHETIC_FOREIGN_CAMPAIGN'},{timeline:'abandoned-future',text:'SYNTHETIC_ABANDONED_FUTURE'},{revision:2,text:'SYNTHETIC_STALE_REVISION'},{knownBy:['other-npc'],text:'SYNTHETIC_UNKNOWN_TO_ACTOR'}];
      exclusions.forEach((overrides,index)=>{const id=`x${index}`;candidates.push({...candidates[0],id,...overrides});truth[id]={relevance:'irrelevant',label:'irrelevant',critical:false,reason:'scope-denied'};});
      candidates.sort((a,b)=>digest([s.id,a.id]).localeCompare(digest([s.id,b.id])));
      snapshots.push({id:s.id,cluster:s.id,split:s.split,language:s.language,family,structure:s.structure,synthetic:true,sentinel:Boolean(s.sentinel),query:s.query,campaign,timeline,revision,actor,candidates,truth,resolverGold});
    }
  }
  return snapshots;
}
/** @param {Snapshot} s */
export const eligible=s=>s.candidates.filter(c=>c.campaign===s.campaign&&c.timeline===s.timeline&&c.revision===s.revision&&c.visibility==='public'&&c.knownBy.includes(s.actor));
/** Gold, sentinel status, protection and forbidden records never enter a model payload. @param {Snapshot} s */
export const payload=s=>({task:s.family,query:s.query,candidates:eligible(s).map(({id,text})=>({id,text}))});
