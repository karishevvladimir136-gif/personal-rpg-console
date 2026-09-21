import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  moduleFromSource,
  applyMigrations,
  historySnapshot,
  assertHistoryPreserved,
} from "./d2a-qa-fixture.mjs";

for (const prefix of [7, 9, 10, 11, 12, 13]) {
  test(`D2A QA populated historical prefix ${prefix} preserves old rows and loadable saves through migration 15`, async () => {
    const { fixture, world } = await moduleFromSource(
      "tests/phase35-storage-fixture.mjs",
    );
    const f = await fixture(prefix);
    try {
      const fencedRuntime = f.runtime;
      if (prefix === 7)
        f.runtime = async (cid, action, payload = {}) =>
          (
            await f.one(
              "select public.rpg_runtime($1,$2,$3,$4::jsonb) result",
              [f.owner, cid, action, JSON.stringify(payload)],
            )
          ).result;
      const w = await world(f, `D2A QA historical ${prefix}`);
      f.runtime = fencedRuntime;
      if (prefix >= 10)
        await f.one(
          "insert into rpg_private.world_foundations(campaign_id) values($1)",
          [w.cid],
        );
      const core = async () =>
        f.one(
          `select
        (select jsonb_agg(to_jsonb(e) order by e.id) from public.rpg_entities e where campaign_id=$1) entities,
        (select jsonb_agg(to_jsonb(i) order by i.id) from public.rpg_items i where campaign_id=$1) inventory,
        (select contents from rpg_private.dm_state where campaign_id=$1) private`,
          [w.cid],
        );
      const before = await core();
      let save = null,
        history = null;
      if (prefix >= 9) {
        save = await f.saves(
          w.cid,
          "create",
          await f.command(w.cid, {
            kind: "manual",
            name: `D2A QA prefix ${prefix}`,
          }),
        );
        history = await historySnapshot(f, w.cid);
      }
      await applyMigrations(f, prefix);
      assert.deepEqual(await core(), before);
      if (save) {
        assert.deepEqual(await historySnapshot(f, w.cid), history);
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: save.saveId,
            label: "D2A QA legacy read",
            recovery: false,
          }),
        );
        assert.deepEqual(await core(), before);
        await assertHistoryPreserved(f, w.cid, history);
      }
      assert.ok((await f.saves(w.cid, "read")).timelines.length > 0);
      assert.equal(
        (
          await f.one(
            "select count(*)::int n from rpg_private.world_lab_runs where campaign_id=$1",
            [w.cid],
          )
        ).n,
        0,
      );
    } finally {
      await f.db.close();
    }
  });
}

test("D2A QA migration preserves D1 immutable inputs, receipts, full Wave 4 state and exact result replay", async () => {
  const { labFixture } = await moduleFromSource("tests/d1-sql-fixture.mjs");
  const { seedWave4, liveProjection, running, commitPlan } =
    await moduleFromSource("tests/d1-qa-fixture.mjs");
  const f = await labFixture();
  try {
    await seedWave4(f);
    const command = { operationId: randomUUID(), campaignId: f.cid };
    const run = await running(f);
    const prepared = await commitPlan(f, run, 30, command.operationId);
    const committed = await f.lab("commit", prepared.plan);
    const history = await historySnapshot(f, f.cid);
    const live = await liveProjection(f);
    const ledger = async () =>
      f.one(
        `select
      (select jsonb_agg(to_jsonb(r) order by r.id) from rpg_private.world_lab_runs r where campaign_id=$1) runs,
      (select jsonb_agg(to_jsonb(c) order by c.operation_id,c.stage) from rpg_private.world_lab_commands c where campaign_id=$1) commands`,
        [f.cid],
      );
    const before = await ledger();
    await applyMigrations(f, 14);
    assert.deepEqual(await historySnapshot(f, f.cid), history);
    assert.deepEqual(await ledger(), before);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(await f.lab("commit", prepared.plan), committed);
    assert.deepEqual(await historySnapshot(f, f.cid), history);
    const detached = await f.store.readDetached(f.cid, run.id);
    assert.deepEqual(
      detached.records["rpg_private.world_foundations"][0].loop_state,
      prepared.state.records["rpg_private.world_foundations"][0].loop_state,
    );
    const resumed = await f.store.claim({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: run.id,
      expectedRevision: committed.run.revision,
    });
    const next = await commitPlan(f, resumed, 60);
    await f.lab("commit", next.plan);
    assert.deepEqual(await liveProjection(f), live);
    await assertHistoryPreserved(f, f.cid, history);
  } finally {
    await f.db.close();
  }
});
