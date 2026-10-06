// Explicit opt-in, disposable PGlite and one literal V2 turn. No owner DB or
// application service is imported. Run only after offline P1 gates pass.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { fixture, world } from "../tests/phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

if(process.env.ASTRA_P1_SYNTHETIC_SMOKE!=="yes" || !process.env.OPENAI_API_KEY)
  throw Error("Explicit synthetic smoke opt-in and server key are required");

const hook=registerHooks({resolve(specifier,context,nextResolve){
  return specifier==="server-only"
    ? {url:"data:text/javascript,export%20{}",shortCircuit:true}
    : nextResolve(specifier,context);
}});
const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
hook.deregister();

const f=await fixture(38);
const telemetry={requests:0,inputTokens:0,outputTokens:0,latencies:[]};
let status="not-started";
try {
  const w=await world(f,"Synthetic Astra production smoke");
  await f.one("update public.rpg_entities set name='Mara' where id=$1",[w.hero]);
  await f.one("update public.rpg_entities set name='Orin' where id=$1",[w.npc]);
  await f.one("update public.rpg_locations set name='Copper Lantern' where id=$1",[w.location]);
  await f.one("update public.rpg_scenes set body='Orin agreed to accompany Mara back to the Old Mine to discuss the promise about his father’s map.' where id=$1",[w.scene]);
  const mine=(await f.mutation("location.save",w.cid,{name:"Old Mine",
    description:"A known mine road and an old stone lamp",status:"known"})).id;
  const fence=await f.fence(w.cid);
  const runtime=async(args)=>{
    try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const store=createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence);
  const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
  const actual=createAstraPrimaryProvider({apiKey:process.env.OPENAI_API_KEY});
  const invoke=async(method,args)=>{
    if(telemetry.requests>=8)throw Error("synthetic_smoke_request_cap");
    telemetry.requests++;
    const started=performance.now();
    const result=await actual[method](...args);
    telemetry.latencies.push(Math.round(performance.now()-started));
    telemetry.inputTokens+=result.usage.inputTokens;
    telemetry.outputTokens+=result.usage.outputTokens;
    // Standard short-context upper estimate, with cached input counted at
    // the uncached rate. The strict eight-request cap keeps the smoke well
    // below the owner-approved US $20 maximum even at the 64K input cap.
    if((telemetry.inputTokens*10+telemetry.outputTokens*50)/1_000_000>20)
      throw Error("synthetic_smoke_spend_cap");
    return result;
  };
  const provider={next:(...args)=>invoke("next",args),
    narrate:(...args)=>invoke("narrate",args)};
  const play=await store.readPlay(w.cid);
  const input={operationId:randomUUID(),campaignId:w.cid,timeline:play.timeline,
    expectedRevision:play.revision,mode:"game",
    input:"Orin, let's go back to the Old Mine and deal with this properly. I head there with him.",
    companionId:null,listenerIds:[],mechanic:null};
  const deps={store,memory,provider,summaries:{summarize:()=>{
    throw Error("unexpected_summary_provider_call");
  }}};
  let turn=await runAstraTurn(input,deps);
  if(turn.status==="awaiting_confirmation")turn=await resumeAstraTurn({
    commandId:randomUUID(),campaignId:w.cid,operationId:input.operationId,
    timeline:fence,action:"continue",checkId:null},deps);
  status=turn.status;
  if(status==="committed"){
    const current=await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[w.cid]);
    const minutes=await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[w.cid]);
    if(current.current_location_id!==mine || minutes.world_minutes<=0)
      status="committed-without-required-travel";
  }
  const sorted=[...telemetry.latencies].sort((a,b)=>a-b);
  const percentile=(p)=>sorted.length?sorted[Math.ceil(p*sorted.length)-1]:null;
  process.stdout.write(JSON.stringify({status,turns:1,requests:telemetry.requests,
    inputTokens:telemetry.inputTokens,outputTokens:telemetry.outputTokens,
    estimatedSpendUsd:Number(((telemetry.inputTokens*10+
      telemetry.outputTokens*50)/1_000_000).toFixed(4)),
    p50LatencyMs:percentile(.5),p95LatencyMs:percentile(.95)})+"\n");
  if(status!=="committed")process.exitCode=1;
} catch(error) {
  process.stdout.write(JSON.stringify({status:"failed",category:error?.code??error?.name??"error",
    requests:telemetry.requests,inputTokens:telemetry.inputTokens,
    outputTokens:telemetry.outputTokens})+"\n");
  process.exitCode=1;
} finally {await f.db.close();}
