import assert from "node:assert/strict";
import test from "node:test";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { naturalFixture, finalDecision, fakeUsage } from "./helpers/natural-play-fixture.mjs";
import { setup, examples } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn, astraToolResult } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";
import { fixture as databaseFixture, world as basicWorld } from "./phase35-storage-fixture.mjs";
import { finalDecision as simplifiedDecision } from "./astra-simplified-fixture.mjs";
import { createLabService } from "../src/lib/world-lab/service.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";

const stick = {subjectRef:"input:stick",kind:"item",purpose:"inventory",ownerRef:null};
const noNarrator = async () => { throw Error("Unexpected public-only narrator"); };
const pins = async (f, operationId) => f.one(`select source,checkpoint,astra_natural_state,status,
  encode(sha256(convert_to(source::text,'UTF8')),'hex') source_hash
  from rpg_private.turns where campaign_id=$1 and id=$2`,[f.cid,operationId]);
const countStick = async (f) => (await f.one("select count(*)::integer n from public.rpg_items where campaign_id=$1 and name='stick'",[f.cid])).n;
const activeStore = async (h) => createRpcTurnStore(h.f.owner,async a=>{
  try { return {data:await h.f.runtime(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)}; }
  catch(e) {h.errors.push({action:a.p_action,message:e.message,code:e.code,where:e.where});return {error:{message:e.message,code:e.code}};}
},"gpt-6-astra",await h.f.fence(h.f.cid),true,{astraResponseContract:"unified-v1",astraNaturalContract:"natural-v1"});
async function claimNatural(h,text="I pick up a stick.", natural=true) {
  const store=await activeStore(h),play=await store.readPlay(h.f.cid);
  const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision,
    mode:"game",input:text,companionId:null,listenerIds:[],mechanic:null};
  await store.begin(input,"astra-primary-v1","unified-v1",natural?"natural-v1":undefined);
  const claim=await store.claim(h.f.cid,input.operationId);
  await store.pinAstraResponseMode(claim.lease,"public-unified");
  return {store,input,claim};
}
async function saveLoad(f,name) {
  const created=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name}));
  const saved=created.snapshot.saves.find(x=>x.name===name);
  const manifest=await f.one("select refs from rpg_private.timeline_manifests where id=$1",[saved.manifestId??
    (await f.one("select manifest_id from rpg_private.save_points where id=$1",[saved.id])).manifest_id]);
  await f.saves(f.cid,"load",await f.command(f.cid,{saveId:saved.id,label:`Restore ${name}`,recovery:false}));
  return {saved,manifest};
}

test("Migration52 populated51 upgrade preserves historical rows, NULL pins and closed predecessor ACLs",async()=>{
  const f=await setup(examples.fantasy,"en",51);
  try {
    await f.create();await f.startOpening();
    const tables=(await f.query("select schemaname||'.'||tablename name from pg_tables where (schemaname='public' and tablename like 'rpg_%') or schemaname='rpg_private' order by 1")).map(x=>x.name);
    const fingerprint=async()=>{
      const result={};
      for(const table of tables){
        const omitted=table==="rpg_private.turns"?["astra_natural_contract","astra_natural_state"]:
          table==="public.rpg_scenes"?["public_continuity"]:table==="public.rpg_storages"?["location_id","locale_key"]:[];
        result[table]=(await f.one(`select coalesce(jsonb_agg(rowdata order by rowdata::text),'[]') rows from
          (select to_jsonb(x)-$1::text[] rowdata from ${table} x) normalized`,[omitted])).rows;
      }
      return result;
    };
    const before=await fingerprint();
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610140052_astra_natural_play.sql",import.meta.url),"utf8"));
    assert.deepEqual(await fingerprint(),before);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.turns where astra_natural_contract is not null or astra_natural_state is not null")).n,0);
    for(const role of ["anon","authenticated","service_role"]){
      assert.equal((await f.one("select has_function_privilege($1,'public.rpg_runtime_before_natural_play(uuid,uuid,text,jsonb,jsonb)','EXECUTE') ok",[role])).ok,false);
      assert.equal((await f.one("select has_function_privilege($1,'rpg_private.astra_natural_materialization(rpg_private.turns,jsonb,integer)','EXECUTE') ok",[role])).ok,false);
    }
    assert.equal((await f.one("select has_function_privilege('service_role','public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') ok")).ok,true);
    assert.ok((await f.runtime(f.cid,"play")).revision>0,"new wrapper delegates existing runtime");
  }finally{await f.db.close();}
});

