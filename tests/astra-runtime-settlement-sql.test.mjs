import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { planAstraSettlement } from "../src/lib/gameplay/astra-settlement.ts";
import { commitRecordedPurchase } from "../src/lib/gameplay/astra-purchase.ts";

const migration = new URL("../supabase/migrations/202610060045_astra_runtime_settlement.sql", import.meta.url);
const migration44 = new URL("../supabase/migrations/202610060044_astra_execution_diagnostic.sql", import.meta.url);

test("clean disposable database upgrades in exact 43 to 44 to 45 order",async()=>{
  const f=await fixture(43);
  try {
    await f.db.exec(await readFile(migration44,"utf8"));
    await f.db.exec(await readFile(migration,"utf8"));
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_campaigns`)).n,0);
    assert.ok((await f.one(`select to_regprocedure(
      'rpg_private.astra_settlement_expected(uuid,rpg_private.turns,jsonb)') fn`)).fn);
    for(const signature of [
      "rpg_private.astra_settlement_text(text,integer)",
      "rpg_private.astra_settlement_currency(uuid,text,boolean)",
      "rpg_private.astra_settlement_player_storage(uuid,uuid)",
      "rpg_private.astra_settlement_expected(uuid,rpg_private.turns,jsonb)"]){
      const access=await f.one(`select has_function_privilege('authenticated',
        $1,'EXECUTE') allowed`,[signature]);
      assert.equal(access.allowed,false,signature);
    }
  } finally {await f.db.close();}
});

test("populated 43 to 44 to 45 preserves old rows and save manifests", async () => {
  const f = await fixture(43);
  try {
    const w = await world(f);
    const saved=await f.saves(w.cid,"create",await f.command(w.cid,
      {kind:"manual",name:"Before migration 45"}));
    const oldSave=saved.snapshot.saves.find((s)=>s.name==="Before migration 45");
    assert.ok(oldSave);
    const oldManifest=await f.one(`select m.refs from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id
      where s.id=$1`,[oldSave.id]);
    const before = await f.one("select count(*)::integer n from public.rpg_campaigns");
    const beforeRows=await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e
       where campaign_id=$1) entities,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.turns t
       where campaign_id=$1) turns,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id)
       from rpg_private.world_foundations w where campaign_id=$1) foundation`,[w.cid]);
    await f.db.exec(await readFile(migration44,"utf8"));
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await f.one("select count(*)::integer n from public.rpg_campaigns"), before);
    const afterRows=await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e
       where campaign_id=$1) entities,
      (select jsonb_agg(to_jsonb(t)-'astra_settlement' order by t.id)
       from rpg_private.turns t where campaign_id=$1) turns,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id)
       from rpg_private.world_foundations w where campaign_id=$1) foundation`,[w.cid]);
    assert.deepEqual(afterRows.entities,beforeRows.entities);
    assert.deepEqual(afterRows.turns,beforeRows.turns);
    assert.deepEqual(afterRows.foundation,beforeRows.foundation);
    assert.deepEqual((await f.one(`select m.refs from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id
      where s.id=$1`,[oldSave.id])).refs,oldManifest.refs);
    const restored=await f.saves(w.cid,"load",await f.command(w.cid,
      {saveId:oldSave.id,label:"Migration 45 old save restore",recovery:false}));
    assert.ok(restored.timelineId);
    const quest = await f.one("select reward_terms,reward_operation_id from public.rpg_quests limit 1");
    assert.equal(quest?.reward_terms ?? null, null);
    assert.equal(quest?.reward_operation_id ?? null, null);
    assert.ok(w.cid);
  } finally { await f.db.close(); }
});

async function takeoverFixture() {
  const f = await setup(undefined, "en", 45);
  await f.create();
  await f.startOpening();
  const foundation = await f.one("select world from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
  const hero = foundation.world.actors.find((actor) => actor.control === "player").entityId;
  const npc = foundation.world.actors.find((actor) => actor.control === "autonomous").entityId;
  if (!(await f.runtime(f.cid, "astra_takeover_status")).active) {
    const config = { profile: "console-basic-v1", controlledEntityIds: [hero],
      presentEntityIds: foundation.world.actors.map((actor) => actor.entityId),
      nearbyStorageIds: [], safeLocationIds: [], itemRules: [] };
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: play.revision, configuration: config });
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
      where r.campaign_id=$1`, [f.cid]);
    await f.runtime(f.cid, "astra_takeover", {requestId:randomUUID(), campaignId:f.cid,
      timeline, expectedRuntimeRevision:row.runtime_revision,
      expectedWorldRevision:row.world_revision,
      expectedPublicRevision:row.public_revision,
      expectedHeadId:row.head_id,expectedWorldDigest:row.world_digest,
      expectedWorldEventSequence:row.world_event_sequence});
  }
  const errors=[];
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {errors.push({action:args.p_action,message:error.message,
      where:error.where}); return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try {return {data:await f.memory(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  return {f,hero,npc,errors,rpc,memoryRpc};
}

test("post-takeover job offer, completion and reward commit once with paid autosave",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    await f.one(`update rpg_private.timeline_campaigns set
      policy=jsonb_set(policy,'{autosave}','"turn"'::jsonb)
      where campaign_id=$1`,[f.cid]);
    const worldBefore=await f.one(`select world,ruleset,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    async function turn(text,settlement) {
      const fence=await f.fence(f.cid);
      const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
      const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
      const play=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:text,companionId:null,
        listenerIds:[],mechanic:null};
      const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
      const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>({
        usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
          changes:[],outcomes:[],privatePatches:[],settlement}}}),
      narrate:async()=>({usage,output:{narration:"The agreed action is settled.",
        visualDescription:"",clarification:null}})};
      const result=await runAstraTurn(input,{store,memory,provider,
        summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
          selections:job.sources.map((source)=>({sourceId:source.id,
            version:source.ref.version}))}})}});
      assert.equal(result.status,"committed",JSON.stringify(errors));
      assert.equal(result.committedRevision,(await f.one(`select revision
        from rpg_private.runtime_state where campaign_id=$1`,[f.cid])).revision);
      return {input,result};
    }
    const offered=await turn("I accept the vegetable packing job.",{
      kind:"job_offer",issuerId:npc,title:"Pack the crates",
      description:"Pack the vegetable crates for the organiser.",
      currencyName:"silver",currencyAmount:2,itemName:"vegetables",
      itemCategory:"food",itemDescription:null});
    const quest=await f.one(`select id,status,reward_terms from public.rpg_quests
      where campaign_id=$1 and title='Pack the crates'`, [f.cid]);
    assert.equal(quest.status,"open");
    assert.equal(quest.reward_terms.itemDescription,"Ordinary vegetables.");
    await turn("I finish packing the crates.",{kind:"job_complete",questId:quest.id});
    const beforeRewardSnapshot=await f.saves(f.cid,"create",await f.command(f.cid,
      {kind:"manual",name:"Before job payment"}));
    const beforeRewardSave=beforeRewardSnapshot.snapshot.saves.find((s)=>
      s.name==="Before job payment");
    assert.ok(beforeRewardSave);
    const rewarded=await turn("Please pay me now.",{
      kind:"job_reward",questId:quest.id,recipientId:hero});
    const after=await f.one(`select resources from public.rpg_entities where id=$1`,[hero]);
    assert.equal(after.resources.currency_silver,2);
    const item=await f.one(`select id,name,quantity,owner_entity_id from public.rpg_items
      where campaign_id=$1 and name='vegetables'`,[f.cid]);
    assert.equal(item.quantity,1);
    assert.equal(item.owner_entity_id,hero);
    assert.equal((await f.one("select reward_operation_id from public.rpg_quests where id=$1",
      [quest.id])).reward_operation_id,rewarded.input.operationId);
    const event=await f.one("select payload from rpg_private.runtime_events where operation_id=$1",
      [rewarded.input.operationId]);
    const replay=await f.runtime(f.cid,"commit",{
      campaignId:f.cid,operationId:rewarded.input.operationId,
      token:randomUUID(),expectedRevision:rewarded.input.expectedRevision,
      packet:event.payload.packet},rewarded.input.timeline);
    assert.equal(replay.status,"committed");
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='vegetables'`,[f.cid])).n,1);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.save_points
      where campaign_id=$1 and trigger_key=$2`,[f.cid,
        `turn:${rewarded.input.operationId}`])).n,1);
    const autosave=await f.one(`select v.payload quest from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id
      cross join lateral jsonb_array_elements_text(m.refs->'public.rpg_quests') q(id)
      join rpg_private.timeline_versions v on v.id=q.id::uuid
      where s.campaign_id=$1 and s.trigger_key=$2
        and v.payload->>'id'=$3`,[f.cid,`turn:${rewarded.input.operationId}`,quest.id]);
    assert.equal(autosave.quest.reward_operation_id,rewarded.input.operationId);
    const paidSave=(await f.one(`select id from rpg_private.save_points
      where campaign_id=$1 and trigger_key=$2`,[f.cid,
      `turn:${rewarded.input.operationId}`])).id;
    const publicTurn=await f.runtime(f.cid,"get",{
      operationId:rewarded.input.operationId},rewarded.input.timeline);
    assert.doesNotMatch(JSON.stringify(publicTurn),/astraSettlement|astra_settlement|reward_terms|reward_operation_id/);
    const publicCampaign=await f.saves(f.cid,"campaign");
    assert.doesNotMatch(JSON.stringify(publicCampaign),/astraSettlement|astra_settlement|reward_terms|reward_operation_id/);
    await f.saves(f.cid,"load",await f.command(f.cid,
      {saveId:beforeRewardSave.id,label:"Before payout fork",recovery:false}));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,null);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='vegetables'`,[f.cid])).n,0);
    assert.equal((await f.one(`select reward_operation_id from public.rpg_quests
      where id=$1`,[quest.id])).reward_operation_id,null);
    await f.saves(f.cid,"load",await f.command(f.cid,
      {saveId:paidSave,label:"Paid reward fork",recovery:false}));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='vegetables'`,[f.cid])).n,1);
    assert.equal((await f.one(`select reward_operation_id from public.rpg_quests
      where id=$1`,[quest.id])).reward_operation_id,rewarded.input.operationId);
    const restoredTurn=await f.one(`select committed_revision from rpg_private.turns
      where id=$1`,[rewarded.input.operationId]);
    assert.equal(restoredTurn.committed_revision,rewarded.result.committedRevision);
    const worldAfter=await f.one(`select world,ruleset,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.deepEqual(worldAfter,worldBefore);
    await assert.rejects(f.one(`insert into rpg_private.world_events
      (id,campaign_id,operation_id,event) values($1,$2,$3,'{}'::jsonb)`,
      [randomUUID(),f.cid,rewarded.input.operationId]),/rpg_conflict/);
    assert.ok(offered.input.operationId);
  } finally {await f.db.close();}
});

