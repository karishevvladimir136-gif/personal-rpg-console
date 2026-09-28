import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { integrationFixture, command } from "./d2a-integration-fixture.mjs";
import { fixture } from "./phase35-storage-fixture.mjs";
import { readDetachedState } from "../src/lib/saves/detached-reader.ts";
import { buildCompositionBasis } from "../src/lib/world-lab/composition.ts";

const migration = new URL(
  "../supabase/migrations/202609270021_v1_checkpoint_continuation.sql",
  import.meta.url,
);

test("V1 migration preserves populated exact checkpoints and continuation inputs without active mutation", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("UNEXPECTED_NETWORK");
  });
  const f = await integrationFixture({ withFoundationDefinitions: true });
  try {
    const approved = await f.approve();
    const parent = await f.store.prepare(approved.request);
    const live = await f.active();
    const before = await f.store.readDetached(f.cid, parent.id);
    await f.db.exec(await readFile(migration, "utf8"));
    assert.deepEqual(await f.store.readDetached(f.cid, parent.id), before);
    const { lab } = await f.services();
    const advanced = await lab.perform({
      action: "continue",
      input: command(parent),
    });
    assert.equal(advanced.currentWorldMinutes, 60);
    const selection = {
      sourceRunId: parent.id,
      sourceCheckpointId: advanced.checkpoints.at(-1).id,
      expectedRevision: advanced.revision,
    };
    const raw = await f.lab("continuation_base", selection);
    const state = readDetachedState(raw.state, {
      ownerId: f.owner,
      campaignId: f.cid,
      runId: parent.id,
    });
    const basis = buildCompositionBasis({ ...raw, state });
    assert.equal(basis.basis.startWorldMinutes, 60);
    assert.equal(basis.basis.baseManifestId, advanced.checkpoints.at(-1).id);
    assert.equal(basis.basis.saveId, f.save.id);
    assert.deepEqual(basis.basis.continuation, raw.continuation);
    const item = state.records["public.rpg_items"].find(
      (i) => i.id === f.supplies,
    );
    assert.equal(item.quantity, 8);
    assert.deepEqual(
      state.records["rpg_private.world_foundations"][0].loop_state,
      before.records["rpg_private.world_foundations"][0].loop_state,
    );
    assert.deepEqual(await f.active(), live);
    await assert.rejects(
      f.lab("continuation_base", {
        ...selection,
        expectedRevision: parent.revision,
      }),
      /rpg_conflict/,
    );
    await assert.rejects(
      f.lab("continuation_base", {
        ...selection,
        sourceCheckpointId: f.save.manifest_id,
      }),
      /rpg_not_found/,
    );
    await assert.rejects(
      f.lab("continuation_base", {
        ...selection,
        manifestId: advanced.checkpoints.at(-1).id,
      }),
      /rpg_validation/,
    );
    await assert.rejects(
      f.lab("continuation_base", selection, f.other),
      /rpg_forbidden/,
    );
    const snapshot = await f.active();
    await assert.rejects(
      f.lab("continuation_prepare", {
        request: {
          ...approved.request,
          sourceRunId: parent.id,
          sourceCheckpointId: advanced.checkpoints.at(-1).id,
          expectedRevision: advanced.revision,
        },
        input: before.run.input,
        inputDigest: before.run.inputDigest,
      }),
      /rpg_validation/,
    );
    assert.deepEqual(await f.active(), snapshot);
  } finally {
    await f.db.close();
  }
});

test("V1 reference receipt lookup replays exact committed campaign corrections and rejects old timeline or request", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw Error("UNEXPECTED_NETWORK");
  });
  const f = await fixture();
  try {
    const cid = await f.campaign();
    const request = {
      requestId: randomUUID(),
      operation: "document.save",
      campaignId: cid,
      expectedRevision: 0,
      payload: {
        title: "Owner reference",
        status: "reference",
        body: "Reference note only",
      },
      timeline: await f.fence(cid),
      correctionScope: "campaign",
    };
    const lookup = async (r = request, uid = f.owner) =>
      (
        await f.one("select public.rpg_mutation_receipt($1,$2::jsonb) result", [
          uid,
          JSON.stringify(r),
        ])
      ).result;
    assert.equal(await lookup(), null);
    const committed = (
      await f.one(
        "select public.rpg_apply_mutation($1,$2,$3,$4,$5::jsonb,$6::jsonb,$7) result",
        [
          request.requestId,
          request.operation,
          cid,
          request.expectedRevision,
          JSON.stringify(request.payload),
          JSON.stringify(request.timeline),
          request.correctionScope,
        ],
      )
    ).result;
    const active = await f.one(
      "select to_jsonb(t) result from rpg_private.timeline_campaigns t where campaign_id=$1",
      [cid],
    );
    assert.deepEqual(await lookup(), committed);
    assert.deepEqual(await lookup(), committed);
    await assert.rejects(
      lookup({
        ...request,
        payload: { ...request.payload, body: "Different request" },
      }),
      /rpg_conflict/,
    );
    await assert.rejects(
      lookup({
        ...request,
        timeline: { ...request.timeline, epoch: request.timeline.epoch + 1 },
      }),
      /rpg_conflict/,
    );
    await assert.rejects(lookup(request, f.other), /rpg_forbidden/);
    assert.deepEqual(
      await f.one(
        "select to_jsonb(t) result from rpg_private.timeline_campaigns t where campaign_id=$1",
        [cid],
      ),
      active,
    );
    const rows = await f.query(
      "select p.proname, has_function_privilege('authenticated',p.oid,'execute') client from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('rpg_world_lab','rpg_mutation_receipt')",
    );
    assert.ok(rows.every((row) => row.client === false));
  } finally {
    await f.db.close();
  }
});
