import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { astraToolResult } from "../src/lib/gameplay/astra-primary.ts";

const migration=new URL("../supabase/migrations/202610140051_astra_unified_contract.sql",import.meta.url);
const inputFor=async(f,cid)=>({campaignId:cid,operationId:randomUUID(),
  expectedRevision:(await f.runtime(cid,"play")).revision,mode:"game",input:"A simple conversation",
  companionId:null,listenerIds:[],mechanic:null});
const begin=(f,input,contract)=>f.runtime(input.campaignId,"begin",{...input,
  serverRuntime:"astra-primary-v1",...(contract?{serverAstraContract:contract}:{})});
const pinMode=(f,cid,lease,mode)=>{
  const {timeline,...payload}=lease;
  return f.runtime(cid,"astra_response_mode",{...payload,mode},timeline);
};
async function fingerprints(f,stripContract=false){
  const tables=await f.query(`select table_schema,table_name from information_schema.tables
    where table_type='BASE TABLE' and ((table_schema='public' and table_name like 'rpg_%')
    or table_schema='rpg_private') order by table_schema,table_name`);
  const quote=s=>'"'+s.replaceAll('"','""')+'"';
  return Promise.all(tables.map(async t=>({name:t.table_schema+"."+t.table_name,
    ...await f.one(`select count(*)::integer n,md5(coalesce(string_agg(
      (${stripContract&&t.table_schema==='rpg_private'&&t.table_name==='turns'?"to_jsonb(r)-array['astra_response_contract','astra_response_mode']":"to_jsonb(r)"})::text,
      E'\\n' order by (${stripContract&&t.table_schema==='rpg_private'&&t.table_name==='turns'?"to_jsonb(r)-array['astra_response_contract','astra_response_mode']":"to_jsonb(r)"})::text),'')) hash
      from ${quote(t.table_schema)}.${quote(t.table_name)} r`)})));
}

test("populated 50→51 keeps existing pending semantics and immutable old saves",async()=>{
  const f=await fixture(50);
  try {
    const w=await world(f);
    const input=await inputFor(f,w.cid);
    await begin(f,input);
    const before=await f.one("select to_jsonb(t) data from rpg_private.turns t where id=$1",[input.operationId]);
    const saved=await f.saves(w.cid,"create",await f.command(w.cid,{kind:"manual",name:"Before unified response"}));
    const point=saved.snapshot.saves.find(s=>s.name==="Before unified response");
    const manifestSql="select md5(to_jsonb(m)::text) hash from rpg_private.save_points p join rpg_private.timeline_manifests m on m.id=p.manifest_id and m.campaign_id=p.campaign_id where p.id=$1";
    const manifest=await f.one(manifestSql,[point.id]);
    const beforeTables=await fingerprints(f);
    assert.equal(beforeTables.length,79);
    const unchangedFunctions=await f.query(`select p.oid,pg_get_functiondef(p.oid) definition,
      p.proacl acl,p.proowner,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where p.prokind='f' and (n.nspname='rpg_private' or (n.nspname='public' and p.proname like 'rpg_%'))
      and p.oid<>'public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure order by p.oid`);
    await f.db.exec(await readFile(migration,"utf8"));
    assert.deepEqual(await fingerprints(f,true),beforeTables);
    assert.deepEqual(await f.query(`select p.oid,pg_get_functiondef(p.oid) definition,
      p.proacl acl,p.proowner,p.prosecdef,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where p.prokind='f' and (n.nspname='rpg_private' or (n.nspname='public' and p.proname like 'rpg_%'))
      and p.oid<>all(array['public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)'::regprocedure,
        'public.rpg_runtime_before_astra_unified_contract(uuid,uuid,text,jsonb,jsonb)'::regprocedure]) order by p.oid`),unchangedFunctions);
    const after=await f.one("select to_jsonb(t)-array['astra_response_contract','astra_response_mode'] data,astra_response_contract,astra_response_mode from rpg_private.turns t where id=$1",[input.operationId]);
    assert.deepEqual(after.data,before.data);
    assert.equal(after.astra_response_contract,null);
    assert.equal(after.astra_response_mode,null);
    assert.deepEqual(await f.one(manifestSql,[point.id]),manifest);
    assert.equal(await f.runtime(w.cid,"astra_contract",{operationId:input.operationId}),"legacy-two-stage");
    const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.equal(claim.astraResponseContract,null);
    assert.equal(claim.astraResponseMode,null);
    await f.runtime(w.cid,"fail",{...claim.lease,failure:"provider",retryable:true});
    await f.saves(w.cid,"load",await f.command(w.cid,{saveId:point.id,label:"Restore old pending",recovery:false}));
    assert.equal(await f.runtime(w.cid,"astra_contract",{operationId:input.operationId}),"legacy-two-stage");
    assert.equal((await f.one("select astra_response_contract value from rpg_private.turns where id=$1",[input.operationId])).value,null);
  } finally { await f.db.close(); }
});

