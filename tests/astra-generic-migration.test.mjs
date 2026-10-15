import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {randomUUID,createHash} from "node:crypto";
import {fixture} from "./phase35-storage-fixture.mjs";
import {genericFixture,final,npc,known,op,text,handle} from "./astra-generic-fixture.mjs";
import {createLabService} from "../src/lib/world-lab/service.ts";
import {createRpcTurnStore} from "../src/lib/gameplay/dm-store.ts";
import {runAstraTurn,resumeAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
const migration=await readFile(new URL("../supabase/migrations/202610140052_astra_generic_state.sql",import.meta.url),"utf8");
async function fingerprints(f){
 const tables=await f.query("select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like '%rpg_%' or schemaname='rpg_private' order by schemaname,tablename");
 const result={};for(const {schemaname,tablename} of tables){
  const rows=await f.query(`select to_jsonb(t)-'astra_state_contract' data from "${schemaname}"."${tablename}" t`);
  const strings=rows.map(v=>JSON.stringify(v.data)).sort();
  result[`${schemaname}.${tablename}`]=createHash("sha256").update(JSON.stringify(strings)).digest("hex");
 }return result;
}
test("clean disposable 1-52 chain: private pin and wrapper/predecessor ACL; no public schema addition",async()=>{
 const f=await fixture(52);try{
  const signature="public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)",old="public.rpg_runtime_before_astra_generic(uuid,uuid,text,jsonb,jsonb)";
  assert.equal((await f.one("select has_function_privilege('service_role',$1,'execute') ok",[signature])).ok,true);
  for(const role of ["anon","authenticated","service_role"])
   assert.equal((await f.one("select has_function_privilege($1,$2,'execute') ok",[role,old])).ok,false);
  assert.equal((await f.one("select has_function_privilege('anon','rpg_private.runtime_change(uuid,uuid,jsonb)','execute') ok")).ok,false);
  assert.equal((await f.one("select has_function_privilege('service_role','rpg_private.astra_generic_compile(rpg_private.turns,jsonb)','execute') ok")).ok,false);
  assert.equal((await f.one("select count(*)::int n from information_schema.columns where table_schema='public' and column_name='astra_state_contract'")).n,0);
 }finally{await f.db.close();}
});
test("populated 51-52 preserves all RPG data and immutable saves; old pending contract stays old after restore",async()=>{
 const s=await genericFixture(51),f=s.f;try{
  const rpc=async a=>{try{return{data:await f.runtime(a.p_campaign_id,a.p_action,a.p_payload,a.p_timeline)};}catch(e){return {error:{message:e.message,code:e.code}};}};
  const fence=await f.fence(f.cid),oldStore=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",fence,true,{astraResponseContract:"unified-v1"});
  const play=await oldStore.readPlay(f.cid),input={operationId:randomUUID(),campaignId:f.cid,timeline:fence,expectedRevision:play.revision,
   mode:"game",input:"I sit by the village well.",companionId:null,listenerIds:[],mechanic:null};
  await oldStore.begin(input,"astra-primary-v1","unified-v1");
  const save=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Pre-52 pending operation"}));
  const before=await fingerprints(f);
  await f.db.exec(migration);assert.deepEqual(await fingerprints(f),before);
  assert.equal((await f.one("select astra_state_contract from rpg_private.turns where id=$1",[input.operationId])).astra_state_contract,null);
  const loaded=await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.saveId,label:"Old pending",recovery:false}));
  const runtime=await f.runtime(f.cid,"claim",{operationId:input.operationId},loaded.snapshot.timeline);
  assert.equal(runtime.astraStateContract,null);assert.equal(runtime.runtimeIdentity,"astra-primary-v1");
  assert.equal(runtime.astraResponseContract,"unified-v1");assert.equal(runtime.source.astraStateContract,undefined);
 }finally{await f.db.close();}
});
test("generic begin pins literal input and identity atomically; replay cannot change either",async()=>{
 const s=await genericFixture();try{
  const {store}=await s.stores(),play=await store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,
   expectedRevision:play.revision,mode:"game",input:"I accept the offered work.",companionId:null,listenerIds:[],mechanic:null};
  await store.begin(input,"astra-primary-v1","unified-v1","generic-v1");
  const row=await s.f.one("select input,source,astra_state_contract from rpg_private.turns where id=$1",[input.operationId]);
  assert.equal(row.input.input,input.input);assert.equal(row.astra_state_contract,"generic-v1");assert.equal(row.source,null);
  await store.begin(input,"astra-primary-v1","unified-v1","generic-v1");
  await assert.rejects(store.begin({...input,input:"different"},"astra-primary-v1","unified-v1","generic-v1"));
  await assert.rejects(s.f.runtime(s.f.cid,"begin",{...input,serverRuntime:"astra-primary-v1",serverAstraContract:"unified-v1"}));
 }finally{await s.f.db.close();}
});
test("tampered final commit and stale source reject atomically; no provisional public actor",async()=>{
 const s=await genericFixture();try{
  const {store,memory}=await s.stores(),play=await store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,
   expectedRevision:play.revision,mode:"game",input:"I meet Hobb.",companionId:null,listenerIds:[],mechanic:null};
  const commit=store.commit;
  store.commit=(lease,packet)=>commit(lease,{...packet,resolution:{...packet.resolution,worldMinutes:packet.resolution.worldMinutes+1}});
  const result=await runAstraTurn(input,{store,memory,summaries:{summarize:()=>assert.fail("summary")},provider:{
   next:async(_ctx,_input,_r,_c,_caps,source)=>({usage:{model:"fake",inputTokens:0,outputTokens:0,calls:0,latencyMs:0},output:final(source,[npc("miller","Hobb")])}),
   narrate:()=>assert.fail("narrator")}});
  assert.equal(result.status,"failed");assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[s.f.cid])).n,0);
  assert.equal((await s.f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[s.f.cid])).world_minutes,0);
  await assert.rejects(commit({campaignId:s.f.cid,operationId:input.operationId,token:randomUUID(),expectedRevision:play.revision-1,timeline:play.timeline},{}));
 }finally{await s.f.db.close();}
});
test("lost commit response replays existing result without duplicate actor or provider work",async()=>{
 const s=await genericFixture();try{
  const original=await s.stores(),play=await original.store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,
   expectedRevision:play.revision,mode:"game",input:"I meet Hobb.",companionId:null,listenerIds:[],mechanic:null};let calls=0;
  const commit=original.store.commit;original.store.commit=async(...args)=>{await commit(...args);throw Error("synthetic lost response");};
  const deps={...original,summaries:{summarize:()=>assert.fail("summary")},provider:{next:async(_ctx,_input,_r,_c,_caps,source)=>{
   calls++;return {usage:{model:"fake",inputTokens:0,outputTokens:0,calls:0,latencyMs:0},output:final(source,[npc("miller","Hobb")])};},narrate:()=>assert.fail("narrator")}};
  await assert.rejects(runAstraTurn(input,deps));original.store.commit=commit;
  assert.equal((await runAstraTurn(input,deps)).status,"committed");assert.equal(calls,1);
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});
test("generic pending tool prefix survives manual save/fork/load with exact receipts and no reroll",async()=>{
 const s=await genericFixture();try{
  const interrupted=await s.turn("I check the unstable floor.",(_ctx,_input,receipts)=>{
   if(!receipts.length)return {type:"tool",final:null,toolRequest:{operations:[],call:{kind:"skill",actor:known("hero"),target:null,item:null,dc:10,scope:null}}};
   throw Error("synthetic provider interruption after recorded check");
  });
  assert.equal(interrupted.result.status,"failed");assert.equal(interrupted.result.canRetry,true);
  const receipt=(await s.f.one("select checkpoint#>'{astraPrimary,toolReceipts}' receipts from rpg_private.turns where id=$1",[interrupted.input.operationId])).receipts;
  const save=await s.f.saves(s.f.cid,"create",await s.f.command(s.f.cid,{kind:"manual",name:"Pending generic check"}));
  const loaded=await s.f.saves(s.f.cid,"load",await s.f.command(s.f.cid,{saveId:save.saveId,label:"Resume generic check",recovery:false}));
  const stores=await s.stores();let calls=0;
  const deps={...stores,summaries:{summarize:()=>assert.fail("summary")},random:()=>assert.fail("rerolled stored receipt"),provider:{next:async(_ctx,_input,receipts,_checks,_caps,source)=>{
   calls++;assert.deepEqual(receipts,receipt);return {usage:{model:"fake",calls:0,inputTokens:0,outputTokens:0,latencyMs:0},output:final(source,[],"The floor holds.")};},narrate:()=>assert.fail("narrator")}};
  const result=await resumeAstraTurn({commandId:randomUUID(),campaignId:s.f.cid,operationId:interrupted.input.operationId,timeline:loaded.snapshot.timeline,
   action:"retry",checkId:null},deps);
  assert.equal(result.status,"committed",JSON.stringify(s.errors));assert.equal(calls,1);
  assert.equal((await s.f.one("select astra_state_contract from rpg_private.turns where id=$1",[interrupted.input.operationId])).astra_state_contract,"generic-v1");
 }finally{await s.f.db.close();}
});

