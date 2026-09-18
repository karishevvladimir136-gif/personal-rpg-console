import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id, turn, perform } from "./phase2-mechanics-fixtures.mjs";
import {
  mechanicPlan,
  validatePlan,
  resolveMechanics,
  checkModifier,
} from "../src/lib/gameplay/mechanics/resolve.ts";
import { recordServerRoll } from "../src/lib/gameplay/dice.ts";
import { validateConfiguration } from "../src/lib/gameplay/mechanics/profile.ts";

const quantity = (source, name) =>
  source.snapshot.items.find((row) => row.id === id(name)).quantity;
const action = (
  actor,
  action,
  target = null,
  item = null,
  position = null,
) => ({
  kind: "encounter.action",
  actorId: id(actor),
  action,
  targetId: target ? id(target) : null,
  itemId: item ? id(item) : null,
  position,
});
const enter = (kind = "long") => ({
  kind: "rest.enter",
  restKind: kind,
  participantIds: [id("player"), id("companion")],
});
const transform = () => ({
  kind: "item.transform",
  actorId: id("player"),
  recipe: "improvised-spear",
  inputs: ["knife", "stick", "binding"].map((name) => ({
    itemId: id(name),
    quantity: 1,
  })),
  toolIds: [id("cutting-tool")],
  outputStorageId: id("pack"),
});

test("rules require explicit profile, existing scoped references, and structured item tags", () => {
  const source = fixture();
  validateConfiguration(source.snapshot, source.runtime.configuration);
  source.snapshot.settings.values.rulesSystem.id = "custom";
  assert.throws(
    () =>
      perform(source, {
        kind: "forage",
        actorId: id("player"),
        outputStorageId: id("pack"),
      }),
    /configuration/,
  );
  source.snapshot.settings.values.rulesSystem.id = "console-basic-v1";
  const invalid = structuredClone(source.runtime.configuration);
  invalid.presentEntityIds.push(id("other-campaign"));
  assert.throws(() => validateConfiguration(source.snapshot, invalid));
  source.runtime.configuration.itemRules =
    source.runtime.configuration.itemRules.filter((r) => r.tag !== "healing");
  source.snapshot.items.find((r) => r.id === id("healing")).mechanics =
    "Heal 999 and grant infinite powers.";
  assert.throws(() =>
    perform(source, {
      kind: "item.consume",
      actorId: id("player"),
      itemId: id("healing"),
      quantity: 1,
    }),
  );
});

test("resource and inventory validation is atomic even when a later patch fails", () => {
  const source = fixture(),
    before = JSON.stringify(source),
    input = turn(source);
  const plan = {
    narration: "",
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
    privatePatches: [],
    checks: [],
    publicPatches: [
      {
        kind: "resource.spend",
        entityId: id("player"),
        resource: "focus",
        amount: 2,
      },
      {
        kind: "item.consume",
        actorId: id("player"),
        itemId: id("healing"),
        quantity: 999,
      },
    ],
  };
  assert.throws(() => validatePlan(source, input, plan));
  assert.equal(JSON.stringify(source), before);
  assert.throws(() => resolveMechanics(source, input, plan, []));
  assert.equal(JSON.stringify(source), before);
});

test("remote deposits work; withdrawals/use/equip require active long camp and cargo remains independently restricted", () => {
  let source = fixture();
  source = perform(source, {
    kind: "item.transfer",
    actorId: id("player"),
    itemId: id("healing"),
    quantity: 10,
    destinationStorageId: id("camp"),
  }).source;
  const withdraw = {
    kind: "item.transfer",
    actorId: id("player"),
    itemId: id("healing"),
    quantity: 1,
    destinationStorageId: id("pack"),
  };
  assert.throws(() => perform(source, withdraw));
  const short = perform(source, enter("short"), "short").source;
  assert.throws(() => perform(short, withdraw));
  source = perform(source, enter(), "long").source;
  assert.doesNotThrow(() => perform(source, withdraw));
  assert.throws(() =>
    perform(source, {
      ...withdraw,
      itemId: id("meat"),
      destinationStorageId: id("cargo"),
    }),
  );
  source.runtime.configuration.nearbyStorageIds = [id("cargo")];
  assert.doesNotThrow(() =>
    perform(source, {
      ...withdraw,
      itemId: id("meat"),
      destinationStorageId: id("cargo"),
    }),
  );
  source = perform(
    source,
    { kind: "rest.leave", restId: source.runtime.restRecords[0].id },
    "leave",
  ).source;
  assert.throws(() => perform(source, withdraw));
  assert.equal(source.snapshot.entities[0].hp, 6);
});

