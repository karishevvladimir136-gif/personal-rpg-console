import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { astraCapabilities, astraToolResult, runAstraTurn, resumeAstraTurn, selectAstraPrimaryRuntime } from "../src/lib/gameplay/astra-primary.ts";

test("only new opted-in Console Basic game turns select Astra; legacy pins stay legacy",()=>{
  assert.equal(selectAstraPrimaryRuntime(null,true,"game","console-basic-v1"),true);
  assert.equal(selectAstraPrimaryRuntime("astra-primary-v1",false,"game",null),true);
  assert.equal(selectAstraPrimaryRuntime("legacy-v1",true,"game","console-basic-v1"),false);
  assert.equal(selectAstraPrimaryRuntime(null,true,"game","world-logic-v1"),false);
  assert.equal(selectAstraPrimaryRuntime(null,true,"ooc","console-basic-v1"),false);
  assert.equal(selectAstraPrimaryRuntime(null,false,"game","console-basic-v1"),false);
});

function adapters(f, cid) {
  const errors=[];
  const rpc = async (args) => {
    try { return { data: await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline) }; }
    catch (error) { errors.push({action:args.p_action,message:error.message,where:error.where});
      return { error: { message:error.message,code:error.code } }; }
  };
  const memoryRpc = async (args) => {
    try { return { data: await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline) }; }
    catch (error) { return { error: { message:error.message,code:error.code } }; }
  };
  return f.fence(cid).then((timeline) => ({
    errors,
    store:createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline),
    memory:createRpcMemoryStore(f.owner,memoryRpc,timeline),
    summaries:{summarize:()=>assert.fail("unexpected summary provider call")},
  }));
}

test("Astra production turn durably begins before context and commits through TurnStore",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    const deps=await adapters(f,w.cid);
    const play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"Ask Nera about the bridge",
      companionId:null,listenerIds:[],mechanic:null};
    let calls=0;
    deps.provider={
      next:async(context)=>{
        calls++;
        assert.equal(context.instructions.includes("one primary DM"),true);
        assert.equal(context.instructions.includes("worldMinutes may equal astraPrimary.authority.currentWorldMinutes"),true);
        assert.equal(context.instructions.includes("changing current_location_id requires final worldMinutes to be strictly greater"),true);
        assert.equal(context.instructions.includes("Movement inside one Location is narration, not a Location change"),true);
        assert.deepEqual(JSON.parse(context.input).astraPrimary.authority,
          {currentWorldMinutes:0,locationChangeRequiresTimeAdvance:true});
        assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1",[input.operationId])).runtime_identity,"astra-primary-v1");
        return {usage:{model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0},
          output:{type:"final",call:null,final:{worldMinutes:0,changes:[],outcomes:[],privatePatches:[]}}};
      },
      narrate:async(context)=>{
        assert.equal(context.input.includes("PRIVATE_BEFORE_FORK"),false);
        assert.equal(context.input.includes("locationChangeRequiresTimeAdvance"),false);
        return {usage:{model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0},
          output:{narration:"Nera watches the river beneath the bridge.",visualDescription:"",clarification:null}};
      }
    };
    const result=await runAstraTurn(input,deps);
    assert.equal(result.status,"committed");
    assert.equal(calls,1);
    assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1",[input.operationId])).runtime_identity,"astra-primary-v1");
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",[input.operationId])).n,1);
  } finally {await f.db.close();}
});

test("Astra travel with unchanged world time remains a failed atomic no-op",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f),deps=await adapters(f,w.cid);
    const destination=(await f.mutation("location.save",w.cid,
      {name:"Known ridge",description:"A nearby known ridge",status:"known"})).id;
    const play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"Travel to the known ridge",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    deps.provider={next:async(context,_input,_receipts,_checks,_caps,source)=>{
      assert.equal(JSON.parse(context.input).astraPrimary.authority.currentWorldMinutes,
        source.runtime.worldMinutes);
      return {usage,output:{type:"final",call:null,final:{
        worldMinutes:source.runtime.worldMinutes,
        changes:[{family:"public_state",id:w.cid,
          expectedRevision:source.snapshot.publicState.revision,
          values:{current_location_id:destination}}],outcomes:[],privatePatches:[]}}};
    },narrate:()=>assert.fail("invalid travel must not reach narration")};
    const turn=await runAstraTurn(input,deps);
    assert.equal(turn.status,"failed");
    assert.equal(turn.failure,"validation");
    assert.equal((await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[w.cid])).current_location_id,w.location);
    assert.equal((await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[w.cid])).world_minutes,0);
    const saved=await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(saved.checkpoint.astraPrimary.finalProposal,null);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",[input.operationId])).n,0);
  } finally {await f.db.close();}
});

