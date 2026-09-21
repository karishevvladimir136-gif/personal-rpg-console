import test from "node:test";
import assert from "node:assert/strict";
import {
  assertDetachedRunFence,
  createDetachedRunFence,
  isDetachedRunFence,
  sameDetachedRunFence,
} from "../src/lib/saves/detached-fence.ts";
import {
  buildDetachedWorldCommit,
  createRpcDetachedWriter,
  validateDetachedWorldCommit,
} from "../src/lib/world-lab/writer.ts";
import {
  EVENTS,
  FOUNDATION,
  RUNTIME,
  fakeRpc,
  fixture,
  id,
  refreshRows,
} from "./d1-writer-fixtures.mjs";

test("D1 detached fence validates every authority component and rejects active-envelope extensions", () => {
  const { fence } = fixture();
  assert.equal(isDetachedRunFence(fence), true);
  assert.equal(sameDetachedRunFence(fence, structuredClone(fence)), true);
  for (const key of Object.keys(fence)) {
    const missing = { ...fence };
    delete missing[key];
    assert.equal(isDetachedRunFence(missing), false, key);
    const changed = {
      ...fence,
      [key]:
        typeof fence[key] === "number"
          ? fence[key] + 1
          : key === "kind"
            ? "active"
            : key === "inputDigest"
              ? "b".repeat(64)
              : id(`other:${key}`),
    };
    assert.equal(sameDetachedRunFence(fence, changed), false, key);
    assert.throws(() => assertDetachedRunFence(fence, changed), {
      code: key === "kind" ? "validation" : "conflict",
    });
  }
  for (const value of [
    null,
    [],
    { timelineId: fence.timelineId, epoch: 1 },
    { ...fence, epoch: 1 },
    { ...fence, privateState: {} },
    { ...fence, ownerId: "not-a-uuid" },
    { ...fence, leaseGeneration: 0 },
    { ...fence, headRevision: -1 },
    { ...fence, canonGeneration: Number.NaN },
    { ...fence, headRevision: Number.MAX_SAFE_INTEGER },
    { ...fence, inputDigest: "z".repeat(64) },
  ])
    assert.equal(isDetachedRunFence(value), false);
});

test("D1 fence capture copies immutable run scope and does not grant writable status", () => {
  const input = fixture();
  const fence = createDetachedRunFence(input.state.run);
  input.state.run.leaseGeneration++;
  assert.equal(fence.leaseGeneration, 2);
  assert.throws(() => buildDetachedWorldCommit(input), { code: "conflict" });
  input.state.run.input.ownerId = id("another-owner");
  assert.throws(() => createDetachedRunFence(input.state.run), {
    code: "validation",
  });
});

