// Synthetic-only L1 benchmark. It never connects to Supabase or the owner app.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { fixture } from "../tests/phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { createWorld, snapshot, rollSchedule } from "./astra-primary-production-eight-turn-smoke.mjs";

const SCENARIOS = [
  { id:"quiet", input:"Orin, sit with me a moment. How are you holding up?", rolls:[] },
  { id:"travel", input:"Orin, let's go back to the Old Mine and deal with this properly. I head there with him.", rolls:[] },
  { id:"skill", atMine:true, input:"I cross the unstable timbered passage carefully. If it isn't safe, the roll decides whether I make it through.", rolls:rollSchedule[3] },
  { id:"attack", atMine:true, input:"I attack the Mine Stalker with my short sword. Let the server roll decide whether I hit and deal damage.", rolls:rollSchedule[4] },
  { id:"multi-tool", atMine:true, input:"I spend one Focus and commit to a sword strike against the Mine Stalker. Resolve the attack and damage with server rolls, then let Orin react in his own voice.", rolls:rollSchedule[4] },
];
const CONFIGS = [
  { id:"baseline", narrator:"high", tier:"default", repetitions:2 },
  { id:"narrator-medium", narrator:"medium", tier:"default", repetitions:2 },
  { id:"narrator-low", narrator:"low", tier:"default", repetitions:2 },
  { id:"fast", narrator:"high", tier:"fast", repetitions:1 },
  { id:"ultrafast", narrator:"high", tier:"ultrafast", repetitions:1 },
  { id:"cache-medium", narrator:"medium", tier:"default", repetitions:2, cache:true },
  { id:"websocket", narrator:"high", tier:"default", repetitions:1, transport:"websocket" },
  { id:"stream", narrator:"medium", tier:"default", repetitions:1, streamNarration:true },
];
const MAX_SPEND=40, MAX_REQUESTS=180;
// Astra short-context rates, including separate cache-write billing.
const price=(input,cached,write,output,tier)=>
  (Math.max(0,input-cached-write)*10+cached*1+write*12.5+output*50)/1e6*
  (tier==="fast"?2:tier==="ultrafast"?6:1);
const now=()=>performance.now();
const round=(v)=>Math.round(v);
const percentile=(rows,p)=>rows.length?[...rows].sort((a,b)=>a-b)[Math.ceil(rows.length*p)-1]:null;
const traces=[];
let spend=0,requests=0;