test("ordinary gift lazily defines silver and grants one mundane Item without a job",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"The organiser gives me two silver and bread.",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>({
      usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],settlement:{kind:"mundane_grant",
          issuerId:npc,recipientId:hero,currencyName:"silver",currencyAmount:2,
          itemName:"bread",itemCategory:"food",itemDescription:null}}}}),
    narrate:async()=>({usage,output:{narration:"The organiser hands over the payment and bread.",
      visualDescription:"",clarification:null}})};
    const beforeEvents=(await f.one(`select count(*)::integer n from rpg_private.world_events
      where campaign_id=$1`,[f.cid])).n;
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((source)=>({sourceId:source.id,
          version:source.ref.version}))}})}});
    assert.equal(result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    const bread=await f.one(`select id,description,quantity from public.rpg_items
      where campaign_id=$1 and name='bread'`,[f.cid]);
    assert.equal(bread.description,"Ordinary bread.");
    assert.equal(bread.quantity,1);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.world_events
      where campaign_id=$1`,[f.cid])).n,beforeEvents);
    const currency=await f.one(`select loop_state->'currencies' currencies
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.deepEqual(currency.currencies.find((c)=>c.label==="silver"),{
      id:"currency:silver",label:"silver",resourceKey:"currency_silver",version:1});
    const packet=(await f.one(`select payload->'packet' packet from rpg_private.runtime_events
      where operation_id=$1`,[input.operationId])).packet;
    assert.equal((await f.runtime(f.cid,"commit",{operationId:input.operationId,
      campaignId:f.cid,expectedRevision:input.expectedRevision,
      token:randomUUID(),packet},input.timeline)).status,"committed");
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='bread'`,[f.cid])).n,1);
  } finally {await f.db.close();}
});

test("reclaim retains the first private source and rejects a tampered settlement pin",async()=>{
  const {f,hero,npc}=await takeoverFixture();
  try {
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,async(args)=>({data:await f.runtime(
      args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)}),
      "gpt-6-astra",fence,true);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"The organiser offers bread.",
      companionId:null,listenerIds:[],mechanic:null};
    await store.begin(input,"astra-primary-v1");
    const first=await f.runtime(f.cid,"claim",{operationId:input.operationId},input.timeline);
    assert.ok(first.source.astraSettlementCurrencies);
    assert.deepEqual(first.source.astraSettlementJobs,[]);
    const plan=planAstraSettlement(first.source,input,{kind:"mundane_grant",
      issuerId:npc,recipientId:hero,currencyName:null,currencyAmount:null,
      itemName:"bread",itemCategory:"food",itemDescription:null},[]);
    assert.ok(plan);
    const lease={...first.lease};delete lease.timeline;
    const tampered={...plan,publicOutcome:{...plan.publicOutcome,
      item:{...plan.publicOutcome.item,quantity:9}}};
    await assert.rejects(f.runtime(f.cid,"checkpoint",{...lease,status:"generating",
      checkpoint:{...first.turn.checkpoint,astraPrimary:{
        ...first.turn.checkpoint.astraPrimary,finalProposal:{schemaVersion:1}},
        astraSettlement:tampered}},input.timeline),/rpg_validation/);
    assert.equal((await f.one(`select astra_settlement from rpg_private.turns
      where id=$1`,[input.operationId])).astra_settlement,null);
    await f.one(`insert into public.rpg_quests(id,campaign_id,title,description,
      status,revision,reward_terms) values($1,$2,'Later job','Later','open',1,
      $3::jsonb)`,[randomUUID(),f.cid,JSON.stringify({issuerId:npc,
        currencyName:"silver",currencyAmount:2,itemName:null,itemCategory:null,
        itemDescription:null})]);
    // Isolate the claim source-pin property from the unrelated runtime-revision
    // fence; the later job is synthetic, and no gameplay commit is performed.
    await f.one(`update rpg_private.runtime_state set revision=$2
      where campaign_id=$1`,[f.cid,input.expectedRevision]);
    await f.one(`update rpg_private.turns set lease_until=now()-interval '1 second'
      where id=$1`,[input.operationId]);
    const second=await f.runtime(f.cid,"claim",{operationId:input.operationId},
      input.timeline);
    assert.deepEqual(second.source,first.source);
    assert.deepEqual(second.source.astraSettlementJobs,[]);
  } finally {await f.db.close();}
});

test("present NPC transfers existing currency and a partial mundane Item stack",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    async function run(intent){
      const fence=await f.fence(f.cid);
      const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
      const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
      const play=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:"A bounded exchange occurs.",
        companionId:null,listenerIds:[],mechanic:null};
      const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>(
        {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
          changes:[],outcomes:[],privatePatches:[],settlement:intent}}}),
      narrate:async()=>({usage,output:{narration:"The exchange completes.",
        visualDescription:"",clarification:null}})};
      const result=await runAstraTurn(input,{store,memory,provider,
        summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
          selections:job.sources.map((s)=>({sourceId:s.id,version:s.ref.version}))}})}});
      assert.equal(result.status,"committed",JSON.stringify(errors));
      return input;
    }
    await run({kind:"mundane_grant",issuerId:npc,recipientId:hero,
      currencyName:"silver",currencyAmount:1,itemName:null,itemCategory:null,
      itemDescription:null});
    await f.one(`update public.rpg_entities set resources=jsonb_set(resources,
      '{currency_silver}','5'::jsonb),revision=revision+1 where id=$1`,[npc]);
    const storage=(await f.one(`select id from public.rpg_storages
      where campaign_id=$1 order by id limit 1`,[f.cid])).id;
    const sourceItemId=randomUUID();
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'vegetables','food',3,'Ordinary vegetables.','',$3,$4,1)`,
      [sourceItemId,f.cid,npc,storage]);
    await run({kind:"currency_transfer",sourceEntityId:npc,recipientId:hero,
      currencyName:"silver",amount:2});
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"3");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[npc])).n,"3");
    const transferred=await run({kind:"item_transfer",sourceEntityId:npc,
      recipientId:hero,itemId:sourceItemId,quantity:2});
    assert.equal((await f.one(`select quantity from public.rpg_items
      where id=$1`,[sourceItemId])).quantity,1);
    const clonedId=(await f.one(`select rpg_private.wave4_id($1,$2) id`,
      [transferred.operationId,`astra:transfer-item:${sourceItemId}`])).id;
    const cloned=await f.one(`select quantity,owner_entity_id from public.rpg_items
      where id=$1`,[clonedId]);
    assert.equal(cloned.quantity,2);
    assert.equal(cloned.owner_entity_id,hero);
  } finally {await f.db.close();}
});

