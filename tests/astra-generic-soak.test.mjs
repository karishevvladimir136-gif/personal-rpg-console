import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {runAstraTurn,resumeAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
import {maintainAstraMemoryAfterCommit} from "../src/lib/memory/lifecycle.ts";
import {genericFixture,text,known,local,op,silver,npc,final,handle,usage} from "./astra-generic-fixture.mjs";

test("sixteen-case matrix then 200 committed production turns: Memory races, scope, groups, dice, saves and replay",async()=>{
 const s=await genericFixture(52,{supplies:30}),other=await genericFixture();let turns=0,summaryCalls=0,plans=0,narrators=0,races=0;
 const {f,hero}=s,operations=new Set(),privateCanary="SYNTHETIC_HOBB_PRIVATE_REFUSAL_REASON",foreignCanary="SYNTHETIC_OTHER_CAMPAIGN_ONLY";
 const summary={summarize:async job=>{summaryCalls++;return {usage,output:{schemaVersion:1,selections:job.sources.map(v=>({sourceId:v.id,version:v.ref.version}))}};}};
 const must=async(input,decision,options={})=>{
  const result=await s.turn(input,(ctx,...args)=>{assert.ok(!ctx.input.includes(foreignCanary));return decision(ctx,...args);},
   {...options,narratorCheck:ctx=>{assert.ok(!ctx.input.includes(privateCanary));assert.ok(!ctx.input.includes(foreignCanary));options.narratorCheck?.(ctx);}});
  assert.equal(result.result.status,"committed",`turn ${turns+1}: ${JSON.stringify(s.errors)}`);operations.add(result.input.operationId);turns++;plans+=result.calls;narrators+=result.narrators;return result;
 };
 const ordinary=(body,operations=[])=>((_c,_i,_r,_k,_a,source)=>final(source,operations,body));
 const currency=async name=>(await f.one("select resources from public.rpg_entities where campaign_id=$1 and name=$2",[f.cid,name])).resources.currency_silver;
 try{
  const frozen=(await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world;
  const origin=(await f.one("select current_location_id id from public.rpg_public_state where campaign_id=$1",[f.cid])).id;
  // 1–2: unrecorded places/people require no promotion ceremony.
  await must("I look for the mill.",ordinary("At the Village Mill, Hobb offers two silver for packing crates."));
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1",[f.cid])).n,1);
  assert.equal((await f.one("select count(*)::int n from public.rpg_quests where campaign_id=$1",[f.cid])).n,0);
  await must("Hobb, tell me about the work.",(ctx,_i,_r,_k,_a,source)=>{assert.ok(ctx.input.includes("Hobb offers two silver"));return final(source,[],"Hobb explains the crates need packing.");});
  // 3–4: recurring identity, actual acceptance and stored terms.
  await must("I introduce myself to Hobb.",ordinary("Hobb remembers your name.",[npc("miller","Hobb")]));
  await must("I accept the crate job for two silver.",(_c,input,_r,_k,_a,source)=>final(source,[op("job","quest.mutate",{mutation:{action:"create",title:text("Pack crates"),description:text("Pack Hobb's crates for two silver."),issuer:handle(source,input,"entities","Hobb"),reward:{currency:silver,amount:2,item:null},basis:null}})],"Hobb accepts the agreement."));
  assert.equal((await f.one("select status from public.rpg_quests where campaign_id=$1",[f.cid])).status,"open");
  // 5: earn once, then unseeded baker/stock and real reciprocal payment.
  const payment=await must("I finish, collect my pay, then buy bread from the baker for two silver.",(_c,input,_r,_k,_a,source)=>{
   const job=handle(source,input,"quests","Pack crates");return final(source,[
    op("complete","quest.mutate",{mutation:{action:"status",target:job,status:"complete",outcome:null,basis:null}},"reward"),
    op("claim","quest.mutate",{mutation:{action:"claim",target:job,basis:null}},"reward"),npc("baker","Bessa","buy"),
    op("bread","item.mutate",{mutation:{action:"create",name:text("Bread"),description:null,category:"food",quantity:1,owner:local("baker"),storage:null,basis:null}},"buy"),
    op("pay","resource.adjust",{mutation:{action:"transfer",from:known("hero"),to:local("baker"),currency:silver,amount:2,basis:null}},"buy"),
    op("receive","item.mutate",{mutation:{action:"transfer",target:local("bread"),quantity:1,recipient:known("hero"),storage:null,basis:null}},"buy")],"Hobb thanks you; Bessa wraps the loaf.");});
  assert.equal(await currency("Ari"),5);assert.equal(await currency("Bessa"),2);
  assert.equal((await f.one("select owner_entity_id from public.rpg_items where campaign_id=$1 and name='Bread'",[f.cid])).owner_entity_id,hero);
  // 6–7: real transfer and mundane pickup, no invented weapon power.
  await must("I give Hobb the loaf.",(_c,input,_r,_k,_a,source)=>final(source,[op("gift","item.mutate",{mutation:{action:"transfer",target:handle(source,input,"items","Bread"),quantity:1,recipient:handle(source,input,"entities","Hobb"),storage:null,basis:null}})],"Hobb accepts the bread."));
  const hobb=(await f.one("select id from public.rpg_entities where campaign_id=$1 and name='Hobb'",[f.cid])).id;
  assert.equal((await f.one("select owner_entity_id from public.rpg_items where campaign_id=$1 and name='Bread'",[f.cid])).owner_entity_id,hobb);
  await must("I pick up an ordinary stick.",ordinary("You pick it up.",[op("stick","item.mutate",{mutation:{action:"create",name:text("Ordinary stick"),description:null,category:"misc",quantity:1,owner:known("hero"),storage:null,basis:null}})]));
  assert.equal((await f.one("select mechanics from public.rpg_items where campaign_id=$1 and name='Ordinary stick'",[f.cid])).mechanics,"");
  // 8–9: provisional profile-backed combatant; deterministic production tools.
  const rat=npc("rat","Cellar rat");rat.profile="actor-profile:hero";
  const fighting=(newRat,enemy)=>(_ctx,input,receipts,_checks,_caps,source)=>{
   const prefix=newRat?[rat]:[],actor=enemy?handle(source,input,"entities","Cellar rat"):known("hero"),target=enemy?known("hero"):newRat?local("rat"):handle(source,input,"entities","Cellar rat");
   if(receipts.length<2)return {type:"tool",final:null,toolRequest:{operations:prefix,call:{kind:receipts.length?"damage":"attack",actor,target,item:null,dc:null,scope:null}}};
   return final(source,[...prefix,op("damage","resource.adjust",{mutation:{action:"delta",actor:target,resource:{kind:"hp"},amount:-2,payer:null,basis:{source:"tool",key:"tool-1"}}})],"The clash ends.");};
  await must("I attack the cellar rat.",fighting(true,false),{random:(_min,max)=>max-1});
  await must("The rat attacks me.",fighting(false,true),{random:(_min,max)=>max-1});
  assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[hero])).hp,8);
  // 10–12: existing formal rest, callback, save/load and known identity.
  await must("I rest safely in the loft for the night.",ordinary("Morning light reaches the loft.",[op("rest","time.advance",{minutes:null,basis:{source:"rule",key:"long-rest"}},"rest")]));
  assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[hero])).hp,10);
  assert.equal((await f.one("select quantity from public.rpg_items where campaign_id=$1 and name='Travel provisions'",[f.cid])).quantity,29);
  await must("Hobb, remember the crates and Bessa's loaf?",(ctx,_i,_r,_k,_a,source)=>{assert.ok(ctx.input.includes("Hobb"));return final(source,[],"Hobb remembers the loaf and the completed work.");});
  let save=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"Matrix save"}));
  await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.saveId,label:"Matrix fork",recovery:false}));
  await must("I return to the same miller.",ordinary("Hobb greets you again."));
  // 13: replay original in current fence; separate claim also cannot pay again.
  const replayStores=await s.stores(),replayInput={...payment.input,timeline:await f.fence(f.cid)};
  assert.equal((await runAstraTurn(replayInput,{...payment.deps,...replayStores,provider:{next:()=>assert.fail("paid replay"),narrate:()=>assert.fail("replay narrator")}})).status,"committed");
  await must("I ask for the crate reward again.",(_c,input,_r,_k,_a,source)=>{
   const d=final(source,[op("duplicate","quest.mutate",{mutation:{action:"claim",target:handle(source,input,"quests","Pack crates"),basis:null}})],"Hobb recalls that he paid you.");
   d.final.privatePatches=[{kind:"fact",key:"hobb_reason",operation:"set",value:privateCanary,amount:null}];return d;});
  assert.equal(await currency("Ari"),5);
  // 14: refusal chosen privately, only enum bridge + safe public generation.
  await must("Hobb, will you lend me more?",(_ctx,input,_r,_k,_a,source)=>{
   assert.equal(source.astraResponseMode,"private-informed");const d=final(source);
   d.final.publicBehavior=[{actor:handle(source,input,"entities","Hobb"),stance:"refuse",tone:"firm",intensity:1}];return d;
  },{privateNarration:"Hobb shakes his head. 'I cannot lend more today.'",narratorCheck:ctx=>{assert.ok(ctx.input.includes('"refuse"'));assert.ok(!ctx.input.includes("hobb_reason"));}});
  // 15: different campaign, Memory and foreign persistence reference isolation.
  assert.equal((await other.turn("I mark my own scene.",ordinary(foreignCanary))).result.status,"committed");
  await must("I look around my own village.",ordinary("Your own village remains quiet.",[op("foreign","entity.upsert",{target:known(other.hero),name:text("Wrong"),description:null,profile:null,present:true})]));
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Wrong'",[f.cid])).n,0);
  // 16: free fiction remains ordinary, even with no dedicated effect kind.
  await must("I balance the stick on my nose and greet the sunrise.",ordinary("The stick wobbles as Hobb laughs."));
  const snapshots=[];
  while(turns<200){
   const n=turns+1;
   if(n%20===0){
    save=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:`Soak ${n}`}));
    await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.saveId,label:`Soak fork ${n}`,recovery:false}));
   }
   if(n%25===0){
    const stores=await s.stores();const before=await stores.memory.context(f.cid,[],true);
    const result=await maintainAstraMemoryAfterCommit(f.cid,stores.memory,summary,await f.fence(f.cid));
    assert.equal(result.failed,false);if(result.scheduled)races++;
    assert.equal(before.campaignId,f.cid);
   }
   const turn=await must(`Hobb, I wait one minute and recall our completed work. ${n}`,async(ctx,_input,receipts,_checks,_caps,source)=>{
    if(n%37===0 && !receipts.length){
     const stores=await s.stores();await maintainAstraMemoryAfterCommit(f.cid,stores.memory,summary,await f.fence(f.cid));races++;
     snapshots.push(ctx.input);return {type:"tool",final:null,toolRequest:{operations:[],call:{kind:"query",actor:null,target:null,item:null,dc:null,scope:"current-public"}}};
    }
    if(n%37===0){assert.equal(source.historyComplete,true);assert.ok(ctx.input.includes("Hobb"));}
    const invalid=n%10===0?[op("pay-invalid","resource.adjust",{mutation:{action:"transfer",from:known("hero"),to:handle(source,_input,"entities","Hobb"),currency:{existing:"currency_silver",publicName:null},amount:20,basis:null}},"bad-purchase"),
     op("bad-item","item.mutate",{mutation:{action:"create",name:text("Unpaid loaf"),description:null,category:"food",quantity:1,owner:known("hero"),storage:null,basis:null}},"bad-purchase")]:[];
    return final(source,[op("minute","time.advance",{minutes:1,basis:null}),...invalid],"The minute passes quietly; Hobb still remembers the work.");
   });
   if(n%29===0){const stores=await s.stores();assert.equal((await runAstraTurn(turn.input,{...turn.deps,...stores,provider:{next:()=>assert.fail("duplicate provider"),narrate:()=>assert.fail("duplicate narrator")}})).status,"committed");}
   if(n%41===0){
    // A transport failure before any tool can be explicitly retried with the
    // same durable input; it grants nothing before the committed final.
    const failed=await s.turn("I quietly prepare to continue.",()=>{throw Error("synthetic provider loss");});assert.equal(failed.result.status,"failed");
    const stores=await s.stores();failed.deps.provider.next=async(_c,_i,_r,_k,_a,source)=>({usage,output:final(source)});
    const retry=await resumeAstraTurn({commandId:randomUUID(),campaignId:f.cid,operationId:failed.input.operationId,timeline:await f.fence(f.cid),action:"retry",checkId:null},{...failed.deps,...stores});
    assert.equal(retry.status,"committed",JSON.stringify(s.errors));operations.add(failed.input.operationId);turns++;
   }
  }
  assert.equal(turns,200);assert.ok(summaryCalls>0);assert.ok(races>0);assert.ok(snapshots.length>0);
  const extraRetries=4; // n=41,82,123,164; each contributes a committed zero-time turn.
  const minutes=480+(200-16-extraRetries);
  assert.equal((await f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[f.cid])).world_minutes,minutes);
  assert.equal((await f.one("select current_location_id id from public.rpg_public_state where campaign_id=$1",[f.cid])).id,origin);
  assert.equal(await currency("Ari"),5);assert.equal(await currency("Bessa"),2);
  assert.equal((await f.one("select hp from public.rpg_entities where campaign_id=$1 and name='Cellar rat'",[f.cid])).hp,8);
  assert.equal((await f.one("select hp from public.rpg_entities where id=$1",[hero])).hp,10);
  const committed=await f.query("select id,input,status from rpg_private.turns where campaign_id=$1 and status='committed' and input->>'mode'='game'",[f.cid]);
  assert.equal(committed.length,200,JSON.stringify(committed.filter(v=>!operations.has(v.id))));assert.equal(operations.size,200);
  assert.equal((await f.one("select count(*)::int n from public.rpg_items where campaign_id=$1 and name='Unpaid loaf'",[f.cid])).n,0);
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[f.cid])).n,1);
  assert.deepEqual((await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world,frozen);
  console.log(JSON.stringify({genericSoak:{committed:turns,matrixCases:16,plannerResponses:plans,narratorResponses:narrators,summaryCalls,memoryRaces:races,worldMinutes:minutes,heroSilver:5,bakerSilver:2,heroHp:10,ratHp:8,provisions:29,realProviderCalls:0}}));
 }finally{await f.db.close();await other.f.db.close();}
});
