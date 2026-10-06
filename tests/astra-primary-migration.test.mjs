import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fixture, world, commitEvent } from "./phase35-storage-fixture.mjs";

const migration = new URL("../supabase/migrations/202610060038_astra_primary_runtime.sql", import.meta.url);
const inputFor = async (f, cid, text = "A bounded choice") => ({
  operationId: randomUUID(), campaignId: cid,
  expectedRevision: (await f.runtime(cid, "play")).revision,
  mode: "game", input: text, companionId: null, listenerIds: [], mechanic: null,
});
const row = (f, id) => f.one("select runtime_identity, status, checkpoint, input from rpg_private.turns where id=$1", [id]);
const failure = async (act, pattern = /rpg_(validation|conflict)/) =>
  assert.rejects(act, (error) => pattern.test(error.message));

test("migration 38 upgrades populated legacy turns and historical save without rewriting rows", async () => {
  const f = await fixture(37);
  try {
    const w = await world(f);
    const committed = await commitEvent(f, w);
    const pending = await inputFor(f, w.cid, "Pending before 38");
    await f.runtime(w.cid, "begin", pending);
    const wg = await world(f, "Generating campaign");
    const generating = await inputFor(f, wg.cid, "Generating before 38");
    await f.runtime(wg.cid, "begin", generating);
    await f.runtime(wg.cid, "claim", { operationId: generating.operationId });
    const wa = await world(f, "Awaiting campaign");
    const awaiting = await inputFor(f, wa.cid, "Awaiting before 38");
    await f.runtime(wa.cid, "begin", awaiting);
    await f.one("update rpg_private.turns set status='awaiting_confirmation' where id=$1", [awaiting.operationId]);
    const natural=[];
    for(const [name,key,value] of [
      ["Natural action","naturalMechanic",{schemaVersion:4,method:"improvise"}],
      ["Combat exchange","combatExchange",{schemaVersion:1,resumeOnly:true}],
      ["Natural combat turn","naturalCombatTurn",{schemaVersion:5}],
    ]){
      const wn=await world(f,`${name} checkpoint campaign`);
      const input=await inputFor(f,wn.cid,`${name} before 38`);
      await f.runtime(wn.cid,"begin",input);
      await f.one("update rpg_private.turns set checkpoint=checkpoint||$2::jsonb where id=$1",
        [input.operationId,JSON.stringify({[key]:value})]);
      natural.push(input.operationId);
    }
    const ids = [committed.input.operationId, pending.operationId,
      generating.operationId, awaiting.operationId, ...natural];
    const before = await f.query("select id,status,checkpoint,input,source from rpg_private.turns order by id");
    const save = await f.saves(w.cid, "create", await f.command(w.cid,
      { kind: "manual", name: "Before 38" }));
    const saved = save.snapshot.saves.find((v) => v.name === "Before 38");
    assert.ok(saved);
    const memoryBefore = await f.query("select p.proname,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname like 'memory_%' order by p.proname,p.oid");
    const triggerBefore = await f.query("select tgname,pg_get_triggerdef(oid) definition from pg_trigger where tgname like '%memory%' order by tgname");
    const guardNames=["rpg_runtime_phase2","rpg_runtime_wave3",
      "natural_mechanic_validate","natural_combat_validate",
      "natural_combat_turn_validate","world_validate_settlement"];
    const guards=()=>f.query("select n.nspname,p.proname,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.proname=any($1::text[]) order by n.nspname,p.proname",[guardNames]);
    const guardsBefore=await guards();
    const tables=await f.query("select schemaname,tablename from pg_tables where (schemaname='public' and tablename like 'rpg_%') or schemaname='rpg_private' order by schemaname,tablename");
    const fingerprints=async()=>{
      const result={};
      for(const {schemaname,tablename} of tables){
        assert.match(schemaname,/^[a-z_]+$/);assert.match(tablename,/^[a-z_]+$/);
        const shape=`${schemaname}.${tablename}`==="rpg_private.turns" ? "to_jsonb(t)-'runtime_identity'" : "to_jsonb(t)";
        result[`${schemaname}.${tablename}`]=await f.one(`select count(*)::integer n,md5(coalesce(jsonb_agg(${shape} order by (${shape})::text)::text,'[]')) fingerprint from ${schemaname}.${tablename} t`);
      }
      return result;
    };
    const fingerprintsBefore=await fingerprints();
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await fingerprints(),fingerprintsBefore);
    const after = await f.query("select id,status,checkpoint,input,source from rpg_private.turns order by id");
    assert.deepEqual(after, before);
    assert.deepEqual(await f.query("select p.proname,pg_get_functiondef(p.oid) definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='rpg_private' and p.proname like 'memory_%' order by p.proname,p.oid"), memoryBefore);
    assert.deepEqual(await f.query("select tgname,pg_get_triggerdef(oid) definition from pg_trigger where tgname like '%memory%' order by tgname"), triggerBefore);
    assert.deepEqual(await guards(),guardsBefore);
    for (const id of ids) assert.equal((await row(f, id)).runtime_identity, null);
    assert.equal((await f.runtime(w.cid, "claim", { operationId: pending.operationId })).runtimeIdentity, "legacy-v1");
    const legacyAfter=await world(f,"Legacy after 38");
    assert.equal((await commitEvent(f,legacyAfter)).result.status,"committed");
    const loaded = await f.saves(w.cid, "load", await f.command(w.cid,
      { saveId: saved.id, label: "Restored old save", recovery: false }));
    assert.ok(loaded.timelineId);
    assert.equal((await row(f, pending.operationId)).runtime_identity, null);
    assert.equal((await f.runtime(w.cid, "claim", { operationId: pending.operationId })).runtimeIdentity, "legacy-v1");
  } finally { await f.db.close(); }
});

