import test from "node:test";
import assert from "node:assert/strict";
import {
  waveFixture,
  configuredWorld,
  stage,
} from "./wave1-integration-fixture.mjs";
import { emptyPlan } from "./phase2-turn-store-fixture.mjs";
import { assessWorldRecovery } from "../src/lib/production-adapters/world-recovery.ts";

// Read-only adapter exercise over real synthetic save/load projections. Recovery
// persistence remains Lead-owned; this test must not install an alternative SQL engine.
test("actual save/load keeps immutable stage history; only a freshly proved continuation is proposed", async () => {
  const f = await waveFixture();
  try {
    const w = await configuredWorld(f);
    const s = await stage(f, w);
    const freshSource = async () =>
      (
        await f.one(
          "select rpg_private.timeline_stamp(rpg_private.runtime_source($1,$2,'game'),rpg_private.timeline_fence($1),false) value",
          [w.cid, f.owner],
        )
      ).value;
    const original = {
      stage: {
        snapshot: s.snapshot,
        command: s.command,
        source: await freshSource(),
        resolution: s.packet.resolution,
        trigger: "time_skip",
      },
      input: s.input,
      plan: emptyPlan(),
      checks: [],
      profiles: [],
    };
    const originalSettlement = structuredClone(s.proposal.settlement);
    const initial = await f.saves(
      w.cid,
      "create",
      await f.command(w.cid, {
        kind: "manual",
        name: "Pending deterministic world",
      }),
    );
    const savedPoint = initial.snapshot.saves.find(
      (point) => point.name === "Pending deterministic world",
    );
    assert.ok(savedPoint);
    const stageRow = async () =>
      (
        await f.one(
          "select settlement from rpg_private.world_stages where campaign_id=$1 and id=$2",
          [w.cid, s.input.operationId],
        )
      ).settlement;
    assert.deepEqual(await stageRow(), originalSettlement);

    const assess = async (claim) => {
      const snapshot = await f.read(w.cid);
      const command = {
        ...s.command,
        timeline: snapshot.timeline,
        expectedHeadId: snapshot.headId,
        expectedRevision: snapshot.revision,
        expectedRuntimeRevision: snapshot.runtimeRevision,
      };
      const current = {
        ...structuredClone(original),
        input: {
          ...original.input,
          timeline: snapshot.timeline,
          expectedRevision: snapshot.runtimeRevision,
        },
        stage: {
          ...structuredClone(original.stage),
          snapshot,
          command,
          source: await freshSource(),
        },
      };
      return assessWorldRecovery({
        original,
        current,
        settlement: await stageRow(),
        lease: claim.lease,
        membership: {
          ownerId: f.owner,
          campaignId: w.cid,
          operationId: s.input.operationId,
          timeline: snapshot.timeline,
          headId: snapshot.headId,
          turnMember: true,
          stageMember: true,
          profilesMember: true,
          lease: claim.lease,
          leaseActive: true,
          status: "generating",
          committedEventIds: [],
        },
      });
    };
    const manual = await assess(s.claim);
    assert.equal(manual.status, "restage");
    assert.deepEqual(manual.settlement.events, originalSettlement.events);

    // Load restores exact membership, invalidates old callbacks and gives a new lease.
    await f.saves(
      w.cid,
      "load",
      await f.command(w.cid, {
        saveId: savedPoint.id,
        label: "Continuation child",
        recovery: false,
      }),
    );
    const claim = await f.runtime(w.cid, "claim", {
      operationId: s.input.operationId,
    });
    assert.ok(claim);
    assert.notEqual(claim.lease.token, s.claim.lease.token);
    assert.notDeepEqual(claim.lease.timeline, s.claim.lease.timeline);
    const loaded = await assess(claim);
    assert.equal(loaded.status, "restage");
    assert.deepEqual(loaded.settlement.events, originalSettlement.events);
    assert.deepEqual(await stageRow(), originalSettlement);
    const vaulted = await f.one(
      "select count(*)::int count from rpg_private.timeline_versions where campaign_id=$1 and table_name='rpg_private.world_stages' and payload->'settlement'=$2::jsonb",
      [w.cid, JSON.stringify(originalSettlement)],
    );
    assert.ok(vaulted.count > 0);
    assert.equal(
      (
        await f.one(
          "select count(*)::int count from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).count,
      0,
    );
    assert.equal((await assess(s.claim)).status, "recovery_needed");
  } finally {
    await f.db.close();
  }
});
