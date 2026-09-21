import test from "node:test";
import assert from "node:assert/strict";
import {
  applyLabLifecycle,
  invalidateLabRun,
  parseLabRun,
  validateLabProgress,
} from "../src/lib/world-lab/lifecycle.ts";
import { createRpcLabStore } from "../src/lib/world-lab/store.ts";
import { labInputDigest } from "../src/lib/world-lab/inputs.ts";
import { runFixture, id } from "./d1-input-fixtures.mjs";

test("D1 lifecycle requires explicit claim and explicit lease replacement/resume", () => {
  const f = runFixture();
  const claimed = applyLabLifecycle(f.run, "claim", f.command(), f.basis).run;
  assert.equal(claimed.status, "running");
  assert.equal(claimed.leaseGeneration, 1);
  const continued = applyLabLifecycle(
    claimed,
    "claim",
    f.command(claimed),
    f.basis,
  ).run;
  assert.equal(continued.leaseGeneration, 2);
  assert.equal(continued.headManifestId, claimed.headManifestId);
  assert.throws(
    () => applyLabLifecycle(continued, "claim", f.command(claimed), f.basis),
    /conflict/,
  );
  const replacement = applyLabLifecycle(
    claimed,
    "resume",
    f.command(claimed),
    f.basis,
  ).run;
  assert.equal(replacement.leaseGeneration, 2);
  assert.equal(replacement.headManifestId, f.run.headManifestId);
  assert.equal(replacement.currentWorldMinutes, f.run.currentWorldMinutes);
  const paused = applyLabLifecycle(
    replacement,
    "pause",
    f.command(replacement),
    f.basis,
  ).run;
  assert.equal(paused.status, "paused");
  assert.equal(paused.leaseGeneration, 3);
  const resumed = applyLabLifecycle(
    paused,
    "resume",
    f.command(paused),
    f.basis,
  ).run;
  const cancelled = applyLabLifecycle(
    resumed,
    "cancel",
    f.command(resumed),
    f.basis,
  ).run;
  assert.equal(cancelled.status, "cancelled");
  assert.equal(cancelled.leaseGeneration, 5);
  for (const action of ["claim", "pause", "resume", "cancel"])
    assert.throws(
      () => applyLabLifecycle(cancelled, action, f.command(cancelled), f.basis),
      /conflict/,
    );
  assert.deepEqual(cancelled.input, f.run.input);
});

test("D1 exact operation receipt replays original result before stale state checks and never replaces a lease", () => {
  const f = runFixture(),
    command = f.command();
  const first = applyLabLifecycle(f.run, "claim", command, f.basis);
  const cancelled = applyLabLifecycle(
    first.run,
    "cancel",
    f.command(first.run),
    f.basis,
  ).run;
  const staleBasis = { ...f.basis, canonGeneration: 2 };
  const replay = applyLabLifecycle(
    cancelled,
    "claim",
    command,
    staleBasis,
    first.receipt,
  );
  assert.equal(replay.replayed, true);
  assert.deepEqual(replay.run, first.run);
  assert.equal(cancelled.status, "cancelled");
  assert.throws(
    () =>
      applyLabLifecycle(
        cancelled,
        "claim",
        { ...command, expectedRevision: 1 },
        f.basis,
        first.receipt,
      ),
    /conflict/,
  );
  assert.throws(
    () =>
      applyLabLifecycle(cancelled, "resume", command, f.basis, first.receipt),
    /conflict/,
  );
  assert.throws(
    () =>
      applyLabLifecycle(
        first.run,
        "pause",
        { ...f.command(first.run), expectedRevision: 0 },
        f.basis,
      ),
    /conflict/,
  );
});

test("D1 changed source pauses once without input repinning; unrelated live switches have no lifecycle authority", () => {
  const f = runFixture();
  const active = applyLabLifecycle(f.run, "claim", f.command(), f.basis).run;
  const stale = structuredClone(f.basis);
  stale.sourceHeads[0].versionId = id();
  const paused = invalidateLabRun(active, stale);
  assert.equal(paused.status, "paused");
  assert.equal(paused.reason, "source_changed");
  assert.equal(paused.leaseGeneration, active.leaseGeneration + 1);
  assert.deepEqual(paused.input, active.input);
  assert.equal(paused.inputDigest, active.inputDigest);
  assert.deepEqual(invalidateLabRun(paused, stale), paused);
  assert.throws(
    () => applyLabLifecycle(paused, "resume", f.command(paused), stale),
    /conflict/,
  );
  assert.deepEqual(invalidateLabRun(active, structuredClone(f.basis)), active);
  const cancelled = applyLabLifecycle(
    active,
    "cancel",
    f.command(active),
    f.basis,
  ).run;
  assert.deepEqual(invalidateLabRun(cancelled, stale), cancelled);
});

