import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  qaFixture,
  running,
  commitPlan,
  liveProjection,
  vaultState,
  seedWave4,
  moduleFromSource,
} from "./d1-qa-fixture.mjs";

test("D1 QA actual SQL commits preserve every live family, sibling branch and Wave 4 row", async () => {
  const f = await qaFixture();
  try {
    await seedWave4(f);
    const before = await liveProjection(f);
    const a = await running(f);
    const b = await running(f, {
      ...f.request,
      operationId: randomUUID(),
      label: "Independent sibling",
    });
    const sibling = await f.lab("read_detached", { runId: b.id });
    const first = await commitPlan(f, a);
    const result = await f.lab("commit", first.plan);
    const after = await f.store.readDetached(f.cid, a.id);
    assert.equal(result.run.currentWorldMinutes, 30);
    assert.equal(result.run.headRevision, 1);
    assert.deepEqual(await liveProjection(f), before);
    assert.deepEqual(await f.lab("read_detached", { runId: b.id }), sibling);
    for (const table of [
      "public.rpg_entities",
      "public.rpg_items",
      "public.rpg_storages",
      "rpg_private.dm_state",
      "rpg_private.turns",
      "rpg_private.runtime_commands",
    ])
      assert.deepEqual(after.records[table], first.state.records[table], table);
    assert.deepEqual(
      after.records["rpg_private.world_foundations"][0].loop_state,
      first.state.records["rpg_private.world_foundations"][0].loop_state,
    );
    assert.equal(
      after.records["rpg_private.world_foundations"][0].loop_state.rewards
        .length,
      1,
    );
    assert.equal(
      after.records["rpg_private.world_foundations"][0].loop_state.currencies
        .length,
      1,
    );
    assert.ok(
      after.records["rpg_private.world_foundations"][0].loop_state.progress
        .length,
    );
    const history = await f.lab("read_detached", {
      runId: a.id,
      manifestId: first.state.manifest.id,
    });
    assert.deepEqual(history.versions, first.state.versions);
    assert.deepEqual(history.manifest, first.state.manifest);
  } finally {
    await f.db.close();
  }
});

test("D1 QA exact commit retries survive lost responses; racing stale heads roll back without vault debris", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f);
    const left = await commitPlan(f, run),
      right = await commitPlan(f, run);
    // PGlite serializes submitted SQL. This proves the losing CAS after both
    // callers read one head; it is not a claim about hosted parallel sessions.
    const race = await Promise.allSettled([
      f.lab("commit", left.plan),
      f.lab("commit", right.plan),
    ]);
    assert.equal(race.filter((r) => r.status === "fulfilled").length, 1);
    const winner = race[0].status === "fulfilled" ? left.plan : right.plan;
    const committed = race.find((r) => r.status === "fulfilled").value;
    const stable = await vaultState(f);
    assert.deepEqual(await f.lab("commit", winner), committed);
    assert.deepEqual(await vaultState(f), stable);
    await assert.rejects(() =>
      f.lab("commit", { ...winner, throughWorldMinutes: 31 }),
    );
    await assert.rejects(
      () => f.lab("commit", { ...winner, operationId: randomUUID() }),
      /rpg_conflict/,
    );
    assert.deepEqual(await vaultState(f), stable);
  } finally {
    await f.db.close();
  }
});

test("D1 QA lifecycle null revision, cancellation and lease replacement reject stale callbacks", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      old = await commitPlan(f, run);
    const before = await vaultState(f);
    await assert.rejects(() =>
      f.lab("cancel", {
        operationId: randomUUID(),
        campaignId: f.cid,
        runId: run.id,
        expectedRevision: null,
      }),
    );
    assert.deepEqual(await vaultState(f), before);
    const command = {
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: run.id,
      expectedRevision: run.revision,
    };
    const replaced = await f.store.resume(command);
    assert.equal(replaced.leaseGeneration, run.leaseGeneration + 1);
    assert.deepEqual(await f.store.resume(command), replaced);
    const stable = await vaultState(f);
    await assert.rejects(() => f.lab("commit", old.plan), /rpg_conflict/);
    assert.deepEqual(await vaultState(f), stable);
    const fresh = await commitPlan(f, replaced);
    const cancelled = await f.store.cancel({
      ...command,
      operationId: randomUUID(),
      expectedRevision: replaced.revision,
    });
    assert.equal(cancelled.status, "cancelled");
    const afterCancel = await vaultState(f);
    await assert.rejects(() => f.lab("commit", fresh.plan), /rpg_conflict/);
    assert.deepEqual(await vaultState(f), afterCancel);
  } finally {
    await f.db.close();
  }
});

test("D1 QA raw SQL trigger none cannot skip due deterministic work or advance fictional time", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      { state, plan } = await commitPlan(f, run);
    const runtime = state.versions.find(
      (row) => row.tableName === "rpg_private.runtime_state",
    );
    const forged = {
      ...plan,
      proof: { schemaVersion: 1, trigger: "none", settlement: null },
      writes: [
        {
          tableName: runtime.tableName,
          rowKey: runtime.rowKey,
          expectedVersionId: runtime.id,
          payload: {
            ...runtime.payload,
            world_minutes: 30,
            revision: runtime.payload.revision + 1,
          },
        },
      ],
    };
    const stable = await vaultState(f);
    await assert.rejects(() => f.lab("commit", forged));
    assert.deepEqual(await vaultState(f), stable);
  } finally {
    await f.db.close();
  }
});

