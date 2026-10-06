import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { worldLogicTurnPreparer, worldTurnPreparer } from "../src/lib/production/turn-world.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { preflightMemory } from "../src/lib/memory/lifecycle.ts";

const example = { ...examples.fantasy, description: "I carry a longsword. I know navigation and careful observation. I cannot cast spells.",
  item: "longsword", npc: "The innkeeper",
  location: "Inn doorway", situation: "The innkeeper stands in the doorway.",
  narration: "The innkeeper stands in the doorway." };

async function harness(npcAction = "attack", npcDescription = "The innkeeper swings back.", options = {}) {
  const f = await setup(example, "en", 36);
  await f.create();
  await f.startOpening();
  const combat = async (action, payload = {}) => (await f.one(
    "select public.rpg_combat_readiness($1,$2,$3,$4::jsonb) result",
    [f.owner, f.cid, action, JSON.stringify(payload)])).result;
  const proposal = await combat("inspect");
  await combat("confirm", { requestId: randomUUID(), proposal,
    player: { hp: proposal.hero.hp === null ? 10 : null,
      attack: proposal.hero.attack === null ? 20 : null,
      defense: proposal.hero.defense === null ? 10 : null,
      skill: proposal.hero.skill === null ? 0 : null },
    weaponIndex: 1, weaponDamage: 2 });
  const npc = (await f.snapshot()).entities.find((row) => row.kind === "npc");
  await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}','1'::jsonb),revision=revision+1 where id=$1",[npc.id]);
  if (options.npcHp !== undefined)
    await f.one("update public.rpg_entities set hp=$2,revision=revision+1 where id=$1",[npc.id,options.npcHp]);
  if (options.heroDefense !== undefined)
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}',to_jsonb($2::integer)),revision=revision+1 where id=$1",[f.hero,options.heroDefense]);
  const sword = (await f.snapshot()).items.find((row) => row.name === "longsword");
  const runtime = async (a) => {
    try { return { data: await f.runtime(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline) }; }
    catch (e) { if (process.env.RPG_DEBUG_COMBAT === "1") console.error("runtime",a.p_action,{code:e.code,message:e.message,internalQuery:e.internalQuery,where:e.where}); return { error: { code:e.code,message:e.message } }; }
  };
  const world = async (a) => {
    try { return { data: (await f.one("select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [a.p_owner_id,a.p_campaign_id,a.p_action,JSON.stringify(a.p_payload),JSON.stringify(a.p_timeline)])).result }; }
    catch (e) { return { error: { code:e.code,message:e.message } }; }
  };
  const store = createRpcTurnStore(f.owner,runtime,"gpt-6-astra",await f.fence(f.cid));
  let narratorCalls=0, npcCalls=0;
  const deps={store,
    provider:{plan:()=>assert.fail("dm.plan"),feedback:()=>assert.fail("feedback"),narrate:async()=>{
      narratorCalls++; return {usage,output:{narration:"The sword lands; the innkeeper responds, and the fight continues.",visualDescription:"",clarification:null}};}},
    prepareWorldLogic:worldLogicTurnPreparer(world,{action:async(i)=>({usage,output:{schemaVersion:4,
      input:i.input.input,actorId:f.hero,targetId:npc.id,
      method:options.playerIntent?.(i.input.input) ?? "attack",
      itemId:(options.playerIntent?.(i.input.input) ?? "attack")==="attack"?sword.id:null,
      equipmentName:(options.playerIntent?.(i.input.input) ?? "attack")==="attack"?sword.name:null}})}),
    prepareWorld:worldTurnPreparer(world),
    prepareCombatIntent:async(decision)=>{npcCalls++; assert.deepEqual(decision.actorsToDecide,[npc.id]);
      return {usage,output:[{actorId:npc.id,action:npcAction,targetId:npcAction==="attack"||npcAction==="attempt"?f.hero:null,
        itemId:options.npcItemId??null,position:npcAction==="move"?"cover":null,description:npcDescription}]};},
  };
  return {f,store,deps,npc,sword,get narratorCalls(){return narratorCalls;},get npcCalls(){return npcCalls;}};
}

async function submit(h,text="I attack innkeeper with my sword") {
  const play=await h.store.readPlay(h.f.cid);
  const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision,
    mode:"game",input:text,companionId:null,listenerIds:[],mechanic:null};
  const first=await runTurn(input,h.deps);
  assert.equal(first.status,"awaiting_confirmation");
  assert.equal(first.checks.length,1);
  const after=await resumeTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
    timeline:input.timeline,action:"continue",checkId:null},h.deps);
  return {input,after};
}

