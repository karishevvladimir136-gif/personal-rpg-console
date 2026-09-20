import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  commerceFixture,
  rewardFixture,
  persistedState,
  moduleFromSource,
} from "./wave4-qa-fixture.mjs";
const { createTradeQuote, executeTradeQuote } =
  await moduleFromSource("commerce/index.ts");
const { loopCommand } = await moduleFromSource("foundation-loop/authority.ts");
const { planCommerceConfiguration } = await moduleFromSource(
  "foundation-loop/configuration.ts",
);
const {
  planAdvancement,
  planProgressionDefinitions,
  planProgressionCorrection,
} = await moduleFromSource("progression/index.ts");
const { foundationLoopProjection } = await moduleFromSource(
  "foundation-loop/projection.ts",
);
const { WORLD_LOGIC_REF } = await moduleFromSource("rulesets/profiles.ts");

test("QA SQL: real partial buy and whole resale conserve stock and both balances; exact retries never charge again", async () => {
  const f = await commerceFixture();
  try {
    const buy = await f.quote();
    const competing = await f.quote();
    const result = await f.commit(buy);
    assert.equal(result.committed, true);
    const settled = await persistedState(f);
    assert.equal(
      settled.entities.find((e) => e.id === f.hero).resources.credits,
      80,
    );
    assert.equal(
      settled.entities.find((e) => e.id === f.merchant).resources.credits,
      220,
    );
    assert.equal(settled.items.find((i) => i.id === f.stock).quantity, 4);
    const bought = settled.items.find(
      (i) => i.owner_entity_id === f.hero && i.name === "QA lantern",
    );
    assert.equal(bought.quantity, 2);
    assert.equal(bought.storage_id, f.storage);
    assert.deepEqual(await f.commit(buy), result);
    assert.deepEqual(await f.store.receipt(buy.request), result);
    assert.deepEqual(await persistedState(f), settled);
    await assert.rejects(f.commit(competing));
    await assert.rejects(
      f.store.receipt({
        ...buy.request,
        input: { ...buy.request.input, payment: 0 },
      }),
    );
    const sell = await f.quote({
      take: [],
      give: [{ itemId: bought.id, quantity: 2 }],
    });
    await f.commit(sell);
    const returned = await persistedState(f);
    assert.equal(
      returned.entities.find((e) => e.id === f.hero).resources.credits,
      90,
    );
    assert.equal(
      returned.entities.find((e) => e.id === f.merchant).resources.credits,
      210,
    );
    assert.equal(
      returned.items
        .filter((i) => i.name === "QA lantern")
        .reduce((n, i) => n + i.quantity, 0),
      6,
    );
    assert.equal(
      returned.items.find((i) => i.id === bought.id).owner_entity_id,
      f.merchant,
    );
    assert.deepEqual(await f.commit(sell), {
      committed: true,
      operationId: sell.request.command.operationId,
    });
    assert.deepEqual(await persistedState(f), returned);
  } finally {
    await f.db.close();
  }
});

test("QA SQL: late invalid item revision rolls back earlier money changes, turn, events, receipt and save history", async () => {
  const f = await commerceFixture();
  try {
    const prepared = await f.quote();
    prepared.plan.changes.find(
      (c) => c.family === "items" && c.expectedRevision !== null,
    ).expectedRevision += 1;
    const before = await persistedState(f);
    const result = await f.rawCommit(prepared);
    assert.ok(result.error);
    assert.deepEqual(await persistedState(f), before);
  } finally {
    await f.db.close();
  }
});

test("QA SQL: owner repricing, exact head, runtime, timeline and activation epoch each invalidate an old quote", async () => {
  const f = await commerceFixture();
  try {
    const prepared = await f.quote();
    for (const patch of [
      { expectedHeadId: randomUUID() },
      { expectedRevision: prepared.request.command.expectedRevision + 1 },
      {
        expectedRuntimeRevision:
          prepared.request.command.expectedRuntimeRevision + 1,
      },
      {
        timeline: {
          ...prepared.request.command.timeline,
          epoch: prepared.request.command.timeline.epoch + 1,
        },
      },
      {
        timeline: {
          ...prepared.request.command.timeline,
          timelineId: randomUUID(),
        },
      },
    ]) {
      const changed = structuredClone(prepared);
      Object.assign(changed.request.command, patch);
      assert.ok((await f.rawCommit(changed)).error, JSON.stringify(patch));
    }
    const definitions = structuredClone(f.definitions);
    definitions.itemPolicies[0].version += 1;
    definitions.itemPolicies[0].unitValue = 12;
    await f.commit(
      await f.prepare(
        "commerce.configure",
        definitions,
        planCommerceConfiguration,
      ),
    );
    await assert.rejects(f.commit(prepared));
    const beforeLoad = await f.quote(),
      main = beforeLoad.request.command.timeline.timelineId;
    const saved = await f.checkpoint();
    await f.load(saved.saveId);
    await f.switchTo(main);
    await assert.rejects(f.commit(beforeLoad));
  } finally {
    await f.db.close();
  }
});

