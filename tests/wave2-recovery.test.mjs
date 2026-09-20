import test from "node:test";
import assert from "node:assert/strict";
import { fixture, id } from "./wave1-world-fixtures.mjs";
import { emptyPlan } from "./phase2-turn-store-fixture.mjs";
import { recordServerRoll } from "../src/lib/gameplay/dice.ts";
import { stageWorldTransition } from "../src/lib/world/stage.ts";
import { assessWorldRecovery } from "../src/lib/production-adapters/world-recovery.ts";

function recovery() {
  const stage = fixture();
  stage.source.snapshot.timeline = structuredClone(stage.snapshot.timeline);
  stage.snapshot.world.threads[0].steps[0].publicOutcome = {
    text: "A bell rings.",
    actorIds: [],
    evidence: [],
  };
  const plan = emptyPlan();
  plan.checks.push({
    index: 0,
    actorId: id("player"),
    targetId: null,
    kind: "skill",
    stat: "skill",
    dc: 12,
    dcPublic: true,
    visibility: "player",
    important: true,
    uncertainty: "meaningful",
    advantage: "normal",
  });
  const original = {
    stage,
    input: {
      operationId: stage.command.operationId,
      campaignId: stage.command.campaignId,
      timeline: structuredClone(stage.command.timeline),
      expectedRevision: 1,
      mode: "game",
      input: "Wait by the gate.",
      companionId: null,
      listenerIds: [],
      mechanic: null,
    },
    plan,
    checks: [
      recordServerRoll(
        stage.command.operationId,
        plan.checks[0],
        2,
        1,
        () => 12,
      ),
    ],
    profiles: ["dm.plan", "dm.narrate"].map((task) => ({
      schemaVersion: 1,
      id: id(task),
      policyRevision: 0,
      registryVersion: "saved-registry",
      task,
      providerId: "openai",
      modelId: "gpt-6-astra",
      reasoning: "xhigh",
    })),
  };
  const lease = {
    timeline: structuredClone(stage.command.timeline),
    campaignId: stage.command.campaignId,
    operationId: stage.command.operationId,
    token: id("active-lease"),
    expectedRevision: 1,
  };
  const args = {
    original,
    current: structuredClone(original),
    settlement: stageWorldTransition(stage).settlement,
    lease,
    membership: {
      ownerId: stage.snapshot.ownerId,
      campaignId: stage.snapshot.campaignId,
      operationId: stage.command.operationId,
      timeline: structuredClone(stage.command.timeline),
      headId: stage.command.expectedHeadId,
      turnMember: true,
      stageMember: true,
      profilesMember: true,
      lease: structuredClone(lease),
      leaseActive: true,
      status: "generating",
      committedEventIds: [],
    },
  };
  return args;
}

function manualSave(args, label = "manual-save-head") {
  args.current.stage.snapshot.headId = id(label);
  args.current.stage.command.expectedHeadId = id(label);
  args.membership.headId = id(label);
}

function activate(args, branch = "child-timeline") {
  manualSave(args, "loaded-manifest");
  const timeline = { timelineId: id(branch), epoch: 7 };
  args.current.input.timeline = structuredClone(timeline);
  args.current.input.expectedRevision = 30;
  args.current.stage.command.timeline = structuredClone(timeline);
  args.current.stage.command.expectedRuntimeRevision = 30;
  args.current.stage.snapshot.timeline = structuredClone(timeline);
  args.current.stage.snapshot.runtimeRevision = 30;
  args.current.stage.source.runtime.timeline = structuredClone(timeline);
  args.current.stage.source.runtime.revision = 30;
  args.current.stage.source.snapshot.timeline = structuredClone(timeline);
  args.membership.timeline = structuredClone(timeline);
  args.lease.timeline = structuredClone(timeline);
  args.lease.expectedRevision = 30;
  args.lease.token = id("new-lease");
  args.membership.lease = structuredClone(args.lease);
}

const paused = (args) => {
  const result = assessWorldRecovery(args);
  assert.deepEqual(result, {
    status: "recovery_needed",
    canRetry: false,
    canCancel: true,
    canStartNewAction: true,
  });
  assert.doesNotMatch(
    JSON.stringify(result),
    /PRIVATE_|originTimeline|operationId|ownerId|modelId/,
  );
};

