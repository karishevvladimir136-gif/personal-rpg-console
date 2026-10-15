import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
import { memorySource } from "./phase3-long-fixtures.mjs";
import { curateAstraContextSource, astraContextHasPrivateEvidence,
  projectAstraPublicSource } from "../src/lib/gameplay/astra-privacy-context.ts";
import { buildAstraPlanContext } from "../src/lib/gameplay/astra-plan-context.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { validateNaturalBehavior, projectNaturalBehavior } from "../src/lib/gameplay/astra-natural-behavior.ts";

function setup(){
  const f=runtimeFixture();
  f.source.astraResponseContract="unified-v1";
  f.source.astraNaturalContract="natural-v1";
  f.source.memory={campaignId:f.input.campaignId,generation:1,stateRevision:f.source.runtime.revision,
    checkpoint:null,exactEvents:[],historical:[],privateHistorical:[],publicSummary:null,privateSummary:null,complete:true};
  const actor={...f.source.snapshot.entities[0],id:randomUUID(),kind:"npc",name:"Nera"};
  f.source.snapshot.entities.push(actor);
  f.source.runtime.configuration.presentEntityIds.push(actor.id);
  const model={schemaVersion:1,actorId:actor.id,basisOperationId:null,
    identity:{values:["protect younger brother"],wants:["settle concealed debt"],
      boundaries:["withhold brass key until midnight"],loyalties:[],signatures:[],observableVoice:"Plain-spoken, short sentences."},
    current:{goal:"hide brass key",stress:"settled",preoccupation:null,obligation:"settle concealed debt"},
    beliefs:[],relationships:[],episodes:[]};
  f.source.privateState={npc:{[`character_${actor.id}`]:JSON.stringify(model)}};
  const context=text=>{
    const input={...f.input,operationId:randomUUID(),input:text};
    const selected=curateAstraContextSource(f.source,input);
    return {input,selected,context:buildAstraPlanContext(selected,input)};
  };
  return {...f,actor,model,context};
}

test("thirty realistic turns route by selected private evidence rather than the mere presence of a Character Model",()=>{
  const f=setup();
  const ordinary=[
    "Nera, good morning.","I ask Nera how the weather looks.","I greet the unnamed guard.",
    "I ask for directions to the mill.","I sit by the road and watch people pass.","I inspect an ordinary tree.",
    "I enter a nearby tavern.","I ask Nera for a cup of water.","I listen to the market crowd.",
    "I ask what bread costs.","I offer to sweep the floor for dinner.","I discuss the price of my rope.",
    "I ask a passerby which road leads west.","I read the public notice board.","I chat with Nera about the harvest.",
    "I look for a quiet room.","I describe my muddy boots.","I follow a stray dog.",
    "I ask whether the soup is warm.","I watch the sunset.","I ask Nera to tell a harmless joke.",
    "I study the public map.","I mention tomorrow's market.","I wait quietly in the square.",
  ];
  let publicCount=0,privateCount=0;
  for(const text of ordinary){
    const result=f.context(text);
    assert.equal(astraContextHasPrivateEvidence(result.context),false,text);
    assert.ok(result.context.input.includes("Plain-spoken, short sentences."));
    for(const secret of ["withhold brass key until midnight","settle concealed debt","protect younger brother"])
      assert.equal(result.context.input.includes(secret),false,text);
    publicCount++;
  }
  for(const text of ["Nera, may I borrow the brass key?","I ask about the concealed debt.",
    "I ask why she must protect her younger brother.","Why withhold the key until midnight?",
    "I offer help with Nera's concealed debt."]){
    assert.equal(astraContextHasPrivateEvidence(f.context(text).context),true,text);
    privateCount++;
  }
  const rowId=randomUUID();
  f.source.memory.privateHistorical=[memorySource(rowId,"Nera privately plans to refuse a request tonight.",{
    campaignId:f.input.campaignId,entityIds:[f.actor.id],
    ref:{campaignId:f.input.campaignId,kind:"private_event",id:rowId,version:"1",part:0,visibility:"private"}})];
  assert.equal(astraContextHasPrivateEvidence(f.context("I ask Nera for help.").context),true);
  privateCount++;
  assert.deepEqual({publicCount,privateCount},{publicCount:24,privateCount:6});
});

