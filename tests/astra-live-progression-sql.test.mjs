import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

test("disposable migration chain through 46 preserves the bounded private authority", async () => {
  const f = await fixture(46);
  try {
    assert.ok((await f.one(`select to_regprocedure(
      'rpg_private.astra_progression_after(uuid,uuid,jsonb,jsonb,jsonb)') fn`)).fn);
    assert.equal((await f.one(`select has_function_privilege('authenticated',
      'rpg_private.astra_progression_after(uuid,uuid,jsonb,jsonb,jsonb)',
      'EXECUTE') allowed`)).allowed, false);
  } finally { await f.db.close(); }
});

test("populated migration 45 to 46 preserves existing campaign rows and old save",async()=>{
  const f=await fixture(45);
  try {
    const campaign=await world(f);
    const saved=await f.saves(campaign.cid,"create",await f.command(campaign.cid,
      {kind:"manual",name:"Before progression migration"}));
    const save=saved.snapshot.saves.find((row)=>row.name==="Before progression migration");
    assert.ok(save);
    const before=await f.one(`select
      (select jsonb_agg(to_jsonb(c) order by c.id) from public.rpg_campaigns c) campaigns,
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id)
        from rpg_private.world_foundations w) world,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.turns t) turns,
      (select jsonb_agg(to_jsonb(s) order by s.id) from rpg_private.save_points s) saves`);
    const manifest=await f.one(`select m.refs from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id
      where s.id=$1`,[save.id]);
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610060046_astra_live_progression.sql",import.meta.url),"utf8"));
    const after=await f.one(`select
      (select jsonb_agg(to_jsonb(c) order by c.id) from public.rpg_campaigns c) campaigns,
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id)
        from rpg_private.world_foundations w) world,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.turns t) turns,
      (select jsonb_agg(to_jsonb(s) order by s.id) from rpg_private.save_points s) saves`);
    assert.deepEqual(after,before);
    assert.deepEqual((await f.one(`select m.refs from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id
      where s.id=$1`,[save.id])).refs,manifest.refs);
    const restored=await f.saves(campaign.cid,"load",await f.command(campaign.cid,
      {saveId:save.id,label:"Old progression save",recovery:false}));
    assert.ok(restored.timelineId);
  } finally {await f.db.close();}
});