test("QA SQL: reward receipt persists through saves and forks and changing definition identity cannot repay its source", async () => {
  const f = await rewardFixture();
  try {
    const before = await f.checkpoint("Before earning reward"),
      main = (await f.read()).foundation.timeline.timelineId;
    const prepared = await f.reward();
    await f.commit(prepared);
    const after = await f.checkpoint("After earning reward");
    const earned = await f.read();
    assert.equal(
      earned.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      107,
    );
    assert.equal(earned.state.progress[0].value, 15);
    assert.equal(earned.state.pending.length, 1);
    assert.equal(
      earned.events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
    assert.deepEqual(await f.store.receipt(prepared.request), {
      committed: true,
      operationId: prepared.request.command.operationId,
    });
    await assert.rejects(f.reward(), /already been rewarded/);
    await f.load(after.saveId);
    await assert.rejects(f.reward(), /already been rewarded/);
    const renamed = structuredClone(f.rewardDefinitions);
    renamed.rewards[0].id = "renamed-delivery";
    await f.commit(
      await f.prepare(
        "progression.configure",
        renamed,
        planProgressionDefinitions,
      ),
    );
    await assert.rejects(
      f.reward({ rewardId: "renamed-delivery", expectedRewardVersion: 1 }),
      /already been rewarded/,
    );
    await f.load(before.saveId);
    const historicalFork = await f.read();
    assert.equal(historicalFork.state.progress.length, 0);
    assert.equal(historicalFork.state.pending.length, 0);
    assert.equal(
      historicalFork.events.filter((e) => e.kind === "reward.granted").length,
      0,
    );
    await f.commit(await f.reward());
    await f.switchTo(main);
    await assert.rejects(f.reward(), /already been rewarded/);
    assert.equal(
      (await f.read()).snapshot.entities.find((e) => e.id === f.hero).resources
        .credits,
      107,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL: explicit owner correction survives save restore without invented reward receipts", async () => {
  const f = await rewardFixture();
  try {
    const input = {
      entityId: f.hero,
      trackId: "experience",
      value: 3,
      rank: 1,
      unlocks: ["Scouting"],
      expectedTrackVersion: 1,
    };
    await f.commit(
      await f.prepare("progression.correct", input, planProgressionCorrection),
    );
    const saved = await f.checkpoint();
    await f.load(saved.saveId);
    const restored = await f.read();
    assert.deepEqual(restored.state.progress, [
      {
        entityId: f.hero,
        trackId: "experience",
        value: 3,
        rank: 1,
        unlocks: ["Scouting"],
      },
    ]);
    assert.equal(
      restored.events.filter((e) => e.kind === "reward.granted").length,
      0,
    );
    assert.ok(
      restored.world.actors
        .find((a) => a.entityId === f.hero)
        .capabilities.includes("Scouting"),
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL: earned advancement is an explicit choice, survives save/load and cannot be selected twice", async () => {
  const f = await rewardFixture();
  try {
    await f.commit(await f.reward());
    const context = await f.read(),
      pending = context.state.pending[0];
    assert.equal(
      context.world.actors
        .find((a) => a.id === f.hero)
        .capabilities.includes("Scouting"),
      false,
    );
    const input = {
      pendingId: pending.id,
      optionId: "scout",
      expectedTrackVersion: 1,
    };
    const choice = await f.prepare("advancement", input, planAdvancement);
    await f.commit(choice);
    const committed = await persistedState(f);
    await f.commit(choice);
    assert.deepEqual(await persistedState(f), committed);
    await assert.rejects(f.prepare("advancement", input, planAdvancement));
    const save = await f.checkpoint();
    await f.load(save.saveId);
    const restored = await f.read();
    assert.equal(restored.state.progress[0].rank, 1);
    assert.deepEqual(restored.state.progress[0].unlocks, ["Scouting"]);
    assert.deepEqual(restored.state.pending, []);
    assert.ok(
      restored.world.actors
        .find((a) => a.id === f.hero)
        .capabilities.includes("Scouting"),
    );
    await assert.rejects(f.prepare("advancement", input, planAdvancement));
  } finally {
    await f.db.close();
  }
});

test("QA SQL: progression Off records one reward entitlement and item/currency reward without invented experience", async () => {
  const f = await rewardFixture();
  try {
    await f.commit(
      await f.prepare(
        "progression.configure",
        { ...f.rewardDefinitions, progression: "off" },
        planProgressionDefinitions,
      ),
    );
    await f.commit(await f.reward());
    const context = await f.read();
    assert.deepEqual(context.state.progress, []);
    assert.deepEqual(context.state.pending, []);
    assert.equal(
      context.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      107,
    );
    assert.equal(
      context.events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
    await f.commit(
      await f.prepare(
        "progression.configure",
        f.rewardDefinitions,
        planProgressionDefinitions,
      ),
    );
    await assert.rejects(f.reward(), /already been rewarded/);
    assert.deepEqual((await f.read()).state.progress, []);
  } finally {
    await f.db.close();
  }
});

test("QA SQL: stolen/restricted/quest stock, merchant funds and merchant capacity use persisted owner policy", async () => {
  const f = await commerceFixture();
  try {
    await f.commit(await f.quote());
    const initial = await f.read(),
      bought = initial.snapshot.items.find(
        (i) => i.owner_entity_id === f.hero && i.name === "QA lantern",
      );
    const intent = {
      take: [],
      give: [{ itemId: bought.id, quantity: bought.quantity }],
    };
    async function edit(change) {
      const { state } = await f.read();
      const input = structuredClone({
        currencies: state.currencies,
        itemPolicies: state.itemPolicies,
        merchants: state.merchants,
      });
      change(input);
      await f.commit(
        await f.prepare("commerce.configure", input, planCommerceConfiguration),
      );
    }
    for (const trade of ["restricted", "quest"]) {
      await edit((input) =>
        Object.assign(
          input.itemPolicies.find((p) => p.itemId === bought.id),
          {
            trade,
            version:
              input.itemPolicies.find((p) => p.itemId === bought.id).version +
              1,
          },
        ),
      );
      await assert.rejects(f.quote(intent));
    }
    await edit((input) =>
      Object.assign(
        input.itemPolicies.find((p) => p.itemId === bought.id),
        {
          trade: "allowed",
          origin: "stolen",
          version:
            input.itemPolicies.find((p) => p.itemId === bought.id).version + 1,
        },
      ),
    );
    await assert.rejects(f.quote(intent));
    await edit((input) =>
      Object.assign(input.merchants[0], {
        acceptsStolen: true,
        capacity: 5,
        version: input.merchants[0].version + 1,
      }),
    );
    await assert.rejects(f.quote(intent));
    await edit((input) =>
      Object.assign(input.merchants[0], {
        capacity: null,
        version: input.merchants[0].version + 1,
      }),
    );
    await f.one(
      "update public.rpg_entities set resources=jsonb_set(resources,'{credits}','0') where id=$1",
      [f.merchant],
    );
    await assert.rejects(f.quote(intent));
    await f.one(
      "update public.rpg_entities set resources=jsonb_set(resources,'{credits}','20') where id=$1",
      [f.merchant],
    );
    await f.commit(await f.quote(intent));
    const context = await f.read();
    assert.equal(
      context.snapshot.items.find((i) => i.id === bought.id).owner_entity_id,
      f.merchant,
    );
    assert.equal(
      context.state.itemPolicies.find((p) => p.itemId === bought.id).origin,
      "stolen",
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL: a valid large manual progression baseline accepted by the domain is persistable", async () => {
  const f = await rewardFixture();
  try {
    const input = {
      entityId: f.hero,
      trackId: "experience",
      value: 1_000_001,
      rank: 1,
      unlocks: ["Scouting"],
      expectedTrackVersion: 1,
    };
    const prepared = await f.prepare(
      "progression.correct",
      input,
      planProgressionCorrection,
    );
    assert.equal(prepared.plan.state.progress[0].value, 1_000_001);
    const result = await f.rawCommit(prepared);
    assert.equal(result.error, undefined, JSON.stringify(result.error));
    assert.equal((await f.read()).state.progress[0].value, input.value);
  } finally {
    await f.db.close();
  }
});

test("QA compatibility: an owner ruleset change cannot leave existing Wave 4 state unreadable", async () => {
  const f = await rewardFixture();
  try {
    await f.commit(await f.reward());
    const context = await f.read(),
      before = await persistedState(f),
      command = loopCommand(context, randomUUID());
    const result = await f.rpc({
      p_owner_id: f.owner,
      p_campaign_id: f.cid,
      p_action: "owner_configure",
      p_timeline: command.timeline,
      p_payload: {
        command,
        worldPolicy: context.world.policy,
        ruleset: WORLD_LOGIC_REF,
        executionPolicy: null,
        reconciliation: null,
      },
    });
    if (result.error) {
      assert.deepEqual(
        await persistedState(f),
        before,
        "A rejected profile change must preserve all existing state",
      );
      return;
    }
    const after = await f.read();
    assert.doesNotThrow(
      () => foundationLoopProjection(after),
      "Successfully changing ruleset must not break the ordinary campaign foundation page",
    );
    assert.deepEqual(
      after.state.progress,
      context.state.progress,
      "Earned progress cannot disappear on profile change",
    );
    assert.equal(
      after.events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense: a service plan cannot omit payment while claiming a quoted paid transfer", async () => {
  const f = await commerceFixture();
  try {
    const prepared = await f.quote();
    prepared.plan.changes = prepared.plan.changes.filter(
      (c) => c.family !== "entities",
    );
    const before = await persistedState(f),
      result = await f.rawCommit(prepared);
    assert.ok(
      result.error,
      "SQL accepted a paid trade plan with both balance changes removed",
    );
    assert.deepEqual(await persistedState(f), before);
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense: a service reward plan cannot inflate an approved reward or discard its entitlement receipt", async () => {
  const f = await rewardFixture();
  try {
    const prepared = await f.reward();
    prepared.plan.changes.find(
      (c) => c.family === "entities",
    ).values.resources.credits = 999;
    prepared.plan.events = prepared.plan.events.filter(
      (e) => e.kind !== "reward.granted",
    );
    const before = await persistedState(f),
      result = await f.rawCommit(prepared);
    assert.ok(
      result.error,
      "SQL accepted inflated currency and no reward.granted receipt",
    );
    assert.deepEqual(await persistedState(f), before);
  } finally {
    await f.db.close();
  }
});

test("QA SQL: insufficiency, unsupported currency and foreign stock fail in trusted planner before persistence", async () => {
  const f = await commerceFixture();
  try {
    const context = await f.read(),
      command = loopCommand(context, randomUUID());
    const intent = (await f.quote()).request.input.intent;
    for (const bad of [
      { ...intent, currencyId: "unapproved" },
      { ...intent, take: [{ itemId: f.item, quantity: 1 }] },
      { ...intent, take: [{ itemId: randomUUID(), quantity: 1 }] },
      { ...intent, take: [{ itemId: f.stock, quantity: 7 }] },
      { ...intent, take: [{ itemId: f.stock, quantity: 0.5 }] },
      { ...intent, take: [{ itemId: f.stock, quantity: -1 }] },
      {
        ...intent,
        take: [
          { itemId: f.stock, quantity: 1 },
          { itemId: f.stock, quantity: 1 },
        ],
      },
    ])
      assert.throws(() => createTradeQuote(context, command, bad));
    const poor = structuredClone(context);
    poor.snapshot.entities.find((e) => e.id === f.hero).resources.credits = 1;
    assert.throws(() => createTradeQuote(poor, command, intent));
    const forged = (await f.quote()).request.input;
    forged.payment = 0;
    assert.throws(() => executeTradeQuote(context, forged));
    const before = await persistedState(f);
    assert.equal(
      before.entities.find((e) => e.id === f.hero).resources.credits,
      100,
    );
    assert.equal(before.items.find((i) => i.id === f.stock).quantity, 6);
  } finally {
    await f.db.close();
  }
});
