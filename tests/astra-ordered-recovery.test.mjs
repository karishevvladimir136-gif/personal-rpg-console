import test from "node:test";
import assert from "node:assert/strict";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";

const grant = (hero,npc) => ({kind:"mundane_grant",issuerId:npc,
  recipientId:hero,currencyName:"silver",currencyAmount:2,
  itemName:null,itemCategory:null,itemDescription:null});

test("same-turn offer, completion and reward derive one new quest and one exact claim",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try {
    const done=await turn("The crate job is agreed and finished; collect its pay.",({input})=>{
      const questId=stableGameplayId(input.operationId,"astra:job");
      return [{kind:"job_offer",issuerId:npc,title:"Pack crates",
        description:"Pack the agreed crates.",currencyName:"silver",currencyAmount:2,
        itemName:"vegetables",itemCategory:"food",itemDescription:null},
        {kind:"job_complete",questId},{kind:"job_reward",questId,recipientId:hero}];
    },()=>"The finished crate job pays two silver and vegetables.");
    assert.equal(done.result.status,"committed",JSON.stringify(errors));
    const quest=await f.one("select id,status,revision,reward_operation_id,reward_terms from public.rpg_quests where campaign_id=$1",[f.cid]);
    assert.equal(quest.id,stableGameplayId(done.input.operationId,"astra:job"));
    assert.equal(quest.status,"complete");assert.equal(quest.revision,1);
    assert.equal(quest.reward_operation_id,done.input.operationId);
    assert.equal(quest.reward_terms.issuerId,npc);
    const bundle=(await f.one("select astra_ordered_effects b from rpg_private.turns where id=$1",[done.input.operationId])).b;
    assert.deepEqual(bundle.indices,[0,1,2]);
    const changes=bundle.resolution.changes.filter(c=>c.family==="quests");
    assert.equal(changes.length,1);assert.equal(changes[0].expectedRevision,null);
    assert.equal((await f.one("select resources->>'currency_silver' n from public.rpg_entities where id=$1",[hero])).n,"2");
    await done.store.begin(done.input,"astra-primary-v1");
    assert.equal((await f.one("select count(*)::integer n from public.rpg_quests where campaign_id=$1",[f.cid])).n,1);
  } finally {await f.db.close();}
});

test("received Item can be transferred legally in the same ordered turn",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try {
    const camp=(await f.mutation("storage.save",f.cid,{name:"Known shared stash",kind:"camp",entity_id:null})).id;
    const done=await turn("Take the agreed food and put it in the shared stash.",({input})=>[
      {kind:"mundane_grant",issuerId:npc,recipientId:hero,currencyName:null,currencyAmount:null,
        itemName:"vegetables",itemCategory:"food",itemDescription:null},
      {kind:"mechanic_actions",actions:[{kind:"item.transfer",actorId:hero,
        itemId:stableGameplayId(input.operationId,"astra:grant-item"),quantity:1,
        destinationStorageId:camp}],restSafety:null}],()=>"The granted vegetables are recorded in the shared stash.");
    assert.equal(done.result.status,"committed",JSON.stringify(errors));
    const item=await f.one("select quantity,storage_id,owner_entity_id,revision from public.rpg_items where id=$1",
      [stableGameplayId(done.input.operationId,"astra:grant-item")]);
    assert.deepEqual(item,{quantity:1,storage_id:camp,owner_entity_id:hero,revision:1});
    const bundle=(await f.one("select astra_ordered_effects b from rpg_private.turns where id=$1",[done.input.operationId])).b;
    assert.equal(bundle.resolution.changes.filter(c=>c.family==="items").length,1);
    assert.equal(bundle.resolution.changes.find(c=>c.family==="items").expectedRevision,null);
  } finally {await f.db.close();}
});

test("independent SQL rejects forged collapsed currency and frozen Foundation definitions atomically",async()=>{
  const {f,hero,npc,turn}=await takenOver(48,true);
  try {
    const before=await f.one(`select (select resources from public.rpg_entities where id=$2) resources,
      (select loop_state from rpg_private.world_foundations where campaign_id=$1) foundation,
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes`,[f.cid,hero]);
    const failed=await turn("Receive pay and earned fieldcraft practice.",[grant(hero,npc),
      {kind:"progression_award",recipientId:hero,trackId:"fieldcraft",amount:3}],()=>"The pay and earned practice are ready.",true);
    assert.equal(failed.result.status,"failed");
    const original=(await f.one("select astra_ordered_effects b from rpg_private.turns where id=$1",[failed.input.operationId])).b;
    const forgeries=[
      pin=>{pin.resolution.changes.find(c=>c.family==="entities").values.resources.currency_silver=20;},
      pin=>{pin.foundationState.tracks[0].thresholds=[1];},
      pin=>{pin.effects[0].changes.find(c=>c.family==="entities").values.resources.currency_silver=20;},
      pin=>{pin.indices=[1,0];},
    ];
    for(const forge of forgeries){
      const pin=structuredClone(original);forge(pin);
      await f.one("update rpg_private.turns set astra_ordered_effects=$2::jsonb where id=$1",
        [failed.input.operationId,JSON.stringify(pin)]);
      const claim=await f.runtime(f.cid,"claim",{operationId:failed.input.operationId});
      const cp=claim.turn.checkpoint;
      await assert.rejects(()=>f.runtime(f.cid,"commit",{...claim.lease,packet:{
        narration:cp.narration.narration,visualDescription:cp.narration.visualDescription,
        resolution:cp.astraPrimary.finalProposal.resolution,privatePatches:cp.astraPrimary.finalProposal.privatePatches,
        checks:cp.checks,guidanceProposal:null}}),/rpg_validation/);
      assert.deepEqual(await f.one(`select (select resources from public.rpg_entities where id=$2) resources,
        (select loop_state from rpg_private.world_foundations where campaign_id=$1) foundation,
        (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes`,[f.cid,hero]),before);
      await f.runtime(f.cid,"fail",{...claim.lease,failure:"unavailable",retryable:true});
    }
    await assert.rejects(()=>f.one(`update rpg_private.world_foundations set
      loop_state=jsonb_set(loop_state,'{tracks,0,thresholds}','[1]'::jsonb),revision=revision+1
      where campaign_id=$1`,[f.cid]),/rpg_conflict/);
  } finally {await f.db.close();}
});
