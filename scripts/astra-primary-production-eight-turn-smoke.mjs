// Fresh, disposable production-path Mechanical Acceptance V2 sequence.
// The diagnostic wrappers are shared with the first-turn forensic harness.
import { randomUUID } from "node:crypto";
import { registerHooks } from "node:module";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { fixture, world } from "../tests/phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { characterPacket } from "../src/lib/gameplay/character-model.ts";
import { diagnosticState, diagnosticFetcher, diagnosticProvider, diagnosticStore,
  diagnosticRpc, privateSnapshot } from "./astra-primary-production-smoke.mjs";

export const arc=[
  "Orin, let's go back to the Old Mine and deal with this properly. I head there with him.",
  "I use my last oil flask in the old mine lamp and light it.",
  "I cross the unstable timbered passage carefully. If it isn't safe, the roll decides whether I make it through.",
  "I spend one Focus and commit to a sword strike against the Mine Stalker. Roll it honestly.",
  "I hold my ground. Resolve the Stalker's attack before I act again. Don't protect me from the consequences.",
  "I attack it again with the short sword. If the roll is enough to finish it, finish it. If not, it stays alive.",
  "I do not rest or heal. I check my condition and my pack, then sit at the mine entrance for a quiet moment and think about what I still owe Orin.",
  "I head back to the Copper Lantern with Orin. On the way, I bring up my promise about his father's map instead of pretending I've forgotten it.",
];
export const rollSchedule={3:[{max:21,value:18}],
  4:[{max:21,value:13},{max:5,value:3}],
  5:[{max:21,value:15},{max:5,value:3}],
  6:[{max:21,value:14},{max:5,value:3}]};
const price=(input,output)=>(input*10+output*50)/1_000_000;
const pick=(rows,start)=>rows.slice(start);
const percentile=(values,p)=>{
  if(!values.length)return null;
  const sorted=[...values].sort((a,b)=>a-b);
  return sorted[Math.ceil(p*sorted.length)-1];
};

export async function createWorld(f){
  const w=await world(f,"Synthetic Astra P1 eight-turn acceptance");
  // P1 records raw damage dice with modifier 0. The historical V2 fixture
  // added +1 to each damage die; this disposable setup preserves the owner's
  // requested raw die 3 schedule and final 6/10, 0/8 HP without changing code.
  await f.one("update public.rpg_entities set name='Mara',hp=9,max_hp=10,resources='{\"focus\":2}'::jsonb,stats=stats||'{\"attack\":2,\"defense\":11}'::jsonb where id=$1",[w.hero]);
  await f.one("update public.rpg_entities set name='Orin' where id=$1",[w.npc]);
  await f.one("update public.rpg_locations set name='Copper Lantern' where id=$1",[w.location]);
  await f.one("update public.rpg_items set name='Short sword' where id=$1",[w.item]);
  await f.one("update public.rpg_scenes set body='Mara promised Orin she would help find his father’s map. Orin agreed to return to the Old Mine.' where id=$1",[w.scene]);
  const mine=(await f.mutation("location.save",w.cid,{name:"Old Mine",
    description:"A fixed lamp and unstable timber passage",status:"known"})).id;
  const oil=(await f.mutation("item.save",w.cid,{name:"Oil flask",category:"consumable",
    quantity:1,description:"Last lamp oil",mechanics:"",owner_entity_id:w.hero,
    storage_id:w.storage,equipped_entity_id:null,equipped_slot:null})).id;
  const stalker=(await f.mutation("entity.save",w.cid,{kind:"npc",name:"Mine Stalker",
    details:"A hostile creature in the mine",hp:6,max_hp:8,
    stats:{skill:0,attack:2,save:0,defense:11},resources:{},conditions:[],
    equipment_slots:[{id:"hand",label:"Hand",accepts:["weapon"]}]})).id;
  const stalkerPack=(await f.mutation("storage.save",w.cid,{name:"Stalker gear",
    kind:"merchant",entity_id:stalker})).id;
  const claw=(await f.mutation("item.save",w.cid,{name:"Claw",category:"weapon",
    quantity:1,description:"Natural claw",mechanics:"",owner_entity_id:stalker,
    storage_id:stalkerPack,equipped_entity_id:stalker,equipped_slot:"hand"})).id;
  const orinModel={schemaVersion:1,actorId:w.npc,basisOperationId:null,
    identity:{values:["Keeps his own promises"],wants:["Find his father's map"],
      boundaries:["May refuse a reckless plan"],loyalties:[],signatures:[],
      observableVoice:"Measured, tired, and direct"},
    current:{goal:"Find the map without getting Mara killed",stress:"settled",
      preoccupation:null,obligation:null},beliefs:[],relationships:[],episodes:[]};
  await f.one("update rpg_private.dm_state set contents=jsonb_set(contents,'{npc}',coalesce(contents->'npc','{}'::jsonb)||jsonb_build_object($2::text,$3::text),true) where campaign_id=$1",
    [w.cid,`character_${w.npc}`,JSON.stringify(orinModel)]);
  const play=await f.runtime(w.cid,"play");
  await f.runtime(w.cid,"configure",{requestId:randomUUID(),campaignId:w.cid,
    expectedRevision:play.revision,configuration:{...play.configuration,
      presentEntityIds:[w.hero,w.npc,stalker],
      itemRules:[{itemId:w.item,tag:"weapon",damage:4},
        {itemId:claw,tag:"weapon",damage:4}]}});
  return {...w,mine,oil,stalker,claw};
}

