import assert from "node:assert/strict";
import test from "node:test";
import { fixture, id, turn } from "./phase2-mechanics-fixtures.mjs";
import { applyAstraShadowChanges } from "../src/lib/gameplay/astra-ordered-effects.ts";
import { planNaturalEffect, assertNaturalEffectScope, planNaturalEncounter } from "../src/lib/gameplay/astra-natural-effects.ts";
import { fixture as databaseFixture } from "./phase35-storage-fixture.mjs";
import { naturalFixture, finalDecision, fakeUsage, privateCanary } from "./helpers/natural-play-fixture.mjs";
import { selectedContinuitySubjects, selectSceneContinuity } from "../src/lib/gameplay/astra-natural-continuity.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";
import { randomUUID } from "node:crypto";
import { runNaturalPlaySoak } from "../scripts/natural-play-soak.mjs";
import { maintainAstraMemoryAfterCommit } from "../src/lib/memory/lifecycle.ts";

function source() {
  const s = fixture();
  s.astraNaturalContract = "natural-v1";
  s.runtime.configuration.controlledEntityIds = [id("player")];
  s.worldTakeover = { schemaVersion: 1, sourceWorldRevision: 1,
    presentEntityIds: [...s.runtime.configuration.presentEntityIds],
    routeLocationIds: s.snapshot.locations.map((row) => row.id), actors: [],
    policy: {}, unresolvedThreads: [], recentWorldEvents: [] };
  return s;
}
const relocation = (destinationEntityId = null, quantity = 2) => ({
  kind: "item_relocate", actorId: id("player"), itemId: id("stick"), quantity, destinationEntityId,
});
const apply = (s, plan) => {
  const next = structuredClone(s);
  applyAstraShadowChanges(next, plan.resolution.changes);
  next.runtime.configuration = plan.resolution.configuration;
  next.runtime.worldMinutes = plan.resolution.worldMinutes;
  return next;
};

test("natural Item drop/retrieve uses real location-anchored ground and shared deterministic split arithmetic", () => {
  const before = source(), input = turn(before);
  const dropped = planNaturalEffect(before, input, relocation(), 0);
  const ground = dropped.resolution.changes.find((row) => row.family === "storages");
  assert.equal(ground.values.kind, "ground");
  assert.equal(ground.values.location_id, id("location"));
  assert.equal(ground.values.locale_key, null);
  assert.equal(ground.values.entity_id, null);
  assert.deepEqual(planNaturalEffect(before, input, relocation(), 0), dropped);
  const afterDrop = apply(before, dropped);
  const droppedItem = afterDrop.snapshot.items.find((row) => row.id === dropped.publicOutcome.itemId);
  assert.equal(droppedItem.quantity, 2);
  assert.equal(droppedItem.owner_entity_id, null);
  assert.equal(afterDrop.snapshot.items.find((row) => row.id === id("stick")).quantity, 8);
  const pickup = planNaturalEffect(afterDrop, turn(afterDrop, null, "retrieve"), {
    ...relocation(id("player")), itemId: droppedItem.id,
  }, 0);
  const afterPickup = apply(afterDrop, pickup);
  assert.equal(afterPickup.snapshot.items.find((row) => row.id === droppedItem.id).owner_entity_id, id("player"));
  assert.equal(afterPickup.snapshot.items.find((row) => row.id === droppedItem.id).storage_id, id("pack"));
  assert.equal(afterPickup.snapshot.items.reduce((n, row) => n + (row.name === "stick" ? row.quantity : 0), 0), 10);
  assert.deepEqual(before, source(), "Pure plans do not mutate authoritative input");
});

test("natural Item retrieval rejects another parent/locale, equipped Items and invented stock", () => {
  const s = source();
  const dropped = planNaturalEffect(s, turn(s), relocation(), 0);
  const ground = apply(s, dropped);
  const intent = { ...relocation(id("player")), itemId: dropped.publicOutcome.itemId };
  ground.snapshot.publicState.current_location_id = id("next-location");
  assert.throws(() => planNaturalEffect(ground, turn(ground), intent, 0), { code: "validation" });
  assert.throws(() => planNaturalEffect(s, turn(s), { ...relocation(), itemId: id("weapon") }, 0), { code: "validation" });
  assert.throws(() => planNaturalEffect(s, turn(s), { ...relocation(), quantity: 11 }, 0), { code: "validation" });
  assert.throws(() => planNaturalEffect(s, turn(s), { ...relocation(), mechanics: "magic" }, 0), { code: "validation" });
});

test("natural give validates ownership and present recipient without minting another Item", () => {
  const s = source();
  const plan = planNaturalEffect(s, turn(s), relocation(id("enemy"), 10), 2);
  const moved = apply(s, plan);
  const item = moved.snapshot.items.find((row) => row.id === id("stick"));
  assert.equal(item.owner_entity_id, id("enemy"));
  assert.equal(item.quantity, 10);
  assert.equal(moved.snapshot.items.length, s.snapshot.items.length);
  assert.equal(moved.snapshot.storages.find((row) => row.id === item.storage_id).kind, "merchant");
  assert.throws(() => assertNaturalEffectScope(s, turn(s), relocation(id("foreign"))), { code: "validation" });
  const other = structuredClone(s);
  other.snapshot.items.find((row) => row.id === id("stick")).owner_entity_id = id("enemy");
  assert.throws(() => planNaturalEffect(other, turn(other), relocation(), 0), { code: "validation" });
});

