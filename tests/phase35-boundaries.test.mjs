import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { validateSaveCommand } from "../src/lib/saves/validation.ts";
import { isTimelineFence } from "../src/lib/saves/fence.ts";
import { validateMutation } from "../src/lib/persistence/validation.ts";
import { validateTurnInput } from "../src/lib/gameplay/request-validation.ts";
import { validateMemoryRequest } from "../src/lib/memory/request-validation.ts";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { requireClaimTimeline } from "../src/lib/gameplay/timeline.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import { buildContext } from "../src/lib/gameplay/dm-context.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";

const campaignId = randomUUID();
const timeline = { timelineId: randomUUID(), epoch: 2 };
const base = () => ({
  requestId: randomUUID(),
  campaignId,
  timeline,
  expectedRevision: 10,
  expectedSavesRevision: 3,
});

test("save commands require exact public envelopes and explicit recovery; private overrides are rejected", () => {
  const create = {
    ...base(),
    kind: "manual",
    name: "Before the synthetic gate",
  };
  assert.deepEqual(validateSaveCommand(create, campaignId, "create"), {
    action: "create",
    input: create,
  });
  const load = {
    ...base(),
    saveId: randomUUID(),
    label: "An earlier path",
    recovery: false,
  };
  assert.deepEqual(validateSaveCommand(load, campaignId, "load").input, load);
  for (const invalid of [
    { ...load, campaignId: randomUUID() },
    { ...load, timeline: undefined },
    { ...load, timeline: { ...timeline, epoch: 0 } },
    { ...load, recovery: "true" },
    { ...load, privateState: {} },
    { ...load, expectedSavesRevision: 1.5 },
    { ...load, saveId: "not-an-id" },
    { ...load, label: "\u0000" },
  ])
    assert.throws(() => validateSaveCommand(invalid, campaignId, "load"));
  assert.throws(() => validateSaveCommand(create, campaignId, "delete"));
  assert.throws(() =>
    validateSaveCommand({ ...create, kind: "safety" }, campaignId, "create"),
  );
});

test("policy retains bounded slots without granting arbitrary control of stored state", () => {
  for (const retention of [10, 15, 20])
    assert.equal(
      validateSaveCommand(
        {
          ...base(),
          policy: { autosave: "session", retention, loadMode: "checkpoints" },
        },
        campaignId,
        "policy",
      ).input.policy.retention,
      retention,
    );
  for (const retention of [0, 9, 21, 15.5])
    assert.throws(() =>
      validateSaveCommand(
        {
          ...base(),
          policy: { autosave: "session", retention, loadMode: "unrestricted" },
        },
        campaignId,
        "policy",
      ),
    );
  assert.throws(() =>
    validateSaveCommand(
      {
        ...base(),
        policy: { autosave: "poll", retention: 15, loadMode: "unrestricted" },
      },
      campaignId,
      "policy",
    ),
  );
});

