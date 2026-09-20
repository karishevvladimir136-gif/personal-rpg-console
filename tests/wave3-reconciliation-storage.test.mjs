import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { fixture } from "./phase35-storage-fixture.mjs";

const policy = {
  simulation: true,
  autonomy: "moderate",
  deadlinePressure: "normal",
};
const choice = { schemaVersion: 1, kind: "restart_overdue", graceMinutes: 60 };
const ref = {
  id: "console-basic-v1",
  version: 1,
  mode: "full_ruleset",
  validatorVersion: "console-basic-v1",
};
async function foundation(f, cid, action = "read", payload = {}, timeline) {
  return (
    await f.one(
      "select public.rpg_world($1,$2,$3,$4::jsonb,$5::jsonb) result",
      [
        f.owner,
        cid,
        action,
        JSON.stringify(payload),
        JSON.stringify(timeline ?? (await f.fence(cid))),
      ],
    )
  ).result;
}
async function configure(
  f,
  cid,
  next,
  reconciliation,
  operationId = randomUUID(),
) {
  const s = await foundation(f, cid);
  const command = {
    operationId,
    campaignId: cid,
    timeline: s.timeline,
    expectedRevision: s.revision,
    expectedRuntimeRevision: s.runtimeRevision,
    expectedHeadId: s.headId,
  };
  return {
    command,
    worldPolicy: next,
    ruleset: ref,
    executionPolicy: null,
    reconciliation,
  };
}
test("SQL owner reconciliation requires explicit choice even for empty worlds; replay is exact and fenced", async () => {
  const f = await fixture();
  try {
    const cid = await f.campaign(),
      initial = await foundation(f, cid);
    const unreviewed = await configure(f, cid, policy, null);
    await assert.rejects(
      foundation(f, cid, "owner_configure", unreviewed),
      /rpg_validation/,
    );
    assert.deepEqual(await foundation(f, cid), initial);
    const input = await configure(f, cid, policy, choice);
    const applied = await foundation(f, cid, "owner_configure", input);
    assert.deepEqual(applied.world.policy, policy);
    assert.equal(applied.worldMinutes, initial.worldMinutes);
    assert.deepEqual(
      await foundation(f, cid, "owner_configure", input),
      applied,
    );
    await assert.rejects(
      foundation(f, cid, "owner_configure", {
        ...input,
        reconciliation: { ...choice, graceMinutes: 120 },
      }),
      /rpg_conflict/,
    );
    const lower = await configure(f, cid, { ...policy, autonomy: "low" }, null);
    assert.equal(
      (await foundation(f, cid, "owner_configure", lower)).world.policy
        .autonomy,
      "low",
    );
    const extra = await configure(f, cid, policy, choice);
    await assert.rejects(
      foundation(f, cid, "owner_configure", extra),
      /rpg_validation/,
    );
  } finally {
    await f.db.close();
  }
});

test("SQL restarts only newly enabled overdue schedules and preserves warning opportunity", async () => {
  const f = await fixture();
  try {
    const first = randomUUID(),
      second = randomUUID(),
      future = randomUUID();
    const step = (id, at, fields = {}) => ({
      id,
      trigger: {
        kind: "deadline",
        atWorldMinutes: at,
        established: true,
        scenarioCritical: false,
      },
      resolution: "deterministic",
      consequence: "background",
      privateText: "PRIVATE",
      evidence: [],
      publicOutcome: null,
      warning: null,
      hookChanges: [],
      ...fields,
    });
    const w = {
      schemaVersion: 1,
      campaignId: randomUUID(),
      policy: { ...policy, simulation: false },
      policyChangedAtWorldMinutes: 0,
      actors: [],
      hooks: [],
      warnings: [],
      threads: [
        {
          id: randomUUID(),
          campaignId: randomUUID(),
          revision: 1,
          title: "PRIVATE",
          publicTitle: null,
          actorIds: [],
          decisionActorIds: [],
          locationIds: [],
          prerequisiteThreadIds: [],
          status: "active",
          cursor: 0,
          steps: [
            step(first, 10, {
              warning: {
                forStepId: second,
                opportunityMinutes: 90,
                recipientActorIds: [],
              },
            }),
            step(second, 20),
            step(future, 400),
          ],
        },
      ],
    };
    const reconcile = async (world, next = policy, decision = choice) =>
      (
        await f.one(
          "select rpg_private.wave3_reconcile_world($1::jsonb,$2::jsonb,100,$3::jsonb) result",
          [
            JSON.stringify(world),
            JSON.stringify(next),
            JSON.stringify(decision),
          ],
        )
      ).result;
    const result = await reconcile(w);
    assert.deepEqual(
      result.threads[0].steps.map((s) => s.trigger.atWorldMinutes),
      [160, 251, 400],
    );
    assert.deepEqual(result.warnings, w.warnings);
    assert.equal(result.threads[0].cursor, 0);
    const restored = structuredClone(result);
    restored.policy = w.policy;
    restored.policyChangedAtWorldMinutes = 0;
    restored.threads[0].steps[0].trigger.atWorldMinutes = 10;
    restored.threads[0].steps[1].trigger.atWorldMinutes = 20;
    assert.deepEqual(restored, w);
    await assert.rejects(
      reconcile(w, policy, { ...choice, graceMinutes: 1.5 }),
      /rpg_validation/,
    );
    await assert.rejects(
      reconcile(w, policy, { ...choice, stepIds: [first] }),
      /rpg_validation/,
    );
    const active = structuredClone(w);
    active.policy = { ...policy, deadlinePressure: "off" };
    active.threads[0].steps[0] = step(first, 10, {
      trigger: { kind: "autonomy", atWorldMinutes: 10, scope: "local" },
    });
    const expanded = await reconcile(active);
    assert.equal(
      expanded.threads[0].steps[0].trigger.atWorldMinutes,
      10,
      "already active background autonomy stays intact",
    );
  } finally {
    await f.db.close();
  }
});
