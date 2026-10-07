import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  MOCK_ASSET_PREFIX,
  newVisualReference,
  serializeVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
import { selectSubjectVisual } from "../src/lib/visual-frame/subject-visual.ts";
import {
  buildSubjectVisualJob,
  SUBJECT_VISUAL_ASSET_PREFIX,
} from "../src/lib/visual-frame/subject-job.ts";
import { VISUAL_FRAME_PREFIX } from "../src/lib/visual-frame/model.ts";

const source = JSON.parse(
  readFileSync(
    new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
    "utf8",
  ),
).en.snapshot;
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const fixture = () => {
  const snapshot = structuredClone(source);
  snapshot.documents = [];
  return snapshot;
};
function addReference(snapshot, subject, options = {}) {
  const value = {
    ...newVisualReference(snapshot, subject),
    approval: options.approval ?? "approved",
    imageAssetId: options.assetId ?? null,
    imageAssetRevision: options.assetId ? 1 : null,
  };
  const record = {
    id: id(options.id ?? 50),
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: options.updatedAt ?? "2026-10-01T00:00:00Z",
    current_version_id: id(90),
    title: "Visual reference",
    status: "reference",
    body: serializeVisualMetadata(value),
  };
  snapshot.documents.push(record);
  return { record, value };
}
function addMock(snapshot, idNumber, art = "portrait") {
  const asset = {
    id: id(idNumber),
    campaign_id: snapshot.campaign.id,
    revision: 1,
    updated_at: "2026-10-01T00:00:00Z",
    title: "Synthetic art",
    kind: "image",
    storage_path: null,
    description:
      MOCK_ASSET_PREFIX +
      JSON.stringify({ provider: "MOCK", model: "local-placeholder-v0", art }),
  };
  snapshot.assets.push(asset);
  return asset;
}

test("subject visuals show only the public subject and an honest placeholder without art", () => {
  const snapshot = fixture();
  const player = snapshot.entities[0];
  snapshot.privateState = { secret: "PRIVATE_VISUAL_CANARY" };
  const selected = selectSubjectVisual(snapshot, {
    kind: "entity",
    id: player.id,
  });
  assert.deepEqual(selected, {
    label: player.name,
    placeholderArt: "portrait",
    approval: null,
    referenceDocumentId: null,
    image: null,
  });
  assert.equal(JSON.stringify(selected).includes("PRIVATE_VISUAL_CANARY"), false);
  assert.equal(
    selectSubjectVisual(snapshot, { kind: "entity", id: id(999) }),
    null,
  );
});

test("approved current art wins over a newer draft while draft alone stays marked draft", () => {
  const snapshot = fixture();
  const subject = { kind: "entity", id: snapshot.entities[0].id };
  const approvedAsset = addMock(snapshot, 61);
  const draftAsset = addMock(snapshot, 62);
  addReference(snapshot, subject, {
    id: 51,
    assetId: approvedAsset.id,
    updatedAt: "2026-10-01T00:00:00Z",
  });
  addReference(snapshot, subject, {
    id: 52,
    assetId: draftAsset.id,
    approval: "draft",
    updatedAt: "2026-10-02T00:00:00Z",
  });
  assert.deepEqual(selectSubjectVisual(snapshot, subject).image, {
    kind: "mock",
    assetId: approvedAsset.id,
    art: "portrait",
  });
  assert.equal(selectSubjectVisual(snapshot, subject).approval, "approved");
  snapshot.documents = snapshot.documents.filter((row) => row.id !== id(51));
  const draftOnly = selectSubjectVisual(snapshot, subject);
  assert.equal(draftOnly.approval, "draft");
  assert.equal(draftOnly.image.assetId, draftAsset.id);
});

test("stale and cross-campaign visual links cannot become current subject art", () => {
  const snapshot = fixture();
  const subject = { kind: "location", id: snapshot.locations[0].id };
  const linked = addMock(snapshot, 63, "landscape");
  const { record } = addReference(snapshot, subject, {
    id: 53,
    assetId: linked.id,
  });
  assert.equal(selectSubjectVisual(snapshot, subject).image.assetId, linked.id);
  linked.campaign_id = id(999);
  assert.equal(selectSubjectVisual(snapshot, subject).image, null);
  linked.campaign_id = snapshot.campaign.id;
  snapshot.locations[0].revision += 1;
  assert.equal(selectSubjectVisual(snapshot, subject).approval, null);
  snapshot.locations[0].revision -= 1;
  record.campaign_id = id(999);
  assert.equal(selectSubjectVisual(snapshot, subject).approval, null);
});

test("item and location map to object and landscape placeholders", () => {
  const snapshot = fixture();
  const item = {
    id: id(70),
    campaign_id: snapshot.campaign.id,
    revision: 1,
    name: "Synthetic flask",
  };
  snapshot.items.push(item);
  assert.equal(
    selectSubjectVisual(snapshot, { kind: "item", id: item.id }).placeholderArt,
    "object",
  );
  assert.equal(
    selectSubjectVisual(snapshot, {
      kind: "location",
      id: snapshot.locations[0].id,
    }).placeholderArt,
    "landscape",
  );
});

test("accepted standalone image displays before separate visual reference approval", () => {
  const snapshot = fixture();
  const subject = { kind: "entity", id: snapshot.entities[0].id };
  const jobId = id(80), versionId = id(81), requestId = id(82);
  const queued = buildSubjectVisualJob(snapshot, subject, [],
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
    title: "VISUAL", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
  });
  const output = {
    storagePath: `${snapshot.campaign.id}/frames/${jobId}/output.png`,
    sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic_only",
  };
  snapshot.assets.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-03T00:00:00Z", title: "VISUAL", kind: "image",
    storage_path: output.storagePath,
    description: SUBJECT_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id, job_document_id: jobId,
      job_version_id: versionId, subject: job.basis.subject,
      timeline: job.basis.timeline, provider: "OpenAI", model: job.model,
      dispatchRequestId: requestId, output,
      ownerApproval: { requestId: id(83), draftVersionId: versionId },
    }),
  });
  const selected = selectSubjectVisual(snapshot, subject);
  assert.equal(selected.approval, null);
  assert.equal(selected.image?.kind, "real");
  assert.equal(selected.image?.assetId, jobId);
  snapshot.entities[0].revision += 1;
  assert.equal(selectSubjectVisual(snapshot, subject).image, null);
});
