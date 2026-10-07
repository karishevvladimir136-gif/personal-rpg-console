import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup, examples } from "./universal-bootstrap-fixture.mjs";

const sheet = {
  schemaVersion: 1, mode: "structured_rpg", role: "Scout",
  background: "A traveler familiar with ordinary roads.", level: null,
  tier: null, attributes: { strength: 11, dexterity: 14,
    constitution: 12, intelligence: 10, wisdom: 13, charisma: 9 },
  skills: ["Tracking"], abilities: ["Careful observation"],
  limitations: ["No spellcasting"], spells: [],
};

async function modern() {
  const f = await setup({ ...examples.fantasy,
    description: "A human scout with tracking skill and a simple sword. I cannot cast spells.",
    caps: ["tracking skill"], limits: ["cannot cast spells"], item: "simple sword" }, "en", 43);
  f.creation = { ...f.creation, schemaVersion: 2, sheet,
    equipmentProfile: "standard_humanoid",
    mechanics: { hp: 10, attack: 1, defense: 11, skill: 2,
      weaponName: "simple sword", weaponDamage: 3 } };
  return f;
}

async function marker(f) {
  return (await f.one(`select astra_takeover from rpg_private.world_foundations
    where campaign_id=$1`, [f.cid])).astra_takeover;
}

async function openingStatus(f, timeline) {
  return f.rpc("astra_first_status", f.cid,
    { timeline: timeline ?? await f.fence(f.cid) });
}

test("populated 42 to 43 is additive and keeps legacy and narrative opening behavior", async () => {
  const f = await setup(examples.fantasy, "en", 42);
  try {
    await f.create();
    const before = await f.one(`select
      (select count(*)::integer from public.rpg_campaigns) campaigns,
      (select md5(coalesce(jsonb_agg(to_jsonb(e) order by e.id)::text,'[]'))
        from public.rpg_entities e) entities,
      (select md5(coalesce(jsonb_agg(to_jsonb(w) order by w.campaign_id)::text,'[]'))
        from rpg_private.world_foundations w) worlds`);
    await f.db.exec(await readFile(new URL(
      "../supabase/migrations/202610060043_astra_first_opening.sql", import.meta.url), "utf8"));
    assert.deepEqual(await f.one(`select
      (select count(*)::integer from public.rpg_campaigns) campaigns,
      (select md5(coalesce(jsonb_agg(to_jsonb(e) order by e.id)::text,'[]'))
        from public.rpg_entities e) entities,
      (select md5(coalesce(jsonb_agg(to_jsonb(w) order by w.campaign_id)::text,'[]'))
        from rpg_private.world_foundations w) worlds`), before);
    const grants = await f.one(`select
      has_function_privilege('service_role',
        'public.rpg_bootstrap_before_astra_first(uuid,uuid,text,jsonb)',
        'EXECUTE') bypass,
      has_function_privilege('service_role',
        'public.rpg_bootstrap(uuid,uuid,text,jsonb)','EXECUTE') wrapper`);
    assert.deepEqual(grants, { bypass: false, wrapper: true });
    await f.startOpening();
    assert.equal(await marker(f), null);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.turns
      where campaign_id=$1 and input->>'mode'='game'`, [f.cid])).n, 0);
  } finally { await f.db.close(); }
});

test("narrative v2 keeps its descriptive sheet and legacy opening without inventing mechanics", async () => {
  const f = await setup(examples.orbital, "en", 43);
  try {
    f.creation = { ...f.creation, schemaVersion: 2,
      sheet: { ...sheet, mode: "narrative", role: "Cargo pilot",
        attributes: null, skills: ["Dock negotiation"] },
      equipmentProfile: "none", mechanics: null };
    await f.create();
    const count = (await f.one(`select count(*)::integer n
      from rpg_private.library_commands where owner_id=$1`, [f.owner])).n;
    assert.deepEqual(await f.rpc("creation_replay_status", null,
      f.creationCommit.input), { approved: true });
    assert.deepEqual(await f.rpc("creation_replay_status", null,
      { ...f.creationCommit.input, requestId: randomUUID() }),
    { approved: false });
    assert.deepEqual(await f.rpc("creation_replay_status", null,
      { ...f.creationCommit.input, review: {
        ...f.creationCommit.input.review, name: "Different person" } }),
    { approved: false });
    assert.equal((await f.one(`select count(*)::integer n
      from rpg_private.library_commands where owner_id=$1`, [f.owner])).n,
    count);
    await assert.rejects(f.rpc("creation_replay_status", null,
      f.creationCommit.input, f.other), /rpg_forbidden/);
    await f.startOpening();
    assert.equal(await marker(f), null);
    assert.equal((await f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`, [f.cid])).configuration, null);
  } finally { await f.db.close(); }
});

