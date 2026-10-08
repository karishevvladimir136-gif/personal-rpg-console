import { randomUUID } from "node:crypto";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { planAstraEffects, legacySettlementKind } from "../src/lib/gameplay/astra-settlement.ts";
const usage = {model:"fake",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
export async function takenOver(migrationLevel=48, progression=false) {
  const f = await setup(undefined,"en",migrationLevel);
  await f.create();
  await f.startOpening();
  const foundation = await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid]);
  const hero=foundation.world.actors.find((actor)=>actor.control==="player").entityId;
  const npc=foundation.world.actors.find((actor)=>actor.control==="autonomous").entityId;
  if(progression){
    const current=await f.one(`select loop_state from rpg_private.world_foundations where campaign_id=$1`,[f.cid]);
    const state={...current.loop_state,progression:"on",tracks:[{id:"fieldcraft",version:1,
      label:"Fieldcraft",kind:"generic",thresholds:[5],choices:[]}],
      progress:[{entityId:hero,trackId:"fieldcraft",value:2,rank:0,unlocks:[]}],pending:[],
      version:current.loop_state.version+1};
    await f.one(`update rpg_private.world_foundations set loop_state=$2::jsonb,
      revision=revision+1 where campaign_id=$1`,[f.cid,JSON.stringify(state)]);
  }
  const config={profile:"console-basic-v1",controlledEntityIds:[hero],
    presentEntityIds:foundation.world.actors.map((actor)=>actor.entityId),
    nearbyStorageIds:[],safeLocationIds:[],itemRules:[]};
  const play=await f.runtime(f.cid,"play");
  await f.runtime(f.cid,"configure",{requestId:randomUUID(),campaignId:f.cid,
    expectedRevision:play.revision,configuration:config});
  const timeline=await f.fence(f.cid);
  const row=await f.one(`select r.revision runtime_revision,p.revision public_revision,
    w.revision world_revision,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
    t.head_manifest_id head_id,
    (select coalesce(max(sequence),0) from rpg_private.world_events
      where campaign_id=r.campaign_id) world_event_sequence
    from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
    join rpg_private.world_foundations w using(campaign_id)
    join rpg_private.timeline_campaigns c using(campaign_id)
    join rpg_private.timelines t on t.id=c.active_timeline_id
    where r.campaign_id=$1`,[f.cid]);
  await f.runtime(f.cid,"astra_takeover",{requestId:randomUUID(),campaignId:f.cid,
    timeline,expectedRuntimeRevision:row.runtime_revision,
    expectedWorldRevision:row.world_revision,
    expectedPublicRevision:row.public_revision,expectedHeadId:row.head_id,
    expectedWorldDigest:row.world_digest,
    expectedWorldEventSequence:row.world_event_sequence});
  const errors=[];
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {errors.push({action:args.p_action,message:error.message,where:error.where});
      return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try {return {data:await f.memory(args.p_campaign_id,args.p_action,
      args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  const turn=async(text,effects,narrate,forceCommitFailure=false,inspectContext=null,
    advanceMinutes=0)=>{
    const fence=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true);
    // Reconstruct the reviewed pre48 checkpoint contract only for the legacy
    // migration compatibility fixture; the live runtime never downgrades it.
    if (migrationLevel===47) {
      let pinnedSource;
      const claim=store.claim.bind(store);
      store.claim=async(...args)=>{const c=await claim(...args);pinnedSource=c?.source;return c;};
      const checkpoint=store.checkpoint.bind(store);
      store.checkpoint=async(lease,cp,status)=>{
        if(cp.astraEffects?.schemaVersion===2){
          cp.astraEffects=planAstraEffects(pinnedSource,input,effects,cp.astraPrimary.finalProposal.resolution.changes);
          const first=cp.astraEffects?.effects[0];
          cp.astraSettlement=first&&legacySettlementKind(first.kind)?first:null;
        }
        return checkpoint(lease,cp,status);
      };
    }
    const memory=createRpcMemoryStore(f.owner,memoryRpc,fence);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",input:text,
      companionId:null,listenerIds:[],mechanic:null};
    if (forceCommitFailure) store.commit=async()=>{throw Error("synthetic commit interruption");};
    const provider={next:async(ctx,_input,_receipts,_checks,_caps,source)=>{
      inspectContext?.(ctx);
      return {usage,output:{type:"final",call:null,final:{worldMinutes:source.runtime.worldMinutes+advanceMinutes,
        changes:[],outcomes:[],privatePatches:[],effects:typeof effects==="function"
          ?effects({input,source}):effects}}};
    },
    narrate:async(ctx)=>({usage,output:{narration:narrate(ctx),visualDescription:"",clarification:null}})};
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((source)=>({sourceId:source.id,
          version:source.ref.version}))}})}});
    return {input,result,store};
  };
  return {f,hero,npc,errors,turn};
}
