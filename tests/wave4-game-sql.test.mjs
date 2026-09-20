import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

// The independent QA helper is a separate worker commit until integration.
// Integrated runs always use the repository-local helper. Its existing
// WAVE4_QA_SOURCE_ROOT / WAVE4_QA_MIGRATION overrides select disposable sources.
const localHelper = new URL("./wave4-qa-fixture.mjs", import.meta.url);
const helper = existsSync(fileURLToPath(localHelper))
  ? localHelper
  : new URL("../../wave4-qa/tests/wave4-qa-fixture.mjs", import.meta.url);
const { commerceFixture, moduleFromSource, persistedState } = await import(
  helper.href
);
const { createRpcTurnStore } = await moduleFromSource("gameplay/dm-store.ts");
const { recordServerRoll } = await moduleFromSource("gameplay/dice.ts");
const { foundationTurnPreparer } = await moduleFromSource(
  "foundation-loop/turn.ts",
);
const { worldLogicTurnPreparer, worldTurnPreparer } = await moduleFromSource(
  "production/turn-world.ts",
);
const {
  foundationTransferCapability,
  foundationMerchantUnavailableCapability,
  planFoundationAction,
} = await moduleFromSource("foundation-actions/index.ts");
const { WORLD_LOGIC_REF } = await moduleFromSource("rulesets/profiles.ts");

async function gameFixture(profile = "console_basic") {
  const f = await commerceFixture();
  try {
    // This is explicit synthetic fixture setup, never an owner workflow or
    // permission bypass. Configure a World Logic profile before opening a turn.
    if (profile === "world_logic") {
      const context = await f.read();
      const player = context.world.actors.find((a) => a.id === f.hero);
      player.capabilities.push(
        foundationTransferCapability("theft", "item", f.merchant, f.stock, 2),
      );
      await f.one(
        "update rpg_private.world_foundations set ruleset=$2::jsonb,loop_state=jsonb_set(loop_state,'{profile}',$2::jsonb),world=$3::jsonb,revision=revision+1 where campaign_id=$1",
        [f.cid, JSON.stringify(WORLD_LOGIC_REF), JSON.stringify(context.world)],
      );
      await f.one(
        "update rpg_private.runtime_state set configuration=null where campaign_id=$1",
        [f.cid],
      );
      await f.one(
        "update public.rpg_entities set hp=null,max_hp=null,stats='{}' where campaign_id=$1",
        [f.cid],
      );
    }
    await f.one(
      "update rpg_private.timeline_campaigns set policy=jsonb_set(policy,'{autosave}','\"turn\"') where campaign_id=$1",
      [f.cid],
    );
    const errors = [];
    const runtimeRpc = async (args) => {
      try {
        return {
          data: await f.runtime(
            args.p_campaign_id,
            args.p_action,
            args.p_payload,
            args.p_timeline,
          ),
        };
      } catch (error) {
        errors.push({
          action: args.p_action,
          message: error.message,
          where: error.where,
        });
        return {
          data: null,
          error: { message: error.message, code: error.code },
        };
      }
    };
    const timeline = await f.fence(f.cid);
    const turnStore = createRpcTurnStore(
      f.owner,
      runtimeRpc,
      "synthetic-scripted",
      timeline,
    );
    return { ...f, profile, timeline, turnStore, errors };
  } catch (error) {
    await f.db.close();
    throw error;
  }
}