export async function snapshot(f,w){
  const row=await f.one("select ps.current_location_id location_id,ps.revision public_revision,rs.world_minutes,rs.revision runtime_revision,h.hp hero_hp,h.max_hp hero_max,h.resources->>'focus' focus,i.quantity oil,s.hp stalker_hp,s.max_hp stalker_max from public.rpg_public_state ps join rpg_private.runtime_state rs on rs.campaign_id=ps.campaign_id join public.rpg_entities h on h.id=$2 join public.rpg_items i on i.id=$3 join public.rpg_entities s on s.id=$4 where ps.campaign_id=$1",
    [w.cid,w.hero,w.oil,w.stalker]);
  return {locationId:row.location_id,publicRevision:row.public_revision,
    worldMinutes:row.world_minutes,runtimeRevision:row.runtime_revision,
    maraHp:row.hero_hp,maraMaxHp:row.hero_max,focus:Number(row.focus),
    oil:row.oil,stalkerHp:row.stalker_hp,stalkerMaxHp:row.stalker_max};
}

function expectedRolls(turnNumber,receipts){
  const expected=rollSchedule[turnNumber]??[];
  const actual=receipts.filter((r)=>["skill","attack","damage"].includes(r.call.kind))
    .map((r)=>({kind:r.call.kind,die:r.result.dice?.[0]??null}));
  if(actual.length!==expected.length)return "roll_count";
  for(let i=0;i<actual.length;i++)if(actual[i].die!==expected[i].value)
    return "roll_value";
  return null;
}

function transitionFailure(turnNumber,before,after,w,receipts,narration,publicTurn){
  if(JSON.stringify(publicTurn).includes("PRIVATE_BEFORE_FORK") ||
      narration.includes("PRIVATE_BEFORE_FORK"))return "private_leak";
  const rollError=expectedRolls(turnNumber,receipts);
  if(rollError)return rollError;
  if(after.worldMinutes<before.worldMinutes)return "time_regressed";
  if(turnNumber===1 && (after.locationId!==w.mine ||
      after.worldMinutes<=before.worldMinutes))return "outbound_travel";
  if(turnNumber===2 && (after.oil!==0 || after.locationId!==w.mine))return "oil_consumption";
  if(turnNumber===3 && after.locationId!==w.mine)return "passage_location";
  if(turnNumber===4 && (after.focus!==1 || after.stalkerHp>=before.stalkerHp))
    return "player_attack_state";
  if(turnNumber===5 && after.maraHp>=before.maraHp)return "enemy_attack_state";
  if(turnNumber===6 && after.stalkerHp>=before.stalkerHp)return "second_attack_state";
  if(turnNumber===7 && (after.maraHp!==before.maraHp || after.focus!==before.focus ||
      after.oil!==before.oil || after.locationId!==w.mine))return "aftermath_state";
  if(turnNumber===8 && (after.locationId!==w.location ||
      after.worldMinutes<=before.worldMinutes))return "return_travel";
  if([7,8].includes(turnNumber) && !/map|promise/i.test(narration))return "promise_callback";
  return null;
}

