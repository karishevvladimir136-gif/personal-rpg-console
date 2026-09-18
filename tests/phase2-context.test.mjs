import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { buildContext, modelBudget } from "../src/lib/gameplay/dm-context.ts";
import { runtimeFixture } from "./phase2-runtime-fixtures.mjs";
const model = "gpt-6-astra";
test("verified per-model limits reserve output and at least five percent safety without fallback", () => {
  assert.equal(modelBudget("gpt-5.4-mini").contextLimit, 400000);
  assert.equal(modelBudget("gpt-5.4").contextLimit, 1050000);
  assert.equal(modelBudget(model).contextLimit, 1050000);
  assert.equal(modelBudget(model).safetyMargin, 52500);
  assert.equal(modelBudget(model).outputReserve, 4096);
  assert.equal(modelBudget(model).inputCap, 64000);
  assert.throws(() => modelBudget("unknown-model"), { code: "configuration" });
});
test("public narrator and feedback are constructed without private state, private checkpoints or plan prose", () => {
  const { source, input, resolution } = runtimeFixture();
  source.checkpoint = {
    campaignId: input.campaignId,
    stateRevision: 1,
    settingsRevision: 1,
    valid: true,
    sourceIds: [],
    publicText: "Public anchor",
    privateText: "CHECKPOINT_PRIVATE_MARKER",
  };
  const planning = buildContext(source, input, "plan", { model });
  assert.ok(planning.input.includes("SYNTHETIC_PRIVATE_CONTEXT_MARKER"));
  for (const stage of ["narrate", "feedback"]) {
    const context = buildContext(source, input, stage, { model, resolution });
    assert.ok(!context.input.includes("SYNTHETIC_PRIVATE"));
    assert.ok(!context.input.includes("CHECKPOINT_PRIVATE"));
    assert.ok(!context.input.includes("privateState"));
  }
});
test("gameplay gets approved current guidance rather than feedback conversation", () => {
  const { source, input, sessionId } = runtimeFixture();
  source.runtime.sessionGuidance = [
    {
      id: randomUUID(),
      campaign_id: input.campaignId,
      session_id: sessionId,
      text: "APPROVED_SESSION_GUIDE",
      created_at: "now",
    },
    {
      id: randomUUID(),
      campaign_id: input.campaignId,
      session_id: randomUUID(),
      text: "EXPIRED_GUIDANCE",
      created_at: "now",
    },
  ];
  const context = buildContext(source, input, "plan", { model });
  assert.ok(context.input.includes("APPROVED_SESSION_GUIDE"));
  assert.ok(!context.input.includes("FEEDBACK_HISTORY_ONLY"));
  assert.ok(!context.input.includes("EXPIRED_GUIDANCE"));
  source.snapshot.sessions[0].status = "closed";
  assert.ok(
    !buildContext(source, input, "plan", { model }).input.includes(
      "APPROVED_SESSION_GUIDE",
    ),
  );
});
test("companion context requires explicit witnesses and cannot inherit campaign secrets or another conversation", () => {
  const { source, input } = runtimeFixture();
  const companionId = randomUUID(),
    listenerId = randomUUID();
  input.mode = "companion";
  input.companionId = companionId;
  input.listenerIds = [listenerId];
  source.snapshot.quests = [
    {
      campaign_id: input.campaignId,
      id: randomUUID(),
      title: "UNWITNESSED_QUEST",
    },
  ];
  source.snapshot.documents.push({
    campaign_id: input.campaignId,
    id: randomUUID(),
    status: "canon",
    body: "UNSHARED_CANON",
  });
  source.runtime.conversations = [
    {
      campaign_id: input.campaignId,
      id: randomUUID(),
      entity_id: companionId,
      entries: [
        { listenerIds: [], reply: "PRIVATE_TO_COMPANION_ONLY" },
        { listenerIds: [listenerId], reply: "WITNESSED_DIALOGUE" },
      ],
    },
    {
      campaign_id: input.campaignId,
      id: randomUUID(),
      entity_id: randomUUID(),
      entries: [{ listenerIds: [listenerId], reply: "OTHER_COMPANION" }],
    },
  ];
  const context = buildContext(source, input, "plan", { model });
  assert.ok(context.input.includes("WITNESSED_DIALOGUE"));
  for (const marker of [
    "PRIVATE_TO_COMPANION_ONLY",
    "OTHER_COMPANION",
    "UNSHARED_CANON",
    "UNWITNESSED_QUEST",
    "SYNTHETIC_PRIVATE_CONTEXT_MARKER",
  ])
    assert.ok(!context.input.includes(marker));
});
test("complete bilingual exchanges retain source IDs and recorded outcomes intact", () => {
  const { source, input, resolution } = runtimeFixture();
  source.runtime.turns = [
    {
      id: randomUUID(),
      campaign_id: input.campaignId,
      session_id: source.snapshot.sessions[0].id,
      status: "committed",
      mode: "game",
      input: "Обещаю вернуться.",
      narration: "The witness remembers the promise.",
      listenerIds: [],
    },
  ];
  const result = buildContext(source, input, "narrate", { model, resolution });
  const data = JSON.parse(result.input);
  assert.equal(data.exchanges.length, 1);
  assert.equal(data.exchanges[0].input, "Обещаю вернуться.");
  assert.equal(data.mandatory.outcomes[0].text, "The public bell rings.");
  assert.ok(result.estimatedTokens > Buffer.byteLength(result.input));
});
test("hidden and undisclosable targets never enter the public narration request", () => {
  const { source, input, resolution, actorId } = runtimeFixture();
  const checks = [
    {
      id: randomUUID(),
      actorId,
      kind: "skill",
      visibility: "private",
      important: true,
      dc: 37,
      total: 41,
      success: true,
    },
    {
      id: randomUUID(),
      actorId,
      kind: "skill",
      visibility: "player",
      important: true,
      dcPublic: false,
      dc: 36,
      total: 12,
      success: false,
    },
  ];
  source.snapshot.settings.values.showDc = true;
  let data = JSON.parse(
    buildContext(source, input, "narrate", { model, resolution, checks }).input,
  );
  assert.deepEqual(data.mandatory.recordedChecks, [
    { actorId, kind: "skill", total: 12, success: false },
  ]);
  source.snapshot.settings.values.dicePresentation = "hidden";
  data = JSON.parse(
    buildContext(source, input, "narrate", { model, resolution, checks }).input,
  );
  assert.deepEqual(data.mandatory.recordedChecks, []);
  assert.deepEqual(data.mandatory.playerCheckOutcomes, [
    { actorId, kind: "skill", success: false },
  ]);
  assert.ok(!JSON.stringify(data.mandatory.playerCheckOutcomes).includes("dc"));
  assert.ok(
    !JSON.stringify(data.mandatory.playerCheckOutcomes).includes("dice"),
  );
});
test("budget overflow and missing or stale continuity pause without slicing input or calling a model", () => {
  const { source, input } = runtimeFixture();
  const budget = { ...modelBudget(model), inputCap: 500 };
  assert.throws(() => buildContext(source, input, "plan", { model, budget }), {
    code: "context",
  });
  assert.equal(input.input, "Listen at the door. Слушать у двери.");
  source.historyComplete = false;
  assert.throws(() => buildContext(source, input, "plan", { model }), {
    code: "context",
  });
  source.historyComplete = true;
  source.checkpoint = {
    campaignId: input.campaignId,
    stateRevision: 0,
    settingsRevision: 1,
    sourceIds: [],
    valid: true,
    publicText: "Stale",
    privateText: null,
  };
  assert.throws(() => buildContext(source, input, "plan", { model }), {
    code: "context",
  });
});
test("very large canon and too many uncovered exchanges safely pause rather than grow indefinitely", () => {
  const { source, input } = runtimeFixture();
  source.snapshot.documents.push({
    campaign_id: input.campaignId,
    id: randomUUID(),
    status: "canon",
    body: "x".repeat(100000),
  });
  assert.throws(() => buildContext(source, input, "plan", { model }), {
    code: "context",
  });
  source.snapshot.documents.pop();
  source.runtime.turns = Array.from({ length: 33 }, () => ({
    id: randomUUID(),
    campaign_id: input.campaignId,
    status: "committed",
    mode: "game",
    input: "Ask",
    narration: "Reply",
  }));
  assert.throws(() => buildContext(source, input, "plan", { model }), {
    code: "context",
  });
});
test("wrong campaign, stale revision and cross-campaign evidence are rejected before serialization", () => {
  const { source, input } = runtimeFixture();
  assert.throws(
    () =>
      buildContext(source, { ...input, campaignId: randomUUID() }, "plan", {
        model,
      }),
    { code: "context" },
  );
  assert.throws(
    () =>
      buildContext(source, { ...input, expectedRevision: 2 }, "plan", {
        model,
      }),
    { code: "context" },
  );
  source.snapshot.items = [{ campaign_id: randomUUID() }];
  assert.throws(() => buildContext(source, input, "plan", { model }), {
    code: "context",
  });
});
