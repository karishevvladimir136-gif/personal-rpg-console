// Explicitly authorized, disposable-only provider compatibility proof.
// No owner connection/service/media import. A single process shares the hard
// eight text-request budget across all three turns and their continuations.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { setup, examples } from "../tests/universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { basicProfile } from "../src/lib/gameplay/mechanics/profile.ts";
import { diagnosticState, diagnosticFetcher, diagnosticProvider, diagnosticStore,
  diagnosticRpc, privateSnapshot } from "./astra-primary-production-smoke.mjs";

export const freedomArc=[
  "The crate work is finished. Give me the agreed two silver and vegetables. May I use the loft later tonight? I am not going to sleep yet. Also, do you have any work available tomorrow? I am only asking what is available; I am not accepting a new job yet.",
  "I am done for the night. I eat what I need, lie down in the permitted secure loft, and sleep until morning.",
  "I scoop the disgusting cold dishwater from the slop bucket into a mug and fling it at the bartender. What happens?",
];
const fakeUsage={model:"offline-fixture",inputTokens:0,outputTokens:0,calls:0,latencyMs:0};
const summaries={summarize:async(job)=>({usage:fakeUsage,output:{schemaVersion:1,
  selections:job.sources.map((source)=>({sourceId:source.id,version:source.ref.version}))}})};
const rpcFor=(f,state)=>{
  const execute=(method)=>async(a)=>{
    try {return await f[method](a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline);}
    catch(error){
      state.sqlDetails??=[];
      state.sqlDetails.push({action:a.p_action,where:safe(error?.where,state.secret,2000)});
      throw error;
    }
  };
  return {runtime:diagnosticRpc(state,execute("runtime")),
    memory:diagnosticRpc(state,execute("memory"))};
};
const safe=(value,secret,limit=512)=>typeof value==="string"
  ?value.replaceAll(secret||"\0","[REDACTED]")
    .replace(/\bBearer\s+[^\s,;]+/gi,"Bearer [REDACTED]")
    .replace(/\bsk-[A-Za-z0-9_-]{8,}\b/g,"[REDACTED]")
    .replace(/[\u0000-\u001f\u007f]/g," ").slice(0,limit):null;
const safeError=(error,secret)=>({name:safe(error?.name,secret,80),
  code:safe(error?.code,secret,80),message:safe(error?.message,secret)});

// Reuses the production-smoke usage/capture guard and adds the missing bounded
// rejection evidence. Headers and request bodies are never persisted.
export function freedomFetcher(state,realFetch){
  const observed=async(url,init)=>{
    if(String(url)!=="https://api.openai.com/v1/responses")
      throw Error("freedom_route_rejected");
    const body=JSON.parse(String(init?.body??"{}"));
    if(body.model!=="gpt-6-astra" || body.store!==false ||
      body.service_tier!=="default" || body.text?.format?.strict!==true ||
      !["dm_plan","dm_narrate"].includes(body.text?.format?.name) ||
      body.reasoning?.effort!==(body.text?.format?.name==="dm_plan"?"high":"medium") ||
      body.tools || body.input?.some?.((m)=>m.content?.some?.((c)=>c.type!=="input_text")))
      throw Error("freedom_text_route_rejected");
    const diagnostic={request:state.requests,stage:body.text.format.name,
      requestedModel:body.model,reasoning:body.reasoning.effort,
      requestedServiceTier:body.service_tier,httpStatus:null,requestId:null,
      providerCode:null,providerType:null,providerMessage:null};
    let response;
    try {response=await realFetch(url,init);}
    catch(error){
      state.usageKnown=false;
      diagnostic.transportError=safeError(error,state.secret);
      state.providerDiagnostics.push(diagnostic);
      throw error;
    }
    diagnostic.httpStatus=response.status;
    diagnostic.requestId=safe(response.headers.get("x-request-id"),state.secret,128);
    try {
      const raw=await response.clone().text();
      if(Buffer.byteLength(raw)>200_000)throw Error("freedom_response_too_large");
      const payload=JSON.parse(raw);
      diagnostic.providerCode=safe(payload.error?.code,state.secret,80);
      diagnostic.providerType=safe(payload.error?.type,state.secret,80);
      diagnostic.providerMessage=safe(payload.error?.message,state.secret);
      if(response.ok){
        diagnostic.returnedRouteValid=payload.model==="gpt-6-astra" && payload.service_tier==="default";
        diagnostic.accountingValid=[payload.usage?.input_tokens,payload.usage?.output_tokens]
          .every((n)=>Number.isSafeInteger(n) && n>=0);
      }
    } catch(error) {
      state.usageKnown=false;
      diagnostic.captureError=safeError(error,state.secret);
    }
    state.providerDiagnostics.push(diagnostic);
    return response;
  };
  const captured=diagnosticFetcher(state,observed);
  return async(url,init)=>{
    const response=await captured(url,init);
    const diagnostic=state.providerDiagnostics.at(-1);
    if(response.ok){
      if(!diagnostic?.accountingValid || !state.usageKnown){
        state.usageKnown=false;
        throw Error("freedom_billing_unknown");
      }
      if(!diagnostic.returnedRouteValid){
        state.usageKnown=false;
        throw Error("freedom_returned_route_rejected");
      }
    }
    return response;
  };
}

