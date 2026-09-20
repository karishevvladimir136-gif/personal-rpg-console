import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  fixture as actionFixture,
  failCheck,
  id,
} from "./wave4-actions-fixtures.mjs";
import { fixture as runtimeFixture } from "./phase2-mechanics-fixtures.mjs";

// The worker branch predates the Lead-owned bridge. Once integrated the local
// repository always wins; WAVE4_SOURCE_ROOT permits an explicit disposable
// source checkout without copying or editing any production file.
const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const sourceRoot =
  process.env.WAVE4_SOURCE_ROOT ??
  (existsSync(resolve(repositoryRoot, "src/lib/foundation-loop/turn.ts"))
    ? repositoryRoot
    : resolve(repositoryRoot, "../production-wave4"));
const source = (path) => import(pathToFileURL(resolve(sourceRoot, path)).href);
const { foundationTurnPreparer } = await source(
  "src/lib/foundation-loop/turn.ts",
);
const { foundationActionContext } = await source(
  "src/lib/foundation-actions/index.ts",
);

function fixture(action = "theft", profile = "console_basic") {
  const f = actionFixture(action, profile);
  const runtime = runtimeFixture();
  runtime.snapshot = structuredClone(f.context.snapshot);
  runtime.runtime.timeline = structuredClone(f.context.foundation.timeline);
  runtime.runtime.revision = f.context.foundation.runtimeRevision;
  runtime.runtime.configuration.controlledEntityIds = [id("player")];
  if (profile === "world_logic") runtime.runtime.configuration = null;
  const input = {
    operationId: f.command.operationId,
    campaignId: f.command.campaignId,
    expectedRevision: f.command.expectedRuntimeRevision,
    timeline: structuredClone(f.command.timeline),
    mode: "game",
    input: f.proposal.input,
    companionId: null,
    listenerIds: [],
    mechanic: null,
  };
  const plan = {
    narration: "No model-authored transfer is authoritative.",
    checks: [],
    publicPatches: [],
    privatePatches: [],
    visualDescription: "",
    clarification: null,
    guidanceProposal: null,
    foundationAction: structuredClone(f.proposal),
  };
  const checkpoint = {
    plan,
    checks: structuredClone(f.authorization.checks),
    resolution: {
      changes: [],
      worldMinutes: 20,
      configuration: structuredClone(runtime.runtime.configuration),
      outcomes: [],
    },
    narration: null,
    feedback: null,
    usage: [],
  };
  if (profile === "world_logic") {
    checkpoint.foundationAction = structuredClone(f.proposal);
    checkpoint.worldLogic = {
      schemaVersion: 2,
      actorId: id("player"),
      input: input.input,
      action: "attempt",
      outcome: "completed",
      uncertainty: "resolved",
      capabilityRefs: [...f.authorization.capabilities],
      circumstanceRefs: ["public-state"],
      evidenceIndexes: [],
      publicText: "Advisory model text.",
      elapsedMinutes: 20,
      destinationId: null,
      consequences: [],
      foundationAction: structuredClone(f.proposal),
    };
  }
  const claim = {
    lease: {
      campaignId: input.campaignId,
      operationId: input.operationId,
      timeline: structuredClone(input.timeline),
      token: id("lease"),
      expectedRevision: input.expectedRevision,
    },
    turn: {
      input,
      public: { id: input.operationId, status: "generating" },
      checkpoint,
    },
    source: runtime,
  };
  const reads = [];
  const authority = { context: f.context, error: null };
  const prepare = foundationTurnPreparer(async (args) => {
    reads.push(structuredClone(args));
    assert.equal(
      args.p_action,
      "loop_read",
      "The preparer must not write or roll through an RPC",
    );
    return authority.error
      ? { data: null, error: authority.error }
      : { data: structuredClone(authority.context) };
  });
  return { ...f, claim, checkpoint, authority, reads, prepare };
}

const run = (f) => f.prepare(f.claim);
function failureCode(...codes) {
  return (error) => {
    assert.ok(
      codes.includes(error.code),
      `Expected ${codes.join("/")}, received ${error.name}: ${error.message}`,
    );
    assert.doesNotMatch(error.message, /PRIVATE_|FUTURE_|SECRET_/);
    return true;
  };
}

