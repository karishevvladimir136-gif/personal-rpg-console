import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, parameters } from "./media-frame-fixture.mjs";
import {
  parseRealFrame,
  eligibleRealReferences,
  realFrameIsCurrent,
  realFrameAssetInfo,
  safeFrameAsset,
  REAL_FRAME_ASSET_PREFIX,
} from "../src/lib/visual-frame/real-frame.ts";
import {
  newVisualReference,
  serializeVisualMetadata,
  VISUAL_FRAME_PREFIX,
  isVisualFrameDocument,
  buildFrame,
  parseVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
import {
  imageOutputTokens,
  textOnlyReservationFloor,
  reportedUsageCost,
} from "../src/lib/server/media/pricing.ts";
function reference(f, kind, id, patch = {}) {
  const value = {
    ...newVisualReference(f.snapshot, { kind, id }),
    approval: "approved",
    appearance: "PUBLIC-APPEARANCE",
    outfit: "PUBLIC-OUTFIT",
    guidance: "PUBLIC-GUIDANCE",
    ...patch,
  };
  const record = {
    id: randomUUID(),
    campaign_id: f.snapshot.campaign.id,
    title: value.label,
    status: "reference",
    body: serializeVisualMetadata(value),
    current_version_id: randomUUID(),
    revision: 1,
    updated_at: "",
  };
  f.snapshot.documents.push(record);
  return record;
}
test("schema2 uses existing reserved family while schema1 MOCK/reference parsing stays unchanged", () => {
  const f = fixture(),
    real = f.prepare(),
    body = VISUAL_FRAME_PREFIX + JSON.stringify(real);
  assert.deepEqual(parseRealFrame({ body }), real);
  assert.equal(parseVisualMetadata({ body }), null);
  assert.equal(isVisualFrameDocument({ body }), true);
  const mock = buildFrame(
    f.snapshot,
    f.snapshot.publicState.current_scene_id,
    [],
    "wide",
  );
  assert.deepEqual(
    parseVisualMetadata({ body: serializeVisualMetadata(mock) }),
    mock,
  );
});
test("positive current-scene brief excludes private fields, transcript, other-campaign and future narration", () => {
  const f = fixture(),
    current = f.snapshot.scenes.find(
      (r) => r.id === f.snapshot.publicState.current_scene_id,
    );
  f.snapshot.dmPrivate = { plan: "PRIVATE-SENTINEL" };
  f.snapshot.publicState.summary = "UNSELECTED-SUMMARY";
  f.snapshot.entities.forEach((e) => (e.details = "UNSELECTED-ENTITY"));
  f.snapshot.scenes.push({
    ...current,
    id: randomUUID(),
    body: "FUTURE-SENTINEL",
    sequence: 999,
  });
  const frame = f.prepare();
  assert.equal(frame.basis.scene.body, current.body);
  assert.doesNotMatch(
    frame.prompt,
    /PRIVATE-SENTINEL|FUTURE-SENTINEL|UNSELECTED/,
  );
  assert.doesNotMatch(frame.prompt, /[0-9a-f]{8}-[0-9a-f]{4}/);
});
test("approved reference whitelist admits only current visited place, unique player, equipped player item and campaign style", () => {
  const f = fixture();
  const player = {
    id: randomUUID(),
    campaign_id: f.snapshot.campaign.id,
    revision: 1,
    kind: "player",
    name: "Public hero",
    details: "UNREAD-MECHANICS",
    hp: 10,
    max_hp: 10,
    stats: {},
    resources: {},
    conditions: [],
    equipment_slots: [],
    updated_at: "",
  };
  const place = {
    id: randomUUID(),
    campaign_id: f.snapshot.campaign.id,
    revision: 1,
    name: "Public place",
    description: "UNREAD-LOCATION",
    status: "visited",
    updated_at: "",
  };
  f.snapshot.entities.push(player);
  f.snapshot.locations.push(place);
  f.snapshot.publicState.current_location_id = place.id;
  if (place) place.status = "visited";
  const ids = [
    reference(f, "style", f.snapshot.campaign.id).id,
    reference(f, "entity", player.id).id,
  ];
  if (place) ids.push(reference(f, "location", place.id).id);
  const npc = { ...player, id: randomUUID(), kind: "npc", name: "UNSEEN-NPC" };
  f.snapshot.entities.push(npc);
  reference(f, "entity", npc.id);
  const otherPlace = {
    ...place,
    id: randomUUID(),
    name: "HIDDEN-ROOM",
    status: "known",
  };
  f.snapshot.locations.push(otherPlace);
  reference(f, "location", otherPlace.id);
  const item = f.snapshot.items[0];
  if (item) {
    item.equipped_entity_id = player.id;
    item.quantity = 1;
    ids.push(reference(f, "item", item.id).id);
  }
  assert.deepEqual(
    eligibleRealReferences(f.snapshot)
      .filter((e) => ids.includes(e.record.id))
      .map((e) => e.record.id),
    ids,
  );
  const frame = f.prepare(ids);
  assert.match(frame.prompt, /PUBLIC-APPEARANCE/);
  assert.doesNotMatch(frame.prompt, /UNSEEN-NPC|HIDDEN-ROOM/);
});
test("stale, unapproved, foreign and unsafe arbitrary image references fail closed rather than enter provider brief", () => {
  for (const patch of [
    { approval: "draft" },
    { approval: "invalidated" },
    { sourceRevision: 999 },
    { imageAssetId: randomUUID(), imageAssetRevision: 1 },
  ]) {
    const f = fixture(),
      record = reference(f, "style", f.snapshot.campaign.id, patch);
    assert.throws(() => f.prepare([record.id]));
  }
  const f = fixture(),
    record = reference(f, "style", f.snapshot.campaign.id);
  record.campaign_id = randomUUID();
  assert.throws(() => f.prepare([record.id]));
});
test("schema2 rejects malformed, unknown, contradictory terminal and pixel/path claims", () => {
  const f = fixture(),
    frame = f.prepare();
  for (const patch of [
    { schema: 1 },
    { provider: "fal" },
    { model: "unreviewed-fallback" },
    { extra: true },
    { status: "generating" },
    { status: "completed", resultAssetId: randomUUID() },
    { parameters: { ...parameters, n: 2 } },
    { dispatch: { requestId: randomUUID(), reservationUsdMicros: -1 } },
  ])
    assert.equal(
      parseRealFrame({
        body: VISUAL_FRAME_PREFIX + JSON.stringify({ ...frame, ...patch }),
      }),
      null,
    );
  assert.equal(
    realFrameAssetInfo({
      kind: "image",
      storage_path: "foreign/url",
      description: REAL_FRAME_ASSET_PREFIX + "{}",
    }),
    null,
  );
});
for (const change of [
  (f) => (f.proof.expectedHeadId = randomUUID()),
  (f) => f.proof.canonGeneration++,
  (f) => f.snapshot.publicState.revision++,
  (f) => f.snapshot.timeline.epoch++,
  (f) => (f.snapshot.publicState.current_scene_id = randomUUID()),
  (f) =>
    f.snapshot.scenes.find(
      (s) => s.id === f.snapshot.publicState.current_scene_id,
    ).revision++,
])
  test("head/source/timeline correction makes exact queued brief stale", () => {
    const f = fixture(),
      frame = f.prepare();
    change(f);
    assert.equal(realFrameIsCurrent(f.snapshot, frame, f.proof), false);
  });
test("foreign, missing, oversized and player-action current scenes do not fall back to later narration", () => {
  for (const mutate of [
    (f, s) => (s.role = "player"),
    (f, s) => (s.campaign_id = randomUUID()),
    (f, s) => (s.body = "x".repeat(6001)),
    (f) => (f.snapshot.publicState.current_scene_id = null),
  ]) {
    const f = fixture(),
      scene = f.snapshot.scenes.find(
        (s) => s.id === f.snapshot.publicState.current_scene_id,
      );
    mutate(f, scene);
    assert.throws(() => f.prepare());
  }
});
test("verified 2.5 output calculator + UTF8 bound include every direct input and never call unknown usage zero", () => {
  assert.equal(imageOutputTokens(parameters), 1372);
  assert.equal(imageOutputTokens({ ...parameters, size: "1024x1024" }), 1756);
  assert.equal(textOnlyReservationFloor("Я", parameters), 10 + 1372 * 30);
  assert.ok(
    textOnlyReservationFloor("x".repeat(60000), {
      ...parameters,
      size: "1024x1024",
    }) < 400000,
  );
  assert.throws(() => textOnlyReservationFloor("Я".repeat(30001), parameters));
  assert.equal(reportedUsageCost(null), null);
  assert.equal(
    reportedUsageCost({
      textInputTokens: 3,
      imageInputTokens: 2,
      outputTokens: 1,
    }),
    61,
  );
});
test("a completed safe FRAME asset can be offered only for a new explicitly approved reference draft", async () => {
  const f = fixture(),
    q = await f.queue();
  await f.run("media.dispatch", f.dispatch(q.record));
  await f.accept(q.record.id);
  const asset = f.snapshot.assets.at(-1);
  assert.ok(safeFrameAsset(f.snapshot, asset));
  const record = reference(f, "style", f.snapshot.campaign.id, {
    imageAssetId: asset.id,
    imageAssetRevision: asset.revision,
  });
  assert.ok(
    eligibleRealReferences(f.snapshot).some((e) => e.record.id === record.id),
  );
  asset.campaign_id = randomUUID();
  assert.equal(safeFrameAsset(f.snapshot, asset), null);
});
