import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";

const usage={model:"scripted-astra",calls:1,inputTokens:100,outputTokens:20,
  reasoningTokens:5,cachedInputTokens:0,latencyMs:0};
const publicNarration=(text="The miller wipes flour from his hands and hears you out.")=>({
  beats:[{text,requiresEffects:[]}],visualDescription:{text:"",requiresEffects:[]}});

async function setup() {
  const {f,hero,npc}=await takenOver(51);
  const timeline=await f.fence(f.cid);
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true,
    {astraResponseContract:"unified-v1"});
  const memory=createRpcMemoryStore(f.owner,memoryRpc,timeline);
  let plans=0,narrators=0;
  const deps={store,memory,summaries:{summarize:()=>assert.fail("foreground summary provider")},
    provider:{next:async(_context,_input,_receipts,_checks,_caps,source)=>{
      plans++;
      return {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[],publicNarration:publicNarration()}}};
    },narrate:async()=>{narrators++;assert.fail("unified turn must not call a dedicated narrator");}}};
  const input=async(text="i go to mill and ask miller for job")=>{
    const play=await store.readPlay(f.cid);
    return {operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:text,
      companionId:null,listenerIds:[],mechanic:null};
  };
  const row=id=>f.one("select status,failure,retryable,committed_revision,astra_response_contract,astra_ordered_effects,source,checkpoint from rpg_private.turns where id=$1",[id]);
  return {f,hero,npc,store,deps,input,row,counts:()=>({plans,narrators})};
}

test("seven free-form actions use one unified response each, without bespoke handlers or foreground summaries",async()=>{
  const s=await setup();
  try {
    for(const text of [
      "i go to mill and ask miller for job",
      "i insult the mayor's hat",
      "i sit by the road and watch people pass",
      "i follow a stray dog",
      "i ask the guard whether he is happy with his life",
      "i throw my boot at the tavern sign",
      "i tell the merchant i'll work for dinner instead of money",
    ]) {
      const input=await s.input(text);
      assert.equal((await runAstraTurn(input,s.deps)).status,"committed",text);
      const saved=await s.row(input.operationId);
      assert.equal(saved.astra_response_contract,"unified-v1");
      assert.equal(saved.checkpoint.usage.length,1);
      assert.ok(saved.checkpoint.astraPrimary.finalProposal);
      assert.equal(saved.checkpoint.narration.clarification,null);
    }
    assert.deepEqual(s.counts(),{plans:7,narrators:0});
  } finally {await s.f.db.close();}
});

test("exact replay and commit-interruption retry reuse the unified final and narration without a new provider call",async()=>{
  const s=await setup();
  try {
    const input=await s.input();
    const commit=s.store.commit;
    let first=true;
    s.store.commit=async(...args)=>{
      if(first){first=false;throw new DmError("unavailable",true);}
      return commit(...args);
    };
    assert.equal((await runAstraTurn(input,s.deps)).status,"failed");
    const before=await s.row(input.operationId);
    assert.ok(before.checkpoint.astraPrimary.finalProposal);
    assert.ok(before.checkpoint.narration);
    const result=await resumeAstraTurn({commandId:randomUUID(),campaignId:s.f.cid,
      operationId:input.operationId,timeline:input.timeline,action:"retry",checkId:null},s.deps);
    assert.equal(result.status,"committed");
    assert.equal((await runAstraTurn(input,s.deps)).status,"committed");
    assert.deepEqual(s.counts(),{plans:1,narrators:0});
    assert.equal((await s.f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,1);
  } finally {await s.f.db.close();}
});

test("unified tool continuation keeps the server check and ends with public narration, without a separate narrator",async()=>{
  const s=await setup();
  try {
    let calls=0,rolls=0;
    s.deps.random=()=>{rolls++;return 18;};
    s.deps.provider.next=async(_ctx,_input,receipts,checks,_caps,source)=>{
      calls++;
      if(!receipts.length)return {usage,output:{type:"tool",final:null,
        call:{kind:"skill",actorId:s.hero,targetId:null,dc:10,itemId:null,scope:null}}};
      assert.equal(checks[0].kept,18);
      return {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[],
        publicNarration:publicNarration("You make it across the uneven stones.")}}};
    };
    const input=await s.input("I cross the uneven stones carefully.");
    const paused=await runAstraTurn(input,s.deps);
    assert.equal(paused.status,"awaiting_confirmation");
    const result=await resumeAstraTurn({commandId:randomUUID(),campaignId:s.f.cid,
      operationId:input.operationId,timeline:input.timeline,action:"continue",checkId:null},s.deps);
    assert.equal(result.status,"committed");
    assert.equal(calls,2);
    assert.equal(rolls,1);
    const saved=await s.row(input.operationId);
    assert.equal(saved.checkpoint.checks[0].kept,18);
    assert.equal(saved.checkpoint.astraPrimary.toolReceipts.length,1);
    assert.equal(saved.checkpoint.usage.length,2);
    assert.equal(saved.checkpoint.narration.narration,"You make it across the uneven stones.");
  } finally {await s.f.db.close();}
});

test("pre-existing Astra turn without a contract pin retains its two-stage semantics",async()=>{
  const s=await setup();
  try {
    const input=await s.input();
    await s.store.begin(input,"astra-primary-v1");
    let plans=0,narrators=0;
    s.deps.provider={next:async(_ctx,_input,_receipts,_checks,_caps,source)=>{
      plans++;
      assert.equal(source.astraResponseContract,undefined);
      return {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[]}}};
    },narrate:async()=>{narrators++;return {usage,output:{
      narration:"The miller greets you.",visualDescription:"",clarification:null}};}};
    assert.equal((await runAstraTurn(input,s.deps)).status,"committed");
    assert.equal((await s.row(input.operationId)).astra_response_contract,null);
    assert.equal(plans,1);
    assert.equal(narrators,1);
  } finally {await s.f.db.close();}
});

