import test from "node:test";
import assert from "node:assert/strict";
import {
  fixture,
  id,
  thread,
  step,
  evidence,
  bind,
} from "./wave1-world-fixtures.mjs";
import {
  stageWorldTransition,
  validateWorldSettlement,
  parseWorldState,
  projectPublicWorld,
  reconcileWorldPolicy,
  WorldValidationError,
} from "../src/lib/world/index.ts";
import { readWorldFoundation } from "../src/lib/server/world/store.ts";

test("deterministic due world work stages a stable immutable proposal without mutating mechanics or source", () => {
  const input = fixture();
  const before = structuredClone(input);
  const first = stageWorldTransition(input);
  assert.equal(first.status, "staged");
  assert.equal(first.modelRequests, 0);
  assert.equal(first.settlement.fromWorldMinutes, 0);
  assert.equal(first.settlement.throughWorldMinutes, 20);
  assert.equal(first.settlement.events[0].worldMinutes, 10);
  assert.equal(first.settlement.events[0].visibility, "private");
  assert.equal(first.settlement.nextWorld.threads[0].status, "resolved");
  assert.deepEqual(input, before);
  assert.deepEqual(stageWorldTransition(input), first);
  assert.deepEqual(
    validateWorldSettlement(input, first.settlement),
    first.settlement,
  );
  assert.deepEqual(first.publicEvents, []);
});

test("unconfigured, no due work, non-fictional trigger and unchanged action are true zero-request no-ops", () => {
  for (const alter of [
    (input) => {
      input.snapshot.world = null;
    },
    (input) => {
      input.resolution.worldMinutes = 5;
    },
    (input) => {
      input.trigger = "none";
    },
    (input) => {
      input.trigger = "action";
      input.resolution.worldMinutes = 0;
    },
    (input) => {
      input.snapshot.world.threads[0].status = "resolved";
      input.snapshot.world.threads[0].cursor = 1;
    },
  ]) {
    const input = fixture();
    alter(input);
    const original = structuredClone(input);
    assert.deepEqual(stageWorldTransition(input), {
      status: "noop",
      modelRequests: 0,
    });
    assert.deepEqual(input, original);
  }
});

test("session boundary evaluates already-due work without adding fictional time", () => {
  const input = fixture();
  input.snapshot.worldMinutes =
    input.source.runtime.worldMinutes =
    input.resolution.worldMinutes =
      10;
  input.trigger = "session_boundary";
  assert.equal(stageWorldTransition(input).status, "staged");
  input.resolution.worldMinutes = 11;
  assert.throws(() => stageWorldTransition(input), WorldValidationError);
});

test("simulation Off and Deadline Off suppress timed expiry without accumulating a work receipt", () => {
  for (const policy of [{ simulation: false }, { deadlinePressure: "off" }]) {
    const input = fixture();
    Object.assign(input.snapshot.world.policy, policy);
    input.resolution.worldMinutes = 90000;
    const before = structuredClone(input);
    assert.deepEqual(stageWorldTransition(input), {
      status: "noop",
      modelRequests: 0,
    });
    assert.deepEqual(input, before);
  }
});

test("Deadline Off still allows explicit causal effects, including while simulation is Off", () => {
  const input = fixture();
  input.snapshot.world.policy.simulation = false;
  input.snapshot.world.policy.deadlinePressure = "off";
  input.snapshot.world.threads[0].steps[0].trigger = {
    kind: "causal",
    family: "items",
    recordId: id("knife"),
  };
  input.resolution.changes = [
    {
      family: "items",
      id: id("knife"),
      expectedRevision: 1,
      values: { quantity: 9 },
    },
  ];
  assert.equal(stageWorldTransition(input).status, "staged");
  input.resolution.changes[0].id = id("unrelated");
  assert.equal(stageWorldTransition(input).status, "noop");
});

