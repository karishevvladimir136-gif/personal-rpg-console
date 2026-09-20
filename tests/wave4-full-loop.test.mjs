import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  commerceFixture,
  moduleFromSource,
  persistedState,
} from "./wave4-qa-fixture.mjs";

const { createRpcTurnStore } = await moduleFromSource("gameplay/dm-store.ts");
const { runTurn } = await moduleFromSource("gameplay/turn-engine.ts");
const { planProgressionDefinitions, planReward } = await moduleFromSource(
  "progression/index.ts",
);

async function completeObjective(f, provider) {
  const timeline = await f.fence(f.cid);
  const store = createRpcTurnStore(
    f.owner,
    async (args) => {
      try {
        return {
          data: await f.runtime(
            args.p_campaign_id,
            args.p_action,
            args.p_payload,
            args.p_timeline,
          ),
        };
      } catch (error) {
        return { error: { message: error.message, code: error.code } };
      }
    },
    null,
    timeline,
  );
  const input = {
    operationId: randomUUID(),
    campaignId: f.cid,
    timeline,
    expectedRevision: (await store.readPlay(f.cid)).revision,
    mode: "mechanic",
    input: "Complete the delivery at the bridge.",
    companionId: null,
    listenerIds: [],
    mechanic: {
      kind: "quest.transition",
      questId: f.quest,
      status: "complete",
    },
  };
  const dependencies = { store, provider };
  const result = await runTurn(input, dependencies);
  assert.equal(result.status, "committed", JSON.stringify(result));
  assert.equal(
    (await f.read()).snapshot.quests.find((q) => q.id === f.quest).status,
    "complete",
  );
  const unchanged = await persistedState(f);
  assert.deepEqual(await runTurn(input, dependencies), result);
  assert.deepEqual(await persistedState(f), unchanged);
}

async function exactResult(f) {
  const context = await f.read();
  const play = await f.runtime(f.cid, "play");
  return {
    entities: context.snapshot.entities,
    items: context.snapshot.items,
    quests: context.snapshot.quests,
    loop: context.state,
    world: context.world,
    configuration: play.configuration,
    rewards: context.events
      .filter((e) => e.kind === "reward.granted")
      .map((e) => e.payload),
  };
}

function assertCopiedRule(configuration, sourceRule, itemId) {
  assert.deepEqual(
    configuration.itemRules.filter((rule) => rule.itemId === itemId),
    [{ ...sourceRule, itemId }],
    "Every split retains the source console-basic tag and damage mechanic exactly once",
  );
}

