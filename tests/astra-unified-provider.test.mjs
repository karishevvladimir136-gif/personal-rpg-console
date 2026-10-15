import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { fixture } from "./phase2-mechanics-fixtures.mjs";
import { astraCapabilities } from "../src/lib/gameplay/astra-primary.ts";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";

const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
    : nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

function setup() {
  const source=fixture();
  source.astraResponseContract="unified-v1";
  const input={operationId:randomUUID(),campaignId:source.snapshot.campaign.id,
    expectedRevision:source.runtime.revision,mode:"game",input:"I ask the miller for work.",
    companionId:null,listenerIds:[],mechanic:null};
  const caps=astraCapabilities(source);
  const context={instructions:"Synthetic unified DM",input:"{}",budget:modelBudget("gpt-6-astra"),
    estimatedTokens:12,sourceCount:1};
  const raw={type:"final",call:null,final:{schemaVersion:1,
    worldMinutes:source.runtime.worldMinutes,changes:[],outcomes:[],privatePatches:[],effects:[],
    publicNarration:{beats:[{text:"The miller looks up from his work.",requiresEffects:[]}],
      visualDescription:{text:"A sunlit mill.",requiresEffects:[]}}}};
  return {source,input,caps,context,raw};
}
function response(raw) {
  return new Response(JSON.stringify({id:"resp_synthetic_unified",model:"gpt-6-astra",
    service_tier:"default",status:"completed",output:[{type:"message",role:"assistant",
      status:"completed",content:[{type:"output_text",text:JSON.stringify(raw)}]}],
    usage:{input_tokens:120,output_tokens:40,input_tokens_details:{cached_tokens:25},
      output_tokens_details:{reasoning_tokens:10}}}),
    {headers:{"x-request-id":"req_synthetic_unified"}});
}

test("unified authoring returns public fragments in the existing bounded final with one High request",async()=>{
  const f=setup(),bodies=[],attempts=[],progress=[];
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:a=>attempts.push(a),
    fetcher:async(_url,init)=>{bodies.push(JSON.parse(init.body));return response(f.raw);}});
  const got=await provider.next(f.context,f.input,[],[],f.caps,f.source,d=>progress.push(d));
  assert.deepEqual(got.output.final.publicNarration,f.raw.final.publicNarration);
  assert.equal(bodies.length,1);
  assert.equal(bodies[0].reasoning.effort,"high");
  assert.equal(bodies[0].service_tier,"default");
  const finalSchema=bodies[0].text.format.schema.properties.final.anyOf[0];
  assert.ok(finalSchema.required.includes("publicNarration"));
  assert.equal(finalSchema.properties.outcomes.maxItems,0);
  assert.equal(got.usage.reasoningTokens,10);
  assert.equal(got.usage.cachedInputTokens,25);
  assert.equal(got.usage.reasoning,"high");
  assert.equal(got.usage.serviceTier,"default");
  assert.equal(got.usage.requestBytes,Buffer.byteLength(JSON.stringify(bodies[0])));
  assert.equal(attempts.length,1);
  assert.equal(progress[0].phase,"completed");
  assert.ok(progress[0].elapsedMs>=0);
});

test("missing contract pin keeps the old final contract, and unified cannot omit its public contract",async()=>{
  const f=setup();
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
    fetcher:async()=>response(f.raw),planDiagnosticObserver:()=>{}});
  delete f.source.astraResponseContract;
  await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),{code:"validation"});
  delete f.raw.final.publicNarration;
  assert.equal((await provider.next(f.context,f.input,[],[],f.caps,f.source)).output.type,"final");
  f.source.astraResponseContract="unified-v1";
  await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),{code:"validation"});
});

test("unified tool continuation hides private replay identities and raw check metadata",async()=>{
  const f=setup(),bodies=[],receiptId=randomUUID(),checkId=randomUUID();
  const actorId=f.caps.entityIds[0],targetId=f.caps.entityIds[1];
  const check={id:checkId,kind:"attack",actorId,targetId,visibility:"private",
    success:true,dc:11,dice:[15],kept:15,modifier:2,total:17,rollNumber:1};
  const receipt={id:receiptId,position:0,
    call:{kind:"attack",actorId,targetId,dc:null,itemId:null,scope:null},result:check};
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
    fetcher:async(_url,init)=>{bodies.push(JSON.parse(init.body));return response(f.raw);}});
  await provider.next(f.context,f.input,[receipt],[check],f.caps,f.source);
  const serialized=bodies[0].input;
  assert.equal(serialized.includes(receiptId),false);
  assert.equal(serialized.includes(checkId),false);
  const input=JSON.parse(serialized);
  assert.equal(input.recordedChecks.length,0);
  const result=input.toolReceipts[0].result;
  assert.equal(result.success,true);
  for(const key of ["id","dc","dice","kept","modifier","total","rollNumber"])
    assert.equal(Object.hasOwn(result,key),false,key);
  assert.equal(Object.hasOwn(input.toolReceipts[0],"id"),false);
  assert.equal(Object.hasOwn(input.toolReceipts[0].call,"dc"),false);
  delete f.source.astraResponseContract;
  delete f.raw.final.publicNarration;
  await provider.next(f.context,f.input,[receipt],[check],f.caps,f.source);
  assert.ok(bodies[1].input.includes(receiptId));
  assert.ok(bodies[1].input.includes(checkId));
});

