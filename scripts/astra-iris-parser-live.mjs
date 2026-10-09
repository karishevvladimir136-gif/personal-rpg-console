// Explicit one-turn, synthetic-only live parser diagnostic. Do not run as a test.
// The external caller may load an ignored env file with Node's --env-file option.
import { registerHooks } from "node:module";
import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { createIrisWorld,irisInput,irisSnapshot,irisTurn,syntheticSummaries } from
  "../tests/astra-iris-fixture.mjs";

const allowedKinds=new Set(["mundane_grant","job_offer","job_complete","job_reward",
  "formal_rest","unsupported_optional","mechanic_actions","currency_transfer",
  "item_transfer","mundane_purchase","mundane_sale","mundane_craft","item_exchange",
  "progression_award"]);
const allowedStatus=new Set(["committed","failed","awaiting_confirmation","cancelled"]);
const allowedPhases=new Set(["preflight","request","error-body","response-body",
  "provider-json","provider-state","output-parse","completed"]);
const allowedResults=new Set(["configuration","provider","context","validation",
  "conflict","unavailable","success"]);
const allowedProviderStatuses=new Set(["completed","incomplete","failed",
  "in_progress","cancelled"]);
const allowedTools=new Set(["query","skill","attack","save","damage"]);
const displayedTools=new Set(["skill","attack","save"]);
const allowedReasons=new Set(["output_message_shape","output_content_shape",
  "output_chunk_count","output_json_invalid","output_semantic_invalid",
  "decision_root_shape","decision_tool_shape","decision_tool_selection",
  "decision_final_shape","decision_final_limits","decision_change_shape",
  "decision_change_scope","decision_effect_scope","decision_effect_shape",
  "decision_effect_kind","decision_effect_fields","decision_rest_safety",
  "decision_rest_kind","decision_mechanic_actions"]);

function publicClass(state){
  return {hp:state.hp,maxHp:state.max_hp,
    silverBalance:Number.isSafeInteger(state.resources.currency_silver)
      ?state.resources.currency_silver:0,
    rewardItemCount:state.items.filter((item)=>item.name==="vegetables")
      .reduce((total,item)=>total+item.quantity,0),
    possessionCount:state.items.length,
    questCount:state.quests,completedRestCount:state.completed_rests,
    activeEncounterCount:state.active_encounters,
    currencyDefinitionCount:state.currencies.length};
}

// A fourth request is authorized only by the real public awaiting-confirmation
// result and its displayed recorded check. No retry or reroll path is exposed.
export function createIrisTextGate(realFetch,report){
  let requests=0,maxRequests=3,capReached=false,continued=false;
  const permitDisplayedContinue=(turn)=>{
    if(continued || turn?.status!=="awaiting_confirmation" ||
      !Array.isArray(turn.checks) || !turn.checks.some((check)=>
        displayedTools.has(check?.kind) && check.rollNumber===1))return false;
    continued=true;maxRequests=4;
    report.maxTextRequests=4;
    report.displayedCheckContinue=true;
    return true;
  };
  const fetcher=async(url,init)=>{
    if(requests>=maxRequests){capReached=true;report.requestCapReached=true;
      throw Error("text_request_cap_reached");}
    if(String(url)!=="https://api.openai.com/v1/responses")
      throw Error("unexpected_provider_route");
    const body=JSON.parse(String(init?.body??"{}"));
    const stage=body.text?.format?.name;
    if(body.model!=="gpt-6-astra" || body.store!==false ||
      body.service_tier!=="default" || body.text?.format?.strict!==true ||
      body.reasoning?.effort!==(stage==="dm_plan"?"high":"medium") ||
      body.tools || body.audio || body.image || body.video ||
      !["dm_plan","dm_narrate"].includes(stage) ||
      body.input?.some?.((message)=>message.content?.some?.((part)=>part.type!=="input_text")))
      throw Error("text_only_route_required");
    requests++;
    report.textRequests=requests;
    const response=await realFetch(url,init);
    report.providerHttpStatuses.push(Number.isInteger(response.status)
      ?response.status:null);
    // Only the fixed provider status survives; the transient body is discarded.
    let resultStatus=null;
    try {
      const payload=await response.clone().json();
      if(allowedProviderStatuses.has(payload?.status))resultStatus=payload.status;
    } catch { /* The production provider handles malformed bodies. */ }
    report.providerResultStatuses.push(resultStatus);
    return response;
  };
  return {fetcher,permitDisplayedContinue,capReached:()=>capReached};
}