test("normal Game quote, trade and theft stage their checkpoint proposal through one read-only bridge", async () => {
  for (const action of ["quote", "trade", "theft"]) {
    const f = fixture(action);
    const before = structuredClone({ claim: f.claim, context: f.context });
    const staged = await run(f);
    assert.equal(staged.schemaVersion, 1);
    assert.deepEqual(staged.command, f.command);
    assert.deepEqual(staged.proposal, f.checkpoint.plan.foundationAction);
    assert.equal(staged.worldMinutes, 20);
    assert.equal(
      staged.plan.events[0].kind,
      action === "quote"
        ? "commerce.quote"
        : action === "trade"
          ? "commerce.trade"
          : "foundation.action_resolved",
    );
    assert.equal(staged.plan.events[0].visibility, "public");
    assert.equal(staged.plan.changes.length === 0, action === "quote");
    assert.deepEqual({ claim: f.claim, context: f.context }, before);
    assert.deepEqual(f.reads, [
      {
        p_owner_id: f.context.foundation.ownerId,
        p_campaign_id: f.command.campaignId,
        p_action: "loop_read",
        p_payload: {},
        p_timeline: f.command.timeline,
      },
    ]);
  }
});

test("World Logic uses the explicit checkpoint action while legacy dm.plan uses its own action field", async () => {
  const f = fixture("quote", "world_logic");
  f.checkpoint.plan.foundationAction = null;
  const staged = await run(f);
  assert.deepEqual(staged.proposal, f.checkpoint.foundationAction);
  assert.equal(staged.plan.events[0].kind, "commerce.quote");
  const legacy = fixture("quote");
  delete legacy.checkpoint.plan.foundationAction;
  assert.equal(await run(legacy), null);
  assert.deepEqual(legacy.reads, []);
});

test("original input, controlled player, Game mode, lease and completed mechanics resolution remain required", async () => {
  for (const modify of [
    (f) => {
      f.checkpoint.plan.foundationAction.input = "A different request";
    },
    (f) => {
      f.checkpoint.plan.foundationAction.intent.playerEntityId = id("enemy");
    },
    (f) => {
      f.claim.source.runtime.configuration.controlledEntityIds = [id("enemy")];
    },
    (f) => {
      f.claim.turn.input.mode = "feedback";
    },
    (f) => {
      f.claim.turn.input.mode = "mechanic";
    },
    (f) => {
      delete f.claim.lease.timeline;
    },
    (f) => {
      f.checkpoint.resolution = null;
    },
  ]) {
    const f = fixture("quote");
    modify(f);
    const before = structuredClone(f.claim);
    await assert.rejects(run(f), failureCode("validation", "configuration"));
    assert.deepEqual(f.claim, before);
  }
});

test("stored successful checks are reused byte-for-byte on retry with no reroll or write", async () => {
  const f = fixture();
  f.checkpoint.checks[0].rollNumber = 3;
  const before = structuredClone(f.checkpoint.checks);
  const first = await run(f);
  f.checkpoint.foundationSettlement = structuredClone(first);
  assert.deepEqual(await run(f), first);
  assert.deepEqual(f.checkpoint.checks, before);
  assert.equal(f.reads.length, 2);
  assert.ok(f.reads.every((read) => read.p_action === "loop_read"));
  assert.equal(first.plan.events[0].payload.outcome, "completed");
});

test("a recorded failed attempt stages a normal no-transfer failure, never success or a replacement roll", async () => {
  for (const action of ["theft", "robbery", "haggle"]) {
    const f = fixture(action);
    failCheck(f);
    f.checkpoint.checks = structuredClone(f.authorization.checks);
    const before = structuredClone(f.checkpoint.checks);
    const staged = await run(f);
    assert.deepEqual(staged.plan.changes, []);
    assert.equal(staged.plan.events[0].payload.outcome, "blocked");
    assert.ok(
      staged.plan.events.every(
        (event) => event.kind !== "commerce.haggle_granted",
      ),
    );
    assert.deepEqual(f.checkpoint.checks, before);
    assert.equal(f.reads.length, 1);
  }
});