test("D1 deterministic write set changes only World settlement, explicit time and new event versions", () => {
  const input = fixture();
  const before = structuredClone(input);
  const commit = buildDetachedWorldCommit(input);
  assert.deepEqual(input, before);
  assert.equal(commit.kind, "deterministic_world");
  assert.deepEqual(Object.keys(commit.proof).sort(), [
    "schemaVersion",
    "settlement",
    "trigger",
  ]);
  assert.equal(commit.proof.trigger, "time_skip");
  assert.deepEqual(
    commit.writes.map((write) => write.tableName),
    [FOUNDATION, RUNTIME, EVENTS, EVENTS],
  );
  for (const write of commit.writes.slice(0, 2)) {
    const old = input.state.versions.find(
      (version) => version.id === write.expectedVersionId,
    );
    assert.equal(write.rowKey, old.rowKey);
    assert.equal(write.payload.campaign_id, old.payload.campaign_id);
    assert.equal(write.payload.revision, old.payload.revision + 1);
    const omitted =
      write.tableName === FOUNDATION
        ? ["revision", "world"]
        : ["revision", "world_minutes"];
    const rest = (row) =>
      Object.fromEntries(
        Object.entries(row).filter(([key]) => !omitted.includes(key)),
      );
    assert.deepEqual(rest(write.payload), rest(old.payload));
  }
  const foundation = commit.writes[0].payload;
  assert.equal(foundation.world.threads[0].status, "resolved");
  assert.deepEqual(
    foundation.world.actors,
    input.state.records[FOUNDATION][0].world.actors,
  );
  assert.deepEqual(
    foundation.loop_state,
    input.state.records[FOUNDATION][0].loop_state,
  );
  assert.equal(commit.writes[1].payload.world_minutes, 20);
  const events = commit.writes.slice(2);
  assert.deepEqual(
    events.map((write) => write.payload.sequence),
    [32, 33],
  );
  assert.deepEqual(
    events.map((write) => write.payload.event.visibility),
    ["private", "public"],
  );
  for (const write of events) {
    assert.equal(write.expectedVersionId, null);
    assert.equal(write.payload.event.originTimelineId, input.fence.timelineId);
    assert.equal(write.payload.operation_id, input.operationId);
    assert.equal(write.payload.event.operationId, input.operationId);
  }
  assert.deepEqual(buildDetachedWorldCommit(input), commit);
  commit.fence.headRevision++;
  commit.writes[0].payload.loop_state.progress.push("mutated output");
  assert.deepEqual(input, before);
});

test("D1 unchanged-time no-op has no row writes, provider calls or fictional time change", (t) => {
  const input = fixture();
  input.throughWorldMinutes = input.worldInput.resolution.worldMinutes = 0;
  t.mock.method(globalThis, "fetch", () =>
    assert.fail("D1 cannot call providers"),
  );
  const commit = buildDetachedWorldCommit(input);
  assert.deepEqual(commit.writes, []);
  assert.equal(commit.kind, "noop");
  assert.equal(commit.throughWorldMinutes, 0);
  assert.equal(commit.proof.settlement, null);
  assert.equal(input.state.run.currentWorldMinutes, 0);
});

test("D1 explicit time-only continuation writes only runtime and preserves saved audit timestamp", () => {
  const input = fixture();
  input.state.records[FOUNDATION][0].world.threads = [];
  input.worldInput.snapshot.world.threads = [];
  refreshRows(input);
  const commit = buildDetachedWorldCommit(input);
  assert.equal(commit.kind, "deterministic_world");
  assert.equal(commit.proof.settlement, null);
  assert.deepEqual(
    commit.writes.map((write) => write.tableName),
    [RUNTIME],
  );
  assert.equal(commit.writes[0].payload.world_minutes, 20);
  assert.equal(
    commit.writes[0].payload.updated_at,
    input.state.records[RUNTIME][0].updated_at,
  );
});

test("D1 legacy unconfigured World remains absent during explicit time advance", () => {
  const input = fixture();
  input.state.records[FOUNDATION] = [];
  input.worldInput.snapshot.world = null;
  input.worldInput.snapshot.revision = 0;
  input.worldInput.command.expectedRevision = 0;
  refreshRows(input);
  const commit = buildDetachedWorldCommit(input);
  assert.deepEqual(
    commit.writes.map((write) => write.tableName),
    [RUNTIME],
  );
  assert.equal(commit.proof.settlement, null);
});