test("Astra final private fact uses existing private-state authority without public exposure",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f),deps=await adapters(f,w.cid);
    const play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"Nera privately decides to watch the crossing",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const patch={kind:"fact",key:"watching_crossing",operation:"set",value:"Nera watches the crossing",amount:null};
    deps.provider={next:async()=>({usage,output:{type:"final",call:null,
      final:{worldMinutes:0,changes:[],outcomes:[],privatePatches:[patch]}}}),
      narrate:async(context)=>{
        assert.equal(context.input.includes("watching_crossing"),false);
        return {usage,output:{narration:"Nera lingers by the railing.",visualDescription:"",clarification:null}};
      }};
    const turn=await runAstraTurn(input,deps);
    assert.equal(turn.status,"committed",JSON.stringify(deps.errors));
    assert.equal((await f.one("select contents#>>'{fact,watching_crossing}' value from rpg_private.dm_state where campaign_id=$1",[w.cid])).value,patch.value);
    assert.equal(JSON.stringify(turn).includes("watching_crossing"),false);
  } finally {await f.db.close();}
});

test("Astra context failure retains the literal input and pinned runtime",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f),deps=await adapters(f,w.cid);
    const play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"Keep this exact action after context fails",
      companionId:null,listenerIds:[],mechanic:null};
    deps.memory={...deps.memory,read:async()=>{throw Error("synthetic context interruption")}};
    deps.provider={next:()=>assert.fail("provider reached before context"),
      narrate:()=>assert.fail("narrator reached before context")};
    await assert.rejects(runAstraTurn(input,deps),/synthetic context interruption/);
    const saved=await f.one("select input,status,runtime_identity from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(saved.input.input,input.input);
    assert.equal(saved.status,"pending");
    assert.equal(saved.runtime_identity,"astra-primary-v1");
  } finally {await f.db.close();}
});

test("two Astra campaigns keep state, Memory evidence and private context separate",async()=>{
  const f=await fixture(38);
  try {
    const a=await world(f,"Amber campaign"),b=await world(f,"Azure campaign");
    for(const [w,marker] of [[a,"AMBER_PRIVATE_ONLY"],[b,"AZURE_PRIVATE_ONLY"]]){
      await f.one("update rpg_private.dm_state set contents=jsonb_set(contents,'{fact,secret}',to_jsonb($2::text)) where campaign_id=$1",[w.cid,marker]);
      const model={schemaVersion:1,actorId:w.npc,basisOperationId:null,
        identity:{values:["Keeps promises"],wants:[],boundaries:[],loyalties:[],
          signatures:[],observableVoice:"Measured speech"},
        current:{goal:`${marker}_MODEL_GOAL`,stress:"settled",preoccupation:null,
          obligation:null},beliefs:[],relationships:[],episodes:[]};
      await f.one("update rpg_private.dm_state set contents=jsonb_set(contents,'{npc}',coalesce(contents->'npc','{}'::jsonb)||jsonb_build_object($2::text,$3::text),true) where campaign_id=$1",
        [w.cid,`character_${w.npc}`,JSON.stringify(model)]);
      await f.mutation("scene.save",w.cid,{session_id:w.sid,title:`${marker.split("_")[0]} scene`,
        body:`${marker.split("_")[0]} public memory`,role:"narration"});
    }
    for(const [w,own,other] of [[a,"AMBER_PRIVATE_ONLY","AZURE_PRIVATE_ONLY"],
      [b,"AZURE_PRIVATE_ONLY","AMBER_PRIVATE_ONLY"]]){
      const deps=await adapters(f,w.cid),play=await deps.store.readPlay(w.cid);
      const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:"Ask Nera to continue our story",
        companionId:null,listenerIds:[],mechanic:null};
      const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
      deps.provider={next:async(context)=>{
        assert.equal(context.input.includes(own),true);
        assert.equal(context.input.includes(`${own}_MODEL_GOAL`),true);
        assert.equal(context.input.includes(other),false);
        return {usage,output:{type:"final",call:null,final:{worldMinutes:0,
          changes:[],outcomes:[],privatePatches:[]}}};
      },narrate:async(context)=>{
        assert.equal(context.input.includes(own),false);
        assert.equal(context.input.includes(`${own}_MODEL_GOAL`),false);
        assert.equal(context.input.includes(other),false);
        return {usage,output:{narration:"The scene continues.",visualDescription:"",clarification:null}};
      }};
      assert.equal((await runAstraTurn(input,deps)).status,"committed");
    }
  } finally {await f.db.close();}
});

