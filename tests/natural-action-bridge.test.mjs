import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { setup, examples, usage } from "./universal-bootstrap-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { worldLogicTurnPreparer, worldTurnPreparer } from "../src/lib/production/turn-world.ts";
import { initialCreationReview } from "../src/lib/adventures/bootstrap-validation.ts";
import { combatReadinessNeeded } from "../src/lib/gameplay/combat-readiness.ts";

async function harness(example = examples.fantasy) {
  const f = await setup(example, "en", 35);
  await f.create();
  await f.startOpening();
  const runtime = async (a) => {
    try { return { data: await f.runtime(a.p_campaign_id, a.p_action, a.p_payload, a.p_timeline) }; }
    catch (e) { return { error: { code: e.code, message: e.message } }; }
  };
  const world = async (a) => {
    try { return { data: (await f.one("select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result", [a.p_owner_id, a.p_campaign_id, a.p_action, JSON.stringify(a.p_payload), JSON.stringify(a.p_timeline)])).result }; }
    catch (e) { return { error: { code: e.code, message: e.message } }; }
  };
  const store = createRpcTurnStore(f.owner, runtime, "gpt-6-astra", await f.fence(f.cid));
  async function turn(text, output, narration = "The innkeeper answers in his own words.", mechanic = null, onCommit = null) {
    const play = await store.readPlay(f.cid);
    const input = { operationId: randomUUID(), campaignId: f.cid, timeline: play.timeline, expectedRevision: play.revision, mode: mechanic ? "mechanic" : "game", input: text, companionId: null, listenerIds: [], mechanic };
    const deps = {
      store: onCommit ? { ...store, commit: async (lease, packet) => { await onCommit(packet, input); return store.commit(lease, packet); } } : store,
      provider: { plan: () => assert.fail("dm.plan"), feedback: () => assert.fail("feedback"), narrate: async () => ({ usage, output: { narration, visualDescription: "", clarification: null } }) },
      prepareWorldLogic: worldLogicTurnPreparer(world, { action: async (i) => ({ usage, output: { ...output, input: i.input.input } }) }),
      prepareWorld: worldTurnPreparer(world),
    };
    let result = await runTurn(input, deps);
    if (result.status === "awaiting_confirmation")
      result = await resumeTurn({ commandId: randomUUID(), campaignId: f.cid, operationId: input.operationId, timeline: input.timeline, action: "continue", checkId: null }, deps);
    return { input, deps, result };
  }
  const npc = (await f.snapshot()).entities.find((e) => e.kind === "npc");
  return { f, turn, npc };
}

async function ready(f, npc, item = null) {
  await f.one('update public.rpg_entities set hp=10,max_hp=10,stats=\'{"attack":1,"defense":10,"skill":0}\'::jsonb where campaign_id=$1 and id in ($2,$3)', [f.cid, f.hero, npc.id]);
  if (item) {
    await f.one("update public.rpg_items set category='weapon',equipped_entity_id=$2,equipped_slot='hand' where campaign_id=$1 and id=$3", [f.cid, f.hero, item.id]);
    await f.one('update public.rpg_entities set equipment_slots=\'[{"id":"hand","label":"Hand","accepts":["weapon"]}]\'::jsonb where campaign_id=$1 and id=$2', [f.cid, f.hero]);
  }
  const play = await f.runtime(f.cid, "play");
  await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid, expectedRevision: play.revision, configuration: { profile: "console-basic-v1", controlledEntityIds: [f.hero], presentEntityIds: [f.hero, npc.id], nearbyStorageIds: [], safeLocationIds: [], itemRules: item ? [{ itemId: item.id, tag: "weapon", damage: 3 }] : [] } });
}

async function combatReview(f, action, payload = {}, campaignId = f.cid, owner = f.owner) {
  return (await f.one("select public.rpg_combat_readiness($1,$2,$3,$4::jsonb) result", [owner, campaignId, action, JSON.stringify(payload)])).result;
}

function approval(proposal, weaponIndex = null, weaponDamage = null) {
  return {
    requestId: randomUUID(), proposal,
    player: {
      hp: proposal.hero.hp === null ? 10 : null,
      attack: proposal.hero.attack === null ? 0 : null,
      defense: proposal.hero.defense === null ? 10 : null,
      skill: proposal.hero.skill === null ? 0 : null,
    },
    weaponIndex, weaponDamage,
  };
}