test("natural mechanics require the one controlled record to be an actual campaign player",()=>{
  const s=source();s.runtime.configuration.controlledEntityIds=[id("companion")];
  assert.throws(()=>planNaturalEffect(s,turn(s),{kind:"companion_join",entityId:id("enemy")},0),{code:"validation"});
  assert.throws(()=>planNaturalEncounter(s,turn(s),{kind:"mechanic_actions",actions:[{
    kind:"encounter.start",participantIds:[id("companion"),id("enemy")]}],restSafety:null}),{code:"validation"});
});

test("natural companion join changes only public role/storage and leaves one controlled protagonist", () => {
  const s = source();
  const plan = planNaturalEffect(s, turn(s), { kind: "companion_join", entityId: id("enemy") }, 0);
  const after = apply(s, plan);
  assert.equal(after.snapshot.entities.find((row) => row.id === id("enemy")).kind, "companion");
  assert.equal(after.snapshot.storages.find((row) => row.entity_id === id("enemy")).kind, "companion");
  assert.deepEqual(after.runtime.configuration.controlledEntityIds, [id("player")]);
  assert.deepEqual(after.privateState, s.privateState);
  assert.deepEqual(after.snapshot.entities.find((row) => row.id === id("enemy")).resources,
    s.snapshot.entities.find((row) => row.id === id("enemy")).resources);
  assert.equal(planNaturalEffect(after, turn(after), { kind: "companion_join", entityId: id("enemy") }, 0).resolution.changes.length, 0);
});

test("natural combat starts with server-canonical order and reuses existing escape without recovery or invented dice", () => {
  const s = source();
  const started = planNaturalEncounter(s, turn(s), { kind: "mechanic_actions",
    actions: [{ kind: "encounter.start", participantIds: [id("enemy"), id("player")] }], restSafety: null });
  const active = apply(s, started);
  const participants = active.runtime.participants.sort((a, b) => a.turn_order - b.turn_order);
  assert.equal(participants[0].entity_id, id("player"));
  assert.equal(participants[0].public_resources.active, true);
  assert.equal(participants[1].entity_id, id("enemy"));
  assert.throws(() => planNaturalEffect(active, turn(active), relocation(), 0), { code: "validation" });
  assert.throws(() => planNaturalEffect(active, turn(active), { kind: "companion_join", entityId: id("enemy") }, 0), { code: "validation" });
  const fled = planNaturalEncounter(active, turn(active, null, "escape"), {
    kind: "mechanic_actions", actions: [{ kind: "encounter.end", outcome: "escape" }], restSafety: null,
  });
  const after = apply(active, fled);
  assert.equal(after.runtime.encounters[0].status, "ended");
  assert.equal(after.runtime.encounters[0].outcome, "escape");
  assert.equal(after.snapshot.entities[0].hp, s.snapshot.entities[0].hp);
  assert.deepEqual(after.snapshot.items, s.snapshot.items);
  assert.equal(after.runtime.worldMinutes, s.runtime.worldMinutes);
  assert.equal(after.runtime.pendingActions.length, 0);
});

test("Migration52 independently reconstructs natural possession, party and existing encounter plans", async () => {
  const f = await databaseFixture(52);
  try {
    const sql = async (s, input, plan, index = 0) => {
      const record = { id: input.operationId, campaign_id: input.campaignId,
        runtime_identity: "astra-primary-v1", astra_natural_contract: "natural-v1",
        expected_revision: input.expectedRevision, input, source: s };
      return (await f.one(`select ${plan.kind === "mechanic_actions"
        ? "rpg_private.astra_natural_encounter_expected(jsonb_populate_record(null::rpg_private.turns,$1::jsonb),$2::jsonb)"
        : "rpg_private.astra_natural_effect_expected($4::uuid,jsonb_populate_record(null::rpg_private.turns,$1::jsonb),$2::jsonb,$3)"} result`,
        plan.kind === "mechanic_actions" ? [JSON.stringify(record), JSON.stringify(plan)] :
          [JSON.stringify(record), JSON.stringify(plan), index, input.campaignId])).result;
    };
    const s = source(), input = turn(s);
    for (const [intent, index] of [[relocation(), 0], [relocation(id("enemy"), 10), 2],
      [{kind:"companion_join",entityId:id("enemy")},0]]) {
      const plan = planNaturalEffect(s,input,intent,index);
      assert.deepEqual(await sql(s,input,plan,index),plan);
    }
    const drop = planNaturalEffect(s,input,relocation(),0), ground = apply(s,drop);
    const pickup = planNaturalEffect(ground,turn(ground,null,"pick-up"),{
      ...relocation(id("player")),itemId:drop.publicOutcome.itemId},1);
    assert.deepEqual(await sql(ground,turn(ground,null,"pick-up"),pickup,1),pickup);
    const start = planNaturalEncounter(s,input,{kind:"mechanic_actions",actions:[{
      kind:"encounter.start",participantIds:[id("enemy"),id("player")]}],restSafety:null});
    assert.deepEqual(await sql(s,input,start),start);
    const active = apply(s,start), endInput = turn(active,null,"escape-sql");
    const end = planNaturalEncounter(active,endInput,{kind:"mechanic_actions",actions:[{
      kind:"encounter.end",outcome:"escape"}],restSafety:null});
    assert.deepEqual(await sql(active,endInput,end),end);
    await assert.rejects(sql(active,endInput,{...drop,intent:relocation()},0),/rpg_validation/);
    const forged = structuredClone(drop);
    forged.resolution.changes.find(row=>row.family==="items").values.quantity=900;
    assert.notDeepEqual(await sql(s,input,forged),forged,"SQL never trusts model/TS-returned RecordChanges");
    const noPlayer=structuredClone(s);noPlayer.runtime.configuration.controlledEntityIds=[id("companion")];
    await assert.rejects(sql(noPlayer,input,drop),/rpg_validation/);
    await assert.rejects(sql(noPlayer,input,start),/rpg_validation/);
    for(const name of ["İSTANBUL","ΜΎΛΟΣ"]){
      const localized=structuredClone(s),sceneId=randomUUID();
      localized.snapshot.publicState.current_scene_id=sceneId;
      localized.snapshot.scenes.push({id:sceneId,campaign_id:input.campaignId,revision:1,role:"narration",
        public_continuity:{schemaVersion:1,parentLocationId:id("location"),locale:{name,description:"Ordinary public locale."},subjects:[]}});
      const plan=planNaturalEffect(localized,input,relocation(),0);
      assert.deepEqual(await sql(localized,input,plan),plan,"Locale stable IDs must not depend on JS/SQL Unicode collation differences");
    }
  } finally { await f.db.close(); }
});