test("D1 proposed commits cannot replace expected versions, identities, proof, Wave 4 fields or unrelated families", () => {
  const input = fixture();
  const original = buildDetachedWorldCommit(input);
  const mutations = [
    (c) => {
      c.operationId = id("other-op");
    },
    (c) => {
      c.fence.headRevision++;
    },
    (c) => {
      c.writes[0].expectedVersionId = id("other-version");
    },
    (c) => {
      c.writes[0].expectedVersionId = null;
    },
    (c) => {
      c.writes[0].rowKey = id("other-campaign");
    },
    (c) => {
      c.writes[0].payload.campaign_id = id("other-campaign");
    },
    (c) => {
      c.writes[0].payload.loop_state.rewards = [];
    },
    (c) => {
      c.writes[0].payload.world.actors[0].control = "autonomous";
    },
    (c) => {
      c.writes[1].payload.configuration.controlledEntityIds = [];
    },
    (c) => {
      c.writes[1].payload.updated_at = "2026-09-20T00:00:00Z";
    },
    (c) => {
      c.writes[2].payload.event.visibility = "public";
    },
    (c) => {
      c.writes[2].payload.event.originTimelineId = id("live-timeline");
    },
    (c) => {
      c.writes[2].payload.sequence = 1;
    },
    (c) => {
      c.writes.push({ ...c.writes[1], tableName: "public.rpg_items" });
    },
    (c) => {
      c.writes.push({
        ...c.writes[1],
        tableName: "rpg_private.memory_public_sources",
      });
    },
    (c) => {
      c.writes.pop();
    },
    (c) => {
      c.writes.reverse();
    },
    (c) => {
      c.proof.settlement.nextWorld.threads[0].title = "Forged";
    },
    (c) => {
      c.proof.source = "private input";
    },
    (c) => {
      c.epoch = 99;
    },
  ];
  for (const mutate of mutations) {
    const commit = structuredClone(original);
    mutate(commit);
    assert.throws(() => validateDetachedWorldCommit(input, commit), {
      code: "conflict",
    });
  }
  assert.deepEqual(validateDetachedWorldCommit(input, original), original);
});

test("D1 verifies the exact detached rows consumed by World instead of accepting a forged source", () => {
  const mutations = [
    (i) => {
      i.worldInput.snapshot.world.threads[0].steps[0].privateText = "Forged";
    },
    (i) => {
      i.worldInput.source.ownerId = id("other-owner");
    },
    (i) => {
      i.worldInput.source.snapshot.campaign.id = id("other-campaign");
    },
    (i) => {
      i.worldInput.source.snapshot.entities[0].kind = "npc";
    },
    (i) => {
      i.worldInput.source.snapshot.entities.push(
        i.worldInput.source.snapshot.entities[0],
      );
    },
    (i) => {
      i.worldInput.source.snapshot.locations[0].description = "Future location";
    },
    (i) => {
      i.worldInput.source.snapshot.publicState.current_location_id =
        id("another-location");
    },
    (i) => {
      i.worldInput.source.runtime.configuration.controlledEntityIds = [];
    },
    (i) => {
      i.worldInput.source.runtime.worldMinutes++;
    },
    (i) => {
      i.worldInput.source.runtime.timeline.epoch = 99;
    },
    (i) => {
      i.worldInput.source.snapshot.timeline.epoch = 99;
    },
    (i) => {
      i.worldInput.snapshot.timeline.epoch = 99;
    },
    (i) => {
      i.worldInput.command.expectedHeadId = id("sibling-manifest");
    },
    (i) => {
      i.worldInput.resolution.changes = [
        { family: "items", id: id("knife"), values: { quantity: 0 } },
      ];
    },
    (i) => {
      i.worldInput.resolution.outcomes.push({ kind: "reward.granted" });
    },
  ];
  for (const mutate of mutations) {
    const input = fixture();
    mutate(input);
    assert.throws(() => buildDetachedWorldCommit(input), { code: "conflict" });
  }
  const input = fixture();
  input.worldInput.source.snapshot.entities.reverse();
  assert.equal(buildDetachedWorldCommit(input).kind, "deterministic_world");
});