test("narration failure before commit grants no currency, Item or World Event",async()=>{
  const {f,hero,npc,rpc,memoryRpc}=await takeoverFixture();
  try {
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"The organiser offers me bread.",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const beforeEvents=(await f.one(`select count(*)::integer n
      from rpg_private.world_events where campaign_id=$1`,[f.cid])).n;
    const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>(
      {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],settlement:{kind:"mundane_grant",
          issuerId:npc,recipientId:hero,currencyName:"silver",currencyAmount:2,
          itemName:"bread",itemCategory:"food",itemDescription:null}}}}),
    narrate:async()=>{throw new Error("synthetic narrator failure");}};
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((s)=>({sourceId:s.id,version:s.ref.version}))}})}});
    assert.equal(result.status,"failed");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,null);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='bread'`,[f.cid])).n,0);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.world_events
      where campaign_id=$1`,[f.cid])).n,beforeEvents);
    assert.equal((await f.one(`select loop_state->'currencies' currencies
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]))
      .currencies.some((c)=>c.label==="silver"),false);
  } finally {await f.db.close();}
});

test("a restricted NPC Item policy cannot authorize a runtime transfer",async()=>{
  const {f,hero,npc}=await takeoverFixture();
  try {
    const storage=(await f.one(`select id from public.rpg_storages
      where campaign_id=$1 order by id limit 1`,[f.cid])).id;
    const itemId=randomUUID();
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'hidden vegetables','food',1,'Ordinary vegetables.','',$3,$4,1)`,
      [itemId,f.cid,npc,storage]);
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,async(args)=>({data:await f.runtime(
      args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)}),
      "gpt-6-astra",fence,true);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"He gives me the vegetables.",
      companionId:null,listenerIds:[],mechanic:null};
    await store.begin(input,"astra-primary-v1");
    const claim=await f.runtime(f.cid,"claim",{operationId:input.operationId},input.timeline);
    const plan=planAstraSettlement(claim.source,input,{kind:"item_transfer",
      sourceEntityId:npc,recipientId:hero,itemId,quantity:1},[]);
    assert.ok(plan);
    const state=(await f.one(`select loop_state from rpg_private.world_foundations
      where campaign_id=$1`,[f.cid])).loop_state;
    const policy={itemId,version:1,currencyId:"currency:silver",unitValue:1,
      trade:"restricted",origin:"legitimate",visibility:"private"};
    const syntheticState={...state,version:state.version+1,
      currencies:[...state.currencies,{id:"currency:silver",label:"silver",
        resourceKey:"currency_silver",version:1}],itemPolicies:[policy]};
    // This disposable-only corruption simulates a restricted historical policy;
    // production takeover still forbids changing World Foundation in this way.
    await f.db.exec(`alter table rpg_private.world_foundations
      disable trigger astra_takeover_freeze_world`);
    await f.one(`update rpg_private.world_foundations set loop_state=$2::jsonb
      where campaign_id=$1`,[f.cid,JSON.stringify(syntheticState)]);
    await f.db.exec(`alter table rpg_private.world_foundations
      enable trigger astra_takeover_freeze_world`);
    await f.one(`update rpg_private.turns set source=jsonb_set(source,
      '{astraSettlementItemPolicies}',$2::jsonb) where id=$1`,
      [input.operationId,JSON.stringify([{itemId,trade:"restricted",
        visibility:"private"}])]);
    await assert.rejects(f.one(`select rpg_private.astra_settlement_expected(
      $1,t,$2::jsonb) from rpg_private.turns t where id=$3`,
      [f.cid,JSON.stringify(plan),input.operationId]),/rpg_validation/);
  } finally {await f.db.close();}
});