test("historical combat review is read-only; explicit approval prepares owner-shaped sword attack exactly once", async () => {
  const example = { ...examples.fantasy, description: "I carry a longsword. I know navigation and careful observation. I cannot cast spells.", item: "longsword", npc: "Innkeeper", location: "Inn common room", situation: "The innkeeper stands behind the counter.", narration: "At the inn, the innkeeper stands behind the counter." };
  const { f, turn, npc } = await harness(example);
  try {
    const old = (await f.snapshot()).items.find((item) => item.name === "longsword");
    await f.one("delete from public.rpg_items where campaign_id=$1 and id=$2", [f.cid, old.id]);
    // The real older owner runtime stores the unset profile as JSON null.
    await f.one("update rpg_private.runtime_state set configuration='null'::jsonb where campaign_id=$1 returning revision", [f.cid]);
    const before = await f.snapshot();
    const worldBefore = await f.one("select world,loop_state from rpg_private.world_foundations where campaign_id=$1", [f.cid]);
    const proposal = await combatReview(f, "inspect");
    assert.equal(proposal.hero.name, example.name);
    assert.equal(proposal.hero.hp, null);
    assert.equal(proposal.npcs.length, 1);
    assert.equal(proposal.npcs[0].name, npc.name);
    assert.equal(proposal.possessions[0].name, "longsword");
    assert.equal(proposal.possessions[0].itemId, null);
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual(await combatReview(f, "inspect"), proposal);
    const command = approval(proposal, 1, 3);
    assert.deepEqual(await combatReview(f, "confirm", command), { campaignId: f.cid, requestId: command.requestId, ready: true });
    const after = await f.snapshot();
    assert.deepEqual(await f.one("select world,loop_state from rpg_private.world_foundations where campaign_id=$1", [f.cid]), worldBefore);
    const sword = after.items.find((item) => item.name === "longsword");
    assert.ok(sword);
    assert.equal(sword.quantity, 1);
    assert.equal(sword.equipped_entity_id, f.hero);
    assert.equal(after.entities.find((e) => e.id === f.hero).hp, 10);
    assert.deepEqual(after.entities.find((e) => e.id === npc.id).stats, { attack: 0, defense: 10, skill: 0 });
    assert.equal(after.entities.find((e) => e.id === npc.id).hp, 8);
    const play = await f.runtime(f.cid, "play");
    assert.deepEqual(play.configuration.controlledEntityIds, [f.hero]);
    assert.ok(play.configuration.presentEntityIds.includes(npc.id));
    assert.ok(play.configuration.itemRules.some((rule) => rule.itemId === sword.id && rule.tag === "weapon" && rule.damage === 3));
    assert.deepEqual(await combatReview(f, "confirm", command), { campaignId: f.cid, requestId: command.requestId, ready: true });
    assert.equal((await f.snapshot()).items.filter((item) => item.name === "longsword").length, 1);
    assert.equal((await turn("I attack innkeeper with my sword", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: sword.id, equipmentName: sword.name }, "You swing your longsword.")).result.status, "committed");
  } finally { await f.db.close(); }
});

test("explicit approved Starting gear line repairs an omitted sword; general weapon ability alone does not", async () => {
  const description = "A traveller who can use a sword. I know navigation and careful observation. I cannot cast spells.\nStarting gear: short sword, longsword, hunting bow with 50 arrows, sword maintenance kit.";
  const example = { ...examples.fantasy, description, item: undefined, npc: "Innkeeper", location: "Inn common room", situation: "The innkeeper stands behind the counter.", narration: "The innkeeper stands behind the counter." };
  const { f, turn, npc } = await harness(example);
  try {
    const proposal = await combatReview(f, "inspect");
    assert.deepEqual(proposal.possessions.map((item) => item.name), ["short sword", "longsword", "hunting bow with 50 arrows"]);
    assert.ok(proposal.possessions.every((item) => item.itemId === null));
    const before = await f.snapshot();
    assert.deepEqual((await f.snapshot()).items, before.items);
    await combatReview(f, "confirm", approval(proposal, 2, 3));
    const after = await f.snapshot();
    assert.deepEqual(after.items.map((item) => item.name), ["longsword"]);
    assert.equal(after.items[0].equipped_entity_id, f.hero);
    assert.equal((await turn("I attack innkeeper with my sword", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: after.items[0].id, equipmentName: "longsword" }, "You swing the longsword.")).result.status, "committed");
  } finally { await f.db.close(); }
  const abilityOnly = await setup({ ...examples.fantasy, description: "I can use a sword. I know navigation and careful observation. I cannot cast spells.", item: undefined }, "en", 35);
  try {
    await abilityOnly.create();
    await abilityOnly.startOpening();
    assert.deepEqual((await combatReview(abilityOnly, "inspect")).possessions, []);
  } finally { await abilityOnly.db.close(); }
});

