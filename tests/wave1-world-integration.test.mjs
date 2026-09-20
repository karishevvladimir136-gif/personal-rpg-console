import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id, turn } from "./phase2-mechanics-fixtures.mjs";
import {
  emptyPlan,
  memoryStore,
  providerDouble,
} from "./phase2-turn-store-fixture.mjs";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";

const warning = "На мосту появился огонь. До обрушения ещё можно отступить.";
const privateCause = "PRIVATE_WORLD_WARNING_CAUSE";

/** The preparer is already validated at its separate domain/SQL boundaries.
 * This double isolates the existing turn engine's narration/commit obligation. */
function preparedWarning() {
  let calls = 0;
  return {
    get calls() {
      return calls;
    },
    async prepareWorld(claim, resolution, previous) {
      calls++;
      const input = claim.turn.input;
      const event = {
        schemaVersion: 1,
        id: id("public-world-warning"),
        campaignId: input.campaignId,
        originTimelineId: id("timeline"),
        operationId: input.operationId,
        worldMinutes: resolution.worldMinutes,
        kind: "world.observed",
        actorIds: [],
        threadIds: [],
        visibility: "public",
        text: warning,
        evidence: [],
        payload: {},
      };
      const settlement = {
        operationId: input.operationId,
        campaignId: input.campaignId,
        timeline: { timelineId: id("timeline"), epoch: 1 },
        expectedRevision: 1,
        expectedRuntimeRevision: claim.lease.expectedRevision,
        expectedHeadId: id("head"),
        schemaVersion: 1,
        status: "staged",
        fromWorldMinutes: claim.source.runtime.worldMinutes,
        throughWorldMinutes: resolution.worldMinutes,
        sourceVersionIds: [],
        events: [
          {
            ...event,
            id: id("private-world-warning"),
            kind: "world.thread.advanced",
            visibility: "private",
            text: privateCause,
          },
          event,
        ],
        nextWorld: { schemaVersion: 1, campaignId: input.campaignId },
      };
      if (previous) assert.deepEqual(previous, settlement);
      return {
        settlement,
        resolution: {
          ...resolution,
          outcomes: [
            ...resolution.outcomes.filter(
              (outcome) => outcome.kind !== "world.observed",
            ),
            {
              kind: "world.observed",
              text: warning,
              entityIds: [],
              itemIds: [],
            },
          ],
        },
      };
    },
  };
}

const occurrenceCount = (text) => text.split(warning).length - 1;

test("a validated public world warning survives Russian mechanical narration", async () => {
  const source = fixture();
  source.snapshot.settings.values.language = "ru";
  source.snapshot.campaign.language = "ru";
  const { store, state } = memoryStore(source);
  const { provider, calls } = providerDouble();
  const prepared = preparedWarning();
  const input = turn(source, {
    kind: "resource.spend",
    entityId: id("player"),
    resource: "focus",
    amount: 1,
  });
  const result = await runTurn(input, {
    store,
    provider,
    prepareWorld: prepared.prepareWorld,
  });
  assert.equal(result.status, "committed");
  assert.equal(prepared.calls, 1);
  assert.equal(calls.narrate, 0);
  assert.equal(occurrenceCount(result.narration), 1);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_WORLD_WARNING_CAUSE/);
  assert.equal(state.source.snapshot.entities[0].resources.focus, 3);
});

test("provider omission cannot hide a public warning, and retry preserves it exactly once", async () => {
  const source = fixture();
  const { store, state } = memoryStore(source);
  const { provider, calls } = providerDouble(emptyPlan());
  const prepared = preparedWarning();
  const originalCommit = store.commit;
  let attempts = 0;
  store.commit = async (lease, packet) => {
    attempts++;
    assert.equal(occurrenceCount(packet.narration), 1);
    assert.doesNotMatch(packet.narration, /PRIVATE_WORLD_WARNING_CAUSE/);
    if (attempts === 1) throw new Error("Synthetic transient commit failure.");
    return originalCommit(lease, packet);
  };
  const input = turn(source);
  const dependencies = { store, provider, prepareWorld: prepared.prepareWorld };
  const failed = await runTurn(input, dependencies);
  assert.equal(failed.status, "failed");
  assert.equal(failed.canRetry, true);
  assert.equal(state.commits, 0);
  const result = await resumeTurn(
    {
      commandId: id("warning-retry"),
      campaignId: input.campaignId,
      operationId: input.operationId,
      action: "retry",
      checkId: null,
    },
    dependencies,
  );
  assert.equal(result.status, "committed");
  assert.equal(occurrenceCount(result.narration), 1);
  assert.equal(prepared.calls, 2);
  assert.equal(calls.narrate, 1);
  assert.equal(state.commits, 1);
  assert.deepEqual(await runTurn(input, dependencies), result);
  assert.equal(prepared.calls, 2);
});

test("a provider's existing exact public warning is not duplicated by the turn engine", async () => {
  const source = fixture();
  const { store } = memoryStore(source);
  const { provider } = providerDouble();
  const narrate = provider.narrate;
  provider.narrate = async (...args) => {
    const result = await narrate(...args);
    result.output.narration += " " + warning;
    return result;
  };
  const prepared = preparedWarning();
  const result = await runTurn(turn(source), {
    store,
    provider,
    prepareWorld: prepared.prepareWorld,
  });
  assert.equal(result.status, "committed");
  assert.equal(prepared.calls, 1);
  assert.equal(occurrenceCount(result.narration), 1);
  assert.doesNotMatch(JSON.stringify(result), /PRIVATE_WORLD_WARNING_CAUSE/);
});