test("mundane purchase debits hero, credits seller and splits one public Item exactly once",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    async function run(intent,expectedStatus="committed"){
      const fence=await f.fence(f.cid);
      const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
      const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
      const play=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:"I buy the vegetables.",
        companionId:null,listenerIds:[],mechanic:null};
      const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>(
        {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
          changes:[],outcomes:[],privatePatches:[],settlement:intent}}}),
      narrate:async()=>({usage,output:{narration:"The purchase is made.",
        visualDescription:"",clarification:null}})};
      const result=await runAstraTurn(input,{store,memory,provider,
        summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
          selections:job.sources.map((s)=>({sourceId:s.id,version:s.ref.version}))}})}});
      assert.equal(result.status,expectedStatus,JSON.stringify(errors));
      return input;
    }
    await run({kind:"mundane_grant",issuerId:npc,recipientId:hero,
      currencyName:"Silver",currencyAmount:5,itemName:null,itemCategory:null,
      itemDescription:null});
    const storage=(await f.one(`select id from public.rpg_storages
      where campaign_id=$1 order by id limit 1`,[f.cid])).id;
    const sourceItemId=randomUUID();
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'vegetables','food',3,'Ordinary vegetables.','',$3,$4,1)`,
      [sourceItemId,f.cid,npc,storage]);
    const purchased=await run({kind:"mundane_purchase",sellerId:npc,
      recipientId:hero,itemId:sourceItemId,quantity:2,currencyName:"SILVER",price:3});
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"2");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[npc])).n,"3");
    assert.equal((await f.one(`select quantity from public.rpg_items
      where id=$1`,[sourceItemId])).quantity,1);
    const cloneId=(await f.one(`select rpg_private.wave4_id($1,$2) id`,
      [purchased.operationId,`astra:purchase-item:${sourceItemId}`])).id;
    assert.deepEqual(await f.one(`select quantity,owner_entity_id
      from public.rpg_items where id=$1`,[cloneId]),
      {quantity:2,owner_entity_id:hero});
    const packet=(await f.one(`select payload->'packet' packet
      from rpg_private.runtime_events where operation_id=$1`,
      [purchased.operationId])).packet;
    assert.equal((await f.runtime(f.cid,"commit",{operationId:purchased.operationId,
      campaignId:f.cid,expectedRevision:purchased.expectedRevision,
      token:randomUUID(),packet},purchased.timeline)).status,"committed");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"2");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and owner_entity_id=$2 and name='vegetables'`,
      [f.cid,hero])).n,1);
    await run({kind:"mundane_purchase",sellerId:npc,recipientId:hero,
      itemId:sourceItemId,quantity:1,currencyName:"silver",price:20},"failed");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"2");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[npc])).n,"3");
    assert.equal((await f.one(`select quantity from public.rpg_items
      where id=$1`,[sourceItemId])).quantity,1);
  } finally {await f.db.close();}
});

