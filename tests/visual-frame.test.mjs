import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  VISUAL_FRAME_PREFIX,
  MOCK_ASSET_PREFIX,
  isVisualFrameDocument,
  parseVisualMetadata,
  serializeVisualMetadata,
  visualSubjects,
  newVisualReference,
  referenceIsCurrent,
  visualDocuments,
  buildFrame,
  frameIsCurrent,
  visualDocumentMutation,
  mockAssetMutation,
  mockArtForAsset,
  validateVisualMutation,
} from "../src/lib/visual-frame/model.ts";
import { writeVisualFrame } from "../src/lib/visual-frame/authority.ts";

const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const cid = id(1),
  other = id(2);
const scoped = (n, extra = {}) => ({
  id: id(n),
  campaign_id: cid,
  revision: 1,
  updated_at: "2026-09-27T00:00:00Z",
  ...extra,
});
function fixture() {
  const s = {
    campaign: scoped(1, {
      title: "Synthetic bronze coast",
      subtitle: "",
      language: "en",
    }),
    timeline: { timelineId: id(3), epoch: 4 },
    settings: {},
    settingsHistory: [],
    documents: [],
    entities: [
      scoped(4, {
        kind: "player",
        name: "Synthetic traveler",
        details: "Public owner description",
      }),
    ],
    locations: [
      scoped(5, {
        name: "Known harbor",
        description: "Open quay",
        status: "known",
      }),
    ],
    items: [
      scoped(6, { name: "Lantern", description: "Brass", category: "tool" }),
    ],
    storages: [],
    sessions: [],
    scenes: [
      scoped(7, {
        title: "Arrival",
        body: "The traveler stands on the open quay.",
        role: "narration",
        sequence: 1,
      }),
    ],
    publicState: { campaign_id: cid, current_scene_id: id(7) },
    assets: [],
    quests: [],
    feedback: [],
    dmGuideDocumentId: id(99),
    privateState: { secret: "SECRET_CANARY_NOT_PUBLIC" },
  };
  const r = {
    ...newVisualReference(s, { kind: "entity", id: id(4) }),
    appearance: "Amber coat\nЯнтарный плащ",
    outfit: "Travel cloak",
    guidance: "Soft bronze light",
    approval: "approved",
  };
  s.documents.push(document(r, 8, 9));
  return s;
}
function document(value, n = 10, v = 11, revision = 1) {
  return scoped(n, {
    title:
      value.kind === "frame"
        ? "MOCK FRAME: Arrival"
        : "Visual reference: Synthetic traveler",
    status: "reference",
    body: serializeVisualMetadata(value),
    current_version_id: id(v),
    revision,
  });
}
function request(input, n = 20) {
  return { ...input, requestId: id(n) };
}
function rejectsCode(work, code) {
  assert.throws(work, (error) => error.code === code);
}
function authority(snapshot, options = {}) {
  const calls = [];
  return {
    calls,
    authorize: async (campaignId) => {
      calls.push("authorize");
      assert.equal(campaignId, cid);
      if (options.denied)
        throw Object.assign(new Error(), { code: "forbidden" });
    },
    receipt: async () => {
      calls.push("receipt");
      return options.receipt ?? null;
    },
    snapshot: async () => {
      calls.push("snapshot");
      return snapshot;
    },
    apply: async (input) => {
      calls.push("apply");
      return {
        id: id(42),
        revision: input.expectedRevision + 1,
        campaign_id: cid,
        timeline: snapshot.timeline,
      };
    },
  };
}

