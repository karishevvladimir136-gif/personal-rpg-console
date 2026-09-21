import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  authoringUiFixture,
  scriptedAuthoringSession,
  uiId,
} from "./d2a-ui-fixtures.mjs";
import {
  compositionAttempt,
  createAuthoringTransport,
  editAttempt,
  interpretAttempt,
  mergeComposition,
  pendingAuthoringKey,
  readAuthoringAttempt,
  readAuthoringCatalog,
  readAuthoringResult,
  readAuthoringReply,
  restoreAuthoringAttempt,
} from "../src/components/world-lab/authoring-client.ts";
import {
  readPublicLabRun,
  runLabAttempt,
} from "../src/components/world-lab/client.ts";
const model = {
  providerId: "openai",
  modelId: "gpt-6-astra",
  reasoning: "max",
};

test("D2A public authoring allowlist excludes private basis, provenance and raw authority", () => {
  const f = authoringUiFixture();
  assert.deepEqual(readAuthoringCatalog(f.authoring), f.authoring);
  for (const mutate of [
    (c) => {
      c.privateCount = 9;
    },
    (c) => {
      c.drafts[0].proposal.basis = { ownerId: uiId(80) };
    },
    (c) => {
      c.drafts[0].proposal.choices.actors[0].id = uiId(80);
    },
    (c) => {
      c.drafts[0].proposal.statements[0].sourceVersionId = uiId(80);
    },
    (c) => {
      c.drafts[0].proposal.review.approval = true;
    },
    (c) => {
      c.drafts[0].proposal.review.affectedActorIndexes = [50];
    },
    (c) => {
      c.drafts[0].proposal.choices.threads[0].actorIndexes = [50];
    },
    (c) => {
      c.models[0].providerKey = "PRIVATE";
    },
  ]) {
    const c = structuredClone(f.authoring);
    mutate(c);
    assert.throws(() => readAuthoringCatalog(c));
  }
});

test("D2A requests accept offered checkpoint/models and editable human fields only", () => {
  const f = authoringUiFixture(),
    input = {
      saveId: f.campaign.bases[0].saveId,
      premise: "What if the gates stayed open?",
      model,
    };
  const request = interpretAttempt(f.campaign, f.authoring, input, () =>
    uiId(300),
  );
  assert.deepEqual(request, {
    action: "interpret",
    input: {
      ...input,
      operationId: uiId(300),
      campaignId: f.campaign.campaignId,
    },
  });
  for (const change of [
    { saveId: uiId(80) },
    { ownerId: uiId(80) },
    { premise: " " },
    { premise: "x".repeat(6001) },
    { model: { ...model, modelId: "gpt-5.4", reasoning: "high" } },
    { model: { ...model, reasoning: "invented" } },
    { model: { ...model, apiKey: "PRIVATE" } },
  ])
    assert.throws(() =>
      interpretAttempt(f.campaign, f.authoring, { ...input, ...change }),
    );
  const review = { ...f.draft.proposal.review, title: "Owner correction" };
  assert.equal(
    editAttempt(f.campaign.campaignId, f.authoring, f.draft, review, model)
      .input.review.title,
    "Owner correction",
  );
  assert.throws(() =>
    editAttempt(
      f.campaign.campaignId,
      f.authoring,
      f.draft,
      { ...review, affectedThreadIndexes: [60] },
      model,
    ),
  );
  assert.throws(() =>
    readAuthoringAttempt(
      { ...request, input: { ...request.input, manifestId: uiId(80) } },
      f.campaign.campaignId,
    ),
  );
  const ambiguous = authoringUiFixture("en", { ambiguous: true });
  assert.throws(() =>
    compositionAttempt(
      "approve",
      ambiguous.campaign.campaignId,
      ambiguous.authoring,
      ambiguous.draft,
    ),
  );
});

test("D2A transport sends language separately and exact lost-response replay retains operation and body", async () => {
  const f = authoringUiFixture("ru"),
    calls = [],
    request = interpretAttempt(
      f.campaign,
      f.authoring,
      {
        saveId: f.campaign.bases[0].saveId,
        premise: f.draft.proposal.premise,
        model,
      },
      () => uiId(301),
    );
  const transport = createAuthoringTransport("ru", async (url, init) => {
    calls.push({ url, init });
    if (calls.length === 2) throw new Error("PRIVATE_TRANSPORT_ERROR");
    return Response.json(
      init.method ? { draft: f.draft, run: null } : f.authoring,
    );
  });
  await transport.load(f.campaign.campaignId);
  await assert.rejects(
    () => transport.send(request),
    (e) => e.code === "uncertain" && !e.message.includes("PRIVATE"),
  );
  const restored = restoreAuthoringAttempt(
    JSON.stringify(request),
    f.campaign.campaignId,
  );
  await transport.send(restored);
  assert.equal(
    calls[0].url,
    `/api/world-lab/composition?campaignId=${f.campaign.campaignId}`,
  );
  assert.equal(calls[0].init.headers["Accept-Language"], "ru");
  assert.equal(calls[1].init.headers["Accept-Language"], "ru");
  assert.equal(calls[1].init.body, calls[2].init.body);
  assert.equal(
    pendingAuthoringKey(f.campaign.campaignId),
    `world-lab-composition-pending:${f.campaign.campaignId}`,
  );
  assert.equal(
    restoreAuthoringAttempt(JSON.stringify(request), uiId(80)),
    null,
  );
  assert.equal(
    restoreAuthoringAttempt(
      JSON.stringify({ ...request, input: { ...request.input, lease: 8 } }),
      f.campaign.campaignId,
    ),
    null,
  );
});

