import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import {
  buildSubjectVisualJob,
  subjectVisualAssetMutation,
  subjectVisualDocumentMutation,
  parseSubjectVisualJob,
} from "../src/lib/visual-frame/subject-job.ts";
import { visualDocuments } from "../src/lib/visual-frame/model.ts";

const model = "gpt-image-2.5-sunburst-2026-09-08";
const parameters = {
  size: "1536x1024",
  quality: "high",
  outputFormat: "png",
  n: 1,
};
const call = (f, sql, args) => f.one(sql, args).then((row) => row.result);

test("migration 40 installs additive subject visuals after migration 38", async () => {
  const f = await fixture(39);
  try {
    const rows = await f.query(
      "select proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and proname like 'rpg_subject_visual_%' order by proname",
    );
    assert.deepEqual(
      rows.map((row) => row.proname),
      [
        "rpg_subject_visual_claim",
        "rpg_subject_visual_complete",
        "rpg_subject_visual_draft",
        "rpg_subject_visual_draft_pixels",
        "rpg_subject_visual_lifecycle",
        "rpg_subject_visual_recovery_receipt",
      ],
    );
    for (const signature of [
      "rpg_subject_visual_lifecycle(uuid,jsonb)",
      "rpg_subject_visual_claim(uuid,jsonb,uuid)",
      "rpg_subject_visual_draft(uuid,jsonb,jsonb)",
      "rpg_subject_visual_complete(uuid,jsonb,jsonb,jsonb)",
    ]) {
      const grant = await f.one(
        "select has_function_privilege('authenticated',$1,'EXECUTE') as browser, has_function_privilege('service_role',$1,'EXECUTE') as server",
        [`public.${signature}`],
      );
      assert.equal(grant.browser, false);
      assert.equal(grant.server, true);
    }
  } finally {
    await f.db.close();
  }
});

test("standalone subject job uses the existing budget, paid review and draft acceptance path", async () => {
  const f = await fixture(39);
  try {
    const w = await world(f);
    const budget = randomUUID();
    await f.one("select public.rpg_media_budget_prepare($1,$2,$3,1200000,2)", [
      f.owner,
      budget,
      model,
    ]);
    const snapshot = () => f.saves(w.cid, "campaign");
    const source = async () =>
      call(f, "select public.rpg_frame_basis($1,$2,$3::jsonb) result", [
        f.owner,
        w.cid,
        JSON.stringify(await f.fence(w.cid)),
      ]);
    const first = await snapshot();
    const queued = buildSubjectVisualJob(
      first,
      { kind: "entity", id: w.hero },
      [],
      model,
      parameters,
      await source(),
    );
    const queue = {
      ...subjectVisualDocumentMutation(first, queued),
      requestId: randomUUID(),
    };
    const created = await call(
      f,
      "select public.rpg_subject_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify(queue)],
    );
    const saved = await snapshot();
    const record = saved.documents.find((row) => row.id === created.id);
    assert.equal(parseSubjectVisualJob(record).status, "queued");
    const generating = {
      ...queued,
      status: "generating",
      dispatch: { requestId: randomUUID(), reservationUsdMicros: 400000 },
    };
    const dispatch = {
      ...subjectVisualDocumentMutation(saved, generating, record),
      requestId: generating.dispatch.requestId,
    };
    const claim = await call(f, "select public.rpg_subject_visual_claim($1,$2::jsonb,$3) result", [
      f.owner,
      JSON.stringify(dispatch),
      budget,
    ]);
    assert.equal(claim.claimed, true);
    const replay = await call(f, "select public.rpg_subject_visual_claim($1,$2::jsonb,$3) result", [
      f.owner, JSON.stringify(dispatch), budget,
    ]);
    assert.equal(replay.claimed, false);
    assert.deepEqual(replay.result, claim.result);
    const active = await snapshot();
    const activeRecord = active.documents.find((row) => row.id === created.id);
    const output = {
      storagePath: `${w.cid}/frames/${created.id}/output.png`,
      sha256: "a".repeat(64),
      bytes: 100,
      contentType: "image/png",
      usage: { textInputTokens: 100, imageInputTokens: 0, outputTokens: 1372 },
      providerRequestId: "synthetic_only",
    };
    await call(f, "select public.rpg_frame_check_claim($1,$2,$3,$4,$5) result", [
      f.owner,
      w.cid,
      created.id,
      activeRecord.current_version_id,
      output.sha256,
    ]);
    await call(
      f,
      "select public.rpg_frame_check_complete($1,$2,$3,$4,$5,$6::jsonb) result",
      [
        f.owner,
        w.cid,
        created.id,
        activeRecord.current_version_id,
        output.sha256,
        JSON.stringify({
          schemaVersion: 2,
          verdict: { schemaVersion: 2, status: "safe_to_review", reasons: [] },
          actualModel: "gpt-5.4",
          inputTokens: 100,
          outputTokens: 100,
          latencyMs: 100,
        }),
      ],
    );
    const draft = {
      ...generating,
      status: "draft",
      review: { status: "safe_to_review", imageSha256: output.sha256 },
    };
    const premature = { ...draft, status: "completed", resultAssetId: created.id };
    const prematureRequest = randomUUID();
    await assert.rejects(call(f,
      "select public.rpg_subject_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
      [f.owner,
        JSON.stringify({
          ...subjectVisualDocumentMutation(active, premature, activeRecord),
          requestId: prematureRequest,
        }),
        JSON.stringify({
          ...subjectVisualAssetMutation(active, activeRecord, premature, output, prematureRequest),
          requestId: activeRecord.current_version_id,
        }),
        JSON.stringify(output)],
    ));
    assert.equal((await snapshot()).assets.some((row) => row.id === created.id), false);
    const draftMutation = {
      ...subjectVisualDocumentMutation(active, draft, activeRecord),
      requestId: created.id,
    };
    await call(
      f,
      "select public.rpg_subject_visual_draft($1,$2::jsonb,$3::jsonb) result",
      [f.owner, JSON.stringify(draftMutation), JSON.stringify(output)],
    );
    const beforeAccept = await snapshot();
    const draftRecord = beforeAccept.documents.find((row) => row.id === created.id);
    assert.equal(parseSubjectVisualJob(draftRecord).status, "draft");
    assert.equal(beforeAccept.assets.find((asset) => asset.id === created.id), undefined);
    const approved = { ...draft, status: "completed", resultAssetId: created.id };
    const approvalRequestId = randomUUID();
    const acceptMutation = {
      ...subjectVisualDocumentMutation(beforeAccept, approved, draftRecord),
      requestId: approvalRequestId,
    };
    const asset = {
      ...subjectVisualAssetMutation(
        beforeAccept,
        draftRecord,
        approved,
        output,
        approvalRequestId,
      ),
      requestId: draftRecord.current_version_id,
    };
    await call(
      f,
      "select public.rpg_subject_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
      [f.owner, JSON.stringify(acceptMutation), JSON.stringify(asset), JSON.stringify(output)],
    );
    const completed = await snapshot();
    assert.equal(
      parseSubjectVisualJob(completed.documents.find((row) => row.id === created.id)).status,
      "completed",
    );
    assert.ok(completed.assets.some((row) => row.id === created.id));
    assert.equal(visualDocuments(completed).filter(({ value }) => value.kind === "reference").length, 0);
    const acceptedReplay = await call(
      f,
      "select public.rpg_subject_visual_complete($1,$2::jsonb,$3::jsonb,$4::jsonb) result",
      [f.owner, JSON.stringify(acceptMutation), JSON.stringify(asset), JSON.stringify(output)],
    );
    assert.equal(acceptedReplay.id, created.id);
  } finally {
    await f.db.close();
  }
});