test("private promotion receipts are append-only/replay-safe and failed precommit leaves public state and original source intact",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const {store,input,claim}=await claimNatural(h),before=await h.snapshot(),original=await pins(h.f,input.operationId);
    const receipt=await store.recordAstraMaterialization(claim.lease,0,stick);
    assert.deepEqual(await store.recordAstraMaterialization(claim.lease,0,stick),receipt);
    await assert.rejects(store.recordAstraMaterialization(claim.lease,0,{...stick,subjectRef:"input:stone"}),{code:"conflict"});
    await assert.rejects(store.recordAstraMaterialization({...claim.lease,token:randomUUID()},1,stick),{code:"validation"});
    assert.equal(await countStick(h.f),0);
    assert.deepEqual(await h.snapshot(),before);
    assert.deepEqual((await pins(h.f,input.operationId)).source,original.source);
    await store.fail(claim.lease,"provider",true);
    assert.equal(await countStick(h.f),0);
    assert.deepEqual(await h.snapshot(),before);
    assert.equal((await pins(h.f,input.operationId)).astra_natural_state.materializations.length,1);
  }finally{await h.f.db.close();}
});

test("two fresh input-name acquisitions create separate Items while exact committed replay creates none",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    let calls=0;
    const provider={next:async(_c,_i,_r,_k,_p,s)=>{calls++;return finalDecision(s,"You pick up the ordinary stick.",{materializations:[stick]});},narrate:noNarrator};
    const first=await h.turn("I pick up a stick.",provider);assert.equal(first.result.status,"committed",JSON.stringify(h.errors));
    const firstPin=await pins(h.f,first.input.operationId);
    assert.deepEqual(firstPin.source.astraNaturalOrigins,[]);
    const replay=await runAstraTurn(first.input,first.deps);assert.equal(replay.status,"committed");assert.equal(calls,1);
    const second=await h.turn("I pick up a stick.",provider);assert.equal(second.result.status,"committed",JSON.stringify(h.errors));
    assert.equal(await countStick(h.f),2);assert.equal(calls,2);
    assert.notEqual(firstPin.astra_natural_state.materializations[0].recordId,
      (await pins(h.f,second.input.operationId)).astra_natural_state.materializations[0].recordId);
    const scene=await h.f.one("select revision,public_continuity from public.rpg_scenes where id=(select current_scene_id from public.rpg_public_state where campaign_id=$1)",[h.f.cid]);
    assert.equal(scene.revision,1);assert.equal(scene.public_continuity.parentLocationId,h.home);
  }finally{await h.f.db.close();}
});

test("trusted save/load rebinds only the restored pending natural source hash without rewriting its immutable manifest",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const {store,input,claim}=await claimNatural(h);
    const receipt=await store.recordAstraMaterialization(claim.lease,0,stick);
    const before=await pins(h.f,input.operationId);
    const {saved,manifest}=await saveLoad(h.f,"Pending natural receipt");
    const after=await pins(h.f,input.operationId);
    assert.notEqual(after.source_hash,before.source_hash);
    assert.equal(after.astra_natural_state.sourceHash,after.source_hash);
    assert.deepEqual(after.astra_natural_state.materializations,before.astra_natural_state.materializations);
    assert.deepEqual((await h.f.one("select refs from rpg_private.timeline_manifests where id=(select manifest_id from rpg_private.save_points where id=$1)",[saved.id])).refs,manifest.refs);
    const rebound=await activeStore(h),current=await rebound.claim(h.f.cid,input.operationId);
    assert.deepEqual(await rebound.recordAstraMaterialization(current.lease,0,stick),receipt);
    await assert.rejects(store.recordAstraMaterialization(claim.lease,0,stick),{code:"conflict"});
    assert.equal(await countStick(h.f),0);
  }finally{await h.f.db.close();}
});

test("forged natural source fails its original hash guard and cannot insert public records",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const {store,input,claim}=await claimNatural(h),before=await h.snapshot();
    await h.f.one("update rpg_private.turns set source=jsonb_set(source,'{runtime,worldMinutes}','9999') where id=$1",[input.operationId]);
    await assert.rejects(store.recordAstraMaterialization(claim.lease,0,stick),{code:"validation"});
    assert.equal(await countStick(h.f),0);assert.deepEqual(await h.snapshot(),before);
  }finally{await h.f.db.close();}
});

test("existing NULL natural operations keep legacy routing and cannot adopt a new pin on retry",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const {store,input,claim}=await claimNatural(h,"I listen.",false);
    assert.equal(await store.astraNaturalContract(h.f.cid,input.operationId),"legacy-natural");
    assert.equal(await store.astraNaturalContract(h.f.cid,randomUUID()),null);
    await store.fail(claim.lease,"provider",true);
    await assert.rejects(store.begin(input,"astra-primary-v1","unified-v1","natural-v1"),{code:"conflict"});
    assert.equal((await pins(h.f,input.operationId)).astra_natural_state,null);
  }finally{await h.f.db.close();}
});

