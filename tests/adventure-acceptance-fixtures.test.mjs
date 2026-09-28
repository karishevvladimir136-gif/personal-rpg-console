import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { fixture } from "./adventure-loot-fixtures.mjs";
import { validateCommerceContext } from "../src/lib/commerce/context.ts";
import { readLootObject } from "../src/lib/adventure-loot/state.ts";
import { parseRewardIntegrityPolicy } from "../src/lib/progression/reward-integrity.ts";
const root = new URL("../test-fixtures/adventures/v1/", import.meta.url);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
test("three new frozen scenario families have exact source digests and offline unassessed envelope", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("manifest.json", root), "utf8"),
  );
  assert.deepEqual(
    manifest.entries.map((e) => e.family),
    ["letter-low", "letter-high", "merchant-vault"],
  );
  assert.equal(
    hash(readFileSync(new URL("world-basis.json", root))),
    manifest.immutableWorld.digest,
  );
  for (const entry of manifest.entries) {
    assert.equal(hash(readFileSync(new URL(entry.file, root))), entry.sha256);
    const f = fixture(entry.family);
    assert.deepEqual(f.immutableWorld, manifest.immutableWorld);
    assert.equal(f.evaluation.providerCallsAllowed, 0);
    assert.equal(f.evaluation.attemptsUsed, 0);
    assert.equal(f.evaluation.automaticQualityScore, null);
    assert.equal(f.evaluation.qualitativeStatus, "unassessed");
    assert.equal(f.profile.pacing.enforcedTimer, false);
    validateCommerceContext(f.context);
    assert.ok(readLootObject(f.context, f.references.objectId));
    parseRewardIntegrityPolicy(f.rewardIntegrity);
  }
});
test("low/high letter share immutable World threats but isolate mutable campaigns and hero power", () => {
  const low = fixture("letter-low"),
    high = fixture("letter-high");
  assert.deepEqual(low.immutableWorld, high.immutableWorld);
  assert.notEqual(
    low.context.foundation.campaignId,
    high.context.foundation.campaignId,
  );
  const hero = (f) =>
    f.context.snapshot.entities.find((e) => e.id === f.references.actorId);
  assert.ok(hero(low).stats.skill < hero(high).stats.skill);
  assert.ok(hero(low).max_hp < hero(high).max_hp);
  const npc = (f) =>
    f.context.snapshot.entities.find(
      (e) => e.id === f.references.merchantActorId,
    );
  assert.deepEqual(npc(low).stats, npc(high).stats);
  assert.equal(npc(low).max_hp, npc(high).max_hp);
  assert.equal(low.profile.scaling, "intrinsic-threats-fixed");
  assert.equal(high.profile.scaling, "intrinsic-threats-fixed");
  const ids = new Set(low.context.snapshot.items.map((i) => i.id));
  assert.ok(high.context.snapshot.items.every((i) => !ids.has(i.id)));
});
test("Merchant Vault records access facts, several trusted opportunities and finite fragile stock without a solution script", () => {
  const f = fixture(),
    s = readLootObject(f.context, f.references.objectId);
  assert.equal(s.object.lockClass, "difficult-lock");
  assert.equal(s.object.structureClass, "weak-wood");
  assert.equal(s.object.portable, true);
  assert.ok(s.object.environmentTags.includes("stone-landing"));
  assert.deepEqual(
    s.policy.approaches.map((a) => a.id),
    ["key", "pick", "force", "impact", "spell", "agreement"],
  );
  assert.equal(
    f.context.snapshot.items.find((i) => i.id === f.references.itemId).quantity,
    3,
  );
  assert.equal(
    s.privateItems.find((item) => item.itemId === f.references.itemId).fragile,
    true,
  );
  assert.equal("solution" in f, false);
  assert.equal("actionScript" in f, false);
});

test("fixture Item appearance never contains private true names, properties or provenance", () => {
  for (const family of ["letter-low", "letter-high", "merchant-vault"]) {
    const f = fixture(family);
    const publicRows = JSON.stringify(f.context.snapshot.items);
    assert.ok(!publicRows.includes("PRIVATE_"));
    const state = readLootObject(f.context, f.references.objectId);
    assert.ok(
      state.privateItems.some(
        (item) => item.hidden.trueIdentity === "PRIVATE_STOCK_TRUE_IDENTITY",
      ),
    );
    assert.ok(
      f.context.state.itemPolicies.some(
        (policy) => policy.visibility === "private",
      ),
    );
  }
});