test("read-only startup status requires exact playable fence and an approved opening event", async () => {
  const f = await modern();
  try {
    await f.create();
    const fence = await f.fence(f.cid);
    const before = await f.one(`select
      (select to_jsonb(p) from public.rpg_public_state p where campaign_id=$1) state,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands`, [f.cid]);
    assert.deepEqual(await openingStatus(f), { approvedOpening: false });
    assert.deepEqual(await f.one(`select
      (select to_jsonb(p) from public.rpg_public_state p where campaign_id=$1) state,
      (select to_jsonb(r) from rpg_private.runtime_state r where campaign_id=$1) runtime,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands`, [f.cid]), before);
    const locationId = randomUUID();
    await f.one(`insert into public.rpg_locations
      (id,campaign_id,name,description,status,revision)
      values($1,$2,'Old road','','known',1)`, [locationId, f.cid]);
    await f.one(`update public.rpg_public_state set current_location_id=$1
      where campaign_id=$2`, [locationId, f.cid]);
    assert.deepEqual(await openingStatus(f), { approvedOpening: false });
    await assert.rejects(openingStatus(f, { ...fence, epoch: fence.epoch + 1 }),
      /rpg_conflict/);
    await assert.rejects(f.rpc("astra_first_status", f.cid,
      { timeline: fence, invented: true }), /rpg_validation/);
    await assert.rejects(f.rpc("astra_first_status", f.cid,
      { timeline: fence }, f.other), /rpg_forbidden/);
    await assert.rejects(f.rpc("astra_first_status", randomUUID(),
      { timeline: fence }), /rpg_not_found/);
  } finally { await f.db.close(); }
});

test("pre-43 structured opening with historical legacy Game turn replays without takeover", async () => {
  const f = await setup({ ...examples.fantasy,
    description: "A human scout with tracking skill and a simple sword. I cannot cast spells.",
    caps: ["tracking skill"], limits: ["cannot cast spells"], item: "simple sword" }, "en", 42);
  try {
    f.creation = { ...f.creation, schemaVersion: 2, sheet,
      equipmentProfile: "standard_humanoid",
      mechanics: { hp: 10, attack: 1, defense: 11, skill: 2,
        weaponName: "simple sword", weaponDamage: 3 } };
    await f.create();
    const approved = await f.startOpening();
    const operationId = randomUUID();
    await f.runtime(f.cid, "begin", { operationId, campaignId: f.cid,
      expectedRevision: (await f.runtime(f.cid, "play")).revision,
      mode: "game", input: "An earlier legacy Game action.",
      companionId: null, listenerIds: [], mechanic: null });
    await f.one(`update rpg_private.turns set status='committed'
      where campaign_id=$1 and id=$2`, [f.cid, operationId]);
    await f.db.exec(await readFile(new URL(
      "../supabase/migrations/202610060043_astra_first_opening.sql", import.meta.url), "utf8"));
    assert.deepEqual(await f.rpc("opening.commit", f.cid, f.openingCommit.input), approved);
    assert.equal(await marker(f), null);
    assert.equal((await f.one(`select runtime_identity from rpg_private.turns
      where campaign_id=$1 and id=$2`, [f.cid, operationId])).runtime_identity,
    null);
  } finally { await f.db.close(); }
});

