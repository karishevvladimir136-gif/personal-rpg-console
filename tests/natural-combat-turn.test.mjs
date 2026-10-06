import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { worldLogicTurnPreparer, worldTurnPreparer } from "../src/lib/production/turn-world.ts";

const example = { ...examples.fantasy,
  description: "I carry a longsword. I know navigation and careful observation. I cannot cast spells.",
  item: "longsword", npc: "The innkeeper", location: "Inn doorway",
  situation: "The innkeeper stands nearby.", narration: "The innkeeper stands nearby." };

test("populated disposable migration 36 to 37 preserves rows, saves and Memory definitions", async () => {
  const f = await setup(example, "en", 36);
  try {
    await f.create(); await f.startOpening();
    const readiness=async(action,payload={})=>(await f.one(
      "select public.rpg_combat_readiness($1,$2,$3,$4::jsonb) result",
      [f.owner,f.cid,action,JSON.stringify(payload)])).result;
    const proposal=await readiness("inspect");
    await readiness("confirm",{requestId:randomUUID(),proposal,
      player:{hp:proposal.hero.hp===null?10:null,attack:proposal.hero.attack===null?2:null,
        defense:proposal.hero.defense===null?10:null,skill:proposal.hero.skill===null?1:null},
      weaponIndex:1,weaponDamage:2});
    const npc=(await f.snapshot()).entities.find((row)=>row.kind==="npc");
    const sword=(await f.snapshot()).items.find((row)=>row.name==="longsword");
    const runtime=async(args)=>{
      try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
      catch(error){return {error:{code:error.code,message:error.message}};}
    };
    const world=async(args)=>{
      try{return {data:(await f.one("select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
        [args.p_owner_id,args.p_campaign_id,args.p_action,JSON.stringify(args.p_payload),JSON.stringify(args.p_timeline)])).result};}
      catch(error){return {error:{code:error.code,message:error.message}};}
    };
    const store=createRpcTurnStore(f.owner,runtime,"gpt-6-astra",await f.fence(f.cid));
    let npcCalls=0;
    const deps={store,provider:{plan:()=>assert.fail("plan"),feedback:()=>assert.fail("feedback"),
      narrate:async()=>({usage,output:{narration:"Historical combat exchange.",visualDescription:"",clarification:null}})},
      prepareWorldLogic:worldLogicTurnPreparer(world,{action:async(input)=>({usage,output:{
        schemaVersion:4,input:input.input.input,actorId:f.hero,targetId:npc.id,
        method:"attack",itemId:sword.id,equipmentName:sword.name}})}),
      prepareWorld:worldTurnPreparer(world),
      prepareCombatIntent:async()=>{npcCalls++;return {usage,output:[{actorId:npc.id,
        action:"end-turn",targetId:null,itemId:null,position:null,description:"The innkeeper waits."}]};}};
    const play=await store.readPlay(f.cid);
    const historical={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"I strike him with my sword",
      companionId:null,listenerIds:[],mechanic:null};
    let committed=await runTurn(historical,deps);
    if(committed.status==="awaiting_confirmation")committed=await resumeTurn({commandId:randomUUID(),
      campaignId:f.cid,operationId:historical.operationId,timeline:historical.timeline,
      action:"continue",checkId:null},deps);
    assert.equal(committed.status,"committed");
    await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Before migration 37"}));
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
    const functionsBefore=await functions(), savesBefore=await f.saves(f.cid,"read");
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610050037_natural_combat_turn.sql",import.meta.url),"utf8"));
    assert.deepEqual(await fingerprints(),before);
    assert.deepEqual(await memory(),memoryBefore);
    assert.deepEqual(await triggers(),triggerBefore);
    assert.deepEqual(await f.saves(f.cid,"read"),savesBefore);
    const retry=await runTurn(historical,deps);
    assert.equal(retry.status,"committed");
    assert.equal(npcCalls,1);
    const prior=new Map(functionsBefore.map((entry)=>[entry.signature,entry.definition]));
    const changed=(await functions()).filter((entry)=>prior.get(entry.signature)!==entry.definition).map((entry)=>entry.signature.split("(")[0]);
    assert.deepEqual(changed,["public.rpg_runtime_phase2","public.rpg_runtime_wave3",
      "rpg_private.natural_combat_turn_validate","rpg_private.timeline_stamp"]);
    assert.equal((await f.one("select count(*)::integer n from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname='natural_combat_turn_validate'")).n, 1);
  } finally { await f.db.close(); }
});