test("D1 fences cancellation, lease replacement, stale head, source basis and changed run identity", () => {
  const mutations = [
    (i) => {
      i.state.run.status = "cancelled";
    },
    (i) => {
      i.state.run.status = "paused";
    },
    (i) => {
      i.state.run.status = "completed";
    },
    (i) => {
      i.state.run.leaseGeneration++;
    },
    (i) => {
      i.state.run.headRevision++;
    },
    (i) => {
      i.state.run.headManifestId = id("new-head");
    },
    (i) => {
      i.state.run.input.scenarioVersionId = id("new-scenario");
    },
    (i) => {
      i.state.run.input.divergenceVersionId = id("new-divergence");
    },
    (i) => {
      i.state.run.inputDigest = "b".repeat(64);
    },
    (i) => {
      i.state.run.input.canonGeneration++;
    },
    (i) => {
      i.state.canonGeneration++;
    },
    (i) => {
      i.state.manifest.canonGeneration++;
    },
    (i) => {
      i.state.manifest.timelineId = id("sibling");
    },
    (i) => {
      i.state.manifest.runId = id("sibling-run");
    },
    (i) => {
      i.state.run.id = id("replacement-run");
    },
  ];
  for (const mutate of mutations) {
    const input = fixture();
    mutate(input);
    assert.throws(() => buildDetachedWorldCommit(input), { code: "conflict" });
  }
});

test("D1 refuses incomplete, duplicate, substituted and drifted manifest membership", () => {
  const mutations = [
    (i) => {
      i.state.versions.pop();
    },
    (i) => {
      i.state.versions.push(i.state.versions[0]);
    },
    (i) => {
      i.state.manifest.refs[FOUNDATION].push(
        i.state.manifest.refs[FOUNDATION][0],
      );
    },
    (i) => {
      i.state.manifest.refs[FOUNDATION] = [id("unloaded-version")];
    },
    (i) => {
      i.state.versions[0].rowKey = id("another-campaign");
    },
    (i) => {
      i.state.versions[0].payload.campaign_id = id("another-campaign");
    },
    (i) => {
      i.state.records[FOUNDATION][0].loop_state.rewards = [];
    },
    (i) => {
      i.state.records["extra-table"] = [];
    },
    (i) => {
      i.state.versions[0].tableName = "public.rpg_items";
    },
  ];
  for (const mutate of mutations) {
    const input = fixture();
    mutate(input);
    assert.throws(() => buildDetachedWorldCommit(input), {
      code: "validation",
    });
  }
});

test("D1 never commits resolver work, autonomous PC decisions or unsupported consequences", () => {
  for (const mutate of [
    (world) => {
      world.threads[0].steps[0].resolution = "resolver_required";
    },
    (world) => {
      world.threads[0].decisionActorIds = [id("player")];
    },
    (world) => {
      world.threads[0].steps[0].consequences = [
        { kind: "quest.complete", questId: id("quest") },
      ];
    },
  ]) {
    const input = fixture();
    mutate(input.state.records[FOUNDATION][0].world);
    input.worldInput.snapshot.world = structuredClone(
      input.state.records[FOUNDATION][0].world,
    );
    refreshRows(input);
    assert.throws(() => buildDetachedWorldCommit(input), {
      code: "validation",
    });
  }
});

test("D1 finite horizon and unchanged-time trigger bounds cannot be exceeded", () => {
  for (const through of [-1, 121, Infinity, 0.5]) {
    const input = fixture();
    input.throughWorldMinutes = input.worldInput.resolution.worldMinutes =
      through;
    assert.throws(() => buildDetachedWorldCommit(input));
  }
  for (const trigger of ["none", "session_boundary", "action", "travel"]) {
    const input = fixture();
    input.worldInput.trigger = trigger;
    assert.throws(() => buildDetachedWorldCommit(input), {
      code: "validation",
    });
  }
});

test("D1 private settlement candidates are recomputed before acceptance", () => {
  const input = fixture();
  const commit = buildDetachedWorldCommit(input);
  input.settlement = structuredClone(commit.proof.settlement);
  assert.deepEqual(buildDetachedWorldCommit(input), commit);
  input.settlement.events[0].text = "Forged private causal event";
  assert.throws(() => buildDetachedWorldCommit(input), { code: "conflict" });
});

