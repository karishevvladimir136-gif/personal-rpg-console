import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { randomUUID } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";
const root = process.env.ADVENTURE_REWARD_SOURCE_ROOT
  ? pathToFileURL(
      process.env.ADVENTURE_REWARD_SOURCE_ROOT.replaceAll("\\", "/").replace(
        /\/$/,
        "",
      ) + "/",
    )
  : new URL("../", import.meta.url);
const from = (path) => import(new URL(path, root));
const [
  { rewardFixture, persistedState },
  integrity,
  projection,
  authority,
  progression,
  configuration,
] = await Promise.all([
  from("tests/wave4-qa-fixture.mjs"),
  from("src/lib/progression/reward-integrity-authority.ts"),
  from("src/lib/foundation-loop/projection.ts"),
  from("src/lib/foundation-loop/authority.ts"),
  from("src/lib/progression/index.ts"),
  from("src/lib/foundation-loop/configuration.ts"),
]);
const claim = { rewardId: "delivery", expectedRewardVersion: 1 };
async function setup() {
  const f = await rewardFixture();
  try {
    for (const file of f.files.slice(13))
      await f.db.exec(await readFile(new URL(file, f.folder), "utf8"));
    return f;
  } catch (error) {
    await f.db.close();
    throw error;
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
      rarity: "Synthetic common appearance, expensive market value",
      usablePower: 5,
      narrativeSignificance: 3,
    },
  ],
  ...extra,
});
const configure = (f, raw) =>
  f.prepare("reward.integrity.configure", raw, (context, command, value) =>
    integrity.planRewardIntegrityConfiguration(
      context,
      command,
      value,
      new Set(
        projection
          .foundationLoopProjection(context)
          .owner.rewards.map((r) => r.id),
      ),
    ),
  );
