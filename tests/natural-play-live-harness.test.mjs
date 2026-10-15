import test from "node:test";
import assert from "node:assert/strict";
import { naturalSmokeBudget,boundedNaturalFetcher,NATURAL_LIVE_LIMITS,NATURAL_LIVE_CONFIRMATION,
  runNaturalLiveSmoke,naturalSmokeContextEvidence } from "../scripts/natural-play-live-smoke.mjs";

const secret="sk-synthetic-natural-harness-secret";
const endpoint="https://api.openai.com/v1/responses";
const request=(overrides={})=>({method:"POST",headers:{Authorization:`Bearer ${secret}`},
  body:JSON.stringify({model:"gpt-6-astra",service_tier:"default",reasoning:{effort:"high"},
    max_output_tokens:4096,input:"Synthetic only",text:{format:{name:"dm_plan"}},...overrides})});
const response=(output,inputTokens=1000,outputTokens=200)=>new Response(JSON.stringify({
  id:"resp_synthetic_natural",model:"gpt-6-astra",service_tier:"default",status:"completed",
  usage:{input_tokens:inputTokens,output_tokens:outputTokens,
    input_tokens_details:{cached_tokens:100},output_tokens_details:{reasoning_tokens:100}},
  output:[{type:"message",role:"assistant",status:"completed",content:[{type:"output_text",
    text:typeof output==="string"?output:JSON.stringify(output)}]}],
}),{status:200});

test("ten-request ceiling releases only proven usage and never changes fetch arguments or response",async()=>{
  const budget=naturalSmokeBudget(),init=request();let sent=0;
  const guarded=boundedNaturalFetcher(budget,async(url,actual)=>{
    assert.equal(url,endpoint);assert.equal(actual,init);sent++;return response("synthetic");});
  for(let index=0;index<10;index++){
    const returned=await guarded(endpoint,init);assert.equal(returned.bodyUsed,false);
    assert.equal((await returned.json()).model,"gpt-6-astra");
  }
  await assert.rejects(()=>guarded(endpoint,init),/natural_smoke_request_cap/);
  assert.equal(sent,10);assert.equal(budget.heldUsd,0);
  assert.equal(Number(budget.actualUsd.toFixed(6)),0.225);
  assert.ok(budget.requests.every(row=>row.actualUsd<row.reservationUsd));
  assert.doesNotMatch(JSON.stringify(budget),/Authorization|sk-synthetic-natural-harness-secret/);
});

test("unknown usage and transport outcome preserve reservation and forbid further dispatch",async()=>{
  for(const transport of [async()=>new Response("not-json"),async()=>{throw Error("Synthetic network error");}]){
    const budget=naturalSmokeBudget();let sent=0;
    const guarded=boundedNaturalFetcher(budget,async(...args)=>{sent++;return transport(...args);});
    try{await guarded(endpoint,request());}catch{/* Transport failure is retained, never retried. */}
    assert.equal(budget.usageKnown,false);assert.ok(budget.heldUsd>0);
    await assert.rejects(()=>guarded(endpoint,request()),/natural_smoke_prior_usage_unknown/);
    assert.equal(sent,1);
  }
});

test("budget and exact model/reasoning/tier/schema gates reject before provider dispatch",async()=>{
  let sent=0;
  const guarded=boundedNaturalFetcher(naturalSmokeBudget(),async()=>{sent++;return response("unused");});
  for(const extra of [{model:"gpt-6-sol"},{service_tier:"fast"},{stream:true},
    {reasoning:{effort:"medium"}},{text:{format:{name:"dm_narrate"}}},{text:{format:{name:"unknown"}}}])
    await assert.rejects(()=>guarded(endpoint,request(extra)),/natural_smoke_configuration_mismatch/);
  await assert.rejects(()=>guarded("https://invalid.example",request()),/natural_smoke_endpoint_not_allowed/);
  await assert.rejects(()=>guarded(endpoint,request({max_output_tokens:4097})),/natural_smoke_output_cap/);
  await assert.rejects(()=>guarded(endpoint,request({input:"x".repeat(300000)})),/natural_smoke_input_cap/);
  const exhausted=naturalSmokeBudget();exhausted.actualUsd=4.999;
  await assert.rejects(()=>boundedNaturalFetcher(exhausted,async()=>{sent++;})(endpoint,request()),/natural_smoke_spend_cap/);
  assert.equal(sent,0);assert.equal(NATURAL_LIVE_LIMITS.maxRequests,10);
  const narrator=boundedNaturalFetcher(naturalSmokeBudget(),async()=>response("narrator"));
  await narrator(endpoint,request({reasoning:{effort:"medium"},text:{format:{name:"dm_narrate"}}}));
});