test("unified public fragments cannot forge effect dependencies or unbounded text",async()=>{
  for(const change of [
    raw=>{raw.final.publicNarration.beats[0].requiresEffects=[0];},
    raw=>{raw.final.publicNarration.beats[0].text="x".repeat(6001);},
    raw=>{raw.final.publicNarration.visualDescription.requiresEffects=[-1];},
    raw=>{raw.final.publicNarration.extra="private";},
  ]) {
    const f=setup(),diagnostics=[];
    change(f.raw);
    const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
      planDiagnosticObserver:d=>diagnostics.push(d),fetcher:async()=>response(f.raw)});
    await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),{code:"validation"});
    assert.match(diagnostics[0].reasonCode,/^decision_public_narration_/);
  }
});

test("unified model-authored outcomes cannot bypass effect-dependent narration",async()=>{
  const f=setup(),diagnostics=[];
  let schema;
  f.raw.final.outcomes=[{kind:"reward",entityIds:[],itemIds:[],text:"You receive 1000 silver."}];
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
    planDiagnosticObserver:d=>diagnostics.push(d),fetcher:async(_url,init)=>{
      schema=JSON.parse(init.body).text.format.schema;
      return response(f.raw);
    }});
  await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),
    error=>error.code==="validation"&&error.retryable===false);
  assert.equal(diagnostics[0].reasonCode,"decision_final_limits");
  delete f.source.astraResponseContract;
  delete f.raw.final.publicNarration;
  assert.equal((await provider.next(f.context,f.input,[],[],f.caps,f.source)).output.final.outcomes.length,1);
  assert.equal(schema.properties.final.anyOf[0].properties.outcomes.maxItems,undefined);
});

test("only unified output JSON/public-fragment formatting failures offer a manual technical retry",async()=>{
  for(const failure of ["json","public-shape","public-bounds"]){
    const f=setup();
    if(failure==="public-shape")f.raw.final.publicNarration.beats=[];
    if(failure==="public-bounds")f.raw.final.publicNarration.beats[0].text="x".repeat(6001);
    const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
      planDiagnosticObserver:()=>{},fetcher:async()=>{
        if(failure!=="json")return response(f.raw);
        const payload=await response(f.raw).json();
        payload.output[0].content[0].text="{malformed";
        return new Response(JSON.stringify(payload));
      }});
    await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),
      error=>error.code==="validation"&&error.retryable===true);
    if(failure==="json"){
      delete f.source.astraResponseContract;
      await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),
        error=>error.code==="validation"&&error.retryable===false);
    }
  }
});

test("unified provider-bound outer capacity is a manual retry without dispatch, legacy remains unchanged",async()=>{
  const f=setup();
  f.context.budget={...f.context.budget,inputCap:1};
  let calls=0;
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async()=>{
    calls++;return response(f.raw);
  }});
  await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),
    error=>error.code==="context"&&error.retryable===true);
  delete f.source.astraResponseContract;
  await assert.rejects(provider.next(f.context,f.input,[],[],f.caps,f.source),
    error=>error.code==="context"&&error.retryable===false);
  assert.equal(calls,0);
});

test("legacy narration failures retain bounded exact reason codes rather than raw output",async()=>{
  for(const [raw,reason] of [
    [{narration:"A valid line.",visualDescription:"",clarification:"Which door?"},"narration_clarification_present"],
    [{narration:"A line.",visualDescription:"",clarification:null,hidden:"PRIVATE_CANARY"},"narration_contract_invalid"],
  ]) {
    const f=setup(),diagnostics=[];
    const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",attemptObserver:()=>{},
      planDiagnosticObserver:d=>diagnostics.push(d),fetcher:async()=>response(raw)});
    await assert.rejects(provider.narrate(f.context,f.input),{code:"validation"});
    assert.equal(diagnostics[0].reasonCode,reason);
    assert.equal(JSON.stringify(diagnostics).includes("PRIVATE_CANARY"),false);
  }
});

test("default JSON metadata logs exclude credentials, prompts and assistant output",async()=>{
  const f=setup(),logs=[],key="sk-SYNTHETIC_CREDENTIAL_NEVER_LOG_123456";
  f.context.instructions="PRIVATE_INSTRUCTION_CANARY";
  f.raw.final.publicNarration.beats[0].text="ASSISTANT_OUTPUT_CANARY";
  const original=console.info;
  console.info=line=>logs.push(String(line));
  try {
    const provider=createAstraPrimaryProvider({apiKey:key,fetcher:async()=>response(f.raw)});
    await provider.next(f.context,f.input,[],[],f.caps,f.source);
  } finally {console.info=original;}
  const serialized=logs.join("\n");
  assert.equal(serialized.includes(key),false);
  assert.equal(serialized.includes("PRIVATE_INSTRUCTION_CANARY"),false);
  assert.equal(serialized.includes("ASSISTANT_OUTPUT_CANARY"),false);
  const entries=logs.map(JSON.parse);
  assert.ok(entries.some(row=>row.event==="astra_provider_attempt"&&row.requestBytes>0));
  assert.ok(entries.some(row=>row.event==="astra_provider_boundary"&&row.requestId==="req_synthetic_unified"));
});