test("reserved metadata recognition hides malformed versions without admitting them as visual data", () => {
  for (const body of [
    VISUAL_FRAME_PREFIX + "not-json",
    "RPG_VISUAL_FRAME_V0",
    VISUAL_FRAME_PREFIX + '{"kind":"unknown"}',
  ]) {
    assert.equal(isVisualFrameDocument({ body }), true);
    assert.equal(parseVisualMetadata({ body }), null);
  }
  assert.equal(
    isVisualFrameDocument({ body: "ordinary public reference" }),
    false,
  );
});
test("reference schema rejects private/unknown fields, foreign identity and oversized text", () => {
  const s = fixture(),
    r = parseVisualMetadata(s.documents[0]);
  assert.deepEqual(
    parseVisualMetadata({ body: serializeVisualMetadata(r) }),
    r,
  );
  for (const patch of [
    { secret: "leak" },
    { subject: { ...r.subject, hidden: true } },
    { appearance: "x".repeat(1601) },
    { imageAssetId: id(30), imageAssetRevision: null },
    { provider: "LIVE" },
  ]) {
    assert.equal(
      parseVisualMetadata({
        body: VISUAL_FRAME_PREFIX + JSON.stringify({ ...r, ...patch }),
      }),
      null,
    );
  }
});
test("subject selector uses stable public campaign entities, known locations, items and style only", () => {
  const s = fixture();
  s.entities.push(scoped(30, { campaign_id: other, name: "FOREIGN_ENTITY" }));
  assert.deepEqual(
    visualSubjects(s).map((r) => r.subject.kind),
    ["entity", "location", "item", "style"],
  );
  rejectsCode(
    () => newVisualReference(s, { kind: "entity", id: id(30) }),
    "not_found",
  );
  assert.equal(
    JSON.stringify(visualSubjects(s)).includes("SECRET_CANARY"),
    false,
  );
});
test("reference image links require current same-campaign image metadata and immutable revision", () => {
  const s = fixture(),
    r = parseVisualMetadata(s.documents[0]);
  s.assets.push(
    scoped(30, {
      kind: "image",
      storage_path: null,
      description: "Owner image",
      title: "Image",
    }),
  );
  const linked = { ...r, imageAssetId: id(30), imageAssetRevision: 1 };
  assert.equal(referenceIsCurrent(s, linked), true);
  s.assets[0].revision = 2;
  assert.equal(referenceIsCurrent(s, linked), false);
  s.assets[0].revision = 1;
  s.assets[0].campaign_id = other;
  assert.equal(referenceIsCurrent(s, linked), false);
});
test("new guidance is reference-only with campaign correction semantics and cannot approve itself", () => {
  const s = fixture(),
    r = newVisualReference(s, { kind: "item", id: id(6) });
  const input = visualDocumentMutation(s, r);
  assert.equal(input.correctionScope, "campaign");
  assert.equal(input.payload.status, "reference");
  validateVisualMutation(s, input);
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(s, { ...r, approval: "approved" }),
      ),
    "validation",
  );
  assert.equal(s.entities[0].revision, 1);
  assert.equal(s.items[0].name, "Lantern");
});
test("manual appearance corrections require a new draft and preserve the previous immutable version", () => {
  const s = fixture(),
    old = s.documents[0],
    r = parseVisualMetadata(old),
    original = old.body;
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(s, { ...r, appearance: "New coat" }, old),
      ),
    "validation",
  );
  validateVisualMutation(
    s,
    visualDocumentMutation(
      s,
      { ...r, appearance: "New coat", approval: "draft" },
      old,
    ),
  );
  assert.equal(old.body, original);
  assert.equal(old.current_version_id, id(9));
});
test("approval/invalidation operate on exact reviewed guidance; subject identity cannot be rebound", () => {
  const s = fixture(),
    old = s.documents[0],
    r = parseVisualMetadata(old);
  old.body = serializeVisualMetadata({ ...r, approval: "draft" });
  validateVisualMutation(s, visualDocumentMutation(s, r, old));
  validateVisualMutation(
    s,
    visualDocumentMutation(s, { ...r, approval: "invalidated" }, old),
  );
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(
          s,
          { ...r, subject: { kind: "item", id: id(6) }, approval: "draft" },
          old,
        ),
      ),
    "validation",
  );
});
test("version-copy correction stays a draft pinned to the current subject and never restores an old approval", () => {
  const s = fixture(),
    old = s.documents[0],
    r = parseVisualMetadata(old);
  s.entities[0].revision = 2;
  assert.equal(referenceIsCurrent(s, r), false);
  const copied = {
    ...r,
    sourceRevision: 2,
    appearance: "Copied historic guidance",
    approval: "draft",
  };
  validateVisualMutation(s, visualDocumentMutation(s, copied, old));
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(s, { ...copied, approval: "approved" }, old),
      ),
    "validation",
  );
});
test("spoiler-safe mock brief reads selected narration and approved references only", () => {
  const s = fixture();
  s.documents.push(
    scoped(30, {
      title: "Private decoy",
      status: "canon",
      body: "SECRET_DOC_NOT_SELECTED",
      current_version_id: id(31),
    }),
  );
  s.scenes.push(
    scoped(32, {
      campaign_id: other,
      title: "FOREIGN_SCENE",
      body: "SECRET_FOREIGN_SCENE",
      role: "narration",
    }),
  );
  const frame = buildFrame(s, id(7), [id(8)], "wide");
  assert.match(frame.prompt, /Amber coat/);
  assert.match(frame.prompt, /Янтарный плащ/);
  assert.match(frame.prompt, /open quay/);
  assert.equal(frame.prompt.includes("SECRET"), false);
  assert.equal(frame.prompt.includes(id(4)), false);
  assert.equal(frame.provider, "MOCK");
  assert.deepEqual(frame.basis.references, [
    { documentId: id(8), versionId: id(9) },
  ]);
  validateVisualMutation(s, visualDocumentMutation(s, frame));
  rejectsCode(() => buildFrame(s, id(32), [], "wide"), "not_found");
});
test("draft/invalidated/corrected references and foreign documents never enter a frame", () => {
  for (const patch of [
    { approval: "draft" },
    { approval: "invalidated" },
    { campaign_id: other },
    { sourceRevision: 99 },
  ]) {
    const s = fixture(),
      r = parseVisualMetadata(s.documents[0]);
    s.documents[0].body = serializeVisualMetadata({ ...r, ...patch });
    rejectsCode(() => buildFrame(s, id(7), [id(8)], "wide"), "conflict");
  }
  const s = fixture();
  s.documents[0].status = "archived";
  assert.equal(visualDocuments(s).length, 0);
  rejectsCode(() => buildFrame(s, id(7), [id(8)], "wide"), "conflict");
});
test("frame source versions, public narration revision, entity revision and timeline epoch invalidate exact bases", () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [id(8)], "wide");
  assert.equal(frameIsCurrent(s, frame), true);
  for (const mutate of [
    (n) => n.timeline.epoch++,
    (n) => n.scenes[0].revision++,
    (n) => (n.scenes[0].body += " Correction"),
    (n) => n.entities[0].revision++,
    (n) => (n.documents[0].current_version_id = id(50)),
  ]) {
    const n = structuredClone(s);
    mutate(n);
    assert.equal(frameIsCurrent(n, frame), false);
  }
});
test("frames reject forged prompt, unknown fields, duplicates, non-narration and oversized scene input", () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [], "wide");
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(s, { ...frame, prompt: "Invent hidden enemy" }),
      ),
    "validation",
  );
  assert.equal(
    parseVisualMetadata({
      body:
        VISUAL_FRAME_PREFIX +
        JSON.stringify({ ...frame, apiKey: "not-allowed" }),
    }),
    null,
  );
  rejectsCode(() => buildFrame(s, id(7), [id(8), id(8)], "wide"), "validation");
  s.scenes[0].role = "player";
  rejectsCode(() => buildFrame(s, id(7), [], "wide"), "not_found");
  s.scenes[0].role = "narration";
  s.scenes[0].body = "x".repeat(6001);
  rejectsCode(() => buildFrame(s, id(7), [], "wide"), "validation");
});
test("mock asset completion uses existing asset authority, no URL or storage write, and exact original job version", () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [id(8)], "portrait"),
    job = document(frame);
  s.documents.push(job);
  const input = mockAssetMutation(s, job, frame);
  assert.equal(input.payload.storage_path, null);
  assert.equal(input.operation, "asset.save");
  assert.equal(
    JSON.parse(input.payload.description.slice(MOCK_ASSET_PREFIX.length))
      .job_version_id,
    id(11),
  );
  validateVisualMutation(s, input);
  assert.equal(mockArtForAsset(input.payload), "portrait");
  rejectsCode(
    () =>
      validateVisualMutation(s, {
        ...input,
        payload: { ...input.payload, storage_path: `${cid}/external.png` },
      }),
    "validation",
  );
  rejectsCode(
    () =>
      validateVisualMutation(s, {
        ...input,
        payload: {
          ...input.payload,
          description: input.payload.description.replace(
            "portrait",
            "landscape",
          ),
        },
      }),
    "validation",
  );
});
test("completed frame must attach its exact same-campaign mock asset, and final status is immutable", () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [], "wide"),
    job = document(frame);
  s.documents.push(job);
  const asset = scoped(30, mockAssetMutation(s, job, frame).payload);
  s.assets.push(asset);
  const complete = { ...frame, status: "completed", resultAssetId: asset.id };
  validateVisualMutation(s, visualDocumentMutation(s, complete, job));
  asset.campaign_id = other;
  rejectsCode(
    () => validateVisualMutation(s, visualDocumentMutation(s, complete, job)),
    "validation",
  );
  asset.campaign_id = cid;
  job.body = serializeVisualMetadata(complete);
  job.revision++;
  rejectsCode(
    () =>
      validateVisualMutation(
        s,
        visualDocumentMutation(
          s,
          { ...complete, status: "cancelled", resultAssetId: null },
          job,
        ),
      ),
    "validation",
  );
});
test("failed/cancelled stale jobs preserve history and text state without requiring current source", () => {
  for (const status of ["failed", "cancelled"]) {
    const s = fixture(),
      frame = buildFrame(s, id(7), [id(8)], "wide"),
      job = document(frame);
    s.documents.push(job);
    const before = JSON.stringify(s);
    s.scenes[0].revision++;
    validateVisualMutation(
      s,
      visualDocumentMutation(s, { ...frame, status }, job),
    );
    assert.equal(s.documents[1].body, JSON.parse(before).documents[1].body);
    assert.equal(s.entities[0].revision, 1);
    assert.equal(s.publicState.current_scene_id, id(7));
  }
});
test("foreign campaign writes, guide hijacks, old revision and old timeline fail closed", () => {
  const s = fixture(),
    r = parseVisualMetadata(s.documents[0]),
    input = visualDocumentMutation(
      s,
      { ...r, approval: "draft" },
      s.documents[0],
    );
  rejectsCode(
    () => validateVisualMutation(s, { ...input, campaignId: other }),
    "conflict",
  );
  rejectsCode(
    () =>
      validateVisualMutation(s, {
        ...input,
        timeline: { ...input.timeline, epoch: 3 },
      }),
    "conflict",
  );
  rejectsCode(
    () => validateVisualMutation(s, { ...input, expectedRevision: 99 }),
    "conflict",
  );
  s.dmGuideDocumentId = id(8);
  rejectsCode(() => validateVisualMutation(s, input), "not_found");
});
test("authority authorizes before exact receipt replay and never rereads changed sources on retry", async () => {
  const s = fixture(),
    input = request(
      visualDocumentMutation(
        s,
        newVisualReference(s, { kind: "style", id: cid }),
      ),
    ),
    receipt = {
      id: id(42),
      revision: 1,
      campaign_id: cid,
      timeline: s.timeline,
    };
  const a = authority(null, { receipt });
  assert.deepEqual(await writeVisualFrame(input, a), receipt);
  assert.deepEqual(a.calls, ["authorize", "receipt"]);
  const denied = authority(s, { denied: true, receipt });
  await assert.rejects(
    writeVisualFrame(input, denied),
    (e) => e.code === "forbidden",
  );
  assert.deepEqual(denied.calls, ["authorize"]);
});
test("new authority writes preflight public sources then delegate exactly once to ordinary mutation authority", async () => {
  const s = fixture(),
    a = authority(s),
    input = request(
      visualDocumentMutation(
        s,
        newVisualReference(s, { kind: "style", id: cid }),
      ),
    );
  const result = await writeVisualFrame(input, a);
  assert.equal(result.revision, 1);
  assert.deepEqual(a.calls, ["authorize", "receipt", "snapshot", "apply"]);
});
test("authority rejects unsupported mutations and malformed requests before accessing persistence", async () => {
  const s = fixture(),
    a = authority(s);
  await assert.rejects(
    writeVisualFrame(
      request({
        operation: "state.save",
        campaignId: cid,
        timeline: s.timeline,
        expectedRevision: 1,
        payload: {
          summary: "Wrong",
          current_session_id: null,
          current_scene_id: null,
          current_location_id: null,
        },
      }),
      a,
    ),
    (e) => e.code === "validation",
  );
  await assert.rejects(
    writeVisualFrame({ requestId: "bad" }, a),
    (e) => e.code === "validation",
  );
  assert.deepEqual(a.calls, []);
});
test("mock display and browser module remain provider-free with no raw identity or canonical state editor", () => {
  const ui = readFileSync(
      new URL("../src/components/persistent-visual-frame.tsx", import.meta.url),
      "utf8",
    ),
    art = readFileSync(
      new URL("../src/components/visual-frame/mock-art.tsx", import.meta.url),
      "utf8",
    ),
    model = readFileSync(
      new URL("../src/lib/visual-frame/model.ts", import.meta.url),
      "utf8",
    );
  for (const source of [ui, art, model])
    assert.doesNotMatch(
      source,
      /SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|FAL_KEY|\/api\/dm|openai\.com|fal\.run/,
    );
  assert.doesNotMatch(
    model,
    /operation: "(?:state|entity|item|location)\.save"/,
  );
  assert.match(ui, /No image provider is connected/);
  assert.match(ui, /Провайдер изображений не подключён/);
  assert.match(ui, /Copy guidance into a new draft/);
  assert.match(ui, /Set as Canon visual reference/);
  assert.doesNotMatch(art, /https?:|<image|<text/);
});

