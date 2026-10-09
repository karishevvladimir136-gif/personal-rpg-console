import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { astraCapabilities } from "../src/lib/gameplay/astra-primary.ts";
import { modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { fixture as mechanicFixture } from "./phase2-mechanics-fixtures.mjs";
import { astraMechanicActionKinds } from "../src/lib/gameplay/astra-mechanics.ts";
const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
    : nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import(
  "../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

// Offline subset and budget gate from the official Structured Outputs guide:
// https://developers.openai.com/api/docs/guides/structured-outputs
// Live acceptance remains a separate required gate.
function assertProviderSchema(schema){
  assert.equal(schema.type,"object");
  assert.equal(schema.anyOf,undefined);
  const stats={properties:0,enums:0,identifierChars:0,maxDepth:0};
  const allowed=new Set(["type","properties","required","additionalProperties","enum",
    "items","anyOf","$ref","$defs","minLength","maxLength"]);
  const visit=(node,depth,count=true)=>{
    assert.ok(node && typeof node==="object" && !Array.isArray(node));
    for(const key of Object.keys(node))assert.ok(allowed.has(key),`unsupported keyword ${key}`);
    if(node.$ref){
      assert.deepEqual(Object.keys(node),["$ref"]);
      const name=node.$ref.match(/^#\/\$defs\/([A-Za-z0-9]+)$/)?.[1];
      assert.ok(name && schema.$defs?.[name]);
      visit(schema.$defs[name],depth,false);
      return;
    }
    const types=Array.isArray(node.type)?node.type:[node.type];
    if(node.minLength!==undefined || node.maxLength!==undefined){
      assert.deepEqual(types,["string"]);
      assert.ok(Number.isSafeInteger(node.minLength) && node.minLength>=0);
      assert.ok(Number.isSafeInteger(node.maxLength) && node.maxLength>=node.minLength);
    }
    if(node.anyOf){
      assert.ok(node.anyOf.length>=2);
      node.anyOf.forEach((branch)=>visit(branch,depth,count));
    } else assert.ok(types.every((type)=>["object","array","string","integer","boolean","null"].includes(type)));
    if(types.includes("object")){
      assert.equal(node.additionalProperties,false);
      assert.deepEqual(node.required,Object.keys(node.properties));
      if(count){stats.properties+=node.required.length;
        stats.identifierChars+=node.required.join("").length;}
      Object.values(node.properties).forEach((child)=>visit(child,depth+1,count));
    }
    if(types.includes("array"))visit(node.items,depth+1,count);
    if(node.enum){
      assert.ok(node.enum.length>0);
      assert.equal(new Set(node.enum).size,node.enum.length,"enum values are unique");
      if(count)stats.enums+=node.enum.length;
      const chars=node.enum.filter((value)=>typeof value==="string").join("").length;
      if(count)stats.identifierChars+=chars;
      if(node.enum.length>250)assert.ok(chars<=15000);
    }
    stats.maxDepth=Math.max(stats.maxDepth,depth);
  };
  visit(schema,0);
  stats.identifierChars+=Object.keys(schema.$defs??{}).join("").length;
  Object.values(schema.$defs??{}).forEach((definition)=>visit(definition,0));
  assert.ok(stats.properties<=5000);
  assert.ok(stats.enums<=1000);
  assert.ok(stats.identifierChars<=120000);
  assert.ok(stats.maxDepth<=10);
  return stats;
}
const resolved=(schema,node)=>node.$ref?schema.$defs[node.$ref.split("/").at(-1)]:node;

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

test("post-takeover provider contract parses bounded effects without raw changes",async()=>{
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
    changes:[],outcomes:[],privatePatches:[],effects:[settlement]}};
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
  assert.deepEqual(parsed.output.final.effects,[settlement]);
  const finalSchema=schema.properties.final.anyOf.find((entry)=>entry.type==="object");
  assertProviderSchema(schema);
  assert.ok(finalSchema.required.includes("effects"));
  assert.ok(!finalSchema.required.includes("settlement"));
  assert.ok(finalSchema.properties.effects.items.anyOf.some((entry)=>
    entry.properties?.kind.enum[0]==="unsupported_optional"));
  assert.ok(finalSchema.properties.effects.items.anyOf.some((entry)=>
    entry.properties?.kind.enum[0]==="mundane_sale"));
  assert.ok(finalSchema.properties.effects.items.anyOf.some((entry)=>
    entry.properties?.kind.enum[0]==="mundane_craft"));
  assert.ok(finalSchema.properties.effects.items.anyOf.some((entry)=>
    entry.properties?.kind.enum[0]==="item_exchange"));
  const directGift={kind:"mundane_grant",issuerId:npc,recipientId:hero,
    currencyName:"silver",currencyAmount:2,itemName:"bread",
    itemCategory:"food",itemDescription:null};
  raw.final.effects=[directGift,{kind:"unsupported_optional",description:"No lodging state"}];
  assert.deepEqual((await provider.next(context,input,[],[],caps,source)).output.final.effects,
    raw.final.effects);
  const itemId=randomUUID();
  source.snapshot.items.push({id:itemId,owner_entity_id:npc,
    equipped_entity_id:null,equipped_slot:null,category:"food",mechanics:""});
  source.astraSettlementCurrencies.push({id:"currency:silver",label:"silver",
    resourceKey:"currency_silver",version:1});
  const purchase={kind:"mundane_purchase",sellerId:npc,recipientId:hero,
    itemId,quantity:1,currencyName:"silver",price:2};
  raw.final.effects=[purchase];
  assert.deepEqual((await provider.next(context,input,[],[],caps,source)).output.final.effects,
    [purchase]);
  const purchaseSchema=schema.properties.final.anyOf.find((entry)=>entry.type==="object")
    .properties.effects.items.anyOf.find((entry)=>
      entry.type==="object" && entry.properties.kind.enum[0]==="mundane_purchase");
  assert.deepEqual(resolved(schema,purchaseSchema.properties.itemId).enum,[itemId]);
  assert.deepEqual(resolved(schema,purchaseSchema.properties.currencyName).enum,["silver"]);
  raw.final.effects=[{...purchase,price:undefined}];
  await assert.rejects(provider.next(context,input,[],[],caps,source),
    {name:"DmError"});
});

test("existing mechanics provider union is closed, bounded and uses only current IDs",async()=>{
  const source=mechanicFixture();
  const hero=source.runtime.configuration.controlledEntityIds[0];
  const npc=source.snapshot.entities.find((e)=>e.kind==="npc").id;
  source.worldTakeover={schemaVersion:1,presentEntityIds:source.runtime.configuration.presentEntityIds,
    routeLocationIds:source.snapshot.locations.map((l)=>l.id),actors:[{entityId:npc,publicName:"Trader"}]};
  const caps=astraCapabilities(source),cid=source.snapshot.campaign.id;
  const input={operationId:randomUUID(),campaignId:cid,expectedRevision:1,mode:"game",
    input:"I eat and sleep until morning.",companionId:null,listenerIds:[],mechanic:null};
  const safety={locationId:source.snapshot.publicState.current_location_id,suitable:true};
  const rest={kind:"formal_rest",restKind:"long",restSafety:safety};
  const supply=source.snapshot.items.find((i)=>i.name==="supply").id;
  const choices={kind:"mechanic_actions",actions:[{kind:"item.consume",actorId:hero,
    itemId:supply,quantity:1}],restSafety:null};
  const raw={type:"final",call:null,final:{schemaVersion:1,worldMinutes:0,
    changes:[],outcomes:[],privatePatches:[],effects:[rest,choices]}};
  let schema;
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_url,init)=>{
    schema=JSON.parse(init.body).text.format.schema;
    return new Response(JSON.stringify({model:"gpt-6-astra",status:"completed",
      output:[{type:"message",role:"assistant",status:"completed",content:[
        {type:"output_text",text:JSON.stringify(raw)}]}],usage:{input_tokens:1,output_tokens:1}}));
  }});
  const context={instructions:"Bounded existing choices",input:"{}",budget:modelBudget("gpt-6-astra"),
    estimatedTokens:12,sourceIds:[]};
  assert.deepEqual((await provider.next(context,input,[],[],caps,source)).output.final.effects,[rest,choices]);
  const stats=assertProviderSchema(schema);
  assert.ok(stats.maxDepth<=8,"adapter keeps provider nesting bounded");
  const effects=schema.properties.final.anyOf.find((node)=>node.type==="object").properties.effects;
  const mechanic=effects.items.anyOf.find((node)=>node.properties?.kind.enum[0]==="mechanic_actions");
  const formal=effects.items.anyOf.find((node)=>node.properties?.kind.enum[0]==="formal_rest");
  assert.deepEqual(mechanic.required,["kind","actions","restSafety"]);
  assert.deepEqual(mechanic.properties.actions.items.anyOf.map((node)=>node.properties.kind.enum[0]),
    [...astraMechanicActionKinds]);
  assert.deepEqual(resolved(schema,formal.properties.restSafety.anyOf[0].properties.locationId).enum,[safety.locationId]);
  assert.deepEqual(formal.properties.restSafety.anyOf[0].required,["locationId","suitable"]);
  const consume=mechanic.properties.actions.items.anyOf.find((node)=>node.properties.kind.enum[0]==="item.consume");
  assert.ok(resolved(schema,consume.properties.itemId).enum.includes(supply));
  assert.ok(!consume.required.some((key)=>["hp","revision","dice","changes"].includes(key)));
  for(const bad of [
    {...rest,hp:12},
    {...rest,restSafety:{...safety,reason:"extra authority"}},
    {...rest,restKind:"overnight"},
    {...choices,actions:[]},
    {...choices,actions:Array(7).fill(choices.actions[0])},
    {...choices,actions:[{...choices.actions[0],hp:12}]},
    {...choices,actions:[{...choices.actions[0],quantity:-1}]},
    {...choices,actions:[{kind:"forage",actorId:hero,outputStorageId:source.snapshot.storages[0].id}]},
  ]){
    raw.final.effects=[bad];
    await assert.rejects(provider.next(context,input,[],[],caps,source),{name:"DmError"});
  }
  raw.final.effects=Array(7).fill(rest);
  await assert.rejects(provider.next(context,input,[],[],caps,source),{name:"DmError"});
});

