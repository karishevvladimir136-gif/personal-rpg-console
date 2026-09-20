import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { waveFixture, configuredWorld } from "./wave1-integration-fixture.mjs";
import { createRpcTurnStore } from "../src/lib/gameplay/dm-store.ts";
import { runTurn, resumeTurn } from "../src/lib/gameplay/turn-engine.ts";
import {
  worldLogicTurnPreparer,
  worldTurnPreparer,
} from "../src/lib/production/turn-world.ts";
import { WORLD_LOGIC_REF } from "../src/lib/rulesets/profiles.ts";
import { stageResolvedWorldTransition } from "../src/lib/world/resolver.ts";

const usage = {
  model: "gpt-6-astra",
  inputTokens: 1,
  outputTokens: 1,
  latencyMs: 0,
};
async function configured(f, resolver = false) {
  const w = await configuredWorld(f);
  await f.one(
    "update public.rpg_entities set hp=null,max_hp=null,stats='{}' where id=$1",
    [w.hero],
  );
  await f.one(
    "update rpg_private.runtime_state set configuration=null where campaign_id=$1",
    [w.cid],
  );
  w.state.actors.push({
    id: w.hero,
    campaignId: w.cid,
    revision: 1,
    kind: "entity",
    entityId: w.hero,
    control: "player",
    publicName: "Ari",
    locationId: w.location,
    capabilities: ["observation"],
    knowledge: [],
  });
  if (resolver) w.state.threads[0].steps[0].resolution = "resolver_required";
  else w.state.threads = [];
  await f.write(w.cid, "configure", {
    world: w.state,
    ruleset: WORLD_LOGIC_REF,
  });
  return w;
}
async function dependencies(f, w, options = {}) {
  const fence = await f.fence(w.cid);

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
      return { data: null, error: { message: e.message, code: e.code } };
    }
  };
  const store = createRpcTurnStore(f.owner, rpc, "gpt-6-astra", fence);
  const calls = { action: 0, resolver: 0, narration: 0, plan: 0 };
  const worldOptions = {
    action: async (input) => {
      calls.action++;
      return {
        output: {
          schemaVersion: 1,
          actorId: w.hero,
          input: input.input.input,
          action: "observe",
          outcome: "completed",
          uncertainty: options.uncertain ? "missing_evidence" : "resolved",
          capabilityRefs: ["observation"],
          circumstanceRefs: ["public-state"],
          evidenceIndexes: [],
          publicText: "You examine the familiar crossing.",
          elapsedMinutes: options.uncertain ? 0 : 20,
          destinationId: null,
        },
        usage,
      };
    },
    resolve: async (input) => {
      calls.resolver++;
      return {
        result: stageResolvedWorldTransition(input, {
          schemaVersion: 1,
          decisions: [
            {
              threadId: w.state.threads[0].id,
              stepId: w.state.threads[0].steps[0].id,
              decision: "advance",
              uncertainty: "resolved",
              capabilityRefs: [],
              evidenceIndexes: [],
            },
          ],
        }),
        usage,
      };
    },
  };
  const deps = {
    store,
    prepareWorldLogic: worldLogicTurnPreparer(f.rpc, worldOptions),
    prepareWorld: worldTurnPreparer(f.rpc, worldOptions),
    provider: {
      plan: async () => {
        calls.plan++;
        throw new Error("Legacy planner must not run");
      },
      feedback: async () => {
        throw new Error("No feedback expected");
      },
      narrate: async () => {
        calls.narration++;
        if (options.failNarration) throw { code: "provider", retryable: true };
        return {
          output: {
            narration: "The crossing is quiet.",
            visualDescription: "",
            clarification: null,
          },
          usage,
        };
      },
    },
  };
  const input = {
    operationId: randomUUID(),
    campaignId: w.cid,
    timeline: fence,
    expectedRevision: (await f.read(w.cid)).runtimeRevision,
    mode: "game",
    input: "I examine the crossing.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  return { deps, input, calls };
}