async function takenOverProgression() {
  const f = await setup(undefined,"en",46);
  await f.create();
  await f.startOpening();
  const foundation = await f.one(`select world,loop_state from
    rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
  const hero = foundation.world.actors.find((a)=>a.control==="player").entityId;
  const track = {id:"fieldcraft",version:1,label:"Fieldcraft",kind:"generic",
    thresholds:[5],choices:[
      {id:"trail",label:"Trail reading",capability:"trail-reading"},
      {id:"ward",label:"Watchful",capability:"watchful"}]};
  const state = {...foundation.loop_state,progression:"on",tracks:[track],
    progress:[{entityId:hero,trackId:track.id,value:2,rank:0,unlocks:[]}],
    pending:[],version:foundation.loop_state.version+1};
  await f.one(`update rpg_private.world_foundations set loop_state=$2::jsonb,
    revision=revision+1 where campaign_id=$1`,[f.cid,JSON.stringify(state)]);
  const config = {profile:"console-basic-v1",controlledEntityIds:[hero],
    presentEntityIds:foundation.world.actors.map((a)=>a.entityId),
    nearbyStorageIds:[],safeLocationIds:[],itemRules:[]};
  const play = await f.runtime(f.cid,"play");
  await f.runtime(f.cid,"configure",{requestId:randomUUID(),campaignId:f.cid,
    expectedRevision:play.revision,configuration:config});
  const timeline = await f.fence(f.cid);
  const row = await f.one(`select r.revision runtime_revision,
    p.revision public_revision,w.revision world_revision,
    encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
    t.head_manifest_id head_id,
    (select coalesce(max(sequence),0) from rpg_private.world_events
     where campaign_id=r.campaign_id) world_event_sequence
    from rpg_private.runtime_state r
    join public.rpg_public_state p using(campaign_id)
    join rpg_private.world_foundations w using(campaign_id)
    join rpg_private.timeline_campaigns c using(campaign_id)
    join rpg_private.timelines t on t.id=c.active_timeline_id
    where r.campaign_id=$1`,[f.cid]);
  await f.runtime(f.cid,"astra_takeover",{requestId:randomUUID(),campaignId:f.cid,
    timeline,expectedRuntimeRevision:row.runtime_revision,
    expectedWorldRevision:row.world_revision,
    expectedPublicRevision:row.public_revision,expectedHeadId:row.head_id,
    expectedWorldDigest:row.world_digest,
    expectedWorldEventSequence:row.world_event_sequence});
  const errors=[];
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {errors.push({action:args.p_action,message:error.message});
      return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try {return {data:await f.memory(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  return {f,hero,track,errors,rpc,memoryRpc};
}

test("committed Astra award is exact-once, saved, and player choice changes only mechanics", async()=>{
  const {f,hero,track,errors,rpc,memoryRpc}=await takenOverProgression();
  try {
    await f.one(`update rpg_private.timeline_campaigns set
      policy=jsonb_set(policy,'{autosave}','"turn"'::jsonb)
      where campaign_id=$1`,[f.cid]);
    const before=await f.one(`select world,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    async function award(amount) {
      const fence=await f.fence(f.cid);
      const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
      const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
      const play=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:"I earn fieldcraft progress.",
        companionId:null,listenerIds:[],mechanic:null};
      const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
      const provider={next:async(_ctx,_input,_receipts,_checks,_caps,source)=>({
        usage,output:{type:"final",call:null,final:{
          worldMinutes:source.runtime.worldMinutes,changes:[],outcomes:[],
          privatePatches:[],settlement:{kind:"progression_award",
            recipientId:hero,trackId:track.id,amount}}}}),
        narrate:async()=>({usage,output:{narration:"Practice pays off.",
          visualDescription:"",clarification:null}})};
      const result=await runAstraTurn(input,{store,memory,provider,
        summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
          selections:job.sources.map((s)=>({sourceId:s.id,version:s.ref.version}))}})}});
      assert.equal(result.status,"committed",JSON.stringify(errors));
      return {input,result};
    }
    const first=await award(1);
    assert.equal((await f.one(`select loop_state#>>'{progress,0,value}' value
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid])).value,"3");
    assert.equal((await f.one(`select jsonb_array_length(loop_state->'pending') n
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid])).n,0);
    const crossed=await award(2);
    const afterAward=await f.one(`select loop_state,world from
      rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.equal(afterAward.loop_state.progress[0].value,5);
    assert.equal(afterAward.loop_state.pending.length,1);
    const event=(await f.one(`select payload from rpg_private.runtime_events
      where operation_id=$1`,[crossed.input.operationId])).payload;
    assert.equal(crossed.result.narrationSceneId,event.narrationSceneId);
    assert.ok(crossed.result.narrationSceneId);
    const replay=await f.runtime(f.cid,"commit",{
      campaignId:f.cid,operationId:crossed.input.operationId,
      token:randomUUID(),expectedRevision:crossed.input.expectedRevision,
      packet:event.packet},crossed.input.timeline);
    assert.equal(replay.status,"committed");
    assert.deepEqual((await f.one(`select loop_state from
      rpg_private.world_foundations where campaign_id=$1`,[f.cid])).loop_state,
      afterAward.loop_state);
    const pending=afterAward.loop_state.pending[0];
    const stateVersion=afterAward.loop_state.version;
    const worldRevision=(await f.one(`select revision from
      rpg_private.world_foundations where campaign_id=$1`,[f.cid])).revision;
    const runtimeRevision=(await f.one(`select revision from
      rpg_private.runtime_state where campaign_id=$1`,[f.cid])).revision;
    const request={requestId:randomUUID(),campaignId:f.cid,
      expectedRevision:runtimeRevision,expectedWorldRevision:worldRevision,
      expectedStateVersion:stateVersion,recipientId:hero,pendingId:pending.id,
      optionId:"trail",expectedTrackVersion:1};
    const selected=await f.runtime(f.cid,"astra_advancement",request,
      await f.fence(f.cid));
    assert.equal(selected.status,"selected");
    const selectedAgain=await f.runtime(f.cid,"astra_advancement",request,
      await f.fence(f.cid));
    assert.deepEqual(selectedAgain,selected);
    const after=await f.one(`select loop_state,world,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.equal(after.loop_state.progress[0].rank,1);
    assert.deepEqual(after.loop_state.progress[0].unlocks,["trail-reading"]);
    assert.deepEqual(after.loop_state.pending,[]);
    assert.deepEqual(after.world,before.world);
    assert.equal(after.events,before.events);
    const stale={...request,requestId:randomUUID(),
      expectedRevision:request.expectedRevision+1};
    await assert.rejects(f.runtime(f.cid,"astra_advancement",stale,
      await f.fence(f.cid)),/rpg_validation/);
    assert.deepEqual((await f.one(`select loop_state from
      rpg_private.world_foundations where campaign_id=$1`,[f.cid])).loop_state,
      after.loop_state);
    const saved=await f.saves(f.cid,"create",await f.command(f.cid,
      {kind:"manual",name:"Earned advancement"}));
    const save=saved.snapshot.saves.find((row)=>row.name==="Earned advancement");
    assert.ok(save);
    await f.saves(f.cid,"load",await f.command(f.cid,
      {saveId:save.id,label:"Restored advancement",recovery:false}));
    assert.deepEqual((await f.one(`select loop_state from
      rpg_private.world_foundations where campaign_id=$1`,[f.cid])).loop_state,
      after.loop_state);
    const currentFence=await f.fence(f.cid);
    const resumedStore=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",currentFence,true);
    const resumedMemory=createRpcMemoryStore(f.owner,memoryRpc,currentFence);
    const currentPlay=await resumedStore.readPlay(f.cid);
    const nextInput={operationId:randomUUID(),campaignId:f.cid,
      timeline:currentPlay.timeline,expectedRevision:currentPlay.revision,
      mode:"game",input:"I use my new trail reading skill.",companionId:null,
      listenerIds:[],mechanic:null};
    let contextText="";
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const nextProvider={next:async(context,_input,_receipts,_checks,_caps,source)=>{
      contextText=JSON.stringify(context);
      return {usage,output:{type:"final",call:null,final:{
        worldMinutes:source.runtime.worldMinutes,changes:[],outcomes:[],
        privatePatches:[],settlement:null}}};
    },narrate:async()=>({usage,output:{narration:"The trail signs are clear.",
      visualDescription:"",clarification:null}})};
    assert.equal((await runAstraTurn(nextInput,{store:resumedStore,
      memory:resumedMemory,provider:nextProvider,
      summaries:{summarize:async()=>({usage,output:{schemaVersion:1,
        selections:[]}})}})).status,"committed",JSON.stringify(errors));
    assert.match(contextText,/trail-reading/);
    assert.deepEqual((await f.one(`select world from rpg_private.world_foundations
      where campaign_id=$1`,[f.cid])).world,before.world);
    const turn=await f.runtime(f.cid,"get",{operationId:crossed.input.operationId},
      await f.fence(f.cid));
    assert.doesNotMatch(JSON.stringify(turn),/astraProgressionState|progressionState|astra_settlement/);
    assert.ok(first.result.narration);
  } finally { await f.db.close(); }
});

