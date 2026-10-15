// Import-safe, explicitly authorized disposable text acceptance. No owner DB,
// dotenv, application session, media client or external fixture is imported.
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { naturalFixture } from "../tests/helpers/natural-play-fixture.mjs";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { diagnosticState, diagnosticFetcher, diagnosticProvider,
  diagnosticStore, privateSnapshot } from "./astra-primary-production-smoke.mjs";
import { scrubSmokeReport } from "./astra-simplified-live-smoke.mjs";

export const NATURAL_LIVE_LIMITS = Object.freeze({ maxRequests:10,maxSpendUsd:5,
  maxInputUpperBytes:300000,maxOutputTokens:4096,
  inputUsdPerMillion:12.5,outputUsdPerMillion:50 });
export const NATURAL_LIVE_CONFIRMATION="authorize-ten-synthetic-text-requests-five-usd";
const round=value=>Number(value.toFixed(6));
const price=(input,output)=>(input*NATURAL_LIVE_LIMITS.inputUsdPerMillion+
  output*NATURAL_LIVE_LIMITS.outputUsdPerMillion)/1_000_000;
const safeCode=error=>typeof error?.code==="string"&&/^[a-z0-9_]{1,80}$/i.test(error.code)
  ?error.code:typeof error?.message==="string"&&/^natural_smoke_[a-z_]+$/.test(error.message)
    ?error.message:error instanceof Error?error.name:"unknown";

export function naturalSmokeBudget(){return {calls:0,actualUsd:0,heldUsd:0,usageKnown:true,requests:[]};}

/** Each request reserves its full byte-based upper bound before dispatch.
 * Known usage releases unused reservation; unknown outcomes retain it AND
 * block every subsequent request, including a transport retry. No guessed
 * usage or optimistic release can create room under the hard ceiling. */
export function boundedNaturalFetcher(budget,nextFetch){
  return async(url,init)=>{
    if(url!=="https://api.openai.com/v1/responses")throw Error("natural_smoke_endpoint_not_allowed");
    if(budget.calls>=NATURAL_LIVE_LIMITS.maxRequests)throw Error("natural_smoke_request_cap");
    if(!budget.usageKnown)throw Error("natural_smoke_prior_usage_unknown");
    const serialized=String(init?.body??"");let body;
    try{body=JSON.parse(serialized);}catch{throw Error("natural_smoke_request_invalid");}
    const stage=body.text?.format?.name==="dm_narrate"?"narrate":"plan";
    if(body.model!=="gpt-6-astra"||body.service_tier!=="default"||body.stream===true||
      body.reasoning?.effort!==(stage==="narrate"?"medium":"high")||
      !["dm_plan","dm_narrate"].includes(body.text?.format?.name))
      throw Error("natural_smoke_configuration_mismatch");
    const bytes=Buffer.byteLength(serialized,"utf8"),upper=bytes+2048;
    if(upper>NATURAL_LIVE_LIMITS.maxInputUpperBytes)throw Error("natural_smoke_input_cap");
    if(!Number.isSafeInteger(body.max_output_tokens)||body.max_output_tokens<1||
      body.max_output_tokens>NATURAL_LIVE_LIMITS.maxOutputTokens)throw Error("natural_smoke_output_cap");
    const reservation=price(upper,body.max_output_tokens);
    if(budget.actualUsd+budget.heldUsd+reservation>NATURAL_LIVE_LIMITS.maxSpendUsd)
      throw Error("natural_smoke_spend_cap");
    budget.calls++;budget.heldUsd+=reservation;
    const entry={request:budget.calls,stage,model:body.model,reasoning:body.reasoning.effort,
      serviceTier:body.service_tier,requestBytes:bytes,inputUpperBytes:upper,
      maxOutputTokens:body.max_output_tokens,reservationUsd:round(reservation),
      actualUsd:null,httpStatus:null,latencyMs:null,usage:null,error:null};
    budget.requests.push(entry);const start=performance.now();
    try{
      const response=await nextFetch(url,init);entry.httpStatus=response.status;
      try{
        const raw=await response.clone().text();
        if(Buffer.byteLength(raw)>200000)throw Error("natural_smoke_response_too_large");
        const usage=JSON.parse(raw)?.usage;
        if(!Number.isSafeInteger(usage?.input_tokens)||usage.input_tokens<0||
          !Number.isSafeInteger(usage?.output_tokens)||usage.output_tokens<0)
          throw Error("natural_smoke_usage_unknown");
        const actual=price(usage.input_tokens,usage.output_tokens);
        entry.usage={inputTokens:usage.input_tokens,outputTokens:usage.output_tokens,
          cachedTokens:Number.isSafeInteger(usage.input_tokens_details?.cached_tokens)?usage.input_tokens_details.cached_tokens:null,
          reasoningTokens:Number.isSafeInteger(usage.output_tokens_details?.reasoning_tokens)?usage.output_tokens_details.reasoning_tokens:null};
        entry.actualUsd=round(actual);budget.actualUsd+=actual;budget.heldUsd=Math.max(0,budget.heldUsd-reservation);
        if(actual>reservation){budget.usageKnown=false;entry.error="natural_smoke_usage_exceeded_reservation";}
      }catch(error){budget.usageKnown=false;entry.error=safeCode(error);}
      return response;
    }catch(error){budget.usageKnown=false;entry.error=safeCode(error);throw error;}
    finally{entry.latencyMs=round(performance.now()-start);}
  };
}

