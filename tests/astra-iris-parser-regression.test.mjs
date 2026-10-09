import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { createIrisWorld,irisInput,irisSnapshot,irisTurn } from "./astra-iris-fixture.mjs";

const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ?{url:"data:text/javascript,export%20{}",shortCircuit:true}
    :nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

const final=(effects=[],worldMinutes=0)=>({type:"final",call:null,final:{
  schemaVersion:1,worldMinutes,changes:[],outcomes:[],privatePatches:[],effects}});
function mockProvider(plan,narration="The seller answers Iris."){
  const calls=[];
  const diagnostics=[];
  const provider=createAstraPrimaryProvider({apiKey:"synthetic-only",
    planDiagnosticObserver:(diagnostic)=>diagnostics.push(diagnostic),
    fetcher:async(_url,init)=>{
    const request=JSON.parse(init.body);
    const stage=request.text?.format?.name;
    calls.push({stage,schema:request.text?.format?.schema});
    const output=stage==="dm_narrate"
      ?{narration,visualDescription:"",clarification:null}
      :plan;
    return new Response(JSON.stringify({model:"gpt-6-astra",status:"completed",
      output:[{type:"message",role:"assistant",status:"completed",
        content:[{type:"output_text",text:JSON.stringify(output)}]}],
      usage:{input_tokens:5,output_tokens:5}}));
  }});
  return {provider,calls,diagnostics};
}

test("Iris public-history reward grants two silver and vegetables with no Currency or Quest seed",async()=>{
  const world=await createIrisWorld();
  try {
    const {f,hero,seller,state}=world;
    assert.equal(state.quests,0);assert.deepEqual(state.currencies,[]);
    const {provider,calls}=mockProvider(final([{kind:"mundane_grant",issuerId:seller,
      recipientId:hero,currencyName:"silver",currencyAmount:2,
      itemName:"vegetables",itemCategory:"food",itemDescription:null}]));
    const observed={...provider,next:async(...args)=>{
      const source=args[5];
      assert.deepEqual(source.astraSettlementJobs,[]);
      assert.deepEqual(source.astraSettlementCurrencies,[]);
      return provider.next(...args);
    }};
    const {result}=await irisTurn(world,observed);
    assert.equal(result.status,"committed");
    assert.deepEqual(calls.map((call)=>call.stage),["dm_plan","dm_narrate"]);
    const effects=calls[0].schema.properties.final.anyOf.find((node)=>node.type==="object")
      .properties.effects.items.anyOf;
    assert.ok(effects.some((node)=>node.properties?.kind.enum[0]==="mundane_grant"));
    const after=await irisSnapshot(f,hero);
    assert.equal(after.resources.currency_silver,2);
    assert.equal(after.items.find((item)=>item.name==="vegetables")?.quantity,1);
    assert.equal(after.quests,0,"history-only debt does not invent a Quest");
    assert.equal(after.completed_rests,0);
    assert.equal(after.hp,10);
  } finally {await world.f.db.close();}
});

test("Iris lodging conversation remains fiction; absent supplies reject formal recovery",async()=>{
  const world=await createIrisWorld();
  try {
    const before=await irisSnapshot(world.f,world.hero);
    const talk=mockProvider(final([]),"The seller offers a dry corner of the loft tonight. Morning work can be discussed then.");
    const first=await irisTurn(world,talk.provider,irisInput);
    assert.equal(first.result.status,"committed");
    assert.equal((await irisSnapshot(world.f,world.hero)).completed_rests,0);
    const rest=mockProvider(final([{kind:"formal_rest",restKind:"long",
      restSafety:{locationId:before.location_id,suitable:true}}]),
      "The loft is available, but Iris has no supplies for a formal long rest. No recovery is recorded.");
    const second=await irisTurn(world,rest.provider,"I try to complete a formal long rest in the loft.");
    assert.equal(second.result.status,"committed");
    const after=await irisSnapshot(world.f,world.hero);
    assert.equal(after.completed_rests,0);
    assert.equal(after.hp,before.hp);assert.deepEqual(after.resources,before.resources);
    assert.deepEqual(after.items,before.items);
    assert.equal(after.world_minutes,before.world_minutes);
  } finally {await world.f.db.close();}
});

test("Iris malformed planning output fails closed without durable reward",async()=>{
  const world=await createIrisWorld();
  try {
    const before=await irisSnapshot(world.f,world.hero);
    const malformed=final([{kind:"mundane_grant",issuerId:world.seller,
      recipientId:world.hero,currencyName:"silver",currencyAmount:2,
      itemName:"vegetables",itemCategory:"food",itemDescription:null}]);
    delete malformed.final.effects[0].recipientId;
    const {provider,calls,diagnostics}=mockProvider(malformed);
    const {result}=await irisTurn(world,provider);
    assert.equal(result.status,"failed");
    assert.deepEqual(calls.map((call)=>call.stage),["dm_plan"]);
    assert.deepEqual(diagnostics,[{httpStatus:200,phase:"output-parse",
      resultStatus:"validation",reasonCode:"decision_effect_fields"}]);
    assert.deepEqual(await irisSnapshot(world.f,world.hero),before);
  } finally {await world.f.db.close();}
});