export async function runIrisLive({live=false,apiKey=process.env.OPENAI_API_KEY,
  realFetch=fetch,worldFactory=createIrisWorld}={}){
  if(!live)throw Error("explicit_live_flag_required");
  if(typeof apiKey!=="string" || !apiKey.trim())throw Error("server_key_required");
  const report={scope:"one-disposable-synthetic-PGlite-campaign",
    turnCount:1,maxTextRequests:3,textRequests:0,mediaRequests:0,
    status:"not_started",failureCategory:null,requestCapReached:false,
    displayedCheckContinue:false,
    providerHttpStatuses:[],providerResultStatuses:[],planDiagnostics:[],
    decisionCategories:[],toolCategories:[],effectCategories:[],
    acceptedEffectCategories:[],rejectedEffectCategories:[],before:null,after:null};
  let world;
  try {
    world=await worldFactory();
    report.before=publicClass(world.state);
    const gate=createIrisTextGate(realFetch,report);
    const hook=registerHooks({resolve(specifier,context,nextResolve){
      return specifier==="server-only"
        ?{url:"data:text/javascript,export%20{}",shortCircuit:true}
        :nextResolve(specifier,context);
    }});
    let createAstraPrimaryProvider;
    try {({createAstraPrimaryProvider}=await import(
      "../src/lib/server/dm/astra-primary-provider.ts"));}
    finally {hook.deregister();}
    const actual=createAstraPrimaryProvider({apiKey,fetcher:gate.fetcher,
      planDiagnosticObserver:(diagnostic)=>{
        // Explicit allowlist: no body, generated prose, prompt, request ID or secret.
        report.planDiagnostics.push({
          httpStatus:Number.isInteger(diagnostic.httpStatus)?diagnostic.httpStatus:null,
          phase:allowedPhases.has(diagnostic.phase)?diagnostic.phase:"unknown",
          resultStatus:allowedResults.has(diagnostic.resultStatus)
            ?diagnostic.resultStatus:"unknown",
          reasonCode:diagnostic.reasonCode===null?null:
            allowedReasons.has(diagnostic.reasonCode)?diagnostic.reasonCode:"other"});
      }});
    const provider={
      next:async(...args)=>{
        const response=await actual.next(...args);
        const decision=response.output;
        report.decisionCategories.push(decision.type==="final"?"final":
          decision.type==="tool"?"tool":"unknown");
        if(decision.type==="tool")report.toolCategories.push(
          allowedTools.has(decision.call?.kind)?decision.call.kind:"other");
        if(decision.type==="final")report.effectCategories.push(...
          (decision.final.effects??[]).map((effect)=>allowedKinds.has(effect.kind)
            ?effect.kind:"other"));
        return response;
      },
      narrate:(...args)=>actual.narrate(...args),
    };
    const first=await irisTurn(world,provider,irisInput);
    let result=first.result;
    if(gate.permitDisplayedContinue(result)){
      const memory=createRpcMemoryStore(world.f.owner,async(args)=>{
        try{return {data:await world.f.memory(args.p_campaign_id,args.p_action,
          args.p_payload,args.p_timeline)};}
        catch(error){return {error:{message:error.message,code:error.code}};}
      },world.timeline);
      result=await resumeAstraTurn({commandId:randomUUID(),
        campaignId:world.f.cid,operationId:first.input.operationId,
        timeline:world.timeline,action:"continue",checkId:null},
      {store:first.store,memory,provider,summaries:syntheticSummaries});
    }
    report.status=gate.capReached()?"request_cap_reached":
      allowedStatus.has(result.status)?result.status:"unknown";
    report.failureCategory=allowedResults.has(result.failure)?result.failure:null;
    const ordered=(await world.f.one(`select astra_ordered_effects from rpg_private.turns
      where id=$1`,[first.input.operationId]))?.astra_ordered_effects;
    if(ordered?.schemaVersion===2){
      const category=(index)=>allowedKinds.has(ordered.intents?.[index]?.kind)
        ?ordered.intents[index].kind:"other";
      report.acceptedEffectCategories=(ordered.indices??[]).map(category);
      report.rejectedEffectCategories=(ordered.rejected??[]).map((entry)=>({
        kind:category(entry.index),
        reason:entry.reason==="not_authorized"?"not_authorized":"other"}));
    }
    report.after=publicClass(await irisSnapshot(world.f,world.hero));
  } catch(error) {
    report.status=report.requestCapReached || error?.message==="text_request_cap_reached"
      ?"request_cap_reached":
      ["unexpected_provider_route","text_only_route_required"].includes(error?.message)
        ?"route_rejected":"harness_error";
    if(world)report.after=publicClass(await irisSnapshot(world.f,world.hero));
  } finally {
    if(world)await world.f.db.close();
  }
  return report;
}

if(process.argv[1] && pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  if(process.argv.length!==3 || process.argv[2]!=="--live"){
    process.stderr.write("Run only with explicit --live and a server-side OPENAI_API_KEY.\n");
    process.exitCode=2;
  } else {
    try {
      const report=await runIrisLive({live:true});
      process.stdout.write(JSON.stringify(report)+"\n");
      if(report.status!=="committed")process.exitCode=1;
    } catch {
      process.stderr.write("Live harness prerequisite failed; no diagnostic body was retained.\n");
      process.exitCode=2;
    }
  }
}
