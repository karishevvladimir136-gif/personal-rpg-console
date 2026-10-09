import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";
import { validateResumeInput } from "../src/lib/gameplay/request-validation.ts";

const usage={model:"synthetic",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
const operationRow=(f,id)=>f.one(`select status,checkpoint,lease_token,astra_diagnostic,
  failure,retryable,committed_revision from rpg_private.turns where id=$1`,[id]);

async function interactiveFixture(){
  const context=await takenOver(48);
  const {f,hero,npc}=context;
  try {
    await f.one("update public.rpg_entities set stats=stats||'{\"attack\":20}'::jsonb where id=$1",[hero]);
    await f.one("update public.rpg_entities set hp=5,max_hp=8,stats=stats||'{\"defense\":10}'::jsonb where id=$1",[npc]);
    const events=[],errors=[],providerCalls=[];
    const rpc=async(args)=>{
      const id=args.p_payload?.operationId;
      const before=id?await operationRow(f,id):null;
      const event={action:args.p_action,before:before?.status??null,
        status:args.p_payload?.status??null,
        diagnostic:args.p_payload?.diagnostic??null,
        checkpoint:args.p_payload?.checkpoint?structuredClone(args.p_payload.checkpoint):null,
        token:args.p_payload?.token??null};
      events.push(event);
      try {
        const data=await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline);
        const after=id?await operationRow(f,id):null;
        event.after=after?.status??null;
        event.leaseToken=after?.lease_token??null;
        return {data};
      } catch(error){
        errors.push({action:args.p_action,message:error.message,code:error.code});
        event.error=error.message;
        return {error:{message:error.message,code:error.code}};
      }
    };
    const timeline=await f.fence(f.cid);
    const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true);
    const memory=createRpcMemoryStore(f.owner,async(args)=>({data:await f.memory(
      args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)}),timeline);
    const play=await store.readPlay(f.cid);
    const input={operationId:randomUUID(),campaignId:f.cid,timeline:play.timeline,
      expectedRevision:play.revision,mode:"game",
      input:"I fling a mug of cold dishwater at the visible bartender. What happens?",
      companionId:null,listenerIds:[],mechanic:null};
    let rolls=0;
    const provider={
      next:async(_context,_input,receipts,checks,_caps,source,observe)=>{
        const row=await operationRow(f,input.operationId);
        providerCalls.push({stage:"plan",status:row.status,
          receipts:structuredClone(receipts),checks:structuredClone(checks)});
        observe?.({responseReceived:true});
        if(receipts.length<2)return {usage,output:{type:"tool",final:null,
          call:{kind:receipts.length===0?"attack":"damage",actorId:hero,
            targetId:npc,dc:null,itemId:null,scope:null}}};
        const target=source.snapshot.entities.find((entity)=>entity.id===npc);
        return {usage,output:{type:"final",call:null,final:{
          worldMinutes:source.runtime.worldMinutes,
          changes:[{family:"entities",id:npc,expectedRevision:target.revision,
            values:{hp:target.hp-receipts[1].result.total}}],
          outcomes:[],privatePatches:[]}}};
      },
      narrate:async()=>{
        providerCalls.push({stage:"narrate",status:(await operationRow(f,input.operationId)).status});
        return {usage,output:{narration:"The recorded throw lands, and the bartender reacts.",
          visualDescription:"",clarification:null}};
      },
    };
    const deps={store,memory,provider,random:(_min,max)=>{rolls++;return max-1;},
      summaries:{summarize:async(job)=>({usage,output:{schemaVersion:1,
        selections:job.sources.map((source)=>({sourceId:source.id,version:source.ref.version}))}})}};
    const command=(action="continue",checkId=null)=>({commandId:randomUUID(),
      campaignId:f.cid,operationId:input.operationId,timeline:input.timeline,action,checkId});
    return {...context,events,errors,providerCalls,store,deps,input,command,
      rolls:()=>rolls};
  } catch(error){await f.db.close();throw error;}
}