test("D1 bounded progress keeps input and head history immutable and validates completion/failure", () => {
  const f = runFixture(),
    active = applyLabLifecycle(f.run, "claim", f.command(), f.basis).run;
  const completed = {
    ...active,
    status: "completed",
    revision: active.revision + 1,
    headRevision: 1,
    headManifestId: id(),
    lastCheckpointId: id(),
    currentWorldMinutes: active.input.throughWorldMinutes,
  };
  assert.equal(validateLabProgress(active, completed).status, "completed");
  assert.throws(
    () =>
      validateLabProgress(active, {
        ...completed,
        currentWorldMinutes: active.currentWorldMinutes,
      }),
    /conflict/,
  );
  assert.throws(
    () => validateLabProgress(active, { ...completed, leaseGeneration: 2 }),
    /conflict/,
  );
  assert.throws(
    () => validateLabProgress(active, { ...completed, headRevision: 2 }),
    /conflict/,
  );
  assert.throws(
    () =>
      validateLabProgress(active, { ...completed, label: "Changed premise" }),
    /conflict/,
  );
  const alteredInput = structuredClone(active.input);
  alteredInput.throughWorldMinutes++;
  assert.throws(
    () =>
      validateLabProgress(active, {
        ...completed,
        input: alteredInput,
        inputDigest: labInputDigest(alteredInput),
      }),
    /conflict/,
  );
  const failed = {
    ...active,
    status: "failed",
    reason: "unavailable",
    revision: active.revision + 1,
  };
  assert.equal(validateLabProgress(active, failed).status, "failed");
  assert.equal(
    applyLabLifecycle(failed, "resume", f.command(failed), f.basis).run.status,
    "running",
  );
  assert.throws(() =>
    parseLabRun({ ...active, headRevision: 33, revision: 40 }),
  );
});

test("D1 RPC prepare resolves authority server-side, commits only exact pinned input and retries via receipt", async () => {
  const f = runFixture(),
    calls = [];
  let stored = null;
  const execute = async (args) => {
    calls.push(structuredClone(args));
    assert.equal(args.p_owner_id, f.run.ownerId);
    assert.equal(args.p_campaign_id, f.run.campaignId);
    if (args.p_action === "read") return { data: stored };
    if (args.p_action === "read_detached")
      return {
        data: {
          state: f.state,
          sourceHeads: f.authority.sourceHeads,
          documents: f.authority.documents,
        },
      };
    if (args.p_action === "prepare") {
      stored = {
        ...f.run,
        input: args.p_payload.input,
        inputDigest: args.p_payload.inputDigest,
      };
      return { data: stored };
    }
    throw new Error("unexpected RPC");
  };
  const readState = (value, scope) => {
    assert.deepEqual(scope, {
      ownerId: f.run.ownerId,
      campaignId: f.run.campaignId,
      runId: null,
    });
    return value;
  };
  const store = createRpcLabStore(f.run.ownerId, execute, readState);
  const result = await store.prepare(f.request);
  assert.deepEqual(
    calls.map((call) => call.p_action),
    ["read", "read_detached", "prepare"],
  );
  assert.deepEqual(Object.keys(calls[1].p_payload).sort(), [
    "divergenceVersionId",
    "saveId",
    "scenarioVersionId",
  ]);
  assert.equal(result.inputDigest, f.run.inputDigest);
  f.authority.sourceHeads[0].versionId = id();
  assert.deepEqual(await store.prepare(f.request), result);
  assert.equal(calls.length, 4);
  assert.equal(calls[3].p_action, "read");
  await assert.rejects(() =>
    store.prepare({ ...f.request, sourceVersionIds: [id()] }),
  );
  await assert.rejects(
    () => store.prepare({ ...f.request, label: "Different" }),
    /conflict/,
  );
});

test("D1 RPC never accepts browser authority or returns database/provider diagnostics in errors", async () => {
  const f = runFixture(),
    calls = [];
  const store = createRpcLabStore(
    f.run.ownerId,
    async (args) => {
      calls.push(args);
      return {
        data: null,
        error: { message: "SECRET_DB_DETAIL rpg_forbidden" },
      };
    },
    (value) => value,
  );
  await assert.rejects(() => store.claim({ ...f.command(), ownerId: id() }));
  assert.equal(calls.length, 0);
  await assert.rejects(
    () => store.catalog(f.run.campaignId),
    (error) =>
      error.code === "scope" && !error.message.includes("SECRET_DB_DETAIL"),
  );
  const unavailable = createRpcLabStore(
    f.run.ownerId,
    async () => {
      throw new Error("PRIVATE_PROVIDER_DETAIL");
    },
    (value) => value,
  );
  await assert.rejects(
    () => unavailable.read(f.run.campaignId, f.run.id),
    (error) =>
      error.code === "unavailable" &&
      !error.message.includes("PRIVATE_PROVIDER_DETAIL"),
  );
});