test("critical pressure permits only established scenario-critical timed completion", () => {
  const input = fixture();
  input.snapshot.world.policy.deadlinePressure = "critical_only";
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.world.threads[0].steps[0].trigger.scenarioCritical = true;
  assert.equal(stageWorldTransition(input).status, "staged");
  input.snapshot.world.threads[0].steps[0].trigger.established = false;
  assert.throws(() => stageWorldTransition(input), WorldValidationError);
});

test("autonomy scope remains separate from Deadline Pressure and bounded by Low/Moderate/High", () => {
  const input = fixture();
  input.snapshot.world.threads[0].steps[0].trigger = {
    kind: "autonomy",
    atWorldMinutes: 10,
    scope: "broad",
  };
  input.snapshot.world.policy.autonomy = "low";
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.world.policy.autonomy = "moderate";
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.world.policy.autonomy = "high";
  assert.equal(stageWorldTransition(input).status, "staged");
  input.snapshot.world.policy.deadlinePressure = "off";
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.world.threads[0].steps.push(
    step("next", {
      trigger: {
        kind: "deadline",
        atWorldMinutes: 50,
        scenarioCritical: false,
        established: true,
      },
    }),
  );
  const progress = stageWorldTransition(input);
  assert.equal(progress.status, "staged");
  assert.equal(progress.settlement.nextWorld.threads[0].cursor, 1);
  assert.equal(progress.settlement.nextWorld.threads[0].status, "active");
});

test("mandatory thread or event overflow pauses the entire proposal rather than dropping work", () => {
  for (const count of [4, 9]) {
    const input = fixture();
    input.snapshot.world.policy.autonomy = count === 4 ? "low" : "high";
    input.snapshot.world.threads = Array.from({ length: count }, (_, n) =>
      thread("deadline-" + n),
    );
    const before = structuredClone(input);
    assert.deepEqual(stageWorldTransition(input), {
      status: "paused",
      reason: "work_limit",
      modelRequests: 0,
    });
    assert.deepEqual(input, before);
  }
});

test("an unsupported resolver-dependent step pauses instead of fabricating a world fact", () => {
  const input = fixture();
  input.snapshot.world.threads[0].steps[0].resolution = "resolver_required";
  assert.deepEqual(stageWorldTransition(input), {
    status: "paused",
    reason: "resolver_required",
    modelRequests: 0,
  });
});

test("player decisions are protected by explicit control, legacy player kind, and mechanics control", () => {
  for (const scenario of ["explicit", "legacy", "configuration"]) {
    const input = fixture();
    const actor = input.snapshot.world.actors.find(
      (actor) => actor.id === id("player"),
    );
    input.snapshot.world.threads[0].actorIds = [actor.id];
    input.snapshot.world.threads[0].decisionActorIds = [actor.id];
    if (scenario !== "explicit") actor.control = "autonomous";
    if (scenario === "legacy") {
      input.source.runtime.configuration.controlledEntityIds = [];
      input.resolution.configuration.controlledEntityIds = [];
    }
    if (scenario === "configuration")
      input.source.snapshot.entities.find(
        (entity) => entity.id === actor.id,
      ).kind = "companion";
    assert.deepEqual(stageWorldTransition(input), {
      status: "paused",
      reason: "player_agency",
      modelRequests: 0,
    });
  }
});

test("current actor knowledge and authorized source bindings are required; future source is never current truth", () => {
  const input = fixture();
  bind(input);
  input.snapshot.world.threads[0].steps[0].evidence = [evidence()];
  assert.equal(stageWorldTransition(input).reason, "knowledge_required");
  input.snapshot.world.actors[1].knowledge = [evidence()];
  assert.equal(stageWorldTransition(input).status, "staged");
  input.snapshot.world.threads[0].steps[0].evidence = [
    evidence({ knowledge: "future_source" }),
  ];
  input.snapshot.world.actors[1].knowledge = [
    evidence({ knowledge: "future_source" }),
  ];
  assert.equal(stageWorldTransition(input).reason, "knowledge_required");
  input.snapshot.bindings = [];
  assert.throws(() => stageWorldTransition(input), WorldValidationError);
});

