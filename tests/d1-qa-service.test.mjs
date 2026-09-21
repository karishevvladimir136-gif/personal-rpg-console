import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import {
  qaFixture,
  vaultState,
  liveProjection,
  moduleFromSource,
  sourceText,
} from "./d1-qa-fixture.mjs";

const { createLabService } = await moduleFromSource(
  "src/lib/world-lab/service.ts",
);
const { parseLabRequest } = await moduleFromSource(
  "src/lib/world-lab/validation.ts",
);
const { safeError, readWriteRequest } = await moduleFromSource(
  "src/lib/persistence/http-policy.ts",
);
const command = (run) => ({
  operationId: randomUUID(),
  campaignId: run.campaignId,
  runId: run.id,
  expectedRevision: run.revision,
});

test("D1 QA public service exact retries retain their original checkpoint after later progress with zero provider calls", async (t) => {
  const f = await qaFixture();
  try {
    let providerCalls = 0;
    t.mock.method(globalThis, "fetch", () => {
      providerCalls++;
      throw new Error("QA_UNEXPECTED_PROVIDER_CALL");
    });
    const service = createLabService(f.owner, f.rpc);
    const before = await liveProjection(f);
    const prepared = await service.perform({
      action: "prepare",
      input: f.request,
    });
    const a = { action: "continue", input: command(prepared) };
    const first = await service.perform(a);
    assert.equal(first.currentWorldMinutes, 60);
    assert.equal(first.checkpoints.length, 2);
    const b = { action: "continue", input: command(first) };
    const second = await service.perform(b);
    assert.equal(second.currentWorldMinutes, 120);
    assert.equal(second.status, "completed");
    assert.equal(second.checkpoints.length, 3);
    const stable = await vaultState(f);
    assert.deepEqual(await service.perform(a), first);
    assert.deepEqual(await service.perform(b), second);
    assert.deepEqual(
      await service.perform({ action: "prepare", input: f.request }),
      prepared,
    );
    assert.deepEqual(await vaultState(f), stable);
    assert.deepEqual(await liveProjection(f), before);
    const catalog = await service.catalog(f.cid);
    assert.equal(catalog.runs[0].currentWorldMinutes, 120);
    for (const dto of [prepared, first, second, catalog]) {
      const serialized = JSON.stringify(dto);
      assert.doesNotMatch(
        serialized,
        /PRIVATE_|QA_PRIVATE|inputDigest|sourceHeads|leaseGeneration|headRevision|documentVersions|known_by|privateCount|privatePatches/,
      );
    }
    assert.equal(providerCalls, 0);
  } finally {
    await f.db.close();
  }
});

test("D1 QA lost service commit response resumes the immutable receipt without another step or lease", async () => {
  const f = await qaFixture();
  try {
    let loseResponse = true;
    const rpc = async (args) => {
      const result = await f.rpc(args);
      if (args.p_action === "commit" && !result.error && loseResponse) {
        loseResponse = false;
        throw new Error("QA_PRIVATE_DATABASE_RESPONSE_DETAIL");
      }
      return result;
    };
    const service = createLabService(f.owner, rpc);
    const prepared = await service.perform({
      action: "prepare",
      input: f.request,
    });
    const request = { action: "continue", input: command(prepared) };
    await assert.rejects(
      () => service.perform(request),
      (error) =>
        !error.message.includes("QA_PRIVATE") && error.code === "unavailable",
    );
    const stable = await vaultState(f);
    const restored = await service.perform(request);
    assert.equal(restored.currentWorldMinutes, 60);
    assert.equal(restored.checkpoints.length, 2);
    assert.deepEqual(await vaultState(f), stable);
  } finally {
    await f.db.close();
  }
});

test("D1 QA resolver work pauses at its last coherent checkpoint and resume alone advances no time", async () => {
  const f = await qaFixture({
    transformWorld: (world) => {
      world.threads[0].steps[0].resolution = "resolver_required";
    },
  });
  try {
    const service = createLabService(f.owner, f.rpc);
    const prepared = await service.perform({
      action: "prepare",
      input: f.request,
    });
    const request = { action: "continue", input: command(prepared) };
    const paused = await service.perform(request);
    assert.equal(paused.status, "paused");
    assert.equal(paused.currentWorldMinutes, 0);
    assert.equal(paused.checkpoints.length, 1);
    assert.equal(paused.checkpoints[0].id, prepared.checkpoints[0].id);
    const stable = await vaultState(f);
    assert.deepEqual(await service.perform(request), paused);
    assert.deepEqual(await vaultState(f), stable);
    const resume = { action: "resume", input: command(paused) };
    const resumed = await service.perform(resume);
    assert.equal(resumed.status, "running");
    assert.equal(resumed.currentWorldMinutes, 0);
    assert.deepEqual(resumed.checkpoints, paused.checkpoints);
    const secondPause = await service.perform({
      action: "continue",
      input: command(resumed),
    });
    assert.equal(secondPause.status, "paused");
    assert.equal(secondPause.currentWorldMinutes, 0);
    assert.deepEqual(await service.perform(resume), resumed);
  } finally {
    await f.db.close();
  }
});

test("D1 QA browser requests cannot choose authority; raw failures remain neutral and writes require same origin", async () => {
  const input = {
    operationId: randomUUID(),
    campaignId: randomUUID(),
    saveId: randomUUID(),
    scenarioVersionId: randomUUID(),
    divergenceVersionId: randomUUID(),
    label: "QA run",
    horizonMinutes: 120,
  };
  for (const key of [
    "ownerId",
    "manifestId",
    "sourceVersionIds",
    "privateState",
    "inputDigest",
    "fence",
    "writes",
    "profile",
    "effectiveGuidance",
    "throughWorldMinutes",
  ])
    assert.throws(() =>
      parseLabRequest({
        action: "prepare",
        input: { ...input, [key]: "QA_FORGED_AUTHORITY" },
      }),
    );
  assert.throws(() => parseLabRequest({ action: "commit", input }));
  assert.throws(() =>
    parseLabRequest({
      action: "prepare",
      input: { ...input, horizonMinutes: 43201 },
    }),
  );
  for (const action of ["continue", "pause", "cancel", "resume"])
    assert.throws(() =>
      parseLabRequest({
        action,
        input: {
          ...command({
            id: randomUUID(),
            campaignId: input.campaignId,
            revision: 1,
          }),
          fence: {},
        },
      }),
    );
  for (const raw of [
    new Error("QA_PRIVATE_SQL_DETAIL"),
    {
      code: "42702",
      message: "QA_PRIVATE_SQL_DETAIL",
      where: "QA_PRIVATE_FUNCTION",
    },
    { code: "conflict", message: "QA_PRIVATE_SQL_DETAIL" },
  ])
    assert.doesNotMatch(JSON.stringify(safeError(raw)), /QA_PRIVATE/);
  for (const origin of [undefined, "https://foreign.example"])
    await assert.rejects(() =>
      readWriteRequest(
        new Request("https://local.example/api/world-lab", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            ...(origin ? { origin } : {}),
          },
          body: JSON.stringify({ action: "prepare", input }),
        }),
      ),
    );
  const route = await sourceText("src/app/api/world-lab/route.ts");
  const server = await sourceText("src/lib/server/world-lab.ts");
  assert.match(route, /parseLabRequest\(await readWriteRequest\(request\)\)/);
  assert.match(route, /errorResponse\(worldLabError\(cause\)\)/);
  assert.match(server, /import "server-only"/);
  assert.match(server, /await authorizeCampaign\(campaignId\)/);
});