export async function freedomSnapshot(f,w){
  const row=await f.one(`select h.hp,h.max_hp,h.resources,r.world_minutes,
    s.quantity supplies,r.configuration,ps.current_location_id location
    from public.rpg_entities h join rpg_private.runtime_state r using(campaign_id)
    join public.rpg_public_state ps using(campaign_id)
    join public.rpg_items s on s.id=$2 where h.id=$1`,[w.hero,w.supplies]);
  const counts=await f.one(`select
    (select count(*)::integer from public.rpg_items where campaign_id=$1 and name='vegetables') food,
    (select count(*)::integer from public.rpg_quests where campaign_id=$1 and status='open') open_jobs,
    (select count(*)::integer from public.rpg_quests where campaign_id=$1 and status='complete') completed_jobs,
    (select count(*)::integer from public.rpg_rest_records where campaign_id=$1 and status='complete') completed_rests`,[f.cid]);
  return {hp:row.hp,maxHp:row.max_hp,resources:row.resources,
    worldMinutes:row.world_minutes,supplies:row.supplies,locationId:row.location,
    safeLocationIds:row.configuration.safeLocationIds,...counts};
}

export async function createFreedomWorld(index=0){
  const situations=[
    "The public work organiser also tends the bar. Rowan has just finished the agreed crate packing; the organiser owes two silver and vegetables. The secure loft may be available tonight, and cellar sorting work may be available tomorrow; no tomorrow job has been accepted.",
    "Rowan is injured and has travel rations. The bartender has already granted Rowan permission to sleep in the quiet, secure loft tonight. The loft is suitable for a full night's rest; no encounter or interruption is underway.",
    "Rowan stands at the bar facing the visible bartender. An ordinary mug and a bucket of disgusting cold dishwater are plainly on the bar. There is no active encounter and no other agreed work or payment.",
  ];
  const openings=[
    "The bartender inspects Rowan's packed crates and confirms the work is done. Two silver and vegetables are the agreed pay. Rowan has not yet slept or accepted tomorrow's work.",
    "The bartender has already given Rowan permission to sleep in the secure loft. Injured Rowan has three travel rations in the pack and is ready to decide what to do tonight.",
    "The bartender is working behind the bar. Rowan can see the ordinary mug and the cold, filthy dishwater bucket. The scene is quiet; no attack has happened yet.",
  ];
  const example={...examples.fantasy,
    location:"Copper Lantern tavern",
    situation:situations[index],
    npc:"Work organiser and bartender",
    narration:openings[index]};
  const f=await setup(example,"en",48);
  const state=diagnosticState();state.providerDiagnostics=[];
  try {
    await f.create();await f.startOpening();
    const foundation=(await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world;
    const hero=foundation.actors.find((a)=>a.control==="player").entityId;
    const npc=foundation.actors.find((a)=>a.control==="autonomous").entityId;
    const pack=await f.mutation("storage.save",f.cid,{name:"Rowan pack",kind:"player",entity_id:hero});
    const supplies=await f.mutation("item.save",f.cid,{name:"Travel rations",category:"supply",
      quantity:3,description:"Three ordinary travel rations for formal rest.",mechanics:"",
      owner_entity_id:hero,storage_id:pack.id,equipped_entity_id:null,equipped_slot:null});
    await f.one("update public.rpg_entities set hp=4,max_hp=12 where id=$1",[hero]);
    const play=await f.runtime(f.cid,"play");
    await f.runtime(f.cid,"configure",{requestId:randomUUID(),campaignId:f.cid,
      expectedRevision:play.revision,configuration:{profile:"console-basic-v1",
        controlledEntityIds:[hero],presentEntityIds:[hero,npc],nearbyStorageIds:[],
        safeLocationIds:[],itemRules:[{itemId:supplies.id,tag:"supply",damage:null}]}});
    const timeline=await f.fence(f.cid);
    const pin=await f.one(`select r.revision runtime_revision,p.revision public_revision,
      w.revision world_revision,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
      t.head_manifest_id head_id,(select coalesce(max(sequence),0) from rpg_private.world_events
      where campaign_id=r.campaign_id) world_event_sequence
      from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
      join rpg_private.world_foundations w using(campaign_id)
      join rpg_private.timeline_campaigns c using(campaign_id)
      join rpg_private.timelines t on t.id=c.active_timeline_id where r.campaign_id=$1`,[f.cid]);
    await f.runtime(f.cid,"astra_takeover",{requestId:randomUUID(),campaignId:f.cid,timeline,
      expectedRuntimeRevision:pin.runtime_revision,expectedWorldRevision:pin.world_revision,
      expectedPublicRevision:pin.public_revision,expectedHeadId:pin.head_id,
      expectedWorldDigest:pin.world_digest,expectedWorldEventSequence:pin.world_event_sequence});
    const rpc=rpcFor(f,state);
    const store=createRpcTurnStore(f.owner,rpc.runtime,"gpt-6-astra",await f.fence(f.cid),true);
    const memory=createRpcMemoryStore(f.owner,rpc.memory,await f.fence(f.cid));
    let job=null;
    if(index===0){
      const initial=await store.readPlay(f.cid);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:initial.timeline,
        expectedRevision:initial.revision,mode:"game",input:"Record our agreed crate-packing terms: two silver and vegetables.",
        companionId:null,listenerIds:[],mechanic:null};
      const seeded=await runAstraTurn(input,{store,memory,summaries,provider:{
        next:async(_context,_input,_receipts,_checks,_caps,source)=>({usage:fakeUsage,
          output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
            changes:[],outcomes:[],privatePatches:[],effects:[{kind:"job_offer",
              issuerId:npc,title:"Pack the agreed crates",description:"The agreed crate work is done; payment is due.",
              currencyName:"silver",currencyAmount:2,itemName:"vegetables",itemCategory:"food",itemDescription:null}]}}}),
        narrate:async()=>({usage:fakeUsage,output:{narration:example.narration,visualDescription:"",clarification:null}}),
      }});
      assert.equal(seeded.status,"committed",JSON.stringify(state.sqlErrors));
      job=await f.one("select id from public.rpg_quests where campaign_id=$1 and title='Pack the agreed crates'",[f.cid]);
    }
    const location=(await f.one("select current_location_id id from public.rpg_public_state where campaign_id=$1",[f.cid])).id;
    return {f,w:{hero,npc,supplies:supplies.id,job:job?.id??null,location}};
  } catch(error) {
    error.fixtureDiagnostics={sqlErrors:state.sqlErrors,sqlDetails:state.sqlDetails??[],trace:state.events};
    await f.db.close();throw error;
  }
}

