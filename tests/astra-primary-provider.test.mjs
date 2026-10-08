import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { astraCapabilities } from "../src/lib/gameplay/astra-primary.ts";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
    : nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import(
  "../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

test("production OpenAI adapter keeps Astra/high planning, Astra/medium narration, and derives encounter Action",async()=>{
  const f=await fixture(38);
  try {
    const w=await world(f);
    const encounter=randomUUID(),participant=randomUUID();
    const settings=(await f.one("select max(revision) r from public.rpg_settings_revisions where campaign_id=$1",[w.cid])).r;
    await f.one("insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',1,$3,'Synthetic encounter')",[encounter,w.cid,settings]);
    const resources={action:1,move:1,reaction:1,active:true,defending:false,withdrawn:false};
    await f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,'Ari',0,$5::jsonb,$6::jsonb)",
      [participant,w.cid,encounter,w.hero,JSON.stringify({position:"nearby"}),JSON.stringify(resources)]);
    const play=await f.runtime(w.cid,"play");
    const input={operationId:randomUUID(),campaignId:w.cid,
      expectedRevision:play.revision,mode:"game",input:"Strike the opponent",
      companionId:null,listenerIds:[],mechanic:null};
    await f.runtime(w.cid,"begin",{...input,serverRuntime:"astra-primary-v1"});
    const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    const caps=astraCapabilities(claim.source);
    const raw={type:"final",call:null,final:{schemaVersion:1,worldMinutes:0,
      changes:[],outcomes:[],privatePatches:[]}};
    const bodies=[];
    const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_url,init)=>{
      const body=JSON.parse(init.body);
      bodies.push(body);
      const output=body.text.format.name==="dm_narrate"
        ?{narration:"The opponent stands before you.",visualDescription:"A tense exchange.",clarification:null}
        :raw;
      return new Response(JSON.stringify({model:"gpt-6-astra",status:"completed",
        output:[{type:"message",role:"assistant",status:"completed",
          content:[{type:"output_text",text:JSON.stringify(output)}]}],
        usage:{input_tokens:12,output_tokens:8}}));
    }});
    const context={instructions:"One primary DM",input:"{}",budget:modelBudget("gpt-6-astra"),
      estimatedTokens:24,sourceIds:[]};
    const receipt={position:0,id:randomUUID(),call:{kind:"attack",actorId:w.hero,
      targetId:w.npc,dc:null,itemId:null,scope:null},result:{kind:"attack"}};
    const response=await provider.next(context,input,[receipt],[],caps,claim.source);
    assert.equal(response.output.type,"final");
    const action=response.output.final.changes.find((c)=>c.family==="encounter_participants");
    assert.equal(action.id,participant);
    assert.equal(action.values.public_resources.action,0);
    assert.equal(action.values.public_resources.move,1);
    assert.equal(action.values.public_resources.withdrawn,false);
    assert.equal(bodies.length,1);
    assert.equal(bodies[0].model,"gpt-6-astra");
    assert.deepEqual(bodies[0].reasoning,{effort:"high"});
    assert.equal(bodies[0].service_tier,"default");
    assert.equal(bodies[0].store,false);
    assert.equal(bodies[0].text.format.strict,true);
    const narration=await provider.narrate(context,input);
    assert.equal(narration.output.narration,"The opponent stands before you.");
    assert.equal(bodies.length,2);
    assert.equal(bodies[1].model,"gpt-6-astra");
    assert.deepEqual(bodies[1].reasoning,{effort:"medium"});
    assert.equal(bodies[1].service_tier,"default");
    assert.equal(bodies[1].store,false);
  } finally {await f.db.close();}
});

test("post-takeover provider contract parses bounded settlement intent without raw changes",async()=>{
  const cid=randomUUID(),hero=randomUUID(),npc=randomUUID(),op=randomUUID();
  const input={operationId:op,campaignId:cid,expectedRevision:3,mode:"game",
    input:"I accept the packing job.",companionId:null,listenerIds:[],mechanic:null};
  const source={worldTakeover:{presentEntityIds:[hero,npc],
    actors:[{entityId:npc,publicName:"Trader"}]},
    snapshot:{entities:[{id:npc,kind:"npc"}],items:[]},
    runtime:{configuration:{controlledEntityIds:[hero]},participants:[]},
    astraSettlementCurrencies:[],astraSettlementJobs:[]};
  const caps={entityIds:[hero,npc],itemIds:[],toolItemIds:[],
    locationIds:[],participantIds:[],resources:{[hero]:[],[npc]:[]}};
  const settlement={kind:"job_offer",issuerId:npc,title:"Pack the crates",
    description:"Pack the vegetable crates.",currencyName:"silver",
    currencyAmount:2,itemName:"vegetables",itemCategory:"food",
    itemDescription:null};
  const raw={type:"final",call:null,final:{schemaVersion:1,worldMinutes:0,
    changes:[],outcomes:[],privatePatches:[],settlement}};
  let schema;
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_url,init)=>{
    schema=JSON.parse(init.body).text.format.schema;
    return new Response(JSON.stringify({model:"gpt-6-astra",status:"completed",
      output:[{type:"message",role:"assistant",status:"completed",
        content:[{type:"output_text",text:JSON.stringify(raw)}]}],
      usage:{input_tokens:5,output_tokens:5}}));
  }});
  const context={instructions:"Private authoring",input:"{}",
    budget:modelBudget("gpt-6-astra"),estimatedTokens:12,sourceIds:[]};
  const parsed=await provider.next(context,input,[],[],caps,source);
  assert.deepEqual(parsed.output.final.settlement,settlement);
  const finalSchema=schema.properties.final.anyOf.find((entry)=>entry.type==="object");
  assert.ok(finalSchema.required.includes("settlement"));
  assert.equal(finalSchema.properties.settlement.anyOf.at(-1).type,"null");
  const directGift={kind:"mundane_grant",issuerId:npc,recipientId:hero,
    currencyName:"silver",currencyAmount:2,itemName:"bread",
    itemCategory:"food",itemDescription:null};
  raw.final.settlement=directGift;
  assert.deepEqual((await provider.next(context,input,[],[],caps,source)).output.final.settlement,
    directGift);
  const itemId=randomUUID();
  source.snapshot.items.push({id:itemId,owner_entity_id:npc,
    equipped_entity_id:null,equipped_slot:null,category:"food",mechanics:""});
  source.astraSettlementCurrencies.push({id:"currency:silver",label:"silver",
    resourceKey:"currency_silver",version:1});
  const purchase={kind:"mundane_purchase",sellerId:npc,recipientId:hero,
    itemId,quantity:1,currencyName:"silver",price:2};
  raw.final.settlement=purchase;
  assert.deepEqual((await provider.next(context,input,[],[],caps,source)).output.final.settlement,
    purchase);
  const purchaseSchema=schema.properties.final.anyOf.find((entry)=>entry.type==="object")
    .properties.settlement.anyOf.find((entry)=>
      entry.type==="object" && entry.properties.kind.enum[0]==="mundane_purchase");
  assert.deepEqual(purchaseSchema.properties.itemId.enum,[itemId]);
  assert.deepEqual(purchaseSchema.properties.currencyName.enum,["silver"]);
  raw.final.settlement={...purchase,price:undefined};
  await assert.rejects(provider.next(context,input,[],[],caps,source),
    {name:"DmError"});
});