test("imported harness cannot create a fixture or dispatch without explicit confirmation",async()=>{
  let sent=0;
  await assert.rejects(()=>runNaturalLiveSmoke({apiKey:secret,fetcher:()=>{sent++;}}),/natural_smoke_explicit_confirmation_required/);
  await assert.rejects(()=>runNaturalLiveSmoke({confirmation:NATURAL_LIVE_CONFIRMATION,fetcher:()=>{sent++;}}),/natural_smoke_key_missing/);
  assert.equal(sent,0);
});

test("context evidence records public enum/boolean proof without copying private text",()=>{
  const context={input:JSON.stringify({mandatory:{privateState:{fact:"SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE"}},
    astraPrimary:{responseMode:"private-informed",behavior:[{actorId:"npc",stance:"refuse",tone:"firm",intensity:1}]}})};
  const evidence=naturalSmokeContextEvidence(context,"plan");
  assert.equal(evidence.selectedPrivateMotivePresent,true);assert.equal(evidence.privateStateNonempty,true);
  assert.deepEqual(evidence.behavior,[{actorId:"npc",stance:"refuse",tone:"firm",intensity:1}]);
  assert.doesNotMatch(JSON.stringify(evidence),/SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE/);
});

function currentContinuity(context){
  const current=context.astraPrimary?.sceneContinuity?.current;
  return current?{locale:current.locale,subjects:current.subjects.map(({id,kind,name,description})=>({subjectRef:id,kind,name,description}))}
    :{locale:null,subjects:[]};
}
function final(context,text,extra={}){
  const privateMode=context.astraPrimary.responseMode==="private-informed";
  return {type:"final",call:null,materializations:extra.materializations??[],final:{
    schemaVersion:1,worldMinutes:context.mandatory.current.worldMinutes,changes:[],outcomes:[],privatePatches:[],effects:[],behavior:[],
    ...(privateMode?{}:{continuity:currentContinuity(context),publicNarration:{independentBeat:text,beats:[],visualDescription:{text:"",requiresEffects:[]}}}),
    ...Object.fromEntries(Object.entries(extra).filter(([key])=>key!=="materializations")),
  }};
}
const materialization=(subjectRef,kind,purpose)=>({subjectRef,kind,purpose,ownerRef:null});