test("current-public tool excludes campaign records outside the current present scope",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    const hidden=(await f.mutation("entity.save",w.cid,{kind:"npc",name:"Unseen watcher",
      details:"Not present",hp:4,max_hp:4,stats:{},resources:{},conditions:[],
      equipment_slots:[]})).id;
    const npcPack=(await f.mutation("storage.save",w.cid,{name:"Nera pack",
      kind:"companion",entity_id:w.npc})).id;
    const privateItem=(await f.mutation("item.save",w.cid,{name:"Folded private note",
      category:"misc",quantity:1,description:"Not equipped",mechanics:"",
      owner_entity_id:w.npc,storage_id:npcPack,equipped_entity_id:null,
      equipped_slot:null})).id;
    const play=await f.runtime(w.cid,"play");
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:await f.fence(w.cid),
      expectedRevision:play.revision,mode:"game",input:"Look around",
      companionId:null,listenerIds:[],mechanic:null};
    await f.runtime(w.cid,"begin",{...input,serverRuntime:"astra-primary-v1"});
    const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.ok(claim.source.snapshot.entities.some((e)=>e.id===hidden));
    const result=astraToolResult(claim.source,input,{kind:"query",actorId:null,
      targetId:null,dc:null,itemId:null,scope:"current-public"},[],[]);
    assert.equal(result.state.entities.some((e)=>e.id===hidden),false);
    assert.equal(result.state.entities.some((e)=>e.id===w.hero),true);
    assert.equal(result.state.items.some((i)=>i.id===privateItem),false);
    assert.equal(astraCapabilities(claim.source).itemIds.includes(privateItem),false);
  } finally {await f.db.close();}
});