async function productionProvider(options){
  const hook=registerHooks({resolve(specifier,context,nextResolve){
    return specifier==="server-only"?{url:"data:text/javascript,export%20{}",shortCircuit:true}:nextResolve(specifier,context);
  }});
  try{return (await import("../src/lib/server/dm/astra-primary-provider.ts")).createAstraPrimaryProvider(options);}
  finally{hook.deregister();}
}

const keyMotive="SYNTHETIC_PRIVATE_BRASS_KEY_MOTIVE";
export function naturalSmokeContextEvidence(context,stage){
  try{
    const packet=JSON.parse(context.input),mandatory=packet.mandatory??{};
    const continuity=packet.memory?.privateContinuity??{};
    return {stage,responseMode:packet.astraPrimary?.responseMode??null,
      selectedPrivateMotivePresent:context.input.includes(keyMotive),
      privateStateNonempty:Object.keys(mandatory.privateState??{}).length>0,
      privateCharacterPacketPresent:(mandatory.characterPacket??[]).length>0,
      privateMemoryPresent:["exactEvents","history","digest"].some(key=>(continuity[key]??[]).length>0),
      behavior:(packet.astraPrimary?.behavior??[]).slice(0,2).map(row=>({
        actorId:row.actorId,stance:row.stance,tone:row.tone,intensity:row.intensity}))};
  }catch{return {stage,captureError:"context_evidence_unavailable"};}
}
const openingNotice="A public notice says: the miller at the ordinary village mill offers two silver for stacking empty sacks, paid once the agreed work is completed. A loose ordinary stick lies beside the path; an ordinary rat rustles near the sacks. These are public incidental facts, not established gameplay records.";
export const NATURAL_LIVE_SCENARIOS=Object.freeze([
  {id:"mill-fiction",input:"i go to mill and ask miller for job"},
  {id:"name-continuation",input:"What is your name, miller? Tell me about the sack-stacking work, please."},
  {id:"accepted-job-promotion",input:"Miller, I accept the public notice's job: stack the empty sacks for two silver, paid once I finish. We agree on those terms."},
  {id:"loose-stick-inventory",input:"I pick up the loose ordinary stick beside the path and put it in my pack."},
  {id:"rat-server-combat",input:"I attack the ordinary rat by the sacks with my practice sword, using the existing attack and damage rules."},
  {id:"private-key-decision",input:"Nera, will you lend me the brass cellar key? I wait for your decision."},
]);

async function capture(h){
  const cid=h.f.cid;
  return {snapshot:await h.snapshot(),entities:await h.f.query("select id,name,kind,hp,max_hp,resources,revision from public.rpg_entities where campaign_id=$1 order by id",[cid]),
    items:await h.f.query("select id,name,quantity,owner_entity_id,storage_id,revision from public.rpg_items where campaign_id=$1 order by id",[cid]),
    locations:await h.f.query("select id,name,status,revision from public.rpg_locations where campaign_id=$1 order by id",[cid]),
    quests:await h.f.query("select id,title,status,reward_terms,reward_operation_id from public.rpg_quests where campaign_id=$1 order by id",[cid]),
    configuration:(await h.f.runtime(cid,"play")).configuration,
    scenes:await h.f.query("select id,role,body,public_continuity from public.rpg_scenes where campaign_id=$1 order by sequence",[cid]),
    encounters:await h.f.query("select id,status,outcome from public.rpg_encounters where campaign_id=$1 order by id",[cid])};
}