function timed(object,names,events){
  const wrapped={...object};
  for(const name of names)if(typeof object[name]==="function")wrapped[name]=async(...args)=>{
    const start=now();
    try{return await object[name](...args);}
    catch(error){events.push({kind:`${name}.error`,code:error?.code??null,message:String(error?.message??"").slice(0,120)});throw error;}
    finally{events.push({kind:name,start,end:now()});}
  };
  return wrapped;
}
async function createWebSocketTransport(){
  const root=process.env.ASTRA_L1_WS_DEP_ROOT;
  if(!root)throw Error("ASTRA_L1_WS_DEP_ROOT required for isolated WebSocket study");
  const {default:OpenAI}=await import(pathToFileURL(join(root,"node_modules/openai/index.mjs")).href);
  const {ResponsesWS}=await import(pathToFileURL(join(root,"node_modules/openai/resources/responses/ws.mjs")).href);
  const ws=new ResponsesWS(new OpenAI({apiKey:process.env.OPENAI_API_KEY}));
  let previous=null;
  return {close:()=>ws.close(),async send(body,stage){
    const request={type:"response.create",stream_id:"l1",...body};
    if(stage==="continuation"){
      if(!previous)throw Error("l1_missing_previous_response");
      const input=JSON.parse(body.input);
      const receipt=input.toolReceipts?.at(-1);
      if(!receipt)throw Error("l1_missing_durable_receipt");
      request.previous_response_id=previous.id;
      request.input=[{role:"user",content:[{type:"input_text",text:JSON.stringify({
        newDurableServerReceipt:receipt,recordedChecks:input.recordedChecks})}]}];
      delete request.instructions;
    }
    ws.send(request);
    for await(const event of ws){
      if(event.type==="error")throw Error(`l1_websocket_error:${event.error?.code??"unknown"}`);
      if(event.type!=="message")continue;
      if(event.message.type==="response.completed"){
        previous=event.message.response;
        return {response:new Response(JSON.stringify(previous),{status:200,
          headers:{"content-type":"application/json"}}),requestBytes:Buffer.byteLength(JSON.stringify(request))};
      }
      if(["response.failed","response.incomplete"].includes(event.message.type))
        throw Error(`l1_websocket_${event.message.type}:${event.message.response?.error?.code??"unknown"}`);
    }
    throw Error("l1_websocket_closed_before_completion");
  }};
}
function benchmarkFetcher(config,events,providerRows,wsTransport){
  return async(url,init)=>{
    if(requests>=MAX_REQUESTS)throw Error("l1_request_ceiling");
    const body=JSON.parse(String(init.body));
    const stage=body.text?.format?.name==="dm_narrate"?"narrate":providerRows.some((r)=>r.stage!=="narrate")?"continuation":"plan";
    if(stage==="narrate")body.reasoning.effort=config.narrator;
    body.service_tier=config.tier;
    if(config.streamNarration&&stage==="narrate")body.stream=true;
    if(config.cache){
      const root=JSON.parse(body.input);
      const packet=stage==="narrate"?root:root.context;
      const stable={settings:packet.mandatory.settings,
        guideBody:packet.mandatory.guide.body,dmCraft:packet.dmCraft??null,
        toolPolicy:root.astraPrimary?.toolPolicy??null};
      delete packet.mandatory.settings;
      delete packet.mandatory.guide.body;
      delete packet.dmCraft;
      if(root.astraPrimary)delete root.astraPrimary.toolPolicy;
      body.input=[
        {role:"user",content:[{type:"input_text",text:JSON.stringify({stable}),
          prompt_cache_breakpoint:{mode:"explicit"}}]},
        {role:"user",content:[{type:"input_text",text:JSON.stringify(root)}]},
      ];
      body.prompt_cache_key="astra-l1-synthetic-v1";
      body.prompt_cache_options={mode:"explicit",ttl:"30m"};
    }
    // The production request retains store=false and the exact structured schema.
    if(body.store!==false)throw Error("l1_store_policy");
    const possible=price(0,0,Buffer.byteLength(JSON.stringify(body))+2048,
      body.max_output_tokens,config.tier);
    if(spend+possible>MAX_SPEND)throw Error("l1_spend_ceiling");
    requests++;
    const start=now();
    const transportResult=wsTransport&&stage!=="narrate"
      ?await wsTransport.send(body,stage):null;
    let response=transportResult?.response??await fetch(url,{...init,body:JSON.stringify(body)});
    let firstTextMs=null,firstNarrationCharMs=null;
    if(config.streamNarration&&stage==="narrate"&&response.ok){
      const reader=response.body.getReader(),decoder=new TextDecoder();
      let pending="",output="",completed=null;
      for(;;){
        const {done,value}=await reader.read();
        if(done)break;
        pending=(pending+decoder.decode(value,{stream:true})).replaceAll("\r\n","\n");
        for(;;){
          const boundary=pending.indexOf("\n\n");
          if(boundary<0)break;
          const block=pending.slice(0,boundary);pending=pending.slice(boundary+2);
          const line=block.split("\n").find((l)=>l.startsWith("data: "));
          if(!line)continue;
          const event=JSON.parse(line.slice(6));
          if(event.type==="response.output_text.delta"){
            if(firstTextMs===null)firstTextMs=round(now()-start);
            output+=event.delta??"";
            if(firstNarrationCharMs===null&&/"narration"\s*:\s*"[^"\\]/.test(output))
              firstNarrationCharMs=round(now()-start);
          }
          if(event.type==="response.completed")completed=event.response;
          if(["response.failed","response.incomplete","error"].includes(event.type))
            throw Error(`l1_stream_${event.type}:${event.response?.error?.code??"unknown"}`);
        }
      }
      if(!completed)throw Error("l1_stream_no_completed_response");
      response=new Response(JSON.stringify(completed),{status:200,headers:{"content-type":"application/json"}});
    }
    const payload=await response.clone().json();
    const end=now(),usage=payload.usage??{};
    const row={number:requests,stage,httpStatus:response.status,model:payload.model??null,
      serviceTier:payload.service_tier??null,latencyMs:round(end-start),
      inputTokens:usage.input_tokens??0,cachedTokens:usage.input_tokens_details?.cached_tokens??0,
      cacheWriteTokens:usage.input_tokens_details?.cache_write_tokens??0,
      outputTokens:usage.output_tokens??0,reasoningTokens:usage.output_tokens_details?.reasoning_tokens??0,
      requestBytes:transportResult?.requestBytes??Buffer.byteLength(JSON.stringify(body)),
      responseStatus:payload.status??null,errorCode:payload.error?.code??null};
    row.firstTextMs=firstTextMs;row.firstNarrationCharMs=firstNarrationCharMs;
    row.estimatedSpendUsd=price(row.inputTokens,row.cachedTokens,row.cacheWriteTokens,
      row.outputTokens,config.tier);
    spend+=row.estimatedSpendUsd;
    providerRows.push(row);
    events.push({kind:`http.${stage}`,start,end});
    return response;
  };
}
async function runOne(f,createProvider,config,scenario,repetition,existingWorld=null){
  const w=existingWorld??await createWorld(f);
  if(scenario.atMine)await f.one("update public.rpg_public_state set current_location_id=$2 where campaign_id=$1",[w.cid,w.mine]);
  const before=await snapshot(f,w),fence=await f.fence(w.cid),events=[],providerRows=[],rolls=[];
  const runtime=async(args)=>({data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)});
  const memoryRpc=async(args)=>({data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)});
  const rawStore=createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence);
  const store=timed(rawStore,["begin","claim","recordAstraTool","checkpoint","commit","fail","getPublic"],events);
  const rawMemory=createRpcMemoryStore(f.owner,memoryRpc,fence);
  const memory=timed(rawMemory,["context","search","record","summarize","preflight"],events);
  const wsTransport=config.transport==="websocket"?await createWebSocketTransport():null;
  const provider=timed(createProvider({apiKey:process.env.OPENAI_API_KEY,
    fetcher:benchmarkFetcher(config,events,providerRows,wsTransport)}),["next","narrate"],events);
  const play=await store.readPlay(w.cid),operationId=randomUUID();
  const input={operationId,campaignId:w.cid,timeline:play.timeline,
    expectedRevision:play.revision,mode:"game",input:scenario.input,
    companionId:null,listenerIds:[],mechanic:null};
  const schedule=[...scenario.rolls];
  const random=(min,max)=>{
    const next=schedule.shift();
    if(min!==1||!next||next.max!==max)throw Error("l1_roll_schedule_mismatch");
    rolls.push(next.value);return next.value;
  };
  const deps={store,memory,provider,random,summaries:{summarize:async()=>{
    throw Error("l1_unexpected_summary_provider");
  }}};
  const start=now();
  let result=null,error=null;
  try{
    result=await runAstraTurn(input,deps);
    if(result.status==="awaiting_confirmation")result=await resumeAstraTurn({
      commandId:randomUUID(),campaignId:w.cid,operationId,timeline:fence,
      action:"continue",checkId:null},deps);
  }catch(e){error={name:e?.name??null,code:e?.code??null,message:String(e?.message??"").slice(0,300)};}
  if(wsTransport)wsTransport.close();
  const end=now(),after=await snapshot(f,w);
  const turn=await f.one("select status,failure,narration,checkpoint from rpg_private.turns where id=$1 and campaign_id=$2",[operationId,w.cid]);
  const receipts=turn?.checkpoint?.astraPrimary?.toolReceipts??[];
  const tools=receipts.map((r)=>r.call.kind);
  const committed=turn?.status==="committed";
  const checks={quiet:()=>tools.length===0,
    travel:()=>tools.length===0&&after.locationId===w.mine&&after.worldMinutes>before.worldMinutes,
    skill:()=>tools.includes("skill"),
    attack:()=>tools.includes("attack")&&tools.includes("damage")&&after.stalkerHp<before.stalkerHp,
    "multi-tool":()=>tools.includes("attack")&&tools.includes("damage")&&after.stalkerHp<before.stalkerHp&&after.focus===before.focus-1};
  const valid=committed&&checks[scenario.id]()&&schedule.length===0;
  const duration=(kind)=>events.filter((e)=>e.kind===kind).reduce((n,e)=>n+e.end-e.start,0);
  const firstPlan=events.find((e)=>e.kind==="next"),firstNarrate=events.find((e)=>e.kind==="narrate");
  const claim=events.find((e)=>e.kind==="claim"),begin=events.find((e)=>e.kind==="begin");
  const memoryBetween=(from,to)=>events.filter((e)=>["context","search"].includes(e.kind)&&e.start>=from&&e.end<=to)
    .reduce((n,e)=>n+e.end-e.start,0);
  const memoryMs=duration("context")+duration("search");
  const preflightMs=claim?Math.max(0,claim.start-(begin?.end??start)):null;
  const planContextMs=firstPlan&&claim?Math.max(0,firstPlan.start-claim.end-
    memoryBetween(claim.end,firstPlan.start)):null;
  const beforeNarration=firstNarrate?events.filter((e)=>e.kind==="checkpoint"&&e.end<=firstNarrate.start).at(-1):null;
  const publicContextMs=firstNarrate&&beforeNarration?Math.max(0,firstNarrate.start-beforeNarration.end-
    memoryBetween(beforeNarration.end,firstNarrate.start)):null;
  return {config:config.id,scenario:scenario.id,repetition,status:turn?.status??result?.status??"unknown",
    failure:turn?.failure??null,error,valid,elapsedMs:round(end-start),tools,rolls,
    providerRows,measurements:{preflightMs:round(preflightMs??0),memoryMs:round(memoryMs),
      planContextMs:round(planContextMs??0),plannerMs:round(duration("next")),
      toolPersistenceMs:round(duration("recordAstraTool")),
      publicContextMs:round(publicContextMs??0),narratorMs:round(duration("narrate")),
      finalCommitMs:round(duration("commit"))},
    state:{before,after},events,publicNarration:(turn?.narration??"").slice(0,2000)};
}