test("offline nine-response production path proves promotion/dice/private route and committed replays do not dispatch twice",async()=>{
  let calls=0,sword=null,rat=null,hero=null;
  const report=await runNaturalLiveSmoke({apiKey:secret,confirmation:NATURAL_LIVE_CONFIRMATION,
    fetcher:async(_url,init)=>{
      calls++;const body=JSON.parse(init.body),wrapped=JSON.parse(body.input),context=wrapped.context??wrapped;
      hero??=context.mandatory.current.configuration.controlledEntityIds[0];
      if(calls===1)return response(final(context,"The miller greets Ari at the sacks.",{continuity:{
        locale:{name:"Village Mill",description:"An ordinary mill within the village."},subjects:[
          {subjectRef:null,kind:"npc",name:"miller",description:"The flour-dusted village miller."},
          {subjectRef:null,kind:"place",name:"Village Mill",description:"A working village mill."}]}}));
      if(calls===2){const c=currentContinuity(context);c.subjects[0].description="Tomas is the flour-dusted village miller.";
        return response(final(context,"The miller says his name is Tomas and describes stacking the sacks.",{continuity:c}));}
      if(calls===3){const miller=context.astraPrimary.sceneContinuity.current.subjects.find(row=>row.kind==="npc").id;
        return response(final(context,"Tomas nods at the agreement.",{materializations:[materialization(miller,"npc","job")],
          effects:[{kind:"job_offer",issuerId:miller,title:"Stack empty sacks",description:"Stack the empty sacks at the village mill.",
            currencyName:"silver",currencyAmount:2,itemName:null,itemCategory:null,itemDescription:null}],
          publicNarration:{independentBeat:"Tomas nods.",beats:[{text:"You agree to stack the sacks for two silver.",requiresEffects:[0]}],
            visualDescription:{text:"",requiresEffects:[]}}}));}
      if(calls===4){
        assert.match(body.instructions,/mandatory inventory(?: or tracking)? materialization/i);
        assert.match(body.instructions,/base\/tool outcomes/i);
        assert.match(body.instructions,/requiresEffects:\[\]/);
        return response(final(context,"The path is quiet.",{
          materializations:[materialization("input:stick","item","inventory")],effects:[],
          publicNarration:{independentBeat:"The path is quiet.",
            beats:[{text:"You put the loose ordinary stick in your pack.",requiresEffects:[]}],
            visualDescription:{text:"",requiresEffects:[]}}}));
      }
      if(calls===5){sword=context.mandatory.current.items.find(row=>row.name==="Practice sword").id;
        return response({type:"tool",final:null,materializations:[materialization("input:rat","creature","combat")],
          call:{kind:"attack",actorId:hero,targetId:"input:rat",itemId:sword,dc:null,scope:null}});}
      if(calls===6){rat=wrapped.toolReceipts[0].call.targetId;
        return response({type:"tool",final:null,materializations:[],
          call:{kind:"damage",actorId:hero,targetId:rat,itemId:sword,dc:null,scope:null}});}
      if(calls===7){const target=context.mandatory.current.entities.find(row=>row.id===rat);
        return response(final(context,"Dust hangs in the mill doorway.",{changes:[{family:"entities",id:rat,
          expectedRevision:target.revision,hp:0,resources:null,quantity:null,locationId:null,position:null}],
          effects:[],publicNarration:{independentBeat:"Dust hangs in the mill doorway.",
            beats:[{text:"Your sword strikes the rat. It falls still.",requiresEffects:[]}],
            visualDescription:{text:"",requiresEffects:[]}}}));}
      if(calls===8){assert.equal(context.astraPrimary.responseMode,"private-informed");
        assert.match(JSON.stringify(context),/SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE/);
        const nera=context.mandatory.current.entities.find(row=>row.name==="Nera").id;
        return response(final(context,"unused private text",{behavior:[{actorId:nera,stance:"refuse",tone:"firm",intensity:1}]}));}
      assert.equal(calls,9);assert.equal(body.reasoning.effort,"medium");
      assert.doesNotMatch(body.input,/SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE|privatePatches|materializations/);
      return response({narration:"Nera shakes her head. 'The key stays with me.'",visualDescription:"",clarification:null,
        continuity:currentContinuity(context)});
    }});
  assert.equal(report.outcome,"completed",JSON.stringify({reason:report.stoppedReason,sql:report.sqlErrors,
    parse:report.parseDiagnostics,trace:report.orderedBoundaries.slice(-18),
    turns:report.turns.map(row=>({scenario:row.scenario,status:row.status,failure:row.failure,diagnostic:row.privateDiagnostic}))}));
  assert.equal(calls,9);assert.equal(report.requests,9);assert.equal(report.turns.length,6);
  assert.deepEqual(report.turns.map(row=>row.providerRequests),[1,1,1,1,3,2]);
  assert.ok(report.turns.every(row=>row.replayUnchanged));
  assert.ok(report.turns.every(row=>row.topicProof!==null));
  assert.equal(report.turns[0].topicProof.millerPresent,true);
  assert.equal(report.turns[1].topicProof.sameMillerIdentity,true);
  assert.equal(report.turns[2].topicProof.twoSilverTerms,true);
  assert.equal(report.turns[2].topicProof.correctIssuer,true);
  assert.equal(report.turns[3].topicProof.oneNewItem,true);
  assert.deepEqual(report.turns[3].effectIndexes,[]);
  assert.match(report.turns[3].narration,/You put the loose ordinary stick in your pack/);
  assert.equal(report.turns[3].privateCheckpoint.finalProposal.resolution.changes.length,0,
    "Mandatory inventory promotion needs neither a fabricated base patch nor an optional effect");
  assert.equal(report.turns[4].topicProof.serverDefaultHpEight,true);
  assert.equal(report.turns[4].topicProof.persistedHpZero,true);
  assert.deepEqual(report.turns[4].effectIndexes,[]);
  assert.match(report.turns[4].narration,/Your sword strikes the rat\. It falls still/);
  assert.equal(report.turns[5].topicProof.privateMotiveSelected,true);
  assert.equal(report.turns[5].topicProof.publicContextExcludesPrivate,true);
  assert.equal(report.turns[5].topicProof.refusalEnumReceived,true);
  assert.match(report.turns[5].topicProof.publicResponseForReview,/key stays with me/);
  assert.deepEqual(report.turns.map(row=>row.responseMode),[...Array(5).fill("public-unified"),"private-informed"]);
  assert.equal(report.narratorCalls,1);assert.equal(report.finalState.quests.length,1);
  assert.equal(report.finalState.entities.find(row=>row.id===rat).hp,0);
  assert.equal(report.finalState.snapshot.state.hp,10);
  assert.equal(report.finalState.snapshot.state.location,report.initialState.snapshot.state.location);
  assert.ok(report.finalState.items.some(row=>/stick/i.test(row.name)&&row.owner_entity_id===hero));
  assert.equal(report.finalState.encounters.at(-1).status,"active",
    "A validated damage outcome does not fabricate an encounter-end effect");
  assert.equal(report.summaryProviderCalls,0);assert.equal(report.mediaProviderCalls,0);assert.equal(report.ownerDataUsed,false);
  assert.ok(report.orderedBoundaries.some(row=>row.method==="store.recordAstraMaterialization"));
  assert.ok(report.orderedBoundaries.some(row=>row.method==="store.commit"));
  assert.doesNotMatch(JSON.stringify(report),/sk-synthetic-natural-harness-secret|SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE/);
});

