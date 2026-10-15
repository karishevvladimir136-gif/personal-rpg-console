import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID} from "node:crypto";
import {runAstraTurn,resumeAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
import {genericManifest} from "../src/lib/gameplay/astra-generic-contract.ts";
import {astraPlanProviderInput} from "../src/lib/gameplay/astra-plan-context.ts";
import {genericFixture,text,known,local,op,silver,npc,final,handle} from "./astra-generic-fixture.mjs";
const committed=(result,s)=>assert.equal(result.result.status,"committed",JSON.stringify(s.errors));
const coin=async(s,name="Ari")=>(await s.f.one("select resources from public.rpg_entities where campaign_id=$1 and name=$2",[s.f.cid,name])).resources.currency_silver;
async function createIssuer(s,reward=2){
 const result=await s.turn("I accept Hobb's offer of two silver for the crates.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[npc("miller","Hobb","accept"),
  op("job","quest.mutate",{mutation:{action:"create",title:text("Crate work"),description:text("Pack the crates."),issuer:local("miller"),reward:{currency:silver,amount:reward,item:null},basis:null}},"accept")]));
 committed(result,s);
}
test("generic Quest claim distinguishes untracked, funded, insufficient and explicitly empty real payer",async()=>{
 for(const balance of [undefined,3,1,0]){
  const s=await genericFixture();try{
   await createIssuer(s);
   if(balance!==undefined){
    const amount=balance===0?1:balance;
    committed(await s.turn("I give Hobb the agreed silver.",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("fund","resource.adjust",{mutation:{
     action:"transfer",from:known("hero"),to:handle(source,input,"entities","Hobb"),currency:silver,amount,basis:null}})])),s);
    if(balance===0)committed(await s.turn("Hobb gives the one silver back.",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("return","resource.adjust",{mutation:{action:"delta",
     actor:known("hero"),resource:{kind:"currency",currency:silver},amount:1,payer:handle(source,input,"entities","Hobb"),basis:null}})])),s);
   }
   committed(await s.turn("I finish the crate work.",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("complete","quest.mutate",{mutation:{action:"status",
    target:handle(source,input,"quests","Crate work"),status:"complete",outcome:null,basis:null}})])),s);
   const before=await coin(s);
   committed(await s.turn("Please pay the agreed two silver.",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("claim","quest.mutate",{mutation:{action:"claim",
    target:handle(source,input,"quests","Crate work"),basis:null}})])),s);
   const paid=balance===undefined||balance===3;
   assert.equal(await coin(s),before+(paid?2:0));
   const job=await s.f.one("select reward_operation_id from public.rpg_quests where campaign_id=$1",[s.f.cid]);assert.equal(job.reward_operation_id!==null,paid);
   if(balance!==undefined)assert.equal(await coin(s,"Hobb"),paid?balance-2:balance);
  }finally{await s.f.db.close();}
 }
});