test("Astra generic attack, visible pause, damage and exact HP commit",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{attack}','20') where id=$1",[w.hero]);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}','10') where id=$1",[w.npc]);
    const deps=await adapters(f,w.cid), play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"Strike Nera",
      companionId:null,listenerIds:[],mechanic:null};
    let calls=0;
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    deps.provider={next:async(_context,_input,receipts)=>{
      calls++;
      if(receipts.length===0)return {usage,output:{type:"tool",final:null,
        call:{kind:"attack",actorId:w.hero,targetId:w.npc,dc:null,itemId:null,scope:null}}};
      if(receipts.length===1)return {usage,output:{type:"tool",final:null,
        call:{kind:"damage",actorId:w.hero,targetId:w.npc,dc:null,itemId:null,scope:null}}};
      const amount=receipts[1].result.total;
      return {usage,output:{type:"final",call:null,final:{worldMinutes:0,
        changes:[{family:"entities",id:w.npc,expectedRevision:1,values:{hp:5-amount}}],
        outcomes:[],privatePatches:[]}}};
    },narrate:async(context)=>{
      assert.equal(context.input.includes("PRIVATE_BEFORE_FORK"),false);
      return {usage,output:{narration:"Ari lands the blow.",visualDescription:"",clarification:null}};
    }};
    const paused=await runAstraTurn(input,deps);
    assert.equal(paused.status,"awaiting_confirmation");
    assert.equal(calls,1);
    const before=(await f.one("select hp from public.rpg_entities where id=$1",[w.npc])).hp;
    assert.equal(before,5);
    const initialCheck=(await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId])).checkpoint.checks[0];
    const rerollCommand={commandId:randomUUID(),campaignId:w.cid,operationId:input.operationId,
      timeline:input.timeline,action:"reroll",checkId:initialCheck.id};
    const rerolled=await resumeAstraTurn(rerollCommand,deps);
    assert.equal(rerolled.status,"awaiting_confirmation");
    assert.equal(calls,1);
    const changedCheck=(await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId])).checkpoint.checks[0];
    assert.equal(changedCheck.id,initialCheck.id);
    assert.equal(changedCheck.rollNumber,2);
    assert.equal((await resumeAstraTurn(rerollCommand,deps)).status,"awaiting_confirmation");
    assert.equal((await f.one("select checkpoint#>>'{checks,0,rollNumber}' n from rpg_private.turns where id=$1",[input.operationId])).n,"2");
    assert.equal((await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId])).checkpoint.astraPrimary.toolReceipts.length,1);
    const done=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
      operationId:input.operationId,timeline:input.timeline,action:"continue",checkId:null},deps);
    assert.equal(done.status,"committed");
    assert.equal(calls,3);
    const saved=await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId]);
    assert.deepEqual(saved.checkpoint.astraPrimary.toolReceipts.map((r)=>r.call.kind),["attack","damage"]);
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.npc])).hp,
      5-saved.checkpoint.astraPrimary.toolReceipts[1].result.total);
  } finally {await f.db.close();}
});

test("Astra existing state authority persists resource spend, Item consumption and known Location travel",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    const consumable=(await f.mutation("item.save",w.cid,{name:"Oil flask",category:"consumable",
      quantity:2,description:"Synthetic supply",mechanics:"",owner_entity_id:w.hero,
      storage_id:w.storage,equipped_entity_id:null,equipped_slot:null})).id;
    const destination=(await f.mutation("location.save",w.cid,
      {name:"The overlook",description:"A known high ridge",status:"known"})).id;
    const deps=await adapters(f,w.cid);
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const choices=[
      (source)=>({worldMinutes:source.runtime.worldMinutes,
        changes:[{family:"entities",id:w.hero,
          expectedRevision:source.snapshot.entities.find((e)=>e.id===w.hero).revision,
          values:{resources:{focus:2}}}],outcomes:[],privatePatches:[]}),
      (source)=>({worldMinutes:source.runtime.worldMinutes,
        changes:[{family:"items",id:consumable,
          expectedRevision:source.snapshot.items.find((i)=>i.id===consumable).revision,
          values:{quantity:1}}],outcomes:[],privatePatches:[]}),
      (source)=>({worldMinutes:source.runtime.worldMinutes+10,
        changes:[{family:"public_state",id:w.cid,
          expectedRevision:source.snapshot.publicState.revision,
          values:{current_location_id:destination}}],outcomes:[],privatePatches:[]}),
    ];
    for (let index=0;index<choices.length;index++) {
      const play=await deps.store.readPlay(w.cid);
      const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:["Spend focus","Use the compass","Travel to the overlook"][index],
        companionId:null,listenerIds:[],mechanic:null};
      deps.provider={next:async(context,_input,_receipts,_checks,_caps,source)=>{
        assert.equal(JSON.parse(context.input).astraPrimary.authority.currentWorldMinutes,
          source.runtime.worldMinutes);
        return {usage,output:{type:"final",call:null,final:choices[index](source)}};
      },
        narrate:async()=>({usage,output:{narration:"The action has its recorded consequence.",
          visualDescription:"",clarification:null}})};
      const result=await runAstraTurn(input,deps);
      assert.equal(result.status,"committed",`turn ${index}: ${JSON.stringify(deps.errors)}`);
    }
    assert.equal((await f.one("select resources->>'focus' focus from public.rpg_entities where id=$1",[w.hero])).focus,"2");
    assert.equal((await f.one("select quantity from public.rpg_items where id=$1",[consumable])).quantity,1);
    assert.equal((await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[w.cid])).current_location_id,destination);
    assert.equal((await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[w.cid])).world_minutes,10);
  } finally {await f.db.close();}
});