test("Wave 4 full loop: real objective completion → XP/currency/loot → authoritative sale → exact save/load, retries and isolated forks", async () => {
  // commerceFixture leaves the real quest open. Its completion below is an
  // original runtime/mechanics operation, never a pre-completed SQL seed.
  const f = await commerceFixture();
  try {
    let providerCalls = 0;
    const forbidden = async () => {
      providerCalls += 1;
      throw new Error("No provider is allowed in this deterministic fixture");
    };
    const provider = {
      plan: forbidden,
      narrate: forbidden,
      feedback: forbidden,
    };
    const sourceRule = { itemId: f.stock, tag: "weapon", damage: 7 };
    const play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "configure", {
      requestId: randomUUID(),
      campaignId: f.cid,
      expectedRevision: play.revision,
      configuration: { ...play.configuration, itemRules: [sourceRule] },
    });
    const definitions = {
      progression: "on",
      tracks: [
        {
          id: "experience",
          version: 1,
          label: "Experience",
          kind: "classic_xp",
          thresholds: [10, 20],
          choices: [
            { id: "scout", label: "Scouting", capability: "Scouting" },
            { id: "guide", label: "Guiding", capability: "Guiding" },
          ],
        },
      ],
      rewards: [
        {
          id: "delivery",
          version: 1,
          label: "Delivery reward",
          source: { kind: "quest", id: f.quest },
          distribution: "actor",
          recipientIds: [f.hero],
          entries: [
            { kind: "progression", trackId: "experience", amount: 15 },
            { kind: "currency", currencyId: "credits", amount: 7 },
            { kind: "item", itemId: f.stock, quantity: 2 },
          ],
        },
      ],
    };
    await f.commit(
      await f.prepare(
        "progression.configure",
        definitions,
        planProgressionDefinitions,
      ),
    );
    const reward = () =>
      f.prepare(
        "reward",
        { rewardId: "delivery", expectedRewardVersion: 1 },
        planReward,
      );
    assert.equal(
      (await f.read()).snapshot.quests.find((q) => q.id === f.quest).status,
      "open",
    );
    await assert.rejects(reward(), /not eligible/);
    const beforeObjective = await f.checkpoint(
      "Before completing the real objective",
    );
    const mainTimeline = (await f.fence(f.cid)).timelineId;

    await completeObjective(f, provider);
    const rewardCommand = await reward();
    await f.commit(rewardCommand);
    const earned = await f.read();
    const loot = earned.snapshot.items.find(
      (i) => i.owner_entity_id === f.hero && i.name === "QA lantern",
    );
    assert.ok(loot);
    assert.notEqual(loot.id, f.stock);
    assert.equal(loot.quantity, 2);
    assert.equal(loot.storage_id, f.storage);
    assert.equal(
      earned.snapshot.items.find((i) => i.id === f.stock).quantity,
      4,
    );
    assert.equal(
      earned.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      107,
    );
    assert.equal(earned.state.progress[0].value, 15);
    assert.equal(earned.state.pending.length, 1);
    assertCopiedRule(
      (await f.runtime(f.cid, "play")).configuration,
      sourceRule,
      loot.id,
    );

    // Sell one of the two rewarded items: this forces a second real split, so
    // preserving a rule only on the first reward split is insufficient.
    const sale = await f.quote({
      take: [],
      give: [{ itemId: loot.id, quantity: 1 }],
    });
    assert.equal(sale.request.input.payment, -5);
    await f.commit(sale);
    const settled = await f.read();
    const soldId = sale.plan.events.find((e) => e.kind === "commerce.trade")
      .payload.lines[0].transferredItemId;
    assert.notEqual(soldId, loot.id);
    assert.equal(
      settled.snapshot.items.find((i) => i.id === loot.id).quantity,
      1,
    );
    assert.equal(
      settled.snapshot.items.find((i) => i.id === soldId).owner_entity_id,
      f.merchant,
    );
    assert.equal(
      settled.snapshot.items.find((i) => i.id === soldId).storage_id,
      f.stockStorage,
    );
    assert.equal(
      settled.snapshot.items
        .filter((i) => i.name === "QA lantern")
        .reduce((n, i) => n + i.quantity, 0),
      6,
    );
    assert.equal(
      settled.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      112,
    );
    assert.equal(
      settled.snapshot.entities.find((e) => e.id === f.merchant).resources
        .credits,
      195,
    );
    const rules = (await f.runtime(f.cid, "play")).configuration;
    for (const itemId of [f.stock, loot.id, soldId])
      assertCopiedRule(rules, sourceRule, itemId);

    const beforeRetries = await persistedState(f);
    await f.commit(rewardCommand);
    await f.commit(sale);
    assert.deepEqual(await persistedState(f), beforeRetries);
    await assert.rejects(reward(), /already been rewarded/);
    const expected = await exactResult(f);
    const afterSale = await f.checkpoint("Objective earned and loot sold");
    await f.load(afterSale.saveId);
    assert.deepEqual(await exactResult(f), expected);
    assertCopiedRule(
      (await f.runtime(f.cid, "play")).configuration,
      sourceRule,
      soldId,
    );
    const afterLoad = await persistedState(f);
    // Old callbacks retain their activation fence and must not attach themselves
    // to the fork. The restored receipt also rejects a new claim for the source.
    await assert.rejects(f.commit(rewardCommand));
    await assert.rejects(f.commit(sale));
    await assert.rejects(reward(), /already been rewarded/);
    assert.deepEqual(await persistedState(f), afterLoad);

    await f.load(beforeObjective.saveId);
    const earlier = await f.read();
    assert.equal(
      earlier.snapshot.quests.find((q) => q.id === f.quest).status,
      "open",
    );
    assert.deepEqual(earlier.state.progress, []);
    assert.deepEqual(earlier.state.pending, []);
    assert.equal(
      earlier.snapshot.entities.find((e) => e.id === f.hero).resources.credits,
      100,
    );
    assert.equal(
      earlier.snapshot.items.find((i) => i.id === f.stock).quantity,
      6,
    );
    assert.equal(
      earlier.snapshot.items.some((i) => i.id === loot.id || i.id === soldId),
      false,
    );
    assert.equal(
      earlier.events.some((e) => e.kind === "reward.granted"),
      false,
    );
    assert.deepEqual((await f.runtime(f.cid, "play")).configuration.itemRules, [
      sourceRule,
    ]);
    await assert.rejects(reward(), /not eligible/);
    await completeObjective(f, provider);
    await f.commit(await reward());
    assert.equal(
      (await f.read()).snapshot.entities.find((e) => e.id === f.hero).resources
        .credits,
      107,
    );
    assertCopiedRule(
      (await f.runtime(f.cid, "play")).configuration,
      sourceRule,
      loot.id,
    );
    await f.switchTo(mainTimeline);
    assert.deepEqual(
      await exactResult(f),
      expected,
      "The earlier fork's new objective/reward must not alter the original sold state",
    );
    assert.equal(providerCalls, 0);
  } finally {
    await f.db.close();
  }
});