async function mechanicsState(context){
  const {f,hero,npc,input}=context;
  return f.one(`select h.hp hero_hp,h.resources hero_resources,n.hp npc_hp,n.revision npc_revision,
    r.revision runtime_revision,r.world_minutes,p.revision public_revision,
    (select count(*)::integer from public.rpg_scenes where campaign_id=r.campaign_id) scenes,
    (select count(*)::integer from rpg_private.runtime_events where operation_id=$3) events,
    (select max((payload->>'sourceRevision')::integer) from rpg_private.runtime_events
      where operation_id=$3) committed_source_revision
    from rpg_private.runtime_state r join public.rpg_public_state p using(campaign_id)
    join public.rpg_entities h on h.id=$1 join public.rpg_entities n on n.id=$2
    where r.campaign_id=$4`,[hero,npc,input.operationId,f.cid]);
}

async function pause(context){
  const result=await runAstraTurn(context.input,context.deps);
  assert.equal(result.status,"awaiting_confirmation",JSON.stringify(context.errors));
  const row=await operationRow(context.f,context.input.operationId);
  assert.equal(row.checkpoint.astraPrimary.finalProposal,null);
  assert.equal(row.checkpoint.checks.length,1);
  assert.equal(row.checkpoint.astraPrimary.toolReceipts.length,1);
  assert.equal(row.checkpoint.checks[0].rollNumber,1);
  assert.deepEqual(row.astra_diagnostic,{stage:"plan",phase:"entered",
    providerResponseReceived:false,narrationParseSucceeded:false,failureCategory:null});
  assert.equal(row.lease_token,null);
  return row;
}

function assertAtomicCommit(before,after){
  assert.equal(after.npc_hp,3,"the deterministic two damage is applied once");
  assert.equal(after.npc_revision,before.npc_revision+1);
  assert.ok(after.runtime_revision>before.runtime_revision,
    "the single atomic commit advances the authoritative revision");
  assert.equal(after.public_revision,before.public_revision+1);
  assert.equal(after.scenes,before.scenes+2);
  assert.equal(after.events,1);
  assert.equal(after.committed_source_revision,before.runtime_revision);
  assert.equal(after.hero_hp,before.hero_hp);
  assert.deepEqual(after.hero_resources,before.hero_resources);
  assert.equal(after.world_minutes,before.world_minutes);
}