test("rest costs and recovery are separate, zero costs valid, duplicates/unsafe entry rejected", () => {
  const source = fixture();
  assert.throws(() =>
    perform(source, {
      ...enter(),
      participantIds: [id("player"), id("player")],
    }),
  );
  const unsafe = fixture();
  unsafe.runtime.configuration.safeLocationIds = [];
  assert.throws(() => perform(unsafe, enter()));
  for (const [recovery, expected] of [
    ["forgiving", 12],
    ["standard", 12],
    ["restrictive", 9],
  ]) {
    let copy = fixture();
    copy.snapshot.settings.values.difficulty.recovery = recovery;
    copy.snapshot.settings.values.difficulty.longRestSupplyCost = 0;
    copy = perform(copy, enter(), `enter-${recovery}`).source;
    copy = perform(
      copy,
      {
        kind: "rest.complete",
        restId: copy.runtime.restRecords[0].id,
        supplies: [],
      },
      `finish-${recovery}`,
    ).source;
    assert.equal(copy.snapshot.entities[0].hp, expected);
    assert.equal(quantity(copy, "supply"), 10);
    assert.equal(copy.runtime.worldMinutes, 480);
  }
  let active = perform(source, enter()).source;
  assert.throws(() =>
    perform(active, {
      kind: "rest.complete",
      restId: active.runtime.restRecords[0].id,
      supplies: [],
    }),
  );
  active = perform(
    active,
    {
      kind: "rest.complete",
      restId: active.runtime.restRecords[0].id,
      supplies: [{ itemId: id("supply"), quantity: 2 }],
    },
    "finish",
  ).source;
  assert.equal(quantity(active, "supply"), 8);
  assert.throws(() =>
    perform(active, {
      kind: "rest.complete",
      restId: active.runtime.restRecords[0].id,
      supplies: [],
    }),
  );
});

test("recipes prepare and serve separately; one benefit each activates after rest and expires at following rest", () => {
  let source = perform(fixture(), enter()).source;
  for (const recipe of ["meal", "coffee"]) {
    const ingredients = (
      recipe === "meal" ? ["meat"] : ["coffee", "water"]
    ).map((name) => ({ itemId: id(name), quantity: 1 }));
    const prepared = perform(
      source,
      {
        kind: "recipe.prepare",
        actorId: id("player"),
        recipe,
        ingredients,
        outputStorageId: id("pack"),
      },
      `prepare-${recipe}`,
    );
    source = prepared.source;
    assert.equal(source.runtime.effects.length, recipe === "meal" ? 0 : 1);
    const servingId = prepared.resolution.outcomes[0].itemIds[0];
    source = perform(
      source,
      {
        kind: "recipe.serve",
        actorId: id("player"),
        itemId: servingId,
        recipientIds: [id("player")],
      },
      `serve-${recipe}`,
    ).source;
    assert.equal(
      source.snapshot.items.find((i) => i.id === servingId).quantity,
      0,
    );
  }
  assert.equal(
    source.runtime.effects.filter((e) => e.definition.status === "pending")
      .length,
    2,
  );
  source = perform(
    source,
    {
      kind: "rest.complete",
      restId: source.runtime.restRecords[0].id,
      supplies: [{ itemId: id("supply"), quantity: 2 }],
    },
    "rest-complete",
  ).source;
  assert.equal(
    source.runtime.effects.filter((e) => e.definition.status === "active")
      .length,
    2,
  );
  const skill = { actorId: id("player"), kind: "skill", stat: "skill" };
  assert.equal(checkModifier(source, skill), 3);
  source = perform(
    source,
    { kind: "forage", actorId: id("player"), outputStorageId: id("pack") },
    "coffee-used",
  ).source;
  assert.equal(checkModifier(source, skill), 2);
  source = perform(source, enter(), "second-rest").source;
  source = perform(
    source,
    {
      kind: "rest.complete",
      restId: source.runtime.restRecords.at(-1).id,
      supplies: [{ itemId: id("supply"), quantity: 2 }],
    },
    "second-complete",
  ).source;
  assert.equal(
    source.runtime.effects.filter((e) => e.definition.status === "active")
      .length,
    0,
  );
});

