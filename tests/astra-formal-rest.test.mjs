import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, id, turn, applyResolution, perform } from "./phase2-mechanics-fixtures.mjs";
import { takenOver } from "./astra-freedom-fixture.mjs";
import { planAstraMechanics, assertAstraMechanicsScope, mechanicsAuthoringCapabilities,
  AstraMechanicsObstruction } from "../src/lib/gameplay/astra-mechanics.ts";
import { runAstraTurn, resumeAstraTurn } from "../src/lib/gameplay/astra-primary.ts";
import { stableGameplayId as stableId } from "../src/lib/gameplay/dice.ts";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { createRpcMemoryStore } from "../src/lib/memory/store.ts";
import { planAstraOrderedEffects } from "../src/lib/gameplay/astra-ordered-effects.ts";

const safety = (source, suitable = true) => ({
  locationId: source.snapshot.publicState.current_location_id, suitable,
});
const formal = (source, restKind = "long", suitable = true) => ({
  kind: "formal_rest", restKind, restSafety: safety(source, suitable),
});
const actions = (choices, restSafety = null) => ({
  kind: "mechanic_actions", actions: choices, restSafety,
});
const quantity = (source, itemId = id("supply")) =>
  source.snapshot.items.find((row) => row.id === itemId)?.quantity;
const hp = (source, entityId = id("player")) =>
  source.snapshot.entities.find((row) => row.id === entityId)?.hp;

for (const [kind, minutes, recovered] of [["short", 60, 5], ["long", 480, 8]]) {
  test(`adapter one free-text ${kind} rest derives exact supplies, recovery and time with temporary safety`, () => {
    const source = fixture();
    source.runtime.configuration.safeLocationIds = [];
    source.snapshot.entities.filter((row) => row.kind !== "npc").forEach((row) => { row.hp = 2; });
    source.snapshot.settings.values.difficulty.shortRestSupplyCost = 1;
    source.snapshot.settings.values.difficulty.longRestSupplyCost = 1;
    const before = structuredClone(source);
    const input = { ...turn(source), input: "I eat, settle in the loft and sleep until morning." };
    const plan = planAstraMechanics(source, input, formal(source, kind));
    assert.deepEqual(plan.actions, [
      { kind: "rest.enter", restKind: kind, participantIds: [id("player"), id("companion")] },
      { kind: "rest.complete", restId: stableId(input.operationId, "rest:0"),
        supplies: [{ itemId: id("supply"), quantity: 2 }] },
    ]);
    assert.equal(plan.publicOutcome.completedRest, true);
    assert.equal(plan.safety.campaignId, input.campaignId);
    assert.equal(plan.safety.operationId, input.operationId);
    assert.equal(plan.safety.timeline, null);
    const next = applyResolution(source, plan.resolution);
    assert.equal(hp(next), recovered);
    assert.equal(hp(next, id("companion")), recovered);
    assert.equal(hp(next, id("enemy")), 6);
    assert.equal(quantity(next), 8);
    assert.equal(next.runtime.worldMinutes, minutes);
    assert.equal(next.runtime.restRecords.length, 1);
    assert.equal(next.runtime.restRecords[0].status, "complete");
    assert.equal(plan.resolution.configuration.safeLocationIds.length, 0);
    assert.equal(new Set(plan.resolution.changes.map((row) => `${row.family}:${row.id}`)).size,
      plan.resolution.changes.length);
    assert.deepEqual(source, before);
    assert.deepEqual(planAstraMechanics(source, input, formal(source, kind)), plan);
  });
}

test("adapter full rest reuses a matching planned rest and its frozen settings", () => {
  let source = fixture();
  source = perform(source, { kind: "rest.enter", restKind: "long", participantIds: [id("player")] }, "begin-rest").source;
  const originalSettings = structuredClone(source.snapshot.settings);
  source.snapshot.settingsHistory.push(originalSettings);
  source.snapshot.settings.revision = 2;
  source.snapshot.settings.values.difficulty.longRestSupplyCost = 2;
  source.snapshot.settings.values.difficulty.recovery = "restrictive";
  const plan = planAstraMechanics(source, turn(source, null, "complete-existing"), formal(source));
  assert.equal(plan.actions.length, 1);
  assert.equal(plan.actions[0].restId, source.runtime.restRecords[0].id);
  assert.deepEqual(plan.actions[0].supplies, [{ itemId: id("supply"), quantity: 1 }]);
  assert.equal(hp(applyResolution(source, plan.resolution)), 12);
});