test("pinned final survives save/load then retry commits once without another planner or duplicate acquisition",async()=>{
  const h=await naturalFixture({npcKind:"npc"});
  try {
    const model={schemaVersion:1,actorId:h.npc,basisOperationId:null,
      identity:{values:[],wants:[],boundaries:[],loyalties:[],signatures:[],observableVoice:"Measured ordinary speech"},
      current:{goal:"Nera privately worries about the ordinary stick.",stress:"settled",preoccupation:null,obligation:null},
      beliefs:[],relationships:[],episodes:[]};
    await h.f.one("update rpg_private.dm_state set contents=contents||jsonb_build_object('npc',jsonb_build_object($2::text,$3::text)) where campaign_id=$1",[h.f.cid,`character_${h.npc}`,JSON.stringify(model)]);
    let plans=0,narrations=0;
    const provider={next:async(_c,_i,_r,_k,_p,s)=>{plans++;assert.equal(s.astraResponseMode,"private-informed");return finalDecision(s,"",{materializations:[stick]});},
      narrate:async()=>{narrations++;if(narrations===1)throw new DmError("provider",true);
        return {usage:fakeUsage,output:{narration:"You pick up the ordinary stick.",visualDescription:"",clarification:null,continuity:{locale:null,subjects:[]}}};}};
    const failed=await h.turn("Nera watches while I pick up an ordinary stick.",provider);
    assert.equal(failed.result.status,"failed",JSON.stringify(h.errors));assert.equal(failed.result.canRetry,true);
    const before=await pins(h.f,failed.input.operationId);assert.ok(before.checkpoint.astraPrimary.finalProposal);
    assert.equal(await countStick(h.f),0);
    await saveLoad(h.f,"Pinned natural final");
    const store=await activeStore(h),timeline=await h.f.fence(h.f.cid);
    const memory=createRpcMemoryStore(h.f.owner,async a=>({data:await h.f.memory(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)}),timeline);
    const result=await resumeAstraTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:failed.input.operationId,
      timeline,action:"retry",checkId:null},{...failed.deps,store,memory});
    assert.equal(result.status,"committed",JSON.stringify({errors:h.errors,failure:result.failure}));
    assert.equal(plans,1);assert.equal(narrations,2);assert.equal(await countStick(h.f),1);
    const final=await pins(h.f,failed.input.operationId);
    assert.equal(final.source_hash,final.astra_natural_state.sourceHash,"temporary virtual source never becomes durable claim source");
  }finally{await h.f.db.close();}
});

test("pending natural combat tool survives save/load with real recorded dice and no early target/encounter rows",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const setting=await h.f.one("select values,revision from public.rpg_settings where campaign_id=$1",[h.f.cid]);
    setting.values.interactiveDice=true;
    await h.f.mutation("settings.save",h.f.cid,setting.values,setting.revision);
    const store=await activeStore(h),play=await store.readPlay(h.f.cid);
    const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision,
      mode:"game",input:"I attack the rat.",companionId:null,listenerIds:[],mechanic:null};
    let calls=0;
    const provider={next:async(_c,_i,receipts,_k,_p,s)=>{
      calls++;
      if(!receipts.length)return {usage:fakeUsage,output:{type:"tool",final:null,
        materializations:[{subjectRef:"input:rat",kind:"creature",purpose:"combat",ownerRef:null}],
        call:{kind:"attack",actorId:h.hero,targetId:"input:rat",itemId:null,dc:null,scope:null}}};
      const participant=s.runtime.participants.find(x=>x.entity_id===h.hero&&x.public_resources.active);
      return finalDecision(s,"You strike at the ordinary rat.",{changes:[{
        family:"encounter_participants",id:participant.id,expectedRevision:null,values:{
          public_position:{...participant.public_position},public_resources:{...participant.public_resources,
            action:Number(participant.public_resources.action)-1,move:Number(participant.public_resources.move),
            withdrawn:participant.public_resources.withdrawn===true}}}]});
    },narrate:noNarrator};
    const deps={store,memory:h.memory,summaries:h.summaryProvider,provider,random:(_min,max)=>max===21?18:3};
    const pending=await runAstraTurn(input,deps);
    assert.equal(pending.status,"awaiting_confirmation",JSON.stringify(h.errors));assert.equal(calls,1);
    const before=await pins(h.f,input.operationId);
    assert.equal(before.checkpoint.checks.length,1);assert.equal(before.checkpoint.astraPrimary.toolReceipts.length,1);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_entities where campaign_id=$1 and name='rat'",[h.f.cid])).n,0);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_encounters where campaign_id=$1",[h.f.cid])).n,0);
    await saveLoad(h.f,"Pending natural attack");
    const after=await pins(h.f,input.operationId);
    assert.deepEqual(after.checkpoint,before.checkpoint);
    assert.equal(after.astra_natural_state.sourceHash,after.source_hash);
    const currentStore=await activeStore(h),timeline=await h.f.fence(h.f.cid);
    const memory=createRpcMemoryStore(h.f.owner,async a=>({data:await h.f.memory(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)}),timeline);
    const done=await resumeAstraTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
      timeline,action:"continue",checkId:null},{...deps,store:currentStore,memory});
    assert.equal(done.status,"committed",JSON.stringify({failure:done.failure,errors:h.errors}));assert.equal(calls,2);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_entities where campaign_id=$1 and name='rat'",[h.f.cid])).n,1);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_encounters where campaign_id=$1 and status='active'",[h.f.cid])).n,1);
    assert.equal((await pins(h.f,input.operationId)).source.astraNaturalState,undefined,"virtual source state is never persisted into original claim");
  }finally{await h.f.db.close();}
});

