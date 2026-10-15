import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";

const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
const narration={narration:"The village answers.",visualDescription:"",clarification:null};
const transport=(observe)=>{
  observe?.({phase:"request",responseReceived:false,elapsedMs:12,
    abortKind:null,causeCode:"ECONNRESET"});
  throw new DmError("provider",true);
};

async function setup() {
  const f=await fixture(50);
  const w=await world(f);
  const timeline=await f.fence(w.cid);
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try {return {data:await f.memory(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true);
  const memory=createRpcMemoryStore(f.owner,memoryRpc,timeline);
  const play=await store.readPlay(w.cid);
  const input={operationId:randomUUID(),campaignId:w.cid,timeline,
    expectedRevision:play.revision,mode:"game",input:"Ask around the village for work",
    companionId:null,listenerIds:[],mechanic:null};
  const deps={store,memory,summaries:{summarize:()=>assert.fail("unexpected summary")},provider:null};
  const row=()=>f.one(`select status,failure,retryable,expected_revision,committed_revision,
    source,checkpoint,astra_diagnostic from rpg_private.turns where id=$1`,[input.operationId]);
  return {f,w,input,deps,row};
}

function final(source) {
  return {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
    changes:[],outcomes:[],privatePatches:[]}}};
}
function resume(input,action,checkId=null) {
  return {commandId:randomUUID(),campaignId:input.campaignId,
    operationId:input.operationId,timeline:input.timeline,action,checkId};
}

test("one pre-response transport retry commits the same pinned operation once",async()=>{
  const {f,input,deps,row}=await setup();
  try {
    let calls=0,sourcePin=null;
    deps.provider={next:async(_context,gotInput,receipts,checks,_caps,source,observe)=>{
      calls++;
      assert.equal(gotInput.operationId,input.operationId);
      assert.equal(receipts.length,0);
      assert.equal(checks.length,0);
      const pin=JSON.stringify(source);
      if(sourcePin) assert.equal(pin,sourcePin);
      else sourcePin=pin;
      if(calls===1) return transport(observe);
      return final(source);
    },narrate:async()=>({usage,output:narration})};
    const result=await runAstraTurn(input,deps);
    assert.equal(result.status,"committed");
    assert.equal(calls,2);
    const saved=await row();
    assert.ok(saved.committed_revision>input.expectedRevision);
    assert.equal(saved.checkpoint.checks.length,0);
    assert.equal(saved.checkpoint.astraPrimary.toolReceipts.length,0);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,1);
    assert.equal((await runAstraTurn(input,deps)).status,"committed");
    assert.equal(calls,2);
  } finally {await f.db.close();}
});

test("two transport failures stay retryable; manual Retry resumes the exact source",async()=>{
  const {f,input,deps,row}=await setup();
  try {
    let calls=0;
    deps.provider={next:async(_context,_input,_receipts,_checks,_caps,source,observe)=>{
      calls++;
      if(calls<=2) return transport(observe);
      return final(source);
    },narrate:async()=>({usage,output:narration})};
    const failed=await runAstraTurn(input,deps);
    assert.equal(failed.status,"failed");
    assert.equal(failed.canRetry,true);
    assert.equal(calls,2);
    const pinned=await row();
    assert.equal(pinned.failure,"provider");
    assert.equal(pinned.committed_revision,null);
    assert.equal(pinned.astra_diagnostic.stage,"plan");
    assert.equal(pinned.astra_diagnostic.providerResponseReceived,false);
    assert.equal(pinned.checkpoint.astraPrimary.finalProposal,null);
    assert.deepEqual(pinned.checkpoint.astraPrimary.toolReceipts,[]);
    assert.deepEqual(pinned.checkpoint.checks,[]);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,0);
    const done=await resumeAstraTurn(resume(input,"retry"),deps);
    assert.equal(done.status,"committed");
    assert.equal(calls,3);
    const saved=await row();
    assert.deepEqual(saved.source,pinned.source);
    assert.ok(saved.committed_revision>input.expectedRevision);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,1);
  } finally {await f.db.close();}
});

test("an existing displayed check and tool receipt survive failure, Continue, and Retry",async()=>{
  const {f,w,input,deps,row}=await setup();
  try {
    let calls=0,rolls=0;
    deps.random=()=>{rolls++;return 12;};
    deps.provider={next:async(_context,_input,receipts,_checks,_caps,source,observe)=>{
      calls++;
      if(receipts.length===0)return {usage,output:{type:"tool",final:null,
        call:{kind:"skill",actorId:w.hero,targetId:null,dc:10,itemId:null,scope:null}}};
      if(calls===2||calls===3)return transport(observe);
      return final(source);
    },narrate:async()=>({usage,output:narration})};
    const paused=await runAstraTurn(input,deps);
    assert.equal(paused.status,"awaiting_confirmation");
    const before=(await row()).checkpoint;
    assert.equal(before.checks.length,1);
    assert.equal(before.astraPrimary.toolReceipts.length,1);
    assert.equal(rolls,1);
    const failed=await resumeAstraTurn(resume(input,"continue"),deps);
    assert.equal(failed.status,"failed");
    assert.equal(failed.canRetry,true);
    assert.equal(calls,3);
    const done=await resumeAstraTurn(resume(input,"retry"),deps);
    assert.equal(done.status,"committed");
    assert.equal(calls,4);
    assert.equal(rolls,1);
    const after=(await row()).checkpoint;
    assert.deepEqual(after.checks,before.checks);
    assert.deepEqual(after.astraPrimary.toolReceipts,before.astraPrimary.toolReceipts);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,1);
  } finally {await f.db.close();}
});