test("D1 QA a real unchanged-time no-op appends no state version or checkpoint", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      { plan } = await commitPlan(f, run, 0);
    assert.equal(plan.kind, "noop");
    assert.deepEqual(plan.writes, []);
    const before = await vaultState(f),
      live = await liveProjection(f);
    const result = await f.lab("commit", plan);
    assert.equal(result.committed, false);
    assert.equal(result.run.currentWorldMinutes, 0);
    assert.equal(result.run.headManifestId, run.headManifestId);
    assert.equal(result.run.headRevision, run.headRevision);
    assert.equal(result.run.leaseGeneration, run.leaseGeneration);
    const after = await vaultState(f);
    assert.equal(after.versions, before.versions);
    assert.equal(after.manifests, before.manifests);
    assert.deepEqual(after.timelines, before.timelines);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(await f.lab("commit", plan), result);
    assert.deepEqual(await vaultState(f), after);
  } finally {
    await f.db.close();
  }
});

test("D1 QA live load/switch preserves detached permission but canon invalidation rejects pending writes", async () => {
  const f = await qaFixture();
  try {
    const run = await running(f),
      pending = await commitPlan(f, run);
    const oldLive = await f.fence(f.cid);
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: f.save.id,
        label: "QA playable fork",
        recovery: false,
      }),
    );
    await f.saves(
      f.cid,
      "switch",
      await f.command(f.cid, {
        timelineId: oldLive.timelineId,
        recovery: false,
      }),
    );
    assert.notEqual((await f.fence(f.cid)).epoch, oldLive.epoch);
    const before = await liveProjection(f);
    const committed = await f.lab("commit", pending.plan);
    assert.deepEqual(await liveProjection(f), before);
    const next = await commitPlan(f, committed.run, 90);
    await f.one(
      "update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=$1",
      [f.cid],
    );
    const stable = await vaultState(f);
    await assert.rejects(() => f.lab("commit", next.plan), /rpg_conflict/);
    assert.deepEqual(await vaultState(f), stable);
    const invalidated = await f.lab("read", { runId: run.id });
    assert.equal(invalidated.run.status, "paused");
    assert.equal(invalidated.run.reason, "source_changed");
    assert.equal(invalidated.run.inputDigest, run.inputDigest);
    assert.deepEqual(invalidated.run.input, run.input);
    assert.deepEqual(await f.lab("commit", pending.plan), committed);
  } finally {
    await f.db.close();
  }
});

test("D1 QA SQL rejects foreign owner/campaign/run/manifest references and simulation activation", async () => {
  const f = await qaFixture();
  try {
    const { world } = await moduleFromSource(
      "tests/phase35-storage-fixture.mjs",
    );
    const otherWorld = await world(f, "Other isolated campaign");
    const run = await running(f),
      { plan } = await commitPlan(f, run);
    const otherBefore = await liveProjection(f, otherWorld.cid),
      before = await liveProjection(f);
    const sibling = await running(f, {
      ...f.request,
      operationId: randomUUID(),
      label: "Sibling",
    });
    const stable = await vaultState(f);
    await assert.rejects(() => f.lab("read", { runId: run.id }, f.other));
    await assert.rejects(() =>
      f.lab("read", { runId: run.id }, f.owner, otherWorld.cid),
    );
    await assert.rejects(() =>
      f.lab("read_detached", {
        runId: sibling.id,
        manifestId: run.headManifestId,
      }),
    );
    await assert.rejects(() => f.lab("commit", plan, f.owner, otherWorld.cid));
    for (const key of [
      "ownerId",
      "campaignId",
      "runId",
      "timelineId",
      "manifestId",
      "scenarioVersionId",
      "divergenceVersionId",
    ])
      await assert.rejects(() =>
        f.lab("commit", {
          ...plan,
          fence: { ...plan.fence, [key]: randomUUID() },
        }),
      );
    await assert.rejects(async () =>
      f.saves(
        f.cid,
        "switch",
        await f.command(f.cid, { timelineId: run.timelineId, recovery: false }),
      ),
    );
    await assert.rejects(() =>
      f.one("select rpg_private.timeline_activate($1,$2,$3)", [
        f.cid,
        run.headManifestId,
        run.timelineId,
      ]),
    );
    assert.deepEqual(await vaultState(f), stable);
    assert.deepEqual(await liveProjection(f), before);
    assert.deepEqual(await liveProjection(f, otherWorld.cid), otherBefore);
    assert.equal(
      (await f.saves(f.cid, "read")).timelines.some(
        (row) => row.id === run.timelineId || row.id === sibling.timelineId,
      ),
      false,
    );
  } finally {
    await f.db.close();
  }
});