test("existing mutation, turn and memory validators preserve and validate the initiating fence", () => {
  const mutation = {
    requestId: randomUUID(),
    campaignId,
    operation: "quest.save",
    expectedRevision: 0,
    timeline,
    correctionScope: "timeline",
    payload: { title: "Synthetic quest", description: "", status: "open" },
  };
  assert.deepEqual(validateMutation(mutation).timeline, timeline);
  assert.throws(() =>
    validateMutation({ ...mutation, correctionScope: "guess-from-prose" }),
  );
  assert.throws(() =>
    validateMutation({ ...mutation, timeline: { ...timeline, private: true } }),
  );
  const input = {
    operationId: randomUUID(),
    campaignId,
    expectedRevision: 10,
    timeline,
    mode: "game",
    input: "Look at the gate",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  assert.deepEqual(validateTurnInput(input, campaignId).timeline, timeline);
  assert.throws(() =>
    validateTurnInput(
      { ...input, timeline: { timelineId: randomUUID(), epoch: -1 } },
      campaignId,
    ),
  );
  const end = {
    requestId: randomUUID(),
    campaignId,
    expectedRevision: 10,
    timeline,
    sessionId: randomUUID(),
  };
  assert.deepEqual(
    validateMemoryRequest(end, campaignId, "end").timeline,
    timeline,
  );
  assert.throws(() =>
    validateMemoryRequest({ ...end, timeline: "current" }, campaignId, "end"),
  );
  assert.equal(
    isTimelineFence({ ...timeline, epoch: Number.MAX_SAFE_INTEGER + 1 }),
    false,
  );
});

test("bound runtime RPCs cannot drift into another timeline after a partial request", async () => {
  const calls = [];
  const store = createRpcTurnStore(
    randomUUID(),
    async (args) => {
      calls.push(args);
      return { data: null };
    },
    null,
    timeline,
  );
  const operationId = randomUUID();
  await store.getPublic(campaignId, operationId);
  await store.claim(campaignId, operationId);
  const command = {
    campaignId,
    operationId,
    commandId: randomUUID(),
    action: "cancel",
    checkId: null,
    timeline,
  };
  await store.cancel(command);
  assert.ok(
    calls.every(
      (c) => JSON.stringify(c.p_timeline) === JSON.stringify(timeline),
    ),
  );
  assert.equal(
    Object.hasOwn(calls[2].p_payload, "timeline"),
    false,
    "legacy payload receives no undeclared envelope fields",
  );
  await assert.rejects(
    () => store.cancel({ ...command, timeline: { ...timeline, epoch: 3 } }),
    { code: "conflict" },
  );
  assert.equal(calls.length, 3, "stale local envelope never reaches a backend");
});

test("sibling completed turns cannot bypass scope checks through idempotent early returns", async () => {
  const operationId = randomUUID();
  const turn = {
    id: operationId,
    campaign_id: campaignId,
    timeline: { timelineId: randomUUID(), epoch: 3 },
    status: "committed",
  };
  const store = { begin: async () => turn, getPublic: async () => turn };
  await assert.rejects(
    () => runTurn({ campaignId, operationId, timeline }, { store }),
    { code: "conflict" },
  );
  await assert.rejects(
    () =>
      resumeTurn(
        { campaignId, operationId, timeline, action: "retry" },
        { store },
      ),
    { code: "conflict" },
  );
});

test("mixed claim, mechanics and direct model context fail before RNG or provider transport", () => {
  const fixture = runtimeFixture();
  const source = fixture.source;
  source.runtime.timeline = timeline;
  source.snapshot.timeline = timeline;
  source.runtime.turns = [];
  const operationId = randomUUID();
  const input = {
    campaignId: source.runtime.campaignId,
    operationId,
    timeline,
    expectedRevision: source.runtime.revision,
    input: "Synthetic gate",
    mode: "game",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  const claim = {
    source,
    lease: { campaignId: input.campaignId, operationId, timeline },
    turn: {
      input,
      public: { id: operationId, campaign_id: input.campaignId, timeline },
    },
  };
  assert.doesNotThrow(() =>
    requireClaimTimeline(claim, input.campaignId, operationId, timeline),
  );
  const wrong = structuredClone(claim);
  wrong.lease.timeline = { ...timeline, epoch: timeline.epoch + 1 };
  assert.throws(
    () => requireClaimTimeline(wrong, input.campaignId, operationId, timeline),
    { code: "conflict" },
  );
  delete wrong.lease.timeline;
  assert.throws(
    () => requireClaimTimeline(wrong, input.campaignId, operationId, timeline),
    { code: "conflict" },
  );
  source.snapshot.timeline = {
    timelineId: randomUUID(),
    epoch: timeline.epoch,
  };
  assert.throws(
    () => buildContext(source, input, "feedback", { model: "gpt-6-astra" }),
    { code: "context" },
  );
});