test("transformation success embeds components; failed game attempt spends binding/time only; tools remain", () => {
  for (const [die, success] of [
    [20, true],
    [1, false],
  ]) {
    const result = perform(fixture(), transform(), `transform-${die}`, die),
      source = result.source;
    assert.equal(quantity(source, "binding"), 9);
    assert.equal(quantity(source, "cutting-tool"), 10);
    assert.equal(quantity(source, "knife"), success ? 9 : 10);
    assert.equal(quantity(source, "stick"), success ? 9 : 10);
    assert.equal(source.runtime.worldMinutes, 10);
    assert.equal(
      source.runtime.provenance[0].outputItemIds.length,
      success ? 1 : 0,
    );
    assert.equal(
      source.runtime.provenance[0].inputs.filter(
        (p) => p.disposition === "embedded",
      ).length,
      success ? 2 : 0,
    );
  }
  const source = fixture();
  source.snapshot.items.find((i) => i.id === id("knife")).storage_id =
    id("camp");
  assert.throws(() => perform(source, transform()));
  assert.throws(() =>
    perform(fixture(), { ...transform(), toolIds: [id("knife")] }),
  );
  assert.throws(() =>
    perform(fixture(), {
      ...transform(),
      inputs: [{ itemId: id("foreign"), quantity: 1 }],
    }),
  );
});

test("mandatory checks ignore frequency; discretionary trivial/impossible/unchanged and invalid modifier sources are rejected", () => {
  const source = fixture();
  source.snapshot.settings.values.checkFrequency = "narrative";
  const input = turn(source, transform()),
    plan = mechanicPlan(source, input);
  assert.doesNotThrow(() => validatePlan(source, input, plan));
  for (const uncertainty of ["trivial", "impossible", "unchanged"]) {
    const bad = structuredClone(plan);
    bad.checks[0].uncertainty = uncertainty;
    assert.throws(() => validatePlan(source, input, bad));
  }
  const bad = structuredClone(plan);
  bad.checks[0].stat = "infinite";
  assert.throws(() => validatePlan(source, input, bad));
  const unrecorded = recordServerRoll(
    input.operationId,
    plan.checks[0],
    2,
    1,
    () => 20,
  );
  unrecorded.success = false;
  assert.throws(() => resolveMechanics(source, input, plan, [unrecorded]));
});

test("combat enforces targets/action/move/reaction budgets and independent HP/damage scaling", () => {
  let source = fixture();
  source.snapshot.settings.values.difficulty.enemyHpMultiplier = 2;
  source.snapshot.settings.values.difficulty.enemyDamageMultiplier = 3;
  source = perform(source, {
    kind: "encounter.start",
    participantIds: [id("player"), id("companion"), id("enemy")],
  }).source;
  assert.equal(source.snapshot.entities[2].max_hp, 24);
  source = perform(
    source,
    action("player", "attack", "enemy", "weapon"),
    "hit",
  ).source;
  assert.equal(source.snapshot.entities[2].hp, 9);
  assert.throws(() =>
    perform(source, action("player", "attack", "enemy", "weapon")),
  );
  assert.throws(() => perform(source, action("player", "attack", "companion")));
  source = perform(
    source,
    action("companion", "intercept", "player"),
    "react",
  ).source;
  assert.throws(() =>
    perform(source, action("companion", "intercept", "player")),
  );
  source = perform(source, action("player", "end-turn"), "next1").source;
  source = perform(source, action("companion", "end-turn"), "next2").source;
  source = perform(
    source,
    action("enemy", "attack", "player"),
    "enemy-hit",
  ).source;
  assert.equal(source.snapshot.entities[0].hp, 1); // 6 minus (2×3 minus intercept protection1).
  source = perform(source, action("enemy", "end-turn"), "next3").source;
  assert.equal(source.runtime.encounters[0].round, 2);
  assert.equal(
    source.runtime.participants.find((p) => p.entity_id === id("companion"))
      .public_resources.reaction,
    1,
  );
  source = perform(
    source,
    { kind: "encounter.end", outcome: "escape" },
    "escape",
  ).source;
  assert.equal(source.snapshot.entities[0].hp, 1);
  assert.equal(source.runtime.encounters[0].outcome, "escape");
});

