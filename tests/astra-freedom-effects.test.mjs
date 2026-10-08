import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";





const migration = new URL("../supabase/migrations/202610070047_astra_bounded_effects.sql", import.meta.url);

test("migration 47 adds only private bounded effects authority after migration 46", async () => {
  const f = await fixture(46);
  try {
    await f.db.exec(await readFile(migration, "utf8"));
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_campaigns`)).n, 0);
    assert.ok((await f.one(`select to_regprocedure(
      'rpg_private.astra_effects_assert(uuid,rpg_private.turns,jsonb,jsonb)') fn`)).fn);
    assert.equal((await f.one(`select has_function_privilege('authenticated',
      'rpg_private.astra_effects_assert(uuid,rpg_private.turns,jsonb,jsonb)',
      'EXECUTE') allowed`)).allowed, false);
  } finally { await f.db.close(); }
});

test("populated 46 to 47 keeps prior rows and old saves load without an effects receipt",async()=>{
  const f=await fixture(46);
  try {
    const campaign=await world(f);
    const saved=await f.saves(campaign.cid,"create",await f.command(campaign.cid,
      {kind:"manual",name:"Before effects migration"}));
    const save=saved.snapshot.saves.find((row)=>row.name==="Before effects migration");
    const before=await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id) from rpg_private.world_foundations w) world,
      (select jsonb_agg(to_jsonb(t) order by t.id) from rpg_private.turns t) turns,
      (select jsonb_agg(to_jsonb(s) order by s.id) from rpg_private.save_points s) saves`);
    await f.db.exec(await readFile(migration,"utf8"));
    const after=await f.one(`select
      (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e) entities,
      (select jsonb_agg(to_jsonb(w) order by w.campaign_id) from rpg_private.world_foundations w) world,
      (select jsonb_agg(to_jsonb(t)-'astra_effects' order by t.id) from rpg_private.turns t) turns,
      (select jsonb_agg(to_jsonb(s) order by s.id) from rpg_private.save_points s) saves`);
    assert.deepEqual(after,before);
    const restored=await f.saves(campaign.cid,"load",await f.command(campaign.cid,
      {saveId:save.id,label:"Old effects save",recovery:false}));
    assert.ok(restored.timelineId);
  } finally {await f.db.close();}
});

import { takenOver } from "./astra-freedom-fixture.mjs";