test("review preserves existing mechanics and does not adopt unapproved prose gear or foreign records", async () => {
  const { f, npc } = await harness();
  try {
    await f.one("update public.rpg_entities set hp=13,max_hp=17,stats='{\"attack\":2}'::jsonb where campaign_id=$1 and id=$2", [f.cid, f.hero]);
    await f.one("update public.rpg_entities set hp=5,max_hp=9,stats='{\"defense\":13}'::jsonb where campaign_id=$1 and id=$2", [f.cid, npc.id]);
    const proposal = await combatReview(f, "inspect");
    assert.equal(proposal.hero.hp, 13);
    assert.equal(proposal.hero.attack, 2);
    assert.equal(proposal.npcs[0].hp, 5);
    assert.equal(proposal.npcs[0].defense, 13);
    assert.ok(proposal.possessions.every((item) => item.name !== "sword"));
    await assert.rejects(combatReview(f, "confirm", approval(proposal, 3, 2)), /rpg_validation/);
    const foreign = await f.campaign("Other campaign");
    const foreignNpc = (await f.mutation("entity.save", foreign, { kind: "npc", name: "Foreign NPC", details: "Other campaign", hp: 8, max_hp: 8, stats: {}, resources: {}, conditions: [], equipment_slots: [] })).id;
    const forged = structuredClone(proposal);
    forged.npcs[0].id = foreignNpc;
    await assert.rejects(combatReview(f, "confirm", approval(forged)), /rpg_conflict/);
    await assert.rejects(combatReview(f, "confirm", approval(proposal), foreign), /rpg_validation|rpg_conflict/);
    const command = approval(proposal);
    command.player.hp = 10;
    await assert.rejects(combatReview(f, "confirm", command), /rpg_validation/);
    command.player.hp = null;
    await combatReview(f, "confirm", command);
    const after = await f.snapshot();
    assert.equal(after.entities.find((e) => e.id === f.hero).hp, 13);
    assert.equal(after.entities.find((e) => e.id === f.hero).max_hp, 17);
    assert.equal(after.entities.find((e) => e.id === f.hero).stats.attack, 2);
    assert.equal(after.entities.find((e) => e.id === npc.id).hp, 5);
    assert.equal(after.entities.find((e) => e.id === npc.id).stats.defense, 13);
    assert.ok(after.items.every((item) => item.name !== "sword"));
  } finally { await f.db.close(); }
});

test("only one of multiple approved possessions becomes the equipped weapon", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword and a bow. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const f = await setup(example, "en", 35);
  try {
    f.creation.possessions.push({ name: "bow", quantity: 1, description: "", quote: "bow" });
    await f.create();
    await f.startOpening();
    const proposal = await combatReview(f, "inspect");
    assert.equal(proposal.possessions.length, 2);
    await combatReview(f, "confirm", approval(proposal, 2, 2));
    const items = (await f.snapshot()).items;
    assert.equal(items.filter((item) => item.equipped_entity_id === f.hero).length, 1);
    assert.equal(items.find((item) => item.equipped_entity_id === f.hero).name, "bow");
  } finally { await f.db.close(); }
});