test("pre/post promotion saves fork into their own standard rows and private materialization authority",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const pre=await h.f.saves(h.f.cid,"create",await h.f.command(h.f.cid,{kind:"manual",name:"Before promotion"}));
    const preSave=pre.snapshot.saves.find(x=>x.name==="Before promotion");
    const result=await h.turn("I pick up a stick.",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"You pick up the ordinary stick.",{materializations:[stick]}),narrate:noNarrator});
    assert.equal(result.result.status,"committed",JSON.stringify(h.errors));
    const post=await h.f.saves(h.f.cid,"create",await h.f.command(h.f.cid,{kind:"manual",name:"After promotion"}));
    const postSave=post.snapshot.saves.find(x=>x.name==="After promotion");
    const postTimeline=(await h.f.fence(h.f.cid)).timelineId;
    await h.f.saves(h.f.cid,"load",await h.f.command(h.f.cid,{saveId:preSave.id,label:"Before fork",recovery:false}));
    const beforeFork=(await h.f.fence(h.f.cid)).timelineId;
    assert.notEqual(beforeFork,postTimeline);assert.equal(await countStick(h.f),0);
    assert.equal((await h.f.one("select count(*)::integer n from rpg_private.turns where campaign_id=$1 and astra_natural_contract='natural-v1'",[h.f.cid])).n,0);
    await h.f.saves(h.f.cid,"load",await h.f.command(h.f.cid,{saveId:postSave.id,label:"After fork",recovery:false}));
    const afterFork=(await h.f.fence(h.f.cid)).timelineId;
    assert.notEqual(afterFork,beforeFork);assert.equal(await countStick(h.f),1);
    assert.equal((await pins(h.f,result.input.operationId)).status,"committed");
    await h.f.saves(h.f.cid,"switch",await h.f.command(h.f.cid,{timelineId:beforeFork,recovery:false}));
    assert.equal(await countStick(h.f),0);
    await h.f.saves(h.f.cid,"switch",await h.f.command(h.f.cid,{timelineId:afterFork,recovery:false}));
    assert.equal(await countStick(h.f),1);
  }finally{await h.f.db.close();}
});