test("retry before player confirmation preserves the visible roll and starts no NPC action",async()=>{
  const h=await harness("attack","The innkeeper retaliates.");
  try {
    const play=await h.store.readPlay(h.f.cid);
    const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision,
      mode:"game",input:"I attack innkeeper with my sword",companionId:null,listenerIds:[],mechanic:null};
    const first=await runTurn(input,h.deps);
    const retry=await runTurn(input,h.deps);
    assert.equal(first.status,"awaiting_confirmation");
    assert.equal(retry.status,"awaiting_confirmation");
    assert.deepEqual(retry.checks,first.checks);
    assert.equal(h.npcCalls,0);
    const after=await resumeTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
      timeline:input.timeline,action:"continue",checkId:null},h.deps);
    assert.equal(after.status,"committed");
    assert.equal(h.npcCalls,1);
  } finally {await h.f.db.close();}
});

test("natural sword action commits one whole exchange and returns the next turn to the player",async()=>{
  const h=await harness("attack","The innkeeper swings back.",{
    playerIntent:(text)=>text.startsWith("I smack")?"improvise":"attack"});
  try {
    const {input,after}=await submit(h);
    assert.equal(after.status,"committed");
    assert.equal(h.narratorCalls,1);
    assert.equal(h.npcCalls,1);
    const current=await h.store.readPlay(h.f.cid);
    assert.equal(current.encounters.find((row)=>row.status==="active").round,2);
    const hero=current.participants.find((row)=>row.entity_id===h.f.hero);
    assert.equal(hero.public_resources.active,true);
    assert.equal(hero.public_resources.action,1);
    assert.equal(hero.public_resources.move,1);
    assert.equal((await h.f.snapshot()).entities.find((row)=>row.id===h.npc.id).hp,6);
    assert.equal((await h.f.one("select count(*)::integer n from public.rpg_scenes where campaign_id=$1 and role='narration' and body like 'The sword lands%'",[h.f.cid])).n,1);
    const retry=await runTurn(input,h.deps);
    assert.equal(retry.status,"committed");
    assert.equal(h.npcCalls,1);
    const second=await submit(h,"I smack his head on nearest table");
    assert.equal(second.after.status,"committed");
    assert.equal((await h.store.readPlay(h.f.cid)).encounters.find((row)=>row.status==="active").round,3);
    const timeline=await h.f.fence(h.f.cid);
    const memory=createRpcMemoryStore(h.f.owner,async(args)=>({
      data:await h.f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline),
    }),timeline);
    const round3=await h.store.readPlay(h.f.cid);
    const next={operationId:randomUUID(),campaignId:h.f.cid,timeline,
      expectedRevision:round3.revision,mode:"game",
      input:"i jump on top of nearest table to get advantage and strike innkeeper with my sword",
      companionId:null,listenerIds:[],mechanic:null};
    let summaryCalls=0;
    await preflightMemory(next,memory,{summarize:async()=>{
      summaryCalls++; throw Error("No provider is needed for the context regression");
    }},"gpt-6-astra");
    assert.equal(summaryCalls,0);
    assert.equal((await h.store.begin(next)).status,"pending");
  } finally {await h.f.db.close();}
});

for (const [kind,position,checkCount] of [
  ["defend",null,0],["move","cover",0],["attempt",null,1],["end-turn",null,0],
]) test(`bounded NPC ${kind} uses the existing encounter interpreter`,async()=>{
  const h=await harness(kind,`The innkeeper chooses to ${kind}.`);
  try {
    const {input,after}=await submit(h);
    assert.equal(after.status,"committed");
    const row=await h.f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(row.checks.length,checkCount);
    const play=await h.store.readPlay(h.f.cid);
    assert.equal(play.participants.find((p)=>p.entity_id===h.npc.id).public_position.position,position??"nearby");
    assert.equal(play.participants.find((p)=>p.entity_id===h.f.hero).public_resources.active,true);
    assert.equal((await h.f.snapshot()).entities.find((e)=>e.id===h.f.hero).hp,10);
  } finally {await h.f.db.close();}
});

