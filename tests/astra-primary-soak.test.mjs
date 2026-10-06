import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

const usage={model:"scripted-fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
const story=[
  ["dialogue","I ask Nera about the copper bell promise."],
  ["query","I look around the bridge before deciding."],
  ["resource","I spend focus to steady myself."],
  ["item","I use one flask of oil."],
  ["travel-out","I walk to the known overlook."],
  ["skill","I inspect the ridge for tracks."],
  ["dialogue","I guess the ferryman stole the papers."],
  ["dialogue","Nera, come with me even if you are exhausted."],
  ["dialogue","Do you remember our copper bell promise?"],
  ["travel-back","I return to the bridge."],
  ["enemy-attack","Nera turns on me; I try to avoid the strike."],
  ["player-attack","I strike back."],
  ["resource","I spend another focus to stay alert."],
  ["item","I use the remaining oil."],
  ["travel-out","I revisit the overlook."],
  ["dialogue","We sit in silence for a while."],
  ["dialogue","I ask why Nera refused earlier."],
  ["skill","I search the old signpost carefully."],
  ["dialogue","I wonder whether the ferryman was innocent."],
  ["query","I check the current public state again."],
  ["invalid","I try to rewrite Nera's strength directly."],
  ["travel-back","I return to the bridge once more."],
  ["dialogue","I ask Nera about the promise again."],
  ["dialogue","I let the quiet hold and wait for a reply."],
];

test("24-turn deterministic Astra production soak preserves state, retry and continuity",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    const overlook=(await f.mutation("location.save",w.cid,
      {name:"Overlook",description:"A known ridge",status:"known"})).id;
    const oil=(await f.mutation("item.save",w.cid,{name:"Oil flask",category:"consumable",
      quantity:2,description:"Synthetic oil",mechanics:"",owner_entity_id:w.hero,
      storage_id:w.storage,equipped_entity_id:null,equipped_slot:null})).id;
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{attack}','20') where id in ($1,$2)",[w.hero,w.npc]);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}','10') where id in ($1,$2)",[w.hero,w.npc]);
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
    const base={store,memory,random:(min,max)=>max-1,
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((source)=>({sourceId:source.id,
          version:source.ref.version}))}})}};
    const canonBefore=(await f.one("select count(*)::integer n from public.rpg_documents where campaign_id=$1 and status='canon'",[w.cid])).n;
    let paused=0,queryCount=0,rejected=0,callbackSeen=false;
    for(let index=0;index<story.length;index++){
      const [kind,text]=story[index];
      const play=await store.readPlay(w.cid);
      const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:text,
        companionId:null,listenerIds:[],mechanic:null};
      const provider={next:async(context,_input,receipts,_checks,_caps,source)=>{
        if(index===8) callbackSeen ||= context.input.includes("copper bell promise");
        if(kind==="query" && receipts.length===0){queryCount++;
          return {usage,output:{type:"tool",final:null,call:{kind:"query",actorId:null,
            targetId:null,dc:null,itemId:null,scope:"current-public"}}};}
        if(kind==="skill" && receipts.length===0)
          return {usage,output:{type:"tool",final:null,call:{kind:"skill",actorId:w.hero,
            targetId:null,dc:10,itemId:null,scope:null}}};
        if(kind==="enemy-attack" && receipts.length<2)
          return {usage,output:{type:"tool",final:null,call:{kind:receipts.length===0?"attack":"damage",
            actorId:w.npc,targetId:w.hero,dc:null,itemId:null,scope:null}}};
        if(kind==="player-attack" && receipts.length<2)
          return {usage,output:{type:"tool",final:null,call:{kind:receipts.length===0?"attack":"damage",
            actorId:w.hero,targetId:w.npc,dc:null,itemId:null,scope:null}}};
        const changes=[];
        let worldMinutes=source.runtime.worldMinutes;
        if(kind==="resource"){
          const hero=source.snapshot.entities.find((e)=>e.id===w.hero);
          changes.push({family:"entities",id:w.hero,expectedRevision:hero.revision,
            values:{resources:{focus:hero.resources.focus-1}}});
        }
        if(kind==="item"){
          const item=source.snapshot.items.find((i)=>i.id===oil);
          changes.push({family:"items",id:oil,expectedRevision:item.revision,
            values:{quantity:item.quantity-1}});
        }
        if(kind==="travel-out" || kind==="travel-back"){
          worldMinutes+=10;
          changes.push({family:"public_state",id:w.cid,
            expectedRevision:source.snapshot.publicState.revision,
            values:{current_location_id:kind==="travel-out"?overlook:w.location}});
        }
        if(kind==="enemy-attack" || kind==="player-attack"){
          const id=kind==="enemy-attack"?w.hero:w.npc;
          const actor=source.snapshot.entities.find((e)=>e.id===id);
          changes.push({family:"entities",id,expectedRevision:actor.revision,
            values:{hp:actor.hp-receipts[1].result.total}});
        }
        if(kind==="invalid")changes.push({family:"entities",id:w.npc,
          expectedRevision:source.snapshot.entities.find((e)=>e.id===w.npc).revision,
          values:{stats:{attack:99}}});
        return {usage,output:{type:"final",call:null,final:{worldMinutes,changes,
          outcomes:[],privatePatches:[]}}};
      },narrate:async()=>({usage,output:{narration:index===0?
        "Nera repeats the copper bell promise.":
        kind==="dialogue"&&index===7?"Nera refuses; she is too tired to go.":
        kind==="dialogue"&&index===6?"The ferryman theory remains unproven.":
        `Synthetic scene ${index+1}: the consequences remain in the world.`,
        visualDescription:"",clarification:null}})};
      const deps={...base,provider};
      let result=await runAstraTurn(input,deps);
      if(result.status==="awaiting_confirmation"){
        paused++;
        assert.equal((await runAstraTurn(input,deps)).status,"awaiting_confirmation");
        result=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
          operationId:input.operationId,timeline:fence,action:"continue",checkId:null},deps);
      }
      if(kind==="invalid"){
        assert.equal(result.status,"failed");rejected++;
      } else assert.equal(result.status,"committed",`soak turn ${index+1}: ${kind}`);
    }
    assert.equal(story.length,24);
    assert.equal(rejected,1);
    assert.equal(paused,3);
    assert.equal(queryCount,2);
    assert.equal(callbackSeen,true);
    assert.equal((await f.one("select resources->>'focus' focus,hp from public.rpg_entities where id=$1",[w.hero])).focus,"1");
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.hero])).hp,5);
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[w.npc])).hp,3);
    assert.equal((await f.one("select quantity from public.rpg_items where id=$1",[oil])).quantity,0);
    assert.equal((await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[w.cid])).current_location_id,w.location);
    assert.equal((await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[w.cid])).world_minutes,40);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where campaign_id=$1",[w.cid])).n,23);
    assert.equal((await f.one("select count(*)::integer n from public.rpg_documents where campaign_id=$1 and status='canon'",[w.cid])).n,canonBefore);
  } finally {await f.db.close();}
});