test("public projection and public events contain no private titles, counts, identities or payload causality", () => {
  const input = fixture();
  input.snapshot.world.hooks = [
    {
      id: id("hook"),
      campaignId: id("campaign"),
      locationId: id("location"),
      threadId: id("thread"),
      privatePremise: "PRIVATE_HOOK",
      status: "latent",
      discovery: null,
    },
  ];
  input.snapshot.world.threads[0].steps[0].publicOutcome = {
    text: "Smoke rises above the hill.",
    actorIds: [id("player")],
    evidence: [],
  };
  input.snapshot.world.threads[0].actorIds.push(id("player"));
  const result = stageWorldTransition(input);
  assert.equal(result.status, "staged");
  const publicEvent = result.settlement.events.find(
    (event) => event.visibility === "public",
  );
  assert.deepEqual(publicEvent.threadIds, []);
  assert.deepEqual(publicEvent.payload, {});
  const text = JSON.stringify([
    projectPublicWorld(input.snapshot.world),
    result.publicEvents,
    publicEvent,
  ]);
  for (const privateValue of [
    "PRIVATE_WORLD_CAUSE",
    "PRIVATE_THREAD",
    "PRIVATE_HOOK",
    id("hook"),
    id("enemy"),
    id("thread"),
  ])
    assert.ok(!text.includes(privateValue));
  assert.equal(result.publicEvents[0].text, "Smoke rises above the hill.");
});

test("public evidence must be character-known and public; private actor names cannot be published by reference", () => {
  for (const change of ["evidence", "actor"]) {
    const input = fixture();
    bind(input);
    input.snapshot.world.threads[0].steps[0].publicOutcome = {
      text: "Visible.",
      actorIds: [],
      evidence: [],
    };
    if (change === "evidence")
      input.snapshot.world.threads[0].steps[0].publicOutcome.evidence = [
        evidence({ visibility: "public", knowledge: "future_source" }),
      ];
    else
      input.snapshot.world.threads[0].steps[0].publicOutcome.actorIds = [
        id("enemy"),
      ];
    assert.throws(() => stageWorldTransition(input), WorldValidationError);
  }
});

test("surface-before-complete requires a prior committed warning and meaningful opportunity", () => {
  const input = fixture();
  const warningStep = step("warning", {
    publicOutcome: {
      text: "The visible fire approaches.",
      actorIds: [id("player")],
      evidence: [],
    },
    warning: {
      forStepId: id("catastrophe"),
      opportunityMinutes: 5,
      recipientActorIds: [id("player")],
    },
  });
  const catastrophe = step("catastrophe", {
    trigger: {
      kind: "deadline",
      atWorldMinutes: 20,
      scenarioCritical: false,
      established: true,
    },
    consequence: "surface_before_complete",
  });
  input.snapshot.world.threads[0].actorIds.push(id("player"));
  input.snapshot.world.threads[0].steps = [warningStep, catastrophe];
  assert.equal(stageWorldTransition(input).reason, "warning_required");
  input.resolution.worldMinutes = 10;
  const warningResult = stageWorldTransition(input);
  assert.equal(warningResult.status, "staged");
  input.snapshot.world = warningResult.settlement.nextWorld;
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 10;
  input.resolution.worldMinutes = 20;
  assert.equal(stageWorldTransition(input).reason, "warning_required");
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 16;
  assert.equal(stageWorldTransition(input).status, "staged");
});

test("stale owner/campaign/revision/head/timeline/runtime and changed staged outcomes are rejected", () => {
  for (const change of [
    (input) => {
      input.command.campaignId = id("other");
    },
    (input) => {
      input.command.expectedRevision++;
    },
    (input) => {
      input.command.expectedRuntimeRevision++;
    },
    (input) => {
      input.command.expectedHeadId = id("other");
    },
    (input) => {
      input.command.timeline.epoch++;
    },
    (input) => {
      input.command.timeline.timelineId = id("other");
    },
    (input) => {
      input.source.ownerId = id("other");
    },
    (input) => {
      input.source.runtime.worldMinutes++;
    },
  ]) {
    const input = fixture();
    const result = stageWorldTransition(input);
    change(input);
    assert.throws(
      () => validateWorldSettlement(input, result.settlement),
      (error) => error.code === "stale_world",
    );
  }
  const input = fixture();
  const result = stageWorldTransition(input);
  result.settlement.events[0].text = "forged";
  assert.throws(
    () => validateWorldSettlement(input, result.settlement),
    (error) => error.code === "stale_world",
  );
});