test("natural attack permits a live inactive target only; actor-active/withdrawn and legacy target guards remain authoritative",async(t)=>{
  for(const variant of ["natural target","inactive actor","withdrawn target","legacy target"])await t.test(variant,async()=>{
    const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
    try {
      const opened=await h.turn("We begin an ordinary sparring encounter.",{
        next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"You take sparring positions.",{
          effects:[{kind:"mechanic_actions",actions:[{kind:"encounter.start",participantIds:[h.hero,h.npc]}],restSafety:null}]}),
        narrate:noNarrator});
      assert.equal(opened.result.status,"committed",JSON.stringify(h.errors));
      if(variant==="inactive actor")await h.f.one("update public.rpg_encounter_participants set public_resources=jsonb_set(public_resources,'{active}',to_jsonb(entity_id<>$2::uuid)) where campaign_id=$1",[h.f.cid,h.hero]);
      if(variant==="withdrawn target")await h.f.one("update public.rpg_encounter_participants set public_resources=jsonb_set(public_resources,'{withdrawn}','true') where campaign_id=$1 and entity_id=$2",[h.f.cid,h.npc]);
      const {store,input,claim}=await claimNatural(h,"I attack Nera.",variant!=="legacy target");
      const source=structuredClone(claim.source);source.astraNaturalContract="natural-v1";
      // Construct a syntactically valid check against an ordinary legal
      // projection, then prove SQL rejects it when real actor/target state is
      // ineligible. The authority cannot be bypassed by supplying the result.
      for(const row of source.runtime.participants){
        if(row.entity_id===h.hero)row.public_resources.active=true;
        if(row.entity_id===h.npc){row.public_resources.active=false;row.public_resources.withdrawn=false;}
      }
      const call={kind:"attack",actorId:h.hero,targetId:h.npc,itemId:null,dc:null,scope:null};
      const check=astraToolResult(source,input,call,[],[],undefined,(_min,max)=>max===21?18:3);
      const before=await h.snapshot();
      if(variant==="natural target"){
        const receipt=await store.recordAstraTool(claim.lease,0,call,check).catch(e=>assert.fail(JSON.stringify(h.errors)||e.message));
        assert.equal(receipt.result.success,true);
      }else await assert.rejects(store.recordAstraTool(claim.lease,0,call,check),{code:"validation"});
      assert.deepEqual(await h.snapshot(),before,"tool validation never damages or spends state before final commit");
    }finally{await h.f.db.close();}
  });
});

test("direct console-basic Astra keeps existing unified semantics without requiring takeover/Foundation promotion authority",async()=>{
  const f=await databaseFixture(52);
  try {
    const w=await basicWorld(f),timeline=await f.fence(w.cid),errors=[];
    const rpc=async a=>{try{return {data:await f.runtime(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)};}
      catch(e){errors.push({action:a.p_action,message:e.message,where:e.where});return {error:{message:e.message,code:e.code}};}};
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true,{astraResponseContract:"unified-v1",astraNaturalContract:"natural-v1"});
    const memory=createRpcMemoryStore(f.owner,async a=>({data:await f.memory(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)}),timeline);
    const play=await store.readPlay(w.cid),input={operationId:randomUUID(),campaignId:w.cid,timeline,expectedRevision:play.revision,
      mode:"game",input:"I watch the ordinary bridge.",companionId:null,listenerIds:[],mechanic:null};
    assert.equal(await store.astraNaturalContract(w.cid,input.operationId),"legacy-natural");
    await assert.rejects(store.begin(input,"astra-primary-v1","unified-v1","natural-v1"),{code:"validation"});
    const done=await runAstraTurn(input,{store,memory,summaries:{summarize:async()=>assert.fail("no summary")},
      provider:{next:async(_c,_i,_r,_k,_p,s)=>simplifiedDecision(s,"The ordinary bridge remains quiet."),narrate:noNarrator}});
    assert.equal(done.status,"committed",JSON.stringify({errors,failure:done.failure}));
    const row=await f.one("select astra_natural_contract,astra_natural_state,astra_response_contract from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(row.astra_natural_contract,null);assert.equal(row.astra_natural_state,null);assert.equal(row.astra_response_contract,"unified-v1");
    assert.equal((await f.one("select count(*)::integer n from rpg_private.world_foundations where campaign_id=$1",[w.cid])).n,0);
  }finally{await f.db.close();}
});

test("ground storage preserves its real parent FK across save/load restoration order",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const acquired=await h.turn("I pick up a stick.",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"You pick up the stick.",{materializations:[stick]}),narrate:noNarrator});
    const item=(await pins(h.f,acquired.input.operationId)).astra_natural_state.materializations[0].recordId;
    const dropped=await h.turn("I drop the stick here.",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"You set down the stick.",{
      effects:[{kind:"item_relocate",actorId:h.hero,itemId:item,quantity:1,destinationEntityId:null}]}),narrate:noNarrator});
    assert.equal(dropped.result.status,"committed",JSON.stringify(h.errors));
    const before=await h.snapshot();await saveLoad(h.f,"Dropped item anchor");assert.deepEqual(await h.snapshot(),before);
    const storage=await h.f.one("select s.kind,s.location_id from public.rpg_storages s join public.rpg_items i on i.storage_id=s.id where i.id=$1",[item]);
    assert.deepEqual(storage,{kind:"ground",location_id:h.home});
    assert.equal((await h.f.one("select condeferrable and condeferred ok from pg_constraint where conname='rpg_storage_ground_location'")).ok,true);
    await assert.rejects(h.f.one("update public.rpg_storages set location_id=$2 where id=(select storage_id from public.rpg_items where id=$1)",[item,randomUUID()]),e=>e.code==="23503");
  }finally{await h.f.db.close();}
});

