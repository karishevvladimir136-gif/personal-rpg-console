import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  belongingMarker,
  belongingFields,
  encodeBelonging,
  parseBelonging,
  isBelongingDocument,
  eligibleLocations,
  belongingEntries,
  belongingSave,
  prepareBelongingMutation,
  belongingHistory,
  currentPlaceContext,
  emptyBelonging,
} from "../src/lib/places-belonging/model.ts";
import { writeBelonging } from "../src/lib/places-belonging/authority.ts";
import { belongingText } from "../src/lib/places-belonging/text.ts";
import { createMutationAttempt } from "../src/lib/persistence/client.ts";

const campaignId = "d65bff55-6a04-4aa3-85d1-b1b870899f1b";
const foreignId = "833271bd-1b28-46c2-9bf7-7658182391c9";
const locationId = "737d74dd-44d9-4710-b050-acd151beb0da";
const documentId = "2b9cdb92-8e62-416b-9216-99f517e1a4c3";
const timelineId = "e8908fb4-e0f1-443f-be0d-e29ccfcd2b10";
const sceneId = "488e6775-280a-4af8-8471-3c6f2e037086";
function fixture() {
  const location = {
    id: locationId,
    campaign_id: campaignId,
    revision: 2,
    updated_at: "2026-09-27T00:00:00Z",
    name: "Synthetic quay / Синтетическая пристань",
    description: "A public, familiar quay.",
    status: "visited",
  };
  const annotation = {
    kind: "places-belonging",
    schema: 1,
    campaignId,
    locationId,
    locationRevision: location.revision,
    label: "The familiar quay",
    role: "home",
    belonging: "A place to breathe.",
    returnNote: "The repaired lamp was noticed on return.",
    historyNote: "A remembered promise, written by the owner.",
  };
  const document = {
    id: documentId,
    campaign_id: campaignId,
    revision: 3,
    updated_at: location.updated_at,
    current_version_id: sceneId,
    title: annotation.label,
    status: "reference",
    body: encodeBelonging(annotation),
  };
  return {
    location,
    annotation,
    document,
    snapshot: {
      campaign: { id: campaignId, title: "Synthetic campaign" },
      timeline: { timelineId, epoch: 1 },
      locations: [location],
      documents: [document],
      entities: [],
      items: [],
      storages: [
        {
          id: sceneId,
          campaign_id: campaignId,
          name: "Existing shared stash",
          kind: "camp",
          entity_id: null,
        },
      ],
      scenes: [
        {
          id: sceneId,
          campaign_id: campaignId,
          title: "At the quay",
          body: "Public current scene.",
        },
      ],
      publicState: {
        campaign_id: campaignId,
        current_location_id: locationId,
        current_scene_id: sceneId,
        summary: "The current public situation.",
      },
      dmGuideDocumentId: "guide",
    },
  };
}
function attempt(f = fixture()) {
  return createMutationAttempt(
    null,
    belongingSave(
      f.snapshot,
      f.location,
      belongingFields(f.annotation),
      f.document,
    ),
  );
}
function dependencies(f) {
  const calls = [];
  const result = {
    id: documentId,
    revision: 4,
    campaign_id: campaignId,
    timeline: f.snapshot.timeline,
  };
  return {
    calls,
    result,
    deps: {
      authorize: async (id) => {
        calls.push(["authorize", id]);
      },
      receipt: async () => {
        calls.push(["receipt"]);
        return null;
      },
      snapshot: async () => {
        calls.push(["snapshot"]);
        return f.snapshot;
      },
      apply: async (value) => {
        calls.push(["apply", value]);
        return result;
      },
    },
  };
}

