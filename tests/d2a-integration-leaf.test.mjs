import test from "node:test";
import assert from "node:assert/strict";
import {
  integrationFixture,
  moduleFromSource,
  command,
} from "./d2a-integration-fixture.mjs";

const { prepareLabSimulation, stageLabSimulation } = await moduleFromSource(
  "src/lib/world-lab/simulation.ts",
);

test("D2A actual Library approval and detached SQL read reach the production resolver with the exact saved supplies", async (t) => {
  t.mock.method(globalThis, "fetch", () => {
    throw new Error("UNEXPECTED_NETWORK");
  });
  const f = await integrationFixture();
  try {
    const live = await f.active();
    const approved = await f.approve();
    assert.equal(approved.scenario.version, 3);
    assert.equal(approved.scenario.body.composition.phase, "approved");
    assert.equal(f.transport.requests.length, 1);
    const run = await f.store.prepare(approved.request);
    assert.deepEqual(run.input.executionProfile, f.simulationProfile);
    assert.equal(run.input.resolutionPolicy.id, "single-model-world-v1");
    const request = command(run);
    const claimed = await f.store.claim(request);
    const state = await f.store.readDetached(f.cid, claimed.id);
    const prepared = prepareLabSimulation(state, request.operationId);
    assert.equal(prepared.status, "ready", JSON.stringify(prepared));
    assert.equal(prepared.worldInput.resolution.worldMinutes, 60);
    assert.equal(prepared.selection.candidates.length, 1);
    const resolved = await f.transport
      .resolver(prepared.profile)
      .simulate(prepared.worldInput, prepared.scope, prepared.profile);
    const plan = stageLabSimulation(
      state,
      request.operationId,
      resolved.proposal,
    );
    assert.equal(plan.status, "staged", JSON.stringify(plan));
    assert.equal(
      plan.result.consequenceChanges.find((c) => c.family === "items").values
        .quantity,
      8,
    );
    assert.deepEqual(
      plan.result.consequenceChanges.find((c) => c.family === "entities")
        .values,
      { resources: { focus: 4 }, conditions: ["wet"] },
    );
    assert.equal(f.transport.requests.length, 2);
    assert.deepEqual(await f.active(), live);
    assert.equal(
      (await f.store.readDetached(f.cid, run.id)).run.currentWorldMinutes,
      0,
    );
    assert.equal(
      (await f.store.readDetached(f.cid, run.id)).records[
        "public.rpg_items"
      ].find((i) => i.id === f.supplies).quantity,
      10,
    );
  } finally {
    await f.db.close();
  }
});
