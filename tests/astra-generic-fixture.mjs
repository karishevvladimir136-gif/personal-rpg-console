import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {setup,examples} from "./universal-bootstrap-fixture.mjs";
import {createRpcTurnStore} from "../src/lib/gameplay/dm-store.ts";
import {createRpcMemoryStore} from "../src/lib/memory/store.ts";
import {runAstraTurn,resumeAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
import {genericManifest} from "../src/lib/gameplay/astra-generic-contract.ts";
export const text=value=>({source:"inline",text:value});
export const local=key=>({source:"local",key});
export const known=key=>({source:"known",key});
export const op=(opId,kind,fields,atomicGroup=null,requiresOperations=[])=>({opId,kind,atomicGroup,requiresOperations,...fields});
export const silver={existing:null,publicName:text("silver")};
export const npc=(opId,name,group=null)=>op(opId,"entity.upsert",{target:null,name:text(name),description:text(`An ordinary local named ${name}.`),profile:null,present:true},group);
export function handle(source,input,family,name){
 const row=source.snapshot[family].find(v=>(v.name??v.title)===name);assert.ok(row,`known ${family} ${name}`);
 return known(Object.entries(genericManifest(source,input).records).find(([,v])=>v.id===row.id)[0]);
}
export const narration=(body="The scene continues.",dependent=[])=>({beats:[{text:body,requiresOperations:[]},...dependent],
 visualDescription:null,sceneLocale:{label:"Village Mill",requiresOperations:[]}});
export const usage={model:"fake-astra",inputTokens:0,outputTokens:0,calls:0,latencyMs:0};
export function final(source,operations=[],body="The scene continues.",dependent=[]){return {type:"final",toolRequest:null,
 final:{genericOperations:operations,publicNarration:source.astraResponseMode==="private-informed"?null:narration(body,dependent),privatePatches:[],publicBehavior:[]}};}

/** Only setup is authored. No NPC/stock/wallet or acceptance receipt is seeded. */
export async function genericFixture(level=52,options={}){
 const f=await setup({...examples.fantasy,name:"Ari",npc:"Unused",location:"Village",situation:"A public lead mentions a miller.",
  narration:"Ari stands in the village. A public lead mentions a miller."},"en",level);
 try{
  f.opening.actors=[];await f.create();await f.startOpening();
  const hero=f.hero;
  await f.one("update public.rpg_entities set hp=10,max_hp=10,stats='{\"attack\":1,\"defense\":11,\"skill\":2,\"save\":2}'::jsonb,resources='{\"currency_silver\":5,\"focus\":2}'::jsonb where id=$1",[hero]);
  const settings=await f.one("select values,revision from public.rpg_settings where campaign_id=$1",[f.cid]);
  settings.values.interactiveDice=!!options.interactive;settings.values.difficulty.rerolls=options.interactive?"unlimited":"disabled";
  settings.values.difficulty.longRestSupplyCost=1;
  await f.mutation("settings.save",f.cid,settings.values,settings.revision);
  if(options.supplies){const pack=await f.one("select id from public.rpg_storages where campaign_id=$1 and entity_id=$2",[f.cid,hero]);
   await f.mutation("item.save",f.cid,{name:"Travel provisions",category:"food",description:"Ordinary food for meals and rest.",quantity:options.supplies,
    mechanics:"",owner_entity_id:hero,storage_id:pack.id,equipped_entity_id:null,equipped_slot:null});}
  const play=await f.runtime(f.cid,"play");
  await f.runtime(f.cid,"configure",{requestId:randomUUID(),campaignId:f.cid,expectedRevision:play.revision,
   configuration:{profile:"console-basic-v1",controlledEntityIds:[hero],presentEntityIds:[hero],nearbyStorageIds:[],safeLocationIds:[],itemRules:[]}});
  const fence=await f.fence(f.cid);
  const pin=await f.one(`select r.revision rr,p.revision pr,w.revision wr,encode(sha256(convert_to(w.world::text,'UTF8')),'hex') digest,
   t.head_manifest_id head,(select coalesce(max(sequence),0) from rpg_private.world_events where campaign_id=r.campaign_id) seq
   from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id) join rpg_private.world_foundations w using(campaign_id)
   join rpg_private.timeline_campaigns c using(campaign_id) join rpg_private.timelines t on t.id=c.active_timeline_id where r.campaign_id=$1`,[f.cid]);
  await f.runtime(f.cid,"astra_takeover",{requestId:randomUUID(),campaignId:f.cid,timeline:fence,
   expectedRuntimeRevision:pin.rr,expectedPublicRevision:pin.pr,expectedWorldRevision:pin.wr,expectedWorldDigest:pin.digest,
   expectedHeadId:pin.head,expectedWorldEventSequence:pin.seq});
  const errors=[],captures=[];
  const rpc=async args=>{try{return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
   catch(e){errors.push({action:args.p_action,message:e.message,code:e.code,where:e.where});
    if(args.p_action==="checkpoint")captures.push(args.p_payload);
    return {error:{message:e.message,code:e.code}};}};
  const stores=async()=>{const timeline=await f.fence(f.cid);
   return {store:createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true,{astraResponseContract:"unified-v1",astraStateContract:"generic-v1"}),
    memory:createRpcMemoryStore(f.owner,async args=>{try{return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
     catch(e){return {error:{message:e.message,code:e.code}};}},timeline)};};
  const turn=async(inputText,decision,options={})=>{
   const {store,memory}=await stores(),play=await store.readPlay(f.cid);
   const input={campaignId:f.cid,operationId:options.operationId??randomUUID(),expectedRevision:play.revision,timeline:play.timeline,
    input:inputText,mode:"game",companionId:null,listenerIds:[],mechanic:null};let calls=0,narrators=0;
   const deps={store,memory,summaries:{summarize:()=>assert.fail("foreground Memory call")},random:options.random??(()=>18),
    provider:{next:async(...args)=>{calls++;return {usage,output:await decision(...args)};},
     narrate:async(ctx)=>{narrators++;options.narratorCheck?.(ctx);return {usage,output:{narration:options.privateNarration??"The miller hears your answer.",visualDescription:"",clarification:null,...(options.privateSceneLocale?{sceneLocale:options.privateSceneLocale}:{})}};}}};
   const result=await runAstraTurn(input,deps);return {input,result,deps,calls,narrators};
  };
  return {f,hero,errors,captures,turn,stores,resumeAstraTurn};
 }catch(e){await f.db.close();throw e;}
}