test("subject jobs reject stale subjects, stale timelines and cross-campaign adoption without changed rows", async () => {
  const f = await fixture(39);
  try {
    const w = await world(f);
    const snapshot = await f.saves(w.cid, "campaign");
    const source = await call(f, "select public.rpg_frame_basis($1,$2,$3::jsonb) result", [
      f.owner, w.cid, JSON.stringify(await f.fence(w.cid)),
    ]);
    const job = buildSubjectVisualJob(snapshot, { kind: "entity", id: w.hero }, [], model, parameters, source);
    const queue = {
      ...subjectVisualDocumentMutation(snapshot, job), requestId: randomUUID(),
    };
    const count = async () => (await f.one(
      "select count(*)::integer n from public.rpg_documents where campaign_id=$1 and body like 'RPG_VISUAL_FRAME_V0%'",
      [w.cid],
    )).n;
    const before = await count();
    const staleTimeline = {
      ...queue,
      timeline: { ...queue.timeline, epoch: queue.timeline.epoch + 1 },
    };
    await assert.rejects(call(f,
      "select public.rpg_subject_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify(staleTimeline)],
    ));
    assert.equal(await count(), before);
    const foreign = await world(f, "Other synthetic campaign");
    await assert.rejects(call(f,
      "select public.rpg_subject_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify({ ...queue, campaignId: foreign.cid, timeline: await f.fence(foreign.cid) })],
    ));
    assert.equal(await count(), before);
    await f.one("update public.rpg_entities set revision=revision+1 where campaign_id=$1 and id=$2 returning id", [w.cid, w.hero]);
    await assert.rejects(call(f,
      "select public.rpg_subject_visual_lifecycle($1,$2::jsonb) result",
      [f.owner, JSON.stringify(queue)],
    ));
    assert.equal(await count(), before);
  } finally {
    await f.db.close();
  }
});