test("pre/post natural Location saves form coherent detached World Lab snapshots without changing frozen World rows",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const f=h.f;
    const frozen=await f.one("select to_jsonb(w) row from rpg_private.world_foundations w where campaign_id=$1",[f.cid]);
    const events=await f.query("select to_jsonb(e) row from rpg_private.world_events e where campaign_id=$1 order by sequence",[f.cid]);
    const pre=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Before new place"}));
    const preSave=pre.snapshot.saves.find(x=>x.name==="Before new place");
    const moved=await h.turn("I walk to the mill.",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"You arrive at the ordinary mill.",{
      materializations:[{subjectRef:"input:mill",kind:"place",purpose:"track",ownerRef:null}],
      effects:[{kind:"mechanic_actions",actions:[{kind:"location.move",locationId:"input:mill"}],restSafety:null}]}),narrate:noNarrator});
    assert.equal(moved.result.status,"committed",JSON.stringify({errors:h.errors,failure:moved.result.failure}));
    const destination=(await pins(f,moved.input.operationId)).astra_natural_state.materializations[0].recordId;
    assert.equal((await h.snapshot()).state.location,destination);
    const scene=await f.one("select revision,public_continuity from public.rpg_scenes where id=(select current_scene_id from public.rpg_public_state where campaign_id=$1)",[f.cid]);
    assert.equal(scene.revision,1);assert.equal(scene.public_continuity.parentLocationId,destination,"original Scene INSERT uses validated travel after-state parent");
    const post=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"At new place"}));
    const postSave=post.snapshot.saves.find(x=>x.name==="At new place");
    const approval={ownerId:f.owner,reviewedConflictIds:[],reviewedUnknownIds:[]};
    const record=(kind,body)=>({schemaVersion:1,ownerId:f.owner,kind,id:randomUUID(),versionId:randomUUID(),version:1,previousVersionId:null,body});
    const scenario=record("scenario",{schemaVersion:1,title:"Detached natural place",status:"approved",packVersionIds:[],
      sourceVersionIds:[],sourcePriority:[],entry:{label:"Saved moment",worldMinutes:0,evidence:[]},adaptation:"original",identities:[],
      assumptions:[{id:randomUUID(),text:"Observe a quiet possible future.",visibility:"public"}],carriedClaimIds:[],localHistory:null,unresolvedConflictIds:[],approval});
    const divergence=record("divergence",{schemaVersion:1,scenarioVersionId:scenario.versionId,title:"Quiet future",
      changes:[{id:randomUUID(),text:"Time passes in the detached world.",visibility:"public"}],approval});
    for(const row of [scenario,divergence])await f.one("select public.rpg_library($1,null,'put',$2::jsonb,null) result",[f.owner,JSON.stringify({operationId:randomUUID(),record:row})]);
    const lab=createLabService(f.owner,async a=>{
      try{return {data:(await f.one("select public.rpg_world_lab($1,$2,$3,$4::jsonb) result",[a.p_owner_id,a.p_campaign_id,a.p_action,JSON.stringify(a.p_payload)])).result};}
      catch(e){return {error:{message:e.message,code:e.code}};}
    },"en",{resolver:()=>({simulate:async()=>assert.fail("quiet detached snapshot does not need a model")})});
    for(const [save,location] of [[preSave,h.home],[postSave,destination]]){
      let run=await lab.perform({action:"prepare",input:{operationId:randomUUID(),campaignId:f.cid,saveId:save.id,
        scenarioVersionId:scenario.versionId,divergenceVersionId:divergence.versionId,label:"Saved natural location",horizonMinutes:60}});
      for(let i=0;i<4&&run.status!=="completed";i++)run=await lab.perform({action:"continue",input:{operationId:randomUUID(),campaignId:f.cid,runId:run.id,expectedRevision:run.revision}});
      assert.equal(run.status,"completed",`${run.status}/${run.reason}`);
      const manifest=(await f.one("select head_manifest_id id from rpg_private.timelines where id=$1",[run.timelineId])).id;
      const world=(await f.one("select rpg_private.lab_rows($1,$2,'rpg_private.world_foundations') rows",[f.cid,manifest])).rows[0].world;
      assert.equal(parseWorldState(world,f.cid).actors.find(x=>x.entityId===h.hero).locationId,location);
      const locations=(await f.one("select rpg_private.lab_rows($1,$2,'public.rpg_locations') rows",[f.cid,manifest])).rows;
      assert.ok(locations.some(x=>x.id===location));
      assert.deepEqual((await f.one("select rpg_private.lab_rows($1,$2,'public.rpg_locations') rows",[randomUUID(),manifest])).rows,[],"a different campaign cannot read these saved Location records");
      assert.equal(Object.hasOwn(world,"locations"),false,"World Foundation uses saved standard Location authority, never a duplicate catalog");
    }
    assert.deepEqual(await f.one("select to_jsonb(w) row from rpg_private.world_foundations w where campaign_id=$1",[f.cid]),frozen);
    assert.deepEqual(await f.query("select to_jsonb(e) row from rpg_private.world_events e where campaign_id=$1 order by sequence",[f.cid]),events);
  }finally{await h.f.db.close();}
});

