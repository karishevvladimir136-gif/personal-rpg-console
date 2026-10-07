import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { runAstraTurn, selectAstraPrimaryRuntime } from "../src/lib/gameplay/astra-primary.ts";
import { runTurn } from "../src/lib/gameplay/turn-engine.ts";

async function takeoverFixture() {
  const f = await setup(undefined, "en", 39);
  await f.create();
  await f.startOpening();
  const foundation = await f.one(
    "select world from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
  const hero = foundation.world.actors.find((actor) => actor.control === "player").entityId;
  const config = {
    profile: "console-basic-v1", controlledEntityIds: [hero],
    presentEntityIds: foundation.world.actors.map((actor) => actor.entityId),
    nearbyStorageIds: [], safeLocationIds: [], itemRules: [],
  };
  const play = await f.runtime(f.cid, "play");
  await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
    expectedRevision: play.revision, configuration: config });
  async function command(overrides = {}) {
    const timeline = await f.fence(f.cid);
    const row = await f.one(`select r.revision runtime_revision,
      p.revision public_revision, w.revision world_revision,
      encode(sha256(convert_to(w.world::text,'UTF8')),'hex') world_digest,
      t.head_manifest_id head_id,
      (select coalesce(max(sequence),0) from rpg_private.world_events
        where campaign_id=r.campaign_id) world_event_sequence
      from rpg_private.runtime_state r
      join public.rpg_public_state p using(campaign_id)
      join rpg_private.world_foundations w using(campaign_id)
      join rpg_private.timeline_campaigns c using(campaign_id)
      join rpg_private.timelines t on t.id=c.active_timeline_id
      where r.campaign_id=$1`, [f.cid]);
    return { requestId: randomUUID(), campaignId: f.cid, timeline,
      expectedRuntimeRevision: row.runtime_revision,
      expectedWorldRevision: row.world_revision,
      expectedPublicRevision: row.public_revision,
      expectedHeadId: row.head_id,
      expectedWorldDigest: row.world_digest,
      expectedWorldEventSequence: row.world_event_sequence,
      ...overrides };
  }
  return { f, hero, command };
}

test("populated migration 38 to 39 preserves existing rows and old save routing", async () => {
  const f = await setup(undefined, "en", 38);
  try {
    await f.create();
    await f.startOpening();
    const old = await f.saves(f.cid, "create", await f.command(f.cid,
      { kind: "manual", name: "Before migration 39" }));
    const oldSave = old.snapshot.saves.find((s) => s.name === "Before migration 39");
    const tables = await f.query(`select schemaname,tablename from pg_tables
      where (schemaname='public' and tablename like 'rpg_%') or
        schemaname='rpg_private' order by schemaname,tablename`);
    async function fingerprint() {
      const result = {};
      for (const { schemaname, tablename } of tables) {
        assert.match(schemaname, /^[a-z_]+$/);
        assert.match(tablename, /^[a-z_]+$/);
        const shape = `${schemaname}.${tablename}` === "rpg_private.world_foundations"
          ? "to_jsonb(t)-'astra_takeover'" : "to_jsonb(t)";
        result[`${schemaname}.${tablename}`] = await f.one(
          `select count(*)::integer n,md5(coalesce(jsonb_agg(${shape} order by (${shape})::text)::text,'[]')) digest from ${schemaname}.${tablename} t`);
      }
      return result;
    }
    const before = await fingerprint();
    await f.db.exec(await readFile(new URL(
      "../supabase/migrations/202610060039_astra_world_logic_takeover.sql",
      import.meta.url), "utf8"));
    assert.deepEqual(await fingerprint(), before);
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: oldSave.id, label: "Old save after 39", recovery: false }));
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    assert.equal((await f.one("select astra_takeover from rpg_private.world_foundations where campaign_id=$1",
      [f.cid])).astra_takeover, null);
  } finally { await f.db.close(); }
});