test("defeat policies are authoritative and victory cannot be declared over active opponents", () => {
  for (const [policy, hp, condition] of [
    ["setbacks", 1, "setback"],
    ["injuries", 1, "injured"],
    ["death", 0, "dead"],
  ]) {
    let source = fixture();
    source.snapshot.settings.values.difficulty.defeat = policy;
    source.snapshot.entities[2].hp = 1;
    source = perform(
      source,
      { kind: "encounter.start", participantIds: [id("player"), id("enemy")] },
      "start",
    ).source;
    assert.throws(() =>
      perform(source, { kind: "encounter.end", outcome: "victory" }),
    );
    source = perform(
      source,
      action("player", "attack", "enemy", "weapon"),
      "defeat",
    ).source;
    assert.equal(source.snapshot.entities[2].hp, hp);
    assert.ok(source.snapshot.entities[2].conditions.includes(condition));
    assert.doesNotThrow(() =>
      perform(source, { kind: "encounter.end", outcome: "victory" }),
    );
  }
});

test("26-operation synthetic mechanics journey keeps exact state through serialized snapshot reloads", () => {
  let source = fixture(),
    count = 0;
  const run = (choice) => {
    source = JSON.parse(
      JSON.stringify(perform(source, choice, `journey-${++count}`).source),
    );
  };
  run({
    kind: "resource.spend",
    entityId: id("player"),
    resource: "focus",
    amount: 1,
  });
  run({
    kind: "item.consume",
    actorId: id("player"),
    itemId: id("healing"),
    quantity: 1,
  });
  run({
    kind: "item.transfer",
    actorId: id("player"),
    itemId: id("meat"),
    quantity: 10,
    destinationStorageId: id("camp"),
  });
  run(enter());
  run({
    kind: "recipe.prepare",
    actorId: id("player"),
    recipe: "meal",
    ingredients: [{ itemId: id("meat"), quantity: 1 }],
    outputStorageId: id("pack"),
  });
  const meal = source.snapshot.items.find((i) => i.name === "Prepared meal").id;
  run({
    kind: "recipe.serve",
    actorId: id("player"),
    itemId: meal,
    recipientIds: [id("player")],
  });
  run({
    kind: "recipe.prepare",
    actorId: id("player"),
    recipe: "coffee",
    ingredients: [
      { itemId: id("coffee"), quantity: 1 },
      { itemId: id("water"), quantity: 1 },
    ],
    outputStorageId: id("pack"),
  });
  const coffee = source.snapshot.items.find(
    (i) => i.name === "Prepared coffee",
  ).id;
  run({
    kind: "recipe.serve",
    actorId: id("player"),
    itemId: coffee,
    recipientIds: [id("player")],
  });
  run({
    kind: "rest.complete",
    restId: source.runtime.restRecords[0].id,
    supplies: [{ itemId: id("supply"), quantity: 2 }],
  });
  run(transform());
  run({ kind: "forage", actorId: id("player"), outputStorageId: id("pack") });
  run({ kind: "location.move", locationId: id("next-location") });
  run({
    kind: "encounter.start",
    participantIds: [id("player"), id("companion"), id("enemy")],
  });
  run(action("player", "move", null, null, "cover"));
  run(action("player", "defend"));
  run(action("player", "end-turn"));
  run(action("companion", "attack", "enemy"));
  run(action("companion", "end-turn"));
  run(action("enemy", "attack", "player"));
  run(action("enemy", "end-turn"));
  run(action("player", "attack", "enemy", "weapon"));
  run({ kind: "encounter.end", outcome: "negotiation" });
  run({ kind: "quest.transition", questId: id("quest"), status: "complete" });
  run(enter());
  run({ kind: "rest.leave", restId: source.runtime.restRecords.at(-1).id });
  run({
    kind: "resource.spend",
    entityId: id("player"),
    resource: "focus",
    amount: 1,
  });
  assert.equal(count, 26);
  assert.equal(source.runtime.revision, 27);
  assert.equal(quantity(source, "healing"), 9);
  assert.equal(quantity(source, "supply"), 8);
  assert.equal(quantity(source, "meat"), 9);
  assert.equal(quantity(source, "knife"), 9);
  assert.equal(quantity(source, "binding"), 9);
  assert.equal(quantity(source, "cutting-tool"), 10);
  assert.equal(source.snapshot.entities[0].resources.focus, 2);
  assert.equal(source.snapshot.quests[0].status, "complete");
  assert.equal(source.runtime.worldMinutes, 550);
  assert.equal(source.snapshot.items.find((i) => i.id === meal).quantity, 0);
  assert.equal(source.snapshot.items.find((i) => i.id === coffee).quantity, 0);
  assert.equal(
    source.snapshot.publicState.current_location_id,
    id("next-location"),
  );
});