test("mechanics-aware new campaign opens with generic visible NPC readiness and needs no historical review", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const f = await setup(example, "en", 35);
  try {
    const review = { ...initialCreationReview(f.input, f.creation), mechanics: { hp: 10, attack: 0, defense: 10, skill: 0, weaponName: "sword", weaponDamage: 2 } };
    await f.create(review);
    await f.startOpening();
    const proposal = await combatReview(f, "inspect");
    const npc = proposal.npcs[0];
    const play = await f.runtime(f.cid, "play");
    assert.equal(npc.hp, 8);
    assert.equal(npc.attack, 0);
    assert.equal(npc.defense, 10);
    assert.equal(npc.skill, 0);
    assert.ok(play.configuration.presentEntityIds.includes(npc.id));
    assert.equal(combatReadinessNeeded(proposal), false);
  } finally { await f.db.close(); }
});

test("one historical review prepares every currently visible autonomous person", async () => {
  const f = await setup(examples.fantasy, "en", 35);
  try {
    f.opening.actors.push({ name: "Road traveler", description: "A traveler waits nearby.", capabilities: ["ordinary public conversation"], limitations: [] });
    await f.create();
    await f.startOpening();
    const proposal = await combatReview(f, "inspect");
    assert.deepEqual(proposal.npcs.map((person) => person.name).sort(), ["Local work organiser", "Road traveler"]);
    await combatReview(f, "confirm", approval(proposal));
    const after = await f.snapshot();
    assert.ok(after.entities.filter((person) => person.kind === "npc").every((person) => person.hp === 8 && person.max_hp === 8));
    const present = (await f.runtime(f.cid, "play")).configuration.presentEntityIds;
    assert.ok(proposal.npcs.every((person) => present.includes(person.id)));
  } finally { await f.db.close(); }
});

test("late readiness validation failure rolls back entity, item and configuration writes", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const { f } = await harness(example);
  try {
    const sword = (await f.snapshot()).items.find((item) => item.name === "sword");
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", { requestId: randomUUID(), campaignId: f.cid, expectedRevision: play.revision, configuration: { profile: "console-basic-v1", controlledEntityIds: [f.hero], presentEntityIds: [f.hero], nearbyStorageIds: [], safeLocationIds: [], itemRules: [{ itemId: sword.id, tag: "weapon", damage: 3 }] } });
    const proposal = await combatReview(f, "inspect");
    const before = await f.snapshot();
    const priorPlay = await f.runtime(f.cid, "play");
    const command = approval(proposal, 1, 2);
    await assert.rejects(combatReview(f, "confirm", command), /rpg_validation/);
    assert.deepEqual(await f.snapshot(), before);
    assert.deepEqual((await f.runtime(f.cid, "play")).configuration, priorPlay.configuration);
    command.weaponDamage = 3;
    await combatReview(f, "confirm", command);
    assert.equal((await f.snapshot()).items.find((item) => item.id === sword.id).equipped_entity_id, f.hero);
  } finally { await f.db.close(); }
});

test("present autonomous NPC conversation commits with no transfer and no generic receipt in narration", async () => {
  const { f, turn, npc } = await harness();
  try {
    const before = await f.snapshot();
    const { result } = await turn("Give me all your gold.", {
      schemaVersion: 2, actorId: f.hero, action: "speak", outcome: "completed",
      uncertainty: "resolved", capabilityRefs: [],
      circumstanceRefs: [`actor:${npc.id}`], evidenceIndexes: [],
      publicText: "The innkeeper hears the demand.", elapsedMinutes: 0,
      destinationId: null, consequences: [],
    }, "He raises an eyebrow. 'No.'");
    assert.equal(result.status, "committed", JSON.stringify(result));
    assert.match(result.narration, /raises an eyebrow/);
    assert.doesNotMatch(result.narration, /performs the requested action/);
    assert.deepEqual((await f.snapshot()).items, before.items);
  } finally { await f.db.close(); }
});

