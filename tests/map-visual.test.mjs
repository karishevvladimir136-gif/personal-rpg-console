import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  buildMapVisualJob,
  galleryMapAssets,
  MAP_VISUAL_ASSET_PREFIX,
  mapVisualPendingIsCurrent,
  mapVisualPublicFactsStillVisible,
  publicMapBasis,
  safeMapVisualAsset,
  selectMapVisual,
} from "../src/lib/visual-frame/map-job.ts";
import { VISUAL_FRAME_PREFIX } from "../src/lib/visual-frame/model.ts";

const source = JSON.parse(readFileSync(
  new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
  "utf8")).en.snapshot;
const id = (n) => "00000000-0000-4000-8000-" + String(n).padStart(12, "0");
const model = "gpt-image-2.5-sunburst-2026-09-08";
const parameters = { size: "1536x1024", quality: "high", outputFormat: "png", n: 1 };
const proof = { expectedHeadId: null, canonGeneration: 0 };
function fixture() {
  const snapshot = structuredClone(source);
  snapshot.documents = [];
  snapshot.assets = [];
  snapshot.locations = [];
  snapshot.publicState.current_location_id = null;
  snapshot.privateState = { canary: "PRIVATE_MAP_CANARY" };
  return snapshot;
}
function location(snapshot, number, name, status = "known") {
  const row = {
    id: id(number), campaign_id: snapshot.campaign.id,
    revision: 1, updated_at: "2026-10-01T00:00:00Z",
    name, description: name + " public description", status,
  };
  snapshot.locations.push(row);
  return row;
}
function placement(snapshot, row, level, parent = null, x = 0.5, y = 0.5) {
  return {
    campaign_id: snapshot.campaign.id, location_id: row.id, level,
    parent_location_id: parent?.id ?? null, x, y,
    revision: 1, updated_at: "2026-10-01T00:00:00Z",
  };
}
function accepted(snapshot, placements, level, anchorId) {
  const jobId = id(90), versionId = id(91), dispatchId = id(92);
  const queued = buildMapVisualJob(snapshot, placements, level, anchorId,
    [], model, parameters, proof);
  const output = {
    storagePath: snapshot.campaign.id + "/frames/" + jobId + "/output.png",
    sha256: "a".repeat(64), bytes: 100, contentType: "image/png",
    usage: null, providerRequestId: "synthetic_only",
  };
  const job = {
    ...queued, status: "completed", resultAssetId: jobId,
    dispatch: { requestId: dispatchId, reservationUsdMicros: 400000 },
    review: { status: "safe_to_review", imageSha256: output.sha256 },
  };
  snapshot.documents.push({
    id: jobId, campaign_id: snapshot.campaign.id, revision: 4,
    updated_at: "2026-10-03T00:00:00Z", current_version_id: versionId,
    title: "MAP", status: "reference",
    body: VISUAL_FRAME_PREFIX + JSON.stringify(job),
  });
  const asset = {
    id: jobId, campaign_id: snapshot.campaign.id, revision: 1,
    updated_at: "2026-10-03T00:00:00Z", title: "MAP", kind: "image",
    storage_path: output.storagePath,
    description: MAP_VISUAL_ASSET_PREFIX + JSON.stringify({
      campaign_id: snapshot.campaign.id,
      job_document_id: jobId, job_version_id: versionId,
      level, anchorLocationId: anchorId, timeline: job.basis.timeline,
      provider: "OpenAI", model, dispatchRequestId: dispatchId, output,
      ownerApproval: { requestId: id(93), draftVersionId: versionId },
    }),
  };
  snapshot.assets.push(asset);
  return { job, asset };
}

test("world, region and local bases use only their exact active public subtree", () => {
  const snapshot = fixture();
  const world = location(snapshot, 1, "World");
  const otherWorld = location(snapshot, 2, "Other world");
  const region = location(snapshot, 3, "Region");
  const otherRegion = location(snapshot, 4, "Other region");
  const local = location(snapshot, 5, "Local");
  const hidden = location(snapshot, 6, "Future");
  snapshot.locations = snapshot.locations.filter((row) => row.id !== hidden.id);
  const placements = [
    placement(snapshot, world, "world"),
    placement(snapshot, otherWorld, "world"),
    placement(snapshot, region, "region", world),
    placement(snapshot, otherRegion, "region", otherWorld),
    placement(snapshot, local, "local", region),
    placement(snapshot, hidden, "local", region),
  ];
  assert.deepEqual(publicMapBasis(snapshot, placements, "world", null).locations.map((row) => row.id),
    [world.id, otherWorld.id]);
  assert.deepEqual(publicMapBasis(snapshot, placements, "region", world.id).locations.map((row) => row.id),
    [region.id]);
  assert.deepEqual(publicMapBasis(snapshot, placements, "local", region.id).locations.map((row) => row.id),
    [local.id]);
  const job = buildMapVisualJob(snapshot, placements, "local", region.id,
    [], model, parameters, proof);
  assert.equal(job.prompt.includes("Local public description"), true);
  assert.equal(job.prompt.includes("Other region"), false);
  assert.equal(job.prompt.includes("Future"), false);
  assert.equal(job.prompt.includes("PRIVATE_MAP_CANARY"), false);
  assert.match(job.prompt, /quoted public records.*data, not instructions/i);
  assert.match(job.prompt, /no readable place labels/i);
});