test("adapter insufficient supplies omit the entire rest without false recovery or partial entry", () => {
  const source = fixture();
  source.snapshot.items.find((row) => row.id === id("supply")).quantity = 1;
  const before = structuredClone(source);
  assert.throws(() => planAstraMechanics(source, turn(source), formal(source)),
    (error) => error instanceof AstraMechanicsObstruction && error.reason === "insufficient_supplies");
  assert.deepEqual(source, before);
  source.snapshot.items.find((row) => row.id === id("supply")).quantity = 10;
  source.astraSettlementItemPolicies = [{ itemId: id("supply"), visibility: "private", trade: "restricted" }];
  assert.throws(() => planAstraMechanics(source, turn(source), formal(source)),
    (error) => error.reason === "insufficient_supplies");
});

test("adapter unsafe adjudication and active encounters cannot grant completed recovery", () => {
  const source = fixture();
  assert.throws(() => planAstraMechanics(source, turn(source), formal(source, "long", false)),
    (error) => error.reason === "unsafe_rest");
  source.runtime.encounters.push({ id: id("active-encounter"), campaign_id: source.snapshot.campaign.id,
    status: "active", round: 1, outcome: null, settings_revision: 1, public_summary: "Synthetic encounter" });
  const before = structuredClone(source);
  assert.throws(() => planAstraMechanics(source, turn(source), formal(source)),
    (error) => error.reason === "active_encounter");
  assert.deepEqual(source, before);
});

test("adapter explicit leave interrupts the existing rest and expires pending effects without healing", () => {
  let source = fixture();
  source = perform(source, { kind: "rest.enter", restKind: "long", participantIds: [id("player")] }, "rest-to-leave").source;
  const restId = source.runtime.restRecords[0].id;
  source.runtime.effects.push({ id: id("pending-meal"), campaign_id: source.snapshot.campaign.id,
    entity_id: id("player"), recipe_id: null,
    definition: { kind: "meal", status: "pending", creatingRestId: restId, remaining: 2 } });
  const plan = planAstraMechanics(source, turn(source, null, "leave-rest"),
    actions([{ kind: "rest.leave", restId }], safety(source, false)));
  const next = applyResolution(source, plan.resolution);
  assert.equal(next.runtime.restRecords[0].status, "interrupted");
  assert.equal(next.runtime.effects[0].definition.status, "expired");
  assert.equal(hp(next), 6);
  assert.equal(quantity(next), 10);
  assert.equal(next.runtime.worldMinutes, 0);
  assert.equal(plan.publicOutcome.completedRest, false);
  assert.throws(() => planAstraMechanics(next, turn(next),
    actions([{ kind: "rest.complete", restId, supplies: [{ itemId: id("supply"), quantity: 1 }] }], safety(next))),
    (error) => error.reason === "interrupted_rest");
});

test("adapter enter, cooking, serving and completion reuse effect activation and expiration", () => {
  const source = fixture(), input = turn(source, null, "cook-and-rest");
  source.runtime.configuration.safeLocationIds = [];
  source.runtime.effects.push({ id: id("old-coffee"), campaign_id: source.snapshot.campaign.id,
    entity_id: id("player"), recipe_id: null,
    definition: { kind: "coffee", status: "active", creatingRestId: id("old-rest"), remaining: 1 } });
  const restId = stableId(input.operationId, "rest:0"), servingId = stableId(input.operationId, "prepared:1");
  const plan = planAstraMechanics(source, input, actions([
    { kind: "rest.enter", restKind: "long", participantIds: [id("player")] },
    { kind: "recipe.prepare", actorId: id("player"), recipe: "meal",
      ingredients: [{ itemId: id("meat"), quantity: 1 }], outputStorageId: id("pack") },
    { kind: "recipe.serve", actorId: id("player"), itemId: servingId, recipientIds: [id("player")] },
    { kind: "rest.complete", restId, supplies: [{ itemId: id("supply"), quantity: 1 }] },
  ], safety(source)));
  const next = applyResolution(source, plan.resolution);
  assert.equal(quantity(next, id("meat")), 9);
  assert.equal(quantity(next, servingId), 0);
  assert.equal(quantity(next), 9);
  assert.equal(next.runtime.effects.find((row) => row.id === id("old-coffee")).definition.status, "expired");
  assert.equal(next.runtime.effects.find((row) => row.definition.kind === "meal").definition.status, "active");
  assert.equal(next.runtime.configuration.itemRules.some((row) => row.itemId === servingId && row.tag === "meal-serving"), true);
  assert.deepEqual(next.runtime.configuration.safeLocationIds, []);
});

