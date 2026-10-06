// Reconstruct turns 1–6 with a fake provider through the production TurnStore,
// then make at most two real synthetic closure turns. Never uses owner data.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fixture } from "../tests/phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { arc, rollSchedule, createWorld, snapshot } from
  "./astra-primary-production-eight-turn-smoke.mjs";
import { diagnosticState, diagnosticFetcher, diagnosticProvider, diagnosticStore,
  diagnosticRpc, privateSnapshot } from "./astra-primary-production-smoke.mjs";

const fakeUsage={model:"scripted-fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
const fakeNarration=[
  "Orin nods. “I’m coming. But carefully.” Ten minutes later, you reach the Old Mine together. The fixed lamp stands beside the unstable timber passage. Orin says he still wants his father’s map, not another reason to regret coming here.",
  "You drain the last oil flask into the fixed mine lamp and light it. The flame steadies, but the passage remains unstable. You and Orin are still outside it.",
  "The server-recorded skill check succeeds. You test each foothold, cross the unstable timber passage carefully, and reach the far end without injury. The Old Mine remains your Location.",
  "Your server-recorded short sword attack hits the Mine Stalker. The damage receipt wounds it, leaving it at 3/8 HP. One Focus is spent.",
  "The Mine Stalker makes its server-recorded attack. Its claw hits Mara for 3 damage, leaving her at 6/10 HP. Orin has not made her decision for her.",
  "Your second server-recorded short sword attack hits. The damage receipt defeats the Mine Stalker at 0/8 HP. Mara remains at 6/10 HP and Focus 1/2.",
];
const expectedKinds={3:["skill"],4:["attack","damage"],5:["attack","damage"],
  6:["attack","damage"]};
const price=(input,output)=>(input*10+output*50)/1_000_000;
const slice=(rows,start)=>rows.slice(start);

function rpcFor(f){
  const runtime=async(args)=>{
    try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  const memory=async(args)=>{
    try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
  return {runtime,memory};
}
const summaries={summarize:async(job)=>({usage:{model:"synthetic-summary",
  inputTokens:0,outputTokens:0,calls:0,latencyMs:0},
  output:{schemaVersion:1,selections:job.sources.map((source)=>({
    sourceId:source.id,version:source.ref.version}))}})};

function fakeProvider(index,w){
  const kinds=expectedKinds[index+1]??[];
  return {
    next:async(_context,_input,receipts,_checks,_caps,source)=>{
      if(receipts.length<kinds.length){
        const kind=kinds[receipts.length];
        const actorId=index===4?w.stalker:w.hero;
        return {usage:fakeUsage,output:{type:"tool",final:null,call:{kind,
          actorId,targetId:kind==="attack"||kind==="damage"
            ?index===4?w.hero:w.stalker:null,
          itemId:kind==="attack"||kind==="damage"
            ?index===4?w.claw:w.item:null,
          dc:kind==="skill"?12:null,scope:null}}};
      }
      const changes=[];
      if(index===0||index===1){
        if(index===0)changes.push({family:"public_state",id:w.cid,
          expectedRevision:source.snapshot.publicState.revision,
          values:{current_location_id:w.mine}});
        else changes.push({family:"items",id:w.oil,
          expectedRevision:source.snapshot.items.find((item)=>item.id===w.oil).revision,
          values:{quantity:0}});
      }
      if(index===3)changes.push({family:"entities",id:w.hero,
        expectedRevision:source.snapshot.entities.find((entity)=>entity.id===w.hero).revision,
        values:{resources:{focus:1}}});
      if(index>=3&&index<=5){
        const targetId=index===4?w.hero:w.stalker;
        const target=source.snapshot.entities.find((entity)=>entity.id===targetId);
        changes.push({family:"entities",id:targetId,expectedRevision:target.revision,
          values:{hp:target.hp-receipts.at(-1).result.total}});
      }
      return {usage:fakeUsage,output:{type:"final",call:null,final:{
        worldMinutes:source.runtime.worldMinutes+(index===0?10:1),
        changes,outcomes:[],privatePatches:[]}}};
    },
    narrate:async()=>({usage:fakeUsage,output:{narration:fakeNarration[index],
      visualDescription:"",clarification:null}}),
  };
}

async function reconstruct(f,w,fence){
  const rpc=rpcFor(f);
  const store=createRpcTurnStore(f.owner,rpc.runtime,"gpt-6-astra",fence);
  const memory=createRpcMemoryStore(f.owner,rpc.memory,fence);
  const sceneBefore=(await f.one("select count(*)::integer n from public.rpg_scenes where campaign_id=$1",
    [w.cid])).n;
  const memoryBefore=(await f.one("select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and kind='scene'",
    [w.cid])).n;
  const operations=[];
  for(let index=0;index<6;index++){
    const turnNumber=index+1,operationId=randomUUID();
    const play=await store.readPlay(w.cid);
    const input={operationId,campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:arc[index],
      companionId:null,listenerIds:[],mechanic:null};
    const remaining=[...(rollSchedule[turnNumber]??[])];
    const random=(min,max)=>{
      const next=remaining.shift();
      assert.equal(min,1);
      assert.equal(max,next?.max,"deterministic preflight roll kind");
      return next.value;
    };
    const deps={store,memory,provider:fakeProvider(index,w),summaries,random};
    let turn=await runAstraTurn(input,deps);
    if(turn.status==="awaiting_confirmation")
      turn=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
        operationId,timeline:fence,action:"continue",checkId:null},deps);
    assert.equal(turn.status,"committed","offline acceptance turn "+turnNumber);
    assert.equal(remaining.length,0,"all scheduled rolls consumed on turn "+turnNumber);
    operations.push(operationId);
  }
  const state=await snapshot(f,w);
  assert.equal(state.locationId,w.mine);
  assert.equal(state.worldMinutes,15);
  assert.equal(state.maraHp,6);
  assert.equal(state.maraMaxHp,10);
  assert.equal(state.focus,1);
  assert.equal(state.oil,0);
  assert.equal(state.stalkerHp,0);
  assert.equal(state.stalkerMaxHp,8);
  const sceneAfter=(await f.one("select count(*)::integer n from public.rpg_scenes where campaign_id=$1",
    [w.cid])).n;
  const memoryAfter=(await f.one("select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and kind='scene'",
    [w.cid])).n;
  assert.equal(sceneAfter-sceneBefore,12,"six turns create player and DM scenes");
  assert.ok(memoryAfter-memoryBefore>=12,"committed scenes are indexed into Memory");
  const promiseSources=(await f.one("select count(*)::integer n from rpg_private.memory_public_sources where campaign_id=$1 and text ilike '%father%' and text ilike '%map%'",
    [w.cid])).n;
  assert.ok(promiseSources>0,"old map promise remains in source-linked Memory");
  const dm=(await f.one("select contents from rpg_private.dm_state where campaign_id=$1",[w.cid])).contents;
  const model=JSON.parse(dm.npc["character_"+w.npc]);
  assert.match(model.current.goal,/find the map/i);
  return {state,operations,sceneDelta:sceneAfter-sceneBefore,
    indexedSceneDelta:memoryAfter-memoryBefore,promiseSources,
    promiseUnresolved:model.current.goal};
}

export function guardQuietRandomTools(provider,onFailure){
  return {...provider,next:async(...args)=>{
    const response=await provider.next(...args);
    const kind=response.output?.type==="tool"?response.output.call?.kind:null;
    if(["skill","attack","save","damage"].includes(kind)){
      onFailure(response.output);
      throw Error("tool_policy_failure");
    }
    return response;
  }};
}

async function liveClosure(f,w,fence,reconstruction){
  const state=diagnosticState(process.env.OPENAI_API_KEY,
    {maxRequests:8,maxSpendUsd:5});
  const runtime=diagnosticRpc(state,(args)=>
    f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
  const memoryRpc=diagnosticRpc(state,(args)=>
    f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
  const store=diagnosticStore(state,createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence));
  const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
  const hook=registerHooks({resolve(specifier,context,nextResolve){
    return specifier==="server-only"
      ?{url:"data:text/javascript,export%20{}",shortCircuit:true}
      :nextResolve(specifier,context);
  }});
  const {createAstraPrimaryProvider}=await import(
    "../src/lib/server/dm/astra-primary-provider.ts");
  hook.deregister();
  const actual=createAstraPrimaryProvider({apiKey:process.env.OPENAI_API_KEY,
    fetcher:diagnosticFetcher(state,fetch)});
  const diagnostic=diagnosticProvider(state,actual);
  const result={status:"not-started",reason:null,reconstruction,turns:[],
    requests:0,inputTokens:0,outputTokens:0,cachedTokens:0,reasoningTokens:0,
    estimatedSpendUsd:null,finalState:null};
  for(let index=6;index<8;index++){
    const turnNumber=index+1,operationId=randomUUID();
    const before=await snapshot(f,w),play=await store.readPlay(w.cid);
    const input={operationId,campaignId:w.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:arc[index],
      companionId:null,listenerIds:[],mechanic:null};
    const start={requests:state.requests,input:state.inputTokens,
      output:state.outputTokens,responses:state.responses.length,
      decisions:state.parsedDecisions.length,events:state.events.length,
      sql:state.sqlErrors.length,contexts:state.contextSelections.length,
      latencies:state.latenciesMs.length};
    let policyFailure=null,turn=null,runError=null;
    const provider=index===6
      ?guardQuietRandomTools(diagnostic,(decision)=>{policyFailure=decision;})
      :diagnostic;
    const started=performance.now();
    try{
      const deps={store,memory,provider,summaries};
      turn=await runAstraTurn(input,deps);
      if(turn.status==="awaiting_confirmation")
        turn=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
          operationId,timeline:fence,action:"continue",checkId:null},deps);
    }catch(error){runError={name:error?.name??null,code:error?.code??null,
      message:typeof error?.message==="string"
        ?error.message.replaceAll(process.env.OPENAI_API_KEY,"[REDACTED]").slice(0,4_000)
        :null};}
    const elapsedMs=Math.round(performance.now()-started);
    const after=await snapshot(f,w);
    const saved=await privateSnapshot(f,w.cid,operationId);
    const narration=(await f.one("select narration from rpg_private.turns where id=$1 and campaign_id=$2",
      [operationId,w.cid]))?.narration??"";
    const responses=slice(state.responses,start.responses);
    const row={turnNumber,operationId,status:turn?.status??saved?.status??"threw",
      policyFailure,runError,elapsedMs,
      providerRequests:state.requests-start.requests,
      inputTokens:state.inputTokens-start.input,
      outputTokens:state.outputTokens-start.output,
      cachedTokens:responses.reduce((sum,r)=>sum+(r.usage.cachedTokens??0),0),
      reasoningTokens:responses.reduce((sum,r)=>sum+(r.usage.reasoningTokens??0),0),
      providerLatenciesMs:slice(state.latenciesMs,start.latencies),
      stateBefore:before,stateAfter:after,narration,
      responses,parsedDecisions:slice(state.parsedDecisions,start.decisions),
      contextSelections:slice(state.contextSelections,start.contexts),
      boundaryTrace:slice(state.events,start.events),
      sqlErrors:slice(state.sqlErrors,start.sql),privateSnapshot:saved};
    result.turns.push(row);
    const unchanged=after.maraHp===6&&after.focus===1&&after.oil===0&&
      after.stalkerHp===0;
    const moved=index===6?after.locationId===w.mine:
      after.locationId===w.location&&after.worldMinutes>before.worldMinutes;
    const callback=/map|promise/i.test(narration);
    const noLeak=!narration.includes("PRIVATE_BEFORE_FORK");
    if(policyFailure||row.status!=="committed"||!unchanged||!moved||!callback||!noLeak){
      result.status="failed";result.reason=policyFailure?"tool_policy_failure":
        row.status!=="committed"?"turn_not_committed":
          !unchanged?"state_changed_unexpectedly":
            !moved?"travel_or_location_mismatch":
              !callback?"promise_callback_missing":"private_leak";
      break;
    }
  }
  if(result.status!=="failed")result.status="passed";
  result.finalState=await snapshot(f,w);
  result.locations={copperLantern:w.location,oldMine:w.mine};
  result.requests=state.requests;result.inputTokens=state.inputTokens;
  result.outputTokens=state.outputTokens;
  result.cachedTokens=state.responses.reduce((sum,r)=>sum+(r.usage.cachedTokens??0),0);
  result.reasoningTokens=state.responses.reduce((sum,r)=>sum+(r.usage.reasoningTokens??0),0);
  result.estimatedSpendUsd=state.usageKnown
    ?Number(price(state.inputTokens,state.outputTokens).toFixed(4)):null;
  return result;
}

async function run(){
  const offline=process.argv.includes("--offline-preflight");
  if(!offline && (process.env.ASTRA_P1_CLOSURE_SMOKE!=="yes" || !process.env.OPENAI_API_KEY))
    throw Error("Explicit synthetic closure opt-in and server key required");
  const f=await fixture(38);
  try{
    const w=await createWorld(f),fence=await f.fence(w.cid);
    const reconstruction=await reconstruct(f,w,fence);
    if(offline){
      process.stdout.write(JSON.stringify({status:"post-six-ready",
        reconstruction,providerRequests:0})+"\n");
      return;
    }
    const result=await liveClosure(f,w,fence,reconstruction);
    process.stdout.write(JSON.stringify(result)+"\n");
    if(result.status!=="passed")process.exitCode=1;
  }finally{await f.db.close();}
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
  await run();