test("missing, wrong actor, private and foreign-operation recorded checks cannot authorize settlement", async () => {
  for (const modify of [
    (f) => {
      f.checkpoint.checks = [];
    },
    (f) => {
      f.checkpoint.checks[0].actorId = id("enemy");
    },
    (f) => {
      f.checkpoint.checks[0].targetId = id("player");
    },
    (f) => {
      f.checkpoint.checks[0].visibility = "private";
    },
    (f) => {
      f.checkpoint.checks[0].id = id("another-turn-check");
    },
  ]) {
    const f = fixture();
    modify(f);
    await assert.rejects(run(f), failureCode("validation"));
  }
});

test("haggle grant binds the final settled fictional minute and returned loop version", async () => {
  for (const profile of ["console_basic", "world_logic"]) {
    const f = fixture("haggle", profile);
    f.checkpoint.resolution.worldMinutes = 37;
    const initialMinute = f.context.foundation.worldMinutes;
    const staged = await run(f);
    assert.equal(staged.worldMinutes, 37);
    assert.equal(staged.plan.events[0].payload.worldMinutes, 37);
    assert.equal(
      staged.plan.events[0].payload.stateVersion,
      staged.plan.state.version,
    );
    assert.equal(f.context.foundation.worldMinutes, initialMinute);
  }
});

test("ordinary changes are staged before foundation transfers so final balances, quantities and row revisions are used", async () => {
  const f = fixture("trade");
  const player = f.context.snapshot.entities.find((e) => e.id === id("player"));
  const stock = f.context.snapshot.items.find((i) => i.id === id("stock"));
  f.checkpoint.resolution.changes = [
    {
      family: "entities",
      id: player.id,
      expectedRevision: player.revision,
      values: { resources: { ...player.resources, credits: 900 } },
    },
    {
      family: "items",
      id: stock.id,
      expectedRevision: stock.revision,
      values: { quantity: 4 },
    },
  ];
  const staged = await run(f);
  const payment = staged.plan.changes.find((c) => c.id === player.id);
  const quantity = staged.plan.changes.find((c) => c.id === stock.id);
  assert.equal(payment.values.resources.credits, 860);
  assert.equal(payment.expectedRevision, player.revision + 1);
  assert.equal(quantity.values.quantity, 2);
  assert.equal(quantity.expectedRevision, stock.revision + 1);
  assert.equal(player.resources.credits, 1000);
  assert.equal(stock.quantity, 10);
  f.checkpoint.resolution.changes[1].values.quantity = 1;
  await assert.rejects(run(f), failureCode("validation"));
});

test("World settlement context is applied before a now absent merchant can trade", async () => {
  const f = fixture("trade", "world_logic");
  const nextWorld = structuredClone(f.context.world);
  nextWorld.actors.find((a) => a.id === id("enemy")).locationId =
    id("next-location");
  f.checkpoint.worldSettlement = { nextWorld };
  await assert.rejects(run(f), failureCode("validation"));
});

test("World Logic cannot borrow an installed capability that its resolved proposal did not reference", async () => {
  for (const action of ["haggle", "theft", "robbery"]) {
    const f = fixture(action, "world_logic");
    assert.ok(f.context.world.actors[0].capabilities.length > 0);
    f.checkpoint.worldLogic.capabilityRefs = [];
    await assert.rejects(run(f), failureCode("validation"));
  }
});

test("World Logic unresolved uncertainty cannot settle and blocked outcomes transfer nothing", async () => {
  const f = fixture("robbery", "world_logic");
  f.checkpoint.worldLogic.uncertainty = "missing_evidence";
  await assert.rejects(run(f), failureCode("validation"));
  f.checkpoint.worldLogic.uncertainty = "resolved";
  f.checkpoint.worldLogic.outcome = "blocked";
  const staged = await run(f);
  assert.deepEqual(staged.plan.changes, []);
  assert.equal(staged.plan.events[0].payload.outcome, "blocked");
});