test("pure lodging fiction and optional unsupported effect do not require a durable mechanic",async()=>{
  const {f,errors,turn}=await takenOver();
  try {
    const before=await f.one(`select revision from rpg_private.runtime_state where campaign_id=$1`,[f.cid]);
    const pure=await turn("May I sleep in the loft tonight?",[],()=>"The seller agrees to let you use the loft.");
    assert.equal(pure.result.status,"committed",JSON.stringify(errors));
    const optional=await turn("Can I help tomorrow?",[
      {kind:"unsupported_optional",description:"No durable lodging mechanic"}],
      (ctx)=>{
        assert.match(ctx.input,/not_authorized/);
        return "You may ask again tomorrow; no lodging state changed.";
      },false,(ctx)=>assert.match(ctx.input,/loft/));
    assert.equal(optional.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_quests where campaign_id=$1`,[f.cid])).n,0);
    assert.ok((await f.one(`select revision from rpg_private.runtime_state where campaign_id=$1`,[f.cid])).revision>=before.revision);
  } finally {await f.db.close();}
});

test("agreed lodging can pass fictional time without fabricating rest recovery",async()=>{
  const {f,hero,errors,turn}=await takenOver();
  try {
    const agreement=await turn("May I sleep in the loft?",[],()=>
      "The seller allows you to use the loft tonight.");
    assert.equal(agreement.result.status,"committed",JSON.stringify(errors));
    const before=await f.one(`select r.world_minutes minutes,e.hp hp,e.resources resources
      from rpg_private.runtime_state r join public.rpg_entities e
      on e.campaign_id=r.campaign_id where r.campaign_id=$1 and e.id=$2`,[f.cid,hero]);
    const sleep=await turn("I sleep in the loft until morning.",[],()=>
      "Morning comes in the loft; no mechanical recovery was recorded.",false,
      (ctx)=>assert.match(ctx.input,/allows you to use the loft/),480);
    assert.equal(sleep.result.status,"committed",JSON.stringify(errors));
    const after=await f.one(`select r.world_minutes minutes,e.hp hp,e.resources resources
      from rpg_private.runtime_state r join public.rpg_entities e
      on e.campaign_id=r.campaign_id where r.campaign_id=$1 and e.id=$2`,[f.cid,hero]);
    assert.equal(after.minutes,before.minutes+480);
    assert.equal(after.hp,before.hp);
    assert.deepEqual(after.resources,before.resources);
  } finally {await f.db.close();}
});

test("payment, vegetables and a new job commit once while lodging remains fiction",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    const worldBefore=await f.one(`select world, (select count(*)::integer from rpg_private.world_events
      where campaign_id=$1) events from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    const effects=[{kind:"mundane_grant",issuerId:npc,recipientId:hero,
      currencyName:"silver",currencyAmount:2,itemName:"vegetables",
      itemCategory:"food",itemDescription:null},
      {kind:"job_offer",issuerId:npc,title:"Clear the cellar",
        description:"Return tomorrow to help with the cellar rats.",
        currencyName:"silver",currencyAmount:1,itemName:null,
        itemCategory:null,itemDescription:null},
      {kind:"unsupported_optional",description:"No persistent lodging permission"}];
    const committed=await turn("My pay, a loft tonight, and any work tomorrow?",effects,(ctx)=>{
      assert.match(ctx.input,/effectsOutcome/);
      assert.match(ctx.input,/not_authorized/);
      return "The seller pays two silver and gives you vegetables, offers the loft, and asks about the cellar rats tomorrow.";
    });
    assert.equal(committed.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='vegetables'`,[f.cid])).n,1);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_quests
      where campaign_id=$1 and title='Clear the cellar'`,[f.cid])).n,1);
    const after=await f.one(`select world, (select count(*)::integer from rpg_private.world_events
      where campaign_id=$1) events from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    assert.deepEqual(after,worldBefore);
    const replay=await committed.store.getPublic(f.cid,committed.input.operationId);
    assert.equal(replay.status,"committed");
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    const saved=await f.saves(f.cid,"create",await f.command(f.cid,
      {kind:"manual",name:"After bounded effects"}));
    const save=saved.snapshot.saves.find((row)=>row.name==="After bounded effects");
    assert.ok(save);
    await f.saves(f.cid,"load",await f.command(f.cid,
      {saveId:save.id,label:"Bounded effects restored",recovery:false}));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
    assert.ok((await f.one(`select astra_ordered_effects astra_effects from rpg_private.turns where id=$1`,
      [committed.input.operationId])).astra_effects);
    assert.doesNotMatch(JSON.stringify(replay),/astraEffects|astra_effects/);
  } finally {await f.db.close();}
});

test("a colliding newly created Item is omitted while its accepted predecessor commits",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    let narrations=0;
    const gift=(name)=>({kind:"mundane_grant",issuerId:npc,recipientId:hero,
      currencyName:"silver",currencyAmount:2,itemName:name,
      itemCategory:"food",itemDescription:null});
    const conflict=await turn("Give me two separate rewards.",
      [gift("vegetables"),gift("bread")],()=>{narrations++;return "Paid.";});
    assert.equal(conflict.result.status,"committed",JSON.stringify(errors));
    assert.equal(narrations,1);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name in ('vegetables','bread')`,[f.cid])).n,1);
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,"2");
  } finally {await f.db.close();}
});

test("foreign effect reference hard-fails while an individual unsupported reward can be omitted",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    const foreign=await turn("Ask someone elsewhere to pay me.",[
      {kind:"mundane_grant",issuerId:randomUUID(),recipientId:hero,
        currencyName:"silver",currencyAmount:2,itemName:null,
        itemCategory:null,itemDescription:null}],()=>"No payment is recorded.");
    assert.equal(foreign.result.status,"failed",JSON.stringify(errors));
    const invalid=await turn("Ask this seller for far too much silver.",[
      {kind:"mundane_grant",issuerId:npc,recipientId:hero,
        currencyName:"silver",currencyAmount:200,itemName:null,
        itemCategory:null,itemDescription:null}],(ctx)=>{
      assert.match(ctx.input,/not_authorized/);
      return "The seller refuses the demand; no payment changes hands.";
    });
    assert.equal(invalid.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,null);
  } finally {await f.db.close();}
});

