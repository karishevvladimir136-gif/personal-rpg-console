import test from "node:test";
import assert from "node:assert/strict";
import {
  FoundationClientError,
  foundationAttempt,
  foundationScopeMatches,
  loadFoundationLoop,
  sendFoundationCommand,
  validateFoundationView,
  commerceInput,
  progressionInput,
  versionDefinitions,
} from "../src/lib/foundation-loop-client.ts";
import { foundationUiFixture, uiId } from "./wave4-ui-fixtures.mjs";

test("owner corrections advance only changed rows and preserve unchanged authority exactly", () => {
  const view = foundationUiFixture();
  const draft = structuredClone(view.owner);
  draft.currencies[0].label = "River marks";
  draft.itemPolicies[0].unitValue += 1;
  const input = commerceInput(view, draft);
  assert.equal(input.currencies[0].version, 3);
  assert.equal(input.itemPolicies[0].version, 2);
  assert.deepEqual(input.itemPolicies[1], view.owner.itemPolicies[1]);
  assert.deepEqual(input.merchants, view.owner.merchants);
  const progression = progressionInput(view, {
    ...draft,
    tracks: [
      ...draft.tracks,
      { ...draft.tracks[0], id: uiId(88), version: 99 },
    ],
  });
  assert.deepEqual(progression.tracks[0], view.owner.tracks[0]);
  assert.equal(progression.tracks[1].version, 1);
  assert.deepEqual(progression.rewards, view.owner.rewards);
  assert.deepEqual(view.owner.currencies[0].label, "Marks");
  assert.equal(
    versionDefinitions(
      [{ id: "a", version: 3, label: "A" }],
      [{ label: "A", version: 88, id: "a" }],
      (r) => r.id,
    )[0].version,
    3,
  );
});

test("quote confirmation and uncertain retries retain exact original operation and fences", () => {
  const view = foundationUiFixture();
  const intent = {
    merchantActorId: uiId(3),
    playerEntityId: uiId(9),
    take: [{ itemId: uiId(5), quantity: 1 }],
    give: [],
    currencyId: uiId(11),
    haggle: "none",
  };
  const attempt = foundationAttempt(view, "quote", intent, null, () =>
    uiId(30),
  );
  const quote = {
    schemaVersion: 1,
    id: uiId(31),
    command: attempt.command,
    intent,
    profile: view.profile,
    stateVersion: 7,
    merchantVersion: 4,
    lines: [
      {
        itemId: uiId(5),
        direction: "take",
        quantity: 1,
        unitValue: 12,
        totalValue: 12,
        itemRevision: 1,
        policyVersion: 1,
      },
    ],
    payment: 12,
    modifierBasisPoints: 0,
  };
  const confirm = foundationAttempt(view, "trade", quote, null, () =>
    assert.fail("Must reuse quote operation"),
  );
  assert.deepEqual(confirm.command, attempt.command);
  const retry = foundationAttempt(
    { ...view, stateVersion: 100 },
    "reward",
    { rewardId: "different" },
    confirm,
    () => assert.fail("Must not make another identity"),
  );
  assert.deepEqual(retry, confirm);
  retry.input.payment = 90;
  assert.equal(confirm.input.payment, 12, "retry is an isolated snapshot");
});

test("scope guards reject switched campaigns, timelines, epochs and malformed reads", () => {
  const view = foundationUiFixture();
  assert.ok(
    foundationScopeMatches(view, view.campaignId, view.command.timeline),
  );
  assert.equal(
    foundationScopeMatches(view, uiId(77), view.command.timeline),
    false,
  );
  assert.equal(
    foundationScopeMatches(view, view.campaignId, {
      ...view.command.timeline,
      epoch: 2,
    }),
    false,
  );
  assert.equal(foundationScopeMatches(view, view.campaignId, undefined), false);
  assert.throws(() =>
    validateFoundationView(
      { ...view, command: { ...view.command, campaignId: uiId(44) } },
      view.campaignId,
    ),
  );
  assert.throws(() =>
    validateFoundationView({ ...view, owner: null }, view.campaignId),
  );
});

