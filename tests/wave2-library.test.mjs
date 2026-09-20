import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";
import { ownerLibraryAttempt } from "../src/lib/world-library-client.ts";
import { prepareOwnerPackBinding } from "../src/lib/world-packs/owner-binding.ts";
import { projectCharacterKnowledge } from "../src/lib/world-packs/projection.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import {
  authoringFixture,
  sourceInput,
  createDraft,
  packSave,
  approveInput,
  owner,
  id,
} from "./wave2-library-fixtures.mjs";

test("owner source authoring preserves exact UTF-8 text, CRLF, digest and immutable history", async () => {
  const f = authoringFixture(),
    input = sourceInput({ text: "\ufeff# Синтетика 🌊\r\nHarbor: open\r\n" });
  const first = await f.service.execute(input);
  assert.deepEqual(await f.service.execute(input), first);
  const detail = await f.service.source(first.versionId);
  assert.equal(detail.text, input.text);
  assert.equal(detail.digest, sha256(input.text));
  assert.equal(detail.knowledge, "source");
  const correction = await f.service.execute(
    sourceInput({
      sourceId: first.id,
      expectedVersionId: first.versionId,
      text: "Corrected text",
      knowledge: "future_source",
    }),
  );
  assert.equal((await f.service.source(first.versionId)).text, input.text);
  assert.equal(
    (await f.service.source(correction.versionId)).history.length,
    2,
  );
  await assert.rejects(
    () => f.service.execute({ ...input, title: "same operation changed" }),
    /conflict/,
  );
  await assert.rejects(
    () =>
      f.service.execute(
        sourceInput({ sourceId: first.id, expectedVersionId: first.versionId }),
      ),
    /conflict/,
  );
  assert.ok(f.calls.every((c) => c.p_campaign_id === null));
});

test("authoring accepts only bounded explicit commands and refuses foreign owners", async () => {
  const f = authoringFixture(),
    input = sourceInput();
  for (const command of [
    { ...input, campaignId: id() },
    { ...input, format: "pdf" },
    { ...input, knowledge: "character" },
    { ...input, text: "x".repeat(250001) },
    { ...input, text: "a\0b" },
    { ...input, expectedVersionId: id() },
    { action: "auto.publish" },
  ])
    await assert.rejects(() => f.service.execute(command));
  const saved = await f.service.execute(input);
  const other = createOwnerLibraryAuthoring(id(), f.store);
  await assert.rejects(
    () =>
      other.execute(
        sourceInput({ sourceId: saved.id, expectedVersionId: saved.versionId }),
      ),
    /scope/,
  );
});

