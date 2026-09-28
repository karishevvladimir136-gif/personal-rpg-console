import test from "node:test";
import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";

// Optional read-only review of the Lead candidate. No credentials, providers,
// hosted database, fixture edits or writes to the reviewed worktree are used.
const sourceRoot = process.env.ADVENTURE_OWNER_LOOT_SOURCE_ROOT
  ? pathToFileURL(
      `${process.env.ADVENTURE_OWNER_LOOT_SOURCE_ROOT.replaceAll("\\", "/").replace(/\/$/, "")}/`,
    )
  : new URL("../", import.meta.url);
const fromSource = (path) => import(new URL(path, sourceRoot).href);
const [
  { fixture, commandFor, applyPlan },
  { ownerLootView, planOwnerLootConfiguration },
  { readLootObject },
  { stableGameplayId },
  { createLoopStore },
] = await Promise.all([
  fromSource("tests/adventure-loot-fixtures.mjs"),
  fromSource("src/lib/adventure-loot/owner-planning.ts"),
  fromSource("src/lib/adventure-loot/state.ts"),
  fromSource("src/lib/gameplay/dice.ts"),
  fromSource("src/lib/foundation-loop/authority.ts"),
]);
const id = (label) => stableGameplayId("independent-owner-loot-review", label);
const publicOnly = (value) =>
  assert.doesNotMatch(
    JSON.stringify(value),
    /PRIVATE_|privateItems|materializationId|contentsKnownBy|knownBy|trueIdentity|provenance|usableCapabilities|discoveryCheck|approaches|fragileLoss|9173|173/,
  );
function createInput(context, overrides = {}) {
  const view = ownerLootView(context),
    storage = view.choices.storages.find(
      (s) =>
        s.entityId ===
        context.snapshot.entities.find((e) => e.kind === "player").id,
    );
  assert.ok(
    storage,
    "positive current public owner storage must remain available",
  );
  return {
    action: "create",
    storageId: storage.id,
    locationId: view.choices.locations[0].id,
    ownerEntityId: storage.entityId,
    label: "  Owner-reviewed wooden box  ",
    access: "locked",
    portable: null,
    capability: view.choices.capabilities[0],
    lockDc: 18,
    forceDc: 8,
    ...overrides,
  };
}
const editInput = (context, objectId, overrides = {}) => {
  const object = ownerLootView(context).objects.find((o) => o.id === objectId);
  assert.ok(object);
  return {
    action: "edit",
    objectId,
    expectedObjectRevision: object.revision,
    label: "Manually corrected appearance",
    access: "closed",
    portable: false,
    ...overrides,
  };
};
const plan = (context, command, input, owner = context.foundation.ownerId) =>
  planOwnerLootConfiguration(context, command, input, owner);

// These tests independently exercise the server public-form adapter, rather
// than treating hand-built UI DTOs as proof of server projection authority.
test("owner view contains only current known metadata and reserves hidden object storage", () => {
  const { context, references: r } = fixture(),
    before = structuredClone(context),
    view = ownerLootView(context);
  publicOnly(view);
  assert.equal(view.objects.length, 1);
  assert.equal(view.objects[0].id, r.objectId);
  assert.equal(view.objects[0].portable, true);
  const hidden = readLootObject(context, r.unspecifiedObjectId);
  assert.ok(
    !view.choices.storages.some((s) => s.id === hidden.object.storageId),
    "an unknown configured object must not offer its storage for a second object",
  );
  assert.ok(!JSON.stringify(view).includes(r.unspecifiedObjectId));
  assert.equal(view.command.expectedHeadId, context.foundation.headId);
  assert.equal(Object.hasOwn(view.command, "operationId"), false);
  assert.deepEqual(context, before);
  assert.throws(() =>
    plan(
      context,
      commandFor(context, "hidden-storage-create"),
      createInput(context, {
        storageId: hidden.object.storageId,
        ownerEntityId: hidden.object.ownerEntityId,
      }),
    ),
  );
});

test("public create builds one stable private version without materializing or changing inventory", () => {
  const { context, references: r } = fixture(),
    before = structuredClone(context),
    command = commandFor(context, "owner-public-create"),
    input = createInput(context);
  const first = plan(context, command, input),
    retry = plan(context, command, input);
  assert.deepEqual(first, retry);
  assert.equal(first.events.length, 1);
  assert.equal(first.events[0].visibility, "private");
  assert.equal(first.events[0].kind, "loot.object.configured");
  assert.deepEqual(first.changes, []);
  assert.deepEqual(first.world, context.world);
  assert.deepEqual(first.state, {
    ...context.state,
    version: context.state.version + 1,
  });
  const version = first.events[0].payload;
  assert.equal(
    version.object.id,
    stableGameplayId(command.operationId, "owner:secured-object-v1"),
  );
  assert.equal(
    version.object.materializationId,
    stableGameplayId(version.object.id, "loot:materialization-v1"),
  );
  assert.equal(version.object.label, "Owner-reviewed wooden box");
  assert.equal(version.object.portable, null);
  assert.deepEqual(version.object.knownBy, [r.actorId]);
  assert.deepEqual(version.object.contentsKnownBy, []);
  assert.deepEqual(version.policy.contents, []);
  assert.deepEqual(version.privateItems, []);
  assert.deepEqual(version.policy.profile, context.state.profile);
  assert.deepEqual(
    version.policy.approaches.map((a) => a.check.dc),
    [18, 8],
  );
  const committed = applyPlan(context, command, first);
  assert.deepEqual(committed.snapshot.items, context.snapshot.items);
  assert.deepEqual(committed.snapshot.entities, context.snapshot.entities);
  publicOnly(ownerLootView(committed));
  assert.throws(
    () => plan(committed, command, input),
    "old fenced replay requires the receipt path",
  );
  assert.throws(
    () =>
      plan(
        committed,
        commandFor(committed, "second-object-same-storage"),
        input,
      ),
    "fresh operation cannot shadow the established storage object",
  );
  assert.deepEqual(context, before);
});