test("shared exact enum definitions keep a larger public inventory within provider budgets",async()=>{
  const source=mechanicFixture(),hero=source.runtime.configuration.controlledEntityIds[0];
  const npc=source.snapshot.entities.find((e)=>e.kind==="npc").id;
  const template=source.snapshot.items[0];
  source.snapshot.items=Array.from({length:160},(_,index)=>({...template,id:randomUUID(),
    name:`Ordinary stock ${index}`,category:"supply",quantity:1,mechanics:"",
    owner_entity_id:index<120?hero:npc,equipped_entity_id:null,equipped_slot:null}));
  source.worldTakeover={schemaVersion:1,presentEntityIds:source.runtime.configuration.presentEntityIds,
    routeLocationIds:source.snapshot.locations.map((l)=>l.id),actors:[{entityId:npc,publicName:"Trader"}]};
  const caps=astraCapabilities(source);
  let schema;
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",fetcher:async(_url,init)=>{
    schema=JSON.parse(init.body).text.format.schema;
    return new Response(JSON.stringify({model:"gpt-6-astra",status:"completed",
      output:[{type:"message",role:"assistant",status:"completed",content:[{type:"output_text",
        text:JSON.stringify({type:"final",call:null,final:{schemaVersion:1,worldMinutes:0,
          changes:[],outcomes:[],privatePatches:[],effects:[]}})}]}],usage:{input_tokens:1,output_tokens:1}}));
  }});
  await provider.next({instructions:"Current public stock",input:"{}",budget:modelBudget("gpt-6-astra"),
    estimatedTokens:12,sourceIds:[]},{operationId:randomUUID(),campaignId:source.snapshot.campaign.id},
    [],[],caps,source);
  const stats=assertProviderSchema(schema);
  assert.ok(stats.enums<650,"160 public Items fit below the 1000-value provider limit");
  const effects=schema.properties.final.anyOf.find((node)=>node.type==="object").properties.effects;
  const sale=effects.items.anyOf.find((node)=>node.properties?.kind.enum[0]==="mundane_sale");
  const consume=effects.items.anyOf.find((node)=>node.properties?.kind.enum[0]==="mechanic_actions")
    .properties.actions.items.anyOf.find((node)=>node.properties.kind.enum[0]==="item.consume");
  assert.deepEqual(resolved(schema,sale.properties.itemId).enum,caps.itemIds);
  assert.equal(resolved(schema,consume.properties.itemId).enum.length,160);
  assert.ok(sale.properties.itemId.$ref && consume.properties.itemId.$ref);
  assert.equal(schema.properties.final.anyOf[0].properties.outcomes.items.properties.itemIds.items.$ref,
    sale.properties.itemId.$ref,"identical selections share one exact definition");
});