test("Astra identity, append-only receipts and final proposal survive retry and reject altered commit", async () => {
  const f = await fixture(38);
  try {
    const w = await world(f);
    const hidden=(await f.mutation("entity.save",w.cid,{kind:"npc",
      name:"Unseen watcher",details:"Private location",hp:4,max_hp:4,
      stats:{},resources:{},conditions:[],equipment_slots:[]})).id;
    const input = { ...await inputFor(f, w.cid), serverRuntime: "astra-primary-v1" };
    await f.runtime(w.cid, "begin", input);
    await f.runtime(w.cid, "begin", input);
    await failure(() => f.runtime(w.cid, "begin", { ...input, serverRuntime: undefined }), /rpg_conflict/);
    await failure(() => f.runtime(w.cid, "begin", { ...input, input: "Different" }), /rpg_conflict/);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    assert.equal(claim.runtimeIdentity, "astra-primary-v1");
    const lease = { ...claim.lease }; delete lease.timeline;
    const call = { kind: "query", actorId: null, targetId: null, dc: null, itemId: null, scope: "current-public" };
    const query = { ...lease, position: 0, call,
      result: { kind: "query", stateRevision: input.expectedRevision,
        state: { worldMinutes:claim.source.runtime.worldMinutes,
          currentLocationId:claim.source.snapshot.publicState.current_location_id,
          entities:claim.source.snapshot.entities.filter((e)=>
            claim.source.runtime.configuration.presentEntityIds.includes(e.id))
            .map((e)=>({id:e.id,name:e.name,
            hp:e.hp,resources:e.resources})).sort((a,b)=>a.id.localeCompare(b.id)),
          items:claim.source.snapshot.items.map((i)=>({id:i.id,name:i.name,
            quantity:i.quantity})).sort((a,b)=>a.id.localeCompare(b.id)) } } };
    const receipt = await f.runtime(w.cid, "astra_tool", query);
    assert.equal(receipt.result.state.entities.some((e)=>e.id===hidden),false);
    assert.deepEqual(await f.runtime(w.cid, "astra_tool", query), receipt);
    await failure(() => f.runtime(w.cid, "astra_tool", { ...query, call: { ...call, scope: "other" } }), /rpg_conflict/);
    const resolution = { changes: [], worldMinutes: claim.source.runtime.worldMinutes,
      configuration: claim.source.runtime.configuration, outcomes: [] };
    const final = { schemaVersion: 1, campaignId: w.cid, operationId: input.operationId,
      expectedRevision: input.expectedRevision, input: input.input,
      resolution, privatePatches: [], toolRefs: [] };
    const checkpoint = { ...claim.turn.checkpoint,
      astraPrimary: { ...claim.turn.checkpoint.astraPrimary, toolReceipts: [receipt], finalProposal: final },
      resolution, narration: { narration: "The bridge is quiet.", visualDescription: "", clarification: null } };
    await f.runtime(w.cid, "checkpoint", { ...claim.lease, checkpoint, status: "generating" });
    await failure(() => f.runtime(w.cid, "checkpoint", { ...claim.lease,
      checkpoint: { ...checkpoint, astraPrimary: { ...checkpoint.astraPrimary,
        finalProposal: { ...final, privatePatches: [{ kind: "fact", key: "x", operation: "set", value: "y", amount: null }] } } },
      status: "generating" }), /rpg_validation/);
    const packet = { narration: "The bridge is quiet.", visualDescription: "",
      resolution, privatePatches: [], checks: [], guidanceProposal: null };
    await failure(() => f.runtime(w.cid, "commit", { ...claim.lease,
      packet: { ...packet, narration: "A changed outcome." } }), /rpg_validation/);
    assert.equal((await row(f, input.operationId)).status, "generating");
    assert.equal((await f.runtime(w.cid, "commit", { ...claim.lease, packet })).status, "committed");
    assert.equal((await f.runtime(w.cid, "get", { operationId: input.operationId })).astraPrimary, undefined);
  } finally { await f.db.close(); }
});