test("adapter deterministic item, resource, quest and location actions retain existing rules", () => {
  const source = fixture();
  const plan = planAstraMechanics(source, turn(source), actions([
    { kind: "resource.spend", entityId: id("player"), resource: "focus", amount: 1 },
    { kind: "resource.spend", entityId: id("player"), resource: "focus", amount: 2 },
    { kind: "item.consume", actorId: id("player"), itemId: id("healing"), quantity: 1 },
    { kind: "item.equip", actorId: id("player"), itemId: id("weapon"), slot: null },
    { kind: "quest.transition", questId: id("quest"), status: "complete" },
    { kind: "location.move", locationId: id("next-location") },
  ]));
  const next = applyResolution(source, plan.resolution);
  assert.equal(next.snapshot.entities[0].resources.focus, 1);
  assert.equal(hp(next), 10);
  assert.equal(quantity(next, id("healing")), 9);
  assert.equal(next.snapshot.items.find((row) => row.id === id("weapon")).equipped_slot, null);
  assert.equal(next.snapshot.quests[0].status, "complete");
  assert.equal(next.snapshot.publicState.current_location_id, id("next-location"));
  assert.equal(plan.publicOutcome.completedRest, false);
});

test("adapter Item split and later equipment use the existing stable output and preserve original revisions", () => {
  const source = fixture(), input = turn(source, null, "split-then-equip");
  const splitId = stableId(input.operationId, "split:0");
  const plan = planAstraMechanics(source, input, actions([
    { kind: "item.transfer", actorId: id("player"), itemId: id("weapon"), quantity: 2,
      destinationStorageId: id("companion-pack") },
    { kind: "item.equip", actorId: id("companion"), itemId: splitId, slot: "hand" },
  ]));
  const next = applyResolution(source, plan.resolution);
  const split = next.snapshot.items.find((row) => row.id === splitId);
  assert.equal(quantity(next, id("weapon")), 8);
  assert.equal(split.quantity, 2);
  assert.equal(split.equipped_entity_id, id("companion"));
  assert.equal(plan.resolution.changes.find((row) => row.id === splitId).expectedRevision, null);
  assert.equal(plan.resolution.changes.find((row) => row.id === id("weapon")).expectedRevision, 1);
});

test("adapter takeover travel retains only the travelling party and closes nearby transport access", () => {
  const source = fixture();
  source.worldTakeover = { schemaVersion: 1, presentEntityIds: [id("player"), id("companion"), id("enemy")],
    routeLocationIds: [id("next-location")], actors: [], policy: {}, unresolvedThreads: [], recentWorldEvents: [], sourceWorldRevision: 1 };
  source.runtime.configuration.nearbyStorageIds = [id("cargo")];
  const plan = planAstraMechanics(source, turn(source), actions([{ kind: "location.move", locationId: id("next-location") }]));
  assert.deepEqual(plan.resolution.configuration.presentEntityIds, [id("player"), id("companion")]);
  assert.deepEqual(plan.resolution.configuration.nearbyStorageIds, []);
  assert.throws(() => assertAstraMechanicsScope(source, turn(source),
    actions([{ kind: "location.move", locationId: id("location") }])));
});