test("a secret-motivated refusal crosses only bounded observable behavior, never hidden cognition",()=>{
  const f=setup(),prepared=f.context("Nera, lend me the brass key.");
  assert.equal(astraContextHasPrivateEvidence(prepared.context),true);
  assert.ok(prepared.context.input.includes("withhold brass key until midnight"));
  const behavior=validateNaturalBehavior(prepared.selected,prepared.input,[{
    actorId:f.actor.id,stance:"refuse",tone:"guarded",intensity:2}]);
  const safe=projectAstraPublicSource(prepared.selected,prepared.input,{forNarration:true});
  const context=buildContext(safe,prepared.input,"narrate",{model:"gpt-6-astra"});
  const packet={...JSON.parse(context.input),behavior:projectNaturalBehavior(behavior)};
  assert.deepEqual(packet.behavior,[{actorId:f.actor.id,stance:"refuse",tone:"guarded",intensity:2}]);
  for(const secret of ["withhold brass key until midnight","settle concealed debt","protect younger brother"])
    assert.equal(JSON.stringify(packet).includes(secret),false);
  assert.ok(JSON.stringify(packet).includes("Plain-spoken, short sentences."));
});

test("natural selection keeps approved voice but does not alter legacy private Character Model routing",()=>{
  const f=setup();
  assert.equal(astraContextHasPrivateEvidence(f.context("Hello, Nera.").context),false);
  delete f.source.astraNaturalContract;
  assert.equal(astraContextHasPrivateEvidence(f.context("Hello, Nera.").context),true);
  const projected=projectAstraPublicSource(f.source,f.input,{forNarration:true});
  assert.deepEqual(projected.observableCharacters,[{actorId:f.actor.id,observableVoice:"Plain-spoken, short sentences."}]);
});

test("behavior bridge rejects hidden text, forged actors, duplicates and unsupported enum values",()=>{
  const f=setup(),input={...f.input,input:"I ask Nera for help."};
  const good={actorId:f.actor.id,stance:"refuse",tone:"firm",intensity:1};
  for(const bad of [
    [{...good,reason:"SECRET_REASON"}],[{...good,text:"PRIVATE_INTERPRETATION"}],
    [{...good,actorId:randomUUID()}],[{...good,actorId:f.actorId}],
    [{...good,stance:"create_money"}],[{...good,tone:"SECRET_CANARY"}],[{...good,intensity:4}],
    [{...good,intensity:"1"}],[good,good],[good,good,good],
  ])assert.throws(()=>validateNaturalBehavior(f.source,input,bad),{code:"validation"});
  assert.deepEqual(projectNaturalBehavior(validateNaturalBehavior(f.source,input,[good])),[good]);
  f.source.runtime.configuration.presentEntityIds=f.source.runtime.configuration.presentEntityIds.filter(id=>id!==f.actor.id);
  assert.throws(()=>validateNaturalBehavior(f.source,input,[good]),{code:"validation"});
});

test("strict natural public narration drops private materialization state and remains projection-idempotent",()=>{
  const f=setup(),prepared=f.context("I ask Nera about the brass key.");
  prepared.selected.astraNaturalState={origins:[{privateText:"PRIVATE_MATERIALIZATION_CANARY"}]};
  const first=projectAstraPublicSource(prepared.selected,prepared.input,{forNarration:true});
  const second=projectAstraPublicSource(first,prepared.input,{forNarration:true});
  assert.equal(first.astraNaturalState,undefined);
  const context=buildContext(second,prepared.input,"narrate",{model:"gpt-6-astra"});
  assert.equal(context.input.includes("PRIVATE_MATERIALIZATION_CANARY"),false);
  assert.equal(context.input.includes("withhold brass key until midnight"),false);
  assert.ok(context.input.includes("Plain-spoken, short sentences."));
});

test("unrelated location-keyed private fact does not force natural ordinary dialogue through private planning",()=>{
  const f=setup(),location=randomUUID();
  f.source.snapshot.publicState.current_location_id=location;
  f.source.snapshot.locations.push({id:location,campaign_id:f.input.campaignId,name:"Village square",
    description:"A public square.",status:"visited",revision:1,updated_at:"2026-10-14T00:00:00Z"});
  f.source.privateState.fact={[location]:{text:"A sealed tunnel conceals an ancient bronze tablet."}};
  const ordinary=f.context("Nera, good morning.");
  assert.equal(astraContextHasPrivateEvidence(ordinary.context),false);
  assert.equal(ordinary.context.input.includes("sealed tunnel"),false);
  assert.equal(astraContextHasPrivateEvidence(f.context("I investigate the sealed tunnel.").context),true,
    "Operation-relevant location evidence remains private");
  delete f.source.astraNaturalContract;
  assert.equal(astraContextHasPrivateEvidence(f.context("Nera, good morning.").context),true,
    "Earlier response contracts retain location-selected private semantics");
});

// Routing counts are deterministic selected-packet evidence, not measurements
// of live model semantics or claims that lexical matching finds every motive.