function offlineProvider(index,w,narrations){
  return {next:async(_context,_input,_receipts,_checks,_caps,source)=>({usage:fakeUsage,
    output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes,
      changes:[],outcomes:[],privatePatches:[],effects:index===0 ? [
        {kind:"job_complete",questId:w.job},{kind:"job_reward",questId:w.job,recipientId:w.hero}]
        : index===1 ? [{kind:"formal_rest",restKind:"long",restSafety:{locationId:w.location,suitable:true}}] : []}}}),
    narrate:async()=>({usage:fakeUsage,output:{narration:narrations?.[index]??[
      "The bartender pays the agreed two silver and vegetables. You may use the loft later. Cellar work might be available tomorrow; its terms remain unsettled and you have not accepted it.",
      "You eat a travel ration and sleep in the secure loft until morning. The completed long rest restores your condition.",
      "The cold dishwater splashes the bartender's apron. He recoils and demands you put the mug down before the conversation can continue.",
    ][index],visualDescription:"",clarification:null}})};
}

async function saveProof(f,w){
  const before=await freedomSnapshot(f,w);
  const created=await f.saves(f.cid,"create",await f.command(f.cid,
    {kind:"manual",name:"Disposable formal-rest proof"}));
  const save=created.snapshot.saves.find((s)=>s.name==="Disposable formal-rest proof");
  assert.ok(save);
  await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.id,
    label:"Disposable formal-rest proof restored",recovery:false}));
  assert.deepEqual(await freedomSnapshot(f,w),before,"formal rest survives save/load exactly");
  return {saved:true,loaded:true,unchanged:true};
}