test("unified contract pins with input at begin, survives retry/save/load and rejects changed pins",async()=>{
  const f=await fixture(51);
  try {
    const w=await world(f);
    const input=await inputFor(f,w.cid);
    assert.equal(await f.runtime(w.cid,"astra_contract",{operationId:input.operationId}),null);
    const original=await begin(f,input,"unified-v1");
    const row=await f.one("select input,source,astra_response_contract,runtime_identity from rpg_private.turns where id=$1",[input.operationId]);
    assert.equal(row.input.input,input.input);
    assert.equal(row.source,null);
    assert.equal(row.astra_response_contract,"unified-v1");
    assert.equal(row.runtime_identity,"astra-primary-v1");
    assert.deepEqual(await begin(f,input,"unified-v1"),original);
    await assert.rejects(begin(f,input),/rpg_conflict/);
    await assert.rejects(begin(f,{...input,input:"Different text"},"unified-v1"),/rpg_conflict/);
    const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.equal(claim.astraResponseContract,"unified-v1");
    assert.equal(claim.astraResponseMode,null);
    assert.equal(await pinMode(f,w.cid,claim.lease,"public-unified"),"public-unified");
    assert.equal(await pinMode(f,w.cid,claim.lease,"public-unified"),"public-unified");
    await assert.rejects(pinMode(f,w.cid,claim.lease,"private-informed"),/rpg_conflict/);
    await f.runtime(w.cid,"fail",{...claim.lease,failure:"provider",retryable:true});
    const saved=await f.saves(w.cid,"create",await f.command(w.cid,{kind:"manual",name:"Unified pending"}));
    const point=saved.snapshot.saves.find(s=>s.name==="Unified pending");
    const resumed=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.equal(resumed.astraResponseContract,"unified-v1");
    assert.equal(resumed.astraResponseMode,"public-unified");
    assert.deepEqual(resumed.source,claim.source);
    await f.runtime(w.cid,"fail",{...resumed.lease,failure:"provider",retryable:true});
    await f.saves(w.cid,"load",await f.command(w.cid,{saveId:point.id,label:"Restore unified pending",recovery:false}));
    assert.equal(await f.runtime(w.cid,"astra_contract",{operationId:input.operationId}),"unified-v1");
    assert.equal((await f.one("select astra_response_mode value from rpg_private.turns where id=$1",[input.operationId])).value,"public-unified");
    const publicTurn=await f.runtime(w.cid,"get",{operationId:input.operationId});
    assert.equal(JSON.stringify(publicTurn).includes("astraResponseContract"),false);
    assert.equal(JSON.stringify(publicTurn).includes("astra_response_contract"),false);
    assert.equal(JSON.stringify(publicTurn).includes("astraResponseMode"),false);
    assert.equal(JSON.stringify(publicTurn).includes("astra_response_mode"),false);
  } finally { await f.db.close(); }
});

test("selected privacy mode requires the live lease and precedes tools; private mode replays without exposing it",async()=>{
  const f=await fixture(51);
  try {
    const w=await world(f),other=await world(f,"Another private campaign");
    const input=await inputFor(f,w.cid);
    await begin(f,input,"unified-v1");
    const claim=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    const call={kind:"query",actorId:null,targetId:null,itemId:null,dc:null,scope:"current-public"};
    const result=astraToolResult(claim.source,input,call,[],[]);
    const lease={...claim.lease};
    delete lease.timeline;
    const tool={...lease,position:0,call,result};
    await assert.rejects(f.runtime(w.cid,"astra_tool",tool),/rpg_validation/);
    for(const payload of [
      {...lease,mode:"forged-mode"},
      {...lease,mode:"private-informed",token:randomUUID()},
      {...lease,mode:"private-informed",expectedRevision:input.expectedRevision+1},
    ]) await assert.rejects(f.runtime(w.cid,"astra_response_mode",payload),/rpg_validation/);
    await assert.rejects(pinMode(f,other.cid,claim.lease,"private-informed"),/rpg_validation|rpg_conflict/);
    assert.equal(await pinMode(f,w.cid,claim.lease,"private-informed"),"private-informed");
    const receipt=await f.runtime(w.cid,"astra_tool",tool);
    assert.deepEqual(await f.runtime(w.cid,"astra_tool",tool),receipt);
    assert.equal(await pinMode(f,w.cid,claim.lease,"private-informed"),"private-informed");
    await assert.rejects(pinMode(f,w.cid,claim.lease,"public-unified"),/rpg_conflict/);
    await f.runtime(w.cid,"fail",{...claim.lease,failure:"provider",retryable:true});
    const resumed=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.equal(resumed.astraResponseMode,"private-informed");
    assert.deepEqual(resumed.turn.checkpoint.astraPrimary.toolReceipts,[receipt]);
    const publicTurn=await f.runtime(w.cid,"get",{operationId:input.operationId});
    assert.equal(JSON.stringify(publicTurn).includes("private-informed"),false);
  } finally {await f.db.close();}
});

test("unified wrapper remains service-only with an inaccessible predecessor and scope fences",async()=>{
  const f=await fixture(51);
  try {
    const w=await world(f),other=await world(f,"Other private campaign");
    const input=await inputFor(f,w.cid);
    await begin(f,input,"unified-v1");
    assert.equal(await f.runtime(other.cid,"astra_contract",{operationId:input.operationId}),null);
    const privileges=await f.one(`select
      has_function_privilege('service_role','public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') allowed,
      has_function_privilege('service_role','public.rpg_runtime_before_astra_unified_contract(uuid,uuid,text,jsonb,jsonb)','EXECUTE') predecessor,
      has_function_privilege('anon','public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') anon,
      has_function_privilege('authenticated','public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') authenticated`);
    assert.deepEqual(privileges,{allowed:true,predecessor:false,anon:false,authenticated:false});
    await f.db.exec("set role service_role");
    const read=await f.runtime(w.cid,"get",{operationId:input.operationId});
    assert.equal(read.id,input.operationId);
    await assert.rejects(f.one("select public.rpg_runtime_before_astra_unified_contract($1,$2,'get',$3::jsonb,null)",[f.owner,w.cid,JSON.stringify({operationId:input.operationId})]),/permission denied/);
    await f.db.exec("reset role");
    await assert.rejects(f.runtime(w.cid,"begin",{...await inputFor(f,w.cid),serverRuntime:"astra-primary-v1",serverAstraContract:"invented"}),/rpg_validation/);
  } finally { await f.db.close(); }
});