async function server(f) {
  const source = await readFile(
      new URL("src/lib/server/foundation-loop.ts", root),
      "utf8",
    ),
    compiledModule = { exports: {} },
    calls = [];
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  class PersistenceError extends Error {
    constructor(code) {
      super(code);
      this.code = code;
    }
  }
  const rpc = async (args) => {
    calls.push(args.p_action);
    return f.rpc(args);
  };
  const dependencies = {
    "server-only": {},
    "../progression/reward-integrity-authority": integrity,
    "./campaign-authorization": {
      authorizeCampaign: async (cid) => {
        calls.push("authorize");
        if (cid !== f.cid) throw new PersistenceError("forbidden");
        return { user: { id: f.owner } };
      },
    },
    "./saves/store": { createSaveStore: () => ({ fence: f.fence }) },
    "./production-configuration": { worldRpc: () => rpc },
    "./errors": { PersistenceError },
    "../foundation-loop/authority": authority,
    "../foundation-loop/projection": projection,
    "../foundation-loop/configuration": configuration,
    "../progression": progression,
  };
  runInNewContext(js, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (name) => dependencies[name] ?? {},
    console,
  });
  return { ...compiledModule.exports, calls };
}
async function request(f, kind, value) {
  const context = await f.read();
  return {
    command: authority.loopCommand(context, randomUUID()),
    kind,
    input: value,
  };
}
test("normal reward server binds manual policy to public references and enforces ceiling/floor without partial settlement", async () => {
  const f = await setup();
  try {
    const api = await server(f),
      cfg = await request(
        f,
        "reward.integrity.configure",
        input(f, { usablePowerCeiling: 4 }),
      );
    await api.writeFoundationCampaign(f.cid, cfg);
    const before = await persistedState(f);
    await assert.rejects(
      api.writeFoundationCampaign(f.cid, await request(f, "reward", claim)),
    );
    assert.deepEqual(await persistedState(f), before);
    const change = await request(
      f,
      "reward.integrity.configure",
      input(f, {
        expectedPolicyVersion: 1,
        usablePowerCeiling: 5,
        meaningfulnessFloor: 4,
      }),
    );
    await api.writeFoundationCampaign(f.cid, change);
    const underfloor = await persistedState(f);
    await assert.rejects(
      api.writeFoundationCampaign(f.cid, await request(f, "reward", claim)),
    );
    assert.deepEqual(await persistedState(f), underfloor);
    await api.writeFoundationCampaign(
      f.cid,
      await request(
        f,
        "reward.integrity.configure",
        input(f, {
          expectedPolicyVersion: 2,
          meaningfulnessFloor: 4,
          deliberateFloorException:
            "Explicit owner decision: a modest visible keepsake.",
        }),
      ),
    );
    await api.writeFoundationCampaign(f.cid, await request(f, "reward", claim));
    assert.equal(
      (await f.read()).events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
  } finally {
    await f.db.close();
  }
});
test("normal server receipt precedes new planning after correction, while changed input or unauthorized campaign cannot replay", async () => {
  const f = await setup();
  try {
    const api = await server(f);
    await api.writeFoundationCampaign(
      f.cid,
      await request(f, "reward.integrity.configure", input(f)),
    );
    const grant = await request(f, "reward", claim);
    await api.writeFoundationCampaign(f.cid, grant);
    await api.writeFoundationCampaign(
      f.cid,
      await request(
        f,
        "reward.integrity.configure",
        input(f, { expectedPolicyVersion: 1, usablePowerCeiling: 0 }),
      ),
    );
    const before = await persistedState(f);
    api.calls.length = 0;
    await api.writeFoundationCampaign(f.cid, grant);
    assert.deepEqual(api.calls.slice(0, 2), ["authorize", "loop_receipt"]);
    assert.equal(api.calls.includes("loop_commit"), false);
    assert.deepEqual(await persistedState(f), before);
    await assert.rejects(
      api.writeFoundationCampaign(f.cid, {
        ...grant,
        input: { ...claim, expectedRewardVersion: 2 },
      }),
    );
    await assert.rejects(api.writeFoundationCampaign(randomUUID(), grant));
    assert.deepEqual(await persistedState(f), before);
  } finally {
    await f.db.close();
  }
});
test("sum ceiling accounts for quantities while maximum keeps rarity and economic value independent", async () => {
  const f = await setup();
  try {
    const definitions = structuredClone(f.rewardDefinitions);
    definitions.rewards[0].version = 2;
    definitions.rewards[0].entries.find((e) => e.kind === "item").quantity = 2;
    await f.commit(
      await f.prepare(
        "progression.configure",
        definitions,
        progression.planProgressionDefinitions,
      ),
    );
    const raw = input(f, {
      expectedRewardVersion: 2,
      usablePowerCeiling: 5,
      powerAggregation: "sum",
      items: [
        {
          itemId: f.stock,
          rarity: "legendary label does not imply power",
          usablePower: 3,
          narrativeSignificance: 3,
        },
      ],
    });
    await f.commit(await configure(f, raw));
    await assert.rejects(
      f.prepare(
        "reward",
        { rewardId: "delivery", expectedRewardVersion: 2 },
        integrity.planApplicableReward,
      ),
    );
    const bypass = await f.prepare(
        "reward",
        { rewardId: "delivery", expectedRewardVersion: 2 },
        progression.planReward,
      ),
      before = await persistedState(f),
      result = await f.rawCommit(bypass);
    assert.match(result.error.message, /rpg_validation/);
    assert.deepEqual(await persistedState(f), before);
    await f.commit(
      await configure(f, {
        ...raw,
        expectedPolicyVersion: 1,
        powerAggregation: "maximum",
      }),
    );
    const normal = await f.prepare(
      "reward",
      { rewardId: "delivery", expectedRewardVersion: 2 },
      integrity.planApplicableReward,
    );
    await f.commit(normal);
    assert.equal(
      integrity.readRewardIntegrity(await f.read(), "delivery").items[0]
        .economicValue,
      10,
    );
  } finally {
    await f.db.close();
  }
});
test("public owner view exposes only explicit manual fields and hides private/future source policies", async () => {
  const f = await setup();
  try {
    await f.commit(await configure(f, input(f)));
    const context = await f.read(),
      publicView = projection.foundationLoopProjection(context);
    assert.equal(publicView.owner.rewardIntegrity[0].items[0].usablePower, 5);
    assert.doesNotMatch(
      JSON.stringify(publicView.owner.rewardIntegrity),
      /economicValue|fullPower|requiredCapabilities|usability/,
    );
    const hidden = structuredClone(context);
    hidden.state.itemPolicies.find((p) => p.itemId === f.stock).visibility =
      "private";
    const hiddenView = projection.foundationLoopProjection(hidden);
    assert.equal(hiddenView.owner.rewards.length, 0);
    assert.deepEqual(hiddenView.owner.rewardIntegrity, []);
    assert.doesNotMatch(
      JSON.stringify(hiddenView),
      /Synthetic common appearance/,
    );
    const future = structuredClone(context),
      policyEvent = future.events.find(
        (e) => e.kind === "reward.integrity.configured",
      );
    policyEvent.worldMinutes = future.foundation.worldMinutes + 1;
    assert.equal(integrity.readRewardIntegrity(future, "delivery"), null);
  } finally {
    await f.db.close();
  }
});
test("save/load preserves prior policy and grant receipts, isolates later sibling correction, and rejects old operation fence", async () => {
  const f = await setup();
  try {
    await f.commit(await configure(f, input(f)));
    const policySave = await f.checkpoint("Before reward"),
      grant = await f.prepare("reward", claim, integrity.planApplicableReward);
    await f.commit(grant);
    const awarded = await f.checkpoint("After reward");
    await f.commit(
      await configure(
        f,
        input(f, { expectedPolicyVersion: 1, usablePowerCeiling: 0 }),
      ),
    );
    await f.load(awarded.saveId);
    assert.equal(
      integrity.readRewardIntegrity(await f.read(), "delivery").version,
      1,
    );
    await assert.rejects(
      f.prepare("reward", claim, integrity.planApplicableReward),
      (e) => e.code === "reward_claimed",
    );
    await assert.rejects(
      f.store.receipt(grant.request),
      (e) => e.code === "conflict",
    );
    await f.load(policySave.saveId);
    assert.equal(
      integrity.readRewardIntegrity(await f.read(), "delivery").version,
      1,
    );
    assert.equal(
      (await f.read()).events.filter((e) => e.kind === "reward.granted").length,
      0,
    );
    await f.commit(
      await f.prepare("reward", claim, integrity.planApplicableReward),
    );
    assert.equal(
      (await f.read()).events.filter((e) => e.kind === "reward.granted").length,
      1,
    );
  } finally {
    await f.db.close();
  }
});
for (const kind of ["reward", "commerce.configure"])
  test(
    "SQL rejects smuggled owner policy configuration through " + kind,
    async () => {
      const f = await setup();
      try {
        const prepared =
            kind === "reward"
              ? await f.prepare("reward", claim, integrity.planApplicableReward)
              : await f.prepare(
                  "commerce.configure",
                  f.definitions,
                  configuration.planCommerceConfiguration,
                ),
          configured = await configure(f, input(f));
        prepared.plan.events.push(configured.plan.events[0]);
        const before = await persistedState(f),
          result = await f.rawCommit(prepared);
        assert.ok(result.error, "unreviewed policy event must fail");
        assert.match(result.error.message, /rpg_validation/);
        assert.deepEqual(await persistedState(f), before);
      } finally {
        await f.db.close();
      }
    },
  );