test("clean World Logic handoff creates paired save boundary and pins only new turns", async () => {
  const { f, command } = await takeoverFixture();
  try {
    const payload = await command();
    const result = await f.runtime(f.cid, "astra_takeover", payload);
    assert.equal(result.status, "activated");
    assert.ok(result.beforeSaveId);
    assert.ok(result.afterSaveId);
    assert.equal((await f.runtime(f.cid, "astra_takeover", payload)).status,
      "already_active");
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, true);
    const grants = await f.one(`select
      has_function_privilege('authenticated',
        'rpg_private.astra_takeover_context(uuid,jsonb)','EXECUTE') private_context,
      has_function_privilege('authenticated',
        'rpg_private.astra_takeover_active(uuid)','EXECUTE') private_marker`);
    assert.deepEqual(grants, { private_context: false, private_marker: false });
    const publicPlay = await f.runtime(f.cid, "play");
    assert.doesNotMatch(JSON.stringify(publicPlay), /astra_takeover|worldTakeover|beforeSaveId/);
    const publicWorld = await f.one("select public.rpg_world($1,$2,'read','{}'::jsonb,$3::jsonb) result",
      [f.owner, f.cid, JSON.stringify(await f.fence(f.cid))]);
    assert.doesNotMatch(JSON.stringify(publicWorld.result), /astra_takeover|worldTakeover|beforeSaveId/);
    const input = { operationId: randomUUID(), campaignId: f.cid,
      expectedRevision: (await f.runtime(f.cid, "play")).revision,
      mode: "game", input: "I look around.", companionId: null,
      listenerIds: [], mechanic: null, serverRuntime: "astra-primary-v1" };
    await f.runtime(f.cid, "begin", input);
    const row = await f.one("select runtime_identity from rpg_private.turns where id=$1", [input.operationId]);
    assert.equal(row.runtime_identity, "astra-primary-v1");
    const claim = await f.runtime(f.cid, "claim", { operationId: input.operationId });
    assert.equal(claim.source.worldTakeover.schemaVersion, 1);
  } finally { await f.db.close(); }
});

test("takeover rejects stale and cross-campaign authority without changing rows", async () => {
  const { f, command } = await takeoverFixture();
  try {
    const valid = await command();
    const stale = [
      { expectedRuntimeRevision: valid.expectedRuntimeRevision + 1 },
      { expectedWorldRevision: valid.expectedWorldRevision + 1 },
      { expectedPublicRevision: valid.expectedPublicRevision + 1 },
      { expectedHeadId: randomUUID() },
      { expectedWorldDigest: "0".repeat(64) },
      { expectedWorldEventSequence: valid.expectedWorldEventSequence + 1 },
      { campaignId: randomUUID() },
      { timeline: { ...valid.timeline, epoch: valid.timeline.epoch + 1 } },
    ];
    const before = await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]);
    for (const altered of stale) {
      await assert.rejects(async () => f.runtime(f.cid, "astra_takeover",
        { ...valid, ...altered }), /rpg_/);
      assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    }
    assert.deepEqual(await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]), before);
  } finally { await f.db.close(); }
});

