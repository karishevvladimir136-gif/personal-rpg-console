import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { campaign, scenes } from "../test-fixtures/mega-dm/campaign-v1.mjs";
import frozenCraft from "../test-fixtures/mega-dm/frozen-craft-v1.json" with { type: "json" };
import { digest, FROZEN_CRAFT_DIGEST, FROZEN_FIXTURE_DIGEST,
  frozenReplayRequest, REPLAY_SELECTOR_POLICY, verifyFrozenPack } from "../test-fixtures/mega-dm/evaluation-pack-v1.mjs";
import { fixture } from "./phase35-storage-fixture.mjs";

test("exact synthetic fixture and seeded doctrine/cards are frozen and match disposable SQL seed", async () => {
  verifyFrozenPack();
  assert.equal(digest({ campaign, scenes }), FROZEN_FIXTURE_DIGEST);
  assert.equal(digest(frozenCraft), FROZEN_CRAFT_DIGEST);
  const f = await fixture();
  try {
    const view = (await f.one("select public.rpg_dm_craft($1,'read','{}'::jsonb) result", [f.owner])).result;
    const frozenIdentities = new Set(frozenCraft.versions.map(({ key, version }) => `${key}:${version}`));
    const semantic = view.versions.filter(({ key, version }) => frozenIdentities.has(`${key}:${version}`))
      .map(({key,version,kind,category,stages,triggers,en,ru,provenance}) =>
      ({key,version,kind,category,stages,triggers,en,ru,provenance})).sort((a,b)=>a.key.localeCompare(b.key));
    assert.deepEqual(semantic, frozenCraft.versions);
  } finally { await f.db.close(); }
});

test("each arm pins exact public-before and immutable Craft provenance without private fixture facts", () => {
  for (const scene of scenes) {
    const base = { sceneId: scene.id, model: "later-authorized-model", runId: "offline-proof" };
    const baseline = frozenReplayRequest({ ...base, arm: "baseline" });
    const core = frozenReplayRequest({ ...base, arm: "core-doctrine" });
    const long = frozenReplayRequest({ ...base, arm: "core-plus-long-form" });
    assert.equal(baseline.craft, null);
    assert.equal(core.craft.selectorPolicyVersion, REPLAY_SELECTOR_POLICY);
    assert.equal(core.craft.doctrine.key, "core-doctrine");
    assert.equal(core.craft.doctrine.version, 1);
    assert.equal(core.craft.doctrine.contentDigest, digest(frozenCraft.versions.find((card)=>card.key==="core-doctrine")));
    assert.deepEqual(core.craft.selectedCards, []);
    assert.deepEqual(long.craft.doctrine, core.craft.doctrine);
    assert.ok(long.craft.selectedCards.length <= 2);
    assert.ok(long.craft.selectedCards.every((card)=>long.craft.eligibleCards.some((eligible)=>eligible.key===card.key && eligible.version===card.version && eligible.contentDigest===card.contentDigest)));
    assert.equal(long.literalInput, scene.playerInput);
    assert.equal(long.adjudicatedOutcome, scene.outcome);
    assert.equal(long.fixtureDigest, FROZEN_FIXTURE_DIGEST);
    assert.equal(long.craftPackDigest, FROZEN_CRAFT_DIGEST);
    assert.deepEqual(long.publicBefore, baseline.publicBefore);
    assert.ok(long.allowedPublicSelectorSignal.length <= 512);
    assert.ok(!JSON.stringify(long).includes("VES_SECRET_SENTINEL"));
    assert.equal(digest(long), digest(frozenReplayRequest({ ...base, arm: "core-plus-long-form" })));
    assert.notEqual(digest(long), digest({ ...long, literalInput: `${long.literalInput} changed` }));
    assert.notEqual(digest(long), digest({ ...long, model: "different-model" }));
    assert.notEqual(digest(long), digest({ ...long, adjudicatedOutcome: "changed" }));
  }
});

test("future live harness remains disabled before any adapter or network operation", () => {
  const run = spawnSync(process.execPath, ["scripts/mega-dm/live-replay.mjs"], { encoding: "utf8", env: { ...process.env, MEGA_DM_LIVE_REPLAY: "disabled" } });
  assert.notEqual(run.status, 0);
  assert.match(run.stderr, /Live replay is disabled/);
});
