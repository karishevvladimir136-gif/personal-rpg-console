import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { configuredWorld, stage } from "./wave1-integration-fixture.mjs";
import { makeSource, makePack } from "./wave1-library-fixtures.mjs";
import { createRpcLibraryStore } from "../src/lib/world-library/store.ts";
import { createOwnerLibraryAuthoring } from "../src/lib/world-library/authoring.ts";

// Read-only override lets isolated QA exercise the Lead's current additive SQL.
// Every database below is a fresh in-memory PGlite instance with synthetic data.
const migration12 =
  process.env.WAVE3_MIGRATION_SQL ??
  new URL(
    "../supabase/migrations/202609200012_production_wave3.sql",
    import.meta.url,
  );

async function upgradeFixture(cutoff) {
  const f = await fixture(cutoff);
  const call = async (name, args) => {
    try {
      return {
        data: (
          await f.one(
            `select public.${name}($1,$2,$3,$4::jsonb,$5::jsonb) result`,
            [
              args.p_owner_id,
              args.p_campaign_id,
              args.p_action,
              JSON.stringify(args.p_payload),
              args.p_timeline ? JSON.stringify(args.p_timeline) : null,
            ],
          )
        ).result,
      };
    } catch (error) {
      return { error: { message: error.message, code: error.code } };
    }
  };
  const rpc = (args) => call("rpg_world", args);
  const library = (args) => call("rpg_library", args);
  const read = async (cid) => {
    const result = await rpc({
      p_owner_id: f.owner,
      p_campaign_id: cid,
      p_action: "read",
      p_payload: {},
      p_timeline: await f.fence(cid),
    });
    assert.equal(result.error, undefined, JSON.stringify(result.error));
    return result.data;
  };
  const foundationCommand = async (cid, operationId = randomUUID()) => {
    const state = await read(cid);
    return {
      operationId,
      campaignId: cid,
      timeline: state.timeline,
      expectedRevision: state.revision,
      expectedRuntimeRevision: state.runtimeRevision,
      expectedHeadId: state.headId,
    };
  };
  const write = async (cid, action, payload) => {
    const command = await foundationCommand(cid);
    const result = await rpc({
      p_owner_id: f.owner,
      p_campaign_id: cid,
      p_action: action,
      p_payload: { command, ...payload },
      p_timeline: command.timeline,
    });
    assert.equal(result.error, undefined, JSON.stringify(result.error));
    return result.data;
  };
  const store = createRpcLibraryStore(f.owner, library);
  async function upgrade() {
    for (const filename of f.files.slice(cutoff, 11))
      await f.db.exec(await readFile(new URL(filename, f.folder), "utf8"));
    await f.db.exec(await readFile(migration12, "utf8"));
  }
  return {
    ...f,
    rpc,
    library,
    read,
    foundationCommand,
    write,
    store,
    upgrade,
    service: createOwnerLibraryAuthoring(f.owner, store),
  };
}

async function seedPinnedPack(f, cid) {
  const source = makeSource();
  source.ownerId = f.owner;
  const pack = makePack(source);
  pack.ownerId = f.owner;
  pack.body.approval.ownerId = f.owner;
  await f.store.put({ operationId: randomUUID(), record: source });
  await f.store.put({ operationId: randomUUID(), record: pack });
  const binding = {
    schemaVersion: 1,
    id: randomUUID(),
    ownerId: f.owner,
    campaignId: cid,
    packId: pack.id,
    packVersionId: pack.versionId,
    scenarioVersionId: null,
    sourceVersionIds: [source.versionId],
    sourcePriority: [source.versionId],
    entry: { label: "Synthetic dawn", worldMinutes: 0, evidence: [] },
    mappings: [
      { packEntityId: pack.body.entities[0].id, entityId: randomUUID() },
    ],
  };
  await f.write(cid, "bind", { binding });
  return { source, pack, binding };
}

async function history(f, cid) {
  const result = {};
  for (const table of [
    "timeline_versions",
    "timeline_manifests",
    "save_points",
  ])
    result[table] = await f.query(
      `select to_jsonb(row) data from rpg_private.${table} row where campaign_id=$1 order by id`,
      [cid],
    );
  return result;
}

async function premise(f, cid) {
  return (
    await f.one(
      "select public.rpg_campaign_premise($1,'read',$2::jsonb,$3::jsonb) result",
      [
        cid,
        JSON.stringify({ before: null }),
        JSON.stringify(await f.fence(cid)),
      ],
    )
  ).result;
}

async function assertEmptyPremise(f, cid) {
  const value = await premise(f, cid);
  assert.equal(value.revision, 0);
  assert.equal(value.current, null);
  assert.deepEqual(value.versions, []);
  assert.equal(value.olderThan, null);
  assert.deepEqual(value.timeline, await f.fence(cid));
}