test("ordinary banter and mundane action resolve without generic engine receipts or hidden facts", async () => {
  const { f, turn, npc } = await harness();
  try {
    for (const [text, action, narration] of [
      ["I pee beside the inn entrance", "attempt", "You step aside near the inn entrance."],
      ["What's your secret? You people are ridiculously attractive.", "speak", "The innkeeper laughs and credits the good weather."],
      ["you know. this town has hottest chicks ive ever seen. is it climate? or whats your guys secret?", "speak", "The innkeeper jokes about the sunlight."],
      ["I threaten him until he tells me who the secret murderer is", "speak", "The innkeeper recoils, but claims no knowledge of a murderer."],
    ]) {
      const { result } = await turn(text, { schemaVersion: 2, actorId: f.hero, action, outcome: "completed", uncertainty: "resolved", capabilityRefs: [], circumstanceRefs: [`actor:${npc.id}`], evidenceIndexes: [], publicText: "The innkeeper is present.", elapsedMinutes: 0, destinationId: null, consequences: [] }, narration);
      assert.equal(result.status, "committed", JSON.stringify(result));
      assert.equal(result.narration, narration);
      assert.doesNotMatch(result.narration, /performs the requested action/);
    }
  } finally { await f.db.close(); }
});

test("missing mechanics records cannot create a partial encounter", async () => {
  const { f, turn, npc } = await harness();
  try {
    const { result } = await turn("I attack the innkeeper", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: null, equipmentName: null });
    assert.equal(result.status, "failed");
    assert.equal((await f.query("select id from public.rpg_encounters where campaign_id=$1", [f.cid])).length, 0);
    assert.equal((await f.query("select id from public.rpg_pending_actions where campaign_id=$1", [f.cid])).length, 0);
  } finally { await f.db.close(); }
});

test("free-text unarmed attack starts and resolves one atomic encounter action", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    const { input, deps, result } = await turn("I attack the innkeeper", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: null, equipmentName: null }, "You swing at the innkeeper.");
    assert.equal(result.status, "committed", JSON.stringify(result));
    assert.equal((await f.query("select id from public.rpg_encounters where campaign_id=$1", [f.cid])).length, 1);
    assert.deepEqual(await runTurn(input, deps), result);
    assert.equal((await f.query("select id from public.rpg_encounters where campaign_id=$1", [f.cid])).length, 1);
  } finally { await f.db.close(); }
});

test("approved equipped sword uses the existing attack mechanic", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const { f, turn, npc } = await harness(example);
  try {
    const sword = (await f.snapshot()).items.find((item) => item.name === "sword");
    assert.ok(sword);
    await ready(f, npc, sword);
    const strike = await turn("I attack the innkeeper with my sword", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: sword.id, equipmentName: "sword" }, "You swing the approved sword.");
    assert.equal(strike.result.status, "committed", JSON.stringify(strike.result));
    const actions = await f.query("select * from public.rpg_pending_actions where campaign_id=$1", [f.cid]);
    assert.equal(actions.length, 1);
    assert.deepEqual(await runTurn(strike.input, strike.deps), strike.result);
  } finally { await f.db.close(); }
});

test("compound mug and gold input resolves only an authorized attempt", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    const before = await f.snapshot();
    const result = await turn("I grab a mug from the nearest table, throw it in the innkeeper's face, and while he's stunned I grab the gold from the counter.", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "improvise", itemId: null, equipmentName: null }, "You reach for the mug and throw it. The result leaves you a choice; you have not taken any gold.");
    assert.equal(result.result.status, "committed", JSON.stringify(result.result));
    const after = await f.snapshot();
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.quests, before.quests);
    assert.deepEqual(after.entities.map((e) => e.conditions), before.entities.map((e) => e.conditions));
    assert.equal((await f.query("select id from public.rpg_pending_actions where campaign_id=$1", [f.cid])).length, 1);
  } finally { await f.db.close(); }
});

test("throwing an approved sword uses a check without inventing damage or an item transfer", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const { f, turn, npc } = await harness(example);
  try {
    const sword = (await f.snapshot()).items.find((item) => item.name === "sword");
    await ready(f, npc, sword);
    const before = await f.snapshot();
    const { result } = await turn("I throw my sword at him", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "improvise", itemId: sword.id, equipmentName: sword.name }, "The throw is a physical attempt; its outcome does not establish injury or lost gear.");
    assert.equal(result.status, "committed", JSON.stringify(result));
    const after = await f.snapshot();
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.items, before.items);
  } finally { await f.db.close(); }
});

