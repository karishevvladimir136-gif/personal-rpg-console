import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import ts from "typescript";
import russian from "../src/lib/locales/ru.json" with { type: "json" };
import fragment from "../src/lib/locales/phase1-b-ru.json" with { type: "json" };
import {
  documentDraft,
  documentSave,
  documentRestore,
  isDocumentDirty,
  rebaseDocumentDraft,
} from "../src/lib/persistence/document-model.ts";
import {
  createMutationAttempt,
  ClientPersistenceError,
  errorMessage,
} from "../src/lib/persistence/client.ts";

const campaignA = "d65bff55-6a04-4aa3-85d1-b1b870899f1b";
const campaignB = "833271bd-1b28-46c2-9bf7-7658182391c9";
const current = Object.freeze({
  id: "2b9cdb92-8e62-416b-9216-99f517e1a4c3",
  campaign_id: campaignA,
  title: "Synthetic glass coast",
  status: "canon",
  body: "Invented tide charts, revision two.",
  revision: 2,
  updated_at: "2026-09-17T00:00:00Z",
  current_version_id: "737d74dd-44d9-4710-b050-acd151beb0da",
});
const oldVersion = Object.freeze({
  id: "e8908fb4-e0f1-443f-be0d-e29ccfcd2b10",
  campaign_id: campaignA,
  document_id: current.id,
  version: 1,
  title: "Synthetic old coast",
  status: "reference",
  body: "Original invented charts.",
  restored_from: null,
  created_at: "2026-09-16T00:00:00Z",
});

test("document draft preserves literal owner text and original optimistic revision", () => {
  const draft = documentDraft(current);
  draft.body =
    "Owner correction <script>literal</script> $& {unknown}\nРусский текст";
  const mutation = documentSave(campaignA, draft);
  assert.equal(mutation.expectedRevision, 2);
  assert.equal(mutation.campaignId, campaignA);
  assert.equal(mutation.payload.body, draft.body);
  assert.equal(current.body, "Invented tide charts, revision two.");
  assert.equal(isDocumentDirty(draft, documentDraft(current)), true);
});

test("empty document creation has revision zero and no existing document identity", () => {
  const draft = documentDraft();
  assert.equal(isDocumentDirty(draft, documentDraft()), false);
  assert.equal(draft.status, "canon");
  const mutation = documentSave(campaignB, {
    ...draft,
    title: "Synthetic orbital notes",
  });
  assert.equal(mutation.expectedRevision, 0);
  assert.equal(mutation.campaignId, campaignB);
  assert.equal(Object.hasOwn(mutation.payload, "id"), false);
});

test("restore refers to an immutable prior version while retaining current revision guard", () => {
  const mutation = documentRestore(campaignA, current, oldVersion);
  assert.equal(mutation.operation, "document.restore");
  assert.equal(mutation.expectedRevision, 2);
  assert.deepEqual(mutation.payload, {
    id: current.id,
    versionId: oldVersion.id,
  });
  assert.equal(
    current.current_version_id,
    "737d74dd-44d9-4710-b050-acd151beb0da",
  );
  assert.equal(oldVersion.version, 1);
});

test("restore refuses another campaign or another document before submission", () => {
  assert.throws(() => documentRestore(campaignB, current, oldVersion));
  assert.throws(() =>
    documentRestore(campaignA, current, {
      ...oldVersion,
      campaign_id: campaignB,
    }),
  );
  assert.throws(() =>
    documentRestore(campaignA, current, {
      ...oldVersion,
      document_id: "wrong-document",
    }),
  );
});

test("uncertain document retries reuse request identity, edited payload and restore get new identities", () => {
  const input = documentSave(campaignA, documentDraft(current));
  const first = createMutationAttempt(null, input);
  const retry = createMutationAttempt(first, {
    ...input,
    payload: {
      body: input.payload.body,
      status: input.payload.status,
      title: input.payload.title,
      id: input.payload.id,
    },
  });
  assert.equal(retry.requestId, first.requestId);
  const changed = createMutationAttempt(first, {
    ...input,
    payload: { ...input.payload, body: "New correction" },
  });
  assert.notEqual(changed.requestId, first.requestId);
  const restore = createMutationAttempt(
    first,
    documentRestore(campaignA, current, oldVersion),
  );
  assert.notEqual(restore.requestId, first.requestId);
});

test("conflict and unavailable messages retain the draft and never display provider details", () => {
  const draft = { ...documentDraft(current), body: "Unsaved local correction" };
  const before = structuredClone(draft);
  assert.match(
    errorMessage(new ClientPersistenceError("conflict")),
    /draft is preserved/,
  );
  assert.doesNotMatch(
    errorMessage(new Error("synthetic SQL internal marker")),
    /SQL|marker/,
  );
  assert.deepEqual(draft, before);
  assert.equal(documentSave(campaignA, draft).expectedRevision, 2);
});

test("document dirty tracking includes title and canon/archive status without mutating baseline", () => {
  const baseline = documentDraft(current);
  assert.equal(isDocumentDirty({ ...baseline }, baseline), false);
  assert.equal(
    isDocumentDirty({ ...baseline, title: "Renamed" }, baseline),
    true,
  );
  assert.equal(
    isDocumentDirty({ ...baseline, status: "archived" }, baseline),
    true,
  );
  assert.equal(baseline.status, "canon");
});

test("explicit conflict rebase keeps owner text while adopting only the reviewed revision", () => {
  const draft = {
    ...documentDraft(current),
    body: "Owner's unsaved correction",
  };
  const latest = { ...current, revision: 3, body: "Saved elsewhere" };
  const next = rebaseDocumentDraft(draft, latest);
  assert.equal(next.body, draft.body);
  assert.equal(next.expectedRevision, 3);
  assert.equal(draft.expectedRevision, 2);
  assert.equal(latest.body, "Saved elsewhere");
  assert.equal(isDocumentDirty(next, documentDraft(latest)), true);
  assert.throws(() =>
    rebaseDocumentDraft(draft, { ...latest, id: "another-document" }),
  );
});

test("persistent campaign, document and settings messages have matching Russian interpolation", () => {
  const catalog = { ...russian, ...fragment };
  const parameters = (value) =>
    [...value.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
  for (const [key, value] of Object.entries(fragment)) {
    assert.ok(value.trim(), key);
    assert.deepEqual(parameters(value), parameters(key), key);
  }
  function check(expression) {
    if (ts.isStringLiteral(expression))
      assert.ok(Object.hasOwn(catalog, expression.text), expression.text);
    else if (ts.isConditionalExpression(expression)) {
      check(expression.whenTrue);
      check(expression.whenFalse);
    }
  }
  for (const filename of [
    "campaign-settings",
    "persistent-campaigns",
    "persistent-documents",
    "persistent-settings",
    "persistent-dm-chat",
  ]) {
    const file = new URL(`../src/components/${filename}.tsx`, import.meta.url);
    const ast = ts.createSourceFile(
      filename,
      readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function visit(node) {
      if (ts.isCallExpression(node) && node.expression.getText(ast) === "t")
        check(node.arguments[0]);
      if (ts.isJsxText(node))
        assert.ok(
          !/[A-Za-zА-Яа-яЁё]/.test(node.text),
          `${filename}: ${node.text.trim()}`,
        );
      ts.forEachChild(node, visit);
    }
    visit(ast);
  }
  for (const key of [
    "Canon",
    "Reference",
    "Archived",
    "Choose a TXT or MD file smaller than 200 KB.",
    "The file could not be read. Your existing draft is unchanged.",
  ])
    assert.ok(Object.hasOwn(catalog, key), key);
});