test("Astra tactical movement spends the active encounter Move and cannot be used in exploration",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f), deps=await adapters(f,w.cid);
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    const fake=(make)=>({next:async(_c,_i,_r,_checks,_caps,source)=>({usage,
      output:{type:"final",call:null,final:make(source)}}),
      narrate:async()=>({usage,output:{narration:"Ari moves to the next position.",
        visualDescription:"",clarification:null}})});
    const submit=async(text)=>{
      const play=await deps.store.readPlay(w.cid);
      return runAstraTurn({operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:text,
        companionId:null,listenerIds:[],mechanic:null},deps);
    };
    deps.provider=fake((source)=>({worldMinutes:source.runtime.worldMinutes,
      changes:[{family:"encounter_participants",id:randomUUID(),expectedRevision:null,
        values:{public_position:{position:"nearby"},public_resources:{move:0}}}],
      outcomes:[],privatePatches:[]}));
    assert.equal((await submit("Move toward the innkeeper")).status,"failed");
    const encounter=randomUUID(),participant=randomUUID();
    const settings=(await f.one("select max(revision) r from public.rpg_settings_revisions where campaign_id=$1",[w.cid])).r;
    await f.one("insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',1,$3,'Synthetic encounter')",[encounter,w.cid,settings]);
    await f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,'Ari',0,$5::jsonb,$6::jsonb)",
      [participant,w.cid,encounter,w.hero,JSON.stringify({position:"cover"}),
        JSON.stringify({action:1,move:1,reaction:1,active:true,defending:false,withdrawn:false})]);
    deps.provider=fake((source)=>{
      const p=source.runtime.participants.find((p)=>p.id===participant);
      return {worldMinutes:source.runtime.worldMinutes,
        changes:[{family:"encounter_participants",id:participant,
          expectedRevision:null,values:{public_position:{position:"nearby"},
            public_resources:{...p.public_resources,move:0}}}],outcomes:[],privatePatches:[]};
    });
    assert.equal((await submit("Move from cover to nearby")).status,"committed");
    const after=await f.one("select public_position,public_resources from public.rpg_encounter_participants where id=$1",[participant]);
    assert.equal(after.public_position.position,"nearby");
    assert.equal(after.public_resources.move,0);
    assert.equal(after.public_resources.action,1);
  } finally {await f.db.close();}
});