test("migration48 diagnostic continuation activates the unchanged checkpoint before planning and commits once",async()=>{
  const context=await interactiveFixture();
  const {f,input,deps,events,providerCalls}=context;
  try {
    const before=await mechanicsState(context),paused=await pause(context);
    assert.deepEqual(await mechanicsState(context),before,"a displayed roll does not commit mechanics");
    const firstLease=events.find((event)=>event.action==="claim").leaseToken;
    const resumedAt=events.length,continueCommand=context.command();
    const done=await resumeAstraTurn(continueCommand,deps);
    assert.equal(done.status,"committed",JSON.stringify(context.errors));
    const resumed=events.slice(resumedAt);
    const claim=resumed.findIndex((event)=>event.action==="claim");
    const checkpoint=resumed.findIndex((event)=>event.action==="checkpoint");
    const diagnostic=resumed.findIndex((event)=>event.action==="astra_diagnostic");
    assert.ok(claim>=0 && claim<checkpoint && checkpoint<diagnostic);
    assert.equal(resumed[claim].before,"awaiting_confirmation");
    assert.notEqual(resumed[claim].leaseToken,firstLease,"Continue renews its lease");
    assert.equal(resumed[checkpoint].status,"generating");
    assert.equal(resumed[checkpoint].after,"generating");
    assert.equal(resumed[checkpoint].token,resumed[claim].leaseToken);
    assert.deepEqual(resumed[checkpoint].checkpoint,paused.checkpoint,
      "the transition preserves every field of the existing checkpoint");
    assert.equal(resumed[diagnostic].before,"generating");
    assert.equal(resumed[diagnostic].diagnostic.stage,"plan");
    assert.equal(resumed[diagnostic].diagnostic.phase,"entered");
    assert.deepEqual(providerCalls[1].checks,paused.checkpoint.checks);
    assert.deepEqual(providerCalls[1].receipts,paused.checkpoint.astraPrimary.toolReceipts);
    assert.equal(providerCalls[1].status,"generating");
    const stored=await operationRow(f,input.operationId);
    assert.deepEqual(stored.checkpoint.checks,paused.checkpoint.checks);
    assert.deepEqual(stored.checkpoint.astraPrimary.toolReceipts[0],paused.checkpoint.astraPrimary.toolReceipts[0]);
    assert.deepEqual(stored.checkpoint.astraPrimary.toolReceipts.map((receipt)=>receipt.call.kind),["attack","damage"]);
    assert.equal(context.rolls(),2,"only the initial check and new damage roll run");
    assert.equal(stored.astra_diagnostic.stage,"commit");
    assert.equal(stored.astra_diagnostic.phase,"entered");
    assert.ok(events.filter((event)=>event.action==="astra_diagnostic")
      .every((event)=>["pending","generating"].includes(event.before) && !event.error));
    assert.deepEqual(resumed.filter((event)=>event.action==="astra_diagnostic")
      .map((event)=>`${event.diagnostic.stage}/${event.diagnostic.phase}`),[
      "plan/entered","plan/completed","final_validated/entered","final_validated/completed",
      "final_checkpoint/entered","final_checkpoint/completed","narration_context/entered",
      "narration_context/completed","narration_provider/entered","narration_provider/completed",
      "narration_parse/completed","narration_safety/entered","narration_safety/completed",
      "narration_checkpoint/entered","narration_checkpoint/completed","commit/entered",
    ]);
    const after=await mechanicsState(context);assertAtomicCommit(before,after);
    assert.equal(stored.committed_revision,after.runtime_revision);
    const calls=providerCalls.length;
    for(const command of [continueCommand,context.command(),context.command("retry")])
      assert.equal((await resumeAstraTurn(command,deps)).status,"committed");
    assert.equal((await runAstraTurn(input,deps)).status,"committed");
    assert.equal(providerCalls.length,calls);assert.equal(context.rolls(),2);
    assert.deepEqual(await mechanicsState(context),after);
    assert.deepEqual(context.errors,[]);
  } finally {await f.db.close();}
});

test("forged and stale continuation fences cannot change recorded checks or commit mechanics",async()=>{
  const context=await interactiveFixture();
  const {f,input,deps,store}=context;
  try {
    const paused=await pause(context),before=await mechanicsState(context);
    assert.throws(()=>validateResumeInput({...context.command(),checkId:randomUUID()},
      f.cid,input.operationId),(error)=>error.code==="validation");
    const forged={...context.command(),timeline:{...input.timeline,epoch:input.timeline.epoch+1}};
    await assert.rejects(resumeAstraTurn(forged,deps),(error)=>error.code==="conflict");
    assert.equal((await operationRow(f,input.operationId)).status,"awaiting_confirmation");
    await assert.rejects(store.checkpoint({campaignId:f.cid,operationId:input.operationId,
      token:randomUUID(),expectedRevision:input.expectedRevision},paused.checkpoint,"generating"),
    (error)=>error.code==="conflict");
    assert.deepEqual((await operationRow(f,input.operationId)).checkpoint,paused.checkpoint);
    // A new authoritative revision invalidates the old turn's continuation.
    await f.one("update rpg_private.runtime_state set revision=revision+1 where campaign_id=$1",[f.cid]);
    const stale=await resumeAstraTurn(context.command(),deps);
    assert.equal(stale.status,"failed");assert.equal(stale.failure,"conflict");
    const row=await operationRow(f,input.operationId);
    assert.deepEqual(row.checkpoint,paused.checkpoint);
    assert.equal(context.providerCalls.length,1);assert.equal(context.rolls(),1);
    const after=await mechanicsState(context);
    assert.equal(after.npc_hp,before.npc_hp);assert.equal(after.events,0);
    assert.equal(after.scenes,before.scenes);
  } finally {await f.db.close();}
});