test("long public names stay within ordinary persistence title limits", async () => {
  const s = fixture();
  s.entities[0].name = "x".repeat(200);
  s.scenes[0].title = "y".repeat(200);
  const ref = newVisualReference(s, { kind: "entity", id: id(4) });
  const a = authority(s);
  await writeVisualFrame(request(visualDocumentMutation(s, ref)), a);
  assert.equal(visualDocumentMutation(s, ref).payload.title.length, 200);
  const frame = buildFrame(s, id(7), [], "wide");
  await writeVisualFrame(
    request(visualDocumentMutation(s, frame), 21),
    authority(s),
  );
  assert.equal(
    mockAssetMutation(s, document(frame), frame).payload.title.length,
    200,
  );
});
test("server refuses duplicate queued requests and non-stable mock result request IDs", async () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [], "wide"),
    job = document(frame);
  s.documents.push(job);
  await assert.rejects(
    writeVisualFrame(request(visualDocumentMutation(s, frame)), authority(s)),
    (e) => e.code === "conflict",
  );
  await assert.rejects(
    writeVisualFrame(request(mockAssetMutation(s, job, frame)), authority(s)),
    (e) => e.code === "validation",
  );
  const a = authority(s);
  await writeVisualFrame(request(mockAssetMutation(s, job, frame), 10), a);
  assert.deepEqual(a.calls, ["authorize", "receipt", "snapshot", "apply"]);
});