test("owner DTOs omit owner and campaign state; API authentication and write policy remain separate", async () => {
  const f = authoringFixture();
  const { pack } = await createDraft(f);
  const index = await f.service.read();
  assert.deepEqual(Object.keys(index).sort(), ["jobs", "packs", "sources"]);
  assert.equal(JSON.stringify(index).includes(owner), false);
  assert.equal("ownerId" in pack, false);
  for (const row of index.sources)
    assert.deepEqual(Object.keys(row).sort(), [
      "digest",
      "format",
      "id",
      "knowledge",
      "title",
      "version",
      "versionId",
      "visibility",
    ]);
  const route = await readFile(
    new URL("../src/app/api/world-library/route.ts", import.meta.url),
    "utf8",
  );
  const service = await readFile(
    new URL("../src/lib/server/world-library/authoring.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /readWriteRequest\(request\)/);
  assert.match(service, /await requireOwner\(\)/);
  assert.doesNotMatch(
    service + route,
    /FoundationSnapshot|readCampaign|dm_private/,
  );
});

test("pack approval is explicit, complete-review fenced and does not auto-approve any claims", async () => {
  const f = authoringFixture(),
    { pack } = await createDraft(f);
  await assert.rejects(() =>
    f.service.execute(approveInput(pack, { reviewedUnknownIds: [] })),
  );
  await assert.rejects(() =>
    f.service.execute(approveInput(pack, { acknowledgeCoverage: false })),
  );
  await assert.rejects(
    () =>
      f.service.execute(
        approveInput(pack, { canonClaimIds: [pack.body.claims[0].id] }),
      ),
    /conflict/,
  );
  const command = approveInput(pack),
    approved = await f.service.execute(command);
  assert.deepEqual(await f.service.execute(command), approved);
  const reviewed = await f.service.pack(approved.versionId);
  assert.equal(reviewed.status, "approved");
  assert.ok(reviewed.body.claims.every((c) => c.authority === "reference"));
  assert.equal((await f.service.pack(pack.versionId)).status, "draft");
  await assert.rejects(() => f.service.execute(approveInput(pack)), /conflict/);
});

test("owner edits create a new draft and preserve source evidence; fabricated source facts are rejected", async () => {
  const f = authoringFixture(),
    { pack } = await createDraft(f);
  const edited = packSave(pack);
  edited.claims[1].text = "location: Forest";
  await assert.rejects(() => f.service.execute(edited), /conflict/);
  edited.claims[1].origin = "source_inference";
  edited.claims[1].uncertainty = "Owner interpretation of the route.";
  const result = await f.service.execute(edited),
    detail = await f.service.pack(result.versionId);
  assert.equal(detail.body.claims[1].origin, "source_inference");
  assert.equal(detail.evidence[1].excerpt, "location: Harbor");
  assert.equal(
    (await f.service.pack(pack.versionId)).body.claims[1].text,
    "location: Harbor",
  );
});

test("future and private evidence cannot be promoted by owner pack editing", async () => {
  const f = authoringFixture(),
    { pack } = await createDraft(f, [
      sourceInput({ knowledge: "future_source" }),
    ]);
  const badScope = packSave(pack);
  badScope.claims[0] = {
    ...badScope.claims[0],
    knowledge: "canon_at_entry",
    validFrom: 0,
  };
  await assert.rejects(() => f.service.execute(badScope), /scope/);
  const badVisibility = packSave(pack);
  badVisibility.claims[0].visibility = "public";
  await assert.rejects(() => f.service.execute(badVisibility));
});

test("explicit reviewed entry claims can become canon, while the rest retain source scope", async () => {
  const f = authoringFixture(),
    { pack } = await createDraft(f, [sourceInput({ visibility: "public" })]);
  const edit = packSave(pack);
  edit.claims[1] = {
    ...edit.claims[1],
    knowledge: "canon_at_entry",
    validFrom: 10,
    epistemic: "fact",
    uncertainty: null,
  };
  const next = await f.service.execute(edit),
    draft = await f.service.pack(next.versionId);
  const approved = await f.service.execute(
    approveInput(draft, { canonClaimIds: [draft.body.claims[1].id] }),
  );
  const result = await f.service.pack(approved.versionId);
  assert.equal(result.body.claims[1].authority, "approved_canon");
  assert.ok(
    result.body.claims
      .filter((_, i) => i !== 1)
      .every((c) => c.authority === "reference" && c.knowledge === "source"),
  );
});

test("campaign binding pins only approved immutable packs and preserves mappings across explicit repins", async () => {
  const f = authoringFixture(),
    { pack, sources } = await createDraft(f),
    campaignId = id();
  const input = {
    ownerId: owner,
    campaignId,
    operationId: id(),
    packVersionId: pack.versionId,
    existingBinding: null,
    entry: { label: "Synthetic entry", worldMinutes: 0, evidence: [] },
  };
  await assert.rejects(
    () => prepareOwnerPackBinding(f.store, input),
    /conflict/,
  );
  const approved = await f.service.execute(approveInput(pack));
  const binding = await prepareOwnerPackBinding(f.store, {
    ...input,
    packVersionId: approved.versionId,
  });
  assert.deepEqual(
    await prepareOwnerPackBinding(f.store, {
      ...input,
      packVersionId: approved.versionId,
    }),
    binding,
  );
  const separate = await prepareOwnerPackBinding(f.store, {
    ...input,
    campaignId: id(),
    packVersionId: approved.versionId,
  });
  assert.notDeepEqual(separate.mappings, binding.mappings);
  await f.service.execute(
    sourceInput({
      sourceId: sources[0].id,
      expectedVersionId: sources[0].versionId,
      text: "Corrected world.",
    }),
  );
  assert.equal(binding.packVersionId, approved.versionId);
  assert.deepEqual(binding.sourceVersionIds, [sources[0].versionId]);
  const repin = await prepareOwnerPackBinding(f.store, {
    ...input,
    operationId: id(),
    packVersionId: approved.versionId,
    existingBinding: binding,
  });
  assert.deepEqual(repin.mappings, binding.mappings);
  assert.equal(repin.id, binding.id);
});

test("browser mutation attempts retain the same operation identity only for unchanged payloads", () => {
  const input = sourceInput();
  delete input.operationId;
  const first = ownerLibraryAttempt(null, input, id);
  assert.deepEqual(
    ownerLibraryAttempt(first, input, () => {
      throw Error("must reuse");
    }),
    first,
  );
  assert.notEqual(
    ownerLibraryAttempt(first, { ...input, title: "Changed" }, id).operationId,
    first.operationId,
  );
});

test("new compiler evidence rejects forged slices at the persistence boundary and stays outside character retrieval", async () => {
  const f = authoringFixture(),
    { pack } = await createDraft(f);
  const original = f.records.get(pack.versionId);
  const forged = structuredClone(original);
  forged.id = id();
  forged.versionId = id();
  forged.body.compilerJobVersionId = null;
  forged.body.claims[0].evidence[0].digest = "0".repeat(64);
  await assert.rejects(
    () => f.store.put({ operationId: id(), record: forged }),
    /conflict/,
  );
  const approved = await f.service.execute(approveInput(pack));
  const binding = await prepareOwnerPackBinding(f.store, {
    ownerId: owner,
    campaignId: id(),
    operationId: id(),
    packVersionId: approved.versionId,
    existingBinding: null,
    entry: { label: "Entry", worldMinutes: 0, evidence: [] },
  });
  assert.deepEqual(
    projectCharacterKnowledge(
      f.records.get(approved.versionId),
      binding,
      binding.mappings[0].entityId,
      0,
    ),
    [],
  );
});
