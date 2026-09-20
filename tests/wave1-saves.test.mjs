import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFoundationSave } from "../src/lib/production-adapters/foundation-saves.ts";
const legacyRuleset = {
  id: "console-basic-v1",
  version: 1,
  mode: "full_ruleset",
  validatorVersion: "console-basic-v1",
};
function fixture() {
  const serving = {
    ownerId: randomUUID(),
    campaignId: randomUUID(),
    timeline: { timelineId: randomUUID(), epoch: 9 },
    runtimeRevision: 40,
    headId: randomUUID(),
    worldMinutes: 70,
  };
  const sourceVersionId = randomUUID();
  const binding = {
    schemaVersion: 1,
    id: randomUUID(),
    ownerId: serving.ownerId,
    campaignId: serving.campaignId,
    packId: randomUUID(),
    packVersionId: randomUUID(),
    scenarioVersionId: randomUUID(),
    sourceVersionIds: [sourceVersionId],
    sourcePriority: [sourceVersionId],
    entry: { label: "Entry before future", worldMinutes: 0, evidence: [] },
    mappings: [{ packEntityId: randomUUID(), entityId: randomUUID() }],
  };
  const saved = {
    schemaVersion: 1,
    ...serving,
    timeline: { timelineId: randomUUID(), epoch: 2 },
    revision: 6,
    runtimeRevision: 12,
    headId: randomUUID(),
    world: { actors: [], threads: [], hooks: [], policy: { autonomy: "off" } },
    bindings: [binding],
    ruleset: {
      id: "saved-custom-rules",
      version: 3,
      mode: "custom_ruleset",
      validatorVersion: "saved-validator-v3",
    },
    executionPolicy: {
      schemaVersion: 1,
      revision: 3,
      primary: {
        providerId: "temporarily-unavailable",
        modelId: "historic-model",
        reasoning: null,
      },
      taskOverrides: {},
    },
  };
  return { saved, serving };
}

test("Wave 1 legacy v1 manifests restore explicitly unconfigured foundation without fabricated past", () => {
  const { serving } = fixture();
  const restored = readFoundationSave(1, null, serving);
  assert.deepEqual(restored, {
    schemaVersion: 1,
    ...serving,
    revision: 0,
    world: null,
    bindings: [],
    ruleset: legacyRuleset,
    executionPolicy: null,
  });
  assert.ok(!Object.hasOwn(restored, "events"));
  restored.timeline.epoch = 10;
  assert.equal(serving.timeline.epoch, 9);
});

test("Wave 1 v2 save projection pins versions/history and rebinds only restored serving scope with no execution", (t) => {
  const { saved, serving } = fixture();
  const original = structuredClone(saved);
  t.mock.method(globalThis, "fetch", () => {
    assert.fail("save loading must never call a provider");
  });
  const restored = readFoundationSave(2, saved, serving);
  assert.deepEqual(saved, original);
  assert.deepEqual(restored.bindings, saved.bindings);
  assert.deepEqual(restored.ruleset, saved.ruleset);
  assert.deepEqual(restored.executionPolicy, saved.executionPolicy);
  assert.deepEqual(restored.world, saved.world);
  assert.deepEqual(restored.timeline, serving.timeline);
  assert.equal(restored.runtimeRevision, serving.runtimeRevision);
  assert.equal(restored.headId, serving.headId);
  assert.equal(restored.revision, saved.revision);
  restored.bindings[0].sourceVersionIds.length = 0;
  restored.world.actors.push("new");
  restored.executionPolicy.primary.modelId = "new";
  assert.deepEqual(saved, original);
});

test("Wave 1 malformed, mismatched and missing versioned foundations fail closed", () => {
  const { saved, serving } = fixture();
  for (const value of [
    null,
    { ...saved, schemaVersion: 2 },
    { ...saved, campaignId: randomUUID() },
    { ...saved, ownerId: randomUUID() },
    { ...saved, worldMinutes: 71 },
    { ...saved, revision: -1 },
    { ...saved, timeline: { ...saved.timeline, epoch: 0 } },
    {
      ...saved,
      bindings: [{ ...saved.bindings[0], campaignId: randomUUID() }],
    },
  ]) {
    assert.throws(() => readFoundationSave(2, value, serving), {
      code: "validation",
    });
  }
  assert.throws(() => readFoundationSave(3, saved, serving), {
    code: "validation",
  });
  assert.throws(() => readFoundationSave(1, saved, serving), {
    code: "validation",
  });
  assert.throws(
    () => readFoundationSave(1, null, { ...serving, runtimeRevision: -1 }),
    { code: "validation" },
  );
});

test("Wave 1 save projection uses an explicit envelope allowlist", () => {
  const { serving } = fixture();
  const restored = readFoundationSave(1, null, {
    ...serving,
    schemaVersion: 99,
    events: ["not committed"],
    credential: "SYNTHETIC_SECRET",
  });
  assert.equal(restored.schemaVersion, 1);
  assert.ok(!Object.hasOwn(restored, "events"));
  assert.ok(!JSON.stringify(restored).includes("SYNTHETIC_SECRET"));
});
