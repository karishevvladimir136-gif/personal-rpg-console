import test from "node:test";
import assert from "node:assert/strict";
import {
  fixture,
  commandFor,
  applyPlan,
  resolve,
} from "./adventure-loot-fixtures.mjs";
import {
  planLootAction,
  planLootObjectCorrection,
} from "../src/lib/adventure-loot/planning.ts";
import {
  readLootObject,
  parseObjectVersion,
} from "../src/lib/adventure-loot/state.ts";
import { projectLootObjects } from "../src/lib/adventure-loot/public.ts";
import { createTradeQuote } from "../src/lib/commerce/index.ts";
import { stableGameplayId } from "../src/lib/gameplay/dice.ts";
function act(context, refs, kind, extra = {}, name = kind, die = 20) {
  const command = commandFor(context, name + ":" + context.foundation.revision);
  const objectId = extra.objectId ?? refs.objectId;
  const intent = { kind, actorId: refs.actorId, objectId, ...extra };
  const result = planLootAction(
    context,
    command,
    intent,
    resolve(context, command, refs.actorId, objectId, intent.approachId, die),
  );
  assert.equal(result.status, "planned");
  return {
    plan: result.plan,
    context: applyPlan(context, command, result.plan),
    command,
  };
}
test("search discovers established contents and never rerolls or materializes them", () => {
  const { context, references: r } = fixture();
  const before = structuredClone(context);
  const inspected = act(context, r, "search");
  assert.equal(inspected.plan.changes.length, 0);
  assert.equal(
    projectLootObjects(inspected.context, r.actorId)[0].contents,
    null,
  );
  const access = act(inspected.context, r, "access", { approachId: "pick" });
  const first = act(access.context, r, "search");
  assert.equal(first.plan.changes.length, 0);
  const again = act(first.context, r, "search", {}, "repeat-search");
  assert.deepEqual(first.context.snapshot.items, again.context.snapshot.items);
  assert.deepEqual(context, before);
  const projection = JSON.stringify(
    projectLootObjects(again.context, r.actorId),
  );
  assert.ok(projection.includes("Glass vials"));
  assert.ok(!projection.includes("PRIVATE_"));
  assert.ok(!projection.includes("173"));
});
test("first unspecified contents materialize once with stable identity through reload and inherited fork", () => {
  const { context, references: r } = fixture();
  const first = act(context, r, "search", { objectId: r.unspecifiedObjectId });
  const stable = stableGameplayId(r.unspecifiedObjectId, "loot:item:token");
  assert.equal(first.plan.changes.length, 1);
  assert.equal(first.plan.changes[0].id, stable);
  const fork = structuredClone(first.context);
  fork.foundation.timeline.timelineId = stableGameplayId("fork", "timeline");
  fork.snapshot.timeline = structuredClone(fork.foundation.timeline);
  const again = act(
    fork,
    r,
    "search",
    { objectId: r.unspecifiedObjectId },
    "fork-search",
  );
  assert.equal(again.plan.changes.length, 0);
  assert.equal(
    again.context.snapshot.items.filter((i) => i.id === stable).length,
    1,
  );
  assert.equal(
    readLootObject(again.context, r.unspecifiedObjectId).object
      .materializationId,
    stableGameplayId(r.unspecifiedObjectId, "loot:materialization-v1"),
  );
  assert.ok(
    !JSON.stringify(projectLootObjects(again.context, r.actorId)).includes(
      "PRIVATE_",
    ),
  );
});
test("difficult lock permits trusted weak-wood impact with bounded noise and fragile loss", () => {
  const { context, references: r } = fixture();
  const opened = act(context, r, "access", { approachId: "impact" });
  assert.equal(
    readLootObject(opened.context, r.objectId).object.access,
    "broken",
  );
  assert.equal(
    opened.context.snapshot.items.find((i) => i.id === r.itemId).quantity,
    2,
  );
  assert.equal(
    opened.plan.events.filter((e) => e.kind === "loot.noise").length,
    1,
  );
  assert.deepEqual(
    opened.plan.events.find((e) => e.kind === "loot.noise").actorIds,
    [r.actorId],
  );
  assert.equal(
    opened.context.world.actors.find((a) => a.id === r.merchantActorId)
      .knowledge.length,
    0,
  );
});
test("failed check retains access; recorded DC and outcomes cannot be spoofed", () => {
  const { context, references: r } = fixture();
  const failed = act(context, r, "access", { approachId: "pick" }, "failed", 1);
  assert.equal(
    readLootObject(failed.context, r.objectId).object.access,
    "locked",
  );
  const cmd = commandFor(context, "spoof"),
    resolution = resolve(context, cmd, r.actorId, r.objectId, "pick", 1);
  resolution.checks[0].success = true;
  assert.throws(() =>
    planLootAction(
      context,
      cmd,
      {
        kind: "access",
        actorId: r.actorId,
        objectId: r.objectId,
        approachId: "pick",
      },
      resolution,
    ),
  );
  resolution.checks[0].dc = 1;
  assert.throws(() =>
    planLootAction(
      context,
      cmd,
      {
        kind: "access",
        actorId: r.actorId,
        objectId: r.objectId,
        approachId: "pick",
      },
      resolution,
    ),
  );
});
test("unsupported physics and missing recorded checks pause without a state plan", () => {
  const { context, references: r } = fixture(),
    cmd = commandFor(context);
  const intent = {
    kind: "access",
    actorId: r.actorId,
    objectId: r.objectId,
    approachId: "fly-to-moon",
  };
  const policy = readLootObject(context, r.objectId).policy;
  assert.deepEqual(
    planLootAction(context, cmd, intent, { policy, checks: [] }),
    { status: "paused", reason: "unsupported" },
  );
  intent.approachId = "pick";
  assert.deepEqual(
    planLootAction(context, cmd, intent, { policy, checks: [] }),
    { status: "paused", reason: "review_required" },
  );
  assert.throws(() =>
    planLootAction(
      context,
      cmd,
      { ...intent, contents: [{ quantity: 999999 }] },
      { policy, checks: [] },
    ),
  );
});
test("trusted key, resource and capability prerequisites cannot be invented by intent", () => {
  const { context, references: r } = fixture();
  assert.throws(() => act(context, r, "access", { approachId: "key" }));
  const spent = act(context, r, "access", { approachId: "spell" });
  assert.equal(
    spent.context.snapshot.entities.find((e) => e.id === r.actorId).resources
      .focus,
    2,
  );
  const low = structuredClone(context);
  low.snapshot.entities.find((e) => e.id === r.actorId).resources.focus = 1;
  assert.throws(() => act(low, r, "access", { approachId: "spell" }));
  const noCapability = structuredClone(context);
  noCapability.world.actors.find((a) => a.id === r.actorId).capabilities = [];
  assert.throws(() => act(noCapability, r, "access", { approachId: "impact" }));
});
test("taking depletes finite source stock and preserves quantity, stolen ownership and hidden provenance", () => {
  const { context, references: r } = fixture();
  const open = act(context, r, "access", { approachId: "pick" });
  const known = act(open.context, r, "search");
  const take = act(known.context, r, "take", {
    itemId: r.itemId,
    quantity: 2,
    destinationStorageId: r.destinationStorageId,
  });
  const source = take.context.snapshot.items.find((i) => i.id === r.itemId);
  assert.equal(source.quantity, 1);
  const moved = take.context.snapshot.items.find(
    (i) => i.owner_entity_id === r.actorId && i.name === "Glass vials",
  );
  assert.equal(moved.quantity, 2);
  assert.equal(
    take.context.state.itemPolicies.find((p) => p.itemId === moved.id).origin,
    "stolen",
  );
  assert.equal(
    readLootObject(take.context, r.objectId).privateItems.find(
      (i) => i.itemId === moved.id,
    ).hidden.provenance,
    "PRIVATE_VIAL_PROVENANCE",
  );
  assert.equal(
    projectLootObjects(take.context, r.actorId)
      .find((o) => o.id === r.objectId)
      .contents.find((i) => i.id === r.itemId).quantity,
    1,
  );
  assert.throws(() =>
    act(
      take.context,
      r,
      "take",
      {
        itemId: r.itemId,
        quantity: 2,
        destinationStorageId: r.destinationStorageId,
      },
      "overdraw",
    ),
  );
});
test("owner corrections win through a new version and reject stale or foreign authority", () => {
  const { context, references: r } = fixture();
  const before = readLootObject(context, r.objectId);
  const correction = {
    ...before,
    expectedObjectRevision: before.object.revision,
    object: {
      ...before.object,
      revision: before.object.revision + 1,
      access: "sealed",
    },
    authority: "owner",
  };
  const command = commandFor(context, "owner-correction");
  const plan = planLootObjectCorrection(
    context,
    command,
    correction,
    context.foundation.ownerId,
  );
  const next = applyPlan(context, command, plan);
  assert.equal(readLootObject(next, r.objectId).object.access, "sealed");
  assert.equal(readLootObject(context, r.objectId).object.access, "locked");
  assert.throws(() =>
    planLootObjectCorrection(
      next,
      commandFor(next),
      correction,
      context.foundation.ownerId,
    ),
  );
  assert.throws(() =>
    planLootObjectCorrection(
      context,
      command,
      correction,
      stableGameplayId("foreign", "owner"),
    ),
  );
  const unknown = {
    ...correction,
    object: { ...correction.object, contentsEstablished: false },
  };
  assert.throws(() =>
    planLootObjectCorrection(
      context,
      command,
      unknown,
      context.foundation.ownerId,
    ),
  );
  assert.throws(() =>
    parseObjectVersion({ ...correction, arbitraryPatch: true }),
  );
});
test("foreign, future and source-only object events reveal no object identifiers or hidden counts", () => {
  const { context, references: r } = fixture();
  for (const change of [
    { campaignId: stableGameplayId("foreign", "campaign") },
    { worldMinutes: 1 },
    { evidence: [{ knowledge: "future_source" }] },
    { evidence: [{ knowledge: "source" }] },
  ]) {
    const isolated = structuredClone(context);
    isolated.events = isolated.events.map((e) => ({ ...e, ...change }));
    assert.deepEqual(projectLootObjects(isolated, r.actorId), []);
  }
  const unseen = structuredClone(context);
  unseen.events = unseen.events.map((e) =>
    e.payload.object
      ? {
          ...e,
          payload: {
            ...e.payload,
            object: { ...e.payload.object, knownBy: [], contentsKnownBy: [] },
          },
        }
      : e,
  );
  assert.deepEqual(projectLootObjects(unseen, r.actorId), []);
});
test("exact command fencing rejects retries, mismatched campaigns and stale object policy", () => {
  const { context, references: r } = fixture(),
    cmd = commandFor(context);
  const policy = readLootObject(context, r.objectId).policy;
  assert.throws(() =>
    planLootAction(
      context,
      { ...cmd, expectedRevision: cmd.expectedRevision - 1 },
      { kind: "search", actorId: r.actorId, objectId: r.objectId },
      { policy, checks: [] },
    ),
  );
  assert.throws(() =>
    planLootAction(
      context,
      { ...cmd, campaignId: stableGameplayId("foreign", "campaign") },
      { kind: "search", actorId: r.actorId, objectId: r.objectId },
      { policy, checks: [] },
    ),
  );
  assert.throws(() =>
    planLootAction(
      context,
      cmd,
      { kind: "search", actorId: r.actorId, objectId: r.objectId },
      { policy: { ...policy, version: 2 }, checks: [] },
    ),
  );
});

