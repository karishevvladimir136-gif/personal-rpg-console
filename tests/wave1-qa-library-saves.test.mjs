import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture, setup, prepare, stage } from "./wave1-qa-storage-fixture.mjs";
import {
  makeSource,
  makePack,
  evidence,
  entry,
} from "./wave1-library-fixtures.mjs";
import { buildCampaignBinding } from "../src/lib/world-packs/bindings.ts";
import { sha256 } from "../src/lib/world-library/parsers.ts";
import { resolveExecutionProfile } from "../src/lib/model-runtime/registry.ts";
import { world as oldWorld } from "./phase35-storage-fixture.mjs";

async function bindSource(f, w) {
  const source = { ...makeSource(), ownerId: f.owner };
  const pack = makePack(source);
  pack.ownerId = f.owner;
  pack.body.approval.ownerId = f.owner;
  await f.library("put", { operationId: randomUUID(), record: source });
  await f.library("put", { operationId: randomUUID(), record: pack });
  const binding = buildCampaignBinding({
    id: randomUUID(),
    ownerId: f.owner,
    campaignId: w.cid,
    pack,
    entry: entry(),
    sourcePriority: [source.versionId],
    allocateEntityId: () => w.npc,
  });
  const command = await f.foundationCommand(w.cid);
  await f.foundation(w.cid, "bind", { command, binding });
  return { source, pack, binding };
}
const revisionOf = (source, text = "A corrected harbor.") => ({
  ...structuredClone(source),
  versionId: randomUUID(),
  version: source.version + 1,
  previousVersionId: source.versionId,
  body: {
    ...source.body,
    original: { kind: "text", text },
    digest: sha256(text),
  },
});
async function referencedWorld(f, w) {
  const refs = await bindSource(f, w),
    state = structuredClone(w.state);
  state.actors[0].knowledge = [
    evidence(refs.source, {
      visibility: "private",
      knowledge: "canon_at_entry",
    }),
  ];
  state.threads[0].steps[0].evidence = structuredClone(
    state.actors[0].knowledge,
  );
  state.threads[0].steps[0].publicOutcome.evidence = [evidence(refs.source)];
  await f.foundation(w.cid, "configure", {
    command: await f.foundationCommand(w.cid),
    world: state,
  });
  return refs;
}

test("QA SQL library versions are immutable and an idempotency key cannot change content or owner", async () => {
  const f = await fixture();
  try {
    const source = { ...makeSource(), ownerId: f.owner },
      operationId = randomUUID();
    const first = await f.library("put", { operationId, record: source });
    assert.deepEqual(
      await f.library("put", { operationId, record: source }),
      first,
    );
    await assert.rejects(() =>
      f.library("put", {
        operationId,
        record: { ...source, body: { ...source.body, title: "changed" } },
      }),
    );
    await assert.rejects(() =>
      f.library("put", {
        operationId: randomUUID(),
        record: { ...source, versionId: randomUUID(), ownerId: f.other },
      }),
    );
    await assert.rejects(() =>
      f.one(
        'update rpg_private.library_records set body=body||\'{"title":"changed"}\'::jsonb where version_id=$1',
        [source.versionId],
      ),
    );
    await assert.rejects(() =>
      f.one("delete from rpg_private.library_records where version_id=$1", [
        source.versionId,
      ]),
    );
    assert.equal(
      (await f.library("read", { id: source.id })).records.length,
      1,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL pack bindings preserve campaign instance identity across retry, same-campaign rebinding and foreign entity attacks", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      { binding } = await bindSource(f, w),
      foreign = await setup(f);
    const copy = {
      ...binding,
      id: randomUUID(),
      mappings: binding.mappings.map((m) => ({ ...m, entityId: randomUUID() })),
    };
    await assert.rejects(async () =>
      f.foundation(w.cid, "bind", {
        command: await f.foundationCommand(w.cid),
        binding: copy,
      }),
    );
    await assert.rejects(async () =>
      f.foundation(foreign.cid, "bind", {
        command: await f.foundationCommand(foreign.cid),
        binding: { ...binding, id: randomUUID(), campaignId: foreign.cid },
      }),
    );
    assert.equal((await f.foundation(w.cid)).bindings.length, 1);
    assert.equal((await f.foundation(foreign.cid)).bindings.length, 0);
  } finally {
    await f.db.close();
  }
});

test("QA SQL source corrections invalidate staged results while preserving pinned binding and sibling campaign", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      sibling = await setup(f),
      { source, binding } = await referencedWorld(f, w),
      siblingBefore = await f.foundation(sibling.cid);
    const prepared = await prepare(f, w),
      packet = await stage(f, w, prepared);
    await f.library("put", {
      operationId: randomUUID(),
      record: revisionOf(source),
    });
    await assert.rejects(() =>
      f.runtime(w.cid, "commit", { ...prepared.claim.lease, packet }),
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      0,
    );
    assert.deepEqual((await f.foundation(w.cid)).bindings, [binding]);
    assert.deepEqual(await f.foundation(sibling.cid), siblingBefore);
  } finally {
    await f.db.close();
  }
});