test("defeated innkeeper cannot retaliate and the encounter ends",async()=>{
  const h=await harness("attack","The innkeeper tries to retaliate.",{npcHp:2});
  try {
    const {after}=await submit(h);
    assert.equal(after.status,"committed");
    assert.equal(h.npcCalls,0);
    assert.equal((await h.store.readPlay(h.f.cid)).encounters.at(-1).status,"ended");
  } finally {await h.f.db.close();}
});

for (const [label,defense,hp] of [["hit",1,8],["miss",100,10]])
  test(`NPC attack ${label} uses a private server roll and exact HP`,async()=>{
    const h=await harness("attack","The innkeeper retaliates.",{heroDefense:defense});
    try {
      const {input,after}=await submit(h);
      assert.equal(after.status,"committed");
      const turn=await h.f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId]);
      assert.equal(turn.checks.length,1);
      assert.equal(turn.checks[0].visibility,"private");
      assert.equal(turn.checks[0].success,label==="hit");
      assert.equal((await h.f.snapshot()).entities.find((e)=>e.id===h.f.hero).hp,hp);
      assert.equal(after.checks.length,1);
    } finally {await h.f.db.close();}
  });

test("NPC may select only its already equipped approved weapon without transferring it",async()=>{
  const club=randomUUID(), storage=randomUUID();
  const h=await harness("attack","The innkeeper swings an old club.",{heroDefense:1,npcItemId:club});
  try {
    await h.f.one("insert into public.rpg_storages(id,campaign_id,name,kind,entity_id,revision) values($1,$2,'Innkeeper gear','companion',$3,1)",[storage,h.f.cid,h.npc.id]);
    await h.f.one("insert into public.rpg_items(id,campaign_id,name,category,quantity,description,mechanics,owner_entity_id,storage_id,equipped_entity_id,equipped_slot,revision) values($1,$2,'Old club','weapon',1,'An old club.','',$3,$4,$3,'hand',1)",[club,h.f.cid,h.npc.id,storage]);
    await h.f.one("update rpg_private.runtime_state set configuration=jsonb_set(configuration,'{itemRules}',(configuration->'itemRules')||$2::jsonb) where campaign_id=$1",[h.f.cid,JSON.stringify([{itemId:club,tag:"weapon",damage:3}])]);
    const original=h.deps.prepareCombatIntent;
    h.deps.prepareCombatIntent=async(decision)=>{
      assert.deepEqual(decision.participants.find((row)=>row.entityId===h.npc.id).weapons,[{id:club,name:"Old club",damage:3}]);
      return original(decision);
    };
    const {after}=await submit(h);
    assert.equal(after.status,"committed");
    assert.equal((await h.f.snapshot()).entities.find((row)=>row.id===h.f.hero).hp,7);
    const item=(await h.f.snapshot()).items.find((row)=>row.id===club);
    assert.equal(item.owner_entity_id,h.npc.id);
    assert.equal(item.quantity,1);
  } finally {await h.f.db.close();}
});

test("spent player Action safely advances the existing encounter and returns control",async()=>{
  const h=await harness("end-turn","The innkeeper holds back.");
  try {
    assert.equal((await submit(h)).after.status,"committed");
    const play=await h.store.readPlay(h.f.cid);
    const hero=play.participants.find((p)=>p.entity_id===h.f.hero);
    await h.f.one("update public.rpg_encounter_participants set public_resources=jsonb_set(public_resources,'{action}','0'::jsonb) where id=$1",[hero.id]);
    const fresh=await h.store.readPlay(h.f.cid);
    const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:fresh.timeline,expectedRevision:fresh.revision,
      mode:"game",input:"I smack his head on nearest table",companionId:null,listenerIds:[],mechanic:null};
    const result=await runTurn(input,h.deps);
    assert.equal(result.status,"committed");
    assert.equal(result.checks.length,0);
    const exchange=await h.f.one("select checkpoint->'combatExchange' exchange from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(exchange.exchange.resumeOnly,true);
    const after=await h.store.readPlay(h.f.cid);
    assert.equal(after.encounters.find((row)=>row.status==="active").round,3);
    assert.equal(after.participants.find((p)=>p.entity_id===h.f.hero).public_resources.action,1);
    assert.equal(after.participants.find((p)=>p.entity_id===h.f.hero).public_resources.active,true);
    assert.equal((await h.f.snapshot()).entities.find((e)=>e.id===h.npc.id).hp,6);
  } finally {await h.f.db.close();}
});

