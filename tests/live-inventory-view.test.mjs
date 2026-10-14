import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import {
  acceptedItemArtwork,
  buildLiveInventoryView,
  EQUIPPED_FILTER,
  inventoryCategoryLabel,
} from "../src/lib/live-inventory-view.ts";
import {
  MOCK_ASSET_PREFIX,
  newVisualReference,
  serializeVisualMetadata,
  VISUAL_FRAME_PREFIX,
} from "../src/lib/visual-frame/model.ts";
import {
  buildSubjectVisualJob,
  SUBJECT_VISUAL_ASSET_PREFIX,
} from "../src/lib/visual-frame/subject-job.ts";

test("live Inventory derives Phase-0 storage tabs and filters only current public records", () => {
  const snapshot = fixture().snapshot;
  const selected = buildLiveInventoryView(snapshot, "missing", "", "");
  assert.equal(selected.storage.kind, "player");
  assert.deepEqual(selected.tabs.map((tab) => tab.kind), [
    "player", "companion", "camp", "transport",
  ]);
  assert.equal(selected.items.length, snapshot.items.length);
  assert.equal(selected.entity.id, snapshot.entities[0].id);

  snapshot.items.push({
    ...snapshot.items[0],
    id: id("foreign-inventory-item"),
    campaign_id: id("another-campaign"),
    name: "Hidden foreign item",
  });
  const all = buildLiveInventoryView(snapshot, selected.storage.id, "", "");
  assert.equal(all.items.some((item) => item.name === "Hidden foreign item"), false);
  assert.equal(buildLiveInventoryView(snapshot, selected.storage.id, "weapon", "").items.length, 1);
  assert.equal(buildLiveInventoryView(snapshot, selected.storage.id, "", EQUIPPED_FILTER).items.length, 1);
  assert.equal(buildLiveInventoryView(snapshot, selected.storage.id, "", "consumable").items.length, 9);
  assert.equal(buildLiveInventoryView(snapshot, selected.storage.id, "absent", "").items.length, 0);
  assert.equal(buildLiveInventoryView(snapshot, id("camp"), "", "").storage.kind, "camp");
  assert.equal(inventoryCategoryLabel("weapon"), "Weapons");
  assert.equal(inventoryCategoryLabel("consumable"), "Consumables");
  assert.equal(inventoryCategoryLabel("arcane relic"), "Arcane relic");
});

test("inventory cards use accepted real item art and keep icon fallback for draft or mock art", () => {
  const snapshot = structuredClone(JSON.parse(readFileSync(
    new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
    "utf8",
  )).en.snapshot);
  const item = {
    id: id("art-item"), campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-01T00:00:00Z", name: "Test flask",
    category: "consumable", quantity: 1, description: "A flask.", mechanics: "",
    owner_entity_id: null, storage_id: snapshot.storages[0].id,
    equipped_entity_id: null, equipped_slot: null,
  };
  snapshot.items.push(item);
  assert.equal(acceptedItemArtwork(snapshot, item), null);

  const mockId = id("mock-item-art");
  snapshot.assets.push({
    id: mockId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-01T00:00:00Z", title: "Mock art",
    kind: "image", storage_path: null,
    description: MOCK_ASSET_PREFIX + JSON.stringify({
      provider: "MOCK", model: "local-placeholder-v0", art: "object",
    }),
  });
  const reference = {
    ...newVisualReference(snapshot, { kind: "item", id: item.id }),
    approval: "draft", imageAssetId: mockId, imageAssetRevision: 1,
  };
  snapshot.documents.push({
    id: id("draft-item-reference"), campaign_id: snapshot.campaign.id,
    revision: 1, updated_at: "2026-10-02T00:00:00Z",
    current_version_id: id("draft-item-version"), title: "Draft reference",
    status: "reference", body: serializeVisualMetadata(reference),
  });
  assert.equal(acceptedItemArtwork(snapshot, item), null);

  const jobId = id("accepted-item-job");
  const versionId = id("accepted-item-version");
  const requestId = id("accepted-item-request");
  const queued = buildSubjectVisualJob(snapshot, { kind: "item", id: item.id }, [],
    "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 });
  const job = {
    ...queued, status: "completed", resultAssetId: jobId,
    dispatch: { requestId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review", imageSha256: "a".repeat(64) },
  };
  snapshot.documents.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 4,
    current_version_id: versionId, updated_at: "2026-10-03T00:00:00Z",
    title: "Item image", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
  });
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${jobId}/output.png`,
    sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic_only",
  };
  snapshot.assets.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-03T00:00:00Z", title: "Item image",
    kind: "image", storage_path: output.storagePath,
    description: SUBJECT_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id, job_document_id: jobId,
      job_version_id: versionId, subject: job.basis.subject,
      timeline: job.basis.timeline, provider: "OpenAI", model: job.model,
      dispatchRequestId: requestId, output,
      ownerApproval: { requestId: id("accepted-item-approval"), draftVersionId: versionId },
    }),
  });
  assert.match(acceptedItemArtwork(snapshot, item), /\/api\/visual-frame\?/);
  const otherItem = { ...item, id: id("other-item"), name: "Waterskin" };
  snapshot.items.push(otherItem);
  const borrowedReference = {
    ...newVisualReference(snapshot, { kind: "item", id: otherItem.id }),
    approval: "approved", imageAssetId: jobId, imageAssetRevision: 1,
  };
  snapshot.documents.push({
    id: id("borrowed-reference"), campaign_id: snapshot.campaign.id,
    revision: 1, updated_at: "2026-10-04T00:00:00Z",
    current_version_id: id("borrowed-version"), title: "Wrong item reference",
    status: "reference", body: serializeVisualMetadata(borrowedReference),
  });
  assert.equal(acceptedItemArtwork(snapshot, otherItem), null,
    "an approved reference cannot reuse another item's generated image");
  item.revision += 1;
  assert.equal(acceptedItemArtwork(snapshot, item), null);
});