test("QA SQL source corrections invalidate both public and private derived event memory without rewriting committed events", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      { source } = await referencedWorld(f, w),
      prepared = await prepare(f, w),
      packet = await stage(f, w, prepared);
    await f.runtime(w.cid, "commit", { ...prepared.claim.lease, packet });
    const originals = await f.query(
      "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
      [w.cid],
    );
    assert.equal(originals.length, 2);
    for (const event of originals) {
      const table =
        event.event.visibility === "public"
          ? "memory_public_sources"
          : "memory_private_sources";
      const memory = await f.one(
        `select statement_kind from rpg_private.${table} where campaign_id=$1 and source_id=$2`,
        [w.cid, event.id],
      );
      assert.equal(memory.statement_kind, "record");
    }
    await f.library("put", {
      operationId: randomUUID(),
      record: revisionOf(source),
    });
    assert.deepEqual(
      await f.query(
        "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
        [w.cid],
      ),
      originals,
    );
    for (const event of originals) {
      for (const table of ["memory_public_sources", "memory_private_sources"]) {
        const active = await f.one(
          `select count(*)::integer n from rpg_private.${table} where campaign_id=$1 and source_id=$2 and current and status='valid'`,
          [w.cid, event.id],
        );
        assert.equal(
          active.n,
          0,
          table + " retained corrected " + event.event.visibility + " memory",
        );
      }
    }
  } finally {
    await f.db.close();
  }
});

test("QA SQL first leased pending turn can pin model policy before planning and later retries reuse that choice", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      snapshot = await f.foundation(w.cid),
      operationId = randomUUID();
    await f.runtime(w.cid, "begin", {
      operationId,
      campaignId: w.cid,
      expectedRevision: snapshot.runtimeRevision,
      mode: "game",
      input: "Wait.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    });
    const claim = await f.runtime(w.cid, "claim", { operationId });
    assert.equal(claim.turn.public.status, "pending");
    const profiles = Object.fromEntries(
      ["dm.plan", "dm.narrate"].map((task) => [
        task,
        resolveExecutionProfile({
          task,
          profileId: randomUUID(),
          globalDefault: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "xhigh",
          },
        }),
      ]),
    );
    const call = async (value) =>
      (
        await f.one(
          "select public.rpg_execution_profile($1,$2,$3,$4::jsonb,$5::jsonb,$6) result",
          [
            f.owner,
            w.cid,
            operationId,
            JSON.stringify(value),
            JSON.stringify(claim.lease.timeline),
            claim.lease.token,
          ],
        )
      ).result;
    assert.deepEqual(await call(profiles), profiles);
    const changed = structuredClone(profiles);
    changed["dm.plan"].modelId = "gpt-5.4";
    assert.deepEqual(await call(changed), profiles);
  } finally {
    await f.db.close();
  }
});