test("fresh authority rejects changed timeline, campaign, owner and runtime fences", async () => {
  for (const modify of [
    (f) => {
      f.authority.context.foundation.timeline.epoch += 1;
    },
    (f) => {
      f.authority.context.foundation.timeline.timelineId = id("sibling");
    },
    (f) => {
      f.claim.source.ownerId = id("different-owner");
    },
    (f) => {
      f.claim.turn.input.campaignId = id("different-campaign");
    },
    (f) => {
      f.authority.context.foundation.runtimeRevision += 1;
    },
  ]) {
    const f = fixture("haggle");
    modify(f);
    await assert.rejects(run(f), failureCode("conflict"));
  }
});

test("the original input's timeline must match the active lease, even when the RPC returns that lease", async () => {
  const f = fixture("quote");
  f.claim.turn.input.timeline.epoch -= 1;
  await assert.rejects(run(f), failureCode("conflict", "validation"));
});

test("recovery rejects head or foundation revision changes even when transfer contents are identical", async () => {
  for (const mutate of [
    (f) => {
      f.context.foundation.headId = id("new-head");
    },
    (f) => {
      f.context.foundation.revision += 1;
    },
  ]) {
    const f = fixture();
    f.checkpoint.plan.foundationAction.take[0].quantity = 10;
    f.checkpoint.foundationSettlement = await run(f);
    mutate(f);
    await assert.rejects(run(f), failureCode("conflict"));
  }
});

test("recovered settlement command and schema are part of exact staged identity", async () => {
  for (const mutate of [
    (saved) => {
      saved.command.timeline.epoch += 1;
    },
    (saved) => {
      saved.command.expectedHeadId = id("staged-wrong-head");
    },
    (saved) => {
      saved.command.expectedRevision += 1;
    },
    (saved) => {
      saved.command.operationId = id("staged-other-operation");
    },
    (saved) => {
      saved.schemaVersion = 2;
    },
  ]) {
    const f = fixture("haggle");
    f.checkpoint.foundationSettlement = await run(f);
    mutate(f.checkpoint.foundationSettlement);
    await assert.rejects(run(f), failureCode("conflict"));
  }
});

test("staged proposal, computed plan and final minute must remain exactly equal on recovery", async () => {
  for (const mutate of [
    (saved) => {
      saved.proposal.take[0].quantity = 1;
    },
    (saved) => {
      saved.plan.events[0].text = "FORGED_PUBLIC_SETTLEMENT";
    },
    (saved) => {
      saved.plan.changes[0].values.quantity = 999;
    },
    (saved) => {
      saved.worldMinutes += 1;
    },
  ]) {
    const f = fixture();
    f.checkpoint.foundationSettlement = await run(f);
    mutate(f.checkpoint.foundationSettlement);
    await assert.rejects(run(f), failureCode("conflict"));
  }
});

test("public quote/events/options and RPC arguments reveal no hidden context or source future", async () => {
  const f = fixture("quote");
  f.claim.source.privateState = { detection: "SECRET_DETECTION_CHECK" };
  f.claim.source.checkpoint = { privateText: "PRIVATE_CHECKPOINT" };
  f.context.world.actors[1].knowledge = [
    {
      ownerId: f.context.foundation.ownerId,
      sourceId: id("source"),
      sourceVersionId: id("source-version"),
      locator: { kind: "text", value: "FUTURE_PRIVATE_MERCHANT_DEATH" },
      digest: "a".repeat(64),
      visibility: "private",
      knowledge: "future_source",
    },
  ];
  const staged = await run(f);
  const serialized = JSON.stringify({
    publicEvents: staged.plan.events.filter(
      (event) => event.visibility === "public",
    ),
    options: foundationActionContext(f.context, id("player")),
    rpc: f.reads,
  });
  assert.doesNotMatch(
    serialized,
    /PRIVATE_|SECRET_|FUTURE_|sourceVersionId|privateState|privateText/,
  );
  assert.ok(!serialized.includes(id("private-stock")));
  assert.ok(!serialized.includes(id("source-version")));
  // The full settlement is internal and contains private definitions. This
  // assertion deliberately tests only the allowlisted public outputs.
  const hidden = fixture();
  hidden.checkpoint.plan.foundationAction.take[0].itemId = id("private-stock");
  await assert.rejects(run(hidden), failureCode("validation"));
  assert.ok(
    hidden.reads.every((read) => JSON.stringify(read.p_payload) === "{}"),
  );
});