async function stageGame(
  f,
  {
    action = "trade",
    success = true,
    spendFocus = false,
    tamperSettlement = null,
    closeMerchant = false,
  } = {},
) {
  const input = {
    operationId: randomUUID(),
    campaignId: f.cid,
    expectedRevision: (await f.runtime(f.cid, "play")).revision,
    timeline: f.timeline,
    mode: "game",
    input:
      action === "trade"
        ? "Buy two lanterns for exactly 20 credits."
        : action === "quote"
          ? "What do two lanterns cost?"
          : "I attempt to take two lanterns from the merchant.",
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  const proposal =
    action === "trade" || action === "quote"
      ? {
          schemaVersion: 1,
          action,
          input: input.input,
          expectedPayment: action === "trade" ? 20 : null,
          intent: {
            merchantActorId: f.merchant,
            playerEntityId: f.hero,
            take: [{ itemId: f.stock, quantity: 2 }],
            give: [],
            currencyId: "credits",
            haggle: "none",
          },
        }
      : {
          schemaVersion: 1,
          action,
          input: input.input,
          merchantActorId: f.merchant,
          playerEntityId: f.hero,
          take: [{ itemId: f.stock, quantity: 2 }],
          currency:
            action === "robbery" ? { currencyId: "credits", amount: 10 } : null,
          merchantUnavailable: closeMerchant,
          checkIndex: f.profile === "console_basic" ? 0 : null,
        };
  await f.turnStore.begin(input);
  const claim = await f.turnStore.claim(f.cid, input.operationId);
  assert.ok(claim, JSON.stringify(f.errors));
  const checkpoint = claim.turn.checkpoint;
  const check = {
    index: 0,
    actorId: f.hero,
    targetId: f.merchant,
    kind: "skill",
    stat: "skill",
    dc: 12,
    dcPublic: true,
    visibility: "player",
    important: true,
    uncertainty: "meaningful",
    advantage: "normal",
  };
  const needsCheck =
    f.profile === "console_basic" && !["quote", "trade"].includes(action);
  checkpoint.plan = {
    narration: "PRIVATE_STAGED_PLAN",
    checks: needsCheck ? [check] : [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
    ...(f.profile === "console_basic" ? { foundationAction: proposal } : {}),
  };
  if (f.profile === "world_logic") {
    const capability = foundationTransferCapability(
      "theft",
      "item",
      f.merchant,
      f.stock,
      2,
    );
    const prepared = await worldLogicTurnPreparer(f.rpc, {
      action: async () => ({
        output: {
          schemaVersion: 2,
          actorId: f.hero,
          input: input.input,
          action: "attempt",
          outcome: success ? "completed" : "blocked",
          uncertainty: "resolved",
          capabilityRefs: [capability],
          circumstanceRefs: ["public-state"],
          evidenceIndexes: [],
          publicText: "A bounded attempt.",
          elapsedMinutes: 5,
          destinationId: null,
          consequences: [],
          foundationAction: proposal,
        },
        usage: {
          model: "synthetic-scripted",
          inputTokens: 0,
          outputTokens: 0,
          calls: 0,
          latencyMs: 0,
        },
      }),
    })(claim, null);
    checkpoint.worldLogic = prepared.proposal;
    checkpoint.foundationAction = prepared.foundationAction;
    checkpoint.resolution = prepared.resolution;
  }
  await f.turnStore.checkpoint(claim.lease, checkpoint, "generating");
  if (needsCheck)
    checkpoint.checks = await f.turnStore.recordChecks(claim.lease, [
      recordServerRoll(input.operationId, check, 2, 1, () =>
        success ? 15 : 2,
      ),
    ]);
  if (!checkpoint.resolution) {
    const player = claim.source.snapshot.entities.find((e) => e.id === f.hero);
    checkpoint.resolution = {
      changes: spendFocus
        ? [
            {
              family: "entities",
              id: f.hero,
              expectedRevision: player.revision,
              values: {
                resources: {
                  ...player.resources,
                  focus: player.resources.focus - 1,
                },
              },
            },
          ]
        : [],
      worldMinutes: claim.source.runtime.worldMinutes + 5,
      configuration: claim.source.runtime.configuration,
      outcomes: [],
    };
  }
  await f.turnStore.checkpoint(claim.lease, checkpoint, "generating");
  const world = await worldTurnPreparer(f.rpc)(
    claim,
    checkpoint.resolution,
    null,
  );
  if (world) {
    checkpoint.worldSettlement = world.settlement;
    checkpoint.resolution = world.resolution;
    await f.turnStore.checkpoint(claim.lease, checkpoint, "generating");
  }
  checkpoint.foundationSettlement = await foundationTurnPreparer(f.rpc)(claim);
  assert.ok(checkpoint.foundationSettlement);
  if (tamperSettlement)
    await tamperSettlement(checkpoint.foundationSettlement, claim);
  await f.turnStore.checkpoint(claim.lease, checkpoint, "generating");
  const packet = {
    narration:
      "The requested action settles. " +
      checkpoint.foundationSettlement.plan.events.map((e) => e.text).join(" "),
    visualDescription: "",
    resolution: checkpoint.resolution,
    privatePatches: [],
    checks: checkpoint.checks,
    guidanceProposal: null,
    foundationSettlement: checkpoint.foundationSettlement,
    ...(checkpoint.worldSettlement
      ? { worldSettlement: checkpoint.worldSettlement }
      : {}),
  };
  return {
    input,
    claim,
    checkpoint,
    packet,
    settlement: checkpoint.foundationSettlement,
    commit: () => f.turnStore.commit(claim.lease, packet),
    rawCommit: (override = {}, timeline = f.timeline) =>
      f.runtime(
        f.cid,
        "commit",
        {
          ...claim.lease,
          packet: { ...packet, ...override },
        },
        timeline,
      ),
  };
}

async function snapshot(f) {
  return {
    ...(await persistedState(f)),
    ...(await f.one(
      `select (select count(*)::integer from public.rpg_scenes where campaign_id=$1) scenes,
      (select count(*)::integer from rpg_private.runtime_events where campaign_id=$1) runtime_events`,
      [f.cid],
    )),
  };
}

async function capturedRows(f, operationId, table) {
  return f.query(
    `select v.payload from rpg_private.save_points s
      join rpg_private.timeline_manifests m on m.id=s.manifest_id and m.campaign_id=s.campaign_id
      cross join lateral jsonb_array_elements_text(coalesce(m.refs->$3,'[]'::jsonb)) r(id)
      join rpg_private.timeline_versions v on v.id=r.id::uuid and v.campaign_id=s.campaign_id
      where s.campaign_id=$1 and s.trigger_key=$2 and v.table_name=$3`,
    [f.cid, `turn:${operationId}`, table],
  );
}

test("Wave4 Game SQL trade shares its turn operation, atomic base commit, exact retry and complete autosave capture", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f),
      before = await snapshot(f);
    const result = await x.commit();
    assert.equal(result.status, "committed", JSON.stringify(f.errors));
    const after = await snapshot(f);
    assert.equal(after.turns, before.turns);
    assert.equal(after.runtime_events, before.runtime_events + 1);
    assert.equal(after.scenes, before.scenes + 2);
    assert.ok(after.runtime > before.runtime);
    assert.equal(result.committedRevision, after.runtime);
    assert.equal(
      after.entities.find((e) => e.id === f.hero).resources.credits,
      80,
    );
    assert.equal(
      after.entities.find((e) => e.id === f.merchant).resources.credits,
      220,
    );
    assert.equal(after.items.find((i) => i.id === f.stock).quantity, 4);
    const transferred =
      x.settlement.plan.events[0].payload.lines[0].transferredItemId;
    assert.equal(
      after.items.find((i) => i.id === transferred).owner_entity_id,
      f.hero,
    );
    const events = await f.query(
      "select operation_id,event from rpg_private.world_events where campaign_id=$1 and operation_id=$2",
      [f.cid, x.input.operationId],
    );
    assert.equal(
      events.filter((e) => e.event.kind === "commerce.trade").length,
      1,
    );
    assert.ok(
      events.every(
        (e) =>
          e.event.operationId === x.input.operationId &&
          e.operation_id === x.input.operationId,
      ),
    );
    assert.equal(
      (
        await f.one(
          "select count(*)::integer count from rpg_private.turns where id=$1",
          [x.input.operationId],
        )
      ).count,
      1,
    );
    const savedItems = (
      await capturedRows(f, x.input.operationId, "public.rpg_items")
    ).map((r) => r.payload);
    assert.equal(
      savedItems.find((i) => i.id === transferred).owner_entity_id,
      f.hero,
    );
    assert.equal(savedItems.find((i) => i.id === f.stock).quantity, 4);
    const savedFoundation = (
      await capturedRows(
        f,
        x.input.operationId,
        "rpg_private.world_foundations",
      )
    )[0].payload;
    assert.deepEqual(savedFoundation.loop_state, x.settlement.plan.state);
    const savedTurns = (
      await capturedRows(f, x.input.operationId, "rpg_private.turns")
    ).map((r) => r.payload);
    assert.equal(
      savedTurns.find((t) => t.id === x.input.operationId).status,
      "committed",
    );
    const savedEvents = (
      await capturedRows(f, x.input.operationId, "rpg_private.world_events")
    ).map((r) => r.payload);
    assert.equal(
      savedEvents.filter(
        (e) =>
          e.operation_id === x.input.operationId &&
          e.event.kind === "commerce.trade",
      ).length,
      1,
    );
    assert.deepEqual(await x.commit(), result);
    assert.deepEqual(await snapshot(f), after);
    assert.doesNotMatch(
      JSON.stringify(result),
      /PRIVATE_|foundationSettlement|itemPolicies/,
    );
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL quote persists a computed event without financial changes or a loop version increment", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f, { action: "quote" }),
      before = await snapshot(f);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await snapshot(f);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.foundation.loop_state, before.foundation.loop_state);
    const event = await f.one(
      "select event from rpg_private.world_events where operation_id=$1 and event->>'kind'='commerce.quote'",
      [x.input.operationId],
    );
    assert.equal(event.event.payload.payment, 20);
    assert.match(event.event.text, /20 Credits/);
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL late base-commit failure rolls back items, payment, events, history and autosave together", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f, { spendFocus: true });
    const before = await snapshot(f);
    await assert.rejects(x.rawCommit({ narration: "" }), /rpg_validation/);
    assert.deepEqual(await snapshot(f), before);
    assert.equal(
      (await f.runtime(f.cid, "get", { operationId: x.input.operationId }))
        .status,
      "generating",
    );
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL applies ordinary resource changes before trade and respects both row revisions", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f, { spendFocus: true });
    const before = await f.one(
      "select resources,revision from public.rpg_entities where id=$1",
      [f.hero],
    );
    const baseChange = x.packet.resolution.changes.find((c) => c.id === f.hero);
    const tradeChange = x.settlement.plan.changes.find((c) => c.id === f.hero);
    assert.equal(baseChange.expectedRevision, before.revision);
    assert.equal(tradeChange.expectedRevision, before.revision + 1);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await f.one(
      "select resources,revision from public.rpg_entities where id=$1",
      [f.hero],
    );
    assert.equal(after.resources.focus, before.resources.focus - 1);
    assert.equal(after.resources.credits, before.resources.credits - 20);
    assert.equal(after.revision, before.revision + 2);
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL legacy recorded skill success authorizes exact stolen transfer and preserves the recorded roll", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f, { action: "theft" });
    const recorded = structuredClone(x.checkpoint.checks);
    assert.equal(recorded[0].actorId, f.hero);
    assert.equal(recorded[0].targetId, f.merchant);
    assert.equal(recorded[0].success, true);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await f.read();
    const transferred =
      x.settlement.plan.events[0].payload.transfers[0].transferredItemId;
    assert.equal(
      after.snapshot.items.find((i) => i.id === transferred).quantity,
      2,
    );
    assert.equal(
      after.snapshot.items.find((i) => i.id === transferred).owner_entity_id,
      f.hero,
    );
    assert.equal(
      after.state.itemPolicies.find((p) => p.itemId === transferred).origin,
      "stolen",
    );
    assert.equal(
      after.state.itemPolicies.find((p) => p.itemId === f.stock).origin,
      "legitimate",
    );
    assert.deepEqual(
      (
        await f.one(
          "select checkpoint->'checks' checks from rpg_private.turns where id=$1",
          [x.input.operationId],
        )
      ).checks,
      recorded,
    );
    assert.equal(
      (
        await f.one(
          "select resources->>'credits' credits from public.rpg_entities where id=$1",
          [f.hero],
        )
      ).credits,
      "100",
    );
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL failed robbery commits a no-transfer outcome with no partial item or currency gain", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f, { action: "robbery", success: false }),
      before = await snapshot(f);
    assert.equal(x.checkpoint.checks[0].success, false);
    assert.deepEqual(x.settlement.plan.changes, []);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await snapshot(f);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.entities, before.entities);
    const event = await f.one(
      "select event from rpg_private.world_events where operation_id=$1 and event->>'kind'='foundation.action_resolved'",
      [x.input.operationId],
    );
    assert.equal(event.event.payload.outcome, "blocked");
    assert.doesNotMatch(event.event.text, /detect|witness|police/i);
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL failed public robbery may close a merchant only through its separate installed capability", async () => {
  const f = await gameFixture();
  try {
    const context = await f.read();
    context.world.actors
      .find((actor) => actor.id === f.hero)
      .capabilities.push(foundationMerchantUnavailableCapability(f.merchant));
    await f.one(
      "update rpg_private.world_foundations set world=$2::jsonb,revision=revision+1 where campaign_id=$1",
      [f.cid, JSON.stringify(context.world)],
    );
    const x = await stageGame(f, {
      action: "robbery",
      success: false,
      closeMerchant: true,
    });
    const before = await snapshot(f);
    assert.deepEqual(x.settlement.plan.changes, []);
    assert.equal(x.settlement.plan.state.merchants[0].available, false);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await snapshot(f);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.entities, before.entities);
    assert.equal(after.foundation.loop_state.merchants[0].available, false);
    const events = await f.query(
      "select event from rpg_private.world_events where operation_id=$1",
      [x.input.operationId],
    );
    assert.equal(
      events.filter((e) => e.event.kind === "commerce.merchant_unavailable")
        .length,
      1,
    );
    assert.doesNotMatch(
      JSON.stringify(events.map((e) => e.event.text)),
      /detect|witness|police/i,
    );
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL World Logic exact installed capability settles without HP or recorded dice", async () => {
  const f = await gameFixture("world_logic");
  try {
    const x = await stageGame(f, { action: "theft" });
    assert.deepEqual(x.checkpoint.checks, []);
    assert.equal(
      (await x.commit()).status,
      "committed",
      JSON.stringify(f.errors),
    );
    const after = await f.read();
    const transferred = x.settlement.plan.events.find(
      (e) => e.kind === "foundation.action_resolved",
    ).payload.transfers[0].transferredItemId;
    assert.equal(
      after.snapshot.items.find((i) => i.id === transferred).owner_entity_id,
      f.hero,
    );
    assert.equal(after.snapshot.entities.find((e) => e.id === f.hero).hp, null);
    const events = await f.query(
      "select event from rpg_private.world_events where operation_id=$1",
      [x.input.operationId],
    );
    assert.equal(
      events.filter((e) => e.event.kind === "world.logic.resolved").length,
      1,
    );
    assert.equal(
      events.filter((e) => e.event.kind === "foundation.action_resolved")
        .length,
      1,
    );
    assert.ok(
      events.every((e) => e.event.worldMinutes === x.settlement.worldMinutes),
    );
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL stale foundation and timeline fences reject atomically", async () => {
  for (const kind of ["foundation", "timeline"]) {
    const f = await gameFixture();
    try {
      const x = await stageGame(f);
      if (kind === "foundation")
        await f.one(
          "update rpg_private.world_foundations set revision=revision+1 where campaign_id=$1",
          [f.cid],
        );
      else
        await f.one(
          "update rpg_private.timeline_campaigns set epoch=epoch+1 where campaign_id=$1",
          [f.cid],
        );
      const before = await snapshot(f);
      await assert.rejects(x.rawCommit(), /rpg_conflict/);
      assert.deepEqual(await snapshot(f), before);
    } finally {
      await f.db.close();
    }
  }
});