test("existing Commerce refuses stolen stock and cannot turn assessed value into missing merchant cash", () => {
  const { context, references: r } = fixture();
  const open = act(context, r, "access", { approachId: "pick" });
  const known = act(open.context, r, "search");
  const taken = act(known.context, r, "take", {
    itemId: r.itemId,
    quantity: 1,
    destinationStorageId: r.destinationStorageId,
  });
  const item = taken.context.snapshot.items.find(
    (i) => i.name === "Glass vials" && i.owner_entity_id === r.actorId,
  );
  const intent = {
    merchantActorId: r.merchantActorId,
    playerEntityId: r.actorId,
    take: [],
    give: [{ itemId: item.id, quantity: 1 }],
    currencyId: "credits",
    haggle: "none",
  };
  assert.throws(() =>
    createTradeQuote(taken.context, commandFor(taken.context, "sell"), intent),
  );
  const explicit = structuredClone(taken.context);
  explicit.state.merchants[0].acceptsStolen = true;
  explicit.snapshot.entities.find(
    (e) => e.id === r.merchantActorId,
  ).resources.credits = 0;
  assert.throws(() =>
    createTradeQuote(explicit, commandFor(explicit, "no-liquidity"), intent),
  );
});
test("failed costly trusted approach spends the bounded resource and observes no access success", () => {
  const { context, references: r } = fixture();
  const failed = act(
    context,
    r,
    "access",
    { approachId: "spell" },
    "spell-failure",
    1,
  );
  assert.equal(
    failed.context.snapshot.entities.find((e) => e.id === r.actorId).resources
      .focus,
    2,
  );
  assert.equal(
    readLootObject(failed.context, r.objectId).object.access,
    "locked",
  );
  assert.equal(
    failed.plan.events.filter((e) => e.kind === "loot.noise").length,
    0,
  );
});
