import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { rewardFixture, persistedState } from "./wave4-qa-fixture.mjs";
import { planReward } from "../src/lib/progression/planning.ts";
import {
  planApplicableReward,
  planRewardIntegrityConfiguration,
  readRewardIntegrity,
} from "../src/lib/progression/reward-integrity-authority.ts";
import { foundationLoopProjection } from "../src/lib/foundation-loop/projection.ts";
const claim = { rewardId: "delivery", expectedRewardVersion: 1 };
async function setup() {
  const f = await rewardFixture();
  try {
    for (const file of f.files.slice(13))
      await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    return f;
  } catch (e) {
    await f.db.close();
    throw e;
  }
}
const input = (f, extra = {}) => ({
  rewardId: "delivery",
  expectedRewardVersion: 1,
  expectedPolicyVersion: null,
  sourceSignificance: "meaningful",
  usablePowerCeiling: 5,
  meaningfulnessFloor: 3,
  powerAggregation: "maximum",
  nonItemSignificance: 0,
  deliberateFloorException: null,
  items: [
    {
      itemId: f.stock,
      rarity: "rare label, ordinary power",
      usablePower: 5,
      narrativeSignificance: 3,
    },
  ],
  ...extra,
});
const configure = (f, raw) =>
  f.prepare("reward.integrity.configure", raw, (ctx, cmd, v) =>
    planRewardIntegrityConfiguration(
      ctx,
      cmd,
      v,
      new Set(foundationLoopProjection(ctx).owner.rewards.map((r) => r.id)),
    ),
  );
test("reward authority: populated accepted Wave4 reward remains compatible without a fabricated policy", async () => {
  const f = await setup();
  try {
    const c = await f.read();
    assert.equal(readRewardIntegrity(c, "delivery"), null);
    const grant = await f.prepare("reward", claim, planApplicableReward);
    assert.deepEqual(
      grant.plan,
      planReward(grant.context, grant.request.command, claim),
    );
    await f.commit(grant);
    assert.equal(
      (await f.read()).events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
  } finally {
    await f.db.close();
  }
});
test("reward authority: manual versioned bounds and normal item/currency/XP receipt commit once across replay/save/fork", async () => {
  const f = await setup();
  try {
    const before = await persistedState(f),
      cfg = await configure(f, input(f));
    await f.commit(cfg);
    const receipt = await f.store.receipt(cfg.request);
    assert.ok(receipt);
    const current = await f.read();
    assert.deepEqual(current.snapshot.items, cfg.context.snapshot.items);
    assert.deepEqual(current.snapshot.entities, cfg.context.snapshot.entities);
    assert.equal(
      current.events.filter((e) => e.kind === "reward.integrity.configured")
        .length,
      1,
    );
    const grant = await f.prepare("reward", claim, planApplicableReward);
    await f.commit(grant);
    const after = await persistedState(f);
    assert.notDeepEqual(after.entities, before.entities);
    assert.deepEqual(
      await f.store.commit(grant.request, grant.plan),
      await f.store.receipt(grant.request),
    );
    assert.deepEqual(await persistedState(f), after);
    const save = await f.checkpoint();
    await f.load(save.saveId);
    await assert.rejects(
      f.prepare("reward", claim, planApplicableReward),
      (e) => e.code === "reward_claimed",
    );
    assert.equal(readRewardIntegrity(await f.read(), "delivery").version, 1);
    assert.equal(
      (await f.read()).events.filter(
        (e) => e.kind === "reward.integrity.checked",
      ).length,
      1,
    );
    assert.ok(
      !JSON.stringify(foundationLoopProjection(await f.read())).includes(
        "economicValue",
      ),
    );
  } finally {
    await f.db.close();
  }
});
test("reward authority: server and real SQL reject ceiling violation with no partial item/currency/progression grant", async () => {
  const f = await setup();
  try {
    await f.commit(await configure(f, input(f, { usablePowerCeiling: 4 })));
    const before = await persistedState(f);
    await assert.rejects(f.prepare("reward", claim, planApplicableReward));
    const bypass = await f.prepare("reward", claim, planReward);
    const result = await f.rawCommit(bypass);
    assert.match(result.error.message, /rpg_validation/);
    assert.deepEqual(await persistedState(f), before);
    assert.ok(
      !foundationLoopProjection(await f.read()).availableRewards.length,
    );
  } finally {
    await f.db.close();
  }
});
test("reward authority: meaningful floor rejects until an explicit immutable owner exception is reviewed", async () => {
  const f = await setup();
  try {
    const first = await configure(f, input(f, { meaningfulnessFloor: 4 }));
    await f.commit(first);
    await assert.rejects(f.prepare("reward", claim, planApplicableReward));
    const correction = await configure(
      f,
      input(f, {
        expectedPolicyVersion: 1,
        meaningfulnessFloor: 4,
        deliberateFloorException:
          "A deliberately modest token for this source.",
      }),
    );
    await f.commit(correction);
    const c = await f.read();
    assert.equal(readRewardIntegrity(c, "delivery").version, 2);
    assert.equal(
      c.events.filter((e) => e.kind === "reward.integrity.configured").length,
      2,
    );
    await assert.rejects(configure(f, input(f, { expectedPolicyVersion: 1 })));
    await f.commit(await f.prepare("reward", claim, planApplicableReward));
  } finally {
    await f.db.close();
  }
});
test("reward authority: forged policy/valuation/private assessment cannot bypass owning validators", async () => {
  const f = await setup();
  try {
    const cfg = await configure(f, input(f)),
      before = await persistedState(f);
    cfg.plan.events[0].payload.policy.items[0].economicValue = 1;
    const bad = await f.rawCommit(cfg);
    assert.match(bad.error.message, /rpg_validation/);
    assert.deepEqual(await persistedState(f), before);
    await assert.rejects(
      f.prepare("reward.integrity.configure", input(f), (c, cmd, v) =>
        planRewardIntegrityConfiguration(c, cmd, v, new Set()),
      ),
    );
    const unknown = input(f);
    unknown.items[0].usablePower = null;
    await assert.rejects(configure(f, unknown));
    const extra = input(f);
    extra.actorKnowledge = "CANARY";
    await assert.rejects(configure(f, extra));
  } finally {
    await f.db.close();
  }
});
test("reward authority: historical exact saved basis does not inherit a future policy from a sibling", async () => {
  const f = await setup();
  try {
    const original = await f.checkpoint();
    await f.commit(await configure(f, input(f)));
    assert.equal(readRewardIntegrity(await f.read(), "delivery").version, 1);
    await f.load(original.saveId);
    assert.equal(readRewardIntegrity(await f.read(), "delivery"), null);
    await f.commit(await f.prepare("reward", claim, planApplicableReward));
    assert.equal(
      (await f.read()).events.filter(
        (e) => e.kind === "reward.integrity.checked",
      ).length,
      0,
    );
  } finally {
    await f.db.close();
  }
});