test("retry preserves original input, recorded dice, profiles and event identity without mutation", () => {
  const args = recovery(),
    before = structuredClone(args);
  const result = assessWorldRecovery(args);
  assert.equal(result.status, "unchanged");
  assert.deepEqual(result.settlement, args.settlement);
  assert.deepEqual(assessWorldRecovery(args), result);
  assert.deepEqual(args, before);
  result.settlement.events[0].text = "changed returned clone";
  assert.deepEqual(args, before);
});

test("manual/quick save may advance only the head after exact authority and membership checks", () => {
  for (const kind of ["manual", "quick"]) {
    const args = recovery();
    manualSave(args, kind);
    const before = structuredClone(args);
    const result = assessWorldRecovery(args);
    assert.equal(result.status, "restage");
    assert.equal(result.origin.expectedHeadId, args.settlement.expectedHeadId);
    assert.equal(result.continuation.expectedHeadId, id(kind));
    assert.deepEqual(result.settlement.events, args.settlement.events);
    assert.deepEqual(args, before);
  }
});

test("load into child and switching back to original timeline retain origin while authorizing fresh continuation", () => {
  for (const branch of ["child-timeline", "timeline"]) {
    const args = recovery();
    activate(args, branch);
    const result = assessWorldRecovery(args);
    assert.equal(result.status, "restage");
    assert.deepEqual(
      result.origin.timeline,
      args.original.stage.command.timeline,
    );
    assert.deepEqual(
      result.continuation.timeline,
      args.current.stage.command.timeline,
    );
    assert.deepEqual(result.settlement.events, args.settlement.events);
    assert.equal(result.settlement.events.length, 2);
    assert.equal(result.settlement.events[0].originTimelineId, id("timeline"));
  }
});

test("pending operation's transport progress does not invalidate stored authority", () => {
  const args = recovery();
  args.original.stage.source.runtime.turns.push({
    id: args.settlement.operationId,
    status: "generating",
  });
  args.current.stage.source.runtime.turns.push({
    id: args.settlement.operationId,
    status: "failed",
    updated_at: "later",
  });
  manualSave(args);
  assert.equal(assessWorldRecovery(args).status, "restage");
});

for (const [name, mutate] of [
  [
    "manual correction to item quantity",
    (a) => a.current.stage.source.snapshot.items[0].quantity++,
  ],
  [
    "private state correction",
    (a) => (a.current.stage.source.privateState.secret = "PRIVATE_CHANGED"),
  ],
  [
    "authored timeline key",
    (a) =>
      (a.current.stage.source.privateState.timeline = {
        timelineId: id("sibling"),
        epoch: 100,
      }),
  ],
  [
    "world thread authority",
    (a) =>
      (a.current.stage.snapshot.world.threads[0].title = "PRIVATE_CHANGED"),
  ],
  [
    "world policy",
    (a) => (a.current.stage.snapshot.world.policy.autonomy = "high"),
  ],
  ["foundation revision", (a) => a.current.stage.snapshot.revision++],
  [
    "source binding",
    (a) =>
      a.current.stage.snapshot.bindings.push({
        sourceVersionIds: [id("source")],
      }),
  ],
  [
    "ruleset",
    (a) => (a.current.stage.snapshot.ruleset.validatorVersion = "changed"),
  ],
  [
    "execution policy",
    (a) => (a.current.stage.snapshot.executionPolicy = { revision: 7 }),
  ],
  [
    "original action text",
    (a) => (a.current.input.input = "A different action"),
  ],
  ["replanned action", (a) => (a.current.plan.narration = "New plan")],
  [
    "rerolled check",
    (a) => {
      a.current.checks[0].dice = [20];
      a.current.checks[0].rollNumber++;
    },
  ],
  ["missing checks", (a) => (a.current.checks = [])],
  ["duplicate check", (a) => a.current.checks.push(a.current.checks[0])],
  ["model fallback", (a) => (a.current.profiles[0].modelId = "gpt-5.4-mini")],
  [
    "profile identity",
    (a) => (a.current.profiles[0].id = id("replacement-profile")),
  ],
  ["missing profiles", (a) => (a.current.profiles = [])],
  ["changed mechanics", (a) => a.current.stage.resolution.worldMinutes++],
  [
    "changed event body",
    (a) => (a.settlement.events[0].text = "PRIVATE_FORGED"),
  ],
  [
    "duplicate staged event",
    (a) => a.settlement.events.push(a.settlement.events[0]),
  ],
  [
    "future event origin",
    (a) => (a.settlement.events[0].originTimelineId = id("sibling")),
  ],
  [
    "new unknown authority field",
    (a) => (a.current.stage.source.newAuthority = "must compare"),
  ],
  [
    "other operation's history",
    (a) =>
      a.current.stage.source.runtime.turns.push({
        id: id("sibling-operation"),
        narration: "sibling",
      }),
  ],
  ["missing original capture", (a) => (a.original = null)],
]) {
  test(`recovery pauses for ${name} and exposes only safe cancel/new-action status`, () => {
    const args = recovery();
    manualSave(args);
    mutate(args);
    paused(args);
  });
}

