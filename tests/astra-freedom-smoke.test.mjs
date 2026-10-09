import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { diagnosticState } from "../scripts/astra-primary-production-smoke.mjs";
import { freedomArc, freedomFetcher, runFreedomSmoke } from "../scripts/astra-freedom-live-smoke.mjs";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";

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
    await assert.rejects(fetcher("https://api.openai.com/v1/responses",
      {body:JSON.stringify(textRequest)}),/freedom_billing_unknown/);
    assert.equal(state.requests,1);assert.equal(state.usageKnown,false);
    assert.ok(state.providerDiagnostics[0].captureError);
    const reportedSpend=state.usageKnown?(state.inputTokens*10+state.outputTokens*50)/1_000_000:null;
    assert.equal(reportedSpend,null);
    await assert.rejects(fetcher("https://api.openai.com/v1/responses",{body:JSON.stringify(textRequest)}),
      /diagnostic_spend_cap/);
    assert.equal(state.requests,1,"unknown billing stops any subsequent request");
  }
});

test("successful provider responses must prove the returned Astra Standard route",async()=>{
  for(const route of [
    {model:"gpt-6-sol",service_tier:"default"},
    {model:"gpt-6-astra",service_tier:"priority"},
    {model:"gpt-6-astra"},
  ]){
    let calls=0;
    const state=stateFor(),fetcher=freedomFetcher(state,async()=>{
      calls++;
      return new Response(JSON.stringify({...route,status:"completed",output:[],
        usage:{input_tokens:7,output_tokens:3}}));
    });
    await assert.rejects(fetcher("https://api.openai.com/v1/responses",
      {body:JSON.stringify(textRequest)}),/freedom_returned_route_rejected/);
    assert.equal(calls,1,"a routing failure has no transport retry");
    assert.equal(state.requests,1);
    assert.equal(state.providerDiagnostics[0].returnedRouteValid,false);
    assert.equal(state.providerDiagnostics[0].accountingValid,true);
    assert.equal(state.responses.length,1,"route rejection preserves captured evidence");
    assert.equal(state.inputTokens,7);assert.equal(state.outputTokens,3);
  }
});