test("QA SQL v1 save remains loadable after migration, empties new foundation, preserves immutable old manifest and rejects old epoch", async () => {
  let legacy, saved, manifest;
  const f = await fixture(async (prior) => {
    legacy = await oldWorld(prior);
    saved = await prior.saves(
      legacy.cid,
      "create",
      await prior.command(legacy.cid, { kind: "manual", name: "QA legacy v1" }),
    );
    manifest = await prior.one(
      "select * from rpg_private.timeline_manifests where id=(select manifest_id from rpg_private.save_points where id=$1)",
      [saved.saveId],
    );
  });
  try {
    assert.equal(manifest.schema_version, 1);
    const beforeFence = await f.fence(legacy.cid);
    await f.foundation(legacy.cid, "configure", {
      command: await f.foundationCommand(legacy.cid),
      executionPolicy: {
        schemaVersion: 1,
        revision: 1,
        primary: null,
        taskOverrides: {},
      },
    });
    await f.saves(
      legacy.cid,
      "load",
      await f.command(legacy.cid, {
        saveId: saved.saveId,
        label: "QA restored",
        recovery: false,
      }),
    );
    const restored = await f.foundation(legacy.cid);
    assert.equal(restored.world, null);
    assert.deepEqual(restored.bindings, []);
    assert.equal(restored.executionPolicy, null);
    assert.ok(restored.timeline.epoch > beforeFence.epoch);
    await assert.rejects(
      () => f.foundation(legacy.cid, "read", {}, f.owner, beforeFence),
      /conflict/,
    );
    assert.deepEqual(
      await f.one("select * from rpg_private.timeline_manifests where id=$1", [
        manifest.id,
      ]),
      manifest,
    );
  } finally {
    await f.db.close();
  }
});