test("unfinished and retryable legacy turns block takeover without changing gameplay", async () => {
  const { f, command } = await takeoverFixture();
  try {
    const input = { operationId: randomUUID(), campaignId: f.cid,
      expectedRevision: (await f.runtime(f.cid, "play")).revision,
      mode: "game", input: "Unfinished old turn", companionId: null,
      listenerIds: [], mechanic: null };
    await f.runtime(f.cid, "begin", input);
    const valid = await command();
    const before = await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]);
    for (const [status, retryable] of [["pending", false], ["generating", false],
      ["awaiting_confirmation", false], ["failed", true]]) {
      await f.one("update rpg_private.turns set status=$2,retryable=$3,lease_until=null where id=$1",
        [input.operationId, status, retryable]);
      await assert.rejects(async () => f.runtime(f.cid, "astra_takeover", valid),
        /rpg_validation/);
      assert.deepEqual(await f.one(`select
        (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
        (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
        (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]), before);
    }
    await f.one("update rpg_private.turns set status='cancelled',retryable=false where id=$1",
      [input.operationId]);
    assert.equal((await f.runtime(f.cid, "astra_takeover", valid)).status, "activated");
    assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1",
      [input.operationId])).runtime_identity, null);
  } finally { await f.db.close(); }
});

test("public and World protagonist Location disagreement rejects takeover atomically", async () => {
  const { f, command } = await takeoverFixture();
  try {
    const destination = (await f.mutation("location.save", f.cid,
      { name: "Other known place", description: "A place", status: "known" })).id;
    await f.one("update public.rpg_public_state set current_location_id=$2,revision=revision+1 where campaign_id=$1",
      [f.cid, destination]);
    const valid = await command();
    const before = await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select to_jsonb(p) from public.rpg_public_state p where campaign_id=$1) state,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]);
    await assert.rejects(async () => f.runtime(f.cid, "astra_takeover", valid),
      /rpg_validation/);
    assert.deepEqual(await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select to_jsonb(p) from public.rpg_public_state p where campaign_id=$1) state,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]), before);
  } finally { await f.db.close(); }
});

test("pre and post handoff saves restore their own routing on separate playable forks", async () => {
  const { f, command } = await takeoverFixture();
  try {
    const result = await f.runtime(f.cid, "astra_takeover", await command());
    const before = await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: result.beforeSaveId, label: "Legacy fork", recovery: false }));
    assert.ok(before.timelineId);
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    const legacyInput = { operationId: randomUUID(), campaignId: f.cid,
      expectedRevision: (await f.runtime(f.cid, "play")).revision,
      mode: "game", input: "Legacy branch", companionId: null,
      listenerIds: [], mechanic: null };
    await f.runtime(f.cid, "begin", legacyInput);
    assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1",
      [legacyInput.operationId])).runtime_identity, null);
    await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: result.afterSaveId, label: "Astra fork", recovery: false }));
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, true);
    const astraInput = { ...legacyInput, operationId: randomUUID(),
      expectedRevision: (await f.runtime(f.cid, "play")).revision,
      input: "Astra branch", serverRuntime: "astra-primary-v1" };
    await f.runtime(f.cid, "begin", astraInput);
    assert.equal((await f.one("select runtime_identity from rpg_private.turns where id=$1",
      [astraInput.operationId])).runtime_identity, "astra-primary-v1");
  } finally { await f.db.close(); }
});

test("Astra travel uses public Location authority and saved World Lab projection", async () => {
  const { f, command, hero } = await takeoverFixture();
  try {
    const destination = (await f.mutation("location.save", f.cid,
      { name: "Known ridge", description: "A known path", status: "known" })).id;
    const worldRow = await f.one("select world from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
    const actor = worldRow.world.actors.find((a) => a.entityId === hero);
    const origin = actor.locationId;
    actor.capabilities.push(`world.travel:${origin}:${destination}`);
    await f.one("update rpg_private.world_foundations set world=$2::jsonb,revision=revision+1 where campaign_id=$1",
      [f.cid, JSON.stringify(worldRow.world)]);
    await f.one("update public.rpg_entities set resources='{\"focus\":2}'::jsonb,revision=revision+1 where id=$1",
      [hero]);
    const consumable = await f.one("select id from public.rpg_items where campaign_id=$1 and owner_entity_id=$2 limit 1",
      [f.cid, hero]);
    assert.ok(consumable?.id);
    const takeover = await f.runtime(f.cid, "astra_takeover", await command());
    const errors = [];
    const runtimeRpc = async (args) => {
      try { return { data: await f.runtime(args.p_campaign_id, args.p_action,
        args.p_payload, args.p_timeline) }; }
      catch (error) { errors.push({ action: args.p_action, message: error.message,
        where: error.where }); return { error: { message: error.message, code: error.code } }; }
    };
    const memoryRpc = async (args) => {
      try { return { data: await f.memory(args.p_campaign_id, args.p_action,
        args.p_payload, args.p_timeline) }; }
      catch (error) { return { error: { message: error.message, code: error.code } }; }
    };
    const fence = await f.fence(f.cid);
    const store = createRpcTurnStore(f.owner, runtimeRpc, "gpt-6-astra", fence);
    const memory = createRpcMemoryStore(f.owner, memoryRpc, fence);
    assert.equal(selectAstraPrimaryRuntime(null, true, "game", "world-logic-v1",
      (await store.takeoverStatus(f.cid)).active), true);
    const play = await store.readPlay(f.cid);
    const input = { operationId: randomUUID(), campaignId: f.cid,
      timeline: play.timeline, expectedRevision: play.revision, mode: "game",
      input: "Go to the known ridge", companionId: null, listenerIds: [], mechanic: null };
    const usage = { model: "fake", inputTokens: 0, outputTokens: 0, calls: 1, latencyMs: 0 };
    const provider = {
      next: async (context, _input, _receipts, _checks, caps, source) => {
        assert.deepEqual(caps.locationIds, [destination]);
        assert.ok(caps.itemIds.includes(consumable.id));
        assert.equal(JSON.parse(context.input).mandatory.worldTakeover.schemaVersion, 1);
        assert.equal(source.worldTakeover.actors.length, 2);
        const travel = { changes: [{ family: "public_state", id: f.cid,
          expectedRevision: source.snapshot.publicState.revision,
          values: { current_location_id: destination } }],
          configuration: source.runtime.configuration };
        assert.equal((await f.one(`select rpg_private.astra_takeover_resolution_configuration
          ($1,$2::jsonb,$3::jsonb) allowed`,
        [f.cid, JSON.stringify(source), JSON.stringify(travel)])).allowed, false);
        travel.configuration = { ...source.runtime.configuration,
          presentEntityIds: source.runtime.configuration.controlledEntityIds };
        assert.equal((await f.one(`select rpg_private.astra_takeover_resolution_configuration
          ($1,$2::jsonb,$3::jsonb) allowed`,
        [f.cid, JSON.stringify(source), JSON.stringify(travel)])).allowed, true);
        return { usage, output: { type: "final", call: null, final: {
          worldMinutes: source.runtime.worldMinutes + 10,
          changes: [{ family: "entities", id: hero,
            expectedRevision: source.snapshot.entities.find((e) => e.id === hero).revision,
            values: { resources: { focus: 1 } } },
          { family: "items", id: consumable.id,
            expectedRevision: source.snapshot.items.find((i) => i.id === consumable.id).revision,
            values: { quantity: 0 } },
          { family: "public_state", id: f.cid,
            expectedRevision: source.snapshot.publicState.revision,
            values: { current_location_id: destination } }],
          outcomes: [], privatePatches: [],
        } } };
      },
      narrate: async (context) => {
        assert.equal(context.input.includes("worldTakeover"), false);
        return { usage, output: { narration: "The ridge comes into view.",
          visualDescription: "", clarification: null } };
      },
    };
    const turn = await runAstraTurn(input, { store, memory,
      summaries: { summarize: () => assert.fail("no summary provider") }, provider });
    assert.equal(turn.status, "committed", JSON.stringify(errors));
    assert.equal((await f.one("select current_location_id from public.rpg_public_state where campaign_id=$1",
      [f.cid])).current_location_id, destination);
    assert.equal((await f.one("select resources->>'focus' value from public.rpg_entities where id=$1",
      [hero])).value, "1");
    assert.equal((await f.one("select quantity from public.rpg_items where id=$1",
      [consumable.id])).quantity, 0);
    assert.deepEqual((await f.one("select configuration from rpg_private.runtime_state where campaign_id=$1",
      [f.cid])).configuration.presentEntityIds, [hero]);
    assert.equal((await f.one("select world->'actors'->0->>'locationId' old from rpg_private.world_foundations where campaign_id=$1",
      [f.cid])).old, origin);
    await assert.rejects(async () => f.one(
      "update rpg_private.world_foundations set world=jsonb_set(world,'{policy,autonomy}','\"high\"'::jsonb) where campaign_id=$1",
      [f.cid]), /rpg_conflict/);
    await assert.rejects(async () => f.one(
      "insert into rpg_private.world_events(id,campaign_id,operation_id,event) values($1,$2,$3,'{}'::jsonb)",
      [randomUUID(), f.cid, randomUUID()]), /rpg_conflict/);
    const liveWorld = (await f.one("select public.rpg_world($1,$2,'read','{}'::jsonb,$3::jsonb) result",
      [f.owner, f.cid, JSON.stringify(await f.fence(f.cid))])).result;
    assert.equal(liveWorld.world.actors.find((a) => a.entityId === hero).locationId,
      destination);
    const save = await f.saves(f.cid, "create", await f.command(f.cid,
      { kind: "manual", name: "Post travel" }));
    const saved = save.snapshot.saves.find((s) => s.name === "Post travel");
    const labCatalog = (await f.one(`select public.rpg_world_lab($1,$2,'catalog',
      '{}'::jsonb) result`, [f.owner, f.cid])).result;
    assert.ok(labCatalog.bases.some((base) => base.saveId === takeover.beforeSaveId));
    assert.ok(labCatalog.bases.some((base) => base.saveId === saved.id));
    const manifest = await f.one("select manifest_id from rpg_private.save_points where id=$1",
      [saved.id]);
    const projected = await f.one("select rpg_private.lab_rows($1,$2,'rpg_private.world_foundations') rows",
      [f.cid, manifest.manifest_id]);
    assert.equal(projected.rows[0].world.actors.find((a) => a.entityId === hero).locationId,
      destination);
    assert.equal(projected.rows[0].world.actors.find((a) => a.entityId === hero).revision,
      actor.revision + 1);
    const lab = await f.one("select rpg_private.lab_composition_base($1,$2,$3) base",
      [f.owner, f.cid, saved.id]);
    assert.equal(lab.base.state.manifest.id, manifest.manifest_id);
    const detachedId = randomUUID();
    const base = await f.one("select * from rpg_private.timeline_manifests where id=$1",
      [manifest.manifest_id]);
    await f.one("insert into rpg_private.timelines(id,campaign_id,label,parent_timeline_id,fork_save_id,purpose) values($1,$2,'Disposable World Lab',$3,$4,'simulation')",
      [detachedId, f.cid, base.timeline_id, saved.id]);
    const refs = (await f.one("select rpg_private.astra_takeover_lab_refs($1,m,$2) refs from rpg_private.timeline_manifests m where m.id=$3",
      [f.cid, detachedId, manifest.manifest_id])).refs;
    assert.notDeepEqual(refs["rpg_private.world_foundations"],
      base.refs["rpg_private.world_foundations"]);
    const detachedWorld = await f.one("select payload from rpg_private.timeline_versions where id=$1",
      [refs["rpg_private.world_foundations"][0]]);
    assert.equal(detachedWorld.payload.world.actors.find((a) => a.entityId === hero).locationId,
      destination);
    assert.equal(detachedWorld.payload.world.actors.find((a) => a.entityId === hero).revision,
      actor.revision + 1);
    assert.equal((await f.one("select refs from rpg_private.timeline_manifests where id=$1",
      [manifest.manifest_id])).refs["rpg_private.world_foundations"][0],
      base.refs["rpg_private.world_foundations"][0]);
    for (const functionName of ["public.rpg_world_lab", "rpg_private.lab_rpc_before_continuation"])
      assert.match((await f.one(`select pg_get_functiondef('${functionName}(uuid,uuid,text,jsonb)'::regprocedure) definition`)).definition,
        /astra_takeover_lab_refs\(cid,\s*base,\s*tid\)/);
    const nextPlay = await store.readPlay(f.cid);
    let queried = false;
    const queryInput = { ...input, operationId: randomUUID(),
      expectedRevision: nextPlay.revision, input: "What is here now?" };
    const queryProvider = {
      next: async (context, _input, receipts, _checks, caps) => {
        assert.deepEqual(caps.entityIds, [hero]);
        assert.equal(JSON.parse(context.input).mandatory.worldTakeover.actors.length, 1);
        if (!receipts.length) return { usage, output: { type: "tool", final: null,
          call: { kind: "query", actorId: null, targetId: null, dc: null,
            itemId: null, scope: "current-public" } } };
        queried = true;
        assert.deepEqual(receipts[0].result.state.entities.map((e) => e.id), [hero]);
        return { usage, output: { type: "final", call: null, final: {
          worldMinutes: nextPlay.worldMinutes, changes: [], outcomes: [],
          privatePatches: [] } } };
      },
      narrate: provider.narrate,
    };
    assert.equal((await runAstraTurn(queryInput, { store, memory,
      summaries: { summarize: () => assert.fail("no summary provider") },
      provider: queryProvider })).status, "committed", JSON.stringify(errors));
    assert.equal(queried, true);
    assert.equal(takeover.status, "activated");
  } finally { await f.db.close(); }
});

test("round-11 encounter blocks takeover atomically until a legitimate legacy end", async () => {
  const { f, command, hero } = await takeoverFixture();
  try {
    const encounterId = randomUUID(), participantId = randomUUID();
    const settings = (await f.one("select max(revision) revision from public.rpg_settings_revisions where campaign_id=$1", [f.cid])).revision;
    await f.one("insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary) values($1,$2,'active',11,$3,'Synthetic round eleven')",
      [encounterId, f.cid, settings]);
    await f.one("insert into public.rpg_encounter_participants(id,campaign_id,encounter_id,entity_id,public_name,turn_order,public_position,public_resources) values($1,$2,$3,$4,'Synthetic hero',0,$5::jsonb,$6::jsonb)",
      [participantId, f.cid, encounterId, hero,
        JSON.stringify({ position: "nearby" }),
        JSON.stringify({ action: 1, move: 1, reaction: 1, active: true,
          defending: false, withdrawn: false })]);
    const before = await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select to_jsonb(e) from public.rpg_encounters e where id=$2) encounter,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`,
      [f.cid, encounterId]);
    await assert.rejects(async () => f.runtime(f.cid, "astra_takeover", await command()),
      /rpg_validation/);
    const after = await f.one(`select
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select to_jsonb(e) from public.rpg_encounters e where id=$2) encounter,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`,
      [f.cid, encounterId]);
    assert.deepEqual(after, before);
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    const errors = [];
    const rpc = async (args) => {
      try { return { data: await f.runtime(args.p_campaign_id, args.p_action,
        args.p_payload, args.p_timeline) }; }
      catch (error) { errors.push({ action: args.p_action, message: error.message });
        return { error: { message: error.message, code: error.code } }; }
    };
    const store = createRpcTurnStore(f.owner, rpc, "fake", await f.fence(f.cid));
    const play = await store.readPlay(f.cid);
    const input = { operationId: randomUUID(), campaignId: f.cid,
      timeline: play.timeline, expectedRevision: play.revision,
      mode: "mechanic", input: "We negotiate a peaceful end.",
      companionId: null, listenerIds: [], mechanic: { kind: "encounter.end",
        outcome: "negotiation" } };
    const usage = { model: "fake", inputTokens: 0, outputTokens: 0,
      calls: 1, latencyMs: 0 };
    const result = await runTurn(input, { store, provider: {
      plan: () => assert.fail("mechanic plan is deterministic"),
      feedback: () => assert.fail("no feedback"),
      narrate: async () => ({ usage, output: { narration: "Both sides stand down.",
        visualDescription: "", clarification: null } }),
    } });
    assert.equal(result.status, "committed", JSON.stringify(errors));
    assert.equal((await f.one("select status from public.rpg_encounters where id=$1",
      [encounterId])).status, "ended");
    const pendingId = randomUUID();
    await f.one(`insert into public.rpg_pending_actions
      (id,campaign_id,encounter_id,participant_id,status,public_proposal)
      values($1,$2,$3,$4,'proposed','{}'::jsonb)`,
      [pendingId, f.cid, encounterId, participantId]);
    await assert.rejects(async () => f.runtime(f.cid, "astra_takeover", await command()),
      /rpg_validation/);
    await f.one("update public.rpg_pending_actions set status='resolved' where id=$1",
      [pendingId]);
    const activated = await f.runtime(f.cid, "astra_takeover", await command());
    assert.equal(activated.status, "activated");
  } finally { await f.db.close(); }
});