test("Astra attack and damage receipts authorize only exact HP and survive a save", async () => {
  const f = await fixture(38);
  try {
    const w = await world(f);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{attack}','2') where id=$1", [w.hero]);
    await f.one("update public.rpg_entities set stats=jsonb_set(stats,'{defense}','10') where id=$1", [w.npc]);
    const input = { ...await inputFor(f, w.cid, "Strike a present opponent"), serverRuntime: "astra-primary-v1" };
    await f.runtime(w.cid, "begin", input);
    const claim = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    const lease = { ...claim.lease }; delete lease.timeline;
    const attackCall = { kind: "attack", actorId: w.hero, targetId: w.npc,
      dc: null, itemId: null, scope: null };
    const checkId = (await f.one("select rpg_private.wave4_id($1,'check:0') id", [input.operationId])).id;
    const attack = await f.runtime(w.cid, "astra_tool", { ...lease, position: 0,
      call: attackCall, result: { index: 0, actorId: w.hero, targetId: w.npc,
        kind: "attack", stat: "attack", dc: 10, dcPublic: false,
        visibility: "player", important: true, uncertainty: "meaningful",
        advantage: "normal", id: checkId, dice: [17], kept: 17,
        modifier: 2, total: 19, success: true, rollNumber: 1 } });
    const damageCall = { kind: "damage", actorId: w.hero, targetId: w.npc,
      dc: null, itemId: null, scope: null };
    const damage = await f.runtime(w.cid, "astra_tool", { ...lease, position: 1,
      call: damageCall, result: { kind: "damage", actorId: w.hero, targetId: w.npc,
        itemId: null, dice: [2], modifier: 0, total: 2 } });
    await failure(() => f.runtime(w.cid, "astra_tool", { ...lease, position: 2,
      call: damageCall, result: { kind: "damage", actorId: w.hero, targetId: w.npc,
        itemId: null, dice: [2], modifier: 0, total: 2 } }), /rpg_validation/);
    const cp = (await row(f, input.operationId)).checkpoint;
    assert.deepEqual(cp.astraPrimary.toolReceipts, [attack, damage]);
    assert.equal(cp.checks.length, 1);
    const change = { family: "entities", id: w.npc, expectedRevision: 1, values: { hp: 3 } };
    const resolution = { changes: [change], worldMinutes: claim.source.runtime.worldMinutes,
      configuration: claim.source.runtime.configuration, outcomes: [] };
    const final = { schemaVersion: 1, campaignId: w.cid, operationId: input.operationId,
      expectedRevision: input.expectedRevision, input: input.input,
      resolution, privatePatches: [], toolRefs: [attack.id, damage.id] };
    await f.runtime(w.cid, "checkpoint", { ...lease, status: "generating",
      checkpoint: { ...cp, astraPrimary: { ...cp.astraPrimary, finalProposal: final },
        resolution, narration: { narration: "The strike lands.", visualDescription: "", clarification: null } } });
    const saved = await f.saves(w.cid, "create", await f.command(w.cid,
      { kind: "manual", name: "Astra pinned final" }));
    const save = saved.snapshot.saves.find((s) => s.name === "Astra pinned final");
    assert.ok(save);
    const packet = { narration: "The strike lands.", visualDescription: "",
      resolution, privatePatches: [], checks: cp.checks, guidanceProposal: null };
    await failure(() => f.runtime(w.cid, "commit", { ...lease, packet: {
      ...packet, resolution: { ...resolution, changes: [{ ...change, values: { hp: 1 } }] }
    } }), /rpg_validation/);
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1", [w.npc])).hp, 5);
    assert.equal((await f.runtime(w.cid, "commit", { ...lease, packet })).status, "committed");
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1", [w.npc])).hp, 3);
    const loaded = await f.saves(w.cid, "load", await f.command(w.cid,
      { saveId: save.id, label: "Astra receipt restore", recovery: false }));
    assert.ok(loaded.timelineId);
    const restored = await row(f, input.operationId);
    assert.equal(restored.runtime_identity, "astra-primary-v1");
    assert.deepEqual(restored.checkpoint.astraPrimary.toolReceipts, [attack, damage]);
    assert.deepEqual(restored.checkpoint.astraPrimary.finalProposal, final);
    const recovered = await f.runtime(w.cid, "claim", { operationId: input.operationId });
    assert.ok(recovered, "a saved pending Astra turn must resume on the new timeline");
    assert.equal(recovered.runtimeIdentity, "astra-primary-v1");
    const resumed = await f.runtime(w.cid, "commit", { ...recovered.lease, packet });
    assert.equal(resumed.status, "committed");
    assert.equal((await f.one("select hp from public.rpg_entities where id=$1", [w.npc])).hp, 3);
  } finally { await f.db.close(); }
});