test("QA SQL v2 turn autosaves restore exact new event, stage, receipt and profile membership before Memory retrieval", async () => {
  const f = await fixture();
  try {
    const w = await setup(f, (state) => {
      const later = structuredClone(state.threads[0].steps[0]);
      later.id = randomUUID();
      later.trigger.atWorldMinutes = 40;
      later.privateText = "QA_ABANDONED_PRIVATE";
      later.publicOutcome.text = "QA_ABANDONED_PUBLIC";
      state.threads[0].steps.push(later);
    });
    await f.saves(
      w.cid,
      "policy",
      await f.command(w.cid, {
        policy: { autosave: "turn", retention: 10, loadMode: "unrestricted" },
      }),
    );
    const first = await prepare(f, w),
      firstPacket = await stage(f, w, first);
    const profiles = Object.fromEntries(
      ["dm.plan", "dm.narrate"].map((task) => [
        task,
        resolveExecutionProfile({
          task,
          profileId: randomUUID(),
          globalDefault: {
            providerId: "openai",
            modelId: "gpt-6-astra",
            reasoning: "xhigh",
          },
        }),
      ]),
    );
    await f.one(
      "select public.rpg_execution_profile($1,$2,$3,$4::jsonb,$5::jsonb,$6)",
      [
        f.owner,
        w.cid,
        first.command.operationId,
        JSON.stringify(profiles),
        JSON.stringify(first.command.timeline),
        first.claim.lease.token,
      ],
    );
    await f.runtime(w.cid, "commit", {
      ...first.claim.lease,
      packet: firstPacket,
    });
    const firstSave = await f.one(
      "select s.id,m.schema_version,m.refs from rpg_private.save_points s join rpg_private.timeline_manifests m on m.id=s.manifest_id where s.campaign_id=$1 and s.trigger_key=$2",
      [w.cid, "turn:" + first.command.operationId],
    );
    assert.equal(firstSave.schema_version, 2);
    for (const [family, count] of [
      ["world_events", 2],
      ["world_stages", 1],
      ["execution_profiles", 2],
    ])
      assert.equal(firstSave.refs["rpg_private." + family].length, count);
    const firstEvents = await f.query(
      "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
      [w.cid],
    );
    const second = await prepare(
        f,
        w,
        (input) => (input.resolution.worldMinutes = 50),
      ),
      secondPacket = await stage(f, w, second);
    await f.runtime(w.cid, "commit", {
      ...second.claim.lease,
      packet: secondPacket,
    });
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).n,
      4,
    );
    const oldFence = await f.fence(w.cid);
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: firstSave.id,
        label: "QA exact v2 restore",
        recovery: false,
      }),
    );
    assert.deepEqual(
      await f.query(
        "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
        [w.cid],
      ),
      firstEvents,
    );
    assert.equal((await f.foundation(w.cid)).world.threads[0].cursor, 1);
    assert.equal((await f.foundation(w.cid)).worldMinutes, 20);
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.execution_profiles where campaign_id=$1",
          [w.cid],
        )
      ).n,
      2,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).n,
      1,
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer n from rpg_private.world_commands where campaign_id=$1 and id=$2",
          [w.cid, second.command.operationId],
        )
      ).n,
      0,
    );
    const activeSources = await f.query(
      "select text from rpg_private.memory_public_sources where campaign_id=$1 and current and status='valid' union all select text from rpg_private.memory_private_sources where campaign_id=$1 and current and status='valid'",
      [w.cid],
    );
    assert.doesNotMatch(JSON.stringify(activeSources), /QA_ABANDONED/);
    await assert.rejects(
      () =>
        f.runtime(
          w.cid,
          "commit",
          { ...second.claim.lease, packet: secondPacket },
          oldFence,
        ),
      /conflict/,
    );
    const archived = await f.one(
      "select count(*)::integer n from rpg_private.timeline_versions where campaign_id=$1 and table_name='rpg_private.world_events'",
      [w.cid],
    );
    assert.equal(archived.n, 4);
  } finally {
    await f.db.close();
  }
});

test("QA SQL loading a pre-correction v2 save cannot revive corrected private or public event memory", async () => {
  const f = await fixture();
  try {
    const w = await setup(f),
      { source } = await referencedWorld(f, w),
      prepared = await prepare(f, w),
      packet = await stage(f, w, prepared);
    await f.runtime(w.cid, "commit", { ...prepared.claim.lease, packet });
    const saved = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, {
        kind: "manual",
        name: "Before source correction",
      }),
    );
    const originals = await f.query(
      "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
      [w.cid],
    );
    await f.library("put", {
      operationId: randomUUID(),
      record: revisionOf(source),
    });
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: saved.saveId,
        label: "Load corrected history",
        recovery: false,
      }),
    );
    assert.deepEqual(
      await f.query(
        "select id,event from rpg_private.world_events where campaign_id=$1 order by sequence",
        [w.cid],
      ),
      originals,
    );
    for (const original of originals)
      for (const table of ["memory_public_sources", "memory_private_sources"]) {
        const active = await f.one(
          `select count(*)::integer n from rpg_private.${table} where campaign_id=$1 and source_id=$2 and current and status='valid'`,
          [w.cid, original.id],
        );
        assert.equal(
          active.n,
          0,
          `restored ${table} revived corrected ${original.event.visibility} event`,
        );
      }
  } finally {
    await f.db.close();
  }
});