test("adapter hard scope rejects foreign, hidden and stale references before optional mechanics rejection", () => {
  const source = fixture(), input = turn(source);
  source.snapshot.locations[1].status = "unknown";
  for (const intent of [
    { ...formal(source), restSafety: { locationId: id("foreign"), suitable: true } },
    actions([{ kind: "item.consume", actorId: id("enemy"), itemId: id("healing"), quantity: 1 }]),
    actions([{ kind: "location.move", locationId: id("next-location") }]),
    actions([{ kind: "rest.enter", restKind: "long", participantIds: [id("foreign")] }], safety(source)),
    actions([{ kind: "forage", actorId: id("foreign"), outputStorageId: id("pack") }]),
  ]) assert.throws(() => assertAstraMechanicsScope(source, input, intent));
  assert.throws(() => assertAstraMechanicsScope(source, { ...input, expectedRevision: 999 }, formal(source)));
  source.astraSettlementItemPolicies = [{ itemId: id("healing"), visibility: "private", trade: "restricted" }];
  assert.throws(() => assertAstraMechanicsScope(source, input,
    actions([{ kind: "item.consume", actorId: id("player"), itemId: id("healing"), quantity: 1 }])));
  assert.equal(mechanicsAuthoringCapabilities(source).itemIds.includes(id("healing")), false);
  const timeline = { timelineId: id("timeline"), epoch: 1 };
  source.runtime.timeline = timeline;
  source.snapshot.timeline = timeline;
  const pinned = planAstraMechanics(source, { ...input, timeline }, formal(source));
  assert.deepEqual(pinned.safety.timeline, timeline);
  assert.throws(() => planAstraMechanics(source, { ...input, timeline: { ...timeline, epoch: 2 } }, formal(source)));
  assert.doesNotMatch(JSON.stringify(mechanicsAuthoringCapabilities(source)), /SYNTHETIC_PRIVATE_MARKER/);
});

test("adapter check-bearing actions remain on existing Astra checks and do not improvise dice", () => {
  const source = fixture();
  assert.throws(() => planAstraMechanics(source, turn(source),
    actions([{ kind: "forage", actorId: id("player"), outputStorageId: id("pack") }])),
    (error) => error.reason === "check_required");
});

test("adapter closed bounded intents cannot accept raw HP, revisions or seven actions", () => {
  const source = fixture(), input = turn(source);
  assert.throws(() => assertAstraMechanicsScope(source, input, { ...formal(source), hp: 12 }));
  assert.throws(() => assertAstraMechanicsScope(source, input,
    actions([{ kind: "item.consume", actorId: id("player"), itemId: id("healing"), quantity: 1, expectedRevision: 1 }])));
  assert.throws(() => assertAstraMechanicsScope(source, input,
    actions(Array(7).fill({ kind: "resource.spend", entityId: id("player"), resource: "focus", amount: 1 }))));
});

test("adapter duplicate full rests in one operation omit the colliding creation without double recovery", () => {
  const source = fixture();
  source.snapshot.entities[0].hp = 1;
  source.worldTakeover = { schemaVersion: 1, presentEntityIds: [id("player"), id("companion"), id("enemy")],
    routeLocationIds: [id("next-location")], actors: [], policy: {}, unresolvedThreads: [], recentWorldEvents: [], sourceWorldRevision: 1 };
  const plan = planAstraOrderedEffects(source, turn(source), [formal(source), formal(source)],
    { changes: [], worldMinutes: 0, configuration: source.runtime.configuration, outcomes: [] });
  assert.equal(plan.effects.length, 1);
  assert.deepEqual(plan.rejected, [{ index: 1, reason: "not_authorized" }]);
  const next = applyResolution(source, plan.resolution);
  assert.equal(hp(next), 7);
  assert.equal(quantity(next), 8);
  assert.equal(next.runtime.worldMinutes, 480);
  assert.equal(next.runtime.restRecords.length, 1);
});

async function preparedRest() {
  const context = await takenOver();
  const { f, hero } = context;
  await f.one("update public.rpg_entities set hp=2,max_hp=12 where campaign_id=$1 and id=$2", [f.cid, hero]);
  const pack = await f.one("select id from public.rpg_storages where campaign_id=$1 and entity_id=$2 and kind='player'", [f.cid, hero]);
  const supplies = (await f.mutation("item.save", f.cid, {
    name: "Recorded rest supplies", category: "supply", quantity: 4,
    description: "Four recorded portions", mechanics: "", owner_entity_id: hero,
    storage_id: pack.id, equipped_entity_id: null, equipped_slot: null,
  })).id;
  const play = await f.runtime(f.cid, "play");
  await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
    expectedRevision: play.revision, configuration: { ...play.configuration,
      safeLocationIds: [], itemRules: [{ itemId: supplies, tag: "supply", damage: null }] } });
  const location = (await f.one("select current_location_id id from public.rpg_public_state where campaign_id=$1", [f.cid])).id;
  return { ...context, supplies, location };
}