test("Astra private receipt and final authority rejects cross-campaign and stale revision",async()=>{
  const f=await fixture(38);
  try {
    const a=await world(f,"Astra A"),b=await world(f,"Astra B");
    const input={...await inputFor(f,a.cid),serverRuntime:"astra-primary-v1"};
    await f.runtime(a.cid,"begin",input);
    const claim=await f.runtime(a.cid,"claim",{operationId:input.operationId});
    const lease={...claim.lease};delete lease.timeline;
    const call={kind:"query",actorId:null,targetId:null,dc:null,itemId:null,scope:"current-public"};
    const result={kind:"query",stateRevision:input.expectedRevision,state:{
      worldMinutes:claim.source.runtime.worldMinutes,
      currentLocationId:claim.source.snapshot.publicState.current_location_id,
      entities:claim.source.snapshot.entities.map((e)=>({id:e.id,name:e.name,hp:e.hp,
        resources:e.resources})).sort((x,y)=>x.id.localeCompare(y.id)),
      items:claim.source.snapshot.items.map((i)=>({id:i.id,name:i.name,
        quantity:i.quantity})).sort((x,y)=>x.id.localeCompare(y.id))}};
    await failure(()=>f.runtime(b.cid,"astra_tool",{...lease,campaignId:b.cid,
      position:0,call,result}),/rpg_not_found/);
    const foreignInput={...await inputFor(f,b.cid),serverRuntime:"astra-primary-v1"};
    await f.runtime(b.cid,"begin",foreignInput);
    const foreignClaim=await f.runtime(b.cid,"claim",{operationId:foreignInput.operationId});
    const foreignLease={...foreignClaim.lease};delete foreignLease.timeline;
    const foreignReceipt=await f.runtime(b.cid,"astra_tool",{...foreignLease,
      position:0,call,result:{...result,stateRevision:foreignInput.expectedRevision,
        state:{worldMinutes:foreignClaim.source.runtime.worldMinutes,
          currentLocationId:foreignClaim.source.snapshot.publicState.current_location_id,
          entities:foreignClaim.source.snapshot.entities.map((e)=>({id:e.id,name:e.name,
            hp:e.hp,resources:e.resources})).sort((x,y)=>x.id.localeCompare(y.id)),
          items:foreignClaim.source.snapshot.items.map((i)=>({id:i.id,name:i.name,
            quantity:i.quantity})).sort((x,y)=>x.id.localeCompare(y.id))}}});
    const final={schemaVersion:1,campaignId:b.cid,operationId:input.operationId,
      expectedRevision:input.expectedRevision,input:input.input,
      resolution:{changes:[],worldMinutes:0,
        configuration:claim.source.runtime.configuration,outcomes:[]},
      privatePatches:[],toolRefs:[]};
    await failure(()=>f.runtime(a.cid,"checkpoint",{...lease,status:"generating",
      checkpoint:{...claim.turn.checkpoint,astraPrimary:{...claim.turn.checkpoint.astraPrimary,
        finalProposal:final}}}),/rpg_validation/);
    await failure(()=>f.runtime(a.cid,"checkpoint",{...lease,status:"generating",
      checkpoint:{...claim.turn.checkpoint,astraPrimary:{...claim.turn.checkpoint.astraPrimary,
        finalProposal:{...final,campaignId:a.cid,toolRefs:[foreignReceipt.id]}}}}),/rpg_validation/);
    assert.equal((await row(f,input.operationId)).checkpoint.astraPrimary.finalProposal,null);
    await f.one("update rpg_private.runtime_state set revision=revision+1 where campaign_id=$1",[a.cid]);
    await failure(()=>f.runtime(a.cid,"astra_tool",{...lease,position:0,call,result}),/rpg_validation/);
    assert.equal((await row(f,input.operationId)).checkpoint.astraPrimary.toolReceipts.length,0);
    assert.equal((await row(f,input.operationId)).status,"pending");
  } finally {await f.db.close();}
});
