import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { DmError } from "../src/lib/gameplay/dm-errors.ts";

const usage={model:"synthetic",inputTokens:0,outputTokens:0,calls:1,latencyMs:0};
const migration=new URL("../supabase/migrations/202610060044_astra_execution_diagnostic.sql",import.meta.url);

test("populated 43 to 44 upgrade preserves old turns and a pre-44 save",async()=>{
  const f=await fixture(43);
  try {
    const w=await world(f);
    const play=await f.runtime(w.cid,"play");
    const input={operationId:randomUUID(),campaignId:w.cid,
      expectedRevision:play.revision,mode:"game",input:"Old pending turn",
      companionId:null,listenerIds:[],mechanic:null};
    await f.runtime(w.cid,"begin",{...input,serverRuntime:"astra-primary-v1"});
    const before=await f.one("select to_jsonb(t) data from rpg_private.turns t where id=$1",[input.operationId]);
    const saved=await f.saves(w.cid,"create",await f.command(w.cid,
      {kind:"manual",name:"Before diagnostic migration"}));
    const save=saved.snapshot.saves.find((entry)=>entry.name==="Before diagnostic migration");
    assert.ok(save);
    const manifestBefore=await f.one("select md5(to_jsonb(m)::text) fingerprint from rpg_private.timeline_manifests m where id=$1",[save.id]);
    await f.db.exec(await readFile(migration,"utf8"));
    const after=await f.one("select to_jsonb(t)-'astra_diagnostic' data,astra_diagnostic from rpg_private.turns t where id=$1",[input.operationId]);
    assert.deepEqual(after.data,before.data);
    assert.equal(after.astra_diagnostic,null);
    const manifestAfter=await f.one("select md5(to_jsonb(m)::text) fingerprint from rpg_private.timeline_manifests m where id=$1",[save.id]);
    assert.deepEqual(manifestAfter,manifestBefore);
    await f.saves(w.cid,"load",await f.command(w.cid,
      {saveId:save.id,label:"Restore old diagnostic-free save",recovery:false}));
    const restored=await f.one("select runtime_identity,astra_diagnostic,input from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(restored.runtime_identity,"astra-primary-v1");
    assert.equal(restored.astra_diagnostic,null);
    assert.equal(restored.input.input,input.input);
  } finally {await f.db.close();}
});

async function setup() {
  const f=await fixture(44);
  const w=await world(f);
  const timeline=await f.fence(w.cid);
  const rpc=async(args)=>{
    try {return {data:await f.runtime(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  const memoryRpc=async(args)=>{
    try {return {data:await f.memory(args.p_campaign_id,args.p_action,args.p_payload,args.p_timeline)};}
    catch(error) {return {error:{message:error.message,code:error.code}};}
  };
  const store=createRpcTurnStore(f.owner,rpc,"gpt-6-astra",timeline,true);
  const memory=createRpcMemoryStore(f.owner,memoryRpc,timeline);
  const play=await store.readPlay(w.cid);
  const input={operationId:randomUUID(),campaignId:w.cid,timeline,
    expectedRevision:play.revision,mode:"game",input:"SYNTHETIC_PRIVATE_MARKER ask for an ordinary answer",
    companionId:null,listenerIds:[],mechanic:null};
  return {f,w,store,memory,input};
}

test("migration 44 keeps the Astra diagnostic private and rejects forged stage writes",async()=>{
  const {f,w,store,input}=await setup();
  try {
    const before=await f.one("select astra_diagnostic from rpg_private.turns limit 1");
    assert.equal(before?.astra_diagnostic??null,null);
    await store.begin(input,"astra-primary-v1");
    const claim=await store.claim(w.cid,input.operationId);
    const diagnostic={stage:"plan",phase:"entered",providerResponseReceived:false,
      narrationParseSucceeded:false,failureCategory:null};
    await store.recordAstraStage(claim.lease,diagnostic);
    assert.deepEqual((await f.one("select astra_diagnostic from rpg_private.turns where id=$1",
      [input.operationId])).astra_diagnostic,diagnostic);
    assert.equal(JSON.stringify(await store.getPublic(w.cid,input.operationId)).includes("astra_diagnostic"),false);
    const lease={...claim.lease};
    delete lease.timeline;
    await assert.rejects(f.runtime(w.cid,"astra_diagnostic",{
      ...lease,diagnostic:{...diagnostic,stage:"unbounded_secret"}},input.timeline));
    assert.deepEqual((await f.one("select astra_diagnostic from rpg_private.turns where id=$1",
      [input.operationId])).astra_diagnostic,diagnostic);
  } finally {await f.db.close();}
});

for (const scenario of [
  {name:"final proposal validation",stage:"final_validated",kind:"final"},
  {name:"final checkpoint",stage:"final_checkpoint",kind:"final_checkpoint"},
  {name:"narration context",stage:"narration_context",kind:"context"},
  {name:"narrator transport",stage:"narration_provider",kind:"provider"},
  {name:"narrator parse",stage:"narration_parse",kind:"parse"},
  {name:"public narration safety",stage:"narration_safety",kind:"safety"},
  {name:"narration checkpoint",stage:"narration_checkpoint",kind:"narration_checkpoint"},
  {name:"commit authority",stage:"commit",kind:"commit"},
]) test(`Astra failure preserves a bounded private ${scenario.name} stage`,async()=>{
  const {f,store,memory,input}=await setup();
  try {
    let finalReturned=false,checkpointCount=0;
    const originalCheckpoint=store.checkpoint.bind(store);
    const originalCommit=store.commit.bind(store);
    store.checkpoint=async(...args)=>{
      checkpointCount++;
      if ((scenario.kind==="final_checkpoint"&&checkpointCount===1)||
          (scenario.kind==="narration_checkpoint"&&checkpointCount===2))
        throw new DmError("validation");
      return originalCheckpoint(...args);
    };
    store.commit=async(...args)=>{
      if(scenario.kind==="commit")throw new DmError("validation");
      return originalCommit(...args);
    };
    const originalContext=memory.context.bind(memory);
    memory.context=async(...args)=>{
      if(scenario.kind==="context"&&finalReturned)throw new DmError("validation");
      return originalContext(...args);
    };
    const provider={
      next:async()=>{
        finalReturned=true;
        return {usage,output:{type:"final",call:null,final:{
          worldMinutes:scenario.kind==="final"?-1:0,changes:[],outcomes:[],privatePatches:[]}}};
      },
      narrate:async(_context,_input,observe)=>{
        if(scenario.kind==="provider")throw new DmError("provider");
        if(scenario.kind==="parse"){
          observe?.({responseReceived:true,phase:"output-parse"});
          throw new DmError("validation");
        }
        return {usage,output:{narration:scenario.kind==="safety"?"":"The seller answers.",
          visualDescription:"",clarification:null}};
      }
    };
    const result=await runAstraTurn(input,{store,memory,provider,
      summaries:{summarize:()=>assert.fail("unexpected summary")}});
    assert.equal(result.status,"failed");
    const row=await f.one("select astra_diagnostic,checkpoint,committed_revision from rpg_private.turns where id=$1",
      [input.operationId]);
    assert.equal(row.astra_diagnostic.stage,scenario.stage);
    assert.equal(row.astra_diagnostic.phase,"failed");
    assert.equal(row.astra_diagnostic.failureCategory,
      scenario.kind==="provider"?"provider":"validation");
    assert.equal(row.astra_diagnostic.providerResponseReceived,
      scenario.kind!=="provider");
    assert.equal(row.astra_diagnostic.narrationParseSucceeded,
      ["safety","narration_checkpoint","commit"].includes(scenario.kind));
    assert.equal(JSON.stringify(row.astra_diagnostic).includes("SYNTHETIC_PRIVATE_MARKER"),false);
    assert.equal(row.committed_revision,null);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,0);
  } finally {await f.db.close();}
});
