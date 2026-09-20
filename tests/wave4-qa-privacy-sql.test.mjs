import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { commerceFixture, moduleFromSource } from "./wave4-qa-fixture.mjs";
const { foundationLoopProjection } = await moduleFromSource(
  "foundation-loop/projection.ts",
);

async function markPrivate(f) {
  // Synthetic authoritative private state. No public API accepts visibility
  // promotion or a generated private-state patch.
  await f.one(
    "update rpg_private.world_foundations set loop_state=jsonb_set(loop_state,'{itemPolicies,0,visibility}','\"private\"') where campaign_id=$1",
    [f.cid],
  );
}

test("QA privacy SQL: hidden-policy stock is available only to the private loop reader, never RLS, campaign, runtime or public owner DTOs", async () => {
  const f = await commerceFixture();
  try {
    await markPrivate(f);
    const privateContext = await f.read();
    assert.ok(privateContext.snapshot.items.some((i) => i.id === f.stock));
    assert.equal(
      JSON.stringify(foundationLoopProjection(privateContext)).includes(
        f.stock,
      ),
      false,
    );
    const campaign = await f.saves(f.cid, "campaign");
    assert.equal(JSON.stringify(campaign).includes(f.stock), false);
    for (const mode of ["game", "companion", "mechanic"])
      assert.equal(
        JSON.stringify(
          (await f.memory(f.cid, "source", { mode })).snapshot,
        ).includes(f.stock),
        false,
        mode,
      );
    await f.db.exec("set role authenticated");
    try {
      assert.deepEqual(
        await f.query(
          "select id,name,quantity from public.rpg_items where campaign_id=$1 and id=$2",
          [f.cid, f.stock],
        ),
        [],
      );
      await assert.rejects(
        f.one(
          "select loop_state from rpg_private.world_foundations where campaign_id=$1",
          [f.cid],
        ),
        /permission denied/,
      );
      await assert.rejects(
        f.one("select public.rpg_world($1,$2,'loop_read','{}',$3::jsonb)", [
          f.owner,
          f.cid,
          JSON.stringify(privateContext.foundation.timeline),
        ]),
        /permission denied/,
      );
    } finally {
      await f.db.exec("reset role");
    }
    await f.db.exec("set role anon");
    try {
      await assert.rejects(
        f.one("select public.rpg_world($1,$2,'loop_read','{}',$3::jsonb)", [
          f.owner,
          f.cid,
          JSON.stringify(privateContext.foundation.timeline),
        ]),
        /permission denied/,
      );
    } finally {
      await f.db.exec("reset role");
    }
  } finally {
    await f.db.close();
  }
});

test("QA privacy SQL: public retrieval and referenced derivatives stop exposing stock after its policy becomes private", async () => {
  const f = await commerceFixture();
  try {
    const ref = (
      await f.one(
        "select rpg_private.memory_source_json(s,'public')->'ref' ref from rpg_private.memory_public_sources s where campaign_id=$1 and kind='item' and source_id=$2 and current limit 1",
        [f.cid, f.stock],
      )
    ).ref;
    const derivative = randomUUID();
    await f.one(
      "select rpg_private.memory_index($1,'event',$2,'1','QA lantern DERIVED_PRIVATE_STOCK_MARKER','public',null,'{}','{}','history','record')",
      [f.cid, derivative],
    );
    await f.one(
      "update rpg_private.memory_public_sources set source_refs=$3::jsonb where campaign_id=$1 and source_id=$2",
      [f.cid, derivative, JSON.stringify([ref])],
    );
    assert.equal(
      (
        await f.one(
          "select rpg_private.memory_refs_valid($1,$2::jsonb,'public') valid",
          [f.cid, JSON.stringify([ref])],
        )
      ).valid,
      true,
    );
    const search = () =>
      f.memory(f.cid, "search", {
        campaignId: f.cid,
        visibility: "public",
        actorIds: [],
        query: "QA lantern",
        entityIds: [],
        requiredSourceIds: [],
        worldMinutes: 0,
        historicalOnly: false,
        historicalComparison: false,
        maxBytes: 12000,
        maxExcerpts: 12,
      });
    assert.equal(JSON.stringify(await search()).includes(f.stock), true);
    await markPrivate(f);
    assert.equal(
      (
        await f.one(
          "select rpg_private.memory_refs_valid($1,$2::jsonb,'public') valid",
          [f.cid, JSON.stringify([ref])],
        )
      ).valid,
      false,
    );
    const result = JSON.stringify(await search());
    assert.equal(result.includes(f.stock), false);
    assert.equal(result.includes("DERIVED_PRIVATE_STOCK_MARKER"), false);
    assert.equal(
      JSON.stringify(
        await f.memory(f.cid, "context", {
          actorIds: [],
          includePrivate: false,
        }),
      ).includes("DERIVED_PRIVATE_STOCK_MARKER"),
      false,
    );
  } finally {
    await f.db.close();
  }
});

test("QA privacy SQL: undisclosed merchant Actor stock is excluded consistently from RLS, public campaign and memory", async () => {
  const f = await commerceFixture();
  try {
    const context = await f.read();
    context.world.actors.find((a) => a.id === f.merchant).publicName = null;
    await f.one(
      "update rpg_private.world_foundations set world=$2::jsonb where campaign_id=$1",
      [f.cid, JSON.stringify(context.world)],
    );
    const campaign = await f.saves(f.cid, "campaign");
    assert.equal(
      campaign.items.some((i) => i.id === f.stock),
      false,
      "Campaign endpoint exposes stock belonging to undisclosed Actor",
    );
    await f.db.exec("set role authenticated");
    try {
      assert.deepEqual(
        await f.query(
          "select id from public.rpg_items where campaign_id=$1 and id=$2",
          [f.cid, f.stock],
        ),
        [],
      );
    } finally {
      await f.db.exec("reset role");
    }
    const memory = await f.memory(f.cid, "search", {
      campaignId: f.cid,
      visibility: "public",
      actorIds: [],
      query: "QA lantern",
      entityIds: [],
      requiredSourceIds: [],
      worldMinutes: 0,
      historicalOnly: false,
      historicalComparison: false,
      maxBytes: 12000,
      maxExcerpts: 12,
    });
    assert.equal(JSON.stringify(memory.sources).includes(f.stock), false);
  } finally {
    await f.db.close();
  }
});

test("QA history SQL: public foundation history contains the latest twenty committed events in sequence order", async () => {
  const f = await commerceFixture();
  try {
    const context = await f.read(),
      parent = context.events[0].operationId;
    for (let n = 1; n <= 25; n += 1) {
      const id = randomUUID();
      const event = {
        schemaVersion: 1,
        id,
        campaignId: f.cid,
        originTimelineId: context.foundation.timeline.timelineId,
        operationId: parent,
        worldMinutes: 0,
        kind: "qa.synthetic.public",
        actorIds: [],
        threadIds: [],
        visibility: "public",
        text: `Synthetic public event ${n}`,
        evidence: [],
        payload: {},
      };
      await f.one(
        "insert into rpg_private.world_events(id,campaign_id,operation_id,event) values($1,$2,$3,$4::jsonb)",
        [id, f.cid, parent, JSON.stringify(event)],
      );
    }
    assert.deepEqual(
      foundationLoopProjection(await f.read()).history.map((e) => e.text),
      Array.from({ length: 20 }, (_, i) => `Synthetic public event ${i + 6}`),
    );
  } finally {
    await f.db.close();
  }
});