test("a committed scene that never establishes the requested mill/miller cannot falsely pass live acceptance",async()=>{
  let calls=0;
  const report=await runNaturalLiveSmoke({apiKey:secret,confirmation:NATURAL_LIVE_CONFIRMATION,
    fetcher:async(_url,init)=>{calls++;return response(final(JSON.parse(JSON.parse(init.body).input).context,
      "You remain quietly in the square."));}});
  assert.equal(calls,1);assert.equal(report.outcome,"stopped");
  assert.equal(report.stoppedReason,"mill_or_miller_fiction_not_established");
  assert.equal(report.turns[0].status,"committed");
  assert.equal(report.turns[0].topicProof.millerPresent,false);
  assert.deepEqual(report.finalState.entities,report.initialState.entities);
});

test("a systemic first-response parse failure stops with saved output and zero later dispatches",async()=>{
  let calls=0;
  const report=await runNaturalLiveSmoke({apiKey:secret,confirmation:NATURAL_LIVE_CONFIRMATION,
    fetcher:async()=>{calls++;return response("{invalid synthetic JSON");}});
  assert.equal(calls,1);assert.equal(report.outcome,"stopped");assert.equal(report.turns.length,1);
  assert.equal(report.turns[0].status,"failed");assert.equal(report.responses[0].outputText.text,"{invalid synthetic JSON");
  assert.equal(report.turns[0].privateCheckpoint.finalProposal,null);
  assert.deepEqual(report.finalState.snapshot,report.initialState.snapshot);
});