test("generic Location travel and new actor project coherently into detached World Lab; saved history stays immutable",async()=>{
 const s=await genericFixture(),f=s.f;try{
  const frozen=(await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world;
  const turn=await s.turn("Hobb and I walk to the riverside mill.",(_c,_i,_r,_k,_a,source)=>final(source,[
   op("walk","time.advance",{minutes:10,basis:null},"travel"),
   op("mill","location.upsert",{target:null,name:text("Riverside Mill"),description:text("A mundane mill by the river."),status:"visited",makeCurrent:true},"travel"),
   npc("miller","Hobb","travel")],"You reach the mill after ten minutes."));
  assert.equal(turn.result.status,"committed",JSON.stringify(s.errors));
  const location=(await f.one("select id from public.rpg_locations where campaign_id=$1 and name='Riverside Mill'",[f.cid])).id;
  assert.equal((await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",[f.cid])).current_location_id,location);
  assert.deepEqual((await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world,frozen);
  const save=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"At the new mill"}));
  const saved=await f.one("select manifest_id from rpg_private.save_points where id=$1",[save.saveId]);
  const manifest=await f.one("select to_jsonb(m) data from rpg_private.timeline_manifests m where id=$1",[saved.manifest_id]);
  const projected=(await f.one("select rpg_private.lab_rows($1,$2,'rpg_private.world_foundations') rows",[f.cid,saved.manifest_id])).rows[0];
  assert.equal(projected.world.actors.find(a=>a.entityId===s.hero).locationId,location);
  assert.equal(projected.world.actors.find(a=>a.publicName==="Hobb").locationId,location);
  const approval={ownerId:f.owner,reviewedConflictIds:[],reviewedUnknownIds:[]};
  const record=(kind,body)=>({schemaVersion:1,ownerId:f.owner,kind,id:randomUUID(),versionId:randomUUID(),version:1,previousVersionId:null,body});
  const scenario=record("scenario",{schemaVersion:1,title:"Observe mill",status:"approved",packVersionIds:[],sourceVersionIds:[],sourcePriority:[],
   entry:{label:"At the mill",worldMinutes:10,evidence:[]},adaptation:"original",identities:[],assumptions:[{id:randomUUID(),text:"Observe a quiet hour.",visibility:"public"}],carriedClaimIds:[],localHistory:null,unresolvedConflictIds:[],approval});
  const divergence=record("divergence",{schemaVersion:1,scenarioVersionId:scenario.versionId,title:"Quiet hour",changes:[{id:randomUUID(),text:"Time passes.",visibility:"public"}],approval});
  for(const item of [scenario,divergence])await f.one("select public.rpg_library($1,null,'put',$2::jsonb,null) result",[f.owner,JSON.stringify({operationId:randomUUID(),record:item})]);
  const lab=createLabService(f.owner,async a=>{try{return {data:(await f.one("select public.rpg_world_lab($1,$2,$3,$4::jsonb) result",[a.p_owner_id,a.p_campaign_id,a.p_action,JSON.stringify(a.p_payload)])).result};}catch(e){return {error:{message:e.message,code:e.code}};}},"en",{resolver:()=>({simulate:()=>assert.fail("no model needed")})});
  let run=await lab.perform({action:"prepare",input:{operationId:randomUUID(),campaignId:f.cid,saveId:save.saveId,scenarioVersionId:scenario.versionId,divergenceVersionId:divergence.versionId,label:"Detached mill",horizonMinutes:60}});
  for(let i=0;i<4 && run.status!=="completed";i++)run=await lab.perform({action:"continue",input:{operationId:randomUUID(),campaignId:f.cid,runId:run.id,expectedRevision:run.revision}});
  assert.equal(run.status,"completed",JSON.stringify(run));
  assert.deepEqual((await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world,frozen);
  assert.deepEqual(await f.one("select to_jsonb(m) data from rpg_private.timeline_manifests m where id=$1",[saved.manifest_id]),manifest);
  await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.saveId,label:"Return to saved mill",recovery:false}));
  const back=await s.turn("Hobb, I remember the mill.",(_c,input,_r,_k,_a,source)=>{assert.ok(handle(source,input,"entities","Hobb"));return final(source,[],"Hobb nods.");});
  assert.equal(back.result.status,"committed",JSON.stringify(s.errors));
 }finally{await f.db.close();}
});

