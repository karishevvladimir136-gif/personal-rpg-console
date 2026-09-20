import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  stageWorldTransition,
  validateWorldSettlement,
} from "../src/lib/world/stage.ts";
import { reconcileWorldPolicy } from "../src/lib/world/policy.ts";
import { parseWorldState } from "../src/lib/world/validation.ts";
import { projectPublicWorld } from "../src/lib/world/public.ts";
import {
  fixture as worldFixture,
  thread,
  step,
  id as wid,
  evidence as worldEvidence,
  bind,
} from "./wave1-world-fixtures.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import {
  buildCampaignBinding,
  instantiatePackEntities,
} from "../src/lib/world-packs/bindings.ts";
import {
  projectCharacterKnowledge,
  invalidateCampaignSource,
} from "../src/lib/world-packs/projection.ts";
import {
  makeSource,
  makePack,
  entry,
  owner,
} from "./wave1-library-fixtures.mjs";
import {
  parseRulesetRef,
  validateNeutralIdentity,
  validateControlledReferences,
  WORLD_LOGIC_REF,
  LEGACY_RULESET_REF,
  worldLogicProfile,
  validateMechanics,
} from "../src/lib/rulesets/profiles.ts";

const clone = structuredClone;
const bindingFor = (pack, campaignId = randomUUID()) =>
  buildCampaignBinding({
    id: randomUUID(),
    ownerId: owner,
    campaignId,
    pack,
    entry: entry(),
    sourcePriority: pack.body.sourcePriority,
    allocateEntityId: randomUUID,
  });

test("QA stale world command matrix rejects every independent authority mismatch without mutation", () => {
  const mutations = [
    (x) => (x.command.campaignId = randomUUID()),
    (x) => (x.command.timeline.timelineId = randomUUID()),
    (x) => x.command.timeline.epoch++,
    (x) => x.command.expectedRevision++,
    (x) => x.command.expectedRuntimeRevision++,
    (x) => (x.command.expectedHeadId = randomUUID()),
    (x) => (x.source.ownerId = randomUUID()),
    (x) => x.source.runtime.worldMinutes++,
    (x) => x.source.runtime.revision++,
  ];
  for (const mutate of mutations) {
    const input = worldFixture();
    mutate(input);
    const before = clone(input);
    assert.throws(() => stageWorldTransition(input), { code: "stale_world" });
    assert.deepEqual(input, before);
  }
});

test("QA protected PC identity is enforced through every legacy and current control channel", () => {
  for (const origin of ["actor", "legacy", "runtime", "resolution"]) {
    const input = worldFixture(),
      actor = input.snapshot.world.actors[1];
    if (origin === "actor") actor.control = "player";
    if (origin === "legacy")
      input.source.snapshot.entities.find((e) => e.id === actor.entityId).kind =
        "player";
    if (origin === "runtime")
      input.source.runtime.configuration.controlledEntityIds.push(
        actor.entityId,
      );
    if (origin === "resolution") {
      input.resolution.configuration = clone(input.resolution.configuration);
      input.resolution.configuration.controlledEntityIds.push(actor.entityId);
    }
    const result = stageWorldTransition(input);
    assert.deepEqual(
      result,
      { status: "paused", reason: "player_agency", modelRequests: 0 },
      origin,
    );
    assert.equal(input.snapshot.world.threads[0].cursor, 0);
  }
  const input = worldFixture();
  input.snapshot.world.actors[1].id = randomUUID();
  assert.throws(() =>
    parseWorldState(input.snapshot.world, input.snapshot.campaignId),
  );
});

test("QA a late resolver pause discards earlier deterministic proposal changes; retry IDs remain stable", () => {
  const input = worldFixture();
  input.snapshot.world.threads[0].steps.push(
    step("late-resolution", {
      trigger: {
        kind: "deadline",
        atWorldMinutes: 15,
        scenarioCritical: false,
        established: true,
      },
      resolution: "resolver_required",
    }),
  );
  const before = clone(input);
  assert.deepEqual(stageWorldTransition(input), {
    status: "paused",
    reason: "resolver_required",
    modelRequests: 0,
  });
  assert.deepEqual(input, before);
  input.snapshot.world.threads[0].steps[1].resolution = "deterministic";
  const first = stageWorldTransition(input),
    retry = stageWorldTransition(clone(input));
  assert.equal(first.status, "staged");
  assert.deepEqual(first, retry);
  assert.equal(new Set(first.settlement.events.map((e) => e.id)).size, 2);
  const forged = clone(first.settlement);
  forged.events[0].text = "FORGED_PRIVATE_CONTENT";
  assert.throws(() => validateWorldSettlement(input, forged), {
    code: "stale_world",
  });
  assert.equal(input.snapshot.world.threads[0].cursor, 0);
});