test("a scene NPC introduction changes only its bounded public label while retaining exact identity/provenance",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const entities=await h.f.query("select to_jsonb(e) row from public.rpg_entities e where campaign_id=$1 order by id",[h.f.cid]);
    const capsule=async()=>(await h.f.one("select public_continuity from public.rpg_scenes where id=(select current_scene_id from public.rpg_public_state where campaign_id=$1)",[h.f.cid])).public_continuity;
    const first=await h.turn("I meet a miller.",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"An ordinary miller greets you.",{
      continuity:{locale:null,subjects:[{subjectRef:null,kind:"npc",name:"miller",description:"An ordinary local miller."}]}}),narrate:noNarrator});
    assert.equal(first.result.status,"committed",JSON.stringify(h.errors));const original=(await capsule()).subjects[0];
    const named=await h.turn("What is your name?",{next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"Hobb introduces himself.",{
      continuity:{locale:null,subjects:[{subjectRef:original.id,kind:"npc",name:"Hobb",description:"Hobb is the local miller who just introduced himself."}]}}),narrate:noNarrator});
    assert.equal(named.result.status,"committed",JSON.stringify(h.errors));
    assert.deepEqual((await capsule()).subjects[0],{...original,name:"Hobb",description:"Hobb is the local miller who just introduced himself."});
    assert.deepEqual(await h.f.query("select to_jsonb(e) row from public.rpg_entities e where campaign_id=$1 order by id",[h.f.cid]),entities);
  }finally{await h.f.db.close();}
});

async function makeCheckpointFault(f,phase){
  await f.db.exec(`create function rpg_private.synthetic_natural_checkpoint_fault() returns trigger language plpgsql as $$
    begin
      if new.checkpoint is distinct from old.checkpoint and
        ((current_setting('rpg.test_checkpoint_fault',true)='final' and
          nullif(old.checkpoint#>'{astraPrimary,finalProposal}','null'::jsonb) is null and
          nullif(new.checkpoint#>'{astraPrimary,finalProposal}','null'::jsonb) is not null) or
         (current_setting('rpg.test_checkpoint_fault',true)='narration' and
          nullif(old.checkpoint->'narration','null'::jsonb) is null and
          nullif(new.checkpoint->'narration','null'::jsonb) is not null)) then
        raise exception 'synthetic checkpoint transport failure' using errcode='08006';
      end if;
      return new;
    end $$;
    create trigger synthetic_natural_checkpoint_fault before update on rpg_private.turns
      for each row execute function rpg_private.synthetic_natural_checkpoint_fault();`);
  await f.one("select set_config('rpg.test_checkpoint_fault',$1,false)",[phase]);
}
async function recoveryFixture(privateInformed){
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  if(privateInformed){
    const model={schemaVersion:1,actorId:h.npc,basisOperationId:null,
      identity:{values:[],wants:[],boundaries:[],loyalties:[],signatures:[],observableVoice:"Measured ordinary speech"},
      current:{goal:"Nera privately worries about the ordinary stick.",stress:"settled",preoccupation:null,obligation:null},
      beliefs:[],relationships:[],episodes:[]};
    await h.f.one("update rpg_private.dm_state set contents=contents||jsonb_build_object('npc',jsonb_build_object($2::text,$3::text)) where campaign_id=$1",[h.f.cid,`character_${h.npc}`,JSON.stringify(model)]);
  }
  return h;
}
function recoveryProvider(privateInformed){
  const calls={planner:0,narrator:0};
  const continuity=(attempt)=>({locale:null,subjects:[{subjectRef:null,kind:"npc",name:attempt===1?"miller":"Hobb",description:"An ordinary local miller."}]});
  return {calls,provider:{
    next:async(_c,_i,_r,_k,_p,s)=>{
      calls.planner++;assert.equal(s.astraResponseMode,privateInformed?"private-informed":"public-unified");
      return finalDecision(s,"An ordinary miller greets you.",{
        materializations:s.astraNaturalState.materializations.length?[]:[stick],
        ...(!privateInformed?{continuity:continuity(calls.planner)}:{})});
    },
    narrate:async()=>{
      assert.equal(privateInformed,true);calls.narrator++;
      return {usage:fakeUsage,output:{narration:"An ordinary miller greets you.",visualDescription:"",clarification:null,continuity:continuity(calls.narrator)}};
    },
  }};
}
async function recoveryInput(h,store){
  const p=await store.readPlay(h.f.cid);
  return {operationId:randomUUID(),campaignId:h.f.cid,timeline:p.timeline,expectedRevision:p.revision,
    mode:"game",input:"Nera watches while I pick up an ordinary stick and greet a miller.",companionId:null,listenerIds:[],mechanic:null};
}