test("generic pinned final survives save/load and commits without planning again",async()=>{
 const s=await genericFixture();try{
  const stores=await s.stores(),play=await stores.store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,expectedRevision:play.revision,mode:"game",input:"I meet Hobb.",companionId:null,listenerIds:[],mechanic:null};
  stores.store.commit=async()=>{throw Error("synthetic precommit failure");};
  const deps={...stores,summaries:{summarize:()=>assert.fail("summary")},provider:{next:async(_c,_i,_r,_k,_a,source)=>({usage:{model:"fake",calls:0,inputTokens:0,outputTokens:0,latencyMs:0},output:final(source,[npc("miller","Hobb")])}),narrate:()=>assert.fail("narrator")}};
  assert.equal((await runAstraTurn(input,deps)).status,"failed");
  const saved=await s.f.saves(s.f.cid,"create",await s.f.command(s.f.cid,{kind:"manual",name:"Pinned generic final"}));
  await s.f.saves(s.f.cid,"load",await s.f.command(s.f.cid,{saveId:saved.saveId,label:"Pinned final fork",recovery:false}));
  const current=await s.stores(),retry=await resumeAstraTurn({commandId:randomUUID(),campaignId:s.f.cid,operationId:input.operationId,timeline:await s.f.fence(s.f.cid),action:"retry",checkId:null},{...deps,...current,provider:{next:()=>assert.fail("replanned final"),narrate:()=>assert.fail("repeated narration")}});
  assert.equal(retry.status,"committed",JSON.stringify(s.errors));
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});