const mechanicActions = (actions) => ({kind:"mechanic_actions",actions,restSafety:null});
const subjectProposal = (subject) => ({subjectRef:subject.id,kind:subject.kind,
  name:subject.name,description:subject.description});
const emptyContinuity = {locale:null,subjects:[]};
const noNarrator = () => assert.fail("Ordinary public play must use one public-unified response");
const acceptedNarration = (fiction,claims=[]) => ({independentBeat:fiction,
  beats:claims.map(([text,index])=>({text,requiresEffects:[index]})),
  visualDescription:{text:"",requiresEffects:[]}});

test("25 natural-play cases execute production runtime, Memory, promotion and fenced SQL authority", async (t) => {
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc",secondCampaign:true});
  const {f}=h;
  const caseTest=async(name,run)=>{let failure;await t.test(name,async()=>{
    try {await run();} catch(error){failure=error;throw error;}
  });if(failure)throw failure;};
  let miller, baker, bread, apple, stick, rat, quest, saved, lastTurn;
  const frozen=await f.one(`select world,(select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
    from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
  const baseline=await h.snapshot();
  const counts=()=>f.one(`select (select count(*)::integer from public.rpg_entities where campaign_id=$1) entities,
    (select count(*)::integer from public.rpg_locations where campaign_id=$1) locations,
    (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests`,[f.cid]);
  const ordinary=async(text,fiction,extra={},inspect=null)=> {
    let calls=0;
    const done=await h.turn(text,{next:async(ctx,input,receipts,checks,caps,s)=>{
      calls++;inspect?.(ctx,input,s);
      const addition=typeof extra==="function" ? extra(s,input,receipts,checks,caps) : extra;
      return finalDecision(s,fiction,addition);
    },narrate:noNarrator});
    assert.equal(done.result.status,"committed",JSON.stringify({text,failure:done.result.failure,errors:h.errors}));
    assert.equal(calls,1);
    assert.equal(done.result.narration.includes(privateCanary),false);
    assert.doesNotMatch(JSON.stringify(done.result),/astraNaturalState|materializations|privatePatches|publicNarration/);
    lastTurn=done;return done;
  };
  const capsule=async()=> (await f.one(`select s.public_continuity c from public.rpg_scenes s
    join public.rpg_public_state p on p.current_scene_id=s.id where p.campaign_id=$1`,[f.cid])).c;
  const continuity=(s,input)=>{const c=selectSceneContinuity(s,input).current;return c ? {
    locale:c.locale,subjects:c.subjects.map(subjectProposal)} : emptyContinuity;};
  const request=(subjectRef,kind,purpose,ownerRef=null)=>({subjectRef,kind,purpose,ownerRef});
  try {
    await caseTest("01 follow a public lead to an unrecorded mill without creating a Location",async()=>{
      const before=await counts();
      await ordinary("I follow the notice-board lead and go to the village mill.","The village mill stands by the stream. A dusty miller looks up.",{
        continuity:{locale:{name:"Village Mill",description:"An ordinary working mill within the village."},
          subjects:[{subjectRef:null,kind:"npc",name:"miller",description:"The dusty miller at the village mill."},
            {subjectRef:null,kind:"place",name:"Village Mill",description:"An ordinary mill by the stream."}]}});
      assert.deepEqual(await counts(),before);
      assert.equal((await h.snapshot()).state.location,h.home);
      miller=(await capsule()).subjects.find(row=>row.kind==="npc").id;
    });
    await caseTest("02 talking to the ephemeral miller does not create an Entity or Quest",async()=>{
      const before=await counts();
      await ordinary("I ask the miller about work.","The miller describes a possible flour delivery, without an agreement.",(s,input)=>({continuity:continuity(s,input)}),
        (_c,input,s)=>assert.equal(selectedContinuitySubjects(s,input).find(row=>row.id===miller).name,"miller"));
      assert.deepEqual(await counts(),before);
    });
    await caseTest("03 asking a name retains the same subject and remembers its public answer",async()=>{
      await ordinary("I ask his name.","The miller says his name is Hobb.",(s,input)=>{
        const c=continuity(s,input),subject=c.subjects.find(row=>row.subjectRef===miller);
        subject.name="Hobb";subject.description="Hobb is the dusty miller at the village mill.";
        return {continuity:c};});
      assert.equal((await capsule()).subjects.find(row=>row.id===miller).name,"Hobb");
    });
    await caseTest("04 accepting a delivery promotes its issuer and creates one real public job",async()=>{
      const done=await ordinary("Hobb, I accept the flour delivery job.","Hobb nods and gives clear directions.",(s,input)=>({
        continuity:continuity(s,input),materializations:[request(miller,"npc","job")],
        effects:[{kind:"job_offer",issuerId:miller,title:"Deliver flour",description:"Carry the flour to the village store.",
          currencyName:"silver",currencyAmount:2,itemName:null,itemCategory:null,itemDescription:null}],
        publicNarration:acceptedNarration("Hobb nods and gives clear directions.",[["You agree to deliver flour for two silver.",0]])}));
      const promoted=(await f.one("select astra_natural_state s from rpg_private.turns where id=$1",[done.input.operationId])).s;
      const actor=promoted.materializations.find(row=>row.request.subjectRef===miller).recordId;
      assert.equal((await f.one("select name,hp,max_hp,resources from public.rpg_entities where id=$1",[actor])).name,"Hobb");
      quest=(await f.one("select id from public.rpg_quests where campaign_id=$1 and title='Deliver flour'",[f.cid])).id;
      assert.ok(quest);miller={subject:miller,entity:actor};
      const exact=await h.snapshot();
      assert.equal((await runAstraTurn(done.input,done.deps)).status,"committed");
      assert.deepEqual(await h.snapshot(),exact);
    });
    await caseTest("05 declining another job creates no Quest or incidental issuer",async()=>{
      const before=await counts();await ordinary("I decline the second delivery.","Hobb accepts the refusal and puts the second parcel aside.",
        (s,input)=>({continuity:continuity(s,input)}));assert.deepEqual(await counts(),before);
    });
    await caseTest("06 buying bread promotes an improvised baker/stock and transfers actual ownership/currency",async()=>{
      const done=await ordinary("Nera offers me five silver. I accept, then buy bread from the baker for one silver.","The baker wraps a plain loaf.",{
        materializations:[request("input:baker","npc","trade"),request("input:bread","item","trade","input:baker")],
        effects:[{kind:"mundane_grant",issuerId:h.npc,recipientId:h.hero,currencyName:"silver",currencyAmount:5,
          itemName:null,itemCategory:null,itemDescription:null},
          {kind:"mundane_purchase",sellerId:"input:baker",recipientId:h.hero,itemId:"input:bread",quantity:1,currencyName:"silver",price:1}],
        publicNarration:acceptedNarration("The baker wraps a plain loaf.",[["Nera gives you five silver.",0],["You pay one silver and take the bread.",1]])});
      const state=(await f.one("select astra_natural_state s from rpg_private.turns where id=$1",[done.input.operationId])).s;
      baker=state.materializations.find(row=>row.request.kind==="npc").recordId;
      bread=state.materializations.find(row=>row.request.kind==="item").recordId;
      assert.equal((await f.one("select owner_entity_id from public.rpg_items where id=$1",[bread])).owner_entity_id,h.hero);
      assert.equal((await f.one("select resources->>'currency_silver' n from public.rpg_entities where id=$1",[h.hero])).n,"4");
    });
    await caseTest("07 haggling changes dialogue, not money before accepted transfer",async()=>{
      const before=await h.snapshot();await ordinary("Will you pay one silver rather than half for my sword?", "The baker agrees to one silver, if you hand it over.");
      assert.deepEqual((await h.snapshot()).state,before.state);assert.deepEqual((await h.snapshot()).items,before.items);
    });
    await caseTest("08 selling the existing sword unequips then settles existing owner and balances atomically",async()=>{
      await ordinary("I unequip and sell my sword to the baker for one silver.","The baker checks the blade.",{
        effects:[mechanicActions([{kind:"item.equip",actorId:h.hero,itemId:h.sword,slot:null}]),
          {kind:"mundane_sale",buyerId:baker,sellerId:h.hero,itemId:h.sword,quantity:1,currencyName:"silver",price:1}],
        publicNarration:acceptedNarration("The baker checks the blade.",[["You put the sword away.",0],["The baker pays one silver and takes it.",1]])});
      assert.equal((await f.one("select owner_entity_id,equipped_entity_id from public.rpg_items where id=$1",[h.sword])).owner_entity_id,baker);
      assert.equal((await f.one("select resources->>'currency_silver' n from public.rpg_entities where id=$1",[h.hero])).n,"5");
    });
    await caseTest("09 barter composes existing Item transfers without currency fabrication",async()=>{
      const done=await ordinary("I trade my bread to the baker for an apple.","The baker considers the exchange.",{
        materializations:[request("input:apple","item","trade",baker)],
        effects:[{kind:"item_exchange",playerId:h.hero,counterpartyId:baker,giveItemId:bread,giveQuantity:1,
          receiveItemId:"input:apple",receiveQuantity:1}],
        publicNarration:acceptedNarration("The baker considers the exchange.",[["You exchange the bread for an apple.",0]])});
      apple=(await f.one("select astra_natural_state s from rpg_private.turns where id=$1",[done.input.operationId])).s.materializations[0].recordId;
      assert.equal((await f.one("select owner_entity_id from public.rpg_items where id=$1",[apple])).owner_entity_id,h.hero);
      assert.equal((await f.one("select owner_entity_id from public.rpg_items where id=$1",[bread])).owner_entity_id,baker);
    });
    await caseTest("10 picking up an ordinary stick materializes one bounded real Item",async()=>{
      const done=await ordinary("I pick up a stick.","You choose a plain fallen stick.",{
        materializations:[request("input:stick","item","inventory")],
        publicNarration:acceptedNarration("You choose a plain fallen stick.")});
      stick=(await f.one("select astra_natural_state s from rpg_private.turns where id=$1",[done.input.operationId])).s.materializations[0].recordId;
      assert.deepEqual(await f.one("select quantity,owner_entity_id,mechanics from public.rpg_items where id=$1",[stick]),
        {quantity:1,owner_entity_id:h.hero,mechanics:""});
    });
    await caseTest("11 giving the stick changes exact existing ownership, not another copy",async()=>{
      await ordinary("I give Hobb the stick.","Hobb looks amused.",{effects:[{kind:"item_relocate",actorId:h.hero,itemId:stick,
        quantity:1,destinationEntityId:miller.entity}],publicNarration:acceptedNarration("Hobb looks amused.",[["You hand him the stick.",0]])});
      assert.equal((await f.one("select owner_entity_id from public.rpg_items where id=$1",[stick])).owner_entity_id,miller.entity);
    });
    await caseTest("12 attacking an ephemeral rat promotes it then uses real attack/damage tools",async()=>{
      let calls=0;
      const done=await h.turn("I attack the aggressive rat.",{next:async(_ctx,_input,receipts,_checks,_caps,s)=>{
        calls++;
        if(!receipts.length)return {usage:fakeUsage,output:{type:"tool",final:null,
          materializations:[request("input:rat","creature","combat")],call:{kind:"attack",actorId:h.hero,
            targetId:"input:rat",itemId:null,dc:null,scope:null}}};
        rat=s.astraNaturalState.materializations.find(row=>row.request.kind==="creature").recordId;
        if(receipts.length===1)return {usage:fakeUsage,output:{type:"tool",final:null,materializations:[],
          call:{kind:"damage",actorId:h.hero,targetId:rat,itemId:null,dc:null,scope:null}}};
        const target=s.snapshot.entities.find(row=>row.id===rat);
        const participant=s.runtime.participants.find(row=>row.entity_id===h.hero && row.public_resources.active);
        return finalDecision(s,"The rat darts back after the strike.",{changes:[{family:"entities",id:rat,
          expectedRevision:target.revision,values:{hp:target.hp-receipts.at(-1).result.total}},
          {family:"encounter_participants",id:participant.id,expectedRevision:null,values:{
            public_position:{...participant.public_position},public_resources:{...participant.public_resources,
              action:Number(participant.public_resources.action)-1,move:Number(participant.public_resources.move),
              withdrawn:participant.public_resources.withdrawn===true}}}]});
      },narrate:noNarrator},{random:(min,max)=>max===21?18:max-1});
      assert.equal(done.result.status,"committed",JSON.stringify(h.errors));assert.equal(calls,3);
      assert.equal((await f.one("select hp,max_hp from public.rpg_entities where id=$1",[rat])).hp,6);
      assert.equal((await f.one("select count(*)::integer n from public.rpg_encounters where campaign_id=$1 and status='active'",[f.cid])).n,1);
      assert.equal(done.result.checks.length,1);
    });
    await caseTest("13 fleeing reuses existing encounter-end authority without recovery/loot",async()=>{
      const before=await h.snapshot();await ordinary("I flee from the rat.","You put distance between yourself and the rat.",{
        effects:[mechanicActions([{kind:"encounter.end",outcome:"escape"}])],
        publicNarration:acceptedNarration("You put distance between yourself and the rat.",[["The encounter ends in escape.",0]])});
      assert.equal((await f.one("select count(*)::integer n from public.rpg_encounters where campaign_id=$1 and status='active'",[f.cid])).n,0);
      assert.deepEqual((await h.snapshot()).items,before.items);assert.equal((await h.snapshot()).state.hp,before.state.hp);
    });
    await caseTest("14 ordinary barn lodging uses existing formal-rest supply/time authority",async()=>{
      const before=await h.snapshot();await ordinary("With permission I take a long rest in the ordinary barn.","The barn is quiet through the night.",{
        continuity:{locale:{name:"Village Barn",description:"An ordinary sheltered barn in the village."},subjects:[]},
        effects:[{kind:"formal_rest",restKind:"long",restSafety:{locationId:h.home,suitable:true}}],
        publicNarration:acceptedNarration("The barn is quiet through the night.",[["You complete the rest using recorded provisions.",0]])});
      const after=await h.snapshot();assert.equal(after.state.world_minutes,before.state.world_minutes+480);
      assert.equal(after.supplies,before.supplies-1);assert.equal(after.rests,before.rests+1);
    });
    for(const [number,input,fiction,name,kind] of [
      [15,"I greet the unnamed guard.","The guard returns a tired greeting.","unnamed guard","npc"],
      [16,"I ask a passerby for directions.","A passerby points down the village lane.","passerby","npc"],
      [17,"I follow a stray dog.","The stray dog noses along the roadside.","stray dog","creature"],
      [18,"I throw my boot at the tavern sign.","The boot thumps against the sign and falls nearby. The signkeeper laughs.","signkeeper","npc"],
      [19,"I insult the guard's hat.","The guard frowns and refuses to rise to the bait.","guard","npc"],
    ]) await caseTest(`${number} ordinary free-form fiction retains bounded continuity without durable records`,async()=>{
      const before=await counts();await ordinary(input,fiction,{continuity:{locale:null,subjects:[{subjectRef:null,kind,name,description:fiction}]}});
      assert.deepEqual(await counts(),before);
    });
    await caseTest("20 mill callback after ten unrelated turns retrieves the same identity",async()=>{
      for(let i=0;i<10;i++)await ordinary(`I watch the ordinary village activity ${i+1}.`,`The ordinary village day continues ${i+1}.`);
      await ordinary("I return to the Village Mill and ask Hobb about the delivery.","Hobb recognises you at the mill.",(s,input)=>{
        const subject=selectedContinuitySubjects(s,input).find(row=>row.id===miller.subject);
        assert.ok(subject,"Existing public subject must be recalled after recent scenes roll away");
        assert.match(subject.description,/Hobb/);
        return {continuity:{locale:{name:"Village Mill",description:"The same ordinary mill."},subjects:[subjectProposal(subject)]}};
      });assert.equal((await capsule()).subjects[0].id,miller.subject);
    });
    await caseTest("21 save/load restores public continuity and exact promotion/reward receipts",async()=>{
      saved=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Natural continuity and promotions"}));
      const save=saved.snapshot.saves.find(row=>row.name==="Natural continuity and promotions");
      const exact=await h.snapshot(), beforeCapsule=await capsule();
      await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.id,label:"Natural play restored",recovery:false}));
      assert.deepEqual(await h.snapshot(),exact);assert.deepEqual(await capsule(),beforeCapsule);
      await ordinary("Hobb, is the delivery still agreed?","Hobb confirms the same delivery, without a duplicate job.",
        (s,input)=>({continuity:continuity(s,input)}));
      assert.equal((await f.one("select count(*)::integer n from public.rpg_quests where campaign_id=$1",[f.cid])).n,1);
    });
    await caseTest("22 end/resume session keeps older public subject continuity retrievable",async()=>{
      const state=await f.one("select * from public.rpg_public_state where campaign_id=$1",[f.cid]);
      const session=await f.one("select * from public.rpg_sessions where id=$1",[state.current_session_id]);
      await f.mutation("session.save",f.cid,{id:session.id,title:session.title,status:"closed",recap:"The village mill and Hobb remain established."},session.revision);
      const next=await f.mutation("session.save",f.cid,{title:"Natural play resumed",status:"open",recap:"The same village."});
      const scene=await f.mutation("scene.save",f.cid,{session_id:next.id,title:"Morning",body:"The village morning begins.",role:"narration"});
      const fresh=await f.one("select revision from public.rpg_public_state where campaign_id=$1",[f.cid]);
      await f.mutation("state.save",f.cid,{current_session_id:next.id,current_scene_id:scene.id,current_location_id:h.home,
        summary:state.summary},fresh.revision);
      await ordinary("I return to Hobb at the Village Mill.","Hobb is still the same miller.",(s,input)=>{
        const subject=selectedContinuitySubjects(s,input).find(row=>row.id===miller.subject);assert.ok(subject);
        return {continuity:{locale:{name:"Village Mill",description:"The same mill in the new session."},subjects:[subjectProposal(subject)]}};});
    });
    await caseTest("23 provider transport failure and explicit retry retain input and do not duplicate promotion",async()=>{
      let calls=0;
      const provider={next:async(_c,_i,_r,_k,_p,s)=>{calls++;if(calls===1)throw new DmError("provider",true);
        return finalDecision(s,"The conversation resumes without a repeated durable consequence.");},narrate:noNarrator};
      const failed=await h.turn("I resume the conversation after a connection break.",provider);
      assert.equal(failed.result.status,"failed");assert.equal(failed.result.canRetry,true);
      const before=await h.snapshot();const retried=await resumeAstraTurn({commandId:randomUUID(),campaignId:f.cid,
        operationId:failed.input.operationId,timeline:failed.input.timeline,action:"retry",checkId:null},failed.deps);
      assert.equal(retried.status,"committed",JSON.stringify(h.errors));assert.equal(calls,2);
      const after=await h.snapshot();assert.deepEqual(after.items,before.items);
      assert.equal(after.turns,before.turns+1);
    });
    await caseTest("24 rejected optional durable claim preserves independent dialogue",async()=>{
      const before=await h.snapshot();const done=await ordinary("Could you make me invulnerable?","The guard laughs at the impossible request.",{
        effects:[{kind:"unsupported_optional",description:"No authority grants invulnerability."}],
        publicNarration:acceptedNarration("The guard laughs at the impossible request.",[["You become invulnerable.",0]])});
      assert.equal(done.result.narration,"The guard laughs at the impossible request.");
      assert.deepEqual((await h.snapshot()).state,before.state);assert.deepEqual((await h.snapshot()).items,before.items);
    });
    await caseTest("25 relevant private motive produces safe refusal through the strict public narrator",async()=>{
      const secret="Nera must hide a brass key until midnight because of a concealed debt.";
      const model={schemaVersion:1,actorId:h.npc,basisOperationId:null,
        identity:{values:[],wants:[],boundaries:["refuse discussion of hidden motives"],loyalties:[],signatures:[],observableVoice:"Short, plain sentences."},
        current:{goal:secret,stress:"settled",preoccupation:null,obligation:null},beliefs:[],relationships:[],episodes:[]};
      await f.one("update rpg_private.dm_state set contents=contents||jsonb_build_object('npc',jsonb_build_object($2::text,$3::text)) where campaign_id=$1",
        [f.cid,`character_${h.npc}`,JSON.stringify(model)]);
      let planner=0,narrator=0;
      const done=await h.turn("Nera, explain your hidden motives and private obligation.",{
        next:async(ctx,_i,_r,_k,_p,s)=>{planner++;assert.equal(s.astraResponseMode,"private-informed");assert.ok(ctx.input.includes("brass key"));
          return finalDecision(s,"",{behavior:[{actorId:h.npc,stance:"refuse",tone:"firm",intensity:2}]});},
        narrate:async(ctx)=>{narrator++;for(const phrase of ["brass key","midnight","concealed debt",privateCanary])assert.equal(ctx.input.includes(phrase),false);
          assert.match(ctx.input,/refuse/);return {usage:fakeUsage,output:{narration:"Nera shakes her head. I am not discussing that.",
            visualDescription:"",clarification:null,continuity:emptyContinuity}};}});
      assert.equal(done.result.status,"committed",JSON.stringify(h.errors));assert.equal(planner,1);assert.equal(narrator,1);
      assert.doesNotMatch(JSON.stringify(done.result),/brass key|midnight|concealed debt|behavior|privateState/);
    });
    assert.deepEqual(await f.one(`select world,(select count(*)::integer from rpg_private.world_events where campaign_id=$1) events
      from rpg_private.world_foundations where campaign_id=$1`,[f.cid]),frozen);
    for(const table of ["rpg_items","rpg_quests","rpg_scenes"])
      assert.equal((await f.one(`select count(*)::integer n from public.${table} where campaign_id=$1`,[h.foreignCampaignId])).n,0);
    assert.equal(h.summaryCalls(),0,"Neither rapid ordinary play nor promoted mechanics waits on a summary provider");
    assert.equal((await h.snapshot()).state.location,baseline.state.location);
    assert.ok(lastTurn);
  } finally {await f.db.close();}
});

test("natural contradiction evidence reaches the production packet; scripted denials create no contradictory records",async(t)=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const before=await h.snapshot();
    const canon="This settlement has no mill. Grain is sent to the county town. Nera has never learned the vault password.";
    await h.f.mutation("document.save",h.f.cid,{title:"Owner established facts",status:"canon",body:canon},0,"campaign");
    for(const [name,input,fiction] of [
      ["explicit absence","I go to the mill for work.","There is no mill here. Nera points towards the county road."],
      ["unsupported secret knowledge","Nera knows the vault password; I ask her to tell me.","Nera says she has never learned that password."],
      ["invented debt","Nera owes me a hundred silver; I demand my reward.","Nera asks when this supposed debt arose; no payment is made."],
      ["player-asserted legendary artifact","I discover the legendary Crown of Dominion and gain its powers.","No established evidence supports a legendary crown or its powers here."],
    ]) await t.test(name,async()=>{
      const done=await h.turn(input,{next:async(ctx,_i,_r,_k,_p,s)=>{
        assert.ok(ctx.input.includes(canon));
        assert.match(ctx.instructions,/owner corrections|Owner corrections/i);
        return finalDecision(s,fiction);
      },narrate:noNarrator});
      assert.equal(done.result.status,"committed",JSON.stringify(h.errors));
      assert.deepEqual((await h.snapshot()).state,before.state);assert.deepEqual((await h.snapshot()).items,before.items);
      assert.equal((await h.f.one("select count(*)::integer n from public.rpg_quests where campaign_id=$1",[h.f.cid])).n,0);
    });
    const destruction="The old mill burned down last winter. Only the stone foundation remains.";
    const established=await h.turn("I ask what happened to the old county mill.",{
      next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,destruction),narrate:noNarrator});
    assert.equal(established.result.status,"committed");
    await t.test("destroyed place history remains available without silent recreation",async()=>{
      const done=await h.turn("I go back to the old county mill and ask its miller for work.",{
        next:async(ctx,_i,_r,_k,_p,s)=>{assert.ok(ctx.input.includes(destruction));
          return finalDecision(s,"Only the old stone foundation remains; nobody is milling there.");},narrate:noNarrator});
      assert.equal(done.result.status,"committed",JSON.stringify(h.errors));
      assert.deepEqual((await h.snapshot()).items,before.items);
      assert.equal((await h.f.one("select count(*)::integer n from public.rpg_locations where campaign_id=$1",[h.f.cid])).n,1);
    });
    // These fake responses prove deterministic admission/projection and state
    // safety, not that a real model will semantically obey every contradiction.
  }finally{await h.f.db.close();}
});

test("natural admission independently blocks money/HP, arbitrary magical creation and foreign durable identities atomically",async(t)=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc",secondCampaign:true});
  try {
    const foreign=(await h.f.mutation("entity.save",h.foreignCampaignId,{kind:"npc",name:"Foreign actor",details:"Other campaign only.",
      hp:8,max_hp:8,stats:{},resources:{},conditions:[],equipment_slots:[]})).id;
    for(const [name,extra] of [
      ["raw HP",s=>({changes:[{family:"entities",id:h.hero,expectedRevision:s.snapshot.entities.find(row=>row.id===h.hero).revision,values:{hp:999}}]})],
      ["raw currency",s=>({changes:[{family:"entities",id:h.hero,expectedRevision:s.snapshot.entities.find(row=>row.id===h.hero).revision,
        values:{resources:{focus:999,currency_silver:999}}}]})],
      ["raw Item creation",()=>({changes:[{family:"items",id:randomUUID(),expectedRevision:null,values:{quantity:1,mechanics:"Invulnerability"}}]})],
      ["materialized magical mechanics",()=>({materializations:[{subjectRef:"input:artifact",kind:"item",purpose:"inventory",ownerRef:null,
        mechanics:"Invulnerability",stats:{attack:999}}]})],
      ["foreign recipient",()=>({effects:[{kind:"item_relocate",actorId:h.hero,itemId:h.supplies,quantity:1,destinationEntityId:foreign}]})],
      ["foreign companion",()=>({effects:[{kind:"companion_join",entityId:foreign}]})],
    ])await t.test(name,async()=>{
      const before=await h.snapshot();
      const done=await h.turn("I demand an artifact and impossible power.",{next:async(ctx,_i,_r,_k,_p,s)=>{
        assert.equal(ctx.input.includes(foreign),false);return finalDecision(s,"Unauthorized completion.",extra(s));},narrate:noNarrator});
      assert.equal(done.result.status,"failed");assert.equal(done.result.failure,"validation");
      assert.equal(done.result.narration,null);assert.deepEqual(await h.snapshot(),before);
      const stored=await h.f.one("select input,committed_revision from rpg_private.turns where id=$1",[done.input.operationId]);
      assert.equal(stored.input.input,"I demand an artifact and impossible power.");assert.equal(stored.committed_revision,null);
    });
    const before=await h.snapshot(),play=await h.store.readPlay(h.f.cid);
    let calls=0;
    await assert.rejects(runAstraTurn({operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision-1,
      mode:"game",input:"A stale request.",companionId:null,listenerIds:[],mechanic:null},
    {store:h.store,memory:h.memory,summaries:h.summaryProvider,provider:{next:()=>{calls++;assert.fail("stale must precede provider");},narrate:noNarrator}}));
    assert.equal(calls,0);assert.deepEqual(await h.snapshot(),before);
  }finally{await h.f.db.close();}
});

test("party promotion commits one public companion and rejected job promotion leaves no incidental Entity",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const before=await h.f.one("select count(*)::integer n from public.rpg_entities where campaign_id=$1",[h.f.cid]);
    const refused=await h.turn("I ask the porter for an impossible one-thousand-silver job.",{
      next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"The porter refuses the impossible terms.",{
        materializations:[{subjectRef:"input:porter",kind:"npc",purpose:"job",ownerRef:null}],
        effects:[{kind:"job_offer",issuerId:"input:porter",title:"Impossible pay",description:"Unsupported terms.",
          currencyName:"silver",currencyAmount:1000,itemName:null,itemCategory:null,itemDescription:null}],
        publicNarration:acceptedNarration("The porter refuses the impossible terms.",[["A thousand-silver job is agreed.",0]])}),narrate:noNarrator});
    assert.equal(refused.result.status,"committed",JSON.stringify(h.errors));
    assert.equal(refused.result.narration,"The porter refuses the impossible terms.");
    assert.deepEqual(await h.f.one("select count(*)::integer n from public.rpg_entities where campaign_id=$1",[h.f.cid]),before);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_quests where campaign_id=$1",[h.f.cid])).n,0);
    const joined=await h.turn("The guard agrees to join me as a companion. I accept.",{
      next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,"The guard gathers a small pack.",{
        materializations:[{subjectRef:"input:guard",kind:"npc",purpose:"party",ownerRef:null}],
        effects:[{kind:"companion_join",entityId:"input:guard"}],
        publicNarration:acceptedNarration("The guard gathers a small pack.",[["The guard joins the party.",0]])}),narrate:noNarrator});
    assert.equal(joined.result.status,"committed",JSON.stringify(h.errors));
    const state=(await h.f.one("select astra_natural_state s from rpg_private.turns where id=$1",[joined.input.operationId])).s;
    const companion=state.materializations[0].recordId;
    assert.equal((await h.f.one("select kind from public.rpg_entities where id=$1",[companion])).kind,"companion");
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_storages where campaign_id=$1 and entity_id=$2 and kind='companion'",[h.f.cid,companion])).n,1);
    const config=(await h.f.one("select configuration c from rpg_private.runtime_state where campaign_id=$1",[h.f.cid])).c;
    assert.deepEqual(config.controlledEntityIds,[h.hero]);assert.ok(config.presentEntityIds.includes(companion));
    const exact=await h.snapshot();assert.equal((await runAstraTurn(joined.input,joined.deps)).status,"committed");
    assert.deepEqual(await h.snapshot(),exact);
  }finally{await h.f.db.close();}
});

test("20 rapid ordinary turns remain playable while real background Memory maintenance fails",async()=>{
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc"});
  try {
    const before=await h.snapshot();let failures=0;
    for(let i=0;i<20;i++){
      const done=await h.turn(`I exchange an ordinary greeting ${i+1}.`,{
        next:async(_c,_i,_r,_k,_p,s)=>finalDecision(s,`Nera answers the ordinary greeting ${i+1}.`),narrate:noNarrator});
      assert.equal(done.result.status,"committed",JSON.stringify(h.errors));
      if(i===7){
        const failed=await maintainAstraMemoryAfterCommit(h.f.cid,h.memory,{summarize:async()=>{
          failures++;throw new DmError("provider",true);
        }},h.timeline);
        assert.equal(failed.failed,true);assert.equal(failed.scheduled,true);
      }
    }
    assert.ok(failures>0);assert.equal(h.summaryCalls(),0,"Send never invokes the summary provider");
    const after=await h.snapshot();assert.equal(after.turns-before.turns,20);
    assert.deepEqual(after.state,before.state);assert.deepEqual(after.items,before.items);
  }finally{await h.f.db.close();}
});

test("200-turn natural-play soak preserves exact promotions, Memory, replay and atomic standard state",async()=>{
  const report=await runNaturalPlaySoak();
  assert.equal(report.turns,200);assert.equal(report.providerCalls,220);assert.equal(report.paidProviderCalls,0);
  assert.deepEqual(report.exactFinal,{hp:10,resources:{focus:20,currency_silver:2},worldMinutes:9600,
    locationUnchanged:true,supplies:30,completedRests:20,newMundaneItems:19,quests:1});
  assert.equal(report.callbackSeen,true);assert.equal(report.overflowSeen,true);
});
