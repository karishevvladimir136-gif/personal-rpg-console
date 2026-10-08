import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { takenOver } from "./astra-freedom-fixture.mjs";

const migration = new URL("../supabase/migrations/202610080048_astra_ordered_mechanics.sql", import.meta.url);
const grant = (hero,npc,amount=2) => ({kind:"mundane_grant",issuerId:npc,
  recipientId:hero,currencyName:"silver",currencyAmount:amount,
  itemName:null,itemCategory:null,itemDescription:null});
async function stock(f,owner,name,quantity=1,category="supply") {
  let storage=await f.one(`select id from public.rpg_storages
    where campaign_id=$1 and entity_id=$2 order by id limit 1`,[f.cid,owner]);
  if(!storage){storage={id:randomUUID()};await f.one(`insert into public.rpg_storages
    (id,campaign_id,name,kind,entity_id,revision) values($1,$2,'Market stock','merchant',$3,1)`,
    [storage.id,f.cid,owner]);}
  const id=randomUUID();await f.one(`insert into public.rpg_items
    (id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,revision)
    values($1,$2,$3,$4,$5,'Ordinary public supplies.','',$6,$7,1)`,
    [id,f.cid,name,category,quantity,owner,storage.id]);return id;
}
const balance=async(f,hero)=>Number((await f.one(`select resources->>'currency_silver' n
  from public.rpg_entities where id=$1`,[hero])).n??0);

test("populated 46 → 47 → 48 preserves old row content and an immutable pre47 save",async()=>{
  const f=await fixture(46);
  try{
    const w=await world(f);
    const saved=await f.saves(w.cid,"create",await f.command(w.cid,
      {kind:"manual",name:"Before ordered effects"}));
    const save=saved.snapshot.saves.find(s=>s.name==="Before ordered effects");
    const before=await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(s) order by id) from rpg_private.save_points s) saves,
      (select jsonb_agg(to_jsonb(v) order by id) from rpg_private.timeline_versions v) versions`);
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610070047_astra_bounded_effects.sql",import.meta.url),"utf8"));
    await f.db.exec(await readFile(migration,"utf8"));
    assert.deepEqual(await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(s) order by id) from rpg_private.save_points s) saves,
      (select jsonb_agg(to_jsonb(v) order by id) from rpg_private.timeline_versions v) versions`),before);
    await f.saves(w.cid,"load",await f.command(w.cid,
      {saveId:save.id,label:"Old authority",recovery:false}));
  }finally{await f.db.close();}
});