test("explicit Trade purchase commits through the same Astra operation without a provider",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const play=await store.readPlay(f.cid);
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const grantInput={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"I receive five silver.",
      companionId:null,listenerIds:[],mechanic:null};
    const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>(
      {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],settlement:{kind:"mundane_grant",
          issuerId:npc,recipientId:hero,currencyName:"silver",currencyAmount:5,
          itemName:null,itemCategory:null,itemDescription:null}}}}),
    narrate:async()=>({usage,output:{narration:"Five silver change hands.",
      visualDescription:"",clarification:null}})};
    assert.equal((await runAstraTurn(grantInput,{store,memory,provider,
      summaries:{summarize:async()=>({usage,output:{schemaVersion:1,selections:[]}})}})).status,
      "committed",JSON.stringify(errors));
    const stockId=randomUUID();
    const storage=randomUUID();
    await f.one(`insert into public.rpg_storages(id,campaign_id,name,kind,
      entity_id,revision) values($1,$2,'Seller stock','companion',$3,1)`,
      [storage,f.cid,npc]);
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'bread','food',2,'Ordinary bread.','',$3,$4,1)`,
      [stockId,f.cid,npc,storage]);
    const beforeEvents=(await f.one(`select count(*)::integer n from rpg_private.world_events
      where campaign_id=$1`,[f.cid])).n;
    const next=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:next.timeline,
      expectedRevision:next.revision,mode:"game",input:"Buy 1 bread for 2 silver.",
      companionId:null,listenerIds:[],mechanic:null};
    const intent={kind:"mundane_purchase",sellerId:npc,recipientId:hero,
      itemId:stockId,quantity:1,currencyName:"silver",price:2};
    const result=await commitRecordedPurchase(store,input,intent,"bread");
    assert.equal(result.status,"committed",JSON.stringify(errors));
    assert.equal((await commitRecordedPurchase(store,input,intent,"bread")).id,result.id);
    assert.equal((await f.one(`select resources->>'currency_silver' n from
      public.rpg_entities where id=$1`,[hero])).n,"3");
    assert.equal((await f.one(`select resources->>'currency_silver' n from
      public.rpg_entities where id=$1`,[npc])).n,"2");
    assert.equal((await f.one(`select quantity from public.rpg_items
      where id=$1`,[stockId])).quantity,1);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and owner_entity_id=$2 and name='bread'`,[f.cid,hero])).n,1);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.world_events
      where campaign_id=$1`,[f.cid])).n,beforeEvents);
    const after=await store.readPlay(f.cid);
    const rejected={...input,operationId:randomUUID(),timeline:after.timeline,
      expectedRevision:after.revision};
    const failed=await commitRecordedPurchase(store,rejected,
      {...intent,price:20},"bread");
    assert.equal(failed.status,"failed");
    assert.equal((await f.one(`select resources->>'currency_silver' n from
      public.rpg_entities where id=$1`,[hero])).n,"3");
    assert.equal((await f.one(`select quantity from public.rpg_items
      where id=$1`,[stockId])).quantity,1);
  } finally {await f.db.close();}
});

test("settlement SQL rejection rolls back delegated narration and every reward row",async()=>{
  const {f,hero,npc,errors,rpc,memoryRpc}=await takeoverFixture();
  try {
    await f.db.exec(`create function rpg_private.test_reject_bread()
      returns trigger language plpgsql set search_path='' as $$
      begin raise exception 'rpg_validation'; end $$;
      create trigger test_reject_bread before insert on public.rpg_items
      for each row when (new.name='bread')
      execute function rpg_private.test_reject_bread();`);
    const before=await f.one(`select
      (select revision from rpg_private.runtime_state where campaign_id=$1) runtime_revision,
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select loop_state from rpg_private.world_foundations where campaign_id=$1) world_state`,
      [f.cid]);
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"The organiser gives me bread and silver.",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    let narrated=false;
    const provider={next:async(_context,_input,_receipts,_checks,_caps,source)=>(
      {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
        changes:[],outcomes:[],privatePatches:[],settlement:{kind:"mundane_grant",
          issuerId:npc,recipientId:hero,currencyName:"silver",currencyAmount:2,
          itemName:"bread",itemCategory:"food",itemDescription:null}}}}),
    narrate:async()=>{narrated=true;return {usage,output:{
      narration:"The organiser gives you bread and silver.",
      visualDescription:"",clarification:null}};}};
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((s)=>({sourceId:s.id,version:s.ref.version}))}})}});
    assert.equal(narrated,true);
    assert.equal(result.status,"failed");
    assert.ok(errors.some((e)=>e.action==="commit" && /rpg_validation/.test(e.message)),
      JSON.stringify(errors));
    const turn=await f.one(`select status,narration,committed_revision
      from rpg_private.turns where id=$1`,[input.operationId]);
    assert.equal(turn.status,"failed");
    assert.equal(turn.committed_revision,null);
    assert.equal(turn.narration,null);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.runtime_events
      where operation_id=$1`,[input.operationId])).n,0);
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,null);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='bread'`,[f.cid])).n,0);
    assert.deepEqual(await f.one(`select
      (select revision from rpg_private.runtime_state where campaign_id=$1) runtime_revision,
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select loop_state from rpg_private.world_foundations where campaign_id=$1) world_state`,
      [f.cid]),before);
  } finally {await f.db.close();}
});
