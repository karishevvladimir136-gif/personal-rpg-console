// Opt-in synthetic PGlite only. Imports neither owner DB nor owner app services.
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {registerHooks} from "node:module";
import {readFile,writeFile} from "node:fs/promises";
import {resolve} from "node:path";
import {pathToFileURL} from "node:url";
import {genericFixture,final,npc} from "../tests/astra-generic-fixture.mjs";
import {runAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
import {diagnosticState,diagnosticFetcher,diagnosticProvider,diagnosticStore,privateSnapshot} from "./astra-primary-production-smoke.mjs";
import {scrubSmokeReport} from "./astra-simplified-live-smoke.mjs";

export const GENERIC_LIVE_LIMITS=Object.freeze({requests:10,reservedUsd:5,maxOutputTokens:4096,maxRequestBytes:100000});
const pricingUrl="https://developers.openai.com/api/docs/models/gpt-6-astra.md";
export async function verifyOfficialPricing(fetcher=fetch){
 const response=await fetcher(pricingUrl,{signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw Error("smoke_official_pricing_unavailable");
 const text=await response.text();
 // Fail closed on any price change; this is not an old-rate fallback.
 const rows=[...text.matchAll(/^\| (Input|Cached input|Cache writes|Output) \| \$(\d+(?:\.\d+)?) \| 1M tokens \|\s*$/gm)];
 const rates=Object.fromEntries(rows.map(v=>[v[1],Number(v[2])]));
 if(rows.length!==4 || rates.Input!==10 || rates["Cached input"]!==1 || rates["Cache writes"]!==12.5 || rates.Output!==50 || !text.includes("272K"))
  throw Error("smoke_official_pricing_not_established");
 return {url:pricingUrl,checkedAt:new Date().toISOString(),inputPerMillion:10,cacheWritePerMillion:12.5,outputPerMillion:50};
}
export function genericLiveGate(budget,nextFetch,pricing=verifyOfficialPricing){
 return async(url,init)=>{
  if(budget.stopped)throw Error("smoke_already_stopped");
  const body=JSON.parse(String(init?.body??"{}")),bytes=Buffer.byteLength(String(init?.body??""));
  if(url!=="https://api.openai.com/v1/responses" || body.model!=="gpt-6-astra" || !["high","medium"].includes(body.reasoning?.effort) ||
   body.service_tier!=="default" || body.stream || !Number.isInteger(body.max_output_tokens) || body.max_output_tokens<1 ||
   body.max_output_tokens>GENERIC_LIVE_LIMITS.maxOutputTokens || bytes>GENERIC_LIVE_LIMITS.maxRequestBytes)throw Error("smoke_contract_mismatch");
  const price=await pricing();
  if(price.inputPerMillion!==10 || price.cacheWritePerMillion!==12.5 || price.outputPerMillion!==50)throw Error("smoke_pricing_changed");
  const reserve=((bytes+2048)*price.cacheWritePerMillion+body.max_output_tokens*price.outputPerMillion)/1e6;
  if(budget.calls>=10 || budget.reservedUsd+reserve>5)throw Error("smoke_request_or_reservation_ceiling");
  budget.calls++;budget.reservedUsd+=reserve;
  const row={request:budget.calls,requestBytes:bytes,inputUpperTokens:bytes+2048,maxOutputTokens:body.max_output_tokens,
   reserveUsd:reserve,reasoning:body.reasoning.effort,pricing:price,status:null,latencyMs:null};budget.entries.push(row);
  const started=performance.now();try{const response=await nextFetch(url,init);row.status=response.status;if(!response.ok)budget.stopped=true;return response;}
  catch(error){budget.stopped=true;throw error;}finally{row.latencyMs=performance.now()-started;}
 };
}

export async function runGenericLiveSmoke({apiKey,confirmation,outputPath,fetcher=fetch,pricing=verifyOfficialPricing}={}){
 if(confirmation!=="ten-text-requests-five-usd-offline-gates-passed")throw Error("smoke_explicit_confirmation_required");
 if(typeof apiKey!=="string"||!apiKey.trim())throw Error("smoke_key_required");
 const s=await genericFixture(),privateCase=await genericFixture(),budget={calls:0,reservedUsd:0,entries:[],stopped:false};
 const diagnostics=diagnosticState(apiKey,{maxRequests:10,maxSpendUsd:5}),attempts=[],parses=[],turns=[];
 let stopReason=null;
 const snapshot=async h=>({entities:await h.f.query("select id,name,kind,hp,max_hp,resources from public.rpg_entities where campaign_id=$1 order by id",[h.f.cid]),
  items:await h.f.query("select id,name,quantity,owner_entity_id,mechanics from public.rpg_items where campaign_id=$1 order by id",[h.f.cid]),
  quests:await h.f.query("select id,title,status,reward_operation_id,reward_terms from public.rpg_quests where campaign_id=$1 order by id",[h.f.cid]),
  runtime:await h.f.one("select revision,world_minutes,configuration from rpg_private.runtime_state where campaign_id=$1",[h.f.cid])});
 try{
  // Separate private fixture is prepared before any real dispatch. It does not
  // preseed the unseeded journey or repair live results between scenarios.
  const seeded=await privateCase.turn("I meet Hobb.",(_c,_i,_r,_k,_a,source)=>{const d=final(source,[npc("miller","Hobb")],"Hobb is the miller. He offers two silver for packing crates.");
   d.final.privatePatches=[{kind:"fact",key:"hobb_secret",operation:"set",value:"SYNTHETIC_PRIVATE_HOBB_IS_PROTECTING_A_FUGITIVE",amount:null}];return d;});
  assert.equal(seeded.result.status,"committed");
  const hook=registerHooks({resolve(v,c,next){return v==="server-only"?{url:"data:text/javascript,export%20{}",shortCircuit:true}:next(v,c);}});
  const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");hook.deregister();
  const provider=diagnosticProvider(diagnostics,createAstraPrimaryProvider({apiKey,fetcher:genericLiveGate(budget,diagnosticFetcher(diagnostics,fetcher),pricing),
   attemptObserver:row=>attempts.push(row),planDiagnosticObserver:row=>parses.push(row)}));
  const scenarios=[
   {id:"A-introduction",h:s,input:"I follow the lead to the village mill and greet Hobb, the miller. I ask whether he has ordinary crate-packing work for two silver."},
   {id:"BCD-accept-complete-reward",h:s,input:"I accept Hobb's crate-packing job for two silver. Please record our agreement. I spend the time carefully packing the crates as agreed, ask him to inspect the finished work, then collect the earned two silver."},
   {id:"E-unseeded-purchase",h:s,input:"I meet Bessa at the village bakery and agree to buy one ordinary loaf of bread for two silver. I pay her from my purse and put the loaf in my pack."},
   {id:"F-consume",h:s,input:"I sit beside the mill stream and eat the bread I just bought."},
   {id:"G-return",h:s,input:"I return to Hobb. I thank him for the crate work and ask how his morning has gone since we spoke."},
   {id:"private-informed-refusal",h:privateCase,input:"Hobb, may I go into the locked back room? I ask politely and wait for his answer."},
  ];
  const initialState=await snapshot(s);
  for(const scenario of scenarios){
   if(budget.stopped)break;
   const h=scenario.h,stores=await h.stores(),play=await stores.store.readPlay(h.f.cid),input={operationId:randomUUID(),campaignId:h.f.cid,
    timeline:play.timeline,expectedRevision:play.revision,mode:"game",input:scenario.input,companionId:null,listenerIds:[],mechanic:null};
   Object.assign(stores.store,diagnosticStore(diagnostics,{...stores.store}));
   const before=await snapshot(h),callStart=budget.calls,time=performance.now();let result;
   try{result=await runAstraTurn(input,{...stores,provider,summaries:{summarize:()=>assert.fail("no foreground/background paid summary")}});}
   catch(error){stopReason=error?.code??error?.message??"runtime_threw";}
   const row=await h.f.one("select astra_response_mode mode,astra_state_contract contract,astra_ordered_effects plan,astra_diagnostic diagnostic from rpg_private.turns where id=$1",[input.operationId]);
   turns.push({scenario:scenario.id,operationId:input.operationId,input:input.input,status:result?.status??"threw",failure:result?.failure??stopReason,
    requests:budget.calls-callStart,fullTurnMs:performance.now()-time,mode:row?.mode,contract:row?.contract,narration:result?.narration,
    accepted:row?.plan?.accepted,rejected:row?.plan?.rejected,diagnostic:row?.diagnostic,before,after:await snapshot(h),
    privateCheckpoint:await privateSnapshot(h.f,h.f.cid,input.operationId)});
   if(!result || result.status!=="committed"){stopReason??=`${scenario.id}:${result?.failure??result?.status}`;budget.stopped=true;break;}
   const after=turns.at(-1).after,hero=after.entities.find(e=>e.id===h.hero);
   if(scenario.id==="BCD-accept-complete-reward" && (hero.resources.currency_silver!==7 || !after.quests.some(q=>q.status==="complete"&&q.reward_operation_id))){stopReason="live_reward_journey_not_established";break;}
   if(scenario.id==="E-unseeded-purchase" && (hero.resources.currency_silver!==5 || !after.items.some(i=>i.name.toLowerCase().includes("bread")&&i.owner_entity_id===h.hero&&i.quantity===1) || !after.entities.some(e=>e.name==="Bessa"&&e.resources.currency_silver===2))){stopReason="live_reciprocal_purchase_not_established";break;}
   if(scenario.id==="F-consume" && after.items.some(i=>i.name.toLowerCase().includes("bread")&&i.owner_entity_id===h.hero&&i.quantity>0)){stopReason="live_consumption_not_established";break;}
   if(scenario.id==="private-informed-refusal" && row.mode!=="private-informed"){stopReason="private_route_not_exercised";break;}
  }
  const report=scrubSmokeReport({schemaVersion:1,syntheticOnly:true,limits:GENERIC_LIVE_LIMITS,requests:budget.calls,reservedUsd:budget.reservedUsd,
   requestBudget:budget.entries,stopReason,initialState,finalState:await snapshot(s),turns,attempts,parses,responses:diagnostics.responses,
   parsedDecisions:diagnostics.parsedDecisions,trace:diagnostics.events,sqlErrors:diagnostics.sqlErrors,
   estimatedSpendUsd:diagnostics.usageKnown?(diagnostics.inputTokens*10+diagnostics.outputTokens*50)/1e6:null,
   inputTokens:diagnostics.inputTokens,outputTokens:diagnostics.outputTokens,realMediaCalls:0},apiKey);
  if(outputPath)await writeFile(outputPath,JSON.stringify(report,null,2));return report;
 }finally{await s.f.db.close();await privateCase.f.db.close();}
}

if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 if(process.env.RPG_GENERIC_STATE_LIVE!=="authorized-after-offline-gates")throw Error("smoke_offline_gate_required");
 const keyFile=process.argv[2],output=process.argv[3];
 if(!keyFile||!output)throw Error("smoke_key_file_and_report_required");
 const line=(await readFile(keyFile,"utf8")).split(/\r?\n/).find(v=>/^OPENAI_API_KEY=/.test(v));
 const key=line?.slice("OPENAI_API_KEY=".length).trim().replace(/^(['"])(.*)\1$/,"$2");
 const report=await runGenericLiveSmoke({apiKey:key,confirmation:"ten-text-requests-five-usd-offline-gates-passed",outputPath:output});
 console.log(JSON.stringify({requests:report.requests,reservedUsd:report.reservedUsd,estimatedSpendUsd:report.estimatedSpendUsd,stopReason:report.stopReason,turns:report.turns.map(t=>({scenario:t.scenario,status:t.status,requests:t.requests}))}));
}