test("reviewed structured opening atomically activates Astra before any Game turn and replays once", async () => {
  const f = await modern();
  try {
    const created = await f.create();
    assert.equal(await marker(f), null);
    const before = await f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`, [f.cid]);
    assert.deepEqual(before.configuration.controlledEntityIds, [created.heroId]);
    const start = await f.startOpening();
    assert.doesNotMatch(JSON.stringify(start), /astra_takeover|worldDigest|beforeSaveId|afterSaveId/);
    assert.deepEqual(await openingStatus(f), { approvedOpening: true });
    const after = await marker(f);
    assert.equal(after.runtime, "astra-primary-v1");
    assert.equal(after.sourceRuleset, "world-logic-v1");
    assert.equal(after.campaignId, f.cid);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.turns
      where campaign_id=$1 and input->>'mode'='game'`, [f.cid])).n, 0);
    const config = await f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`, [f.cid]);
    const world = await f.one(`select world from rpg_private.world_foundations
      where campaign_id=$1`, [f.cid]);
    assert.equal(config.configuration.profile, "console-basic-v1");
    assert.deepEqual(config.configuration.controlledEntityIds, [created.heroId]);
    assert.deepEqual(new Set(config.configuration.presentEntityIds),
      new Set(world.world.actors.map((actor) => actor.entityId)));
    assert.equal(config.configuration.itemRules.length, 1);
    const saves = await f.query(`select id,name from rpg_private.save_points
      where campaign_id=$1 and trigger_key like 'astra-takeover-%'`, [f.cid]);
    assert.equal(saves.length, 2);
    assert.deepEqual(saves.map((s) => s.name).sort(),
      ["After Astra-primary takeover", "Before Astra-primary takeover"]);
    const counts = await f.one(`select
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]);
    const calls = f.calls;
    assert.deepEqual(await f.rpc("opening.commit", f.cid, f.openingCommit.input), start);
    assert.equal(f.calls, calls);
    assert.deepEqual(await f.one(`select
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves`, [f.cid]), counts);
    const openingScene = await f.one(`select current_scene_id id
      from public.rpg_public_state where campaign_id=$1`, [f.cid]);
    await f.one(`update public.rpg_scenes set role='note',revision=revision+1
      where campaign_id=$1 and id=$2`, [f.cid, openingScene.id]);
    assert.deepEqual(await openingStatus(f), { approvedOpening: true });
  } finally { await f.db.close(); }
});

test("late takeover failure rolls back opening, receipt and World changes atomically", async () => {
  const f = await modern();
  try {
    await f.create();
    await f.proposeOpening();
    const before = await f.one(`select
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from public.rpg_locations where campaign_id=$1) locations,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves,
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world`, [f.cid]);
    await f.db.exec(`create function rpg_private.reject_test_takeover() returns trigger
      language plpgsql as $$ begin if new.astra_takeover is not null then
      raise exception 'test_takeover_rejected'; end if; return new; end $$;
      create trigger reject_test_takeover before update on rpg_private.world_foundations
      for each row execute function rpg_private.reject_test_takeover();`);
    await assert.rejects(f.rpc("opening.commit", f.cid, f.openingCommit.input),
      /test_takeover_rejected/);
    assert.deepEqual(await f.one(`select
      (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from public.rpg_locations where campaign_id=$1) locations,
      (select count(*)::integer from rpg_private.world_commands where campaign_id=$1) commands,
      (select count(*)::integer from rpg_private.world_events where campaign_id=$1) events,
      (select count(*)::integer from rpg_private.save_points where campaign_id=$1) saves,
      (select to_jsonb(w) from rpg_private.world_foundations w where campaign_id=$1) world`, [f.cid]), before);
    await f.db.exec(`drop trigger reject_test_takeover on rpg_private.world_foundations;
      drop function rpg_private.reject_test_takeover();`);
    await f.rpc("opening.commit", f.cid, f.openingCommit.input);
    assert.equal((await marker(f)).runtime, "astra-primary-v1");
  } finally { await f.db.close(); }
});

test("pre-takeover safety save stays legacy even if its approval receipt is replayed", async () => {
  const f = await modern();
  try {
    await f.create();
    const oldSave = await f.saves(f.cid, "create", await f.command(f.cid,
      { kind: "manual", name: "Before opening" }));
    await f.startOpening();
    const saves = await f.query(`select id,name from rpg_private.save_points
      where campaign_id=$1 and trigger_key like 'astra-takeover-%'`, [f.cid]);
    const before = saves.find((s) => s.name === "Before Astra-primary takeover");
    const after = saves.find((s) => s.name === "After Astra-primary takeover");
    assert.ok(before && after);
    await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: before.id, label: "Before Astra", recovery: false }));
    assert.equal(await marker(f), null);
    assert.deepEqual(await openingStatus(f), { approvedOpening: true });
    assert.equal((await f.runtime(f.cid, "astra_takeover_status")).active, false);
    await f.rpc("opening.commit", f.cid, f.openingCommit.input);
    assert.equal(await marker(f), null);
    assert.deepEqual(await openingStatus(f), { approvedOpening: true });
    await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: after.id, label: "After Astra", recovery: false }));
    assert.equal((await marker(f)).runtime, "astra-primary-v1");
    assert.deepEqual(await openingStatus(f), { approvedOpening: true });
    await f.saves(f.cid, "load", await f.command(f.cid,
      { saveId: oldSave.saveId, label: "Before opening again", recovery: false }));
    assert.equal(await marker(f), null);
    assert.deepEqual(await openingStatus(f), { approvedOpening: false });
  } finally { await f.db.close(); }
});