test("completion receipt replay survives uncertain attachment and preserves exact original result", async () => {
  const s = fixture(),
    frame = buildFrame(s, id(7), [], "wide"),
    job = document(frame);
  s.documents.push(job);
  const asset = scoped(30, mockAssetMutation(s, job, frame).payload);
  s.assets.push(asset);
  const completed = { ...frame, status: "completed", resultAssetId: asset.id };
  const input = request(visualDocumentMutation(s, completed, job), 30);
  await writeVisualFrame(input, authority(s));
  const receipt = {
    id: job.id,
    revision: 2,
    campaign_id: cid,
    timeline: s.timeline,
  };
  const retry = authority(null, { receipt });
  assert.deepEqual(await writeVisualFrame(input, retry), receipt);
  assert.deepEqual(retry.calls, ["authorize", "receipt"]);
  await assert.rejects(
    writeVisualFrame({ ...input, requestId: id(31) }, authority(s)),
    (e) => e.code === "validation",
  );
});

async function visualComponentForTransport(client, dependencies = {}) {
  const [{ default: ts }, { createRequire }, { runInNewContext }] =
    await Promise.all([
      import("typescript"),
      import("node:module"),
      import("node:vm"),
    ]);
  const source = readFileSync(
    new URL("../src/components/persistent-visual-frame.tsx", import.meta.url),
    "utf8",
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const require = createRequire(import.meta.url),
    compiledModule = { exports: {} };
  runInNewContext(compiled, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (name) =>
      dependencies[name] ??
      (name === "react" || name === "react/jsx-runtime"
        ? require(name)
        : name === "@/lib/persistence/client"
          ? client
          : {}),
  });
  return compiledModule.exports;
}

