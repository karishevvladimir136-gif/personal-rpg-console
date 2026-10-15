import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { compileGenericOperations, genericPublication } from "../src/lib/gameplay/astra-generic-compiler.ts";
import { genericManifest, genericResponseSchema, parseGenericDecision } from "../src/lib/gameplay/astra-generic-contract.ts";
import {astraPlanResponseSchema} from "../src/lib/gameplay/astra-plan-schema.ts";
const p=text=>({source:"inline",text});
const ref=key=>({source:"local",key});
const known=key=>({source:"known",key});
const operation=(opId,kind,extra,atomicGroup=null)=>({opId,kind,requiresOperations:[],atomicGroup,...extra});
function fixture(){
  const cid=randomUUID(),hero=randomUUID(),pack=randomUUID(),location=randomUUID();
  const source={ownerId:randomUUID(),astraResponseContract:"unified-v1",astraResponseMode:"public-unified",privateState:{},historyComplete:true,
    snapshot:{campaign:{id:cid},entities:[{id:hero,campaign_id:cid,revision:1,kind:"player",name:"Ari",details:"A traveller",
      hp:10,max_hp:10,stats:{attack:1,defense:11,skill:2},resources:{currency_silver:5,focus:2},equipment_slots:[],conditions:[]}],
      storages:[{id:pack,campaign_id:cid,revision:1,name:"Pack",kind:"player",entity_id:hero}],items:[],quests:[],documents:[],
      scenes:[{title:"Village square",body:"A lead mentions a miller."}],locations:[{id:location,campaign_id:cid,revision:1,name:"Village",description:"A village",status:"visited"}],
      publicState:{campaign_id:cid,revision:1,current_location_id:location}},
    runtime:{campaignId:cid,revision:1,worldMinutes:0,configuration:{profile:"console-basic-v1",controlledEntityIds:[hero],presentEntityIds:[hero],
      nearbyStorageIds:[],safeLocationIds:[],itemRules:[]},encounters:[],participants:[],restRecords:[]},
    astraSettlementCurrencies:[{id:"currency:silver",label:"silver",resourceKey:"currency_silver",version:1}],astraProgressionState:{currencies:[{id:"currency:silver",label:"silver",resourceKey:"currency_silver",version:1}],version:1},astraSettlementJobs:[]};
  const input={campaignId:cid,operationId:randomUUID(),expectedRevision:1,input:"I accept.",mode:"game"};
  return {source,input,hero};
}
const npc=(id="miller",group=null)=>operation(id,"entity.upsert",{target:null,name:p(id==="miller"?"Hobb":"Baker"),description:p("An ordinary local."),profile:null,present:true},group);
const silver={existing:"currency_silver",publicName:null};
test("generic contract has six families and no raw record change authoring",()=>{
  const {source,input}=fixture(),schema=genericResponseSchema(source,input);
  assert.equal(schema.$defs.operation.anyOf.length,6);
  assert.equal(schema.additionalProperties,false);
  source.astraStateContract="generic-v1";
  const providerSchema=astraPlanResponseSchema(input,{},source);
  const walk=value=>{if(Array.isArray(value))value.forEach(walk);else if(value && typeof value==="object"){
    if(value.$ref)assert.ok(value.$ref.split('/').slice(1).reduce((v,k)=>v?.[k],providerSchema),`unresolved ${value.$ref}`);
    Object.values(value).forEach(walk);}};walk(providerSchema);
  assert.throws(()=>parseGenericDecision({type:"final",toolRequest:null,final:{}}));
  assert.throws(()=>parseGenericDecision({type:"final",toolRequest:null,final:{},sql:"bad"}));
});
test("current DM judgment creates issuer and accepted job with backward refs without historical receipt",()=>{
  const {source,input}=fixture();
  const job=operation("delivery-job","quest.mutate",{mutation:{action:"create",title:p("Pack crates"),description:p("Pack the crates for two silver."),
    issuer:ref("miller"),reward:{currency:silver,amount:2,item:null},basis:{source:"public-evidence",key:"input/current"}}},"agreement");
  const plan=compileGenericOperations(source,input,[npc("miller","agreement"),job]);
  assert.deepEqual(plan.accepted,["miller","delivery-job"]);assert.equal(plan.jobs.length,1);
  assert.equal(plan.resolution.changes.filter(v=>v.family==="entities")[0].values.resources.currency_silver,undefined);
  assert.equal(source.snapshot.entities.length,1,"compiler never mutates original source");
});
test("unseeded bread purchase creates stock and conserves real payment atomically",()=>{
  const {source,input}=fixture();
  const bread=operation("bread","item.mutate",{mutation:{action:"create",name:p("Bread"),description:null,category:"food",quantity:1,owner:ref("baker"),storage:null,basis:null}},"exchange");
  const payment=operation("payment","resource.adjust",{mutation:{action:"transfer",from:known("hero"),to:ref("baker"),currency:silver,amount:2,basis:null}},"exchange");
  const transfer=operation("receive","item.mutate",{mutation:{action:"transfer",target:ref("bread"),quantity:1,recipient:known("hero"),storage:null,basis:null}},"exchange");
  const ops=[npc("baker","exchange"),bread,payment,transfer];
  const plan=compileGenericOperations(source,input,ops);
  assert.equal(plan.rejected.length,0);assert.equal(plan.accepted.length,4);
  assert.equal(plan.resolution.changes.find(v=>v.family==="items").values.owner_entity_id,source.snapshot.entities[0].id);
  assert.equal(plan.resolution.changes.find(v=>v.id===source.snapshot.entities[0].id).values.resources.currency_silver,3);
  const failed=structuredClone(ops);failed[3].mutation.quantity=2;
  const rejection=compileGenericOperations(source,input,failed);
  assert.deepEqual(rejection.resolution.changes,[]);assert.deepEqual(rejection.accepted,[]);
});
test("untracked, positive, insufficient and explicit-zero payer balances remain distinct",()=>{
  for(const balance of [undefined,3,1,0]){
    const {source,input}=fixture(),payer=randomUUID();
    source.snapshot.entities.push({...structuredClone(source.snapshot.entities[0]),id:payer,kind:"npc",name:"Hobb",resources:balance===undefined?{}:{currency_silver:balance}});
    source.runtime.configuration.presentEntityIds.push(payer);
    const payerKey=Object.entries(genericManifest(source,input).records).find(([,v])=>v.id===payer)[0];
    const grant=operation("reward","resource.adjust",{mutation:{action:"delta",actor:known("hero"),resource:{kind:"currency",currency:silver},amount:2,payer:known(payerKey),basis:null}});
    const plan=compileGenericOperations(source,input,[grant]);
    assert.equal(plan.accepted.length,balance===undefined||balance===3?1:0);
    if(balance===3)assert.equal(plan.resolution.changes.find(v=>v.id===payer).values.resources.currency_silver,1);
    if(balance===undefined)assert.ok(!plan.resolution.changes.some(v=>v.id===payer));
  }
});
test("private-informed inline text rejected, exact public quotation accepted",()=>{
  const {source,input}=fixture();source.astraResponseMode="private-informed";
  assert.equal(compileGenericOperations(source,input,[npc()]).accepted.length,0);
  source.snapshot.scenes[0].body="Hobb is the miller.";
  const quoted=npc();quoted.name={source:"public-evidence",evidence:"scene-0",text:"Hobb"};
  quoted.description={source:"public-evidence",evidence:"scene-0",text:"Hobb is the miller."};
  assert.equal(compileGenericOperations(source,input,[quoted]).accepted.length,1);
});
test("optional operation rejection retains independent narration, visual and locale dependencies filter",()=>{
  const result=genericPublication({beats:[{text:"Hobb waits.",requiresOperations:[]},{text:"You receive bread.",requiresOperations:["bread"]}],
    visualDescription:{text:"Bread in hand",requiresOperations:["bread"]},sceneLocale:{label:"Village Mill",requiresOperations:[]}},[]);
  assert.equal(result.narration,"Hobb waits.");assert.equal(result.visualDescription,"");assert.equal(result.sceneLocale,"Village Mill");
});
test("same operation refs derive exact stable IDs; foreign and forward handles fail without writes",()=>{
  const {source,input}=fixture();
  const first=compileGenericOperations(source,input,[npc()]),second=compileGenericOperations(source,input,[npc()]);
  assert.deepEqual(first,second);
  const bad=operation("lose","resource.adjust",{mutation:{action:"transfer",from:known("foreign"),to:known("hero"),currency:silver,amount:2,basis:null}});
  assert.deepEqual(compileGenericOperations(source,input,[bad]).resolution.changes,[]);
});