for (const [label, cutoff, schema] of [
  ["legacy v1", 9, 1],
  ["Wave 1", 10, 2],
  ["Wave 2", 11, 2],
]) {
  test(`migration 12 upgrades populated ${label} saves without rewriting history, pins or ordinary documents`, async () => {
    const f = await upgradeFixture(cutoff);
    try {
      const w = await world(f, `Synthetic ${label} upgrade`);
      const document = await f.mutation(
        "document.save",
        w.cid,
        {
          title: "Synthetic reference",
          status: "reference",
          body: "  Original reference.\r\nСохранить точно.  ",
        },
        0,
        "campaign",
      );
      const firstDoc = await f.one(
        "select * from public.rpg_documents where campaign_id=$1 and id=$2",
        [w.cid, document.id],
      );
      await f.mutation(
        "document.save",
        w.cid,
        {
          id: document.id,
          title: firstDoc.title,
          status: "reference",
          body: firstDoc.body + "\nReviewed addition.",
        },
        firstDoc.revision,
        "campaign",
      );
      const pinned = cutoff >= 10 ? await seedPinnedPack(f, w.cid) : null;
      const beforePlay = await f.runtime(w.cid, "play");
      const beforeCampaign = await f.saves(w.cid, "campaign");
      const beforeDocs = await f.query(
        "select * from public.rpg_documents where campaign_id=$1 order by id",
        [w.cid],
      );
      const beforeVersions = await f.query(
        "select * from public.rpg_document_versions where campaign_id=$1 order by id",
        [w.cid],
      );
      const beforeLibrary = pinned
        ? await f.query(
            "select * from rpg_private.library_records order by version_id",
          )
        : [];
      const saved = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, {
          kind: "manual",
          name: `Before ${label} upgrade`,
        }),
      );
      const beforeHistory = await history(f, w.cid);
      const manifest = await f.one(
        "select m.* from rpg_private.timeline_manifests m join rpg_private.save_points s on s.manifest_id=m.id and s.campaign_id=m.campaign_id where s.id=$1",
        [saved.saveId],
      );
      assert.equal(manifest.schema_version, schema);
      if (cutoff === 9)
        assert.equal("rpg_private.world_foundations" in manifest.refs, false);
      await f.upgrade();
      assert.deepEqual(
        await history(f, w.cid),
        beforeHistory,
        "upgrade must not rewrite hashes, manifests or saved payloads",
      );
      await f.one("select rpg_private.timeline_validate($1,$2)", [
        w.cid,
        manifest.id,
      ]);
      assert.deepEqual(await f.runtime(w.cid, "play"), beforePlay);
      const upgradedDocs = await f.query(
        "select * from public.rpg_documents where campaign_id=$1 order by id",
        [w.cid],
      );
      assert.deepEqual(
        upgradedDocs.map(({ purpose, ...row }) => {
          assert.equal(purpose, "standard");
          return row;
        }),
        beforeDocs,
      );
      const upgradedVersions = await f.query(
        "select * from public.rpg_document_versions where campaign_id=$1 order by id",
        [w.cid],
      );
      assert.deepEqual(
        upgradedVersions.map(({ premise_metadata, ...row }) => {
          assert.equal(premise_metadata, null);
          return row;
        }),
        beforeVersions,
      );
      await assertEmptyPremise(f, w.cid);
      if (pinned) {
        assert.deepEqual(
          await f.query(
            "select * from rpg_private.library_records order by version_id",
          ),
          beforeLibrary,
        );
        assert.deepEqual((await f.read(w.cid)).bindings, [pinned.binding]);
        assert.deepEqual(
          await f.store.get("source", pinned.source.versionId),
          pinned.source,
        );
        assert.deepEqual(
          await f.store.get("pack", pinned.pack.versionId),
          pinned.pack,
        );
      }

      // A real activation proves old manifests remain loadable, not merely parseable.
      await f.one(
        "update public.rpg_entities set hp=2,revision=revision+1 where campaign_id=$1 and id=$2",
        [w.cid, w.hero],
      );
      await f.one(
        "update public.rpg_items set quantity=4,revision=revision+1 where campaign_id=$1 and id=$2",
        [w.cid, w.item],
      );
      const loaded = await f.saves(
        w.cid,
        "load",
        await f.command(w.cid, {
          saveId: saved.saveId,
          label: "After additive upgrade",
          recovery: false,
        }),
      );
      assert.equal(
        loaded.snapshot.timeline.epoch,
        beforePlay.timeline.epoch + 1,
      );
      assert.notEqual(loaded.timelineId, beforePlay.timeline.timelineId);
      const restored = await f.saves(w.cid, "campaign");
      for (const key of [
        "entities",
        "items",
        "quests",
        "scenes",
        "publicState",
      ])
        assert.deepEqual(restored[key], beforeCampaign[key], key);
      assert.equal(
        (await f.memory(w.cid, "source", { mode: "game" })).privateState.fact
          .secret,
        "PRIVATE_BEFORE_FORK",
      );
      assert.equal(
        (await f.runtime(w.cid, "play")).worldMinutes,
        beforePlay.worldMinutes,
      );
      if (pinned)
        assert.deepEqual((await f.read(w.cid)).bindings, [pinned.binding]);
      await assertEmptyPremise(f, w.cid);
      assert.deepEqual(
        await f.one(
          "select * from rpg_private.timeline_manifests where id=$1",
          [manifest.id],
        ),
        manifest,
      );
      await f.one("select rpg_private.timeline_validate($1,$2)", [
        w.cid,
        manifest.id,
      ]);
      await assert.rejects(
        f.one(
          "update rpg_private.timeline_manifests set schema_version=99 where id=$1",
          [manifest.id],
        ),
        /immutable/,
      );
    } finally {
      await f.db.close();
    }
  });
}