async function restState(context) {
  const { f, hero, supplies } = context;
  return f.one(`select r.world_minutes minutes,r.configuration config,e.hp hp,i.quantity quantity,
    (select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb)
      from public.rpg_rest_records x where x.campaign_id=$1) rests,
    (select coalesce(jsonb_agg(to_jsonb(x) order by x.id),'[]'::jsonb)
      from public.rpg_effects x where x.campaign_id=$1) effects
    from rpg_private.runtime_state r join public.rpg_entities e on e.campaign_id=r.campaign_id
    join public.rpg_items i on i.campaign_id=r.campaign_id
    where r.campaign_id=$1 and e.id=$2 and i.id=$3`, [f.cid, hero, supplies]);
}

for (const [restKind, minutes, recovered] of [["short", 60, 5], ["long", 480, 8]]) {
  test(`formal ${restKind} rest commits once from ordinary Game and survives save/load`, async () => {
    const context = await preparedRest();
    const { f, hero, supplies, location, errors, turn: playTurn } = context;
    try {
      const before = await restState(context);
      const done = await playTurn("I eat, settle down in the loft and sleep until morning.",
        [{ kind: "formal_rest", restKind, restSafety: { locationId: location, suitable: true } }],
        (ctx) => { assert.match(ctx.input, /rest.complete/); return "You rest in the permitted loft until the agreed hour."; });
      assert.equal(done.result.status, "committed", JSON.stringify(errors));
      const after = await restState(context);
      assert.equal(after.hp, recovered);
      assert.equal(after.minutes, before.minutes + minutes);
      assert.equal(after.quantity, before.quantity - (restKind === "long" ? 1 : 0));
      assert.deepEqual(after.config.safeLocationIds, []);
      assert.equal(after.rests.length, 1);
      assert.equal(after.rests[0].status, "complete");
      assert.equal((await runAstraTurn(done.input, { store: done.store })).status, "committed");
      assert.deepEqual(await restState(context), after);
      const receipt = await f.one("select astra_ordered_effects receipt from rpg_private.turns where id=$1", [done.input.operationId]);
      assert.equal(receipt.receipt.schemaVersion, 2);
      assert.equal(receipt.receipt.effects[0].safety.operationId, done.input.operationId);
      const saved = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "After formal rest" }));
      const save = saved.snapshot.saves.find((row) => row.name === "After formal rest");
      await f.one("update public.rpg_entities set hp=1 where campaign_id=$1 and id=$2", [f.cid, hero]);
      await f.one("update public.rpg_items set quantity=0 where campaign_id=$1 and id=$2", [f.cid, supplies]);
      await f.saves(f.cid, "load", await f.command(f.cid, { saveId: save.id, label: "Formal rest restored", recovery: false }));
      assert.deepEqual(await restState(context), after);
    } finally { await f.db.close(); }
  });
}

test("formal rest with absent supplies is optional pure narration with no false recovery", async () => {
  const context = await preparedRest();
  const { f, supplies, location, errors, turn: playTurn } = context;
  try {
    await f.one("update public.rpg_items set quantity=0 where campaign_id=$1 and id=$2", [f.cid, supplies]);
    const before = await restState(context);
    const done = await playTurn("I try to settle down for the night.",
      [{ kind: "formal_rest", restKind: "long", restSafety: { locationId: location, suitable: true } }],
      (ctx) => { assert.match(ctx.input, /not_authorized/); return "Without recorded supplies, the night grants no formal recovery."; });
    assert.equal(done.result.status, "committed", JSON.stringify(errors));
    assert.deepEqual(await restState(context), before);
  } finally { await f.db.close(); }
});