test("active combat free text and optional Combat control share the turn budget", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    const attack = { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: null, equipmentName: null };
    assert.equal((await turn("I attack the innkeeper", attack, "You strike.")).result.status, "committed");
    assert.equal((await turn("End my turn", null, "", { kind: "encounter.action", actorId: f.hero, action: "end-turn", targetId: null, itemId: null, position: null })).result.status, "committed");
    assert.equal((await turn("End his turn", null, "", { kind: "encounter.action", actorId: npc.id, action: "end-turn", targetId: null, itemId: null, position: null })).result.status, "committed");
    const follow = await turn("I slash him", attack, "You swing again.");
    assert.equal(follow.result.status, "committed", JSON.stringify(follow.result));
    assert.equal((await f.query("select id from public.rpg_encounters where campaign_id=$1", [f.cid])).length, 1);
    assert.equal((await f.query("select id from public.rpg_pending_actions where campaign_id=$1", [f.cid])).length, 4);
  } finally { await f.db.close(); }
});

test("a foreign target cannot enter the mechanic bridge or create an encounter", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    const other = await f.campaign("Unrelated campaign");
    const foreign = (await f.mutation("entity.save", other, { kind: "npc", name: "Other innkeeper", details: "Other campaign", hp: 10, max_hp: 10, stats: {}, resources: {}, conditions: [], equipment_slots: [] })).id;
    const { result } = await turn("I attack the other innkeeper", { schemaVersion: 4, actorId: f.hero, targetId: foreign, method: "attack", itemId: null, equipmentName: null });
    assert.equal(result.status, "failed");
    assert.equal((await f.query("select id from public.rpg_encounters where campaign_id=$1", [f.cid])).length, 0);
  } finally { await f.db.close(); }
});

test("private SQL guard rejects a hitchhiking target stat change even with a forged checkpoint", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    const { result } = await turn("I attack the innkeeper", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: null, equipmentName: null }, "You swing.", null, async (packet, input) => {
      const saved = await f.one("select checkpoint,source from rpg_private.turns where id=$1", [input.operationId]);
      const target = saved.source.snapshot.entities.find((row) => row.id === npc.id);
      const attempts = [
        { family: "entities", id: npc.id, expectedRevision: target.revision, values: { stats: { attack: 99 } } },
        { family: "entities", id: npc.id, expectedRevision: target.revision, values: { resources: { gold: 999 } } },
        { family: "items", id: randomUUID(), expectedRevision: null, values: { name: "Forged gold" } },
        { family: "quests", id: randomUUID(), expectedRevision: null, values: { status: "complete" } },
      ];
      for (const added of attempts) {
        const forged = structuredClone(saved.checkpoint);
        forged.resolution.changes.push(added);
        const badPacket = { ...packet, resolution: forged.resolution };
        await assert.rejects(f.one("select rpg_private.natural_mechanic_validate($1,$2,jsonb_populate_record(t,jsonb_build_object('checkpoint',$3::jsonb)),$4::jsonb) result from rpg_private.turns t where t.id=$5", [f.owner, f.cid, JSON.stringify(forged), JSON.stringify(badPacket), input.operationId]), /rpg_validation/);
      }
    });
    assert.equal(result.status, "committed");
    assert.notEqual((await f.snapshot()).entities.find((row) => row.id === npc.id).stats.attack, 99);
  } finally { await f.db.close(); }
});

test("World Logic save/load restores the active encounter and resolved first action", async () => {
  const { f, turn, npc } = await harness();
  try {
    await ready(f, npc);
    assert.equal((await turn("I attack the innkeeper", { schemaVersion: 4, actorId: f.hero, targetId: npc.id, method: "attack", itemId: null, equipmentName: null })).result.status, "committed");
    const before = await f.snapshot();
    const priorPlay = await f.runtime(f.cid, "play");
    const created = await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "During combat" }));
    const save = created.snapshot.saves.find((row) => row.name === "During combat");
    assert.ok(save);
    await f.saves(f.cid, "load", await f.command(f.cid, { saveId: save.id, label: "Restored combat", recovery: false }));
    const after = await f.snapshot();
    const restoredPlay = await f.runtime(f.cid, "play");
    const withoutBranchStamp = (rows) => rows.map((row) => {
      const copy = { ...row };
      delete copy.timeline;
      return copy;
    });
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(withoutBranchStamp(restoredPlay.encounters), withoutBranchStamp(priorPlay.encounters));
    assert.deepEqual(withoutBranchStamp(restoredPlay.participants), withoutBranchStamp(priorPlay.participants));
    assert.deepEqual(withoutBranchStamp(restoredPlay.pendingActions), withoutBranchStamp(priorPlay.pendingActions));
  } finally { await f.db.close(); }
});