async function run(){
  if(process.argv.includes("--offline-fixture-check")){
    const f=await fixture(38);
    try{
      const w=await createWorld(f),state=await snapshot(f,w);
      const play=await f.runtime(w.cid,"play");
      const input={operationId:randomUUID(),campaignId:w.cid,
        expectedRevision:play.revision,mode:"game",input:arc[0],
        companionId:null,listenerIds:[],mechanic:null};
      await f.runtime(w.cid,"begin",{...input,serverRuntime:"astra-primary-v1"},
        await f.fence(w.cid));
      const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId},
        await f.fence(w.cid));
      const models=characterPacket(claim.source,input,"plan");
      process.stdout.write(JSON.stringify({status:"fixture-ready",state,
        locations:{copperLantern:w.location,oldMine:w.mine},
        characterModelIds:models.map((model)=>model.actorId),providerRequests:0})+"\n");
    }finally{await f.db.close();}
    return;
  }
  if(process.env.ASTRA_P1_EIGHT_TURN_SMOKE!=="yes" || !process.env.OPENAI_API_KEY)
    throw Error("Explicit eight-turn synthetic smoke opt-in and server key required");
  const hook=registerHooks({resolve(specifier,context,nextResolve){
    return specifier==="server-only"
      ?{url:"data:text/javascript,export%20{}",shortCircuit:true}
      :nextResolve(specifier,context);
  }});
  const {createAstraPrimaryProvider}=await import(
    "../src/lib/server/dm/astra-primary-provider.ts");
  hook.deregister();
  const f=await fixture(38),state=diagnosticState(process.env.OPENAI_API_KEY,
    {maxRequests:32,maxSpendUsd:20});
  const result={status:"not-started",failureTurn:null,reason:null,turns:[],
    initialState:null,finalState:null,requests:0,inputTokens:0,outputTokens:0,
    cachedTokens:0,reasoningTokens:0,estimatedSpendUsd:0,
    p50TurnLatencyMs:null,p95TurnLatencyMs:null};
  try{
    const w=await createWorld(f);
    result.initialState=await snapshot(f,w);
    const fence=await f.fence(w.cid);
    const runtime=diagnosticRpc(state,(args)=>
      f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
    const memoryRpc=diagnosticRpc(state,(args)=>
      f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline));
    const store=diagnosticStore(state,createRpcTurnStore(f.owner,runtime,"gpt-6-astra",fence));
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const actual=createAstraPrimaryProvider({apiKey:process.env.OPENAI_API_KEY,
      fetcher:diagnosticFetcher(state,fetch)});
    const provider=diagnosticProvider(state,actual);
    const summaries={summarize:async(job)=>({usage:{model:"synthetic-summary",
      inputTokens:0,outputTokens:0,calls:0,latencyMs:0},
      output:{schemaVersion:1,selections:job.sources.map((source)=>({
        sourceId:source.id,version:source.ref.version}))}})};
    for(let index=0;index<arc.length;index++){
      const turnNumber=index+1,operationId=randomUUID();
      const before=await snapshot(f,w),play=await store.readPlay(w.cid);
      const input={operationId,campaignId:w.cid,timeline:play.timeline,
        expectedRevision:play.revision,mode:"game",input:arc[index],
        companionId:null,listenerIds:[],mechanic:null};
      const start={responses:state.responses.length,events:state.events.length,
        sql:state.sqlErrors.length,decisions:state.parsedDecisions.length,
        contexts:state.contextSelections.length,requests:state.requests,
        input:state.inputTokens,output:state.outputTokens,
        latencies:state.latenciesMs.length};
      const schedule=[...(rollSchedule[turnNumber]??[])],rolled=[];
      const random=(min,max)=>{
        const next=schedule.shift();
        rolled.push({min,max,actual:next?.value??null});
        if(min!==1 || !next || max!==next.max)
          throw Error("synthetic_roll_schedule_mismatch");
        return next.value;
      };
      const started=performance.now();
      let publicTurn=null,runError=null;
      try{
        const deps={store,memory,provider,summaries,random};
        publicTurn=await runAstraTurn(input,deps);
        if(publicTurn.status==="awaiting_confirmation")
          publicTurn=await resumeAstraTurn({commandId:randomUUID(),campaignId:w.cid,
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
      const receipts=saved?.toolReceipts??[];
      const responses=pick(state.responses,start.responses);
      const selections=pick(state.contextSelections,start.contexts);
      const turn={turnNumber,operationId,input:arc[index],status:publicTurn?.status??saved?.status??"threw",
        runError,elapsedMs,providerRequests:state.requests-start.requests,
        inputTokens:state.inputTokens-start.input,
        outputTokens:state.outputTokens-start.output,
        cachedTokens:responses.reduce((sum,r)=>sum+(r.usage.cachedTokens??0),0),
        reasoningTokens:responses.reduce((sum,r)=>sum+(r.usage.reasoningTokens??0),0),
        providerLatenciesMs:pick(state.latenciesMs,start.latencies),
        stateBefore:before,stateAfter:after,rolled,
        publicNarration:narration,contextSelections:selections,
        responses,parsedDecisions:pick(state.parsedDecisions,start.decisions),
        boundaryTrace:pick(state.events,start.events),
        sqlErrors:pick(state.sqlErrors,start.sql),privateSnapshot:saved};
      result.turns.push(turn);
      const failure=turn.status!=="committed"?"turn_not_committed":
        transitionFailure(turnNumber,before,after,w,receipts,narration,publicTurn);
      if(failure || schedule.length){
        result.status="failed";result.failureTurn=turnNumber;
        result.reason=failure??"unused_scheduled_roll";
        break;
      }
    }
    if(result.status!=="failed"){
      const final=await snapshot(f,w);
      result.status=result.turns.length===8 && final.locationId===w.location &&
        final.maraHp===6 && final.maraMaxHp===10 && final.focus===1 &&
        final.oil===0 && final.stalkerHp===0 && final.stalkerMaxHp===8 &&
        final.worldMinutes>result.initialState.worldMinutes
        ?"passed":"failed";
      if(result.status==="failed")result.reason="final_state_mismatch";
    }
    result.finalState=await snapshot(f,w);
    result.locations={copperLantern:w.location,oldMine:w.mine};
  }catch(error){
    result.status="failed";
    result.reason=error?.code??error?.name??"synthetic_setup_error";
  }finally{
    result.requests=state.requests;result.inputTokens=state.inputTokens;
    result.outputTokens=state.outputTokens;
    result.cachedTokens=state.responses.reduce((sum,r)=>sum+(r.usage.cachedTokens??0),0);
    result.reasoningTokens=state.responses.reduce((sum,r)=>sum+(r.usage.reasoningTokens??0),0);
    result.estimatedSpendUsd=state.usageKnown?Number(price(state.inputTokens,state.outputTokens).toFixed(4)):null;
    const times=result.turns.map((turn)=>turn.elapsedMs);
    result.p50TurnLatencyMs=percentile(times,.5);
    result.p95TurnLatencyMs=percentile(times,.95);
    process.stdout.write(JSON.stringify(result)+"\n");
    if(result.status!=="passed")process.exitCode=1;
    await f.db.close();
  }
}

if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)
  await run();
