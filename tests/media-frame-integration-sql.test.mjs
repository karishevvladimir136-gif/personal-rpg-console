import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { integrationFixture, command } from "./d2a-integration-fixture.mjs";
const source = process.env.MEDIA_SOURCE_ROOT
  ? pathToFileURL(process.env.MEDIA_SOURCE_ROOT.replaceAll("\\", "/") + "/")
  : new URL("../", import.meta.url);
const {
  buildRealFrame: buildCurrentFrame,
  realFrameDocumentMutation,
  realFrameAssetMutation,
} = await import(new URL("src/lib/visual-frame/real-frame.ts", source));
const { newVisualReference, serializeVisualMetadata } = await import(
  new URL("src/lib/visual-frame/model.ts", source)
);
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
async function tools(f) {
  f.snap = () => f.saves(f.cid, "campaign");
  f.basis = async () =>
    (
      await f.one("select public.rpg_frame_basis($1,$2,$3::jsonb) v", [
        f.owner,
        f.cid,
        JSON.stringify(await f.fence(f.cid)),
      ])
    ).v;
  f.lifecycle = async (m, uid = f.owner) =>
    (
      await f.one("select public.rpg_real_frame_lifecycle($1,$2::jsonb) v", [
        uid,
        JSON.stringify(m),
      ])
    ).v;
  f.claim = async (m) =>
    (
      await f.one("select public.rpg_real_frame_claim($1,$2::jsonb,$3) v", [
        f.owner,
        JSON.stringify(m),
        f.budget,
      ])
    ).v;
  f.complete = async (m, a, o) =>
    (
      await f.one(
        "select public.rpg_real_frame_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) v",
        [f.owner, JSON.stringify(m), JSON.stringify(a), JSON.stringify(o)],
      )
    ).v;
  f.budget = randomUUID();
  await f.one("select public.rpg_media_budget_prepare($1,$2,$3,$4,$5)", [
    f.owner,
    f.budget,
    model,
    1200000,
    2,
  ]);
  f.queue = async (refs = []) => {
    const s = await f.snap(),
      v = buildRealFrame(s, refs, "wide", model, parameters, await f.basis());
    const m = { ...realFrameDocumentMutation(s, v), requestId: randomUUID() };
    const r = await f.lifecycle(m);
    return {
      m,
      r,
      v,
      record: (await f.snap()).documents.find((d) => d.id === r.id),
    };
  };
  f.generating = async (q) => {
    const s = await f.snap(),
      v = {
        ...q.v,
        status: "generating",
        dispatch: { requestId: randomUUID(), reservationUsdMicros: 400000 },
      },
      m = {
        ...realFrameDocumentMutation(s, v, q.record),
        requestId: v.dispatch.requestId,
      };
    return { v, m };
  };
  f.finish = async (g) => {
    const s = await f.snap(),
      record = s.documents.find((d) => d.id === g.m.payload.id),
      o = {
        storagePath: `${f.cid}/frames/${record.id}/output.png`,
        sha256: "a".repeat(64),
        bytes: 100,
        contentType: "image/png",
        usage: {
          textInputTokens: 100,
          imageInputTokens: 0,
          outputTokens: 1372,
        },
        providerRequestId: "synthetic_only",
      };
    if (record && record.body.includes('"status":"generating"')) {
      await f.one("select public.rpg_frame_check_claim($1,$2,$3,$4,$5)", [
        f.owner,
        f.cid,
        record.id,
        record.current_version_id,
        o.sha256,
      ]);
      await f.one(
        "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb)",
        [
          f.owner,
          f.cid,
          record.id,
          record.current_version_id,
          o.sha256,
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
    const v = { ...g.v, status: "completed", resultAssetId: record.id },
      m = { ...realFrameDocumentMutation(s, v, record), requestId: record.id },
      a = {
        ...realFrameAssetMutation(s, record, g.v, o, record.id),
        requestId: record.current_version_id,
      };
    return { m, a, o };
  };
  f.unchanged = async () => ({
    runtime: await f.query(
      "select * from rpg_private.runtime_state where campaign_id=$1",
      [f.cid],
    ),
    world: await f.query(
      "select * from rpg_private.world_foundations where campaign_id=$1",
      [f.cid],
    ),
    events: await f.query(
      "select * from rpg_private.world_events where campaign_id=$1 order by sequence",
      [f.cid],
    ),
    entities: await f.query(
      "select * from public.rpg_entities where campaign_id=$1 order by id",
      [f.cid],
    ),
    items: await f.query(
      "select * from public.rpg_items where campaign_id=$1 order by id",
      [f.cid],
    ),
    private: await f.query(
      "select * from rpg_private.dm_state where campaign_id=$1",
      [f.cid],
    ),
    head: await f.basis(),
  });
  return f;
}
async function setup() {
  const f = await fixture(27);
  const w = await world(f);
  return tools({ ...f, ...w });
}

test("real FRAME SQL: queue/claim/atomic completion/replay preserve gameplay and Canon", async () => {
  const f = await setup();
  try {
    const before = await f.unchanged(),
      q = await f.queue();
    assert.deepEqual(await f.lifecycle(q.m), q.r);
    const g = await f.generating(q),
      claim = await f.claim(g.m);
    assert.equal(claim.claimed, true);
    assert.equal((await f.claim(g.m)).claimed, false);
    const x = await f.finish(g),
      done = await f.complete(x.m, x.a, x.o);
    assert.deepEqual(await f.complete(x.m, x.a, x.o), done);
    assert.equal((await f.snap()).assets.length, 1);
    assert.equal(
      (await f.query("select * from rpg_private.media_reservations")).length,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select reserved_usd_micros from rpg_private.media_budgets where id=$1",
          [f.budget],
        )
      ).reserved_usd_micros,
      600000,
    );
    assert.deepEqual(await f.unchanged(), before);
    await assert.rejects(f.lifecycle(q.m, f.other), /rpg_forbidden/);
  } finally {
    await f.db.close();
  }
});
test("real FRAME SQL: stale reference/factual correction fails dispatch; no partial charge or asset", async () => {
  const f = await setup();
  try {
    const q = await f.queue(),
      g = await f.generating(q);
    await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Genuine correction",
        status: "canon",
        body: "Owner factual correction",
      },
      0,
      "campaign",
    );
    await assert.rejects(f.claim(g.m), /rpg_conflict/);
    assert.equal(
      (await f.query("select * from rpg_private.media_reservations")).length,
      0,
    );
    const cancelled = { ...q.v, status: "cancelled" },
      m = {
        ...realFrameDocumentMutation(await f.snap(), cancelled, q.record),
        requestId: randomUUID(),
      };
    await f.lifecycle(m);
    assert.equal((await f.snap()).assets.length, 0);
  } finally {
    await f.db.close();
  }
});
test("real FRAME SQL: forged prompt, private NPC/location references and generic prefix bypass fail", async () => {
  const f = await setup();
  try {
    const s = await f.snap(),
      v = buildRealFrame(s, [], "wide", model, parameters, await f.basis());
    await assert.rejects(
      f.lifecycle({
        ...realFrameDocumentMutation(s, {
          ...v,
          prompt: v.prompt + " PRIVATE_INJECTION",
        }),
        requestId: randomUUID(),
      }),
      /rpg_validation/,
    );
    const reference = {
      ...newVisualReference(s, { kind: "entity", id: f.npc }),
      approval: "approved",
    };
    const r = await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Private NPC appearance",
        status: "reference",
        body: serializeVisualMetadata(reference),
      },
      0,
      "campaign",
    );
    const d = (await f.snap()).documents.find((d) => d.id === r.id),
      forged = buildRealFrame(
        await f.snap(),
        [],
        "wide",
        model,
        parameters,
        await f.basis(),
      );
    forged.basis.references = [
      {
        documentId: d.id,
        versionId: d.current_version_id,
        subject: reference.subject,
        sourceRevision: reference.sourceRevision,
        imageAssetId: null,
        imageAssetRevision: null,
      },
    ];
    await assert.rejects(
      f.lifecycle({
        ...realFrameDocumentMutation(await f.snap(), forged),
        requestId: randomUUID(),
      }),
      /rpg_conflict|rpg_validation/,
    );
    const before = (await f.basis()).canonGeneration;
    await f.mutation(
      "document.save",
      f.cid,
      {
        title: "Ordinary correction with frame prefix",
        status: "reference",
        body: "RPG_VISUAL_FRAME_V0\n{}",
      },
      0,
      "campaign",
    );
    assert.equal((await f.basis()).canonGeneration, before + 1);
  } finally {
    await f.db.close();
  }
});
test("real FRAME SQL: terminal failure, uncertain cancellation and fresh retry keep previous asset and bounded reservations", async () => {
  const f = await setup();
  try {
    const q = await f.queue(),
      g = await f.generating(q);
    await f.claim(g.m);
    const x = await f.finish(g);
    await f.complete(x.m, x.a, x.o);
    const q2 = await f.queue(),
      g2 = await f.generating(q2);
    await f.claim(g2.m);
    const r = (await f.snap()).documents.find((d) => d.id === q2.r.id);
    const uncertain = { ...g2.v, status: "uncertain", failure: "uncertain" },
      u = {
        ...realFrameDocumentMutation(await f.snap(), uncertain, r),
        requestId: r.current_version_id,
      };
    await f.lifecycle(u);
    assert.deepEqual(
      await f.lifecycle(u),
      (
        await f.one("select public.rpg_mutation_receipt($1,$2::jsonb) v", [
          f.owner,
          JSON.stringify(u),
        ])
      ).v,
    );
    const ur = (await f.snap()).documents.find((d) => d.id === r.id);
    await f.lifecycle({
      ...realFrameDocumentMutation(
        await f.snap(),
        { ...uncertain, status: "cancelled", failure: null },
        ur,
      ),
      requestId: randomUUID(),
    });
    const q3 = await f.queue(),
      g3 = await f.generating(q3);
    await assert.rejects(f.claim(g3.m), /rpg_conflict/);
    assert.equal((await f.snap()).assets.length, 1);
    assert.equal(
      (await f.query("select * from rpg_private.media_reservations")).length,
      2,
    );
    const old = await f.finish(g2);
    await assert.rejects(f.complete(old.m, old.a, old.o), /rpg_validation/);
  } finally {
    await f.db.close();
  }
});
test("real FRAME SQL: stale head/timeline and malformed attachment cannot create partial assets", async () => {
  const f = await setup();
  try {
    const q = await f.queue(),
      g = await f.generating(q);
    await f.claim(g.m);
    const x = await f.finish(g);
    await assert.rejects(
      f.complete(x.m, { ...x.a, campaignId: randomUUID() }, x.o),
      /rpg_validation/,
    );
    assert.equal((await f.snap()).assets.length, 0);
    const save = await f.saves(
      f.cid,
      "create",
      await f.command(f.cid, { kind: "manual", name: "Changed head" }),
    );
    await assert.rejects(f.complete(x.m, x.a, x.o), /rpg_conflict/);
    assert.equal((await f.snap()).assets.length, 0);
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: save.saveId,
        label: "New branch",
        recovery: false,
      }),
    );
    await assert.rejects(f.claim(g.m), /rpg_conflict/);
  } finally {
    await f.db.close();
  }
});
test("real FRAME SQL: eligible Lab checkpoint still prepares an exact child after lifecycle", async () => {
  const f = await integrationFixture({
    beforeSave: async (base) => {
      for (const file of base.files.slice(16, 27))
        await base.db.exec(await readFile(new URL(file, base.folder), "utf8"));
    },
  });
  try {
    await tools(f);
    const approved = await f.approve(),
      raw = await f.store.prepare(approved.request),
      services = await f.services(),
      parent = await services.lab.perform({
        action: "continue",
        input: command(raw),
      });
    const selection = {
      sourceRunId: parent.id,
      sourceCheckpointId: parent.checkpoints.at(-1).id,
      expectedRevision: parent.revision,
    };
    const before = await f.unchanged();
    assert.ok(await f.lab("continuation_base", selection));
    const q = await f.queue(),
      g = await f.generating(q);
    await f.claim(g.m);
    const x = await f.finish(g);
    await f.complete(x.m, x.a, x.o);
    assert.deepEqual(await f.unchanged(), before);
    assert.ok(await f.lab("continuation_base", selection));
    const { createLabContinuationService } =
      await import("../src/lib/world-lab/continuation.ts");
    const continuation = createLabContinuationService({
      ownerId: f.owner,
      execute: f.rpc,
      library: services.library,
      lab: services.lab,
      language: "en",
      models: [
        {
          modelId: "gpt-6-astra",
          label: "Synthetic",
          reasoning: ["max"],
          available: true,
        },
      ],
      compose: async () => ({
        output: f.proposal,
        usage: {
          model: "gpt-6-astra",
          inputTokens: 1,
          outputTokens: 1,
          calls: 1,
          latencyMs: 1,
        },
      }),
    });
    const interpreted = await continuation.perform({
      action: "interpret",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source: selection,
        premise: "An owner-reviewed synthetic continuation.",
        model: {
          providerId: "openai",
          modelId: "gpt-6-astra",
          reasoning: "max",
        },
      },
    });
    const child = await continuation.perform({
      action: "approve",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        source: selection,
        versionId: interpreted.draft.versionId,
      },
    });
    assert.equal(child.run.status, "prepared");
  } finally {
    await f.db.close();
  }
});