test("bounded annotation parser fails closed on malformed metadata, unknown keys, IDs, lengths and roles", () => {
  const { annotation } = fixture();
  assert.deepEqual(parseBelonging(encodeBelonging(annotation)), annotation);
  for (const body of [
    "ordinary notes",
    belongingMarker + "broken",
    belongingMarker + "null",
    belongingMarker + "[]",
    belongingMarker + JSON.stringify({ ...annotation, privateState: "SECRET" }),
    belongingMarker + JSON.stringify({ ...annotation, locationId: "missing" }),
    belongingMarker + JSON.stringify({ ...annotation, locationRevision: 0 }),
    belongingMarker + JSON.stringify({ ...annotation, role: "palace" }),
    belongingMarker +
      JSON.stringify({ ...annotation, returnNote: "x".repeat(2401) }),
  ])
    assert.equal(parseBelonging(body), null);
  assert.equal(
    isBelongingDocument({ body: belongingMarker + "broken" }),
    true,
    "reserved malformed bodies stay out of general Library",
  );
  assert.equal(isBelongingDocument({ body: "ordinary reference" }), false);
});

test("foreign, private, missing and stale location pins never become current belonging notes", () => {
  const f = fixture();
  f.snapshot.locations.push({
    ...f.location,
    id: foreignId,
    campaign_id: foreignId,
    name: "FOREIGN_LOCATION",
  });
  f.snapshot.locations.push({
    ...f.location,
    id: sceneId,
    status: "private",
    name: "PRIVATE_LOCATION",
  });
  f.snapshot.documents.push({
    ...f.document,
    id: foreignId,
    campaign_id: foreignId,
    body: encodeBelonging({
      ...f.annotation,
      campaignId: foreignId,
      belonging: "FOREIGN_NOTE",
    }),
  });
  f.snapshot.documents.push({
    ...f.document,
    id: sceneId,
    body: encodeBelonging({
      ...f.annotation,
      locationId: sceneId,
      belonging: "PRIVATE_NOTE",
    }),
  });
  assert.deepEqual(
    eligibleLocations(f.snapshot).map((l) => l.id),
    [locationId],
  );
  assert.equal(belongingEntries(f.snapshot).length, 1);
  f.location.revision++;
  const stale = belongingEntries(f.snapshot)[0];
  assert.equal(stale.annotation, null);
  assert.equal(stale.needsReview, true);
  f.snapshot.locations = [];
  assert.deepEqual(belongingEntries(f.snapshot), []);
});

test("only reference documents participate; malformed, Canon and DM guide records are excluded", () => {
  for (const patch of [
    { status: "canon" },
    { status: "archived" },
    { body: belongingMarker + "invalid" },
    {
      body: encodeBelonging({ ...fixture().annotation, campaignId: foreignId }),
    },
  ]) {
    const f = fixture();
    Object.assign(f.document, patch);
    assert.deepEqual(belongingEntries(f.snapshot), []);
  }
  const f = fixture();
  f.snapshot.dmGuideDocumentId = documentId;
  assert.deepEqual(belongingEntries(f.snapshot), []);
});

test("manual save is bounded reference-only document correction with no inventory, visits or Canon mutation", () => {
  const f = fixture(),
    before = structuredClone(f.snapshot);
  const fields = {
    ...emptyBelonging(f.location),
    role: "ship",
    label: "My return",
    returnNote: "Owner correction",
    locationId: foreignId,
    locationRevision: 500,
    kind: "other",
  };
  const save = belongingSave(f.snapshot, f.location, fields, f.document);
  assert.equal(save.operation, "document.save");
  assert.equal(save.correctionScope, "campaign");
  assert.equal(save.payload.status, "reference");
  assert.equal(save.expectedRevision, 3);
  const parsed = parseBelonging(save.payload.body);
  assert.equal(parsed.locationId, locationId);
  assert.equal(parsed.locationRevision, 2);
  assert.equal(parsed.kind, "places-belonging");
  assert.deepEqual(f.snapshot, before);
  const request = createMutationAttempt(null, save);
  assert.deepEqual(prepareBelongingMutation(request, f.snapshot), request);
  for (const changed of [
    { ...request, correctionScope: "timeline" },
    { ...request, payload: { ...request.payload, status: "canon" } },
    { ...request, timeline: { timelineId, epoch: 2 } },
  ])
    assert.throws(() => prepareBelongingMutation(changed, f.snapshot));
});

