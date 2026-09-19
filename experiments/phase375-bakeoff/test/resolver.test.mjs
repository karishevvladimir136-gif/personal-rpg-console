import test from 'node:test';
import assert from 'node:assert/strict';
import { generateFixtures,eligible,digest } from '../src/fixtures.mjs';
import { resolverInput,parseResolver,scoreResolver,summarizeResolver,resolverContractHash } from '../src/resolver.mjs';
const data=generateFixtures(),sentinels=data.filter(s=>s.sentinel),s=sentinels[0];
const oracle=s=>({scope:{campaign:s.campaign,timeline:s.timeline,revision:s.revision,actor:s.actor},findings:s.resolverGold.map(p=>({id:p.id,status:p.expected,evidenceIds:[...p.evidenceIds]}))});
const scored=(s,path,output=oracle(s),transportStatus='success')=>({snapshot:s.id,path,transportStatus,...scoreResolver(s,output)});

test('eight held-out sentinels have balanced families/languages, 48 explicit gold findings and no gold in payloads',()=>{
  assert.equal(sentinels.length,8);assert.equal(sentinels.flatMap(s=>s.resolverGold).length,48);
  for(const family of ['thread','actor','source','comparison']){
    const group=sentinels.filter(s=>s.family===family);assert.equal(group.length,2);
    assert.deepEqual(group.map(s=>s.language).sort(),['en','ru']);
  }
  for(const x of sentinels){
    assert.equal(x.split,'heldout');assert.equal(x.resolverGold.length,6);
    assert.ok(x.resolverGold.some(p=>p.expected==='unresolved'));
    assert.ok(x.resolverGold.some(p=>p.expected==='contradicted'));
    const input=resolverInput(x,eligible(x).map(c=>c.id));
    assert.deepEqual(input.statements,x.resolverGold.map(({id,statement})=>({id,statement})));
    assert.equal(JSON.stringify(input).includes('SYNTHETIC_DM_PRIVATE'),false);
    assert.equal(JSON.stringify(input).includes('"expected"'),false);
    assert.equal(JSON.stringify(input).includes('"mandatory"'),false);
  }
  assert.throws(()=>resolverInput(data[0],[]),/not_preselected/);
  assert.equal(resolverContractHash(data),resolverContractHash(generateFixtures()));
});

test('authored oracle scores exactly; this tests the rubric and is not a model-quality result',()=>{
  for(const x of sentinels){const out=parseResolver(oracle(x),x,eligible(x).map(c=>c.id)),score=scoreResolver(x,out);assert.equal(score.correct,6);assert.equal(score.complete,true);}
});

test('unsupported claims, unresolved misses, missing evidence and incorrect scope lose quality',()=>{
  const uncertain=s.resolverGold.find(p=>p.expected==='unresolved'),out=oracle(s);
  out.findings.find(f=>f.id===uncertain.id).status='supported';
  let score=scoreResolver(s,out);assert.equal(score.unsupportedClaims,1);assert.equal(score.unresolvedMisses,1);assert.equal(score.correct,5);
  const missing=oracle(s);missing.findings[0].evidenceIds=[];
  assert.ok(scoreResolver(s,missing).correct<6);
  const wrong=oracle(s);wrong.scope.timeline='abandoned-future';score=scoreResolver(s,wrong);
  assert.equal(score.scopeCorrect,false);assert.equal(score.correct,0);
  assert.equal(scoreResolver(s,null).correct,0);
});

test('resolver output rejects invented evidence/probe IDs, duplicated IDs and extra/private fields',()=>{
  const ids=eligible(s).map(c=>c.id);
  for(const change of [v=>v.findings[0].evidenceIds.push('x0'),v=>v.findings[0].id='invented',v=>v.findings.push(v.findings[0]),v=>v.privateState='secret',v=>v.scope.extra=true,v=>v.findings[0].status='execute']){
    const out=oracle(s);change(out);assert.throws(()=>parseResolver(out,s,ids));
  }
});

test('paired quality detects pruning a nonmandatory dependency even if the model guesses the right conclusion',()=>{
  const before=digest(s),out=oracle(s);
  const removable=s.resolverGold.flatMap(p=>p.evidenceIds).find(id=>!s.candidates.find(c=>c.id===id).mandatory);
  assert.ok(removable);
  for(const f of out.findings)f.evidenceIds=f.evidenceIds.filter(id=>id!==removable);
  const report=summarizeResolver([scored(s,'A'),scored(s,'B',out),scored(s,'C')],[s]);
  assert.ok(report.B.paired[0].lostFindingsVsA>0);assert.ok(report.B.paired[0].scoreDeltaVsA<0);
  assert.equal(report.B.noLossVsA,false);assert.equal(report.C.noLossVsA,true);assert.equal(digest(s),before);
});

test('missing or failed baselines never imply an improving comparison or complete evidence',()=>{
  let report=summarizeResolver([scored(s,'B')],[s]);
  assert.equal(report.B.paired[0].scoreDeltaVsA,null);assert.equal(report.B.noLossVsA,false);
  assert.equal(report.A.incompleteTransports,1);assert.equal(report.A.allFindingsCorrect,false);
  report=summarizeResolver([scored(s,'A',null,'failed'),scored(s,'B')],[s]);
  assert.equal(report.B.paired[0].comparable,false);
  assert.equal(report.A.correct,0);assert.equal(report.A.findings,6);
});