test("public edit preserves private policy, discovery grants, materialization and immutable version history", () => {
  const { context, references: r } = fixture(),
    before = structuredClone(context),
    original = readLootObject(context, r.objectId),
    command = commandFor(context, "owner-public-edit"),
    input = editInput(context, r.objectId);
  assert.ok(
    original.privateItems.length > 0,
    "test must include hidden item authority",
  );
  const edited = plan(context, command, input),
    version = edited.events[0].payload;
  assert.equal(edited.events[0].kind, "loot.object.corrected");
  assert.equal(edited.events[0].visibility, "private");
  assert.deepEqual(version.policy, original.policy);
  assert.deepEqual(version.privateItems, original.privateItems);
  assert.deepEqual(version.object, {
    ...original.object,
    revision: original.object.revision + 1,
    label: input.label,
    access: input.access,
    portable: input.portable,
  });
  assert.equal(version.expectedObjectRevision, original.object.revision);
  assert.equal(version.authority, "owner");
  assert.deepEqual(edited.changes, []);
  assert.deepEqual(edited.world, context.world);
  const next = applyPlan(context, command, edited),
    after = readLootObject(next, r.objectId);
  assert.equal(after.object.revision, 2);
  assert.deepEqual(after.policy, original.policy);
  assert.deepEqual(after.privateItems, original.privateItems);
  assert.deepEqual(next.events.slice(0, context.events.length), context.events);
  assert.equal(
    next.events.filter((e) => e.payload.object?.id === r.objectId).length,
    2,
  );
  assert.throws(() => plan(next, commandFor(next, "stale-object-edit"), input));
  assert.deepEqual(next.snapshot.items, context.snapshot.items);
  publicOnly(ownerLootView(next));
  version.privateItems[0].hidden.trueIdentity = "CHANGED_TEST_COPY";
  assert.deepEqual(
    context,
    before,
    "returned plans must not share private source references",
  );
});

test("forged private patches, identity, contents, grants and arbitrary fields fail closed", () => {
  const { context, references: r } = fixture(),
    before = structuredClone(context),
    command = commandFor(context, "forged-owner-fields");
  const create = createInput(context),
    edit = editInput(context, r.objectId);
  for (const input of [create, edit])
    for (const key of [
      "object",
      "policy",
      "privateItems",
      "authority",
      "knownBy",
      "contentsKnownBy",
      "materializationId",
      "campaignId",
      "timeline",
      "contents",
      "reward",
      "quantity",
      "profile",
    ])
      assert.throws(
        () => plan(context, command, { ...input, [key]: id("forged") }),
        key,
      );
  for (const input of [null, [], "private replacement", { action: "replace" }])
    assert.throws(() => plan(context, command, input));
  for (const changes of [
    { capability: "invented-power" },
    { lockDc: 0 },
    { lockDc: 41 },
    { forceDc: 8.5 },
    { forceDc: "8" },
    { portable: "yes" },
    { label: "" },
    { label: "x".repeat(201) },
    { access: "secretly-open" },
  ])
    assert.throws(() => plan(context, command, { ...create, ...changes }));
  assert.throws(() => plan(context, command, create, id("foreign-owner")));
  assert.deepEqual(context, before);
});

test("remote storage, private owning Actor, foreign references and undiscovered object cannot be selected", () => {
  const { context, references: r } = fixture(),
    input = createInput(context),
    command = commandFor(context, "wrong-selection");
  const privateOwner = structuredClone(context);
  privateOwner.world.actors.find((a) => a.id === r.merchantActorId).publicName =
    null;
  privateOwner.foundation.world = privateOwner.world;
  const privateView = ownerLootView(privateOwner);
  assert.ok(
    !JSON.stringify(privateView).includes(r.merchantActorId),
    "the private legal-owner ID must stay out of all public DTO fields",
  );
  const ownerStorage = context.snapshot.storages.find(
    (s) => s.entity_id === r.merchantActorId,
  );
  assert.throws(() =>
    plan(privateOwner, commandFor(privateOwner, "private-owner"), {
      ...input,
      storageId: ownerStorage.id,
      ownerEntityId: r.merchantActorId,
    }),
  );
  const remote = structuredClone(context);
  remote.world.actors.find((a) => a.id === r.merchantActorId).locationId =
    remote.snapshot.locations.find(
      (l) => l.id !== remote.snapshot.publicState.current_location_id,
    ).id;
  remote.foundation.world = remote.world;
  assert.ok(
    !ownerLootView(remote).choices.entities.some(
      (e) => e.id === r.merchantActorId,
    ),
  );
  assert.throws(() =>
    plan(remote, commandFor(remote, "remote-storage"), {
      ...input,
      storageId: ownerStorage.id,
      ownerEntityId: r.merchantActorId,
    }),
  );
  for (const changes of [
    { storageId: id("foreign-storage") },
    { ownerEntityId: id("foreign-entity") },
    { locationId: id("foreign-location") },
    { ownerEntityId: r.merchantActorId },
  ])
    assert.throws(() => plan(context, command, { ...input, ...changes }));
  assert.throws(() =>
    plan(context, command, {
      ...editInput(context, r.objectId),
      objectId: r.unspecifiedObjectId,
    }),
  );
});

