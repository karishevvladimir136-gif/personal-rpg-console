import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { leafRoot, moduleFromSource } from "./d2a-qa-fixture.mjs";

const { integrationFixture, durableState } = await import(
  new URL(
    "tests/d2a-integration-fixture.mjs",
    leafRoot("D2A_INTEGRATION_SOURCE_ROOT"),
  ).href
);
const { createDetachedRunFence } = await moduleFromSource(
  "src/lib/saves/detached-fence.ts",
);
const { prepareLabSimulation } = await moduleFromSource(
  "src/lib/world-lab/simulation.ts",
);
const { canonicalLabJson } = await moduleFromSource(
  "src/lib/world-lab/inputs.ts",
);
const { sha256 } = await moduleFromSource("src/lib/world-library/parsers.ts");
const { seedSource, liveProjection } = await moduleFromSource(
  "tests/d1-qa-fixture.mjs",
);

async function pending(options = {}) {
  const f = await integrationFixture(options);
  try {
    const approved = await f.approve(),
      preparedRun = await f.store.prepare(approved.request);
    const command = {
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: preparedRun.id,
      expectedRevision: preparedRun.revision,
    };
    const run = await f.store.claim(command),
      state = await f.store.readDetached(f.cid, run.id);
    const prepared = prepareLabSimulation(state, command.operationId);
    assert.equal(prepared.status, "ready", JSON.stringify(prepared));
    const request = {
      operationId: command.operationId,
      fence: createDetachedRunFence(run),
      profile: prepared.profile,
      contractVersion: "world-resolver-simulation-v2",
      contextDigest: sha256(
        canonicalLabJson({
          worldInput: prepared.worldInput,
          scope: prepared.scope,
        }),
      ),
    };
    const writeRequest = () => f.lab("model_request", request);
    const generate = async () => {
      const response = await f.transport
        .resolver(prepared.profile)
        .simulate(prepared.worldInput, prepared.scope, prepared.profile);
      return {
        operationId: command.operationId,
        fence: request.fence,
        result: {
          proposal: response.proposal,
          usage: response.usage,
          error: null,
        },
      };
    };
    return {
      ...f,
      approved,
      run,
      state,
      prepared,
      modelCommand: command,
      modelRequest: request,
      writeRequest,
      generate,
    };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

test("D2A QA durable model receipts preserve exact request/result retries after cancellation with no repeated transport", async () => {
  const f = await pending();
  try {
    const requestReceipt = await f.writeRequest(),
      result = await f.generate();
    const resultReceipt = await f.lab("model_result", result);
    const original = await f.lab("model_read", {
      operationId: f.modelCommand.operationId,
      runId: f.run.id,
    });
    assert.deepEqual(original, {
      request: f.modelRequest,
      result: result.result,
    });
    await f.store.cancel({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: f.run.id,
      expectedRevision: f.run.revision,
    });
    const stable = await durableState(f),
      live = await liveProjection(f),
      calls = f.transport.requests.length;
    assert.deepEqual(await f.writeRequest(), requestReceipt);
    assert.deepEqual(await f.lab("model_result", result), resultReceipt);
    assert.deepEqual(
      await f.lab("model_read", {
        operationId: f.modelCommand.operationId,
        runId: f.run.id,
      }),
      original,
    );
    await assert.rejects(() =>
      f.lab("model_request", {
        ...f.modelRequest,
        contextDigest: "f".repeat(64),
      }),
    );
    await assert.rejects(() =>
      f.lab("model_result", {
        ...result,
        result: {
          ...result.result,
          usage: { ...result.result.usage, outputTokens: 999 },
        },
      }),
    );
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
    assert.equal(f.transport.requests.length, calls);
  } finally {
    await f.db.close();
  }
});

test("D2A QA first model request validates every fence component, pinned model and operation claim without partial receipts", async () => {
  const f = await pending();
  try {
    const stable = await durableState(f);
    for (const key of [
      "ownerId",
      "campaignId",
      "timelineId",
      "runId",
      "manifestId",
      "scenarioVersionId",
      "divergenceVersionId",
    ])
      await assert.rejects(() =>
        f.lab("model_request", {
          ...f.modelRequest,
          fence: { ...f.modelRequest.fence, [key]: randomUUID() },
        }),
      );
    for (const key of ["leaseGeneration", "headRevision", "canonGeneration"])
      await assert.rejects(() =>
        f.lab("model_request", {
          ...f.modelRequest,
          fence: {
            ...f.modelRequest.fence,
            [key]: f.modelRequest.fence[key] + 1,
          },
        }),
      );
    for (const patch of [
      { operationId: randomUUID() },
      { contextDigest: "raw input" },
      { contractVersion: "invented-v3" },
      { profile: { ...f.modelRequest.profile, modelId: "gpt-5.4" } },
      { profile: { ...f.modelRequest.profile, reasoning: "high" } },
    ])
      await assert.rejects(() =>
        f.lab("model_request", { ...f.modelRequest, ...patch }),
      );
    assert.deepEqual(await durableState(f), stable);
    assert.equal(
      f.transport.requests.filter((r) => r.kind === "resolve").length,
      0,
    );
  } finally {
    await f.db.close();
  }
});

for (const mode of ["cancel", "resume", "canon"])
  test(`D2A QA ${mode} after request rejects a late model result without changing the coherent vault`, async () => {
    const f = await pending();
    try {
      await f.writeRequest();
      const result = await f.generate();
      if (mode === "canon")
        await f.one(
          "update rpg_private.timeline_campaigns set canon_generation=canon_generation+1 where campaign_id=$1",
          [f.cid],
        );
      else
        await f.store[mode]({
          operationId: randomUUID(),
          campaignId: f.cid,
          runId: f.run.id,
          expectedRevision: f.run.revision,
        });
      const stable = await durableState(f),
        live = await liveProjection(f);
      await assert.rejects(() => f.lab("model_result", result), /rpg_conflict/);
      assert.deepEqual(await durableState(f), stable);
      assert.deepEqual(await liveProjection(f), live);
      assert.equal(
        (
          await f.lab("model_read", {
            operationId: f.modelCommand.operationId,
            runId: f.run.id,
          })
        ).result,
        null,
      );
    } finally {
      await f.db.close();
    }
  });

test("D2A QA live load and switch do not invalidate an independent pending model result", async () => {
  const f = await pending();
  try {
    await f.writeRequest();
    const result = await f.generate(),
      oldLive = await f.fence(f.cid);
    await f.saves(
      f.cid,
      "load",
      await f.command(f.cid, {
        saveId: f.save.id,
        label: "QA playable fork",
        recovery: false,
      }),
    );
    await f.saves(
      f.cid,
      "switch",
      await f.command(f.cid, {
        timelineId: oldLive.timelineId,
        recovery: false,
      }),
    );
    assert.notEqual((await f.fence(f.cid)).epoch, oldLive.epoch);
    const live = await liveProjection(f),
      before = await durableState(f);
    await f.lab("model_result", result);
    const after = await durableState(f);
    assert.deepEqual(after.runs, before.runs);
    assert.equal(after.versions, before.versions);
    assert.equal(after.manifests, before.manifests);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(
      (
        await f.lab("model_read", {
          operationId: f.modelCommand.operationId,
          runId: f.run.id,
        })
      ).result,
      result.result,
    );
  } finally {
    await f.db.close();
  }
});

test("D2A QA a real Source correction after request invalidates the callback and preserves immutable run input", async () => {
  let source;
  const f = await pending({
    beforeSave: async (f) => {
      source = await seedSource(f);
    },
  });
  try {
    assert.ok(source);
    assert.ok(f.run.input.sourceVersionIds.includes(source.versionId));
    await f.writeRequest();
    const result = await f.generate();
    const text = "A corrected synthetic harbor source.";
    await f.library({
      ...structuredClone(source),
      version: 2,
      previousVersionId: source.versionId,
      versionId: randomUUID(),
      body: {
        ...source.body,
        original: { kind: "text", text },
        digest: sha256(text),
      },
    });
    const stable = await durableState(f);
    await assert.rejects(() => f.lab("model_result", result), /rpg_conflict/);
    assert.deepEqual(await durableState(f), stable);
    const read = await f.lab("read", { runId: f.run.id });
    assert.equal(read.applicable, false);
    assert.equal(read.run.reason, "source_changed");
    assert.deepEqual(read.run.input, f.run.input);
  } finally {
    await f.db.close();
  }
});

test("D2A QA model receipt scope cannot be reused for a sibling, foreign owner, campaign or browser role", async () => {
  const f = await pending();
  try {
    await f.writeRequest();
    const result = await f.generate();
    const sibling = await f.store.prepare({
      ...f.approved.request,
      operationId: randomUUID(),
      label: "QA sibling",
    });
    const siblingRun = await f.store.claim({
      operationId: randomUUID(),
      campaignId: f.cid,
      runId: sibling.id,
      expectedRevision: sibling.revision,
    });
    const { world } = await moduleFromSource(
      "tests/phase35-storage-fixture.mjs",
    );
    const other = await world(f, "QA unrelated campaign"),
      otherLive = await liveProjection(f, other.cid),
      live = await liveProjection(f),
      stable = await durableState(f);
    await assert.rejects(() =>
      f.lab("model_read", {
        operationId: f.modelCommand.operationId,
        runId: sibling.id,
      }),
    );
    await assert.rejects(() =>
      f.lab("model_result", {
        ...result,
        fence: createDetachedRunFence(siblingRun),
      }),
    );
    await assert.rejects(() =>
      f.lab(
        "model_read",
        { operationId: f.modelCommand.operationId, runId: f.run.id },
        f.other,
      ),
    );
    await assert.rejects(() =>
      f.lab("model_result", result, f.owner, other.cid),
    );
    for (const role of ["anon", "authenticated"]) {
      await f.db.exec(`set role ${role}`);
      try {
        await assert.rejects(
          () =>
            f.lab("model_read", {
              operationId: f.modelCommand.operationId,
              runId: f.run.id,
            }),
          /permission denied/,
        );
      } finally {
        await f.db.exec("reset role");
      }
    }
    assert.deepEqual(await durableState(f), stable);
    assert.deepEqual(await liveProjection(f), live);
    assert.deepEqual(await liveProjection(f, other.cid), otherLive);
  } finally {
    await f.db.close();
  }
});
