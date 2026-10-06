import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

// The literal eight-turn Mechanical Acceptance V2 arc, now against the
// production TurnStore and migration 38 rather than the spike ShadowJournal.
const arc = [
  "Orin, let's go back to the Old Mine and deal with this properly. I head there with him.",
  "I use my last oil flask in the old mine lamp and light it.",
  "I cross the unstable timbered passage carefully. If it isn't safe, the roll decides whether I make it through.",
  "I spend one Focus and commit to a sword strike against the Mine Stalker. Roll it honestly.",
  "I hold my ground. Resolve the Stalker's attack before I act again. Don't protect me from the consequences.",
  "I attack it again with the short sword. If the roll is enough to finish it, finish it. If not, it stays alive.",
  "I do not rest or heal. I check my condition and my pack, then sit at the mine entrance for a quiet moment and think about what I still owe Orin.",
  "I head back to the Copper Lantern with Orin. On the way, I bring up my promise about his father's map instead of pretending I've forgotten it.",
];
const usage={model:"scripted-fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};

test("Mechanical Acceptance V2 eight-turn arc holds exact production state and receipts",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f,"Mechanical Acceptance V2");
    await f.one("update public.rpg_entities set name='Mara',hp=10,max_hp=10,resources='{\"focus\":2}'::jsonb,stats=stats||'{\"attack\":2,\"defense\":11}'::jsonb where id=$1",[w.hero]);
    await f.one("update public.rpg_entities set name='Orin' where id=$1",[w.npc]);
    await f.one("update public.rpg_locations set name='Copper Lantern' where id=$1",[w.location]);
    await f.one("update public.rpg_items set name='Short sword' where id=$1",[w.item]);
    await f.one("update public.rpg_scenes set body='Mara promised Orin she would help find his father’s map. Orin agreed to return to the Old Mine.' where id=$1",[w.scene]);
    const mine=(await f.mutation("location.save",w.cid,{name:"Old Mine",
      description:"A fixed lamp and unstable timber passage",status:"known"})).id;
    const oil=(await f.mutation("item.save",w.cid,{name:"Oil flask",category:"consumable",
      quantity:1,description:"Last lamp oil",mechanics:"",owner_entity_id:w.hero,
      storage_id:w.storage,equipped_entity_id:null,equipped_slot:null})).id;
    const stalker=(await f.mutation("entity.save",w.cid,{kind:"npc",name:"Mine Stalker",
      details:"A hostile creature in the mine",hp:8,max_hp:8,
      stats:{skill:0,attack:2,save:0,defense:11},resources:{},conditions:[],
      equipment_slots:[{id:"hand",label:"Hand",accepts:["weapon"]}]})).id;
    const stalkerPack=(await f.mutation("storage.save",w.cid,{name:"Stalker gear",
      kind:"merchant",entity_id:stalker})).id;
    const claw=(await f.mutation("item.save",w.cid,{name:"Claw",category:"weapon",
      quantity:1,description:"Natural claw",mechanics:"",owner_entity_id:stalker,
      storage_id:stalkerPack,equipped_entity_id:stalker,equipped_slot:"hand"})).id;
    const play=await f.runtime(w.cid,"play");
    await f.runtime(w.cid,"configure",{requestId:randomUUID(),campaignId:w.cid,
      expectedRevision:play.revision,configuration:{...play.configuration,
        presentEntityIds:[w.hero,w.npc,stalker],
        itemRules:[{itemId:w.item,tag:"weapon",damage:4},
          {itemId:claw,tag:"weapon",damage:4}]}});
    const fence=await f.fence(w.cid);
    const runtime=async(args)=>{
      try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
      catch(error){return {error:{message:error.message,code:error.code}};}
    };
    const memoryRpc=async(args)=>{
      try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
      catch(error){return {error:{message:error.message,code:error.code}};}
    };
    const store=createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence);
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const summaries={summarize:async(job)=>({usage,output:{schemaVersion:1,
      selections:job.sources.map((source)=>({sourceId:source.id,version:source.ref.version}))}})};
    const snapshot=async()=>({
      revision:(await store.readPlay(w.cid)).revision,
      location:(await f.one("select current_location_id id from public.rpg_public_state where campaign_id=$1",[w.cid])).id,
      minutes:(await f.one("select world_minutes n from rpg_private.runtime_state where campaign_id=$1",[w.cid])).n,
      heroHp:(await f.one("select hp n from public.rpg_entities where id=$1",[w.hero])).n,
      focus:Number((await f.one("select resources->>'focus' n from public.rpg_entities where id=$1",[w.hero])).n),
      oil:(await f.one("select quantity n from public.rpg_items where id=$1",[oil])).n,
      stalkerHp:(await f.one("select hp n from public.rpg_entities where id=$1",[stalker])).n,
    });
    const initial=await snapshot();
    const expectations=[
      {location:mine,minutes:10,heroHp:10,focus:2,oil:1,stalkerHp:8},
      {location:mine,minutes:10,heroHp:10,focus:2,oil:0,stalkerHp:8},
      {location:mine,minutes:10,heroHp:10,focus:2,oil:0,stalkerHp:8},
      {location:mine,minutes:10,heroHp:10,focus:1,oil:0,stalkerHp:4},
      {location:mine,minutes:10,heroHp:6,focus:1,oil:0,stalkerHp:4},
      {location:mine,minutes:10,heroHp:6,focus:1,oil:0,stalkerHp:0},
      {location:mine,minutes:10,heroHp:6,focus:1,oil:0,stalkerHp:0},
      {location:w.location,minutes:20,heroHp:6,focus:1,oil:0,stalkerHp:0},
    ];
    assert.ok(initial.revision>0);
    assert.deepEqual({...initial,revision:1},{revision:1,location:w.location,minutes:0,
      heroHp:10,focus:2,oil:1,stalkerHp:8});
    const rollSchedule={2:[18],3:[13,4],4:[15,4],5:[14,4]};
    const receiptKinds=[[],[],["skill"],["attack","damage"],
      ["attack","damage"],["attack","damage"],["query"],[]];
    for(let index=0;index<arc.length;index++){
      const before=await snapshot();
      const playNow=await store.readPlay(w.cid);
      const input={operationId:randomUUID(),campaignId:w.cid,timeline:playNow.timeline,
        expectedRevision:playNow.revision,mode:"game",input:arc[index],
        companionId:null,listenerIds:[],mechanic:null};
      const scheduled=[...(rollSchedule[index]??[])];
      const random=(min,max)=>{
        const die=scheduled.shift();
        assert.equal(min,1);
        assert.equal(max,index===2||scheduled.length===1&&index>=3?21:5);
        assert.ok(die);
        return die;
      };
      const intended=receiptKinds[index];
      const provider={next:async(context,_input,receipts,_checks,_caps,source)=>{
        assert.ok(context.input.includes(arc[index]));
        if(index>=6)assert.ok(context.input.includes("father"),"old promise remains in context");
        if(receipts.length<intended.length){
          const kind=intended[receipts.length];
          const actorId=index===4?stalker:w.hero;
          return {usage,output:{type:"tool",final:null,call:{kind,
            actorId:kind==="query"?null:actorId,
            targetId:kind==="attack"||kind==="damage"?
              index===4?w.hero:stalker:null,
            itemId:kind==="attack"||kind==="damage"?
              index===4?claw:w.item:null,
            dc:kind==="skill"?12:null,scope:kind==="query"?"current-public":null}}};
        }
        const changes=[];
        let worldMinutes=source.runtime.worldMinutes;
        if(index===0||index===7){
          worldMinutes+=10;
          changes.push({family:"public_state",id:w.cid,
            expectedRevision:source.snapshot.publicState.revision,
            values:{current_location_id:index===0?mine:w.location}});
        }
        if(index===1)changes.push({family:"items",id:oil,
          expectedRevision:source.snapshot.items.find((i)=>i.id===oil).revision,
          values:{quantity:0}});
        if(index===3)changes.push({family:"entities",id:w.hero,
          expectedRevision:source.snapshot.entities.find((e)=>e.id===w.hero).revision,
          values:{resources:{focus:1}}});
        if(index>=3&&index<=5){
          const target=index===4?w.hero:stalker;
          const entity=source.snapshot.entities.find((e)=>e.id===target);
          changes.push({family:"entities",id:target,expectedRevision:entity.revision,
            values:{hp:entity.hp-receipts.at(-1).result.total}});
        }
        return {usage,output:{type:"final",call:null,final:{worldMinutes,
          changes,outcomes:[],privatePatches:[]}}};
      },narrate:async(context)=>{
        assert.equal(context.input.includes("PRIVATE_BEFORE_FORK"),false);
        return {usage,output:{narration:index>=6?
          "Mara remembers her promise about Orin's father's map.":
          `The recorded consequence of acceptance turn ${index+1} holds.`,
          visualDescription:"",clarification:null}};
      }};
      const deps={store,memory,summaries,provider,random};
      let result=await runAstraTurn(input,deps);
      if(result.status==="awaiting_confirmation"){
        result=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
          operationId:input.operationId,timeline:fence,action:"continue",checkId:null},deps);
      }
      assert.equal(result.status,"committed",`acceptance turn ${index+1}`);
      const after=await snapshot();
      assert.ok(after.revision>before.revision);
      assert.deepEqual({...after,revision:0},{revision:0,...expectations[index]},
        `acceptance state turn ${index+1}`);
      const turn=await f.one("select checkpoint from rpg_private.turns where id=$1",[input.operationId]);
      assert.deepEqual(turn.checkpoint.astraPrimary.toolReceipts.map((r)=>r.call.kind),intended);
      assert.equal(scheduled.length,0);
    }
  } finally {await f.db.close();}
});
