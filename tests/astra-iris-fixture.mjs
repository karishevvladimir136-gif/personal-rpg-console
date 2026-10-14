import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { setup, examples } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";

export const irisInput = "now... my reward. and i need place to sleep pls! can help you in the morning";
export const syntheticUsage = {model:"synthetic",inputTokens:0,outputTokens:0,calls:0,latencyMs:0};
export const syntheticSummaries = {summarize:async(job)=>({usage:syntheticUsage,
  output:{schemaVersion:1,selections:job.sources.map((source)=>({
    sourceId:source.id,version:source.ref.version}))}})};

const opening = "Iris has finished sorting the market crates. The seller confirms the work is complete and still owes Iris two silver and vegetables. They have not agreed on lodging or tomorrow's work.";
const example={...examples.fantasy,
  name:"Iris",
  description:"Iris knows ordinary travel. She has a plain sword and a waterskin. She has no special resources and no other possessions.",
  caps:["ordinary travel"],limits:["no special resources"],
  item:"plain sword",
  location:"Roadside market",
  situation:"A known roadside market is open. The seller is present. Iris has finished the agreed crate work, and the seller owes two silver and vegetables. No lodging or tomorrow work has been agreed.",
  npc:"Market seller",narration:opening,
  adventure:"Open roadside market play with no active quest or encounter."};

function rpcFor(f,method){
  return async(args)=>{
    try {return {data:await f[method](args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error){return {error:{message:error.message,code:error.code}};}
  };
}

export async function irisSnapshot(f,hero){
  const row=await f.one(`select h.hp,h.max_hp,h.resources,r.world_minutes,
    p.current_location_id location_id from public.rpg_entities h
    join rpg_private.runtime_state r using(campaign_id)
    join public.rpg_public_state p using(campaign_id)
    where h.id=$1`,[hero]);
  const items=await f.query(`select name,category,quantity from public.rpg_items
    where campaign_id=$1 order by name`,[f.cid]);
  const counts=await f.one(`select
    (select count(*)::integer from public.rpg_quests where campaign_id=$1) quests,
    (select count(*)::integer from public.rpg_rest_records where campaign_id=$1 and status='complete') completed_rests,
    (select count(*)::integer from public.rpg_encounters where campaign_id=$1 and status='active') active_encounters`,[f.cid]);
  const foundation=(await f.one(`select world from rpg_private.world_foundations where campaign_id=$1`,[f.cid])).world;
  return {...row,items,...counts,currencies:foundation.currencies??[],
    jobs:foundation.jobs??[]};
}

export async function createIrisWorld(migrationLevel=48){
  // PGlite is disposable and wholly in-process; no owner connection or database is imported.
  const f=await setup(example,"en",migrationLevel);
  try {
    f.creation.possessions.push({name:"waterskin",description:"",
      quantity:1,quote:example.description});
    await f.create();
    await f.startOpening();
    const foundation=(await f.one(`select world from rpg_private.world_foundations
      where campaign_id=$1`,[f.cid])).world;
    const hero=foundation.actors.find((actor)=>actor.control==="player").entityId;
    const seller=foundation.actors.find((actor)=>actor.control==="autonomous").entityId;
    await f.one(`update public.rpg_entities set hp=10,max_hp=10,resources='{}'::jsonb
      where id=$1`,[hero]);
    const play=await f.runtime(f.cid,"play");
    await f.runtime(f.cid,"configure",{requestId:randomUUID(),campaignId:f.cid,
      expectedRevision:play.revision,configuration:{profile:"console-basic-v1",
        controlledEntityIds:[hero],presentEntityIds:[hero,seller],
        nearbyStorageIds:[],safeLocationIds:[],itemRules:[]}});
    const timeline=await f.fence(f.cid);
    const pin=await f.one(`select r.revision runtime_revision,p.revision public_revision,
      w.revision world_revision,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
      t.head_manifest_id head_id,(select coalesce(max(sequence),0) from rpg_private.world_events
      where campaign_id=r.campaign_id) world_event_sequence
      from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
      join rpg_private.world_foundations w using(campaign_id)
      join rpg_private.timeline_campaigns c using(campaign_id)
      join rpg_private.timelines t on t.id=c.active_timeline_id where r.campaign_id=$1`,[f.cid]);
    await f.runtime(f.cid,"astra_takeover",{requestId:randomUUID(),campaignId:f.cid,
      timeline,expectedRuntimeRevision:pin.runtime_revision,
      expectedWorldRevision:pin.world_revision,expectedPublicRevision:pin.public_revision,
      expectedHeadId:pin.head_id,expectedWorldDigest:pin.world_digest,
      expectedWorldEventSequence:pin.world_event_sequence});
    const state=await irisSnapshot(f,hero);
    assert.equal(state.hp,10);assert.equal(state.max_hp,10);
    assert.deepEqual(state.resources,{});
    assert.deepEqual(state.items.map((item)=>item.name),["plain sword","waterskin"]);
    assert.equal(state.quests,0);assert.equal(state.completed_rests,0);
    assert.equal(state.active_encounters,0);
    assert.deepEqual(state.currencies,[]);assert.deepEqual(state.jobs,[]);
    const location=await f.one(`select status from public.rpg_locations where id=$1`,
      [state.location_id]);
    assert.equal(location.status,"visited");
    const configuration=(await f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`,[f.cid])).configuration;
    assert.deepEqual(configuration.presentEntityIds,[hero,seller]);
    assert.deepEqual(configuration.safeLocationIds,[]);
    const history=await f.one(`select count(*)::integer n from public.rpg_scenes
      where campaign_id=$1 and role='narration' and body like '%owes Iris two silver and vegetables%'`,[f.cid]);
    assert.ok(history.n>0,"owed reward is public scene history, without a Quest");
    return {f,hero,seller,timeline,state};
  } catch(error){await f.db.close();throw error;}
}

export async function irisTurn(world,provider,inputText=irisInput,beforeRun=null){
  const {f,timeline}=world;
  const store=createRpcTurnStore(f.owner,rpcFor(f,"runtime"),"gpt-6-astra",timeline,true);
  const memory=createRpcMemoryStore(f.owner,rpcFor(f,"memory"),timeline);
  const play=await store.readPlay(f.cid);
  const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
    expectedRevision:play.revision,mode:"game",input:inputText,
    companionId:null,listenerIds:[],mechanic:null};
  await beforeRun?.({store,memory,input});
  const result=await runAstraTurn(input,{store,memory,provider,summaries:syntheticSummaries});
  return {result,input,store};
}