test("QA deadline Off remains independent of autonomy, and causal work still resolves with simulation Off", () => {
  for (const autonomy of ["low", "moderate", "high"]) {
    const input = worldFixture();
    input.snapshot.world.policy = {
      simulation: true,
      autonomy,
      deadlinePressure: "off",
    };
    input.snapshot.world.threads.push(
      thread("ordinary-autonomy", {
        steps: [
          step("ordinary-first", {
            trigger: { kind: "autonomy", atWorldMinutes: 8, scope: "local" },
          }),
          step("ordinary-later", {
            trigger: { kind: "autonomy", atWorldMinutes: 100, scope: "local" },
          }),
        ],
      }),
    );
    const result = stageWorldTransition(input);
    assert.equal(result.status, "staged");
    assert.equal(result.settlement.nextWorld.threads[0].cursor, 0);
    assert.equal(result.settlement.nextWorld.threads[1].cursor, 1);
    assert.equal(result.modelRequests, 0);
  }
  const input = worldFixture();
  input.snapshot.world.policy.simulation = false;
  input.snapshot.world.policy.deadlinePressure = "off";
  input.snapshot.world.threads[0].steps[0].trigger = {
    kind: "causal",
    family: "public_state",
    recordId: wid("campaign"),
  };
  input.resolution.changes = [
    {
      family: "public_state",
      id: wid("campaign"),
      values: { current_location_id: wid("location") },
    },
  ];
  assert.equal(stageWorldTransition(input).status, "staged");
});

test("QA re-enabling deadline pressure cannot execute overdue debt at the current fictional minute", () => {
  const input = worldFixture(),
    current = input.snapshot.world;
  current.policy.deadlinePressure = "off";
  const policy = { ...current.policy, deadlinePressure: "normal" },
    stepId = current.threads[0].steps[0].id;
  assert.throws(() => reconcileWorldPolicy(current, policy, 100, []));
  assert.throws(() =>
    reconcileWorldPolicy(current, policy, 100, [
      { stepId, atWorldMinutes: 100 },
    ]),
  );
  input.snapshot.world = reconcileWorldPolicy(current, policy, 100, [
    { stepId, atWorldMinutes: 110 },
  ]);
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
  input.resolution.worldMinutes = 109;
  assert.equal(stageWorldTransition(input).status, "noop");
  input.resolution.worldMinutes = 110;
  assert.equal(stageWorldTransition(input).status, "staged");
  assert.equal(current.threads[0].steps[0].trigger.atWorldMinutes, 10);
});

test("QA world evidence cannot cross owner/version or temporal knowledge scope", () => {
  for (const knowledge of ["source", "future_source"]) {
    const input = worldFixture();
    bind(input);
    const evidence = worldEvidence({ knowledge });
    input.snapshot.world.actors[1].knowledge = [evidence];
    input.snapshot.world.threads[0].steps[0].evidence = [evidence];
    assert.deepEqual(stageWorldTransition(input), {
      status: "paused",
      reason: "knowledge_required",
      modelRequests: 0,
    });
  }
  for (const field of ["ownerId", "sourceVersionId"]) {
    const input = worldFixture();
    bind(input);
    const evidence = worldEvidence({ [field]: randomUUID() });
    input.snapshot.world.actors[1].knowledge = [evidence];
    input.snapshot.world.threads[0].steps[0].evidence = [evidence];
    assert.throws(() => stageWorldTransition(input));
  }
});

test("QA public world projection is invariant under latent private additions and does not alias state", () => {
  const world = worldFixture().snapshot.world,
    expected = projectPublicWorld(world);
  world.threads[0].title = "QA_PRIVATE_THREAD_MARKER";
  world.threads[0].steps[0].privateText = "QA_PRIVATE_TEXT_MARKER";
  world.hooks.push({
    id: randomUUID(),
    campaignId: world.campaignId,
    locationId: wid("location"),
    threadId: world.threads[0].id,
    privatePremise: "QA_PRIVATE_HOOK_MARKER",
    status: "latent",
    discovery: null,
  });
  assert.deepEqual(projectPublicWorld(world), expected);
  const publicCopy = projectPublicWorld(world);
  publicCopy.actors[0].name = "changed";
  assert.notEqual(world.actors[0].publicName, "changed");
  assert.doesNotMatch(
    JSON.stringify(publicCopy),
    /QA_PRIVATE|knowledge|stepId|cursor|entityId/,
  );
});