test("Wave4 Game SQL rejects altered staged transfer content before writing any part", async () => {
  const f = await gameFixture();
  try {
    const x = await stageGame(f),
      before = await snapshot(f);
    const forged = structuredClone(x.settlement);
    forged.plan.changes.find((c) => c.id === f.hero).values.resources.credits =
      1000;
    await assert.rejects(
      x.rawCommit({ foundationSettlement: forged }),
      /rpg_(validation|conflict)/,
    );
    assert.deepEqual(await snapshot(f), before);
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL never accepts a forged success plan when the durable player roll failed", async () => {
  const f = await gameFixture();
  try {
    const before = await snapshot(f);
    await assert.rejects(
      async () => {
        const x = await stageGame(f, {
          action: "theft",
          success: false,
          tamperSettlement: async (settlement, claim) => {
            const context = await f.read();
            context.foundation.worldMinutes = settlement.worldMinutes;
            // A corrupt caller supplies an internally well-formed success plan,
            // but cannot replace the durable failed roll in the real turn.
            const fakeRoll = recordServerRoll(
              claim.turn.input.operationId,
              claim.turn.checkpoint.checks[0],
              2,
              1,
              () => 15,
            );
            settlement.plan = planFoundationAction(
              context,
              settlement.command,
              settlement.proposal,
              {
                input: claim.turn.input.input,
                actorId: f.hero,
                profile: "console_basic",
                checks: [fakeRoll],
                outcome: "completed",
                uncertainty: "resolved",
                capabilities: ["trade"],
              },
            );
          },
        });
        await x.commit();
      },
      (error) =>
        error.code === "validation" || /rpg_validation/.test(error.message),
    );
    const after = await snapshot(f);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.foundation.loop_state, before.foundation.loop_state);
    assert.equal(after.runtime_events, before.runtime_events);
    assert.equal(after.saves, before.saves);
  } finally {
    await f.db.close();
  }
});

