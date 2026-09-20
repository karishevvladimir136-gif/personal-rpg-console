import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  waveFixture,
  configuredWorld,
  stage,
} from "./wave1-integration-fixture.mjs";
import { fixture, world } from "./phase35-storage-fixture.mjs";
import { persistentProfileResolver } from "../src/lib/production/profiles.ts";

test("SQL library immutable versions, exact replay, owner denial and bound independent campaigns", async () => {
  const f = await waveFixture();
  try {
    const { source, pack } = await f.seedLibrary();
    const a = await f.campaign("Harbor"),
      b = await f.campaign("Orbital station");
    const binding = (cid) => ({
      schemaVersion: 1,
      id: randomUUID(),
      ownerId: f.owner,
      campaignId: cid,
      packId: pack.id,
      packVersionId: pack.versionId,
      scenarioVersionId: null,
      sourceVersionIds: [source.versionId],
      sourcePriority: [source.versionId],
      entry: { label: "Dawn", worldMinutes: 0, evidence: [] },
      mappings: [
        { packEntityId: pack.body.entities[0].id, entityId: randomUUID() },
      ],
    });
    await f.write(a, "bind", { binding: binding(a) });
    await f.write(b, "bind", { binding: binding(b) });
    assert.notEqual(
      (await f.read(a)).bindings[0].mappings[0].entityId,
      (await f.read(b)).bindings[0].mappings[0].entityId,
    );
    await assert.rejects(
      f.one(
        "update rpg_private.library_records set body=body where version_id=$1",
        [source.versionId],
      ),
      /immutable/,
    );
    const denied = await f.library({
      p_owner_id: f.other,
      p_campaign_id: null,
      p_action: "read",
      p_payload: {},
    });
    assert.match(denied.error.message, /forbidden/);
    const before = await f.read(a);
    const corrected = {
      ...source,
      versionId: randomUUID(),
      version: 2,
      previousVersionId: source.versionId,
    };
    assert.equal(
      (
        await f.library({
          p_owner_id: f.owner,
          p_campaign_id: null,
          p_action: "put",
          p_payload: { operationId: randomUUID(), record: corrected },
        })
      ).error,
      undefined,
    );
    assert.ok((await f.read(a)).revision > before.revision);
    assert.deepEqual((await f.read(a)).bindings, before.bindings);
  } finally {
    await f.db.close();
  }
});
test("world stage is inert; failed gameplay transaction rolls back world; retry commits exactly once and indexes visibility", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const s = await stage(f, w);
    assert.equal((await f.read(w.cid)).world.threads[0].cursor, 0);
    await assert.rejects(
      f.runtime(w.cid, "commit", {
        ...s.claim.lease,
        packet: { ...s.packet, narration: "" },
      }),
    );
    assert.equal((await f.read(w.cid)).world.threads[0].cursor, 0);
    assert.equal(
      (await f.one("select count(*) n from rpg_private.world_events")).n,
      0,
    );
    await f.runtime(w.cid, "commit", { ...s.claim.lease, packet: s.packet });
    await f.runtime(w.cid, "commit", { ...s.claim.lease, packet: s.packet });
    assert.equal((await f.read(w.cid)).world.threads[0].cursor, 1);
    assert.equal(
      (await f.one("select count(*) n from rpg_private.world_events")).n,
      2,
    );
    const pub = await f.query(
      "select text from rpg_private.memory_public_sources where kind='event'",
    );
    assert.ok(pub.some((x) => x.text.includes("bell")));
    assert.ok(pub.every((x) => !x.text.includes("PRIVATE_WAVE1")));
    assert.ok(
      (
        await f.query(
          "select text from rpg_private.memory_private_sources where kind='private_event'",
        )
      ).some((x) => x.text.includes("PRIVATE_WAVE1")),
    );
  } finally {
    await f.db.close();
  }
});
test("foundation stale revision/head and forged controlled PC writes are rejected", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const cmd = await f.foundationCommand(w.cid);
    const args = {
      p_owner_id: f.owner,
      p_campaign_id: w.cid,
      p_action: "configure",
      p_payload: {
        command: { ...cmd, expectedHeadId: randomUUID() },
        world: w.state,
      },
      p_timeline: cmd.timeline,
    };
    assert.match((await f.rpc(args)).error.message, /conflict/);
    const forged = structuredClone(w.state);
    forged.actors[0].entityId = w.hero;
    await assert.rejects(
      f.write(w.cid, "configure", { world: forged }),
      /validation/,
    );
  } finally {
    await f.db.close();
  }
});
test("existing v1 saves survive additive migration; v2 exact families use same save engine", async () => {
  const f = await fixture(9);
  try {
    const w = await world(f);
    const before = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, { name: "Before Wave 1", kind: "manual" }),
    );
    await f.db.exec(
      await readFile(
        new URL(
          "../supabase/migrations/202609190010_production_wave1.sql",
          import.meta.url,
        ),
        "utf8",
      ),
    );
    const old = await f.one(
      "select id,schema_version from rpg_private.timeline_manifests where campaign_id=$1 order by created_at limit 1",
      [w.cid],
    );
    assert.equal(old.schema_version, 1);
    await f.one("select rpg_private.timeline_validate($1,$2)", [w.cid, old.id]);
    const mid = (
      await f.one("select rpg_private.timeline_capture($1) id", [w.cid])
    ).id;
    assert.equal(
      (
        await f.one(
          "select schema_version from rpg_private.timeline_manifests where id=$1",
          [mid],
        )
      ).schema_version,
      2,
    );
    await f.one("select rpg_private.timeline_validate($1,$2)", [w.cid, mid]);
    assert.ok(before);
  } finally {
    await f.db.close();
  }
});
test("durable execution pin selects campaign overrides once and reuses both stages on retry", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const s = await stage(f, w);
    const profiles = async (args) => {
      try {
        return {
          data: (
            await f.one(
              "select public.rpg_execution_profile($1,$2,$3,$4::jsonb,$5::jsonb,$6) result",
              [
                args.p_owner_id,
                args.p_campaign_id,
                args.p_operation_id,
                args.p_profiles ? JSON.stringify(args.p_profiles) : null,
                JSON.stringify(args.p_timeline),
                args.p_token ?? null,
              ],
            )
          ).result,
        };
      } catch (e) {
        return { error: e.message };
      }
    };
    const resolve = persistentProfileResolver(
      f.owner,
      w.cid,
      s.snapshot.timeline,
      f.rpc,
      profiles,
      { providerId: "openai", modelId: "gpt-6-astra", reasoning: "xhigh" },
    );
    const first = await resolve(s.input.operationId, ["dm.plan", "dm.narrate"]);
    const changed = persistentProfileResolver(
      f.owner,
      w.cid,
      s.snapshot.timeline,
      f.rpc,
      profiles,
      { providerId: "unsupported", modelId: "no-fallback", reasoning: null },
    );
    assert.deepEqual(
      await changed(s.input.operationId, ["dm.plan", "dm.narrate"]),
      first,
    );
    assert.equal(
      (await f.one("select count(*) n from rpg_private.execution_profiles")).n,
      2,
    );
  } finally {
    await f.db.close();
  }
});