test("server preflight rejects foreign, private and stale selections and non-belonging target documents", () => {
  const f = fixture(),
    input = attempt(f);
  f.location.revision++;
  assert.throws(() => prepareBelongingMutation(input, f.snapshot), {
    code: "conflict",
  });
  f.location.revision--;
  f.location.campaign_id = foreignId;
  assert.throws(() => prepareBelongingMutation(input, f.snapshot), {
    code: "not_found",
  });
  f.location.campaign_id = campaignId;
  f.location.status = "private";
  assert.throws(() => prepareBelongingMutation(input, f.snapshot), {
    code: "not_found",
  });
  f.location.status = "visited";
  f.document.body = "ordinary reference";
  assert.throws(() => prepareBelongingMutation(input, f.snapshot), {
    code: "validation",
  });
});

test("immutable history projects named owner fields, excludes foreign/private versions and preserves saved versions", () => {
  const f = fixture();
  const old = Object.freeze({
    id: timelineId,
    campaign_id: campaignId,
    document_id: documentId,
    version: 1,
    title: "First notes",
    status: "reference",
    body: encodeBelonging({
      ...f.annotation,
      label: "First notes",
      locationRevision: 1,
    }),
    created_at: "2026-09-26T00:00:00Z",
    restored_from: null,
  });
  const before = structuredClone(old);
  const versions = [
    old,
    { ...old, id: foreignId, campaign_id: foreignId },
    { ...old, id: sceneId, status: "canon" },
    {
      ...old,
      id: sceneId,
      body: encodeBelonging({ ...f.annotation, locationId: foreignId }),
    },
  ];
  const history = belongingHistory(f.snapshot, documentId, versions);
  assert.equal(history.length, 1);
  assert.equal(history[0].annotation.label, "First notes");
  assert.equal(history[0].annotation.locationRevision, 1);
  history[0].annotation.label = "local change";
  assert.deepEqual(old, before);
  assert.equal(history[0].body, undefined);
});

test("public scene context requires exact campaign and current-location links; absent visits/relationships are not inferred", () => {
  const f = fixture();
  assert.equal(
    currentPlaceContext(f.snapshot, locationId).scene.title,
    "At the quay",
  );
  f.snapshot.publicState.current_location_id = foreignId;
  assert.equal(currentPlaceContext(f.snapshot, locationId), null);
  f.snapshot.publicState.current_location_id = locationId;
  f.snapshot.scenes[0].campaign_id = foreignId;
  assert.equal(currentPlaceContext(f.snapshot, locationId).scene, null);
  f.snapshot.publicState.campaign_id = foreignId;
  assert.equal(currentPlaceContext(f.snapshot, locationId), null);
});

test("write service authorizes before receipt and exact replay precedes stale location preflight", async () => {
  const f = fixture(),
    input = attempt(f),
    d = dependencies(f);
  const expected = await writeBelonging(input, d.deps);
  assert.deepEqual(expected, d.result);
  assert.deepEqual(
    d.calls.map((c) => c[0]),
    ["authorize", "receipt", "snapshot", "apply"],
  );
  f.snapshot.locations = [];
  d.calls.length = 0;
  d.deps.receipt = async () => {
    d.calls.push(["receipt"]);
    return d.result;
  };
  assert.deepEqual(await writeBelonging(input, d.deps), d.result);
  assert.deepEqual(
    d.calls.map((c) => c[0]),
    ["authorize", "receipt"],
  );
  d.calls.length = 0;
  d.deps.authorize = async () => {
    throw { code: "forbidden" };
  };
  await assert.rejects(writeBelonging(input, d.deps), { code: "forbidden" });
  assert.equal(d.calls.length, 0);
});

test("uncertain retry preserves request ID; corrected draft uses new identity; changed record stays RPC revision-fenced", async () => {
  const f = fixture(),
    input = attempt(f);
  assert.equal(
    createMutationAttempt(
      input,
      belongingSave(
        f.snapshot,
        f.location,
        belongingFields(f.annotation),
        f.document,
      ),
    ).requestId,
    input.requestId,
  );
  const changed = createMutationAttempt(
    input,
    belongingSave(
      f.snapshot,
      f.location,
      { ...belongingFields(f.annotation), label: "Corrected" },
      f.document,
    ),
  );
  assert.notEqual(changed.requestId, input.requestId);
  const d = dependencies(f);
  d.deps.apply = async () => {
    throw { code: "conflict" };
  };
  const before = structuredClone(input);
  await assert.rejects(writeBelonging(input, d.deps), { code: "conflict" });
  assert.deepEqual(input, before);
});

