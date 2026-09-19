import { eligible } from './fixtures.mjs';
/** @typedef {import('./fixtures.mjs').Snapshot} Snapshot */
/** @param {number} successes @param {number} n */
export function wilson(successes,n) {
  if(!n)return null;
  const z=1.959963984540054,p=successes/n,d=1+z*z/n;
  const center=(p+z*z/(2*n))/d,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/d;
  return [Math.max(0,center-half),Math.min(1,center+half)];
}
/** @param {number[]} values @param {number} q */
export function quantile(values,q) {const a=[...values].sort((x,y)=>x-y);return a.length?a[Math.min(a.length-1,Math.ceil(q*a.length)-1)]:null;}
/** @param {Snapshot[]} snapshots @param {Map<string,string[]>} retained */
export function admissionMetrics(snapshots,retained) {
  let relevant=0,tp=0,fp=0,critical=0,criticalMisses=0,uncertain=0,uncertainLost=0,scopeLeaks=0;
  for(const s of snapshots){const ids=new Set(retained.get(s.id)??[]),authorized=eligible(s);
    scopeLeaks += [...ids].filter(id=>!authorized.some(c=>c.id===id)).length;
    for(const c of authorized){const t=s.truth[c.id],keep=ids.has(c.id);
      if(t.relevance==='relevant'){relevant++;if(keep)tp++;}
      if(t.relevance==='irrelevant'&&keep)fp++;
      if(t.critical){critical++;if(!keep)criticalMisses++;}
      if(t.relevance==='uncertain'){uncertain++;if(!keep)uncertainLost++;}
    }
  }
  return {relevant,truePositive:tp,falseNegative:relevant-tp,recall:relevant?tp/relevant:null,recallWilson95:wilson(tp,relevant),precision:tp+fp?tp/(tp+fp):null,critical,criticalMisses,criticalRetentionWilson95:wilson(critical-criticalMisses,critical),uncertain,uncertainLost,scopeLeaks};
}
/** Calibration checks score reliability; no fitted transform and no threshold search.
 * @param {{probabilityRelevant:number,expectedRelevant:boolean}[]} pairs
 */
export function calibration(pairs) {
  if(!pairs.length)return {n:0,brier:null,ece:null,bins:[]};
  const bins=Array.from({length:10},()=>({n:0,predicted:0,observed:0}));let squared=0;
  for(const {probabilityRelevant:p,expectedRelevant:y} of pairs){
    if(!Number.isFinite(p)||p<0||p>1)throw new Error('invalid_probability');
    const b=bins[Math.min(9,Math.floor(p*10))];b.n++;b.predicted+=p;b.observed+=Number(y);squared+=(p-Number(y))**2;
  }
  const ece=bins.reduce((n,b)=>n+(b.n?Math.abs(b.predicted-b.observed)/pairs.length:0),0);
  return {n:pairs.length,brier:squared/pairs.length,ece,bins:bins.map(b=>({...b,rate:b.n?b.observed/b.n:null,rateWilson95:wilson(b.observed,b.n)}))};
}
/** Seeded cluster bootstrap retains EN/RU pairs and candidate dependence within a scenario.
 * @param {{cluster:string,hit:number,total:number}[]} rows @param {number} [samples]
 */
export function clusterRecallInterval(rows,samples=2000){
  const groups=new Map();for(const row of rows){const old=groups.get(row.cluster)??{hit:0,total:0};old.hit+=row.hit;old.total+=row.total;groups.set(row.cluster,old);}
  const groupsArray=[...groups.values()];if(!groupsArray.length)return null;
  let seed=375;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const values=[];for(let i=0;i<samples;i++){let hit=0,total=0;for(let j=0;j<groupsArray.length;j++){const g=groupsArray[Math.floor(random()*groupsArray.length)];hit+=g.hit;total+=g.total;}if(total)values.push(hit/total);}
  return {clusters:groupsArray.length,samples,percentile95:[quantile(values,0.025),quantile(values,0.975)],caveat:'Template-generated clusters are not independent natural campaigns; degenerate zero-miss bootstrap is not proof of perfect recall. Also report Wilson intervals.'};
}
