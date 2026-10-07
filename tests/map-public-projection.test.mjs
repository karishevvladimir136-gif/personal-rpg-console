import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { fixture, id } from "./phase2-mechanics-fixtures.mjs";
import {
  buildMapVisualJob,
  MAP_VISUAL_ASSET_PREFIX,
} from "../src/lib/visual-frame/map-job.ts";
import { VISUAL_FRAME_PREFIX } from "../src/lib/visual-frame/model.ts";
import {
  projectPublicMapSnapshot,
  publicMapVersionsAllowed,
} from "../src/lib/map/public-projection.ts";

function mapFixture() {
  const snapshot = fixture().snapshot;
  snapshot.timeline = { timelineId: id("map-public-timeline"), epoch: 1 };
  snapshot.documents = [];
  snapshot.assets = [];
  snapshot.locations = [];
  const location = {
    id: id("future-atlas-region"), campaign_id: snapshot.campaign.id,
    revision: 1, updated_at: "2026-10-06T00:00:00Z",
    name: "Future Region", description: "Public only after discovery", status: "known",
  };
  snapshot.locations.push(location);
  const placements = [{
    campaign_id: snapshot.campaign.id, location_id: location.id,
    level: "world", parent_location_id: null, x: 0.5, y: 0.5,
    revision: 1, updated_at: "2026-10-06T00:00:00Z",
  }];
  const queued = buildMapVisualJob(snapshot, placements, "world", null, [],
    "gpt-image-2.5-sunburst-2026-09-08",
    { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 },
    { expectedHeadId: null, canonGeneration: 0 });
  const jobId = id("future-atlas-job"), versionId = id("future-atlas-version");
  const output = {
    storagePath: snapshot.campaign.id + "/frames/" + jobId + "/output.png",
    sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic-only",
  };
  const completed = {
    ...queued, status: "completed", resultAssetId: jobId,
    dispatch: { requestId: id("future-atlas-dispatch"), reservationUsdMicros: 400000 },
    review: { status: "safe_to_review", imageSha256: output.sha256 },
  };
  const document = {
    id: jobId, campaign_id: snapshot.campaign.id, revision: 4,
    updated_at: "2026-10-06T00:00:00Z", current_version_id: versionId,
    title: "MAP: world", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(completed),
  };
  const asset = {
    id: jobId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-06T00:00:00Z", title: "MAP: world", kind: "image",
    storage_path: output.storagePath,
    description: MAP_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id, job_document_id: jobId,
      job_version_id: versionId, level: "world", anchorLocationId: null,
      timeline: completed.basis.timeline, provider: "OpenAI", model: completed.model,
      dispatchRequestId: completed.dispatch.requestId, output,
      ownerApproval: { requestId: id("future-atlas-approval"), draftVersionId: versionId },
    }),
  };
  snapshot.documents.push(document);
  snapshot.assets.push(asset);
  snapshot.documents.push({ ...document, id: id("ordinary-document"), title: "Ordinary note",
    body: "An ordinary public note" });
  return { snapshot, placements, location, document, asset, queued, completed };
}

test("browser projection hides future map jobs and accepted images after loading an older save", () => {
  const f = mapFixture();
  const older = structuredClone(f.snapshot);
  older.locations = [];
  const projected = projectPublicMapSnapshot(older, f.placements);
  assert.equal(projected.documents.some((row) => row.id === f.document.id), false);
  assert.equal(projected.assets.some((row) => row.id === f.asset.id), false);
  assert.equal(projected.documents.some((row) => row.title === "Ordinary note"), true);
  assert.equal(older.documents.some((row) => row.id === f.document.id), true,
    "the server's raw recovery snapshot is untouched");
  assert.equal(older.assets.some((row) => row.id === f.asset.id), true);
});

test("accepted map remains public while its original facts remain visible", () => {
  const f = mapFixture();
  const projected = projectPublicMapSnapshot(f.snapshot, f.placements);
  assert.equal(projected.documents.some((row) => row.id === f.document.id), true);
  assert.equal(projected.assets.some((row) => row.id === f.asset.id), true);
  assert.notEqual(projected, f.snapshot);
});

test("unaccepted draft requires the exact active timeline and public basis", () => {
  const f = mapFixture();
  const draft = {
    ...f.completed, status: "draft", resultAssetId: null,
  };
  f.document.body = VISUAL_FRAME_PREFIX + JSON.stringify(draft);
  assert.equal(projectPublicMapSnapshot(f.snapshot, f.placements).documents
    .some((row) => row.id === f.document.id), true);
  const older = structuredClone(f.snapshot);
  older.timeline.epoch += 1;
  assert.equal(projectPublicMapSnapshot(older, f.placements).documents
    .some((row) => row.id === f.document.id), false);
  assert.equal(projectPublicMapSnapshot(f.snapshot, []).documents
    .some((row) => row.id === f.document.id), false,
  "layout failure must fail closed for map metadata");
});

test("map document versions are hidden at the same save boundary", () => {
  const f = mapFixture();
  const versions = [{
    id: f.document.current_version_id, campaign_id: f.snapshot.campaign.id,
    document_id: f.document.id, version: 4, title: f.document.title,
    status: "reference", body: f.document.body, restored_from: null,
    created_at: "2026-10-06T00:00:00Z",
  }];
  assert.equal(publicMapVersionsAllowed(f.snapshot, f.placements, versions), true);
  const older = structuredClone(f.snapshot);
  older.locations = [];
  assert.equal(publicMapVersionsAllowed(older, f.placements, versions), false);
  assert.equal(publicMapVersionsAllowed(f.snapshot, [], versions), false);
});

test("accepted map history survives an ordinary gameplay revision when its places stay public", () => {
  const f = mapFixture();
  const versions = [f.queued, {
    ...f.completed, status: "draft", resultAssetId: null,
  }, f.completed].map((job, index) => ({
    id: id(`map-history-${index}`), campaign_id: f.snapshot.campaign.id,
    document_id: f.document.id, version: index + 1, title: f.document.title,
    status: "reference", body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
    restored_from: null, created_at: "2026-10-06T00:00:00Z",
  }));
  f.snapshot.publicState.revision += 1;
  assert.equal(publicMapVersionsAllowed(f.snapshot, f.placements, versions), true);
  const older = structuredClone(f.snapshot);
  older.locations = [];
  assert.equal(publicMapVersionsAllowed(older, f.placements, versions), false);
});

test("both campaign browser entry points and document history use the public projection", () => {
  const source = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
  assert.match(source("../src/app/api/campaigns/[campaignId]/route.ts"),
    /readPublicCampaign\(/);
  assert.match(source("../src/app/campaigns/[campaignId]/layout.tsx"),
    /readPublicCampaign\(/);
  assert.match(source("../src/app/api/campaigns/[campaignId]/documents/[documentId]/versions/route.ts"),
    /readPublicDocumentVersions\(/);
});