test("existing track awards create one deterministic pending choice and choice leaves actors untouched", async () => {
  const f = await setup(undefined,"en",46);
  try {
    await f.create();
    await f.startOpening();
    const w = {cid:f.cid};
    const hero = (await f.one(`select id from public.rpg_entities
      where campaign_id=$1 and kind='player' limit 1`, [w.cid])).id;
    const before = await f.one(`select world,loop_state from
      rpg_private.world_foundations where campaign_id=$1`, [w.cid]);
    const track = { id:"fieldcraft",version:1,label:"Fieldcraft",kind:"generic",
      thresholds:[5],choices:[
        {id:"trail",label:"Trail reading",capability:"trail-reading"},
        {id:"ward",label:"Watchful",capability:"watchful"}] };
    const state = { ...before.loop_state, version:before.loop_state.version+1,
      progression:"on",tracks:[track],
      progress:[{entityId:hero,trackId:track.id,value:4,rank:0,unlocks:[]}],
      pending:[] };
    await f.one(`update rpg_private.world_foundations set loop_state=$2::jsonb,
      revision=revision+1 where campaign_id=$1`,[w.cid,JSON.stringify(state)]);
    const op = randomUUID();
    const award = {kind:"progression_award",recipientId:hero,trackId:track.id,amount:1};
    const settled = (await f.one(`select rpg_private.astra_progression_after(
      $1::uuid,$2::uuid,$3::jsonb,'[]'::jsonb,$4::jsonb) next`,
      [w.cid,op,JSON.stringify(state),JSON.stringify(award)])).next;
    assert.equal(settled.progress[0].value,5);
    assert.equal(settled.progress[0].rank,0);
    assert.equal(settled.pending.length,1);
    assert.deepEqual(settled.pending[0].options,track.choices);
    assert.deepEqual((await f.one(`select world from rpg_private.world_foundations
      where campaign_id=$1`,[w.cid])).world,before.world);
    const choice = (await f.one(`select rpg_private.astra_advancement_after(
      $1::uuid,$2::jsonb,'[]'::jsonb,$3::uuid,$4::text,1,$5::uuid) next`,
      [w.cid,JSON.stringify(settled),settled.pending[0].id,"trail",hero])).next;
    assert.equal(choice.progress[0].rank,1);
    assert.deepEqual(choice.progress[0].unlocks,["trail-reading"]);
    assert.deepEqual(choice.pending,[]);
    assert.deepEqual((await f.one(`select world from rpg_private.world_foundations
      where campaign_id=$1`,[w.cid])).world,before.world);
  } finally { await f.db.close(); }
});
