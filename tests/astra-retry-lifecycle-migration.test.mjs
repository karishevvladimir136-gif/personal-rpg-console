import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world } from "./phase35-storage-fixture.mjs";

const migration=new URL("../supabase/migrations/202610140050_astra_retry_lifecycle.sql",import.meta.url);
async function inputFor(f,cid,text="Synthetic retry") {
  const play=await f.runtime(cid,"play");
  return {operationId:randomUUID(),campaignId:cid,
    expectedRevision:play.revision,mode:"game",input:text,
    companionId:null,listenerIds:[],mechanic:null};
}
async function failed(f,input,runtime="astra-primary-v1",retryable=true) {
  await f.runtime(input.campaignId,"begin",runtime==="legacy-v1"?input:
    {...input,serverRuntime:runtime});
  const claim=await f.runtime(input.campaignId,"claim",{operationId:input.operationId});
  await f.runtime(input.campaignId,"fail",{...claim.lease,
    failure:retryable?"provider":"validation",retryable});
  return claim;
}

test("populated 49→50 upgrade preserves bytes, then only a valid Astra retry enters generating",async()=>{
  const f=await fixture(49);
  try {
    const w=await world(f);
    const created=await f.saves(w.cid,"create",await f.command(w.cid,
      {kind:"manual",name:"Before Astra retry upgrade"}));
    const save=created.snapshot.saves.find((entry)=>entry.name==="Before Astra retry upgrade");
    assert.ok(save);
    const manifestBefore=await f.one(`select md5(to_jsonb(m)::text) fingerprint
      from rpg_private.save_points p join rpg_private.timeline_manifests m
        on m.campaign_id=p.campaign_id and m.id=p.manifest_id
      where p.campaign_id=$1 and p.id=$2`,[w.cid,save.id]);
    assert.ok(manifestBefore?.fingerprint);
    const input=await inputFor(f,w.cid);
    const claim=await failed(f,input);
    const failureDiagnostic={stage:"plan",phase:"failed",providerResponseReceived:false,
      narrationParseSucceeded:false,failureCategory:"provider"};
    await f.one("update rpg_private.turns set astra_diagnostic=$2::jsonb where id=$1",
      [input.operationId,JSON.stringify(failureDiagnostic)]);
    const before=await f.one(`select to_jsonb(t) data,
      md5(to_jsonb(t)::text) fingerprint from rpg_private.turns t where id=$1`,
      [input.operationId]);
    const stateBefore=await f.one(`select md5(to_jsonb(r)::text) fingerprint
      from rpg_private.runtime_state r where campaign_id=$1`,[w.cid]);
    assert.equal(before.data.status,"failed");
    assert.equal(before.data.retryable,true);
    assert.ok(before.data.source);
    assert.ok(before.data.checkpoint.astraPrimary);
    await f.db.exec(await readFile(migration,"utf8"));
    const afterUpgrade=await f.one(`select md5(to_jsonb(t)::text) fingerprint
      from rpg_private.turns t where id=$1`,[input.operationId]);
    assert.deepEqual(afterUpgrade.fingerprint,before.fingerprint);
    assert.deepEqual(await f.one(`select md5(to_jsonb(r)::text) fingerprint
      from rpg_private.runtime_state r where campaign_id=$1`,[w.cid]),stateBefore);
    const manifestAfter=await f.one(`select md5(to_jsonb(m)::text) fingerprint
      from rpg_private.save_points p join rpg_private.timeline_manifests m
        on m.campaign_id=p.campaign_id and m.id=p.manifest_id
      where p.campaign_id=$1 and p.id=$2`,[w.cid,save.id]);
    assert.ok(manifestAfter?.fingerprint);
    assert.deepEqual(manifestAfter,manifestBefore);
    const resumed=await f.runtime(w.cid,"claim",{operationId:input.operationId});
    assert.equal(resumed.turn.public.status,"generating");
    assert.equal(resumed.lease.operationId,input.operationId);
    assert.notEqual(resumed.lease.token,claim.lease.token);
    assert.deepEqual(resumed.source,before.data.source);
    assert.deepEqual(resumed.turn.checkpoint,before.data.checkpoint);
    const row=await f.one(`select status,failure,retryable,expected_revision,
      committed_revision,source,checkpoint,astra_diagnostic from rpg_private.turns
      where id=$1`,[input.operationId]);
    assert.equal(row.status,"generating");
    assert.equal(row.failure,null);
    assert.equal(row.retryable,false);
    assert.equal(row.expected_revision,input.expectedRevision);
    assert.equal(row.committed_revision,null);
    assert.equal(row.astra_diagnostic,null);
    assert.deepEqual(row.source,before.data.source);
    assert.deepEqual(row.checkpoint,before.data.checkpoint);
    assert.equal((await f.one("select count(*)::integer n from rpg_private.runtime_events where operation_id=$1",
      [input.operationId])).n,0);
  } finally {await f.db.close();}
});