test("D1 synthetic RPC exact retries return original receipt without replay/time/head/lease changes", async () => {
  const input = fixture();
  const rpc = fakeRpc(input);
  const active = structuredClone(rpc.active);
  const writer = createRpcDetachedWriter(input.fence.ownerId, rpc.execute);
  const first = await writer.commit(input);
  const branch = structuredClone(rpc.branch);
  const writes = rpc.writes;
  assert.equal(first.committed, true);
  assert.deepEqual(await writer.commit(input), first);
  assert.deepEqual(rpc.branch, branch);
  assert.equal(rpc.writes, writes);
  assert.equal(rpc.receipts.size, 1);
  assert.equal(rpc.branch.records[EVENTS].length, 3);
  assert.equal(rpc.branch.run.leaseGeneration, input.fence.leaseGeneration);
  assert.deepEqual(rpc.active, active);
  assert.equal(rpc.turnStoreCalls, 0);
  assert.equal(rpc.calls.length, 2);
  assert.deepEqual(rpc.calls[0], rpc.calls[1]);
  assert.equal(rpc.calls[0].p_action, "commit");
});

test("D1 synthetic receipt rejects a reused operation ID with changed body", async () => {
  const input = fixture();
  const rpc = fakeRpc(input);
  const writer = createRpcDetachedWriter(input.fence.ownerId, rpc.execute);
  await writer.commit(input);
  const before = structuredClone(rpc.branch);
  const changed = structuredClone(input);
  changed.throughWorldMinutes = changed.worldInput.resolution.worldMinutes = 21;
  await assert.rejects(writer.commit(changed), {
    code: "conflict",
    message: "conflict",
  });
  assert.deepEqual(rpc.branch, before);
  assert.equal(rpc.receipts.size, 1);
});

test("D1 synthetic late callback is fenced after cancellation/replacement without rebinding", async () => {
  for (const mutate of [
    (run) => {
      run.status = "cancelled";
    },
    (run) => {
      run.leaseGeneration++;
    },
    (run) => {
      run.headRevision++;
      run.headManifestId = id("later-head");
    },
    (run) => {
      run.input.canonGeneration++;
    },
  ]) {
    const input = fixture();
    const rpc = fakeRpc(input);
    const writer = createRpcDetachedWriter(input.fence.ownerId, rpc.execute);
    mutate(rpc.branch.run);
    const before = structuredClone(rpc.branch);
    await assert.rejects(writer.commit(input), { code: "conflict" });
    assert.deepEqual(rpc.branch, before);
    assert.equal(rpc.calls.length, 1);
    assert.deepEqual(rpc.calls[0].p_payload.fence, input.fence);
    assert.equal(rpc.writes, 0);
    assert.equal(rpc.turnStoreCalls, 0);
  }
});

test("D1 independent live timeline switch does not invalidate detached authority or mutate active state", async () => {
  const input = fixture();
  const rpc = fakeRpc(input);
  const writer = createRpcDetachedWriter(input.fence.ownerId, rpc.execute);
  rpc.active.timelineId = id("another-live-timeline");
  rpc.active.epoch++;
  const live = structuredClone(rpc.active);
  const result = await writer.commit(input);
  assert.equal(result.committed, true);
  assert.deepEqual(rpc.active, live);
  assert.deepEqual(rpc.calls[0].p_payload.fence, input.fence);
  assert.equal(Object.hasOwn(rpc.calls[0].p_payload.fence, "epoch"), false);
  assert.equal(rpc.calls[0].p_payload.proof.settlement.timeline.epoch, 1);
});

test("D1 no-op receipt preserves the exact manifest and immutable inherited Wave 4 state", async () => {
  const input = fixture();
  input.throughWorldMinutes = input.worldInput.resolution.worldMinutes = 0;
  const rpc = fakeRpc(input);
  const before = structuredClone(rpc.branch);
  const writer = createRpcDetachedWriter(input.fence.ownerId, rpc.execute);
  const result = await writer.commit(input);
  assert.equal(result.committed, false);
  assert.equal(result.manifest.id, input.fence.manifestId);
  assert.deepEqual(rpc.branch, before);
  assert.equal(rpc.writes, 0);
  assert.deepEqual(await writer.commit(input), result);
});