test("a forged awaiting turn without a displayed recorded check cannot enter generating",async()=>{
  const context=await interactiveFixture();
  const {f,input,deps}=context;
  try {
    await deps.store.begin(input,"astra-primary-v1");
    // Deliberately malformed disposable state exercises the Continue guard.
    await f.one("update rpg_private.turns set status='awaiting_confirmation' where id=$1",[input.operationId]);
    const at=context.events.length,before=await mechanicsState(context);
    const result=await resumeAstraTurn(context.command(),deps);
    assert.equal(result.status,"failed");assert.equal(result.failure,"validation");
    assert.ok(!context.events.slice(at).some((event)=>event.action==="checkpoint" && event.status==="generating"));
    assert.equal(context.providerCalls.length,0);assert.equal(context.rolls(),0);
    assert.deepEqual(await mechanicsState(context),before);
    assert.deepEqual((await operationRow(f,input.operationId)).checkpoint.checks,[]);
  } finally {await f.db.close();}
});

test("reroll remains awaiting confirmation and its replacement survives diagnostic continuation unchanged",async()=>{
  const context=await interactiveFixture();
  const {f,input,deps}=context;
  try {
    const before=await mechanicsState(context),paused=await pause(context);
    const at=context.events.length;
    const reroll=context.command("reroll",paused.checkpoint.checks[0].id);
    assert.equal((await resumeAstraTurn(reroll,deps)).status,"awaiting_confirmation");
    const replaced=await operationRow(f,input.operationId);
    assert.equal(replaced.checkpoint.checks[0].id,paused.checkpoint.checks[0].id);
    assert.equal(replaced.checkpoint.checks[0].rollNumber,2);
    assert.deepEqual(replaced.astra_diagnostic,paused.astra_diagnostic);
    assert.deepEqual(replaced.checkpoint.astraPrimary.toolReceipts,paused.checkpoint.astraPrimary.toolReceipts);
    assert.ok(!context.events.slice(at).some((event)=>event.action==="checkpoint" && event.status==="generating"));
    assert.equal(context.providerCalls.length,1);
    assert.deepEqual(await mechanicsState(context),before);
    assert.equal((await resumeAstraTurn(reroll,deps)).status,"awaiting_confirmation");
    assert.deepEqual((await operationRow(f,input.operationId)).checkpoint.checks,replaced.checkpoint.checks);
    assert.equal((await resumeAstraTurn(context.command(),deps)).status,"committed",JSON.stringify(context.errors));
    const stored=await operationRow(f,input.operationId);
    assert.deepEqual(stored.checkpoint.checks,replaced.checkpoint.checks);
    assert.equal(stored.checkpoint.astraPrimary.toolReceipts.length,2);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_commands where operation_id=$1 and request->>'action'='reroll'",[input.operationId])).n,1);
    assertAtomicCommit(before,await mechanicsState(context));
    assert.deepEqual(context.errors,[]);
  } finally {await f.db.close();}
});

test("retry after a lost successful commit response cannot repeat checks, narration or mechanics",async()=>{
  const context=await interactiveFixture();
  const {f,input,deps}=context;
  try {
    const before=await mechanicsState(context),paused=await pause(context);
    const commit=deps.store.commit.bind(deps.store);
    deps.store.commit=async(...args)=>{await commit(...args);throw new DmError("unavailable",true);};
    await assert.rejects(resumeAstraTurn(context.command(),deps),(error)=>error.code==="unavailable");
    assert.equal((await operationRow(f,input.operationId)).status,"committed");
    const after=await mechanicsState(context);assertAtomicCommit(before,after);
    const calls=context.providerCalls.length,rolls=context.rolls();
    for(const command of [context.command("retry"),context.command("retry"),context.command()])
      assert.equal((await resumeAstraTurn(command,deps)).status,"committed");
    assert.equal(context.providerCalls.length,calls);assert.equal(context.rolls(),rolls);
    assert.deepEqual(await mechanicsState(context),after);
    const stored=await operationRow(f,input.operationId);
    assert.deepEqual(stored.checkpoint.checks,paused.checkpoint.checks);
    assert.equal(stored.checkpoint.astraPrimary.toolReceipts.length,2);
  } finally {await f.db.close();}
});