test("migration 12 preserves a Wave 2 staged turn and pinned Pack across load, explicit recovery and exactly-once settlement", async () => {
  const f = await upgradeFixture(11);
  try {
    const w = await configuredWorld(f);
    const pinned = await seedPinnedPack(f, w.cid);
    const pending = await stage(f, w);
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, {
        kind: "manual",
        name: "Synthetic staged Wave 2 action",
      }),
    );
    const originalStage = await f.one(
      "select * from rpg_private.world_stages where campaign_id=$1 and id=$2",
      [w.cid, pending.input.operationId],
    );
    const originalTurn = await f.one(
      "select * from rpg_private.turns where campaign_id=$1 and id=$2",
      [w.cid, pending.input.operationId],
    );
    const originalHistory = await history(f, w.cid);
    await f.upgrade();
    assert.deepEqual(
      await f.one(
        "select * from rpg_private.world_stages where campaign_id=$1 and id=$2",
        [w.cid, pending.input.operationId],
      ),
      originalStage,
    );
    assert.deepEqual(
      await f.one(
        "select * from rpg_private.turns where campaign_id=$1 and id=$2",
        [w.cid, pending.input.operationId],
      ),
      originalTurn,
    );
    assert.deepEqual(await history(f, w.cid), originalHistory);
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      0,
    );
    await assertEmptyPremise(f, w.cid);
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: saved.saveId,
        label: "Resumed old staged action",
        recovery: false,
      }),
    );
    assert.deepEqual((await f.read(w.cid)).bindings, [pinned.binding]);
    const claim = await f.runtime(w.cid, "claim", {
      operationId: pending.input.operationId,
    });
    assert.notEqual(claim.lease.token, pending.claim.lease.token);
    assert.notDeepEqual(claim.lease.timeline, pending.claim.lease.timeline);
    const command = await f.foundationCommand(w.cid, pending.input.operationId);
    const args = {
      p_owner_id: f.owner,
      p_campaign_id: w.cid,
      p_action: "recover",
      p_payload: { command, token: claim.lease.token },
      p_timeline: command.timeline,
    };
    const recovered = await f.rpc(args);
    assert.equal(recovered.error, undefined, JSON.stringify(recovered.error));
    assert.deepEqual(recovered.data.events, pending.proposal.settlement.events);
    assert.deepEqual(await f.rpc(args), recovered, "recovery is idempotent");
    assert.deepEqual(
      (
        await f.one(
          "select settlement from rpg_private.world_stages where campaign_id=$1 and id=$2",
          [w.cid, pending.input.operationId],
        )
      ).settlement,
      originalStage.settlement,
    );
    await f.runtime(w.cid, "checkpoint", {
      ...claim.lease,
      status: "generating",
      checkpoint: { ...claim.turn.checkpoint, worldSettlement: recovered.data },
    });
    const packet = { ...pending.packet, worldSettlement: recovered.data };
    const committed = await f.runtime(w.cid, "commit", {
      ...claim.lease,
      packet,
    });
    assert.equal(committed.status, "committed");
    await f.runtime(w.cid, "commit", { ...claim.lease, packet });
    assert.equal(
      (
        await f.one(
          "select count(*)::int n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      pending.proposal.settlement.events.length,
    );
    assert.equal((await f.read(w.cid)).world.threads[0].cursor, 1);
    assert.deepEqual((await f.read(w.cid)).bindings, [pinned.binding]);
    const stale = await f.rpc({
      ...args,
      p_timeline: pending.command.timeline,
      p_payload: { command: pending.command, token: pending.claim.lease.token },
    });
    assert.ok(
      stale.error,
      "old-epoch recovery cannot reactivate the stale lease",
    );
    const publicEvents = await f.query(
      "select text from rpg_private.memory_public_sources where campaign_id=$1 and kind='event'",
      [w.cid],
    );
    assert.ok(publicEvents.some((row) => row.text.includes("bell")));
    assert.ok(
      publicEvents.every((row) => !row.text.includes("PRIVATE_WAVE1_EVENT")),
    );
  } finally {
    await f.db.close();
  }
});
