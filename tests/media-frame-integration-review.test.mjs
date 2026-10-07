import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { runInNewContext } from "node:vm";
import ts from "typescript";
import { fixture as mediaFixture } from "./media-frame-fixture.mjs";
import * as visualModel from "../src/lib/visual-frame/model.ts";
import * as realModel from "../src/lib/visual-frame/real-frame.ts";
import * as videoModel from "../src/lib/scene-video/model.ts";
import { sceneOrder } from "../src/lib/persistence/record-model.ts";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import {
  buildRealFrame as buildCurrentFrame,
  realFrameDocumentMutation,
  realFrameAssetMutation,
  parseRealFrame,
} from "../src/lib/visual-frame/real-frame.ts";
import {
  newVisualReference,
  serializeVisualMetadata,
} from "../src/lib/visual-frame/model.ts";
const root = process.env.MEDIA_FRAME_SOURCE_ROOT
  ? pathToFileURL(
      process.env.MEDIA_FRAME_SOURCE_ROOT.replaceAll("\\", "/").replace(
        /\/$/,
        "",
      ) + "/",
    )
  : new URL("../", import.meta.url);
// Historical schema3 authority compatibility; new draft authority is tested separately.
import { closedWorldFramePrompt } from "../src/lib/visual-frame/closed-world.ts";
function buildRealFrame(...args) {
  const frame = buildCurrentFrame(...args);
  delete frame.review;
  frame.schema = 3;
  frame.prompt = closedWorldFramePrompt(
    frame.basis.scene,
    frame.basis.references.map((r) => {
      const row = args[0].documents.find((d) => d.id === r.documentId);
      return parseVisualForLegacy(row);
    }),
    frame.composition,
  );
  return frame;
}
import { parseVisualMetadata as parseVisualForLegacy } from "../src/lib/visual-frame/model.ts";
const model = "gpt-image-2.5-sunburst-2026-09-08",
  parameters = {
    size: "1536x1024",
    quality: "high",
    outputFormat: "png",
    n: 1,
  };