test("formal rest during an active encounter remains an optional no-op with no recovery", async () => {
  const context = await preparedRest();
  const { f, location, errors, turn: playTurn } = context;
  try {
    const settings = (await f.one("select max(revision) revision from public.rpg_settings_revisions where campaign_id=$1", [f.cid])).revision;
    await f.one(`insert into public.rpg_encounters(id,campaign_id,status,round,settings_revision,public_summary)
      values($1,$2,'active',1,$3,'An active recorded encounter')`, [randomUUID(), f.cid, settings]);
    const before = await restState(context);
    const done = await playTurn("I try to rest while the encounter continues.",
      [{ kind: "formal_rest", restKind: "long", restSafety: { locationId: location, suitable: true } }],
      (ctx) => { assert.match(ctx.input, /not_authorized/); return "The ongoing encounter prevents completed rest."; });
    assert.equal(done.result.status, "committed", JSON.stringify(errors));
    assert.deepEqual(await restState(context), before);
  } finally { await f.db.close(); }
});

test("formal rest entered and interrupted on later Game turns cannot complete or recover", async () => {
  const context = await preparedRest();
  const { f, hero, location, supplies, errors, turn: playTurn } = context;
  try {
    const before = await restState(context);
    const entered = await playTurn("I settle into the permitted loft to begin resting.",
      [actions([{ kind: "rest.enter", restKind: "long", participantIds: [hero] }],
        { locationId: location, suitable: true })], () => "You settle into the loft; the rest has begun.");
    assert.equal(entered.result.status, "committed", JSON.stringify(errors));
    const restId = stableId(entered.input.operationId, "rest:0");
    const left = await playTurn("Noise wakes me before I finish; I leave the loft.",
      [actions([{ kind: "rest.leave", restId }], { locationId: location, suitable: false })],
      () => "The interruption ends the rest without recovery.");
    assert.equal(left.result.status, "committed", JSON.stringify(errors));
    const interrupted = await restState(context);
    assert.equal(interrupted.hp, before.hp);
    assert.equal(interrupted.quantity, before.quantity);
    assert.equal(interrupted.minutes, before.minutes);
    assert.equal(interrupted.rests[0].status, "interrupted");
    const completion = await playTurn("Could that interrupted rest count as completed?",
      [actions([{ kind: "rest.complete", restId, supplies: [{ itemId: supplies, quantity: 1 }] }],
        { locationId: location, suitable: true })],
      (ctx) => { assert.match(ctx.input, /not_authorized/); return "The interrupted rest grants no completed recovery."; });
    assert.equal(completion.result.status, "committed", JSON.stringify(errors));
    assert.deepEqual(await restState(context), interrupted);
  } finally { await f.db.close(); }
});

test("formal rest database failure rolls back recovery, supplies, time and rest record together", async () => {
  const context = await preparedRest();
  const { f, location, errors, turn: playTurn } = context;
  try {
    const before = await restState(context);
    await f.db.exec(`create function rpg_private.synthetic_rest_failure() returns trigger language plpgsql as $$
      begin if new.hp>old.hp then raise exception 'synthetic forced recovery failure'; end if; return new; end $$;
      create trigger synthetic_rest_failure before update on public.rpg_entities
      for each row execute function rpg_private.synthetic_rest_failure();`);
    const done = await playTurn("I sleep in the permitted loft.",
      [{ kind: "formal_rest", restKind: "long", restSafety: { locationId: location, suitable: true } }],
      () => "Morning arrives in the loft.");
    assert.equal(done.result.status, "failed", JSON.stringify(errors));
    assert.deepEqual(await restState(context), before);
  } finally { await f.db.close(); }
});

test("formal rest later integrity failure prevents the entire accepted turn from committing", async () => {
  const context = await preparedRest();
  const { f, hero, location, errors, turn: playTurn } = context;
  try {
    const before = await restState(context);
    const done = await playTurn("I rest and then try to consume a foreign Item.", [
      { kind: "formal_rest", restKind: "long", restSafety: { locationId: location, suitable: true } },
      actions([{ kind: "item.consume", actorId: hero, itemId: randomUUID(), quantity: 1 }]),
    ], () => { assert.fail("Integrity failure must precede narration"); });
    assert.equal(done.result.status, "failed", JSON.stringify(errors));
    assert.deepEqual(await restState(context), before);
  } finally { await f.db.close(); }
});

