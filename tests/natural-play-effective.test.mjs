import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture } from "./phase2-mechanics-fixtures.mjs";
import { effectiveNaturalRecordIds, effectiveNaturalChanges,
  pruneRejectedPromotionIntents } from "../src/lib/gameplay/astra-natural-effective.ts";
import { materializeNaturalSubject, projectNaturalSource } from "../src/lib/gameplay/astra-natural-promotion.ts";
import { planAstraOrderedEffects } from "../src/lib/gameplay/astra-ordered-effects.ts";

const change=(family,id,values={})=>({family,id,expectedRevision:null,values});
const receipt=(recordId,kind,purpose,changes=[],ownerRef=null)=>({position:0,recordId,
  request:{subjectRef:`subject:${recordId}`,kind,purpose,ownerRef},changes});
const state=(...materializations)=>({schemaVersion:1,materializations:materializations.map((row,position)=>({...row,position}))});
const plan=(intents,indices=[],rejected=[])=>({schemaVersion:2,effects:indices.map(index=>({intent:intents[index]})),
  indices,intents,rejected:rejected.map(index=>({index,reason:"not_authorized"}))});
const purchase=(sellerId,itemId,recipientId="hero",price=1)=>({kind:"mundane_purchase",sellerId,itemId,
  recipientId,quantity:1,currencyName:"silver",price});

test("unaccepted optional promotion creates no durable record while explicit inventory/track/recurring remain",()=>{
  const s=state(receipt("merchant","npc","trade"),receipt("worker","npc","job"),
    receipt("friend","npc","party"),receipt("rat","creature","combat"),
    receipt("bread","item","inventory"),receipt("tree","place","track"),
    receipt("guide","npc","recurring"),receipt("invalid-inventory","npc","inventory"));
  const original=structuredClone(s);
  assert.deepEqual(effectiveNaturalRecordIds(s,null,[]),["bread","tree","guide"]);
  assert.deepEqual(effectiveNaturalChanges({...s,effectiveRecordIds:[]}),[]);
  assert.deepEqual(s,original,"Selection is pure and does not promote or mutate receipts");
});

test("accepted kind-specific use and recorded attack select only their authorized materializations",()=>{
  const s=state(receipt("merchant","npc","trade"),receipt("stock","item","trade"),
    receipt("worker","npc","job"),receipt("friend","npc","party"),
    receipt("rat","creature","combat"),receipt("other-rat","creature","combat"),
    receipt("invalid-place","place","trade"));
  const intents=[purchase("merchant","stock"),{kind:"job_offer",issuerId:"worker"},
    {kind:"companion_join",entityId:"friend"},purchase("invalid-place","missing")];
  assert.deepEqual(effectiveNaturalRecordIds(s,plan(intents,[0,1,2,3]),[
    {call:{kind:"attack",actorId:"hero",targetId:"rat"}},
    {call:{kind:"skill",actorId:"other-rat",targetId:null}},
    {call:{kind:"damage",actorId:"other-rat",targetId:"hero"}}]),["merchant","stock","worker","friend","rat"]);
  assert.deepEqual(effectiveNaturalRecordIds(state(receipt("giver","npc","trade")),
    plan([{kind:"mundane_grant",issuerId:"giver"}],[0]),[]),["giver"]);
});

test("owner and FK dependencies retain minimum primary closure in stable receipt order",()=>{
  const s=state(receipt("merchant","npc","trade",[change("entities","merchant")]),
    receipt("stock","item","trade",[change("storages","shelf",{entity_id:"merchant"}),
      change("items","stock",{storage_id:"shelf",owner_entity_id:"merchant"})],"subject:merchant"),
    receipt("unused","npc","trade",[change("entities","unused")]));
  const selected=effectiveNaturalRecordIds(s,plan([purchase("merchant","stock")],[0]),[]);
  assert.deepEqual(selected,["merchant","stock"]);
  assert.deepEqual(effectiveNaturalChanges({...s,effectiveRecordIds:selected}).map(row=>row.id),["merchant","shelf","stock"]);
  const mapped=state(receipt("existing","npc","trade",[]));
  assert.deepEqual(effectiveNaturalRecordIds(mapped,plan([{kind:"currency_transfer",sourceEntityId:"existing"}],[0]),[]),["existing"]);
});

test("rejected stock A cannot persist merely because accepted stock B needs its shared merchant storage",()=>{
  const s=state(receipt("merchant","npc","trade",[change("entities","merchant")]),
    receipt("stock-a","item","trade",[change("storages","shared-shelf",{entity_id:"merchant"}),
      change("items","stock-a",{storage_id:"shared-shelf",owner_entity_id:"merchant"})],"subject:merchant"),
    receipt("stock-b","item","trade",[change("items","stock-b",{storage_id:"shared-shelf",owner_entity_id:"merchant"})],"subject:merchant"));
  const intents=[purchase("merchant","stock-a"),purchase("merchant","stock-b")],p=plan(intents,[1],[0]);
  const active=effectiveNaturalRecordIds(s,p,[]);
  assert.deepEqual(active,["merchant","stock-b"]);
  const changes=effectiveNaturalChanges({...s,effectiveRecordIds:active});
  assert.deepEqual(changes.map(row=>row.id),["merchant","shared-shelf","stock-b"]);
  const normalized=pruneRejectedPromotionIntents(p,intents,active,s);
  assert.deepEqual(normalized[0],{kind:"unsupported_optional",description:"Uncommitted optional materialization"});
  assert.equal(normalized[1],intents[1],"Accepted original effect keeps its position and object");
  changes[0].values.name="modified copy";
  assert.equal(s.materializations[0].changes[0].values.name,undefined);
});