test("source rebinding invalidates an otherwise identical staged proposal", () => {
  const input = fixture();
  const result = stageWorldTransition(input);
  bind(input);
  assert.throws(
    () => validateWorldSettlement(input, result.settlement),
    (error) => error.code === "stale_world",
  );
});

test("reenabling requires an explicit future schedule for every overdue affected step", () => {
  const input = fixture();
  const world = input.snapshot.world;
  world.policy.simulation = false;
  const nextPolicy = { ...world.policy, simulation: true };
  assert.throws(
    () => reconcileWorldPolicy(world, nextPolicy, 100, []),
    WorldValidationError,
  );
  assert.throws(
    () =>
      reconcileWorldPolicy(world, nextPolicy, 100, [
        { stepId: world.threads[0].steps[0].id, atWorldMinutes: 99 },
      ]),
    WorldValidationError,
  );
  const reconciled = reconcileWorldPolicy(world, nextPolicy, 100, [
    { stepId: world.threads[0].steps[0].id, atWorldMinutes: 110 },
  ]);
  input.snapshot.world = reconciled;
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 100;
  input.resolution.worldMinutes = 105;
  assert.equal(stageWorldTransition(input).status, "noop");
  input.resolution.worldMinutes = 110;
  assert.equal(stageWorldTransition(input).status, "staged");
  assert.equal(world.threads[0].steps[0].trigger.atWorldMinutes, 10);
});

test("enabling ordinary deadlines after Critical Only reconciles them without changing critical deadlines", () => {
  const input = fixture();
  const world = input.snapshot.world;
  world.policy.deadlinePressure = "critical_only";
  world.threads.push(
    thread("critical", {
      steps: [
        step("critical-step", {
          trigger: {
            kind: "deadline",
            atWorldMinutes: 15,
            established: true,
            scenarioCritical: true,
          },
        }),
      ],
    }),
  );
  const next = reconcileWorldPolicy(
    world,
    { ...world.policy, deadlinePressure: "normal" },
    100,
    [{ stepId: world.threads[0].steps[0].id, atWorldMinutes: 110 }],
  );
  assert.equal(next.threads[0].steps[0].trigger.atWorldMinutes, 110);
  assert.equal(next.threads[1].steps[0].trigger.atWorldMinutes, 15);
});

test("dependency order is coherent and multi-step effects remain atomic", () => {
  const input = fixture();
  const first = thread("first", {
    steps: [
      step("first-step", {
        trigger: {
          kind: "deadline",
          atWorldMinutes: 12,
          scenarioCritical: false,
          established: true,
        },
      }),
    ],
  });
  const next = thread("second", { prerequisiteThreadIds: [first.id] });
  input.snapshot.world.threads = [next, first];
  const result = stageWorldTransition(input);
  assert.equal(result.status, "staged");
  assert.deepEqual(
    result.settlement.events.map((event) => event.threadIds[0]),
    [first.id, next.id],
  );
  assert.deepEqual(
    result.settlement.events.map((event) => event.worldMinutes),
    [12, 12],
  );
});