test("rejected optional authority drops dependent completion text and preserves independent fiction",async()=>{
  const s=await setup();
  try {
    s.deps.provider.next=async(_ctx,_input,_receipts,_checks,_caps,source)=>({usage,
      output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[{kind:"unsupported_optional",description:"No durable lodging authority"}],
        publicNarration:{beats:[
          {text:"The miller considers your offer.",requiresEffects:[]},
          {text:"You receive a permanent lodging entitlement.",requiresEffects:[0]}],
          visualDescription:{text:"A key granted as permanent property.",requiresEffects:[0]}}}}});
    const input=await s.input(),result=await runAstraTurn(input,s.deps);
    assert.equal(result.status,"committed");
    assert.equal(result.narration,"The miller considers your offer.");
    const saved=await s.row(input.operationId);
    assert.equal(saved.checkpoint.narration.visualDescription,"");
    assert.deepEqual(saved.astra_ordered_effects.indices,[]);
    assert.deepEqual(saved.astra_ordered_effects.rejected,[{index:0,reason:"not_authorized"}]);
  } finally {await s.f.db.close();}
});

test("if every public beat requires rejected state, preserve input and fail technically with no partial commit",async()=>{
  const s=await setup();
  try {
    s.deps.provider.next=async(_ctx,_input,_receipts,_checks,_caps,source)=>({usage,
      output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[{kind:"unsupported_optional",description:"No authority"}],
        publicNarration:{beats:[{text:"You receive everything.",requiresEffects:[0]}],
          visualDescription:{text:"",requiresEffects:[]}}}}});
    const input=await s.input(),result=await runAstraTurn(input,s.deps);
    assert.equal(result.status,"failed");
    assert.equal(result.failure,"provider");
    assert.equal(result.canRetry,true);
    assert.equal(result.input,input.input);
    assert.equal((await s.row(input.operationId)).committed_revision,null);
    assert.equal((await s.f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,0);
  } finally {await s.f.db.close();}
});

test("nested Character Model and generic private values never enter unified public narration",async()=>{
  const s=await setup();
  try {
    const originalClaim=s.store.claim;
    s.store.claim=async(...args)=>{
      const claim=await originalClaim(...args);
      if(claim)claim.source.privateState={...claim.source.privateState,
        consequence:{nested:{privateValue:"NESTED_PRIVATE_CANARY_18745"}},
        npc:{["character_"+s.npc]:JSON.stringify({schemaVersion:1,actorId:s.npc,basisOperationId:null,
          identity:{values:[],wants:[],boundaries:[],loyalties:[],signatures:[],observableVoice:"A plain voice."},
          current:{goal:"CHARACTER_PRIVATE_CANARY_54189",stress:"settled",preoccupation:null,obligation:null},
          beliefs:[],relationships:[],episodes:[]})}};
      if(claim)claim.source.worldTakeover={...claim.source.worldTakeover,
        policy:{...claim.source.worldTakeover.policy,hiddenTruth:"WORLD_PRIVATE_CANARY_71937"}};
      return claim;
    };
    for(const text of ["NESTED_PRIVATE_CANARY_18745","CHARACTER_PRIVATE_CANARY_54189",
      "WORLD_PRIVATE_CANARY_71937"]){
      s.deps.provider.next=async(_ctx,_input,_receipts,_checks,_caps,source)=>({usage,
        output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
          changes:[],outcomes:[],privatePatches:[],effects:[],publicNarration:publicNarration(text)}}});
      const input=await s.input(),result=await runAstraTurn(input,s.deps);
      assert.equal(result.status,"failed");
      assert.equal(result.failure,"validation");
      assert.equal(result.canRetry,false);
      assert.equal(JSON.stringify(result).includes(text),false);
      assert.equal((await s.row(input.operationId)).committed_revision,null);
      await s.store.cancel({commandId:randomUUID(),campaignId:s.f.cid,operationId:input.operationId,
        timeline:input.timeline,action:"cancel",checkId:null});
    }
  } finally {await s.f.db.close();}
});

test("unified unauthorized HP mutation remains nonretryable and commits nothing",async()=>{
  const s=await setup();
  try {
    s.deps.provider.next=async(_ctx,_input,_receipts,_checks,_caps,source)=>({usage,
      output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[{family:"entities",id:s.hero,
          expectedRevision:source.snapshot.entities.find(entity=>entity.id===s.hero).revision,
          values:{hp:1}}],outcomes:[],privatePatches:[],effects:[],publicNarration:publicNarration()}}});
    const input=await s.input(),result=await runAstraTurn(input,s.deps);
    assert.equal(result.status,"failed");
    assert.equal(result.failure,"validation");
    assert.equal(result.canRetry,false);
    assert.equal((await s.row(input.operationId)).committed_revision,null);
  } finally {await s.f.db.close();}
});

test("private-bucket overlap does not suppress an already-public character name",async()=>{
  const s=await setup();
  try {
    const claim=s.store.claim;
    let heroName;
    s.store.claim=async(...args)=>{
      const current=await claim(...args);
      if(current){
        heroName=current.source.snapshot.entities.find(e=>e.id===s.hero).name;
        current.source.privateState={...current.source.privateState,fact:{echo:heroName}};
      }
      return current;
    };
    s.deps.provider.next=async(_ctx,_input,_receipts,_checks,_caps,source)=>({usage,
      output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:[],publicNarration:publicNarration(heroName+" hears the miller out.")}}});
    const result=await runAstraTurn(await s.input(),s.deps);
    assert.equal(result.status,"committed");
    assert.ok(result.narration.includes(heroName));
  } finally {await s.f.db.close();}
});
