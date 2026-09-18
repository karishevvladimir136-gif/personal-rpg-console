import assert from "node:assert/strict";
import test from "node:test";
import {
  campaignFeedback,
  feedbackMaxCharacters,
  feedbackSend,
} from "../src/lib/persistence/feedback-model.ts";
import { createMutationAttempt } from "../src/lib/persistence/client.ts";
import {
  documentDraft,
  documentRestore,
  documentSave,
} from "../src/lib/persistence/document-model.ts";

const campaignA = "ce0b41dd-167d-46c1-aaf0-b819e27903a2";
const campaignB = "29198bfe-6162-4eec-9dc4-ff16d257595d";

test("feedback stores literal owner words in a dedicated operation, without a reply or game patch", () => {
  const body =
    "  Slower scenes, please.\nБольше тишины. <script>literal</script>  ";
  assert.deepEqual(feedbackSend(campaignA, body), {
    operation: "feedback.send",
    campaignId: campaignA,
    expectedRevision: 0,
    payload: { body },
  });
  assert.throws(() => feedbackSend(campaignA, " \n "));
  assert.throws(() =>
    feedbackSend(campaignA, "x".repeat(feedbackMaxCharacters + 1)),
  );
  assert.equal(
    feedbackSend(campaignA, "x".repeat(feedbackMaxCharacters)).payload.body
      .length,
    20000,
  );
});

test("feedback retry keeps one request identity; a new message or campaign gets a new identity", () => {
  const input = feedbackSend(campaignA, "More quiet moments.");
  const first = createMutationAttempt(null, input);
  assert.equal(createMutationAttempt(first, input).requestId, first.requestId);
  assert.notEqual(
    createMutationAttempt(first, feedbackSend(campaignA, "More dialogue."))
      .requestId,
    first.requestId,
  );
  assert.notEqual(
    createMutationAttempt(first, feedbackSend(campaignB, input.payload.body))
      .requestId,
    first.requestId,
  );
});

test("feedback view remains scoped and chronological without altering either campaign list", () => {
  const rows = Object.freeze([
    Object.freeze({
      id: "second",
      campaign_id: campaignA,
      body: "Second invented note",
      created_at: "2026-09-17T02:00:00Z",
    }),
    Object.freeze({
      id: "other",
      campaign_id: campaignB,
      body: "Unrelated invented note",
      created_at: "2026-09-17T00:00:00Z",
    }),
    Object.freeze({
      id: "first",
      campaign_id: campaignA,
      body: "First invented note",
      created_at: "2026-09-17T01:00:00Z",
    }),
  ]);
  assert.deepEqual(
    campaignFeedback(campaignA, rows).map((row) => row.id),
    ["first", "second"],
  );
  assert.deepEqual(
    campaignFeedback(campaignB, rows).map((row) => row.id),
    ["other"],
  );
  assert.equal(rows[0].id, "second");
});

test("DM Guide uses ordinary explicit document revisions and is unchanged by feedback construction", () => {
  const guide = Object.freeze({
    id: "guide-a",
    campaign_id: campaignA,
    title: "DM Guide",
    status: "reference",
    current_version_id: "version-2",
    body: "Saved invented guidance",
    revision: 2,
    updated_at: "2026-09-17T00:00:00Z",
  });
  const before = structuredClone(guide);
  feedbackSend(campaignA, "Suggested new preference");
  assert.deepEqual(guide, before);
  const correction = documentSave(campaignA, {
    ...documentDraft(guide),
    body: "Explicit owner revision",
  });
  assert.equal(correction.operation, "document.save");
  assert.equal(correction.expectedRevision, 2);
  assert.equal(correction.payload.status, "reference");
  const restore = documentRestore(campaignA, guide, {
    id: "version-1",
    campaign_id: campaignA,
    document_id: guide.id,
    version: 1,
    title: "DM Guide",
    status: "reference",
    body: "Earlier guide",
    restored_from: null,
    created_at: "2026-09-16T00:00:00Z",
  });
  assert.equal(restore.operation, "document.restore");
  assert.equal(restore.payload.versionId, "version-1");
  assert.deepEqual(guide, before);
});