test("Astra active-encounter attack cannot grant a free Action and marks a defeated target withdrawn",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f),deps=await adapters(f,w.cid);
    await f.one("update public.rpg_entities set hp=2,stats=stats||'{\"defense\":10}'::jsonb where id=$1",[w.npc]);
    await f.one("update public.rpg_entities set stats=stats||'{\"attack\":20}'::jsonb where id=$1",[w.hero]);
    const encounter=randomUUID(),heroParticipant=randomUUID(),npcParticipant=randomUUID();
    const settings=(await f.one("select max(revision) r from public.rpg_settings_revisions where campaign_id=$1",[w.cid])).r;
    await f.one("insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',1,$3,'Synthetic encounter')",[encounter,w.cid,settings]);
    const resources={action:1,move:1,reaction:1,active:true,defending:false,withdrawn:false};
    for(const [id,entity,order,position] of [[heroParticipant,w.hero,0,"nearby"],
      [npcParticipant,w.npc,1,"nearby"]])
      await f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,'Synthetic actor',$5,$6::jsonb,$7::jsonb)",
        [id,w.cid,encounter,entity,order,JSON.stringify({position}),JSON.stringify(resources)]);
    const submit=async(includeCosts)=>{
      const play=await deps.store.readPlay(w.cid);
      const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:"Strike the visible opponent",
        companionId:null,listenerIds:[],mechanic:null};
      const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
      deps.provider={next:async(_context,_input,receipts,_checks,_caps,source)=>{
        if(receipts.length<2)return {usage,output:{type:"tool",final:null,
          call:{kind:receipts.length===0?"attack":"damage",actorId:w.hero,
            targetId:w.npc,dc:null,itemId:null,scope:null}}};
        const changes=[{family:"entities",id:w.npc,
          expectedRevision:source.snapshot.entities.find((e)=>e.id===w.npc).revision,
          values:{hp:0}}];
        if(includeCosts){
          const hero=source.runtime.participants.find((p)=>p.id===heroParticipant);
          const npc=source.runtime.participants.find((p)=>p.id===npcParticipant);
          changes.push({family:"encounter_participants",id:heroParticipant,
            expectedRevision:null,values:{public_position:hero.public_position,
              public_resources:{...hero.public_resources,action:0}}});
          changes.push({family:"encounter_participants",id:npcParticipant,
            expectedRevision:null,values:{public_position:npc.public_position,
              public_resources:{...npc.public_resources,withdrawn:true}}});
        }
        return {usage,output:{type:"final",call:null,final:{worldMinutes:0,
          changes,outcomes:[],privatePatches:[]}}};
      },narrate:async()=>({usage,output:{narration:"The opponent falls.",
        visualDescription:"",clarification:null}})};
      const active={...deps,random:(min,max)=>max-1};
      let result=await runAstraTurn(input,active);
      if(result.status==="awaiting_confirmation")result=await resumeAstraTurn({
        commandId:randomUUID(),campaignId:w.cid,operationId:input.operationId,
        timeline:input.timeline,action:"continue",checkId:null},active);
      return {input,result};
    };
    const rejected=await submit(false);
    assert.equal(rejected.result.status,"failed");
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.npc])).hp,2);
    assert.equal((await f.one("select public_resources->>'action' n from public.rpg_encounter_participants where id=$1",[heroParticipant])).n,"1");
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",[rejected.input.operationId])).n,0);
    const accepted=await submit(true);
    assert.equal(accepted.result.status,"committed",JSON.stringify(deps.errors));
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.npc])).hp,0);
    assert.equal((await f.one("select public_resources->>'action' n from public.rpg_encounter_participants where id=$1",[heroParticipant])).n,"0");
    assert.equal((await f.one("select public_resources->>'withdrawn' n from public.rpg_encounter_participants where id=$1",[npcParticipant])).n,"true");
  } finally {await f.db.close();}
});

test("Astra enemy attack uses a private check and applies real player HP loss",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f),deps=await adapters(f,w.cid);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{attack}','20') where id=$1",[w.npc]);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}','10') where id=$1",[w.hero]);
    const play=await deps.store.readPlay(w.cid);
    const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:"I try to get past Nera",
      companionId:null,listenerIds:[],mechanic:null};
    const usage={model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
    deps.provider={next:async(_context,_input,receipts)=>{
      if(receipts.length===0)return {usage,output:{type:"tool",final:null,
        call:{kind:"attack",actorId:w.npc,targetId:w.hero,dc:null,itemId:null,scope:null}}};
      if(receipts.length===1)return {usage,output:{type:"tool",final:null,
        call:{kind:"damage",actorId:w.npc,targetId:w.hero,dc:null,itemId:null,scope:null}}};
      return {usage,output:{type:"final",call:null,final:{worldMinutes:0,
        changes:[{family:"entities",id:w.hero,expectedRevision:1,
          values:{hp:7-receipts[1].result.total}}],outcomes:[],privatePatches:[]}}};
    },narrate:async(context)=>{
      assert.equal(context.input.includes('"visibility":"private"'),false);
      return {usage,output:{narration:"Nera strikes Ari as he passes.",
        visualDescription:"",clarification:null}};
    }};
    const done=await runAstraTurn(input,deps);
    assert.equal(done.status,"committed");
    const checkpoint=(await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId])).checkpoint;
    assert.equal(checkpoint.checks[0].visibility,"private");
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.hero])).hp,
      7-checkpoint.astraPrimary.toolReceipts[1].result.total);
    assert.deepEqual(done.checks,[]);
  } finally {await f.db.close();}
});