const require = createRequire(import.meta.url),
  root = fileURLToPath(new URL("../src/", import.meta.url));
function component() {
  const cache = new Map();
  function load(path) {
    if (cache.has(path)) return cache.get(path);
    const output = ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        esModuleInterop: true,
      },
    }).outputText;
    const loaded = { exports: {} };
    const localRequire = (name) => {
      if (name.endsWith(".css")) return {};
      if (name.startsWith(".")) {
        const target = resolve(dirname(path), name);
        return load(
          existsSync(target)
            ? target
            : existsSync(`${target}.tsx`)
              ? `${target}.tsx`
              : `${target}.ts`,
        );
      }
      return require(name);
    };
    vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
      filename: path,
    })(localRequire, loaded, loaded.exports);
    cache.set(path, loaded.exports);
    return loaded.exports;
  }
  return load(
    resolve(root, "components/places-belonging/places-belonging-panel.tsx"),
  ).PlacesBelongingPanel;
}
function render(language, snapshot = fixture().snapshot) {
  return renderToStaticMarkup(
    createElement(component(), {
      snapshot,
      language,
      transport: {
        save: () => assert.fail("render must not save"),
        history: () => assert.fail("render must not fetch"),
      },
      onSaved: () => assert.fail("render must not refresh"),
    }),
  );
}
test("actual EN/RU surface renders owner fields, unknowns and reference-only storage authority without IDs or JSON", () => {
  for (const language of ["en", "ru"]) {
    const f = fixture(),
      c = belongingText(language),
      html = render(language, f.snapshot);
    for (const key of [
      "title",
      "reference",
      "referenceHelp",
      "belonging",
      "returnNote",
      "historyNote",
      "unknownVisits",
      "unknownRelationships",
      "stashHelp",
      "history",
      "edit",
    ])
      assert.ok(html.includes(c[key]), key);
    assert.ok(html.includes(f.annotation.returnNote));
    assert.ok(html.includes(f.location.description));
    for (const id of [campaignId, documentId, locationId, timelineId])
      assert.equal(html.includes(id), false);
    assert.equal(html.includes(belongingMarker), false);
    assert.doesNotMatch(html, /<pre|Withdraw|Transfer|Equip|Generate|Restore/);
  }
});
test("actual empty/stale/privacy states stay honest and escaped", () => {
  for (const language of ["en", "ru"]) {
    const c = belongingText(language),
      f = fixture();
    f.snapshot.locations = [];
    let html = render(language, f.snapshot);
    assert.ok(html.includes(c.noLocations));
    assert.equal(html.includes(f.annotation.belonging), false);
    f.snapshot.locations = [{ ...f.location, revision: 4 }];
    html = render(language, f.snapshot);
    assert.ok(html.includes(c.review));
    assert.equal(html.includes(f.annotation.belonging), false);
    f.snapshot.locations = [
      { ...f.location, status: "private", name: "PRIVATE_PLACE" },
    ];
    f.snapshot.storages[0].campaign_id = foreignId;
    html = render(language, f.snapshot);
    assert.equal(html.includes("PRIVATE_PLACE"), false);
    assert.equal(html.includes("Existing shared stash"), false);
  }
  const f = fixture();
  f.annotation.returnNote = "<script>MARKER()</script>";
  f.document.body = encodeBelonging(f.annotation);
  const html = render("en", f.snapshot);
  assert.ok(html.includes("&lt;script&gt;MARKER()&lt;/script&gt;"));
  assert.equal(html.includes("<script>MARKER()"), false);
});

test("bounded literal notes survive escaped control characters without an artificial encoded-body limit", () => {
  const { annotation } = fixture();
  const text = "\u0001".repeat(2400);
  const body = encodeBelonging({
    ...annotation,
    belonging: text,
    returnNote: text,
    historyNote: text,
  });
  assert.ok(body.length > 10000);
  assert.equal(parseBelonging(body).historyNote, text);
});