test("schema validation rejects unknown policy, source policy injection, mixed scopes, duplicates and prerequisite cycles", () => {
  for (const corrupt of [
    (world) => {
      world.policy.deadlinePressure = "anything";
    },
    (world) => {
      world.provider = "not-a-world-field";
    },
    (world) => {
      world.actors[0].campaignId = id("other");
    },
    (world) => {
      world.actors.push(structuredClone(world.actors[0]));
    },
    (world) => {
      world.threads[0].actorIds = [id("unknown")];
    },
    (world) => {
      world.threads[0].steps[0].trigger.atWorldMinutes = NaN;
    },
    (world) => {
      const other = thread("other");
      world.threads.push(other);
      world.threads[0].prerequisiteThreadIds = [other.id];
      other.prerequisiteThreadIds = [world.threads[0].id];
    },
  ]) {
    const world = fixture().snapshot.world;
    corrupt(world);
    assert.throws(
      () => parseWorldState(world, id("campaign")),
      WorldValidationError,
    );
  }
});

test("latent hooks stay private; known hook projection does not disclose unobserved later expiry", () => {
  const world = fixture().snapshot.world;
  world.hooks = [
    {
      id: id("hook"),
      campaignId: id("campaign"),
      locationId: id("location"),
      threadId: id("thread"),
      privatePremise: "PRIVATE_HOOK",
      status: "expired",
      discovery: {
        label: "A rumor",
        text: "Someone mentioned a ruin.",
        kind: "rumor",
        eventId: null,
        evidence: [],
      },
    },
  ];
  const projection = projectPublicWorld(world);
  assert.equal(projection.hooks.length, 1);
  assert.ok(!("status" in projection.hooks[0]));
  assert.ok(!JSON.stringify(projection).includes("PRIVATE_HOOK"));
});

test("read adapter does not write, checks owner/campaign/fence, and suppresses raw RPC error content", async () => {
  const input = fixture();
  const calls = [];
  const rpc = async (args) => {
    calls.push(args);
    return { data: input.snapshot };
  };
  assert.deepEqual(
    await readWorldFoundation(
      rpc,
      input.snapshot.ownerId,
      input.snapshot.campaignId,
      input.snapshot.timeline,
    ),
    input.snapshot,
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].p_action, "read");
  assert.deepEqual(calls[0].p_payload, {});
  await assert.rejects(
    readWorldFoundation(
      async () => ({ data: input.snapshot }),
      id("wrong-owner"),
      input.snapshot.campaignId,
      input.snapshot.timeline,
    ),
    WorldValidationError,
  );
  await assert.rejects(
    readWorldFoundation(
      async () => ({ data: null, error: { message: "PRIVATE_RPC_DETAIL" } }),
      input.snapshot.ownerId,
      input.snapshot.campaignId,
      input.snapshot.timeline,
    ),
    (error) => !error.message.includes("PRIVATE_RPC_DETAIL"),
  );
});

test("bounded actor workload pauses without mutating any selected thread", () => {
  const input = fixture();
  input.snapshot.world.policy.autonomy = "low";
  const actors = Array.from({ length: 9 }, (_, index) => ({
    id: id("group-" + index),
    campaignId: id("campaign"),
    revision: 1,
    kind: "group",
    entityId: null,
    control: "autonomous",
    publicName: null,
    locationId: null,
    capabilities: [],
    knowledge: [],
  }));
  input.snapshot.world.actors.push(...actors);
  input.snapshot.world.threads[0].actorIds = actors.map((actor) => actor.id);
  input.snapshot.world.threads[0].decisionActorIds = [];
  assert.deepEqual(stageWorldTransition(input), {
    status: "paused",
    reason: "work_limit",
    modelRequests: 0,
  });
});