test("missing billing on the final allowed narration request stops immediately",async()=>{
  let calls=0;
  const state=stateFor(),fetcher=freedomFetcher(state,async()=>{
    calls++;
    return new Response(JSON.stringify({model:"gpt-6-astra",service_tier:"default",
      status:"completed",output:[],...(calls<8?{usage:{input_tokens:1,output_tokens:1}}:{})}));
  });
  for(let i=0;i<7;i++)await fetcher("https://api.openai.com/v1/responses",
    {body:JSON.stringify(textRequest)});
  const narration={...textRequest,reasoning:{effort:"medium"},
    text:{format:{name:"dm_narrate",strict:true}}};
  await assert.rejects(fetcher("https://api.openai.com/v1/responses",
    {body:JSON.stringify(narration)}),/freedom_billing_unknown/);
  assert.equal(state.requests,8);assert.equal(calls,8);
  assert.equal(state.usageKnown,false);
  assert.equal(state.providerDiagnostics.at(-1).stage,"dm_narrate");
  assert.equal(state.providerDiagnostics.at(-1).accountingValid,false);
  assert.equal(state.responses.at(-1).usage.inputTokens,null);
  await assert.rejects(fetcher("https://api.openai.com/v1/responses",
    {body:JSON.stringify(narration)}),/diagnostic_request_cap/);
  assert.equal(calls,8);
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

test("independent disposable A/B/C fixtures separate inquiry, formal rest and unrestricted fiction",async()=>{
  const report=await runFreedomSmoke({offline:true,realFetch:async()=>{throw Error("unreachable");}});
  assert.equal(report.status,"passed",JSON.stringify(report));
  assert.equal(report.turns.length,3);
  assert.equal(report.requests,0);assert.equal(report.mediaCalls,0);
  assert.deepEqual(report.turns.map((row)=>row.turn),["A","B","C"]);
  assert.equal(new Set(report.turns.map((row)=>row.campaignId)).size,3,
    "every scenario uses its own disposable campaign");
  assert.equal(new Set(report.turns.map((row)=>row.operationId)).size,3);
  const [reward,rest,improvisation]=report.turns;
  assert.equal(reward.after.resources.currency_silver,2);
  assert.equal(reward.after.food,1);
  assert.equal(reward.after.completed_jobs,reward.before.completed_jobs+1);
  assert.equal(reward.after.open_jobs,0,"a future inquiry does not require a new accepted Quest");
  assert.equal(reward.after.completed_rests,reward.before.completed_rests);
  assert.equal(reward.after.hp,reward.before.hp);
  assert.equal(reward.after.supplies,reward.before.supplies);
  assert.equal(reward.after.worldMinutes,reward.before.worldMinutes,"permission does not skip to morning");
  assert.match(freedomArc[0],/not.*sleep|sleep.*not/i);
  assert.match(freedomArc[0],/not accepting/i);
  for(const row of [rest,improvisation]){
    assert.equal(row.before.hp,4,"scenario starts with independently prepared injured state");
    assert.equal(row.before.maxHp,12);
    assert.equal(row.before.supplies,3);
    assert.equal(row.before.worldMinutes,0);
    assert.equal(row.before.resources.currency_silver??0,0,"reward state cannot leak across scenarios");
    assert.equal(row.before.food,0);
    assert.equal(row.before.completed_rests,0);
  }
  assert.equal(rest.after.hp,10);
  assert.equal(rest.after.supplies,2);
  assert.equal(rest.after.worldMinutes,480);
  assert.equal(rest.after.completed_rests,1);
  assert.deepEqual(rest.after.safeLocationIds,rest.before.safeLocationIds);
  assert.deepEqual(rest.after.safeLocationIds,[]);
  assert.equal(improvisation.status,"committed");
  assert.ok(improvisation.narration.trim().length>0,"any valid outcome may continue the story");
  assert.ok(improvisation.after.hp<=improvisation.before.hp,"improvisation cannot grant unearned healing");
  assert.deepEqual(report.turns[1].saveLoad,{saved:true,loaded:true,unchanged:true});
  assert.ok(report.turns.every((row)=>row.replay.unchanged));
});

test("improvisation acceptance permits alternative fiction without a fixed bartender response",async()=>{
  const alternate="The bartender steps aside; the filthy water lands on an empty stool. He folds his arms and waits for your explanation.";
  const report=await runFreedomSmoke({offline:true,offlineNarrations:[null,null,alternate],
    realFetch:async()=>{throw Error("unreachable");}});
  assert.equal(report.status,"passed",JSON.stringify(report));
  assert.equal(report.turns[2].narration,alternate);
  assert.equal(report.turns[2].status,"committed");
  assert.equal(report.requests,0);
});

test("a provider failure stops acceptance before any later scenario or retry",async()=>{
  const visited=[];
  const report=await runFreedomSmoke({offline:true,realFetch:async()=>{throw Error("unreachable");},
    offlineProviderFactory(index,_world,base){
      visited.push(index);
      return {...base,next:async()=>{throw new DmError("provider",true);}};
    }});
  assert.equal(report.status,"failed",JSON.stringify(report));
  assert.deepEqual(visited,[0]);
  assert.equal(report.turns.length,1);
  assert.equal(report.turns[0].status,"failed");
  assert.equal(report.requests,0);
});

test("a semantic difference records failed acceptance while independent scenarios continue",async()=>{
  const visited=[];
  const report=await runFreedomSmoke({offline:true,
    offlineNarrations:["The bartender discusses the loft and possible work; payment has not yet been settled."],
    realFetch:async()=>{throw Error("unreachable");},
    offlineProviderFactory(index,_world,base){
      visited.push(index);
      if(index!==0)return base;
      return {...base,next:async(...args)=>{
        const result=await base.next(...args);
        result.output.final.effects=[];
        return result;
      }};
    }});
  assert.equal(report.status,"acceptance-failed",JSON.stringify(report));
  assert.deepEqual(visited,[0,1,2]);
  assert.equal(new Set(report.turns.map((row)=>row.campaignId)).size,3);
  assert.ok(report.turns.every((row)=>row.status==="committed" && row.replay.unchanged));
  assert.equal(report.turns[0].acceptance.passed,false);
  assert.ok(report.turns.slice(1).every((row)=>row.acceptance.passed));
  assert.equal(report.requests,0);
});