test("formal rest cooking consumes the same supplies row sequentially and activates only the current meal", async () => {
  const context = await preparedRest();
  const { f, hero, supplies, location, errors, turn: playTurn } = context;
  try {
    const pack = await f.one("select storage_id id from public.rpg_items where id=$1", [supplies]);
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: play.revision, configuration: { ...play.configuration,
        itemRules: [...play.configuration.itemRules, { itemId: supplies, tag: "meat", damage: null }] } });
    const oldEffect = randomUUID();
    await f.one("insert into public.rpg_effects(id,campaign_id,entity_id,recipe_id,definition) values($1,$2,$3,null,$4::jsonb)",
      [oldEffect, f.cid, hero, JSON.stringify({ kind: "coffee", status: "active", creatingRestId: randomUUID(), remaining: 1 })]);
    const done = await playTurn("I cook and eat one portion, then rest using another recorded portion.", ({ input }) => [actions([
      { kind: "rest.enter", restKind: "long", participantIds: [hero] },
      { kind: "recipe.prepare", actorId: hero, recipe: "meal", ingredients: [{ itemId: supplies, quantity: 1 }], outputStorageId: pack.id },
      { kind: "recipe.serve", actorId: hero, itemId: stableId(input.operationId, "prepared:1"), recipientIds: [hero] },
      { kind: "rest.complete", restId: stableId(input.operationId, "rest:0"), supplies: [{ itemId: supplies, quantity: 1 }] },
    ], { locationId: location, suitable: true })], () => "You finish the meal and rest through the night.");
    assert.equal(done.result.status, "committed", JSON.stringify(errors));
    const after = await restState(context);
    assert.equal(after.quantity, 2);
    assert.equal(after.hp, 8);
    assert.equal(after.minutes, 480);
    assert.equal(after.effects.find((row) => row.id === oldEffect).definition.status, "expired");
    assert.equal(after.effects.find((row) => row.definition.kind === "meal").definition.status, "active");
    const serving = await f.one("select quantity from public.rpg_items where id=$1", [stableId(done.input.operationId, "prepared:1")]);
    assert.equal(serving.quantity, 0);
    assert.equal((await runAstraTurn(done.input, { store: done.store })).status, "committed");
    assert.deepEqual(await restState(context), after);
  } finally { await f.db.close(); }
});

test("formal rest permits existing Item transfer then consumption through deterministic camp access", async () => {
  const context = await preparedRest();
  const { f, hero, location, errors, turn: playTurn } = context;
  try {
    const pack = await f.one("select id from public.rpg_storages where campaign_id=$1 and entity_id=$2 and kind='player'", [f.cid, hero]);
    const camp = (await f.mutation("storage.save", f.cid, { name: "Recorded camp storage", kind: "camp", entity_id: null })).id;
    const healing = (await f.mutation("item.save", f.cid, { name: "Recorded healing portion", category: "consumable", quantity: 1,
      description: "A single recorded healing portion", mechanics: "", owner_entity_id: hero,
      storage_id: pack.id, equipped_entity_id: null, equipped_slot: null })).id;
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid,
      expectedRevision: play.revision, configuration: { ...play.configuration,
        itemRules: [...play.configuration.itemRules, { itemId: healing, tag: "healing", damage: null }] } });
    const done = await playTurn("I move my healing portion to camp, take it, and finish resting.", ({ input }) => [actions([
      { kind: "rest.enter", restKind: "long", participantIds: [hero] },
      { kind: "item.transfer", actorId: hero, itemId: healing, quantity: 1, destinationStorageId: camp },
      { kind: "item.consume", actorId: hero, itemId: healing, quantity: 1 },
      { kind: "rest.complete", restId: stableId(input.operationId, "rest:0"), supplies: [{ itemId: context.supplies, quantity: 1 }] },
    ], { locationId: location, suitable: true })], () => "You take the recorded portion and finish the rest.");
    assert.equal(done.result.status, "committed", JSON.stringify(errors));
    const after = await restState(context);
    assert.equal(after.hp, 12);
    assert.equal(after.quantity, 3);
    assert.equal(after.minutes, 480);
    assert.deepEqual(await f.one("select quantity,storage_id from public.rpg_items where id=$1", [healing]), { quantity: 0, storage_id: camp });
  } finally { await f.db.close(); }
});