test("future/source-only object facts stay unavailable while exact inherited origin remains usable", () => {
  const { context, references: r } = fixture();
  const evidence = {
    ownerId: context.foundation.ownerId,
    sourceId: id("source"),
    sourceVersionId: id("source-version"),
    locator: { kind: "text", value: "0:12" },
    digest: "a".repeat(64),
    visibility: "private",
    knowledge: "source",
  };
  for (const mode of ["future-minute", "source", "future_source"]) {
    const unavailable = structuredClone(context),
      event = unavailable.events.find(
        (e) => e.payload.object?.id === r.objectId,
      );
    if (mode === "future-minute")
      event.worldMinutes = unavailable.foundation.worldMinutes + 1;
    else event.evidence = [{ ...evidence, knowledge: mode }];
    assert.ok(
      !ownerLootView(unavailable).objects.some((o) => o.id === r.objectId),
    );
    assert.throws(() =>
      plan(unavailable, commandFor(unavailable, mode), {
        action: "edit",
        objectId: r.objectId,
        expectedObjectRevision: 1,
        label: "No future access",
        access: "open",
        portable: true,
      }),
    );
  }
  const inherited = structuredClone(context);
  inherited.foundation.timeline.timelineId = id("inherited-fork");
  inherited.snapshot.timeline = structuredClone(inherited.foundation.timeline);
  const edited = plan(
    inherited,
    commandFor(inherited, "inherited-owner-edit"),
    editInput(inherited, r.objectId),
  );
  assert.equal(edited.events[0].payload.object.revision, 2);
  assert.deepEqual(
    edited.events[0].payload.privateItems,
    readLootObject(context, r.objectId).privateItems,
  );
});

test("owner edits reject stale head, timeline, campaign, object revision and profile", () => {
  const { context, references: r } = fixture(),
    command = commandFor(context, "fenced-owner-edit"),
    input = editInput(context, r.objectId);
  for (const changes of [
    { campaignId: id("foreign-campaign") },
    { expectedRevision: command.expectedRevision + 1 },
    { expectedRuntimeRevision: command.expectedRuntimeRevision + 1 },
    { expectedHeadId: id("changed-head") },
    { timeline: { ...command.timeline, epoch: command.timeline.epoch + 1 } },
    { timeline: { ...command.timeline, timelineId: id("different-timeline") } },
  ])
    assert.throws(() => plan(context, { ...command, ...changes }, input));
  assert.throws(() =>
    plan(context, command, { ...input, expectedObjectRevision: 99 }),
  );
  const profileMismatch = structuredClone(context);
  profileMismatch.state.profile.version += 1;
  assert.throws(() =>
    plan(profileMismatch, commandFor(profileMismatch), input),
  );
  const changedProfile = structuredClone(context);
  changedProfile.state.profile.version += 1;
  changedProfile.foundation.ruleset = structuredClone(
    changedProfile.state.profile,
  );
  assert.throws(
    () => plan(changedProfile, commandFor(changedProfile), input),
    "old private policy cannot be silently repinned to a new ruleset",
  );
});

test("receipt adapter retains one exact public request and never retargets its campaign", async () => {
  const { context } = fixture(),
    command = commandFor(context, "owner-receipt"),
    input = createInput(context),
    request = { command, kind: "loot.configure", input },
    calls = [];
  const store = createLoopStore(
    async (args) => {
      calls.push(structuredClone(args));
      return { data: { committed: true, operationId: command.operationId } };
    },
    context.foundation.ownerId,
    command.campaignId,
  );
  for (let retry = 0; retry < 2; retry++)
    assert.deepEqual(await store.receipt(request), {
      committed: true,
      operationId: command.operationId,
    });
  assert.deepEqual(calls[0], calls[1]);
  assert.equal(calls[0].p_action, "loop_receipt");
  assert.deepEqual(calls[0].p_timeline, command.timeline);
  assert.deepEqual(calls[0].p_payload, request);
  await assert.rejects(
    store.receipt({
      ...request,
      command: { ...command, campaignId: id("foreign-campaign") },
    }),
  );
  assert.equal(calls.length, 2);
  // Atomic receipt equality and SQL commit are tested separately by the Lead.
});