test("Visual Bible default transport retains its production API endpoint and history loader", async () => {
  const calls = [],
    receipt = {
      id: id(42),
      revision: 1,
      campaign_id: cid,
      timeline: fixture().timeline,
    },
    history = [{ id: id(9), version: 1 }];
  const component = await visualComponentForTransport({
    readJson: async (url, init) => {
      calls.push({ url, init });
      return receipt;
    },
    loadVersions: async (...scope) => {
      calls.push(scope);
      return history;
    },
  });
  const transport = component.PersistentVisualFrame().props.value;
  const mutation = request(
    visualDocumentMutation(
      fixture(),
      newVisualReference(fixture(), { kind: "style", id: cid }),
    ),
  );
  assert.equal(await transport.save(mutation), receipt);
  assert.equal(await transport.history(cid, id(8)), history);
  assert.equal(calls[0].url, "/api/visual-frame");
  assert.equal(calls[0].init.method, "POST");
  assert.deepEqual(JSON.parse(calls[0].init.body), mutation);
  assert.deepEqual(calls[1], [cid, id(8)]);
});
test("injected Visual Bible transport performs save/history with no production network dependency", async () => {
  const networkForbidden = () => {
    throw new Error("Production transport must not run in a disposable review");
  };
  const component = await visualComponentForTransport({
    readJson: networkForbidden,
    loadVersions: networkForbidden,
  });
  const calls = [],
    receipt = { id: id(42), revision: 1 },
    versions = [{ id: id(9), version: 1 }];
  const injected = {
    save: async (input) => {
      calls.push(input);
      return receipt;
    },
    history: async (...scope) => {
      calls.push(scope);
      return versions;
    },
  };
  const transport = component.PersistentVisualFrame({ transport: injected })
    .props.value;
  assert.equal(transport, injected);
  const mutation = request(
    visualDocumentMutation(
      fixture(),
      newVisualReference(fixture(), { kind: "style", id: cid }),
    ),
  );
  assert.equal(await transport.save(mutation), receipt);
  assert.equal(await transport.history(cid, id(8)), versions);
  assert.deepEqual(calls, [mutation, [cid, id(8)]]);
  const source = readFileSync(
    new URL("../src/components/persistent-visual-frame.tsx", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(source, /loadCampaign|\bfetch\(/);
  assert.match(source, /await transport\.save\(attempt\.current\)/);
  assert.match(source, /return transport\.save\(attempt\)/);
  assert.match(
    source,
    /transport\s*\.history\(snapshot\.campaign\.id, record\.id\)/,
  );
});

async function visualPanelHarness() {
  const [
    { createMutationAttempt, ClientPersistenceError },
    visualModel,
    React,
  ] = await Promise.all([
    import("../src/lib/persistence/client.ts"),
    import("../src/lib/visual-frame/model.ts"),
    import("react"),
  ]);
  const server = fixture();
  let displayed = structuredClone(server),
    cursor = 0,
    serial = 100;
  const hooks = [],
    submissions = [],
    receipts = new Map();
  const controls = {
    lostSaveResponse: false,
    lostRefresh: false,
    lostCompletionResponse: false,
  };
  const transport = {
    save: async (input) => {
      submissions.push(input);
      const result = await writeVisualFrame(structuredClone(input), {
        authorize: async () => {},
        snapshot: async () => server,
        receipt: async (command) => {
          const prior = receipts.get(command.requestId);
          if (!prior) return null;
          assert.equal(JSON.stringify(prior.input), JSON.stringify(command));
          return prior.result;
        },
        apply: async (command) => {
          let row;
          if (command.operation === "document.save") {
            const current = server.documents.find(
              (r) => r.id === command.payload.id,
            );
            row = {
              ...scoped(serial++),
              ...command.payload,
              id: current?.id ?? id(serial++),
              current_version_id: id(serial++),
              revision: (current?.revision ?? 0) + 1,
            };
            server.documents = current
              ? server.documents.map((r) => (r.id === current.id ? row : r))
              : [...server.documents, row];
          } else {
            row = { ...scoped(serial++), ...command.payload };
            server.assets.push(row);
          }
          const saved = {
            id: row.id,
            revision: row.revision,
            campaign_id: cid,
            timeline: server.timeline,
          };
          receipts.set(command.requestId, { input: command, result: saved });
          return saved;
        },
      });
      const metadata =
        input.operation === "document.save"
          ? parseVisualMetadata(input.payload)
          : null;
      if (
        controls.lostSaveResponse ||
        (controls.lostCompletionResponse &&
          metadata?.kind === "frame" &&
          metadata.status === "completed")
      ) {
        controls.lostSaveResponse = false;
        controls.lostCompletionResponse = false;
        throw new ClientPersistenceError("unavailable");
      }
      return result;
    },
    history: async () => [],
  };
  const component = await visualComponentForTransport(
    { createMutationAttempt, ClientPersistenceError },
    {
      react: {
        ...React,
        useContext: () => transport,
        useEffect: () => {},
        useRef: (initial) => {
          const slot = cursor++;
          hooks[slot] ??= { current: initial };
          return hooks[slot];
        },
        useState: (initial) => {
          const slot = cursor++;
          if (!(slot in hooks))
            hooks[slot] = typeof initial === "function" ? initial() : initial;
          return [
            hooks[slot],
            (value) => {
              hooks[slot] =
                typeof value === "function" ? value(hooks[slot]) : value;
            },
          ];
        },
      },
      "./language-context": { useLanguage: () => ({ language: "en" }) },
      "./persistence-context": {
        useCampaignData: () => ({
          data: displayed,
          refresh: async () => {
            if (controls.lostRefresh) {
              controls.lostRefresh = false;
              throw new ClientPersistenceError("unavailable");
            }
            displayed = structuredClone(server);
          },
        }),
      },
      "./ui": {
        Badge: "span",
        Button: "button",
        Panel: "section",
        Modal: "dialog",
      },
      "@/lib/visual-frame/model": visualModel,
    },
  );
  function render() {
    cursor = 0;
    return component.PersistentVisualFrame({ transport }).props.children.type();
  }
  function textOf(node) {
    if (typeof node === "string" || typeof node === "number")
      return String(node);
    if (Array.isArray(node)) return node.map(textOf).join("");
    return node?.props ? textOf(node.props.children) : "";
  }
  function findButton(node, label) {
    if (Array.isArray(node)) {
      for (const child of node) {
        const found = findButton(child, label);
        if (found) return found;
      }
    } else if (node?.props) {
      if (node.type === "button" && textOf(node) === label) return node;
      return findButton(node.props.children, label);
    }
    return null;
  }
  async function click(label) {
    const button = findButton(render(), label);
    assert.ok(button, `Expected button: ${label}`);
    assert.equal(Boolean(button.props.disabled), false);
    button.props.onClick();
    await new Promise((resolve) => setImmediate(resolve));
  }
  return {
    server,
    submissions,
    controls,
    render,
    click,
    frames: () =>
      visualDocuments(server).filter((e) => e.value.kind === "frame"),
  };
}

test("real FRAME handlers create a fresh explicit request after failure, cancellation or completion", async () => {
  for (const terminal of [
    "Test mock failure",
    "Cancel",
    "Complete mock preview",
  ]) {
    const h = await visualPanelHarness();
    h.render();
    assert.equal(h.submissions.length, 0);
    await h.click("FRAME · queue mock preview");
    const original = h.submissions[0].requestId;
    await h.click(terminal);
    assert.equal(h.frames().length, 1);
    assert.notEqual(h.frames()[0].value.status, "queued");
    await h.click("FRAME · queue mock preview");
    assert.equal(h.frames().length, 2);
    assert.equal(
      h.frames().filter((e) => e.value.status === "queued").length,
      1,
    );
    const queued = h.submissions.filter(
      (input) =>
        input.operation === "document.save" &&
        parseVisualMetadata(input.payload)?.status === "queued",
    );
    assert.equal(queued.length, 2);
    assert.notEqual(queued[1].requestId, original);
    const count = h.submissions.length;
    h.render();
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(
      h.submissions.length,
      count,
      "Rendering must not submit automatic work",
    );
  }
});
test("lost queue response or refresh retains exact retry identity until the UI action is confirmed", async () => {
  for (const uncertainty of ["lostSaveResponse", "lostRefresh"]) {
    const h = await visualPanelHarness();
    h.controls[uncertainty] = true;
    await h.click("FRAME · queue mock preview");
    const original = h.submissions[0];
    assert.equal(h.frames().length, 1);
    await h.click("FRAME · queue mock preview");
    assert.deepEqual(h.submissions[1], original);
    assert.equal(h.frames().length, 1);
    await h.click("Test mock failure");
    await h.click("FRAME · queue mock preview");
    assert.equal(h.frames().length, 2);
    assert.notEqual(h.submissions.at(-1).requestId, original.requestId);
  }
});
test("lost completion response retries stable asset and attachment identities without duplicate output", async () => {
  const h = await visualPanelHarness();
  await h.click("FRAME · queue mock preview");
  h.controls.lostCompletionResponse = true;
  await h.click("Complete mock preview");
  const firstAsset = h.submissions[1],
    firstAttachment = h.submissions[2];
  await h.click("Complete mock preview");
  assert.deepEqual(h.submissions[3], firstAsset);
  assert.deepEqual(h.submissions[4], firstAttachment);
  assert.equal(h.server.assets.length, 1);
  assert.equal(h.frames().length, 1);
  assert.equal(h.frames()[0].value.status, "completed");
  await h.click("FRAME · queue mock preview");
  assert.equal(h.frames().length, 2);
});