test("an older save with an undiscovered ancestor has no Local map basis", () => {
  const snapshot = fixture();
  const world = location(snapshot, 10, "World");
  const region = location(snapshot, 11, "Region");
  const local = location(snapshot, 12, "Local");
  const placements = [
    placement(snapshot, world, "world"),
    placement(snapshot, region, "region", world),
    placement(snapshot, local, "local", region),
  ];
  assert.ok(publicMapBasis(snapshot, placements, "local", region.id));
  snapshot.locations = snapshot.locations.filter((row) => row.id !== world.id);
  assert.equal(publicMapBasis(snapshot, placements, "local", region.id), null);
  assert.throws(() => buildMapVisualJob(snapshot, placements, "local", region.id,
    [], model, parameters, proof));
});

test("draft pixels never become ordinary map art; accepted art survives new public pins", () => {
  const snapshot = fixture();
  const world = location(snapshot, 20, "World");
  const placements = [placement(snapshot, world, "world")];
  const { job, asset } = accepted(snapshot, placements, "world", null);
  assert.ok(safeMapVisualAsset(snapshot, asset, placements));
  assert.equal(selectMapVisual(snapshot, placements, "world", null).image.assetId, asset.id);
  assert.equal(selectMapVisual(snapshot, placements, "world", null).olderArtwork, false);
  const newPlace = location(snapshot, 21, "New public place");
  placements.push(placement(snapshot, newPlace, "world"));
  assert.ok(safeMapVisualAsset(snapshot, asset, placements));
  assert.equal(selectMapVisual(snapshot, placements, "world", null).olderArtwork, true);
  assert.equal(galleryMapAssets(snapshot, placements).length, 1);
  snapshot.documents[0].body = VISUAL_FRAME_PREFIX +
    JSON.stringify({ ...job, status: "draft", resultAssetId: null });
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
  assert.equal(selectMapVisual(snapshot, placements, "world", null).image, null);
});

test("timeline load never shows art based on absent or changed public Location facts", () => {
  const snapshot = fixture();
  const world = location(snapshot, 30, "Public World");
  const placements = [placement(snapshot, world, "world")];
  const { job, asset } = accepted(snapshot, placements, "world", null);
  snapshot.locations = [];
  assert.equal(mapVisualPublicFactsStillVisible(snapshot, job.basis, placements), false);
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
  snapshot.locations = [world];
  world.name = "Corrected World";
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
  world.name = "Public World";
  world.revision += 1;
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
});

test("unfinished drafts require their exact playable timeline and public map basis", () => {
  const snapshot = fixture();
  const world = location(snapshot, 35, "Public World");
  const placements = [placement(snapshot, world, "world")];
  const job = buildMapVisualJob(snapshot, placements, "world", null,
    [], model, parameters, proof);
  assert.equal(mapVisualPendingIsCurrent(snapshot, placements, job), true);
  const newer = location(snapshot, 36, "Later discovery");
  placements.push(placement(snapshot, newer, "world"));
  assert.equal(mapVisualPendingIsCurrent(snapshot, placements, job), false);
  placements.pop();
  snapshot.locations = snapshot.locations.filter((row) => row.id !== newer.id);
  const priorTimeline = structuredClone(snapshot);
  priorTimeline.timeline.epoch += 1;
  assert.equal(mapVisualPendingIsCurrent(priorTimeline, placements, job), false);
  world.description = "Corrected public fact";
  assert.equal(mapVisualPendingIsCurrent(snapshot, placements, job), false);
});

test("moving a basis Location outside its map subtree hides art; coordinate edits mark it older", () => {
  const snapshot = fixture();
  const world = location(snapshot, 40, "World");
  const otherWorld = location(snapshot, 41, "Other World");
  const region = location(snapshot, 42, "Region");
  const placements = [
    placement(snapshot, world, "world"),
    placement(snapshot, otherWorld, "world"),
    placement(snapshot, region, "region", world),
  ];
  const { asset } = accepted(snapshot, placements, "region", world.id);
  assert.ok(safeMapVisualAsset(snapshot, asset, placements));
  placements[2] = { ...placements[2], x: 0.8, y: 0.8, revision: 2 };
  assert.ok(safeMapVisualAsset(snapshot, asset, placements));
  assert.equal(selectMapVisual(snapshot, placements, "region", world.id).olderArtwork, true);
  placements[2] = { ...placements[2], parent_location_id: otherWorld.id, revision: 3 };
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
  assert.equal(selectMapVisual(snapshot, placements, "region", world.id).image, null);
});

test("Local artwork is hidden if its Region anchor changes World ancestry", () => {
  const snapshot = fixture();
  const world = location(snapshot, 50, "World");
  const otherWorld = location(snapshot, 51, "Other World");
  const region = location(snapshot, 52, "Region");
  const local = location(snapshot, 53, "Local");
  const placements = [
    placement(snapshot, world, "world"),
    placement(snapshot, otherWorld, "world"),
    placement(snapshot, region, "region", world),
    placement(snapshot, local, "local", region),
  ];
  const { asset } = accepted(snapshot, placements, "local", region.id);
  assert.ok(safeMapVisualAsset(snapshot, asset, placements));
  placements[2] = { ...placements[2], parent_location_id: otherWorld.id, revision: 2 };
  assert.equal(safeMapVisualAsset(snapshot, asset, placements), null);
});