test("actual turn engine and SQL bridge commit one causal world settlement with zero provider requests", async () => {
  const [{ createRpcTurnStore }, { runTurn }, { worldTurnPreparer }] =
    await Promise.all([
      import("../src/lib/gameplay/dm-store.ts"),
      import("../src/lib/gameplay/turn-engine.ts"),
      import("../src/lib/production/turn-world.ts"),
    ]);
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const state = structuredClone(w.state);
    state.threads[0].steps[0].trigger = {
      kind: "causal",
      family: "quests",
      recordId: w.quest,
    };
    await f.write(w.cid, "configure", { world: state });
    const timeline = await f.fence(w.cid);
    const rpc = async (args) => {
      try {
        return {
          data: await f.runtime(
            args.p_campaign_id,
            args.p_action,
            args.p_payload,
            args.p_timeline,
          ),
        };
      } catch (e) {
        return { error: { message: e.message } };
      }
    };
    const store = createRpcTurnStore(f.owner, rpc, null, timeline);
    let calls = 0;
    const forbidden = async () => {
      calls++;
      throw new Error("Unexpected provider request");
    };
    const input = {
      timeline,
      operationId: randomUUID(),
      campaignId: w.cid,
      expectedRevision: (await store.readPlay(w.cid)).revision,
      mode: "mechanic",
      input: "Complete the synthetic delivery.",
      companionId: null,
      listenerIds: [],
      mechanic: {
        kind: "quest.transition",
        questId: w.quest,
        status: "complete",
      },
    };
    const deps = {
      store,
      provider: { plan: forbidden, narrate: forbidden, feedback: forbidden },
      prepareWorld: worldTurnPreparer(f.rpc),
    };
    const result = await runTurn(input, deps);
    assert.equal(result.status, "committed");
    assert.match(result.narration, /bell/);
    assert.equal(calls, 0);
    assert.equal((await f.read(w.cid)).world.threads[0].cursor, 1);
    assert.equal(
      (
        await f.one("select status from public.rpg_quests where id=$1", [
          w.quest,
        ])
      ).status,
      "complete",
    );
    await runTurn(input, deps);
    assert.equal(
      (await f.one("select count(*) n from rpg_private.world_events")).n,
      2,
    );
    assert.equal(calls, 0);
  } finally {
    await f.db.close();
  }
});