test("Wave4 Game SQL refuses a transfer above the exact durable World Logic capability", async () => {
  const f = await gameFixture("world_logic");
  try {
    const before = await snapshot(f);
    await assert.rejects(
      async () => {
        const x = await stageGame(f, {
          action: "theft",
          tamperSettlement: async (settlement, claim) => {
            const context = await f.read();
            context.foundation.worldMinutes = settlement.worldMinutes;
            const fakeCapability = foundationTransferCapability(
              "theft",
              "item",
              f.merchant,
              f.stock,
              3,
            );
            context.world.actors
              .find((a) => a.id === f.hero)
              .capabilities.push(fakeCapability);
            context.foundation.world = context.world;
            settlement.proposal.take[0].quantity = 3;
            settlement.plan = planFoundationAction(
              context,
              settlement.command,
              settlement.proposal,
              {
                input: claim.turn.input.input,
                actorId: f.hero,
                profile: "world_logic",
                checks: [],
                outcome: "completed",
                uncertainty: "resolved",
                capabilities: [fakeCapability],
              },
            );
            // The corrupt plan must not smuggle its fabricated capability into
            // World state either; the true World settlement remains unchanged.
            settlement.plan.world = structuredClone(
              claim.turn.checkpoint.worldSettlement.nextWorld,
            );
          },
        });
        await x.commit();
      },
      (error) =>
        ["validation", "conflict"].includes(error.code) ||
        /rpg_(validation|conflict)/.test(error.message),
    );
    const after = await snapshot(f);
    assert.deepEqual(after.items, before.items);
    assert.deepEqual(after.entities, before.entities);
    assert.deepEqual(after.foundation.loop_state, before.foundation.loop_state);
    assert.equal(after.runtime_events, before.runtime_events);
  } finally {
    await f.db.close();
  }
});