test("D1 RPC cannot adopt a different owner or send arbitrary proposed patches", async () => {
  const input = fixture();
  let calls = 0;
  const execute = async () => {
    calls++;
    assert.fail("No invalid RPC dispatch");
  };
  const foreign = createRpcDetachedWriter(id("other-owner"), execute);
  await assert.rejects(foreign.commit(input), { code: "conflict" });
  const writer = createRpcDetachedWriter(input.fence.ownerId, execute);
  const plan = buildDetachedWorldCommit(input);
  plan.writes[0].payload.loop_state = {};
  await assert.rejects(writer.commit(input, plan), { code: "conflict" });
  assert.equal(calls, 0);
});

test("D1 RPC private failures are sanitized and never trigger active fallback or automatic retry", async () => {
  const input = fixture();
  for (const [error, code, retryable] of [
    [{ message: "rpg_conflict PRIVATE_DATABASE_DETAIL" }, "conflict", false],
    [
      { message: "rpg_validation PRIVATE_DATABASE_DETAIL" },
      "validation",
      false,
    ],
    [
      { code: "23503", message: "PRIVATE_CONSTRAINT_DETAIL" },
      "validation",
      false,
    ],
    [{ message: "rpg_forbidden PRIVATE_OWNER_DETAIL" }, "unavailable", false],
    [{ message: "PRIVATE_NETWORK_DETAIL" }, "unavailable", true],
  ]) {
    let calls = 0;
    const writer = createRpcDetachedWriter(input.fence.ownerId, async () => {
      calls++;
      return { data: null, error };
    });
    await assert.rejects(writer.commit(input), {
      code,
      message: code,
      retryable,
    });
    assert.equal(calls, 1);
  }
  const writer = createRpcDetachedWriter(input.fence.ownerId, async () => {
    throw new Error("PRIVATE_NETWORK_DETAIL");
  });
  await assert.rejects(writer.commit(input), {
    code: "unavailable",
    message: "unavailable",
    retryable: true,
  });
});

test("D1 receipt response must retain original input/scope/lease and exactly one checkpoint advance", async () => {
  for (const mutate of [
    (result) => {
      result.run.ownerId = id("other-owner");
    },
    (result) => {
      result.run.input.effectiveGuidance = { leaked: "changed" };
    },
    (result) => {
      result.run.leaseGeneration++;
    },
    (result) => {
      result.run.headRevision++;
    },
    (result) => {
      result.manifest.timelineId = id("sibling");
    },
    (result) => {
      result.operationId = id("another-operation");
    },
    (result) => {
      result.committed = false;
    },
    (result) => {
      result.secret = "PRIVATE_EXTRA";
    },
  ]) {
    const input = fixture();
    const rpc = fakeRpc(input);
    const writer = createRpcDetachedWriter(
      input.fence.ownerId,
      async (args) => {
        const response = await rpc.execute(args);
        mutate(response.data);
        return response;
      },
    );
    await assert.rejects(writer.commit(input), {
      code: "validation",
      message: "validation",
    });
  }
});

test("D1 async response validation retains the original pinned input when the caller mutates its copy", async () => {
  const input = fixture();
  const rpc = fakeRpc(input);
  const originalInput = structuredClone(input.state.run.input);
  const writer = createRpcDetachedWriter(input.fence.ownerId, async (args) => {
    input.state.run.input.effectiveGuidance = { changed: true };
    input.fence.leaseGeneration++;
    return rpc.execute(args);
  });
  const result = await writer.commit(input);
  assert.deepEqual(result.run.input, originalInput);
  assert.equal(rpc.calls[0].p_payload.fence.leaseGeneration, 2);
});