function resumedDependencies(f, timeline) {
  const errors = [];
  const rpc = async (args) => {
    try { return { data: await f.runtime(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) }; }
    catch (error) { errors.push({ action: args.p_action, message: error.message, where: error.where });
      return { error: { message: error.message, code: error.code } }; }
  };
  const memoryRpc = async (args) => ({ data: await f.memory(args.p_campaign_id, args.p_action, args.p_payload, args.p_timeline) });
  return { errors, store: createRpcTurnStore(f.owner, rpc, "gpt-6-astra", timeline, true),
    memory: createRpcMemoryStore(f.owner, memoryRpc, timeline),
    provider: { next: async () => { assert.fail("A pinned final must not replan"); },
      narrate: async () => { assert.fail("A pinned narration must not regenerate"); } } };
}

test("formal rest pending schema2 save restores and retries pinned safety once without provider calls", async () => {
  const context = await preparedRest();
  const { f, location, turn: playTurn } = context;
  try {
    const before = await restState(context);
    const failed = await playTurn("I sleep through the night.", [formal({ snapshot: { publicState: { current_location_id: location } } })],
      () => "You sleep through the night in the permitted loft.", true);
    assert.equal(failed.result.status, "failed");
    assert.equal(failed.result.canRetry, true);
    assert.deepEqual(await restState(context), before);
    const pin = (await f.one("select astra_ordered_effects receipt from rpg_private.turns where id=$1", [failed.input.operationId])).receipt;
    const saved = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Pinned pending rest" }));
    const save = saved.snapshot.saves.find((row) => row.name === "Pinned pending rest");
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: save.id, label: "Pending rest fork", recovery: false }));
    assert.deepEqual((await f.one("select astra_ordered_effects receipt from rpg_private.turns where id=$1", [failed.input.operationId])).receipt, pin);
    const timeline = await f.fence(f.cid), deps = resumedDependencies(f, timeline);
    const command = { commandId: randomUUID(), campaignId: f.cid, operationId: failed.input.operationId,
      timeline, action: "retry", checkId: null };
    const resumed = await resumeAstraTurn(command, deps);
    assert.equal(resumed.status, "committed", JSON.stringify(deps.errors));
    const after = await restState(context);
    assert.equal(after.hp, 8);
    assert.equal(after.quantity, 3);
    assert.equal(after.minutes, 480);
    assert.equal((await resumeAstraTurn(command, deps)).status, "committed");
    assert.deepEqual(await restState(context), after);
  } finally { await f.db.close(); }
});

test("formal rest commit independently rejects forged recovery, time and safety pins", async () => {
  const context = await preparedRest();
  const { f, location, turn: playTurn } = context;
  try {
    const before = await restState(context);
    const failed = await playTurn("I rest in the loft.",
      [{ kind: "formal_rest", restKind: "long", restSafety: { locationId: location, suitable: true } }],
      () => "You rest until morning.", true);
    const original = (await f.one("select astra_ordered_effects receipt from rpg_private.turns where id=$1", [failed.input.operationId])).receipt;
    const changes = [
      (pin) => { pin.effects[0].resolution.changes.find((row) => row.family === "entities").values.hp = 12; },
      (pin) => { pin.effects[0].resolution.worldMinutes = 999; },
      (pin) => { pin.effects[0].safety.locationId = randomUUID(); },
      (pin) => { pin.effects[0].safety.operationId = randomUUID(); },
      (pin) => { pin.effects[0].safety.timeline.epoch += 1; },
    ];
    for (const change of changes) {
      const pin = structuredClone(original); change(pin);
      await f.one("update rpg_private.turns set astra_ordered_effects=$2::jsonb where id=$1", [failed.input.operationId, JSON.stringify(pin)]);
      const claim = await f.runtime(f.cid, "claim", { operationId: failed.input.operationId });
      const cp = claim.turn.checkpoint;
      await assert.rejects(() => f.runtime(f.cid, "commit", { ...claim.lease, packet: {
        narration: cp.narration.narration, visualDescription: cp.narration.visualDescription,
        resolution: cp.astraPrimary.finalProposal.resolution, privatePatches: cp.astraPrimary.finalProposal.privatePatches,
        checks: cp.checks, guidanceProposal: null,
      } }), /rpg_validation/);
      assert.deepEqual(await restState(context), before);
      await f.runtime(f.cid, "fail", { ...claim.lease, failure: "unavailable", retryable: true });
    }
  } finally { await f.db.close(); }
});
