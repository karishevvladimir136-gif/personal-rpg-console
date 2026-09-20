import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, setup, prepare, stage } from "./wave1-qa-storage-fixture.mjs";

const rows = async (f, cid) => ({
  foundation: await f.foundation(cid),
  events: await f.query(
    "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
    [cid],
  ),
  runtime: await f.one(
    "select revision,world_minutes from rpg_private.runtime_state where campaign_id=$1",
    [cid],
  ),
});

test("QA SQL service-only RPC permissions and cross-owner reads fail closed", async () => {
  const f = await fixture();
  try {
    const w = await setup(f);
    await assert.rejects(
      () => f.foundation(w.cid, "read", {}, f.other),
      /forbidden/,
    );
    await assert.rejects(() => f.library("read", {}, f.other), /forbidden/);
    for (const role of ["anon", "authenticated"]) {
      const access = await f.one(
        "select has_function_privilege($1,'public.rpg_world(uuid,uuid,text,jsonb,jsonb)','execute') world, has_function_privilege($1,'public.rpg_library(uuid,uuid,text,jsonb,jsonb)','execute') library",
        [role],
      );
      assert.deepEqual(access, { world: false, library: false });
    }
  } finally {
    await f.db.close();
  }
});

test("QA SQL staged settlement is invisible until atomic commit, malformed commit rolls back, duplicate retries do not duplicate events", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      before = await rows(f, w.cid),
      prepared = await prepare(f, w);
    assert.equal(prepared.result.status, "staged");
    const packet = await stage(f, w, prepared);
    assert.deepEqual(await rows(f, w.cid), before);
    await assert.rejects(() =>
      f.runtime(w.cid, "commit", {
        ...prepared.claim.lease,
        packet: { ...packet, guidanceProposal: { malformed: true } },
      }),
    );
    assert.deepEqual(await rows(f, w.cid), before);
    await f.runtime(w.cid, "commit", { ...prepared.claim.lease, packet });
    const after = await rows(f, w.cid);
    assert.equal(after.events.length, 2);
    assert.equal(after.runtime.world_minutes, 20);
    assert.equal(after.foundation.world.threads[0].cursor, 1);
    await f.runtime(w.cid, "commit", { ...prepared.claim.lease, packet });
    assert.deepEqual(await rows(f, w.cid), after);
    const visible = await f.runtime(w.cid, "play");
    assert.doesNotMatch(
      JSON.stringify(visible),
      /QA_PRIVATE|worldSettlement|sourceVersionIds|executionPolicy/,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL stale revision/head/fence rejects before staging and preserves all state", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      prepared = await prepare(f, w),
      before = await rows(f, w.cid);
    for (const patch of [
      { expectedRevision: prepared.command.expectedRevision + 1 },
      { expectedRuntimeRevision: prepared.command.expectedRuntimeRevision + 1 },
      { expectedHeadId: randomUUID() },
      {
        timeline: {
          ...prepared.command.timeline,
          epoch: prepared.command.timeline.epoch + 1,
        },
      },
      { campaignId: randomUUID() },
    ]) {
      const command = { ...prepared.command, ...patch },
        settlement = { ...prepared.result.settlement, ...patch };
      await assert.rejects(() =>
        f.foundation(w.cid, "stage", { command, settlement }),
      );
      assert.deepEqual(await rows(f, w.cid), before);
    }
    assert.equal(
      (await f.one("select count(*)::integer n from rpg_private.world_stages"))
        .n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense rejects a deadline event forged while Deadline Pressure is Off", async () => {
  const f = await fixture();
  try {
    const w = await setup(
      f,
      (state) => (state.policy.deadlinePressure = "off"),
    );
    const prepared = await prepare(
      f,
      w,
      (input) => (input.snapshot.world.policy.deadlinePressure = "normal"),
    );
    assert.equal(prepared.result.status, "staged");
    prepared.result.settlement.nextWorld.policy.deadlinePressure = "off";
    await assert.rejects(() =>
      f.foundation(w.cid, "stage", {
        command: prepared.command,
        settlement: prepared.result.settlement,
      }),
    );
    assert.equal(
      (await f.one("select count(*)::integer n from rpg_private.world_stages"))
        .n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL defense rejects autonomous decisions for a legacy player-kind entity outside controlled IDs", async () => {
  const f = await fixture();
  try {
    const w = await setup(f);
    await f.one("update public.rpg_entities set kind='player' where id=$1", [
      w.npc,
    ]);
    const prepared = await prepare(
      f,
      w,
      (input) =>
        (input.source.snapshot.entities.find((e) => e.id === w.npc).kind =
          "npc"),
    );
    assert.equal(prepared.result.status, "staged");
    await assert.rejects(() =>
      f.foundation(w.cid, "stage", {
        command: prepared.command,
        settlement: prepared.result.settlement,
      }),
    );
    assert.equal(
      (await f.one("select count(*)::integer n from rpg_private.world_events"))
        .n,
      0,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL public events cannot smuggle the ID of a private thread", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      prepared = await prepare(f, w);
    prepared.result.settlement.events.find(
      (e) => e.visibility === "public",
    ).threadIds = [w.state.threads[0].id];
    await assert.rejects(() =>
      f.foundation(w.cid, "stage", {
        command: prepared.command,
        settlement: prepared.result.settlement,
      }),
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL public observations must belong to the step actually settled, never a later unreached step", async () => {
  const f = await fixture();
  try {
    const w = await setup(f, (state) => {
      const future = structuredClone(state.threads[0].steps[0]);
      future.id = randomUUID();
      future.trigger.atWorldMinutes = 100;
      future.publicOutcome.text = "QA_UNREACHED_FUTURE_REVELATION";
      state.threads[0].steps.push(future);
    });
    const prepared = await prepare(f, w);
    prepared.result.settlement.events.find(
      (e) => e.visibility === "public",
    ).text = "QA_UNREACHED_FUTURE_REVELATION";
    await assert.rejects(() =>
      f.foundation(w.cid, "stage", {
        command: prepared.command,
        settlement: prepared.result.settlement,
      }),
    );
  } finally {
    await f.db.close();
  }
});