test("atomic publication/checkpoint rollback permits valid different continuity on final and narration retry",async(t)=>{
  for(const phase of ["final","narration"])await t.test(phase,async()=>{
    const privateInformed=phase==="narration",h=await recoveryFixture(privateInformed);
    try{
      await makeCheckpointFault(h.f,phase);
      const store=await activeStore(h),input=await recoveryInput(h,store),before=await h.snapshot();
      const {calls,provider}=recoveryProvider(privateInformed);
      const deps={store,memory:h.memory,summaries:h.summaryProvider,provider};
      const failed=await runAstraTurn(input,deps);
      assert.equal(failed.status,"failed",JSON.stringify(h.errors));assert.equal(failed.failure,"unavailable");assert.equal(failed.canRetry,true);
      const pinned=await pins(h.f,input.operationId);
      assert.deepEqual(await h.snapshot(),before,"failed checkpoint applies no public rows/mechanics");
      assert.equal(await countStick(h.f),0);
      if(privateInformed){
        assert.ok(pinned.checkpoint.astraPrimary.finalProposal);
        assert.equal(pinned.astra_natural_state.publication.continuity,null);
      }else{
        assert.equal(pinned.checkpoint.astraPrimary.finalProposal,null);
        assert.equal(pinned.astra_natural_state.publication,undefined);
        assert.equal(pinned.astra_natural_state.effectiveRecordIds,undefined,"publication authority cannot be stranded without final checkpoint");
      }
      assert.equal(pinned.checkpoint.narration,null);
      await h.f.one("select set_config('rpg.test_checkpoint_fault','',false)");
      const retried=await resumeAstraTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
        timeline:input.timeline,action:"retry",checkId:null},deps);
      assert.equal(retried.status,"committed",JSON.stringify({errors:h.errors,failure:retried.failure}));
      assert.equal(await countStick(h.f),1);
      assert.deepEqual(calls,privateInformed?{planner:1,narrator:2}:{planner:2,narrator:0});
      const done=await pins(h.f,input.operationId);
      assert.equal(done.astra_natural_state.publication.continuity.subjects[0].name,"Hobb","rolled-back unpublished label never locks a later valid response");
    }finally{await h.f.db.close();}
  });
});

test("uncertain successful atomic final/narration checkpoint response reuses both pins with zero additional provider dispatch",async(t)=>{
  for(const phase of ["final","narration"])await t.test(phase,async()=>{
    const privateInformed=phase==="narration",h=await recoveryFixture(privateInformed);
    try{
      const store=await activeStore(h),input=await recoveryInput(h,store),raw=store.checkpoint.bind(store);
      let loseResponse=true;
      store.checkpoint=async(...args)=>{
        const result=await raw(...args);
        if(loseResponse&&args[3]&&(!privateInformed||args[1].narration)){
          loseResponse=false;throw new DmError("unavailable",true);
        }
        return result;
      };
      const {calls,provider}=recoveryProvider(privateInformed),deps={store,memory:h.memory,summaries:h.summaryProvider,provider};
      const failed=await runAstraTurn(input,deps);
      assert.equal(failed.status,"failed",JSON.stringify(h.errors));assert.equal(failed.failure,"unavailable");assert.equal(failed.canRetry,true);
      const pinned=await pins(h.f,input.operationId);
      assert.ok(pinned.checkpoint.astraPrimary.finalProposal);assert.ok(pinned.checkpoint.narration);
      assert.ok(pinned.astra_natural_state.publication.continuity);assert.equal(await countStick(h.f),0);
      const before={...calls};
      const retried=await resumeAstraTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
        timeline:input.timeline,action:"retry",checkId:null},deps);
      assert.equal(retried.status,"committed",JSON.stringify({errors:h.errors,failure:retried.failure}));
      assert.deepEqual(calls,before);assert.equal(await countStick(h.f),1);
      assert.equal((await runAstraTurn(input,deps)).status,"committed");assert.deepEqual(calls,before);assert.equal(await countStick(h.f),1);
    }finally{await h.f.db.close();}
  });
});