/** This function never changes fixture authoring after its first dispatch.
 * Any failure, unknown usage or missing acceptance boundary stops the run.
 * Replays below use only the SAME already committed operation; never retry a
 * failure, create replacement input or spend a quality-improvement call. */
export async function runNaturalLiveSmoke({apiKey,fetcher=fetch,confirmation,
  outputPath=null,candidateSha=null}={}){
  if(confirmation!==NATURAL_LIVE_CONFIRMATION)throw Error("natural_smoke_explicit_confirmation_required");
  if(typeof apiKey!=="string"||!apiKey.trim())throw Error("natural_smoke_key_missing");
  const budget=naturalSmokeBudget(),diagnostics=diagnosticState(apiKey,{maxRequests:10,maxSpendUsd:5});
  const attempts=[],parseDiagnostics=[],turns=[],contextEvidence=[];
  const h=await naturalFixture({publicSceneOnly:true,npcKind:"npc",openingAddendum:openingNotice});
  const start=performance.now();let outcome="not-started",stoppedReason=null,narratorCalls=0,millerRef=null;
  try{
    // Legitimate disposable preauthoring only: scoped private motive + an
    // approved server weapon rule, never model-authored power or owner state.
    await h.f.one("update rpg_private.dm_state set contents=$2::jsonb where campaign_id=$1",[h.f.cid,
      JSON.stringify({fact:{brass_cellar_key:{actorId:h.npc,text:`Nera refuses to lend the brass cellar key because ${keyMotive}.`}}})]);
    await h.f.one(`update rpg_private.runtime_state set configuration=jsonb_set(configuration,'{itemRules}',
      (select jsonb_agg(case when e->>'itemId'=$2 then jsonb_set(e,'{damage}','8'::jsonb) else e end)
        from jsonb_array_elements(configuration->'itemRules') e)) where campaign_id=$1`,[h.f.cid,h.sword]);
    const initial=await capture(h);
    if(initial.entities.some(row=>/miller|rat/i.test(row.name))||initial.locations.some(row=>/mill/i.test(row.name)))
      throw Error("natural_smoke_fixture_precreated_subject");
    const actual=await productionProvider({apiKey,
      fetcher:boundedNaturalFetcher(budget,diagnosticFetcher(diagnostics,fetcher)),
      attemptObserver:row=>{if(attempts.length<30)attempts.push(row);},
      planDiagnosticObserver:row=>{if(parseDiagnostics.length<30)parseDiagnostics.push(row);}});
    const recordContext=(context,input,stage)=>{if(contextEvidence.length<20)contextEvidence.push({
      operationId:input.operationId,...naturalSmokeContextEvidence(context,stage)});};
    const provider=diagnosticProvider(diagnostics,{...actual,
      next:async(...args)=>{recordContext(args[0],args[1],"plan");return actual.next(...args);},
      narrate:async(...args)=>{narratorCalls++;recordContext(args[0],args[1],"narrate");return actual.narrate(...args);}});
    const traced=diagnosticStore(diagnostics,h.store);
    // New private authority calls participate in the same bounded trace.
    for(const method of ["recordAstraMaterialization","recordAstraPublication","pinAstraResponseMode","recordAstraStage"]){
      if(typeof h.store[method]!=="function")continue;
      traced[method]=async(...args)=>{
        const push=phase=>{if(diagnostics.events.length<512)diagnostics.events.push({order:diagnostics.events.length+1,method:`store.${method}`,phase});};
        push("entered");try{const result=await h.store[method](...args);push("returned");return result;}
        catch(error){push("threw");throw error;}
      };
    }
    const deps={store:traced,memory:h.memory,provider,
      summaries:{summarize:()=>{throw Error("natural_smoke_foreground_summary_forbidden");}},
      random:(_min,max)=>max===21?18:max-1};
    for(const scenario of NATURAL_LIVE_SCENARIOS){
      if(budget.calls>=10||!budget.usageKnown){outcome="stopped";stoppedReason="request_or_usage_gate";break;}
      const play=await traced.readPlay(h.f.cid),operationId=randomUUID();
      const input={operationId,campaignId:h.f.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:scenario.input,companionId:null,listenerIds:[],mechanic:null};
      const before=await capture(h),callStart=budget.calls,narratorStart=narratorCalls,turnStart=performance.now();
      let result,error=null;
      try{result=await runAstraTurn(input,deps);}catch(caught){error=safeCode(caught);}
      const after=await capture(h),checkpoint=await privateSnapshot(h.f,h.f.cid,operationId);
      const pin=await h.f.one("select astra_response_mode mode,astra_natural_state natural,astra_ordered_effects effects,astra_diagnostic diagnostic from rpg_private.turns where id=$1",[operationId]);
      const row={scenario:scenario.id,operationId,input:scenario.input,status:result?.status??"threw",
        failure:result?.failure??error,canRetry:result?.canRetry??false,responseMode:pin?.mode??null,
        providerRequests:budget.calls-callStart,narratorCalls:narratorCalls-narratorStart,
        latencyMs:round(performance.now()-turnStart),before,after,narration:result?.narration??null,
        checks:result?.checks??[],privateCheckpoint:checkpoint,privateDiagnostic:pin?.diagnostic??null,
        materializations:pin?.natural??null,effectIndexes:pin?.effects?.indices??[],
        rejectedEffects:pin?.effects?.rejected??[],replayUnchanged:null,topicProof:null};
      turns.push(row);
      if(result?.status!=="committed"){outcome="stopped";stoppedReason=error??`turn_${result?.failure??result?.status??"threw"}`;break;}
      if(!budget.usageKnown){outcome="stopped";stoppedReason="provider_usage_unknown";break;}
      const replayCalls=budget.calls,replayed=await runAstraTurn(input,deps),replayedState=await capture(h);
      row.replayUnchanged=replayed.status==="committed"&&budget.calls===replayCalls&&JSON.stringify(replayedState)===JSON.stringify(after);
      if(!row.replayUnchanged){outcome="stopped";stoppedReason="committed_replay_changed_state_or_dispatched";break;}
      const expectedPrivate=scenario.id==="private-key-decision";
      if((pin.mode==="private-informed")!==expectedPrivate||row.narratorCalls!==(expectedPrivate?1:0)){
        outcome="stopped";stoppedReason="unexpected_response_route";break;
      }
      if((result.narration??"").includes(keyMotive)){outcome="stopped";stoppedReason="synthetic_private_canary_exposed";break;}
      if(after.snapshot.state.location!==initial.snapshot.state.location){outcome="stopped";stoppedReason="fiction_changed_tracked_location";break;}
      if(["mill-fiction","name-continuation"].includes(scenario.id)&&
        ["entities","items","locations","quests"].some(family=>JSON.stringify(after[family])!==JSON.stringify(before[family]))){
        outcome="stopped";stoppedReason="ordinary_fiction_created_or_changed_gameplay_records";break;
      }
      const capsule=after.scenes.filter(scene=>scene.role==="narration").at(-1)?.public_continuity;
      if(scenario.id==="mill-fiction"){
        const miller=capsule?.subjects.find(subject=>subject.kind==="npc"&&/miller/i.test(`${subject.name} ${subject.description}`));
        row.topicProof={millLocalePresent:/mill/i.test(capsule?.locale?.name??""),millerPresent:!!miller,
          subjectId:miller?.id??null,trackedParentUnchanged:capsule?.parentLocationId===h.home};
        if(!row.topicProof.millLocalePresent||!row.topicProof.millerPresent||!row.topicProof.trackedParentUnchanged){
          outcome="stopped";stoppedReason="mill_or_miller_fiction_not_established";break;
        }
        millerRef=miller.id;
      }
      if(scenario.id==="name-continuation"){
        const miller=capsule?.subjects.find(subject=>subject.id===millerRef);
        row.topicProof={sameMillerIdentity:!!miller,originOperationRetained:miller?.originOperationId===turns[0].operationId,
          publicDescription:miller?.description??null};
        if(!row.topicProof.sameMillerIdentity||!row.topicProof.originOperationRetained){
          outcome="stopped";stoppedReason="miller_continuity_not_retained";break;
        }
      }
      if(scenario.id==="accepted-job-promotion"){
        const promoted=pin.natural.materializations.filter(receipt=>receipt.request.subjectRef===millerRef&&
          receipt.request.kind==="npc"&&receipt.request.purpose==="job");
        const created=after.quests.filter(quest=>!before.quests.some(old=>old.id===quest.id));
        const issuer=promoted[0]?.recordId,terms=created[0]?.reward_terms;
        row.topicProof={oneNewJob:created.length===1,oneMillerPromotion:promoted.length===1,
          correctIssuer:terms?.issuerId===issuer&&!!issuer,twoSilverTerms:terms?.currencyName==="silver"&&terms?.currencyAmount===2,
          effectiveIssuer:pin.natural.effectiveRecordIds?.includes(issuer)===true,
          realIssuer:after.entities.some(entity=>entity.id===issuer),questId:created[0]?.id??null,issuerId:issuer??null};
        if(!row.topicProof.oneNewJob||!row.topicProof.oneMillerPromotion||!row.topicProof.correctIssuer||
          !row.topicProof.twoSilverTerms||!row.topicProof.effectiveIssuer||!row.topicProof.realIssuer){
          outcome="stopped";stoppedReason="accepted_job_identity_or_terms_not_persisted_once";break;
        }
      }
      if(scenario.id==="loose-stick-inventory"){
        const created=after.items.filter(item=>!before.items.some(old=>old.id===item.id));
        const promoted=pin.natural.materializations.filter(receipt=>receipt.request.kind==="item"&&receipt.request.purpose==="inventory");
        row.topicProof={oneNewItem:created.length===1,oneInventoryPromotion:promoted.length===1,
          realStick:created.length===1&&/stick/i.test(created[0].name)&&created[0].quantity===1&&created[0].owner_entity_id===h.hero,
          exactPromotedIdentity:created[0]?.id===promoted[0]?.recordId};
        if(!row.topicProof.oneNewItem||!row.topicProof.oneInventoryPromotion||!row.topicProof.realStick||!row.topicProof.exactPromotedIdentity){
          outcome="stopped";stoppedReason="exact_stick_inventory_not_persisted";break;
        }
      }
      if(scenario.id==="rat-server-combat"){
        const promoted=pin.natural.materializations.filter(receipt=>receipt.request.kind==="creature"&&receipt.request.purpose==="combat");
        const ratId=promoted[0]?.recordId,created=promoted[0]?.changes.find(change=>change.family==="entities"&&change.id===ratId);
        const attack=checkpoint?.toolReceipts?.find(receipt=>receipt.call.kind==="attack"&&receipt.call.actorId===h.hero&&
          receipt.call.targetId===ratId&&receipt.call.itemId===h.sword);
        const damage=checkpoint?.toolReceipts?.find(receipt=>receipt.call.kind==="damage"&&receipt.call.actorId===h.hero&&
          receipt.call.targetId===ratId&&receipt.call.itemId===h.sword);
        const rat=after.entities.find(entity=>entity.id===ratId);
        row.topicProof={oneRatPromotion:promoted.length===1,newRat:!!ratId&&!before.entities.some(entity=>entity.id===ratId),
          serverDefaultHpEight:created?.values.hp===8&&created?.values.max_hp===8,
          recordedAttack:!!attack,recordedDamage:damage?.result.total===8,
          persistedHpZero:rat?.hp===0&&rat?.max_hp===8,ratId:ratId??null};
        if(Object.entries(row.topicProof).some(([key,value])=>key!=="ratId"&&value!==true)){
          outcome="stopped";stoppedReason="exact_rat_attack_damage_and_hp_not_proven";break;
        }
      }
      if(scenario.id==="private-key-decision"){
        const selected=contextEvidence.filter(entry=>entry.operationId===operationId);
        const planner=selected.filter(entry=>entry.stage==="plan"),narrator=selected.filter(entry=>entry.stage==="narrate");
        const refusal=pin.natural.publication?.behavior.find(behavior=>behavior.actorId===h.npc&&behavior.stance==="refuse");
        row.topicProof={privateMotiveSelected:planner.some(entry=>entry.selectedPrivateMotivePresent),
          onePublicNarrator:narrator.length===1,publicContextExcludesPrivate:narrator.length===1&&
            !narrator[0].selectedPrivateMotivePresent&&!narrator[0].privateStateNonempty&&
            !narrator[0].privateCharacterPacketPresent&&!narrator[0].privateMemoryPresent,
          refusalEnumPinned:!!refusal,refusalEnumReceived:narrator[0]?.behavior.some(behavior=>behavior.actorId===h.npc&&behavior.stance==="refuse")===true,
          publicResponseForReview:result.narration};
        if(!row.topicProof.privateMotiveSelected||!row.topicProof.onePublicNarrator||!row.topicProof.publicContextExcludesPrivate||
          !row.topicProof.refusalEnumPinned||!row.topicProof.refusalEnumReceived){
          outcome="stopped";stoppedReason="private_refusal_projection_not_proven";break;
        }
      }
      outcome="completed";
    }
    if(turns.length!==6&&outcome==="completed"){outcome="stopped";stoppedReason="incomplete_scenarios";}
    const report=scrubSmokeReport({schemaVersion:1,syntheticOnly:true,candidateSha,
      outcome,stoppedReason,limits:NATURAL_LIVE_LIMITS,campaignId:h.f.cid,heroId:h.hero,npcId:h.npc,
      initialState:initial,finalState:await capture(h),requests:budget.calls,usageKnown:budget.usageKnown,
      estimatedConservativeSpendUsd:budget.usageKnown?round(budget.actualUsd):null,
      retainedUnknownReservationUsd:round(budget.heldUsd),budgetUpperUsd:round(budget.actualUsd+budget.heldUsd),
      inputTokens:diagnostics.inputTokens,outputTokens:diagnostics.outputTokens,
      cachedInputTokens:diagnostics.responses.reduce((sum,row)=>sum+(row.usage.cachedTokens??0),0),
      reasoningTokens:diagnostics.responses.reduce((sum,row)=>sum+(row.usage.reasoningTokens??0),0),
      requestBudget:budget.requests,attempts,responses:diagnostics.responses,contextEvidence,
      parsedDecisions:diagnostics.parsedDecisions,parseDiagnostics,orderedBoundaries:diagnostics.events,
      traceOverflow:diagnostics.traceOverflow,sqlErrors:h.errors.slice(0,20).map(row=>({action:row.action,
        code:row.code,message:String(row.message??"").slice(0,4000),path:String(row.where??"").slice(0,4000)})),
      turns,narratorCalls,summaryProviderCalls:h.summaryCalls(),mediaProviderCalls:0,ownerDataUsed:false,
      fixtureParameters:{heroAttack:20,weaponDamageDie:8,attackRaw:18,damageRaw:8,ephemeralRatHp:8},
      elapsedMs:round(performance.now()-start)},apiKey);
    // The complete synthetic raw responses remain available except the exact
    // intentionally seeded private canary, which is evidence by boolean only.
    const safe=JSON.parse(JSON.stringify(report).replaceAll(keyMotive,"[SYNTHETIC_PRIVATE_REDACTED]"));
    if(outputPath){await mkdir(dirname(resolve(outputPath)),{recursive:true});await writeFile(resolve(outputPath),JSON.stringify(safe,null,2)+"\n","utf8");}
    return safe;
  }finally{await h.f.db.close();}
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  if(process.env.NATURAL_PLAY_LIVE_SMOKE!=="yes")throw Error("natural_smoke_explicit_opt_in_required");
  const outputPath=process.env.NATURAL_PLAY_SMOKE_REPORT??"test-results/natural-play/live-smoke.json";
  const report=await runNaturalLiveSmoke({apiKey:process.env.OPENAI_API_KEY,
    confirmation:NATURAL_LIVE_CONFIRMATION,outputPath,candidateSha:process.env.NATURAL_PLAY_CANDIDATE_SHA??null});
  process.stdout.write(JSON.stringify({outcome:report.outcome,stoppedReason:report.stoppedReason,requests:report.requests,
    spendUsd:report.estimatedConservativeSpendUsd,retainedReservationUsd:report.retainedUnknownReservationUsd,outputPath})+"\n");
  if(report.outcome!=="completed")process.exitCode=1;
}