test("reward then purchase composes the same currency row once with original revision",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try{
    const rope=await stock(f,npc,"rope");
    const heroBefore=await f.one(`select revision from public.rpg_entities where id=$1`,[hero]);
    const beforeWorld=await f.one(`select world from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    const r=await turn("My two silver; I'll spend one on the rope.",[
      grant(hero,npc),{kind:"mundane_purchase",sellerId:npc,recipientId:hero,
        itemId:rope,quantity:1,currencyName:"silver",price:1}],ctx=>{
        assert.match(ctx.input,/effectsOutcome/);return "Two silver received; one spent on the rope.";});
    assert.equal(r.result.status,"committed",JSON.stringify(errors));
    assert.equal(await balance(f,hero),1);
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,[rope])).owner_entity_id,hero);
    const row=await f.one(`select astra_ordered_effects from rpg_private.turns where id=$1`,[r.input.operationId]);
    const heroChanges=row.astra_ordered_effects.resolution.changes.filter(c=>c.family==="entities"&&c.id===hero);
    assert.equal(heroChanges.length,1);assert.equal(heroChanges[0].expectedRevision,heroBefore.revision);
    assert.equal(heroChanges[0].values.resources.currency_silver,1);
    assert.deepEqual(await f.one(`select world from rpg_private.world_foundations where campaign_id=$1`,[f.cid]),beforeWorld);
    await r.store.begin(r.input,"astra-primary-v1");await r.store.getPublic(f.cid,r.input.operationId);
    assert.equal(await balance(f,hero),1);
    const saved=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Ordered pay"}));
    await f.saves(f.cid,"load",await f.command(f.cid,{saveId:saved.snapshot.saves.find(s=>s.name==="Ordered pay").id,
      label:"Ordered replay",recovery:false}));assert.equal(await balance(f,hero),1);
  }finally{await f.db.close();}
});

test("job completion then reward uses the earlier completed shadow status and cannot repay",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try{
    const offer=await turn("I accept the crate job.",[{kind:"job_offer",issuerId:npc,
      title:"Pack crates",description:"Pack the crates.",currencyName:"silver",currencyAmount:2,
      itemName:"vegetables",itemCategory:"food",itemDescription:null}],()=>"Agreed.");
    assert.equal(offer.result.status,"committed",JSON.stringify(errors));
    const q=await f.one(`select id from public.rpg_quests where campaign_id=$1`,[f.cid]);
    const paid=await turn("The crates are packed; my pay please.",[
      {kind:"job_complete",questId:q.id},{kind:"job_reward",questId:q.id,recipientId:hero}],()=>"Paid two silver and vegetables.");
    assert.equal(paid.result.status,"committed",JSON.stringify(errors));assert.equal(await balance(f,hero),2);
    assert.equal((await f.one(`select status,reward_operation_id from public.rpg_quests where id=$1`,[q.id])).reward_operation_id,paid.input.operationId);
    const replay=await turn("Pay again.",[{kind:"job_reward",questId:q.id,recipientId:hero}],ctx=>{
      assert.match(ctx.input,/not_authorized/);return "That job has already been paid.";});
    assert.equal(replay.result.status,"committed",JSON.stringify(errors));assert.equal(await balance(f,hero),2);
  }finally{await f.db.close();}
});

test("sale then purchase composes both actors' balances without a second ledger",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try{
    await turn("A silver gift.",[grant(hero,npc,1)],()=>"One silver.");
    await f.one(`update public.rpg_entities set resources=resources||'{"currency_silver":10}'::jsonb where id=$1`,[npc]);
    const sword=await stock(f,hero,"sword",1,"weapon"),bread=await stock(f,npc,"bread",1,"food");
    const result=await turn("Sell my sword for three and buy the bread for one.",[
      {kind:"mundane_sale",sellerId:hero,buyerId:npc,itemId:sword,quantity:1,currencyName:"silver",price:3},
      {kind:"mundane_purchase",sellerId:npc,recipientId:hero,itemId:bread,quantity:1,currencyName:"silver",price:1}],()=>"The exchange leaves you with bread and three silver.");
    assert.equal(result.result.status,"committed",JSON.stringify(errors));assert.equal(await balance(f,hero),3);
    assert.equal(await balance(f,npc),8);
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,[sword])).owner_entity_id,npc);
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,[bread])).owner_entity_id,hero);
  }finally{await f.db.close();}
});

test("compatible resource deltas compose and a contradictory overspend is omitted",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver();
  try{
    const r=await turn("Receive two silver and spend one.",[grant(hero,npc),
      {kind:"mechanic_actions",actions:[{kind:"resource.spend",entityId:hero,resource:"currency_silver",amount:1}],restSafety:null},
      {kind:"mechanic_actions",actions:[{kind:"resource.spend",entityId:hero,resource:"currency_silver",amount:5}],restSafety:null}],ctx=>{
        assert.match(ctx.input,/not_authorized/);return "One silver remains. Five more cannot be spent.";});
    assert.equal(r.result.status,"committed",JSON.stringify(errors));assert.equal(await balance(f,hero),1);
    const bundle=(await f.one(`select astra_ordered_effects b from rpg_private.turns where id=$1`,[r.input.operationId])).b;
    assert.deepEqual(bundle.indices,[0,1]);assert.equal(bundle.rejected[0].index,2);
  }finally{await f.db.close();}
});

test("lazy currency and earned progression share one validated final mechanics state",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver(48,true);
  try{
    const initial=await f.one(`select loop_state,world from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    const state=initial.loop_state;
    const r=await turn("Payment and earned fieldcraft practice.",[grant(hero,npc),
      {kind:"progression_award",recipientId:hero,trackId:"fieldcraft",amount:3},
      {kind:"mechanic_actions",actions:[{kind:"resource.spend",entityId:hero,
        resource:"currency_silver",amount:1}],restSafety:null}],()=>"Payment, one silver spent, and earned progress.");
    assert.equal(r.result.status,"committed",JSON.stringify(errors));assert.equal(await balance(f,hero),1);
    const after=await f.one(`select loop_state,world from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.equal(after.loop_state.currencies.find(c=>c.label==="silver").resourceKey,"currency_silver");
    assert.equal(after.loop_state.progress.find(p=>p.entityId===hero&&p.trackId==="fieldcraft").value,5);
    assert.deepEqual(after.loop_state.tracks,state.tracks);assert.deepEqual(after.world,initial.world);
  }finally{await f.db.close();}
});

test("migration47 committed effect receipt and its save remain on their exact original path",async()=>{
  const {f,hero,npc,turn,errors}=await takenOver(47);
  try{
    const old=await turn("An agreed old gift.",[grant(hero,npc)],()=>"Two silver received.");
    assert.equal(old.result.status,"committed",JSON.stringify(errors));
    const before=await f.one(`select astra_effects from rpg_private.turns where id=$1`,[old.input.operationId]);
    assert.equal(before.astra_effects.schemaVersion,1);
    const saved=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Migration47 receipt"}));
    await f.db.exec(await readFile(migration,"utf8"));
    assert.deepEqual(await f.one(`select astra_effects from rpg_private.turns where id=$1`,[old.input.operationId]),before);
    assert.equal((await f.one(`select astra_ordered_effects from rpg_private.turns where id=$1`,[old.input.operationId])).astra_ordered_effects,null);
    await f.saves(f.cid,"load",await f.command(f.cid,{saveId:saved.snapshot.saves.find(s=>s.name==="Migration47 receipt").id,
      label:"Migration47 restored",recovery:false}));
    assert.equal(await balance(f,hero),2);
    assert.deepEqual(await f.one(`select astra_effects from rpg_private.turns where id=$1`,[old.input.operationId]),before);
  }finally{await f.db.close();}
});