test("private-informed acceptance uses current input and already-public offer text; narrator receives no secret or private prefix",async()=>{
 const s=await genericFixture(),secret="SYNTHETIC_HOBB_HIDDEN_REASON_CANARY";
 try{
  committed(await s.turn("I ask the miller about work.",(_ctx,_input,_r,_c,_caps,source)=>{
   const decision=final(source,[],"Hobb offers two silver for packing crates.");
   decision.final.privatePatches=[{kind:"fact",key:"hobb_secret",operation:"set",value:secret,amount:null}];return decision;
  }),s);
  let mode;
  const accepted=await s.turn("I accept Hobb's work offer.",(ctx,input,_r,_c,_caps,source)=>{
   mode=source.astraResponseMode;assert.equal(mode,"private-informed");assert.ok(ctx.input.includes(secret));
   const manifest=genericManifest(source,input),evidence=Object.entries(manifest.evidence).find(([,v])=>v.includes("Hobb offers two silver"))[0];
   const quote=v=>({source:"public-evidence",evidence,text:v});
   const actor=npc("miller","Hobb","agree");actor.name=quote("Hobb");actor.description=quote("Hobb offers two silver for packing crates.");
   return final(source,[actor,op("job","quest.mutate",{mutation:{action:"create",title:quote("packing crates"),description:quote("Hobb offers two silver for packing crates."),
    issuer:local("miller"),reward:{currency:{existing:null,publicName:quote("silver")},amount:2,item:null},basis:{source:"public-evidence",key:"input/current"}}},"agree")]);
  },{narratorCheck:ctx=>{assert.ok(!ctx.input.includes(secret));assert.ok(!ctx.input.includes("hobb_secret"));
    assert.ok(!ctx.input.includes("pinnedPrefix"));assert.ok(!ctx.input.includes("privatePatches"));}});
  committed(accepted,s);assert.equal(accepted.calls,1);assert.equal(accepted.narrators,1);
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_quests where campaign_id=$1",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});

test("new private-informed inline record text remains unsupported without preventing independent public narration",async()=>{
 const s=await genericFixture();try{
  committed(await s.turn("I consider the miller.",(_ctx,_input,_r,_c,_caps,source)=>{
   const value=final(source,[],"The miller waits.");value.final.privatePatches=[{kind:"fact",key:"miller_secret",operation:"set",value:"SYNTHETIC_MILLER_PRIVATE_REASON",amount:null}];return value;}),s);
  const result=await s.turn("I ask the miller again.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[npc("miller","New secret-derived name")]),
   {narratorCheck:ctx=>assert.ok(!ctx.input.includes("New secret-derived name"))});
  committed(result,s);assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});

test("generic tool prefix, server dice, real HP damage and configured rest use production authority",async()=>{
 const s=await genericFixture();try{
  const rat=npc("rat","Cellar rat");rat.profile="actor-profile:hero";
  let responses=0;
  const attack=await s.turn("I attack the cellar rat.",(ctx,_input,receipts,_checks,_caps,source)=>{
   responses++;if(receipts.length){assert.ok(ctx.input.includes('"pinnedPrefix"'));assert.ok(ctx.input.includes('"rat"'));}
   if(receipts.length<2)return {type:"tool",final:null,toolRequest:{operations:[rat],call:{kind:receipts.length?"damage":"attack",
    actor:known("hero"),target:local("rat"),item:null,dc:null,scope:null}}};
   return final(source,[rat,op("hurt-rat","resource.adjust",{mutation:{action:"delta",actor:local("rat"),resource:{kind:"hp"},amount:-2,payer:null,
    basis:{source:"tool",key:"tool-1"}}})],"The rat scrambles beside the grain.",[{text:"Your blow wounds it.",requiresOperations:["hurt-rat"]}]);
  },{random:(_min,max)=>max-1});
  committed(attack,s);assert.equal(responses,3);assert.equal((await s.f.one("select hp from public.rpg_entities where campaign_id=$1 and name='Cellar rat'",[s.f.cid])).hp,8);
  const enemy=await s.turn("The rat attacks me.",(_ctx,input,receipts,_checks,_caps,source)=>{
   if(receipts.length<2)return {type:"tool",final:null,toolRequest:{operations:[],call:{kind:receipts.length?"damage":"attack",
    actor:handle(source,input,"entities","Cellar rat"),target:known("hero"),item:null,dc:null,scope:null}}};
   return final(source,[op("hurt-hero","resource.adjust",{mutation:{action:"delta",actor:known("hero"),resource:{kind:"hp"},amount:-2,payer:null,basis:{source:"tool",key:"tool-1"}}})]);
  },{random:(_min,max)=>max-1});
  committed(enemy,s);assert.equal((await s.f.one("select hp from public.rpg_entities where id=$1",[s.hero])).hp,8);
  committed(await s.turn("I pack ordinary meal provisions.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[op("food","item.mutate",{mutation:{action:"create",name:text("Meal provisions"),description:text("Ordinary food for rest."),
    category:"food",quantity:3,owner:known("hero"),storage:null,basis:null}})])),s);
  const rest=await s.turn("With permission to sleep in the loft, I take a long rest.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[op("rest","time.advance",{minutes:null,basis:{source:"rule",key:"long-rest"}},"overnight")]));
  committed(rest,s);assert.equal((await s.f.one("select hp from public.rpg_entities where id=$1",[s.hero])).hp,10);
  assert.equal((await s.f.one("select world_minutes from rpg_private.runtime_state where campaign_id=$1",[s.f.cid])).world_minutes,480);
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_rest_records where campaign_id=$1 and status='complete'",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});

test("final-pinned technical retry commits once without provider or new dice",async()=>{
 const s=await genericFixture();try{
  const stores=await s.stores(),play=await stores.store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,
   expectedRevision:play.revision,mode:"game",input:"I accept the work.",companionId:null,listenerIds:[],mechanic:null};
  const commit=stores.store.commit;
  stores.store.commit=async()=>{throw Error("synthetic precommit interruption");};let calls=0;
  const deps={...stores,summaries:{summarize:()=>assert.fail("foreground summaries")},provider:{next:async(_ctx,_input,_r,_c,_caps,source)=>{
   calls++;return {output:final(source,[npc("miller","Hobb")]),usage:{model:"fake",calls:0,inputTokens:0,outputTokens:0,latencyMs:0}};},narrate:()=>assert.fail("public-only narrator")}};
  const failed=await runAstraTurn(input,deps);assert.equal(failed.status,"failed");assert.equal(failed.canRetry,true);
  stores.store.commit=commit;
  const retry=await resumeAstraTurn({commandId:randomUUID(),campaignId:s.f.cid,operationId:input.operationId,timeline:input.timeline,action:"retry",checkId:null},deps);
  assert.equal(retry.status,"committed",JSON.stringify(s.errors));assert.equal(calls,1);
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});

test("provisional target check, interactive reroll command and continuation retain exact tool position",async()=>{
 const s=await genericFixture(52,{interactive:true});try{
  const rat=npc("rat","Cellar rat");rat.profile="actor-profile:hero";let randoms=0;
  const turn=await s.turn("I attack the rat.",(ctx,_input,receipts,checks,_caps,source)=>{
   if(!receipts.length)return {type:"tool",final:null,toolRequest:{operations:[rat],call:{kind:"attack",actor:known("hero"),target:local("rat"),item:null,dc:null,scope:null}}};
   const envelope=JSON.parse(astraPlanProviderInput(ctx.input,receipts,checks,{responseContract:"unified-v1"}));
   assert.equal(envelope.toolReceipts[0].result.success,false);
   return final(source,[rat],"The blow misses; the rat darts away.");
  },{random:()=>{randoms++;return randoms===1?18:1;}});
  assert.equal(turn.result.status,"awaiting_confirmation");
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Cellar rat'",[s.f.cid])).n,0);
  const row=await s.f.one("select checkpoint,lease_token token from rpg_private.turns where id=$1",[turn.input.operationId]);
  const check=row.checkpoint.checks[0],receipt=row.checkpoint.astraPrimary.toolReceipts[0];
  const replayClaim=await turn.deps.store.claim(s.f.cid,turn.input.operationId),lease=replayClaim.lease;
  const original=await turn.deps.store.recordAstraTool(lease,0,receipt.call,{...receipt.result,total:999});assert.deepEqual(original,receipt);
  await assert.rejects(turn.deps.store.recordAstraTool(lease,0,{...receipt.call,kind:"save"},receipt.result));
  await turn.deps.store.checkpoint(lease,replayClaim.turn.checkpoint,"awaiting_confirmation");
  const command={commandId:randomUUID(),campaignId:s.f.cid,operationId:turn.input.operationId,timeline:turn.input.timeline,action:"reroll",checkId:check.id};
  assert.equal((await resumeAstraTurn(command,turn.deps)).status,"awaiting_confirmation");assert.equal(randoms,2);
  assert.equal((await resumeAstraTurn(command,turn.deps)).status,"awaiting_confirmation");assert.equal(randoms,2);
  const result=await resumeAstraTurn({...command,commandId:randomUUID(),action:"continue",checkId:null},turn.deps);
  assert.equal(result.status,"committed",JSON.stringify({errors:s.errors,row:await s.f.one("select astra_diagnostic,failure,checkpoint from rpg_private.turns where id=$1",[turn.input.operationId])}));assert.equal(randoms,2);
  assert.equal((await s.f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Cellar rat'",[s.f.cid])).n,1);
 }finally{await s.f.db.close();}
});

test("ordinary payer delta uses real funded/empty rows and omitted source cannot forge untracked funds",async()=>{
 for(const balance of [undefined,3,1,0]){
  const s=await genericFixture();try{
   committed(await s.turn("I meet Hobb.",(_c,_i,_r,_k,_a,source)=>final(source,[npc("miller","Hobb")])),s);
   if(balance!==undefined){
    committed(await s.turn("I pay Hobb.",(_c,input,_r,_k,_a,source)=>final(source,[op("fund","resource.adjust",{mutation:{action:"transfer",from:known("hero"),to:handle(source,input,"entities","Hobb"),currency:silver,amount:balance||1,basis:null}})])),s);
    if(balance===0)committed(await s.turn("Hobb returns the coin.",(_c,input,_r,_k,_a,source)=>final(source,[op("return","resource.adjust",{mutation:{action:"delta",actor:known("hero"),resource:{kind:"currency",currency:silver},amount:1,payer:handle(source,input,"entities","Hobb"),basis:null}})])),s);
   }
   const before=await coin(s);
   committed(await s.turn("Hobb pays me two silver.",(_c,input,_r,_k,_a,source)=>final(source,[op("gift","resource.adjust",{mutation:{action:"delta",actor:known("hero"),resource:{kind:"currency",currency:silver},amount:2,payer:handle(source,input,"entities","Hobb"),basis:null}})])),s);
   assert.equal(await coin(s),before+([undefined,3].includes(balance)?2:0));
   if(balance===0){
    const stores=await s.stores(),claim=stores.store.claim,play=await stores.store.readPlay(s.f.cid);
    stores.store.claim=async(...args)=>{const c=await claim(...args);delete c.source.snapshot.entities.find(e=>e.name==="Hobb").resources.currency_silver;return c;};
    const input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,expectedRevision:play.revision,mode:"game",input:"Hobb pays two silver.",companionId:null,listenerIds:[],mechanic:null};
    const failed=await runAstraTurn(input,{...stores,summaries:{summarize:()=>assert.fail("summary")},provider:{next:async(_c,i,_r,_k,_a,source)=>({usage:{model:"fake",calls:0,inputTokens:0,outputTokens:0,latencyMs:0},output:final(source,[op("forged","resource.adjust",{mutation:{action:"delta",actor:known("hero"),resource:{kind:"currency",currency:silver},amount:2,payer:handle(source,i,"entities","Hobb"),basis:null}})])}),narrate:()=>assert.fail("narrator")}});
    assert.equal(failed.status,"failed");assert.equal(await coin(s),before);assert.equal(await coin(s,"Hobb"),0);
   }
  }finally{await s.f.db.close();}
 }
});

test("unrelated private facts do not force two-stage; relevant private literal and paraphrase stay outside public generation",async()=>{
 const s=await genericFixture();try{
  const stores=await s.stores(),claim=stores.store.claim;
  const secret="SYNTHETIC_REMOTE_VOLCANO_REASON";
  stores.store.claim=async(...args)=>{const c=await claim(...args);c.source.privateState={fact:{remoteVolcano:secret}};return c;};
  const play=await stores.store.readPlay(s.f.cid),input={operationId:randomUUID(),campaignId:s.f.cid,timeline:play.timeline,expectedRevision:play.revision,mode:"game",input:"I watch the village square.",companionId:null,listenerIds:[],mechanic:null};
  let responses=0;
  const result=await runAstraTurn(input,{...stores,summaries:{summarize:()=>assert.fail("summary")},provider:{next:async(ctx,_i,_r,_k,_a,source)=>{
   responses++;assert.equal(source.astraResponseMode,"public-unified");assert.ok(!ctx.input.includes(secret));return {usage:{model:"fake",calls:0,inputTokens:0,outputTokens:0,latencyMs:0},output:final(source)};},narrate:()=>assert.fail("unrelated secret forced narrator")}});
  assert.equal(result.status,"committed");assert.equal(responses,1);
  committed(await s.turn("I ask about Hobb.",(_c,_i,_r,_k,_a,source)=>{const d=final(source,[],"Hobb waits.");d.final.privatePatches=[{kind:"fact",key:"hobb_secret",operation:"set",value:"Hobb secretly shelters a fugitive",amount:null}];return d;}),s);
  for(const textValue of ["Hobb secretly shelters a fugitive","Hobb hides someone wanted by the guards"]){
   const tested=await s.turn("Hobb, may I come inside?",(_ctx,_i,_r,_k,_a,source)=>{
    assert.equal(source.astraResponseMode,"private-informed");return final(source,[npc("leak",textValue)]);
   },{narratorCheck:ctx=>{assert.ok(!ctx.input.includes(textValue));assert.ok(!ctx.input.includes("fugitive"));assert.ok(!ctx.input.includes("hobb_secret"));}});
   committed(tested,s);assert.ok(!JSON.stringify(tested.result).includes(textValue));
  }
  const leaked=await s.turn("Hobb, what do you say?",(_c,_i,_r,_k,_a,source)=>final(source),{privateNarration:"Hobb secretly shelters a fugitive"});
  assert.equal(leaked.result.status,"failed");assert.equal(leaked.result.narration,null);
 }finally{await s.f.db.close();}
});

test("private literal disclosure is rejected in Scene locale as well as narration",async()=>{
 const s=await genericFixture();try{
  const secret="SYNTHETIC_HOBB_HIDDEN_ROOM";
  committed(await s.turn("I meet Hobb.",(_c,_i,_r,_k,_a,source)=>{const d=final(source,[],"Hobb waits.");d.final.privatePatches=[{kind:"fact",key:"hobb_room",operation:"set",value:secret,amount:null}];return d;}),s);
  const before=await s.f.one("select current_scene_id from public.rpg_public_state where campaign_id=$1",[s.f.cid]);
  const leak=await s.turn("Hobb, may I enter?",(_c,_i,_r,_k,_a,source)=>final(source),{privateSceneLocale:secret});
  assert.equal(leak.result.status,"failed");assert.deepEqual(await s.f.one("select current_scene_id from public.rpg_public_state where campaign_id=$1",[s.f.cid]),before);
 }finally{await s.f.db.close();}
});

test("generic combat spends authoritative encounter action and cannot attack again from an empty action budget",async()=>{
 const s=await genericFixture();try{
  const rat=npc("rat","Cellar rat");rat.profile="actor-profile:hero";
  committed(await s.turn("A rat confronts me.",(_c,_i,_r,_k,_a,source)=>final(source,[rat])),s);
  const target=(await s.f.one("select id from public.rpg_entities where campaign_id=$1 and name='Cellar rat'",[s.f.cid])).id;
  // Initial active-encounter fixture, not a between-turn balance/stock repair.
  // Uses the existing profile's exact participant/action representation.
  const encounterId=randomUUID(),settings=await s.f.one("select revision from public.rpg_settings where campaign_id=$1",[s.f.cid]);
  await s.f.one("insert into public.rpg_encounters(id,campaign_id,status,settings_revision) values($1,$2,'active',$3)",[encounterId,s.f.cid,settings.revision]);
  for(const [index,id] of [s.hero,target].entries())await s.f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb)",
   [randomUUID(),s.f.cid,encounterId,id,index?"Cellar rat":"Ari",index,JSON.stringify({position:"nearby"}),JSON.stringify({action:1,move:1,reaction:1,active:index===0,defending:false,withdrawn:false,originalMaxHp:10})]);
  const attack=(_c,input,receipts,_checks,_caps,source)=>{
   if(!receipts.length)return {type:"tool",final:null,toolRequest:{operations:[],call:{kind:"attack",actor:known("hero"),target:handle(source,input,"entities","Cellar rat"),item:null,dc:null,scope:null}}};
   return final(source,[],"Your attack misses.");};
  committed(await s.turn("I attack the rat.",attack,{random:()=>1}),s);
  assert.equal((await s.f.one("select public_resources->>'action' action from public.rpg_encounter_participants where campaign_id=$1 and entity_id=$2",[s.f.cid,s.hero])).action,"0");
  let rolls=0;const next=await s.turn("I attack again without waiting.",attack,{random:()=>{rolls++;return 1;}});
  assert.equal(next.result.status,"failed");assert.equal(rolls,0);
  assert.equal((await s.f.one("select hp from public.rpg_entities where id=$1",[target])).hp,10);
 }finally{await s.f.db.close();}
});