async function main(){
  if(process.env.ASTRA_L1_SYNTHETIC!=="yes"||!process.env.OPENAI_API_KEY)
    throw Error("Explicit synthetic L1 opt-in and server key required");
  const hook=registerHooks({resolve(specifier,context,nextResolve){
    return specifier==="server-only"?{url:"data:text/javascript,export%20{}",shortCircuit:true}:nextResolve(specifier,context);
  }});
  const {createAstraPrimaryProvider}=await import("../src/lib/server/dm/astra-primary-provider.ts");
  hook.deregister();
  const f=await fixture(38);
  try{
    const chosenConfigs=process.env.ASTRA_L1_CONFIGS
      ?CONFIGS.filter((c)=>process.env.ASTRA_L1_CONFIGS.split(",").includes(c.id)):CONFIGS.filter((c)=>c.id!=="cache-medium");
    const chosenScenarios=process.env.ASTRA_L1_SCENARIOS
      ?SCENARIOS.filter((s)=>process.env.ASTRA_L1_SCENARIOS.split(",").includes(s.id)):SCENARIOS;
    for(const config of chosenConfigs){
      const sharedWorld=process.env.ASTRA_L1_REUSE_CAMPAIGN==="yes"?await createWorld(f):null;
      for(let rep=1;rep<=config.repetitions;rep++)for(const scenario of chosenScenarios){
        const row=await runOne(f,createAstraPrimaryProvider,config,scenario,rep,sharedWorld);
        traces.push(row);
        process.stdout.write(JSON.stringify({config:row.config,scenario:row.scenario,repetition:rep,
          status:row.status,valid:row.valid,elapsedMs:row.elapsedMs,
          requests:row.providerRows.length,spend:round(spend*1000)/1000,
          error:row.error,failure:row.failure})+"\n");
        if(!row.valid){process.stdout.write("L1_STOP_ON_FAILURE\n");return;}
      }
    }
  }finally{
    const {mkdir,writeFile}=await import("node:fs/promises");
    await mkdir(".next",{recursive:true});
    const runSuffix=process.env.ASTRA_L1_RUN_ID?`-${process.env.ASTRA_L1_RUN_ID.replace(/[^a-z0-9_-]/gi,"")}`:"";
    const resultFile=process.env.ASTRA_L1_CONFIGS?`.next/astra-l1-${process.env.ASTRA_L1_CONFIGS.replaceAll(",","-")}${process.env.ASTRA_L1_REUSE_CAMPAIGN==="yes"?"-same-campaign":""}${runSuffix}.json`:
      ".next/astra-l1-synthetic-results.json";
    await writeFile(resultFile,JSON.stringify({base:"0371ef398f7525978dad2e33259c61bf2c0ca5d7",spend,requests,traces},null,2));
    process.stdout.write(JSON.stringify({resultFile,spend,requests,
      byConfig:CONFIGS.map((c)=>({id:c.id,n:traces.filter((r)=>r.config===c.id).length,
        p50:percentile(traces.filter((r)=>r.config===c.id).map((r)=>r.elapsedMs),.5),
        p95:percentile(traces.filter((r)=>r.config===c.id).map((r)=>r.elapsedMs),.95)}))})+"\n");
    await f.db.close();
  }
}
await main();