for (const resolver of [false, true])
  test(`Wave 2 full SQL turn settles World Logic without HP/d20 ${resolver ? "with bounded resolver" : "and without mechanics configuration"}`, async () => {
    const f = await waveFixture();
    try {
      const w = await configured(f, resolver),
        x = await dependencies(f, w);
      const turn = await runTurn(x.input, x.deps);
      assert.equal(turn.status, "committed", JSON.stringify(turn));
      assert.deepEqual(turn.checks, []);
      assert.equal(x.calls.plan, 0);
      assert.equal(x.calls.action, 1);
      assert.equal(x.calls.resolver, resolver ? 1 : 0);
      assert.equal((await f.runtime(w.cid, "play")).configuration, null);
      const rows = await f.query(
        "select event from rpg_private.world_events where campaign_id=$1",
        [w.cid],
      );
      assert.equal(
        rows.filter((r) => r.event.kind === "world.logic.resolved").length,
        1,
      );
      assert.equal(rows.length, resolver ? 3 : 1);
      await runTurn(x.input, x.deps);
      assert.equal(x.calls.action, 1);
      assert.ok(!JSON.stringify(turn).includes("PRIVATE_WAVE1_EVENT"));
      assert.equal(
        (
          await f.one("select hp from public.rpg_entities where id=$1", [
            w.hero,
          ])
        ).hp,
        null,
      );
    } finally {
      await f.db.close();
    }
  });

for (const activate of [false, true])
  test(`Wave 2 actual World Logic retry after ${activate ? "load/branch/epoch" : "manual save/head"} reuses proposal and resolver receipt`, async () => {
    const f = await waveFixture();
    try {
      const w = await configured(f, true),
        x = await dependencies(f, w, { failNarration: true });
      const pending = await runTurn(x.input, x.deps);
      assert.equal(pending.status, "failed", JSON.stringify(pending));
      assert.equal(pending.failure, "provider");
      const oldStage = (
        await f.one(
          "select settlement from rpg_private.world_stages where campaign_id=$1",
          [w.cid],
        )
      ).settlement;
      const saved = await f.saves(
        w.cid,
        "create",
        await f.command(w.cid, { kind: "manual", name: "World Logic pending" }),
      );
      if (activate)
        await f.saves(
          w.cid,
          "load",
          await f.command(w.cid, {
            saveId: saved.snapshot.saves.find(
              (s) => s.name === "World Logic pending",
            ).id,
            label: "Resume on child",
            recovery: false,
          }),
        );
      const y = await dependencies(f, w);
      const command = {
        commandId: randomUUID(),
        campaignId: w.cid,
        operationId: x.input.operationId,
        timeline: await f.fence(w.cid),
        action: "retry",
        checkId: null,
      };
      const completed = await resumeTurn(command, y.deps);
      assert.equal(completed.status, "committed", JSON.stringify(completed));
      assert.equal(y.calls.action, 0);
      assert.equal(y.calls.resolver, 0);
      assert.equal(y.calls.plan, 0);
      assert.deepEqual(
        (
          await f.one(
            "select settlement from rpg_private.world_stages where campaign_id=$1",
            [w.cid],
          )
        ).settlement,
        oldStage,
      );
      const rows = await f.query(
        "select event from rpg_private.world_events where campaign_id=$1 order by event->>'id'",
        [w.cid],
      );
      assert.equal(rows.length, 3);
      assert.ok(
        rows.every(
          (r) => r.event.originTimelineId === oldStage.timeline.timelineId,
        ),
      );
      assert.equal((await resumeTurn(command, y.deps)).status, "committed");
      assert.equal(
        (
          await f.query(
            "select id from rpg_private.world_events where campaign_id=$1",
            [w.cid],
          )
        ).length,
        3,
      );
    } finally {
      await f.db.close();
    }
  });

test("Wave 2 explicit uncertainty retains input and proposal, makes no dice or world events, permits cancellation and a new action", async () => {
  const f = await waveFixture();
  try {
    const w = await configured(f),
      x = await dependencies(f, w, { uncertain: true });
    const turn = await runTurn(x.input, x.deps);
    assert.equal(turn.status, "failed");
    assert.equal(turn.canRetry, false);
    assert.deepEqual(turn.checks, []);
    assert.equal(turn.worldUncertainty, "missing_evidence");
    const row = await f.one(
      "select input,checkpoint from rpg_private.turns where id=$1",
      [x.input.operationId],
    );
    assert.equal(row.input.input, x.input.input);
    assert.equal(row.checkpoint.worldLogic.uncertainty, "missing_evidence");
    assert.equal(x.calls.narration, 0);
    assert.equal(
      (
        await f.query(
          "select id from rpg_private.world_events where campaign_id=$1",
          [w.cid],
        )
      ).length,
      0,
    );
    await resumeTurn(
      {
        commandId: randomUUID(),
        campaignId: w.cid,
        operationId: x.input.operationId,
        timeline: x.input.timeline,
        action: "cancel",
        checkId: null,
      },
      x.deps,
    );
    const next = await dependencies(f, w);
    assert.equal((await runTurn(next.input, next.deps)).status, "committed");
  } finally {
    await f.db.close();
  }
});