test("two consecutive autonomous participants share one bounded intent request",async()=>{
  const h=await harness("end-turn","The innkeeper holds back.");
  try {
    const traveler=randomUUID(), encounter=randomUUID();
    await h.f.one("insert into public.rpg_entities(id,campaign_id,kind,name,details,hp,max_hp,stats,resources,conditions,equipment_slots,revision) select $1,campaign_id,'npc','Road traveler',details,8,8,stats,resources,conditions,equipment_slots,1 from public.rpg_entities where id=$2",[traveler,h.npc.id]);
    await h.f.one("update rpg_private.runtime_state set configuration=jsonb_set(configuration,'{presentEntityIds}',(configuration->'presentEntityIds')||to_jsonb($2::text)) where campaign_id=$1",[h.f.cid,traveler]);
    const settings=(await h.f.one("select max(revision) r from public.rpg_settings_revisions where campaign_id=$1",[h.f.cid])).r;
    await h.f.one("insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',1,$3,'Encounter active.')",[encounter,h.f.cid,settings]);
    for (const [order,id,name] of [[0,h.f.hero,"Protagonist"],[1,h.npc.id,"The innkeeper"],[2,traveler,"Road traveler"]])
      await h.f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,$5,$6,'{\"position\":\"nearby\"}'::jsonb,$7::jsonb)",
        [randomUUID(),h.f.cid,encounter,id,name,order,JSON.stringify({action:1,move:1,reaction:1,active:order===0,defending:false,withdrawn:false,originalMaxHp:order===0?10:8})]);
    let calls=0;
    h.deps.prepareCombatIntent=async(decision)=>{
      calls++;
      assert.deepEqual(decision.actorsToDecide,[h.npc.id,traveler]);
      return {usage,output:decision.actorsToDecide.map((actorId)=>({actorId,action:"end-turn",targetId:null,itemId:null,position:null,description:"They hold their ground."}))};
    };
    const {after}=await submit(h);
    assert.equal(after.status,"committed");
    assert.equal(calls,1);
    const play=await h.store.readPlay(h.f.cid);
    assert.equal(play.encounters.find((row)=>row.status==="active").round,2);
    assert.equal(play.participants.find((p)=>p.entity_id===h.f.hero).public_resources.active,true);
    assert.equal(play.participants.filter((p)=>p.public_resources.active).length,1);
  } finally {await h.f.db.close();}
});