test("a narration transport interruption retries without replanning or duplicating commit",async()=>{
  const {f,input,deps,row}=await setup();
  try {
    let plans=0,narrations=0;
    deps.provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>{
      plans++;
      return final(source);
    },narrate:async(_context,_input,observe)=>{
      narrations++;
      if(narrations===1)return transport(observe);
      return {usage,output:narration};
    }};
    const result=await runAstraTurn(input,deps);
    assert.equal(result.status,"committed");
    assert.equal(plans,1);
    assert.equal(narrations,2);
    assert.ok((await row()).checkpoint.astraPrimary.finalProposal);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,1);
  } finally {await f.db.close();}
});

test("one automatic retry budget spans planner tool continuations and narration",async()=>{
  for(const later of ["tool continuation","narration"]){
    const {f,input,deps,row}=await setup();
    try {
      let plans=0,narrations=0;
      deps.provider={next:async(_context,_input,receipts,_checks,_caps,source,observe)=>{
        plans++;
        if(plans===1)return transport(observe);
        if(later==="tool continuation"){
          if(receipts.length===0)return {usage,output:{type:"tool",final:null,
            call:{kind:"query",actorId:null,targetId:null,dc:null,itemId:null,
              scope:"current-public"}}};
          return transport(observe);
        }
        return final(source);
      },narrate:async(_context,_input,observe)=>{
        narrations++;
        return transport(observe);
      }};
      const failed=await runAstraTurn(input,deps);
      assert.equal(failed.status,"failed",later);
      assert.equal(failed.canRetry,true,later);
      assert.equal(plans,later==="tool continuation"?3:2,later);
      assert.equal(narrations,later==="narration"?1:0,later);
      const saved=await row();
      assert.equal(saved.committed_revision,null,later);
      assert.equal(saved.checkpoint.astraPrimary.toolReceipts.length,
        later==="tool continuation"?1:0,later);
      assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
        [input.operationId])).n,0,later);
    } finally {await f.db.close();}
  }
});

for(const scenario of [
  {name:"received response",progress:{phase:"output-parse",responseReceived:true},
    error:new DmError("provider",true)},
  {name:"schema validation",progress:{phase:"output-parse",responseReceived:true},
    error:new DmError("validation",false)},
  {name:"conflict",progress:{phase:"request",responseReceived:false},
    error:new DmError("conflict",false)},
  {name:"no explicit transport observation",progress:null,
    error:new DmError("provider",true)},
]) test(`${scenario.name} does not trigger a transport retry`,async()=>{
  const {f,input,deps}=await setup();
  try {
    let calls=0;
    deps.provider={next:async(_context,_input,_receipts,_checks,_caps,_source,observe)=>{
      calls++;
      if(scenario.progress)observe?.(scenario.progress);
      throw scenario.error;
    },narrate:()=>assert.fail("narration must not run")};
    const result=await runAstraTurn(input,deps);
    assert.equal(result.status,"failed");
    assert.equal(calls,1);
  } finally {await f.db.close();}
});

for(const progress of [
  {elapsedMs:60000,abortKind:"timeout",causeCode:"ETIMEDOUT"},
  {elapsedMs:60000,abortKind:null,causeCode:"ECONNRESET"},
  {elapsedMs:12,abortKind:"abort",causeCode:"ECONNRESET"},
  {elapsedMs:12,abortKind:null,causeCode:null},
]) test(`no automatic replay for ${JSON.stringify(progress)}`,async()=>{
  const {f,input,deps,row}=await setup();
  try {
    let calls=0;
    deps.provider={next:async(_context,_input,_receipts,_checks,_caps,_source,observe)=>{
      calls++;
      observe?.({phase:"request",responseReceived:false,...progress});
      throw new DmError("provider",true);
    },narrate:()=>assert.fail("narration must not run")};
    const result=await runAstraTurn(input,deps);
    assert.equal(result.status,"failed");
    assert.equal(result.canRetry,true);
    assert.equal(calls,1);
    assert.equal((await row()).committed_revision,null);
  } finally {await f.db.close();}
});