test("D2A error envelopes expose only known sanitized codes and malformed success remains retryable", async () => {
  const f = authoringUiFixture(),
    request = compositionAttempt(
      "approve",
      f.campaign.campaignId,
      f.authoring,
      f.draft,
    );
  for (const [status, code, expected] of [
    [409, "conflict", "conflict"],
    [403, "scope", "forbidden"],
    [422, "PRIVATE_DETAILS", "unavailable"],
    [500, "provider", "uncertain"],
  ]) {
    await assert.rejects(
      () =>
        createAuthoringTransport("en", async () =>
          Response.json(
            { error: { code, message: "PRIVATE_DETAILS" } },
            { status },
          ),
        ).send(request),
      (e) => e.code === expected && !e.message.includes("PRIVATE"),
    );
  }
  await assert.rejects(
    () =>
      createAuthoringTransport("en", async () =>
        Response.json({ draft: f.draft, run: null, privateValue: "PRIVATE" }),
      ).send(request),
    (e) => e.code === "uncertain",
  );
});

test("D2A scripted client flow saves correction, prepares without advancing and starts once across lost response", async () => {
  const session = scriptedAuthoringSession(),
    campaign = session.campaign();
  let catalog = await session.authoringTransport.load(),
    serial = 400;
  const allocate = () => uiId(serial++);
  const interpreted = await session.authoringTransport.send(
    interpretAttempt(
      campaign,
      catalog,
      {
        saveId: campaign.bases[0].saveId,
        premise: "What if Mara kept the eastern gate open?",
        model,
      },
      allocate,
    ),
  );
  assert.equal(session.audit.modelResponses, 1);
  catalog = mergeComposition(catalog, interpreted.draft);
  assert.ok(
    interpreted.draft.proposal.blockers.includes("ambiguity_unresolved"),
  );
  const edited = await session.authoringTransport.send(
    editAttempt(
      campaign.campaignId,
      catalog,
      interpreted.draft,
      {
        ...interpreted.draft.proposal.review,
        title: "A corrected branch",
        ambiguityAnswers: ["Only the eastern gate."],
      },
      model,
      allocate,
    ),
  );
  assert.equal(
    session.audit.modelResponses,
    1,
    "editing is free of provider requests",
  );
  catalog = mergeComposition(catalog, edited.draft);
  const prepared = readAuthoringResult(
    await session.authoringTransport.send(
      compositionAttempt(
        "approve",
        campaign.campaignId,
        catalog,
        edited.draft,
        allocate,
      ),
    ),
    campaign.campaignId,
  );
  assert.equal(prepared.run.status, "prepared");
  assert.equal(
    prepared.run.currentWorldMinutes,
    prepared.run.startWorldMinutes,
  );
  assert.equal(session.audit.modelResponses, 1);
  const start = runLabAttempt("continue", prepared.run, allocate);
  session.interruptNext("execution");
  await assert.rejects(() => session.transport.send(start));
  const replayed = readPublicLabRun(
    await session.transport.send(start),
    campaign.campaignId,
  );
  assert.equal(
    replayed.currentWorldMinutes,
    prepared.run.currentWorldMinutes + 60,
  );
  assert.equal(replayed.checkpoints.length, 2);
  assert.equal(replayed.execution.recordedResponses, 1);
  assert.equal(session.audit.modelResponses, 2);
  assert.deepEqual(session.calls.at(-1), session.calls.at(-2));
  const paused = await session.transport.send(
    runLabAttempt("pause", replayed, allocate),
  );
  const resumed = await session.transport.send(
    runLabAttempt("resume", paused, allocate),
  );
  const cancelled = await session.transport.send(
    runLabAttempt("cancel", resumed, allocate),
  );
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.currentWorldMinutes, replayed.currentWorldMinutes);
  assert.equal(session.audit.modelResponses, 2);
});

test("D2A stale authoring receipt cannot roll a newer visible immutable version backward", () => {
  const f = authoringUiFixture(),
    newer = { ...structuredClone(f.draft), versionId: uiId(999), version: 9 };
  const updated = mergeComposition(f.authoring, newer);
  assert.equal(mergeComposition(updated, f.draft), updated);
  const run = { ...structuredClone(f.campaign), runs: [] };
  assert.deepEqual(run.runs, []);
});

test("D2A mismatched or partial successful reply stays uncertain for exact receipt recovery", () => {
  const f = authoringUiFixture();
  const interpretation = interpretAttempt(f.campaign, f.authoring, {
    saveId: f.draft.base.saveId,
    premise: f.draft.proposal.premise,
    model,
  });
  assert.equal(
    readAuthoringReply(
      { draft: f.draft, run: null },
      interpretation,
      f.authoring,
    ).draft.id,
    f.draft.id,
  );
  const wrong = structuredClone(f.draft);
  wrong.proposal.premise = "An unrelated request";
  assert.throws(
    () =>
      readAuthoringReply(
        { draft: wrong, run: null },
        interpretation,
        f.authoring,
      ),
    (e) => e.code === "uncertain",
  );
  const approval = compositionAttempt(
    "approve",
    f.campaign.campaignId,
    f.authoring,
    f.draft,
  );
  assert.throws(
    () =>
      readAuthoringReply({ draft: f.draft, run: null }, approval, f.authoring),
    (e) => e.code === "uncertain",
  );
});

test("D2A authoring imports only public leaves and uses no active timeline, private state or HTML injection", () => {
  for (const name of [
    "authoring-client.ts",
    "world-lab-authoring.tsx",
    "authoring-text.ts",
  ]) {
    const source = readFileSync(
      new URL(`../src/components/world-lab/${name}`, import.meta.url),
      "utf8",
    );
    assert.doesNotMatch(
      source,
      /server-contracts|composition-contracts|world-lab\/(inputs|store|composition\.ts|writer)|process\.env|dangerouslySetInnerHTML|activeTimeline|activationEpoch/,
    );
  }
});
