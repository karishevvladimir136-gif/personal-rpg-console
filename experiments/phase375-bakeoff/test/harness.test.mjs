import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFixtures, eligible, payload, digest } from '../src/fixtures.mjs';
import { protect, rawAdmission, snapshotKey, labelsFor } from '../src/policy.mjs';
import { wilson, quantile, calibration, admissionMetrics, clusterRecallInterval } from '../src/metrics.mjs';
import { parseClassification, fromJev } from '../src/requests.mjs';

const fixtures=generateFixtures(),s=fixtures[0];
const negative = snap=>({snapshotHash:snapshotKey(snap),decisions:eligible(snap).map(c=>({id:c.id,label:'irrelevant',probabilities:Object.fromEntries(labelsFor(snap.family).map(l=>[l,l==='irrelevant'?1:0]))}))});

test('reproducible disjoint development/held-out fixture families, balanced EN/RU and substantial critical subset',()=>{
  assert.equal(digest(fixtures),digest(generateFixtures()));
  assert.equal(fixtures.length,48);assert.equal(new Set(fixtures.map(x=>x.id)).size,48);
  for(const split of ['development','heldout']){
    const rows=fixtures.filter(x=>x.split===split);assert.equal(rows.filter(x=>x.language==='en').length,rows.filter(x=>x.language==='ru').length);
    assert.equal(rows.length,split==='development'?16:32);
    assert.equal(new Set(rows.map(x=>x.family)).size,4);
    for(const family of ['thread','actor','source','comparison']){
      const familyRows=rows.filter(x=>x.family===family);
      assert.equal(familyRows.filter(x=>x.language==='en').length,familyRows.filter(x=>x.language==='ru').length);
    }
  }
  const held=fixtures.filter(x=>x.split==='heldout');assert.equal(held.flatMap(eligible).length,640);
  assert.equal(held.reduce((n,x)=>n+eligible(x).filter(c=>x.truth[c.id].relevance==='relevant').length,0),384);
  assert.equal(held.reduce((n,x)=>n+eligible(x).filter(c=>x.truth[c.id].critical).length,0),80);
  assert.equal(fixtures.filter(x=>x.split==='development').some(x=>held.some(y=>x.cluster===y.cluster)),false);
  assert.equal(new Set(fixtures.map(x=>x.structure)).size,48);
  assert.equal(new Set(fixtures.flatMap(eligible).map(c=>c.text)).size,960);
});
test('model payload excludes gold, protection flags, private/foreign/stale/unknown-actor records',()=>{
  for(const x of fixtures){const data=JSON.stringify(payload(x));assert.equal(eligible(x).length,20);
    for(const prohibited of ['"truth"','"critical"','"mandatory"','SYNTHETIC_DM_PRIVATE','SYNTHETIC_FOREIGN','SYNTHETIC_ABANDONED','SYNTHETIC_STALE','SYNTHETIC_UNKNOWN'])assert.equal(data.includes(prohibited),false);
  }
});
test('a classifier marking every item irrelevant still cannot remove mandatory evidence',()=>{
  const p=protect(s,negative(s),{calibrated:true});assert.equal(p.retainedIds.length,2);
  assert.equal(rawAdmission(s,negative(s)).retainedIds.length,0);
});
test('uncalibrated probabilities retain every eligible candidate',()=>assert.equal(protect(s,negative(s)).retainedIds.length,20));
for(const mode of ['failure','omitted','malformed','stale','duplicate','unknown-id','abstention','missing-confidence','invalid-sum','nan']){
  test(`${mode} cannot silently discard evidence`,()=>{
    const e=negative(s);
    if(mode==='omitted')e.decisions=[];
    if(mode==='stale')e.snapshotHash='old';
    if(mode==='duplicate')e.decisions.push(e.decisions[0]);
    if(mode==='unknown-id')e.decisions[0].id='invented-private-id';
    if(mode==='abstention')e.decisions=e.decisions.map(d=>({...d,label:'uncertain'}));
    if(mode==='missing-confidence')e.decisions=e.decisions.map(d=>({...d,probabilities:null}));
    if(mode==='malformed')e.decisions=e.decisions.map(d=>({...d,label:'destroy_world'}));
    if(mode==='invalid-sum')e.decisions=e.decisions.map(d=>({...d,probabilities:{irrelevant:1,relevant:1,uncertain:0}}));
    if(mode==='nan')e.decisions=e.decisions.map(d=>({...d,probabilities:{irrelevant:NaN,relevant:0,uncertain:0}}));
    assert.equal(protect(s,mode==='failure'?null:e,{calibrated:true}).retainedIds.length,20);
  });
}
test('stale decisions cannot prune revised text, branch, audience or source revision',()=>{
  for(const mutation of [{revision:4},{timeline:'other'},{actor:'other-npc'}])assert.notEqual(snapshotKey({...s,...mutation}),snapshotKey(s));
  const changed=structuredClone(s);eligible(changed).find(c=>!c.mandatory).text='Now relevant';
  assert.equal(protect(changed,negative(s),{calibrated:true}).retainedIds.length,20);
});
test('pruning cannot admit forbidden critical-looking records, write canon, or mutate inputs',()=>{
  const before=JSON.stringify(s);const result=protect(s,negative(s),{calibrated:true});
  assert.equal(result.retainedIds.some(id=>id.startsWith('x')),false);assert.equal(JSON.stringify(s),before);
  assert.deepEqual(Object.keys(result).sort(),['bypassed','bytes','retainedIds','rows','status']);
});
test('overflow pauses with all retained IDs instead of truncating; no cost-free world transition',()=>{
  const p=protect(s,null,{maxCandidates:12});assert.equal(p.status,'paused_overflow');assert.equal(p.retainedIds.length,20);
  assert.equal(protect(s,null,{maxBytes:10}).status,'paused_overflow');
});
test('strict classifier output rejects invented/duplicate IDs, extra keys, bad labels and scores',()=>{
  const e=negative(s),valid={decisions:e.decisions};assert.equal(parseClassification(valid,s).decisions.length,20);
  for(const bad of [{...valid,canon:true},{decisions:[{...e.decisions[0],id:'other'}]},{decisions:[e.decisions[0],e.decisions[0]]},{decisions:[{...e.decisions[0],label:'execute'}]}])assert.throws(()=>parseClassification(bad,s));
  assert.deepEqual(fromJev({},s).decisions,[]);
});
test('metrics use known ground truth, expose raw misses, and never call uncertain outputs perfect precision',()=>{
  const retained=new Map([[s.id,protect(s,null).retainedIds]]),m=admissionMetrics([s],retained);
  assert.equal(m.recall,1);assert.ok(m.precision<1);assert.equal(m.criticalMisses,0);assert.equal(m.uncertainLost,0);assert.ok(m.recallWilson95[0]<1);
  assert.ok(admissionMetrics([s],new Map([[s.id,[]]])).criticalMisses>0);
  assert.equal(admissionMetrics([s],new Map([[s.id,['x0']]])).scopeLeaks,1);
});
test('calibration and intervals have known numeric answers and disclose finite-sample uncertainty',()=>{
  assert.equal(calibration([{probabilityRelevant:1,expectedRelevant:true},{probabilityRelevant:0,expectedRelevant:false}]).brier,0);
  assert.equal(calibration([]).brier,null);assert.equal(quantile([4,1,2,3],0.5),2);assert.equal(quantile([],0.95),null);
  assert.equal(wilson(0,0),null);assert.ok(wilson(384,384)[0]>=0.99);assert.ok(wilson(383,384)[0]<0.99);
  const rows=[{cluster:'paired',hit:2,total:3},{cluster:'paired',hit:1,total:2},{cluster:'other',hit:2,total:2}];
  assert.deepEqual(clusterRecallInterval(rows),clusterRecallInterval(rows));assert.equal(clusterRecallInterval(rows).clusters,2);
});