test("read and mutation requests use same-origin no-store and contain only the bounded command", async (t) => {
  const view = foundationUiFixture();
  const seen = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    seen.push({ url, init });
    return Response.json(view);
  });
  assert.deepEqual(await loadFoundationLoop(view.campaignId), view);
  const attempt = foundationAttempt(
    view,
    "reward",
    { rewardId: uiId(15), expectedRewardVersion: 1 },
    null,
    () => uiId(55),
  );
  await sendFoundationCommand(view.campaignId, attempt);
  assert.equal(seen[0].url, `/api/campaigns/${view.campaignId}/foundation`);
  assert.equal(seen[0].init.method, "GET");
  assert.equal(seen[1].init.credentials, "same-origin");
  assert.equal(seen[1].init.cache, "no-store");
  assert.deepEqual(JSON.parse(seen[1].init.body), attempt);
});

test("transport loss, malformed successes and server errors retain uncertainty only for writes", async (t) => {
  const view = foundationUiFixture();
  const attempt = foundationAttempt(view, "reward", {}, null, () => uiId(55));
  const mock = t.mock.method(globalThis, "fetch", async () => {
    throw new Error("synthetic");
  });
  await assert.rejects(
    sendFoundationCommand(view.campaignId, attempt),
    (e) => e instanceof FoundationClientError && e.uncertain,
  );
  await assert.rejects(
    sendFoundationCommand(view.campaignId, { ...attempt, kind: "quote" }),
    (e) => !e.uncertain,
  );
  mock.mock.mockImplementation(async () =>
    Response.json({ error: { code: "unavailable" } }, { status: 503 }),
  );
  await assert.rejects(
    sendFoundationCommand(view.campaignId, attempt),
    (e) => e.uncertain,
  );
  mock.mock.mockImplementation(async () =>
    Response.json({ error: { code: "reward_claimed" } }, { status: 409 }),
  );
  await assert.rejects(
    sendFoundationCommand(view.campaignId, attempt),
    (e) => e.code === "reward_claimed" && !e.uncertain,
  );
  mock.mock.mockImplementation(async () =>
    Response.json({ secret: "never render unvalidated response" }),
  );
  await assert.rejects(
    sendFoundationCommand(view.campaignId, attempt),
    (e) => e.uncertain,
  );
  mock.mock.mockImplementation(async () =>
    Response.json({
      ...view,
      command: {
        ...view.command,
        timeline: { ...view.command.timeline, epoch: 2 },
      },
    }),
  );
  await assert.rejects(
    sendFoundationCommand(view.campaignId, attempt),
    (e) => e.uncertain,
  );
});

test("returned quote must match the requested intent and full frozen command", async (t) => {
  const view = foundationUiFixture();
  const attempt = foundationAttempt(
    view,
    "quote",
    { take: [], give: [] },
    null,
    () => uiId(55),
  );
  const quote = {
    schemaVersion: 1,
    command: attempt.command,
    intent: attempt.input,
    lines: [],
    payment: 1,
  };
  const mock = t.mock.method(globalThis, "fetch", async () =>
    Response.json(quote),
  );
  assert.deepEqual(
    await sendFoundationCommand(view.campaignId, attempt),
    quote,
  );
  mock.mock.mockImplementation(async () =>
    Response.json({
      ...quote,
      intent: { take: [{ itemId: uiId(33), quantity: 100 }], give: [] },
    }),
  );
  await assert.rejects(sendFoundationCommand(view.campaignId, attempt));
  mock.mock.mockImplementation(async () =>
    Response.json({
      ...quote,
      command: { ...quote.command, expectedRevision: 99 },
    }),
  );
  await assert.rejects(sendFoundationCommand(view.campaignId, attempt));
});
