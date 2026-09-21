import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { pendingOperation } from "./d2a-qa-operation-fixture.mjs";
import { leafRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

const { durableState } = await import(
  new URL(
    "tests/d2a-integration-fixture.mjs",
    leafRoot("D2A_INTEGRATION_SOURCE_ROOT"),
  ).href
);
const { liveProjection } = await moduleFromSource("tests/d1-qa-fixture.mjs");
const { createRpcDetachedWriter } = await moduleFromSource(
  "src/lib/world-lab/writer.ts",
);

test("D2A QA actual resolved SQL commit applies exact owned consequences once and leaves live state unchanged", async () => {
  const f = await pendingOperation();
  try {
    const { commit, input } = await f.record();
    assert.equal(commit.kind, "resolved_world");
    assert.ok(commit.writes.some((w) => w.tableName === "public.rpg_entities"));
    assert.ok(commit.writes.some((w) => w.tableName === "public.rpg_items"));
    const live = await liveProjection(f);
    const writer = createRpcDetachedWriter(f.owner, f.rpc);
    const first = await writer.commit(input, commit);
    assert.equal(first.run.currentWorldMinutes, 60);
    assert.equal(first.run.headRevision, f.run.headRevision + 1);
    const after = await f.store.readDetached(f.cid, f.run.id);
    const npc = after.records["public.rpg_entities"].find(
      (r) => r.id === f.npc,
    );
    const item = after.records["public.rpg_items"].find(
      (r) => r.id === f.supplies,
    );
    assert.deepEqual(npc.resources, { focus: 4 });
    assert.deepEqual(npc.conditions, ["wet"]);
    assert.equal(item.quantity, 8);
    const stable = await durableState(f),
      calls = f.transport.requests.length;
    assert.deepEqual(await writer.commit(input, commit), first);
    await assert.rejects(
      () => f.lab("commit", { ...commit, operationId: randomUUID() }),
      /rpg_conflict/,
    );
    assert.deepEqual(await durableState(f), stable);
    assert.equal(f.transport.requests.length, calls);
    assert.deepEqual(await liveProjection(f), live);
  } finally {
    await f.db.close();
  }
});

test("D2A QA SQL rejects raw payloads, substituted proof and unauthorised typed effects without a partial manifest", async () => {
  const f = await pendingOperation();
  try {
    const { commit } = await f.record();
    const stable = await durableState(f),
      live = await liveProjection(f);
    const mutations = [
      (p) => {
        p.writes.find(
          (w) => w.tableName === "public.rpg_entities",
        ).payload.resources.focus = 900;
      },
      (p) => {
        p.writes.find(
          (w) => w.tableName === "public.rpg_entities",
        ).payload.name = "MODEL_WROTE_STATE";
      },
      (p) => {
        p.writes.find(
          (w) => w.tableName === "public.rpg_items",
        ).payload.quantity = 900;
      },
      (p) => {
        p.writes[0].payload.campaign_id = randomUUID();
      },
      (p) => {
        p.writes[0].expectedVersionId = randomUUID();
      },
      (p) => {
        p.writes.push(structuredClone(p.writes[0]));
      },
      (p) => {
        p.proof.scope.actorIds = [f.hero];
      },
      (p) => {
        p.proof.scope.scenarioVersionId = randomUUID();
      },
      (p) => {
        p.proof.executionProfile.modelId = "gpt-5.4";
      },
      (p) => {
        p.proof.proposal.decisions[0].consequences[0].actorId = f.hero;
      },
      (p) => {
        p.proof.proposal.decisions[0].capabilityRefs = ["model:invented"];
      },
      (p) => {
        p.proof.proposal.rawPatches = [];
      },
      (p) => {
        p.throughWorldMinutes = 61;
      },
      (p) => {
        p.proof.settlement.events[0].text = "UNVALIDATED_MODEL_NARRATION";
      },
      (p) => {
        p.proof.consequenceChanges[0].values.hp = 900;
      },
      (p) => {
        p.proof.consequenceAuthority = [];
      },
    ];
    for (const mutate of mutations) {
      const invalid = structuredClone(commit);
      mutate(invalid);
      await assert.rejects(() => f.lab("commit", invalid));
      assert.deepEqual(await durableState(f), stable);
    }
    assert.deepEqual(await liveProjection(f), live);
  } finally {
    await f.db.close();
  }
});

test("D2A QA a persistence fault after version writes rolls the complete commit back and preserves retry", async () => {
  const f = await pendingOperation();
  try {
    const { commit, input } = await f.record();
    const stable = await durableState(f),
      live = await liveProjection(f);
    await f.db
      .exec(`create function rpg_private.qa_d2a_fail_manifest() returns trigger language plpgsql as $$ begin raise exception 'SYNTHETIC_PRIVATE_COMMIT_FAULT'; end $$;
      create trigger qa_d2a_fail_manifest before insert on rpg_private.timeline_manifests for each row execute function rpg_private.qa_d2a_fail_manifest()`);
    await assert.rejects(
      () => f.lab("commit", commit),
      /SYNTHETIC_PRIVATE_COMMIT_FAULT/,
    );
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
    const writer = createRpcDetachedWriter(f.owner, f.rpc);
    await assert.rejects(
      () => writer.commit(input, commit),
      (error) => {
        assert.equal(error.code, "unavailable");
        assert.doesNotMatch(String(error), /SYNTHETIC_PRIVATE_COMMIT_FAULT/);
        return true;
      },
    );
    await f.db.exec(
      "drop trigger qa_d2a_fail_manifest on rpg_private.timeline_manifests",
    );
    await f.db.exec("drop function rpg_private.qa_d2a_fail_manifest()");
    await f.db
      .exec(`create function rpg_private.qa_d2a_fail_receipt() returns trigger language plpgsql as $$ begin if new.stage='commit' then raise exception 'SYNTHETIC_LATE_RECEIPT_FAULT'; end if; return new; end $$;
      create trigger qa_d2a_fail_receipt before insert on rpg_private.world_lab_commands for each row execute function rpg_private.qa_d2a_fail_receipt()`);
    await assert.rejects(
      () => f.lab("commit", commit),
      /SYNTHETIC_LATE_RECEIPT_FAULT/,
    );
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
    await f.db.exec(
      "drop trigger qa_d2a_fail_receipt on rpg_private.world_lab_commands",
    );
    await f.db.exec("drop function rpg_private.qa_d2a_fail_receipt()");
    const settled = await f.lab("commit", commit);
    assert.equal(settled.committed, true);
    assert.equal(settled.run.currentWorldMinutes, 60);
  } finally {
    await f.db.close();
  }
});

test("D2A QA a replacement lease rejects an old resolved commit while preserving its recorded result", async () => {
  const f = await pendingOperation();
  try {
    const { commit, result } = await f.record();
    const next = await f.store.claim({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: f.run.id,
      expectedRevision: f.run.revision,
    });
    assert.ok(next.leaseGeneration > f.run.leaseGeneration);
    const stable = await durableState(f),
      live = await liveProjection(f);
    // Stored exact results remain readable, but an old result cannot authorize
    // settlement against a replacement lease or a newer head.
    assert.deepEqual(await f.lab("model_result", result), result.result);
    await assert.rejects(() => f.lab("commit", commit), /rpg_conflict/);
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
  } finally {
    await f.db.close();
  }
});