test("agreed sword sale moves the existing Item and currency exactly once",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    const currency=await turn("The seller gives me five silver.",[
      {kind:"mundane_grant",issuerId:npc,recipientId:hero,
        currencyName:"silver",currencyAmount:5,itemName:null,
        itemCategory:null,itemDescription:null}],()=>"Five silver change hands.");
    assert.equal(currency.result.status,"committed",JSON.stringify(errors));
    const sword=randomUUID();
    const heroStorage=await f.one(`select id from public.rpg_storages
      where campaign_id=$1 and entity_id=$2 and kind='player'`,[f.cid,hero]);
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'plain sword','weapon',1,'A plain sword.','Damage 3',$3,$4,1)`,
      [sword,f.cid,hero,heroStorage.id]);
    await f.one(`update public.rpg_entities set resources=resources||
      '{"currency_silver":5}'::jsonb,revision=revision+1 where id=$1`,[npc]);
    const negotiated=await turn("You offered two silver. Can you pay three for the sword?",[],()=>
      "The merchant raises the offer from two to three silver. The sword remains yours until you hand it over.");
    assert.equal(negotiated.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,
      [sword])).owner_entity_id,hero);
    const sold=await turn("I sell the plain sword for three silver.",[
      {kind:"mundane_sale",buyerId:npc,sellerId:hero,itemId:sword,
        quantity:1,currencyName:"silver",price:3}],(ctx)=>{
      assert.match(ctx.input,/mundane_sale/);
      return "The merchant takes the sword and pays three silver.";
    });
    assert.equal(sold.result.status,"committed",JSON.stringify(errors));
    const soldItem=await f.one(`select owner_entity_id,storage_id from public.rpg_items
      where id=$1`,[sword]);
    assert.equal(soldItem.owner_entity_id,npc);
    assert.deepEqual(await f.one(`select kind,entity_id from public.rpg_storages
      where id=$1`,[soldItem.storage_id]),{kind:"merchant",entity_id:npc});
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"8");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[npc])).n,"2");
    assert.equal((await sold.store.getPublic(f.cid,sold.input.operationId)).status,"committed");
    assert.equal((await sold.store.begin(sold.input,"astra-primary-v1")).status,
      "committed");
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"8");
    const rope=randomUUID();
    await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
      quantity,description,mechanics,owner_entity_id,storage_id,revision)
      values($1,$2,'rope','supply',1,'Plain rope.','',$3,$4,1)`,
      [rope,f.cid,hero,heroStorage.id]);
    const combined=await turn("I sell the rope for one silver and agree to deliver bread tomorrow.",[
      {kind:"mundane_sale",buyerId:npc,sellerId:hero,itemId:rope,
        quantity:1,currencyName:"silver",price:1},
      {kind:"job_offer",issuerId:npc,title:"Deliver bread",
        description:"Bring bread to the merchant tomorrow.",
        currencyName:"silver",currencyAmount:1,itemName:null,
        itemCategory:null,itemDescription:null}],()=>
      "The merchant pays one silver for the rope. You agree to bring bread tomorrow.");
    assert.equal(combined.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,
      [rope])).owner_entity_id,npc);
    assert.equal((await f.one(`select resources->>'currency_silver' n
      from public.rpg_entities where id=$1`,[hero])).n,"9");
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_quests
      where campaign_id=$1 and title='Deliver bread'`,[f.cid])).n,1);
  } finally {await f.db.close();}
});

test("mundane craft consumes exact ingredients and records a provenance Item",async()=>{
  const {f,hero,errors,turn}=await takenOver();
  try {
    const storage=await f.one(`select id from public.rpg_storages where
      campaign_id=$1 and entity_id=$2 and kind='player'`,[f.cid,hero]);
    const cloth=randomUUID(),wood=randomUUID();
    for (const [id,name] of [[cloth,"cloth"],[wood,"wood"]])
      await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
        quantity,description,mechanics,owner_entity_id,storage_id,revision)
        values($1,$2,$3,'supply',2,$3,'',$4,$5,1)`,
        [id,f.cid,name,hero,storage.id]);
    const made=await turn("I bind cloth to wood to make a mundane torch.",[
      {kind:"mundane_craft",crafterId:hero,inputs:[
        {itemId:cloth,quantity:1},{itemId:wood,quantity:1}],
        itemName:"torch",itemCategory:"supply",itemDescription:null}],(ctx)=>{
      assert.match(ctx.input,/mundane_craft/);
      return "You tie cloth around the wood and make an ordinary torch.";
    });
    assert.equal(made.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select quantity from public.rpg_items where id=$1`,
      [cloth])).quantity,1);
    assert.equal((await f.one(`select quantity from public.rpg_items where id=$1`,
      [wood])).quantity,1);
    const output=await f.one(`select id,mechanics,quantity from public.rpg_items
      where campaign_id=$1 and name='torch'`,[f.cid]);
    assert.equal(output.quantity,1); assert.equal(output.mechanics,"");
    assert.deepEqual((await f.one(`select "outputItemIds" output from public.rpg_provenance
      where campaign_id=$1 and operation_id=$2`,[f.cid,made.input.operationId])).output,[output.id]);
    const saved=await f.saves(f.cid,"create",await f.command(f.cid,
      {kind:"manual",name:"After mundane crafting"}));
    const save=saved.snapshot.saves.find((row)=>row.name==="After mundane crafting");
    await f.saves(f.cid,"load",await f.command(f.cid,
      {saveId:save.id,label:"Craft restored",recovery:false}));
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and name='torch'`,[f.cid])).n,1);
    assert.equal((await f.one(`select astra_ordered_effects#>>'{effects,0,kind}' kind
      from rpg_private.turns where id=$1`,[made.input.operationId])).kind,
      "mundane_craft");
  } finally {await f.db.close();}
});

