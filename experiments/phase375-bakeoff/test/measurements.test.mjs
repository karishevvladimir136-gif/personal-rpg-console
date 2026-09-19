import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFixtures, eligible } from '../src/fixtures.mjs';
import { classificationMeasurements,pipelineMeasurements } from '../src/measurements.mjs';
const s=generateFixtures()[0];
test('raw label confusion/abstentions differ from protected admission recall',()=>{
  const decisions=eligible(s).map(c=>({id:c.id,label:s.truth[c.id].label,probabilities:null}));
  const r=classificationMeasurements([s],[{id:`${s.id}-jev`,status:'success',wallMs:1,result:{envelope:{decisions}}}],'jev');
  assert.equal(r.correct,20);assert.equal(r.uncertain,2);assert.equal(r.missingScores,20);assert.ok(r.accuracyWilson95[0]<1);
  const failed=classificationMeasurements([s],[],'jev');assert.equal(failed.omitted,20);assert.equal(failed.failedSnapshots,1);
});
test('paired paths count classifier overhead and null unknown billing',()=>{
  const metadata={inputTokens:10,outputTokens:5,costUSD:0.01};
  const rows=['A','B','C'].map(path=>({id:`${s.id}-resolver-${path}`,status:'success',wallMs:100,result:{metadata}}));
  rows.push({id:`${s.id}-jev`,status:'success',wallMs:20,result:{metadata}});
  rows.push({id:`${s.id}-astra`,status:'failed',wallMs:30});
  const decisions=['A','B','C'].map(path=>({snapshot:s.id,path,bytes:path==='B'?500:1000}));
  const r=pipelineMeasurements([s],rows,decisions);
  assert.equal(r.A.wallTimeMs.p50,100);assert.equal(r.B.wallTimeMs.p50,120);
  assert.equal(r.B.strongCandidateBytesAvoided,500);assert.ok(r.B.classifierInputBytes>0);
  assert.equal(r.B.reportedCostUSD,0.02);assert.equal(r.C.reportedCostUSD,null);
  assert.equal(r.C.failedOrIncompleteSnapshots,1);
});

test('missing sentinel resolver does not report classifier-only billing as the full path cost',()=>{
  const metadata={inputTokens:10,outputTokens:5,costUSD:0.01};
  const r=pipelineMeasurements([s],[{id:`${s.id}-jev`,status:'success',wallMs:20,result:{metadata}}],[]);
  assert.equal(r.B.failedOrIncompleteSnapshots,1);assert.equal(r.B.reportedCostUSD,null);assert.equal(r.B.inputTokens,null);
});