test("QA pending world work safely pauses after a save head change or activation while preserving input, dice and draft", async () => {
  const { worldTurnPreparer } =
    await import("../src/lib/production/turn-world.ts");
  for (const activate of [false, true]) {
    const f = await fixture();
    try {
      const w = await setup(f),
        prepared = await prepare(f, w);
      const check = {
        id: randomUUID(),
        index: 0,
        actorId: w.hero,
        targetId: null,
        kind: "skill",
        stat: "skill",
        dc: 12,
        dcPublic: true,
        visibility: "player",
        important: true,
        uncertainty: "meaningful",
        advantage: "normal",
        dice: [13],
        kept: 13,
        modifier: 2,
        total: 15,
        success: true,
        rollNumber: 1,
      };
      const checkpoint = prepared.claim.turn.checkpoint;
      checkpoint.plan = {
        narration: "QA_PRIVATE_SAVED_PLAN",
        checks: [check],
        publicPatches: [],
        privatePatches: [],
        visualDescription: "",
        clarification: null,
        guidanceProposal: null,
      };
      await f.runtime(w.cid, "checkpoint", {
        ...prepared.claim.lease,
        checkpoint,
        status: "generating",
      });
      await f.runtime(w.cid, "checks", {
        ...prepared.claim.lease,
        checks: [check],
      });
      checkpoint.checks = [check];
      checkpoint.narration = {
        narration: "QA_SAVED_NARRATION_DRAFT",
        visualDescription: "",
      };
      await stage(f, w, prepared);
      const saved = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, { kind: "manual", name: "Pending world work" }),
      );
      if (activate)
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: saved.saveId,
            label: "Pending child",
            recovery: false,
          }),
        );
      const current = activate
        ? await f.runtime(w.cid, "claim", {
            operationId: prepared.command.operationId,
          })
        : {
            ...prepared.claim,
            turn: {
              ...prepared.claim.turn,
              checkpoint: {
                ...checkpoint,
                resolution: prepared.resolution,
                worldSettlement: prepared.result.settlement,
              },
            },
          };
      const before = await f.foundation(w.cid);
      const rpc = async (a) => {
        try {
          return {
            data: await f.foundation(
              a.p_campaign_id,
              a.p_action,
              a.p_payload,
              a.p_owner_id,
              a.p_timeline,
            ),
          };
        } catch (error) {
          return { error: { message: error.message } };
        }
      };
      await assert.rejects(
        () =>
          worldTurnPreparer(rpc)(
            current,
            current.turn.checkpoint.resolution,
            current.turn.checkpoint.worldSettlement,
          ),
        { code: "conflict", retryable: false },
      );
      assert.deepEqual(await f.foundation(w.cid), before);
      assert.deepEqual(current.turn.checkpoint.checks, [check]);
      assert.equal(
        current.turn.checkpoint.narration.narration,
        "QA_SAVED_NARRATION_DRAFT",
      );
      assert.equal(current.turn.input.input, "Wait for the harbor bell.");
      assert.equal(
        (
          await f.one(
            "select count(*)::integer n from rpg_private.world_events where campaign_id=$1",
            [w.cid],
          )
        ).n,
        0,
      );
      const failed = await f.runtime(w.cid, "fail", {
        ...current.lease,
        failure: "conflict",
        retryable: false,
      });
      assert.equal(failed.canRetry, false);
      const next = await f.runtime(w.cid, "begin", {
        operationId: randomUUID(),
        campaignId: w.cid,
        expectedRevision: before.runtimeRevision,
        mode: "game",
        input: "A new explicit action after reviewing the conflict.",
        companionId: null,
        listenerIds: [],
        mechanic: null,
      });
      assert.equal(next.status, "pending");
      const cancelled = await f.runtime(w.cid, "cancel", {
        commandId: randomUUID(),
        campaignId: w.cid,
        operationId: prepared.command.operationId,
        action: "cancel",
        checkId: null,
      });
      assert.equal(cancelled.status, "cancelled");
      const stored = await f.one(
        "select checkpoint from rpg_private.turns where campaign_id=$1 and id=$2",
        [w.cid, prepared.command.operationId],
      );
      assert.deepEqual(stored.checkpoint.checks, [check]);
      assert.equal(
        stored.checkpoint.narration.narration,
        "QA_SAVED_NARRATION_DRAFT",
      );
    } finally {
      await f.db.close();
    }
  }
});