test("fifteen natural combat turns preserve budgets, Memory and bounded outcomes", async () => {
  const f = await setup(example, "en", 37);
  try {
    await f.create(); await f.startOpening();
    const readiness = async (action, payload = {}) => (await f.one(
      "select public.rpg_combat_readiness($1,$2,$3,$4::jsonb) result",
      [f.owner, f.cid, action, JSON.stringify(payload)])).result;
    const proposal = await readiness("inspect");
    await readiness("confirm", { requestId: randomUUID(), proposal,
      player: { hp: proposal.hero.hp === null ? 10 : null,
        attack: proposal.hero.attack === null ? 2 : null,
        defense: proposal.hero.defense === null ? 10 : null,
        skill: proposal.hero.skill === null ? 1 : null },
      weaponIndex: 1, weaponDamage: 2 });
    const npc = (await f.snapshot()).entities.find((row) => row.kind === "npc");
    const sword = (await f.snapshot()).items.find((row) => row.name === "longsword");
    await f.one("update public.rpg_entities set hp=100,max_hp=100,revision=revision+1 where id in ($1,$2)", [f.hero,npc.id]);
    const timings=[];
    const timed=async(stage,fn)=>{
      const start=performance.now();
      try { return await fn(); }
      finally { timings.push({stage,ms:performance.now()-start}); }
    };
    const runtime = async (args) => {
      try { return { data: await timed(`runtime.${args.p_action}`,
        ()=>f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)) }; }
      catch (error) { if (process.env.RPG_DEBUG_COMBAT === "1") console.error("runtime",args.p_action,error);
        return { error: { code:error.code,message:error.message } }; }
    };
    const world = async (args) => {
      try { return { data: (await timed(`world.${args.p_action}`,
        ()=>f.one("select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
          [args.p_owner_id,args.p_campaign_id,args.p_action,JSON.stringify(args.p_payload),JSON.stringify(args.p_timeline)]))).result }; }
      catch (error) { return { error: { code:error.code,message:error.message } }; }
    };
    const store = createRpcTurnStore(f.owner,runtime,"gpt-6-astra",await f.fence(f.cid));
    const move=(position)=>({action:"move",targetId:null,itemId:null,equipmentName:null,position});
    const defend={action:"defend",targetId:null,itemId:null,equipmentName:null,position:null};
    const attack=(armed=true)=>({action:"attack",targetId:npc.id,itemId:armed?sword.id:null,
      equipmentName:armed?sword.name:null,position:null});
    const attempt={action:"attempt",targetId:npc.id,itemId:null,equipmentName:null,position:null};
    const turns=[
      {text:"I duck behind the bar and insult him",steps:[move("cover")],npc:"end-turn"},
      {text:"I raise my guard and tell him to come and get me",steps:[defend],npc:"attack"},
      {text:"I scream at him but do nothing",steps:[],npc:"defend"},
      {text:"I step around the table and strike him with my sword",steps:[move("nearby"),attack()],npc:"attempt"},
      {text:"I jump on the table to get advantage and slash him",steps:[attack()],npc:"move"},
      {text:"I kick him toward the wall",steps:[attempt],npc:"attack"},
      {text:"I shove him down, then stab him while prone",steps:[attempt],npc:"end-turn"},
      {text:"I strike with my sword",steps:[attack()],npc:"defend"},
      {text:"I step to cover and brace",steps:[move("cover"),defend],npc:"attack"},
      {text:"I laugh at him and wait",steps:[],npc:"attempt"},
      {text:"I step out and swing my sword",steps:[move("nearby"),attack()],npc:"move"},
      {text:"I try to trip him",steps:[attempt],npc:"end-turn"},
      {text:"I keep my guard up",steps:[defend],npc:"attack"},
      {text:"I take cover and call him a coward",steps:[move("cover")],npc:"defend"},
      {text:"I slash at him again",steps:[attack()],npc:"end-turn"},
    ];
    const unrelated=await f.campaign("Unrelated disposable campaign");
    const unrelatedBefore=(await f.one("select to_jsonb(c) row from public.rpg_campaigns c where id=$1",[unrelated])).row;
    let calls=0, npcCalls=0, narrationCalls=0;
    const deps={store,provider:{plan:()=>assert.fail("plan"),feedback:()=>assert.fail("feedback"),
      narrate:async()=>timed("dm.narrate.synthetic",async()=>({usage,output:{narration:`Validated combat turn ${++narrationCalls}.`,visualDescription:"",clarification:null}}))},
      prepareWorldLogic:worldLogicTurnPreparer(world,{action:async(input)=>timed("world.resolve.synthetic",async()=>{
        calls++;
        const scripted=turns[calls-2];
        if (calls>1) assert.equal(input.input.input,scripted.text);
        return {usage,output:calls===1?{
          schemaVersion:4,input:input.input.input,actorId:f.hero,targetId:npc.id,
          method:"attack",itemId:sword.id,equipmentName:sword.name,
        }:{schemaVersion:5,input:input.input.input,actorId:f.hero,steps:scripted.steps}};
      })}),prepareWorld:worldTurnPreparer(world),
      prepareCombatIntent:async(decision)=>timed("npc.intent.synthetic",async()=>{
        npcCalls++;
        const npcAction=npcCalls===1?"end-turn":turns[npcCalls-2].npc;
        assert.deepEqual(decision.actorsToDecide,[npc.id]);
        if (npcCalls>1) {
          assert.equal(decision.immediatePlayerStimulus.requestedText,turns[npcCalls-2].text);
          assert.equal(decision.immediatePlayerStimulus.validatedActions.length,turns[npcCalls-2].steps.length);
        }
        return {usage,output:[{actorId:npc.id,action:npcAction,
          targetId:["attack","attempt"].includes(npcAction)?f.hero:null,
          itemId:null,position:npcAction==="move"?"cover":null,
          description:`The innkeeper chooses ${npcAction}.`}]};
      })};
    let authorityChecked=false;
    const originalCommit=store.commit;
    deps.store={...store,commit:async(lease,packet)=>{
      const saved=(await f.one("select checkpoint from rpg_private.turns where id=$1",[lease.operationId])).checkpoint;
      if (saved.naturalCombatTurn && !authorityChecked) {
        const check=async(owner,campaign,p=packet)=>f.one(
          "select rpg_private.natural_combat_turn_validate($1,$2,t,$4::jsonb) valid from rpg_private.turns t where id=$3",
          [owner,campaign,lease.operationId,JSON.stringify(p)]);
        assert.equal((await check(f.owner,f.cid)).valid,true);
        await assert.rejects(()=>check(f.owner,randomUUID()));
        const before=(await f.one("select to_jsonb(e) row from public.rpg_encounters e where campaign_id=$1 and status='active'",[f.cid])).row;
        for (const [family,values] of [
          ["items",{quantity:99}], ["entities",{conditions:["stunned"]}],
          ["quests",{status:"completed"}], ["locations",{status:"known"}],
        ]) {
          const forged=structuredClone(packet);
          forged.resolution.changes.push({family,id:randomUUID(),expectedRevision:null,values});
          await assert.rejects(()=>originalCommit(lease,forged));
          assert.deepEqual((await f.one("select to_jsonb(e) row from public.rpg_encounters e where campaign_id=$1 and status='active'",[f.cid])).row,before);
        }
        const altered=structuredClone(saved);
        const originalCheckpoint=JSON.stringify(saved);
        try {
          for (const steps of [
            [move("cover"),move("nearby")],
            [attack(),defend],
          ]) {
            altered.naturalCombatTurn.steps=steps;
            await f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(altered)]);
            await assert.rejects(()=>check(f.owner,f.cid));
          }
          altered.naturalCombatTurn=structuredClone(saved.naturalCombatTurn);
          altered.combatExchange.actions.push({kind:"encounter.action",actorId:f.hero,
            action:"move",targetId:null,itemId:null,position:"cover"});
          await f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,JSON.stringify(altered)]);
          await assert.rejects(()=>check(f.owner,f.cid));
        } finally {
          await f.one("update rpg_private.turns set checkpoint=$2::jsonb where id=$1",[lease.operationId,originalCheckpoint]);
        }
        authorityChecked=true;
      }
      return originalCommit(lease,packet);
    }};
    const submit = async (text, crashAfterNpcRoll=false, crashAfterPlayerRoll=false) => {
      const turnStarted=performance.now();
      const play=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:text,companionId:null,listenerIds:[],mechanic:null};
      const originalStore=deps.store;
      let interrupted=false;
      if (crashAfterPlayerRoll) deps.store={...originalStore,recordChecks:async(lease,checks)=>{
        const result=await originalStore.recordChecks(lease,checks);
        if (!interrupted) { interrupted=true; throw Error("synthetic crash after durable player roll"); }
        return result;
      }};
      if (crashAfterNpcRoll) deps.store={...originalStore,checkpoint:async(lease,checkpoint,status)=>{
        const result=await originalStore.checkpoint(lease,checkpoint,status);
        if (!interrupted && checkpoint.combatExchange?.npcChecks.length) {
          interrupted=true; throw Error("synthetic crash after durable NPC roll");
        }
        return result;
      }};
      let result=await runTurn(input,deps);
      if (crashAfterPlayerRoll) {
        assert.equal(interrupted,true);
        assert.equal(result.status,"failed");
        assert.equal(result.canRetry,true);
        const prior=(await f.one("select checkpoint->'checks' checks from rpg_private.turns where id=$1",[input.operationId])).checks;
        deps.store=originalStore;
        result=await resumeTurn({commandId:randomUUID(),campaignId:f.cid,
          operationId:input.operationId,timeline:input.timeline,action:"retry",checkId:null},deps);
        assert.deepEqual((await f.one("select checkpoint->'checks' checks from rpg_private.turns where id=$1",[input.operationId])).checks,prior);
      }
      if (result.status==="awaiting_confirmation") result=await resumeTurn({commandId:randomUUID(),
        campaignId:f.cid,operationId:input.operationId,timeline:input.timeline,action:"continue",checkId:null},deps);
      if (crashAfterNpcRoll) {
        assert.equal(interrupted,true);
        assert.equal(result.status,"failed");
        assert.equal(result.canRetry,true);
        const prior=(await f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId])).checks;
        deps.store=originalStore;
        result=await resumeTurn({commandId:randomUUID(),campaignId:f.cid,
          operationId:input.operationId,timeline:input.timeline,action:"retry",checkId:null},deps);
        assert.deepEqual((await f.one("select checkpoint#>'{combatExchange,npcChecks}' checks from rpg_private.turns where id=$1",[input.operationId])).checks,prior);
      }
      assert.equal(result.status,"committed");
      timings.push({stage:"turn.total",ms:performance.now()-turnStarted});
      return {input,result};
    };
    await submit("I strike the innkeeper with my sword");
    for (const [index,scripted] of turns.entries()) {
      const before=await store.readPlay(f.cid);
      const submitted=await submit(scripted.text,index===1,index===3);
      const after=await store.readPlay(f.cid);
      assert.equal(after.encounters.find((row)=>row.status==="active").round,
        before.encounters.find((row)=>row.status==="active").round+1,`round ${index+1}`);
      const hero=after.participants.find((row)=>row.entity_id===f.hero);
      assert.equal(hero.public_resources.active,true);
      assert.equal(hero.public_resources.action,1);
      assert.equal(hero.public_resources.move,1);
      assert.equal(hero.public_resources.reaction,1);
      const saved=(await f.one("select checkpoint from rpg_private.turns where id=$1",[submitted.input.operationId])).checkpoint;
      assert.equal(saved.naturalCombatTurn.schemaVersion,5);
      assert.equal(saved.combatExchange.schemaVersion,2);
      assert.equal(saved.checks.length,scripted.steps.some((step)=>["attack","attempt"].includes(step.action))?1:0);
      assert.equal(saved.combatExchange.npcIntents[0].action,scripted.npc);
      if (index===1) assert.equal(saved.combatExchange.npcChecks[0].index,0,
        "NPC's private check is first when defend consumed no player check");
      if (index===3) assert.equal(saved.combatExchange.npcChecks[0].index,1,
        "NPC's private check follows the player's recorded attack check");
      if (index===0) assert.equal(hero.public_position.position,"cover");
      if (index===2 || index===9) assert.equal(saved.combatExchange.playerResolution.changes.length,0);
      if (index===4) assert.equal(saved.checks[0].advantage,"normal");
      if (index===6) assert.equal(saved.naturalCombatTurn.steps.length,1);
      const retry=await runTurn(submitted.input,deps);
      assert.equal(retry.status,"committed");
    }
    assert.equal(calls,16); assert.equal(npcCalls,16); assert.equal(narrationCalls,16);
    assert.equal(authorityChecked,true);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and text like 'Validated combat turn %'",[f.cid])).n,16);
    assert.deepEqual((await f.one("select to_jsonb(c) row from public.rpg_campaigns c where id=$1",[unrelated])).row,unrelatedBefore);
    assert.equal((await f.snapshot()).entities.find((row)=>row.id===npc.id).conditions.includes("taunted"),false);
    const beforeSave=await f.snapshot(), beforePlay=await store.readPlay(f.cid);
    const created=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Natural combat turn"}));
    const save=created.snapshot.saves.find((row)=>row.name==="Natural combat turn");
    assert.ok(save);
    const loaded=await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.id,label:"Combat branch",recovery:false}));
    assert.ok(loaded.timelineId);
    const rebound=createRpcTurnStore(f.owner,runtime,"gpt-6-astra",await f.fence(f.cid));
    const afterPlay=await rebound.readPlay(f.cid);
    assert.deepEqual((await f.snapshot()).entities,beforeSave.entities);
    assert.deepEqual((await f.snapshot()).items,beforeSave.items);
    assert.equal(afterPlay.encounters.find((row)=>row.status==="active").round,
      beforePlay.encounters.find((row)=>row.status==="active").round);
    assert.equal(afterPlay.participants.find((row)=>row.entity_id===f.hero).public_resources.action,1);
    assert.notEqual(afterPlay.timeline.timelineId,beforePlay.timeline.timelineId);
    if (process.env.RPG_BENCH_COMBAT === "1") {
      const stages=[...new Set(timings.map((row)=>row.stage))];
      const summary=stages.map((stage)=>{
        const values=timings.filter((row)=>row.stage===stage).map((row)=>row.ms).sort((a,b)=>a-b);
        return {stage,calls:values.length,medianMs:+values[Math.floor(values.length/2)].toFixed(2),
          p95Ms:+values[Math.min(values.length-1,Math.ceil(values.length*.95)-1)].toFixed(2),
          totalMs:+values.reduce((sum,value)=>sum+value,0).toFixed(2)};
      });
      console.log("NATURAL_COMBAT_SYNTHETIC_LATENCY="+JSON.stringify(summary));
    }
  } finally { await f.db.close(); }
});