test("QA library reads reject foreign owner, changed filters and duplicate version contamination", async () => {
  const source = makeSource();
  for (const records of [
    [{ ...source, ownerId: randomUUID() }],
    [{ ...source, id: randomUUID() }],
    [source, clone(source)],
  ]) {
    const store = createRpcLibraryStore(owner, async () => ({
      data: { records },
    }));
    await assert.rejects(() => store.read({ id: source.id }));
  }
});

test("QA source-only, future, expired, private and non-canon claims cannot occupy the player knowledge limit", () => {
  const source = makeSource(),
    pack = makePack(source),
    claim = clone(pack.body.claims[0]);
  pack.body.claims = [];
  for (const knowledge of ["source", "future_source", "canon_at_entry"])
    pack.body.claims.push({
      ...clone(claim),
      id: randomUUID(),
      text: "QA_FORBIDDEN_" + knowledge,
      knowledge,
      knownByEntityIds: [],
      evidence: [{ ...claim.evidence[0], knowledge }],
    });
  pack.body.claims.push({
    ...clone(claim),
    id: randomUUID(),
    text: "QA_FORBIDDEN_PRIVATE",
    visibility: "private",
    evidence: [{ ...claim.evidence[0], visibility: "private" }],
  });
  pack.body.claims.push({
    ...clone(claim),
    id: randomUUID(),
    text: "QA_FORBIDDEN_EXPIRED",
    validUntil: 1,
  });
  pack.body.claims.push({
    ...clone(claim),
    id: randomUUID(),
    text: "QA_FORBIDDEN_REFERENCE",
    authority: "reference",
  });
  pack.body.claims.push(claim);
  const binding = bindingFor(pack),
    second = bindingFor(pack),
    before = clone(pack);
  assert.deepEqual(
    projectCharacterKnowledge(
      pack,
      binding,
      binding.mappings[0].entityId,
      100,
      1,
    ),
    [{ text: claim.text, epistemic: claim.epistemic }],
  );
  assert.notEqual(binding.mappings[0].entityId, second.mappings[0].entityId);
  assert.throws(() =>
    projectCharacterKnowledge(pack, binding, second.mappings[0].entityId, 100),
  );
  assert.deepEqual(
    instantiatePackEntities(binding, [pack]),
    instantiatePackEntities(clone(binding), [clone(pack)]),
  );
  assert.deepEqual(pack, before);
});

test("QA correction hook cannot invalidate a sibling campaign or unbound source", async () => {
  const source = makeSource(),
    binding = bindingFor(makePack(source)),
    calls = [];
  const correction = {
    ownerId: owner,
    campaignId: binding.campaignId,
    correctionId: randomUUID(),
    sourceVersionId: source.versionId,
  };
  for (const key of ["ownerId", "campaignId", "sourceVersionId"])
    await assert.rejects(() =>
      invalidateCampaignSource(
        binding,
        { ...correction, [key]: randomUUID() },
        async (value) => calls.push(value),
      ),
    );
  assert.deepEqual(calls, []);
  await invalidateCampaignSource(binding, correction, async (value) =>
    calls.push(value),
  );
  assert.deepEqual(calls, [correction]);
});

test("QA neutral identities and World Logic require neither HP nor dice, while versions and control scope remain strict", () => {
  const identity = {
    campaignId: randomUUID(),
    entityId: randomUUID(),
    name: "Harbor institution",
    control: { timelineId: randomUUID(), controller: "autonomous" },
    capabilities: ["negotiation"],
    mechanics: null,
  };
  assert.deepEqual(validateNeutralIdentity(identity), identity);
  assert.deepEqual(validateMechanics(worldLogicProfile(), {}), {});
  for (const ref of [WORLD_LOGIC_REF, LEGACY_RULESET_REF])
    assert.throws(() => parseRulesetRef({ ...ref, version: ref.version + 1 }));
  assert.throws(() =>
    validateMechanics(worldLogicProfile(), { hp: 10, d20: 20 }),
  );
  assert.throws(() =>
    validateControlledReferences(
      identity,
      randomUUID(),
      identity.control.timelineId,
      [],
    ),
  );
  assert.throws(() =>
    validateControlledReferences(
      identity,
      identity.campaignId,
      randomUUID(),
      [],
    ),
  );
  assert.throws(() =>
    validateControlledReferences(
      identity,
      identity.campaignId,
      identity.control.timelineId,
      [identity.entityId],
    ),
  );
});
