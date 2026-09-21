import test from "node:test";
import assert from "node:assert/strict";
import { labFixture } from "./d1-sql-fixture.mjs";
import { randomUUID } from "node:crypto";
import { createLabService } from "../src/lib/world-lab/service.ts";
import { buildLabWorldInput } from "../src/lib/world-lab/runtime.ts";
import { buildDetachedWorldCommit } from "../src/lib/world-lab/writer.ts";
import { createDetachedRunFence } from "../src/lib/saves/detached-fence.ts";

test("D1 SQL preparation pins an exact detached base without active mutation", async () => {
  const f = await labFixture();
  try {
    const before = await f.active();
    const run = await f.store.prepare(f.request);
    assert.equal(run.status, "prepared");
    assert.equal(run.headRevision, 0);
    assert.deepEqual(await f.active(), before);
    assert.deepEqual(await f.store.prepare(f.request), run);
    const state = await f.store.readDetached(f.cid, run.id);
    assert.equal(state.manifest.schemaVersion, 3);
    assert.equal(state.manifest.runId, run.id);
    assert.deepEqual(
      state.records["public.rpg_items"],
      before.projection["public.rpg_items"].map((r) => r.row),
    );
    assert.equal(
      (await f.saves(f.cid, "read")).timelines.some(
        (t) => t.id === run.timelineId,
      ),
      false,
    );
  } finally {
    await f.db.close();
  }
});

test("D1 service proves two coherent detached continuations, original retry checkpoint and unchanged live state", async () => {
  const f = await labFixture();
  try {
    const before = await f.active(),
      service = createLabService(f.owner, f.rpc);
    const prepared = await service.perform({
      action: "prepare",
      input: f.request,
    });
    const command = (run) => ({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: run.id,
      expectedRevision: run.revision,
    });
    const firstRequest = { action: "continue", input: command(prepared) };
    const first = await service.perform(firstRequest);
    assert.equal(first.currentWorldMinutes, 60);
    assert.equal(first.checkpoints.length, 2);
    assert.deepEqual(
      first.checkpoints.flatMap((c) => c.events.map((e) => e.text)),
      ["Nera rings the harbor bell."],
    );
    const second = await service.perform({
      action: "continue",
      input: command(first),
    });
    assert.equal(second.currentWorldMinutes, 120);
    assert.equal(second.status, "completed");
    assert.equal(second.checkpoints.length, 3);
    const retried = await service.perform(firstRequest);
    assert.deepEqual(retried, first);
    const restored = await service.readRun(f.cid, prepared.id);
    assert.deepEqual(restored, second);
    assert.deepEqual(
      await service.perform({ action: "prepare", input: f.request }),
      prepared,
    );
    const catalog = await service.catalog(f.cid);
    assert.doesNotMatch(
      JSON.stringify(catalog),
      /PRIVATE_|sourceVersionIds|inputDigest|leaseGeneration|effectiveGuidance/,
    );
    assert.deepEqual(await f.active(), before);
    const detached = await f.store.readDetached(f.cid, prepared.id);
    assert.equal(
      detached.records["rpg_private.world_foundations"][0].world.threads[0]
        .status,
      "resolved",
    );
  } finally {
    await f.db.close();
  }
});

test("D1 service recovers a committed lost response without recomputation or duplicate time", async () => {
  const f = await labFixture();
  try {
    let lose = true;
    const unreliable = async (args) => {
      const result = await f.rpc(args);
      if (args.p_action === "commit" && !result.error && lose) {
        lose = false;
        throw new Error("PRIVATE_CONNECTION_DETAIL");
      }
      return result;
    };
    const service = createLabService(f.owner, unreliable),
      run = await service.perform({ action: "prepare", input: f.request });
    const request = {
      action: "continue",
      input: {
        operationId: randomUUID(),
        campaignId: f.cid,
        runId: run.id,
        expectedRevision: run.revision,
      },
    };
    await assert.rejects(
      () => service.perform(request),
      (error) => !error.message.includes("PRIVATE_CONNECTION_DETAIL"),
    );
    const recovered = await createLabService(f.owner, f.rpc).perform(request);
    assert.equal(recovered.currentWorldMinutes, 60);
    assert.equal(recovered.checkpoints.length, 2);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_lab_commands where stage='commit'",
        )
      ).n,
      1,
    );
  } finally {
    await f.db.close();
  }
});

test("D1 explicit no-op retains the exact checkpoint and fictional time", async () => {
  const f = await labFixture();
  try {
    let run = await f.store.prepare(f.request);
    run = await f.store.claim({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: run.id,
      expectedRevision: run.revision,
    });
    const state = await f.store.readDetached(f.cid, run.id),
      operationId = randomUUID();
    const input = {
      state,
      fence: createDetachedRunFence(run),
      operationId,
      throughWorldMinutes: run.currentWorldMinutes,
      worldInput: buildLabWorldInput(
        state,
        operationId,
        run.currentWorldMinutes,
        "none",
      ),
    };
    const commit = buildDetachedWorldCommit(input);
    assert.equal(commit.kind, "noop");
    assert.deepEqual(commit.writes, []);
    const before = await f.one(
      "select (select count(*) from rpg_private.timeline_manifests)::integer manifests,(select count(*) from rpg_private.timeline_versions)::integer versions",
    );
    const result = await f.lab("commit", commit);
    assert.equal(result.committed, false);
    assert.equal(result.run.headManifestId, run.headManifestId);
    assert.equal(result.run.currentWorldMinutes, 0);
    assert.deepEqual(
      await f.one(
        "select (select count(*) from rpg_private.timeline_manifests)::integer manifests,(select count(*) from rpg_private.timeline_versions)::integer versions",
      ),
      before,
    );
    assert.deepEqual(await f.lab("commit", commit), result);
  } finally {
    await f.db.close();
  }
});
