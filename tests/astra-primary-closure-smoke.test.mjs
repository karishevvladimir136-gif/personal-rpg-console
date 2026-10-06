import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { guardQuietRandomTools } from
  "../scripts/astra-primary-production-closure-smoke.mjs";

test("six acceptance turns reconstruct exact source-linked state without provider calls",()=>{
  const script=fileURLToPath(new URL(
    "../scripts/astra-primary-production-closure-smoke.mjs",import.meta.url));
  const run=spawnSync(process.execPath,[script,"--offline-preflight"],{
    encoding:"utf8",timeout:30_000,
    env:{...process.env,OPENAI_API_KEY:"",ASTRA_P1_CLOSURE_SMOKE:""}});
  assert.equal(run.status,0,run.stderr);
  const result=JSON.parse(run.stdout);
  assert.equal(result.status,"post-six-ready");
  assert.equal(result.providerRequests,0);
  assert.equal(result.reconstruction.operations.length,6);
  assert.equal(result.reconstruction.state.worldMinutes,15);
  assert.equal(result.reconstruction.state.maraHp,6);
  assert.equal(result.reconstruction.state.maraMaxHp,10);
  assert.equal(result.reconstruction.state.focus,1);
  assert.equal(result.reconstruction.state.oil,0);
  assert.equal(result.reconstruction.state.stalkerHp,0);
  assert.equal(result.reconstruction.state.stalkerMaxHp,8);
  assert.equal(result.reconstruction.sceneDelta,12);
  assert.ok(result.reconstruction.indexedSceneDelta>=12);
  assert.ok(result.reconstruction.promiseSources>0);
  assert.match(result.reconstruction.promiseUnresolved,/find the map/i);
});

test("quiet-turn guard rejects random tool decisions before dice and permits query",async()=>{
  const skill={type:"tool",call:{kind:"skill"},final:null};
  const query={type:"tool",call:{kind:"query"},final:null};
  let observed=null;
  const rejected=guardQuietRandomTools({next:async()=>({output:skill})},
    (decision)=>{observed=decision;});
  await assert.rejects(rejected.next(),/tool_policy_failure/);
  assert.strictEqual(observed,skill);
  const allowed=guardQuietRandomTools({next:async()=>({output:query})},
    ()=>assert.fail("query must not fail policy"));
  assert.strictEqual((await allowed.next()).output,query);
});