test("explicit new-character combat review persists HP, profile and only approved equipped gear", async () => {
  const example = { ...examples.fantasy, description: "I carry a sword. I know navigation and careful observation. I cannot cast spells.", item: "sword" };
  const f = await setup(example, "en", 35);
  try {
    const review = {
      ...initialCreationReview(f.input, f.creation),
      mechanics: { hp: 11, attack: 2, defense: 12, skill: 1, weaponName: "sword", weaponDamage: 3 },
    };
    await f.create(review);
    const saved = await f.snapshot();
    const hero = saved.entities.find((e) => e.id === f.hero);
    const sword = saved.items.find((item) => item.name === "sword");
    const play = await f.runtime(f.cid, "play");
    assert.equal(hero.hp, 11);
    assert.equal(hero.max_hp, 11);
    assert.deepEqual(hero.stats, { attack: 2, defense: 12, skill: 1 });
    assert.equal(sword.owner_entity_id, f.hero);
    assert.equal(sword.equipped_entity_id, f.hero);
    assert.equal(saved.settings.values.rulesSystem.id, "world-logic-v1");
    assert.ok(play.configuration.itemRules.some((rule) => rule.itemId === sword.id && rule.tag === "weapon" && rule.damage === 3));
    assert.deepEqual(await f.service.perform(f.creationCommit), { requestId: f.creationCommit.input.requestId, campaignId: f.cid, heroId: f.hero });
  } finally { await f.db.close(); }
});

test("populated migration 34 to 35 preserves all rows and changes only reviewed function authority", async () => {
  const f = await setup(examples.fantasy, "en", 34);
  try {
    await f.create();
    await f.startOpening();
    await f.saves(f.cid, "create", await f.command(f.cid, { kind: "manual", name: "Before 35" }));
    // Query tables individually so that a schema change also changes the table list.
    const tables = await f.query("select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like 'rpg_%' order by 1,2");
    const fingerprints = async () => Promise.all(tables.map(async ({schemaname,tablename}) => {
      const { hash } = await f.one(`select md5(coalesce(jsonb_agg(to_jsonb(t) order by to_jsonb(t)::text)::text,'[]')) hash from ${schemaname}.${tablename} t`);
      return [`${schemaname}.${tablename}`, hash];
    }));
    const before = await fingerprints();
    const functions = async () => f.query("select n.nspname||'.'||p.proname||'('||pg_get_function_identity_arguments(p.oid)||')' signature,md5(pg_get_functiondef(p.oid)) hash from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','rpg_private') and p.proname like 'rpg_%' or n.nspname='rpg_private' order by 1");
    const oldFunctions = new Map((await functions()).map((row) => [row.signature,row.hash]));
    const oldSnapshot = await f.snapshot();
    await f.db.exec(await readFile(new URL("../supabase/migrations/202610030035_world_logic_natural_action_bridge.sql", import.meta.url), "utf8"));
    assert.deepEqual(await fingerprints(), before);
    assert.deepEqual(await f.snapshot(), oldSnapshot);
    assert.deepEqual(await f.query("select schemaname,tablename from pg_tables where schemaname in ('public','rpg_private') and tablename like 'rpg_%' order by 1,2"), tables);
    const allowed = new Set(["world_validate_settlement_before_wave3", "rpg_runtime_phase2", "timeline_stamp", "natural_mechanic_validate", "rpg_runtime_wave3", "bootstrap_review", "rpg_bootstrap", "combat_weapon_label", "combat_readiness_proposal", "rpg_combat_readiness"]);
    const changed = (await functions()).filter((row) => oldFunctions.get(row.signature) !== row.hash).map((row) => row.signature);
    assert.ok(changed.length > 0);
    assert.ok(changed.every((name) => [...allowed].some((part) => name.includes(`.${part}(`))), JSON.stringify(changed));
  } finally { await f.db.close(); }
});
