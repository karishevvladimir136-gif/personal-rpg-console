import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { registerHooks } from "node:module";
import { fileURLToPath } from "node:url";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { diagnosticState, diagnosticFetcher, diagnosticProvider,
  diagnosticStore, diagnosticRpc } from "../scripts/astra-primary-production-smoke.mjs";

test("synthetic fetch capture preserves the original response, redacts secrets, and bounds text",async()=>{
  const secret="sk-synthetic-test-key-that-must-not-appear";
  const output=JSON.stringify({type:"final",text:"x".repeat(120_500)+secret});
  const payload={model:"gpt-6-astra",service_tier:"default",status:"completed",
    usage:{input_tokens:20,output_tokens:30},
    output:[{type:"message",role:"assistant",status:"completed",
      content:[{type:"output_text",text:output}]}]};
  const original=new Response(JSON.stringify(payload),{status:200});
  const state=diagnosticState(secret);
  const fetcher=diagnosticFetcher(state,async(_url,init)=>{
    assert.equal(init.headers.Authorization,`Bearer ${secret}`);
    return original;
  });
  const result=await fetcher("https://synthetic.invalid",{
    headers:{Authorization:`Bearer ${secret}`},
    body:JSON.stringify({max_output_tokens:100})});
  assert.strictEqual(result,original);
  assert.deepEqual(await result.json(),payload);
  assert.equal(state.requests,1);
  assert.equal(state.responses[0].outputText.truncated,true);
  assert.equal(state.responses[0].outputText.redacted,true);
  assert.equal(state.responses[0].usage.inputTokens,20);
  assert.ok(!JSON.stringify(state).includes(secret));
  assert.ok(state.responses[0].outputText.text.length<=120_000);
});

test("diagnostic request and spend ceilings stop before another fetch",async()=>{
  const state=diagnosticState();
  let fetches=0;
  const fetcher=diagnosticFetcher(state,async()=>{fetches++;return new Response("{}");});
  await assert.rejects(fetcher("https://synthetic.invalid",{
    body:JSON.stringify({max_output_tokens:100_000})}),
  /diagnostic_spend_cap/);
  state.requests=4;
  await assert.rejects(fetcher("https://synthetic.invalid",{
    body:JSON.stringify({max_output_tokens:1})}),
  /diagnostic_request_cap/);
  assert.equal(fetches,0);
});

test("actual production provider parse failure retains raw synthetic output and safe boundary",async()=>{
  const hook=registerHooks({resolve(specifier,context,nextResolve){
    return specifier==="server-only"
      ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
      : nextResolve(specifier,context);
  }});
  const {createAstraPrimaryProvider}=await import(
    "../src/lib/server/dm/astra-primary-provider.ts");
  hook.deregister();
  const raw={unexpected:"synthetic-parse-failure"};
  const state=diagnosticState("synthetic-key");
  const fetcher=diagnosticFetcher(state,async()=>new Response(JSON.stringify({
    model:"gpt-6-astra",service_tier:"default",status:"completed",
    usage:{input_tokens:10,output_tokens:20},
    output:[{type:"message",role:"assistant",status:"completed",
      content:[{type:"output_text",text:JSON.stringify(raw)}]}]})));
  const provider=diagnosticProvider(state,createAstraPrimaryProvider({
    apiKey:"synthetic-key",fetcher}));
  const context={instructions:"Synthetic DM",input:"{}",
    budget:modelBudget("gpt-6-astra"),estimatedTokens:10,sourceIds:[]};
  const input={operationId:randomUUID(),campaignId:randomUUID()};
  const caps={entityIds:[],itemIds:[],participantIds:[],resources:{},
    toolItemIds:[],locationIds:[]};
  await assert.rejects(provider.next(context,input,[],[],caps,{}),
    (error)=>error.code==="validation");
  assert.equal(state.responses[0].outputText.text,JSON.stringify(raw));
  assert.equal(state.events.at(-1).method,"provider.next");
  assert.equal(state.events.at(-1).phase,"threw");
  assert.equal(state.events.at(-1).error.code,"validation");
  assert.equal(state.parsedDecision,null);
});

test("store wrapper preserves calls and disposable SQL failure detail",async()=>{
  const state=diagnosticState("synthetic-key");
  const result={status:"pending"},input={operationId:randomUUID(),campaignId:randomUUID()};
  const base={begin:async(value)=>{assert.strictEqual(value,input);return result;}};
  assert.strictEqual(await diagnosticStore(state,base).begin(input),result);
  assert.deepEqual(state.events.slice(0,2).map((e)=>[e.method,e.phase]),
    [["store.begin","entered"],["store.begin","returned"]]);

  const sqlError=Object.assign(new Error("rpg_validation: synthetic constraint"),{code:"23514"});
  const rpc=diagnosticRpc(state,async()=>{throw sqlError;});
  const store=diagnosticStore(state,createRpcTurnStore(randomUUID(),rpc));
  const lease={campaignId:input.campaignId,operationId:input.operationId,
    token:randomUUID(),expectedRevision:1};
  await assert.rejects(store.commit(lease,{narration:"synthetic"}),
    (error)=>error.code==="validation");
  assert.equal(state.sqlErrors[0].action,"commit");
  assert.equal(state.sqlErrors[0].error.code,"23514");
  assert.equal(state.sqlErrors[0].error.message,"rpg_validation: synthetic constraint");
  assert.equal(state.events.at(-1).method,"store.commit");
  assert.equal(state.events.at(-1).phase,"threw");
});

test("eight-turn synthetic fixture prepares the V2 state and Orin model with zero provider calls",()=>{
  const script=fileURLToPath(new URL("../scripts/astra-primary-production-eight-turn-smoke.mjs",
    import.meta.url));
  const run=spawnSync(process.execPath,[script,"--offline-fixture-check"],{
    encoding:"utf8",timeout:30_000,
    env:{...process.env,OPENAI_API_KEY:"",ASTRA_P1_EIGHT_TURN_SMOKE:""}});
  assert.equal(run.status,0,run.stderr);
  const result=JSON.parse(run.stdout);
  assert.equal(result.status,"fixture-ready");
  assert.equal(result.providerRequests,0);
  assert.equal(result.state.maraHp,9);
  assert.equal(result.state.maraMaxHp,10);
  assert.equal(result.state.stalkerHp,6);
  assert.equal(result.state.stalkerMaxHp,8);
  assert.equal(result.state.focus,2);
  assert.equal(result.state.oil,1);
  assert.equal(result.state.worldMinutes,0);
  assert.equal(result.characterModelIds.length,1);
});
