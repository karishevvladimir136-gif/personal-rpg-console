import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { planAstraSettlement } from "../src/lib/gameplay/astra-settlement.ts";

function purchaseFixture() {
  const cid=randomUUID(),heroId=randomUUID(),sellerId=randomUUID();
  const heroStorageId=randomUUID(),sellerStorageId=randomUUID(),itemId=randomUUID();
  const input={operationId:randomUUID(),campaignId:cid,mode:"game"};
  const hero={id:heroId,campaign_id:cid,kind:"player",revision:1,
    resources:{currency_silver:3}};
  const seller={id:sellerId,campaign_id:cid,kind:"npc",revision:1,
    resources:{currency_silver:1}};
  const item={id:itemId,campaign_id:cid,revision:1,quantity:2,
    owner_entity_id:sellerId,storage_id:sellerStorageId,name:"bread",
    category:"food",description:"A plain loaf.",mechanics:"",
    equipped_entity_id:null,equipped_slot:null};
  const source={worldTakeover:{presentEntityIds:[heroId,sellerId],
      actors:[{entityId:sellerId,publicName:"Baker"}]},
    runtime:{configuration:{controlledEntityIds:[heroId]}},
    snapshot:{campaign:{id:cid},entities:[hero,seller],items:[item],
      storages:[{id:heroStorageId,campaign_id:cid,kind:"player",
        entity_id:heroId},{id:sellerStorageId,campaign_id:cid,
        kind:"npc",entity_id:sellerId}],quests:[]},
    astraSettlementCurrencies:[{id:"currency:silver",label:"silver",
      resourceKey:"currency_silver",version:1}],
    astraSettlementItemPolicies:[]};
  const intent={kind:"mundane_purchase",sellerId,recipientId:heroId,
    itemId,quantity:1,currencyName:"silver",price:2};
  return {source,input,intent,heroId,sellerId,itemId};
}

test("Astra purchase deterministically exchanges existing mundane stock and funds",()=>{
  const {source,input,intent,heroId,sellerId,itemId}=purchaseFixture();
  const plan=planAstraSettlement(source,input,intent,[]);
  assert.equal(plan.kind,"mundane_purchase");
  assert.equal(plan.currencyDefinition,null);
  assert.equal(plan.publicOutcome.currency.amount,-2);
  assert.equal(plan.publicOutcome.currency.after,1);
  assert.equal(plan.publicOutcome.item.name,"bread");
  assert.deepEqual(plan.changes.map((c)=>c.family),
    ["entities","entities","items","items"]);
  assert.deepEqual(plan.changes.slice(0,2).map((c)=>[c.id,
    c.values.resources.currency_silver]),[[heroId,1],[sellerId,3]]);
  assert.equal(plan.changes[2].id,itemId);
  assert.equal(plan.changes[2].values.quantity,1);
  assert.equal(plan.changes[3].expectedRevision,null);
  assert.equal(plan.changes[3].id,plan.publicOutcome.item.id);
  assert.deepEqual(planAstraSettlement(source,input,intent,[]),plan);
});

test("Astra purchase rejects absent funds, seller, stock, policy permission and overlap",()=>{
  const {source,input,intent,heroId,itemId}=purchaseFixture();
  assert.throws(()=>planAstraSettlement(source,input,{...intent,price:4},[]));
  assert.throws(()=>planAstraSettlement(source,input,{...intent,price:21},[]));
  assert.throws(()=>planAstraSettlement(source,input,{...intent,quantity:3},[]));
  assert.throws(()=>planAstraSettlement(source,input,{...intent,
    sellerId:randomUUID()},[]));
  assert.throws(()=>planAstraSettlement(source,input,intent,[
    {family:"entities",id:heroId,expectedRevision:1,values:{hp:10}}]));
  source.worldTakeover.actors=[];
  assert.throws(()=>planAstraSettlement(source,input,intent,[]));
  source.worldTakeover.actors=[{entityId:intent.sellerId,publicName:"Baker"}];
  source.astraSettlementItemPolicies=[{itemId,visibility:"public",trade:"restricted"}];
  assert.throws(()=>planAstraSettlement(source,input,intent,[]));
  source.astraSettlementItemPolicies=[];
  source.astraSettlementCurrencies=[];
  assert.throws(()=>planAstraSettlement(source,input,intent,[]));
});
