import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { diagnosticState } from "../scripts/astra-primary-production-smoke.mjs";
import { freedomFetcher, runFreedomSmoke } from "../scripts/astra-freedom-live-smoke.mjs";

const textRequest={model:"gpt-6-astra",store:false,service_tier:"default",input:"Synthetic only",
  reasoning:{effort:"high"},max_output_tokens:16,text:{format:{name:"dm_plan",strict:true}}};
const stateFor=(secret="")=>{
  const state=diagnosticState(secret,{maxRequests:8,maxSpendUsd:8});
  state.providerDiagnostics=[];return state;
};

test("live forensic capture retains a bounded redacted schema rejection without request/headers",async()=>{
  const secret="sk-synthetic-secret-for-test",state=stateFor(secret);
  const rejection=freedomFetcher(state,async()=>new Response(JSON.stringify({error:{
    code:"invalid_json_schema",type:"invalid_request_error",
    message:`Invalid schema ${secret} Bearer leaked-test-value ${"x".repeat(800)}`}}),
    {status:400,headers:{"x-request-id":"req_synthetic"}}));
  const result=await rejection("https://api.openai.com/v1/responses",{body:JSON.stringify(textRequest)});
  assert.equal(result.status,400);assert.equal(state.requests,1);
  assert.equal(state.providerDiagnostics[0].providerCode,"invalid_json_schema");
  assert.equal(state.providerDiagnostics[0].providerType,"invalid_request_error");
  assert.equal(state.providerDiagnostics[0].requestId,"req_synthetic");
  assert.ok(state.providerDiagnostics[0].providerMessage.length<=512);
  assert.ok(!JSON.stringify(state).includes(secret));
  assert.ok(!JSON.stringify(state).includes("leaked-test-value"));
  assert.ok(!JSON.stringify(state).includes("Synthetic only"));
});

test("live text transport globally caps continuations and pins Astra/high and Astra/medium Standard",async()=>{
  let calls=0;
  const state=stateFor();
  const fetcher=freedomFetcher(state,async()=>{
    calls++;
    return new Response(JSON.stringify({model:"gpt-6-astra",service_tier:"default",status:"completed",
      output:[],usage:{input_tokens:1,output_tokens:1}}));
  });
  for(let i=0;i<8;i++){
    const body=i%2===0?textRequest:{...textRequest,reasoning:{effort:"medium"},
      text:{format:{name:"dm_narrate",strict:true}}};
    await fetcher("https://api.openai.com/v1/responses",{body:JSON.stringify(body)});
  }
  await assert.rejects(fetcher("https://api.openai.com/v1/responses",{body:JSON.stringify(textRequest)}),
    /diagnostic_request_cap/);
  assert.equal(calls,8);assert.equal(state.requests,8);
  assert.equal(state.providerDiagnostics[0].reasoning,"high");
  assert.equal(state.providerDiagnostics[1].reasoning,"medium");
  assert.ok(state.providerDiagnostics.every((row)=>row.requestedModel==="gpt-6-astra" &&
    row.requestedServiceTier==="default"));
  for(const body of [
    {...textRequest,model:"gpt-6-sol"},
    {...textRequest,service_tier:"priority"},
    {...textRequest,reasoning:{effort:"low"}},
    {...textRequest,tools:[{type:"image_generation"}]},
    {...textRequest,input:[{role:"user",content:[{type:"input_image",image_url:"synthetic"}]}]},
  ])await assert.rejects(freedomFetcher(stateFor(),async()=>{throw Error("unreachable");})(
    "https://api.openai.com/v1/responses",{body:JSON.stringify(body)}),/freedom_text_route_rejected/);
  await assert.rejects(freedomFetcher(stateFor(),async()=>{throw Error("unreachable");})(
    "https://api.openai.com/v1/images/generations",{body:JSON.stringify(textRequest)}),/freedom_route_rejected/);
});

test("an attempted request with lost transport or unusable response retains unknown spend",async()=>{
  const secret="sk-synthetic-uncertain-request",transport=stateFor(secret);
  const transportFailure=freedomFetcher(transport,async()=>{
    throw Error(`connection lost ${secret} Bearer leaked-value`);
  });
  await assert.rejects(transportFailure("https://api.openai.com/v1/responses",
    {body:JSON.stringify(textRequest)}),/connection lost/);
  assert.equal(transport.requests,1);assert.equal(transport.usageKnown,false);
  assert.equal(transport.providerDiagnostics[0].httpStatus,null);
  assert.ok(transport.providerDiagnostics[0].transportError.message.length<=512);
  assert.doesNotMatch(JSON.stringify(transport),/sk-synthetic-uncertain-request|leaked-value/);
  for(const raw of ["not valid provider JSON",JSON.stringify({extra:"x".repeat(200001)})]){
    const state=stateFor(secret),fetcher=freedomFetcher(state,async()=>new Response(raw));
    await fetcher("https://api.openai.com/v1/responses",{body:JSON.stringify(textRequest)});
    assert.equal(state.requests,1);assert.equal(state.usageKnown,false);
    assert.ok(state.providerDiagnostics[0].captureError);
    const reportedSpend=state.usageKnown?(state.inputTokens*10+state.outputTokens*50)/1_000_000:null;
    assert.equal(reportedSpend,null);
    await assert.rejects(fetcher("https://api.openai.com/v1/responses",{body:JSON.stringify(textRequest)}),
      /diagnostic_spend_cap/);
    assert.equal(state.requests,1,"unknown billing stops any subsequent request");
  }
});

test("disposable live smoke requires explicit opt-in and passed offline gates before constructing data",async()=>{
  const original=process.env.ASTRA_FREEDOM_LIVE_SMOKE;
  delete process.env.ASTRA_FREEDOM_LIVE_SMOKE;
  try {
    await assert.rejects(runFreedomSmoke({realFetch:async()=>{throw Error("unreachable");}}),
      /Explicit disposable live authorization/);
  } finally {
    if(original===undefined)delete process.env.ASTRA_FREEDOM_LIVE_SMOKE;
    else process.env.ASTRA_FREEDOM_LIVE_SMOKE=original;
  }
  const text=await readFile(new URL("../scripts/astra-freedom-live-smoke.mjs",import.meta.url),"utf8");
  assert.doesNotMatch(text,/createClient|SUPABASE_|fal\.run|imagegen|\.env\.local/);
});

test("disposable A/B/C fixture proves rewards/rest/save/replay with zero paid requests",async()=>{
  const report=await runFreedomSmoke({offline:true,realFetch:async()=>{throw Error("unreachable");}});
  assert.equal(report.status,"passed",JSON.stringify(report));
  assert.equal(report.turns.length,3);
  assert.equal(report.requests,0);assert.equal(report.mediaCalls,0);
  assert.deepEqual(report.turns.map((row)=>row.turn),["A","B","C"]);
  assert.deepEqual(report.turns[1].saveLoad,{saved:true,loaded:true,unchanged:true});
  assert.ok(report.turns.every((row)=>row.replay.unchanged));
});