test("migration 50 leaves legacy, nonretryable, leased and wrong-timeline claims fenced",async()=>{
  const f=await fixture(50);
  try {
    const legacy=await world(f,"Legacy retry guard");
    const legacyInput=await inputFor(f,legacy.cid);
    await failed(f,legacyInput,"legacy-v1");
    // The fixture's global opt-in starts game turns as Astra. Pin this
    // disposable row to the historical legacy identity for the guard check.
    await f.one("update rpg_private.turns set runtime_identity=null where id=$1",
      [legacyInput.operationId]);
    const legacyClaim=await f.runtime(legacy.cid,"claim",{operationId:legacyInput.operationId});
    assert.equal(legacyClaim.turn.public.status,"failed");
    assert.equal((await f.one("select status from rpg_private.turns where id=$1",
      [legacyInput.operationId])).status,"failed");

    const nonretryable=await world(f,"Nonretryable guard");
    const noInput=await inputFor(f,nonretryable.cid);
    await failed(f,noInput,"astra-primary-v1",false);
    assert.equal(await f.runtime(nonretryable.cid,"claim",{operationId:noInput.operationId}),null);
    assert.equal((await f.one("select status from rpg_private.turns where id=$1",
      [noInput.operationId])).status,"failed");

    const leased=await world(f,"Live lease guard");
    const leasedInput=await inputFor(f,leased.cid);
    await failed(f,leasedInput);
    await f.one("update rpg_private.turns set lease_until=now()+interval '5 minutes' where id=$1",
      [leasedInput.operationId]);
    assert.equal(await f.runtime(leased.cid,"claim",{operationId:leasedInput.operationId}),null);
    assert.equal((await f.one("select status from rpg_private.turns where id=$1",
      [leasedInput.operationId])).status,"failed");

    const fenced=await world(f,"Timeline guard");
    const fencedInput=await inputFor(f,fenced.cid);
    await failed(f,fencedInput);
    const valid=await f.fence(fenced.cid);
    await assert.rejects(f.runtime(fenced.cid,"claim",{operationId:fencedInput.operationId},
      {...valid,generation:valid.generation+1}));
    assert.equal((await f.one("select status from rpg_private.turns where id=$1",
      [fencedInput.operationId])).status,"failed");
  } finally {await f.db.close();}
});

test("only service_role can execute the wrapper; no caller can bypass it through the predecessor",async()=>{
  const f=await fixture(50);
  try {
    const w=await world(f,"Retry function privilege guard");
    const input=await inputFor(f,w.cid);
    await failed(f,input);
    const pinned=await f.one(`select source,checkpoint from rpg_private.turns
      where campaign_id=$1 and id=$2`,[w.cid,input.operationId]);
    const fence=await f.fence(w.cid);
    await f.db.exec("create role retry_acl_probe");
    const acl=await f.one(`select
      has_function_privilege('service_role',
        'public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') wrapper_service,
      has_function_privilege('service_role',
        'public.rpg_runtime_before_astra_retry_lifecycle(uuid,uuid,text,jsonb,jsonb)',
        'EXECUTE') predecessor_service,
      has_function_privilege('retry_acl_probe',
        'public.rpg_runtime(uuid,uuid,text,jsonb,jsonb)','EXECUTE') wrapper_public,
      has_function_privilege('retry_acl_probe',
        'public.rpg_runtime_before_astra_retry_lifecycle(uuid,uuid,text,jsonb,jsonb)',
        'EXECUTE') predecessor_public`);
    assert.equal(acl.wrapper_service,true);
    assert.equal(acl.predecessor_service,false);
    assert.equal(acl.wrapper_public,false);
    assert.equal(acl.predecessor_public,false);

    const args=[f.owner,w.cid,"get",JSON.stringify({operationId:input.operationId}),
      JSON.stringify(fence)];
    const wrapper=`select public.rpg_runtime($1,$2,$3,$4::jsonb,$5::jsonb) result`;
    const predecessor=`select public.rpg_runtime_before_astra_retry_lifecycle(
      $1,$2,$3,$4::jsonb,$5::jsonb) result`;
    async function underRole(role,run) {
      await f.db.exec(`set role ${role}`);
      try {return await run();}
      finally {await f.db.exec("reset role");}
    }
    for(const role of ["anon","authenticated","retry_acl_probe"]){
      await underRole(role,async()=>{
        await assert.rejects(f.one(wrapper,args),(error)=>error.code==="42501");
        await assert.rejects(f.one(predecessor,args),(error)=>error.code==="42501");
      });
    }
    await underRole("service_role",async()=>{
      await assert.rejects(f.one(predecessor,args),(error)=>error.code==="42501");
      const get=await f.one(wrapper,args);
      assert.equal(get.result.status,"failed");
      const claimed=await f.one(wrapper,[f.owner,w.cid,"claim",
        JSON.stringify({operationId:input.operationId}),JSON.stringify(fence)]);
      assert.equal(claimed.result.turn.public.status,"generating");
      assert.deepEqual(claimed.result.source,pinned.source);
      assert.deepEqual(claimed.result.turn.checkpoint,pinned.checkpoint);
    });
    const row=await f.one(`select status,source,checkpoint from rpg_private.turns
      where campaign_id=$1 and id=$2`,[w.cid,input.operationId]);
    assert.equal(row.status,"generating");
    assert.deepEqual(row.source,pinned.source);
    assert.deepEqual(row.checkpoint,pinned.checkpoint);
  } finally {await f.db.close();}
});
