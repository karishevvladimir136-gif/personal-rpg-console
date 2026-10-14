import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { isRestProvision } from "../src/lib/gameplay/rest-provisions.ts";
import { planAstraMechanics, AstraMechanicsObstruction } from "../src/lib/gameplay/astra-mechanics.ts";
import { runAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { fixture, id, turn, applyResolution } from "./phase2-mechanics-fixtures.mjs";
import { createOwnerLongRestWorld } from "./owner-long-rest-fixture.mjs";
import { createIrisWorld, irisTurn } from "./astra-iris-fixture.mjs";

const item = (category) => ({ id: "item", category });
const tag = (name) => [{ itemId: "item", tag: name, damage: null }];

test("ordinary food and supply categories qualify without a tag, with weapon and serving exclusions", () => {
  assert.equal(isRestProvision(item("food"), []), true);
  assert.equal(isRestProvision(item("supply"), []), true);
  assert.equal(isRestProvision(item("misc"), []), false);
  assert.equal(isRestProvision(item("misc"), tag("supply")), true);
  assert.equal(isRestProvision(item("weapon"), tag("supply")), false);
  assert.equal(isRestProvision(item("weapons"), tag("supply")), false);
  assert.equal(isRestProvision(item("food"), tag("weapon")), false);
  assert.equal(isRestProvision(item("food"), tag("meal-serving")), false);
  assert.equal(isRestProvision(item("food"), tag("coffee-serving")), false);
  assert.equal(isRestProvision(item("food"), [], [
    { itemId: "item", visibility: "public", trade: "allowed" }]), true);
  for (const trade of ["restricted", "quest"])
    assert.equal(isRestProvision(item("food"), [], [
      { itemId: "item", visibility: "public", trade }]), false, trade);
});

test("formal-rest planner and resolver consume one untagged food unit without changing saved safety", () => {
  const source = fixture();
  const hero = id("player"), food = id("supply");
  source.runtime.configuration.controlledEntityIds = [hero];
  source.runtime.configuration.safeLocationIds = [];
  source.runtime.configuration.itemRules = source.runtime.configuration.itemRules
    .filter((rule) => rule.itemId !== food);
  source.snapshot.items.find((row) => row.id === food).category = "food";
  source.snapshot.items.find((row) => row.id === food).quantity = 1;
  source.snapshot.entities.find((row) => row.id === hero).hp = 10;
  source.snapshot.entities.find((row) => row.id === hero).max_hp = 10;
  source.snapshot.settings.values.difficulty.longRestSupplyCost = 1;
  source.runtime.worldMinutes = 13;
  const locationId = source.snapshot.publicState.current_location_id;
  const plan = planAstraMechanics(source, turn(source), { kind: "formal_rest",
    restKind: "long", restSafety: { locationId, suitable: true } });
  assert.deepEqual(plan.actions[1].supplies, [{ itemId: food, quantity: 1 }]);
  const after = applyResolution(source, plan.resolution);
  assert.equal(after.snapshot.items.find((row) => row.id === food)?.quantity, 0);
  assert.equal(after.runtime.worldMinutes, 493);
  assert.equal(after.snapshot.entities.find((row) => row.id === hero)?.hp, 10);
  assert.equal(after.runtime.restRecords[0].status, "complete");
  assert.deepEqual(plan.resolution.configuration.safeLocationIds, []);
});

test("formal-rest planner rejects ineligible food across every existing authority boundary", () => {
  const base = fixture(), hero = id("player"), food = id("supply");
  base.runtime.configuration.controlledEntityIds = [hero];
  base.runtime.configuration.safeLocationIds = [];
  base.runtime.configuration.itemRules = base.runtime.configuration.itemRules
    .filter((rule) => rule.itemId !== food);
  base.snapshot.items.find((row) => row.id === food).category = "food";
  base.snapshot.items.find((row) => row.id === food).quantity = 1;
  base.snapshot.settings.values.difficulty.longRestSupplyCost = 1;
  const scenarios = [
    ["zero quantity", (s) => { s.snapshot.items.find((r) => r.id === food).quantity = 0; }],
    ["NPC owner", (s) => { s.snapshot.items.find((r) => r.id === food).owner_entity_id = id("enemy"); }],
    ["inaccessible companion storage", (s) => {
      const row = s.snapshot.items.find((r) => r.id === food);
      row.owner_entity_id = null; row.storage_id = id("companion-pack");
    }],
    ["private item policy", (s) => { s.astraSettlementItemPolicies = [
      { itemId: food, visibility: "private", trade: "restricted" }]; }],
    ["public restricted item policy", (s) => { s.astraSettlementItemPolicies = [
      { itemId: food, visibility: "public", trade: "restricted" }]; }],
    ["public quest item policy", (s) => { s.astraSettlementItemPolicies = [
      { itemId: food, visibility: "public", trade: "quest" }]; }],
    ["meal serving", (s) => { s.runtime.configuration.itemRules.push(
      { itemId: food, tag: "meal-serving", damage: null }); }],
    ["coffee serving", (s) => { s.runtime.configuration.itemRules.push(
      { itemId: food, tag: "coffee-serving", damage: null }); }],
    ["weapon category with supply tag", (s) => {
      s.snapshot.items.find((r) => r.id === food).category = "weapon";
      s.runtime.configuration.itemRules.push({ itemId: food, tag: "supply", damage: null });
    }],
    ["weapon tag on food", (s) => { s.runtime.configuration.itemRules.push(
      { itemId: food, tag: "weapon", damage: null }); }],
  ];
  for (const [name, change] of scenarios) {
    const source = structuredClone(base);
    change(source);
    const before = structuredClone(source);
    assert.throws(() => planAstraMechanics(source, turn(source), {
      kind: "formal_rest", restKind: "long", restSafety: {
        locationId: source.snapshot.publicState.current_location_id, suitable: true,
      },
    }), (error) => error instanceof AstraMechanicsObstruction &&
      error.reason === "insufficient_supplies", name);
    assert.deepEqual(source, before, name);
  }
});

test("migration 49 SQL provision predicate agrees with TypeScript", async () => {
  const world = await createOwnerLongRestWorld();
  try {
    const cases = [
      ["food", [], true], ["supply", [], true], ["misc", [], false],
      ["misc", ["supply"], true], ["weapon", ["supply"], false],
      ["food", ["weapon"], false], ["food", ["meal-serving"], false],
      ["food", ["coffee-serving"], false],
    ];
    for (const [category, tags, expected] of cases) {
      const id = randomUUID();
      const rules = tags.map((entry) => ({ itemId: id, tag: entry, damage: null }));
      const source = { snapshot: { items: [{ id, category }] },
        runtime: { configuration: { itemRules: rules } } };
      const sql = await world.f.one(`select rpg_private.astra_rest_provision($1::jsonb,$2::uuid) allowed`,
        [JSON.stringify(source), id]);
      assert.equal(sql.allowed, expected, `${category}/${tags.join(",")}`);
      assert.equal(isRestProvision({ id, category }, rules), expected);
    }
    for (const [visibility, trade, expected] of [
      ["public", "allowed", true],
      ["private", "allowed", false],
      ["public", "restricted", false],
      ["public", "quest", false],
    ]) {
      const id = randomUUID();
      const policies = [{ itemId: id, visibility, trade }];
      const source = { snapshot: { items: [{ id, category: "food" }] },
        runtime: { configuration: { itemRules: [] } },
        astraSettlementItemPolicies: policies };
      const sql = await world.f.one(`select rpg_private.astra_rest_provision($1::jsonb,$2::uuid) allowed`,
        [JSON.stringify(source), id]);
      assert.equal(sql.allowed, expected, `${visibility}/${trade}`);
      assert.equal(isRestProvision({ id, category: "food" }, [], policies), expected);
    }
  } finally { await world.f.db.close(); }
});

test("populated migration 48 to 49 preserves rows, pinned turns, grants and other SQL definitions", async () => {
  const world = await createIrisWorld(48);
  const { f } = world;
  try {
    const usage = { model: "synthetic", inputTokens: 0, outputTokens: 0,
      calls: 0, latencyMs: 0 };
    const completed = await irisTurn(world, {
      next: async (_context, _input, _receipts, _checks, _caps, source) => ({
        usage, output: { type: "final", call: null, final: {
          worldMinutes: source.runtime.worldMinutes, changes: [], outcomes: [],
          privatePatches: [], effects: [],
        } },
      }),
      narrate: async () => ({ usage, output: { narration: "The market remains open.",
        visualDescription: "", clarification: null } }),
    }, "I wait at the market.");
    assert.equal(completed.result.status, "committed");
    const rpc = async (args) => ({ data: await f.runtime(args.p_campaign_id,
      args.p_action, args.p_payload, args.p_timeline) });
    const store = createRpcTurnStore(f.owner, rpc, "gpt-6-astra", world.timeline, true);
    const play = await store.readPlay(f.cid);
    const pending = { operationId: randomUUID(), campaignId: f.cid,
      timeline: play.timeline, expectedRevision: play.revision, mode: "game",
      input: "I will consider my next step.", companionId: null,
      listenerIds: [], mechanic: null };
    await store.begin(pending, "astra-primary-v1");
    const pinned = await store.claim(f.cid, pending.operationId);
    assert.ok(pinned.source);
    const states = await f.query(`select id,status,source is not null pinned,
      checkpoint is not null checkpoint_pinned from rpg_private.turns
      where campaign_id=$1 order by created_at,id`, [f.cid]);
    assert.ok(states.length >= 2);
    assert.ok(states.some((row) => row.id === completed.input.operationId &&
      row.status === "committed"));
    assert.ok(states.some((row) => row.id === pending.operationId &&
      row.pinned && row.checkpoint_pinned));

    const tables = [
      ["runtime", "rpg_private.runtime_state"], ["public", "public.rpg_public_state"],
      ["entities", "public.rpg_entities"], ["items", "public.rpg_items"],
      ["quests", "public.rpg_quests"], ["rests", "public.rpg_rest_records"],
      ["scenes", "public.rpg_scenes"], ["saves", "rpg_private.save_points"],
      ["timelines", "rpg_private.timelines"],
      ["manifests", "rpg_private.timeline_manifests"],
      ["versions", "rpg_private.timeline_versions"],
      ["foundation", "rpg_private.world_foundations"],
      ["world_events", "rpg_private.world_events"],
      ["runtime_events", "rpg_private.runtime_events"],
      ["turns", "rpg_private.turns"],
    ];
    const rowsSql = tables.map(([name, table]) => `select '${name}' area,
      count(*)::integer n,
      md5(coalesce(string_agg(md5(to_jsonb(t)::text),'' order by to_jsonb(t)::text),'')) digest
      from ${table} t where campaign_id=$1`).join(" union all ");
    const functionSql = `select p.oid::regprocedure::text signature,p.oid::text oid,
      coalesce(p.proacl::text,'') acl,p.proowner::regrole::text owner,
      p.prosecdef security_definer,p.provolatile volatility,
      md5(pg_get_functiondef(p.oid)) definition
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='rpg_private' and p.proname like 'astra_%'
        and p.proname not in ('astra_mechanics_expected','astra_rest_provision')
      order by signature`;
    const targetSql = `select p.oid::text oid,coalesce(p.proacl::text,'') acl,
      p.proowner::regrole::text owner,p.prosecdef security_definer,
      p.provolatile volatility,md5(pg_get_functiondef(p.oid)) definition
      from pg_proc p where p.oid=
        'rpg_private.astra_mechanics_expected(uuid,rpg_private.turns,jsonb)'::regprocedure`;
    const rowsBefore = await f.query(rowsSql, [f.cid]);
    const functionsBefore = await f.query(functionSql);
    const targetBefore = await f.one(targetSql);
    const migration = new URL("../supabase/migrations/202610090049_astra_rest_provisions.sql",
      import.meta.url);
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await f.query(rowsSql, [f.cid]), rowsBefore);
    assert.deepEqual(await f.query(functionSql), functionsBefore);
    const targetAfter = await f.one(targetSql);
    assert.equal(targetAfter.oid, targetBefore.oid);
    for (const field of ["acl", "owner", "security_definer", "volatility"])
      assert.equal(targetAfter[field], targetBefore[field], field);
    assert.notEqual(targetAfter.definition, targetBefore.definition);
    const changed = await f.one(`select pg_get_functiondef(
      'rpg_private.astra_mechanics_expected(uuid,rpg_private.turns,jsonb)'::regprocedure) body`);
    assert.equal(changed.body.match(/astra_rest_provision\(/g)?.length, 2);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.turns
      where campaign_id=$1 and id=$2 and status='committed'`,
      [f.cid, completed.input.operationId])).n, 1);
    assert.equal((await f.one(`select count(*)::integer n from rpg_private.turns
      where campaign_id=$1 and id=$2 and source is not null and checkpoint is not null`,
      [f.cid, pending.operationId])).n, 1);
  } finally { await f.db.close(); }
});

test("Iris-shaped untagged food completes one formal rest and replay has no second effects", async () => {
  const world = await createOwnerLongRestWorld();
  try {
    const before = await world.readState();
    assert.equal(before.world_minutes, 13);
    let plans = 0, narrations = 0, permissionInContext = false;
    const usage = { model: "synthetic", inputTokens: 0, outputTokens: 0,
      calls: 0, latencyMs: 0 };
    const provider = {
      next: async (context, input, _receipts, _checks, _caps, source) => {
        plans++;
        assert.equal(input.input, "i take long rest");
        permissionInContext = context.input.includes("You're welcome to sleep there tonight");
        return { usage, output: { type: "final", call: null, final: {
          worldMinutes: source.runtime.worldMinutes, changes: [], outcomes: [],
          privatePatches: [], effects: [{ kind: "formal_rest", restKind: "long",
            restSafety: { locationId: world.location, suitable: true } }],
        } } };
      },
      narrate: async () => { narrations++;
        return { usage, output: { narration: "Iris sleeps at the roadside market.",
          visualDescription: "", clarification: null } };
      },
    };
    const { result, input, store } = await world.runTurn(provider);
    const failed = result.status === "failed" ? await world.f.one(`select
      status,failure,source is not null pinned,astra_diagnostic diagnostic
      from rpg_private.turns where id=$1`, [input.operationId]) : null;
    assert.equal(result.status, "committed",
      JSON.stringify({ plans, narrations, failure: result.failure, failed }));
    assert.equal(plans, 1);
    assert.equal(permissionInContext, true);
    assert.equal(narrations, 1);
    const after = await world.readState();
    assert.equal(after.items.find((row) => row.name === "vegetables for a meal")?.quantity, 0);
    assert.equal(after.world_minutes, 493);
    assert.equal(after.hp, 10);
    assert.equal(after.max_hp, 10);
    assert.equal(after.completed_rests, 1);
    assert.equal(after.quests, 0);
    assert.deepEqual(after.resources, before.resources);
    assert.deepEqual(after.currencies, before.currencies);
    assert.equal(after.location_id, before.location_id);
    assert.equal(after.items.length, before.items.length);
    assert.deepEqual((await world.f.one(`select configuration from rpg_private.runtime_state
      where campaign_id=$1`, [world.f.cid])).configuration.safeLocationIds, []);
    const committedRest = await world.f.one(`select public_outcome from public.rpg_rest_records
      where campaign_id=$1 and status='complete'`, [world.f.cid]);
    assert.equal(committedRest.public_outcome.supplies[0].itemId, world.vegetables);
    assert.equal(committedRest.public_outcome.supplies[0].quantity, 1);
    const replay = await runAstraTurn(input, { store });
    assert.equal(replay.status, "committed");
    assert.equal(plans, 1);
    assert.equal(narrations, 1);
    assert.deepEqual(await world.readState(), after);
  } finally { await world.f.db.close(); }
});

test("migration 49 independently rejects a forged inaccessible food payment at commit", async () => {
  const world = await createOwnerLongRestWorld();
  const { f } = world;
  try {
    let npcStorage = await f.one(`select id from public.rpg_storages
      where campaign_id=$1 and entity_id=$2 limit 1`, [f.cid, world.npc]);
    if (!npcStorage) {
      npcStorage = { id: randomUUID() };
      await f.one(`insert into public.rpg_storages
        (id,campaign_id,name,kind,entity_id,revision)
        values($1,$2,'Market stock','merchant',$3,1)`,
      [npcStorage.id, f.cid, world.npc]);
    }
    const npcFood = randomUUID();
    await f.one(`insert into public.rpg_items
      (id,campaign_id,name,category,quantity,description,mechanics,
        owner_entity_id,storage_id,revision)
      values($1,$2,'NPC provisions','food',1,'Recorded seller stock','',$3,$4,1)`,
    [npcFood, f.cid, world.npc, npcStorage.id]);
    const before = await world.readState();
    const usage = { model: "synthetic", inputTokens: 0, outputTokens: 0,
      calls: 0, latencyMs: 0 };
    const provider = {
      next: async (_ctx, _input, _receipts, _checks, _caps, source) => ({
        usage, output: { type: "final", call: null, final: {
          worldMinutes: source.runtime.worldMinutes, changes: [], outcomes: [],
          privatePatches: [], effects: [{ kind: "formal_rest", restKind: "long",
            restSafety: { locationId: world.location, suitable: true } }],
        } },
      }),
      narrate: async () => ({ usage, output: { narration: "Iris rests for the night.",
        visualDescription: "", clarification: null } }),
    };
    const interrupted = await world.runTurn(provider, ({ store }) => {
      store.commit = async () => { throw Error("synthetic commit interruption"); };
    });
    assert.equal(interrupted.result.status, "failed");
    assert.equal(interrupted.result.canRetry, true);
    assert.deepEqual(await world.readState(), before);
    const pinned = await f.one(`select astra_ordered_effects receipt
      from rpg_private.turns where id=$1`, [interrupted.input.operationId]);
    assert.ok(pinned.receipt?.effects?.length);
    const forged = structuredClone(pinned.receipt);
    const rest = forged.effects[0].actions.find((action) => action.kind === "rest.complete");
    assert.ok(rest);
    assert.equal(rest.supplies[0].itemId, world.vegetables);
    rest.supplies[0].itemId = npcFood;
    await f.one(`update rpg_private.turns set astra_ordered_effects=$2::jsonb
      where id=$1`, [interrupted.input.operationId, JSON.stringify(forged)]);
    const claim = await f.runtime(f.cid, "claim", { operationId: interrupted.input.operationId });
    const cp = claim.turn.checkpoint;
    await assert.rejects(() => f.runtime(f.cid, "commit", { ...claim.lease, packet: {
      narration: cp.narration.narration,
      visualDescription: cp.narration.visualDescription,
      resolution: cp.astraPrimary.finalProposal.resolution,
      privatePatches: cp.astraPrimary.finalProposal.privatePatches,
      checks: cp.checks, guidanceProposal: null,
    } }), /rpg_validation/);
    assert.deepEqual(await world.readState(), before);
  } finally { await f.db.close(); }
});