test("normalization touches only already rejected typed promotion references, never prose or foreign IDs",()=>{
  const s=state(receipt("inactive","npc","trade"));
  const intents=[purchase("inactive","owned-item"),{kind:"unsupported_optional",description:"inactive"},
    purchase("foreign","owned-item"),purchase("inactive","owned-item")];
  const p=plan(intents,[3],[0,1,2]);
  const normalized=pruneRejectedPromotionIntents(p,intents,[],s);
  assert.equal(normalized[0].kind,"unsupported_optional");
  assert.equal(normalized[1],intents[1]);
  assert.equal(normalized[2],intents[2],"A genuinely foreign identity is not masked");
  assert.equal(normalized[3],intents[3],"Accepted effects are never normalized even with inconsistent caller IDs");
  assert.deepEqual(pruneRejectedPromotionIntents(null,intents,[],s),intents);
});

function setup(){
  const source=fixture(),hero=source.snapshot.entities[0].id;
  source.runtime.configuration.controlledEntityIds=[hero];
  source.astraNaturalContract="natural-v1";
  source.worldTakeover={schemaVersion:1,sourceWorldRevision:1,
    presentEntityIds:[...source.runtime.configuration.presentEntityIds],
    routeLocationIds:[source.snapshot.publicState.current_location_id],
    actors:source.snapshot.entities.map(row=>({entityId:row.id,publicName:row.name,
      publicCapabilities:[],publicLimitations:[],publicKnowledge:[]})),
    policy:{},unresolvedThreads:[],recentWorldEvents:[]};
  source.astraSettlementCurrencies=[{id:"currency:silver",label:"silver",resourceKey:"currency_silver",version:1}];
  source.snapshot.entities[0].resources.currency_silver=1;
  const input={campaignId:source.snapshot.campaign.id,operationId:randomUUID(),
    expectedRevision:source.runtime.revision,mode:"game",input:"I ask merchant about bread and apple.",
    companionId:null,listenerIds:[],mechanic:null};
  let virtual=source;
  for(const [name,kind,ownerRef] of [["merchant","npc",null],["bread","item","input:merchant"],["apple","item","input:merchant"]])
    virtual=materializeNaturalSubject(virtual,input,{subjectRef:`input:${name}`,kind,purpose:"trade",ownerRef},
      virtual.astraNaturalState?.materializations.length??0).source;
  return {source,virtual,input,hero,receipts:virtual.astraNaturalState.materializations};
}

test("production materializer/planner rejects unaffordable sibling, then replans only accepted purchase and its FK closure",()=>{
  const f=setup(),[merchant,bread,apple]=f.receipts;
  const intents=[purchase(merchant.recordId,bread.recordId,f.hero,2),purchase(merchant.recordId,apple.recordId,f.hero,1)];
  const base={changes:[],outcomes:[],worldMinutes:f.source.runtime.worldMinutes,configuration:f.virtual.runtime.configuration};
  const first=planAstraOrderedEffects(f.virtual,f.input,intents,base);
  assert.deepEqual(first.indices,[1]);assert.deepEqual(first.rejected,[{index:0,reason:"not_authorized"}]);
  const active=effectiveNaturalRecordIds(f.virtual.astraNaturalState,first,[]);
  assert.deepEqual(active,[merchant.recordId,apple.recordId]);
  const s={...f.virtual.astraNaturalState,effectiveRecordIds:active};
  const changes=effectiveNaturalChanges(s);
  assert.equal(changes.filter(row=>row.family==="storages").length,1);
  assert.ok(!changes.some(row=>row.id===bread.recordId));
  const projected=projectNaturalSource(f.source,s);
  assert.ok(!projected.snapshot.items.some(row=>row.id===bread.recordId));
  assert.ok(projected.snapshot.items.some(row=>row.id===apple.recordId));
  assert.equal(projected.snapshot.entities.filter(row=>row.id===merchant.recordId).length,1);
  const normalized=pruneRejectedPromotionIntents(first,intents,active,s);
  const second=planAstraOrderedEffects(projected,f.input,normalized,{...base,configuration:projected.runtime.configuration});
  assert.deepEqual(second.indices,[1]);
  assert.equal(second.effects[0].publicOutcome.item.id,apple.recordId);
  assert.equal(second.resolution.changes.find(row=>row.family==="entities"&&row.id===f.hero).values.resources.currency_silver,0);
  assert.equal(f.source.snapshot.entities[0].resources.currency_silver,1,"Planning does not change authoritative input");
});

test("production planner scope rejects actual foreign IDs before pruning can be considered",()=>{
  const f=setup(),base={changes:[],outcomes:[],worldMinutes:f.source.runtime.worldMinutes,configuration:f.source.runtime.configuration};
  assert.throws(()=>planAstraOrderedEffects(f.virtual,f.input,[purchase(randomUUID(),f.receipts[1].recordId,f.hero)],base));
});
