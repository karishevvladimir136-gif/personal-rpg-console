import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import {
  prepareCurrentSceneFrame,
  finishCurrentSceneFrame,
} from "../src/lib/visual-frame/current-scene.ts";
import { writeVisualFrame } from "../src/lib/visual-frame/authority.ts";
import { parseVisualMetadata } from "../src/lib/visual-frame/model.ts";

const source = JSON.parse(
  readFileSync(
    new URL("../src/lib/v1-completion/preview-fixtures.json", import.meta.url),
    "utf8",
  ),
).en.snapshot;
function fixture() {
  const snapshot = structuredClone(source),
    receipts = new Map(),
    writes = [];
  const authority = {
    authorize: async (cid) => assert.equal(cid, snapshot.campaign.id),
    receipt: async (input) => {
      const receipt = receipts.get(input.requestId);
      if (!receipt) return null;
      assert.deepEqual(input, receipt.input);
      return receipt.result;
    },
    snapshot: async () => snapshot,
    apply: async (input) => {
      const rows =
        input.operation === "document.save"
          ? snapshot.documents
          : snapshot.assets;
      const old = rows.find((r) => r.id === input.payload.id);
      assert.equal(old?.revision ?? 0, input.expectedRevision);
      const id = input.payload.id ?? randomUUID(),
        revision = input.expectedRevision + 1;
      const row = {
        ...input.payload,
        id,
        campaign_id: snapshot.campaign.id,
        revision,
        updated_at: "2026-09-27T00:00:00Z",
        ...(input.operation === "document.save"
          ? { current_version_id: randomUUID() }
          : {}),
      };
      if (old) rows.splice(rows.indexOf(old), 1, row);
      else rows.push(row);
      const result = {
        id,
        revision,
        campaign_id: snapshot.campaign.id,
        timeline: snapshot.timeline,
      };
      receipts.set(input.requestId, { input: structuredClone(input), result });
      writes.push(structuredClone(input));
      return result;
    },
  };
  const transport = {
    load: async () => snapshot,
    save: (input) => writeVisualFrame(input, authority),
  };
  const frames = () =>
    snapshot.documents
      .map(parseVisualMetadata)
      .filter((v) => v?.kind === "frame");
  return { snapshot, receipts, writes, transport, frames };
}

test("Game FRAME binds exact current public scene, not latest narration; adds no implicit references", () => {
  const f = fixture();
  const current = f.snapshot.scenes.find(
    (s) => s.id === f.snapshot.publicState.current_scene_id,
  );
  f.snapshot.scenes.push({
    ...current,
    id: randomUUID(),
    revision: 1,
    sequence: 900,
    body: "Different later scene",
  });
  const action = prepareCurrentSceneFrame(f.snapshot);
  assert.equal(action.frame.basis.scene.id, current.id);
  assert.equal(action.frame.basis.scene.body, current.body);
  assert.deepEqual(action.frame.basis.references, []);
  assert.equal(f.writes.length, 0);
});
test("missing, non-narration, foreign and oversized current scene fail closed without latest-scene fallback", () => {
  for (const change of [
    (s) => (s.publicState.current_scene_id = null),
    (s) => (s.publicState.current_scene_id = randomUUID()),
    (s) =>
      (s.scenes.find((x) => x.id === s.publicState.current_scene_id).role =
        "player"),
    (s) =>
      (s.scenes.find(
        (x) => x.id === s.publicState.current_scene_id,
      ).campaign_id = randomUUID()),
    (s) =>
      (s.scenes.find((x) => x.id === s.publicState.current_scene_id).body =
        "x".repeat(6001)),
  ]) {
    const f = fixture();
    change(f.snapshot);
    assert.throws(() => prepareCurrentSceneFrame(f.snapshot));
    assert.equal(f.writes.length, 0);
  }
});
test("Game current-scene MOCK uses production validation and existing three receipts without touching story state", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("UNEXPECTED_NETWORK");
  });
  const f = fixture(),
    before = structuredClone(f.snapshot);
  const action = prepareCurrentSceneFrame(f.snapshot);
  await finishCurrentSceneFrame(action, f.transport);
  assert.equal(f.frames().length, 1);
  assert.equal(f.frames()[0].status, "completed");
  assert.equal(f.snapshot.assets.length, before.assets.length + 1);
  assert.deepEqual(
    f.writes.map((r) => r.operation),
    ["document.save", "asset.save", "document.save"],
  );
  for (const key of [
    "publicState",
    "entities",
    "locations",
    "items",
    "storages",
    "scenes",
    "timeline",
  ])
    assert.deepEqual(f.snapshot[key], before[key]);
});
for (const phase of [0, 1, 2])
  test(`lost response at MOCK phase ${phase + 1} retries exact receipt without duplicate result`, async () => {
    const f = fixture(),
      action = prepareCurrentSceneFrame(f.snapshot);
    let count = 0,
      lost = false;
    const transport = {
      ...f.transport,
      save: async (input) => {
        const result = await f.transport.save(input);
        if (!lost && count++ === phase) {
          lost = true;
          throw Error("LOST_RESPONSE");
        }
        return result;
      },
    };
    await assert.rejects(
      finishCurrentSceneFrame(action, transport),
      /LOST_RESPONSE/,
    );
    await finishCurrentSceneFrame(action, transport);
    assert.equal(f.writes.length, 3);
    assert.equal(f.frames().length, 1);
    assert.equal(f.frames()[0].status, "completed");
    assert.equal(f.snapshot.assets.length, source.assets.length + 1);
  });
test("reload resumes an existing exact queued FRAME without another queue", async () => {
  const f = fixture(),
    original = prepareCurrentSceneFrame(f.snapshot);
  await f.transport.save(original.queue);
  const resumed = prepareCurrentSceneFrame(f.snapshot);
  assert.equal(resumed.queue, null);
  await finishCurrentSceneFrame(resumed, f.transport);
  assert.equal(f.writes.length, 3);
  assert.equal(f.frames().length, 1);
});
test("scene revision or timeline change after queue safely blocks MOCK result continuation", async () => {
  for (const change of [
    (s) =>
      s.scenes.find((r) => r.id === s.publicState.current_scene_id).revision++,
    (s) => s.timeline.epoch++,
  ]) {
    const f = fixture(),
      action = prepareCurrentSceneFrame(f.snapshot);
    const transport = {
      ...f.transport,
      save: async (input) => {
        const result = await f.transport.save(input);
        if (input.operation === "document.save") change(f.snapshot);
        return result;
      },
    };
    await assert.rejects(finishCurrentSceneFrame(action, transport));
    assert.equal(f.frames()[0].status, "queued");
    assert.equal(f.snapshot.assets.length, source.assets.length);
  }
});