test("NPC defeat of the controlled player stops automatic continuation",async()=>{
  const h=await harness("attack","The innkeeper strikes hard.",{heroDefense:1});
  try {
    await h.f.one("update public.rpg_entities set hp=2,revision=revision+1 where id=$1",[h.f.hero]);
    const {after,input}=await submit(h);
    assert.equal(after.status,"committed");
    const hero=(await h.f.snapshot()).entities.find((e)=>e.id===h.f.hero);
    assert.ok(hero.hp<=1);
    assert.ok(hero.conditions.includes("dead")||hero.conditions.includes("withdrawn"));
    const turn=await h.f.one("select checkpoint#>'{combatExchange,actions}' actions from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(turn.actions.at(-1).action,"attack");
    assert.equal((await h.store.readPlay(h.f.cid)).encounters.find((row)=>row.status==="active").round,1);
  } finally {await h.f.db.close();}
});

for (const stage of ["intent","roll"]) test(`retry after durable NPC ${stage} reuses intent and dice`,async()=>{
  const h=await harness("attack","The innkeeper retaliates.",{heroDefense:1});
  try {
    const original=h.store.checkpoint;
    let interrupted=false;
    h.deps.store={...h.store,checkpoint:async(lease,checkpoint,status)=>{
      const result=await original(lease,checkpoint,status);
      const ex=checkpoint.combatExchange;
      if (!interrupted && ex?.npcIntents &&
        (stage==="intent" ? ex.npcChecks.length===0 : ex.npcChecks.length===1)) {
        interrupted=true;
        throw Error("synthetic process interruption after durable checkpoint");
      }
      return result;
    }};
    const play=await h.store.readPlay(h.f.cid);
    const input={operationId:randomUUID(),campaignId:h.f.cid,timeline:play.timeline,expectedRevision:play.revision,
      mode:"game",input:"I attack innkeeper with my sword",companionId:null,listenerIds:[],mechanic:null};
    assert.equal((await runTurn(input,h.deps)).status,"awaiting_confirmation");
    const first=await resumeTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
      timeline:input.timeline,action:"continue",checkId:null},h.deps);
    assert.equal(first.status,"failed");
    assert.equal(first.canRetry,true);
    const saved=await h.f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId]);
    const retry=await resumeTurn({commandId:randomUUID(),campaignId:h.f.cid,operationId:input.operationId,
      timeline:input.timeline,action:"retry",checkId:null},h.deps);
    assert.equal(retry.status,"committed");
    assert.equal(h.npcCalls,1);
    const after=await h.f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId]);
    if(stage==="roll") assert.deepEqual(after.checks,saved.checks);
    assert.equal(after.checks.length,1);
    assert.equal((await h.f.snapshot()).entities.find((e)=>e.id===h.f.hero).hp,8);
    assert.equal((await h.store.readPlay(h.f.cid)).encounters.find((row)=>row.status==="active").round,2);
  } finally {await h.f.db.close();}
});

test("SQL combat authority rejects hitchhiking rows, forged intent, dice, and campaign",async()=>{
  const h=await harness("attack","The innkeeper retaliates.",{heroDefense:1});
  try {
    const original=h.store.commit;
    let checked=false;
    h.deps.store={...h.store,commit:async(lease,packet)=>{
      const check=async(owner,campaign,p=packet)=>h.f.one(
        "select rpg_private.natural_combat_validate($1,$2,t,$4::jsonb) valid from rpg_private.turns t where id=$3",
        [owner,campaign,lease.operationId,JSON.stringify(p)]);
      assert.equal((await check(h.f.owner,h.f.cid)).valid,true);
      await assert.rejects(()=>check(h.f.owner,randomUUID()));
      const forged=structuredClone(packet);
      forged.resolution.changes.push({family:"items",id:randomUUID(),expectedRevision:null,values:{}});
      await assert.rejects(()=>check(h.f.owner,h.f.cid,forged));
      const forgedOutcome=structuredClone(packet);
      forgedOutcome.resolution.outcomes.at(-1).text="The model grants a secret condition.";
      await assert.rejects(()=>check(h.f.owner,h.f.cid,forgedOutcome));
      const saved=(await h.f.one("select checkpoint from rpg_private.turns where id=$1",[lease.operationId])).checkpoint;
      try {
        const inflated=structuredClone(saved);
        inflated.combatExchange.playerResolution.changes.find((change)=>change.family==="entities").values.hp=0;
        await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(inflated)]);
        await assert.rejects(()=>check(h.f.owner,h.f.cid));
        await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(saved)]);
        const extraAction=structuredClone(saved);
        extraAction.combatExchange.playerResolution.changes.find((change)=>change.family==="encounter_participants"&&change.values.public_resources.action===0).values.public_resources.action=1;
        await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(extraAction)]);
        await assert.rejects(()=>check(h.f.owner,h.f.cid));
        await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(saved)]);
        await h.f.one("update rpg_private.turns set checkpoint=jsonb_set(checkpoint,'{combatExchange,npcIntents,0,actorId}',to_jsonb($2::text)) where id=$1",[lease.operationId,h.f.hero]);
        await assert.rejects(()=>check(h.f.owner,h.f.cid));
        await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(saved)]);
        await h.f.one("update rpg_private.turns set checkpoint=jsonb_set(checkpoint,'{combatExchange,npcChecks,0,dice}','[21]'::jsonb) where id=$1",[lease.operationId]);
        await assert.rejects(()=>check(h.f.owner,h.f.cid));
      } finally {await h.f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(saved)]);}
      checked=true;
      return original(lease,packet);
    }};
    const {after}=await submit(h);
    assert.equal(after.status,"committed");
    assert.equal(checked,true);
  } finally {await h.f.db.close();}
});