test("item-for-item barter transfers both existing Items without minting currency",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    const heroStorage=await f.one(`select id from public.rpg_storages where
      campaign_id=$1 and entity_id=$2 and kind='player'`,[f.cid,hero]);
    const npcStorage=randomUUID(),rope=randomUUID(),bread=randomUUID();
    await f.one(`insert into public.rpg_storages(id,campaign_id,name,kind,
      entity_id,revision) values($1,$2,'NPC provisions','companion',$3,1)`,
      [npcStorage,f.cid,npc]);
    for(const [id,name,owner,storage] of [
      [rope,"rope",hero,heroStorage.id],[bread,"bread",npc,npcStorage]])
      await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
        quantity,description,mechanics,owner_entity_id,storage_id,revision)
        values($1,$2,$3,'supply',1,$3,'',$4,$5,1)`,
        [id,f.cid,name,owner,storage]);
    const before=await f.one(`select resources from public.rpg_entities where id=$1`,[hero]);
    const exchanged=await turn("I trade my rope for your bread.",[
      {kind:"item_exchange",playerId:hero,counterpartyId:npc,
        giveItemId:rope,giveQuantity:1,receiveItemId:bread,receiveQuantity:1}],
      (ctx)=>{assert.match(ctx.input,/givenItem/);
        return "The merchant accepts the rope and hands you bread.";});
    assert.equal(exchanged.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,
      [rope])).owner_entity_id,npc);
    assert.equal((await f.one(`select owner_entity_id from public.rpg_items where id=$1`,
      [bread])).owner_entity_id,hero);
    assert.deepEqual(await f.one(`select resources from public.rpg_entities where id=$1`,
      [hero]),before);
    assert.equal((await exchanged.store.getPublic(f.cid,exchanged.input.operationId)).status,
      "committed");
    const cloth=randomUUID(),grain=randomUUID();
    for(const [id,name,owner,storage] of [
      [cloth,"cloth",hero,heroStorage.id],[grain,"grain",npc,npcStorage]])
      await f.one(`insert into public.rpg_items(id,campaign_id,name,category,
        quantity,description,mechanics,owner_entity_id,storage_id,revision)
        values($1,$2,$3,'supply',2,$3,'',$4,$5,1)`,
        [id,f.cid,name,owner,storage]);
    const split=await turn("One cloth for one grain.",[
      {kind:"item_exchange",playerId:hero,counterpartyId:npc,
        giveItemId:cloth,giveQuantity:1,receiveItemId:grain,receiveQuantity:1}],
      ()=>"Each of you trades one Item.");
    assert.equal(split.result.status,"committed",JSON.stringify(errors));
    assert.equal((await f.one(`select quantity from public.rpg_items where id=$1`,
      [cloth])).quantity,1);
    assert.equal((await f.one(`select quantity from public.rpg_items where id=$1`,
      [grain])).quantity,1);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and owner_entity_id=$2 and name='grain'`,[f.cid,hero])).n,1);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_items
      where campaign_id=$1 and owner_entity_id=$2 and name='cloth'`,[f.cid,npc])).n,1);
  } finally {await f.db.close();}
});

test("a failed pre-commit effect bundle changes no currency, Item, Quest or World history",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    const before=await f.one(`select
      (select count(*)::integer from public.rpg_items where campaign_id=$1) items,
      (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select resources from public.rpg_entities where id=$2) resources`,[f.cid,hero]);
    const failed=await turn("Accept the reward and job.",[
      {kind:"mundane_grant",issuerId:npc,recipientId:hero,
        currencyName:"silver",currencyAmount:2,itemName:"bread",
        itemCategory:"food",itemDescription:null},
      {kind:"job_offer",issuerId:npc,title:"Carry crates",
        description:"Carry two crates tomorrow.",currencyName:"silver",
        currencyAmount:1,itemName:null,itemCategory:null,itemDescription:null}],
      ()=>"The shopkeeper offers work.",true);
    assert.equal(failed.result.status,"failed",JSON.stringify(errors));
    const after=await f.one(`select
      (select count(*)::integer from public.rpg_items where campaign_id=$1) items,
      (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select resources from public.rpg_entities where id=$2) resources`,[f.cid,hero]);
    assert.deepEqual(after,before);
  } finally {await f.db.close();}
});

test("seven proposed effects exceed the hard cap before narration",async()=>{
  const {f,turn}=await takenOver();
  try {
    let narrated=false;
    const result=await turn("Seven separate favors, please.",
      Array.from({length:7},(_,index)=>({kind:"unsupported_optional",
        description:`Unrecorded favor ${index}`})),()=>{
        narrated=true;return "All seven are granted.";
      });
    assert.equal(result.result.status,"failed");
    assert.equal(narrated,false);
  } finally {await f.db.close();}
});

test("a later SQL failure rolls back an earlier validated currency effect",async()=>{
  const {f,hero,npc,errors,turn}=await takenOver();
  try {
    await f.db.exec(`create function public.freedom_test_reject_quest()
      returns trigger language plpgsql as $$ begin
        raise exception 'synthetic second-effect failure';
      end $$;
      create trigger freedom_test_reject_quest before insert on public.rpg_quests
      for each row execute function public.freedom_test_reject_quest();`);
    const before=await f.one(`select loop_state from rpg_private.world_foundations
      where campaign_id=$1`,[f.cid]);
    const failed=await turn("My silver and a new job.",[
      {kind:"mundane_grant",issuerId:npc,recipientId:hero,
        currencyName:"silver",currencyAmount:2,itemName:null,
        itemCategory:null,itemDescription:null},
      {kind:"job_offer",issuerId:npc,title:"Carry crates",
        description:"Carry the crates tomorrow.",currencyName:"silver",
        currencyAmount:1,itemName:null,itemCategory:null,itemDescription:null}],
      ()=>"The merchant pays and offers a job.");
    assert.equal(failed.result.status,"failed",JSON.stringify(errors));
    assert.ok(errors.some((error)=>error.action==="commit" &&
      error.message.includes("synthetic second-effect failure")));
    assert.equal((await f.one(`select resources->>'currency_silver' balance
      from public.rpg_entities where id=$1`,[hero])).balance,null);
    assert.equal((await f.one(`select count(*)::integer n from public.rpg_quests
      where campaign_id=$1`,[f.cid])).n,0);
    assert.deepEqual(await f.one(`select loop_state from rpg_private.world_foundations
      where campaign_id=$1`,[f.cid]),before);
  } finally {await f.db.close();}
});