for (const [name, mutate] of [
  ["absent stage", (a) => (a.membership.stageMember = false)],
  ["sibling turn", (a) => (a.membership.turnMember = false)],
  ["missing saved profile", (a) => (a.membership.profilesMember = false)],
  ["wrong owner", (a) => (a.membership.ownerId = id("other-owner"))],
  ["wrong campaign", (a) => (a.membership.campaignId = id("other-campaign"))],
  ["different operation", (a) => (a.membership.operationId = id("other-op"))],
  ["stale membership head", (a) => (a.membership.headId = id("old-head"))],
  ["stale callback epoch", (a) => a.lease.timeline.epoch--],
  ["expired lease", (a) => (a.membership.leaseActive = false)],
  ["old callback token", (a) => (a.lease.token = id("expired-token"))],
  [
    "already persisted event",
    (a) => (a.membership.committedEventIds = [a.settlement.events[0].id]),
  ],
]) {
  test(`fence/membership rejects ${name} after load`, () => {
    const args = recovery();
    activate(args);
    mutate(args);
    paused(args);
  });
}

test("same epoch revision change cannot disguise a correction as activation", () => {
  const args = recovery();
  activate(args, "timeline");
  for (const row of [
    args.current.input,
    args.current.stage.command,
    args.current.stage.snapshot,
    args.current.stage.source.runtime,
    args.current.stage.source.snapshot,
    args.membership,
    args.lease,
    args.membership.lease,
  ])
    row.timeline.epoch = 2;
  paused(args);
});

test("branch change requires an increased epoch and runtime revision", () => {
  for (const kind of ["epoch", "revision"]) {
    const args = recovery();
    activate(args);
    if (kind === "epoch") {
      for (const row of [
        args.current.input,
        args.current.stage.command,
        args.current.stage.snapshot,
        args.current.stage.source.runtime,
        args.current.stage.source.snapshot,
        args.membership,
        args.lease,
        args.membership.lease,
      ])
        row.timeline.epoch = 2;
    } else {
      args.current.input.expectedRevision =
        args.current.stage.command.expectedRuntimeRevision =
        args.current.stage.snapshot.runtimeRevision =
        args.current.stage.source.runtime.revision =
        args.lease.expectedRevision =
        args.membership.lease.expectedRevision =
          1;
    }
    paused(args);
  }
});

test("duplicate committed/cancelled callbacks are terminal and propose no repeated Events", () => {
  for (const outcome of ["committed", "cancelled"]) {
    const args = recovery();
    args.membership.status = outcome;
    args.membership.leaseActive = false;
    if (outcome === "committed")
      args.membership.committedEventIds = args.settlement.events.map(
        (event) => event.id,
      );
    assert.deepEqual(assessWorldRecovery(args), {
      status: "terminal",
      outcome,
    });
    assert.deepEqual(assessWorldRecovery(args), {
      status: "terminal",
      outcome,
    });
    if (outcome === "committed") {
      args.membership.committedEventIds.push(id("extra-event"));
      paused(args);
    }
  }
});

test("an explicit new action cannot inherit the old stage, checks or operation identity", () => {
  const args = recovery();
  const newId = id("new-action");
  args.current.input.operationId =
    args.current.stage.command.operationId =
    args.membership.operationId =
    args.lease.operationId =
    args.membership.lease.operationId =
      newId;
  paused(args);
});

test("unknown or malformed runtime payloads fail closed without private diagnostic text", () => {
  for (const value of [null, {}, { original: { stage: "PRIVATE_INVALID" } }]) {
    assert.equal(assessWorldRecovery(value).status, "recovery_needed");
  }
});

test("normalization cannot erase a mixed sibling/campaign transport envelope", () => {
  for (const kind of ["timeline", "campaign"]) {
    const args = recovery();
    activate(args);
    const row = args.current.stage.source.snapshot.entities[0];
    if (kind === "timeline")
      row.timeline = { timelineId: id("sibling"), epoch: 7 };
    else row.campaign_id = id("other-campaign");
    paused(args);
  }
});
