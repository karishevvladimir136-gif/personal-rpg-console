import test from "node:test";
import assert from "node:assert/strict";
import { uiId } from "./d1-ui-fixtures.mjs";
import { continuationUiFixture } from "./world-lab-continuation-fixtures.mjs";
import { parseContinuationRequest } from "../src/lib/world-lab/continuation-validation.ts";
import {
  continuationDraftAttempt,
  continuationInterpretAttempt,
  createContinuationTransport,
  mergeContinuation,
  offeredContinuation,
  pendingContinuationKey,
  readContinuationCatalog,
  readContinuationInspection,
  readContinuationReply,
  restoreContinuationAttempt,
} from "../src/components/world-lab/continuation-client.ts";
import { pendingAuthoringKey } from "../src/components/world-lab/authoring-client.ts";

test("continuation permits only offered run/checkpoint and one offered model", () => {
  const f = continuationUiFixture(),
    op = () => uiId(401);
  assert.deepEqual(
    offeredContinuation(
      f.campaign,
      f.source.sourceRunId,
      f.source.sourceCheckpointId,
    ),
    f.source,
  );
  assert.throws(() =>
    offeredContinuation(f.campaign, f.source.sourceRunId, uiId(999)),
  );
  assert.throws(() =>
    offeredContinuation(f.campaign, uiId(998), f.source.sourceCheckpointId),
  );
  const request = continuationInterpretAttempt(
    f.catalog,
    f.inspection,
    f.draft.proposal.premise,
    { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" },
    op,
  );
  assert.deepEqual(request.input.source, f.source);
  assert.equal(request.input.operationId, op());
  assert.throws(() =>
    continuationInterpretAttempt(
      f.catalog,
      f.inspection,
      "A change",
      { providerId: "openai", modelId: "gpt-5.4", reasoning: "high" },
      op,
    ),
  );
  assert.throws(() =>
    parseContinuationRequest({
      ...request,
      input: { ...request.input, manifestId: uiId(997) },
    }),
  );
  assert.throws(() =>
    parseContinuationRequest({
      ...request,
      input: {
        ...request.input,
        source: { ...f.source, sourceInputDigest: "a".repeat(64) },
      },
    }),
  );
});

test("public inspection/replies allowlist fields and bind source plus detached child identity", () => {
  const f = continuationUiFixture();
  assert.deepEqual(
    readContinuationInspection(f.inspection, f.campaign.campaignId),
    f.inspection,
  );
  assert.throws(() =>
    readContinuationInspection(
      { ...f.inspection, privateCount: 22 },
      f.campaign.campaignId,
    ),
  );
  assert.throws(() =>
    readContinuationCatalog(f.catalog, f.campaign.campaignId, {
      ...f.source,
      expectedRevision: 20,
    }),
  );
  const request = continuationDraftAttempt(
    "approve",
    f.catalog,
    f.draft.versionId,
    undefined,
    () => uiId(402),
  );
  const approved = {
    ...f.draft,
    version: 3,
    versionId: uiId(404),
    proposal: { ...f.draft.proposal, phase: "approved" },
  };
  const run = {
    ...f.child,
    scenario: { ...f.child.scenario, scenarioVersionId: approved.versionId },
  };
  const result = { source: f.source, draft: approved, run };
  assert.deepEqual(
    readContinuationReply(result, request, f.catalog, f.inspection),
    result,
  );
  for (const altered of [
    { ...result, source: { ...f.source, sourceCheckpointId: uiId(999) } },
    { ...result, source: { ...f.source, expectedRevision: 20 } },
    { ...result, run: { ...run, timelineId: f.inspection.source.timelineId } },
    { ...result, run: { ...run, continuation: undefined } },
    {
      ...result,
      run: {
        ...run,
        continuation: {
          sourceRunId: uiId(997),
          sourceCheckpointId: f.source.sourceCheckpointId,
        },
      },
    },
    { ...result, run: null },
    { ...result, rawState: "PRIVATE_CANARY" },
  ])
    assert.throws(
      () => readContinuationReply(altered, request, f.catalog, f.inspection),
      (e) => e.code === "uncertain",
    );
});

test("pending request has distinct namespace and older reply cannot replace newer draft", () => {
  const f = continuationUiFixture(),
    request = continuationDraftAttempt(
      "approve",
      f.catalog,
      f.draft.versionId,
      undefined,
      () => uiId(406),
    );
  assert.notEqual(
    pendingContinuationKey(f.campaign.campaignId),
    pendingAuthoringKey(f.campaign.campaignId),
  );
  assert.deepEqual(
    restoreContinuationAttempt(JSON.stringify(request), f.campaign.campaignId),
    request,
  );
  assert.equal(
    restoreContinuationAttempt(JSON.stringify(request), uiId(996)),
    null,
  );
  assert.equal(restoreContinuationAttempt("{", f.campaign.campaignId), null);
  assert.equal(
    restoreContinuationAttempt("x".repeat(70001), f.campaign.campaignId),
    null,
  );
  const catalog = {
    ...f.catalog,
    drafts: [{ ...f.draft, version: f.draft.version + 1 }],
  };
  assert.equal(
    mergeContinuation(catalog, { source: f.source, draft: f.draft, run: null }),
    catalog,
  );
});

test("inspection/load are read-only and uncertain write retry preserves exact request", async () => {
  const f = continuationUiFixture(),
    calls = [];
  const request = continuationInterpretAttempt(
    f.catalog,
    f.inspection,
    f.draft.proposal.premise,
    { providerId: "openai", modelId: "gpt-6-astra", reasoning: "high" },
    () => uiId(408),
  );
  const transport = createContinuationTransport("en", async (url, init) => {
    calls.push({ url: String(url), init });
    if (init.method === "POST") throw Error("response lost");
    return new Response(
      JSON.stringify(
        String(url).includes("mode=inspect") ? f.inspection : f.catalog,
      ),
      { status: 200 },
    );
  });
  await transport.inspect(f.campaign.campaignId, {
    sourceRunId: f.source.sourceRunId,
    sourceCheckpointId: f.source.sourceCheckpointId,
  });
  await transport.load(f.campaign.campaignId, f.source);
  for (const call of calls) {
    assert.equal(call.init.method, undefined);
    assert.equal(call.init.cache, "no-store");
  }
  await assert.rejects(transport.send(request), (e) => e.code === "uncertain");
  await assert.rejects(
    transport.send(structuredClone(request)),
    (e) => e.code === "uncertain",
  );
  assert.equal(calls[2].init.body, calls[3].init.body);
  assert.deepEqual(JSON.parse(calls[3].init.body), request);
});