test("Deadline Off cannot expire hooks through a nonterminal autonomy step", () => {
  const input = fixture();
  input.snapshot.world.policy.deadlinePressure = "off";
  input.snapshot.world.hooks = [
    {
      id: id("hook"),
      campaignId: id("campaign"),
      locationId: id("location"),
      threadId: id("thread"),
      privatePremise: "PRIVATE_HOOK",
      status: "latent",
      discovery: null,
    },
  ];
  input.snapshot.world.threads[0].steps[0].trigger = {
    kind: "autonomy",
    atWorldMinutes: 10,
    scope: "local",
  };
  input.snapshot.world.threads[0].steps[0].hookChanges = [
    { hookId: id("hook"), status: "expired" },
  ];
  input.snapshot.world.threads[0].steps.push(step("next-step"));
  assert.equal(stageWorldTransition(input).status, "noop");
  input.snapshot.world.threads[0].steps[0].trigger = {
    kind: "causal",
    family: "items",
    recordId: id("knife"),
  };
  input.resolution.changes = [
    {
      family: "items",
      id: id("knife"),
      expectedRevision: 1,
      values: { quantity: 9 },
    },
  ];
  const result = stageWorldTransition(input);
  assert.equal(result.status, "staged");
  assert.equal(result.settlement.nextWorld.hooks[0].status, "expired");
  assert.equal(
    result.settlement.nextWorld.hooks[0].privatePremise,
    "PRIVATE_HOOK",
  );
  assert.equal(projectPublicWorld(result.settlement.nextWorld).hooks.length, 0);
});

test("future source markers cannot leak through public hook evidence or public events", () => {
  const world = fixture().snapshot.world;
  world.hooks = [
    {
      id: id("hook"),
      campaignId: id("campaign"),
      locationId: id("location"),
      threadId: id("thread"),
      privatePremise: "PRIVATE_FUTURE",
      status: "discovered",
      discovery: {
        label: "Visible hook",
        text: "Visible lead.",
        kind: "map",
        eventId: null,
        evidence: [
          evidence({ visibility: "public", knowledge: "future_source" }),
        ],
      },
    },
  ];
  assert.throws(() => projectPublicWorld(world), WorldValidationError);
});

test("hard deadlines require established timing and time cannot move backwards", () => {
  const input = fixture();
  input.snapshot.world.threads[0].steps[0].consequence = "hard_deadline";
  input.snapshot.world.threads[0].steps[0].trigger.established = false;
  assert.throws(() => stageWorldTransition(input), WorldValidationError);
  input.snapshot.world.threads[0].steps[0].trigger.established = true;
  input.snapshot.worldMinutes = input.source.runtime.worldMinutes = 20;
  input.resolution.worldMinutes = 19;
  assert.throws(() => stageWorldTransition(input), WorldValidationError);
});

test("source and world revisions remain pinned even when event identity is stable", () => {
  const input = fixture();
  const before = stageWorldTransition(input);
  const changed = fixture();
  changed.resolution.worldMinutes = 30;
  const after = stageWorldTransition(changed);
  assert.equal(before.settlement.events[0].id, after.settlement.events[0].id);
  assert.throws(
    () => validateWorldSettlement(changed, before.settlement),
    WorldValidationError,
  );
});

test("unconfigured foundation read remains unconfigured and invalid fences fail before RPC", async () => {
  const input = fixture();
  input.snapshot.world = null;
  const result = await readWorldFoundation(
    async () => ({ data: input.snapshot }),
    id("owner"),
    id("campaign"),
    input.snapshot.timeline,
  );
  assert.equal(result.world, null);
  let calls = 0;
  await assert.rejects(
    readWorldFoundation(
      async () => {
        calls++;
        return { data: input.snapshot };
      },
      id("owner"),
      id("campaign"),
      { timelineId: "bad", epoch: 2 },
    ),
    WorldValidationError,
  );
  assert.equal(calls, 0);
});

test("unknown nested fields, noncanonical UUID aliases and forged warning receipts fail closed", () => {
  for (const mutate of [
    (world) => {
      world.actors[0].id = world.actors[0].id.toUpperCase();
      world.actors[0].entityId = world.actors[0].id;
    },
    (world) => {
      world.threads[0].steps[0].trigger.wallClock = Date.now();
    },
    (world) => {
      world.warnings.push({
        stepId: world.threads[0].steps[0].id,
        eventId: id("invented"),
        atWorldMinutes: 0,
        opportunityUntilWorldMinutes: 1,
        recipientActorIds: [id("player")],
      });
    },
  ]) {
    const world = fixture().snapshot.world;
    mutate(world);
    assert.throws(
      () => parseWorldState(world, id("campaign")),
      WorldValidationError,
    );
  }
});
