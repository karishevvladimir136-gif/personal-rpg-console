import test from "node:test";
import assert from "node:assert/strict";
import {runAstraTurn} from "../src/lib/gameplay/astra-primary.ts";
import {genericFixture,text,local,known,op,silver,npc,final,handle} from "./astra-generic-fixture.mjs";

test("unseeded production journey: fiction, current acceptance, one-time pay, atomic new stock purchase, consume and save/load",async()=>{
 const s=await genericFixture();const {f,hero}=s;
 const must=async(...args)=>{const result=await s.turn(...args);
  if(result.result.status!=="committed"){
   const captured=s.captures.at(-1);
   if(captured){const comparison=await f.one("select rpg_private.astra_generic_compile(t,$2::jsonb) expected from rpg_private.turns t where t.id=$1",[result.input.operationId,JSON.stringify(captured.checkpoint.astraGeneric)]);
    assert.deepEqual(comparison.expected,captured.checkpoint.astraGeneric,"SQL/TS reconstruction mismatch");}
   assert.fail(JSON.stringify(s.errors));}
  return result;};
 try{
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1",[f.cid])).n,1);
  const frozen=await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid]);
  await must("I follow the lead to the mill.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[],"At the Village Mill, Hobb offers two silver for packing crates."));
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1",[f.cid])).n,1);
  await must("I accept Hobb's offer.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[npc("miller","Hobb","agreement"),
   op("delivery-job","quest.mutate",{mutation:{action:"create",title:text("Pack crates"),description:text("Pack Hobb's crates for two silver."),issuer:local("miller"),
    reward:{currency:silver,amount:2,item:null},basis:{source:"public-evidence",key:"input/current"}}},"agreement")],"Hobb nods.",[{text:"You agree to pack the crates for two silver.",requiresOperations:["miller","delivery-job"]}]));
  let job=await f.one("select * from public.rpg_quests where campaign_id=$1",[f.cid]);assert.equal(job.status,"open");assert.equal(job.reward_terms.currencyAmount,2);
  const payment=await must("I finish packing and ask for the agreed reward.",(_ctx,input,_r,_c,_caps,source)=>{
   const target=handle(source,input,"quests","Pack crates");return final(source,[
    op("complete","quest.mutate",{mutation:{action:"status",target,status:"complete",outcome:null,basis:null}},"pay"),
    op("reward","quest.mutate",{mutation:{action:"claim",target,basis:null}},"pay")],"Hobb counts out the payment.",[{text:"You receive two silver.",requiresOperations:["reward"]}]);});
  assert.equal((await f.one("select resources from public.rpg_entities where id=$1",[hero])).resources.currency_silver,7);
  job=await f.one("select * from public.rpg_quests where campaign_id=$1",[f.cid]);assert.equal(job.reward_operation_id,payment.input.operationId);
  assert.equal((await runAstraTurn(payment.input,payment.deps)).status,"committed");
  await must("I meet the baker and buy one loaf for two silver.",(_ctx,_input,_r,_c,_caps,source)=>final(source,[
   npc("baker","Bessa","purchase"),op("bread","item.mutate",{mutation:{action:"create",name:text("Bread"),description:null,category:"food",quantity:1,
    owner:local("baker"),storage:null,basis:null}},"purchase"),
   op("payment","resource.adjust",{mutation:{action:"transfer",from:known("hero"),to:local("baker"),currency:silver,amount:2,basis:null}},"purchase"),
   op("receive","item.mutate",{mutation:{action:"transfer",target:local("bread"),quantity:1,recipient:known("hero"),storage:null,basis:null}},"purchase")],
   "Bessa wraps a loaf.",[{text:"You pay two silver and receive the bread.",requiresOperations:["payment","receive"]}]));
  assert.equal((await f.one("select resources from public.rpg_entities where id=$1",[hero])).resources.currency_silver,5);
  assert.equal((await f.one("select resources from public.rpg_entities where campaign_id=$1 and name='Bessa'",[f.cid])).resources.currency_silver,2);
  assert.equal((await f.one("select owner_entity_id from public.rpg_items where campaign_id=$1 and name='Bread'",[f.cid])).owner_entity_id,hero);
  await must("I eat the bread.",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("eat","item.mutate",{mutation:{action:"consume",target:handle(source,input,"items","Bread"),quantity:1,basis:null}})],
   "You sit beside the mill stream.",[{text:"You eat the loaf.",requiresOperations:["eat"]}]));
  const save=await f.saves(f.cid,"create",await f.command(f.cid,{kind:"manual",name:"After the ordinary errand"}));
  await f.saves(f.cid,"load",await f.command(f.cid,{saveId:save.saveId,label:"Return to the mill",recovery:false}));
  await must("I return to Hobb.",(ctx,_input,_r,_c,_caps,source)=>{assert.ok(ctx.input.includes("Hobb"));return final(source,[],"Hobb recognizes you and asks how Bessa's bread was.");});
  const before=(await f.one("select resources from public.rpg_entities where id=$1",[hero])).resources.currency_silver;
  await must("Can I claim that crate reward again?",(_ctx,input,_r,_c,_caps,source)=>final(source,[op("again","quest.mutate",{mutation:{action:"claim",target:handle(source,input,"quests","Pack crates"),basis:null}})],"Hobb checks the payment record."));
  assert.equal((await f.one("select resources from public.rpg_entities where id=$1",[hero])).resources.currency_silver,before);
  assert.equal((await f.one("select count(*)::int n from public.rpg_entities where campaign_id=$1 and name='Hobb'",[f.cid])).n,1);
  assert.equal((await f.one("select quantity from public.rpg_items where campaign_id=$1 and name='Bread'",[f.cid])).quantity,0);
  assert.deepEqual((await f.one("select world from rpg_private.world_foundations where campaign_id=$1",[f.cid])).world,frozen.world);
 }finally{await f.db.close();}
});