test("populated disposable migration 35 to 36 preserves rows, saves, and Memory definitions",async()=>{
  const f=await setup(example,"en",35);
  try {
    await f.create();
    await f.startOpening();
    await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Before migration 36"}));
    const tables=await f.query("select schemaname,tablename from pg_tables where (schemaname='public' and tablename like 'rpg_%') or schemaname='rpg_private' order by schemaname,tablename");
    const fingerprints=async()=>{
      const result={};
      for(const {schemaname,tablename} of tables){
        assert.match(schemaname,/^[a-z_]+$/); assert.match(tablename,/^[a-z_]+$/);
        result[`${schemaname}.${tablename}`]=(await f.one(`select count(*)::integer n,md5(coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text)::text,'[]')) fingerprint from ${schemaname}.${tablename} t`));
      }
      return result;
    };
    const memory=()=>f.query("select p.proname,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname like 'memory_%' order by p.proname,p.oid");
    const triggers=()=>f.query("select tgname,pg_get_triggerdef(oid) definition from pg_trigger where tgname like '%memory%' order by tgname");
    const functions=()=>f.query("select n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')' signature,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','rpg_private') order by 1");
    const before=await fingerprints(), memoryBefore=await memory(), triggerBefore=await triggers();
    const functionsBefore=await functions();
    const savesBefore=await f.saves(f.cid,"read");
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610030036_natural_combat_exchange.sql",import.meta.url),"utf8"));
    assert.deepEqual(await fingerprints(),before);
    assert.deepEqual(await memory(),memoryBefore);
    assert.deepEqual(await triggers(),triggerBefore);
    const prior=new Map(functionsBefore.map((entry)=>[entry.signature,entry.definition]));
    const changed=(await functions()).filter((entry)=>prior.get(entry.signature)!==entry.definition).map((entry)=>entry.signature.split("(")[0]);
    assert.deepEqual(changed,[
      "public.rpg_runtime_phase2",
      "public.rpg_runtime_wave3",
      "rpg_private.natural_combat_validate",
      "rpg_private.timeline_stamp",
    ]);
    assert.deepEqual(await f.saves(f.cid,"read"),savesBefore);
    assert.equal((await f.one("select count(*)::integer n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname='natural_combat_validate'")).n,1);
  } finally {await f.db.close();}
});

test("save/load and timeline fork retain one resolved exchange",async()=>{
  const h=await harness("attack","The innkeeper retaliates.",{heroDefense:1});
  try {
    assert.equal((await submit(h)).after.status,"committed");
    const before=await h.f.snapshot(), playBefore=await h.store.readPlay(h.f.cid);
    const created=await h.f.saves(h.f.cid,"create",await h.f.command(h.f.cid,{kind:"manual",name:"Resolved exchange"}));
    const save=created.snapshot.saves.find((row)=>row.name==="Resolved exchange");
    assert.ok(save);
    const loaded=await h.f.saves(h.f.cid,"load",await h.f.command(h.f.cid,{saveId:save.id,label:"Combat branch",recovery:false}));
    assert.ok(loaded.timelineId);
    const after=await h.f.snapshot();
    const rebound=createRpcTurnStore(h.f.owner,async(a)=>{
      try{return {data:await h.f.runtime(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)};}
      catch(e){return {error:{code:e.code,message:e.message}};}
    },"gpt-6-astra",await h.f.fence(h.f.cid));
    const playAfter=await rebound.readPlay(h.f.cid);
    assert.deepEqual(after.entities,before.entities);
    assert.deepEqual(after.items,before.items);
    assert.equal(playAfter.encounters.find((row)=>row.status==="active").round,playBefore.encounters.find((row)=>row.status==="active").round);
    assert.equal(playAfter.participants.find((row)=>row.entity_id===h.f.hero).public_resources.action,1);
    assert.notEqual(playAfter.timeline.timelineId,playBefore.timeline.timelineId);
    assert.equal((await h.f.snapshot()).entities.find((e)=>e.id===h.f.hero).hp,8);
  } finally {await h.f.db.close();}
});