test("rest and encounter pin their historical settings; later settings are prospective", () => {
  let rest = perform(fixture(), enter()).source;
  rest.snapshot.settingsHistory.push({
    campaign_id: rest.snapshot.campaign.id,
    revision: 1,
    values: structuredClone(rest.snapshot.settings.values),
    id: id("settings-1"),
    created_at: "",
  });
  rest.snapshot.settings.revision = 2;
  rest.snapshot.settings.values.difficulty.longRestSupplyCost = 5;
  rest.snapshot.settings.values.difficulty.recovery = "restrictive";
  rest = perform(
    rest,
    {
      kind: "rest.complete",
      restId: rest.runtime.restRecords[0].id,
      supplies: [{ itemId: id("supply"), quantity: 2 }],
    },
    "pinned-complete",
  ).source;
  assert.equal(quantity(rest, "supply"), 8);
  assert.equal(rest.snapshot.entities[0].hp, 12);
  let encounter = perform(fixture(), {
    kind: "encounter.start",
    participantIds: [id("enemy"), id("player")],
  }).source;
  encounter.snapshot.settingsHistory.push({
    campaign_id: encounter.snapshot.campaign.id,
    revision: 1,
    values: structuredClone(encounter.snapshot.settings.values),
    id: id("settings-1"),
    created_at: "",
  });
  encounter.snapshot.settings.revision = 2;
  encounter.snapshot.settings.values.difficulty.enemyDamageMultiplier = 3;
  encounter = perform(
    encounter,
    action("enemy", "attack", "player"),
    "pinned-damage",
  ).source;
  assert.equal(encounter.snapshot.entities[0].hp, 4);
  const missing = perform(fixture(), enter()).source;
  missing.snapshot.settings.revision = 2;
  assert.throws(() =>
    perform(missing, {
      kind: "rest.complete",
      restId: missing.runtime.restRecords[0].id,
      supplies: [{ itemId: id("supply"), quantity: 2 }],
    }),
  );
});

test("advantages require recorded conditions and repeated encounters do not compound HP scaling", () => {
  const source = fixture(),
    input = turn(source, transform()),
    plan = mechanicPlan(source, input);
  plan.checks[0].advantage = "advantage";
  assert.throws(() => validatePlan(source, input, plan));
  source.snapshot.entities[0].conditions.push("advantage:skill");
  assert.doesNotThrow(() =>
    validatePlan(source, input, mechanicPlan(source, input)),
  );
  let combat = fixture();
  combat.snapshot.settings.values.difficulty.enemyHpMultiplier = 2;
  combat = perform(
    combat,
    { kind: "encounter.start", participantIds: [id("player"), id("enemy")] },
    "first-combat",
  ).source;
  combat = perform(
    combat,
    { kind: "encounter.end", outcome: "escape" },
    "first-end",
  ).source;
  combat = perform(
    combat,
    { kind: "encounter.start", participantIds: [id("player"), id("enemy")] },
    "second-combat",
  ).source;
  assert.equal(combat.snapshot.entities[2].max_hp, 24);
});