export async function runFreedomSmoke({offline=false,realFetch=fetch,
  offlineNarrations,offlineProviderFactory}={}){
  if(!offline && (process.env.ASTRA_FREEDOM_LIVE_SMOKE!=="yes" ||
    process.env.ASTRA_FREEDOM_OFFLINE_GATES!=="passed" || !process.env.OPENAI_API_KEY))
    throw Error("Explicit disposable live authorization, passed offline gates and server key are required");
  const state=diagnosticState(offline?"":process.env.OPENAI_API_KEY,
    {maxRequests:8,maxSpendUsd:8});
  state.providerDiagnostics=[];
  const report={scope:"three-independent-disposable-PGlite-campaigns",mode:offline?"offline-fixture-check":"live",
    maxTurns:3,maxTextRequests:8,mediaCalls:0,status:"not-started",turns:[]};
  let f,w,actual;
  try {
    if(!offline){
      const hook=registerHooks({resolve(specifier,context,nextResolve){
        return specifier==="server-only"?{url:"data:text/javascript,export%20{}",shortCircuit:true}
          :nextResolve(specifier,context);
      }});
      try {
        const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
        actual=diagnosticProvider(state,createAstraPrimaryProvider({apiKey:state.secret,
          fetcher:freedomFetcher(state,realFetch)}));
      } finally {hook.deregister();}
    }
    for(let index=0;index<3;index++){
      // Reserve at least planning+narration for every new turn. No probing
      // retries are permitted if the provider/route/budget gate fails.
      if(!offline && state.requests>6)throw Error("freedom_insufficient_remaining_request_budget");
      ({f,w}=await createFreedomWorld(index));
      const fence=await f.fence(f.cid),rpc=rpcFor(f,state);
      const store=diagnosticStore(state,createRpcTurnStore(f.owner,rpc.runtime,"gpt-6-astra",fence,true));
      const memory=createRpcMemoryStore(f.owner,rpc.memory,fence);
      const play=await store.readPlay(f.cid),before=await freedomSnapshot(f,w);
      const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:freedomArc[index],
        companionId:null,listenerIds:[],mechanic:null};
      const start={requests:state.requests,inputTokens:state.inputTokens,
        outputTokens:state.outputTokens,responses:state.responses.length,
        decisions:state.parsedDecisions.length,latencies:state.latenciesMs.length};
      const fake=offline?offlineProvider(index,w,offlineNarrations):null;
      const deps={store,memory,summaries,provider:offline
        ?offlineProviderFactory?.(index,w,fake)??fake:actual};
      let result=await runAstraTurn(input,deps);
      if(result.status==="awaiting_confirmation")result=await resumeAstraTurn({
        commandId:randomUUID(),campaignId:f.cid,operationId:input.operationId,
        timeline:fence,action:"continue",checkId:null},deps);
      const after=await freedomSnapshot(f,w);
      const stored=await privateSnapshot(f,f.cid,input.operationId);
      stored.orderedEffects=(await f.one("select astra_ordered_effects from rpg_private.turns where id=$1",
        [input.operationId])).astra_ordered_effects;
      const narration=(await f.one("select narration from rpg_private.turns where id=$1",[input.operationId])).narration;
      const row={turn:String.fromCharCode(65+index),campaignId:f.cid,operationId:input.operationId,
        literalInput:input.input,
        status:result.status,requests:state.requests-start.requests,
        inputTokens:state.inputTokens-start.inputTokens,outputTokens:state.outputTokens-start.outputTokens,
        before,after,narration,latenciesMs:state.latenciesMs.slice(start.latencies),
        responses:state.responses.slice(start.responses),
        parsedDecisions:state.parsedDecisions.slice(start.decisions),checkpoint:stored};
      report.turns.push(row);
      assert.equal(result.status,"committed",`turn ${row.turn} failed: ${stored?.failure}`);
      assert.doesNotMatch(JSON.stringify(result),/astraEffects|astra_effects|PRIVATE_BEFORE_FORK/);
      assert.ok(narration?.length>0,"story continues");
      try { if(index===0){
        assert.equal(after.resources.currency_silver,2,"agreed pay settles exactly");
        assert.equal(after.food,1,"agreed food settles exactly once");
        assert.equal(after.completed_jobs,before.completed_jobs+1,"agreed job completes");
        assert.equal(after.completed_rests,before.completed_rests,"lodging remains fiction");
        assert.equal(after.hp,before.hp,"lodging itself never heals");
        assert.equal(after.supplies,before.supplies,"permission alone consumes no supplies");
        assert.ok(after.worldMinutes-before.worldMinutes<basicProfile.longMinutes,
          "permission alone cannot jump through a night's sleep");
      }
      if(index===1){
        const settings=(await f.one("select values from public.rpg_settings_revisions where campaign_id=$1 order by revision desc limit 1",[f.cid])).values;
        const recovery=basicProfile.recovery.long[settings.difficulty.recovery];
        assert.equal(after.supplies,before.supplies-settings.difficulty.longRestSupplyCost);
        assert.equal(after.worldMinutes,before.worldMinutes+basicProfile.longMinutes);
        assert.equal(after.hp,Math.min(before.maxHp,before.hp+Math.ceil(before.maxHp*recovery)),
          "existing server profile computes exact HP recovery");
        assert.equal(after.completed_rests,before.completed_rests+1);
        assert.deepEqual(after.safeLocationIds,[],"operation safety never rewrites persistent configuration");
      }
      if(index===2){
        assert.ok(after.hp<=before.hp,"improvisation does not invent healing");
        assert.deepEqual(after.resources,before.resources,"improvisation does not invent resources");
      }
      row.acceptance={passed:true};
      } catch(error) {
        if(!(error instanceof assert.AssertionError))throw error;
        row.acceptance={passed:false,error:safeError(error,state.secret)};
        // Record semantic acceptance differences, but obtain the other
        // independent scenarios. Runtime/provider/SQL and replay failures
        // remain hard stops outside this catch.
      }
      const noCall={next:async()=>{throw Error("replay_provider_call");},
        narrate:async()=>{throw Error("replay_provider_call");}};
      const replay=await runAstraTurn(input,{...deps,provider:noCall});
      assert.equal(replay.status,"committed");
      assert.deepEqual(await freedomSnapshot(f,w),after,"exact replay cannot duplicate the outcome");
      row.replay={committed:true,providerRequests:0,unchanged:true};
      if(index===1)row.saveLoad=await saveProof(f,w);
      await f.db.close();f=null;w=null;
    }
    report.status=report.turns.every(row=>row.acceptance.passed)?"passed":"acceptance-failed";
  } catch(error) {
    report.status="failed";report.error=safeError(error,state.secret);
    if(error.fixtureDiagnostics)report.fixtureDiagnostics=error.fixtureDiagnostics;
  } finally {
    report.requests=state.requests;report.inputTokens=state.inputTokens;
    report.outputTokens=state.outputTokens;report.usageKnown=state.usageKnown;
    report.estimatedSpendUsd=state.usageKnown
      ? Number(((state.inputTokens*10+state.outputTokens*50)/1_000_000).toFixed(4)) : null;
    report.cachedTokens=state.responses.reduce((n,r)=>n+(r.usage.cachedTokens??0),0);
    report.reasoningTokens=state.responses.reduce((n,r)=>n+(r.usage.reasoningTokens??0),0);
    report.providerDiagnostics=state.providerDiagnostics;
    report.sqlErrors=state.sqlErrors;report.trace=state.events;
    report.sqlDetails=state.sqlDetails??[];
    report.latenciesMs=state.latenciesMs;
    if(f)await f.db.close();
  }
  return report;
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  const report=await runFreedomSmoke({offline:process.argv.includes("--offline-fixture-check")});
  process.stdout.write(JSON.stringify(report)+"\n");
  if(report.status!=="passed")process.exitCode=1;
}