async function setup() {
  const f = await fixture(23);
  try {
    await f.db.exec(
      await readFile(
        new URL("supabase/migrations/202609270025_real_frame.sql", root),
        "utf8",
      ),
    );
    await f.db.exec(
      await readFile(
        new URL("supabase/migrations/202609280027_frame_grounding.sql", root),
        "utf8",
      ),
    );
    Object.assign(f, await world(f));
    f.snapshot = () => f.saves(f.cid, "campaign");
    f.source = async () =>
      (
        await f.one("select public.rpg_frame_basis($1,$2,$3::jsonb) result", [
          f.owner,
          f.cid,
          JSON.stringify(await f.fence(f.cid)),
        ])
      ).result;
    f.budgetId = randomUUID();
    await f.one("select public.rpg_media_budget_prepare($1,$2,$3,2000000,5)", [
      f.owner,
      f.budgetId,
      model,
    ]);
    f.lifecycle = async (input) =>
      (
        await f.one(
          "select public.rpg_real_frame_lifecycle($1,$2::jsonb) result",
          [f.owner, JSON.stringify(input)],
        )
      ).result;
    f.claim = async (input, budgetId = f.budgetId) =>
      (
        await f.one(
          "select public.rpg_real_frame_claim($1,$2::jsonb,$3) result",
          [f.owner, JSON.stringify(input), budgetId],
        )
      ).result;
    f.complete = async ({ input, asset, output }) =>
      (
        await f.one(
          "select public.rpg_real_frame_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
          [
            f.owner,
            JSON.stringify(input),
            JSON.stringify(asset),
            JSON.stringify(output),
          ],
        )
      ).result;
    f.queue = async (referenceIds = []) => {
      const snapshot = await f.snapshot(),
        frame = buildRealFrame(
          snapshot,
          referenceIds,
          "wide",
          model,
          parameters,
          await f.source(),
        ),
        input = {
          ...realFrameDocumentMutation(snapshot, frame),
          requestId: randomUUID(),
        };
      const result = await f.lifecycle(input);
      return {
        input,
        frame,
        record: (await f.snapshot()).documents.find((r) => r.id === result.id),
      };
    };
    f.dispatch = async (record) => {
      const requestId = randomUUID(),
        frame = {
          ...parseRealFrame(record),
          status: "generating",
          dispatch: { requestId, reservationUsdMicros: 400000 },
        };
      return {
        ...realFrameDocumentMutation(await f.snapshot(), frame, record),
        requestId,
      };
    };
    f.finish = async (id) => {
      const snapshot = await f.snapshot(),
        record = snapshot.documents.find((r) => r.id === id),
        frame = parseRealFrame(record);
      const output = {
        storagePath: `${f.cid}/frames/${id}/output.png`,
        sha256: "a".repeat(64),
        bytes: 100,
        contentType: "image/png",
        usage: {
          textInputTokens: 100,
          imageInputTokens: 0,
          outputTokens: 1372,
        },
        providerRequestId: "offline_review_only",
      };
      if (
        (await f.reservations()).some(
          (reservation) => reservation.job_id === id,
        )
      ) {
        await f.one("select public.rpg_frame_check_claim($1,$2,$3,$4,$5)", [
          f.owner,
          f.cid,
          id,
          record.current_version_id,
          output.sha256,
        ]);
        await f.one(
          "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb)",
          [
            f.owner,
            f.cid,
            id,
            record.current_version_id,
            output.sha256,
            JSON.stringify({
              schemaVersion: 1,
              verdict: { schemaVersion: 1, status: "pass", reasons: [] },
              actualModel: "gpt-5.4",
              inputTokens: 3000,
              outputTokens: 200,
              latencyMs: 10,
            }),
          ],
        );
      }
      return {
        input: {
          ...realFrameDocumentMutation(
            snapshot,
            { ...frame, status: "completed", resultAssetId: id },
            record,
          ),
          requestId: id,
        },
        asset: {
          ...realFrameAssetMutation(snapshot, record, frame, output, id),
          requestId: record.current_version_id,
        },
        output,
      };
    };
    f.runtimeRow = () =>
      f.one("select * from rpg_private.runtime_state where campaign_id=$1", [
        f.cid,
      ]);
    f.reservations = () =>
      f.query(
        "select * from rpg_private.media_reservations where campaign_id=$1",
        [f.cid],
      );
    return f;
  } catch (error) {
    await f.db.close();
    throw error;
  }
}
test("integrated claim replay pins original operational budget before mutable source checks", async () => {
  const f = await setup();
  try {
    const q = await f.queue(),
      input = await f.dispatch(q.record),
      first = await f.claim(input);
    assert.equal(first.claimed, true);
    await assert.rejects(f.claim(input, randomUUID()), /rpg_conflict/);
    await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Real owner correction",
        status: "canon",
        body: "The visible crossing fact changed.",
      },
      0,
      "campaign",
    );
    const replay = await f.claim(input);
    assert.equal(replay.claimed, false);
    assert.deepEqual(replay.result, first.result);
    await assert.rejects(f.claim(input, randomUUID()), /rpg_conflict/);
    assert.equal((await f.reservations()).length, 1);
    assert.equal(
      (
        await f.one(
          "select reserved_usd_micros from rpg_private.media_budgets where id=$1",
          [f.budgetId],
        )
      ).reserved_usd_micros,
      600000,
    );
  } finally {
    await f.db.close();
  }
});
test("generic full generating FRAME body cannot attach pixels without trusted paid claim reservation", async () => {
  const f = await setup();
  try {
    const snapshot = await f.snapshot(),
      frame = buildRealFrame(
        snapshot,
        [],
        "wide",
        model,
        parameters,
        await f.source(),
      );
    frame.status = "generating";
    frame.dispatch = { requestId: randomUUID(), reservationUsdMicros: 400000 };
    frame.basis.canonGeneration++;
    const ordinary = realFrameDocumentMutation(snapshot, frame);
    const result = await f.mutation(
        "document.save",
        f.cid,
        ordinary.payload,
        0,
        "campaign",
      ),
      before = await f.runtimeRow();
    await assert.rejects(
      f.complete(await f.finish(result.id)),
      /rpg_validation/,
    );
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.equal((await f.reservations()).length, 0);
    assert.deepEqual(await f.runtimeRow(), before);
    assert.equal(
      parseRealFrame(
        (await f.snapshot()).documents.find((r) => r.id === result.id),
      ).status,
      "generating",
    );
  } finally {
    await f.db.close();
  }
});
test("service attachment rejects billed image input and oversized observed usage atomically", async () => {
  const f = await setup();
  try {
    const before = await f.runtimeRow(),
      q = await f.queue();
    await f.claim(await f.dispatch(q.record));
    const completion = await f.finish(q.record.id);
    for (const usage of [
      { textInputTokens: 100, imageInputTokens: 1, outputTokens: 1372 },
      { textInputTokens: 100, imageInputTokens: 0, outputTokens: 20000 },
      { textInputTokens: 80001, imageInputTokens: 0, outputTokens: 0 },
    ]) {
      await assert.rejects(
        f.complete({ ...completion, output: { ...completion.output, usage } }),
        /rpg_validation/,
      );
      assert.equal((await f.snapshot()).assets.length, 0);
      assert.equal(
        parseRealFrame(
          (await f.snapshot()).documents.find((r) => r.id === q.record.id),
        ).status,
        "generating",
      );
      assert.deepEqual(await f.runtimeRow(), before);
    }
    await f.complete(completion);
    assert.equal((await f.snapshot()).assets.length, 1);
    assert.deepEqual(await f.runtimeRow(), before);
    assert.equal((await f.reservations()).length, 1);
  } finally {
    await f.db.close();
  }
});
test("genuine approved appearance correction fences late result and remains ordinary Canon authority", async () => {
  const f = await setup();
  try {
    const snapshot = await f.snapshot(),
      reference = {
        ...newVisualReference(snapshot, { kind: "entity", id: f.hero }),
        appearance: "Owner-reviewed bronze cloak.",
        approval: "approved",
      };
    const saved = await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Approved appearance",
        status: "reference",
        body: serializeVisualMetadata(reference),
      },
      0,
      "campaign",
    );
    const q = await f.queue([saved.id]),
      dispatch = await f.dispatch(q.record);
    await f.claim(dispatch);
    const completion = await f.finish(q.record.id),
      sourceBefore = await f.source(),
      runtimeBefore = await f.runtimeRow();
    const record = (await f.snapshot()).documents.find(
      (r) => r.id === saved.id,
    );
    await f.mutation(
      "document.save",
      f.cid,
      {
        id: record.id,
        title: record.title,
        status: record.status,
        body: serializeVisualMetadata({
          ...reference,
          appearance: "Owner correction: dark linen cloak.",
          approval: "draft",
        }),
      },
      record.revision,
      "campaign",
    );
    assert.equal(
      (await f.source()).canonGeneration,
      sourceBefore.canonGeneration + 1,
    );
    assert.ok((await f.runtimeRow()).revision > runtimeBefore.revision);
    await assert.rejects(f.complete(completion), /rpg_conflict/);
    assert.equal((await f.snapshot()).assets.length, 0);
    assert.equal((await f.reservations()).length, 1);
    assert.equal((await f.claim(dispatch)).claimed, false);
  } finally {
    await f.db.close();
  }
});
test("FRAME lifecycle does not invalidate an already claimed text gameplay lease", async () => {
  const f = await setup();
  try {
    const operationId = randomUUID(),
      play = await f.runtime(f.cid, "play");
    await f.runtime(f.cid, "begin", {
      operationId,
      campaignId: f.cid,
      expectedRevision: play.revision,
      mode: "game",
      input: "Read the existing bridge sign.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    const claim = await f.runtime(f.cid, "claim", { operationId }),
      before = await f.runtimeRow(),
      q = await f.queue();
    await f.claim(await f.dispatch(q.record));
    await f.complete(await f.finish(q.record.id));
    assert.deepEqual(await f.runtimeRow(), before);
    const packet = {
      narration: "The existing bridge sign remains readable.",
      visualDescription: "",
      resolution: {
        changes: [],
        worldMinutes: claim.source.runtime.worldMinutes,
        configuration: claim.source.runtime.configuration,
        outcomes: [],
      },
      privatePatches: [],
      checks: [],
      guidanceProposal: null,
    };
    const result = await f.runtime(f.cid, "commit", { ...claim.lease, packet });
    assert.equal(result.status, "committed");
    assert.equal((await f.snapshot()).assets.length, 1);
  } finally {
    await f.db.close();
  }
});

async function mountedGame(snapshot) {
  const source = await readFile(
      new URL("src/components/persistent-game.tsx", root),
      "utf8",
    ),
    compiledModule = { exports: {} };
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const jsx = (type, props) => ({ type, props }),
    dependencies = {
      react: { useState: (initial) => [initial, () => {}] },
      "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "fragment" },
      "@/lib/visual-frame/model": visualModel,
      "@/lib/visual-frame/real-frame": realModel,
      "@/lib/scene-video/model": videoModel,
      "@/lib/persistence/record-model": { sceneOrder },
      "./visual-frame/current-scene-video": {
        CurrentSceneVideo: "scene-video",
        StoredSceneVideo: "stored-video",
        SceneVideoHistory: "video-history",
      },
      "./visual-frame/current-scene-frame": {
        CurrentSceneFrame: "injected-mock-frame",
      },
      "./visual-frame/current-scene-media-frame": {
        CurrentSceneMediaFrame: "real-frame",
        StoredFrameImage: "stored-frame-image",
        RealFrameHistory: "real-frame-history",
      },
      "./language-context": {
        useLanguage: () => ({ t: (value) => value, language: "en" }),
      },
      "./persistence-context": {
        useCampaignData: () => ({
          data: snapshot,
          campaignId: snapshot.campaign.id,
        }),
      },
      "./gameplay-runtime": {
        useGameplayRuntime: () => ({ play: null, loading: false, error: null }),
      },
      "./ui": {
        Button: "button",
        Badge: "badge",
        Panel: "panel",
        Icon: "icon",
      },
      "./persistent-records": {
        RecordBoundary: "record-boundary",
        RecordHeading: "heading",
      },
    };
  runInNewContext(js, {
    module: compiledModule,
    exports: compiledModule.exports,
    require: (name) => dependencies[name] ?? {},
    console,
  });
  const render = (name, props) => {
    const boundary = compiledModule.exports[name](props),
      child = boundary.props.children(snapshot);
    return child.type(child.props);
  };
  const nodes = (tree) => {
    const found = [];
    function walk(n) {
      if (Array.isArray(n)) return n.forEach(walk);
      if (!n?.props) return;
      found.push(n);
      walk(n.props.children);
    }
    walk(tree);
    return found;
  };
  const text = (n) =>
    typeof n === "string"
      ? n
      : Array.isArray(n)
        ? n.map(text).join(" ")
        : n?.props
          ? text(n.props.children)
          : "";
  return { render, nodes, text };
}
test("mounted ordinary Game chooses real FRAME while explicit synthetic transport keeps accepted MOCK review", async () => {
  const f = mediaFixture(),
    ui = await mountedGame(f.snapshot),
    normal = ui.nodes(ui.render("PersistentGame", { reviewOnly: false }));
  assert.equal(normal.filter((n) => n.type === "real-frame").length, 1);
  assert.equal(
    normal.some((n) => n.type === "injected-mock-frame"),
    false,
  );
  const injected = { synthetic: true },
    synthetic = ui.nodes(
      ui.render("PersistentGame", {
        reviewOnly: false,
        frameTransport: injected,
      }),
    );
  assert.equal(
    synthetic.some((n) => n.type === "real-frame"),
    false,
  );
  assert.equal(
    synthetic.find((n) => n.type === "injected-mock-frame").props.transport,
    injected,
  );
  assert.equal(f.providerCalls(), 0);
});
test("mounted Gallery displays only safe completed real art and keeps operational provenance out of ordinary prose", async () => {
  const f = mediaFixture(),
    q = await f.queue();
  await f.run("media.dispatch", f.dispatch(q.record));
  await f.accept(q.record.id);
  const asset = f.snapshot.assets.find((a) => a.id === q.record.id),
    ui = await mountedGame(f.snapshot),
    tree = ui.render("PersistentSupporting", { screen: "gallery" });
  assert.equal(
    ui.nodes(tree).find((n) => n.type === "stored-frame-image").props.asset,
    asset,
  );
  assert.doesNotMatch(
    ui.text(tree),
    /RPG_REAL_FRAME_ASSET_V1|offline_review_only|job_document_id/,
  );
  for (const prefix of [
    "RPG_REAL_FRAME_ASSET_V1\n",
    "RPG_OWNER_FRAME_ASSET_V1\n",
    "RPG_SCENE_VIDEO_ASSET_V1\n",
  ]) {
    asset.description = prefix + "{malformed_private_operational_marker}";
    const invalid = ui.render("PersistentSupporting", { screen: "gallery" });
    assert.equal(
      ui.nodes(invalid).some((n) => n.type === "stored-frame-image"),
      false,
    );
    assert.doesNotMatch(
      ui.text(invalid),
      /malformed_private_operational_marker|RPG_REAL_FRAME_ASSET_V1|RPG_OWNER_FRAME_ASSET_V1|RPG_SCENE_VIDEO_ASSET_V1/,
    );
  }
});
